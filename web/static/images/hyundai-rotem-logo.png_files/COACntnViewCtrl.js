define(["ezCtrl"], function(ezCtrl) {

	"use strict";

	// set controller name
	var exports = {
		controller : "controller/co/coa/COACntnViewCtrl"
	};

	// get controller object
	var ctrl = new ezCtrl.controller(exports.controller);

	// create Object


	// create function


	// set model
	ctrl.model = {
		id : {
			// do something...
		},
		classname : {
			// do something...
			viewDetail: {
                event : {
					click : function(e) {

						e.preventDefault();
						var productNm = "";

						if(document.location.href.indexOf("defense") > 0){
							productNm = $(e.target).parent().next().children()[0].text
						}else{
							productNm = $(e.target).prevAll(':last').text().trim().replace("&","%27");
						}

						location.href = "./details.do?productNm=" + productNm;
					}
                }
			},
			// pdf 등 파일 새 탭으로 열기 (태그 작성 양식 : class="fileLink" data-filelink="파일경로" )
			fileLink : {
                event: {
                    click: function () {
                    	var fileLink = $(this).data("filelink")
                    	window.open(fileLink);
                    }
                }
            },
            // pdf 등 파일 즉시 다운로드 (태그 작성 양식 : class="fileDown" data-filelink="/cmm/etc/download.do?trgtFile=common/files/에 있는 파일명.확장자" )
			fileDown : {
                event: {
                    click: function () {
                    	var fileLink = $(this).data("filelink")
                    	location.href = fileLink;
                    }
                }
            }
		},
		immediately : function(){
			// CMS 개별 페이지 스크립트
			cntn();

			// Tab 슬라이드
			if (jQuery(".tab1 a").length > 0)
			{
				var tabSwiper = new Swiper(".tab1 .swiper-container", {
					slidesPerView: "auto",
					spaceBetween: 0,
					scrollbar: {
						//el: ".swiper-scrollbar",
					},
					breakpoints: {
						768: {
							//spaceBetween: 25
						}
					},
				});

				tabSwiper.slideTo(jQuery(".swiper-container .swiper-slide.active").index(), 400);
			}
		}
	};

	// execute model
	ctrl.exec();

	return ctrl;
});