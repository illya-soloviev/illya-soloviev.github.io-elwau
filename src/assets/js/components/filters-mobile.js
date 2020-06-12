var filterBtn = $('#categoryFilterBtn');

categoryFiltersMobile.on('click', function() {
    $(this).toggleClass('selected');
});

filterBtn.on('click', function() {
    var $this = $(this);

    var parentModal = $this.parents('.filters__modal');

    $(parentModal).find('.filters__modal-dialog').css({
        transfrom: 'scale(0)'
    });

    setTimeout(function() {
        $(parentModal).removeClass('show');
        $('body').removeClass('no-scroll');
    }, 200);

    filterCategory('mobileFilter');
});



dateFiltersMobile.on('click', function() {
    filterButtonsMobile.removeClass('applied');

    var $this = $(this);
    $this.addClass('applied');

    var parentModal = $this.parents('.filters__modal');

    $(parentModal).find('.filters__modal-dialog').css({
        transfrom: 'scale(0)'
    });

    setTimeout(function() {
        $(parentModal).removeClass('show');
        $('body').removeClass('no-scroll');
    }, 200);

    filterDate($this);
});

priceFiltersMobile.on('click', function() {
    filterButtonsMobile.removeClass('applied');

    var $this = $(this);
    $this.addClass('applied');

    var parentModal = $this.parents('.filters__modal');

    $(parentModal).find('.filters__modal-dialog').css({
        transfrom: 'scale(0)'
    });

    setTimeout(function() {
        $(parentModal).removeClass('show');
        $('body').removeClass('no-scroll');
    }, 200);

    filterPrice($this);
});