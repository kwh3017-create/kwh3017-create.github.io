$(function () {
  const initGnbHover = () => {
    $(".has-sub").hover(
      function () { $(this).children(".sub-menu").stop(true, true).slideDown(200); },
      function () { $(this).children(".sub-menu").stop(true, true).slideUp(200); }
    );

    $(".locale").hover(
      function () { $(this).find(".locale-list").stop(true, true).slideDown(150); },
      function () { $(this).find(".locale-list").stop(true, true).slideUp(150); }
    );
  };

  const initMainSlide = () => {
    const $slide = $(".slide");
    const $track = $(".slide-track");
    const len = $(".slide-container").length;

    if (!$slide.length || !$track.length || len <= 1) return;

    let idx = 0;
    let timer = null;

    const moveTo = (n) => {
      idx = (n + len) % len;
      $track.css("transform", `translateX(-${idx * 100}%)`);
    };

    const setAuto = (on) => {
      clearInterval(timer);
      if (on) timer = setInterval(() => moveTo(idx + 1), 4000);
    };

    $(".slide-nav.next").on("click", () => moveTo(idx + 1));
    $(".slide-nav.prev").on("click", () => moveTo(idx - 1));

    $slide.hover(() => setAuto(false), () => setAuto(true));
    setAuto(true);
  };

  const initMobileDrawer = () => {
    const $drawer = $(".mob-drawer");
    const $overlay = $(".mob-overlay");
    const $hamburger = $(".hamburger");
    const $hamburgerIcon = $(".hamburger i");

    if (!$drawer.length || !$hamburger.length) return;

    const closeSubs = () => {
      $(".mob-sub").stop(true, true).slideUp(200);
      $(".mob-has-sub").removeClass("is-active");
    };

    const setDrawer = (open) => {
      $drawer.toggleClass("is-open", open);
      $overlay.toggle(open);
      $("body").toggleClass("mob-lock", open);
      $hamburgerIcon.toggleClass("fa-bars", !open).toggleClass("fa-xmark", open);
      if (!open) closeSubs();
    };

    $hamburger.on("click", () => setDrawer(true));
    $overlay.add(".mob-close").on("click", () => setDrawer(false));
    $(document).on("keydown", (e) => e.key === "Escape" && setDrawer(false));
    $(window).on("resize", () => $(window).width() > 540 && setDrawer(false));

    $(document).on("click", ".mob-has-sub > .mob-link", function (e) {
      e.preventDefault();

      const $parent = $(this).parent();
      const $sub = $(this).siblings(".mob-sub");

      $(".mob-has-sub").not($parent).removeClass("is-active");
      $(".mob-sub").not($sub).stop(true, true).slideUp(200);

      $parent.toggleClass("is-active");
      $sub.stop(true, true).slideToggle(220);
    });
  };

  const getFlexGap = (el) => {
    const st = window.getComputedStyle(el);
    const g = parseFloat(st.columnGap || st.gap || "0");
    return Number.isFinite(g) ? g : 0;
  };

  const createSeamlessSlider = ({
    $track,
    itemSelector,
    $prev,
    $next,
    duration = 550,
    interval = 0,
    $hoverArea = null,
  }) => {
    if (!$track.length || !$prev.length || !$next.length) return null;

    const $items = () => $track.children(itemSelector);
    let moving = false;
    let timer = null;

    const setTransition = (on) => {
      $track.css("transition", on ? `transform ${duration}ms ease` : "none");
    };

    const stepPx = () => {
      const $first = $items().first();
      if (!$first.length) return 0;
      const gap = getFlexGap($track[0]);
      return $first.outerWidth() + gap;
    };

    const next = () => {
      if (moving || $items().length <= 1) return;
      moving = true;

      const d = stepPx();
      if (!d) { moving = false; return; }

      setTransition(true);
      $track.css("transform", `translateX(-${d}px)`);

      $track.one("transitionend webkitTransitionEnd", function () {
        $items().first().appendTo($track);

        setTransition(false);
        $track.css("transform", "translateX(0)");
        $track[0].offsetHeight;
        setTransition(true);

        moving = false;
      });
    };

    const prev = () => {
      if (moving || $items().length <= 1) return;
      moving = true;

      const d = stepPx();
      if (!d) { moving = false; return; }

      $items().last().prependTo($track);

      setTransition(false);
      $track.css("transform", `translateX(-${d}px)`);
      $track[0].offsetHeight;

      setTransition(true);
      $track.css("transform", "translateX(0)");

      $track.one("transitionend webkitTransitionEnd", function () {
        moving = false;
      });
    };

    const setAuto = (on) => {
      clearInterval(timer);
      if (on && interval > 0) timer = setInterval(next, interval);
    };

    $next.off("click").on("click", () => { setAuto(false); next(); setAuto(true); });
    $prev.off("click").on("click", () => { setAuto(false); prev(); setAuto(true); });

    if ($hoverArea && $hoverArea.length) {
      $hoverArea.hover(() => setAuto(false), () => setAuto(true));
    }

    $(window).on("resize", () => {
      setTransition(false);
      $track.css("transform", "translateX(0)");
      $track[0].offsetHeight;
      setTransition(true);
    });

    setTransition(true);
    setAuto(true);

    return { next, prev, setAuto };
  };

  const initServiceSlider = () => {
    const $track = $(".service-track");
    const $prev = $(".service-left-btn");
    const $next = $(".service-right-btn");
    const $prog = $(".service-progress");
    const $ind = $(".service-indicator");

    if (!$track.length || !$prev.length || !$next.length) return;

    const $cards = () => $track.children(".service-card");
    const totalN = $cards().length;
    if (totalN <= 1) return;

    $cards().each(function (i) { $(this).attr("data-svc-idx", i); });

    const moveIndicator = () => {
      if (!$prog.length || !$ind.length || totalN <= 1) return;
      const cur = parseInt($cards().first().attr("data-svc-idx") || "0", 10);
      const maxX = Math.max(0, $prog.width() - $ind.outerWidth());
      const t = cur / Math.max(1, totalN - 1);
      $ind.css("transform", `translate(${maxX * t}px, -50%)`);
    };

    let moving = false;
    let timer = null;
    const duration = 650;

    const setTransition = (on) => {
      $track.css("transition", on ? `transform ${duration}ms ease` : "none");
    };

    const stepPx = () => {
      const $first = $cards().first();
      if (!$first.length) return 0;
      return $first.outerWidth() + getFlexGap($track[0]);
    };

    const next = () => {
      if (moving) return;
      moving = true;

      const d = stepPx();
      if (!d) { moving = false; return; }

      setTransition(true);
      $track.css("transform", `translateX(-${d}px)`);

      $track.one("transitionend webkitTransitionEnd", function () {
        $cards().first().appendTo($track);

        setTransition(false);
        $track.css("transform", "translateX(0)");
        $track[0].offsetHeight;
        setTransition(true);

        moveIndicator();
        moving = false;
      });
    };

    const prev = () => {
      if (moving) return;
      moving = true;

      const d = stepPx();
      if (!d) { moving = false; return; }

      $cards().last().prependTo($track);

      setTransition(false);
      $track.css("transform", `translateX(-${d}px)`);
      $track[0].offsetHeight;

      setTransition(true);
      $track.css("transform", "translateX(0)");

      $track.one("transitionend webkitTransitionEnd", function () {
        moveIndicator();
        moving = false;
      });
    };

    const setAuto = (on) => {
      clearInterval(timer);
      if (on) timer = setInterval(next, 3000);
    };

    $next.off("click").on("click", () => { setAuto(false); next(); setAuto(true); });
    $prev.off("click").on("click", () => { setAuto(false); prev(); setAuto(true); });
    $(".service-right").hover(() => setAuto(false), () => setAuto(true));

    $(window).on("resize", () => {
      setTransition(false);
      $track.css("transform", "translateX(0)");
      $track[0].offsetHeight;
      setTransition(true);
      moveIndicator();
    });

    setTransition(true);
    moveIndicator();
    setAuto(true);
  };

  const initPcOrderSlider = () => {
    createSeamlessSlider({
      $track: $(".pc-order-track"),
      itemSelector: ".pc-order-item",
      $prev: $(".pc-order-nav.prev"),
      $next: $(".pc-order-nav.next"),
      duration: 550,
      interval: 3500,
      $hoverArea: $(".pc-order-viewport"),
    });
  };

  const initReviewSlider = () => {
    createSeamlessSlider({
      $track: $(".review-track"),
      itemSelector: ".review-item",
      $prev: $(".review-btn.prev"),
      $next: $(".review-btn.next"),
      duration: 550,
      interval: 0,
      $hoverArea: null,
    });
  };


  const initProductPopup = () => {
    $(document).on("click", ".open-popup", function (e) {
      e.preventDefault();
      const productId = $(this).data("product");
      const $popup = $("#popup-" + productId);
      if ($popup.length) {
        $popup.css("display", "flex");
        $("body").addClass("mob-lock");
      }
    });


    $(document).on("click", ".close-btn", function () {
      $(this).closest(".popup").hide();
      $("body").removeClass("mob-lock");
    });

    $(document).on("click", ".popup", function (e) {
      if ($(e.target).hasClass("popup")) {
        $(this).hide();
        $("body").removeClass("mob-lock");
      }
    });

    $(document).on("keydown", function (e) {
      if (e.key === "Escape") {
        $(".popup:visible").hide();
        $("body").removeClass("mob-lock");
      }
    });

    $(document).on("click", ".spec-title", function () {
      const $item = $(this).closest(".spec-item");
      const $option = $(this).next(".spec-option");
      const isOpen = $item.hasClass("open");
      $item.closest(".spec-list").find(".spec-item.open").not($item)
        .removeClass("open").find(".spec-option").slideUp(180);
      if (isOpen) {
        $item.removeClass("open");
        $option.slideUp(180);
      } else {
        $item.addClass("open");
        $option.slideDown(180);
      }
    });
  };

  initGnbHover();
  initMainSlide();
  initMobileDrawer();
  initServiceSlider();
  initPcOrderSlider();
  initReviewSlider();
  initProductPopup();

  // 이벤트 Swiper
  var swiper = new Swiper(".eventSwiper", {
    slidesPerView: 4,
    spaceBetween: 20,
    grabCursor: true,
    breakpoints: {
      1280: { slidesPerView: 4 },
      1024: { slidesPerView: 4 },
      768:  { slidesPerView: 3 },
      540:  { slidesPerView: 2.5 },
      414:  { slidesPerView: 2.5 }
    }
  });

});