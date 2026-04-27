import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { animate, stagger } from 'animejs';
import clickLogo from '../assets/imagenes/logo click png N.png';
import { contentImages, contentVideos } from '../assets/utils/getContent.js';

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

/**
 * Interactive Marquee with Drag/Touch Support
 */
/**
 * Interactive Marquee with Drag/Touch Support
 * Now supports videos and manual-only mode
 */
/**
 * LazyVideo Component to optimize loading
 */
const LazyVideo = React.memo(({ src, srcMp4, poster, className, isMuted, isPlaying, ...props }) => {
    const videoRef = useRef(null);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [shouldPlay, setShouldPlay] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Detect if mobile for video source selection
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setHasLoaded(true);
                    setShouldPlay(true);
                } else {
                    setShouldPlay(false);
                }
            },
            { threshold: 0.01 }
        );

        if (videoRef.current) {
            observer.observe(videoRef.current);
        }

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    useEffect(() => {
        if (!videoRef.current || !hasLoaded) return;

        const video = videoRef.current;
        if (shouldPlay && isPlaying) {
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => { });
            }
        } else {
            video.pause();
        }
    }, [shouldPlay, isPlaying, hasLoaded]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.muted = isMuted;
            videoRef.current.volume = isMuted ? 0 : 0.5;
        }
    }, [isMuted]);

    const activeSrc = isMobile && srcMp4 ? srcMp4 : src;

    return (
        <video
            ref={videoRef}
            src={hasLoaded ? activeSrc : ''}
            poster={poster}
            className={`${className} transition-opacity duration-700 ${hasLoaded ? 'opacity-100' : 'opacity-0'}`}
            playsInline
            webkit-playsinline="true"
            loop
            muted={isMuted}
            preload={isMuted ? "metadata" : "auto"}
            {...props}
        />
    );
});
LazyVideo.displayName = 'LazyVideo';



