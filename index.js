const core = require('@actions/core');
const github = require('@actions/github');
const exec = require('@actions/exec');

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

    await exec.exec(`echo 💡 Job started at ${dateTime} - Environment: ${environment}`);
    await exec.exec(`echo 🖥️ Job was automatically triggered by ${eventName} event`);
    await exec.exec(`echo 🔎 The name of your branch is ${ref} and your repository is ${repository.name}.`);
    
    await exec.exec(`echo 🐧 Setting up the dependencies...`);
    await exec.exec('yarn add @zendesk/zcli -g --force');
    await exec.exec('yarn add typescript -g');
   
    await exec.exec(`echo 🔎 Installing & Building...`);
    await exec.exec('yarn install');
    await exec.exec(`yarn build`);
    
    await exec.exec(`echo 🚀 Updating an existing application...`);
    await exec.exec(`zcli apps:update ${path}`);
    
    exec.exec(`echo 🎉 Job has been finished`);

  } catch (error) {
    core.setFailed(error.message);
  }
} 

run();