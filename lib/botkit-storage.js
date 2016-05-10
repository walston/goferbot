var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var ObjectID = mongo.ObjectID;
var url = 'mongodb://' + process.env.MLAB_USER +
  ':' + process.env.MLAB_PASSWORD +
  '@ds021761.mlab.com:21761/goferbot';

console.log(url);
module.exports = {
  teams: actions('teams'),
  channels: actions('channels'),
  users: actions('users')
}

function actions(zone) {
  var actions = {
    get: get,
    save: save,
    all: all
  }

  return actions;

  function get(obj, cb) {
    var connect = MongoConnection();
    connect.then(function(db) {
      var collection = db.collection(zone);
      collection.find(obj).limit(1).toArray(function(err, doc) {
        db.close();
        if (!err) {
          cb(doc);
        }
        else {
          cb(new Error(err));
        }
      });
    }).catch(function(err) {
      cb(new Error(err))
    });
  }

  function save(obj, cb) {
    if (!obj._id && obj.id) {
      obj._id = obj.id;
      delete obj.id;
    }

    var connect = MongoConnection();
    connect.then(function(db) {
      var collection = db.collection(zone);
      collection.insertOne(obj, function(err, results) {
        db.close();
        if (!err) {
          cb(results.result);
        }
        else {
          cb(new Error(err));
        }
      });
    }).catch(function(err) {
      cb(new Error(err))
    });
  }

  function all(cb) {
    var connect = MongoConnection();
    connect.then(function(db) {
      var collection = db.collection(zone);
      collection.find().toArray(function(err, docs) {
        db.close();
        if (!err) {
          cb(docs);
        }
        else {
          cb(new Error(err));
        }
      })
    }).catch(function(err) {
      cb(new Error(err))
    });
  }
}

function MongoConnection() {
  return new Promise(function(resolve, reject) {
    MongoClient.connect(url, function(err, db) {
      if (!err) {
        resolve(db);
      }
      else {
        reject(err)
      }
    });
  });
}
