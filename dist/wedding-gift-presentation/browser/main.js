import {
  AuthService,
  Router,
  RouterOutlet,
  bootstrapApplication,
  provideRouter
} from "./chunk-ODX6UUGO.js";
import {
  inject,
  provideHttpClient,
  withInterceptors,
  ɵsetClassDebugInfo,
  ɵɵStandaloneFeature,
  ɵɵdefineComponent,
  ɵɵelement
} from "./chunk-LLMRBLT2.js";

// src/app/app.component.ts
var AppComponent = class _AppComponent {
  static {
    this.\u0275fac = function AppComponent_Factory(t) {
      return new (t || _AppComponent)();
    };
  }
  static {
    this.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _AppComponent, selectors: [["app-root"]], standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 1, vars: 0, template: function AppComponent_Template(rf, ctx) {
      if (rf & 1) {
        \u0275\u0275element(0, "router-outlet");
      }
    }, dependencies: [RouterOutlet], encapsulation: 2 });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(AppComponent, { className: "AppComponent", filePath: "src/app/app.component.ts", lineNumber: 10 });
})();

// src/app/interceptors/auth.interceptor.ts
var authInterceptor = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};

// src/app/guards/auth.guard.ts
var authGuard = () => {
  const auth = inject(AuthService);
  if (auth.isAuthenticated())
    return true;
  inject(Router).navigate(["/admin/login"]);
  return false;
};

// src/app/app.config.ts
var appConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter([
      { path: "", redirectTo: "gifts", pathMatch: "full" },
      {
        path: "gifts",
        loadComponent: () => import("./chunk-B34QSGL6.js").then((m) => m.GuestViewComponent)
      },
      {
        path: "admin/login",
        loadComponent: () => import("./chunk-HJ5UXOTJ.js").then((m) => m.AdminLoginComponent)
      },
      {
        path: "admin",
        canActivate: [authGuard],
        loadComponent: () => import("./chunk-OYWUI4S2.js").then((m) => m.AdminDashboardComponent)
      },
      { path: "**", redirectTo: "gifts" }
    ])
  ]
};

// src/main.ts
bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
//# sourceMappingURL=main.js.map
