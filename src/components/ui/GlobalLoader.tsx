import React from 'react';

interface GlobalLoaderProps {
  text?: string;
}

export default function GlobalLoader({ text = 'Loading' }: GlobalLoaderProps) {
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        .mv-global-loader-wrapper {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(15, 15, 20, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .mv-loader-container {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .mv-spinner-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 90px;
          height: 90px;
        }

        .mv-pulse-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 2px solid rgba(245, 197, 24, 0.3);
          animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }

        .mv-pulse-ring:nth-child(1) {
          animation-delay: 0s;
        }

        .mv-pulse-ring:nth-child(2) {
          animation-delay: 0.6s;
        }
        
        .mv-pulse-ring:nth-child(3) {
          animation-delay: 1.2s;
        }

        @keyframes pulse-ring {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 1;
            border-width: 4px;
          }
          100% {
            transform: translate(-50%, -50%) scale(2.5);
            opacity: 0;
            border-width: 1px;
          }
        }

        .mv-logo-core {
          position: relative;
          z-index: 10;
          width: 90px;
          height: 90px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 18px;
          box-shadow: 0 0 35px rgba(245, 197, 24, 0.3), inset 0 0 10px rgba(255,255,255,0.05);
          animation: float-core 3s ease-in-out infinite;
          background: #000;
          overflow: hidden;
          border: 1px solid rgba(245, 197, 24, 0.4);
        }

        .mv-logo-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          animation: pulse-glow 2.5s infinite alternate;
        }

        @keyframes float-core {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes pulse-glow {
          0% { filter: brightness(1) drop-shadow(0 0 0 rgba(245,197,24,0)); }
          100% { filter: brightness(1.15) drop-shadow(0 0 8px rgba(245,197,24,0.4)); }
        }

        .mv-loading-text {
          margin-top: 40px;
          font-size: 1.125rem;
          font-weight: 700;
          font-family: Outfit, sans-serif;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          background: linear-gradient(90deg, #f5c518 0%, #fff 50%, #f5c518 100%);
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          animation: shimmer-text 2.5s linear infinite;
        }

        @keyframes shimmer-text {
          to {
            background-position: 200% center;
          }
        }
        `
      }} />

      <div className="mv-global-loader-wrapper">
        <div className="mv-loader-container">
          <div className="mv-spinner-wrapper">
            <div className="mv-pulse-ring" />
            <div className="mv-pulse-ring" />
            <div className="mv-pulse-ring" />
            
            <div className="mv-logo-core">
              <img src="/images/logo.jpg" alt="Logo" className="mv-logo-image" />
            </div>
          </div>

          <div className="mv-loading-text">
            {text}
          </div>
        </div>
      </div>
    </>
  );
}
