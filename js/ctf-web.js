var host = 'acm.cs.memphis.edu';
var port = 4444;
var bluePlayerIconDead = "images/blue_marker_dead.png";
var bluePlayerIconAlive = "images/blue_marker_alive.png";
var redPlayerIconDead = "images/red_marker_dead.png";
var redPlayerIconAlive = "images/red_marker_alive.png";
var blueFlagIcon = "images/ctf_logo_blue.png";
var redFlagIcon = "images/ctf_logo_red.png";

var gameState = {
    latitude: '',
    longitude: '',
    accuracy: '',
    inLobby: '',
    lobbyID: '',
    north: '',
    south: '',
    east: '',
    west: '',
    myTeam: '',
    lobbyStatus: '',
    mapInitialized: false,
    players: [],
    bases: [],
    flags: []
};

function greet() {

    console.log('Greeting...');
    var request = {
        ACTION: "HELLO",
        USERNAME: getCookie('USERNAME'),
        BLUETOOTH: '01:23:45:67:89:ab',
        WEB_ID: getCookie('WEB_ID')
    };

    var payload = JSON.stringify(request);

    $.getJSON('http://' + host + ':' + port + '?json_ctf_server=' + payload + '?callback=?', null, function (results) {

    });

    console.log('Greeting completed...');
    $('#username_navbar').text('Connected as ' + getCookie('USERNAME'));
    getLobbies();
}

function getLobby() {

    $('#lobbies').empty();
    $('#lobbies').append('<tr><td>Players</td></tr>');

    var request = {
        ACTION: "LOBBY",
        WEB_ID: getCookie('WEB_ID')
    };

    var payload = JSON.stringify(request);

    $.getJSON('http://' + host + ':' + port + '?json_ctf_server=' + payload + '?callback=?', null, function (results) {
        console.log('the lobby from the server...');
        console.log(results);
        gameState.accuracy = results.ACCURACY;
        gameState.north = results.NORTH;
        gameState.south = results.SOUTH;
        gameState.east = results.EAST;
        gameState.west = results.WEST;
        gameState.lobbyStatus = results.STATUS;
        if (gameState.mapInitialized === false) {
            console.log('Would overwrite markers.. setting players in gamestate to players in..');
            console.log(results);
            gameState.players = results.PLAYERS;
        } else {
            console.log('Just update the players location and status..');
            for (var i = 0; i < gameState.players.length; i++) {
                gameState.players[i].LOCATION = results.PLAYERS[i].LOCATION;
                gameState.players[i].STATUS = results.PLAYERS[i].STATUS;
                console.log('player after update...');
                console.log(gameState.players[i]);
                console.log('the player from the server')
                console.log(results.PLAYERS[i]);
            }
        }


        for (var j = 0; j < results.PLAYERS.length; j++) {
            $('#lobbies').append('<tr><td>' + results.PLAYERS[j].USERNAME + '</td></tr>');
        }
        getFlags();
    });


}

function getFlags() {
    var request = {
        ACTION: "FLAG",
        WEB_ID: getCookie('WEB_ID')
    };

    var payload = JSON.stringify(request);

    $.getJSON('http://' + host + ':' + port + '?json_ctf_server=' + payload + '?callback=?', null, function (results) {
        if (gameState.mapInitialized === false) {
            gameState.flags = results.FLAGS;
        } else {
            for (var i = 0; i < gameState.flags.length; i++) {
                gameState.flags[i].LOCATION = results.FLAGS[i].LOCATION;
                gameState.flags[i].STATUS = results.FLAGS[i].STATUS;
            }
        }
    });
}

function getBases() {
    var request = {
        ACTION: "BASE",
        WEB_ID: getCookie('WEB_ID')
    };

    var payload = JSON.stringify(request);

    $.getJSON('http://' + host + ':' + port + '?json_ctf_server=' + payload + '?callback=?', null, function (results) {
        gameState.bases = results.BASES;
    });
}

