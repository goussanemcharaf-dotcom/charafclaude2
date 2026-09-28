import React from "react";
import { color } from "../../../styles/tokens";
import { pf, DESK } from "./data";
import { Build, Guide } from "./build";
import { PortfolioNav } from "./PortfolioNav";
import { PortfolioHero } from "./PortfolioHero";
import { PortfolioWorkGrid, PortfolioVoice } from "./PortfolioWorkGrid";
import { PortfolioServices } from "./PortfolioServices";
import { PortfolioAbout, PortfolioStyle } from "./PortfolioAbout";
import { PortfolioContact } from "./PortfolioContact";

export type GuideState = { grid?: number; nav?: number; type?: number; image?: number; work?: number };

/** The full desktop portfolio page (1200 x DESK.total), optionally mid-build. */
export const PortfolioPage: React.FC<{
  build?: Build;
  guides?: GuideState;
  heroImageScale?: number;
  servicesHighlight?: number;
  voicePlayed?: number;
}> = ({ build, guides, heroImageScale, servicesHighlight, voicePlayed }) => {
  const g = guides ?? {};
  const colW = (1072 - 11 * 24) / 12;
  return (
    <div style={{ position: "relative", width: DESK.width, height: DESK.total, background: pf.paper, overflow: "hidden" }}>
      <PortfolioNav build={build} />
      <PortfolioHero build={build} imageScale={heroImageScale} />
      <PortfolioWorkGrid build={build} />
      <PortfolioVoice build={build} played={voicePlayed} />
      <PortfolioServices build={build} highlight={servicesHighlight} />
      <PortfolioStyle build={build} />
      <PortfolioAbout build={build} />
      <PortfolioContact build={build} />

      {/* design-system overlay shown while the page "builds itself" */}
      {(g.grid ?? 0) > 0.01 && (
        <div style={{ position: "absolute", left: 64, top: 0, width: 1072, height: DESK.work + 820, display: "flex", gap: 24, opacity: g.grid, pointerEvents: "none" }}>
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} style={{ width: colW, height: "100%", background: "rgba(123,63,242,0.07)", borderLeft: "1px solid rgba(123,63,242,0.22)", borderRight: "1px solid rgba(123,63,242,0.22)" }} />
          ))}
        </div>
      )}
      {(g.grid ?? 0) > 0.01 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 84, height: 1, background: color.violet, opacity: 0.5 * (g.grid ?? 0) }} />
      )}
      <Guide x={40} y={14} w={1120} h={58} label="Navigation" o={g.nav ?? 0} side="bottom" />
      <Guide x={52} y={DESK.hero + 112} w={440} h={330} label="Typo — Instrument Serif" o={g.type ?? 0} />
      <Guide x={664} y={DESK.hero + 40} w={472} h={620} label="Image" o={g.image ?? 0} />
      <Guide x={64} y={DESK.work + 190} w={1072} h={600} label="Projets" o={g.work ?? 0} />
    </div>
  );
};
