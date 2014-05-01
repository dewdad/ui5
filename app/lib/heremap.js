// PART 1: define the new GoogleMap Control type
var heremap_resource = 'app.lib.heremap';
$.sap.declare(heremap_resource);
//$.sap.require(heremap_resource+'Config')

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
    },
    addClusteredData: function(){ return this._map.addClusteredData.apply(this._map,arguments)}
});

// **CONFIG** This closure holds all the constants for async bootstrapping of Here maps and additional extensions.
(function (exports, ctx) {
    var global = exports;
    function authenticate(settings) {
        // Add your own appId and token here
        // sign in and register on http://developer.here.com
        // and obtain your own developer's API key
        nokia.Settings.set('app_id', settings.appId);
        nokia.Settings.set('app_code', settings.appCode);

        // Use staging environment (remove the line for production environment)
        nokia.Settings.set('serviceMode', 'cit');
        // The language of the map can be changed here.
        nokia.Settings.set('defaultLanguage', settings.language);
    }

    function hereMapLoaderCallback(callback) {
        var cb = callback;
        // TODO: support async feature loading through ui5 c'tor
        var fmatrix = nokia.Features.getFeaturesFromMatrix(['maps','datarendering']);

        // This callback is run if the feature load was successful.
        function onApiFeaturesLoaded() {
            authenticate(HereMaps.config.AppIdAndToken);
            apiExt(); // apply Here maps extensions
            cb();
//                var map = createMap(HereMapsConstants.InitialLocation,
//                    document.getElementById('mapContainer'));
//                map.addListener('displayready', function () {
//                    afterHereMapLoad(map);
//                }, false);
        }
        // This callback is run if an error occurs during the feature loading
        function onApiFeaturesError(error) {
            //alert('Whoops! ' + error);
        }
        nokia.Features.load(
            fmatrix,
            onApiFeaturesLoaded,  // an callback when everything was successfully loaded
            onApiFeaturesError,   // an error callback
            null,    // Indicates that the current document applies
            false  //Indicates that loading should be asynchronous
        );

        /**
         * Extend the Here API's here
         */
        function apiExt(){
            /**
             *
             * @param aDataPoints
             * @param oSvg An object like {icon: [svg], color}
             */
            nokia.maps.map.Display.prototype.addClusteredData = function(aDataPoints,oSvg){
                var map = this, svgParser = new nokia.maps.gfx.SvgParser();
                var dataPoints = aDataPoints;
                var svg={}, removedFromMap = [], insertCounters = [];
                svg.icon = (oSvg && oSvg.icon) || ['<svg width=\'51\' height=\'51\' xmlns=\'http://www.w3.org/2000/svg\'>' +
                    '<circle stroke=\'#FFF\' fill=\'__MAINCOLOR__\' cx=\'25\' cy=\'25\' r=\'25\' stroke-width=\'2\'/>' +
                    '<circle stroke=\'#FFF\' fill=\'__MAINCOLOR__\' cx=\'25\' cy=\'25\' r=\'21\' stroke-width=\'2\'/>' +
                    '<circle stroke=\'#FFF\' fill=\'__MAINCOLOR__\' cx=\'25\' cy=\'25\' r=\'17\' stroke-width=\'2\'/>' +
                    '<text x=\'25\' y=\'29\' font-size=\'10pt\' font-family=\'arial\' font-weight=\'bold\' text-anchor=\'middle\' fill=\'#FFF\' textContent=\'__TEXTCONTENT__\'>__TEXT__</text>' +
                    '</svg>',
                        '<svg width=\'47\' height=\'47\' xmlns=\'http://www.w3.org/2000/svg\'>' +
                        '<circle stroke=\'#FFF\' fill=\'__MAINCOLOR__\' cx=\'23\' cy=\'23\' r=\'23\' stroke-width=\'2\'/>' +
                        '<circle stroke=\'#FFF\' fill=\'__MAINCOLOR__\' cx=\'23\' cy=\'23\' r=\'19\' stroke-width=\'2\'/>' +
                        '<circle stroke=\'#FFF\' fill=\'__MAINCOLOR__\' cx=\'23\' cy=\'23\' r=\'15\' stroke-width=\'2\'/>' +
                        '<text x=\'23\' y=\'27\' font-size=\'10pt\' font-family=\'arial\' font-weight=\'bold\' text-anchor=\'middle\' fill=\'#FFF\' textContent=\'__TEXTCONTENT__\'>__TEXT__</text>' +
                        '</svg>',
                        '<svg width=\'43\' height=\'43\' xmlns=\'http://www.w3.org/2000/svg\'>' +
                        '<circle stroke=\'#FFF\' fill=\'__MAINCOLOR__\' cx=\'21\' cy=\'21\' r=\'21\' stroke-width=\'2\'/>' +
                        '<circle stroke=\'#FFF\' fill=\'__MAINCOLOR__\' cx=\'21\' cy=\'21\' r=\'17\' stroke-width=\'2\'/>' +
                        '<circle stroke=\'#FFF\' fill=\'__MAINCOLOR__\' cx=\'21\' cy=\'21\' r=\'13\' stroke-width=\'2\'/>' +
                        '<text x=\'21\' y=\'25\' font-size=\'10pt\' font-family=\'arial\' font-weight=\'bold\' text-anchor=\'middle\' fill=\'#FFF\' textContent=\'__TEXTCONTENT__\'>__TEXT__</text>' +
                        '</svg>',
                        '<svg width=\'39\' height=\'39\' xmlns=\'http://www.w3.org/2000/svg\'>' +
                        '<circle stroke=\'#FFF\' fill=\'__MAINCOLOR__\' cx=\'19\' cy=\'19\' r=\'19\' stroke-width=\'2\'/>' +
                        '<circle stroke=\'#FFF\' fill=\'__MAINCOLOR__\' cx=\'19\' cy=\'19\' r=\'15\' stroke-width=\'2\'/>' +
                        '<circle stroke=\'#FFF\' fill=\'__MAINCOLOR__\' cx=\'19\' cy=\'19\' r=\'11\' stroke-width=\'2\'/>' +
                        '<text x=\'19\' y=\'23\' font-size=\'10pt\' font-family=\'arial\' font-weight=\'bold\' text-anchor=\'middle\' fill=\'#FFF\' textContent=\'__TEXTCONTENT__\'>__TEXT__</text>' +
                        '</svg>'];
                svg.colorStops = (oSvg && oSvg.colorStops) || {
                    '0': '#8A8A8A',    //Grey for 0-10
                    '10': '#CACA00', //Yellow for 11-50
                    '50': '#00CC00',  //Green for 51-100
                    '100': '#0000CC', //Blue for 101-200
                    '200': '#CC00CC',  //Purple for 201-500
                    '500': '#FF0000'   //Red for over 500
                };
                // this is the object that processes the clustering
                var svgTheme = {
                    // Add a SVG Marker for Clusters.
                    getClusterPresentation : function (dataPoints) {
                        dataPointsSize = dataPoints.getSize();
                        if (dataPointsSize > 0) {
                            var compositePointsSum=0, compositePointsCount=0;

                            for(var i=0; i<dataPointsSize; i++){
                                var currDataPoint = dataPoints.Cb[i];
                                if(!!currDataPoint.count){
                                    compositePointsCount++;
                                    compositePointsSum += currDataPoint.count;
                                }
                                if(!!currDataPoint.mapMarkers){
                                    map.objects.removeAll(currDataPoint.mapMarkers);
                                    currDataPoint.mapMarkers = null;
                                    removedFromMap[currDataPoint.id] = true;
                                }
                            }
                            dataPointsSize += compositePointsSum - compositePointsCount;

                            var markerIcon = createIcon(dataPointsSize);
                            return new nokia.maps.map.Marker(dataPoints.getBounds().getCenter(),
                                {
                                    icon: markerIcon,
                                    anchor: new nokia.maps.util.Point(25, 25)}
                            );
                        }
                    },
                    // Add a Standard Marker for Noise Points.
                    getNoisePresentation : function (dataPoint) {
                        //return new nokia.maps.map.StandardMarker([dataPoint.latitude, dataPoint.longitude]);
                        // TODO: this is a work around because the getNoisePresentation method can only return StandardMarker type as of v. nokiamapsapi-2.5.4-Oberon-20140128
                        if(!!dataPoint.mapMarkers && !!dataPoint.count && map.getZoom()>2) return;
                        var marker
                        if(!!dataPoint.count){
                            marker = new nokia.maps.map.Marker([dataPoint.latitude, dataPoint.longitude],
                                {
                                    id: dataPoint.id,
                                    icon: createIcon(dataPoint.count),
                                    anchor: new nokia.maps.util.Point(25, 25)
                                }
                            );
                        }else{
                            marker = /*!!dataPoint.count
                             ?*/ new nokia.maps.map.StandardMarker(
                                //new nokia.maps.geo.Coordinate(40.738728,-73.99236)
                                [dataPoint.latitude, dataPoint.longitude]
                            )
                                /*: new nokia.maps.map.Marker([dataPoint.latitude, dataPoint.longitude],
                                 {
                                 icon: createIcon(dataPoint.count),
                                 anchor: new nokia.maps.util.Point(25, 25)
                                 }
                                 )*/;
                        }
                        marker.data = dataPoint;
                        dataPoint.mapMarkers = dataPoint.mapMarkers || [];
                        dataPoint.mapMarkers.push(marker);

                        map.objects.add(marker);
                        insertCounters[dataPoint.id] = (insertCounters[dataPoint.id] || 0) +1;

                    }
                };
                var clusterProvider = new nokia.maps.clustering.ClusterProvider(map, {
                    eps: 16,
                    minPts: 1,
                    dataPoints: dataPoints,
                    theme : svgTheme
                });

                function createIcon (count) {
                    var digit = Math.min(3, 4 - Math.floor(Math.log(count) / Math.log(10)));
                    var color;

                    for (var i in svg.colorStops) {
                        if (count > i) {
                            color = svg.colorStops[i];
                        }
                    }

                    return new nokia.maps.gfx.GraphicsImage(svgParser.parseSvg(
                        svg.icon[digit]
                            .replace(/__TEXTCONTENT__/g, count)
                            .replace(/__TEXT__/g, count)
                            .replace(/__MAINCOLOR__/g, color)
                    ));
                }

                clusterProvider.cluster();
            }
        }
    }
    exports.HereMaps={
        config: {
            //  Set authentication token and appid
            //  WARNING: this is a demo-only key
            //
            // Add your own appId and token here
            // sign in and register on http://developer.here.com
            // and obtain your own developer's API key
            AppIdAndToken :{
                appId: 'DemoAppId01082013GAL',
                appCode: 'AJKnXv84fjrb0KIHawS0Tg',
                language: 'en-US',
                serviceMode: 'cit'
            },
            // Initial center and zoom level of the map
            InitialLocation : {
                longitude: 52.53,
                latitude:  13.39,
                zoomLevel: 14},

            JSLibs  :{
                // versioned URL to load the HERE maps API.
                // Check on:  http://developer.here.com/versions
                // to obtain the latest version.
                HereMapsUrl :'http://js.cit.api.here.com/se/2.5.4/jsl.js?blank=true',
                // versioned URL to load jQuery
                jQueryUrl : 'http://code.jquery.com/jquery-1.10.1.min.js',
                jQueryUIUrl: 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.9.2/jquery-ui.min.js'
            },
            NS : 'nokia'
        },
        loadHereMaps: function(callback){
            var cb = callback;
            if(!!global.nokia && !!global.nokia.maps){
                cb();
            }else{
                $.getScript(HereMaps.config.JSLibs.HereMapsUrl, function(){hereMapLoaderCallback(cb);});
            }
        }
    }
})(window, document);