/**
 * version 0.4.0
 **/
define([], function() {

	"use strict";
	
	var feel = {};
	
	feel.GetIds = function(parentTag, tagType){
		var idvalue = "", patten = /-/i, rtnObj = {};
		
		for (var type in tagType)
		{
			parentTag.find(tagType[type]).each(function(i, v){
				idvalue = $(this).attr("id");
			
				if (idvalue !== undefined && idvalue != "" && !patten.test(idvalue))
				{
					rtnObj[idvalue] = {};
				}
			});
		}

		return rtnObj;
	};

	feel.GetClass = function(parentTag, tagType){
		var classvalue = "", patten = /-/i, arr = [], rtnObj = {};
		
		for (var type in tagType)
		{
			parentTag.find(tagType[type]).each(function(i, v){
				classvalue = $(this).attr("class");
				
				if (classvalue !== undefined && !patten.test(classvalue))
				{
					classvalue = classvalue.split(/\s+/);					
				
					$.each(classvalue, function(index, value){
						if ($.inArray(value, arr) === -1)
						{
							if (value !== undefined && value != "")
							{
								arr.push(value);	
								rtnObj[value] = {};
							}
						}						
					});
				}
			});
		}
		
		return rtnObj;
	};
	
	feel.controller = function(controllerName, mode){
		this.obj = {};
		this.model = {};

		var controllerVal = {
			obj : null,
		},
		modelVal = {
			targetObj : {},
			attrObj : {},
			eventObj : {},
			viewObj : {},
			viewTargetString : ""
		},
		defaultObj = {
			id : {},
			classname : {} 
		},
		defaultTagObj = {
			$obj : {}
		};

		var targetChar = "", ctrlName = "", idObjs = {}, classObjs = {};

		ctrlName = controllerName.split("/");
		ctrlName = ctrlName[ctrlName.length - 1];
		
		// get controller
		$("div[data-controller]").each(function(){
			var $this = $(this), conValue = $this.data("controller");
			
			if (typeof conValue != "undefined" && conValue != "")
			{
				conValue = conValue.split(/\s+/);
				
				$.each(conValue, function(index, value){
					if (value == controllerName)
					{
						controllerVal.obj = $this;	
					}					
				});
			}
		});	
				
		if (controllerVal.obj == null)
		{
			this.exec = function(){
				return;
			};
			
			return;
		}

		this.obj = controllerVal.obj;

		// get ids
		idObjs = feel.GetIds(controllerVal.obj, ["form", "input", "div", "p", "span", "textarea", "ul"]);
		
		classObjs = feel.GetClass(controllerVal.obj, ["input", "div", "p", "span", "textarea", "ul"]);
 
		defaultObj.id = $.extend(true, {}, defaultObj.id, idObjs);
		
		defaultObj.classname = $.extend(true, {}, defaultObj.classname, classObjs);
		
		this.exec = function(){
			// get viewdata
			if (typeof this.ajaxUrl != "undefined" && this.ajaxUrl != "")
			{
				$.ajax({
					type : "post",
					async : false,
					url : this.ajaxUrl,
					dataType : "json",
					data : {
						detailsKey : 2
					},
					success : function(jdata){
						modelVal.viewObj["viewdata"] = jdata;
					},
					error : function(a, b){
						console.log(a);
						console.log(b);
					}
				});
			}
			
			// model extend
			this.model = $.extend(true, {}, this.model, defaultObj);
			this.model = $.extend(true, {}, this.model, modelVal.viewObj);
			
			window[ctrlName] = this.model;
			
			// model projection logic
			for (var key in this.model)
			{
				switch (key.toLowerCase())
				{
					case "id" :
					case "classname" :
						targetChar = key == "id" ? "#" : ".";
 
						modelVal.targetObj = this.model[key];

						for (var target in modelVal.targetObj)
						{
							modelVal.attrObj = modelVal.targetObj[target];

							// add default attribute
							defaultTagObj.$obj = controllerVal.obj.find(targetChar + target);

							if (defaultTagObj.$obj.length == 0)
							{
								$(targetChar + target).addClass("notModel");
							}
							
							modelVal.attrObj = $.extend(true, {}, defaultTagObj, modelVal.attrObj);

							eval("defaultObj." + key + "." + target + " = modelVal.attrObj");

							for (var attr in modelVal.attrObj)
							{
								if (attr === "data")
								{
									modelVal.dataObj = modelVal.attrObj[attr];
								
									for(var e in modelVal.dataObj)
									{
										defaultTagObj.$obj.data(e, modelVal.dataObj[e]);
									}
								}
								
								if (attr === "event")
								{
									modelVal.eventObj = modelVal.attrObj[attr];

									for (var e in modelVal.eventObj)
									{
										if (typeof modelVal.eventObj[e] === "function")
										{
											this.obj.on(e, targetChar + target, modelVal.eventObj[e]);
										}
									}
								}
							}
						}
						
						break;
					case "viewdata" :
						var vm = "", ts = "";
						  
						for (var key in this.model["viewdata"])
						{
							vm = this.model["viewdata"][key];

							for (var v in vm)
							{
								ts = key + '.' + v;

								controllerVal.obj.html(function(i, h){
									return h.replace(new RegExp(ts, "gi"), vm[v]);
								});
							};
						};
						
						break;
				}
			};

			for (var key in this.model)
			{
				switch (key.toLowerCase())
				{
					case "immediately" : 
						if (typeof this.model[key] === "function")
						{
							this.model[key]();
						}
						
						break;
				}
			};
			
			$(".notModel").each(function(index, obj){
				$(obj).data("placement", "right").attr("title", "This object was not included " + ctrlName  + " area.").tooltip();
			});
		};

		this.getViewData = function(){
			return this.model["viewdata"];
		};
		
		if (mode == "dev")
		{
			controllerVal.obj.css("position", "relative")
							 .css("border", "1px dashed red").append("<span class=\"controllerLabel\">" + controllerName + "</span>").find(".controllerLabel")
							 .css("position", "relative")
							 .css("top", 0)
							 .css("background", "#000")
							 .css("color", "#fff")
							 .css("margin-right", "5px");
		}
	};

	feel.LoadControllerJS = function(){
		var conValue = "";
		
		// get controller name
		$("div[data-controller]").each(function(){
			
			conValue = $(this).data("controller");
			
			if (typeof conValue != "undefined" && conValue != "")
			{
				require(conValue.split(/\s+/), function(){
					// return define
				}, function(error){
					// error
					console.log(error);
				});		
			}
		});
	};
	
	return feel;
});