let { test } = require('ava');
let {
  pr,
  unittests,
  functional,
  uat,
  deployment
} = require('./helpers/helper.js');

test(pr, "mybranch", "master", [
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


test(pr, "mybranch", "master", [
  "[force functional]",
  "[force functional][on pr]",
  "[force functional][on pr][on push]"
], [
  unittests(),
  deployment(),
  functional()
]);

test(pr, "mybranch", "master", [
  "[force functional f.php]",
  "[force functional f.php][on pr]",
  "[force functional f.php][on pr][on push]"
], [
  unittests(),
  deployment(),
  functional("f.php")
]);

test(pr, "mybranch", "master", [
  "[skip unit-tests][force functional]",
  "[skip unit-tests][force functional][on pr]",
  "[skip unit-tests][force functional][on pr][on push]"
], [
  deployment(),
  functional()
]);

test(pr, "mybranch", "master", [
  "[skip unit-tests][force functional f.php]",
  "[skip unit-tests][force functional f.php][on pr]",
  "[skip unit-tests][force functional f.php][on pr][on push]"
], [
  deployment(),
  functional("f.php")
]);

test(pr, "mybranch", "master", [
  "[skip deployment][force functional]",
  "[skip deployment][force functional][on pr]",
  "[skip deployment][force functional][on pr][on push]"
], [
  unittests(),
  functional()
]);

test(pr, "mybranch", "master", [
  "[skip deployment][force functional f.php]",
  "[skip deployment][force functional f.php][on pr]",
  "[skip deployment][force functional f.php][on pr][on push]"
], [
  unittests(),
  functional("f.php")
]);

test(pr, "mybranch", "master", [
  "[skip unit-tests][skip deployment][force functional]",
  "[skip unit-tests][skip deployment][force functional][on pr]",
  "[skip unit-tests][skip deployment][force functional][on pr][on push]"
], [
  functional()
]);

test(pr, "mybranch", "master", [
  "[skip unit-tests][skip deployment][force functional f.php]",
  "[skip unit-tests][skip deployment][force functional f.php][on pr]",
  "[skip unit-tests][skip deployment][force functional f.php][on pr][on push]"
], [
  functional("f.php")
]);

test(pr, "mybranch", "master", [
  "[force uat]",
  "[force uat][on pr]",
  "[force uat][on pr][on push]",
  "Should work with multilines\n[force uat]"
], [
  unittests(),
  deployment(),
  uat("backend"),
  uat("frontend"),
  functional()
]);

test(pr, "mybranch", "master", [
  "[force uat uat.php]",
  "[force uat uat.php][on pr]",
  "[force uat uat.php][on pr][on push]"
], [
  unittests(),
  deployment(),
  uat("uat.php")
]);

test(pr, "mybranch", "master", [
  "[skip unit-tests][force uat]",
  "[skip unit-tests][force uat][on pr]",
  "[skip unit-tests][force uat][on pr][on push]"
], [
  deployment(),
  uat("backend"),
  uat("frontend"),
  functional()
]);

test(pr, "mybranch", "master", [
  "[skip unit-tests][force uat uat.php]",
  "[skip unit-tests][force uat uat.php][on pr]",
  "[skip unit-tests][force uat uat.php][on pr][on push]"
], [
  deployment(),
  uat("uat.php")
]);

test(pr, "mybranch", "master", [
  "[skip deployment][force uat]",
  "[skip deployment][force uat][on pr]",
  "[skip deployment][force uat][on pr][on push]"
], [
  unittests(),
  uat("backend"),
  uat("frontend"),
  functional()
]);

test(pr, "mybranch", "master", [
  "[skip deployment][force uat uat.php]",
  "[skip deployment][force uat uat.php][on pr]",
  "[skip deployment][force uat uat.php][on pr][on push]"
], [
  unittests(),
  uat("uat.php")
]);

test(pr, "mybranch", "master", [
  "[skip unit-tests][skip deployment][force uat]",
  "[skip unit-tests][skip deployment][force uat][on pr]",
  "[skip unit-tests][skip deployment][force uat][on pr][on push]"
], [
  uat("backend"),
  uat("frontend"),
  functional()
]);

test(pr, "mybranch", "master", [
  "[skip unit-tests][skip deployment][force uat uat.php]",
  "[skip unit-tests][skip deployment][force uat uat.php][on pr]",
  "[skip unit-tests][skip deployment][force uat uat.php][on pr][on push]"
], [
  uat("uat.php")
]);

test(pr, "mybranch", "master", [
  "[force uat ignore.php][force uat uat.php]",
  "[force uat ignore.php][force uat uat.php][on pr]",
  "[force functional][force uat ignore.php][force uat uat.php][on pr][on push]"
], [
  // consider only the last occurence of [force uat]
  unittests(),
  deployment(),
  uat("uat.php")
]);


test(pr, "release", "master", [
  "dummy commit",
], [
  // consider only the last occurence of [force uat]
  unittests(),
]);