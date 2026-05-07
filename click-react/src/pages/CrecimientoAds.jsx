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

                        <div className="flex flex-col lg:flex-row-reverse gap-10 lg:gap-10 items-center mb-10 pt-32 md:pt-35 reveal">
                            {/* Contenedor de Texto */}
                            <div className="flex-[1.2] text-center lg:text-left">
                                <span className="text-primary font-black uppercase tracking-[0.5em] text-xs mb-6 block border-l-4 border-primary pl-6 mx-auto lg:mx-0 w-fit lg:w-auto">
                                    {/* Subtítulo opcional */}
                                </span>

                                {/* Título con Tamaño Fluido y Reducido */}
                                <h1
                                    ref={heroTitleRef}
                                    className="text-[clamp(1.8rem,5.2vw,5.2rem)] text-center font-black uppercase leading-[1.1] tracking-tighter mb-8"
                                >
                                    Implementación<br />
                                    <span className="text-white">de embudo <br /> </span>
                                    <span className="text-primary italic">digital</span>
                                </h1>

                                {/* Párrafo descriptivo - Ajustado para armonizar con el título más pequeño */}
                                <p className="text-white/60 text-center text-base md:text-xl uppercase  mx-auto lg:mx-0 leading-snug font-bold tracking-tight">
                                    Construye una Infraestructura de Ingresos y transforma tu marketing en un activo de facturación predecible.
                                </p>
                            </div>

                            {/* Contenedor de Imagen / Icono */}
                            <div className="flex-1 w-full max-w-[500px] h-[400px] aspect-square bg-navy-accent rounded-2xl border border-white/5 flex items-center justify-center relative overflow-hidden group shadow-2xl">
                                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-primary/20 to-transparent pointer-events-none"></div>
                                <span
                                    className="material-symbols-outlined text-[8rem] text-primary/20 group-hover:scale-110 transition-transform duration-700 notranslate"
                                    translate="no"
                                >
                                    ads_click
                                </span>
                            </div>
                        </div>

                        <section className="py-20 px-8 bg-navy studio-texture relative overflow-hidden" id="problematicas">
                            <div className="max-w-[1600px] mx-auto relative z-10">
                                <div className="text-center mb-12 reveal reveal-up">
                                    <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
                                        Sabemos lo que esta pasando <span className="text-primary italic">en tu negocio hoy </span>
                                    </h2>
                                </div>

                                <div className="max-w-3xl mx-auto bg-primary rounded-[1.5rem] p-6 md:p-12 shadow-[0_40px_100px_-20px_rgba(241,90,36,0.3)] reveal reveal-up border border-white/10 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                                        <span className="material-symbols-outlined text-[12rem] text-white notranslate" translate="no">help_center</span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-5 md:gap-6 relative z-10">
                                        {[
                                            "Pagas por anuncios, te llegan decenas de mensajes, pero el caos se apodera de tu bandeja de entrada.",
                                            "Tu equipo comercial no se da abasto, responden tarde y los prospectos se enfrian.",
                                            "No tienes datos claros: no sabes quién compró realmente ni cuánto retorno te diocada anuncio.",
                                            "La trampa de la curiosidad: Recibes cientos de mensajes de personas que solopreguntan precio y desaparecen, agotando a tus vendedores en lugar depermitirles cerrar con clientes reales."
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
                                            diagnostico gratuito
                                            <span className="block text-[8px] mt-1 font-bold opacity-50 tracking-widest">Cupos limitados</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <section className="relative w-full py-20"> {/* Contenedor padre para dar espacio */}

                            {/* Título: Aseguramos que sea visible con text-white o el color de tu marca */}
                            <div className="max-w-7xl mx-auto px-4 mb-16 text-center">
                                <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-white">
                                    pilares de exito
                                </h2>
                            </div>

                            {/* Tu Grid Original: No tocamos ni una sola clase */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 reveal mesh-gradient-studio studio-texture border-y border-navy/10 mx-0 md:-mx-8 text-center">
                                {[
                                    { title: 'trafico de alta intencion', desc: 'Contenido estratégico diseñado para sacar al usuario de las redes y aterrizarlo en un entorno donde tú tienes el control total.' },
                                    { title: 'velocidad ', desc: 'El tiempo es dinero, cada segundo de carga por encima de los 3s es una donación directa a la competencia. Blindamos tu negocio para que cada clic cuente.' },
                                    { title: 'control hub', desc: 'sistema de seguimiento que automatiza el registro de leads y las alertas de WhatsApp, tu equipo podra saber cuanto dinero hay en la mesa. ' }
                                ].map((box, i) => (
                                    <div key={i} className="p-12 md:p-16 bg-transparent border-b md:border-b-0 md:border-r border-navy/10 last:border-r-0 border-t-4 border-transparent hover:border-primary hover:bg-navy/5 transition-all duration-500 group">
                                        <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-4 group-hover:text-primary transition-colors text-navy">{box.title}</h3>
                                        <p className="text-navy/40 text-xs uppercase leading-relaxed font-bold tracking-tight">{box.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>




                        <div className="mb-32 reveal mesh-gradient-studio studio-texture p-8 md:p-24 border-y border-navy/5 text-center -mx-8">
                            <span className="text-primary font-black uppercase tracking-[0.4em] text-sm mb-6 block border-l-4 border-primary pl-4 mx-auto w-fit">Conversión Total</span>
                            <h2 className="text-4xl md:text-[5.5rem] font-black uppercase tracking-tighter mb-10 text-navy leading-[0.8]">adquisicion<br /><span className="text-primary">de Clientes.</span></h2>
                            <p className="text-navy/60 text-lg md:text-xl uppercase max-w-2xl mx-auto mb-12 font-bold leading-relaxed">
                                Si estás listo para dejar atrás el caos, dejar de desperdiciar presupuesto y tomar el
                                control absoluto de tu facturación, hagamos click
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