function getLobbies() {
    console.log('getLobbies...');
    var request = {
        ACTION: "LOBBY",
        WEB_ID: getCookie('WEB_ID')
    };

    var payload = JSON.stringify(request);

    $.getJSON('http://' + host + ':' + port + '?json_ctf_server=' + payload + '?callback=?', null, function (results) {
        if (results.hasOwnProperty('LOBBIES')) {
            console.log("Lobbies...");
            console.log(results);
            $('#lobbies').empty();
            console.log('appending row...');
            $('#lobbies').append('<tr><td>ID</td><td>Blue</td><td>Red</td><td>State</td><td>Join</td></tr>');
            for (var i = 0; i < results.LOBBIES.length; i++) {
                console.log('appending row...');
                $('#lobbies').append('<tr><td>' + results.LOBBIES[i].LOBBY + '</td><td>' + results.LOBBIES[i].BLUE + '</td><td>' + results.LOBBIES[i].RED + '</td><td>' + results.LOBBIES[i].STATE + '</td><td><a href="#" class="btn btn-primary" id="join-' + results.LOBBIES[i].LOBBY + '" value="' + results.LOBBIES[i].LOBBY + '">Join</a></td></tr>');
                $('#join-' + results.LOBBIES[i].LOBBY).click(function () {
                    joinLobby($(this).attr('value'));
                });
            }
        } else {
            console.log('Does not have property LOBBIES');
        }

    });


}

function locate() {
    navigator.geolocation.getCurrentPosition(function (pos) {
        var lat = pos.coords.latitude;
        var lng = pos.coords.longitude;

        if (lat != gameState.latitude || lng != gameState.longitude) {
            gameState.latitude = lat;
            gameState.longitude = lng;
            console.log('Location updated: ' + lat + "," + lng);
            if (gameState.lobbyStatus == 1) {
                // Send my gps update.
                var request = {
                    ACTION: "GPS",
                    LOCATION: gameState.latitude + "," + gameState.longitude,
                    WEB_ID: getCookie('WEB_ID')
                };

                var payload = JSON.stringify(request);

                $.getJSON('http://' + host + ':' + port + '?json_ctf_server=' + payload + '?callback=?', null, function (results) {
                    console.log('Updated gps...');
                    console.log(results);
                });
            }
        }
    });
}

function joinLobby(lobby) {
    var request = {
        ACTION: "JOIN",
        ID: lobby,
        LOCATION: gameState.latitude + "," + gameState.longitude,
        WEB_ID: getCookie('WEB_ID')
    };

    var payload = JSON.stringify(request);

    $.getJSON('http://' + host + ':' + port + '?json_ctf_server=' + payload + '?callback=?', null, function (results) {
        console.log('Joining...' + lobby);
        console.log(results);
        if (results.hasOwnProperty('LEVEL')) {
            alert(JSON.stringify(results));
        } else {
            gameState.lobbyID = lobby;
            gameState.inLobby = true;
            gameState.myTeam = results.TEAM;
            getLobby();
            $('#username_navbar').html('Connected as ' + getCookie('USERNAME') + ' in lobby: ' + gameState.lobbyID);
            $('#create_lobby').hide();
            $('#refresh_lobby').hide();
            $('#start_lobby').show();
            $('#lobbies').empty();
            $('#lobbies').append('<tr><td>Players</td></tr>');
            getBases();
        }

    });


}

function createLobby() {
    var request = {
        ACTION: "CREATE",
        LOCATION: gameState.latitude + "," + gameState.longitude,
        SIZE: 0.00035,
        ACCURACY: 0.00026,
        WEB_ID: getCookie('WEB_ID')
    };

    var payload = JSON.stringify(request);

    $.getJSON('http://' + host + ':' + port + '?json_ctf_server=' + payload + '?callback=?', null, function (results) {
        if (results.hasOwnProperty('ID')) {
            console.log('Creating lobby...');
            console.log(results);
            gameState.lobbyID = results.ID;
            gameState.inLobby = true;
            gameState.myTeam = 2;
            // Move to lobby view.
            
        } else {
            console.log('Error creating lobby...');
            console.log(results);
        }

        $.when(getLobby()).then( function() {
            console.log('Setting status...' + 'Connected as ' + getCookie('USERNAME') + ' in lobby: ' + gameState.lobbyID);
            $('#username_navbar').html('Connected as ' + getCookie('USERNAME') + ' in lobby: ' + gameState.lobbyID);
        });
        $('#create_lobby').hide();
        $('#refresh_lobby').hide();
        $('#start_lobby').show();
        $('#lobbies').empty();
        $('#lobbies').append('<tr><td>Players</td></tr>');
        getBases();
    });


}

function sendStart() {
    var request = {
        ACTION: "START",
        WEB_ID: getCookie('WEB_ID')
    };

    var payload = JSON.stringify(request);

    $.getJSON('http://' + host + ':' + port + '?json_ctf_server=' + payload + '?callback=?', null, function (results) {
        console.log('Sending start...');
        console.log(results);
    });
}

