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
- [ ] Write GitHub App description
- [ ] Improve GUI
  - [x] add additional info about the repo
  - [x] implement dark/light themes
  - [x] mimic GitHub layout
  - [x] set page title as `full_name` & use GitHub link in header like GitHub page
  - [x] cache svg imports
  - [x] add reload button
  - [x] fix header hidden on small screens
  - [ ] add colors for languages
  - [ ] refactor code wit [shadcn](https://ui.shadcn.com/) UI
  - [x] fix cookie storage/deletion (and interferences with GUI)
  - [x] change the document title dynamically (with nested `Suspense`)
  - [x] use nested renderer to render multiple components
  - [x] use `useRequestContext` to have conditional render
  - [ ] implement Swagger with API
  - [ ] add profile name + icon when connected + fix UI
  - [x] add possibility to logout
  - [ ] allow starring repo when connected
- [ ] Define unit tests
- [x] Fix interfaces and type definitions
- [ ] Setup GitHub Actions
  - [ ] to deploy the website to GitHub
  - [x] to run tests automatically
  - [ ] fix GitHub security detection on `tests` files
- [ ] Make sure the project is compatible with multiple deployment types
  - [x] Cloudflare
  - [ ] GitHub
  - [ ] Heroku
- [ ] Refactor saving `access_token` in c.var and access it through `octokit.auth` instead
- [ ] Sanitize all strings into `${string}`
- [x] fix API by adding 404 not found if no repo by id is found
- [x] Add icons in footer
- [x] Find `MAX_ID` dynamically and store in Cookies
- [x] Require GitHub API (Bearer Auth) for `/api/*` requests
- [x] Display Template
- [x] Refactor code into smaller modules
- [x] Setup GitHub App
  - [x] fix oauth workflow
  - [x] define default demo/GitHub choice page
  - [x] error handling when `access_token` is not defined (go back to authentication or use default token)
  - [x] validate the token used before using them
  - [x] fix `access_token`/`refresh_token` cookie storage issue
  - [x] optimize performance
  - [x] change GitHub App icon
  - [x] handle `state` verification
  - [x] handle `access_token` refresh with `refresh_token`
- [x] Use middlewares
  - [x] to declare the octokit instance
  - [x] to add auth header if access_token is valid (to allow API use when `access_token` is defined)
