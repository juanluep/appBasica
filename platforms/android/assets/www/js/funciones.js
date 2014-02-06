/**
 * funciones.js funciones de appbasica
 * 
 * @projectDescription     Libreria para la aplicación de appbasica.
 * @author Juan Luis Estevez juanlu@mosaico-web.com
 * @version 1.0
 * @copyright mosaico-web. 
 */

$(document).on("mobileinit", function() {
    $.mobile.defaultPageTransition = 'none';
    $.mobile.allowCrossDomainPages = true;
    jQuery.support.cors = true;
    console.log('entramosen mobilinit');
});
google.load("feeds", "1");
$(document).on("pageshow", "#dondeEstamos", creaMapa);
$(document).on("pagehide", "#leeNoticias", vaciaNoticia);
$(document).on("pageshow", "#verTwitter", creaListaTwitter);
$(document).on("pageshow", "#verFacebook", creaListaFacebook);
$(document).on("pageshow", "#quienesSomos", crearQuienesomos);
$(document).on("pageshow", "#contacta", cargaContacta);
$(document).on("pageshow", "#acercaDe", adaptaAcercaDe);
$(document).on("pageshow", "#leeNoticias", rellenaNoticia);

// Datos de la aplicacion
var titulo = "Del Blanco al Tinto";
var app = 3;
var urlServicio = "http://www.mosaico-web.com/app/servicioApp/servicio.php?";
var dispositivo;
var plataforma;
var modelo;
var versionSo;
var registrado = false;

//datos rss
var urlRss = ""; //Url del rss a leer
var numeroRss = 10; //numero de noticias
var contenidoRss; //varible que almecena el contenido rss

//Datos de la pagina noticias
var noticia;

//Datos quienes somos
var quienesSomosUrl = 'http://www.mosaico-web.com/app/servicioApp/servicio.php?accion=leerWeb&url=http://www.mosaico-web.com/delblancoaltinto/somos.html&callback=?'; // dirección de la pagina de quines somos
var selectroInicio = '<div class="foto">'; //Inicio de la captura de la página
var selectorFin = '</b> </div>'; //Final de la captura
var selectorTitulo = ".titulo"; // selector titulo de quienes somos, esn su pagina
var selectorContenido = ""; // selector del conetenido de quines somos.
var contenidoQuienesSomos;
var enIframe = true; //boleano que indica si la pagina se carga via ajax o via iframe.

//datos mapa
/**
 * array con la posiciones del mapa
 * @param {decimal} lat latitud del punto
 * @param {decimal} lon longitud del punto
 * @param {string} direcion dirección postal del punto
 * @param {sting} etiqueta texto del globo del mapa
 * @param {array} telefono es un array por si hay mas de uno
 * @param {string} titulo texto del telefono
 * @param {string} numero numero del telefono
 * @param {array} email es un array por si hay mas de un correo
 * @param {string} nombre texto del correo
 * @param {string} correo email.
 * */
var posicionesMapa = [
    {lat: 43.542722, lon: -5.665591, zoom: 18, direccion: '', etiqueta: '', telefono: ''},
    {lat: 43.542722, lon: -5.665591, zoom: 18, direccion: 'C/Linares Rivas, nº 18 - Barrio del Carmen - 33206 Gijón España', etiqueta: 'Del Blanco al Tinto', telefono: [{titulo: 'telefono1', numero: '984490342'}, {titulo: 'telefono2', numero: '636061353'}], email: [{nombre: 'email', correo: 'dbt@delblancoaltinto.es'}]}
];
var mapa; //contenedor de mapa
//Datos twitter
var nombreTwitter = "dbtgijon"; //usuario de twitter
var numeroTwitter = 10; //numero de twitter a mostrar 
var contenidoTwitter; //resultado de los twit

// datos facebook
var idFacebook = "1780880518/feed"; //Id de facebook 1780880518
var tokenFacebook = "637019456324890|roWhKM-0F85xNJSaGaOidnKKkBo"; //Token fijo de Facebook
var contenidoFacebook; //Objeto que almacena el contenido del facebbok
//Configuración de paginas, aqui se marca que paginas se ven y cuales no
/**
 * Objeto entrada de menu
 * @param {string} titulo Texto del titulo
 * @param {string} icono string del icono
 * @param {int} orden oden de muestra
 * @param {sting} enlace a que pagina enlaza
 * @param {boolean} visible si esta visible o no 
 * @param {boolean} marcado si esta marcado o no
 * @returns {entradaMenu} 
 */
