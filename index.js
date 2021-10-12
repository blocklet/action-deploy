const fs = require('fs');
const shell = require('shelljs');
const core = require('@actions/core');

function sendSlackMessage(webhook, msg) {
  if (webhook) {
    shell.exec(`curl -X POST -H 'Content-type: application/json' --data ${msg} ${webhook}`);
  }
}

try {
  console.log('Deploy to abtnode using github action');
  const endpoint = core.getInput('endpoint');
  const accessKey = core.getInput('access-key');
  const accessSecret = core.getInput('access-secret');
  const slackWebhook = core.getInput('slack-webhook');

  const file = path.join(process.cwd(), '.blocklet/release/blocklet.json');
  if (!fs.existsSync(file)) {
    throw new Error('Missing file at .blocklet/release/blocklet.json');
  }

  const version = require(file).version;
  const name = require(file).name;

  const deployRes = shell.exec(
    `blocklet deploy .blocklet/bundle --endpoint ${endpoint} --access-key ${accessKey} --access-secret ${accessSecret} --skip-hooks`,
  );
  if (deployRes.code !== 0) {
    sendSlackMessage(
      slackWebhook,
      JSON.stringify({
        text: `:x: Faild to deploy ${name} v${version} to ${endpoint}`,
      }),
    );
    throw new Error(deployRes.stderr);
  }
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
