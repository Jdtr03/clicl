import React, { useState, useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';

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

function App() {
    const [scrolled, setScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [bookingView, setBookingView] = useState('calendar');
    const [selectedDay, setSelectedDay] = useState(13);
    const [hoveredService, setHoveredService] = useState(null);
    const heroTitleRef = useRef(null);
    const statsBarRef = useRef(null);

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
        }, { threshold: 0.1 });

        document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
        return () => revealObserver.disconnect();
    }, []);

    // Stats counter + entrance animation
    useEffect(() => {
        if (!statsBarRef.current) return;
        const cards = Array.from(statsBarRef.current.querySelectorAll('.stat-card'));
        const numbers = Array.from(statsBarRef.current.querySelectorAll('.stat-number'));

        // Read targets from data attributes before touching the DOM
        const targets = numbers.map(el => ({
            el,
            target: parseFloat(el.dataset.target),
            suffix: el.dataset.suffix,
        }));

        // Reusable count-up function
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

        // Set initial invisible state
        cards.forEach(c => { c.style.opacity = '0'; c.style.transform = 'translateY(1.5rem)'; });

        const observer = new IntersectionObserver((entries) => {
            if (!entries[0].isIntersecting) return;
            observer.disconnect();

            // Entrance animation (once)
            animate(cards, {
                opacity: [0, 1],
                translateY: ['1.5rem', '0rem'],
                duration: 700,
                ease: 'outExpo'
            });

            // First run
            runCountUp();

            // Add hover listener after initial run
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

    const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);

    return (
        <div className="text-navy antialiased overflow-x-hidden font-sans">
            <header className="fixed top-0 w-full z-50 bg-navy border-b border-white/5">
                <nav className="max-w-[1600px] mx-auto px-8 h-24 flex items-center justify-between">
                    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-3 cursor-pointer">
                        <div className="w-10 h-10 flex items-center justify-center">
                            <svg className="w-full h-full text-primary" fill="currentColor" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeWidth="12"></circle>
                                <circle cx="50" cy="50" r="18"></circle>
                            </svg>
                        </div>
                        <div className="flex flex-col leading-none logo-text">
                            <span className="text-2xl font-black tracking-tighter uppercase text-white">Click.</span>
                            <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase">Productions</span>
                        </div>
                    </button>
                    <div className="hidden md:flex items-center gap-12 text-white">
                        {['ejecucion', 'servicios', 'clientes', 'reserva'].map(item => (
                            <a key={item} onClick={(e) => handleNavClick(e, item)} className="nav-link text-[11px] font-bold hover:text-primary transition-colors uppercase tracking-[0.2em] cursor-pointer" href={`#${item}`}>{item}</a>
                        ))}
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="hidden md:block btn-premium border border-white/20 text-white px-8 py-3 text-[11px] font-black transition-all uppercase tracking-[0.2em] hover:border-primary hover:bg-primary">
                            Iniciar Proyecto
                        </button>
                        
                        {/* Mobile Menu Toggle */}
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden text-white p-2"
                        >
                            <span className="material-symbols-outlined text-3xl">
                                {isMenuOpen ? 'close' : 'menu'}
                            </span>
                        </button>
                    </div>

                    {/* Mobile Navigation Overlay */}
                    <div className={`fixed inset-0 bg-navy z-[60] flex flex-col items-center justify-center gap-8 transition-all duration-500 md:hidden ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                        <button 
                            onClick={() => setIsMenuOpen(false)}
                            className="absolute top-8 right-8 text-white p-2"
                        >
                            <span className="material-symbols-outlined text-4xl text-primary">close</span>
                        </button>
                        {['ejecucion', 'servicios', 'clientes', 'reserva'].map(item => (
                            <a 
                                key={item} 
                                onClick={(e) => handleNavClick(e, item)} 
                                className="text-4xl font-black text-white hover:text-primary uppercase tracking-tighter transition-colors"
                            >
                                {item}
                            </a>
                        ))}
                        <button className="mt-8 btn-premium bg-primary text-white px-12 py-6 font-black uppercase tracking-widest">
                            Iniciar Proyecto
                        </button>
                    </div>
                </nav>
            </header>

            <main>
                <section className="min-h-screen flex items-center px-8 pt-24 bg-navy relative">
                    <div className="max-w-[1600px] mx-auto w-full pb-32 md:pb-48 relative z-10">
                        <div className="max-w-6xl reveal reveal-left">
                            <h1 ref={heroTitleRef} className="text-primary text-5xl sm:text-7xl md:text-[6.5rem] lg:text-[8rem] font-black leading-[0.9] md:leading-none tracking-tighter uppercase mb-6 md:mb-10">
                                VALIENTE.<br />CREATIVO.<br /><span className="text-white">IMPARABLE.</span>
                            </h1>
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
                                <p className="text-white/80 text-lg md:text-3xl max-w-2xl font-medium leading-tight uppercase">
                                    Somos Click Productions. Una agencia de alto impacto para marcas listas para dominar el panorama digital.
                                </p>
                                <div className="flex gap-4">
                                    <button 
                                        onClick={(e) => handleNavClick(e, 'ejecucion')}
                                        className="btn-premium bg-primary text-white px-10 py-5 md:px-12 md:py-6 text-sm md:text-base font-black uppercase tracking-widest hover:brightness-110 transition-all"
                                    >
                                        Ver Portafolio
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full floating-stats px-4 md:px-8 translate-y-1/2 md:translate-y-0 z-20">
                        <div className="max-w-[1600px] mx-auto bg-navy border border-white/10 border-t-2 border-t-primary shadow-2xl reveal reveal-up">
                            <div className="grid grid-cols-1 md:grid-cols-3" ref={statsBarRef}>
                                <div className="stat-card border-r border-white/10">
                                    <span className="text-xs font-black tracking-[0.4em] text-white/30 uppercase mb-3 block">— 01 —</span>
                                    <span className="stat-number text-5xl md:text-6xl font-black text-primary mb-3" data-target="250" data-suffix="+">250+</span>
                                    <span className="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase">Proyectos Entregados</span>
                                </div>
                                <div className="stat-card border-r border-white/10">
                                    <span className="text-xs font-black tracking-[0.4em] text-white/30 uppercase mb-3 block">— 02 —</span>
                                    <span className="stat-number text-5xl md:text-6xl font-black text-primary mb-3" data-target="15" data-suffix="M+">15M+</span>
                                    <span className="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase">Alcance Orgánico</span>
                                </div>
                                <div className="stat-card">
                                    <span className="text-xs font-black tracking-[0.4em] text-white/30 uppercase mb-3 block">— 03 —</span>
                                    <span className="stat-number text-5xl md:text-6xl font-black text-primary mb-3" data-target="100" data-suffix="%">100%</span>
                                    <span className="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase">Retención de Clientes</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-20 px-8 mesh-gradient-studio studio-texture overflow-hidden" id="ejecucion">
                    <div className="max-w-[1600px] mx-auto relative z-10">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-16 reveal reveal-up">
                            <div className="max-w-4xl">
                                <span className="text-primary font-black uppercase tracking-[0.4em] text-sm mb-6 block border-l-4 border-primary pl-4">Especialistas</span>
                                <h2 className="text-5xl md:text-[7.5rem] font-black leading-[0.75] tracking-tighter uppercase text-navy">
                                    Lo Que<br /><span className="text-primary">Ejecutamos.</span>
                                </h2>
                            </div>
                            <div className="md:border-l-4 border-navy/10 md:pl-12 py-4 max-w-sm">
                                <p className="text-navy/80 text-lg uppercase leading-tight font-bold tracking-tight">
                                    Un enfoque riguroso de estudio físico aplicado a la producción digital de vanguardia.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row gap-px bg-white/10 border border-white/10 shadow-2xl reveal reveal-up overflow-hidden">
                            {[
                                { id: '01', icon: 'movie_edit', title: 'Creación de\nContenido', desc: 'Producción de calidad cinematográfica adaptada a los algoritmos sociales modernos y al storytelling de marca de alta conversión.', items: ['Producción de video', 'Activos sociales'] },
                                { id: '02', icon: 'groups_3', title: 'Departamento\nExterno', desc: 'Nos convertimos en tu departamento de marketing. Desde estrategia nivel CMO hasta despliegue diario y gestión de comunidad.', items: ['Integración de equipo', 'Resultados escalables'] },
                                { id: '03', icon: 'ads_click', title: 'Crecimiento\ny Ads', desc: 'Campañas publicitarias orientadas al rendimiento que aprovechan nuestra creatividad personalizada para maximizar el ROAS.', items: ['Adquisición de pago', 'Optimización de funnel'] },
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
                                    <span className="material-symbols-outlined text-primary text-6xl mb-12 group-hover:scale-110 transition-transform block">{service.icon}</span>
                                    <h3 className="text-4xl font-black text-white uppercase tracking-tighter mb-8 leading-none" dangerouslySetInnerHTML={{ __html: service.title.replace('\n', '<br />') }}></h3>
                                    <p className="text-white/50 text-sm uppercase leading-relaxed mb-12 font-medium">{service.desc}</p>
                                    <ul className="space-y-5 mb-8">
                                        {service.items.map(item => (
                                            <li key={item} className="flex items-center gap-4 text-xs font-bold tracking-widest uppercase text-white">
                                                <span className="w-2.5 h-2.5 rounded-full bg-primary"></span> {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-20 px-8 mesh-gradient-studio studio-texture border-t border-navy/5" id="servicios">
                    <div className="max-w-[1600px] mx-auto relative z-10">
                        <div className="max-w-4xl mb-12 reveal reveal-left">
                            <span className="text-primary font-black uppercase tracking-[0.4em] text-sm mb-6 block border-l-4 border-primary pl-4">Ecosistema Completo</span>
                            <h2 className="text-6xl md:text-8xl font-black leading-none tracking-tighter uppercase text-navy">
                                Nuestros<br /><span className="text-primary">Servicios.</span>
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-8 border-t border-navy/10 pt-12 reveal reveal-up">
                            {['Branding', 'Gestión de RRSS', 'Paid Ads', 'SEO', 'Email Marketing', 'Automatización', 'Producción de Contenido', 'Influencers', 'Analítica de Datos', 'Organización de Eventos', 'Publicidad en la Calle'].map(service => (
                                <div key={service} className="service-item">
                                    <span className="material-symbols-outlined text-primary font-bold text-3xl">check_circle</span>
                                    <span className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-navy">{service}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-20 px-8 bg-off-white studio-texture border-b border-navy/5" id="clientes">
                    <div className="max-w-[1600px] mx-auto text-center relative z-10 reveal reveal-up">
                        <h2 className="text-4xl md:text-5xl font-black text-navy uppercase tracking-tighter mb-12">Marcas con las que hemos trabajado</h2>
                        <div className="logo-cloud grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-16 items-center justify-items-center">
                            {[
                                { alt: 'Bonsai Sushi', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCeWst9626MU61jhvcaL36oH4z46qN4VUfC_CzXDNzvT13Nf0w0ONNmYZfKT1XMSWRv0oZdg8ST5DFjcs374QYvLjB8BE_CNEKR5c-ky4VvCAaDwGQDORAgMJwdqKOx6X1f6oKkgtZKkRSonTY8qpZqA5Ziq_2VMrwu-Yr1e0EXn1iveffAK2X5FW_f83n4GhcYfTk7WzROVFfYzjJ_6vHrBhbilOiMNz1qL026NfNEfVzobW7y3cPwZYNedNEZYEdQr1NqlCoHJOs' },
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

                <section className="py-28 px-8 mesh-gradient-studio studio-texture overflow-hidden" id="reserva">
                    <div className="max-w-[1600px] mx-auto relative z-10">
                        <div className="text-center mb-14 reveal reveal-up">
                            <span className="text-primary font-black uppercase tracking-[0.4em] text-sm mb-6 block">Siguiente Paso</span>
                            <h2 className="text-5xl md:text-[7.2rem] font-black text-navy uppercase tracking-tighter">RESERVA TU<br /><span className="text-primary">AUDITORÍA.</span></h2>
                        </div>
                        <div className="bg-white shadow-[0_60px_120px_-20px_rgba(1,5,33,0.15)] max-w-6xl mx-auto flex flex-col md:flex-row min-h-[700px] overflow-hidden">
                            <div className="w-full md:w-1/3 bg-white p-6 md:p-12 border-r border-navy/5 flex flex-col">
                                <div className="flex items-center gap-3 mb-8 md:mb-16">
                                    <div className="w-8 h-8 flex items-center justify-center text-navy">
                                        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeWidth="12"></circle>
                                            <circle cx="50" cy="50" r="18"></circle>
                                        </svg>
                                    </div>
                                    <div className="flex flex-col leading-none">
                                        <span className="text-lg font-black tracking-tighter text-navy uppercase">Click.</span>
                                        <span className="text-[8px] font-bold tracking-[0.3em] text-primary uppercase">Productions</span>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-4xl font-black text-navy uppercase leading-none tracking-tighter">Auditoría de<br />Negocio</h3>
                                    <div className="flex items-center gap-3 text-navy/40 font-bold uppercase tracking-widest text-xs">
                                        <span className="material-symbols-outlined text-sm">schedule</span> 30 min
                                    </div>
                                    <p className="text-navy/60 text-sm font-medium uppercase leading-relaxed pt-8 border-t border-navy/5">
                                        Analizaremos tu situación actual, identificaremos cuellos de botella y trazaremos un plan de acción para escalar tu marca.
                                    </p>
                                </div>
                                <div className="mt-auto pt-12">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-studio-gray"></div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-navy">Estratega Senior</p>
                                            <p className="text-[10px] font-bold uppercase text-navy/40">Especialista en Growth</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full md:w-2/3 p-6 md:p-12 relative">
                                {bookingView === 'calendar' ? (
                                    <div className="booking-pane space-y-8 md:space-y-12">
                                        <div className="flex items-center justify-between mb-6 md:mb-8">
                                            <h4 className="text-xl font-black text-navy uppercase tracking-tighter">Selecciona fecha y hora</h4>
                                            <div className="flex gap-4">
                                                <button className="p-2 hover:bg-navy/5 rounded-full"><span className="material-symbols-outlined">chevron_left</span></button>
                                                <button className="p-2 hover:bg-navy/5 rounded-full"><span className="material-symbols-outlined">chevron_right</span></button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-widest text-navy/40 mb-6">Noviembre 2024</p>
                                                <div className="calendar-grid text-[10px] font-black text-navy/20 mb-4 uppercase tracking-widest">
                                                    {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map(d => <div key={d} className="text-center">{d}</div>)}
                                                </div>
                                                <div className="calendar-grid">
                                                    {Array.from({ length: 4 }).map((_, i) => <div key={`prev-${i}`} className="calendar-day day-disabled">{28 + i}</div>)}
                                                    {calendarDays.slice(0, 17).map(day => (
                                                        <div
                                                            key={day}
                                                            onClick={() => setSelectedDay(day)}
                                                            className={`calendar-day day-active ${selectedDay === day ? 'day-selected' : ''} ${day === 13 ? 'day-today' : ''}`}
                                                        >
                                                            {day < 10 ? `0${day}` : day}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-4">
                                                <p className="text-xs font-black uppercase tracking-widest text-navy/40 mb-6">Slots Disponibles</p>
                                                {['09:00 AM', '10:30 AM', '01:00 PM', '03:30 PM', '05:00 PM'].map(time => (
                                                    <button key={time} onClick={() => setBookingView('form')} className="time-slot w-full py-4 border-2 border-navy/10 hover:border-primary text-navy font-black text-xs uppercase tracking-widest transition-all">{time}</button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="booking-pane space-y-8">
                                        <div className="flex items-center gap-4 mb-8">
                                            <button onClick={() => setBookingView('calendar')} className="text-navy/40 hover:text-navy transition-colors">
                                                <span className="material-symbols-outlined">arrow_back</span>
                                            </button>
                                            <h4 className="text-xl font-black text-navy uppercase tracking-tighter">Completa tu perfil</h4>
                                        </div>
                                        <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6" onSubmit={(e) => e.preventDefault()}>
                                            {[
                                                { label: 'Nombre Completo', placeholder: 'Ej. Juan Pérez', type: 'text' },
                                                { label: 'Email Corporativo', placeholder: 'hola@tuempresa.com', type: 'email' },
                                                { label: 'WhatsApp', placeholder: '+34 000 000 000', type: 'tel' },
                                                { label: 'Instagram @', placeholder: '@tu.marca', type: 'text' },
                                                { label: 'URL Sitio Web', placeholder: 'https://www.tuweb.com', type: 'url', full: true },
                                            ].map(field => (
                                                <div key={field.label} className={`space-y-1 ${field.full ? 'md:col-span-2' : ''}`}>
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-navy/40">{field.label}</label>
                                                    <input className="w-full border-0 border-b-2 border-navy/10 focus:ring-0 focus:border-primary text-navy font-bold text-sm py-3" placeholder={field.placeholder} type={field.type} />
                                                </div>
                                            ))}
                                            <div className="space-y-4 md:col-span-2 mt-4">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-navy/40">¿Tienes experiencia previa con agencias?</label>
                                                <div className="flex gap-4">
                                                    {['Sí, busco cambio', 'No, es mi primera vez'].map(opt => (
                                                        <label key={opt} className="flex-1">
                                                            <input className="hidden peer" name="exp" type="radio" />
                                                            <div className="p-4 border-2 border-navy/5 peer-checked:border-primary peer-checked:bg-primary/5 text-center text-xs font-black uppercase tracking-widest cursor-pointer hover:border-navy/20 transition-all">{opt}</div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="md:col-span-2 pt-8">
                                                <button className="btn-premium w-full bg-navy text-white py-6 text-sm font-black uppercase tracking-[0.3em] hover:bg-primary transition-all shadow-xl" type="submit">
                                                    CONFIRMAR AUDITORÍA
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-navy py-24 px-8 text-white relative overflow-hidden">
                <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 relative z-10 reveal reveal-up">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-8 h-8 flex items-center justify-center">
                                <svg className="w-full h-full text-primary" fill="currentColor" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeWidth="12"></circle>
                                    <circle cx="50" cy="50" r="18"></circle>
                                </svg>
                            </div>
                            <div className="flex flex-col leading-none">
                                <span className="text-xl font-black tracking-tighter uppercase">Click.</span>
                                <span className="text-[8px] font-bold tracking-[0.3em] text-primary uppercase">Productions</span>
                            </div>
                        </div>
                        <p className="text-white/40 font-bold uppercase tracking-widest leading-loose max-w-sm">
                            Agencia creativa de alto impacto especializada en alcance masivo y outsourcing total.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-black uppercase tracking-widest text-xs text-primary mb-10">Conectar</h4>
                        <ul className="space-y-6">
                            {['Instagram', 'LinkedIn'].map(sm => (
                                <li key={sm}><a className="text-xs text-white hover:text-primary transition-colors font-black uppercase tracking-widest" href="#">{sm}</a></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-black uppercase tracking-widest text-xs text-primary mb-10">Contacto</h4>
                        <p className="text-xs text-white font-black uppercase tracking-widest mb-4">hola@click.pro</p>
                        <p className="text-xs text-white/40 font-medium uppercase tracking-widest">Disponible Globalmente</p>
                    </div>
                </div>
                <div className="max-w-[1600px] mx-auto pt-24 mt-24 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                    <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.5em]">© 2024 CLICK PRODUCTIONS. BOLD MOVE.</p>
                    <div className="flex gap-12">
                        <span className="text-[9px] text-primary font-black uppercase tracking-[0.4em]">EL IMPACTO PRIMERO</span>
                        <span className="text-[9px] text-primary font-black uppercase tracking-[0.4em]">GUIADOS POR DATOS</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default App;
