  sap.ui.jsview("Product.Detail", {
    getControllerName: function() {
      return "Product.Detail";
    },
    createContent: function(oController) {
      var footer, info, tabs;
      this.page = new sap.m.Page({
        title: "Product Detail",
        showNavButton: true,
        navButtonPress: [oController.onNavBack, oController]
      });
      info = sap.ui.jsfragment("Product.ProductInfo", oController);
      tabs = new sap.m.IconTabBar({
        id: this.createId("tabs"),
        items: [
          new sap.m.IconTabFilter({
            key: "Supplier",
            text: "Supplier",
            icon: "sap-icon://supplier",
            content: [sap.ui.jsfragment("Product.SupplierAddressForm")]
          }), new sap.m.IconTabFilter({
            key: "Category",
            text: "Category",
            icon: "sap-icon://hint",
            content: [sap.ui.jsfragment("Product.CategoryInfoForm")]
          })
        ]
      });
      footer = sap.ui.jsfragment("Product.Footer", oController);
      this.page.addContent(info);
      this.page.addContent(tabs);
      this.page.setFooter(footer);
      return this.page;
    }
  });
