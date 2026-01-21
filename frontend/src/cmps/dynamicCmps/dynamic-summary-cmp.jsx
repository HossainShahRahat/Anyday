import {
  DATE_PICKER,
  LABEL_STATUS_PICKER,
  MEMEBER_PICKER,
  NUMBER_PICKER,
  PRIORITY_PICKER,
  STATUS_PICKER,
  TEXT_LABEL,
} from "../../services/board.service.local";

export function DynamicSummaryCmp({ cmp, board, group }) {
  const safeBoard = board || {
    statuses: [],
    labelStatuses: [],
    priorities: [],
  };
  const safeGroup = group || { tasks: [] };

  function gruoupSummaryCalc(cmp) {
    // operate on clones so we don't mutate props
    const localBoard = structuredClone(safeBoard);
    const tasks = Array.isArray(safeGroup.tasks) ? safeGroup.tasks : [];
    let labels = [];

    if (!tasks.length) return [];

    switch (cmp) {
      case STATUS_PICKER: {
        const GroupStatuses = tasks.reduce((acc, task) => {
          const key = task?.status || "default";
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});
        for (const key in GroupStatuses) {
          const found = (localBoard.statuses || []).find(
            (status) => status && status.label === key,
          );
          if (found) {
            const clone = { ...found, value: GroupStatuses[key] };
            labels.push(clone);
          }
        }
        return labels;
      }
      case LABEL_STATUS_PICKER: {
        const GroupLabelsStatuses = tasks.reduce((acc, task) => {
          const key = task?.labelStatus || "default";
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});
        for (const key in GroupLabelsStatuses) {
          const found = (localBoard.labelStatuses || []).find(
            (status) => status && status.label === key,
          );
          if (found) labels.push({ ...found, value: GroupLabelsStatuses[key] });
        }
        return labels;
      }
      case PRIORITY_PICKER: {
        const GroupPriorities = tasks.reduce((acc, task) => {
          const key = task?.priority || "default";
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});
        for (const key in GroupPriorities) {
          const found = (localBoard.priorities || []).find(
            (status) => status && status.label === key,
          );
          if (found) labels.push({ ...found, value: GroupPriorities[key] });
        }
        return labels;
      }
      case NUMBER_PICKER: {
        let sum = 0;
        tasks.forEach((task) => {
          if (!task || typeof task.number !== "number") return;
          sum += task.number;
        });
        if (!sum) return "";
        return sum;
      }
      default:
        return [];
    }
  }

  const taskCount = Array.isArray(safeGroup.tasks) ? safeGroup.tasks.length : 0;

  switch (cmp) {
    case STATUS_PICKER:
      return (
        <div className="status-picker-sum-container">
          <div className="status-sum-container">
            {(gruoupSummaryCalc(cmp) || []).map((statusSum, idx) => {
              const width =
                taskCount > 0
                  ? `${(statusSum.value / taskCount) * 100}%`
                  : "0%";
              return (
                <div
                  key={idx}
                  className="status-sum"
                  style={{
                    backgroundColor: statusSum.bgColor,
                    height: "24px",
                    width,
                  }}
                ></div>
              );
            })}
          </div>
        </div>
      );
    case LABEL_STATUS_PICKER:
      return (
        <div className="label-status-picker-sum-container">
          <div className="label-status-picker-sum">
            {(gruoupSummaryCalc(cmp) || []).map((labelStatusSum, idx) => {
              const width =
                taskCount > 0
                  ? `${(labelStatusSum.value / taskCount) * 100}%`
                  : "0%";
              return (
                <div
                  key={idx}
                  className="status-sum"
                  style={{
                    backgroundColor: labelStatusSum.bgColor,
                    height: "24px",
                    width,
                  }}
                ></div>
              );
            })}
          </div>
        </div>
      );
    case PRIORITY_PICKER:
      return (
        <div className="priority-picker-sum-container">
          <div className="priority-picker-sum">
            {(gruoupSummaryCalc(cmp) || []).map((prioritySum, idx) => {
              const width =
                taskCount > 0
                  ? `${(prioritySum.value / taskCount) * 100}%`
                  : "0%";
              return (
                <div
                  key={idx}
                  className="status-sum"
                  style={{
                    backgroundColor: prioritySum.bgColor,
                    height: "24px",
                    width,
                  }}
                ></div>
              );
            })}
          </div>
        </div>
      );
    case DATE_PICKER:
      return (
        <div className="date-picker-sum-container">
          <div className="date-picker-sum"></div>
        </div>
      );
    case MEMEBER_PICKER:
      return (
        <div className="member-picker-sum-container">
          <div className="member-picker-sum"></div>
        </div>
      );
    case TEXT_LABEL:
      return (
        <div className="text-picker-sum-container">
          <div className="text-picker-sum"></div>
        </div>
      );
    case NUMBER_PICKER:
      return (
        <div className="text-picker-sum-container">
          <div className="text-picker-sum"> {gruoupSummaryCalc(cmp)}</div>
        </div>
      );
    default:
      return null;
  }
}
