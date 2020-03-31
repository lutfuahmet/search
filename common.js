var searchAjaxCall = null;
var searchTimeout = null;
var searchPattern = "";
var ratingMini = null;
var ratingMiniTimeout = null;
var ajaxBoxDialog = null;
var loginDialog = null;
var searchResultCache = new Array();

String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
};

var sbody;
var opened;
var cont;

$(document).ready(function () {

  sbody = $("body");

  $(document).on("click", "a[name='search_keyword']", function () {
    $("#search input[name='search_keyword']").val($.trim($(this).text()));
    $("#search > .button-search").click();
  });

  /* Search */
  $('.button-search').bind('click', function () {
    triggerSearch();
  });
  $('#header input[name=\'search_keyword\']').bind('keydown', function (e) {
    if (e.keyCode == 13) {
      triggerSearch();
    }
  });

  function triggerSearch() {
    var detail_filter_checkbox = document.getElementById("detail-filter-checkbox");
    if (detail_filter_checkbox !== null) {
      if (!detail_filter_checkbox.checked) {
        initSearch();
        return;
      }
      var detail_filter_checkbox_data_attr = detail_filter_checkbox.getAttribute("data-filter");
      if (detail_filter_checkbox_data_attr == 'detail-filter-points-catalog') {
        initSearchPointsCatalog();
      } else if (detail_filter_checkbox_data_attr == 'detail-filter-publisher') {
        searchPublisherProducts();
      } else if (detail_filter_checkbox_data_attr == 'detail-filter-category') {
        initSearchCategory();
      } else {
        initSearch();
      }
    } else {
      initSearch();
    }
  }

  function initSearch() {
    url = $('base').attr('href') + 'index.php?route=product/search';
    var searchKeyword = $('input[name=\'search_keyword\']').attr('value');
    if (searchKeyword) {
      url += '&filter_name=' + encodeURIComponent(searchKeyword);
    }
    location = url;
  }

  function initSearchPointsCatalog() {
    url = $('base').attr('href') + 'index.php?route=product/search_points';
    var searchKeyword = $('input[name=\'search_keyword\']').attr('value');
    if (searchKeyword) {
      url += '&filter_name=' + encodeURIComponent(searchKeyword);
    }
    location = url;
  }

  function initSearchCategory() {
    var searchKeyword = $('input[name=\'search_keyword\']').attr('value');
    var categorySearchHref = $('#category_search_href').val();
    if (searchKeyword !== '') {
      window.location = categorySearchHref + '&filter_name_category=' + encodeURIComponent(searchKeyword);
    } else {
      window.location = categorySearchHref;
    }
  }

  function searchPublisherProducts() {
    var searchKeyword = $('input[name=\'search_keyword\']').attr('value');
    var listAllProductsHref = $('#list_all_products_href').val();
    if (searchKeyword != '') {
      window.location = listAllProductsHref + '&filter_name_publisher=' + encodeURIComponent(searchKeyword);
    } else {
      window.location = listAllProductsHref;
    }
  }

  function initAutoComplete() {
    var closeBtn = sbody.find(".close-button");
    cont = sbody.find(".search-panel-container");
    closeBtn.off("click").on("click",function () {
      cont.removeClass("goster");
    });
    $('#header input[name=\'search_keyword\']').off('keyup');
    sbody.find("#search-input").on("focus",function(){
      var $this = $(this);
      var searchKeyword = $this.val();
      if(searchKeyword.length < 2){
        opened = false;
        cont.removeClass("goster");
      }
    });
    sbody.find("#search-input").off("keyup").on("keyup", function(evt) {
      var $this = $(this);
      var searchKeyword = $this.val();
      if(searchKeyword.length < 2){
        opened = false;
        cont.removeClass("goster");
      }
      doSearch(searchKeyword);
    });
  }

  function doSearch(keyword) {

    //var url = 'https://www.kitapyurdu.com/search';
    var url = 'https://search.kitapyurdu.com/';

    $.ajax({
      url: url,
      //type: 'POST',
      dataType: 'json',
      data: { s: keyword },
      timeout: 2000,
      success: function(result) {
        if(result){
          AddResult(result.results);
        }
      },
      error: function(xmlhttprequest, textstatus, message) {
        fetchSearchResults(keyword);
      },
      done : function () {

      }
    });
  }

  function AddResult(result) {
    if(result.length < 1) return;
    var cont = sbody.find(".search-panel-container");
    var fastSearch = sbody.find("#search-panel-results");
    var out = "";
    out += "<ul>";
    for (var i = 0; i < result.length; i++) {
      var item = result[i];
      if (i > 20)break;
      var name = item.n.replaceAll("_1_","<i>");
      name = name.replaceAll("_2_","</i>");
      out += "<li class='fast-type-" + item.tr + " fast-type-multi'><a href='index.php?route=product/search&filter_name=" + item.fn + "'><span class='fast-name'>" + name + "</span></a></li>";

    }
    out += "</ul>";
    fastSearch.html(out);
    if(!cont.hasClass("goster"))cont.addClass("goster");
  }


  function fetchSearchResults(searchKeyword) {
    searchAjaxCall = $.ajax({
      url: 'index.php?route=common/search_keyword/autoComplete&search_keyword=' + encodeURIComponent(searchKeyword),
      dataType: 'html',
      complete: function () {
        $('#search-panel-results .wait').remove();
      },
      success: function (html) {
        if ($.trim(html)) {
          searchResultCache[searchKeyword] = html;
          if ($.trim(html) == "") {
            $('.search-panel-container').hide();
          }
          $('.search-panel-container').show();
          $('#search-panel-results').html(html);
        } else {
          $('.search-panel-container').hide();
        }
      },
      error: function (xhr, ajaxOptions, thrownError) {
        //console.log(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
      }
    });
  }

  initAutoComplete();
  checkClick();


  /* Library */
  $('#library > .heading').click(function () {
    $('#library').addClass('active');
    $('#sprite-library-icon').removeClass('sprite-library-icon');
    $('#sprite-library-icon').addClass('sprite-library-icon-selected');
    $('#sprite-library-arrow').addClass('sprite-cart-arrow-selected');
    $('#sprite-library-arrow').removeClass('sprite-cart-arrow');
  });
  /* Ajax Library */
  $(document).delegate('#library > .heading', 'click', function () {
    $(document).ajaxStart(function () {
      $('.content #library-content').hide();
      $('.content #waiting').show();
    }).ajaxStop(function () {
      $('.content #waiting').hide();
      $('.content #library-content').show();
    });

    $('#library').addClass('active');
    $('.content #library-content').load('index.php?route=module/library/content', function () {
    });
  });
  /* Ajax Cart */
  $(document).delegate('#cart > .heading', 'click', function () {
    $(document).ajaxStart(function () {
      $('#cart-content').hide();
      $('.content #waiting').show();
    }).ajaxStop(function () {
      $('.content #waiting').hide();
      $('#cart-content').show();
    });
    $('#cart').addClass('active');
    $('#cart').load('index.php?route=module/cart&clicked=true #cart > * ', function () {
    });
  });
  /*$('#cart > .heading').live('click', function() {
   $('#cart').addClass('active');

   $('#cart').load('index.php?route=module/cart #cart > *');

   });*/

  $('body').click(function (e) {
    if ($('#cart').hasClass('active') && $('#cart').find(e.target).length == 0) {
      $('#cart').removeClass('active');
    } else if ($('#library').hasClass('active') && $('#library').find(e.target).length == 0) {
      $('#library').removeClass('active');
      $('#sprite-library-icon').addClass('sprite-library-icon');
      $('#sprite-library-icon').removeClass('sprite-library-icon-selected');
      $('#sprite-library-arrow').removeClass('sprite-cart-arrow-selected');
      $('#sprite-library-arrow').addClass('sprite-cart-arrow');
    }
  });
  // BEGIN Product buttons and menus
  updateProductViews();
  // END Product buttons and menus

  // Sticky top menu
  $('#sticky-menu').sticky();
  $('.warning-sticky').sticky({topSpacing: 80});
  $('.notification-sticky').sticky({topSpacing: 80});
// if user resize the window, call the same function again
// to make sure the overlay fills the screen and dialogbox aligned to center
  $(window).resize(function () {
//only do it if the dialog box is not hidden
    if ($('.dialog-box').length > 0 && !$('.dialog-box').is(':hidden'))
      popupDialog()();
  });
// IE6 & IE7 Fixes
  if ($.browser.msie && ($.browser.version == 7 || $.browser.version == 6)) {
    $('.menu ul > li > a + div').each(function (index, element) {
      var columns = $(element).find('ul').length;
      $(element).css('width', (columns * 143) + 'px');
      $(element).find('ul').css('float', 'left');
    });
  }

// IE6 & IE7 Fixes
  if ($.browser.msie) {
    if ($.browser.version <= 6) {
      $('#column-left + #column-right + #content, #column-left + #content').css('margin-left', '195px');
      $('#column-right + #content').css('margin-right', '195px');
      $('.box-category ul li a.active + ul').css('display', 'block');
    }

    if ($.browser.version <= 7) {
      $('.menu ul li').bind('mouseenter', function () {
        $(this).addClass('active');
      });
      $('.menu ul li').bind('mouseleave', function () {
        $(this).removeClass('active');
      });
    }
  }

  $('.success img, .warning img, .attention img, .information img, .review-reply .close').live('click', function () {
    $(this).parent().fadeOut('slow', function () {
      $(this).remove();
      $('.sticky').sticky('updateHeight');
    });
  });


  // OPTIMIZATION FOR TOUCH
  if (("ontouchstart" in window)) {


// HOVER MENU
    $("body").on("mouseenter", ".product-grid li, .product-grid div", function (event) {
      $(event.currentTarget).find(".hover-menu").show();
      $(event.currentTarget).find(".notice").hide();
    });
    $("body").on("mouseleave", ".product-grid li, .product-grid div", function (event) {
      $(event.currentTarget).find(".hover-menu").hide();
      $(event.currentTarget).find(".notice").show();
    });

    // RATING
    ratingMini = new jBox('Tooltip', {
      id: 'rating-mini',
      trigger: 'touchstart', closeButton: 'box'
    }).setContent('');

    $("body").on("touchstart", "div.rating", function (event) {

      var target = event.currentTarget;
      // if cart is opened, then it will be closed
      $('#cart').removeClass('active');
      var itemId = $(target).attr('id');
      if (typeof (itemId) != "undefined") {
        ratingMini.ajax({
          url: 'index.php?route=product/product/rating',
          data: 'product_id=' + itemId.replace('rating-', '')
        }).open({
          attach: $(target),
          target: $(target)
        });
      }
    });


  } else {

//RATING
    ratingMini = new jBox('Tooltip', {id: 'rating-mini'}).setContent('');
    $("body").on("mouseenter", "div.rating", function (event) {

      var target = event.currentTarget;
      ratingMiniTimeout = setTimeout(function () {
        // if cart is opened, then it will be closed
        $('#cart').removeClass('active');
        var itemId = $(target).attr('id');
        if (typeof (itemId) != "undefined") {
          ratingMini.ajax({
            url: 'index.php?route=product/product/rating',
            data: 'product_id=' + itemId.replace('rating-', '')
          }).open({
            attach: $(target),
            target: $(target)
          });
        }
      }, 750);
    });
    $("body").on("mouseleave", "div.rating", function (event) {
      clearTimeout(ratingMiniTimeout);
      ratingMiniTimeout = setTimeout(function () {
        ratingMini.close();
      }, 300);
    });
    $("body").on("mouseenter", "#rating-mini", function (event) {
      clearTimeout(ratingMiniTimeout);
    });
    $("body").on("mouseleave", "#rating-mini", function (event) {
      ratingMini.close();
    });
    $("body").on("mouseenter", ".product-grid li, .product-grid div", function (event) {
      $(event.currentTarget).find(".hover-menu").show();
      $(event.currentTarget).find(".notice").hide();
    });
    $("body").on("mouseleave", ".product-grid li, .product-grid div", function (event) {
      $(event.currentTarget).find(".hover-menu").hide();
      $(event.currentTarget).find(".notice").show();
    });
  }

});

