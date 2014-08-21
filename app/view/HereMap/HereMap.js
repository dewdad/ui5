var heremap_ns = 'HereMap.HereMap';
$.sap.declare(heremap_ns);

sap.ui.core.Control.extend(heremap_ns, {
    metadata : {
        properties : {          // setter and getter are created behind the scenes, incl. data binding and type validation
            latitude: {type : "float", defaultValue: 25.309292795217956},
            longitude: {type : "float", defaultValue: -27.319959104061127},
            zoomLevel: {type : "int", defaultValue: 2},
            minZoomLevel: {type : "int", defaultValue: 2},
            height: {type: "sap.ui.core.CSSSize", defaultValue: "100%"},
            width: {type: "sap.ui.core.CSSSize", defaultValue: "100%"},
            displayComponents: {type: "string[]", defaultValue: ["ZoomBar","Behavior"]}, // Components: ZoomBar,Behavior,InfoBubbles,TypeSelector,ContextMenu
            counterFields: {type: "string[]", defaultValue:[]}, // There are extra fields that will be summed for client clusters and placed on the marker
            clusterCounterField: {type: "string", defaultValue: "count"},
            displaySearch: {type: "boolean", defaultValue: false}
        },
        events: {
            "displayReady": {},
            "displayChangeEnd": {},
            "markerPress": {},
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
        this._displayComponents = {};
        //this._html = new sap.ui.core.HTML({content:"<div style='height:100%;width:100%;' id='" + this.getId()+"-map'></div>"});
    },
    renderer : function(oRm, oControl) {

        if(oControl.getDisplaySearch()){
            oRm.write('<div id="mapSearchBox"></div>');
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
            var componentsArr = that.getDisplayComponents();
            var components = $.map(componentsArr, function(v){return that._displayComponents[v] = new nokia.maps.map.component[v]();});

            // map display options
            var options = {
                zoomLevel:that.getZoomLevel(),
                minZoomLevel: that.getMinZoomLevel(),
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
                if(!!nokia.places && !!nokia.places.widgets){
                    HereMaps.addSearchStyles();
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
                }else{
                    $.sap.log.error("Attempted to include map search but Places API component was not loaded")
                }
            }


            //that._map.set("baseMapType", baseMapProvider);
            that._map.addListener('displayready', function (evt) {
                that.fireDisplayReady({map: that._map, hereEvt: evt});
            }, false);

            that._map.addListener('mapviewchange', function (evt) {
                if ((evt.data & evt.MAPVIEWCHANGE_CENTER) ||
                    (evt.data & evt.MAPVIEWCHANGE_SIZE) ||
                    (evt.data & evt.MAPVIEWCHANGE_ZOOM) ) {

                    that._hasViewportChanges = true;
                }
            });

            that._map.addListener('mapviewchangeend', function (evt) {
                if (!!that._hasViewportChanges) {
                    that._hasViewportChanges = undefined;

                    that.fireDisplayChangeEnd({map: that._map, hereEvt: evt});
                }
            });

            // TODO: Implement missing events from http://developer.here.com/javascript-apis/documentation/maps/topics_api_pub/nokia.maps.map.Display.html
        });
    },
    addClusteredData: function(aData, oSvg){
        return this._map.addClusteredData(aData,oSvg,this);
    },
    openBubble: function(sDescription, oCoordinate){
        if(isEmpty(oCoordinate)) return false;
        oCoordinate = (oCoordinate.longitude && oCoordinate)
            || getObjProperty(oCoordinate,'getParameters.hereEvt.target.coordinate')
            || getObjProperty(oCoordinate,'target.coordinate');
        this._displayComponents.InfoBubbles.openBubble(sDescription, oCoordinate);
    },
    getMarkerDataCounters: function(oMarker){
        return oCoordinate = oMarker.ui5DataCounters
            || getObjProperty(oMarker,'getParameters.hereEvt.target.ui5DataCounters')
            || getObjProperty(oMarker,'target.ui5DataCounters');
    }
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

            // Define CONSTANTS
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
            nokia.maps.map.Display.prototype.addClusteredData = function(aDataPoints,oSvg, ui5){
                var clusterCounterField = ui5.getClusterCounterField();
                var counterFields = ui5.getCounterFields();
                var map = this, svgParser = new nokia.maps.gfx.SvgParser();
                var svg={};
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

                function mapEvents(marker, data){
                    marker.addListener(
                        HereMaps.CLICK,
                        function (evt) {
                            ui5.fireMarkerPress({hereEvt: evt, data: data});
                        }
                    );
                    marker.addListener(
                        'mouseover',
                        function (evt) {
                            ui5.fireMarkerHover({hereEvt: evt, data: data});
                        }
                    );
                }

                // this is the object that processes the clustering
                var svgTheme = {
                    // Add a SVG Marker for Clusters.
                    getClusterPresentation : function (dataPoints) {
                        var counters = {};//keysArrayToObj(that.getCounterFields(), 0);
                        dataPointsSize = dataPoints.getSize();
                        if (dataPointsSize > 0) {
                            var compositePointsSum=0, compositePointsCount=0;

                            for(var i=0; i<dataPointsSize; i++){
                                var currDataPoint = dataPoints.getPoints()[i];
                                if(!!currDataPoint[clusterCounterField]){
                                    compositePointsCount++;
                                    compositePointsSum += currDataPoint[clusterCounterField];
                                }
                                // increment counterFields
                                for(var j=0, len=counterFields.length; j<len; j++){
                                    var key = counterFields[j];
                                    var count = currDataPoint[key];
                                    if(!!count) counters[key] = (counters[key] || 0) + count;
                                }
                            }
                            dataPointsSize += compositePointsSum - compositePointsCount;

                            var markerIcon = createIcon(dataPointsSize);
                            var marker = new nokia.maps.map.Marker(dataPoints.getBounds().getCenter(),
                                {
                                    icon: markerIcon,
                                    anchor: new nokia.maps.util.Point(25, 25),
                                    ui5DataCounters: counters
                                }
                            );

                            mapEvents(marker, dataPoints.getPoints());
                            return marker;
                        }
                    },
                    // Add a Standard Marker for Noise Points.
                    getNoisePresentation : function (dataPoint) {
                        var marker;
                        var counters = {};

                        for(var j=0, len=counterFields.length; j<len; j++){
                            var key = counterFields[j];
                            var count = dataPoint[key];
                            if(!!count) counters[key] = (counters[key] || 0) + count;
                        }

                        if(!!dataPoint[clusterCounterField] && dataPoint[clusterCounterField] > 1){
                            marker = new nokia.maps.map.Marker([dataPoint.latitude, dataPoint.longitude],
                                {
                                    //id: dataPoint.id,
                                    icon: createIcon(dataPoint[clusterCounterField]),
                                    anchor: new nokia.maps.util.Point(25, 25),
                                    ui5DataCounters: counters
                                }
                            );
                        }else{
                            marker = new nokia.maps.map.StandardMarker(
                                [dataPoint.latitude, dataPoint.longitude],
                                {ui5DataCounters: counters}
                            );
                        }

                        mapEvents(marker, dataPoint);

                        return marker;
                    }
                };

                if (!!this.clusterProvider) {
                    this.clusterProvider.clean();
                    this.clusterProvider.addAll(aDataPoints);
                } else {
                    this.clusterProvider = ncp = new nokia.maps.clustering.ClusterProvider(map, {
                        eps: 16,
                        minPts: 1,
                        dataPoints: aDataPoints,
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
                language: 'en-US'
				//serviceMode: 'cit'
            },
            // Initial center and zoom level of the map
            InitialLocation : {
                longitude: 52.53,
                latitude:  13.39,
                zoomLevel: 14},

            JSLibs  :{
                // versioned URL to load the HERE maps API.
                // Check on:  http://developer.here.com/versions
                //to obtain the latest version.
                //By default we add ?with=all to load every package available,
     			//it's better to change this parameter to your use case. 
 	    		//Options ?with=maps|positioning|places|placesdata|directions|datarendering|all
                HereMapsUrl : '//js.cit.api.here.com/se/2.5.4/jsl.js?with=places',
                // versioned URL to load jQuery
                jQueryUrl : 'http://code.jquery.com/jquery-1.10.1.min.js',
                jQueryUIUrl: 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.9.2/jquery-ui.min.js'
            },
            NS : 'nokia'
        },
        addSearchStyles: function(){
            $('head').append("<style>\
                .nokia-places-general-searchbox .nokia-searchbox-button {\
                text-indent: -9000px;\
                width: 34px;\
                position: absolute;\
                }\
                .nokia-places-general-searchbox .nokia-searchbox-input {\
                    width: 100%;\
                }\
                .nokia-places-general-searchbox .nokia-searchbox {\
                    margin: 0 auto;\
                }\
                .nokia-places-general-searchbox {\
                    width: 100%;\
                    position: absolute;\
                    top:  3%;\
                }\
                .nokia-searchbox-list {\
                    width: 107.5% !important;\
                }\
                </style>");
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