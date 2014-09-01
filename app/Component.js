(function () {
    jQuery.sap.declare("ui5app.Component");
    jQuery.sap.require("ui5app.MyRouter");

    sap.ui.core.UIComponent.extend("ui5app.Component", {
        metadata: {
            name : "TDG Demo App",
            version : "1.0",
            includes : [],
            dependencies : {
                libs : ["sap.m", "sap.ui.layout"],
                components : []
            },
            config : {
                viewType: "JS",
                resourceBundle : "i18n/messageBundle.properties",
                 serviceConfig : {
                     name : "Northwind",
                    //serviceUri : "/uilib-sample/proxy/http/services.odata.org/V2/(S(sapuidemotdg))/OData/OData.svc/"
                     serviceUri : "/V2/Northwind/Northwind.svc/"
                 }
            },

            rootView :{id: "app", viewName: "view.App", type: "JS"},

            routing: {
                config: {
                    routerClass : ui5app.MyRouter, // optional
                    viewType: "JS",
                    viewPath: "view",
                    targetControl: "AppContainer",
                    clearTarget: false,
                    transition: "slide",
                    targetAggregation: "pages"
                },
                routes: [
                    {
                        pattern: "",
                        name: "Home",
                        view: "Home",
                        viewType: "XML"
                        /*subroutes: [{
                            pattern : "{page}/:part:",
                            name : "Tab",
                            view : "Tab"
                        }]*/
                    },
                 /* {
                    pattern: "Product",
                    name: "Product",
                    view: "Product.Master"
                  },
                  {
                    pattern: "Product/{id}",
                    name: "Product.Detail",
                    view: "Product.Detail"
                  },*/

                    {
                        pattern: ":all*:",
                        name: "NotFound",
                        view: "NotFound"
                    }
                ]
            }
        },
        init: function () {
            var busy, endpoint, router;
            jQuery.sap.require("sap.m.routing.RouteMatchedHandler");
            sap.ui.core.UIComponent.prototype.init.apply(this, arguments);

            // Init Router
            /*this.routeHandler = new sap.m.routing.RouteMatchedHandler(this.getRouter());*/
            this.getRouter().initialize();

            var sServiceUrl = this.getConfig("serviceConfig.serviceUri");

            var bIsMocked = jQuery.sap.getUriParameters().get("responderOn") === "true";
            // start the mock server for the domain model
            if (bIsMocked) {
                jQuery.sap.require("sap.ui.app.MockServer");
                var oMockServer = new sap.ui.app.MockServer({
                    rootUri: sServiceUrl
                });
                oMockServer.simulate("model/metadata.xml", "model/");
                oMockServer.start();

                sap.m.MessageToast.show("Running in demo mode with mock data.", {
                    duration: 2000
                });
            }

            // oData endpoint init
            endpoint = sap.ui.model.odata.ODataModel(sServiceUrl, true);
            this.setModel(endpoint);

            // i18n model init
            var i18nModel = new sap.ui.model.resource.ResourceModel({
                bundleUrl : [this.getRootPath(), this.getConfig("resourceBundle")].join("/"),
                locale : sap.ui.getCore().getConfiguration().getLanguage()
            });
            this.setModel(i18nModel, "i18n");
            /*busy = new sap.m.BusyDialog({ // TODO: REFACTOR so if the control requesting the data can be referenced through the load dispatch then make it busy
                title: "Loading data"
            });
            endpoint.attachRequestSent(function () {
                return busy.open();
            });
            return endpoint.attachRequestCompleted(function () {
                return busy.close();
            });*/
        },
        getConfig: function(sPath){
          return getObjProperty(this.getMetadata().getConfig(), sPath);
        },
        getRootPath: function(){
            return jQuery.sap.getModulePath(this.getName());
        },
        getName: function(){
            var md = this.getMetadata();
            return md._sComponentName || md._sLibraryName;
        },
        destroy: function () {
            /*if (this.routeHandler) {
                this.routeHandler.destroy();
            }*/
            this.getRouter().destroy();
            return sap.ui.core.UIComponent.prototype.destroy.apply(this, arguments);
        }/*,
        createContent: function () {
            var view;
            view = sap.ui.view({
                id: "app",
                viewName: "view.App",
                type: "JS",
                viewData: {
                    component: this
                }
            });
            return view;
        }*/
    });

}).call(this);
