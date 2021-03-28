/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
require('dotenv').config();
// var client_id = '6450a42517584193831cbdc7616406ec'; // Your client id
// var client_secret = '4e57ce393d4e4a0ba110fd8c035749aa'; // Your secret
// var redirect_uri = 'http://localhost:8888/shabbadoo'; // Your redirect uri

//TODO: make .env work so im not revealing stuff
var client_id = process.env.ID; // Your client id
var client_secret = process.env.SECRET; // Your secret
var redirect_uri = process.env.REDIRECT; // Your redirect uri
var TOKEN = 0;
var URL = 'https://api.spotify.com/v1/me';
var tracksToPlaylists = new Map();
var playlist_id = 0;
var totalTracks = 0;

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/shabbadoo', function(req, res) {
  //this redirect URI is set in app settings on developer.spotify.com

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: { 
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;
        TOKEN = access_token;
        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }

    });
  }
});

async function getPlaylist() {
  var playlists = [];
  var totalPlaylists = 0;
  let limit = 0;

  var playlistOptions = {
    url: 'https://api.spotify.com/v1/me/playlists?limit=' + limit,
    headers: { 'Authorization': 'Bearer ' + TOKEN},
    json: true
  };

  await request.get(playlistOptions, function(error, response, body) {
    totalPlaylists = body.total;
  })
  
  limit = 50;
  let numCalls = 

  await request.get(playlistOptions, async function(error, response, body) {
    for(let i = 0; i<body.items.length; i++) {
      var playlist = body.items[i];
      var playlist_name = playlist.name;
      var playlist_id = playlist.id;
      var numTracks = playlist.tracks.total;
      console.log("title:" + playlist_name + "!!!!!!!!!!!!");
      console.log("now entering getTracks: ");
      getTracks(playlist_name, playlist_id, numTracks, TOKEN);
    };
    
    // TODO: loop to get more playlists
  })
}

async function getTracks(playlistName, playlistID, numTracks, access_token) {
  var tracks = [];
  let limit = 100;
  let numCalls = Math.floor(numTracks/limit) + 1;
  var base_url = 'https://api.spotify.com/v1/playlists/' + playlistID + '/tracks';
  var options = {
    url: base_url,
    headers: { 'Authorization': 'Bearer ' + access_token},
    json: true
  };
  for (const x of Array(numCalls).keys()) {
    options.url = base_url + "?offset=" + 100*x + "&limit=" + limit;
    await request.get(options, async function(error, response, body) {
      console.log(x)
      await body.items.forEach((someTrack)=> {
        let track = someTrack.track.name;
        if (tracksToPlaylists.has(track)) {
          tracksToPlaylists.get(track).push(playlistName);
        } else {
          tracksToPlaylists.set(track, [playlistName]);
        }
      });
    });
  }
}

function testFunc() {
  console.log(tracksToPlaylists.get('Andrew'));
}


app.get('/get_playlist', function(req, res) {
  getPlaylist();
});

app.get('/test', function(req,res) {
    testFunc();
  });


app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

console.log('Listening on 8888');
app.listen(8888);
