ui5lib.Controller.extend("Product.Detail", {
    onInit: function() {
      this.tabs = this.getView().byId("tabs");
    },
    onMyRouteMatched: function(evt) {
      this.productId = evt.getParameters()["arguments"].id;
      this.getView().bindElement("/Products(" + this.productId + ")");
      return this.tabs.getItems().forEach(function(item) {
        return item.bindElement(item.getKey());
      });
    },
    onNavBack: function(evt) {
      return window.history.go(-1);
    }
});
