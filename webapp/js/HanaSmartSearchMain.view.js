jQuery.sap.require("sap.ui.commons.Splitter");
sap.ui.jsview("js.HanaSmartSearchMain", {

	/** Specifies the Controller belonging to this View.
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf js.HanaSmartSearchMain
	*/
	getControllerName : function() {
		return "js.HanaSmartSearchMain";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed.
	* Since the Controller is given to this method, its event handlers can be attached right away.
	* @memberOf js.HanaSmartSearchMain
	*/
	createContent : function(oController) {
	
		var oView 	= oController.getView(); 		
		
		oView.setModel(sap.ui.getCore().getModel(MODEL_CONFIG), MODEL_CONFIG);
		oView.bindElement(MODEL_CONFIG+">/"+getSelectedSearchObjectIndex());
		
		oView.setModel(sap.ui.getCore().getModel(MODEL_CUST), MODEL_CUST);
		oView.bindElement(MODEL_CUST+">/"+getSelectedSearchObjectIndex());
		
		
		/*******************************************
		 * Create the Splitter
		 *******************************************/
		
		var oSplitter = new sap.ui.commons.Splitter("mainSplitter", {width: "100%", /*height: "355px", showScrollBars: true*/});		
		oSplitter.setSplitterOrientation(sap.ui.commons.Orientation.vertical);
		
		//Verify whether the SP04 switch is on
		if(getBFState('CRM_UT_HANA_SCH_2') || getBFState('CRM_UT_HANA_SCH_3')){			
			//Display the quick view
			oSplitter.bindProperty('splitterPosition', MODEL_CONFIG+">searchWidth");
			oSplitter.bindProperty('splitterBarVisible', MODEL_CUST+">uiQuickviewEnable", function(value){return Boolean(value);});
		}
		else{
			//Do not provide the quick view
			oSplitter.setSplitterPosition("100%");
			oSplitter.setSplitterBarVisible(false);
		}
		
		oSplitter.setMinSizeSecondPane("0%"); 		
		
		/*******************************************
		 * Create the Search View
		 *******************************************/
		
		var searchView = sap.ui.view({id:"idHanaSmartSearch", viewName:"js.HanaSmartSearch", type:sap.ui.core.mvc.ViewType.JS});
		
		//Attach listener for the event when a row is selected/deselected in the suggestion list of the search view		
		searchView.attachEvent('objectSelected', oController.objectSelectedHandler);
		searchView.attachEvent('nothingSelected', oController.objectSelectedHandler);
		
		//Attach listener for the search object type changed
		searchView.attachEvent('searchObjectChanged', oController.searchObjectChangedHandler, oController);
		
		
		oSplitter.addFirstPaneContent(searchView);	
		
		/*******************************************
		 * Create the Quick Views
		 *******************************************/
		var quickView	= undefined;
		
		var searchObjectsArray = getSearchObjects();
		
		//Check whether all the search objects are confirmed
		var allConfirmed	= true;		
		for(var searchObjectIndex = 0; searchObjectIndex < searchObjectsArray.length; searchObjectIndex++ ){	
			if(!Boolean(getSearchObjectConfirmed(searchObjectsArray[searchObjectIndex])))
					allConfirmed = false;
		}		
		
		for(var searchObjectIndex = 0; searchObjectIndex < searchObjectsArray.length; searchObjectIndex++ ){							
			quickView = sap.ui.view({
				id:			"idHanaSmartSearchQuickView" + searchObjectsArray[searchObjectIndex],
				viewName:	"js.HanaSmartSearchQuickView",
				type:		sap.ui.core.mvc.ViewType.JS,
				height:		'100%',
				viewData:	{ searchObject : searchObjectsArray[searchObjectIndex]}
			});

			//All search objects are confirmed so display them in the splitter.
			//No support for more than two search objects for now.
			if(allConfirmed){
				if(searchObjectIndex == 0){
					oSplitter.removeAllFirstPaneContent();
					oSplitter.addFirstPaneContent(quickView);
				}
				else if(searchObjectIndex == 1){
					oSplitter.removeAllSecondPaneContent();
					oSplitter.addSecondPaneContent(quickView);
				}					
			}
			//Add the quick view for the currently selected search object to the second splitter pane
			else if(getSelectedSearchObjectIndex() == searchObjectIndex)
				oSplitter.addSecondPaneContent(quickView);					
		}
		
		//If the double quick view is displayed because both search objects are confirmed,
		//then it's required to update the config values because the onblur event that usually
		//updates the config values might not be called if the focus never enters the free text search frame
		if(allConfirmed)
			triggerUpdateConfigValues();
		
		return oSplitter;
		
	},
	
	searchObjectChanged: function(){
		
		var oSplitter = this.getContent()[0];
		
		//Remove the current quick view from the second pane
		oSplitter.removeAllSecondPaneContent();
		//This line is required to remove content from the splitter pane from the DOM quickly
		//to ensure the animation of the carousel doesn't lag when the splitter size is changed.
		oSplitter.secondPane.removeChild(oSplitter.secondPane.childNodes[0]);
		
		//Change the bound object in the model to the currently selected search object
		this.bindElement(MODEL_CONFIG+">/"+getSelectedSearchObjectIndex());
		this.bindElement(MODEL_CUST+">/"+getSelectedSearchObjectIndex());
		
		//Add the newly selected search object quick view
		oSplitter.addSecondPaneContent(sap.ui.getCore().byId('idHanaSmartSearchQuickView' + getSelectedSearchObject()));		
		
	}
	
	
});
