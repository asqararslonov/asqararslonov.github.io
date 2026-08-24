(() => {
  "use strict";

  // Back-to-top button (USWDS handles nav + accordion natively)
  const backToTop = document.createElement("a");
  backToTop.href = "#top";
  backToTop.className = "back-to-top";
  backToTop.id = "backToTop";
  backToTop.setAttribute("aria-label", "Back to top");
  backToTop.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none"><path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  document.body.appendChild(backToTop);

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      backToTop.classList.toggle("visible", window.scrollY > window.innerHeight * 0.8);
      ticking = false;
    });
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Animated counters (big numbers)
  const counters = document.querySelectorAll("[data-count-to]");
  const animateCount = (el) => {
    const target = parseInt(el.dataset.countTo, 10);
    const suffix = el.dataset.countSuffix || "";
    const duration = 900;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const value = Math.round(target * p);
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
  } else {
    counters.forEach((el) => animateCount(el));
  }

  // Static text stats (e.g. "20-50%")
  document.querySelectorAll("[data-count-text]").forEach((el) => {
    el.textContent = el.dataset.countText;
  });
})();
