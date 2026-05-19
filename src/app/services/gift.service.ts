import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Gift } from '../models/gift.model';
import { Contribution, ContributionRequest } from '../models/contribution.model';

@Injectable({ providedIn: 'root' })
export class GiftService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getGifts(category?: string, search?: string): Observable<Gift[]> {
    let params = new HttpParams();
    if (category && category !== 'todos') params = params.set('category', category);
    if (search) params = params.set('search', search);
    return this.http.get<Gift[]>(`${this.base}/gifts`, { params });
  }

  getGift(id: number): Observable<Gift> {
    return this.http.get<Gift>(`${this.base}/gifts/${id}`);
  }

  contribute(giftId: number, payload: ContributionRequest): Observable<Contribution> {
    return this.http.post<Contribution>(`${this.base}/gifts/${giftId}/contribute`, payload);
  }

  // Admin
  getAdminGifts(): Observable<Gift[]> {
    return this.http.get<Gift[]>(`${this.base}/admin/gifts`);
  }

  createGift(gift: Partial<Gift>): Observable<Gift> {
    return this.http.post<Gift>(`${this.base}/admin/gifts`, gift);
  }

  updateGift(id: number, gift: Partial<Gift>): Observable<Gift> {
    return this.http.put<Gift>(`${this.base}/admin/gifts/${id}`, gift);
  }

  deleteGift(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/admin/gifts/${id}`);
  }
}
