sap.ui.model.json.JSONModel.extend("sap.uiext.model.json.JSONModel", {

    validateInput: function(notify){
        if(!isEmpty(getFromObjPath(this, 'validation_errors'))){
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
        delFromObjPath(this.getData(),sPath,'/');
        this.checkUpdate();
        var delPathArr = sPath.split('/');
        var changedPath = delPathArr.slice(0,delPathArr.length-1).join('/');
        this.fireEvent('propertyChange', {sPath:changedPath, oValue:null, oContext:'/', bindPath:changedPath});
    },
    renderer : {} // an empty renderer by convention inherits the parent renderer
});