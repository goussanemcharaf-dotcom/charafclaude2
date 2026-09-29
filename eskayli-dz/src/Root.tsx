import React from "react";
import { AbsoluteFill, Composition } from "remotion";
import { ensureFonts } from "./fonts";
import { TL } from "./timeline";
import { Film } from "./Film";
import { Subtitles } from "./Subtitles";
import { Thumbnail } from "./Thumbnail";

ensureFonts();

const common = { fps: TL.fps, width: TL.width, height: TL.height };

/** Program with subtitles in one pass — previews and QA sheets only. */
const FilmCaptioned: React.FC = () => (
  <AbsoluteFill>
    <Film />
    <Subtitles />
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Film" component={Film} durationInFrames={TL.frames} {...common} />
    <Composition id="Subtitles" component={Subtitles} durationInFrames={TL.frames} {...common} />
    <Composition id="Thumbnail" component={Thumbnail} durationInFrames={1} {...common} />
    <Composition id="FilmCaptioned" component={FilmCaptioned} durationInFrames={TL.frames} {...common} />
  </>
);
