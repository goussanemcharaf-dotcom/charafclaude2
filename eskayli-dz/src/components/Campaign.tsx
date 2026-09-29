import React from "react";
import { Img, staticFile } from "remotion";
import { color, font } from "../lib/tokens";
import { clamp, ease, invLerp, lerp } from "../lib/anim";
import { Bar, Dot, Mono, Panel, Pill } from "./base";
import { IconChat, IconEye, IconTarget, IconUsers } from "./Icons";

// A fictional campaign manager ("Gestionnaire de campagnes") in Eskayli's own dark style.
// Inspired by how ad platforms structure campaigns — NOT a copy of any official interface.

export type Creative = {
  img?: string; // assets/images/*.jpg
  sector: string; // mono label
  headline: string;
  cta: string;
  tone?: string; // background tone when no image
};

export const CREATIVES: Record<string, Creative> = {
  shop: { img: "ad_shop.jpg", sector: "E-commerce", headline: "La nouvelle collection est en ligne", cta: "Acheter" },
  clinic: { img: "ad_clinic.jpg", sector: "Clinique", headline: "Prenez rendez-vous en ligne", cta: "Réserver" },
  food: { img: "ad_food.jpg", sector: "Restaurant", headline: "Réservez votre table ce soir", cta: "Réserver" },
  estate: { img: "ad_estate.jpg", sector: "Immobilier", headline: "Visitez votre futur appartement", cta: "En savoir plus" },
  beauty: { img: "ad_beauty.jpg", sector: "Beauté", headline: "Votre routine, enfin simple", cta: "Découvrir" },
  service: { img: "ad_service.jpg", sector: "Services", headline: "Demandez votre devis", cta: "Envoyer un message" },
  local: { img: "ad_local.jpg", sector: "Commerce local", headline: "Ouvert près de chez vous", cta: "Itinéraire" },
};

/** A fictional sponsored post (dark), used in phones and boards. `scale` 1 = 440 px wide. */
export const AdPost: React.FC<{ c: Creative; w?: number; highlight?: number; brand?: string; style?: React.CSSProperties }> = ({
  c, w = 440, highlight = 0, brand, style,
}) => {
  const k = w / 440;
  return (
    <div
      style={{
        width: w, borderRadius: 26 * k, overflow: "hidden", background: "#141416",
        border: `${1.5 * k}px solid ${highlight > 0 ? `rgba(255,90,31,${0.3 + 0.7 * clamp(highlight)})` : color.line2}`,
        fontFamily: font.sans, color: color.paper, boxShadow: "0 30px 60px -30px rgba(0,0,0,0.8)", ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 * k, padding: `${16 * k}px ${18 * k}px` }}>
        <div style={{ width: 44 * k, height: 44 * k, borderRadius: "50%", background: color.panel3, display: "grid", placeItems: "center",
          fontSize: 18 * k, fontWeight: 700, color: color.paperDim }}>
          {(brand ?? c.sector).slice(0, 1)}
        </div>
        <div style={{ lineHeight: 1.15 }}>
          <div style={{ fontSize: 20 * k, fontWeight: 650 }}>{brand ?? `Votre marque · ${c.sector}`}</div>
          <div style={{ fontSize: 16 * k, color: color.mist }}>Sponsorisé</div>
        </div>
      </div>
      <div style={{ width: w, height: w * 0.9, background: c.tone ?? "#1c1c20", position: "relative", overflow: "hidden" }}>
        {c.img && <Img src={staticFile(`assets/images/${c.img}`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 * k, padding: `${16 * k}px ${18 * k}px` }}>
        <div style={{ fontSize: 21 * k, fontWeight: 650, lineHeight: 1.2, maxWidth: w * 0.56 }}>{c.headline}</div>
        <div style={{ fontSize: 17 * k, fontWeight: 650, padding: `${10 * k}px ${16 * k}px`, borderRadius: 12 * k,
          background: highlight > 0.5 ? color.signal : color.panel3, color: highlight > 0.5 ? "#160800" : color.paper, whiteSpace: "nowrap" }}>
          {c.cta}
        </div>
      </div>
    </div>
  );
};

/** Minimal phone frame (no brand). Children fill the screen. */
export const Phone: React.FC<{ w?: number; children?: React.ReactNode; style?: React.CSSProperties; screen?: string }> = ({
  w = 420, children, style, screen = "#0E0E10",
}) => {
  const h = w * 2.05;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.14, padding: w * 0.028, boxSizing: "border-box",
      background: "linear-gradient(160deg, #2A2A2E 0%, #151517 60%, #0E0E10 100%)", boxShadow: "0 60px 120px -40px rgba(0,0,0,0.9), inset 0 0 0 1.5px rgba(255,255,255,0.10)", ...style }}>
      <div style={{ width: "100%", height: "100%", borderRadius: w * 0.115, overflow: "hidden", background: screen, position: "relative" }}>
        <div style={{ position: "absolute", top: w * 0.03, left: "50%", transform: "translateX(-50%)", width: w * 0.28, height: w * 0.07,
          borderRadius: 99, background: "#000", zIndex: 5 }} />
        {children}
      </div>
    </div>
  );
};

