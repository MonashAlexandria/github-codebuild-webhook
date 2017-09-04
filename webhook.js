'use strict';

var AWS = require('aws-sdk');
var codebuild = new AWS.CodeBuild();

var GitHubApi = require("github");
var github = new GitHubApi();
const kms = new AWS.KMS();

let githubUsername;
let githubToken;


// get the region where this lambda is running
var region = process.env.AWS_DEFAULT_REGION;
var repo = process.env.GITHUB_REPOSITORY.split('/');


module.exports.resource = (event, context, callback) => {

  if(githubUsername && githubToken){
    console.log('Everything is ready, just start');
    // setup github client
    github.authenticate({
      type: "basic",
      username: githubUsername,
      password: githubToken
    });
    onResourceUpdateOrCreate(event, context, callback);
  } else {
    console.log('Need to decrypt github username and token');
    kms.decrypt({
      CiphertextBlob: new Buffer(process.env.GITHUB_USERNAME, "base64")
    }).promise().then(data => {

      githubUsername = data.Plaintext.toString();

      kms.decrypt({
        CiphertextBlob: new Buffer(process.env.GITHUB_ACCESS_TOKEN, "base64")
      }).promise().then(token => {
        githubToken = token.Plaintext.toString();
        // setup github client
        github.authenticate({
          type: "basic",
          username: githubUsername,
          password: githubToken
        });
        onResourceUpdateOrCreate(event, context, callback);
      });

    }).catch(err => {
      console.log(err);
      callback(err);
    });
  }

};

function onResourceUpdateOrCreate(event, context, callback) {
  console.log("REQUEST RECEIVED:\n" + JSON.stringify(event));

  // For Delete requests, immediately send a SUCCESS response.
  if (event.RequestType == "Delete") {
    // TODO remove webhook from repo
    sendResponse(event, context, "SUCCESS");
    return;
  } else {
    var data = {
      owner: repo[3],
      repo: repo[4],
      name: 'web',
      events: ['pull_request', 'push'],
      active: true,
      config: {
        url: event.ResourceProperties.Endpoint,
        content_type:"json"
      }
    };

    if(event.RequestType == "Create") {
      github.repos.createHook(data).then(function(data){
        sendResponse(event, context, "SUCCESS", {});
      }).catch(function(err){
        console.log(err);
        sendResponse(event, context, "FAILED", err);
      });

    } else {
      github.repos.editHook(data).then(function(data){
        sendResponse(event, context, "SUCCESS", {});
      }).catch(function(err){
        console.log(err);
        sendResponse(event, context, "FAILED", err);
      });;
    }
  }
  // var responseStatus = "FAILED";
  // var responseData = {};
  // sendResponse(event, context, responseStatus, responseData);
}

// Send response to the pre-signed S3 URL
function sendResponse(event, context, responseStatus, responseData) {

    var responseBody = JSON.stringify({
        Status: responseStatus,
        Reason: "See the details in CloudWatch Log Stream: " + context.logStreamName + JSON.stringify(responseData),
        PhysicalResourceId: context.logStreamName,
        StackId: event.StackId,
        RequestId: event.RequestId,
        LogicalResourceId: event.LogicalResourceId,
        Data: responseData
    });

    console.log("RESPONSE BODY:\n", responseBody);

    var https = require("https");
    var url = require("url");

    var parsedUrl = url.parse(event.ResponseURL);
    var options = {
        hostname: parsedUrl.hostname,
        port: 443,
        path: parsedUrl.path,
        method: "PUT",
        headers: {
            "content-type": "",
            "content-length": responseBody.length
        }
    };

    console.log("SENDING RESPONSE...\n");

    var request = https.request(options, function(response) {
        console.log("STATUS: " + response.statusCode);
        console.log("HEADERS: " + JSON.stringify(response.headers));
        // Tell AWS Lambda that the function execution is done
        context.done();
    });

    request.on("error", function(error) {
        console.log("sendResponse Error:" + error);
        // Tell AWS Lambda that the function execution is done
        context.done();
    });

    // write data to request body
    request.write(responseBody);
    request.end();
}
