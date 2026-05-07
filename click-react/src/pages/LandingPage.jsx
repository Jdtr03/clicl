import React, { useState, useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode } from 'swiper/modules';

// Estilos de Swiper

import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/free-mode';


// Assets e imágenes
import clickLogo from '../assets/imagenes/logo click png N.png';
import { brands } from '../assets/utils/getLogos.js';
import carruzel1 from '../assets/imagenes/Marcas/MAGDA.png';
import carruzel2 from '../assets/imagenes/Marcas/11-SHAWARMA-ZUZU.png';
import carruzel3 from '../assets/imagenes/Marcas/16-BLUEXPRESS.png';
import carruzel4 from '../assets/imagenes/Marcas/08-ILUVENCA.png';
import carruzel5 from '../assets/imagenes/Marcas/05-LA-BUFALA.png';


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
    const brandsSectionRef = useRef(null);
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

        const currentStatsBarRef = statsBarRef.current;
        observer.observe(currentStatsBarRef);
        return () => {
            observer.disconnect();
            if (currentStatsBarRef) {
                currentStatsBarRef.removeEventListener('mouseenter', runCountUp);
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
        <div className="text-navy antialiased font-sans bg-navy min-h-screen overflow-x-hidden">
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

            <main className="md:pt-8" style={{ zoom: 0.9, MozTransform: 'scale(0.9)', MozTransformOrigin: 'top center' }}>
                {/* Desktop and original structure remains unaffected down here */}
                {/* Hero Section at 100% scale for stability */}
                <section className="min-h-[80vh] flex flex-col justify-center px-6 sm:px-8 pt-36 md:pt-48 pb-20 md:pb-40 bg-navy relative overflow-x-clip overflow-y-visible">
                    <div className="max-w-[1400px] mx-auto w-full relative z-10 flex-grow flex flex-col justify-center mt-10 md:mt-0">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                            <div className="reveal reveal-left flex flex-col justify-center items-center h-full text-center">
                                <div className="max-w-[100vw] px-4 md:px-0 md:max-w-3xl w-full flex flex-col items-center overflow-visible">
                                    <h1 ref={heroTitleRef} className="text-primary text-[2rem] sm:text-[2.2rem] md:text-7xl lg:text-8xl xl:text-[6.2rem] font-black leading-tight md:leading-[0.9] tracking-tighter uppercase mb-6 md:mb-8 mx-auto whitespace-nowrap overflow-visible">
                                        ESTRATÉGICOS.<br />DISRUPTIVOS.<br /><span className="text-white">ESCALABLES.</span>
                                    </h1>
                                    <p className="text-white/80 text-base md:text-xl font-bold leading-tight uppercase mb-8 md:mb-10 tracking-tight max-w-xl mx-auto">
                                        SOMOS CLICK PRODUCTIONS. NO HACEMOS RUIDO DIGITAL, TRANSFORMAMOS TU INVERSIÓN EN CRECIMIENTO COMERCIAL Y VENTAS.
                                    </p>
                                    <div className="flex gap-4 justify-center">
                                        <button
                                            onClick={(e) => handleNavClick(e, 'ejecucion')}
                                            className="btn-premium bg-primary text-white px-8 py-4 md:px-10 md:py-5 text-xs md:text-sm font-black uppercase tracking-widest hover:brightness-110 transition-all"
                                        >
                                            Lo que Ejecutamos
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

                                <div className="stat-card border-b md:border-b-0 md:border-r border-white/10 pb-8 md:pb-0 mb-8 md:mb-0 text-center">
                                    <span className="text-xs font-black tracking-[0.4em] text-white/30 uppercase mb-3 block">— 01 —</span>
                                    <div className="flex items-center justify-center">
                                        <span className="text-5xl md:text-6xl font-black text-primary mb-3">+</span>
                                        <span className="stat-number text-5xl md:text-6xl font-black text-primary mb-3" data-target="70" data-suffix="">70</span>
                                    </div>
                                    <span className="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase block">MARCAS HAN CONFIADO EN NUESTRO ADN</span>
                                </div>

                                <div className="stat-card border-b md:border-b-0 md:border-r border-white/10 pb-8 md:pb-0 mb-8 md:mb-0 text-center">
                                    <span className="text-xs font-black tracking-[0.4em] text-white/30 uppercase mb-3 block">— 02 —</span>
                                    <div className="flex items-center justify-center">
                                        <span className="text-5xl md:text-6xl font-black text-primary mb-3">+</span>
                                        <span className="stat-number text-5xl md:text-6xl font-black text-primary mb-3" data-target="08" data-suffix="">08</span>
                                    </div>
                                    <span className="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase block">SECTORES COMERCIALES VALIDADOS</span>
                                </div>

                                <div className="stat-card md:pb-0 md:mb-0 text-center">
                                    <span className="text-xs font-black tracking-[0.4em] text-white/30 uppercase mb-3 block">— 03 —</span>
                                    <div className="flex items-center justify-center">
                                        <span className="stat-number text-5xl md:text-6xl font-black text-primary mb-3" data-target="100" data-suffix="%">100</span>
                                        <span className="text-5xl md:text-6xl font-black text-primary mb-3"></span>
                                    </div>
                                    <span className="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase block">ENFOQUE EN RENTABILIDAD</span>
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
                                        Ejecución disruptiva que une la creatividad con el análisis de negocio para potenciar tus resultados.
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row gap-4 md:gap-px bg-transparent md:bg-white/10 border-0 md:border md:border-white/10 shadow-none md:shadow-2xl reveal reveal-up overflow-hidden">
                                {[
                                    { id: '01', icon: 'groups_3', title: 'Departamento\nde\nMarketing', desc: 'Diseñamos, ejecutamos y medimos. Nos hacemos cargo de toda tu presencia digital para que tú te enfoques en lo más importante: tu producto o servicio.', items: ['Planificación estratégica', 'crecimiento Digital'], scrollId: 'auditoria' },
                                    { id: '02', icon: 'ads_click', title: 'Embudos de \nVentas', desc: 'Diseñamos embudos de ventas adaptado 100% a tu modelo de negocios permitiendo filtrar, organizar y atender a tus clientes potenciales de manera automatizada  ', items: ['tasa de conversión', 'Escalabilidad '], link: '/crecimiento-ads' },
                                    { id: '03', icon: 'movie_edit', title: 'Creación de\nContenido', desc: 'Contenido de alto nivel que traduce la esecnia de tu empresa en una presencia digital imponente y diferenciada', items: ['Producción de video', 'Activos sociales'], link: '/creacion-contenido' },
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

                                        <div className="mt-12">
                                            {service.link ? (
                                                <Link
                                                    to={service.link}
                                                    className="inline-flex items-center gap-2 px-6 py-3 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all duration-300 rounded-sm"
                                                >
                                                    Ver Resultado
                                                    <span className="material-symbols-outlined text-sm notranslate" translate="no">arrow_forward</span>
                                                </Link>
                                            ) : service.scrollId ? (
                                                <button
                                                    onClick={(e) => handleNavClick(e, service.scrollId)}
                                                    className="inline-flex items-center gap-2 px-6 py-3 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all duration-300 rounded-sm"
                                                >
                                                    Auditoría Gratuita
                                                    <span className="material-symbols-outlined text-sm notranslate" translate="no">arrow_forward</span>
                                                </button>
                                            ) : null}
                                        </div>
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
                                {['Estrategia de Marca y Posicionamiento', 'Produccion audivisual', 'Gestión de Redes Sociales Media Multicanal', 'Publicidad Digital (ads)', 'diseño de embudo de ventas (funnels)', 'IMPLEMENTACIÓN Y CONFIGURACIÓN DE CRM', 'AUTOMATIZACIÓN DE PROCESOS Y RESPUESTAS', 'WHATSAPP Y EMAIL MARKETING', 'MARKETING DE INFLUENCERS', 'ASESORÍAS PERSONALIZADAS', 'PUBLICIDAD TRADICIONAL', 'GESTIÓN Y ORGANIZACIÓN DE EVENTOS'].map(service => (
                                    /* Cambio 1: Añadimos flex, items-center y gap al contenedor */
                                    <div key={service} className="service-item flex items-center gap-4 mb-10">
                                        {/* Cambio 2: Añadimos flex-shrink-0 para que el check no se deforme */}
                                        <span className="material-symbols-outlined text-primary font-bold text-3xl notranslate flex-shrink-0" translate="no">
                                            check_circle
                                        </span>
                                        {/* El texto se mantiene exactamente igual */}
                                        <span className="text-2xl md:text-3xl font-black text-navy uppercase tracking-tighter">
                                            {service}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section
                        ref={brandsSectionRef}
                        className="py-24 px-1 bg-off-white studio-texture border-b border-navy/5 overflow-hidden"
                        id="clientes"
                    >
                        <style>{`
                            .swiper-brands .swiper-wrapper {
                                transition-timing-function: linear !important;
                            }
                        `}</style>

                        <div className="max-w-[1900px] mx-auto text-center relative z-10">
                            <h2 className="text-2xl md:text-6xl font-black text-navy uppercase tracking-tighter mb-12 reveal reveal-up">
                                Marcas con las que hemos trabajado
                            </h2>

                            <div className="flex flex-col gap-y-12">
                                {/* Fila 1: Izquierda → Derecha (autoplay normal) */}
                                <Swiper
                                    className="swiper-brands w-full"
                                    modules={[Autoplay, FreeMode]}
                                    loop={true}
                                    freeMode={{ enabled: true, momentum: false }}
                                    autoplay={{ delay: 0, disableOnInteraction: false, pauseOnMouseEnter: false }}
                                    speed={5000}
                                    slidesPerView="auto"
                                    spaceBetween={40}
                                    grabCursor={true}
                                >
                                    {brands.slice(0, Math.ceil(brands.length / 2)).map((brand, idx) => (
                                        <SwiperSlide
                                            key={idx}
                                            style={{ width: 'auto' }}
                                            className="!w-[140px] md:!w-[220px] flex justify-center items-center group/logo py-4"
                                        >
                                            <img
                                                src={brand.src}
                                                alt={brand.alt}
                                                draggable="false"
                                                className="h-40 w-auto object-contain transition-transform duration-500 ease-in-out group-hover/logo:scale-110 select-none"
                                            />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>

                                {/* Fila 2: Derecha → Izquierda (autoplay reverso) */}
                                <Swiper
                                    className="swiper-brands w-full"
                                    modules={[Autoplay, FreeMode]}
                                    loop={true}
                                    freeMode={{ enabled: true, momentum: false }}
                                    autoplay={{ delay: 0, disableOnInteraction: false, pauseOnMouseEnter: false, reverseDirection: true }}
                                    speed={5000}
                                    slidesPerView="auto"
                                    spaceBetween={40}
                                    grabCursor={true}
                                >
                                    {brands.slice(Math.ceil(brands.length / 2)).map((brand, idx) => (
                                        <SwiperSlide
                                            key={idx}
                                            style={{ width: 'auto' }}
                                            className="!w-[140px] md:!w-[220px] flex justify-center items-center group/logo py-4"
                                        >
                                            <img
                                                src={brand.src}
                                                alt={brand.alt}
                                                draggable="false"
                                                className="h-40 w-auto object-contain transition-transform duration-500 ease-in-out group-hover/logo:scale-110 select-none"
                                            />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                        </div>
                    </section>


                    <section className="py-20 px-8 bg-navy studio-texture relative overflow-hidden" id="problematicas">
                        <div className="max-w-[1600px] mx-auto relative z-10">
                            <div className="text-center mb-12 reveal reveal-up">
                                <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
                                    ¿Te identificas con <span className="text-primary italic">estos problemas?</span>
                                </h2>
                            </div>

                            <div className="max-w-3xl mx-auto bg-primary rounded-[1.5rem] p-6 md:p-12 shadow-[0_40px_100px_-20px_rgba(241,90,36,0.3)] reveal reveal-up border border-white/10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                                    <span className="material-symbols-outlined text-[12rem] text-white notranslate" translate="no">help_center</span>
                                </div>

                                <div className="grid grid-cols-1 gap-5 md:gap-6 relative z-10">
                                    {[
                                        "Tienes estrategias improvisadas o sin dirección",
                                        "Desconoces técnicas y procesos de marketing digital",
                                        "No tienes tiempo para dedicarle a tu publicidad",
                                        "El boca en boca ya no te funciona igual de bien",
                                        "Has pagado a Agencias de Marketing y no te han dado resultados",
                                        "Dificultad para diferenciarte de la competencia"
                                    ].map((problem, idx) => (
                                        <div key={idx} className="flex items-center gap-4 group">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/40 transition-all duration-300 transform group-hover:rotate-12">
                                                <span className="material-symbols-outlined text-white text-lg md:text-xl notranslate" translate="no">cancel</span>
                                            </div>
                                            <p className="text-white text-base md:text-xl font-black uppercase tracking-tight leading-tight">
                                                {problem}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-12 text-center relative z-10">
                                    <button
                                        onClick={(e) => handleNavClick(e, 'auditoria')}
                                        className="btn-premium bg-white text-navy px-8 py-4 md:px-12 md:py-6 text-xs md:text-sm font-black uppercase tracking-[0.2em] hover:bg-navy-accent hover:text-white transition-all shadow-2xl rounded-sm"
                                    >
                                        Reservar Auditoría Gratuita
                                        <span className="block text-[8px] mt-1 font-bold opacity-50 tracking-widest">Cupos limitados</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="py-20 px-8 mesh-gradient-studio studio-texture overflow-hidden" id="auditoria">
                        <div className="max-w-[1600px] mx-auto relative z-10">

                            <div className="text-center max-w-5xl mx-auto mb-24 reveal reveal-up">
                                <h2 className="text-3xl md:text-6xl font-black text-navy uppercase tracking-tighter mb-8 leading-[0.9]">
                                    Reserva una <span className="text-primary italic">Auditoría Gratuita</span> para llenar tu Negocio de clientes en 12 semanas sin perder el tiempo
                                </h2>
                                <p className="text-navy/50 text-lg md:text-2xl font-bold uppercase tracking-tight max-w-3xl mx-auto">
                                    Agenda tu auditoría y descubre cómo llenar tu agenda es más fácil de lo que creerías
                                </p>
                            </div>

                            <div className="text-center mb-14 reveal reveal-up border-t border-navy/10 pt-16">
                                <span className="text-primary font-black uppercase tracking-[0.4em] text-sm mb-6 block">Siguiente Paso</span>

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
                                                <p className="text-[11px] font-black uppercase text-navy">Nerio Mosquera</p>
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

                    <section className="py-16 bg-navy studio-texture relative overflow-hidden" id="testimonios">
                        <style>{`
                            .swiper-testimonios .swiper-wrapper {
                                transition-timing-function: linear !important;
                            }
                        `}</style>

                        <div className="max-w-[1600px] mx-auto px-8 mb-10 reveal reveal-up">
                            <span className="text-primary font-black uppercase tracking-[0.4em] text-sm mb-4 block border-l-4 border-primary pl-4">Testimonios</span>
                            <h2 className="text-4xl md:text-5xl font-black leading-[0.8] tracking-tighter uppercase text-white mb-2">
                                Lo Que<br /><span className="text-primary italic">Dicen.</span>
                            </h2>
                        </div>

                        <div className="flex flex-col gap-y-6">
                            {/* Fila 1: Izquierda → Derecha */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 w-24 md:w-48 bg-gradient-to-r from-navy to-transparent z-20 pointer-events-none"></div>
                                <div className="absolute inset-y-0 right-0 w-24 md:w-48 bg-gradient-to-l from-navy to-transparent z-20 pointer-events-none"></div>
                                <Swiper
                                    className="swiper-testimonios w-full"
                                    modules={[Autoplay, FreeMode]}
                                    loop={true}
                                    freeMode={{ enabled: true, momentum: false }}
                                    autoplay={{ delay: 0, disableOnInteraction: false, pauseOnMouseEnter: false }}
                                    speed={8000}
                                    slidesPerView="auto"
                                    spaceBetween={24}
                                    grabCursor={true}
                                >
                                    {[
                                        { name: "Dra Magda Farnetano", role: "Odontologa Protesista", avatar: carruzel1, content: "\t\tGracias a su excelente trabajo, he logrado potenciar y liderar mi marca personal como Odontóloga e Implantóloga. Esto me ha permitido mantener una presencia constante, brindando información de valor y consejos útiles tanto a mis pacientes como a mi comunidad." },
                                        { name: "Maher Mansour", role: "Shawarma Zuzu - Gastronomia", avatar: carruzel2, content: "\t\tNuestra meta siempre ha sido ser los mejores en lo que hacemos, brindando calidad y dedicación a cada comensal. Gracias al equipo de Click, logramos esa visibilidad que buscábamos en redes sociales. Su trabajo impecable y profesionalismo fueron la pieza clave para que más personas conocieran nuestra marca. ¡Totalmente agradecidos!" },
                                        { name: "Yaira Molina", role: "Bluexpress - Distribuidora e importadora", avatar: carruzel3, content: "\t\tApenas estamos comenzando, pero el futuro se ve increíble. Confiamos plenamente en su trayectoria y conocimiento técnico para lograr resultados extraordinarios. ¡Estamos listos para hacer cosas grandes!" },
                                        { name: "George Djandi", role: "Iluvenca - industria de iluminacion", avatar: carruzel4, content: "\t\tFelicito al equipo por su dedicación. Lograron transformar información técnica de iluminación en contenido ameno, informativo y promocional que realmente destaca frente a la competencia. Su capacidad para entender nuestro ramo y aplicarlo a las redes sociales ha sido clave para nuestro crecimiento digital." },
                                        { name: "Janay Hernandez", role: "Bufalo -Gastronomia", avatar: carruzel5, content: "\t\tClick ha sido clave para ayudarnos a plasmar y estructurar las ideas de nuestra cuenta de Instagram de una manera muy organizada. Para nosotros han cubierto un área fundamental en la promoción del local, \n \tLo que más nos ha gustado del proceso es su compromiso siempre están muy pendientes de hacer seguimiento a los resultados y enfocados en una mejora continua." }
                                    ].map((t, idx) => (
                                        <SwiperSlide key={idx} style={{ width: 'auto' }} className="!w-[280px] md:!w-[380px] py-4">
                                            <div className="bg-navy-accent rounded-[1.5rem] p-6 md:p-8 border border-white/5 shadow-2xl flex flex-col h-full transition-all duration-500 hover:border-primary/20 hover:bg-navy-accent/80 group/item">
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className="w-20 h-20 bg-white rounded-full overflow-hidden border-2 border-primary/20 group-hover/item:border-primary transition-colors flex-shrink-0">
                                                        <img src={t.avatar} alt={t.name} draggable="false" className="w-full h-full object-cover select-none" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-white text-base font-black uppercase tracking-tight leading-none mb-1">{t.name}</h4>
                                                        <p className="text-white/40 text-[12px] font-bold uppercase tracking-widest">{t.role}</p>
                                                    </div>
                                                </div>
                                                <p className="text-white/70 text-sm md:text-lg font-medium leading-relaxed">
                                                    &ldquo;{t.content}&rdquo;
                                                </p>
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
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
                                    ALIADO ESTRATÉGICO DE CRECIMIENTO ESPECIALIZADO EN POSICIONAMIENTO DE MERCADO Y GESTIÓN INTEGRAL.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-black uppercase tracking-widest text-[10px] text-primary mb-6">Conectar</h4>
                                <ul className="space-y-4">
                                    {[
                                        { name: 'Instagram', url: 'https://www.instagram.com/clickproductions/' },
                                        { name: 'WhatsApp', url: 'https://wa.me/584123152222' }
                                    ].map(sm => (
                                        <li key={sm.name}>
                                            <a
                                                className="text-[10px] text-white hover:text-primary transition-colors font-black uppercase tracking-widest"
                                                href={sm.url}
                                                target={sm.url !== '#' ? "_blank" : undefined}
                                                rel={sm.url !== '#' ? "noopener noreferrer" : undefined}
                                            >
                                                {sm.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-black uppercase tracking-widest text-[10px] text-primary mb-6">Contacto</h4>
                                <p className="text-[10px] text-white font-black uppercase tracking-widest mb-2">Adm@productionsclick.com</p>
                                <p className="text-[10px] text-white/40 font-medium uppercase tracking-widest">+58 412-315-2222</p>
                            </div>
                        </div>
                        <div className="max-w-[1600px] mx-auto pt-12 mt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                            <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.5em]">© 2024 CLICK PRODUCTIONS.</p>
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
