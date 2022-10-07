import octokit from './octokit.js';

const getRequestLimit = async () => {
	const { data } = await octokit.request('GET /rate_limit', {});
	const { core } = data.resources;
	console.log(core);
	return core.remaining;
};

// TODO: figure out exaclty how to handle/calculate rate limits
const isRateLimitMet = async (res, potentialRequests) => {
	const rate_limit = await getRequestLimit();
	if (rate_limit < potentialRequests) {
		res
			.status(500)
			.json({ message: 'Rate limit exceeded; try again in an hour.' });
		return true;
	}
	return false;
};

export default isRateLimitMet;
