const app = new require('@octokit/app')({
  id: process.env.APP_ID,
  privateKey: process.env.PRIVATE_KEY
});
const octokit = new require('@octokit/rest')();
const express = require('express');
const cors = require('cors');
const server = express();

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

server.post('/api/defork/:name', async (req, res) => {
  const { name } = req.params;
  const { toOrg } = req.body;
  // works for users and orgs
  const response = await octokit.repos.listForUser({
    username: name
  });

  // all forks from supplied user/organization
  const repos = response.data.filter(repo => repo.fork);

  const newRepos = [];

  repos.forEach(async repo => {
    // for initializing new repos in organization
    const response1 = await octokit.repos.createInOrg({
      org: toOrg,
      name: repo.name,
      description: repo.description
    });

    console.log(response1);

    // for importing into those new repos
    // uses public preview https://developer.github.com/v3/previews/#source-import
    const response2 = await octokit.request('PUT /repos/:owner/:repo/import', {
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
    });

    newRepos.push(response2.data);
  });

  res.json({ repos, newRepos });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}.`));

module.exports = server;
