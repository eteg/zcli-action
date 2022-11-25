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

    const environment = core.getInput('environment');
    const path = core.getInput('path');

    if (environment !== 'production' && environment !== 'staging') {
      throw new Error('Environment input must be provided (production and staging).');
    }

    const exists = await fileExists(`${path}/zcli.apps.config.json`)

    if(!exists) {
      throw new Error('zcli.apps.config.json not found.');
    }

    await exec.exec(`echo 💡 Job started at ${dateTime}`);
    await exec.exec(`echo 🖥️ Job was automatically triggered by ${eventName} event`);
    await exec.exec(`echo 🔎 The name of your branch is ${ref} and your repository is ${repository.name}.`);
    
    await exec.exec(`🐧 Setting up the environment...`);

    await exec.exec('pnpm add @zendesk/zcli -g');
    await exec.exec('pnpm add typescript -g');
   
    await exec.exec(`🔎 Building & Validating...`);
    await exec.exec('yarn install');
    await exec.exec(`yarn --cwd ${path} build`);
    
    await exec.exec(`🚀 Updating an existing application...`);
    await exec.exec(`zcli apps:update ${path}`);
    await exec.exec(`🚀 Creating a new application...`);
    
    exec.exec(`🎉 Job has been finished`);

  } catch (error) {
    core.setFailed(error.message);
  }
} 

run();