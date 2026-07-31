export const __rspack_esm_id = 49607;
export const __rspack_esm_ids = [49607];
export const __webpack_modules__ = {
    345593(t, e, n) {
        var i = n(576666);

        function r(t, e, n) {
            return t.dispatchEvent(new CustomEvent(e, {
                bubbles: !0,
                cancelable: n
            }))
        }

        function s(t, e) {
            e && (function(t, e) {
                if (!(t instanceof HTMLFormElement)) throw TypeError("The specified element is not of type HTMLFormElement.");
                if (!(e instanceof HTMLElement)) throw TypeError("The specified element is not of type HTMLElement.");
                if ("submit" !== e.type) throw TypeError("The specified element is not a submit button.");
                if (!t || t !== e.form) throw Error("The specified element is not owned by the form element.")
            }(t, e), (0, i.A)(e)), r(t, "submit", !0) && t.submit()
        }

        function a(t, e) {
            if ("boolean" == typeof e)
                if (t instanceof HTMLInputElement) t.checked = e;
                else throw TypeError("only checkboxes can be set to boolean value");
            else if ("checkbox" === t.type) throw TypeError("checkbox can't be set to string value");
            else t.value = e;
            r(t, "change", !1)
        }

        function o(t, e) {
            for (let n in e) {
                let i = e[n],
                    r = t.elements.namedItem(n);
                r instanceof HTMLInputElement ? r.value = i : r instanceof HTMLTextAreaElement && (r.value = i)
            }
        }

        function u(t) {
            if (!(t instanceof HTMLElement)) return !1;
            let e = t.nodeName.toLowerCase(),
                n = (t.getAttribute("type") || "").toLowerCase();
            return "select" === e || "textarea" === e || "input" === e && "submit" !== n && "reset" !== n || t.isContentEditable
        }

        function l(t) {
            return new URLSearchParams(t)
        }

        function d(t, e) {
            let n = new URLSearchParams(t.search);
            for (let [t, i] of l(e)) n.append(t, i);
            return n.toString()
        }

        function c(t) {
            return l(new FormData(t)).toString()
        }
        n.d(e, {
            Cy: () => o,
            K3: () => d,
            Z8: () => u,
            k_: () => s,
            lK: () => c,
            m$: () => a
        })
    },
    576666(t, e, n) {
        function i(t) {
            let e = t.closest("form");
            if (!(e instanceof HTMLFormElement)) return;
            let n = r(e);
            if (t.name) {
                let i = t.matches("input[type=submit]") ? "Submit" : "",
                    r = t.value || i;
                n || ((n = document.createElement("input")).type = "hidden", n.classList.add("js-submit-button-value"), e.prepend(n)), n.name = t.name, n.value = r
            } else n && n.remove()
        }

        function r(t) {
            let e = t.querySelector("input.js-submit-button-value");
            return e instanceof HTMLInputElement ? e : null
        }
        n.d(e, {
            A: () => i,
            C: () => r
        })
    },
    435662(t, e, n) {
        n.r(e), n(578877)
    },
    578877(t, e, n) {
        var i = n(331635),
            r = n(651135),
            s = n(274043),
            a = n(345593),
            o = n(432231);
        let u = {
            Initializing: "initializing",
            Unsupported: "unsupported",
            Ready: "ready",
            Waiting: "waiting",
            Error: "error",
            Submitting: "submitting"
        };
        class l extends HTMLElement {
            state = u.Initializing;
            static attrPrefix = "";
            dataJson = "";
            subtleLogin = !1;
            hasErrored = !1;
            async connectedCallback() {
                this.originalButtonText = this.getCurrentButtonText(), this.originalErrorText = this.errorText.textContent, this.setState((0, s.$j)() ? u.Ready : u.Unsupported), this.passkeySupport = await window.PublicKeyCredential ? .isUserVerifyingPlatformAuthenticatorAvailable(), this.state !== u.Unsupported && !this.passkeySupport && this.passkeysUnsupportedMessage && (this.passkeysUnsupportedMessage.hidden = !1), this.subtleLogin ? this.handleWebauthnSubtle() : this.showWebauthnLoginFragment()
            }
            handleWebauthnSubtle() {
                let t = document.querySelector(".js-webauthn-subtle");
                t && (t.hidden = !1, this.updateWebauthnSubtleParentBoxVisibility(!1), t.addEventListener("webauthn-subtle-submit", () => {
                    this.showWebauthnLoginFragment(), this.state !== u.Unsupported && this.prompt()
                }))
            }
            showWebauthnLoginFragment() {
                let t = document.querySelector(".js-webauthn-login-section");
                if (!t) return;
                t.hidden = !1;
                let e = document.querySelector(".js-webauthn-login-divider");
                e && (e.hidden = !1, this.updateWebauthnSubtleParentBoxVisibility(!0))
            }
            updateWebauthnSubtleParentBoxVisibility(t) {
                let e = document.querySelector(".js-webauthn-hint");
                e && (e.hidden = t)
            }
            getCurrentButtonText() {
                return this.buttonText.textContent || ""
            }
            setCurrentButtonText(t) {
                this.buttonText.textContent = t
            }
            setState(t) {
                let e = this.button.getAttribute("data-retry-message") || this.originalButtonText,
                    n = this.hasErrored ? e : this.originalButtonText;
                for (let t of (this.setCurrentButtonText(n), this.button.disabled = !1, this.button.hidden = !1, this.errorText.textContent = "", this.messages)) t.hidden = !0;
                switch (t) {
                    case u.Initializing:
                        this.button.disabled = !0;
                        break;
                    case u.Unsupported:
                        this.button.disabled = !0, this.unsupportedMessage.hidden = !1, this.passkeysUnsupportedMessage && (this.passkeysUnsupportedMessage.hidden = !0);
                        break;
                    case u.Ready:
                        break;
                    case u.Waiting:
                        this.waitingMessage.hidden = !1, this.button.hidden = !0;
                        break;
                    case u.Error:
                        this.errorMessage.hidden = !1, this.errorText.textContent = this.originalErrorText;
                        break;
                    case u.Submitting:
                        this.setCurrentButtonText("Verifying\u2026"), this.button.disabled = !0;
                        break;
                    default:
                        throw Error("invalid state")
                }
                this.state = t
            }
            async prompt(t, e) {
                t ? .preventDefault(), this.dispatchEvent(new CustomEvent("webauthn-get-prompt"));
                try {
                    if (e || this.setState(u.Waiting), (0, o.G7)("migrate_away_from_webauthn_json")) {
                        let t = JSON.parse(this.dataJson).publicKey,
                            e = PublicKeyCredential.parseRequestOptionsFromJSON(t),
                            n = await navigator.credentials.get({
                                publicKey: e
                            });
                        this.setState(u.Submitting);
                        let i = this.closest(".js-webauthn-form");
                        i.querySelector(".js-webauthn-response").value = JSON.stringify(n.toJSON()), (0, a.k_)(i)
                    } else {
                        let t = JSON.parse(this.dataJson),
                            e = (0, s.d5)(t),
                            n = await (0, s.Jt)(e);
                        this.setState(u.Submitting);
                        let i = this.closest(".js-webauthn-form");
                        i.querySelector(".js-webauthn-response").value = JSON.stringify(n), (0, a.k_)(i)
                    }
                } catch (t) {
                    if (!e) throw this.hasErrored = !0, this.setState(u.Error), t
                }
            }
        }(0, i.Cg)([r.aC], l.prototype, "button", void 0), (0, i.Cg)([r.aC], l.prototype, "buttonText", void 0), (0, i.Cg)([r.zV], l.prototype, "messages", void 0), (0, i.Cg)([r.aC], l.prototype, "capitalizedDescription", void 0), (0, i.Cg)([r.aC], l.prototype, "unsupportedMessage", void 0), (0, i.Cg)([r.aC], l.prototype, "passkeysUnsupportedMessage", void 0), (0, i.Cg)([r.aC], l.prototype, "waitingMessage", void 0), (0, i.Cg)([r.aC], l.prototype, "errorMessage", void 0), (0, i.Cg)([r.aC], l.prototype, "errorText", void 0), (0, i.Cg)([r.CF], l.prototype, "dataJson", void 0), (0, i.Cg)([r.CF], l.prototype, "subtleLogin", void 0), l = (0, i.Cg)([(0, r.p_)("webauthn-get")], l), n.d(e, {}, {
            U: u
        })
    },
    274043(t, e, n) {
        function i(t) {
            let e = "==".slice(0, (4 - t.length % 4) % 4),
                n = atob(t.replace(/-/g, "+").replace(/_/g, "/") + e),
                i = new ArrayBuffer(n.length),
                r = new Uint8Array(i);
            for (let t = 0; t < n.length; t++) r[t] = n.charCodeAt(t);
            return i
        }

        function r(t) {
            let e = new Uint8Array(t),
                n = "";
            for (let t of e) n += String.fromCharCode(t);
            return btoa(n).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
        }
        var s = "copy",
            a = "convert";

        function o(t, e, n) {
            if (e === s) return n;
            if (e === a) return t(n);
            if (e instanceof Array) return n.map(n => o(t, e[0], n));
            if (e instanceof Object) {
                let i = {};
                for (let [r, s] of Object.entries(e)) {
                    if (s.derive) {
                        let t = s.derive(n);
                        void 0 !== t && (n[r] = t)
                    }
                    if (!(r in n)) {
                        if (s.required) throw Error(`Missing key: ${r}`);
                        continue
                    }
                    if (null == n[r]) {
                        i[r] = null;
                        continue
                    }
                    i[r] = o(t, s.schema, n[r])
                }
                return i
            }
        }

        function u(t, e) {
            return {
                required: !0,
                schema: t,
                derive: e
            }
        }

        function l(t) {
            return {
                required: !0,
                schema: t
            }
        }

        function d(t) {
            return {
                required: !1,
                schema: t
            }
        }
        var c = {
                type: l(s),
                id: l(a),
                transports: d(s)
            },
            p = {
                appid: d(s),
                appidExclude: d(s),
                credProps: d(s)
            },
            h = {
                appid: d(s),
                appidExclude: d(s),
                credProps: d(s)
            },
            b = {
                publicKey: l({
                    rp: l(s),
                    user: l({
                        id: l(a),
                        name: l(s),
                        displayName: l(s)
                    }),
                    challenge: l(a),
                    pubKeyCredParams: l(s),
                    timeout: d(s),
                    excludeCredentials: d([c]),
                    authenticatorSelection: d(s),
                    attestation: d(s),
                    extensions: d(p)
                }),
                signal: d(s)
            },
            g = {
                type: l(s),
                id: l(s),
                rawId: l(a),
                authenticatorAttachment: d(s),
                response: l({
                    clientDataJSON: l(a),
                    attestationObject: l(a),
                    transports: u(s, t => {
                        var e;
                        return (null == (e = t.getTransports) ? void 0 : e.call(t)) || []
                    })
                }),
                clientExtensionResults: u(h, t => t.getClientExtensionResults())
            },
            f = {
                mediation: d(s),
                publicKey: l({
                    challenge: l(a),
                    timeout: d(s),
                    rpId: d(s),
                    allowCredentials: d([c]),
                    userVerification: d(s),
                    extensions: d(p)
                }),
                signal: d(s)
            },
            m = {
                type: l(s),
                id: l(s),
                rawId: l(a),
                authenticatorAttachment: d(s),
                response: l({
                    clientDataJSON: l(a),
                    authenticatorData: l(a),
                    signature: l(a),
                    userHandle: l(a)
                }),
                clientExtensionResults: u(h, t => t.getClientExtensionResults())
            };

        function y(t) {
            return o(i, b, t)
        }

        function w(t) {
            return o(i, f, t)
        }

        function C() {
            return !!(navigator.credentials && navigator.credentials.create && navigator.credentials.get && window.PublicKeyCredential)
        }
        async function v(t) {
            let e = await navigator.credentials.create(t);
            return e.toJSON = () => o(r, g, e), e
        }
        async function x(t) {
            let e = await navigator.credentials.get(t);
            return e.toJSON = () => o(r, m, e), e
        }
        n.d(e, {
            $j: () => C,
            Jt: () => x,
            PG: () => y,
            d5: () => w,
            vt: () => v
        })
    }
};
//# sourceMappingURL=chunk-lazy-element-webauthn-get-bc1b515e666f8e51-0082f01bd9e3ecd8.js.map