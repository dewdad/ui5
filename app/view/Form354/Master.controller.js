sap.ui.controller("Form354.Master", {

  _formFragments: {},

  _getFormFragment: function (sFragmentName) {
    var oFormFragment = this._formFragments[sFragmentName];

    if (!oFormFragment) {
      oFormFragment = sap.ui.xmlfragment(
          "Form354." + sFragmentName
      );

      this._formFragments[sFragmentName] = oFormFragment;
      oFormFragment.bindElement("/SupplierCollection/0");
    }
    return oFormFragment;
  },

  _showFormFragment : function (sFragmentName) {
    oForm = this._getFormFragment(sFragmentName);
    var oContainer = this.getView().byId("idFormContainer");
    oContainer.removeAllContent();
    oContainer.insertContent(oForm);
  },

  onInit: function (oEvent) {

    // set explored app's demo model on this sample
    /*var oModel = new sap.ui.model.json.JSONModel("test-resources/sap/ui/demokit/explored/supplier.json");
    this.getView().setModel(oModel);*/

    // Set the initial form to be the display one
    this._showFormFragment("Display");

    this.getView().bindElement("/SupplierCollection/0");
  },

  handleFooterBarButtonPress: function (oEvent) {
    // Derive action from the button pressed
    var bEditAction = /idButtonEdit$/.test(oEvent.getSource().getId()),
      oView = this.getView();

    // Show the appropriate action buttons
    oView.byId("idButtonEdit").setVisible(!bEditAction);
    oView.byId("idButtonSave").setVisible(bEditAction);
    oView.byId("idButtonCancel").setVisible(bEditAction);

    // Set the right form type
    oForm = this._showFormFragment(bEditAction ? "Change" : "Display");
  }
});
