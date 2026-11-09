/**
 * TEAM RIBEIRO - MAIN JAVASCRIPT CONTROLLER
 * Coach Samuel Ribeiro (@treinador_samuelribeiro)
 * GSAP ScrollTrigger Animations, Interactive UI, Video Handling & Lead Generation
 */

// Configuração Global de Contato WhatsApp Oficial (sem pontuação)
const WHATSAPP_NUMBER = "553598657628";

document.addEventListener("DOMContentLoaded", () => {
  // 0. Initialize Preloader Animation (0 to 100%)
  setupPreloader();

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

  // 10. Interactive 3D Tilt Effect on Plan Cards
  setupPlanCards3D();

  // 11. Interactive HUD Toggle for 3D Deadlift Kinematics (localStorage & Keyboard 'H')
  setupDeadliftHUDToggle();

  // 12. Student Feedbacks Lightbox Modal & Zoom
  setupFeedbacksGallery();
});

/**
 * 0. Preloader with Dynamic Progress Animation (0 to 100%)
 */
function setupPreloader() {
  const preloader = document.getElementById("preloader");
  const bar = document.getElementById("preloader-bar");
  const counter = document.getElementById("preloader-counter");

  if (!preloader || !bar || !counter) return;

  let progress = 0;
  let isWindowLoaded = document.readyState === "complete";

  window.addEventListener("load", () => {
    isWindowLoaded = true;
  });

  const interval = setInterval(() => {
    if (isWindowLoaded) {
      // Avanço acelerado assim que a janela estiver pronta
      progress += Math.random() * 14 + 10;
    } else if (progress < 90) {
      // Avanço progressivo realista enquanto carrega
      progress += Math.random() * 6 + 2;
    }

    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      bar.style.width = "100%";
      counter.textContent = "100%";

      // Pausa tátil ao atingir 100% antes da transição de saída
      setTimeout(() => {
        preloader.classList.add("preloader-hidden");
        setTimeout(() => {
          preloader.style.display = "none";
        }, 500);
      }, 160);
    } else {
      bar.style.width = `${progress}%`;
      counter.textContent = `${Math.floor(progress)}%`;
    }
  }, 25);

  // Fallback de segurança (2.5s) para garantir liberação da tela
  setTimeout(() => {
    if (preloader && !preloader.classList.contains("preloader-hidden")) {
      clearInterval(interval);
      bar.style.width = "100%";
      counter.textContent = "100%";
      preloader.classList.add("preloader-hidden");
      setTimeout(() => {
        preloader.style.display = "none";
      }, 500);
    }
  }, 2500);
}

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
 * Enhanced for iOS Safari & Mobile Low Power Mode
 */
