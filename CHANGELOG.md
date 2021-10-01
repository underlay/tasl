# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.1]

### Changed

- Fixed std type and value export configuration
- Fix test imports

## [0.2.0]

### Added

- Type utility methods for computing the infima and suprema of types wrt the subtype partial order
- Basic API documentation in API.md

### Changed

- Type-level code is now contained within a separate `.types` namespace (`tasl.types.Type`, `tasl.types.isEqualTo`, ...)
- Value-level code is now contained within a separate `.values` namespace (`tasl.values.Value`, `tasl.values.isEqualTo`, ...)
- Refactor the existing type utilities

## [0.1.0]

### Added

- This changelog!

[unreleased]: https://github.com/joeltg/big-varint/compare/v0.2.1...HEAD
[0.2.1]: https://github.com/joeltg/big-varint/compare/v0.2.1
[0.2.0]: https://github.com/joeltg/big-varint/compare/v0.2.0
[0.1.0]: https://github.com/joeltg/big-varint/compare/v0.1.0
