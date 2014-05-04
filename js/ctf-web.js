var host = 'localhost';
var port = 4444;
var latitude;
var longitude;
var inLobby;
var lobbyID;
var north;
var south; 
var east;
var west;
var redBase;
var blueBase;

function greet()
{
	var request = { 
		ACTION: "HELLO", 
		USERNAME: $.cookie('USERNAME'), 
		BLUETOOTH: '01:23:45:67:89:ab', 
		WEB_ID: $.cookie('WEB_ID')
	}

	var payload = JSON.stringify(request);

	 $.getJSON('http://' + host + ':' + port + '?json_ctf_server=' + payload + '?callback=?', null, function (results) {
        $('#username_navbar').html('Connected as ' + $.cookie('USERNAME'));
      }).done(function() {
      	getLobbies();
      });
}

function getLobby()
{
	$('#username_navbar').html('Connected as ' + $.cookie('USERNAME') + ' in lobby: ' + lobbyID);
	$('#create_lobby').hide();
	$('#refresh_lobby').hide();
	$('#start_lobby').show();
	$('#lobbies').empty();
	$('#lobbies').append('<tr><td>Players</td></tr>');

	var request = {
		ACTION: "LOBBY",
		WEB_ID: $.cookie('WEB_ID')
	}

	var payload = JSON.stringify(request);

	$.getJSON('http://' + host + ':' + port + '?json_ctf_server=' + payload + '?callback=?', null, function (results) {
		console.log(results);
				north = results.NORTH;
				south = results.SOUTH;
				east = results.EAST;
				west = results.WEST;
				
        for(var i = 0; i < results.PLAYERS.length; i++)
        {
        	$('#lobbies').append('<tr><td>' + results.PLAYERS[i].USERNAME + '</td></tr>');
        }
      });

	getBases();

}

function getBases()
{
	var request = {
		ACTION: "BASE",
		WEB_ID: $.cookie('WEB_ID')
	}

	var payload = JSON.stringify(request);

	$.getJSON('http://' + host + ':' + port + '?json_ctf_server=' + payload + '?callback=?', null, function (results) {
					redBase = results.BASES[0];
					blueBase = results.BASES[1];
					console.log('bases');
					console.log(results.BASES[0]);
					console.log(blueBase);
					console.log(redBase);
      });
}

function getLobbies()
{
	var request = {
		ACTION: "LOBBY",
		WEB_ID: $.cookie('WEB_ID')
	}

	var payload = JSON.stringify(request);

	$.getJSON('http://' + host + ':' + port + '?json_ctf_server=' + payload + '?callback=?', null, function (results) {
					$('#lobbies').empty();
					$('#lobbies').append('<tr><td>ID</td><td>Blue</td><td>Red</td><td>State</td><td>Join</td></tr>');
        for(var i = 0; i < results.LOBBIES.length; i++)
        {
        	$('#lobbies').append('<tr><td>' + results.LOBBIES[i].LOBBY + '</td><td>' + results.LOBBIES[i].BLUE + '</td><td>' + results.LOBBIES[i].RED + '</td><td>' + results.LOBBIES[i].STATE + '</td><td><a href="#" class="btn btn-primary" id="join-' + results.LOBBIES[i].LOBBY + '" value="' + results.LOBBIES[i].LOBBY + '">Join</a></td></tr>')
        	$('#join-' + results.LOBBIES[i].LOBBY).click(function() {
        		joinLobby($(this).attr('value'));
        	})
        }   	
      });

	
}

function locate()
{
	navigator.geolocation.getCurrentPosition (function (pos)
	{
	  var lat = pos.coords.latitude;
	  var lng = pos.coords.longitude;
	  if(lat != latitude || lng != longitude)
	  {
	  	latitude = lat;
	  	longitude = lng;
	  	console.log(lat + "," + lng);
	  }  
	});
}

function createLobby()
{
	var request = { 
		ACTION: "CREATE", 
		LOCATION: latitude + "," +longitude, 
		SIZE: 0.0007,
		ACCURACY: 0.00026,
		WEB_ID: $.cookie('WEB_ID')
	}

	var payload = JSON.stringify(request);

	$.getJSON('http://' + host + ':' + port + '?json_ctf_server=' + payload + '?callback=?', null, function (results) {
        if(results.SUCCESS)
        {
        	lobbyID = results.ID;
        	inLobby = true;
        	// Move to lobby view.
        	getLobby();
        }
      });
}

function startGame()
{
	var request = { 
		ACTION: "START", 
		WEB_ID: $.cookie('WEB_ID')
	}

	var payload = JSON.stringify(request);

	$.getJSON('http://' + host + ':' + port + '?json_ctf_server=' + payload + '?callback=?', null, function (results) {
        console.log(results);
      });

	$('#lobbies').hide();
	$('#start_lobby').hide();

  var mapOptions = {
    zoom: 18,
    center: new google.maps.LatLng(latitude, longitude)
  };

  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  var arena;

  // Define the LatLng coordinates for the polygon's path.
  var arenaCoords = [
    new google.maps.LatLng(north, west),
    new google.maps.LatLng(north, east),
    new google.maps.LatLng(south, east),
    new google.maps.LatLng(south, west),
    new google.maps.LatLng(north, west),
  ];

  var worldCoords = [
    new google.maps.LatLng(north+10, west-10),
    new google.maps.LatLng(south-10, west-10),
    new google.maps.LatLng(south-10, east+10),
    new google.maps.LatLng(north+10, east+10),
    new google.maps.LatLng(north+10, west-10)
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

  console.log(redBase);
  var redBaseLatLng = redBase.LOCATION.split(",");
  var redBaseOverlay = {
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35,
      map: map,
      center: new google.maps.LatLng(redBaseLatLng[0], redBaseLatLng[1]),
      radius: 10
    };
    redBaseOverlay = new google.maps.Circle(redBaseOverlay);

  var blueBaseLatLng = blueBase.LOCATION.split(",");
  var blueBaseOverlay = {
      strokeColor: '#0000FF',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#0000F0',
      fillOpacity: 0.35,
      map: map,
      center: new google.maps.LatLng(blueBaseLatLng[0], blueBaseLatLng[1]),
      radius: 10
    };
    blueBaseOverlay = new google.maps.Circle(blueBaseOverlay);


  arena.setMap(map);
  // initializeMarkers();
  // setAllMap(map);
}

function joinLobby(lobby)
{
	var request = { 
		ACTION: "JOIN",
		ID: lobby,
		LOCATION: latitude + "," +longitude, 
		WEB_ID: $.cookie('WEB_ID')
	}

	var payload = JSON.stringify(request);

	$.getJSON('http://' + host + ':' + port + '?json_ctf_server=' + payload + '?callback=?', null, function (results) {
				lobbyID = lobby;
        inLobby = true;
        getLobby();
      });
}

function setup()
{
	$('#create_lobby').click(createLobby);
	$('#refresh_lobby').click(getLobbies);
	$('#start_lobby').click(startGame);

	$('#start_lobby').hide();
}

$(document).ready(function() {

	if($.cookie('WEB_ID') == null)
	{
		var username = prompt("What would you like your username to be?");
		$.cookie('USERNAME', username);
		$.cookie('WEB_ID', username + "_" + Math.random());
	}

	// Greet
	greet();

	//
	locate();

	// Setup
	setup();


});