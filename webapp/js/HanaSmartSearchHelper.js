/***********************************************************************
//Declaration of global constants
***********************************************************************/

var MODEL_OTR 		= 'otr';
var MODEL_BF 		= 'bf';
var MODEL_CONFIG 	= 'config';
var MODEL_CUST 		= 'cust';
var MODEL_SESSION   = 'session';

var EVENT_CONFIRM = 'confirm';


var oMetadata 	= '';


/***********************************************************************
//	Return the data of the requested model name.
***********************************************************************/
function getModelData(modelName)
{
	var oModel = sap.ui.getCore().getModel(modelName);
	if(!oModel){
		return {};
	}
	return oModel.getData();
}


/***********************************************************************
//Retrieves the OTR text using the provided OTR id from the model
***********************************************************************/
function getOTRText(id)
{
	var oModel = sap.ui.getCore().getModel(MODEL_OTR);
	var mData = oModel.getData();
  	for (var i=0; i < mData.length; i++) {
  		if (mData[i].name == id) {
  			return $.trim(mData[i].value);
  		}
  	}
  	return '';
}


/***********************************************************************
//Confirm the business partner
***********************************************************************/
function triggerConfirm(oObject)
{   	
	var sId = '';
		
	switch (typeof oObject)
	{
	case 'object':
		sId = oObject.ID.replace(/^\s+|\s+$/g,'');
	  break;
	case 'string':
	case 'number':
		sId = oObject;
	  break;
	default:
	  return false;
	}
		
	triggerUpdateConfigValues( );
	
	parent.postMessage(JSON.stringify({id: EVENT_CONFIRM, bpID: sId }), getWindowURI() );
	
	return true;
}

/***********************************************************************
//Trigger the event
***********************************************************************/
function triggerEvent(event, oObject)
{   	
	var sId = '';
		
	switch (typeof oObject)
	{
	case 'object':
		sId = oObject.ID.replace(/^\s+|\s+$/g,'');
		//This is required especially for double quick view, since the selected
		//search object might be incorrect and Web UI uses the selected search object
		//to perform the action on it.
		setSelectedSearchObject(oObject.SearchObject);
	  break;
	case 'string':
	case 'number':
		sId = oObject;
	  break;
	default:
	  return false;
	}
	
	triggerUpdateConfigValues( );
	
	parent.postMessage(JSON.stringify({id: event, bpID: sId }), getWindowURI() );
	
	return true;
}


/***********************************************************************
//Confirm the business partner
***********************************************************************/
function triggerSearch(oObjectList)
{   		
	
	triggerUpdateConfigValues( );

    parent.postMessage(JSON.stringify({id: 'search' , searchString: getSearchTerm(), objList: oObjectList}), getWindowURI());
	
	return true;
}

/***********************************************************************
//Post the latest configuration values
***********************************************************************/
function triggerUpdateConfigValues()
{
	var oModel = sap.ui.getCore().getModel(MODEL_CONFIG);
	var mData = oModel.getData(); 	
	
	//The replace changes all the JSON integer values to strings since the CRM UI has trouble with serializing integers
	parent.postMessage(JSON.stringify({id: 'updateConfig' , config: mData}).replace (/:(\d+)([,\}])/g, ':"$1"$2'), getWindowURI());
	
	parent.postMessage(JSON.stringify({id: 'updateText' , searchString: getSearchTerm()}), getWindowURI());
	
}

/***********************************************************************
//Get the current window URI
***********************************************************************/
function getWindowURI()
{   
	return "https://ldciqhd.wdf.sap.corp:44350";
	//return window.location.protocol + '//' + window.location.host;
}

/***********************************************************************
//Get the state of a business function
***********************************************************************/
function getBFState(id)
{
	var oModel = sap.ui.getCore().getModel(MODEL_BF);
	var mData = oModel.getData();
	
	for (var i=0; i < mData.length; i++) {
		if (mData[i].name == id) {
			return $.trim(mData[i].value);
		}
	}
	
	return '';
}

/***********************************************************************
//Get the selected search object
***********************************************************************/
function getSelectedSearchObject()
{
	var oModel = sap.ui.getCore().getModel(MODEL_CONFIG);
	var mData = oModel.getData();
	
	for(var i = 0; i < mData.length; i++)
		if(mData[i].selected)
			return mData[i].searchObject;
}

