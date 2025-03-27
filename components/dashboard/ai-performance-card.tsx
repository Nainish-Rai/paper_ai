"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
} from "chart.js";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "../ui/LoadingSpinner";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DailyMetrics {
  totalCalls: number;
  totalTime: number;
  totalTokens: number;
  successCount: number;
  errorCount: number;
}

interface EnhancedDailyMetrics extends DailyMetrics {
  date: string;
  avgResponseTime: number;
  avgTokens: number;
  successRate: number;
}

interface AIPerformanceCardProps {
  endpoint: string;
  title: string;
  description?: string;
}

export function AIPerformanceCard({
  endpoint,
  title,
  description,
}: AIPerformanceCardProps) {
  const [metrics, setMetrics] = useState<EnhancedDailyMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch(
          `/api/ai/metrics?endpoint=${endpoint}&days=7`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch metrics");
        }
        const data = await response.json();
        setMetrics(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [endpoint]);

  const chartData = {
    labels: metrics.map((m) => m.date),
    datasets: [
      {
        label: "Response Time (ms)",
        data: metrics.map((m) => m.avgResponseTime),
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
      {
        label: "Success Rate (%)",
        data: metrics.map((m) => m.successRate),
        borderColor: "rgb(54, 162, 235)",
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center h-48 flex items-center justify-center">
            {error}
          </div>
        ) : metrics.length === 0 ? (
          <div className="text-muted-foreground text-center h-48 flex items-center justify-center">
            No data available
          </div>
        ) : (
          <div className="h-48">
            <Line data={chartData} options={options} />
          </div>
        )}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {metrics.length > 0
                ? `${metrics[0].avgResponseTime.toFixed(0)}ms`
                : "-"}
            </div>
            <div className="text-sm text-muted-foreground">
              Avg Response Time
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {metrics.length > 0
                ? `${metrics[0].successRate.toFixed(1)}%`
                : "-"}
            </div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {metrics.length > 0 ? metrics[0].totalCalls : "-"}
            </div>
            <div className="text-sm text-muted-foreground">Total Requests</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
