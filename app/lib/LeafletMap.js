$.sap.includeStyleSheet('//cdn.leafletjs.com/leaflet-0.7.3/leaflet.css');
$.sap.includeScript('//cdn.leafletjs.com/leaflet-0.7.3/leaflet.js');


var leafletMap_ns = 'app.lib.LeafletMap';
$.sap.declare(heremap_ns);

sap.ui.core.Control.extend(leafletMap_ns, {
    metadata : {
        properties : {          // setter and getter are created behind the scenes, incl. data binding and type validation
            latitude: {type : "float", defaultValue: 25.309292795217956},
            longitude: {type : "float", defaultValue: -27.319959104061127},
            zoomLevel: {type : "int", defaultValue: 2},
            height: {type: "sap.ui.core.CSSSize", defaultValue: "100%"},
            width: {type: "sap.ui.core.CSSSize", defaultValue: "100%"},
            displayComponents: {type: "string", defaultValue: "ZoomBar,Behavior"},
            displaySearch: {type: "boolean", defaultValue: false}
        },
        events: {
            "displayReady": {},
            "markerClick": {},
            "markerHover": {}
        }
    },
    setLatitude: function(fValue){
        return this.setProperty('latitude', parseFloat(fValue));
    },
    setLongitude: function(fValue){
        return this.setProperty('longitude', parseFloat(fValue));
    },
    init: function(){
        //this._html = new sap.ui.core.HTML({content:"<div style='height:100%;width:100%;' id='" + this.getId()+"-map'></div>"});
    },
    renderer : function(oRm, oControl) {

        if(oControl.getDisplaySearch()){
            oRm.write("<div id='mapSearchBox'></div>");
        }

        oRm.write("<div ");
        oRm.writeControlData(oControl);
        oRm.write(['style="width:',oControl.getWidth(),'; height:', oControl.getHeight(),';" '].join(''));
        // TODO: this is the right way but doesn't work
        /*oRm.addStyle("width", oControl.getWidth());
         oRm.addStyle("height", oControl.getHeight());*/
        oRm.write(">");
        //oRm.renderControl(oControl._html);
        oRm.write("</div>");
    },
    onAfterRendering : function() {
        var that = this;
        //if (!this.initialized) {      // after the first rendering initialize the map
        var map = L.map('map').setView([that.getLatitude(),that.getLongitude()], that.getZoomLevel());
        L.tileLayer('//{s}.tiles.mapbox.com/v3/MapID/{z}/{x}/{y}.png', {
            //attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            maxZoom: 18
        }).addTo(map);
        return;
        HereMaps.loadHereMaps(function(){
            //that.initialized = true;

//                var baseMapProvider = new nokia.maps.map.provider.ImgTileProvider({
//                    label: "normal.day",
//                    descr: "Nokia Base Map tile provider",
//                    width: 256,
//                    height: 256,
//                    min: 3,
//                    max: 20,
//                    getUrl: function( level, row, col ) {
//                        // This uses the CIT server. Replace with LIVE when ready.
//                        return ['https://1.base.maps.cit.api.here.com/maptile/', '2.1',
//                            '/maptile/', 'newest', '/',
//                            'normal.day/', level, '/', col, '/', row, '/', '256',
//                            '/png?lg=EN',
//                            '&app_code=', HereMaps.config.AppIdAndToken.appCode,
//                            '&app_id=', HereMaps.config.AppIdAndToken.appId ].join('')
//                    }
//                });
            // build components array from string property
            var componentsArr = that.getDisplayComponents().replace(' ','').split(',');
            var components = $.map(componentsArr, function(v){return new nokia.maps.map.component[v]();});

            // map display options
            var options = {
                zoomLevel:that.getZoomLevel(),
                center: [that.getLatitude(),that.getLongitude()],
                components: components
                //,baseMapType: baseMapProvider
            };
            that._map = new nokia.maps.map.Display(
                $.sap.domById(that.getId()),
                options
            );

            //add Nokia SearchBox & make Map to be Nokia Place Widget
            if(that.getDisplaySearch()){
                that._mapPlaceWidget = new nokia.places.widgets.Place({
                    map: that._map
                });

                //create Nokia Map SearchBox
                that._mapSearchBox = new nokia.places.widgets.SearchBox({
                    targetNode: "mapSearchBox",
                    map: that._map,
                    onResults: function(data){
                        if(that._searchMarker){
                            that._map.objects.remove(that._searchMarker);
                        }
                        //that._mapPlaceWidget.setPlace({href: data.results.items[0].href});
                        var selectedPosition = data.results.items[0].position;
                        that._map.set("center",selectedPosition);
                        that._map.set('zoomLevel',12);

                        var marker = new nokia.maps.map.StandardMarker(selectedPosition);
                        that._map.objects.add(marker);
                        that._searchMarker = marker;
                    }
                });
            }


            //that._map.set("baseMapType", baseMapProvider);
            that._map.addListener('displayready', function (evt) {
                that.fireDisplayReady({map: that._map, mapEvent: evt});
            }, false);

            that._map.addListener('mapviewchange', function (evt) {
                if ((evt.data & evt.MAPVIEWCHANGE_CENTER) ||
                    (evt.data & evt.MAPVIEWCHANGE_SIZE) ||
                    (evt.data & evt.MAPVIEWCHANGE_ZOOM) ) {

                    that.hasViewportChanges = true;
                }
            });

            that._map.addListener('mapviewchangeend', function (evt) {
                if (!!that.hasViewportChanges) {
                    that.hasViewportChanges = undefined;

                    that.fireDisplayReady({map: that._map, mapEvent: evt});
                }
            });

            // TODO: Implement missing events from http://developer.here.com/javascript-apis/documentation/maps/topics_api_pub/nokia.maps.map.Display.html
        });
    },
    addClusteredData: function(){ return this._map.addClusteredData.apply(this,arguments)}
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

        (document.location.protocol == "https:") && nokia.Settings.set("secureConnection", "force");

        // Use staging environment (remove the line for production environment)
        //nokia.Settings.set('serviceMode', 'cit');
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
            // Add constants
            HereMaps.TOUCH = nokia.maps.dom.Page.browser.touch;
            HereMaps.CLICK = HereMaps.TOUCH ? "tap" : "click";
            cb();
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
                var map = this._map, svgParser = new nokia.maps.gfx.SvgParser();
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
                                var currDataPoint = dataPoints.getPoints()[i];
                                if(!!currDataPoint.count){
                                    compositePointsCount++;
                                    compositePointsSum += currDataPoint.count;
                                }
                            }
                            dataPointsSize += compositePointsSum - compositePointsCount;

                            var markerIcon = createIcon(dataPointsSize);
                            var marker = new nokia.maps.map.Marker(dataPoints.getBounds().getCenter(),
                                {
                                    icon: markerIcon,
                                    anchor: new nokia.maps.util.Point(25, 25)}
                            );
                            marker.addListener(
                                HereMaps.CLICK,
                                function(evt){

                                }
                            )
                            return marker;
                        }
                    },
                    // Add a Standard Marker for Noise Points.
                    getNoisePresentation : function (dataPoint) {
                        var marker;
                        if(!!dataPoint.count && dataPoint.count > 1){
                            marker = new nokia.maps.map.Marker([dataPoint.latitude, dataPoint.longitude],
                                {
                                    //id: dataPoint.id,
                                    icon: createIcon(dataPoint.count),
                                    anchor: new nokia.maps.util.Point(25, 25)
                                }
                            );
                        }else{
                            marker = new nokia.maps.map.StandardMarker(
                                [dataPoint.latitude, dataPoint.longitude]
                            );
                        }

                        return marker;
                    }
                };

                if (!!this.clusterProvider) {
                    this.clusterProvider.clean();
                    this.clusterProvider.addAll(dataPoints);
                } else {
                    this.clusterProvider = ncp = new nokia.maps.clustering.ClusterProvider(map, {
                        eps: 16,
                        minPts: 1,
                        dataPoints: dataPoints,
                        theme : svgTheme
                    });
                }

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

                this.clusterProvider.cluster();
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
                appId: 'ArdveUmqksehK7HLq6su',
                appCode: 'j-8OuRQ0uAq49hA161vEIA',
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
                HereMapsUrl : '//js.cit.api.here.com/se/2.5.4/jsl.js?with=places', //'//js.cit.api.here.com/ee/2.5.4/jsl.js?with=places',
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