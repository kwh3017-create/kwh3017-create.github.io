$(function () {
  'use strict';

  /* ── 헤더 서브메뉴 ── */
  $('.menu-item.has-sub').on('mouseenter', function () {
    $(this).find('.sub-menu').show();
  }).on('mouseleave', function () {
    $(this).find('.sub-menu').hide();
  });

  /* ── 언어 드롭다운 ── */
  $('.locale').on('mouseenter', function () {
    $(this).find('.locale-list').stop(true, true).slideDown(150);
  }).on('mouseleave', function () {
    $(this).find('.locale-list').stop(true, true).slideUp(150);
  });

  /* ── 모바일 드로어 ── */
  function openDrawer() {
    $('.mob-drawer').addClass('is-open');
    $('.mob-overlay').show();
    $('body').addClass('mob-lock');
  }
  function closeDrawer() {
    $('.mob-drawer').removeClass('is-open');
    $('.mob-overlay').hide();
    $('body').removeClass('mob-lock');
  }

  $('.hamburger').on('click', openDrawer);
  $('.mob-close').on('click', closeDrawer);
  $('.mob-overlay').on('click', closeDrawer);

  $('.mob-has-sub .mob-link').on('click', function (e) {
    e.preventDefault();
    $(this).closest('.mob-has-sub').toggleClass('is-active');
    $(this).siblings('.mob-sub').toggle();
  });

  /* ── 탭 전환 ── */
  function switchTab(tabId) {
    $('.tab-btn').removeClass('active');
    $('.tab-pane').removeClass('active');

    $('.tab-btn[data-tab="' + tabId + '"]').addClass('active');
    $('#tab-' + tabId).addClass('active');

    // 열려있던 FAQ 닫기
    $('.faq-q[aria-expanded="true"]').attr('aria-expanded', 'false').siblings('.faq-a').slideUp(200);
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

  /* ── 스크롤 탑 버튼 ── */
  $(window).on('scroll', function () {
    $('#scrollTop').toggleClass('visible', $(this).scrollTop() > 300);
  });
  $('#scrollTop').on('click', function () {
    $('html, body').animate({ scrollTop: 0 }, 300);
  });

});