var entradaMenu = [
    {titulo: "Quienes Somos", icono: "group", enlace: "quienesSomos", funcion: false, orden: 1, visible: true},
    {titulo: "Donde estamos", icono: "globe", enlace: "dondeEstamos", funcion: false, orden: 2, visible: true},
    {titulo: "Noticias", icono: "eye-open", enlace: "verNoticias", funcion: false, orden: 3, visible: false},
    {titulo: "Facebook", icono: "facebook", enlace: "verFacebook", funcion: false, orden: 4, visible: true},
    {titulo: "Twitter", icono: "twitter", enlace: "verTwitter", funcion: false, orden: 5, visible: true},
    {titulo: "Contacta", icono: "envelope", enlace: "contacta", funcion: false, orden: 6, visible: true},
    {titulo: "Acerca de", icono: "info", enlace: "acercaDe", funcion: false, orden: 7, visible: true},
    {titulo: "Salir", icono: "off", enlace: "salirApp", funcion: true, orden: 8, visible: true}
];


var barra; // tamaño de la barra superior
var pantalla; //tamaño de la pantalla.

//Datos de notificaciones push real
var tienePush = true; //indica si la aplicación tiene notificaciones o no
var notificacionesPush; //Objeto de notificaciones
var idPush = "963218987371-j4i03dqgdr3uhk9fjjha7cmcmpmgsoi0.apps.googleusercontent.com"; // String con el ide de la aplicación para hacer puhs

/**
 * Esta función se dispara desde las funciones nativas he inicia la plicación
 * @returns {Void}
 */
function iniciar() {
    console.log('entramos en iniciar');
    esperando();
    asignaEntorno();
    estadistica('inicio');
    // se crean lo menus
    $('.titulo').html(titulo);
    calculaResolucion();
    crearMenus();
    // se inicia la lecturas de feeds
    precargaQuienesSomos(true);
    //leeRss();
    leeTwitter();
    leeFacebook();
    adaptaMapa();
    //navigator.splashscreen.show();
    $.event.special.swipe.horizontalDistanceThreshold = 100;
    eventos();
    activaPush();
}

function eventos() {
    $('#dayudaAceptar').click(cierraAyuda);
    $('#dayudaNoMostrar').click(noMostrarAyuda);
}

function cierraAyuda() {
    $('#dAyuda').popup('close');
}

function noMostrarAyuda() {
    localStorage.setItem('noMostrarAyuda', true);
    cierraAyuda();
}

/**
 * Muestra el grafico de carga
 * @returns {Void}
 */
function esperando() {
    $.mobile.loading("show", {
        text: 'Cargando',
        textVisible: true,
        theme: 'b'
    });
}

/**
 * Oculta el gráfico de esperando
 * @returns {Void}
 */
function finEspera() {
    $.mobile.loading("hide");
}

/**
 * Envia estadisticas del uso de la aplicación
 * @param {string} queHace
 * @returns {Void}
 */
function estadistica(queHace) {
    var url;
    if (registrado) {
        url = urlServicio + "accion=estadistica&dispositivo=" + dispositivo + "&queHace=" + queHace + "&app=" + app + "&callback=?";
    } else {
        url = urlServicio + "accion=estadistica&dispositivo=" + dispositivo + "&plataforma=" + plataforma + "&modelo=" + modelo + "&versionSo=" + versionSo + "&queHace=" + queHace + "&app=" + app + "&callback=?";
    }
    $.getJSON(url, function(data) {
        if (data.resultado === "Ok") {
            if (!registrado)
                registrado = true;
        }
    });
}

/**
 * 
 * @returns {Void}
 */
function conectado() {
    var url
}

/**
 * Calcula el tamaño de los elementos de la página
 * @returns {Void}
 */
function calculaResolucion() {
    barra = $('.ui-header').height();
    pantalla = $('body').height();
}

/**
 * Crea los Menus de las diferentes páginas
 * @returns {Void}
 */
