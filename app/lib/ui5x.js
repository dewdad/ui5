console.log("ui5x.js is loaded");
jQuery.sap.require("sap.ui.core.Element");
jQuery.sap.require("sap.ui.model.Model");

/**!!!           Element            !!!**/
// Need to consult with SAPUI5 on how to make this sound with multi-bound elements, or multiple aggregations
sap.ui.core.Element.prototype.setPropertyFire = function(sPropertyName, oValue, bSuppressInvalidate){
    var toReturn = this.setPropertyFire(sPropertyName, oValue, bSuppressInvalidate);
    this.fireChange();
};

sap.ui.core.Element.prototype.getContextProperty =
sap.ui.core.Element.prototype.getBoundProperty = function(sPath){
    var context = this.getBindingContext();
    if(!!context){
        return context.oModel.getProperty(context.sPath+(!!sPath? ('/'+sPath): ''));
    }
    return undefined;
};

sap.ui.core.Element.prototype.x_AddUpdateRow = function(oData,sRowBindingPath, sIdProperty){
    var model = this.getModel();
    sIdProperty = sIdProperty || 'id';

    if(!!model){
        // If the RowBindingPath was not pass then extract from element binding info
        sRowBindingPath = sRowBindingPath || this.x_GetRowsBindingPath();
        return model.x_AddUpdateRow(oData, sRowBindingPath);
    }else{
        jQuery.sap.log.error('Element must have a model to execute function "x_AddUpdateRow"');
    }
};

sap.ui.core.Element.prototype.x_SetData = function(oData,sPath, sModelName){
    var model = this.x_GetSetModel(sModelName);
    if(!!model){
        return model.x_SetData(oData, sPath || '');
    }else{
        jQuery.sap.log.error('Element must have a model to execute function "x_AddUpdateRow"');
    }
};

sap.ui.core.Element.prototype.x_GetSetModel  = function(modelName){
    if(!this.getModel(modelName)){
        var jsmodel = new sap.uiext.model.json.JSONModel();
        this.setModel(jsmodel, modelName);
    }
    return this.getModel();
};

sap.ui.core.Element.prototype.x_SetJSModel  = function(oData){
    var jsmodel = new sap.uiext.model.json.JSONModel(oData);
    jsmodel.setSizeLimit(500);
    this.setModel(jsmodel);
    return this;
};

sap.ui.core.Element.prototype.x_IfNotSetModel = function(oModel){
    if(!this.hasModel()) this.setModel(oModel);
};

/**
 * Takes a string path or Context object and deletes the branch by the given path in the element's model
 * @param {string | Context} context
 */
sap.ui.core.Element.prototype.x_ModelDeleteRow = function(context){
    context = sui.getBindingStr(context);
    if(isEmpty(context)){
        jQuery.sap.log.debug('A context argument must be passed for x_ModelDeleteRow to operate');
        return;
    }
    if(!!this.getModel().removeFrom)
        this.getModel().removeFrom(context);
};

sap.ui.core.Element.prototype.x_GetModelRows = function(){
    if(this.hasModel()){
        var rowsBindPath =  this.x_GetRowsBindingPath(),

            aggrObj = getFromObjPath(this.getModel().getData(), rowsBindPath, '/');
        if(isEmpty(aggrObj)) {
            var newArr = new Array();
            setToValue(this.getModel().getData(), newArr,rowsBindPath, '/');
            return newArr;
        }
        return aggrObj;
    }
    jQuery.sap.log.debug("Element must have model to use method x_GetModelRows");
    return false;
};

sap.ui.core.Element.prototype.x_GetModelRowByIndex = function(i){
    return this.x_GetModelRows()[i];
};

sap.ui.core.Element.prototype.x_BindAggregation = function(aggrgationName, sPath, oTemplate, oSorter, aFilters){
    var defaultAggr = aggrgationName ||this.x_GetRecordsAggregation();
    var path = sPath || ''; //sPath[0]!='/' && !this.getBindingContext()? '/'+sPath: sPath
    var bTemplate = oTemplate || this.x_GetBindingTemplate();
//	var bindInfo = {
//			path: sPath[0]!='/' && !this.getBindingContext()? '/'+sPath: sPath,
//					template: oTemplate || this.x_GetBindingTemplate()
//		};
    if(!!defaultAggr && !!bTemplate){
        this.bindAggregation(defaultAggr, path, bTemplate, oSorter, aFilters);
    }
};

