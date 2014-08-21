/** 
* Controller. Handles all events of the view. 
*/ 
sap.ui.controller("HereMap.Master" , {
	
	/** 
	* Called when a controller is instantiated and its View controls (if available) are already created. 
	* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	* @memberOf app.view.page2
	*/ 
	   onInit: function() {
//			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
//			oRouter.attachRouteMatched(function(oEvt) {
//				if (oEvt.getParameter("name") === "page2") {
//					var sContextPath = "/" + oEvt.getParameter("arguments").context;
//					this.getView().bindElement(sContextPath);
//				}
//			}, this);
	   },
	
	/**		
	* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered	
	* (NOT before the first rendering! onInit() is used for that one!).	
	* @memberOf app.view.page2
	*/		
	//   onBeforeRendering: function() { 
	//		
	//   },	
	
	/**		
	* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here. 
	* This hook is the same one that SAPUI5 controls get after being rendered.	
	* @memberOf app.view.page2
	*/		
	//   onAfterRendering: function() {
	//		
	//   },		
	
	/**		
	* Called when the Controller is destroyed. Use this one to free resources and finalize activities.	
	* @memberOf app.view.page2
	*/		
	//   onExit: function() {	
	//		
	//   }

    onMapReady: function(evt) {
		console.log('map is ready');
        var map = evt.oSource;
        $.getJSON('model/counterpois.json', function(data){poiData = data; map.addClusteredData(data);});
        // load clustering before requesting the cluster feature //TODO: add clustering (datarendering) feature on request to ui5 map control addClusteredData
        /*nokia.Features.load(
            nokia.Features.getFeaturesFromMatrix(['maps','datarendering']),
            function(){$.getJSON('model/counterpois.json', $.proxy(map.addClusteredData, map));},
            null,
            false
        );*/
    },
    onMarkerPress: function(evt){
        console.log("HereMap markerPress", evt.getParameters());
    },
    onMarkerHover: function(evt){
        console.log("HereMap markerHover", evt.getParameters());
        var data = evt.getParameters().data;
        var htmlStr = '<div>' +
            '<h2>'+(data.text || "A Cluster")+'</h2>' +
            '<img width=120 height=90 src=' +
            '"http://developer.here.com/apiexplorer/examples/res/120px-Bodemuseum.jpg" ' +
            'alt=""/><br/><b>'+(data.id || '')+'</b>' +
            '<p><a href="' +
            'http://en.wikipedia.org/wiki/Museum_Island" target="_blank">' +
            'Check out info and photos on Wikipedia</a></p></div>'
		evt.oSource.openBubble(htmlStr, evt);
    }
	
});