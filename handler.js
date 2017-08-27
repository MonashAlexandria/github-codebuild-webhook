'use strict';

let AWS = require('aws-sdk');
AWS.config.setPromisesDependency(null);

let codebuild = new AWS.CodeBuild();
let Promise = require("bluebird");

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
    buildIds.push(response.build.id);
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
          res.build = build;
        }
        return res;
      });
    }

    response.builds = data;
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
    const buildStatus = build.build.buildStatus;
    let state = '';
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
        state = 'error';
        break;
      default:
        state = 'pending'
    }
    console.log('Github state will be', state);

    github.repos.createStatus({
      owner: repo.owner.login,
      repo: repo.name,
      sha: commitSha,
      state: state,
      target_url: 'https://' + region + '.console.aws.amazon.com/codebuild/home?region=' + region + '#/builds/' + build.build.id + '/view/new',
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
    return this.event.ref.replace("refs/heads", "")
  }

  getSourceVersion() {
    return this.event.after;
  }

  getProjectName() {
    return process.env.BUILD_PROJECT;
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

  startBuilds(){
    const buildTasks = [];

    const codeBuildParams = {
      projectName: this.getProjectName(),
      sourceVersion: this.getSourceVersion(),
      environmentVariablesOverride: this.getEnvVariables()
    };

    console.log('push the build');
    buildTasks.push(codebuild.startBuild(codeBuildParams).promise());
    return buildTasks;
  }

  updateGithub(dataItems) {
    console.log('response', dataItems);
    const buildContext = githubContext + "/" + this.getEventType();
    const responses = [];
    for(let i = 0; i < dataItems.length; i++) {
      const buildData = dataItems[i];

      responses.push({
        build: buildData.build,
        buildId: buildData.build.id,
        gitEvent: {
          sha: this.commitSha,
          repo: this.repo,
          context: buildContext
        }
      });

      // all is well, mark the commit as being 'in progress'
      github.repos.createStatus({
        owner: this.repo.owner.login,
        repo: this.repo.name,
        sha: this.commitSha,
        state: 'pending',
        target_url: 'https://' + region + '.console.aws.amazon.com/codebuild/home?region=' + region + '#/builds/' + buildData.build.id + '/view/new',
        context: buildContext,
        description: 'Build is running...'
      }).then(function (data) {
        console.log('Github called');
        console.log(data);
      });

    }
    return responses;
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

  static buildActions(){
    return [
      "opened",
      "reopened",
      "synchronize"
    ];
  }
}