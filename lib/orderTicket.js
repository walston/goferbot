var dbmanager = require('./dbmanager.js');

module.exports = function (bot, message) {
 var list = dbmanager.get(message.team);
 list.then(function(tab) {
   var text = tab.map(function(order) {
     return (order.real_name || order.name || order.user) + ' wants `' + order.order + '`';
   }).join('\n')
   bot.reply(message, text);
 });
}
