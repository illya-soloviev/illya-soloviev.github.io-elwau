/*!-----------------------------------------------------
 * xZoom v1.0.14
 * (c) 2013 by Azat Ahmedov & Elman Guseynov
 * https://github.com/payalord
 * https://dribbble.com/elmanvebs
 * Apache License 2.0
 *------------------------------------------------------*/
window.requestAnimFrame = (function(){
  return window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  function(callback){
    window.setTimeout(callback, 20);
  };
})();

function detect_old_ie() {
  if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) {
   var ieversion=new Number(RegExp.$1);
   if (ieversion>=9)
    return false
   else if (ieversion>=8)
    return true
   else if (ieversion>=7)
    return true
   else if (ieversion>=6)
    return true
   else if (ieversion>=5)
    return true
  } else return false;
}

(function ($) {
  //Compatibility between old and new versions of jQuery
  $.fn.xon = $.fn.on || $.fn.bind;
  $.fn.xoff = $.fn.off || $.fn.bind;

  function xobject(mObj, opts) {
    //Properties
    this.xzoom = true;
    var current = this;
    var parent;
    var xzoomID = {};

    var sw, sh, mw, mh, moffset, stop, sleft, mtop, mleft, ctop, cleft, mx, my;
    var source, tint, preview, loading, trans, transImg, sobjects = new Array();
    var imageGallery = new Array(), index = 0, cindex = 0;
    var img, imgObj, lens, lensImg;
    var lw, lh, ll, lt, llc, ltc, ocofx, ocofy, cofx, cofy, c1, c2, iwh, scale = 0;
    var imgObjwidth, imgObjheight;
    var flag, u = 0, v = 0, su = 0, sv = 0, lsu = 0, lsv = 0, lu = 0, lv = 0, llu = 0, llv = 0;
    var ie = detect_old_ie(), aie = /MSIE (\d+\.\d+);/.test(navigator.userAgent), iex, iey;
    var active, title = '', caption, caption_container;

    //Adaptive properties
    var wsw, wsh, osw, osh, tsw, tsh, oposition, reverse;//, smoothNormal;

    this.adaptive = function() {
      if (osw == 0 || osh == 0) {
        mObj.css('width', '');
        mObj.css('height', '');
        osw = mObj.width();
        osh = mObj.height();
      }

      xremove();
      wsw = $(window).width();
      wsh = $(window).height();

      tsw = mObj.width();
      tsh = mObj.height();

      var update = false;
      if (osw>wsw || osh>wsh) update = true;

      if (tsw > osw) tsw = osw;
      if (tsh > osh) tsh = osh;
      if (update) {
        mObj.width('100%');
      } else {
        if (osw != 0) mObj.width(osw);
      }
      if (oposition != 'fullscreen') if (adaptive_position_fit()) current.options.position = oposition; else current.options.position = current.options.mposition;
      if (!current.options.lensReverse) reverse = current.options.adaptiveReverse && current.options.position == current.options.mposition;
    }

    function spos() {
      var doc = document.documentElement;
      var left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
      var top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);

      return {left: left, top: top};
    }

    function adaptive_position_fit() {
      var moffset = mObj.offset();

      if (current.options.zoomWidth == 'auto') mw = tsw; else mw = current.options.zoomWidth; //tsw/osw * current.options.zoomWidth;
      if (current.options.zoomHeight == 'auto') mh = tsh; else mh = current.options.zoomHeight; //tsw/osh * current.options.zoomHeight;

      if (current.options.position.substr(0,1) == '#') xzoomID = $(current.options.position); else xzoomID.length = 0;
      if (xzoomID.length != 0) return true;

      switch(oposition) {
        case 'lens':
        case 'inside':
        return true;
        break;
        case 'top':
          stop = moffset.top;
          sleft = moffset.left;
          mtop = stop - mh; //tsh;
          mleft = sleft;
        break;
        case 'left':
          stop = moffset.top;
          sleft = moffset.left;
          mtop = stop;
          mleft = sleft - mw; //tsw;
        break;
        case 'bottom':
          stop = moffset.top;
          sleft = moffset.left;
          mtop = stop + tsh;
          mleft = sleft;
        break;
        case 'right':
        default:
          stop = moffset.top;
          sleft = moffset.left;
          mtop = stop;
          mleft = sleft + tsw;
      }
      if (mleft+mw>wsw || mleft<0) return false; //if (mtop+mh>wsh || mtop<0) return false;
      return true;
    }

    this.xscroll = function(event) {
      mx = event.pageX || event.originalEvent.pageX;
      my = event.pageY || event.originalEvent.pageY;

      event.preventDefault();

      if (event.xscale) {
        scale = event.xscale;
        xscale(mx, my);
      } else {
        var delta = -event.originalEvent.detail || event.originalEvent.wheelDelta || event.xdelta;
        var x = mx;
        var y = my;
        if (ie) {
          x = iex;
          y = iey;
        }

        if (delta > 0) delta = -0.05; else delta = 0.05;

        scale += delta;

        xscale(x, y);
      }
    }

    function lensShape() {
      if (current.options.lensShape == 'circle' && current.options.position == 'lens') {
        //this function must be called before set_lens()
        lw = lh = Math.max(lw, lh);
        var radius = (lw + Math.max(ltc,llc) * 2) / 2;
        lens.css({'-moz-border-radius': radius, '-webkit-border-radius': radius, 'border-radius': radius});
      }
    }

    function lensOutput(x, y, sx, sy) {
      if (current.options.position == 'lens') {
        imgObj.css({top: -(y-stop) * cofy + (lh / 2), left: -(x-sleft) * cofx + (lw / 2)});
        if (current.options.bg) {
          lens.css({'background-image': 'url('+imgObj.attr('src')+')', 'background-repeat': 'no-repeat', 'background-position': (-(x-sleft) * cofx + (lw / 2))+'px '+(-(y-stop) * cofy + (lh / 2))+'px'});
          if (sx && sy) lens.css({'background-size': sx+'px '+sy+'px'});
        }
      } else {
        imgObj.css({top: -lt * cofy, left: -ll * cofx});
      }
    }

    function xscale(x, y) {
      if (scale < -1) scale = -1;
      if (scale > 1) scale = 1;

      var cc, iw, ih;

      if (c1 < c2) {
        cc = c1 - (c1 - 1) * scale;
        iw = mw * cc;
        ih = iw / iwh;
      } else {
        cc = c2 - (c2 - 1) * scale;
        ih = mh * cc;
        iw = ih * iwh;
      }

      if (flag) {
        //If smoothMove
        u = x;
        v = y;
        su = iw;
        sv = ih;
      } else {
        if (!flag) {
          lsu = su = iw;
          lsv = sv = ih;
        }
        cofx = iw / sw;
        cofy = ih / sh;
        lw = mw / cofx;
        lh = mh / cofy;
        lensShape();
        set_lens(x, y);

        imgObj.width(iw);
        imgObj.height(ih);
        lens.width(lw);
        lens.height(lh);

        lens.css({top: lt - ltc, left: ll - llc});
        lensImg.css({top: -lt, left: -ll});
        lensOutput(x, y, iw, ih);
      }
    }

    function loopZoom() {
      var x = lu;
      var y = lv;
      var x2 = llu;
      var y2 = llv;
      var sx = lsu;
      var sy = lsv;
      x += (u - x) / current.options.smoothLensMove;
      y += (v - y) / current.options.smoothLensMove;

      x2 += (u - x2) / current.options.smoothZoomMove;
      y2 += (v - y2) / current.options.smoothZoomMove;

      sx += (su - sx) / current.options.smoothScale;
      sy += (sv - sy) / current.options.smoothScale;

      cofx = sx / sw;
      cofy = sy / sh;

      lw = mw / cofx;
      lh = mh / cofy;
      lensShape();
      set_lens(x, y);

      imgObj.width(sx);
      imgObj.height(sy);

      lens.width(lw);
      lens.height(lh);

      lens.css({top: lt - ltc, left: ll - llc});
      lensImg.css({top: -lt, left: -ll});

      set_lens(x2, y2);
      lensOutput(x, y, sx, sy);

      lu = x;
      lv = y;
      llu = x2;
      llv = y2;
      lsu = sx;
      lsv = sy;

      if (flag) requestAnimFrame(loopZoom);
    }

    function set_lens(x, y) {
      x -= sleft;
      y -= stop;
      ll = x - (lw / 2);
      lt = y - (lh / 2);

      if (current.options.position != 'lens' && current.options.lensCollision) {
        if (ll < 0) ll = 0;
        if (sw >= lw && ll > sw - lw) ll = sw - lw;
        if (sw < lw) ll = sw / 2 - lw / 2;
        if (lt < 0) lt = 0;
        if (sh >= lh && lt > sh - lh) lt = sh - lh;
        if (sh < lh) lt = sh / 2 - lh / 2;
      }
    }

    function xremove() {
      if (typeof source != "undefined") source.remove();
      if (typeof preview != "undefined") preview.remove();
      if (typeof caption_container != "undefined") caption_container.remove();
    }

    function prepare_zoom(x, y) {
      if (current.options.position == 'fullscreen') {
        sw = $(window).width();
        sh = $(window).height();
      } else {
        sw = mObj.width();
        sh = mObj.height();
      }

      loading.css({top: sh / 2 - loading.height() / 2, left: sw / 2 - loading.width() / 2});

      if (current.options.rootOutput || current.options.position == 'fullscreen') {
        moffset = mObj.offset();
      } else {
        moffset = mObj.position();
      }

      //Round
      moffset.top = Math.round(moffset.top);
      moffset.left = Math.round(moffset.left);

      switch(current.options.position) {
        case 'fullscreen':
          stop = spos().top;
          sleft = spos().left;
          mtop = 0;
          mleft = 0;
        break;
        case 'inside':
          stop = moffset.top;
          sleft = moffset.left;
          mtop = 0;
          mleft = 0;
        break;
        case 'top':
          stop = moffset.top;
          sleft = moffset.left;
          mtop = stop - mh;
          mleft = sleft;
        break;
        case 'left':
          stop = moffset.top;
          sleft = moffset.left;
          mtop = stop;
          mleft = sleft - mw;
        break;
        case 'bottom':
          stop = moffset.top;
          sleft = moffset.left;
          mtop = stop + sh;
          mleft = sleft;
        break;
        case 'right':
        default:
          stop = moffset.top;
          sleft = moffset.left;
          mtop = stop;
          mleft = sleft + sw;
      }

      //Correct source position
      stop -= source.outerHeight() / 2;
      sleft -= source.outerWidth() / 2;

      if (current.options.position.substr(0,1) == '#') xzoomID = $(current.options.position); else xzoomID.length = 0;
      if (xzoomID.length == 0 && current.options.position != 'inside' && current.options.position!= 'fullscreen') {

        if (!current.options.adaptive || !osw || !osh) {osw = sw; osh = sh;}
        if (current.options.zoomWidth == 'auto') mw = sw; else mw = current.options.zoomWidth; //sw/osw * current.options.zoomWidth;
        if (current.options.zoomHeight == 'auto') mh = sh; else mh = current.options.zoomHeight; //sw/osh * current.options.zoomHeight;

        //Add offset
        mtop += current.options.Yoffset;
        mleft += current.options.Xoffset;

        preview.css({width: mw + 'px', height: mh + 'px', top: mtop, left: mleft});
        if (current.options.position != 'lens') parent.append(preview);
      } else if (current.options.position == 'inside' || current.options.position == 'fullscreen') {
        mw = sw;
        mh = sh;

        preview.css({width: mw + 'px', height: mh + 'px'});
        source.append(preview);
      } else {
        mw = xzoomID.width();
        mh = xzoomID.height();

        if (current.options.rootOutput) {
          mtop = xzoomID.offset().top;
          mleft = xzoomID.offset().left;

          parent.append(preview);
        } else {
          mtop = xzoomID.position().top;
          mleft = xzoomID.position().left;

          xzoomID.parent().append(preview);
        }

        mtop += (xzoomID.outerHeight() - mh - preview.outerHeight()) / 2;
        mleft += (xzoomID.outerWidth() - mw - preview.outerWidth()) / 2;
        preview.css({width: mw + 'px', height: mh + 'px', top: mtop, left: mleft});
      }

      if (current.options.title && title != '') {
        if (current.options.position == 'inside' || current.options.position == 'lens' || current.options.position == 'fullscreen') {
          ctop = mtop;
          cleft = mleft;
          source.append(caption_container);
        } else {
          ctop = mtop + (preview.outerHeight()-mh)/2;
          cleft = mleft + (preview.outerWidth()-mw)/2;
          parent.append(caption_container);
        }
        caption_container.css({width: mw + 'px', height: mh + 'px', top: ctop, left: cleft});
      }

      source.css({width: sw + 'px', height: sh + 'px', top: stop, left: sleft});
      tint.css({width: sw + 'px', height: sh + 'px'});
      if (current.options.tint && (current.options.position != 'inside' && current.options.position != 'fullscreen'))
        tint.css('background-color', current.options.tint)
      else if (ie) {
        tint.css({'background-image': 'url('+mObj.attr('src')+')', 'background-color': '#fff'});
      }

      //Image object
      img = new Image();

      var timestamp = '';
      if (aie) timestamp = '?r='+(new Date()).getTime();
      img.src = mObj.attr('xoriginal')+timestamp;

      imgObj = $(img);
      imgObj.css('position', 'absolute');
      //debug
      //imgObj.css('opacity', '0.5');

      img = new Image();
      img.src = mObj.attr('src');

      lensImg = $(img);
      lensImg.css('position', 'absolute');
      lensImg.width(sw);

      //Append image
      switch (current.options.position) {
        case 'fullscreen':
        case 'inside':
          preview.append(imgObj);
        break;
        case 'lens':
          lens.append(imgObj);
          if (current.options.bg) imgObj.css({display: 'none'});
        break;
        default:
          preview.append(imgObj);
          lens.append(lensImg);
      }
    }

    this.openzoom = function (event) {
        mx = event.pageX; my = event.pageY;

        if (current.options.adaptive) current.adaptive();
        scale = current.options.defaultScale; flag = false;

        //Source container
        source = $('<div></div>');
        if (current.options.sourceClass != '') source.addClass(current.options.sourceClass);
        source.css('position', 'absolute');

        //Loading container
        loading = $('<div></div>');
        if (current.options.loadingClass != '') loading.addClass(current.options.loadingClass);
        loading.css('position', 'absolute');

        tint = $('<div style="position: absolute; top: 0; left: 0;"></div>');

        source.append(loading);

        //Preview container
        preview = $('<div></div>');
        if (current.options.zoomClass != '' && current.options.position != 'fullscreen') preview.addClass(current.options.zoomClass);
        preview.css({position: 'absolute', overflow: 'hidden', opacity: 1});

        //Caption
        if (current.options.title && title != '') {
          caption_container = $('<div></div>');
          caption = $('<div></div>');
          caption_container.css({position: 'absolute', opacity: 1});
          if (current.options.titleClass) caption.addClass(current.options.titleClass);
          caption.html('<span>'+title+'</span>');
          caption_container.append(caption);
          if (current.options.fadeIn) caption_container.css({opacity:0});
        }

        //Lens object
        lens = $('<div></div>');
        if (current.options.lensClass != '') lens.addClass(current.options.lensClass);
        lens.css({position: 'absolute', overflow: 'hidden'});

        //Lens tint
        if (current.options.lens) {
          lenstint = $('<div></div>');
          lenstint.css({position: 'absolute', background: current.options.lens, opacity: current.options.lensOpacity, width: '100%', height: '100%', top: 0, left: 0, 'z-index': 9999});
          lens.append(lenstint);
        }

        prepare_zoom(mx, my);

        if (current.options.position != 'inside' && current.options.position != 'fullscreen') {
          if (current.options.tint || ie) source.append(tint);

          if (current.options.fadeIn) {
            tint.css({opacity:0});
            lens.css({opacity:0});
            preview.css({opacity:0});
          }
          parent.append(source);
        } else {
          if (current.options.fadeIn) preview.css({opacity:0});
          parent.append(source);
        }

        //Add event on mouse move
        current.eventmove(source);

        //On mouse leave delete containers
        current.eventleave(source);

        //Correct preview
        switch(current.options.position) {
          case 'inside':
            mtop -= (preview.outerHeight() - preview.height()) / 2;
            mleft -= (preview.outerWidth() - preview.width()) / 2;
          break;
          case 'top':
            mtop -= preview.outerHeight() - preview.height();
            mleft -= (preview.outerWidth() - preview.width()) / 2;
          break;
          case 'left':
            mtop -= (preview.outerHeight()  - preview.height()) / 2;
            mleft -= preview.outerWidth() - preview.width();
          break;
          case 'bottom':
            mleft -= (preview.outerWidth() - preview.width()) / 2;
          break;
          case 'right':
            mtop -= (preview.outerHeight() - preview.height()) / 2;
        }

        preview.css({top: mtop, left: mleft});

        //We must be sure that image has been loaded
        imgObj.xon('load', function(e) {
          loading.remove();

          if (!current.options.openOnSmall && (imgObj.width() < mw || imgObj.height() < mh)) {
            current.closezoom();
            e.preventDefault();
            return false;
          }

          //Scroll functionality
          if (current.options.scroll) current.eventscroll(source);

          if (current.options.position != 'inside' && current.options.position != 'fullscreen') {
            //Append lens to source container
            source.append(lens);
            if (current.options.fadeIn) {
              tint.fadeTo(300, current.options.tintOpacity);
              lens.fadeTo(300, 1);
              preview.fadeTo(300,1);
            } else {
              tint.css({opacity: current.options.tintOpacity});
              lens.css({opacity: 1});
              preview.css({opacity: 1});
            }
          } else {
            if (current.options.fadeIn) {
              preview.fadeTo(300,1);
            } else {
              preview.css({opacity: 1});
            }
          }

          if (current.options.title && title != '') {
            if (current.options.fadeIn) caption_container.fadeTo(300,1); else caption_container.css({opacity: 1});
          }

          imgObjwidth = imgObj.width();
          imgObjheight = imgObj.height();

          if (current.options.adaptive) {
          //Images corrections for adaptive
            if (sw<osw || sh<osh) {
              lensImg.width(sw);
              lensImg.height(sh);

              imgObjwidth = sw/osw * imgObjwidth;
              imgObjheight = sh/osh * imgObjheight;

              imgObj.width(imgObjwidth);
              imgObj.height(imgObjheight);
            }
          }

          //Calculate lens size
          lsu = su = imgObjwidth;
          lsv = sv = imgObjheight;
          iwh = imgObjwidth / imgObjheight;
          c1 = imgObjwidth / mw;
          c2 = imgObjheight / mh;

          //outerHeight and outerWidth work wrong sometimes, especially when we use init() function
          //ltc = lens.outerHeight() / 2;
          //llc = lens.outerWidth() / 2;
          //Issue #2 Test .css() function that can return NaN and break lens object position
          var t, o = ['padding-','border-'];
          ltc = llc = 0;
          for(var i = 0; i<o.length;i++) {
            t = parseFloat(lens.css(o[i]+'top-width'));
            ltc += t !== t ? 0 : t;
            t = parseFloat(lens.css(o[i]+'bottom-width'));
            ltc += t !== t ? 0 : t;
            t = parseFloat(lens.css(o[i]+'left-width'));
            llc += t !== t ? 0 : t;
            t = parseFloat(lens.css(o[i]+'right-width'));
            llc += t !== t ? 0 : t;
          }
          ltc /= 2;
          llc /= 2;
          //ltc = (parseFloat(lens.css('padding-top-width')) + parseFloat(lens.css('padding-bottom-width')) + parseFloat(lens.css('border-top-width')) + parseFloat(lens.css('border-bottom-width'))) / 2;
          //llc = (parseFloat(lens.css('padding-left-width')) + parseFloat(lens.css('padding-right-width')) + parseFloat(lens.css('border-left-width')) + parseFloat(lens.css('border-right-width'))) / 2;
          //ltc = (pb(lens, 'padding', 1) + pb(lens, 'border', 1)) / 2;
          //llc = (pb(lens, 'padding', 0) + pb(lens, 'border', 0)) / 2;
          llu = lu = u = mx;
          llv = lv = v = my;
          xscale(mx, my);

          if (current.options.smooth) {flag = true; requestAnimFrame(loopZoom);}

          current.eventclick(source);
        });
    }

    /*function pb(obj, name, dir) {
      if (dir) {
        return parseFloat(obj.css(name + '-top')) + parseFloat(obj.css(name + '-bottom'));
      } else {
        return parseFloat(obj.css(name + '-left')) + parseFloat(obj.css(name + '-right'));
      }
    }*/

    this.movezoom = function(event) {
      mx = event.pageX;
      my = event.pageY;
      if (ie) {
        iex = mx;
        iey = my;
      }

      var x = mx - sleft;
      var y = my - stop;

      if (reverse) {
        event.pageX -= (x - sw / 2) * 2;
        event.pageY -= (y - sh / 2) * 2;
      }

      if (x < 0 || x > sw || y < 0 || y > sh) source.trigger('mouseleave');
      if (current.options.smooth) {
        u = event.pageX;
        v = event.pageY;
      } else {
        //Calculate zoom image position
        lensShape();
        set_lens(event.pageX, event.pageY);
        lens.css({top: lt - ltc, left: ll - llc});
        lensImg.css({top: -lt, left: -ll});
        lensOutput(event.pageX,event.pageY, 0, 0);
      }
    }

    this.eventdefault = function() {
      current.eventopen = function(element) {
        element.xon('mouseenter', current.openzoom);
      }

      current.eventleave = function(element) {
        element.xon('mouseleave', current.closezoom);
      }

      current.eventmove = function(element) {
        element.xon('mousemove', current.movezoom);
      }

      current.eventscroll = function(element) {
        element.xon('mousewheel DOMMouseScroll', current.xscroll);
      }

      current.eventclick = function(element) {
        element.xon('click', function(event) {
          mObj.trigger('click');
        });
      }
    }

    this.eventunbind = function() {
      mObj.xoff('mouseenter');
      current.eventopen = function(element) {}
      current.eventleave = function(element) {}
      current.eventmove = function(element) {}
      current.eventscroll = function(element) {}
      current.eventclick = function(element) {}
    }

    this.init = function (options) {
      //Default options
      current.options = $.extend({},$.fn.xzoom.defaults, options);

      if (current.options.rootOutput) {
        parent = $("body");
      } else {
        parent = mObj.parent();
      }

      oposition = current.options.position; //ocof,

      reverse = current.options.lensReverse && current.options.position == 'inside';

      //Limits
      if (current.options.smoothZoomMove < 1) current.options.smoothZoomMove = 1;
      if (current.options.smoothLensMove < 1) current.options.smoothLensMove = 1;
      if (current.options.smoothScale < 1) current.options.smoothScale = 1;

      //smoothNormal = current.options.smoothZoomMove && current.options.smoothLensMove && current.options.smoothScale;

      //Adaptive
      if (current.options.adaptive) {
        $(window).xon('load',function(){
          osw = mObj.width();
          osh = mObj.height();

          current.adaptive();
          $(window).resize(current.adaptive);
        });
      }
      current.eventdefault();
      current.eventopen(mObj);
    }

    this.destroy = function() {
      current.eventunbind();
    }

    this.closezoom = function() {
      flag = false;
      if (current.options.fadeOut) {
        if (current.options.title && title != '') caption_container.fadeOut(299);
        if (current.options.position != 'inside' || current.options.position != 'fullscreen') {
          preview.fadeOut(299);
          source.fadeOut(300, function(){xremove()});
        } else {
          source.fadeOut(300, function(){xremove()});
        }
      } else {
        xremove();
      }
    }

    this.gallery = function() {
      var g = new Array();
      var i,j = 0;
      for (i = cindex; i<imageGallery.length; i++) {
        g[j] = imageGallery[i];j++;
      }
      for (i = 0; i<cindex; i++) {
        g[j] = imageGallery[i];j++;
      }

      return {index: cindex, ogallery: imageGallery, cgallery: g};
    }

    function get_title(element) {
      var otitle = element.attr('title');
      var xotitle = element.attr('xtitle');
      if (xotitle) {
        return xotitle;
      } else if (otitle) {
        return otitle
      } else {
        return '';
      }
    }

    this.xappend = function(Obj) {
      var link = Obj.parent();
      //Add original image to image gallery
      imageGallery[index] = link.attr('href');
      link.data('xindex', index);
      if (index == 0 && current.options.activeClass) {active = Obj; active.addClass(current.options.activeClass)}
      if (index == 0 && current.options.title) title = get_title(Obj);
      index++;

      function thumbchange(event) {
        xremove();
        event.preventDefault();
        if (current.options.activeClass) {
          active.removeClass(current.options.activeClass);
          active = Obj;
          active.addClass(current.options.activeClass);
        }
        cindex = $(this).data('xindex');
        if (current.options.fadeTrans) {
          transImg = new Image();
          transImg.src = mObj.attr('src');
          trans = $(transImg);
          trans.css({position: 'absolute', top: mObj.offset().top, left: mObj.offset().left, width: mObj.width(), height: mObj.height()});
          $(document.body).append(trans);
          trans.fadeOut(200, function() {trans.remove()});
        }
        var _xorig = link.attr('href');
        var _prev = Obj.attr('xpreview') || Obj.attr('src');

        title = get_title(Obj);
        if (Obj.attr('title')) mObj.attr('title',Obj.attr('title'));

        //imgObj.attr('src',_xorig);
        mObj.attr('xoriginal',_xorig);
        mObj.removeAttr('style');
        mObj.attr('src', _prev);
        if (current.options.adaptive) {
          osw = mObj.width();
          osh = mObj.height();
        }
        //Prevent submit on click
        //return false;
      }

      if (current.options.hover) {
        link.xon('mouseenter', link, thumbchange);
      }
      link.xon('click', link, thumbchange);
    }

    this.init(opts);
  }

    $.fn.xzoom = function(options) {
      var mainObj;
      var secObj;

      if (this.selector) {
        var el = this.selector.split(",");
        for (var i in el) el[i] = $.trim(el[i]);
        this.each(function(index) {
          if (el.length == 1) {
            if (index == 0) {
              //Main window element
              mainObj = $(this);
            if (typeof(mainObj.data('xzoom')) !== 'undefined') return mainObj.data('xzoom');
              mainObj.x = new xobject(mainObj, options);
            } else if(typeof(mainObj.x) !== 'undefined') {
              //Thumbs
              secObj = $(this);
              mainObj.x.xappend(secObj);
            }
          } else {
            if ($(this).is(el[0]) && index == 0) {
              //Main window element
              mainObj = $(this);
            if (typeof(mainObj.data('xzoom')) !== 'undefined') return mainObj.data('xzoom');
              mainObj.x = new xobject(mainObj, options);
            } else if(typeof(mainObj.x) !== 'undefined' && !$(this).is(el[0])) {
              //Thumbs
              secObj = $(this);
              mainObj.x.xappend(secObj);
            }
          }
        });
      } else this.each(function(index) {
        if (index == 0) {
          //Main window element
          mainObj = $(this);
          if (typeof(mainObj.data('xzoom')) !== 'undefined') return mainObj.data('xzoom');
          mainObj.x = new xobject(mainObj, options);
        } else if(typeof(mainObj.x) !== 'undefined') {
          //Thumbs
          secObj = $(this);
          mainObj.x.xappend(secObj);
        }
      });
      if (typeof(mainObj) === 'undefined') return false;
      mainObj.data('xzoom', mainObj.x);

      //Fire event xzoom init
      $(mainObj).trigger('xzoom_ready');
      return mainObj.x;
    }

  $.fn.xzoom.defaults = {
    position: 'right', //top, left, right, bottom, inside, lens, fullscreen, #ID
    mposition: 'inside', //inside, fullscreen
    rootOutput: true,
    Xoffset: 0,
    Yoffset: 0,
    fadeIn: true,
    fadeTrans: true,
    fadeOut: false,
    smooth: true,
    smoothZoomMove: 3,
    smoothLensMove: 1,
    smoothScale: 6,
    defaultScale: 0, //from -1 to 1, that means -100% till 100% scale
    scroll: true,
    tint: false, //'#color'
    tintOpacity: 0.5,
    lens: false, //'#color'
    lensOpacity: 0.5,
    lensShape: 'box', //'box', 'circle'
    lensCollision: true,
    lensReverse: false,
    openOnSmall: true,
    zoomWidth: 'auto',
    zoomHeight: 'auto',
    sourceClass: 'xzoom-source',
    loadingClass: 'xzoom-loading',
    lensClass: 'xzoom-lens',
    zoomClass: 'xzoom-preview',
    activeClass: 'xactive',
    hover: false,
    adaptive: true,
    adaptiveReverse: false,
    title: false,
    titleClass: 'xzoom-caption',
    bg: false //zoom image output as background
  };
})(jQuery);
!function(i){"use strict";"function"==typeof define&&define.amd?define(["jquery"],i):"undefined"!=typeof exports?module.exports=i(require("jquery")):i(jQuery)}(function(i){"use strict";var e=window.Slick||{};(e=function(){var e=0;return function(t,o){var s,n=this;n.defaults={accessibility:!0,adaptiveHeight:!1,appendArrows:i(t),appendDots:i(t),arrows:!0,asNavFor:null,prevArrow:'<button class="slick-prev" aria-label="Previous" type="button">Previous</button>',nextArrow:'<button class="slick-next" aria-label="Next" type="button">Next</button>',autoplay:!1,autoplaySpeed:3e3,centerMode:!1,centerPadding:"50px",cssEase:"ease",customPaging:function(e,t){return i('<button type="button" />').text(t+1)},dots:!1,dotsClass:"slick-dots",draggable:!0,easing:"linear",edgeFriction:.35,fade:!1,focusOnSelect:!1,focusOnChange:!1,infinite:!0,initialSlide:0,lazyLoad:"ondemand",mobileFirst:!1,pauseOnHover:!0,pauseOnFocus:!0,pauseOnDotsHover:!1,respondTo:"window",responsive:null,rows:1,rtl:!1,slide:"",slidesPerRow:1,slidesToShow:1,slidesToScroll:1,speed:500,swipe:!0,swipeToSlide:!1,touchMove:!0,touchThreshold:5,useCSS:!0,useTransform:!0,variableWidth:!1,vertical:!1,verticalSwiping:!1,waitForAnimate:!0,zIndex:1e3},n.initials={animating:!1,dragging:!1,autoPlayTimer:null,currentDirection:0,currentLeft:null,currentSlide:0,direction:1,$dots:null,listWidth:null,listHeight:null,loadIndex:0,$nextArrow:null,$prevArrow:null,scrolling:!1,slideCount:null,slideWidth:null,$slideTrack:null,$slides:null,sliding:!1,slideOffset:0,swipeLeft:null,swiping:!1,$list:null,touchObject:{},transformsEnabled:!1,unslicked:!1},i.extend(n,n.initials),n.activeBreakpoint=null,n.animType=null,n.animProp=null,n.breakpoints=[],n.breakpointSettings=[],n.cssTransitions=!1,n.focussed=!1,n.interrupted=!1,n.hidden="hidden",n.paused=!0,n.positionProp=null,n.respondTo=null,n.rowCount=1,n.shouldClick=!0,n.$slider=i(t),n.$slidesCache=null,n.transformType=null,n.transitionType=null,n.visibilityChange="visibilitychange",n.windowWidth=0,n.windowTimer=null,s=i(t).data("slick")||{},n.options=i.extend({},n.defaults,o,s),n.currentSlide=n.options.initialSlide,n.originalSettings=n.options,void 0!==document.mozHidden?(n.hidden="mozHidden",n.visibilityChange="mozvisibilitychange"):void 0!==document.webkitHidden&&(n.hidden="webkitHidden",n.visibilityChange="webkitvisibilitychange"),n.autoPlay=i.proxy(n.autoPlay,n),n.autoPlayClear=i.proxy(n.autoPlayClear,n),n.autoPlayIterator=i.proxy(n.autoPlayIterator,n),n.changeSlide=i.proxy(n.changeSlide,n),n.clickHandler=i.proxy(n.clickHandler,n),n.selectHandler=i.proxy(n.selectHandler,n),n.setPosition=i.proxy(n.setPosition,n),n.swipeHandler=i.proxy(n.swipeHandler,n),n.dragHandler=i.proxy(n.dragHandler,n),n.keyHandler=i.proxy(n.keyHandler,n),n.instanceUid=e++,n.htmlExpr=/^(?:\s*(<[\w\W]+>)[^>]*)$/,n.registerBreakpoints(),n.init(!0)}}()).prototype.activateADA=function(){this.$slideTrack.find(".slick-active").attr({"aria-hidden":"false"}).find("a, input, button, select").attr({tabindex:"0"})},e.prototype.addSlide=e.prototype.slickAdd=function(e,t,o){var s=this;if("boolean"==typeof t)o=t,t=null;else if(t<0||t>=s.slideCount)return!1;s.unload(),"number"==typeof t?0===t&&0===s.$slides.length?i(e).appendTo(s.$slideTrack):o?i(e).insertBefore(s.$slides.eq(t)):i(e).insertAfter(s.$slides.eq(t)):!0===o?i(e).prependTo(s.$slideTrack):i(e).appendTo(s.$slideTrack),s.$slides=s.$slideTrack.children(this.options.slide),s.$slideTrack.children(this.options.slide).detach(),s.$slideTrack.append(s.$slides),s.$slides.each(function(e,t){i(t).attr("data-slick-index",e)}),s.$slidesCache=s.$slides,s.reinit()},e.prototype.animateHeight=function(){var i=this;if(1===i.options.slidesToShow&&!0===i.options.adaptiveHeight&&!1===i.options.vertical){var e=i.$slides.eq(i.currentSlide).outerHeight(!0);i.$list.animate({height:e},i.options.speed)}},e.prototype.animateSlide=function(e,t){var o={},s=this;s.animateHeight(),!0===s.options.rtl&&!1===s.options.vertical&&(e=-e),!1===s.transformsEnabled?!1===s.options.vertical?s.$slideTrack.animate({left:e},s.options.speed,s.options.easing,t):s.$slideTrack.animate({top:e},s.options.speed,s.options.easing,t):!1===s.cssTransitions?(!0===s.options.rtl&&(s.currentLeft=-s.currentLeft),i({animStart:s.currentLeft}).animate({animStart:e},{duration:s.options.speed,easing:s.options.easing,step:function(i){i=Math.ceil(i),!1===s.options.vertical?(o[s.animType]="translate("+i+"px, 0px)",s.$slideTrack.css(o)):(o[s.animType]="translate(0px,"+i+"px)",s.$slideTrack.css(o))},complete:function(){t&&t.call()}})):(s.applyTransition(),e=Math.ceil(e),!1===s.options.vertical?o[s.animType]="translate3d("+e+"px, 0px, 0px)":o[s.animType]="translate3d(0px,"+e+"px, 0px)",s.$slideTrack.css(o),t&&setTimeout(function(){s.disableTransition(),t.call()},s.options.speed))},e.prototype.getNavTarget=function(){var e=this,t=e.options.asNavFor;return t&&null!==t&&(t=i(t).not(e.$slider)),t},e.prototype.asNavFor=function(e){var t=this.getNavTarget();null!==t&&"object"==typeof t&&t.each(function(){var t=i(this).slick("getSlick");t.unslicked||t.slideHandler(e,!0)})},e.prototype.applyTransition=function(i){var e=this,t={};!1===e.options.fade?t[e.transitionType]=e.transformType+" "+e.options.speed+"ms "+e.options.cssEase:t[e.transitionType]="opacity "+e.options.speed+"ms "+e.options.cssEase,!1===e.options.fade?e.$slideTrack.css(t):e.$slides.eq(i).css(t)},e.prototype.autoPlay=function(){var i=this;i.autoPlayClear(),i.slideCount>i.options.slidesToShow&&(i.autoPlayTimer=setInterval(i.autoPlayIterator,i.options.autoplaySpeed))},e.prototype.autoPlayClear=function(){var i=this;i.autoPlayTimer&&clearInterval(i.autoPlayTimer)},e.prototype.autoPlayIterator=function(){var i=this,e=i.currentSlide+i.options.slidesToScroll;i.paused||i.interrupted||i.focussed||(!1===i.options.infinite&&(1===i.direction&&i.currentSlide+1===i.slideCount-1?i.direction=0:0===i.direction&&(e=i.currentSlide-i.options.slidesToScroll,i.currentSlide-1==0&&(i.direction=1))),i.slideHandler(e))},e.prototype.buildArrows=function(){var e=this;!0===e.options.arrows&&(e.$prevArrow=i(e.options.prevArrow).addClass("slick-arrow"),e.$nextArrow=i(e.options.nextArrow).addClass("slick-arrow"),e.slideCount>e.options.slidesToShow?(e.$prevArrow.removeClass("slick-hidden").removeAttr("aria-hidden tabindex"),e.$nextArrow.removeClass("slick-hidden").removeAttr("aria-hidden tabindex"),e.htmlExpr.test(e.options.prevArrow)&&e.$prevArrow.prependTo(e.options.appendArrows),e.htmlExpr.test(e.options.nextArrow)&&e.$nextArrow.appendTo(e.options.appendArrows),!0!==e.options.infinite&&e.$prevArrow.addClass("slick-disabled").attr("aria-disabled","true")):e.$prevArrow.add(e.$nextArrow).addClass("slick-hidden").attr({"aria-disabled":"true",tabindex:"-1"}))},e.prototype.buildDots=function(){var e,t,o=this;if(!0===o.options.dots){for(o.$slider.addClass("slick-dotted"),t=i("<ul />").addClass(o.options.dotsClass),e=0;e<=o.getDotCount();e+=1)t.append(i("<li />").append(o.options.customPaging.call(this,o,e)));o.$dots=t.appendTo(o.options.appendDots),o.$dots.find("li").first().addClass("slick-active")}},e.prototype.buildOut=function(){var e=this;e.$slides=e.$slider.children(e.options.slide+":not(.slick-cloned)").addClass("slick-slide"),e.slideCount=e.$slides.length,e.$slides.each(function(e,t){i(t).attr("data-slick-index",e).data("originalStyling",i(t).attr("style")||"")}),e.$slider.addClass("slick-slider"),e.$slideTrack=0===e.slideCount?i('<div class="slick-track"/>').appendTo(e.$slider):e.$slides.wrapAll('<div class="slick-track"/>').parent(),e.$list=e.$slideTrack.wrap('<div class="slick-list"/>').parent(),e.$slideTrack.css("opacity",0),!0!==e.options.centerMode&&!0!==e.options.swipeToSlide||(e.options.slidesToScroll=1),i("img[data-lazy]",e.$slider).not("[src]").addClass("slick-loading"),e.setupInfinite(),e.buildArrows(),e.buildDots(),e.updateDots(),e.setSlideClasses("number"==typeof e.currentSlide?e.currentSlide:0),!0===e.options.draggable&&e.$list.addClass("draggable")},e.prototype.buildRows=function(){var i,e,t,o,s,n,r,l=this;if(o=document.createDocumentFragment(),n=l.$slider.children(),l.options.rows>1){for(r=l.options.slidesPerRow*l.options.rows,s=Math.ceil(n.length/r),i=0;i<s;i++){var d=document.createElement("div");for(e=0;e<l.options.rows;e++){var a=document.createElement("div");for(t=0;t<l.options.slidesPerRow;t++){var c=i*r+(e*l.options.slidesPerRow+t);n.get(c)&&a.appendChild(n.get(c))}d.appendChild(a)}o.appendChild(d)}l.$slider.empty().append(o),l.$slider.children().children().children().css({width:100/l.options.slidesPerRow+"%",display:"inline-block"})}},e.prototype.checkResponsive=function(e,t){var o,s,n,r=this,l=!1,d=r.$slider.width(),a=window.innerWidth||i(window).width();if("window"===r.respondTo?n=a:"slider"===r.respondTo?n=d:"min"===r.respondTo&&(n=Math.min(a,d)),r.options.responsive&&r.options.responsive.length&&null!==r.options.responsive){s=null;for(o in r.breakpoints)r.breakpoints.hasOwnProperty(o)&&(!1===r.originalSettings.mobileFirst?n<r.breakpoints[o]&&(s=r.breakpoints[o]):n>r.breakpoints[o]&&(s=r.breakpoints[o]));null!==s?null!==r.activeBreakpoint?(s!==r.activeBreakpoint||t)&&(r.activeBreakpoint=s,"unslick"===r.breakpointSettings[s]?r.unslick(s):(r.options=i.extend({},r.originalSettings,r.breakpointSettings[s]),!0===e&&(r.currentSlide=r.options.initialSlide),r.refresh(e)),l=s):(r.activeBreakpoint=s,"unslick"===r.breakpointSettings[s]?r.unslick(s):(r.options=i.extend({},r.originalSettings,r.breakpointSettings[s]),!0===e&&(r.currentSlide=r.options.initialSlide),r.refresh(e)),l=s):null!==r.activeBreakpoint&&(r.activeBreakpoint=null,r.options=r.originalSettings,!0===e&&(r.currentSlide=r.options.initialSlide),r.refresh(e),l=s),e||!1===l||r.$slider.trigger("breakpoint",[r,l])}},e.prototype.changeSlide=function(e,t){var o,s,n,r=this,l=i(e.currentTarget);switch(l.is("a")&&e.preventDefault(),l.is("li")||(l=l.closest("li")),n=r.slideCount%r.options.slidesToScroll!=0,o=n?0:(r.slideCount-r.currentSlide)%r.options.slidesToScroll,e.data.message){case"previous":s=0===o?r.options.slidesToScroll:r.options.slidesToShow-o,r.slideCount>r.options.slidesToShow&&r.slideHandler(r.currentSlide-s,!1,t);break;case"next":s=0===o?r.options.slidesToScroll:o,r.slideCount>r.options.slidesToShow&&r.slideHandler(r.currentSlide+s,!1,t);break;case"index":var d=0===e.data.index?0:e.data.index||l.index()*r.options.slidesToScroll;r.slideHandler(r.checkNavigable(d),!1,t),l.children().trigger("focus");break;default:return}},e.prototype.checkNavigable=function(i){var e,t;if(e=this.getNavigableIndexes(),t=0,i>e[e.length-1])i=e[e.length-1];else for(var o in e){if(i<e[o]){i=t;break}t=e[o]}return i},e.prototype.cleanUpEvents=function(){var e=this;e.options.dots&&null!==e.$dots&&(i("li",e.$dots).off("click.slick",e.changeSlide).off("mouseenter.slick",i.proxy(e.interrupt,e,!0)).off("mouseleave.slick",i.proxy(e.interrupt,e,!1)),!0===e.options.accessibility&&e.$dots.off("keydown.slick",e.keyHandler)),e.$slider.off("focus.slick blur.slick"),!0===e.options.arrows&&e.slideCount>e.options.slidesToShow&&(e.$prevArrow&&e.$prevArrow.off("click.slick",e.changeSlide),e.$nextArrow&&e.$nextArrow.off("click.slick",e.changeSlide),!0===e.options.accessibility&&(e.$prevArrow&&e.$prevArrow.off("keydown.slick",e.keyHandler),e.$nextArrow&&e.$nextArrow.off("keydown.slick",e.keyHandler))),e.$list.off("touchstart.slick mousedown.slick",e.swipeHandler),e.$list.off("touchmove.slick mousemove.slick",e.swipeHandler),e.$list.off("touchend.slick mouseup.slick",e.swipeHandler),e.$list.off("touchcancel.slick mouseleave.slick",e.swipeHandler),e.$list.off("click.slick",e.clickHandler),i(document).off(e.visibilityChange,e.visibility),e.cleanUpSlideEvents(),!0===e.options.accessibility&&e.$list.off("keydown.slick",e.keyHandler),!0===e.options.focusOnSelect&&i(e.$slideTrack).children().off("click.slick",e.selectHandler),i(window).off("orientationchange.slick.slick-"+e.instanceUid,e.orientationChange),i(window).off("resize.slick.slick-"+e.instanceUid,e.resize),i("[draggable!=true]",e.$slideTrack).off("dragstart",e.preventDefault),i(window).off("load.slick.slick-"+e.instanceUid,e.setPosition)},e.prototype.cleanUpSlideEvents=function(){var e=this;e.$list.off("mouseenter.slick",i.proxy(e.interrupt,e,!0)),e.$list.off("mouseleave.slick",i.proxy(e.interrupt,e,!1))},e.prototype.cleanUpRows=function(){var i,e=this;e.options.rows>1&&((i=e.$slides.children().children()).removeAttr("style"),e.$slider.empty().append(i))},e.prototype.clickHandler=function(i){!1===this.shouldClick&&(i.stopImmediatePropagation(),i.stopPropagation(),i.preventDefault())},e.prototype.destroy=function(e){var t=this;t.autoPlayClear(),t.touchObject={},t.cleanUpEvents(),i(".slick-cloned",t.$slider).detach(),t.$dots&&t.$dots.remove(),t.$prevArrow&&t.$prevArrow.length&&(t.$prevArrow.removeClass("slick-disabled slick-arrow slick-hidden").removeAttr("aria-hidden aria-disabled tabindex").css("display",""),t.htmlExpr.test(t.options.prevArrow)&&t.$prevArrow.remove()),t.$nextArrow&&t.$nextArrow.length&&(t.$nextArrow.removeClass("slick-disabled slick-arrow slick-hidden").removeAttr("aria-hidden aria-disabled tabindex").css("display",""),t.htmlExpr.test(t.options.nextArrow)&&t.$nextArrow.remove()),t.$slides&&(t.$slides.removeClass("slick-slide slick-active slick-center slick-visible slick-current").removeAttr("aria-hidden").removeAttr("data-slick-index").each(function(){i(this).attr("style",i(this).data("originalStyling"))}),t.$slideTrack.children(this.options.slide).detach(),t.$slideTrack.detach(),t.$list.detach(),t.$slider.append(t.$slides)),t.cleanUpRows(),t.$slider.removeClass("slick-slider"),t.$slider.removeClass("slick-initialized"),t.$slider.removeClass("slick-dotted"),t.unslicked=!0,e||t.$slider.trigger("destroy",[t])},e.prototype.disableTransition=function(i){var e=this,t={};t[e.transitionType]="",!1===e.options.fade?e.$slideTrack.css(t):e.$slides.eq(i).css(t)},e.prototype.fadeSlide=function(i,e){var t=this;!1===t.cssTransitions?(t.$slides.eq(i).css({zIndex:t.options.zIndex}),t.$slides.eq(i).animate({opacity:1},t.options.speed,t.options.easing,e)):(t.applyTransition(i),t.$slides.eq(i).css({opacity:1,zIndex:t.options.zIndex}),e&&setTimeout(function(){t.disableTransition(i),e.call()},t.options.speed))},e.prototype.fadeSlideOut=function(i){var e=this;!1===e.cssTransitions?e.$slides.eq(i).animate({opacity:0,zIndex:e.options.zIndex-2},e.options.speed,e.options.easing):(e.applyTransition(i),e.$slides.eq(i).css({opacity:0,zIndex:e.options.zIndex-2}))},e.prototype.filterSlides=e.prototype.slickFilter=function(i){var e=this;null!==i&&(e.$slidesCache=e.$slides,e.unload(),e.$slideTrack.children(this.options.slide).detach(),e.$slidesCache.filter(i).appendTo(e.$slideTrack),e.reinit())},e.prototype.focusHandler=function(){var e=this;e.$slider.off("focus.slick blur.slick").on("focus.slick blur.slick","*",function(t){t.stopImmediatePropagation();var o=i(this);setTimeout(function(){e.options.pauseOnFocus&&(e.focussed=o.is(":focus"),e.autoPlay())},0)})},e.prototype.getCurrent=e.prototype.slickCurrentSlide=function(){return this.currentSlide},e.prototype.getDotCount=function(){var i=this,e=0,t=0,o=0;if(!0===i.options.infinite)if(i.slideCount<=i.options.slidesToShow)++o;else for(;e<i.slideCount;)++o,e=t+i.options.slidesToScroll,t+=i.options.slidesToScroll<=i.options.slidesToShow?i.options.slidesToScroll:i.options.slidesToShow;else if(!0===i.options.centerMode)o=i.slideCount;else if(i.options.asNavFor)for(;e<i.slideCount;)++o,e=t+i.options.slidesToScroll,t+=i.options.slidesToScroll<=i.options.slidesToShow?i.options.slidesToScroll:i.options.slidesToShow;else o=1+Math.ceil((i.slideCount-i.options.slidesToShow)/i.options.slidesToScroll);return o-1},e.prototype.getLeft=function(i){var e,t,o,s,n=this,r=0;return n.slideOffset=0,t=n.$slides.first().outerHeight(!0),!0===n.options.infinite?(n.slideCount>n.options.slidesToShow&&(n.slideOffset=n.slideWidth*n.options.slidesToShow*-1,s=-1,!0===n.options.vertical&&!0===n.options.centerMode&&(2===n.options.slidesToShow?s=-1.5:1===n.options.slidesToShow&&(s=-2)),r=t*n.options.slidesToShow*s),n.slideCount%n.options.slidesToScroll!=0&&i+n.options.slidesToScroll>n.slideCount&&n.slideCount>n.options.slidesToShow&&(i>n.slideCount?(n.slideOffset=(n.options.slidesToShow-(i-n.slideCount))*n.slideWidth*-1,r=(n.options.slidesToShow-(i-n.slideCount))*t*-1):(n.slideOffset=n.slideCount%n.options.slidesToScroll*n.slideWidth*-1,r=n.slideCount%n.options.slidesToScroll*t*-1))):i+n.options.slidesToShow>n.slideCount&&(n.slideOffset=(i+n.options.slidesToShow-n.slideCount)*n.slideWidth,r=(i+n.options.slidesToShow-n.slideCount)*t),n.slideCount<=n.options.slidesToShow&&(n.slideOffset=0,r=0),!0===n.options.centerMode&&n.slideCount<=n.options.slidesToShow?n.slideOffset=n.slideWidth*Math.floor(n.options.slidesToShow)/2-n.slideWidth*n.slideCount/2:!0===n.options.centerMode&&!0===n.options.infinite?n.slideOffset+=n.slideWidth*Math.floor(n.options.slidesToShow/2)-n.slideWidth:!0===n.options.centerMode&&(n.slideOffset=0,n.slideOffset+=n.slideWidth*Math.floor(n.options.slidesToShow/2)),e=!1===n.options.vertical?i*n.slideWidth*-1+n.slideOffset:i*t*-1+r,!0===n.options.variableWidth&&(o=n.slideCount<=n.options.slidesToShow||!1===n.options.infinite?n.$slideTrack.children(".slick-slide").eq(i):n.$slideTrack.children(".slick-slide").eq(i+n.options.slidesToShow),e=!0===n.options.rtl?o[0]?-1*(n.$slideTrack.width()-o[0].offsetLeft-o.width()):0:o[0]?-1*o[0].offsetLeft:0,!0===n.options.centerMode&&(o=n.slideCount<=n.options.slidesToShow||!1===n.options.infinite?n.$slideTrack.children(".slick-slide").eq(i):n.$slideTrack.children(".slick-slide").eq(i+n.options.slidesToShow+1),e=!0===n.options.rtl?o[0]?-1*(n.$slideTrack.width()-o[0].offsetLeft-o.width()):0:o[0]?-1*o[0].offsetLeft:0,e+=(n.$list.width()-o.outerWidth())/2)),e},e.prototype.getOption=e.prototype.slickGetOption=function(i){return this.options[i]},e.prototype.getNavigableIndexes=function(){var i,e=this,t=0,o=0,s=[];for(!1===e.options.infinite?i=e.slideCount:(t=-1*e.options.slidesToScroll,o=-1*e.options.slidesToScroll,i=2*e.slideCount);t<i;)s.push(t),t=o+e.options.slidesToScroll,o+=e.options.slidesToScroll<=e.options.slidesToShow?e.options.slidesToScroll:e.options.slidesToShow;return s},e.prototype.getSlick=function(){return this},e.prototype.getSlideCount=function(){var e,t,o=this;return t=!0===o.options.centerMode?o.slideWidth*Math.floor(o.options.slidesToShow/2):0,!0===o.options.swipeToSlide?(o.$slideTrack.find(".slick-slide").each(function(s,n){if(n.offsetLeft-t+i(n).outerWidth()/2>-1*o.swipeLeft)return e=n,!1}),Math.abs(i(e).attr("data-slick-index")-o.currentSlide)||1):o.options.slidesToScroll},e.prototype.goTo=e.prototype.slickGoTo=function(i,e){this.changeSlide({data:{message:"index",index:parseInt(i)}},e)},e.prototype.init=function(e){var t=this;i(t.$slider).hasClass("slick-initialized")||(i(t.$slider).addClass("slick-initialized"),t.buildRows(),t.buildOut(),t.setProps(),t.startLoad(),t.loadSlider(),t.initializeEvents(),t.updateArrows(),t.updateDots(),t.checkResponsive(!0),t.focusHandler()),e&&t.$slider.trigger("init",[t]),!0===t.options.accessibility&&t.initADA(),t.options.autoplay&&(t.paused=!1,t.autoPlay())},e.prototype.initADA=function(){var e=this,t=Math.ceil(e.slideCount/e.options.slidesToShow),o=e.getNavigableIndexes().filter(function(i){return i>=0&&i<e.slideCount});e.$slides.add(e.$slideTrack.find(".slick-cloned")).attr({"aria-hidden":"true",tabindex:"-1"}).find("a, input, button, select").attr({tabindex:"-1"}),null!==e.$dots&&(e.$slides.not(e.$slideTrack.find(".slick-cloned")).each(function(t){var s=o.indexOf(t);i(this).attr({role:"tabpanel",id:"slick-slide"+e.instanceUid+t,tabindex:-1}),-1!==s&&i(this).attr({"aria-describedby":"slick-slide-control"+e.instanceUid+s})}),e.$dots.attr("role","tablist").find("li").each(function(s){var n=o[s];i(this).attr({role:"presentation"}),i(this).find("button").first().attr({role:"tab",id:"slick-slide-control"+e.instanceUid+s,"aria-controls":"slick-slide"+e.instanceUid+n,"aria-label":s+1+" of "+t,"aria-selected":null,tabindex:"-1"})}).eq(e.currentSlide).find("button").attr({"aria-selected":"true",tabindex:"0"}).end());for(var s=e.currentSlide,n=s+e.options.slidesToShow;s<n;s++)e.$slides.eq(s).attr("tabindex",0);e.activateADA()},e.prototype.initArrowEvents=function(){var i=this;!0===i.options.arrows&&i.slideCount>i.options.slidesToShow&&(i.$prevArrow.off("click.slick").on("click.slick",{message:"previous"},i.changeSlide),i.$nextArrow.off("click.slick").on("click.slick",{message:"next"},i.changeSlide),!0===i.options.accessibility&&(i.$prevArrow.on("keydown.slick",i.keyHandler),i.$nextArrow.on("keydown.slick",i.keyHandler)))},e.prototype.initDotEvents=function(){var e=this;!0===e.options.dots&&(i("li",e.$dots).on("click.slick",{message:"index"},e.changeSlide),!0===e.options.accessibility&&e.$dots.on("keydown.slick",e.keyHandler)),!0===e.options.dots&&!0===e.options.pauseOnDotsHover&&i("li",e.$dots).on("mouseenter.slick",i.proxy(e.interrupt,e,!0)).on("mouseleave.slick",i.proxy(e.interrupt,e,!1))},e.prototype.initSlideEvents=function(){var e=this;e.options.pauseOnHover&&(e.$list.on("mouseenter.slick",i.proxy(e.interrupt,e,!0)),e.$list.on("mouseleave.slick",i.proxy(e.interrupt,e,!1)))},e.prototype.initializeEvents=function(){var e=this;e.initArrowEvents(),e.initDotEvents(),e.initSlideEvents(),e.$list.on("touchstart.slick mousedown.slick",{action:"start"},e.swipeHandler),e.$list.on("touchmove.slick mousemove.slick",{action:"move"},e.swipeHandler),e.$list.on("touchend.slick mouseup.slick",{action:"end"},e.swipeHandler),e.$list.on("touchcancel.slick mouseleave.slick",{action:"end"},e.swipeHandler),e.$list.on("click.slick",e.clickHandler),i(document).on(e.visibilityChange,i.proxy(e.visibility,e)),!0===e.options.accessibility&&e.$list.on("keydown.slick",e.keyHandler),!0===e.options.focusOnSelect&&i(e.$slideTrack).children().on("click.slick",e.selectHandler),i(window).on("orientationchange.slick.slick-"+e.instanceUid,i.proxy(e.orientationChange,e)),i(window).on("resize.slick.slick-"+e.instanceUid,i.proxy(e.resize,e)),i("[draggable!=true]",e.$slideTrack).on("dragstart",e.preventDefault),i(window).on("load.slick.slick-"+e.instanceUid,e.setPosition),i(e.setPosition)},e.prototype.initUI=function(){var i=this;!0===i.options.arrows&&i.slideCount>i.options.slidesToShow&&(i.$prevArrow.show(),i.$nextArrow.show()),!0===i.options.dots&&i.slideCount>i.options.slidesToShow&&i.$dots.show()},e.prototype.keyHandler=function(i){var e=this;i.target.tagName.match("TEXTAREA|INPUT|SELECT")||(37===i.keyCode&&!0===e.options.accessibility?e.changeSlide({data:{message:!0===e.options.rtl?"next":"previous"}}):39===i.keyCode&&!0===e.options.accessibility&&e.changeSlide({data:{message:!0===e.options.rtl?"previous":"next"}}))},e.prototype.lazyLoad=function(){function e(e){i("img[data-lazy]",e).each(function(){var e=i(this),t=i(this).attr("data-lazy"),o=i(this).attr("data-srcset"),s=i(this).attr("data-sizes")||n.$slider.attr("data-sizes"),r=document.createElement("img");r.onload=function(){e.animate({opacity:0},100,function(){o&&(e.attr("srcset",o),s&&e.attr("sizes",s)),e.attr("src",t).animate({opacity:1},200,function(){e.removeAttr("data-lazy data-srcset data-sizes").removeClass("slick-loading")}),n.$slider.trigger("lazyLoaded",[n,e,t])})},r.onerror=function(){e.removeAttr("data-lazy").removeClass("slick-loading").addClass("slick-lazyload-error"),n.$slider.trigger("lazyLoadError",[n,e,t])},r.src=t})}var t,o,s,n=this;if(!0===n.options.centerMode?!0===n.options.infinite?s=(o=n.currentSlide+(n.options.slidesToShow/2+1))+n.options.slidesToShow+2:(o=Math.max(0,n.currentSlide-(n.options.slidesToShow/2+1)),s=n.options.slidesToShow/2+1+2+n.currentSlide):(o=n.options.infinite?n.options.slidesToShow+n.currentSlide:n.currentSlide,s=Math.ceil(o+n.options.slidesToShow),!0===n.options.fade&&(o>0&&o--,s<=n.slideCount&&s++)),t=n.$slider.find(".slick-slide").slice(o,s),"anticipated"===n.options.lazyLoad)for(var r=o-1,l=s,d=n.$slider.find(".slick-slide"),a=0;a<n.options.slidesToScroll;a++)r<0&&(r=n.slideCount-1),t=(t=t.add(d.eq(r))).add(d.eq(l)),r--,l++;e(t),n.slideCount<=n.options.slidesToShow?e(n.$slider.find(".slick-slide")):n.currentSlide>=n.slideCount-n.options.slidesToShow?e(n.$slider.find(".slick-cloned").slice(0,n.options.slidesToShow)):0===n.currentSlide&&e(n.$slider.find(".slick-cloned").slice(-1*n.options.slidesToShow))},e.prototype.loadSlider=function(){var i=this;i.setPosition(),i.$slideTrack.css({opacity:1}),i.$slider.removeClass("slick-loading"),i.initUI(),"progressive"===i.options.lazyLoad&&i.progressiveLazyLoad()},e.prototype.next=e.prototype.slickNext=function(){this.changeSlide({data:{message:"next"}})},e.prototype.orientationChange=function(){var i=this;i.checkResponsive(),i.setPosition()},e.prototype.pause=e.prototype.slickPause=function(){var i=this;i.autoPlayClear(),i.paused=!0},e.prototype.play=e.prototype.slickPlay=function(){var i=this;i.autoPlay(),i.options.autoplay=!0,i.paused=!1,i.focussed=!1,i.interrupted=!1},e.prototype.postSlide=function(e){var t=this;t.unslicked||(t.$slider.trigger("afterChange",[t,e]),t.animating=!1,t.slideCount>t.options.slidesToShow&&t.setPosition(),t.swipeLeft=null,t.options.autoplay&&t.autoPlay(),!0===t.options.accessibility&&(t.initADA(),t.options.focusOnChange&&i(t.$slides.get(t.currentSlide)).attr("tabindex",0).focus()))},e.prototype.prev=e.prototype.slickPrev=function(){this.changeSlide({data:{message:"previous"}})},e.prototype.preventDefault=function(i){i.preventDefault()},e.prototype.progressiveLazyLoad=function(e){e=e||1;var t,o,s,n,r,l=this,d=i("img[data-lazy]",l.$slider);d.length?(t=d.first(),o=t.attr("data-lazy"),s=t.attr("data-srcset"),n=t.attr("data-sizes")||l.$slider.attr("data-sizes"),(r=document.createElement("img")).onload=function(){s&&(t.attr("srcset",s),n&&t.attr("sizes",n)),t.attr("src",o).removeAttr("data-lazy data-srcset data-sizes").removeClass("slick-loading"),!0===l.options.adaptiveHeight&&l.setPosition(),l.$slider.trigger("lazyLoaded",[l,t,o]),l.progressiveLazyLoad()},r.onerror=function(){e<3?setTimeout(function(){l.progressiveLazyLoad(e+1)},500):(t.removeAttr("data-lazy").removeClass("slick-loading").addClass("slick-lazyload-error"),l.$slider.trigger("lazyLoadError",[l,t,o]),l.progressiveLazyLoad())},r.src=o):l.$slider.trigger("allImagesLoaded",[l])},e.prototype.refresh=function(e){var t,o,s=this;o=s.slideCount-s.options.slidesToShow,!s.options.infinite&&s.currentSlide>o&&(s.currentSlide=o),s.slideCount<=s.options.slidesToShow&&(s.currentSlide=0),t=s.currentSlide,s.destroy(!0),i.extend(s,s.initials,{currentSlide:t}),s.init(),e||s.changeSlide({data:{message:"index",index:t}},!1)},e.prototype.registerBreakpoints=function(){var e,t,o,s=this,n=s.options.responsive||null;if("array"===i.type(n)&&n.length){s.respondTo=s.options.respondTo||"window";for(e in n)if(o=s.breakpoints.length-1,n.hasOwnProperty(e)){for(t=n[e].breakpoint;o>=0;)s.breakpoints[o]&&s.breakpoints[o]===t&&s.breakpoints.splice(o,1),o--;s.breakpoints.push(t),s.breakpointSettings[t]=n[e].settings}s.breakpoints.sort(function(i,e){return s.options.mobileFirst?i-e:e-i})}},e.prototype.reinit=function(){var e=this;e.$slides=e.$slideTrack.children(e.options.slide).addClass("slick-slide"),e.slideCount=e.$slides.length,e.currentSlide>=e.slideCount&&0!==e.currentSlide&&(e.currentSlide=e.currentSlide-e.options.slidesToScroll),e.slideCount<=e.options.slidesToShow&&(e.currentSlide=0),e.registerBreakpoints(),e.setProps(),e.setupInfinite(),e.buildArrows(),e.updateArrows(),e.initArrowEvents(),e.buildDots(),e.updateDots(),e.initDotEvents(),e.cleanUpSlideEvents(),e.initSlideEvents(),e.checkResponsive(!1,!0),!0===e.options.focusOnSelect&&i(e.$slideTrack).children().on("click.slick",e.selectHandler),e.setSlideClasses("number"==typeof e.currentSlide?e.currentSlide:0),e.setPosition(),e.focusHandler(),e.paused=!e.options.autoplay,e.autoPlay(),e.$slider.trigger("reInit",[e])},e.prototype.resize=function(){var e=this;i(window).width()!==e.windowWidth&&(clearTimeout(e.windowDelay),e.windowDelay=window.setTimeout(function(){e.windowWidth=i(window).width(),e.checkResponsive(),e.unslicked||e.setPosition()},50))},e.prototype.removeSlide=e.prototype.slickRemove=function(i,e,t){var o=this;if(i="boolean"==typeof i?!0===(e=i)?0:o.slideCount-1:!0===e?--i:i,o.slideCount<1||i<0||i>o.slideCount-1)return!1;o.unload(),!0===t?o.$slideTrack.children().remove():o.$slideTrack.children(this.options.slide).eq(i).remove(),o.$slides=o.$slideTrack.children(this.options.slide),o.$slideTrack.children(this.options.slide).detach(),o.$slideTrack.append(o.$slides),o.$slidesCache=o.$slides,o.reinit()},e.prototype.setCSS=function(i){var e,t,o=this,s={};!0===o.options.rtl&&(i=-i),e="left"==o.positionProp?Math.ceil(i)+"px":"0px",t="top"==o.positionProp?Math.ceil(i)+"px":"0px",s[o.positionProp]=i,!1===o.transformsEnabled?o.$slideTrack.css(s):(s={},!1===o.cssTransitions?(s[o.animType]="translate("+e+", "+t+")",o.$slideTrack.css(s)):(s[o.animType]="translate3d("+e+", "+t+", 0px)",o.$slideTrack.css(s)))},e.prototype.setDimensions=function(){var i=this;!1===i.options.vertical?!0===i.options.centerMode&&i.$list.css({padding:"0px "+i.options.centerPadding}):(i.$list.height(i.$slides.first().outerHeight(!0)*i.options.slidesToShow),!0===i.options.centerMode&&i.$list.css({padding:i.options.centerPadding+" 0px"})),i.listWidth=i.$list.width(),i.listHeight=i.$list.height(),!1===i.options.vertical&&!1===i.options.variableWidth?(i.slideWidth=Math.ceil(i.listWidth/i.options.slidesToShow),i.$slideTrack.width(Math.ceil(i.slideWidth*i.$slideTrack.children(".slick-slide").length))):!0===i.options.variableWidth?i.$slideTrack.width(5e3*i.slideCount):(i.slideWidth=Math.ceil(i.listWidth),i.$slideTrack.height(Math.ceil(i.$slides.first().outerHeight(!0)*i.$slideTrack.children(".slick-slide").length)));var e=i.$slides.first().outerWidth(!0)-i.$slides.first().width();!1===i.options.variableWidth&&i.$slideTrack.children(".slick-slide").width(i.slideWidth-e)},e.prototype.setFade=function(){var e,t=this;t.$slides.each(function(o,s){e=t.slideWidth*o*-1,!0===t.options.rtl?i(s).css({position:"relative",right:e,top:0,zIndex:t.options.zIndex-2,opacity:0}):i(s).css({position:"relative",left:e,top:0,zIndex:t.options.zIndex-2,opacity:0})}),t.$slides.eq(t.currentSlide).css({zIndex:t.options.zIndex-1,opacity:1})},e.prototype.setHeight=function(){var i=this;if(1===i.options.slidesToShow&&!0===i.options.adaptiveHeight&&!1===i.options.vertical){var e=i.$slides.eq(i.currentSlide).outerHeight(!0);i.$list.css("height",e)}},e.prototype.setOption=e.prototype.slickSetOption=function(){var e,t,o,s,n,r=this,l=!1;if("object"===i.type(arguments[0])?(o=arguments[0],l=arguments[1],n="multiple"):"string"===i.type(arguments[0])&&(o=arguments[0],s=arguments[1],l=arguments[2],"responsive"===arguments[0]&&"array"===i.type(arguments[1])?n="responsive":void 0!==arguments[1]&&(n="single")),"single"===n)r.options[o]=s;else if("multiple"===n)i.each(o,function(i,e){r.options[i]=e});else if("responsive"===n)for(t in s)if("array"!==i.type(r.options.responsive))r.options.responsive=[s[t]];else{for(e=r.options.responsive.length-1;e>=0;)r.options.responsive[e].breakpoint===s[t].breakpoint&&r.options.responsive.splice(e,1),e--;r.options.responsive.push(s[t])}l&&(r.unload(),r.reinit())},e.prototype.setPosition=function(){var i=this;i.setDimensions(),i.setHeight(),!1===i.options.fade?i.setCSS(i.getLeft(i.currentSlide)):i.setFade(),i.$slider.trigger("setPosition",[i])},e.prototype.setProps=function(){var i=this,e=document.body.style;i.positionProp=!0===i.options.vertical?"top":"left","top"===i.positionProp?i.$slider.addClass("slick-vertical"):i.$slider.removeClass("slick-vertical"),void 0===e.WebkitTransition&&void 0===e.MozTransition&&void 0===e.msTransition||!0===i.options.useCSS&&(i.cssTransitions=!0),i.options.fade&&("number"==typeof i.options.zIndex?i.options.zIndex<3&&(i.options.zIndex=3):i.options.zIndex=i.defaults.zIndex),void 0!==e.OTransform&&(i.animType="OTransform",i.transformType="-o-transform",i.transitionType="OTransition",void 0===e.perspectiveProperty&&void 0===e.webkitPerspective&&(i.animType=!1)),void 0!==e.MozTransform&&(i.animType="MozTransform",i.transformType="-moz-transform",i.transitionType="MozTransition",void 0===e.perspectiveProperty&&void 0===e.MozPerspective&&(i.animType=!1)),void 0!==e.webkitTransform&&(i.animType="webkitTransform",i.transformType="-webkit-transform",i.transitionType="webkitTransition",void 0===e.perspectiveProperty&&void 0===e.webkitPerspective&&(i.animType=!1)),void 0!==e.msTransform&&(i.animType="msTransform",i.transformType="-ms-transform",i.transitionType="msTransition",void 0===e.msTransform&&(i.animType=!1)),void 0!==e.transform&&!1!==i.animType&&(i.animType="transform",i.transformType="transform",i.transitionType="transition"),i.transformsEnabled=i.options.useTransform&&null!==i.animType&&!1!==i.animType},e.prototype.setSlideClasses=function(i){var e,t,o,s,n=this;if(t=n.$slider.find(".slick-slide").removeClass("slick-active slick-center slick-current").attr("aria-hidden","true"),n.$slides.eq(i).addClass("slick-current"),!0===n.options.centerMode){var r=n.options.slidesToShow%2==0?1:0;e=Math.floor(n.options.slidesToShow/2),!0===n.options.infinite&&(i>=e&&i<=n.slideCount-1-e?n.$slides.slice(i-e+r,i+e+1).addClass("slick-active").attr("aria-hidden","false"):(o=n.options.slidesToShow+i,t.slice(o-e+1+r,o+e+2).addClass("slick-active").attr("aria-hidden","false")),0===i?t.eq(t.length-1-n.options.slidesToShow).addClass("slick-center"):i===n.slideCount-1&&t.eq(n.options.slidesToShow).addClass("slick-center")),n.$slides.eq(i).addClass("slick-center")}else i>=0&&i<=n.slideCount-n.options.slidesToShow?n.$slides.slice(i,i+n.options.slidesToShow).addClass("slick-active").attr("aria-hidden","false"):t.length<=n.options.slidesToShow?t.addClass("slick-active").attr("aria-hidden","false"):(s=n.slideCount%n.options.slidesToShow,o=!0===n.options.infinite?n.options.slidesToShow+i:i,n.options.slidesToShow==n.options.slidesToScroll&&n.slideCount-i<n.options.slidesToShow?t.slice(o-(n.options.slidesToShow-s),o+s).addClass("slick-active").attr("aria-hidden","false"):t.slice(o,o+n.options.slidesToShow).addClass("slick-active").attr("aria-hidden","false"));"ondemand"!==n.options.lazyLoad&&"anticipated"!==n.options.lazyLoad||n.lazyLoad()},e.prototype.setupInfinite=function(){var e,t,o,s=this;if(!0===s.options.fade&&(s.options.centerMode=!1),!0===s.options.infinite&&!1===s.options.fade&&(t=null,s.slideCount>s.options.slidesToShow)){for(o=!0===s.options.centerMode?s.options.slidesToShow+1:s.options.slidesToShow,e=s.slideCount;e>s.slideCount-o;e-=1)t=e-1,i(s.$slides[t]).clone(!0).attr("id","").attr("data-slick-index",t-s.slideCount).prependTo(s.$slideTrack).addClass("slick-cloned");for(e=0;e<o+s.slideCount;e+=1)t=e,i(s.$slides[t]).clone(!0).attr("id","").attr("data-slick-index",t+s.slideCount).appendTo(s.$slideTrack).addClass("slick-cloned");s.$slideTrack.find(".slick-cloned").find("[id]").each(function(){i(this).attr("id","")})}},e.prototype.interrupt=function(i){var e=this;i||e.autoPlay(),e.interrupted=i},e.prototype.selectHandler=function(e){var t=this,o=i(e.target).is(".slick-slide")?i(e.target):i(e.target).parents(".slick-slide"),s=parseInt(o.attr("data-slick-index"));s||(s=0),t.slideCount<=t.options.slidesToShow?t.slideHandler(s,!1,!0):t.slideHandler(s)},e.prototype.slideHandler=function(i,e,t){var o,s,n,r,l,d=null,a=this;if(e=e||!1,!(!0===a.animating&&!0===a.options.waitForAnimate||!0===a.options.fade&&a.currentSlide===i))if(!1===e&&a.asNavFor(i),o=i,d=a.getLeft(o),r=a.getLeft(a.currentSlide),a.currentLeft=null===a.swipeLeft?r:a.swipeLeft,!1===a.options.infinite&&!1===a.options.centerMode&&(i<0||i>a.getDotCount()*a.options.slidesToScroll))!1===a.options.fade&&(o=a.currentSlide,!0!==t?a.animateSlide(r,function(){a.postSlide(o)}):a.postSlide(o));else if(!1===a.options.infinite&&!0===a.options.centerMode&&(i<0||i>a.slideCount-a.options.slidesToScroll))!1===a.options.fade&&(o=a.currentSlide,!0!==t?a.animateSlide(r,function(){a.postSlide(o)}):a.postSlide(o));else{if(a.options.autoplay&&clearInterval(a.autoPlayTimer),s=o<0?a.slideCount%a.options.slidesToScroll!=0?a.slideCount-a.slideCount%a.options.slidesToScroll:a.slideCount+o:o>=a.slideCount?a.slideCount%a.options.slidesToScroll!=0?0:o-a.slideCount:o,a.animating=!0,a.$slider.trigger("beforeChange",[a,a.currentSlide,s]),n=a.currentSlide,a.currentSlide=s,a.setSlideClasses(a.currentSlide),a.options.asNavFor&&(l=(l=a.getNavTarget()).slick("getSlick")).slideCount<=l.options.slidesToShow&&l.setSlideClasses(a.currentSlide),a.updateDots(),a.updateArrows(),!0===a.options.fade)return!0!==t?(a.fadeSlideOut(n),a.fadeSlide(s,function(){a.postSlide(s)})):a.postSlide(s),void a.animateHeight();!0!==t?a.animateSlide(d,function(){a.postSlide(s)}):a.postSlide(s)}},e.prototype.startLoad=function(){var i=this;!0===i.options.arrows&&i.slideCount>i.options.slidesToShow&&(i.$prevArrow.hide(),i.$nextArrow.hide()),!0===i.options.dots&&i.slideCount>i.options.slidesToShow&&i.$dots.hide(),i.$slider.addClass("slick-loading")},e.prototype.swipeDirection=function(){var i,e,t,o,s=this;return i=s.touchObject.startX-s.touchObject.curX,e=s.touchObject.startY-s.touchObject.curY,t=Math.atan2(e,i),(o=Math.round(180*t/Math.PI))<0&&(o=360-Math.abs(o)),o<=45&&o>=0?!1===s.options.rtl?"left":"right":o<=360&&o>=315?!1===s.options.rtl?"left":"right":o>=135&&o<=225?!1===s.options.rtl?"right":"left":!0===s.options.verticalSwiping?o>=35&&o<=135?"down":"up":"vertical"},e.prototype.swipeEnd=function(i){var e,t,o=this;if(o.dragging=!1,o.swiping=!1,o.scrolling)return o.scrolling=!1,!1;if(o.interrupted=!1,o.shouldClick=!(o.touchObject.swipeLength>10),void 0===o.touchObject.curX)return!1;if(!0===o.touchObject.edgeHit&&o.$slider.trigger("edge",[o,o.swipeDirection()]),o.touchObject.swipeLength>=o.touchObject.minSwipe){switch(t=o.swipeDirection()){case"left":case"down":e=o.options.swipeToSlide?o.checkNavigable(o.currentSlide+o.getSlideCount()):o.currentSlide+o.getSlideCount(),o.currentDirection=0;break;case"right":case"up":e=o.options.swipeToSlide?o.checkNavigable(o.currentSlide-o.getSlideCount()):o.currentSlide-o.getSlideCount(),o.currentDirection=1}"vertical"!=t&&(o.slideHandler(e),o.touchObject={},o.$slider.trigger("swipe",[o,t]))}else o.touchObject.startX!==o.touchObject.curX&&(o.slideHandler(o.currentSlide),o.touchObject={})},e.prototype.swipeHandler=function(i){var e=this;if(!(!1===e.options.swipe||"ontouchend"in document&&!1===e.options.swipe||!1===e.options.draggable&&-1!==i.type.indexOf("mouse")))switch(e.touchObject.fingerCount=i.originalEvent&&void 0!==i.originalEvent.touches?i.originalEvent.touches.length:1,e.touchObject.minSwipe=e.listWidth/e.options.touchThreshold,!0===e.options.verticalSwiping&&(e.touchObject.minSwipe=e.listHeight/e.options.touchThreshold),i.data.action){case"start":e.swipeStart(i);break;case"move":e.swipeMove(i);break;case"end":e.swipeEnd(i)}},e.prototype.swipeMove=function(i){var e,t,o,s,n,r,l=this;return n=void 0!==i.originalEvent?i.originalEvent.touches:null,!(!l.dragging||l.scrolling||n&&1!==n.length)&&(e=l.getLeft(l.currentSlide),l.touchObject.curX=void 0!==n?n[0].pageX:i.clientX,l.touchObject.curY=void 0!==n?n[0].pageY:i.clientY,l.touchObject.swipeLength=Math.round(Math.sqrt(Math.pow(l.touchObject.curX-l.touchObject.startX,2))),r=Math.round(Math.sqrt(Math.pow(l.touchObject.curY-l.touchObject.startY,2))),!l.options.verticalSwiping&&!l.swiping&&r>4?(l.scrolling=!0,!1):(!0===l.options.verticalSwiping&&(l.touchObject.swipeLength=r),t=l.swipeDirection(),void 0!==i.originalEvent&&l.touchObject.swipeLength>4&&(l.swiping=!0,i.preventDefault()),s=(!1===l.options.rtl?1:-1)*(l.touchObject.curX>l.touchObject.startX?1:-1),!0===l.options.verticalSwiping&&(s=l.touchObject.curY>l.touchObject.startY?1:-1),o=l.touchObject.swipeLength,l.touchObject.edgeHit=!1,!1===l.options.infinite&&(0===l.currentSlide&&"right"===t||l.currentSlide>=l.getDotCount()&&"left"===t)&&(o=l.touchObject.swipeLength*l.options.edgeFriction,l.touchObject.edgeHit=!0),!1===l.options.vertical?l.swipeLeft=e+o*s:l.swipeLeft=e+o*(l.$list.height()/l.listWidth)*s,!0===l.options.verticalSwiping&&(l.swipeLeft=e+o*s),!0!==l.options.fade&&!1!==l.options.touchMove&&(!0===l.animating?(l.swipeLeft=null,!1):void l.setCSS(l.swipeLeft))))},e.prototype.swipeStart=function(i){var e,t=this;if(t.interrupted=!0,1!==t.touchObject.fingerCount||t.slideCount<=t.options.slidesToShow)return t.touchObject={},!1;void 0!==i.originalEvent&&void 0!==i.originalEvent.touches&&(e=i.originalEvent.touches[0]),t.touchObject.startX=t.touchObject.curX=void 0!==e?e.pageX:i.clientX,t.touchObject.startY=t.touchObject.curY=void 0!==e?e.pageY:i.clientY,t.dragging=!0},e.prototype.unfilterSlides=e.prototype.slickUnfilter=function(){var i=this;null!==i.$slidesCache&&(i.unload(),i.$slideTrack.children(this.options.slide).detach(),i.$slidesCache.appendTo(i.$slideTrack),i.reinit())},e.prototype.unload=function(){var e=this;i(".slick-cloned",e.$slider).remove(),e.$dots&&e.$dots.remove(),e.$prevArrow&&e.htmlExpr.test(e.options.prevArrow)&&e.$prevArrow.remove(),e.$nextArrow&&e.htmlExpr.test(e.options.nextArrow)&&e.$nextArrow.remove(),e.$slides.removeClass("slick-slide slick-active slick-visible slick-current").attr("aria-hidden","true").css("width","")},e.prototype.unslick=function(i){var e=this;e.$slider.trigger("unslick",[e,i]),e.destroy()},e.prototype.updateArrows=function(){var i=this;Math.floor(i.options.slidesToShow/2),!0===i.options.arrows&&i.slideCount>i.options.slidesToShow&&!i.options.infinite&&(i.$prevArrow.removeClass("slick-disabled").attr("aria-disabled","false"),i.$nextArrow.removeClass("slick-disabled").attr("aria-disabled","false"),0===i.currentSlide?(i.$prevArrow.addClass("slick-disabled").attr("aria-disabled","true"),i.$nextArrow.removeClass("slick-disabled").attr("aria-disabled","false")):i.currentSlide>=i.slideCount-i.options.slidesToShow&&!1===i.options.centerMode?(i.$nextArrow.addClass("slick-disabled").attr("aria-disabled","true"),i.$prevArrow.removeClass("slick-disabled").attr("aria-disabled","false")):i.currentSlide>=i.slideCount-1&&!0===i.options.centerMode&&(i.$nextArrow.addClass("slick-disabled").attr("aria-disabled","true"),i.$prevArrow.removeClass("slick-disabled").attr("aria-disabled","false")))},e.prototype.updateDots=function(){var i=this;null!==i.$dots&&(i.$dots.find("li").removeClass("slick-active").end(),i.$dots.find("li").eq(Math.floor(i.currentSlide/i.options.slidesToScroll)).addClass("slick-active"))},e.prototype.visibility=function(){var i=this;i.options.autoplay&&(document[i.hidden]?i.interrupted=!0:i.interrupted=!1)},i.fn.slick=function(){var i,t,o=this,s=arguments[0],n=Array.prototype.slice.call(arguments,1),r=o.length;for(i=0;i<r;i++)if("object"==typeof s||void 0===s?o[i].slick=new e(o[i],s):t=o[i].slick[s].apply(o[i].slick,n),void 0!==t)return t;return o}});

