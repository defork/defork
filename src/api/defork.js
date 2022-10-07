import { timeout } from './util/index.js';
import { octokit, checkRateLimit, currentRepoNames } from './config/index.js';
import { Router } from 'express';
const router = Router();

router.route('').post(async (req, res) => {
	const toOrg = process.env.TO_ORG;
	const { forks } = req.body;

	const isRateLimitHit = checkRateLimit(res, forks.length * 2);
	if (isRateLimitHit) return;

	const deforkableForks = forks.filter(({ name }) => !currentRepoNames[name]);

	deforkableForks.forEach(async repo => {
		let failed = false;
		try {
			// initializes new repos in organization
			await Promise.all([
				octokit.repos.createInOrg({
					org: toOrg,
					name: repo.name,
					description: repo.description || ''
				}),
				timeout(10000)
			]);
		} catch (err) {
			console.log('POST', { err });
			failed = true;
		}

		if (!failed) {
			try {
				// import old repos' contents to new repos
				await Promise.all([
					octokit.request('PUT /repos/:owner/:repo/import', {
						owner: toOrg,
						repo: repo.name,
						vcs_url: repo.svn_url,
						vcs: 'git'
					}),
					timeout(10000)
				]);
			} catch (err) {
				console.log('PUT', { err });
				failed = true;
			}
		}

		if (!failed && process.env.DELETE_OLD) {
			try {
				// delete old (user-owned rather than the newly org-owned versions) repos
				await Promise.all([
					octokit.repos.delete({
						owner: repo.owner.login,
						repo: repo.name
					}),
					timeout(10000)
				]);
			} catch (err) {
				console.log('DELETE', { err });
			}
		}
	});

	res.json({ message: 'success' });
});

export default router;
