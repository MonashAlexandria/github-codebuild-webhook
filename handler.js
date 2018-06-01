'use strict';

const TestsFactory = require('./libs/rules/TestsFactory.js');

const AWS = require('aws-sdk');
AWS.config.setPromisesDependency(null);

const kms = new AWS.KMS();
const codebuild = new AWS.CodeBuild();
let Promise = require("bluebird");

const https = require('https');
const util = require('util');
const fetch = require('node-fetch');

let GitHubApi = require("@octokit/rest");
let github = new GitHubApi();
const BUILD_ACTIONS = [
  "opened",
  "reopened",
  "synchronize"
];

let githubUsername;
let githubToken;

// get the region where this lambda is running
const region = process.env.AWS_DEFAULT_REGION;

// get the github status context
const githubContext = process.env.GITHUB_STATUS_CONTEXT;

const slackHookUrlCode = process.env.SLACK_HOOK_URL_CODE;
const slackChannel = process.env.SLACK_CHANNEL;


module.exports.start_build_proxy = (event, context, callback) => {
  console.log("Forwarding request", event);
  console.log(event.body);
  console.log("body length", event.body.length);
  let webhookPayload = event.body;

  if(event.body.length >= 32768 /*Step Function: limit*/ ) {
    console.log(event.headers['X-GitHub-Event']);
    const body = JSON.parse(event.body);

    // As Step Function can only accepte message less than 32768 characters;
    // Need to strip out most of the data.
    // Perhaps should go with white-list approach instead.
    if(event.headers['X-GitHub-Event'] === 'push'){
      console.log('Removing some data');
      delete body.head_commit.added;
      delete body.head_commit.removed;
      delete body.head_commit.modified;
      body.head_commit = cleanMessage(body.head_commit);

      const commits = body.commits;
      let firstCommit = commits[0];

      firstCommit = cleanMessage(firstCommit);
      delete firstCommit.added;
      delete firstCommit.removed;
      delete firstCommit.modified;
      body.commits = [firstCommit];
      webhookPayload = JSON.stringify(body);
      console.log('Body length after cleaned up', webhookPayload.length);
    }
  }

  const options = {
    method: event.httpMethod,
    headers: event.headers,
    body: webhookPayload
  };

  console.log("Sending request with options", options);

  fetch("https://" + event.headers.Host + "/trigger/trigger-build", options)
    .then(res => {
      console.log(res);

      res.text().then(body => {
        let response  = {
          statusCode: res.status,
          body: body
        };
        console.log('sending response back', response);
        callback(null, response);
      });
    })
    .catch(err => {
      console.log(err);
      callback(err);
  });

};

// this function will be triggered by the github webhook
module.exports.start_build = (event, context, callback) => {


  if(githubUsername && githubToken){
    console.log('Everything is ready, just start');
    // setup github client
    github.authenticate({
      type: "basic",
      username: githubUsername,
      password: githubToken
    });
    executeStartBuild(event, context, callback);
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
        executeStartBuild(event, context, callback);
      });

    }).catch(err => {
      console.log(err);
      callback(err);
    });
  }



};

function executeStartBuild(event, context, callback){
  console.log(event);
  let githubEvent = event;

  if('buildable' in event){
    githubEvent = event.event;
  }

  const isPullRequest = 'pull_request' in githubEvent && BUILD_ACTIONS.indexOf(githubEvent.action) >= 0;

  if (isPullRequest && BUILD_ACTIONS.indexOf(githubEvent.action) < 0) {
    console.log('Build not in build action');
    callback(null, 'Event is not a build action');
    return;
  }

  let githubBuild = isPullRequest ? new Pr(githubEvent) : new GithubBuild(githubEvent);

  const response = {};

  githubBuild.buildable().then(mergeability => {

    if(mergeability === false){
      callback(new Error("Not mergable, just return"));
      return;
    }

    if(mergeability === null || typeof mergeability === 'undefined'){
      response.buildable = 'null';
      response.event = githubEvent;
      callback(null, response);
      return;
    }

    //Let it continue
    response.buildable = 'true';

    githubBuild.startBuilds().then(buildTasks => {
      console.log('start them and wait for the them to finish');
      if(typeof buildTasks === 'undefined' || buildTasks.length === 0){
        console.log('no build task specified, return');
        callback(new Error('No build tasks specified'));
        return;
      }

      Promise.all(buildTasks).then(dataItems => {
        response.responses = githubBuild.updateGithub(dataItems);
        callback(null, response);
      }).catch(err => {
        console.log(err, err.stack);
        callback(err);
      });

    });
  });
}

