var dotenv = require('dotenv').config();
if (!process.env.SLACK_WEB_TOKEN) {
  console.log('Error: Specify token in environment');
  process.exit(1);
}
var request = require('request');

function slackApi(method, args) {
  var queries = [];
  if (!args) args = {};
  args.token = process.env.SLACK_WEB_TOKEN;
  for (var key in args) {
    queries.push(key + '=' + args[key]);
  }
  var queryString = '?' + queries.join('&');
  var promise = new Promise(function(resolve, reject) {
    request.get(
      'https://slack.com/api/' + method + queryString,
      function receiving(err, response) {
        if (!err) {
          response = JSON.parse(response.body);
          if (response.ok) {
            console.log('response from ' + method + ' is "ok":');
            resolve(response);
          }
          else {
            console.log('response from ' + method + ' is not "ok":');
            console.log(response);
            reject(response);
          }
        }
        else {
          console.log('response from ' + method + ' has errored:');
          reject(err)
        }
      }
    )
  })
  return promise;
}

function getUsers() {
  return slackApi('users.list');
}

getUsers().then(function cleanUserData(data) {
  var members = data.members.map(function(member) {
    if (!member.deleted) {
      return {
        id: member.id,
        name: member.name,
        real_name: member.real_name
      }
    }
  })
  var stillMembers = [];
  for (var i = 0; i < members.length; i++) {
    if (members[i]) {
      stillMembers.push(members[i]);
    }
  }
  return stillMembers;
}).then(function findInterested(members) {
  var interested = members.find(function(user) {
    return user.name == 'walston';
  });
  return interested;
}).then(function openChats(user) {
  return slackApi('im.open', {user: user.id});
});
