const core = require("@actions/core");
const github = require("@actions/github");
const exec = require("@actions/exec");
const path = require("path");
const fs = require("fs");
// eslint-disable-next-line no-unused-vars

function fileExists(appPath) {
  console.log(`Checking existence of: ${appPath}`);
  try {
    fs.accessSync(appPath, fs.constants.F_OK);
    console.log(`File ${appPath} exists.`);
  } catch (error) {
    console.log(`File ${appPath} does not exist.`);
  }
}

function createFile(appPath, token) {
  console.log(`Trying to creating file: ${appPath}`);

  const objectParams = new Object();
  objectParams.parameters = new Object();
  objectParams.parameters.token = token;

  fs.writeFileSync("zcli.apps.config.json", JSON.stringify(objectParams));

  //Test if file was created
  fs.accessSync(appPath, fs.constants.F_OK, (err) => {
    console.log(err ? "File zcli.apps.config.json not created." : "File zcli.apps.config.json created successfully.");
    if (err) return false;
    else true;
  });
}

async function run() {
  try {
    const dateTime = new Date().toLocaleString("pt-BR");

    const { ref, eventName } = github.context;

    const { repository } = github.context.payload;

    const environment = core.getInput("ENVIRONMENT");
    const appPath = core.getInput("PATH");
    const appToken = core.getInput("TOKEN");

    if (environment !== "production" && environment !== "staging") {
      throw new Error("Environment input must be provided (production or staging).");
    }

    await exec.exec(`echo 💡 This job started at ${dateTime} and will run on the path: ${appPath}`);
    await exec.exec(`echo 🖥️ Job was automatically triggered by ${eventName} event`);
    await exec.exec(`echo 🔎 The name of your branch is ${ref} and your repository is ${repository.name}.`);

    await exec.exec(`echo 🐧 Setting up the environment...`);

    await exec.exec("npm install yarn@1.22.19 --location=global");

    await exec.exec("yarn add @zendesk/zcli -g --ignore-workspace-root-check");

    await exec.exec("yarn add typescript -g --ignore-workspace-root-check");

    await exec.exec(`echo 🔎 Building & Validating...`);
    await exec.exec("yarn install --frozen-lockfile");
    await exec.exec(`yarn build`);

    await exec.exec(`echo 🔎 Checking existence of zcli.apps.config.json file...`);

    const exists = fileExists(path.join(appPath, "zcli.apps.config.json"));

    if (!exists) {
      createFile(appPath, appToken);
    }

    const isFileCreated = fileExists(path.join(appPath, "zcli.apps.config.json"));

    if (!isFileCreated) {
      throw new Error("File zcli.apps.config.json not found and can't be created.");
    }

    await exec.exec(`echo 🚀 Updating an existing application...`);
    await exec.exec(`zcli apps:update ${appPath}`);

    exec.exec(`echo 🎉 Job has been finished`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
