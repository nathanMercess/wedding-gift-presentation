import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Couple } from '../models/couple.model';

@Injectable({ providedIn: 'root' })
export class CoupleService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCouple(): Observable<Couple> {
    return this.http.get<Couple>(`${this.base}/couple`);
  }

  updateCouple(couple: Partial<Couple>): Observable<Couple> {
    return this.http.put<Couple>(`${this.base}/admin/couple`, couple);
  }
}
