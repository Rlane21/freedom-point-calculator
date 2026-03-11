"use client";
import jsPDF from "jspdf";
import { CalculatorResults, CalculatorInputs, formatCurrency } from "./calculator";

export function generatePDFReport(
  inputs: CalculatorInputs,
  results: CalculatorResults,
  leadName: string
) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const margin = 20;
  const contentW = W - margin * 2;
  let y = 0;

  // Colors
  const green = [0, 162, 67] as [number, number, number];
  const darkBg = [17, 23, 41] as [number, number, number];
  const white = [247, 247, 243] as [number, number, number];
  const gray500 = [103, 116, 137] as [number, number, number];
  const gray700 = [54, 65, 83] as [number, number, number];
  const gray900 = [17, 23, 41] as [number, number, number];
  const greenBg = [230, 246, 236] as [number, number, number];
  const redText = [192, 57, 43] as [number, number, number];

  // ─── HEADER BAR ───────────────────────────
  doc.setFillColor(...darkBg);
  doc.rect(0, 0, W, 55, "F");

  // Green accent line
  doc.setFillColor(...green);
  doc.rect(0, 55, W, 2, "F");

  // Title text
  doc.setTextColor(...green);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("VOLARE ADVISORY", margin, 18);

  doc.setTextColor(...white);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Freedom Point Report", margin, 30);

  doc.setTextColor(151, 163, 182); // gs-400
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const firstName = leadName.split(" ")[0] || leadName;
  doc.text(`Prepared for ${firstName}  ·  ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`, margin, 40);

  doc.setTextColor(151, 163, 182);
  doc.setFontSize(8);
  doc.text("For advisory use only  ·  Not financial advice", margin, 48);

  y = 70;

  // ─── HERO: THREE NUMBERS ────────────────────
  const boxW = (contentW - 6) / 3;
  const boxH = 32;

  // NEED box
  doc.setFillColor(0, 81, 34); // green-deep
  doc.roundedRect(margin, y, boxW, boxH, 3, 3, "F");
  doc.setTextColor(128, 209, 161); // green-light
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("FREEDOM POINT", margin + 5, y + 9);
  doc.setTextColor(...white);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(results.hasFullData ? formatCurrency(results.grossSalePriceNeeded) : "—", margin + 5, y + 22);

  // WORTH box
  doc.setFillColor(32, 41, 58); // gs-800
  doc.roundedRect(margin + boxW + 3, y, boxW, boxH, 3, 3, "F");
  doc.setTextColor(151, 163, 182);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("CURRENT VALUE", margin + boxW + 8, y + 9);
  doc.setTextColor(...white);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(results.hasValuationData ? formatCurrency(results.currentValuation) : "—", margin + boxW + 8, y + 22);

  // GAP box
  doc.setFillColor(54, 65, 83); // gs-700
  doc.roundedRect(margin + (boxW + 3) * 2, y, boxW, boxH, 3, 3, "F");
  doc.setTextColor(151, 163, 182);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text(results.isAboveFreedomPoint ? "SURPLUS" : "GAP TO CLOSE", margin + (boxW + 3) * 2 + 5, y + 9);
  doc.setTextColor(results.isAboveFreedomPoint ? 77 : 255, results.isAboveFreedomPoint ? 190 : 123, results.isAboveFreedomPoint ? 123 : 123);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  const gapVal = results.hasFullData && results.hasValuationData ? formatCurrency(Math.abs(results.gap)) : "—";
  doc.text(gapVal, margin + (boxW + 3) * 2 + 5, y + 22);

  y += boxH + 12;

  // ─── PROGRESS BAR ──────────────────────────
  if (results.hasFullData && results.hasValuationData && results.grossSalePriceNeeded > 0) {
    doc.setTextColor(...gray500);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`${results.progressPercent}% of Freedom Point reached`, margin, y);
    y += 5;

    // Track
    doc.setFillColor(227, 232, 239); // gs-200
    doc.roundedRect(margin, y, contentW, 4, 2, 2, "F");
    // Fill
    const fillW = Math.max(2, (results.progressPercent / 100) * contentW);
    doc.setFillColor(...green);
    doc.roundedRect(margin, y, fillW, 4, 2, 2, "F");
    y += 14;
  }

  // ─── SECTION HELPER ─────────────────────────
  function sectionHeader(title: string) {
    doc.setFillColor(...green);
    doc.rect(margin, y, 3, 10, "F");
    doc.setTextColor(...gray900);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin + 7, y + 7);
    y += 16;
  }

  function dataRow(label: string, value: string, color?: [number, number, number], bg?: [number, number, number]) {
    if (bg) {
      doc.setFillColor(...bg);
      doc.roundedRect(margin, y - 3, contentW, 10, 2, 2, "F");
    }
    doc.setTextColor(...gray700);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(label, margin + 4, y + 3);
    doc.setTextColor(...(color || gray900));
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(value, margin + contentW - 4, y + 3, { align: "right" });
    y += 12;
  }

  // ─── SECTION 1: INCOME ──────────────────────
  sectionHeader("Income Replacement Need");
  dataRow("Current annual income", formatCurrency(inputs.income));
  dataRow("Other post-exit income", formatCurrency(inputs.otherIncome));
  dataRow("Income to cover from sale", formatCurrency(results.incomeToCover));
  dataRow("Required nest egg (33x rule)", formatCurrency(results.nestEgg), green, greenBg);
  y += 4;

  // ─── SECTION 2: PERSONAL ASSETS ─────────────
  sectionHeader("Personal Net Worth");
  dataRow("Savings & investments", formatCurrency(inputs.savings));
  if (inputs.inheritance > 0) dataRow("Expected inheritance / windfall", formatCurrency(inputs.inheritance));
  if (inputs.otherAssets > 0) dataRow("Other assets", formatCurrency(inputs.otherAssets));
  if (inputs.personalDebt > 0) dataRow("Personal debt", formatCurrency(inputs.personalDebt), redText);
  dataRow("Net personal assets", formatCurrency(results.netPersonalAssets), green, greenBg);
  y += 4;

  // ─── SECTION 3: BUSINESS DEBT ───────────────
  if (results.hasDebtData) {
    sectionHeader("Business Debt to Clear");
    inputs.businessDebts.forEach((d) => {
      if (d.amount > 0) dataRow(d.label || "Business debt", formatCurrency(d.amount), redText);
    });
    dataRow("Total business debt", formatCurrency(results.totalBusinessDebt), redText);
    y += 4;
  }

  // ─── CHECK FOR PAGE BREAK ───────────────────
  if (y > 230) {
    doc.addPage();
    y = 25;
  }

  // ─── FREEDOM POINT BREAKDOWN ────────────────
  sectionHeader("Freedom Point — Full Breakdown");
  dataRow("Nest egg required (33x)", formatCurrency(results.nestEgg));
  dataRow("Less: net personal assets", `−${formatCurrency(results.netPersonalAssets)}`, redText);
  if (results.hasDebtData) {
    dataRow("Plus: business debt to clear", `+${formatCurrency(results.totalBusinessDebt)}`, redText);
  }
  dataRow("Net proceeds required", formatCurrency(results.netProceedsRequired), green, greenBg);
  dataRow(`Plus: tax (${Math.round(inputs.taxRate || 20)}%)`, `+${formatCurrency(results.taxOnProceeds)}`, redText);
  dataRow(`Plus: fees (${Math.round(inputs.feeRate || 12)}%)`, `+${formatCurrency(results.fees)}`, redText);

  // Gross sale price — big highlight
  doc.setFillColor(0, 81, 34);
  doc.roundedRect(margin, y - 3, contentW, 14, 3, 3, "F");
  doc.setTextColor(...white);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Gross Sale Price Needed (Freedom Point)", margin + 5, y + 5);
  doc.setFontSize(12);
  doc.text(formatCurrency(results.grossSalePriceNeeded), margin + contentW - 5, y + 5, { align: "right" });
  y += 22;

  // ─── CHECK FOR PAGE BREAK ───────────────────
  if (y > 220) {
    doc.addPage();
    y = 25;
  }

  // ─── SECTION 5: VALUATION ───────────────────
  if (results.hasValuationData) {
    sectionHeader("Business Valuation Scenarios");
    doc.setTextColor(...gray500);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Based on EBITDA of ${formatCurrency(inputs.ebitda)} with industry multiple range ${(inputs.multMin || 1.15).toFixed(2)}x – ${(inputs.multMax || 7.84).toFixed(2)}x`, margin, y);
    y += 10;

    const scenarios = [
      { label: `At current health (${inputs.healthScore}%)`, mult: results.currentMultiple, val: results.currentValuation, active: true },
      { label: "At 60% — systems in place", mult: results.multipleAt60, val: results.valuationAt60, active: inputs.healthScore >= 60 },
      { label: "At 80% — exit-ready", mult: results.multipleAt80, val: results.valuationAt80, active: inputs.healthScore >= 80 },
      { label: "At 100% — strategic buyer", mult: results.multipleAt100, val: results.valuationAt100, active: inputs.healthScore >= 100 },
    ];

    scenarios.forEach((s) => {
      const bg = s.active ? greenBg : [242, 245, 249] as [number, number, number];
      doc.setFillColor(...bg);
      doc.roundedRect(margin, y - 3, contentW, 10, 2, 2, "F");
      doc.setTextColor(...gray700);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`${s.label}  (${s.mult.toFixed(2)}x)`, margin + 4, y + 3);
      doc.setTextColor(s.active ? green[0] : gray900[0], s.active ? green[1] : gray900[1], s.active ? green[2] : gray900[2]);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(formatCurrency(s.val), margin + contentW - 4, y + 3, { align: "right" });
      y += 12;
    });
    y += 4;
  }

  // ─── WHAT THIS MEANS ───────────────────────
  if (y > 230) { doc.addPage(); y = 25; }
  sectionHeader("What This Means for You");
  doc.setTextColor(...gray700);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const lineH = 5;

  if (results.isAboveFreedomPoint) {
    const lines = doc.splitTextToSize(
      `Great news, ${firstName}. Your business is currently valued above your Freedom Point. This means if you were to sell today at current market conditions, you would generate enough proceeds to fully fund your post-exit lifestyle — and then some. The focus now shifts to protecting this position and potentially growing the surplus to create more optionality.`,
      contentW
    );
    doc.text(lines, margin, y);
    y += lines.length * lineH + 6;
  } else if (results.hasFullData && results.hasValuationData) {
    const lines = doc.splitTextToSize(
      `${firstName}, the gap between your current business value and your Freedom Point is ${formatCurrency(Math.abs(results.gap))}. This is the distance between where you are now and being able to walk away on your terms. Closing this gap requires a dual strategy: improving your HVA Health Score (which directly increases your valuation multiple) AND growing your adjusted profit (EBITDA). Neither alone is typically sufficient. A Volare advisor can help you build a 5-year roadmap to close this gap systematically.`,
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
  if (y > 240) { doc.addPage(); y = 25; }
  doc.setFillColor(...greenBg);
  doc.roundedRect(margin, y, contentW, 28, 4, 4, "F");
  doc.setFillColor(...green);
  doc.rect(margin, y, 3, 28, "F");

  doc.setTextColor(...green);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Ready to close the gap?", margin + 8, y + 9);
  doc.setTextColor(...gray700);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Book a free 30-minute strategy call with a Volare advisor.", margin + 8, y + 17);
  doc.setTextColor(...green);
  doc.setFont("helvetica", "bold");
  doc.text("volare.ai/book", margin + 8, y + 24);

  y += 36;

  // ─── FOOTER ─────────────────────────────────
  doc.setDrawColor(227, 232, 239);
  doc.line(margin, y, W - margin, y);
  y += 6;
  doc.setTextColor(...gray500);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("Volare Advisory  ·  Freedom Point Calculator  ·  For advisory use only  ·  Not financial advice", W / 2, y, { align: "center" });
  doc.text("This report was generated as a planning tool and does not constitute professional financial, tax, or legal advice.", W / 2, y + 4, { align: "center" });

  return doc;
}
