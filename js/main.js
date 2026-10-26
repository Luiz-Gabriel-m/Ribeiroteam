/**
 * RIBEIRO TEAM - MAIN JAVASCRIPT CONTROLLER
 * Coach Samuel Ribeiro (@treinador_samuelribeiro)
 * GSAP ScrollTrigger Animations, Interactive UI, Video Handling & Lead Generation
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize Lucide Icons if available
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  // 2. Initialize 3D Deadlift Biomechanics Module
  let deadlift3DInstance = null;
  if (typeof DeadliftBiomechanics3D !== "undefined") {
    deadlift3DInstance = new DeadliftBiomechanics3D("deadlift-canvas-container");
  }

  // 3. Initialize GSAP & ScrollTrigger
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    setupGSAPAnimations(deadlift3DInstance);
  }

  // 4. Video Hero Fallback & Autoplay Guard
  setupHeroVideo();

  // 5. Mobile Navigation Menu
  setupMobileNav();

  // 6. Interactive FAQ Accordion
  setupFAQAccordion();

  // 7. Dynamic Animated Counters
  setupStatsCounters();

  // 8. Dynamic Header Glassmorphism on Scroll
  setupHeaderScroll();

  // 9. Interactive 3D Before & After Comparison Slider
  setupComparisonSlider();
});

/**
 * GSAP Entrance & ScrollTrigger Animations
 */
function setupGSAPAnimations(deadlift3D) {
  // Hero Entrance Timeline
  const heroTL = gsap.timeline({ defaults: { ease: "power3.out" } });

  heroTL
    .from("#hero-badge", { opacity: 0, y: -20, duration: 0.8, delay: 0.2 })
    .from("#hero-title > span", { opacity: 0, y: 30, stagger: 0.15, duration: 0.9 }, "-=0.4")
    .from("#hero-subtitle", { opacity: 0, y: 20, duration: 0.8 }, "-=0.6")
    .from("#hero-ctas", { opacity: 0, y: 20, duration: 0.8 }, "-=0.5")
    .from("#hero-stats", { opacity: 0, y: 20, duration: 0.8 }, "-=0.4")
    .from(".comparison-container", { opacity: 0, scale: 0.95, duration: 1.2, ease: "power2.out" }, "-=1.0");

  // Section Headers Reveal
  gsap.utils.toArray(".section-reveal").forEach((elem) => {
    gsap.from(elem, {
      scrollTrigger: {
        trigger: elem,
        start: "top 85%",
        toggleActions: "play none none none"
      },
      opacity: 0,
      y: 40,
      duration: 0.9,
      ease: "power2.out"
    });
  });

  // Staggered Cards (Methodology & Plans)
  gsap.utils.toArray(".stagger-group").forEach((group) => {
    const cards = group.querySelectorAll(".stagger-card");
    gsap.from(cards, {
      scrollTrigger: {
        trigger: group,
        start: "top 80%",
        toggleActions: "play none none none"
      },
      opacity: 0,
      y: 45,
      stagger: 0.15,
      duration: 0.85,
      ease: "power2.out"
    });
  });

  // 3D Deadlift Module ScrollTrigger Integration
  if (deadlift3D && document.getElementById("deadlift-section")) {
    ScrollTrigger.create({
      trigger: "#deadlift-section",
      start: "top 70%",
      end: "bottom 30%",
      onEnter: () => {
        // Automatically smoothly animate from setup to pull on first scroll into view
        if (!deadlift3D.isAutoPlaying) {
          gsap.to(deadlift3D, {
            targetProgress: 0.5,
            duration: 1.4,
            ease: "power2.out",
            onUpdate: () => deadlift3D.setPhase(deadlift3D.targetProgress)
          });
        }
      }
    });
  }

  // Gallery Stagger Reveal
  if (document.getElementById("gallery-grid")) {
    gsap.from(".gallery-card", {
      scrollTrigger: {
        trigger: "#gallery-grid",
        start: "top 80%",
        toggleActions: "play none none none"
      },
      opacity: 0,
      scale: 0.94,
      y: 30,
      stagger: 0.12,
      duration: 0.8,
      ease: "power2.out"
    });
  }
}

/**
 * Hero Video Autoplay Assurance & Graceful Fallback
 */
function setupHeroVideo() {
  const video = document.getElementById("hero-video");
  const fallbackImg = document.getElementById("hero-video-fallback");

  if (!video) return;

  // Guarantee required autoplay attributes
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;

  const playPromise = video.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        if (fallbackImg) fallbackImg.style.opacity = "0";
      })
      .catch((error) => {
        console.warn("Hero background video autoplay prevented or asset loading error:", error);
        if (fallbackImg) fallbackImg.style.opacity = "1";
      });
  }

  video.addEventListener("error", () => {
    if (fallbackImg) fallbackImg.style.opacity = "1";
  });
}

/**
 * Dynamic Header Blur & Scale on Scroll
 */
