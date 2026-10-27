/**
 * RIBEIRO TEAM - MAIN JAVASCRIPT CONTROLLER
 * Coach Samuel Ribeiro (@treinador_samuelribeiro)
 * GSAP ScrollTrigger Animations, Interactive UI, Video Handling & Lead Generation
 */

// Configuração Global de Contato WhatsApp Oficial (sem pontuação)
const WHATSAPP_NUMBER = "553598657628";

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
    .from("#hero-coach-frame", { opacity: 0, scale: 0.95, duration: 1.2, ease: "power2.out" }, "-=1.0");

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

  // Staggered Cards (Safe Guard against NodeList errors)
  gsap.utils.toArray(".stagger-group").forEach((group) => {
    const cards = Array.from(group.querySelectorAll(".stagger-card"));
    if (cards.length > 0) {
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
    }
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

  function toggleMenu(forceClose = false) {
    const isClosed = mobileDrawer.classList.contains("translate-x-full") || mobileDrawer.classList.contains("hidden");

    if (!isClosed || forceClose) {
      mobileDrawer.classList.add("translate-x-full", "opacity-0", "pointer-events-none");
      mobileDrawer.classList.remove("translate-x-0", "opacity-100", "pointer-events-auto");
      document.body.classList.remove("overflow-hidden");
      mobileToggle.innerHTML = '<i data-lucide="menu" class="w-6 h-6"></i>';
    } else {
      mobileDrawer.classList.remove("translate-x-full", "opacity-0", "pointer-events-none", "hidden");
      mobileDrawer.classList.add("translate-x-0", "opacity-100", "pointer-events-auto");
      document.body.classList.add("overflow-hidden");
      mobileToggle.innerHTML = '<i data-lucide="x" class="w-6 h-6 text-red-500"></i>';
    }
    if (window.lucide) {
      lucide.createIcons();
    }
  }

  mobileToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
      toggleMenu(true);
    });
  });

  document.addEventListener("click", (e) => {
    if (!mobileDrawer.contains(e.target) && !mobileToggle.contains(e.target)) {
      toggleMenu(true);
    }
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
 * 3D Before & After Comparison Multi-Case Carousel with Drag & 3D Tilt
 */
const TRANSFORMATION_CASES = [
  {
    id: 0,
    title: "Caso 1: Hipertrofia Acelerada",
    timeTag: "Evolução 90 Dias • Protocolo Ribeiro Team",
    category: "Hipertrofia 90D",
    badge: "Caso Real",
    beforeImg: "Assets/transformacoes/antes.jpeg",
    afterImg: "Assets/transformacoes/depois.jpeg",
    metric1Val: "+6.5kg",
    metric1Label: "Massa Magra",
    metric2Val: "-8%",
    metric2Label: "Gordura Corporal"
  },
  {
    id: 1,
    title: "Caso 2: Recomposição Corporal",
    timeTag: "Recomposição 120 Dias • Afinamento & Densidade",
    category: "Recomposição Corporal",
    badge: "Alta Densidade",
    beforeImg: "Assets/transformacoes/case2_antes.jpeg",
    afterImg: "Assets/transformacoes/case2_depois.jpeg",
    metric1Val: "-12cm",
    metric1Label: "Linha de Cintura",
    metric2Val: "+4.8kg",
    metric2Label: "Massa Magra"
  },
  {
    id: 2,
    title: "Caso 3: Físico Competitivo",
    timeTag: "Preparação de Palco • Percentual de Gordura Mínimo",
    category: "Físico Competitivo",
    badge: "Físico Competitivo",
    beforeImg: "Assets/transformacoes/case3_antes.jpeg",
    afterImg: "Assets/transformacoes/case3_depois.jpeg",
    metric1Val: "Sub-8%",
    metric1Label: "Gordura Corporal",
    metric2Val: "Estriações",
    metric2Label: "Densidade Dorsal"
  }
];

function setupComparisonSlider() {
  const card = document.getElementById("before-after-card");
  const handle = document.getElementById("comparison-handle");
  const afterLayer = document.getElementById("comparison-after-layer");
  const glare = document.getElementById("comparison-glare");
  const beforeImg = document.getElementById("case-before-img");
  const afterImg = document.getElementById("case-after-img");
  const timeTag = document.getElementById("case-time-tag");
  const statusBadge = document.getElementById("case-status-badge");
  const metric1Val = document.getElementById("case-metric-1-val");
  const metric1Lbl = document.getElementById("case-metric-1-lbl");
  const metric2Val = document.getElementById("case-metric-2-val");
  const metric2Lbl = document.getElementById("case-metric-2-lbl");
  const prevBtn = document.getElementById("case-prev-btn");
  const nextBtn = document.getElementById("case-next-btn");

  if (!card || !handle || !afterLayer) return;

  let currentCaseIndex = 0;
  let isDragging = false;

  function resetSlider() {
    handle.style.left = "50%";
    afterLayer.style.clipPath = "polygon(0 0, 50% 0, 50% 100%, 0 100%)";
  }

  function renderCase(index) {
    currentCaseIndex = (index + TRANSFORMATION_CASES.length) % TRANSFORMATION_CASES.length;
    const c = TRANSFORMATION_CASES[currentCaseIndex];

    // Smooth image transition
    if (beforeImg && afterImg) {
      beforeImg.style.opacity = "0.2";
      afterImg.style.opacity = "0.2";

      setTimeout(() => {
        beforeImg.src = c.beforeImg;
        afterImg.src = c.afterImg;
        beforeImg.style.opacity = "1";
        afterImg.style.opacity = "1";
      }, 140);
    }

    if (timeTag) timeTag.textContent = c.timeTag;
    if (statusBadge) statusBadge.textContent = c.badge;
    if (metric1Val) metric1Val.textContent = c.metric1Val;
    if (metric1Lbl) metric1Lbl.textContent = c.metric1Label;
    if (metric2Val) metric2Val.textContent = c.metric2Val;
    if (metric2Lbl) metric2Lbl.textContent = c.metric2Label;

    // Reset drag handle to exactly 50%
    resetSlider();

    // Update Tabs
    TRANSFORMATION_CASES.forEach((_, i) => {
      const tab = document.getElementById(`case-tab-${i}`);
      const dot = document.getElementById(`case-dot-${i}`);

      if (tab) {
        if (i === currentCaseIndex) {
          tab.classList.add("active");
          tab.classList.remove("text-gray-400", "bg-neutral-900/60", "border-white/10");
          const dotSpan = tab.querySelector("span:first-child");
          if (dotSpan) dotSpan.className = "w-2 h-2 rounded-full bg-red-500";
        } else {
          tab.classList.remove("active");
          tab.classList.add("text-gray-400", "bg-neutral-900/60", "border-white/10");
          const dotSpan = tab.querySelector("span:first-child");
          if (dotSpan) dotSpan.className = "w-2 h-2 rounded-full bg-neutral-600";
        }
      }

      if (dot) {
        if (i === currentCaseIndex) {
          dot.className = "case-dot h-2 rounded-full transition-all duration-300 w-8 bg-white active";
        } else {
          dot.className = "case-dot h-2 rounded-full transition-all duration-300 w-2.5 bg-neutral-700 hover:bg-neutral-500";
        }
      }
    });
  }

  // Prev / Next button listeners
  if (prevBtn) {
    prevBtn.addEventListener("click", () => renderCase(currentCaseIndex - 1));
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => renderCase(currentCaseIndex + 1));
  }

  // Tab and dot click listeners
  TRANSFORMATION_CASES.forEach((_, i) => {
    const tab = document.getElementById(`case-tab-${i}`);
    const dot = document.getElementById(`case-dot-${i}`);
    if (tab) {
      tab.addEventListener("click", () => renderCase(i));
    }
    if (dot) {
      dot.addEventListener("click", () => renderCase(i));
    }
  });

  // Slider Dragging Functionality with Touch Ergonomics
  function updateSlider(clientX) {
    const rect = card.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    let percentage = (offsetX / rect.width) * 100;
    percentage = Math.max(3, Math.min(97, percentage));

    handle.style.left = `${percentage}%`;
    afterLayer.style.clipPath = `polygon(0 0, ${percentage}% 0, ${percentage}% 100%, 0 100%)`;
  }

  function startDrag(clientX) {
    isDragging = true;
    card.classList.add("is-dragging");
    updateSlider(clientX);
  }

  function endDrag() {
    if (isDragging) {
      isDragging = false;
      card.classList.remove("is-dragging");
    }
  }

  // Handle direct touch/mouse
  handle.addEventListener("mousedown", (e) => startDrag(e.clientX));
  handle.addEventListener("touchstart", (e) => {
    if (e.touches && e.touches[0]) {
      startDrag(e.touches[0].clientX);
    }
  }, { passive: true });

  // Card Touch Intent Handling (separates horizontal slider drag from vertical page scroll)
  let touchStartX = 0;
  let touchStartY = 0;

  card.addEventListener("mousedown", (e) => startDrag(e.clientX));

  card.addEventListener("touchstart", (e) => {
    if (e.touches && e.touches[0]) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });

  card.addEventListener("touchmove", (e) => {
    if (!e.touches || !e.touches[0]) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = Math.abs(currentX - touchStartX);
    const diffY = Math.abs(currentY - touchStartY);

    if (isDragging) {
      if (e.cancelable) e.preventDefault();
      updateSlider(currentX);
      return;
    }

    if (diffX > 10 && diffX > diffY) {
      if (e.cancelable) e.preventDefault();
      startDrag(currentX);
    }
  }, { passive: false });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    updateSlider(e.clientX);
  });

  window.addEventListener("mouseup", endDrag);
  window.addEventListener("touchend", endDrag);
  window.addEventListener("touchcancel", endDrag);

  // 3D Tilt Effect: Active ONLY on desktop mouse pointer, strictly disabled on touch
  const isFinePointer = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
  if (isFinePointer && window.innerWidth > 1024) {
    card.addEventListener("mousemove", (e) => {
      if (isDragging) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -7;
      const rotateY = ((x - centerX) / centerX) * 7;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;

      if (glare) {
        glare.style.opacity = "1";
        const glareX = (x / rect.width) * 100;
        const glareY = (y / rect.height) * 100;
        glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.15) 0%, transparent 65%)`;
      }
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
      if (glare) {
        glare.style.opacity = "0";
      }
    });
  } else {
    card.style.transform = "none";
  }
}

