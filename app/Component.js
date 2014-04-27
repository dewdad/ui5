jQuery.sap.declare("app.Component");
jQuery.sap.require("sap.ui.core.UIComponent");
jQuery.sap.require("sap.ui.core.routing.Router");
jQuery.sap.require("sap.m.routing.RouteMatchedHandler");

sap.ui.core.UIComponent.extend("app.Component", {

	metadata : "component.json",

	init: function() {
		sap.ui.core.UIComponent.prototype.init.apply(this, arguments);

		var oRouter = this.getRouter();
		this._oHandler = new sap.m.routing.RouteMatchedHandler(this.getRouter());
		oRouter.initialize();
	},

	exit : function() {
		if (this._oHandler) {
			this._oHandler.destroy();
			delete this._oHandler;
		}
	},

	onWindowError : function(sMessage, sFile, iLine) {

	},

	onWindowBeforeUnload : function() {

	},

	onWindowUnload : function() {

	}
});