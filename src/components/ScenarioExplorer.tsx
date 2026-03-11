"use client";
import { useState, useMemo } from "react";
import { calculate, formatCurrency, type CalculatorInputs, type CalculatorResults } from "@/lib/calculator";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";

interface ScenarioExplorerProps {
  inputs: CalculatorInputs;
  results: CalculatorResults;
}

export default function ScenarioExplorer({ inputs, results }: ScenarioExplorerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [ebitdaGrowth, setEbitdaGrowth] = useState(0);
  const [targetHealth, setTargetHealth] = useState(inputs.healthScore);

  // Recalculate with projected inputs
  const projected = useMemo(() => {
    const projectedInputs: CalculatorInputs = {
      ...inputs,
      ebitda: inputs.ebitda * (1 + ebitdaGrowth / 100),
      healthScore: targetHealth,
    };
    return calculate(projectedInputs);
  }, [inputs, ebitdaGrowth, targetHealth]);

  // Chart data
  const chartData = useMemo(() => {
    const projectedEbitda = inputs.ebitda * (1 + ebitdaGrowth / 100);
    const healthSteps = [
      { health: inputs.healthScore, label: `Current (${inputs.healthScore}%)` },
      { health: 60, label: "60%" },
      { health: 80, label: "80%" },
      { health: 100, label: "100%" },
    ];

    // Deduplicate if current health matches a step
    const seen = new Set<number>();
    return healthSteps
      .filter((s) => {
        if (seen.has(s.health)) return false;
        seen.add(s.health);
        return true;
      })
      .map((s) => {
        const r = calculate({ ...inputs, ebitda: projectedEbitda, healthScore: s.health });
        return {
          name: s.label,
          valuation: Math.round(r.currentValuation),
          isTarget: s.health === targetHealth,
          aboveFreedom: r.currentValuation >= results.grossSalePriceNeeded,
        };
      });
  }, [inputs, ebitdaGrowth, targetHealth, results.grossSalePriceNeeded]);

  const ebitdaSliderBg = `linear-gradient(to right, #00a243 ${(ebitdaGrowth + 20) / 1.2}%, #E3E8EF ${(ebitdaGrowth + 20) / 1.2}%)`;
  const healthSliderBg = `linear-gradient(to right, #00a243 ${targetHealth}%, #E3E8EF ${targetHealth}%)`;

  const projectedGap = results.grossSalePriceNeeded - projected.currentValuation;
  const projectedAbove = projectedGap <= 0;

  if (!isOpen) {
    return (
      <div className="mt-5 mb-4">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full py-4 rounded-2xl bg-gs-900 text-base-white text-[14px] font-bold tracking-wide hover:bg-gs-800 transition-all border border-gs-700 group"
        >
          <span className="text-volare-green mr-2">⚡</span>
          Explore What-If Scenarios
          <span className="text-gs-400 ml-2 text-xs font-normal group-hover:text-gs-300">
            See how growth changes your numbers
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="mt-5 mb-4 bg-gs-900 rounded-2xl overflow-hidden border border-gs-700 fade-in">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold tracking-[.18em] uppercase text-volare-green mb-1">
            Scenario Explorer
          </div>
          <h3 className="text-[16px] font-extrabold text-base-white leading-tight">
            What If You Grew?
          </h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gs-500 hover:text-gs-300 text-xl px-2 transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="px-5 pb-5">
        {/* Sliders */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="text-[11px] font-semibold text-gs-400 mb-1.5 block">
              EBITDA Growth
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="-20"
                max="100"
                step="5"
                value={ebitdaGrowth}
                onChange={(e) => setEbitdaGrowth(parseInt(e.target.value))}
                className="flex-1"
                style={{ background: ebitdaSliderBg }}
              />
              <div className="min-w-[52px] px-2 py-1 bg-gs-800 text-volare-green text-[13px] font-extrabold rounded-lg text-center border border-gs-700">
                {ebitdaGrowth > 0 ? "+" : ""}
                {ebitdaGrowth}%
              </div>
            </div>
            <div className="text-[10px] text-gs-500 mt-1">
              Projected: {formatCurrency(inputs.ebitda * (1 + ebitdaGrowth / 100))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-gs-400 mb-1.5 block">
              Target Health Score
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={targetHealth}
                onChange={(e) => setTargetHealth(parseInt(e.target.value))}
                className="flex-1"
                style={{ background: healthSliderBg }}
              />
              <div className="min-w-[52px] px-2 py-1 bg-gs-800 text-volare-green text-[13px] font-extrabold rounded-lg text-center border border-gs-700">
                {targetHealth}%
              </div>
            </div>
            <div className="text-[10px] text-gs-500 mt-1">
              Current: {inputs.healthScore}% → Target: {targetHealth}%
            </div>
          </div>
        </div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-gs-800 rounded-xl px-4 py-3 border border-gs-700">
            <div className="text-[9px] font-bold tracking-[.12em] uppercase text-gs-500 mb-1">
              CURRENT VALUATION
            </div>
            <div className="text-[18px] font-black text-base-white">
              {formatCurrency(results.currentValuation)}
            </div>
            <div className="text-[10px] text-gs-500 mt-0.5">
              At {inputs.healthScore}% health
            </div>
          </div>
          <div className="bg-volare-green-deep rounded-xl px-4 py-3 border border-volare-green-dark">
            <div className="text-[9px] font-bold tracking-[.12em] uppercase text-volare-green-light mb-1">
              PROJECTED VALUATION
            </div>
            <div className="text-[18px] font-black text-base-white">
              {formatCurrency(projected.currentValuation)}
            </div>
            <div className="text-[10px] text-volare-green-light/70 mt-0.5">
              At {targetHealth}% health
              {ebitdaGrowth !== 0 && `, ${ebitdaGrowth > 0 ? "+" : ""}${ebitdaGrowth}% EBITDA`}
            </div>
          </div>
        </div>

        {/* Gap Change */}
        <div
          className={`rounded-xl px-4 py-3 mb-5 text-center ${
            projectedAbove
              ? "bg-volare-green/10 border border-volare-green/30"
              : "bg-gs-800 border border-gs-700"
          }`}
        >
          {projectedAbove ? (
            <div>
              <div className="text-volare-green text-[13px] font-bold">
                ✓ Above Freedom Point by {formatCurrency(Math.abs(projectedGap))}
              </div>
              <div className="text-[11px] text-volare-green-light/70 mt-0.5">
                At these projected numbers, you could exit on your terms.
              </div>
            </div>
          ) : (
            <div>
              <div className="text-[#ff7b7b] text-[13px] font-bold">
                Remaining Gap: {formatCurrency(Math.abs(projectedGap))}
              </div>
              <div className="text-[11px] text-gs-500 mt-0.5">
                Reduced by{" "}
                {formatCurrency(Math.abs(results.gap) - Math.abs(projectedGap))} from
                current gap of {formatCurrency(Math.abs(results.gap))}
              </div>
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="bg-gs-800 rounded-xl p-4 border border-gs-700">
          <div className="text-[10px] font-bold tracking-[.12em] uppercase text-gs-500 mb-3">
            VALUATION AT EACH HEALTH LEVEL
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#97A3B6", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#677489", fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
                  width={55}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(value as number), "Valuation"]}
                  contentStyle={{
                    background: "#20293A",
                    border: "1px solid #364153",
                    borderRadius: "8px",
                    color: "#F7F7F3",
                    fontSize: "12px",
                  }}
                />
                <ReferenceLine
                  y={results.grossSalePriceNeeded}
                  stroke="#00a243"
                  strokeDasharray="6 3"
                  strokeWidth={1.5}
                  label={{
                    value: `Freedom Point: ${formatCurrency(results.grossSalePriceNeeded)}`,
                    fill: "#00a243",
                    fontSize: 9,
                    position: "insideTopRight",
                  }}
                />
                <Bar dataKey="valuation" radius={[4, 4, 0, 0]} maxBarSize={48}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.aboveFreedom ? "#00a243" : entry.isTarget ? "#4dbe7b" : "#364153"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
