var dotenv = require('dotenv').config();
if (!process.env.SLACK_BOT_TOKEN || !process.env.WIT_TOKEN) {
  console.log('Error: Specify token in environment');
  process.exit(1);
}
var Botkit = require('botkit');
var dbmanager = require('./dbmanager.js');
var Wit = require('node-wit').Wit;
var logic = require('./witlogic.js');
var wit = new Wit(process.env.WIT_TOKEN, logic.actions);
var uuid = require('node-uuid')

var controller = Botkit.slackbot({ debug: true });
var botkit = controller.spawn({ token: process.env.SLACK_BOT_TOKEN })
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
  var greeting = 'Good morning! I\'m taking coffee orders right now, would you like anything?'

  function witProcessing(err, data) {
    if (!err) {
      switch(data.type) {
        case "merge":
          var resolveContext = new Promise(function(resolve, reject) {
            logic.actions.merge(
              convo.sessionId,
              convo.context,
              data.entities,
              undefined,
              function(updates) {
                resolve(updates);
              }
            );
          });
          resolveContext.then(function(newContext) {
            convo.context = newContext;
            wit.converse(
              convo.sessionId,
              undefined,
              convo.context,
              witProcessing
            );
          })
          break;
        case "msg":
          convo.ask(data.msg, askProcessing);
          convo.next();
          break;
        case "action":
          logic.actions[data.action](
            convo.sessionId,
            convo.context,
            function(context) {
              dbmanager.add({
                user: convo.source_message.user,
                beverage: {
                  bev: context.bev,
                  size: context.size
                }
              }).then(function(results) {
                console.log('successfully added');
              })
            }
          );
          wit.converse(
            convo.sessionId,
            undefined,
            convo.context,
            witProcessing
          );
          break;
        case "stop":
          console.log('All done talking to wit');
          break;
        default:
          console.log('********************');
          console.log('something went wrong...');
          console.log(data);
      }
    };
  }

  function askProcessing(response, convo) {
    wit.converse(
      convo.sessionId,
      response.text,
      convo.context,
      witProcessing
    );
  }

  convo.ask(greeting, askProcessing);
});
