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

Prerequisites: **git, node.js 10+, yarn**

Checkout repository
```
git clone git@github.com:topmonks/topmonks-webs.git
cd topmonks-webs
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

The following sites can be build and ran using the yarn start:[SITE] command.

* www.topmonks.com
* prodeti.topmonks.cz

It will start [browser-sync](https://browsersync.io/) session on [http://localhost:3000](http://localhost:3000).

## Production build

Build al websites to `/public` folder:

```
yarn run build
```

Then you can run `www.topmonks.com` site in production configuration with:

```
yarn run http-server public/www.topmonks.com -p 3000
```



## Issues

If you find any [issues](https://github.com/topmonks/topmonks-webs/issues), please, [report them](https://github.com/topmonks/topmonks-webs/issues/new) immediately.
