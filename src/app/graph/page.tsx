"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { samplePrograms } from "@/data/sample-programs";
import { useTheme } from "@/components/ThemeProvider";
import { Graph2D } from "@/components/Graph2D";
import type { Graph3DHandle } from "@/components/Graph3D";

const Graph3DWrapper = dynamic(() => import("@/components/Graph3D").then(m => m.Graph3DWrapper), { ssr: false });

// ===== CONSTANTS =====
const PROVINCE_ABBR: Record<string, string> = {
  "British Columbia": "BC", "Alberta": "AB", "Saskatchewan": "SK",
  "Manitoba": "MB", "New Brunswick": "NB",
};
const TYPE_COLORS: Record<string, string> = {
  university: "#8b5cf6", college: "#06b6d4", polytechnic: "#3b82f6",
};
const PROVINCE_ANGLES: Record<string, number> = {
  "BC": 0, "AB": 1, "SK": 2, "MB": 3, "NB": 4,
};

// ===== TYPES =====
interface GraphNode {
  id: string;
  label: string;
  level: number; // 0=BA, 1=province, 2=institution
  color: string;
  size: number;
  fx?: number; fy?: number; fz?: number; // fixed positions
  program?: typeof samplePrograms[0];
  province?: string;
  provinceData?: { count: number; avgTuition: number; cheapest: string; cheapestTuition: number };
}
interface GraphLink { source: string; target: string; }

