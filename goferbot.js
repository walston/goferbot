var takeOrders = require('./lib/takeOrder.js');
var openConvo = require('./lib/openConvo.js');
var orderTicket = require('./lib/orderTicket.js');

module.exports = function(controller, botkit){
  controller.on('rtm_open', takeOrders);
  controller.on('direct_message', openConvo);

  controller.hears('pick up', 'direct_message', orderTicket);
}
