import octokit from './octokit.js';
import { Router } from 'express';
const router = Router();

router.route('/:name').post(async (req, res) => {
    const { name } = req.params;
    const { toOrg, forkedFrom = 'bloominstituteoftechnology' } = req.body;
    const GET_REPOS_URL = 'GET /users/:username/repos';

    const reposToDefork = await octokit.paginate(GET_REPOS_URL, {
        username: forkedFrom
    });
    const reposToDeforkNames = reposToDefork.map(repo => repo.name);

    // repos already in the organization for deforked repos
    const currentRepos = await octokit.paginate(GET_REPOS_URL, {
        username: toOrg
    });
    const currentRepoNames = currentRepos.map(currRepo => currRepo.name);

    // works for users and orgs
    const data = await octokit.paginate(GET_REPOS_URL, {
        username: name
    });

    // all forks from supplied user/organization
    // and don't try to repeat any preexisting moved forks
    const forks = data
        .filter(repo => repo.fork)
        .filter(({ name }) => !currentRepoNames.includes(name));

    // to separate definite forks to defork from candidates.
    // for the FE to display candidate forks, for the user to select
    const forkedRepos = [];
    const maybeForkedRepos = [];
    forks.forEach(({ name, description, svn_url }) => {
        const repo = { name, description, svn_url };
        if (reposToDeforkNames.includes(name)) {
            forkedRepos.push(repo);
        } else maybeForkedRepos.push(repo);
    });

    res.json({ forkedRepos, maybeForkedRepos });
});

export default router;