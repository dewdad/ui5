
  sap.ui.jsview("Product.Master", {
    getControllerName: function() {
      return "Product.Master";
    },
    createContent: function(oController) {
      var footer, list;
      this.page = new sap.m.Page({
        title: "Product List"
      });
      list = sap.ui.jsfragment("Product.SearchList", oController);
      footer = sap.ui.jsfragment("Product.Footer", oController);
      this.page.addContent(list);
      this.page.setFooter(footer);
      return this.page;
    }
  });
