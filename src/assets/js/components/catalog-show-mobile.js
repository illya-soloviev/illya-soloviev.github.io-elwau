var catalogLink = $('.jsCatalogLink');
var catalogClose = $('#catalogClose');

$(catalogLink).on('click', function(event) {
    if(nav.hasClass('show') && navToggle.hasClass('active')) {
        nav.removeClass('show');
        navToggle.removeClass('active');
    }

    if($(this).is('.jsPopup')) {
        event.preventDefault();

        catalogBlock.addClass('fixed-popup');
        catalogBlock.addClass('show');
        $('body').addClass('no-scroll');
    } else {
        event.preventDefault();

        catalogBlock.removeClass('fixed-popup');
        catalogBlock.addClass('show');
        $('body').addClass('no-scroll');
    }
});

$(catalogClose).on('click', function(event) {
    event.preventDefault();

    catalogBlock.removeClass('show');
    $('body').removeClass('no-scroll');
});