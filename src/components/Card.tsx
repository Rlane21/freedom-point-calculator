"use client";

interface CardProps {
  number: number | string;
  title: string;
  altStyle?: boolean;
  children: React.ReactNode;
}

export default function Card({ number, title, altStyle, children }: CardProps) {
  return (
    <div className="bg-base-white border border-gs-200 rounded-2xl overflow-hidden mb-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center gap-2.5 px-5 py-3.5 bg-gs-900">
        <div
          className={`w-6 h-6 rounded-full text-[11px] font-extrabold flex items-center justify-center shrink-0 ${
            altStyle ? "bg-gs-700 text-base-white" : "bg-volare-green text-white"
          }`}
        >
          {number}
        </div>
        <div className="text-[11px] font-bold tracking-[.07em] uppercase text-base-white/80">
          {title}
        </div>
      </div>
      <div className={`p-6 ${altStyle ? "border-l-[3px] border-l-volare-green" : ""}`}>
        {children}
      </div>
    </div>
  );
}
