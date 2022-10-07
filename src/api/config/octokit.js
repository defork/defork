import OctoRest from '@octokit/rest';
import OctoPluginRetry from '@octokit/plugin-retry';

const Octokit = OctoRest.plugin(OctoPluginRetry);

const octokit = Octokit({
	auth: `token ${process.env.TOKEN}`
});

export default octokit;