function checkClick() {
  $(document).on("click",function (evt) {
    if($(evt.target).closest(".search-panel-container").length === 0){
      cont.removeClass("goster");
    }
  });
}

function showLoginDialog() {
  var url = window.location;
  if (url.host === "www.kitapyurdu.com") {
    window.location = "https://" + url.host + "/index.php?route=account/login";
  } else {
    var location = url.pathname.startsWith("/test/") ? "/test/kitapyurdu" : "";
    location += "/index.php?route=account/login";
    window.location = location;
  }
}

function showAjaxBox(href, isFullSize, width, height, completeFunction, dialogId) {

  isFullSize = typeof isFullSize !== 'undefined' ? isFullSize : false;
  completeFunction = typeof completeFunction !== 'undefined' ? completeFunction : function () {
  };
  var maxWidth, maxHeight;

  if (typeof maxWidth === 'undefined' && typeof maxHeight === 'undefined') {
    if (isFullSize) {
      maxWidth = 'auto';
      maxHeight = 'auto';
    } else {
      maxWidth = '600px';
      maxHeight = '600px';
    }
  }

  if (typeof width === 'undefined' && typeof height === 'undefined'
    && typeof maxWidth === 'undefined' && typeof maxHeight === 'undefined') {

// For smaller screens
    if (screen.height <= 800) {
      if (!isFullSize) {
        width = 640;
        height = 'auto';
        maxWidth = 640;
        maxHeight = 400;
      } else {
        width = 'auto';
        height = 'auto';
        maxWidth = 'auto';
        maxHeight = 'auto';
      }
    } else {
      width = 'auto';
      height = 'auto'
      maxWidth = 960;
      maxHeight = 800;
    }
  }

  if (ajaxBoxDialog == null) {
    ajaxBoxDialog = new jBox('Modal', {
      width: width,
      height: height,
      maxWidth: maxWidth,
      maxHeight: maxHeight,
      reload: true,
      onOpen: completeFunction,
      ajax: {
        url: href,
      },
      onCloseComplete: function () {
        this.destroy();
        ajaxBoxDialog = null;
      }
    });
  } else {
    ajaxBoxDialog.ajax({
      url: href,
      reload: true
    });
  }

  if (typeof dialogId !== 'undefined') {
    ajaxBoxDialog.id = dialogId;
  }

  ajaxBoxDialog.open();

  return ajaxBoxDialog;
}

