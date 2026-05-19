import {
  AuthService,
  Router
} from "./chunk-ODX6UUGO.js";
import {
  DefaultValueAccessor,
  FormsModule,
  NgControlStatus,
  NgControlStatusGroup,
  NgForm,
  NgModel,
  RequiredValidator,
  ɵNgNoValidate
} from "./chunk-CPH2HAIJ.js";
import {
  CommonModule,
  NgIf,
  ɵsetClassDebugInfo,
  ɵɵStandaloneFeature,
  ɵɵadvance,
  ɵɵdefineComponent,
  ɵɵdirectiveInject,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵlistener,
  ɵɵnamespaceHTML,
  ɵɵnamespaceSVG,
  ɵɵnextContext,
  ɵɵproperty,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtwoWayBindingSet,
  ɵɵtwoWayListener,
  ɵɵtwoWayProperty
} from "./chunk-LLMRBLT2.js";

// src/app/components/admin/admin-login/admin-login.component.ts
function AdminLoginComponent_div_18_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 13);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r0.error);
  }
}
var AdminLoginComponent = class _AdminLoginComponent {
  constructor(auth, router) {
    this.auth = auth;
    this.router = router;
    this.email = "";
    this.password = "";
    this.loading = false;
    this.error = "";
  }
  onSubmit() {
    if (!this.email || !this.password)
      return;
    this.loading = true;
    this.error = "";
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(["/admin"]),
      error: () => {
        this.error = "E-mail ou senha inv\xE1lidos.";
        this.loading = false;
      }
    });
  }
  static {
    this.\u0275fac = function AdminLoginComponent_Factory(t) {
      return new (t || _AdminLoginComponent)(\u0275\u0275directiveInject(AuthService), \u0275\u0275directiveInject(Router));
    };
  }
  static {
    this.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _AdminLoginComponent, selectors: [["app-admin-login"]], standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 21, vars: 5, consts: [[1, "login-root"], [1, "login-card"], [1, "login-header"], ["xmlns", "http://www.w3.org/2000/svg", "width", "40", "height", "40", "viewBox", "0 0 24 24", "fill", "currentColor", 1, "brand-icon"], ["d", "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"], [1, "login-form", 3, "ngSubmit"], [1, "form-group"], ["for", "email"], ["id", "email", "type", "email", "name", "email", "placeholder", "admin@exemplo.com", "required", "", 1, "text-input", 3, "ngModelChange", "ngModel"], ["for", "password"], ["id", "password", "type", "password", "name", "password", "placeholder", "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", "required", "", 1, "text-input", 3, "ngModelChange", "ngModel"], ["class", "error-msg", 4, "ngIf"], ["type", "submit", 1, "submit-btn", 3, "disabled"], [1, "error-msg"]], template: function AdminLoginComponent_Template(rf, ctx) {
      if (rf & 1) {
        \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "div", 2);
        \u0275\u0275namespaceSVG();
        \u0275\u0275elementStart(3, "svg", 3);
        \u0275\u0275element(4, "path", 4);
        \u0275\u0275elementEnd();
        \u0275\u0275namespaceHTML();
        \u0275\u0275elementStart(5, "h1");
        \u0275\u0275text(6, "ListaPerfeita");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(7, "p");
        \u0275\u0275text(8, "Acesso administrativo");
        \u0275\u0275elementEnd()();
        \u0275\u0275elementStart(9, "form", 5);
        \u0275\u0275listener("ngSubmit", function AdminLoginComponent_Template_form_ngSubmit_9_listener() {
          return ctx.onSubmit();
        });
        \u0275\u0275elementStart(10, "div", 6)(11, "label", 7);
        \u0275\u0275text(12, "E-mail");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(13, "input", 8);
        \u0275\u0275twoWayListener("ngModelChange", function AdminLoginComponent_Template_input_ngModelChange_13_listener($event) {
          \u0275\u0275twoWayBindingSet(ctx.email, $event) || (ctx.email = $event);
          return $event;
        });
        \u0275\u0275elementEnd()();
        \u0275\u0275elementStart(14, "div", 6)(15, "label", 9);
        \u0275\u0275text(16, "Senha");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(17, "input", 10);
        \u0275\u0275twoWayListener("ngModelChange", function AdminLoginComponent_Template_input_ngModelChange_17_listener($event) {
          \u0275\u0275twoWayBindingSet(ctx.password, $event) || (ctx.password = $event);
          return $event;
        });
        \u0275\u0275elementEnd()();
        \u0275\u0275template(18, AdminLoginComponent_div_18_Template, 2, 1, "div", 11);
        \u0275\u0275elementStart(19, "button", 12);
        \u0275\u0275text(20);
        \u0275\u0275elementEnd()()()();
      }
      if (rf & 2) {
        \u0275\u0275advance(13);
        \u0275\u0275twoWayProperty("ngModel", ctx.email);
        \u0275\u0275advance(4);
        \u0275\u0275twoWayProperty("ngModel", ctx.password);
        \u0275\u0275advance();
        \u0275\u0275property("ngIf", ctx.error);
        \u0275\u0275advance();
        \u0275\u0275property("disabled", ctx.loading);
        \u0275\u0275advance();
        \u0275\u0275textInterpolate1(" ", ctx.loading ? "Entrando..." : "Entrar", " ");
      }
    }, dependencies: [CommonModule, NgIf, FormsModule, \u0275NgNoValidate, DefaultValueAccessor, NgControlStatus, NgControlStatusGroup, RequiredValidator, NgModel, NgForm], styles: ["\n\n.login-root[_ngcontent-%COMP%] {\n  min-height: 100vh;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: #F7F0EA;\n  padding: 1rem;\n}\n.login-card[_ngcontent-%COMP%] {\n  background: #fff;\n  border-radius: 1rem;\n  padding: 2.5rem 2rem;\n  width: 100%;\n  max-width: 400px;\n  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);\n}\n.login-header[_ngcontent-%COMP%] {\n  text-align: center;\n  margin-bottom: 2rem;\n}\n.login-header[_ngcontent-%COMP%]   .brand-icon[_ngcontent-%COMP%] {\n  color: #C4956A;\n  margin-bottom: 0.5rem;\n}\n.login-header[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] {\n  font-size: 1.5rem;\n  font-weight: 700;\n  color: #2C1810;\n  margin: 0 0 0.25rem;\n}\n.login-header[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  color: #8B7B6B;\n  font-size: 0.9rem;\n  margin: 0;\n}\n.login-form[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 1.25rem;\n}\n.form-group[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.4rem;\n}\n.form-group[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  font-size: 0.875rem;\n  font-weight: 500;\n  color: #4A3728;\n}\n.text-input[_ngcontent-%COMP%] {\n  padding: 0.75rem 1rem;\n  border: 1.5px solid #E8DDD5;\n  border-radius: 0.5rem;\n  font-size: 0.95rem;\n  outline: none;\n  transition: border 0.2s;\n}\n.text-input[_ngcontent-%COMP%]:focus {\n  border-color: #C4956A;\n}\n.error-msg[_ngcontent-%COMP%] {\n  background: #fef2f2;\n  color: #dc2626;\n  border-radius: 0.5rem;\n  padding: 0.75rem 1rem;\n  font-size: 0.875rem;\n}\n.submit-btn[_ngcontent-%COMP%] {\n  background: #C4956A;\n  color: #fff;\n  border: none;\n  border-radius: 0.5rem;\n  padding: 0.875rem;\n  font-size: 1rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition: background 0.2s;\n}\n.submit-btn[_ngcontent-%COMP%]:hover:not(:disabled) {\n  background: #B8845A;\n}\n.submit-btn[_ngcontent-%COMP%]:disabled {\n  opacity: 0.6;\n  cursor: not-allowed;\n}\n/*# sourceMappingURL=admin-login.component.css.map */"] });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(AdminLoginComponent, { className: "AdminLoginComponent", filePath: "src/app/components/admin/admin-login/admin-login.component.ts", lineNumber: 14 });
})();
export {
  AdminLoginComponent
};
//# sourceMappingURL=chunk-HJ5UXOTJ.js.map
