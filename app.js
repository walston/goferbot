var dotenv = require('dotenv').config();
if (!process.env.SLACK_BOT_TOKEN) {
  console.log('Error: Specify token in environment');
  process.exit(1);
}
var Botkit = require('botkit');
var herald = require('./herald.js');
var dbmanager = require('./dbmanager.js')

var controller = Botkit.slackbot({ debug: true });
var botkit = controller.spawn({ token: process.env.SLACK_BOT_TOKEN })
botkit.startRTM();

controller.hears('pick up', 'direct_message', function(bot, message) {
  var list = dbmanager.get(message.team);
  list.then(function(results) {
    function composeResponse(tab) {
      var orders = tab.map(function(order){
        return '`' + order.user + '` wants `' + order.order + '`';
      })
      return orders.join('\n');
    }
    bot.reply(message, composeResponse(results));
  });
})

controller.on('direct_message', function heraldResponse(bot, message) {
  bot.startConversation(message, function conversation(err, convo) {
    convo.ask('What would you like?', function takeOrder(response, convo) {
      var additive = {
        team: response.team,
        user: response.user,
        order: response.text
      }
      convo.say('Awesome: `' + response.text + '` has been added to the order');
      dbmanager.add(additive)
      convo.next();
    });
  });
});

herald();