function startGame() {
    $('#lobbies').hide();
    $('#start_lobby').hide();
    $('#map-canvas').show();

    var mapOptions = {
        zoom: 18,
        center: new google.maps.LatLng(gameState.latitude, gameState.longitude)
    };

    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    var arena;

    // Define the LatLng coordinates for the polygon's path.
    var arenaCoords = [
        new google.maps.LatLng(gameState.north, gameState.west),
        new google.maps.LatLng(gameState.north, gameState.east),
        new google.maps.LatLng(gameState.south, gameState.east),
        new google.maps.LatLng(gameState.south, gameState.west),
        new google.maps.LatLng(gameState.north, gameState.west)
    ];

    var worldCoords = [
        new google.maps.LatLng(gameState.north + 10, gameState.west - 10),
        new google.maps.LatLng(gameState.south - 10, gameState.west - 10),
        new google.maps.LatLng(gameState.south - 10, gameState.east + 10),
        new google.maps.LatLng(gameState.north + 10, gameState.east + 10),
        new google.maps.LatLng(gameState.north + 10, gameState.west - 10)
    ];

    // Construct the polygon.
    arena = new google.maps.Polygon({
        paths: [worldCoords, arenaCoords],
        strokeColor: '#EDEDED',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#222222',
        fillOpacity: 0.35
    });

    if (gameState.myTeam == 1) {
        // Add the team 1 base to the map.
        var base = gameState.bases[1];
        var baseOverlayLocation = base.LOCATION.split(",");
        var baseOverlay = {
            strokeColor: '#0000FF',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#0000FF',
            fillOpacity: 0.35,
            map: map,
            center: new google.maps.LatLng(baseOverlayLocation[0], baseOverlayLocation[1]),
            radius: measure(baseOverlayLocation[0], baseOverlayLocation[1], parseFloat(baseOverlayLocation[0], 10) + gameState.accuracy, baseOverlayLocation[1])
        };
        baseOverlay = new google.maps.Circle(baseOverlay);
    } else {
        // Add the team 1 base to the map.
        var base2 = gameState.bases[0];
        var baseOverlayLocation2 = base2.LOCATION.split(",");
        var baseOverlay2 = {
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.35,
            map: map,
            center: new google.maps.LatLng(baseOverlayLocation2[0], baseOverlayLocation2[1]),
            radius: measure(baseOverlayLocation2[0], baseOverlayLocation2[1], parseFloat(baseOverlayLocation2[0], 10) + gameState.accuracy, baseOverlayLocation2[1])
        };
        baseOverlay2 = new google.maps.Circle(baseOverlay2);
    }


    arena.setMap(map);
    gameState.mapInitialized = true;
    initializeMarkers(map);
}

function initializeMarkers(map) {
    // Show your team and the flags
    for (var i = 0; i < gameState.players.length; i++) {
        if (gameState.players[i].TEAM == gameState.myTeam) {

            var marker = addMarker(gameState.players[i], "player");
            console.log('merging marker...');
            console.log(marker);
            $.when(gameState.players[i].marker = marker).then(function () {
                console.log('player post merge...');
                console.log(gameState.players[i]);
                console.log('gameState post merge...');
                console.log(gameState);
                marker.setMap(map);
            });
        }
    }

    for (var l = 0; l < gameState.flags.length; l++) {
        var marker2 = addMarker(gameState.flags[l], "flag");
        console.log('merging marker...');
        console.log(marker2);
        $.when(gameState.flags[l].marker = marker2).then(function () {
            console.log('flag post merge...');
            console.log(gameState.flags[i]);
            console.log('gameState post merge...');
            console.log(gameState);
            marker2.setMap(map);
        });

    }
}

// Add a marker to the map and push to the array.
function addMarker(entity, type) {
    // Get the lat and long as doubles from location
    var stringLatLng = entity.LOCATION.split(",");
    var image;
    var marker_title;
    if (type == "player") {
        marker_title = entity.USERNAME;
        if (entity.TEAM == 1) {
            if (entity.STATUS === 0) {
                // player is dead
                image = bluePlayerIconDead;
            } else if (entity.STATUS == 1) {
                image = bluePlayerIconAlive;
            }

        } else if (entity.TEAM == 2) {
            if (entity.STATUS === 0) {
                // player is dead
                image = redPlayerIconDead;
            } else if (entity.STATUS == 1) {
                image = redPlayerIconAlive;
            }
        }
    } else if (type == "flag") {
        if (entity.TEAM == 1) {
            marker_title = "Blue Flag";
            image = blueFlagIcon;
        } else if (entity.TEAM == 2) {
            marker_title = "Red Flag";
            image = redFlagIcon;
        }
    }

    var markerIcon = {
        size: new google.maps.Size(64, 64),
        url: image
    };


    var markerPosition = new google.maps.LatLng(stringLatLng[0], stringLatLng[1]);
    var markerIcon2 = new google.maps.MarkerImage(image, null, null, null, new google.maps.Size(24, 24));
    var marker = new google.maps.Marker({
        position: markerPosition,
        map: map,
        icon: markerIcon2,
        title: marker_title
    });

    return marker;
}

