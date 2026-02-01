define(["jquery"], function($) {
cmmCtrl = (function(){

	"use strict";

	var fn_replace_null = function(val, chgStr)
	{
		if (val == undefined || val == null || val == "")
		{
			return chgStr;
		}
		else
		{
			return val;
		}
	};

    /* Ajax Normal */
    var fn_ajax = function(callbackAjax, url, dataType, loading, sync)
    {
        if (typeof dataType == "undefined") {
            dataType = "json";
        }

        if (typeof sync == "undefined") {
            sync = true;
        }

        jQuery.ajax({
            url : url,
            type : "post",
            timeout: 30000,
            dataType : dataType,
            async: sync,
            cache : false,
            beforeSend : function(){
                if (loading) {

                }
            },
            success : function(data, status, xhr){
                if (callbackAjax) {
                    callbackAjax(data);
                }
            },
            error : function(data, status, xhr){
            	fn_ajax_error(data, status, xhr);
            },
            complete : function(){
                if (loading) {

                }
            }
        });
    };

    /* Ajax Form Data */
    var fn_ajax_data = function(callbackAjax, url, formObj, dataType, loading, sync)
    {
    	if (typeof dataType == "undefined") {
            dataType = "json";
        }

        if (typeof sync == "undefined") {
            sync = true;
        }

        if (formObj.data("submitFlag") != "Y") {
        	jQuery.ajax({
                url : url,
                type : "post",
                timeout: 30000,
                data : formObj.serializeArray(),
                dataType : dataType,
                async: sync,
                cache : false,
                beforeSend : function(){
                	formObj.data("submitFlag", "Y");

                	if (loading) {

                	}
                },
                success : function(data, status, xhr){
                	formObj.data("submitFlag", "N");

                    if (callbackAjax) {
                        callbackAjax(data);
                    }
                },
              	error : function(data, status, xhr){
                	formObj.data("submitFlag", "N");

                	fn_ajax_error(data, status, xhr);
                },
                complete : function(){
                    if (loading) {

                    }
                }
            });
		}
    };

    /* Ajax Param Data */
    var fn_ajax_param_data = function(callbackAjax, url, paramData, dataType, loading, sync)
    {
    	if (typeof dataType == "undefined") {
            dataType = "json";
        }

        if (typeof sync == "undefined") {
            sync = true;
        }

        jQuery.ajax({
            url : url,
            type : "post",
            timeout: 300000,
            data : paramData,
            dataType : dataType,
            async: sync,
            cache : false,
            beforeSend : function() {
                if (loading) {

                }
            },
            success : function(data, status, xhr) {
                if (callbackAjax) {
                    callbackAjax(data);
                }
            },
            error : function(data, status, xhr) {
            	fn_ajax_error(data, status, xhr);
            },
            complete : function() {
                if (loading) {

                }
            }
        });
    };

    /* Ajax File Data */
    var fn_ajax_file_data = function(callbackAjax, url, formObj, dataType, loading, sync)
    {
    	if (typeof dataType == "undefined") {
            dataType = "json";
        }

        if (typeof sync == "undefined") {
            sync = true;
        }

        if (formObj.data("submitFlag") != "Y") {
	        jQuery.ajax({
	            url : url,
	            type : "post",
	            timeout: 30000,
	            data : new FormData(formObj[0]),
	            dataType : dataType,
	            async: sync,
	            cache : false,
	            contentType: false,
	            processData: false,
	            beforeSend : function() {
	            	formObj.data("submitFlag", "Y");

	                if (loading) {

	                }
	            },
	            success : function(data, status, xhr) {
	            	formObj.data("submitFlag", "N");

	                if (callbackAjax) {
	                    callbackAjax(data);
	                }
	            },
	            error : function(data, status, xhr) {
	            	formObj.data("submitFlag", "N");

	            	fn_ajax_error(data, status, xhr);
	            },
	            complete : function() {
	                if (loading) {

	                }
	            }
	        });
		}
    };

    /* Ajax Error */
    var fn_ajax_error = function(data, status, xhr)
    {
    	alert(msgCtrl.getMsg("fail.act"));
    };

    /* Pagination */
    var fn_pagination = function(pageIndex)
	{
		var url = location.pathname;
		var searchInput = jQuery('#searchInput').val();

		if(searchInput != null && searchInput != '') {
			jQuery('input[name=searchInput]').val(searchInput);
		}

		jQuery("#pageIndex").val(pageIndex);
		jQuery("#frm_search").attr("action", url).submit();
	};

	/* FinancePublic List (페이징) */
	var fn_list = {
		formId : "frmSearch",
		actUrl : "./list.ajax",
		listCnt : 12,
		notHisRplc : false,
		init : function (listCnt, notHisRplc){
			var pageIndex = jQuery.getURLParam("pageIndex");

			if (!pageIndex || isNaN(pageIndex))
			{
				pageIndex = 1;
			}

			jQuery("#pageIndex").val(pageIndex);

			if (typeof listCnt != "undefined")
			{
				this.listCnt = listCnt;
			}

			if (typeof notHisRplc != "undefined")
			{
				this.notHisRplc = notHisRplc;
			}

			this.set();
		},
		set : function(pageIndex){
			if (typeof pageIndex != "undefined")
			{
				jQuery("#pageIndex").val(pageIndex);
			}

			jQuery("#listCnt").val(this.listCnt);

			cmmCtrl.frmAjax(cmmCtrl.list.callback, this.actUrl, jQuery("#" + this.formId), "html");
		},
		callback : function(rtnHtml){
			if (typeof rtnHtml != "undefined")
			{
				var listAreaObj = jQuery("#listArea");

				listAreaObj.html(rtnHtml);

				var totalRecordCount = listAreaObj.children(":last").data("totalRecordCount");

				if (typeof totalRecordCount == "undefined")
				{
					totalRecordCount = 0;
				}

				// 상단 총 건수
				var allCountObj = jQuery(".total");

				if (allCountObj.length > 0)
				{
					allCountObj.find("span").text(totalRecordCount);
				}

				// 리스트 영역
				if (totalRecordCount > 0)
				{
					jQuery("#dataAreaY").show();
					jQuery("#dataAreaN").hide();
				}
				else
				{
					jQuery("#dataAreaY").hide();
					jQuery("#dataAreaN").show();
				}

				var totalPageCount = parseInt(listAreaObj.children(":last").data("totalPageCount"), 10);

				if (totalPageCount > 0)
				{
					jQuery("#pagination").paging({
						prnt	: this,
						current : jQuery("#pageIndex").val(),
						length  : 10,
						max 	: totalPageCount,
						href 	: "javascript:",
						onclick : function(e, pageIndex) {
							cmmCtrl.list.set(pageIndex);
						}
					});
				}
				else
				{
					jQuery("#pagination").empty();
				}

				if (!cmmCtrl.list.notHisRplc)
				{
					history.replaceState("", "", location.pathname + "?" + jQuery("#" + cmmCtrl.list.formId).strPam());
				}

				// var trgtTop = jQuery("#trgtTop").offset().top;

				// 제품 검색어 (PSProductListCtrl.js) or 관심 제품
				// if (location.pathname.indexOf("/product/") == 0)
				// {
				// 	fn_set_recent_search_term();
				// 	fn_set_intrs_prdct_heart();
				//
				// 	setTimeout(function(){
				// 		listAreaObj.find(".list").addClass("active").find(".img").each(function(index){
				// 			jQuery(this).css("height", jQuery(this).width());
				// 		});
				// 	}, 100);
				// }
				// else
				// {
				// 	listAreaObj.find("img").load(function(){ subScript.imgResizeDev(); });
				//
				// 	trgtTop = trgtTop - 25;
				// }

				// if (jQuery(document).scrollTop() > 0)
				// {
				// 	jQuery(window).scrollTop(trgtTop);
				// }
			}
		}
	};

    /* List (더보기) */
	var fn_more = {
		formId : "frmSearch",
		actUrl : "./list.ajax",
		listCnt : 10,
		notHisRplc : false,
		isAppnd : null,
		init : function (listCnt, notHisRplc){
			var pageIndex = jQuery.getURLParam("pageIndex");

			if (!pageIndex || isNaN(pageIndex))
			{
				pageIndex = 1;
			}

			jQuery("#pageIndex").val(pageIndex);

			if (typeof listCnt != "undefined")
			{
				this.listCnt = listCnt;
			}

			if (typeof notHisRplc != "undefined")
			{
				this.notHisRplc = notHisRplc;
			}

			this.set();
		},
		set : function(pageIndex){
			var trgtObj = jQuery("#pageIndex");

			if (typeof pageIndex != "undefined")
			{
				trgtObj.val(pageIndex);
			}

			if (trgtObj.val() > 1)
			{
				this.isAppnd = true;
			}
			else
			{
				this.isAppnd = false;
			}

			jQuery("#listCnt").val(this.listCnt);

			cmmCtrl.frmAjax(cmmCtrl.more.callback, this.actUrl, jQuery("#" + this.formId), "html");
		},
		callback : function(rtnHtml){
			if (typeof rtnHtml != "undefined")
			{
				var listAreaObj = jQuery("#listArea");

				if (cmmCtrl.more.isAppnd)
				{
					listAreaObj.append(rtnHtml);
				}
				else
				{
					listAreaObj.html(rtnHtml);
				}

				var recordCount = listAreaObj.children().length;
				var totalRecordCount = listAreaObj.children(":last").data("totalRecordCount");

				if (typeof totalRecordCount == "undefined")
				{
					totalRecordCount = 0;
				}

				// 리스트 영역
				if (totalRecordCount > 0)
				{
					jQuery("#dataAreaY").show();
					jQuery("#dataAreaN").hide();
				}
				else
				{
					jQuery("#dataAreaY").hide();
					jQuery("#dataAreaN").show();
				}

				// 더보기 (현재 건 수 / 총 건수)
				var btnMoreObj = jQuery("#btnMore");

				if (btnMoreObj.length > 0)
				{
					if (recordCount < totalRecordCount)
					{
						btnMoreObj.show().find("p.num").html("(<span>" + recordCount + "</span>/<span class=\"total\">" + totalRecordCount + "</span>)");
					}
					else
					{
						btnMoreObj.hide().find("p.num").html("(<span>" + recordCount + "</span>/<span class=\"total\">" + totalRecordCount + "</span>)");
					}
				}

				jQuery("#firstIndex").remove();

				if (!cmmCtrl.more.notHisRplc)
				{
					history.replaceState("", "", location.pathname + "?" + jQuery("#" + cmmCtrl.list.formId).strPam());
				}
			}
		}
	};

    /* Move Details */
    var fn_move_details = function(field, seq, url)
    {
    	var strPam = location.search.substr(location.search.indexOf("?") + 1);

   	 	if (strPam.indexOf(field + "=") < 0)
		{
			location.href = url + "?" + (strPam ? "&" : "") + field + "=" + seq;
		}
		else
		{
			var paramArr = strPam.split("&").map(function(value){
				return value.indexOf(field + "=") < 0 ? value : field + "=" + seq;
			});

			location.href = url + "?" + paramArr.join("&");
		}
    };

	/* Set Popup */
	var fn_set_popup = function(pUrl, pName, pSw, pSh)
	{
		//스크린의 크기
		var cw = screen.availWidth;
		var ch = screen.availHeight;
		var sw = pSw;
		var sh = pSh;
		var ml = (cw - sw) / 2;
		var mt = (ch - sh) / 2;

		window.open(pUrl, pName, "width="+sw+",height="+sh+",top="+mt+",left="+ml+",location=no,menubar=no,toolbar=no,scrollbars=yes,resizable=no,copyhistory=no");
	};

	/* Set Cookie */
	var fn_set_cookie = function(cName, cValue, cDay)
	{
	   var expire = new Date();

	   // 다음 날 00:00 (한국시간 기준)
	   expire = new Date(parseInt(expire.getTime() / 86400000) * 86400000 + 54000000);

	   if (expire > new Date())
	   {
		   cDay = cDay - 1;
	   }

	   expire.setDate(expire.getDate() + cDay);

	   var cookies = cName + "=" + escape(cValue) + "; path=/ ";

	   if (typeof cDay != "undefined")
	   {
		   cookies += ";expires=" + expire.toGMTString() + ";";
	   }

	   document.cookie = cookies;
	};

	/* Get Cookie */
	var fn_get_cookie = function(strName)
	{
		var rtn = "";
		var strCookieName = strName + "=";
		var objCookie = document.cookie;

		if (objCookie.length > 0)
		{
			var nBegin = objCookie.indexOf(strCookieName);

			if (nBegin < 0)
			{
				return rtn;
			}

			nBegin += strCookieName.length;

			var nEnd = objCookie.indexOf(";", nBegin);

			if (nEnd == -1)
			{
			    nEnd = objCookie.length;
			}
		}

		return unescape(objCookie.substring(nBegin, nEnd));
	};

	/* Set Today Close */
	var fn_set_today_close = function(obj, trgtId)
	{
		if (trgtId)
		{
			cmmCtrl.setCookie(trgtId, "true", 1);
		}

		jQuery(obj).next().click();
	};

	/* Check Maxlength */
	var fn_check_maxlength = function(obj)
	{
		var maxLength = obj.maxLength;

		if (obj.value.length > maxLength)
		{
			obj.value = obj.value.slice(0, maxLength);
		}
	};

    /* Move Custom Details */
    var fn_move_customDetails = function(field1, seq, field2, rnum, url)
    {
    	var strPam = location.search.substr(location.search.indexOf("?") + 1);
   	 	if (strPam.indexOf(field1 + "=") < 0)
		{
			location.href = url + "?" + (strPam ? "&" : "") + field1 + "=" + seq;
		}
		else
		{
			var paramArr = strPam.split("&").map(function(value){
				return value.indexOf(field1 + "=") < 0 ? value : field1 + "=" + seq
			}).map(function(value){
				return value.indexOf(field2 + "=") < 0 ? value : field2 + "=" + rnum;
			})
			location.href = url + "?" + paramArr.join("&");
		}
    };

	/* 체크박스 전체 선택 */
	jQuery(document).on("change", ".checkbox_all", function(){
		var trgtObj = jQuery(this).closest("div");

		if (jQuery(this).is(":checked"))
		{
			trgtObj.find(".checkbox_single").prop("checked", true);
		}
		else
		{
			trgtObj.find(".checkbox_single").prop("checked", false);
		}
	});

	/* 체크박스 단일 선택 */
	jQuery(document).on("change", ".checkbox_single", function(){
		var trgtObj = jQuery(this).closest("div");

		var allCbxCnt = trgtObj.find(".checkbox_single").length;
		var selCbxCnt = trgtObj.find(".checkbox_single:checked").length;

		if (allCbxCnt == selCbxCnt)
		{
			trgtObj.find(".checkbox_all").prop("checked", true);
		}
		else
		{
			trgtObj.find(".checkbox_all").prop("checked", false);
		}
	});

	/***
	 * 페이지 로드
	 ***/
	jQuery(document).ready(function(){
		// 검색 Keyword Input Enter
		jQuery("input[name='q']").on("keydown", function(e){
			if (e.keyCode == 13)
			{
				e.preventDefault();

				cmmCtrl.list.set(1);
			}
		});

		// Tab 위치로 스크롤링
		var tabMoveFlag = localStorage.getItem("tabMoveFlag");

		if (jQuery(".tab1, .tab2").length > 0 && tabMoveFlag)
		{
			var tab1Index = jQuery(".tab1 a").index(jQuery(".tab1 a.active"));

			if (tab1Index > -1)
			{
				setTimeout(function(){ jQuery("html, body").animate({ scrollTop : jQuery(".tab1").offset().top - 20}, 500); }, 100);
			}

			var tab2Index = jQuery(".tab2 a").index(jQuery(".tab2 a.on"));

			if (tab2Index > -1)
			{
				setTimeout(function(){ jQuery("html, body").animate({ scrollTop : jQuery(".tab2").offset().top - 80}, 500); }, 120);
			}
		}

		localStorage.removeItem("tabMoveFlag");

		// // 더보기
		// jQuery("#btnMore").on("click", function(){
		// 	cmmCtrl.more.set(parseInt(jQuery("#pageIndex").val(), 10) + 1);
		// });
	});

	/* 파라미터 추출 */
    jQuery.extend({
    	getXssVal : function(targetValue){
			var returnValue = targetValue;

			if (returnValue)
			{
				returnValue = returnValue.replace(/&amp;/g, "&");
				returnValue = returnValue.replace(/&lt;/g, "<");
				returnValue = returnValue.replace(/&gt;/g, ">");
				returnValue = returnValue.replace(/&#34;/g, "\"");
				returnValue = returnValue.replace(/&#37;/g, "%");
				returnValue = returnValue.replace(/&#39;/g, "\'");
			}

			return returnValue;
		},
        getURLParam : function(strParamName) {
            var strHref   = window.location.href;
            var cmpstring = strParamName + "=";
            var bFound    = false;
            var strReturn = "";

            if (strHref.indexOf("?") > -1)
            {
                var aQueryString = strHref.substr(strHref.indexOf("?") + 1).split("&");

                for (var iParam = 0, length = aQueryString.length; iParam < length; iParam++)
                {
                    if (aQueryString[iParam].substr(0, cmpstring.length) == cmpstring)
                    {
                        strReturn = aQueryString[iParam].split("=")[1];
                        bFound = true;
                        break;
                    }
                }
            }

            if (bFound == false)
            {
                return null;
            }

            return strReturn;
        },
        getURLParams: function(){
            return location.search
        }
    });

    /* clearForm */
	jQuery.fn.clearForm = function(){
		return this.each(function(){
			var type = this.type, tag = this.tagName.toLowerCase();

			if (tag === "form")
			{
				return jQuery(":input", this).clearForm();
		    }

			if (type === "text" || type === "password" || type === "hidden" || tag === "textarea")
			{
				this.value = "";
		    }
			else if (type === "checkbox" || type === "radio")
			{
				this.checked = false;
		    }
			else if (tag === "select")
			{
				this.selectedIndex = 0;
		    }
		});
	};

	/* form strPam */
    jQuery.fn.strPam = function(){
    	var formObj = this, tmpObj = { }, strPam = "";

    	$.each(formObj.serializeArray(), function(){
    		var $type = formObj.find("[name='" + this.name + "']").prop("type");

    		if (tmpObj[this.name])
         	{
    			if ($type == "checkbox")
    			{
    				tmpObj[this.name] = tmpObj[this.name] + "," + "|" + this.value + "|";
    			}
    			else
    			{
    				tmpObj[this.name] = tmpObj[this.name] + "," + this.value;
    			}
         	}
         	else
         	{
         		if ($type == "checkbox")
         		{
         			tmpObj[this.name] = "|" + this.value + "|";
         		}
         		else
         		{
         			tmpObj[this.name] = this.value;
         		}
         	}
    	});

    	$.each(Object.keys(tmpObj), function(){
    		if (strPam)
         	{
         		strPam += "&";
         	}

         	strPam += this + "=" + tmpObj[this];
    	});

    	return strPam;
    };

    // BFCache 체크
	window.onpageshow = function(event){
		history.scrollRestoration = "manual";

	    if (event.persisted)
	    {
			location.reload();
		}
	};

    return {
    	nvl : fn_replace_null,
        bscAjax : fn_ajax,
        frmAjax : fn_ajax_data,
        paramAjax : fn_ajax_param_data,
        fileFrmAjax : fn_ajax_file_data,
		list : fn_list,
        more : fn_more,
        details : fn_move_details,
        customDetails : fn_move_customDetails,
        setPopup : fn_set_popup,
        setCookie : fn_set_cookie,
        getCookie : fn_get_cookie,
        setTodayClose : fn_set_today_close,
        checkMaxlength : fn_check_maxlength,
        pagination : fn_pagination,
    }
}());

return cmmCtrl;
});