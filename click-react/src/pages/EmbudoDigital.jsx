import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { animate, stagger } from 'animejs';
import clickLogo from '../assets/imagenes/logo-click-n.png';
import proceso1 from '../assets/imagenes/proceso-1.webp';
import proceso2 from '../assets/imagenes/proceso-2.webp';
import proceso3 from '../assets/imagenes/proceso-3.webp';

/**
 * Utility to split text into characters while preserving HTML structure
 */
function splitText(element) {
    if (!element) return { chars: [] };
    const charElements = [];
    const childNodes = Array.from(element.childNodes);
    element.innerHTML = '';

    childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            const words = node.textContent.split(/(\s+)/);
            words.forEach(word => {
                if (word === '') return;
                if (word.trim() === '') {
                    element.appendChild(document.createTextNode(word));
                } else {
                    const wordSpan = document.createElement('span');
                    wordSpan.className = 'inline-block whitespace-nowrap';
                    [...word].forEach(char => {
                        const charSpan = document.createElement('span');
                        charSpan.textContent = char;
                        charSpan.className = 'char';
                        wordSpan.appendChild(charSpan);
                        charElements.push(charSpan);
                    });
                    element.appendChild(wordSpan);
                }
            });
        } else {
            element.appendChild(node);
        }
    });

    return { chars: charElements };
}

