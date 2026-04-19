import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { animate, stagger } from 'animejs';
import clickLogo from '../assets/imagenes/logo click png N.png';
import case1 from '../assets/imagenes/ads-case-1.jpg';
import case2 from '../assets/imagenes/ads-case-2.jpg';
import case3 from '../assets/imagenes/ads-case-3.jpg';

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

function CrecimientoAds() {
    const [selectedImage, setSelectedImage] = useState(null);
    const [scrolled, setScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const heroTitleRef = useRef(null);

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
                        <div className="flex flex-col lg:flex-row-reverse gap-16 lg:gap-24 items-center mb-40 pt-32 md:pt-48 reveal">
                            <div className="flex-[1.2] text-center lg:text-left">
                                <span className="text-primary font-black uppercase tracking-[0.5em] text-xs mb-8 block border-l-4 border-primary pl-6 mx-auto lg:mx-0 w-fit lg:w-auto">Servicio 03</span>
                                <h1 ref={heroTitleRef} className="text-[2.5rem] sm:text-5xl md:text-7xl lg:text-8xl xl:text-[7.2rem] font-black uppercase leading-[1.1] md:leading-[0.9] tracking-tighter mb-10">
                                    CRECIMIENTO<br />
                                    <span className="text-white">& </span>
                                    <span className="text-primary italic">ADS</span>
                                </h1>
                                <p className="text-white/60 text-lg md:text-2xl uppercase max-w-2xl mx-auto lg:mx-0 leading-tight font-bold tracking-tight">
                                    Escala tu facturación con campañas de alto rendimiento. Fusionamos creatividad disruptiva con análisis de datos avanzado para dominar Meta, Google y TikTok Ads.
                                </p>
                            </div>
                            <div className="flex-1 w-full max-w-[600px] aspect-square bg-navy-accent rounded-2xl border border-white/5 flex items-center justify-center relative overflow-hidden group shadow-2xl">
                                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-primary/20 to-transparent pointer-events-none"></div>
                                <span className="material-symbols-outlined text-[10rem] text-primary/20 group-hover:scale-110 transition-transform duration-700 notranslate" translate="no">ads_click</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 mb-40 reveal mesh-gradient-studio studio-texture border-y border-navy/10 mx-0 md:-mx-8">
                            {[
                                { title: 'Meta Ads', desc: 'Campañas en Facebook e Instagram diseñadas para capturar leads y ventas calificadas.' },
                                { title: 'Funnel Ads', desc: 'Arquitectura de embudos de venta que guían al usuario desde el interés hasta la compra.' },
                                { title: 'Analytics', desc: 'Medición de precisión para optimizar cada dólar invertido en publicidad.' }
                            ].map((box, i) => (
                                <div key={i} className="p-12 md:p-16 bg-transparent border-b md:border-b-0 md:border-r border-navy/10 last:border-r-0 border-t-4 border-transparent hover:border-primary hover:bg-navy/5 transition-all duration-500 group">
                                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-4 group-hover:text-primary transition-colors text-navy">{box.title}</h3>
                                    <p className="text-navy/40 text-xs uppercase leading-relaxed font-bold tracking-tight">{box.desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* Casos de Éxito Section */}
                        <div className="mb-32">
                            <div className="flex items-center gap-4 mb-16 border-l-4 border-primary pl-6">
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Casos de <span className="text-primary italic">Éxito</span></h2>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                {[
                                    {
                                        title: 'Alcance Masivo',
                                        metrics: ['+582k Impresiones', '+226k Resultados'],
                                        description: 'Campaña de captación con segmentación avanzada y optimización constante.',
                                        img: case1
                                    },
                                    {
                                        title: 'ROI Optimizado',
                                        metrics: ['$0.002 Costo/Result', '+29k Alcance'],
                                        description: 'Arquitectura de embudos (Funnels) logrando costos mínimos históricos.',
                                        img: case2
                                    },
                                    {
                                        title: 'Bonsai Sushi',
                                        metrics: ['+687k Views', '+3.6k Clics'],
                                        description: 'Estrategia de contenido viral y ADS para posicionamiento de marca.',
                                        img: case3
                                    }
                                ].map((caseStudy, i) => (
                                    <div 
                                        key={i} 
                                        onClick={() => setSelectedImage(caseStudy.img)}
                                        className="group bg-navy/20 border-t-4 border-white/10 overflow-hidden hover:border-primary transition-all duration-700 hover:-translate-y-2 cursor-pointer shadow-2xl"
                                    >
                                        <div className="aspect-[16/10] overflow-hidden relative">
                                            <img 
                                                src={caseStudy.img} 
                                                alt={caseStudy.title}
                                                className="w-full h-full object-cover transition-all duration-1000 scale-105 group-hover:scale-100"
                                                onError={(e) => { e.target.src = 'https://placehold.co/800x500/111111/F15A24?text=Captura+Ads'; }}
                                            />
                                            <div className="absolute top-6 right-6 z-20">
                                                <div className="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-xl">Real Results</div>
                                            </div>
                                        </div>
                                        <div className="p-10 relative">
                                            <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 group-hover:text-primary transition-colors">{caseStudy.title}</h3>
                                            <div className="flex flex-wrap gap-3 mb-6">
                                                {caseStudy.metrics.map((metric, j) => (
                                                    <span key={j} className="text-[10px] font-black uppercase tracking-widest bg-white/5 text-primary border border-primary/20 px-3 py-1 rounded-md">{metric}</span>
                                                ))}
                                            </div>
                                            <p className="text-white/40 text-xs uppercase leading-relaxed font-medium">{caseStudy.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mb-32 reveal mesh-gradient-studio studio-texture p-8 md:p-24 border-y border-navy/5 text-center -mx-8">
                            <span className="text-primary font-black uppercase tracking-[0.4em] text-sm mb-6 block border-l-4 border-primary pl-4 mx-auto w-fit">Conversión Total</span>
                            <h2 className="text-4xl md:text-[5.5rem] font-black uppercase tracking-tighter mb-10 text-navy leading-[0.8]">Dominio Absoluto<br /><span className="text-primary">Digital.</span></h2>
                            <p className="text-navy/60 text-lg md:text-xl uppercase max-w-2xl mx-auto mb-12 font-bold leading-relaxed">
                                No competimos por clics. Competimos por el mercado. Si buscas resultados ordinarios, estás en el lugar equivocado.
                            </p>
                            <a href="https://wa.me/584123152222" target="_blank" rel="noopener noreferrer" className="inline-block btn-premium bg-primary text-white px-16 py-6 text-sm font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_20px_40px_-10px_rgba(241,90,36,0.4)]">
                                Dominar Ahora
                            </a>
                        </div>

                        <footer className="bg-navy-accent/50 py-8 px-8 border-t border-white/5 text-center mt-12">
                            <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.5em]">© 2024 CLICK PRODUCTIONS. DATA DRIVEN. RESULT FOCUSED.</p>
                        </footer>
                    </div>
                </div>
            </main>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="absolute inset-0 bg-navy/95 backdrop-blur-xl"></div>
                    
                    <button 
                        className="absolute top-8 right-8 z-[110] text-white/50 hover:text-white transition-colors"
                        onClick={() => setSelectedImage(null)}
                    >
                        <span className="material-symbols-outlined text-4xl notranslate" translate="no">close</span>
                    </button>

                    <div 
                        className="relative z-[110] max-w-full max-h-full animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img 
                            src={selectedImage} 
                            alt="Resultados Ads" 
                            className="rounded-2xl shadow-2xl border border-white/10 w-auto h-auto max-w-[90vw] max-h-[85vh] object-contain"
                        />
                        <div className="mt-6 flex justify-center">
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] bg-white/5 px-6 py-2 rounded-full border border-white/5">Haga clic fuera para cerrar</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CrecimientoAds;
