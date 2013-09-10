;(function(e,t,n){function r(n,i){if(!t[n]){if(!e[n]){var s=typeof require=="function"&&require;if(!i&&s)return s(n,!0);throw new Error("Cannot find module '"+n+"'")}var o=t[n]={exports:{}};e[n][0](function(t){var i=e[n][1][t];return r(i?i:t)},o,o.exports)}return t[n].exports}for(var i=0;i<n.length;i++)r(n[i]);return r})({1:[function(require,module,exports){
var leafletPip = require('../'),
    //map = L.map('map').setView([37.8, -96], 4),
    map = L.map('map').setView([37.7837,-122.4166], 14),
    gjLayer = L.geoJson(statesData, {
		style: style,
		onEachFeature: mouseHandlers
	});
	
	
var BREADCRUMBS = [ [0,0,0,0,0] ]; //lng.lat,time(ms),step_m,cumm_m	

//L.tileLayer('http://a.tiles.mapbox.com/v3/tmcw.map-l1m85h7s/{z}/{x}/{y}.png')
//L.tileLayer('http://a.tiles.mapbox.com/v3/greeninfo.map-p71hkhvk/{z}/{x}/{y}.png')
L.tileLayer('http://a.tiles.mapbox.com/v3/greeninfo.map-zliae3w5/{z}/{x}/{y}.png') //gda
L.tileLayer('http://a.tiles.mapbox.com/v3/jhnklly.map-x4jkulbe/{z}/{x}/{y}.png') //no buildings
    .addTo(map);

gjLayer.addTo(map);

if (L.Browser.touch) {
	L.control.touchHover().addTo(map);
}

//L.tileLayer('http://a.tiles.mapbox.com/v3/greeninfo.map-qwnj26en/{z}/{x}/{y}.png')
    //.addTo(map); //streets_and_labels (won't overlay vectors?)
    
var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    this._div.innerHTML =  (props ?
        props.name
		: 'Hover over a \'hood');
};

info.addTo(map);


function style(feature) {
    return {
        //fillColor: getColor(feature.properties.density),
        weight: 9.5,
        opacity: 0.1,
        //color: '#FAF4B7', //yellow
        color: '#704489', //dirple (dirty purple)
        //dashArray: '3',
        fillOpacity: 0
    };
}
function resetHighlight(e) {
    gjLayer.resetStyle(e.target);
	info.update();
}
function highlightFeature(e) {
    var layer = e.target;
	
	info.update(layer.feature.properties);

    layer.setStyle({
        weight: 2,
        //color: '#FBED80', //another yellow
        color: '#C29ED7', //lilac dust
        dashArray: '',
        fillOpacity: 0.5
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
}
function mouseHandlers(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        //click: zoomToFeature
    });
}

var myIcon = L.icon({
    iconUrl: 'site/blue.png',
    //iconRetinaUrl: 'my-icon@2x.png',
    iconSize: [32, 32],
    //iconAnchor: [22, 94],
    //popupAnchor: [-3, -76],
    //shadowUrl: 'my-icon-shadow.png',
    //shadowRetinaUrl: 'my-icon-shadow@2x.png',
    //shadowSize: [68, 95],
    //shadowAnchor: [22, 94]
});
var orangeIcon = L.icon({
    iconUrl: 'site/blue10.png',
    iconSize: [10, 10]
});
var marker = L.marker([0,0], {icon: myIcon, opacity: 0.4} ).addTo(map); //Null Island
//var breadcrumbs = [];
//breadcrumbs.push(marker);

var msg="Trying high accuracy";
var hilo="high";
document.addEventListener("deviceready", findMe, true);
//document.getElementById('me').onclick = function() {
document.getElementById('me').onclick = findMe();
function findMe() {
    map.panTo(newLatLng);

    document.getElementById('hilo').innerHTML = "finding";
//navigator.geolocation.getCurrentPosition(function(pos) {
    navigator.geolocation.watchPosition(
        successCallback,
        errorCallback_highAccuracy,
        {maximumAge:30000, timeout:15000, enableHighAccuracy: true}
    );
};

// begin http://jsfiddle.net/CvSW4/ (w/fix)+ leaflet-pip
function errorCallback_highAccuracy(error) {
    if (error.code == error.TIMEOUT)
    {
        // Attempt to get GPS loc timed out after 5 seconds, 
        // try low accuracy location
        msg = "switching to low accuracy";
        hilo = "low";
        document.getElementById('hilo').innerHTML = msg;
        navigator.geolocation.watchPosition(
               successCallback, 
               errorCallback_lowAccuracy,
               {maximumAge:20000, timeout:10000, enableHighAccuracy: false});
        return;
    }
    
    msg = "high accuracy error = ";
    if (error.code == 1)
        msg += "PERMISSION_DENIED";
    else if (error.code == 2)
        msg += "POSITION_UNAVAILABLE";
    msg += ", msg = "+error.message;
    
    document.getElementById('hilo').innerHTML = msg;
}

function errorCallback_lowAccuracy(error) {
    msg = "low accuracy error = ";
    if (error.code == 1)
        msg += "PERMISSION_DENIED";
    else if (error.code == 2)
        msg += "POSITION_UNAVAILABLE";
    else if (error.code == 3)
        msg += "TIMEOUT";
    msg += ", msg = "+error.message;
    
    document.getElementById('hilo').innerHTML = msg;
}

function successCallback(pos) {
    //var latitude = pos.coords.latitude;
    //var longitude = pos.coords.longitude;
    //$('body').append("<p>Your location is: " + latitude + "," + longitude+" </p><p>Accuracy="+position.coords.accuracy+"m");
    msg = +pos.coords.accuracy+"m "; // + hilo;
    //document.getElementById('hilo').innerHTML = msg;
    var res = leafletPip.pointInLayer(
        [pos.coords.longitude, pos.coords.latitude], gjLayer);
    if (res.length) {
        //navigator.notification.alert("New hood.");
        if ( navigator.notification ) {
            if ( document.getElementById('me').innerHTML != res[0].feature.properties.name ) {
                //navigator.notification.vibrate(1000);
                //navigator.notification.alert("Entering "+res[0].feature.properties.name);
                //navigator.notification.beep(1);  
            }
        } else {
            document.getElementById('hilo').innerHTML = "no nav.notif";
        }
        document.getElementById('me').innerHTML = res[0].feature.properties.name;
    } else {
        document.getElementById('me').innerHTML = 'You aren\'t in hoods';
    }

    var oldMarker = L.marker([pos.coords.latitude, pos.coords.longitude], {icon: orangeIcon} ).addTo(map);
    var newLatLng = new L.LatLng(pos.coords.latitude, pos.coords.longitude);
    marker.setLatLng(newLatLng); 
    
    //map.setView(newLatLng, 15);
    //map.panTo(newLatLng);

}
// end http://jsfiddle.net/CvSW4/


},{"../":2}],2:[function(require,module,exports){
var pip = require('point-in-polygon');

function getLls(l) {
    var lls = l.getLatLngs(), o = [];
    for (var i = 0; i < lls.length; i++) o[i] = [lls[i].lng, lls[i].lat];
    return o;
}

var leafletPip = {
    bassackwards: false,
    pointInLayer: function(p, layer, first) {
        'use strict';
        if (!(layer instanceof L.GeoJSON)) throw new Error('must be L.GeoJSON');
        if (p instanceof L.LatLng) p = [p.lng, p.lat];
        if (leafletPip.bassackwards) p.reverse();

        var results = [];
        layer.eachLayer(function(l) {
            if (first && results.length) return;
            // multipolygon
            var lls = [];
            if (l instanceof L.MultiPolygon) {
                l.eachLayer(function(sub) { lls.push(getLls(sub)); });
            } else if (l instanceof L.Polygon) {
                lls.push(getLls(l));
            }
            for (var i = 0; i < lls.length; i++) {
                if (pip(p, lls[i])) results.push(l);
            }
        });
        return results;
    }
};

module.exports = leafletPip;

},{"point-in-polygon":3}],3:[function(require,module,exports){
module.exports = function (point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    
    var x = point[0], y = point[1];
    
    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];
        
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
};

},{}]},{},[1])
;