function crearMenus() {
    entradaMenu.sort(function(a, b) {
        return (a.orden - b.orden);
    });
    var primerMenu;
    for (i = 0; i < entradaMenu.length; i++) {
        if ((entradaMenu[i].Titulo !== "Salir") && (plataforma !== "iOS")) {
            if (entradaMenu[i].visible && !entradaMenu[i].funcion) {
                $('#menu' + entradaMenu[i].enlace).append('<li data-role="list-divider">Menú</li>');
                for (a = 0; a < entradaMenu.length; a++) {
                    if (entradaMenu[a].visible) {
                        if (typeof (primerMenu) === 'undefined') {
                            primerMenu = entradaMenu[a].enlace;
                        }
                        var entradaNueva = '<li data-icon="' + entradaMenu[a].icono + '">';
                        if (entradaMenu[a].funcion) {
                            entradaNueva = entradaNueva + '<a href="#" onclick= "' + entradaMenu[a].enlace + '();"';
                        } else {
                            entradaNueva = entradaNueva + '<a href="#' + entradaMenu[a].enlace + '"';
                        }
                        if (entradaMenu[a].enlace === entradaMenu[i].enlace) {
                            entradaNueva = entradaNueva + ' class="ui-btn-hover-b"';
                        }
                        entradaNueva = entradaNueva + '>' + entradaMenu[a].titulo + '</a></li>';
                        $('#menu' + entradaMenu[i].enlace).append(entradaNueva);
                    }
                }
            }
        }
    }
    $('#menu' + primerMenu).listview("refresh");
}

/**
 * Hace aparecer el menu lateral
 * @returns {Void}
 */
function muestraMenu() {
    var paginaActual = $.mobile.activePage.attr('id');
    $('#' + paginaActual + ' #menu').panel("open");
}

/**
 * Esta function recibe la notificaciones via push
 * @returns {undefined}
 */
function activaPush() {
    try {
        var socket = io.connect('http://grupoitalica.com:2903/notify');
        socket.on("connect", function() {
            console.log("connected");
            socket.emit("user", {Id: dispositivo});
        });
        socket.on('update', function(data) {
            // Do something cool like update badges/status/etc...
            var texto = data.Counts.texto
            console.log(texto);
            notificaciones(texto, 0, null, "Mensaje desde el servidor");
            vibrar(1000);
        });
    } catch (e) {
        console.log(e);
    }
}

/**
 * Lee la rss de la url
 * @returns {Void}
 */
function leeRss() {
    var rss = new google.feeds.Feed(urlRss);
    rss.setNumEntries(10);
    rss.load(creaListaRss);
}

/**
 * Crea la lista con las entradas del rss
 * @param {Object} resultado objeto que almacena los resultados de las rss
 * @returns {Void}
 */
function creaListaRss(resultado) {
    estadistica('ver noticias');
    if (!resultado.error) {
        contenidoRss = resultado;
        for (var i = 0; i < resultado.feed.entries.length; i++) {
            var entrada = resultado.feed.entries[i];
            var fila = '<li><a href="#" onclick="muestraNoticia(' + i + ');">';
            fila = fila + '<h1 class=".ui-link">' + entrada.title + '</h1>';
            fila = fila + '<p>' + entrada.contentSnippet + '</p>';
            fila = fila + '</a></li>';
            $('#contieneNoticias').append(fila);
        }
        $('#contieneNoticias').listview("refresh");
    }
}

/**
 * Prepara el desarrollo de las noticas rss
 * @param {Int} id
 * @returns {Void}
 */
function muestraNoticia(id) {
    noticia = contenidoRss.feed.entries[id];
    noticia.tipo = "rss";
    $.mobile.changePage("#leeNoticias");
}

/**
 * Muestra las noticias rss
 * @returns {Void}
 */
