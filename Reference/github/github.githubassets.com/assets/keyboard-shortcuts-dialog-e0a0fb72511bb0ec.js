performance.mark("js-parse-end:keyboard-shortcuts-dialog-e0a0fb72511bb0ec.js");
export const __rspack_esm_id = 34668;
export const __rspack_esm_ids = [34668];
export const __webpack_modules__ = {
    443811(t, e, r) {
        var a = r(147966);
        let o = {
            Android: "Android",
            iOS: "iOS",
            macOS: "macOS",
            Windows: "Windows",
            Linux: "Linux",
            Unknown: "Unknown"
        };

        function n() {
            let t = o.Unknown,
                e = !1;
            if (a.cg) {
                let r = a.cg.navigator,
                    n = "";
                try {
                    n = r.userAgent
                } catch {}
                let i = "";
                try {
                    i = r ? .userAgentData ? .platform || r.platform
                } catch {} - 1 !== ["Macintosh", "MacIntel", "MacPPC", "Mac68K", "macOS"].indexOf(i) ? t = o.macOS : -1 !== ["iPhone", "iPad", "iPod"].indexOf(i) ? t = o.iOS : -1 !== ["Win32", "Win64", "Windows", "WinCE"].indexOf(i) ? t = o.Windows : /Android/.test(n) ? t = o.Android : /Linux/.test(i) && (t = o.Linux), e = r ? .userAgentData ? .mobile ? ? (t === o.Android || t === o.iOS)
            }
            return {
                os: t,
                isAndroid: t === o.Android,
                isIOS: t === o.iOS,
                isMacOS: t === o.macOS,
                isWindows: t === o.Windows,
                isLinux: t === o.Linux,
                isDesktop: t === o.macOS || t === o.Windows || t === o.Linux,
                isMobile: e
            }
        }

        function i() {
            return n().isMobile
        }

        function s() {
            return n().isDesktop
        }

        function c() {
            return n().isMacOS
        }
        async function l() {
            try {
                let t = a.cg ? .navigator ? .userAgentData,
                    e = await t ? .getHighEntropyValues ? .(["architecture"]);
                return e ? .architecture === "arm" || e ? .architecture === "x86" ? e.architecture : void 0
            } catch {
                return
            }
        }

        function d(t, e) {
            return e.includes(t) ? t : e[0]
        }

        function u(t, e, r) {
            let a = t.filter(t => t.platform === e);
            if (0 === a.length) return t[0];
            if (r) {
                let t = a.find(t => t.arch === r);
                if (t) return t
            }
            return a[0]
        }

        function m(t, e, r) {
            let a = new Map;
            for (let e of t) a.has(e.platform) || a.set(e.platform, a.size);
            let n = (t, e) => e === (r ? ? (t === o.macOS ? "arm" : "x86")) ? 0 : e ? 1 : 2;
            return t.slice().sort((t, r) => +(t.platform !== e) != +(r.platform !== e) ? (t.platform !== e) - (r.platform !== e) : t.platform !== r.platform ? (a.get(t.platform) ? ? 0) - (a.get(r.platform) ? ? 0) : n(t.platform, t.arch) - n(r.platform, r.arch))
        }
        r.d(e, {
            AM: () => m,
            Fr: () => i,
            Hx: () => d,
            R0: () => n,
            U0: () => c,
            kV: () => l,
            kX: () => u,
            xl: () => s
        }, {
            OS: o
        })
    },
    348241(t, e, r) {
        var a = r(50515);
        let o = /(?:^|,)((?:[^,]|,(?=\+| |$))*(?:,(?=,))?)/g;

        function n(t) {
            return Array.from(t.matchAll(o)).map(([, t]) => t)
        }
        r.d(e, {
            JC: () => a.JC,
            KK: () => a.KK,
            SK: () => n,
            Vy: () => a.Vy,
            ai: () => a.ai,
            rd: () => a.rd
        })
    },
    588609(t, e, r) {
        var a = r(443811),
            o = r(348241);
        let n = () => {
                if ("u" < typeof document) return !1;
                let t = document.querySelector("meta[name=keyboard-shortcuts-preference]");
                return !t || "all" === t.content
            },
            i = t => /Enter|Arrow|Escape|Meta|Control|Mod|Esc|Tab|Home|End|Page/.test(t) || !(0, a.U0)() && t.includes("Alt") && t.includes("Shift"),
            s = new Set(["button", "checkbox", "color", "file", "hidden", "image", "radio", "range", "reset", "submit"]);

        function c(t) {
            if (!(t instanceof HTMLElement)) return !1;
            let e = t.nodeName.toLowerCase(),
                r = t.getAttribute("type") ? .toLowerCase() ? ? "text",
                a = "true" === t.ariaReadOnly || "true" === t.getAttribute("aria-readonly") || null !== t.getAttribute("readonly");
            return ("select" === e || "textarea" === e || "input" === e && !s.has(r) || t.isContentEditable) && !a
        }
        r.d(e, {
            fg: () => c
        }, {
            $$: t => {
                let e = (0, o.Vy)(t),
                    r = n() && !c(t.target);
                return i(e) || r
            },
            GI: i,
            zw: n
        })
    },
    571960(t, e, r) {
        var a = r(382500),
            o = r(474848),
            n = r(916522),
            i = r(296540),
            s = r(406187),
            c = r(592058),
            l = r(782736),
            d = r(207227),
            u = r(801093),
            m = r(54950),
            f = r(938407),
            p = r(687996),
            h = r(437443),
            b = r(124148);
        let g = (0, d.Y)(() => r.e(86851).then(r.bind(r, 776993))),
            y = () => {
                let t, e = (0, n.c)(1);
                return e[0] === Symbol.for("react.memo_cache_sentinel") ? (t = (0, o.jsxs)("div", {
                    role: "status",
                    className: "KeyboardShortcutsDialog-module__LoadingStateContainer__ZKxJs",
                    children: [(0, o.jsx)(u.A, {
                        size: "large"
                    }), (0, o.jsx)("span", {
                        className: "sr-only",
                        children: f.A.loading
                    })]
                }), e[0] = t) : t = e[0], t
            };

        function S(t) {
            let e, r, a, d, u, S = (0, n.c)(11),
                {
                    docsUrl: j
                } = t,
                [C, w] = (0, i.useState)(null),
                A = (0, s.jE)();
            S[0] === Symbol.for("react.memo_cache_sentinel") ? (e = [], S[0] = e) : e = S[0], (0, i.useEffect)(x, e), S[1] !== A ? (r = () => {
                let t = document.querySelector("meta[name=github-keyboard-shortcuts]") ? .content;
                w(t), A.prefetchQuery((0, l.H)(t))
            }, S[1] = A, S[2] = r) : r = S[2];
            let k = r;
            return S[3] !== k ? (a = (0, o.jsx)(c.ak, {
                commands: {
                    "global-navigation:show-shortcuts-dialog": k
                }
            }), S[3] = k, S[4] = a) : a = S[4], S[5] !== C || S[6] !== j ? (d = null !== C && (0, o.jsx)(m.l, {
                title: f.A.keyboardShortcuts,
                "aria-modal": "true",
                width: "xlarge",
                height: "large",
                onClose: () => w(null),
                className: "KeyboardShortcutsDialog-module__ShortcutsDialogRoot__Rplxi",
                children: (0, o.jsx)(p.t, {
                    fallback: (0, o.jsxs)(h.E, {
                        narrow: !0,
                        children: [(0, o.jsx)(h.E.Visual, {
                            children: (0, o.jsx)(b.AlertIcon, {
                                size: "medium"
                            })
                        }), (0, o.jsx)(h.E.Heading, {
                            children: f.A.errorTitle
                        }), (0, o.jsx)(h.E.Description, {
                            children: f.A.errorMessage
                        })]
                    }),
                    children: (0, o.jsx)(i.Suspense, {
                        fallback: (0, o.jsx)(y, {}),
                        children: (0, o.jsx)(g, {
                            contexts: C,
                            docsUrl: j
                        })
                    })
                })
            }), S[5] = C, S[6] = j, S[7] = d) : d = S[7], S[8] !== a || S[9] !== d ? (u = (0, o.jsxs)(o.Fragment, {
                children: [a, d]
            }), S[8] = a, S[9] = d, S[10] = u) : u = S[10], u
        }

        function x() {
            let t = requestIdleCallback(j);
            return () => cancelIdleCallback(t)
        }

        function j() {
            g.preload()
        }
        y.displayName = "LoadingState", S.displayName = "KeyboardShortcutsDialog", (0, a.k)("keyboard-shortcuts-dialog", {
            Component: S
        })
    },
    782736(t, e, r) {
        var a = r(57027);
        async function o(t) {
            if (void 0 === t) return null;
            let e = new URLSearchParams({
                    contexts: t
                }),
                r = await (0, a.lS)(`/site/keyboard_shortcuts?${e}`, {
                    method: "GET"
                });
            return r.ok ? r.json() : null
        }

        function n(t) {
            let e = t ? .replace(/-/g, "_");
            return {
                queryKey: ["keyboard-shortcuts", e],
                queryFn: () => o(e),
                staleTime: 1 / 0
            }
        }
        r.d(e, {
            H: () => n
        })
    },
    938407(t, e, r) {
        r.d(e, {}, {
            A: {
                keyboardShortcuts: "Keyboard shortcuts",
                siteWideShortcuts: "Site-wide shortcuts",
                loading: "Loading",
                errorTitle: "Something went wrong",
                errorMessage: "Keyboard shortcuts could not be loaded due to an unknown error. If the problem persists, please contact support."
            }
        })
    },
    991853(t, e, r) {
        r.d(e, {}, {
            l: () => void 0
        })
    },
    858051(t, e, r) {
        var a = r(916522),
            o = r(296540),
            n = r(402604),
            i = r(546856);

        function s(t) {
            let e, r, s = (0, a.c)(4),
                c = (0, o.use)(i.I);
            if (!c && !t ? .optional) throw Error("useAnalytics must be used within an AnalyticsContext");
            s[0] !== c ? (e = (t, e, r) => {
                let a = c ? {
                    react: !0,
                    app_name: c.appName,
                    category: c.category,
                    ...c.metadata
                } : {
                    react: !0
                };
                (0, n.BI)(t, { ...a,
                    ...void 0 === r ? {} : r,
                    target: e
                })
            }, s[0] = c, s[1] = e) : e = s[1];
            let l = e;
            return s[2] !== l ? (r = {
                sendAnalyticsEvent: l
            }, s[2] = l, s[3] = r) : r = s[3], r
        }

        function c() {
            let t, e, r = (0, a.c)(4),
                {
                    sendAnalyticsEvent: o
                } = s();
            r[0] !== o ? (t = t => {
                o("analytics.click", void 0, void 0 === t ? {} : t)
            }, r[0] = o, r[1] = t) : t = r[1];
            let n = t;
            return r[2] !== n ? (e = {
                sendClickAnalyticsEvent: n
            }, r[2] = n, r[3] = e) : e = r[3], e
        }
        r.d(e, {
            S: () => c,
            s: () => s
        })
    },
    905225(t, e, r) {
        function a(...t) {
            return JSON.stringify(t, (t, e) => "object" == typeof e ? e : String(e))
        }

        function o(t, e = {}) {
            let {
                hash: r = a,
                cache: n = new Map
            } = e;
            return function(...e) {
                let a = r.apply(this, e);
                if (n.has(a)) return n.get(a);
                let o = t.apply(this, e);
                return o instanceof Promise && (o = o.catch(t => {
                    throw n.delete(a), t
                })), n.set(a, o), o
            }
        }
        r.d(e, {
            A: () => o,
            G: () => a
        })
    }
};
import {
    __webpack_require__ as t
} from "./wp-runtime-e04a67e778dbb510.js";
import * as e from "./runtime-helpers-b5a5a1cee32a4b87.js";
t.C(e);
import * as r from "./app-foundation-b93cdfb3a2ef9996.js";
t.C(r);
import * as a from "./app-runtime-966563661fbbdbd0.js";
t.C(a);
import * as o from "./catalyst-03fc2ee1b163e4cb.js";
t.C(o);
import * as n from "./hotkey-18e2cf4c6aadb3ff.js";
t.C(n);
import * as i from "./primer-react-d9b042567c381e44.js";
t.C(i);
import * as s from "./react-core-3438052ce3101c91.js";
t.C(s);
import * as c from "./fetch-utilities-c15f4a0ba1130fd4.js";
t.C(c);
import * as l from "./react-lib-ecfe3e16246bb52d.js";
t.C(l);
import * as d from "./78205-75aff589688e0be2.js";
t.C(d);
import * as u from "./63211-fb5d39ac620e02bb.js";
t.C(u);
import * as m from "./50841-f6411d024525940b.js";
t.C(m);
import * as f from "./71393-dc1516dc49efc6b7.js";
t.C(f);
import * as p from "./296-cddf2922ea3a416c.js";
t.C(p);
import * as h from "./53351-4e56d567abebf8b3.js";
t.C(h);
import * as b from "./24383-465aa6f1cd4778c3.js";
t.C(b);
import * as g from "./93866-e3503cfa76af03f7.js";
t.C(g);
import * as y from "./4871-323a6754c189b6a8.js";
t.C(y);
import * as S from "./keyboard-shortcuts-dialog-e0a0fb72511bb0ec.js";
t.C(S), t(t.s = 571960);
//# sourceMappingURL=keyboard-shortcuts-dialog-e0a0fb72511bb0ec-794c1e0d644d554f.js.map