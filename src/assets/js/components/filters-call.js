filterButtonsDesktop.on('click', function(event) {
    event.preventDefault();

    filterButtonsDesktop.removeClass('applied');

    if($(this).is('.jsFilterPrice')) {
        $(this).toggleClass('sorted'); 
        $(this).addClass('applied');

        var $this = $(this);
        filterPrice($this);
    } else if($(this).is('.jsFilterDate')) {
        $(this).toggleClass('sorted');
        $(this).addClass('applied');

        var $this = $(this);
        filterDate($this);
    }
});