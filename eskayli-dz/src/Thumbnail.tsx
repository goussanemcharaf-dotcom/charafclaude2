import React from "react";
import { AbsoluteFill } from "remotion";
import { bgSystem, color, font } from "./lib/tokens";
import { Grid, Mono, Vignette } from "./components/base";
import { Wordmark } from "./components/Wordmark";

// Cover frame: the hook question at full scale (the ad's promise), the four-stage acquisition flow
// it answers, and the brand. Everything critical sits inside y 440–1480 so the 1:1 and 3:4 grid
// crops keep it.

const FLOW = ["ATTENTION", "PROSPECTS", "CONVERSATIONS", "CLIENTS"];

export const Thumbnail: React.FC = () => (
  <AbsoluteFill style={{ background: bgSystem, color: color.paper, fontFamily: font.sans }}>
    <Grid o={0.55} />
    <div style={{ position: "absolute", left: 80, right: 60, top: 452 }}>
      <Mono size={26} c={color.signal} style={{ letterSpacing: "0.12em" }}>Meta Ads · Facebook &amp; Instagram</Mono>
      <div style={{ marginTop: 26, fontWeight: 650, fontSize: 64, letterSpacing: "-0.025em", color: color.mist, lineHeight: 1.05 }}>Votre</div>
      <div style={{ fontWeight: 800, fontSize: 176, letterSpacing: "-0.05em", lineHeight: 0.98 }}>BUDGET</div>
      <div style={{ marginTop: 8, fontWeight: 650, fontSize: 64, letterSpacing: "-0.025em", color: color.mist, lineHeight: 1.1 }}>
        vous apporte <span style={{ color: color.paper }}>vraiment</span> des
      </div>
      <div style={{ fontWeight: 800, fontSize: 164, letterSpacing: "-0.05em", lineHeight: 1.0, color: color.signal }}>CLIENTS&nbsp;?</div>
    </div>
    <div style={{ position: "absolute", left: 80, right: 80, top: 1170, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      {FLOW.map((k, i) => {
        const last = i === FLOW.length - 1;
        return (
          <React.Fragment key={k}>
            <span style={{ padding: "14px 16px", borderRadius: 16, fontWeight: 750, fontSize: 22, letterSpacing: "0.03em", whiteSpace: "nowrap",
              background: last ? color.signal : color.panel2, color: last ? "#170800" : color.paper, border: `1.5px solid ${last ? color.signal : color.line2}` }}>{k}</span>
            {!last && <span style={{ flex: 1, height: 2, margin: "0 10px", background: `linear-gradient(90deg, ${color.line2}, ${color.signalLine})` }} />}
          </React.Fragment>
        );
      })}
    </div>
    <div style={{ position: "absolute", left: 80, top: 1330 }}>
      <Wordmark size={104} />
    </div>
    <Vignette o={0.8} />
  </AbsoluteFill>
);
