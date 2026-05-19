import {
  CoupleService,
  GiftService
} from "./chunk-G5YCMPEC.js";
import {
  AuthService,
  Router
} from "./chunk-ODX6UUGO.js";
import {
  DefaultValueAccessor,
  FormsModule,
  NgControlStatus,
  NgModel,
  NgSelectOption,
  NumberValueAccessor,
  SelectControlValueAccessor,
  ɵNgSelectMultipleOption
} from "./chunk-CPH2HAIJ.js";
import {
  CommonModule,
  NgForOf,
  NgIf,
  __spreadValues,
  ɵsetClassDebugInfo,
  ɵɵStandaloneFeature,
  ɵɵadvance,
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
  ɵɵproperty,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵsanitizeUrl,
  ɵɵstyleProp,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtwoWayBindingSet,
  ɵɵtwoWayListener,
  ɵɵtwoWayProperty
} from "./chunk-LLMRBLT2.js";

// src/app/components/admin/admin-dashboard/admin-dashboard.component.ts
function AdminDashboardComponent_section_15_div_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 17);
    \u0275\u0275text(1, "Carregando...");
    \u0275\u0275elementEnd();
  }
}
function AdminDashboardComponent_section_15_div_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 18);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r1.giftsError);
  }
}
function AdminDashboardComponent_section_15_div_8_option_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 32);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const c_r4 = ctx.$implicit;
    \u0275\u0275property("value", c_r4.id);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(c_r4.label);
  }
}
function AdminDashboardComponent_section_15_div_8_div_25_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 18);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r1.giftError);
  }
}
function AdminDashboardComponent_section_15_div_8_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 19)(1, "h3");
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 20)(4, "div", 21)(5, "label");
    \u0275\u0275text(6, "Nome");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "input", 22);
    \u0275\u0275twoWayListener("ngModelChange", function AdminDashboardComponent_section_15_div_8_Template_input_ngModelChange_7_listener($event) {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.giftForm.name, $event) || (ctx_r1.giftForm.name = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "div", 21)(9, "label");
    \u0275\u0275text(10, "Categoria");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "select", 23);
    \u0275\u0275twoWayListener("ngModelChange", function AdminDashboardComponent_section_15_div_8_Template_select_ngModelChange_11_listener($event) {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.giftForm.category, $event) || (ctx_r1.giftForm.category = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275template(12, AdminDashboardComponent_section_15_div_8_option_12_Template, 2, 2, "option", 24);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(13, "div", 21)(14, "label");
    \u0275\u0275text(15, "Pre\xE7o total (R$)");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "input", 25);
    \u0275\u0275twoWayListener("ngModelChange", function AdminDashboardComponent_section_15_div_8_Template_input_ngModelChange_16_listener($event) {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.giftForm.total, $event) || (ctx_r1.giftForm.total = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(17, "div", 21)(18, "label");
    \u0275\u0275text(19, "URL da imagem");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(20, "input", 26);
    \u0275\u0275twoWayListener("ngModelChange", function AdminDashboardComponent_section_15_div_8_Template_input_ngModelChange_20_listener($event) {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.giftForm.image, $event) || (ctx_r1.giftForm.image = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(21, "div", 27)(22, "label");
    \u0275\u0275text(23, "Descri\xE7\xE3o (opcional)");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(24, "textarea", 28);
    \u0275\u0275twoWayListener("ngModelChange", function AdminDashboardComponent_section_15_div_8_Template_textarea_ngModelChange_24_listener($event) {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.giftForm.description, $event) || (ctx_r1.giftForm.description = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()()();
    \u0275\u0275template(25, AdminDashboardComponent_section_15_div_8_div_25_Template, 2, 1, "div", 14);
    \u0275\u0275elementStart(26, "div", 29)(27, "button", 30);
    \u0275\u0275listener("click", function AdminDashboardComponent_section_15_div_8_Template_button_click_27_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.cancelGiftForm());
    });
    \u0275\u0275text(28, "Cancelar");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(29, "button", 31);
    \u0275\u0275listener("click", function AdminDashboardComponent_section_15_div_8_Template_button_click_29_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.saveGift());
    });
    \u0275\u0275text(30);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r1.editingGift ? "Editar presente" : "Novo presente");
    \u0275\u0275advance(5);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.giftForm.name);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.giftForm.category);
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", ctx_r1.categories);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.giftForm.total);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.giftForm.image);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.giftForm.description);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.giftError);
    \u0275\u0275advance(4);
    \u0275\u0275property("disabled", ctx_r1.giftSaving);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r1.giftSaving ? "Salvando..." : "Salvar", " ");
  }
}
function AdminDashboardComponent_section_15_div_9_tr_17_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "tr")(1, "td")(2, "div", 36);
    \u0275\u0275element(3, "img", 37);
    \u0275\u0275elementStart(4, "span");
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(6, "td");
    \u0275\u0275text(7);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "td");
    \u0275\u0275text(9);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "td");
    \u0275\u0275text(11);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "td")(13, "div", 38);
    \u0275\u0275element(14, "div", 39);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "span", 40);
    \u0275\u0275text(16);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(17, "td")(18, "div", 41)(19, "button", 42);
    \u0275\u0275listener("click", function AdminDashboardComponent_section_15_div_9_tr_17_Template_button_click_19_listener() {
      const gift_r6 = \u0275\u0275restoreView(_r5).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.openEditGift(gift_r6));
    });
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(20, "svg", 43);
    \u0275\u0275element(21, "path", 44)(22, "path", 45);
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(23, "button", 46);
    \u0275\u0275listener("click", function AdminDashboardComponent_section_15_div_9_tr_17_Template_button_click_23_listener() {
      const gift_r6 = \u0275\u0275restoreView(_r5).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.deleteGift(gift_r6.id));
    });
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(24, "svg", 43);
    \u0275\u0275element(25, "polyline", 47)(26, "path", 48)(27, "path", 49)(28, "path", 50)(29, "path", 51);
    \u0275\u0275elementEnd()()()()();
  }
  if (rf & 2) {
    const gift_r6 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(3);
    \u0275\u0275property("src", gift_r6.image, \u0275\u0275sanitizeUrl)("alt", gift_r6.name);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(gift_r6.name);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(gift_r6.category);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("R$ ", gift_r6.total.toFixed(2), "");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("R$ ", gift_r6.raised.toFixed(2), "");
    \u0275\u0275advance(3);
    \u0275\u0275styleProp("width", ctx_r1.getProgressPercent(gift_r6), "%");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("", ctx_r1.getProgressPercent(gift_r6).toFixed(0), "%");
  }
}
function AdminDashboardComponent_section_15_div_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 33)(1, "table", 34)(2, "thead")(3, "tr")(4, "th");
    \u0275\u0275text(5, "Presente");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "th");
    \u0275\u0275text(7, "Categoria");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "th");
    \u0275\u0275text(9, "Total");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "th");
    \u0275\u0275text(11, "Arrecadado");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "th");
    \u0275\u0275text(13, "Progresso");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "th");
    \u0275\u0275text(15, "A\xE7\xF5es");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(16, "tbody");
    \u0275\u0275template(17, AdminDashboardComponent_section_15_div_9_tr_17_Template, 30, 9, "tr", 35);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(17);
    \u0275\u0275property("ngForOf", ctx_r1.gifts);
  }
}
function AdminDashboardComponent_section_15_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "section", 10)(1, "div", 11)(2, "h2");
    \u0275\u0275text(3, "Presentes");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "button", 12);
    \u0275\u0275listener("click", function AdminDashboardComponent_section_15_Template_button_click_4_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.openNewGift());
    });
    \u0275\u0275text(5, "+ Adicionar presente");
    \u0275\u0275elementEnd()();
    \u0275\u0275template(6, AdminDashboardComponent_section_15_div_6_Template, 2, 0, "div", 13)(7, AdminDashboardComponent_section_15_div_7_Template, 2, 1, "div", 14)(8, AdminDashboardComponent_section_15_div_8_Template, 31, 10, "div", 15)(9, AdminDashboardComponent_section_15_div_9_Template, 18, 1, "div", 16);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(6);
    \u0275\u0275property("ngIf", ctx_r1.giftsLoading);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.giftsError);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.showGiftForm);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !ctx_r1.giftsLoading && ctx_r1.gifts.length > 0);
  }
}
function AdminDashboardComponent_section_16_div_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 17);
    \u0275\u0275text(1, "Carregando...");
    \u0275\u0275elementEnd();
  }
}
function AdminDashboardComponent_section_16_div_5_div_18_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 57);
    \u0275\u0275text(1, "Informa\xE7\xF5es salvas com sucesso!");
    \u0275\u0275elementEnd();
  }
}
function AdminDashboardComponent_section_16_div_5_div_19_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 18);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r1.coupleError);
  }
}
function AdminDashboardComponent_section_16_div_5_Template(rf, ctx) {
  if (rf & 1) {
    const _r7 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 19)(1, "div", 20)(2, "div", 21)(3, "label");
    \u0275\u0275text(4, "Nomes do casal");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "input", 52);
    \u0275\u0275twoWayListener("ngModelChange", function AdminDashboardComponent_section_16_div_5_Template_input_ngModelChange_5_listener($event) {
      \u0275\u0275restoreView(_r7);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.couple.names, $event) || (ctx_r1.couple.names = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "div", 21)(7, "label");
    \u0275\u0275text(8, "Data do casamento");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "input", 53);
    \u0275\u0275twoWayListener("ngModelChange", function AdminDashboardComponent_section_16_div_5_Template_input_ngModelChange_9_listener($event) {
      \u0275\u0275restoreView(_r7);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.couple.weddingDate, $event) || (ctx_r1.couple.weddingDate = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(10, "div", 27)(11, "label");
    \u0275\u0275text(12, "URL da foto");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "input", 54);
    \u0275\u0275twoWayListener("ngModelChange", function AdminDashboardComponent_section_16_div_5_Template_input_ngModelChange_13_listener($event) {
      \u0275\u0275restoreView(_r7);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.couple.photo, $event) || (ctx_r1.couple.photo = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(14, "div", 27)(15, "label");
    \u0275\u0275text(16, "Mensagem para os convidados");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(17, "textarea", 55);
    \u0275\u0275twoWayListener("ngModelChange", function AdminDashboardComponent_section_16_div_5_Template_textarea_ngModelChange_17_listener($event) {
      \u0275\u0275restoreView(_r7);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.couple.message, $event) || (ctx_r1.couple.message = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()()();
    \u0275\u0275template(18, AdminDashboardComponent_section_16_div_5_div_18_Template, 2, 0, "div", 56)(19, AdminDashboardComponent_section_16_div_5_div_19_Template, 2, 1, "div", 14);
    \u0275\u0275elementStart(20, "div", 29)(21, "button", 31);
    \u0275\u0275listener("click", function AdminDashboardComponent_section_16_div_5_Template_button_click_21_listener() {
      \u0275\u0275restoreView(_r7);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.saveCouple());
    });
    \u0275\u0275text(22);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(5);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.couple.names);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.couple.weddingDate);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.couple.photo);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.couple.message);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.coupleSuccess);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.coupleError);
    \u0275\u0275advance(2);
    \u0275\u0275property("disabled", ctx_r1.coupleSaving);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r1.coupleSaving ? "Salvando..." : "Salvar altera\xE7\xF5es", " ");
  }
}
function AdminDashboardComponent_section_16_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "section", 10)(1, "div", 11)(2, "h2");
    \u0275\u0275text(3, "Informa\xE7\xF5es do Casal");
    \u0275\u0275elementEnd()();
    \u0275\u0275template(4, AdminDashboardComponent_section_16_div_4_Template, 2, 0, "div", 13)(5, AdminDashboardComponent_section_16_div_5_Template, 23, 8, "div", 15);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(4);
    \u0275\u0275property("ngIf", ctx_r1.coupleLoading);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !ctx_r1.coupleLoading);
  }
}
var AdminDashboardComponent = class _AdminDashboardComponent {
  constructor(giftService, coupleService, auth, router) {
    this.giftService = giftService;
    this.coupleService = coupleService;
    this.auth = auth;
    this.router = router;
    this.activeTab = "gifts";
    this.gifts = [];
    this.giftsLoading = false;
    this.giftsError = "";
    this.couple = { names: "", weddingDate: "", photo: "", message: "" };
    this.coupleLoading = false;
    this.coupleSaving = false;
    this.coupleSuccess = false;
    this.coupleError = "";
    this.showGiftForm = false;
    this.editingGift = null;
    this.giftForm = {};
    this.giftSaving = false;
    this.giftError = "";
    this.categories = [
      { id: "cozinha", label: "Cozinha" },
      { id: "eletro", label: "Eletrodom\xE9sticos" },
      { id: "quarto", label: "Quarto" },
      { id: "banho", label: "Banho" }
    ];
  }
  ngOnInit() {
    this.loadGifts();
    this.loadCouple();
  }
  loadGifts() {
    this.giftsLoading = true;
    this.giftsError = "";
    this.giftService.getAdminGifts().subscribe({
      next: (gifts) => {
        this.gifts = gifts;
        this.giftsLoading = false;
      },
      error: () => {
        this.giftsError = "Erro ao carregar presentes.";
        this.giftsLoading = false;
      }
    });
  }
  loadCouple() {
    this.coupleLoading = true;
    this.coupleService.getCouple().subscribe({
      next: (couple) => {
        this.couple = __spreadValues({}, couple);
        this.coupleLoading = false;
      },
      error: () => {
        this.coupleLoading = false;
      }
    });
  }
  openNewGift() {
    this.editingGift = null;
    this.giftForm = { category: "cozinha", raised: 0 };
    this.giftError = "";
    this.showGiftForm = true;
  }
  openEditGift(gift) {
    this.editingGift = gift;
    this.giftForm = __spreadValues({}, gift);
    this.giftError = "";
    this.showGiftForm = true;
  }
  cancelGiftForm() {
    this.showGiftForm = false;
    this.editingGift = null;
    this.giftForm = {};
  }
  saveGift() {
    this.giftSaving = true;
    this.giftError = "";
    const obs = this.editingGift ? this.giftService.updateGift(this.editingGift.id, this.giftForm) : this.giftService.createGift(this.giftForm);
    obs.subscribe({
      next: () => {
        this.giftSaving = false;
        this.showGiftForm = false;
        this.loadGifts();
      },
      error: () => {
        this.giftError = "Erro ao salvar presente.";
        this.giftSaving = false;
      }
    });
  }
  deleteGift(id) {
    if (!confirm("Tem certeza que deseja remover este presente?"))
      return;
    this.giftService.deleteGift(id).subscribe({
      next: () => this.loadGifts(),
      error: () => alert("Erro ao remover presente.")
    });
  }
  saveCouple() {
    this.coupleSaving = true;
    this.coupleSuccess = false;
    this.coupleError = "";
    this.coupleService.updateCouple(this.couple).subscribe({
      next: () => {
        this.coupleSuccess = true;
        this.coupleSaving = false;
      },
      error: () => {
        this.coupleError = "Erro ao salvar informa\xE7\xF5es do casal.";
        this.coupleSaving = false;
      }
    });
  }
  logout() {
    this.auth.logout();
  }
  getProgressPercent(gift) {
    return Math.min(gift.raised / gift.total * 100, 100);
  }
  static {
    this.\u0275fac = function AdminDashboardComponent_Factory(t) {
      return new (t || _AdminDashboardComponent)(\u0275\u0275directiveInject(GiftService), \u0275\u0275directiveInject(CoupleService), \u0275\u0275directiveInject(AuthService), \u0275\u0275directiveInject(Router));
    };
  }
  static {
    this.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _AdminDashboardComponent, selectors: [["app-admin-dashboard"]], standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 17, vars: 6, consts: [[1, "dash-root"], [1, "dash-header"], [1, "dash-brand"], ["xmlns", "http://www.w3.org/2000/svg", "width", "24", "height", "24", "viewBox", "0 0 24 24", "fill", "currentColor"], ["d", "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"], [1, "dash-nav"], [3, "click"], [1, "logout-btn", 3, "click"], [1, "dash-main"], ["class", "tab-section", 4, "ngIf"], [1, "tab-section"], [1, "section-header"], [1, "btn-primary", 3, "click"], ["class", "status-msg", 4, "ngIf"], ["class", "error-msg", 4, "ngIf"], ["class", "form-card", 4, "ngIf"], ["class", "table-wrap", 4, "ngIf"], [1, "status-msg"], [1, "error-msg"], [1, "form-card"], [1, "form-grid"], [1, "form-group"], ["type", "text", "name", "gname", "placeholder", "Nome do presente", 1, "text-input", 3, "ngModelChange", "ngModel"], ["name", "gcat", 1, "text-input", 3, "ngModelChange", "ngModel"], [3, "value", 4, "ngFor", "ngForOf"], ["type", "number", "name", "gtotal", "placeholder", "0.00", "step", "0.01", 1, "text-input", 3, "ngModelChange", "ngModel"], ["type", "url", "name", "gimg", "placeholder", "https://...", 1, "text-input", 3, "ngModelChange", "ngModel"], [1, "form-group", "full-width"], ["name", "gdesc", "rows", "2", 1, "text-input", 2, "resize", "none", 3, "ngModelChange", "ngModel"], [1, "form-actions"], [1, "btn-outline", 3, "click"], [1, "btn-primary", 3, "click", "disabled"], [3, "value"], [1, "table-wrap"], [1, "gifts-table"], [4, "ngFor", "ngForOf"], [1, "gift-cell"], [1, "gift-thumb", 3, "src", "alt"], [1, "progress-bar"], [1, "progress-fill"], [1, "progress-label"], [1, "action-btns"], ["title", "Editar", 1, "btn-icon", 3, "click"], ["xmlns", "http://www.w3.org/2000/svg", "width", "16", "height", "16", "viewBox", "0 0 24 24", "fill", "none", "stroke", "currentColor", "stroke-width", "2"], ["d", "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"], ["d", "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"], ["title", "Remover", 1, "btn-icon", "danger", 3, "click"], ["points", "3 6 5 6 21 6"], ["d", "M19 6l-1 14H6L5 6"], ["d", "M10 11v6"], ["d", "M14 11v6"], ["d", "M9 6V4h6v2"], ["type", "text", "name", "cnames", "placeholder", "Ex: Ana & Pedro", 1, "text-input", 3, "ngModelChange", "ngModel"], ["type", "text", "name", "cwdate", "placeholder", "Ex: 15 de Setembro, 2026", 1, "text-input", 3, "ngModelChange", "ngModel"], ["type", "url", "name", "cphoto", "placeholder", "https://...", 1, "text-input", 3, "ngModelChange", "ngModel"], ["name", "cmessage", "rows", "4", 1, "text-input", 2, "resize", "vertical", 3, "ngModelChange", "ngModel"], ["class", "success-msg", 4, "ngIf"], [1, "success-msg"]], template: function AdminDashboardComponent_Template(rf, ctx) {
      if (rf & 1) {
        \u0275\u0275elementStart(0, "div", 0)(1, "header", 1)(2, "div", 2);
        \u0275\u0275namespaceSVG();
        \u0275\u0275elementStart(3, "svg", 3);
        \u0275\u0275element(4, "path", 4);
        \u0275\u0275elementEnd();
        \u0275\u0275namespaceHTML();
        \u0275\u0275elementStart(5, "span");
        \u0275\u0275text(6, "Admin");
        \u0275\u0275elementEnd()();
        \u0275\u0275elementStart(7, "nav", 5)(8, "button", 6);
        \u0275\u0275listener("click", function AdminDashboardComponent_Template_button_click_8_listener() {
          return ctx.activeTab = "gifts";
        });
        \u0275\u0275text(9, "Presentes");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(10, "button", 6);
        \u0275\u0275listener("click", function AdminDashboardComponent_Template_button_click_10_listener() {
          return ctx.activeTab = "couple";
        });
        \u0275\u0275text(11, "Casal");
        \u0275\u0275elementEnd()();
        \u0275\u0275elementStart(12, "button", 7);
        \u0275\u0275listener("click", function AdminDashboardComponent_Template_button_click_12_listener() {
          return ctx.logout();
        });
        \u0275\u0275text(13, "Sair");
        \u0275\u0275elementEnd()();
        \u0275\u0275elementStart(14, "main", 8);
        \u0275\u0275template(15, AdminDashboardComponent_section_15_Template, 10, 4, "section", 9)(16, AdminDashboardComponent_section_16_Template, 6, 2, "section", 9);
        \u0275\u0275elementEnd()();
      }
      if (rf & 2) {
        \u0275\u0275advance(8);
        \u0275\u0275classProp("active", ctx.activeTab === "gifts");
        \u0275\u0275advance(2);
        \u0275\u0275classProp("active", ctx.activeTab === "couple");
        \u0275\u0275advance(5);
        \u0275\u0275property("ngIf", ctx.activeTab === "gifts");
        \u0275\u0275advance();
        \u0275\u0275property("ngIf", ctx.activeTab === "couple");
      }
    }, dependencies: [CommonModule, NgForOf, NgIf, FormsModule, NgSelectOption, \u0275NgSelectMultipleOption, DefaultValueAccessor, NumberValueAccessor, SelectControlValueAccessor, NgControlStatus, NgModel], styles: ["\n\n.dash-root[_ngcontent-%COMP%] {\n  min-height: 100vh;\n  background: #F7F0EA;\n  display: flex;\n  flex-direction: column;\n}\n.dash-header[_ngcontent-%COMP%] {\n  background: #2C1810;\n  color: #fff;\n  display: flex;\n  align-items: center;\n  gap: 2rem;\n  padding: 0 2rem;\n  height: 60px;\n}\n.dash-header[_ngcontent-%COMP%]   .dash-brand[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  font-weight: 700;\n  font-size: 1.1rem;\n  color: #C4956A;\n}\n.dash-header[_ngcontent-%COMP%]   .dash-brand[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] {\n  fill: #C4956A;\n}\n.dash-header[_ngcontent-%COMP%]   .dash-nav[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.25rem;\n  flex: 1;\n}\n.dash-header[_ngcontent-%COMP%]   .dash-nav[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n  background: none;\n  border: none;\n  color: #BDB5AF;\n  padding: 0.5rem 1rem;\n  border-radius: 0.5rem;\n  cursor: pointer;\n  font-size: 0.95rem;\n  transition: color 0.2s, background 0.2s;\n}\n.dash-header[_ngcontent-%COMP%]   .dash-nav[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover {\n  color: #fff;\n}\n.dash-header[_ngcontent-%COMP%]   .dash-nav[_ngcontent-%COMP%]   button.active[_ngcontent-%COMP%] {\n  color: #fff;\n  background: rgba(255, 255, 255, 0.1);\n}\n.dash-header[_ngcontent-%COMP%]   .logout-btn[_ngcontent-%COMP%] {\n  background: none;\n  border: 1.5px solid rgba(255, 255, 255, 0.3);\n  color: #BDB5AF;\n  padding: 0.4rem 0.9rem;\n  border-radius: 0.5rem;\n  cursor: pointer;\n  font-size: 0.875rem;\n  transition: color 0.2s, border-color 0.2s;\n}\n.dash-header[_ngcontent-%COMP%]   .logout-btn[_ngcontent-%COMP%]:hover {\n  color: #fff;\n  border-color: rgba(255, 255, 255, 0.6);\n}\n.dash-main[_ngcontent-%COMP%] {\n  flex: 1;\n  padding: 2rem;\n  max-width: 1200px;\n  width: 100%;\n  margin: 0 auto;\n}\n.tab-section[_ngcontent-%COMP%] {\n  width: 100%;\n}\n.section-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 1.5rem;\n}\n.section-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  font-size: 1.5rem;\n  font-weight: 700;\n  color: #2C1810;\n  margin: 0;\n}\n.form-card[_ngcontent-%COMP%] {\n  background: #fff;\n  border-radius: 1rem;\n  padding: 1.5rem;\n  margin-bottom: 1.5rem;\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);\n}\n.form-card[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin: 0 0 1.25rem;\n  font-size: 1.1rem;\n  color: #2C1810;\n}\n.form-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 1rem;\n}\n@media (max-width: 640px) {\n  .form-grid[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n}\n.form-group[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.4rem;\n}\n.form-group[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  font-size: 0.875rem;\n  font-weight: 500;\n  color: #4A3728;\n}\n.form-group.full-width[_ngcontent-%COMP%] {\n  grid-column: 1/-1;\n}\n.text-input[_ngcontent-%COMP%] {\n  padding: 0.65rem 0.9rem;\n  border: 1.5px solid #E8DDD5;\n  border-radius: 0.5rem;\n  font-size: 0.95rem;\n  outline: none;\n  transition: border 0.2s;\n  font-family: inherit;\n}\n.text-input[_ngcontent-%COMP%]:focus {\n  border-color: #C4956A;\n}\n.form-actions[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: flex-end;\n  gap: 0.75rem;\n  margin-top: 1.25rem;\n}\n.btn-primary[_ngcontent-%COMP%] {\n  background: #C4956A;\n  color: #fff;\n  border: none;\n  border-radius: 0.5rem;\n  padding: 0.6rem 1.25rem;\n  font-size: 0.95rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition: background 0.2s;\n}\n.btn-primary[_ngcontent-%COMP%]:hover:not(:disabled) {\n  background: #B8845A;\n}\n.btn-primary[_ngcontent-%COMP%]:disabled {\n  opacity: 0.6;\n  cursor: not-allowed;\n}\n.btn-outline[_ngcontent-%COMP%] {\n  background: none;\n  border: 1.5px solid #C4956A;\n  color: #C4956A;\n  border-radius: 0.5rem;\n  padding: 0.6rem 1.25rem;\n  font-size: 0.95rem;\n  cursor: pointer;\n  transition: background 0.2s;\n}\n.btn-outline[_ngcontent-%COMP%]:hover {\n  background: rgba(196, 149, 106, 0.08);\n}\n.btn-icon[_ngcontent-%COMP%] {\n  background: none;\n  border: 1px solid #E8DDD5;\n  border-radius: 0.4rem;\n  padding: 0.35rem 0.5rem;\n  cursor: pointer;\n  color: #8B7B6B;\n  transition: color 0.2s, border-color 0.2s;\n  line-height: 0;\n}\n.btn-icon[_ngcontent-%COMP%]:hover {\n  color: #C4956A;\n  border-color: #C4956A;\n}\n.btn-icon.danger[_ngcontent-%COMP%]:hover {\n  color: #dc2626;\n  border-color: #dc2626;\n}\n.action-btns[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.4rem;\n}\n.table-wrap[_ngcontent-%COMP%] {\n  background: #fff;\n  border-radius: 1rem;\n  overflow: auto;\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);\n}\n.gifts-table[_ngcontent-%COMP%] {\n  width: 100%;\n  border-collapse: collapse;\n  font-size: 0.9rem;\n}\n.gifts-table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%] {\n  background: #F7F0EA;\n  text-align: left;\n  padding: 0.75rem 1rem;\n  font-weight: 600;\n  color: #4A3728;\n  border-bottom: 1px solid #E8DDD5;\n}\n.gifts-table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] {\n  padding: 0.75rem 1rem;\n  border-bottom: 1px solid #F7F0EA;\n  color: #2C1810;\n  vertical-align: middle;\n}\n.gifts-table[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:last-child   td[_ngcontent-%COMP%] {\n  border-bottom: none;\n}\n.gift-cell[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.75rem;\n}\n.gift-thumb[_ngcontent-%COMP%] {\n  width: 40px;\n  height: 40px;\n  border-radius: 0.4rem;\n  object-fit: cover;\n  background: #F7F0EA;\n}\n.progress-bar[_ngcontent-%COMP%] {\n  height: 6px;\n  background: #E8DDD5;\n  border-radius: 3px;\n  overflow: hidden;\n  margin-bottom: 0.2rem;\n}\n.progress-bar[_ngcontent-%COMP%]   .progress-fill[_ngcontent-%COMP%] {\n  height: 100%;\n  background: #C4956A;\n  border-radius: 3px;\n  transition: width 0.4s;\n}\n.progress-label[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: #8B7B6B;\n}\n.status-msg[_ngcontent-%COMP%] {\n  color: #8B7B6B;\n  padding: 1rem 0;\n}\n.error-msg[_ngcontent-%COMP%] {\n  background: #fef2f2;\n  color: #dc2626;\n  border-radius: 0.5rem;\n  padding: 0.75rem 1rem;\n  font-size: 0.875rem;\n  margin-bottom: 1rem;\n}\n.success-msg[_ngcontent-%COMP%] {\n  background: #f0fdf4;\n  color: #16a34a;\n  border-radius: 0.5rem;\n  padding: 0.75rem 1rem;\n  font-size: 0.875rem;\n  margin-bottom: 1rem;\n}\n/*# sourceMappingURL=admin-dashboard.component.css.map */"] });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(AdminDashboardComponent, { className: "AdminDashboardComponent", filePath: "src/app/components/admin/admin-dashboard/admin-dashboard.component.ts", lineNumber: 18 });
})();
export {
  AdminDashboardComponent
};
//# sourceMappingURL=chunk-OYWUI4S2.js.map
