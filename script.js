/**
 * Utility to split text into characters while preserving HTML structure
 */
function splitText(selector, { words = false, chars = true } = {}) {
    const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
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

// Booking System Interaction
document.addEventListener('DOMContentLoaded', () => {
    const calendarView = document.getElementById('calendar-view');
    const formView = document.getElementById('form-view');
    const timeSlotButtons = document.querySelectorAll('.time-slot');
    const backToCalendarBtn = document.getElementById('back-to-calendar');

    // Show form when a time slot is selected
    timeSlotButtons.forEach(button => {
        button.addEventListener('click', () => {
            calendarView.classList.add('hidden');
            formView.classList.remove('hidden');
            formView.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Go back to calendar
    if (backToCalendarBtn) {
        backToCalendarBtn.addEventListener('click', () => {
            formView.classList.add('hidden');
            calendarView.classList.remove('hidden');
            calendarView.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Scroll Reveal Animation
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // Stats Counter Animation
    const countObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.animated) {
                animateCount(entry.target);
                entry.target.dataset.animated = "true";
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-number').forEach(el => countObserver.observe(el));

    // Header Scroll Effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }
    });

    // Calendar Selection Logic
    const calendarDays = document.querySelectorAll('.day-active');
    calendarDays.forEach(day => {
        day.addEventListener('click', () => {
            calendarDays.forEach(d => d.classList.remove('day-selected'));
            day.classList.add('day-selected');
        });
    });

    function animateCount(el) {
        const target = parseFloat(el.innerText.replace(/[^0-9.]/g, ''));
        const suffix = el.innerText.replace(/[0-9.]/g, '');
        let count = 0;
        const duration = 2000;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentCount = Math.floor(progress * target);
            
            el.innerText = currentCount + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.innerText = target + suffix;
            }
        }
        requestAnimationFrame(update);
    }

    // Apply Anime.js text animation to the hero title
    const { chars } = splitText('#hero-title', { words: false, chars: true });

    if (chars.length > 0) {
        anime({
            targets: chars,
            // Property keyframes
            translateY: [
                { value: '-2.75rem', easing: 'easeOutExpo', duration: 600 },
                { value: 0, easing: 'easeOutBounce', duration: 800, delay: 100 }
            ],
            // Property specific parameters
            rotate: {
                value: ['-1turn', 0],
                delay: 0
            },
            delay: anime.stagger(50),
            easing: 'easeInOutCirc',
            loopDelay: 1000,
            loop: true
        });
    }
});
