# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [3.0.0](https://github.com/member-hooks/loki-hooks/compare/v2.1.2...v3.0.0) (2020-05-11)


### Features

* hook factory function optionally returns create and destroy functions ([e46cfc9](https://github.com/member-hooks/loki-hooks/commit/e46cfc9))


### BREAKING CHANGES

* Hook factory function now returns object with create and destroy function instead
of destroy function



### [2.1.2](https://github.com/member-hooks/loki-hooks/compare/v2.1.1...v2.1.2) (2020-05-10)



### [2.1.1](https://github.com/member-hooks/loki-hooks/compare/v2.1.0...v2.1.1) (2020-05-09)



## [2.1.0](https://github.com/member-hooks/loki-hooks/compare/v2.0.0...v2.1.0) (2020-05-09)


### Features

* factory function can optionally return a destroy function ([24fe6f6](https://github.com/member-hooks/loki-hooks/commit/24fe6f6))



## [2.0.0](https://github.com/member-hooks/loki-hooks/compare/v1.1.0...v2.0.0) (2020-05-08)


### improvement

* install should reinstall when hooks change and uninstall when hooks are removed ([ca378b3](https://github.com/member-hooks/loki-hooks/commit/ca378b3))


### BREAKING CHANGES

* Install changes hooks while previously the changed hooks where not applied



## 1.1.0 (2020-05-06)


### Bug Fixes

* upgrade typedoc ([5b56b11](https://github.com/member-hooks/loki-hooks/commit/5b56b11))


### Features

* initial commit, however, the current solution does not seem to work well ([7cb75ee](https://github.com/member-hooks/loki-hooks/commit/7cb75ee))
