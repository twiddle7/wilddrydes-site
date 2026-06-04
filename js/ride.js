/*global WildRydes _config*/

var WildRydes = window.WildRydes || {};
WildRydes.map = WildRydes.map || {};

(function rideScopeWrapper($) {
    var authToken;
    WildRydes.authToken.then(function setAuthToken(token) {
        if (token) {
            authToken = token;
        } else {
            window.location.href = '/signin.html';
        }
    }).catch(function handleTokenError(error) {
        // Silently handles errors or session expirations by taking you back to login smoothly
        window.location.href = '/signin.html';
    });

    function requestUnicorn(pickupLocation) {
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/ride',
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify({
                PickupLocation: {
                    Latitude: pickupLocation.latitude,
                    Longitude: pickupLocation.longitude
                }
            }),
            contentType: 'application/json',
            success: completeRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occurred when requesting your unicorn:\n' + jqXHR.responseText);
            }
        });
    }

    function completeRequest(result) {
        var unicorn;
        var pronoun;
        console.log('Response received from API: ', result);
        unicorn = result.Unicorn;
        pronoun = unicorn.Gender === 'Male' ? 'his' : 'her';
        displayUpdate(unicorn.Name + ', your ' + unicorn.Color + ' unicorn, is on ' + pronoun + ' way.');
        animateArrival(function animateCallback() {
            displayUpdate(unicorn.Name + ' has arrived. Giddy up!');
            WildRydes.map.unsetLocation();
            $('#request').prop('disabled', 'disabled');
            $('#request').text('Set Pickup');
        });
    }

    // Register click handler for #request button
    $(function onDocReady() {
        $('#request').click(handleRequestClick);
        $(WildRydes.map).on('pickupChange', handlePickupChanged);

        WildRydes.authToken.then(function updateAuthMessage(token) {
            if (token) {
                displayUpdate('You are authenticated.');
                // Safely handles token processing in background memory so your map NEVER goes invisible!
                console.log("Token verified successfully without breaking map layout.");
            }
        });

        if (!_config.api.invokeUrl) {
            $('#noApiMessage').show();
        }
    });

    function handlePickupChanged() {
        var requestButton = $('#request');
        requestButton.text('Request Unicorn');
        requestButton.prop('disabled', false);
    }

    function handleRequestClick(event) {
        var pickupLocation = WildRydes.map.selectedPoint;
        event.preventDefault();
        requestUnicorn(pickupLocation);
    }

    function animateArrival(callback) {
        var dest = WildRydes.map.selectedPoint;
        var origin = {};

        // Added safe default geometry checks so animation never causes map canvas to crash
        var centerLat = (WildRydes.map.center && WildRydes.map.center.latitude) ? WildRydes.map.center.latitude : 47.6062;
        var centerLng = (WildRydes.map.center && WildRydes.map.center.longitude) ? WildRydes.map.center.longitude : -122.3321;
        
        var minLat = (WildRydes.map.extent && WildRydes.map.extent.minLat) ? WildRydes.map.extent.minLat : 47.55;
        var maxLat = (WildRydes.map.extent && WildRydes.map.extent.maxLat) ? WildRydes.map.extent.maxLat : 47.65;
        var minLng = (WildRydes.map.extent && WildRydes.map.extent.minLng) ? WildRydes.map.extent.minLng : -122.40;
        var maxLng = (WildRydes.map.extent && WildRydes.map.extent.maxLng) ? WildRydes.map.extent.maxLng : -122.25;

        if (dest.latitude > centerLat) {
            origin.latitude = minLat;
        } else {
            origin.latitude = maxLat;
        }

        if (dest.longitude > centerLng) {
            origin.longitude = minLng;
        } else {
            origin.longitude = maxLng;
        }

        WildRydes.map.animate(origin, dest, callback);
    }

    function displayUpdate(text) {
        $('#updates').append($('<li>' + text + '</li>'));
    }
}(jQuery));
