"use client";
import { useState, useCallback, useMemo } from "react";
import { calculate, formatCurrency, type CalculatorInputs, type DebtItem } from "@/lib/calculator";
import { generatePDFReport } from "@/lib/generateReport";
import Card from "@/components/Card";
import CurrencyInput from "@/components/CurrencyInput";
import ResultRow from "@/components/ResultRow";
import LeadCaptureModal from "@/components/LeadCaptureModal";

const DEFAULT_INPUTS: CalculatorInputs = {
  income: 0, otherIncome: 0,
  savings: 0, inheritance: 0, otherAssets: 0, personalDebt: 0,
  businessDebts: [{ label: "", amount: 0 }],
  taxRate: 20, feeRate: 12,
  ebitda: 0, multMin: 0, multMax: 0, healthScore: 32,
};

export default function Home() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const [showModal, setShowModal] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  const results = useMemo(() => calculate(inputs), [inputs]);

  const update = useCallback((field: keyof CalculatorInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateDebt = useCallback((index: number, field: keyof DebtItem, value: string | number) => {
    setInputs((prev) => {
      const debts = [...prev.businessDebts];
      debts[index] = { ...debts[index], [field]: value };
      return { ...prev, businessDebts: debts };
    });
  }, []);

  const addDebt = useCallback(() => {
    setInputs((prev) => ({
      ...prev,
      businessDebts: [...prev.businessDebts, { label: "", amount: 0 }],
    }));
  }, []);

  const removeDebt = useCallback((index: number) => {
    setInputs((prev) => {
      if (prev.businessDebts.length <= 1) {
        const debts = [{ label: "", amount: 0 }];
        return { ...prev, businessDebts: debts };
      }
      return { ...prev, businessDebts: prev.businessDebts.filter((_, i) => i !== index) };
    });
  }, []);

  const handleLeadSubmit = async (data: { name: string; email: string; phone?: string }) => {
    setLeadLoading(true);
    try {
      // Send lead data to API
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          results: {
            grossSalePrice: results.hasFullData ? formatCurrency(results.grossSalePriceNeeded) : null,
            currentValuation: results.hasValuationData ? formatCurrency(results.currentValuation) : null,
            gap: results.hasFullData && results.hasValuationData ? formatCurrency(Math.abs(results.gap)) : null,
            isAbove: results.isAboveFreedomPoint,
            healthScore: inputs.healthScore,
            ebitda: results.hasValuationData ? formatCurrency(inputs.ebitda) : null,
          },
        }),
      });

      // Generate and download PDF
      const doc = generatePDFReport(inputs, results, data.name);
      doc.save(`Freedom-Point-Report_${data.name.replace(/\s+/g, "-")}.pdf`);

      setReportGenerated(true);
      setShowModal(false);
    } catch (err) {
      console.error("Lead submission error:", err);
    } finally {
      setLeadLoading(false);
    }
  };

  const sliderBg = `linear-gradient(to right, #00a243 ${inputs.healthScore}%, #E3E8EF ${inputs.healthScore}%)`;

  return (
    <div className="min-h-screen py-8 px-4 md:px-6">
      <div className="max-w-[580px] mx-auto">

        {/* ─── HEADER ─────────────────────── */}
        <div className="bg-gs-900 rounded-2xl p-7 mb-5 relative overflow-hidden">
          <div className="absolute -bottom-15 -right-15 w-[200px] h-[200px] pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(0,162,67,.2) 0%, transparent 70%)" }} />
          <div className="mb-5">
            <svg width="120" height="28" viewBox="0 0 120 28" fill="none">
              <text x="0" y="20" fill="#00a243" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="18" letterSpacing="-0.5">VOLARE</text>
              <text x="85" y="20" fill="#677489" fontFamily="Inter, sans-serif" fontWeight="600" fontSize="12">AI</text>
            </svg>
          </div>
          <div className="text-[11px] font-bold tracking-[.18em] uppercase text-volare-green mb-1.5">
            Advisory Tool
          </div>
          <h1 className="text-[28px] font-extrabold leading-[1.1] text-base-white mb-1.5">
            Freedom Point<br />Calculator
          </h1>
          <p className="text-[13px] text-gs-400 leading-relaxed">
            What does your business need to sell for — so you can walk away on your terms?
          </p>
        </div>

        {/* ─── THREE-NUMBER HERO ──────────── */}
        <div className="grid grid-cols-3 gap-[3px] mb-5 rounded-2xl overflow-hidden">
          <div className="bg-volare-green-deep px-3.5 py-4 md:px-4">
            <div className="text-[9.5px] font-bold tracking-[.14em] uppercase text-volare-green-light leading-tight mb-2">
              Freedom<br />Point
            </div>
            <div className="text-[20px] md:text-[22px] font-black leading-none text-base-white tracking-tight">
              {results.hasFullData && results.grossSalePriceNeeded > 0 ? formatCurrency(results.grossSalePriceNeeded) : "—"}
            </div>
            <div className="text-[10px] text-volare-green-light/70 mt-1 leading-tight">
              Gross sale price needed
            </div>
          </div>
          <div className="bg-gs-800 px-3.5 py-4 md:px-4">
            <div className="text-[9.5px] font-bold tracking-[.14em] uppercase text-gs-400 leading-tight mb-2">
              Current<br />Value
            </div>
            <div className="text-[20px] md:text-[22px] font-black leading-none text-base-white tracking-tight">
              {results.hasValuationData ? formatCurrency(results.currentValuation) : "—"}
            </div>
            <div className="text-[10px] text-gs-500 mt-1 leading-tight">
              At current health
            </div>
          </div>
          <div className="bg-gs-700 px-3.5 py-4 md:px-4">
            <div className="text-[9.5px] font-bold tracking-[.14em] uppercase text-gs-400 leading-tight mb-2">
              {results.isAboveFreedomPoint ? "Above\nTarget" : "Gap to\nClose"}
            </div>
            <div className={`text-[20px] md:text-[22px] font-black leading-none tracking-tight ${
              results.hasFullData && results.hasValuationData
                ? results.isAboveFreedomPoint ? "text-volare-green-mid" : "text-[#ff7b7b]"
                : "text-base-white"
            }`}>
              {results.hasFullData && results.hasValuationData ? formatCurrency(Math.abs(results.gap)) : "—"}
            </div>
            <div className="text-[10px] text-gs-500 mt-1 leading-tight">
              {results.isAboveFreedomPoint ? "Above Freedom Point" : "To close in 5 years"}
            </div>
          </div>
        </div>

        {/* ─── GAP PROGRESS BAR ──────────── */}
        {results.hasFullData && results.hasValuationData && results.grossSalePriceNeeded > 0 && (
          <div className="bg-base-white border border-gs-200 rounded-xl px-4 py-4 mb-5 fade-in">
            <div className="flex justify-between text-[11px] font-semibold text-gs-500 mb-2">
              <span>0%</span>
              <span>{results.progressPercent}% of Freedom Point</span>
            </div>
            <div className="h-2.5 bg-gs-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-volare-green rounded-full transition-all duration-500 ease-out"
                style={{ width: `${results.progressPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-gs-500 mt-2 leading-relaxed">
              {results.isAboveFreedomPoint
                ? "This business already exceeds the Freedom Point. Protect and grow this position."
                : "Both health improvement and revenue growth are required. Neither alone closes this gap."}
            </p>
          </div>
        )}

        {/* ─── SECTION 1: INCOME REPLACEMENT ─── */}
        <Card number={1} title="Income Replacement Need">
          <p className="text-[11px] text-gs-400 mb-3.5 leading-relaxed">
            How much annual income does the business currently replace for you? We use the <strong>33x rule</strong> — you need 33 years of income coverage to be free.
          </p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs font-semibold text-gs-700 mb-0.5 block">Your current annual income</label>
              <div className="text-[11px] text-gs-400 mb-1">Salary, draws, distributions — pre-tax</div>
              <CurrencyInput value={inputs.income} onChange={(v) => update("income", v)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gs-700 mb-0.5 block">Other post-exit income</label>
              <div className="text-[11px] text-gs-400 mb-1">Rental, pension, spouse — ongoing streams</div>
              <CurrencyInput value={inputs.otherIncome} onChange={(v) => update("otherIncome", v)} />
            </div>
          </div>
          {results.hasIncomeData && (
            <div className="fade-in">
              <hr className="border-gs-200 my-3.5" />
              <ResultRow label="Income your business needs to cover" value={formatCurrency(results.incomeToCover)} />
              <ResultRow label="Required nest egg (33x rule)" value={formatCurrency(results.nestEgg)} highlight />
            </div>
          )}
        </Card>

        {/* ─── SECTION 2: PERSONAL ASSETS ──── */}
        <Card number={2} title="Personal Assets & Existing Wealth">
          <p className="text-[11px] text-gs-400 mb-3.5 leading-relaxed">
            What do you already have outside the business? This reduces what the sale needs to generate.
          </p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs font-semibold text-gs-700 mb-0.5 block">Savings & investments</label>
              <CurrencyInput value={inputs.savings} onChange={(v) => update("savings", v)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gs-700 mb-0.5 block">Expected inheritance / windfall</label>
              <CurrencyInput value={inputs.inheritance} onChange={(v) => update("inheritance", v)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gs-700 mb-0.5 block">Other assets</label>
              <CurrencyInput value={inputs.otherAssets} onChange={(v) => update("otherAssets", v)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gs-700 mb-0.5 block">Personal debt</label>
              <CurrencyInput value={inputs.personalDebt} onChange={(v) => update("personalDebt", v)} />
            </div>
          </div>
          {results.hasAssetData && (
            <div className="fade-in">
              <hr className="border-gs-200 my-3.5" />
              <ResultRow label="Net personal assets" value={formatCurrency(results.netPersonalAssets)} highlight />
            </div>
          )}
        </Card>

        {/* ─── SECTION 3: BUSINESS DEBT ────── */}
        <Card number={3} title="Business Debt to Clear at Sale">
          <p className="text-[11px] text-gs-400 mb-3.5 leading-relaxed">
            Debt that a buyer expects to be cleared before or at close.
          </p>
          <div className="space-y-2 mb-3">
            {inputs.businessDebts.map((debt, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={debt.label}
                  onChange={(e) => updateDebt(i, "label", e.target.value)}
                  placeholder="e.g. Credit Cards"
                  className="flex-[1.5] px-3 py-2 border border-gs-200 rounded-lg text-xs font-medium text-gs-800 bg-gs-50 outline-none focus:border-volare-green"
                />
                <div className="flex-1">
                  <CurrencyInput value={debt.amount} onChange={(v) => updateDebt(i, "amount", v)} />
                </div>
                <button
                  onClick={() => removeDebt(i)}
                  className="text-gs-300 hover:text-red-400 transition-colors text-lg px-1 shrink-0"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addDebt}
            className="w-full flex items-center gap-1.5 border border-dashed border-gs-300 rounded-lg py-2 px-3.5 text-xs font-semibold text-gs-400 hover:border-volare-green hover:text-volare-green transition-colors"
          >
            <span className="text-lg leading-none">+</span> Add debt line
          </button>
          {results.hasDebtData && (
            <div className="fade-in">
              <hr className="border-gs-200 my-3.5" />
              <ResultRow label="Total business debt to clear" value={formatCurrency(results.totalBusinessDebt)} valueColor="#c0392b" bgColor="#fff0f0" />
            </div>
          )}
        </Card>

        {/* ─── SECTION 4: TRANSACTION COSTS ── */}
        <Card number={4} title="Transaction Costs at Exit">
          <p className="text-[11px] text-gs-400 mb-3.5 leading-relaxed">
            Taxes and professional fees reduce what you actually pocket. Adjust rates with your advisor. Default: 20% tax, 12% fees.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gs-700 mb-0.5 block">Capital gains / income tax rate</label>
              <CurrencyInput value={inputs.taxRate} onChange={(v) => update("taxRate", v)} prefix="" suffix="%" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gs-700 mb-0.5 block">Broker, legal & advisory fees</label>
              <CurrencyInput value={inputs.feeRate} onChange={(v) => update("feeRate", v)} prefix="" suffix="%" />
            </div>
          </div>
        </Card>

        {/* ─── FREEDOM POINT SUMMARY ─────── */}
        {results.hasFullData && results.nestEgg > 0 && (
          <Card number="&#9733;" title="Freedom Point — Full Breakdown" altStyle>
            <ResultRow label="Nest egg required (33x rule)" value={formatCurrency(results.nestEgg)} />
            <ResultRow
              label="Less: Net personal assets"
              sub="Savings, investments, windfalls — minus personal debt"
              value={`\u2212${formatCurrency(results.netPersonalAssets)}`}
              valueColor="#c0392b"
            />
            {results.hasDebtData && (
              <ResultRow
                label="Plus: Business debt to clear"
                sub="Debt buyer expects to be cleared at sale"
                value={`+${formatCurrency(results.totalBusinessDebt)}`}
                valueColor="#c0392b"
              />
            )}
            <ResultRow
              label="Net Proceeds Required from Sale"
              sub="What you need to actually pocket after everything"
              value={formatCurrency(results.netProceedsRequired)}
              highlight
              heroStyle
              valueColor="#00712f"
            />
            <div className="mt-2">
              <ResultRow
                label={`Plus: Tax on proceeds`}
                sub={`at ${Math.round(inputs.taxRate || 20)}% of gross sale price`}
                value={`+${formatCurrency(results.taxOnProceeds)}`}
                valueColor="#c0392b"
              />
              <ResultRow
                label="Plus: Broker, legal & advisory fees"
                sub={`at ${Math.round(inputs.feeRate || 12)}% of gross sale price`}
                value={`+${formatCurrency(results.fees)}`}
                valueColor="#c0392b"
              />
            </div>
            <div className="mt-2 bg-volare-green-deep rounded-xl px-4 py-3.5 flex justify-between items-center">
              <div>
                <div className="text-[13px] font-bold text-volare-green-soft">Gross Sale Price Needed</div>
                <div className="text-[10.5px] text-volare-green-light/60 mt-0.5">
                  What the business must sell for to hit your Freedom Point
                </div>
              </div>
              <div className="text-[17px] font-black text-white">
                {formatCurrency(results.grossSalePriceNeeded)}
              </div>
            </div>
          </Card>
        )}

        {/* ─── SECTION 5: VALUATION ──────── */}
        <Card number={5} title="Business Valuation — From Your HVA" altStyle>
          <div className="text-xs text-gs-500 bg-volare-green-bg border border-volare-green-light rounded-lg p-3 mb-4 leading-relaxed">
            These three inputs come directly from the <strong>Health & Value Assessment (HVA)</strong> conducted with your Volare advisor. Do not estimate — enter the numbers from your assessment results.
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3.5">
            <div>
              <label className="text-xs font-semibold text-gs-700 mb-0.5 block">Adjusted Annual Profit (EBITDA)</label>
              <div className="text-[11px] text-gs-400 mb-1">From your HVA financial review</div>
              <CurrencyInput value={inputs.ebitda} onChange={(v) => update("ebitda", v)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gs-700 mb-0.5 block">Industry Multiple Range</label>
              <div className="text-[11px] text-gs-400 mb-1">Set by your Volare advisor</div>
              <div className="flex gap-1.5">
                <CurrencyInput value={inputs.multMin} onChange={(v) => update("multMin", v)} prefix="" placeholder="1.15" />
                <CurrencyInput value={inputs.multMax} onChange={(v) => update("multMax", v)} prefix="" placeholder="7.84" />
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label className="text-xs font-semibold text-gs-700 mb-1 block">HVA Health Score</label>
            <div className="text-[11px] text-gs-400 mb-2.5">Your overall score from the Health & Value Assessment</div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={inputs.healthScore}
                onChange={(e) => update("healthScore", parseInt(e.target.value))}
                className="flex-1"
                style={{ background: sliderBg }}
              />
              <div className="min-w-[50px] px-2.5 py-1.5 bg-gs-900 text-volare-green text-[13px] font-extrabold rounded-lg text-center">
                {inputs.healthScore}%
              </div>
            </div>
          </div>

          {/* Valuation rows */}
          {results.hasValuationData && (
            <div className="space-y-1.5 fade-in">
              {[
                { label: `At current health — ${inputs.healthScore}%`, sub: `${results.currentMultiple.toFixed(2)}x multiple`, val: results.currentValuation, active: true },
                { label: "At 60% health — systems in place", sub: `${results.multipleAt60.toFixed(2)}x multiple`, val: results.valuationAt60, active: inputs.healthScore >= 60 },
                { label: "At 80% health — exit-ready", sub: `${results.multipleAt80.toFixed(2)}x multiple`, val: results.valuationAt80, active: inputs.healthScore >= 80 },
                { label: "At 100% health — strategic buyer", sub: `${results.multipleAt100.toFixed(2)}x multiple`, val: results.valuationAt100, active: inputs.healthScore >= 100 },
              ].map((row, i) => (
                <div
                  key={i}
                  className={`flex justify-between items-center px-3.5 py-2.5 rounded-xl border transition-colors ${
                    row.active
                      ? "bg-volare-green-bg border-volare-green-light"
                      : "bg-gs-100 border-transparent"
                  }`}
                >
                  <div>
                    <div className="text-xs font-semibold text-gs-700">{row.label}</div>
                    <div className="text-[10.5px] text-gs-400 mt-0.5">{row.sub}</div>
                  </div>
                  <div className={`text-[17px] font-black ${row.active ? "text-volare-green-dark" : "text-gs-800"}`}>
                    {formatCurrency(row.val)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ─── CTA: GET YOUR REPORT ──────── */}
        <div className="mt-6 mb-4">
          {!reportGenerated ? (
            <button
              onClick={() => setShowModal(true)}
              className="w-full py-4 rounded-2xl bg-volare-green text-white text-base font-bold tracking-wide hover:bg-volare-green-hover transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            >
              Get Your Free Freedom Point Report
            </button>
          ) : (
            <div className="bg-volare-green-bg border border-volare-green-light rounded-2xl p-5 text-center fade-in">
              <div className="text-volare-green text-lg font-bold mb-1">Report Downloaded!</div>
              <p className="text-sm text-gs-600 mb-4">Check your downloads folder for your personalized Freedom Point Report.</p>
              <button
                onClick={() => setShowModal(true)}
                className="text-sm font-semibold text-volare-green hover:underline"
              >
                Download again
              </button>
            </div>
          )}
        </div>

        {/* ─── CALENDLY CTA ──────────────── */}
        {(results.hasFullData || reportGenerated) && (
          <div className="bg-gs-900 rounded-2xl p-6 mb-6 relative overflow-hidden fade-in">
            <div className="absolute -bottom-10 -right-10 w-[160px] h-[160px] pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(0,162,67,.15) 0%, transparent 70%)" }} />
            <div className="text-[10px] font-bold tracking-[.18em] uppercase text-volare-green mb-2">
              Next Step
            </div>
            <h3 className="text-lg font-extrabold text-base-white leading-tight mb-2">
              Ready to close the gap?
            </h3>
            <p className="text-[13px] text-gs-400 leading-relaxed mb-4">
              Book a free 30-minute strategy call with a Volare advisor. We&apos;ll review your numbers and map out a plan to reach your Freedom Point.
            </p>
            <a
              href="https://calendly.com/volare-advisory"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 rounded-xl bg-volare-green text-white text-sm font-bold tracking-wide hover:bg-volare-green-hover transition-all shadow-md"
            >
              Book a Free Strategy Call &rarr;
            </a>
          </div>
        )}

        {/* ─── FOOTER ────────────────────── */}
        <div className="text-center text-[10.5px] text-gs-400 mt-4 mb-8">
          Volare Advisory &middot; Freedom Point Calculator &middot; For advisory use only
        </div>

        {/* ─── LEAD CAPTURE MODAL ────────── */}
        <LeadCaptureModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleLeadSubmit}
          loading={leadLoading}
        />
      </div>
    </div>
  );
}
