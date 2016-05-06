var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var ObjectID = mongo.ObjectID;
var uri;

module.exports = function(config) {
  uri = config.uri
  var storage = {};

  ['teams', 'channels', 'users'].forEach(function(zone) {
    storage[zone] = getStorage(zone);
  });

  return storage;
}

function getStorage(zone) {
  var db = new MongoConnection(zone);
  return {
    get: function(id, cb) {
      db.findOne({id: id}, cb);
      db.close();
    },
    save: function(data, cb) {
      db.findOneAndReplace({id: data.id}, data, cb);
      db.close();
    },
    all: function(cb) {
      db.find({}).toArray(cb);
      db.close();
    }
  }
}

function MongoConnection(collection) {
  var self = this;
  MongoClient.connect(function(err, db) {
    if (!err) {
      var c = db.collection(collection);
      self.connection = db.collection(collection);
      self.close = db.close;
    }
    else {
      self.connection = err;
    }
  });
}
