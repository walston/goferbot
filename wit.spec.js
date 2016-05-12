var dotenv = require('dotenv').config();
var uuid = require('node-uuid');
var assert = require('chai').assert;
var request = require('request').defaults({
  baseUrl: 'https://api.wit.ai',
  headers: {
    'Authorization': 'Bearer ' + process.env.WIT_TOKEN,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

var sessionId = uuid.v1();
var context = {};

describe('Environment Variables:', function() {
  it('Session Id', function() {
    assert(sessionId != undefined);
  });

  it('Wit Token', function() {
    assert(process.env.WIT_TOKEN != undefined);
  });
});

describe('Wit.ai is responding as expected:', function() {
  var context = {};
  it('responds to http requests', function(done) {
    var qs = {
      'session_id': sessionId
    }
    var options = {
      url: '/converse',
      qs: qs
    }
    request.post(options, function(err, response, body) {
      assert.equal(response.statusCode, 200);
      assert.isUndefined(body.error);
      done();
    })
  });

  it('Responds with "merge" to inital request', function(done) {
      var qs = {
        'session_id': sessionId,
        'q': 'can i get something?'
      }
      var options = {
        url: '/converse',
        qs: qs
      }
      request.post(options, function(err, response, body) {
        body = JSON.parse(body);
        assert.equal(response.statusCode, 200);
        assert.isUndefined(body.error);
        assert.equal(body.type, 'merge');
        assert.isDefined(body.entities);
        assert.equal(body.entities.intent[0].value, 'placeOrder');
        context.intent = { value: 'placeOrder' };
        done();
      });
  });
});
