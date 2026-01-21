import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Tasks by Status Across Groups',
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
      },
    },
  },
};

const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

export const data = {
  labels,
  datasets: [
    {
      label: 'Default',
      data: labels.map(() => Math.random(9)*100),
      backgroundColor: 'rgba(196, 196, 196, 0.5)',
    },
    {
      label: 'Done',
      data: labels.map(() => Math.random(9)*100),
      backgroundColor: 'rgba(0, 200, 117, 0.5)',
    },
    {
      label: 'Stuck',
      data: labels.map(() => Math.random(9)*100),
      backgroundColor: 'rgba(226, 68, 92, 0.5)',
    },
    {
      label: 'Working on it',
      data: labels.map(() => Math.random(9)*100),
      backgroundColor: 'rgba(253, 171, 61, 0.5)',
    },
  ],

};

function getStatusColorFromBoard(statusLabel, board) {
  if (!board || !board.statuses) return 'rgba(196, 196, 196, 0.5)';
  const status = board.statuses.find(s => 
    (s.label || "").toLowerCase() === statusLabel.toLowerCase()
  );
  if (!status || !status.bgColor) return 'rgba(196, 196, 196, 0.5)';
  
  // Convert color to rgba with 0.5 alpha
  const color = status.bgColor;
  if (color.startsWith('rgba')) {
    return color.replace(/,\s*[\d.]+\s*\)$/, ', 0.5)');
  }
  if (color.startsWith('rgb')) {
    return color.replace('rgb', 'rgba').replace(')', ', 0.5)');
  }
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, 0.5)`;
  }
  return 'rgba(196, 196, 196, 0.5)';
}

export function LineChart({ statusesMap = {}, tasks = [], board = null }) {
  // Use real data from board if provided
  let chartData = data;
  
  if (board && board.groups && Array.isArray(board.groups) && board.groups.length > 0) {
    // Get all unique statuses from board
    const allStatuses = new Set();
    board.groups.forEach(group => {
      (group.tasks || []).forEach(task => {
        if (task.status) allStatuses.add(task.status);
      });
    });
    
    const statusLabels = Array.from(allStatuses);
    
    // Get all groups
    const groupLabels = board.groups.map(g => g.title || 'Untitled Group');
    
    // Create datasets for each status with colors from board
    const datasets = statusLabels.map(status => {
      const statusKey = status.toLowerCase();
      const data = groupLabels.map(groupLabel => {
        const group = board.groups.find(g => (g.title || 'Untitled Group') === groupLabel);
        if (!group || !group.tasks) return 0;
        return group.tasks.filter(task => (task.status || '').toLowerCase() === statusKey).length;
      });
      
      return {
        label: status.charAt(0).toUpperCase() + status.slice(1),
        data: data,
        backgroundColor: getStatusColorFromBoard(status, board),
      };
    });
    
    chartData = {
      labels: groupLabels,
      datasets: datasets.length > 0 ? datasets : [{
        label: 'No Tasks',
        data: groupLabels.map(() => 0),
        backgroundColor: 'rgba(196, 196, 196, 0.5)',
      }],
    };
  } else if (statusesMap && Object.keys(statusesMap).length > 0) {
    // Fallback to statusesMap if board not provided
    const labels = Object.keys(statusesMap);
    const values = Object.values(statusesMap);
    
    chartData = {
      labels,
      datasets: [
        {
          label: 'Tasks by Status',
          data: values,
          backgroundColor: [
            'rgba(196, 196, 196, 0.5)',
            'rgba(0, 200, 117, 0.5)',
            'rgba(226, 68, 92, 0.5)',
            'rgba(253, 171, 61, 0.5)',
          ],
        },
      ],
    };
  }
  
  return <Bar options={options} data={chartData} />;
}