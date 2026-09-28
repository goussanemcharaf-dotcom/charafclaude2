import React from "react";
import { AbsoluteFill, Composition } from "remotion";
import { ensureFonts } from "./fonts";
import { bg, color, font } from "../styles/tokens";
import { AvatarSheet } from "./dev/AvatarSheet";

ensureFonts();

const Smoke: React.FC = () => (
  <AbsoluteFill style={{ background: bg.studio, alignItems: "center", justifyContent: "center", gap: 40 }}>
    <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 96, letterSpacing: "-0.045em", color: color.ink }}>
      Écris-moi et on commence.
    </div>
    <div style={{ fontFamily: font.serif, fontStyle: "italic", fontSize: 110, color: color.violet }}>
      meilleure présentation
    </div>
    <div style={{ fontFamily: font.site, fontSize: 48, color: color.graphite }}>Geist — àâçéèêëîïôûœ «Non.» …</div>
    <div style={{ fontFamily: font.mono, fontSize: 40, color: color.mute }}>tonnom.com · 0:32</div>
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Smoke" component={Smoke} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="AvatarSheet" component={AvatarSheet} durationInFrames={1} fps={30} width={1080} height={1920} />
  </>
);
