"use client";
import { useState } from "react";

interface LeadCaptureModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; email: string; phone?: string }) => Promise<void>;
  loading: boolean;
}

export default function LeadCaptureModal({ open, onClose, onSubmit, loading }: LeadCaptureModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    await onSubmit({ name: name.trim(), email: email.trim(), phone: phone.trim() || undefined });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" style={{ background: "rgba(17,23,41,0.6)" }}>
      <div className="bg-base-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden fade-in">
        {/* Header */}
        <div className="bg-gs-900 px-6 py-5 relative overflow-hidden">
          <div className="absolute -bottom-12 -right-12 w-40 h-40 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, rgba(0,162,67,.4) 0%, transparent 70%)" }} />
          <div className="text-[10px] font-bold tracking-[.18em] uppercase text-volare-green mb-1">
            Your Freedom Point Report
          </div>
          <h2 className="text-xl font-extrabold text-base-white leading-tight">
            Get Your Personalized<br />Advisory Report
          </h2>
          <p className="text-xs text-gs-400 mt-2 leading-relaxed">
            We&apos;ll generate a premium report with your complete Freedom Point analysis, gap breakdown, and next steps.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gs-700 mb-1 block">Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarah Johnson"
              className="w-full px-3 py-2.5 border border-gs-200 rounded-lg text-sm font-medium text-gs-900 bg-gs-50 outline-none focus:border-volare-green focus:bg-base-white transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gs-700 mb-1 block">Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sarah@company.com"
              className="w-full px-3 py-2.5 border border-gs-200 rounded-lg text-sm font-medium text-gs-900 bg-gs-50 outline-none focus:border-volare-green focus:bg-base-white transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gs-700 mb-1 block">Phone <span className="text-gs-400 font-normal">(optional)</span></label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              className="w-full px-3 py-2.5 border border-gs-200 rounded-lg text-sm font-medium text-gs-900 bg-gs-50 outline-none focus:border-volare-green focus:bg-base-white transition-colors"
            />
          </div>

          {error && (
            <div className="text-xs text-red-500 font-medium bg-red-50 px-3 py-2 rounded-lg">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-volare-green text-white text-sm font-bold tracking-wide hover:bg-volare-green-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Generating Report...
              </span>
            ) : "Generate My Free Report"}
          </button>

          <p className="text-[10px] text-gs-400 text-center leading-relaxed">
            Your information is private and will only be used to deliver your report and connect you with a Volare advisor.
          </p>
        </form>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gs-400 hover:text-base-white transition-colors text-lg"
          aria-label="Close"
          style={{ position: "fixed", top: "auto", right: "auto" }}
        >
        </button>
      </div>
    </div>
  );
}
