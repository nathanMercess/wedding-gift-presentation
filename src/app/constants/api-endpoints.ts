import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EndpointsUrls {
    public apiUrl: string = '';

    public constructor() {
        this.apiUrl = environment.apiUrl;
    }

    public get authLogin(): string {
        return `${this.apiUrl}/auth/login`;
    }

    public get giftsList(): string {
        return `${this.apiUrl}/gifts`;
    }

    public giftsById(id: number): string {
        return `${this.apiUrl}/gifts/${id}`;
    }

    public giftsContribute(giftId: number): string {
        return `${this.apiUrl}/gifts/${giftId}/contribute`;
    }

    public get adminGiftsList(): string {
        return `${this.apiUrl}/admin/gifts`;
    }

    public adminGiftsById(id: number): string {
        return `${this.apiUrl}/admin/gifts/${id}`;
    }

    public get coupleGet(): string {
        return `${this.apiUrl}/couple`;
    }

    public get coupleAdminUpdate(): string {
        return `${this.apiUrl}/admin/couple`;
    }
}
