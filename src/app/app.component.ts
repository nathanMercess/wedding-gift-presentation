import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { GuestViewComponent } from './components/guest-view/guest-view.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LandingPageComponent, GuestViewComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  currentView: 'landing' | 'guest' = 'guest';
}
