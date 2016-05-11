var takeOrders = require('./lib/takeOrder.js');
var orderTicket = require('./lib/orderTicket.js');

module.exports = function(controller, botkit){
  controller.on('rtm_open', takeOrders);
  controller.on('direct_message', identify);

  controller.hears('pick up', 'direct_message', orderTicket);
  controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'],
    'direct_message,direct_mention,mention', identify);
}

function identify(bot, message) {
  var uptime = Math.round(process.uptime() / (60 * 1000)) + ' minutes'
  var text = ':robot_face: I am <@' + bot.identity.name + '>.\
   I have been running for ' + uptime + '.';
  bot.reply(message, text);
}
