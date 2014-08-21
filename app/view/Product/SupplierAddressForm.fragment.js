  sap.ui.jsfragment("Product.SupplierAddressForm", {
    createContent: function(oController) {
      var form, grid;
      form = new sap.ui.layout.form.SimpleForm({
        minWidth: 1024,
        editable: false,
        content: [
          new sap.ui.core.Title({
            text: "Company"
          }), new sap.m.Label({
            text: "SupplierID"
          }), new sap.m.Text({
            text: "{SupplierID}"
          }), new sap.m.Label({
            text: "CompanyName"
          }), new sap.m.Text({
            text: "{CompanyName}"
          }), new sap.ui.core.Title({
            text: "Contact"
          }), new sap.m.Label({
            text: "ContactName"
          }), new sap.m.Text({
            text: "{ContactName}"
          }), new sap.m.Label({
            text: "ContactTitle"
          }), new sap.m.Text({
            text: "{ContactTitle}"
          }), new sap.m.Label({
            text: "PostalCode"
          }), new sap.m.Text({
            text: "{PostalCode}"
          }), new sap.m.Label({
            text: "Addreess"
          }), new sap.m.Text({
            text: {
              parts: [
                {
                  path: "Country"
                }, {
                  path: "Region"
                }, {
                  path: "City"
                }, {
                  path: "Address"
                }
              ],
              formatter: function(country, region, city, address) {
                if (country == null) {
                  country = "";
                }
                if (region == null) {
                  region = "";
                }
                if (city == null) {
                  city = "";
                }
                if (address == null) {
                  address = "";
                }
                return "" + country + " " + region + " " + city + " " + address;
              }
            }
          }), new sap.m.Label({
            text: "Phone"
          }), new sap.m.Text({
            text: "{Phone}"
          }), new sap.m.Label({
            text: "HomePage"
          }), new sap.m.Text({
            text: "{HomePage}"
          })
        ]
      });
      return grid = new sap.ui.layout.Grid({
        defaultSpan: "L12 M12 S12",
        hSpacing: 2,
        width: "auto",
        content: [form]
      });
    }
  });
