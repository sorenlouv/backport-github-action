const core = require("@actions/core");
const { context } = require("@actions/github");

try {
  const githubToken = getInput("github_token", { required: true });
  console.log(`Hello ${githubToken}!`);

  // set output
  const time = new Date().toTimeString();
  core.setOutput("time", time);

  // Get the JSON webhook payload for the event that triggered the workflow
  console.log(
    `The event payload: ${JSON.stringify(context.payload, undefined, 2)}`
  );
} catch (error) {
  core.setFailed(error.message);
}
