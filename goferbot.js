var CronJob = require('cron').CronJob;
var dotenv = require('dotenv').config();
var uuid = require('node-uuid');
var Wit = require('node-wit').Wit;
var dbmanager = require('./lib/dbmanager.js');
var logic = require('./lib/witlogic.js');
var takeOrders = require('./lib/takeOrder.js');
var openConvo = require('./lib/openConvo.js');
var orderTicket = require('./lib/orderTicket.js')

var wit = new Wit(process.env.WIT_TOKEN, logic.actions);

module.exports = function(controller, botkit){
  controller.on('rtm_open', takeOrders);
  controller.on('direct_message', openConvo);

  controller.hears('pick up', 'direct_message', orderTicket);
}
