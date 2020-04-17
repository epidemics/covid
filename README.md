![covid](https://github.com/epidemics/covid/workflows/covid/badge.svg)

# COVID-19 visualizer

Frontend for http://epidemicforecasting.org/

![Screenshot of local app](./covid_local_app.png)

## Architecture

- `server` - a express.js webserver using nunjucks for templating
- `frontend` - client-side code, written in typescript and bundled by webpack.
- `common` - shared code between the frontend and server
- `static` - static resources

## Setup

### Using docker (the easiest)

Run

```
docker-compose up
```

visit http://localhost:8000.

### Local installation (recommended)

Requires `nodejs` and `yarn`. Run

```
yarn install // install dependencies
yarn run dev // start the dev server
```

visit http://localhost:8000.

## Contributing

### Channels and deployments

The project fetches data and displays data from google cloud. We have three different data channels
that get used depending on the context:

- On production at `http://epidemicforecasting.org/` the default `channel` is `"main"`
- On staging at `http://staging.epidemicforecasting.org/` the default `channel` is `"staging"`
- Anywhere else like a local development server uses `testing` as the default `channel`

There can be overridden manually by using the url param `?channel=` using the identifiers above.
These data channels correspond to the `-c` argument of the `epimodel` commmand `./do web_upload`.

In the `frontend` the current `channel` is accessible as a global variable `DEFAULT_EPIFOR_CHANNEL`,
see `frontend/@types/epifor.d.ts` for more info.

### Tests and linting

```
yarn run lint-check // linting - just checking)
yarn run lint-write // linting - updating in place
yarn run test // run tests
```

There is a git hook for running the linter on pre-commit in `/hooks`.
This can be configured to run every time (for this repository only)
by running `git config core.hooksPath hooks`.

### Development flow

It's the author responsibility to do the merge, ideally after having it reviewed. That is:

1. run `yarn run lint-write` and do your PR
2. ask for review relevant reviewers
3. as soon as you get :heavy_check_mark: , you can merge
4. if you don't get :heavy_check_mark: before you go to sleep, you can merge anyway (after manual "testing"). It's of course fine to wait for a review when you don't feel confident merging it without one.
5. there are three teams you can add on review: `frontend`, `backend` and `data`

Rather overcommunicate what you are working on.

## Deployment

We use Github Actions. The pipeline is specified in `.github/workflows/main.yml`

- On a merge to `staging` branch, the code is deployed to the staging environment: http://staging.epidemicforecasting.org/
- On a merge to `master` branch, the code is deployed to the production environment: http://epidemicforecasting.org/