function rellenaNoticia() {
    switch (noticia.tipo) {
        case "rss":
            estadistica('ver noticia: ' + noticia.title);
            $('#cabeceraNoticia a').attr('href', '#verNoticias');
            $('#tituloNoticia').html(noticia.title);
            $('#fechaNoticia').html(formatearFecha(noticia.publishedDate));
            var contenido = noticia.content;
            do {
                contenido = contenido.replace('<p>&nbsp;</p>', '');
            } while (contenido.indexOf('<p> </p>') >= 0);
            $('#contenidoNoticia').html(linkify_html(contenido));
            $('#contenidoNoticia a').click(function() {
                abreWeb($(this).attr('href'));
                return false;
            });
            var ancho = $('#contenidoNoticia').width();
            if ($('a[rel|="lightbox"]').length > 0) {
                var fotos = $('a[rel|="lightbox"]');
                for (var i = 0; i < fotos.length; i++) {
                    var url = fotos[i].href;
                    var contenedor = $(fotos[i]).parent();
                    $(contenedor[0]).attr('style', '');
                    $(contenedor[0]).html('<img src="' + url + '">');
                }
            }
            $('#contenidoNoticia img').attr('width', '');
            $('#contenidoNoticia img').attr('heigth', '');
            $('#contenidoNoticia img').css({'max-width': ancho, 'margin-left': 'auto', 'margin-right': 'auto', 'display': 'block'});
            break;
        case "facebook":
            estadistica('ver post de facebook: ' + noticia.id);
            $('#cabeceraNoticia a').attr('href', '#verFacebook');
            $('#tituloNoticia').html('');
            $('#fechaNoticia').html(formatearFecha(noticia.created_time.substring(0, 19).replace("T", " ").replace(/-/gi, "/")));
            var contenido = '';
            if (typeof (noticia.picture) !== 'undefined') {
                contenido = '<img src="' + noticia.picture + '">';
            }
            contenido = contenido + linkify_html(noticia.message);
            $('#contenidoNoticia').html(contenido);
            $('#contenidoNoticia a').click(function() {
                abreWeb($(this).attr('href'));
                return false;
            });
            var ancho = $('#contenidoNoticia').width();
            $('#contenidoNoticia img').css({'float': 'left', 'max-width': ancho, 'margin-right': '10px', 'margin-left': 'auto', 'display': 'block'});
            break;
    }

}

/**
 * Vacia de contenido la pagina de las noticias
 * @returns {Void}
 */
function vaciaNoticia() {
    $('#tituloNoticia').html('');
    $('#fechaNoticia').html('');
    $('#contenidoNoticia').html('');
}

/**
 * Muestra la lista de rss
 * @returns {Void}
 */
function volverRss() {
    $.mobile.changePage("#noticias");
}

/**
 * Lee los twitter y los pasa a un objeto
 * @returns {Void}
 */
function leeTwitter() {
    var twitter = new Codebird;
    twitter.setConsumerKey("jiG3jjkTt76AVHXHehZXw", "3p58L8xL5qKD9jR6eJJp63Q6fQqiwaphz28zZ2aag");
    twitter.setToken("301057433-xeTiRhd3Z04zAINvifmQyFb1r147l2V9KCi1cVQo", "wYcAUoSVUehluoWmbkJHCNQvqoj3cWq9FglUi7XWE0");

    twitter.__call(
            "statuses_userTimeline", {
                'screen_name': 'dbtgijon',
                'count': '10'
            },
    function(reply) {
        contenidoTwitter = reply;
    }
    );
//    var url = "https://api.twitter.com/1/statuses/user_timeline.json?include_entities=true&include_rts=true&screen_name=" + nombreTwitter + "&count=" + numeroTwitter;
//    $.getJSON(url, function(data) {
//        contenidoTwitter = data;
//    });
}

/**
 * Crea la lista con los resultados de los Twit
 * @returns {Void}
 */
function creaListaTwitter() {
    estadistica('ver twitter');
    $('#contieneTwitter').html('');
    var datos = contenidoTwitter;
    if (!datos.errors) {
        var imagePerfil = datos[0].user.profile_image_url;
        var fondoPerfil = "";// "'" + datos[0].user.profile_background_image_url + "'";
        var nombrePantalla = datos[0].user.screen_name;
        var descripcion = datos[0].user.description;
        var seguidores = datos[0].user.followers_count;

        var cabecera = '<li style="background-image:url(' + fondoPerfil + '); background-color:#cccccc; text-align:center">';
        cabecera = cabecera + '<img src="' + imagePerfil + '"><h1>@' + nombrePantalla + '</h1><p>' + descripcion + '</p> </li>';
        $('#contieneTwitter').append(cabecera);

        for (var i = 0; i < datos.length; i++) {
            var twit = datos[i];
            var fila = '<li>';
            fila = fila + '<h1>' + formatearFecha(twit.created_at) + '</h1>';
            fila = fila + '<p>' + linkify_html(twit.text) + '</p>';
            fila = fila + '</li>';
            $('#contieneTwitter').append(fila);
        }
        $('#contieneTwitter').listview("refresh");
        $('#contieneTwitter li a').click(function() {
            abreWeb($(this).attr('href'));
            return false;
        });
    }
}

