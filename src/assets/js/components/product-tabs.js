var productTabNav = $('[data-product-tab]');
var productContent = $('.jsProductTab');

productTabNav.on('click', function() {
    productTabNav.removeClass('active');
    $(this).addClass('active');

    var productTabItem = $(this).data('product-tab');

    productContent.removeClass('active');
    $(productTabItem).addClass('active');
});