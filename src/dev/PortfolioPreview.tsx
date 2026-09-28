import React from "react";
import { AbsoluteFill } from "remotion";
import { PortfolioPage } from "../components/portfolio/PortfolioPage";
import { PortfolioMobile } from "../components/portfolio/PortfolioMobile";

export const PortfolioDesk: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff" }}>
    <PortfolioPage />
  </AbsoluteFill>
);

export const PortfolioMob: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff" }}>
    <PortfolioMobile />
  </AbsoluteFill>
);
