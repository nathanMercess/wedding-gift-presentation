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

    public get giftsStats(): string {
        return `${this.apiUrl}/gifts/stats`;
    }

    public get adminGiftsList(): string {
        return `${this.apiUrl}/admin/gifts`;
    }

    public get adminDashboard(): string {
        return `${this.apiUrl}/admin/dashboard`;
    }

    public get adminDashboardOverview(): string {
        return `${this.adminDashboard}/overview`;
    }

    public get adminDashboardCharts(): string {
        return `${this.adminDashboard}/charts`;
    }

    public get adminDashboardActionCenter(): string {
        return `${this.adminDashboard}/action-center`;
    }

    public get adminDashboardRevenue(): string {
        return `${this.adminDashboard}/revenue`;
    }

    public get adminDashboardPaymentHealth(): string {
        return `${this.adminDashboard}/payment-health`;
    }

    public get adminDashboardGiftInsights(): string {
        return `${this.adminDashboard}/gift-insights`;
    }

    public get adminDashboardApiHealth(): string {
        return `${this.adminDashboard}/api-health`;
    }

    public get adminDashboardActivityFeed(): string {
        return `${this.adminDashboard}/activity-feed`;
    }

    public get coupleGet(): string {
        return `${this.apiUrl}/couple`;
    }

    public get coupleAdminUpdate(): string {
        return `${this.apiUrl}/admin/couple`;
    }

    public giftsById(id: string): string {
        return `${this.apiUrl}/gifts/${id}`;
    }

    public giftsContribute(giftId: string): string {
        return `${this.apiUrl}/gifts/${giftId}/contribute`;
    }

    public adminGiftsById(id: string): string {
        return `${this.apiUrl}/admin/gifts/${id}`;
    }

    public get adminGiftsEnrich(): string {
        return `${this.apiUrl}/admin/gifts/enrich`;
    }

    public get adminUploadImage(): string {
        return `${this.apiUrl}/admin/uploads/image`;
    }

    public get paymentCard(): string {
        return `${this.apiUrl}/payment/card`;
    }

    public get paymentPix(): string {
        return `${this.apiUrl}/payment/pix`;
    }

    public paymentStatus(nsu: string): string {
        return `${this.apiUrl}/payment/status/${nsu}`;
    }
}
