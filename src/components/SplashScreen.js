import React from "react";
import "./SplashScreen.css";

const SplashScreen = () => {
  return (
    <div className="rvx-splash">
      <div className="rvx-bg-grid"></div>
      <div className="rvx-vignette"></div>

      <div className="rvx-orb rvx-orb-1"></div>
      <div className="rvx-orb rvx-orb-2"></div>
      <div className="rvx-orb rvx-orb-3"></div>

      <div className="rvx-particles">
        {Array.from({ length: 26 }).map((_, index) => (
          <span key={index}></span>
        ))}
      </div>

      <div className="rvx-center">
        <div className="rvx-logo-stage">
          <div className="rvx-ring rvx-ring-1"></div>
          <div className="rvx-ring rvx-ring-2"></div>
          <div className="rvx-ring rvx-ring-3"></div>

          <div className="rvx-logo-core">
            <img
              src="/rehanverse-logo.png"
              alt="REHANVERSE Logo"
              className="rvx-logo"
            />
            <div className="rvx-logo-shine"></div>
          </div>
        </div>

        <div className="rvx-title-wrap">
          <h1 className="rvx-title">
            <span>REHAN</span>
            <span>VERSE</span>
          </h1>
          <div className="rvx-title-line"></div>
        </div>

        <p className="rvx-subtitle">Initializing your premium learning universe</p>

        <div className="rvx-loader">
          <div className="rvx-loader-fill"></div>
        </div>

        <div className="rvx-status">
          <span></span>
          Securing content • Loading courses • Preparing dashboard
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;