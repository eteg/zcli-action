const core = require("@actions/core");
const github = require("@actions/github");
const exec = require("@actions/exec");
const fs = require("fs");
// eslint-disable-next-line no-unused-vars

function checkOrCreateFile(appPath, appToken) {
  try {
    // If file dont exist, it will throw an error
    fs.accessSync(`${appPath}/zcli.apps.config.json`, fs.constants.F_OK);
    return true;
  } catch (error) {
    console.log(`File ${appPath}/zcli.apps.config.json does not exist. Trying to create it...`);

    const params = JSON.stringify({
      parameters: {
        token: appToken,
      },
    });

    fs.writeFileSync(`${appPath}/zcli.apps.config.json`, params);
    console.log(`File ${appPath}/zcli.apps.config.json created.`);

    try {
      //Check if file was created
      fs.accessSync(`${appPath}/zcli.apps.config.json`, fs.constants.F_OK);
      console.log(`File ${appPath}/zcli.apps.config.json exists.`);
      return true;
    } catch (error) {
      console.log(`File ${appPath}/zcli.apps.config.json does not exist.`);
      return false;
    }
  }
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

    await exec.exec("yarn add @zendesk/zcli@v1.0.0-beta.16 -G -W");

    await exec.exec("yarn add typescript");

    await exec.exec(`echo 🔎 Building & Validating...`);
    await exec.exec("yarn install --frozen-lockfile");
    await exec.exec(`yarn build`);

    await exec.exec(`echo 🔎 Checking existence of zcli.apps.config.json file...`);

    const fileExists = checkOrCreateFile(appPath, appToken);

    if (!fileExists) {
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
