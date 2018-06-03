const AWS = require('aws-sdk');
AWS.config.setPromisesDependency(null);
const kms = new AWS.KMS();
const region = process.env.AWS_DEFAULT_REGION;
let githubUsername;
let githubToken;
let GitHubApi = require("@octokit/rest");
let github = new GitHubApi();
const codebuild = new AWS.CodeBuild();
const https = require('https');
const slackHookUrlCode = process.env.SLACK_HOOK_URL_CODE;
const slackChannel = process.env.SLACK_CHANNEL;
const util = require('util');

module.exports.handler = (event, context, callback) => {
  if(event && event.detail && event.detail['project-name'] === process.env.BUILD_PROJECT) {

    if(githubUsername && githubToken){
      console.log('Everything is ready, just start');
      // setup github client
      github.authenticate({
        type: "basic",
        username: githubUsername,
        password: githubToken
      });
      updateBuildStatus(event, context, callback);
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
          updateBuildStatus(event, context, callback);
        });

      }).catch(err => {
        console.log(err);
        callback(err);
      });
    }


  }
};

function updateBuildStatus(event, context, callback) {
  const buildId = event.detail['build-id'];
  const environment = event.detail['additional-information'].environment;
  const variables = environment['environment-variables'];
  const buildStatus = event.detail['build-status'];
  const branch = getVariable(variables, 'BRANCH');
  const buildContext = getVariable(variables, 'GITHUB_CONTEXT');
  const author = getVariable(variables, 'AUTHOR');
  const url = getVariable(variables, 'URL');
  const message = getVariable(variables, 'MESSAGE');
  console.log(branch, buildStatus, buildContext, author, buildId);


  let severity = "danger";
  let noticeEmoji = ":bangbang:";
  let state = 'pending';
  switch (buildStatus) {
    case 'SUCCEEDED':
      state = 'success';
      severity = "good";
      noticeEmoji = ":white_check_mark:";
      break;
    case 'IN_PROGRESS':
      severity = 'good';
      break;
    case 'FAILED':
      state = 'failure';
      break;
    case 'FAULT':
    case 'STOPPED':
    case 'TIMED_OUT':
      state = 'error';
      break;
    default:
      state = 'pending'
  }

  codebuild.batchGetBuilds({ ids: [buildId]}, (err, data) => {
    let shortenedBuildId = buildId;

    //fallback to project build
    let targetUrl = 'https://' + region + '.console.aws.amazon.com/codebuild/home?region=' + region + '#/projects/' +  process.env.BUILD_PROJECT + '/view';
    if(err) {
      console.log(err, err.stack);
    } else {
      const build = data['builds'][0];
      if(typeof build !== 'undefined') {
        shortenedBuildId = build['id'];
        targetUrl = 'https://' + region + '.console.aws.amazon.com/codebuild/home?region=' + region + '#/builds/' + shortenedBuildId + '/view/new';
      }
    }

    let postData = {
      channel: slackChannel,
      text: `* ${buildStatus} - Branch: ${branch} - Build: ${buildContext}*`,
      attachments: [
        {
          color: severity,
          text: `${noticeEmoji} @${author} - <${url}|More on Github> - <${targetUrl}|Build log> \n ${message}`//noticeEmoji + buildStatus + ' - <' + targetUrl + '|More info...>'
        }
      ]
    };

    // POST to slack channel
    const options = {
      method: 'POST',
      hostname: 'hooks.slack.com',
      port: 443,
      path: '/services/' + slackHookUrlCode
    };

    const req = https.request(options, function(res) {
      res.setEncoding('utf8');
    });

    req.on('error', function(e) {
      console.log('problem with request: ' + e.message);
    });

    req.write(util.format("%j", postData));
    req.end();

    console.log(postData);

    const githubData = {
      owner: getVariable(variables, 'REPO_OWNER'),
      repo: getVariable(variables, 'REPO_NAME'),
      sha: getVariable(variables, 'COMMIT_SHA'),
      state: state,
      target_url: targetUrl,
      context: getVariable(variables, 'GITHUB_CONTEXT'),
      description: 'Build ' + buildStatus + '...'
    };

    console.log(githubData);

    // all is well, mark the commit as being 'in progress'
    github.repos.createStatus(githubData).then(function (data) {
      console.log('Github called');
      console.log(data);
      callback(null, 'done');
    });

  });
}

function getVariable(variables, name) {
  let target = variables.find(variable => variable.name === name);
  return target ? target.value : "";
}