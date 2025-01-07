import { Component, ViewChild, ElementRef, AfterViewInit , Input} from '@angular/core';
import { ChartOptions } from 'chart.js';

@Component({
  selector: 'app-pie-graph',
  template: `
    <canvas #myCanvas width="200" height="200"></canvas>
  `,
  styles: []
})
export class PieGraphComponent implements AfterViewInit {
  @ViewChild('myCanvas') myCanvas!: ElementRef;
  private context!: CanvasRenderingContext2D;
  @Input() columnsStatData!: { title: string, type: string, labels: any[], data: any[] };
  ngAfterViewInit() {
    console.log("  PieGraphComponent    ", JSON.stringify(this.columnsStatData))
    this.context = (this.myCanvas.nativeElement as HTMLCanvasElement).getContext('2d')!;
    //this.drawPieChart();
    if (this.columnsStatData.type =="pie" )
    this.drawPieChart();
    if (this.columnsStatData.type =="bar" )
    this.drawBarChart();
  }

  private drawChart1() {
    const columnsStatData1:{ title: string, type: string, labels: any[], data: any[] }={"title":"citizen","type":"pie",
    "labels":["Yes","No"],
    "data":[{"data":[4455,771],"label":"citizen"}]}
    /*let textLabel = this.columnsStatData.labels[0];
    let textData = this.columnsStatData.data[0].data;
*/
     let textLabel = columnsStatData1.labels[0];
     let textData = columnsStatData1.data[0].data;

    if (this.context) {
      this.context.textBaseline = 'top';
      this.context.textAlign = 'start';

      let x = (this.myCanvas.nativeElement as HTMLCanvasElement).width / 2 - (textLabel.length * 4) / 2;
      let y = (this.myCanvas.nativeElement as HTMLCanvasElement).height / 2;
      this.context.fillText(textLabel, x, y - 30);

      x = (this.myCanvas.nativeElement as HTMLCanvasElement).width / 2 - (textData.length * 4) / 2;
      y = (this.myCanvas.nativeElement as HTMLCanvasElement).height / 2;
      this.context.fillText(textData, x-10, y-10);
    }
  }

 private drawPieChart() {
  const columnsStatData1: { title: string, type: string, labels: any[], data: any[] } = this.columnsStatData;
  /*{
    "title": "citizen",
    "type": "pie",
    "labels": ["Yes", "No"],
    "data": [{ "data": [4455, 771], "label": "citizen" }]
  };
*/
  if (this.context) {
    this.context.textBaseline = 'top';
    this.context.textAlign = 'start';

    const canvasWidth = (this.myCanvas.nativeElement as HTMLCanvasElement).width *.9;
    const canvasHeight = (this.myCanvas.nativeElement as HTMLCanvasElement).height * .9;

    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const radius = Math.min(canvasWidth, canvasHeight) / 2.5;

    let angle = 0;

    for (let i = 0; i < columnsStatData1.labels.length; i++) {
      const label = columnsStatData1.labels[i];
      const data = columnsStatData1.data[0].data[i];

      const startAngle = angle;
      const endAngle = angle + (data / columnsStatData1.data[0].data.reduce((a:number, b:number) => a + b, 0)) * 2 * Math.PI;

      this.context.beginPath();
      this.context.moveTo(centerX, centerY);
      this.context.arc(centerX, centerY, radius, startAngle, endAngle);
      this.context.closePath();
      this.context.fillStyle = `hsl(${(360 / columnsStatData1.labels.length) * i}, 100%, 50%)`;
      this.context.fill();

      angle = endAngle;

      // Draw label
      const x = centerX + Math.cos(startAngle + (endAngle - startAngle) / 2) * radius * 0.7;
      const y = centerY + Math.sin(startAngle + (endAngle - startAngle) / 2) * radius * 0.7;
      this.context.fillText(label, x-10, y-10);
    }
  }
}
private drawBarChart() {
  if (this.context) {
    const canvas = (this.myCanvas.nativeElement as HTMLCanvasElement);
    const canvasWidth = canvas.width *.9;
    const canvasHeight = canvas.height *.9;
    const barWidth = canvasWidth / this.columnsStatData.labels.length;

    // Clear canvas
    this.context.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw bars
    for (let i = 0; i < this.columnsStatData.labels.length; i++) {
      const label = this.columnsStatData.labels[i];
      const data = this.columnsStatData.data[0].data[i];
      const x = i * barWidth;
      const barHeight = (data / Math.max(...this.columnsStatData.data[0].data)) * canvasHeight;

      // Draw bar
      this.context.fillStyle = 'blue';
      this.context.fillRect(x, canvasHeight - barHeight, barWidth, barHeight);
    }

    // Draw labels and values
    this.context.fillStyle = 'black';
    this.context.textAlign = 'center';
    this.context.textBaseline = 'bottom';
    this.context.font = 'bold 12px Arial';

    for (let i = 0; i < this.columnsStatData.labels.length; i++) {
      const label = this.columnsStatData.labels[i];
      const data = this.columnsStatData.data[0].data[i];
      const x = i * barWidth + barWidth / 2;
      const y = canvasHeight - ((data / Math.max(...this.columnsStatData.data[0].data)) * canvasHeight) - 5;

      this.context.fillText(label, x, y);
      this.context.fillText(data, x, y);
    }
  }
}
  drawPieChart1() {
    const canvas = this.myCanvas.nativeElement as HTMLCanvasElement;
    const context = this.context;

    PieGraphComponent     
    
    const slices = [
      { color: 'red', value: 30 },
      { color: 'green', value: 50 },
      { color: 'blue', value: 20 }
    ];

    const total = slices.reduce((acc, slice) => acc + slice.value, 0);
    let startAngle = 0;

    slices.forEach(slice => {
      const angle = (slice.value / total) * 2 * Math.PI;
      context.fillStyle = slice.color;
      context.beginPath();
      context.moveTo(canvas.width / 2, canvas.height / 2);
      context.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 2, startAngle, startAngle + angle);
      context.closePath();
      context.fill();
      startAngle += angle;
    });
  }
  // events
  public chartClicked(e: any): void {
    console.log(e);
  }

  public chartHovered(e: any): void {
    console.log(e);
  }

  public pieChartOptions: ChartOptions = {
    plugins: {
      legend: {
        display: false
      }
    }
  };
}
