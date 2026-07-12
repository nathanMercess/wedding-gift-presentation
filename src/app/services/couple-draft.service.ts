import { Injectable } from '@angular/core';
import { Couple } from '../models/couple.model';

@Injectable({ providedIn: 'root' })
export class CoupleDraftService {
  public readonly storageKey: string = 'wedding_couple_draft';

  public save(couple: Couple): void {
    localStorage.setItem(this.storageKey, JSON.stringify(couple));
  }

  public load(): Couple | null {
    const stored: string | null = localStorage.getItem(this.storageKey);

    if (!stored)
      return null;

    try {
      return JSON.parse(stored) as Couple;
    } catch {
      this.clear();
      return null;
    }
  }

  public clear(): void {
    localStorage.removeItem(this.storageKey);
  }

  public exists(): boolean {
    return localStorage.getItem(this.storageKey) !== null;
  }
}
