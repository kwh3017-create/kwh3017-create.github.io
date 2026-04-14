$(function () {
  const initGnbHover = () => {
    $(".has-sub > a").attr({
      "aria-haspopup": "true",
      "aria-expanded": "false",
    });

    $(".locale-btn").attr({
      "aria-haspopup": "true",
      "aria-expanded": "false",
    });

    const setSubMenu = ($item, open) => {
      $item.children("a").attr("aria-expanded", String(open));
      $item.children(".sub-menu").stop(true, true)[open ? "slideDown" : "slideUp"](200);
    };

    const setLocaleMenu = ($item, open) => {
      $item.find(".locale-btn").attr("aria-expanded", String(open));
      $item.find(".locale-list").stop(true, true)[open ? "slideDown" : "slideUp"](150);
    };

    $(".has-sub").hover(
      function () { setSubMenu($(this), true); },
      function () { setSubMenu($(this), false); }
    ).on("focusin", function () {
      setSubMenu($(this), true);
    }).on("focusout", function (e) {
      if (!this.contains(e.relatedTarget)) setSubMenu($(this), false);
    });

    $(".locale").hover(
      function () { setLocaleMenu($(this), true); },
      function () { setLocaleMenu($(this), false); }
    ).on("focusin", function () {
      setLocaleMenu($(this), true);
    }).on("focusout", function (e) {
      if (!this.contains(e.relatedTarget)) setLocaleMenu($(this), false);
    });
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
      $hamburger.attr("aria-expanded", String(open));
      $hamburgerIcon.toggleClass("fa-bars", !open).toggleClass("fa-xmark", open);
      if (!open) closeSubs();
    };

    $hamburger.attr("aria-expanded", "false");
    $hamburger.on("click", () => setDrawer(!$drawer.hasClass("is-open")));
    $overlay.add(".mob-close").on("click", () => setDrawer(false));
    $(document).on("keydown", function(e) {
      if (/^F\d{1,2}$/.test(e.key)) return; // F1~F12 통과
      if (e.key === "Escape") setDrawer(false);
    });
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

    const $origCards = $track.children(".service-card");
    const N = $origCards.length;
    if (N <= 1) return;

    // 앞뒤에 카드 복제본을 붙여 진짜 무한 루프 구현
    // 구조: [복제N장] [원본N장] [복제N장]
    $origCards.clone(true).appendTo($track);   // 뒤쪽 복제
    $origCards.clone(true).prependTo($track);  // 앞쪽 복제

    let currentIdx = N; // 원본 첫 번째 카드부터 시작
    let moving = false;
    let timer = null;
    const duration = 600;

    // currentIdx → 실제 원본 카드 번호 (0 ~ N-1)
    const realIdx = () => ((currentIdx - N) % N + N) % N;

    const moveIndicator = () => {
      if (!$prog.length || !$ind.length) return;
      const maxX = Math.max(0, $prog.width() - $ind.outerWidth());
      const t = realIdx() / Math.max(1, N - 1);
      $ind.css("transform", `translate(${maxX * t}px, -50%)`);
    };

    const stepPx = () => {
      const $first = $track.children(".service-card").first();
      if (!$first.length) return 0;
      return $first.outerWidth() + getFlexGap($track[0]);
    };

    const setTransition = (on) => {
      $track.css("transition", on ? `transform ${duration}ms cubic-bezier(.25,.46,.45,.94)` : "none");
    };

    const goTo = (idx, animate) => {
      setTransition(animate);
      $track.css("transform", `translateX(-${idx * stepPx()}px)`);
    };

    // 초기 위치 설정 (원본 첫 카드)
    goTo(currentIdx, false);
    moveIndicator();

    const next = () => {
      if (moving) return;
      moving = true;
      currentIdx++;
      goTo(currentIdx, true);
      moveIndicator();

      const finish = () => {
        $track.off("transitionend webkitTransitionEnd", finish);
        if (currentIdx >= N * 2) {
          currentIdx = N;
          goTo(currentIdx, false);
        }
        moving = false;
      };

      $track.one("transitionend webkitTransitionEnd", finish);
    };

    const prev = () => {
      if (moving) return;
      moving = true;
      currentIdx--;
      goTo(currentIdx, true);
      moveIndicator();

      const finish = () => {
        $track.off("transitionend webkitTransitionEnd", finish);
        if (currentIdx < N) {
          currentIdx = N * 2 - 1;
          goTo(currentIdx, false);
        }
        moving = false;
      };

      $track.one("transitionend webkitTransitionEnd", finish);
    };

    const setAuto = (on) => {
      clearInterval(timer);
      if (on) timer = setInterval(next, 2800);
    };

    $next.off("click").on("click", () => { setAuto(false); next(); setAuto(true); });
    $prev.off("click").on("click", () => { setAuto(false); prev(); setAuto(true); });
    $(".service-right").hover(() => setAuto(false), () => setAuto(true));

    $(window).on("resize", () => {
      goTo(currentIdx, false);
    });

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

  // =============================================
  // 팝업: 상품별 팝업 열기/닫기
  // =============================================
  const initProductPopup = () => {

    // "(+300,000)" 또는 "(300,000)" 에서 숫자만 추출
    const parseOptionPrice = (text) => {
      const match = String(text).match(/\(\+?([\d,]+)\)/);
      return match ? parseInt(match[1].replace(/,/g, ""), 10) : 0;
    };

    // "최적가 : 519,000원" 같은 텍스트에서 숫자 추출
    const parseLabelPrice = (text) => {
      const match = String(text).match(/([\d,]+)원/);
      return match ? parseInt(match[1].replace(/,/g, ""), 10) : 0;
    };

    const formatPrice = (value) => `${Number(value).toLocaleString("ko-KR")}원`;

    // 옵션 텍스트에서 "(+숫자)" 부분 제거해 라벨용 텍스트 반환
    const parseOptionLabel = (text) =>
      String(text).replace(/\s*\(\+?[\d,]+\)\s*$/, "").trim();

    // 팝업의 기본 가격(HTML 원본 기준)을 읽어 data에 저장
    const storeBasePrices = ($popup) => {
      const $price = $popup.find(".popup-price").first();
      const fullText = $price.text();
      // "최적가 : 519,000원" 과 "판매가(카드) : 579,000원" 두 숫자를 순서대로 추출
      const nums = [...fullText.matchAll(/([\d,]+)원/g)].map(m => parseInt(m[1].replace(/,/g, ""), 10));
      $popup.data("baseCash", nums[0] || 0);
      $popup.data("baseCard", nums[1] || 0);
    };

    const updatePopupPrice = ($popup) => {
      let optionTotal = 0;
      $popup.find(".spec-item").each(function () {
        optionTotal += Number($(this).data("selectedPrice") || 0);
      });

      const cash = Number($popup.data("baseCash") || 0) + optionTotal;
      const card = Number($popup.data("baseCard") || 0) + optionTotal;

      $popup.find(".popup-price").first().html(
        `최적가 : ${formatPrice(cash)}<strong>판매가(카드) : ${formatPrice(card)}</strong>`
      );
    };

    const updateSpecLabel = ($item, optionText) => {
      const $label = $item.find(".spec-label").first();
      const baseLabel = $item.data("baseLabel") || $label.text();
      const prefix = baseLabel.includes(":") ? `${baseLabel.split(":")[0]} :` : baseLabel;
      const cleanOption = parseOptionLabel(optionText);
      $label.text(cleanOption ? `${prefix} ${cleanOption}` : prefix);
    };

    // 팝업 열기 — 열 때마다 기본가격·선택상태 초기화
    $(document).on("click", ".open-popup", function (e) {
      e.preventDefault();
      const productId = $(this).data("product");
      const $popup = $("#popup-" + productId);
      if (!$popup.length) return;

      // 기본 가격 저장 (매번 HTML 원본에서 다시 읽기 위해 data 초기화)
      $popup.removeData("baseCash baseCard");
      storeBasePrices($popup);

      // 스펙 항목 초기화
      $popup.find(".spec-item").each(function () {
        const $item = $(this);
        // baseLabel이 없으면 현재 텍스트를 저장
        if (!$item.data("baseLabel")) {
          $item.data("baseLabel", $item.find(".spec-label").first().text());
        } else {
          // 라벨을 원래대로 복원
          $item.find(".spec-label").first().text($item.data("baseLabel"));
        }
        $item.data("selectedPrice", 0);
        $item.find(".spec-option button").removeClass("is-selected");
        $item.removeClass("open");
        $item.find(".spec-option").hide();
      });

      $popup.css("display", "flex");
      $("body").addClass("mob-lock");
    });

    // 팝업 닫기: 닫기 버튼
    $(document).on("click", ".close-btn", function () {
      $(this).closest(".popup").hide();
      $("body").removeClass("mob-lock");
    });

    // 팝업 닫기: 배경 클릭
    $(document).on("click", ".popup", function (e) {
      if ($(e.target).hasClass("popup")) {
        $(this).hide();
        $("body").removeClass("mob-lock");
      }
    });

    // 팝업 닫기: ESC 키
    $(document).on("keydown", function (e) {
      if (/^F\d{1,2}$/.test(e.key)) return; // F1~F12 통과
      if (e.key === "Escape") {
        $(".popup:visible").hide();
        $("body").removeClass("mob-lock");
      }
    });

    // 스펙 옵션 버튼 클릭 → 가격 업데이트
    $(document).on("click", ".spec-option button", function () {
      const $btn   = $(this);
      const $item  = $btn.closest(".spec-item");
      const $popup = $btn.closest(".popup");

      // 같은 항목 내 다른 버튼 선택 해제 후 현재 버튼 선택
      $item.find(".spec-option button").removeClass("is-selected");
      $btn.addClass("is-selected");

      // 버튼 텍스트에서 추가 금액 파싱
      const price = parseOptionPrice($btn.text());
      $item.data("selectedPrice", price);

      // 라벨 업데이트 + 전체 가격 합산
      updateSpecLabel($item, $btn.text());
      updatePopupPrice($popup);

      // 아코디언 닫기
      $item.removeClass("open");
      $item.find(".spec-option").slideUp(180);
    });

    // 스펙 옵션 아코디언
    $(document).on("click", ".spec-title", function () {
      const $item = $(this).closest(".spec-item");
      const $option = $(this).next(".spec-option");
      const isOpen = $item.hasClass("open");
      // 같은 팝업 내 다른 항목 닫기
      $item.closest(".spec-list").find(".spec-item.open").not($item)
        .removeClass("open").find(".spec-option").slideUp(180);
      // 현재 항목 토글
      if (isOpen) {
        $item.removeClass("open");
        $option.slideUp(180);
      } else {
        $item.addClass("open");
        $option.slideDown(180);
      }
    });
  };

  const initSectionSnap = () => {
    if (!window.gsap || !window.ScrollToPlugin) return;
    gsap.registerPlugin(ScrollToPlugin);

    const sections = gsap.utils.toArray(".fp-section");
    if (!sections.length) return;

    let isAnimating = false;
    let currentIndex = sections.findIndex((section) => section.offsetTop >= window.pageYOffset - 1);
    if (currentIndex < 0) currentIndex = 0;

    const scrollToSection = (index) => {
      index = Math.max(0, Math.min(sections.length - 1, index));
      if (isAnimating || index === currentIndex) return;
      isAnimating = true;
      currentIndex = index;
      gsap.to(window, {
        duration: 0.9,
        scrollTo: { y: sections[index], autoKill: false },
        ease: "power2.out",
        onComplete: () => { isAnimating = false; }
      });
    };

    const onWheel = (e) => {
      if (isAnimating) {
        e.preventDefault();
        return;
      }
      const delta = e.deltaY;
      if (Math.abs(delta) < 10) return;

      const currentSection = sections[currentIndex];
      const rect = currentSection.getBoundingClientRect();
      const atTop = rect.top >= -1;
      const atBottom = rect.bottom <= window.innerHeight + 1;

      if (delta > 0) {
        if (!atBottom || currentIndex >= sections.length - 1) return;
        e.preventDefault();
        scrollToSection(currentIndex + 1);
      } else {
        if (!atTop || currentIndex <= 0) return;
        e.preventDefault();
        scrollToSection(currentIndex - 1);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", () => {
      sections.forEach((section, i) => {
        if (section.offsetTop <= window.pageYOffset + 1) currentIndex = i;
      });
      ScrollTrigger.refresh();
    });
    window.addEventListener("scroll", () => {
      if (isAnimating) return;
      sections.forEach((section, i) => {
        const top = section.getBoundingClientRect().top;
        if (top >= -window.innerHeight / 2 && top <= window.innerHeight / 2) {
          currentIndex = i;
        }
      });
    });
  };

  initGnbHover();
  initMainSlide();
  initMobileDrawer();
  initServiceSlider();
  initPcOrderSlider();
  initReviewSlider();
  initProductPopup();
  initSectionSnap();

  // 리뷰 팝업
  $(document).on("click", ".open-review", function (e) {
    e.preventDefault();
    const reviewId = $(this).data("review");
    $("#review-popup-" + reviewId).css("display", "flex");
    $("body").addClass("mob-lock");
  });
  $(document).on("click", ".review-popup-close", function () {
    $(this).closest(".review-popup").hide();
    $("body").removeClass("mob-lock");
  });
  $(document).on("click", ".review-popup", function (e) {
    if ($(e.target).hasClass("review-popup")) {
      $(this).hide();
      $("body").removeClass("mob-lock");
    }
  });

  var swiper = new Swiper(".eventSwiper", {
    slidesPerView: 4,
    spaceBetween: 20,
    grabCursor: true,
    breakpoints: {
      1280: { slidesPerView: 4 },
      1024: { slidesPerView: 4 },
      768:  { slidesPerView: 3 },
      540:  { slidesPerView: 2.5 },
      414:  { slidesPerView: 2.5 },
      0:    { slidesPerView: 2 }
    }
  });

  $('.btn-report, .btn-block').on('click', function(){
    alert("회원전용입니다. 로그인해주세요.");
  });

  $(".contact-form").on("submit", function (e) {
    e.preventDefault();
    alert("문의 기능은 현재 준비 중입니다.");
  });

  /* ── 앵커 부드러운 스크롤 ── */
  $(document).on("click", 'a[href^="#"]', function (e) {
    var target = $(this).attr("href");
    if (target === "#") return;
    var $target = $(target);
    if (!$target.length) return;
    e.preventDefault();
    var headerH = $(".header").outerHeight() || 0;
    $("html, body").animate({ scrollTop: $target.offset().top - headerH }, 500, "swing");
  });

  /* Scroll-to-top + 헤더 스크롤 감지 */
  var $scrollTop = $("#scrollTop");
  $(window).on("scroll", function () {
    var st = $(this).scrollTop();
    $(".header").toggleClass("scrolled", st > 50);
    $scrollTop.toggleClass("visible", st > 300);
  });
  $scrollTop.on("click", function () {
    $("html, body").animate({ scrollTop: 0 }, 400);
  });

});