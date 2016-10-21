sap.ui.controller("com.sap.mt.controller.AccountQuickView", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf accountsearchbar.AccountIdentificationFrame
*/
	onInit: function() {
		if(console && console.log){
			console.log("view created:" + this.getView().getId());
		}
	},
	
	formatTitle: function(title, firstname, lastname){
		var fullName = firstname + " " + lastname;
		fullName = title ? this._getTitle(title) + " " + fullName : fullName;
		return fullName;
	},
	
	formatCountry: function(countryID){
		//var country = com.sap.cecenter.agenthome.utilities.UtilityStartupManager.getInstance().getCountryText(countryID);
		var country = "Germany";
		return country;
	},
	
	formatCity: function(city, stateID, zipCode, countryID){
		//var state = com.sap.cecenter.agenthome.utilities.UtilityStartupManager.getInstance().getStateText(countryID, stateID);
		var state = "";
		state = stateID ? state + " " + zipCode : zipCode;
		return city + ", " + state;
	},
	
	_getTitle: function(key){
		var titles = [
			{"key":"MR", "text":"Mr."},
			{"key":"MS", "text":"Ms."},
			{"key":"DR", "text":"Dr."},
			{"key":"", "text":""}
			];
		for(var i in titles){
			if(titles[i].key === key)
				return titles[i].text;
		}
	},



/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf accountsearchbar.AccountIdentificationFrame
*/
	onBeforeRendering: function() {
		if(console && console.log){
			var text = " no BindingContext";
			if(this.getView().getBindingContext()){
				text = " BindingContext exists";
			}
			console.log("view displayed:" + this.getView().getId() + text);
		}
	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf accountsearchbar.AccountIdentificationFrame
*/
	onAfterRendering: function() {
	if(1 === 2){
		
	}
	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf accountsearchbar.AccountIdentificationFrame
*/
	onExit: function() {

	}

});