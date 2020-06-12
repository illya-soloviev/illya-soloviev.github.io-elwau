var carouselNewProducts = $('#carousel');

carouselNewProducts.slick({
    arrows: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 5000
});

$('#carousel-arrow-prev').on('click', function(event) {
    event.preventDefault();

    carouselNewProducts.slick('slickPrev');
});

$('#carousel-arrow-next').on('click', function(event) {
    event.preventDefault();

    carouselNewProducts.slick('slickNext');
});