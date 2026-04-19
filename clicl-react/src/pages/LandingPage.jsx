import React, { useState, useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import { Link } from 'react-router-dom';
import clickLogo from '../assets/imagenes/logo click png N.png';
import bonsaiLogo from '../assets/imagenes/logo-bonsai-sushi.webp';

/**
 * Utility to split text into characters while preserving HTML structure
 */
function splitText(element) {
    if (!element) return { chars: [] };

    const charElements = [];

    function processNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent;
            const fragment = document.createDocumentFragment();
            [...text].forEach(char => {
                if (char.trim() === '') {
                    fragment.appendChild(document.createTextNode(char));
                } else {
                    const span = document.createElement('span');
                    span.textContent = char;
                    span.className = 'char';
                    fragment.appendChild(span);
                    charElements.push(span);
                }
            });
            node.parentNode.replaceChild(fragment, node);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE') {
                const children = Array.from(node.childNodes);
                children.forEach(processNode);
            }
        }
    }

    processNode(element);
    return { chars: charElements };
}

function LandingPage() {
    const [scrolled, setScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [hoveredService, setHoveredService] = useState(null);
    const heroTitleRef = useRef(null);
    const statsBarRef = useRef(null);
    const playerRef = useRef(null);

    const handleNavClick = (e, id) => {
        e.preventDefault();
        const section = document.getElementById(id);
        if (!section) return;
        setIsMenuOpen(false); // Close menu if open
        const offset = 96; // navbar height
        const top = section.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
    };

    // Scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);

        // Check for hash on mount (e.g., #auditoria coming from another page)
        if (window.location.hash) {
            const id = window.location.hash.substring(1);
            setTimeout(() => {
                const section = document.getElementById(id);
                if (section) {
                    const offset = 96;
                    const top = section.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({ top, behavior: 'smooth' });
                    
                    // Explicitly pause if hash exists to double check
                    if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
                        playerRef.current.pauseVideo();
                    }
                }
            }, 500); // Small delay to ensure content is rendered
        }

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Reveal on scroll
    useEffect(() => {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.05, rootMargin: '0px 0px -50px 0px' });

        document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
        return () => revealObserver.disconnect();
    }, []);

    // Stats counter + entrance animation
    useEffect(() => {
        if (!statsBarRef.current) return;
        const cards = Array.from(statsBarRef.current.querySelectorAll('.stat-card'));
        const numbers = Array.from(statsBarRef.current.querySelectorAll('.stat-number'));

        const targets = numbers.map(el => ({
            el,
            target: parseFloat(el.dataset.target),
            suffix: el.dataset.suffix,
        }));

        function runCountUp() {
            targets.forEach(({ el, suffix }) => { el.innerText = '0' + suffix; });
            const duration = 1800;
            const startTime = performance.now();
            function tick(now) {
                const p = Math.min((now - startTime) / duration, 1);
                const eased = 1 - Math.pow(1 - p, 4);
                targets.forEach(({ el, target, suffix }) => {
                    el.innerText = (p < 1 ? Math.floor(eased * target) : target) + suffix;
                });
                if (p < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        }

        cards.forEach(c => { c.style.opacity = '0'; c.style.transform = 'translateY(1.5rem)'; });

        const observer = new IntersectionObserver((entries) => {
            if (!entries[0].isIntersecting) return;
            observer.disconnect();

            animate(cards, {
                opacity: [0, 1],
                translateY: ['1.5rem', '0rem'],
                duration: 700,
                ease: 'outExpo'
            });

            runCountUp();

            if (statsBarRef.current) {
                statsBarRef.current.addEventListener('mouseenter', runCountUp);
            }
        }, { threshold: 0.4 });

        observer.observe(statsBarRef.current);
        return () => {
            observer.disconnect();
            if (statsBarRef.current) {
                statsBarRef.current.removeEventListener('mouseenter', runCountUp);
            }
        };
    }, []);

    // Hero title animation
    useEffect(() => {
        if (heroTitleRef.current) {
            const { chars } = splitText(heroTitleRef.current);
            if (chars.length > 0) {
                animate(chars, {
                    translateX: ['-1.5rem', '0rem'],
                    opacity: [0, 1],
                    scale: [0.9, 1],
                    delay: stagger(60),
                    duration: 1000,
                    ease: 'outExpo',
                    loop: true,
                    loopDelay: 1500
                });
            }
        }
    }, []);

    // GoHighLevel Script Loading
    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://link.msgsndr.com/js/form_embed.js";
        script.type = "text/javascript";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            const existingScript = document.querySelector('script[src="https://link.msgsndr.com/js/form_embed.js"]');
            if (existingScript) {
                document.body.removeChild(existingScript);
            }
        };
    }, []);

    // YouTube IFrame API Logic
    useEffect(() => {
        const initPlayer = () => {
            if (window.YT && window.YT.Player && !playerRef.current) {
                playerRef.current = new window.YT.Player('youtube-player', {
                    videoId: 'T8CUMBlcytg',
                    playerVars: {
                        autoplay: 0,
                        mute: 1,
                        loop: 1,
                        playlist: 'T8CUMBlcytg',
                        controls: 1,
                        modestbranding: 1,
                        rel: 0,
                        showinfo: 0,
                        iv_load_policy: 3,
                        enablejsapi: 1,
                        origin: window.location.origin
                    },
                    events: {
                        onReady: (event) => {
                            event.target.setVolume(50);
                            event.target.unMute();
                            // Removed immediate playVideo to let IntersectionObserver handle it
                        },
                        onStateChange: (event) => {
                            if (event.data === window.YT.PlayerState.ENDED) {
                                event.target.playVideo();
                            }
                        }
                    }
                });
            }
        };

        if (window.YT && window.YT.Player) {
            initPlayer();
        } else {
            if (!document.getElementById('youtube-api-script')) {
                const tag = document.createElement('script');
                tag.id = 'youtube-api-script';
                tag.src = "https://www.youtube.com/iframe_api";
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            }

            const previousOnYouTubeIframeAPIReady = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => {
                if (previousOnYouTubeIframeAPIReady) previousOnYouTubeIframeAPIReady();
                initPlayer();
            };
        }
    }, []);

    // Smart Video Play/Pause based on visibility
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
                    if (entry.isIntersecting) {
                        playerRef.current.playVideo();
                    } else {
                        playerRef.current.pauseVideo();
                    }
                }
            });
        }, { threshold: 0.3 }); // Play when 30% of the video is visible

        const videoContainer = document.getElementById('youtube-player');
        if (videoContainer) {
            observer.observe(videoContainer);
        }

        return () => observer.disconnect();
    }, []);


    return (
        <div className="text-navy antialiased font-sans bg-navy min-h-screen">
            {/* Header / Navbar at 100% */}
            <header className={`fixed top-0 w-full z-[100] transition-all duration-500 ${scrolled ? 'bg-navy/95 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-navy/40 backdrop-blur-sm py-6 md:py-8'}`}>
                <nav className="max-w-[1600px] mx-auto px-6 sm:px-8 flex items-center justify-between">
                    <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center cursor-pointer">
                        <img src={clickLogo} alt="Click Productions Logo" className="h-16 w-auto object-contain" />
                    </Link>
                    <div className="hidden md:flex items-center gap-10 text-white">
                        <Link to="/" className="text-[11px] font-black hover:text-primary transition-colors uppercase tracking-[0.3em] cursor-pointer">Inicio</Link>
                        <Link to="/creacion-contenido" className="text-[11px] font-black hover:text-primary transition-colors uppercase tracking-[0.3em] cursor-pointer">Contenido</Link>
                        <Link to="/crecimiento-ads" className="text-[11px] font-black hover:text-primary transition-colors uppercase tracking-[0.3em] cursor-pointer">Ads</Link>
                    </div>

                    <div className="flex items-center gap-6">
                        <button 
                            onClick={(e) => handleNavClick(e, 'auditoria')}
                            className="hidden md:block btn-premium border border-white/20 text-white px-10 py-4 text-[11px] font-black transition-all uppercase tracking-[0.3em] hover:border-primary hover:bg-primary text-center"
                        >
                            Auditoría Gratuita
                        </button>

                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="md:hidden flex flex-col gap-1.5 p-2"
                        >
                            <div className="w-8 h-0.5 bg-primary"></div>
                            <div className="w-8 h-0.5 bg-white"></div>
                            <div className="w-5 h-0.5 bg-primary self-end"></div>
                        </button>
                    </div>
                </nav>
            </header>

            {/* Mobile Menu Overlay - MOVED OUTSIDE HEADER TO AVOID BACKDROP-BLUR CONTAINING BLOCK */}
            <div className={`fixed inset-0 z-[200] transition-all duration-700 ease-expo flex flex-col md:hidden ${isMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
                {/* Background overlay */}
                <div className={`absolute inset-0 bg-navy transition-opacity duration-700 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}></div>
                
                {/* Menu Content */}
                <div className={`relative flex flex-col h-full w-full transition-transform duration-700 ease-expo ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex justify-between items-center p-6 border-b border-white/5">
                        <img src={clickLogo} alt="Click Productions" className="h-10 w-auto opacity-50" />
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="text-white p-2"
                        >
                            <span className="material-symbols-outlined text-4xl text-primary notranslate" translate="no">close</span>
                        </button>
                    </div>

                    <div className="flex flex-col gap-6 w-full px-8 pt-10 overflow-y-auto flex-grow">
                        {[
                            { label: 'Inicio', target: '/', type: 'link' },
                            { label: 'Contenido', target: '/creacion-contenido', type: 'link' },
                            { label: 'Ads', target: '/crecimiento-ads', type: 'link' }
                        ].map((item, idx) => (
                            <React.Fragment key={item.label}>
                                {item.type === 'link' ? (
                                    <Link
                                        to={item.target}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`text-2xl sm:text-3xl font-black text-white hover:text-primary uppercase tracking-tighter transition-all duration-700 ease-out flex items-end gap-3 border-b border-white/5 pb-4 ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                                        style={{ transitionDelay: `${150 + (idx * 100)}ms` }}
                                    >
                                        <span className="text-primary text-[10px] tracking-widest mb-1 font-bold">0{idx + 1}.</span>
                                        {item.label}
                                    </Link>
                                ) : (
                                    <a
                                        onClick={(e) => {
                                            setIsMenuOpen(false);
                                            setTimeout(() => handleNavClick(e, item.target), 300);
                                        }}
                                        className={`text-2xl sm:text-3xl font-black text-white hover:text-primary uppercase tracking-tighter transition-all duration-700 ease-out flex items-end gap-3 border-b border-white/5 pb-4 cursor-pointer ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                                        style={{ transitionDelay: `${150 + (idx * 100)}ms` }}
                                    >
                                        <span className="text-primary text-[10px] tracking-widest mb-1 font-bold">0{idx + 1}.</span>
                                        {item.label}
                                    </a>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    <div className={`p-8 w-full mt-auto pb-12 transition-all duration-700 ease-out md:hidden ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} delay-300`}>
                        <button 
                            onClick={(e) => {
                                setIsMenuOpen(false);
                                handleNavClick(e, 'auditoria');
                            }}
                            className="block w-full btn-premium bg-primary text-white py-5 font-black uppercase tracking-widest text-center shadow-2xl"
                        >
                            Auditoría Gratuita
                        </button>
                    </div>
                </div>
            </div>

            <main>
                {/* Desktop and original structure remains unaffected down here */}
                {/* Hero Section at 100% scale for stability */}
                <section className="min-h-[80vh] flex flex-col justify-center px-6 sm:px-8 pt-36 md:pt-32 pb-20 md:pb-40 bg-navy relative overflow-x-clip overflow-y-visible">
                    <div className="max-w-[1400px] mx-auto w-full relative z-10 flex-grow flex flex-col justify-center mt-10 md:mt-0">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                            <div className="reveal reveal-left flex flex-col justify-center items-center h-full text-center">
                                <div className="max-w-[100vw] px-4 md:px-0 md:max-w-3xl w-full flex flex-col items-center overflow-visible">
                                    <h1 ref={heroTitleRef} className="text-primary text-[2rem] sm:text-[2.2rem] md:text-7xl lg:text-8xl xl:text-[7.2rem] font-black leading-tight md:leading-[0.9] tracking-tighter uppercase mb-6 md:mb-8 mx-auto whitespace-nowrap overflow-visible">
                                        VALIENTE.<br />CREATIVO.<br /><span className="text-white">IMPARABLE.</span>
                                    </h1>
                                    <p className="text-white/80 text-base md:text-xl font-bold leading-tight uppercase mb-8 md:mb-10 tracking-tight max-w-xl mx-auto">
                                        Somos Click Productions. Una agencia de alto impacto para marcas listas para dominar el panorama digital.
                                    </p>
                                    <div className="flex gap-4 justify-center">
                                        <button
                                            onClick={(e) => handleNavClick(e, 'ejecucion')}
                                            className="btn-premium bg-primary text-white px-8 py-4 md:px-10 md:py-5 text-xs md:text-sm font-black uppercase tracking-widest hover:brightness-110 transition-all"
                                        >
                                            Ver Portafolio
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="reveal reveal-right flex justify-center items-center h-full">
                                <div className="relative group w-full max-w-[540px]">
                                    <div className="absolute -inset-1 bg-primary/20 rounded-[2rem] blur-xl group-hover:bg-primary/40 transition-all duration-700"></div>
                                    <div className="absolute -inset-8 bg-primary/5 rounded-[3rem] blur-3xl group-hover:opacity-100 transition-all duration-700"></div>
                                    
                                    <div className="relative aspect-video bg-navy-accent rounded-2xl overflow-hidden shadow-[0_30px_80px_-20px_rgba(1,5,33,1),0_0_30px_rgba(241,90,36,0.2)] border border-white/10 group-hover:border-primary/30 transition-all duration-700">
                                        <div id="youtube-player" className="w-full h-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="relative md:absolute md:bottom-0 left-0 w-full md:px-8 md:translate-y-1/2 z-20 mt-12 md:mt-0 px-2 lg:px-4">
                        <div className="max-w-[1600px] mx-auto bg-navy border border-white/10 border-t-2 border-t-primary shadow-2xl reveal reveal-up overflow-hidden rounded-2xl md:rounded-none">
                            <div className="grid grid-cols-1 md:grid-cols-3 py-8 md:py-8" ref={statsBarRef}>
                                <div className="stat-card border-b md:border-b-0 md:border-r border-white/10 pb-8 md:pb-0 mb-8 md:mb-0">
                                    <span className="text-xs font-black tracking-[0.4em] text-white/30 uppercase mb-3 block">— 01 —</span>
                                    <span className="stat-number text-5xl md:text-6xl font-black text-primary mb-3" data-target="250" data-suffix="+">250+</span>
                                    <span className="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase">Proyectos Entregados</span>
                                </div>
                                <div className="stat-card border-b md:border-b-0 md:border-r border-white/10 pb-8 md:pb-0 mb-8 md:mb-0">
                                    <span className="text-xs font-black tracking-[0.4em] text-white/30 uppercase mb-3 block">— 02 —</span>
                                    <span className="stat-number text-5xl md:text-6xl font-black text-primary mb-3" data-target="15" data-suffix="M+">15M+</span>
                                    <span className="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase">Alcance Orgánico</span>
                                </div>
                                <div className="stat-card md:pb-0 md:mb-0">
                                    <span className="text-xs font-black tracking-[0.4em] text-white/30 uppercase mb-3 block">— 03 —</span>
                                    <span className="stat-number text-5xl md:text-6xl font-black text-primary mb-3" data-target="100" data-suffix="%">100%</span>
                                    <span className="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase">Retención de Clientes</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Rest of content remains scaled to 90% if preferred */}
                <div className="page-scale-90">
                    <section className="pt-40 pb-20 px-8 mesh-gradient-studio studio-texture overflow-hidden" id="ejecucion">
                        <div className="max-w-[1600px] mx-auto relative z-10">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-16 reveal reveal-up">
                                <div className="max-w-4xl">
                                    <span className="text-primary font-black uppercase tracking-[0.4em] text-sm mb-6 block border-l-4 border-primary pl-4">Especialistas</span>
                                    <h2 className="text-4xl md:text-[5.5rem] font-black leading-[0.8] tracking-tighter uppercase text-navy">
                                        Lo Que<br /><span className="text-primary italic">Ejecutamos.</span>
                                    </h2>
                                </div>
                                <div className="md:border-l-4 border-navy/10 md:pl-12 py-4 max-w-sm">
                                    <p className="text-navy/80 text-lg uppercase leading-tight font-bold tracking-tight">
                                        Un enfoque riguroso de estudio físico aplicado a la producción digital de vanguardia.
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row gap-4 md:gap-px bg-transparent md:bg-white/10 border-0 md:border md:border-white/10 shadow-none md:shadow-2xl reveal reveal-up overflow-hidden">
                                {[
                                    { id: '01', icon: 'movie_edit', title: 'Creación de\nContenido', desc: 'Producción de calidad cinematográfica adaptada a los algoritmos sociales modernos y al storytelling de marca de alta conversión.', items: ['Producción de video', 'Activos sociales'], link: '/creacion-contenido' },
                                    { id: '02', icon: 'groups_3', title: 'Departamento\nExterno', desc: 'Nos convertimos en tu departamento de marketing. Desde estrategia nivel CMO hasta despliegue diario y gestión de comunidad.', items: ['Integración de equipo', 'Resultados escalables'] },
                                    { id: '03', icon: 'ads_click', title: 'Crecimiento\ny Ads', desc: 'Campañas publicitarias orientadas al rendimiento que aprovechan nuestra creatividad personalizada para maximizar el ROAS.', items: ['Adquisición de pago', 'Optimización de funnel'], link: '/crecimiento-ads' },
                                ].map(service => (
                                    <div
                                        key={service.id}
                                        onMouseEnter={() => setHoveredService(service.id)}
                                        onMouseLeave={() => setHoveredService(null)}
                                        className={`
                                            bg-navy p-12 md:p-16 transition-all duration-500 ease-in-out relative overflow-hidden flex-1 border-t-4
                                            ${hoveredService === service.id ? 'md:flex-[1.4] bg-navy-accent z-10 shadow-[0_30px_60px_-15px_rgba(241,90,36,0.25)] scale-[1.03] border-primary' : 'border-white/10'}
                                            ${hoveredService !== null && hoveredService !== service.id ? 'opacity-70 scale-[0.98]' : 'opacity-100'}
                                        `}
                                    >
                                        <div className="absolute top-0 right-0 p-6 opacity-20">
                                            <span className="text-8xl font-black text-white">{service.id}</span>
                                        </div>
                                        <span className="material-symbols-outlined text-primary text-6xl mb-12 group-hover:scale-110 transition-transform block notranslate" translate="no">{service.icon}</span>
                                        <h3 className="text-4xl font-black text-white uppercase tracking-tighter mb-8 leading-none" dangerouslySetInnerHTML={{ __html: service.title.replace('\n', '<br />') }}></h3>
                                        <p className="text-white/50 text-sm uppercase leading-relaxed mb-12 font-medium">{service.desc}</p>
                                        <ul className={`space-y-5 ${service.link ? 'mb-8' : 'mb-8'}`}>
                                            {service.items.map(item => (
                                                <li key={item} className="flex items-center gap-4 text-xs font-bold tracking-widest uppercase text-white">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-primary"></span> {item}
                                                </li>
                                            ))}
                                        </ul>
                                        
                                        {service.link && (
                                            <div className="mt-12">
                                                <Link 
                                                    to={service.link}
                                                    className="inline-flex items-center gap-2 px-6 py-3 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all duration-300 rounded-sm"
                                                >
                                                    Ver Resultado
                                                    <span className="material-symbols-outlined text-sm notranslate" translate="no">arrow_forward</span>
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="py-20 px-8 mesh-gradient-studio studio-texture border-t border-navy/5" id="servicios">
                        <div className="max-w-[1600px] mx-auto relative z-10">
                            <div className="max-w-4xl mb-12 reveal reveal-left">
                                <span className="text-primary font-black uppercase tracking-[0.4em] text-sm mb-6 block border-l-4 border-primary pl-4">Ecosistema Completo</span>
                                <h2 className="text-4xl md:text-[5.5rem] font-black leading-[0.8] tracking-tighter uppercase text-navy">
                                    Nuestros<br /><span className="text-primary italic">Servicios.</span>
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-8 border-t border-navy/10 pt-12 reveal reveal-up">
                                {['Estrategia de Marca y Branding', 'Gestión de Redes Sociales', 'Publicidad Digital', 'SEO & Posicionamiento', 'Email y WhatsApp Marketing', 'Automatización', 'Producción de Contenido', 'Marketing de Influencers', 'Análisis de Datos', 'Organización de Eventos', 'Publicidad Fisica'].map(service => (
                                    <div key={service} className="service-item">
                                        <span className="material-symbols-outlined text-primary font-bold text-3xl notranslate" translate="no">check_circle</span>
                                        <span className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-navy">{service}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="py-20 px-8 bg-off-white studio-texture border-b border-navy/5" id="clientes">
                        <div className="max-w-[1600px] mx-auto text-center relative z-10 reveal reveal-up">
                            <h2 className="text-2xl md:text-3xl font-black text-navy uppercase tracking-tighter mb-10">Marcas con las que hemos trabajado</h2>
                            <div className="logo-cloud grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-16 items-center justify-items-center">
                                {[
                                    { alt: 'Bonsai Sushi', src: bonsaiLogo },
                                    { alt: 'Humboldt', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3_8wLYzeXioOaFdgkNboXK89IPZnjHw2NSGQ9SYC35tHrl4m_ftRcZBFAGTtJGTiZmbYz5JjjOoEG2G9St1TcQCbUABSJGpz1y20zSzxvnL8qWJQXG67cv1nR9vTDrHhS_BHGKgsG3p1gEf7j_mANnWSZ2lpnOsCbfi0wgvuQyEnfr73vQNPYGEO0T8o_KIzMBASLBxO3rMfgCHljGV85vnslrkas9s0lS48t-M7KE5S8KvMDlgcTsz3KA4LYTG9xZtNNNnxGqHU' },
                                    { alt: 'Crestoil', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzZUQ1SJv3lUabYSjpyavNJIylUZm0yJiazoWn5Czma05ZjNDXkfTgZoGUjM46rA8T3-FdcmmtfzwgJgn35p5HFBY_95qlUBvjeb2Vo--7yqa5P4VgpPpbkv5fXmROVPOXDW3TYwjgNc0RZFCvTGZnu3Td-arHumJOQecp2q_oCcpxs8Att7vaaPa839B6jL9r3lZcnb4NnVN-ueD1ytuJ7kj46GMVasdWaqVRtmp1QVeGSnRyWB9XUE0fih73yeLqcPjPfd6qSpE' },
                                    { alt: 'Digital Valley', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFNJ5UA474JdCAs9zYn0hBWFi7piMcDzykPs0VHOqrn_cX1YYDQMwMv3WBAdkpet7hTiV50qFALophWxPTC2LlmhU2M3PERMDWH9GLWliIEVSFAaHfxkJVt3t9HgIx94t46sWZaQFo5AmsM-8EeSo1bmW9o_bDddQ1JMUEuE1iPotRLxVbWVA5-cChTp3nk6RdpfjGJ0Yl3KnhPqF32XjtuSNEqPwDwsuYDYVg0H6t-fWWFq8_UzTqk8r2xHdOZAAH2MG-Vj97eHA' },
                                    { alt: 'Aruns', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAe2W6EKU8wKmRlUHNLfZwlK2U5LT7EeTBp_yy1YLZgyS06fm7Z_8IgjBMgDxD1imgj3GCzIEWFzTGmkFUqDjQPHGOq-va_y1TO5li25Yy8BGXSFOk_PNMGwA22SUsIuiNSyG3cxbDeyPCOj6vsM_ZLUW7yTU_kTFeGbJ4awvQmRF1KRi6BPQUR25MNpO7qo2tTRGRG3O7wAknexdw1AuPEMj4zgGd7Jn38PiIU0RBSVACEYNABslVsfIZqrc3el2fU9uINlSZhWso' },
                                    { alt: 'Guds', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0q3VAy4By_Dcw99AGwSvT2k92bgOdiZALv5pVJDid6TaySES4YuLwqKBmBs7CRBu3XHxAh5Ofy0l7KJICewCe9NBGnyhi1VvP6sgOBWDwMTZh2DrzbULjCHvqsesmnDEdc2n9RyNRGSbo74760NHgCmzmRNlrjI92bBAOqae6QG6ETiXvsh4oNA7Gv0rXtl9kuYpolgUEjAfjbT7pIRYzlHBkNTbWCOv-1Kg5MssBdEUYacXPFZ3Zzf_ZPZAamXWNrdpwsbkZWp4' }
                                ].map(brand => (
                                    <img key={brand.alt} alt={brand.alt} className="h-12 w-auto object-contain" src={brand.src} />
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="py-20 px-8 mesh-gradient-studio studio-texture overflow-hidden" id="auditoria">
                        <div className="max-w-[1600px] mx-auto relative z-10">
                            <div className="text-center mb-14 reveal reveal-up">
                                <span className="text-primary font-black uppercase tracking-[0.4em] text-sm mb-6 block">Siguiente Paso</span>
                                <h2 className="text-4xl md:text-[5.5rem] font-black text-navy uppercase tracking-tighter leading-[0.8]">SOLICITA TU<br /><span className="text-primary italic">AUDITORÍA.</span></h2>
                            </div>
                        <div className="bg-white shadow-[0_40px_80px_-20px_rgba(1,5,33,0.1)] max-w-7xl mx-auto flex flex-col md:flex-row min-h-[1000px] overflow-hidden rounded-2xl">
                            <div className="w-full md:w-[35%] bg-white p-10 md:p-12 border-r border-navy/5 flex flex-col">
                                <div className="space-y-8">
                                    <h3 className="text-4xl font-black text-navy uppercase leading-[0.9] tracking-tighter">Auditoría de<br />Negocio</h3>
                                    <div className="flex items-center gap-4 text-navy/40 font-bold uppercase tracking-widest text-xs">
                                        <span className="material-symbols-outlined text-base notranslate" translate="no">calendar_today</span> 30 min
                                    </div>
                                    <div className="space-y-6 pt-8 border-t border-navy/5">
                                        <p className="text-navy/70 text-sm font-medium uppercase leading-relaxed">
                                            Selecciona una fecha y hora para su auditoría. Vamos a trazar el plan para escalar su marca.
                                        </p>

                                        <div className="pt-8">
                                            <p className="text-navy/80 text-xs font-black uppercase tracking-wider mb-6">¿Qué te vas a llevar?</p>
                                            <ul className="space-y-6">
                                                {[
                                                    { icon: 'support_agent', text: '30 min con un experto' },
                                                    { icon: 'analytics', text: 'Diagnóstico de estrategia' },
                                                    { icon: 'search_check', text: 'Auditoría de Ads, Web y RRSS' }
                                                ].map(item => (
                                                    <li key={item.text} className="flex items-start gap-5 text-navy/60 text-xs font-bold uppercase tracking-tight">
                                                        <span className="material-symbols-outlined text-primary text-2xl flex-shrink-0 leading-none notranslate" translate="no">{item.icon}</span>
                                                        <span className="pt-1">{item.text}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-auto pt-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-studio-gray"></div>
                                        <div>
                                            <p className="text-[11px] font-black uppercase text-navy">Nerio Mosqueda</p>
                                            <p className="text-[10px] font-bold uppercase text-navy/30 leading-none">CEO de Click Productions</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full md:w-[65%] p-0 relative bg-[#f7f8f9] min-h-[1000px]">
                                <iframe
                                    src="https://api.leadconnectorhq.com/widget/booking/58myzAfpJKhAYNOl22WJ"
                                    style={{ width: '100%', height: '100%', minHeight: '1000px', border: 'none', overflow: 'hidden' }}
                                    scrolling="no"
                                    id="58myzAfpJKhAYNOl22WJ_1776451857130"
                                    title="GoHighLevel Calendar"
                                ></iframe>
                            </div>
                            </div>
                        </div>
                    </section>

                    <footer className="bg-navy py-16 px-8 text-white relative overflow-hidden">
                        <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10 reveal reveal-up">
                            <div className="col-span-1 md:col-span-2">
                                <div className="flex items-center mb-6">
                                    <img src={clickLogo} alt="Click Productions Logo" className="h-10 w-auto object-contain" />
                                </div>
                                <p className="text-white/40 font-bold uppercase tracking-widest leading-loose max-w-sm text-[10px]">
                                    Agencia creativa de alto impacto especializada en alcance masivo y outsourcing total.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-black uppercase tracking-widest text-[10px] text-primary mb-6">Conectar</h4>
                                <ul className="space-y-4">
                                    {['Instagram', 'LinkedIn'].map(sm => (
                                        <li key={sm}><a className="text-[10px] text-white hover:text-primary transition-colors font-black uppercase tracking-widest" href="#">{sm}</a></li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-black uppercase tracking-widest text-[10px] text-primary mb-6">Contacto</h4>
                                <p className="text-[10px] text-white font-black uppercase tracking-widest mb-2">hola@click.pro</p>
                                <p className="text-[10px] text-white/40 font-medium uppercase tracking-widest">Disponible Globalmente</p>
                            </div>
                        </div>
                        <div className="max-w-[1600px] mx-auto pt-12 mt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                            <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.5em]">© 2024 CLICK PRODUCTIONS. BOLD MOVE.</p>
                            <div className="flex gap-12">
                                <span className="text-[9px] text-primary font-black uppercase tracking-[0.4em]">EL IMPACTO PRIMERO</span>
                                <span className="text-[9px] text-primary font-black uppercase tracking-[0.4em]">GUIADOS POR DATOS</span>
                            </div>
                        </div>
                    </footer>
                </div>
            </main>
            </div>
        );
    }

    export default LandingPage;