function toggleAllCheckboxes(containerElement, button) {
  $(containerElement).find(':checkbox').attr('checked', button.checked);
}

function updateProductViews() {
// dynamic color button generation
// ellipsification for items with an ellipsis
  $('.ellipsis').ellipsis(true);
  $('.hover-menu a').jBox('Tooltip', {
    id: 'hover-menu-tooltip',
    getContent: 'data-title',
    position: {
      x: 'center',
      y: 'bottom'
    }
  });
  $('.bestseller-rank .rank').jBox('Tooltip', {
    id: 'hover-menu-tooltip',
    getContent: 'data-title',
    position: {
      x: 'center',
      y: 'bottom'
    }
  });
  $('.product-grid .free-shipping img').jBox('Tooltip', {
    id: 'hover-menu-tooltip',
    getContent: 'alt',
    position: {
      x: 'center',
      y: 'bottom'
    }
  });
}


function resetSearchPanel() {
  if (searchAjaxCall) {
    searchAjaxCall.abort();
  }
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  $('.search-panel-container').hide();
  $('#search-panel-results').html('<span class="wait">&nbsp;<img src="catalog/view/theme/default/image/ajax-loader.gif" alt="" /></span>');
}

function getURLVar(urlVarName) {
  var urlHalves = String(document.location).toLowerCase().split('?');
  var urlVarValue = '';
  if (urlHalves[1]) {
    var urlVars = urlHalves[1].split('&');
    for (var i = 0; i <= (urlVars.length); i++) {
      if (urlVars[i]) {
        var urlVarPair = urlVars[i].split('=');
        if (urlVarPair[0] && urlVarPair[0] == urlVarName.toLowerCase()) {
          urlVarValue = urlVarPair[1];
        }
      }
    }
  }

  return urlVarValue;
}

function addToMyos(product_id) {
  $.ajax({
    url: 'index.php?route=product/myos/add',
    type: 'post',
    data: 'product_id=' + product_id,
    dataType: 'json',
    success: function (json) {
      $('.success, .warning, .attention, .information').remove();
      location.reload();
    }
  });
}