/** One row of the campaign tree. */
const TreeRow: React.FC<{ level: number; label: string; name: string; on: number; t: number; at: number }> = ({ level, label, name, on, t, at }) => {
  const p = ease.outExpo(invLerp(at, at + 0.5, t));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 18px", marginLeft: level * 34, borderRadius: 16,
      background: on > 0 ? `rgba(255,90,31,${0.08 * on})` : "rgba(255,255,255,0.025)", border: `1.5px solid ${on > 0.5 ? color.signalLine : color.line}`,
      opacity: p, transform: `translateX(${(1 - p) * -30}px)` }}>
      <Dot on={on > 0.5} size={12} />
      <div style={{ lineHeight: 1.2 }}>
        <Mono size={17}>{label}</Mono>
        <div style={{ fontFamily: font.sans, fontSize: 26, fontWeight: 600, color: color.paper }}>{name}</div>
      </div>
    </div>
  );
};

/**
 * The campaign board (hook). `t` = global time; `at` = when it assembles; `budget` 0..1 fill of the budget
 * field; `status` "draft" | "active"; `cutoff` dims everything but the budget (tension).
 */
export const CampaignBoard: React.FC<{
  t: number; at: number; budget: number; active: boolean; pulse?: number; creative: Creative; focus?: number;
}> = ({ t, at, budget, active, pulse, creative, focus = 0 }) => {
  const p = (d: number) => ease.outExpo(invLerp(at + d, at + d + 0.6, t));
  const dim = (on: boolean) => (on ? 1 : lerp(1, 0.35, focus));
  return (
    <div style={{ position: "absolute", left: 60, top: 0, width: 960, fontFamily: font.sans, color: color.paper }}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", opacity: p(0) * dim(false) }}>
        <div>
          <Mono size={20}>Gestionnaire de campagnes</Mono>
          <div style={{ fontSize: 44, fontWeight: 750, letterSpacing: "-0.03em", marginTop: 6 }}>Campagne · Acquisition</div>
        </div>
        <Pill tone={active ? "signal" : "line"} size={26}>
          <Dot on={active} size={12} pulse={active ? pulse : undefined} />
          {active ? "Active" : "Brouillon"}
        </Pill>
      </div>
      <div style={{ display: "flex", gap: 28, marginTop: 34 }}>
        {/* tree */}
        <div style={{ width: 430, display: "flex", flexDirection: "column", gap: 14, opacity: dim(false) }}>
          <TreeRow t={t} at={at + 0.1} level={0} label="Campagne" name="Acquisition · Meta Ads" on={active ? 1 : 0} />
          <TreeRow t={t} at={at + 0.2} level={1} label="Ensemble de publicités" name="Audience principale" on={active ? 1 : 0} />
          <TreeRow t={t} at={at + 0.3} level={2} label="Publicité" name="Créative A" on={active ? 1 : 0} />
          <TreeRow t={t} at={at + 0.4} level={2} label="Publicité" name="Créative B" on={0} />
          {/* fields */}
          <Panel w={430} pad={24} style={{ marginTop: 12, opacity: p(0.45) }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}><IconTarget s={30} c={color.mist} /><Mono size={18}>Objectif</Mono>
                <span style={{ marginLeft: "auto", fontSize: 24, fontWeight: 650 }}>Prospects</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}><IconUsers s={30} c={color.mist} /><Mono size={18}>Audience</Mono>
                <span style={{ marginLeft: "auto", fontSize: 24, fontWeight: 650 }}>Algérie · 25–54</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}><IconEye s={30} c={color.mist} /><Mono size={18}>Placements</Mono>
                <span style={{ marginLeft: "auto", fontSize: 24, fontWeight: 650 }}>Facebook · Instagram</span></div>
            </div>
          </Panel>
        </div>
        {/* preview + budget */}
        <div style={{ width: 502, display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ opacity: p(0.25) * dim(false) }}>
            <AdPost c={creative} w={502} highlight={active ? 0.3 : 0} />
          </div>
          <Panel w={502} pad={26} active={budget > 0 ? 1 : 0} style={{ opacity: p(0.5) }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Mono size={19} c={color.paperDim}>Budget publicitaire</Mono>
              <IconChat s={0} />
            </div>
            <Bar p={budget} w={450} h={14} style={{ marginTop: 18 }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
              <Mono size={16}>Quotidien</Mono>
              <Mono size={16} c={color.signal}>{budget > 0.02 ? "En diffusion" : "—"}</Mono>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
};

/** Metric tile without numbers (concept only): label + animated sparkline. */
export const SignalTile: React.FC<{ label: string; icon: React.ReactNode; p: number; on: boolean; w?: number }> = ({ label, icon, p, on, w = 210 }) => {
  const pts = Array.from({ length: 12 }, (_, i) => {
    const x = (i / 11) * (w - 40);
    const y = 46 - (Math.sin(i * 1.3) * 6 + i * 2.6) * clamp(p * 1.2 - i / 24);
    return `${x},${y}`;
  }).join(" ");
  return (
    <Panel w={w} pad={20} active={on ? 1 : 0}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>{icon}<Mono size={17} c={on ? color.paper : color.mist}>{label}</Mono></div>
      <svg width={w - 40} height={56} style={{ marginTop: 10 }}>
        <polyline points={pts} fill="none" stroke={on ? color.signal : color.mist2} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Panel>
  );
};
