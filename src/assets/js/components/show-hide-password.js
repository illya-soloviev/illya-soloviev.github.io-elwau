var passwordControl = $('.jsPasswordControl');

passwordControl.on('click', function(event) {
    event.preventDefault();

    var $this = $(this);
    var passwordInpSibling = $this.siblings('.jsPasswordInput');
    
    if( passwordInpSibling.attr('type') == 'password' ) {
        $this.addClass('view');
        passwordInpSibling.attr('type', 'text');
    } else {
        $this.removeClass('view');
        passwordInpSibling.attr('type', 'password');
    }
});