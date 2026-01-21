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
  indexAxis: 'y',
  elements: {
    bar: {
      borderWidth: 2,
    },
  },
  responsive: true,
  plugins: {
    legend: {
      position: 'right',
    },
    title: {
      display: true,
      text: 'Tasks by Priority',
    },
  },
  scales: {
    x: {
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
      data: [Math.random(9)*10, Math.random(9)*10,Math.random(9)*10,Math.random(9)*10,Math.random(9)*10],
      backgroundColor: 'rgba(196, 196, 196, 0.2)',
      borderColor: 'rgba(196, 196, 196, 1)',
      borderWidth: 1,
    },
    {
      label: 'Low',
      data: [Math.random(9)*10, Math.random(9)*10,Math.random(9)*10,Math.random(9)*10,Math.random(9)*10],      backgroundColor: 'rgba(87, 155, 252, 0.2)',
      borderColor: 'rgba(87, 155, 252, 1)',
      borderWidth: 1,
    },
    {
      label: 'Medium',
      data: [Math.random(9)*10, Math.random(9)*10,Math.random(9)*10,Math.random(9)*10,Math.random(9)*10],      backgroundColor: 'rgba(85, 89, 223, 0.2)',
      borderColor: 'rgba(85, 89, 223, 1)',
      borderWidth: 1,
    },
    {
      label: 'High',
      data: [Math.random(9)*10, Math.random(9)*10,Math.random(9)*10,Math.random(9)*10,Math.random(9)*10],      backgroundColor: 'rgba(64, 22, 148, 0.2)',
      borderColor: 'rgba(64, 22, 148, 1)',
      borderWidth: 1,
    },
    {
      label: 'Critical⚠️',
      data: [Math.random(9)*10, Math.random(9)*10,Math.random(9)*10,Math.random(9)*10,Math.random(9)*10],      backgroundColor: 'rgba(51, 51, 51, 0.2)',
      borderColor: 'rgba(51, 51, 51, 1)',
      borderWidth: 1,
    },
  ],
};

export function HorizontalChart({ priorityMap = {}, tasks = [], board = null }) {
  // Use real data from board if provided
  let chartData = data;
  
  if (board && board.groups && Array.isArray(board.groups) && board.groups.length > 0) {
    // Get all unique priorities from board
    const allPriorities = new Set();
    board.groups.forEach(group => {
      (group.tasks || []).forEach(task => {
        if (task.priority) allPriorities.add(task.priority);
      });
    });
    
    const priorityLabels = Array.from(allPriorities);
    
    // Count tasks by priority
    const priorityCounts = {};
    priorityLabels.forEach(priority => {
      priorityCounts[priority] = 0;
      board.groups.forEach(group => {
        (group.tasks || []).forEach(task => {
          if ((task.priority || '').toLowerCase() === priority.toLowerCase()) {
            priorityCounts[priority]++;
          }
        });
      });
    });
    
    const priorityColors = {
      'critical ⚠️': { bg: 'rgba(51, 51, 51, 0.2)', border: 'rgba(51, 51, 51, 1)' },
      'high': { bg: 'rgba(64, 22, 148, 0.2)', border: 'rgba(64, 22, 148, 1)' },
      'medium': { bg: 'rgba(85, 89, 223, 0.2)', border: 'rgba(85, 89, 223, 1)' },
      'low': { bg: 'rgba(87, 155, 252, 0.2)', border: 'rgba(87, 155, 252, 1)' },
      'default': { bg: 'rgba(196, 196, 196, 0.2)', border: 'rgba(196, 196, 196, 1)' },
    };
    
    const values = priorityLabels.map(p => priorityCounts[p]);
    
    chartData = {
      labels: priorityLabels.length > 0 ? priorityLabels : ['No Data'],
      datasets: [
        {
          label: 'Tasks by Priority',
          data: values.length > 0 ? values : [0],
          backgroundColor: priorityLabels.map(p => {
            const key = p.toLowerCase();
            return priorityColors[key]?.bg || 'rgba(196, 196, 196, 0.2)';
          }),
          borderColor: priorityLabels.map(p => {
            const key = p.toLowerCase();
            return priorityColors[key]?.border || 'rgba(196, 196, 196, 1)';
          }),
          borderWidth: 1,
        },
      ],
    };
  } else if (priorityMap && Object.keys(priorityMap).length > 0) {
    // Fallback to priorityMap if board not provided
    const labels = Object.keys(priorityMap);
    const values = Object.values(priorityMap);
    
    chartData = {
      labels,
      datasets: [
        {
          label: 'Tasks by Priority',
          data: values,
          backgroundColor: [
            'rgba(196, 196, 196, 0.2)',
            'rgba(87, 155, 252, 0.2)',
            'rgba(85, 89, 223, 0.2)',
            'rgba(64, 22, 148, 0.2)',
            'rgba(51, 51, 51, 0.2)',
          ],
          borderColor: [
            'rgba(196, 196, 196, 1)',
            'rgba(87, 155, 252, 1)',
            'rgba(85, 89, 223, 1)',
            'rgba(64, 22, 148, 1)',
            'rgba(51, 51, 51, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }
  
  return <Bar options={options} data={chartData} />;
}
