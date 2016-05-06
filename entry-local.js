var dotenv = require('dotenv').config();
var Botkit = require('botkit');
var goferbot = require('./goferbot.js')

var controller = Botkit.slackbot({ debug: true });
var botkit = controller.spawn({ token: process.env.SLACK_TOKEN })
botkit.startRTM();

goferbot(controller, botkit)
