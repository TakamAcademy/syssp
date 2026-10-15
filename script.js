/* SYSSP — all JavaScript behaviour in this single file */
(() => {
  "use strict";
  const toggle = document.querySelector(".syssp-menu-toggle");
  const nav = document.querySelector(".syssp-nav");
  const backdrop = document.querySelector(".syssp-menu-backdrop");
  function closeMenu(restoreFocus = false) {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.querySelector("b")?.replaceChildren(document.createTextNode("মেনু খুলুন"));
    nav.classList.remove("is-open");
    backdrop?.classList.remove("is-visible");
    document.body.classList.remove("syssp-menu-open");
    if (restoreFocus) toggle.focus();
  }
  function openMenu() {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", "true");
    toggle.querySelector("b")?.replaceChildren(document.createTextNode("মেনু বন্ধ করুন"));
    nav.classList.add("is-open");
    backdrop?.classList.add("is-visible");
    document.body.classList.add("syssp-menu-open");
  }
  toggle?.addEventListener("click", () => toggle.getAttribute("aria-expanded") === "true" ? closeMenu() : openMenu());
  backdrop?.addEventListener("click", () => closeMenu(true));
  nav?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => closeMenu()));
  document.addEventListener("click", event => {
    if (nav?.classList.contains("is-open") && !nav.contains(event.target) && !toggle?.contains(event.target)) closeMenu();
  });
  document.addEventListener("keydown", event => { if (event.key === "Escape") { closeMenu(true); closeModal(); } });
  window.addEventListener("resize", () => { if (window.innerWidth > 760) closeMenu(); });


  document.querySelectorAll("[data-current-year]").forEach(el => el.textContent = new Date().getFullYear());
  const langButton = document.querySelector(".syssp-lang-toggle");
  let currentLanguage = "bn";
  try { currentLanguage = localStorage.getItem("syssp-language") || "bn"; } catch (_) {}
  function setLanguage(lang) {
    currentLanguage = lang; document.documentElement.lang = lang;
    document.querySelectorAll("[data-bn][data-en]").forEach(el => { const value = el.dataset[lang]; if (value !== undefined) el.innerHTML = value; });
    if (langButton) langButton.textContent = lang === "bn" ? "বাংলা / EN" : "EN / বাংলা";
    try { localStorage.setItem("syssp-language", lang); } catch (_) {}
  }
  if (langButton) { setLanguage(currentLanguage); langButton.addEventListener("click", () => setLanguage(currentLanguage === "bn" ? "en" : "bn")); }

  function connectFilter(config) {
    const search = document.getElementById(config.searchId), select = document.getElementById(config.filterId), list = document.getElementById(config.listId);
    const count = document.getElementById(config.countId), empty = document.getElementById(config.emptyId);
    if (!search || !select || !list) return;
    const cards = Array.from(list.querySelectorAll(config.cardSelector));
    function apply() {
      const term = search.value.trim().toLocaleLowerCase(), category = select.value; let visible = 0;
      cards.forEach(card => { const haystack = ((card.dataset.search || "") + " " + card.textContent).toLocaleLowerCase(); const show = (!term || haystack.includes(term)) && (category === "all" || card.dataset.category === category); card.hidden = !show; if (show) visible++; });
      if (count) count.textContent = visible + "টি ফলাফল দেখানো হচ্ছে"; if (empty) empty.hidden = visible !== 0;
    }
    search.addEventListener("input", apply); select.addEventListener("change", apply); apply();
  }
  connectFilter({searchId:"syssp-activity-search",filterId:"syssp-activity-filter",listId:"syssp-activity-list",countId:"syssp-activity-count",emptyId:"syssp-activity-empty",cardSelector:".syssp-filter-card"});
  connectFilter({searchId:"syssp-event-search",filterId:"syssp-event-filter",listId:"syssp-event-list",countId:"syssp-event-count",emptyId:"syssp-event-empty",cardSelector:".syssp-filter-event"});

  const modal = document.getElementById("syssp-event-modal"); let lastTrigger = null;
  function openModal(button) {
    if (!modal) return; lastTrigger = button;
    const title = document.getElementById("syssp-modal-title"), category = document.getElementById("syssp-modal-category"), description = document.getElementById("syssp-modal-description");
    if (title) title.textContent = button.dataset.title || "ইভেন্টের বিস্তারিত";
    if (category) category.textContent = button.dataset.category || "ইভেন্ট";
    if (description) description.textContent = button.dataset.description || "";
    modal.classList.add("is-open"); modal.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; modal.querySelector(".syssp-modal-close")?.focus();
  }
  function closeModal() { if (!modal?.classList.contains("is-open")) return; modal.classList.remove("is-open"); modal.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; lastTrigger?.focus(); }
  document.querySelectorAll("[data-event-open]").forEach(button => button.addEventListener("click", () => openModal(button)));
  modal?.querySelectorAll("[data-modal-close]").forEach(el => el.addEventListener("click", closeModal));
  modal?.querySelector(".syssp-modal-close")?.addEventListener("click", closeModal);

  const form = document.getElementById("syssp-contact-form");
  form?.addEventListener("submit", event => {
    event.preventDefault(); if (!form.reportValidity()) return;
    const data = new FormData(form), subject = encodeURIComponent("SYSSP ওয়েবসাইট: " + data.get("topic"));
    const body = encodeURIComponent("নাম: " + data.get("name") + "\nইমেইল: " + data.get("email") + "\nবিষয়: " + data.get("topic") + "\n\nবার্তা:\n" + data.get("message"));
    const status = document.getElementById("syssp-form-status"); if (status) status.textContent = "আপনার ইমেইল অ্যাপে বার্তাটি প্রস্তুত করা হবে। পাঠানোর আগে তথ্য যাচাই করুন।";
    window.location.href = "mailto:info@syssp.org?subject=" + subject + "&body=" + body;
  });

  // Real page-view routing: each menu opens its own view while preserving browser history.
  const routeSections = Array.from(document.querySelectorAll("main > section[data-route-page]"));
  const validRoutes = new Set(routeSections.map(section => section.dataset.routePage));
  const routeTitles = {
    home:"প্রথম পাতা", about:"আমাদের সম্পর্কে", activities:"কার্যক্রম", events:"ইভেন্ট",
    team:"আমাদের টিম", gallery:"গ্যালারি", notices:"নোটিশ", donate:"সহযোগিতা করুন",
    contact:"যোগাযোগ", mission:"লক্ষ্য ও আদর্শ", join:"সদস্য নিবন্ধন", accounts:"আয়-ব্যয়ের হিসাব"
  };
  let activeRoute = "";
  let historyIndex = Number(history.state?.sysspIndex ?? 0);
  if (!history.state?.sysspRouter) {
    history.replaceState({sysspRouter:true, sysspIndex:historyIndex}, "", location.href);
  }
  let transitionDirection = "forward";

  function routeFromLocation() {
    const requested = decodeURIComponent(location.hash.replace(/^#/, "")) || "home";
    // A section may be an internal sub-section of a page.
    const direct = document.getElementById(requested);
    return validRoutes.has(requested) ? requested : (direct?.dataset?.routePage || "home");
  }
  function renderRoute(route, direction = "forward") {
    if (!validRoutes.has(route)) route = "home";
    if (route === activeRoute) { closeMenu(); return; }
    activeRoute = route;
    closeMenu();
    // Explicitly hide every page section first, then reveal only the selected route.
    // Using both the hidden attribute and a class prevents sections from other pages
    // (including the home hero/CTA) leaking above or below a selected single page.
    routeSections.forEach(section => {
      const visible = section.dataset.routePage === route;
      section.hidden = !visible;
      section.classList.toggle("syssp-route-hidden", !visible);
      section.setAttribute("aria-hidden", visible ? "false" : "true");
      if (visible) {
        section.classList.remove("syssp-page-transition", "syssp-page-back");
        void section.offsetWidth;
        section.classList.add("syssp-page-transition");
        if (direction === "back") section.classList.add("syssp-page-back");
      }
    });
    document.querySelectorAll(".syssp-nav a[href^='#']").forEach(link => {
      const linkRoute = link.getAttribute("href").slice(1);
      const routeOfLink = validRoutes.has(linkRoute) ? linkRoute : document.getElementById(linkRoute)?.dataset?.routePage;
      if (routeOfLink === route) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    document.title = (routeTitles[route] || "SYSSP") + " | স্মার্ট যুব সমাজ";
    window.scrollTo({top:0, behavior: "auto"});
  }
  function navigateTo(route, push = true) {
    if (!validRoutes.has(route)) route = document.getElementById(route)?.dataset?.routePage || "home";
    if (push && route !== activeRoute) {
      historyIndex += 1;
      history.pushState({sysspRouter:true, sysspIndex:historyIndex}, "", "#" + route);
      transitionDirection = "forward";
    }
    renderRoute(route, transitionDirection);
  }
  document.addEventListener("click", event => {
    const link = event.target.closest("a[href^='#']");
    if (!link || link.hasAttribute("data-modal-close")) return;
    const raw = decodeURIComponent(link.getAttribute("href").slice(1));
    if (!raw) return;
    const target = document.getElementById(raw);
    const route = validRoutes.has(raw) ? raw : target?.dataset?.routePage;
    if (!route) return;
    event.preventDefault();
    navigateTo(route, true);
  });
  window.addEventListener("popstate", event => {
    const nextIndex = Number(event.state?.sysspIndex ?? historyIndex - 1);
    transitionDirection = nextIndex < historyIndex ? "back" : "forward";
    historyIndex = nextIndex;
    renderRoute(routeFromLocation(), transitionDirection);
  });
  window.addEventListener("hashchange", () => {
    renderRoute(routeFromLocation(), "forward");
    closeMenu();
  });
  renderRoute(routeFromLocation(), "forward");

  const memberForm = document.getElementById("syssp-member-form");
  memberForm?.addEventListener("submit", event => {
    event.preventDefault();
    const status = document.getElementById("syssp-member-status");
    if (status) status.textContent = "ডেমো নিবন্ধন যাচাই হয়েছে। বাস্তব ডেটাবেস যুক্ত না থাকায় তথ্য সংরক্ষণ করা হয়নি।";
    memberForm.reset();
  });

  // Home-page image slider: four demo photos, dots, arrows and automatic rotation.
  const slider = document.getElementById("syssp-home-slider");
  if (slider) {
    const slides = Array.from(slider.querySelectorAll(".syssp-slide"));
    const dots = Array.from(slider.querySelectorAll(".syssp-slider-dots button"));
    const counter = slider.querySelector(".syssp-slider-counter");
    let slideIndex = 0, sliderTimer = null;
    function showSlide(nextIndex) {
      slideIndex = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, index) => {
        const active = index === slideIndex;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", active ? "false" : "true");
      });
      dots.forEach((dot, index) => {
        const active = index === slideIndex;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-pressed", active ? "true" : "false");
      });
      if (counter) counter.textContent = String(slideIndex + 1).padStart(2, "0") + " / " + String(slides.length).padStart(2, "0");
    }
    function stopSlider() { if (sliderTimer) window.clearInterval(sliderTimer); sliderTimer = null; }
    function startSlider() {
      stopSlider();
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) sliderTimer = window.setInterval(() => showSlide(slideIndex + 1), 5000);
    }
    slider.querySelector(".syssp-slider-prev")?.addEventListener("click", () => { showSlide(slideIndex - 1); startSlider(); });
    slider.querySelector(".syssp-slider-next")?.addEventListener("click", () => { showSlide(slideIndex + 1); startSlider(); });
    dots.forEach((dot, index) => dot.addEventListener("click", () => { showSlide(index); startSlider(); }));
    slider.addEventListener("mouseenter", stopSlider);
    slider.addEventListener("mouseleave", startSlider);
    slider.addEventListener("focusin", stopSlider);
    slider.addEventListener("focusout", event => { if (!slider.contains(event.relatedTarget)) startSlider(); });
    showSlide(0); startSlider();
  }

})();
