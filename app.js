var Beepboop = require('beepboop-botkit');
var Botkit = require('botkit');
var Beepboop = require('beepboop-botkit');
var CronJob = require('cron').CronJob;
var dotenv = require('dotenv').config();
var uuid = require('node-uuid');
var Wit = require('node-wit').Wit;
var dbmanager = require('./dbmanager.js');
var logic = require('./witlogic.js');
var takeOrder = require('./takeOrder.js');
var wit = new Wit(process.env.WIT_TOKEN, logic.actions);
var controller = Botkit.slackbot();
var beepboop = Beepboop.start(controller, {
  debug: true
});

beepboop.on('add_resource', function(msg) {
  console.log('received request to add bot to team');
});

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
      bot.reply(message, 'Sorry, i\'m confused by what you\'re saying');
    }
  });
});

controller.on('bot_join_channel', function(bot) {
  function call() {
    var teamId = bot.team_info.id;
    dbmanager.customerList(teamId).then(function(customers) {
      customers.forEach(function(customer) {
        botkit.startPrivateConversation(customer, morningCall);
      });
    });
  };

  // new CronJob('00 45 09 * * 1-5', call, null, true, 'America/Los_Angeles');
  call();
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
