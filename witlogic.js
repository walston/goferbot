var actions = {
  say: say,
  merge: merge,
  error: error,
  "placeOrder": placeOrder,
  "addToList": addToList
}

module.exports.actions = actions;

function say(sessionId, context, message, cb) {
  cb(message);
}

function merge(sessionId, context, entities, message, cb) {
  var bev = firstEntityValue(entities, 'beverage');
  var size = firstEntityValue(entities, 'beverage_size');
  var intent = firstEntityValue(entities, 'intent');
  if (bev) {
    context.bev = bev;
  }
  if (size) {
    context.size = size;
  }
  if (intent) {
    context.intent = intent;
  }
  cb(context);
}

function error(sessionId, context, error) {
  console.log(error.message);
}

function placeOrder(sessionId, context, cb) {
  cb(context);
}

function addToList(sessionId, context, cb) {
  cb(context);
}

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
