import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { UserProfile, BudgetPlan } from "../types";
import { useMemo } from "react";
import { CURRENCIES } from "../constants";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface WealthPathChartProps {
  user: UserProfile;
  budget: BudgetPlan | null;
}

export function WealthPathChart({ user, budget }: WealthPathChartProps) {
  const currency = CURRENCIES[user.currency] || CURRENCIES.USD;
  
  const data = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIndex = new Date().getMonth();
    const labels = [];
    const values = [];
    const projections = [];

    const netWorth = user.netWorth.assets - user.netWorth.liabilities;
    const monthlySavings = budget ? budget.income - Object.values(budget.expenses).reduce((a, b) => a + b, 0) : 0;
    
    // Past 6 months (simulated)
    for (let i = 5; i >= 0; i--) {
      const monthIdx = (currentMonthIndex - i + 12) % 12;
      labels.push(months[monthIdx]);
      // Mock past growth (80% to 100% of current)
      const factor = 1 - (i * 0.05);
      values.push(netWorth * factor);
      projections.push(null);
    }

    // Future 6 months (projection)
    labels[labels.length - 1] = labels[labels.length - 1] + " (Now)";
    projections[values.length - 1] = values[values.length - 1]; // Connect point

    for (let i = 1; i <= 6; i++) {
      const monthIdx = (currentMonthIndex + i) % 12;
      labels.push(months[monthIdx]);
      const projectedValue = netWorth + (monthlySavings * i) * 1.01; // 1% growth
      values.push(null);
      projections.push(projectedValue);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Historical Net Worth',
          data: values,
          borderColor: '#f0b429',
          backgroundColor: 'rgba(240, 180, 41, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: 'AI Projection',
          data: projections,
          borderColor: '#10b981',
          borderDash: [5, 5],
          backgroundColor: 'rgba(16, 185, 129, 0.05)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
        }
      ]
    };
  }, [user, budget]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: '#8e8e93',
          font: { size: 10, family: 'Inter' },
          usePointStyle: true,
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: '#1c1c1e',
        titleColor: '#f0b429',
        bodyColor: '#ffffff',
        borderColor: '#3a3a3c',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat(currency.locale, { style: 'currency', currency: user.currency }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { 
          color: '#8e8e93',
          font: { size: 10 },
          callback: (value: any) => {
            if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
            if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
            return value;
          }
        }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#8e8e93', font: { size: 10 } }
      }
    }
  };

  return (
    <div className="h-[300px] w-full">
      <Line data={data} options={options} />
    </div>
  );
}
