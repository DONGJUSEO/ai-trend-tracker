var _requireLib = {
    paths: {
        //External Library
    	/*"jquery"                    : "jquery-3.6.0.min",*/
    	/*"jquery"                    : "jquery-2.2.4.min",*/
    	"jquery"                    : "jquery-2.2.4.min",
    	"jquery.fullPage"        : "jquery.fullPage",
    	"Swiper"                    : "swiper.min",
    	"gsap" : "gsap.min",
    	"ezCtrl" : "lib/ezController/jquery.ez.controller-0.4.0",
    	"ezValidation" : "lib/ezValidation/jquery.ez.validation-1.3.6",
		"bodyScrollLock" : "bodyScrollLock.min",
		"lottie-player" : "lottie-player",
		"counterup" : "jquery.counterup",
		"waypoints" : "waypoints.min",
   		"jquery.cookies" : "lib/jquery/jquery.cookies",

		"ScrollTrigger" : "ScrollTrigger.min",
		"CustomEase" : "CustomEase.min",
		"lodash" : "lodash.min",
       	"documentReady"      : "documentReady-1.0", //$(document).Ready vanilla javascript & jqueryBridgetIsotope
       	"jquery.mCustomScrollbar" : "jquery.mCustomScrollbar.min",
   		"common" : "common",
   		"jquery.mousewheel" : "jquery.mousewheel.min",
   		"COCmmCtrl" : "controller/co/COCmmCtrl",
   		"msgCtrl" : "controller/co/COMsgCtrl"
		/*"main" : "main"*/
    }
}
require.config({
    baseUrl: "/common_ko/js", // "js" 라는 폴더를 기본 폴더로 설정한다.
    waitSeconds: 15,
    urlArgs : "",//"bust="+new Date().getTime(),
    paths:_requireLib.paths,
    shim : {
        // Dependency RelationShip

        "ezhistory":{deps:["jquery"]},
        "ezCtrl":{deps:["jquery"]},
        "fnc":{deps:["jquery"]},
        "ScrollTrigger":{deps:["jquery", "gsap"]},
        "lodash":{deps:["jquery"]},
        "ezValidation":{deps:["jquery"]},
        "jquery.mCustomScrollbar":{deps:["jquery"]},
        "common":{deps:["lodash", "jquery", "bodyScrollLock", "gsap", "ScrollTrigger", "CustomEase", "Swiper", "jquery.mCustomScrollbar", "jquery.cookies"]},
        "main":{deps:["Swiper" ,"jquery", "gsap"]},
        "jquery.mousewheel":{deps:["jquery"]},
        "CustomEase":{deps:["gsap"]},
        "counterup" : {deps:["jquery"]},
		"waypoints" : {deps:["jquery"]},
		"msgCtrl" : {deps:["jquery"]}
    }
});

require(['documentReady'].concat(Object.keys(_requireLib.paths)), function(documentReady) {
    documentReady(function() {
        var divControllers = document.querySelectorAll("div[data-controller]");
        if (divControllers) {
            divControllers.forEach(function(divController) {
                var conValue = divController.getAttribute("data-controller");
                if (conValue)
                    require(conValue.split(/\s+/), function(rtnObj) {
                        //return define
                    }, function() {  /*error*/ });
            });
        }
    }, Array.prototype.slice.call(arguments));//jquery, isotope 링크 작업을 위해 필요함.
});