/***********************************************************************
//Get the selected search object tag
***********************************************************************/
function getSelectedSearchObjectTag(searchObject)
{
	return getConfigValue('selectedTag', searchObject);	
}

/***********************************************************************
//Get the index of a search object
***********************************************************************/
function getSearchObjectIndex(searchObject)
{
	var oModel = sap.ui.getCore().getModel(MODEL_CONFIG);
	var mData = oModel.getData();
	
	for(var i = 0; i < mData.length; i++)
		if(mData[i].searchObject == searchObject)
			return i;
	
	return -1;
}

/***********************************************************************
//Get the selected search object index
***********************************************************************/
function getSelectedSearchObjectIndex()
{
	var oModel 	= sap.ui.getCore().getModel(MODEL_CONFIG);
	var mData 	= oModel.getData();
	
	for(var i = 0; i < mData.length; i++)
		if(mData[i].selected)
			return i;
	return -1;
}

/***********************************************************************
//Set the selected search object
***********************************************************************/
function setSelectedSearchObject(searchObject)
{
	var oModel  = sap.ui.getCore().getModel(MODEL_CONFIG);
	var mData	 = oModel.getData();
	
	for(var i = 0; i < mData.length; i++){
		if(mData[i].searchObject == searchObject)
			mData[i].selected = 'X';
		else
			mData[i].selected = '';			
	}
}

function setSelectedSearchObjectTag(searchObject, tag)
{
	var oModel  = sap.ui.getCore().getModel(MODEL_CONFIG);
	var mData	= oModel.getData();
	
	for(var i = 0; i < mData.length; i++){
		if(mData[i].searchObject == searchObject)
			mData[i].selectedTag = tag;			
	}
}

/***********************************************************************
//Get the search term
***********************************************************************/
function getSearchTerm(searchObject){
	
	 return getConfigValue('searchTerm', searchObject);
}

/***********************************************************************
//Set the search term
***********************************************************************/
function setSearchTerm(value, searchObject){
	
	setConfigValue('searchTerm', value, searchObject);
}

/***********************************************************************
//Get the selected index value of the search object
***********************************************************************/
function getSearchObjectSelectedIndex(searchObject){
	
	 return getConfigValue('selectedIndex', searchObject);
}

/***********************************************************************
//Set the selected index value of the search object
***********************************************************************/
function setSearchObjectSelectedIndex(value, searchObject){
	
	setConfigValue('selectedIndex', value, searchObject);
}

/***********************************************************************
//Get the enabled value of the search object
***********************************************************************/
function getSearchObjectEnabled(searchObject){
	
	return getConfigValue('enabled', searchObject);
}

/***********************************************************************
//Get the confirmed value of the search object
***********************************************************************/
function getSearchObjectConfirmed(searchObject){
	
	return getConfigValue('confirmed', searchObject);
}

/***********************************************************************
//Get the list of quick view buttons of the search object
***********************************************************************/
function getSearchObjectQVButtons(searchObject)
{
	return getConfigValue('qvButtons', searchObject)
}

/***********************************************************************
//Get the selected index value of the search object
***********************************************************************/
function getSearchObjectQVSelectedPage(searchObject){
	
	 return getConfigValue('qvSelectedPage', searchObject);
}

/***********************************************************************
//Set the quick view selected page value of the search object
***********************************************************************/
function setSearchObjectQVSelectedPage(value, searchObject){
	
	setConfigValue('qvSelectedPage', value, searchObject);
}

/***********************************************************************
//Copy the desired configuration values from a source search object
//to all the other search objects when selecting a new search object
***********************************************************************/
function copyDesiredConfigurationValues(sSourceObjectName){
	
	var oModel  = sap.ui.getCore().getModel(MODEL_CONFIG);
	var mData	 = oModel.getData();
	
	var index = getSearchObjectIndex(sSourceObjectName);
	
	for(var i = 0 ; i < mData.length; i++)
	{
		if(i == index)
			continue;

		//Do not copy the values:
		// - if the newly selected search object is confirmed
		// - if the source search object is confirmed
		if(!Boolean(mData[i].confirmed) && !Boolean(mData[index].confirmed)){
			//Copy the following values to other search objects		
			mData[i].searchTerm 	= mData[index].searchTerm;
		}
		//mData[i].searchWidth 	= mData[index].searchWidth;
		
	}
	
}

