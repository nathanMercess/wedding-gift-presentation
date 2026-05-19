import {
  CoupleService,
  GiftService
} from "./chunk-G5YCMPEC.js";
import {
  DefaultValueAccessor,
  FormsModule,
  MaxValidator,
  MinValidator,
  NgControlStatus,
  NgControlStatusGroup,
  NgForm,
  NgModel,
  NumberValueAccessor,
  RequiredValidator,
  ɵNgNoValidate
} from "./chunk-CPH2HAIJ.js";
import {
  CommonModule,
  EventEmitter,
  NgForOf,
  NgIf,
  __spreadProps,
  __spreadValues,
  ɵsetClassDebugInfo,
  ɵɵStandaloneFeature,
  ɵɵadvance,
  ɵɵattribute,
  ɵɵclassMap,
  ɵɵclassProp,
  ɵɵdefineComponent,
  ɵɵdirectiveInject,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵnamespaceHTML,
  ɵɵnamespaceSVG,
  ɵɵnextContext,
  ɵɵprojection,
  ɵɵprojectionDef,
  ɵɵproperty,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵsanitizeUrl,
  ɵɵstyleProp,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtextInterpolate2,
  ɵɵtwoWayBindingSet,
  ɵɵtwoWayListener,
  ɵɵtwoWayProperty
} from "./chunk-LLMRBLT2.js";

// src/app/components/button/button.component.ts
var _c0 = ["*"];
var ButtonComponent = class _ButtonComponent {
  constructor() {
    this.variant = "primary";
    this.size = "md";
    this.disabled = false;
    this.type = "button";
  }
  get buttonClasses() {
    return `${this.variant} ${this.size}`;
  }
  static {
    this.\u0275fac = function ButtonComponent_Factory(t) {
      return new (t || _ButtonComponent)();
    };
  }
  static {
    this.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _ButtonComponent, selectors: [["app-button"]], inputs: { variant: "variant", size: "size", disabled: "disabled", type: "type" }, standalone: true, features: [\u0275\u0275StandaloneFeature], ngContentSelectors: _c0, decls: 2, vars: 5, consts: [[3, "disabled", "type"]], template: function ButtonComponent_Template(rf, ctx) {
      if (rf & 1) {
        \u0275\u0275projectionDef();
        \u0275\u0275elementStart(0, "button", 0);
        \u0275\u0275projection(1);
        \u0275\u0275elementEnd();
      }
      if (rf & 2) {
        \u0275\u0275classMap(ctx.buttonClasses);
        \u0275\u0275property("disabled", ctx.disabled)("type", ctx.type);
        \u0275\u0275attribute("disabled", ctx.disabled ? true : null);
      }
    }, dependencies: [CommonModule], styles: ["\n\nbutton[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: 0.5rem;\n  border-radius: 0.625rem;\n  font-family: var(--font-sans);\n  font-weight: 500;\n  transition: all 0.2s ease;\n  cursor: pointer;\n  border: none;\n}\nbutton[_ngcontent-%COMP%]:focus {\n  outline: 2px solid var(--ring);\n  outline-offset: 2px;\n}\nbutton[_ngcontent-%COMP%]:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\nbutton.primary[_ngcontent-%COMP%] {\n  background-color: var(--primary);\n  color: var(--primary-foreground);\n  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);\n}\nbutton.primary[_ngcontent-%COMP%]:hover:not(:disabled) {\n  opacity: 0.9;\n}\nbutton.secondary[_ngcontent-%COMP%] {\n  background-color: var(--secondary);\n  color: var(--secondary-foreground);\n}\nbutton.outline[_ngcontent-%COMP%] {\n  background: transparent;\n  border: 2px solid var(--primary);\n  color: var(--primary);\n}\nbutton.outline[_ngcontent-%COMP%]:hover:not(:disabled) {\n  background-color: var(--primary);\n  color: var(--primary-foreground);\n}\nbutton.sm[_ngcontent-%COMP%] {\n  padding: 0.375rem 0.75rem;\n  font-size: 0.875rem;\n}\nbutton.md[_ngcontent-%COMP%] {\n  padding: 0.75rem 1.5rem;\n  font-size: 1rem;\n}\nbutton.lg[_ngcontent-%COMP%] {\n  padding: 1rem 2rem;\n  font-size: 1.125rem;\n}\n/*# sourceMappingURL=button.component.css.map */"] });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(ButtonComponent, { className: "ButtonComponent", filePath: "src/app/components/button/button.component.ts", lineNumber: 11 });
})();

// src/app/components/gift-card/gift-card.component.ts
var GiftCardComponent = class _GiftCardComponent {
  constructor() {
    this.image = "";
    this.name = "";
    this.price = 0;
    this.raised = 0;
    this.total = 0;
    this.presentClick = new EventEmitter();
    this.isHovered = false;
  }
  get progressPercent() {
    return Math.min(this.raised / this.total * 100, 100);
  }
  onPresent() {
    this.presentClick.emit();
  }
  onImgError(event) {
    const img = event.target;
    img.style.background = "#F7F0EA";
  }
  static {
    this.\u0275fac = function GiftCardComponent_Factory(t) {
      return new (t || _GiftCardComponent)();
    };
  }
  static {
    this.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _GiftCardComponent, selectors: [["app-gift-card"]], inputs: { image: "image", name: "name", price: "price", raised: "raised", total: "total" }, outputs: { presentClick: "presentClick" }, standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 16, vars: 11, consts: [[1, "gift-card", 3, "mouseenter", "mouseleave", "click"], [1, "image-wrap"], [3, "error", "src", "alt"], [1, "content"], [1, "progress-section"], [1, "progress-labels"], [1, "label"], [1, "values"], [1, "progress-bar"], [1, "progress-fill"], ["variant", "primary", "size", "sm", 2, "width", "100%"]], template: function GiftCardComponent_Template(rf, ctx) {
      if (rf & 1) {
        \u0275\u0275elementStart(0, "div", 0);
        \u0275\u0275listener("mouseenter", function GiftCardComponent_Template_div_mouseenter_0_listener() {
          return ctx.isHovered = true;
        })("mouseleave", function GiftCardComponent_Template_div_mouseleave_0_listener() {
          return ctx.isHovered = false;
        })("click", function GiftCardComponent_Template_div_click_0_listener() {
          return ctx.onPresent();
        });
        \u0275\u0275elementStart(1, "div", 1)(2, "img", 2);
        \u0275\u0275listener("error", function GiftCardComponent_Template_img_error_2_listener($event) {
          return ctx.onImgError($event);
        });
        \u0275\u0275elementEnd()();
        \u0275\u0275elementStart(3, "div", 3)(4, "h3");
        \u0275\u0275text(5);
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(6, "div", 4)(7, "div", 5)(8, "span", 6);
        \u0275\u0275text(9, "Arrecadado");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(10, "span", 7);
        \u0275\u0275text(11);
        \u0275\u0275elementEnd()();
        \u0275\u0275elementStart(12, "div", 8);
        \u0275\u0275element(13, "div", 9);
        \u0275\u0275elementEnd()();
        \u0275\u0275elementStart(14, "app-button", 10);
        \u0275\u0275text(15, "Presentear");
        \u0275\u0275elementEnd()()();
      }
      if (rf & 2) {
        \u0275\u0275classProp("hovered", ctx.isHovered);
        \u0275\u0275advance(2);
        \u0275\u0275classProp("scaled", ctx.isHovered);
        \u0275\u0275property("src", ctx.image, \u0275\u0275sanitizeUrl)("alt", ctx.name);
        \u0275\u0275advance(3);
        \u0275\u0275textInterpolate(ctx.name);
        \u0275\u0275advance(6);
        \u0275\u0275textInterpolate2("R$ ", ctx.raised.toFixed(2), " de R$ ", ctx.total.toFixed(2), "");
        \u0275\u0275advance(2);
        \u0275\u0275styleProp("width", ctx.progressPercent, "%");
      }
    }, dependencies: [CommonModule, ButtonComponent], styles: ["\n\n.gift-card[_ngcontent-%COMP%] {\n  background-color: var(--card);\n  border-radius: var(--radius);\n  overflow: hidden;\n  border: 1px solid var(--border);\n  transition: all 0.3s ease;\n  cursor: pointer;\n}\n.gift-card.hovered[_ngcontent-%COMP%] {\n  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);\n}\n.image-wrap[_ngcontent-%COMP%] {\n  position: relative;\n  aspect-ratio: 4/3;\n  overflow: hidden;\n  background-color: var(--secondary);\n}\n.image-wrap[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n  transition: transform 0.5s ease;\n}\n.image-wrap[_ngcontent-%COMP%]   img.scaled[_ngcontent-%COMP%] {\n  transform: scale(1.1);\n}\n.content[_ngcontent-%COMP%] {\n  padding: 1.25rem;\n  display: flex;\n  flex-direction: column;\n  gap: 0.75rem;\n}\nh3[_ngcontent-%COMP%] {\n  font-family: var(--font-sans);\n  font-weight: 500;\n  color: var(--card-foreground);\n  font-size: 1rem;\n  margin: 0;\n}\n.progress-section[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n}\n.progress-labels[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: baseline;\n}\n.label[_ngcontent-%COMP%] {\n  font-size: 0.875rem;\n  color: var(--muted-foreground);\n}\n.values[_ngcontent-%COMP%] {\n  font-weight: 500;\n  color: var(--card-foreground);\n  font-size: 0.875rem;\n}\n.progress-bar[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 0.5rem;\n  background-color: var(--secondary);\n  border-radius: 9999px;\n  overflow: hidden;\n}\n.progress-fill[_ngcontent-%COMP%] {\n  height: 100%;\n  background-color: var(--primary);\n  border-radius: 9999px;\n  transition: width 0.5s ease;\n  max-width: 100%;\n}\napp-button[_ngcontent-%COMP%] {\n  display: block;\n}\n/*# sourceMappingURL=gift-card.component.css.map */"] });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(GiftCardComponent, { className: "GiftCardComponent", filePath: "src/app/components/gift-card/gift-card.component.ts", lineNumber: 12 });
})();

