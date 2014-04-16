// This file defines OAuth client actions for Part5.
//
var   https = require('https');
var    util = require('util');
var      qs = require('querystring');
var urlutil = require('url');

var client_host   = '127.0.0.1';
var client_port   = 5005;
var client_home   = 'https://' + client_host + ':' + client_port + '/Part5/index.html';
var client_id     = 'account-application';
var client_secret = 'passw0rd';
var token_server_options = { 'hostname': 'undefined',
                                 'port': 5050,
                                 'path': '/token',
                               'method': 'POST',
                                 'auth': client_id + ':' + client_secret,
                   'rejectUnauthorized': false,
                              'headers': {'Content-Type': 'application/x-www-form-urlencoded'}
                           };
var resource_server_options = { 'hostname': 'undefined',
                                    'port': 5051,
                                    'path': '/getAccount',
                                  'method': 'GET',
                      'rejectUnauthorized': false,
                                 'headers': {}
                              };

exports.setDpIp = function(dp_ip) {
     token_server_options.hostname = dp_ip;
  resource_server_options.hostname = dp_ip;
};

function updateClientHome() {
  client_home = 'https://' + client_host + ':' + client_port + '/Part5/index.html';
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
  util.log('Part5-----------------------------------------------------');
  util.log('Part5           client ID: ' + client_id);
  util.log('Part5       client secret: ' + client_secret);
  util.log('Part5        token server: ' + token_server_options.hostname    +
                                     ':' + token_server_options.port);
  util.log('Part5     resource server: ' + resource_server_options.hostname +
                                     ':' + resource_server_options.port);
  util.log('Part5               scope: ' + resource_server_options.path);
  util.log('Part5 Client App Homepage: ' + client_home);
  util.log('Part5-----------------------------------------------------');
};


// Accept resource owner username and password.
// jshint -W069
//
exports['getAccount'] = function(req, res) {
  util.log('Entered Part 5 getAccount handler.');
  var postbody = '';
  var result = '';
  req.setEncoding('utf8');
  req.on('data', function(chunk) {
    postbody += chunk;
  });
  req.on('end', function() {
    var postParams = qs.parse(postbody);
    if (postParams.resource) {
      resource_server_options.path = postParams.resource;
      util.log('Resource set to ' + resource_server_options.path);
      getToken();
      result = 'Client is invoking the resource server directly.';
    } else {
      result = 'Missing resource from post parameter.';
      util.error(util.inspect(postParams));
    }
    res.end(result);
  });
  res.writeHead(200, {'Content-type': 'text/plain'});
};

// Given the resource owner username and password, fetch a token from the
// token server.
//
function getToken() {
  util.log('Begin token request: Step 1 of Figure 1.');
  var req = https.request(token_server_options, handleTokenResponse);
  req.on('error', function(e) {
    util.error('Error occured while trying to open a connection to the token');
    util.error('server using the following connection properties:');
    util.error(util.inspect(token_server_options));
  });
  var body = qs.stringify({
      'grant_type': 'client_credentials',
           'scope': resource_server_options.path
  });
  req.write(body);
  req.end();
  util.log('Client sent the following body to the token server:');
  util.debug(body);
  util.log('Client credentials were sent in the authorization header.');
  util.log('End token request: Step 1 of Figure 1.');
}

// This function handles the response from the token server.
// It is passed to https.request() function as an event handler.
//
function handleTokenResponse(res) {
  util.log('++++++++++++++++ OAuth client received token server response.');
  util.log('Begin token response: Step 1 of Figure 1.');
  util.log('Token server status code: ' + res.statusCode);
  res.setEncoding('utf8');
  var responseBody = '';
  res.on('data', function(chunk) {
    responseBody += chunk;
  });
  res.on('end', function() {
    var tokenResponse = JSON.parse(responseBody);
    if (tokenResponse) {
      console.log(util.inspect(tokenResponse));
      if (tokenResponse.access_token) {
        getResource(tokenResponse.access_token);
      }
    } else {
      util.error('Could not parse token server response body: ' + responseBody);
    }
  });
  util.log('End token response: Step 1 of Figure 1.');
}

function getResource(token) {
  util.log('Begin request in Step 2 of Figure 1.');
  var urlEncodedToken = encodeURIComponent(token);
  resource_server_options.headers['Authorization'] = 'Bearer ' + urlEncodedToken;
  var req = https.request(resource_server_options, handleAccountInfo);
  req.on('error', function(e) {
    util.error('Error occurred while trying to retrieve the resource using the following properties:');
    util.error(util.inspect(resource_server_options));
  });
  util.log('OAuth client sent a resource request for ' + resource_server_options.path);
  req.end();
  util.log('End request in Step 2 of Figure 1.');
}

function handleAccountInfo(res) {
  util.log('++++++++++++++++ OAuth client received resource server response.');
  util.log('Begin response in Step 2 of Figure 1.');
  util.log('Resource server status code: ' + res.statusCode);
  res.setEncoding('utf8');
  var responseBody = '';
  res.on('data', function(chunk) {
    responseBody += chunk;
  });
  res.on('end', function() {
    var accountInfo = JSON.parse(responseBody);
    if (accountInfo) {
      util.log('Retrieved account info.');
      console.log(util.inspect(accountInfo));
      if (accountInfo.name && accountInfo.balance) {
        util.log('----------- Part 5 Success -------------');
      }
    } else {
      util.error('Could not parse resource server response: ' + chunk);
    }
  });
  util.log('End response in Step 2 of Figure 1.');
}
