(function() {
  sap.ui.controller("view.NotFound", {
    onInit: function() {
      this.router = sap.ui.core.UIComponent.getRouterFor(this);
      return this.router.attachRouteMatched(this.onRouteMatched, this);
    },
    onRouteMatched: function(evt, param) {
      if (evt.getParameter("name") !== "NotFound") {

      }
    }
  });

}).call(this);