// src/app/components/gift-details-modal/gift-details-modal.component.ts
function GiftDetailsModalComponent_div_40_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 38);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(1, "svg", 39);
    \u0275\u0275element(2, "path", 40);
    \u0275\u0275elementEnd();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(3, "p");
    \u0275\u0275text(4, "Este presente j\xE1 foi completamente presenteado! Escolha outro para contribuir.");
    \u0275\u0275elementEnd()();
  }
}
function GiftDetailsModalComponent_div_48_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 28)(1, "label");
    \u0275\u0275text(2, "Tipo de contribui\xE7\xE3o");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 41)(4, "button", 42);
    \u0275\u0275listener("click", function GiftDetailsModalComponent_div_48_Template_button_click_4_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.contributionType = "full");
    });
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(5, "svg", 43);
    \u0275\u0275element(6, "polyline", 44)(7, "rect", 45)(8, "line", 46)(9, "path", 47)(10, "path", 48);
    \u0275\u0275elementEnd();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(11, "div", 49);
    \u0275\u0275text(12, "Valor restante");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "div", 50);
    \u0275\u0275text(14);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(15, "button", 42);
    \u0275\u0275listener("click", function GiftDetailsModalComponent_div_48_Template_button_click_15_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.contributionType = "partial");
    });
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(16, "svg", 43);
    \u0275\u0275element(17, "rect", 51)(18, "line", 52);
    \u0275\u0275elementEnd();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(19, "div", 49);
    \u0275\u0275text(20, "Valor parcial");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(21, "div", 50);
    \u0275\u0275text(22, "Voc\xEA escolhe");
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(4);
    \u0275\u0275classProp("selected", ctx_r1.contributionType === "full");
    \u0275\u0275advance(10);
    \u0275\u0275textInterpolate1("R$ ", ctx_r1.remaining.toFixed(2), "");
    \u0275\u0275advance();
    \u0275\u0275classProp("selected", ctx_r1.contributionType === "partial");
  }
}
function GiftDetailsModalComponent_div_49_button_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 59);
    \u0275\u0275listener("click", function GiftDetailsModalComponent_div_49_button_4_Template_button_click_0_listener() {
      const amount_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.customAmount = amount_r5.toString());
    });
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const amount_r5 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" R$ ", amount_r5, " ");
  }
}
function GiftDetailsModalComponent_div_49_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 28)(1, "label");
    \u0275\u0275text(2, "Valor da contribui\xE7\xE3o");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 53);
    \u0275\u0275template(4, GiftDetailsModalComponent_div_49_button_4_Template, 2, 1, "button", 54);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "div", 55)(6, "span", 56);
    \u0275\u0275text(7, "R$");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "input", 57);
    \u0275\u0275twoWayListener("ngModelChange", function GiftDetailsModalComponent_div_49_Template_input_ngModelChange_8_listener($event) {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.customAmount, $event) || (ctx_r1.customAmount = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(9, "p", 58);
    \u0275\u0275text(10);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(4);
    \u0275\u0275property("ngForOf", ctx_r1.quickAmounts);
    \u0275\u0275advance(4);
    \u0275\u0275property("max", ctx_r1.remaining);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.customAmount);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("Valor m\xEDnimo: R$ 10,00 \u2022 Valor m\xE1ximo: R$ ", ctx_r1.remaining.toFixed(2), "");
  }
}
function GiftDetailsModalComponent_div_58_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 13)(1, "div", 14)(2, "span");
    \u0275\u0275text(3, "Valor do presente");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "span", 16);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "div", 14)(7, "span", 15);
    \u0275\u0275text(8, "Taxa de processamento");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "span", 15);
    \u0275\u0275text(10, "R$ 0,00");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(11, "div", 60)(12, "span", 16);
    \u0275\u0275text(13, "Total");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "span", 61);
    \u0275\u0275text(15);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate1("R$ ", ctx_r1.getContributionAmount().toFixed(2), "");
    \u0275\u0275advance(10);
    \u0275\u0275textInterpolate1("R$ ", ctx_r1.getContributionAmount().toFixed(2), "");
  }
}
function GiftDetailsModalComponent_div_59_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 62)(1, "p");
    \u0275\u0275text(2);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("\u2705 Contribui\xE7\xE3o registrada com sucesso! Obrigado, ", ctx_r1.guestName, "!");
  }
}
function GiftDetailsModalComponent_div_60_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 63)(1, "p");
    \u0275\u0275text(2);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r1.submitError);
  }
}
var GiftDetailsModalComponent = class _GiftDetailsModalComponent {
  constructor(giftService) {
    this.giftService = giftService;
    this.coupleName = "";
    this.close = new EventEmitter();
    this.contributionType = "full";
    this.customAmount = "";
    this.guestName = "";
    this.guestMessage = "";
    this.quickAmounts = [50, 100, 200, 300];
    this.submitting = false;
    this.submitSuccess = false;
    this.submitError = "";
  }
  get remaining() {
    return this.gift.total - this.gift.raised;
  }
  get progress() {
    return this.gift.raised / this.gift.total * 100;
  }
  get isCompleted() {
    return this.gift.raised >= this.gift.total;
  }
  getContributionAmount() {
    if (this.contributionType === "full")
      return this.remaining;
    return parseFloat(this.customAmount) || 0;
  }
  onBackdropClick(event) {
    if (event.target.classList.contains("modal-backdrop")) {
      this.close.emit();
    }
  }
  onSubmit() {
    const amount = this.getContributionAmount();
    if (!this.guestName || amount <= 0)
      return;
    this.submitting = true;
    this.submitError = "";
    this.giftService.contribute(this.gift.id, {
      guestName: this.guestName,
      amount,
      message: this.guestMessage || void 0
    }).subscribe({
      next: () => {
        this.submitSuccess = true;
        this.submitting = false;
        this.gift = __spreadProps(__spreadValues({}, this.gift), { raised: Math.min(this.gift.raised + amount, this.gift.total) });
      },
      error: () => {
        this.submitError = "Erro ao registrar contribui\xE7\xE3o. Tente novamente.";
        this.submitting = false;
      }
    });
  }
  static {
    this.\u0275fac = function GiftDetailsModalComponent_Factory(t) {
      return new (t || _GiftDetailsModalComponent)(\u0275\u0275directiveInject(GiftService));
    };
  }
  static {
    this.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _GiftDetailsModalComponent, selectors: [["app-gift-details-modal"]], inputs: { gift: "gift", coupleName: "coupleName" }, outputs: { close: "close" }, standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 68, vars: 21, consts: [[1, "modal-backdrop", 3, "click"], [1, "modal-container"], [1, "modal-header"], [1, "close-btn", 3, "click"], ["xmlns", "http://www.w3.org/2000/svg", "width", "24", "height", "24", "viewBox", "0 0 24 24", "fill", "none", "stroke", "currentColor", "stroke-width", "2"], ["x1", "18", "y1", "6", "x2", "6", "y2", "18"], ["x1", "6", "y1", "6", "x2", "18", "y2", "18"], [1, "modal-content"], [1, "modal-grid"], [1, "gift-info"], [1, "gift-image"], [3, "src", "alt"], [1, "description"], [1, "summary-box"], [1, "summary-row"], [1, "label"], [1, "value"], [1, "value", "primary"], [1, "progress-wrap"], [1, "progress-bar"], [1, "progress-fill"], [1, "progress-text"], ["class", "completed-notice", 4, "ngIf"], [1, "form-side"], [1, "serif"], [1, "subtitle"], [1, "gift-form", 3, "ngSubmit"], ["class", "form-group", 4, "ngIf"], [1, "form-group"], ["type", "text", "name", "guestName", "placeholder", "Digite seu nome", "required", "", 1, "text-input", 3, "ngModelChange", "ngModel"], ["name", "guestMessage", "placeholder", "Deixe uma mensagem especial...", "rows", "3", 1, "text-input", 2, "resize", "none", 3, "ngModelChange", "ngModel"], ["class", "summary-box", 4, "ngIf"], ["class", "completed-notice", "style", "margin-bottom:1rem", 4, "ngIf"], ["class", "completed-notice", "style", "margin-bottom:1rem;background:#fef2f2;color:#dc2626", 4, "ngIf"], [1, "actions"], ["variant", "outline", "type", "button", 3, "click"], ["variant", "primary", "type", "submit", 3, "disabled"], [1, "legal-text"], [1, "completed-notice"], ["xmlns", "http://www.w3.org/2000/svg", "width", "20", "height", "20", "viewBox", "0 0 24 24", "fill", "currentColor"], ["d", "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"], [1, "contrib-grid"], ["type", "button", 1, "contrib-btn", 3, "click"], ["xmlns", "http://www.w3.org/2000/svg", "width", "24", "height", "24", "viewBox", "0 0 24 24", "fill", "none", "stroke", "currentColor", "stroke-width", "2", 1, "contrib-icon"], ["points", "20 12 20 22 4 22 4 12"], ["x", "2", "y", "7", "width", "20", "height", "5"], ["x1", "12", "y1", "22", "x2", "12", "y2", "7"], ["d", "M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"], ["d", "M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"], [1, "contrib-label"], [1, "contrib-value"], ["x", "1", "y", "4", "width", "22", "height", "16", "rx", "2", "ry", "2"], ["x1", "1", "y1", "10", "x2", "23", "y2", "10"], [1, "quick-amounts"], ["type", "button", "class", "quick-btn", 3, "click", 4, "ngFor", "ngForOf"], [1, "input-wrap"], [1, "input-prefix"], ["type", "number", "step", "0.01", "min", "10", "name", "customAmount", "placeholder", "0,00", "required", "", 1, "text-input", "padded", 3, "ngModelChange", "max", "ngModel"], [1, "hint"], ["type", "button", 1, "quick-btn", 3, "click"], [1, "summary-row", "total-row"], [1, "total-amount"], [1, "completed-notice", 2, "margin-bottom", "1rem"], [1, "completed-notice", 2, "margin-bottom", "1rem", "background", "#fef2f2", "color", "#dc2626"]], template: function GiftDetailsModalComponent_Template(rf, ctx) {
      if (rf & 1) {
        \u0275\u0275elementStart(0, "div", 0);
        \u0275\u0275listener("click", function GiftDetailsModalComponent_Template_div_click_0_listener($event) {
          return ctx.onBackdropClick($event);
        });
        \u0275\u0275elementStart(1, "div", 1)(2, "div", 2)(3, "h2");
        \u0275\u0275text(4, "Detalhes do Presente");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(5, "button", 3);
        \u0275\u0275listener("click", function GiftDetailsModalComponent_Template_button_click_5_listener() {
          return ctx.close.emit();
        });
        \u0275\u0275namespaceSVG();
        \u0275\u0275elementStart(6, "svg", 4);
        \u0275\u0275element(7, "line", 5)(8, "line", 6);
        \u0275\u0275elementEnd()()();
        \u0275\u0275namespaceHTML();
        \u0275\u0275elementStart(9, "div", 7)(10, "div", 8)(11, "div", 9)(12, "div", 10);
        \u0275\u0275element(13, "img", 11);
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(14, "div")(15, "h3");
        \u0275\u0275text(16);
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(17, "p", 12);
        \u0275\u0275text(18);
        \u0275\u0275elementEnd()();
        \u0275\u0275elementStart(19, "div", 13)(20, "div", 14)(21, "span", 15);
        \u0275\u0275text(22, "Valor total");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(23, "span", 16);
        \u0275\u0275text(24);
        \u0275\u0275elementEnd()();
        \u0275\u0275elementStart(25, "div", 14)(26, "span", 15);
        \u0275\u0275text(27, "Arrecadado");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(28, "span", 17);
        \u0275\u0275text(29);
        \u0275\u0275elementEnd()();
        \u0275\u0275elementStart(30, "div", 14)(31, "span", 15);
        \u0275\u0275text(32, "Faltam");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(33, "span", 16);
        \u0275\u0275text(34);
        \u0275\u0275elementEnd()();
        \u0275\u0275elementStart(35, "div", 18)(36, "div", 19);
        \u0275\u0275element(37, "div", 20);
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(38, "p", 21);
        \u0275\u0275text(39);
        \u0275\u0275elementEnd()()();
        \u0275\u0275template(40, GiftDetailsModalComponent_div_40_Template, 5, 0, "div", 22);
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(41, "div", 23)(42, "div")(43, "h3", 24);
        \u0275\u0275text(44, "Como deseja presentear?");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(45, "p", 25);
        \u0275\u0275text(46);
        \u0275\u0275elementEnd()();
        \u0275\u0275elementStart(47, "form", 26);
        \u0275\u0275listener("ngSubmit", function GiftDetailsModalComponent_Template_form_ngSubmit_47_listener() {
          return ctx.onSubmit();
        });
        \u0275\u0275template(48, GiftDetailsModalComponent_div_48_Template, 23, 5, "div", 27)(49, GiftDetailsModalComponent_div_49_Template, 11, 4, "div", 27);
        \u0275\u0275elementStart(50, "div", 28)(51, "label");
        \u0275\u0275text(52, "Seu nome completo");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(53, "input", 29);
        \u0275\u0275twoWayListener("ngModelChange", function GiftDetailsModalComponent_Template_input_ngModelChange_53_listener($event) {
          \u0275\u0275twoWayBindingSet(ctx.guestName, $event) || (ctx.guestName = $event);
          return $event;
        });
        \u0275\u0275elementEnd()();
        \u0275\u0275elementStart(54, "div", 28)(55, "label");
        \u0275\u0275text(56, "Mensagem para o casal (opcional)");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(57, "textarea", 30);
        \u0275\u0275twoWayListener("ngModelChange", function GiftDetailsModalComponent_Template_textarea_ngModelChange_57_listener($event) {
          \u0275\u0275twoWayBindingSet(ctx.guestMessage, $event) || (ctx.guestMessage = $event);
          return $event;
        });
        \u0275\u0275elementEnd()();
        \u0275\u0275template(58, GiftDetailsModalComponent_div_58_Template, 16, 2, "div", 31)(59, GiftDetailsModalComponent_div_59_Template, 3, 1, "div", 32)(60, GiftDetailsModalComponent_div_60_Template, 3, 1, "div", 33);
        \u0275\u0275elementStart(61, "div", 34)(62, "app-button", 35);
        \u0275\u0275listener("click", function GiftDetailsModalComponent_Template_app_button_click_62_listener() {
          return ctx.close.emit();
        });
        \u0275\u0275text(63, "Cancelar");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(64, "app-button", 36);
        \u0275\u0275text(65);
        \u0275\u0275elementEnd()();
        \u0275\u0275elementStart(66, "p", 37);
        \u0275\u0275text(67, " Ao continuar, voc\xEA concorda com nossos termos de uso e pol\xEDtica de privacidade. Pagamento 100% seguro. ");
        \u0275\u0275elementEnd()()()()()()();
      }
      if (rf & 2) {
        \u0275\u0275advance(13);
        \u0275\u0275property("src", ctx.gift.image, \u0275\u0275sanitizeUrl)("alt", ctx.gift.name);
        \u0275\u0275advance(3);
        \u0275\u0275textInterpolate(ctx.gift.name);
        \u0275\u0275advance(2);
        \u0275\u0275textInterpolate(ctx.gift.description);
        \u0275\u0275advance(6);
        \u0275\u0275textInterpolate1("R$ ", ctx.gift.total.toFixed(2), "");
        \u0275\u0275advance(5);
        \u0275\u0275textInterpolate1("R$ ", ctx.gift.raised.toFixed(2), "");
        \u0275\u0275advance(5);
        \u0275\u0275textInterpolate1("R$ ", ctx.remaining.toFixed(2), "");
        \u0275\u0275advance(3);
        \u0275\u0275styleProp("width", ctx.progress, "%");
        \u0275\u0275advance(2);
        \u0275\u0275textInterpolate1("", ctx.progress.toFixed(0), "% arrecadado");
        \u0275\u0275advance();
        \u0275\u0275property("ngIf", ctx.isCompleted);
        \u0275\u0275advance(6);
        \u0275\u0275textInterpolate1("Presenteie ", ctx.coupleName, " com este item especial");
        \u0275\u0275advance(2);
        \u0275\u0275property("ngIf", !ctx.isCompleted);
        \u0275\u0275advance();
        \u0275\u0275property("ngIf", ctx.contributionType === "partial" && !ctx.isCompleted);
        \u0275\u0275advance(4);
        \u0275\u0275twoWayProperty("ngModel", ctx.guestName);
        \u0275\u0275advance(4);
        \u0275\u0275twoWayProperty("ngModel", ctx.guestMessage);
        \u0275\u0275advance();
        \u0275\u0275property("ngIf", !ctx.isCompleted);
        \u0275\u0275advance();
        \u0275\u0275property("ngIf", ctx.submitSuccess);
        \u0275\u0275advance();
        \u0275\u0275property("ngIf", ctx.submitError);
        \u0275\u0275advance(4);
        \u0275\u0275property("disabled", ctx.isCompleted || ctx.contributionType === "partial" && !ctx.customAmount || ctx.submitting || ctx.submitSuccess);
        \u0275\u0275advance();
        \u0275\u0275textInterpolate1(" ", ctx.isCompleted ? "Presente completo" : ctx.submitting ? "Enviando..." : ctx.submitSuccess ? "Enviado!" : "Confirmar presente", " ");
      }
    }, dependencies: [CommonModule, NgForOf, NgIf, FormsModule, \u0275NgNoValidate, DefaultValueAccessor, NumberValueAccessor, NgControlStatus, NgControlStatusGroup, RequiredValidator, MinValidator, MaxValidator, NgModel, NgForm, ButtonComponent], styles: ["\n\n.modal-backdrop[_ngcontent-%COMP%] {\n  position: fixed;\n  inset: 0;\n  z-index: 50;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 1rem;\n  background: rgba(107, 107, 107, 0.5);\n  -webkit-backdrop-filter: blur(4px);\n  backdrop-filter: blur(4px);\n}\n.modal-container[_ngcontent-%COMP%] {\n  background-color: var(--background);\n  border-radius: calc(var(--radius) + 8px);\n  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);\n  max-width: 56rem;\n  width: 100%;\n  max-height: 90vh;\n  overflow: hidden;\n  display: flex;\n  flex-direction: column;\n}\n.modal-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 1.5rem;\n  border-bottom: 1px solid var(--border);\n}\n.modal-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  font-family: var(--font-serif);\n  font-size: 1.5rem;\n  color: var(--foreground);\n}\n.close-btn[_ngcontent-%COMP%] {\n  width: 2.5rem;\n  height: 2.5rem;\n  border-radius: 9999px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  color: var(--foreground);\n  transition: background 0.2s;\n  cursor: pointer;\n}\n.close-btn[_ngcontent-%COMP%]:hover {\n  background-color: var(--secondary);\n}\n.modal-content[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow-y: auto;\n  padding: 1.5rem;\n}\n.modal-grid[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 2rem;\n}\n@media (min-width: 768px) {\n  .modal-grid[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr 1fr;\n  }\n}\n.gift-info[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 1.5rem;\n}\n.gift-image[_ngcontent-%COMP%] {\n  aspect-ratio: 1/1;\n  border-radius: calc(var(--radius) + 4px);\n  overflow: hidden;\n  background-color: var(--secondary);\n}\n.gift-image[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}\nh3[_ngcontent-%COMP%] {\n  font-family: var(--font-sans);\n  font-weight: 500;\n  color: var(--foreground);\n  font-size: 1.1rem;\n  margin-bottom: 0.5rem;\n}\n.serif[_ngcontent-%COMP%] {\n  font-family: var(--font-serif) !important;\n  font-size: 1.25rem !important;\n}\n.subtitle[_ngcontent-%COMP%] {\n  font-size: 0.875rem;\n  color: var(--muted-foreground);\n  margin: 0 0 0.5rem;\n}\n.description[_ngcontent-%COMP%] {\n  color: var(--muted-foreground);\n  line-height: 1.625;\n  margin: 0;\n}\n.summary-box[_ngcontent-%COMP%] {\n  background-color: var(--secondary);\n  border-radius: var(--radius);\n  padding: 1rem;\n  display: flex;\n  flex-direction: column;\n  gap: 0.75rem;\n}\n.summary-row[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n.total-row[_ngcontent-%COMP%] {\n  border-top: 1px solid var(--border);\n  padding-top: 0.5rem;\n}\n.label[_ngcontent-%COMP%] {\n  font-size: 0.875rem;\n  color: var(--muted-foreground);\n}\n.value[_ngcontent-%COMP%] {\n  font-weight: 500;\n  color: var(--foreground);\n}\n.value.primary[_ngcontent-%COMP%] {\n  color: var(--primary);\n}\n.total-amount[_ngcontent-%COMP%] {\n  font-size: 1.25rem;\n  font-weight: 500;\n  color: var(--primary);\n  font-family: var(--font-serif);\n}\n.progress-wrap[_ngcontent-%COMP%] {\n  padding-top: 0.5rem;\n}\n.progress-bar[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 0.75rem;\n  background-color: var(--background);\n  border-radius: 9999px;\n  overflow: hidden;\n}\n.progress-fill[_ngcontent-%COMP%] {\n  height: 100%;\n  background-color: var(--primary);\n  transition: width 0.5s ease;\n}\n.progress-text[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: var(--muted-foreground);\n  text-align: center;\n  margin-top: 0.5rem;\n}\n.completed-notice[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-start;\n  gap: 0.75rem;\n  background: rgba(199, 154, 109, 0.1);\n  border: 1px solid rgba(199, 154, 109, 0.2);\n  border-radius: var(--radius);\n  padding: 1rem;\n  color: var(--primary);\n}\n.completed-notice[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  font-size: 0.875rem;\n  color: var(--foreground);\n  margin: 0;\n}\n.form-side[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 1.5rem;\n}\n.gift-form[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 1.5rem;\n}\n.form-group[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n}\n.form-group[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  font-size: 0.875rem;\n  font-weight: 500;\n  color: var(--foreground);\n}\n.contrib-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 0.75rem;\n}\n.contrib-btn[_ngcontent-%COMP%] {\n  padding: 1rem;\n  border-radius: var(--radius);\n  border: 2px solid var(--border);\n  transition: all 0.2s;\n  text-align: left;\n  background: var(--background);\n  cursor: pointer;\n}\n.contrib-btn.selected[_ngcontent-%COMP%] {\n  border-color: var(--primary);\n  background: rgba(199, 154, 109, 0.05);\n}\n.contrib-btn[_ngcontent-%COMP%]:hover:not(.selected) {\n  border-color: rgba(199, 154, 109, 0.5);\n}\n.contrib-icon[_ngcontent-%COMP%] {\n  color: var(--primary);\n  margin-bottom: 0.5rem;\n  display: block;\n}\n.contrib-label[_ngcontent-%COMP%] {\n  font-weight: 500;\n  color: var(--foreground);\n  font-size: 0.875rem;\n}\n.contrib-value[_ngcontent-%COMP%] {\n  font-size: 0.8rem;\n  color: var(--muted-foreground);\n  margin-top: 0.1rem;\n}\n.quick-amounts[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(4, 1fr);\n  gap: 0.5rem;\n  margin-bottom: 0.75rem;\n}\n.quick-btn[_ngcontent-%COMP%] {\n  padding: 0.5rem 0.75rem;\n  border-radius: var(--radius);\n  border: 1px solid var(--border);\n  background: var(--background);\n  font-size: 0.875rem;\n  color: var(--foreground);\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.quick-btn[_ngcontent-%COMP%]:hover {\n  border-color: var(--primary);\n  background: rgba(199, 154, 109, 0.05);\n}\n.input-wrap[_ngcontent-%COMP%] {\n  position: relative;\n}\n.input-prefix[_ngcontent-%COMP%] {\n  position: absolute;\n  left: 1rem;\n  top: 50%;\n  transform: translateY(-50%);\n  color: var(--muted-foreground);\n}\n.text-input[_ngcontent-%COMP%] {\n  width: 100%;\n  padding: 0.75rem 1rem;\n  border-radius: var(--radius);\n  border: 1px solid var(--border);\n  background: var(--background);\n  color: var(--foreground);\n  font-size: 1rem;\n  font-family: var(--font-sans);\n  outline: none;\n  transition: box-shadow 0.2s;\n  box-sizing: border-box;\n}\n.text-input.padded[_ngcontent-%COMP%] {\n  padding-left: 3rem;\n}\n.text-input[_ngcontent-%COMP%]:focus {\n  box-shadow: 0 0 0 2px var(--ring);\n}\n.text-input[_ngcontent-%COMP%]::placeholder {\n  color: var(--muted-foreground);\n}\n.hint[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: var(--muted-foreground);\n  margin: 0;\n}\n.actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.75rem;\n  padding-top: 1rem;\n}\n.actions[_ngcontent-%COMP%]   app-button[_ngcontent-%COMP%] {\n  flex: 1;\n}\n.legal-text[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: var(--muted-foreground);\n  text-align: center;\n  margin: 0;\n}\n/*# sourceMappingURL=gift-details-modal.component.css.map */"] });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(GiftDetailsModalComponent, { className: "GiftDetailsModalComponent", filePath: "src/app/components/gift-details-modal/gift-details-modal.component.ts", lineNumber: 15 });
})();

