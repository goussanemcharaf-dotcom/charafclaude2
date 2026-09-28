import React from "react";
import { color } from "../../styles/tokens";
import { cue } from "../timeline";
import { clamp, ease, invLerp, springy } from "../components/motion/anim";
import { Slam } from "../components/motion/Slam";
import { MotionBlur } from "../components/motion/MotionBlur";
import { Chip, Notification } from "../components/ui/Pointer";
import { VoiceMessage } from "../components/ui/Messages";
import { FileCard, FolderCard, LinkCard, ScreenshotCard, VideoCard } from "../components/workflow/Cards";
import { img } from "../components/portfolio/data";
import { SceneProps } from "./shared";

// S03 — CHAOS. "Une vidéo ici. Un fichier là. Un autre lien ailleurs."
// Each spoken item slams in where the voice says it is (ici / là / ailleurs),
// then the clutter accelerates: notifications, duplicates, screenshots.

export const S03_LABELS_OUT = 11.12;

type Item = { at: number; x: number; y: number; rot: number; from: [number, number]; fromRot?: number; node: React.ReactNode; jitter?: number };

export const CHAOS_ITEMS = (): Item[] => [
  // the three spoken items
  { at: cue("video") - 0.06, x: 96, y: 404, rot: -7, from: [-700, -600], fromRot: -30, jitter: 2,
    node: <VideoCard src={img.coffee()} duration="0:45" label="Reel_cafe_v2_OK.mov" width={292} height={380} pos="50% 45%" /> },
  { at: cue("fichier") - 0.06, x: 452, y: 812, rot: 5, from: [900, 60], fromRot: 25, jitter: 2,
    node: <FileCard name="UGC_serum_final_V3 (1).mp4" ext="MP4" meta="84 Mo · modifié hier" width={560} /> },
  { at: cue("autre_lien") - 0.06, x: 70, y: 1062, rot: -3, from: [-200, 900], fromRot: -12, jitter: 2,
    node: <LinkCard title="Dossier partagé (copie)" url="lien-partage/…/7yq0" width={540} /> },
  // accelerating clutter
  { at: 8.98, x: 590, y: 372, rot: 6, from: [800, -300], fromRot: 20, jitter: 2.5,
    node: <FolderCard name="Nouveau dossier (4)" count="23 éléments" width={400} /> },
  { at: 9.62, x: 744, y: 1000, rot: 8, from: [700, 500], fromRot: 30, jitter: 3,
    node: <ScreenshotCard src={img.skincare()} width={230} height={300} /> },
  { at: 9.9, x: 470, y: 1128, rot: -5, from: [600, 700], fromRot: -20, jitter: 3,
    node: (
      <div style={{ background: "#fff", borderRadius: 40, padding: "16px 22px", boxShadow: "0 20px 40px -16px rgba(20,16,40,0.35)" }}>
        <div style={{ transform: "scale(1.45)", transformOrigin: "0 0", width: 214 * 1.45, height: 34 * 1.45 }}>
          <VoiceMessage duration="0:32" played={0} width={214} />
        </div>
      </div>
    ) },
  { at: 10.5, x: 362, y: 540, rot: -6, from: [-900, 100], fromRot: -30, jitter: 3.5,
    node: <FileCard name="Demo_voix_FINAL_ok.wav" ext="WAV" meta="11 Mo" width={500} /> },
  { at: 10.68, x: 48, y: 690, rot: -10, from: [-700, 300], fromRot: -30, jitter: 3.5,
    node: <ScreenshotCard src={img.voice()} width={210} height={280} /> },
  { at: 10.84, x: 560, y: 660, rot: 4, from: [700, -400], fromRot: 25, jitter: 4,
    node: <LinkCard title="portfolio_v2.pdf" url="lien-partage/…/p0r7" width={460} tint={color.notifRed} /> },
  { at: 11.0, x: 150, y: 918, rot: 7, from: [-300, 900], fromRot: 20, jitter: 4,
    node: <FolderCard name="Vidéos_UGC_2025" count="41 éléments" width={400} /> },
];

const NOTIFS = [
  { at: 8.78, x: 260, title: "Nouveau message", body: "Client : « C'est lequel, le bon fichier ? »" },
  { at: 10.34, x: 200, title: "Lien expiré", body: "Ce lien de partage n'est plus disponible." },
];

const LABELS = [
  { text: "Une vidéo ici.", at: cue("video") + 0.04, x: 64, y: 300, from: [-500, 0] as [number, number] },
  { text: "Un fichier là.", at: cue("fichier") + 0.04, x: 470, y: 704, from: [500, 0] as [number, number] },
  { text: "Un autre lien ailleurs.", at: cue("autre_lien") + 0.04, x: 60, y: 1196, from: [0, 360] as [number, number] },
];

export const ChaosLayer: React.FC<SceneProps> = ({ t }) => (
  <>
    {CHAOS_ITEMS().map((it, i) => (
      <Slam key={i} t={t} at={it.at} x={it.x} y={it.y} rot={it.rot} from={it.from} fromRot={it.fromRot} jitter={it.jitter} seed={i * 5} z={10 + i}>
        {it.node}
      </Slam>
    ))}
    {NOTIFS.map((n, i) => {
      if (t < n.at) return null;
      const s = springy(t, n.at, { stiffness: 260, damping: 20 });
      const out = clamp(invLerp(n.at + 1.1, n.at + 1.35, t));
      if (out >= 1) return null;
      return (
        <div key={i} style={{ position: "absolute", left: n.x, top: 250 + (1 - s) * -220 - out * 220, zIndex: 40, opacity: 1 - out }}>
          <Notification title={n.title} body={n.body} width={600} app="Messages" />
        </div>
      );
    })}
    {LABELS.map((l, i) => {
      if (t < l.at) return null;
      const k = ease.outExpo(clamp(invLerp(l.at, l.at + 0.36, t)));
      const s = springy(t, l.at, { stiffness: 330, damping: 16 });
      const out = ease.inExpo(clamp(invLerp(S03_LABELS_OUT, S03_LABELS_OUT + 0.22, t)));
      const blur = (1 - k) * 24 + out * 24;
      return (
        <div
          key={i}
          style={{
            position: "absolute", left: l.x, top: l.y, zIndex: 60,
            transform: `translate(${l.from[0] * (1 - k)}px, ${l.from[1] * (1 - k) - out * 60}px) scale(${0.7 + 0.3 * s})`,
            transformOrigin: "0% 50%", opacity: 1 - out,
          }}
        >
          <MotionBlur x={l.from[0] !== 0 ? blur : 0} y={l.from[1] !== 0 || out > 0 ? blur : 0}>
            <Chip bg={color.ink} fg="#fff" size={62} style={{ padding: "22px 36px", boxShadow: "0 24px 50px -18px rgba(10,10,20,0.55)" }}>{l.text}</Chip>
          </MotionBlur>
        </div>
      );
    })}
  </>
);

export const S03Chaos = ChaosLayer;
