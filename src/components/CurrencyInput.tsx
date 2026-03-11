"use client";
import { useState, useCallback } from "react";

interface CurrencyInputProps {
  value: number;
  onChange: (val: number) => void;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  id?: string;
}

export default function CurrencyInput({
  value, onChange, placeholder = "0", prefix = "$", suffix, id,
}: CurrencyInputProps) {
  const [display, setDisplay] = useState(value > 0 ? value.toLocaleString("en-US") : "");

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, "");
    setDisplay(raw);
    const parsed = parseFloat(raw);
    onChange(isNaN(parsed) ? 0 : parsed);
  }, [onChange]);

  const handleBlur = useCallback(() => {
    if (value > 0) {
      setDisplay(value.toLocaleString("en-US"));
    }
  }, [value]);

  const handleFocus = useCallback(() => {
    if (value > 0) {
      setDisplay(value.toString());
    }
  }, [value]);

  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gs-400 pointer-events-none">
          {prefix}
        </span>
      )}
      <input
        id={id}
        type="text"
        inputMode="decimal"
        value={display}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={`w-full py-2.5 border border-gs-200 rounded-lg font-sans text-sm font-bold text-gs-900 bg-gs-50 outline-none transition-colors focus:border-volare-green focus:bg-base-white ${prefix ? "pl-7 pr-3" : "pl-3 pr-3"} ${suffix ? "pr-8" : ""}`}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gs-500 pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  );
}
