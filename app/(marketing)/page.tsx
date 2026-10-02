'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// ─── Constantes de timing pour le mockup ───
const TYPING_DURATION = 2000;
const MIN_DELAY_BETWEEN_MSGS = 1800;
const MAX_DELAY_BETWEEN_MSGS = 3000;
const PAUSE_BETWEEN_CONVERSATIONS = 4800;
const INITIAL_DELAY = 1000;

// ─── Contenu Bilingue (Français & Anglais) ───
const CONTENT = {
  fr: {
    navCta: 'Rejoins tes potes',
    heroLine1: 'Amuse toi',
    heroLine2: 'réellement',
    heroLine3: 'avec',
    heroLine4: 'tes potes.',
    featuresText: 'reçois des messages anonymes et chatte avec eux',
    sliderText: 'remplis ta messagerie',
    phoneTitle: 'Anonyme · TBH',
    phonePlaceholder: 'Écris un message...',
    phoneCta: 'Rejoins le fun',
    gameIdeas: [
      'Envoie un message à ton crush 👀',
      'Demande un avis sincère 💬',
      'Confesse un secret 🤫',
      'Joue à "Action ou Vérité" 🎲',
      'Fais une déclaration anonyme 💌',
      'Pose une question gênante 🔥',
    ],
    footerSlogan: 'Des messages anonymes, des conversations sincères.',
    footerDiscover: 'Découvrir',
    footerAbout: 'À propos',
    footerBlog: 'Blog',
    footerSafety: 'Sécurité',
    footerSupport: 'Support',
    footerContact: 'Contact',
    footerFaq: 'FAQ',
    footerLegal: 'Mentions légales',
    footerRights: '© 2026 TBH. Tous droits réservés.',
    footerPrivacy: 'Confidentialité',
    footerCookies: 'Cookies',
    footerTerms: 'CGU',
    conversations: [
      // Conversation 1 – Flirt
      [
        { sender: 'Anonyme', text: 'J’aime tes yeux, ils sont beaux à regarder.', time: '21:04', type: 'received' },
        { sender: 'Moi', text: 'Ah bon ? Tu me connais ?', time: '21:05', type: 'sent' },
        { sender: 'Anonyme', text: 'Je te vois tous les jours à la fac, tu es toujours à la bibliothèque.', time: '21:07', type: 'received' },
        { sender: 'Moi', text: 'Et tu n’oses pas venir me parler ?', time: '21:08', type: 'sent' },
        { sender: 'Anonyme', text: 'Pas encore. Mais peut-être un jour, si tu réponds à ce message.', time: '21:10', type: 'received' },
      ],
      // Conversation 2 – Humour
      [
        { sender: 'Anonyme', text: 'Ton chien est trop mignon !', time: '18:23', type: 'received' },
        { sender: 'Moi', text: 'Mais je n’ai pas de chien…', time: '18:24', type: 'sent' },
        { sender: 'Anonyme', text: 'Ah mince, je me suis trompé de personne !', time: '18:25', type: 'received' },
        { sender: 'Moi', text: 'Haha, mais tu peux garder le compliment, je le prends.', time: '18:26', type: 'sent' },
        { sender: 'Anonyme', text: 'Bon, alors ton sourire est mignon aussi, même sans chien.', time: '18:28', type: 'received' },
      ],
      // Conversation 3 – Sincère
      [
        { sender: 'Anonyme', text: 'Je voulais te dire que tu es la personne la plus intéressante que j’ai rencontrée.', time: '23:12', type: 'received' },
        { sender: 'Moi', text: 'C’est gentil… mais qui es-tu ?', time: '23:13', type: 'sent' },
        { sender: 'Anonyme', text: 'Quelqu’un qui t’observe depuis longtemps, sans oser te parler.', time: '23:15', type: 'received' },
        { sender: 'Moi', text: 'Ça fait un peu mystérieux, non ?', time: '23:16', type: 'sent' },
        { sender: 'Anonyme', text: 'Pas de panique, je suis inoffensif. Juste un admirateur timide.', time: '23:18', type: 'received' },
      ],
    ],
  },
  en: {
    navCta: 'Join your friends',
    heroLine1: 'Have real fun',
    heroLine2: 'with your',
    heroLine3: 'closest',
    heroLine4: 'friends.',
    featuresText: 'receive anonymous messages and chat with them',
    sliderText: 'fill up your inbox',
    phoneTitle: 'Anonymous · TBH',
    phonePlaceholder: 'Type a message...',
    phoneCta: 'Join the fun',
    gameIdeas: [
      'Send a message to your crush 👀',
      'Ask for honest thoughts 💬',
      'Confess a secret 🤫',
      'Play Truth or Dare 🎲',
      'Drop an anonymous note 💌',
      'Ask that burning question 🔥',
    ],
    footerSlogan: 'Anonymous messages, genuine conversations.',
    footerDiscover: 'Discover',
    footerAbout: 'About',
    footerBlog: 'Blog',
    footerSafety: 'Safety',
    footerSupport: 'Support',
    footerContact: 'Contact',
    footerFaq: 'FAQ',
    footerLegal: 'Legal notice',
    footerRights: '© 2026 TBH. All rights reserved.',
    footerPrivacy: 'Privacy',
    footerCookies: 'Cookies',
    footerTerms: 'Terms',
    conversations: [
      // Conversation 1 – Flirt
      [
        { sender: 'Anonymous', text: 'I really love your eyes, they caught my attention.', time: '21:04', type: 'received' },
        { sender: 'Me', text: 'Really? Do you know me?', time: '21:05', type: 'sent' },
        { sender: 'Anonymous', text: 'I see you every day on campus, always reading at the library.', time: '21:07', type: 'received' },
        { sender: 'Me', text: 'And you never dared to come say hi?', time: '21:08', type: 'sent' },
        { sender: 'Anonymous', text: 'Not yet. Maybe soon, now that you replied to this.', time: '21:10', type: 'received' },
      ],
      // Conversation 2 – Humour
      [
        { sender: 'Anonymous', text: 'Your dog is so ridiculously cute!', time: '18:23', type: 'received' },
        { sender: 'Me', text: 'Wait, I don’t even have a dog…', time: '18:24', type: 'sent' },
        { sender: 'Anonymous', text: 'Oh shoot, definitely messaged the wrong person!', time: '18:25', type: 'received' },
        { sender: 'Me', text: 'Haha, no worries, I’ll take the compliment anyway.', time: '18:26', type: 'sent' },
        { sender: 'Anonymous', text: 'Well then your smile is cute too, even without a dog.', time: '18:28', type: 'received' },
      ],
      // Conversation 3 – Sincère
      [
        { sender: 'Anonymous', text: 'Just wanted to let you know you seem like such a genuine person.', time: '23:12', type: 'received' },
        { sender: 'Me', text: 'That’s sweet of you… who are you?', time: '23:13', type: 'sent' },
        { sender: 'Anonymous', text: 'Someone who’s noticed you for a while, just shy to say it in person.', time: '23:15', type: 'received' },
        { sender: 'Me', text: 'A little mysterious, isn’t it?', time: '23:16', type: 'sent' },
        { sender: 'Anonymous', text: 'Promise I’m harmless! Just a quiet admirer.', time: '23:18', type: 'received' },
      ],
    ],
  },
};

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

  // ─── Détection automatique de la langue (Anglais si appareil en anglais, sinon Français par défaut) ───
  const [locale, setLocale] = useState<'fr' | 'en'>('fr');

  useEffect(() => {
    try {
      const navLang = navigator.languages?.[0] || navigator.language || '';
      if (navLang.toLowerCase().startsWith('en')) {
        setLocale('en');
      } else {
        setLocale('fr');
      }
    } catch {
      setLocale('fr');
    }
  }, []);

  const content = CONTENT[locale];

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

  // ─── Conversations dynamiques selon la langue ───
  const conversations = useMemo(() => {
    return content.conversations;
  }, [content]);

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

  // ─── Scroll navbar ───
  useEffect(() => {
    const handleScroll = () => {
      setIsNavVisible(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ─── Fade-in des SVGs ───
  useEffect(() => {
    const svgs = document.querySelectorAll('.svg-deco, .svg-feature, .slider-svg');
    svgs.forEach((el, i) => {
      const delay = 100 + i * 120;
      setTimeout(() => {
        el.classList.add('loaded');
      }, delay);
    });
  }, []);

  // ─── Effet "follow cursor" ───
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setTargetPos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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

  // ─── Parallax héros ───
  const heroTarget = useRef({ x: 0.5, y: 0.5 });
  const heroCurrent = useRef({ x: 0.5, y: 0.5 });

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

  // ─── Parallax features ───
  const featureTarget = useRef({ x: 0.5, y: 0.5 });
  const featureCurrent = useRef({ x: 0.5, y: 0.5 });

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
    const featureIntensities = [18, 18, 14, 14];

    let frameId: number;
    function animate() {
      heroCurrent.current.x += (heroTarget.current.x - heroCurrent.current.x) * DAMPING;
      heroCurrent.current.y += (heroTarget.current.y - heroCurrent.current.y) * DAMPING;
      heroSvgsRef.current.forEach((el, idx) => {
        if (!el) return;
        const x = (heroCurrent.current.x - 0.5) * heroIntensities[idx] * 2;
        const y = (heroCurrent.current.y - 0.5) * heroIntensities[idx] * 2;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });

      featureCurrent.current.x += (featureTarget.current.x - featureCurrent.current.x) * DAMPING;
      featureCurrent.current.y += (featureTarget.current.y - featureCurrent.current.y) * DAMPING;
      featureSvgsRef.current.forEach((el, idx) => {
        if (!el) return;
        const x = (featureCurrent.current.x - 0.5) * featureIntensities[idx] * 2;
        const y = (featureCurrent.current.y - 0.5) * featureIntensities[idx] * 2;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });

      frameId = requestAnimationFrame(animate);
    }
    frameId = requestAnimationFrame(animate);

    return () => {
      if (hero) {
        hero.removeEventListener('mousemove', handleHeroMove);
        hero.removeEventListener('mouseleave', handleHeroLeave);
      }
      if (feature) {
        feature.removeEventListener('mousemove', handleFeatureMove);
        feature.removeEventListener('mouseleave', handleFeatureLeave);
      }
      cancelAnimationFrame(frameId);
    };
  }, [handleHeroMove, handleHeroLeave, handleFeatureMove, handleFeatureLeave]);

  // ─── Fonctions du mockup chat ───
  const addMessage = useCallback((msg: any) => {
    if (!chatBodyRef.current) return;
    const div = document.createElement('div');
    div.className = `message ${msg.type}`;
    div.innerHTML = `
      <span class="sender">${msg.sender}</span>
      <span class="text">${msg.text}</span>
      <span class="time">${msg.time}</span>
    `;
    chatBodyRef.current.insertBefore(div, typingIndicatorRef.current);
    chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, []);

  const clearChat = useCallback(() => {
    if (!chatBodyRef.current) return;
    const messages = chatBodyRef.current.querySelectorAll('.message');
    messages.forEach((el) => el.remove());
    if (typingIndicatorRef.current) {
      typingIndicatorRef.current.style.display = 'none';
    }
  }, []);

  // ─── Déroulement récursif des messages ───
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

  // Relance la conversation lors d'un changement de langue ou au montage
  useEffect(() => {
    clearChat();
    setCurrentConvIndex(0);
    setMsgIndex(0);
    if (conversationTimerRef.current) {
      clearTimeout(conversationTimerRef.current);
    }
    conversationTimerRef.current = setTimeout(showNextMessage, INITIAL_DELAY);

    return () => {
      if (conversationTimerRef.current) {
        clearTimeout(conversationTimerRef.current);
        conversationTimerRef.current = null;
      }
    };
  }, [locale]);

  // ─── Ticker idées de jeux ───
  const gameIdeas = content.gameIdeas;
  const duplicatedIdeas = [...gameIdeas, ...gameIdeas, ...gameIdeas];

  // ─── Bouton CTA hover effect ───
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
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

        :root {
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        html, body, *, *::before, *::after {
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          box-sizing: border-box;
        }

        body {
          background: #000000;
          color: #FFFFFF;
          min-height: 100vh;
          overflow-x: hidden;
          margin: 0;
          padding: 0;
          -webkit-font-smoothing: antialiased;
        }

        /* ─── NAVBAR FIXE AU SCROLL ─── */
        .navbar-fixed {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          padding: 16px 32px;
          background: rgba(0, 0, 0, 0.82);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
          z-index: 1000;
          transform: translateY(-100%);
          opacity: 0;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease;
        }

        .navbar-fixed.visible {
          transform: translateY(0);
          opacity: 1;
        }

        .nav-inner {
          max-width: 1240px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nav-inner .logo-img {
          height: 34px;
          width: auto;
        }

        /* ─── BOUTONS CTA MODERNES ─── */
        .cta-btn {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #FF6B6B, #FF431D);
          border: none;
          color: #000000;
          padding: 16px 44px;
          border-radius: 40px;
          font-weight: 800;
          font-size: 17px;
          cursor: pointer;
          letter-spacing: 0.2px;
          transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.25s ease, color 0.4s ease;
          box-shadow: 0 8px 24px rgba(255, 67, 29, 0.28);
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
          color: #FFFFFF;
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(255, 67, 29, 0.4);
        }

        .cta-btn:active {
          transform: scale(0.97);
        }

        .navbar-inline .cta-btn {
          background: #FFFFFF;
          color: #000000;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
        }

        .navbar-inline .cta-btn::before {
          background: #000000;
        }

        .navbar-inline .cta-btn:hover {
          color: #FFFFFF;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }

        /* ─── CONTENEUR PRINCIPAL PLUS RESPIRANT ─── */
        main {
          max-width: 1240px;
          margin: 0 auto;
          padding: 24px 24px 60px 24px;
          display: flex;
          flex-direction: column;
          gap: 36px;
        }

        /* ─── STYLE GÉNÉRAL DES BLOCS ─── */
        .block {
          border-radius: 48px;
          padding: 48px 40px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 24px 60px -15px rgba(0, 0, 0, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        /* ─── BLOC 1 : HERO ─── */
        .block-1 {
          background: linear-gradient(145deg, #EBD38F 0%, #FEA05C 35%, #FC554F 70%, #FB673F 100%);
          min-height: 560px;
          display: flex;
          flex-direction: column;
          border: none;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          flex: 1;
          transition: transform 0.12s ease-out;
        }

        .navbar-inline {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 48px;
          gap: 16px;
          flex-wrap: wrap;
        }

        .navbar-inline .logo-img {
          height: 38px;
          width: auto;
          flex-shrink: 0;
        }

        .hero-text {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-weight: 850;
          font-size: clamp(3rem, 8.5vw, 5.8rem);
          line-height: 1.18;
          color: #FFFFFF;
          letter-spacing: -0.035em;
          padding: 24px 0 36px 0;
          text-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
        }

        .hero-text span {
          display: block;
          max-width: 920px;
        }

        /* SVGs flottants Bloc 1 */
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
          top: 38%;
          left: 3%;
          width: clamp(180px, 16vw, 260px);
          transition: transform 0.25s cubic-bezier(0.2, 0.6, 0.3, 1);
        }

        .svg-2 {
          z-index: 1;
          top: 64%;
          left: 10%;
          width: clamp(140px, 12vw, 190px);
          transition: transform 0.25s cubic-bezier(0.2, 0.6, 0.3, 1);
        }

        .svg-3 {
          z-index: 0;
          top: 36%;
          right: 3%;
          width: clamp(180px, 16vw, 260px);
          transition: transform 0.25s cubic-bezier(0.2, 0.6, 0.3, 1);
        }

        .svg-4 {
          z-index: 1;
          top: 64%;
          right: 10%;
          width: clamp(140px, 12vw, 190px);
          transition: transform 0.25s cubic-bezier(0.2, 0.6, 0.3, 1);
        }

        /* ─── TICKER IDÉES DE JEUX ─── */
        .game-ideas {
          padding: 10px 0;
          overflow: hidden;
          white-space: nowrap;
          position: relative;
          background: transparent;
          margin-bottom: 4px;
          mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
        }

        .game-ideas-track {
          display: inline-block;
          animation: scroll-ideas 32s linear infinite;
        }

        .game-ideas-track:hover {
          animation-play-state: paused;
        }

        .game-ideas-item {
          display: inline-flex;
          align-items: center;
          color: rgba(255, 255, 255, 0.85);
          font-size: 15px;
          font-weight: 600;
          padding: 0 20px;
          letter-spacing: 0.3px;
        }

        .game-ideas-item .separator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #FF6B6B;
          margin-right: 16px;
          display: inline-block;
          box-shadow: 0 0 10px rgba(255, 107, 107, 0.7);
        }

        @keyframes scroll-ideas {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* ─── BLOC 2 : FEATURES ─── */
        .block-features {
          background: #09090B;
          min-height: 520px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 80px 44px;
        }

        .block-features .feature-text {
          font-weight: 850;
          font-size: clamp(2.6rem, 6.8vw, 4.4rem);
          line-height: 1.22;
          color: #FFFFFF;
          max-width: 860px;
          z-index: 2;
          position: relative;
          letter-spacing: -0.03em;
          text-shadow: 0 4px 40px rgba(0, 0, 0, 0.8);
        }

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
          top: 14%;
          left: 6%;
          width: clamp(160px, 14vw, 240px);
          transition: transform 0.25s cubic-bezier(0.2, 0.6, 0.3, 1);
        }

        .svg-7 {
          bottom: 12%;
          left: 8%;
          width: clamp(140px, 13vw, 210px);
          transition: transform 0.25s cubic-bezier(0.2, 0.6, 0.3, 1);
        }

        .svg-6 {
          top: 14%;
          right: 6%;
          width: clamp(160px, 14vw, 240px);
          transition: transform 0.25s cubic-bezier(0.2, 0.6, 0.3, 1);
        }

        .svg-8 {
          bottom: 12%;
          right: 8%;
          width: clamp(140px, 13vw, 210px);
          transition: transform 0.25s cubic-bezier(0.2, 0.6, 0.3, 1);
        }

        /* ─── BLOC 3 : SLIDER SVG ─── */
        .block-3 {
          background: #09090B;
          min-height: 480px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 32px;
        }

        .slider-container {
          width: 100%;
          max-width: 1120px;
          height: 320px;
          overflow: hidden;
          position: relative;
        }

        .slider-track {
          display: flex;
          width: 100%;
          height: 100%;
          transition: transform 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94);
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
          50%       { transform: translateY(-16px) rotate(var(--rot, 0deg)); }
        }

        .messagerie-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-weight: 850;
          font-size: clamp(2.6rem, 7vw, 4.6rem);
          color: #FFFFFF;
          text-align: center;
          z-index: 10;
          letter-spacing: -0.03em;
          line-height: 1.18;
          text-shadow: 0 6px 36px rgba(0, 0, 0, 0.9);
          pointer-events: none;
          width: 90%;
          max-width: 820px;
        }

        /* ─── BLOC 4 : BAS DE PAGE AVEC MOCKUP IPHONE MODERNE ─── */
        .block-4 {
          background: linear-gradient(145deg, #EBD38F 0%, #FEA05C 35%, #FC554F 70%, #FB673F 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 68px 36px 60px 36px;
          min-height: 720px;
          gap: 44px;
          border: none;
        }

        .phone-mockup-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          perspective: 1200px;
        }

        /* Châssis iPhone 16 Pro moderne */
        .phone-mockup {
          width: 360px;
          max-width: 100%;
          background: #18181B;
          border-radius: 54px;
          padding: 12px;
          position: relative;
          box-shadow: 
            0 0 0 1px rgba(255, 255, 255, 0.18) inset,
            0 0 0 3px #27272A inset,
            0 30px 80px -15px rgba(0, 0, 0, 0.8),
            0 15px 35px -5px rgba(0, 0, 0, 0.5);
          transition: transform 0.4s ease, box-shadow 0.4s ease;
        }

        .phone-mockup:hover {
          transform: translateY(-4px);
          box-shadow: 
            0 0 0 1px rgba(255, 255, 255, 0.22) inset,
            0 0 0 3px #27272A inset,
            0 40px 100px -20px rgba(0, 0, 0, 0.85),
            0 20px 45px -5px rgba(0, 0, 0, 0.55);
        }

        /* Dynamic Island élégante */
        .phone-dynamic-island {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: 104px;
          height: 28px;
          background: #000000;
          border-radius: 20px;
          z-index: 30;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 10px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .phone-dynamic-island .island-camera {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #0D1117;
          box-shadow: 0 0 0 1px #1F2937 inset;
        }

        .phone-dynamic-island .island-sensor {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #052E16;
        }

        /* Écran tactile */
        .phone-screen {
          background: #FFFFFF;
          border-radius: 44px;
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08) inset;
        }

        /* Barre d'état iOS */
        .phone-status-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 24px 6px 24px;
          background: #F9F9FA;
          font-size: 12px;
          font-weight: 700;
          color: #000000;
          z-index: 25;
        }

        .phone-status-bar .status-time {
          letter-spacing: -0.2px;
        }

        .phone-status-bar .status-icons {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* En-tête de chat moderne */
        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 18px 12px 18px;
          background: #F9F9FA;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }

        .chat-header .back {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FF431D;
          font-size: 19px;
          font-weight: 700;
          background: rgba(255, 67, 29, 0.08);
          cursor: default;
        }

        .chat-header .chat-user-info {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .chat-header .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #FF6B6B, #FF431D);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          font-weight: 800;
          font-size: 12px;
          box-shadow: 0 2px 8px rgba(255, 67, 29, 0.3);
        }

        .chat-header .title {
          font-weight: 700;
          font-size: 14.5px;
          color: #0D0D0D;
          letter-spacing: -0.3px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .chat-header .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #34C759;
          display: inline-block;
        }

        .chat-header .actions {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8E8E93;
          font-size: 15px;
          background: rgba(0, 0, 0, 0.04);
          cursor: default;
        }

        /* Corps de la discussion */
        .chat-body {
          padding: 16px 14px 10px 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-height: 380px;
          max-height: 440px;
          overflow-y: auto;
          background: #FFFFFF;
          position: relative;
        }

        .message {
          max-width: 82%;
          padding: 11px 15px;
          font-size: 14.5px;
          line-height: 1.42;
          word-wrap: break-word;
          opacity: 0;
          transform: translateY(12px);
          animation: messageIn 0.35s ease forwards;
          position: relative;
        }

        .message.received {
          align-self: flex-start;
          background: #F2F2F7;
          color: #0D0D0D;
          border-radius: 20px 20px 20px 6px;
          border: 1px solid rgba(0, 0, 0, 0.03);
        }

        .message.sent {
          align-self: flex-end;
          background: linear-gradient(135deg, #FF6B6B, #FF431D);
          color: #FFFFFF;
          border-radius: 20px 20px 6px 20px;
          box-shadow: 0 4px 14px rgba(255, 67, 29, 0.25);
        }

        .message .sender {
          font-size: 10.5px;
          font-weight: 700;
          opacity: 0.65;
          margin-bottom: 3px;
          display: block;
          letter-spacing: 0.2px;
        }

        .message.received .sender { color: #555555; }
        .message.sent .sender     { color: rgba(255, 255, 255, 0.8); }

        .message .text {
          display: block;
        }

        .message .time {
          font-size: 9.5px;
          opacity: 0.55;
          margin-top: 5px;
          text-align: right;
          display: block;
        }

        .message.received .time { color: #888888; }
        .message.sent .time     { color: rgba(255, 255, 255, 0.7); }

        .typing-indicator {
          align-self: flex-start;
          background: #F2F2F7;
          padding: 12px 18px;
          border-radius: 20px 20px 20px 6px;
          display: none;
          gap: 5px;
          align-items: center;
          margin-top: 4px;
        }

        .typing-indicator .dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #8E8E93;
          animation: dotPulse 1.2s infinite ease-in-out;
        }
        .typing-indicator .dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator .dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes dotPulse {
          0%, 60%, 100% { transform: scale(0.8); opacity: 0.3; }
          30%           { transform: scale(1.25); opacity: 1; }
        }

        @keyframes messageIn {
          0%   { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        /* Pied de page du chat */
        .chat-footer {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px 14px 14px;
          background: #FFFFFF;
          border-top: 1px solid rgba(0, 0, 0, 0.06);
        }

        .chat-footer .input-field {
          flex: 1;
          background: #F2F2F7;
          border: none;
          border-radius: 24px;
          padding: 11px 18px;
          font-size: 14px;
          color: #0D0D0D;
          outline: none;
        }

        .chat-footer .input-field::placeholder { color: #8E8E93; }

        .chat-footer .send-btn {
          background: linear-gradient(135deg, #FF6B6B, #FF431D);
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          font-size: 16px;
          cursor: default;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(255, 67, 29, 0.35);
        }

        /* Barre d'accueil iPhone */
        .phone-home-indicator {
          width: 130px;
          height: 4px;
          background: #000000;
          border-radius: 2px;
          margin: 6px auto 8px auto;
          opacity: 0.8;
        }

        .chat-body::-webkit-scrollbar { width: 3px; }
        .chat-body::-webkit-scrollbar-track { background: transparent; }
        .chat-body::-webkit-scrollbar-thumb { background: #D5D5DA; border-radius: 10px; }

        /* Bouton "Rejoins le fun" */
        .block-4 .cta-btn {
          background: #0D0D0D;
          color: #FFFFFF;
          font-size: 20px;
          padding: 18px 52px;
          border-radius: 40px;
          border: none;
          cursor: pointer;
          font-weight: 800;
          letter-spacing: 0.3px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
          transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s ease;
        }

        .block-4 .cta-btn:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
        }

        .block-4 .cta-btn:active {
          transform: scale(0.97);
        }

        /* ─── FOOTER ÉPURÉ & MODERNE ─── */
        .site-footer {
          background: #000000;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding: 70px 24px 44px 24px;
        }

        .footer-inner {
          max-width: 1240px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 56px;
        }

        .footer-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 48px;
        }

        .footer-brand {
          display: flex;
          flex-direction: column;
          gap: 14px;
          max-width: 340px;
        }

        .footer-brand .logo-img {
          height: 38px;
          width: auto;
          align-self: flex-start;
        }

        .footer-brand p {
          color: rgba(255, 255, 255, 0.55);
          font-size: 15px;
          line-height: 1.5;
          margin: 0;
        }

        .footer-links {
          display: flex;
          gap: 64px;
          flex-wrap: wrap;
        }

        .footer-links-column {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .footer-links-column h4 {
          color: rgba(255, 255, 255, 0.9);
          font-size: 13px;
          font-weight: 750;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          margin: 0 0 4px 0;
        }

        .footer-links-column a {
          color: rgba(255, 255, 255, 0.45);
          text-decoration: none;
          font-size: 15px;
          font-weight: 450;
          transition: color 0.2s ease, transform 0.2s ease;
        }

        .footer-links-column a:hover {
          color: #FF6B6B;
          transform: translateX(2px);
        }

        .footer-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }

        .footer-bottom p {
          color: rgba(255, 255, 255, 0.35);
          font-size: 13.5px;
          margin: 0;
        }

        .footer-bottom-legal {
          display: flex;
          gap: 32px;
        }

        .footer-bottom-legal a {
          color: rgba(255, 255, 255, 0.35);
          text-decoration: none;
          font-size: 13.5px;
          transition: color 0.2s ease;
        }

        .footer-bottom-legal a:hover {
          color: rgba(255, 255, 255, 0.85);
        }

        /* ─── RESPONSIVE MOBILE ─── */
        @media (max-width: 768px) {
          main {
            padding: 16px 16px 40px 16px;
            gap: 24px;
          }
          .block {
            padding: 36px 24px;
            border-radius: 36px;
          }
          .block-1 {
            min-height: 440px;
          }
          .block-features {
            min-height: 400px;
            padding: 56px 24px;
          }
          .block-3 {
            min-height: 400px;
            padding: 40px 20px;
          }
          .slider-container {
            height: 240px;
          }
          .slider-svg {
            width: clamp(140px, 35vw, 240px) !important;
          }
          .block-4 {
            min-height: 600px;
            padding: 48px 20px 40px 20px;
            gap: 32px;
          }
          .phone-mockup {
            width: 310px;
            padding: 10px;
            border-radius: 46px;
          }
          .phone-screen {
            border-radius: 38px;
          }
          .chat-body {
            min-height: 320px;
            max-height: 380px;
          }
          .hero-text {
            font-size: clamp(2.4rem, 8.5vw, 4.2rem);
            padding: 16px 0 24px 0;
          }
          .navbar-inline .logo-img {
            height: 32px;
          }
          .cta-btn {
            padding: 13px 32px;
            font-size: 16px;
          }
          .footer-top {
            flex-direction: column;
            gap: 36px;
          }
          .footer-links {
            gap: 40px;
          }
          .footer-bottom {
            flex-direction: column;
            align-items: flex-start;
            gap: 14px;
          }

          /* Désactiver follow cursor sur mobile */
          .hero-content {
            transform: none !important;
          }
          .feature-text {
            transform: none !important;
          }

          .svg-deco, .svg-feature, .slider-svg {
            animation: float 4.5s ease-in-out infinite;
          }
        }

        @media (max-width: 480px) {
          main {
            padding: 12px 12px 32px 12px;
            gap: 20px;
          }
          .block {
            padding: 28px 18px;
            border-radius: 30px;
          }
          .phone-mockup {
            width: 280px;
            padding: 9px;
            border-radius: 42px;
          }
          .phone-screen {
            border-radius: 34px;
          }
          .chat-body {
            min-height: 280px;
            max-height: 340px;
            padding: 12px 10px;
          }
          .message {
            font-size: 13.5px;
            padding: 9px 13px;
          }
          .block-4 .cta-btn {
            font-size: 17px;
            padding: 15px 36px;
          }
        }
      `}</style>

      {/* Navbar fixe au scroll */}
      <nav className={`navbar-fixed ${isNavVisible ? 'visible' : ''}`}>
        <div className="nav-inner">
          <img src="/assets/landingpage_logo.svg" alt="TBH" className="logo-img" />
          <button className="cta-btn" onClick={handleJoin}>
            {content.navCta}
          </button>
        </div>
      </nav>

      <main>
        {/* Ticker d'idées de jeux */}
        <div className="game-ideas">
          <div className="game-ideas-track">
            {duplicatedIdeas.map((idea, index) => (
              <span key={index} className="game-ideas-item">
                <span className="separator"></span> {idea}
              </span>
            ))}
          </div>
        </div>

        {/* Bloc 1 : Hero */}
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
              <img src="/assets/landingpage_logo.svg" alt="TBH" className="logo-img" />
              <button
                className="cta-btn"
                onMouseMove={handleMouseMoveBtn}
                onMouseLeave={handleMouseLeaveBtn}
                onClick={handleJoin}
              >
                {content.navCta}
              </button>
            </nav>

            <div className="hero-text">
              <span>
                {content.heroLine1}<br />
                {content.heroLine2}<br />
                {content.heroLine3}<br />
                {content.heroLine4}
              </span>
            </div>
          </div>
        </section>

        {/* Bloc 2 : Features */}
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
            {content.featuresText}
          </div>
        </section>

        {/* Bloc 3 : Slider SVGs */}
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
          <div className="messagerie-text">{content.sliderText}</div>
        </section>

        {/* Bloc 4 : Mockup téléphone moderne + CTA final */}
        <section className="block block-4">
          <div className="phone-mockup-wrapper">
            <div className="phone-mockup">
              {/* Dynamic Island */}
              <div className="phone-dynamic-island">
                <span className="island-sensor"></span>
                <span className="island-camera"></span>
              </div>

              {/* Écran iPhone */}
              <div className="phone-screen">
                {/* Barre de statut iOS */}
                <div className="phone-status-bar">
                  <span className="status-time">9:41</span>
                  <div className="status-icons">
                    <svg width="15" height="11" viewBox="0 0 17 11" fill="currentColor">
                      <rect x="0" y="7" width="2.5" height="4" rx="0.6"/>
                      <rect x="4" y="5" width="2.5" height="6" rx="0.6"/>
                      <rect x="8" y="2.5" width="2.5" height="8.5" rx="0.6"/>
                      <rect x="12" y="0" width="2.5" height="11" rx="0.6"/>
                    </svg>
                    <svg width="14" height="10" viewBox="0 0 16 12" fill="currentColor">
                      <path d="M8 2.5C10.5 2.5 12.8 3.5 14.5 5.1L15.6 3.9C13.6 2 10.9 0.8 8 0.8C5.1 0.8 2.4 2 0.4 3.9L1.5 5.1C3.2 3.5 5.5 2.5 8 2.5ZM8 6.5C9.5 6.5 10.9 7.1 12 8.1L13.1 6.9C11.7 5.6 9.9 4.8 8 4.8C6.1 4.8 4.3 5.6 2.9 6.9L4 8.1C5.1 7.1 6.5 6.5 8 6.5ZM8 10C8.8 10 9.5 10.7 9.5 11.5C9.5 12.3 8.8 13 8 13C7.2 13 6.5 12.3 6.5 11.5C6.5 10.7 7.2 10 8 10Z"/>
                    </svg>
                    <svg width="18" height="10" viewBox="0 0 25 12" fill="currentColor">
                      <rect x="1" y="1" width="20" height="10" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8"/>
                      <rect x="3" y="3" width="13" height="6" rx="1.5"/>
                      <path d="M23 4.5V7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>

                {/* En-tête de chat */}
                <div className="chat-header">
                  <span className="back">‹</span>
                  <div className="chat-user-info">
                    <div className="user-avatar">💬</div>
                    <span className="title">
                      {content.phoneTitle}
                      <span className="status-dot"></span>
                    </span>
                  </div>
                  <span className="actions">⋯</span>
                </div>

                {/* Corps de la conversation */}
                <div className="chat-body" ref={chatBodyRef}>
                  <div className="typing-indicator" ref={typingIndicatorRef}>
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </div>

                {/* Champ de saisie */}
                <div className="chat-footer">
                  <input
                    type="text"
                    className="input-field"
                    placeholder={content.phonePlaceholder}
                    disabled
                  />
                  <div className="send-btn">➤</div>
                </div>

                {/* Home Indicator iOS */}
                <div className="phone-home-indicator"></div>
              </div>
            </div>
          </div>

          <button className="cta-btn" onClick={handleJoin}>
            {content.phoneCta}
          </button>
        </section>
      </main>

      {/* Footer épuré et moderne */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <img src="/assets/white_logo.svg" alt="TBH" className="logo-img" />
              <p>{content.footerSlogan}</p>
            </div>
            <div className="footer-links">
              <div className="footer-links-column">
                <h4>{content.footerDiscover}</h4>
                <a href="/about">{content.footerAbout}</a>
                <a href="#">{content.footerBlog}</a>
                <a href="#">{content.footerSafety}</a>
              </div>
              <div className="footer-links-column">
                <h4>{content.footerSupport}</h4>
                <a href="mailto:support@tbhonest.net">{content.footerContact}</a>
                <a href="/guide">{content.footerFaq}</a>
                <a href="/legal">{content.footerLegal}</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>{content.footerRights}</p>
            <div className="footer-bottom-legal">
              <a href="/legal">{content.footerPrivacy}</a>
              <a href="/legal">{content.footerCookies}</a>
              <a href="/legal">{content.footerTerms}</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default LandingPage;