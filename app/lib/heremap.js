// PART 1: define the new GoogleMap Control type
var heremap_resource = 'app.lib.heremap';
$.sap.declare(heremap_resource);
$.sap.require(heremap_resource+'Config')

//$.sap.includeScript('http://js.cit.api.here.com/se/2.5.4/jsl.js?with=all');

sap.ui.core.Control.extend("app.lib.heremap", {
    metadata : {
        properties : {          // setter and getter are created behind the scenes, incl. data binding and type validation
            latitude: {type : "float", defaultValue: 25.309292795217956},
            longitude: {type : "float", defaultValue: -27.319959104061127},
            zoomLevel: {type : "integer", defaultValue: 2}
        },
        events: {
            "displayReady": {}
        }
    },
    init: function(){
        this._html = new sap.ui.core.HTML({content:"<div style='height:100%;width:100%;' id='" + this.getId()+"-map'></div>"});
    },
    renderer : function(oRm, oControl) {
        oRm.write("<div style='height:100%;width:100%;' ");
        oRm.writeControlData(oControl);  // writes the Control ID and enables event handling - important!
        oRm.write(">");
        oRm.renderControl(oControl._html);
        oRm.write("</div>");
    },
    onAfterRendering : function() {
        var that = this;
        if (!this.initialized) {      // after the first rendering initialize the map
            HereMaps.loadHereMaps(function(){
                that.initialized = true;
                var options = {
                    zoomLevel:that.getZoomLevel(),
                    center: [that.getLatitude(),that.getLongitude()],
                    components: [
                        // ZoomBar provides a UI to zoom the map in & out
                        new nokia.maps.map.component.ZoomBar(),
                        new nokia.maps.map.component.Behavior()
                    ]
                };
                that._map = new nokia.maps.map.Display(
                    $.sap.domById(that.getId()+"-map"),
                    options
                );
                that._map.addListener('displayready', function (evt) {
                    that.fireDisplayReady({map: that._map, mapEvent: evt});
                }, false);
                // TODO: Implement missing events from http://developer.here.com/javascript-apis/documentation/maps/topics_api_pub/nokia.maps.map.Display.html
            });
        } else {  // after subsequent rerenderings, the map needs to get the current values set
            this._map.setCenter(new nokia.maps.geo.Coordinate(this.getLatitude(),this.getLongitude()));
            this._map.setZoomLevel(this.getZoomLevel());
        }
    }
});


// PART 2: instantiate Control and place it onto the page

//var myMap = new my.GoogleMap({
//    latitude:49.3,
//    longitude:8.64
//}).placeAt("content");