function delFrMyos(product_id) {
  $.ajax({
    url: 'index.php?route=product/myos/del',
    type: 'post',
    data: 'product_id=' + product_id,
    dataType: 'json',
    success: function (json) {
      $('.success, .warning, .attention, .information').remove();
      location.reload();
    }
  });
}

function showProductLoading(product_id) {
  $('#product-' + product_id).addClass('product-loading');
  $('#product-' + product_id).append('<span class="wait">&nbsp;<img src="catalog/view/theme/default/image/ajax-loader.gif" alt="" /></span>');
}

function hideProductLoading(product_id) {
  $('#product-' + product_id).removeClass('product-loading');
  $('#product-' + product_id + ' .wait').remove();
}


// callback success is added for nostalji
function addToCart(product_id, quantity, filter_points_catalog, callbackSuccess) {
  quantity = typeof (quantity) != 'undefined' ? quantity : 1;
  filter_points_catalog = typeof (filter_points_catalog) != 'undefined' ? filter_points_catalog : 'false';
  $.ajax({
    url: 'index.php?route=checkout/cart/add',
    type: 'post',
    data: 'product_id=' + product_id + '&quantity=' + quantity + '&filter_points_catalog=' + filter_points_catalog,
    dataType: 'json',
    beforeSend: function (xhr) {
      showProductLoading(product_id);
    },
    complete: function (xhr) {
      hideProductLoading(product_id);
    },
    success: function (json) {
      $('#customer-points').html(json['customer_points']);
      $('.success, .warning, .attention, .information, .error').remove();
      if (json['redirect']) {
        location = json['redirect'];
      }

      if (json['error']) {
        $('#notification').html('<div class="warning" style="display: none;">' + json['error'] + '<img src="catalog/view/theme/default/image/close.png" alt="" class="close" /></div>');
        $('.warning').fadeIn('slow');
      }

      if (json['success']) {
        $('#notification').html('<div class="success" style="display: none;">' + json['success'] + '<img src="catalog/view/theme/default/image/close.png" alt="" class="close" /></div>');
        $('.success').fadeIn('slow');

        updateCartCount(json['count']);

        addToCartSuccessAfter(product_id);

        if (typeof (callbackSuccess) !== 'undefined') {
          callbackSuccess();
        }
      }
    }
  });
}

function showNotificationMessage(notificationType, message) {
  $('#notification').html('<div class="' + notificationType + '" style="display: none;">' + message + '<img src="catalog/view/theme/default/image/close.png" alt="" class="close" /></div>');
  $('.' + notificationType).fadeIn('slow');
}

function updateCartCount(count) {
  $('#cart-items').html(count);
  $('#cart-items-text').html(count);

  if (count > 0) {
    $('#cart-items-text-container').show();
    $('#cart-items-empty').hide();
  } else {
    $('#cart-items-text-container').hide();
    $('#cart-items-empty').show();
  }
}

function addToCartSuccessAfter(product_id) {
  $('#product-' + product_id).find('.add-to-cart').hide();
  $('#product-' + product_id).find('.go-to-cart').show();
  $('#product-' + product_id).find('.notice').remove();
  $('#product-' + product_id).find('.in-basket').addClass('notice');

  if (!$('#product-' + product_id).find(".hover-menu").is(':visible')) {
    $('#product-' + product_id).find('.in-basket').show();
  }

  $('.product-info #button-cart').parent().removeClass('orange-button');
  $('.product-info #button-cart').parent().removeClass('gold-button');
  $('.product-info #button-cart').parent().addClass('green-button');
  $('.product-info #button-cart').html($('#text-in-basket').html());
}


function addToCartFromWishlist(product_id) {
  $.ajax({
    url: 'index.php?route=checkout/cart/addFromWishlist',
    type: 'post',
    data: 'product_id=' + product_id,
    dataType: 'json',
    beforeSend: function (xhr) {
      showProductLoading(product_id);
    },
    complete: function (xhr) {
      hideProductLoading(product_id);
    },
    success: function (json) {
      $('.success, .warning, .attention, .information, .error').remove();
      if (json['error']) {
        $('#notification').html('<div class="warning" style="display: none;">' + json['error'] + '<img src="catalog/view/theme/default/image/close.png" alt="" class="close" /></div>');
        $('.warning').fadeIn('slow');
      }

      if (json['success']) {
        location = json['redirect'];
      }
    }
  });
}

function addToWishList(product_id) {
  $.ajax({
    url: 'index.php?route=account/wishlist/add',
    type: 'post',
    data: 'product_id=' + product_id,
    dataType: 'json',
    beforeSend: function (xhr) {
      showProductLoading(product_id);
    },
    complete: function (xhr) {
      hideProductLoading(product_id);
    },
    success: function (json) {
      $('.success, .warning, .attention, .information').remove();
      if (json['reload']) {// Product not found!
        location.reload();
      }

      if (json['success']) {
        $('#notification').html('<div class="success" style="display: none;">' + json['success'] + '<img src="catalog/view/theme/default/image/close.png" alt="" class="close" /></div>');
        $('.success').fadeIn('slow');
        $('#wishlist-total').html(json['total']);
      } else if (json['warning']) {
        $('#notification').html('<div class="warning" style="display: none;">' + json['warning'] + '<img src="catalog/view/theme/default/image/close.png" alt="" class="close" /></div>');
        $('.warning').fadeIn('slow');
      }
    }
  });
}

