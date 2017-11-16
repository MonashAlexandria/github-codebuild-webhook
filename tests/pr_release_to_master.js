let { test } = require('ava');
let {
  pr,
  unittests,
  functional_deployable,
  functional,
  uat,
  uat_deployable
} = require('./helpers/helper.js');

test(pr, "release", "master", [
  "normal commit",
  "[on push]",
  "[on pr]",
  "[skip deployment]",
  "[force uat][on push]",
  "[force uat test.php][on push]",
  "[force functional][on push]",
  "[force functional test.php][on push]"
], [
  unittests()
]);

test(pr, "release", "master", [
  "[skip unit-tests]",
  "[skip unit-tests][on push]",
  "[skip unit-tests][on push][on pr]"
], [
  // no tests
]);

test(pr, "release", "master", [
  "[force functional]",
  "[force functional][on pr]",
  "[force functional][on pr][on push]"
], [
  unittests(),
  functional_deployable()
]);

test(pr, "release", "master", [
  "[force functional f.php]",
  "[force functional f.php][on pr]",
  "[force functional f.php][on pr][on push]"
], [
  unittests(),
  functional_deployable("f.php")
]);

test(pr, "release", "master", [
  "[skip unit-tests][force functional]",
  "[skip unit-tests][force functional][on pr]",
  "[skip unit-tests][force functional][on pr][on push]"
], [
  functional_deployable()
]);

test(pr, "release", "master", [
  "[skip unit-tests][force functional f.php]",
  "[skip unit-tests][force functional f.php][on pr]",
  "[skip unit-tests][force functional f.php][on pr][on push]"
], [
  functional_deployable("f.php")
]);

test(pr, "release", "master", [
  "[skip deployment][force functional]",
  "[skip deployment][force functional][on pr]",
  "[skip deployment][force functional][on pr][on push]"
], [
  unittests(),
  functional()
]);

test(pr, "release", "master", [
  "[skip deployment][force functional f.php]",
  "[skip deployment][force functional f.php][on pr]",
  "[skip deployment][force functional f.php][on pr][on push]"
], [
  unittests(),
  functional("f.php")
]);

test(pr, "release", "master", [
  "[skip unit-tests][skip deployment][force functional]",
  "[skip unit-tests][skip deployment][force functional][on pr]",
  "[skip unit-tests][skip deployment][force functional][on pr][on push]"
], [
  functional()
]);

test(pr, "release", "master", [
  "[skip unit-tests][skip deployment][force functional f.php]",
  "[skip unit-tests][skip deployment][force functional f.php][on pr]",
  "[skip unit-tests][skip deployment][force functional f.php][on pr][on push]"
], [
  functional("f.php")
]);

test(pr, "release", "master", [
  "[force uat]",
  "[force uat][on pr]",
  "[force uat][on pr][on push]",
  "Should work with multilines\n[force uat]"
], [
  unittests(),
  uat_deployable("backend"),
  uat("frontend"),
  functional()
]);

test(pr, "release", "master", [
  "[force uat uat.php]",
  "[force uat uat.php][on pr]",
  "[force uat uat.php][on pr][on push]"
], [
  unittests(),
  uat_deployable("uat.php")
]);

test(pr, "release", "master", [
  "[skip unit-tests][force uat]",
  "[skip unit-tests][force uat][on pr]",
  "[skip unit-tests][force uat][on pr][on push]"
], [
  uat_deployable("backend"),
  uat("frontend"),
  functional()
]);

test(pr, "release", "master", [
  "[skip unit-tests][force uat uat.php]",
  "[skip unit-tests][force uat uat.php][on pr]",
  "[skip unit-tests][force uat uat.php][on pr][on push]"
], [
  uat_deployable("uat.php")
]);

test(pr, "release", "master", [
  "[skip deployment][force uat]",
  "[skip deployment][force uat][on pr]",
  "[skip deployment][force uat][on pr][on push]"
], [
  unittests(),
  uat("backend"),
  uat("frontend"),
  functional()
]);

test(pr, "release", "master", [
  "[skip deployment][force uat uat.php]",
  "[skip deployment][force uat uat.php][on pr]",
  "[skip deployment][force uat uat.php][on pr][on push]"
], [
  unittests(),
  uat("uat.php")
]);

test(pr, "release", "master", [
  "[skip unit-tests][skip deployment][force uat]",
  "[skip unit-tests][skip deployment][force uat][on pr]",
  "[skip unit-tests][skip deployment][force uat][on pr][on push]"
], [
  uat("backend"),
  uat("frontend"),
  functional()
]);

test(pr, "release", "master", [
  "[skip unit-tests][skip deployment][force uat uat.php]",
  "[skip unit-tests][skip deployment][force uat uat.php][on pr]",
  "[skip unit-tests][skip deployment][force uat uat.php][on pr][on push]"
], [
  uat("uat.php")
]);

test(pr, "release", "master", [
  "[force uat ignore.php][force uat uat.php]",
  "[force uat ignore.php][force uat uat.php][on pr]",
  "[force functional][force uat ignore.php][force uat uat.php][on pr][on push]"
], [
  // consider only the last occurence of [force uat]
  unittests(),
  uat_deployable("uat.php")
]);