module.exports.check_build_status = (event, context, callback) => {
  if(githubUsername && githubToken){
    console.log('Everything is ready, just start');
    // setup github client
    github.authenticate({
      type: "basic",
      username: githubUsername,
      password: githubToken
    });
    checkBuildStatus(event, context, callback);
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
        checkBuildStatus(event, context, callback);
      });

    }).catch(err => {
      console.log(err);
      callback(err);
    });
  }

};

function checkBuildStatus(event, context, callback) {
  let responses = event.responses;
  console.log(responses);
  let ids = responses.reduce((buildIds, response) => {
    buildIds.push(response.buildId);
    return buildIds;
  }, []);

  console.log(ids);

  let getBuildsPromise = codebuild.batchGetBuilds({ ids: ids }).promise();
  let response = {
    responses: responses
  };

  getBuildsPromise.then(data => {
    console.log(data);
    let buildComplete = true;
    buildComplete = data.builds.reduce((buildComplete, build) => {
      buildComplete &= build.buildComplete;
      return buildComplete;
    }, buildComplete);

    console.log('buildComplete', buildComplete);

    let builds = data.builds;
    for(let build of builds){
      const buildId = build.id;
      console.log("buildId", buildId);
      responses = responses.map(res => {
        console.log("res.buildId", res.buildId);
        if(res.buildId == buildId) {
          const preBuildComplete = res.buildComplete;
          res.buildComplete = build.buildComplete;
          res.buildStatus = build.buildStatus;
          if(!preBuildComplete && res.buildComplete) {
            GithubBuild.finishBuild(res, context);
          }
        }
        return res;
      });
    }

    response.buildComplete = buildComplete ? "completed" : "running";//bug in Lambda Choice;
    console.log('response.buildComplete', response.buildComplete);
    response.responses = responses;
    callback(null, response);
  }).catch(err => {
    console.log(err, err.stack);
    context.fail(err);
    callback(err);
  });
}

module.exports.build_done = (event, context, callback) => {
  callback(null, 'done');
};

class GithubBuild {

  constructor(event){
    this.event = event;
    this.commitSha = this.getCommitSha();
    this.repo = event.repository;
    const currentTime = new Date();
    this.startTime = currentTime.getTime();


  }

  getCommitSha(event){
    return this.event.after;
  }

  getEventType(){
    return "push";
  }

  getBranch() {
    return this.event.ref.replace("refs/heads/", "")
  }

  getSourceVersion() {
    return this.event.after;
  }

  getProjectName() {
    return process.env.BUILD_PROJECT;
  }

  getCommitMsg() {
    return this.event.head_commit.message;
  }

  getSlackMsg() {
    return this.getCommitMsg();
  }

  getUrl() {
    return this.event.head_commit.url;
  }

  getAuthor() {
    return this.event.head_commit.author.username;
  }

  getEnvVariables(){
    return [
      {
        name: 'EVENT_TYPE',
        value: this.getEventType()
      },
      {
        name: 'BRANCH',
        value: this.getBranch()
      },
      {
        name: 'COMMIT_SHA',
        value: this.commitSha
      },
      {
        name: 'ALEX_GITHUB_EVENT_TIME',
        value: this.startTime.toString()
      }
    ]
  }

  getForceCommand() {
    // parse [force uat|functional <argument1> ... <argumentN>]
    const commandRegex = new RegExp(/^.*\[force (uat|functional|deployment)(\s[^\]]+)?\]/m);
    let matches = commandRegex.exec(this.getCommitMsg());

    if (matches === null || matches.length < 3) {
      return null;
    }

