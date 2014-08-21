ui5lib.Controller.extend("Product.Master", {
    _searchColumns: ["Supplier/CompanyName","Category/CategoryName","ProductName","QuantityPerUnit"],
    onInit: function() {
      /*this.router = sap.ui.core.UIComponent.getRouterFor(this);
      this.router.attachRouteMatched(this.onRouteMatched, this);*/
      this.query = this.byId("query");
      this.productList = this.byId("productList");
    },
    onMyRouteMatched: function(evt) {
      if (evt.getParameter("name") !== "Master") {

      }
    },
    onSearch: function(evt) {
      var binding, filters, query;
      query = this.query.getValue();
      //filters = [new sap.ui.model.Filter("ProductName", "Contains", query)];
      binding = this.productList.getBinding("items");
      return binding.x_search(this._searchColumns, query);//filter(filters, sap.ui.model.FilterType.Application);
    },
    onItemPress: function(evt) {
      var context;
      context = evt.getSource().getBindingContext();
      return this.router.navTo("Detail", {
        id: context.getObject().ProductID
      });
    },
    onOpenDialog: function(evt) {
      if (!this._viewSetting) {
        this._viewSetting = sap.ui.jsfragment("Product.ViewSettings", this);
      }
      return this._viewSetting.open();
    },
    onChangeViewSettings: function(evt) {
      var binding, descending, filterSettings, params, path, sortSettings;
      params = evt.getParameters();
      binding = this.productList.getBinding("items");
      sortSettings = [];
      if (params.sortItem) {
        path = params.sortItem.getKey();
        descending = params.sortDescending;
        sortSettings.push(new sap.ui.model.Sorter(path, descending));
      }
      binding.sort(sortSettings);
      filterSettings = [];
      jQuery.each(params.filterItems, function(i, item) {
        var filter, settingArray;
        settingArray = item.getKey().split("___");
        filter = new sap.ui.model.Filter(settingArray[0], settingArray[1], settingArray[2], settingArray[3]);
        return filterSettings.push(filter);
      });
      return binding.filter(filterSettings);
    }
  });

