  sap.ui.jsfragment("Product.SearchList", {
    createContent: function(oController) {
      return new sap.m.Table({
        id: oController.getView().createId("productList"),
        growing: true,
        growingScrollToLoad: true,
        growingThreshold: 10,
        growingTriggerText: "More",
        noDataText: "no data",
        headerToolbar: this._createHeaderToolbar(oController),
        columns: this._createHeaderColumns(oController),
        items: {
          path: "/Products",
          template: this._createTemplate(oController),
          parameters: {
            expand: "Category, Supplier",
            select: "*, Category/CategoryName, Supplier/CompanyName"
          }
        }
      });
    },
    _createHeaderToolbar: function(oController) {
      return new sap.m.Toolbar({
        content: [
          new sap.m.SearchField({
            id: oController.getView().createId("query"),
            search: [oController.onSearch, oController]
          }), new sap.m.Button({
            icon: "sap-icon://drop-down-list",
            press: [oController.onOpenDialog, oController]
          })
        ]
      });
    },
    _createHeaderColumns: function(oController) {
      return [
        new sap.m.Column({
          mergeDuplicates: true,
          header: new sap.m.Label({
            text: "Supplier"
          }),
          minScreenWidth: "Tablet",
          demandPopin: true
        }), new sap.m.Column({
          header: new sap.m.Label({
            text: "Category"
          }),
          minScreenWidth: "Tablet",
          demandPopin: true
        }), new sap.m.Column({
          header: new sap.m.Label({
            text: "Product"
          }),
          width: "12rem"
        }), new sap.m.Column({
          header: new sap.m.Label({
            text: "Order"
          }),
          minScreenWidth: "Tablet",
          demandPopin: true,
          hAlign: "Right"
        }), new sap.m.Column({
          header: new sap.m.Label({
            text: "Stock"
          }),
          minScreenWidth: "Tablet",
          demandPopin: true,
          hAlign: "Right"
        }), new sap.m.Column({
          header: new sap.m.Label({
            text: "Price"
          }),
          hAlign: "Right"
        })
      ];
    },
    _createTemplate: function(oController) {
      return new sap.m.ColumnListItem({
        type: "Navigation",
        press: [oController.onItemPress, oController],
        cells: [
          new sap.m.Text({
            text: "{Supplier/CompanyName}"
          }), new sap.m.Text({
            text: "{Category/CategoryName}"
          }), new sap.m.ObjectIdentifier({
            title: "{ProductName}",
            text: "{QuantityPerUnit}"
          }), new sap.m.ObjectNumber({
            number: "{UnitsOnOrder}"
          }), new sap.m.ObjectNumber({
            number: "{UnitsInStock}"
          }), new sap.m.ObjectNumber({
            number: "{UnitPrice}",
            unit: "USD"
          })
        ]
      });
    }
  });
