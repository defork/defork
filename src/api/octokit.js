import OctoRest from '@octokit/rest';
import OctoPluginRetry from '@octokit/plugin-retry';
// consider https://github.com/octokit/oauth-app.js/ instead
// import App from '@octokit/app';
// const app = new App({
//   id: process.env.APP_ID,
//   privateKey: require('fs').readFileSync('private-key.pem')
// });

const Octokit = OctoRest.plugin(OctoPluginRetry);

const octokit = Octokit({
    auth: '' // needs a token
});

export default octokit;