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
            callback('El fichero está vacío, corrupto o no es válido');
        }
    }
});

var oStorageImages = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, sFolderToSaveInto);
    },
    filename: function(req, file, callback) {
        if (file.hasOwnProperty('originalname')) {
            if (oTool.isAcceptedMimeType(file)) {
                callback(null, file.originalname);
            } else {
                callback('El tipo MIME es incorrecto.');
            }
        } else {
            callback('El fichero está vacío, corrupto o no es válido');
        }
    }
});

/**
 * Instanciamos un objeto de almacenamiento Multer, con la 
 * configuración de oStorageNormal, para un solo fichero, con
 * nombre de campo 'new_file'
 **/
var oUploadOneFile = multer({ storage: oStorageNormal }).single('file_to_upload');
var oUploadAny = multer({ storage: oStorageNormal });

var oUploadOneImage = multer({ storage: oStorageImages }).single('image_to_upload');
var oUploadAnyImages = multer({ storage: oStorageImages });


oApp.post('/uploadFile', function(oRequest, oResponse) {        
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


oApp.post('/uploadFile_2', oUploadOneFile, function(oRequest, oResponse) {
    var oFile = oRequest.file;
    if(oFile !== undefined) {
        var sFileName = oFile.originalname;
        oTool.writeJSONResponse(oResponse, {
            error: false,
            message: 'Fichero correctamente subido a ' + sFolderToSaveInto + sFileName
        });
    }
});


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


oApp.post('/uploadImage_2', oUploadOneImage, function(oRequest, oResponse) {
    
});

oApp.post('/uploadSeveralFiles', function(oRequest, oResponse) {
    
});

oApp.post('/uploadSeveralFiles_2', oUploadAny.any(), function(oRequest, oResponse) {
    
});

oApp.post('/uploadSeveralImages', function(oRequest, oResponse) {
    
});

oApp.post('/uploadSeveralImages_2', oUploadAnyImages.any(), function(oRequest, oResponse) {
    
});


/**
 * Iniciamos la aplicación en el puerto 9021, al iniciarse, nos
 * informará de las rutas que tiene accesibles, escribiéndolas en la consola 
 */
oApp.listen(9021, function() {
    console.log('Escuchando en puerto 9021, rutas accesibles: ');
    var aRoutes = oTool.getApplicationRoutes(oApp);
    console.log(aRoutes);
});