function setup() {
    $('#create_lobby').click(createLobby);
    $('#refresh_lobby').click(getLobbies);
    $('#start_lobby').click(sendStart);

    $('#start_lobby').hide();
    $('#map-canvas').hide();
}

function repeatables() {
    console.log('Gamestate...');
    console.log(gameState);
    locate();

    if (gameState.inLobby) {
        getLobby();
        // Check if new players have joined and if the game has started. 
        if (gameState.lobbyStatus == 1 && gameState.latitude != '' && gameState.longitude != '') {
            if (gameState.mapInitialized === false) {
                console.log('Game was started...');
                startGame();
            }
            // Check if anything has changed since I'm unable to get broadcasts or pushes from the server
            updateMarkers();
        }
    }
    setTimeout(repeatables, 5000);
}

function updateMarkers() {
    // For each player, base and flag add markers
    console.log('updating markers');
    for (var i = 0; i < gameState.players.length; i++) {
        var stringLatLng = gameState.players[i].LOCATION.split(",");


        if (gameState.players[i].TEAM == gameState.myTeam) {
            console.log('Updating player...');
            console.log(gameState.players[i]);
            gameState.players[i].marker.setPosition(new google.maps.LatLng(stringLatLng[0], stringLatLng[1]));
            if (gameState.players[i].STATUS === 0) {
                if (gameState.myTeam == 1) {
                    // blue icons
                    console.log('blue, dead');
                    gameState.players[i].marker.setIcon(bluePlayerIconDead);
                } else {
                    console.log('red, dead');
                    gameState.players[i].marker.setIcon(redPlayerIconDead);
                }

            } else if (gameState.players[i].STATUS == 1) {
                if (gameState.myTeam == 1) {
                    // blue icons
                    console.log('blue, alive');
                    gameState.players[i].marker.setIcon(bluePlayerIconAlive);
                } else {
                    console.log('red, alive');
                    gameState.players[i].marker.setIcon(redPlayerIconAlive);
                }
            }

        }
    }

    for (var m = 0; m < gameState.flags.length; m++) {
        console.log('gameState...');
        console.log(gameState);
        var stringLatLng2 = gameState.flags[m].LOCATION.split(",");
        gameState.flags[m].marker.setPosition(new google.maps.LatLng(stringLatLng2[0], stringLatLng2[1]));
    }
}

function measure(lat1, lon1, lat2, lon2) { // generally used geo measurement function
    var R = 6378.137; // Radius of earth in KM
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    console.log("measuring distance from " + lat1 + "," + lon1 + " to " + lat2 + "," + lon2 + ": " + d * 1000);
    return d * 1000; // meters
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}


if (getCookie('WEB_ID') == "") {
    console.log('Cookie is null...');
    var username = window.prompt("What would you like your username to be?");
    setCookie('USERNAME', username);
    setCookie('WEB_ID', username + "_" + Math.random());
} else {
    // Cookie wasn't null attemp to resume 
    var request = {
        ACTION: "LOBBY",
        WEB_ID: getCookie('WEB_ID')
    };

    var payload = JSON.stringify(request);

    $.getJSON('http://' + host + ':' + port + '?json_ctf_server=' + payload + '?callback=?', null, function (results) {
        if (results.hasOwnProperty('NORTH')) {
            // User is in a lobby do they want to resume?
            var resume = confirm("Do you want to rejoin? " + JSON.stringify(results));
            if (resume) {
                // If in progress start the map otherwise go to lobby
                getBases();
                getLobby();
                gameState.inLobby = true;
            } else {
                // Leave
                var request = {
                    ACTION: "LEAVE",
                    WEB_ID: getCookie('WEB_ID')
                };

                var payload = JSON.stringify(request);

                $.getJSON('http://' + host + ':' + port + '?json_ctf_server=' + payload + '?callback=?', null, function (results) {
                    console.log('Sending leave...');
                    console.log(results);
                });
                getLobbies();
            }
        }

    });
    console.log('Cookie is asdfadsf...');
}

$(document).ready(function () {



    // Greet
    greet();

    // Setup
    setup();

    locate();

    // Loop
    setTimeout(repeatables, 1000);

});