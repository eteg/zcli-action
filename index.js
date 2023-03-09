const core = require('@actions/core');
const github = require('@actions/github');
const exec = require('@actions/exec');
const fs = require('fs/promises')

// eslint-disable-next-line no-unused-vars
const fileExists = async path => !!(await fs.stat(path).catch(err => false));

async function run() {
  try {
    const dateTime = (new Date()).toLocaleString('pt-BR');

    const {
      ref,
      eventName
    } = github.context;

    const {
      repository
    } = github.context.payload;

    const environment = core.getInput('ENVIRONMENT');
    const path = core.getInput('PATH');

    if (environment !== 'production' && environment !== 'staging') {
      throw new Error('Environment input must be provided (production or staging).');
    }

    await exec.exec(`echo 💡 Job started at ${dateTime}`);
    await exec.exec(`echo 🖥️ Job was automatically triggered by ${eventName} event`);
    await exec.exec(`echo 🔎 The name of your branch is ${ref} and your repository is ${repository.name}.`);

    await exec.exec(`echo 🐧 Setting up the environment...`);

    await exec.exec('npm install yarn --location=global');
    await exec.exec('npm install @zendesk/zcli --location=global');
    await exec.exec('npm install typescript --location=global');

    await exec.exec(`echo 🔎 Building & Validating...`);
    await exec.exec('npm install');
    await exec.exec(`npm run build`);

    const exists = await fileExists(`${path}/zcli.apps.config.json`)

    if (!exists) {
      throw new Error('zcli.apps.config.json not found.');
    }

    await exec.exec(`echo 🚀 Updating an existing application...`);
    await exec.exec(`zcli apps:update ${path}`);

    exec.exec(`echo 🎉 Job has been finished`);

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();