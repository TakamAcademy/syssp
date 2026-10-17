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
    document.querySelectorAll("[data-bn][data-en]").forEach(el => { const value = el.dataset[lang]; if (value === undefined) return; const label = el.querySelector(".syssp-nav-label"); if (label) label.innerHTML = value; else el.innerHTML = value; });
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
  document.querySelectorAll("[data-event-open]").forEach(button => button.addEventListener("click", event => { event.preventDefault(); openModal(button); }));
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
  const routeSections = Array.from(document.querySelectorAll("[data-route-page]"));
  const validRoutes = new Set(routeSections.map(section => section.dataset.routePage));
  const routeTitles = {
    home:"প্রথম পাতা", about:"আমাদের সম্পর্কে", activities:"কার্যক্রম", events:"ইভেন্ট", blog:"ব্লগ",
    team:"আমাদের টিম", gallery:"গ্যালারি", notices:"নোটিশ", donate:"সহযোগিতা করুন",
    contact:"যোগাযোগ", mission:"লক্ষ্য ও আদর্শ", join:"সদস্য নিবন্ধন", accounts:"আয়-ব্যয়ের হিসাব", blood:"রক্তদান"
  };
  let activeRoute = "";
  // Manage scroll ourselves so back navigation restores the exact home section.
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  let historyIndex = Number(history.state?.sysspIndex ?? 0);
  if (!history.state?.sysspRouter) {
    history.replaceState({sysspRouter:true, sysspIndex:historyIndex, sysspScrollY:window.scrollY}, "", location.href);
  }
  let transitionDirection = "forward";

  function routeFromLocation() {
    const requested = decodeURIComponent(location.hash.replace(/^#/, "")) || "home";
    // A section may be an internal sub-section of a page.
    const direct = document.getElementById(requested);
    return validRoutes.has(requested) ? requested : (direct?.dataset?.routePage || "home");
  }
  function renderRoute(route, direction = "forward", restoreScrollY = null) {
    if (!validRoutes.has(route)) route = "home";
    if (route === activeRoute) {
      closeMenu();
      if (restoreScrollY !== null && Number.isFinite(Number(restoreScrollY))) {
        requestAnimationFrame(() => window.scrollTo({top:Math.max(0, Number(restoreScrollY)), left:0, behavior:"instant"}));
      }
      return;
    }
    activeRoute = route;
    closeMenu();
    // The blood donor database belongs only to the home page. Keep it hidden
    // when navigating to any other menu page, even if it was opened previously.
    const bloodDatabase = document.getElementById("blood-donor-database");
    if (bloodDatabase && route !== "home") bloodDatabase.hidden = true;
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
    // Forward navigation always opens the selected page at the top immediately.
    // Back/forward navigation restores the saved position of that history entry.
    if (restoreScrollY !== null && Number.isFinite(Number(restoreScrollY))) {
      requestAnimationFrame(() => window.scrollTo({top:Math.max(0, Number(restoreScrollY)), left:0, behavior:"instant"}));
    } else {
      window.scrollTo({top:0, left:0, behavior:"instant"});
    }
  }
  function navigateTo(route, push = true) {
    if (!validRoutes.has(route)) route = document.getElementById(route)?.dataset?.routePage || "home";
    if (push && route !== activeRoute) {
      // Save the current page's scroll position before creating the next history entry.
      const currentState = history.state || {};
      history.replaceState({...currentState, sysspRouter:true, sysspIndex:historyIndex, sysspScrollY:window.scrollY}, "", location.href);
      historyIndex += 1;
      history.pushState({sysspRouter:true, sysspIndex:historyIndex, sysspScrollY:0}, "", "#" + route);
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
    renderRoute(routeFromLocation(), transitionDirection, event.state?.sysspScrollY ?? 0);
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


/* book start */

(function () {
  "use strict";

  function initializeIslamicLibrary() {
    const library = document.getElementById("isl-library");

    if (!library || library.dataset.initialized === "true") {
      return;
    }

    const searchInput = library.querySelector("#islBookSearch");
    const categorySelect = library.querySelector("#islBookCategory");
    const cards = Array.from(
      library.querySelectorAll(".isl-book-card")
    );
    const resultCount = library.querySelector("#islResultCount");
    const emptyMessage = library.querySelector("#islEmptyMessage");

    if (!searchInput || !categorySelect || !resultCount || !emptyMessage) {
      return;
    }

    library.dataset.initialized = "true";

    function filterBooks() {
      const query = searchInput.value
        .trim()
        .toLocaleLowerCase("bn");

      const selectedCategory = categorySelect.value;
      let visibleCount = 0;

      cards.forEach(function (card) {
        const title = (card.dataset.title || "")
          .toLocaleLowerCase("bn");

        const author = (card.dataset.author || "")
          .toLocaleLowerCase("bn");

        const category = card.dataset.category || "";

        const matchesSearch =
          title.includes(query) || author.includes(query);

        const matchesCategory =
          selectedCategory === "all" ||
          category === selectedCategory;

        const isVisible = matchesSearch && matchesCategory;

        card.hidden = !isVisible;

        if (isVisible) {
          visibleCount++;
        }
      });

      resultCount.textContent =
        "মোট " + visibleCount + "টি বই পাওয়া গেছে";

      emptyMessage.hidden = visibleCount !== 0;
    }

    searchInput.addEventListener("input", filterBooks);
    categorySelect.addEventListener("change", filterBooks);

    filterBooks();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeIslamicLibrary
    );
  } else {
    initializeIslamicLibrary();
  }
})();

/* book end */


(function () {
  "use strict";

  function initDonationFund() {
    const section = document.querySelector(".syssp-fund-section");
    if (!section || section.dataset.initialized === "true") return;

    section.dataset.initialized = "true";

    const form = section.querySelector("#syssp-donation-form");
    const selectedFund = section.querySelector("#syssp-selected-fund");
    const amountInput = section.querySelector("#syssp-custom-amount");
    const nameInput = section.querySelector("#syssp-donor-name");
    const phoneInput = section.querySelector("#syssp-donor-phone");
    const message = section.querySelector("#syssp-fund-message");

    const fundNames = {
      general: "সাধারণ তহবিল",
      hasana: "কর্জে হাসানা",
      zakat: "জাকাত ফান্ড"
    };

    let currentFund = "general";

    section.querySelectorAll("[data-fund]").forEach(function (button) {
      button.addEventListener("click", function () {
        currentFund = button.dataset.fund;

        selectedFund.textContent =
          "অনুদানের খাত: " + (fundNames[currentFund] || "সাধারণ তহবিল");

        message.textContent = "";
        form.hidden = false;
        form.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    section.querySelectorAll("[data-amount]").forEach(function (button) {
      button.addEventListener("click", function () {
        amountInput.value = button.dataset.amount;

        section.querySelectorAll("[data-amount]").forEach(function (item) {
          item.classList.remove("is-selected");
          item.setAttribute("aria-pressed", "false");
        });

        button.classList.add("is-selected");
        button.setAttribute("aria-pressed", "true");
        message.textContent = "";
      });
    });

    amountInput.addEventListener("input", function () {
      section.querySelectorAll("[data-amount]").forEach(function (button) {
        const selected = button.dataset.amount === amountInput.value;
        button.classList.toggle("is-selected", selected);
        button.setAttribute("aria-pressed", String(selected));
      });
    });

    section.querySelector("#syssp-close-donation")
      .addEventListener("click", function () {
        form.hidden = true;
        message.textContent = "";
      });

    section.querySelector("#syssp-prepare-donation")
      .addEventListener("click", function () {
        const amount = Number(amountInput.value);

        if (!Number.isFinite(amount) || amount < 1) {
          message.textContent = "অনুগ্রহ করে সঠিক অনুদানের পরিমাণ লিখুন।";
          amountInput.focus();
          return;
        }

        if (!Number.isInteger(amount)) {
          message.textContent = "অনুদানের পরিমাণ পূর্ণ টাকায় লিখুন।";
          amountInput.focus();
          return;
        }

        const details = [
          "SYSSP অনুদানের তথ্য",
          "অনুদানের খাত: " + (fundNames[currentFund] || "সাধারণ তহবিল"),
          "পরিমাণ: ৳" + amount.toLocaleString("bn-BD"),
          "নাম: " + (nameInput.value.trim() || "উল্লেখ করা হয়নি"),
          "মোবাইল: " + (phoneInput.value.trim() || "উল্লেখ করা হয়নি"),
          "",
          "এটি অনুদানের তথ্যের সারাংশ; পেমেন্ট এখনো সম্পন্ন হয়নি।"
        ].join("\n");

        message.textContent = details;

        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(details).then(function () {
            message.textContent =
              details + "\n\nতথ্য কপি করা হয়েছে।";
          }).catch(function () {
            // কপি সুবিধা না থাকলেও তথ্য স্ক্রিনে দেখা যাবে।
          });
        }
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDonationFund);
  } else {
    initDonationFund();
  }
})();







(function () {
  "use strict";

  const app = document.getElementById("anfd-app");
  if (!app) return;

  const page = new URLSearchParams(window.location.search).get("page");

  const homeUrl = window.location.pathname;

  const demoPages = {
    "qarje-hasana": {
      title: "📘 কর্জে হাসানা ফান্ড",
      intro: "সুদমুক্ত ফেরতযোগ্য সহায়তার নমুনা হিসাব",
      description: "প্রয়োজন যাচাই করে সুদমুক্ত সহায়তা প্রদান এবং নির্ধারিত সময় অনুযায়ী ফেরত গ্রহণের একটি নমুনা হিসাব।",
      headers: ["ক্রমিক", "রেফারেন্স", "সহায়তার পরিমাণ", "ফেরত", "বকেয়া", "অবস্থা"],
      rows: [
        ["১", "KH-2025-001", "৳ ২০,০০০", "৳ ১০,০০০", "৳ ১০,০০০", "আংশিক ফেরত (ডেমো)"],
        ["২", "KH-2025-002", "৳ ১৫,০০০", "৳ ১৫,০০০", "৳ ০", "সম্পন্ন (ডেমো)"],
        ["৩", "KH-2025-003", "৳ ১০,০০০", "৳ ২,০০০", "৳ ৮,০০০", "চলমান (ডেমো)"]
      ]
    },

    "general-fund": {
      title: "📒 সাধারণ তহবিল",
      intro: "সাধারণ তহবিলের আয়-ব্যয়ের নমুনা সারসংক্ষেপ",
      description: "এককালীন অনুদান ও সাধারণ সহায়তা থেকে তহবিলে জমা এবং জনকল্যাণমূলক কাজে ব্যয়ের নমুনা প্রতিবেদন।",
      headers: ["তারিখ", "বিবরণ", "আয়", "ব্যয়", "স্থিতি"],
      rows: [
        ["০৫-০১-২০২৫", "ব্যক্তিগত অনুদান (ডেমো)", "৳ ১২,০০০", "—", "৳ ১২,০০০"],
        ["১২-০১-২০২৫", "অসহায় পরিবারকে সহায়তা (ডেমো)", "—", "৳ ৪,০০০", "৳ ৮,০০০"],
        ["২০-০১-২০২৫", "সাধারণ অনুদান (ডেমো)", "৳ ৮,০০০", "—", "৳ ১৬,০০০"],
        ["২৮-০১-২০২৫", "জরুরি চিকিৎসা সহায়তা (ডেমো)", "—", "৳ ৫,০০০", "৳ ১১,০০০"]
      ]
    },

    "project-income-expense": {
      title: "📁 প্রজেক্ট আয়-ব্যয়",
      intro: "প্রকল্পভিত্তিক আয়-ব্যয়ের নমুনা প্রতিবেদন",
      description: "উদাহরণ হিসেবে একটি শীতবস্ত্র বিতরণ প্রকল্পের সম্ভাব্য অনুদান, ব্যয় ও অবশিষ্ট অর্থ দেখানো হয়েছে। এটি প্রকৃত প্রকল্পের হিসাব নয়।",
      headers: ["তারিখ", "বিবরণ", "আয়", "ব্যয়", "স্থিতি"],
      rows: [
        ["০১-১২-২০২৫", "প্রকল্পের প্রাথমিক অনুদান (ডেমো)", "৳ ৫০,০০০", "—", "৳ ৫০,০০০"],
        ["০৩-১২-২০২৫", "শীতবস্ত্র ক্রয় (ডেমো)", "—", "৳ ২৮,০০০", "৳ ২২,০০০"],
        ["০৫-১২-২০২৫", "পরিবহন ও প্যাকেজিং (ডেমো)", "—", "৳ ৪,০০০", "৳ ১৮,০০০"],
        ["০৭-১২-২০২৫", "বিতরণ ও অন্যান্য ব্যয় (ডেমো)", "—", "৳ ৩,০০০", "৳ ১৫,০০০"]
      ]
    },

    "donor-members": {
      title: "📋 দাতা সদস্য তালিকা",
      intro: "দাতা সদস্যদের নমুনা তালিকা ও অবদান",
      description: "নিচের নাম, সদস্যের ধরন ও অবদানের পরিমাণ সম্পূর্ণ কাল্পনিক ডেমো তথ্য। প্রকৃত দাতার তথ্য প্রকাশের আগে সম্মতি ও হিসাব যাচাই নিশ্চিত করুন।",
      headers: ["ক্রমিক", "দাতার নাম (ডেমো)", "সদস্যের ধরন", "মাসিক/এককালীন অবদান", "অবস্থা"],
      rows: [
        ["১", "মো. আরিফ হাসান", "মাসিক দাতা সদস্য", "৳ ১,০০০ / মাস", "সক্রিয় (ডেমো)"],
        ["২", "মোছা. নুসরাত জাহান", "মাসিক দাতা সদস্য", "৳ ৫০০ / মাস", "সক্রিয় (ডেমো)"],
        ["৩", "মো. রফিকুল ইসলাম", "সাধারণ দাতা", "৳ ২,০০০ এককালীন", "নথিভুক্ত (ডেমো)"],
        ["৪", "মো. সাইফুল করিম", "প্রকল্প দাতা", "৳ ৩,০০০ এককালীন", "নথিভুক্ত (ডেমো)"]
      ]
    }
  };

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function renderDemo(data, target = app) {
    const headers = data.headers.map(function (heading) {
      return "<th>" + escapeHTML(heading) + "</th>";
    }).join("");

    const rows = data.rows.map(function (row) {
      return "<tr>" + row.map(function (cell) {
        return "<td>" + escapeHTML(cell) + "</td>";
      }).join("") + "</tr>";
    }).join("");

    target.innerHTML = `
      <div class="anfd-title">${escapeHTML(data.title)}</div>

      <div class="anfd-card">
        <span class="anfd-demo-label">ডেমো পেজ</span>
        <h3>${escapeHTML(data.intro)}</h3>
        <p>${escapeHTML(data.description)}</p>
        <p class="anfd-demo-note">
          সতর্কতা: নিচের তথ্যগুলো শুধু নমুনা। এগুলো প্রকৃত
          আর্থিক হিসাব, প্রকৃত দাতার তালিকা বা যাচাইকৃত তথ্য নয়।
        </p>
      </div>

      <div class="anfd-card">
        <h3>নমুনা তথ্য</h3>
        <div class="anfd-demo-table-wrap">
          <table class="anfd-demo-table">
            <thead><tr>${headers}</tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>

      <div class="anfd-card">
        <h3>পরবর্তী ধাপ</h3>
        <p>
          ওয়েবসাইটের প্রকৃত তথ্য, অনুমোদিত হিসাব এবং প্রয়োজনীয়
          আবেদন বা রিপোর্ট ব্যবস্থা পরে এখানে যুক্ত করা যাবে।
        </p>
      </div>

      ${target === app ? `<div class="anfd-buttons"><a class="anfd-button" href="${escapeHTML(homeUrl)}">← ডোনেশন তথ্য পেজে ফিরে যান</a></div>` : ""}
    `;
  }

  // ডোনেশন বিভাগের চারটি বাটন এখন স্ক্রলযোগ্য মডালে ডেমো তথ্য দেখায়।
  if (!page) {
    const modal = document.createElement("div");
    modal.className = "anfd-modal";
    modal.id = "anfd-demo-modal";
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `<div class="anfd-modal-backdrop" data-anfd-modal-close></div><section class="anfd-modal-panel" role="dialog" aria-modal="true" aria-label="ডোনেশন তথ্যের বিস্তারিত"><button type="button" class="anfd-modal-close" aria-label="বন্ধ করুন" data-anfd-modal-close>×</button><div class="anfd-modal-content" id="anfd-modal-content"></div></section>`;
    document.body.appendChild(modal);
    let lastTrigger = null;
    function closeDonationModal() {
      if (!modal.classList.contains("is-open")) return;
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("anfd-modal-open");
      lastTrigger?.focus();
    }
    document.querySelectorAll('.anfd-buttons a.anfd-button[href*="?page="]').forEach(function (button) {
      const key = new URL(button.href, window.location.href).searchParams.get("page");
      if (!demoPages[key]) return;
      button.addEventListener("click", function (event) {
        event.preventDefault();
        lastTrigger = button;
        renderDemo(demoPages[key], modal.querySelector("#anfd-modal-content"));
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("anfd-modal-open");
        modal.querySelector(".anfd-modal-close")?.focus();
      });
    });
    modal.querySelectorAll("[data-anfd-modal-close]").forEach(el => el.addEventListener("click", closeDonationModal));
    document.addEventListener("keydown", function (event) { if (event.key === "Escape") closeDonationModal(); });
  }

  if (page && demoPages[page]) {
    renderDemo(demoPages[page]);
  } else if (page) {
    app.innerHTML = `
      <div class="anfd-title">পেজ পাওয়া যায়নি</div>
      <div class="anfd-card">
        <p>দুঃখিত, এই পেজটি পাওয়া যায়নি।</p>
        <div class="anfd-buttons">
          <a class="anfd-button" href="${escapeHTML(homeUrl)}">
            ডোনেশন তথ্য পেজে ফিরে যান
          </a>
        </div>
      </div>
    `;
  }
})();





(function () {
  "use strict";

  function initSYSSPAnnouncement() {
    const sections = document.querySelectorAll(
      ".syssp-announcement:not([data-announcement-ready])"
    );

    sections.forEach(function (section) {
      section.setAttribute("data-announcement-ready", "true");

      let previouslyFocusedElement = null;

      function openModal(modal) {
        if (!modal) return;

        previouslyFocusedElement = document.activeElement;

        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";

        const closeButton = modal.querySelector(
          "[data-syssp-modal-close]"
        );

        if (closeButton) {
          closeButton.focus();
        }
      }

      function closeModal(modal) {
        if (!modal) return;

        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");

        const anyOpenModal = section.querySelector(
          ".syssp-announcement__modal.is-open"
        );

        if (!anyOpenModal) {
          document.body.style.overflow = "";
        }

        if (
          previouslyFocusedElement &&
          typeof previouslyFocusedElement.focus === "function"
        ) {
          previouslyFocusedElement.focus();
        }
      }

      section.addEventListener("click", function (event) {
        const openButton = event.target.closest(
          "[data-syssp-modal-open]"
        );

        if (openButton && section.contains(openButton)) {
          const modalId = openButton.getAttribute(
            "data-syssp-modal-open"
          );

          const modal = document.getElementById(modalId);

          if (modal && section.contains(modal)) {
            openModal(modal);
          }

          return;
        }

        const closeButton = event.target.closest(
          "[data-syssp-modal-close]"
        );

        if (closeButton && section.contains(closeButton)) {
          closeModal(closeButton.closest(
            ".syssp-announcement__modal"
          ));

          return;
        }

        if (
          event.target.classList.contains(
            "syssp-announcement__modal"
          )
        ) {
          closeModal(event.target);
        }
      });

      section.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
          const openModalElement = section.querySelector(
            ".syssp-announcement__modal.is-open"
          );

          if (openModalElement) {
            closeModal(openModalElement);
          }
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initSYSSPAnnouncement
    );
  } else {
    initSYSSPAnnouncement();
  }
})();
/* Book PDF modal behaviour - Paradise PDF in Google viewer + timeout fallback */
(() => {
  const modal = document.getElementById('islPdfModal');
  const viewer = document.getElementById('islPdfViewer');
  if (!modal || !viewer) return;
  const PDF_URL = 'https://ishbkgxmkywxmesxeqfk.supabase.co/storage/v1/object/public/Amar-boi.pdf/Paradise%20The%20Destination%20of%20the%20Heart.pdf';
  const loading = document.getElementById('islPdfLoading');
  const fallback = document.getElementById('islPdfFallback');
  let lastTrigger = null;
  let loadingTimer = null;
  function showFallbackMessage() {
    if (loading) {
      loading.classList.add('is-error');
      loading.innerHTML = '<strong>মডালে বইটি দেখানো যাচ্ছে না</strong><span>ইন্টারনেট বা PDF viewer-এর কারণে এমন হতে পারে। নিচের লিংকে চাপ দিয়ে বইটি নতুন ট্যাবে খুলুন।</span>';
    }
    if (fallback) fallback.hidden = false;
  }
  function openBookPdf(trigger) {
    lastTrigger = trigger;
    if (loading) {
      loading.classList.remove('is-hidden', 'is-error');
      loading.innerHTML = '<span class="isl-pdf-spinner" aria-hidden="true"></span><strong>বইটি লোড হচ্ছে…</strong><span>সাধারণত কয়েক সেকেন্ড লাগে। বেশি সময় লাগলে নিচের বিকল্প লিংক ব্যবহার করুন।</span>';
    }
    if (fallback) fallback.hidden = false;
    viewer.src = 'about:blank';
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('isl-pdf-modal-open');
    modal.querySelector('.isl-pdf-modal-close')?.focus();
    if (loadingTimer) window.clearTimeout(loadingTimer);
    // Google Docs viewer is often more reliable for inline PDFs than the phone browser's native PDF iframe.
    const viewerUrl = 'https://docs.google.com/gview?embedded=1&url=' + encodeURIComponent(PDF_URL);
    window.setTimeout(() => {
      if (!modal.classList.contains('is-open')) return;
      viewer.src = viewerUrl;
      loadingTimer = window.setTimeout(() => {
        if (modal.classList.contains('is-open') && loading && !loading.classList.contains('is-hidden')) showFallbackMessage();
      }, 15000);
    }, 100);
  }
  function closeBookPdf() {
    if (!modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('isl-pdf-modal-open');
    viewer.src = 'about:blank';
    if (loading) { loading.classList.remove('is-hidden', 'is-error'); loading.setAttribute('aria-hidden', 'true'); }
    if (fallback) fallback.hidden = false;
    if (loadingTimer) { window.clearTimeout(loadingTimer); loadingTimer = null; }
    lastTrigger?.focus?.();
  }
  viewer.addEventListener('load', () => {
    if (!modal.classList.contains('is-open') || !viewer.src || viewer.src.endsWith('about:blank')) return;
    // Hide spinner after the embedded viewer document has loaded; direct PDF link remains available.
    if (loading) { loading.classList.add('is-hidden'); loading.classList.remove('is-error'); loading.setAttribute('aria-hidden', 'true'); }
    if (loadingTimer) { window.clearTimeout(loadingTimer); loadingTimer = null; }
    if (fallback) fallback.hidden = false;
  });
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-book-read]');
    if (trigger) { event.preventDefault(); openBookPdf(trigger); return; }
    if (event.target.closest('[data-book-modal-close]')) closeBookPdf();
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeBookPdf(); });
})();



/*-----blood-------*/

document.addEventListener("DOMContentLoaded", function () {
  const donorButton = document.querySelector(
    '.blood-home-button[href="#blood-donors"]'
  );

  const donorSection = document.getElementById("blood-donors");

  if (donorButton && donorSection) {
    donorButton.addEventListener("click", function (event) {
      event.preventDefault();

      donorSection.hidden = false;
      donorSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  }
});
/*---------end---------------*/

"use strict";

/* আন-নাসর ফাউন্ডেশন: রক্তদাতা ডেটাবেজ */

const bdInitialDonors = [
  {name:"Aharab Hasan Shayan",group:"A+",age:21,address:"পারচাবিলিয়া পূর্ব পাড়া"},
  {name:"Ahmed Nishad",group:"O+",age:25,address:"Faridgonj, Chandpur"},
  {name:"Al Amin",group:"AB+",age:20,address:"কলাদী"},
  {name:"Ali arman imon",group:"AB+",age:19,address:"Koladi"},
  {name:"Arif Islam",group:"O+",age:27,address:"কলাদী শ্রীরামপুর"},
  {name:"Ariful Islam",group:"A+",age:23,address:"Koladi Shrirampur"},
  {name:"Assadullah Niloy",group:"B+",age:22,address:"কলাদী কুলপাল্লা"},
  {name:"Fatema",group:"B+",age:19,address:"Koladi"},
  {name:"helal uddin",group:"B+",age:39,address:"koladi"},
  {name:"Istiaque Ahmed",group:"A+",age:20,address:"koladi,pabna"},
  {name:"Linkon ali",group:"O+",age:18,address:"Koladi"},
  {name:"Mahbub Imran",group:"O+",age:27,address:"Mohammadpur, Dhaka"},
  {name:"Md Halim Biswas",group:"A+",age:25,address:"Bijoyrampur"},
  {name:"Md Hasan Ahmed",group:"B+",age:22,address:"Koladi"},
  {name:"Md Iqramuzzaman Khan",group:"O+",age:19,address:"কলাদী বিজয়রামপুর"},
  {name:"MD MAHBUB ALAM",group:"O+",age:27,address:"Khilkhet, Dhaka"},
  {name:"Md Mehedy hasan",group:"B+",age:24,address:"Koladi sr rampur"},
  {name:"Md Mohidul Hasan Mamun",group:"O+",age:19,address:"Koladi"},
  {name:"Md Moin Khan",group:"B+",age:21,address:"Koladi, Pabna sodor Pabna"},
  {name:"Md Moudud Musfiq",group:"AB-",age:22,address:"Chinakhora, Sujanagar"},
  {name:"Md Mujahidur Rahman",group:"B+",age:18,address:"Koladi"},
  {name:"Md Murad Khan",group:"A+",age:19,address:"বুলবুলিয়া"},
  {name:"Md Naim Hossain",group:"A+",age:19,address:"Koladi"},
  {name:"MD NAYAN HOSSAIN",group:"O+",age:22,address:"Koladi Jamtola"},
  {name:"Md Niloy khan",group:"AB+",age:24,address:"Koladi bijoyrum pur"},
  {name:"Md Nirob Molla",group:"A+",age:21,address:"Koladi molla para"},
  {name:"MD Rakibul",group:"O+",age:20,address:"কলাদী শ্রীরামপুর"},
  {name:"Md Rakibul islam",group:"O+",age:32,address:"Koladi"},
  {name:"Md Rasel islam",group:"A+",age:21,address:"Koladi Bijoyrampur"},
  {name:"MD RIAD HOSSAIN",group:"A+",age:19,address:"কলাদী, শ্রীরামপুর"},
  {name:"Md Ridoy",group:"A+",age:17,address:"Katuleya"},
  {name:"Md Riyad Ahmed",group:"AB+",age:18,address:"কলাদী বিজয়রামপুর"},
  {name:"MD ROBIUL ISLAM",group:"B+",age:19,address:"চক কলাদী"},
  {name:"Md Roktim Hossain",group:"O+",age:27,address:"Koladi"},
  {name:"Md Sahadat Hosain Sagar",group:"B+",age:25,address:"Koladi"},
  {name:"Md Shakil Biswas",group:"A+",age:22,address:"Bijoyrampur"},
  {name:"MD SOHANUR RAHMAN",group:"B+",age:28,address:"Koladi jamtola"},
  {name:"Md Tamim Iqbal",group:"O+",age:20,address:"Koladi"},
  {name:"Md Tarikul Islam",group:"AB+",age:21,address:"Bijoyrampur"},
  {name:"Md Uzzal Ali Mridha",group:"A+",age:25,address:"Koladi"},
  {name:"MD. Linkon Ali",group:"O+",age:18,address:"Koladi Bijoyrampur"},
  {name:"MD. Abdul Momin",group:"O+",age:29,address:"Koladi"},
  {name:"MD. Abdullahil-Oaphy",group:"O+",age:27,address:"Noakhali"}
];

const BD_STORAGE_KEY = "annasr-modern-blood-donors-v1";
const BD_DEMO_PHONE = "01XXXXXXXXX";
const BD_VALID_GROUPS = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];

function bdLoadDonors() {
  try {
    const saved = localStorage.getItem(BD_STORAGE_KEY);

    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (error) {
    console.warn("রক্তদাতার সংরক্ষিত তথ্য পড়া যায়নি।", error);
  }

  return bdInitialDonors.map((donor, index) => ({
    ...donor,
    id: "demo-" + (index + 1),
    phone: BD_DEMO_PHONE
  }));
}

let bdDonors = bdLoadDonors();

function bdSaveDonors() {
  try {
    localStorage.setItem(BD_STORAGE_KEY, JSON.stringify(bdDonors));
    return true;
  } catch (error) {
    alert("তথ্য ব্রাউজারে সংরক্ষণ করা যায়নি।");
    return false;
  }
}

function bdElement(id) {
  return document.getElementById(id);
}

function bdInitials(name) {
  const words = String(name || "?").trim().split(/\s+/);
  return (
    words.length > 1
      ? words[0][0] + words[1][0]
      : words[0].slice(0, 2)
  ).toUpperCase();
}

function bdFilteredDonors() {
  const search = bdElement("bdSearchInput").value.trim().toLowerCase();
  const group = bdElement("bdGroupFilter").value;

  return bdDonors.filter(donor => {
    const content = [
      donor.name,
      donor.group,
      donor.age,
      donor.address,
      donor.phone || ""
    ].join(" ").toLowerCase();

    return (!search || content.includes(search)) &&
           (!group || donor.group === group);
  });
}

function bdRenderDonors() {
  const tbody = bdElement("bdDonorRows");
  if (!tbody) return;

  tbody.replaceChildren();

  const filtered = bdFilteredDonors();

  filtered.forEach((donor, index) => {
    const tr = document.createElement("tr");

    const serial = document.createElement("td");
    serial.textContent = String(index + 1);
    tr.appendChild(serial);

    const personCell = document.createElement("td");

    const avatar = document.createElement("span");
    avatar.className = "bd-avatar";
    avatar.textContent = bdInitials(donor.name);

    const name = document.createElement("span");
    name.textContent = donor.name;

    personCell.append(avatar, name);
    tr.appendChild(personCell);

    const groupCell = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = "bd-blood-badge";
    badge.textContent = donor.group;
    groupCell.appendChild(badge);
    tr.appendChild(groupCell);

    const ageCell = document.createElement("td");
    ageCell.textContent = String(donor.age);
    tr.appendChild(ageCell);

    const addressCell = document.createElement("td");
    addressCell.textContent = donor.address;
    tr.appendChild(addressCell);

    const phoneCell = document.createElement("td");
    phoneCell.textContent = donor.phone || BD_DEMO_PHONE;
    tr.appendChild(phoneCell);

    tbody.appendChild(tr);
  });

  if (filtered.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");

    td.colSpan = 6;
    td.className = "bd-empty";
    td.textContent = "কোনো রক্তদাতা পাওয়া যায়নি। অন্য নাম বা রক্তের গ্রুপ দিয়ে খুঁজুন।";

    tr.appendChild(td);
    tbody.appendChild(tr);
  }

  bdElement("bdTotalDonors").textContent = bdDonors.length;
  bdElement("bdBloodTypes").textContent =
    new Set(bdDonors.map(donor => donor.group)).size;
  bdElement("bdShownDonors").textContent = filtered.length;

  bdElement("bdResultSummary").textContent =
    "মোট " + bdDonors.length + " জনের মধ্যে " +
    filtered.length + " জন রক্তদাতা দেখানো হচ্ছে";
}

/* সার্চ এবং ফিল্টার */
bdElement("bdSearchInput").addEventListener("input", bdRenderDonors);
bdElement("bdGroupFilter").addEventListener("change", bdRenderDonors);

bdElement("bdResetSearch").addEventListener("click", () => {
  bdElement("bdSearchInput").value = "";
  bdElement("bdGroupFilter").value = "";
  bdRenderDonors();
});

/* মডাল */
function bdOpenModal(id) {
  const modal = bdElement(id);
  if (!modal) return;

  modal.classList.add("bd-show");
  document.body.style.overflow = "hidden";

  const input = modal.querySelector("input, select");
  if (input) input.focus();
}

function bdCloseModal(id) {
  const modal = bdElement(id);
  if (!modal) return;

  modal.classList.remove("bd-show");

  if (!document.querySelector("#blood-donor-database .bd-modal.bd-show")) {
    document.body.style.overflow = "";
  }
}

document.querySelectorAll("#blood-donor-database .bd-modal").forEach(modal => {
  modal.addEventListener("click", event => {
    if (event.target === modal) bdCloseModal(modal.id);
  });
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    document.querySelectorAll(
      "#blood-donor-database .bd-modal.bd-show"
    ).forEach(modal => bdCloseModal(modal.id));
  }
});

/* রক্তদাতা নিবন্ধন */
bdElement("bdRegisterForm").addEventListener("submit", event => {
  event.preventDefault();

  const donor = {
    id: "local-" + Date.now(),
    name: bdElement("bdDonorName").value.trim(),
    group: bdElement("bdDonorGroup").value,
    age: Number(bdElement("bdDonorAge").value),
    address: bdElement("bdDonorAddress").value.trim(),
    phone: bdElement("bdDonorPhone").value.trim()
  };

  if (
    !donor.name ||
    !BD_VALID_GROUPS.includes(donor.group) ||
    !donor.address ||
    !donor.phone
  ) {
    alert("সব প্রয়োজনীয় তথ্য সঠিকভাবে পূরণ করুন।");
    return;
  }

  if (!Number.isFinite(donor.age) || donor.age < 18 || donor.age > 100) {
    alert("নিবন্ধনের জন্য বয়স ১৮ থেকে ১০০ বছরের মধ্যে লিখুন।");
    return;
  }

  bdDonors.push(donor);

  if (!bdSaveDonors()) {
    bdDonors.pop();
    return;
  }

  event.target.reset();
  bdElement("bdSearchInput").value = "";
  bdElement("bdGroupFilter").value = "";

  bdRenderDonors();
  bdCloseModal("bdRegisterModal");

  alert("রক্তদাতার তথ্য এই ব্রাউজারে সংরক্ষণ হয়েছে।");
});

/* বর্তমান বছর */
bdElement("bdYear").textContent = new Date().getFullYear();

/* প্রথমবার তালিকা দেখানো */
bdRenderDonors();



const showBloodDonorsBtn = document.getElementById("showBloodDonors");
if (showBloodDonorsBtn) {
  showBloodDonorsBtn.addEventListener("click", function () {
    // হোম পেজের বাটন থেকে আলাদা রক্তদান পেজে নেভিগেট করবে।
    window.location.hash = "#blood";
  });
}


/*-------------------------------------------------------------------*/

(function () {
  "use strict";

  const kskpFinanceRoot = document.getElementById("kskp-finance-root");

  if (!kskpFinanceRoot) return;

  const kskpFinanceToggleButton =
    kskpFinanceRoot.querySelector("#kskp-finance-toggle-options");

  const kskpFinanceOptions =
    kskpFinanceRoot.querySelector("#kskp-finance-options");

  const kskpFinanceModal =
    kskpFinanceRoot.querySelector("#kskp-finance-modal");

  const kskpFinanceModalTitle =
    kskpFinanceRoot.querySelector("#kskp-finance-modal-title");

  const kskpFinanceModalContent =
    kskpFinanceRoot.querySelector("#kskp-finance-modal-content");

  const kskpFinanceCloseButton =
    kskpFinanceRoot.querySelector("#kskp-finance-close-modal");

  let kskpFinancePreviousFocus = null;

  kskpFinanceToggleButton.addEventListener("click", function () {
    const kskpFinanceIsOpen =
      kskpFinanceOptions.classList.toggle("kskp-finance-show");

    kskpFinanceToggleButton.setAttribute(
      "aria-expanded",
      String(kskpFinanceIsOpen)
    );

    kskpFinanceToggleButton.textContent = kskpFinanceIsOpen
      ? "হিসাবের বিভাগ বন্ধ করুন ↑"
      : "হিসাবের বিভাগ দেখুন ↓";
  });

  const kskpFinanceModalData = {
    income: {
      title: "আয়ের বিবরণ",
      content: `
        <span class="kskp-finance-demo-label">পরীক্ষামূলক ডেমো</span>
        <h4>সংগঠনের আয়ের তথ্য</h4>
        <p>সংগঠনের বিভিন্ন উৎস থেকে প্রাপ্ত আয়ের বিস্তারিত তথ্য এখানে দেখানো হবে।</p>

        <div class="kskp-finance-info-card">
          <strong>সদস্যদের অনুদান ও চাঁদা</strong>
          <p>সদস্যদের কাছ থেকে প্রাপ্ত অর্থের বিবরণ এখানে থাকবে।</p>
        </div>

        <div class="kskp-finance-info-card">
          <strong>ব্যক্তি ও প্রতিষ্ঠানের অনুদান</strong>
          <p>অনুদানদাতা, তারিখ ও প্রাপ্ত অর্থের তথ্য এখানে থাকবে।</p>
        </div>

        <div class="kskp-finance-info-card">
          <strong>অন্যান্য আয়</strong>
          <p>অন্যান্য আয়ের উৎস ও সংশ্লিষ্ট তথ্য এখানে যুক্ত করা যাবে।</p>
        </div>

        <h4>মোট আয়ের বিবরণ</h4>
        <p>নির্ধারিত সময়ের মোট আয় ও তারিখভিত্তিক হিসাব এখানে যুক্ত করা যাবে।</p>
      `
    },

    expense: {
      title: "ব্যয়ের বিবরণ",
      content: `
        <span class="kskp-finance-demo-label">পরীক্ষামূলক ডেমো</span>
        <h4>সংগঠনের ব্যয়ের তথ্য</h4>
        <p>সংগঠনের অর্থ কোন কোন খাতে ব্যয় হয়েছে, তার বিবরণ এখানে দেখানো হবে।</p>

        <div class="kskp-finance-info-card">
          <strong>প্রশাসনিক ব্যয়</strong>
          <p>অফিস পরিচালনা ও প্রশাসনিক খরচের বিবরণ।</p>
        </div>

        <div class="kskp-finance-info-card">
          <strong>কার্যক্রম পরিচালনার ব্যয়</strong>
          <p>সংগঠনের বিভিন্ন কার্যক্রম বাস্তবায়নের খরচ।</p>
        </div>

        <div class="kskp-finance-info-card">
          <strong>মানবিক ও সামাজিক কার্যক্রম</strong>
          <p>সহায়তা, ত্রাণ ও অন্যান্য সামাজিক উদ্যোগের ব্যয়।</p>
        </div>

        <h4>মোট ব্যয়ের বিবরণ</h4>
        <p>ব্যয়ের তারিখ, খাত, পরিমাণ ও প্রমাণপত্রের তথ্য এখানে যুক্ত করা যাবে।</p>
      `
    },

    report: {
      title: "আর্থিক প্রতিবেদন",
      content: `
        <span class="kskp-finance-demo-label">পরীক্ষামূলক ডেমো</span>
        <h4>আর্থিক প্রতিবেদন ও জবাবদিহিতা</h4>
        <p>নির্দিষ্ট সময়ের আয়-ব্যয়ের সারসংক্ষেপ ও অনুমোদিত প্রতিবেদন এখানে প্রকাশ করা হবে।</p>

        <div class="kskp-finance-info-card">
          <strong>মাসিক প্রতিবেদন</strong>
          <p>প্রতি মাসের আয়-ব্যয়ের সারসংক্ষেপ।</p>
        </div>

        <div class="kskp-finance-info-card">
          <strong>বার্ষিক প্রতিবেদন</strong>
          <p>বছরভিত্তিক আর্থিক বিবরণী ও সারসংক্ষেপ।</p>
        </div>

        <div class="kskp-finance-info-card">
          <strong>নিরীক্ষা ও যাচাই</strong>
          <p>প্রযোজ্য ক্ষেত্রে নিরীক্ষিত হিসাব ও অনুমোদিত নথি।</p>
        </div>

        <h4>প্রতিবেদন ও নথিপত্র</h4>
        <p>সংশ্লিষ্ট PDF ও বিস্তারিত প্রতিবেদন এখানে সংযুক্ত করা যাবে।</p>
      `
    }
  };

  function kskpFinanceOpenModal(kskpFinanceType) {
    const kskpFinanceData = kskpFinanceModalData[kskpFinanceType];

    if (!kskpFinanceData) return;

    kskpFinancePreviousFocus = document.activeElement;

    kskpFinanceModalTitle.textContent = kskpFinanceData.title;
    kskpFinanceModalContent.innerHTML = kskpFinanceData.content;

    kskpFinanceModal.classList.add("kskp-finance-show");
    kskpFinanceModal.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";
    kskpFinanceModalContent.scrollTop = 0;

    kskpFinanceCloseButton.focus();
  }

  function kskpFinanceCloseModal() {
    kskpFinanceModal.classList.remove("kskp-finance-show");
    kskpFinanceModal.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";

    if (
      kskpFinancePreviousFocus &&
      typeof kskpFinancePreviousFocus.focus === "function"
    ) {
      kskpFinancePreviousFocus.focus();
    }
  }

  kskpFinanceRoot
    .querySelectorAll("[data-kskp-finance-modal]")
    .forEach(function (kskpFinanceButton) {
      kskpFinanceButton.addEventListener("click", function () {
        const kskpFinanceType =
          kskpFinanceButton.getAttribute("data-kskp-finance-modal");

        kskpFinanceOpenModal(kskpFinanceType);
      });
    });

  kskpFinanceCloseButton.addEventListener(
    "click",
    kskpFinanceCloseModal
  );

  kskpFinanceModal.addEventListener("click", function (kskpFinanceEvent) {
    if (kskpFinanceEvent.target === kskpFinanceModal) {
      kskpFinanceCloseModal();
    }
  });

  document.addEventListener("keydown", function (kskpFinanceEvent) {
    if (
      kskpFinanceEvent.key === "Escape" &&
      kskpFinanceModal.classList.contains("kskp-finance-show")
    ) {
      kskpFinanceCloseModal();
    }
  });
})();
