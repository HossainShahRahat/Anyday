# Issue: Add drag/drop smoke test

Goal
- Add an automated smoke test that verifies drag-and-drop behavior in the Kanban view doesn't cause runtime errors and persists state changes.

Acceptance criteria
- A Jest test or lightweight integration test that:
  - Renders the Kanban column list with sample board data.
  - Simulates dragging a task from one column to another.
  - Asserts no runtime exceptions are thrown and the store is updated accordingly.

Notes
- Use React Testing Library with user-event or a DnD simulation helper.
- Keep test focused and fast.
