# Game plan

### To do:

- Create GitHub App.
- Get all auth set up.
- Continue getting the rest of the logic built out for repo creation and imports!

### Current flow:

Manual:

- Create a new organization (new name)

Automatic:

- Read repos from organization/user
  - Take repos that are forks
- Create new repos based on forks in the new organization
- Send back list of new repos as a bit of confirmation.
