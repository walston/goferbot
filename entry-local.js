var dotenv = require('dotenv').config();
var Botkit = require('botkit');
var goferbot = require('./goferbot.js');
var storage = require('botkit-storage-mongo')({
  mongoUri: 'mongodb://' +
    process.env.MLAB_USER + ':' +
    process.env.MLAB_PASSWORD +
    '@ds021761.mlab.com:21761/goferbot'
});

var controller = Botkit.slackbot({
  debug: true,
  storage: storage
});
var botkit = controller.spawn({ token: process.env.SLACK_TOKEN })
botkit.startRTM();

goferbot(controller, botkit)
