var express = require("express")
  , connect = require("connect")
  , everyauth = require("everyauth")
  , io = require("socket.io")
  , fs = require("fs")
  , node_env = process.env["NODE_ENV"] || "development"
  , config = JSON.parse(fs.readFileSync("./config/" + node_env + ".json"));

// everyauth.debug = node_env == "development"

// we'll store session id's pointing to github usernames for authentication
var users = {};

everyauth.github
  .appId(config.keys.github.client_id)
  .appSecret(config.keys.github.secret)
  .findOrCreateUser(function (session, accessToken, _, user_data, env) {
    // console.log(env);
    var username = user_data.login
      , session_id = env.req.cookies["connect.sid"];

    return users[session_id] = username;
  })
  .redirectPath('/');

var app = express.createServer(
    express.bodyParser()
  , express.static(__dirname + "/public")
  , express.cookieParser()
  , express.session({ secret: config.keys.session })
  , everyauth.middleware()
);

io = io.listen(app);

app.configure(function () {
  app.set('view engine', 'jade');
});

app.get('/', function (req, res) {
  res.render('home');
});

io.sockets.on('connection', function (socket) {
  var cookie = connect.utils.parseCookie(socket.handshake.headers.cookie)
    , username = users[cookie['connect.sid']];
  
  if (!username) return;

  socket.emit('set_username', username);
  socket.broadcast.emit('msg', {username: username, msg: "entered dallas node"});
  socket.on('msg', function (msg) {
    socket.broadcast.emit('msg', {username: username, msg: msg});
  });
});

everyauth.helpExpress(app);

app.listen(config.port, function () {
  console.log("listening on " + config.port);
});
