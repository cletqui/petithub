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
- [ ] Improve GUI
  - [x] add additional info about the repo
  - [x] implement dark/light themes
  - [x] mimic GitHub layout
  - [ ] set page title as `full_name` & use GitHub link in header like GitHub page
  - [ ] cache svg imports
  - [x] add reload button
  - [x] fix header hidden on small screens
  - [ ] add colors for languages
  - [ ] refactor code wit [shadcn](https://ui.shadcn.com/) UI
  - [ ] fix cookie storage/deletion (and interferences with GUI)
  - [ ] Change the document title dynamically (with nested `Suspense`)
  - [ ] use nested renderer to render multiple components
  - [ ] use `useRequestContext` to have conditional render
  - [ ] implement Swagger with API
  - [ ] add "Browse API" in addition to "Browse GitHub repositories"
- [ ] Define unit tests
- [ ] Fix interfaces and type definitions
- [ ] Setup GitHub Actions
  - [ ] to deploy the website to GitHub
  - [x] to run tests automatically
  - [ ] fix GitHub security detection on `tests` files
- [ ] Make sure the project is compatible with multiple deployment types
  - [x] Cloudflare
  - [ ] GitHub
  - [ ] Heroku
- [ ] Setup GitHub App
  - [x] fix oauth workflow
  - [ ] define default demo/GitHub choice page
  - [ ] error handling when `access_token` is not defined (go back to authentication or use default token)
    - [ ] display error messages in a page
    - [ ] validate the token used before using them
  - [ ] fix `access_token`/`refresh_token` cookie storage issue
  - [ ] optimize performance
  - [ ] change GitHub App icon
  - [x] handle `state` verification
  - [ ] handle `access_token` refresh with `refresh_token`
- [ ] Use middlewares
  - [ ] to declare the octokit instance
  - [x] to add auth header if access_token is valid (to allow API use when `access_token` is defined)
- [x] fix API by adding 404 not found if no repo by id is found
- [x] Add icons in footer
- [x] Find `MAX_ID` dynamically and store in Cookies
- [x] Require GitHub API (Bearer Auth) for `/api/*` requests
- [x] Display Template
- [x] Refactor code into smaller modules
