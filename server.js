/**
 * Módulo Express para poder atender peticiones HTTP de una forma mas sencilla
 **/
var express = require('express');

/**
 * Módulo 'Multer' para subir ficheros al servidor a través de HTTP
 **/
var multer = require('multer');

/**
 * Módulo 'Body-Parser' para obtener los parámetros de entrada independientemente del
 * formato en el que vengan, JSON, formulario, etc...
 **/
var bodyParser = require('body-parser');

/**
 * Módulo 'Tools' creado por nosotros, para tener ciertas funciones útiles en él
 **/
var ToolsLib = require('./tools.js');

/**
 * Módulo 'fs' (FileSystem), que permite tener acceso a funciones de manejo del sistema de
 * ficheros y directorios del servidor
 **/
var fs = require('fs');

/**
 * Instanciamos un nuevo objeto Express 4.
 **/
var oApp = express();

/**
 * Instanciamos un nuevo objeto de la librería de utilidades que hemos implementado.
 **/
var oTool = new ToolsLib();

/**
 * @TODO: Revisar tipos MIME antes de subir ficheros.
 * @TODO: Explicar como implementar una ruta de subir archivos + datos (JSON)
 * @TODO: Como listar un directorio en node.js, devolver estructura en JSON
 **/

/**
 * Indicamos con estas tres instrucciones que queremos recibir parámetros a través de:
 * JSON
 * Campos de formulario
 * Texto plano
 * De esa forma, todos los parámetros quedarán en Request.body
 **/
oApp.use(bodyParser.json());
oApp.use(bodyParser.urlencoded({ extended: true }));
oApp.use(bodyParser.text());

/**
 * Global, directorio en el que guardar la aplicación
 **/
var sFolderToSaveInto = '/tmp/tmpmulter/';

/**
 * Instanciamos un objeto de tipo multer.diskStorage
 * Debemos definir el comportamiento de los métodos
 * 'destination' y 'filename', que definen dónde se guarda
 * el fichero, y el nombre que tendrá una vez guardado
 **/
var oStorageNormal = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, sFolderToSaveInto);
    },
    filename: function(req, file, callback) {
        if (file.hasOwnProperty('originalname')) {
            callback(null, file.originalname);
        } else {
            callback('El fichero con nombre de campo ' + file.fieldname + ' está vacío, corrupto o no es válido');
        }
    }
});

/**
 * Instanciamos un objeto de tipo multer.diskStorage
 * A diferencia de los métodos 'destination' y 'filename' del 
 * anterior objeto configurado para subir ficheros, estamos
 * definiendo que cuando se use este tipo de almacenamiento solo 
 * se permitirán subir imágenes.
 */
var oStorageImages = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, sFolderToSaveInto);
    },
    filename: function(req, file, callback) {
        if (file.hasOwnProperty('originalname')) {
            if (oTool.isAcceptedMimeType(file)) {
                callback(null, file.originalname);
            } else {
                callback('El tipo MIME del fichero con nombre ' + file.originalname + ' es incorrecto.');
            }
        } else {
            callback('El fichero con nombre de campo ' + file.fieldname + ' está vacío, corrupto o no es válido');
        }
    }
});

/**
 * Objeto de multer que permite subir un fichero. Debe proveerse a través de un campo de formulario
 * con nombre file_to_upload. Puede ser de cualquier tipo, acorde a la configuración de oStorageNormal
 */
var oUploadOneFile = multer({ storage: oStorageNormal }).single('file_to_upload');

/**
 * Objeto de multer que permie subir múltiples ficheros. No se usa como componente de middleware, 
 * sino que se invoca, pasando un callback para la resolución de la subida de los archivos
 */
var oUploadSeveralFiles = multer({ storage: oStorageNormal }).any();

/**
 * Objeto de multer que permite subir una imagen. Debe proveerse a través de un campo de formulario,
 * con nombre 'image_to_upload'.
 */
var oUploadOneImage = multer({ storage: oStorageImages }).single('image_to_upload');
var oUploadSeveralImages = multer({ storage: oStorageImages }).any();

