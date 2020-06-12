var productsContainer = $('#productsContainer');
var products = $('.jsFilterItem');

function filterCategory(appliedFilter) {
    if( appliedFilter == 'desktopFilter' ) {
        var selectedCategories = [];
        var filtersLength = categoryFiltersDesktop.length;
        for(var i = 0; i < filtersLength; i++) {
            if( $(categoryFiltersDesktop[i]).hasClass('show') ) {
                selectedCategories.push($(categoryFiltersDesktop[i]).data('filter'));
            }
        }


        /* Для отображения выбранных фильтров и в mobile-версии. */
        categoryFiltersMobile.removeClass('selected');

        var categoryFiltersMobileLength = categoryFiltersMobile.length;
        for( var i = 0; i < categoryFiltersMobileLength; i++ ) {
            var valueMobileFilterCategory = $(categoryFiltersMobile[i]).data('filter-mobile');

            var arrLength = selectedCategories.length;
            for( var k = 0; k < arrLength; k++) {
                var valueDesktopFilterCategory = selectedCategories[k];

                if( valueMobileFilterCategory == valueDesktopFilterCategory ) {
                    $(categoryFiltersMobile[i]).addClass('selected');
                    break;
                }
            }
        }
    } else if( appliedFilter == 'mobileFilter' ) {
        var selectedCategories = [];
        var filtersLength = categoryFiltersMobile.length;
        for(var i = 0; i < filtersLength; i++) {
            if( $(categoryFiltersMobile[i]).hasClass('selected') ) {
                selectedCategories.push($(categoryFiltersMobile[i]).data('filter-mobile'));
            }
        }


        /* Для отображения выбранных фильтров и в desktop-версии. */
        categoryFiltersDesktop.removeClass('show');

        var categoryFiltersDesktopLength = categoryFiltersDesktop.length;
        for( var i = 0; i < categoryFiltersDesktopLength; i++ ) {
            var valueDesktopFilterCategory = $(categoryFiltersDesktop[i]).data('filter');

            var arrLength = selectedCategories.length;
            for( var k = 0; k < arrLength; k++ ) {
                var valueMobileFilterCategory = selectedCategories[k];

                if( valueDesktopFilterCategory == valueMobileFilterCategory ) {
                    $(categoryFiltersDesktop[i]).addClass('show');
                    break;
                }
            }
        }

        categoryFilterNav.removeClass('selected');

        var categoryFilterNavLength = categoryFilterNav.length;
        for( var i = 0; i < categoryFilterNavLength; i++ ) {
            var valueDesktopFilterNav = $(categoryFilterNav[i]).data('select');

            var arrLength = selectedCategories.length;
            for( var k = 0; k < arrLength; k++ ) {
                var valueMobileFilterCategory = selectedCategories[k];

                if( valueDesktopFilterNav == valueMobileFilterCategory ) {
                    $(categoryFilterNav[i]).addClass('selected');
                    break;
                }
            }
        }
    }

    var selectedCateogriesLength = selectedCategories.length;
    if( selectedCateogriesLength == 0 ) {
        products.addClass('hide');
    }

    var productsLength = products.length;
    for( var k = 0; k < productsLength; k++ ) {
        var productCat = $(products[k]).data('cat');
        
        for( var l = 0; l < selectedCateogriesLength; l++ ) {
            var cat = selectedCategories[l];

            if( productCat == cat ) {
                $(products[k]).removeClass('hide');
                break;
            } else {
                $(products[k]).addClass('hide');
            }
        }
    }

    /* После того как товары были отсортированы по категориям, запускаем сортировку
    либо по дате добавления, либо по стоимости. В зависимости от того, какой фильтр из них применен. */
    if( appliedFilter == 'desktopFilter' ) {
        filterButtonsDesktop.each(function() {
            if(  $(this).is('.jsFilterDate') && $(this).hasClass('applied') ) {
                var $this = $(this);
                filterDate($this);
            } else if( $(this).is('.jsFilterPrice') && $(this).hasClass('applied') ) {
                var $this = $(this);
                filterPrice($this);
            }
        });
    } else if( appliedFilter == 'mobileFilter' ) {
        filterButtonsMobile.each(function() {
            if( $(this).is('.jsMbDateFilters') && $(this).hasClass('applied') ) {
                var $this = $(this);
                filterDate($this);
            } else if( $(this).is('.jsMbPriceFilters') && $(this).hasClass('applied') ) {
                var $this = $(this);
                filterPrice($this);
            }
        });
    }
}



