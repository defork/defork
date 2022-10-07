import {
	octokit,
	currentRepoNames,
	checkRateLimit,
	constants
} from './config/index.js';
import { Router } from 'express';
const router = Router();

router.route('/:name').post(async (req, res) => {
	const { name } = req.params;
	const { forkedFrom = 'bloominstituteoftechnology' } = req.body;

	const isRateLimitHit = await checkRateLimit(res, 3);
	if (isRateLimitHit) return;

	const { GET_REPOS_URL } = constants;

	const reposToDeforkNames = {};
	if (process.env.CHECK_FROM_ORG) {
		const reposToDefork = await octokit.paginate(GET_REPOS_URL, {
			username: forkedFrom
		});
		reposToDefork.forEach(repo => {
			reposToDeforkNames[repo.name] = true;
		});
	}

	// works for users and orgs
	const data = await octokit.paginate(GET_REPOS_URL, {
		username: name
	});

	// all forks from supplied user/organization
	// and don't try to repeat any preexisting moved forks
	const forks = data
		.filter(repo => repo.fork)
		.filter(({ name }) => !currentRepoNames[name]);

	// to separate definite forks to defork from candidates.
	// for the FE to display candidate forks, for the user to select
	const forkedRepos = [];
	const maybeForkedRepos = [];
	forks.forEach(({ name, description, svn_url }) => {
		const repo = { name, description, svn_url };
		if (reposToDeforkNames[name]) {
			forkedRepos.push(repo);
		} else maybeForkedRepos.push(repo);
	});

	res.json({ forkedRepos, maybeForkedRepos });
});

export default router;
