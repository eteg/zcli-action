const core = require("@actions/core");
const github = require("@actions/github");
const exec = require("@actions/exec");
const path2 = require("path");
//const fs = require("fs/promises");
const { access, constants } = require("node:fs");

// eslint-disable-next-line no-unused-vars
//const fileExists = async (path) => !!(await fs.stat(path).catch((err) => false));
function fileExists(path) {
  access(path, constants.F_OK, (err) => {
    if (err) return false;
    else return true;
  });
}

async function run() {
  try {
    const dateTime = new Date().toLocaleString("pt-BR");

    const { ref, eventName } = github.context;

    const { repository } = github.context.payload;

    const environment = core.getInput("ENVIRONMENT");
    const path = core.getInput("PATH");

    if (environment !== "production" && environment !== "staging") {
      throw new Error("Environment input must be provided (production or staging).");
    }

    await exec.exec(`echo 💡 This job started at ${dateTime} and will run on the path: ${path}`);
    await exec.exec(`echo 🖥️ Job was automatically triggered by ${eventName} event`);
    await exec.exec(`echo 🔎 The name of your branch is ${ref} and your repository is ${repository.name}.`);

    await exec.exec(`echo 🐧 Setting up the environment...`);

    await exec.exec("npm install yarn@1.22.19 --location=global");

    await exec.exec("yarn add @zendesk/zcli -g --ignore-workspace-root-check");

    await exec.exec("yarn add typescript -g --ignore-workspace-root-check");

    await exec.exec(`echo 🔎 Building & Validating...`);
    await exec.exec("yarn install --frozen-lockfile");
    await exec.exec(`yarn build`);

    await exec.exec(`ls -la ${path}`);

    await exec.exec(`echo 🔎 Checking existence of zcli.apps.config.json file...`);

    const exists = fileExists(path2.join(path, "zcli.apps.config.json"));

    if (!exists) {
      throw new Error("zcli.apps.config.json not found.");
    }

    await exec.exec(`echo 🚀 Updating an existing application...`);
    await exec.exec(`zcli apps:update ${path}`);

    exec.exec(`echo 🎉 Job has been finished`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
