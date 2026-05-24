import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowUpRight, 
  ChevronRight, 
  Sparkles, 
  Layers, 
  Zap, 
  Eye, 
  TrendingUp, 
  Smile, 
  X, 
  ArrowRight,
  Info,
  Menu,
  Plus
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import emailjs from '@emailjs/browser';
import './App.css';

gsap.registerPlugin(ScrollTrigger);

function App() {
  // Easter egg: Theme swap (Lime vs Cyan)
  const [activeTheme, setActiveTheme] = useState('lime'); // 'lime' or 'cyan'
  const [showNotification, setShowNotification] = useState(false);
  const [formStatus, setFormStatus] = useState('idle'); // 'idle' | 'sending' | 'success'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Before/After Slider DOM Refs
  const containerRef = useRef(null);
  const afterPaneRef = useRef(null);
  const handleRef = useRef(null);
  const afterImgRef = useRef(null);
  const beforeLabelRef = useRef(null);
  const afterLabelRef = useRef(null);
  const typographyRef = useRef(null);
  const currentPercent = useRef(90);
  const isDragging = useRef(false);

  // Unified slider update function
  const updateSlider = (percent) => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.offsetWidth;
    const x = (percent / 100) * containerWidth;
    
    currentPercent.current = percent;

    if (afterPaneRef.current) {
      afterPaneRef.current.style.width = `${percent}%`;
    }
    if (handleRef.current) {
      handleRef.current.style.left = `${percent}%`;
    }
    if (afterImgRef.current) {
      afterImgRef.current.style.width = `${containerWidth}px`;
    }
    if (typographyRef.current) {
      typographyRef.current.style.width = `${containerWidth}px`;
    }
    
    const isMobile = window.innerWidth < 768;

    // Dynamic sliding labels positioning and fading
    if (afterLabelRef.current) {
      if (isMobile) {
        afterLabelRef.current.style.transform = '';
        afterLabelRef.current.style.opacity = '1';
      } else {
        const afterLabelWidth = afterLabelRef.current.offsetWidth || 180;
        // Position After label (left side) so its right side is 24px left of the handle
        const labelX = x - 24 - afterLabelWidth;
        afterLabelRef.current.style.transform = `translate3d(${labelX}px, -50%, 0)`;
        
        // Fade out as it reaches the left border (from 120px to 60px)
        const opacity = Math.max(0, Math.min(1, (x - 60) / 100));
        afterLabelRef.current.style.opacity = opacity;
      }
    }
    
    if (beforeLabelRef.current) {
      if (isMobile) {
        beforeLabelRef.current.style.transform = '';
        beforeLabelRef.current.style.opacity = '1';
      } else {
        // Position Before label (right side) so its left side is 24px right of the handle
        const labelX = x + 24;
        beforeLabelRef.current.style.transform = `translate3d(${labelX}px, -50%, 0)`;
        
        // Fade out as it reaches the right border (from 120px to 60px)
        const opacity = Math.max(0, Math.min(1, (containerWidth - x - 60) / 100));
        beforeLabelRef.current.style.opacity = opacity;
      }
    }
  };

  // Initialize and resize image within before/after slider
  useEffect(() => {
    const handleResize = () => {
      updateSlider(currentPercent.current);
    };
    
    // Default starting point (90% to show only a small before gap on the right)
    setTimeout(() => {
      updateSlider(90);
    }, 100);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Custom Cursor Refs
  const cursorRef = useRef(null);
  const cursorDotRef = useRef(null);

  // GSAP Animations
  const heroTextRef = useRef(null);
  const servicesRef = useRef(null);

  // Toggle color theme class on body
  useEffect(() => {
    const root = document.documentElement;
    if (activeTheme === 'cyan') {
      root.style.setProperty('--color-lime', '#00FFFF');
      root.style.setProperty('--color-lime-rgb', '0, 255, 255');
    } else {
      root.style.setProperty('--color-lime', '#D0FF00');
      root.style.setProperty('--color-lime-rgb', '208, 255, 0');
    }
  }, [activeTheme]);

  // Cursor following logic (performs at 60fps using direct style modifications)
  useEffect(() => {
    const cursor = cursorRef.current;
    const dot = cursorDotRef.current;

    const onMouseMove = (e) => {
      if (cursor) {
        cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
      if (dot) {
        dot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };
    
    window.addEventListener('mousemove', onMouseMove);
    
    // Hover classes
    const addHoverClass = () => {
      if (cursor) cursor.classList.add('hovered');
    };
    const removeHoverClass = () => {
      if (cursor) cursor.classList.remove('hovered');
    };
    
    // Attach event listeners to all interactive items
    const updateHoverListeners = () => {
      const hoverables = document.querySelectorAll(
        'a, button, .bento-card, .service-row, .ba-handle-btn, .theme-toggle'
      );
      hoverables.forEach(el => {
        el.addEventListener('mouseenter', addHoverClass);
        el.addEventListener('mouseleave', removeHoverClass);
      });
    };

    updateHoverListeners();
    
    // Since React might re-render, we periodically update hover listeners
    const interval = setInterval(updateHoverListeners, 1500);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      clearInterval(interval);
    };
  }, []);

  // Bento Card hover light tracking
  useEffect(() => {
    const updateBentoCards = () => {
      const cards = document.querySelectorAll('.bento-card');
      const handleCardMouseMove = (e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      };
      
      cards.forEach(card => {
        card.addEventListener('mousemove', handleCardMouseMove);
      });

      return () => {
        cards.forEach(card => {
          card.removeEventListener('mousemove', handleCardMouseMove);
        });
      };
    };

    updateBentoCards();
  }, []);

  const handleSliderMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    
    updateSlider(percentage);
  };

  const handleStartDrag = (e) => {
    e.preventDefault();
    isDragging.current = true;
    window.addEventListener('mouseup', handleStopDrag);
    window.addEventListener('touchend', handleStopDrag);
  };

  const handleStopDrag = () => {
    isDragging.current = false;
    window.removeEventListener('mouseup', handleStopDrag);
    window.removeEventListener('touchend', handleStopDrag);
  };

  const handleMouseMove = (e) => {
    handleSliderMove(e.clientX);
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    if (e.touches && e.touches[0]) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  // Attach touch listeners with { passive: false } to allow preventDefault on mobile
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('touchstart', handleStartDrag, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => {
      el.removeEventListener('touchstart', handleStartDrag);
      el.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // GSAP Animations on Mount
  useEffect(() => {
    // Hero elements entrance
    const tl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1.2 } });
    
    tl.fromTo('.logo', { opacity: 0, y: -20 }, { opacity: 1, y: 0, delay: 0.2 })
      .fromTo('.nav-link', { opacity: 0, y: -10 }, { opacity: 1, y: 0, stagger: 0.1 }, '-=0.8')
      .fromTo('.hero-subtitle', { opacity: 0, x: -20 }, { opacity: 1, x: 0 }, '-=1')
      .fromTo('.split-inner', { y: '100%' }, { y: '0%', stagger: 0.2 }, '-=1.2')
      .fromTo('.hero-desc', { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, '-=0.8')
      .fromTo('.hero-cta-group', { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, '-=0.8')
      .fromTo('.hero-mockup', { opacity: 0, scale: 0.95, rotate: 1 }, { opacity: 1, scale: 1, rotate: 0 }, '-=1');

    // Scroll trigger for Service list rows
    gsap.fromTo('.service-row',
      { opacity: 0, x: -30 },
      {
        opacity: 1,
        x: 0,
        stagger: 0.2,
        scrollTrigger: {
          trigger: '.services-container',
          start: 'top 75%',
          toggleActions: 'play none none none'
        }
      }
    );

    // Grid overlay parallax scrolling
    gsap.to('.grid-overlay', {
      backgroundPosition: '0px 160px',
      ease: 'none',
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <>
      {/* Background patterns */}
      <div className="grain-overlay" />
      <div className="grid-overlay" />

      {/* Floating blurs */}
      <div className="glow-blur glow-cyan" style={{ top: '10%', right: '5%' }} />
      <div className="glow-blur glow-lime" style={{ top: '55%', left: '-10%' }} />
      
      {/* Custom Cursor Follower */}
      <div className="custom-cursor" ref={cursorRef} />
      <div className="custom-cursor-dot" ref={cursorDotRef} />

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay">
          <button 
            className="mobile-menu-close" 
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation menu"
          >
            <X size={28} />
          </button>
          <nav className="mobile-menu-links">
            <a href="#services" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>Services</a>
            <a href="#philosophy" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>Philosophy</a>
            <a href="#contact" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>Launch</a>
          </nav>
        </div>
      )}

      {/* Header */}
      <header className="header">
        <a href="#hero" className="logo">
          Oasic<span className="logo-dot" />
        </a>
        <nav className="nav-links">
          <a href="#services" className="nav-link">Services</a>
          <a href="#philosophy" className="nav-link">Philosophy</a>
          <a href="#contact" className="nav-link">Launch</a>
        </nav>
        <button 
          className="mobile-menu-btn" 
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Hero Section */}
      <section id="hero" className="section hero-wrapper">
        <div className="container hero-content">
          <div className="hero-left" ref={heroTextRef}>
            <span className="hero-subtitle">01 / BRAND LAUNCH</span>
            
            <h1>
              <span className="split-line">
                <span className="split-inner">LOCAL BUSINESSES</span>
              </span>
              <span className="split-line">
                <span className="split-inner highlight-stroke">DESERVE BETTER</span>
              </span>
              <span className="split-line">
                <span className="split-inner highlight-lime">THAN UGLY WEBSITES</span>
              </span>
            </h1>

            <p className="hero-desc">
              We design and engineer elite web experiences for high-end boutique brands, creative studios, and ambitious local founders who refuse to look generic.
            </p>

            <div className="hero-cta-group">
              <a href="#contact" className="btn-brutalist">
                Book a Session <ArrowUpRight size={18} />
              </a>
            </div>
          </div>

          <div className="hero-right">
            {/* Immersive interactive Mockup panel */}
            <div className="hero-mockup">
              <div className="mockup-header">
                <span className="mockup-dot dot-red" />
                <span className="mockup-dot dot-yellow" />
                <span className="mockup-dot dot-green" />
              </div>
              <div className="mockup-body">
                <img 
                  src="/hero_architectural.png" 
                  alt="Elite Brutalist Luxury mockup" 
                  className="mockup-inner-img"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kinetic text strip */}
      <div className="ticker-wrap">
        <div className="ticker">
          <div className="ticker-item">ELITE BRAND LAUNCH</div>
          <div className="ticker-item">BRUTALIST EDITORIAL DESIGN</div>
          <div className="ticker-item">CYBER MINIMALISM</div>
          <div className="ticker-item">IMPOSSIBLE TO IGNORE</div>
          <div className="ticker-item">ELITE BRAND LAUNCH</div>
          <div className="ticker-item">BRUTALIST EDITORIAL DESIGN</div>
          <div className="ticker-item">CYBER MINIMALISM</div>
          <div className="ticker-item">IMPOSSIBLE TO IGNORE</div>
        </div>
      </div>

      {/* Manifesto: Why generic SaaS looks forgettable */}
      <section className="section">
        <div className="container">
          <span className="mono-label">02 / WHY WE ARE DIFFERENT</span>
          <div className="manifesto-grid">
            <div>
              <h2 className="display-medium" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                WHY MOST LOCAL BUSINESSES LOOK TEMPLATE-MADE
              </h2>
            </div>
            <div>
              <p className="hero-desc" style={{ maxWidth: '100%' }}>
                Outdated agencies sell overpriced WordPress templates with zero character. They use safe layouts, standard SaaS fonts, and boring color models. They build pages for browsers, not humans. We create visual products that command authority and premium pricing.
              </p>
            </div>
          </div>

          {/* Before/After list grid */}
          <div className="ba-compare-grid">
            <div className="compare-card card-bad">
              <span className="compare-card-title">Outdated Templates</span>
              <ul className="compare-list">
                <li className="compare-item">
                  <X size={16} /> Generic white boxes with boring blue buttons
                </li>
                <li className="compare-item">
                  <X size={16} /> Over-minimalism that lacks character and memory
                </li>
                <li className="compare-item">
                  <X size={16} /> stock photos and generic clip-art icons
                </li>
                <li className="compare-item">
                  <X size={16} /> Clunky desktop scaling crammed onto mobile screen sizes
                </li>
              </ul>
            </div>

            <div className="compare-card card-good">
              <span className="compare-card-title">Oasic Standards</span>
              <ul className="compare-list">
                <li className="compare-item">
                  <Zap size={16} /> Bold editorial layouts built to inspire
                </li>
                <li className="compare-item">
                  <Zap size={16} /> Immersive dark mode layering & grain textures
                </li>
                <li className="compare-item">
                  <Zap size={16} /> Handcrafted assets & generative branding layouts
                </li>
                <li className="compare-item">
                  <Zap size={16} /> Apple-level responsive optimization
                </li>
              </ul>
            </div>
          </div>

          {/* Interactive Before vs After slider */}
          <div 
            className="before-after-container" 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseDown={handleStartDrag}
          >
            {/* Before (Background) */}
            <div className="ba-slider-pane pane-before">
              <img src="/jewelry_before.png" alt="Before" className="ba-img" />
            </div>

            {/* After (Foreground) */}
            <div 
              className="ba-slider-pane pane-after" 
              ref={afterPaneRef}
            >
              <img 
                ref={afterImgRef} 
                src="/jewelry_after.png" 
                alt="After" 
                className="ba-img" 
              />
              
              {/* Luxury Typography Overlay (Masked inside After pane) */}
              <div className="slider-typography-overlay" ref={typographyRef}>
                <h3 className="slider-overlay-title">THE LUMINA COLLECTION</h3>
                <p className="slider-overlay-subtext">
                  A testament to timeless elegance, crafted in 18k gold with hand-selected diamonds.
                </p>
              </div>
            </div>

            {/* Dynamic Sliding Labels (Attached to divider) */}
            <div className="ba-label-wrapper before-label-wrapper" ref={beforeLabelRef}>
              <span className="ba-label-pill">Before // Dull Template</span>
            </div>
            <div className="ba-label-wrapper after-label-wrapper" ref={afterLabelRef}>
              <span className="ba-label-pill">After // Cinematic Rebrand</span>
            </div>

            {/* Slider line & handle */}
            <div className="ba-handle" ref={handleRef}>
              <div className="ba-handle-btn">
                <Layers size={16} />
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Services Section */}
      <section id="services" className="section">
        <div className="container services-container" ref={servicesRef}>
          <span className="mono-label">04 / CORE CAPABILITIES</span>
          
          <h2 className="display-medium" style={{ marginBottom: '4rem', textAlign: 'left' }}>
            ENGINEERING ATTENTION
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="service-row">
              <span className="service-num">01/</span>
              <div className="service-text-group">
                <h3 className="service-title">Brutal Art Direction</h3>
                <p className="service-desc">Challenging aesthetics that command high-ticket market authority.</p>
              </div>
              <div className="service-tags">
                <span className="service-tag">Typography</span>
                <span className="service-tag">UX Strategy</span>
              </div>
            </div>

            <div className="service-row">
              <span className="service-num">02/</span>
              <div className="service-text-group">
                <h3 className="service-title">Kinetic Motion & WebGL</h3>
                <p className="service-desc">High-performance animations that retain user engagement and delight.</p>
              </div>
              <div className="service-tags">
                <span className="service-tag">GSAP Engine</span>
                <span className="service-tag">Fluid dynamics</span>
              </div>
            </div>

            <div className="service-row">
              <span className="service-num">03/</span>
              <div className="service-text-group">
                <h3 className="service-title">High-Conversion SEO</h3>
                <p className="service-desc">Invisible architecture that places your brand in front of the right elite audience.</p>
              </div>
              <div className="service-tags">
                <span className="service-tag">Semantic HTML</span>
                <span className="service-tag">Page speed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agency Philosophy */}
      <section id="philosophy" className="section">
        <div className="container">
          <span className="mono-label">05 / PHILOSOPHY</span>
          
          <div className="philosophy-grid" style={{ marginTop: '3rem' }}>
            <div className="philosophy-left">
              <h2 className="display-medium" style={{ textAlign: 'left', lineHeight: '1.0' }}>
                WE DO NOT BUILD COMPROMISES.
              </h2>
              <div style={{ marginTop: '2rem' }}>
                <p className="hero-desc" style={{ color: 'var(--color-silver)' }}>
                  OASIC was built out of pure obsession for visual dominance. Every brand deserves an interface that represents their core energy.
                </p>
              </div>
            </div>
            
            <div className="philosophy-quote-card">
              <p className="philosophy-text-giant">
                “Design is not a decorative layer. It is the core financial instrument of your brand. When your interface looks expensive, your product feels expensive. Good layout is intimidation.”
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Massive CTA */}
      <section id="contact" className="section" style={{ borderBottom: 'none' }}>
        <div className="container">
          <div className="cta-large-text" style={{ textAlign: 'center', marginBottom: '6rem' }}>
            <span>READY TO LOOK</span>
            <span className="stroke-text">WILDLY EXPENSIVE?</span>
          </div>

          <div className="contact-split-layout">
            <div className="contact-manifesto">
              <span className="mono-label">06 / ACCESS CONTRACT</span>
              <h2 className="display-medium" style={{ marginTop: '2rem', lineHeight: '1.1', textTransform: 'uppercase' }}>
                WE DESPISE TEMPLATES.<br />
                RESERVATION<br />
                OPEN.
              </h2>
              <p className="hero-desc" style={{ marginTop: '2rem', maxWidth: '400px' }}>
                We design and engineer bespoke visual systems. Enter your details to initiate a secure transmission with our lead architect.
              </p>
            </div>

            <div className="contact-form-container">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  setFormStatus('sending');
                  const nameVal = e.target.elements.clientName.value;
                  const emailVal = e.target.elements.clientEmail.value;
                  const scopeVal = e.target.elements.clientScope.value;

                  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_4awo7fj';
                  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_39vk0en';
                  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '76uYnxUelRWKKI7fP';

                  const isSandbox = 
                    !serviceId || serviceId === 'YOUR_SERVICE_ID' || serviceId.trim() === '' ||
                    !templateId || templateId === 'YOUR_TEMPLATE_ID' || templateId.trim() === '' ||
                    !publicKey || publicKey === 'YOUR_PUBLIC_KEY' || publicKey.trim() === '';

                  if (isSandbox) {
                    // Sandbox / Demo mode: bypass API to prevent 400 error in dev console
                    console.warn("Oasic Sandbox: EmailJS keys not configured. Demoing success state.");
                    setTimeout(() => {
                      setFormStatus('success');
                      e.target.reset();
                      setShowNotification(true);
                      setTimeout(() => {
                        setShowNotification(false);
                        setFormStatus('idle');
                      }, 4000);
                    }, 800); // Small delay to simulate sending
                  } else {
                    emailjs.send(
                      serviceId,
                      templateId,
                      {
                        name: nameVal,
                        email: emailVal,
                        message: scopeVal,
                        title: 'Oasic Project Request'
                      },
                      {
                        publicKey: publicKey
                      }
                    )
                    .then(() => {
                      setFormStatus('success');
                      e.target.reset();
                      setShowNotification(true);
                      setTimeout(() => {
                        setShowNotification(false);
                        setFormStatus('idle');
                      }, 4000);
                    })
                    .catch((err) => {
                      console.error("EmailJS dispatch error:", err);
                      setFormStatus('idle');
                    });
                  }
                }}
                className="contact-form"
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                  <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textTransform: 'uppercase', color: '#888' }}>
                    Full Name / Agency Name
                  </label>
                  <input 
                    name="clientName"
                    type="text" 
                    required
                    placeholder="Your Name"
                    style={{ 
                      backgroundColor: 'var(--bg-obsidian)', 
                      border: '1px solid var(--glass-stroke)',
                      color: 'var(--color-silver)',
                      padding: '1rem',
                      fontFamily: 'var(--font-body)',
                      fontSize: '1rem',
                      outline: 'none'
                    }} 
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                  <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textTransform: 'uppercase', color: '#888' }}>
                    Secure Email Address
                  </label>
                  <input 
                    name="clientEmail"
                    type="email" 
                    required
                    placeholder="alexis@oasic.agency"
                    style={{ 
                      backgroundColor: 'var(--bg-obsidian)', 
                      border: '1px solid var(--glass-stroke)',
                      color: 'var(--color-silver)',
                      padding: '1rem',
                      fontFamily: 'var(--font-body)',
                      fontSize: '1rem',
                      outline: 'none'
                    }} 
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                  <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textTransform: 'uppercase', color: '#888' }}>
                    Your Ambition / Project Scope
                  </label>
                  <textarea 
                    name="clientScope"
                    rows="4"
                    placeholder="We want to relaunch our jewelry brand with a cyber-minimalist design..."
                    style={{ 
                      backgroundColor: 'var(--bg-obsidian)', 
                      border: '1px solid var(--glass-stroke)',
                      color: 'var(--color-silver)',
                      padding: '1rem',
                      fontFamily: 'var(--font-body)',
                      fontSize: '1rem',
                      outline: 'none',
                      resize: 'none'
                    }} 
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-brutalist" 
                  style={{ alignSelf: 'flex-start', marginTop: '1rem' }}
                  disabled={formStatus === 'sending'}
                >
                  {formStatus === 'sending' ? 'Sending...' : formStatus === 'success' ? 'Sent' : 'Request'} <ChevronRight size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="container footer-bottom">
          <span>&copy; {new Date().getFullYear()} OASIC CO. ALL RIGHTS RESERVED.</span>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#services">Terms</a>
            <a href="#philosophy">Philosophy</a>
            <a href="#hero">Back to Top</a>
          </div>
        </div>
      </section>

      {/* Toast Notification popup */}
      {showNotification && (
        <div className="toast-notification">
          <div className="toast-content">
            <div className="toast-icon-wrapper">
              <Sparkles size={16} />
            </div>
            <div>
              <span className="toast-title">SENT</span>
              <p className="toast-body">Message sent successfully.</p>
            </div>
          </div>
          <div className="toast-progress-bar" />
        </div>
      )}

      {/* Bottom Navigation Bar for Mobile */}
      <nav className="bottom-nav">
        <a href="#hero" className="bottom-nav-item">
          <Layers size={20} />
          <span className="bottom-nav-label">Portfolio</span>
        </a>
        <a href="#philosophy" className="bottom-nav-item">
          <Info size={20} />
          <span className="bottom-nav-label">Agency</span>
        </a>
        <a href="#contact" className="bottom-nav-item highlight">
          <Plus size={20} />
          <span className="bottom-nav-label">Start</span>
        </a>
      </nav>
    </>
  );
}

export default App;
