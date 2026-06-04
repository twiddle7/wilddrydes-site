/*global WildRydes _config L*/

var WildRydes = window.WildRydes || {};
WildRydes.map = WildRydes.map || {};

(function esriMapScopeWrapper($) {
    var map;
    var marker;

    // Center on Seattle
    var center = {
        latitude: 47.6062,
        longitude: -122.3321
    };

    var extent = {
        minLat: 47.55,
        maxLat: 47.65,
        minLng: -122.40,
        maxLng: -122.25
    };

    WildRydes.map.center = center;
    WildRydes.map.extent = extent;

    map = L.map('map').setView([center.latitude, center.longitude], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    map.on('click', onMapClick);

    function handlePickupChanged() {
        var point = WildRydes.map.selectedPoint;
        if (marker) {
            marker.setLatLng([point.latitude, point.longitude]);
        } else {
            marker = L.marker([point.latitude, point.longitude]).addTo(map);
        }
        $(WildRydes.map).trigger('pickupChange');
    }

    function onMapClick(e) {
        var latlng = e.latlng;
        WildRydes.map.selectedPoint = {
            latitude: latlng.lat,
            longitude: latlng.lng
        };
        handlePickupChanged();
    }

    WildRydes.map.unsetLocation = function unsetLocation() {
        if (marker) {
            map.removeLayer(marker);
            marker = undefined;
        }
    };

    WildRydes.map.animate = function animate(origin, dest, callback) {
        var unicornMarker = L.marker([origin.latitude, origin.longitude], {
            icon: L.icon({
                iconUrl: 'images/unicorn-icon.png',
                iconSize: [25, 25],
                iconAnchor: [12, 12]
            })
        }).addTo(map);

        var startTime = performance.now();
        var duration = 3000; // 3 seconds animation

        function step(now) {
            var progress = (now - startTime) / duration;
            if (progress > 1) progress = 1;

            var currentLat = origin.latitude + (dest.latitude - origin.latitude) * progress;
            var currentLng = origin.longitude + (dest.longitude - origin.longitude) * progress;

            unicornMarker.setLatLng([currentLat, currentLng]);

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                map.removeLayer(unicornMarker);
                callback();
            }
        }

        requestAnimationFrame(step);
    };

}(jQuery));
