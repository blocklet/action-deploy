const fs = require('fs');
const path = require('path');
const exec = require('@actions/exec');
const core = require('@actions/core');

async function sendSlackMessage(webhook, msg) {
  if (webhook) {
    await exec.exec(`curl -X POST -H 'Content-type: application/json' --data ${msg} ${webhook}`);
  }
}

(async () => {
  try {
    await exec.exec('pwd');
    await exec.exec('ls .blocklet -a');
    await exec.exec('ls .blocklet/release -a');
    console.log('Deploy to abtnode using github action');
    const file = path.join(process.cwd(), '.blocklet/release/blocklet.json');
    if (!fs.existsSync(file)) {
      throw new Error('Missing file at .blocklet/release/blocklet.json');
    }
    const { version, name } = require(file);

    const endpoint = core.getInput('endpoint');
    const accessKey = core.getInput('access-key');
    const accessSecret = core.getInput('access-secret');
    const slackWebhook = core.getInput('slack-webhook');

    await exec.exec(
      `blocklet deploy .blocklet/bundle --endpoint ${endpoint} --access-key ${accessKey} --access-secret ${accessSecret} --skip-hooks`,
      [],
      {
        listeners: {
          stderr(err) {
            sendSlackMessage(
              slackWebhook,
              JSON.stringify({
                text: `:x: Faild to deploy ${name} v${version} to ${endpoint}`,
              }),
            );
            throw new Error(err.toString());
          },
        },
      },
    );
    sendSlackMessage(
      slackWebhook,
      JSON.stringify({
        text: `${name} v${version} was successfully deployed to ${endpoint}`,
      }),
    );

    console.log(`Deploy blocklet ${name} to ${endpoint} success!`);
  } catch (error) {
    core.setFailed(error.message);
  }
})();
