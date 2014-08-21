(function() {
  sap.ui.jsview("view.NotFound", {
    getControllerName: function() {
      return "view.NotFound";
    },
    createContent: function(oController) {
      this.page = new sap.m.Page({
        title: "Not Found"
      });
      return this.page;
    }
  });

}).call(this);
