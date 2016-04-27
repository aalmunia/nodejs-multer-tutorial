function MyTools() {
	if(!this instanceof MyTools) {
		return new MyTools();
	}
}

MyTools.prototype._acceptedMIMETypes = ["image/jpeg", "image/png", "image/gif", "text/plain"];

MyTools.prototype.getApplicationRoutes = function(oExpressApp) {
	var aRoutes = [];
	var iRoutes = 0;
	oExpressApp._router.stack.forEach(function(r){
  		if (r.route && r.route.path){ 
			var oRouteData = {
				route: r.route.path,
				method: (r.route.methods.hasOwnProperty('post')) ? 'POST' : 'GET'
			};
			aRoutes[iRoutes] = oRouteData;
			iRoutes++;
  		}
	});
	return aRoutes;
}

MyTools.prototype.extractBody = function(oExpressRequest) {
	var oBody = oExpressRequest.body;
	return oBody;
}

MyTools.prototype.extractHeaders = function(oExpressRequest) {
	var oHeaders = oExpressRequest.headers;
	return oHeaders;	
}

MyTools.prototype.extractFile = function(oExpressRequest) {
	var oFile = oExpressRequest.file;
	return oFile;
}

MyTools.prototype.extractAllFiles = function(oExpressRequest) {
	var aFiles = oExpressRequest.files;
	return aFiles;
}

MyTools.prototype.isAcceptedMimeType = function(oFile) {
	var sFileMimeType = oFile.mimetype;
	var bIsValid = false;
	for(var i = 0; i < this._acceptedMIMETypes.length; i++) {
		if(sFileMimeType === this._acceptedMIMETypes[i]) {
			bIsValid = true;
			break;
		}		
	}
	return bIsValid;
}

MyTools.prototype.writeJSONResponse = function(oResponse, oToWrite) {
    oResponse.setHeader('Content-Type', 'application/json');
    oResponse.write(JSON.stringify(oToWrite));
    oResponse.end();
}

MyTools.prototype.extractObjectProperties = function(oToExtractPropertiesFrom, withValues) {
    withValues = (withValues !== undefined) ? true : false;
    var aReturn = [];
    var iProps = 0;
    for(var prop in oToExtractPropertiesFrom) {
        aReturn[iProps] = prop;
        if(withValues) {
            aReturn[iProps].value = oToExtractPropertiesFrom[prop];
        }
        iProps++;
    }
    return aReturn;
}

module.exports = MyTools;
