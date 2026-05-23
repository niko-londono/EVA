document.addEventListener('DOMContentLoaded', () => {
    
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger, Observer);

    // Check if we are on the index page
    const isIndexPage = window.location.pathname.endsWith('index.html') || 
                        window.location.pathname.endsWith('/') || 
                        window.location.pathname.endsWith('/EVA/') ||
                        (!window.location.pathname.includes('.html'));

    /* ==========================================================================
       Custom Cursor
       ========================================================================== */
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    const links = document.querySelectorAll('a, .btn, .floating-img, .polaroid, .gallery-item');

    if (cursor && cursorFollower && window.matchMedia("(min-width: 768px)").matches) {
        let posX = 0, posY = 0;
        let mouseX = 0, mouseY = 0;

        gsap.to({}, 0.016, {
            repeat: -1,
            onRepeat: function() {
                posX += (mouseX - posX) / 9;
                posY += (mouseY - posY) / 9;
                
                gsap.set(cursorFollower, { css: { left: posX, top: posY } });
                gsap.set(cursor, { css: { left: mouseX, top: mouseY } });
            }
        });

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        links.forEach(link => {
            link.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            link.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });
    }

    // Hamburger Menu Logic
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        const navItems = navLinks.querySelectorAll('li a');
        navItems.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    /* ==========================================================================
       Mouse Parallax Effect for Slides
       ========================================================================== */
    const slides = document.querySelectorAll('.slide');

    slides.forEach(slide => {
        const layers = slide.querySelectorAll('.layer');

        slide.addEventListener('mousemove', (e) => {
            if (window.innerWidth < 768) return;

            const rect = slide.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
            const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);

            layers.forEach(layer => {
                const depth = parseFloat(layer.getAttribute('data-depth')) || 0.2;
                const moveX = x * depth * -40; 
                const moveY = y * depth * -40;

                gsap.to(layer, {
                    x: moveX,
                    y: moveY,
                    duration: 1.2,
                    ease: 'power2.out',
                    overwrite: 'auto'
                });
            });
        });

        slide.addEventListener('mouseleave', () => {
            layers.forEach(layer => {
                gsap.to(layer, {
                    x: 0,
                    y: 0,
                    duration: 1.5,
                    ease: 'power3.out',
                    overwrite: 'auto'
                });
            });
        });
    });

    /* ==========================================================================
       GSAP Observer - Slide Transitions
       ========================================================================== */
    let currentIndex = -1;
    let animating = false;

    gsap.set(slides, { zIndex: 1, autoAlpha: 0 });

    function updateDotNav(index) {
        const dots = document.querySelectorAll('.dot-nav .dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    function updateNavActive(index) {
        if (!isIndexPage) return; // Only update nav active status dynamically on index page
        const navItems = document.querySelectorAll('.nav-links li a');
        navItems.forEach((link, i) => {
            link.classList.toggle('active', i === index);
        });
    }

    /* ==========================================================================
       Film Credits Scroll Animation
       ========================================================================== */
    let creditsTween = null;
    const creditsWrapper = document.querySelector('.credits-wrapper');
    const creditsContainer = document.querySelector('.credits-container');

    function startCreditsAnimation() {
        if (!creditsWrapper || !creditsContainer) return;

        const containerHeight = creditsContainer.offsetHeight || 380;
        const wrapperHeight = creditsWrapper.offsetHeight;

        if (creditsTween) {
            creditsTween.kill();
        }

        // Set initial position at the bottom of the container
        gsap.set(creditsWrapper, { y: containerHeight });

        const totalDistance = wrapperHeight + containerHeight;
        
        // Speed: 35 pixels per second
        const duration = totalDistance / 35;

        creditsTween = gsap.to(creditsWrapper, {
            y: -wrapperHeight,
            duration: duration,
            ease: "none",
            repeat: -1
        });
    }

    function pauseCreditsAnimation() {
        if (creditsTween) {
            creditsTween.pause();
        }
    }

    function gotoSlide(index, direction) {
        if (animating) return;
        
        if (index < 0) index = 0;
        if (index >= slides.length) index = slides.length - 1;
        
        if (index === currentIndex) return;

        animating = true;
        const currentSlide = slides[currentIndex];
        const nextSlide = slides[index];

        const nextContent = nextSlide.querySelector('.slide-content');
        const nextPolaroids = nextSlide.querySelectorAll('.polaroid');

        gsap.set(nextSlide, { autoAlpha: 1, zIndex: 2 });

        gsap.fromTo(nextSlide, 
            { yPercent: direction === 1 ? 100 : -100 }, 
            { yPercent: 0, duration: 1.2, ease: "power3.inOut" }
        );

        if (currentSlide) {
            gsap.set(currentSlide, { zIndex: 1 });
            gsap.to(currentSlide, {
                yPercent: direction === 1 ? -50 : 50,
                autoAlpha: 0,
                duration: 1.2,
                ease: "power3.inOut",
                onComplete: () => {
                    gsap.set(currentSlide, { autoAlpha: 0 });
                }
            });
        }

        if (nextContent) {
            gsap.fromTo(nextContent, 
                { y: direction === 1 ? 80 : -80, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, delay: 0.5, ease: "power3.out" }
            );
        }
        
        // Animate polaroids
        nextPolaroids.forEach((polaroid, i) => {
            gsap.fromTo(polaroid, 
                { scale: 0.7, opacity: 0, rotation: 0 },
                { 
                    scale: 1, opacity: 1, 
                    rotation: polaroid.style.transform ? undefined : 0,
                    duration: 1, delay: 0.7 + (i * 0.15), 
                    ease: "expo.out" 
                }
            );
        });

        // Animate floating images
        const nextImg = nextSlide.querySelector('.floating-img');
        if (nextImg) {
            gsap.fromTo(nextImg, 
                { scale: 0.8, opacity: 0 },
                { scale: 1, opacity: 1, duration: 1.2, delay: 0.8, ease: "expo.out" }
            );
        }

        setTimeout(() => {
            animating = false;
        }, 1200);

        currentIndex = index;
        
        updateDotNav(currentIndex);
        updateNavActive(currentIndex);

        // Start credits scroll animation if transitioning to Slide 3 (Index 2)
        if (index === 2) {
            startCreditsAnimation();
        } else {
            pauseCreditsAnimation();
        }
    }

    // Observer
    Observer.create({
        type: "wheel,touch,pointer",
        wheelSpeed: -1,
        onDown: (self) => {
            if (animating) return;
            const grid = document.querySelector('.gallery-grid');
            if (grid && self.event && self.event.target) {
                if (grid.contains(self.event.target)) {
                    if (grid.scrollTop > 0) return;
                }
            }
            gotoSlide(currentIndex - 1, -1);
        },
        onUp: (self) => {
            if (animating) return;
            const grid = document.querySelector('.gallery-grid');
            if (grid && self.event && self.event.target) {
                if (grid.contains(self.event.target)) {
                    const maxScroll = grid.scrollHeight - grid.clientHeight;
                    if (grid.scrollTop < maxScroll - 5) return;
                }
            }
            gotoSlide(currentIndex + 1, 1);
        },
        tolerance: 10,
        preventDefault: false
    });

    // Prevent body/overscroll bounce on touch/wheel unless inside scrollable element (.gallery-grid)
    const preventDefaultScroll = (e) => {
        if (e.target.closest('.gallery-grid')) {
            return;
        }
        if (e.cancelable) {
            e.preventDefault();
        }
    };

    window.addEventListener('wheel', preventDefaultScroll, { passive: false });
    window.addEventListener('touchmove', preventDefaultScroll, { passive: false });

    // Start with correct slide
    let startIdx = 0;
    if (window.location.hash) {
        const match = window.location.hash.match(/#slide-(\d+)/);
        if (match) {
            startIdx = parseInt(match[1]) - 1;
            if (startIdx < 0) startIdx = 0;
            if (startIdx >= slides.length) startIdx = slides.length - 1;
        }
    }
    gotoSlide(startIdx, 1);

    // Dot Navigation Clicks
    document.querySelectorAll('.dot-nav .dot').forEach((dot) => {
        dot.addEventListener('click', () => {
            const targetIdx = parseInt(dot.getAttribute('data-slide'));
            if (targetIdx !== currentIndex && !animating) {
                const direction = targetIdx > currentIndex ? 1 : -1;
                gotoSlide(targetIdx, direction);
            }
        });
    });

    // Handle Navigation Clicks
    document.querySelectorAll('.nav-links li a').forEach((link, idx) => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            if (!href || href === 'javascript:history.back()') return;

            if (isIndexPage && (href.startsWith('#') || href.includes('index.html#'))) {
                e.preventDefault();
                let targetIdx = idx;
                const match = href.match(/#slide-(\d+)/);
                if (match) {
                    targetIdx = parseInt(match[1]) - 1;
                }

                if(targetIdx !== currentIndex && !animating && targetIdx < slides.length) {
                    const direction = targetIdx > currentIndex ? 1 : -1;
                    gotoSlide(targetIdx, direction);
                }
            }
        });
    });

});