function setupHeroVideo() {
  const video = document.getElementById("hero-video");
  const fallbackImg = document.getElementById("hero-video-fallback");

  if (!video) return;

  // Guarantee required autoplay attributes for mobile WebKit & iOS Safari
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.setAttribute("x5-playsinline", "");

  const onPlaySuccess = () => {
    if (fallbackImg) fallbackImg.style.opacity = "0";
    detachGestureListeners();
  };

  const startPlayback = () => {
    if (!video.paused) {
      onPlaySuccess();
      return;
    }
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          onPlaySuccess();
        })
        .catch((error) => {
          console.warn("Hero video autoplay waiting for user interaction on mobile:", error);
          if (fallbackImg) fallbackImg.style.opacity = "0.35";
        });
    }
  };

  const onGesture = () => {
    if (video.paused) {
      startPlayback();
    } else {
      detachGestureListeners();
    }
  };

  const onVisibilityChange = () => {
    if (!document.hidden && video.paused) {
      startPlayback();
    }
  };

  const detachGestureListeners = () => {
    window.removeEventListener("touchstart", onGesture);
    window.removeEventListener("touchend", onGesture);
    window.removeEventListener("click", onGesture);
    window.removeEventListener("scroll", onGesture);
  };

  // 1. Immediate playback attempt
  startPlayback();

  // 2. Play on loaded metadata / canplay events
  video.addEventListener("loadedmetadata", () => {
    if (video.paused) startPlayback();
  });
  video.addEventListener("loadeddata", () => {
    if (video.paused) startPlayback();
  });
  video.addEventListener("canplay", () => {
    if (video.paused) startPlayback();
  });
  video.addEventListener("playing", onPlaySuccess);

  // 3. User interaction triggers (vital for iOS Safari when battery saver / low power mode is active)
  window.addEventListener("touchstart", onGesture, { passive: true });
  window.addEventListener("touchend", onGesture, { passive: true });
  window.addEventListener("click", onGesture, { passive: true });
  window.addEventListener("scroll", onGesture, { passive: true });
  document.addEventListener("visibilitychange", onVisibilityChange);
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
    title: "Caso 1: Hipertrofia & Volume Estético",
    timeTag: "Evolução Hipertrofia • Protocolo Team Ribeiro",
    category: "Caso 1: Hipertrofia",
    badge: "Caso Real",
    beforeImg: "Assets/adicionar antes e depois/antes1.jpeg",
    afterImg: "Assets/adicionar antes e depois/depois1.jpeg",
    metric1Val: "+8.5kg",
    metric1Label: "Massa Magra",
    metric2Val: "-6.2%",
    metric2Label: "Gordura Corporal"
  },
  {
    id: 1,
    title: "Caso 2: Recomposição Corporal & Densidade",
    timeTag: "Recomposição Corporal • Ganho de Volume & Densidade",
    category: "Caso 2: Recomposição",
    badge: "Alta Densidade",
    beforeImg: "Assets/adicionar antes e depois/antes2.jpeg",
    afterImg: "Assets/adicionar antes e depois/depois2.jpeg",
    metric1Val: "+6.8kg",
    metric1Label: "Massa Magra",
    metric2Val: "-7.4%",
    metric2Label: "Gordura Corporal"
  },
  {
    id: 2,
    title: "Caso 3: Definição & Secagem Abdominal",
    timeTag: "Definição Máxima • Afinamento de Linha de Cintura",
    category: "Caso 3: Definição",
    badge: "Secagem Rápida",
    beforeImg: "Assets/adicionar antes e depois/antes3.jpeg",
    afterImg: "Assets/adicionar antes e depois/depois3.jpeg",
    metric1Val: "-11cm",
    metric1Label: "Linha de Cintura",
    metric2Val: "-9.1%",
    metric2Label: "Percentual Gordura"
  },
  {
    id: 3,
    title: "Caso 4: Construção de Dorsais & V-Taper",
    timeTag: "Construção de Dorsais & V-Taper • Protocolo Team Ribeiro",
    category: "Caso 4: V-Taper",
    badge: "Simetria Estética",
    beforeImg: "Assets/adicionar antes e depois/antes4.jpeg",
    afterImg: "Assets/adicionar antes e depois/depois4.jpeg",
    metric1Val: "+5.4kg",
    metric1Label: "Massa Magra",
    metric2Val: "-5.0%",
    metric2Label: "Gordura Corporal"
  },
  {
    id: 4,
    title: "Caso 5: Transformação Completa & Postura",
    timeTag: "Reestruturação Física • Alinhamento Biomecânico & Hipertrofia",
    category: "Caso 5: Transformação",
    badge: "Evolução Real",
    beforeImg: "Assets/adicionar antes e depois/antes5.jpeg",
    afterImg: "Assets/adicionar antes e depois/depois5.jpeg",
    metric1Val: "+7.2kg",
    metric1Label: "Massa Muscular",
    metric2Val: "-8.0kg",
    metric2Label: "Gordura Corporal"
  },
  {
    id: 5,
    title: "Caso 6: Densidade Muscular & Condicionamento",
    timeTag: "Condicionamento Extremo • Simetria e Densidade Total",
    category: "Caso 6: Condicionamento",
    badge: "Densidade & Simetria",
    beforeImg: "Assets/adicionar antes e depois/antes6.jpeg",
    afterImg: "Assets/adicionar antes e depois/depois6.jpeg",
    metric1Val: "Sub-9%",
    metric1Label: "Gordura Corporal",
    metric2Val: "+4.9kg",
    metric2Label: "Massa Magra"
  }
];

