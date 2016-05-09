var EventEmitter = require('events');
var uuid = require('node-uuid');
var Wit = require('node-wit').Wit;
var logic = require('./witlogic.js');
var dbmanager = require('./dbmanager.js');

var wit = new Wit(process.env.WIT_TOKEN, logic.actions);

module.exports = function (bot) {
  // new CronJob('00 45 09 * * 1-5', call, null, true, 'America/Los_Angeles');
  var teamId = bot.team_info.id;
  dbmanager.customerList(teamId)
  .then(function(customers) {
    customers.forEach(function(customer) {
      bot.startPrivateConversation(customer, ordering);
    });
  });
}

function ordering(error, convo) {
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

function takeOrder(convo) {
  convo.events = new EventEmitter();
  convo.events.on('typing', typing);
  convo.events.on('merge', merge);
  convo.events.on('message', message);
  convo.events.on('action', action);
  convo.events.on('end', end);

  function askProcessing(response, convo) {
    convo.events.emit('typing')
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
    }
  }

  function typing() {
    convo.task.bot.startTyping(convo.source_message);
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
      )
    }
  }

  function message(text) {
    convo.ask(text, askProcessing);
    convo.next();
  }

  function action(actionName) {
    if (actionName == 'placeOrder') {
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
    else {
      wit.converse(
        convo.sessionId,
        undefined,
        convo.context,
        witProcessing
      );
    }
  }

  function end() {
    convo.stop();
  }

  return {
    askProcessing: askProcessing,
    witProcessing: witProcessing,
    typing: typing,
    merge: merge,
    message: message,
    action: action,
    end: end
  };
}
