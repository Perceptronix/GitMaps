export const __rspack_esm_id = 38963;
export const __rspack_esm_ids = [38963];
export const __webpack_modules__ = {
    443811(e, t, r) {
        var n = r(147966);
        let a = {
            Android: "Android",
            iOS: "iOS",
            macOS: "macOS",
            Windows: "Windows",
            Linux: "Linux",
            Unknown: "Unknown"
        };

        function o() {
            let e = a.Unknown,
                t = !1;
            if (n.cg) {
                let r = n.cg.navigator,
                    o = "";
                try {
                    o = r.userAgent
                } catch {}
                let i = "";
                try {
                    i = r ? .userAgentData ? .platform || r.platform
                } catch {} - 1 !== ["Macintosh", "MacIntel", "MacPPC", "Mac68K", "macOS"].indexOf(i) ? e = a.macOS : -1 !== ["iPhone", "iPad", "iPod"].indexOf(i) ? e = a.iOS : -1 !== ["Win32", "Win64", "Windows", "WinCE"].indexOf(i) ? e = a.Windows : /Android/.test(o) ? e = a.Android : /Linux/.test(i) && (e = a.Linux), t = r ? .userAgentData ? .mobile ? ? (e === a.Android || e === a.iOS)
            }
            return {
                os: e,
                isAndroid: e === a.Android,
                isIOS: e === a.iOS,
                isMacOS: e === a.macOS,
                isWindows: e === a.Windows,
                isLinux: e === a.Linux,
                isDesktop: e === a.macOS || e === a.Windows || e === a.Linux,
                isMobile: t
            }
        }

        function i() {
            return o().isMobile
        }

        function l() {
            return o().isDesktop
        }

        function s() {
            return o().isMacOS
        }
        async function c() {
            try {
                let e = n.cg ? .navigator ? .userAgentData,
                    t = await e ? .getHighEntropyValues ? .(["architecture"]);
                return t ? .architecture === "arm" || t ? .architecture === "x86" ? t.architecture : void 0
            } catch {
                return
            }
        }

        function u(e, t) {
            return t.includes(e) ? e : t[0]
        }

        function d(e, t, r) {
            let n = e.filter(e => e.platform === t);
            if (0 === n.length) return e[0];
            if (r) {
                let e = n.find(e => e.arch === r);
                if (e) return e
            }
            return n[0]
        }

        function m(e, t, r) {
            let n = new Map;
            for (let t of e) n.has(t.platform) || n.set(t.platform, n.size);
            let o = (e, t) => t === (r ? ? (e === a.macOS ? "arm" : "x86")) ? 0 : t ? 1 : 2;
            return e.slice().sort((e, r) => +(e.platform !== t) != +(r.platform !== t) ? (e.platform !== t) - (r.platform !== t) : e.platform !== r.platform ? (n.get(e.platform) ? ? 0) - (n.get(r.platform) ? ? 0) : o(e.platform, e.arch) - o(r.platform, r.arch))
        }
        r.d(t, {
            AM: () => m,
            Fr: () => i,
            Hx: () => u,
            R0: () => o,
            U0: () => s,
            kV: () => c,
            kX: () => d,
            xl: () => l
        }, {
            OS: a
        })
    },
    348241(e, t, r) {
        var n = r(50515);
        let a = /(?:^|,)((?:[^,]|,(?=\+| |$))*(?:,(?=,))?)/g;

        function o(e) {
            return Array.from(e.matchAll(a)).map(([, e]) => e)
        }
        r.d(t, {
            JC: () => n.JC,
            KK: () => n.KK,
            SK: () => o,
            Vy: () => n.Vy,
            ai: () => n.ai,
            rd: () => n.rd
        })
    },
    588609(e, t, r) {
        var n = r(443811),
            a = r(348241);
        let o = () => {
                if ("u" < typeof document) return !1;
                let e = document.querySelector("meta[name=keyboard-shortcuts-preference]");
                return !e || "all" === e.content
            },
            i = e => /Enter|Arrow|Escape|Meta|Control|Mod|Esc|Tab|Home|End|Page/.test(e) || !(0, n.U0)() && e.includes("Alt") && e.includes("Shift"),
            l = new Set(["button", "checkbox", "color", "file", "hidden", "image", "radio", "range", "reset", "submit"]);

        function s(e) {
            if (!(e instanceof HTMLElement)) return !1;
            let t = e.nodeName.toLowerCase(),
                r = e.getAttribute("type") ? .toLowerCase() ? ? "text",
                n = "true" === e.ariaReadOnly || "true" === e.getAttribute("aria-readonly") || null !== e.getAttribute("readonly");
            return ("select" === t || "textarea" === t || "input" === t && !l.has(r) || e.isContentEditable) && !n
        }
        r.d(t, {
            fg: () => s
        }, {
            $$: e => {
                let t = (0, a.Vy)(e),
                    r = o() && !s(e.target);
                return i(t) || r
            },
            GI: i,
            zw: o
        })
    },
    571960(e, t, r) {
        var n = r(382500),
            a = r(474848),
            o = r(916522),
            i = r(296540),
            l = r(406187),
            s = r(592058),
            c = r(782736),
            u = r(207227),
            d = r(801093),
            m = r(54950),
            f = r(938407),
            h = r(687996),
            p = r(437443),
            g = r(124148);
        let y = (0, u.Y)(() => r.e(86851).then(r.bind(r, 776993))),
            x = () => {
                let e, t = (0, o.c)(1);
                return t[0] === Symbol.for("react.memo_cache_sentinel") ? (e = (0, a.jsxs)("div", {
                    role: "status",
                    className: "KeyboardShortcutsDialog-module__LoadingStateContainer__ZKxJs",
                    children: [(0, a.jsx)(d.A, {
                        size: "large"
                    }), (0, a.jsx)("span", {
                        className: "sr-only",
                        children: f.A.loading
                    })]
                }), t[0] = e) : e = t[0], e
            };

        function S(e) {
            let t, r, n, u, d, S = (0, o.c)(11),
                {
                    docsUrl: A
                } = e,
                [w, k] = (0, i.useState)(null),
                _ = (0, l.jE)();
            S[0] === Symbol.for("react.memo_cache_sentinel") ? (t = [], S[0] = t) : t = S[0], (0, i.useEffect)(b, t), S[1] !== _ ? (r = () => {
                let e = document.querySelector("meta[name=github-keyboard-shortcuts]") ? .content;
                k(e), _.prefetchQuery((0, c.H)(e))
            }, S[1] = _, S[2] = r) : r = S[2];
            let O = r;
            return S[3] !== O ? (n = (0, a.jsx)(s.ak, {
                commands: {
                    "global-navigation:show-shortcuts-dialog": O
                }
            }), S[3] = O, S[4] = n) : n = S[4], S[5] !== w || S[6] !== A ? (u = null !== w && (0, a.jsx)(m.l, {
                title: f.A.keyboardShortcuts,
                "aria-modal": "true",
                width: "xlarge",
                height: "large",
                onClose: () => k(null),
                className: "KeyboardShortcutsDialog-module__ShortcutsDialogRoot__Rplxi",
                children: (0, a.jsx)(h.t, {
                    fallback: (0, a.jsxs)(p.E, {
                        narrow: !0,
                        children: [(0, a.jsx)(p.E.Visual, {
                            children: (0, a.jsx)(g.AlertIcon, {
                                size: "medium"
                            })
                        }), (0, a.jsx)(p.E.Heading, {
                            children: f.A.errorTitle
                        }), (0, a.jsx)(p.E.Description, {
                            children: f.A.errorMessage
                        })]
                    }),
                    children: (0, a.jsx)(i.Suspense, {
                        fallback: (0, a.jsx)(x, {}),
                        children: (0, a.jsx)(y, {
                            contexts: w,
                            docsUrl: A
                        })
                    })
                })
            }), S[5] = w, S[6] = A, S[7] = u) : u = S[7], S[8] !== n || S[9] !== u ? (d = (0, a.jsxs)(a.Fragment, {
                children: [n, u]
            }), S[8] = n, S[9] = u, S[10] = d) : d = S[10], d
        }

        function b() {
            let e = requestIdleCallback(A);
            return () => cancelIdleCallback(e)
        }

        function A() {
            y.preload()
        }
        x.displayName = "LoadingState", S.displayName = "KeyboardShortcutsDialog", (0, n.k)("keyboard-shortcuts-dialog", {
            Component: S
        })
    },
    782736(e, t, r) {
        var n = r(57027);
        async function a(e) {
            if (void 0 === e) return null;
            let t = new URLSearchParams({
                    contexts: e
                }),
                r = await (0, n.lS)(`/site/keyboard_shortcuts?${t}`, {
                    method: "GET"
                });
            return r.ok ? r.json() : null
        }

        function o(e) {
            let t = e ? .replace(/-/g, "_");
            return {
                queryKey: ["keyboard-shortcuts", t],
                queryFn: () => a(t),
                staleTime: 1 / 0
            }
        }
        r.d(t, {
            H: () => o
        })
    },
    938407(e, t, r) {
        r.d(t, {}, {
            A: {
                keyboardShortcuts: "Keyboard shortcuts",
                siteWideShortcuts: "Site-wide shortcuts",
                loading: "Loading",
                errorTitle: "Something went wrong",
                errorMessage: "Keyboard shortcuts could not be loaded due to an unknown error. If the problem persists, please contact support."
            }
        })
    },
    991853(e, t, r) {
        r.d(t, {}, {
            l: () => void 0
        })
    },
    858051(e, t, r) {
        var n = r(916522),
            a = r(296540),
            o = r(402604),
            i = r(546856);

        function l(e) {
            let t, r, l = (0, n.c)(4),
                s = (0, a.use)(i.I);
            if (!s && !e ? .optional) throw Error("useAnalytics must be used within an AnalyticsContext");
            l[0] !== s ? (t = (e, t, r) => {
                let n = s ? {
                    react: !0,
                    app_name: s.appName,
                    category: s.category,
                    ...s.metadata
                } : {
                    react: !0
                };
                (0, o.BI)(e, { ...n,
                    ...void 0 === r ? {} : r,
                    target: t
                })
            }, l[0] = s, l[1] = t) : t = l[1];
            let c = t;
            return l[2] !== c ? (r = {
                sendAnalyticsEvent: c
            }, l[2] = c, l[3] = r) : r = l[3], r
        }

        function s() {
            let e, t, r = (0, n.c)(4),
                {
                    sendAnalyticsEvent: a
                } = l();
            r[0] !== a ? (e = e => {
                a("analytics.click", void 0, void 0 === e ? {} : e)
            }, r[0] = a, r[1] = e) : e = r[1];
            let o = e;
            return r[2] !== o ? (t = {
                sendClickAnalyticsEvent: o
            }, r[2] = o, r[3] = t) : t = r[3], t
        }
        r.d(t, {
            S: () => s,
            s: () => l
        })
    }
};
//# sourceMappingURL=chunk-lazy-react-partial-keyboard-shortcuts-dialog-d0081f734d96a0e5-80ca54fa82b8f788.js.map