// parte de facebook

/**
 * Lee el Facebook
 * @returns {Void}
 */
function leeFacebook() {
    $.ajaxSetup({cache: true});
    $.getScript('http://connect.facebook.net/en_UK/all.js', function() {
        /* make the API call */
        FB.api(
                idFacebook, //1780880518
                {
                    access_token: tokenFacebook //"1411961745716989|cmiO7LlORhHAMMI0grvdIo1pSdI"
                },
        function(response) {
            if (response && !response.error) {
                contenidoFacebook = response;
                creaListaFacebook();
            }
            console.log("fin");
            /* handle the result */
        }
        );
    });

}


//function leeFacebook() {
//    var url = "https://graph.facebook.com/" + idFacebook + "/feed?fields=message,picture,link&access_token=" + tokenFacebook;
//    $.getJSON(url, function(data) {
//        contenidoFacebook = data;
//    });
//}

/**
 * Crea la lista de los Facebook
 * @returns {Void}
 */
function creaListaFacebook() {
    estadistica('ver facebook');
    $('#contieneFacebook').html('');
    var datos = contenidoFacebook.data;
    if (!datos.errors) {
        for (var i = 0; i < datos.length; i++) {
            if (typeof (datos[i].message) !== 'undefined') {
                var post = datos[i];
                var fila = '<li><a href="#" onclick="muestraPostFacebook(' + i + ');">';
                fila = fila + '<h1>' + formatearFecha(post.created_time.substring(0, 19).replace("T", " ").replace(/-/gi, "/")) + '</h1>';
                if (typeof (post.picture) !== 'undefined') {
                    fila = fila + '<img src="' + post.picture + '">';
                }
                fila = fila + '<p>' + post.message.slice(0, 100) + '...</p>';
                fila = fila + '</a></li>';
                $('#contieneFacebook').append(fila);
            }

        }
        $('#contieneFacebook').listview("refresh");
    }
}
/**
 * Prepara el desarrolo de los post
 * @param {Int} id del post
 * @returns {undefined}
 */
function muestraPostFacebook(id) {
    noticia = contenidoFacebook.data[id];
    noticia.tipo = "facebook";
    $.mobile.changePage("#leeNoticias");
}


/**
 * Crea el Mapa
 * @returns {Void}
 */
function creaMapa() {
    estadistica('ver mapa');
    if (typeof (mapa) === "undefined") {
        mapa = L.map('portaMapas').setView([posicionesMapa[0].lat, posicionesMapa[0].lon], posicionesMapa[0].zoom);
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapa);
        for (i = 1; i < posicionesMapa.length; i++) {
            L.marker([posicionesMapa[i].lat, posicionesMapa[i].lon]).addTo(mapa)
                    .bindPopup(posicionesMapa[i].etiqueta);
            if (posicionesMapa.length === 2) {
                $('#portaDireccion').html(posicionesMapa[i].direccion);
                var numeroTelefono = "";
                for (a = 0; a < posicionesMapa[i].telefono.length; a++) {
                    numeroTelefono = numeroTelefono + posicionesMapa[i].telefono[a].numero + " ";
                }
                $('#portaTelefonos').html(numeroTelefono);
                var todosCorreos = "";
                for (a = 0; a < posicionesMapa[i].email.length; a++) {
                    todosCorreos = todosCorreos + posicionesMapa[i].email[a].correo + " ";
                }
                $('#portaEmail').html(todosCorreos);
            }
        }
    } else {
        mapa.setView([posicionesMapa[0].lat, posicionesMapa[0].lon], posicionesMapa[0].zoom);
        if (posicionesMapa.length > 2) {
            $('#portaDireccion').html('&nbsp;');
            $('#portaTelefonos').html('&nbsp;');
            $('#portaEmail').html('&nbsp;');
        }
    }
    // parte para los multipuntos si los hay
    adaptaMapa();
}

/**
 * Adapta el tamaño del mapa
 * @returns {Void}
 */
function adaptaMapa() {
    var infoMapa = $('#infoMapa').height() + 32;
    var tamanoMapa = pantalla - (barra + infoMapa) - 20;
    $('#portaMapas').height(tamanoMapa);
}

/**
 * Obtiene los datos de la pagina de quines somos
 * @param {Boolean} inicial indica si rellena 
 * @returns {undefined}
 */
