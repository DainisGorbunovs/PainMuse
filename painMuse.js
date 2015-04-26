var osc = require("osc");
var http = require('http');
var querystring = require('querystring');

logAction("Started PainMuse.");

// Create an osc.js UDP Port listening on port 57121. 
var udpPort = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: 5006
});

var active = false;

// ***** EDIT THIS SERVER ADDRESS *****
var twilioAddress = '81959c8a.ngrok.io';

// Listen for incoming OSC bundles. 
udpPort.on("message", function (oscBundle) {
	switch(oscBundle.address)
	{
		case "/muse/config":
			logAction(JSON.parse(oscBundle.args[0]).battery_percent_remaining + "% battery");
			break;
		case "/muse/eeg/quantization":
			// rise the eyebrows up
			if (oscBundle.args[1] > 8 && oscBundle.args[2] > 8)
			{
				//logAction("Surprised");
	    		if (!active)
	    		{
	    			// post a message
		    		logAction("Posting message to support");
		    		//postCode("Need help");
            postCode("Need help");
		    		logAction("Sent a message to support");
	    		}
	    		active = true;
		    }
		    else
	    		active = false;
			break;
	}
});

function postCode(codestring) {
  // Build the post string from an object
  var post_data = querystring.stringify({
      'compilation_level' : 'ADVANCED_OPTIMIZATIONS',
      'output_format': 'json',
      'output_info': 'compiled_code',
        'warning_level' : 'QUIET',
        'js_code' : codestring
  });

  // An object of options to indicate where to post to
  var post_options = {
      host: twilioAddress,
      port: '80',
      path: '/',
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': post_data.length
      }
  };

  // Set up the request
  var post_req = http.request(post_options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          console.log('Response: ' + chunk);
      });
  });

  // post the data
  post_req.write(post_data);
  post_req.end();
  udpPort.close();
}

function logAction(action)
{
	console.log(new Date(), ":", action);
}

// Open the socket. 
udpPort.open();