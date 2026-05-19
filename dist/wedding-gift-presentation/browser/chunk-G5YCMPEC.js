import {
  HttpClient,
  HttpParams,
  environment,
  ɵɵdefineInjectable,
  ɵɵinject
} from "./chunk-LLMRBLT2.js";

// src/app/services/gift.service.ts
var GiftService = class _GiftService {
  constructor(http) {
    this.http = http;
    this.base = environment.apiUrl;
  }
  getGifts(category, search) {
    let params = new HttpParams();
    if (category && category !== "todos")
      params = params.set("category", category);
    if (search)
      params = params.set("search", search);
    return this.http.get(`${this.base}/gifts`, { params });
  }
  getGift(id) {
    return this.http.get(`${this.base}/gifts/${id}`);
  }
  contribute(giftId, payload) {
    return this.http.post(`${this.base}/gifts/${giftId}/contribute`, payload);
  }
  // Admin
  getAdminGifts() {
    return this.http.get(`${this.base}/admin/gifts`);
  }
  createGift(gift) {
    return this.http.post(`${this.base}/admin/gifts`, gift);
  }
  updateGift(id, gift) {
    return this.http.put(`${this.base}/admin/gifts/${id}`, gift);
  }
  deleteGift(id) {
    return this.http.delete(`${this.base}/admin/gifts/${id}`);
  }
  static {
    this.\u0275fac = function GiftService_Factory(t) {
      return new (t || _GiftService)(\u0275\u0275inject(HttpClient));
    };
  }
  static {
    this.\u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _GiftService, factory: _GiftService.\u0275fac, providedIn: "root" });
  }
};

// src/app/services/couple.service.ts
var CoupleService = class _CoupleService {
  constructor(http) {
    this.http = http;
    this.base = environment.apiUrl;
  }
  getCouple() {
    return this.http.get(`${this.base}/couple`);
  }
  updateCouple(couple) {
    return this.http.put(`${this.base}/admin/couple`, couple);
  }
  static {
    this.\u0275fac = function CoupleService_Factory(t) {
      return new (t || _CoupleService)(\u0275\u0275inject(HttpClient));
    };
  }
  static {
    this.\u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _CoupleService, factory: _CoupleService.\u0275fac, providedIn: "root" });
  }
};

export {
  GiftService,
  CoupleService
};
//# sourceMappingURL=chunk-G5YCMPEC.js.map
