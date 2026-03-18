// chart.service.ts
import { Injectable } from '@angular/core';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  private colors = [
    '#3572b7', '#3aa835', '#017100', '#eb6266', '#143d6a', '#f8bb00'
  ];

  constructor() {
    Chart.register(ChartDataLabels);
  }

  private createDataset(data: number[], labels: string[]) {
    const assignedColors = this.colors.slice(0, data.length);
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: assignedColors,
          borderWidth: 0
        }
      ]
    };
  }

  createChart(canvas: HTMLCanvasElement, config: {
    data: number[],
    labels: string[],
    centerText?: string,
    mobile?: boolean
  }) {
    if (!canvas) return;

    const baseConfig: any = {
      type: 'doughnut',
      data: this.createDataset(config.data, config.labels),
      options: {
        responsive: false,
        maintainAspectRatio: true,
        cutout: '50%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: () => null,
              label: (context:any) => {
                let label = context.label || '';
                if (label) label += ': ';
                if (context.parsed !== null) {
                  label += context.parsed + '%';
                }
                return label;
              }
            },
            bodyFont: { size: config.mobile ? 14 : 16 }
          },
          datalabels: {
            color: (context:any) => {
              return context.dataset.backgroundColor[context.dataIndex] === '#f8bb00'
                ? '#000' : '#fff';
            },
            formatter: (value:any) => value > 4 ? `${value}%` : '',
            font: { size: config.mobile ? 14 : 16 },
            anchor: 'center',
            align: 'center'
          }
        }
      },
      plugins: [ChartDataLabels]
    };

    canvas.width = config.mobile ? 260 : 300;
    canvas.height = config.mobile ? 260 : 300;

    new Chart(canvas, baseConfig);
  }
}