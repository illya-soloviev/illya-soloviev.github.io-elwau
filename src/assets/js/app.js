//= ../../../node_modules/xzoom/src/xzoom.js
//= vendor/slick.min.js

$(function() {
    var header = $('#header');
    var headerH = header.innerHeight();
    var scrollPos = $(window).scrollTop();

    var catalogBlock = $('#catalog');
    var navToggle = $('.jsNavToggle');
    var nav = $('#nav');

    var categoryFilterNav = $('[data-select]');
    var categoryFiltersDesktop = $('[data-filter]');

    var categoryFiltersMobile = $('[data-filter-mobile]');

    var filterButtonsDesktop = $('.jsFilterBtnDesktop');
    var filterButtonsMobile = $('.jsFilterBtnMobile');

    var dateFiltersMobile = $('.jsMbDateFilters');
    var priceFiltersMobile = $('.jsMbPriceFilters');

    //= components/fixed-header-popup.js
    //= components/catalog-show-mobile.js
    //= components/modal.js
    //= components/nav-show-mobile.js
    //= components/reg-tabs.js
    //= components/filters-mobile.js
    //= components/category-filters-nav.js
    //= components/filters.js
    //= components/filters-call.js
    //= components/product-tabs.js
    //= components/xzoom.js
    //= components/filters-mobile-modal.js
    //= components/show-hide-password.js
    //= components/slick-slider.js
    //= components/back-top.js

    $(window).on('load', function() {
        if( $(window).width() <= '991' ) {
            filterCategory('mobileFilter');
        } else {
            filterCategory('desktopFilter');
        }
    });
});