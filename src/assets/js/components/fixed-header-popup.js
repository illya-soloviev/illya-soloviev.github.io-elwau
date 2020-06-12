var headerPopup = $('#headerPopup');

function checkScroll( headerH, scrollPos ) {
    if( scrollPos > headerH ) {
        headerPopup.css('margin-top', '0');
    } else {
        headerPopup.css('margin-top', '-70px');
    }
}

checkScroll( headerH, scrollPos )

$(window).on('scroll resize', function() {
    headerH = header.innerHeight();
    scrollPos = $(window).scrollTop();

    checkScroll( headerH, scrollPos );
});

