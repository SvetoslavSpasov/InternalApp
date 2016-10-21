/******************************************************************
* Search
******************************************************************/


function getUriPath(searchObject){
	
	return getCustValue('pathUri', searchObject);
}

function getSearchMinNumChars(searchObject){
	
	return getCustValue('uiSugListMinCharSrch', searchObject);
}

function getSearchWidthPercentage(searchObject){
	
	return getCustValue('uiSugListMinCharSrch', searchObject);
}


/******************************************************************
* Search Object
******************************************************************/

function getSearchObjectId(searchObject){
	
	return getCustValue('soId', searchObject);
}

function getSearchObjectExtName(searchObject){
	
	return getCustValue('soExtName', searchObject);
}

function getSearchObjectDescription(searchObject){
	
	return getCustValue('soDesc', searchObject);
}

//Returns the quick view set lists
function getSearchObjectSetList(searchObject, setListId){
	
	var setList	= getCustValue('uiQuickviewSetList', searchObject);
	
	//return only the desired set list
	if(setListId){
		for(var i = 0; i < setList.length; i++){
			if(setList[i].setId == setListId)
				return setList[i];
		}
	}
	
	//If no set list id is provided then return all of the set list collection
	setList.sort(function(set1, set2){ 		
		if(set1.uiSeqNo < set2.uiSeqNo)
			return -1;
		if(set1.uiSeqNo > set2.uiSeqNo)
			return 1;
		return 0;		
	});
	  		
	return setList;
}

//Returns the attributes list of the requested set list
function getSearchObjectSetListAttributes(searchObject, setListId){
	
	var setList			= getSearchObjectSetList(searchObject, setListId);	
	var attributeList 	= setList.attributeList;
	
	attributeList.sort(function(set1, set2){
		if(set1.uiSeqNo < set2.uiSeqNo)
			return -1;
		if(set1.uiSeqNo > set2.uiSeqNo)
			return 1;
		return 0;		
	});
	  		
	return attributeList;
}

function getSearchObjects(){
	
	var customizingData 	= getModelData(MODEL_CUST);
	var searchObjectsArray	= [];
	
	for (var i=0; i < customizingData.length; i++) {
		searchObjectsArray.push(customizingData[i].soId);
  	}
  		
	return searchObjectsArray;
}

/******************************************************************
* Narrow By Tags
******************************************************************/

function getSearcObjectTagEnabled(searchObject){
	
	return getCustValue('uiUseTags', searchObject);
}

//Returns the narrow by tag list
function getSearchObjectTagList(searchObject, tag){
	
	var tagList			= getCustValue('uiTagList', searchObject);
	
	//return only the desired set list
	for(var i = 0; i < tagList.length; i++){
		if(tagList[i].tag == tag)
			return tagList[i];
	}
	
	if(!tagList)
		return;
	
	//If no set list id is provided then return all of the set list collection
	tagList.sort(function(set1, set2){ 		
		if(set1.seqNo < set2.seqNo)
			return -1;
		if(set1.seqNo > set2.seqNo)
			return 1;
		return 0;		
	});
	
	return tagList;
}

//Returns the narrow by tag list
function getSearchObjectTagListIDs(searchObject, tag){
	
	var tagList			= getCustValue('uiTagList', searchObject);
	var tagListArray	= [];
	
	//return only the desired set list
	for(var i = 0; i < tagList.length; i++){
		if(tagList[i].tag == tag)
			return tagList[i];
	}
	
	if(!tagList)
		return;
	
	//If no set list id is provided then return all of the set list collection
	tagList.sort(function(set1, set2){ 		
		if(set1.seqNo < set2.seqNo)
			return -1;
		if(set1.seqNo > set2.seqNo)
			return 1;
		return 0;		
	});
	
	//Store only the tags in an array
	for (var i=0; i < tagList.length; i++) {
		tagListArray.push(tagList[i].tag);
  	}
	
	return tagListArray;
}

/******************************************************************
* Suggestion List
******************************************************************/

function getSuggestionListMaxHits(searchObject){
	
	return getCustValue('uiSugListMaxItems', searchObject);
}

function getSuggestionListExtName(searchObject){
	
	return getCustValue('sugListExtName', searchObject);
}

function getSuggestionListIconUri(searchObject){
	
	return getCustValue('uiSugListIcon', searchObject);
}

function getSuggestionListTimeBeforeSearch(searchObject){
	
	return getCustValue('uiSugListTBeforeSrch', searchObject);
}


//Returns the column list data for the requested search object and narrow by tag
function getSearchObjectColumnListByTag(searchObject, tag){
	
	var columnLists			= getCustValue('uiSugListColListByTag', searchObject);
	var columnListForTag	= "";
	
	//return only the desired set list
	for(var i = 0; i < columnLists.length; i++){
		if(columnLists[i].tag == tag){
			columnListForTag = columnLists[i];
			break;
		}
	}
	
	//return nothing if no column list is found for the requested tag
	if(!columnListForTag)
		return;
	
	columnListForTag.columnList.sort(function(set1, set2){ 		
		if(set1.uiSeqNo < set2.uiSeqNo)
			return -1;
		if(set1.uiSeqNo > set2.uiSeqNo)
			return 1;
		return 0;		
	});
	  		
	return columnListForTag.columnList;
}


/******************************************************************
* Quick View
******************************************************************/


function getQuickViewExtName(searchObject){
	
	return getCustValue('quickviewExtName', searchObject);
}

function getQuickViewIconUri(searchObject){
	
	return getCustValue('uiQuickviewIcon', searchObject);
}

function getQuickViewEnabled(searchObject){
	
	return getCustValue('uiQuickviewEnable', searchObject);
}



/***********************************************************************
//Retrieves the customizing of the provided search object or the
//use the default one
***********************************************************************/
function getCustValue(property, searchObject)
{
	var customizingData = getModelData(MODEL_CUST);
	var iIndex	= -1;
	var sValue = '';
	
	//Get the index of the desired search object
	if(searchObject == undefined)
		iIndex = getSelectedSearchObjectIndex();
	else
		iIndex = getSearchObjectIndex(searchObject);
	
	//Retrieve the desired property of the desired search object
	if(iIndex >= 0)
		sValue = customizingData[iIndex][property];
		
	return sValue;
}