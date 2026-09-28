import React from "react";
import { bg } from "../../styles/tokens";
import { clamp, invLerp, keys, wobble } from "../components/motion/anim";
import { WorkflowLayer } from "./S02Workflow";
import { ChaosLayer } from "./S03Chaos";
import { ConfusionLayer } from "./S04Confusion";
import { Fill, SceneProps } from "./shared";

// S02 -> S04 share one physical space (the creator's messy workspace), so
// every element persists and the clutter keeps accumulating. A handheld
// camera adds pressure as the chaos grows.
export const Workspace: React.FC<SceneProps> = ({ t }) => {
  const zoom = keys(t, [[8.3, 1], [11.1, 1.045], [13.9, 1.07], [14.49, 1.13]]);
  const shake = keys(t, [[8.2, 0], [10.9, 4], [13.8, 4.5], [14.49, 9]]);
  const x = wobble(t, 11, 5.3) * shake;
  const y = wobble(t, 23, 4.7) * shake;
  const r = wobble(t, 5, 3.1) * shake * 0.06;
  const dim = clamp(invLerp(13.95, 14.49, t)) * 0.12;
  return (
    <Fill bg={bg.studio}>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${x}px, ${y}px) rotate(${r}deg) scale(${zoom})`, transformOrigin: "540px 820px" }}>
        <WorkflowLayer t={t} />
        <ChaosLayer t={t} />
        <ConfusionLayer t={t} />
      </div>
      {dim > 0 && <div style={{ position: "absolute", inset: 0, background: `rgba(11,11,18,${dim})` }} />}
    </Fill>
  );
};
