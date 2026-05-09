document.addEventListener('DOMContentLoaded', () => {
    
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);

    /* ==========================================================================
       Custom Cursor
       ========================================================================== */
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    const links = document.querySelectorAll('a, .btn, .floating-img');

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
                    css: { left: posX, top: posY }
                });
                gsap.set(cursor, {
                    css: { left: mouseX, top: mouseY }
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
       Mouse Parallax Effect for Slides
       ========================================================================== */
    const slides = document.querySelectorAll('.slide');

    slides.forEach(slide => {
        const layers = slide.querySelectorAll('.layer');

        slide.addEventListener('mousemove', (e) => {
            if (window.innerWidth < 768) return; // Disable on mobile

            const rect = slide.getBoundingClientRect();
            // Calculate mouse position relative to the center of the slide (-1 to 1)
            const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
            const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);

            layers.forEach(layer => {
                const depth = parseFloat(layer.getAttribute('data-depth')) || 0.2;
                
                // Foreground moves more, background moves less, and in opposite directions
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

        // Reset layers when mouse leaves the slide
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
       Scroll Slide Reveal Animations
       ========================================================================== */
    // Instead of traditional scrolling, we animate elements in when the slide snaps into view
    
    slides.forEach((slide, index) => {
        const content = slide.querySelector('.slide-content');
        const img = slide.querySelector('.floating-img');
        
        // Initial state
        if (content) gsap.set(content, { y: 50, opacity: 0 });
        if (img) gsap.set(img, { scale: 0.8, opacity: 0 });

        ScrollTrigger.create({
            trigger: slide,
            scroller: ".slider-container", // We are scrolling the container, not the window
            start: "top 50%", // Trigger when slide reaches middle of viewport
            onEnter: () => animateSlideIn(content, img),
            onEnterBack: () => animateSlideIn(content, img),
            onLeave: () => animateSlideOut(content, img),
            onLeaveBack: () => animateSlideOut(content, img)
        });
    });

    function animateSlideIn(content, img) {
        if (content) {
            gsap.to(content, { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.2 });
        }
        if (img) {
            gsap.to(img, { scale: 1, opacity: 1, duration: 1.5, ease: 'expo.out', delay: 0.4 });
        }
    }

    function animateSlideOut(content, img) {
        if (content) {
            gsap.to(content, { y: -50, opacity: 0, duration: 0.5, ease: 'power2.in' });
        }
        if (img) {
            gsap.to(img, { scale: 1.1, opacity: 0, duration: 0.5, ease: 'power2.in' });
        }
    }

    // Trigger the first slide animation manually on load
    const firstSlideContent = slides[0].querySelector('.slide-content');
    const firstSlideImg = slides[0].querySelector('.floating-img');
    setTimeout(() => {
        animateSlideIn(firstSlideContent, firstSlideImg);
    }, 100);

});
