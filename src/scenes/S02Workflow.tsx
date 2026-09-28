import React from "react";
import { color } from "../../styles/tokens";
import { cue } from "../timeline";
import { clamp, ease, invLerp, prog, springy } from "../components/motion/anim";
import { MobileFrame } from "../components/ui/Frames";
import { Chip } from "../components/ui/Pointer";
import { IconFolder, IconLink } from "../components/ui/Icons";
import { MessageBubble, VoiceMessage, VideoAttachment, LinkLine } from "../components/ui/Messages";
import { DriveWindow } from "../components/workflow/DriveWindow";
import { ChatScreen, ChatMsg } from "../components/workflow/ChatScreen";
import { LinkCard } from "../components/workflow/Cards";
import { Slam } from "../components/motion/Slam";
import { img } from "../components/portfolio/data";
import { QuestionHeadline, SceneProps } from "./shared";

// S02 — CURRENT WORKFLOW (light studio). "…et que tu envoies encore ton travail
// entre Google Drive, WhatsApp et plusieurs liens…" A 2.5D layered workspace:
// generic file browser, a chat on a phone, loose links.

export const S02_HEADLINE_OUT = 8.26;

const popChip = (t: number, at: number) => {
  const s = springy(t, at, { stiffness: 380, damping: 17 });
  return { transform: `scale(${0.4 + 0.6 * s})`, opacity: clamp(invLerp(at, at + 0.07, t)) };
};

export const WorkflowLayer: React.FC<SceneProps> = ({ t }) => {
  // headline travels from the centre (continuity with S01) to the top
  const hm = prog(t, 5.72, 0.5, ease.inOutCubic);
  // file browser enters from the left, in perspective
  const dw = prog(t, 5.86, 0.62, ease.outExpo);
  // phone rises from the bottom
  const ph = prog(t, cue("whatsapp") - 0.3, 0.6, ease.outExpo);
  const chatAt = cue("whatsapp") - 0.22;
  const msgs: ChatMsg[] = [
    { at: chatAt, out: false, h: 58, node: <MessageBubble>Tu peux m'envoyer ton travail ?</MessageBubble> },
    { at: chatAt + 0.28, out: true, h: 168, node: <MessageBubble out pad={5}><VideoAttachment src={img.coffee()} duration="0:45" width={236} height={156} /></MessageBubble> },
    { at: chatAt + 0.52, out: true, h: 54, node: <MessageBubble out pad={8}><VoiceMessage duration="0:32" played={0} width={214} /></MessageBubble> },
    { at: cue("liens") - 0.2, out: true, h: 72, node: <MessageBubble out><LinkLine label="Le reste est ici :" url="lien-partage/…/x8k2" /></MessageBubble> },
  ];
  return (
    <>
      <div
        style={{
          position: "absolute", left: 40, top: 560, perspective: 1600,
          transform: `translateX(${(1 - dw) * -820}px)`, opacity: clamp(dw * 3),
        }}
      >
        <div style={{ transform: `rotateY(${6 + (1 - dw) * 16}deg) rotateZ(${-1.2}deg)`, transformOrigin: "0% 50%" }}>
          <DriveWindow width={690} />
        </div>
      </div>
      <div
        style={{
          position: "absolute", left: 664, top: 560, transform: `translateY(${(1 - ph) * 1300}px) rotate(${3 + (1 - ph) * 10}deg)`,
          opacity: t < cue("whatsapp") - 0.3 ? 0 : 1,
        }}
      >
        <MobileFrame width={380}>
          <ChatScreen t={t} messages={msgs} theme="chat" title="Client" subtitle="en ligne" />
        </MobileFrame>
      </div>
      {/* loose links */}
      {[0, 1, 2].map((i) => (
        <Slam
          key={i} t={t} at={cue("liens") - 0.14 + i * 0.11} x={[70, 118, 52][i]} y={[944, 1040, 1136][i]}
          rot={[-4, 3, -2][i]} from={[-900, 260]} fromRot={-20} z={5 + i}
        >
          <LinkCard
            title={["Vidéos — dossier partagé", "Démo voix (nouveau lien)", "Photos — lien 2"][i]}
            url={["lien-partage/…/x8k2", "lien-partage/…/q41m", "lien-partage/…/0vz7"][i]}
            width={520}
          />
        </Slam>
      ))}
      {/* kinetic tags on the spoken names */}
      <div style={{ position: "absolute", left: 70, top: 510, zIndex: 20, ...popChip(t, cue("drive") - 0.04) }}>
        <Chip bg="#fff" fg={color.ink} size={42} icon={<IconFolder size={40} color={color.driveBlue} stroke={2.2} />}>Google Drive</Chip>
      </div>
      <div style={{ position: "absolute", left: 640, top: 510, zIndex: 20, ...popChip(t, cue("whatsapp") - 0.04) }}>
        <Chip bg="#fff" fg={color.ink} size={42} icon={<div style={{ width: 20, height: 20, borderRadius: 10, background: color.chatGreen }} />}>WhatsApp</Chip>
      </div>
      <div style={{ position: "absolute", left: 470, top: 880, zIndex: 9, ...popChip(t, cue("liens") - 0.02) }}>
        <Chip bg={color.ink} fg="#fff" size={42} icon={<IconLink size={38} color="#fff" stroke={2.3} />}>+ plusieurs liens</Chip>
      </div>
      <QuestionHeadline
        t={t} ink={color.ink} accent={color.violet} dy={hm * -560} scale={1 - 0.22 * hm}
        exit={{ at: S02_HEADLINE_OUT, dur: 0.28 }}
      />
    </>
  );
};

export const S02Workflow = WorkflowLayer;
