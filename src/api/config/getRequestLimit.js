import octokit from './octokit.js';

const getRequestLimit = async () => {
	const { data } = await octokit.request('GET /rate_limit', {});
	const { core } = data.resources;
	console.log(core);
	return core.remaining;
};

export default getRequestLimit;
