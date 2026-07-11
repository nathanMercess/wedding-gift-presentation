import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-access-denied',
    templateUrl: './access-denied.component.html',
    styleUrl: './access-denied.component.scss',
    imports: [CommonModule, RouterLink]
})
export class AccessDeniedComponent {}
