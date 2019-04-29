require('dotenv').config();
const express = require('express');
const cors = require('cors');
const server = express();
// const app = new require('@octokit/app')({
//   id: process.env.APP_ID,
//   privateKey: require('fs').readFileSync('private-key.pem')
// });
const Octokit = require('@octokit/rest').plugin(
  require('@octokit/plugin-retry')
);
const octokit = Octokit({
  auth: '' // needs a token
});

// for limiting API usage later on if needed
const DEV_URLS = ['http://localhost:3000'];
const PROD_URLS = [];
const whitelist = process.env.NODE_ENV === 'production' ? PROD_URLS : DEV_URLS;
const corsOptions = {
  origin: (origin, cb) => {
    // return whitelist.indexOf(origin) !== -1
    // ? cb(null, true);
    // : cb(new Error('Not allowed by CORS'));
    return cb(null, true);
  }
};

server.use(cors(corsOptions));
server.use(express.json());

server.get('/', (req, res) => {
  res.status(200).json({ success: "You're not insane!" });
});

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

server.post('/api/forks/:name', async (req, res) => {
  const { name } = req.params;
  const { toOrg } = req.body;

  const lambdaRepos = await octokit.paginate('GET /users/:username/repos', {
    username: 'LambdaSchool'
  });
  const lambdaRepoNames = lambdaRepos.map(repo => repo.name);

  const currentRepos = await octokit.paginate('GET /users/:username/repos', {
    username: toOrg
  });
  const currentRepoNames = currentRepos.map(currRepo => currRepo.name);

  // works for users and orgs
  const data = await octokit.paginate('GET /users/:username/repos', {
    username: name
  });

  // all forks from supplied user/organization
  // and don't try to repeat any preexisting moved forks
  const forks = data
    .filter(repo => repo.fork)
    .filter(({ name }) => !currentRepoNames.includes(name));

  // to separate definite forks to defork from candidates.
  // for the FE to display candidate forks, for the user to select
  const forkedLambdaRepos = [];
  const maybeForkedLambdaRepos = [];
  forks.forEach(repo => {
    if (lambdaRepoNames.includes(repo.name)) {
      forkedLambdaRepos.push(repo);
    } else maybeForkedLambdaRepos.push(repo);
  });

  res.json({ lambdaRepoNames, maybeForkedLambdaRepos });
});

server.post('/api/defork/:toOrg', async (req, res) => {
  const { repos, toOrg } = req.params;

  repos.forEach(async repo => {
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

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}.`));

module.exports = server;
