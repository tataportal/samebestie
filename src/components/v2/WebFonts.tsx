import React, { useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * Injects Google Fonts <link> into the document head on web.
 * No-op on native (falls back to system fonts).
 */
export function V2WebFonts() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const id = 'v2-google-fonts';
    if (document.getElementById(id)) return;

    // Preconnect
    const pre1 = document.createElement('link');
    pre1.rel = 'preconnect';
    pre1.href = 'https://fonts.googleapis.com';
    document.head.appendChild(pre1);

    const pre2 = document.createElement('link');
    pre2.rel = 'preconnect';
    pre2.href = 'https://fonts.gstatic.com';
    pre2.crossOrigin = '';
    document.head.appendChild(pre2);

    // Fraunces variable (display) + DM Sans + JetBrains Mono
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?' +
      'family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,300..700,0..100,0..1;1,9..144,300..700,0..100,0..1&' +
      'family=DM+Sans:opsz,wght@9..40,400..700&' +
      'family=JetBrains+Mono:wght@400..700&' +
      'display=swap';
    document.head.appendChild(link);

    // Inject grain texture as CSS once (used by PaperLayer)
    if (!document.getElementById('v2-grain-style')) {
      const style = document.createElement('style');
      style.id = 'v2-grain-style';
      style.textContent = `
        @keyframes v2grain {
          0%, 100% { transform: translate(0, 0); }
          10%  { transform: translate(-5%, -10%); }
          20%  { transform: translate(-15%, 5%); }
          30%  { transform: translate(7%, -25%); }
          40%  { transform: translate(-5%, 25%); }
          50%  { transform: translate(-15%, 10%); }
          60%  { transform: translate(15%, 0%); }
          70%  { transform: translate(0%, 15%); }
          80%  { transform: translate(3%, 35%); }
          90%  { transform: translate(-10%, 10%); }
        }
        .v2-grain::before {
          content: "";
          position: absolute;
          inset: -100%;
          background-image: url("data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 0.08  0 0 0 0 0.13  0 0 0 0 0.22  0 0 0 0.75 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
          opacity: 0.08;
          mix-blend-mode: multiply;
          pointer-events: none;
          animation: v2grain 8s steps(10) infinite;
        }
        .v2-paper-fade::after {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 50% 0%, rgba(242,70,46,0.04) 0%, transparent 50%),
                      radial-gradient(ellipse at 100% 100%, rgba(31,89,54,0.04) 0%, transparent 45%),
                      radial-gradient(ellipse at 0% 100%, rgba(217,153,46,0.035) 0%, transparent 50%);
          pointer-events: none;
        }
        /* tabular figures for timer */
        .v2-tabular { font-variant-numeric: tabular-nums; }
        /* wonky Fraunces axes for display flair */
        .v2-wonk { font-variation-settings: "SOFT" 50, "WONK" 1, "opsz" 144; }
        .v2-soft { font-variation-settings: "SOFT" 100, "WONK" 0, "opsz" 144; }

        /* ── PHONE FRAME ON DESKTOP ───────────────── */
        @media (min-width: 520px) {
          html, body {
            background: #D4C7A8 !important;
            overflow: hidden !important;
            height: 100vh !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          #root {
            width: 390px !important;
            height: 844px !important;
            max-height: 90vh !important;
            margin: 0 auto !important;
            border-radius: 40px;
            border: 3px solid #14203A;
            box-shadow:
              0 0 0 2px #C9BCA0,
              0 20px 60px rgba(20,32,58,0.3);
            overflow: hidden !important;
            position: relative;
          }
          /* notch */
          #root::before {
            content: "";
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 130px;
            height: 28px;
            background: #14203A;
            border-radius: 0 0 18px 18px;
            z-index: 99999;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return null;
}
