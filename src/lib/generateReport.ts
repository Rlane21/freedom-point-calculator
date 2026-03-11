"use client";
import jsPDF from "jspdf";
import { CalculatorResults, CalculatorInputs, formatCurrency } from "./calculator";
import { VOLARE_LOGO_WHITE_BASE64 } from "./logoBase64";

// ─── DONUT CHART HELPER ─────────────────────────
function drawDonut(
  doc: jsPDF,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  segments: { value: number; color: [number, number, number]; label: string }[]
) {
  const total = segments.reduce((s, seg) => s + Math.max(0, seg.value), 0);
  if (total <= 0) return;

  let startAngle = -Math.PI / 2; // start at top

  segments.forEach((seg) => {
    if (seg.value <= 0) return;
    const sweepAngle = (seg.value / total) * Math.PI * 2;
    const endAngle = startAngle + sweepAngle;

    // Draw filled arc using small line segments
    doc.setFillColor(...seg.color);
    const steps = Math.max(20, Math.ceil(sweepAngle * 30));
    const points: [number, number][] = [];

    // Outer arc
    for (let i = 0; i <= steps; i++) {
      const a = startAngle + (i / steps) * sweepAngle;
      points.push([cx + Math.cos(a) * outerR, cy + Math.sin(a) * outerR]);
    }
    // Inner arc (reverse)
    for (let i = steps; i >= 0; i--) {
      const a = startAngle + (i / steps) * sweepAngle;
      points.push([cx + Math.cos(a) * innerR, cy + Math.sin(a) * innerR]);
    }

    // Draw as filled polygon using triangle fan
    if (points.length > 2) {
      // Use lines to draw the path
      const [firstX, firstY] = points[0];
      let pathStr = `${firstX} ${firstY} m `;
      for (let i = 1; i < points.length; i++) {
        pathStr += `${points[i][0]} ${points[i][1]} l `;
      }
      pathStr += "h f";

      // Fallback: draw with small triangles
      for (let i = 1; i < points.length - 1; i++) {
        doc.triangle(
          points[0][0], points[0][1],
          points[i][0], points[i][1],
          points[i + 1][0], points[i + 1][1],
          "F"
        );
      }
    }

    startAngle = endAngle;
  });

  // Inner circle (donut hole) — white
  doc.setFillColor(255, 255, 255);
  doc.circle(cx, cy, innerR, "F");
}

// ─── BAR CHART HELPER ───────────────────────────
function drawBarChart(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  bars: { label: string; value: number; active: boolean }[],
  freedomPoint: number,
  colors: { active: [number, number, number]; inactive: [number, number, number]; line: [number, number, number] }
) {
  const maxVal = Math.max(freedomPoint, ...bars.map((b) => b.value)) * 1.15;
  if (maxVal <= 0) return;

  const barCount = bars.length;
  const barGap = 4;
  const barW = (w - barGap * (barCount - 1)) / barCount;

  // Draw bars
  bars.forEach((bar, i) => {
    const barH = (bar.value / maxVal) * h;
    const bx = x + i * (barW + barGap);
    const by = y + h - barH;

    doc.setFillColor(...(bar.active ? colors.active : colors.inactive));
    doc.roundedRect(bx, by, barW, barH, 1.5, 1.5, "F");

    // Value on top of bar
    doc.setTextColor(54, 65, 83);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    const valText = formatCurrency(bar.value);
    doc.text(valText, bx + barW / 2, by - 2, { align: "center" });

    // Label below
    doc.setTextColor(103, 116, 137);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.text(bar.label, bx + barW / 2, y + h + 5, { align: "center" });
  });

  // Freedom Point reference line
  if (freedomPoint > 0) {
    const lineY = y + h - (freedomPoint / maxVal) * h;
    doc.setDrawColor(...colors.line);
    doc.setLineWidth(0.4);
    doc.setLineDashPattern([2, 2], 0);
    doc.line(x - 3, lineY, x + w + 3, lineY);
    doc.setLineDashPattern([], 0);

    // Label
    doc.setTextColor(...colors.line);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.text(`Freedom Point: ${formatCurrency(freedomPoint)}`, x + w + 5, lineY + 1.5);
  }
}

