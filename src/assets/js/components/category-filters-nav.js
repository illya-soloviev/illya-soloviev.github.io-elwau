var filtersList = $('#filtersList');
var popupOpen = $('#listOpen');

popupOpen.on('click', function(event) {
    event.stopPropagation();

    filtersList.addClass('show');
});

$('body').on('click', function() {
    filtersList.removeClass('show');
});

filtersList.on('click', function(event) {
    event.stopPropagation();
});

$(window).on('scroll', function() {
    if( filtersList.hasClass('show') ) {
        filtersList.removeClass('show');
    }
});



categoryFilterNav.on('click', function(event) {
    event.preventDefault();

    $filterClicked = $(this);

    if( $filterClicked.hasClass('selected') ) {
        $filterClicked.removeClass('selected');

        var selectFilter = $filterClicked.data('select');

        categoryFiltersDesktop.each(function() {
            var $this = $(this);
    
            var filterValue = $this.data('filter');
           
            if( filterValue === selectFilter ) {
                $this.removeClass('show');
            }
        });
    } else {
        $filterClicked.addClass('selected');

        var selectFilter = $filterClicked.data('select');

        categoryFiltersDesktop.each(function() {
            var $this = $(this);
    
            var filterValue = $this.data('filter');
           
            if( filterValue === selectFilter ) {
                $this.addClass('show');
            }
        });
    }
    
    filterCategory('desktopFilter');
});