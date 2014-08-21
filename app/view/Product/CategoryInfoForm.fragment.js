  sap.ui.jsfragment("Product.CategoryInfoForm", {
    createContent: function(oController) {
      var form, grid;
      form = new sap.ui.layout.form.SimpleForm({
        minWidth: 1024,
        editable: false,
        content: [
          new sap.ui.core.Title({
            text: "Category"
          }), new sap.m.Label({
            text: "CategoryID"
          }), new sap.m.Text({
            text: "{CategoryID}"
          }), new sap.m.Label({
            text: "CategoryName"
          }), new sap.m.Text({
            text: "{CategoryName}"
          }), new sap.m.Label({
            text: "Description"
          }), new sap.m.Text({
            text: "{Description}"
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
