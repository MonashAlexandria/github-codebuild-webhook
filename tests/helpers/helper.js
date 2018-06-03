let { GithubBuild, Pr } = require('../../handler.js');

function unittests() {
  return {
    deployable: false,
    name: 'js-php',
    type: 'unit-tests'    
  };
};

function uat(name, deployable = false) {
  return {
    name,
    type: "uat",
    deployable
  };
}

function deployment(){
    return {
        deployable: true,
        name: 'deployment',
        type: 'deployment'
    };
}

function functional(name = "functional", deployable = false) {
  return {
    name,
    type: "functional",
    deployable
  };
}

function push(t, branch, commitMsg, expectedTests) {
  if (Array.isArray(branch)) {
    return branch.forEach(b => {
      push(t, b, commitMsg, expectedTests);
    });
  }

  if (Array.isArray(commitMsg)) {
    return commitMsg.forEach(msg => {
      push(t, branch, msg, expectedTests);
    });
  }

  const build = new GithubBuild({
    head_commit: {
      message: commitMsg
    },
    ref: branch,
    after: "",
    repository: "alexandria"
  });

  t.deepEqual(build.getTests(), expectedTests, commitMsg);
}

function pr(t, branch, baseBranch, commitMsg, expectedTests) {
  if (Array.isArray(branch)) {
    return branch.forEach(b => {
      pr(t, b, baseBranch, commitMsg, expectedTests);
  });
  }

  if (Array.isArray(commitMsg)) {
    return commitMsg.forEach(msg => {
      pr(t, branch, baseBranch, msg, expectedTests);
    });
  }

  const build = new Pr({
    pull_request: {
      head: {
        sha: "",
        ref: branch
      },
      base: {
        ref: baseBranch
      }
    },
    after: "",
    repository: "alexandria"
  }, commitMsg);

  const tests = build.getTests();
  t.deepEqual(tests, expectedTests, commitMsg);
}

push.title = (title, branch, commitMsg, expectedTests) => `push '${branch}' '${commitMsg}'`.trim();
pr.title = (title, branch, targetBranch, commitMsg, expectedTests) => `pr '${branch}' '${commitMsg}'`.trim();

module.exports = {
  push,
  pr,
  unittests,
  functional,
  deployment,
  uat
};