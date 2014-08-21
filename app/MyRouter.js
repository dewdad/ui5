jQuery.sap.require("sap.m.routing.RouteMatchedHandler");
jQuery.sap.require("sap.ui.core.routing.Router");
jQuery.sap.declare("ui5app.MyRouter");

sap.ui.core.routing.Router.extend("ui5app.MyRouter", {

    constructor: function () {
        sap.ui.core.routing.Router.apply(this, arguments);
        this._oRouteMatchedHandler = new sap.m.routing.RouteMatchedHandler(this);

        var that = this;
        var fn = this._oRouter._getMatchedRoutes;
        $.each(this._oRouter._routes, function(){
            if(/all\*/.test(this._pattern)){
                that._catchAllRoute = this;
            }
        });

        this._oRouter._getMatchedRoutes = function(sHash){
            var routes = fn.apply(this, arguments);
            if(routes.length && routes.length>1){
                var carIndex = arrayFindByKey(routes, 'route', that._catchAllRoute).index;
                routes.splice(carIndex,1);
            }else if(routes[0].route === that._catchAllRoute){
                if(that.processConventionHashRoute(sHash)) return this._getMatchedRoutes.apply(this, arguments);
            }
            console.debug({sHash:sHash, routes: routes});
            return routes;
        };

        /*this.attachRouteMatched(function(){ // happen after rout view is loaded
         debugger;
         });*/
    },

    navTo: function (sName, oParameters, bReplace) {
        // Here is the routing entry point for programmatic navigation (for lack of finding a better one).
        // Check for a name in this._oRoutes object. If it does not exist, try to create a view. On successful view creation
        // build a route with the view
        var RouteName;
        var hash = this.oHashChanger.getHash();
        if (!this._oRoutes[sName]) {
          RouteName = this.processConventionNavRoute(sName, oParameters);
        }
        console.debug('MyRouter.navTo', {hash: hash, arguments: arguments});
        return sap.ui.core.routing.Router.prototype.navTo.call(this, RouteName || sName, oParameters, bReplace || false);
    },

    getHashPath: function(sHash){
        var hashParts = [];
        $.each(sHash.split('/'), function(i,v){ return !isNumeric(v) && hashParts.push(v);})
        return hashParts.join('/');
    },

    // TODO: make this code sane and try to merge conventionRoute creation from nav and hash events
    processConventionHashRoute: function(sHash){
        var currPath = this.getHashPath(sHash);

        var oView;

        var hash = hasher.getHash();
        //var VCdir = hash || sName;
        //var newHash = hash === sName? '': hash;
        var hashParts = hash && hash.split('/') || [];
        var hashPartsLen = hashParts.length || 0;
        var conventionViewFiles = hashPartsLen>1? ['Detail']: ['Main','Master','Page','v'];

        var viewOpt = {viewPath: currPath, fileName: sName, viewName: '', viewType: ''};

        if(oView = this.addConventionView(viewOpt, conventionViewFiles)) {

            var routePattern = currPath + (
                (hashPartsLen > 1 ? '/{id}' : '')
                );
            var sName = !!currPath && currPath.split('/').concat(sName).join('.') || sName;

            this.addConventionRoute(sName, routePattern, viewOpt.viewName, viewOpt.viewType);
        }

        return !!oView && sName;
    },
    processConventionNavRoute: function(sName, oParameters){
        
        if(!!this._oRoutes[sName]){
            return;
        }

        var oView;

        var hash = hasher.getHash();
        var currPath = this.getHashPath(hash);//trim(hash, '/\\d');
        var VCdir = hash || sName;
        var newHash = hash === sName? '': hash;
        var hashParts = newHash && newHash.split('/') || [];
        var hashPartsLen = hashParts.length || 0;
        var conventionViewFiles = hashPartsLen>0? ['Detail']: ['Main','Master','Page','v'];

        var viewOpt = {viewPath: VCdir, fileName: sName, viewName: '', viewType: ''};

        if(oView = this.addConventionView(viewOpt, conventionViewFiles)) {

            var routePattern = VCdir + (
                /*(hashPartsLen > 1 ? '/{id}' : '') || */(oParameters && oParameters.id && '/{id}' || '')
                );
            var sName = !!currPath && currPath.split('/').concat(sName).join('.') || sName;

            this.addConventionRoute(sName, routePattern, viewOpt.viewName, viewOpt.viewType);
        }

        return !!oView && sName;
    },

    /**
     * The viewType and viewName members of viewOpt are for return value
     * @param {object} viewOpt The view options object
     * @param {string} viewOpt.viewPath the url path to the view to be loaded
     * @param {string} viewOpt.fileName the view file name
     * @param {string} viewOpt.viewName the generated viewName for the application, will use a dynamically added resource
     * @param {string} viewOpt.viewType the type of the generated view
     * @public
     * @param fileNames {string[]} file names to be iterated over when trying to create the view
     * @return {sap.ui.core.mvc.View} Either the view or undefined if no view was created
     */
    addConventionView: function(viewOpt, fileNames){
        var viewResource = viewOpt.viewPath.replace('/','.');
        var that = this;
        var viewResourcePath = $.sap.getResourcePath(this._oConfig.viewPath);
        var conventionResourcePath = viewResourcePath + '/' + viewOpt.viewPath;
        $.sap.registerResourcePath(viewResource, conventionResourcePath);
        //this.setView(viewName, ui.view(viewName));

        // Iterate over possible main view names
        // try to load view
        $.each(fileNames, function(){
            viewOpt.viewName = viewOpt.viewPath+'.'+this;

            if (that._oOwner) {
                sap.ui.base.ManagedObject.runWithOwner(function() {
                    oView = ui.view(viewOpt.viewName);
                    console.debug('oview ran with owner', oView);
                }, that._oOwner);
            } else {
                oView = ui.view(viewName);
            }
            console.debug('checking oView value before route creation', oView);
            if(oView){
                that.setView(viewOpt.viewName, oView);
                viewOpt.viewType = ui.getViewType(oView);
                return false;
            }
        });
        console.debug(oView);
        if(!oView){

            console.error("The route requested could not be formed via convention." +
                " The path, "+conventionResourcePath+", either does not exist, or does not contain any of the following files: "+ fileNames.join('.view.(xml/js), ')+'view.(xml/js).')
            return undefined;
        }
        return oView;
    },

    addConventionRoute: function(routeName, routePattern, viewName, viewType){
        this._oRouter.greedy = true;
        this.addRoute({
            pattern: routePattern,
            name: routeName,
            view: viewName,
            viewType: viewType
        });

        console.debug('added dynamic route', this._oRoutes);
        var routesIndex = this._oRouter._routes.length;
        var route;

        while(route = this._oRouter._routes.length[--routesIndex]){
            if(route._pattern === sName){
                route._priority = 1;
                break;
            }
        }
    },

    /**
     * Returns a cached view for a given name or creates it if it does not yet exists
     *
     * @param {string} sViewName Name of the view
     * @param {string} sViewType Type of the view
     * @param {string} sViewId Optional view id
     * @return {sap.ui.core.mvc.View} the view instance
     * @public
     * @name sap.ui.core.routing.Router#getView
     * @function
     */
    getView: function (sViewName, sViewType, sViewId) {
        // Here is the routing entry for a HashChange
        // TODO: chech hash for view by convention. If view exists create a simple route and navTo it. Make use of
        // conventional dir structure that distinguishes view by feature and have the convention route load the main/master view
        var hash = this.oHashChanger.getHash();

      // When coventional routing occurs then the view instance is cached in the router, so we check for a
      // cached version without viewPath before we continue to normal view loading
      if(!this._oViews[sViewName]) {
        var altViewName = sViewName.replace(this._oConfig.viewPath + '.', '');
        sViewName = !!this._oViews[altViewName]? altViewName: sViewName;
      }
      
      var oView = sap.ui.core.routing.Router.prototype.getView.apply(this, arguments);
      
      console.debug('MyRouter.getView',arguments, oView);

      return oView;
    },

    myNavBack: function (sRoute, mData) {
        var oHistory = sap.ui.core.routing.History.getInstance();
        var sPreviousHash = oHistory.getPreviousHash();

        //The history contains a previous entry
        if (sPreviousHash !== undefined) {
            window.history.go(-1);
        } else {
            var bReplace = true; // otherwise we go backwards with a forward history
            this.navTo(sRoute, mData, bReplace);
        }
    },

    /**
     * Changes the view without changing the hash
     *
     * @param {object} oOptions must have the following properties
     * <ul>
     *    <li> currentView : the view you start the navigation from.</li>
     *    <li> targetViewName : the fully qualified name of the view you want to navigate to.</li>
     *    <li> targetViewType : the viewtype eg: XML</li>
     *    <li> isMaster : default is false, true if the view should be put in the master</li>
     *    <li> transition : default is "show", the navigation transition</li>
     *    <li> data : the data passed to the navContainers livecycle events</li>
     * </ul>
     * @public
     */
    myNavToWithoutHash: function (oOptions) {
        var oSplitApp = this._findSplitApp(oOptions.currentView);

        // Load view, add it to the page aggregation, and navigate to it
        var oView = this.getView(oOptions.targetViewName, oOptions.targetViewType);
        oSplitApp.addPage(oView, oOptions.isMaster);
        oSplitApp.to(oView.getId(), oOptions.transition || "show", oOptions.data);
    },

    backWithoutHash: function (oCurrentView, bIsMaster) {
        var sBackMethod = bIsMaster ? "backMaster" : "backDetail";
        this._findSplitApp(oCurrentView)[sBackMethod]();
    },

    destroy: function () {
        sap.ui.core.routing.Router.prototype.destroy.apply(this, arguments);
        this._oRouteMatchedHandler.destroy();
    },

    _findSplitApp: function (oControl) {
        sAncestorControlName = "idAppControl";

        if (oControl instanceof sap.ui.core.mvc.View && oControl.byId(sAncestorControlName)) {
            return oControl.byId(sAncestorControlName);
        }

        return oControl.getParent() ? this._findSplitApp(oControl.getParent(), sAncestorControlName) : null;
    }

});
