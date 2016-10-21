jQuery.sap.require("com.sap.mt.model.message");
jQuery.sap.require("com.sap.mt.js.HanaSmartSearchHelper");
jQuery.sap.require("com.sap.mt.js.HanaSmartSearchCustHelper");

sap.ui.controller("com.sap.mt.controller.View2", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf accountsearchbar.AccountIdentificationFrame
*/
	onInit: function() {
		var data = configuration;
		if(data.session){
			var oModel = new sap.ui.model.json.JSONModel();
			sap.ui.getCore().setModel(oModel, MODEL_SESSION);
		}
		else if(data.hss){
			var oModel;
			//Create all the json models
			for(var sModelName in data.hss){
				oModel = new sap.ui.model.json.JSONModel();
				oModel.setData(data.hss[sModelName]);
				sap.ui.getCore().setModel(oModel, sModelName);
			}
		this.onInitializeView();
		}
	},
	
	onInitializeView: function(){
		if (sap.ui.getCore().getConfiguration().getTheme() != 'sap_hcb') {
			$('body').css('background-color', 'transparent');
		}

		sap.ui.localResources('js');
		sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel(), 'parameter');
		jQuery.sap.registerModulePath('js', './js/');
		var view = sap.ui.view({id:"idHanaSmartSearchMain", viewName:"js.HanaSmartSearchMain", type:sap.ui.core.mvc.ViewType.JS, height: '100%'});
		var oDetailsViewContainer = this.getView().byId("detailsViewContainer");
		oDetailsViewContainer.addContent(view);
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf accountsearchbar.AccountIdentificationFrame
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf accountsearchbar.AccountIdentificationFrame
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf accountsearchbar.AccountIdentificationFrame
*/
	onExit: function() {

	}

});