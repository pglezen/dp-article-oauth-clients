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
