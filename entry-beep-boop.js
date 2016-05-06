// ENTRY POINT FOR BEEP BOOP SERVERS
var Beepboop = require('beepboop-botkit');
var Botkit = require('botkit');
var dotenv = require('dotenv').config();
var goferbot = require('./goferbot.js');

var controller = Botkit.slackbot();
var beepboop = Beepboop.start(controller, {
  debug: true
});

beepboop.on('add_resource', function(msg) {
  console.log('received request to add bot to team');
});

goferbot(controller, beepboop.bot);
