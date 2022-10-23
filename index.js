const core = require('@actions/core');
const github = require('@actions/github');
const exec = require('@actions/exec');
const shell = require('shelljs');
const fs = require('fs');

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

    const env = core.getInput('env');
    const path = core.getInput('path');

<<<<<<< HEAD
    if (env !== 'dev' && env !== 'prod') {
      throw new Error('Environment input must be dev or prod.');
=======
    if (env !== 'production' && env !== 'staging') {
      throw new Error('Environment input must be production or staging.');
>>>>>>> v1.1.2
    }

    shell.echo(`💡 Job started at ${dateTime}`);
    shell.echo(`🖥️ Job was automatically triggered by ${eventName} event`);
    shell.echo(`🔎 The name of your branch is ${ref} and your repository is ${repository.name}.`);
    
    shell.echo(`🐧 Setting up the environment...`);

<<<<<<< HEAD
    await exec.exec('npm install @zendesk/zcli@v1.0.0-beta.16 --location=global');
=======
    await exec.exec('npm install @zendesk/zcli@v1.0.0-beta.24 --location=global');
>>>>>>> v1.1.2
    await exec.exec('npm install yarn --location=global');
    await exec.exec('npm install typescript --location=global');
   
    shell.echo(`🔎 Building & Validating...`);
    await exec.exec('yarn install');
    await exec.exec(`yarn --cwd ${path} build:${env}`);
    
    if(fs.existsSync(`${path}/zcli.apps.config.json`)) {
      shell.echo(`🚀 Deploying an existing application...`);
<<<<<<< HEAD
      await exec.exec(`zcli apps:validate ${path}`);     
=======
      // await exec.exec(`zcli apps:validate ${path}`);     
>>>>>>> v1.1.2
      await exec.exec(`zcli apps:update ${path}`);
    }
    else {
      shell.echo(`🚀 Deploying a new application...`);
      await exec.exec(`zcli apps:create ${path}`);
    }

    shell.echo(`🎉 Job has been finished`);

  } catch (error) {
    core.setFailed(error.message);
  }
} 


run();