function setupComparisonSlider() {
  const card = document.getElementById("before-after-card");
  const handle = document.getElementById("comparison-handle");
  const afterLayer = document.getElementById("comparison-after-layer");
  const glare = document.getElementById("comparison-glare");
  const beforeImg = document.getElementById("case-before-img");
  const afterImg = document.getElementById("case-after-img");
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
          tab.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
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

/**
 * 3D Tilt Effect on Plan Cards with Specular Light Glare
 * Active on fine pointers (desktop mouse), safe on touch devices
 */
function setupPlanCards3D() {
  const planCards = document.querySelectorAll(".plan-card-3d");
  if (!planCards.length) return;

  const isFinePointer = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
  if (!isFinePointer) return;

  planCards.forEach((card) => {
    const glare = card.querySelector(".plan-card-glare");

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Subtle, refined 3D tilt angles
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

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
  });
}

/**
 * Alternador de Visibilidade do HUD Biomecânico do Deadlift 3D
 * Suporta persistência em localStorage, atalho de teclado ('H') e atualização dinâmica de ícones Lucide
 */
function setupDeadliftHUDToggle() {
  const toggleBtn = document.getElementById("deadlift-hud-toggle");
  const hudCard = document.getElementById("deadlift-hud-card");
  if (!toggleBtn || !hudCard) return;

  const STORAGE_KEY = "deadlift_hud_visible";

  // 1. Ler estado inicial do localStorage (predefinição: visível/true)
  const savedState = localStorage.getItem(STORAGE_KEY);
  let isVisible = savedState === null ? true : savedState === "true";

  // 2. Aplicação de classes e estado visual
  function applyHUDState(visible, animate = true) {
    if (!animate) {
      hudCard.classList.remove("duration-300", "transition-all");
    }

    if (visible) {
      // Estado Visível (true)
      hudCard.classList.remove("opacity-0", "-translate-y-2", "pointer-events-none");
      hudCard.classList.add("opacity-100", "translate-y-0");

      toggleBtn.innerHTML = `
        <i data-lucide="eye" class="w-3.5 h-3.5"></i>
        <span>Ocultar Fases</span>
      `;
      toggleBtn.classList.remove("border-red-500/40", "text-red-400");
      toggleBtn.classList.add("border-white/15", "text-gray-300");
      toggleBtn.setAttribute("aria-expanded", "true");
    } else {
      // Estado Oculto (false)
      hudCard.classList.remove("opacity-100", "translate-y-0");
      hudCard.classList.add("opacity-0", "-translate-y-2", "pointer-events-none");

      toggleBtn.innerHTML = `
        <i data-lucide="eye-off" class="w-3.5 h-3.5"></i>
        <span>Exibir Fases</span>
      `;
      toggleBtn.classList.remove("border-white/15", "text-gray-300");
      toggleBtn.classList.add("border-red-500/40", "text-red-400");
      toggleBtn.setAttribute("aria-expanded", "false");
    }

    if (!animate) {
      // Força reflow e restaura classes de transição após leitura inicial
      void hudCard.offsetWidth;
      hudCard.classList.add("transition-all", "duration-300");
    }

    // Atualização de ícones Lucide
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  // 3. Aplica o estado inicial lido do localStorage sem salto visual
  applyHUDState(isVisible, false);

  // 4. Alternância de estado com gravação no localStorage
  function toggleHUD() {
    isVisible = !isVisible;
    try {
      localStorage.setItem(STORAGE_KEY, String(isVisible));
    } catch (e) {
      console.warn("localStorage indisponível:", e);
    }
    applyHUDState(isVisible, true);
  }

  // 5. Evento de clique no botão
  toggleBtn.addEventListener("click", (e) => {
    e.preventDefault();
    toggleHUD();
  });

  // 6. Suporte a Atalho de Teclado ("H" ou "h")
  window.addEventListener("keydown", (e) => {
    // Ignora se o utilizador estiver focado num campo de formulário ou editável
    const activeEl = document.activeElement;
    const isInput =
      activeEl &&
      (activeEl.tagName === "INPUT" ||
        activeEl.tagName === "TEXTAREA" ||
        activeEl.isContentEditable ||
        activeEl.getAttribute("contenteditable") === "true");

    if (isInput) return;

    // Tecla H (maiúscula ou minúscula), evitando conflito com atalhos de sistema (Ctrl/Cmd/Alt)
    if (e.key === "h" || e.key === "H") {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      e.preventDefault();
      toggleHUD();
    }
  });
}

// Exporta globalmente para integração modular
window.setupDeadliftHUDToggle = setupDeadliftHUDToggle;

/**
 * 12. Student Feedbacks Lightbox Modal & Zoom Interactions
 */
function setupFeedbacksGallery() {
  const cards = document.querySelectorAll(".feedback-card");
  const modal = document.getElementById("feedback-modal");
  const modalImg = document.getElementById("feedback-modal-img");
  const modalCounter = document.getElementById("feedback-modal-counter");
  const modalCaption = document.getElementById("feedback-modal-caption");
  const closeBtn = document.getElementById("feedback-modal-close");
  const prevBtn = document.getElementById("feedback-modal-prev");
  const nextBtn = document.getElementById("feedback-modal-next");

  if (!modal || !modalImg || cards.length === 0) return;

  const feedbacks = Array.from(cards).map((card, idx) => ({
    src: card.getAttribute("data-feedback-src") || "",
    caption: card.getAttribute("data-feedback-caption") || "Relato de Aluno Oficial • Team Ribeiro",
    index: idx
  }));

  let currentIdx = 0;
  let isOpen = false;

  function openModal(index) {
    currentIdx = (index + feedbacks.length) % feedbacks.length;
    const item = feedbacks[currentIdx];

    modalImg.src = item.src;
    if (modalCounter) {
      modalCounter.textContent = `Feedback ${currentIdx + 1} de ${feedbacks.length}`;
    }
    if (modalCaption) {
      modalCaption.textContent = item.caption;
    }

    modal.classList.remove("hidden");
    requestAnimationFrame(() => {
      modal.classList.remove("opacity-0");
      modal.classList.add("opacity-100");
    });
    document.body.style.overflow = "hidden";
    isOpen = true;
  }

  function closeModal() {
    if (!isOpen) return;
    modal.classList.remove("opacity-100");
    modal.classList.add("opacity-0");
    setTimeout(() => {
      modal.classList.add("hidden");
      modalImg.src = "";
    }, 250);
    document.body.style.overflow = "";
    isOpen = false;
  }

  function nextFeedback() {
    openModal(currentIdx + 1);
  }

  function prevFeedback() {
    openModal(currentIdx - 1);
  }

  // Click on each card
  cards.forEach((card, idx) => {
    card.addEventListener("click", () => openModal(idx));
  });

  // Modal control buttons
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (prevBtn) {
    prevBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      prevFeedback();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      nextFeedback();
    });
  }

  // Click on backdrop to close
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Keyboard accessibility
  window.addEventListener("keydown", (e) => {
    if (!isOpen) return;
    if (e.key === "Escape") {
      closeModal();
    } else if (e.key === "ArrowLeft") {
      prevFeedback();
    } else if (e.key === "ArrowRight") {
      nextFeedback();
    }
  });

  // Initialize Lucide icons inside modal if available
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

// Exporta globalmente para integração modular
window.setupFeedbacksGallery = setupFeedbacksGallery;


