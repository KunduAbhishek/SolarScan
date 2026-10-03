# ☀️ SolarScan

## Description

An app built on the **[Solar API]**. The Solar API offers many benefits to solar marketplace websites, solar installers, and solar SaaS designers.

The app showcases and displays the information from the Solar API on a map.

Based on the [Google Maps Platform Solar Potential sample](https://github.com/googlemaps-samples/js-solar-potential), licensed under the Apache License 2.0.

## Requirements

To run the samples, you will need:

- To [sign up with Google Maps Platform]
- A Google Maps Platform [project] with the **Maps JavaScript and Solar APIs** enabled
- An [API key] associated with the project above
- Current version of Node.js and NPM

## Google Maps API key

Once you have your API key, copy [`.env.example`](.env.example) to `.env` and put your key in it.
The `.env` file is git-ignored, so your key is never committed.

```sh
VITE_GOOGLE_MAPS_API_KEY="YOUR_API_KEY"
```

## Running the app

First, run `npm install` to install the required dependencies.

### Developer mode

To start the app in developer mode, this allows hot-reloads.
This means that every time you change a file, the app reloads itself automatically.

```sh
# Run in developer mode.
npm run dev
```

### Production mode

Starting in developer mode enables a lot of useful tools while developing, but for a production version we first need to build the app.

The app is a static single-page app: `npm run build` type checks it and writes the files to `dist/`.
`npm run start` serves them on `$PORT` (8080 by default).

```sh
# Build the app.
npm run build

# Start the app.
npm run start
```

## Deploying to Cloud Run

One option to deploy your app is with [Cloud Run](https://cloud.google.com/run).
It's easy to use and allows us to build and deploy scalable containerized apps written in any language on a fully managed platform.

For some languages like Node.js, it infers the configuration and can [deploy from source directly](https://cloud.google.com/run/docs/deploying-source-code), without any additional configurations!
This uploads your source, builds it with [Cloud Build](https://cloud.google.com/build), deploys it to Cloud Run, and starts the service with `npm run start`.
All with a single command.

```sh
# Choose the Cloud location to deploy the app.
export LOCATION="us-central1"

# Build and deploy the app from source.
gcloud run deploy "solar-potential" \
  --source="." \
  --region="$LOCATION" \
  --allow-unauthenticated
```

## Checking your code

You can use `npm run typecheck` to do type checking.
To run the unit tests use `npm run test:unit`, and for the browser tests use `npm run test:integration`.

To check for styling and formatting issues, you can use `npm run lint`.
To fix any lint issues, use `npm run format` to automatically format all the code base.

## Tech stack

- [Solar API](https://developers.google.com/maps/documentation/solar/overview): Get solar panel configurations, solar potential, and data layers.
- [Google Maps](https://developers.google.com/maps/documentation/javascript/overview): Display a custom map with the Google Maps JavaScript API.
- [Material Desgin 3](https://m3.material.io): Material Design 3 [web components](https://github.com/material-components/material-web#readme).
- [React](https://react.dev): Library to develop declarative reactive web apps with [TypeScript](https://www.typescriptlang.org).
- [Vite](https://vite.dev): Build tool with a fast development experience for modern web projects.
- [Tailwind](https://tailwindcss.com): CSS framework for design and styling.
- [ESLint](https://eslint.org): Statically analyze code to quickly find problems.
- [Prettier](https://prettier.io): Opinionated code formatter.

## Terms of Service

This app uses Google Maps Platform services. Use of Google Maps Platform services through this app is subject to the Google Maps Platform [Terms of Service].

## License

Licensed under the Apache License 2.0. See [LICENSE].

[Solar API]: https://developers.google.com/maps/documentation/solar
[API key]: https://developers.google.com/maps/documentation/solar/get-api-key
[LICENSE]: LICENSE
[project]: https://developers.google.com/maps/documentation/solar/cloud-setup#enabling-apis
[Sign up with Google Maps Platform]: https://console.cloud.google.com/google/maps-apis/start
[Terms of Service]: https://cloud.google.com/maps-platform/terms