export default function GraphPage() {
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<typeof samplePrograms[0] | null>(null);
  const [graphMode, setGraphMode] = useState<"2d" | "3d">("2d");
  const [panelPos, setPanelPos] = useState({ x: 0, y: 0 });
  const [filterProvince, setFilterProvince] = useState("");
  const [filterType, setFilterType] = useState("");
  const [showLabels, setShowLabels] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [mounted, setMounted] = useState(false);
  const [graphHandle, setGraphHandle] = useState<Graph3DHandle | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolved: theme } = useTheme();

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    function updateSize() {
      if (containerRef.current) {
        const r = containerRef.current.getBoundingClientRect();
        setDimensions({ width: Math.floor(r.width), height: Math.floor(Math.max(r.height, 400)) });
      }
    }
    // Initial measure after a short delay to ensure layout is settled
    const initTimer = setTimeout(updateSize, 100);
    window.addEventListener("resize", updateSize);
    return () => { clearTimeout(initTimer); window.removeEventListener("resize", updateSize); };
  }, []);

  // ===== FILTER =====
  const filtered = useMemo(() => {
    let items = [...samplePrograms];
    if (filterProvince) items = items.filter((p) => PROVINCE_ABBR[p.province] === filterProvince);
    if (filterType) items = items.filter((p) => p.institution_type === filterType);
    return items;
  }, [filterProvince, filterType]);

  // ===== INSIGHTS =====
  const insights = useMemo(() => {
    const unis = filtered.filter((p) => p.institution_type === "university");
    const cheapest = [...filtered].sort((a, b) => a.tuition_yearly_international - b.tuition_yearly_international)[0];
    const lowestIelts = [...filtered].sort((a, b) => a.ielts_overall - b.ielts_overall)[0];
    const avgTuition = unis.length ? Math.round(unis.reduce((s, p) => s + p.tuition_yearly_international, 0) / unis.length) : 0;
    return { total: filtered.length, cheapest, lowestIelts, avgTuition };
  }, [filtered]);

  // ===== BUILD GRAPH with ORBITAL LAYOUT =====
  const graphData = useMemo(() => {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    const maxTuition = Math.max(...samplePrograms.map((p) => p.tuition_yearly_international));

    // Level 0: Center BA node
    nodes.push({ id: "ba", label: "BA", level: 0, color: "#7c3aed", size: 28, fx: 0, fy: 0, fz: 0 });

    // Group by province
    const byProvince = new Map<string, typeof samplePrograms>();
    filtered.forEach((p) => {
      const abbr = PROVINCE_ABBR[p.province] || p.province;
      if (!byProvince.has(abbr)) byProvince.set(abbr, []);
      byProvince.get(abbr)!.push(p);
    });

    const provinceKeys = Array.from(byProvince.keys());
    const PROV_RADIUS = 250;
    const INST_BASE_RADIUS = 500;

    provinceKeys.forEach((abbr, pi) => {
      // Spread provinces evenly around full circle
      const angle = ((PROVINCE_ANGLES[abbr] ?? pi) / Math.max(provinceKeys.length, 5)) * Math.PI * 2 - Math.PI / 2;
      const px = Math.cos(angle) * PROV_RADIUS;
      const pz = Math.sin(angle) * PROV_RADIUS;

      const programs = byProvince.get(abbr)!;
      const avgT = Math.round(programs.reduce((s, p) => s + p.tuition_yearly_international, 0) / programs.length);
      const cheapestP = programs.sort((a, b) => a.tuition_yearly_international - b.tuition_yearly_international)[0];

      // Level 1: Province node — size by institution count
      nodes.push({
        id: `prov-${abbr}`, label: abbr, level: 1, color: "#475569",
        size: 10 + programs.length * 2, fx: px, fy: 0, fz: pz,
        province: abbr,
        provinceData: { count: programs.length, avgTuition: avgT, cheapest: cheapestP.university_name, cheapestTuition: cheapestP.tuition_yearly_international },
      });
      links.push({ source: "ba", target: `prov-${abbr}` });

      // Level 2: Institution nodes — fan out in wide arc from province direction
      const arcSpread = Math.min(0.45, 1.2 / programs.length); // wider spread for fewer nodes
      programs.forEach((p, ii) => {
        const subAngle = angle + ((ii - (programs.length - 1) / 2) * arcSpread);
        const instRadius = INST_BASE_RADIUS + (ii % 3) * 60; // stagger depth
        const ix = Math.cos(subAngle) * instRadius;
        const iz = Math.sin(subAngle) * instRadius;
        const iy = (ii % 2 === 0 ? 1 : -1) * (20 + (ii % 4) * 25); // vertical spread
        const nodeSize = 6 + (p.tuition_yearly_international / maxTuition) * 16;
        const color = TYPE_COLORS[p.institution_type || "university"] || "#8b5cf6";

        nodes.push({
          id: `inst-${p.id}`, label: p.university_name.replace("University of ", "U of ").replace("University", "U"),
          level: 2, color, size: nodeSize,
          fx: ix, fy: iy, fz: iz,
          program: p,
        });
        links.push({ source: `prov-${abbr}`, target: `inst-${p.id}` });
      });
    });

    return { nodes, links };
  }, [filtered]);

  // Camera auto-fit is handled inside Graph3DWrapper

  // ===== HANDLERS =====
  const handleNodeClick = useCallback((node: any, event: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    setSelected(node as GraphNode);
    // Position panel near click point, clamped to viewport
    if (event) {
      const sidebarW = window.innerWidth >= 1024 ? 224 : 64;
      const maxX = window.innerWidth - 280;
      const x = Math.min(Math.max(event.clientX + 16, sidebarW + 8), maxX);
      const y = Math.max(Math.min(event.clientY - 80, window.innerHeight - 440), 60);
      setPanelPos({ x, y });
    }
    if (graphHandle && node.fx !== undefined) {
      const dist = node.level === 0 ? 300 : node.level === 1 ? 250 : 180;
      graphHandle.cameraPosition(
        { x: (node.fx || 0) + dist * 0.5, y: (node.fy || 0) + dist * 0.4, z: (node.fz || 0) + dist * 0.5 },
        { x: node.fx || 0, y: node.fy || 0, z: node.fz || 0 },
        800
      );
    }
  }, []);

  const provinces = Array.from(new Set(samplePrograms.map((p) => PROVINCE_ABBR[p.province]))).sort();

  return (
    <div className="p-3 lg:p-4 h-screen overflow-hidden flex flex-col w-full max-w-full min-w-0">
      <h1 className="text-lg font-bold mb-1">3D Program Explorer</h1>
      <p className="text-[11px] text-[var(--text-muted)] mb-3">
        Hierarchical map: BA → Provinces → Institutions. Node size = tuition level. Click any node for details.
      </p>

      {/* Insights strip — compact */}
      <div className="grid grid-cols-4 gap-1.5 mb-2 shrink-0">
        <div className="glass rounded-lg px-2 py-1.5">
          <span className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider">Showing</span>
          <p className="text-xs font-bold">{insights.total} programs</p>
        </div>
        <div className="glass rounded-lg px-2 py-1.5">
          <span className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider">Cheapest</span>
          <p className="text-xs font-bold truncate">{insights.cheapest?.university_name}</p>
        </div>
        <div className="glass rounded-lg px-2 py-1.5">
          <span className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider">Lowest IELTS</span>
          <p className="text-xs font-bold truncate">{insights.lowestIelts?.ielts_overall} — {insights.lowestIelts?.university_name}</p>
        </div>
        <div className="glass rounded-lg px-2 py-1.5">
          <span className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider">Avg Tuition</span>
          <p className="text-xs font-bold">${insights.avgTuition.toLocaleString()}/yr</p>
        </div>
      </div>

      {/* Controls — single row, no overflow */}
      <div className="flex gap-1.5 mb-2 items-center shrink-0 min-w-0 flex-wrap">
        {/* 2D/3D toggle */}
        <div className="flex rounded-lg border border-[var(--border)] overflow-hidden">
          <button onClick={() => setGraphMode("2d")} className={`px-2.5 py-1.5 text-[11px] transition-all ${graphMode === "2d" ? "bg-[var(--accent)]/15 text-[var(--accent)] font-medium" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"}`}>2D</button>
          <button onClick={() => setGraphMode("3d")} className={`px-2.5 py-1.5 text-[11px] transition-all ${graphMode === "3d" ? "bg-[var(--accent)]/15 text-[var(--accent)] font-medium" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"}`}>3D</button>
        </div>
        <select value={filterProvince} onChange={(e) => { setFilterProvince(e.target.value); setSelected(null); setSelectedProgram(null); }} className="px-2.5 py-1.5 rounded-lg glass border border-[var(--border)] text-[11px] bg-transparent">
          <option value="">All Provinces</option>
          {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setSelected(null); }} className="px-2.5 py-1.5 rounded-lg glass border border-[var(--border)] text-[11px] bg-transparent">
          <option value="">All Types</option>
          <option value="university">Universities</option>
          <option value="polytechnic">Polytechnics</option>
        </select>
        <label className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] cursor-pointer">
          <input type="checkbox" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} className="w-3 h-3 accent-[var(--accent)]" /> Labels
        </label>
        <label className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] cursor-pointer">
          <input type="checkbox" checked={autoRotate} onChange={(e) => setAutoRotate(e.target.checked)} className="w-3 h-3 accent-[var(--accent)]" /> Rotate
        </label>
        <button onClick={() => { setFilterProvince(""); setFilterType(""); setSelected(null); graphHandle?.fitAll(); }} className="px-2.5 py-1.5 rounded-lg border border-[var(--border)] text-[11px] text-[var(--text-muted)] hover:text-[var(--accent)] transition-all">
          Reset
        </button>
        {/* Legend */}
        <div className="flex gap-3 ml-auto text-[9px] text-[var(--text-muted)] items-center">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: "#7c3aed" }} /> Center</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: "#475569" }} /> Province</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: "#8b5cf6" }} /> University</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: "#3b82f6" }} /> Polytechnic</span>
        </div>
      </div>

      <div className="relative flex-1 min-h-0 min-w-0 w-full max-w-full">
        <div ref={containerRef} className="w-full h-full glass-card rounded-xl overflow-hidden">
          {graphMode === "2d" ? (
            <Graph2D
              programs={filtered}
              selectedId={selectedProgram?.id ?? null}
              onNodeClick={(prog) => {
                setSelectedProgram(prog);
                setSelected(null);
              }}
            />
          ) : mounted && (
            <Graph3DWrapper
              onReady={setGraphHandle}
              graphData={graphData}
              width={dimensions.width}
              height={dimensions.height}
              backgroundColor={theme === "dark" ? "#0a0a14" : "#F8FAFC"}
              autoRotate={autoRotate}
              nodeThreeObject={(node: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                const SpriteText = require("three-spritetext").default;
                const group = new (require("three").Group)();
                const THREE = require("three");
                const geo = new THREE.SphereGeometry(node.size || 5, 16, 16);
                const mat = new THREE.MeshLambertMaterial({ color: node.color || "#8b5cf6", transparent: true, opacity: node.level === 0 ? 1 : 0.8 });
                group.add(new THREE.Mesh(geo, mat));
                if (node.level === 0) {
                  group.add(new THREE.Mesh(new THREE.SphereGeometry(node.size * 1.8, 16, 16), new THREE.MeshBasicMaterial({ color: "#7c3aed", transparent: true, opacity: 0.12 })));
                  group.add(new THREE.Mesh(new THREE.SphereGeometry(node.size * 2.5, 16, 16), new THREE.MeshBasicMaterial({ color: "#7c3aed", transparent: true, opacity: 0.04 })));
                }
                if (showLabels) {
                  const sprite = new SpriteText(node.label || "");
                  sprite.color = theme === "dark" ? "#cbd5e1" : "#334155";
                  sprite.textHeight = node.level === 0 ? 16 : node.level === 1 ? 12 : 7;
                  sprite.position.y = (node.size || 5) + (node.level === 0 ? 22 : node.level === 1 ? 16 : 10);
                  sprite.backgroundColor = false;
                  sprite.fontWeight = node.level <= 1 ? "bold" : "normal";
                  group.add(sprite);
                }
                return group;
              }}
              nodeLabel={(node: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                const bg = theme === "dark" ? "rgba(10,10,20,0.92)" : "rgba(255,255,255,0.95)";
                const border = theme === "dark" ? "rgba(139,92,246,0.25)" : "rgba(79,70,229,0.15)";
                const text = theme === "dark" ? "#e2e8f0" : "#0F172A";
                const sub = theme === "dark" ? "#94a3b8" : "#475569";
                const accent = theme === "dark" ? "#a78bfa" : "#4F46E5";
                if (node.program) {
                  const p = node.program;
                  return `<div style="background:${bg};padding:10px 14px;border-radius:10px;border:1px solid ${border};font-size:12px;color:${text};min-width:180px;box-shadow:0 4px 20px rgba(0,0,0,0.2)"><div style="font-weight:700;margin-bottom:3px">${p.university_name}</div><div style="color:${sub};font-size:11px">${p.city}, ${p.province} · ${p.institution_type}</div><div style="margin-top:6px;display:flex;gap:12px"><div><span style="color:${sub};font-size:10px">Tuition</span><br/><span style="color:${accent};font-weight:600">$${p.tuition_yearly_international.toLocaleString()}</span></div><div><span style="color:${sub};font-size:10px">IELTS</span><br/><span style="font-weight:600">${p.ielts_overall}</span></div><div><span style="color:${sub};font-size:10px">Co-op</span><br/><span style="font-weight:600">${p.has_coop ? "Yes" : "No"}</span></div></div></div>`;
                }
                if (node.provinceData) {
                  const d = node.provinceData;
                  return `<div style="background:${bg};padding:8px 12px;border-radius:8px;border:1px solid ${border};font-size:11px;color:${text}"><div style="font-weight:700">${node.label}</div><div style="color:${sub}">${d.count} institution${d.count > 1 ? "s" : ""} · Avg $${d.avgTuition.toLocaleString()}/yr</div><div style="margin-top:3px;color:${sub}">Cheapest: ${d.cheapest} ($${d.cheapestTuition.toLocaleString()})</div></div>`;
                }
                if (node.level === 0) {
                  return `<div style="background:${bg};padding:8px 12px;border-radius:8px;border:1px solid ${border};font-size:11px;color:${text}"><div style="font-weight:700">Bachelor of Arts</div><div style="color:${sub}">${filtered.length} programs across Canada</div><div style="color:${sub}">Avg tuition: $${insights.avgTuition.toLocaleString()}/yr</div></div>`;
                }
                return "";
              }}
              nodeVal={(node: any) => node.size} // eslint-disable-line @typescript-eslint/no-explicit-any
              linkColor={() => theme === "dark" ? "rgba(148,163,184,0.1)" : "rgba(100,116,139,0.15)"}
              linkWidth={1.2}
              linkOpacity={0.35}
              onNodeClick={handleNodeClick}
            />
          )}
        </div>

        {/* Zoom +/- buttons — only in 3D mode */}
        {graphMode === "3d" && (
        <div className="absolute bottom-4 right-4 flex flex-col gap-1 z-[100]" style={{ pointerEvents: "auto" }}>
          <button
            onClick={() => graphHandle?.zoomIn()}
            className="w-9 h-9 rounded-lg glass border border-[var(--border)] flex items-center justify-center text-lg font-light text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)]/20 transition-all cursor-pointer"
            aria-label="Zoom in"
          >+</button>
          <button
            onClick={() => graphHandle?.zoomOut()}
            className="w-9 h-9 rounded-lg glass border border-[var(--border)] flex items-center justify-center text-lg font-light text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)]/20 transition-all cursor-pointer"
            aria-label="Zoom out"
          >−</button>
          <button
            onClick={() => graphHandle?.fitAll()}
            className="w-9 h-9 rounded-lg glass border border-[var(--border)] flex items-center justify-center text-[10px] font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)]/20 transition-all cursor-pointer"
            aria-label="Fit to view"
          >Fit</button>
        </div>
        )}

        {/* 2D mode detail panel — inline below graph */}
        {graphMode === "2d" && selectedProgram && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-3 left-3 right-3 glass-card rounded-xl p-3 z-40 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[9px] uppercase tracking-widest font-semibold px-1.5 py-0.5 rounded ${selectedProgram.institution_type === "polytechnic" ? "tag-polytechnic" : "tag-university"}`}>{selectedProgram.institution_type}</span>
                <span className="font-semibold text-xs truncate">{selectedProgram.university_name}</span>
              </div>
              <div className="flex gap-4 text-[11px] text-[var(--text-secondary)]">
                <span>{selectedProgram.city}, {selectedProgram.province}</span>
                <span>Tuition: <span className="text-[var(--accent)] font-semibold">${selectedProgram.tuition_yearly_international.toLocaleString()}/yr</span></span>
                <span>IELTS: {selectedProgram.ielts_overall}</span>
                <span>Co-op: {selectedProgram.has_coop ? "Yes" : "No"}</span>
                {selectedProgram.majors && <span>{selectedProgram.majors.length} majors</span>}
              </div>
            </div>
            <Link href={`/program/${selectedProgram.id}`} className="shrink-0 px-3 py-1.5 bg-[var(--accent)]/10 text-[var(--accent)] rounded-lg text-[11px] font-medium border border-[var(--accent)]/20 hover:bg-[var(--accent)]/20 transition-colors">
              View
            </Link>
            <button onClick={() => setSelectedProgram(null)} className="shrink-0 text-[var(--text-muted)] hover:text-[var(--text)] text-xs">✕</button>
          </motion.div>
        )}

        {/* Floating Detail Panel — positioned near clicked node */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed w-60 glass-card rounded-xl p-3 z-50 overflow-y-auto shadow-lg"
              style={{ left: panelPos.x, top: panelPos.y, maxHeight: "min(380px, calc(100vh - 100px))" }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] uppercase tracking-widest font-semibold px-1.5 py-0.5 rounded" style={{ background: `${selected.color}20`, color: selected.color, border: `1px solid ${selected.color}30` }}>
                  {selected.level === 0 ? "Center" : selected.level === 1 ? "Province" : selected.program?.institution_type || "institution"}
                </span>
                <button onClick={() => setSelected(null)} className="text-[var(--text-muted)] hover:text-[var(--text)] text-xs">✕</button>
              </div>

              <h3 className="font-semibold text-sm mb-1">{selected.label}</h3>

              {/* Institution detail */}
              {selected.program && (
                <>
                  <p className="text-[11px] text-[var(--text-secondary)] mb-4">{selected.program.city}, {selected.program.province}</p>
                  <div className="space-y-2.5 text-xs mb-4">
                    <div className="flex justify-between"><span className="text-[var(--text-muted)]">Program</span><span className="text-right max-w-[140px] truncate">{selected.program.program_name}</span></div>
                    <div className="flex justify-between"><span className="text-[var(--text-muted)]">Tuition/yr</span><span className="text-[var(--accent)] font-semibold">${selected.program.tuition_yearly_international.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-[var(--text-muted)]">Living/mo</span><span>${selected.program.estimated_monthly_living_cost.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-[var(--text-muted)]">Total/yr</span><span className="text-[var(--accent-cyan)] font-semibold">${(selected.program.tuition_yearly_international + selected.program.estimated_monthly_living_cost * 12).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-[var(--text-muted)]">IELTS</span><span>{selected.program.ielts_overall}</span></div>
                    <div className="flex justify-between"><span className="text-[var(--text-muted)]">TOEFL</span><span>{selected.program.toefl_ibt}</span></div>
                    <div className="flex justify-between"><span className="text-[var(--text-muted)]">Co-op</span><span className={selected.program.has_coop ? "text-emerald-600 dark:text-emerald-400" : "text-[var(--text-muted)]"}>{selected.program.has_coop ? "Yes" : "No"}</span></div>
                    {selected.program.majors && <div className="flex justify-between"><span className="text-[var(--text-muted)]">Majors</span><span>{selected.program.majors.length}</span></div>}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/program/${selected.program.id}`} className="flex-1 text-center px-3 py-2 bg-[var(--accent)]/10 text-[var(--accent)] rounded-lg text-[11px] font-medium hover:bg-[var(--accent)]/20 transition-colors border border-[var(--accent)]/20">
                      View Program
                    </Link>
                    <Link href={`/compare?ids=${selected.program.id}`} className="flex-1 text-center px-3 py-2 glass rounded-lg text-[11px] font-medium hover:text-[var(--accent)] transition-colors">
                      Compare
                    </Link>
                  </div>
                </>
              )}

              {/* Province detail */}
              {selected.provinceData && (
                <div className="space-y-2.5 text-xs mt-2">
                  <div className="flex justify-between"><span className="text-[var(--text-muted)]">Institutions</span><span className="font-semibold">{selected.provinceData.count}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--text-muted)]">Avg Tuition</span><span>${selected.provinceData.avgTuition.toLocaleString()}/yr</span></div>
                  <div className="flex justify-between"><span className="text-[var(--text-muted)]">Cheapest</span><span className="text-right max-w-[140px] truncate text-emerald-600 dark:text-emerald-400">{selected.provinceData.cheapest}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--text-muted)]">Lowest Tuition</span><span>${selected.provinceData.cheapestTuition.toLocaleString()}/yr</span></div>
                </div>
              )}

              {/* BA center detail */}
              {selected.level === 0 && (
                <div className="space-y-2.5 text-xs mt-2">
                  <div className="flex justify-between"><span className="text-[var(--text-muted)]">Total Programs</span><span className="font-semibold">{filtered.length}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--text-muted)]">Avg Tuition</span><span>${insights.avgTuition.toLocaleString()}/yr</span></div>
                  <div className="flex justify-between"><span className="text-[var(--text-muted)]">Avg IELTS</span><span>{(filtered.reduce((s, p) => s + p.ielts_overall, 0) / filtered.length).toFixed(1)}</span></div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