function setupHeaderScroll() {
  const header = document.getElementById("main-header");
  if (!header) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      header.classList.add("bg-neutral-950/85", "backdrop-blur-xl", "border-b", "border-white/10", "py-3");
      header.classList.remove("py-5", "bg-transparent");
    } else {
      header.classList.remove("bg-neutral-950/85", "backdrop-blur-xl", "border-b", "border-white/10", "py-3");
      header.classList.add("py-5", "bg-transparent");
    }
  });
}

/**
 * Mobile Navigation Drawer
 */
function setupMobileNav() {
  const mobileToggle = document.getElementById("mobile-menu-toggle");
  const mobileDrawer = document.getElementById("mobile-drawer");
  const mobileLinks = document.querySelectorAll(".mobile-nav-link");

  if (!mobileToggle || !mobileDrawer) return;

  mobileToggle.addEventListener("click", () => {
    const isOpen = !mobileDrawer.classList.contains("hidden");
    if (isOpen) {
      mobileDrawer.classList.add("hidden");
    } else {
      mobileDrawer.classList.remove("hidden");
    }
  });

  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mobileDrawer.classList.add("hidden");
    });
  });
}

/**
 * Interactive FAQ Accordion
 */
function setupFAQAccordion() {
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const trigger = item.querySelector(".faq-trigger");
    const content = item.querySelector(".faq-content");
    const chevron = item.querySelector(".faq-chevron");

    if (!trigger || !content) return;

    trigger.addEventListener("click", () => {
      const isExpanded = trigger.getAttribute("aria-expanded") === "true";

      // Close all other FAQs
      faqItems.forEach((other) => {
        if (other !== item) {
          const otherTrigger = other.querySelector(".faq-trigger");
          const otherContent = other.querySelector(".faq-content");
          const otherChevron = other.querySelector(".faq-chevron");
          if (otherTrigger) otherTrigger.setAttribute("aria-expanded", "false");
          if (otherContent) otherContent.style.maxHeight = null;
          if (otherChevron) otherChevron.classList.remove("rotate-180");
        }
      });

      if (!isExpanded) {
        trigger.setAttribute("aria-expanded", "true");
        content.style.maxHeight = content.scrollHeight + "px";
        if (chevron) chevron.classList.add("rotate-180");
      } else {
        trigger.setAttribute("aria-expanded", "false");
        content.style.maxHeight = null;
        if (chevron) chevron.classList.remove("rotate-180");
      }
    });
  });
}

/**
 * Live Stats Numerical Counters
 */
function setupStatsCounters() {
  const counterElements = document.querySelectorAll("[data-counter-target]");
  if (!counterElements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute("data-counter-target"), 10);
        const prefix = el.getAttribute("data-counter-prefix") || "";
        const suffix = el.getAttribute("data-counter-suffix") || "";
        
        let count = 0;
        const duration = 1800; // ms
        const startTime = performance.now();

        function updateCounter(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          count = Math.floor(easeProgress * target);
          el.innerText = `${prefix}${count}${suffix}`;

          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            el.innerText = `${prefix}${target}${suffix}`;
          }
        }

        requestAnimationFrame(updateCounter);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counterElements.forEach((el) => observer.observe(el));
}

/**
 * 3D Before & After Comparison Slider with Interactive Drag & 3D Tilt
 */
function setupComparisonSlider() {
  const card = document.getElementById("before-after-card");
  const handle = document.getElementById("comparison-handle");
  const afterLayer = document.getElementById("comparison-after-layer");
  const glare = document.getElementById("comparison-glare");

  if (!card || !handle || !afterLayer) return;

  let isDragging = false;

  function updateSlider(clientX) {
    const rect = card.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    let percentage = (offsetX / rect.width) * 100;
    percentage = Math.max(3, Math.min(97, percentage));

    handle.style.left = `${percentage}%`;
    afterLayer.style.clipPath = `polygon(0 0, ${percentage}% 0, ${percentage}% 100%, 0 100%)`;
  }

  function onPointerDown(e) {
    isDragging = true;
    card.classList.add("is-dragging");
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    updateSlider(clientX);
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    updateSlider(clientX);
  }

  function onPointerUp() {
    if (isDragging) {
      isDragging = false;
      card.classList.remove("is-dragging");
    }
  }

  // Pointer events on handle & card
  handle.addEventListener("mousedown", onPointerDown);
  handle.addEventListener("touchstart", onPointerDown, { passive: true });

  card.addEventListener("mousedown", (e) => {
    onPointerDown(e);
  });
  card.addEventListener("touchstart", (e) => {
    onPointerDown(e);
  }, { passive: true });

  window.addEventListener("mousemove", onPointerMove);
  window.addEventListener("touchmove", onPointerMove, { passive: true });

  window.addEventListener("mouseup", onPointerUp);
  window.addEventListener("touchend", onPointerUp);

  // 3D Tilt Effect on Desktop (Mousemove)
  if (window.innerWidth > 768) {
    card.addEventListener("mousemove", (e) => {
      if (isDragging) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;

      if (glare) {
        glare.style.opacity = "1";
        const glareX = (x / rect.width) * 100;
        const glareY = (y / rect.height) * 100;
        glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.18) 0%, transparent 65%)`;
      }
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
      if (glare) {
        glare.style.opacity = "0";
      }
    });
  }
}

