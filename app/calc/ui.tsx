// 계산기 공용 UI 조각 (여러 계산기 페이지가 공유).

export function Card({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <h2 className="font-bold">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{desc}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function NumberInput({
  label,
  value,
  step,
  onChange,
}: {
  label: string;
  value: number;
  step: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <label className="block text-sm text-slate-500">{label}</label>
      <input
        type="number"
        value={value}
        min={0}
        step={step}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
      />
    </div>
  );
}

export function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "gain" | "loss";
}) {
  const color =
    accent === "loss"
      ? "text-rose-500"
      : accent === "gain"
      ? "text-indigo-600"
      : "text-slate-800";
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-center">
      <div className="text-xs text-slate-400">{label}</div>
      <div className={`mt-1 text-sm font-bold tabular-nums ${color}`}>
        {value}
      </div>
    </div>
  );
}
