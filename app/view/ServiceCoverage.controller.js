//$.sap.require('app.lib.ui5')

/**
 * Controller. Handles all events of the view.
 */
sap.ui.controller("app.view.ServiceCoverage", {

    /**
    * Called when a controller is instantiated and its View controls (if available) are already created.
    * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
    */
    //   onInit: function() {
    //
    //   },

    /**
    * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
    * (NOT before the first rendering! onInit() is used for that one!).
    */
    //   onBeforeRendering: function() {
    //
    //   },

    /**
    * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
    * This hook is the same one that SAPUI5 controls get after being rendered.
    */
    //   onAfterRendering: function() {
    //
    //   },

    /**
    * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
    */
    //   onExit: function() {
    //
    //   }

    handleNav: function(evt) {
        var navCon = this.getView().byId("CoverageContainer");
        var target = evt.getSource().data("target");
        var oToggleBtn = evt.oSource; // the toggle button
        if (target) {
            var isMapButton = /globe$/.test(oToggleBtn.getIcon());
            //var animation = this.getView().byId("animationSelect").getSelectedKey();
            var cData = oToggleBtn.getCustomData()[0];
            if(isMapButton){
                oToggleBtn.setIcon('sap-icon://table-chart'); // toggle icon
                // toggle target
                cData.setValue('CoverageReport');
            }else{
                oToggleBtn.setIcon('sap-icon://globe');
                cData.setValue('CoverageMap');
            }
            navCon.to(this.getView().byId(target)/*, animation*/);
        } else {
          navCon.back();
        }
    }


});