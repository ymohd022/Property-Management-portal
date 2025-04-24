import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash-screen',
  standalone: false,
  templateUrl: './splash-screen.component.html',
  styleUrl: './splash-screen.component.css'
})
export class SplashScreenComponent implements OnInit {
  loading = true;

  constructor(private router: Router) {}

  ngOnInit() {
    // Simulate loading time
    setTimeout(() => {
      this.loading = false;
      // Redirect to login after splash screen
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1000);
    }, 2000);
  }
}
