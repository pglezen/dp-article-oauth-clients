// This is a Node.js implementation of the OAuth client role of
// exercises for the DataPower OAuth series of articles published
// on IBM's developerWorks.  It avoids Node.js middleware frameworks
// such as Connect and Express to minimize the prerequisites for
// readers.

var    http = require('http');
var   https = require('https');
var  qsutil = require('querystring');
var urlutil = require('url');
var    util = require('util');
var      fs = require('fs');

var OAuthClients = {
    'Part6': require('./part6/client.js')
};
for (var client in OAuthClients) {
  OAuthClients[client].showSettings();
}

var  router = function(req, res) {
  var url = urlutil.parse(req.url);
  util.log('-------------- Path: ' + url.path + ' ----------------');
	if (url.path === '/favicon.ico') {
	  sendError(res);
		return;
	}
  var staticFileCandidate = url.pathname.substring(1);
  var file = fs.createReadStream(staticFileCandidate);
  file.on('open', function() {
    util.log('Returning static file relative to doc root: ' + staticFileCandidate);
    file.pipe(res);
  });
  // If the error handler gets called, then the static file
  // does not exist.  That's fine; but there better be a 
  // route to handle the request; otherwise it's an error.
  //
  file.on('error', function(err) {
    // Expect URI of the form /Part6/doSomething
    var routeComponents = url.pathname.match(/^\/(Part\d+)\/(.+)/);
    if (routeComponents  &&  routeComponents.length === 3) {
      var    app = routeComponents[1];
      var action = routeComponents[2];
      var client = OAuthClients[app];
      if (client) {
        var handler = client[action];
        if (handler) {
          handler(req, res);
        } else {
          util.error('Application ' + app + ' has no handler for action ' + action);
          sendError(res);
        }
      } else {
        util.error('Application ' + app + ' was requested; but is not loaded.');
        sendError(res);
      }
    } else {
		 util.error('Could not find matching file or application handler.');
     util.error('Encountered file error: ' + err);
     sendError(res);
    }
  });
};

function sendError(res) {
  res.writeHead(404, {'Content-Type': 'text/plain'});
  res.write('Bad request\n');
  res.end();
}

var options = {
   key: fs.readFileSync('OAuthClient-privkey.pem'),
  cert: fs.readFileSync('OAuthClient-sscert.pem')
};

var server = https.createServer(options, router);
server.listen(5005);
util.log('OAuth client is listening on port 5005 and expecting SSL.');


