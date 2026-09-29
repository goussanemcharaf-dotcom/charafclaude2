import React from "react";
import { AbsoluteFill } from "remotion";
import { bg, color, font } from "../../styles/tokens";
import * as I from "../components/ui/Icons";
import { Avatar, AvatarKind } from "../components/ui/Avatar";
import { AvatarBubble } from "../components/ui/AvatarBubble";
import { Chip, Cursor, Notification } from "../components/ui/Pointer";
import { URLBar } from "../components/ui/Frames";
import { MessageBubble, VoiceMessage } from "../components/ui/Messages";
import { FileCard, FolderCard, LinkCard, VideoCard } from "../components/workflow/Cards";
import { img } from "../components/portfolio/data";

// Visual index of the code-drawn assets (exported to assets/generated, assets/icons, assets/ui).

const Label: React.FC<{ children: React.ReactNode; dark?: boolean }> = ({ children, dark }) => (
  <div style={{ fontFamily: font.mono, fontSize: 18, color: dark ? "rgba(255,255,255,0.8)" : color.mute, marginTop: 10, textAlign: "center" }}>{children}</div>
);

const KINDS: AvatarKind[] = ["ugc", "content", "voice", "influence", "client"];
const LABELS = ["UGC\nCreator", "Content\nCreator", "Voice Over\nArtist", "Influenceur", "Client"];

export const AvatarsSheet: React.FC = () => (
  <AbsoluteFill style={{ background: bg.violet, padding: 50, boxSizing: "border-box" }}>
    <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 44, color: "#fff", letterSpacing: "-0.04em" }}>Avatars — SVG originaux</div>
    <div style={{ display: "flex", flexWrap: "nowrap", gap: 30, marginTop: 36, justifyContent: "center" }}>
      {KINDS.map((k, i) => (
        <div key={k} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <AvatarBubble kind={k} label={LABELS[i]} size={276} expression={k === "client" ? "puzzled" : "smile"} />
          <Label dark>{k}</Label>
        </div>
      ))}
    </div>
    <div style={{ display: "flex", gap: 20, marginTop: 30, justifyContent: "center" }}>
      {KINDS.map((k) => <Avatar key={k} kind={k} size={170} expression={k === "client" ? "puzzled" : "grin"} />)}
    </div>
  </AbsoluteFill>
);

export const IconsSheet: React.FC = () => {
  const icons = Object.entries(I).filter(([n]) => n.startsWith("Icon")) as Array<[string, React.FC<{ size?: number; color?: string }>]>;
  return (
    <AbsoluteFill style={{ background: "#fff", padding: 50, boxSizing: "border-box" }}>
      <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 44, color: color.ink, letterSpacing: "-0.04em" }}>Icônes — {icons.length} pictos originaux (24 px)</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 24, marginTop: 40 }}>
        {icons.map(([n, C]) => (
          <div key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 16, borderRadius: 18, background: "#F4F4F7" }}>
            <C size={56} color={color.ink} />
            <div style={{ fontFamily: font.mono, fontSize: 15, color: color.mute, marginTop: 10 }}>{n.replace("Icon", "")}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const UIKitSheet: React.FC = () => (
  <AbsoluteFill style={{ background: bg.studio, padding: 50, boxSizing: "border-box", gap: 26 }}>
    <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 44, color: color.ink, letterSpacing: "-0.04em" }}>UI kit — composants originaux</div>
    <URLBar url="tonnom.com" width={600} height={56} />
    <FileCard name="UGC_serum_final_V3 (1).mp4" ext="MP4" meta="84 Mo · modifié hier" width={620} />
    <FolderCard name="Nouveau dossier (4)" count="23 éléments" width={500} />
    <LinkCard title="Dossier partagé (copie)" url="lien-partage/…/7yq0" width={620} />
    <div style={{ display: "flex", gap: 30, alignItems: "flex-start" }}>
      <VideoCard src={img.coffee()} duration="0:45" label="Reel_cafe_v2_OK.mov" width={280} height={360} />
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Notification title="Nouveau message" body="Client : « C’est lequel, le bon fichier ? »" width={600} />
        <div style={{ width: 390, transform: "scale(1.5)", transformOrigin: "0 0", height: 180 }}>
          <MessageBubble>Tu peux m’envoyer ton travail ?</MessageBubble>
          <div style={{ height: 8 }} />
          <MessageBubble out pad={8}><VoiceMessage duration="0:32" /></MessageBubble>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          <Chip bg={color.ink}>Un fichier là.</Chip>
          <Chip bg="#fff" fg={color.ink}>WhatsApp</Chip>
        </div>
      </div>
    </div>
    <div style={{ position: "relative", height: 120 }}>
      <Cursor x={60} y={30} size={70} />
      <Cursor x={200} y={30} size={70} hand />
    </div>
  </AbsoluteFill>
);
