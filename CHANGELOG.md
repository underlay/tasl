# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0-rc.2] 2022-02-16

### Added

- Add `Schema.count(): number`

### Changed

- Rename `Map.key` to `Map.source`

## [0.3.0-rc.1] 2022-02-04

### Removed

- Type predicate utility methods

### Changed

- Better key caching

## [0.3.0-rc.0] 2022-01-25

### Changed

- Upgraded ava to 4
- Redesigned the entire API!

## [0.2.1] 2021-09-21

### Changed

- Fixed std type and value export configuration
- Fix test imports

## [0.2.0] 2021-09-21

### Added

- Type utility methods for computing the infima and suprema of types wrt the subtype partial order
- Basic API documentation in API.md

### Changed

- Type-level code is now contained within a separate `.types` namespace (`tasl.types.Type`, `tasl.types.isEqualTo`, ...)
- Value-level code is now contained within a separate `.values` namespace (`tasl.values.Value`, `tasl.values.isEqualTo`, ...)
- Refactor the existing type utilities

## [0.1.0] 2021-08-24

### Added

- This changelog!

[unreleased]: https://github.com/underlay/tasl/compare/v0.2.1...HEAD
[0.2.1]: https://github.com/underlay/tasl/compare/v0.2.1
[0.2.0]: https://github.com/underlay/tasl/compare/v0.2.0
[0.1.0]: https://github.com/underlay/tasl/compare/v0.1.0