sap.ui.core.Element.prototype.x_BindRecordsAggregation = function(sPath, oTemplate, oSorter, aFilters){
    var defaultAggr = this.x_GetRecordsAggregation();
    if(!!defaultAggr){
        this.x_BindAggregation(defaultAggr, sPath, oTemplate, oSorter, aFilters);
    }
};

sap.ui.core.Element.prototype.x_GetRecordsAggregation = function(){
    if(!!this.getRows)
        return "rows";
    else if(!!this.getItems)
        return "items";
    else if(!!this.getContent){
        return "content";
    }
    else{
        jQuery.sap.log.debug('The element has no records binding aggregation.');
        return null;
    }
};

sap.ui.core.Element.prototype.x_GetRecordsBindingPath = function(){
    return this.getBindingPath(this.x_GetRecordsAggregation());
};

sap.ui.core.Element.prototype.getBindingSizeLimit = function(){
    // defaulted to one hundred as suggested by SAPUI5 team due to that being the default value
    // for the library's elements
    return this.getModel() && this.getModel().iSizeLimit || 100;
};

sap.ui.core.Element.prototype.x_isRecordBound = function(){
    return !isEmpty(this.getBindingPath(this.x_GetRecordsAggregation()));
};

sap.ui.core.Element.prototype.x_GetModelLastRow = function(){
    var mRows = this.x_GetModelRows(), mLastIndex = mRows.length-1;
    return mRows[mLastIndex];
};

sap.ui.core.Element.prototype.x_GetAggregatingParent = function(){
    var parent = this;
    while(parent !== this.getUIArea()){
        if(!isEmpty(parent.getBindingPath('rows')))
            return parent;
        parent = parent.getParent()
    }
    return false;
};

sap.ui.core.Element.prototype.x_GetRowsBindingPath = function(){
    var aggrParent = this.x_GetAggregatingParent(), bContext = aggrParent.getBindingContext(),
        rBPath = aggrParent.getBindingPath('rows'), patt = new RegExp(bContext);

    if(!!bContext && !patt.test(rBPath))
        return [bContext, rBPath].join('/');

    return rBPath;
};

sap.ui.core.Element.prototype.x_GetBindingTemplate = function(aggr){
    var aggr = aggr || this.x_GetRecordsAggregation();
    return getFromObjPath(this, 'mBindingInfos.'+aggr+'.template');
};

sap.ui.core.Element.prototype.x_SetBindingTemplate = function(oTemplate, aggregationName){
    var aggregationName = aggregationName || this.x_GetRecordsAggregation();
    //if(!!getObjProperty(this, 'mBindingInfos.'+aggregationName))
    //setToValue(this, oTemplate, 'mBindingInfos.'+aggregationName+'.template');
    //this.x_BindingTemplate = oTemplate
    this.x_BindAggregation(aggregationName, null, oTemplate);
};

sap.ui.core.Element.prototype.x_GetLabel = function(){
    return $('label[for='+this.getId()+']');
};

/**
 * returns the label text for this input
 * @return {string}
 */
sap.ui.core.Element.prototype.x_GetLabelText = function(){
    return this.x_GetLabel().text().replace(/^[\s:]+|[\s:]+$/g,''); // trim and "user:" becomes "user"
};

/**!!!           End Element            !!!**/

$.sap.require('sap.ui.model.odata.ODataListBinding');

/**
 * Adds support to the ODataListBinding type to search on OData service endpoints.
 * it does so by building a specialized filter that is later extracted before XHR open and replaced
 * with a valid logical contains statement chained by "or" operator.
 * @param aFields   An array of strings corresponding to the service entity fields to be included in the search
 * @param sQuery    The search term
 */
