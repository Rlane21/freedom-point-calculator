"use client";

interface ResultRowProps {
  label: string;
  sub?: string;
  value: string;
  highlight?: boolean;
  heroStyle?: boolean;
  valueColor?: string;
  bgColor?: string;
}

export default function ResultRow({
  label, sub, value, highlight, heroStyle, valueColor, bgColor,
}: ResultRowProps) {
  const base = highlight
    ? "bg-volare-green-bg border border-volare-green-light"
    : bgColor
    ? ""
    : "bg-gs-100";

  return (
    <div
      className={`flex justify-between items-center px-3 py-2.5 rounded-lg mb-1.5 last:mb-0 ${base}`}
      style={bgColor ? { background: bgColor } : undefined}
    >
      <div>
        <div className={`text-xs font-medium text-gs-700 ${heroStyle ? "text-[13px] font-bold" : ""}`}
          style={heroStyle ? { color: valueColor || undefined } : undefined}
        >
          {label}
        </div>
        {sub && <div className="text-[10.5px] text-gs-400 mt-0.5">{sub}</div>}
      </div>
      <div
        className={`text-[15px] font-extrabold ${heroStyle ? "text-[17px] font-black" : ""}`}
        style={{ color: valueColor || undefined }}
      >
        {value}
      </div>
    </div>
  );
}
