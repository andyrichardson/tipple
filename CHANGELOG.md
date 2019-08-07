# Changelog

## [v0.6.0](https://github.com/andyrichardson/tipple/tree/v0.6.0) (2019-08-07)

[Full Changelog](https://github.com/andyrichardson/tipple/compare/v0.5.0...v0.6.0)

**Breaking changes:**

- Add persistence capability to the client [\#38](https://github.com/andyrichardson/tipple/issues/38)

**Additions:**

- Add support for SSR [\#21](https://github.com/andyrichardson/tipple/issues/21)

**Merged pull requests:**

- update dependencies [\#51](https://github.com/andyrichardson/tipple/pull/51) ([andyrichardson](https://github.com/andyrichardson))
- Add persistence capabilities to the client \(initialCache\) [\#50](https://github.com/andyrichardson/tipple/pull/50) ([andyrichardson](https://github.com/andyrichardson))

## [v0.5.0](https://github.com/andyrichardson/tipple/tree/v0.5.0) (2019-07-11)

[Full Changelog](https://github.com/andyrichardson/tipple/compare/v0.4.1...v0.5.0)

**Breaking changes:**

- Add ability to auto-fetch on useFetch args change [\#47](https://github.com/andyrichardson/tipple/issues/47)

**Additions:**

- Add ability to specify fetchOptions on fetch & push execution [\#41](https://github.com/andyrichardson/tipple/issues/41)

**Fixed bugs:**

- Add displayName attribute to components [\#39](https://github.com/andyrichardson/tipple/issues/39)
- Make createClient arg optional [\#37](https://github.com/andyrichardson/tipple/issues/37)

**Closed issues:**

- Cleanup example repo [\#40](https://github.com/andyrichardson/tipple/issues/40)

**Merged pull requests:**

- update deps [\#49](https://github.com/andyrichardson/tipple/pull/49) ([andyrichardson](https://github.com/andyrichardson))
- change onMount implementation for autoFetch [\#48](https://github.com/andyrichardson/tipple/pull/48) ([andyrichardson](https://github.com/andyrichardson))
- Add config overrides for fetch & push triggers [\#45](https://github.com/andyrichardson/tipple/pull/45) ([andyrichardson](https://github.com/andyrichardson))
- Update dependencies [\#44](https://github.com/andyrichardson/tipple/pull/44) ([andyrichardson](https://github.com/andyrichardson))
- add displayname [\#43](https://github.com/andyrichardson/tipple/pull/43) ([andyrichardson](https://github.com/andyrichardson))
- Make createClient arg optional [\#42](https://github.com/andyrichardson/tipple/pull/42) ([kitten](https://github.com/kitten))
- Example app updates [\#36](https://github.com/andyrichardson/tipple/pull/36) ([kadikraman](https://github.com/kadikraman))

## [v0.4.1](https://github.com/andyrichardson/tipple/tree/v0.4.1) (2019-05-26)

[Full Changelog](https://github.com/andyrichardson/tipple/compare/v0.4.0...v0.4.1)

**Merged pull requests:**

- Release prep [\#35](https://github.com/andyrichardson/tipple/pull/35) ([andyrichardson](https://github.com/andyrichardson))

## [v0.4.0](https://github.com/andyrichardson/tipple/tree/v0.4.0) (2019-05-26)

[Full Changelog](https://github.com/andyrichardson/tipple/compare/v0.3.1...v0.4.0)

**Breaking changes:**

- Separate client logic from Provider [\#26](https://github.com/andyrichardson/tipple/issues/26)
- Replace "headers" with "fetchOptions" in Provider [\#22](https://github.com/andyrichardson/tipple/issues/22)

**Additions:**

- Add ability to add custom reducers/handlers [\#13](https://github.com/andyrichardson/tipple/issues/13)
- Parse data on receipt [\#24](https://github.com/andyrichardson/tipple/issues/24)
- Prevent duplicate fetch requests [\#20](https://github.com/andyrichardson/tipple/issues/20)

**Fixed bugs:**

- Allow no baseUrl to be specified [\#30](https://github.com/andyrichardson/tipple/issues/30)
- Allow non-json responses [\#29](https://github.com/andyrichardson/tipple/issues/29)

**Closed issues:**

- Prepare for v0.4 relase [\#34](https://github.com/andyrichardson/tipple/issues/34)

**Merged pull requests:**

- Return response if cannot parse json [\#33](https://github.com/andyrichardson/tipple/pull/33) ([andyrichardson](https://github.com/andyrichardson))
- Remove mandatory baseUrl [\#32](https://github.com/andyrichardson/tipple/pull/32) ([andyrichardson](https://github.com/andyrichardson))
- Separate client  [\#28](https://github.com/andyrichardson/tipple/pull/28) ([andyrichardson](https://github.com/andyrichardson))
- Parsing of data in useFetch [\#27](https://github.com/andyrichardson/tipple/pull/27) ([andyrichardson](https://github.com/andyrichardson))
- implementation of deduping in flight requests [\#25](https://github.com/andyrichardson/tipple/pull/25) ([simonxabris](https://github.com/simonxabris))
- Add ability to set default fetchOptions [\#23](https://github.com/andyrichardson/tipple/pull/23) ([andyrichardson](https://github.com/andyrichardson))

## [v0.3.1](https://github.com/andyrichardson/tipple/tree/v0.3.1) (2019-05-13)

[Full Changelog](https://github.com/andyrichardson/tipple/compare/v0.3.0...v0.3.1)

**Additions:**

- Add ability to override globally specified baseUrl [\#17](https://github.com/andyrichardson/tipple/issues/17)

**Merged pull requests:**

- Alternate domains [\#18](https://github.com/andyrichardson/tipple/pull/18) ([andyrichardson](https://github.com/andyrichardson))
- Optimize build \(minor\) [\#15](https://github.com/andyrichardson/tipple/pull/15) ([andyrichardson](https://github.com/andyrichardson))

## [v0.3.0](https://github.com/andyrichardson/tipple/tree/v0.3.0) (2019-04-22)

[Full Changelog](https://github.com/andyrichardson/tipple/compare/v0.2.1...v0.3.0)

**Additions:**

- Add network-only cache policy [\#11](https://github.com/andyrichardson/tipple/issues/11)
- Add option to not auto-fetch on mount [\#10](https://github.com/andyrichardson/tipple/issues/10)

**Merged pull requests:**

- Cleanup implementation of cache invalidation [\#14](https://github.com/andyrichardson/tipple/pull/14) ([andyrichardson](https://github.com/andyrichardson))
- add onMount option [\#12](https://github.com/andyrichardson/tipple/pull/12) ([andyrichardson](https://github.com/andyrichardson))

## [v0.2.1](https://github.com/andyrichardson/tipple/tree/v0.2.1) (2019-04-09)

[Full Changelog](https://github.com/andyrichardson/tipple/compare/v0.1.3...v0.2.1)

**Additions:**

- Add async functionality to usePush [\#7](https://github.com/andyrichardson/tipple/issues/7)
- Add caching policies [\#2](https://github.com/andyrichardson/tipple/issues/2)

**Closed issues:**

- Add docs for useFetch and usePush [\#4](https://github.com/andyrichardson/tipple/issues/4)

**Merged pull requests:**

- Add async [\#9](https://github.com/andyrichardson/tipple/pull/9) ([andyrichardson](https://github.com/andyrichardson))
- Add coverage [\#8](https://github.com/andyrichardson/tipple/pull/8) ([andyrichardson](https://github.com/andyrichardson))
- Add more extensive testing & add cache-first / network-first policies [\#6](https://github.com/andyrichardson/tipple/pull/6) ([andyrichardson](https://github.com/andyrichardson))
- Add api docs [\#5](https://github.com/andyrichardson/tipple/pull/5) ([andyrichardson](https://github.com/andyrichardson))

## [v0.1.3](https://github.com/andyrichardson/tipple/tree/v0.1.3) (2019-03-29)

[Full Changelog](https://github.com/andyrichardson/tipple/compare/v0.1.2...v0.1.3)

## [v0.1.2](https://github.com/andyrichardson/tipple/tree/v0.1.2) (2019-03-29)

[Full Changelog](https://github.com/andyrichardson/tipple/compare/v0.1.1...v0.1.2)

**Merged pull requests:**

- Create LICENSE [\#3](https://github.com/andyrichardson/tipple/pull/3) ([andyrichardson](https://github.com/andyrichardson))

## [v0.1.1](https://github.com/andyrichardson/tipple/tree/v0.1.1) (2019-03-29)

[Full Changelog](https://github.com/andyrichardson/tipple/compare/1b41740870a5c5ed62ea6b86568558f4ed894d58...v0.1.1)

**Merged pull requests:**

- Add ci [\#1](https://github.com/andyrichardson/tipple/pull/1) ([andyrichardson](https://github.com/andyrichardson))



\* *This Change Log was automatically generated by [github_changelog_generator](https://github.com/skywinder/Github-Changelog-Generator)*