// callback success is added for nostalji
function addToFavorites(product_id, callbackSuccess) {
  $.ajax({
    url: 'index.php?route=account/favorite/add_product',
    type: 'post',
    data: 'product_id=' + product_id,
    dataType: 'json',
    beforeSend: function (xhr) {
      showProductLoading(product_id);
    },
    complete: function (xhr) {
      hideProductLoading(product_id);
    },
    success: function (json) {
      $('.success, .warning, .attention, .information').remove();
      if (json['reload']) {// Product not found!
        location.reload();
      }

      if (json['success']) {
        $('#notification').html('<div class="success" style="display: none;">' + json['success'] + '<img src="catalog/view/theme/default/image/close.png" alt="" class="close" /></div>');
        $('.success').fadeIn('slow');
        // If in product detail page, set favorite product label.
        if ($('#product-detail-favorite-product-div').length > 0) {
          $('#product-detail-favorite-product-div').show();
          $('#product-detail-add-to-favorites').hide();
        }

        $('#favorites-total').html(json['total']);

        addToFavoritesSuccessAfter(product_id);

        if (typeof (callbackSuccess) !== 'undefined') {
          callbackSuccess();
        }
      } else if (json['warning']) {
        $('#notification').html('<div class="warning" style="display: none;">' + json['warning'] + '<img src="catalog/view/theme/default/image/close.png" alt="" class="close" /></div>');
        $('.warning').fadeIn('slow');
      }
    }
  });
}

function addToFavoritesSuccessAfter(product_id) {
  $('#product-' + product_id).find('.add-to-favorites').hide();
  $('#product-' + product_id).find('.in-favorites').show();
}


function addToReadList(product_id, readlist_type_id, callbackSuccess) {
  $.ajax({
    url: 'index.php?route=account/readlist/add',
    type: 'post',
    data: 'product_id=' + product_id + "&readlist_type_id=" + readlist_type_id,
    dataType: 'json',
    beforeSend: function (xhr) {
      showProductLoading(product_id);
    },
    complete: function (xhr) {
      hideProductLoading(product_id);
    },
    success: function (json) {
      $('.success, .warning, .attention, .information').remove();
      if (json['reload']) {// Product not found!
        location.reload();
      }


      if (json['success']) {
        $('#notification').html('<div class="success" style="display: none;">' + json['success'] + '<img src="catalog/view/theme/default/image/close.png" alt="" class="close" /></div>');
        $('.success').fadeIn('slow');
        addToReadListSuccessAfter(product_id, readlist_type_id);
        if (typeof (callbackSuccess) !== 'undefined') {
          callbackSuccess(product_id, readlist_type_id);
        }
        var count = $('#count-' + readlist_type_id).html();
        count = parseInt(count) + 1;
        $('#count-' + readlist_type_id).html(count);
      } else if (json['warning']) {
        $('#notification').html('<div class="warning" style="display: none;">' + json['warning'] + '<img src="catalog/view/theme/default/image/close.png" alt="" class="close" /></div>');
        $('.warning').fadeIn('slow');
      }
    }
  });
}

function addToReadListSuccessAfter(product_id, readlist_type_id) {
//    $('#' + product_id + '-' + 'readlist-button-title').html(text_in_readlist);
//$('#' + product_id + '-' + 'readlist-button-title').addClass('in-list');

  var count = $('.readlist-type.active>td span').html();
  count = parseInt(count) - 1;
  $('.readlist-type.active>td span').html(count);
  $(".readlist-type").removeClass("active");
  $('#' + product_id + '-' + readlist_type_id).addClass('active');


}

function removeFromFavorites(product_id) {
  $.ajax({
    url: 'index.php?route=account/favorite/remove_product',
    type: 'post',
    data: 'product_id=' + product_id,
    dataType: 'json',
    beforeSend: function (xhr) {
      showProductLoading(product_id);
    },
    complete: function (xhr) {
      hideProductLoading(product_id);
    }, success: function (json) {
      $('.success, .warning, .attention, .information').remove();
      if (json['reload']) {// Product not found!
        location.reload();
      }

      if (json['success']) {
// WARNING: this is NOT for the favorite page
        $('#notification').html('<div class="success" style="display: none;">' + json['success'] + '<img src="catalog/view/theme/default/image/close.png" alt="" class="close" /></div>');
        $('.success').fadeIn('slow');

        removeFromFavoritesSuccessAfter(product_id);

      } else if (json['warning']) {
        $('#notification').html('<div class="warning" style="display: none;">' + json['warning'] + '<img src="catalog/view/theme/default/image/close.png" alt="" class="close" /></div>');
        $('.warning').fadeIn('slow');
      }
    }
  });
}

function removeFromFavoritesSuccessAfter(product_id) {
  $('#product-' + product_id).find('.add-to-favorites').show();
  $('#product-' + product_id).find('.in-favorites').hide();
}

function noticeMe(product_id, callbackSuccess) {
  $.ajax(
    {
      url: 'index.php?route=account/notification/noticeProduct',
      type: 'post',
      data: 'product_id=' + product_id,
      dataType: 'json',
      beforeSend: function (xhr) {
        showProductLoading(product_id);
      },
      complete: function (xhr) {
        hideProductLoading(product_id);
      },
      success: function (json) {
        $('.success, .warning, .attention, .information').remove();
        if (json['success']) {
          $('#notification').html('<div class="success" style="display: none;">' + json['success'] + '<img src="catalog/view/theme/default/image/close.png" alt="" class="close" /></div>');
          $('.success').fadeIn('slow');
          // update noticed product count (header.tpl)
          $('#notification-total').html(json['text_notification_list_info']);
          if (typeof (callbackSuccess) !== 'undefined') {
            callbackSuccess();
          }
        } else if (json['warning']) {
          $('#notification').html('<div class="warning" style="display: none;">' + json['warning'] + '<img src="catalog/view/theme/default/image/close.png" alt="" class="close" /></div>');
          $('.warning').fadeIn('slow');
        }
      }
    });
}

