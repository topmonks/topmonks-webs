# topmonks-webs

[![CircleCI](https://circleci.com/gh/topmonks/topmonks-webs.svg?style=svg&circle-token=758ac963913c835092778195e28b03bd4d17ac52)](https://circleci.com/gh/topmonks/topmonks-webs)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&identifier=111909755)](https://dependabot.com)
[![CodeFactor](https://www.codefactor.io/repository/github/topmonks/topmonks-webs/badge)](https://www.codefactor.io/repository/github/topmonks/topmonks-webs)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

This is TopMonks websites monorepo for effective development of all our static websites.

This project uses [Blendid](https://github.com/vigetlabs/blendid) stack.

Please, format every source code with [EditorConfig](https://editorconfig.org/) and [Prettier](https://github.com/prettier/prettier). We have [ESLint](https://eslint.org/) and [Stylelint](https://stylelint.io/)
preconfigured with prettier presets. Checks run on [Build Server](https://circleci.com/gh/topmonks/topmonks-webs) via `yarn test` command.
In development, check that your work conforms to [Lighthouse](https://developers.google.com/web/tools/lighthouse/) rules. We aim at least for 75% conformity.  

**Be responsible, keep our quality bar high.**

## Local development

*We use `www.topmonks.com` as example site. You can use any site likewise.*

Prerequisites: 
 * terminal
 * git
 * node.js
 * yarn

To setup your macOS run these commands in Terminal application
```
# Install Homebrew
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
# Insatll git
brew install git
# Install Node.js Version Manager
brew install nvm
# Instal Node.js
nvm install 10
# Install Yarn package manager
brew install yarn
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

Every website has it's [Blendid](https://github.com/vigetlabs/blendid) configuration.
Start `www.topmonks.com` development with following command:

```
yarn start:www.topmonks.com
```

### Sites available

The following sites can be build and ran using the `yarn start:[SITE]` command.

* `www.topmonks.com`
* `www.topmonks.cz`
* `prodeti.topmonks.cz`
* `caffe.topmonks.cz`
* `blockchain.topmonks.com`
* `studio.topmonks.com`

It will start [browser-sync](https://browsersync.io/) session on [http://localhost:3000](http://localhost:3000).

## Production build

Build all websites to `/public` folder:

```
yarn run build
```

Then you can run `www.topmonks.com` site in production configuration with:

```
yarn run http-server public/www.topmonks.com -p 3000
```


## Create new site

If you want to create a new site, e.g. `new-site.topmonks.com`, simply run

```
yarn create-site new-site.topmonks.com
```

then simply run for development mode

```
yarn start:new-site.topmonks.com
```

The command will generate initial files and package.json scripts for you.
Don't forget to include your repo in `.circleci/config.yml` when ready to deploy.

### Options

* `-v`, `--verbose`
* `-h`, `--help`
* `-t`, `--title`, adds title to various places, e.g. `<title>Your title</title>` in default html template. Default value is `TopMonks` if not provided.
* `<project-directory>`, project dir/name

### Full command example
```
yarn create-site new-site.topmonks.com -v --title "New TopMonks App" 
```
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

* html and scss files as `/shared/src/common/example.{html/scss}` 

These rules will simplify the import and will ensure that when importing
them in projects, the imports will have the same import pattern starting with `'common/*'`

## Provisioning

Whole infrastructure is provisioned by Pulumi.io program. If you create new website via
`yarn create-site` then the web site will be provisioned in AWS (S3, Cloudfront, Route53).
Website will be added to `websites.json` manifest file where you can override default
settings.

TODO: allow overrides and document them

Any update to Pulumi stack in `master` branch will be deployed from Integration Server.

## Issues

If you find any [issues](https://github.com/topmonks/topmonks-webs/issues), please,
[report them](https://github.com/topmonks/topmonks-webs/issues/new) immediately.
