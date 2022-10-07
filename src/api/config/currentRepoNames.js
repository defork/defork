import octokit from './octokit.js';
import constants from './constants.js';

const currentRepoNames = {};

const setCurrentRepoNames = async () => {
	if (process.env.CHECK_TO_ORG) {
		const { GET_REPOS_URL } = constants;
		// repos already in the organization for deforked repos
		const currentRepos = await octokit.paginate(GET_REPOS_URL, {
			username: process.env.TO_ORG
		});
		currentRepos.forEach(repo => {
			currentRepoNames[repo.name] = true;
		});
	}
};

await setCurrentRepoNames();

export default currentRepoNames;
