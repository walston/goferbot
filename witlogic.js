var actions = {
  say: say,
  merge: merge,
  error: error,
  "placeOrder": placeOrder
}

module.exports.actions = actions;
module.exports.merge = easyMerge;

function say(sessionId, context, message, cb) {
  console.log(message);
  cb();
}

function merge(sessionId, context, entities, message, cb) {
  var bev = firstEntityValue(entities, 'beverage');
  var size = firstEntityValue(entities, 'beverage_size');
  if (bev) {
    context.bev;
  }
  cb(context);
}

function easyMerge(context, entities) {
  var bev = firstEntityValue(entities, 'beverage');
  var size = firstEntityValue(entities, 'beverage_size');
  if (bev) {
    context.bev;
  }
  return context;
}

function error(sessionId, context, error) {
  console.log(error.message);
}

function placeOrder(sessionId, context, cb) {
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
