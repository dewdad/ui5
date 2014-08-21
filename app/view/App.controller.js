(function() {
  sap.ui.controller("view.App", {
    onInit: function() {
      this.router = sap.ui.core.UIComponent.getRouterFor(this);
      return this.router.attachRouteMatched(this.onRouteMatched, this);
    },
    onRouteMatched: function(evt, param) {
      if (evt.getParameter("name") !== "App") {

      }
    }
  });

}).call(this);
