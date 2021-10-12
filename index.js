const fs = require('fs');
const path = require('path');
const core = require('@actions/core');
const shell = require('shelljs');
const axios = require('axios').default;

async function sendSlackMessage(webhook, data) {
  if (webhook) {
    await axios.post(webhook, data);
  }
}

(async () => {
  try {
    console.log('Deploy to abtnode using github action');
    const file = path.join(process.cwd(), '.blocklet/release/blocklet.json');
    if (!fs.existsSync(file)) {
      throw new Error('Missing file at .blocklet/release/blocklet.json');
    }
    const { version, name } = JSON.parse(fs.readFileSync(file, 'utf-8'));

    const endpoint = core.getInput('endpoint');
    const accessKey = core.getInput('access-key');
    const accessSecret = core.getInput('access-secret');
    const slackWebhook = core.getInput('slack-webhook');

    const deployRes = shell.exec(
      `blocklet deploy .blocklet/bundle --endpoint ${endpoint} --access-key ${accessKey} --access-secret ${accessSecret} --skip-hooks`,
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
