'use client';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// ─── Constantes de timing pour le mockup ───
const TYPING_DURATION = 2200;
const MIN_DELAY_BETWEEN_MSGS = 2000;
const MAX_DELAY_BETWEEN_MSGS = 3200;
const PAUSE_BETWEEN_CONVERSATIONS = 5000;
const INITIAL_DELAY = 1200;

// ─── Définition des groupes de SVGs ───
const svgGroupsData = [
  // Groupe 1
  [
    '/assets/Chance-friend.svg',
    '/assets/Louisiana.svg',
    '/assets/Message one (2).svg',
    '/assets/Message two.svg',
  ],
  // Groupe 2
  [
    '/assets/Maris.svg',
    '/assets/Tania.svg',
    '/assets/Message three.svg',
    '/assets/Message four.svg',
  ],
  // Groupe 3
  [
    '/assets/Chance-friend.svg',
    '/assets/Tania.svg',
    '/assets/Message five.svg',
    '/assets/Message two.svg',
  ],
];

// ─── Positions fixes pour chaque groupe ───
const getFixedPositions = (groupIndex: number) => {
  const offsets = [
    { top: 12, left: 4 },   // Groupe 1
    { top: 8, left: 6 },    // Groupe 2
    { top: 15, left: 3 },   // Groupe 3
  ];
  const off = offsets[groupIndex % offsets.length];

  return [
    { top: `${off.top}%`, left: `${off.left}%`, right: undefined, bottom: undefined },
    { top: `${off.top + 38}%`, left: `${off.left + 2}%`, right: undefined, bottom: undefined },
    { top: `${off.top + 4}%`, left: undefined, right: `${off.left + 2}%`, bottom: undefined },
    { top: `${off.top + 42}%`, left: undefined, right: `${off.left}%`, bottom: undefined },
  ];
};

// ─── Tailles et rotations fixes ───
const getSvgStyles = (index: number) => {
  const sizes = [
    'clamp(90px, 14vw, 220px)',
    'clamp(80px, 12vw, 180px)',
    'clamp(100px, 15vw, 240px)',
    'clamp(85px, 13vw, 190px)',
  ];
  const rotations = [-8, 6, -12, 10];
  const delays = [0.2, 1.0, 0.5, 1.5];
  return {
    size: sizes[index % sizes.length],
    rotation: rotations[index % rotations.length],
    delay: delays[index % delays.length],
  };
};

