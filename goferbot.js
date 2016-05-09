var CronJob = require('cron').CronJob;
var dotenv = require('dotenv').config();
var uuid = require('node-uuid');
var Wit = require('node-wit').Wit;
var dbmanager = require('./lib/dbmanager.js');
var logic = require('./lib/witlogic.js');
var takeOrders = require('./lib/takeOrder.js');

var wit = new Wit(process.env.WIT_TOKEN, logic.actions);

module.exports = function(controller, botkit){
  controller.on('rtm_open', takeOrders); // roll call for everyone opting in for coffee run
  controller.hears('pick up', 'direct_message', getOrderList); // respond to pick up wants
  controller.on('direct_message', require('./lib/openConvo.js'));
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