sap.ui.model.odata.ODataListBinding.prototype.x_search = function(aFields, sQuery){
    // Add support for search ONCE
    if(!sap.ui.model.odata.ODataListBinding.prototype.x_searchSupport){
        // Overriding filter on oBinding to check for the search filter before issuing a filter on the binding
        (function(filter){
            sap.ui.model.odata.ODataListBinding.prototype.filter = function(aFilters){
              if(!!this.x_searchFilter){
                  aFilters.push(this.x_searchFilter);
              }
              return filter.apply(this, arguments);
            };
        })(sap.ui.model.odata.ODataListBinding.prototype.filter);

        // Augmenting XHR open to serialize the special search filter from the binding's filter string
        (function() {
            var proxied = window.XMLHttpRequest.prototype.open;
            window.XMLHttpRequest.prototype.open = function() {
                if(arguments[1].search(/__SEARCHFILTER__/mg)>-1){
                    var matches = /__SEARCHFILTER__(.*?)__SEARCHFILTER__%20eq%20'?([a-z,A-Z,0-9, ,-,]+)'?/mgi.exec(arguments[1]);

                    // TODO: make sure there are fields listed in the special search filter
                    var filterColumns = $.map(matches[1].split('/'), function(v){
                        return "substringof('"+matches[2]+"',"+v+")";
                    });

                    var searchFilterStr = "("+filterColumns.join(" or ")+")";

                    arguments[1] = arguments[1].replace(matches[0], searchFilterStr);
                }
                return proxied.apply(this, [].slice.call(arguments));
            };
        })();
        sap.ui.model.odata.ODataListBinding.prototype.x_searchSupport = true;
    }

    var aFilters = this.aFilters;
    var aSorters = this.aSorters;
    
    // clear out the search filter
    aFilters = $.grep(aFilters, function(v){ if (v.sPath.search(/__/)<0) return true; });
    this.x_searchFilter= null;

    if(!!sQuery){ // add the special search filter to be serialized on xhr open
        this.x_searchFilter = new sap.ui.model.Filter('__SEARCHFILTER__'+aFields.join('/')+'__SEARCHFILTER__', 'EQ', sQuery);
    }
    
    this.sort(aSorters).filter(aFilters);
};

/**!!!          JSON Model              !!!**/

/**
 *
 * @param oData the data object to write to the model
 * @param sRowsBindPath the row binding path from the requesting UI element
 * @param sIdProperty the identifying property of the oData object
 * @return {int} number of rows in the row binding path
 */
sap.ui.model.Model.prototype.x_AddUpdateRow = function(oData, sRowsBindPath, sIdProperty){
    sIdProperty = sIdProperty || 'id';

    if(!sRowsBindPath){
        jQuery.sap.log.error('An sPath or sRowBindPath must be provided to model.x_AddUpdateRow"');
        return -1;
    }
    var modelRows = this.getProperty(sRowsBindPath), modelRowsLen;

    if(!modelRows){
        var mData={};
        setToValue(mData,[oData],sRowsBindPath, '/');
        this.setData(mData);
        modelRows = this.getProperty(sRowsBindPath);
    }

    modelRowsLen = modelRows.length;

    var objIndex = !!oData[sIdProperty]? indexOfKeyValue(modelRows, sIdProperty, oData[sIdProperty]): -1;
    //  if objIndex>-1 oData was found and this is an add operation, otherwise it is an update operation
    var sPath = sRowsBindPath + '/' + (objIndex>-1? objIndex: modelRowsLen);
    this.x_SetData(oData, sPath);
    // return row count
    return (objIndex>-1? modelRowsLen: modelRowsLen+1);
};

sap.ui.model.Model.prototype.x_SetData = function(dataObj,sPath){
    var oData = this.getData();
    var dataClone = clone(dataObj);

    if(!isEmpty(sPath))
        setProperty(oData, dataClone, sPath, '/'); // this provides mirroring where as the merge supplied by SUI5 only supplies updating
    else
        oData = dataClone;

    this.setData(oData);
    this.checkUpdate();
};

