import { Injectable } from '@angular/core';
import { ColorUtil } from '../utils/color.util';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  public apply(primaryColor: string, secondaryColor?: string): void {
    if (!primaryColor?.trim())
      return;

    const root = document.documentElement.style;
    const secondary: string = secondaryColor?.trim() ? secondaryColor : ColorUtil.lighten(primaryColor, 0.85);

    root.setProperty('--primary', primaryColor);
    root.setProperty('--ring', primaryColor);
    root.setProperty('--secondary', secondary);
    root.setProperty('--muted', secondary);
  }
}
