# Issue: Add board duplication smoke test

Goal

- Ensure board duplication path works without runtime errors and the duplicated board has expected structure.

Acceptance criteria

- Test triggers a board duplication action (service-level or store action) and verifies the duplicated board contains groups and tasks.
- No runtime errors and IDs are unique where expected.

Notes

- This test can be purely unit-level by calling the service helper that duplicates boards, or integration-level via store actions.
