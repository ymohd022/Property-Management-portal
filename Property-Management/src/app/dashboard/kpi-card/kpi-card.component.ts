import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-kpi-card',
  standalone: false,
  templateUrl: './kpi-card.component.html',
  styleUrl: './kpi-card.component.css'
})
export class KpiCardComponent implements OnInit {
  @Input() title: string = '';
  @Input() value: any = 0;
  @Input() icon: string = '';
  @Input() color: string = '#1a3c8f';
  @Input() percentage: number | null = null;
  @Input() isCurrency: boolean = false;
  
  constructor() {}
  
  ngOnInit() {}
}
