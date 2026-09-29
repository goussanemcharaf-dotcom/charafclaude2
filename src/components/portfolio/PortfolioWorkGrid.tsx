import React from "react";
import { Img } from "remotion";
import { IconPlay, IconArrowRight } from "../ui/Icons";
import { img, pf, projects, Project, DESK } from "./data";
import { B, Build, rise, unmask } from "./build";

/** One project tile: image, play badge, title + meta. */
export const PortfolioProject: React.FC<{
  project: Project; width: number; height: number; p?: number; titleSize?: number; metaSize?: number; radius?: number; zoom?: number;
}> = ({ project, width, height, p = 1, titleSize = 23, metaSize = 14, radius = 16, zoom = 1 }) => (
  <div style={{ width, ...rise(p, 40) }}>
    <div style={{ width, height, borderRadius: radius, overflow: "hidden", position: "relative", background: pf.paperDeep, ...unmask(p, radius) }}>
      <Img src={img[project.key]()} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: project.pos ?? "50% 50%", transform: `scale(${zoom})` }} />
      <div
        style={{
          position: "absolute", right: 14, top: 14, display: "flex", alignItems: "center", gap: 7, background: "rgba(22,20,15,0.55)",
          color: "#fff", borderRadius: 999, padding: "7px 12px 7px 10px", fontFamily: pf.mono, fontSize: metaSize, backdropFilter: "blur(6px)",
        }}
      >
        <IconPlay size={metaSize + 1} color="#fff" fill="#fff" /> {project.duration}
      </div>
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 16 }}>
      <div style={{ fontFamily: pf.sans, fontSize: titleSize, fontWeight: 500, color: pf.ink, letterSpacing: "-0.015em" }}>{project.title}</div>
      <div style={{ fontFamily: pf.mono, fontSize: metaSize, color: pf.mute }}>{project.meta}</div>
    </div>
  </div>
);

export const PortfolioWorkGrid: React.FC<{ build?: Build }> = ({ build }) => {
  const p = B(build, "work");
  const w = (1200 - 128 - 2 * 24) / 3;
  return (
    <div style={{ position: "absolute", left: 0, top: DESK.work, width: 1200, height: 820 }}>
      <div style={{ position: "absolute", left: 64, right: 64, top: 56, display: "flex", justifyContent: "space-between", alignItems: "flex-end", ...rise(p, 20) }}>
        <div style={{ fontFamily: pf.serif, fontSize: 84, color: pf.ink, letterSpacing: "-0.02em", lineHeight: 1 }}>
          Projets <span style={{ fontFamily: pf.mono, fontSize: 18, color: pf.mute, letterSpacing: 0, verticalAlign: "top" }}>(03)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: pf.sans, fontSize: 18, color: pf.ink, paddingBottom: 12 }}>
          Tout voir <IconArrowRight size={18} color={pf.ink} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 64, top: 190, display: "flex", gap: 24 }}>
        {projects.map((pr, i) => (
          <PortfolioProject key={pr.key} project={pr} width={w} height={520} p={Math.max(0, Math.min(1, p * 1.6 - i * 0.3))} />
        ))}
      </div>
    </div>
  );
};

/** Voice demo player strip. */
export const PortfolioVoice: React.FC<{ build?: Build; played?: number }> = ({ build, played = 0.36 }) => {
  const p = B(build, "rest");
  const bars = 64;
  return (
    <div style={{ position: "absolute", left: 64, top: DESK.voice + 26, width: 1072, height: 148, borderRadius: 20, background: pf.paperDeep, display: "flex", alignItems: "center", gap: 28, padding: "0 34px", boxSizing: "border-box", ...rise(p, 24) }}>
      <div style={{ width: 72, height: 72, borderRadius: 36, background: pf.ink, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <IconPlay size={30} color={pf.paper} fill={pf.paper} />
      </div>
      <div style={{ width: 230, flexShrink: 0 }}>
        <div style={{ fontFamily: pf.sans, fontSize: 23, fontWeight: 500, color: pf.ink }}>Démo voix off</div>
        <div style={{ fontFamily: pf.mono, fontSize: 14, color: pf.mute, marginTop: 6 }}>Français natif · voix posée</div>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 4, height: 60 }}>
        {Array.from({ length: bars }, (_, i) => {
          const v = Math.abs(Math.sin(i * 0.9) * 0.55 + Math.sin(i * 0.31 + 1) * 0.45);
          return <div key={i} style={{ flex: 1, height: 8 + v * 50, borderRadius: 3, background: i / bars < played ? pf.ink : "rgba(22,20,15,0.22)" }} />;
        })}
      </div>
      <div style={{ fontFamily: pf.mono, fontSize: 16, color: pf.inkSoft }}>0:45</div>
    </div>
  );
};
