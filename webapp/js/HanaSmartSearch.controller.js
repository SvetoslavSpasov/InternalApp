sap.ui.controller("js.HanaSmartSearch", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf js.HanaSmartSearch
*/
	onInit: function() {				
		
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf js.HanaSmartSearch
*/
	onBeforeRendering: function() {

	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf js.HanaSmartSearch
*/
	onAfterRendering: function() {
			
		//This piece of code ensures to set the focus back in the search field
		//and to place the cursor at the end of the input text field.  		
		var oModel 		= sap.ui.getCore().getModel(MODEL_CONFIG);
    	var mData 		= oModel.getData();
    	var searchTerm	= mData[getSelectedSearchObjectIndex()].searchTerm;    	    	     	    	
    	
    	if(getModelData(MODEL_SESSION).setFocus)
    	{
	    	$("#smartSearch")[0].focus();
			//For Chrome
	    	$("#smartSearch")[0].value = '';
			$("#smartSearch")[0].value = searchTerm;
			
			//For IE
			this.setCaretPosition('smartSearch', searchTerm.length);
    	}
	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf js.HanaSmartSearch
*/
	onExit: function() {

	},
	
	fireSelectedEvent : function(oEvent) {
		
		var oObject 	= undefined;
		var index 		= oEvent.oSource.getSelectedIndex();
		//var oObjectList = oEvent.oSource.getModel().oData.modelData;
		
		if(index >= 0)
			oObject = oEvent.oSource.getModel().oData.modelData[index];				
		
		if(oObject != undefined)
			this.getView().fireEvent('objectSelected', oObject);
		else
			this.getView().fireEvent('nothingSelected');
	},
	
	fireSearchObjectChangeEvent: function(oEvent) {		
		this.getView().fireEvent('searchObjectChanged');
	},
	
	
	setCaretPosition: function (elemId, caretPos) {
		var elem = document.getElementById(elemId);

	    if(elem != null) {
	        if(elem.createTextRange) {
	            var range = elem.createTextRange();
	            range.move('character', caretPos);
	            range.select();
	        }
	        else {
	            if(elem.selectionStart) {
	                elem.focus();
	                elem.setSelectionRange(caretPos, caretPos);
	            }
	            else
	                elem.focus();
	        }
	    }
	},
	
	
	//Prepare the array of results into the desired format of the suggestion list
	prepareSearchResult: function(aResults, searchObject, tag){
  		
		var oSuggestResult = [];
						
		var entitySet		= getSuggestionListExtName(searchObject);
		var entityType		= getEntityType(entitySet);
		var keyFieldList	= getEntityTypeKeyFieldNames(entityType);
		
		var columnList 		= getSearchObjectColumnListByTag(searchObject, tag);
		
		for(var i = 0 ; i < aResults.length ; i++)
  		{		                		            	  			
			oRow 				= new Object();
			
  			oRow.Src		 	= getSuggestionListIconUri(searchObject);
  			
  			//Create and populate the key fields for the suggestion list
  			for(var keyFieldIndex = 0; keyFieldIndex < keyFieldList.length; keyFieldIndex++){
  				oRow[keyFieldList[keyFieldIndex]] = aResults[i][keyFieldList[keyFieldIndex]].replace(/<b>/g,"<strong>").replace(/<\/b>/g,"</strong>").toUpperCase().trim();
  			}
  			
  			//Create and populate the requested number of columns for the suggestion list
  			for(var columnIndex = 0; columnIndex < columnList.length; columnIndex++ ){
  				oRow[columnList[columnIndex].odSlColFname] = aResults[i][columnList[columnIndex].odSlColFname].replace(/<b>/g,"<strong>").replace(/<\/b>/g,"</strong>").toUpperCase().trim();  				
  			}  			
  			
  			oSuggestResult.push(oRow);	
  		}
		return oSuggestResult;
	},
	
	
	//Get the query URL depending on the selected object type
	getSearchURL: function(searchObject, tag){
		
		var maxhit 				= 101;	//Set default to 100
		var searchObjectExtName	= getSuggestionListExtName(searchObject);
		var searchObjectId		= getSearchObjectId(searchObject);
		
		return '/' + searchObjectExtName + '?$format=json&$top=' + maxhit + '&$filter=Tag eq \''+ tag + '\' and SearchObject eq \'' + searchObjectId + '\' and SearchInformation eq ';
	},
	
	//Get the suggestion list URL depending on the selected object type
	getSuggestionURL: function(searchObject, tag){
		
		var maxhit 				= getSuggestionListMaxHits(searchObject) + 1;	//Get one more than max hits to know if more results exist
		var searchObjectExtName	= getSuggestionListExtName(searchObject);
		var searchObjectId		= getSearchObjectId(searchObject);
		
		return '/' + searchObjectExtName + '?$format=json&$top=' + maxhit + '&$filter=Tag eq \''+ tag + '\' and SearchObject eq \'' + searchObjectId + '\' and SearchInformation eq ';
		
	},
	
});