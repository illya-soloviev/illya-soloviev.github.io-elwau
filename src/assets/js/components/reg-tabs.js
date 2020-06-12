var regTabNav = $('[data-reg-tab]');
var regTabContent = $('.jsRegTab');

regTabNav.on('click', function() {
    regTabNav.removeClass('active');
    $(this).addClass('active');

    var regTabItem = $(this).data('reg-tab');

    regTabContent.removeClass('active');
    $(regTabItem).addClass('active');
});