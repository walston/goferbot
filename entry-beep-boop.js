// ENTRY POINT FOR BEEP BOOP SERVERS
var Beepboop = require('beepboop-botkit');
var Botkit = require('botkit');
var dotenv = require('dotenv').config();
var goferbot = require('./goferbot.js');
var storage = require('botkit-storage-mongo')({
  mongoUri: 'mongodb://' +
    process.env.MLAB_USER + ':' +
    process.env.MLAB_PASSWORD +
    '@ds021761.mlab.com:21761/goferbot'
});

var controller = Botkit.slackbot();
var beepboop = Beepboop.start(controller, {
  debug: true,
  storage: storage
});

beepboop.on('add_resource', function(msg) {
  console.log('received request to add bot to team');
});

goferbot(controller, beepboop.bot);
