(function(){
  //jQuery.sap.require("sap.ca.ui.model.format.FileSizeFormat");
  jQuery.sap.require("sap.ca.ui.message.message");
  jQuery.sap.require("sap.ui.thirdparty.sinon");

  var Formatter = {format: function(nSize){return nSize;}};//sap.ca.ui.model.format.FileSizeFormat.getInstance();

  sap.ui.controller("Upload.Master", {

    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     */
    onInit : function() {

      this.oFormatter =  sap.ca.ui.model.format.DateFormat.getDateInstance({style: "medium"});
      var oFileUpload = this.byId('fileupload');

      //use client side mocking using Sinon.js fake XHR server
      //note you do not need to use this code in your integration!

      oFileUpload.setUseMultipart(false);

      this.server = sinon.fakeServer.create();
      sinon.FakeXMLHttpRequest.useFilters = true;
      this.server.autoRespond = true;
      this.server.autoRespondAfter = 3000;

      sinon.FakeXMLHttpRequest.addFilter(function (method, url, async, username, password) {
        return !(url === '/uilib-sample/upload');
      });

      var that = this;
      this.server.respondWith('POST', "/uilib-sample/upload", function (xhr, id) {

        var s4 = function() {
          return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        };
        var guid = function() {
          return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
        };

        var sFileName = xhr.requestHeaders.slug;

        var sMimeType = xhr.requestHeaders['Content-Type'];
        if (sMimeType.indexOf(';') > -1)
          sMimeType = sMimeType.slice(0, sMimeType.indexOf(';'));

        xhr.respond(200,
          { "Content-Type": "application/json" },
            '{ "mimeType":"' + sMimeType +
            '","contributor":"You' +
            '","uploaded":"' + new Date() +
            '","filename":"' + sFileName +
            '","documentId":"' +  guid() +
            '","url":"/test-resources/sap/ca/ui/demokit/sample/FileUpload/test.txt' +
            '","size":75323}');
      });

      this.server.respond();

      var sDate = new Date();
      var mockData = {
        dataitems : [
          { "mimeType": 'text/plain', "contributor":"John Smith","uploaded": sDate,"filename":"Notes.txt","documentId":"ef1d600d-5d2f-4b19-82dd-55575d8daf7a","url":"/test-resources/sap/ca/ui/demokit/sample/FileUpload/test.txt","size":Formatter.format(4645)},
          { "mimeType": 'image/jpg', "contributor":"Susan Baker","uploaded": sDate,"filename":"Screenshot.jpg","documentId":"ef1d600d-5d2f-4b19-82dd-55575d8daf7b","url":"/test-resources/sap/ca/ui/demokit/sample/FileUpload/test.txt","size":Formatter.format(47674)},
          { "mimeType": 'application/vnd.ms-powerpoint', "contributor":"Sean O'Connel","uploaded": sDate,"filename":"Third Quarter Results.ppt","documentId":"ef1d600d-5d2f-4b19-82dd-55575d8daf7c","url":"/test-resources/sap/ca/ui/demokit/sample/FileUpload/test.txt","size":Formatter.format(445643)},
          { "mimeType": 'application/msword', "contributor":"Jane Burns","uploaded": sDate,"filename":"Business Plan.doc","documentId":"ef1d600d-5d2f-4b19-82dd-55575d8daf7d","url":"/test-resources/sap/ca/ui/demokit/sample/FileUpload/test.txt","size":Formatter.format(874)},
          { "mimeType": 'application/pdf', "contributor":"David Keane","uploaded": sDate,"filename":"Instructions.pdf","documentId":"ef1d600d-5d2f-4b19-82dd-55575d8daf7e","url":"/test-resources/sap/ca/ui/demokit/sample/FileUpload/test.txt","size":Formatter.format(46786)}

        ] };

      var mockDataModel = new sap.ui.model.json.JSONModel(mockData);
      oFileUpload.setModel(mockDataModel);

    },

    /* handle on delete file event */
    onDeleteFile : function(oEventData) {
      this.byId("fileupload").removeFile(oEventData.mParameters.documentId);
    },

    /* handle on rename file event */
    onRenameFile : function(oEventData) {

      //store the file details to be updated [oEventData.mParameters.newFilename]
    },

    /* handle on upload file event */
    onUploadFile : function(oEventData) {
      //get the response data and format it as required by the control.
      //in this case, the response is already formatted so we just send it back to the control.
      var oData = oEventData.getParameters();
      this.byId("fileupload").commitFileUpload(oData);
    },

    /* (optional) you may handle the onBeforeUploadFile event if you wish. e.g. to set custom headers if your implementation requires it */
    onBeforeUploadFile : function(e) {
      this.byId("fileupload").setCustomHeader('slug', e.getParameters().name);
    },

    /* handle file upload failed event */
    onFileUploadFailed : function(e) {
      sap.ca.ui.message.showMessageBox({
        type: sap.ca.ui.message.Type.ERROR,
        message: e.getParameters().exception.message
      });
    },

    /*  handle the save button click event*/
    onSaveClicked: function () {
      //save to server here and determine success
      var success = true;
      var fileUploadControl = this.byId("fileupload");

      //artifical pause for save mimic
      //this is where an app would save the file
      setTimeout(jQuery.proxy(function () {
        if (success) {
          fileUploadControl.commitPendingRenames();
        } else {
          fileUploadControl.abandonPendingRenames();
        }

      }, this), 3000); //after 3 seconds assume success
    },

    /*  handle the cancel button click event*/
    onCancelClicked: function () {
      //handle if required
    }



  });

}.call(this))
