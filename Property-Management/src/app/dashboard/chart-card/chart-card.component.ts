import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-chart-card',
  standalone: false,
  templateUrl: './chart-card.component.html',
  styleUrl: './chart-card.component.css'
})
export class ChartCardComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
}
