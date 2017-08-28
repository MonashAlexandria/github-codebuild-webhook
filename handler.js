'use strict';

const AWS = require('aws-sdk');
AWS.config.setPromisesDependency(null);

const codebuild = new AWS.CodeBuild();
let Promise = require("bluebird");

const https = require('https');
const util = require('util');

let GitHubApi = require("github");
let github = new GitHubApi();
const BUILD_ACTIONS = [
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
const region = process.env.AWS_DEFAULT_REGION;

// get the github status context
const githubContext = process.env.GITHUB_STATUS_CONTEXT;

const slackHookUrlCode = process.env.SLACK_HOOK_URL_CODE;
const slackChannel = process.env.SLACK_CHANNEL;

// this function will be triggered by the github webhook
module.exports.start_build = (event, context, callback) => {

  console.log(event);

  const isPullRequest = 'pull_request' in event && BUILD_ACTIONS.indexOf(event.action) >= 0;

  if (isPullRequest && BUILD_ACTIONS.indexOf(event.action) < 0) {
    console.log('Build not in build action');
    callback(null, 'Event is not a build action');
    return;
  }

  let githubBuild = isPullRequest ? new Pr(event) : new GithubBuild(event);

  const buildTasks = githubBuild.startBuilds();

  if(typeof buildTasks === 'undefined' || buildTasks.length === 0){
    callback(null, 'No build tasks specified');
    return;
  }

  console.log('start them and wait for the them to finish');
  Promise.all(buildTasks).then(dataItems => {
    const responses = githubBuild.updateGithub(dataItems);
    callback(null, {
      responses: responses
    });
  }).catch(err => {
    console.log(err, err.stack);
    callback(err);
  });
  console.log('here');
};

module.exports.check_build_status = (event, context, callback) => {
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
          console.log('replacing build', res.build, build);
          res.buildComplete = build.buildComplete;
          res.buildStatus = build.buildStatus;
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

};

module.exports.build_done = (event, context, callback) => {

  for(let build of event.responses) {
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
          text: `${noticeEmoji} @${build.gitEvent.author} - <${build.gitEvent.url}|More on Github> - <${targetUrl}|Build log>`//noticeEmoji + buildStatus + ' - <' + targetUrl + '|More info...>'
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

    // POST to github
    github.repos.createStatus({
      owner: repo.owner.login,
      repo: repo.name,
      sha: commitSha,
      state: state,
      target_url: targetUrl,
      context: build.gitEvent.context,
      description: 'Build ' + buildStatus + '...'
    }).catch(function (err) {
      console.log(err);
      context.fail(data);
    });
  }
};

class GithubBuild {

  constructor(event){
    this.event = event;
    this.commitSha = this.getCommitSha();
    this.repo = event.repository;
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
      }
    ]
  }

  getTests() {
    let tests = [];
    const branch = this.getBranch();
    const forceRegex = new RegExp(/.*\[force ([a-z]+)([\s][^]+)?].*/gm);
    const commitMsg = this.getCommitMsg();
    const matches = forceRegex.exec(commitMsg);
    console.log(matches);
    let forceCommand = null;
    let forceTest = null;
    if (matches !== null && matches.length >= 2 && ('push' === this.getEventType() || 'api' === this.getEventType())) {
      forceCommand = matches[1];
      forceTest = matches.length >= 3 ? matches[2] : null;
    }

    tests.push({
      name: "js-php",
      type: "unit-tests",
      deployable: false
    });

    if(branch === "release" || forceCommand === "uat") {
      if(typeof forceTest !== 'undefined') {
        tests.push({
          name: forceTest,
          type: "uat",
          deployable: true
        });
      } else {

        tests.push({
          name: "backend",
          type: "uat",
          deployable: true
        });

        tests.push({
          name: "frontend",
          type: "uat",
          deployable: false
        });

        tests.push({
          name: "functional",
          type: "functional",
          deployable: false
        });

      }
    }

    return tests;
  }

  startBuilds(){
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
          author: this.getAuthor()
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

  static getGithubContextFromCbBuild(envVariables){
    for (const envMap of envVariables) {
      console.log(envMap);
      if(envMap.name === "GITHUB_CONTEXT"){
        return envMap.value;
      }
    }
    return "";
  }
}

class Pr extends GithubBuild{

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

  startBuilds(){
    if(this.event.pull_request.mergeable) {
      console.log('Not meregable');
      return super.startBuilds();
    }
    return [];
  }

  getCommitMsg() {
    return "";
  }

  getUrl() {
    return this.event.pull_request.url;
  }

  getAuthor() {
    return this.event.pull_request.user.login;
  }
}