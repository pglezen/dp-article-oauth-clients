// This file defines OAuth client actions for Part6.
//
var   https = require('https');
var    util = require('util');
var      qs = require('querystring');
var urlutil = require('url');

var client_host   = '127.0.0.1';
var client_port   = 5005;
var client_home   = 'https://' + client_host + ':' + client_port + '/Part6/index.html';
var redirect_uri  = 'https://' + client_host + ':' + client_port + '/Part6/getAccount/code'; 
var client_id     = 'myregistered_oauthclient';
var client_secret = 'passw0rd';
var token_server_options = { 'hostname': 'undefined',
                                 'port': 5060,
                                 'path': '/token',
                               'method': 'POST',
                                 'auth': client_id + ':' + client_secret,
                   'rejectUnauthorized': false,
                              'headers': {'Content-Type': 'application/x-www-form-urlencoded'}
                           };
var resource_server_options = { 'hostname': 'undefined',
                                    'port': 5061,
                                    'path': '/getAccountInfo',
                                  'method': 'GET',
                      'rejectUnauthorized': false,
                                 'headers': {}
                              };

exports.setDpIp = function(dp_ip) {
     token_server_options.hostname = dp_ip;
  resource_server_options.hostname = dp_ip;
};

function updateClientHome() {
  client_home  = 'https://' + client_host + ':' + client_port + '/Part6/index.html';
  redirect_uri = 'https://' + client_host + ':' + client_port + '/Part6/getAccount/code';
}

exports.setClientPort = function(port) {
  client_port = port;
  updateClientHome();
};

exports.setClientHost = function(host) {
  client_host = host;
  updateClientHome();
};

exports.showSettings = function() {
  util.log('Part6-----------------------------------------------------');
  util.log('Part6            client ID: ' + client_id);
  util.log('Part6        client secret: ' + client_secret);
  util.log('Part6 authorization server: ' + token_server_options.hostname +
                                      ':' + token_server_options.port);
  util.log('Part6      resource server: ' + resource_server_options.hostname +
                                      ':' + resource_server_options.port);
  util.log('Part6                scope: ' + resource_server_options.path);
  util.log('Part6  Client App Homepage: ' + client_home);
  util.log('Part6-----------------------------------------------------');
};

// Return a redirect to acquire auth code.
// jshint -W069
//
exports['getAccount/auth'] = function(req, res) {
  util.log('Entered Part6 getAccount/auth handler.  Step 3 of Figure 1 completed.');
  var postBody = '';
  req.setEncoding('utf8');
  req.on('data', function(chunk) {
    postBody += chunk;
  });
  req.on('end', function() {
    var postParams = qs.parse(postBody);
    if (postParams.resource) {
      resource_server_options.path = postParams.resource;
      util.log('Resource set to ' + resource_server_options.path);
    }
    var locationURI = 'https://' + token_server_options.hostname + ':' +
                                   token_server_options.port + '/authorize?' +
                      qs.stringify({
                        'response_type': 'code',
                        'client_id': client_id,
                        'scope': resource_server_options.path,
                        'state': 'xyz',
                        'redirect_uri': redirect_uri
                    });

    util.log('Client sending redirect back to browser.');
    util.debug('  Location header: ' + locationURI);
    res.writeHead(302, {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Location': locationURI
    });
    res.end();
    util.log('Redirect sent (Step 4 of Figure 1).');
    util.log('The Authorization server should now be challenging you, the resource owner,');
    util.log('to provide your credentials (Step 5 of Figure 1).  If successful, you\'ll');
    util.log('be asked whether to provide me, the OAuth client, a grant code.');
  });
};

// Handle a returned authorization code.
//
exports['getAccount/code'] = function(req, res) {
  util.log('Entered Part 6 getAccount/code handler.  Step 7 of Figure 1 completed.');
  var url = urlutil.parse(req.url, true);
  var result = '';
  if (url.query.error) {
    util.error('Authorization grant failed: ' + url.query.error);
    result = url.query.error + '\n';
    if (url.query.error_description) {
      util.error('  Error description provided: ' + url.query.error_description);
      result += url.query.error_description;
    }
  } else {
    if (url.query.code) {
      getToken(url.query.code);
    } else {
      util.error('Authorization code was absent');
    }
    util.debug('State = ' + url.query.state);
    result = 'Client recieved the auth code.\nFurther interactions will be between ' +
             'the client, the OAuth authorization server, and the resource server.';
  }
    
  res.writeHead(200, {'Content-type': 'text/plain'});
  res.end(result);
};

// Given an authorization code, fetch a token from the
// authorization server.
//
function getToken(authCode) {
  util.log('Begin Step 8 of Figure 1.');
  var req = https.request(token_server_options, handleTokenResponse);
  req.on('error', function(e) {
    util.error('Error occured while trying to open a connection to the token');
    util.error('server using the following connection properties:');
    util.error(util.inspect(token_server_options));
  });
  var body = qs.stringify({
    'grant_type': 'authorization_code',
          'code': authCode,
  'redirect_uri': redirect_uri
  });
  req.write(body);
  req.end();
  util.log('Client sent the following body to the token server:');
	util.log('Step 8 of Figure 1 complete.');
  util.debug(body);
}

// This function handles the response from the token server.
// It is passed to https.request() function as an event handler.
//
function handleTokenResponse(res) {
  util.log('++++++++++++++++ OAuth client received token server response.');
	util.log('Begin Step 9 of Figure 1.');
  util.log('Token server status code: ' + res.statusCode);
  res.setEncoding('utf8');
  res.on('data', function(chunk) {
    var tokenResponse = JSON.parse(chunk);
    if (tokenResponse) {
      console.log(util.inspect(tokenResponse));
      if (tokenResponse.access_token) {
        getResource(tokenResponse.access_token);
      }
    } else {
      util.error('Could not parse token server response body: ' + chunk);
    }
  });
	util.log('Step 9 of Figure 1 complete.');
}

function getResource(token) {
  util.log('Begin Step 10 of Figure 1.');
  var urlEncodedToken = encodeURIComponent(token);
  resource_server_options.headers['Authorization'] = 'Bearer ' + urlEncodedToken;
  var req = https.request(resource_server_options, handleAccountInfo);
  req.on('error', function(e) {
    util.error('Error occurred while trying to retrieve the resource using the following properties:');
    util.error(util.inspect(resource_server_options));
  });
  util.log('OAuth client sent a resource request for ' + resource_server_options.path);
	req.end();
	util.log('Step 10 of Figure 1 complete.');
}

function handleAccountInfo(res) {
  util.log('++++++++++++++++ OAuth client received resource server response.');
	util.log('Begin Step 11 of Figure 1.');
  util.log('Resource server status code: ' + res.statusCode);
  res.setEncoding('utf8');
  res.on('data', function(chunk) {
    var accountInfo = JSON.parse(chunk);
    if (accountInfo) {
      util.log('Retrieved account info.');
      console.log(util.inspect(accountInfo));
      if (accountInfo.name && accountInfo.balance) {
        util.log('----------- Part 6 Success -------------');
      }
    } else {
      util.error('Could not parse resource server response: ' + chunk);
    }
  });
  util.log('Step 11 of Figure 1 complete.');
}
