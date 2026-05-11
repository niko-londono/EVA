document.addEventListener('DOMContentLoaded', () => {
    
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger, Observer);

    /* ==========================================================================
       Custom Cursor
       ========================================================================== */
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    const links = document.querySelectorAll('a, .btn, .floating-img');

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

        // Close menu when a link is clicked
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
                const moveX = x * depth * -50; 
                const moveY = y * depth * -50;

                gsap.to(layer, {
                    x: moveX,
                    y: moveY,
                    duration: 1,
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
       GSAP Observer - Super Smooth Slide Transitions
       ========================================================================== */
    let currentIndex = -1;
    let animating = false;

    // Initial setup: hide all slides
    gsap.set(slides, { zIndex: 1, autoAlpha: 0 });

    function gotoSlide(index, direction) {
        if (animating) return;
        
        // Handle wrapping
        if (index < 0) index = 0; // Or wrap: index = slides.length - 1;
        if (index >= slides.length) index = slides.length - 1; // Or wrap: index = 0;
        
        if (index === currentIndex) return;

        animating = true;
        const currentSlide = slides[currentIndex];
        const nextSlide = slides[index];

        const nextContent = nextSlide.querySelector('.slide-content');
        const nextImg = nextSlide.querySelector('.floating-img');

        gsap.set(nextSlide, { autoAlpha: 1, zIndex: 2 });
        
        // Determine start positions based on direction (1 = down, -1 = up)
        const yStart = direction === 1 ? '100%' : '-100%';
        const yEnd = direction === 1 ? '-100%' : '100%';

        gsap.fromTo(nextSlide, 
            { yPercent: direction === 1 ? 100 : -100 }, 
            { yPercent: 0, duration: 1.2, ease: "power3.inOut" }
        );

        if (currentSlide) {
            gsap.set(currentSlide, { zIndex: 1 });
            gsap.to(currentSlide, {
                yPercent: direction === 1 ? -50 : 50, // Parallax out effect
                autoAlpha: 0,
                duration: 1.2,
                ease: "power3.inOut",
                onComplete: () => {
                    gsap.set(currentSlide, { autoAlpha: 0 });
                }
            });
        }

        // Internal Slide Element Animations
        if (nextContent) {
            gsap.fromTo(nextContent, 
                { y: direction === 1 ? 100 : -100, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, delay: 0.6, ease: "power3.out" }
            );
        }
        
        if (nextImg) {
            gsap.fromTo(nextImg, 
                { scale: 0.8, opacity: 0 },
                { scale: 1, opacity: 1, duration: 1.2, delay: 0.8, ease: "expo.out" }
            );
        }

        // Finish transition
        setTimeout(() => {
            animating = false;
        }, 1200);

        currentIndex = index;
        
        // Update nav links
        document.querySelectorAll('.nav-links li a').forEach((link, idx) => {
            link.style.opacity = idx === currentIndex ? '1' : '0.5';
        });
    }

    // Initialize Observer to listen for wheel/touch/drag events
    Observer.create({
        type: "wheel,touch,pointer",
        wheelSpeed: -1,
        onDown: () => !animating && gotoSlide(currentIndex - 1, -1),
        onUp: () => !animating && gotoSlide(currentIndex + 1, 1),
        tolerance: 10,
        preventDefault: true,
        ignore: ".gallery-grid, .gallery-grid *"
    });

    // Start with slide 0
    gotoSlide(0, 1);
    
    // Handle Navigation Clicks
    document.querySelectorAll('.nav-links li a').forEach((link, idx) => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            if (!href || href === 'javascript:history.back()') return;

            const isIndexPage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/EVA/');

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
