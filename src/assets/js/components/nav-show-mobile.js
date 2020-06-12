navToggle.on('click', function(event) {
    event.preventDefault();

    $this = $(this);

    if($this.hasClass('active')) {
        if($this.is('.jsPopup')) {
            $this.removeClass('active');
            $('body').removeClass('no-scroll');
            nav.removeClass('show');
            setTimeout(function() {
                nav.removeClass('fixed-popup');
            }, 300);
        } else {
            $this.removeClass('active');
            $('body').removeClass('no-scroll');
            nav.removeClass('show');
        }
    } else {
        if(catalogBlock.hasClass('show')) {
            catalogBlock.removeClass('show');
        }

        if($this.is('.jsPopup')) {
            $this.addClass('active');
            $('body').addClass('no-scroll');
            nav.addClass('fixed-popup');
            nav.addClass('show');
        } else {
            $this.addClass('active');
            $('body').addClass('no-scroll');
            nav.addClass('show');
        }
    }
});