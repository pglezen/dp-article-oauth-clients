dp-article-oauth-clients
========================

IBM is updating a 
[series of articles](http://www.ibm.com/developerworks/websphere/library/techarticles/1208_rasmussen/1208_rasmussen.html)
addressing OAuth implementations
on WebSphere DataPower appliances to reflect improvements in the latest
firmware release.  Four parts of the 10 part series focus on the
standard OAuth grant types:

* authorization code grant
* implicit grant
* resource owner password credentials grant
* client credentials grant

Each of these grant-type articles incorporates an exercise to configure
an Authorization/Token service and enforcement point service.  This
project provides a Node.js implementation of an OAuth client to help
validate the configuration of these exercises.

##Installation##

Just clone to your local hard drive.  The only dependency is
[Node.js](http://nodejs.org/download/).
No fancy middleware is required.

##Execution##

Change to the main directory (with OAuthClient.js in it) and run

```
node OAuthClient [DP IP address]
```

It should print out a list of the article parts that have been
included.  In the example below, article parts 4, 5, and 6 have
been included.  Part 8 has not.

```
$ node OAuthClient 192.168.152.12
15 Apr 14:29:54 - Part4-----------------------------------------------------
15 Apr 14:29:54 - Part4           client ID: password-client
15 Apr 14:29:54 - Part4       client secret: passw0rd
15 Apr 14:29:54 - Part4        token server: 192.168.152.12:5040
15 Apr 14:29:54 - Part4     resource server: 192.168.152.12:5041
15 Apr 14:29:54 - Part4               scope: /getAccount
15 Apr 14:29:54 - Part4 Client App Homepage: https://127.0.0.1:5005/Part4/index.html
15 Apr 14:29:54 - Part4-----------------------------------------------------
15 Apr 14:29:54 - Part5-----------------------------------------------------
15 Apr 14:29:54 - Part5           client ID: account-application
15 Apr 14:29:54 - Part5       client secret: passw0rd
15 Apr 14:29:54 - Part5        token server: 192.168.152.12:5050
15 Apr 14:29:54 - Part5     resource server: 192.168.152.12:5051
15 Apr 14:29:54 - Part5               scope: /getAccount
15 Apr 14:29:54 - Part5 Client App Homepage: https://127.0.0.1:5005/Part5/index.html
15 Apr 14:29:54 - Part5-----------------------------------------------------
15 Apr 14:29:54 - Part6-----------------------------------------------------
15 Apr 14:29:54 - Part6            client ID: myregistered_oauthclient
15 Apr 14:29:54 - Part6        client secret: passw0rd
15 Apr 14:29:54 - Part6 authorization server: 192.168.152.12:5060
15 Apr 14:29:54 - Part6      resource server: 192.168.152.12:5061
15 Apr 14:29:54 - Part6                scope: /getAccountInfo
15 Apr 14:29:54 - Part6  Client App Homepage: https://127.0.0.1:5005/Part6/index.html
15 Apr 14:29:54 - Part6-----------------------------------------------------
15 Apr 14:29:54 - OAuth client is listening on port 5005 and expecting SSL.
```

Each article part has its own homepage.  To get started with a particular
part, copy-n-paste the URL it lists for its *Client App Homepage*.
It's assumed your browser and your
Node.js server are running on the same machine.  You can run the OAuth client
anywhere you want so long as it has direct access to DataPower.
