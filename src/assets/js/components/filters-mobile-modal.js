var filterModalCall = $('[data-filter-modal]');
var filterModalClose = $('[data-filter-close]');

filterModalCall.on('click', function(event) {
    event.preventDefault();

    var filterModalId = $(this).data('filter-modal');

    $(filterModalId).addClass('show');
    $('body').addClass('no-scroll');

    setTimeout(function() {
        $(filterModalId).find('.filters__modal-dialog').css({
            transform: 'scale(1)'
        });
    }, 200);
});

filterModalClose.on('click', function(event) {
    event.preventDefault();

    var filterModalParent = $(this).parents('.filters__modal');
    
    $(filterModalParent).find('.filters__modal-dialog').css({
        transform: 'scale(0)'
    });

    setTimeout(function() {
        $(filterModalParent).removeClass('show');
        $('body').removeClass('no-scroll');
    }, 200);
});

$('.filters__modal').on('click', function() {
    var $this = $(this);

    $this.find('.filters__modal-dialog').css({
        transform: 'scale(0)'
    });

    setTimeout(function() {
        $this.removeClass('show');
        $('body').removeClass('no-scroll');
    }, 200);
});

$('.filters__modal-dialog').on('click', function(event) {
    event.stopPropagation();
});