function EmbudoDigital() {
    const [selectedImage, setSelectedImage] = useState(null);
    const [scrolled, setScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showCalendar, setShowCalendar] = useState(true);
    const heroTitleRef = useRef(null);

    const handleNavClick = (e, id) => {
        e.preventDefault();
        const section = document.getElementById(id);
        if (!section) return;
        setIsMenuOpen(false);
        const offset = 96;
        const top = section.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
        // Meta Pixel: track intent to book an audit
        if (id === 'auditoria' && typeof window.fbq === 'function') {
            window.fbq('track', 'Lead', { content_name: 'Diagnóstico Gratuito - Embudo Digital' });
        }
    };

    const handleDominarAhora = () => {
        if (!showCalendar) {
            setShowCalendar(true);
            // Meta Pixel: user clicked to open the calendar (Schedule intent)
            if (typeof window.fbq === 'function') {
                window.fbq('track', 'Schedule', { content_name: 'Calendario Auditoría - Embudo Digital' });
            }
            setTimeout(() => {
                const section = document.getElementById('auditoria');
                if (section) {
                    const offset = 80;
                    const top = section.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({ top, behavior: 'smooth' });
                }
            }, 100);
        } else {
            setShowCalendar(false);
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);

        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
        <div className="page-content-scaled bg-navy min-h-screen text-white font-sans selection:bg-primary/30">
            {/* Header / Navigation */}
            <header className={`fixed top-0 w-full z-[100] transition-all duration-500 ${scrolled ? 'bg-navy/95 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-navy/40 backdrop-blur-sm py-6 md:py-8'}`}>
                <nav className="max-w-[1600px] mx-auto px-6 sm:px-8 flex items-center justify-between">
                    <Link to="/" className="flex items-center cursor-pointer">
                        <img src={clickLogo} alt="Click Productions Logo" className="h-16 w-auto object-contain" />
                    </Link>

                    <div className="hidden md:flex items-center gap-10">
                        <Link to="/" className="text-[11px] font-black uppercase tracking-[0.3em] text-white hover:text-primary transition-colors">Inicio</Link>
                        <Link to="/creacion-contenido" className="text-[11px] font-black uppercase tracking-[0.3em] text-white hover:text-primary transition-colors">Contenido</Link>
                        <Link to="/embudo-digital" className="text-[11px] font-black uppercase tracking-[0.3em] text-white hover:text-primary transition-colors">Embudo Digital</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={(e) => handleNavClick(e, 'auditoria')}
                            className="hidden sm:block btn-premium border border-white/20 text-white px-8 py-3.5 text-[11px] font-black transition-all uppercase tracking-[0.3em] hover:border-primary hover:bg-primary text-center"
                        >
                            Auditoría Gratuita
                        </button>

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

            {/* Mobile Menu Overlay */}
            <div className={`fixed inset-0 z-[200] transition-all duration-700 ease-expo flex flex-col md:hidden overflow-y-auto ${isMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
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
                            { label: 'Embudo Digital', target: '/embudo-digital' }
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
                        <button
                            onClick={(e) => {
                                setIsMenuOpen(false);
                                handleNavClick(e, 'auditoria');
                            }}
                            className="block w-full py-6 bg-primary text-white font-black uppercase tracking-widest text-center shadow-2xl text-sm"
                        >
                            Auditoría Gratuita
                        </button>
                    </div>
                </div>
            </div>

            <main className="md:pt-8">
                {/* Hero section */}
                <section className="flex flex-col items-center mb-10 md:mb-20 pt-32 md:pt-48 reveal px-8">
                    <div className="w-full max-w-[1400px] mx-auto text-center">
                        <span className="text-primary font-black uppercase tracking-[0.5em] text-xs mb-6 block border-l-4 border-primary pl-6 mx-auto w-fit">
                            ESTRATEGIA
                        </span>
                        <h1
                            ref={heroTitleRef}
                            className="text-[clamp(2.5rem,7.5vw,9rem)] text-center font-black uppercase leading-[0.9] tracking-tighter mb-10"
                        >
                            Implementación<br />
                            <span className="text-white">de embudo <br /> </span>
                            <span className="text-primary italic">digital</span>
                        </h1>
                        <p className="text-white/60 text-center text-lg md:text-2xl lg:text-3xl uppercase mx-auto leading-tight font-bold tracking-tight max-w-4xl">
                            Construye una Infraestructura de Ingresos y transforma tu marketing en un activo de facturación predecible.
                        </p>
                    </div>
                </section>

                    {/* Content sections */}
                    <section className="relative w-full py-24 px-4 sm:px-8 bg-gradient-to-b from-[#F7F8FC] to-[#EFF1F6] studio-texture border-y border-black/5">
                        <div className="max-w-7xl mx-auto mb-16 text-center reveal reveal-up">
                            <h2 className="text-[clamp(2rem,5.5vw,5.5rem)] font-black uppercase tracking-tighter text-navy font-display">
                                Pilares de Éxito
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                            {[
                                {
                                    icon: 'ads_click',
                                    title: 'tráfico de alta intención',
                                    desc: 'Contenido estratégico diseñado para sacar al usuario de las redes y aterrizarlo en un entorno donde tú tienes el control total.'
                                },
                                {
                                    icon: 'bolt',
                                    title: 'velocidad de respuesta',
                                    desc: 'El tiempo es dinero: cada segundo de carga es una donación directa a la competencia. Blindamos tu negocio para que cada clic cuente.'
                                },
                                {
                                    icon: 'hub',
                                    title: 'control hub centralizado',
                                    desc: 'Sistema de seguimiento que automatiza el registro de leads y alertas de WhatsApp para saber exactamente cuánto dinero hay en la mesa.'
                                }
                            ].map((box, i) => (
                                <div
                                    key={i}
                                    className="bg-white border border-black/5 rounded-[1.5rem] p-10 md:p-12 flex flex-col items-start transition-all duration-500 hover:border-primary/20 hover:-translate-y-1 shadow-[0_20px_50px_-20px_rgba(1,5,33,0.06)] hover:shadow-[0_30px_60px_-15px_rgba(241,90,36,0.12)] relative overflow-hidden group border-t-4 border-t-transparent hover:border-t-primary"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center mb-8 group-hover:bg-primary/20 group-hover:border-primary/30 transition-all duration-500">
                                        <span className="material-symbols-outlined text-primary text-3xl notranslate" translate="no">{box.icon}</span>
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-black text-navy uppercase tracking-tighter mb-4 group-hover:text-primary transition-colors font-display text-left">
                                        {box.title}
                                    </h3>
                                    <p className="text-navy/60 text-sm md:text-base leading-relaxed font-medium transition-colors group-hover:text-navy/80 text-left">
                                        {box.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="max-w-[1400px] mx-auto px-8">
                        <section className="py-20 bg-navy studio-texture relative overflow-hidden rounded-[2rem] my-20" id="problematicas">
                            <div className="max-w-[1600px] mx-auto relative z-10 px-8">
                                <div className="text-center mb-12 reveal reveal-up">
                                    <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
                                        Sabemos lo que está pasando <span className="text-primary italic">en tu negocio hoy </span>
                                    </h2>
                                </div>
                                <div className="max-w-3xl mx-auto bg-gradient-to-br from-primary to-[#b83c10] rounded-[1.5rem] p-8 md:p-12 shadow-[0_40px_80px_-20px_rgba(241,90,36,0.25)] reveal reveal-up border border-white/10 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                                        <span className="material-symbols-outlined text-[12rem] text-white notranslate" translate="no">help_center</span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-6 relative z-10 text-left">
                                        {[
                                            { text: "Pagas por anuncios, te llegan decenas de mensajes, pero ", highlight: "el caos se apodera de tu bandeja de entrada." },
                                            { text: "Tu equipo comercial no se da abasto, ", highlight: "responden tarde y los prospectos se enfrían." },
                                            { text: "No tienes datos claros: ", highlight: "no sabes quién compró realmente ni cuánto retorno te dio cada anuncio." },
                                            { text: "La trampa de la curiosidad: ", highlight: "recibes cientos de mensajes de personas que solo preguntan precio y desaparecen, agotando a tus vendedores." }
                                        ].map((problem, idx) => (
                                            <div key={idx} className="flex items-start gap-4 group">
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all duration-300 mt-1">
                                                    <span className="material-symbols-outlined text-white text-lg md:text-xl notranslate" translate="no">cancel</span>
                                                </div>
                                                <p className="text-white/85 text-base md:text-lg font-medium leading-relaxed tracking-tight">
                                                    {problem.text}
                                                    <strong className="text-white font-black">{problem.highlight}</strong>
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
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="py-24 reveal reveal-up px-8">
                            <h2 className="text-[clamp(1.8rem,3.8vw,3.8rem)] font-black text-white uppercase tracking-tighter mb-6 leading-[1.1] max-w-4xl text-left font-display">
                                Ingeniería de procesos al servicio de tu rentabilidad.
                            </h2>
                            <p className="text-white/60 text-base md:text-xl font-bold uppercase tracking-tight max-w-3xl mb-16 text-left">
                                No es magia, es un sistema prácticamente automatizado diseñado para acoplarse y optimizar los procesos de venta que tu empresa ya tiene:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                                {[
                                    { icon: 'sensors', title: 'Atracción con intención', desc: 'Activamos un sistema de pauta que no busca "likes", sino inyectar interesados calificados directamente en tu embudo.' },
                                    { icon: 'psychology', title: 'Captación y educación', desc: 'El sistema atiende, informa y califica al interesado en milisegundos, asegurando que solo los prospectos con intención real lleguen a tu equipo humano.' },
                                    { icon: 'precision_manufacturing', title: 'Control operativo', desc: 'Instalamos el centro de mando que organiza cada oportunidad. El sistema sabe qué paso sigue y se encarga de que nadie se encuentre en el olvido.' }
                                ].map((box, i) => (
                                    <div key={i} className="bg-navy-accent/50 border border-white/5 rounded-[1.5rem] p-8 md:p-10 flex flex-col items-start transition-all duration-500 hover:border-primary/20 hover:bg-navy-accent/70 shadow-2xl relative overflow-hidden group">
                                        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-8 shadow-lg shadow-primary/20">
                                            <span className="material-symbols-outlined text-white text-3xl notranslate" translate="no">{box.icon}</span>
                                        </div>
                                        <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter mb-4 leading-none font-display">{box.title}</h3>
                                        <p className="text-white/50 text-sm md:text-base leading-relaxed font-medium">{box.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="py-20 reveal reveal-up px-8">
                            <div className="text-center mb-16">
                                <h2 className="text-[clamp(1.8rem,4vw,4rem)] font-black text-white uppercase tracking-tighter font-display">
                                    muestra de proceso de <span className="text-primary italic">embudos digitales</span>
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {[
                                    { img: proceso3, title: 'Anuncios y manejo de tráfico meta ads' },
                                    { img: proceso1, title: 'Landing Page de conversión ' },
                                    { img: proceso2, title: 'CRM de seguimiento y automatización' }
                                ].map((p, i) => (
                                    <div key={i} className="group overflow-hidden rounded-2xl border border-white/10 bg-navy-accent shadow-2xl cursor-pointer" onClick={() => setSelectedImage(p.img)}>
                                        <div className="aspect-video md:aspect-[16/10] overflow-hidden bg-navy/40 flex items-center justify-center">
                                            <img src={p.img} alt={p.title} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 p-2" />
                                        </div>
                                        <div className="p-6 border-t border-white/5 bg-navy-accent/50 text-center">
                                            <span className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-2 block">Paso 0{i + 1}</span>
                                            <h4 className="text-lg font-black uppercase tracking-tighter text-white">{p.title}</h4>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="py-24 reveal reveal-up px-8">
                            <div className="text-center">
                                <h2 className="text-[clamp(1.8rem,5vw,5vw)] font-black text-white uppercase tracking-tighter mb-12 leading-[1.0] max-w-5xl mx-auto font-display text-center">
                                    ¿Por qué estás perdiendo<br />el <span className="text-primary">80%</span> de tus cierres?
                                </h2>
                                <div className="max-w-4xl mx-auto bg-navy-accent/50 border border-white/5 rounded-[1.5rem] p-8 md:p-12 shadow-[0_30px_80px_-20px_rgba(1,5,33,1)]">
                                    <p className="text-white/80 text-base md:text-xl font-medium leading-relaxed mb-8">
                                        La estadística es innegable: <strong className="text-white font-black">Si un prospecto no recibe respuesta en los primeros 5 minutos, la probabilidad de cerrar la venta cae un 80%.</strong>
                                    </p>
                                    <p className="text-white/50 text-sm md:text-base leading-relaxed font-medium mb-10 max-w-3xl mx-auto">
                                        Nuestro sistema automatiza el trabajo pesado de atracción, filtrado y contacto inicial, asegurando que la ventana de oportunidad nunca se cierre. Así, tu equipo comercial solo se dedica a lo que realmente importa: <strong className="text-primary font-black">Cerrar ventas.</strong>
                                    </p>
                                    <div className="w-full h-px bg-white/10 my-8"></div>
                                    <div className="text-[clamp(2.5rem,6vw,6rem)] font-black text-primary uppercase tracking-[0.1rem] font-display leading-none text-center">5 MINUTOS</div>
                                </div>
                            </div>
                        </section>

                        <div className="reveal mesh-gradient-studio studio-texture p-8 md:p-24 border-t border-navy/5 text-center -mx-8">
                            <span className="text-primary font-black uppercase tracking-[0.4em] text-sm mb-6 block border-l-4 border-primary pl-4 mx-auto w-fit">Conversión Total</span>
                            <h2 className="text-4xl md:text-[5.5rem] font-black uppercase tracking-tighter mb-10 text-navy leading-[0.8]">adquisición<br /><span className="text-primary">de Clientes.</span></h2>
                            <p className="text-navy/60 text-lg md:text-xl uppercase max-w-2xl mx-auto mb-12 font-bold leading-relaxed">
                                Si estás listo para dejar atrás el caos, dejar de desperdiciar presupuesto y tomar el control absoluto de tu facturación, hagamos clic
                            </p>
                        </div>
                    </div>

                    {/* Auditoria Section */}
                    <div className={`transition-all duration-1000 ease-in-out overflow-hidden ${showCalendar ? 'max-h-[2000px] opacity-100 mb-40' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                        <section className="px-8 pt-10 pb-20 mesh-gradient-studio studio-texture overflow-hidden" id="auditoria">
                            <div className="max-w-[1600px] mx-auto relative z-10">
                                <div className="bg-white shadow-[0_40px_80px_-20px_rgba(1,5,33,0.1)] max-w-7xl mx-auto flex flex-col md:flex-row min-h-[1000px] overflow-hidden rounded-2xl">
                                    <div className="w-full md:w-[35%] bg-white p-10 md:p-12 border-r border-navy/5 flex flex-col">
                                        <div className="space-y-8">
                                            <h3 className="text-4xl font-black text-navy uppercase leading-[0.9] tracking-tighter">Auditoría de<br />Negocio</h3>
                                            <div className="flex items-center gap-4 text-navy/40 font-bold uppercase tracking_widest text-xs">
                                                <span className="material-symbols-outlined text-base notranslate" translate="no">calendar_today</span> 30 min
                                            </div>
                                            <div className="space-y-6 pt-8 border-t border-navy/5 text-left">
                                                <p className="text-navy/70 text-sm font-medium uppercase leading-relaxed">Selecciona una fecha y hora para tu auditoría. Vamos a trazar el plan para escalar tu marca.</p>
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
                                                <div className="w-10 h-10 rounded-full bg-studio-gray opacity-20"></div>
                                                <div className="text-left">
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
                    </div>

                    <footer className="py-8 px-8 border-t border-white/5 text-center mt-12 bg-navy">
                        <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.5em]">© 2024 CLICK PRODUCTIONS. DATA DRIVEN. RESULT FOCUSED.</p>
                    </footer>
                </main>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300" onClick={() => setSelectedImage(null)}>
                    <div className="absolute inset-0 bg-navy/95 backdrop-blur-xl"></div>
                    <button className="absolute top-8 right-8 z-[110] text-white/50 hover:text-white transition-colors" onClick={() => setSelectedImage(null)}>
                        <span className="material-symbols-outlined text-4xl notranslate" translate="no">close</span>
                    </button>
                    <div className="relative z-[110] max-w-full max-h-full animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
                        <img src={selectedImage} alt="Resultados Ads" className="rounded-2xl shadow-2xl border border-white/10 w-auto h-auto max-w-[90vw] max-h-[85vh] object-contain" />
                        <div className="mt-6 flex justify-center">
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] bg-white/5 px-6 py-2 rounded-full border border-white/5">Haga clic fuera para cerrar</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EmbudoDigital;