//function addToCompare(product_id) {
//    $.ajax({
//	url: 'index.php?route=product/compare/add',
//	type: 'post',
//	data: 'product_id=' + product_id,
//	dataType: 'json',
//	success: function(json) {
//	    $('.success, .warning, .attention, .information').remove();
//
//	    if (json['success']) {
//		$('#notification').html('<div class="success" style="display: none;">' + json['success'] + '<img src="catalog/view/theme/default/image/close.png" alt="" class="close" /></div>');
//
//		$('.success').fadeIn('slow');
//
//		$('#compare-total').html(json['total']);
//	    }
//	}
//    });
//}


// Product List Grid Display
function display(view, has_product_table_id, container_object_id) {

  var object_id;
  if (view == 'list') {

    if (typeof container_object_id !== "undefined") {
      object_id = container_object_id;
    } else {
      object_id = (typeof has_product_table_id === "undefined") ? "" : "#product-table";
    }

    $(object_id + '.product-grid').attr('class', 'product-list');
    $(object_id + '.product-list > div').each(function (index, element) {
      html = '<div class="grid_7 omega">';
      var bestsellerRank = $(element).find('.bestseller-rank').html();
      if (bestsellerRank != null) {
        html += '<div class="bestseller-rank fl">' + bestsellerRank + '</div>';
      }
      var image = $(element).find('.image').html();
      if (image != null) {
        html += '<div class="image">' + image + '</div>';
      }

      if ($(element).find('.name').attr('title')) {
        var $name = $(element).find('.name');
        $name.find('a').text($name.attr('title'));
        html += '  <div class="name">' + $name.html() + '</div>';
      } else {
        html += '  <div class="name">' + $(element).find('.name').html() + '</div>';
      }
      var publisher = $(element).find('.publisher').html();
      var author = $(element).find('.author').html();
      if (publisher != null && author != null) {
        html += '<div class="product-details">';
      }
      var description = $(element).find('.description').html();
      if (description != null) {
        html += '<div class="description">' + description + '</div>';
      }
      var publisher = $(element).find('.publisher').html();
      if (publisher != null) {
        html += '<div class="publisher">' + publisher + '</div>';
      }
      var author = $(element).find('.author').html();
      if (author != null) {
        html += '<div class="author">' + author + '</div>';
      }
      var authorCompact = $(element).find('.author.compact').html();
      if (authorCompact != null) {
        html += '<div class="author compact ellipsis">' + authorCompact + '</div>';
      }
      var rating = $(element).find('.rating').html();
      if (rating != null) {
        html += '<div class="rating">' + rating + '</div>';
      }
      var list_date = $(element).find('.list_date').html();
      if (list_date != null) {
        html += '<div class="list_date">' + list_date + '</div>';
      }
      var noticeContainer = $(element).find('.notice-container').html();
      if (noticeContainer != null) {
        html += '<div class="notice-container">' + noticeContainer + '</div>';
      }
      var products = $(element).find('.products').html();
      if (products != null) {
        html += '<div class="products">' + products + '</div>';
      }

      if (publisher != null && author != null) {
        html += '</div>';
      }

      var productInfo = $(element).find('.product-info').html();
      if (productInfo != null) {
        html += '<div class="product-info">' + productInfo + '</div>';
      }
      html += '</div>';
      html += '<div class="grid_2 alpha omega relative">';
      var order = $(element).find('.order').html();
      if (order != null) {
        html += '<div class="order">' + order + '</div>';
      }
      var discount = $(element).find('.discount').html();
      if (discount != null) {
        html += '<div class="discount">' + discount + '</div>';
      }
      var price = $(element).find('.price').html();
      if (price != null) {
        html += '<div class="price">' + price + '</div>';
      }
      var bottom = $(element).find('.bottom').html();
      if (bottom != null) {
        html += '  <div class="bottom">' + $(element).find('.bottom').html() + '</div>';
      }
      var publishNotice = $(element).find('.publish-notice').html();
      if (publishNotice != null) {
        html += '<div class="publish-notice">' + publishNotice + '</div>';
      }
      var hoverMenu = $(element).find('.hover-menu').html();
      if (hoverMenu != null) {
        html += '  <div class="hover-menu">' + $(element).find('.hover-menu').html() + '</div>';
      }
      var seo = $(element).find('.seo-metadata').html();
      if (seo != null) {
        html += '<div class="seo-metadata">' + seo + '</div>';
      }
      html += '</div>';
      $(element).html(html);
    });
    $('.display').html('<a onclick="display(' + ((typeof has_product_table_id === "undefined") ? "'grid'" : "'grid', true") + ');"><span class="sprite sprite-icon-grid"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<span class="sprite sprite-icon-list-selected"></span>');
    $.cookie('display', 'list');
  } else {

    if (typeof container_object_id !== "undefined") {
      object_id = container_object_id;
    } else {
      object_id = (typeof has_product_table_id === "undefined") ? "" : "#product-table";
    }

    $(object_id + '.product-list').attr('class', 'product-grid');
    $(object_id + '.product-grid > div').each(function (index, element) {
      html = '';
      var bestseller_rank = $(element).find('.bestseller-rank').html();
      if (bestseller_rank != null) {
        html += '<div class="bestseller-rank fl">' + bestseller_rank + '</div>';
      }
      var order = $(element).find('.order').html();
      if (order != null) {
        html += '<div class="order">' + order + '</div>';
      }
      var image = $(element).find('.image').html();
      if (image != null) {
        html += '<div class="image">' + image + '</div>';
      }
      html += '<div class="name ellipsis">' + $(element).find('.name').html() + '</div>';
      var description = $(element).find('.description').html();
      if (description != null) {
        html += '<div class="description">' + description + '</div>';
      }
      var publisher = $(element).find('.publisher').html();
      if (publisher != null) {
        html += '<div class="publisher">' + publisher + '</div>';
      }
      var author = $(element).find('.author').html();
      if (author != null) {
        html += '<div class="author">' + author + '</div>';
      }
      var authorCompact = $(element).find('.author.compact').html();
      if (authorCompact != null) {
        html += '<div class="author compact ellipsis">' + authorCompact + '</div>';
      }
      var productInfo = $(element).find('.product-info').html();
      if (productInfo != null) {
        html += '<div class="product-info">' + productInfo + '</div>';
      }
      var price = $(element).find('.price').html();
      if (price != null) {
        html += '<div class="price">' + price + '</div>';
      }
      var rating = $(element).find('.rating').html();
      if (rating != null) {
        html += '<div class="rating" id="' + $(element).attr('id').replace('product-', 'rating-') + '">' + rating + '</div>';
      }
      var list_date = $(element).find('.list_date').html();
      if (list_date != null) {
        html += '<div class="list_date">' + list_date + '</div>';
      }
      var products = $(element).find('.products').html();
      if (products != null) {
        html += '<div class="products">' + products + '</div>';
      }
      var bottom = $(element).find('.bottom').html();
      if (bottom != null) {
        html += '<div class="bottom">' + $(element).find('.bottom').html() + '</div>';
      }
      var publishNotice = $(element).find('.publish-notice').html();
      if (publishNotice != null) {
        html += '<div class="publish-notice">' + publishNotice + '</div>';
      }
      var hoverMenu = $(element).find('.hover-menu').html();
      if (hoverMenu != null) {
        html += '  <div class="hover-menu">' + $(element).find('.hover-menu').html() + '</div>';
      }
      var noticeContainer = $(element).find('.notice-container').html();
      if (noticeContainer != null) {
        html += '<div class="notice-container">' + noticeContainer + '</div>';
      }
      var discount = $(element).find('.discount').html();
      if (discount != null) {
        html += '<div class="discount">' + discount + '</div>';
      }
      var seo = $(element).find('.seo-metadata').html();
      if (seo != null) {
        html += '<div class="seo-metadata">' + seo + '</div>';
      }

      $(element).html(html);
    });
    $('.display').html('<span class="sprite sprite-icon-grid-selected"></span>&nbsp;&nbsp;&nbsp;&nbsp;<a onclick="display(' + ((typeof has_product_table_id === "undefined") ? "'list'" : "'list', true") + ');"><span class="sprite sprite-icon-list"></span></a>');
    $.cookie('display', 'grid');
  }

  updateProductViews();
}

