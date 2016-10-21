
sap.ui.jsview("js.HanaSmartSearch", {

	/** Specifies the Controller belonging to this View.
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf js.HanaSmartSearch
	*/
	getControllerName : function() {
		return "js.HanaSmartSearch";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed.
	* Since the Controller is given to this method, its event handlers can be attached right away.
	* @memberOf js.HanaSmartSearch
	*/
	createContent : function(oController) {		
		
		var oLayout = sap.ui.commons.layout;			
		var oView 	= oController.getView(); 		
		
		oView.setModel(sap.ui.getCore().getModel(MODEL_CONFIG), MODEL_CONFIG);
		oView.bindElement(MODEL_CONFIG+">/"+getSelectedSearchObjectIndex());
		
		oView.setModel(sap.ui.getCore().getModel(MODEL_CUST), MODEL_CUST);
		oView.bindElement(MODEL_CUST+">/"+getSelectedSearchObjectIndex());
	
		
//***********************************************************************************************************************************
//      SEARCH OBJECT TYPE CONTROL
//***********************************************************************************************************************************		
		
		var previousType			= "";
		
		var oSegmentedButtonIcon = new sap.ui.commons.SegmentedButton('searchType');
		
		var configData = getModelData(MODEL_CONFIG);
		//Add the required search object buttons
		for(var index in configData){
			var searchObject = configData[index].searchObject;	
			var searchObjButton = new sap.ui.commons.Button({id: searchObject ,
				icon: getSuggestionListIconUri(searchObject),
				enabled: Boolean(configData[index].enabled),
				text: getSearchObjectDescription(searchObject)});  			
			oSegmentedButtonIcon.addButton(searchObjButton);
		}
				
		//Set the currently selected search object
		oSegmentedButtonIcon.setSelectedButton(getSelectedSearchObject());
		
		oSegmentedButtonIcon.attachSelect(function(oEvent) {

			//Set the focus to the search input field
			oSmartSearch.focus();
			
			//This update is required to hide the suggestion list when changing search object
			updateSuggestionList([], "");
			
			//Copy certain configuration values from previous search object to others
			copyDesiredConfigurationValues(getSelectedSearchObject());
			
			setSelectedSearchObject(oEvent.getParameters().selectedButtonId);
			
			//Set the model to the currently selected search object
			oController.getView().bindElement(MODEL_CONFIG+">/"+getSelectedSearchObjectIndex());
			oController.getView().bindElement(MODEL_CUST+">/"+getSelectedSearchObjectIndex());
			
			//Display the suggestion list for current search term for new search type
			oSmartSearch.fireLiveChange({liveValue:getSearchTerm()});
			
		});
		
		//Call method which will propagate the row selected event
		oSegmentedButtonIcon.attachEvent('select',oController.fireSearchObjectChangeEvent, oController);
		

//***********************************************************************************************************************************
//      SEARCH NARROW BY TAG CONTROL
//***********************************************************************************************************************************		
		
		var previousTag				= "";
		
		var oTagDropDownList = new sap.ui.commons.DropdownBox('tagDropDownList', {
			maxPopupItems:	12,
			change: function(oEvent){
				
				var oSmartSearch = sap.ui.getCore().byId('smartSearch');
				
				//Clear the search buffer
				clearSearchBuffer();				
				
				//Set the focus in the search input field
				oSmartSearch.focus();	
				
				//Display the suggestion list for current search term for new search tag
				 oSmartSearch.fireLiveChange({liveValue:getSearchTerm()});				
			}			
		});			

		//Verify whether the Narrow by should be enabled
		oTagDropDownList.bindProperty('enabled', MODEL_CONFIG+">confirmed", function(value){return !Boolean(value);});
		
		//Verify if the tag drop down list should be visible
		oTagDropDownList.bindProperty("visible",  MODEL_CUST+">uiUseTags", function(value){return (value)? true : false;});

		//Set the selected tag to the previously selected one
		oTagDropDownList.bindProperty('selectedKey', MODEL_CONFIG+">selectedTag");
		
		//Bind the values of the tag list with the appropriate customizing model attribute list
		var oTagItemTemplate = new sap.ui.core.ListItem();
		oTagItemTemplate.bindProperty("key", MODEL_CUST+">tag");
		oTagItemTemplate.bindProperty("text", MODEL_CUST+">description");		
		oTagDropDownList.bindItems(MODEL_CUST+">uiTagList", oTagItemTemplate);
		
		//Initialize the CONFIG model
		var searchObjects	= getSearchObjects();
		for(var index in searchObjects){
			//Set the initial value for the selected search object narrow by tag to the first one if no value was assigned yet
			if(!getSelectedSearchObjectTag(searchObjects[index]))
				setSelectedSearchObjectTag(searchObjects[index], getSearchObjectTagListIDs(searchObjects[index])[0]);
		}
		
		oTagDropDownList.attachBrowserEvent('keydown', function(oEvent){
			
			var keyEnter	= '13';			
			var keyCode = oEvent.keyCode || oEvent.which;			
			
        	switch (keyCode.toString())
			{
				case keyEnter:					
					//Clear the suggestion list selection
					oSuggestTable.clearSelection();
					break;
				default:
					return;
					break;
			}
			return;
		});
			
		

//***********************************************************************************************************************************
//      SEARCH CONTROL
//***********************************************************************************************************************************
		
		var bufferSize 				=	10;  			//The amount of previous searches stored along with the suggestion results
		
		var previousValue 			= 	"";		
		var sValue					=	"";
		var typingTimer				=	0;
		
		//create a simple Input field
		var oSmartSearch = new sap.ui.commons.TextField({
		        id: 'smartSearch',
		        width : '100%',
				liveChange : function(oEvent) {
					sValue = oEvent.getParameter("liveValue");
	
					//Set the searchTerm to the live value
					setSearchTerm(sValue);
					
					//reset the timer that counts the time between two inputs
					clearTimeout(typingTimer);
					
					//Trigger the desired method once the timer as reached the specified time interval
					typingTimer = setTimeout(function (){doneTyping(sValue);}, getSuggestionListTimeBeforeSearch());					
				}
		});

		oSmartSearch.bindProperty('enabled', MODEL_CONFIG+">confirmed", function(value){return !Boolean(value);});
		oSmartSearch.bindProperty('value', MODEL_CONFIG+">searchTerm" )
		
		//This code ensures that when the browser onBlur event is triggered that as a consequence the
		// change event is called. Required since 1.20 since UI5 behavior was modified. The onBlur
		// event of the window is used to store updated model values.
		oSmartSearch.attachBrowserEvent("blur", oSmartSearch.onsapfocusleave);
		oSmartSearch.onsapfocusleave = function(){ oSmartSearch.fireChange(); };
		
		oSmartSearch.attachBrowserEvent('keydown', keyDownHandler);
		
		// Fire live change if there is a initial search term
		if(getSearchTerm())
			oSmartSearch.fireLiveChange({liveValue:getSearchTerm()}); 				
		
		// create the Search Button with an icon and a text
		var oSearch = new sap.ui.commons.Button({
			text : getOTRText('SEARCH'),
			tooltip: getOTRText('SEARCH'),
			icon : "./mimes/search_16.png",
			press : function() {searchBP(sValue);},
			width: "100%"
		});				

		oSearch.bindProperty('enabled', MODEL_CONFIG+">confirmed", function(value){return !Boolean(value);});
		
		function doneTyping(sValue)
		{
			
		    var oSuggestResult 	= [];	
		    var searchType 		= getSelectedSearchObject();
		    var searchTag 		= getSelectedSearchObjectTag();		
		
		    //Nothing was changed
		    if((previousTag == searchTag) && (previousType == searchType) && (previousValue == sValue || (previousValue && previousValue.trim() == sValue.trim())))
		  	  return;	

		    //Reset the selected index in the following situations.
		    //The search term must have changed and must have a previous value which is different then blank.
		    //In addition the newly selected or previously selected search object must not be confirmed.
		    if( previousValue != sValue &&
		        previousValue &&
		        !Boolean(getSearchObjectConfirmed(searchType)) &&
		        !Boolean(getSearchObjectConfirmed(previousType))){		        	
		    	var searchObjects = getSearchObjects();
		    	//Loop through all the possible search objects
		    	for(var index in searchObjects){
		    		//Only reset the non confirmed search object selected indices
		    		if(!Boolean(getSearchObjectConfirmed(searchObjects[index])))
		    			setSearchObjectSelectedIndex('-1', searchObjects[index]);
		    	}
		    }
		    //The search narrow by tag must have changed and the search object is still the same
		    else if (previousTag != searchTag && previousType == searchType)
		    	setSearchObjectSelectedIndex(-1);
		    	
		    	
		    //Check if minimum amount of characters were entered before triggering the search
		    if(sValue.length < getSearchMinNumChars())
		    {
		    	//Clear the suggestion list with empty array since
		    	//there's not enough characters to provide a suggestion
		    	updateSuggestionList(oSuggestResult, sValue);
		    }
		    else
		    {
		    	//Verify if the desired search term and suggestions are already present in the buffer
		    	if(!populateFromBuffer(sValue)){		    		
		        	
		        	//Prepare the query URL with the search value from the input field
		        	var sUrl = oController.getSuggestionURL(searchType, searchTag);
		        	var escapeValue = encodeURIComponent(sValue.replace(/'/g, "''"));		    				    		
		        	sUrl = sUrl + "'" + escapeValue + "'";		    		
		        	
		    		//Create the oData model
		    		var oDataModel 	= new sap.ui.model.odata.ODataModel(getWindowURI() + getUriPath()+"?sap-client=340", true);
		    		
		    		//Trigger the search asynchronously and handle the result with call back method		        	
		    		oDataModel.read(sUrl, null, null, true, function(oData,response){		        	
		        		//This check verifies whether the returned value is the current character string
		        		//Ensures the displayed suggestion list is for the proper term since results can return in mixed order
		        		if(sValue.trim() == oSmartSearch.getLiveValue().trim())
		        			updateSuggestionList(oController.prepareSearchResult(oData.results, searchType, searchTag), sValue); 	//Update the suggestion list with new results		        			        	
		        	});
		    	}
		    }
		
		    //Store the previous search term entered
		    previousValue = sValue;
		    //Store the previous search type selected
		    previousType  = searchType;
		    //Store the previous search tag selected
		    previousTag  = searchTag;
		}		
				
		
		
//***********************************************************************************************************************************
//      SUGGESTION LIST CONTROL
//***********************************************************************************************************************************
		
		var oSuggestionBuffer 	= []; 		
		
		var searchObjectList	= getSearchObjects();		
		
		//Create all the suggestion lists for each search object and for every narrow by tag
		for(var searchObectIndex in searchObjectList){				
			var searchObjectTagList = getSearchObjectTagListIDs(searchObjectList[searchObectIndex]);
			
			for(var tagIndex = 0; tagIndex < searchObjectTagList.length; tagIndex++){
							
				//Concatenate the name + search Object + tag for the id
				var oSuggestTable = new sap.ui.table.Table('suggestTable' + searchObjectList[searchObectIndex] + searchObjectTagList[tagIndex],{
		         	visibleRowCount: 0,
		         	selectionMode: sap.ui.table.SelectionMode.Single,
		         	selectionBehavior: sap.ui.table.SelectionBehavior.RowOnly,
		         	columnHeaderVisible: false,
		         	visible: true,
		         	width:'100%',
		         	layoutFixed : false
		 		});
		 		
		 		oSuggestTable.addStyleClass('suggestionListTable');			 	

				//Verify whether the Narrow by should be enabled
		 		oSuggestTable.bindProperty('visible', MODEL_CONFIG+">confirmed", function(value){return !Boolean(value);});		 		
		 		
		 		//Register the method which will handle the row selected event
		 		oSuggestTable.attachEvent('rowSelectionChange',oController.fireSelectedEvent, oController);
 		
		 		oSuggestTable.attachBrowserEvent('keydown', keyDownHandler);		 				 		
		 	
		        //Define the columns and the 	control templates to be used
		        var colImg = new sap.ui.commons.Image();
		        var oCustom = new sap.ui.core.CustomData();
		
		        oCustom.setKey("objectKey");
		        oCustom.bindProperty("value", "ID");
		        //The browser event is used instead of the ui5 event to use the stopPropagation method.
		        //This prevents the rowSelectionChange event to be triggered for the suggestion list.
		        colImg.attachBrowserEvent('click',function(e){
		        	e.stopPropagation();
		        	triggerConfirm(this.data('objectKey'));
		        }, colImg);
		        colImg.addCustomData(oCustom);
		        colImg.setDecorative(false);
		        colImg.setTooltip(getOTRText('CLICK_CONFIRM'));
		        colImg.setAlt(getOTRText('CLICK_CONFIRM'));
		        colImg.addStyleClass("action");
		
		
		        colImg.bindProperty("src", "Src", function(value){
		        	return (value) ? value : "./mimes/accept_16.png";        		
		        });	 		
		 		
		 		
		 		oSuggestTable.addColumn(new sap.ui.table.Column({
	         	template: colImg,
	         	hAlign: oLayout.HAlign.Center,
	         	width: "5%"        		
		        }));
		 		
		        var colText;
		        var oCallout;
		        var columnList = getSearchObjectColumnListByTag( searchObjectList[searchObectIndex], searchObjectTagList[tagIndex]);
		
		        for(var columnIndex = 0; columnList && columnIndex < columnList.length; columnIndex++){
		        	
		        	colText 	 = new sap.ui.commons.FormattedTextView();
		            oCallout 	 = new sap.ui.commons.Callout();
		
		            colText.bindProperty('htmlText', columnList[columnIndex].odSlColFname);
		            colText.addStyleClass('addEllipsis');
		            oSuggestTable.addColumn(new sap.ui.table.Column({
		         	template: colText,
		            	width: columnList[columnIndex].uiColWidthPercent * 100 / 95 + '%'  //Consider 5% icon column
		            }));
		            colText.setTooltip(oCallout.insertContent(colText.clone()));          	
		        }
		
		
		        //Create a model and bind the table rows to this model  		
		        var oSuggestionTableModel = new sap.ui.model.json.JSONModel();
		        oSuggestTable.setModel(oSuggestionTableModel);
		        oSuggestTable.bindRows("/modelData");
		
		        //Hide the suggestion list
		        oSuggestTable.addStyleClass('noBorder');

		        //The selected index is not bound to the table because when the switch is done between search objects,
		        //the selected index appears faster then the suggestion list for the new search object. This makes it confusing
		        //for the end user as well as the incorrect quickview appears for a fraction of a second.
		        //oSuggestTable.bindProperty('selectedIndex', MODEL_CONFIG+">selectedIndex"); //, function(value){return parseInt(value);});
		        oSuggestTable.attachRowSelectionChange(function(oEvent){		 					        	
		        	setSearchObjectSelectedIndex(this.getSelectedIndex().toString());
				})
		
			}
		}
		
		//Footer for the suggestion box
 		var oFooterMatrix = new sap.ui.commons.layout.MatrixLayout({
        	id : 'searchFooter',
        	columns : 1,
        	width : '100%'
        });

 		var oFooterText = new sap.ui.commons.FormattedTextView('footerText'); 		 		
 		
 		//Insert the More Results text to the search footer
 		oFooterMatrix.createRow( new sap.ui.commons.layout.MatrixLayoutCell({hAlign :oLayout.HAlign.Begin, content:[oFooterText]}));


 		function updateSuggestionList(oSuggestResult, sValue)
     	{
        	var oSuggestTable	 = sap.ui.getCore().byId('suggestTable' + getSelectedSearchObject() + getSelectedSearchObjectTag());
 			var maxNumSuggestion = getSuggestionListMaxHits();		//The number of rows to display in the suggestion list
        	var minNumChars		 = getSearchMinNumChars();			//The minimum number of characters before displaying a suggestion list
        	var suggestTableCell = sap.ui.getCore().byId('suggestTableMatrix');
        	
        	
        	//Check if the correct suggestion list table is present since each combination of search object with
        	//the narrow by tag has it's own suggestion list table.
        	var oPreviousSuggestTable = suggestTableCell.getContent()[0];
        	if(oPreviousSuggestTable != oSuggestTable){
        		suggestTableCell.removeAllContent();
        		suggestTableCell.addContent(oSuggestTable);        		
        	}        	
       	        	
        	//Store the search term along with the suggestions in the buffer
        	if(sValue){
        		var suggestion = {searchObject: getSelectedSearchObject(), value: sValue, suggest: oSuggestResult};
	         	oSuggestionBuffer.unshift(suggestion);
	     		if(oSuggestionBuffer.length >= bufferSize)
	     		{
	     			oSuggestionBuffer.splice(bufferSize, oSuggestionBuffer.length - bufferSize);
	     		}
        	}
        	
     		//Assign only up to the maximum number of results
     		oSuggestTable.getModel().setData({modelData: oSuggestResult.slice(0,maxNumSuggestion)});
     		
     		//Update the number of rows in the suggestion list
     		if(oSuggestResult.length <= maxNumSuggestion)
     			oSuggestTable.setVisibleRowCount(oSuggestResult.length);
     		else
     			oSuggestTable.setVisibleRowCount(maxNumSuggestion);
     		
     		//Clear the footer text
     		var sFooterText = undefined;
     		oSuggestTable.setFooter(null);
     		
     		//Show/Hide the appropriate footer text for the suggestion list
     		if(sValue){
     			if(oSuggestResult.length >= maxNumSuggestion)
         			sFooterText = getOTRText('MORE_RESULT');
         		else if (oSuggestResult.length == 0 && sValue.length >= minNumChars)
         			sFooterText = getOTRText('NO_RESULT');
         		else if (sValue.length > 0 && sValue.length < minNumChars)
                	sFooterText = getOTRText('MINIMUM_CHAR').replace(/&1/g, minNumChars);
     			
         		if(sFooterText){
         			sap.ui.getCore().byId('footerText').setHtmlText("<strong>" + sFooterText + "</strong>");
         			oSuggestTable.setFooter(oFooterMatrix);
         		}
     			
     		}

            //Show/Hide the suggestion list
            if(oSuggestTable.mProperties.visibleRowCount > 0) {
            	oSuggestTable.removeStyleClass('noBorder');
            }
            else {
            	if (oSuggestResult.length == 0 && sValue) {
                	oSuggestTable.removeStyleClass('noBorder');            		
            	} else {
            		oSuggestTable.addStyleClass('noBorder');
            	}            	
            }

            var selectedIndexTmp = getSearchObjectSelectedIndex();
        	if(oSuggestTable.getSelectedIndex() == selectedIndexTmp){
        		oSuggestTable.setSelectedIndex(parseInt(selectedIndexTmp));
        		oSuggestTable.fireRowSelectionChange();
        	}
        	else
        		oSuggestTable.setSelectedIndex(parseInt(selectedIndexTmp));
            	
    	}

		//Populate the suggestion list using the buffer
        function populateFromBuffer(sValue)
		{	
			for(var i = 0; i < oSuggestionBuffer.length; i++)
	    	{
				if(oSuggestionBuffer[i].searchObject == getSelectedSearchObject() && oSuggestionBuffer[i].value == sValue)
	    		{
					oSuggestion = oSuggestionBuffer[i].suggest;
	    			oSuggestionBuffer.unshift(oSuggestionBuffer.splice(i,1)[0]);	    			
	    			updateSuggestionList(oSuggestion, sValue);
	    			return true;
	    		}
	    	}
			
			return false;
		}

        function clearSearchBuffer()
        {
        	oSuggestionBuffer = [];
        }


		//Handle the key press events for the suggestion list
        function keyDownHandler(oEvent)
        {
			var keyUp		= '38';
			var keyDown		= '40';
			var keyEnter	= '13';
			
			var oSuggestTable	 = sap.ui.getCore().byId('suggestTable' + getSelectedSearchObject() + getSelectedSearchObjectTag());
			var index 			 = oSuggestTable.getSelectedIndex();
			var keyCode 		 = oEvent.keyCode || oEvent.which;
			var isAccessible	 = sap.ui.getCore().getConfiguration().getAccessibility();
			
			
//          //Remove the TAB key selection for the suggestion table
//			if(oSuggestTable.getDomRef()){
//				oSuggestTable.getDomRef().getElementsByClassName("sapUiTableCtrlBefore")[0].tabIndex = "-1";
//            	oSuggestTable.getDomRef().getElementsByClassName("sapUiTableCtrlAfter")[0].tabIndex  = "-1";
//        	}
			
			//Special handling required for the suggestion table when the accessibility
			//parameter is enabled.
			if(isAccessible && this.sId == oSuggestTable.sId){
				switch (keyCode.toString()){
					case keyEnter:						
						//retrieve the selected row using the table id name
						var index = oEvent.target.id.split('-')[2].match(/\d+$/)[0];
						//Enter is pressed with an item selected so confirm the selected row
						if(index >= 0){														
							var oObject 	= oSuggestTable.getModel().oData.modelData[index];
							triggerConfirm(oObject);
						}
						break;
					default:
						//All other keys are ignored and the default behavior is executed
						return true;
						break;
				}
				
			}			
			
			switch (keyCode.toString())
			{
				case keyUp:
					oEvent.preventDefault();
					oSmartSearch.focus();
					if(oSuggestTable.getSelectedIndex() < 0)			
						return;
					index = index -1;
					oSuggestTable.setSelectedIndex(index);					
					return false;
					break;
				case keyDown:
					oEvent.preventDefault();
					oSmartSearch.focus();
					if(oSuggestTable.getSelectedIndex() >= oSuggestTable.getRows().length - 1 )
						return;
					index = index + 1;
					oSuggestTable.setSelectedIndex(index);
					return false;
					break;
				case keyEnter:											
					//Enter is pressed with an item selected so confirm the selected row
					if(oSuggestTable.getSelectedIndex() >= 0){														
						var index 	= oSuggestTable.getSelectedIndex();
						var oObject 	= oSuggestTable.getModel().oData.modelData[index];
						triggerConfirm(oObject);
					}
					//Enter is pressed without any selections within the search input field so trigger search
					else
						searchBP(sValue);	
					break;
				default:
					return true;
					break;
			}
			return true;
        }

        function searchBP(sValue)
        {        	        	
        	var aObjects = [];
        	
        	//Do not perform the search if the search term is empty
        	if(!getSearchTerm())
        		return;
        	
        	//Prepare the search query URL with the search value from the input field
        	var sUrl = oController.getSearchURL(getSelectedSearchObject(), getSelectedSearchObjectTag());
        	var escapeValue = encodeURIComponent(sValue.replace(/'/g, "''"));    	 	
    		sUrl = sUrl + "'" + escapeValue + "'";    		
    		
    		//Create the oData model
    		var oDataModel 	= new sap.ui.model.odata.ODataModel(getWindowURI() + getUriPath()+"?sap-client=340", true);
    		
    		//Trigger the search and retrieve the Ids    		
    		oDataModel.read(sUrl, null, null, false, function(oData,response){
        		var oObj;
                for(var i=0; i<oData.results.length; i++){
                    oObj = new Object();
                	oObj.ID = oData.results[i].ID;
                    aObjects.push(oObj);
                }
                //Select the first suggestion list row if only one search result is found
                if(aObjects.length == 1)
                	setSearchObjectSelectedIndex('0');
                triggerSearch(aObjects);
        	});
        }


		
//***********************************************************************************************************************************
//      SEARCH LAYOUT
//***********************************************************************************************************************************

        var oMatrix1;
        var oLabel1;
        var oCell1, oCell2, oCell3;
        var oRow;

		var oSearchLayout = new sap.ui.commons.layout.MatrixLayout({
        	columns: 1,
        	width: '100%'        	
        });				
		
		//*******************************
        //Construct the search header row
		//*******************************
		
		oMatrix1 = new oLayout.MatrixLayout({ columns : 1, width: '100%', height: '32px'});
		oLabel1  = new sap.ui.commons.Label({ text: getOTRText('SEARCH_TITLE')}).addStyleClass('searchHeaderText');
    	oCell1   = new oLayout.MatrixLayoutCell({vAlign: oLayout.VAlign.Bottom, padding: oLayout.Padding.None, hAlign: oLayout.HAlign.Begin, content: [oLabel1]});    	    	
    	if(getModelData(MODEL_CUST).length > 1)
    		oCell1.addContent(oSegmentedButtonIcon);
    	
    	oMatrix1.createRow(oCell1);
    	
    	oSearchLayout.createRow(oMatrix1);

    	
    	//**********************
    	//Insert a separator row
    	//**********************
    	
    	oSearchLayout.createRow(new sap.ui.commons.HorizontalDivider());	
    	
		
    	//******************************
    	//Construct the input search row
    	//******************************
    	
    	oMatrix1 = new oLayout.MatrixLayout({ layoutFixed : false, width: '95%'});
    	oCell1   = new oLayout.MatrixLayoutCell({ vAlign: oLayout.VAlign.Bottom, padding: oLayout.Padding.None, hAlign : oLayout.HAlign.Begin, content:[oTagDropDownList]});    	    	
    	oCell2   = new oLayout.MatrixLayoutCell({ vAlign: oLayout.VAlign.Bottom, padding: oLayout.Padding.None, hAlign : oLayout.HAlign.Begin, content:[oSmartSearch]});
    	oCell3   = new oLayout.MatrixLayoutCell({ vAlign: oLayout.VAlign.Bottom, padding: oLayout.Padding.None, hAlign : oLayout.HAlign.Begin, content:[oSearch]});
		    	
    	//Verify whether the narrow by is enabled
    	if(Boolean(getSearcObjectTagEnabled())){
    		oMatrix1.setColumns(3);
    		oMatrix1.setWidths(["10%", "80%","10%"]);
    		oMatrix1.createRow(oCell1, oCell2, oCell3);
    	}
    	else{
    		oMatrix1.setColumns(2);
    		oMatrix1.setWidths(["90%","10%"]);
    		oMatrix1.createRow( oCell2, oCell3);
    	}
    	
    	oRow = new sap.ui.commons.layout.MatrixLayoutRow();
	    oRow.addCell(new oLayout.MatrixLayoutCell({	hAlign: oLayout.HAlign.Center, content: [oMatrix1]}));
	    oSearchLayout.addRow(oRow);
    	
    	//************************************
		//Create the suggestion list table row
		//************************************    	
    	
    	var oMatrix2 = new oLayout.MatrixLayout({ layoutFixed : false, columns : 1, width: '95%'});
		oCell1   = new oLayout.MatrixLayoutCell('suggestTableMatrix', { vAlign: oLayout.VAlign.Bottom, padding: oLayout.Padding.None, hAlign : oLayout.HAlign.End,
					content:[sap.ui.getCore().byId('suggestTable' + getSelectedSearchObject() + getSelectedSearchObjectTag())]});
		oMatrix2.createRow(oCell1);							
		
		oRow = new sap.ui.commons.layout.MatrixLayoutRow();
	    oRow.addCell(new oLayout.MatrixLayoutCell({	hAlign: oLayout.HAlign.Center, content: [oMatrix2]}));
	    oSearchLayout.addRow(oRow);		
	
		//Assign the keydown listener to the document to ensure key events are functional no matter where the focus is
//		document.addEventListener('keydown', keyDownHandler);

		return oSearchLayout;

	}

});