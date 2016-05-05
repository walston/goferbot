var dotenv = require('dotenv');
if (!process.env.MLAB_PASSWORD || !process.env.MLAB_USER) {
  console.log('Error: Cannot authenticate without user credentials');
  process.exit(1);
}

var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var url = 'mongodb://' + process.env.MLAB_USER + ':' + process.env.MLAB_PASSWORD + '@ds021761.mlab.com:21761/goferbot';
var ObjectID = mongo.ObjectID;


function add(additive) {
  var promise = new Promise(function(resolve, reject) {
    MongoClient.connect(url, function(err, db) {
      if (!err) {
        var orders = db.collection('orders');
        orders.insertOne(additive, function(err, result) {
          db.close();
          if (!err) {
            resolve(result.ops);
          }
          else {
            reject(err);
          }
        });
      }
      else {
        reject(err);
      }
    });
  });
  return promise;
}

function get(team) {
  var promise = new Promise(function(resolve, reject) {
    MongoClient.connect(url, function(err, db) {
      if (!err) {
        var orders = db.collection('orders');
        orders.find({team: team}).toArray(function(err, results) {
          db.close();
          if (!err) {
            resolve(results);
          }
          else {
            reject(err)
          }
        });
      }
      else {
        reject(err)
      }
    });
  });
  return promise;
}

function customerAdd(team, userId) {
  var promise = new Promise(function(resolve, reject) {
    MongoClient.connect(url, function(err, db) {
      if (!err) {
        var customers = db.collection('customers');
        var customer = {
          team: team,
          user: userId
        }
        customers.find(customer).toArray(function(err, docs) {
          if (docs.length > 0) {
            reject('User already exists');
          }
          else {
            customers.insertOne(customer, function(err, results) {
              db.close();
              if (!err) {
                resolve(results.ops);
              }
              else {
                reject(err);
              }
            });
          }
        })
      }
      else {
        reject(err);
      }
    });
  });
  return promise;
}

function customerList(team) {
  var promise = new Promise(function(resolve, reject) {
    MongoClient.connect(url, function(err, db) {
      if (!err) {
        var customers = db.collection('customers');
        customers.find({team: team}).toArray(function(err, results) {
          db.close();
          if (!err) {
            resolve(results);
          }
          else {
            reject(err);
          }
        })
      }
      else {
        reject(err);
      }
    });
  });
  return promise;
}

var facade = {
  add: add,
  get: get,
  customerAdd: customerAdd,
  customerList: customerList
}

module.exports = facade;