sap.ui.model.json.JSONModel.extend("sap.uiext.model.json.JSONModel", {

    validateInput: function(notify){
        if(!isEmpty(getObjProperty(this, 'validation_errors'))){
            if(!!notify){
                var messages = [];
                for(var errElem in this.validation_errors){
                    // TODO?: make inner loop to display messages for elements
                    messages.push(this.validation_errors[errElem].messages[0]);
                }
                if(!!sui) sui.input_validation.alert(messages);
            }
            return false;
        }
        return true;
    },
    /**
     *
     * @param sPath Absolute path inside the oData member of the model or the object passed through "oContext" param
     * @param oValue Value to write to sPath in the model object
     * @param oContext [optional]
     * @returns {*|void|sap.ui.base.ManagedObject|boolean|sap.uiext.model.json.JSONModel}
     */
    setProperty: function(sPath, oValue, oContext){
        var args = arguments;
        var context = oContext || this;
        var ret = this;
        sPath = !!sPath.getPath? sPath.getPath(): sPath; // fix to string if context object
//        if(!!oContext){
//            if(typeof(oContext) == 'string'){
//                sPath = oContext+'/'+sPath;
//                oContext = undefined;
//            }else{
//                if(/^\//.test(sPath)){
//                    sPath = sPath.substr(1, sPath.length);
//                }
//            }
//        }

        //if(!args[2]){ // if sPath does not prefix with '/' fix it
        if(!/^\//.test(sPath)){
            args[0] = '/'+args[0];
        }
        args = [sPath, oValue];
        //}

        // Create path if it does not exist
        propertyGetSet(parentPath(sPath), this.oData, '/');

        if(this.getProperty(sPath, oContext)!==oValue){ // TODO: a fix for combo update bindings introduced with SAPUI 1.6
            ret = sap.ui.model.json.JSONModel.prototype.setProperty.apply(this, args);
        }

//        if(!!oContext){
//            // TODO: migrate from string to object context from  SAPUI 1.4-1.6
//            var contextPath = sui.getBindingStr(oContext);
//        }
//        if(!contextPath){
//            var sPathParts = sPath.split('/');
//            var partsLen = sPathParts.length;
//            contextPath = (sPathParts.slice(0, partsLen-1)).join('/');
//            sPath = (sPathParts.slice(partsLen-1,partsLen))[0];
//        }

        this.fireEvent('propertyChange', {sPath:sPath, oValue:oValue, /*oContext:oContext, sContext:contextPath,*/ bindPath:/*!!contextPath? contextPath+'/'+sPath:*/ sPath});
        return ret;
    },
    /**
     * the path to the property
     * @param {String | Object} sPath
     * @param {String | Object} [oContext]
     * @return {Object}
     */
    getProperty: function(sPath, oContext){
        var args = arguments;
        sPath = !!sPath.getPath? sPath.getPath(): sPath; // fix to string if context object
        if(!!oContext && typeof(oContext) == 'string'){
            sPath = oContext+'/'+sPath;
            args = [sPath];
        }
        // prefix sPath with '/' to make absolute path
        if(!args[1] && args[0][0]!=='/'){
            args[0] = '/'+args[0];
        }
        return sap.ui.model.json.JSONModel.prototype.getProperty.apply(this, args);
    },
    setData: function(){
        sap.ui.model.json.JSONModel.prototype.setData.apply(this, arguments);
        this.fireEvent('propertyChange', {sPath:'', oValue:arguments[0], oContext:'/'});
    },
    /**
     * Creates a subset of the model which is a proxy of it, changes will not affect the original model
     * unless commitChanges as been called on the proxy
     */
    proxy: function(sPath){
        var proxiedValue = this.getProperty(sPath||'/');
        var proxyModel = new sap.uiext.model.json.JSONModel({data:clone(proxiedValue)});
        proxyModel._dataSource = {model: this, path: sPath || '/'};
        return proxyModel;
    },
    revert: function(){
        var dataSrc = this.getDataSource();
        var srcModel = dataSrc.model;
        if(!!srcModel){
            this.setProperty('data', clone(srcModel.getProperty(dataSrc.path)));
        }
    },
    getDataSource: function(){return this._dataSource || {model:undefined, path:undefined};},
    commitChanges: function(){

    },
    removeFrom: function(sPath){
        removeObjProperty(this.getData(),sPath,'/');
        this.checkUpdate();
        var delPathArr = sPath.split('/');
        var changedPath = delPathArr.slice(0,delPathArr.length-1).join('/');
        this.fireEvent('propertyChange', {sPath:changedPath, oValue:null, oContext:'/', bindPath:changedPath});
    },
    renderer : {} // an empty renderer by convention inherits the parent renderer
});
/**!!!           END JSON Model             !!!**/