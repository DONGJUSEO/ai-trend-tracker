var msgCtrl = (function(){

	"use strict";
	
	var langCd = jQuery("body").data("langCd");
	
	if (!langCd) langCd = "ko";

	var config = {
		confirm : {
			ins : {
				ko : "등록하시겠습니까?", en : "Do you want to register?"
			},
			upd : {
				ko : "수정하시겠습니까?", en : "Do you want to modify it?"
			},
			del : {
				ko : "삭제하시겠습니까?", en : "Do you want to delete it?"
			}
		},
		success : {
			ins : {
				ko : "등록되었습니다.", en : "Registered."
			},
			upd : {
				ko : "수정되었습니다.", en : "Modified."
			},
			del : {
				ko : "삭제되었습니다.", en : "Deleted."
			},
			clipboard : {
				ko : "주소가 복사되었습니다.", en : "Address has been copied."
			}
		},
		fail : {
			captcha : {
				ko : "다중 클릭으로 인해 보안상 등록이 취소되었습니다. 다시 시도해주세요.",
				en : "Registration has been revoked for security reasons due to multiple clicks. Please try again.",
			}, 
			act : {
				ko : "문제가 발생하여 진행이 중단됩니다. 잠시 후 다시 시도 바랍니다.",
				en : "A problem occurred, and progress is interrupted. Try again in a few minutes.",
			},
			clipboard : {
				ko : "주소복사 기능이 지원되지 않습니다.", en : "Address copy function is not supported."
			},
			file : {
				size : {
					ko : "첨부파일은 최대 100MB까지만 등록가능합니다.", en : "Attachments can be registered up to 100MB."
				},
				extn : {
					ko : "등록가능한 확장자가 아닙니다.", en : "It is not a registrable extension."
				}
			}
		},
		validation : {
			agree : {
				ko : "개인정보 수집 및 이용동의 약관에 동의해주세요.",
				en : "Agree to the terms of the Privacy Policy.",
			},
			typeCd : {
				en : "Select a category." 
			},
			name : {
				en : "Enter a name." 
			},
			email : {
				en : "Enter an e-mail." 
			},
			emailChk : {
				en : "Enter an e-mail format." 
			},
			titl : {
				en : "Enter a title." 
			},
			cntn : {
				en : "Enter the content."
			}
		}
	};

	var get_message = function(msgCode) {
		return eval("config." + msgCode + "." + langCd);
	};

	return {
		getMsg : get_message
	}
}());