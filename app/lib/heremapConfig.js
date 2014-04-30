// This file holds all the constants used in the Demos.
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
        var fmatrix = nokia.Features.getFeaturesFromMatrix(['maps']),

        // This callback is run if the feature load was successful.
            onApiFeaturesLoaded = function () {
                authenticate(HereMaps.config.AppIdAndToken);
                cb();
//                var map = createMap(HereMapsConstants.InitialLocation,
//                    document.getElementById('mapContainer'));
//                map.addListener('displayready', function () {
//                    afterHereMapLoad(map);
//                }, false);
            },
        // This callback is run if an error occurs during the feature loading
            onApiFeaturesError = function (error) {
                //alert('Whoops! ' + error);
            };
        nokia.Features.load(
            fmatrix,
            onApiFeaturesLoaded,  // an callback when everything was successfully loaded
            onApiFeaturesError,   // an error callback
            null,    // Indicates that the current document applies
            false  //Indicates that loading should be asynchronous
        );
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