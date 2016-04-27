/**
 * Clase de métodos de utilidad para el tutorial
 */
function MyTools() {
	if(!this instanceof MyTools) {
		return new MyTools();
	}
}

/**
 * Tipos MIME aceptados para imágenes
 */
MyTools.prototype._acceptedMIMETypes = ["image/jpeg", "image/png", "image/gif", "text/plain"];

/**
 * Método que devuelve una estructura de datos en JSON con las rutas de la aplicación de Express
 * que estén definidas.
 * @param {Object} oExpressApp Un objeto de tipo aplicación Express
 * @return {Array} Un array de rutas de la aplicación Express
 */
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

/**
 * Método que extrae el cuerpo de una petición Express
 * @param {Object} oExpressRequest Un objeto de tipo Request de Express
 * @return {Object} El cuerpo de la petición
 */
MyTools.prototype.extractBody = function(oExpressRequest) {
	var oBody = oExpressRequest.body;
	return oBody;
}

/**
 * Método que extrae las cabeceras de una petición Express
 * @param {Object} oExpressRequest Un objeto de tipo Request de Express
 * @return {Object} El objeto con las cabeceras (hashmap)
 */
MyTools.prototype.extractHeaders = function(oExpressRequest) {
	var oHeaders = oExpressRequest.headers;
	return oHeaders;	
}

/**
 * Método que extrae el parámetro 'file' de una petición Express. Ese parámetro es el fichero que se 
 * está enviando para su subida al servidor. 
 * Existe si se configura Multer para la subida de un solo archivo
 * @param {Object} oExpressRequest Un objeto de tipo Request de Express
 * @return {Object} El fichero que se está subiendo con Multer
 */
MyTools.prototype.extractFile = function(oExpressRequest) {
	var oFile = oExpressRequest.file;
	return oFile;
}

/**
 * Método que extrae el parámetro 'files' de una petición Express. Ese parámetro es los ficheros que se 
 * están enviando para su subida al servidor.
 * Existe si se configurta Multer para subir N ficheros
 * @param {Object} oExpressRequest Un objeto de tipo Request de Express
 * @return {Array} El array de ficheros que se están subiendo con Multer
 */
MyTools.prototype.extractAllFiles = function(oExpressRequest) {
	var aFiles = oExpressRequest.files;
	return aFiles;
}

/**
 * Método que comprueba el tipo MIME de un fichero.
 * @param {Object} Un objeto de tipo file subido con Multer.
 * @return {Boolean} True / False, en función de si valida el tipo MIME
 */
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

/**
 * Método que encapsula la llamada a Response.write() + Response.end(), para 
 * contestar al cliente de una petición HTTP a una ruta de Express
 * @param {Object} oResponse El objeto de respuesta de la petición de Express
 */
MyTools.prototype.writeJSONResponse = function(oResponse, oToWrite) {
    oResponse.setHeader('Content-Type', 'application/json');
    oResponse.write(JSON.stringify(oToWrite));
    oResponse.end();
}

/**
 * Método que extrae las propiedades de un objeto.
 * @param {Object} oToExtractPropertiesFrom El objeto del que se quieren extraer las propiedades
 * @param {Boolean} withValues Un valor True / False que indica si además de los nombres de las propiedades
 * se quieren los valores de las mismas
 * @return {Array} Un array de nombres de campo, y valores, si procede.
 */
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
