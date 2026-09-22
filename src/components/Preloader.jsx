import React, { useState, useEffect } from 'react';
import loaderLogo from '../assets/sfd-logo-loader.png';
import '../styles/preloader.css';

export default function Preloader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      const increment = Math.floor(Math.random() * 8) + 4;
      currentProgress = Math.min(currentProgress + increment, 100);
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          handleFinish();
        }, 400);
      }
    }, 60);

    // Click anywhere or press key to enter
    const handleKeyDown = () => handleFinish();
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleFinish = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 750); // Matches fade-out duration
  };

  return (
    <div
      className={`sfd-preloader ${isExiting ? 'fade-out' : ''}`}
      onClick={handleFinish}
      title="Click or press any key to enter"
    >
      {/* Exact Middle Logo */}
      <div className="preloader-center-wrap">
        <img
          src={loaderLogo}
          alt="Software Freedom Day 26"
          className="preloader-main-logo"
        />
      </div>

      {/* Minimal Bottom Loading Bar */}
      <div className="preloader-bottom-line-wrap">
        <div className="preloader-minimal-track">
          <div
            className="preloader-minimal-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
