var dotenv = require('dotenv').config();
if (!process.env.WIT_TOKEN) {
  console.log('Error: Missing authorization token');
  process.exit(1);
}
var token = process.env.WIT_TOKEN;
var Logger = require('node-wit').Logger;
var levels = require('node-wit').logLevels;
var Wit = require('node-wit').Wit;
var request = require('request');

function firstEntityValue(entities, entity) {
  var val;
  try {
    val = entities[entity][0].value;
    if (typeof val === 'object') {
      return val.value;
    }
    else {
      return val;
    }
  }
  catch (eb) {
    return null;
  }
}

var actions = {
  say: function say(sessionId, context, message, cb) {
    console.log(message);
    cb();
  },
  merge: function merge(sessionId, context, entities, message, cb) {
    var bev = firstEntityValue(entities, 'bev');
    var size = firstEntityValue(entities, 'size');
    if (bev) {
      context.bev;
    }
    cb(context);
  },
  error: function error(sessionId, context, error) {
    console.log(error.message);
  },
  placeOrder : function placeOrder(sessionId, context, cb) {
    cb(context);
  }
}

var client = new Wit(token, actions);

module.exports = client;
// client.interactive();
