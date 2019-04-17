# Game plan

### To do:

- Utilize retry after header so as to not make unneeded requests
- Get auth set up.
- Build out FE for users.

### Current flow:

Manual:

- Create a new organization (new name)

Automatic:

- Read repos from organization/user
  - Take repos that are forks
- Create new repos based on forks in the new organization
- Send back list of new repos as a bit of confirmation?
