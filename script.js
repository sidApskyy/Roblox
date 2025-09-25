// Form submission handling
document.addEventListener('DOMContentLoaded', function() {
    // Counter functionality
    const counterElement = document.getElementById('parentCounter');
    // Get counter from localStorage or start from 1047
    let counter = parseInt(localStorage.getItem('parentCounter')) || 1047;
    let isScrolledIntoView = false;
    let hasIncremented = false;
    
    // Initialize counter display
    if (counterElement) {
        counterElement.textContent = counter.toLocaleString();
    }

    // Function to create particle effect
    function createParticles() {
        const container = counterElement.parentElement;
        const particleCount = 10;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'counter-particle';
            particle.style.cssText = `
                position: absolute;
                width: 6px;
                height: 6px;
                background: linear-gradient(135deg, #ff6b6b, #ff8e53);
                border-radius: 50%;
                pointer-events: none;
                z-index: 100;
                left: 50%;
                top: 50%;
                opacity: 0;
            `;
            
            container.appendChild(particle);
            
            // Randomize particle position and animation
            const angle = Math.random() * Math.PI * 2;
            const distance = 30 + Math.random() * 40;
            const duration = 800 + Math.random() * 400;
            
            // Animate particle
            const animation = particle.animate([
                { 
                    transform: 'translate(-50%, -50%) scale(0)',
                    opacity: 0.8,
                    boxShadow: '0 0 10px 2px rgba(255, 107, 107, 0.7)'
                },
                { 
                    transform: `translate(
                        ${Math.cos(angle) * distance}px, 
                        ${Math.sin(angle) * distance - 20}px
                    ) scale(${0.2 + Math.random() * 0.8})`,
                    opacity: 0,
                    boxShadow: '0 0 2px 1px rgba(255, 107, 107, 0.3)'
                }
            ], {
                duration: duration,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
            });
            
            // Remove particle after animation
            animation.onfinish = () => particle.remove();
        }
    }

    // Function to update counter display with animation
    function updateCounter(value) {
        const oldValue = parseInt(counterElement.textContent.replace(/,/g, '')) || 0;
        const diff = value - oldValue;
        const duration = 800; // ms
        const startTime = performance.now();
        
        // Create particle effect
        createParticles();
        
        // Animate counter
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease-out function
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            // Calculate current value with easing
            const currentValue = Math.floor(oldValue + diff * easeOut);
            counterElement.textContent = currentValue.toLocaleString();
            
            // Add update class for CSS animation
            if (elapsed < duration) {
                counterElement.classList.add('counter-updated');
                requestAnimationFrame(animate);
            } else {
                counterElement.textContent = value.toLocaleString();
                setTimeout(() => {
                    counterElement.classList.remove('counter-updated');
                }, 300);
            }
        };
        
        requestAnimationFrame(animate);
    }

    // Auto-increment counter periodically
    const autoIncrement = setInterval(() => {
        if (isScrolledIntoView && !hasIncremented) {
            const increment = Math.floor(Math.random() * 3) + 1; // Random increment between 1-3
            counter += increment;
            updateCounter(counter);
            
            // Random interval between 5-15 seconds
            clearInterval(autoIncrement);
            setTimeout(() => {
                setInterval(() => {
                    if (isScrolledIntoView && !hasIncremented) {
                        const increment = Math.floor(Math.random() * 3) + 1;
                        counter += increment;
                        updateCounter(counter);
                    }
                }, 10000 + Math.random() * 20000); // 10-30 seconds
            }, 5000 + Math.random() * 10000); // 5-15 seconds initial delay
            
            hasIncremented = true;
        }
    }, 1000);

    // Check if counter is in viewport
    function checkIfInView() {
        const rect = counterElement.getBoundingClientRect();
        isScrolledIntoView = (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Check on scroll and resize
    window.addEventListener('scroll', checkIfInView);
    window.addEventListener('resize', checkIfInView);
    checkIfInView(); // Initial check

    // Form validation and submission handling
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        // Create success message element
        const successMessage = document.createElement('div');
        successMessage.className = 'form-success-message';
        successMessage.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>Form Submitted</span>
        `;
        successMessage.style.display = 'none';
        registrationForm.parentNode.insertBefore(successMessage, registrationForm.nextSibling);

        // Function to validate form
        function validateForm(form) {
            let isValid = true;
            const requiredFields = form.querySelectorAll('[required]');
            
            // Reset previous error states
            form.querySelectorAll('.form-group').forEach(group => {
                group.classList.remove('has-error');
                const errorEl = group.querySelector('.error');
                if (errorEl) errorEl.textContent = '';
            });
            
            // Check required fields
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    const formGroup = field.closest('.form-group');
                    if (formGroup) {
                        formGroup.classList.add('has-error');
                        const errorEl = formGroup.querySelector('.error') || document.createElement('span');
                        if (!errorEl.classList.contains('error')) {
                            errorEl.className = 'error';
                            formGroup.appendChild(errorEl);
                        }
                        errorEl.textContent = 'This field is required';
                    }
                }
            });
            
            // Validate email format
            const emailField = form.querySelector('input[type="email"]');
            if (emailField && emailField.value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(emailField.value)) {
                    isValid = false;
                    const formGroup = emailField.closest('.form-group');
                    if (formGroup) {
                        formGroup.classList.add('has-error');
                        const errorEl = formGroup.querySelector('.error') || document.createElement('span');
                        if (!errorEl.classList.contains('error')) {
                            errorEl.className = 'error';
                            formGroup.appendChild(errorEl);
                        }
                        errorEl.textContent = 'Please enter a valid email address';
                    }
                }
            }
            
            return isValid;
        }

        registrationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate form
            if (!validateForm(this)) {
                // Scroll to first error
                const firstError = this.querySelector('.has-error');
                if (firstError) {
                    firstError.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
                return;
            }
            
            // Form is valid, proceed with submission
            // Increment counter on form submission and save to localStorage
            const currentCounter = parseInt(localStorage.getItem('parentCounter')) || 1047;
            counter = Math.max(currentCounter + 1, counter);
            localStorage.setItem('parentCounter', counter);
            updateCounter(counter);
            
            // Hide form and show success message
            this.style.display = 'none';
            successMessage.style.display = 'flex';
            successMessage.classList.add('show');
            
            // Reset form
            this.reset();
            
            // Reset after some time
            setTimeout(() => {
                successMessage.classList.remove('show');
                setTimeout(() => {
                    this.style.display = 'block';
                    successMessage.style.display = 'none';
                }, 500);
            }, 5000);
        });
        
        // Add input event listeners to clear error state when user starts typing
        registrationForm.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('input', function() {
                const formGroup = this.closest('.form-group');
                if (formGroup) {
                    formGroup.classList.remove('has-error');
                    const errorEl = formGroup.querySelector('.error');
                    if (errorEl) errorEl.textContent = '';
                }
            });
        });
    }

    // Toggle expanded content
    const infoPanel = document.querySelector('.info-panel');
    const expandedContent = document.getElementById('expandedContent');
    const dropdownBtn = document.querySelector('.dropdown-btn');

    function toggleExpandedContent() {
        const isExpanding = !expandedContent.classList.contains('visible');
        expandedContent.classList.toggle('visible');
        
        // Update button text and aria attributes
        if (isExpanding) {
            dropdownBtn.textContent = 'Read Less';
            dropdownBtn.setAttribute('aria-expanded', 'true');
            // Smoothly scroll to show the expanded content
            expandedContent.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            dropdownBtn.textContent = 'Read More';
            dropdownBtn.setAttribute('aria-expanded', 'false');
        }
    }

    if (infoPanel && expandedContent && dropdownBtn) {
        // Initialize aria attributes
        dropdownBtn.setAttribute('aria-expanded', 'false');
        dropdownBtn.setAttribute('aria-controls', 'expandedContent');
        
        // Toggle on dropdown button click
        dropdownBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent triggering the panel click
            toggleExpandedContent();
        });
        
        // Toggle on panel click (except when clicking on links or buttons)
        infoPanel.addEventListener('click', function(e) {
            if (e.target.tagName !== 'A' && e.target !== dropdownBtn) {
                toggleExpandedContent();
            }
        });
        
        // Add keyboard navigation
        dropdownBtn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleExpandedContent();
            }
        });
    }

    // Add smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});
