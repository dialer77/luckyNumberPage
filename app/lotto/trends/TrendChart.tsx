"use client";

// 회차별 추이 라인차트 — 의존성 없이 인라인 SVG로 그림.
// 서버 컴포넌트에서 함수 prop을 넘길 수 없으므로 포맷은 문자열 모드로 받는다.
// 마크 규칙(dataviz): 2px 라인 · 얇은 마크 · 낮은 대비 그리드 · 단일 시리즈 →
// 범례 없이 제목이 시리즈를 지칭 · 호버 크로스헤어+툴팁 기본 제공.

import { useRef, useState } from "react";

export type TrendPoint = { drwNo: number; date: string; value: number };
type Fmt = "krw" | "count" | "sum";

// 값 포맷 (억/만 단위 등) — 클라이언트에서 직접 처리
function fmt(v: number, mode: Fmt): string {
  if (mode === "krw") {
    const eok = Math.floor(v / 100_000_000);
    const man = Math.floor((v % 100_000_000) / 10_000);
    const parts: string[] = [];
    if (eok > 0) parts.push(`${eok.toLocaleString()}억`);
    if (man > 0) parts.push(`${man.toLocaleString()}만`);
    return (parts.join(" ") || "0") + "원";
  }
  if (mode === "count") return `${v.toLocaleString()}명`;
  return v.toLocaleString();
}

// 짧은 축 라벨 (억/만 축약)
function axisLabel(v: number, mode: Fmt): string {
  if (mode === "krw") {
    if (v >= 100_000_000) return `${(v / 100_000_000).toFixed(1)}억`;
    if (v >= 10_000) return `${Math.round(v / 10_000)}만`;
    return `${v}`;
  }
  return v.toLocaleString();
}

const W = 800;
const H = 260;
const PAD = { l: 52, r: 16, t: 14, b: 26 };
const PLOT_W = W - PAD.l - PAD.r;
const PLOT_H = H - PAD.t - PAD.b;

export default function TrendChart({
  data,
  format = "sum",
  context,
  baseline,
  accent = "#6366f1", // 브랜드 인디고
}: {
  data: TrendPoint[];
  format?: Fmt;
  context?: number[]; // 뒤에 옅게 깔 원자료(예: 이동평균 대비 실제값)
  baseline?: { value: number; label: string };
  accent?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hi, setHi] = useState<number | null>(null);

  const n = data.length;
  const vals = data.map((d) => d.value);
  const ctxVals = context ?? [];
  const allVals = [...vals, ...ctxVals, ...(baseline ? [baseline.value] : [])];
  const rawMin = Math.min(...allVals);
  const rawMax = Math.max(...allVals);
  // y축에 약간의 여백
  const span = rawMax - rawMin || 1;
  const yMin = Math.max(0, rawMin - span * 0.08);
  const yMax = rawMax + span * 0.08;

  const x = (i: number) => PAD.l + (n <= 1 ? 0 : (i / (n - 1)) * PLOT_W);
  const y = (v: number) => PAD.t + (1 - (v - yMin) / (yMax - yMin)) * PLOT_H;

  const linePath = (arr: number[]) =>
    arr.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const areaPath =
    `M${x(0).toFixed(1)} ${y(vals[0]).toFixed(1)} ` +
    vals.map((v, i) => `L${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ") +
    ` L${x(n - 1).toFixed(1)} ${(PAD.t + PLOT_H).toFixed(1)} L${x(0).toFixed(1)} ${(PAD.t + PLOT_H).toFixed(1)} Z`;

  // y 그리드 4칸
  const ticks = 4;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => yMin + ((yMax - yMin) * i) / ticks);
  // x 라벨: 시작/중간들/끝 (최대 6개)
  const xTickIdx = Array.from({ length: 6 }, (_, i) => Math.round((i / 5) * (n - 1)));

  const gid = `area-${format}`;

  function onMove(e: React.PointerEvent) {
    const el = wrapRef.current;
    if (!el || n === 0) return;
    const rect = el.getBoundingClientRect();
    const plotLeftPx = (PAD.l / W) * rect.width;
    const plotWpx = (PLOT_W / W) * rect.width;
    const frac = (e.clientX - rect.left - plotLeftPx) / plotWpx;
    const idx = Math.max(0, Math.min(n - 1, Math.round(frac * (n - 1))));
    setHi(idx);
  }

  const hovered = hi != null ? data[hi] : null;

  return (
    <div className="relative" ref={wrapRef}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-none"
        role="img"
        onPointerMove={onMove}
        onPointerLeave={() => setHi(null)}
      >
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.18" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 낮은 대비 y 그리드 + 라벨 */}
        {yTicks.map((t, i) => (
          <g key={i}>
            <line
              x1={PAD.l}
              x2={W - PAD.r}
              y1={y(t)}
              y2={y(t)}
              stroke="#e2e8f0"
              strokeWidth={1}
            />
            <text x={PAD.l - 8} y={y(t) + 3} textAnchor="end" fontSize="11" fill="#94a3b8">
              {axisLabel(t, format)}
            </text>
          </g>
        ))}

        {/* x 라벨 (회차) */}
        {xTickIdx.map((idx, i) => (
          <text
            key={i}
            x={x(idx)}
            y={H - 8}
            textAnchor={i === 0 ? "start" : i === xTickIdx.length - 1 ? "end" : "middle"}
            fontSize="11"
            fill="#94a3b8"
          >
            {data[idx]?.drwNo}회
          </text>
        ))}

        {/* 기준선(평균 등) */}
        {baseline && (
          <g>
            <line
              x1={PAD.l}
              x2={W - PAD.r}
              y1={y(baseline.value)}
              y2={y(baseline.value)}
              stroke="#f59e0b"
              strokeWidth={1.5}
              strokeDasharray="5 4"
            />
            <text x={W - PAD.r} y={y(baseline.value) - 5} textAnchor="end" fontSize="11" fill="#d97706">
              {baseline.label}
            </text>
          </g>
        )}

        {/* 뒤에 옅게 까는 원자료(context) */}
        {context && (
          <path d={linePath(ctxVals)} fill="none" stroke="#cbd5e1" strokeWidth={1.2} />
        )}

        {/* 메인 시리즈: 영역 + 라인 */}
        <path d={areaPath} fill={`url(#${gid})`} />
        <path
          d={linePath(vals)}
          fill="none"
          stroke={accent}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* 호버 크로스헤어 + 마커 */}
        {hovered && (
          <g>
            <line
              x1={x(hi!)}
              x2={x(hi!)}
              y1={PAD.t}
              y2={PAD.t + PLOT_H}
              stroke={accent}
              strokeWidth={1}
              strokeDasharray="3 3"
              opacity={0.6}
            />
            <circle cx={x(hi!)} cy={y(hovered.value)} r={4.5} fill={accent} stroke="#fff" strokeWidth={2} />
          </g>
        )}
      </svg>

      {/* 툴팁 (HTML) */}
      {hovered && (
        <div
          className="pointer-events-none absolute top-1 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900/90 px-2.5 py-1.5 text-xs text-white shadow-lg"
          style={{ left: `${(x(hi!) / W) * 100}%` }}
        >
          <div className="font-semibold">
            {hovered.drwNo}회 <span className="font-normal text-slate-300">{hovered.date}</span>
          </div>
          <div className="tabular-nums">{fmt(hovered.value, format)}</div>
        </div>
      )}
    </div>
  );
}
