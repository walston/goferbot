var takeOrders = require('./lib/takeOrder.js');
var orderTicket = require('./lib/orderTicket.js');

module.exports = function(controller, botkit){
  controller.on('rtm_open', takeOrders);

  controller.hears('pick up', 'direct_message', orderTicket);
}