const LandingPage: React.FC = () => {
  const router = useRouter();
  const handleJoin = () => {
    router.push('/sign-up');
  };
  const [isNavVisible, setIsNavVisible] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);
  const featureRef = useRef<HTMLElement | null>(null);
  const heroSvgsRef = useRef<(HTMLImageElement | null)[]>([]);
  const featureSvgsRef = useRef<(HTMLImageElement | null)[]>([]);

  // ─── Références pour le mockup ───
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const typingIndicatorRef = useRef<HTMLDivElement>(null);
  const conversationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ─── Références pour l'effet "follow cursor" ───
  const heroContentRef = useRef<HTMLDivElement>(null);
  const featureContentRef = useRef<HTMLDivElement>(null);

  const DAMPING = 0.08;

  // ─── État du slider ───
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // ─── État du mockup ───
  const [currentConvIndex, setCurrentConvIndex] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // ─── État pour l'effet "follow cursor" ───
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [targetPos, setTargetPos] = useState({ x: 0, y: 0 });

  // ─── Conversations ───
  const conversations = useMemo(() => [
    // Conversation 1 – Flirt
    [
      { sender: 'Anonyme', text: 'J’aime tes yeux, ils sont beaux à regarder.', time: '21:04', type: 'received' },
      { sender: 'Moi', text: 'Ah bon ? Tu me connais ?', time: '21:05', type: 'sent' },
      { sender: 'Anonyme', text: 'Je te vois tous les jours à la fac, tu es toujours seul à la bibliothèque.', time: '21:07', type: 'received' },
      { sender: 'Moi', text: 'Et tu n’oses pas venir me parler ?', time: '21:08', type: 'sent' },
      { sender: 'Anonyme', text: 'Pas encore. Mais peut-être un jour, si tu réponds à ce message.', time: '21:10', type: 'received' }
    ],
    // Conversation 2 – Humour
    [
      { sender: 'Anonyme', text: 'Ton chien est trop mignon !', time: '18:23', type: 'received' },
      { sender: 'Moi', text: 'Mais je n’ai pas de chien…', time: '18:24', type: 'sent' },
      { sender: 'Anonyme', text: 'Ah mince, je me suis trompé de personne !', time: '18:25', type: 'received' },
      { sender: 'Moi', text: 'Haha, mais tu peux garder le compliment, je le prends.', time: '18:26', type: 'sent' },
      { sender: 'Anonyme', text: 'Bon, alors ton sourire est mignon aussi, même sans chien.', time: '18:28', type: 'received' }
    ],
    // Conversation 3 – Sincère
    [
      { sender: 'Anonyme', text: 'Je voulais te dire que tu es la personne la plus intéressante que j’ai rencontrée.', time: '23:12', type: 'received' },
      { sender: 'Moi', text: 'C’est gentil… mais qui es-tu ?', time: '23:13', type: 'sent' },
      { sender: 'Anonyme', text: 'Quelqu’un qui t’observe depuis longtemps, sans oser te parler.', time: '23:15', type: 'received' },
      { sender: 'Moi', text: 'Ça fait un peu flippant, non ?', time: '23:16', type: 'sent' },
      { sender: 'Anonyme', text: 'Pas de panique, je suis inoffensif. Juste un admirateur timide.', time: '23:18', type: 'received' }
    ]
  ], []);

  // ─── Changement du slider toutes les 10 secondes ───
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentGroupIndex((prev) => (prev + 1) % svgGroupsData.length);
        setIsTransitioning(false);
      }, 600);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // ─── Scroll navbar ──
  useEffect(() => {
    const handleScroll = () => {
      setIsNavVisible(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ─── Fade‑in de tous les SVGs ──
  useEffect(() => {
    const svgs = document.querySelectorAll('.svg-deco, .svg-feature, .slider-svg');
    svgs.forEach((el, i) => {
      const delay = 100 + i * 120;
      setTimeout(() => {
        el.classList.add('loaded');
      }, delay);
    });
  }, []);

  // ─── Effet "follow cursor" ──
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setTargetPos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // ─── Animation de suivi du curseur ───
  useEffect(() => {
    let frameId: number;

    const animate = () => {
      setMousePos((prev) => ({
        x: prev.x + (targetPos.x - prev.x) * DAMPING * 1.5,
        y: prev.y + (targetPos.y - prev.y) * DAMPING * 1.5,
      }));
      frameId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(frameId);
  }, [targetPos]);

  // ─── Parallax héro ──
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

  // ── Parallax features ──
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

  // ── Animation parallax ──
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
    const featureIntensities = [18, 18, 14, 14];

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

  // ─── Fonctions du mockup ───
  const addMessage = useCallback((msg: any) => {
    if (!chatBodyRef.current) return;
    const div = document.createElement('div');
    div.className = `message ${msg.type}`;
    div.innerHTML = `
      <span class="sender">${msg.sender}</span>
      ${msg.text}
      <span class="time">${msg.time}</span>
    `;
    chatBodyRef.current.insertBefore(div, typingIndicatorRef.current);
    chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, []);

  const clearChat = useCallback(() => {
    if (!chatBodyRef.current) return;
    const messages = chatBodyRef.current.querySelectorAll('.message');
    messages.forEach(el => el.remove());
    if (typingIndicatorRef.current) {
      typingIndicatorRef.current.style.display = 'none';
    }
  }, []);

  // ─── Fonction récursive pour afficher le prochain message ───
  const showNextMessage = useCallback(() => {
    const conv = conversations[currentConvIndex];
    if (!conv || msgIndex >= conv.length) {
      conversationTimerRef.current = setTimeout(() => {
        setCurrentConvIndex((prev) => (prev + 1) % conversations.length);
        setMsgIndex(0);
        clearChat();
        conversationTimerRef.current = setTimeout(() => {
          setIsPlaying(true);
          showNextMessage();
        }, 500);
      }, PAUSE_BETWEEN_CONVERSATIONS);
      return;
    }

    const msg = conv[msgIndex];
    const isReceived = msg.type === 'received';

    if (isReceived) {
      if (typingIndicatorRef.current) {
        typingIndicatorRef.current.style.display = 'flex';
      }
      if (chatBodyRef.current) {
        chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
      }

      conversationTimerRef.current = setTimeout(() => {
        if (typingIndicatorRef.current) {
          typingIndicatorRef.current.style.display = 'none';
        }
        addMessage(msg);
        setMsgIndex((prev) => prev + 1);
        const delay = MIN_DELAY_BETWEEN_MSGS + Math.random() * (MAX_DELAY_BETWEEN_MSGS - MIN_DELAY_BETWEEN_MSGS);
        conversationTimerRef.current = setTimeout(showNextMessage, delay);
      }, TYPING_DURATION);
    } else {
      addMessage(msg);
      setMsgIndex((prev) => prev + 1);
      const delay = MIN_DELAY_BETWEEN_MSGS + Math.random() * (MAX_DELAY_BETWEEN_MSGS - MIN_DELAY_BETWEEN_MSGS);
      conversationTimerRef.current = setTimeout(showNextMessage, delay);
    }
  }, [currentConvIndex, msgIndex, conversations, addMessage, clearChat]);

  // ─── Démarrer la conversation au montage ───
  useEffect(() => {
    if (isPlaying) {
      if (conversationTimerRef.current) {
        clearTimeout(conversationTimerRef.current);
        conversationTimerRef.current = null;
      }
      conversationTimerRef.current = setTimeout(showNextMessage, INITIAL_DELAY);
    }
    return () => {
      if (conversationTimerRef.current) {
        clearTimeout(conversationTimerRef.current);
        conversationTimerRef.current = null;
      }
    };
  }, [isPlaying, showNextMessage]);

  // ─── Idées de jeux ──
  const gameIdeas = [
    'Envoie un message à ton crush',
    'Demande un avis sincère',
    'Confesse un secret',
    'Joue à "Action ou Vérité"',
    'Fais une déclaration anonyme',
    'Pose une question gênante',
  ];
  const duplicatedIdeas = [...gameIdeas, ...gameIdeas];

  // ─── Bouton "Action" ──
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

  const heroTransform = `translate(${mousePos.x * 8}px, ${mousePos.y * 6}px)`;
  const featureTransform = `translate(${mousePos.x * 6}px, ${mousePos.y * 4}px)`;

  return (
    <>
      <style>{`
        /* ─── POLICE OUTFIT FORCÉE, SANS FALLBACK ─── */
        * {
          font-family: 'Outfit' !important;
        }

        body {
          background: #000000;
          color: #fff;
          min-height: 100vh;
        }

        /* ─── RÉINITIALISATION POUR TOUS LES ÉLÉMENTS TEXTUELS ─── */
        input,
        textarea,
        button,
        select,
        a,
        p,
        span,
        div,
        h1,
        h2,
        h3,
        h4,
        h5,
        h6,
        li,
        label,
        ::placeholder {
          font-family: 'Outfit' !important;
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
          background: linear-gradient(145deg, #EBD38F, #FEA05C, #FC554F, #FB673F);
          min-height: 500px;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        .block-features {
          background: linear-gradient(145deg, #000000, #000000);
          min-height: 480px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          text-align: center;
          padding: 60px 30px;
        }

        .block-features .feature-text {
          font-weight: 800;
          font-size: clamp(2.4rem, 7vw, 4.2rem);
          line-height: 1.2;
          color: #FFFFFF;
          max-width: 800px;
          z-index: 2;
          position: relative;
        }

        /* ─── TROISIÈME BLOC ─── */
        .block-3 {
          background: linear-gradient(145deg, #000000, #000000);
          min-height: 460px;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }

        .slider-container {
          width: 100%;
          max-width: 1100px;
          height: 280px;
          overflow: hidden;
          position: relative;
        }

        .slider-track {
          display: flex;
          width: 100%;
          height: 100%;
          transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          will-change: transform;
        }

        .slider-group {
          flex: 0 0 100%;
          position: relative;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .slider-svg {
          position: absolute;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.8s ease;
          will-change: transform;
        }

        .slider-svg.loaded {
          opacity: 1;
        }

        .slider-svg.floating {
          animation: float 4.5s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(var(--rot, 0deg)); }
          50% { transform: translateY(-14px) rotate(var(--rot, 0deg)); }
        }

        .messagerie-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-weight: 800;
          font-size: clamp(2.4rem, 7vw, 4.5rem);
          color: #FFFFFF;
          text-align: center;
          z-index: 10;
          letter-spacing: -0.02em;
          line-height: 1.2;
          text-shadow: 0 4px 30px rgba(0,0,0,0.8);
          pointer-events: none;
          width: 90%;
          max-width: 800px;
        }

        /* ─── QUATRIÈME BLOC : Dégradé + bouton ─── */
        .block-4 {
          background: linear-gradient(145deg, #EBD38F, #FEA05C, #FC554F, #FB673F);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          min-height: 600px;
          gap: 30px;
        }

        .phone-mockup-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .phone-mockup {
          width: 320px;
          background: #121212;
          border-radius: 48px;
          padding: 16px;
          box-shadow: 0 30px 60px rgba(0,0,0,0.8), 0 0 0 2px #2A2A2A inset;
          position: relative;
        }

        .phone-notch {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: 100px;
          height: 20px;
          background: #0A0A0A;
          border-radius: 20px;
          z-index: 10;
        }

        .phone-screen {
          background: #FFFFFF;
          border-radius: 32px;
          overflow: hidden;
          position: relative;
        }

        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px 10px 16px;
          background: #F8F8F8;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }
        .chat-header .back { color: #FF4D1C; font-size: 18px; font-weight: 600; cursor: default; }
        .chat-header .title { font-weight: 700; font-size: 16px; color: #0D0D0D; letter-spacing: -0.3px; }
        .chat-header .title span { color: #FF4D1C; }
        .chat-header .actions { color: #999; font-size: 18px; cursor: default; }

        .chat-body {
          padding: 12px 12px 8px 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-height: 400px;
          max-height: 480px;
          overflow-y: auto;
          background: #FFFFFF;
          position: relative;
        }

        .message {
          max-width: 80%;
          padding: 10px 14px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.4;
          word-wrap: break-word;
          opacity: 0;
          transform: translateY(12px);
          animation: messageIn 0.4s ease forwards;
        }

        .message.received {
          align-self: flex-start;
          background: #F1F1F1;
          color: #0D0D0D;
          border-bottom-left-radius: 4px;
        }

        .message.sent {
          align-self: flex-end;
          background: linear-gradient(135deg, #FF6B6B, #FF4D1C);
          color: #FFFFFF;
          border-bottom-right-radius: 4px;
        }

        .message .sender {
          font-size: 11px;
          font-weight: 600;
          opacity: 0.6;
          margin-bottom: 2px;
          display: block;
        }
        .message.received .sender { color: #555; }
        .message.sent .sender { color: rgba(255,255,255,0.7); }

        .message .time {
          font-size: 9px;
          opacity: 0.5;
          margin-top: 4px;
          text-align: right;
          display: block;
        }
        .message.received .time { color: #888; }
        .message.sent .time { color: rgba(255,255,255,0.6); }

        .typing-indicator {
          align-self: flex-start;
          background: #F1F1F1;
          padding: 12px 16px;
          border-radius: 18px;
          border-bottom-left-radius: 4px;
          display: none;
          gap: 4px;
          align-items: center;
          margin-top: 4px;
        }

        .typing-indicator .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #888;
          animation: dotPulse 1.2s infinite ease-in-out;
        }
        .typing-indicator .dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator .dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes dotPulse {
          0%, 60%, 100% { transform: scale(0.8); opacity: 0.3; }
          30% { transform: scale(1.2); opacity: 1; }
        }

        @keyframes messageIn {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .chat-footer {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px 14px 12px;
          background: #FFFFFF;
          border-top: 1px solid rgba(0, 0, 0, 0.06);
        }
        .chat-footer .input-field {
          flex: 1;
          background: #F2F2F2;
          border: none;
          border-radius: 24px;
          padding: 10px 16px;
          font-size: 13px;
          color: #0D0D0D;
          outline: none;
        }
        .chat-footer .input-field::placeholder { color: #999; }
        .chat-footer .send-btn {
          background: linear-gradient(135deg, #FF6B6B, #FF4D1C);
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 18px;
          cursor: default;
          flex-shrink: 0;
        }

        .chat-body::-webkit-scrollbar { width: 3px; }
        .chat-body::-webkit-scrollbar-track { background: transparent; }
        .chat-body::-webkit-scrollbar-thumb { background: #D0D0D0; border-radius: 10px; }

        /* Bouton "Rejoins le fun" */
        .block-4 .cta-btn {
          background: linear-gradient(135deg, #0D0D0D, #1A1A1A);
          color: #FFFFFF;
          font-size: 20px;
          padding: 16px 48px;
          border-radius: 40px;
          border: none;
          cursor: pointer;
          font-weight: 700;
          transition: transform 0.15s, box-shadow 0.2s;
          letter-spacing: 0.3px;
          position: relative;
          overflow: hidden;
          z-index: 1;
        }

        .block-4 .cta-btn::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 200%;
          height: 200%;
          background: #FFFFFF;
          border-radius: 50%;
          transform: translate(-50%, -50%) scale(0);
          transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          z-index: -1;
        }

        .block-4 .cta-btn:hover::before {
          transform: translate(-50%, -50%) scale(1);
        }

        .block-4 .cta-btn:hover {
          transform: scale(1.04);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
          color: #000000;
        }

        /* ─── Autres blocs ─── */
        .hero-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          flex: 1;
          transition: transform 0.1s ease-out;
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

        .hero-text {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
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

        /* SVGs bloc 2 */
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

        .game-ideas {
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

        /* ─── Footer ─── */
        .site-footer {
          background: #000000;
          border-top: 1px solid rgba(255, 107, 107, 0.2);
          margin-top: 40px;
          padding: 60px 16px 40px;
        }

        .footer-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .footer-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 40px;
        }

        .footer-brand {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .footer-brand .logo-img {
          height: 40px;
          width: auto;
        }

        .footer-brand p {
          color: rgba(255, 255, 255, 0.4);
          font-size: 15px;
          font-weight: 400;
          max-width: 280px;
          line-height: 1.5;
        }

        .footer-links {
          display: flex;
          gap: 50px;
          flex-wrap: wrap;
        }

        .footer-links-column {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .footer-links-column h4 {
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 4px;
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
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.06);
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
          padding-top: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .footer-bottom p {
          color: rgba(255, 255, 255, 0.25);
          font-size: 13px;
          font-weight: 400;
        }

        .footer-bottom-legal {
          display: flex;
          gap: 28px;
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

        /* ─── RESPONSIVE : MOBILE ─── */
        @media (max-width: 768px) {
          main {
            padding: 16px 20px;
            gap: 24px;
          }
          .block {
            padding: 28px 24px;
            min-height: 280px;
          }
          .block-1 {
            min-height: 420px;
          }
          .block-features {
            min-height: 360px;
            padding: 48px 24px;
          }
          .block-features .feature-text {
            font-size: clamp(2rem, 6vw, 3.2rem);
          }
          .block-3 {
            min-height: 380px;
            padding: 32px 16px;
          }
          .slider-container {
            height: 240px;
          }
          .slider-svg {
            width: clamp(140px, 35vw, 240px) !important;
          }
          .messagerie-text {
            font-size: clamp(2rem, 5vw, 3rem);
          }
          .block-4 {
            min-height: 540px;
            padding: 32px 16px;
            gap: 32px;
          }
          .phone-mockup {
            width: 300px;
            padding: 14px;
          }
          .chat-body {
            min-height: 320px;
            max-height: 380px;
          }
          .message {
            font-size: 15px;
            padding: 10px 14px;
          }
          .chat-header .title {
            font-size: 16px;
          }
          .chat-footer .input-field {
            font-size: 14px;
            padding: 10px 16px;
          }
          .chat-footer .send-btn {
            width: 40px;
            height: 40px;
            font-size: 17px;
          }
          .block-4 .cta-btn {
            font-size: 18px;
            padding: 16px 40px;
          }

          .hero-text {
            font-size: clamp(2.4rem, 8vw, 4rem);
            padding: 12px 0;
          }
          .hero-text span {
            max-width: 100%;
          }

          /* ─── SVGs encore plus grands ─── */
          .svg-1 {
            top: 4%;
            left: 2%;
            width: clamp(160px, 40vw, 280px);
          }
          .svg-2 {
            top: 24%;
            left: 6%;
            width: clamp(130px, 32vw, 220px);
          }
          .svg-3 {
            top: 6%;
            right: 2%;
            width: clamp(150px, 38vw, 260px);
          }
          .svg-4 {
            top: 26%;
            right: 6%;
            width: clamp(120px, 30vw, 200px);
          }
          .svg-5 {
            top: 4%;
            left: 2%;
            width: clamp(150px, 38vw, 260px);
          }
          .svg-7 {
            top: 50%;
            left: 4%;
            width: clamp(130px, 32vw, 220px);
          }
          .svg-6 {
            top: 6%;
            right: 2%;
            width: clamp(150px, 38vw, 260px);
          }
          .svg-8 {
            top: 50%;
            right: 4%;
            width: clamp(130px, 32vw, 220px);
          }

          .game-ideas-item {
            font-size: 15px;
            padding: 0 14px;
          }
          .game-ideas-item .separator {
            width: 6px;
            height: 6px;
            margin: 0 8px;
          }

          .navbar-inline {
            flex-direction: row;
            align-items: center;
            gap: 16px;
          }
          .navbar-inline .logo-img {
            height: 32px;
          }
          .cta-btn {
            padding: 12px 32px;
            font-size: 16px;
          }

          .footer-top {
            flex-direction: column;
            align-items: flex-start;
            gap: 32px;
          }
          .footer-links {
            gap: 32px;
          }
          .footer-bottom {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .footer-brand .logo-img {
            height: 36px;
          }
          .footer-brand p {
            font-size: 15px;
          }

          .nav-inner {
            flex-direction: row;
            align-items: center;
            gap: 16px;
          }
          .nav-inner .logo-img {
            height: 32px;
          }
          .navbar-fixed {
            padding: 12px 20px;
          }

          /* Désactiver follow cursor sur mobile */
          .hero-content {
            transform: none !important;
          }
          .feature-text {
            transform: none !important;
          }

          /* ─── Animation flottante sur mobile ─── */
          .svg-deco,
          .svg-feature,
          .slider-svg {
            animation: float 4.5s ease-in-out infinite;
          }
          .svg-deco.loaded,
          .svg-feature.loaded,
          .slider-svg.loaded {
            opacity: 1;
          }
        }

        @media (max-width: 480px) {
          .block {
            padding: 20px 16px;
            min-height: 240px;
          }
          .block-1 {
            min-height: 360px;
          }
          .block-features {
            min-height: 320px;
            padding: 36px 16px;
          }
          .block-3 {
            min-height: 320px;
            padding: 24px 12px;
          }
          .slider-container {
            height: 200px;
          }
          .slider-svg {
            width: clamp(120px, 30vw, 200px) !important;
          }
          .messagerie-text {
            font-size: clamp(1.6rem, 4.5vw, 2.6rem);
          }
          .block-4 {
            min-height: 480px;
            padding: 24px 12px;
          }
          .phone-mockup {
            width: 260px;
            padding: 12px;
          }
          .chat-body {
            min-height: 260px;
            max-height: 320px;
          }
          .message {
            font-size: 14px;
            padding: 8px 12px;
          }
          .chat-header .title {
            font-size: 14px;
          }
          .chat-footer .input-field {
            font-size: 13px;
            padding: 8px 14px;
          }
          .chat-footer .send-btn {
            width: 36px;
            height: 36px;
            font-size: 15px;
          }
          .block-4 .cta-btn {
            font-size: 16px;
            padding: 14px 32px;
          }

          .hero-text {
            font-size: clamp(2rem, 7vw, 3.2rem);
          }
          .navbar-inline .logo-img {
            height: 28px;
          }
          .cta-btn {
            padding: 10px 24px;
            font-size: 14px;
          }
          .game-ideas-item {
            font-size: 13px;
          }
          .footer-brand .logo-img {
            height: 32px;
          }
          .footer-links-column a {
            font-size: 13px;
          }
          .footer-bottom p,
          .footer-bottom-legal a {
            font-size: 12px;
          }

          .svg-1 {
            width: clamp(120px, 32vw, 200px);
          }
          .svg-2 {
            width: clamp(100px, 26vw, 160px);
          }
          .svg-3 {
            width: clamp(110px, 30vw, 180px);
          }
          .svg-4 {
            width: clamp(90px, 24vw, 140px);
          }
          .svg-5 {
            width: clamp(110px, 30vw, 180px);
          }
          .svg-7 {
            width: clamp(100px, 26vw, 160px);
          }
          .svg-6 {
            width: clamp(110px, 30vw, 180px);
          }
          .svg-8 {
            width: clamp(100px, 26vw, 160px);
          }
        }
      `}</style>

      {/* Navbar fixe */}
      <nav className={`navbar-fixed ${isNavVisible ? 'visible' : ''}`}>
        <div className="nav-inner">
          <img src="assets/landingpage_logo.svg" alt="TBH" className="logo-img" />
          <button className="cta-btn" onClick={handleJoin}>
            Rejoins tes potes
          </button>
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

          <div className="hero-content" ref={heroContentRef} style={{ transform: heroTransform }}>
            <nav className="navbar-inline">
              <img src="assets/landingpage_logo.svg" alt="TBH" className="logo-img" />
              <button
                className="cta-btn"
                onMouseMove={handleMouseMoveBtn}
                onMouseLeave={handleMouseLeaveBtn}
                onClick={handleJoin}
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

        {/* Bloc 2 (Features) */}
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

          <div className="feature-text" ref={featureContentRef} style={{ transform: featureTransform }}>
            reçois des messages anonymes<br />
            et chat avec eu
          </div>
        </section>

        {/* Bloc 3 (Slider) */}
        <section className="block block-3">
          <div className="slider-container">
            <div
              className="slider-track"
              style={{ transform: `translateX(-${currentGroupIndex * 100}%)` }}
            >
              {svgGroupsData.map((group, groupIdx) => {
                const positions = getFixedPositions(groupIdx);
                return (
                  <div key={groupIdx} className="slider-group">
                    {group.map((src, svgIdx) => {
                      const pos = positions[svgIdx] || {};
                      const style = getSvgStyles(svgIdx);
                      return (
                        <img
                          key={svgIdx}
                          src={src}
                          alt=""
                          className="slider-svg floating"
                          style={{
                            position: 'absolute',
                            top: pos.top || 'auto',
                            left: pos.left || 'auto',
                            right: pos.right || 'auto',
                            bottom: pos.bottom || 'auto',
                            width: style.size,
                            transform: `rotate(${style.rotation}deg)`,
                            animationDelay: `${style.delay}s`,
                            '--rot': `${style.rotation}deg`,
                          } as React.CSSProperties}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="messagerie-text">remplie ta messagerie</div>
        </section>

        {/* Bloc 4 (Mockup téléphone + bouton) */}
        <section className="block block-4">
          <div className="phone-mockup-wrapper">
            <div className="phone-mockup">
              <div className="phone-notch"></div>
              <div className="phone-screen">

                <div className="chat-header">
                  <span className="back">‹</span>
                  <span className="title">Anonyme <span>·</span> TBH</span>
                  <span className="actions">⋯</span>
                </div>

                <div className="chat-body" ref={chatBodyRef}>
                  <div className="typing-indicator" ref={typingIndicatorRef}>
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </div>

                <div className="chat-footer">
                  <input type="text" className="input-field" placeholder="Écris un message..." disabled />
                  <div className="send-btn">➤</div>
                </div>

              </div>
            </div>
          </div>

          <button className="cta-btn" onClick={handleJoin}>Rejoins le fun</button>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <img src="assets/white_logo.svg" alt="TBH" className="logo-img" />
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