function precargaQuienesSomos(inicial) {
    console.log('entramos en Quines somos');
    if (typeof (inicial) === "undefined")
        inicial = false;
    $.ajax(quienesSomosUrl)
            .done(function(data) {
                var resultado = data;
                if (selectorContenido !== '') {
                    contenidoQuienesSomos = $(selectorContenido).html();
                } else {
                    var inicio = resultado.indexOf(selectroInicio);
                    var final = resultado.indexOf(selectorFin);
                    contenidoQuienesSomos = resultado.substring(inicio, final);

                }
                if (inicial)
                    crearQuienesomos();
                if (!localStorage.getItem('noMostrarAyuda'))
                    $('#dAyuda').popup('open');
            });
}

/**
 * Crea el contenido de quines somos
 * @returns {Void}
 */
function crearQuienesomos() {
    $('#contieneHTML').html(contenidoQuienesSomos);
    $('#tituloQuienesSomos').html($('#contieneHTML ' + selectorTitulo).html());
    $('#contenidoQuienesSomos').html($('#contieneHTML ' + selectorContenido).html());
    $('#contenidoQuienesSomos a').click(function() {
        abreWeb($(this).attr('href'));
        return false;
    });
    $('#contenidoQuienesSomos img').attr('width', '');
    var ancho = $('#contenidoQuienesSomos').width();
    $('#contenidoQuienesSomos img').attr('heigth', '');
    $('#contenidoQuienesSomos img').css({'max-width': ancho, 'height': 'auto', 'margin-left': 'auto', 'margin-right': 'auto', 'display': 'block'});
    finEspera();
}

/**
 * Inica el formulario de contacto
 * @returns {Void}
 */
function cargaContacta() {
    estadistica('ver contacta');
    vaciaContacta();
    var altura = $('#contacta .ui-content').height();
    var tamanoTextArea = pantalla - (barra + altura);
    $('#fTexto').height($('#fTexto').height() + tamanoTextArea);
}

/**
 * Vacia el contenido del 
 * @returns {void}
 */
function vaciaContacta() {
    $('#fEmail').val('');
    $('#fTexto').val('');
}

/**
 * Envia por email el contenido del formulario de contacta
 * @returns {void}
 */
function enviarContacta() {
    var texto = $('#fTexto').val();
    var email = $('#fEmail').val();
    if (texto.length === 0) {
        notificaciones("No has escrito nada en cuéntanos", 0, null, "No hay mensaje");
    } else {
        var url = urlServicio + "accion=enviarCorreo&dispositivo=" + dispositivo + "&app=" + app + "&texto=" + texto + "&email=" + email + "&callback=?";
        esperando();
        $.getJSON(url, function(data) {
            if (data.envio) {
                finEspera();
                notificaciones('Envio correcto', 0, muestraMenu, 'Envio Ok');
                vaciaContacta();
            } else {
                finEspera();
                notificaciones('Error en el envio intentelo de nuevo', 0, null, 'Error de envio');
            }
        });
    }
    return null;
}

/**
 * Adapta el tamaño de Acerca de
 * @returns {Void}
 */
function adaptaAcercaDe() {
    $('#uid').html(dispositivo);
    var contenido = $('#cliente').height() + $('#produccion').height();
    var espacio = pantalla - (barra + contenido);
    $('#espacio').height(espacio - 110);
    $('#contenidoAcercaDe a').click(function() {
        abreWeb($(this).attr('href'));
        return false;
    });
}

//Funciones comunes

/**
 * Formate ala fecha de forma que se pueda mostrar en pantalla
 * @param {date} fecha
 * @returns {String}
 */
function formatearFecha(fecha) {
    fecha = new Date(fecha);
    var dia = aDosCifras(fecha.getDate());
    var mes = aDosCifras(fecha.getMonth() + 1);
    var ano = fecha.getFullYear();
    var hora = aDosCifras(fecha.getHours());
    var minutos = aDosCifras(fecha.getMinutes());
    fecha = dia + "/" + mes + "/" + ano + " " + hora + ":" + minutos;
    return fecha;
}

/**
 * Añade un 0 al principio sin sion numero de una sola cifra
 * @param {int} cifra
 * @returns {String}
 */
function aDosCifras(cifra) {
    if (cifra < 10) {
        cifra = "0" + cifra;
    }
    return cifra;
}