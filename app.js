var dotenv = require('dotenv').config();
if (!process.env.SLACK_BOT_TOKEN) {
  console.log('Error: Specify token in environment');
  process.exit(1);
}
var request = require('request');
var Botkit = require('botkit');
var herald = require('./herald.js');

var controller = Botkit.slackbot({ debug: true });
controller.spawn({ token: process.env.SLACK_BOT_TOKEN }).startRTM();

controller.on('direct_message', function converse(bot, message) {
  bot.reply(message, 'Just kidding. I just showed up: I\'ve got no clue what\'s going on');
});

herald();
