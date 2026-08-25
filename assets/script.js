(() => {
  "use strict";

  // Intro spotlight follows the pointer — transform-only (compositor, no
  // repaint) and rAF-throttled so mousemove can't outrun the frame budget.
  const introSpotlight = document.getElementById("introSpotlight");
  const introSection = document.getElementById("intro");
  if (introSpotlight && introSection && window.matchMedia("(pointer: fine)").matches) {
    let px = 0, py = 0, spotlightTicking = false;
    introSection.addEventListener(
      "pointermove",
      (e) => {
        const rect = introSection.getBoundingClientRect();
        px = e.clientX - rect.left;
        py = e.clientY - rect.top;
        if (!spotlightTicking) {
          spotlightTicking = true;
          requestAnimationFrame(() => {
            introSpotlight.style.transform = `translate3d(${px}px, ${py}px, 0)`;
            spotlightTicking = false;
          });
        }
      },
      { passive: true }
    );
  }

  // 3D tilt on cards — perspective + rotate driven by pointer position,
  // rAF-throttled and transform-only (compositor, no layout/paint cost).
  if (window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".tilt").forEach((el) => {
      let rx = 0, ry = 0, tiltTicking = false;
      el.addEventListener("pointerenter", () => {
        el.style.willChange = "transform";
      });
      el.addEventListener(
        "pointermove",
        (e) => {
          const rect = el.getBoundingClientRect();
          const px = (e.clientX - rect.left) / rect.width;
          const py = (e.clientY - rect.top) / rect.height;
          const max = 8;
          ry = (px - 0.5) * max * 2;
          rx = -(py - 0.5) * max * 2;
          if (!tiltTicking) {
            tiltTicking = true;
            requestAnimationFrame(() => {
              el.style.transform = `perspective(700px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-4px) scale(1.015)`;
              tiltTicking = false;
            });
          }
        },
        { passive: true }
      );
      el.addEventListener("pointerleave", () => {
        el.style.transform = "";
        el.style.willChange = "";
      });
    });
  }

  // Nav scrolled state, scroll progress bar, and back-to-top visibility —
  // one rAF-throttled scroll listener driving all three.
  const nav = document.getElementById("nav");
  const scrollProgress = document.getElementById("scrollProgress");
  const backToTop = document.getElementById("backToTop");
  let navTicking = false;
  const onScroll = () => {
    if (navTicking) return;
    navTicking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      nav.classList.toggle("scrolled", y > 12);

      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(y / docHeight, 1) : 0;
      scrollProgress.style.transform = `scaleX(${progress})`;

      backToTop.classList.toggle("visible", y > window.innerHeight * 0.8);

      navTicking = false;
    });
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobile nav toggle
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });
  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      links.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );

  // FAQ accordion
  document.querySelectorAll(".faq-item").forEach((item) => {
    const question = item.querySelector(".faq-question");
    question.addEventListener("click", () => {
      const isOpen = item.classList.toggle("open");
      question.setAttribute("aria-expanded", String(isOpen));
    });
  });

  // Scroll reveal
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
    // Safety net: if the observer never fires (unusual host contexts), don't
    // leave content invisible forever.
    setTimeout(() => revealEls.forEach((el) => el.classList.add("in")), 2500);
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  // Animated counters (big numbers)
  const counters = document.querySelectorAll("[data-count-to]");
  const animateCount = (el) => {
    const target = parseInt(el.dataset.countTo, 10);
    const suffix = el.dataset.countSuffix || "";
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const value = Math.round(target * eased);
      el.textContent = value.toLocaleString("en-US") + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => cio.observe(el));
    setTimeout(() => {
      counters.forEach((el) => {
        if (el.textContent === "0") animateCount(el);
      });
    }, 2500);
  } else {
    counters.forEach((el) => animateCount(el));
  }

  // Static text stats (e.g. "20-50%") just fade via reveal, set final text immediately
  document.querySelectorAll("[data-count-text]").forEach((el) => {
    el.textContent = el.dataset.countText;
  });
})();
