var dotenv = require('dotenv').config();
var Botkit = require('botkit');
var goferbot = require('./goferbot.js')
var storage = require('./lib/botkit-storage.js');

var controller = Botkit.slackbot({
  debug: true,
  storage: storage
});
var botkit = controller.spawn({ token: process.env.SLACK_TOKEN })
botkit.startRTM();

goferbot(controller, botkit)
