var dotenv = require('dotenv').config();
if (!process.env.SLACK_BOT_TOKEN) {
  console.log('Error: Specify token in environment');
  process.exit(1);
}
var Botkit = require('botkit');
var herald = require('./herald.js');
var dbmanager = require('./dbmanager.js');
var wit = require('./ai.js');

var controller = Botkit.slackbot({ debug: true });
var botkit = controller.spawn({ token: process.env.SLACK_BOT_TOKEN });
botkit.startRTM();

controller.hears('pick up', 'direct_message', function(bot, message) {
  var list = dbmanager.get(message.team);
  list.then(function(tab) {
    var text = tab.map(function(order) {
      return (order.real_name || order.name || order.user) + ' wants `' + order.order + '`';
    }).join('\n')
    bot.reply(message, text);
  });
});

controller.hears('Can I get a cup of coffee?', 'direct_message', function(bot, message) {
  wit.message(message.text, message.channel, function(err, data) {
    console.log('**************************************************');
    console.log(err || data);
    bot.reply(message, data);
  })
})

controller.on('direct_message', function heraldResponse(bot, message) {
  bot.startConversation(message, function conversation(err, convo) {
    convo.ask('What would you like?', function takeOrder(response, convo) {
      var additive = {
        team: response.team,
        user: response.user,
        order: response.text
      }
      var getUser = new Promise(function(resolve, reject) {
        bot.api.users.info({ user: response.user }, function(err, body) {
          if (!err && body.ok) {
            additive.name = body.user.name;
            additive.real_name = body.user.profile.real_name;
            resolve(additive);
          }
          else {
            reject(additive);
          }
        });
      });
      getUser.then(function(additive) {
        convo.say('Awesome: `' + additive.order + '` has been added to the order');
        dbmanager.add(additive)
        convo.next();
      });
    });
  });
});

herald();
