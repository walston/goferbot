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

controller.on('direct_message', function heraldResponse(bot, message) {
  bot.startConversation(message, function conversation(err, convo) {
    convo.ask('What would you like?', function takeOrder(response, convo) {
      convo.say('Awesome: `' + response.text + '` has been added to the order');
      convo.next();
    });
  });
});

herald();
