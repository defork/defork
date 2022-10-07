A tool for de-forking your forked repositories (primarily for organization and commit history).

Note that this tool is still currently being developed and is experimental! Use at your own risk.

### Current flow:

Manual:

- Create a new organization (new name)

Automatic:

- Read repos from organization/user
  - Take repos that are forks and aren't already in the 'to org'
- Create new repos based on forks in the new organization
  - Optionally delete the old repos

### Installation:

- Clone the repo
- Fill out a `.env` file in the root directory with your preferred settings and your GitHub token (simply comment out 'boolean' values to disable them)

```.env
TOKEN="xY2Z4"
CHECK_FROM_ORG="true"
CHECK_TO_ORG="true"
CHECK_FROM_REPO="true"
TO_ORG="new-org-name"
# DELETE_OLD="true"
```

To generate a token, go to your GitHub settings and click on 'Developer settings' in the sidebar. Then click on 'Personal access tokens' and click 'Generate new token'. Give it a name and select the 'repo' scope ('public_repo' is fine too depending on if you have privated forks you'd like to convert). Copy the token and paste it into your `.env` file.

- Run `npm install`
- Run `npm start` to start the server
- Make a request via something like Postman to `http://localhost:8000/api/forks/:username` (where `:username` is the username of the user/org you'd like to convert forks for):

  ```json
  {
    "forkedFrom": "example" (optional) (default is bloomtech)
  }
  ```

  which will return two lists of forks -- one for the repos which were found by name in the forked from org/user, and ones which weren't. At the moment, it's left up to the user to decide which repos to convert, although, in the future, this part should be at least easier to do.

- Make a request to `http://localhost:8000/api/defork`:
  ```json
  {
  	"forks": [
      {
        "name": "repo-name",
        "svn_url": "https://github.com/yourUsername/repoName",
        "description": "" (optional) (default is empty string)
      },
      // ...
    ]
  }
  ```

### To do:

- Fully decide on the user flow & API flow
- build out .env more clearly as well as the README; be more clear with conventions as well; i.e. JSON should probably be snake_case, and perhaps some of the files ought to be reorganized
- Figure out rate limits so that users don't run into odd hangs
- Test mass deletion of old (forked) repositories; potentially do this retroactively / separately from the conversion process.

- Build out FE for users. (Might prefer making a native, non-web application for simplicity's sake.)
- Recreate a user friendly video tutorial for the process
- Share once finished!
