sap.ui.controller("js.HanaSmartSearchQuickView", {		

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf js.HanaSmartSearchQuickView
*/
	onInit: function() {	
		
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf js.HanaSmartSearchQuickView
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf js.HanaSmartSearchQuickView
*/
//	onAfterRendering: function() {
//		
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf js.HanaSmartSearchQuickView
*/
//	onExit: function() {
//
//	}
	
	
	searchObjectChanged: function(){
		//Try to retrieve the confirmed search object
		var confirmedSearchObject = this.getConfirmedSearchObject();
		
		if(confirmedSearchObject)
			//Update the quick view with the confirmed search object
			this.getView().updateQuickView(confirmedSearchObject);
		else
			//Update the quick view without a search object will clear the quick view area
			this.getView().updateQuickView();
	},
	
	
	getQuickViewKeyFields: function(searchObject){
		
		var entitySet			= getQuickViewExtName(searchObject);
		var entityType			= getEntityType(entitySet);
		
		return getEntityTypeKeyFieldNames(entityType);
	},
	
	
	compareSearchObjects: function(searchObject1, searchObject2){
		
		var sameSearchObject 	= true;
		var keyFieldList		= this.getQuickViewKeyFields();
		
		//Remove the SetID key field from the comparison
		keyFieldList.splice(keyFieldList.indexOf('SetID'),1);
		
		for(var keyFieldIndex in keyFieldList){
			if(searchObject1[keyFieldList[keyFieldIndex]] != searchObject2[keyFieldList[keyFieldIndex]])
				return false;
		}
		
		return sameSearchObject;
	},
	
	
	getDetailsURL : function(oObject, searchObject, pageIndex){
 		
		var quickViewExtName	= getQuickViewExtName(searchObject);
		var setList				= getSearchObjectSetList(searchObject);
		var setId				= setList[pageIndex].setId;
		var keyFieldList		= this.getQuickViewKeyFields(searchObject);
		var value				= '';
		
		var url		= '/' + quickViewExtName +'(';
		
		//Remove the SetID key field since it comes from the quick view and not the search object
		keyFieldList.splice(keyFieldList.indexOf('SetID'),1);
		
		for(var keyFieldIndex in keyFieldList){
			url   = url + keyFieldList[keyFieldIndex] + '=\'' + encodeURIComponent( oObject[keyFieldList[keyFieldIndex]] ) + '\',';
		}
				
		url = url + 'SetID=\''+ setId +'\')?$format=json';
		
		return url;

	 },				

	 //Takes an array of odata fields along with their values and returns the odata fields along with their
	 //values only for the fields that belong to the current tag (set ID)
	 processData: function(data){
				
		var attributeListName	= [];
		var searchObject		= data.SearchObject;
		
		var attributeList 		= getSearchObjectSetListAttributes(searchObject, data.SetID);
		var keyFieldList		= this.getQuickViewKeyFields(searchObject);				
		
		//Get all the key field attributes
		for(var keyFieldIndex in keyFieldList){
			attributeListName.push(keyFieldList[keyFieldIndex]);
		}
		
		//Get all the attribute names for the desired setID from the customizing
		for(var index in attributeList){
			attributeListName.push(attributeList[index].odFieldName);
		}
		
		//Remove all the attributes which should not be processed for the current page
		for(var attribute in data){
			if(attributeListName.indexOf(attribute) == -1)
				delete data[attribute];
		}
		
		return data;
	},
	
	getConfirmedSearchObject : function(searchObject){
		var oObject				= undefined;	
		
		if(!searchObject)
			searchObject = getSelectedSearchObject();
		
		if(getSearchObjectConfirmed(searchObject)){
			
			var keyFieldList		= this.getQuickViewKeyFields(searchObject);	
			
			//Remove the SetID key field since it comes from the quick view and not the search object
			keyFieldList.splice(keyFieldList.indexOf('SetID'),1);
						
			oObject	= new Object();
			
			for(var keyFieldIndex in keyFieldList)
			{
				switch(keyFieldList[keyFieldIndex]){
					case 'SearchObject':
						oObject[keyFieldList[keyFieldIndex]] = searchObject;
						break;
					case 'ID':
						oObject[keyFieldList[keyFieldIndex]] = getSearchObjectConfirmed(searchObject);
						break;
					default:
						oObject[keyFieldList[keyFieldIndex]] = '';		
				}				
			}
		}
	
		return oObject;
	},
	
});