const InteractiveMarquee = ({ slides, autoPlay = true, showSwipeHint = false }) => {
    const marqueeRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [activeVideoIndex, setActiveVideoIndex] = useState(null); // Track if a video is playing with sound

    // Use refs for high-frequency updates to avoid re-renders
    const dragRef = useRef({
        startX: 0,
        isDown: false,
        velocity: autoPlay ? -1 : 0,
        hasDragged: false // to distinguish click vs drag
    });

    const requestRef = useRef();
    const lastPosRef = useRef(0);

    const animateMarquee = () => {
        if (!dragRef.current.isDown && marqueeRef.current && activeVideoIndex === null) {
            lastPosRef.current += dragRef.current.velocity;

            // Loop logic (approximate 1/3 of the content)
            const maxScroll = marqueeRef.current.scrollWidth / 3;

            if (lastPosRef.current < -maxScroll) {
                lastPosRef.current += maxScroll;
            } else if (lastPosRef.current > 0) {
                lastPosRef.current -= maxScroll;
            }

            marqueeRef.current.style.transform = `translate3d(${lastPosRef.current}px, 0, 0)`;

            // Friction effect to slow down if not autoplaying
            if (!autoPlay) {
                dragRef.current.velocity *= 0.95;
                if (Math.abs(dragRef.current.velocity) < 0.05) {
                    dragRef.current.velocity = 0;
                }
            } else {
                // Gradually return to default speed
                const targetSpeed = -1.5;
                dragRef.current.velocity += (targetSpeed - dragRef.current.velocity) * 0.05;
            }
        }
        requestRef.current = requestAnimationFrame(animateMarquee);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animateMarquee);
        return () => cancelAnimationFrame(requestRef.current);
    }, [activeVideoIndex]);

    const handleStart = (e) => {
        setIsDragging(true);
        dragRef.current.isDown = true;
        dragRef.current.hasDragged = false;
        const x = e.pageX || (e.touches && e.touches[0].pageX);
        dragRef.current.startX = x - lastPosRef.current;
    };

    const handleMove = (e) => {
        if (!dragRef.current.isDown) return;
        const x = e.pageX || (e.touches && e.touches[0].pageX);
        const walk = x - dragRef.current.startX;

        // Calculate velocity based on movement
        const delta = walk - lastPosRef.current;
        dragRef.current.velocity = delta * 0.5; // Adjusted for better momentum

        if (Math.abs(delta) > 5) {
            dragRef.current.hasDragged = true;
        }

        lastPosRef.current = walk;
        if (marqueeRef.current) {
            marqueeRef.current.style.transform = `translate3d(${walk}px, 0, 0)`;
        }
    };

    const handleEnd = () => {
        setIsDragging(false);
        dragRef.current.isDown = false;
        // The momentum will be handled naturally by animateMarquee using the last velocity
    };

    const isVideo = (url) => {
        return url.match(/\.(mp4|webm|ogg|mov|MOV)$/) || url.includes('video');
    };

    return (
        <div className="flex flex-col items-center">
            <div
                className="relative w-full flex overflow-hidden group py-4 cursor-grab active:cursor-grabbing"
                onMouseDown={handleStart}
                onMouseMove={handleMove}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={handleStart}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
            >
                <div
                    ref={marqueeRef}
                    className="flex whitespace-nowrap gap-4 md:gap-8 will-change-transform translate-z-0 pl-3"
                >
                    {[...slides, ...slides, ...slides].map((slide, idx) => (
                        <div
                            key={idx}
                            className="relative flex-shrink-0 w-[260px] sm:w-[320px] md:w-[380px] h-[460px] sm:h-[500px] md:h-[480px] group/item overflow-hidden rounded-2xl border border-navy/10 shadow-xl bg-navy-accent cursor-pointer"
                            onMouseEnter={(e) => {
                                const video = e.currentTarget.querySelector('video');
                                if (video && !video.muted) {
                                    video.controls = true;
                                }
                            }}
                            onMouseLeave={(e) => {
                                const video = e.currentTarget.querySelector('video');
                                if (video) {
                                    video.controls = false;
                                }
                            }}
                            onClick={(e) => {
                                if (dragRef.current.hasDragged) return; // Ignore click if user was dragging
                                const video = e.currentTarget.querySelector('video');

                                const icon = e.currentTarget.querySelector('.play-icon');
                                if (video) {
                                    if (video.muted) {
                                        // Pause/Mute all other videos
                                        document.querySelectorAll('video').forEach(v => {
                                            v.pause();
                                            v.muted = true;
                                            v.controls = false;
                                            const otherIcon = v.parentNode.querySelector('.play-icon');
                                            if (otherIcon) {
                                                otherIcon.classList.remove('opacity-0');
                                                otherIcon.classList.add('opacity-100');
                                            }
                                        });

                                        video.muted = false;
                                        video.volume = 0.5;
                                        video.play();
                                        setActiveVideoIndex(idx); // Pause marquee
                                        if (icon) {
                                            icon.classList.remove('opacity-100');
                                            icon.classList.add('opacity-0');
                                        }
                                    } else {
                                        video.pause();
                                        video.muted = true;
                                        setActiveVideoIndex(null); // Resume marquee
                                        if (icon) {
                                            icon.classList.remove('opacity-0');
                                            icon.classList.add('opacity-100');
                                        }
                                    }
                                }
                            }}
                        >
                            {isVideo(slide.url) ? (
                                <>
                                    <LazyVideo
                                        src={slide.url}
                                        srcMp4={slide.urlMp4}
                                        poster={slide.poster}
                                        className="w-full h-full object-cover"
                                        isMuted={activeVideoIndex !== idx}
                                        isPlaying={activeVideoIndex === null || activeVideoIndex === idx}
                                    />

                                    <div className={`play-icon absolute inset-0 flex items-center justify-center bg-black/20 ${activeVideoIndex === idx ? 'opacity-0' : 'opacity-100'} transition-all duration-500 pointer-events-none z-10`}>
                                        <div className="w-16 h-16 rounded-full border-2 border-white/50 flex items-center justify-center backdrop-blur-sm group-hover/item:scale-110 group-hover/item:border-primary transition-all">
                                            <span className="material-symbols-outlined text-white text-4xl notranslate" translate="no">{activeVideoIndex === idx ? 'pause' : 'play_arrow'}</span>
                                        </div>
                                    </div>
                                </>


                            ) : (
                                <img
                                    src={slide.url}
                                    alt={slide.title}
                                    className="w-full h-full object-cover pointer-events-none"
                                    loading="lazy"
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/20 to-transparent opacity-60 pointer-events-none"></div>
                            <div className="absolute bottom-6 md:bottom-8 left-6 md:left-8 pointer-events-none">
                                <span className="text-primary font-black uppercase tracking-[0.4em] text-[8px] md:text-[10px] mb-2 block">{slide.category}</span>
                                <h3 className="text-lg md:text-2xl font-black uppercase tracking-tighter text-white">{slide.title}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {showSwipeHint && (
                <div className="flex items-center gap-2 mt-4 opacity-70 justify-center">
                    <span className="material-symbols-outlined text-primary text-sm notranslate" translate="no">swipe</span>
                    <span className="text-primary text-[10px] font-bold uppercase tracking-widest">Desliza para explorar</span>
                </div>
            )}
        </div>
    );
};

function CreacionContenido() {

    const [activeSlide, setActiveSlide] = useState(0);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [scrolled, setScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const formRef = useRef(null);
    const heroTitleRef = useRef(null);
    const [formData, setFormData] = useState({
        nombre: '',
        empresa: '',
        instagram: '',
        correo: '',
        whatsapp: ''
    });

    const handlePlanSelect = (plan) => {
        setSelectedPlan(plan);
        setTimeout(() => {
            if (formRef.current) {
                const offset = 120;
                const top = formRef.current.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        }, 100);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const message = `Hola Click Productions, mi nombre es ${formData.nombre}. Estoy interesado en contratar el Plan *${selectedPlan.name}* ($${selectedPlan.price}/mes) para mi marca o empresa *${formData.empresa}*.

*Detalles adicionales:*
- Instagram: ${formData.instagram}
- Correo: ${formData.correo}
- WhatsApp: ${formData.whatsapp}`;

        const waUrl = `https://wa.me/584123152222?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
    };

    useEffect(() => {
        window.scrollTo(0, 0);

        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Reveal on scroll logic
    useEffect(() => {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
        return () => revealObserver.disconnect();
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
                    loopDelay: 2500
                });
            }
        }
    }, []);

    return (
        <div className="bg-navy min-h-screen text-white font-sans selection:bg-primary/30">
            {/* Header / Navigation */}
            <header className={`fixed top-0 w-full z-[100] transition-all duration-500 ${scrolled ? 'bg-navy/95 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-navy/40 backdrop-blur-sm py-6 md:py-8'}`}>
                <nav className="max-w-[1600px] mx-auto px-6 sm:px-8 flex items-center justify-between">
                    <Link to="/" className="flex items-center cursor-pointer">
                        <img src={clickLogo} alt="Click Productions Logo" className="h-16 w-auto object-contain" />
                    </Link>

                    <div className="hidden md:flex items-center gap-10">
                        <Link to="/" className="text-[11px] font-black uppercase tracking-[0.3em] text-white hover:text-primary transition-colors">Inicio</Link>
                        <Link to="/creacion-contenido" className="text-[11px] font-black uppercase tracking-[0.3em] text-white hover:text-primary transition-colors">Contenido</Link>
                        <Link to="/crecimiento-ads" className="text-[11px] font-black uppercase tracking-[0.3em] text-white hover:text-primary transition-colors">Ads</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/#auditoria" className="hidden sm:block btn-premium border border-white/20 text-white px-8 py-3.5 text-[11px] font-black transition-all uppercase tracking-[0.3em] hover:border-primary hover:bg-primary text-center">
                            Auditoría Gratuita
                        </Link>

                        <button
                            className="md:hidden flex flex-col gap-1.5 p-2"
                            onClick={() => setIsMenuOpen(true)}
                        >
                            <div className="w-8 h-0.5 bg-primary"></div>
                            <div className="w-8 h-0.5 bg-white"></div>
                            <div className="w-5 h-0.5 bg-primary self-end"></div>
                        </button>
                    </div>
                </nav>
            </header>

            {/* Mobile Menu Overlay - MOVED OUTSIDE HEADER */}
            <div className={`fixed inset-0 z-[200] transition-all duration-700 ease-expo flex flex-col md:hidden overflow-y-auto ${isMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
                {/* Background overlay */}
                <div className={`absolute inset-0 bg-navy transition-opacity duration-700 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}></div>

                <div className={`relative flex flex-col h-full w-full transition-transform duration-700 ease-expo ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex items-center justify-between p-6 border-b border-white/5">
                        <img src={clickLogo} alt="Click Productions Logo" className="h-10 w-auto" />
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="w-12 h-12 flex items-center justify-center rounded-full border border-white/10 hover:border-primary transition-colors"
                        >
                            <span className="material-symbols-outlined text-3xl text-primary notranslate" translate="no">close</span>
                        </button>
                    </div>

                    <div className="flex flex-col gap-6 w-full px-8 pt-10 flex-grow">
                        {[
                            { label: 'Inicio', target: '/' },
                            { label: 'Contenido', target: '/creacion-contenido' },
                            { label: 'Ads', target: '/crecimiento-ads' }
                        ].map((item, idx) => (
                            <Link
                                key={item.label}
                                to={item.target}
                                onClick={() => setIsMenuOpen(false)}
                                className={`text-2xl font-black text-white hover:text-primary uppercase tracking-tighter transition-all duration-700 ease-out flex items-end gap-3 border-b border-white/5 pb-4 ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                                style={{ transitionDelay: `${100 + (idx * 100)}ms` }}
                            >
                                <span className="text-primary text-[10px] tracking-widest mb-1 font-bold">0{idx + 1}.</span>
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    <div className={`p-8 w-full mt-auto pb-12 transition-all duration-700 ease-out md:hidden ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} delay-300`}>
                        <Link
                            to="/#auditoria"
                            onClick={() => setIsMenuOpen(false)}
                            className="block w-full py-6 bg-primary text-white font-black uppercase tracking-widest text-center shadow-2xl text-sm"
                        >
                            Auditoría Gratuita
                        </Link>
                    </div>
                </div>
            </div>

            <main className="pb-20">
                <div className="max-w-[1400px] mx-auto px-8">
                    {/* Content scaled to 90% */}
                    <div className="page-scale-90">
                        {/* Unified Hero Section */}
                        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center mb-50 pt-30 md:pt-34 reveal">
                            <div className="flex-[1.2] text-center lg:text-left">
                                <span className="text-primary font-black uppercase tracking-[0.5em] text-xs mb-8 block border-l-4 border-primary pl-6 mx-auto lg:mx-0 w-fit lg:w-auto">Servicio 01</span>
                                <h1 ref={heroTitleRef} className="text-4xl sm:text-6xl md:text-[5.5rem] lg:text-[6.2rem] xl:text-[7.2rem] font-black uppercase leading-[0.9] tracking-tighter mb-10">
                                    CREACIÓN DE<br />
                                    <span className="text-primary italic">CONTENIDO</span>
                                </h1>
                                <p className="text-white/60 text-lg md:text-2xl uppercase max-w-2xl mx-auto lg:mx-0 leading-tight font-bold tracking-tight">
                                    CREAMOS IMPACTO VISUAL DE ALTO NIVEL. NUESTRA PRODUCCIÓN ESTÁ DISEÑADA PARA CAPTURAR LA ATENCIÓN DEL MERCADO Y CONSOLIDAR UNA PRESENCIA DE MARCA IMPONENTE Y DIFERENCIADA.
                                </p>
                            </div>
                            <div className="flex-1 w-full max-w-[600px] aspect-square bg-navy-accent rounded-2xl border border-white/5 flex items-center justify-center relative overflow-hidden group shadow-2xl">
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/20 to-transparent pointer-events-none"></div>
                                <span className="material-symbols-outlined text-[10rem] text-primary/20 group-hover:scale-110 transition-transform duration-700 notranslate" translate="no">movie_edit</span>
                            </div>
                        </div>

                        {/* Carousel Section - Light Theme */}
                        {/* Interactive Moving Carousel Portafolio */}
                        <section className="mb-32 reveal py-16 mesh-gradient-studio studio-texture border-y border-navy/5 -mx-8 overflow-hidden">
                            <div className="px-8 mb-12 text-center lg:text-left">
                                <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] md:text-sm mb-6 block border-l-4 border-primary pl-4 mx-auto lg:mx-0 w-fit">Portafolio de Fotografía</span>
                                <h2 className="text-3xl sm:text-5xl md:text-[5.5rem] font-black uppercase tracking-tighter text-navy leading-[1.1] md:leading-[0.8]">Nuestra <br /><span className="text-primary">Producción</span></h2>
                            </div>

                            <InteractiveMarquee slides={contentImages} autoPlay={true} showSwipeHint={true} />

                            <div className="px-8 mb-12 mt-24 text-center lg:text-left">
                                <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] md:text-sm mb-6 block border-l-4 border-primary pl-4 mx-auto lg:mx-0 w-fit">Portafolio de Video</span>
                                <h2 className="text-3xl sm:text-5xl md:text-[5.5rem] font-black uppercase tracking-tighter text-navy leading-[1.1] md:leading-[0.8]">Impacto <br /><span className="text-primary">Audiovisual</span></h2>
                            </div>

                            <InteractiveMarquee slides={contentVideos} autoPlay={false} showSwipeHint={true} />

                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 mb-40 border border-white/10">
                            {[
                                { title: 'Video Vertical', desc: 'Optimizado para TikTok, Reels y Shorts con edición de alta retención.' },
                                { title: 'Storytelling', desc: 'Narrativa de marca que conecta emocionalmente con tu cliente ideal.' },
                                { title: 'Post-Producción', desc: 'Diseño sonoro y efectos visuales de nivel cinematográfico.' }
                            ].map((box, i) => (
                                <div key={i} className="p-12 bg-navy border-r border-white/10 last:border-r-0 border-t-4 border-transparent hover:border-primary hover:bg-navy-accent transition-all duration-500 group">
                                    <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 group-hover:text-primary transition-colors">{box.title}</h3>
                                    <p className="text-white/40 text-xs uppercase leading-relaxed font-bold tracking-tight">{box.desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* Subscription Plans Section */}
                        <section className="mb-40" id="paquetes-contenido">
                            <div className="text-center mb-24">
                                <span className="text-primary font-black uppercase tracking-[0.4em] text-sm mb-6 block">Inversión Inteligente</span>
                                <h2 className="text-5xl md:text-[5.5rem] font-black uppercase tracking-tighter mb-8 leading-[0.8]">Planes de <span className="text-primary">Suscripción</span></h2>
                                <p className="text-white/60 text-xl uppercase max-w-3xl mx-auto leading-tight font-bold tracking-tight">
                                    Contenido AUDIOVISUAL <br />PROGRAMAS DE PRODUCCIÓN RECURRENTE. LA SOLUCIÓN DE ALTO NIVEL PARA MARCAS QUE BUSCAN CONTENIDO PROFESIONAL, LISTO PARA PUBLICAR Y CON RESPALDO ESTRATÉGICO, SIN NECESIDAD DE UNA GESTIÓN INTEGRAL.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
                                {[
                                    {
                                        name: 'Starter Visual',
                                        price: '195',
                                        desc: 'Para marcas en crecimiento',
                                        recording: '1. jornada de rodaje',
                                        videos: '2 horas de grabacion',
                                        features: [
                                            'Grabación profesional (2h)',
                                            'Entrega de guiones o estructura de videos',
                                            '1 Ronda de correcciones',
                                            'Ideal para presencia activa'
                                        ],
                                        popular: false
                                    },
                                    {
                                        name: 'Imagen y Consistencia',
                                        price: '290',
                                        desc: 'El equilibrio perfecto',
                                        recording: '1.  jornada de rodaje',
                                        videos: '3 horas de grabacion',
                                        features: [
                                            'Grabación profesional (3h)',
                                            'Entrega de guiones o estructura de videos',
                                            '2 rondas de correcciones',
                                            'Ideal para mayor volumen de contenido'
                                        ],
                                        popular: true
                                    },
                                    {
                                        name: 'Producción Premium',
                                        price: '410',
                                        desc: 'Máximo impacto visual',
                                        recording: '2.  jornadas de rodaje',
                                        videos: '4 horas de grabacion',
                                        features: [
                                            'grabación profesional (4 horas dividas en dos jornadas)',
                                            'Entrega de guiones o estructura de videos',
                                            '3 rondas de correcciones',
                                            '2 correcciones de material',
                                            'Ideal para máximo nivel estético'
                                        ],
                                        popular: false
                                    }
                                ].map((plan, i) => (
                                    <div key={i} className={`relative flex flex-col p-8 md:p-12 bg-navy-accent border-t-4 ${plan.popular ? 'border-primary bg-navy-accent shadow-[0_30px_60px_-15px_rgba(241,90,36,0.15)] scale-100 lg:scale-[1.05] z-10' : 'border-white/5'} transition-all duration-500 group`}>
                                        {plan.popular && (
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2">
                                                Recomendado
                                            </div>
                                        )}
                                        <div className="mb-10 text-center md:text-left">
                                            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white mb-2">{plan.name}</h3>
                                            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest leading-none">{plan.desc}</p>
                                        </div>

                                        <div className="flex items-baseline gap-2 mb-10 justify-center md:justify-start">
                                            <span className="text-4xl md:text-5xl font-black text-primary">${plan.price}</span>
                                            <span className="text-white/30 text-xs font-bold uppercase">/ paquete</span>
                                        </div>

                                        <div className="space-y-6 mb-12 flex-1">
                                            <div className="pb-6 border-b border-white/5 font-bold uppercase tracking-widest text-[10px]">
                                                <p className="text-white/40 mb-2">Incluye:</p>
                                                <p className="text-white text-sm">{plan.videos}</p>
                                                <p className="text-primary mt-1">{plan.recording} de grabación</p>
                                            </div>
                                            <ul className="space-y-4">
                                                {plan.features.map((feature, idx) => (
                                                    <li key={idx} className="flex items-start gap-3 text-[11px] font-bold uppercase tracking-tight text-white/60">
                                                        <span className="material-symbols-outlined text-primary text-lg notranslate" translate="no">check_circle</span>
                                                        <span className="pt-0.5">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <button
                                            onClick={() => handlePlanSelect(plan)}
                                            className={`w-full py-4 text-center text-xs font-black uppercase tracking-[0.2em] transition-all duration-500 ${plan.popular ? 'bg-primary text-white hover:brightness-110 shadow-lg shadow-primary/20' : 'bg-white/10 text-white hover:bg-white hover:text-navy'}`}
                                        >
                                            {selectedPlan?.name === plan.name ? 'Plan Seleccionado' : 'Seleccionar Plan'}
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Dynamic Activation Form */}
                            <div
                                ref={formRef}
                                className={`overflow-hidden transition-all duration-1000 ease-in-out ${selectedPlan ? 'max-h-[1400px] opacity-100 mt-20' : 'max-h-0 opacity-0'}`}
                            >
                                <div className="max-w-4xl mx-auto p-6 md:p-12 mesh-gradient-studio studio-texture border border-navy/5 rounded-2xl shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8">
                                        <button onClick={() => setSelectedPlan(null)} className="text-navy/20 hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined text-4xl notranslate" translate="no">close</span>
                                        </button>
                                    </div>

                                    <div className="text-center mb-12">
                                        <span className="text-primary font-black uppercase tracking-[0.4em] text-xs mb-4 block">Paso Final</span>
                                        <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-navy">Detalles de Contacto</h3>
                                        <p className="text-navy/40 text-sm uppercase font-bold tracking-widest leading-loose">Estás a un paso de iniciar el <span className="text-primary">{selectedPlan?.name}</span></p>
                                    </div>

                                    <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-navy/60 ml-4">Tu Nombre</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.nombre}
                                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                                placeholder="Ej. Juan Pérez"
                                                className="w-full bg-white border-2 border-navy/20 p-5 rounded-2xl text-navy focus:border-primary outline-none transition-all placeholder:text-navy/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-navy/60 ml-4">Tu Marca / Empresa</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.empresa}
                                                onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                                                placeholder="Ej. Click Productions"
                                                className="w-full bg-white border-2 border-navy/20 p-5 rounded-2xl text-navy focus:border-primary outline-none transition-all placeholder:text-navy/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-navy/60 ml-4">Instagram de la Empresa</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.instagram}
                                                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                                                placeholder="Ej. @tu.marca"
                                                className="w-full bg-white border-2 border-navy/20 p-5 rounded-2xl text-navy focus:border-primary outline-none transition-all placeholder:text-navy/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-navy/60 ml-4">Tu Correo</label>
                                            <input
                                                required
                                                type="email"
                                                value={formData.correo}
                                                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                                                placeholder="Ej. contacto@empresa.com"
                                                className="w-full bg-white border-2 border-navy/20 p-5 rounded-2xl text-navy focus:border-primary outline-none transition-all placeholder:text-navy/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]"
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-navy/60 ml-4">WhatsApp de Contacto</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.whatsapp}
                                                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                                placeholder="Ej. +58 412..."
                                                className="w-full bg-white border-2 border-navy/20 p-5 rounded-2xl text-navy focus:border-primary outline-none transition-all placeholder:text-navy/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]"
                                            />
                                        </div>
                                        <div className="md:col-span-2 mt-4">
                                            <button
                                                type="submit"
                                                className="w-full btn-premium bg-primary text-white py-6 rounded-2xl text-sm font-black uppercase tracking-[0.3em] hover:brightness-110 transition-all shadow-2xl shadow-primary/20"
                                            >
                                                Enviar WhatsApp y Reservar
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            {/* Condiciones Generales Section with more breathing room */}
                            <div className="max-w-4xl mx-auto p-12 border border-white/5 bg-white/[0.02] rounded-[3rem] mt-24 relative z-10 transition-all hover:bg-white/[0.03]">
                                <div className="flex items-center gap-4 mb-10 border-l-4 border-primary pl-6">
                                    <h4 className="text-sm font-black uppercase tracking-[0.4em] text-primary">Condiciones Generales</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-8">
                                    {[
                                        'Entrega de material en máximo 7 días hábiles.',
                                        'Horas adicionales se facturan aparte.',
                                        'El pago debe realizarse en su totalidad al momento de la contratación.',
                                        'No incluye gestión de redes sociales.',
                                        'No incluye imagen de marca y/o modelos'
                                    ].map((condition, i) => (
                                        <div key={i} className="flex gap-4 items-center group">
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                                <span className="material-symbols-outlined text-primary text-base notranslate" translate="no">info</span>
                                            </div>
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-white/50 leading-relaxed">{condition}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <div className="bg-primary/10 border border-primary/20 p-12 md:p-20 text-center rounded-[3rem]">
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-8">¿Listo para escalar tu contenido?</h2>
                            <Link to="#paquetes-contenido" className="inline-block btn-premium bg-primary text-white px-12 py-5 text-sm font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_20px_40px_-10px_rgba(241,90,36,0.4)]">
                                selecciona el paquete que mas se adapte a ti
                            </Link>
                        </div>

                        <footer className="bg-navy-accent/50 py-8 px-8 border-t border-white/5 text-center mt-12">
                            <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.5em]">© 2024 CLICK PRODUCTIONS. VALIENTE. CREATIVO. IMPARABLE.</p>
                        </footer>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default CreacionContenido;