/***********************************************************************
//Returns the service metadata
***********************************************************************/
function getMetadata()
{
	if(oMetadata)
		return oMetadata;
	
	var oData = new sap.ui.model.odata.ODataModel(getWindowURI() + getUriPath()+"?sap-client=340", true );
	
	oData.setHeaders({'Accept-Language' : sap.ui.getCore().getConfiguration().getLanguage()});
	oData.bCache = false;
	
	oMetadata =  oData.getServiceMetadata();
	
	return oMetadata;
}

/***********************************************************************
//Returns the entity type
***********************************************************************/
function getEntityType(sEntityTypeSet)
{
	var metadata = getMetadata();
	
	//Get all the entity type sets
	var aEntityTypeSets = metadata.dataServices.schema[0].entityContainer[0].entitySet;				
	
	//Loop through the array to return the desired entity type
	for(var i = 0; i < aEntityTypeSets.length; i++){
		if (aEntityTypeSets[i].name.toUpperCase() == sEntityTypeSet.toUpperCase())
			return aEntityTypeSets[i].entityType.split('.').pop();
	}
	
}

/***********************************************************************
//Returns the entity type data
***********************************************************************/
function getEntityTypeData(sEntityType){
	
	var metadata = getMetadata();
	
	//Get all the entity types
	var aEntityTypes = metadata.dataServices.schema[0].entityType;				
	
	//Loop through the array to return the desired entity type
	for(var i = 0; i < aEntityTypes.length; i++){
		if (aEntityTypes[i].name.toUpperCase() == sEntityType.toUpperCase())
			return aEntityTypes[i];
	}
}

/***********************************************************************
//Returns the labels for the entity type
***********************************************************************/
function getEntityTypeLabels(sEntityType){		
	
	var oLabels 		= {};
	var aExtensions 	= [];
	var aEntityType		= getEntityTypeData(sEntityType);
	
	//Get all the entity type properties
	var aProperties = aEntityType.property;
	
	//Loop through the array to retrieve all the labels
	for(var i = 0; i < aProperties.length; i++){			 			 			
		aExtensions = aProperties[i].extensions;
		for(var j = 0; j < aExtensions.length; j++){				 				 				
			if(aExtensions[j].name == 'label'){				
				oLabels[aProperties[i].name] = aExtensions[j].value;
				break;
			}
		}
	}
	
	//Return an array where the key is the oData field name and the
	//value is the label that should be displayed
	return oLabels;
}

/***********************************************************************
//Returns the key field names for the entity type
***********************************************************************/
function getEntityTypeKeyFieldNames(sEntityType){	
	
	var aKeyFieldNames	= [];
	var aEntityType		= getEntityTypeData(sEntityType);
	
	//Get the key data for the entity type
	var aKeys = aEntityType.key.propertyRef;
	
	//Loop through the array to retrieve only the name
	for(var i = 0; i < aKeys.length; i++){			 			 			
		aKeyFieldNames.push(aKeys[i].name);
	}

	return aKeyFieldNames;
}


/***********************************************************************
//Retrieves the configuration value of the provided search object or the
//use the default one
***********************************************************************/
function getConfigValue(property, searchObject)
{
	var configData = getModelData(MODEL_CONFIG);
	var iIndex	= -1;
	var sValue = '';
	
	//Get the index of the desired search object
	if(searchObject == undefined)
		iIndex = getSelectedSearchObjectIndex();
	else
		iIndex = getSearchObjectIndex(searchObject);
	
	//Retrieve the desired property of the desired search object
	if(iIndex >= 0)
		sValue = configData[iIndex][property];
		
	return sValue;
}

/***********************************************************************
//Sets the configuration value of the provided search object or the
//use the default one with the provided value
***********************************************************************/
function setConfigValue(property, value, searchObject)
{
	var configData = getModelData(MODEL_CONFIG);
	var iIndex	= -1;
	
	//Get the index of the desired search object
	if(searchObject == undefined)
		iIndex = getSelectedSearchObjectIndex();
	else
		iIndex = getSearchObjectIndex(searchObject);
	
	//Retrieve the desired property of the desired search object
	if(iIndex >= 0){
		configData[iIndex][property] = value;
		return true;
	}
	else
		return false;
}