    return [
      // matched "uat", "functional" or "deployment"
      matches[1],

      // matched argument
      matches[2]
    ];
  }

  // get all tests related to the given commands
  getTests() {
    // variables required for implementing rules pattern
    const forceCommand = this.getForceCommand();
    const commitMessage = this.getCommitMsg();
    const skipDeployment = commitMessage ? commitMessage.indexOf("[skip deployment]") !== -1 : '';
    const forceType = forceCommand ? forceCommand[0] : '';
    const forceArgument = forceCommand ? forceCommand[1] : '';
    const branch = this.getBranch();
    const isEnabledForceUATCommands = this.enableForceUATCommands();
    const eventType = this.getEventType();
    const dataSet = { branch, commitMessage, forceType, skipDeployment, forceArgument, forceCommand, isEnabledForceUATCommands, eventType };
    const testsFactory = new TestsFactory(dataSet);
    return testsFactory.getAllTests();
  }


  enableForceUATCommands() {
    const regex = new RegExp(/\[on (push|pr)\]/gm);
    let matches;
    let commands = 0;

    while ((matches = regex.exec(this.getCommitMsg())) !== null) {
      if (matches.length < 2)
        continue;

      console.log(matches[0]);

      ++commands;

      if (matches[1] === this.getEventType())
        return true;
    }

    // if there are no commands, fallback to default:
    // enable force commands on pr only
    return commands === 0 && 'pr' === this.getEventType();
  }

  getBuildTasks(){
    const buildTasks = [];

    const tests = this.getTests();

    for(let test of tests){
      const testType = test.type;
      const testName = test.name;
      const deployable = test.deployable;

      let envVariables = this.getEnvVariables();
      envVariables.push({
        name: "TEST_TYPE",
        value: testType
      });
      envVariables.push({
        name: "TEST_NAME",
        value: testName
      });
      envVariables.push({
        name: "GITHUB_CONTEXT",
        value: githubContext + "/" + this.getEventType() + ": " + testType + "/" + testName /* CodeBuild-CI/push/unit-tests/js-php */
      });
      envVariables.push({
        name: "DEPLOYABLE",
        value: deployable.toString() //string only
      });

      const codeBuildParams = {
        projectName: this.getProjectName(),
        sourceVersion: this.getSourceVersion(),
        environmentVariablesOverride: envVariables
      };

      console.log('push the build', githubContext + "/" + this.getEventType() + ":" + testType + "/" + testName);
      buildTasks.push(codebuild.startBuild(codeBuildParams).promise());

    }
    return buildTasks;
  }

  startBuilds(){
    return new Promise(resolve => {
      const buildTasks = this.getBuildTasks();
      resolve(buildTasks);
    });
  }

  updateGithub(cbBuilds) {
    console.log('response', cbBuilds);
    const responses = [];
    for(let i = 0; i < cbBuilds.length; i++) {
      const cbBuild = cbBuilds[i].build;
      const buildContext = GithubBuild.getGithubContextFromCbBuild(cbBuild.environment.environmentVariables);

      responses.push({
        buildComplete: cbBuild.buildComplete,
        buildStatus: cbBuild.buildStatus,
        buildEnv: cbBuild.environment.environmentVariables,
        buildId: cbBuild.id,
        gitEvent: {
          sha: this.commitSha,
          repo: this.repo,
          context: buildContext,
          branch: this.getBranch(),
          url: this.getUrl(),
          author: this.getAuthor(),
          message: this.getSlackMsg()
        }
      });

      // all is well, mark the commit as being 'in progress'
      github.repos.createStatus({
        owner: this.repo.owner.login,
        repo: this.repo.name,
        sha: this.commitSha,
        state: 'pending',
        target_url: 'https://' + region + '.console.aws.amazon.com/codebuild/home?region=' + region + '#/builds/' + cbBuild.id + '/view/new',
        context: buildContext,
        description: 'Build is running...'
      }).then(function (data) {
        console.log('Github called');
        console.log(data);
      });

    }
    return responses;
  }

  static finishBuild(build, context) {
    const commitSha = build.gitEvent.sha;
    const repo = build.gitEvent.repo;

    console.log('Found commit identifier: ' + build.gitEvent.sha);

    // map the codebuild status to github state
    const buildStatus = build.buildStatus;
    let state = '';
    let severity = "danger";
    let noticeEmoji = ":bangbang:";
    switch (buildStatus) {
      case 'SUCCEEDED':
        state = 'success';
        severity = "good";
        noticeEmoji = ":white_check_mark:";
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
    console.log('Github state will be', state);

    let targetUrl = 'https://' + region + '.console.aws.amazon.com/codebuild/home?region=' + region + '#/builds/' + build.buildId + '/view/new';

    let postData = {
      channel: slackChannel,
      text: `* ${buildStatus} - Branch: ${build.gitEvent.branch} - Build: ${build.gitEvent.context}*`,
      attachments: [
        {
          color: severity,
          text: `${noticeEmoji} @${build.gitEvent.author} - <${build.gitEvent.url}|More on Github> - <${targetUrl}|Build log> \n ${build.gitEvent.message}`//noticeEmoji + buildStatus + ' - <' + targetUrl + '|More info...>'
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
    console.log(options);
    console.log(postData);

    const req = https.request(options, function(res) {
      res.setEncoding('utf8');
    });

    req.on('error', function(e) {
      console.log('problem with request: ' + e.message);
    });

    req.write(util.format("%j", postData));
    req.end();

    const githubData = {
      owner: repo.owner.login,
      repo: repo.name,
      sha: commitSha,
      state: state,
      target_url: targetUrl,
      context: build.gitEvent.context,
      description: 'Build ' + buildStatus + '...'
    };

    // POST to github
    github.repos.createStatus(githubData).catch(function (err) {
      console.log(err);
      context.fail(data);
    });
  }

  static getGithubContextFromCbBuild(envVariables){
    for (const envMap of envVariables) {
      console.log(envMap);
      if(envMap.name === "GITHUB_CONTEXT"){
        return envMap.value;
      }
    }
    return "";
  }

  buildable(){
    return Promise.resolve(true);
  }
}

module.exports.GithubBuild = GithubBuild;

class Pr extends GithubBuild{

  constructor(event, commitMsg = ""){
    super(event);
    this.timeOutId = -1;
    this.commitMsg = commitMsg;
  }

  getCommitSha(){
    return this.event.pull_request.head.sha;
  }

  getBranch() {
    return this.event.pull_request.head.ref;
  }

  getEventType(){
    return "pr";
  }

  getSourceVersion() {
    return "pr/" + this.event.pull_request.number;
  }

  getCommitMsg() {
    return this.commitMsg;
  }

  getSlackMsg() {
    return this.event.pull_request.title;
  }

  getUrl() {
    return this.event.pull_request.url;
  }

  getAuthor() {
    return this.event.pull_request.user.login;
  }

  getEnvVariables(){
    let envVariables = super.getEnvVariables();
    envVariables.push({
      name: 'PR_NUMBER',
      value: this.event.pull_request.number.toString()
    });
    return envVariables;
  }

  buildable(){
    return new Promise((resolve, reject) => {
      Promise.all([
        github.pullRequests.get({
          owner: this.event.repository.owner.login,
          repo: this.event.repository.name,
          number: this.event.pull_request.number
        }),

        github.gitdata.getCommit({
          owner: this.event.repository.owner.login,
          repo: this.event.repository.name,
          sha: this.getCommitSha()
        })
      ]).then(results => {
        const pr = results[0];
        const commit = results[1];

        this.commitMsg = commit.data.message;

        console.log('mergeability', pr.data.mergeable);
        const mergeability = pr.data.mergeable;
        resolve(mergeability);
      }).catch(err => {
        console.log(err);
        reject(null);
      });
    });
  }

}

module.exports.Pr = Pr;

function cleanMessage(commit) {
  if(typeof commit.message !== 'undefined' && commit.message.length > 500) {
    commit.message = commit.message.substring(0, 499);
  }
  return commit;
}
