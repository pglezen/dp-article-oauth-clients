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

var     dp_ip = '192.168.152.12';
var client_ip = '127.0.0.1';
var      port = 5005;

if (process.argv.length > 4) {
  console.log('\nUsage: node OAuthClient [DataPower IP [Client IP]]\n');
  console.log('\tIf [DataPower IP] is not supplied, ' + dp_ip + ' is assumed.');
  console.log('\tIf [Client IP] is not supplied, ' + client_ip + ' is assumed.');
  console.log('\tTo change this default, search for \'dp_ip\' in OAuthClient.js\n');
  return;
}
if (process.argv.length > 2) {
  dp_ip = process.argv[2];
}
if (process.argv.length > 3) {
  client_ip = process.argv[3];
}

var OAuthClients = {
    'Part4': require('./part4'),
    'Part5': require('./part5'),
    'Part6': require('./part6')
};
for (var client in OAuthClients) {
  OAuthClients[client].setDpIp(dp_ip);
  OAuthClients[client].setClientPort(port);
  OAuthClients[client].setClientHost(client_ip);
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
server.listen(port);
util.log('OAuth client is listening on port ' + port + ' and expecting SSL.');


