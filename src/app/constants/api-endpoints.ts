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

    public get authForgotPassword(): string {
        return `${this.apiUrl}/auth/forgot-password`;
    }

    public get authResetPassword(): string {
        return `${this.apiUrl}/auth/reset-password`;
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
        return `${this.apiUrl}/admin/dashboard/overview`;
    }

    public get adminContributions(): string {
        return `${this.apiUrl}/admin/contributions`;
    }

    public get adminPayments(): string {
        return `${this.apiUrl}/admin/payments`;
    }

    public get adminUsers(): string {
        return `${this.apiUrl}/admin/users`;
    }

    public get adminContributionsExport(): string {
        return `${this.apiUrl}/admin/contributions/export.csv`;
    }

    public get adminPaymentsReconcileApproved(): string {
        return `${this.apiUrl}/admin/payments/reconcile-approved`;
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

    public adminContributionMessageRead(id: string): string {
        return `${this.apiUrl}/admin/contributions/${id}/message-read`;
    }

    public adminContributionMessageArchive(id: string): string {
        return `${this.apiUrl}/admin/contributions/${id}/message-archive`;
    }

    public adminPaymentRefund(orderId: string): string {
        return `${this.apiUrl}/admin/payments/${orderId}/refund`;
    }

    public adminUserActive(id: string): string {
        return `${this.apiUrl}/admin/users/${id}/active`;
    }

    public adminUserRole(id: string): string {
        return `${this.apiUrl}/admin/users/${id}/role`;
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

    public paymentOrder(orderId: string): string {
        return `${this.apiUrl}/payment/order/${orderId}`;
    }

    public get paymentOrderLookupRequest(): string {
        return `${this.apiUrl}/payment/order-lookup/request`;
    }

    public paymentOrderLookup(token: string): string {
        return `${this.apiUrl}/payment/order-lookup/${encodeURIComponent(token)}`;
    }
}
