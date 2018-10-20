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

If you want to create a new site, e.g. new-app.topmonks.com, simply run

```
yarn create-app new-app.topmonks.com
```

then simply run for development mode

```
yarn start:new-app.topmonks.com
```

The command will generate initial files and package.json scripts for you. Don't forget to include your repo in .circleci/config.yml when ready to deploy.

### Options

* `-v`, `--verbose`
* `-h`, `--help`
* `-t`, `--title`, adds title to various places, e.g. `<title>Your title</title>` in default html template. Default value is `Topmonks` if not provided.
* `<project-directory>`, project dir/name

### Full command example
```
yarn create-app new-app.topmonks.com -v --title "New Topmonks App" 
```


## Issues

If you find any [issues](https://github.com/topmonks/topmonks-webs/issues), please, [report them](https://github.com/topmonks/topmonks-webs/issues/new) immediately.
