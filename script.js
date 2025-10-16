// Form submission handling
document.addEventListener('DOMContentLoaded', function() {
    // Counter functionality
    const counterElement = document.getElementById('parentCounter');
    // Initialize counter and last update time
    let counter = parseInt(localStorage.getItem('parentCounter')) || 1075;
    let lastUpdateTime = parseInt(localStorage.getItem('lastUpdateTime')) || Date.now();
    let isScrolledIntoView = false;
    let hasIncremented = false;
    
    if (counterElement) {
        counterElement.textContent = counter.toLocaleString();
    }

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
            
            const angle = Math.random() * Math.PI * 2;
            const distance = 30 + Math.random() * 40;
            const duration = 800 + Math.random() * 400;
            
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
            
            animation.onfinish = () => particle.remove();
        }
    }

    function updateCounter(value) {
        const oldValue = parseInt(counterElement.textContent.replace(/,/g, '')) || 0;
        const diff = value - oldValue;
        const duration = 800;
        const startTime = performance.now();
        
        createParticles();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(oldValue + diff * easeOut);
            counterElement.textContent = currentValue.toLocaleString();
            
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

    // Function to update counter by 10 every hour
    function updateCounterByHour() {
        const now = Date.now();
        const hoursPassed = Math.floor((now - lastUpdateTime) / (60 * 60 * 1000));
        
        if (hoursPassed > 0) {
            const increment = hoursPassed * 10; // 10 per hour
            counter += increment;
            lastUpdateTime = now;
            localStorage.setItem('parentCounter', counter);
            localStorage.setItem('lastUpdateTime', lastUpdateTime);
            
            if (counterElement) {
                counterElement.textContent = counter.toLocaleString();
                createParticles();
            }
        }
        
        // Schedule next check in 1 hour
        setTimeout(updateCounterByHour, 60 * 60 * 1000);
    }
    
    // Start the hourly counter update
    updateCounterByHour();
    
    // Auto-increment counter periodically when in view
    const autoIncrement = setInterval(() => {
        if (isScrolledIntoView && !hasIncremented) {
            const increment = Math.floor(Math.random() * 3) + 1;
            counter += increment;
            updateCounter(counter);
            
            clearInterval(autoIncrement);
            setTimeout(() => {
                setInterval(() => {
                    if (isScrolledIntoView && !hasIncremented) {
                        const inc = Math.floor(Math.random() * 3) + 1;
                        counter += inc;
                        updateCounter(counter);
                    }
                }, 10000 + Math.random() * 20000);
            }, 5000 + Math.random() * 10000);
            
            hasIncremented = true;
        }
    }, 1000);

    function checkIfInView() {
        const rect = counterElement.getBoundingClientRect();
        isScrolledIntoView = (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    window.addEventListener('scroll', checkIfInView);
    window.addEventListener('resize', checkIfInView);
    checkIfInView();

    // Form validation and submission handling
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        const successMessage = document.createElement('div');
        successMessage.className = 'form-success-message';
        successMessage.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
                 viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>Form Submitted</span>
        `;
        successMessage.style.display = 'none';
        registrationForm.parentNode.insertBefore(successMessage, registrationForm.nextSibling);

        function validateForm(form) {
            let isValid = true;
            const requiredFields = form.querySelectorAll('[required]');
            
            form.querySelectorAll('.form-group').forEach(group => {
                group.classList.remove('has-error');
                const errorEl = group.querySelector('.error');
                if (errorEl) errorEl.textContent = '';
            });
            
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

        // ✅ UPDATED SUBMIT HANDLER
        registrationForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!validateForm(this)) {
                const firstError = this.querySelector('.has-error');
                if (firstError) {
                    firstError.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
                return;
            }
            
            const formData = {
                firstName: this.firstName.value.trim(),
                lastName: this.lastName.value.trim(),
                username: this.username.value.trim(),
                gender: this.gender.value,
                email: this.email.value.trim(),
                contactNumber: this.contactNumber.value.trim(),
                consent: this.consent.checked,
                termsAgree: this.termsAgree.checked
            };

            try {
                const response = await fetch('/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (result.success) {
                    const currentCounter = parseInt(localStorage.getItem('parentCounter')) || 1047;
                    counter = Math.max(currentCounter + 1, counter);
                    localStorage.setItem('parentCounter', counter);
                    updateCounter(counter);

                    this.style.display = 'none';
                    successMessage.style.display = 'flex';
                    successMessage.classList.add('show');

                    this.reset();

                    setTimeout(() => {
                        successMessage.classList.remove('show');
                        setTimeout(() => {
                            this.style.display = 'block';
                            successMessage.style.display = 'none';
                        }, 500);
                    }, 5000);
                } else {
                    alert(result.message || 'Form submission failed. Please try again.');
                }
            } catch (err) {
                console.error('Error submitting form:', err);
                alert('Something went wrong. Please try again later.');
            }
        });
        
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
        
        if (isExpanding) {
            dropdownBtn.textContent = 'Read Less';
            dropdownBtn.setAttribute('aria-expanded', 'true');
            expandedContent.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            dropdownBtn.textContent = 'Read More';
            dropdownBtn.setAttribute('aria-expanded', 'false');
        }
    }

    if (infoPanel && expandedContent && dropdownBtn) {
        dropdownBtn.setAttribute('aria-expanded', 'false');
        dropdownBtn.setAttribute('aria-controls', 'expandedContent');
        
        dropdownBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleExpandedContent();
        });
        
        infoPanel.addEventListener('click', function(e) {
            if (e.target.tagName !== 'A' && e.target !== dropdownBtn) {
                toggleExpandedContent();
            }
        });
        
        dropdownBtn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleExpandedContent();
            }
        });
    }

   // Smooth scroll for anchor links (only those that start with # and don't contain .html)
    document.querySelectorAll('a[href^="#"]:not([href*=".html"])').forEach(anchor => {
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
