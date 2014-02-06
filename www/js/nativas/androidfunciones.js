/**
 * androidfunciones.js funciones de appbasica para Android
 * 
 * 
 * @projectDescription     Libreria para la aplicación de appbasica.
 * @author Juan Luis Estevez juanlu@mosaico-web.com
 * @version 1.0
 * @copyright mosaico-web. 
 */

/**
 * Indica si el menu esta abierto ya
 * @type {Boolean|Boolean|Boolean}
 */
var menuAbierto = false;
/**
 * Indica si estas en la pagina de noticias
 * @type {Boolean|Boolean|Boolean}
 */
var leernoticias = false;

document.addEventListener("deviceready", inicioNativo, false);

/**
 * Estos eventos se disparan cuando se abre y se cierra el menu.
 */
$('.menu').live("panelopen", function() {
    menuAbierto = true;
});

$('.menu').live("panelclose", function() {
    menuAbierto = false;
});

$(document).on("pagebeforeshow", "#leeNoticias", function() {
    leernoticias = true;
});
$(document).on("pagebeforehide", "#leeNoticias", function() {
    leernoticias = false;
});
$(document).on("swiperight", "body", botonBackbuttoon);

/**
 * Inicio especifico para la plataforma
 * @return {Void}
 */
function inicioNativo() {
    console.log('entramos en inicio nativo');
    document.addEventListener("menubutton", muestraMenu, false);
    document.addEventListener("backbutton", botonBackbuttoon, false);
    try {
    informaCobertura(navigator.connection.type, iniciar);
    } catch(e){
        alert('error: ' + e);
        iniciar();
    }
}

/**
 * Asigna lo datos del dispositivo
 * @return {Void}
 */
function asignaEntorno() {
    try {
        dispositivo = device.uuid;
        plataforma = device.platform;
        modelo = device.model;
        versionSo = device.version;
    } catch (e) {
        dispositivo = "desconocido";
        plataforma = "desconocida";
        modelo = "desconocido";
        versionSo = "desconocida";
        alert('error: ' + e);
    }
}

/**
 * Controla el uso del boton atras
 * @return {Void}
 */
function botonBackbuttoon() {
    if (leernoticias) {
        window.history.back();
    } else if (menuAbierto) {
        salirApp();
    } else {
        muestraMenu();
    }
}

/**
 * Sale de la aplicación
 * @return {Void}
 */
function salirApp() {
    estadistica('salir app');
    navigator.app.exitApp();
}

/**
 * Abre contenido web en un navegador
 * @param {string} url dirección web a abrir
 * @return {void}
 */
function abreWeb(url) {
    var web = window.open(url, '_blank');
}

/**
 * muestra las alertas
 * @param {String} texto Texto de la notificación
 * @param {int} tipo Tipo de notificación
 * @param {Function} funcion función qque ejecuta tras la notificación
 * @param {String} titulo Titulo de la notificación
 * @return {Void}
 */
function notificaciones(texto, tipo, funcion, titulo) {
    switch (tipo) {
        case 0:
            navigator.notification.alert(texto, funcion, titulo);
            break;
    }
}

/**
 * Controla si hay conexión a internet
 * @return {Void}
 */
function hayCobertura() {
    informaCobertura(navigator.connection.type, null);
}

/**
 * Informa al usuario si hay cobertura y sale de la aplicación si no la hay
 * @param {String} tipoCobertura
 * @param {Function} hecho
 * @return {Void}
 */
function informaCobertura(tipoCobertura, hecho) {
    if (tipoCobertura === 'Connection.NONE' || tipoCobertura === 'Connection.UNKNOWN') {
        notificaciones('Actualmente no dispone de una conexion a internet, se cerrar la aplicaión', 0, salirApp, 'Error de conexión');
    }
    hecho();
}

/**
 * Causa una vibración en el dispositivo del tiempo estimado 
 * @param {int} tiempo de vibración en milisegundos
 * @return {undefined}
 */
function vibrar(tiempo) {
    navigator.notification.vibrate(tiempo);
}

function iniciarNotificacionesPush() {
    if (tienePush) {
        try {
            notificacionesPush = window.plugins.pushNotification;
            notificacionesPush.register(registroPushOk, registroPushError, {"senderID": idPush, "ecb": "notificaPush"});
        } catch (error) {
            console.log("error en el inicio de las notificaciones push " + error.message);
        }
    }
}

function registroPushOk(resultado) {
    console.log(resultado);
}

function registroPushError(error) {
    console.log(error);
}

function notificaPush(respuesta) {
    console.log(respuesta.event);
    switch (respuesta.event) {
        case 'registered':
            if (respuesta.regid.length > 0) {
                console.log(e.regID);
                alert("registrado en push " + e.regID);
                //TODO hay que añadir este 
            }
            break;
        case 'message':
            if (respuesta.foreground){
                var my_media = new Media("/android_asset/www/" + e.soundname);
                my_media.play();
            } else {   // otherwise we were launched because the user touched a notification in the notification tray.
                if (respuesta.coldstart){
                    
                }else{
                    
                }
            }
            alert(respuesta.payload.message + " / " + respuesta.payload.message);
            break;
        case 'error':
            alert('error: '+respuesta.msg);
            break;
    }

}