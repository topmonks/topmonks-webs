# topmonks-webs

[![CircleCI](https://circleci.com/gh/topmonks/topmonks-webs.svg?style=svg&circle-token=758ac963913c835092778195e28b03bd4d17ac52)](https://circleci.com/gh/topmonks/topmonks-webs)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&identifier=111909755)](https://dependabot.com)
[![CodeFactor](https://www.codefactor.io/repository/github/topmonks/topmonks-webs/badge)](https://www.codefactor.io/repository/github/topmonks/topmonks-webs)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

This is TopMonks websites monorepo for effective development of all our static websites.

This project uses our fork of [Blendid](https://github.com/topmonks/blendid) stack.

Please, format every source code with [EditorConfig](https://editorconfig.org/) and [Prettier](https://github.com/prettier/prettier). We have [ESLint](https://eslint.org/) and [Stylelint](https://stylelint.io/)
preconfigured with prettier presets. Checks run on [Build Server](https://circleci.com/gh/topmonks/topmonks-webs) via `yarn test` command.
In development, check that your work conforms to [Lighthouse](https://developers.google.com/web/tools/lighthouse/) rules. We aim at least for 75% conformity. You can find results in time on our [Lighthouse CI server](https://lighthouse.dev.tmcloud.io/app/projects).

**Be responsible, keep our quality bar high.**

[![CodeScene](https://codescene.io/projects/4460/status.svg) Get more details at **codescene.io**.](https://codescene.io/projects/4460/jobs/latest-successful/results)

## Local development

_We use `www.topmonks.com` as example site. You can use any site likewise._

Prerequisites:

- terminal
- git
- node.js
- yarn

To setup your macOS run these commands in Terminal application

```
# Install Homebrew
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
# Install git
brew install git
# Install Node.js Version Manager
brew install nvm
# Instal Node.js
nvm install node
# Install Yarn package manager
brew install yarn
# Install Pulumi
brew install pulumi
pulumi install plugin
```

Checkout repository

```
git clone git@github.com:topmonks/topmonks-webs.git
cd topmonks-webs
nvm use
```

Install dependencies

```
yarn install
```

Every website has it's own [Blendid](https://github.com/topmonks/blendid) configuration.
Start `www.topmonks.com` development with following command:

```
yarn start:www.topmonks.com
```

### Cloudinary

Sites have ability to automatically upload images to Cloudinary and generate Cloudinary URLs.
Cloudinary needs to be properly configured.
Go to [Cloudinary console](https://cloudinary.com/console) (credentials are in TopMonks 1password vault)
and copy the `Environment variable` with credentials. One time run this command:

```
pbpaste > .env
```

If this step is skipped you will get following error:

```
cloudinaryUrl Unknown cloud_name
```

### Sites available

The following sites can be build and ran using the `yarn start:[SITE]` command.

- `www.topmonks.com`
- `www.topmonks.cz`
- `prodeti.topmonks.cz`
- `caffe.topmonks.cz`
- `blockchain.topmonks.com`
- `studio.topmonks.com`
- `www.hookahmonk.com`
- `session-monk.topmonks.com`

It will start [browser-sync](https://browsersync.io/) session on [http://localhost:3000](http://localhost:3000).

## Production build

Build all websites to `/public` folder:

```
yarn run build
```

Then you can run `www.topmonks.com` site in production configuration with:

```
yarn serve -d public/www.topmonks.com
```

## Create new site

**Before first creation** of site, you will need to setup LHCI authentication, 
because create script will generate LHCI token for you. Open 1Password 
and search for `Lighthouse CI sever DEV`. Copy `LHCI_BASIC_AUTH=...` token
and paste it to `.env` file, e.g. `pbpaste > .env`.

If you want to create a new site, e.g. `new-site.topmonks.com`, simply run

```
yarn create-site new-site.topmonks.com
```

then simply run for development mode

```
yarn start:new-site.topmonks.com
```

The command will generate initial files and package.json scripts, 
Pulumi resources and build/deployment steps for you.

### Options

- `-v`, `--verbose`
- `-h`, `--help`
- `-t`, `--title`, adds title to various places, e.g. `<title>Your title</title>` in default html template. Default value is `TopMonks` if not provided.
- `<project-directory>`, project dir/name

### Full command example

```
yarn create-site new-site.topmonks.com -v --title "New TopMonks App"
```

## Remove existing site

If you want to remove an existing site, e.g. `existing-site.topmonks.com`, you first must delete it's bucket content manually, than simply run

```
yarn remove-site existing-site.topmonks.com
```

The command will delete the directory with `package.json` scripts and CircleCI steps for you.

### Options

- `-v`, `--verbose`
- `-h`, `--help`
- `<project-directory>`, project dir/name

## Shared Assets

Your project can have access to the `/shared` folder to use shared assets.
Currently there is only support for HTTL and CSS.

### Importing shared assets

#### HTML

```
{% include 'common/example.html' %}
```

#### SCSS

```
@import 'common/example'
```

### Creating Shared Assets

To create new assets, create them in:

- html and scss files as `/shared/src/common/example.{html/scss}`

These rules will simplify the import and will ensure that when importing
them in projects, the imports will have the same import pattern starting with `'common/*'`

## Provisioning

Whole infrastructure is provisioned by Pulumi.io program. If you create new website via
`yarn create-site` then the web site will be provisioned in AWS (S3, Cloudfront, Route53).
Website will be added to `websites.json` manifest file where you can override default
settings.

### CDN

You can disable Provisioning of CloudFront CDN distribution by adding following section to
website configuration:

```json
{ "cdn": { "disabled": true } }
```

Route53 entry will the ALIAS to S3 bucket directly.

### DNS

You can disable automatic DNS record creation:

```json
{ "dns": { "disabled": true } }
```

### S3 Website

You can change default settings (`index.html` and `404.html`) of S3 Bucket Website configuration
by adding following section to website configuration:

```json
{
  "bucket": {
    "website": { "redirectAllRequestsTo": "https://caffe.topmonks.cz/" }
  }
}
```

### Pulumi

Any update to Pulumi stack in `master` branch will be deployed from Integration Server.
It is **highly discouraged to update Pulumi state from local machine**.

To use current Pulumi state (you need to have `awscli` installed with `topmonks` credentials profile):

```bash
yarn pulumi:login
```

Preview changes that will be provisioned in next build

```bash
yarn pulumi:pre
```

## Figma design projects

* [TopMonks.com](https://www.figma.com/file/DbvniEPJdbB5OLUonqkgYWT6/TopMonks-web?node-id=11%3A437)
* [Programování pro deti](https://www.figma.com/file/BHVwvDKK14KDMJujg3KCAWcr/Programovani-pro-deti-desktop-mobile?node-id=0%3A1)
* [Startup Studio](https://www.figma.com/file/VidXK3GhxvqaBD0M1qV8AiTw/Startup-studio-desktop-mobile?node-id=0%3A1)
* [Blockchain web](https://www.figma.com/file/POCJGJXlqCiapGxT4yUeBd/blockchain-web-topmonks?node-id=0%3A1)
* [TopMonks Caffè](https://www.figma.com/file/ZEmVn3299f6zECw0Bw98WIR6/Caff%C3%A9-TopMonks)
* [Hlídač shopů](https://www.figma.com/file/hKLyCOXXN6LtS0NtVAbJzk/Hlidacshopu.cz)
* [Hookamonk](https://www.figma.com/file/GWHnW8hVDbMjGglu2s0noG/Hookamonk-web)

## Issues

If you find any [issues](https://github.com/topmonks/topmonks-webs/issues), please,
[report them](https://github.com/topmonks/topmonks-webs/issues/new) immediately.
