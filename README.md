# PetitHub

## Install

```bash
npm install
npm run dev
```

## Deploy

```bash
npm run deploy
```

## TODO

- [ ] Write `README.md`
- [ ] Change the document title dynamically
- [ ] Improve GUI
  - [x] add additional info about the repo
  - [ ] mimic GitHub layout
  - [ ] set page title as `full_name`
  - [ ] cache svg imports
- [ ] Define unit tests
- [ ] Fix interfaces and type definitions
- [ ] Setup GitHub Actions
  - [ ] to deploy the website to GitHub
  - [x] to run tests automatically
- [ ] Make sure the project is compatible with multiple deployment types
  - [x] Cloudflare
  - [ ] GitHub
  - [ ] Heroku
- [ ] Setup GitHub App (to avoid refreshing PAT every year)
- [x] Add icons in footer
- [x] Find `MAX_ID` dynamically and store in Cookies
- [x] Require GitHub API (Bearer Auth) for `/api/*` requests
- [x] Display Template
- [x] Refactor code into smaller modules
