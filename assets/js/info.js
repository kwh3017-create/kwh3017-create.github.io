$(function () {
  'use strict';

  /* ── 헤더 서브메뉴 ── */
  $('.has-sub > a').attr({ 'aria-haspopup': 'true', 'aria-expanded': 'false' });
  $('.locale-btn').attr({ 'aria-haspopup': 'true', 'aria-expanded': 'false' });

  const setSubMenu = ($item, open) => {
    $item.children('a').attr('aria-expanded', String(open));
    $item.children('.sub-menu').stop(true, true)[open ? 'slideDown' : 'slideUp'](200);
  };

  const setLocaleMenu = ($item, open) => {
    $item.find('.locale-btn').attr('aria-expanded', String(open));
    $item.find('.locale-list').stop(true, true)[open ? 'slideDown' : 'slideUp'](150);
  };

  $('.has-sub').hover(
    function () { setSubMenu($(this), true); },
    function () { setSubMenu($(this), false); }
  ).on('focusin', function () {
    setSubMenu($(this), true);
  }).on('focusout', function (e) {
    if (!this.contains(e.relatedTarget)) setSubMenu($(this), false);
  });

  $('.locale').hover(
    function () { setLocaleMenu($(this), true); },
    function () { setLocaleMenu($(this), false); }
  ).on('focusin', function () {
    setLocaleMenu($(this), true);
  }).on('focusout', function (e) {
    if (!this.contains(e.relatedTarget)) setLocaleMenu($(this), false);
  });

  /* ── 모바일 드로어 ── */
  const $drawer = $('.mob-drawer');
  const $overlay = $('.mob-overlay');
  const $hamburger = $('.hamburger');
  const $hamburgerIcon = $('.hamburger i');

  const closeSubs = () => {
    $('.mob-sub').stop(true, true).slideUp(200);
    $('.mob-has-sub').removeClass('is-active');
  };

  const setDrawer = (open) => {
    $drawer.toggleClass('is-open', open);
    $overlay.toggle(open);
    $('body').toggleClass('mob-lock', open);
    $hamburger.attr('aria-expanded', String(open));
    $hamburgerIcon.toggleClass('fa-bars', !open).toggleClass('fa-xmark', open);
    if (!open) closeSubs();
  };

  $hamburger.attr('aria-expanded', 'false');
  $hamburger.on('click', () => setDrawer(!$drawer.hasClass('is-open')));
  $overlay.add('.mob-close').on('click', () => setDrawer(false));
  $(document).on('keydown', function (e) {
    if (/^F\d{1,2}$/.test(e.key)) return;
    if (e.key === 'Escape') setDrawer(false);
  });
  $(window).on('resize', () => $(window).width() > 540 && setDrawer(false));

  $(document).on('click', '.mob-has-sub > .mob-link', function (e) {
    e.preventDefault();
    const $parent = $(this).parent();
    const $sub = $(this).siblings('.mob-sub');
    $('.mob-has-sub').not($parent).removeClass('is-active');
    $('.mob-sub').not($sub).stop(true, true).slideUp(200);
    $parent.toggleClass('is-active');
    $sub.stop(true, true).slideToggle(220);
  });

  /* ── 탭 전환 ── */
  var currentTab = 'cpu';
  var tabAnimating = false;

  function switchTab(tabId) {
    if (tabId === currentTab || tabAnimating) return;

    var tabs = $('.tab-btn').map(function () { return $(this).data('tab'); }).get();
    var currentIndex = tabs.indexOf(currentTab);
    var nextIndex    = tabs.indexOf(tabId);
    var exitClass    = nextIndex > currentIndex ? 'tab-exit-left' : 'tab-exit-right';

    tabAnimating = true;
    var $currentPane = $('#tab-' + currentTab);

    // 버튼 상태 즉시 변경
    $('.tab-btn').removeClass('active');
    $('.tab-btn[data-tab="' + tabId + '"]').addClass('active');

    // 현재 탭 퇴장 애니메이션
    $currentPane.addClass(exitClass);

    setTimeout(function () {
      $currentPane.removeClass('active ' + exitClass);
      $('#tab-' + tabId).addClass('active');
      currentTab = tabId;
      tabAnimating = false;
      // 열려있던 FAQ 닫기
      $('.faq-q[aria-expanded="true"]').attr('aria-expanded', 'false').siblings('.faq-a').slideUp(200);
      // 탭 전환 후 AOS 위치 재계산
      AOS.refresh();
    }, 250);
  }

  $('.tab-btn').on('click', function () {
    var tabId = $(this).data('tab');
    switchTab(tabId);

    // URL 파라미터 업데이트 (히스토리 pushState)
    if (history.pushState) {
      history.pushState(null, null, '?tab=' + tabId);
    }
  });

  // URL 파라미터로 초기 탭 결정
  function getUrlTab() {
    var params = new URLSearchParams(window.location.search);
    return params.get('tab');
  }

  var initialTab = getUrlTab();
  if (initialTab && $('#tab-' + initialTab).length) {
    switchTab(initialTab);
  }

  /* ── FAQ 아코디언 ── */
  $(document).on('click', '.faq-q', function () {
    var $btn = $(this);
    var $answer = $btn.siblings('.faq-a');
    var isExpanded = $btn.attr('aria-expanded') === 'true';

    // 같은 탭 안의 모든 FAQ 닫기
    var $parentList = $btn.closest('.faq-list');
    $parentList.find('.faq-q[aria-expanded="true"]').not($btn).attr('aria-expanded', 'false').siblings('.faq-a').slideUp(200);

    if (isExpanded) {
      $btn.attr('aria-expanded', 'false');
      $answer.slideUp(200);
    } else {
      $btn.attr('aria-expanded', 'true');
      $answer.slideDown(250);
    }
  });

  /* ── 헤더 스크롤 감지 ── */
  $(window).on('scroll', function () {
    var scrolled = $(this).scrollTop() > 50;
    $('.info-header').toggleClass('scrolled', scrolled);
    $('#scrollTop').toggleClass('visible', $(this).scrollTop() > 300);
  });
  $('#scrollTop').on('click', function () {
    $('html, body').animate({ scrollTop: 0 }, 300);
  });

});
