var modalCall = $('[data-modal]');
var modalClose = $('[data-close]');

modalCall.on('click', function(event) {
    event.preventDefault();

    var modalId = $(this).data('modal');

    $(modalId).addClass('show');
    $('body').addClass('no-scroll');

    setTimeout(function() {
        $(modalId).find('.modal__dialog').css({
            transform: "scale(1)"
        });
    }, 200);
});

modalClose.on('click', function(event) {
    event.preventDefault();

    var modalParent = $(this).parents('.modal');

    modalParent.find('.modal__dialog').css({
        transform: "scale(0)"
    });

    setTimeout(function() {
        modalParent.removeClass('show');
        $('body').removeClass('no-scroll');
    }, 200);
});

$('.modal').on('click', function() {
    var $this = $(this);

    $this.find('.modal__dialog').css({
        transform: "scale(0)"
    });

    setTimeout(function() {
        $this.removeClass('show');
        $('body').removeClass('no-scroll');
    }, 200);
});

$('.modal__dialog').on('click', function(event) {
    event.stopPropagation();
});
