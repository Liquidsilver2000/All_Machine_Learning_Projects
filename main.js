// TradeFlow - Global Import & Export Solutions
// Main JavaScript with Scroll Animations and Interactive Features

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initTypewriter();
    initScrollAnimations();
    initNavigation();
    initTestimonialCarousel();
    initParticleSystem();
    init3DCardEffects();
    initParallaxEffects();
    initFormValidation();
    initSmoothScrolling();
    
    console.log('TradeFlow website initialized successfully');
});

// Typewriter Effect for Hero Section
function initTypewriter() {
    const typed = new Typed('#typed-text', {
        strings: [
            'Global Import & Export Solutions',
            'Containerized Trade Excellence',
            'International Logistics Leaders',
            'Supply Chain Innovation'
        ],
        typeSpeed: 60,
        backSpeed: 40,
        backDelay: 2000,
        startDelay: 500,
        loop: true,
        showCursor: true,
        cursorChar: '|',
        autoInsertCss: true
    });
}

// Scroll-Driven Animations
function initScrollAnimations() {
    // Intersection Observer for reveal animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                
                // Animate element upward
                anime({
                    targets: element,
                    opacity: [0, 1],
                    translateY: [30, 0],
                    duration: 800,
                    easing: 'cubicBezier(0.4, 0, 0.2, 1)',
                    delay: anime.stagger(100)
                });
                
                // Remove observer after animation
                observer.unobserve(element);
            }
        });
    }, observerOptions);

    // Observe all reveal elements
    document.querySelectorAll('.reveal-up').forEach(el => {
        observer.observe(el);
    });

    // Service cards stagger animation
    const serviceCards = document.querySelectorAll('.card-3d');
    serviceCards.forEach((card, index) => {
        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    anime({
                        targets: entry.target,
                        opacity: [0, 1],
                        translateY: [50, 0],
                        scale: [0.9, 1],
                        duration: 600,
                        delay: index * 100,
                        easing: 'cubicBezier(0.4, 0, 0.2, 1)'
                    });
                    cardObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        
        cardObserver.observe(card);
    });
}

// Navigation Interactions
function initNavigation() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const nav = document.querySelector('nav');
    
    // Mobile menu toggle
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        
        // Animate menu items
        if (!mobileMenu.classList.contains('hidden')) {
            const menuItems = mobileMenu.querySelectorAll('a, button');
            anime({
                targets: menuItems,
                opacity: [0, 1],
                translateX: [-20, 0],
                duration: 300,
                delay: anime.stagger(50),
                easing: 'easeOutQuart'
            });
        }
    });
    
    // Navigation background on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            nav.classList.add('shadow-lg');
        } else {
            nav.classList.remove('shadow-lg');
        }
    });
    
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Testimonial Carousel
function initTestimonialCarousel() {
    const carousel = new Splide('#testimonial-carousel', {
        type: 'loop',
        perPage: 1,
        perMove: 1,
        gap: '2rem',
        autoplay: true,
        interval: 5000,
        pauseOnHover: true,
        arrows: false,
        pagination: true,
        classes: {
            pagination: 'splide__pagination custom-pagination',
            page: 'splide__pagination__page custom-page'
        }
    });
    
    carousel.mount();
    
    // Custom pagination styling
    const pagination = document.querySelector('.custom-pagination');
    if (pagination) {
        pagination.style.bottom = '-3rem';
        
        const pages = document.querySelectorAll('.custom-page');
        pages.forEach(page => {
            page.style.backgroundColor = '#e5e7eb';
            page.style.width = '12px';
            page.style.height = '12px';
            page.style.margin = '0 6px';
            page.style.transition = 'all 0.3s ease';
            
            page.addEventListener('mouseenter', () => {
                page.style.backgroundColor = '#2563eb';
                page.style.transform = 'scale(1.2)';
            });
            
            page.addEventListener('mouseleave', () => {
                if (!page.classList.contains('is-active')) {
                    page.style.backgroundColor = '#e5e7eb';
                    page.style.transform = 'scale(1)';
                }
            });
        });
        
        // Active page styling
        const activePage = document.querySelector('.custom-page.is-active');
        if (activePage) {
            activePage.style.backgroundColor = '#2563eb';
            activePage.style.transform = 'scale(1.2)';
        }
    }
}

// Particle System for Hero Section
function initParticleSystem() {
    const container = document.getElementById('particles-container');
    if (!container) return;
    
    // Create particles
    for (let i = 0; i < 50; i++) {
        createParticle(container);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'absolute w-1 h-1 bg-white rounded-full opacity-30';
    
    // Random position
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    
    container.appendChild(particle);
    
    // Animate particle
    anime({
        targets: particle,
        translateY: [0, -100],
        translateX: [0, Math.random() * 100 - 50],
        opacity: [0.3, 0],
        scale: [1, 0],
        duration: anime.random(3000, 6000),
        delay: anime.random(0, 3000),
        loop: true,
        easing: 'linear'
    });
}

// 3D Card Hover Effects
function init3DCardEffects() {
    const cards = document.querySelectorAll('.card-3d');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            anime({
                targets: card,
                rotateX: -5,
                rotateY: 5,
                translateY: -8,
                scale: 1.02,
                duration: 300,
                easing: 'cubicBezier(0.4, 0, 0.2, 1)'
            });
        });
        
        card.addEventListener('mouseleave', () => {
            anime({
                targets: card,
                rotateX: 0,
                rotateY: 0,
                translateY: 0,
                scale: 1,
                duration: 300,
                easing: 'cubicBezier(0.4, 0, 0.2, 1)'
            });
        });
        
        // Mouse move effect for subtle 3D rotation
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / centerY * -5;
            const rotateY = (x - centerX) / centerX * 5;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
        });
    });
}

