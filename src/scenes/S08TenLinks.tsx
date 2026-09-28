import React from "react";
import { bg, color, font } from "../../styles/tokens";
import { cue, scene, wordAt } from "../timeline";
import { clamp, ease, invLerp, springy } from "../components/motion/anim";
import { MotionBlur } from "../components/motion/MotionBlur";
import { LinkStack, LinkTimes, linkCount, counterProg } from "../components/workflow/LinkStack";
import { persona } from "../components/portfolio/data";
import { LinkCollapse } from "../components/workflow/LinkStack";
import { Fill, SceneProps } from "./shared";

// S08 — TEN LINKS. "Au lieu d'envoyer dix liens…" Ten links land one by one;
// the counter hits 10 exactly on "dix".
// S09 — ONE LINK. "…tu envoies un seul lien." They align, collapse and merge
// into one clean link, which is sent.

export const LINK_T: LinkTimes = {
  first: scene("s08_ten_links")[0] + 0.04,
  step: (cue("dix_liens") - 0.1 - (scene("s08_ten_links")[0] + 0.04)) / 9,
  align: wordAt(14, "tu") - 0.04,
  collapse: wordAt(14, "un") - 0.1,
  merge: cue("un_seul") - 0.02,
  send: wordAt(14, "lien") + 0.34,
};

const Counter: React.FC<{ t: number }> = ({ t }) => {
  const n = linkCount(t, LINK_T);
  const flip = counterProg(t, LINK_T);
  const merged = t >= LINK_T.merge - 0.02;
  const bump = (() => {
    const i = Math.floor((t - LINK_T.first) / LINK_T.step);
    const at = LINK_T.first + i * LINK_T.step;
    return i >= 0 && i < 10 && !merged ? Math.sin(clamp(invLerp(at, at + 0.14, t)) * Math.PI) * 0.06 : 0;
  })();
  const big = { fontFamily: font.display, fontWeight: 800, letterSpacing: "-0.06em", lineHeight: 1 } as const;
  if (n < 1) return null;
  const inS = springy(t, LINK_T.first, { stiffness: 300, damping: 18 });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 262, height: 240, display: "flex", justifyContent: "center", alignItems: "baseline", gap: 22, transform: `scale(${(0.7 + 0.3 * inS) * (1 + bump)})`, transformOrigin: "50% 60%" }}>
      <div style={{ position: "relative", height: 230, overflow: "hidden", minWidth: merged ? 120 : 260, textAlign: "right" }}>
        {!merged && <div style={{ ...big, fontSize: 230, color: color.ink }}>{n}</div>}
        {merged && (
          <>
            <MotionBlur y={(1 - flip) * 30} style={{ position: "absolute", right: 0, top: -flip * 240 }}>
              <div style={{ ...big, fontSize: 230, color: color.ink, opacity: 1 - flip }}>10</div>
            </MotionBlur>
            <MotionBlur y={(1 - flip) * 30} style={{ transform: `translateY(${(1 - flip) * 240}px)` }}>
              <div style={{ ...big, fontSize: 230, color: color.violet }}>1</div>
            </MotionBlur>
          </>
        )}
      </div>
      <div style={{ ...big, fontSize: 104, color: merged ? color.violet : color.ink, letterSpacing: "-0.045em" }}>
        {merged ? "seul lien" : n > 1 ? "liens" : "lien"}
      </div>
    </div>
  );
};

export const LINKS_BG_OFF = 29.26;

export const LinksScene: React.FC<SceneProps> = ({ t }) => {
  const cOut = ease.inExpo(clamp(invLerp(LINK_T.send + 0.1, LINK_T.send + 0.36, t)));
  return (
    <Fill bg={t < LINKS_BG_OFF ? bg.studio : "transparent"}>
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${-cOut * 700}px)`, opacity: 1 - cOut }}>
        <MotionBlur y={cOut * 40}>
          <Counter t={t} />
        </MotionBlur>
      </div>
      <LinkStack t={t} T={LINK_T} />
      <LinkCollapse t={t} T={LINK_T} domain={persona.url} />
    </Fill>
  );
};

export const S08TenLinks = LinksScene;
