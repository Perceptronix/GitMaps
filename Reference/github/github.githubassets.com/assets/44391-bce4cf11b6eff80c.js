performance.mark("js-parse-end:44391-bce4cf11b6eff80c.js");
export const __rspack_esm_id = 44391;
export const __rspack_esm_ids = [44391];
export const __webpack_modules__ = {
    935908(t, e, i) {
        class n {
            constructor(t, e, {
                tabInsertsSuggestions: i,
                firstOptionSelectionMode: n,
                scrollIntoViewOptions: s
            } = {}) {
                this.input = t, this.list = e, this.tabInsertsSuggestions = null == i || i, this.firstOptionSelectionMode = null != n ? n : "none", this.scrollIntoViewOptions = null != s ? s : {
                    block: "nearest",
                    inline: "nearest"
                }, this.isComposing = !1, e.id || (e.id = `combobox-${Math.random().toString().slice(2,6)}`), this.ctrlBindings = !!navigator.userAgent.match(/Macintosh/), this.keyboardEventHandler = t => (function(t, e) {
                    if (!t.shiftKey && !t.metaKey && !t.altKey && (e.ctrlBindings || !t.ctrlKey) && !e.isComposing) switch (t.key) {
                        case "Enter":
                            r(e.input, e.list) && t.preventDefault();
                            break;
                        case "Tab":
                            e.tabInsertsSuggestions && r(e.input, e.list) && t.preventDefault();
                            break;
                        case "Escape":
                            e.clearSelection();
                            break;
                        case "ArrowDown":
                            e.navigate(1), t.preventDefault();
                            break;
                        case "ArrowUp":
                            e.navigate(-1), t.preventDefault();
                            break;
                        case "n":
                            e.ctrlBindings && t.ctrlKey && (e.navigate(1), t.preventDefault());
                            break;
                        case "p":
                            e.ctrlBindings && t.ctrlKey && (e.navigate(-1), t.preventDefault());
                            break;
                        default:
                            if (t.ctrlKey) break;
                            e.resetSelection()
                    }
                })(t, this), this.compositionEventHandler = t => {
                    var e, i;
                    return e = t, i = this, void(i.isComposing = "compositionstart" === e.type, document.getElementById(i.input.getAttribute("aria-controls") || "") && i.clearSelection())
                }, this.inputHandler = this.clearSelection.bind(this), t.setAttribute("role", "combobox"), t.setAttribute("aria-controls", e.id), t.setAttribute("aria-expanded", "false"), t.setAttribute("aria-autocomplete", "list"), t.setAttribute("aria-haspopup", "listbox")
            }
            destroy() {
                this.clearSelection(), this.stop(), this.input.removeAttribute("role"), this.input.removeAttribute("aria-controls"), this.input.removeAttribute("aria-expanded"), this.input.removeAttribute("aria-autocomplete"), this.input.removeAttribute("aria-haspopup")
            }
            start() {
                this.input.setAttribute("aria-expanded", "true"), this.input.addEventListener("compositionstart", this.compositionEventHandler), this.input.addEventListener("compositionend", this.compositionEventHandler), this.input.addEventListener("input", this.inputHandler), this.input.addEventListener("keydown", this.keyboardEventHandler), this.list.addEventListener("click", s), this.resetSelection()
            }
            stop() {
                this.clearSelection(), this.input.setAttribute("aria-expanded", "false"), this.input.removeEventListener("compositionstart", this.compositionEventHandler), this.input.removeEventListener("compositionend", this.compositionEventHandler), this.input.removeEventListener("input", this.inputHandler), this.input.removeEventListener("keydown", this.keyboardEventHandler), this.list.removeEventListener("click", s)
            }
            indicateDefaultOption() {
                var t;
                "active" === this.firstOptionSelectionMode ? null == (t = Array.from(this.list.querySelectorAll('[role="option"]:not([aria-disabled="true"])')).filter(a)[0]) || t.setAttribute("data-combobox-option-default", "true") : "selected" === this.firstOptionSelectionMode && this.navigate(1)
            }
            navigate(t = 1) {
                let e = Array.from(this.list.querySelectorAll('[aria-selected="true"]')).filter(a)[0],
                    i = Array.from(this.list.querySelectorAll('[role="option"]')).filter(a),
                    n = i.indexOf(e);
                if (n === i.length - 1 && 1 === t || 0 === n && -1 === t) {
                    this.clearSelection(), this.input.focus();
                    return
                }
                let s = 1 === t ? 0 : i.length - 1;
                if (e && n >= 0) {
                    let e = n + t;
                    e >= 0 && e < i.length && (s = e)
                }
                let r = i[s];
                if (r)
                    for (let t of i) t.removeAttribute("data-combobox-option-default"), r === t ? (this.input.setAttribute("aria-activedescendant", r.id), r.setAttribute("aria-selected", "true"), r.dispatchEvent(new Event("combobox-select", {
                        bubbles: !0
                    })), r.scrollIntoView(this.scrollIntoViewOptions)) : t.removeAttribute("aria-selected")
            }
            clearSelection() {
                for (let t of (this.input.removeAttribute("aria-activedescendant"), this.list.querySelectorAll('[aria-selected="true"], [data-combobox-option-default="true"]'))) t.removeAttribute("aria-selected"), t.removeAttribute("data-combobox-option-default")
            }
            resetSelection() {
                this.clearSelection(), this.indicateDefaultOption()
            }
        }

        function s(t) {
            var e, i;
            if (!(t.target instanceof Element)) return;
            let n = t.target.closest('[role="option"]');
            n && "true" !== n.getAttribute("aria-disabled") && (e = n, i = {
                event: t
            }, e.dispatchEvent(new CustomEvent("combobox-commit", {
                bubbles: !0,
                detail: i
            })))
        }

        function r(t, e) {
            let i = e.querySelector('[aria-selected="true"], [data-combobox-option-default="true"]');
            return !!i && ("true" === i.getAttribute("aria-disabled") || (i.click(), !0))
        }

        function a(t) {
            return !t.hidden && !(t instanceof HTMLInputElement && "hidden" === t.type) && (t.offsetWidth > 0 || t.offsetHeight > 0)
        }
        i.d(e, {
            A: () => n
        })
    },
    389997(t, e, i) {
        var n;
        i.d(e, {
            qy: () => M,
            XX: () => k,
            _3: () => T
        });
        let s = new Map;

        function r(t) {
            if (s.has(t)) return s.get(t);
            let e = t.length,
                i = 0,
                n = 0,
                r = 0,
                a = [];
            for (let s = 0; s < e; s += 1) {
                let e = t[s],
                    o = t[s + 1],
                    l = t[s - 1];
                "{" === e && "{" === o && "\\" !== l ? (1 === (r += 1) && (n = s), s += 1) : "}" === e && "}" === o && "\\" !== l && r && 0 == (r -= 1) && (n > i && (a.push(Object.freeze({
                    type: "string",
                    start: i,
                    end: n,
                    value: t.slice(i, n)
                })), i = n), a.push(Object.freeze({
                    type: "part",
                    start: n,
                    end: s + 2,
                    value: t.slice(i + 2, s).trim()
                })), s += 1, i = s + 1)
            }
            return i < e && a.push(Object.freeze({
                type: "string",
                start: i,
                end: e,
                value: t.slice(i, e)
            })), s.set(t, Object.freeze(a)), s.get(t)
        }
        let a = new WeakMap,
            o = new WeakMap;
        class l {
            constructor(t, e) {
                this.expression = e, a.set(this, t), t.updateParent("")
            }
            get attributeName() {
                return a.get(this).attr.name
            }
            get attributeNamespace() {
                return a.get(this).attr.namespaceURI
            }
            get value() {
                return o.get(this)
            }
            set value(t) {
                o.set(this, t || ""), a.get(this).updateParent(t)
            }
            get element() {
                return a.get(this).element
            }
            get booleanValue() {
                return a.get(this).booleanValue
            }
            set booleanValue(t) {
                a.get(this).booleanValue = t
            }
        }
        class c {
            constructor(t, e) {
                this.element = t, this.attr = e, this.partList = []
            }
            get booleanValue() {
                return this.element.hasAttributeNS(this.attr.namespaceURI, this.attr.name)
            }
            set booleanValue(t) {
                if (1 !== this.partList.length) throw new DOMException("Operation not supported", "NotSupportedError");
                this.partList[0].value = t ? "" : null
            }
            append(t) {
                this.partList.push(t)
            }
            updateParent(t) {
                if (1 === this.partList.length && null === t) this.element.removeAttributeNS(this.attr.namespaceURI, this.attr.name);
                else {
                    let t = this.partList.map(t => "string" == typeof t ? t : t.value).join("");
                    this.element.setAttributeNS(this.attr.namespaceURI, this.attr.name, t)
                }
            }
        }
        let u = new WeakMap;
        class p {
            constructor(t, e) {
                this.expression = e, u.set(this, [t]), t.textContent = ""
            }
            get value() {
                return u.get(this).map(t => t.textContent).join("")
            }
            set value(t) {
                this.replace(t)
            }
            get previousSibling() {
                return u.get(this)[0].previousSibling
            }
            get nextSibling() {
                return u.get(this)[u.get(this).length - 1].nextSibling
            }
            replace(...t) {
                let e = t.map(t => "string" == typeof t ? new Text(t) : t);
                for (let t of (e.length || e.push(new Text("")), u.get(this)[0].before(...e), u.get(this))) t.remove();
                u.set(this, e)
            }
        }

        function h(t) {
            return {
                processCallback(e, i, n) {
                    var s;
                    if ("object" == typeof n && n) {
                        for (let e of i)
                            if (e.expression in n) {
                                let i = null != (s = n[e.expression]) ? s : "";
                                t(e, i)
                            }
                    }
                }
            }
        }

        function d(t, e) {
            t.value = String(e)
        }
        let m = h(d),
            f = new WeakMap,
            b = new WeakMap;
        class g extends DocumentFragment {
            constructor(t, e, i = m) {
                var n, s;
                super(), Object.getPrototypeOf(this) !== g.prototype && Object.setPrototypeOf(this, g.prototype), this.appendChild(t.content.cloneNode(!0)), b.set(this, Array.from(function*(t) {
                    let e, i = t.ownerDocument.createTreeWalker(t, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, null, !1);
                    for (; e = i.nextNode();)
                        if (e instanceof Element && e.hasAttributes())
                            for (let t = 0; t < e.attributes.length; t += 1) {
                                let i = e.attributes.item(t);
                                if (i && i.value.includes("{{")) {
                                    let t = new c(e, i);
                                    for (let e of r(i.value))
                                        if ("string" === e.type) t.append(e.value);
                                        else {
                                            let i = new l(t, e.value);
                                            t.append(i), yield i
                                        }
                                }
                            } else if (e instanceof Text && e.textContent && e.textContent.includes("{{")) {
                                let t = r(e.textContent);
                                for (let i = 0; i < t.length; i += 1) {
                                    let n = t[i];
                                    n.end < e.textContent.length && e.splitText(n.end), "part" === n.type && (yield new p(e, n.value));
                                    break
                                }
                            }
                }(this))), f.set(this, i), null == (s = (n = f.get(this)).createCallback) || s.call(n, this, b.get(this), e), f.get(this).processCallback(this, b.get(this), e)
            }
            update(t) {
                f.get(this).processCallback(this, b.get(this), t)
            }
        }
        let v = new WeakMap,
            y = new WeakMap,
            E = new WeakMap;
        class A {
            constructor(t, e, i) {
                this.strings = t, this.values = e, this.processor = i
            }
            static setCSPTrustedTypesPolicy(t) {
                A.cspTrustedTypesPolicy = t
            }
            get template() {
                var t, e;
                if (v.has(this.strings)) return v.get(this.strings); {
                    let i = document.createElement("template"),
                        n = this.strings.length - 1,
                        s = this.strings.reduce((t, e, i) => t + e + (i < n ? `{{ ${i} }}` : ""), "");
                    return i.innerHTML = null != (e = null == (t = A.cspTrustedTypesPolicy) ? void 0 : t.createHTML(s)) ? e : s, v.set(this.strings, i), i
                }
            }
            renderInto(t) {
                let e = this.template;
                if (y.get(t) !== e) {
                    y.set(t, e);
                    let i = new g(e, this.values, this.processor);
                    E.set(t, i), t instanceof p ? t.replace(...i.children) : t.appendChild(i);
                    return
                }
                E.get(t).update(this.values)
            }
        }

        function k(t, e) {
            t.renderInto(e)
        }
        A.cspTrustedTypesPolicy = null;
        let S = new WeakSet,
            x = new WeakMap;
        class w {
            constructor(t, e) {
                this.element = t, this.type = e, this.element.addEventListener(this.type, this), x.get(this.element).set(this.type, this)
            }
            set(t) {
                "function" == typeof t ? this.handleEvent = t.bind(this.element) : "object" == typeof t && "function" == typeof t.handleEvent ? this.handleEvent = t.handleEvent.bind(t) : (this.element.removeEventListener(this.type, this), x.get(this.element).delete(this.type))
            }
            static
            for (t) {
                x.has(t.element) || x.set(t.element, new Map);
                let e = t.attributeName.slice(2),
                    i = x.get(t.element);
                return i.has(e) ? i.get(e) : new w(t.element, e)
            }
        }
        let L = h(function(t, e) {
            S.has(e) && (e(t), 1) || "boolean" == typeof e && t instanceof l && "boolean" == typeof t.element[t.attributeName] && (t.booleanValue = e, 1) || t instanceof l && t.attributeName.startsWith("on") && (w.for(t).set(e), t.element.removeAttributeNS(t.attributeNamespace, t.attributeName), 1) || e instanceof A && t instanceof p && (e.renderInto(t), 1) || e instanceof DocumentFragment && t instanceof p && (e.childNodes.length && t.replace(...e.childNodes), 1) || function(t, e) {
                if (!("object" == typeof e && Symbol.iterator in e)) return !1;
                if (!(t instanceof p)) return t.value = Array.from(e).join(" "), !0; {
                    let i = [];
                    for (let t of e)
                        if (t instanceof A) {
                            let e = document.createDocumentFragment();
                            t.renderInto(e), i.push(...e.childNodes)
                        } else t instanceof DocumentFragment ? i.push(...t.childNodes) : i.push(String(t));
                    return i.length && t.replace(...i), !0
                }
            }(t, e) || d(t, e)
        });

        function M(t, ...e) {
            return new A(t, e, L)
        }
        new WeakMap;
        let T = (n = t => e => {
            var i, n;
            if (!(e instanceof p)) return;
            let s = document.createElement("template");
            s.innerHTML = null != (n = null == (i = A.cspTrustedTypesPolicy) ? void 0 : i.createHTML(t)) ? n : t;
            let r = document.importNode(s.content, !0);
            e.replace(...r.childNodes)
        }, (...t) => {
            let e = n(...t);
            return S.add(e), e
        })
    }
};
//# sourceMappingURL=44391-bce4cf11b6eff80c-629b8b48eb4afb4e.js.map