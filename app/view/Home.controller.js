(function() {
	"use strict";

    //jQuery.sap.require("ui5lib.Controller");
    ui5lib.Controller.extend("view.Home", {

		onInit: function() {
			this.bus = sap.ui.getCore().getEventBus();
            // set mock model
            var oModel = new sap.ui.model.json.JSONModel('./config/tiles.json');
            this.getView().setModel(oModel);
		},

		handleTileTap: function(evt) {
			var src = evt.getSource();
            var bindProp = src.getBoundProperty();
            var viewDir = bindProp.viewDir;

            this.getRouter().navTo(
                viewDir/*,
                {part: viewDir}*/
            );
//			this.bus.publish("nav", "to", {
//				id: ui.getRootResourceName()+".view."+viewDir+"."+viewDir,
//				data: {
//					context: src.getBindingContext()
//				}
//			});
		},

		productCount: function(oValue) {
			//return the number of products linked to Category
			if (oValue) {
				var sPath = this.getBindingContext().getPath() + "/Products";
				return this.getModel().bindList(sPath).getContexts().length;
			}
		}
		
	});

}());