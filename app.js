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

controller.on('direct_message', function(bot, message) {
  var context = {}
  wit.message(message.text, function(err, data) {
    var entities = data.outcomes[0].entities;
    var intent;
    logic.actions.merge('', {}, entities, '', function(context) {
        intent = context.intent;
      });
    if (!err && intent == 'addToList') {
      bot.startTyping(message);
      console.log('Writing to database...');
      dbmanager.customerAdd(message.team, message.user)
        .then(function(databaseResults) {
          console.log(bot);
          bot.reply(message, 'Okay, I\'ll write your name down and let you know next time we make a run.');
        })
        .catch(function(err) {
          bot.reply(message, 'Something went wrong. Sorry');
        })
      ;
    }
    else {
      bot.reply(message, 'Sorry, i\'m confused by what you\'re saying')
    }
  });
});

controller.on('rtm_open', function(bot) {
  var teamId = bot.team_info.id;
  dbmanager.customerList(teamId).then(function(customers) {
    customers.forEach(function(customer) {
      botkit.startPrivateConversation(customer, morningCall);
    });
  });
});

function morningCall(error, convo) {
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
}
