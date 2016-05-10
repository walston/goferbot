var Beepboop = require('beepboop-botkit');
var Botkit = require('botkit');
var goferbot = require('./goferbot.js');
var storage = require('./lib/botkit-storage.js');

var controller = Botkit.slackbot({
  debug: true,
  storage: storage
});
var beepboop = Beepboop.start(controller, {
  debug: true
});

beepboop.on('add_resource', function(msg) {
  console.log('received request to add bot to team');
});

goferbot(controller, beepboop.bot);
