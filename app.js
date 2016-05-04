var dotenv = require('dotenv').config();
if (!process.env.SLACK_TOKEN || !process.env.WIT_TOKEN) {
  console.log('Error: Specify token in environment');
  process.exit(1);
}
var Botkit = require('botkit');
var dbmanager = require('./dbmanager.js');
var Wit = require('node-wit').Wit;
var logic = require('./witlogic.js');
var wit = new Wit(process.env.WIT_TOKEN, logic.actions);
var uuid = require('node-uuid');
var takeOrder = require('./takeOrder.js');

var controller = Botkit.slackbot({ debug: true });
var botkit = controller.spawn({ token: process.env.SLACK_TOKEN })
botkit.startRTM();

controller.hears('pick up', 'direct_message', function(bot, message) {
  var list = dbmanager.get(message.team);
  list.then(function(tab) {
    var text = tab.map(function(order) {
      return (order.real_name || order.name || order.user) + ' wants `' + order.order + '`';
    }).join('\n')
    bot.reply(message, text);
  });
})

botkit.startPrivateConversation({ user: 'U0MDN9QK1' }, function(error, convo) {
  convo.sessionId = convo.sessionId || uuid.v1();
  convo.context = {};
  var userInfo = { user: convo.source_message.user };
  botkit.api.users.info(userInfo, function(err, response) {
    if (!err && response.ok) {
      convo.user = response.user.profile;
      convo.user.name = response.user.name;
      convo.user.id = response.user.id;
      greet();
    }
  });

  function greet() {
    var greeting = 'Good morning! I\'m taking coffee orders right now, would you like anything?'
    convo.ask(greeting, takeOrder(convo).askProcessing);
  }
});