// Parallax Effects
function initParallaxEffects() {
    const parallaxElements = document.querySelectorAll('.parallax-bg');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        parallaxElements.forEach(element => {
            element.style.transform = `translateY(${rate}px)`;
        });
    });
}

// Form Validation (for future contact forms)
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearValidationError);
        });
        
        form.addEventListener('submit', handleFormSubmit);
    });
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    }
    
    // Phone validation
    if (field.type === 'tel' && value) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number';
        }
    }
    
    showValidationResult(field, isValid, errorMessage);
}

function showValidationResult(field, isValid, errorMessage) {
    const errorElement = field.parentNode.querySelector('.error-message');
    
    if (isValid) {
        field.classList.remove('border-red-500');
        field.classList.add('border-green-500');
        if (errorElement) {
            errorElement.remove();
        }
    } else {
        field.classList.remove('border-green-500');
        field.classList.add('border-red-500');
        
        if (!errorElement) {
            const error = document.createElement('div');
            error.className = 'error-message text-red-500 text-sm mt-1';
            error.textContent = errorMessage;
            field.parentNode.appendChild(error);
        } else {
            errorElement.textContent = errorMessage;
        }
    }
}

function clearValidationError(e) {
    const field = e.target;
    field.classList.remove('border-red-500', 'border-green-500');
    const errorElement = field.parentNode.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const inputs = form.querySelectorAll('input, textarea, select');
    let isFormValid = true;
    
    // Validate all fields
    inputs.forEach(input => {
        const event = new Event('blur');
        input.dispatchEvent(event);
        
        if (input.classList.contains('border-red-500')) {
            isFormValid = false;
        }
    });
    
    if (isFormValid) {
        // Show success message
        showNotification('Form submitted successfully! We\'ll get back to you soon.', 'success');
        form.reset();
    } else {
        showNotification('Please correct the errors above.', 'error');
    }
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform translate-x-full transition-transform duration-300`;
    
    // Set color based on type
    switch (type) {
        case 'success':
            notification.classList.add('bg-green-500', 'text-white');
            break;
        case 'error':
            notification.classList.add('bg-red-500', 'text-white');
            break;
        case 'warning':
            notification.classList.add('bg-yellow-500', 'text-white');
            break;
        default:
            notification.classList.add('bg-blue-500', 'text-white');
    }
    
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <span>${message}</span>
            <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

// Smooth Scrolling
function initSmoothScrolling() {
    // Add smooth scroll behavior to all internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for fixed nav
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Button Interactions
document.addEventListener('click', function(e) {
    // Handle CTA buttons
    if (e.target.matches('button') || e.target.closest('button')) {
        const button = e.target.matches('button') ? e.target : e.target.closest('button');
        const buttonText = button.textContent.trim();
        
        // Add click animation
        anime({
            targets: button,
            scale: [1, 0.95, 1],
            duration: 200,
            easing: 'easeInOutQuad'
        });
        
        // Handle specific button actions
        if (buttonText.includes('Get Started') || buttonText.includes('Sign Up')) {
            showNotification('Redirecting to registration page...', 'info');
            // In a real application, this would redirect to a registration form
        } else if (buttonText.includes('Contact') || buttonText.includes('Consultation')) {
            showNotification('Opening contact form...', 'info');
            // In a real application, this would open a contact modal or redirect
        } else if (buttonText.includes('Learn More')) {
            showNotification('Loading service details...', 'info');
            // In a real application, this would navigate to service pages
        } else if (buttonText.includes('Get Quote')) {
            showNotification('Quote request form opening...', 'info');
            // In a real application, this would open a quote request form
        }
    }
});

// Performance Optimization
function optimizePerformance() {
    // Lazy load images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
    
    // Debounce scroll events
    let ticking = false;
    function updateScrollEffects() {
        // Update parallax and scroll-based effects
        ticking = false;
    }
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateScrollEffects);
            ticking = true;
        }
    });
}

// Initialize performance optimizations
optimizePerformance();

// Accessibility Enhancements
function enhanceAccessibility() {
    // Add keyboard navigation support
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });
    
    document.addEventListener('mousedown', function() {
        document.body.classList.remove('keyboard-navigation');
    });
    
    // Add focus indicators for keyboard navigation
    const style = document.createElement('style');
    style.textContent = `
        .keyboard-navigation *:focus {
            outline: 2px solid #2563eb !important;
            outline-offset: 2px;
        }
    `;
    document.head.appendChild(style);
}

// Initialize accessibility features
enhanceAccessibility();

// Error Handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    // In production, you might want to send this to an error tracking service
});

// Resize Handler
window.addEventListener('resize', function() {
    // Recalculate animations and layouts on resize
    anime.remove('.card-3d');
    init3DCardEffects();
});

// Page Visibility API for performance
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Pause animations when page is not visible
        anime.running.forEach(animation => animation.pause());
    } else {
        // Resume animations when page becomes visible
        anime.running.forEach(animation => animation.play());
    }
});

console.log('TradeFlow main.js loaded successfully');