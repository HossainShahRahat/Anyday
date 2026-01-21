# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- Defensive hardening of the frontend to prevent runtime crashes when board/group/task fields are missing or malformed.
- `frontend/src/__tests__/board.service.local.test.js` — smoke test for add-comment flow.

### Changed

- Centralized and hardened service-level mutations in `frontend/src/services/board.service.local.js`.
- Converted several in-place mutation flows to operate on clones for immutability.

### Notes

- No UI or layout changes were made; changes are behavior-preserving when data is valid.
- Recommended follow-ups: add more smoke tests for drag/drop, task moves, and board duplication.