// ─── MAIN REPORT FUNCTION ───────────────────────
export function generatePDFReport(
  inputs: CalculatorInputs,
  results: CalculatorResults,
  leadName: string
): Uint8Array {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const margin = 18;
  const contentW = W - margin * 2;
  let y = 0;

  // Colors
  const green: [number, number, number] = [0, 162, 67];
  const greenDeep: [number, number, number] = [0, 81, 34];
  const greenLight: [number, number, number] = [128, 209, 161];
  const darkBg: [number, number, number] = [17, 23, 41];
  const white: [number, number, number] = [247, 247, 243];
  const gray400: [number, number, number] = [151, 163, 182];
  const gray500: [number, number, number] = [103, 116, 137];
  const gray700: [number, number, number] = [54, 65, 83];
  const gray900: [number, number, number] = [17, 23, 41];
  const greenBg: [number, number, number] = [230, 246, 236];
  const redText: [number, number, number] = [192, 57, 43];
  const greenMid: [number, number, number] = [77, 190, 123];
  const grayInactive: [number, number, number] = [205, 213, 224];

  const firstName = leadName.split(" ")[0] || leadName;

  // ═══════════════════════════════════════════════
  // PAGE 1
  // ═══════════════════════════════════════════════

  // ─── HEADER BAR ───────────────────────────
  doc.setFillColor(...darkBg);
  doc.rect(0, 0, W, 52, "F");

  // Green accent line
  doc.setFillColor(...green);
  doc.rect(0, 52, W, 1.5, "F");

  // Logo (white version on dark background)
  try {
    doc.addImage(VOLARE_LOGO_WHITE_BASE64, "PNG", margin, 12, 42, 8);
  } catch {
    // Fallback text if image fails
    doc.setTextColor(...green);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("VOLARE AI", margin, 18);
  }

  // Title
  doc.setTextColor(...white);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Freedom Point Report", margin, 32);

  // Subtitle
  doc.setTextColor(...gray400);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Prepared for ${firstName}  ·  ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
    margin,
    40
  );
  doc.setFontSize(7.5);
  doc.text("For advisory use only  ·  Not financial advice", margin, 46);

  y = 62;

  // ─── HERO: THREE NUMBERS ────────────────────
  const boxW = (contentW - 5) / 3;
  const boxH = 30;

  // Freedom Point box
  doc.setFillColor(...greenDeep);
  doc.roundedRect(margin, y, boxW, boxH, 3, 3, "F");
  doc.setTextColor(...greenLight);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.text("FREEDOM POINT", margin + 4, y + 8);
  doc.setTextColor(...white);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text(results.hasFullData ? formatCurrency(results.grossSalePriceNeeded) : "—", margin + 4, y + 20);

  // Current Value box
  const box2x = margin + boxW + 2.5;
  doc.setFillColor(32, 41, 58);
  doc.roundedRect(box2x, y, boxW, boxH, 3, 3, "F");
  doc.setTextColor(...gray400);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.text("CURRENT VALUE", box2x + 4, y + 8);
  doc.setTextColor(...white);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text(results.hasValuationData ? formatCurrency(results.currentValuation) : "—", box2x + 4, y + 20);

  // Gap box
  const box3x = margin + (boxW + 2.5) * 2;
  doc.setFillColor(...gray700);
  doc.roundedRect(box3x, y, boxW, boxH, 3, 3, "F");
  doc.setTextColor(...gray400);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.text(results.isAboveFreedomPoint ? "SURPLUS" : "GAP TO CLOSE", box3x + 4, y + 8);
  const gapColor = results.isAboveFreedomPoint ? greenMid : ([255, 123, 123] as [number, number, number]);
  doc.setTextColor(...gapColor);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text(
    results.hasFullData && results.hasValuationData ? formatCurrency(Math.abs(results.gap)) : "—",
    box3x + 4,
    y + 20
  );

  y += boxH + 8;

  // ─── PROGRESS BAR ──────────────────────────
  if (results.hasFullData && results.hasValuationData && results.grossSalePriceNeeded > 0) {
    doc.setTextColor(...gray500);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.text(`${results.progressPercent}% of Freedom Point reached`, margin, y);
    y += 4;

    // Track
    doc.setFillColor(227, 232, 239);
    doc.roundedRect(margin, y, contentW, 3.5, 1.5, 1.5, "F");
    // Fill
    const fillW = Math.max(2, (results.progressPercent / 100) * contentW);
    doc.setFillColor(...green);
    doc.roundedRect(margin, y, fillW, 3.5, 1.5, 1.5, "F");

    // Milestone markers
    [25, 50, 75, 100].forEach((pct) => {
      const mx = margin + (pct / 100) * contentW;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.line(mx, y - 0.5, mx, y + 4);
    });

    y += 12;
  }

  // ─── SECTION HELPERS ─────────────────────────
  function sectionHeader(title: string) {
    if (y > 248) { doc.addPage(); y = 20; }
    doc.setFillColor(...green);
    doc.rect(margin, y, 3, 8, "F");
    doc.setTextColor(...gray900);
    doc.setFontSize(10.5);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin + 7, y + 6);
    y += 14;
  }

  function dataRow(
    label: string,
    value: string,
    opts?: { color?: [number, number, number]; bg?: [number, number, number]; bold?: boolean }
  ) {
    if (y > 270) { doc.addPage(); y = 20; }
    if (opts?.bg) {
      doc.setFillColor(...opts.bg);
      doc.roundedRect(margin, y - 2.5, contentW, 9, 1.5, 1.5, "F");
    }
    doc.setTextColor(...gray700);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.text(label, margin + 3, y + 3);
    doc.setTextColor(...(opts?.color || gray900));
    doc.setFontSize(9);
    doc.setFont("helvetica", opts?.bold ? "bold" : "bold");
    doc.text(value, margin + contentW - 3, y + 3, { align: "right" });
    y += 10;
  }

  // ─── SECTION 1: INCOME ──────────────────────
  sectionHeader("Income Replacement Need");
  dataRow("Current annual income", formatCurrency(inputs.income));
  dataRow("Other post-exit income", formatCurrency(inputs.otherIncome));
  dataRow("Income to cover from sale", formatCurrency(results.incomeToCover));
  dataRow("Required nest egg (33× rule)", formatCurrency(results.nestEgg), { color: green, bg: greenBg, bold: true });
  y += 3;

  // ─── SECTION 2: PERSONAL ASSETS ─────────────
  sectionHeader("Personal Net Worth");
  dataRow("Savings & investments", formatCurrency(inputs.savings));
  if (inputs.inheritance > 0) dataRow("Expected inheritance / windfall", formatCurrency(inputs.inheritance));
  if (inputs.otherAssets > 0) dataRow("Other assets", formatCurrency(inputs.otherAssets));
  if (inputs.personalDebt > 0) dataRow("Personal debt", formatCurrency(inputs.personalDebt), { color: redText });
  dataRow("Net personal assets", formatCurrency(results.netPersonalAssets), { color: green, bg: greenBg, bold: true });
  y += 3;

  // ─── SECTION 3: BUSINESS DEBT ───────────────
  if (results.hasDebtData) {
    sectionHeader("Business Debt to Clear");
    inputs.businessDebts.forEach((d) => {
      if (d.amount > 0) dataRow(d.label || "Business debt", formatCurrency(d.amount), { color: redText });
    });
    dataRow("Total business debt", formatCurrency(results.totalBusinessDebt), { color: redText, bold: true });
    y += 3;
  }

  // ─── FREEDOM POINT BREAKDOWN ────────────────
  if (y > 180) { doc.addPage(); y = 20; }
  sectionHeader("Freedom Point — Full Breakdown");
  dataRow("Nest egg required (33×)", formatCurrency(results.nestEgg));
  dataRow("Less: net personal assets", `−${formatCurrency(results.netPersonalAssets)}`, { color: redText });
  if (results.hasDebtData) {
    dataRow("Plus: business debt to clear", `+${formatCurrency(results.totalBusinessDebt)}`, { color: redText });
  }
  dataRow("Net proceeds required", formatCurrency(results.netProceedsRequired), { color: green, bg: greenBg, bold: true });
  dataRow(`Plus: tax (${Math.round(inputs.taxRate || 20)}%)`, `+${formatCurrency(results.taxOnProceeds)}`, { color: redText });
  dataRow(`Plus: fees (${Math.round(inputs.feeRate || 12)}%)`, `+${formatCurrency(results.fees)}`, { color: redText });

  // Big highlight box
  doc.setFillColor(...greenDeep);
  doc.roundedRect(margin, y - 2, contentW, 13, 3, 3, "F");
  doc.setTextColor(...white);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Gross Sale Price Needed (Freedom Point)", margin + 4, y + 5);
  doc.setFontSize(12);
  doc.text(formatCurrency(results.grossSalePriceNeeded), margin + contentW - 4, y + 5, { align: "right" });
  y += 18;

  // ─── DONUT CHART: BREAKDOWN VISUAL ──────────
  if (results.grossSalePriceNeeded > 0 && y < 200) {
    y += 4;
    doc.setTextColor(...gray900);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("Freedom Point Composition", margin, y);
    y += 8;

    const donutCx = margin + 28;
    const donutCy = y + 22;
    const donutSegments = [
      { value: results.netProceedsRequired, color: greenDeep, label: "Net Proceeds" },
      { value: results.taxOnProceeds, color: [220, 80, 60] as [number, number, number], label: "Taxes" },
      { value: results.fees, color: [255, 160, 80] as [number, number, number], label: "Fees" },
    ];
    if (results.hasDebtData) {
      donutSegments.splice(1, 0, {
        value: results.totalBusinessDebt,
        color: [180, 100, 80] as [number, number, number],
        label: "Biz Debt",
      });
    }

    drawDonut(doc, donutCx, donutCy, 20, 11, donutSegments);

    // Center text in donut
    doc.setTextColor(...gray900);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrency(results.grossSalePriceNeeded), donutCx, donutCy + 1, { align: "center" });
    doc.setFontSize(5);
    doc.setTextColor(...gray500);
    doc.text("TOTAL", donutCx, donutCy + 5, { align: "center" });

    // Legend
    let legendY = donutCy - 16;
    const legendX = margin + 60;
    donutSegments.forEach((seg) => {
      if (seg.value <= 0) return;
      doc.setFillColor(...seg.color);
      doc.circle(legendX, legendY + 1, 1.5, "F");
      doc.setTextColor(...gray700);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text(`${seg.label}: ${formatCurrency(seg.value)}`, legendX + 4, legendY + 2);
      legendY += 7;
    });

    y = donutCy + 28;
  }

  // ═══════════════════════════════════════════════
  // PAGE 2
  // ═══════════════════════════════════════════════
  doc.addPage();
  y = 20;

  // Mini header on page 2
  doc.setFillColor(...darkBg);
  doc.rect(0, 0, W, 14, "F");
  doc.setFillColor(...green);
  doc.rect(0, 14, W, 0.8, "F");
  try {
    doc.addImage(VOLARE_LOGO_WHITE_BASE64, "PNG", margin, 3, 32, 6);
  } catch {
    doc.setTextColor(...green);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("VOLARE AI", margin, 9);
  }
  doc.setTextColor(...gray400);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(`Freedom Point Report  ·  ${firstName}`, W - margin, 9, { align: "right" });

  y = 24;

  // ─── VALUATION SCENARIOS ────────────────────
  if (results.hasValuationData) {
    sectionHeader("Business Valuation Scenarios");
    doc.setTextColor(...gray500);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Based on EBITDA of ${formatCurrency(inputs.ebitda)} with industry multiple range ${(inputs.multMin || 1.15).toFixed(2)}× – ${(inputs.multMax || 7.84).toFixed(2)}×`,
      margin,
      y
    );
    y += 8;

    // Data rows
    const scenarios = [
      { label: `At current health (${inputs.healthScore}%)`, mult: results.currentMultiple, val: results.currentValuation, active: true },
      { label: "At 60% — systems in place", mult: results.multipleAt60, val: results.valuationAt60, active: inputs.healthScore >= 60 },
      { label: "At 80% — exit-ready", mult: results.multipleAt80, val: results.valuationAt80, active: inputs.healthScore >= 80 },
      { label: "At 100% — strategic buyer", mult: results.multipleAt100, val: results.valuationAt100, active: inputs.healthScore >= 100 },
    ];

    scenarios.forEach((s) => {
      const bg = s.active ? greenBg : ([242, 245, 249] as [number, number, number]);
      dataRow(`${s.label}  (${s.mult.toFixed(2)}×)`, formatCurrency(s.val), {
        color: s.active ? green : gray500,
        bg,
        bold: s.active,
      });
    });

    y += 6;

    // ─── BAR CHART: VALUATION VS FREEDOM POINT ──
    const chartX = margin + 5;
    const chartW = contentW - 50;
    const chartH = 45;

    doc.setTextColor(...gray900);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("Valuation Scenarios vs. Freedom Point", margin, y);
    y += 6;

    const barData = [
      { label: `Current\n(${inputs.healthScore}%)`, value: results.currentValuation, active: true },
      { label: "60%", value: results.valuationAt60, active: inputs.healthScore >= 60 },
      { label: "80%", value: results.valuationAt80, active: inputs.healthScore >= 80 },
      { label: "100%", value: results.valuationAt100, active: inputs.healthScore >= 100 },
    ];

    drawBarChart(doc, chartX, y, chartW, chartH, barData, results.grossSalePriceNeeded, {
      active: green,
      inactive: grayInactive,
      line: greenDeep,
    });

    y += chartH + 16;
  }

  // ─── WHAT THIS MEANS ──────────────────────
  if (y > 220) { doc.addPage(); y = 20; }
  sectionHeader("What This Means for You");

  doc.setTextColor(...gray700);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  const lineH = 4.5;

  if (results.isAboveFreedomPoint) {
    const lines = doc.splitTextToSize(
      `Great news, ${firstName}. Your business is currently valued above your Freedom Point. This means if you were to sell today at current market conditions, you would generate enough proceeds to fully fund your post-exit lifestyle — and then some. The focus now shifts to protecting this position and potentially growing the surplus to create more optionality.`,
      contentW
    );
    doc.text(lines, margin, y);
    y += lines.length * lineH + 6;
  } else if (results.hasFullData && results.hasValuationData) {
    const lines = doc.splitTextToSize(
      `${firstName}, the gap between your current business value and your Freedom Point is ${formatCurrency(Math.abs(results.gap))}. This is the distance between where you are now and being able to walk away on your terms. Closing this gap requires a dual strategy: improving your HVA Health Score (which directly increases your valuation multiple) AND growing your adjusted profit (EBITDA). Neither alone is typically sufficient. A Volare advisor can help you build a roadmap to close this gap systematically.`,
      contentW
    );
    doc.text(lines, margin, y);
    y += lines.length * lineH + 6;
  } else {
    const lines = doc.splitTextToSize(
      `${firstName}, complete all sections of the calculator to see your full Freedom Point analysis. The more accurate your inputs, the more actionable this report becomes. A Volare advisor can help you identify the right numbers for your situation.`,
      contentW
    );
    doc.text(lines, margin, y);
    y += lines.length * lineH + 6;
  }

  // ─── CTA BOX ────────────────────────────────
  if (y > 245) { doc.addPage(); y = 20; }
  doc.setFillColor(...greenBg);
  doc.roundedRect(margin, y, contentW, 30, 4, 4, "F");
  doc.setFillColor(...green);
  doc.rect(margin, y, 3, 30, "F");

  doc.setTextColor(...greenDeep);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Ready to close the gap?", margin + 8, y + 10);
  doc.setTextColor(...gray700);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Book a free 30-minute strategy call with a Volare advisor.", margin + 8, y + 18);
  doc.setTextColor(...green);
  doc.setFont("helvetica", "bold");
  doc.text("volare.ai/book", margin + 8, y + 25);

  y += 38;

  // ─── FOOTER ─────────────────────────────────
  doc.setDrawColor(227, 232, 239);
  doc.line(margin, y, W - margin, y);
  y += 5;
  doc.setTextColor(...gray500);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.text("Volare Advisory  ·  Freedom Point Calculator  ·  For advisory use only  ·  Not financial advice", W / 2, y, { align: "center" });
  doc.text("This report was generated as a planning tool and does not constitute professional financial, tax, or legal advice.", W / 2, y + 3.5, { align: "center" });

  // Return as Uint8Array (for email attachment and download)
  return doc.output("arraybuffer") as unknown as Uint8Array;
}
