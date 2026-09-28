import React from "react";
import { AbsoluteFill, Composition } from "remotion";
import { ensureFonts } from "./fonts";
import { TL } from "./timeline";
import { MetaAd } from "./MetaAd";
import { Subtitles } from "./Subtitles";
import { Thumbnail } from "./Thumbnail";
import { Directions, DirectionA, DirectionB, DirectionC } from "./directions/Directions";
import { AvatarsSheet, IconsSheet, UIKitSheet } from "./dev/AssetSheets";
import { PortfolioDesk, PortfolioMob } from "./dev/PortfolioPreview";

ensureFonts();

const common = { fps: TL.fps, width: TL.width, height: TL.height };

/** Program with captions burned in one pass — for previews and QA sheets only. */
const MetaAdCaptioned: React.FC = () => (
  <AbsoluteFill>
    <MetaAd />
    <Subtitles />
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <>
    {/* deliverables */}
    <Composition id="MetaAd" component={MetaAd} durationInFrames={TL.frames} {...common} />
    <Composition id="Subtitles" component={Subtitles} durationInFrames={TL.frames} {...common} />
    <Composition id="Thumbnail" component={Thumbnail} durationInFrames={1} {...common} />
    {/* creative review */}
    <Composition id="Directions" component={Directions} durationInFrames={1} fps={TL.fps} width={3240} height={1920} />
    <Composition id="DirectionA" component={DirectionA} durationInFrames={1} {...common} />
    <Composition id="DirectionB" component={DirectionB} durationInFrames={1} {...common} />
    <Composition id="DirectionC" component={DirectionC} durationInFrames={1} {...common} />
    {/* QA / dev */}
    <Composition id="MetaAdCaptioned" component={MetaAdCaptioned} durationInFrames={TL.frames} {...common} />
    <Composition id="AvatarsSheet" component={AvatarsSheet} durationInFrames={1} fps={TL.fps} width={1700} height={680} />
    <Composition id="IconsSheet" component={IconsSheet} durationInFrames={1} fps={TL.fps} width={1080} height={880} />
    <Composition id="UIKitSheet" component={UIKitSheet} durationInFrames={1} fps={TL.fps} width={1080} height={1120} />
    <Composition id="PortfolioDesk" component={PortfolioDesk} durationInFrames={1} fps={TL.fps} width={1200} height={3964} />
    <Composition id="PortfolioMob" component={PortfolioMob} durationInFrames={1} fps={TL.fps} width={390} height={2200} />
  </>
);
