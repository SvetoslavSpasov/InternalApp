sap.ui.controller("js.HanaSmartSearchMain", {

	udpateTimer:	0,	//Counter timer used to update the quick view
	
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf js.HanaSmartSearchMain
*/
	onInit: function() {		
		//Need to save current state when navigating away or change search to standard
		//Use the lose focus event to update the values of the CONFIG model.
		$(window).on('blur', function() {
			triggerUpdateConfigValues();
		});
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf js.HanaSmartSearchMain
*/
	onBeforeRendering: function() {
	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf js.HanaSmartSearchMain
*/
//	onAfterRendering: function() {
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf js.HanaSmartSearchMain
*/
//	onExit: function() {	
//	},


	objectSelectedHandler: function(oEvent)
	{
		var quickView 		= sap.ui.getCore().byId('idHanaSmartSearchQuickView' + getSelectedSearchObject());
		
		//Reset the timer that counts the time between quick view updates
		clearTimeout(this.udpateTimer);
		
		//Quick view is disabled
		if(getQuickViewEnabled() == false)
			quickView.updateQuickView(undefined);
		//A new object was selected from the suggestion list
		else if(oEvent.sId == 'objectSelected'){			
			//This line ensures to make a copy of the object and not only a reference to copy			
			var data = JSON.parse(JSON.stringify(oEvent.mParameters)); //This is required since the event object gets cleared and the data is lost
			//Use timer to Ensure smooth suggestion list selection when using keys and lowers the amount unnecessary quick view updates
			this.udpateTimer = setTimeout(function (){quickView.updateQuickView(data);}, '200'); 			
		}			
		//Selection was cleared
		else if(oEvent.sId == 'nothingSelected'){
			var confirmedSearchObject = quickView.getController().getConfirmedSearchObject();
			quickView.updateQuickView(confirmedSearchObject);
		}
			
	},
	
	searchObjectChangedHandler: function(oEvent)
	{
		var oController 		= this;
		var oSearchMainView 	= oController.getView();
		var quickView			= sap.ui.getCore().byId('idHanaSmartSearchQuickView' + getSelectedSearchObject());								
		
		//Perform the desired changes in the Search Main View when a new search object is selected
		oSearchMainView.searchObjectChanged();	
		
		//Perform the desired changes in the Quick View when a new search object is selected
		quickView.oController.searchObjectChanged();						

	},
		
});