/**
 * Función que gestiona la subida de un archivo. Es el callback de las rutas en las que 
 * se usa un componente de middleware para subir un solo fichero
 */
function handleUploadOneFile(oRequest, oResponse) {
    var oFile = oRequest.file;
    if(oFile !== undefined) {
        var sFileName = oFile.originalname;
        oTool.writeJSONResponse(oResponse, {
            error: false,
            message: 'Fichero correctamente subido a ' + sFolderToSaveInto + sFileName
        });
    }
}

/**
 * Función que gestiona la subida de múltiples archivos. Es el callback de las rutas en las que se 
 * usa un componente de middleware para subir varios ficheros
 */
function handleUploadMultipleFiles(oRequest, oResponse) {
    var aFiles = oRequest.files;
    var aFilenames = [];
    if(aFiles !== undefined) {
        var iFiles = aFiles.length;
        for(var i = 0; i < iFiles; i++) {
            aFilenames[i] = sFolderToSaveInto + aFiles[i].originalname;
        }
        oTool.writeJSONResponse(oResponse, {
            error: false,
            filesUploaded: aFilenames
        });
    }
}

/**
 * Subimos el fichero realizando una llamada a oUploadOneFile
 */
oApp.post('/uploadFile', function(oRequest, oResponse) {
    // console.log(oUpl)
    console.log(oTool.extractObjectProperties(oUploadOneFile));
    console.log(oUploadOneFile.toString());
    oUploadOneFile(oRequest, oResponse, function(oError) {
        if (oError) {
            oTool.writeJSONResponse(oResponse, {
                error: true,
                error_object: oError
            });
        } else {
            oTool.writeJSONResponse(oResponse, {
                error: false
            });
        }
    });
});

/**
 * Subimos el fichero usando oUploadOneFile como componente de middleware
 */
oApp.post('/uploadFile_2', oUploadOneFile, handleUploadOneFile);

/**
 * Subimos la imagen realizando una llamada a oUploadOneImage
 */
oApp.post('/uploadImage', function(oRequest, oResponse) {    
     oUploadOneImage(oRequest, oResponse, function(oError) {
         if(oError) {
             oTool.writeJSONResponse(oResponse, {
                 error: true,
                 error_object: oError                 
             });
         } else {
             oTool.write(oResponse, {
                 error: false                 
             });
         }      
     });
});

/**
 * Subimos el archivo usando oUploadOneImage como componente de middleware
 */
oApp.post('/uploadImage_2', oUploadOneImage, handleUploadOneFile);

/**
 * Subimos los ficheros realizando una llamada a oUploadSeveralFiles
 */
oApp.post('/uploadSeveralFiles', function(oRequest, oResponse) {
    oUploadSeveralFiles(oRequest, oResponse, function(oError) {
        if(oError) {
            oTool.writeJSONResponse(oResponse, {
                error: true,
                error_object: oError                
            });
        } else {
            oTool.writeJSONResponse(oResponse, {
                error: false                
            });          
        }
    });  
});

/**
 * Subimos los ficheros usando oUploadAny como componente de middleware
 */
oApp.post('/uploadSeveralFiles_2', oUploadSeveralFiles, handleUploadMultipleFiles);

oApp.post('/uploadSeveralImages', function(oRequest, oResponse) {
    oUploadSeveralImages(oRequest, oResponse, function(oError) {
        if(oError) {
            oTool.writeJSONResponse(oResponse, {
                error: true,
                error_object: oError
            });            
        } else {
            oTool.writeJSONResponse(oResponse, {
                error: false                
            });
        }     
    });  
});

/**
 * Subimos las imáganes usando oUploadAnyImages como componente de middleware
 */
oApp.post('/uploadSeveralImages_2', oUploadSeveralImages, handleUploadMultipleFiles);

/**
 * Iniciamos la aplicación en el puerto 9021, al iniciarse, nos
 * informará de las rutas que tiene accesibles, escribiéndolas en la consola 
 */
oApp.listen(9021, function() {
    console.log('Escuchando en puerto 9021, rutas accesibles: ');
    var aRoutes = oTool.getApplicationRoutes(oApp);
    console.log(aRoutes);
});
