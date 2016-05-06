var CronJob = require('cron').CronJob;
var dotenv = require('dotenv').config();
var uuid = require('node-uuid');
var Wit = require('node-wit').Wit;
var dbmanager = require('./lib/dbmanager.js');
var logic = require('./lib/witlogic.js');
var takeOrder = require('./lib/takeOrder.js');

var wit = new Wit(process.env.WIT_TOKEN, logic.actions);

module.exports = function(controller, botkit){
  controller.hears('pick up', 'direct_message', getOrderList);
  controller.on('direct_message', anonymousConvo);
  controller.on('rtm_open', call);
}

function getOrderList(bot, message) {
 var list = dbmanager.get(message.team);
 list.then(function(tab) {
   var text = tab.map(function(order) {
     return (order.real_name || order.name || order.user) + ' wants `' + order.order + '`';
   }).join('\n')
   bot.reply(message, text);
 });
}

function morningCall(error, convo) {
  convo.sessionId = convo.sessionId || uuid.v1();
  convo.context = {};
  var slackApi = convo.task.bot.api;
  var userInfo = { user: convo.source_message.user };
  slackApi.users.info(userInfo, function(err, ping) {
    if (!err && ping.ok) {
      convo.user = ping.user.profile;
      convo.user.name = ping.user.name;
      convo.user.id = ping.user.id;
      var greeting = 'Good morning! I\'m taking coffee orders right now, would you like anything?'
      convo.ask(greeting, takeOrder(convo).askProcessing);
    }
  });
}

function anonymousConvo(bot, message) {
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
}

function call(bot) {
  // new CronJob('00 45 09 * * 1-5', call, null, true, 'America/Los_Angeles');
  var teamId = bot.team_info.id;
  dbmanager.customerList(teamId).then(function(customers) {
    customers.forEach(function(customer) {
      bot.startPrivateConversation(customer, morningCall);
    });
  });
};
