sap.ui.jsview("js.HanaSmartSearchQuickView", {
	
	bufferSize:				100, //buffer size for the quick view model buffer
	quickviewModelBuffer: 	[],
	currentObject: 			undefined,
	
	/** Specifies the Controller belonging to this View.
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf js.HanaSmartSearchQuickView
	*/
	getControllerName : function() {
		return "js.HanaSmartSearchQuickView";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed.
	* Since the Controller is given to this method, its event handlers can be attached right away.
	* @memberOf js.HanaSmartSearchQuickView
	*/
	createContent : function(oController) {
		
		var oLayout 				= sap.ui.commons.layout;
		var oView 					= oController.getView();
		var searchObject			= oView.getViewData().searchObject;
		
		oView.setModel(sap.ui.getCore().getModel(MODEL_CONFIG), MODEL_CONFIG);
		oView.bindElement(MODEL_CONFIG+">/"+getSearchObjectIndex(searchObject));
		
		oView.setModel(sap.ui.getCore().getModel(MODEL_CUST), MODEL_CUST);
		oView.bindElement(MODEL_CUST+">/"+getSearchObjectIndex(searchObject));
		
		/*******************************************
		 * CREATE THE MAIN MATRIX
		 *******************************************/
		
		var oMainMatrix = new sap.ui.commons.layout.MatrixLayout('mainMatrix' + searchObject, {
        	layoutFixed : true,
        	columns : 1,
        	width : '100%',
        	height : '100%',
        	visible: true
        });					
		
		var oRow 		 = new sap.ui.commons.layout.MatrixLayoutRow();
		
		/*******************************************
		 * CREATE THE SEARCH OBJECT MATRIX
		 *******************************************/
		var oSearchObjectMatrix = new sap.ui.commons.layout.MatrixLayout('searchObjectMatrix'+ searchObject, {
        	layoutFixed : true,
        	columns : 1,
        	width : '100%',
        	height : '100%',
        	visible: true   	
        });
		
		oSearchObjectMatrix.addStyleClass('quickViewArea');			
		
		/*******************************************
		 * CREATE THE CAROUSEL
		 *******************************************/
		var oCarousel = new sap.ui.commons.Carousel('carousel' + searchObject, {
        	orientation:  sap.ui.commons.enums.Orientation.horizontal,
        	width: '100%',
        	height: '100%',
        	handleSize: 25,
        	visibleItems: 1
        });	
		
        var searchObjectSetList = getSearchObjectSetList(searchObject);
		
		var numPages = searchObjectSetList.length;
		
		/*******************************************
		 * CREATE THE PAGES
		 *******************************************/	
        for(var pageIndex = 0; pageIndex < numPages; pageIndex++){	
        	oCarousel.addContent(this.createQuickView(searchObject, pageIndex));
        }
        //Hide the carousel handles if there's only one page
        if(numPages == 1)
        	oCarousel.setHandleSize(0);
        	        	        		    		
	    oRow.addCell(new oLayout.MatrixLayoutCell({
	    	padding: oLayout.Padding.None,
			vAlign: sap.ui.commons.layout.VAlign.Top,
			content: [oCarousel]}));
	    oRow.setHeight('95%');
	    oSearchObjectMatrix.addRow(oRow);	

		/*******************************************
		 * CREATE THE PAGINATOR
		 *******************************************/
        if(numPages > 0){
        	var oPaginator = this.createPaginator(searchObject, numPages);        	        	        	

        	//Restore the previously selected page in the quick view
        	var previouslyQVSelectedPage = parseInt(getSearchObjectQVSelectedPage(searchObject));        	  	
        	if(previouslyQVSelectedPage){
        		oPaginator.setCurrentPage(previouslyQVSelectedPage);
        		oCarousel.setFirstVisibleIndex(previouslyQVSelectedPage-1); //Zero based index so subtract one
        	}
        	
        	oRow = new sap.ui.commons.layout.MatrixLayoutRow();
	
		    oRow.setHeight('5%');
		    oRow.addCell(new oLayout.MatrixLayoutCell({
		    	padding: oLayout.Padding.None,
		    	hAlign: sap.ui.commons.layout.HAlign.Center,
				vAlign: sap.ui.commons.layout.VAlign.Bottom,
				content: [oPaginator]}));
		
		    oSearchObjectMatrix.addRow(oRow);
        }	

		var oMainModel = new sap.ui.model.json.JSONModel();
        oMainMatrix.setModel(oMainModel);
		
        //Check whether the search object is confirmed and update the quick view
        //the quick view correspondingly if it is confirmed
        var confirmedSearchObject = oController.getConfirmedSearchObject(searchObject)
        if(confirmedSearchObject)
        	oView.updateQuickView(confirmedSearchObject);

		return oMainMatrix;
	},
	
	
	//Method to update the quick view to display the details of an object
	updateQuickView : function(oObject) {		

		var oView				= this;
		var searchObject 		= oView.getViewData().searchObject; //getSelectedSearchObject();
		var oMainQuickView 		= sap.ui.getCore().byId('mainMatrix' + searchObject);
		var oSearchObjectMatrix = sap.ui.getCore().byId('searchObjectMatrix'+ searchObject);
		var oController			= this.getController();		
		
		//Update the currently selected object
		oView.currentObject = oObject;
		
		//Clear all previous
		oMainQuickView.removeAllRows();
		oMainQuickView.getModel().setData(undefined);		
		
		if(oObject == undefined)
			return;
		
		var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
	    oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
	    	padding: sap.ui.commons.layout.Padding.None,	
			content: [oSearchObjectMatrix]}));
	    oRow.setHeight('100%');
	    oMainQuickView.addRow(oRow);
		
		
    	//Create the oData model
		var oDataModel 	= new sap.ui.model.odata.ODataModel(getWindowURI() + getUriPath()+"?sap-client=340", true);
		
        var searchObjectSetList = getSearchObjectSetList(searchObject);
		
		var numPages = searchObjectSetList.length;
		
		for(var pageIndex = 0; pageIndex < numPages; pageIndex++){

			//Check if the quick view page is in the buffer
			if(!this.populateFromBuffer(oView.currentObject, pageIndex))
			{
				var sUrl = oController.getDetailsURL(oObject,searchObject, pageIndex);
		    	//Read the information of the desired business partner asynchronously
				oDataModel.read(sUrl, null, null, true, function(oData,response){					
					//Only perform the following checks if nothing is confirmed otherwise continue
					if(!getSearchObjectConfirmed(oData.SearchObject))
						//Don't update the quick view if already nothing or another object was selected
						if(oView.currentObject == undefined || !oController.compareSearchObjects(oView.currentObject, oData))
							return;
					
					//This line ensures to make a copy of the object and not only a reference to copy
					var data = JSON.parse(JSON.stringify(oData));
					
					//Set the model data with the processed data. The SetData method has the merge option
					//set to true, however it's important to just update the values from the current page
					oController.processData(data);
					oMainQuickView.getModel().setData(data, true);
					oMainQuickView.getModel().refresh();
					
					//Add the search object quick view data to the buffer
		         	oView.quickviewModelBuffer.unshift(data);
		     		if(oView.quickviewModelBuffer.length >= oView.bufferSize)
		     		{
		     			oView.quickviewModelBuffer.splice(oView.bufferSize, oView.quickviewModelBuffer.length - oView.bufferSize);
		     		}

				});
			}
		}
	},

	populateFromBuffer : function(searchObject, pageIndex) {
		
		var oSetList 		= getSearchObjectSetList()[pageIndex];
		var oView	 		= this;
		var oController		= this.getController();
		
		for(var i = 0; i < oView.quickviewModelBuffer.length; i++)
    	{
    		if(oController.compareSearchObjects(oView.quickviewModelBuffer[i], searchObject) && oView.quickviewModelBuffer[i].SetID == oSetList.setId)
    		{    			
    			var oMainQuickView = 	sap.ui.getCore().byId('mainMatrix' + searchObject.SearchObject);
				
    			//Update the model
    			oMainQuickView.getModel().setData(oView.quickviewModelBuffer[i], true);
				oMainQuickView.getModel().refresh();
				
				//put back the entry at the top of the buffer array
				oView.quickviewModelBuffer.unshift(oView.quickviewModelBuffer.splice(i,1)[0]);
				
    			return true;
    		}
    	}
		
		return false;
	},
	
	
	//Create a quick view for the desired object
	createQuickView : function(sObjectType, iPageIndex) {
		
		var oLayout 	= sap.ui.commons.layout;
		var oController	= this.getController();
		
		//Get the object data using the object type
		var sEntitySet		= getQuickViewExtName(sObjectType);
		var sEntityType		= getEntityType(sEntitySet);         	
		var oLabels 		= getEntityTypeLabels(sEntityType);
      	
		var setList			= getSearchObjectSetList(sObjectType)[iPageIndex];
		
      	//Elements required to build the quick view matrix
      	var oMatrix1;
        var oLabel1, oLabel2;
        var oCell1, oCell2, oCell3;
        var oButton1;
        var oImage1;
        var oFText1;		

		//Create the quick view MatrixLayout for the desired search object and page
        var oQuickViewMatrix = new sap.ui.commons.layout.MatrixLayout('quickViewMatrix'+sObjectType + '_' + iPageIndex, {
        	layoutFixed : true,
        	columns : 1,
        	width : '100%'
        });


        //Apply a CSS class for styling
        oQuickViewMatrix.addStyleClass('quickViewPanel');

  		//*******************************
        //Construct the search header row
  		//*******************************
  		
		oMatrix1 = new oLayout.MatrixLayout({ layoutFixed : false, columns : 3, width: '100%', widths: ['10%','60%','30%']});
		oImage1  = new sap.ui.commons.Image({src: getQuickViewIconUri(sObjectType), tooltip: getSearchObjectDescription(sObjectType)});
		oCell1   = new oLayout.MatrixLayoutCell({vAlign: sap.ui.commons.layout.VAlign.Bottom, padding: oLayout.Padding.None, content: [oImage1]});
		oLabel1  = new sap.ui.commons.Label().setText(setList.description).setTooltip(setList.description).addStyleClass('quickViewHeaderText'); 	
    	oCell2   = new oLayout.MatrixLayoutCell({vAlign: sap.ui.commons.layout.VAlign.Bottom, padding: oLayout.Padding.None, content: [oLabel1]});          		
  		oCell3   = new oLayout.MatrixLayoutCell({vAlign: oLayout.VAlign.Bottom, padding: oLayout.Padding.None, hAlign: oLayout.HAlign.End});    	
  		
  		//Attach all the desired buttons to the last cell
  		var qvButtons = getSearchObjectQVButtons(sObjectType);
  		for(var index in qvButtons){
  			var button = qvButtons[index];
  			if(Boolean(button.visible)){
  				oButton1 = new sap.ui.commons.Button({
  					text : button.text,
  					tooltip : button.tooltip,
  					enabled: Boolean(button.enabled),
  					press : function(){triggerEvent(button.eventId, oQuickViewMatrix.getModel().oData);}
  				});
  				oCell3.addContent(oButton1);
  			}
  		}
 		
  		oMatrix1.createRow(oCell1 ,oCell2, oCell3);
    	
    	oQuickViewMatrix.createRow(oMatrix1);

      	//************************************
      	//Insert a separator row
      	//************************************
      	
    	oQuickViewMatrix.createRow(new sap.ui.commons.HorizontalDivider());	

    	//*************************************
      	//Construct the Object details
      	//*************************************      	       	

    	
        var oQuickViewDetailsMatrix = new sap.ui.commons.layout.MatrixLayout('quickViewDetailsMatrix'+sObjectType + '_' + iPageIndex, {
        	layoutFixed : true,
        	columns : 1,
        	width : '100%'
        });

		var attributeList	= getSearchObjectSetListAttributes(sObjectType, setList.setId);
		
		for (var index in attributeList){
			
			var attribute = attributeList[index];
			
      		oMatrix1 = new oLayout.MatrixLayout({ columns : 2, width: '100%', widths: ['35%','65%']});
      		oLabel1	 = new sap.ui.commons.Label({
      			text: 		oLabels[attribute.odFieldName],
      			tooltip: 	oLabels[attribute.odFieldName],
      			design: 	sap.ui.commons.LabelDesign.Bold,
      			textAlign: 	sap.ui.core.TextAlign.End,
      			width: 		'100%'});
      		oCell1   = new oLayout.MatrixLayoutCell({content: [oLabel1], vAlign: oLayout.VAlign.Top});
      		oFText1	 = new sap.ui.commons.FormattedTextView({wrapping: true});
      		//Bind the values to the necessary model attributes and replace the <NEW_LINE> tags by a break line
      		oFText1.bindProperty('htmlText','/'+ attribute.odFieldName, function(value){return (value)? value.replace(/<NEW_LINE>/g,'<br />'):'';});
      		oFText1.bindProperty('tooltip','/'+ attribute.odFieldName, function(value){return (value)? value.replace(/<NEW_LINE>/g,'  '):'';});
      		oCell2   = new oLayout.MatrixLayoutCell({content: [oFText1]});
          	oMatrix1.createRow(oCell1,oCell2);
          	
          	oQuickViewDetailsMatrix.createRow(oMatrix1);
		}				
		
		if(oQuickViewDetailsMatrix.getRows().length > 0)
			oQuickViewMatrix.createRow(oQuickViewDetailsMatrix);				
		
			
      	return oQuickViewMatrix;
		
	},
	
	
	//Create the paging control for the provided search object type
	createPaginator : function(sObjectType, numPages) {
	
		var oCarousel = sap.ui.getCore().byId('carousel' + sObjectType);	
		
		//Store the original showPrevious and ShowNext methods
		oCarousel.showPreviousOriginal = oCarousel.showPrevious;
		oCarousel.showNextOriginal = oCarousel.showNext;
		
		
		//Create the paginator
		var oPaginator = new sap.ui.commons.Paginator("paginator"+sObjectType,{
	        numberOfPages: numPages,
		    currentPage: 1,
		    page : function(oEvent) {
		    	
		    	switch (oEvent.getParameter("type"))
				{
					case 'Previous':
						oCarousel.showPreviousOriginal();
						break;
					case 'Next':
						oCarousel.showNextOriginal();
						break;
					case 'First':
					case 'Last':
					case 'Goto':
						var pageDiff = oEvent.getParameter("targetPage") - oEvent.getParameter("srcPage");
						while(pageDiff != 0){
							if(pageDiff < 0){								
								oCarousel.showPreviousOriginal();
								pageDiff++;
							}
							else{
								oCarousel.showNextOriginal();
								pageDiff--;								
							}							
						}
						break;
					default:						
						console.log('Paginator control could not handle event type: ' + oEvent.getParameter("type"));
						break;
				}
		    	setSearchObjectQVSelectedPage(oEvent.getParameter('targetPage'), sObjectType);
		    }
  	    });
		
		//Overwrite the showPrevious and showNext methods of the carousel to change the paginator page as well
		oCarousel.showPrevious = function() {
			if((oPaginator.getCurrentPage()-1) == 0)
				oPaginator.setCurrentPage(oPaginator.getNumberOfPages());
			else
				oPaginator.setCurrentPage(oPaginator.getCurrentPage()-1);
			setSearchObjectQVSelectedPage(oPaginator.getCurrentPage(), sObjectType);
			oCarousel.showPreviousOriginal();
		};
		oCarousel.showNext = function() {
			if((oPaginator.getCurrentPage()+1) > oPaginator.getNumberOfPages())
				oPaginator.setCurrentPage(1);
			else
				oPaginator.setCurrentPage(oPaginator.getCurrentPage()+1);
			setSearchObjectQVSelectedPage(oPaginator.getCurrentPage(), sObjectType);
			oCarousel.showNextOriginal();
		};
		
		//Ensure that when the keys are pressed on the carousel
		//that the pages are updated accordingly
		oCarousel.attachBrowserEvent('keydown', this.keyDownHandler, oPaginator);
		
		return oPaginator;
		
	},
	
	//Ensures the pages are updated correctly when the arrow keys
	//are used on the carousel to change quick view pages
    keyDownHandler: function(oEvent)
    {
		var keyLeft		= '37';
		var keyRight	= '39';
		var keyUp		= '38';
		var keyDown		= '40';		

		
		var currentPage = this.getCurrentPage();
		var keyCode = oEvent.keyCode || oEvent.which;			

		switch (keyCode.toString())
		{
			case keyUp:
			case keyLeft:
				if((currentPage-1) == 0)
					this.setCurrentPage(this.getNumberOfPages());
				else
					this.setCurrentPage(currentPage-1);
				break;
			case keyDown:
			case keyRight:
				if((currentPage+1) > this.getNumberOfPages())
					this.setCurrentPage(1);
				else
					this.setCurrentPage(currentPage+1);
				break;
			default:
				return true;
				break;
		}
    },
});
