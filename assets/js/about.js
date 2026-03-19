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

  /* ── 연혁 슬라이더 ── */
  var $track = $('#historyTrack');
  var currentIdx = 0;
  var $cols = $track.find('.history-year-col');
  var totalCols = $cols.length;

  function getVisibleCount() {
    if ($(window).width() <= 540) return 1;
    if ($(window).width() <= 768) return 2;
    return 3;
  }

  function updateHistory() {
    var vis = getVisibleCount();
    var maxIdx = Math.max(0, totalCols - vis);
    currentIdx = Math.min(currentIdx, maxIdx);

    if (vis >= totalCols) {
      $track.css('transform', 'translateX(0)');
      return;
    }

    var colWidth = $cols.eq(0).outerWidth(true);
    $track.css('transform', 'translateX(-' + (colWidth * currentIdx) + 'px)');
  }

  $('.history-prev').on('click', function () {
    if (currentIdx > 0) { currentIdx--; updateHistory(); }
  });
  $('.history-next').on('click', function () {
    var vis = getVisibleCount();
    if (currentIdx < totalCols - vis) { currentIdx++; updateHistory(); }
  });

  $(window).on('resize', updateHistory);

  /* ── 스크롤 탑 버튼 ── */
  $(window).on('scroll', function () {
    $('#scrollTop').toggleClass('visible', $(this).scrollTop() > 300);
  });
  $('#scrollTop').on('click', function () {
    $('html, body').animate({ scrollTop: 0 }, 300);
  });

});
