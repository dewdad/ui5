$.sap.declare('ui');
$.sap.declare('mui');

(function(){
    var _defaults = function(config, defaults){
        return $.extend(defaults, (!!config && config.constructor === Object)? config: {});
    };
    var _textConfig = function(args, instance){
        var config = {};
        var color = (!!args && args.color) || args[1];

        if(typeof(args[0])==='string') config.text = args[0];

        if(args.constructor === Array) config.text = {parts:args};

        var controlSettings = $.isEmptyObject(config)? args[0]: config;

        if(typeof(instance)!=='undefined'){
            instance.applySettings(controlSettings);
            if(!!color){
                instance.addStyleClass('font-'+color);
            }

        }
        return controlSettings;
        //return config;
    };
    /**
     *
     * @param args This should be the 'arguments' reserved keyword
     * @param aggr (default: 'items')
     * @returns config object for container controls
     * @private
     */
    var _controlArrayConfig = function(args, instance){
        var config = {};
        var aggr = !!instance? Object.keys(instance.getMetadata().getAggregations())[0]: 'items';
        if(args[0] instanceof sap.ui.core.Control) config[aggr] = $.makeArray(args);
        if(args[0].constructor === Array) config[aggr] = args[0];

        var controlSettings = $.isEmptyObject(config)? args[0]: config;

        if(typeof(instance)!=='undefined') instance.applySettings(controlSettings);
        return controlSettings;
    };

    ui = {
        byId: function(id){
            var ids = id.split(' ');
            var n = ids.length;
            var toRet;
            if(n<2) toRet =  typeof(id)==='string'? sap.ui.getCore().byId(id): id;
            if(!toRet){
                var selector =
                    $.map(ids, function(val, i){
                        var isLast = i===(n-1);
                        return '[id'+(isLast?'$':'*')+'="'+(isLast?'--':'')+val+'"]';
                    }).join('');
                var dom = $(selector);
                var control = dom.length && dom.control();
                if(!!control && control.length<2) toRet = control[0];
            }
            return toRet;
        },
        toggleVisibility: function(){
            $.each(arguments, function( index, value ) {
                if(!!value.getVisible){
                    value.setVisible(!value.getVisible());
                }
            });
        },
        getDateInstance: function(sStyle){
            return sap.ui.core.format.DateFormat.getDateInstance( {style : (sStyle || "medium")} );
        },
        /**
         * @dependecies Date.prototype.getWeek
         * @param oDate
         */
        getWeek: function(oDate){
            oDate = oDate || new Date();
            return sap.ui.core.format.DateFormat.getDateInstance({pattern : "w"}).format(oDate);
        },
        weekday: function(iNumber, bAbbrev){
            var dayField = !!bAbbrev? 'aDaysAbbrev': 'aDaysWide';
            return ui.getDateInstance()[dayField][iNumber];
        },
        /**
         *
         * @param oView supports the sap.ui.view API completely, and adds support of singleton pattern by passing domId, and shortHand
         * </br>such as ui.view("path.to.viewResource"), which will create the view with the ID, the type defaults to JSview.
         * @param viewData pass an object to the view's updateView method, which does something and returns the view itself (optional)
         * @return {sap.ui.view}
         */
        view: function(oView, viewData){
            var viewObj= oView || {};
            var strArg = false;                                                                                                                                                                                                                                                                                                                                             
            if(typeof(oView) == 'string'){
                viewObj = {};
                viewObj.viewName = oView;
                strArg = true;
            }

            //viewObj.type = oView.type || sap.ui.core.mvc.ViewType.JS;
            $.extend(viewObj, {type: sap.ui.core.mvc.ViewType.JS, height:'100%'});

//             var vResource = sui.getViewResource();
//             if(!!vResource && !!viewObj.viewName && viewObj.viewName.search('^'+vResource)<0){
//                 viewObj.viewName = vResource+'.'+viewObj.viewName;
//             }
            // TODO: override sap.ui.registerLocalModule to assume view loading root

            if(strArg){
                viewObj.id = viewObj.viewName;// viewObj.viewName.replace(/\./g,'_');
            }

            if(!!viewObj.id){
                var oElement = sap.ui.getCore().getElementById(viewObj.id);
                if(!!oElement){
                    return (oElement.updateView && oElement.updateView(viewData)) || oElement;
                }
            }
            var oView, err;
            try{
                oView = sap.ui.view(viewObj)
            }catch(e){
                console.log(e);
                viewObj.type = 'XML';
                try{oView = sap.ui.view(viewObj);}
                catch(e){
                    console.log(e);
                }
            }
            
            console.log(viewObj);
            if(!!err && !oView) throw err;
            
            return (oView.updateView && viewData && oView.updateView(viewData)) || oView;
        },
        getModelData: function(src){
            return src.getModel().getProperty(src.getBindingContext().getPath());
        },
        getRootResourceName: function(){
            var ret = undefined;
            try {
                ret = Object.keys($("#sap-ui-bootstrap").data().sapUiResourceroots)[0];
            }catch(e){}
            return ret;
        }

    };

    //var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern: "dd/MM/yyyy HH:mm"}); //Returns a DateFormat instance for date and time
    //var oDateFormat = sap.ui.core.format.DateFormat.getInstance({pattern: "dd/MM/yyyy"}); //Returns a DateFormat instance for date
    //var oDateFormat = sap.ui.core.format.DateFormat.getTimeInstance({pattern: "HH:mm"}); //Returns a DateFormat instance for time

    var oIn = ui;
    // timezoneOffset is in hours convert to milliseconds
    var TZOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000;

    // SAPUI5 formatters
    oIn.dateFormat = function(config){
        return sap.ui.core.format.DateFormat.getDateInstance(config);//({pattern: pattern || "dd/MM/yyyy" });
    };

    oIn.timeFormat = function(config){
        config = $.extend({style: 'short'}, config || {});
        return sap.ui.core.format.DateFormat.getTimeInstance(config);//({pattern: pattern || "KK:mm:ss a"});
    };

    // format date and time to strings offsetting to GMT
    oIn.dateStr = function(oDate, config){
        var formatArgs = [new Date(oDate.getTime() + TZOffsetMs)];
        var formatObj = oIn.dateFormat(config);
        if(typeof(bUTC)==="boolean") formatArgs.push(bUTC);
        return formatObj.format.apply(formatObj,formatArgs);
    };
    oIn.timeStr = function(oTime, config, bUTC){
        var formatArgs = [new Date(oTime.ms + TZOffsetMs)];
        var formatObj = oIn.timeFormat(config);
        if(typeof(bUTC)==="boolean") formatArgs.push(bUTC);
        return formatObj.format.apply(formatObj,formatArgs);
    }  //11:00 AM
    //parse back the strings into date object back to Time Zone
//    var parsedDate = new Date(dateFormat.parse(dateStr).getTime() - TZOffsetMs); //1354665600000
//    var parsedTime = new Date(timeFormat.parse(timeStr).getTime() - TZOffsetMs); //39600000
    //Note to SAPUI5 developers DateFormat.format has a to UTC flag, DateFormat.parse could use a from UTC flag.


    mui={
        HSpacer: function(sSpace){
          return new sap.m.HBox({width: '100%', height:sSpace || '10px'});
        },
        Spacer: function(sSpace){
          return new sap.m.FlexBox({width:sSpace || '10px'});
        },
        Label: function(args, color){
            var instance = new sap.m.Label();
            var args = _textConfig(arguments,instance);

            return instance;
        },
        LabelBold: function(){
            return mui.Label.apply(null,arguments).setDesign(sap.m.LabelDesign.Bold);
        },
        Text: function(args){
            var instance = new sap.m.Text();
            var args = _textConfig(arguments,instance);

            return instance;
        },
        TextH1: function(){
            var instance = mui.Text.apply(null, arguments);
            return instance.addStyleClass('texth1');
        },
        TextH2: function(){
          var instance = mui.Text.apply(null, arguments);
          return instance.addStyleClass('texth2');
        },
        VBox: function(args){
            var args = _controlArrayConfig(arguments);
            return new sap.m.VBox(args);
        },
        HBox: function(args){
            var args = _controlArrayConfig(arguments);
            return new sap.m.HBox(args);
        },
        HBoxSpaced: function(){
            var instance = mui.HBox.apply(null,arguments);
            return instance.addStyleClass('HSpaced');
        },
        ScrollContainer: function(args){
            var instance = new sap.m.ScrollContainer();
            _controlArrayConfig(arguments, instance);
            return instance;
        }
    };
}())