import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { NavBar } from "../cmps/nav-bar";
import { SideGroupBar } from "../cmps/side-group-bar";
import { BoardHeader } from "../cmps/board-header";
import { loadBoard, loadBoards } from "../store/board.actions";
import { Loader } from "monday-ui-react-core";
import {
  socketService,
  SOCKET_EMIT_SET_TOPIC,
  SOCKET_EVENT_UPDATE_BOARD,
} from "../services/socket.service";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  RadialLinearScale,
} from "chart.js";
import { Pie } from "react-chartjs-2";
import { Icon } from "monday-ui-react-core";
import { Board, Group, Note } from "monday-ui-react-core/icons";
import { LineChart } from "../cmps/charts/line-chart.jsx";
import { HorizontalChart } from "../cmps/charts/horizontal-chart.jsx";
import { RadarChart } from "../cmps/charts/radar-chart";

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

export function Dashboard() {
  const { boardId } = useParams();
  const board = useSelector((storeState) => storeState.boardModule.board);
  const boards = useSelector((storeState) => storeState.boardModule.boards);
  const [groups, setGroups] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!boardId) return;
    
    async function initDashboard() {
      await loadBoards();
      await loadBoard(boardId);
    }
    initDashboard();
    
    socketService.emit(SOCKET_EMIT_SET_TOPIC, boardId);
    
    const handleBoardUpdate = (updatedBoardId) => {
      if (updatedBoardId === boardId) {
        loadBoard(boardId);
      }
    };
    
    socketService.on(SOCKET_EVENT_UPDATE_BOARD, handleBoardUpdate);
    
    return () => {
      socketService.off(SOCKET_EVENT_UPDATE_BOARD, handleBoardUpdate);
    };
  }, [boardId]);

  useEffect(() => {
    if (board && board.groups) {
      loadCounts(board);
    }
  }, [board]);

  function loadCounts(currentBoard) {
    if (!currentBoard || !Array.isArray(currentBoard.groups)) {
      setGroups([]);
      setTasks([]);
      return;
    }
    
    let groupsList = [];
    let tasksList = [];
    
    (currentBoard.groups || []).forEach((group) => {
      groupsList.push(group);
      (group.tasks || []).forEach((task) => {
        tasksList.push(task);
      });
    });
    
    setGroups(groupsList);
    setTasks(tasksList);
  }

  function getStatusesMap() {
    if (!board || !Array.isArray(board.groups) || board.groups.length === 0) return {};
    const statusMap = [];
    board.groups.forEach((group) =>
      (group.tasks || []).forEach((task) => {
        const status = (task.status || "").trim();
        if (status) {
          statusMap.push(
            status.charAt(0).toUpperCase() + status.slice(1)
          );
        }
      }),
    );

    return statusMap.reduce((acc, val) => {
      acc[val] = acc[val] ? ++acc[val] : 1;
      return acc;
    }, {});
  }

  function getPriorityMap() {
    if (!board || !Array.isArray(board.groups) || board.groups.length === 0) return {};
    const priorityMap = [];
    board.groups.forEach((group) =>
      (group.tasks || []).forEach((task) => {
        const priority = (task.priority || "").trim();
        if (priority) {
          priorityMap.push(
            priority.charAt(0).toUpperCase() + priority.slice(1)
          );
        }
      }),
    );

    return priorityMap.reduce((acc, val) => {
      acc[val] = acc[val] ? ++acc[val] : 1;
      return acc;
    }, {});
  }

  function getStatusColor(statusLabel, board) {
    if (!board || !board.statuses) return "rgb(196, 196, 196)";
    const status = board.statuses.find(s => 
      (s.label || "").toLowerCase() === statusLabel.toLowerCase()
    );
    return status?.bgColor || "rgb(196, 196, 196)";
  }

  function getPriorityColor(priorityLabel, board) {
    if (!board || !board.priorities) return "rgba(196, 196, 196, 1)";
    const priority = board.priorities.find(p => 
      (p.label || "").toLowerCase() === priorityLabel.toLowerCase()
    );
    return priority?.bgColor || "rgba(196, 196, 196, 1)";
  }

  function convertToRgba(color, alpha = 0.2) {
    if (!color) return `rgba(196, 196, 196, ${alpha})`;
    // If already rgba, just change alpha
    if (color.startsWith('rgba')) {
      return color.replace(/[\d.]+\)$/g, `${alpha})`);
    }
    // If rgb, convert to rgba
    if (color.startsWith('rgb')) {
      return color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
    }
    // If hex, convert to rgba (simplified - assumes 6 digit hex)
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return `rgba(196, 196, 196, ${alpha})`;
  }

  const statusesMap = getStatusesMap();
  const priorityMap = getPriorityMap();

  const statusLabels = Object.keys(statusesMap);
  const statusValues = Object.values(statusesMap);
  const priorityLabels = Object.keys(priorityMap);
  const priorityValues = Object.values(priorityMap);

  // Pie chart data with dynamic colors from board statuses
  const data = {
    labels: statusLabels.length > 0 ? statusLabels : ["No Data"],
    datasets: [
      {
        label: "Tasks by Status",
        data: statusValues.length > 0 ? statusValues : [0],
        backgroundColor: statusLabels.length > 0 
          ? statusLabels.map(label => getStatusColor(label, board))
          : ["rgb(196, 196, 196)"],
        hoverOffset: 4,
      },
    ],
  };

  // Radar chart data with dynamic colors from board priorities
  const priorityData = {
    labels: priorityLabels.length > 0 ? priorityLabels : ["No Data"],
    datasets: [
      {
        label: "Tasks by Priority",
        data: priorityValues.length > 0 ? priorityValues : [0],
        backgroundColor: priorityLabels.length > 0
          ? priorityLabels.map(label => convertToRgba(getPriorityColor(label, board), 0.2))
          : ["rgba(196, 196, 196, 0.2)"],
        borderColor: priorityLabels.length > 0
          ? priorityLabels.map(label => {
              const color = getPriorityColor(label, board);
              // Ensure border color is fully opaque
              if (color.startsWith('rgba')) {
                return color.replace(/,\s*[\d.]+\s*\)$/, ', 1)');
              }
              return color;
            })
          : ["rgba(196, 196, 196, 1)"],
        borderWidth: 1,
        hoverOffset: 5,
      },
    ],
  };

  if (!board)
    return (
      <div className="loader">
        <Loader size={Loader.sizes.LARGE} />
      </div>
    );
  return (
    <section className="board-details">
      <NavBar />
      <SideGroupBar />
      <div className="board-container">
        <BoardHeader board={board} />
        <section className="dashboard">
          <div className="dashboard-cards-container">
            <div className="card-boards">
              <div className="card-icon">
                <Icon iconType={Icon.type.SVG} icon={Board} iconSize={22} />
              </div>
              <div className="dash-board-card-counter">
                {boards && boards.length}
              </div>
              <div className="dash-board-card-counter-by">Boards</div>
            </div>
            <div className="card-groups">
              <div className="card-icon">
                <Icon iconType={Icon.type.SVG} icon={Group} iconSize={22} />
              </div>
              <div className="dash-board-card-counter">
                {groups && groups.length}
              </div>
              <div className="dash-board-card-counter-by">Groups</div>
            </div>
            <div className="card-tasks">
              <div className="card-icon">
                <Icon iconType={Icon.type.SVG} icon={Note} iconSize={22} />
              </div>
              <div className="dash-board-card-counter">
                {tasks && tasks.length}
              </div>
              <div className="dash-board-card-counter-by">Tasks</div>
            </div>
          </div>

          <h1 className="dashboard-second-line-header">Status Summary</h1>
          <div className="dashboard-second-line">
            <div className="dashboard-status-line">
              <LineChart statusesMap={statusesMap} tasks={tasks} board={board} />
            </div>
            <div className="dashboard-status-polar">
              <Pie data={data} />
            </div>
          </div>
          <div className="dashboard-second-line">
            <div className="dashboard-status-line">
              <HorizontalChart priorityMap={priorityMap} tasks={tasks} board={board} />
            </div>

            <div className="dashboard-status-polar">
              <RadarChart priorityData={priorityData} />
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