// src/app/components/guest-view/guest-view.component.ts
function GuestViewComponent_div_54_button_5_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 48);
    \u0275\u0275listener("click", function GuestViewComponent_div_54_button_5_Template_button_click_0_listener() {
      const cat_r2 = \u0275\u0275restoreView(_r1).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.selectedCategory = cat_r2.id);
    });
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const cat_r2 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275classProp("active", ctx_r2.selectedCategory === cat_r2.id);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2("", cat_r2.label, " (", cat_r2.count, ")");
  }
}
function GuestViewComponent_div_54_button_10_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 48);
    \u0275\u0275listener("click", function GuestViewComponent_div_54_button_10_Template_button_click_0_listener() {
      const s_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.sortBy = s_r5.id);
    });
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const s_r5 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275classProp("active", ctx_r2.sortBy === s_r5.id);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(s_r5.label);
  }
}
function GuestViewComponent_div_54_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 46)(1, "div")(2, "h3");
    \u0275\u0275text(3, "Categorias");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "div", 47);
    \u0275\u0275template(5, GuestViewComponent_div_54_button_5_Template, 2, 4, "button", 41);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "div")(7, "h3");
    \u0275\u0275text(8, "Ordenar por");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "div", 47);
    \u0275\u0275template(10, GuestViewComponent_div_54_button_10_Template, 2, 3, "button", 41);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance(5);
    \u0275\u0275property("ngForOf", ctx_r2.categoriesWithCount);
    \u0275\u0275advance(5);
    \u0275\u0275property("ngForOf", ctx_r2.sortOptions);
  }
}
function GuestViewComponent_button_56_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 48);
    \u0275\u0275listener("click", function GuestViewComponent_button_56_Template_button_click_0_listener() {
      const cat_r7 = \u0275\u0275restoreView(_r6).$implicit;
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.selectedCategory = cat_r7.id);
    });
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const cat_r7 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275classProp("active", ctx_r2.selectedCategory === cat_r7.id);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(cat_r7.label);
  }
}
function GuestViewComponent_div_59_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 49)(1, "p");
    \u0275\u0275text(2, "Carregando presentes...");
    \u0275\u0275elementEnd()();
  }
}
function GuestViewComponent_div_60_Template(rf, ctx) {
  if (rf & 1) {
    const _r8 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 49)(1, "p");
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "button", 48);
    \u0275\u0275listener("click", function GuestViewComponent_div_60_Template_button_click_3_listener() {
      \u0275\u0275restoreView(_r8);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.loadGifts());
    });
    \u0275\u0275text(4, "Tentar novamente");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r2.error);
  }
}
function GuestViewComponent_div_61_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 49);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(1, "svg", 50);
    \u0275\u0275element(2, "circle", 24)(3, "line", 25);
    \u0275\u0275elementEnd();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(4, "h3");
    \u0275\u0275text(5, "Nenhum presente encontrado");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "p");
    \u0275\u0275text(7, "Tente ajustar os filtros ou buscar por outro termo");
    \u0275\u0275elementEnd()();
  }
}
function GuestViewComponent_div_62_div_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r9 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 54);
    \u0275\u0275listener("click", function GuestViewComponent_div_62_div_4_Template_div_click_0_listener() {
      const gift_r10 = \u0275\u0275restoreView(_r9).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.selectedGift = gift_r10);
    });
    \u0275\u0275element(1, "app-gift-card", 55);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const gift_r10 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275property("image", gift_r10.image)("name", gift_r10.name)("price", gift_r10.price)("raised", gift_r10.raised)("total", gift_r10.total);
  }
}
function GuestViewComponent_div_62_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div")(1, "p", 51);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 52);
    \u0275\u0275template(4, GuestViewComponent_div_62_div_4_Template, 2, 5, "div", 53);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate2("Mostrando ", ctx_r2.filteredGifts.length, " de ", ctx_r2.allGifts.length, " presentes");
    \u0275\u0275advance(2);
    \u0275\u0275property("ngForOf", ctx_r2.filteredGifts);
  }
}
function GuestViewComponent_app_gift_details_modal_63_Template(rf, ctx) {
  if (rf & 1) {
    const _r11 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "app-gift-details-modal", 56);
    \u0275\u0275listener("close", function GuestViewComponent_app_gift_details_modal_63_Template_app_gift_details_modal_close_0_listener() {
      \u0275\u0275restoreView(_r11);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.selectedGift = null);
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275property("gift", ctx_r2.selectedGift)("coupleName", ctx_r2.couple.names);
  }
}
var GuestViewComponent = class _GuestViewComponent {
  constructor(giftService, coupleService) {
    this.giftService = giftService;
    this.coupleService = coupleService;
    this.searchTerm = "";
    this.selectedCategory = "todos";
    this.showFilters = false;
    this.sortBy = "name";
    this.selectedGift = null;
    this.allGifts = [];
    this.loading = false;
    this.error = "";
    this.couple = {
      names: "",
      weddingDate: "",
      photo: "",
      message: ""
    };
    this.quickCategories = [
      { id: "todos", label: "Todos" },
      { id: "cozinha", label: "Cozinha" },
      { id: "eletro", label: "Eletros" },
      { id: "quarto", label: "Quarto" },
      { id: "banho", label: "Banho" }
    ];
    this.sortOptions = [
      { id: "name", label: "Nome (A-Z)" },
      { id: "price-asc", label: "Menor pre\xE7o" },
      { id: "price-desc", label: "Maior pre\xE7o" }
    ];
  }
  ngOnInit() {
    this.loadCouple();
    this.loadGifts();
  }
  loadCouple() {
    this.coupleService.getCouple().subscribe({
      next: (couple) => this.couple = couple,
      error: () => {
      }
    });
  }
  loadGifts() {
    this.loading = true;
    this.error = "";
    this.giftService.getGifts().subscribe({
      next: (gifts) => {
        this.allGifts = gifts;
        this.loading = false;
      },
      error: () => {
        this.error = "N\xE3o foi poss\xEDvel carregar os presentes.";
        this.loading = false;
      }
    });
  }
  get categoriesWithCount() {
    return [
      { id: "todos", label: "Todos", count: this.allGifts.length },
      { id: "cozinha", label: "Cozinha", count: this.allGifts.filter((g) => g.category === "cozinha").length },
      { id: "eletro", label: "Eletrodom\xE9sticos", count: this.allGifts.filter((g) => g.category === "eletro").length },
      { id: "quarto", label: "Quarto", count: this.allGifts.filter((g) => g.category === "quarto").length },
      { id: "banho", label: "Banho", count: this.allGifts.filter((g) => g.category === "banho").length }
    ];
  }
  get filteredGifts() {
    return this.allGifts.filter((g) => {
      const matchCat = this.selectedCategory === "todos" || g.category === this.selectedCategory;
      const matchSearch = !this.searchTerm || g.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchCat && matchSearch;
    }).sort((a, b) => {
      if (this.sortBy === "price-asc")
        return a.price - b.price;
      if (this.sortBy === "price-desc")
        return b.price - a.price;
      return a.name.localeCompare(b.name);
    });
  }
  get totalGifts() {
    return this.allGifts.length;
  }
  get completedGifts() {
    return this.allGifts.filter((g) => g.raised >= g.total).length;
  }
  get totalRaised() {
    return this.allGifts.reduce((s, g) => s + g.raised, 0);
  }
  get totalGoal() {
    return this.allGifts.reduce((s, g) => s + g.total, 0);
  }
  get progressPercentage() {
    return this.totalGoal > 0 ? this.totalRaised / this.totalGoal * 100 : 0;
  }
  static {
    this.\u0275fac = function GuestViewComponent_Factory(t) {
      return new (t || _GuestViewComponent)(\u0275\u0275directiveInject(GiftService), \u0275\u0275directiveInject(CoupleService));
    };
  }
  static {
    this.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _GuestViewComponent, selectors: [["app-guest-view"]], standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 64, vars: 18, consts: [[1, "gv-root"], [1, "gv-header"], [1, "container", "header-inner"], [2, "width", "5rem"], [1, "brand"], ["xmlns", "http://www.w3.org/2000/svg", "width", "24", "height", "24", "viewBox", "0 0 24 24", "fill", "currentColor", 1, "brand-icon"], ["d", "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"], [1, "brand-name"], [1, "couple-section"], [1, "container", "couple-inner"], [1, "couple-photo"], [3, "src", "alt"], [1, "couple-info"], [1, "wedding-date"], [1, "couple-message"], [1, "stats"], [1, "stat"], [1, "stat-value"], [1, "stat-label"], [1, "filters-section"], [1, "container"], [1, "search-row"], [1, "search-wrap"], ["xmlns", "http://www.w3.org/2000/svg", "width", "20", "height", "20", "viewBox", "0 0 24 24", "fill", "none", "stroke", "currentColor", "stroke-width", "2", 1, "search-icon"], ["cx", "11", "cy", "11", "r", "8"], ["x1", "21", "y1", "21", "x2", "16.65", "y2", "16.65"], ["type", "text", "placeholder", "Buscar presente...", "name", "search", 1, "search-input", 3, "ngModelChange", "ngModel"], [1, "filter-toggle", 3, "click"], ["xmlns", "http://www.w3.org/2000/svg", "width", "20", "height", "20", "viewBox", "0 0 24 24", "fill", "none", "stroke", "currentColor", "stroke-width", "2"], ["x1", "4", "y1", "21", "x2", "4", "y2", "14"], ["x1", "4", "y1", "10", "x2", "4", "y2", "3"], ["x1", "12", "y1", "21", "x2", "12", "y2", "12"], ["x1", "12", "y1", "8", "x2", "12", "y2", "3"], ["x1", "20", "y1", "21", "x2", "20", "y2", "16"], ["x1", "20", "y1", "12", "x2", "20", "y2", "3"], ["x1", "1", "y1", "14", "x2", "7", "y2", "14"], ["x1", "9", "y1", "8", "x2", "15", "y2", "8"], ["x1", "17", "y1", "16", "x2", "23", "y2", "16"], [1, "filter-label"], ["class", "filter-panel", 4, "ngIf"], [1, "quick-filters"], ["class", "chip", 3, "active", "click", 4, "ngFor", "ngForOf"], [1, "gifts-section"], ["class", "empty-state", 4, "ngIf"], [4, "ngIf"], [3, "gift", "coupleName", "close", 4, "ngIf"], [1, "filter-panel"], [1, "filter-chips"], [1, "chip", 3, "click"], [1, "empty-state"], ["xmlns", "http://www.w3.org/2000/svg", "width", "64", "height", "64", "viewBox", "0 0 24 24", "fill", "none", "stroke", "currentColor", "stroke-width", "1.5"], [1, "results-count"], [1, "gifts-grid"], ["style", "cursor:pointer", 3, "click", 4, "ngFor", "ngForOf"], [2, "cursor", "pointer", 3, "click"], [3, "image", "name", "price", "raised", "total"], [3, "close", "gift", "coupleName"]], template: function GuestViewComponent_Template(rf, ctx) {
      if (rf & 1) {
        \u0275\u0275elementStart(0, "div", 0)(1, "header", 1)(2, "div", 2);
        \u0275\u0275element(3, "div", 3);
        \u0275\u0275elementStart(4, "div", 4);
        \u0275\u0275namespaceSVG();
        \u0275\u0275elementStart(5, "svg", 5);
        \u0275\u0275element(6, "path", 6);
        \u0275\u0275elementEnd();
        \u0275\u0275namespaceHTML();
        \u0275\u0275elementStart(7, "span", 7);
        \u0275\u0275text(8, "ListaPerfeita");
        \u0275\u0275elementEnd()();
        \u0275\u0275element(9, "div", 3);
        \u0275\u0275elementEnd()();
        \u0275\u0275elementStart(10, "section", 8)(11, "div", 9)(12, "div", 10);
        \u0275\u0275element(13, "img", 11);
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(14, "div", 12)(15, "div")(16, "h1");
        \u0275\u0275text(17);
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(18, "p", 13);
        \u0275\u0275text(19);
        \u0275\u0275elementEnd()();
        \u0275\u0275elementStart(20, "p", 14);
        \u0275\u0275text(21);
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(22, "div", 15)(23, "div", 16)(24, "div", 17);
        \u0275\u0275text(25);
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(26, "div", 18);
        \u0275\u0275text(27, "Presentes completos");
        \u0275\u0275elementEnd()();
        \u0275\u0275elementStart(28, "div", 16)(29, "div", 17);
        \u0275\u0275text(30);
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(31, "div", 18);
        \u0275\u0275text(32, "Do objetivo alcan\xE7ado");
        \u0275\u0275elementEnd()()()()()();
        \u0275\u0275elementStart(33, "section", 19)(34, "div", 20)(35, "div", 21)(36, "div", 22);
        \u0275\u0275namespaceSVG();
        \u0275\u0275elementStart(37, "svg", 23);
        \u0275\u0275element(38, "circle", 24)(39, "line", 25);
        \u0275\u0275elementEnd();
        \u0275\u0275namespaceHTML();
        \u0275\u0275elementStart(40, "input", 26);
        \u0275\u0275twoWayListener("ngModelChange", function GuestViewComponent_Template_input_ngModelChange_40_listener($event) {
          \u0275\u0275twoWayBindingSet(ctx.searchTerm, $event) || (ctx.searchTerm = $event);
          return $event;
        });
        \u0275\u0275elementEnd()();
        \u0275\u0275elementStart(41, "button", 27);
        \u0275\u0275listener("click", function GuestViewComponent_Template_button_click_41_listener() {
          return ctx.showFilters = !ctx.showFilters;
        });
        \u0275\u0275namespaceSVG();
        \u0275\u0275elementStart(42, "svg", 28);
        \u0275\u0275element(43, "line", 29)(44, "line", 30)(45, "line", 31)(46, "line", 32)(47, "line", 33)(48, "line", 34)(49, "line", 35)(50, "line", 36)(51, "line", 37);
        \u0275\u0275elementEnd();
        \u0275\u0275namespaceHTML();
        \u0275\u0275elementStart(52, "span", 38);
        \u0275\u0275text(53, "Filtros");
        \u0275\u0275elementEnd()()();
        \u0275\u0275template(54, GuestViewComponent_div_54_Template, 11, 2, "div", 39);
        \u0275\u0275elementStart(55, "div", 40);
        \u0275\u0275template(56, GuestViewComponent_button_56_Template, 2, 3, "button", 41);
        \u0275\u0275elementEnd()()();
        \u0275\u0275elementStart(57, "section", 42)(58, "div", 20);
        \u0275\u0275template(59, GuestViewComponent_div_59_Template, 3, 0, "div", 43)(60, GuestViewComponent_div_60_Template, 5, 1, "div", 43)(61, GuestViewComponent_div_61_Template, 8, 0, "div", 43)(62, GuestViewComponent_div_62_Template, 5, 3, "div", 44);
        \u0275\u0275elementEnd()();
        \u0275\u0275template(63, GuestViewComponent_app_gift_details_modal_63_Template, 1, 2, "app-gift-details-modal", 45);
        \u0275\u0275elementEnd();
      }
      if (rf & 2) {
        \u0275\u0275advance(13);
        \u0275\u0275property("src", ctx.couple.photo, \u0275\u0275sanitizeUrl)("alt", ctx.couple.names);
        \u0275\u0275advance(4);
        \u0275\u0275textInterpolate(ctx.couple.names);
        \u0275\u0275advance(2);
        \u0275\u0275textInterpolate(ctx.couple.weddingDate);
        \u0275\u0275advance(2);
        \u0275\u0275textInterpolate1('"', ctx.couple.message, '"');
        \u0275\u0275advance(4);
        \u0275\u0275textInterpolate2("", ctx.completedGifts, "/", ctx.totalGifts, "");
        \u0275\u0275advance(5);
        \u0275\u0275textInterpolate1("", ctx.progressPercentage.toFixed(0), "%");
        \u0275\u0275advance(10);
        \u0275\u0275twoWayProperty("ngModel", ctx.searchTerm);
        \u0275\u0275advance();
        \u0275\u0275classProp("active", ctx.showFilters);
        \u0275\u0275advance(13);
        \u0275\u0275property("ngIf", ctx.showFilters);
        \u0275\u0275advance(2);
        \u0275\u0275property("ngForOf", ctx.quickCategories);
        \u0275\u0275advance(3);
        \u0275\u0275property("ngIf", ctx.loading);
        \u0275\u0275advance();
        \u0275\u0275property("ngIf", ctx.error);
        \u0275\u0275advance();
        \u0275\u0275property("ngIf", !ctx.loading && !ctx.error && ctx.filteredGifts.length === 0);
        \u0275\u0275advance();
        \u0275\u0275property("ngIf", !ctx.loading && !ctx.error && ctx.filteredGifts.length > 0);
        \u0275\u0275advance();
        \u0275\u0275property("ngIf", ctx.selectedGift);
      }
    }, dependencies: [CommonModule, NgForOf, NgIf, FormsModule, DefaultValueAccessor, NgControlStatus, NgModel, GiftCardComponent, GiftDetailsModalComponent], styles: ["\n\n.gv-root[_ngcontent-%COMP%] {\n  min-height: 100vh;\n  background-color: var(--background);\n}\n.gv-header[_ngcontent-%COMP%] {\n  position: sticky;\n  top: 0;\n  z-index: 40;\n  background: rgba(255, 255, 255, 0.95);\n  -webkit-backdrop-filter: blur(8px);\n  backdrop-filter: blur(8px);\n  border-bottom: 1px solid var(--border);\n}\n.header-inner[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding-top: 1rem;\n  padding-bottom: 1rem;\n}\n.back-btn[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  color: var(--muted-foreground);\n  background: none;\n  border: none;\n  cursor: pointer;\n  transition: color 0.2s;\n  font-family: var(--font-sans);\n}\n.back-btn[_ngcontent-%COMP%]:hover {\n  color: var(--primary);\n}\n.back-label[_ngcontent-%COMP%] {\n  display: none;\n}\n@media (min-width: 640px) {\n  .back-label[_ngcontent-%COMP%] {\n    display: inline;\n  }\n}\n.brand[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n.brand-icon[_ngcontent-%COMP%] {\n  color: var(--primary);\n}\n.brand-name[_ngcontent-%COMP%] {\n  font-family: var(--font-serif);\n  font-size: 1.25rem;\n  color: var(--foreground);\n}\n.couple-section[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      135deg,\n      var(--secondary) 0%,\n      var(--background) 100%);\n  padding: 3rem 0;\n}\n@media (min-width: 640px) {\n  .couple-section[_ngcontent-%COMP%] {\n    padding: 4rem 0;\n  }\n}\n.couple-inner[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 2rem;\n  text-align: center;\n}\n@media (min-width: 768px) {\n  .couple-inner[_ngcontent-%COMP%] {\n    flex-direction: row;\n    text-align: left;\n  }\n}\n.couple-photo[_ngcontent-%COMP%] {\n  width: 8rem;\n  height: 8rem;\n  border-radius: 9999px;\n  overflow: hidden;\n  border: 4px solid rgba(199, 154, 109, 0.2);\n  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);\n  flex-shrink: 0;\n}\n@media (min-width: 640px) {\n  .couple-photo[_ngcontent-%COMP%] {\n    width: 10rem;\n    height: 10rem;\n  }\n}\n.couple-photo[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}\n.couple-info[_ngcontent-%COMP%] {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n}\nh1[_ngcontent-%COMP%] {\n  font-family: var(--font-serif);\n  font-size: clamp(1.75rem, 4vw, 2.25rem);\n  color: var(--foreground);\n  margin-bottom: 0.5rem;\n}\n.wedding-date[_ngcontent-%COMP%] {\n  font-size: 1.125rem;\n  color: var(--muted-foreground);\n  margin: 0;\n}\n.couple-message[_ngcontent-%COMP%] {\n  color: var(--foreground);\n  line-height: 1.625;\n  font-style: italic;\n  max-width: 42rem;\n  margin: 0;\n}\n.stats[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1.5rem;\n  justify-content: center;\n  padding-top: 1rem;\n}\n@media (min-width: 768px) {\n  .stats[_ngcontent-%COMP%] {\n    justify-content: flex-start;\n  }\n}\n.stat-value[_ngcontent-%COMP%] {\n  font-size: 1.5rem;\n  color: var(--primary);\n  font-weight: 500;\n}\n.stat-label[_ngcontent-%COMP%] {\n  font-size: 0.875rem;\n  color: var(--muted-foreground);\n}\n.filters-section[_ngcontent-%COMP%] {\n  border-bottom: 1px solid var(--border);\n  background: var(--background);\n  position: sticky;\n  top: 73px;\n  z-index: 30;\n  padding: 1.5rem 0;\n}\n.search-row[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.75rem;\n  margin-bottom: 1.5rem;\n}\n.search-wrap[_ngcontent-%COMP%] {\n  flex: 1;\n  position: relative;\n}\n.search-icon[_ngcontent-%COMP%] {\n  position: absolute;\n  left: 1rem;\n  top: 50%;\n  transform: translateY(-50%);\n  color: var(--muted-foreground);\n}\n.search-input[_ngcontent-%COMP%] {\n  width: 100%;\n  padding: 0.75rem 1rem 0.75rem 3rem;\n  border-radius: var(--radius);\n  border: 1px solid var(--border);\n  background: var(--background);\n  font-size: 1rem;\n  font-family: var(--font-sans);\n  color: var(--foreground);\n  outline: none;\n  box-sizing: border-box;\n}\n.search-input[_ngcontent-%COMP%]:focus {\n  box-shadow: 0 0 0 2px var(--ring);\n}\n.search-input[_ngcontent-%COMP%]::placeholder {\n  color: var(--muted-foreground);\n}\n.filter-toggle[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  padding: 0.75rem 1rem;\n  border-radius: var(--radius);\n  border: 1px solid var(--border);\n  background: var(--background);\n  color: var(--foreground);\n  cursor: pointer;\n  font-family: var(--font-sans);\n  transition: all 0.2s;\n}\n.filter-toggle.active[_ngcontent-%COMP%] {\n  background: var(--primary);\n  color: var(--primary-foreground);\n  border-color: var(--primary);\n}\n.filter-label[_ngcontent-%COMP%] {\n  display: none;\n}\n@media (min-width: 640px) {\n  .filter-label[_ngcontent-%COMP%] {\n    display: inline;\n  }\n}\n.filter-panel[_ngcontent-%COMP%] {\n  background: var(--secondary);\n  border-radius: var(--radius);\n  padding: 1.5rem;\n  margin-bottom: 1.5rem;\n  display: flex;\n  flex-direction: column;\n  gap: 1.5rem;\n}\n.filter-panel[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  font-family: var(--font-sans);\n  font-weight: 500;\n  font-size: 1rem;\n  color: var(--foreground);\n  margin: 0 0 0.75rem;\n}\n.filter-chips[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n}\n.quick-filters[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n}\n.chip[_ngcontent-%COMP%] {\n  padding: 0.5rem 1rem;\n  border-radius: 9999px;\n  border: none;\n  background: var(--background);\n  color: var(--foreground);\n  font-size: 0.875rem;\n  font-family: var(--font-sans);\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.chip[_ngcontent-%COMP%]:hover {\n  background: rgba(199, 154, 109, 0.1);\n}\n.chip.active[_ngcontent-%COMP%] {\n  background: var(--primary);\n  color: var(--primary-foreground);\n}\n.gifts-section[_ngcontent-%COMP%] {\n  padding: 3rem 0;\n}\n.results-count[_ngcontent-%COMP%] {\n  color: var(--muted-foreground);\n  font-size: 0.95rem;\n  margin-bottom: 1.5rem;\n}\n.gifts-grid[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 1.5rem;\n}\n@media (min-width: 640px) {\n  .gifts-grid[_ngcontent-%COMP%] {\n    grid-template-columns: repeat(2, 1fr);\n  }\n}\n@media (min-width: 1024px) {\n  .gifts-grid[_ngcontent-%COMP%] {\n    grid-template-columns: repeat(3, 1fr);\n  }\n}\n.empty-state[_ngcontent-%COMP%] {\n  text-align: center;\n  padding: 4rem 0;\n  color: var(--muted-foreground);\n}\n.empty-state[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] {\n  opacity: 0.5;\n  margin-bottom: 1rem;\n}\n.empty-state[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  font-size: 1.25rem;\n  color: var(--foreground);\n  margin-bottom: 0.5rem;\n  font-family: var(--font-sans);\n  font-weight: 500;\n}\n.empty-state[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 0;\n}\n/*# sourceMappingURL=guest-view.component.css.map */"] });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(GuestViewComponent, { className: "GuestViewComponent", filePath: "src/app/components/guest-view/guest-view.component.ts", lineNumber: 19 });
})();
export {
  GuestViewComponent
};
//# sourceMappingURL=chunk-B34QSGL6.js.map
