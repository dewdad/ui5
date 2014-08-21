  jQuery.sap.require("sap.ui.layout.form.SimpleForm");

  sap.ui.jsfragment("Product.ProductInfo", {
    createContent: function(oController) {
      return new sap.m.ObjectHeader({
        title: "{ProductName}",
        number: "{UnitPrice}",
        numberUnit: "USD",
        statuses: [
          new sap.m.ObjectStatus({
            text: {
              parts: [
                {
                  path: "UnitsInStock"
                }, {
                  path: "UnitsOnOrder"
                }
              ],
              formatter: function(stock, order) {
                return "" + order + " / " + stock + " (Order/Stock)";
              }
            },
            state: {
              path: "UnitsInStock",
              formatter: function(stock) {
                if (stock <= 10) {
                  return "Error";
                } else {
                  return "Success";
                }
              }
            }
          })
        ],
        attributes: [
          new sap.m.ObjectAttribute({
            text: "{QuantityPerUnit}"
          })
        ]
      });
    }
  });
