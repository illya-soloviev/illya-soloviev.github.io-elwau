var backTop = $('#backTop');

function checkScrollForBackTop( headerH, scrollPos ) {
    if( scrollPos > headerH ) {
        backTop.addClass('show');
    } else {
        backTop.removeClass('show');
    }
}

checkScrollForBackTop( headerH, scrollPos );

$(window).on('scroll resize', function() {
    headerH = header.innerHeight();
    scrollPos = $(window).scrollTop();

    checkScrollForBackTop( headerH, scrollPos );
});


backTop.on('click', function(event) {
    event.preventDefault();

    $('html, body').animate({
        scrollTop: 0
    }, 300);
});