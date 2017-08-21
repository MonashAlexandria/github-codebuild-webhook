'use strict';

var AWS = require('aws-sdk');
var codebuild = new AWS.CodeBuild();

var GitHubApi = require("github");
var github = new GitHubApi();
var BUILD_ACTIONS = [
  "opened",
  "reopened",
  "synchronize"
];

// setup github client
github.authenticate({
  type: "basic",
  username: process.env.GITHUB_USERNAME,
  password: process.env.GITHUB_ACCESS_TOKEN
});

// get the region where this lambda is running
var region = process.env.AWS_DEFAULT_REGION;

// get the github status context
var githubContext = process.env.GITHUB_STATUS_CONTEXT;

// this function will be triggered by the github webhook
module.exports.start_build = (event, context, callback) => {

  var response = {
    gitEvent: {},
    build: {}
  };

  console.log(event);

  var isPullRequest = 'pull_request' in event && BUILD_ACTIONS.indexOf(event.action) >= 0;

  if (isPullRequest && BUILD_ACTIONS.indexOf(event.action) <= 0) {
    callback(null, 'Event is not a build action');
    return;
  }
  var commitSha = isPullRequest ? event.pull_request.head.sha : event.after;


  var codeBuildParams = {
    projectName: process.env.BUILD_PROJECT,
    sourceVersion: isPullRequest ? 'pr/' + event.pull_request.number : event.after,
    environmentVariablesOverride: [
      {
        name: 'EVENT_TYPE',
        value: isPullRequest ? "pr" : "push"
      },
      {
        name: 'BRANCH',
        value: isPullRequest ? event.pull_request.head.ref : event.ref.replace("refs/heads", "")
      },
      {
        name: 'COMMIT_SHA',
        value: commitSha
      }
    ]
  };

  var repo = event.repository;
  var context = githubContext + (isPullRequest ? '/pr' : '/push');

  // start the codebuild process for this project
  codebuild.startBuild(codeBuildParams, function (err, data) {
    if (err) {
      console.log(err, err.stack);
      callback(err);
    } else {

      response.build = data.build;
      response.gitEvent.sha = commitSha;
      response.gitEvent.repo = event.repository;
      response.gitEvent.context = context;

      // all is well, mark the commit as being 'in progress'
      github.repos.createStatus({
        owner: repo.owner.login,
        repo: repo.name,
        sha: commitSha,
        state: 'pending',
        target_url: 'https://' + region + '.console.aws.amazon.com/codebuild/home?region=' + region + '#/builds/' + data.build.id + '/view/new',
        context: githubContext,
        description: 'Build is running...'
      }).then(function (data) {
        console.log(data);
      });
      callback(null, response);
    }
  });
}

module.exports.check_build_status = (event, context, callback) => {
  var response = event;
  var params = {
    ids: [event.build.id]
  };
  codebuild.batchGetBuilds(params, function (err, data) {
    if (err) {
      console.log(err, err.stack);
      context.fail(err)
      callback(err);
    } else {
      response.build = data.builds[0]
      callback(null, response);
    }
  });
}

module.exports.build_done = (event, context, callback) => {
  // get the necessary variables for the github call
  var commitSha = event.gitEvent.sha;
  var repo = event.gitEvent.repo;

  console.log('Found commit identifier: ' + event.gitEvent.sha);

  // map the codebuild status to github state
  var buildStatus = event.build.buildStatus;
  var state = '';
  switch (buildStatus) {
    case 'SUCCEEDED':
      state = 'success';
      break;
    case 'FAILED':
      state = 'failure';
      break;
    case 'FAULT':
    case 'STOPPED':
    case 'TIMED_OUT':
      state = 'error'
    default:
      state = 'pending'
  }
  console.log('Github state will be', state);

  github.repos.createStatus({
    owner: repo.owner.login,
    repo: repo.name,
    sha: commitSha,
    state: state,
    target_url: 'https://' + region + '.console.aws.amazon.com/codebuild/home?region=' + region + '#/builds/' + event.build.id + '/view/new',
    context: event.gitEvent.context,
    description: 'Build ' + buildStatus + '...'
  }).catch(function (err) {
    console.log(err);
    context.fail(data);
  });
}
