  sap.ui.jsfragment("Product.Footer", {
    createContent: function(oController) {
      return new sap.m.Bar({
        contentRight: [
          new sap.m.Text({
            text: "UI5 Playground"
          })
        ]
      });
    }
  });
