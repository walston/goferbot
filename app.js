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
  convo.sessionId = uuid.v1() || convo.sessionId;
  convo.context = {};
  var greeting = 'Good morning! I\'m taking coffee orders right now, would you like anything?'

  function witProcessing(err, data) {
    // handle responses from wit.ai/converse
    console.log('>> RESPONSE CONTENTS <<');
    console.log(data || err);
    if (!err) {
      switch(data.type) {
        case "merge":
          convo.context = logic.merge(
            convo.sessionId,
            convo.context,
            data.entities
          );
          wit.converse(
            convo.sessionId,
            undefined,
            convo.context,
            witProcessing
          );
          break;
        case "msg":
          convo.say(data.msg);
          convo.next();
          wit.converse(
            convo.sessionId,
            undefined,
            convo.context,
            witProcessing
          );
          break;
        case "action":
          logic.actions[data.action];
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

  function userProcessing(response, convo) {
    wit.converse(
      convo.sessionId,
      response.text,
      convo.context,
      witProcessing
    );
  }

  convo.ask(greeting, userProcessing);
});
