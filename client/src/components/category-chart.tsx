import { Card } from "@/components/ui/card";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryChartProps {
  data?: { category: string; count: number; percentage: number }[];
}

export default function CategoryChart({ data = [] }: CategoryChartProps) {
  const chartData = {
    labels: data.map(item => item.category),
    datasets: [
      {
        data: data.map(item => item.percentage),
        backgroundColor: [
          'hsl(262 83% 58%)',
          'hsl(195 100% 50%)',
          'hsl(266 85% 58%)',
          'hsl(147 78% 42%)',
          'hsl(341 75% 51%)',
        ],
        borderWidth: 0,
        cutout: '60%',
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
        callbacks: {
          label: function(context: any) {
            return `${context.label}: ${context.parsed}%`;
          }
        }
      }
    }
  };

  const colorMap = [
    'hsl(262 83% 58%)',
    'hsl(195 100% 50%)',
    'hsl(266 85% 58%)',
    'hsl(147 78% 42%)',
    'hsl(341 75% 51%)',
  ];

  return (
    <Card className="bg-white rounded-3xl p-6 shadow-xl mb-8 border-0 card-hover" data-testid="category-chart">
      <h3 className="text-xl font-bold text-gray-900 mb-6" data-testid="category-title">カテゴリ別在庫</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <div className="w-full h-32" data-testid="category-doughnut-chart">
            {data.length > 0 ? (
              <Doughnut data={chartData} options={options} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                データなし
              </div>
            )}
          </div>
        </div>
        <div className="space-y-3" data-testid="category-legend">
          {data.map((item, index) => (
            <div key={item.category} className="flex items-center justify-between" data-testid={`category-item-${index}`}>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: colorMap[index % colorMap.length] }}
                  data-testid={`category-color-${index}`}
                ></div>
                <span className="text-sm text-card-foreground" data-testid={`category-name-${index}`}>
                  {item.category}
                </span>
              </div>
              <span className="text-sm font-medium" data-testid={`category-percentage-${index}`}>
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
