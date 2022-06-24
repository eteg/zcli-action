const core = require('@actions/core');
const github = require('@actions/github');
const exec = require('@actions/exec');
const shell = require('shelljs');

async function run() {
  try {
    const dateTime = (new Date()).toLocaleString('pt-BR');

    const path = 'apps/zendesk/dist'

    const { 
      ref,
      eventName
    } = github.context;

    const {
      repository
    } = github.context.payload

    const env = core.getInput('env')

    shell.echo(`💡 Job started at ${dateTime}`);
    shell.echo(`🖥️ Job was automatically triggered by ${eventName} event`);
    shell.echo(`🔎 The name of your branch is ${ref} and your repository is ${repository.name}.`)
    
    shell.echo(`🐧 Setting up the environment...`);

    await exec.exec('npm install @zendesk/zcli --location=global')
    await exec.exec('npm install yarn --location=global')
    await exec.exec('npm install typescript --location=global')
   
    shell.echo(`🔎 Building & Validating...`);
    await exec.exec('yarn install')
    await exec.exec(`yarn --cwd ${path} build:${env}`)
    await exec.exec(`zcli apps:validate ${path}`)
    
    console.log(shell.ls(path))
    console.log(shell.ls('-LA'))

    shell.echo(`🚀 Deploying the application...`);
    await exec.exec(`zcli apps:update ${path}`)

    shell.echo(`🎉 Job has been finished`);

  } catch (error) {
    core.setFailed(error.message);
  }
}


run();