sap.ui.define([
	"sap/ui/core/mvc/Controller",'sap/ui/model/json/JSONModel'
], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("com.sap.mt.controller.View1", {

	onInit: function(){
			
			this.byId("productInput").setFilterFunction(function(sTerm, oItem) {
				
			return true;
			});
			
		var data = this._getData();
		var oModel = new sap.ui.model.json.JSONModel(data);
		this.getView().setModel(oModel);
},

handleSuggest : function(oEvent) {
	var oModel = this.getView().getModel();
	var json = oModel.getData();
	var accounts = this._getData();
	var newAccount = accounts.accounts[0];
	newAccount.firstName = "NewAccount";
   json.accounts.push(newAccount);
   oModel.setProperty("/accounts",json.accounts);
},

	_getData: function(){
	var data = {accounts: [{
  "title": "DR",
  "firstName": "Marcin",
  "lastName": "Tamberg",
  "contactPhone": "+49 6785551112-1-1",
  "company": "",
  "preferredLanguage": "en_US",
  "preferredCurrency": "USD",
  "preferredSite": "default",
  "metadata": {
    "mixins": {
      "sdcustomer": "https://api.yaas.io/hybris/schema/v1/cecenterdevman/SAP_SDCustomer.v1.json"
    }
  },
  "mixins": {
    "sdcustomer": {
      "sdCustomerNumber": "0000100006",
      "division": "01",
      "salesOrganization": "0001",
      "message": {},
      "faxNumber": "333222-2-2",
      "distributionChannel": "01",
      "marcin": "0000100006",
      "referenceCustomerNumber": "",
      "processingStatus": "FAILED"
    }
  },
  "customerNumber": "C3045725732",
  "id": "C3045725732",
  "addresses": [
    {
      "id": "fabb82f3d5",
      "contactName": "Marcind",
      "street": "Dietmar-Hopp-Allee 20",
      "streetNumber": "",
      "zipCode": "69190",
      "city": "Walldorf",
      "country": "DE",
      "state": "",
      "contactPhone": "432432423423",
      "isDefault": true,
      "tags": [],
      "metadata": {
        "mixins": {
          "iDoc_ADRMAS": "https://api.yaas.io/hybris/schema/v1/cecenterdevman/SAP_IDoc_ADRMAS03.v1.json"
        }
      },
      "mixins": {
        "iDoc_ADRMAS": {
          "E1ADRMAS": {
            "obj_type": "KNA1",
            "obj_id": "0000100006",
            "context": "0001",
            "iv_check_address": "X",
            "iv_time_dependent_comm_data": "X",
            "E1BPAD1VL": [
              {
                "from_date": "00010101",
                "to_date": "99991231",
                "name": "Marcind",
                "name_2": "Tamberg",
                "city": "Walldorf",
                "postl_cod1": "69190",
                "street": "Dietmar-Hopp-Allee 20",
                "country": "DE",
                "countryiso": "DE",
                "langu": "E",
                "langu_iso": "EN",
                "time_zone": "CET",
                "E1BPAD1VL1": {
                  "langu_cr": "E",
                  "langucriso": "EN",
                  "addr_group": "BP"
                }
              }
            ],
            "E1BPADTEL": [
              {
                "country": "DE",
                "countryiso": "DE",
                "std_no": "X",
                "telephone": "+49 6785551112-1-1",
                "tel_no": "+49678555111211",
                "caller_no": "+49678555111211",
                "r_3_user": "1",
                "home_flag": "X",
                "consnumber": "002"
              }
            ],
            "E1BPADFAX": [
              {
                "country": "DE",
                "countryiso": "DE",
                "std_no": "X",
                "fax": "333222-2-2",
                "fax_no": "+4933322222",
                "sender_no": "33322222",
                "home_flag": "X",
                "consnumber": "004"
              }
            ],
            "E1BPADSMTP": [
              {
                "std_no": "X",
                "e_mail": "marcin.tamberg@yaas.com",
                "email_srch": "MARCIN.TAMBERG@YAAS.",
                "home_flag": "X",
                "consnumber": "004"
              }
            ],
            "E1BPAD_REM": [
              {
                "langu": "E",
                "langu_iso": "EN"
              }
            ],
            "E1BPADUSE": [
              {
                "comm_type": "TEL",
                "consnumber": "002",
                "comm_usage": "AD_DEFAULT",
                "def_usage": "X"
              },
              {
                "comm_type": "TEL",
                "consnumber": "002",
                "comm_usage": "AD_HOME",
                "def_usage": "X"
              },
              {
                "comm_type": "TEL",
                "consnumber": "002",
                "comm_usage": "AD_NMBDEFA",
                "def_usage": "X"
              },
              {
                "comm_type": "FAX",
                "consnumber": "004",
                "comm_usage": "AD_DEFAULT",
                "def_usage": "X"
              },
              {
                "comm_type": "FAX",
                "consnumber": "004",
                "comm_usage": "AD_HOME",
                "def_usage": "X"
              },
              {
                "comm_type": "INT",
                "consnumber": "004",
                "comm_usage": "AD_DEFAULT",
                "def_usage": "X"
              },
              {
                "comm_type": "INT",
                "consnumber": "004",
                "comm_usage": "AD_HOME",
                "def_usage": "X"
              }
            ]
          }
        }
      }
    },
    {
      "id": "39b3973a32",
      "contactName": "Marcin Test customer 2",
      "street": "SAP Strasse. 2",
      "streetNumber": "",
      "zipCode": "69234",
      "city": "Walldorf2",
      "country": "DE",
      "state": "",
      "contactPhone": "43423423432",
      "isDefault": false,
      "tags": [],
      "metadata": {
        "mixins": {}
      }
    },
    {
      "id": "44a14b010c",
      "contactName": "Marcin Test customer 2",
      "street": "SAP Strasse. 2",
      "streetNumber": "",
      "zipCode": "69234",
      "city": "Walldorf2",
      "country": "DE",
      "state": "",
      "contactPhone": "4444243432",
      "isDefault": false,
      "tags": [],
      "metadata": {
        "mixins": {}
      }
    }
  ],
  "contactEmail": "marcin.tamberg@yaas.com",
  "active": true
}]};
return data;
	}
	});

});