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
var uuid = require('node-uuid');
var EventEmitter = require('events');

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
  convo.events = new EventEmitter();
  convo.events.on('initialized', greet) // fired after initialized
  convo.events.on('userInput', askProcessing); // fired when a userInput is received
  convo.events.on('witValidation', witProcessing); // fired when wit.ai is received
  convo.events.on('merge', merge);
  convo.events.on('message', message);
  convo.events.on('action', action);
  convo.events.on('end', convo.stop);

  convo.sessionId = convo.sessionId || uuid.v1();
  convo.context = {};
  var userInfo = { user: convo.source_message.user };
  botkit.api.users.info(userInfo, function(err, response) {
    if (!err && response.ok) {
      convo.user = response.user.profile;
      convo.user.name = response.user.name;
      convo.user.id = response.user.id;
      convo.events.emit('initialized');
    }
  });

  function greet() {
    var greeting = 'Good morning! I\'m taking coffee orders right now, would you like anything?'
    convo.ask(greeting, askProcessing);
  }

  function askProcessing(response, convo) {
    wit.converse(
      convo.sessionId,
      response.text,
      convo.context,
      witProcessing
    );
  }

  function witProcessing(err, data) {
    if (!err) {
      switch(data.type) {
        case "merge":
          convo.events.emit('merge', data.entities);
          break;
        case "msg":
          convo.events.emit('message', data.msg);
          break;
        case "action":
          convo.events.emit('action', data.action);
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

  function merge(entities) {
    var sessionId = convo.sessionId;
    var context = convo.context;
    logic.actions.merge(sessionId, context, entities, undefined, cb);
    function cb(newContext) {
      convo.context = newContext;
      wit.converse(
        convo.sessionId,
        undefined,
        convo.context,
        witProcessing
      );
    }
  }

  function message(text) {
    convo.ask(text, askProcessing);
    convo.next();
  }

  function action(actionName) {
    var beverage = {
      bev: convo.context.bev,
      size: convo.context.size
    };
    var ticket = {
      user: convo.user,
      beverage: beverage
    };
    function cb() {
      dbmanager.add(ticket).then(function(results) {
        console.log('successfully added');
      });
    }
    logic.actions[actionName](convo.sessionId,convo.context, cb);

    wit.converse(
      convo.sessionId,
      undefined,
      convo.context,
      witProcessing
    );
  }
});
