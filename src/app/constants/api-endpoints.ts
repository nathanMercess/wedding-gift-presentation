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

    public get adminGiftsList(): string {
        return `${this.apiUrl}/admin/gifts`;
    }

    public get coupleGet(): string {
        return `${this.apiUrl}/couple`;
    }

    public get coupleAdminUpdate(): string {
        return `${this.apiUrl}/admin/couple`;
    }

    public giftsById(id: number): string {
        return `${this.apiUrl}/gifts/${id}`;
    }

    public giftsContribute(giftId: number): string {
        return `${this.apiUrl}/gifts/${giftId}/contribute`;
    }

    public adminGiftsById(id: number): string {
        return `${this.apiUrl}/admin/gifts/${id}`;
    }

    public get paymentCard(): string {
        return `${this.apiUrl}/payments/card`;
    }

    public get paymentPix(): string {
        return `${this.apiUrl}/payments/pix`;
    }

    public paymentStatus(nsu: string): string {
        return `${this.apiUrl}/payments/status/${nsu}`;
    }
}