$(function() {
    var header = $('#header');
    var headerH = header.innerHeight();
    var scrollPos = $(window).scrollTop();

    var catalogBlock = $('#catalog');
    var navToggle = $('.jsNavToggle');
    var nav = $('#nav');

    var categoryFilterNav = $('[data-select]');
    var categoryFiltersDesktop = $('[data-filter]');

    var categoryFiltersMobile = $('[data-filter-mobile]');

    var filterButtonsDesktop = $('.jsFilterBtnDesktop');
    var filterButtonsMobile = $('.jsFilterBtnMobile');

    var dateFiltersMobile = $('.jsMbDateFilters');
    var priceFiltersMobile = $('.jsMbPriceFilters');

    var headerPopup = $('#headerPopup');
    
    function checkScroll( headerH, scrollPos ) {
        if( scrollPos > headerH ) {
            headerPopup.css('margin-top', '0');
        } else {
            headerPopup.css('margin-top', '-70px');
        }
    }
    
    checkScroll( headerH, scrollPos )
    
    $(window).on('scroll resize', function() {
        headerH = header.innerHeight();
        scrollPos = $(window).scrollTop();
    
        checkScroll( headerH, scrollPos );
    });
    var catalogLink = $('.jsCatalogLink');
    var catalogClose = $('#catalogClose');
    
    $(catalogLink).on('click', function(event) {
        if(nav.hasClass('show') && navToggle.hasClass('active')) {
            nav.removeClass('show');
            navToggle.removeClass('active');
        }
    
        if($(this).is('.jsPopup')) {
            event.preventDefault();
    
            catalogBlock.addClass('fixed-popup');
            catalogBlock.addClass('show');
            $('body').addClass('no-scroll');
        } else {
            event.preventDefault();
    
            catalogBlock.removeClass('fixed-popup');
            catalogBlock.addClass('show');
            $('body').addClass('no-scroll');
        }
    });
    
    $(catalogClose).on('click', function(event) {
        event.preventDefault();
    
        catalogBlock.removeClass('show');
        $('body').removeClass('no-scroll');
    });
    var modalCall = $('[data-modal]');
    var modalClose = $('[data-close]');
    
    modalCall.on('click', function(event) {
        event.preventDefault();
    
        var modalId = $(this).data('modal');
    
        $(modalId).addClass('show');
        $('body').addClass('no-scroll');
    
        setTimeout(function() {
            $(modalId).find('.modal__dialog').css({
                transform: "scale(1)"
            });
        }, 200);
    });
    
    modalClose.on('click', function(event) {
        event.preventDefault();
    
        var modalParent = $(this).parents('.modal');
    
        modalParent.find('.modal__dialog').css({
            transform: "scale(0)"
        });
    
        setTimeout(function() {
            modalParent.removeClass('show');
            $('body').removeClass('no-scroll');
        }, 200);
    });
    
    $('.modal').on('click', function() {
        var $this = $(this);
    
        $this.find('.modal__dialog').css({
            transform: "scale(0)"
        });
    
        setTimeout(function() {
            $this.removeClass('show');
            $('body').removeClass('no-scroll');
        }, 200);
    });
    
    $('.modal__dialog').on('click', function(event) {
        event.stopPropagation();
    });
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
    var regTabNav = $('[data-reg-tab]');
    var regTabContent = $('.jsRegTab');
    
    regTabNav.on('click', function() {
        regTabNav.removeClass('active');
        $(this).addClass('active');
    
        var regTabItem = $(this).data('reg-tab');
    
        regTabContent.removeClass('active');
        $(regTabItem).addClass('active');
    });
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
    var productTabNav = $('[data-product-tab]');
    var productContent = $('.jsProductTab');
    
    productTabNav.on('click', function() {
        productTabNav.removeClass('active');
        $(this).addClass('active');
    
        var productTabItem = $(this).data('product-tab');
    
        productContent.removeClass('active');
        $(productTabItem).addClass('active');
    });
    $(".xzoom, .xzoom-gallery").xzoom({
        tint: '#333', 
        Xoffset: 20,
        fadeIn: false,
        fadeTrans: false,
        fadeOut: false
    });
    var filterModalCall = $('[data-filter-modal]');
    var filterModalClose = $('[data-filter-close]');
    
    filterModalCall.on('click', function(event) {
        event.preventDefault();
    
        var filterModalId = $(this).data('filter-modal');
    
        $(filterModalId).addClass('show');
        $('body').addClass('no-scroll');
    
        setTimeout(function() {
            $(filterModalId).find('.filters__modal-dialog').css({
                transform: 'scale(1)'
            });
        }, 200);
    });
    
    filterModalClose.on('click', function(event) {
        event.preventDefault();
    
        var filterModalParent = $(this).parents('.filters__modal');
        
        $(filterModalParent).find('.filters__modal-dialog').css({
            transform: 'scale(0)'
        });
    
        setTimeout(function() {
            $(filterModalParent).removeClass('show');
            $('body').removeClass('no-scroll');
        }, 200);
    });
    
    $('.filters__modal').on('click', function() {
        var $this = $(this);
    
        $this.find('.filters__modal-dialog').css({
            transform: 'scale(0)'
        });
    
        setTimeout(function() {
            $this.removeClass('show');
            $('body').removeClass('no-scroll');
        }, 200);
    });
    
    $('.filters__modal-dialog').on('click', function(event) {
        event.stopPropagation();
    });
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
    var backTop = $('#backTop');
    
    function checkScrollForBackTop( headerH, scrollPos ) {
        if( scrollPos > headerH ) {
            backTop.addClass('show');
        } else {
            backTop.removeClass('show');
        }
    }
    
    checkScrollForBackTop( headerH, scrollPos );
    
    $(window).on('scroll resize', function() {
        headerH = header.innerHeight();
        scrollPos = $(window).scrollTop();
    
        checkScrollForBackTop( headerH, scrollPos );
    });
    
    
    backTop.on('click', function(event) {
        event.preventDefault();
    
        $('html, body').animate({
            scrollTop: 0
        }, 300);
    });

    $(window).on('load', function() {
        if( $(window).width() <= '991' ) {
            filterCategory('mobileFilter');
        } else {
            filterCategory('desktopFilter');
        }
    });
});