function filterDate($this) {
    var productsSortedOnCategories = [];
    var productsLength = products.length;
    for( var i = 0; i < productsLength; i++ ) {
        if( !$(products[i]).hasClass('hide') ) {
            productsSortedOnCategories.push(products[i]);
            $(products[i]).remove();
        }
    }

    var productsDateArray = [].slice.call(productsSortedOnCategories); // Создание настоящего массива из HTML коллекции.

    if( $this.hasClass('sorted') ) {
        sortProductsDateDescending();

        selectMobileFilterOption('date', 'desc');
    } else {
        sortProductsDateAscending();

        selectMobileFilterOption('date', 'asc');
    }

    function sortProductsDateAscending() {
        productsDateArray.sort(function( a, b ) {
            var firstProductAttrValueInArray = $(a).data('time').split('-');
            var fDateValueNumbType = [];
            for( var i = 0; i < 3; i++ ) {
                fDateValueNumbType.push(Number(firstProductAttrValueInArray[i]));
            }
            
            var secProductAttrValueInArray = $(b).data('time').split('-');
            var sDateValueNumbType = [];
            for( var i = 0; i < 3; i++ ) {
                sDateValueNumbType.push(Number(secProductAttrValueInArray[i]));
            }

            if( fDateValueNumbType[0] < sDateValueNumbType[0] ) return -1;
            if( fDateValueNumbType[0] > sDateValueNumbType[0] ) return 1;
            if( fDateValueNumbType[0] == sDateValueNumbType[0] ) {
                if( fDateValueNumbType[1] < sDateValueNumbType[1] ) return -1;
                if( fDateValueNumbType[1] > sDateValueNumbType[1] ) return 1;
                if( fDateValueNumbType[1] == sDateValueNumbType[1] ) {
                    if( fDateValueNumbType[2] < sDateValueNumbType[2] ) return -1;
                    if( fDateValueNumbType[2] > sDateValueNumbType[2] ) return 1;
                    if( fDateValueNumbType[2] == sDateValueNumbType[2] ) {
                        return 0;
                    }
                }
            }
        });
        
        $(productsContainer).append(productsDateArray);

        $('.jsFilterDate').attr('data-date-btn', 'desc');
    }

    function sortProductsDateDescending() {
        productsDateArray.sort(function( a, b ) {
            var firstProductAttrValueInArray = $(a).data('time').split('-');
            var fDateValueNumbType = [];
            for( var i = 0; i < 3; i++ ) {
                fDateValueNumbType.push(Number(firstProductAttrValueInArray[i]));
            }
            
            var secProductAttrValueInArray = $(b).data('time').split('-');
            var sDateValueNumbType = [];
            for( var i = 0; i < 3; i++ ) {
                sDateValueNumbType.push(Number(secProductAttrValueInArray[i]));
            }

            if( fDateValueNumbType[0] > sDateValueNumbType[0] ) return -1;
            if( fDateValueNumbType[0] < sDateValueNumbType[0] ) return 1;
            if( fDateValueNumbType[0] == sDateValueNumbType[0] ) {
                if( fDateValueNumbType[1] > sDateValueNumbType[1] ) return -1;
                if( fDateValueNumbType[1] < sDateValueNumbType[1] ) return 1;
                if( fDateValueNumbType[1] == sDateValueNumbType[1] ) {
                    if( fDateValueNumbType[2] > sDateValueNumbType[2] ) return -1;
                    if( fDateValueNumbType[2] < sDateValueNumbType[2] ) return 1;
                    if( fDateValueNumbType[2] == sDateValueNumbType[2] ) {
                        return 0;
                    }
                }
            }
        });

        $(productsContainer).append(productsDateArray);

        $('.jsFilterDate').attr('data-date-btn', 'asc');
    }

}



function filterPrice($this) {
    var productsSortedOnCategories = [];
    var productsLength = products.length;
    for( var i = 0; i < productsLength; i++ ) {
        if( !$(products[i]).hasClass('hide') ) {
            productsSortedOnCategories.push(products[i]);
            $(products[i]).remove();
        }
    } 

    var productsArray = [].slice.call(productsSortedOnCategories); // Создание настоящего массива из HTML коллекции.

    if( $this.hasClass('sorted') ) {
        sortProductsPriceDescending();

        selectMobileFilterOption('price', 'desc');
    } else {
        sortProductsPriceAscending();

        selectMobileFilterOption('price', 'asc');
    }

    function sortProductsPriceAscending() {
        productsArray.sort(function( a, b ) {
            return $(a).find('.jsPrice').data('price') - $(b).find('.jsPrice').data('price');
        });

        $(productsContainer).append(productsArray);

        $('.jsFilterPrice').attr('data-price-btn', 'desc');
    }
    
    function sortProductsPriceDescending() {
        productsArray.sort(function( a, b ) {
            return $(b).find('.jsPrice').data('price') - $(a).find('.jsPrice').data('price');
        });

        $(productsContainer).append(productsArray);

        $('.jsFilterPrice').attr('data-price-btn', 'asc');
    }
}



function selectMobileFilterOption(activatedFilter, value) {
    filterButtonsMobile.removeClass('selected');

    if( activatedFilter == 'date' ) {
        if( value == 'desc' ) {
            $('.jsMbDateDesc').addClass('selected');
        } else if ( value == 'asc' ) {
            $('.jsMbDateAsc').addClass('selected');
        }
    }else if( activatedFilter == 'price' ) {
        if( value == 'asc' ) {
            $('.jsMbPriceAsc').addClass('selected');
        } else if( value == 'desc' ) {
            $('.jsMbPriceDesc').addClass('selected');
        }
    }
}

