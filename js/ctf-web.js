function greet()
{
	var greeting = { 
		ACTION: "HELLO", 
		USERNAME: $.cookie('USERNAME'), 
		BLUETOOTH: '01:23:45:67:89:ab', 
		WEB_ID: $.cookie('WEB_ID')
	}

	var payload = JSON.stringify(greeting);
	var jqxhr = $.get( "http://acm.cs.memphis.edu:4444?json_ctf_server=" + payload, function(data) {
		console.log(data);
	})
  .done(function() {
    alert( "second success" );
  });
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

});