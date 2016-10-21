jQuery.sap.declare("com.sap.mt.controls.Input");
jQuery.sap.require("sap.m.Input");
jQuery.sap.require("sap.m.InputRenderer");

sap.m.Input.extend("com.sap.mt.controls.Input", { // call the new Control type "HoverButton" 
                                                // and let it inherit from sap.ui.commons.Button
 metadata: {
          events: {
              "hover" : {}  // this Button has also a "hover" event, in addition to "press" of the normal Button
          }
      },

 onmouseover : function(evt) {   // is called when the Button is hovered - no event registration required
          this.fireHover();
      },
      
      renderer: sap.m.InputRenderer// add nothing, just inherit the ButtonRenderer as is; 
                   // In this case (since the renderer is not changed) you could also specify this explicitly with:  renderer:"sap.ui.commons.ButtonRenderer"
                   // (means you reuse the ButtonRenderer instead of creating a new view
  });