/**
 * CREATE: UNCHARTED - Main JavaScript
 * ===================================
 */

(function() {
    'use strict';

    // ============================================
    // DOM Elements Cache
    // ============================================
    const elements = {
        html: document.documentElement,
        body: document.body,
        navbar: document.getElementById('navbar'),
        mobileMenuBtn: document.getElementById('mobile-menu-btn'),
        mobileMenuIconOpen: document.getElementById('mobile-menu-icon-open'),
        mobileMenuIconClose: document.getElementById('mobile-menu-icon-close'),
        mobileMenu: document.getElementById('mobile-menu'),
        mobileMenuOverlay: document.getElementById('mobile-menu-overlay'),
        langSwitcher: document.getElementById('lang-switcher'),
        langSwitcherMobile: document.getElementById('lang-switcher-mobile'),
        backToTop: document.getElementById('back-to-top'),
        downloadModal: document.getElementById('download-modal'),
        worldScreenshot: document.getElementById('world-screenshot'),
        screenshotFallback: document.getElementById('screenshot-fallback'),
        downloadModlist: document.getElementById('download-modlist')
    };

    // ============================================
    // Application State
    // ============================================
    const state = {
        currentLang: localStorage.getItem('preferred-lang') || 'ru',
        menuOpen: false,
        modalOpen: false
    };

    // ============================================
    // Language System
    // ============================================
    const LanguageSystem = {
        init() {
            this.setLanguage(state.currentLang);
            this.bindEvents();
        },

        bindEvents() {
            elements.langSwitcher?.addEventListener('click', () => this.toggle());
            elements.langSwitcherMobile?.addEventListener('click', () => this.toggle());
        },

        toggle() {
            this.setLanguage(state.currentLang === 'ru' ? 'en' : 'ru');
        },

        setLanguage(lang) {
            state.currentLang = lang;
            localStorage.setItem('preferred-lang', lang);
            elements.html.setAttribute('lang', lang);

            // Update page title
            document.title = lang === 'ru'
                ? 'Create: Uncharted — Сюжетная сборка Minecraft'
                : 'Create: Uncharted — Story-driven Minecraft Modpack';

            // Toggle visibility of language-specific elements
            document.querySelectorAll('[data-lang]').forEach(el => {
                el.classList.toggle('hidden', el.getAttribute('data-lang') !== lang);
            });

            this.updateSwitcherUI();

            // Update screenshot alt text
            if (elements.worldScreenshot) {
                elements.worldScreenshot.alt = lang === 'ru'
                    ? 'Скриншот мира Create: Uncharted'
                    : 'Create: Uncharted world screenshot';
            }
        },

        updateSwitcherUI() {
            const updateSwitcher = (switcher) => {
                if (!switcher) return;
                const spans = switcher.querySelectorAll('span');
                if (spans.length < 3) return;

                const ruSpan = spans[0];
                const enSpan = spans[2];

                if (state.currentLang === 'ru') {
                    ruSpan.classList.add('text-accent-cyan');
                    ruSpan.classList.remove('text-text-muted');
                    enSpan.classList.remove('text-accent-cyan');
                    enSpan.classList.add('text-text-muted');
                } else {
                    enSpan.classList.add('text-accent-cyan');
                    enSpan.classList.remove('text-text-muted');
                    ruSpan.classList.remove('text-accent-cyan');
                    ruSpan.classList.add('text-text-muted');
                }
            };

            updateSwitcher(elements.langSwitcher);
            updateSwitcher(elements.langSwitcherMobile);
        }
    };

    // ============================================
    // Mobile Menu
    // ============================================
    const MobileMenu = {
        init() {
            this.bindEvents();
        },

        bindEvents() {
            elements.mobileMenuBtn?.addEventListener('click', () => this.toggle());
            elements.mobileMenuOverlay?.addEventListener('click', () => this.close());

            // Close menu when clicking on nav links
            document.querySelectorAll('.mobile-nav-link').forEach(link => {
                link.addEventListener('click', () => this.close());
            });
        },

        toggle() {
            state.menuOpen ? this.close() : this.open();
        },

        open() {
            state.menuOpen = true;
            elements.mobileMenu?.classList.remove('hidden');
            elements.mobileMenu?.classList.add('active');
            elements.mobileMenuOverlay?.classList.remove('hidden');
            elements.body.classList.add('menu-open');
            elements.mobileMenuBtn?.setAttribute('aria-expanded', 'true');
            elements.mobileMenuBtn?.setAttribute('aria-label', 'Закрыть меню');
            
            // Toggle icons
            elements.mobileMenuIconOpen?.classList.add('hidden');
            elements.mobileMenuIconClose?.classList.remove('hidden');
        },

        close() {
            state.menuOpen = false;
            elements.mobileMenu?.classList.add('hidden');
            elements.mobileMenu?.classList.remove('active');
            elements.mobileMenuOverlay?.classList.add('hidden');
            elements.body.classList.remove('menu-open');
            elements.mobileMenuBtn?.setAttribute('aria-expanded', 'false');
            elements.mobileMenuBtn?.setAttribute('aria-label', 'Открыть меню');
            
            // Toggle icons
            elements.mobileMenuIconOpen?.classList.remove('hidden');
            elements.mobileMenuIconClose?.classList.add('hidden');
        }
    };

    // ============================================
    // Navigation & Active Section Detection
    // ============================================
    const Navigation = {
        sections: [],
        navLinks: [],
        mobileNavLinks: [],

        init() {
            this.sections = Array.from(document.querySelectorAll('section[id]'));
            this.navLinks = Array.from(document.querySelectorAll('.nav-link[data-section]'));
            this.mobileNavLinks = Array.from(document.querySelectorAll('.mobile-nav-link[data-section]'));

            this.bindEvents();
            this.updateActiveSection();
        },

        bindEvents() {
            // Smooth scroll for anchor links
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => this.handleClick(e, anchor));
            });

            // Update active section on scroll
            let ticking = false;
            window.addEventListener('scroll', () => {
                if (ticking) return;
                ticking = true;
                window.requestAnimationFrame(() => {
                    this.updateActiveSection();
                    ticking = false;
                });
            }, { passive: true });
        },

        handleClick(e, anchor) {
            const href = anchor.getAttribute('href');
            if (!href || href === '#') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();
            const navbarHeight = elements.navbar?.offsetHeight || 80;
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight;

            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        },

        updateActiveSection() {
            const scrollPosition = window.scrollY + 120;
            let currentSection = '';

            for (const section of this.sections) {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    currentSection = section.id;
                    break;
                }
            }

            const updateLinks = (links) => {
                links.forEach(link => {
                    const isActive = link.getAttribute('data-section') === currentSection;
                    link.classList.toggle('active', isActive);
                });
            };

            updateLinks(this.navLinks);
            updateLinks(this.mobileNavLinks);
        }
    };

    // ============================================
    // Back to Top Button
    // ============================================
    const BackToTop = {
        init() {
            elements.backToTop?.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });

            let ticking = false;
            window.addEventListener('scroll', () => {
                if (ticking) return;
                ticking = true;
                window.requestAnimationFrame(() => {
                    this.checkVisibility();
                    ticking = false;
                });
            }, { passive: true });

            this.checkVisibility();
        },

        checkVisibility() {
            if (!elements.backToTop) return;
            elements.backToTop.classList.toggle('visible', window.scrollY > 300);
        }
    };

    // ============================================
    // Download Modal
    // ============================================
    const DownloadModal = {
        init() {
            // Bind download buttons to open modal
            document.querySelectorAll('[data-download]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.open();
                });
            });

            // Close modal handlers
            elements.downloadModal?.querySelectorAll('.modal-close, .modal-close-btn').forEach(btn => {
                btn.addEventListener('click', () => this.close());
            });

            elements.downloadModal?.querySelector('.modal-overlay')?.addEventListener('click', () => this.close());

            // Keyboard handling
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    if (state.modalOpen) this.close();
                    if (state.menuOpen) MobileMenu.close();
                }
            });
        },

        open() {
            if (!elements.downloadModal) return;
            state.modalOpen = true;
            elements.downloadModal.classList.add('active');
            elements.body.style.overflow = 'hidden';

            // Focus first focusable element
            const focusableElements = elements.downloadModal.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])');
            focusableElements[0]?.focus();
        },

        close() {
            if (!elements.downloadModal) return;
            state.modalOpen = false;
            elements.downloadModal.classList.remove('active');
            elements.body.style.overflow = '';
        }
    };

    // ============================================
    // Screenshot Loader with Fallback
    // ============================================
    const ScreenshotLoader = {
        paths: [
            'assets/world-screenshot.jpg',
            'assets/world-screenshot.png',
            'assets/world-screenshot.webp',
            'assets/screenshot.jpg',
            'assets/screenshot.png'
        ],
        currentIndex: 0,

        init() {
            if (!elements.worldScreenshot) return;

            elements.worldScreenshot.addEventListener('error', () => this.tryNextPath());
            elements.worldScreenshot.addEventListener('load', () => this.onLoadSuccess());

            // Check if image already failed
            if (elements.worldScreenshot.complete && elements.worldScreenshot.naturalHeight === 0) {
                this.tryNextPath();
            }
        },

        tryNextPath() {
            if (this.currentIndex < this.paths.length) {
                elements.worldScreenshot.src = this.paths[this.currentIndex++];
            } else {
                this.showFallback();
            }
        },

        onLoadSuccess() {
            elements.worldScreenshot.classList.remove('hidden');
            elements.screenshotFallback?.classList.add('hidden');
        },

        showFallback() {
            elements.worldScreenshot.classList.add('hidden');
            elements.screenshotFallback?.classList.remove('hidden');
        }
    };

    // ============================================
    // Mod List Download
    // ============================================
    const ModListDownload = {
        init() {
            elements.downloadModlist?.addEventListener('click', () => this.download());
        },

        download() {
            const link = document.createElement('a');
            link.href = 'assets/mod-list.txt';
            link.download = 'mod-list.txt';

            // Check if file exists before downloading
            fetch(link.href, { method: 'HEAD' })
                .then(response => {
                    if (response.ok) {
                        link.click();
                    } else {
                        DownloadModal.open();
                    }
                })
                .catch(() => {
                    DownloadModal.open();
                });
        }
    };

    // ============================================
    // Navbar Background Effect
    // ============================================
    const NavbarEffect = {
        init() {
            let ticking = false;
            window.addEventListener('scroll', () => {
                if (ticking) return;
                ticking = true;
                window.requestAnimationFrame(() => {
                    this.update();
                    ticking = false;
                });
            }, { passive: true });

            this.update();
        },

        update() {
            if (!elements.navbar) return;
            elements.navbar.style.background = window.scrollY > 50
                ? 'rgba(7, 5, 20, 0.95)'
                : 'rgba(11, 10, 30, 0.8)';
        }
    };

    // ============================================
    // Particles Background
    // ============================================
    const ParticlesBackground = {
        init() {
            const container = document.getElementById('particles-container');
            if (!container) return;

            const particleCount = 30;

            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';

                const delay = Math.random() * 20;
                const duration = 15 + Math.random() * 20;
                particle.style.animationDelay = `-${delay}s`;
                particle.style.animationDuration = `${duration}s`;

                const size = 1 + Math.random() * 3;
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;

                container.appendChild(particle);
            }
        }
    };

    // ============================================
    // Initialize Application
    // ============================================
    function init() {
        LanguageSystem.init();
        MobileMenu.init();
        Navigation.init();
        BackToTop.init();
        DownloadModal.init();
        ScreenshotLoader.init();
        ModListDownload.init();
        NavbarEffect.init();
        ParticlesBackground.init();
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
