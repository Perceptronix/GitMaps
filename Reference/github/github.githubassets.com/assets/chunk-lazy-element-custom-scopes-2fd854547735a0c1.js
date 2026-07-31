export const __rspack_esm_id = 41881;
export const __rspack_esm_ids = [41881];
export const __webpack_modules__ = {
    957628(e, t, s) {
        s.r(t);
        var o = s(331635),
            a = s(651135),
            i = s(613743);
        class n extends HTMLElement {#
            e;#
            t;#
            s = () => Promise.resolve([]);#
            o;#
            a;
            hasScopes = !1;
            connectedCallback() {
                this.#e = parseInt(this.getAttribute("data-max-custom-scopes") || "10", 10)
            }
            initialize(e, t, s, o) {
                this.#t = e, this.#s = t, this.#o = s, this.#a = o
            }
            mode() {
                return this.createCustomScopeForm.hidden ? "manage" : "create"
            }
            customScopesSubmit(e) {
                "manage" === this.mode() ? this.create("") : this.saveCustomScope(e)
            }
            customScopesCancel() {
                "manage" !== this.mode() && this.hasScopes ? this.setMode("manage") : this.customScopesModalDialog.close()
            }
            setMode(e) {
                this.hasScopes && "manage" === e ? (this.createCustomScopeForm.hidden = !0, this.manageCustomScopesForm.hidden = !1, this.#i("Saved searches", "Create saved search")) : (this.createCustomScopeForm.hidden = !1, this.manageCustomScopesForm.hidden = !0)
            }#
            i(e, t) {
                this.customScopesSubmitButton.textContent = t, this.customScopesModalDialog.getElementsByTagName("h1")[0].textContent = e
            }#
            n(e) {
                let t = e && (this.#t ? .len() || 0) >= this.#e;
                t ? this.customScopesModalDialogFlash.innerHTML = `
        <div class="flash flash-warn tmp-mb-3">
          Limit of 10 saved searches reached. Please delete an existing saved search before creating a new one.
        </div>
      ` : this.customScopesModalDialogFlash.textContent = "", this.customScopesSubmitButton.disabled = t
            }
            async saveCustomScope(e) {
                e.preventDefault();
                let t = e.target.form;
                if (!t.checkValidity()) return void t.reportValidity();
                if ((await fetch(t.action, {
                        method: "POST",
                        body: new FormData(t)
                    })).ok) {
                    this.#t ? .clear();
                    let e = await this.#s();
                    this.setScopes(e), t.reset(), this.setMode("manage")
                }
            }
            async show() {
                let e = await this.#s();
                this.setScopes(e), this.customScopesModalDialog instanceof HTMLDialogElement ? this.customScopesModalDialog.showModal() : this.customScopesModalDialog.show(), this.setMode("manage")
            }
            openCustomScopesDialog(e) {
                this.customScopesModalDialog instanceof HTMLDialogElement ? this.customScopesModalDialog.showModal() : this.customScopesModalDialog.show(), e.stopPropagation()
            }
            async editCustomScope(e) {
                e.stopPropagation(), e.preventDefault();
                let t = e.target.getAttribute("data-id");
                t || (t = e.target.closest("button") ? .getAttribute("data-id") || null);
                let s = await this.#l(t);
                t && s && (this.#i("Update saved search", "Update saved search"), this.customScopesIdField.value = s.id, this.customScopesNameField.value = s.name, this.customScopesQueryField.value = s.query, this.#n(!1), this.setMode("create"))
            }
            create(e) {
                this.#i("Create saved search", "Create saved search"), this.customScopesIdField.value = "", this.customScopesNameField.value = "", this.customScopesQueryField.value = e, this.customScopesModalDialog instanceof HTMLDialogElement ? this.customScopesModalDialog.showModal() : this.customScopesModalDialog.show(), this.#n(!0), this.setMode("create")
            }
            async# l(e) {
                let t = this.#t ? .get();
                return void 0 === t && (t = await this.#s()), t.find(t => t.id.toString() === e)
            }
            async deleteCustomScope(e) {
                let t = this.#o,
                    s = e.target.getAttribute("data-id");
                if (s || (s = e.target.closest("button") ? .getAttribute("data-id") || null), !t || !s) return;
                let o = new FormData;
                if (o.append("id", s), o.append("_method", "delete"), (await fetch(t, {
                        method: "POST",
                        headers: {
                            "Scoped-CSRF-Token": this.#a
                        },
                        body: o
                    })).ok) {
                    let e = await this.#s();
                    this.setScopes(e)
                }
                this.#t ? .clear(), this.setMode("manage")
            }
            setScopes(e) {
                this.hasScopes = e.length > 0;
                let t = e.map(e => {
                    let t, s;
                    return (0, i.qy)
                    `
        <div class="d-flex py-1">
          <div>
            <div class="text-bold">${e.name}</div>
            <div class="text-small color-fg-muted">${e.query}</div>
          </div>
          <div class="flex-1"></div>
          <button
            type="button"
            class="btn btn-octicon"
            data-action="click:qbsearch-input#editCustomScope"
            data-id="${e.id}"
            aria-label="Edit saved search"
          >
            ${t=document.getElementById("pencil-icon"),(0,i.qy)([t?.innerHTML])}
          </button>
          <button
            type="button"
            class="btn btn-octicon btn-danger"
            data-action="click:custom-scopes#deleteCustomScope"
            data-id="${e.id}"
            aria-label="Delete saved search"
          >
            ${s=document.getElementById("trash-icon"),(0,i.qy)([s?.innerHTML])}
          </button>
        </div>
      `
                });
                (0, i.XX)((0, i.qy)
                    `${t}`, this.list)
            }
        }(0, o.Cg)([a.aC], n.prototype, "list", void 0), (0, o.Cg)([a.aC], n.prototype, "createCustomScopeForm", void 0), (0, o.Cg)([a.aC], n.prototype, "manageCustomScopesForm", void 0), (0, o.Cg)([a.aC], n.prototype, "customScopesModalDialog", void 0), (0, o.Cg)([a.aC], n.prototype, "customScopesModalDialogFlash", void 0), (0, o.Cg)([a.aC], n.prototype, "customScopesIdField", void 0), (0, o.Cg)([a.aC], n.prototype, "customScopesNameField", void 0), (0, o.Cg)([a.aC], n.prototype, "customScopesQueryField", void 0), (0, o.Cg)([a.aC], n.prototype, "customScopesSubmitButton", void 0), n = (0, o.Cg)([(0, a.p_)("custom-scopes")], n), s.d(t, {
            CustomScopesElement: () => n
        })
    },
    613743(e, t, s) {
        var o = s(389997);
        s.d(t, {
            XX: () => o.XX,
            _3: () => o._3,
            qy: () => o.qy
        })
    },
    389997(e, t, s) {
        var o;
        s.d(t, {
            qy: () => F,
            XX: () => M,
            _3: () => k
        });
        let a = new Map;

        function i(e) {
            if (a.has(e)) return a.get(e);
            let t = e.length,
                s = 0,
                o = 0,
                i = 0,
                n = [];
            for (let a = 0; a < t; a += 1) {
                let t = e[a],
                    l = e[a + 1],
                    c = e[a - 1];
                "{" === t && "{" === l && "\\" !== c ? (1 === (i += 1) && (o = a), a += 1) : "}" === t && "}" === l && "\\" !== c && i && 0 == (i -= 1) && (o > s && (n.push(Object.freeze({
                    type: "string",
                    start: s,
                    end: o,
                    value: e.slice(s, o)
                })), s = o), n.push(Object.freeze({
                    type: "part",
                    start: o,
                    end: a + 2,
                    value: e.slice(s + 2, a).trim()
                })), a += 1, s = a + 1)
            }
            return s < t && n.push(Object.freeze({
                type: "string",
                start: s,
                end: t,
                value: e.slice(s, t)
            })), a.set(e, Object.freeze(n)), a.get(e)
        }
        let n = new WeakMap,
            l = new WeakMap;
        class c {
            constructor(e, t) {
                this.expression = t, n.set(this, e), e.updateParent("")
            }
            get attributeName() {
                return n.get(this).attr.name
            }
            get attributeNamespace() {
                return n.get(this).attr.namespaceURI
            }
            get value() {
                return l.get(this)
            }
            set value(e) {
                l.set(this, e || ""), n.get(this).updateParent(e)
            }
            get element() {
                return n.get(this).element
            }
            get booleanValue() {
                return n.get(this).booleanValue
            }
            set booleanValue(e) {
                n.get(this).booleanValue = e
            }
        }
        class r {
            constructor(e, t) {
                this.element = e, this.attr = t, this.partList = []
            }
            get booleanValue() {
                return this.element.hasAttributeNS(this.attr.namespaceURI, this.attr.name)
            }
            set booleanValue(e) {
                if (1 !== this.partList.length) throw new DOMException("Operation not supported", "NotSupportedError");
                this.partList[0].value = e ? "" : null
            }
            append(e) {
                this.partList.push(e)
            }
            updateParent(e) {
                if (1 === this.partList.length && null === e) this.element.removeAttributeNS(this.attr.namespaceURI, this.attr.name);
                else {
                    let e = this.partList.map(e => "string" == typeof e ? e : e.value).join("");
                    this.element.setAttributeNS(this.attr.namespaceURI, this.attr.name, e)
                }
            }
        }
        let h = new WeakMap;
        class p {
            constructor(e, t) {
                this.expression = t, h.set(this, [e]), e.textContent = ""
            }
            get value() {
                return h.get(this).map(e => e.textContent).join("")
            }
            set value(e) {
                this.replace(e)
            }
            get previousSibling() {
                return h.get(this)[0].previousSibling
            }
            get nextSibling() {
                return h.get(this)[h.get(this).length - 1].nextSibling
            }
            replace(...e) {
                let t = e.map(e => "string" == typeof e ? new Text(e) : e);
                for (let e of (t.length || t.push(new Text("")), h.get(this)[0].before(...t), h.get(this))) e.remove();
                h.set(this, t)
            }
        }

        function u(e) {
            return {
                processCallback(t, s, o) {
                    var a;
                    if ("object" == typeof o && o) {
                        for (let t of s)
                            if (t.expression in o) {
                                let s = null != (a = o[t.expression]) ? a : "";
                                e(t, s)
                            }
                    }
                }
            }
        }

        function d(e, t) {
            e.value = String(t)
        }
        let m = u(d),
            g = new WeakMap,
            S = new WeakMap;
        class f extends DocumentFragment {
            constructor(e, t, s = m) {
                var o, a;
                super(), Object.getPrototypeOf(this) !== f.prototype && Object.setPrototypeOf(this, f.prototype), this.appendChild(e.content.cloneNode(!0)), S.set(this, Array.from(function*(e) {
                    let t, s = e.ownerDocument.createTreeWalker(e, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, null, !1);
                    for (; t = s.nextNode();)
                        if (t instanceof Element && t.hasAttributes())
                            for (let e = 0; e < t.attributes.length; e += 1) {
                                let s = t.attributes.item(e);
                                if (s && s.value.includes("{{")) {
                                    let e = new r(t, s);
                                    for (let t of i(s.value))
                                        if ("string" === t.type) e.append(t.value);
                                        else {
                                            let s = new c(e, t.value);
                                            e.append(s), yield s
                                        }
                                }
                            } else if (t instanceof Text && t.textContent && t.textContent.includes("{{")) {
                                let e = i(t.textContent);
                                for (let s = 0; s < e.length; s += 1) {
                                    let o = e[s];
                                    o.end < t.textContent.length && t.splitText(o.end), "part" === o.type && (yield new p(t, o.value));
                                    break
                                }
                            }
                }(this))), g.set(this, s), null == (a = (o = g.get(this)).createCallback) || a.call(o, this, S.get(this), t), g.get(this).processCallback(this, S.get(this), t)
            }
            update(e) {
                g.get(this).processCallback(this, S.get(this), e)
            }
        }
        let v = new WeakMap,
            b = new WeakMap,
            y = new WeakMap;
        class C {
            constructor(e, t, s) {
                this.strings = e, this.values = t, this.processor = s
            }
            static setCSPTrustedTypesPolicy(e) {
                C.cspTrustedTypesPolicy = e
            }
            get template() {
                var e, t;
                if (v.has(this.strings)) return v.get(this.strings); {
                    let s = document.createElement("template"),
                        o = this.strings.length - 1,
                        a = this.strings.reduce((e, t, s) => e + t + (s < o ? `{{ ${s} }}` : ""), "");
                    return s.innerHTML = null != (t = null == (e = C.cspTrustedTypesPolicy) ? void 0 : e.createHTML(a)) ? t : a, v.set(this.strings, s), s
                }
            }
            renderInto(e) {
                let t = this.template;
                if (b.get(e) !== t) {
                    b.set(e, t);
                    let s = new f(t, this.values, this.processor);
                    y.set(e, s), e instanceof p ? e.replace(...s.children) : e.appendChild(s);
                    return
                }
                y.get(e).update(this.values)
            }
        }

        function M(e, t) {
            e.renderInto(t)
        }
        C.cspTrustedTypesPolicy = null;
        let w = new WeakSet,
            x = new WeakMap;
        class T {
            constructor(e, t) {
                this.element = e, this.type = t, this.element.addEventListener(this.type, this), x.get(this.element).set(this.type, this)
            }
            set(e) {
                "function" == typeof e ? this.handleEvent = e.bind(this.element) : "object" == typeof e && "function" == typeof e.handleEvent ? this.handleEvent = e.handleEvent.bind(e) : (this.element.removeEventListener(this.type, this), x.get(this.element).delete(this.type))
            }
            static
            for (e) {
                x.has(e.element) || x.set(e.element, new Map);
                let t = e.attributeName.slice(2),
                    s = x.get(e.element);
                return s.has(t) ? s.get(t) : new T(e.element, t)
            }
        }
        let D = u(function(e, t) {
            w.has(t) && (t(e), 1) || "boolean" == typeof t && e instanceof c && "boolean" == typeof e.element[e.attributeName] && (e.booleanValue = t, 1) || e instanceof c && e.attributeName.startsWith("on") && (T.for(e).set(t), e.element.removeAttributeNS(e.attributeNamespace, e.attributeName), 1) || t instanceof C && e instanceof p && (t.renderInto(e), 1) || t instanceof DocumentFragment && e instanceof p && (t.childNodes.length && e.replace(...t.childNodes), 1) || function(e, t) {
                if (!("object" == typeof t && Symbol.iterator in t)) return !1;
                if (!(e instanceof p)) return e.value = Array.from(t).join(" "), !0; {
                    let s = [];
                    for (let e of t)
                        if (e instanceof C) {
                            let t = document.createDocumentFragment();
                            e.renderInto(t), s.push(...t.childNodes)
                        } else e instanceof DocumentFragment ? s.push(...e.childNodes) : s.push(String(e));
                    return s.length && e.replace(...s), !0
                }
            }(e, t) || d(e, t)
        });

        function F(e, ...t) {
            return new C(e, t, D)
        }
        new WeakMap;
        let k = (o = e => t => {
            var s, o;
            if (!(t instanceof p)) return;
            let a = document.createElement("template");
            a.innerHTML = null != (o = null == (s = C.cspTrustedTypesPolicy) ? void 0 : s.createHTML(e)) ? o : e;
            let i = document.importNode(a.content, !0);
            t.replace(...i.childNodes)
        }, (...e) => {
            let t = o(...e);
            return w.add(t), t
        })
    }
};
//# sourceMappingURL=chunk-lazy-element-custom-scopes-2fd854547735a0c1-22df2d4f44370519.js.map