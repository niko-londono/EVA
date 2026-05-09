document.addEventListener('DOMContentLoaded', () => {
    
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);

    /* ==========================================================================
       Custom Cursor
       ========================================================================== */
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    const links = document.querySelectorAll('a, .btn, .gallery-item');

    if (cursor && cursorFollower && window.matchMedia("(min-width: 768px)").matches) {
        let posX = 0, posY = 0;
        let mouseX = 0, mouseY = 0;

        // Animate follower to lag behind cursor
        gsap.to({}, 0.016, {
            repeat: -1,
            onRepeat: function() {
                posX += (mouseX - posX) / 9;
                posY += (mouseY - posY) / 9;
                
                gsap.set(cursorFollower, {
                    css: {
                        left: posX,
                        top: posY
                    }
                });
                gsap.set(cursor, {
                    css: {
                        left: mouseX,
                        top: mouseY
                    }
                });
            }
        });

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Hover effect for links
        links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                document.body.classList.add('cursor-hover');
            });
            link.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-hover');
            });
        });
    }

    /* ==========================================================================
       Navbar Scroll Effect
       ========================================================================== */
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    /* ==========================================================================
       Parallax Hero Animation
       ========================================================================== */
    // Create parallax effect on scroll for hero layers
    const parallaxLayers = document.querySelectorAll('.parallax-layer');
    
    parallaxLayers.forEach(layer => {
        const speed = parseFloat(layer.getAttribute('data-speed'));
        
        gsap.to(layer, {
            y: (i, target) => -ScrollTrigger.maxScroll(window) * target.dataset.speed,
            ease: "none",
            scrollTrigger: {
                trigger: ".hero",
                start: "top top",
                end: "bottom top",
                scrub: 1, // Smooth scrubbing
            }
        });
    });

    // Hero content subtle fade and slide up
    gsap.to('.hero-content', {
        y: 100,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: true
        }
    });

    /* ==========================================================================
       Reveal Animations on Scroll
       ========================================================================== */
    // Reveal Up
    const revealUpElements = document.querySelectorAll('.reveal-up');
    revealUpElements.forEach(el => {
        gsap.to(el, {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: el,
                start: "top 85%", // Trigger when top of element hits 85% of viewport
                toggleActions: "play none none reverse"
            }
        });
    });

    // Reveal Left (Image)
    gsap.to('.reveal-left', {
        x: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
            trigger: ".about-section",
            start: "top 75%",
        }
    });

    // Reveal Right (Content)
    gsap.to('.reveal-right', {
        x: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
            trigger: ".about-section",
            start: "top 75%",
        }
    });
});
