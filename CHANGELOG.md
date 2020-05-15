# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/danielrearden/sqlmancer/compare/v0.2.1...HEAD)

## [0.2.1](https://github.com/danielrearden/sqlmancer/compare/v0.2.0...v0.2.1)

### Fixed
- Issue with ORDER BY and json_group_array in SQLite

## [0.2.0](https://github.com/danielrearden/sqlmancer/compare/v0.1.0...v0.2.0) - 2020-05-13

### Added
- Support for MySQL, MariaDB and SQLite
- Support for pagination and aggregation through `paginate` method and `@paginate` directive
- `@sqlmancer` directive for providing configuration options
- `@many` directive to be used instead of `@limit`, `@offset`, `@where`, and `@orderBy`
- `@input` directive for generating input types from models
- Custom scalars configuration
- Watch command for CLI


### Changed
- Client is now built at runtime instead of generating the client code beforehand
- CLI now builds TypeScript typings only instead of entire client
- `findOne`, `findMany` and `findById` now select all available fields by default

### Removed
- Option to provide additional configuration file (all configuration is now provided through SDL)

## 0.1.0 - 2020-03-12
Initial release