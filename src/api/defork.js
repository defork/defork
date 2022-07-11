import { timeout } from './util/index.js';
import octokit from './octokit.js';
import { Router } from 'express';
const router = Router();

router.route('/:toOrg').post(async (req, res) => {
    const { toOrg } = req.params;
    const { forks } = req.body;

    forks.forEach(async repo => {
        try {
            // for initializing new repos in organization
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
        }

        try {
            // for importing into those new repos
            // uses public preview https://developer.github.com/v3/previews/#source-import
            await Promise.all([
                octokit.request('PUT /repos/:owner/:repo/import', {
                    headers: {
                        accept: 'application/vnd.github.barred-rock-preview'
                    },
                    owner: toOrg,
                    repo: repo.name,
                    vcs_url: repo.svn_url,
                    vcs: 'git',
                    mediaType: {
                        previews: ['barred-rock-preview']
                    }
                }),
                timeout(10000)
            ]);
        } catch (err) {
            console.log('PUT', { err });
        }
    });
});

export default router;