(function ($) {

// Button Generator
  $.fn.buttonGenerator = function (imageUrl, childSelector) {

    if (childSelector == null) {
      childSelector = 'a';
    }

    return this.each(function () {
      var $this = $(this);
      $this.addClass($this.attr('data-color') + '-button')
      var button = $this.children(childSelector);
    });
  };

  $.fn.ribbonGenerator = function (imageUrl) {

    return this.each(function () {
      var $this = $(this);
      if (!$this.hasClass('small')) {

        $this.wrapInner('<span class="middle"><span class="text"></span></span>');
        $this.children('.middle').before('<span class="before"></span>');
        $this.children('.middle').after('<span class="after"></span>');
        $this.children('.before').css('background', 'url(' + imageUrl + '-left-' + $this.attr('color') + '.png) no-repeat');
        $this.children('.middle').css('background', 'url(' + imageUrl + '-middle-' + $this.attr('color') + '.png) repeat-x');
        $this.children('.after').css('background', 'url(' + imageUrl + '-right-' + $this.attr('color') + '.png) no-repeat');
      }
    });
  };

  // this is a binary search that operates via a function
  // func should return < 0 if it should search smaller values
  // func should return > 0 if it should search larger values
  // func should return = 0 if the exact value is found
  // Note: this function handles multiple matches and will return the last match
  // this returns -1 if no match is found
  function binarySearch(length, func) {
    var low = 0;
    var high = length - 1;
    var best = -1;
    var mid;
    while (low <= high) {
      mid = ~~((low + high) / 2); //~~ is a fast way to convert something to an int
      var result = func(mid);
      if (result < 0) {
        high = mid - 1;
      } else if (result > 0) {
        low = mid + 1;
      } else {
        best = mid;
        low = mid + 1;
      }
    }

    return best;
  }

  // create the ellipsis function
  // when addTooltip = true, add a title attribute with the original text
  $.fn.ellipsis = function (addTooltip) {

    return this.each(function () {
      var el = $(this);
      if (el.is(":visible")) {

        if (el.css("overflow") === "hidden") {
          var content = el.html();
          var multiline = true;
          var tempElement = $(this.cloneNode(true))
            .hide()
            .css('position', 'absolute')
            .css('overflow', 'visible')
            .width(multiline ? el.width() : 'auto')
            .height(multiline ? 'auto' : el.height())
          ;
          el.after(tempElement);
          var tooTallFunc = function () {
            return tempElement.height() > el.height();
          };
          var tooWideFunc = function () {
            return tempElement.width() > el.width();
          };
          var tooLongFunc = multiline ? tooTallFunc : tooWideFunc;
          // if the element is too long...
          if (tooLongFunc()) {

            var tooltipText = null;
            // if a tooltip was requested...
            if (addTooltip) {
              // trim leading/trailing whitespace
              // and consolidate internal whitespace to a single space
              tooltipText = $.trim(el.text()).replace(/\s\s+/g, ' ');
            }

            var originalContent = content;
            var createContentFunc = function (i) {
              content = originalContent.substr(0, i);
              tempElement.html(content + "…");
            };
            var searchFunc = function (i) {
              createContentFunc(i);
              if (tooLongFunc()) {
                return -1;
              }
              return 0;
            };
            var len = binarySearch(content.length - 1, searchFunc);
            createContentFunc(len);
            el.html(tempElement.html());
            // add the tooltip if appropriate
            if (tooltipText !== null) {
              el.attr('title', tooltipText);
            }
          }

          tempElement.remove();
        }
      } else {
        // if this isn't visible, then hook up the show event
        el.one('show', function () {
          $(this).ellipsis(addTooltip);
        });
      }
    });
  };

  $.fn.initCarousel = function (carouselId, wrap, auto) {

    var $this = $(this);
    var $container = $('#' + carouselId + '-container');

    /**
     * We use the initCallback callback
     * to assign functionality to the controls
     */
    function carouselInitCallback(carousel) {

      // pause on hover
      carousel.clip.hover(function () {
        carousel.stopAuto();
      }, function () {
        carousel.startAuto();
      });
      $container.find('.next').bind('click', function () {

        carousel.next();
        return false;
      });
      $container.find('.prev').bind('click', function () {
        carousel.prev();
        return false;
      });
    }

    /**
     * This is the callback function which receives notification
     * about the state of the next button.
     */
    function carouselButtonNextCallback(carousel, button, enabled) {

      if (enabled) {
        $container.find('.next span').removeClass("sprite-next-disabled");
        $container.find('.next span').addClass("sprite-next-enabled");
      } else {
        $container.find('.next span').removeClass("sprite-next-enabled");
        $container.find('.next span').addClass("sprite-next-disabled");
      }

//	    updateImages($this.attr('id'));
    }

    /**
     * This is the callback function which receives notification
     * about the state of the prev button.
     */
    function carouselButtonPrevCallback(carousel, button, enabled) {

      if (enabled) {
        $container.find('.prev span').removeClass("sprite-prev-disabled");
        $container.find('.prev span').addClass("sprite-prev-enabled");
      } else {
        $container.find('.prev span').removeClass("sprite-prev-enabled");
        $container.find('.prev span').addClass("sprite-prev-disabled");
      }

//	    updateImages($this.attr('id'));
    }
    ;
    $this.find('ul').jcarousel({
      animation: 1500,
      auto: auto,
      wrap: wrap,
      scroll: 5,
      initCallback: carouselInitCallback,
      itemFallbackDimension: 136,
      // This tells jCarousel NOT to autobuild prev/next buttons
      buttonNextHTML: null,
      buttonPrevHTML: null,
      buttonNextCallback: carouselButtonNextCallback,
      buttonPrevCallback: carouselButtonPrevCallback
    });
  }


})(jQuery);
//function updateImages(element) {
//    $(element + " .image img").each(function () {
//	if ($(this).attr('data-src') !== $(this).attr('src')) {
//	    var src = $(this).attr('data-src');
//	    $(this).attr('src', src);
//	}
//    });
//}

