import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface InventoryChartProps {
  data?: { date: string; totalStock: number }[];
}

export default function InventoryChart({ data = [] }: InventoryChartProps) {
  const chartData = {
    labels: data.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('ja-JP', { weekday: 'short' });
    }),
    datasets: [
      {
        label: '在庫レベル',
        data: data.map(item => item.totalStock),
        borderColor: 'hsl(262 83% 58%)',
        backgroundColor: 'hsla(262 83% 58% / 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'hsl(262 83% 58%)',
        pointBorderColor: 'hsl(262 83% 58%)',
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'white',
        titleColor: 'hsl(240 10% 3.9%)',
        bodyColor: 'hsl(240 10% 3.9%)',
        borderColor: 'hsl(214.3 31.8% 91.4%)',
        borderWidth: 1,
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'hsl(214.3 31.8% 91.4%)',
          drawBorder: false,
        },
        ticks: {
          color: 'hsl(215.4 16.3% 46.9%)',
          font: {
            size: 12,
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: 'hsl(215.4 16.3% 46.9%)',
          font: {
            size: 12,
          }
        }
      }
    }
  };

  return (
    <Card className="bg-white rounded-3xl p-6 shadow-xl mb-8 border-0 card-hover" data-testid="inventory-chart">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900" data-testid="chart-title">在庫推移</h3>
        <Select defaultValue="week" data-testid="chart-timeframe-select">
          <SelectTrigger className="w-28 text-sm bg-gray-50 border-0 rounded-2xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">今週</SelectItem>
            <SelectItem value="month">今月</SelectItem>
            <SelectItem value="quarter">四半期</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="relative h-52 w-full" data-testid="chart-container">
        {data.length > 0 ? (
          <Line data={chartData} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            データなし
          </div>
        )}
      </div>
    </Card>
  );
}
