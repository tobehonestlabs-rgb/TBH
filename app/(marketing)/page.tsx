'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

const LandingPage: React.FC = () => {
  const [isNavVisible, setIsNavVisible] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);
  const featureRef = useRef<HTMLElement | null>(null);
  const heroSvgsRef = useRef<(HTMLImageElement | null)[]>([]);
  const featureSvgsRef = useRef<(HTMLImageElement | null)[]>([]);

  const DAMPING = 0.08;

  // ── Scroll navbar ──
  useEffect(() => {
    const handleScroll = () => {
      setIsNavVisible(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Fade‑in de tous les SVGs ──
  useEffect(() => {
    const svgs = document.querySelectorAll('.svg-deco, .svg-feature');
    svgs.forEach((el, i) => {
      const delay = 100 + i * 120;
      setTimeout(() => {
        el.classList.add('loaded');
      }, delay);
    });
  }, []);

  // ── Parallax pour le bloc héro ──
  const heroTarget = useRef({ x: 0.5, y: 0.5 });
  const heroCurrent = useRef({ x: 0.5, y: 0.5 });
  const heroFrame = useRef<number | null>(null);

  const handleHeroMove = useCallback((e: MouseEvent) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    heroTarget.current.x = (e.clientX - rect.left) / rect.width;
    heroTarget.current.y = (e.clientY - rect.top) / rect.height;
  }, []);

  const handleHeroLeave = useCallback(() => {
    heroTarget.current.x = 0.5;
    heroTarget.current.y = 0.5;
  }, []);

  // ── Parallax pour le bloc features ──
  const featureTarget = useRef({ x: 0.5, y: 0.5 });
  const featureCurrent = useRef({ x: 0.5, y: 0.5 });
  const featureFrame = useRef<number | null>(null);

  const handleFeatureMove = useCallback((e: MouseEvent) => {
    if (!featureRef.current) return;
    const rect = featureRef.current.getBoundingClientRect();
    featureTarget.current.x = (e.clientX - rect.left) / rect.width;
    featureTarget.current.y = (e.clientY - rect.top) / rect.height;
  }, []);

  const handleFeatureLeave = useCallback(() => {
    featureTarget.current.x = 0.5;
    featureTarget.current.y = 0.5;
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (hero) {
      hero.addEventListener('mousemove', handleHeroMove);
      hero.addEventListener('mouseleave', handleHeroLeave);
    }
    const feature = featureRef.current;
    if (feature) {
      feature.addEventListener('mousemove', handleFeatureMove);
      feature.addEventListener('mouseleave', handleFeatureLeave);
    }

    const heroIntensities = [20, 14, 18, 12];
    const featureIntensities = [18, 18, 14, 14]; // légèrement augmentées pour les plus grands SVGs

    function animate() {
      // Hero
      heroCurrent.current.x += (heroTarget.current.x - heroCurrent.current.x) * DAMPING;
      heroCurrent.current.y += (heroTarget.current.y - heroCurrent.current.y) * DAMPING;
      heroSvgsRef.current.forEach((el, idx) => {
        if (!el) return;
        const x = (heroCurrent.current.x - 0.5) * heroIntensities[idx] * 2;
        const y = (heroCurrent.current.y - 0.5) * heroIntensities[idx] * 2;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });

      // Features
      featureCurrent.current.x += (featureTarget.current.x - featureCurrent.current.x) * DAMPING;
      featureCurrent.current.y += (featureTarget.current.y - featureCurrent.current.y) * DAMPING;
      featureSvgsRef.current.forEach((el, idx) => {
        if (!el) return;
        const x = (featureCurrent.current.x - 0.5) * featureIntensities[idx] * 2;
        const y = (featureCurrent.current.y - 0.5) * featureIntensities[idx] * 2;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });

      heroFrame.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      if (hero) {
        hero.removeEventListener('mousemove', handleHeroMove);
        hero.removeEventListener('mouseleave', handleHeroLeave);
      }
      if (feature) {
        feature.removeEventListener('mousemove', handleFeatureMove);
        feature.removeEventListener('mouseleave', handleFeatureLeave);
      }
      if (heroFrame.current) cancelAnimationFrame(heroFrame.current);
      if (featureFrame.current) cancelAnimationFrame(featureFrame.current);
    };
  }, [handleHeroMove, handleHeroLeave, handleFeatureMove, handleFeatureLeave]);

  // ── Idées de jeux ──
  const gameIdeas = [
    'Envoie un message à ton crush',
    'Demande un avis sincère',
    'Confesse un secret',
    'Joue à "Action ou Vérité"',
    'Fais une déclaration anonyme',
    'Pose une question gênante',
  ];
  const duplicatedIdeas = [...gameIdeas, ...gameIdeas];

  // ── Bouton "Action" ──
  const handleMouseMoveBtn = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    btn.style.setProperty('--x', x + '%');
    btn.style.setProperty('--y', y + '%');
  };

  const handleMouseLeaveBtn = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    btn.style.setProperty('--x', '50%');
    btn.style.setProperty('--y', '50%');
  };

  return (
    <>
      <style>{`
        /* RESET */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          background: #000000;
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #fff;
          min-height: 100vh;
        }

        .navbar-fixed {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          padding: 12px 24px;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 4px 24px rgba(0,0,0,0.5);
          z-index: 1000;
          transform: translateY(-100%);
          opacity: 0;
          transition: transform 0.3s ease, opacity 0.3s ease;
        }

        .navbar-fixed.visible {
          transform: translateY(0);
          opacity: 1;
        }

        .nav-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nav-inner .logo-img {
          height: 32px;
          width: auto;
        }

        .cta-btn {
          position: relative;
          overflow: hidden;
          font-family: 'Outfit', sans-serif;
          background: linear-gradient(135deg, #FF6B6B, #FF4D1C);
          border: none;
          color: #000000;
          padding: 14px 40px;
          border-radius: 40px;
          font-weight: 700;
          font-size: 18px;
          cursor: pointer;
          letter-spacing: 0.3px;
          transition: transform 0.15s, box-shadow 0.2s, color 0.5s ease;
          z-index: 1;
        }

        .cta-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #000000;
          border-radius: 50%;
          transform: translate(var(--x, -50%), var(--y, -50%)) scale(0);
          transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          z-index: -1;
          pointer-events: none;
        }

        .cta-btn:hover::before {
          transform: translate(var(--x, -50%), var(--y, -50%)) scale(3);
        }

        .cta-btn:hover {
          color: white;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        }

        .navbar-inline .cta-btn {
          background: white;
          color: #000000;
        }

        .navbar-inline .cta-btn::before {
          background: #000000;
        }

        .navbar-inline .cta-btn:hover {
          color: white;
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }

        main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .block {
          border-radius: 40px;
          padding: 32px 28px;
          min-height: 320px;
        }

        .block-1 {
          background: linear-gradient(145deg, #FEA05C, #FC554F);
          min-height: 500px;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        .block-features {
          background: linear-gradient(145deg, #000000, #000000);
          min-height: 480px; /* Augmenté */
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          text-align: center;
          padding: 60px 30px; /* Augmenté */
        }

        .block-features .feature-text {
          font-family: 'Outfit', sans-serif;
          font-weight: 800;
          font-size: clamp(2.4rem, 7vw, 4.2rem); /* Augmenté */
          line-height: 1.2;
          color: #FFFFFF;
          max-width: 800px;
          z-index: 2;
          position: relative;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .navbar-inline {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          gap: 12px;
          flex-wrap: wrap;
        }

        .navbar-inline .logo-img {
          height: 34px;
          width: auto;
          flex-shrink: 0;
        }

        .nav-links-inline {
          display: flex;
          gap: 32px;
          align-items: center;
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
          font-size: 20px;
          color: rgba(255, 255, 255, 0.9);
        }

        .nav-links-inline a {
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          transition: color 0.2s ease;
          cursor: pointer;
        }

        .nav-links-inline a:hover {
          color: #000000;
        }

        .hero-text {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-family: 'Outfit', sans-serif;
          font-weight: 800;
          font-size: clamp(2.8rem, 9vw, 5.2rem);
          line-height: 1.2;
          color: #FFFFFF;
          letter-spacing: -0.02em;
          padding: 10px 0;
        }

        .hero-text span {
          display: block;
          max-width: 900px;
        }

        /* SVGs bloc 1 */
        .svg-deco {
          position: absolute;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.8s ease;
          will-change: transform;
        }

        .svg-deco.loaded {
          opacity: 1;
        }

        .svg-1 {
          z-index: 0;
          top: 40%;
          left: 2%;
          width: clamp(200px, 16vw, 260px);
          transition: transform 0.2s cubic-bezier(0.2, 0.6, 0.3, 1);
        }

        .svg-2 {
          z-index: 1;
          top: 60%;
          left: 10%;
          width: clamp(200px, 12vw, 180px);
          transition: transform 0.2s cubic-bezier(0.2, 0.6, 0.3, 1);
        }

        .svg-3 {
          z-index: 0;
          top: 35%;
          right: -3%;
          width: clamp(200px, 14vw, 240px);
          transition: transform 0.2s cubic-bezier(0.2, 0.6, 0.3, 1);
        }

        .svg-4 {
          z-index: 0;
          top: 60%;
          right: 10%;
          width: clamp(200px, 12vw, 170px);
          transition: transform 0.2s cubic-bezier(0.2, 0.6, 0.3, 1);
        }

        /* SVGs bloc 2 - AGGRANDIS */
        .svg-feature {
          position: absolute;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.8s ease;
          will-change: transform;
        }

        .svg-feature.loaded {
          opacity: 1;
        }

        .svg-5 {
          z-index: 0;
          top: 8%;
          left: 4%;
          width: clamp(200px, 18vw, 280px);
          transition: transform 0.2s cubic-bezier(0.2, 0.6, 0.3, 1);
        }

        .svg-7 {
          z-index: 0;
          top: 55%;
          left: 6%;
          width: clamp(230px, 15vw, 240px);
          transition: transform 0.2s cubic-bezier(0.2, 0.6, 0.3, 1);
        }

        .svg-6 {
          z-index: 0;
          top: 10%;
          right: 4%;
          width: clamp(140px, 18vw, 270px);
          transition: transform 0.2s cubic-bezier(0.2, 0.6, 0.3, 1);
        }

        .svg-8 {
          z-index: 0;
          top: 55%;
          right: 6%;
          width: clamp(230px, 15vw, 230px);
          transition: transform 0.2s cubic-bezier(0.2, 0.6, 0.3, 1);
        }

        .block-2 {
          background: linear-gradient(145deg, #EBD38F, #FEA05C);
        }

        .block-3 {
          background: linear-gradient(145deg, #FC554F, #FB673F);
        }

        .block-4 {
          background: linear-gradient(145deg, #FB673F, #FF6B6B);
        }

        .game-ideas {
          font-family: 'Outfit', sans-serif;
          padding: 6px 0 4px 0;
          overflow: hidden;
          white-space: nowrap;
          position: relative;
          background: transparent;
        }

        .game-ideas-track {
          display: inline-block;
          animation: scroll-ideas 28s linear infinite;
        }

        .game-ideas-item {
          display: inline-block;
          font-size: 14px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.85);
          padding: 0 16px;
          letter-spacing: 0.2px;
        }

        .game-ideas-item .separator {
          display: inline-block;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #FF6B6B;
          margin: 0 10px;
          vertical-align: middle;
        }

        @keyframes scroll-ideas {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .site-footer {
          background: #000000;
          border-top: 1px solid rgba(255, 107, 107, 0.2);
          margin-top: 40px;
          padding: 40px 16px 30px;
          font-family: 'Outfit', sans-serif;
        }

        .footer-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .footer-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 30px;
        }

        .footer-brand {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .footer-brand .logo-img {
          height: 32px;
          width: auto;
        }

        .footer-brand p {
          color: rgba(255, 255, 255, 0.4);
          font-size: 14px;
          font-weight: 400;
          max-width: 260px;
        }

        .footer-links {
          display: flex;
          gap: 40px;
          flex-wrap: wrap;
        }

        .footer-links-column {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .footer-links-column h4 {
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 2px;
        }

        .footer-links-column a {
          color: rgba(255, 255, 255, 0.4);
          text-decoration: none;
          font-size: 15px;
          font-weight: 400;
          transition: color 0.2s ease;
        }

        .footer-links-column a:hover {
          color: #FF6B6B;
        }

        .footer-social {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .footer-social a {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0);
          color: rgba(255, 255, 255, 0.6);
          transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
          text-decoration: none;
          font-size: 18px;
          font-weight: 600;
        }

        .footer-social a:hover {
          background: rgba(255, 107, 107, 0.15);
          color: #FF6B6B;
          transform: translateY(-2px);
        }

        .footer-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding-top: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .footer-bottom p {
          color: rgba(255, 255, 255, 0.25);
          font-size: 13px;
          font-weight: 400;
        }

        .footer-bottom-legal {
          display: flex;
          gap: 24px;
        }

        .footer-bottom-legal a {
          color: rgba(255, 255, 255, 0.25);
          text-decoration: none;
          font-size: 13px;
          font-weight: 400;
          transition: color 0.2s ease;
        }

        .footer-bottom-legal a:hover {
          color: rgba(255, 255, 255, 0.7);
        }

        @media (max-width: 768px) {
          .hero-text {
            font-size: clamp(2.2rem, 8vw, 3.5rem);
          }
          .block-features .feature-text {
            font-size: clamp(1.8rem, 5.5vw, 3rem);
          }

          .navbar-inline {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .nav-links-inline {
            flex-wrap: wrap;
            gap: 18px;
            font-size: 18px;
          }

          .block {
            padding: 20px 18px;
            min-height: 220px;
          }

          .block-1 {
            min-height: 380px;
          }

          .block-features {
            min-height: 350px;
            padding: 40px 20px;
          }

          .nav-inner {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .game-ideas-item {
            font-size: 13px;
            padding: 0 10px;
          }

          .game-ideas-item .separator {
            width: 4px;
            height: 4px;
            margin: 0 6px;
          }

          .cta-btn {
            padding: 12px 28px;
            font-size: 16px;
          }

          .footer-top {
            flex-direction: column;
            align-items: flex-start;
          }

          .footer-links {
            gap: 24px;
          }

          .footer-bottom {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .svg-1 {
            top: 4%;
            left: 2%;
            width: clamp(50px, 18vw, 80px);
          }

          .svg-2 {
            top: 24%;
            left: 6%;
            width: clamp(40px, 12vw, 60px);
          }

          .svg-3 {
            top: 6%;
            right: 2%;
            width: clamp(46px, 16vw, 70px);
          }

          .svg-4 {
            top: 26%;
            right: 6%;
            width: clamp(36px, 10vw, 55px);
          }

          .svg-5 {
            top: 4%;
            left: 2%;
            width: clamp(60px, 16vw, 100px);
          }
          .svg-7 {
            top: 50%;
            left: 4%;
            width: clamp(50px, 13vw, 80px);
          }
          .svg-6 {
            top: 6%;
            right: 2%;
            width: clamp(60px, 16vw, 100px);
          }
          .svg-8 {
            top: 50%;
            right: 4%;
            width: clamp(50px, 13vw, 80px);
          }
        }

        @media (max-width: 480px) {
          .svg-1 { width: 40px; left: 1%; }
          .svg-2 { width: 28px; left: 4%; }
          .svg-3 { width: 36px; right: 1%; }
          .svg-4 { width: 24px; right: 4%; }

          .svg-5 { width: 45px; left: 1%; }
          .svg-7 { width: 36px; left: 3%; }
          .svg-6 { width: 45px; right: 1%; }
          .svg-8 { width: 36px; right: 3%; }
        }
      `}</style>

      {/* Navbar fixe */}
      <nav className={`navbar-fixed ${isNavVisible ? 'visible' : ''}`}>
        <div className="nav-inner">
          <img src="assets/landingpage_logo.svg" alt="TBH" className="logo-img" />
          <button className="cta-btn">Rejoins tes potes</button>
        </div>
      </nav>

      <main>
        {/* Idées de jeux */}
        <div className="game-ideas">
          <div className="game-ideas-track">
            {duplicatedIdeas.map((idea, index) => (
              <span key={index} className="game-ideas-item">
                <span className="separator"></span> {idea}
              </span>
            ))}
          </div>
        </div>

        {/* Bloc 1 (Hero) */}
        <section className="block block-1" ref={heroRef}>
          <img
            src="/assets/Hollow_Yvann.svg"
            alt=""
            className="svg-deco svg-1"
            ref={(el) => { heroSvgsRef.current[0] = el; }}
          />
          <img
            src="/assets/basketBall.svg"
            alt=""
            className="svg-deco svg-2"
            ref={(el) => { heroSvgsRef.current[1] = el; }}
          />
          <img
            src="/assets/Smoothy.svg"
            alt=""
            className="svg-deco svg-3"
            ref={(el) => { heroSvgsRef.current[2] = el; }}
          />
          <img
            src="/assets/Naomie.svg"
            alt=""
            className="svg-deco svg-4"
            ref={(el) => { heroSvgsRef.current[3] = el; }}
          />

          <div className="hero-content">
            <nav className="navbar-inline">
              <img src="assets/landingpage_logo.svg" alt="TBH" className="logo-img" />
              <div className="nav-links-inline">
                <a href="#">À propos</a>
                <a href="#">Blog</a>
                <a href="#">Sécurité</a>
                <a href="#">Contact</a>
              </div>
              <button
                className="cta-btn"
                onMouseMove={handleMouseMoveBtn}
                onMouseLeave={handleMouseLeaveBtn}
              >
                Rejoins tes potes
              </button>
            </nav>

            <div className="hero-text">
              <span>
                Amuse toi<br />
                réellement<br />
                avec<br />
                tes potes.
              </span>
            </div>
          </div>
        </section>

        {/* NOUVEAU BLOC : features */}
        <section className="block block-features" ref={featureRef}>
          <img
            src="/assets/Ana.svg"
            alt=""
            className="svg-feature svg-5"
            ref={(el) => { featureSvgsRef.current[0] = el; }}
          />
          <img
            src="/assets/Aira.svg"
            alt=""
            className="svg-feature svg-6"
            ref={(el) => { featureSvgsRef.current[1] = el; }}
          />
          <img
            src="/assets/Dinosaure.svg"
            alt=""
            className="svg-feature svg-7"
            ref={(el) => { featureSvgsRef.current[2] = el; }}
          />
          <img
            src="/assets/Cap.svg"
            alt=""
            className="svg-feature svg-8"
            ref={(el) => { featureSvgsRef.current[3] = el; }}
          />

          <div className="feature-text">
            reçois<br /> des messages<br /> anonymes<br />
            et chat<br /> avec eux
          </div>
        </section>

        {/* Bloc 2 */}
        <section className="block block-2"></section>

        {/* Bloc 3 */}
        <section className="block block-3"></section>

        {/* Bloc 4 */}
        <section className="block block-4"></section>
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <img src="assets/landingpage_logo.svg" alt="TBH" className="logo-img" />
              <p>Des messages anonymes, des conversations sincères.</p>
            </div>
            <div className="footer-links">
              <div className="footer-links-column">
                <h4>Découvrir</h4>
                <a href="#">À propos</a>
                <a href="#">Blog</a>
                <a href="#">Sécurité</a>
              </div>
              <div className="footer-links-column">
                <h4>Support</h4>
                <a href="#">Contact</a>
                <a href="#">FAQ</a>
                <a href="#">Mentions légales</a>
              </div>
            </div>
            <div className="footer-social">
              <a href="#" aria-label="Instagram">IG</a>
              <a href="#" aria-label="TikTok">TT</a>
              <a href="#" aria-label="X">X</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 TBH. Tous droits réservés.</p>
            <div className="footer-bottom-legal">
              <a href="#">Confidentialité</a>
              <a href="#">Cookies</a>
              <a href="#">CGU</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default LandingPage;