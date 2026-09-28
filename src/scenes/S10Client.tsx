import React from "react";
import { Img } from "remotion";
import { bg, color, font } from "../../styles/tokens";
import { cue } from "../timeline";
import { clamp, ease, invLerp, lerp, prog } from "../components/motion/anim";
import { MotionBlur } from "../components/motion/MotionBlur";
import { Rings } from "../components/motion/Shapes";
import { MobileFrame } from "../components/ui/Frames";
import { MessageBubble } from "../components/ui/Messages";
import { Tap } from "../components/ui/Pointer";
import { ChatScreen, ChatMsg } from "../components/workflow/ChatScreen";
import { PortfolioMobile } from "../components/portfolio/PortfolioMobile";
import { img, persona } from "../components/portfolio/data";
import { Fill, SceneProps } from "./shared";

// S10 — THE CLIENT OPENS IT. "Ton client clique. Et découvre un portfolio…"
// The link lands in a DM; one tap; the portfolio opens and scrolls.

const PHONE = { x: 320, y: 330, w: 440 };
const K = PHONE.w / 430; // frame scale
const SCREEN_K = ((430 - 26) / 390) * K; // phone design px -> screen px
const toScreen = (x: number, y: number): [number, number] => [PHONE.x + 13 * K + x * SCREEN_K, PHONE.y + 13 * K + y * SCREEN_K];

const PREVIEW = { x: 390 - 12 - 262, y: 130 + 58 + 8 + 46 + 8, w: 262, h: 238 }; // link preview rect (phone px)
export const S10_TAP = cue("clique") - 0.02;
const OPEN_AT = S10_TAP + 0.1;
export const S11_ZOOM = 31.28;

export const ClientPhone: React.FC<{ t: number }> = ({ t }) => {
  const msgs: ChatMsg[] = [
    { at: 28.9, out: false, h: 58, node: <MessageBubble theme="dm">Tu as un portfolio ?</MessageBubble> },
    { at: 29.56, out: true, h: 46, node: <MessageBubble theme="dm" out>Oui, tout est ici :</MessageBubble> },
    {
      at: 29.66, out: true, h: PREVIEW.h,
      node: (
        <MessageBubble theme="dm" out pad={6} maxWidth={PREVIEW.w}>
          <div style={{ width: PREVIEW.w - 12, borderRadius: 13, overflow: "hidden", background: "#fff" }}>
            <div style={{ height: 150, overflow: "hidden" }}>
              <Img src={img.hero()} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 26%" }} />
            </div>
            <div style={{ padding: "9px 11px 10px" }}>
              <div style={{ fontFamily: font.ui, fontSize: 14.5, fontWeight: 700, color: color.ink, lineHeight: 1.25 }}>{persona.name} — UGC Creator & Voice Over</div>
              <div style={{ fontFamily: font.ui, fontSize: 12.5, color: color.mute, marginTop: 4 }}>{persona.url}</div>
            </div>
          </div>
        </MessageBubble>
      ),
    },
  ];
  const open = prog(t, OPEN_AT, 0.46, ease.inOutCubic);
  const scroll = lerp(0, 600, prog(t, cue("decouvre") - 0.04, 0.8, ease.inOutCubic));
  // open the page from the preview's rectangle to the full screen
  const L = lerp(PREVIEW.x, 0, open), T = lerp(PREVIEW.y, 0, open);
  const R = lerp(390 - PREVIEW.x - PREVIEW.w, 0, open), B = lerp(844 - PREVIEW.y - PREVIEW.h, 0, open);
  return (
    <MobileFrame width={PHONE.w} statusDark>
      <ChatScreen t={t} theme="dm" title="Client" subtitle="en ligne" messages={msgs} />
      {open > 0 && (
        <div style={{ position: "absolute", inset: 0, clipPath: `inset(${T}px ${R}px ${B}px ${L}px round ${lerp(16, 0, open)}px)` }}>
          <div style={{ position: "absolute", inset: 0, background: "#F4F1EC" }} />
          <div style={{ transform: `translateY(${-scroll}px)`, opacity: clamp(open * 3) }}>
            <PortfolioMobile played={clamp(invLerp(30.9, 31.6, t)) * 0.6} />
          </div>
        </div>
      )}
    </MobileFrame>
  );
};

export const ClientScene: React.FC<SceneProps> = ({ t }) => {
  const circle = prog(t, 29.26, 0.6, ease.outExpo);
  const rise = prog(t, 29.34, 0.56, ease.outExpo);
  const riseV = (prog(t, 29.34, 0.56, ease.outExpo) - prog(t - 1 / 60, 29.34, 0.56, ease.outExpo)) * 1500 * 60;
  const zoom = prog(t, S11_ZOOM, 0.38, ease.inExpo);
  const [tx, ty] = toScreen(PREVIEW.x + PREVIEW.w / 2, PREVIEW.y + 110);
  const backdrop = 1 - clamp(invLerp(S11_ZOOM + 0.1, S11_ZOOM + 0.34, t));
  return (
    <Fill bg="transparent">
      <div style={{ position: "absolute", inset: 0, background: bg.studio, opacity: backdrop }} />
      <div style={{ position: "absolute", opacity: backdrop, left: 540 - 780 * circle, top: 830 - 780 * circle, width: 1560 * circle, height: 1560 * circle, borderRadius: "50%", background: "#FFFFFF" }} />
      <Rings t={t} cx={540} cy={830} base={280} gap={92} count={8} opacity={clamp(invLerp(29.4, 29.8, t)) * backdrop} />
      <div
        style={{
          position: "absolute", left: 0, top: 0, width: 1080, height: 1920,
          transform: `translateY(${(1 - rise) * 1500}px) scale(${1 + zoom * 1.5})`, transformOrigin: "540px 800px",
          opacity: 1 - clamp(invLerp(S11_ZOOM + 0.16, S11_ZOOM + 0.36, t)),
        }}
      >
        <MotionBlur y={Math.min(60, Math.abs(riseV) * 0.012) + zoom * 30}>
          <div style={{ position: "absolute", left: PHONE.x, top: PHONE.y }}>
            <ClientPhone t={t} />
          </div>
          <Tap x={tx} y={ty} p={clamp(invLerp(S10_TAP - 0.04, S10_TAP + 0.45, t))} size={120} />
        </MotionBlur>
      </div>
    </Fill>
  );
};

export const S10Client = ClientScene;
