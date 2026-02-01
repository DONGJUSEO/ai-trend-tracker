/*
 * version 1.3.6
 * 2019.03.21 : confirm 설정 기능 개선( action 값에 따른 메시지 설정 )
 */

(function($){

	var validation = {
		defaults : {
			notRequiredClass : "notRequired",
			ExceptionRequiredClass : "exceRequired",
			validateType : {
				idChk : {
					className : "idChk",
					//regExr : "^(?=.*[a-z0-9])[a-z0-9]{6,20}$"					// 영문만 검사
					//regExr : "^(?=.*[a-z])(?=.*[0-9])[a-z0-9]{6,20}$" 		// 영문 + 숫자 검사
					//regExr : "^[a-zA-Z0-9]{6,20}$" 							// 영문 (대문자 포함) or 숫자 검사
					regExr : "^(?!(?:[0-9]+)$)([a-zA-Z]|[0-9a-zA-Z]){6,12}$"	// 영문 or 영문 + 숫자 검사
				},
				passChk : {
					className : "passChk",
					subClassName : "passChkSub",
					regExr : "^(?=.*[a-zA-Z])(?=.*[!@#^&*])(?=.*[0-9]).{6,10}$",
					equalClass : "passEqual"
				},
				emailChk : {
					className : "emailChk",
					regExr : "^[_a-zA-Z0-9-\\.\\_]+@[\\.a-zA-Z0-9-]+\\.[a-zA-Z]+$"
				},
				numberChk : {
					className : "numberChk",
					regExr : "^[0-9]+$"
				},
				floatChk : {
					className : "floatChk",
					regExr : "^[0-9\\.]+$"
				},
				lengthLimitChk : {
					className : "lengthChk",
					min : 2,
					max : 4
				},
				mobileNumChk : {
					className : "mobileChk",
					regExr : "^([0]{1}[0-9]{2})-([1-9]{1}[0-9]{2,3})-([0-9]{4})$"
				},
				phoneNumChk : {
					className : "phoneChk",
					regExr : "^([0]{1}[0-9]{1,2})-([1-9]{1}[0-9]{2,3})-([0-9]{4})|(15|16|18)(00|70|44|66|77|88)-[0-9]{4}$"
				},
				englishChk : {
					className : "englishChk",
					regExr : "^[a-zA-Z]+$"
				},
				koreanChk : {
					className : "koreanChk",
					regExr : "^[가-힣]+$"
				},
				dateTypeChk :{
				    className : "dateTypeChk",
				    regExr : "^(19[0-9][0-9]|20[0-9][0-9])-(0[0-9]|1[0-2])-(0[1-9)]|[1-2][0-9]|3[0-1])$"
				},
				urlChk : {
					className : "urlChk",
					regExr : "^(((http(s?))\\:\\/\\/)?)([0-9a-zA-Z\\-]+\\.)+[a-zA-Z]{2,6}(\\:[0-9]+)?(\\/\\S*)?"
				}
			},
			msg : {
				type : "alert",
				empty : {
					text : " 입력해주세요.",
					password : " 입력해주세요.",
					radio : " 선택해주세요.",
					checkbox : " 선택해주세요.",
					select : " 선택해주세요.",
					textarea : " 입력해주세요.",
					names : {
						
					}
				},
				idChk : "아이디 입력값이 올바르지 않습니다.\n(6~12자 이내 영문 또는 영문/숫자 조합)",
				passChk : "비밀번호 입력값이 올바르지 않습니다.\n(영문/숫자/특수문자 3가지 이상을 조합한 6~10자)",
				passEqualChk : "비밀번호가 일치하지 않습니다.",
				emailChk : "이메일 입력값이 올바르지 않습니다.",
				numberChk : "숫자만 입력가능합니다.",
				lengthLimitChk : "길이가 조건에 맞지 않습니다.",
				mobileNumChk : "휴대폰번호는 010-1234-5678 형식으로 입력되어야 합니다.",
				phoneNumChk : "연락처는 02(010)-1234-5678 또는 15XX-XXXX 형식으로 입력되어야 합니다.",
				englishChk : "영문만 입력하실 수 있습니다.",
				koreanChk : "한글만 입력하실 수 있습니다.",
				dateTypeChk : "날짜 입력값이 올바르지 않습니다.",
				urlChk : "URL 입력값이 올바르지 않습니다.",
				confirm : {
					init : "진행하시겠습니까?"
				}
			},
			placeholder : true,
			comma : {
				use : true,
				className : "comma"
			},
			async : {
				use : false,
				func : ""
			},
			tooltip : {
				use : false
			},
			loadingbar : {
				use : false,
				autoClose : false
			},
			exceptArea : []
		},
		action : "",
		confirm : "",
		method : {
			RegExrCheck : function(obj, regexr, msg, returnType){
				var patten, regResult;

				patten = eval("/" + regexr + "/g");

				regResult = patten.test(obj.val());
				
				if (regResult && obj.hasClass("passChk"))
				{
					if (obj.val().indexOf(" ") > -1)
					{
						regResult = false;
					}
				}

				if (typeof returnType === "function")
				{
					if (!regResult)
					{
						returnType(obj, msg);
					}
				}
				else
				{
					return regResult;
				}
			},
			LengthCheck : function(obj, lengthInfo, msg, returnType){
				if (obj.val().length >= lengthInfo.min && obj.val().length <= lengthInfo.max)
				{
					regResult = true;
				}
				else
				{
					regResult = false;
				}

				if (typeof returnType === "function")
				{
					if (!regResult)
					{
						returnType(obj, msg);
					}
				}
				else
				{
					return regResult;
				}
			},
			Comma : function(obj, event){
				var commaval = "";

				if (event == "keyup")
				{
					obj.keyup(function(){
						commaval = $(this).val().replace(/[^-0-9]/g, "").replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
						$(this).val(commaval);
					});
				}
				else
				{
					commaval = obj.val().replace(/[^-0-9]/g, "").replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
					obj.val(commaval);
				}
			},
			AutoHypenPhone : function(str){
				var tmp = ""
				  , lens1 = 4, lens2 = 7, lens3 = 11
				  , cutlen1 = 3, cutlen2 = 3;

				str = str.replace(/[^0-9]/g, "");

				if (str.substr(0, 2) == "02")
				{
					lens1 = 3; lens2 = 6; lens3 = 10; cutlen1 = 2;
				}
				
				if (str.substr(0, 1) == "1")
				{
					if (str.length < 5)
					{
						return str;
					}
					else
					{
						tmp += str.substr(0, 4);
						tmp += "-";
						tmp += str.substr(4);
						return tmp;
					}
				}
				else
				{
					if (str.length < lens1)
					{
						return str;
					}
					else if (str.length < lens2)
					{
						tmp += str.substr(0, cutlen1);
						tmp += "-";
						tmp += str.substr(cutlen1);
						return tmp;
					}
					else if (str.length < lens3)
					{
						tmp += str.substr(0, cutlen1);
						tmp += "-";
						tmp += str.substr(cutlen1, cutlen2);
						tmp += "-";
						tmp += str.substr(cutlen1 + cutlen2);
						return tmp;
					}
					else
					{
						tmp += str.substr(0, cutlen1);
						tmp += "-";
						tmp += str.substr(cutlen1, cutlen2 + 1);
						tmp += "-";
						tmp += str.substr(cutlen1 + (cutlen2 + 1));
						return tmp;
					}
				}

				return str;
			},
			AutoHypenDate : function(str){
                var tmp = ""
                  , lens1 = 5, lens2 = 7, lens3 = 8
                  , cutlen1 = 4, cutlen2 = 2;

                str = str.replace(/[^0-9]/g, "");

                if (str.length < lens1)
                {
                    return str;
                }
                else if (str.length < lens2)
                {
                    tmp += str.substr(0, cutlen1);
                    tmp += "-";
                    tmp += str.substr(cutlen1);
                    return tmp;
                }
                else if(str.length < lens3)
                {
                    tmp += str.substr(0, cutlen1);
                    tmp += "-";
                    tmp += str.substr(cutlen1, cutlen2);
                    tmp += "-";
                    tmp += str.substr(cutlen1 + cutlen2);
                    return tmp;
                }
                else
                {
                    tmp += str.substr(0, cutlen1);
                    tmp += "-";
                    tmp += str.substr(cutlen1, cutlen2);
                    tmp += "-";
                    tmp += str.substr(cutlen1 + cutlen2);
                    return tmp;
                }

                return str;
            },
			Indicator : function(ptarget, target){
				var indicator
				  , documentHeight = $(document).height();

			  	if ($(target).size() > 0)
			  	{
			  		indicator = $(target).remove();

			  		indicator.css("position", "absolute").css("top", "0px").css("left", "0px").css("background-color", "#000").css("z-index", 1001).css("opacity", 0.7).width("100%").height(documentHeight);

			  		indicator.find("img").css("top", ($(window).height() - indicator.find("img").outerHeight()) / 2 + $(window).scrollTop() / 2);
			  		indicator.find("img").css("left", ($(window).width()- indicator.find("img").outerWidth()) / 2 + $(window).scrollLeft() / 2);

					ptarget.after(indicator.show());
			  	}
			},
			GetByteLenth : function(s, b, i, c){
				for (b=i=0; c=s.charCodeAt(i++); b+=c>>11?3:c>>7?2:1);
				return b;
			}
		},
		async : {
			use : false,
			func : ""
		},
		developmentMode : ""
	};

	var duplication = {
		use : false,
		confirmList : [],
		check : function(option, regExrs, msg){
			var data = "",
				textboxObj = "",
				buttonIdObj = "",
				name = "",
				val = "",
				url = "",
				type = "",
				valChk = false,
				dupMsg = "";
			
			if (typeof option !== "undefined" && option.use == true)
			{
				this.use = option.use;

				if (Array.isArray(option.type))
				{
					for (var obj in option.type)
					{
						if ((typeof option.type[obj].textboxId !== "undefined" && option.type[obj].textboxId != "") && (typeof option.type[obj].buttonId !== "undefined" && option.type[obj].buttonId != ""))
						{
							this.confirmList.push({"type" : option.type[obj].type, "textboxId" : option.type[obj].textboxId});

							if (typeof $("#" + option.type[obj].textboxId).val() !== "undefined" && $("#" + option.type[obj].textboxId).val() != "")
							{
								$("#" + option.type[obj].textboxId).data("state", true)
																   .data("val", $("#" + option.type[obj].textboxId).val());
							}

							buttonIdObj = $("#" + option.type[obj].buttonId).data("type", option.type[obj].type)
									   										.data("url", option.type[obj].url)
									   										.data("textboxId", option.type[obj].textboxId);

							buttonIdObj.click(function(e){
								e.preventDefault();

								type = $(this).data("type");
								url = $(this).data("url");
								textboxObj = $("#" + $(this).data("textboxId"));

								name = textboxObj.attr("name");
								val = textboxObj.val();

								if ($.trim(val))
								{
									switch (type)
									{
										case "id" :
											valChk = validation.method.RegExrCheck(textboxObj, regExrs.idExr);
											dupMsg = msg.idChk;
											break;
										case "email" :
											valChk = validation.method.RegExrCheck(textboxObj, regExrs.emailExr);
											dupMsg = msg.emailChk;
											break;
									}

									if (valChk)
									{
										data = JSON.parse('{"' + name +  '":"' + val + '"}');

										$.ajax({
											type : "post",
											url : url,
											data : data,
											dataType : "json",
											success : function(r){
												var useYn = r.useYn;

												if (useYn == "Y")
												{
													alert("사용 가능합니다.");
													textboxObj.data("state", true).data("val", val);
												}
												else
												{
													alert("이미 사용중입니다.");
													textboxObj.data("state", false).focus();
												}
											},
											error : function(xhr, ajaxSettings, thrownError){
												alert("다시 시도해주세요.");
											}
										});
									}
									else
									{
										alert(dupMsg);
									}
								}
								else
								{
									var trgtTit = textboxObj.prop("title");
									var tempMsg = "값을 입력해주세요.";

									if (trgtTit != undefined)
									{
										var lastChar = trgtTit.charAt(trgtTit.length - 1);
										var josa = (lastChar.charCodeAt(0) - 44032) % 28 ? "을" : "를";

										tempMsg = trgtTit + josa + " 입력해주세요.";
									}

									alert(tempMsg);
									textboxObj.focus();
								}
							});

							$("#" + option.type[obj].textboxId).focusout(function(){
								if($(this).data("val") !== "undefined")
								{
									if ($(this).data("val") != $(this).val())
									{
										$(this).data("state", false);
									}
									else
									{
										$(this).data("state", true);
									}
								}
							});
						}
					}
				}
				else
				{
					alert("Validation의 옵션 duplication.type이 배열이 아닙니다.");
				}
			}
		},
		confirm : function(obj, id){
			var rtn = true;

			if (this.use)
			{
				if (this.confirmList.length > 0)
				{
					for (var index in this.confirmList)
					{
						if (this.confirmList[index].textboxId == id)
						{
							if (!obj.data("state"))
							{
								var trgtMsg = "중복 확인을 진행해 주십시오.";
								var trgtType = this.confirmList[index].type;

								if (trgtType == "id")
								{
									trgtMsg = "아이디 " + trgtMsg;
								}
								else if (trgtType == "email")
								{
									trgtMsg = "이메일 " + trgtMsg;
								}

								alert(trgtMsg);

								if (obj.is(":visible"))
								{
									obj.focus();
								}
								else
								{
									obj.siblings(":first").focus();
								}

								rtn = false;
							}
						}
					}
				}
			}

			return rtn;
		}
	};

	$.fn.validation = function(options, mod){
		var ver = "1.3.6";

		var $this = this,
			notRequired,
			isOk = true,
			tagType,
			tagTypeValue,
			tagNameValue,
			tagName,
			tagTitle,
			tagID,
			message = "",
			regResult,
			submitBtnClass,
			action = $this.attr("action");
		
		var regExrs = {
			idExr : "",
			passExr : "",
			emailExr : "",
			numberExr : "",
			floatExr : "",
			mobileExr : "",
			phoneExr : "",
			englishExr : "",
			koreanExr : "",
			dateTypeExr : "",
			urlExr : ""
		};

		var rtnFunc;

		var msg = {
			empty : {
				text : "",
				password : "",
				radio : "",
				checkbox : "",
				select : "",
				textarea : ""
			},
			idChk : "",
			passChk : "",
			passEqualChk : "",
			emailChk : "",
			numberChk : "",
			floatChk : "",
			lengthLimitChk : "",
			mobileNumChk : "",
			phoneNumChk : "",
			englishChk : "",
			koreanChk : "",
			dateTypeChk : "",
			urlChk : "",
			confirm : "",
		};
	
		var func = {
			customFunc : "",
			beforeFunc : "",
			afterFunc : ""
		};

		var settings = jQuery.extend(true, {}, validation.defaults, options);

		notRequired = settings.notRequiredClass;
		submitBtnClass = settings.submitBtnClass;

		regExrs.idExr = settings.validateType.idChk.regExr;
		regExrs.passExr = settings.validateType.passChk.regExr;
		regExrs.emailExr = settings.validateType.emailChk.regExr;
		regExrs.numberExr = settings.validateType.numberChk.regExr;
		regExrs.floatExr = settings.validateType.floatChk.regExr;
		regExrs.mobileExr = settings.validateType.mobileNumChk.regExr;
		regExrs.phoneExr = settings.validateType.phoneNumChk.regExr;
		regExrs.englishExr = settings.validateType.englishChk.regExr;
		regExrs.koreanExr = settings.validateType.koreanChk.regExr;
		regExrs.dateTypeExr = settings.validateType.dateTypeChk.regExr;
		regExrs.urlExr = settings.validateType.urlChk.regExr;

		func.customFunc = settings.customfunc;
		func.beforeFunc = settings.before;
		func.afterFunc = settings.after;

		msg.empty.text = settings.msg.empty.text;
		msg.empty.password = settings.msg.empty.password;
		msg.empty.radio = settings.msg.empty.radio;
		msg.empty.checkbox = settings.msg.empty.checkbox;
		msg.empty.select = settings.msg.empty.select;
		msg.empty.textarea = settings.msg.empty.textarea;

		msg.idChk = settings.msg.idChk;
		msg.passChk = settings.msg.passChk;
		msg.passEqualChk = settings.msg.passEqualChk;
		msg.emailChk = settings.msg.emailChk;
		msg.numberChk = settings.msg.numberChk;
		msg.floatChk = settings.msg.floatChk;
		msg.lengthLimitChk = settings.msg.lengthLimitChk + "(" + settings.validateType.lengthLimitChk.min + "자리)";
		msg.mobileNumChk = settings.msg.mobileNumChk;
		msg.phoneNumChk = settings.msg.phoneNumChk;
		msg.englishChk = settings.msg.englishChk;
		msg.koreanChk = settings.msg.koreanChk;
		msg.dateTypeChk = settings.msg.dateTypeChk;
		msg.urlChk = settings.msg.urlChk;
		msg.confirm = settings.msg.confirm.init;

		/*
		* Window 객체에 Feel 객체 선언
		* Feel 객체에는 validation 객체 선언
		* 정규화 문구 축약 명령어 선언
		*/

		window.constructor.prototype.Feel = {
			Validation : validation,
			RegExr : {
				Id : regExrs.idExr,
				Pass : regExrs.passExr,
				Email : regExrs.emailExr,
				Number : regExrs.numberExr,
				Float : regExrs.floatExr,
				Mobile : regExrs.mobileExr,
				Phone : regExrs.phoneExr,
				English : regExrs.englishExr,
				Korean : regExrs.koreanExr,
				DateType : regExrs.dateTypeExr,
				Url : regExrs.urlExr
			},
			Msg : {
				Id : msg.idChk,
				Pass : msg.passChk,
				Email : msg.emailChk,
				Number : msg.numberChk,
				Float : msg.floatChk,
				Mobile : msg.mobileNumChk,
				Phone : msg.phoneNumChk,
				English : msg.englishChk,
				Korean : msg.koreanChk,
				DateType : msg.dateTypeChk,
				Url : msg.urlChk,
				Empty : {
					names : {

					}
				}
			}
		};

		// 경고 메시지를 설정한다.
		var SetMsg = function(obj, className)
		{
			tagType = obj[0].nodeName;
			tagTypeValue = obj.attr("type");
			tagNameValue = obj.attr("name");

			var lastChar = "", josa = "";

			switch (tagType)
			{
				case "INPUT" :
					if (tagTypeValue == "text" || tagTypeValue == "hidden" || tagTypeValue == "file")
					{
						message = msg.empty.text;
					}
					else if (tagTypeValue == "password")
					{
						message = msg.empty.password
					}
					else if (tagTypeValue == "radio")
					{
						message = msg.empty.radio;
					}
					else if (tagTypeValue == "checkbox")
					{
						message = msg.empty.checkbox;
					}
					break;
				case "SELECT" :
					message = msg.empty.select;
					break;
				case "TEXTAREA" :
					message = msg.empty.textarea;
					break;
			}

			// 비동기로 불러온 객체가 있을 시 알림문구를 설정한다.
			settings.msg.empty.names = jQuery.extend(true, {}, settings.msg.empty.names, Feel.Msg.Empty.names);

			if (settings.msg.empty.names.hasOwnProperty(tagNameValue))
			{
				message = settings.msg.empty.names[tagNameValue];
			}
			else
			{
				if (tagTitle == "")
				{
					message = "No title value. [name=" + tagNameValue + "]";
				}
				else if (message.indexOf(tagTitle) == -1)
				{
					// 마지막글자의 받침 유무에 따라 조사를 붙여준다.
					lastChar = tagTitle.charAt(tagTitle.length - 1);
					
					josa = (lastChar.charCodeAt(0) - 44032 ) % 28 ? "을" : "를";

					message = tagTitle + josa + message;
				}
			}
		};
		
		// 설정된 메시지를 발생시키고 해당 객체로 포커스를 이동시킨다.
		var GenerateMsg = function(obj, msg)
		{
			if (!obj.hasClass(settings.ExceptionRequiredClass) && !settings.tooltip.use)
			{
				if (!!msg)
				{
					// class에 error 추가
					var findName = obj.context.id;
					$("#"+findName).parent("div").addClass("error");
					alert(msg);
				}

				if (obj[0].nodeName == "INPUT" && obj.attr("type") == "text")
				{
					obj.val("");
				}

				obj.addClass("error");

				setTimeout(function(){
					obj.removeClass("error");
				}, 2000);
			}

			if (settings.tooltip.use)
			{
				// jquery ui widget
				obj.tooltip({
					disabled: true
				}).on("focusin", function(){
					if (obj.val() == "" || isOk && !!msg)
					{
						obj.tooltip("enable").tooltip("open").tooltip({content : msg});
					}
				}).on("focusout", function(){
					obj.tooltip("close").tooltip("disable");
				}).on("keyup", function(e){
					if ($.trim($(this).val()) != "")
					{
						obj.tooltip("close").tooltip("disable");
					}
				});
			}

			var focusTargetId = obj.data("focusTargetId");

			if (focusTargetId)
			{
				$("#" + focusTargetId).focus();
			}
			else
			{
				if ((obj.attr("type") == "checkbox" || obj.attr("type") == "radio") && obj.css("display") == "none")
				{
					if ($("label[for=" + obj.attr("id") + "]").length > 0)
					{
						$("html, body").scrollTop($("label[for=" + obj.attr("id") + "]").offset().top - 200);
					}
				}
				else
				{
					obj.focus();
				}
			}

			isOk = false;
		};
		
		// 필수 입력이 아닌 경우 체크
		var NotRequiredCheck = function(obj, single, name)
		{
			var rtnFlag = true;

			if (single)
			{
				rtnFlag = !obj.hasClass(notRequired);

				if (!rtnFlag && $.trim(obj.val()) != "")
				{
					rtnFlag = true;
				}
			}
			else
			{
				$this.find("input[name=" + name + "]").each(function(){
					if ($(this).hasClass(notRequired))
					{
						rtnFlag = false;
					}
				});
			}

			return rtnFlag;
		};
		
		// 사용자 정의 함수 실행
		var UserDefineFunc = function(func, obj, tagid, okval, msg)
		{
			if (typeof func == "function")
			{
				//isOk = func(obj, tagid);
				return func(obj, tagid, okval, msg);
			}
		};

		// 패스워드 일치 검사
		var PasswordEqualCheck = function(obj, passChkClass, msg)
		{
			var trgtVal = obj.val();

			if (!trgtVal)
			{
				regResult = false;
				GenerateMsg(obj, message);
			}
			else if (trgtVal != $this.find('.' + passChkClass).val())
			{
				regResult = false;
				GenerateMsg(obj, msg);
			}
		};

		var ConvertPhone = function()
		{
			$("input").each(function(){
				if ($(this).hasClass(settings.validateType.mobileNumChk.className) || $(this).hasClass(settings.validateType.phoneNumChk.className))
				{
					$(this).keyup(function(event){
						event = event || window.event;
						//var _val = this.value.trim();
						var _val = $.trim(this.value);

						this.value = Feel.Validation.method.AutoHypenPhone(_val);

					});
				}
			});
		}();
		
		var ConvertDate = function()
		{
		    $("input").each(function(){
                if ($(this).hasClass(settings.validateType.dateTypeChk.className))
                {
                    $(this).keyup(function(event){
                        event = event || window.event;
                        //var _val = this.value.trim();
                        var _val = $.trim(this.value);

                        this.value = Feel.Validation.method.AutoHypenDate(_val);

                    });
                }
            });
		}();

		var CheckKeyup = function()
		{
			$("input").each(function(){
				// 숫자 검사
				if ($(this).hasClass(settings.validateType.numberChk.className))
				{
					$(this).keyup(function(event){
						if ($(this).val() != "")
						{
							Feel.Validation.method.RegExrCheck($(this), regExrs.numberExr, msg.numberChk, GenerateMsg);
						}
					});
				}
				
				// 실수 검사
				if ($(this).hasClass(settings.validateType.floatChk.className))
				{
					$(this).keyup(function(event){
						if ($(this).val() != "")
						{
							Feel.Validation.method.RegExrCheck($(this), regExrs.floatExr, msg.floatChk, GenerateMsg);
						}
					});
				}
				
				// 한글 검사
				if ($(this).hasClass(settings.validateType.koreanChk.className))
				{
					$(this).keyup(function(event){
						if ($(this).val() != "")
						{
							Feel.Validation.method.RegExrCheck($(this), regExrs.koreanExr, msg.koreanChk, GenerateMsg);
						}
					});
				}

				// 영문 검사
				if ($(this).hasClass(settings.validateType.englishChk.className))
				{
					$(this).keyup(function(event){
						if ($(this).val() != "")
						{
							Feel.Validation.method.RegExrCheck($(this), regExrs.englishExr, msg.englishChk, GenerateMsg);
						}
					});
				}
				
				// maxLength 검사
				if ($(this).is("[maxlength]"))
				{
					$(this).keyup(function(event){
						if ($(this).val() != "")
						{
							cmmCtrl.checkMaxlength(this);
						}
					});
				}
			});
		}();
		
		var hasMaxlengthCheck = function(obj){
			if (Feel.Validation.developmentMode == "dev")
			{
				if (!typeof $(obj).is("[maxlength]") == false)
				{
					GenerateMsg(obj, "최대 입력 길이(maxlength) 설정해주세요.");
				}
			}
		};

		// 콤마 기능
		if (settings.comma.use)
		{
			Feel.Validation.method.Comma($("." + settings.comma.className), "keyup");
		}
		
		// submit btn event mapping
		if (typeof submitBtnClass != "undefined")
		{
			$("." + submitBtnClass).click(function(e){
				e.preventDefault();
				$this.submit();
			});
		}
		
		// 값 또는 태그의 상태에 대한 확인 모음
		var validationType = {
			Empty : function(obj, msg){
				if (!obj.hasClass(settings.validateType.passChk.equalClass))
				{
					if (NotRequiredCheck(obj, true))
					{
						if ($.trim(obj.val()).length == 0) GenerateMsg(obj, msg);
					}
				}
			},
			Radio : function(obj, msg){
				var radio_ok = false;

				tagName = obj.attr("name");

				if (NotRequiredCheck(obj, false, tagName))
				{
					if ($("input[name=" + tagName + "]:checked").length > 0) radio_ok = true;
					if (!radio_ok) GenerateMsg(obj, msg);
				}
			},
			CheckBox : function(obj, msg){
				var check_ok = false;

				tagName = obj.attr("name");

				if (NotRequiredCheck(obj, false, tagName))
				{
					if ($("input[name=" + tagName + "]:checked").length > 0) check_ok = true;
					if (!check_ok) GenerateMsg(obj, msg);
				}
			},
			IdChk : function(obj, regexr, msg){
				Feel.Validation.method.RegExrCheck(obj, regexr, msg, GenerateMsg);
			},
			PassChk : function(obj, regexr, msg){
				if (NotRequiredCheck(obj, true)) Feel.Validation.method.RegExrCheck(obj, regexr, msg, GenerateMsg);
			},
			PassEqualChk : function(obj, passChkClass, msg){
				if (NotRequiredCheck(obj, true)) PasswordEqualCheck(obj, passChkClass, msg);
			},
			LengthLimitChk : function(obj, lengthInfo, msg){
				Feel.Validation.method.LengthCheck(obj, lengthInfo, msg, GenerateMsg);
			},
			CommonChk : function(obj, regexr, msg){
				if (NotRequiredCheck(obj, true)) Feel.Validation.method.RegExrCheck(obj, regexr, msg, GenerateMsg);
			}
		};

		// 중복 검사 기능
		duplication.check(settings.duplication, regExrs, msg);
		
		$this.submit(function(e){
			window.onbeforeunload = null;

			isOk = true;

			if (typeof func.beforeFunc === "function")
			{
				try
				{
					func.beforeFunc();
				}
				catch(e)
				{
					alert(e);
				}
			}

			$this.find("input:text, input:hidden, input:password, input:radio, input:checkbox, input:file, select, textarea").each(function(){
				tagType = $(this)[0].nodeName;
				tagTypeValue = "";
				tagTitle = $(this).attr("title");
				tagID = $(this).attr("id");
				if (typeof tagTitle == "undefined") tagTitle = "";

				SetMsg($(this));

				switch (tagType)
				{
					case "INPUT" :
						tagTypeValue = $(this).attr("type");

						if (tagTypeValue == "text" || tagTypeValue == "hidden" || tagTypeValue == "password" || tagTypeValue == "file")
						{
							if (tagTypeValue == "text") hasMaxlengthCheck($(this));

							if (isOk)
							{
								validationType.Empty($(this), message);

								if (isOk && $(this).hasClass(settings.validateType.idChk.className)) validationType.IdChk($(this), regExrs.idExr, msg.idChk);
								if (tagTypeValue == "password")
								{
									if (isOk && $(this).hasClass(settings.validateType.passChk.className)) validationType.PassChk($(this), regExrs.passExr, msg.passChk);
									if (isOk && $(this).hasClass(settings.validateType.passChk.subClassName)) validationType.PassChk($(this), regExrs.passExr, msg.passChk);
									if (isOk && $(this).hasClass(settings.validateType.passChk.equalClass)) validationType.PassEqualChk($(this), settings.validateType.passChk.className, msg.passEqualChk);
								}
								if (isOk && $(this).hasClass(settings.validateType.emailChk.className)) validationType.CommonChk($(this), regExrs.emailExr, msg.emailChk);
								if (isOk && $(this).hasClass(settings.validateType.numberChk.className)) validationType.CommonChk($(this), regExrs.numberExr, msg.numberChk);
								if (isOk && $(this).hasClass(settings.validateType.floatChk.className)) validationType.CommonChk($(this), regExrs.floatExr, msg.floatChk);
								if (isOk && $(this).hasClass(settings.validateType.lengthLimitChk.className)) validationType.LengthLimitChk($(this), settings.validateType.lengthLimitChk, msg.lengthLimitChk);
								if (isOk && $(this).hasClass(settings.validateType.mobileNumChk.className)) validationType.CommonChk($(this), regExrs.mobileExr, msg.mobileNumChk);
								if (isOk && $(this).hasClass(settings.validateType.phoneNumChk.className)) validationType.CommonChk($(this), regExrs.phoneExr, msg.phoneNumChk);
								if (isOk && $(this).hasClass(settings.validateType.englishChk.className)) validationType.CommonChk($(this), regExrs.englishExr, msg.englishChk);
								if (isOk && $(this).hasClass(settings.validateType.koreanChk.className)) validationType.CommonChk($(this), regExrs.koreanExr, msg.koreanChk);
								if (isOk && $(this).hasClass(settings.validateType.dateTypeChk.className)) validationType.CommonChk($(this), regExrs.dateTypeExr, msg.dateTypeChk);
								if (isOk && $(this).hasClass(settings.validateType.urlChk.className)) validationType.CommonChk($(this), regExrs.urlExr, msg.urlChk);
							}
						}
						else if (tagTypeValue == "radio")
						{
							validationType.Radio($(this), message);
						}
						else if (tagTypeValue == "checkbox")
						{
							validationType.CheckBox($(this), message);
						}

						break;
					case "SELECT" :
						tagTypeValue = "select";
						validationType.Empty($(this), message);
						break;
					case "TEXTAREA" :
						tagTypeValue = "textarea";
						validationType.Empty($(this), message);
						break;
				}

				rtnFunc = UserDefineFunc(func.customFunc, $(this), tagID, isOk, message);

				if (typeof rtnFunc != "undefined")
				{
					isOk = rtnFunc;

					if (!isOk) return false;
				}

				if (!$(this).hasClass(settings.ExceptionRequiredClass) && !settings.tooltip.use)
				{
					if (!isOk) return false;
				}

				// 중복검사 상태 확인
				isOk = duplication.confirm($(this), tagID);
			});

			if (!isOk) e.preventDefault();

			if (isOk)
			{
				if (typeof func.afterFunc === "function")
				{
					try
					{
						isOk = func.afterFunc();
					}
					catch(e)
					{
						isOk = false;
						alert(e);
					}
				}

				if (isOk)
				{
					// 포스트 액션값 셋팅
					if (Feel.Validation.action !== "") $this.attr("action", Feel.Validation.action);

					if (Array.isArray(settings.msg.confirm.custom))
					{
						$.each(settings.msg.confirm.custom, function(index, list){
							if ($this.attr("action").indexOf(list.action) > -1 && list.message != "" && typeof list.message != "undefined")
							{
								msg.confirm = list.message;
							}
						});
					}

					if (Feel.Validation.confirm !== "") msg.confirm = Feel.Validation.confirm;

					if (msg.confirm != "")
					{
						// 취소일때
						if (!confirm(msg.confirm))
						{
							isOk = false;
							$(".submit-btn .submit").prop("disabled", false);
							Feel.Validation.action = "";
							Feel.Validation.confirm = "";

							$this.attr("action", action);

							msg.confirm = settings.msg.confirm.init;

							e.preventDefault();
						}
					}

					if (isOk)
					{
						if (Feel.Validation.async.use || Feel.Validation.async.reset) settings.async = Feel.Validation.async;

						if (settings.async.use)
						{
							e.preventDefault();

							if (typeof settings.async.func === "function")
							{
								settings.async.func($this);
							}
						}

						if (settings.loadingbar.use)
						{
							Feel.Validation.method.Indicator($(".layout-container"), $(".loadingbar"));

							$("body").focus();

							if (settings.loadingbar.autoClose)
							{
								setTimeout(function(){
									$(".loadingbar").fadeOut(300);
								}, 1000);
							}
						}
					}
				}
				else
				{
					if (typeof isOk == "undefined")
					{
						alert("Return value is not defined.[after function(return true or false)]");
					}

					e.preventDefault();
				}
			}
		});
		
		if (mod == "dev")
		{
			$this.css("position", "relative").css("border", "1px dashed red").append("<button type=\"button\" class=\"btn btn-primary validationLabel\">ezValidation " + ver + " 예제 보기</button>").find(".validationLabel")
										     .css("position", "absolute")
										     .css("top", 0)
										     .css("left", 0);

			$(".validationLabel").click(function(e){
				window.open("/common/js/lib/ezValidation/example/index.html", "사용 예제", "top=100,left=0,width=1200,height=800");
			});
		}
	};
})(jQuery);