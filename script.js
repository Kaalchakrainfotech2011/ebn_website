/* ============================================================
   EBN – ELITE BUSINESS NETWORK
   JavaScript – Interactions, Animations, Form
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─── 1. NAVBAR SCROLL EFFECT ──────────────────────────── */
  const navbar = document.getElementById('mainNav');
  const onScroll = () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ─── 2. BACK TO TOP BUTTON ─────────────────────────────── */
  const btt = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) btt.classList.add('visible');
    else btt.classList.remove('visible');
  }, { passive: true });
  btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ─── 3. SIMPLE AOS (Animate On Scroll) ────────────────── */
  const aosEls = document.querySelectorAll('[data-aos]');
  const aosObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.aosDelay || 0;
        setTimeout(() => {
          entry.target.classList.add('aos-animate');
        }, parseInt(delay));
        aosObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  aosEls.forEach(el => aosObserver.observe(el));

  /* ─── 4. COUNTER ANIMATION ──────────────────────────────── */
  const counterEls = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counterEls.forEach(el => counterObserver.observe(el));

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1800;
    const step = 16;
    const increment = target / (duration / step);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        clearInterval(timer);
        el.textContent = target;
      } else {
        el.textContent = Math.floor(current);
      }
    }, step);
  }

  /* ─── 5. SMOOTH SCROLL FOR NAV LINKS ───────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        // Close mobile nav if open (and compute navbar height excluding expanded mobile menu)
        const collapse = document.getElementById('navMenu');
        const isMobileMenuOpen = collapse && collapse.classList.contains('show');
        const navHeight = isMobileMenuOpen
          ? navbar.offsetHeight - collapse.offsetHeight
          : navbar.offsetHeight;

        // Dynamically compute padding-top to keep the spacing below the navbar perfectly balanced
        const computedStyle = window.getComputedStyle(target);
        const paddingTop = parseFloat(computedStyle.paddingTop) || 0;

        // Visual margin below navbar bottom
        const desiredSpacing = window.innerWidth < 768 ? 28 : 40;

        const offset = navHeight + desiredSpacing - paddingTop;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });

        if (isMobileMenuOpen) {
          bootstrap.Collapse.getInstance(collapse)?.hide();
        }
      }
    });
  });

  /* ─── 6. ACTIVE NAV LINK ON SCROLL ─────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => link.classList.remove('active'));
        const active = document.querySelector(`.navbar-nav .nav-link[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-50% 0px -50% 0px' });

  sections.forEach(s => sectionObserver.observe(s));

  /* ─── 7. GUEST FORM SUBMISSION ──────────────────────────── */
  const guestForm = document.getElementById('guestForm');
  const formSuccess = document.getElementById('formSuccess');

  if (guestForm) {
    guestForm.addEventListener('submit', e => {
      e.preventDefault();

      if (!guestForm.checkValidity()) {
        guestForm.classList.add('was-validated');
        return;
      }

      const btn = guestForm.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending...';
      btn.disabled = true;

      // Send actual network request
      const formData = {
        name: document.getElementById('guestName').value,
        email: document.getElementById('guestEmail').value,
        business: document.getElementById('guestBusiness').value,
        city: document.getElementById('guestCity').value,
        type: 'Guest Visit'
      };

      fetch('process_contact.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
        .then(response => response.json())
        .then(data => {
          guestForm.reset();
          guestForm.classList.remove('was-validated');
          btn.innerHTML = originalText;
          btn.disabled = false;

          if (data.debug) {
            console.log("SMTP Debug Log:\n" + data.debug);
          }
          if (data.status === 'success') {
            formSuccess.classList.remove('d-none');
            formSuccess.innerHTML = '<i class="bi bi-check-circle-fill text-success me-2"></i>Thank you! Your message has been sent successfully';
            setTimeout(() => formSuccess.classList.add('d-none'), 6000);
          } else {
            alert('Error: ' + data.message);
          }
        })
        .catch(error => {
          console.error('Error:', error);
          btn.innerHTML = originalText;
          btn.disabled = false;
          alert('An error occurred while sending your request.');
        });
    });
  }

  /* ─── 7b. CONTACT FORM ───────────────────────────────────── */
  const contactForm = document.getElementById('contactForm');
  const contactSuccess = document.getElementById('contactSuccess');

  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();

      if (!contactForm.checkValidity()) {
        contactForm.classList.add('was-validated');
        return;
      }

      const btn = contactForm.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending...';
      btn.disabled = true;

      // Send actual network request
      const formData = {
        name: document.getElementById('contactName').value,
        email: document.getElementById('contactEmail').value,
        message: document.getElementById('contactMessage').value,
        type: 'Contact'
      };

      fetch('process_contact.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
        .then(response => response.json())
        .then(data => {
          contactForm.reset();
          contactForm.classList.remove('was-validated');
          btn.innerHTML = originalText;
          btn.disabled = false;

          if (data.debug) {
            console.log("SMTP Debug Log:\n" + data.debug);
          }
          if (data.status === 'success') {
            contactSuccess.classList.remove('d-none');
            contactSuccess.innerHTML = '<i class="bi bi-check-circle-fill text-success me-2"></i>Thank you! Your message has been sent successfully';
            setTimeout(() => contactSuccess.classList.add('d-none'), 6000);
          } else {
            alert('Error: ' + data.message);
          }
        })
        .catch(error => {
          console.error('Error:', error);
          btn.innerHTML = originalText;
          btn.disabled = false;
          alert('An error occurred while sending your message.');
        });
    });
  }

  /* ─── 8. NEWSLETTER FORM ────────────────────────────────── */
  const footerForm = document.querySelector('.footer-form');
  if (footerForm) {
    const footerBtn = footerForm.querySelector('button');
    footerBtn.addEventListener('click', () => {
      const input = footerForm.querySelector('input[type="email"]');
      if (input.value && input.value.includes('@')) {
        const orig = footerBtn.innerHTML;
        footerBtn.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i>Subscribed!';
        footerBtn.disabled = true;
        input.value = '';
        setTimeout(() => {
          footerBtn.innerHTML = orig;
          footerBtn.disabled = false;
        }, 3000);
      }
    });
  }

  /* ─── 9. LOGO BAR PAUSE ON HOVER ───────────────────────── */
  const logoBar = document.querySelector('.logo-bar-inner');
  if (logoBar) {
    logoBar.addEventListener('mouseenter', () => logoBar.style.animationPlayState = 'paused');
    logoBar.addEventListener('mouseleave', () => logoBar.style.animationPlayState = 'running');
  }

  /* ─── 10. HERO PARALLAX ─────────────────────────────────── */
  const heroShapes = document.querySelectorAll('.hero-bg-shape');
  document.addEventListener('mousemove', e => {
    const mx = (e.clientX / window.innerWidth - 0.5) * 20;
    const my = (e.clientY / window.innerHeight - 0.5) * 20;
    heroShapes.forEach((shape, i) => {
      const factor = i === 0 ? 1 : -0.6;
      shape.style.transform = `translate(${mx * factor}px, ${my * factor}px)`;
    });
  });

  /* ─── 11. STATS CARD RIPPLE EFFECT ─────────────────────── */
  document.querySelectorAll('.stat-box, .feature-card, .diff-card, .event-card, .testimonial-card, .process-card').forEach(card => {
    card.addEventListener('click', function (e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(35,86,160,.15);
        width: 150px; height: 150px;
        top: ${e.clientY - rect.top - 75}px;
        left: ${e.clientX - rect.left - 75}px;
        transform: scale(0);
        animation: rippleAnim .6s ease-out forwards;
        pointer-events: none;
        z-index: 0;
      `;
      if (!this.style.position || this.style.position === 'static') {
        this.style.position = 'relative';
      }
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  });

  // Inject ripple keyframes
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    @keyframes rippleAnim {
      to { transform: scale(4); opacity: 0; }
    }
    .navbar-nav .nav-link.active {
      color: var(--primary) !important;
      background: rgba(26,60,107,.08);
    }
  `;
  document.head.appendChild(styleEl);

  /* ─── 12. TYPED EFFECT IN HERO ─────────────────────────── */
  const heroWords = ['Business Growth', 'Referral Revenue', 'Lasting Success', 'Elite Connections'];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingEl = null;

  // Look for the gradient-text span and animate it
  const gradientText = document.querySelector('.gradient-text');
  if (gradientText) {
    const originalText = gradientText.textContent;
    typingEl = gradientText;
    heroWords[0] = originalText;

    function typeEffect() {
      const currentWord = heroWords[wordIndex];
      if (isDeleting) {
        typingEl.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
      } else {
        typingEl.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
      }

      let delay = isDeleting ? 60 : 110;

      if (!isDeleting && charIndex === currentWord.length) {
        delay = 2200;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % heroWords.length;
        delay = 300;
      }

      setTimeout(typeEffect, delay);
    }

    // Start after a delay
    setTimeout(typeEffect, 2500);
  }

  /* ─── 13. INTERACTIVE ONBOARDING CIRCLE ─────────────────── */
  const circleNodes = document.querySelectorAll('.circle-node');
  const circleCenterNum = document.getElementById('circle-center-num');
  const pipelineTitle = document.getElementById('pipeline-title');
  const pipelineDesc = document.getElementById('pipeline-desc');

  const pipelineSteps = [
    { title: "1. Apply Online", desc: "Submit your basic business profile and contact details online." },
    { title: "2. Review", desc: "Our chapter team reviews your profile to assess alignment with EBN guidelines." },
    { title: "3. Category Check", desc: "We check the chapter directory to ensure your specific business industry is available." },
    { title: "4. Interview", desc: "Meet with the chapter membership committee for a brief alignment interview." },
    { title: "5. Approval", desc: "The committee approves your membership and locks in your category exclusivity." },
    { title: "6. Payment", desc: "Complete the annual subscription payment to secure your official seat." },
    { title: "7. Training", desc: "Attend the mandatory Foundation Training to learn the referral tracking tools." },
    { title: "8. Induction", desc: "Get formally inducted during a chapter meeting and introduced to all members." },
    { title: "9. Growth Begins", desc: "Start receiving qualified business referrals and accelerating your business growth!" }
  ];

  if (circleNodes.length > 0) {
    circleNodes.forEach(node => {
      const updateStep = () => {
        const stepIndex = parseInt(node.dataset.step, 10);
        const step = pipelineSteps[stepIndex];

        circleNodes.forEach(n => {
          n.classList.remove('active');
          n.classList.remove('active-success');
        });

        if (stepIndex === 8) {
          node.classList.add('active-success');
        } else {
          node.classList.add('active');
        }

        circleCenterNum.textContent = stepIndex + 1;
        pipelineTitle.textContent = step.title;
        pipelineDesc.textContent = step.desc;
      };

      node.addEventListener('mouseenter', updateStep);
      node.addEventListener('click', updateStep);
    });
  }

  /* ─── INIT COMPLETE ─────────────────────────────────────── */
  console.log('%cEBN Website loaded successfully!', 'color: #2356a0; font-weight: 700; font-size: 14px;');
});
