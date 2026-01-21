# Issue: Add task move smoke test

Goal

- Add a test that verifies moving a task between groups (not just status columns) works and does not crash.

Acceptance criteria

- Test simulates moving a task from one group to another and verifies the board state is updated.
- No runtime errors during simulation.

Notes

- Can reuse fixtures from `frontend/src/services/templates-boards.js` or create a small test board fixture.
