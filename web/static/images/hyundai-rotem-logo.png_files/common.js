define(["Swiper" ,"jquery", "bodyScrollLock"], function(Swiper, $, bodyScrollLock) {

// 퍼블 파일로 엎을 시 따로 체크해서 남겨야할 항목
	// mainPopupCalled() {...} 와 popupCalled() {...} 내의 닫기 {...} 내의 오늘 하루 보지 않기
	// 제일 하단부의 scrollSet() {...}

common = (function() {
	const $_window = $(window);
	  const $_header = $("header");
	  const $_footer = $("footer");
	  const $_body = $("body");
	  let $_mainVisHeight = $(".program-list .main-vis").outerHeight();
	  let $_windowOuterHeight = $_window.outerHeight();
	  let _device = "";
	  let _strBizTabStatus = false;
	  let _strProgramTabStatus = false;
	  let _strMainHeightTaller = false;
	  const _getScrollObjY = function () {
	    const _arrY = [];
	    $(".scroll-motion").each(function (q) {
	      if(window.innerWidth > 500) {
	        _arrY.push(parseInt($(".scroll-motion").eq(q).offset().top) + 0);
	      } else {
	        _arrY.push(parseInt($(".scroll-motion").eq(q).offset().top) + 90);
	      }
	    });

	    return _arrY;
	  };
	  return {
	    init() {
	      if (window.location.href.indexOf("http://html.rotem.easymedia") > -1 || window.location.href.indexOf('127.0.0.1') > -1) {
	        $_header.empty().load("../main/header.html");
	        $_footer.empty().load("../main/footer.html", function () {
	          common.navigation();
	          common.footer();
	          common.scroll();
	          common.resize();
	          common.headerPop();
	          common.swiper();
	        });
	      } else if (window.location.href.indexOf('eznet1') > -1) {
	        $_header.empty().load("../main/header.html");
	        $_footer.empty().load("../main/footer.html", function () {
	          common.navigation();
	          common.footer();
	          common.scroll();
	          common.resize();
	          common.headerPop();
	          common.swiper();
	        });
	      } else {
	        common.navigation();
	        common.footer();
	        common.scroll();
	        common.resize();
	        common.headerPop();
	        common.swiper();
	      }
	    },
	    deviceCheck() {
	      if(/Android/i.test(navigator.userAgent)) {
	        _device = 'android';
	      } else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
	        return navigator.userAgent.match(/(iPhone|iPod)/g) ? _device='ios' : _device='ipad';
	      }else {
	        _device = 'pc';
	      }

	      // 브라우저 체크
	      let agent = navigator.userAgent.toLowerCase(),
	        name = navigator.appName;

	      if(name === 'Microsoft Internet Explorer' || agent.indexOf('trident') > -1 || agent.indexOf('edge/') > -1) {
	        _browser = 'ie';
	        $("html").addClass("ie");
	      } else if(agent.indexOf('safari') > -1) { // Chrome or Safari
	        if(agent.indexOf("chrome") > -1){
	          _browser = 'chrome';
	          $("html").addClass("chrome");
	        }else{
	          _browser = 'safari';
	          $("html").addClass("safari");
	        }
	      } else if(agent.indexOf('firefox') > -1) { // Firefox
	        _browser = 'firefox';
	      }
	    },
	    navigation() {
	      const $menuBar = $(".header .menu-bar");
	      const $oneDepthA = $(".header .nav-onedepth > li > a");
	      $oneDepthA.on("mouseenter focusin", function() {
	        if($_window.innerWidth() >= 1024) {
	          $_header.addClass("active");
	          $(".header .nav-twodepth").removeClass("show");
	          $oneDepthA.removeClass("active");
	          $(this).addClass("active");
	          $(this).next().addClass("show");
	          $(".lock-dimd").addClass("show");

	          //1뎁스 메뉴 라인 move
	          gsap.to($menuBar, {duration: 0.3, left: $(this).offset().left, width: $(this).width(), opacity: 1, ease: Power1.easeOut});

	          //gnb bg on/off
	          $(".header .nav-bg").show().css({"opacity": 1, top: $_header.height()-1, height: $(this).next().outerHeight(true) + parseInt($(this).next().css("marginTop").split("p")[0])});

	          // 사업소개 mouseover 이미지 노출
	          $(this).parent().index() === 1 ? $(".header .nav-bg .thumb-img").stop(true, true).delay(100).stop(true, true).fadeIn(300) : $(".header .nav-bg .thumb-img").hide();
	        }
	      });

	      // 2023-07-06 2depth 이동 불가 문제
		  $(function() {
			  var previousHrefs = [];

			  function updateHrefs() {
				$('.no-link').each(function(index, element) {
				  if ($(window).width() <= 1023) {
					var href = $(element).attr('href');
					if (!previousHrefs[index]) {
					  previousHrefs[index] = href;
					}
					$(element).removeAttr('href');
				  } else {
					var previousHref = previousHrefs[index];
					if (previousHref) {
					  $(element).attr('href', previousHref);
					}
				  }
				});
			  }

			  $(window).on('resize', function() {
				updateHrefs();
			  });

			  updateHrefs();
			});
			// // 2023-07-06

	      // 모바일 네비게이션 1뎁스 이벤트
	      let currentTwoMenuNum = -1;
	      $oneDepthA.on("click", function() {
	        if($_window.innerWidth() < 1024) {
	          if(currentTwoMenuNum === -1) {
	            currentTwoMenuNum = $(this).parent().index();
	            $(this).addClass("open");
	            $(this).next().stop(true, true).slideDown(300);
	          } else {
	            if(currentTwoMenuNum === $(this).parent().index()) {
	              currentTwoMenuNum = -1;
	              $oneDepthA.removeClass("open");
	              $(".header .nav-twodepth").stop(true, true).slideUp(300);
	            } else {
	              currentTwoMenuNum = $(this).parent().index();
	              $(".header .nav-twodepth").stop(true, true).slideUp(300);
	              $oneDepthA.removeClass("open");
	              $(this).next().stop(true, true).slideDown(300);
	              $(this).addClass("open");
	            }
	          }
	        }
	      })

	      // 모바일 네비게이션 2뎁스 이벤트
	      let currentThrMenuNum = -1;
	      const $twoDepthHasA = $(".header .nav-twodepth > li > a.has-thrdep");
	      const $thrdDepthA = $(".header .nav-thrdepth > li > a");
	      $twoDepthHasA.on("click", function() {
	        if($_window.innerWidth() < 1024) {
	          if(currentThrMenuNum === -1) {
	            currentThrMenuNum = $(this).parent().index();
	            $(this).addClass("open");
	            $(this).next().stop(true, true).slideDown(300);
	          } else {
	            if(currentThrMenuNum === $(this).parent().index()) {
	              currentThrMenuNum = -1;
	              $twoDepthHasA.removeClass("open");
	              $(".header .nav-thrdepth").stop(true, true).slideUp(300);
	            } else {
	              currentThrMenuNum = $(this).parent().index();
	              $(".header .nav-thrdepth").stop(true, true).slideUp(300);
	              $twoDepthHasA.removeClass("open");
	              $(this).next().stop(true, true).slideDown(300);
	              $(this).addClass("open");
	            }
	          }
	        }
	      });

	      let enterIdx = 0;
	      let enterLastIdx = 0;
	      let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ? true : false;
	      if(!isMobile) {
	        let ua = window.navigator.userAgent;
	        if (ua.indexOf('Safari') > 0) {
	          function isTouchscreen() { // iPad 접속 OS13부터 Macintosh으로 인식
	            return (navigator.maxTouchPoints > 0) ? true : false;
	          }
	          if (isTouchscreen()) {
	            // ipad safari가 pc로 인식될 때
	            $($thrdDepthA).on("click", function() {
	              headerFunc(this);
	            });
	          } else {
	            // pc일 때,
	            $($thrdDepthA).on("mouseenter", function() {
	              headerFunc(this);
	            });
	          }
	        }
	      } else {
	          // mobile일 때,
	          $($thrdDepthA).on("click", function() {
	            headerFunc(this);
	          });
	        }

	        function headerFunc(item) {
	          if($(item).parents(".nav-twodepth").parent("li").index() === 1) {
	            enterIdx = $(item).parents(".nav-thrdepth").parent("li").index();
	            if(!(enterIdx == enterLastIdx)) {
	              $(".header .nav-bg .thumb-img figure").stop(true, true).fadeOut(300);
	              $(".header .nav-bg .thumb-img figure").eq(enterIdx).stop(true, true).fadeIn(300);
	            }
	            enterLastIdx = enterIdx;
	          }
	        }

	      $_header.on("mouseleave", function() {
	        $_header.removeClass("active");
	        $(".header .nav-twodepth").removeClass("show");
	        $oneDepthA.removeClass("active");


	        gsap.to($menuBar, {duration: 0.3, opacity: 0, ease: Power1.easeOut});

	        $(".header .nav-bg").show().css("opacity", 0);
	        $(".header .nav-bg").hide();
	        if(!isKeepDimmed) $(".lock-dimd").removeClass("show");
	      })

	      // $_header.addClass("intro");
	      $(".program-info").length !== 0 ? gsap.delayedCall(0.3, function() {$_header.addClass("intro")}) : $_header.addClass("intro");
	      if($_window.scrollTop() === 0) {
	        $(".program-list .tab-top-swipe").addClass("active opacity");
	      }
	      if($_window.scrollTop() > 0) {
	        $(".program-list .tab-top-swipe").removeClass("active").addClass("opacity");
	      }

	      // E-VOS, Language
	      $(".utils .slide").hover(function() {
	        $(this).find(".list").stop(true, true).slideDown(300);
	      }, function() {
	        $(this).find(".list").stop(true, true).slideUp(300);
	      });
	      
	      // 2025-07-15 s
	      const $langSelect = $(".lang-only .lang-select");
	      const $langToggleBtn = $langSelect.find(".lang:first");

	      $langToggleBtn.on("click", function (e) {
	        e.preventDefault();

	        if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
	          $langSelect.toggleClass("on");
	          return;
	        }

	        if (!$langSelect.hasClass("on")) {
	          $langSelect.addClass("on");
	        } else {
	          $langSelect.removeClass("on");
	        }
	      });

	      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
	        $langSelect.on("mouseenter", function () {
	          $(this).addClass("on");
	        });

	        $langSelect.on("mouseleave", function () {
	          $(this).removeClass("on");
	        });
	      }
	      // 2025-07-15 e

	      // 검색창
	      let isKeepDimmed = false;
	      $(".header .utils .icn.utils-search, .header .nav-header .nav-utils .nav-search").on("click", function() {
	        isKeepDimmed = true;
	        $_header.trigger("mouseleave");
	        $(".header .search-area").show();
	        $(".lock-dimd").addClass("show");
	        gsap.to($(".header .search-area"), {duration: 0.8, top: 0, ease: Power3.easeOut});
	      });
	      $(".header .search-area .btn-close").on("click", function() {
	        isKeepDimmed = false;
	        $(".lock-dimd").removeClass("show");
	        gsap.to($(".header .search-area"), {duration: 0.8, top: "-255rem", ease: Power3.easeOut, onComplete: function() {
	          $(".header .search-area").hide();
	        }});
	      });

	      // 검색 input 이벤트
	      const $inputSearch = $(".search-area .search-form .search");
	      const $btnDelete = $(".search-area .search-form .btn-delete");
	      $inputSearch.on("keyup", function() {
	        $(this).val() != "" ? $btnDelete.show() : $btnDelete.hide();
	      });
	      $btnDelete.on("click", function() {
	        $inputSearch.val("");
	        $inputSearch.focus();
	      });

	      //2023-04-13 스크립트 수정
	      // 모바일 햄버거 버튼 이벤트
	      const $nav = $(".header nav");
	      $(".header .utils .icn.utils-open-menu").on("click", function() {
	    	  $nav.show().height("100vh");

	          $("body").addClass("no-scroll");
	        gsap.to($nav, {duration: 0.6, right: 0, ease: CustomEase.create("custom", "M0,0 C0.42,0 0.28,1 1,1 ")});
	        //2023-04-12 스크립트 수정
	        if($_window.innerWidth() < $_window.height()) {
	          $(".header .nav-utils2").css("marginTop", $_window.height() - ($(".header .nav-header").height() + ($(".header .nav-onedepth>li>a").innerHeight()*4) + $(".header .nav-utils2").innerHeight()));
	        } else {
	          $(".header .nav-utils2").css("marginTop", "30px");
	        }
	        bodyScrollLock.disableBodyScroll(document.querySelector("#wrap"), {
	          allowTouchMove: function (el) {
	            while (el && el !== document.body) {
	              if (el.getAttribute('body-scroll-lock-ignore') !== null) {
	                return true;
	              }

	              el = el.parentElement;
	            }
	          },
	        });
	      });

	      //2023-04-13 스크립트 수정
	      $(".header .nav-header .nav-utils .nav-close").on("click", function() {
	        gsap.to($nav, {duration: 0.6, right: "-100%", ease: CustomEase.create("custom", "M0,0 C0.42,0 0.28,1 1,1 ")});
	        bodyScrollLock.enableBodyScroll(document.querySelector("#wrap"));

	        $("body").removeClass("no-scroll");
	      });

	      // 모바일 E-VOS 이벤트
	      $(".header .nav-utils2 .btn-evos").on("click", function() {
	        if($(this).next().is(":hidden")) {
	          $(this).next().stop(true, true).slideDown(300);
	        } else {
	          $(this).next().stop(true, true).slideUp(300);
	        }
	      })
	    },
	    footer() {
	      // top btn
	      $(".top-btn").on("click", function(){
	        gsap.to($("html, body"), {duration:  1, scrollTop: 0});
	      });

	      // familySite
	      $(".slc-open").on("click", function(){
	        if($(".slc-open").parent().hasClass("active")) {
	          $(this).parent().removeClass("active");
	        } else {
	          $(this).parent().addClass("active");
	        }
	      })
	    },
	    headerPop() {
	      const $btnOpen = $(".header .utils .utils-keyinfo");
	      const $buttonClose = $(".header .side-pop-area .close-btn");
	      const $sidePop = $(".header .side-pop-area");

	      const menuAni = gsap.timeline({
	        onReverseComplete() {
	          $sidePop.removeClass("show");
	          $_body.removeClass("no-scroll");
	        }
	      })
	      .to(".header .side-pop-area .skew-bg", {
	        right: 0, duration:.7,
	      }, "label")
	      .to(".header .side-pop-area .section-wrap", {
	        right: 0, duration: .7, delay: .1,
	      }, "label+=.1")
	      .to(".header .side-pop-area .section-wrap .section", {
	        right: 0, duration: .5, delay: .1, stagger: 0.2,
	      }, "label+=.1")
	      .to(".header .side-pop-area .skew-bg", {
	        skewX: 0,  duration: .5,
	      }, "label+=.1")
	      menuAni.pause();

	      $btnOpen.on("click", function() {
	        $_header.trigger("mouseleave");
	        $_body.addClass("no-scroll");
	        $sidePop.addClass("show");
	        menuAni.timeScale(1).play();
	      });
	      $buttonClose.on("click", function() {
	        menuAni.timeScale(1.5).reverse();
	      });
	    },
	    resize() {
	      const $nav = $(".header nav");
	      const $tabBtn = $(".product-list .tab-wrap .tab-btn");
	      let isResizeOnce = false;
	      $(window).on("resize", _.throttle(e => {
	        //navigation bg 높이값 조절
	        // $(".header .nav-bg").css({"opacity": 1, top: $_header.height()-1, height: $(this).next().outerHeight(true) + parseInt($(this).next().css("marginTop").split("p")[0])});

	        if($_window.width() >= 1024) {
	          // $tabBtn.css({width: `calc(100% / ${$tabBtn.length})`});
	          if(!isResizeOnce) { // PC로 커질떄
	            isResizeOnce = !isResizeOnce;
	            $nav.css({right: 0, height: "100%"});
	            $(".header .nav-twodepth").removeAttr("style");

	            // 23-05-04 스크립트 수정
	            // 연혁 예외처리, 연혁 부분은 해당 html 하단 script에 별도로 작성
	            if ($(".heritage").length == 0) {
	              $("body").removeClass("no-scroll");
	              bodyScrollLock.enableBodyScroll(document.querySelector("#wrap"));
	            }
	          }

	          // scrollTriger Refresh
	          let delayedCall;
	          if(delayedCall != undefined) delayedCall.kill();
	          delayedCall = gsap.delayedCall(1, () => {
	            ScrollTrigger.refresh();
	          });
	        } else {
	          if(isResizeOnce) { // 모바일로 작아질때
	            isResizeOnce = !isResizeOnce;
	            $nav.css({right: "-100%", height: "auto"});
	            $(".header .nav-onedepth>li>a").removeClass("open")
	          }
	        }

	       // 모바일 utils2 위치 조절
	        //2023-04-12 스크립트 수정
	        //2023-04-13 스크립트 수정
	        if($_window.width() < 1024) {
	          // $tabBtn.css({width: `calc(100% / ${$tabBtn.length})`});
	          // $(".header .nav-utils2").css("marginTop", $_window.height() - ($(".header .nav-header").height() + ($(".header .nav-onedepth>li>a").innerHeight()*4) + $(".header .nav-utils2").innerHeight()));
	          if($_window.innerWidth() < $_window.height()) {
	            $(".header .nav-utils2").css("marginTop", $_window.height() - ($(".header .nav-header").height() + ($(".header .nav-onedepth>li>a").innerHeight()*4) + $(".header .nav-utils2").innerHeight()));
	          } else {
	            $(".header .nav-utils2").css("marginTop", "30px");
	          }
	          $nav.height("100vh");
	        }

	        //헤더 팝업영역 skew-bg top 높이값
	        const skewTopHeight = $(".header .side-pop-area .first-section").innerHeight();
	        $(".skew-bg .top").css({
	          height: skewTopHeight,
	        });

	        // 모바일 popup의 real 높이값
	        if($_window.width() < 1024 && $(".popup").is(":visible")) {
	          $(".popup").height(window.innerHeight);
	        }
	      }, 40)).trigger("resize");
	    },
	    scroll() {
	      $("html, body").scrollTop(1);
	      $("html, body").scrollTop(0);
	      let lastY = 0;
	      const $productTabWrap = $(".product-list .tab-wrap");
	      const $programTabWrap = $(".program-list .tab-top-swipe");
	      let iOSBounceInterval, iOSSafariSensitiveInterval;
	      let num = 0;
	      $(window).on("scroll", _.throttle(e => {
	        //navigation scroll

	        // if($_window.scrollTop() >= 0) {
	        //   $(".program-list .tab-top-swipe").removeClass("active");
	        // }

	        if($(window).scrollTop() > lastY) {
	          // 하단으로 스크롤
	          $_header.trigger("mouseleave");
	          if($_header.hasClass("scl")) {
	            $_header.addClass("hide2");
	          }
	          else {
	            $_header.addClass("hide");
	          }
	          $programTabWrap.addClass("hide").removeClass("scl active hide2");
	        } else {
	          // 상단으로 스크롤
	          if($_header.hasClass("scl")) {
	            $_header.removeClass("hide2");
	          } else {
	            $_header.removeClass("hide");
	          }
	          $_header.addClass("scl");
	          $programTabWrap.removeClass("hide");
	          $programTabWrap.addClass("scl").removeClass("active");

	          if($(window).scrollTop() == 0) {
	            $_header.removeClass("scl hide");
	            $programTabWrap.removeClass("scl").addClass("hide2");
	          }
	        }
	        lastY = $(window).scrollTop();

	        if(!_strBizTabStatus) {
	          // 전자 영역 out
	          $productTabWrap.removeClass("hide");
	        } else {
	          // 전자 영역 in
	          if(!$_header.hasClass("hide") || !$_header.hasClass("hide2")) {
	            $productTabWrap.addClass("hide");
	          }
	          if($_header.hasClass("hide") || $_header.hasClass("hide2")) {
	            $productTabWrap.removeClass("hide");
	          }
	        }

	        //scroll-motion
	        if ($(".scroll-motion").length != 0) {
	          $(".scroll-motion").each(function (q) {
	            if ($(window).scrollTop() + $_window.height() > _getScrollObjY()[q]) $(".scroll-motion").eq(q).addClass("active");
	          });
	        }


	        if(iOSBounceInterval != undefined) iOSBounceInterval.kill();
	        iOSBounceInterval = gsap.delayedCall(0.4, function() {
	          if($_window.scrollTop() == 0) {
	            $_header.removeClass("hide2");
	          }
	        });

	        if(iOSSafariSensitiveInterval != undefined) iOSSafariSensitiveInterval.kill();
	        iOSSafariSensitiveInterval = gsap.delayedCall(0.3, function() {
	        });
	      }, 20));
	    },
	    swiper() {
	      // side-pop-area swiper
	      const sidePopSwiper = new Swiper(".header .side-pop-area .news-container", {
	        slidesPerView: "auto",
	        observer: true,
	        observeParents: true,
	      });

	      // 사업소개 개요 탭 스와이퍼
	      var tabItem = $(".product-list .tab-wrap.swiper-container .swiper-slide").length;
	      const tabSwiper = new Swiper(".product-list .tab-wrap.swiper-container", {
	        slidesPerView: "auto",
	        observer: true,
	        observeParents: true,
	        breakpoints: {
	          599: {
	            slidesPerView: tabItem,
	          }
	        }
	      });

	      // 사업소개 개요 스와이퍼
	      const productSwiper = new Swiper(".product-list .full-swiper.swiper-container", {
	        slidesPerView: "auto",
	        observer: true,
	        observeParents: true,
	        effect: "fade",
	        fadeEffect: {
	          crossFade: true,
	        },
	      });

	      //year-tab swipe(연혁 탭 스와이퍼)
	      //개발팀 요청으로 인한 위치 변경
	      const yearSwipe = new Swiper(".year-tab .swiper-container", {
	        slidesPerView: "auto",
	      });
	      let yearLastIdx = 0;
	      $(window).on("scroll", _.throttle(e => {
	        $(".year-tab .btn-anchor").each(function(idx, item){
	          if($(item).hasClass("active") && !(idx == yearLastIdx)) {
	            yearSwipe.slideTo(idx);
	            yearLastIdx = idx;
	          }
	        });
	      }, 20));

	      //tab swipe (동반성장 프로그램 스와이퍼)
	      //개발팀 요청으로 인한 스와이퍼 위치 변경
	      const anchorSwipe = new Swiper(".anchor-tab .swiper-container", {
	        slidesPerView: "auto",
	        observer: true,
	        observeParents: true,
	        breakpoints: {
	          599: {
	            slidesPerView: 4,
	          }
	        }
	      });
	      let anchorLastIdx = 0;
	      $(window).on("scroll", _.throttle(e => {
	        $(".anchor-tab .swiper-slide").each(function(idx, item){
	          if($(item).hasClass("active") && !(idx == anchorLastIdx)) {
	            anchorSwipe.slideTo(idx);
	            anchorLastIdx = idx;
	          }
	        });
	      }, 20));

	      const $tabBtn = $(".product-list .tab-wrap .tab-btn");
	      $tabBtn.each(function(index) {
	        $(this).on("click", function() {
	          productSwiper.slideTo(index);
	          $tabBtn.removeClass("active");
	          $(this).addClass("active");
	        });
	      });

	      productSwiper.on("activeIndexChange", function() {
	        index = productSwiper.realIndex;
	        tabSwiper.slideTo(index);
	        $tabBtn.removeClass("active");
	        $tabBtn.eq(index).addClass("active");
	      });
	    },
	    form() {
	      //input
	      $(".form-input input").on("focusin", function() {
	        $(this).parent(".form-input").addClass("write");
	      }).on("focusout", function() {
	        $(this).parent(".form-input").removeClass("write");
	      });
	      //input error 삭제 처리
	      jQuery(".form-input input").on("click", function(){
	        jQuery(this).on("keyup", function(){
	          if(jQuery(this).val() != "" && jQuery(this).parent(".form-input").hasClass("error")){
	            $(this).parent(".form-input").removeClass("error");
	          }
	        })
	      });
	      //textarea
	      $(".form-area textarea").on("focusin", function() {
	        $(this).parent(".form-area").addClass("write");
	      }).on("focusout", function() {
	        $(this).parent(".form-area").removeClass("write");
	      });
	      //textarea error 삭제 처리
	      jQuery(".form-area textarea").on("click", function(){
	        jQuery(this).on("keyup", function(){
	          if(jQuery(this).val() != "" && jQuery(this).parent(".form-area").hasClass("error")){
	            $(this).parent(".form-area").removeClass("error");
	          }
	        })
	      });
	      //select
	      $(".form-select select").on("focusin", function() {
	        $(this).parent(".form-select").addClass("write");
	      }).on("focusout", function() {
	        $(this).parent(".form-select").removeClass("write");
	      });
	      //select error 삭제 처리
	      jQuery(".form-select select").on("change", function(){
	        if(jQuery(this).parent(".form-select").hasClass("error")){
	          $(this).parent(".form-select").removeClass("error");
	        }
	      });
	    },
	    snsDropDown(){
	      // 타이틀아래 sns 드롭다운
	      const $snsDrop = $(".sns-drop-down");
	      $snsDrop.on("click", function() {
	        if($snsDrop.parent(".sns-wrap").hasClass("active")){
	          $(this).parent().removeClass("active");
	          $(".content .sns-box").fadeOut();
	        } else {
	          $(this).parent().addClass("active");
	          $(".content .sns-box").fadeIn();
	        }
	      });
	    },
	    wallAni() {
	      if(!$(".right-wall").length) return;
	      // 타이틀아래 fullbg wall
	      const tl = gsap.timeline();
	      if($(".txt-motion").length <= 1){
	        tl.to(".right-wall", {right: "-1248rem", duration: $(".program-list").length !== 0 ? 1.2 : 1, ease: CustomEase.create("custom", "M0,0 C0.42,0 0.28,1 1,1 ")})
	        .to(".left-wall",  {left: "-1248rem", duration: $(".program-list").length !== 0 ? 1.2 : 1, ease: CustomEase.create("custom", "M0,0 C0.42,0 0.28,1 1,1 "),
	        onComplete() {
	          $(".left-wall").parents(".wall-area").hide();
	        }}, "<");
	        $(".full-img").addClass("active");
	      } else {

	        // txt-motion에 delay가 있을 경우, ex) PRO-001-05;
	        gsap.delayedCall(.3 * $(".txt-motion").length, function() {
	          tl.to(".right-wall", {right: "-1248rem", duration: $(".program-list").length !== 0 ? 1.2 : 1, ease: CustomEase.create("custom", "M0,0 C0.42,0 0.28,1 1,1 ")})
	          .to(".left-wall",  {left: "-1248rem", duration: $(".program-list").length !== 0 ? 1.2 : 1, ease: CustomEase.create("custom", "M0,0 C0.42,0 0.28,1 1,1 "),
	          onComplete() {
	            $(".left-wall").parents(".wall-area").hide();
	          }}, "<");
	          $(".full-img").addClass("active");
	        })
	      }
	    },
	    inputTextDelete(){
	      // input 검색어입력 감지
	      const $searchInput = $("#searchInput");
	      const $deleteBtn = $(".delete-btn");
	      $searchInput.val() !== "" ? $deleteBtn.show() : $deleteBtn.hide();
	      $searchInput.on("keyup", function(){
	        $searchInput.val() !== "" ? $deleteBtn.show() : $deleteBtn.hide();
	      });

	      // delete btn 클릭시
	      $deleteBtn.on("click", function(){
	        $searchInput.val("").focus();
	        $(this).hide();
	      });
	    },
	    inputNameDelete(){
	      const $check = $("#anonymity");
	      const $unCheck = $("#anonymity2");
	      const $ipName = $(".ip-name");
	      const $txtName = $(".txt-name");

	      // 실명, 익명 radio 체크
	      $unCheck.on("click", function(){
	        $unCheck.attr("checked", true);
	        $check.attr("checked", false);
	        if($unCheck.is(":checked")){
	          $ipName.hide();
	          $txtName.hide();
	        }
	      });
	      $check.on("click", function(){
	        $check.attr("checked", true);
	        $unCheck.attr("checked", false);
	        if($check.is(":checked")){
	          $ipName.show();
	          $txtName.show();
	        }
	      })
	    },
	    selectedOption() {
	      // input select 옵션
	      const $selectBox = $("#selectBox");
	      $selectBox.on("click", function(){
	        $(this).find("option").removeClass("change");
	        $(this).find("option:selected").not($("option").eq(0)).addClass("change");
	        $selectBox.find("option").hasClass("change") ? $selectBox.addClass("selected") : $selectBox.removeClass("selected");
	      });
	    },
	    popupCalled: function (popName, comebackEl) {
	      let TYPE = $(popName) || $("#popName");
	      let COMEBACKEL = comebackEl || $(".btn");
	      let CONTS = TYPE.find(".popup-contents");
	      let lockElement = document.querySelector("#wrap");

	      TYPE.show();
	      TYPE.attr("tabindex", 0).focus();
	      TYPE.addClass("active");

	      $(function(){
	          $(".img-area").mCustomScrollbar({
	              theme:"minimal-dark"
	          });
	      });

	      bodyScrollLock.disableBodyScroll(lockElement, {
	        allowTouchMove: function (el) {
	          while (el && el !== document.body) {
	            if (el.getAttribute('body-scroll-lock-ignore') !== null) {
	              return true;
	            }

	            el = el.parentElement;
	          }
	        },
	      });

	      //닫기
	      TYPE.find(".btn-close").on("click", function () {
	        TYPE.hide();
	        TYPE.removeClass("active");
	        // TYPE.css("visibility", "hidden");
	        COMEBACKEL.attr("tabindex", 0).show().focus();
	        bodyScrollLock.enableBodyScroll(lockElement);

	        // 오늘 하루 보지 않기
	        if($("#noMore").is(":checked")){
				$.cookie("todayPop", false, {expires:1, path:"/"});
			}
	      });

	      if (window.innerWidth > 1024 && !CONTS.hasClass("mCustomScrollbar")) {
	        CONTS.mCustomScrollbar({
	          // setHeight: "32%",
	          scrollInertia: 200
	        });
	      } else if(window.innerWidth < 1023 && !CONTS.hasClass("mCustomScrollbar")) {
	        CONTS.mCustomScrollbar({
	          scrollInertia: 200,
	        })
	      }
	    },
	    programMotion() {
	      if(!$(".program-info.outline").length) return;
	      $clipBg = ".program-info .main-vis .clip-bg";
	      $programMainVis = ".program-info .main-vis";
	      $programMainTxtbox = ".program-info .main-vis .main-txt-box";
	      const $tabBtn = $(".program-info .product-list .tab-wrap .tab-btn");

	   // 사업소개 개요 클립패스 애니메이션, 2023-07-18 수정
	      const t1 = gsap.timeline()
	      .to($clipBg, {
	        top: "-250%", duration: 1.3, ease: CustomEase.create("custom", "M0,0 C1,0.05 0.43,0.98 1,1 "),
	      })
	      .to($programMainTxtbox, {color: "#fff", duration: 0.1,}, "<+=.7");

	      // 사업소개 개요 첫 화면
	      const txtShow = gsap.timeline()
	      .to(".program-info .main-txt-box .txt-first", {
	        top: "30%", opacity: 0, duration: .1, ease: CustomEase.create("custom", "M0,0 C0.42,0 0.58,1 1,1 ")
	      })
	      .to(".program-info .main-txt-box .txt-second", {
	        top: "50%", opacity: 1, duration: .5, ease: CustomEase.create("custom", "M0,0 C0.42,0 0.58,1 1,1 ")
	      }, ">+.02").pause();

	      // 사업소개 개요 텍스트 클립패스 애니메이션
	      const t2 = gsap.timeline({
	        scrollTrigger: {
	          trigger: $programMainVis,
	          start: 0,
	          // end: "+=200%",
	          onUpdate(self) {
	          if(self.progress >= 0) {
	            txtShow.play();
	          }
	          if(self.progress >= 0 && self.progress <= 0.2) {
	            txtShow.reverse();
	          }
	          },
	        }
	      });

	      //개요 로드 될 때 스크롤 없애기 2023-07-18 추가
	      setTimeout(function() {
	        document.body.classList.remove('scroll-lock');
	      }, 1500);


	      // 사업소개 개요 메인 비주얼 텍스트 색 사선 스크럽 모션 , 2023-07-18 수정
	      const t3 = gsap.timeline({
		        scrollTrigger: {
		            trigger: $programMainTxtbox,
		            start: "bottom top",
		            end() {
		                return "+=" + $($programMainVis).height() * 1;
		            },
		            scrub: 0,
		            onUpdate(self) {
		                if (self.progress >= 0.6) {
		                    $($programMainVis).addClass("txt-black");
		                }
		                if (self.progress >= 0.5 && self.progress <= 0.6) {
		                    $($programMainVis).removeClass("txt-black");
		                }
		                if (self.progress >= 0.9 && self.progress <= 1) {
		                    gsap.to($programMainTxtbox, {
		                        yPercent: -50,
		                        opacity: 0,
		                    });
		                } else if (self.progress < 1) {
		                    gsap.to($programMainTxtbox, {
		                        opacity: 1,
		                    });
		                }
		            },
		            //markers: true,
		            onEnterBack: (self) => {
		                // ScrollTrigger가 역방향으로 이동할 때 실행할 작업들
		                $($programMainVis).removeClass("txt-black");
		                gsap.to($programMainTxtbox, {
		                    opacity: 1,
		                });
		            },
		            onLeaveBack: (self) => {
		                // ScrollTrigger가 역방향으로 떠날 때 실행할 작업들
		                $($programMainVis).removeClass("txt-black");
		                gsap.to($programMainTxtbox, {
		                    opacity: 1,
		                });
		            },
		        },
		    }).to(".program-info .main-txt-box .txt-second .txt-full", {
		        duration: 1,
		        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 67%)",
		    });


			// // 2023-07-18 수정

	      ScrollTrigger.create({
	        trigger: $programMainVis,
	        start: "top top",
	        // end: "top top",
	        endTrigger: $(".info-cont"),
	        end: "+=" + $($programMainVis).height() * 3,
	        pin: true,
	        pinSpacing: false,
	      });

	      // 사업소개 개요 스와이퍼
	      gsap.to(".program-info .product-list .motion-wrap", {
	        scrollTrigger: {
	          trigger: ".program-info .info-cont",
	          start: "bottom 80%",
	          scrub: 1,
	          onUpdate(self) {
	            if(self.progress >= 1) {
	              $(".program-info .product-list .tab-wrap").removeClass("hide2").addClass("enter");
	            }
	            if(self.progress < 1) {
	              $(".program-info .product-list .tab-wrap").removeClass("enter").addClass("hide2");
	            }
	          }
	        },
	        duration: 1, clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", y: "0%",
	      });

	      ScrollTrigger.create({
	        trigger: ".program-info .product-list",
	        pin: true,
	        start: "0 0",
	        end: "+=".concat($(window).height()),
	        // endTrigger: $(".footer"),
	        // markers: true,
	        onEnter: function() {
	          _strBizTabStatus = true;
	        },
	        onLeaveBack: function() {
	          _strBizTabStatus = false;
	        },
	      });

	      // 탭 간격 자동 정렬
	      // $tabBtn.css({width: `calc(100% / ${$tabBtn.length})`});
	    },
	    programListMotion() {
	      // 디펜스솔루션 제품군 모션
	      if(!$(".program-list.defense").length) return;

	      // 전차 메인비주얼 전차 밑부분 텍스트 올라오는 모션
	      const txtUp = gsap.timeline()
	      .to(".program-list .main-vis .img-area", {yPercent: 0, opacity: 1, duration: .8, ease: CustomEase.create("custom", "M0,0 C0.42,0 0.58,1 1,1 ")})
	      .to(".program-list .main-vis .txt-box .dl .dt", {y: 0, opacity: 1, duration: .8, ease: CustomEase.create("custom", "M0,0 C0.42,0 0.58,1 1,1 ")}, "<")
	      .to(".program-list .main-vis .txt-box .dl .dd", {y: 0, opacity: 1, delay: .1, duration: 1, ease: CustomEase.create("custom", "M0,0 C0.42,0 0.58,1 1,1 ")}, "<")
	      .to(".program-list .main-vis .desc", {y: 0, opacity: 1, delay: .1, duration: 1, ease: CustomEase.create("custom", "M0,0 C0.42,0 0.58,1 1,1 ")}, "<+=.5");
	      txtUp.pause();

	      // 전차 메인비주얼 첫 화면 모션
	      const t1 = gsap.timeline()
	      .to(".main-vis .title-txt-box", {opacity: 1, y: 0, duration: .8, ease: CustomEase.create("custom", "M0,0 C0.42,0 0.58,1 1,1 ")}, "label")
	      .to(".main-vis .img-area", {y: 0, x: 0, duration: 1, ease: CustomEase.create("custom", "M0,0 C0.42,0 0.58,1 1,1 ")}, "<-=.1")
	      .to(".main-vis .clip-txt", {clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", ease: CustomEase.create("custom", "M0,0 C0.42,0 0.58,1 1,1 "), duration: 1.6,}, "<");

	      // 전차 pc모션
	      const mmDesktop = gsap.matchMedia();
	      mmDesktop.add("(min-width: 1024px)", () => {
	        // 전차 pc 메인비주얼 스크롤트리거 모션
	        const scrollTimeline = gsap.timeline({
	          scrollTrigger: {
	            trigger: ".program-list .scroll-wrap",
	            pin: true,
	            start: "top top",
	            endTrigger: ".main-vis",
	            end: "+=".concat($_window.height() * 2.5),
	            scrub: 1,
	          }
	        })
	        .to(".program-list .main-vis .scroll-box", {
	          yPercent: $(".program-list .main-vis").outerHeight() > $_windowOuterHeight ? -45 : 0, duration: 1,
	          onComplete() {
	            txtUp.play();
	          },
	        })
	        .to(".blank-box", {
	          height: "100%", delay: 2, duration: 1,
	        }, ">")
	        .to(".program-list .info-sec", {
	          opacity: 1,
	        })
	        .to(".program-list .info-sec .img-area", {
	          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration: 1,
	        }, "<");
	      });

	      const mmMobile = gsap.matchMedia();
	      mmMobile.add("(max-width: 1023px)", () => {
	        txtUp.play();
	        gsap.set(".program-list .scroll-wrap .info-sec", {opacity: 1, zIndex: 1,})
	        gsap.set(".program-list .scroll-wrap .info-sec .img-area", {clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",})
	      });
	    },
	    printEvt : function ( ) {
	      $(".print").on("click", function(){
	        $("header").hide();
	        $("footer").hide();
	        window.print();
	        $("header").show();
	        $("footer").show();
	      });
	    },
	    scrollSet(){
	    	//현재 페이지 이탈시 Y축값 저장
	    	window.onbeforeunload = function() {
	    		if(window.scrollY>0) sessionStorage.setItem("histroyScrollY", window.scrollY);
	    	};

	    	window.onpageshow = function(event) {
	    		if (event.persisted) {//이벤트 상태가 뒤로가일때? 페이지가 캐시(BFCahe)되었을때
	    			if(!!sessionStorage.histroyScrollY && sessionStorage.histroyScrollY > 0 && window.scrollY == 0){
	    				setTimeout(window.scrollTo(0, sessionStorage.histroyScrollY), 3000);
	    				sessionStorage.setItem("histroyScrollY", 0);
	    			}

	    		}
	    	}
	    }
	  }
})();

var totalMethod = function(){
	  common.init();
	  common.resize();
	  common.scroll();
	  // common.swiper();
	  common.form();
	  common.snsDropDown();
	  common.wallAni();
	  common.inputTextDelete();
	  common.inputNameDelete();
	  common.selectedOption();
	  common.programMotion();
	  common.programListMotion();
	  common.deviceCheck();
	  // common.headerPop();
	  common.printEvt();
	  common.scrollSet();
}

$(function() {

	  try{
		  totalMethod();

		  setTimeout(function(){$(".slc-scroll").mCustomScrollbar();}, 3000);
	  }catch(err){

		  console.log(err.message);
		  if(err.message.indexOf("is not defined") > -1 || err.message.indexOf("is not a function") > -1){
			  console.log("is not defined로 인해 다시 호출");
			  //setTimeout(totalMethod(), 2000);
			  location.reload;
		  }
	  }
});

return common;
});