function isIE(version, comparison) {
  var cc = 'IE',
    b = document.createElement('B'),
    docElem = document.documentElement,
    isIE;
  if (version) {
    cc += ' ' + version;
    if (comparison) {
      cc = comparison + ' ' + cc;
    }
  }

  b.innerHTML = '<!--[if ' + cc + ']><b id="iecctest"></b><![endif]-->';
  docElem.appendChild(b);
  isIE = !!document.getElementById('iecctest');
  docElem.removeChild(b);
  return isIE;
}

function displayLoading(container, imageWidth) {
  $(container).html('<span class="wait">&nbsp;<img style="width: ' + imageWidth + 'px;" src="catalog/view/theme/default/image/ajax-loader.gif" alt="" />&nbsp;Yükleniyor...</span>');
}

function paginateHtmlTable(tableElement) {
  var currentPage = 0;
  var numPerPage = 5;
  var $table = $(tableElement);
  var rowSelector = "tbody tr";

  $table.bind('repaginate', function () {
    $table.find(rowSelector).hide().slice(currentPage * numPerPage, (currentPage + 1) * numPerPage).show();
  });
  $table.trigger('repaginate');
  var numRows = $table.find(rowSelector).length;
  var numPages = Math.ceil(numRows / numPerPage);
  var $pager = $('<div class="pagination"></div>');
  var $links = $('<div class="links"></div>');
  $links.appendTo($pager);
  for (var page = 0; page < numPages; page++) {
    $('<a class="page-number"></a>').text(page + 1).bind('click', {
      newPage: page
    }, function (event) {
      currentPage = event.data['newPage'];
      $table.trigger('repaginate');
      $(this).addClass('active').siblings().removeClass('active');
    }).appendTo($links);
  }
  $pager.insertAfter($table).find('a.page-number:first').addClass('active');
}

$(document).on('click', '.custom-checkbox', function () {
  let customCheckbox = $(this);
  if (customCheckbox.hasClass('custom-checkbox-active')) {
    customCheckbox.removeClass('custom-checkbox-active');
  } else {
    customCheckbox.addClass('custom-checkbox-active');
  }
});
