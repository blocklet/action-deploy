const fs = require('fs');
const path = require('path');
const core = require('@actions/core');
const shell = require('shelljs');
const axios = require('axios').default;

const skip = core.getInput('skip');
if (skip === 'true') {
  console.log('Skip deploy to abtnode action');
  return;
}

async function sendSlackMessage(webhook, data) {
  if (webhook) {
    await axios.post(webhook, data);
  }
}

(async () => {
  const folderPath = core.getInput('folder-path');
  const workingDirectory = core.getInput('workgin-directory');
  const endpoint = core.getInput('endpoint', { required: true });
  const accessKey = core.getInput('access-key', { required: true });
  const accessSecret = core.getInput('access-secret', { required: true });
  const slackWebhook = core.getInput('slack-webhook');

  try {
    const cdRes = shell.cd(workingDirectory);
    if (cdRes.code !== 0) {
      throw new Error(`Failed to change directory to ${workingDirectory}`);
    }
    console.log('Deploy to abtnode using github action');
    const file = path.join(process.cwd(), folderPath);
    if (!fs.existsSync(file)) {
      throw new Error('Missing folder at .blocklet/bundle');
    }
    const { version, name } = JSON.parse(fs.readFileSync(file, 'utf-8'));

    const deployRes = shell.exec(
      `blocklet deploy ${file} --endpoint ${endpoint} --access-key ${accessKey} --access-secret ${accessSecret} --skip-hooks`,
    );
    if (deployRes.code !== 0) {
      await sendSlackMessage(slackWebhook, {
        text: `:x: Faild to deploy ${name} v${version} to ${endpoint}`,
      });
      throw new Error(deployRes.stderr);
    }
    await sendSlackMessage(slackWebhook, {
      text: `${name} v${version} was successfully deployed to ${endpoint}`,
    });

    console.log(`Deploy blocklet ${name} to ${endpoint} success!`);
  } catch (error) {
    core.setFailed(error.message);
  }
})();
