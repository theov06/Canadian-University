"use client";

import { useState, useRef, useCallback } from "react";
import { useTheme } from "./ThemeProvider";

const PROVINCE_ABBR: Record<string, string> = {
  "British Columbia": "BC", "Alberta": "AB", "Saskatchewan": "SK",
  "Manitoba": "MB", "New Brunswick": "NB",
};
const PROVINCE_ANGLES: Record<string, number> = { "BC": 0, "AB": 1, "SK": 2, "MB": 3, "NB": 4 };
const TYPE_COLORS: Record<string, string> = { university: "#8b5cf6", college: "#06b6d4", polytechnic: "#3b82f6" };

interface Props {
  programs: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  onNodeClick: (program: any | null, province?: string) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
  selectedId?: number | null;
}

export function Graph2D({ programs, onNodeClick, selectedId }: Props) {
  const { resolved: theme } = useTheme();
  const [hovered, setHovered] = useState<string | null>(null);

  // Pan & zoom state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const cx = 400, cy = 320;
  const PROV_R = 140, INST_R = 280;
  const maxTuition = Math.max(...programs.map((p: any) => p.tuition_yearly_international)); // eslint-disable-line @typescript-eslint/no-explicit-any

  // Group by province
  const byProvince = new Map<string, any[]>(); // eslint-disable-line @typescript-eslint/no-explicit-any
  programs.forEach((p: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const abbr = PROVINCE_ABBR[p.province] || p.province;
    if (!byProvince.has(abbr)) byProvince.set(abbr, []);
    byProvince.get(abbr)!.push(p);
  });
  const provKeys = Array.from(byProvince.keys());

  const isDark = theme === "dark";
  const bgLine = isDark ? "rgba(148,163,184,0.06)" : "rgba(100,116,139,0.08)";
  const labelColor = isDark ? "#94a3b8" : "#475569";
  const provLabelColor = isDark ? "#cbd5e1" : "#1e293b";

  // Zoom handler
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((z) => Math.min(Math.max(z * delta, 0.3), 4));
  }, []);

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    const dx = (e.clientX - panStart.current.x) / zoom;
    const dy = (e.clientY - panStart.current.y) / zoom;
    setPan({ x: panStart.current.panX + dx, y: panStart.current.panY + dy });
  }, [isPanning, zoom]);

  const handleMouseUp = useCallback(() => setIsPanning(false), []);

  // Zoom buttons (exposed via data attributes for parent)
  const zoomIn = () => setZoom((z) => Math.min(z * 1.3, 4));
  const zoomOut = () => setZoom((z) => Math.max(z * 0.7, 0.3));
  const fitAll = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  // Viewbox with pan/zoom
  const vbW = 800 / zoom;
  const vbH = 640 / zoom;
  const vbX = (800 - vbW) / 2 - pan.x;
  const vbY = (640 - vbH) / 2 - pan.y;

  return (
    <div className="relative w-full h-full">
      <svg
        ref={svgRef}
        viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
        className="w-full h-full"
        style={{ minHeight: 400, cursor: isPanning ? "grabbing" : "grab" }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Orbit rings */}
        <circle cx={cx} cy={cy} r={PROV_R} fill="none" stroke={bgLine} strokeWidth="0.5" strokeDasharray="4 4" />
        <circle cx={cx} cy={cy} r={INST_R} fill="none" stroke={bgLine} strokeWidth="0.5" strokeDasharray="4 4" />

        {/* Center BA node */}
        <circle cx={cx} cy={cy} r={24} fill={isDark ? "rgba(124,58,237,0.15)" : "rgba(79,70,229,0.1)"} stroke={isDark ? "rgba(124,58,237,0.4)" : "rgba(79,70,229,0.3)"} strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r={36} fill="none" stroke={isDark ? "rgba(124,58,237,0.08)" : "rgba(79,70,229,0.05)"} strokeWidth="1" />
        <text x={cx} y={cy + 5} textAnchor="middle" fill={isDark ? "#a78bfa" : "#4F46E5"} fontSize="14" fontWeight="bold">BA</text>

        {provKeys.map((abbr, pi) => {
          const angle = ((PROVINCE_ANGLES[abbr] ?? pi) / Math.max(provKeys.length, 5)) * Math.PI * 2 - Math.PI / 2;
          const px = cx + Math.cos(angle) * PROV_R;
          const py = cy + Math.sin(angle) * PROV_R;
          const progs = byProvince.get(abbr)!;
          const provSize = 8 + progs.length * 1.5;

          return (
            <g key={abbr}>
              <line x1={cx} y1={cy} x2={px} y2={py} stroke={bgLine} strokeWidth="1" />
              <circle cx={px} cy={py} r={provSize} fill={isDark ? "rgba(71,85,105,0.3)" : "rgba(100,116,139,0.12)"} stroke={isDark ? "rgba(71,85,105,0.5)" : "rgba(100,116,139,0.25)"} strokeWidth="1" />
              <text x={px} y={py + 4} textAnchor="middle" fill={provLabelColor} fontSize="10" fontWeight="bold">{abbr}</text>

              {progs.map((p: any, ii: number) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                const arcSpread = Math.min(0.4, 1.0 / progs.length);
                const subAngle = angle + ((ii - (progs.length - 1) / 2) * arcSpread);
                const r = INST_R + (ii % 3) * 20;
                const ix = cx + Math.cos(subAngle) * r;
                const iy = cy + Math.sin(subAngle) * r;
                const nodeSize = 5 + (p.tuition_yearly_international / maxTuition) * 12;
                const color = TYPE_COLORS[p.institution_type || "university"] || "#8b5cf6";
                const isSelected = selectedId === p.id;
                const isHovered = hovered === `inst-${p.id}`;
                const shortName = p.university_name.replace("University of ", "U of ").replace("University", "U");

                return (
                  <g key={p.id}
                    onClick={(e) => { e.stopPropagation(); onNodeClick(p); }}
                    onMouseEnter={() => setHovered(`inst-${p.id}`)}
                    onMouseLeave={() => setHovered(null)}
                    className="cursor-pointer"
                  >
                    <line x1={px} y1={py} x2={ix} y2={iy} stroke={bgLine} strokeWidth="0.8" />
                    {isSelected && <circle cx={ix} cy={iy} r={nodeSize + 5} fill="none" stroke={color} strokeWidth="1.5" opacity="0.4">
                      <animate attributeName="r" values={`${nodeSize + 3};${nodeSize + 7};${nodeSize + 3}`} dur="2s" repeatCount="indefinite" />
                    </circle>}
                    <circle cx={ix} cy={iy} r={nodeSize} fill={color} opacity={isSelected || isHovered ? 1 : 0.65}>
                      {isHovered && <animate attributeName="r" from={nodeSize} to={nodeSize + 2} dur="0.2s" fill="freeze" />}
                    </circle>
                    <text x={ix} y={iy + nodeSize + 12} textAnchor="middle" fill={labelColor} fontSize="7" opacity={isHovered || isSelected ? 1 : 0.6}>
                      {shortName.length > 18 ? shortName.slice(0, 17) + "…" : shortName}
                    </text>

                    {isHovered && (
                      <foreignObject x={ix + nodeSize + 4} y={iy - 44} width="190" height="90" style={{ overflow: "visible", pointerEvents: "none" }}>
                        <div style={{
                          background: isDark ? "rgba(10,10,20,0.92)" : "rgba(255,255,255,0.95)",
                          border: `1px solid ${isDark ? "rgba(139,92,246,0.25)" : "rgba(79,70,229,0.15)"}`,
                          borderRadius: 8, padding: "8px 10px", fontSize: 11,
                          color: isDark ? "#e2e8f0" : "#0F172A",
                          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                        }}>
                          <div style={{ fontWeight: 700, marginBottom: 2 }}>{p.university_name}</div>
                          <div style={{ color: labelColor, fontSize: 10 }}>{p.city} · {p.institution_type}</div>
                          <div style={{ marginTop: 4, display: "flex", gap: 10 }}>
                            <span style={{ color: isDark ? "#a78bfa" : "#4F46E5", fontWeight: 600 }}>${p.tuition_yearly_international.toLocaleString()}</span>
                            <span>IELTS {p.ielts_overall}</span>
                            <span>{p.has_coop ? "Co-op" : ""}</span>
                          </div>
                        </div>
                      </foreignObject>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* Zoom controls */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1 z-40">
        <button onClick={zoomIn} className="w-8 h-8 rounded-lg glass border border-[var(--border)] flex items-center justify-center text-base font-light text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all cursor-pointer">+</button>
        <button onClick={zoomOut} className="w-8 h-8 rounded-lg glass border border-[var(--border)] flex items-center justify-center text-base font-light text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all cursor-pointer">−</button>
        <button onClick={fitAll} className="w-8 h-8 rounded-lg glass border border-[var(--border)] flex items-center justify-center text-[9px] font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all cursor-pointer">Fit</button>
      </div>

      {/* Zoom level indicator */}
      <div className="absolute top-3 right-3 text-[9px] text-[var(--text-muted)]">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
}
