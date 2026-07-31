performance.mark("js-parse-end:react-core-3438052ce3101c91.js");
export const __rspack_esm_id = 90225;
export const __rspack_esm_ids = [90225];
export const __webpack_modules__ = {
    595379(e, t, r) {
        var n = r(474848),
            o = r(916522),
            a = r(296540);

        function i(e) {
            let t, r = (0, o.c)(3),
                {
                    enabled: i,
                    mode: s,
                    children: l
                } = e,
                u = void 0 === s ? "visible" : s;
            return i ? (r[0] !== l || r[1] !== u ? (t = (0, n.jsx)(a.Activity, {
                mode: u,
                children: l
            }), r[0] = l, r[1] = u, r[2] = t) : t = r[2], t) : l
        }
        i.displayName = "ActivityBoundary", r.d(t, {
            S: () => i
        })
    },
    217931(e, t, r) {
        var n = r(474848),
            o = r(916522),
            a = r(146926),
            i = r(248742),
            s = r(180180),
            l = r(298119),
            u = r(497665),
            c = r(618360),
            d = r(61981),
            h = r(63276),
            f = r(879320);
        let p = {};

        function m(e) {
            let t, r, m, y, g, v, w = (0, o.c)(17),
                {
                    appName: b,
                    children: R,
                    dataRouterEnabled: E
                } = e,
                {
                    colorMode: x,
                    dayScheme: S,
                    nightScheme: _
                } = (0, f.A)();
            w[0] === Symbol.for("react.memo_cache_sentinel") ? (t = (0, i.SX)(), w[0] = t) : t = w[0];
            let P = t;
            return w[1] !== R ? (r = (0, n.jsx)(s.k6, {
                children: R
            }), w[1] = R, w[2] = r) : r = w[2], w[3] !== b || w[4] !== r ? (m = (0, n.jsx)(d.V, {
                appName: b,
                children: r
            }), w[3] = b, w[4] = r, w[5] = m) : m = w[5], w[6] !== E || w[7] !== m ? (y = (0, n.jsx)(c.v, {
                enabled: E,
                children: m
            }), w[6] = E, w[7] = m, w[8] = y) : y = w[8], w[9] !== x || w[10] !== S || w[11] !== _ || w[12] !== y ? (g = (0, n.jsx)(h.n, {
                children: (0, n.jsx)(l.N, {
                    colorMode: x,
                    dayScheme: S,
                    nightScheme: _,
                    contextOnly: !0,
                    children: y
                })
            }), w[9] = x, w[10] = S, w[11] = _, w[12] = y, w[13] = g) : g = w[13], w[14] !== b || w[15] !== g ? (v = (0, n.jsx)(u.Ht, {
                client: P,
                children: (0, n.jsx)(a.y, {
                    appName: b,
                    category: "",
                    metadata: p,
                    children: g
                })
            }), w[14] = b, w[15] = g, w[16] = v) : v = w[16], v
        }
        m.displayName = "BaseProviders", r.d(t, {
            U: () => m
        })
    },
    465780(e, t, r) {
        r.d(t, {
            h: () => c
        });
        var n = r(474848),
            o = r(916522),
            a = r(837866),
            i = r(180180),
            s = r(296540),
            l = r(295764);

        function u(e) {
            let t, r, n, a = (0, o.c)(6),
                {
                    ssrError: u
                } = e,
                {
                    addToast: c
                } = (0, i.Y6)(),
                d = l.z[u.textContent || ""];
            a[0] !== c || a[1] !== d ? (t = () => {
                d || c({
                    type: "error",
                    message: "SSR failed, see console for error details (Staff Only)"
                })
            }, a[0] = c, a[1] = d, a[2] = t) : t = a[2];
            let h = (0, s.useEffectEvent)(t);
            return a[3] !== h ? (r = () => {
                h()
            }, a[3] = h, a[4] = r) : r = a[4], a[5] === Symbol.for("react.memo_cache_sentinel") ? (n = [], a[5] = n) : n = a[5], (0, s.useEffect)(r, n), null
        }

        function c(e) {
            let t, r, i, s = (0, o.c)(5),
                {
                    ssrError: l
                } = e;
            return s[0] === Symbol.for("react.memo_cache_sentinel") ? (t = (0, n.jsx)(a.V, {}), s[0] = t) : t = s[0], s[1] !== l ? (r = l && (0, n.jsx)(u, {
                ssrError: l
            }), s[1] = l, s[2] = r) : r = s[2], s[3] !== r ? (i = (0, n.jsxs)(n.Fragment, {
                children: [t, r]
            }), s[3] = r, s[4] = i) : i = s[4], i
        }
        u.displayName = "SSRErrorToast", c.displayName = "CommonElements"
    },
    687996(e, t, r) {
        var n = r(474848),
            o = r(916522),
            a = r(546856),
            i = r(296540),
            s = r(49831);
        let l = Symbol.for("errorBoundaryMetadata");
        class u extends i.Component {
            constructor(e) {
                super(e), this.state = {
                    error: null
                }
            }
            static getDerivedStateFromError(e) {
                return {
                    error: e
                }
            }
            componentDidCatch(e) {
                let t = {
                        critical: this.props.critical || !1,
                        reactAppName: this.props.appName,
                        reactErrorBoundaryName: this.props.boundaryName
                    },
                    r = {
                        critical: this.props.critical,
                        boundaryName: this.props.boundaryName,
                        hasCustomHandler: "function" == typeof this.props.onError
                    };
                e[l] = r, "function" == typeof this.props.onError && this.props.onError(e, t)
            }
            render() {
                return this.state.error ? void 0 === this.props.fallback ? (0, n.jsx)(s.M, {
                    type: "httpError"
                }) : this.props.fallback : this.props.children
            }
        }

        function c(e) {
            let t, r = (0, o.c)(3),
                s = i.use(a.I),
                l = e.appName || s ? .appName;
            return r[0] !== l || r[1] !== e ? (t = (0, n.jsx)(u, { ...e,
                appName: l
            }), r[0] = l, r[1] = e, r[2] = t) : t = r[2], t
        }
        c.displayName = "ErrorBoundary", r.d(t, {
            t: () => c
        }, {
            g: l
        })
    },
    49831(e, t, r) {
        r.d(t, {
            M: () => s
        });
        var n = r(474848),
            o = r(916522),
            a = r(978595);
        let i = {
            404: "Didn\u2019t find anything here!",
            500: "Looks like something went wrong!"
        };

        function s(e) {
            let t, r, s, l = (0, o.c)(7),
                {
                    httpStatus: u,
                    type: c
                } = e,
                d = "fetchError" === c ? "Looks like network is down!" : i[u || 500];
            return l[0] !== u ? (t = u ? (0, n.jsx)("div", {
                className: "ErrorPage-module__Status__qiBNt",
                children: u
            }) : null, l[0] = u, l[1] = t) : t = l[1], l[2] !== d ? (r = (0, n.jsx)("div", {
                className: "ErrorPage-module__Message__zz8Qu",
                children: d
            }), l[2] = d, l[3] = r) : r = l[3], l[4] !== t || l[5] !== r ? (s = (0, n.jsxs)(a.A, {
                as: "h1",
                tabIndex: -1,
                className: "ErrorPage-module__Heading__seAzU",
                children: ["Error", t, r]
            }), l[4] = t, l[5] = r, l[6] = s) : s = l[6], s
        }
        s.displayName = "ErrorPage"
    },
    744035(e, t, r) {
        var n = r(474848),
            o = r(916522),
            a = r(566010);
        let i = e => {
            let t, r, i = (0, o.c)(5),
                {
                    children: s,
                    features: l
                } = e;
            i[0] !== l ? (t = {
                enabled_features: l
            }, i[0] = l, i[1] = t) : t = i[1];
            let u = t;
            return i[2] !== s || i[3] !== u ? (r = (0, n.jsx)(a.z, {
                value: u,
                children: s
            }), i[2] = s, i[3] = u, i[4] = r) : r = i[4], r
        };
        i.displayName = "FeatureFlagProvider", r.d(t, {}, {
            s: i
        })
    },
    156401(e, t, r) {
        var n = r(374395),
            o = r(327905);

        function a({
            path: e,
            Component: t,
            shouldNavigateOnError: r,
            transitionType: i,
            children: s
        }) {
            return {
                path: e,
                Component: t,
                coreLoader: async function e({
                    location: t
                }) {
                    let a;
                    try {
                        let e = `${t.pathname}${t.search}`;
                        a = await window.fetch(e, {
                            headers: {
                                Accept: "application/json",
                                ...(0, n.kt)(),
                                "X-GitHub-Target": "dotcom",
                                "X-React-Router": "json",
                                ...(0, n.jC)("navigator")
                            }
                        });
                        let r = a ? .headers ? .get("X-Github-Request-Id");
                        r && (0, o.Ex)(r)
                    } catch {
                        return {
                            type: r ? "route-handled-error" : "error",
                            error: {
                                type: "fetchError"
                            }
                        }
                    }
                    if (a.redirected) return {
                        type: "redirect",
                        url: a.url
                    };
                    if (!a.ok) return {
                        type: r ? "route-handled-error" : "error",
                        error: {
                            type: "httpError",
                            httpStatus: a.status
                        }
                    };
                    try {
                        let e = await a.json();
                        return {
                            type: "loaded",
                            data: e,
                            title: e.title
                        }
                    } catch {
                        return {
                            type: r ? "route-handled-error" : "error",
                            error: {
                                type: "badResponseError"
                            }
                        }
                    }
                },
                loadFromEmbeddedData: function({
                    embeddedData: e
                }) {
                    return {
                        data: e,
                        title: e.title
                    }
                },
                transitionType: i,
                children: s
            }
        }
        r.d(t, {
            a: () => a
        })
    },
    90314(e, t, r) {
        var n = r(685136);
        r.d(t, {
            N: () => n.cD,
            k: () => n.Zm
        })
    },
    74719(e, t, r) {
        var n = r(474848),
            o = r(916522),
            a = r(217931),
            i = r(465780),
            s = r(687996),
            l = r(775098);
        let u = [];

        function c(e) {
            let t, r, c, d, h = (0, o.c)(11),
                {
                    partialName: f,
                    onError: p,
                    children: m,
                    ssrError: y
                } = e;
            return h[0] !== y ? (t = (0, n.jsx)(i.h, {
                ssrError: y
            }), h[0] = y, h[1] = t) : t = h[1], h[2] !== m || h[3] !== t ? (r = (0, n.jsxs)(l.d, {
                routes: u,
                children: [m, t]
            }), h[2] = m, h[3] = t, h[4] = r) : r = h[4], h[5] !== p || h[6] !== r ? (c = (0, n.jsx)(s.t, {
                onError: p,
                children: r
            }), h[5] = p, h[6] = r, h[7] = c) : c = h[7], h[8] !== f || h[9] !== c ? (d = (0, n.jsx)(a.U, {
                appName: f,
                dataRouterEnabled: !1,
                children: c
            }), h[8] = f, h[9] = c, h[10] = d) : d = h[10], d
        }
        c.displayName = "PartialEntry", r.d(t, {
            c: () => c
        })
    },
    996060(e, t, r) {
        var n = r(474848),
            o = r(916522),
            a = r(916284),
            i = r(685136),
            s = r(296540);

        function l(e) {
            let t, r, l, u = (0, o.c)(8),
                {
                    children: c,
                    partialName: d
                } = e,
                h = (0, i.Ri)();
            if (u[0] !== h || u[1] !== d ? (t = () => {
                    h && (0, a.N7)(Error(`PartialRouter used inside another Router in partial "${d}"`))
                }, r = [h, d], u[0] = h, u[1] = d, u[2] = t, u[3] = r) : (t = u[2], r = u[3]), (0, s.useEffect)(t, r), h) {
                let e;
                return u[4] !== c ? (e = (0, n.jsx)(n.Fragment, {
                    children: c
                }), u[4] = c, u[5] = e) : e = u[5], e
            }
            return u[6] !== c ? (l = (0, n.jsx)(i.Kd, {
                children: c
            }), u[6] = c, u[7] = l) : l = u[7], l
        }
        l.displayName = "PartialRouter", r.d(t, {
            p: () => l
        })
    },
    63276(e, t, r) {
        var n = r(474848),
            o = r(916522),
            a = r(432231),
            i = r(950279);

        function s(e) {
            let t, r, s = (0, o.c)(3),
                {
                    children: l
                } = e;
            if (s[0] === Symbol.for("react.memo_cache_sentinel")) {
                for (let e of (t = {}, (0, a.fQ)())) e.startsWith("primer_react_") && (t[e] = !0);
                s[0] = t
            } else t = s[0];
            let u = t;
            return s[1] !== l ? (r = (0, n.jsx)(i.g, {
                flags: u,
                children: l
            }), s[1] = l, s[2] = r) : r = s[2], r
        }
        r(296540), s.displayName = "PrimerFeatureFlags", r.d(t, {
            n: () => s
        })
    },
    97210(e, t, r) {
        r.d(t, {
            VM: () => x,
            fD: () => R,
            JP: () => S
        });
        var n = r(474848),
            o = r(916522),
            a = r(991853),
            i = r(296540),
            s = r(826099),
            l = r(115927),
            u = r(997270);
        let c = {
                actualDuration: "BROWSER_REACT_PROFILER_APP_ACTUAL_DURATION",
                baseDuration: "BROWSER_REACT_PROFILER_APP_BASE_DURATION",
                commitLag: "BROWSER_REACT_PROFILER_APP_COMMIT_LAG",
                renderEfficiency: "BROWSER_REACT_PROFILER_APP_RENDER_EFFICIENCY"
            },
            d = {
                actualDuration: "BROWSER_REACT_PROFILER_ROUTE_ACTUAL_DURATION",
                baseDuration: "BROWSER_REACT_PROFILER_ROUTE_BASE_DURATION",
                commitLag: "BROWSER_REACT_PROFILER_ROUTE_COMMIT_LAG",
                renderEfficiency: "BROWSER_REACT_PROFILER_ROUTE_RENDER_EFFICIENCY"
            },
            h = {
                mount: .2,
                update: .02,
                "nested-update": .2
            },
            f = {
                mount: 50,
                update: 32,
                "nested-update": 16
            };

        function p(e, t, r, n) {
            return t > (f[e] ? ? 50) || r > 50 || n < h[e]
        }

        function m(e, t, r, n, o) {
            let a = window.location.href;
            (0, s.au)({
                name: e.actualDuration,
                value: r,
                tags: t,
                requestUrl: a
            }, !1, 1), (0, s.au)({
                name: e.baseDuration,
                value: n,
                tags: t,
                requestUrl: a
            }, !1, 1), (0, s.au)({
                name: e.commitLag,
                value: o,
                tags: t,
                requestUrl: a
            }, !1, 1), n > 0 && (0, s.au)({
                name: e.renderEfficiency,
                value: r / n,
                tags: t,
                requestUrl: a
            }, !1, 1)
        }
        let y = null;

        function g() {
            return "u" < typeof window ? 1 : (null === y && (y = Math.random()), y)
        }
        let v = () => {},
            w = {
                onAppRender: v,
                onRouteRender: v,
                isEnabled: !1
            },
            b = (0, i.createContext)(null);
        b.displayName = "ProfilerContext";
        let R = (0, i.memo)(function(e) {
            let t, r, a = (0, o.c)(6),
                {
                    isDataRouterEnabled: s,
                    appName: h,
                    children: f
                } = e;
            a[0] !== h || a[1] !== s ? (t = {
                appName: h,
                isDataRouterEnabled: s
            }, a[0] = h, a[1] = s, a[2] = t) : t = a[2];
            let y = function(e) {
                let t, r = (0, o.c)(9),
                    {
                        appName: n,
                        isDataRouterEnabled: a
                    } = e;
                e: {
                    let e, o, s;
                    if (!(0, u.I)()) {
                        t = w;
                        break e
                    }
                    r[0] !== n || r[1] !== a ? (e = (e, t, r, o, s, u) => {
                        requestIdleCallback(() => {
                            let e = u - s;
                            p(t, r, e, g()) && function({
                                actualDuration: e,
                                baseDuration: t,
                                commitLag: r,
                                phase: n,
                                appName: o,
                                isDataRouterEnabled: a
                            }) {
                                m(c, {
                                    phase: n,
                                    appName: o,
                                    isDataRouterEnabled: String(a),
                                    reactVersion: i.version,
                                    subAppName: (0, l.f)() ? ? o
                                }, e, t, r)
                            }({
                                actualDuration: r,
                                baseDuration: o,
                                commitLag: e,
                                phase: t,
                                appName: n,
                                isDataRouterEnabled: a
                            })
                        }, {
                            timeout: 2e3
                        })
                    }, r[0] = n, r[1] = a, r[2] = e) : e = r[2];
                    let h = e;r[3] !== n || r[4] !== a ? (o = (e, t, r, o, s, u) => {
                        requestIdleCallback(() => {
                            let c = u - s;
                            p(t, r, c, g()) && function({
                                actualDuration: e,
                                baseDuration: t,
                                commitLag: r,
                                phase: n,
                                appName: o,
                                isDataRouterEnabled: a,
                                routeId: s
                            }) {
                                m(d, {
                                    phase: n,
                                    appName: o,
                                    routeId: s,
                                    isDataRouterEnabled: String(a),
                                    reactVersion: i.version,
                                    subAppName: (0, l.f)() ? ? o
                                }, e, t, r)
                            }({
                                actualDuration: r,
                                baseDuration: o,
                                commitLag: c,
                                phase: t,
                                appName: n,
                                isDataRouterEnabled: a,
                                routeId: e
                            })
                        }, {
                            timeout: 2e3
                        })
                    }, r[3] = n, r[4] = a, r[5] = o) : o = r[5];
                    let f = o;r[6] !== h || r[7] !== f ? (s = {
                        onAppRender: h,
                        onRouteRender: f,
                        isEnabled: !0
                    }, r[6] = h, r[7] = f, r[8] = s) : s = r[8],
                    t = s
                }
                return t
            }(t);
            return a[3] !== f || a[4] !== y ? (r = (0, n.jsx)(b, {
                value: y,
                children: f
            }), a[3] = f, a[4] = y, a[5] = r) : r = a[5], r
        });
        R.displayName = "ProfilerProvider";
        let E = (0, i.memo)(function(e) {
            let t, r, s = (0, o.c)(4),
                {
                    id: l,
                    children: u,
                    profilerType: c
                } = e,
                d = (r = (0, i.use)(b)) ? "app" === c ? r.onAppRender : r.onRouteRender : a.l;
            return s[0] !== u || s[1] !== l || s[2] !== d ? (t = (0, n.jsx)(i.Profiler, {
                id: l,
                onRender: d,
                children: u
            }), s[0] = u, s[1] = l, s[2] = d, s[3] = t) : t = s[3], t
        });
        E.displayName = "Profiler";
        let x = (0, i.memo)(function(e) {
            let t, r = (0, o.c)(3),
                {
                    id: a,
                    children: i
                } = e;
            return r[0] !== i || r[1] !== a ? (t = (0, n.jsx)(E, {
                id: a,
                profilerType: "app",
                children: i
            }), r[0] = i, r[1] = a, r[2] = t) : t = r[2], t
        });
        x.displayName = "AppProfiler";
        let S = (0, i.memo)(function(e) {
            let t, r = (0, o.c)(3),
                {
                    id: a,
                    children: i
                } = e;
            return r[0] !== i || r[1] !== a ? (t = (0, n.jsx)(E, {
                id: a,
                profilerType: "route",
                children: i
            }), r[0] = i, r[1] = a, r[2] = t) : t = r[2], t
        });
        S.displayName = "RouteProfiler"
    },
    722484(e, t, r) {
        var n = r(331635),
            o = r(474848),
            a = r(651135),
            i = r(916284),
            s = r(991853),
            l = r(827927),
            u = r(147966),
            c = r(826099),
            d = r(115927),
            h = r(296540),
            f = r(205338),
            p = r(295764),
            m = r(381098),
            y = r(997270),
            g = r(747297);
        let v = (0, y.I)() ? r.e(93262).then(r.t.bind(r, 487335, 19)) : null,
            w = {
                dataType: "track-entry",
                track: "React root",
                trackGroup: "Performance Timeline",
                color: "primary"
            };

        function b(e, t) {
            return {
                detail: {
                    devtools: { ...w,
                        tooltipText: e,
                        ...t ? {
                            color: t
                        } : {}
                    }
                }
            }
        }

        function R(e, t, r) {
            try {
                performance.measure(e, {
                    start: t,
                    ...r ? .detail ? {
                        detail: r.detail
                    } : {}
                })
            } catch {}
        }
        class E extends HTMLElement {#
            e;
            get name() {
                return this.getAttribute(this.nameAttribute)
            }
            get# t() {
                let e = this.embeddedData ? .textContent;
                if (!e) throw Error(`No embedded data provided for react element ${this.name}`);
                return e
            }
            get hasSSRContent() {
                return "true" === this.getAttribute("data-ssr")
            }
            get attemptedSSR() {
                return "true" === this.getAttribute("data-attempted-ssr")
            }#
            r = null;
            connectedCallback() {
                if (("app-name" === this.nameAttribute || "repos-overview" === this.name) && (0, c.UR)(this.name, this.hasSSRContent), "partial-name" !== this.nameAttribute && "issues-react" === this.name && navigator.serviceWorker ? .controller && u.cg) {
                    performance.mark(`react-root:sw-prefetch-start:${this.name}`);
                    let e = this.name;
                    this.#r = (async () => {
                        await (0, l.X7)(u.cg.location.href || ""), performance.measure(`react-root:sw-prefetch(${e})`, {
                            start: `react-root:sw-prefetch-start:${e}`,
                            ...b(`SW prefetch (${e})`)
                        })
                    })()
                }
                performance.mark(`react-root:parse-data-start:${this.name}`), this.embeddedDataJSON = JSON.parse(this.#t), performance.measure(`react-root:parse-data(${this.name})`, {
                    start: `react-root:parse-data-start:${this.name}`,
                    ...b(`Parse data (${this.name})`)
                }), this.#n()
            }
            disconnectedCallback() {
                this.#e ? .unmount(), this.#e = void 0
            }#
            o() {
                let e = this.name,
                    t = ({
                        children: e,
                        onCommit: t
                    }) => {
                        let r = (0, h.useEffectEvent)(t);
                        return (0, h.useEffect)(() => r ? .() ? ? void 0, []), e
                    };
                return t.displayName = `${this.tagName}(${e})`, t
            }#
            a({
                requestUrl: e,
                duration: t
            }) {
                (0, c.au)({
                    requestUrl: e,
                    name: "BROWSER_REACT_HYDRATION_DURATION",
                    value: t,
                    tags: {
                        appName: this.name,
                        reactVersion: h.version,
                        renderType: this.hasSSRContent ? "hydrateRoot" : "createRoot",
                        subAppName: (0, d.f)() ? ? this.name
                    }
                })
            }#
            i() {
                try {
                    let e = window.performance.now(),
                        t = window.location.href;
                    return () => {
                        let r = window.performance.now() - e;
                        this.#a({
                            requestUrl: t,
                            duration: r
                        })
                    }
                } catch {
                    return s.l
                }
            }
            async# n() {
                let e = this.reactRoot;
                if (!e) throw Error("No react root provided");
                performance.mark(`react-root:start:${this.name}`);
                let t = !1,
                    r = (e, r = {}) => {
                        t = !0;
                        let n = {
                            critical: !0,
                            reactAppName: this.name,
                            ...r
                        };
                        setTimeout(() => {
                            (0, i.N7)(e, n)
                        })
                    },
                    n = this.embeddedDataJSON,
                    a = this.ssrError ? .textContent;
                this.#r && await this.#r, performance.mark(`react-root:get-node-start:${this.name}`);
                let s = await this.getReactNode(n, r);
                performance.measure(`react-root:get-node(${this.name})`, {
                    start: `react-root:get-node-start:${this.name}`,
                    ...b(`Get node (${this.name})`)
                }), a && this.#s(a);
                let l = this.#i(),
                    u = this.classList,
                    d = this.name,
                    p = this.#o(),
                    m = (0, o.jsx)(h.StrictMode, {
                        children: (0, o.jsx)(p, {
                            onCommit: () => {
                                let e;
                                performance.mark(`react-root:commit:${d}`), R(`react-root:commit(${d})`, `react-root:render-start:${d}`, b(`Commit (${d})`, "secondary")), R(`react-root:total(${d})`, `react-root:start:${d}`, b(`Total (${d})`)), l();
                                let t = window.requestAnimationFrame(() => {
                                    e = window.requestIdleCallback(() => {
                                        u.add("loaded")
                                    })
                                });
                                return () => {
                                    cancelAnimationFrame(t), void 0 !== e && cancelIdleCallback(e)
                                }
                            },
                            children: s
                        })
                    });
                if (this.hasSSRContent) {
                    let r = [...this.querySelectorAll('link[data-remove-after-hydration="true"]')];
                    for (let e of r) document.head.appendChild(e);
                    let n = v ? await v : {
                            createRoot: f.createRoot,
                            hydrateRoot: f.hydrateRoot
                        },
                        o = () => {
                            performance.mark(`react-root:render-start:${this.name}`), this.#e = n.hydrateRoot(e, m, (0, g.xx)({
                                appName: this.name,
                                onHydrationError: () => {
                                    t = !0
                                }
                            }))
                        };
                    (0, h.startTransition)(o), r.length > 0 && requestIdleCallback(() => {
                        for (let e of r) e.parentElement ? .removeChild(e)
                    }), (0, c.iv)({
                        incrementKey: "REACT_RENDER",
                        incrementTags: {
                            appName: this.name,
                            csr: !1,
                            error: t,
                            ssr: !0,
                            ssrError: !1
                        }
                    })
                } else {
                    let r = (v ? await v : {
                        createRoot: f.createRoot,
                        hydrateRoot: f.hydrateRoot
                    }).createRoot(e, (0, g.xx)({
                        appName: this.name
                    }));
                    this.#e = r, (0, h.startTransition)(() => {
                        performance.mark(`react-root:render-start:${this.name}`), r.render(m)
                    }), (0, c.iv)({
                        incrementKey: "REACT_RENDER",
                        incrementTags: {
                            appName: this.name,
                            csr: !0,
                            error: t,
                            ssr: this.attemptedSSR,
                            ssrError: !!this.ssrError
                        }
                    })
                }
            }#
            s(e) {
                if ((0, m.G)()) {
                    if (p.z[e]) return console.error("SSR failed with an expected error:", p.z[e]);
                    try {
                        let t = JSON.parse(e),
                            r = function(e) {
                                if (!e.stacktrace) return "";
                                let t = "\n ";
                                return e.stacktrace.map(e => {
                                    let {
                                        function: r,
                                        filename: n,
                                        lineno: o,
                                        colno: a
                                    } = e, i = `${t} at ${r} (${n}:${o}:${a})`;
                                    return t = " ", i
                                }).join("\n")
                            }(t);
                        console.error("Error During Alloy SSR:", `${this.tagName.toLowerCase()}[${this.name}]`, `${t.type}: ${t.value}
`, t, r)
                    } catch {
                        console.error("Error During Alloy SSR:", `${this.tagName.toLowerCase()}[${this.name}]`, e, "unable to parse as json")
                    }
                }
            }
        }(0, n.Cg)([a.aC], E.prototype, "embeddedData", void 0), (0, n.Cg)([a.aC], E.prototype, "ssrError", void 0), (0, n.Cg)([a.aC], E.prototype, "reactRoot", void 0), r.d(t, {
            H: () => E
        })
    },
    775098(e, t, r) {
        r.d(t, {
            d: () => i
        });
        var n = r(474848),
            o = r(916522),
            a = r(685136);

        function i(e) {
            let t, r, i = (0, o.c)(5),
                {
                    routes: s,
                    children: l
                } = e;
            i[0] !== s ? (t = {
                routes: s
            }, i[0] = s, i[1] = t) : t = i[1];
            let u = t;
            return i[2] !== u || i[3] !== l ? (r = (0, n.jsx)(a.kq, {
                value: u,
                children: l
            }), i[2] = u, i[3] = l, i[4] = r) : r = i[4], r
        }
        i.displayName = "RoutesContextProvider"
    },
    250744(e, t, r) {
        r.d(t, {}, {
            E: {
                FETCH_THEN_TRANSITION: "fetch-then-transition",
                TRANSITION_WHILE_FETCHING: "transition-while-fetch",
                TRANSITION_WITHOUT_FETCH: "transition-without-fetch"
            }
        })
    },
    406637(e, t, r) {
        class n {#
            l = new Map;
            register(e, t) {
                let r = this.#l.get(e);
                if (r) r.resolve(t);
                else {
                    let r = Promise.withResolvers();
                    r.resolve(t), this.#l.set(e, r)
                }
            }
            getRegistration(e) {
                let t = this.#l.get(e);
                if (t) return t;
                let r = Promise.withResolvers();
                return this.#l.set(e, r), r
            }
        }
        r.d(t, {
            R: () => n
        })
    },
    295764(e, t, r) {
        r.d(t, {}, {
            z: {
                "Workers not ready": "Alloy is warming its workers. This is expected during deploys and should resolve shortly."
            }
        })
    },
    618360(e, t, r) {
        var n = r(474848),
            o = r(916522);
        let a = (0, r(296540).createContext)(!1);

        function i(e) {
            let t, r = (0, o.c)(3),
                {
                    enabled: i,
                    children: s
                } = e;
            return r[0] !== s || r[1] !== i ? (t = (0, n.jsx)(a, {
                value: i,
                children: s
            }), r[0] = s, r[1] = i, r[2] = t) : t = r[2], t
        }
        a.displayName = "IsDataRouterEnabledContext", i.displayName = "IsDataRouterEnabledContextProvider", r.d(t, {
            v: () => i
        }, {
            e: a
        })
    },
    61981(e, t, r) {
        var n = r(474848),
            o = r(916522),
            a = r(916284),
            i = r(296540),
            s = r(693563);
        let l = (0, i.createContext)(null);
        l.displayName = "ReportErrorContext";
        let u = (0, i.memo)(function(e) {
            let t, r, i = (0, o.c)(6),
                {
                    appName: u,
                    children: c,
                    critical: d
                } = e;
            i[0] !== d || i[1] !== u ? (t = (e, t) => {
                if (e) return (0, s.k)(e, e => {
                    (0, a.N7)(e, {
                        critical: d,
                        reactAppName: u,
                        ...t
                    })
                })
            }, i[0] = d, i[1] = u, i[2] = t) : t = i[2];
            let h = t;
            return i[3] !== c || i[4] !== h ? (r = (0, n.jsx)(l, {
                value: h,
                children: c
            }), i[3] = c, i[4] = h, i[5] = r) : r = i[5], r
        });

        function c() {
            let e = (0, i.use)(l);
            if (null == e) throw Error("useReportErrorContext must be used within a ReportErrorContextProvider");
            return e
        }
        u.displayName = "ReportErrorContextProvider", r.d(t, {
            l: () => c
        }, {
            V: u
        })
    },
    451237(e, t, r) {
        var n = r(685136),
            o = r(296540),
            a = r(437901);
        let i = (0, o.memo)(function() {
            let e = (0, n.zy)(),
                t = !!(0, n.cq)().location;
            return (0, a.n)(e, t, null), null
        });
        i.displayName = "SoftNavLifecycleListener";
        let s = (0, o.memo)(function() {
            let e = (0, n.zy)();
            return (0, a.n)(e, !1, null), null
        });
        s.displayName = "SoftNavLifecycleListenerLegacy", r.d(t, {}, {
            e: i,
            f: s
        })
    },
    712396(e, t, r) {
        r.d(t, {
            T: () => u
        });
        var n, o = r(685136),
            a = r(191968),
            i = n || (n = {});

        function s(e) {
            var t = e.pathname;
            t = void 0 === t ? "/" : t;
            var r = e.search;
            return r = void 0 === r ? "" : r, e = void 0 === (e = e.hash) ? "" : e, r && "?" !== r && (t += "?" === r.charAt(0) ? r : "?" + r), e && "#" !== e && (t += "#" === e.charAt(0) ? e : "#" + e), t
        }
        i.Pop = "POP", i.Push = "PUSH", i.Replace = "REPLACE";
        let l = ["_features", "_tracing"];

        function u(e) {
            return new Proxy(e, {
                get: (e, t, r) => "navigate" === t ? function(t, r) {
                    var n, i;
                    if ("number" == typeof t) return e.navigate(t);
                    let u = e.state.location,
                        d = "string" == typeof t ? function(e) {
                            var t = {};
                            if (e) {
                                var r = e.indexOf("#");
                                0 <= r && (t.hash = e.substr(r), e = e.substr(0, r)), 0 <= (r = e.indexOf("?")) && (t.search = e.substr(r), e = e.substr(0, r)), e && (t.pathname = e)
                            }
                            return t
                        }(t) : t,
                        h = function(e) {
                            if (!e) return null;
                            let t = new URLSearchParams(window.location.search),
                                r = new URLSearchParams(e.search || ""),
                                n = !1;
                            for (let e of l) {
                                let o = t.get(e);
                                o && !r.has(e) && (r.set(e, o), n = !0)
                            }
                            if (!n) return e;
                            let o = r.toString();
                            return s({ ...e,
                                search: o ? `?${o}` : ""
                            })
                        }(d),
                        f = h ? function(e, t, r) {
                            try {
                                var n, a;
                                if (e.state ? .loaderData ? .codeViewLayoutRoute && r ? .pathname && (n = t.pathname, a = r.pathname, n.split("/", 3).join("/") !== a.split("/", 3).join("/"))) return "reload";
                                let i = r ? .pathname;
                                if (i ? .startsWith("/") && !(0, o.ue)(e.routes, i)) return "turbo";
                                return
                            } catch {
                                return "reload"
                            }
                        }(e, u, d) : void 0;
                    if (h && f) {
                        let e = "string" == typeof h ? h : s(h);
                        return "reload" === f ? (c.hardNavigate(e), Promise.resolve()) : c.turboNavigate(e)
                    }
                    let p = (n = u, !!(i = d) && (void 0 === i.pathname || i.pathname === n.pathname) && (void 0 === i.search || i.search === n.search) && void 0 !== i.hash && i.hash !== n.hash);
                    p || (0, a.SC)("react");
                    let m = !r ? .replace,
                        y = r ? .state ? .skipTurbo;
                    return e.navigate(h, { ...r,
                        preventScrollReset: !!p || r ? .preventScrollReset,
                        state: { ...r ? .state,
                            skipTurbo : m ? y ? ? !0 : y
                        }
                    })
                } : Reflect.get(e, t, r)
            })
        }
        let c = {
            hardNavigate(e) {
                window.location.href = e
            },
            async turboNavigate(e) {
                let {
                    softNavigate: t
                } = await r.e(55096).then(r.bind(r, 737131));
                t(e)
            }
        }
    },
    231179(e, t, r) {
        var n = r(372403),
            o = r(402604),
            a = r(854551),
            i = r(445052),
            s = r(975530),
            l = r(945211);
        class u {
            name;
            tanStackRouterEnabled;#
            u;
            embeddedData;
            constructor(e, t, r = {}) {
                this.name = e, this.tanStackRouterEnabled = r.tanStackRouterEnabled ? ? !1, this.#u = t, this.registration = this.registration.bind(this)
            }
            registration(e) {
                return this.embeddedData = e ? .embeddedData, {
                    routes: this.#c()
                }
            }#
            c() {
                if ("function" == typeof this.#u) {
                    let e = e => {
                        let t = this.embeddedData ? .appPayload ? .enabled_features;
                        if (t && e in t) return t[e]
                    };
                    return this.#u({
                        isEnabled: e
                    })
                }
                return this.#u
            }
        }
        class c {
            static create(e, t) {
                return new c(e, t)
            }
            name;#
            d;#
            h;
            constructor(e, t) {
                this.name = e, this.#d = t ? .queryKeyAppName
            }
            getEmbeddedData = () => {
                if (!this.#h) throw Error("getEmbeddedData should only be called after createDataRouterAppFromRoutes");
                return this.#h.embeddedData
            };
            createDataRouterAppFromRoutes(e, t) {
                return this.#h = new u(this.name, e, t), this.#h
            }
            createQueryRouteConfig(e, {
                path: t,
                index: r,
                queries: u,
                shouldRevalidate: c,
                tanStackRouterOptions: f
            }) {
                var p, m;
                let y;
                return function(e) {
                    if (!/^[a-z][a-zA-Z0-9]*$/.test(e)) throw new h(e)
                }(e), new l.Wy({
                    appName: this.name,
                    getAppName: this.#d,
                    id: e,
                    path: t,
                    queries: (p = u ? ? [], m = e, y = new Set, Object.fromEntries(p.map(e => {
                        let {
                            queryName: t,
                            ...r
                        } = "function" == typeof e ? e(m) : e;
                        if (y.has(t)) throw new d(t);
                        y.add(t);
                        let {
                            schema: l,
                            persister: u
                        } = r;
                        if (!r.queryFn && !l) throw Error(`Route query "${t}" must define either \`queryFn\` or \`schema\`.`);
                        if (l && r.queryFn) throw Error(`Route query "${t}" cannot define both \`schema\` and \`queryFn\`.`);
                        if (!l && (0, a.uH)(u)) throw Error(`Route query "${t}" cannot define a persister config without a schema.`);
                        if (l) {
                            let e = async e => (0, s.Xb)(e, {
                                    schema: l
                                }),
                                c = u;
                            return (0, a.uH)(u) && (c = (0, a.qA)({ ...u,
                                schema: l,
                                sendAnalyticsEvent: (e, r, n = {}) => {
                                    (0, o.BI)(e, {
                                        queryName: t,
                                        routeId: m,
                                        ...n,
                                        target: r
                                    })
                                }
                            })), [t, { ...r,
                                queryFn: e,
                                persister: c,
                                [i.H]: (e, r) => (0, n.Rf)({
                                    schema: l,
                                    raw: e,
                                    routeId: r,
                                    queryName: t
                                })
                            }]
                        }
                        return [t, r]
                    }))),
                    index: r ? ? !1,
                    getEmbeddedData: this.getEmbeddedData,
                    shouldRevalidate: c,
                    tanStackRouterOptions: f
                })
            }
        }
        class d extends Error {
            constructor(e) {
                super(`query names cannot be duplicated: \`${e}\` has already been defined for this route.`), this.name = "DuplicateRouteQueryNameError"
            }
        }
        class h extends Error {
            constructor(e) {
                super(`\`${e}\` must be camel cased`), this.name = "InvalidIdentifierError"
            }
        }
        r.d(t, {
            $h: () => c
        })
    },
    445052(e, t, r) {
        let n = Symbol("decodeEmbeddedProto");
        r.d(t, {}, {
            H: n,
            g: {
                Blocking: "Blocking",
                Deferred: "Deferred"
            }
        })
    },
    884904(e, t, r) {
        var n = r(372403),
            o = r(374395),
            a = r(445052),
            i = r(975530);

        function s({ ...e
        } = {}) {
            var t;
            let {
                schema: r,
                adapt: l,
                ...u
            } = e;
            return {
                queryName: "mainQuery",
                queryDeps: ({
                    pathname: e
                }) => ({
                    pathname: e
                }),
                queryFn: e.queryFn ? ? (async ({
                    routeId: t,
                    queryDeps: a
                }) => {
                    let s = (0, o.jC)("dataRouter"),
                        l = { ...a,
                            pathname: e.encodeFetchPath ? a.pathname.split("/").map(encodeURIComponent).join("/") : a.pathname,
                            init: { ...a ? .init,
                                headers : { ...s,
                                    ...a ? .init ? .headers
                                }
                            }
                        },
                        {
                            json: u,
                            isProtoJson: c
                        } = await (0, i.Dr)({
                            queryDeps: l
                        });
                    return function(e, t, {
                        schema: r,
                        isProtoJson: o
                    } = {
                        isProtoJson: !1
                    }) {
                        let a = e.payload ? .[t];
                        if (!a) throw Error(`Unable to find payload for route Id: ${t}`);
                        return {
                            meta: e.meta,
                            payload: r && o ? (0, n.Rf)({
                                schema: r,
                                raw: a,
                                routeId: t,
                                queryName: "mainQuery"
                            }) : a
                        }
                    }(u, t, {
                        schema: r,
                        isProtoJson: c
                    })
                }),
                type: a.g.Blocking,
                select: (t = l, e => {
                    let r = e.payload;
                    return "object" == typeof r && null !== r && "$typeName" in r || !t ? r : t(r)
                }),
                [a.H]: r ? (e, t) => (0, n.Rf)({
                    schema: r,
                    raw: e,
                    routeId: t,
                    queryName: "mainQuery"
                }) : void 0,
                ...u
            }
        }
        r.d(t, {
            Y: () => s
        })
    },
    975530(e, t, r) {
        var n = r(164636),
            o = r(372403),
            a = r(73019),
            i = r(826099),
            s = r(57027),
            l = r(725846),
            u = r(407904);
        async function c(e, t) {
            let {
                result: r
            } = t ? await h(e, t) : await h(e);
            return r
        }
        async function d(e) {
            let {
                json: t,
                isProtoJson: r
            } = await f(e);
            return (0, n.Av)(t), {
                json: t,
                isProtoJson: r
            }
        }
        async function h(e, t) {
            let r = performance.now(),
                {
                    json: a,
                    isProtoJson: s,
                    headers: l
                } = await f(e);
            (0, i.au)({
                name: "REACT_QUERY_TIME",
                value: performance.now() - r,
                tags: {
                    routeId: e.routeId ? ? "unknown",
                    queryName: e.queryName ? ? "unknown"
                }
            });
            let u = t && s ? (0, o.Rf)({
                schema: t.schema,
                raw: a,
                routeId: e.routeId ? ? "unknown",
                queryName: e.queryName ? ? "unknown"
            }) : a;
            return (0, n.Av)(u), {
                result: u,
                headers: l
            }
        }
        async function f({
            queryDeps: {
                pathname: e,
                searchParams: t,
                init: r
            }
        }) {
            let n = m(e, t),
                a = await (0, s.Sr)(n, r);
            if (l.z.checkResponse(a), !a.ok) throw await (0, u.R0)(a);
            let i = "true" === a.headers.get(o.I$);
            return {
                json: await a.json(),
                isProtoJson: i,
                headers: a.headers
            }
        }
        async function p({
            queryDeps: {
                pathname: e,
                searchParams: t,
                init: r
            }
        }) {
            let n = m(e, t),
                i = await (0, s.Sr)(n, r);
            if (l.z.checkResponse(i), !i.ok) throw await (0, u.R0)(i);
            (0, a.A)((0, a.K)(document), i, !0);
            let c = "true" === i.headers.get(o.I$);
            return {
                json: await i.json(),
                isProtoJson: c,
                headers: i.headers
            }
        }

        function m(e, t) {
            let r = [e],
                n = (function(e) {
                    if (e instanceof URLSearchParams) return e;
                    if ("string" == typeof e) return new URLSearchParams(e);
                    let t = new URLSearchParams;
                    if (null == e) return t;
                    for (let [r, n] of Array.isArray(e) ? e : Object.entries(e)) null != n && t.append(r, n);
                    return t
                })(t).toString();
            return n && r.push(n.toString()), r.join("?")
        }
        r.d(t, {
            Dr: () => d,
            Xb: () => c,
            dx: () => p,
            lg: () => h
        })
    },
    945211(e, t, r) {
        r.d(t, {
            jL: () => P,
            Wy: () => k,
            yT: () => S
        });
        var n = r(432231),
            o = r(248742),
            a = r(685136),
            i = r(508995),
            s = r(147966),
            l = r(826099),
            u = r(931993);

        function c(e) {
            return {
                appName: e[0],
                routeId: e[1],
                routePath: e[2],
                queryName: e[3],
                queryDeps: e[4]
            }
        }
        var d = r(445052),
            h = r(474848),
            f = r(916522),
            p = r(296540),
            m = r(407904),
            y = r(693563),
            g = r(919758);

        function v(e) {
            var t;
            let r, n, o = (0, f.c)(6);
            if (o[0] !== e ? ({
                    fallback: r,
                    ...n
                } = e, o[0] = e, o[1] = r, o[2] = n) : (r = o[1], n = o[2]), "function" == typeof(t = r) || "object" == typeof t && null !== t && !(0, p.isValidElement)(t) && "$$typeof" in t) {
                let e, t = r;
                return o[3] !== t || o[4] !== n ? (e = (0, h.jsx)(t, { ...n
                }), o[3] = t, o[4] = n, o[5] = e) : e = o[5], e
            }
            return r
        }

        function w(e) {
            let {
                responseError: t
            } = e;
            return (0, g.u)(t), null
        }
        v.displayName = "FallbackContent", w.displayName = "ResponseErrorTitleEffect";
        var b = r(97210);
        let R = "fresh",
            E = "none";

        function x(e, t) {
            let r = e.getQueryCache().find({
                    queryKey: t
                }),
                n = r ? .meta,
                o = n ? .preloadedAt,
                a = r ? .state.fetchStatus;
            return r && void 0 !== o ? "error" === r.state.status ? {
                status: "error",
                preloadedAt: o,
                fetchStatus: a
            } : Date.now() - o > L ? {
                status: "stale",
                preloadedAt: o,
                fetchStatus: a
            } : {
                status: R,
                preloadedAt: o,
                fetchStatus: a
            } : {
                status: E,
                fetchStatus: a
            }
        }

        function S() {
            return (0, a.FE)()
        }
        let _ = {
                refetchOnWindowFocus: !1,
                retry: !1,
                networkMode: "always",
                staleTime: 864e5
            },
            P = "blocking_route_query_suspense";
        class C extends Error {
            queryName;
            routeId;
            routePath;
            constructor({
                queryName: e,
                routeId: t,
                routePath: r
            }) {
                super(`[SSR] Blocking query "${e}" on route "${t}" is missing embedded data. Blocking queries require embedded data during server rendering. Ensure the server payload includes data for this query. Route path: "${r}"`), this.name = "MissingSSREmbeddedDataError", this.queryName = e, this.routeId = t, this.routePath = r
            }
        }
        let L = 3e4;
        class k {#
            f;#
            p;#
            m;#
            y;
            get# g() {
                return this.#p ? this.#p() : this.#f
            }
            id;
            path;
            queries;
            index;
            tanStackRouterOptions;
            constructor(e) {
                this.#f = e.appName, this.#p = e.getAppName, this.id = e.id, this.path = e.path, this.queries = this.#v(e.queries), this.index = e.index, this.tanStackRouterOptions = e.tanStackRouterOptions, this.#m = e.getEmbeddedData, this.#y = e.shouldRevalidate
            }#
            v(e) {
                return Object.fromEntries(T(e).map(([e, t]) => {
                    let r = t => (function({
                        appName: e,
                        routeId: t,
                        routePath: r,
                        queryName: n,
                        queryDeps: o
                    }) {
                        return [e, t, r, n, o]
                    })({
                        appName: this.#g,
                        routeId: this.id,
                        routePath: this.path,
                        queryName: e.toString(),
                        queryDeps: t ? ? {}
                    });
                    return [e, { ...t,
                        makeQueryKey: r,
                        type: t.type ? ? d.g.Deferred,
                        staleTimeForNavigation: t.staleTimeForNavigation ? ? 200,
                        navigationBehavior: t.navigationBehavior ? ? "stale-while-revalidate"
                    }]
                }))
            }
            isSameRoute(e) {
                return !!("object" == typeof e && e && "id" in e && "string" == typeof e.id && e.id === this.id)
            }
            generatePath(e, t) {
                return (0, a.AO)({
                    pathname: (0, a.tW)(this.path, e),
                    search: t ? .search ? new URLSearchParams(t.search).toString() : void 0,
                    hash: t ? .hash
                })
            }#
            w({
                queryName: e,
                queryKey: t,
                type: r
            }) {
                let n = (0, o.SX)(),
                    a = this.#m(),
                    s = a ? .payload,
                    l = this.#b({
                        embeddedData: a,
                        queryName: e
                    });
                if (void 0 !== l) "mainQuery" === e ? delete s ? .[this.id] : (delete s ? .[String(e)], delete s ? .[this.id] ? .[e]), n.setQueryData(t, l);
                else if (i.X3 && r === d.g.Blocking) throw new C({
                    queryName: String(e),
                    routeId: this.id,
                    routePath: this.path
                })
            }
            buildQueryOptions(e, t) {
                let {
                    queryFn: r,
                    enabled: o,
                    ...a
                } = this.queries[e];
                if (!r) throw Error(`Query function for ${String(e)} is missing`);
                let {
                    queryName: s,
                    queryDeps: l,
                    makeQueryKey: h,
                    type: f,
                    staleTimeForNavigation: p,
                    navigationBehavior: m,
                    ...y
                } = a;
                return (0, u.j)({ ..._,
                    queryKey: t,
                    ...f === d.g.Blocking ? {
                        gcTime: i.X3 ? 864e5 : (0, n.G7)(P) ? 18e5 : 864e5
                    } : {},
                    queryFn: e => r(c(t), {
                        get signal() {
                            return e.signal
                        },
                        meta: e.meta
                    }),
                    enabled: o,
                    ...y
                })
            }#
            R = async ({
                request: e,
                params: t
            }) => {
                let r = [],
                    {
                        searchParams: n
                    } = new URL(e.url, s.fV.origin),
                    a = N(this.path, t),
                    u = (0, o.SX)(),
                    c = 0,
                    h = 0,
                    f = T(this.queries).map(([e, {
                        queryDeps: o,
                        makeQueryKey: s,
                        type: f,
                        staleTimeForNavigation: p,
                        navigationBehavior: m,
                        enabled: y
                    }]) => {
                        let g = s(o ? .({
                                pathname: a,
                                params: t,
                                searchParams: n
                            }) ? ? {}),
                            v = this.buildQueryOptions(e, g),
                            w = "function" == typeof y ? y() : y ? ? !0;
                        if (w && void 0 === u.getQueryData(v.queryKey) && this.#w({
                                queryName: e,
                                queryKey: v.queryKey,
                                type: f
                            }), i.KJ && w) {
                            h++;
                            let e = { ...v,
                                    staleTime: p,
                                    meta: { ...v.meta
                                    }
                                },
                                {
                                    status: t,
                                    preloadedAt: n,
                                    fetchStatus: o = "idle"
                                } = x(u, g),
                                a = t === R;
                            switch (a ? (c++, void 0 !== n && (0, l.au)({
                                name: "REACT_PRELOAD_LATENCY",
                                value: Date.now() - n,
                                tags: {
                                    routeId: this.id,
                                    fetchStatus: o,
                                    appName: this.#g,
                                    router: "data-router"
                                }
                            }), (0, l.au)({
                                name: "REACT_PRELOAD_FETCH_STATUS",
                                value: 1,
                                tags: {
                                    routeId: this.id,
                                    fetchStatus: o,
                                    appName: this.#g,
                                    router: "data-router"
                                }
                            })) : t !== E && (0, l.au)({
                                name: "REACT_PRELOAD_REJECTED",
                                value: 1,
                                tags: {
                                    routeId: this.id,
                                    reason: t,
                                    appName: this.#g,
                                    router: "data-router"
                                }
                            }), f) {
                                case d.g.Deferred:
                                    a || u.prefetchQuery(e);
                                    break;
                                case d.g.Blocking:
                                    {
                                        let t = u.getQueryState(e.queryKey),
                                            n = t ? Date.now() - t.dataUpdatedAt : 1 / 0;t && "pending" !== t.status && "error" !== t.status && "fetching" !== t.fetchStatus ? "network-first" === m ? n >= p && (u.invalidateQueries({
                                            queryKey: e.queryKey
                                        }), r.push(u.fetchQuery(e))) : !a && n >= p && u.invalidateQueries({
                                            queryKey: e.queryKey
                                        }) : r.push(u.fetchQuery(e));
                                        break
                                    }
                                default:
                                    throw Error(`Invalid QueryRouteQueryType defined, \`${f}\`. Valid QueryRouteQueryTypes are ${JSON.stringify(Object.keys(d.g))}`)
                            }
                        }
                        return [e, {
                            queryKey: g,
                            type: f,
                            suppressDuringSSR: !1
                        }]
                    });
                return await Promise.all(r), i.KJ && c > 0 && (0, l.au)({
                    name: "REACT_PRELOAD_HIT",
                    value: 1,
                    tags: {
                        routeId: this.id,
                        type: c === h ? "full" : "partial",
                        appName: this.#g,
                        router: "data-router"
                    }
                }), {
                    routeId: this.id,
                    queries: Object.fromEntries(f)
                }
            };
            toRoute = ({
                Component: e,
                element: t,
                errorBoundary: r,
                ...n
            }) => {
                let o = function(e, {
                        element: t,
                        Component: r
                    }) {
                        if (!t && !r) return;
                        let n = () => {
                            let n = null;
                            return (void 0 !== t ? n = (0, h.jsx)(h.Fragment, {
                                children: t
                            }) : r && (n = (0, h.jsx)(r, {})), n) ? (0, h.jsx)(b.JP, {
                                id: e,
                                children: n
                            }) : null
                        };
                        return n.displayName = "ProfilerWrapper", r ? .preload && (n.preload = r.preload), r ? .ssr !== void 0 && (n.ssr = r.ssr), n
                    }(this.id, {
                        element: t,
                        Component: e
                    }),
                    i = this.#y,
                    s = { ...n.handle,
                        queryRoute: this
                    },
                    l = r ? "override" in r ? r.override : function({
                        fallback: e,
                        critical: t = !0,
                        boundaryName: r,
                        reactAppName: n,
                        shouldReport: o,
                        setDocumentTitleOnResponseError: i = !1
                    }) {
                        function s() {
                            let s, l, u, c, d, p = (0, f.c)(11),
                                g = (0, a.r5)();
                            p[0] === Symbol.for("react.memo_cache_sentinel") ? (s = {
                                critical: t,
                                boundaryName: r,
                                reactAppName: n,
                                shouldReport: o
                            }, p[0] = s) : s = p[0], (0, y.v)(g, s), p[1] !== g ? (l = (0, m.cH)(g) ? g : null, p[1] = g, p[2] = l) : l = p[2];
                            let b = l;
                            return p[3] !== b ? (u = i && b ? (0, h.jsx)(w, {
                                responseError: b
                            }) : null, p[3] = b, p[4] = u) : u = p[4], p[5] !== b || p[6] !== g ? (c = (0, h.jsx)(v, {
                                fallback: e,
                                error: g,
                                responseError: b
                            }), p[5] = b, p[6] = g, p[7] = c) : c = p[7], p[8] !== u || p[9] !== c ? (d = (0, h.jsxs)(h.Fragment, {
                                children: [u, c]
                            }), p[8] = u, p[9] = c, p[10] = d) : d = p[10], d
                        }
                        return s.displayName = r ? `RouteErrorBoundary(${r})` : "RouteErrorBoundary", s
                    }({ ...r,
                        boundaryName: r.boundaryName ? ? this.id
                    }) : void 0;
                return this.index ? { ...n,
                    id: this.id,
                    children: void 0,
                    path: this.path,
                    index: this.index,
                    loader: this.#R,
                    handle: s,
                    shouldRevalidate: i,
                    Component: o,
                    ErrorBoundary: l
                } : { ...n,
                    id: this.id,
                    path: this.path,
                    index: this.index,
                    loader: this.#R,
                    handle: s,
                    shouldRevalidate: i,
                    Component: o,
                    ErrorBoundary: l
                }
            };#
            b({
                embeddedData: e,
                queryName: t
            }) {
                let r, n, o = e ? .payload;
                if ("mainQuery" === t ? (r = o ? .[this.id], n = this.id) : o ? .[String(t)] !== void 0 ? (r = o[String(t)], n = String(t)) : r = o ? .[this.id] ? .[t], void 0 === r) return;
                if (void 0 !== n && e ? .meta ? .protoRoutes ? .includes(n)) {
                    let e = this.queries[t] ? .[d.H];
                    e && (r = e(r, n))
                }
                if ("mainQuery" !== t) return r;
                let a = e ? .title || e ? .meta ? .title;
                return {
                    meta: a ? {
                        title: a
                    } : void 0,
                    payload: r
                }
            }
            preload(e, t) {
                if (!i.KJ) return;
                let r = N(this.path, e),
                    n = (0, o.SX)(),
                    a = t ? ? new URLSearchParams,
                    s = !1;
                for (let [t, {
                        queryFn: o,
                        queryDeps: i,
                        makeQueryKey: l,
                        navigationBehavior: u,
                        enabled: d,
                        ...h
                    }] of T(this.queries)) {
                    if ("network-first" === u || !("function" == typeof d ? d() : d ? ? !0)) continue;
                    let t = l(i ? .({
                        pathname: r,
                        params: e,
                        searchParams: a
                    }) ? ? {});
                    if (x(n, t).status === R) continue;
                    let f = n.getQueryState(t);
                    f ? .status !== "success" && (n.prefetchQuery({ ..._,
                        queryKey: t,
                        queryFn: e => o(c(t), {
                            get signal() {
                                return e.signal
                            },
                            meta: e.meta
                        }),
                        ...h,
                        meta: { ...h.meta,
                            preloadedAt: Date.now(),
                            isPreload: !0
                        }
                    }), s = !0)
                }
                s && (0, l.au)({
                    name: "REACT_PRELOAD_COUNT",
                    value: 1,
                    tags: {
                        routeId: this.id,
                        appName: this.#g,
                        router: "data-router"
                    }
                })
            }
        }

        function N(e, t) {
            return (0, a.tW)(e, Object.fromEntries(T(t).map(([e, t]) => [e, void 0 === t ? null : t])))
        }
        let T = e => Object.entries(e)
    },
    775778(e, t, r) {
        var n = r(164636),
            o = r(372403),
            a = r(840014),
            i = r(84461),
            s = r(445052),
            l = r(975530);

        function u({
            partialName: e,
            queryDeps: t,
            type: r,
            navigationBehavior: c,
            ...d
        }) {
            return u => {
                let h = `${u}.${e||"RailsPartial"}`;
                return {
                    queryName: h,
                    queryDeps: t || (({
                        pathname: e
                    }) => ({
                        pathname: `${e}/partial`
                    })),
                    queryFn: async e => {
                        let {
                            json: t,
                            isProtoJson: r
                        } = await (0, l.dx)(e), s = t.payload ? .[h];
                        if (null == s) throw Error(`Unable to find payload for query: ${h}`);
                        return ((0, n.Av)(t), r) ? (0, o.Rf)({
                            schema: i.W,
                            raw: s,
                            routeId: u,
                            queryName: h
                        }) : (0, a.v)(i.W, {
                            value: s
                        })
                    },
                    [s.H]: (e, t) => (0, o.Rf)({
                        schema: i.W,
                        raw: e,
                        routeId: t,
                        queryName: h
                    }),
                    type: r || s.g.Blocking,
                    navigationBehavior: c || "network-first",
                    ...d
                }
            }
        }
        r.d(t, {
            D: () => u
        })
    },
    407904(e, t, r) {
        var n = r(123364);
        class o extends Error {
            response;
            constructor(e, t) {
                super(e), this.response = t, this.name = "ResponseError"
            }
        }

        function a(e) {
            return e instanceof o
        }
        class i extends o {
            constructor(e) {
                super(e.statusText, e), this.name = "NotAcceptableError"
            }
        }
        class s extends o {
            constructor(e) {
                super(e.statusText, e), this.name = "RateLimitError"
            }
        }
        class l extends o {
            constructor(e) {
                super(e.statusText, e), this.name = "ServiceUnavailableError"
            }
        }
        class u extends o {
            constructor(e) {
                super(e.statusText, e), this.name = "SecFetchHeaderError"
            }
        }
        class c extends o {
            constructor(e) {
                super(e.statusText, e), this.name = "NoiseError"
            }
        }
        class d extends o {
            constructor(e) {
                super(e.statusText, e), this.name = "DataRouterAuthError"
            }
        }
        async function h(e) {
            let t = e.headers.get("X-Reject-Reason"),
                r = 403 === e.status && "csrf" !== t || 422 === e.status ? await f(e) : void 0;
            switch ((0, n.n)({
                status: e.status,
                rejectReason: t,
                bodyText: r
            })) {
                case "rate-limit":
                    return new s(e);
                case "service-unavailable":
                    return new l(e);
                case "not-acceptable":
                    return new i(e);
                case "sec-fetch":
                    return new u(e);
                case "noise":
                    return new c(e);
                case "auth":
                    return new d(e);
                case "generic":
                    return new o(e.statusText, e)
            }
        }
        async function f(e) {
            try {
                return await e.clone().text()
            } catch {
                return ""
            }
        }
        r.d(t, {
            R0: () => h,
            cH: () => a,
            o3: () => o
        })
    },
    94444(e, t, r) {
        var n = r(916522),
            o = r(945211);

        function a() {
            let e, t = (0, n.c)(2),
                r = (0, o.yT)();
            if (t[0] !== r) {
                e = Symbol.for("react.early_return_sentinel");
                for (let t = r.length - 1; t >= 0; t--) {
                    let n = r[t] ? .handle ? .queryRoute;
                    if (n) {
                        e = n;
                        break
                    }
                }
                t[0] = r, t[1] = e
            } else e = t[1];
            if (e !== Symbol.for("react.early_return_sentinel")) return e;
            throw Error("useCurrentQueryRoute: no QueryRoute is currently mounted in the match tree.")
        }
        r.d(t, {
            Y: () => a
        })
    },
    114025(e, t, r) {
        var n = r(296540),
            o = r(618360);

        function a() {
            return (0, n.use)(o.e)
        }
        r.d(t, {
            E: () => a
        })
    },
    894227(e, t, r) {
        var n = r(916522),
            o = r(945211);

        function a(e) {
            let t, r = (0, n.c)(5),
                a = (0, o.yT)();
            if (r[0] !== e || r[1] !== a) {
                let n;
                r[3] !== e ? (n = t => t.id === e.id, r[3] = e, r[4] = n) : n = r[4], t = a.find(n), r[0] = e, r[1] = a, r[2] = t
            } else t = r[2];
            return !!t
        }
        r.d(t, {
            n: () => a
        })
    },
    693563(e, t, r) {
        var n = r(916522),
            o = r(546856),
            a = r(916284),
            i = r(685136),
            s = r(296540);
        let l = new WeakSet;

        function u(e, t) {
            l.has(e) || (l.add(e), t(e))
        }

        function c(e, t) {
            let r, l, c, d, h = (0, n.c)(13);
            h[0] !== t ? (r = void 0 === t ? {} : t, h[0] = t, h[1] = r) : r = h[1];
            let f = r,
                {
                    critical: p,
                    boundaryName: m,
                    devLogLabel: y,
                    shouldReport: g
                } = f,
                v = void 0 === p || p,
                w = (0, s.use)(o.I),
                b = f.reactAppName ? ? w ? .appName;
            h[2] !== m || h[3] !== v || h[4] !== y || h[5] !== b || h[6] !== g ? (l = e => {
                if (null == e || (0, i.pX)(e) && 404 === e.status || "object" == typeof e && "shouldSkipReport" in e && e.shouldSkipReport || void 0 !== g && !g(e)) return;
                let t = e => {
                    (0, a.N7)(e, {
                        critical: v,
                        reactAppName: b,
                        reactErrorBoundaryName: m
                    })
                };
                "object" == typeof e || "function" == typeof e ? u(e, t) : t(e)
            }, h[2] = m, h[3] = v, h[4] = y, h[5] = b, h[6] = g, h[7] = l) : l = h[7];
            let R = (0, s.useEffectEvent)(l);
            h[8] !== e || h[9] !== R ? (c = () => {
                R(e)
            }, h[8] = e, h[9] = R, h[10] = c) : c = h[10], h[11] !== e ? (d = [e], h[11] = e, h[12] = d) : d = h[12], (0, s.useEffect)(c, d)
        }
        r.d(t, {
            k: () => u,
            v: () => c
        })
    },
    658064(e, t, r) {
        var n = r(916522),
            o = r(945211);

        function a(e) {
            let t, r = (0, n.c)(5),
                a = (0, o.yT)();
            if (r[0] !== a || r[1] !== e) {
                let n;
                r[3] !== e ? (n = t => t.id === e.id, r[3] = e, r[4] = n) : n = r[4], t = a.find(n), r[0] = a, r[1] = e, r[2] = t
            } else t = r[2];
            let s = t;
            if (!s) {
                let t = a.map(i).join(", ");
                throw Error(`Cannot read params from unmounted route with ID "${e.id}". Mounted route IDs are: "${t}"`)
            }
            return s.params
        }

        function i(e) {
            return e.id
        }
        r.d(t, {
            L: () => a
        })
    },
    773034(e, t, r) {
        var n = r(685136);

        function o(e, t) {
            let r = (0, n.Ew)(e.id);
            return r ? .queries ? .[t] ? .queryKey
        }
        r.d(t, {
            w: () => o
        })
    },
    254344(e, t, r) {
        var n = r(916522),
            o = r(432231),
            a = r(248742),
            i = r(685136),
            s = r(904369),
            l = r(165510),
            u = r(445052),
            c = r(945211),
            d = r(602058);

        function h(e, t) {
            let {
                allowReadFromChildRoutes: r
            } = void 0 === t ? {} : t, n = (0, c.yT)(), o = n.findIndex(t => t.id === e.id);
            if (-1 === o) {
                let t = n.map(p).join(", ");
                throw Error(`Cannot read data from unmounted route with ID "${e.id}". Mounted route IDs are: ${t}`)
            }
            let {
                routeId: a
            } = (0, i.LG)(), {
                queries: s
            } = (0, i.Ew)(e.id), l = n.findIndex(e => e.id === a);
            if (!r && o > l) {
                let t = n.map(f).join(", ");
                throw Error(`Cannot read data from child route with ID "${e.id}" from parent route "${a}". Use { allowReadFromChildRoutes: true } option to enable this.  Mounted route IDs are: ${t}`)
            }
            return s
        }

        function f(e) {
            return e.id
        }

        function p(e) {
            return e.id
        }

        function m(e, t, r) {
            let o, a, i = (0, n.c)(7),
                s = h(e, r)[t];
            i[0] !== s.queryKey || i[1] !== t || i[2] !== e ? (o = e.buildQueryOptions(t, s.queryKey), i[0] = s.queryKey, i[1] = t, i[2] = e, i[3] = o) : o = i[3];
            let l = o;
            return i[4] !== s || i[5] !== l ? (a = { ...s,
                queryConfig: l
            }, i[4] = s, i[5] = l, i[6] = a) : a = i[6], a
        }

        function y(e, t, r) {
            let i, l, h = (0, n.c)(6),
                {
                    queryConfig: f,
                    suppressDuringSSR: p,
                    type: y
                } = m(e, t);
            h[0] !== f || h[1] !== r ? (i = { ...f,
                ...r
            }, h[0] = f, h[1] = r, h[2] = i) : i = h[2];
            let g = (0, d.y)(i, p),
                {
                    isServer: v
                } = (0, s.V)();
            if (!v && (0, o.G7)(c.jL) && function({
                    type: e,
                    result: t
                }) {
                    return e === u.g.Blocking && t.isLoading && void 0 === t.data && !t.isError
                }({
                    type: y,
                    result: g
                })) throw (0, a.SX)().ensureQueryData({ ...f,
                ...r
            });
            return h[3] !== f.queryKey || h[4] !== g ? (l = { ...g,
                queryKey: f.queryKey
            }, h[3] = f.queryKey, h[4] = g, h[5] = l) : l = h[5], l
        }

        function g(e, t, r) {
            let o, a, i = (0, n.c)(6),
                {
                    queryConfig: s
                } = m(e, t);
            i[0] !== s || i[1] !== r ? (o = { ...s,
                ...r
            }, i[0] = s, i[1] = r, i[2] = o) : o = i[2];
            let u = (0, l.U)(o);
            return i[3] !== s.queryKey || i[4] !== u ? (a = { ...u,
                queryKey: s.queryKey
            }, i[3] = s.queryKey, i[4] = u, i[5] = a) : a = i[5], a
        }

        function v(e, t, r) {
            let o, a, i, s = (0, n.c)(7);
            s[0] === Symbol.for("react.memo_cache_sentinel") ? (o = {
                allowReadFromChildRoutes: !0
            }, s[0] = o) : o = s[0];
            let {
                queryConfig: l,
                suppressDuringSSR: u
            } = m(e, t, o);
            s[1] !== l || s[2] !== r ? (a = { ...l,
                ...r
            }, s[1] = l, s[2] = r, s[3] = a) : a = s[3];
            let c = (0, d.y)(a, u);
            return s[4] !== l.queryKey || s[5] !== c ? (i = { ...c,
                queryKey: l.queryKey
            }, s[4] = l.queryKey, s[5] = c, s[6] = i) : i = s[6], i
        }
        r.d(t, {
            B1: () => h,
            V3: () => g,
            ks: () => m,
            pw: () => v,
            xX: () => y
        })
    },
    919758(e, t, r) {
        var n = r(916522),
            o = r(936087),
            a = r(296540);

        function i(e) {
            let t, r, i = (0, n.c)(3),
                s = e.response.status;
            i[0] !== s ? (t = () => {
                var e;
                let t, r = (t = 404 === (e = s) ? "404 Page not found" : 500 === e ? "500 Internal server error" : `Error ${e}`, (0, o.Y)(t));
                (0, o.D)(r)
            }, r = [s], i[0] = s, i[1] = t, i[2] = r) : (t = i[1], r = i[2]), (0, a.useEffect)(t, r)
        }
        r.d(t, {
            u: () => i
        })
    },
    602058(e, t, r) {
        var n = r(916522),
            o = r(406187),
            a = r(904369);

        function i(e, t) {
            let r = (0, n.c)(2),
                i = function(e) {
                    let {
                        isServer: t
                    } = (0, a.V)();
                    return e && t
                }(t),
                s = (0, o.IT)(e);
            if (i) {
                let e;
                return r[0] !== s ? (e = { ...s,
                    data: void 0,
                    status: "pending",
                    fetchStatus: "fetching",
                    isPending: !0,
                    isLoading: !0,
                    isFetching: !0,
                    isSuccess: !1,
                    isError: !1,
                    error: null,
                    isFetched: !1,
                    isFetchedAfterMount: !1,
                    isRefetching: !1,
                    dataUpdatedAt: 0,
                    errorUpdatedAt: 0,
                    failureCount: 0,
                    failureReason: null
                }, r[0] = s, r[1] = e) : e = r[1], e
            }
            return s
        }
        r.d(t, {
            y: () => i
        })
    },
    381098(e, t, r) {
        var n = r(826099);

        function o() {
            return (0, n.Xl)()
        }
        r.d(t, {
            G: () => o
        })
    },
    207227(e, t, r) {
        var n = r(474848),
            o = r(296540);

        function a(e) {
            let t, r, a = () => (r || (r = (async () => {
                    let r = await e();
                    return t = r.default, r
                })()), r),
                i = (0, o.lazy)(a);

            function s(e) {
                let [r] = (0, o.useState)(() => t), a = r ? ? i;
                return (0, n.jsx)(a, { ...e
                })
            }
            return i.displayName = "LazyComponent", s.displayName = "PreloadableComponent", Object.assign(s, {
                preload: async () => {
                    await a()
                }
            })
        }
        r.d(t, {
            Y: () => a
        })
    },
    997270(e, t, r) {
        var n = r(843168);

        function o() {
            return n.A.isEnabled()
        }
        r.d(t, {
            I: () => o
        })
    },
    567497(e, t, r) {
        var n = r(916522),
            o = r(296540);

        function a(e) {
            let t = e ? .anchor;
            if (!t) return {};
            let r = t.getAttribute("data-inital-disabled") ? .toLowerCase() === "true";
            return "disabled" in t && (t.disabled = r), t.classList.remove("cursor-wait"), {
                reactPartialAnchor: {
                    __wrapperElement: e
                }
            }
        }

        function i(e) {
            var t, r;
            let a, i, l, u, c, d, h, f, p = (0, n.c)(6),
                m = (0, o.useRef)(e.__wrapperElement.anchor || null),
                [y, g] = (0, o.useState)(!1);
            p[0] === Symbol.for("react.memo_cache_sentinel") ? (c = () => {
                g(s)
            }, p[0] = c) : c = p[0];
            let v = c;
            return p[1] !== y ? (d = () => {
                m.current && (m.current.setAttribute("aria-expanded", y.toString()), m.current.setAttribute("aria-haspopup", "true"))
            }, h = [m, y], p[1] = y, p[2] = d, p[3] = h) : (d = p[2], h = p[3]), (0, o.useEffect)(d, h), t = e, r = v, l = (0, n.c)(3), u = (0, o.useRef)(t.__wrapperElement.anchor), l[0] !== r ? (a = () => {
                let e = u.current;
                if (e) return e.addEventListener("click", r), () => e.removeEventListener("click", r)
            }, i = [u, r], l[0] = r, l[1] = a, l[2] = i) : (a = l[1], i = l[2]), (0, o.useEffect)(a, i), p[4] !== y ? (f = {
                ref: m,
                open: y,
                setOpen: g
            }, p[4] = y, p[5] = f) : f = p[5], f
        }

        function s(e) {
            return !e
        }
        r.d(t, {
            Mm: () => i,
            b3: () => a
        })
    },
    747297(e, t, r) {
        var n = r(916284),
            o = r(826099),
            a = r(687996),
            i = r(381098);

        function s(e) {
            return "function" == typeof e ? e() : e
        }
        let l = /Minified React error #(?<invariant>\d+)/,
            u = ["419", "421"];

        function c(e) {
            return {
                onCaughtError: (t, r) => {
                    let o = s(e.appName),
                        l = r.errorBoundary ? .props,
                        u = t[a.g],
                        c = l ? .critical ? ? u ? .critical ? ? !1,
                        d = l ? .boundaryName ? ? u ? .boundaryName ? ? r.errorBoundary ? .constructor ? .name,
                        h = "function" == typeof l ? .onError,
                        f = "function" == typeof l ? .onCatch;
                    (0, i.G)() && (console.error("Error caught by boundary:", t), r.componentStack && console.warn("componentStack", r.componentStack)), t && "object" == typeof t && "shouldSkipReport" in t && t.shouldSkipReport || h || f || (0, n.N7)(t, {
                        critical: c,
                        reactAppName: o,
                        reactErrorBoundaryName: d
                    })
                },
                onUncaughtError: (t, r) => {
                    let o = s(e.appName);
                    (0, n.N7)(t, {
                        critical: !0,
                        reactAppName: o
                    }), (0, i.G)() && (console.error("Error not caught by boundary:", t), r.componentStack && console.warn("componentStack", r.componentStack))
                },
                onRecoverableError: (t, r) => {
                    let n = s(e.appName);
                    if (!(t instanceof Error)) {
                        (0, o.iv)({
                            incrementKey: "REACT_HYDRATION_ERROR",
                            incrementTags: {
                                appName: n,
                                invariant: "non-error"
                            },
                            requestUrl: window.location.href
                        }), (0, i.G)() && console.warn(`\u{26A0}\u{FE0F} Recoverable hydration error (non-Error value) - ${n}:`, t), e.onHydrationError ? .();
                        return
                    }
                    let a = l.exec(t.message),
                        c = String(a ? .groups ? .invariant),
                        d = u.includes(c);
                    d || e.onHydrationError ? .(), (0, o.iv)({
                        incrementKey: "REACT_HYDRATION_ERROR",
                        incrementTags: {
                            appName: n,
                            invariant: c
                        },
                        requestUrl: window.location.href
                    }), (0, i.G)() && (console.groupCollapsed(`%c${d?"\u2139\uFE0F":"\u26A0\uFE0F"} Recoverable hydration error - ${n} - ${t.message}`, d ? "background: rgba(100, 149, 237, 0.2); font-weight: bold; padding: 4px; border: 1px solid rgba(100, 149, 237, 0.5); border-radius: 4px;" : "background: rgba(255, 193, 7, 0.2); font-weight: bold; padding: 4px; border: 1px solid rgba(255, 193, 7, 0.5); border-radius: 4px;", d ? "This is an expected hydration mismatch and will not be reported as an error." : "This is only visible to staff users and is safe to ignore. Reach out to #react for help understanding and fixing these hydration errors"), t.cause && console.warn("cause", t.cause), r.componentStack && console.warn("componentStack", r.componentStack), console.groupEnd())
                }
            }
        }
        r.d(t, {
            xx: () => c
        })
    },
    411222(e, t, r) {
        r.d(t, {
            w: () => eJ,
            o: () => eK
        });
        var n = r(331635),
            o = r(474848),
            a = r(651135),
            i = r(561891),
            s = r(840014),
            l = r(84461),
            u = r(137923),
            c = r(248742),
            d = r(685136),
            h = r(712396),
            f = r(432231),
            p = r(406637);
        let m = new p.R;
        async function y(e) {
            return m.getRegistration(e).promise
        }
        var g = r(916522),
            v = r(991853),
            w = r(508995),
            b = r(217931),
            R = r(465780),
            E = r(296540),
            x = r(114025),
            S = r(912223);
        let _ = [],
            P = [],
            C = (0, E.memo)(function(e) {
                let t = (0, g.c)(4),
                    {
                        routes: r
                    } = e;
                if ((0, x.E)()) {
                    let e;
                    return t[0] !== r ? (e = (0, o.jsx)(k, {
                        routes: r
                    }), t[0] = r, t[1] = e) : e = t[1], e
                } {
                    let e;
                    return t[2] !== r ? (e = (0, o.jsx)(L, {
                        routes: r
                    }), t[2] = r, t[3] = e) : e = t[3], e
                }
            });
        C.displayName = "RouterDevTools";
        let L = (0, E.memo)(function(e) {
            let t, r, n, o = (0, g.c)(9),
                {
                    routes: a
                } = e,
                i = "u" < typeof document,
                s = (0, d.zy)();
            o[0] !== s || o[1] !== a ? (t = i ? _ : (0, d.ue)(a, s) ? .map(A) ? ? _, o[0] = s, o[1] = a, o[2] = t) : t = o[2];
            let l = t;
            e: {
                let e;
                if (i) {
                    r = P;
                    break e
                }
                o[3] !== a ? (e = j(a), o[3] = a, o[4] = e) : e = o[4],
                r = e
            }
            let u = r;
            return o[5] !== s || o[6] !== l || o[7] !== u ? (n = {
                location: s,
                matches: l,
                routes: u
            }, o[5] = s, o[6] = l, o[7] = u, o[8] = n) : n = o[8], N(n), null
        });
        L.displayName = "NavigatorRouterDevTools";
        let k = (0, E.memo)(function(e) {
            let t, r, n = (0, g.c)(6),
                {
                    routes: o
                } = e,
                a = "u" < typeof document,
                i = (0, d.zy)(),
                s = (0, d.FE)(),
                l = a ? _ : s;
            e: {
                let e;
                if (a) {
                    t = P;
                    break e
                }
                n[0] !== o ? (e = j(o), n[0] = o, n[1] = e) : e = n[1],
                t = e
            }
            let u = t;
            return n[2] !== i || n[3] !== l || n[4] !== u ? (r = {
                location: i,
                matches: l,
                routes: u
            }, n[2] = i, n[3] = l, n[4] = u, n[5] = r) : r = n[5], N(r), null
        });

        function N(e) {
            let t, r, n, o, a = (0, g.c)(10),
                {
                    location: i,
                    matches: s,
                    routes: l
                } = e;
            a[0] !== i || a[1] !== s || a[2] !== l ? (t = () => {
                let e = new AbortController;
                return document.addEventListener("turbo:load", () => {
                    (0, S.n)().setState({
                        location: i,
                        matches: s,
                        routes: l
                    })
                }, {
                    signal: e.signal
                }), () => {
                    e.abort()
                }
            }, r = [i, l, s], a[0] = i, a[1] = s, a[2] = l, a[3] = t, a[4] = r) : (t = a[3], r = a[4]), (0, E.useEffect)(t, r), a[5] !== i || a[6] !== s || a[7] !== l ? (n = () => ((0, S.n)().setState({
                location: i,
                matches: s,
                routes: l
            }), T), o = [i, l, s], a[5] = i, a[6] = s, a[7] = l, a[8] = n, a[9] = o) : (n = a[8], o = a[9]), (0, E.useEffect)(n, o)
        }

        function T() {
            (0, S.n)().setState(null)
        }

        function j(e, t = "") {
            let r = [];
            for (let a of e) {
                let e, i = !0 === a.index,
                    s = a.path ? ? "";
                if (i) e = t.startsWith("/") && !t.endsWith("/") ? t.endsWith("/") ? t : `${t}/` : t || "/";
                else {
                    var n, o;
                    e = s.startsWith("/") ? s : (n = t, o = s, n ? o ? `${n.replace(/\/+$/,"")}/${o.replace(/^\/+/,"")}` : n : o)
                }
                let l = "id" in a && "string" == typeof a.id ? a.id : e || "/";
                r.push({
                    id: l,
                    pathname: e || "/",
                    route: a,
                    loaderData: void 0
                }), a.children && r.push(...j(a.children, e))
            }
            return r
        }

        function A(e) {
            return function({
                pathname: e,
                route: t,
                params: r
            }) {
                return {
                    id: t.id ? ? t.path ? ? e,
                    pathname: e,
                    params: r,
                    loaderData: void 0,
                    handle: t.handle
                }
            }(e)
        }
        k.displayName = "DataRouterDevTools";
        var D = r(775098),
            I = r(566010);

        function M(e, t, r) {
            let n, o, a, i = (0, g.c)(8),
                s = (0, E.useRef)(void 0),
                l = (0, E.useRef)(t.state);
            i[0] !== t.state ? (n = () => {
                l.current = t.state
            }, i[0] = t.state, i[1] = n) : n = i[1], (0, E.useEffect)(n), i[2] !== r || i[3] !== e || i[4] !== t.pathname || i[5] !== t.search ? (o = () => {
                if ("POP" === r) return;
                let n = t.pathname + t.search;
                if (void 0 === s.current) s.current = n;
                else if (s.current !== n && !e) {
                    var o;
                    if (!("object" == typeof(o = l.current) && null !== o && d.Vn in o && !0 === o[d.Vn])) {
                        let e = document.querySelector("[data-react-autofocus]");
                        !e && (e = document.querySelector("react-app h1")) && !e.hasAttribute("tabindex") && e.setAttribute("tabindex", "-1"), e ? .focus()
                    }
                    s.current = n
                }
            }, a = [e, t.pathname, t.search, r], i[2] = r, i[3] = e, i[4] = t.pathname, i[5] = t.search, i[6] = o, i[7] = a) : (o = i[6], a = i[7]), (0, E.useEffect)(o, a)
        }

        function O() {
            return M(!1, (0, d.zy)(), (0, d.wQ)()), null
        }

        function $() {
            let e = (0, d.zy)(),
                t = (0, d.wQ)();
            return M("loading" === (0, d.cq)().state, e, t), null
        }
        O.displayName = "LegacyNavigationFocusListener", $.displayName = "NavigationFocusListener";
        var F = r(406187),
            U = r(258804),
            B = r(175895),
            H = r(445052),
            z = r(945211);
        let q = B.z.INITIAL;

        function W() {
            let e, t, r, n, o = (0, g.c)(10),
                a = (0, I.X)(),
                i = (0, z.yT)(),
                s = (0, F.jE)();
            return o[0] !== a || o[1] !== i || o[2] !== s ? (e = () => {
                let e = V(i, s);
                document.dispatchEvent(new U.gh({
                    payload: e,
                    appPayload: a
                }))
            }, t = [i, a, s], o[0] = a, o[1] = i, o[2] = s, o[3] = e, o[4] = t) : (e = o[3], t = o[4]), (0, E.useEffect)(e, t), o[5] !== a || o[6] !== i || o[7] !== s ? (r = () => {
                let e = function() {
                    let e = V(i, s);
                    document.dispatchEvent(new U.gh({
                        payload: e,
                        appPayload: a
                    }))
                };
                return document.addEventListener(q, e), () => {
                    document.removeEventListener(q, e)
                }
            }, n = [i, a, s], o[5] = a, o[6] = i, o[7] = s, o[8] = r, o[9] = n) : (r = o[8], n = o[9]), (0, E.useEffect)(r, n), null
        }

        function V(e, t) {
            let r = {};
            for (let n of e) {
                if (!n.loaderData) continue;
                let e = n.handle ? .queryRoute ? .id;
                if (e)
                    for (let o of Object.values(n.loaderData.queries)) o.type === H.g.Blocking && (r[e] = t.getQueryData(o.queryKey))
            }
            return r
        }

        function K(e) {
            let t = e.Component;
            return {
                ssr: t ? .ssr,
                loaderDeps: function(e) {
                    let t = Y(e);
                    if (!t) return;
                    let r = Object.entries(t.queries).filter(([, e]) => !!e ? .queryDeps);
                    return 0 === r.length ? () => ({}) : ({
                        search: e
                    }) => {
                        let t = (0, d.Ci)(e);
                        return Object.fromEntries(r.map(([r, n]) => {
                            let o;
                            try {
                                o = n ? .queryDeps ? .({
                                    pathname: "",
                                    params: J,
                                    searchParams: t
                                }) ? ? {}
                            } catch {
                                console.warn("An error occurred while deriving loader dependencies from queryDeps. Falling back to the full search object, so this route will revalidate on every search params change. Override loaderDeps via this route's tanStackRouterOptions to customize this behavior."), o = e
                            }
                            return [r, JSON.parse(JSON.stringify(o))]
                        }))
                    }
                }(e),
                ... function(e) {
                    let t = Y(e);
                    if (t) return t.tanStackRouterOptions
                }(e)
            }
        }
        W.displayName = "PublishPayload";
        let J = new Proxy({}, {
            get: () => ""
        });

        function Y(e) {
            if (e.handle && "object" == typeof e.handle) return "queryRoute" in e.handle ? e.handle.queryRoute : void 0
        }
        var Q = r(437443),
            G = r(407904),
            X = r(693563),
            Z = r(919758);
        let ee = e => {
            let t, r = (0, g.c)(3),
                {
                    appName: n
                } = e,
                a = (0, d.r5)();
            return r[0] !== n || r[1] !== a ? (t = (0, o.jsx)(er, {
                routeError: a,
                appName: n
            }), r[0] = n, r[1] = a, r[2] = t) : t = r[2], t
        };
        ee.displayName = "UnhandledRouteError";
        let et = () => null;
        et.displayName = "RootNotFoundComponent";
        let er = e => {
            let t, r = (0, g.c)(4),
                {
                    routeError: n,
                    appName: a
                } = e;
            if ((0, d.pX)(n) && 404 === n.status) {
                let e;
                return r[0] === Symbol.for("react.memo_cache_sentinel") ? (e = (0, o.jsx)(et, {}), r[0] = e) : e = r[0], e
            }
            return r[1] !== a || r[2] !== n ? (t = (0, o.jsx)(en, {
                appName: a,
                routeError: n
            }), r[1] = a, r[2] = n, r[3] = t) : t = r[3], t
        };

        function en(e) {
            let t, r, n = (0, g.c)(3),
                {
                    appName: a,
                    routeError: i
                } = e;
            return n[0] !== a ? (t = {
                reactAppName: a,
                devLogLabel: "GlobalRouterErrorBoundary"
            }, n[0] = a, n[1] = t) : t = n[1], (0, X.v)(i, t), n[2] === Symbol.for("react.memo_cache_sentinel") ? (r = (0, o.jsxs)(Q.E, {
                border: !1,
                spacious: !1,
                children: [(0, o.jsx)(Q.E.Heading, {
                    children: "Unable to load page."
                }), (0, o.jsx)(Q.E.Description, {
                    children: "Please reload page and try again"
                })]
            }), n[2] = r) : r = n[2], r
        }
        er.displayName = "UnhandledRouteErrorInner", en.displayName = "BaseRouteErrorBoundary";
        let eo = e => {
            let t, r = (0, g.c)(3),
                {
                    appName: n
                } = e,
                a = (0, d.r5)();
            return r[0] !== n || r[1] !== a ? (t = (0, o.jsx)(ea, {
                routeError: a,
                appName: n
            }), r[0] = n, r[1] = a, r[2] = t) : t = r[2], t
        };
        eo.displayName = "RootAppRouteErrorElement";
        let ea = e => {
            let t, r = (0, g.c)(6),
                {
                    routeError: n,
                    appName: a
                } = e;
            if ((0, G.cH)(n)) {
                let e;
                return r[0] !== a || r[1] !== n ? (e = (0, o.jsx)(ei, {
                    appName: a,
                    responseError: n
                }), r[0] = a, r[1] = n, r[2] = e) : e = r[2], e
            }
            return r[3] !== a || r[4] !== n ? (t = (0, o.jsx)(en, {
                routeError: n,
                appName: a
            }), r[3] = a, r[4] = n, r[5] = t) : t = r[5], t
        };

        function ei(e) {
            let t, r, n, a, i, s = (0, g.c)(8),
                {
                    appName: l,
                    responseError: u
                } = e;
            (0, Z.u)(u), s[0] !== l ? (t = {
                reactAppName: l,
                devLogLabel: "InternalResponseErrorElement"
            }, s[0] = l, s[1] = t) : t = s[1], (0, X.v)(u, t), s[2] === Symbol.for("react.memo_cache_sentinel") ? (r = (0, o.jsx)(Q.E.Heading, {
                children: "Unable to load page."
            }), s[2] = r) : r = s[2];
            let c = `Status: ${u.response.status} Message: ${u.message}`;
            return s[3] !== c ? (n = (0, o.jsx)(Q.E.Description, {
                children: c
            }), s[3] = c, s[4] = n) : n = s[4], s[5] === Symbol.for("react.memo_cache_sentinel") ? (a = (0, o.jsx)(Q.E.Description, {
                children: "Please reload page and try again"
            }), s[5] = a) : a = s[5], s[6] !== n ? (i = (0, o.jsxs)(Q.E, {
                border: !1,
                spacious: !1,
                children: [r, n, a]
            }), s[6] = n, s[7] = i) : i = s[7], i
        }
        ea.displayName = "RootAppRouteErrorInner", ei.displayName = "ResponseErrorElement";
        var es = r(147966);
        let el = new Map,
            eu = !1,
            ec = es.fV.href;
        async function ed() {
            let {
                session: e
            } = await r.e(26533).then(r.bind(r, 807332));
            document.addEventListener("turbo:click", e => {
                ec = e.detail.url
            }), window.addEventListener("popstate", t => {
                let r = t.state ? .turbo ? .restorationIdentifier;
                if (!r) return;
                let n = e.history.restorationIdentifier;
                if (r !== n) {
                    let {
                        scrollPosition: t
                    } = e.history.getRestorationDataForIdentifier(n);
                    t || e.history.updateRestorationData({
                        scrollPosition: {
                            x: window.scrollX,
                            y: window.scrollY
                        }
                    }), e.history.location = new URL(window.location.href, window.location.origin), e.history.restorationIdentifier = r
                }
                let {
                    scrollPosition: o
                } = e.history.getRestorationDataForIdentifier(r);
                o && el.set(window.location.href, o)
            })
        }
        async function eh() {
            es.cg && (eu || (await ed(), eu = !0))
        }

        function ef() {
            let e = window.location.href;
            if (e === ec && e.includes("#") || function(e, t) {
                    try {
                        let r = new URL(e, window.location.origin),
                            n = new URL(t, window.location.origin);
                        return r.pathname === n.pathname && r.search === n.search && "" !== r.hash && "" !== n.hash && r.hash !== n.hash
                    } catch {
                        return !1
                    }
                }(ec, e)) {
                ec = e;
                return
            }
            ec = e;
            let t = el.get(e);
            if (!t) return;
            let r = requestAnimationFrame(() => {
                window.scrollTo(t.x, t.y)
            });
            return () => {
                cancelAnimationFrame(r)
            }
        }
        let ep = es.cg ? function() {
            (0, E.useLayoutEffect)(ef)
        } : v.l;

        function em() {
            let e, t = (0, g.c)(1);
            return (ep(), "u" > typeof jest) ? null : (t[0] === Symbol.for("react.memo_cache_sentinel") ? (e = (0, o.jsx)(d.OA, {
                getKey: ey
            }), t[0] = e) : e = t[0], e)
        }
        eh(), em.displayName = "CombinedScrollRestoration";
        let ey = e => e.pathname + e.search + e.hash;
        var eg = r(451237);
        let ev = {
            scrollRestoration: !0,
            trailingSlash: "preserve",
            defaultStaleReloadMode: "blocking",
            defaultPreloadStaleTime: 3e4,
            defaultPreloadDelay: d.TY
        };
        var ew = r(936087),
            eb = r(381098);

        function eR() {
            let e, t, r = (0, g.c)(4),
                n = (0, z.yT)(),
                o = (0, F.jE)();
            return r[0] !== n || r[1] !== o ? (e = () => {
                for (let e of [...n].reverse()) {
                    if (!e.handle ? .queryRoute) continue;
                    let t = e.loaderData ? .queries.mainQuery;
                    if (!t) continue;
                    let r = function(e, t) {
                        let r = e.getQueryData(t);
                        if (r) {
                            if ("title" in r && r.title) return r.title;
                            else if ("meta" in r && r.meta) return r.meta.title
                        } else {
                            (0, eb.G)() && console.error("Unexpected attempt to read title for a query that is not in the query client. If you encounter this error in your application, please reach out to #react to help diagnose the issue.");
                            return
                        }
                    }(o, t.queryKey);
                    if (r) {
                        (0, ew.D)((0, ew.Y)(r));
                        break
                    }
                }
            }, t = [n, o], r[0] = n, r[1] = o, r[2] = e, r[3] = t) : (e = r[2], t = r[3]), (0, E.useEffect)(e, t), null
        }

        function eE(e) {
            let t, r, n, a, i, s, l, u, c, h, p, m, y, v = (0, g.c)(26),
                {
                    routes: w,
                    options: E
                } = e,
                {
                    appPayload: x,
                    appName: S,
                    ssrError: _,
                    children: P,
                    dataRouterEnabled: L,
                    tanstackRouterEnabled: k
                } = E;
            v[0] === Symbol.for("react.memo_cache_sentinel") ? (t = (0, f.G7)("react_navigation_focus_tanstack"), v[0] = t) : t = v[0];
            let N = t;
            v[1] === Symbol.for("react.memo_cache_sentinel") ? (r = (0, o.jsx)(d.sv, {}), v[1] = r) : r = v[1], v[2] !== _ ? (n = (0, o.jsx)(R.h, {
                ssrError: _
            }), v[2] = _, v[3] = n) : n = v[3], v[4] === Symbol.for("react.memo_cache_sentinel") ? (a = (0, o.jsx)(eg.e, {}), i = N ? (0, o.jsx)($, {}) : (0, o.jsx)(O, {}), s = (0, o.jsx)(em, {}), l = (0, o.jsx)(W, {}), u = (0, o.jsx)(eR, {}), v[4] = a, v[5] = i, v[6] = s, v[7] = l, v[8] = u) : (a = v[4], i = v[5], s = v[6], l = v[7], u = v[8]), v[9] !== w ? (c = (0, o.jsx)(C, {
                routes: w
            }), v[9] = w, v[10] = c) : c = v[10], v[11] !== P || v[12] !== c || v[13] !== n ? (h = (0, o.jsxs)(o.Fragment, {
                children: [r, P, n, a, i, s, l, u, c]
            }), v[11] = P, v[12] = c, v[13] = n, v[14] = h) : h = v[14];
            let T = h;
            return v[15] !== w || v[16] !== T || v[17] !== k ? (p = k ? T : (0, o.jsx)(D.d, {
                routes: w,
                children: T
            }), v[15] = w, v[16] = T, v[17] = k, v[18] = p) : p = v[18], v[19] !== x || v[20] !== p ? (m = (0, o.jsx)(I.z, {
                value: x,
                children: p
            }), v[19] = x, v[20] = p, v[21] = m) : m = v[21], v[22] !== S || v[23] !== L || v[24] !== m ? (y = (0, o.jsx)(b.U, {
                appName: S,
                dataRouterEnabled: L,
                children: m
            }), v[22] = S, v[23] = L, v[24] = m, v[25] = y) : y = v[25], y
        }
        async function ex(e, t) {
            let {
                routes: r
            } = (await y("app-shell")).registration({
                embeddedData: t
            });
            if (1 !== r.length) throw Error("Expected app shell routes to have a single entry");
            let [n] = r;
            return [{ ...n,
                children: e,
                index: !1
            }]
        }
        eR.displayName = "TitleManager", eE.displayName = "SharedProviders";
        let eS = new p.R;
        async function e_(e) {
            return eS.getRegistration(e).promise
        }
        var eP = r(547872);

        function eC(e) {
            let t, r, n, a, i, s, l, u, c = (0, g.c)(2),
                {
                    App: h
                } = e;
            return s = (0, g.c)(8), l = (0, eP.B)(), u = (0, I.X)(), s[0] !== u || s[1] !== l ? (r = () => {
                let e = new AbortController;
                return document.addEventListener(B.z.INITIAL, function() {
                    document.dispatchEvent(new U.gh({
                        payload: l,
                        appPayload: u
                    }))
                }, {
                    signal: e.signal
                }), () => {
                    e.abort()
                }
            }, n = [u, l], s[0] = u, s[1] = l, s[2] = r, s[3] = n) : (r = s[2], n = s[3]), (0, E.useEffect)(r, n), s[4] !== u || s[5] !== l ? (a = () => {
                document.dispatchEvent(new U.gh({
                    payload: l,
                    appPayload: u
                }))
            }, i = [u, l], s[4] = u, s[5] = l, s[6] = a, s[7] = i) : (a = s[6], i = s[7]), (0, E.useEffect)(a, i), c[0] !== h ? (t = h ? (0, o.jsx)(h, {
                children: (0, o.jsx)(d.sv, {})
            }) : (0, o.jsx)(d.sv, {}), c[0] = h, c[1] = t) : t = c[1], t
        }
        eC.displayName = "AppWrapper";
        var eL = r(687996),
            ek = r(49831),
            eN = r(892960);
        let eT = (0, E.createContext)(null);

        function ej(e) {
            let t, r, n = (0, g.c)(9),
                {
                    appPayload: a,
                    children: i,
                    error: s,
                    navigateOnError: l,
                    routes: u,
                    routeStateMap: c
                } = e;
            return n[0] !== a || n[1] !== i || n[2] !== s || n[3] !== l || n[4] !== c ? (t = s && !l ? (0, o.jsx)(ek.M, { ...s
            }) : (0, o.jsx)(I.z, {
                value: a,
                children: (0, o.jsx)(eT, {
                    value: s,
                    children: (0, o.jsx)(eN.Y, {
                        value: c,
                        children: i
                    })
                })
            }), n[0] = a, n[1] = i, n[2] = s, n[3] = l, n[4] = c, n[5] = t) : t = n[5], n[6] !== u || n[7] !== t ? (r = (0, o.jsx)(D.d, {
                routes: u,
                children: t
            }), n[6] = u, n[7] = t, n[8] = r) : r = n[8], r
        }
        eT.displayName = "NavigationErrorContext", ej.displayName = "NavigatorRouter";
        var eA = r(191968),
            eD = r(250744);
        let eI = (e, t) => null !== e && null !== t && e.pathname === t.pathname && e.search === t.search && !!t.hash;
        class eM {
            state;#
            E;#
            x;
            initialEmbeddedData;
            constructor(e, t, r, n) {
                this.#E = n;
                let o = this.matchLocation(e);
                if (!o) throw Error(`No route found for initial location: ${e.pathname} in [${this.#S()}]`);
                let {
                    data: a,
                    title: i,
                    isValid: s
                } = o.route.loadFromEmbeddedData({
                    embeddedData: t,
                    location: e,
                    pathParams: o.params
                });
                this.initialEmbeddedData = t, this.#x = o.route, this.state = {
                    location: e,
                    routeStateMap: {
                        [e.key]: {
                            type: "loaded",
                            data: a,
                            title: i,
                            isValid: s
                        }
                    },
                    appPayload: r,
                    pendingNavigation: null,
                    error: null,
                    navigateOnError: !1,
                    turboCount: (0, u.JV)().turboCount || 0
                }
            }
            update(e) {
                this.state = Object.assign({}, this.state, e);
                let t = this.getAppNavigationState();
                this.#_ ? .(t)
            }#
            P = [];
            subscribe(e) {
                let t = this.#P.push(e);
                return () => {
                    this.#P[t] = null
                }
            }#
            _(e) {
                for (let t of this.#P) t ? .(e)
            }#
            C = new WeakMap;
            getAppNavigationState = () => {
                let e = this.#C.get(this.state);
                if (e) return e;
                let {
                    location: t,
                    error: r,
                    navigateOnError: n,
                    routeStateMap: o,
                    appPayload: a,
                    pendingNavigation: i
                } = this.state, s = {
                    location: t,
                    error: r,
                    navigateOnError: n,
                    routeStateMap: o,
                    appPayload: a,
                    isLoading: !!i
                };
                return this.#C.set(this.state, s), s
            };
            async handleHistoryUpdate(e) {
                if ("POP" === e.action && (0, u.JV)().turboCount !== this.state.turboCount) return;
                if (this.isHashNavigation(e)) return void this.navigateWithCurrentPayload(e);
                "POP" !== e.action && (0, eA.SC)("react");
                let t = this.state.routeStateMap[e.location.key],
                    r = void 0 !== t;
                if (t && t.isValid && (r = t.isValid()), r) this.navigateFromHistory(e);
                else {
                    let t = this.matchLocation(e.location);
                    if (!t) throw Error("handleHistoryUpdate should only be called for matching routes");
                    if (t.route.transitionType === eD.E.TRANSITION_WHILE_FETCHING && this.navigateWithoutPayload(e), t.route.transitionType === eD.E.TRANSITION_WITHOUT_FETCH) return void this.navigateWithoutPayload(e);
                    let r = (0, u.JV)().usr ? .__prefetched_data;
                    if (r) return void this.leaveLoadingStateWithRouteData(e, r, r.title);
                    this.enterLoadingState(e);
                    let n = await t.route.coreLoader({
                        location: e.location,
                        pathParams: t.params,
                        embeddedData: t.route === this.#x ? this.initialEmbeddedData : void 0
                    });
                    if (e.location !== this.state.pendingNavigation ? .update.location) return;
                    switch (n.type) {
                        case "loaded":
                            this.leaveLoadingStateWithRouteData(e, n.data, n.title, n.isValid);
                            break;
                        case "error":
                            this.leaveLoadingStateWithError(e, n.error, !1);
                            break;
                        case "redirect":
                            window.location.replace(n.url + location.hash);
                            break;
                        case "route-handled-error":
                            this.leaveLoadingStateWithError(e, n.error, !0);
                            break;
                        default:
                            throw Error(`Unexpected loader result type: ${n.type}`)
                    }
                }
            }
            matchLocation(e) {
                return eO(this.#E, e)
            }
            isHashNavigation(e) {
                return eI(this.state.location, e.location)
            }
            navigateFromHistory(e) {
                this.update({
                    location: e.location,
                    pendingNavigation: null,
                    error: null
                })
            }
            enterLoadingState(e) {
                this.update({
                    pendingNavigation: {
                        update: e
                    }
                })
            }
            leaveLoadingStateWithError(e, t, r) {
                this.update({
                    location: e.location,
                    error: t,
                    pendingNavigation: null,
                    navigateOnError: r
                })
            }
            navigateWithoutPayload(e) {
                this.update({
                    location: e.location,
                    error: null
                })
            }
            navigateWithCurrentPayload(e) {
                let t = this.state.location.key,
                    r = t + e.location.hash,
                    n = { ...e.location,
                        key: r
                    },
                    o = { ...this.state.routeStateMap,
                        [r]: this.state.routeStateMap[t]
                    };
                this.update({ ...e,
                    location: n,
                    routeStateMap: o,
                    error: null
                })
            }
            leaveLoadingStateWithRouteData(e, t, r, n) {
                this.update({
                    location: e.location,
                    pendingNavigation: null,
                    routeStateMap: t ? { ...this.state.routeStateMap,
                        [e.location.key]: {
                            type: "loaded",
                            data: t,
                            title: r,
                            isValid: n
                        }
                    } : this.state.routeStateMap,
                    error: null
                })
            }#
            S() {
                return this.#E.map(e => e.path).join(", ")
            }
        }

        function eO(e, t) {
            return (0, d.ue)(e, t.pathname) ? .[0]
        }
        var e$ = r(437901);

        function eF(e) {
            var t;
            let r, n, a, i, s, l, u, c, h, f, p, m, y, v = (0, g.c)(32),
                {
                    appName: w,
                    initialLocation: x,
                    history: S,
                    embeddedData: _,
                    routes: P,
                    App: C,
                    ssrError: L,
                    onError: k
                } = e;
            v[0] !== w || v[1] !== _ || v[2] !== x || v[3] !== P ? (r = {
                initialLocation: x,
                appName: w,
                embeddedData: _,
                routes: P
            }, v[0] = w, v[1] = _, v[2] = x, v[3] = P, v[4] = r) : r = v[4];
            let [N, T] = function(e) {
                let t, r, n, o, a, i = (0, g.c)(13),
                    {
                        initialLocation: s,
                        embeddedData: l,
                        routes: u
                    } = e;
                i[0] !== l || i[1] !== s || i[2] !== u ? (t = () => {
                    let {
                        appPayload: e,
                        ...t
                    } = l;
                    return new eM(s, { ...t,
                        enabled_features: e ? .enabled_features ? e.enabled_features : {}
                    }, e, u)
                }, i[0] = l, i[1] = s, i[2] = u, i[3] = t) : t = i[3];
                let [c] = (0, E.useState)(t);
                i[4] !== c ? (r = e => {
                    let t = c.subscribe(e);
                    return () => {
                        t()
                    }
                }, i[4] = c, i[5] = r) : r = i[5];
                let d = (0, E.useSyncExternalStore)(r, c.getAppNavigationState, c.getAppNavigationState);
                i[6] !== c ? (n = e => {
                    (0, E.startTransition)(() => {
                        c.handleHistoryUpdate(e)
                    })
                }, i[6] = c, i[7] = n) : n = i[7];
                let h = n;
                return i[8] !== h ? (o = {
                    handleHistoryUpdate: h
                }, i[8] = h, i[9] = o) : o = i[9], i[10] !== d || i[11] !== o ? (a = [d, o], i[10] = d, i[11] = o, i[12] = a) : a = i[12], a
            }(r), {
                location: j,
                error: A,
                routeStateMap: D,
                appPayload: I,
                navigateOnError: O,
                isLoading: $
            } = N, {
                handleHistoryUpdate: F
            } = T;
            return M($, j), (0, e$.n)(j, $, A), t = D[j.key], m = (0, g.c)(5), y = (0, E.useRef)(null), m[0] !== t || m[1] !== A || m[2] !== j ? (f = () => {
                if (y.current || (y.current = j), !eI(y.current, j) && (A || t))
                    if (A) {
                        var e;
                        let t, r = (t = 404 === (e = A).httpStatus ? "404 Page not found" : 500 === e.httpStatus ? "500 Internal server error" : e.httpStatus ? `Error ${e.httpStatus}` : "Error", (0, ew.Y)(t));
                        (0, ew.D)(r)
                    } else t ? .type === "loaded" && t.title && (0, ew.D)((0, ew.Y)(t.title));
                y.current ? .key !== j.key && (y.current = j)
            }, p = [A, t, j], m[0] = t, m[1] = A, m[2] = j, m[3] = f, m[4] = p) : (f = m[3], p = m[4]), (0, E.useEffect)(f, p), ep(), v[5] !== F || v[6] !== S ? (n = () => S.listen(F), a = [S, F], v[5] = F, v[6] = S, v[7] = n, v[8] = a) : (n = v[7], a = v[8]), (0, E.useLayoutEffect)(n, a), v[9] !== C || v[10] !== P ? (i = (0, o.jsx)(eU, {
                routes: P,
                App: C
            }), v[9] = C, v[10] = P, v[11] = i) : i = v[11], v[12] !== S || v[13] !== j || v[14] !== i ? (s = (0, o.jsx)(d.Ix, {
                location: j,
                navigator: S,
                children: i
            }), v[12] = S, v[13] = j, v[14] = i, v[15] = s) : s = v[15], v[16] !== L ? (l = (0, o.jsx)(R.h, {
                ssrError: L
            }), v[16] = L, v[17] = l) : l = v[17], v[18] !== I || v[19] !== A || v[20] !== O || v[21] !== D || v[22] !== P || v[23] !== s || v[24] !== l ? (u = (0, o.jsxs)(ej, {
                appPayload: I,
                error: A,
                navigateOnError: O,
                routes: P,
                routeStateMap: D,
                children: [s, l]
            }), v[18] = I, v[19] = A, v[20] = O, v[21] = D, v[22] = P, v[23] = s, v[24] = l, v[25] = u) : u = v[25], v[26] !== k || v[27] !== u ? (c = (0, o.jsx)(eL.t, {
                onError: k,
                critical: !0,
                children: u
            }), v[26] = k, v[27] = u, v[28] = c) : c = v[28], v[29] !== w || v[30] !== c ? (h = (0, o.jsx)(b.U, {
                appName: w,
                dataRouterEnabled: !1,
                children: c
            }), v[29] = w, v[30] = c, v[31] = h) : h = v[31], h
        }

        function eU(e) {
            let t, r, n, a, i = (0, g.c)(10),
                {
                    App: s,
                    routes: l
                } = e;
            return i[0] !== s ? (t = (0, o.jsx)(eC, {
                App: s
            }), i[0] = s, i[1] = t) : t = i[1], i[2] !== l ? (r = (0, o.jsx)(C, {
                routes: l
            }), i[2] = l, i[3] = r) : r = i[3], i[4] !== t || i[5] !== r ? (n = (0, o.jsxs)(o.Fragment, {
                children: [t, r]
            }), i[4] = t, i[5] = r, i[6] = n) : n = i[6], i[7] !== l || i[8] !== n ? (a = [{
                element: n,
                children: l
            }], i[7] = l, i[8] = n, i[9] = a) : a = i[9], (0, d.Ye)(a)
        }
        async function eB(e) {
            try {
                await e.preload ? .()
            } catch {}
        }
        async function eH(e, t) {
            let r = eO(e, t);
            if (!r) return;
            let n = function e(t) {
                return t.flatMap(t => {
                    let r = t.Component;
                    return [...r ? .preload && !1 !== r.ssr ? [eB(r)] : [], ...t.children ? e(t.children) : []]
                })
            }([r.route]);
            await Promise.allSettled(n)
        }
        async function ez(e, t) {
            let r = (0, d.ue)(e, t);
            if (!r || 0 === r.length) return;
            let n = function e(t) {
                return t.flatMap(t => {
                    let r = t.Component;
                    return [...r ? .preload && !1 !== r.ssr ? [eB(r)] : [], ...t.children ? e(t.children) : []]
                })
            }(r.map(e => e.route));
            await Promise.allSettled(n)
        }
        eh(), eF.displayName = "NavigatorClientEntry", eU.displayName = "AppRoutes";
        var eq = r(97210),
            eW = r(722484);
        class eV extends eW.H {
            nameAttribute = "app-name";
            appRoutes = [];
            get enabledFeatures() {
                if (!this.embeddedDataJSON) return [];
                let e = this.embeddedDataJSON.appPayload ? .enabled_features || {};
                return Object.keys(e).filter(t => e[t])
            }
            get routes() {
                return (this.appRoutes ? ? []).length > 0 ? this.appRoutes : this.routerOrHistory ? .routes ? ? []
            }
            get navigate() {
                return "push" in this.routerOrHistory ? this.routerOrHistory.push : "navigate" in this.routerOrHistory ? this.routerOrHistory.navigate : void 0
            }
            connectedCallback() {
                super.connectedCallback(), this.uuid = (0, i._S)(), (0, i.cW)(this.uuid), window.addEventListener("popstate", this.popStateListener, !0)
            }
            popStateListener = e => {
                e.state && this.uuid !== (0, u.JV)().appId && this.#L()
            };
            disconnectedCallback() {
                window.removeEventListener("popstate", this.popStateListener, !0), this.#L(), super.disconnectedCallback()
            }#
            L() {
                if (this.routerOrHistory) {
                    var e;
                    let t;
                    (t = "history" in (e = this.routerOrHistory) ? e.history : null, "function" != typeof t ? .destroy || "dispose" in e) ? "dispose" in this.routerOrHistory && this.routerOrHistory.dispose(): this.routerOrHistory.history.destroy()
                }
            }
            get isDataRouterEnabled() {
                return "true" === this.getAttribute("data-data-router-enabled")
            }
            get includeAppShell() {
                return "true" === this.getAttribute("data-app-shell")
            }
            async getReactNode(e, t) {
                if (this.isDataRouterEnabled) {
                    var r;
                    let n, o, a = await y(this.name);
                    return this.#k(e, t, a, (r = a.tanStackRouterEnabled, n = (0, f.G7)("react_data_router_tanstack_allowed"), o = "boolean" == typeof r ? r : r(), n && o))
                }
                let n = await e_(this.name);
                return this.#N(e, t, n.registration)
            }
            async# k(e, t, r, n = !1) {
                e && (this.#T(e), (0, c.SX)().removeQueries({
                    queryKey: [this.name]
                }));
                let {
                    routes: a
                } = r.registration({
                    embeddedData: e
                });
                this.includeAppShell && (a = await ex(a, e));
                let i = n ? await this.#j(e, a) : await this.#A(e, a);
                return (0, o.jsx)(eq.fD, {
                    appName: this.name,
                    isDataRouterEnabled: !0,
                    children: (0, o.jsx)(eq.VM, {
                        id: this.name,
                        children: i
                    })
                })
            }
            async# A(e, t) {
                return this.routerOrHistory = (0, h.T)((0, d.Ys)(function(e, t) {
                    let {
                        HydrateFallback: r,
                        ...n
                    } = t;
                    return [{
                        id: "__DATA_ROUTER_ROOT__",
                        errorElement: (0, o.jsx)(ee, {
                            appName: n.appName
                        }),
                        HydrateFallback: r,
                        element: (0, o.jsx)(eE, {
                            routes: e,
                            options: n
                        }),
                        children: [{
                            id: "__DATA_ROUTER_APPLICATION_ROUTES__",
                            errorElement: (0, o.jsx)(eo, {
                                appName: n.appName
                            }),
                            children: e
                        }]
                    }]
                }(t, {
                    appPayload: e.appPayload,
                    ssrError: this.ssrError,
                    appName: this.name,
                    dataRouterEnabled: !0
                }))), await ez(this.routerOrHistory.routes, this.routerOrHistory.state.location.pathname), (0, o.jsx)(d.pg, {
                    router: this.routerOrHistory
                })
            }
            async# j(e, t) {
                let r = (0, c.SX)(),
                    n = function(e, t) {
                        let {
                            history: r,
                            context: n,
                            HydrateFallback: a,
                            ...i
                        } = t, s = { ...i,
                            dataRouterEnabled: !0,
                            tanstackRouterEnabled: !0
                        }, l = () => {
                            let t, r = (0, g.c)(1);
                            return r[0] === Symbol.for("react.memo_cache_sentinel") ? (t = (0, o.jsx)(eE, {
                                routes: e,
                                options: s
                            }), r[0] = t) : t = r[0], t
                        };
                        l.displayName = "RootComponent";
                        let u = e => {
                            let t, r = (0, g.c)(2),
                                {
                                    error: n
                                } = e;
                            return r[0] !== n ? (t = (0, o.jsx)(er, {
                                routeError: n,
                                appName: i.appName
                            }), r[0] = n, r[1] = t) : t = r[1], t
                        };
                        u.displayName = "RootErrorComponent";
                        let c = e => {
                            let t, r = (0, g.c)(2),
                                {
                                    error: n
                                } = e;
                            return r[0] !== n ? (t = (0, o.jsx)(ea, {
                                routeError: n,
                                appName: i.appName
                            }), r[0] = n, r[1] = t) : t = r[1], t
                        };
                        return c.displayName = "AppRoutesErrorComponent", (0, d.tA)({ ...ev,
                            context: n,
                            rootComponent: l,
                            rootPendingComponent: a ? () => (0, o.jsx)(a, {}) : void 0,
                            rootErrorComponent: u,
                            appErrorComponent: c,
                            defaultNotFoundComponent: et,
                            routeObjects: e,
                            history: r,
                            defaultOnCatch: v.l,
                            getRouteOptions: K,
                            scrollRestoration: !w.X3
                        })
                    }(t, {
                        appPayload: e.appPayload,
                        ssrError: this.ssrError,
                        appName: this.name,
                        context: {
                            embeddedData: e,
                            queryClient: r
                        }
                    });
                return this.routerOrHistory = n, await n.load(), this.hasSSRContent && (n.ssr = {
                    manifest: void 0
                }), (0, o.jsx)(d.Un, {
                    router: n
                })
            }
            async# N(e, t, r) {
                let {
                    App: n,
                    routes: a
                } = r(), i = this.getAttribute("initial-path");
                if (this.isLazy) {
                    let t = await fetch(i, {
                            mode: "no-cors",
                            cache: "no-cache",
                            credentials: "include"
                        }),
                        {
                            payload: r
                        } = await t.json();
                    e.payload = r
                }
                let s = globalThis.window,
                    {
                        pathname: l,
                        search: c,
                        hash: h
                    } = new URL(`${i}${s?.location.hash??""}`, s ? .location.href ? ? "https://github.com");
                (0, u.C3)({
                    key: Math.random().toString(36).substr(2, 8)
                });
                let f = function(e = {}) {
                    let t, r = (0, d.aA)({ ...e,
                            v5Compat: !0
                        }),
                        n = [],
                        o = !1;

                    function a(e) {
                        if (n.length > 0)
                            for (let t of n) t({
                                retry() {
                                    e()
                                }
                            });
                        else e()
                    }
                    return {
                        get action() {
                            return r.action
                        },
                        get location() {
                            return r.location
                        },
                        createHref: e => r.createHref(e),
                        createURL: e => r.createURL(e),
                        encodeLocation: e => r.encodeLocation(e),
                        push(e, t) {
                            a(() => r.push(e, t))
                        },
                        replace(e, t) {
                            a(() => r.replace(e, t))
                        },
                        go(e) {
                            a(() => r.go(e))
                        },
                        listen(e) {
                            if (t) throw Error("A history only accepts one active listener");
                            return t = e, () => {
                                t = void 0
                            }
                        },
                        dispose: r.listen(e => {
                            if (o) {
                                o = !1;
                                return
                            }
                            if (e.action === d.bi.Pop && n.length && null !== e.delta && n.length > 0) {
                                let t = e.delta;
                                for (let e of (o = !0, r.go(-1 * t), n)) e({
                                    retry() {
                                        r.go(t)
                                    }
                                })
                            } else t ? .(e)
                        }),
                        block: e => (n.push(e), () => {
                            n = n.filter(t => t !== e)
                        })
                    }
                }({
                    window: s
                });
                this.routerOrHistory = f, this.appRoutes = a;
                let {
                    key: p,
                    state: m
                } = f.location, y = {
                    pathname: l,
                    search: c,
                    hash: h,
                    key: p,
                    state: m
                };
                return await eH(a, y), (0, o.jsx)(eq.fD, {
                    appName: this.name,
                    isDataRouterEnabled: !1,
                    children: (0, o.jsx)(eq.VM, {
                        id: this.name,
                        children: (0, o.jsx)(eF, {
                            appName: this.name,
                            initialLocation: y,
                            history: f,
                            embeddedData: e,
                            routes: a,
                            App: n,
                            ssrError: this.ssrError,
                            onError: t
                        })
                    })
                })
            }#
            T(e) {
                if (e.payload)
                    for (let t of this.querySelectorAll("rails-partial")) {
                        let r = t.getAttribute("data-partial-name");
                        r && (e.payload[r] = (0, s.v)(l.W, {
                            value: t.innerHTML
                        }))
                    }
            }
            get isLazy() {
                return "true" === this.getAttribute("data-lazy")
            }
        }

        function eK(e, t) {
            eS.register(e, {
                type: "NavigatorApp",
                registration: t
            })
        }

        function eJ(e) {
            m.register(e.name, {
                type: "DataRouterApp",
                registration: e.registration,
                tanStackRouterEnabled: e.tanStackRouterEnabled
            })
        }(0, n.Cg)([(0, a.p_)("react-app")], eV)
    },
    382500(e, t, r) {
        r.d(t, {
            k: () => p
        });
        var n = r(331635),
            o = r(474848),
            a = r(651135),
            i = r(685136),
            s = r(74719),
            l = r(996060),
            u = r(97210),
            c = r(567497);
        let d = new(r(406637)).R;
        var h = r(722484);
        class f extends h.H {
            nameAttribute = "partial-name";
            async getReactNode(e, t) {
                var r;
                let {
                    Component: n
                } = await (r = this.name, d.getRegistration(r).promise), a = this.closest("react-partial-anchor"), h = (0, c.b3)(a), f = { ...e,
                    props: { ...e.props,
                        ...h
                    }
                }, p = (0, o.jsx)(i.BV, {
                    children: (0, o.jsx)(i.qh, {
                        path: "*",
                        element: (0, o.jsx)(n, { ...f.props
                        })
                    })
                });
                return (0, o.jsx)(u.fD, {
                    appName: this.name,
                    isDataRouterEnabled: !1,
                    children: (0, o.jsx)(u.VM, {
                        id: this.name,
                        children: (0, o.jsx)(s.c, {
                            partialName: this.name,
                            onError: t,
                            ssrError: this.ssrError,
                            children: (0, o.jsx)(l.p, {
                                partialName: this.name,
                                children: p
                            })
                        })
                    })
                })
            }
        }

        function p(e, t) {
            return d.register(e, t)
        }(0, n.Cg)([(0, a.p_)("react-partial")], f)
    },
    892960(e, t, r) {
        let n = (0, r(296540).createContext)({});
        n.displayName = "RouteStateMapContext", r.d(t, {}, {
            Y: n
        })
    },
    912223(e, t, r) {
        let n = "@github-ui/react-core/router:state-update";
        class o extends Event {
            constructor() {
                super(n)
            }
        }
        class a extends EventTarget {
            static# D;#
            I = null;
            constructor() {
                super()
            }
            static getInstance() {
                return a.#D || (a.#D = new a), a.#D
            }
            getState() {
                return this.#I
            }
            setState(e) {
                this.#I = e, this.dispatchEvent(new o)
            }
            subscribe(e) {
                let t = new AbortController;
                return this.addEventListener(n, () => {
                    e(this.#I)
                }, {
                    signal: t.signal
                }), e(this.#I), () => {
                    t.abort()
                }
            }
        }

        function i() {
            return a.getInstance()
        }
        r.d(t, {
            n: () => i
        })
    },
    566010(e, t, r) {
        var n = r(296540);
        let o = (0, n.createContext)(void 0);

        function a() {
            return (0, n.use)(o)
        }
        o.displayName = "AppPayloadContext", o.displayName = "AppPayloadContext", r.d(t, {
            X: () => a
        }, {
            z: o
        })
    },
    879320(e, t, r) {
        var n = r(916522),
            o = r(147966),
            a = r(296540);

        function i(e) {
            return {
                colorMode: function(e) {
                    switch (e) {
                        case "light":
                            return "day";
                        case "dark":
                            return "night";
                        default:
                            return "auto"
                    }
                }(e.colorMode),
                dayScheme: e.lightTheme,
                nightScheme: e.darkTheme
            }
        }
        let s = new Set(["light_colorblind_high_contrast", "light_tritanopia_high_contrast", "dark_colorblind_high_contrast", "dark_tritanopia_high_contrast", "dark_dimmed_high_contrast"]),
            l = {
                light_colorblind_high_contrast: "light_high_contrast",
                light_tritanopia_high_contrast: "light_high_contrast",
                dark_colorblind_high_contrast: "dark_high_contrast",
                dark_tritanopia_high_contrast: "dark_high_contrast",
                dark_dimmed_high_contrast: "dark_high_contrast"
            };

        function u(e) {
            var t;
            return void 0 !== e && (t = e, s.has(t)) ? l[e] : e
        }
        let c = o.XC ? function() {
            let e, t, r, s, l, c, d = (0, n.c)(11),
                {
                    documentElement: h
                } = o.XC;
            d[0] === Symbol.for("react.memo_cache_sentinel") ? (e = () => i(h.dataset), d[0] = e) : e = d[0];
            let [f, p] = (0, a.useState)(e);
            return d[1] === Symbol.for("react.memo_cache_sentinel") ? (t = () => {
                let e = new MutationObserver(() => p(i(h.dataset)));
                return e.observe(h, {
                    attributes: !0,
                    attributeFilter: ["data-color-mode", "data-light-theme", "data-dark-theme"]
                }), () => e.disconnect()
            }, r = [h], d[1] = t, d[2] = r) : (t = d[1], r = d[2]), (0, a.useEffect)(t, r), d[3] !== f.dayScheme ? (s = u(f.dayScheme), d[3] = f.dayScheme, d[4] = s) : s = d[4], d[5] !== f.nightScheme ? (l = u(f.nightScheme), d[5] = f.nightScheme, d[6] = l) : l = d[6], d[7] !== f || d[8] !== s || d[9] !== l ? (c = { ...f,
                dayScheme: s,
                nightScheme: l
            }, d[7] = f, d[8] = s, d[9] = l, d[10] = c) : c = d[10], c
        } : function() {
            return i((void 0) ? ? {})
        };
        r.d(t, {}, {
            A: c
        })
    },
    645315(e, t, r) {
        var n = r(685136),
            o = r(296540),
            a = r(892960);

        function i() {
            return (0, o.use)(a.Y)[(0, n.zy)().key]
        }
        r.d(t, {
            N: () => i
        })
    },
    345051(e, t, r) {
        var n = r(566010);
        let o = () => (0, n.X)() ? .enabled_features ? ? {};
        r.d(t, {}, {
            h: o,
            u: e => !!o()[e]
        })
    },
    547872(e, t, r) {
        var n = r(645315);

        function o() {
            let e = (0, n.N)(),
                t = e && "loaded" === e.type ? e.data : void 0;
            return t ? .payload
        }
        r.d(t, {
            B: () => o
        })
    },
    437901(e, t, r) {
        var n = r(916522),
            o = r(191968),
            a = r(175895),
            i = r(357624),
            s = r(147966),
            l = r(826099),
            u = r(296540);
        let c = "react_nav_duration";
        r.d(t, {}, {
            n: (e, t, r) => {
                let d, h, f = (0, n.c)(9),
                    p = (0, u.useRef)(void 0);
                f[0] !== r || f[1] !== t || f[2] !== e.key ? (d = () => {
                    t || void 0 !== p.current && p.current === e.key || ((0, i.LM)() ? (r ? (0, o.o4)() : ((0, o.rZ)(), (0, o.iS)()), function() {
                        let e = s.XC ? .querySelector("meta[name=visitor-payload]");
                        if (!e) return;
                        let t = JSON.parse(atob(e.content));
                        t.referrer = (0, i.dR)(), e.content = btoa(JSON.stringify(t))
                    }()) : (e => {
                        let t;
                        if (e) return;
                        let r = (window.performance.measure(c, {
                            start: 0,
                            detail: {
                                devtools: {
                                    dataType: "track-entry",
                                    track: "Navigation",
                                    trackGroup: "Performance Timeline",
                                    color: "secondary-light",
                                    tooltipText: "React nav duration"
                                }
                            }
                        }), (t = window.performance.getEntriesByName(c).pop()) ? t.duration : null);
                        r && (0, l.iv)({
                            requestUrl: window.location.href,
                            distributionKey: "REACT_NAV_DURATION",
                            distributionValue: Math.round(r),
                            distributionTags: ["REACT_NAV_HARD"]
                        })
                    })(r), document.dispatchEvent(new CustomEvent(a.z.REACT_DONE, {
                        detail: {
                            error: r
                        }
                    })), p.current = e.key)
                }, f[0] = r, f[1] = t, f[2] = e.key, f[3] = d) : d = f[3], f[4] !== r || f[5] !== t || f[6] !== e.key || f[7] !== e.pathname ? (h = [e.key, e.pathname, t, r], f[4] = r, f[5] = t, f[6] = e.key, f[7] = e.pathname, f[8] = h) : h = f[8], (0, u.useEffect)(d, h)
            }
        })
    },
    685136(e, t, r) {
        let n;
        r.d(t, {
            Kd: () => oH,
            TY: () => 100,
            cD: () => ac,
            Zm: () => ad,
            N_: () => al,
            k2: () => au,
            C5: () => op,
            bi: () => tq,
            sv: () => as,
            Vn: () => te,
            qh: () => oy,
            Ix: () => og,
            pg: () => od,
            BV: () => ov,
            kq: () => o4,
            OA: () => ah,
            Un: () => a_,
            aA: () => tK,
            Ys: () => oB,
            AO: () => tX,
            tA: () => ax,
            tW: () => ra,
            pX: () => rP,
            B6: () => ri,
            ue: () => t9,
            V2: () => rx,
            o1: () => rd,
            Ci: () => tl,
            K: () => o0,
            KP: () => aM,
            rE: () => nX,
            IO: () => oY,
            Ri: () => nY,
            Gy: () => aO,
            LG: () => a$,
            zy: () => aA,
            RQ: () => aL,
            FE: () => aC,
            Zp: () => aN,
            cq: () => aD,
            wQ: () => aI,
            g: () => aj,
            Cx: () => aP,
            x$: () => n0,
            r5: () => ak,
            Ew: () => aF,
            Ye: () => n1,
            ok: () => aT
        });
        var o, a, i = r(296540);
        i.use;
        var s = "u" > typeof window ? i.useLayoutEffect : i.useEffect;

        function l(e) {
            let t = i.useRef({
                    value: e,
                    prev: null
                }),
                r = t.current.value;
            return e !== r && (t.current = {
                value: e,
                prev: r
            }), t.current.prev
        }
        var u = r(474848);

        function c(e) {
            let t = e.errorComponent ? ? h;
            return (0, u.jsx)(d, {
                getResetKey: e.getResetKey,
                onCatch: e.onCatch,
                children: ({
                    error: r,
                    reset: n
                }) => r ? i.createElement(t, {
                    error: r,
                    reset: n
                }) : e.children
            })
        }
        var d = class extends i.Component {
            constructor(...e) {
                super(...e), this.state = {
                    error: null
                }
            }
            static getDerivedStateFromProps(e, t) {
                let r = e.getResetKey();
                return t.error && t.resetKey !== r ? {
                    resetKey: r,
                    error: null
                } : {
                    resetKey: r
                }
            }
            static getDerivedStateFromError(e) {
                return {
                    error: e
                }
            }
            reset() {
                this.setState({
                    error: null
                })
            }
            componentDidCatch(e, t) {
                this.props.onCatch && this.props.onCatch(e, t)
            }
            render() {
                return this.props.children({
                    error: this.state.error,
                    reset: () => {
                        this.reset()
                    }
                })
            }
        };

        function h({
            error: e
        }) {
            let [t, r] = i.useState(!1);
            return (0, u.jsxs)("div", {
                style: {
                    padding: ".5rem",
                    maxWidth: "100%"
                },
                children: [(0, u.jsxs)("div", {
                    style: {
                        display: "flex",
                        alignItems: "center",
                        gap: ".5rem"
                    },
                    children: [(0, u.jsx)("strong", {
                        style: {
                            fontSize: "1rem"
                        },
                        children: "Something went wrong!"
                    }), (0, u.jsx)("button", {
                        style: {
                            appearance: "none",
                            fontSize: ".6em",
                            border: "1px solid currentColor",
                            padding: ".1rem .2rem",
                            fontWeight: "bold",
                            borderRadius: ".25rem"
                        },
                        onClick: () => r(e => !e),
                        children: t ? "Hide Error" : "Show Error"
                    })]
                }), (0, u.jsx)("div", {
                    style: {
                        height: ".25rem"
                    }
                }), t ? (0, u.jsx)("div", {
                    children: (0, u.jsx)("pre", {
                        style: {
                            fontSize: ".7em",
                            border: "1px solid red",
                            borderRadius: ".25rem",
                            padding: ".3rem",
                            color: "red",
                            overflow: "auto"
                        },
                        children: e.message ? (0, u.jsx)("code", {
                            children: e.message
                        }) : null
                    })
                }) : null]
            })
        }

        function f({
            children: e,
            fallback: t = null
        }) {
            return p() ? (0, u.jsx)(i.Fragment, {
                children: e
            }) : (0, u.jsx)(i.Fragment, {
                children: t
            })
        }

        function p() {
            return i.useSyncExternalStore(m, () => !0, () => !1)
        }

        function m() {
            return () => {}
        }
        var y = i.createContext(void 0),
            g = i.createContext(void 0),
            v = i.createContext(null);

        function w(e) {
            return i.useContext(v)
        }

        function b(e) {
            return e ? .isNotFound === !0
        }
        var R = r(220184);

        function E(e) {
            let t = w(),
                r = `not-found-${(0,R.P)(t.stores.location,e=>e.pathname)}-${(0,R.P)(t.stores.status,e=>e)}`;
            return (0, u.jsx)(c, {
                getResetKey: () => r,
                onCatch: (t, r) => {
                    if (b(t)) e.onCatch ? .(t, r);
                    else throw t
                },
                errorComponent: ({
                    error: t
                }) => {
                    if (b(t)) return e.fallback ? .(t);
                    throw t
                },
                children: e.children
            })
        }

        function x() {
            return (0, u.jsx)("p", {
                children: "Not Found"
            })
        }

        function S(e) {
            return (0, u.jsx)(u.Fragment, {
                children: e.children
            })
        }

        function _(e, t, r) {
            return t.options.notFoundComponent ? (0, u.jsx)(t.options.notFoundComponent, { ...r
            }) : e.options.defaultNotFoundComponent ? (0, u.jsx)(e.options.defaultNotFoundComponent, { ...r
            }) : (0, u.jsx)(x, {})
        }

        function P() {
            throw Error("Invariant failed")
        }
        let C = "__root__";

        function L(e) {
            return e[e.length - 1]
        }

        function k(e, t) {
            return "function" == typeof e ? e(t) : e
        }
        let N = Object.prototype.hasOwnProperty,
            T = Object.prototype.propertyIsEnumerable;

        function j(e) {
            for (let t in e)
                if (N.call(e, t)) return !0;
            return !1
        }
        let A = () => Object.create(null),
            D = (e, t) => I(e, t, A);

        function I(e, t, r = () => ({}), n = 0) {
            if (e === t) return e;
            if (n > 500) return t;
            let o = F(e) && F(t);
            if (!o && !(O(e) && O(t))) return t;
            let a = o ? e : M(e);
            if (!a) return t;
            let i = o ? t : M(t);
            if (!i) return t;
            let s = a.length,
                l = i.length,
                u = o ? Array(l) : r(),
                c = 0;
            for (let a = 0; a < l; a++) {
                let l = o ? a : i[a],
                    d = e[l],
                    h = t[l];
                if (d === h) {
                    u[l] = d, (o ? a < s : N.call(e, l)) && c++;
                    continue
                }
                if (null === d || null === h || "object" != typeof d || "object" != typeof h) {
                    u[l] = h;
                    continue
                }
                let f = I(d, h, r, n + 1);
                u[l] = f, f === d && c++
            }
            return s === l && c === s ? e : u
        }

        function M(e) {
            let t = Object.getOwnPropertyNames(e);
            for (let r of t)
                if (!T.call(e, r)) return !1;
            let r = Object.getOwnPropertySymbols(e);
            if (0 === r.length) return t;
            for (let n of r) {
                if (!T.call(e, n)) return !1;
                t.push(n)
            }
            return t
        }

        function O(e) {
            if (!$(e)) return !1;
            let t = e.constructor;
            if (void 0 === t) return !0;
            let r = t.prototype;
            return !!$(r) && !!r.hasOwnProperty("isPrototypeOf")
        }

        function $(e) {
            return "[object Object]" === Object.prototype.toString.call(e)
        }

        function F(e) {
            return Array.isArray(e) && e.length === Object.keys(e).length
        }

        function U(e, t, r) {
            if (e === t) return !0;
            if (typeof e != typeof t) return !1;
            if (Array.isArray(e) && Array.isArray(t)) {
                if (e.length !== t.length) return !1;
                for (let n = 0, o = e.length; n < o; n++)
                    if (!U(e[n], t[n], r)) return !1;
                return !0
            }
            if (O(e) && O(t)) {
                let n = r ? .ignoreUndefined ? ? !0;
                if (r ? .partial) {
                    for (let o in t)
                        if ((!n || void 0 !== t[o]) && !U(e[o], t[o], r)) return !1;
                    return !0
                }
                let o = 0;
                if (n)
                    for (let t in e) void 0 !== e[t] && o++;
                else o = Object.keys(e).length;
                let a = 0;
                for (let i in t)
                    if ((!n || void 0 !== t[i]) && (++a > o || !U(e[i], t[i], r))) return !1;
                return o === a
            }
            return !1
        }

        function B(e) {
            let t, r, n = new Promise((e, n) => {
                t = e, r = n
            });
            return n.status = "pending", n.resolve = r => {
                n.status = "resolved", n.value = r, t(r), e ? .(r)
            }, n.reject = e => {
                n.status = "rejected", r(e)
            }, n
        }

        function H(e) {
            return !!(e && "object" == typeof e && "function" == typeof e.then)
        }
        let z = /[\x00-\x1f\x7f"<>`{}]/g;

        function q(e) {
            let t;
            try {
                t = decodeURI(e)
            } catch {
                t = e.replaceAll(/%[0-9A-F]{2}/gi, e => {
                    try {
                        return decodeURI(e)
                    } catch {
                        return e
                    }
                })
            }
            return t.replace(z, e => "%" + e.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0"))
        }
        let W = ["http:", "https:", "mailto:", "tel:"];

        function V(e, t) {
            if (!e) return !1;
            try {
                let r = new URL(e);
                return !t.has(r.protocol)
            } catch {
                return !1
            }
        }

        function K(e) {
            let t;
            if (!e || !/[%\\\x00-\x1f\x7f]/.test(e) && !e.startsWith("//")) return {
                path: e,
                handledProtocolRelativeURL: !1
            };
            let r = /%25|%5C/gi,
                n = 0,
                o = "";
            for (; null !== (t = r.exec(e));) o += q(e.slice(n, t.index)) + t[0], n = r.lastIndex;
            o += q(n ? e.slice(n) : e);
            let a = !1;
            return o.startsWith("//") && (a = !0, o = "/" + o.replace(/^\/+/, "")), {
                path: o,
                handledProtocolRelativeURL: a
            }
        }

        function J(e) {
            let t, r, n = new Map,
                o = e => {
                    e.next && (e.prev ? (e.prev.next = e.next, e.next.prev = e.prev, e.next = void 0, r && (r.next = e, e.prev = r)) : (e.next.prev = void 0, t = e.next, e.next = void 0, r && (e.prev = r, r.next = e)), r = e)
                };
            return {
                get(e) {
                    let t = n.get(e);
                    if (t) return o(t), t.value
                },
                set(a, i) {
                    if (n.size >= e && t) {
                        let e = t;
                        n.delete(e.key), e.next && (t = e.next, e.next.prev = void 0), e === r && (r = void 0)
                    }
                    let s = n.get(a);
                    if (s) s.value = i, o(s);
                    else {
                        let e = {
                            key: a,
                            value: i,
                            prev: r
                        };
                        r && (r.next = e), r = e, t || (t = e), n.set(a, e)
                    }
                },
                clear() {
                    n.clear(), t = void 0, r = void 0
                }
            }
        }

        function Y(e, t, r = new Uint16Array(6)) {
            let n = e.indexOf("/", t),
                o = -1 === n ? e.length : n,
                a = e.substring(t, o);
            if (!a || !a.includes("$")) return r[0] = 0, r[1] = t, r[2] = t, r[3] = o, r[4] = o, r[5] = o, r;
            if ("$" === a) {
                let n = e.length;
                return r[0] = 2, r[1] = t, r[2] = t, r[3] = n, r[4] = n, r[5] = n, r
            }
            if (36 === a.charCodeAt(0)) return r[0] = 1, r[1] = t, r[2] = t + 1, r[3] = o, r[4] = o, r[5] = o, r;
            let i = function(e) {
                let t = e.indexOf("{");
                if (-1 === t) return null;
                let r = e.indexOf("}", t);
                return -1 === r || t + 1 >= e.length ? null : [t, r]
            }(a);
            if (i) {
                let [n, s] = i, l = a.charCodeAt(n + 1);
                if (45 === l) {
                    if (n + 2 < a.length && 36 === a.charCodeAt(n + 2)) {
                        let e = n + 3;
                        if (e < s) return r[0] = 3, r[1] = t + n, r[2] = t + e, r[3] = t + s, r[4] = t + s + 1, r[5] = o, r
                    }
                } else if (36 === l) {
                    let a = n + 2;
                    return a === s ? (r[0] = 2, r[1] = t + n, r[2] = t + (n + 1), r[3] = t + a, r[4] = t + s + 1, r[5] = e.length) : (r[0] = 1, r[1] = t + n, r[2] = t + a, r[3] = t + s, r[4] = t + s + 1, r[5] = o), r
                }
            }
            return r[0] = 0, r[1] = t, r[2] = t, r[3] = o, r[4] = o, r[5] = o, r
        }

        function Q(e, t, r, n, o, a, i) {
            i ? .(r);
            let s = n; {
                let n = r.fullPath ? ? r.from,
                    i = n.length,
                    l = r.options ? .caseSensitive ? ? e,
                    u = r.options ? .params ? .parse ? ? r.options ? .parseParams;
                for (; s < i;) {
                    let e, i = Y(n, s, t),
                        c = s,
                        d = i[5];
                    switch (s = d + 1, a++, i[0]) {
                        case 0:
                            {
                                let t = n.substring(i[2], i[3]);
                                if (l) {
                                    let n = o.static ? .get(t);
                                    if (n) e = n;
                                    else {
                                        o.static ? ? = new Map;
                                        let n = Z(r.fullPath ? ? r.from);
                                        n.parent = o, n.depth = a, e = n, o.static.set(t, n)
                                    }
                                } else {
                                    let n = t.toLowerCase(),
                                        i = o.staticInsensitive ? .get(n);
                                    if (i) e = i;
                                    else {
                                        o.staticInsensitive ? ? = new Map;
                                        let t = Z(r.fullPath ? ? r.from);
                                        t.parent = o, t.depth = a, e = t, o.staticInsensitive.set(n, t)
                                    }
                                }
                                break
                            }
                        case 1:
                            {
                                let t = n.substring(c, i[1]),
                                    s = n.substring(i[4], d),
                                    h = l && !!(t || s),
                                    f = t ? h ? t : t.toLowerCase() : void 0,
                                    p = s ? h ? s : s.toLowerCase() : void 0,
                                    m = !u && o.dynamic ? .find(e => !e.parse && e.caseSensitive === h && e.prefix === f && e.suffix === p);
                                if (m) e = m;
                                else {
                                    let t = ee(1, r.fullPath ? ? r.from, h, f, p);
                                    e = t, t.depth = a, t.parent = o, o.dynamic ? ? = [], o.dynamic.push(t)
                                }
                                break
                            }
                        case 3:
                            {
                                let t = n.substring(c, i[1]),
                                    s = n.substring(i[4], d),
                                    h = l && !!(t || s),
                                    f = t ? h ? t : t.toLowerCase() : void 0,
                                    p = s ? h ? s : s.toLowerCase() : void 0,
                                    m = !u && o.optional ? .find(e => !e.parse && e.caseSensitive === h && e.prefix === f && e.suffix === p);
                                if (m) e = m;
                                else {
                                    let t = ee(3, r.fullPath ? ? r.from, h, f, p);
                                    e = t, t.parent = o, t.depth = a, o.optional ? ? = [], o.optional.push(t)
                                }
                                break
                            }
                        case 2:
                            {
                                let t = n.substring(c, i[1]),
                                    s = n.substring(i[4], d),
                                    u = l && !!(t || s),
                                    h = t ? u ? t : t.toLowerCase() : void 0,
                                    f = s ? u ? s : s.toLowerCase() : void 0,
                                    p = ee(2, r.fullPath ? ? r.from, u, h, f);e = p,
                                p.parent = o,
                                p.depth = a,
                                o.wildcard ? ? = [],
                                o.wildcard.push(p)
                            }
                    }
                    o = e
                }
                if (u && r.children && !r.isRoot && r.id && 95 === r.id.charCodeAt(r.id.lastIndexOf("/") + 1)) {
                    let e = Z(r.fullPath ? ? r.from);
                    e.kind = 5, e.parent = o, e.depth = ++a, o.pathless ? ? = [], o.pathless.push(e), o = e
                }
                let c = (r.path || !r.children) && !r.isRoot;
                if (c && n.endsWith("/")) {
                    let e = Z(r.fullPath ? ? r.from);
                    e.kind = 4, e.parent = o, e.depth = ++a, o.index = e, o = e
                }
                o.parse = u ? ? null, o.priority = r.options ? .params ? .priority ? ? 0, c && !o.route && (o.route = r, o.fullPath = r.fullPath ? ? r.from)
            }
            if (r.children)
                for (let n of r.children) Q(e, t, n, s, o, a, i)
        }

        function G(e, t) {
            if (e.parse && !t.parse) return -1;
            if (!e.parse && t.parse) return 1;
            if (e.parse && t.parse && (e.priority || t.priority)) return t.priority - e.priority;
            if (e.prefix && t.prefix && e.prefix !== t.prefix) {
                if (e.prefix.startsWith(t.prefix)) return -1;
                if (t.prefix.startsWith(e.prefix)) return 1
            }
            if (e.suffix && t.suffix && e.suffix !== t.suffix) {
                if (e.suffix.endsWith(t.suffix)) return -1;
                if (t.suffix.endsWith(e.suffix)) return 1
            }
            return e.prefix && !t.prefix ? -1 : !e.prefix && t.prefix ? 1 : e.suffix && !t.suffix ? -1 : !e.suffix && t.suffix ? 1 : e.caseSensitive && !t.caseSensitive ? -1 : !e.caseSensitive && t.caseSensitive ? 1 : 0
        }

        function X(e) {
            if (e.pathless)
                for (let t of e.pathless) X(t);
            if (e.static)
                for (let t of e.static.values()) X(t);
            if (e.staticInsensitive)
                for (let t of e.staticInsensitive.values()) X(t);
            if (e.dynamic ? .length)
                for (let t of (e.dynamic.sort(G), e.dynamic)) X(t);
            if (e.optional ? .length)
                for (let t of (e.optional.sort(G), e.optional)) X(t);
            if (e.wildcard ? .length)
                for (let t of (e.wildcard.sort(G), e.wildcard)) X(t)
        }

        function Z(e) {
            return {
                kind: 0,
                depth: 0,
                pathless: null,
                index: null,
                static: null,
                staticInsensitive: null,
                dynamic: null,
                optional: null,
                wildcard: null,
                route: null,
                fullPath: e,
                parent: null,
                parse: null,
                priority: 0
            }
        }

        function ee(e, t, r, n, o) {
            return {
                kind: e,
                depth: 0,
                pathless: null,
                index: null,
                static: null,
                staticInsensitive: null,
                dynamic: null,
                optional: null,
                wildcard: null,
                route: null,
                fullPath: t,
                parent: null,
                parse: null,
                priority: 0,
                caseSensitive: r,
                prefix: n,
                suffix: o
            }
        }

        function et(e, t, r = !1) {
            let n = e.split("/"),
                o = function(e, t, r, n) {
                    if ("/" === e && r.index) return {
                        node: r.index,
                        skipped: 0
                    };
                    let o = !L(t),
                        a = o && "/" !== e,
                        i = t.length - !!o,
                        s = [{
                            node: r,
                            index: 1,
                            skipped: 0,
                            depth: 1,
                            statics: 0,
                            dynamics: 0,
                            optionals: 0
                        }],
                        l = null,
                        u = null;
                    for (; s.length;) {
                        let r, o = s.pop(),
                            {
                                node: h,
                                index: f,
                                skipped: p,
                                depth: m,
                                statics: y,
                                dynamics: g,
                                optionals: v
                            } = o,
                            {
                                extract: w,
                                rawParams: b
                            } = o;
                        if (2 === h.kind && h.route && !ea(u, o)) continue;
                        if (h.parse) {
                            if (!eo(e, t, o)) continue;
                            b = o.rawParams, w = o.extract
                        }
                        n && h.route && 4 !== h.kind && ea(l, o) && (l = o);
                        let R = f === i;
                        if (R && (h.route && (!a || 4 === h.kind || 2 === h.kind) && ea(u, o) && (u = o), !h.optional && !h.wildcard && !h.index && !h.pathless)) continue;
                        let E = R ? void 0 : t[f];
                        if (R && h.index) {
                            let r = {
                                    node: h.index,
                                    index: f,
                                    skipped: p,
                                    depth: m + 1,
                                    statics: y,
                                    dynamics: g,
                                    optionals: v,
                                    extract: w,
                                    rawParams: b
                                },
                                n = !0;
                            if (h.index.parse && !eo(e, t, r) && (n = !1), n) {
                                var c, d;
                                if (!g && !v && !p && (c = y, d = i, c === 2 ** (d - 1) - 1)) return r;
                                ea(u, r) && (u = r)
                            }
                        }
                        if (h.wildcard)
                            for (let e = h.wildcard.length - 1; e >= 0; e--) {
                                let n = h.wildcard[e],
                                    {
                                        prefix: o,
                                        suffix: a
                                    } = n;
                                if (!o || !R && (n.caseSensitive ? E : r ? ? = E.toLowerCase()).startsWith(o)) {
                                    if (a) {
                                        if (R) continue;
                                        let e = t.slice(f).join("/").slice(-a.length);
                                        if ((n.caseSensitive ? e : e.toLowerCase()) !== a) continue
                                    }
                                    s.push({
                                        node: n,
                                        index: i,
                                        skipped: p,
                                        depth: m + 1,
                                        statics: y,
                                        dynamics: g,
                                        optionals: v,
                                        extract: w,
                                        rawParams: b
                                    })
                                }
                            }
                        if (h.optional) {
                            let e = p | 1 << m,
                                t = m + 1;
                            for (let r = h.optional.length - 1; r >= 0; r--) {
                                let n = h.optional[r];
                                s.push({
                                    node: n,
                                    index: f,
                                    skipped: e,
                                    depth: t,
                                    statics: y,
                                    dynamics: g,
                                    optionals: v,
                                    extract: w,
                                    rawParams: b
                                })
                            }
                            if (!R)
                                for (let e = h.optional.length - 1; e >= 0; e--) {
                                    let n = h.optional[e],
                                        {
                                            prefix: o,
                                            suffix: a
                                        } = n;
                                    if (o || a) {
                                        let e = n.caseSensitive ? E : r ? ? = E.toLowerCase();
                                        if (o && !e.startsWith(o) || a && !e.endsWith(a)) continue
                                    }
                                    s.push({
                                        node: n,
                                        index: f + 1,
                                        skipped: p,
                                        depth: t,
                                        statics: y,
                                        dynamics: g,
                                        optionals: v + function(e, t) {
                                            return 2 ** (e - t - 1)
                                        }(i, f),
                                        extract: w,
                                        rawParams: b
                                    })
                                }
                        }
                        if (!R && h.dynamic && E)
                            for (let e = h.dynamic.length - 1; e >= 0; e--) {
                                let t = h.dynamic[e],
                                    {
                                        prefix: n,
                                        suffix: o
                                    } = t;
                                if (n || o) {
                                    let e = t.caseSensitive ? E : r ? ? = E.toLowerCase();
                                    if (n && !e.startsWith(n) || o && !e.endsWith(o)) continue
                                }
                                s.push({
                                    node: t,
                                    index: f + 1,
                                    skipped: p,
                                    depth: m + 1,
                                    statics: y,
                                    dynamics: g + function(e, t) {
                                        return 2 ** (e - t - 1)
                                    }(i, f),
                                    optionals: v,
                                    extract: w,
                                    rawParams: b
                                })
                            }
                        if (!R && h.staticInsensitive) {
                            let e = h.staticInsensitive.get(r ? ? = E.toLowerCase());
                            e && s.push({
                                node: e,
                                index: f + 1,
                                skipped: p,
                                depth: m + 1,
                                statics: y + function(e, t) {
                                    return 2 ** (e - t - 1)
                                }(i, f),
                                dynamics: g,
                                optionals: v,
                                extract: w,
                                rawParams: b
                            })
                        }
                        if (!R && h.static) {
                            let e = h.static.get(E);
                            e && s.push({
                                node: e,
                                index: f + 1,
                                skipped: p,
                                depth: m + 1,
                                statics: y + function(e, t) {
                                    return 2 ** (e - t - 1)
                                }(i, f),
                                dynamics: g,
                                optionals: v,
                                extract: w,
                                rawParams: b
                            })
                        }
                        if (h.pathless) {
                            let e = m + 1;
                            for (let t = h.pathless.length - 1; t >= 0; t--) {
                                let r = h.pathless[t];
                                s.push({
                                    node: r,
                                    index: f,
                                    skipped: p,
                                    depth: e,
                                    statics: y,
                                    dynamics: g,
                                    optionals: v,
                                    extract: w,
                                    rawParams: b
                                })
                            }
                        }
                    }
                    if (u) return u;
                    if (n && l) {
                        let r = l.index;
                        for (let e = 0; e < l.index; e++) r += t[e].length;
                        let n = r === e.length ? "/" : e.slice(r);
                        return l.rawParams ? ? = Object.create(null), l.rawParams["**"] = decodeURIComponent(n), l
                    }
                    return null
                }(e, n, t, r);
            if (!o) return null;
            let [a] = er(e, n, o);
            return {
                route: o.node.route,
                rawParams: a
            }
        }

        function er(e, t, r) {
            let n = function(e) {
                    let t = Array(e.depth + 1);
                    do t[e.depth] = e, e = e.parent; while (e) return t
                }(r.node),
                o = null,
                a = Object.create(null),
                i = r.extract ? .part ? ? 0,
                s = r.extract ? .node ? ? 0,
                l = r.extract ? .path ? ? 0,
                u = r.extract ? .segment ? ? 0;
            for (; s < n.length; i++, s++, l++, u++) {
                let c = n[s];
                if (4 === c.kind) break;
                if (5 === c.kind) {
                    u--, i--, l--;
                    continue
                }
                let d = t[i],
                    h = l;
                if (d && (l += d.length), 1 === c.kind) {
                    let e = (o ? ? = r.node.fullPath.split("/"))[u],
                        t = c.prefix ? .length ? ? 0;
                    if (123 === e.charCodeAt(t)) {
                        let r = c.suffix ? .length ? ? 0,
                            n = e.substring(t + 2, e.length - r - 1),
                            o = d.substring(t, d.length - r);
                        a[n] = decodeURIComponent(o)
                    } else a[e.substring(1)] = decodeURIComponent(d)
                } else if (3 === c.kind) {
                    if (r.skipped & 1 << s) {
                        i--, l = h - 1;
                        continue
                    }
                    let e = (o ? ? = r.node.fullPath.split("/"))[u],
                        t = c.prefix ? .length ? ? 0,
                        n = c.suffix ? .length ? ? 0,
                        f = e.substring(t + 3, e.length - n - 1),
                        p = c.suffix || c.prefix ? d.substring(t, d.length - n) : d;
                    p && (a[f] = decodeURIComponent(p))
                } else if (2 === c.kind) {
                    let t = decodeURIComponent(e.substring(h + (c.prefix ? .length ? ? 0), e.length - (c.suffix ? .length ? ? 0)));
                    a["*"] = t, a._splat = t;
                    break
                }
            }
            return r.rawParams && Object.assign(a, r.rawParams), [a, {
                part: i,
                node: s,
                path: l,
                segment: u
            }]
        }

        function en(e) {
            let t = [e];
            for (; e.parentRoute;) t.push(e = e.parentRoute);
            return t.reverse(), t
        }

        function eo(e, t, r) {
            let n, o;
            try {
                [n, o] = er(e, t, r)
            } catch {
                return null
            }
            if (r.rawParams = n, r.extract = o, !r.node.parse) return !0;
            try {
                if (!1 === r.node.parse(n)) return null
            } catch {}
            return !0
        }

        function ea(e, t) {
            return !e || t.statics > e.statics || t.statics === e.statics && (t.dynamics > e.dynamics || t.dynamics === e.dynamics && (t.optionals > e.optionals || t.optionals === e.optionals && ((4 === t.node.kind) > (4 === e.node.kind) || 4 === t.node.kind == (4 === e.node.kind) && t.depth > e.depth)))
        }

        function ei(e) {
            return es(e.filter(e => void 0 !== e).join("/"))
        }

        function es(e) {
            return e.replace(/\/{2,}/g, "/")
        }

        function el(e) {
            return "/" === e ? e : e.replace(/^\/{1,}/, "")
        }

        function eu(e) {
            let t = e.length;
            return t > 1 && "/" === e[t - 1] ? e.replace(/\/{1,}$/, "") : e
        }

        function ec(e, t) {
            return e ? .endsWith("/") && "/" !== e && e !== `${t}/` ? e.slice(0, -1) : e
        }

        function ed(e, t, r) {
            let n = t[e];
            return "string" != typeof n ? n : "_splat" !== e ? ef(n, r) : /^[a-zA-Z0-9\-._~!/]*$/.test(n) ? n : n.split("/").map(e => ef(e, r)).join("/")
        }

        function eh({
            path: e,
            params: t,
            decoder: r,
            ...n
        }) {
            let o, a = !1,
                i = Object.create(null);
            if (!e || "/" === e) return {
                interpolatedPath: "/",
                usedParams: i,
                isMissingParams: a
            };
            if (!e.includes("$")) return {
                interpolatedPath: e,
                usedParams: i,
                isMissingParams: a
            };
            let s = e.length,
                l = 0,
                u = "";
            for (; l < s;) {
                let n = l,
                    s = (o = Y(e, n, o))[5];
                if (l = s + 1, n === s) continue;
                let c = o[0];
                if (0 === c) {
                    u += "/" + e.substring(n, s);
                    continue
                }
                if (2 === c) {
                    let l = t._splat;
                    i._splat = l, i["*"] = l;
                    let c = e.substring(n, o[1]),
                        d = e.substring(o[4], s);
                    if (!l) {
                        a = !0, (c || d) && (u += "/" + c + d);
                        continue
                    }
                    u += "/" + c + ed("_splat", t, r) + d;
                    continue
                }
                if (1 === c) {
                    let l = e.substring(o[2], o[3]);
                    a || l in t || (a = !0), i[l] = t[l];
                    let c = e.substring(n, o[1]),
                        d = e.substring(o[4], s);
                    u += "/" + c + (ed(l, t, r) ? ? "undefined") + d;
                    continue
                }
                if (3 === c) {
                    let a = e.substring(o[2], o[3]),
                        l = t[a];
                    if (null == l) continue;
                    i[a] = l;
                    let c = e.substring(n, o[1]),
                        d = e.substring(o[4], s);
                    u += "/" + c + (ed(a, t, r) ? ? "") + d;
                    continue
                }
            }
            return e.endsWith("/") && (u += "/"), {
                usedParams: i,
                interpolatedPath: u || "/",
                isMissingParams: a
            }
        }

        function ef(e, t) {
            let r = encodeURIComponent(e);
            return t ? .(r) ? ? r
        }
        let ep = function() {
                try {
                    return sessionStorage
                } catch {
                    return
                }
            }(),
            em = function() {
                try {
                    return JSON.parse(ep ? .getItem("tsr-scroll-restoration-v1_3") || "{}")
                } catch {
                    return {}
                }
            }(),
            ey = "data-scroll-restoration-id",
            eg = e => e.state.__TSR_key || e.href,
            ev = !1,
            ew = "window";

        function eb(e) {
            try {
                return "function" == typeof e ? e() : document.querySelector(e)
            } catch {}
        }

        function eR(e) {
            let t = [];
            for (let r of e) {
                if (r === ew) continue;
                let e = eb(r);
                e && t.push(e)
            }
            return t
        }

        function eE(e) {
            return e ? "false" !== e && ("true" === e || (0 * e == 0 && +e + "" === e ? +e : e)) : ""
        }
        let ex = (o = JSON.parse, e => {
                "?" === e[0] && (e = e.substring(1));
                let t = function(e) {
                    let t = new URLSearchParams(e),
                        r = Object.create(null);
                    for (let [e, n] of t.entries()) {
                        let t = r[e];
                        null == t ? r[e] = eE(n) : Array.isArray(t) ? t.push(eE(n)) : r[e] = [t, eE(n)]
                    }
                    return r
                }(e);
                for (let e in t) {
                    let r = t[e];
                    if ("string" == typeof r) try {
                        t[e] = o(r)
                    } catch (e) {}
                }
                return t
            }),
            eS = function(e, t) {
                let r = "function" == typeof t;

                function n(n) {
                    if ("object" == typeof n && null !== n) try {
                        return e(n)
                    } catch (e) {} else if (r && "string" == typeof n) try {
                        return t(n), e(n)
                    } catch (e) {}
                    return n
                }
                return e => {
                    let t = function(e, t = String) {
                        let r = new URLSearchParams;
                        for (let n in e) {
                            let o = e[n];
                            void 0 !== o && r.set(n, t(o))
                        }
                        return r.toString()
                    }(e, n);
                    return t ? `?${t}` : ""
                }
            }(JSON.stringify, JSON.parse);

        function e_(e) {
            return e instanceof Response && !!e.options
        }
        let eP = e => {
                if (!e.rendered) return e.rendered = !0, e.onReady ? .()
            },
            eC = (e, t) => !!(e.preload && !e.router.stores.matchStores.has(t)),
            eL = (e, t, r = !0) => {
                let n = { ...e.router.options.context ? ? {}
                    },
                    o = r ? t : t - 1;
                for (let t = 0; t <= o; t++) {
                    let r = e.matches[t];
                    if (!r) continue;
                    let o = e.router.getMatch(r.id);
                    o && Object.assign(n, o.__routeContext, o.__beforeLoadContext)
                }
                return n
            },
            ek = (e, t) => {
                if (!e.matches.length) return;
                let r = t.routeId,
                    n = e.matches.findIndex(t => t.routeId === e.router.routeTree.id),
                    o = n >= 0 ? n : 0,
                    a = r ? e.matches.findIndex(e => e.routeId === r) : e.firstBadMatchIndex ? ? e.matches.length - 1;
                a < 0 && (a = o);
                for (let t = a; t >= 0; t--) {
                    let r = e.matches[t];
                    if (e.router.looseRoutesById[r.routeId].options.notFoundComponent) return t
                }
                return r ? a : o
            },
            eN = (e, t, r) => {
                if (e_(r) || b(r)) {
                    if (e_(r) && r.redirectHandled && !r.options.reloadDocument) throw r;
                    throw t && (t._nonReactive.beforeLoadPromise ? .resolve(), t._nonReactive.loaderPromise ? .resolve(), t._nonReactive.beforeLoadPromise = void 0, t._nonReactive.loaderPromise = void 0, t._nonReactive.error = r, e.updateMatch(t.id, n => ({ ...n,
                        status: e_(r) ? "redirected" : b(r) ? "notFound" : "pending" === n.status ? "success" : n.status,
                        context: eL(e, t.index),
                        isFetching: !1,
                        error: r
                    })), b(r) && !r.routeId && (r.routeId = t.routeId), t._nonReactive.loadPromise ? .resolve()), e_(r) && (e.rendered = !0, r.options._fromLocation = e.location, r.redirectHandled = !0, r = e.router.resolveRedirect(r)), r
                }
            },
            eT = (e, t) => {
                let r = e.router.getMatch(t);
                return !r || !!r._nonReactive.dehydrated
            },
            ej = (e, t, r) => {
                let n = eL(e, r);
                e.updateMatch(t, e => ({ ...e,
                    context: n
                }))
            },
            eA = (e, t, r) => {
                let {
                    id: n,
                    routeId: o
                } = e.matches[t], a = e.router.looseRoutesById[o];
                if (r instanceof Promise) throw r;
                e.firstBadMatchIndex ? ? = t, eN(e, e.router.getMatch(n), r);
                try {
                    a.options.onError ? .(r)
                } catch (t) {
                    r = t, eN(e, e.router.getMatch(n), r)
                }
                e.updateMatch(n, e => (e._nonReactive.beforeLoadPromise ? .resolve(), e._nonReactive.beforeLoadPromise = void 0, e._nonReactive.loadPromise ? .resolve(), { ...e,
                    error: r,
                    status: "error",
                    isFetching: !1,
                    updatedAt: Date.now(),
                    abortController: new AbortController
                })), e.preload || e_(r) || b(r) || (e.serialError ? ? = r)
            },
            eD = (e, t, r, n) => {
                if (void 0 !== n._nonReactive.pendingTimeout) return;
                let o = r.options.pendingMs ? ? e.router.options.defaultPendingMs;
                if (e.onReady && !eC(e, t) && (r.options.loader || r.options.beforeLoad || ez(r)) && "number" == typeof o && o !== 1 / 0 && (r.options.pendingComponent ? ? e.router.options ? .defaultPendingComponent)) {
                    let t = setTimeout(() => {
                        eP(e)
                    }, o);
                    n._nonReactive.pendingTimeout = t
                }
            },
            eI = (e, t) => {
                let {
                    id: r,
                    routeId: n
                } = e.matches[t], o = e.router.looseRoutesById[n], a = () => ((e, t, r, n) => {
                    let o, a = e.router.getMatch(t),
                        i = a._nonReactive.loadPromise;
                    a._nonReactive.loadPromise = B(() => {
                        i ? .resolve(), i = void 0
                    });
                    let {
                        paramsError: s,
                        searchError: l
                    } = a;
                    s && eA(e, r, s), l && eA(e, r, l), eD(e, t, n, a);
                    let u = new AbortController,
                        c = !1,
                        d = () => {
                            c || (c = !0, e.updateMatch(t, e => ({ ...e,
                                isFetching: "beforeLoad",
                                fetchCount: e.fetchCount + 1,
                                abortController: u
                            })))
                        },
                        h = () => {
                            a._nonReactive.beforeLoadPromise ? .resolve(), a._nonReactive.beforeLoadPromise = void 0, e.updateMatch(t, e => ({ ...e,
                                isFetching: !1
                            }))
                        };
                    if (!n.options.beforeLoad) return void e.router.batch(() => {
                        d(), h()
                    });
                    a._nonReactive.beforeLoadPromise = B();
                    let f = { ...eL(e, r, !1),
                            ...a.__routeContext
                        },
                        {
                            search: p,
                            params: m,
                            cause: y
                        } = a,
                        g = eC(e, t),
                        v = {
                            search: p,
                            abortController: u,
                            params: m,
                            preload: g,
                            context: f,
                            location: e.location,
                            navigate: t => e.router.navigate({ ...t,
                                _fromLocation: e.location
                            }),
                            buildLocation: e.router.buildLocation,
                            cause: g ? "preload" : y,
                            matches: e.matches,
                            routeId: n.id,
                            ...e.router.options.additionalContext
                        },
                        w = n => {
                            void 0 === n ? e.router.batch(() => {
                                d(), h()
                            }) : ((e_(n) || b(n)) && (d(), eA(e, r, n)), e.router.batch(() => {
                                d(), e.updateMatch(t, e => ({ ...e,
                                    __beforeLoadContext: n
                                })), h()
                            }))
                        };
                    try {
                        if (o = n.options.beforeLoad(v), H(o)) return d(), o.catch(t => {
                            eA(e, r, t)
                        }).then(w)
                    } catch (t) {
                        d(), eA(e, r, t)
                    }
                    w(o)
                })(e, r, t, o);
                if (eT(e, r)) return;
                let i = ((e, t, r) => {
                    let n = e.router.getMatch(t);
                    if (!n._nonReactive.beforeLoadPromise && !n._nonReactive.loaderPromise) return;
                    eD(e, t, r, n);
                    let o = () => {
                        let r = e.router.getMatch(t);
                        r.preload && ("redirected" === r.status || "notFound" === r.status) && eN(e, r, r.error)
                    };
                    return n._nonReactive.beforeLoadPromise ? n._nonReactive.beforeLoadPromise.then(o) : o()
                })(e, r, o);
                return H(i) ? i.then(a) : a()
            },
            eM = (e, t, r) => {
                let n = e.router.getMatch(t);
                if (!n || !r.options.head && !r.options.scripts && !r.options.headers) return;
                let o = {
                    ssr: e.router.options.ssr,
                    matches: e.matches,
                    match: n,
                    params: n.params,
                    loaderData: n.loaderData
                };
                return Promise.all([r.options.head ? .(o), r.options.scripts ? .(o), r.options.headers ? .(o)]).then(([e, t, r]) => ({
                    meta: e ? .meta,
                    links: e ? .links,
                    headScripts: e ? .scripts,
                    headers: r,
                    scripts: t,
                    styles: e ? .styles
                }))
            },
            eO = (e, t, r, n, o) => {
                let a = t[n - 1],
                    {
                        params: i,
                        loaderDeps: s,
                        abortController: l,
                        cause: u
                    } = e.router.getMatch(r),
                    c = eL(e, n),
                    d = eC(e, r);
                return {
                    params: i,
                    deps: s,
                    preload: !!d,
                    parentMatchPromise: a,
                    abortController: l,
                    context: c,
                    location: e.location,
                    navigate: t => e.router.navigate({ ...t,
                        _fromLocation: e.location
                    }),
                    cause: d ? "preload" : u,
                    route: o,
                    ...e.router.options.additionalContext
                }
            },
            e$ = async (e, t, r, n, o) => {
                try {
                    let a = e.router.getMatch(r);
                    try {
                        eH(o);
                        let i = o.options.loader,
                            s = "function" == typeof i ? i : i ? .handler,
                            l = s ? .(eO(e, t, r, n, o)),
                            u = !!s && H(l);
                        if ((u || o._lazyPromise || o._componentsPromise || o.options.head || o.options.scripts || o.options.headers || a._nonReactive.minPendingPromise) && e.updateMatch(r, e => ({ ...e,
                                isFetching: "loader"
                            })), s) {
                            let t = u ? await l : l;
                            eN(e, e.router.getMatch(r), t), void 0 !== t && e.updateMatch(r, e => ({ ...e,
                                loaderData: t
                            }))
                        }
                        o._lazyPromise && await o._lazyPromise;
                        let c = a._nonReactive.minPendingPromise;
                        c && await c, o._componentsPromise && await o._componentsPromise, e.updateMatch(r, t => ({ ...t,
                            error: void 0,
                            context: eL(e, n),
                            status: "success",
                            isFetching: !1,
                            updatedAt: Date.now()
                        }))
                    } catch (s) {
                        let t = s;
                        if (t ? .name === "AbortError") {
                            if (a.abortController.signal.aborted) {
                                a._nonReactive.loaderPromise ? .resolve(), a._nonReactive.loaderPromise = void 0;
                                return
                            }
                            e.updateMatch(r, t => ({ ...t,
                                status: "pending" === t.status ? "success" : t.status,
                                isFetching: !1,
                                context: eL(e, n)
                            }));
                            return
                        }
                        let i = a._nonReactive.minPendingPromise;
                        i && await i, b(s) && await o.options.notFoundComponent ? .preload ? .(), eN(e, e.router.getMatch(r), s);
                        try {
                            o.options.onError ? .(s)
                        } catch (n) {
                            t = n, eN(e, e.router.getMatch(r), n)
                        }
                        e_(t) || b(t) || await eH(o, ["errorComponent"]), e.updateMatch(r, r => ({ ...r,
                            error: t,
                            context: eL(e, n),
                            status: "error",
                            isFetching: !1
                        }))
                    }
                } catch (n) {
                    let t = e.router.getMatch(r);
                    t && (t._nonReactive.loaderPromise = void 0), eN(e, t, n)
                }
            },
            eF = async (e, t, r) => {
                async function n(n, a, l, u, d) {
                    let h = Date.now() - a.updatedAt,
                        f = n ? d.options.preloadStaleTime ? ? e.router.options.defaultPreloadStaleTime ? ? 3e4 : d.options.staleTime ? ? e.router.options.defaultStaleTime ? ? 0,
                        p = d.options.shouldReload,
                        m = "function" == typeof p ? p(eO(e, t, o, r, d)) : p,
                        {
                            status: y,
                            invalid: g
                        } = u,
                        v = h >= f && (!!e.forceStaleReload || "enter" === u.cause || void 0 !== l && l !== u.id);
                    i = "success" === y && (g || (m ? ? v)), n && !1 === d.options.preload || (i && !e.sync && c ? (s = !0, (async () => {
                        try {
                            await e$(e, t, o, r, d);
                            let n = e.router.getMatch(o);
                            n._nonReactive.loaderPromise ? .resolve(), n._nonReactive.loadPromise ? .resolve(), n._nonReactive.loaderPromise = void 0, n._nonReactive.loadPromise = void 0
                        } catch (t) {
                            e_(t) && await e.router.navigate(t.options)
                        }
                    })()) : "success" !== y || i ? await e$(e, t, o, r, d) : ej(e, o, r))
                }
                let {
                    id: o,
                    routeId: a
                } = e.matches[r], i = !1, s = !1, l = e.router.looseRoutesById[a], u = l.options.loader, c = (("function" == typeof u ? void 0 : u ? .staleReloadMode) ? ? e.router.options.defaultStaleReloadMode) !== "blocking";
                if (eT(e, o)) {
                    if (!e.router.getMatch(o)) return e.matches[r];
                    ej(e, o, r)
                } else {
                    let t = e.router.getMatch(o),
                        i = e.router.stores.matchesId.get()[r],
                        s = (i && e.router.stores.matchStores.get(i) || null) ? .routeId === a ? i : e.router.stores.matches.get().find(e => e.routeId === a) ? .id,
                        u = eC(e, o);
                    if (t._nonReactive.loaderPromise) {
                        if ("success" === t.status && !e.sync && !t.preload && c) return t;
                        await t._nonReactive.loaderPromise;
                        let r = e.router.getMatch(o),
                            a = r._nonReactive.error || r.error;
                        a && eN(e, r, a), "pending" === r.status && await n(u, t, s, r, l)
                    } else {
                        let r = u && !e.router.stores.matchStores.has(o),
                            a = e.router.getMatch(o);
                        a._nonReactive.loaderPromise = B(), r !== a.preload && e.updateMatch(o, e => ({ ...e,
                            preload: r
                        })), await n(u, t, s, a, l)
                    }
                }
                let d = e.router.getMatch(o);
                s || (d._nonReactive.loaderPromise ? .resolve(), d._nonReactive.loadPromise ? .resolve(), d._nonReactive.loadPromise = void 0), clearTimeout(d._nonReactive.pendingTimeout), d._nonReactive.pendingTimeout = void 0, s || (d._nonReactive.loaderPromise = void 0), d._nonReactive.dehydrated = void 0;
                let h = !!s && d.isFetching;
                return h !== d.isFetching || !1 !== d.invalid ? (e.updateMatch(o, e => ({ ...e,
                    isFetching: h,
                    invalid: !1
                })), e.router.getMatch(o)) : d
            };
        async function eU(e) {
            let t, r, n, o, a = [];
            (o = e.router).stores.matchesId.get().some(e => o.stores.matchStores.get(e) ? .get()._forcePending) && eP(e);
            for (let r = 0; r < e.matches.length; r++) {
                try {
                    let t = eI(e, r);
                    H(t) && await t
                } catch (r) {
                    if (e_(r)) throw r;
                    if (b(r)) t = r;
                    else if (!e.preload) throw r;
                    break
                }
                if (e.serialError || null != e.firstBadMatchIndex) break
            }
            let i = e.firstBadMatchIndex ? ? e.matches.length,
                s = t && !e.preload ? ek(e, t) : void 0,
                l = t && e.preload ? 0 : void 0 !== s ? Math.min(s + 1, i) : i;
            for (let t = 0; t < l; t++) a.push(eF(e, a, t));
            try {
                await Promise.all(a)
            } catch {
                for (let e of (await Promise.allSettled(a))) {
                    if ("rejected" !== e.status) continue;
                    let t = e.reason;
                    if (e_(t)) throw t;
                    b(t) ? r ? ? = t : n ? ? = t
                }
                if (void 0 !== n) throw n
            }
            let u = r ? ? (t && !e.preload ? t : void 0),
                c = void 0 !== e.firstBadMatchIndex ? e.firstBadMatchIndex : e.matches.length - 1;
            if (!u && t && e.preload) return e.matches;
            if (u) {
                let t = ek(e, u);
                void 0 === t && P();
                let r = e.matches[t],
                    n = e.router.looseRoutesById[r.routeId],
                    o = e.router.options ? .defaultNotFoundComponent;
                !n.options.notFoundComponent && o && (n.options.notFoundComponent = o), u.routeId = r.routeId;
                let a = r.routeId === e.router.routeTree.id;
                e.updateMatch(r.id, e => ({ ...e,
                    ...a ? {
                        status: "success",
                        globalNotFound: !0,
                        error: void 0
                    } : {
                        status: "notFound",
                        error: u
                    },
                    isFetching: !1
                })), c = t, await eH(n, ["notFoundComponent"])
            } else if (!e.preload) {
                let t = e.matches[0];
                !t.globalNotFound && e.router.getMatch(t.id) ? .globalNotFound && e.updateMatch(t.id, e => ({ ...e,
                    globalNotFound: !1,
                    error: void 0
                }))
            }
            if (e.serialError && void 0 !== e.firstBadMatchIndex) {
                let t = e.router.looseRoutesById[e.matches[e.firstBadMatchIndex].routeId];
                await eH(t, ["errorComponent"])
            }
            for (let t = 0; t <= c; t++) {
                let {
                    id: r,
                    routeId: n
                } = e.matches[t], o = e.router.looseRoutesById[n];
                try {
                    let t = eM(e, r, o);
                    if (t) {
                        let n = await t;
                        e.updateMatch(r, e => ({ ...e,
                            ...n
                        }))
                    }
                } catch (e) {
                    console.error(`Error executing head for route ${n}:`, e)
                }
            }
            let d = eP(e);
            if (H(d) && await d, u) throw u;
            if (e.serialError && !e.preload && !e.onReady) throw e.serialError;
            return e.matches
        }

        function eB(e, t) {
            let r = t.map(t => e.options[t] ? .preload ? .()).filter(Boolean);
            if (0 !== r.length) return Promise.all(r)
        }

        function eH(e, t = eq) {
            e._lazyLoaded || void 0 !== e._lazyPromise || (e.lazyFn ? e._lazyPromise = e.lazyFn().then(t => {
                let {
                    id: r,
                    ...n
                } = t.options;
                Object.assign(e.options, n), e._lazyLoaded = !0, e._lazyPromise = void 0
            }) : e._lazyLoaded = !0);
            let r = () => e._componentsLoaded ? void 0 : t === eq ? (() => {
                if (void 0 === e._componentsPromise) {
                    let t = eB(e, eq);
                    t ? e._componentsPromise = t.then(() => {
                        e._componentsLoaded = !0, e._componentsPromise = void 0
                    }) : e._componentsLoaded = !0
                }
                return e._componentsPromise
            })() : eB(e, t);
            return e._lazyPromise ? e._lazyPromise.then(r) : r()
        }

        function ez(e) {
            for (let t of eq)
                if (e.options[t] ? .preload) return !0;
            return !1
        }
        let eq = ["component", "errorComponent", "pendingComponent", "notFoundComponent"];

        function eW(e, t) {
            let r = e ? .input ? .({
                url: t
            });
            if (r) {
                if ("string" == typeof r) return new URL(r);
                else if (r instanceof URL) return r
            }
            return t
        }

        function eV(e, t) {
            let r = e ? .output ? .({
                url: t
            });
            if (r) {
                if ("string" == typeof r) return new URL(r);
                else if (r instanceof URL) return r
            }
            return t
        }

        function eK(e, t) {
            let r = [];
            for (let n of t) {
                let t = e.get(n);
                t && r.push(t.get())
            }
            return r
        }

        function eJ(e, t, r, n, o) {
            let a = e.map(e => e.id),
                i = new Set(a);
            o(() => {
                for (let e of t.keys()) i.has(e) || t.delete(e);
                for (let r of e) {
                    let e = t.get(r.id);
                    if (!e) {
                        let e = n(r);
                        e.routeId = r.routeId, t.set(r.id, e);
                        continue
                    }
                    e.routeId = r.routeId, e.get() !== r && e.set(r)
                }! function(e, t) {
                    if (e === t) return !0;
                    if (e.length !== t.length) return !1;
                    for (let r = 0; r < e.length; r++)
                        if (e[r] !== t[r]) return !1;
                    return !0
                }(r.get(), a) && r.set(a)
            })
        }
        var eY = r(221315);

        function eQ(e, t) {
            return {
                fromLocation: t,
                toLocation: e,
                pathChanged: t ? .pathname !== e.pathname,
                hrefChanged: t ? .href !== e.href,
                hashChanged: t ? .hash !== e.hash
            }
        }
        let eG = new WeakMap;
        var eX = class {
                constructor(e, t) {
                    this.tempLocationKey = `${Math.round(1e7*Math.random())}`, this._scroll = {
                        next: !0
                    }, this.shouldViewTransition = void 0, this.isViewTransitionTypesSupported = void 0, this.subscribers = new Set, this.routeBranchCache = new WeakMap, this.lightweightCache = new WeakMap, this.startTransition = e => e(), this.update = e => {
                        var t, r;
                        let n, o, a = this.options,
                            i = this.basepath ? ? a ? .basepath ? ? "/",
                            s = void 0 === this.basepath,
                            l = a ? .rewrite;
                        if (this.options = { ...a,
                                ...e
                            }, this.isServer = this.options.isServer ? ? "u" < typeof document, this.protocolAllowlist = new Set(this.options.protocolAllowlist), this.options.pathParamsAllowedCharacters && (this.pathParamsDecoder = (o = RegExp(Array.from((n = new Map(this.options.pathParamsAllowedCharacters.map(e => [encodeURIComponent(e), e]))).keys()).map(e => e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "g"), e => e.replace(o, e => n.get(e) ? ? e))), (!this.history || this.options.history && this.options.history !== this.history) && (this.options.history ? this.history = this.options.history : this.history = (0, eY.zR)()), this.origin = this.options.origin, this.origin || (window ? .origin && "null" !== window.origin ? this.origin = window.origin : this.origin = "http://localhost"), this.history && this.updateLatestLocation(), this.options.routeTree !== this.routeTree) {
                            let e;
                            this.routeTree = this.options.routeTree, this.resolvePathCache = J(1e3), e = this.buildRouteTree(), this.setRoutes(e)
                        }
                        if (!this.stores && this.latestLocation) {
                            let e, r, n, o, a, i, s = this.getStoreConfig(this);
                            this.batch = s.batch, this.stores = function(e, t) {
                                let {
                                    createMutableStore: r,
                                    createReadonlyStore: n,
                                    batch: o,
                                    init: a
                                } = t, i = new Map, s = new Map, l = new Map, u = r(e.status), c = r(e.loadedAt), d = r(e.isLoading), h = r(e.isTransitioning), f = r(e.location), p = r(e.resolvedLocation), m = r(e.statusCode), y = r(e.redirect), g = r([]), v = r([]), w = r([]), b = n(() => eK(i, g.get())), R = n(() => eK(s, v.get())), E = n(() => eK(l, w.get())), x = n(() => g.get()[0]), S = n(() => g.get().some(e => i.get(e) ? .get().status === "pending")), _ = n(() => ({
                                    locationHref: f.get().href,
                                    resolvedLocationHref: p.get() ? .href,
                                    status: u.get()
                                })), P = n(() => ({
                                    status: u.get(),
                                    loadedAt: c.get(),
                                    isLoading: d.get(),
                                    isTransitioning: h.get(),
                                    matches: b.get(),
                                    location: f.get(),
                                    resolvedLocation: p.get(),
                                    statusCode: m.get(),
                                    redirect: y.get()
                                })), C = J(64), L = {
                                    status: u,
                                    loadedAt: c,
                                    isLoading: d,
                                    isTransitioning: h,
                                    location: f,
                                    resolvedLocation: p,
                                    statusCode: m,
                                    redirect: y,
                                    matchesId: g,
                                    pendingIds: v,
                                    cachedIds: w,
                                    matches: b,
                                    pendingMatches: R,
                                    cachedMatches: E,
                                    firstId: x,
                                    hasPending: S,
                                    matchRouteDeps: _,
                                    matchStores: i,
                                    pendingMatchStores: s,
                                    cachedMatchStores: l,
                                    __store: P,
                                    getRouteMatchStore: function(e) {
                                        let t = C.get(e);
                                        return t || (t = n(() => {
                                            for (let t of g.get()) {
                                                let r = i.get(t);
                                                if (r && r.routeId === e) return r.get()
                                            }
                                        }), C.set(e, t)), t
                                    },
                                    setMatches: k,
                                    setPending: function(e) {
                                        eJ(e, s, v, r, o)
                                    },
                                    setCached: function(e) {
                                        eJ(e, l, w, r, o)
                                    }
                                };

                                function k(e) {
                                    eJ(e, i, g, r, o)
                                }
                                return k(e.matches), a ? .(L), L
                            }({
                                loadedAt: 0,
                                isLoading: !1,
                                isTransitioning: !1,
                                status: "idle",
                                resolvedLocation: void 0,
                                location: this.latestLocation,
                                matches: [],
                                statusCode: 200
                            }, s), t = this, e = (void 0) ? ? t.options.scrollRestoration, r = t._scroll, e && (r.restoring = !0), n = t.options.getScrollRestorationKey || eg, o = new Map, a = (e, t, r) => {
                                let n = o.get(e) || {};
                                n.scrollX = t, n.scrollY = r, o.set(e, n)
                            }, i = e => {
                                if (!r.restoring) return;
                                let t = em[e] || = {};
                                for (let [e, r] of o) e === ew ? t[ew] = r : e.isConnected && (t[function(e) {
                                    let t, r = e.getAttribute(ey);
                                    if (r) return `[${ey}="${r}"]`;
                                    let n = "",
                                        o = e;
                                    for (; t = o.parentNode;) {
                                        let e = 1,
                                            r = o;
                                        for (; r = r.previousElementSibling;) e++;
                                        let a = `${o.localName}:nth-child(${e})`;
                                        n = n ? `${a} > ${n}` : a, o = t
                                    }
                                    return n
                                }(e)] = r)
                            }, e && !r.restoration && (r.restoration = !0, ev = !1, history.scrollRestoration = "manual", document.addEventListener("scroll", e => {
                                if (!ev && r.restoring)
                                    if (e.target === document) a(ew, scrollX, scrollY);
                                    else {
                                        let t = e.target;
                                        a(t, t.scrollLeft, t.scrollTop)
                                    }
                            }, !0), t.subscribe("onBeforeLoad", e => {
                                e.fromLocation && i(n(e.fromLocation)), o.clear()
                            }), addEventListener("pagehide", () => {
                                i(n(t.stores.resolvedLocation.get() ? ? t.stores.location.get()));
                                try {
                                    ep ? .setItem("tsr-scroll-restoration-v1_3", JSON.stringify(em))
                                } catch {}
                            })), r.reset || (r.reset = !0, t.subscribe("onRendered", e => {
                                let a, i = t.options.scrollRestorationBehavior,
                                    s = t.options.scrollToTopSelectors,
                                    l = r.next;
                                if (o.clear(), l || (r.next = !0), "function" == typeof t.options.scrollRestoration && !t.options.scrollRestoration({
                                        location: t.latestLocation
                                    })) return;
                                let u = n(e.toLocation),
                                    c = e.fromLocation && n(e.fromLocation);
                                if (r.restoring && c && c !== u) {
                                    let e = em[c];
                                    if (e) {
                                        let t = em[u];
                                        for (let r in e) {
                                            if (r === ew) {
                                                if (l) continue
                                            } else {
                                                let e = eb(r);
                                                if (!e || l && s && (a ? ? = eR(s)).includes(e)) continue
                                            }
                                            t || (t = em[u] = {}), t[r] ? ? = e[r]
                                        }
                                    }
                                }
                                ev = !0;
                                try {
                                    let t = e.toLocation.hash,
                                        n = e.toLocation.state.__hashScrollIntoViewOptions ? ? !0,
                                        o = !1;
                                    if (l) {
                                        let l = eG.get(e.toLocation),
                                            c = t && n && ("PUSH" === l || "REPLACE" === l),
                                            d = r.restoring ? em[u] : void 0;
                                        if (d)
                                            for (let e in d) {
                                                let {
                                                    scrollX: t,
                                                    scrollY: r
                                                } = d[e];
                                                if (e === ew) {
                                                    if (c) continue;
                                                    scrollTo({
                                                        top: r,
                                                        left: t,
                                                        behavior: i
                                                    }), o = !0
                                                } else {
                                                    let n = eb(e);
                                                    n && (n.scrollLeft = t, n.scrollTop = r)
                                                }
                                            }
                                        if (!o && !t) {
                                            let e = {
                                                top: 0,
                                                left: 0,
                                                behavior: i
                                            };
                                            if (scrollTo(e), s)
                                                for (let t of a ? ? = eR(s)) t.scrollTo(e)
                                        }
                                    }!o && t && n && document.getElementById(t) ? .scrollIntoView(n)
                                } finally {
                                    ev = !1
                                }
                            }))
                        }
                        let u = !1,
                            c = this.options.basepath ? ? "/",
                            d = this.options.rewrite;
                        if (s || i !== c || l !== d) {
                            let e, t, n, o;
                            this.basepath = c;
                            let a = [],
                                i = eu(el(c));
                            i && "/" !== i && a.push((e = eu(el((r = {
                                basepath: c
                            }).basepath)), t = `/${e}`, n = r.caseSensitive ? t : t.toLowerCase(), o = `${n}/`, {
                                input: ({
                                    url: e
                                }) => {
                                    let a = r.caseSensitive ? e.pathname : e.pathname.toLowerCase();
                                    return a === n ? e.pathname = "/" : a.startsWith(o) && (e.pathname = e.pathname.slice(t.length)), e
                                },
                                output: ({
                                    url: t
                                }) => (t.pathname = ei(["/", e, t.pathname]), t)
                            })), d && a.push(d), this.rewrite = 0 === a.length ? void 0 : 1 === a.length ? a[0] : {
                                input: ({
                                    url: e
                                }) => {
                                    for (let t of a) e = eW(t, e);
                                    return e
                                },
                                output: ({
                                    url: e
                                }) => {
                                    for (let t = a.length - 1; t >= 0; t--) e = eV(a[t], e);
                                    return e
                                }
                            }, this.history && this.updateLatestLocation(), u = !0
                        }
                        u && this.stores && this.stores.location.set(this.latestLocation), "u" > typeof window && "CSS" in window && "function" == typeof window.CSS ? .supports && (this.isViewTransitionTypesSupported = window.CSS.supports("selector(:active-view-transition-type(a))"))
                    }, this.updateLatestLocation = () => {
                        this.latestLocation = this.parseLocation(this.history.location, this.latestLocation)
                    }, this.buildRouteTree = () => {
                        let e = function(e, t = !1, r) {
                            let n = Z(e.fullPath),
                                o = new Uint16Array(6),
                                a = {},
                                i = {},
                                s = 0;
                            return Q(t, o, e, 1, n, 0, e => {
                                if (r ? .(e, s), e.id in a && P(), a[e.id] = e, 0 !== s && e.path) {
                                    var t;
                                    let r = "/" === (t = e.fullPath) ? t : t.replace(/\/{1,}$/, "");
                                    (!i[r] || e.fullPath.endsWith("/")) && (i[r] = e)
                                }
                                s++
                            }), X(n), {
                                processedTree: {
                                    segmentTree: n,
                                    singleCache: J(1e3),
                                    matchCache: J(1e3),
                                    flatCache: null,
                                    masksTree: null
                                },
                                routesById: a,
                                routesByPath: i
                            }
                        }(this.routeTree, this.options.caseSensitive, (e, t) => {
                            e.init({
                                originalIndex: t
                            })
                        });
                        return this.options.routeMasks && function(e, t) {
                            let r = Z("/"),
                                n = new Uint16Array(6);
                            for (let t of e) Q(!1, n, t, 1, r, 0);
                            X(r), t.masksTree = r, t.flatCache = J(1e3)
                        }(this.options.routeMasks, e.processedTree), e
                    }, this.subscribe = (e, t) => {
                        let r = {
                            eventType: e,
                            fn: t
                        };
                        return this.subscribers.add(r), () => {
                            this.subscribers.delete(r)
                        }
                    }, this.emit = e => {
                        this.subscribers.forEach(t => {
                            t.eventType === e.type && t.fn(e)
                        })
                    }, this.parseLocation = (e, t) => {
                        let r = ({
                                pathname: e,
                                search: r,
                                hash: n,
                                href: o,
                                state: a
                            }) => {
                                if (!this.rewrite && !/[ \x00-\x1f\x7f\u0080-\uffff]/.test(e)) {
                                    let o = this.options.parseSearch(r),
                                        i = this.options.stringifySearch(o);
                                    return {
                                        href: e + i + n,
                                        publicHref: e + i + n,
                                        pathname: K(e).path,
                                        external: !1,
                                        searchStr: i,
                                        search: D(t ? .search, o),
                                        hash: K(n.slice(1)).path,
                                        state: I(t ? .state, a)
                                    }
                                }
                                let i = new URL(o, this.origin),
                                    s = eW(this.rewrite, i),
                                    l = this.options.parseSearch(s.search),
                                    u = this.options.stringifySearch(l);
                                return s.search = u, {
                                    href: s.href.replace(s.origin, ""),
                                    publicHref: o,
                                    pathname: K(s.pathname).path,
                                    external: !!this.rewrite && s.origin !== this.origin,
                                    searchStr: u,
                                    search: D(t ? .search, l),
                                    hash: K(s.hash.slice(1)).path,
                                    state: I(t ? .state, a)
                                }
                            },
                            n = r(e),
                            {
                                __tempLocation: o,
                                __tempKey: a
                            } = n.state;
                        if (o && (!a || a === this.tempLocationKey)) {
                            let e = r(o);
                            return e.state.key = n.state.key, e.state.__TSR_key = n.state.__TSR_key, delete e.state.__tempLocation, { ...e,
                                maskedLocation: n
                            }
                        }
                        return n
                    }, this.resolvePathWithBase = (e, t) => (function({
                        base: e,
                        to: t,
                        trailingSlash: r = "never",
                        cache: n
                    }) {
                        let o, a, i = t.startsWith("/"),
                            s = !i && "." === t;
                        if (n) {
                            o = i ? t : s ? e : e + "\0" + t;
                            let r = n.get(o);
                            if (r) return r
                        }
                        if (s) a = e.split("/");
                        else if (i) a = t.split("/");
                        else {
                            for (a = e.split("/"); a.length > 1 && "" === L(a);) a.pop();
                            let r = t.split("/");
                            for (let e = 0, t = r.length; e < t; e++) {
                                let n = r[e];
                                "" === n ? e ? e === t - 1 && a.push(n) : a = [n] : ".." === n ? a.pop() : "." === n || a.push(n)
                            }
                        }
                        a.length > 1 && ("" === L(a) ? "never" === r && a.pop() : "always" === r && a.push(""));
                        let l = es(a.join("/")) || "/";
                        return o && n && n.set(o, l), l
                    })({
                        base: e,
                        to: t.includes("//") ? es(t) : t,
                        trailingSlash: this.options.trailingSlash,
                        cache: this.resolvePathCache
                    }), this.matchRoutes = (e, t, r) => "string" == typeof e ? this.matchRoutesInternal({
                        pathname: e,
                        search: t
                    }, r) : this.matchRoutesInternal(e, t), this.getMatchedRoutes = e => (function({
                        pathname: e,
                        routesById: t,
                        processedTree: r
                    }) {
                        let n, o = Object.create(null),
                            a = function(e, t, r = !1) {
                                let n, o = r ? e : `nofuzz\0${e}`,
                                    a = t.matchCache.get(o);
                                if (void 0 !== a) return a;
                                e || = "/";
                                try {
                                    n = et(e, t.segmentTree, r)
                                } catch (e) {
                                    if (e instanceof URIError) n = null;
                                    else throw e
                                }
                                return n && (n.branch = en(n.route)), t.matchCache.set(o, n), n
                            }(eu(e), r, !0);
                        return a && (n = a.route, Object.assign(o, a.rawParams)), {
                            matchedRoutes: a ? .branch || [t.__root__],
                            routeParams: o,
                            foundRoute: n
                        }
                    })({
                        pathname: e,
                        routesById: this.routesById,
                        processedTree: this.processedTree
                    }), this.cancelMatch = e => {
                        let t = this.getMatch(e);
                        t && (t.abortController.abort(), clearTimeout(t._nonReactive.pendingTimeout), t._nonReactive.pendingTimeout = void 0)
                    }, this.cancelMatches = () => {
                        this.stores.pendingIds.get().forEach(e => {
                            this.cancelMatch(e)
                        }), this.stores.matchesId.get().forEach(e => {
                            if (this.stores.pendingMatchStores.has(e)) return;
                            let t = this.stores.matchStores.get(e) ? .get();
                            t && ("pending" === t.status || "loader" === t.isFetching) && this.cancelMatch(e)
                        })
                    }, this.buildLocation = e => {
                        let t = (t = {}) => {
                                let r, n, o, a = t._fromLocation || this.pendingBuiltLocation || this.latestLocation,
                                    i = this.matchRoutesLightweight(a);
                                t.from;
                                let s = "path" === t.unsafeRelative ? a.pathname : t.from ? ? i.fullPath,
                                    l = t.to ? `${t.to}` : void 0,
                                    u = i.search,
                                    c = Object.assign(Object.create(null), i.params),
                                    d = l ? .charCodeAt(0) === 47 ? "/" : this.resolvePathWithBase(s, "."),
                                    h = l ? this.resolvePathWithBase(d, l) : d,
                                    f = !1 === t.params || null === t.params ? Object.create(null) : (t.params ? ? !0) === !0 ? c : Object.assign(c, k(t.params, c)),
                                    p = this.routesByPath[eu(h)];
                                if (p) r = this.getRouteBranch(p);
                                else if (h.includes("$")) r = [];
                                else {
                                    let e = this.getMatchedRoutes(h);
                                    r = e.matchedRoutes, this.options.notFoundRoute && (!e.foundRoute || "/" !== e.foundRoute.path && e.routeParams["**"]) && (r = [...r, this.options.notFoundRoute])
                                }
                                if (r.length && j(f))
                                    for (let e of r) {
                                        let t = e.options.params ? .stringify ? ? e.options.stringifyParams;
                                        if (t) try {
                                            Object.assign(f, t(f))
                                        } catch {}
                                    }
                                let m = e.leaveParams ? h : K(eh({
                                        path: h,
                                        params: f,
                                        decoder: this.pathParamsDecoder,
                                        server: this.isServer
                                    }).interpolatedPath).path,
                                    y = u;
                                if (e._includeValidateSearch && this.options.search ? .strict) {
                                    let e = {};
                                    r.forEach(t => {
                                        if (t.options.validateSearch) try {
                                            Object.assign(e, e1(t.options.validateSearch, { ...e,
                                                ...y
                                            }))
                                        } catch {}
                                    }), y = e
                                }
                                y = D(u, y = function({
                                    search: e,
                                    dest: t,
                                    destRoutes: r,
                                    _includeValidateSearch: n
                                }) {
                                    return (function(e) {
                                        let t, r, n = [];
                                        for (let t of e) {
                                            let e = t.options;
                                            if ("search" in e) e.search ? .middlewares && n.push(...e.search.middlewares);
                                            else if (e.preSearchFilters || e.postSearchFilters) {
                                                let t = ({
                                                    search: t,
                                                    next: r
                                                }) => {
                                                    let n = r(e.preSearchFilters ? e.preSearchFilters.reduce((e, t) => t(e), t) : t);
                                                    return e.postSearchFilters ? e.postSearchFilters.reduce((e, t) => t(e), n) : n
                                                };
                                                n.push(t)
                                            }
                                            let o = e.validateSearch;
                                            if (o) {
                                                let e = ({
                                                    search: e,
                                                    next: t,
                                                    meta: n
                                                }) => {
                                                    let a = t(e);
                                                    if (r) try {
                                                        let e = e1(o, a);
                                                        if (n && e)
                                                            for (let t in e) t in a || (n.defaulted || = new Map).set(t, e[t]);
                                                        return { ...a,
                                                            ...e
                                                        }
                                                    } catch {}
                                                    return a
                                                };
                                                n.push(e)
                                            }
                                        }
                                        let o = (e, r, a) => {
                                            if (e >= n.length) {
                                                if (!t.search) return {};
                                                if (!0 === t.search) return r;
                                                let e = k(t.search, r);
                                                return a && (a.explicit = e), e
                                            }
                                            return n[e]({
                                                search: r,
                                                next: (t, r) => {
                                                    if (r) {
                                                        let r = a || {};
                                                        return {
                                                            search: o(e + 1, t, r),
                                                            meta: r
                                                        }
                                                    }
                                                    return o(e + 1, t, a)
                                                },
                                                meta: a
                                            })
                                        };
                                        return function(e, n, a) {
                                            return t = n, r = a, o(0, e)
                                        }
                                    })(r)(e, t, n ? ? !1)
                                }({
                                    search: y,
                                    dest: t,
                                    destRoutes: r,
                                    _includeValidateSearch: e._includeValidateSearch
                                }));
                                let g = this.options.stringifySearch(y),
                                    v = !0 === t.hash ? a.hash : t.hash ? k(t.hash, a.hash) : void 0,
                                    w = v ? `#${v}` : "",
                                    b = !0 === t.state ? a.state : t.state ? k(t.state, a.state) : {};
                                b = I(a.state, b);
                                let R = `${m}${g}${w}`,
                                    E = !1;
                                if (this.rewrite) {
                                    let e = new URL(R, this.origin),
                                        t = eV(this.rewrite, e);
                                    n = e.href.replace(e.origin, ""), t.origin !== this.origin ? (o = t.href, E = !0) : o = t.pathname + t.search + t.hash
                                } else o = n = /\s|[^\u0000-\u007F]/.test(R) ? R.replace(/\s|[^\u0000-\u007F]/gu, encodeURIComponent) : R;
                                return {
                                    publicHref: o,
                                    href: n,
                                    pathname: m,
                                    search: y,
                                    searchStr: g,
                                    state: b,
                                    hash: v ? ? "",
                                    external: E,
                                    unmaskOnReload: t.unmaskOnReload
                                }
                            },
                            r = (r = {}, n) => {
                                let o = t(r),
                                    a = n ? t(n) : void 0;
                                if (!a) {
                                    let r = Object.create(null);
                                    if (this.options.routeMasks) {
                                        let i = function(e, t) {
                                            e || = "/";
                                            let r = t.flatCache.get(e);
                                            if (r) return r;
                                            let n = et(e, t.masksTree);
                                            return t.flatCache.set(e, n), n
                                        }(o.pathname, this.processedTree);
                                        if (i) {
                                            Object.assign(r, i.rawParams);
                                            let {
                                                from: o,
                                                params: s,
                                                ...l
                                            } = i.route, u = !1 === s || null === s ? Object.create(null) : (s ? ? !0) === !0 ? r : Object.assign(r, k(s, r));
                                            a = t(n = {
                                                from: e.from,
                                                ...l,
                                                params: u
                                            })
                                        }
                                    }
                                }
                                return a && (o.maskedLocation = a), o
                            };
                        return e.mask ? r(e, {
                            from: e.from,
                            ...e.mask
                        }) : r(e)
                    }, this.commitLocation = async ({
                        viewTransition: e,
                        ignoreBlocker: t,
                        ...r
                    }) => {
                        let n, o = () => {
                                let e = ["key", "__TSR_key", "__TSR_index", "__hashScrollIntoViewOptions"];
                                e.forEach(e => {
                                    r.state[e] = this.latestLocation.state[e]
                                });
                                let t = U(r.state, this.latestLocation.state);
                                return e.forEach(e => {
                                    delete r.state[e]
                                }), t
                            },
                            a = eu(this.latestLocation.href) === eu(r.href),
                            i = this.commitLocationPromise;
                        if (this.commitLocationPromise = B(() => {
                                i ? .resolve(), i = void 0
                            }), a && o()) this.load();
                        else {
                            let {
                                maskedLocation: o,
                                hashScrollIntoView: a,
                                ...i
                            } = r;
                            o && ((i = { ...o,
                                state: { ...o.state,
                                    __tempKey: void 0,
                                    __tempLocation: { ...i,
                                        search: i.searchStr,
                                        state: { ...i.state,
                                            __tempKey: void 0,
                                            __tempLocation: void 0,
                                            __TSR_key: void 0,
                                            key: void 0
                                        }
                                    }
                                }
                            }).unmaskOnReload ? ? this.options.unmaskOnReload) && (i.state.__tempKey = this.tempLocationKey), i.state.__hashScrollIntoViewOptions = a ? ? this.options.defaultHashScrollIntoView ? ? !0, this.shouldViewTransition = e, n = r.replace ? "REPLACE" : "PUSH", this.history["REPLACE" === n ? "replace" : "push"](i.publicHref, i.state, {
                                ignoreBlocker: t
                            })
                        }
                        return this._scroll.next = r.resetScroll ? ? !0, this.history.subscribers.size || this.load(n ? {
                            action: {
                                type: n
                            }
                        } : void 0), this.commitLocationPromise
                    }, this.buildAndCommitLocation = ({
                        replace: e,
                        resetScroll: t,
                        hashScrollIntoView: r,
                        viewTransition: n,
                        ignoreBlocker: o,
                        href: a,
                        ...i
                    } = {}) => {
                        if (a) {
                            let t = this.history.location.state.__TSR_index,
                                r = (0, eY.dy)(a, {
                                    __TSR_index: e ? t : t + 1
                                }),
                                n = new URL(r.pathname, this.origin);
                            i.to = eW(this.rewrite, n).pathname, i.search = this.options.parseSearch(r.search), i.hash = r.hash.slice(1)
                        }
                        let s = this.buildLocation({ ...i,
                            _includeValidateSearch: !0
                        });
                        this.pendingBuiltLocation = s;
                        let l = this.commitLocation({ ...s,
                            viewTransition: n,
                            replace: e,
                            resetScroll: t,
                            hashScrollIntoView: r,
                            ignoreBlocker: o
                        });
                        return queueMicrotask(() => {
                            this.pendingBuiltLocation === s && (this.pendingBuiltLocation = void 0)
                        }), l
                    }, this.navigate = async ({
                        to: e,
                        reloadDocument: t,
                        href: r,
                        publicHref: n,
                        ...o
                    }) => {
                        let a = !1;
                        if (r) try {
                            new URL(`${r}`), a = !0
                        } catch {}
                        if (a && !t && (t = !0), t) {
                            if (void 0 !== e || !r) {
                                let t = this.buildLocation({
                                    to: e,
                                    ...o
                                });
                                r = r ? ? t.publicHref, n = n ? ? t.publicHref
                            }
                            let t = !a && n ? n : r;
                            if (V(t, this.protocolAllowlist)) return;
                            if (!o.ignoreBlocker) {
                                for (let e of this.history.getBlockers ? .() ? ? [])
                                    if (e ? .blockerFn && await e.blockerFn({
                                            currentLocation: this.latestLocation,
                                            nextLocation: this.latestLocation,
                                            action: "PUSH"
                                        })) return
                            }
                            return void(o.replace ? window.location.replace(t) : window.location.href = t)
                        }
                        return this.buildAndCommitLocation({ ...o,
                            href: r,
                            to: e,
                            _isNavigate: !0
                        })
                    }, this.beforeLoad = () => {
                        this.cancelMatches(), this.updateLatestLocation();
                        let e = this.matchRoutes(this.latestLocation),
                            t = this.stores.cachedMatches.get().filter(t => !e.some(e => e.id === t.id));
                        this.batch(() => {
                            this.stores.status.set("pending"), this.stores.statusCode.set(200), this.stores.isLoading.set(!0), this.stores.location.set(this.latestLocation), this.stores.setPending(e), this.stores.setCached(t)
                        })
                    }, this.load = async e => {
                        let t, r, n, o, a = e ? .action ? .type,
                            i = this.stores.resolvedLocation.get() ? ? this.stores.location.get();
                        for (n = new Promise(o => {
                                this.startTransition(async () => {
                                    try {
                                        this.beforeLoad(), a ? eG.set(this.latestLocation, a) : eG.delete(this.latestLocation);
                                        let t = this.latestLocation,
                                            r = eQ(t, this.stores.resolvedLocation.get());
                                        this.stores.redirect.get() || this.emit({
                                            type: "onBeforeNavigate",
                                            ...r
                                        }), this.emit({
                                            type: "onBeforeLoad",
                                            ...r
                                        }), await eU({
                                            router: this,
                                            sync: e ? .sync,
                                            forceStaleReload: i.href === t.href,
                                            matches: this.stores.pendingMatches.get(),
                                            location: t,
                                            updateMatch: this.updateMatch,
                                            onReady: async () => {
                                                this.startTransition(() => {
                                                    this.startViewTransition(async () => {
                                                        let e = null,
                                                            t = null,
                                                            r = null,
                                                            n = null;
                                                        for (let [o, a] of (this.batch(() => {
                                                                let o = this.stores.pendingMatches.get(),
                                                                    a = o.length,
                                                                    i = this.stores.matches.get();
                                                                e = a ? i.filter(e => !this.stores.pendingMatchStores.has(e.id)) : null;
                                                                let s = new Set;
                                                                for (let e of this.stores.pendingMatchStores.values()) e.routeId && s.add(e.routeId);
                                                                let l = new Set;
                                                                for (let e of this.stores.matchStores.values()) e.routeId && l.add(e.routeId);
                                                                t = a ? i.filter(e => !s.has(e.routeId)) : null, r = a ? o.filter(e => !l.has(e.routeId)) : null, n = a ? o.filter(e => l.has(e.routeId)) : i, this.stores.isLoading.set(!1), this.stores.loadedAt.set(Date.now()), a && (this.stores.setMatches(o), this.stores.setPending([]), this.stores.setCached([...this.stores.cachedMatches.get(), ...e.filter(e => "error" !== e.status && "notFound" !== e.status && "redirected" !== e.status)]), this.clearExpiredCache())
                                                            }), [
                                                                [t, "onLeave"],
                                                                [r, "onEnter"],
                                                                [n, "onStay"]
                                                            ]))
                                                            if (o)
                                                                for (let e of o) this.looseRoutesById[e.routeId].options[a] ? .(e)
                                                    })
                                                })
                                            }
                                        })
                                    } catch (n) {
                                        e_(n) ? (t = n, this.navigate({ ...t.options,
                                            replace: !0,
                                            ignoreBlocker: !0
                                        })) : b(n) && (r = n);
                                        let e = t ? t.status : r ? 404 : this.stores.matches.get().some(e => "error" === e.status) ? 500 : 200;
                                        this.batch(() => {
                                            this.stores.statusCode.set(e), this.stores.redirect.set(t)
                                        })
                                    }
                                    this.latestLoadPromise === n && (this.commitLocationPromise ? .resolve(), this.latestLoadPromise = void 0, this.commitLocationPromise = void 0), o()
                                })
                            }), this.latestLoadPromise = n, await n; this.latestLoadPromise && n !== this.latestLoadPromise;) await this.latestLoadPromise;
                        this.hasNotFoundMatch() ? o = 404 : this.stores.matches.get().some(e => "error" === e.status) && (o = 500), void 0 !== o && this.stores.statusCode.set(o)
                    }, this.startViewTransition = e => {
                        let t = this.shouldViewTransition ? ? this.options.defaultViewTransition;
                        if (this.shouldViewTransition = void 0, t && "u" > typeof document && "startViewTransition" in document && "function" == typeof document.startViewTransition) {
                            let r;
                            if ("object" == typeof t && this.isViewTransitionTypesSupported) {
                                let n = this.latestLocation,
                                    o = this.stores.resolvedLocation.get(),
                                    a = "function" == typeof t.types ? t.types(eQ(n, o)) : t.types;
                                if (!1 === a) return void e();
                                r = {
                                    update: e,
                                    types: a
                                }
                            } else r = e;
                            document.startViewTransition(r)
                        } else e()
                    }, this.updateMatch = (e, t) => {
                        this.startTransition(() => {
                            let r = this.stores.pendingMatchStores.get(e);
                            if (r) return void r.set(t);
                            let n = this.stores.matchStores.get(e);
                            if (n) return void n.set(t);
                            let o = this.stores.cachedMatchStores.get(e);
                            if (o) {
                                let r = t(o.get());
                                "redirected" === r.status ? this.stores.cachedMatchStores.delete(e) && this.stores.cachedIds.set(t => t.filter(t => t !== e)) : o.set(r)
                            }
                        })
                    }, this.getMatch = e => this.stores.cachedMatchStores.get(e) ? .get() ? ? this.stores.pendingMatchStores.get(e) ? .get() ? ? this.stores.matchStores.get(e) ? .get(), this.invalidate = e => {
                        let t = t => e ? .filter ? .(t) ? ? !0 ? { ...t,
                            invalid: !0,
                            ...e ? .forcePending || "error" === t.status || "notFound" === t.status ? {
                                status: "pending",
                                error: void 0
                            } : void 0
                        } : t;
                        return this.batch(() => {
                            this.stores.setMatches(this.stores.matches.get().map(t)), this.stores.setCached(this.stores.cachedMatches.get().map(t)), this.stores.setPending(this.stores.pendingMatches.get().map(t))
                        }), this.shouldViewTransition = !1, this.load({
                            sync: e ? .sync
                        })
                    }, this.getParsedLocationHref = e => e.publicHref || "/", this.resolveRedirect = e => {
                        let t = e.headers.get("Location");
                        if (!e.options.href || e.options._builtLocation) {
                            let t = e.options._builtLocation ? ? this.buildLocation(e.options),
                                r = this.getParsedLocationHref(t);
                            e.options.href = r, e.headers.set("Location", r)
                        } else if (t) try {
                            let r = new URL(t);
                            if (this.origin && r.origin === this.origin) {
                                let t = r.pathname + r.search + r.hash;
                                e.options.href = t, e.headers.set("Location", t)
                            }
                        } catch {}
                        if (e.options.href && !e.options._builtLocation && V(e.options.href, this.protocolAllowlist)) throw Error("Redirect blocked: unsafe protocol");
                        return e.headers.get("Location") || e.headers.set("Location", e.options.href), e
                    }, this.clearCache = e => {
                        let t = e ? .filter;
                        void 0 !== t ? this.stores.setCached(this.stores.cachedMatches.get().filter(e => !t(e))) : this.stores.setCached([])
                    }, this.clearExpiredCache = () => {
                        let e = Date.now(),
                            t = t => {
                                let r = this.looseRoutesById[t.routeId];
                                if (!r.options.loader) return !0;
                                let n = (t.preload ? r.options.preloadGcTime ? ? this.options.defaultPreloadGcTime : r.options.gcTime ? ? this.options.defaultGcTime) ? ? 3e5;
                                return "error" === t.status || e - t.updatedAt >= n
                            };
                        this.clearCache({
                            filter: t
                        })
                    }, this.loadRouteChunk = eH, this.preloadRoute = async e => {
                        let t = e._builtLocation ? ? this.buildLocation(e),
                            r = this.matchRoutes(t, {
                                throwOnError: !0,
                                preload: !0,
                                dest: e
                            }),
                            n = new Set([...this.stores.matchesId.get(), ...this.stores.pendingIds.get()]),
                            o = new Set([...n, ...this.stores.cachedIds.get()]),
                            a = r.filter(e => !o.has(e.id));
                        if (a.length) {
                            let e = this.stores.cachedMatches.get();
                            this.stores.setCached([...e, ...a])
                        }
                        try {
                            return r = await eU({
                                router: this,
                                matches: r,
                                location: t,
                                preload: !0,
                                updateMatch: (e, t) => {
                                    n.has(e) ? r = r.map(r => r.id === e ? t(r) : r) : this.updateMatch(e, t)
                                }
                            })
                        } catch (e) {
                            if (e_(e)) {
                                if (e.options.reloadDocument) return;
                                return await this.preloadRoute({ ...e.options,
                                    _fromLocation: t
                                })
                            }
                            b(e) || console.error(e);
                            return
                        }
                    }, this.matchRoute = (e, t) => {
                        var r, n, o, a, i;
                        let s, l, u = { ...e,
                                to: e.to ? this.resolvePathWithBase(e.from || "", e.to) : void 0,
                                params: e.params || {},
                                leaveParams: !0
                            },
                            c = this.buildLocation(u);
                        if (t ? .pending && "pending" !== this.stores.status.get()) return !1;
                        let d = (t ? .pending === void 0 ? !this.stores.isLoading.get() : t.pending) ? this.latestLocation : this.stores.resolvedLocation.get() || this.stores.location.get(),
                            h = (r = c.pathname, n = t ? .caseSensitive ? ? !1, o = t ? .fuzzy ? ? !1, a = d.pathname, i = this.processedTree, r || = "/", a || = "/", s = n ? `case\0${r}` : r, (l = i.singleCache.get(s)) || (l = Z("/"), Q(n, new Uint16Array(6), {
                                from: r
                            }, 1, l, 0), i.singleCache.set(s, l)), et(a, l, o));
                        return !!h && (!e.params || !!U(h.rawParams, e.params, {
                            partial: !0
                        })) && (t ? .includeSearch ? ? !0 ? !!U(d.search, c.search, {
                            partial: !0
                        }) && h.rawParams : h.rawParams)
                    }, this.hasNotFoundMatch = () => this.stores.matches.get().some(e => "notFound" === e.status || e.globalNotFound), this.getStoreConfig = t, this.update({
                        defaultPreloadDelay: 50,
                        defaultPendingMs: 1e3,
                        defaultPendingMinMs: 500,
                        context: void 0,
                        ...e,
                        caseSensitive: e.caseSensitive ? ? !1,
                        notFoundMode: e.notFoundMode ? ? "fuzzy",
                        stringifySearch: e.stringifySearch ? ? eS,
                        parseSearch: e.parseSearch ? ? ex,
                        protocolAllowlist: e.protocolAllowlist ? ? W
                    }), "u" > typeof document && (self.__TSR_ROUTER__ = this)
                }
                isShell() {
                    return !!this.options.isShell
                }
                isPrerendering() {
                    return !!this.options.isPrerendering
                }
                get state() {
                    return this.stores.__store.get()
                }
                setRoutes({
                    routesById: e,
                    routesByPath: t,
                    processedTree: r
                }) {
                    this.routesById = e, this.routesByPath = t, this.processedTree = r;
                    let n = this.options.notFoundRoute;
                    n && (n.init({
                        originalIndex: 0x174876e7ff
                    }), this.routesById[n.id] = n)
                }
                getRouteBranch(e) {
                    let t = this.routeBranchCache.get(e);
                    return t || (t = en(e), this.routeBranchCache.set(e, t)), t
                }
                get looseRoutesById() {
                    return this.routesById
                }
                getParentContext(e) {
                    return e ? .id ? e.context ? ? this.options.context ? ? void 0 : this.options.context ? ? void 0
                }
                matchRoutesInternal(e, t) {
                    let r = this.getMatchedRoutes(e.pathname),
                        {
                            foundRoute: n,
                            routeParams: o
                        } = r,
                        {
                            matchedRoutes: a
                        } = r,
                        i = !1;
                    (n ? "/" !== n.path && o["**"] : eu(e.pathname)) && (this.options.notFoundRoute ? a = [...a, this.options.notFoundRoute] : i = !0);
                    let s = i ? function(e, t) {
                            if ("root" !== e)
                                for (let e = t.length - 1; e >= 0; e--) {
                                    let r = t[e];
                                    if (r.children) return r.id
                                }
                            return C
                        }(this.options.notFoundMode, a) : void 0,
                        l = Array(a.length),
                        u = new Map;
                    for (let e of this.stores.matchStores.values()) e.routeId && u.set(e.routeId, e.get());
                    for (let r = 0; r < a.length; r++) {
                        let n, i, c, d, h, f = a[r],
                            p = l[r - 1]; {
                            let r = p ? .search ? ? e.search,
                                o = p ? ._strictSearch ? ? void 0;
                            try {
                                let e = e1(f.options.validateSearch, { ...r
                                }) ? ? void 0;
                                n = { ...r,
                                    ...e
                                }, i = { ...o,
                                    ...e
                                }, c = void 0
                            } catch (o) {
                                let e = o;
                                if (o instanceof eZ || (e = new eZ(o.message, {
                                        cause: o
                                    })), t ? .throwOnError) throw e;
                                n = r, i = {}, c = e
                            }
                        }
                        let m = f.options.loaderDeps ? .({
                                search: n
                            }) ? ? "",
                            y = m ? JSON.stringify(m) : "",
                            {
                                interpolatedPath: g,
                                usedParams: v
                            } = eh({
                                path: f.fullPath,
                                params: o,
                                decoder: this.pathParamsDecoder,
                                server: this.isServer
                            }),
                            w = f.id + g + y,
                            R = this.getMatch(w),
                            E = u.get(f.id),
                            x = R ? ._strictParams ? ? v;
                        if (!R) try {
                            e2(f, x)
                        } catch (e) {
                            if (h = b(e) || e_(e) ? e : new e0(e.message, {
                                    cause: e
                                }), t ? .throwOnError) throw h
                        }
                        Object.assign(o, x);
                        let S = E ? "stay" : "enter";
                        if (R) d = { ...R,
                            cause: S,
                            params: E ? .params ? ? o,
                            _strictParams: x,
                            search: E ? D(E.search, n) : D(R.search, n),
                            _strictSearch: i
                        };
                        else {
                            let e = f.options.loader || f.options.beforeLoad || f.lazyFn || ez(f) ? "pending" : "success";
                            d = {
                                id: w,
                                ssr: f.options.ssr,
                                index: r,
                                routeId: f.id,
                                params: E ? .params ? ? o,
                                _strictParams: x,
                                pathname: g,
                                updatedAt: Date.now(),
                                search: E ? D(E.search, n) : n,
                                _strictSearch: i,
                                searchError: void 0,
                                status: e,
                                isFetching: !1,
                                error: void 0,
                                paramsError: h,
                                __routeContext: void 0,
                                _nonReactive: {
                                    loadPromise: B()
                                },
                                __beforeLoadContext: void 0,
                                context: {},
                                abortController: new AbortController,
                                fetchCount: 0,
                                cause: S,
                                loaderDeps: E ? I(E.loaderDeps, m) : m,
                                invalid: !1,
                                preload: !1,
                                links: void 0,
                                scripts: void 0,
                                headScripts: void 0,
                                meta: void 0,
                                staticData: f.options.staticData || {},
                                fullPath: f.fullPath
                            }
                        }
                        t ? .preload || (d.globalNotFound = s === f.id), d.searchError = c;
                        let _ = this.getParentContext(p);
                        d.context = { ..._,
                            ...d.__routeContext,
                            ...d.__beforeLoadContext
                        }, l[r] = d
                    }
                    for (let t = 0; t < l.length; t++) {
                        let r = l[t],
                            n = this.looseRoutesById[r.routeId],
                            a = this.getMatch(r.id),
                            i = u.get(r.routeId);
                        if (r.params = i ? D(i.params, o) : o, !a) {
                            let o = l[t - 1],
                                a = this.getParentContext(o);
                            if (n.options.context) {
                                let t = {
                                    deps: r.loaderDeps,
                                    params: r.params,
                                    context: a ? ? {},
                                    location: e,
                                    navigate: t => this.navigate({ ...t,
                                        _fromLocation: e
                                    }),
                                    buildLocation: this.buildLocation,
                                    cause: r.cause,
                                    abortController: r.abortController,
                                    preload: !!r.preload,
                                    matches: l,
                                    routeId: n.id
                                };
                                r.__routeContext = n.options.context(t) ? ? void 0
                            }
                            r.context = { ...a,
                                ...r.__routeContext,
                                ...r.__beforeLoadContext
                            }
                        }
                    }
                    return l
                }
                matchRoutesLightweight(e) {
                    let t, r = L(this.stores.matchesId.get()),
                        n = this.lightweightCache.get(e);
                    if (n && n[0] === r) return n[1];
                    let {
                        matchedRoutes: o,
                        routeParams: a
                    } = this.getMatchedRoutes(e.pathname), i = L(o), s = { ...e.search
                    };
                    for (let e of o) try {
                        Object.assign(s, e1(e.options.validateSearch, s))
                    } catch {}
                    let l = r && this.stores.matchStores.get(r) ? .get();
                    if (l && l.routeId === i.id && l.pathname === e.pathname) t = l.params;
                    else {
                        let e = Object.assign(Object.create(null), a);
                        for (let t of o) try {
                            e2(t, e)
                        } catch {}
                        t = e
                    }
                    let u = {
                        matchedRoutes: o,
                        fullPath: i.fullPath,
                        search: s,
                        params: t
                    };
                    return this.lightweightCache.set(e, [r, u]), u
                }
            },
            eZ = class extends Error {},
            e0 = class extends Error {};

        function e1(e, t) {
            if (null == e) return {};
            if ("~standard" in e) {
                let r = e["~standard"].validate(t);
                if (r instanceof Promise) throw new eZ("Async validation not supported");
                if (r.issues) throw new eZ(JSON.stringify(r.issues, void 0, 2), {
                    cause: r
                });
                return r.value
            }
            return "parse" in e ? e.parse(t) : "function" == typeof e ? e(t) : {}
        }

        function e2(e, t) {
            let r = e.options.params ? .parse ? ? e.options.parseParams;
            if (r) {
                let e = r(t);
                if (!1 === e) throw Error("Route params.parse returned false for a matched route");
                Object.assign(t, e)
            }
        }
        var e4 = i.memo(function({
            matchId: e
        }) {
            let t = w(),
                r = t.stores.matchStores.get(e);
            r || P();
            let n = (0, R.P)(t.stores.loadedAt, e => e),
                o = (0, R.P)(r, e => e);
            return (0, u.jsx)(e3, {
                router: t,
                matchId: e,
                resetKey: n,
                matchState: i.useMemo(() => {
                    let e = o.routeId,
                        r = t.routesById[e].parentRoute ? .id;
                    return {
                        routeId: e,
                        ssr: o.ssr,
                        _displayPending: o._displayPending,
                        parentRouteId: r
                    }
                }, [o._displayPending, o.routeId, o.ssr, t.routesById])
            })
        });

        function e3({
            router: e,
            matchId: t,
            resetKey: r,
            matchState: n
        }) {
            let o = e.routesById[n.routeId],
                a = o.options.pendingComponent ? ? e.options.defaultPendingComponent,
                s = a ? (0, u.jsx)(a, {}) : null,
                l = o.options.errorComponent ? ? e.options.defaultErrorComponent,
                d = o.options.onCatch ? ? e.options.defaultOnCatch,
                p = o.isRoot ? o.options.notFoundComponent ? ? e.options.notFoundRoute ? .options.component : o.options.notFoundComponent,
                m = !1 === n.ssr || "data-only" === n.ssr,
                g = (!o.isRoot || o.options.wrapInSuspense || m) && (o.options.wrapInSuspense ? ? a ? ? (o.options.errorComponent ? .preload || m)) ? i.Suspense : S,
                v = l ? c : S,
                w = p ? E : S;
            return (0, u.jsxs)(o.isRoot ? o.options.shellComponent ? ? S : S, {
                children: [(0, u.jsx)(y.Provider, {
                    value: t,
                    children: (0, u.jsx)(g, {
                        fallback: s,
                        children: (0, u.jsx)(v, {
                            getResetKey: () => r,
                            errorComponent: l || h,
                            onCatch: (e, t) => {
                                if (b(e)) throw e.routeId ? ? = n.routeId, e;
                                d ? .(e, t)
                            },
                            children: (0, u.jsx)(w, {
                                fallback: e => {
                                    if (e.routeId ? ? = n.routeId, !p || e.routeId && e.routeId !== n.routeId || !e.routeId && !o.isRoot) throw e;
                                    return i.createElement(p, e)
                                },
                                children: m || n._displayPending ? (0, u.jsx)(f, {
                                    fallback: s,
                                    children: (0, u.jsx)(e6, {
                                        matchId: t
                                    })
                                }) : (0, u.jsx)(e6, {
                                    matchId: t
                                })
                            })
                        })
                    })
                }), n.parentRouteId === C ? (0, u.jsxs)(u.Fragment, {
                    children: [(0, u.jsx)(e5, {
                        resetKey: r
                    }), (e.options.scrollRestoration, null)]
                }) : null]
            })
        }

        function e5({
            resetKey: e
        }) {
            let t = w(),
                r = i.useRef(void 0);
            return s(() => {
                let e = t.latestLocation.href;
                (void 0 === r.current || r.current !== e) && (t.emit({
                    type: "onRendered",
                    ...eQ(t.stores.location.get(), t.stores.resolvedLocation.get())
                }), r.current = e)
            }, [t.latestLocation.state.__TSR_key, e, t]), null
        }
        var e6 = i.memo(function({
                matchId: e
            }) {
                let t = w(),
                    r = (e, r) => t.getMatch(e.id) ? ._nonReactive[r] ? ? e._nonReactive[r],
                    n = t.stores.matchStores.get(e);
                n || P();
                let o = (0, R.P)(n, e => e),
                    a = o.routeId,
                    s = t.routesById[a],
                    l = i.useMemo(() => {
                        let e = (t.routesById[a].options.remountDeps ? ? t.options.defaultRemountDeps) ? .({
                            routeId: a,
                            loaderDeps: o.loaderDeps,
                            params: o._strictParams,
                            search: o._strictSearch
                        });
                        return e ? JSON.stringify(e) : void 0
                    }, [a, o.loaderDeps, o._strictParams, o._strictSearch, t.options.defaultRemountDeps, t.routesById]),
                    c = i.useMemo(() => {
                        let e = s.options.component ? ? t.options.defaultComponent;
                        return e ? (0, u.jsx)(e, {}, l) : (0, u.jsx)(e9, {})
                    }, [l, s.options.component, t.options.defaultComponent]);
                if (o._displayPending) throw r(o, "displayPendingPromise");
                if (o._forcePending) throw r(o, "minPendingPromise");
                if ("pending" === o.status) {
                    let e = s.options.pendingMinMs ? ? t.options.defaultPendingMinMs;
                    if (e) {
                        let r = t.getMatch(o.id);
                        if (r && !r._nonReactive.minPendingPromise) {
                            let t = B();
                            r._nonReactive.minPendingPromise = t, setTimeout(() => {
                                t.resolve(), r._nonReactive.minPendingPromise = void 0
                            }, e)
                        }
                    }
                    throw r(o, "loadPromise")
                }
                if ("notFound" === o.status) return b(o.error) || P(), _(t, s, o.error);
                if ("redirected" === o.status) throw e_(o.error) || P(), r(o, "loadPromise");
                if ("error" === o.status) throw o.error;
                return c
            }),
            e9 = i.memo(function() {
                let e, t, r = w(),
                    n = i.useContext(y),
                    o = !1; {
                    let a = n ? r.stores.matchStores.get(n) : void 0;
                    [e, o] = (0, R.P)(a, e => [e ? .routeId, e ? .globalNotFound ? ? !1]), t = (0, R.P)(r.stores.matchesId, e => e[e.findIndex(e => e === n) + 1])
                }
                let a = e ? r.routesById[e] : void 0,
                    s = r.options.defaultPendingComponent ? (0, u.jsx)(r.options.defaultPendingComponent, {}) : null;
                if (o) return a || P(), _(r, a, void 0);
                if (!t) return null;
                let l = (0, u.jsx)(e4, {
                    matchId: t
                });
                return e === C ? (0, u.jsx)(i.Suspense, {
                    fallback: s,
                    children: l
                }) : l
            }),
            e7 = r(916522);

        function e8(e) {
            let t = w();
            return i.useCallback(r => t.navigate({ ...r,
                from: r.from ? ? e ? .from
            }), [e ? .from, t])
        }
        let te = "__gh__react-core-preventAutofocus";

        function tt(e, t) {
            try {
                let r = t.split("?"),
                    n = r[0] ? .split("#")[0];
                if (!n) return !0;
                let o = e.matchRoutes(n, {});
                if (!o || 0 === o.length) return !0;
                let a = n.length > 1 ? n.replace(/\/$/, "") : n;
                return !o.some(e => {
                    let t = e.routeId,
                        r = e.pathname.length > 1 ? e.pathname.replace(/\/$/, "") : e.pathname;
                    return "__root__" !== t && r === a
                })
            } catch {
                return !0
            }
        }
        let tr = () => {
                let e, t, r = (0, e7.c)(6),
                    n = e8(),
                    o = w();
                r[0] !== o ? (e = e => !o || tt(o, e), r[0] = o, r[1] = e) : e = r[1];
                let a = e;
                return r[2] !== a || r[3] !== n || r[4] !== o ? (t = (e, t) => {
                    let r;
                    "string" == typeof e ? r = e : e && "object" == typeof e && e.pathname && (r = e.pathname);
                    let {
                        preventScrollReset: i,
                        relative: s,
                        flushSync: l,
                        preventAutofocus: u,
                        preventTurbo: c,
                        state: d,
                        ...h
                    } = t ? ? {}, f = { ...h
                    };
                    if (void 0 !== d && (f.state = d), void 0 !== i && (f.resetScroll = !i), "path" === s && (f.unsafeRelative = "path"), u && (f.state = {
                            [te]: !0,
                            ...d ? ? {}
                        }), r && a(r) && (f.href = r, f.to = void 0, f.reloadDocument = !0), "string" == typeof e) return void n({
                        to: e,
                        ...f
                    });
                    if (e && "object" == typeof e) {
                        let {
                            pathname: t,
                            search: r,
                            hash: a,
                            ...i
                        } = e, s = { ...i
                        };
                        t && (s.to = t), void 0 !== r && ("string" == typeof r ? s.search = o.options.parseSearch(r) : s.search = r), a && (s.hash = a), n({ ...s,
                            ...f
                        });
                        return
                    }
                    n({
                        to: e,
                        ...f
                    })
                }, r[2] = a, r[3] = n, r[4] = o, r[5] = t) : t = r[5], t
            },
            tn = Symbol("missing-route-error"),
            to = (0, i.createContext)(tn);

        function ta(e) {
            let t, r = (0, e7.c)(3),
                {
                    error: n,
                    children: o
                } = e;
            return r[0] !== o || r[1] !== n ? (t = (0, u.jsx)(to, {
                value: n,
                children: o
            }), r[0] = o, r[1] = n, r[2] = t) : t = r[2], t
        }

        function ti(e) {
            function t(t) {
                let r, n, o = (0, e7.c)(3),
                    {
                        error: a
                    } = t;
                o[0] === Symbol.for("react.memo_cache_sentinel") ? (r = "ErrorBoundary" in e ? (0, u.jsx)(e.ErrorBoundary, {}) : e.errorElement, o[0] = r) : r = o[0];
                let i = r;
                return o[1] !== a ? (n = (0, u.jsx)(ta, {
                    error: a,
                    children: i
                }), o[1] = a, o[2] = n) : n = o[2], n
            }
            return t.displayName = "WrappedTanStackErrorComponent", t
        }

        function ts(e) {
            function t(t) {
                let r, n, o = (0, e7.c)(3),
                    {
                        data: a
                    } = t;
                o[0] === Symbol.for("react.memo_cache_sentinel") ? (r = "ErrorBoundary" in e ? (0, u.jsx)(e.ErrorBoundary, {}) : e.errorElement, o[0] = r) : r = o[0];
                let i = r;
                return o[1] !== a ? (n = (0, u.jsx)(ta, {
                    error: {
                        status: 404,
                        statusText: "Not Found",
                        internal: !0,
                        data: a
                    },
                    children: i
                }), o[1] = a, o[2] = n) : n = o[2], n
            }
            return t.displayName = "WrappedTanStackNotFoundComponent", t
        }

        function tl(e) {
            return tu(eS(e))
        }

        function tu(e) {
            if (!e) return new URLSearchParams;
            if ("string" == typeof e || e instanceof URLSearchParams || Array.isArray(e)) return new URLSearchParams(e);
            let t = new URLSearchParams;
            for (let [r, n] of Object.entries(e))
                if (Array.isArray(n))
                    for (let e of n) t.append(r, e);
                else t.set(r, n);
            return t
        }
        to.displayName = "RouteErrorContext", ta.displayName = "RouteErrorProvider";
        var tc = r(645403);

        function td() {
            let e = w(),
                t = i.useRef({
                    router: e,
                    mounted: !1
                }),
                [r, n] = i.useState(!1),
                o = (0, R.P)(e.stores.isLoading, e => e),
                a = (0, R.P)(e.stores.hasPending, e => e),
                u = l(o),
                c = o || r || a,
                d = l(c),
                h = o || a,
                f = l(h);
            return e.startTransition = e => {
                n(!0), i.startTransition(() => {
                    e(), n(!1)
                })
            }, i.useEffect(() => {
                let t = e.history.subscribe(e.load),
                    r = e.buildLocation({
                        to: e.latestLocation.pathname,
                        search: !0,
                        params: !0,
                        hash: !0,
                        state: !0,
                        _includeValidateSearch: !0
                    });
                return eu(e.latestLocation.publicHref) !== eu(r.publicHref) && e.commitLocation({ ...r,
                    replace: !0
                }), () => {
                    t()
                }
            }, [e, e.history]), s(() => {
                "u" > typeof window && e.ssr || t.current.router === e && t.current.mounted || (t.current = {
                    router: e,
                    mounted: !0
                }, (async () => {
                    try {
                        await e.load()
                    } catch (e) {
                        console.error(e)
                    }
                })())
            }, [e]), s(() => {
                u && !o && e.emit({
                    type: "onLoad",
                    ...eQ(e.stores.location.get(), e.stores.resolvedLocation.get())
                })
            }, [u, e, o]), s(() => {
                f && !h && e.emit({
                    type: "onBeforeRouteMount",
                    ...eQ(e.stores.location.get(), e.stores.resolvedLocation.get())
                })
            }, [h, f, e]), s(() => {
                if (d && !c) {
                    let t = eQ(e.stores.location.get(), e.stores.resolvedLocation.get());
                    e.emit({
                        type: "onResolved",
                        ...t
                    }), (0, tc.vA)(() => {
                        e.stores.status.set("idle"), e.stores.resolvedLocation.set(e.stores.location.get())
                    })
                }
            }, [c, d, e]), null
        }

        function th() {
            let e = w(),
                t = e.routesById[C].options.pendingComponent ? ? e.options.defaultPendingComponent,
                r = t ? (0, u.jsx)(t, {}) : null,
                n = (0, u.jsxs)("u" > typeof document && e.ssr ? S : i.Suspense, {
                    fallback: r,
                    children: [(0, u.jsx)(td, {}), (0, u.jsx)(tf, {})]
                });
            return e.options.InnerWrap ? (0, u.jsx)(e.options.InnerWrap, {
                children: n
            }) : n
        }

        function tf() {
            let e = w(),
                t = (0, R.P)(e.stores.firstId, e => e),
                r = (0, R.P)(e.stores.loadedAt, e => e),
                n = t ? (0, u.jsx)(e4, {
                    matchId: t
                }) : null;
            return (0, u.jsx)(y.Provider, {
                value: t,
                children: e.options.disableGlobalCatchBoundary ? n : (0, u.jsx)(c, {
                    getResetKey: () => r,
                    errorComponent: h,
                    onCatch: void 0,
                    children: n
                })
            })
        }

        function tp() {
            let e, t, r, n = (0, e7.c)(2),
                o = (t = w(), r = i.useRef(void 0), (0, R.P)(t.stores.matches, e => {
                    if ((void 0) ? ? t.options.defaultStructuralSharing) {
                        let t = I(r.current, e);
                        return r.current = t, t
                    }
                    return e
                }));
            return n[0] !== o ? (e = o.map(tm), n[0] = o, n[1] = e) : e = n[1], e
        }

        function tm(e) {
            return {
                id: e.staticData.dataRouterId ? ? e.routeId,
                pathname: e.pathname,
                params: e.params,
                handle: e.staticData,
                loaderData: e.loaderData
            }
        }
        var ty = {
            get: () => void 0,
            subscribe: () => ({
                unsubscribe: () => {}
            })
        };

        function tg(e) {
            let t = w(),
                r = i.useContext(e.from ? g : y),
                n = e.from ? ? r,
                o = n ? e.from ? t.stores.getRouteMatchStore(n) : t.stores.matchStores.get(n) : void 0,
                a = i.useRef(void 0);
            return (0, R.P)(o ? ? ty, r => {
                if ((e.shouldThrow ? ? !0) && !r && P(), void 0 === r) return;
                let n = e.select ? e.select(r) : r;
                if (e.structuralSharing ? ? t.options.defaultStructuralSharing) {
                    let e = I(a.current, n);
                    return a.current = e, e
                }
                return n
            })
        }

        function tv(e) {
            return tg({
                from: e.from,
                shouldThrow: e.shouldThrow,
                structuralSharing: e.structuralSharing,
                strict: e.strict,
                select: t => {
                    let r = !1 === e.strict ? t.params : t._strictParams;
                    return e.select ? e.select(r) : r
                }
            })
        }
        var tw = r(147966);

        function tb(e) {
            return tg({
                from: e.from,
                strict: e.strict,
                structuralSharing: e.structuralSharing,
                select: t => e.select ? e.select(t.loaderData) : t.loaderData
            })
        }

        function tR(e) {
            let t = w({
                    warn: e ? .router === void 0
                }),
                r = e ? .router || t,
                n = (0, i.useRef)(void 0);
            return (0, R.P)(r.stores.__store, t => {
                if (e ? .select) {
                    if (e.structuralSharing ? ? r.options.defaultStructuralSharing) {
                        let r = I(n.current, e.select(t));
                        return n.current = r, r
                    }
                    return e.select(t)
                }
                return t
            })
        }
        let tE = e => ({
            search: e.searchStr,
            pathname: e.pathname,
            hash: e.hash,
            state: function(e) {
                if (null == e || "object" != typeof e) return null;
                let {
                    key: t,
                    __TSR_key: r,
                    __TSR_index: n,
                    __hashScrollIntoViewOptions: o,
                    ...a
                } = e;
                return Object.keys(a).length > 0 ? a : null
            }(e.state),
            key: e.state ? .__TSR_key ? ? "default"
        });

        function tx(e) {
            let t = e.resolvedLocation ? ? e.location;
            return tE(e.location.pathname === t.pathname ? e.location : t)
        }

        function tS(e) {
            return {
                routerIsLoading: e.isLoading,
                location: tE(e.location)
            }
        }

        function t_(e) {
            let t = e.resolvedLocation ? ? e.location;
            return e.location.pathname !== t.pathname
        }
        var tP = r(440961);

        function tC(e, t) {
            let r, n = w(),
                o = (r = i.useRef(null), i.useImperativeHandle(t, () => r.current, []), r),
                {
                    activeProps: a,
                    inactiveProps: s,
                    activeOptions: l,
                    to: u,
                    preload: c,
                    preloadDelay: d,
                    preloadIntentProximity: h,
                    hashScrollIntoView: f,
                    replace: m,
                    startTransition: y,
                    resetScroll: g,
                    viewTransition: v,
                    children: b,
                    target: E,
                    disabled: x,
                    style: S,
                    className: _,
                    onClick: P,
                    onBlur: C,
                    onFocus: L,
                    onMouseEnter: N,
                    onMouseLeave: T,
                    onTouchStart: j,
                    ignoreBlocker: A,
                    params: D,
                    search: I,
                    hash: M,
                    state: O,
                    mask: $,
                    reloadDocument: F,
                    unsafeRelative: B,
                    from: H,
                    _fromLocation: z,
                    ...q
                } = e,
                W = p(),
                K = i.useMemo(() => e, [n, e.from, e._fromLocation, e.hash, e.to, e.search, e.params, e.state, e.mask, e.unsafeRelative]),
                J = (0, R.P)(n.stores.location, e => e, (e, t) => e.href === t.href),
                Y = i.useMemo(() => {
                    let e = {
                        _fromLocation: J,
                        ...K
                    };
                    return n.buildLocation(e)
                }, [n, J, K]),
                Q = Y.maskedLocation ? Y.maskedLocation.publicHref : Y.publicHref,
                G = Y.maskedLocation ? Y.maskedLocation.external : Y.external,
                X = i.useMemo(() => (function(e, t, r, n) {
                    if (!n) return t ? {
                        href: e,
                        external: !0
                    } : {
                        href: r.createHref(e) || "/",
                        external: !1
                    }
                })(Q, G, n.history, x), [x, G, Q, n.history]),
                Z = i.useMemo(() => {
                    if (X ? .external) return V(X.href, n.protocolAllowlist) ? void 0 : X.href;
                    if (! function(e) {
                            if ("string" != typeof e) return !1;
                            let t = e.charCodeAt(0);
                            return 47 === t ? 47 !== e.charCodeAt(1) : 46 === t
                        }(u) && "string" == typeof u && -1 !== u.indexOf(":")) try {
                        if (new URL(u), V(u, n.protocolAllowlist)) return;
                        return u
                    } catch {}
                }, [u, X, n.protocolAllowlist]),
                ee = i.useMemo(() => {
                    if (Z) return !1;
                    if (l ? .exact) {
                        var e, t, r;
                        if (e = J.pathname, t = Y.pathname, ec(e, r = n.basepath) !== ec(t, r)) return !1
                    } else {
                        let e = ec(J.pathname, n.basepath),
                            t = ec(Y.pathname, n.basepath);
                        if (!(e.startsWith(t) && (e.length === t.length || "/" === e[t.length]))) return !1
                    }
                    return (!(l ? .includeSearch ? ? !0) || !!U(J.search, Y.search, {
                        partial: !l ? .exact,
                        ignoreUndefined: !l ? .explicitUndefined
                    })) && (!l ? .includeHash || W && J.hash === Y.hash)
                }, [l ? .exact, l ? .explicitUndefined, l ? .includeHash, l ? .includeSearch, J, Z, W, Y.hash, Y.pathname, Y.search, n.basepath]),
                et = ee ? k(a, {}) ? ? tk : tL,
                er = ee ? tL : k(s, {}) ? ? tL,
                en = [_, et.className, er.className].filter(Boolean).join(" "),
                eo = (S || et.style || er.style) && { ...S,
                    ...et.style,
                    ...er.style
                },
                [ea, ei] = i.useState(!1),
                es = i.useRef(!1),
                el = !e.reloadDocument && !Z && (c ? ? n.options.defaultPreload),
                eu = d ? ? n.options.defaultPreloadDelay ? ? 0,
                ed = i.useCallback(() => {
                    n.preloadRoute({ ...K,
                        _builtLocation: Y
                    }).catch(e => {
                        console.warn(e), console.warn("Error preloading route! \u261D\uFE0F")
                    })
                }, [n, K, Y]);
            if (! function(e, t, r = {}, n = {}) {
                    i.useEffect(() => {
                        if (!e.current || n.disabled || "function" != typeof IntersectionObserver) return;
                        let o = new IntersectionObserver(([e]) => {
                            t(e)
                        }, r);
                        return o.observe(e.current), () => {
                            o.disconnect()
                        }
                    }, [t, r, n.disabled, e])
                }(o, i.useCallback(e => {
                    e ? .isIntersecting && ed()
                }, [ed]), tD, {
                    disabled: !!x || "viewport" !== el
                }), i.useEffect(() => {
                    !es.current && (x || "render" !== el || (ed(), es.current = !0))
                }, [x, ed, el]), Z) return { ...q,
                ref: o,
                href: Z,
                ...b && {
                    children: b
                },
                ...E && {
                    target: E
                },
                ...x && {
                    disabled: x
                },
                ...S && {
                    style: S
                },
                ..._ && {
                    className: _
                },
                ...P && {
                    onClick: P
                },
                ...C && {
                    onBlur: C
                },
                ...L && {
                    onFocus: L
                },
                ...N && {
                    onMouseEnter: N
                },
                ...T && {
                    onMouseLeave: T
                },
                ...j && {
                    onTouchStart: j
                }
            };
            let eh = e => {
                    if (x || "intent" !== el) return;
                    if (!eu) return void ed();
                    let t = e.currentTarget;
                    if (tA.has(t)) return;
                    let r = setTimeout(() => {
                        tA.delete(t), ed()
                    }, eu);
                    tA.set(t, r)
                },
                ef = e => {
                    if (x || !el || !eu) return;
                    let t = e.currentTarget,
                        r = tA.get(t);
                    r && (clearTimeout(r), tA.delete(t))
                };
            return { ...q,
                ...et,
                ...er,
                href: X ? .href,
                ref: o,
                onClick: tI([P, e => {
                    var t;
                    let r = e.currentTarget.getAttribute("target"),
                        o = void 0 !== E ? E : r;
                    if (!x && !((t = e).metaKey || t.altKey || t.ctrlKey || t.shiftKey) && !e.defaultPrevented && (!o || "_self" === o) && 0 === e.button) {
                        e.preventDefault(), (0, tP.flushSync)(() => {
                            ei(!0)
                        });
                        let t = n.subscribe("onResolved", () => {
                            t(), ei(!1)
                        });
                        n.navigate({ ...K,
                            replace: m,
                            resetScroll: g,
                            hashScrollIntoView: f,
                            startTransition: y,
                            viewTransition: v,
                            ignoreBlocker: A
                        })
                    }
                }]),
                onBlur: tI([C, ef]),
                onFocus: tI([L, eh]),
                onMouseEnter: tI([N, eh]),
                onMouseLeave: tI([T, ef]),
                onTouchStart: tI([j, e => {
                    x || "intent" !== el || ed()
                }]),
                disabled: !!x,
                target: E,
                ...eo && {
                    style: eo
                },
                ...en && {
                    className: en
                },
                ...x && tN,
                ...ee && tT,
                ...W && ea && tj
            }
        }
        var tL = {},
            tk = {
                className: "active"
            },
            tN = {
                role: "link",
                "aria-disabled": !0
            },
            tT = {
                "data-status": "active",
                "aria-current": "page"
            },
            tj = {
                "data-transitioning": "transitioning"
            },
            tA = new WeakMap,
            tD = {
                rootMargin: "100px"
            },
            tI = e => t => {
                for (let r of e)
                    if (r) {
                        if (t.defaultPrevented) return;
                        r(t)
                    }
            },
            tM = i.forwardRef((e, t) => {
                let {
                    _asChild: r,
                    ...n
                } = e, {
                    type: o,
                    ...a
                } = tC(n, t), s = "function" == typeof n.children ? n.children({
                    isActive: "active" === a["data-status"]
                }) : n.children;
                if (!r) {
                    let {
                        disabled: e,
                        ...t
                    } = a;
                    return i.createElement("a", t, s)
                }
                return i.createElement(r, a, s)
            });

        function tO(e) {
            let t, r, n, o, a, i, s, l, c, d, h = (0, e7.c)(28);
            if (h[0] !== e) {
                let {
                    ref: s,
                    to: l,
                    href: u,
                    reloadDocument: c,
                    preventAutofocus: d,
                    children: f,
                    ...p
                } = e;
                o = s, i = l, a = c, r = d, t = f, n = p, h[0] = e, h[1] = t, h[2] = r, h[3] = n, h[4] = o, h[5] = a, h[6] = i
            } else t = h[1], r = h[2], n = h[3], o = h[4], a = h[5], i = h[6];
            let f = w();
            h[7] !== a || h[8] !== f || h[9] !== i ? (s = tF(i, f.state.location.pathname), l = !!a || !!i && tt(f, s), h[7] = a, h[8] = f, h[9] = i, h[10] = s, h[11] = l) : (s = h[10], l = h[11]);
            let p = l;
            h[12] !== r || h[13] !== n.state ? (c = r ? {
                [te]: !0,
                ...n.state
            } : n.state, h[12] = r, h[13] = n.state, h[14] = c) : c = h[14];
            let m = c;
            if (p) {
                let e, r;
                if (h[15] !== n) {
                    let {
                        state: t,
                        replace: r,
                        preload: o,
                        preloadDelay: a,
                        ...i
                    } = n;
                    e = i, h[15] = n, h[16] = e
                } else e = h[16];
                return h[17] !== e || h[18] !== t || h[19] !== o || h[20] !== s ? (r = (0, u.jsx)("a", { ...e,
                    href: s,
                    ref: o,
                    children: t
                }), h[17] = e, h[18] = t, h[19] = o, h[20] = s, h[21] = r) : r = h[21], r
            }
            return h[22] !== t || h[23] !== n || h[24] !== o || h[25] !== m || h[26] !== s ? (d = (0, u.jsx)(tM, {
                to: s,
                ref: o,
                ...n,
                state: m,
                children: t
            }), h[22] = t, h[23] = n, h[24] = o, h[25] = m, h[26] = s, h[27] = d) : d = h[27], d
        }

        function t$(e) {
            let t, r, n, o, a, i, s, l, c, d, h, f, p, m, y, g, v, b, R, E, x, S = (0, e7.c)(46);
            if (S[0] !== e) {
                let {
                    ref: u,
                    to: d,
                    end: h,
                    href: f,
                    className: p,
                    style: m,
                    children: y,
                    reloadDocument: g,
                    preventAutofocus: v,
                    ...w
                } = e;
                i = u, c = d, n = h, r = p, l = m, t = y, s = g, o = v, a = w, S[0] = e, S[1] = t, S[2] = r, S[3] = n, S[4] = o, S[5] = a, S[6] = i, S[7] = s, S[8] = l, S[9] = c
            } else t = S[1], r = S[2], n = S[3], o = S[4], a = S[5], i = S[6], s = S[7], l = S[8], c = S[9];
            let _ = w();
            S[10] !== _ || S[11] !== c ? (d = tF(c, _.state.location.pathname), h = !!c && tt(_, d), S[10] = _, S[11] = c, S[12] = d, S[13] = h) : (d = S[12], h = S[13]);
            let P = h,
                C = !!s || P;
            S[14] !== o || S[15] !== a.state ? (f = o ? {
                [te]: !0,
                ...a.state
            } : a.state, S[14] = o, S[15] = a.state, S[16] = f) : f = S[16];
            let L = f;
            S[17] !== n ? (p = {
                exact: n
            }, S[17] = n, S[18] = p) : p = S[18], S[19] !== a || S[20] !== L || S[21] !== d || S[22] !== p ? (m = { ...a,
                state: L,
                to: d,
                activeOptions: p
            }, S[19] = a, S[20] = L, S[21] = d, S[22] = p, S[23] = m) : m = S[23];
            let k = tC(m),
                N = "active" === ("data-status" in k ? k["data-status"] : void 0) && !P;
            if (S[24] !== t || S[25] !== r || S[26] !== N || S[27] !== l) {
                let e = {
                    isActive: N,
                    isPending: !1,
                    isTransitioning: !1
                };
                y = "function" == typeof r ? r(e) : r, g = "function" == typeof l ? l(e) : l, v = "function" == typeof t ? t(e) : t, S[24] = t, S[25] = r, S[26] = N, S[27] = l, S[28] = y, S[29] = g, S[30] = v
            } else y = S[28], g = S[29], v = S[30];
            let T = v;
            if (S[31] !== a) {
                let {
                    state: e,
                    replace: t,
                    preload: r,
                    preloadDelay: n,
                    ...o
                } = a;
                b = o, S[31] = a, S[32] = b
            } else b = S[32];
            S[33] !== k || S[34] !== d || S[35] !== C ? (R = C ? {
                href: d
            } : k, S[33] = k, S[34] = d, S[35] = C, S[36] = R) : R = S[36], S[37] !== b || S[38] !== i || S[39] !== y || S[40] !== g || S[41] !== R ? (E = { ...b,
                ...R,
                className: y,
                style: g,
                ref: i
            }, S[37] = b, S[38] = i, S[39] = y, S[40] = g, S[41] = R, S[42] = E) : E = S[42];
            let j = E;
            return S[43] !== T || S[44] !== j ? (x = (0, u.jsx)("a", { ...j,
                children: T
            }), S[43] = T, S[44] = j, S[45] = x) : x = S[45], x
        }

        function tF(e, t) {
            if ("string" == typeof e) return e;
            let {
                pathname: r = t,
                search: n = "",
                hash: o = ""
            } = e, a = n ? n.startsWith("?") ? n : `?${n}` : "", i = o ? o.startsWith("#") ? o : `#${o}` : "";
            return `${r}${a}${i}`
        }

        function tU() {
            let e, t = (0, e7.c)(1);
            return t[0] === Symbol.for("react.memo_cache_sentinel") ? (e = {
                warn: !1
            }, t[0] = e) : e = t[0], !!w(e)
        }
        tO.displayName = "Link", t$.displayName = "NavLink";
        let tB = /^(?:[a-z][a-z0-9+.-]*:|[\\/]{2})/i,
            tH = /^[\\/]{2}/;

        function tz(e, t) {
            return t + e.replace(/\\/g, "/")
        }
        let tq = ((a = {}).Pop = "POP", a.Push = "PUSH", a.Replace = "REPLACE", a),
            tW = "popstate";

        function tV(e) {
            return "object" == typeof e && null != e && "pathname" in e && "search" in e && "hash" in e && "state" in e && "key" in e
        }

        function tK(e = {}) {
            return function(e, t, r = {}) {
                let {
                    window: n = document.defaultView,
                    v5Compat: o = !1
                } = r, a = n.history, i = "POP", s = null, l = u();

                function u() {
                    return (a.state || {
                        idx: null
                    }).idx
                }

                function c() {
                    i = "POP";
                    let e = u(),
                        t = null == e ? null : e - l;
                    l = e, s && s({
                        action: i,
                        location: h.location,
                        delta: t
                    })
                }

                function d(e) {
                    return t0(n, e)
                }
                null == l && (l = 0, a.replaceState({ ...a.state,
                    idx: l
                }, ""));
                let h = {
                    get action() {
                        return i
                    },
                    get location() {
                        return e(n, a)
                    },
                    listen(e) {
                        if (s) throw Error("A history only accepts one active listener");
                        return n.addEventListener(tW, c), s = e, () => {
                            n.removeEventListener(tW, c), s = null
                        }
                    },
                    createHref: e => t(n, e),
                    createURL: d,
                    encodeLocation(e) {
                        let t = d(e);
                        return {
                            pathname: t.pathname,
                            search: t.search,
                            hash: t.hash
                        }
                    },
                    push: function(e, t) {
                        i = "PUSH";
                        let r = tV(e) ? e : tG(h.location, e, t);
                        let c = tQ(r, l = u() + 1),
                            d = h.createHref(r.mask || r);
                        try {
                            a.pushState(c, "", d)
                        } catch (e) {
                            if (e instanceof DOMException && "DataCloneError" === e.name) throw e;
                            n.location.assign(d)
                        }
                        o && s && s({
                            action: i,
                            location: h.location,
                            delta: 1
                        })
                    },
                    replace: function(e, t) {
                        i = "REPLACE";
                        let r = tV(e) ? e : tG(h.location, e, t);
                        let n = tQ(r, l = u()),
                            c = h.createHref(r.mask || r);
                        a.replaceState(n, "", c), o && s && s({
                            action: i,
                            location: h.location,
                            delta: 0
                        })
                    },
                    go: e => a.go(e)
                };
                return h
            }(function(e, t) {
                let r = t.state ? .masked,
                    {
                        pathname: n,
                        search: o,
                        hash: a
                    } = r || e.location;
                return tG("", {
                    pathname: n,
                    search: o,
                    hash: a
                }, t.state && t.state.usr || null, t.state && t.state.key || "default", r ? {
                    pathname: e.location.pathname,
                    search: e.location.search,
                    hash: e.location.hash
                } : void 0)
            }, function(e, t) {
                return "string" == typeof t ? t : tX(t)
            }, e)
        }

        function tJ(e, t) {
            if (!1 === e || null == e) throw Error(t)
        }

        function tY(e, t) {
            if (!e) {
                "u" > typeof console && console.warn(t);
                try {
                    throw Error(t)
                } catch (e) {}
            }
        }

        function tQ(e, t) {
            return {
                usr: e.state,
                key: e.key,
                idx: t,
                masked: e.mask ? {
                    pathname: e.pathname,
                    search: e.search,
                    hash: e.hash
                } : void 0
            }
        }

        function tG(e, t, r = null, n, o) {
            return {
                pathname: "string" == typeof e ? e : e.pathname,
                search: "",
                hash: "",
                ..."string" == typeof t ? tZ(t) : t,
                state: r,
                key: t && t.key || n || Math.random().toString(36).substring(2, 10),
                mask: o
            }
        }

        function tX({
            pathname: e = "/",
            search: t = "",
            hash: r = ""
        }) {
            return t && "?" !== t && (e += "?" === t.charAt(0) ? t : "?" + t), r && "#" !== r && (e += "#" === r.charAt(0) ? r : "#" + r), e
        }

        function tZ(e) {
            let t = {};
            if (e) {
                let r = e.indexOf("#");
                r >= 0 && (t.hash = e.substring(r), e = e.substring(0, r));
                let n = e.indexOf("?");
                n >= 0 && (t.search = e.substring(n), e = e.substring(0, n)), e && (t.pathname = e)
            }
            return t
        }

        function t0(e, t, r = !1) {
            let n = "http://localhost";
            e && (n = "null" !== e.location.origin ? e.location.origin : e.location.href), tJ(n, "No window.location.(origin|href) available to create URL");
            let o = "string" == typeof t ? t : tX(t);
            return o = o.replace(/ $/, "%20"), !r && tH.test(o) && (o = n + o), new URL(o, n)
        }
        var t1 = class {#
            M = new Map;
            constructor(e) {
                if (e)
                    for (let [t, r] of e) this.set(t, r)
            }
            get(e) {
                if (this.#M.has(e)) return this.#M.get(e);
                if (void 0 !== e.defaultValue) return e.defaultValue;
                throw Error("No value found for context")
            }
            set(e, t) {
                this.#M.set(e, t)
            }
        };
        let t2 = new Set(["lazy", "caseSensitive", "path", "id", "index", "children"]),
            t4 = new Set(["lazy", "caseSensitive", "path", "id", "index", "middleware", "children"]);

        function t3(e) {
            let t = {};
            return e.Component && Object.assign(t, {
                element: i.createElement(e.Component),
                Component: void 0
            }), e.HydrateFallback && Object.assign(t, {
                hydrateFallbackElement: i.createElement(e.HydrateFallback),
                HydrateFallback: void 0
            }), e.ErrorBoundary && Object.assign(t, {
                errorElement: i.createElement(e.ErrorBoundary),
                ErrorBoundary: void 0
            }), t
        }

        function t5(e, t = t3, r = [], n = {}, o = !1) {
            return e.map((e, a) => {
                let i = [...r, String(a)],
                    s = "string" == typeof e.id ? e.id : i.join("-");
                if (tJ(!0 !== e.index || !e.children, "Cannot specify children on an index route"), tJ(o || !n[s], `Found a route id collision on id "${s}".  Route id's must be globally unique within Data Router usages`), !0 === e.index) {
                    let r = { ...e,
                        id: s
                    };
                    return n[s] = t6(r, t(r)), r
                } {
                    let r = { ...e,
                        id: s,
                        children: void 0
                    };
                    return n[s] = t6(r, t(r)), e.children && (r.children = t5(e.children, t, i, n, o)), r
                }
            })
        }

        function t6(e, t) {
            return Object.assign(e, { ...t,
                ..."object" == typeof t.lazy && null != t.lazy ? {
                    lazy: { ...e.lazy,
                        ...t.lazy
                    }
                } : {}
            })
        }

        function t9(e, t, r = "/") {
            return t7(e, t, r, !1)
        }

        function t7(e, t, r, n, o) {
            let a = rc(("string" == typeof t ? tZ(t) : t).pathname || "/", r);
            if (null == a) return null;
            let i = o ? ? re(e),
                s = null,
                l = ru(a);
            for (let e = 0; null == s && e < i.length; ++e) s = function(e, t, r = !1) {
                let {
                    routesMeta: n
                } = e, o = {}, a = "/", i = [];
                for (let e = 0; e < n.length; ++e) {
                    let s = n[e],
                        l = e === n.length - 1,
                        u = "/" === a ? t : t.slice(a.length) || "/",
                        c = {
                            path: s.relativePath,
                            caseSensitive: s.caseSensitive,
                            end: l
                        },
                        d = s.matcher && s.compiledParams ? rs(c, u, s.matcher, s.compiledParams) : ri(c, u),
                        h = s.route;
                    if (!d && l && r && !n[n.length - 1].route.index && (d = ri({
                            path: s.relativePath,
                            caseSensitive: s.caseSensitive,
                            end: !1
                        }, u)), !d) return null;
                    Object.assign(o, d.params), i.push({
                        params: o,
                        pathname: rv([a, d.pathname]),
                        pathnameBase: rb(rv([a, d.pathnameBase])),
                        route: h
                    }), "/" !== d.pathnameBase && (a = rv([a, d.pathnameBase]))
                }
                return i
            }(i[e], l, n);
            return s
        }

        function t8(e, t) {
            let {
                route: r,
                pathname: n,
                params: o
            } = e;
            return {
                id: r.id,
                pathname: n,
                params: o,
                loaderData: t[r.id],
                handle: r.handle
            }
        }

        function re(e) {
            let t = function e(t, r = [], n = [], o = "", a = !1) {
                let i = (t, i, s = a, l) => {
                    var u, c;
                    let d, h, f = {
                        relativePath: void 0 === l ? t.path || "" : l,
                        caseSensitive: !0 === t.caseSensitive,
                        childrenIndex: i,
                        route: t
                    };
                    if (f.relativePath.startsWith("/")) {
                        if (!f.relativePath.startsWith(o) && s) return;
                        tJ(f.relativePath.startsWith(o), `Absolute route path "${f.relativePath}" nested under path "${o}" is not valid. An absolute child route path must start with the combined path of all its parent routes.`), f.relativePath = f.relativePath.slice(o.length)
                    }
                    let p = rv([o, f.relativePath]),
                        m = n.concat(f);
                    t.children && t.children.length > 0 && (tJ(!0 !== t.index, `Index routes must not have child routes. Please remove all child routes from route path "${p}".`), e(t.children, r, m, p, s)), (null != t.path || t.index) && r.push({
                        path: p,
                        score: (u = p, c = t.index, h = (d = u.split("/")).length, d.some(rn) && (h += -2), c && (h += 2), d.filter(e => !rn(e)).reduce((e, t) => e + (rt.test(t) ? 3 : rr.test(t) ? 3.5 : "" === t ? 1 : 10), h)),
                        routesMeta: m.map((e, t) => {
                            let [r, n] = rl(e.relativePath, e.caseSensitive, t === m.length - 1);
                            return { ...e,
                                matcher: r,
                                compiledParams: n
                            }
                        })
                    })
                };
                return t.forEach((e, t) => {
                    if ("" !== e.path && e.path ? .includes("?"))
                        for (let r of function e(t) {
                                let r = t.split("/");
                                if (0 === r.length) return [];
                                let [n, ...o] = r, a = n.endsWith("?"), i = n.replace(/\?$/, "");
                                if (0 === o.length) return a ? [i, ""] : [i];
                                let s = e(o.join("/")),
                                    l = [];
                                return l.push(...s.map(e => "" === e ? i : [i, e].join("/"))), a && l.push(...s), l.map(e => t.startsWith("/") && "" === e ? "/" : e)
                            }(e.path)) i(e, t, !0, r);
                    else i(e, t)
                }), r
            }(e);
            return t.sort((e, t) => {
                var r, n;
                return e.score !== t.score ? t.score - e.score : (r = e.routesMeta.map(e => e.childrenIndex), n = t.routesMeta.map(e => e.childrenIndex), r.length === n.length && r.slice(0, -1).every((e, t) => e === n[t]) ? r[r.length - 1] - n[n.length - 1] : 0)
            }), t
        }
        let rt = /^:[\w-]+$/,
            rr = /^:[\w-]+/,
            rn = e => "*" === e,
            ro = {
                "%24": "$",
                "%26": "&",
                "%2B": "+",
                "%2C": ",",
                "%3A": ":",
                "%3B": ";",
                "%3D": "=",
                "%40": "@"
            };

        function ra(e, t = {}) {
            let r = e;
            r.endsWith("*") && "*" !== r && !r.endsWith("/*") && (tY(!1, `Route path "${r}" will be treated as if it were "${r.replace(/\*$/,"/*")}" because the \`*\` character must always follow a \`/\` in the pattern. To get rid of this warning, please change the route path to "${r.replace(/\*$/,"/*")}".`), r = r.replace(/\*$/, "/*"));
            let n = r.startsWith("/") ? "/" : "",
                o = e => null == e ? "" : "string" == typeof e ? e : String(e);
            return n + r.split(/\/+/).map((e, r, n) => {
                if (r === n.length - 1 && "*" === e) return o(t["*"]);
                let a = e.match(/^:([\w-]+)(\??)(.*)/);
                if (a) {
                    let [, e, r, n] = a, i = t[e];
                    return tJ("?" === r || null != i, `Missing ":${e}" param`), encodeURIComponent(o(i)).replace(/%(?:24|26|2B|2C|3A|3B|3D|40)/g, e => ro[e]) + n
                }
                return e.replace(/\?$/g, "")
            }).filter(e => !!e).join("/")
        }

        function ri(e, t) {
            "string" == typeof e && (e = {
                path: e,
                caseSensitive: !1,
                end: !0
            });
            let [r, n] = rl(e.path, e.caseSensitive, e.end);
            return rs(e, t, r, n)
        }

        function rs(e, t, r, n) {
            let o = t.match(r);
            if (!o) return null;
            let a = o[0],
                i = a.replace(/(.)\/+$/, "$1"),
                s = o.slice(1);
            return {
                params: n.reduce((e, {
                    paramName: t,
                    isOptional: r
                }, n) => {
                    if ("*" === t) {
                        let e = s[n] || "";
                        i = a.slice(0, a.length - e.length).replace(/(.)\/+$/, "$1")
                    }
                    let o = s[n];
                    return r && !o ? e[t] = void 0 : e[t] = (o || "").replace(/%2F/g, "/"), e
                }, {}),
                pathname: a,
                pathnameBase: i,
                pattern: e
            }
        }

        function rl(e, t = !1, r = !0) {
            tY("*" === e || !e.endsWith("*") || e.endsWith("/*"), `Route path "${e}" will be treated as if it were "${e.replace(/\*$/,"/*")}" because the \`*\` character must always follow a \`/\` in the pattern. To get rid of this warning, please change the route path to "${e.replace(/\*$/,"/*")}".`);
            let n = [],
                o = "^" + e.replace(/\/*\*?$/, "").replace(/^\/*/, "/").replace(/[\\.*+^${}|()[\]]/g, "\\$&").replace(/\/:([\w-]+)(\?)?/g, (e, t, r, o, a) => {
                    if (n.push({
                            paramName: t,
                            isOptional: null != r
                        }), r) {
                        let t = a.charAt(o + e.length);
                        return t && "/" !== t ? "/([^\\/]*)" : "(?:/([^\\/]*))?"
                    }
                    return "/([^\\/]+)"
                }).replace(/\/([\w-]+)\?(?=\/|$|\()/g, "(?:/$1)?");
            return e.endsWith("*") ? (n.push({
                paramName: "*"
            }), o += "*" === e || "/*" === e ? "(.*)$" : "(?:\\/(.+)|\\/*)$") : r ? o += "\\/*$" : "" !== e && "/" !== e && (o += "(?:(?=\\/|$))"), [new RegExp(o, t ? void 0 : "i"), n]
        }

        function ru(e) {
            try {
                return e.split("/").map(e => decodeURIComponent(e).replace(/\//g, "%2F")).join("/")
            } catch (t) {
                return tY(!1, `The URL path "${e}" could not be decoded because it is a malformed URL segment. This is probably due to a bad percent encoding (${t}).`), e
            }
        }

        function rc(e, t) {
            if ("/" === t) return e;
            if (!e.toLowerCase().startsWith(t.toLowerCase())) return null;
            let r = t.endsWith("/") ? t.length - 1 : t.length,
                n = e.charAt(r);
            return n && "/" !== n ? null : e.slice(r) || "/"
        }

        function rd(e, t = "/") {
            let {
                pathname: r,
                search: n = "",
                hash: o = ""
            } = "string" == typeof e ? tZ(e) : e;
            return {
                pathname: r ? (r = rg(r)).startsWith("/") ? rh(r.substring(1), "/") : rh(r, t) : t,
                search: rR(n),
                hash: rE(o)
            }
        }

        function rh(e, t) {
            let r = rw(t).split("/");
            return e.split("/").forEach(e => {
                ".." === e ? r.length > 1 && r.pop() : "." !== e && r.push(e)
            }), r.length > 1 ? r.join("/") : "/"
        }

        function rf(e, t, r, n) {
            return `Cannot include a '${e}' character in a manually specified \`to.${t}\` field [${JSON.stringify(n)}].  Please separate it out to the \`to.${r}\` field. Alternatively you may provide the full path as a string in <Link to="..."> and the router will parse it for you.`
        }

        function rp(e) {
            return e.filter((e, t) => 0 === t || e.route.path && e.route.path.length > 0)
        }

        function rm(e) {
            let t = rp(e);
            return t.map((e, r) => r === t.length - 1 ? e.pathname : e.pathnameBase)
        }

        function ry(e, t, r, n = !1) {
            let o, a;
            "string" == typeof e ? o = tZ(e) : (tJ(!(o = { ...e
            }).pathname || !o.pathname.includes("?"), rf("?", "pathname", "search", o)), tJ(!o.pathname || !o.pathname.includes("#"), rf("#", "pathname", "hash", o)), tJ(!o.search || !o.search.includes("#"), rf("#", "search", "hash", o)));
            let i = "" === e || "" === o.pathname,
                s = i ? "/" : o.pathname;
            if (null == s) a = r;
            else {
                let e = t.length - 1;
                if (!n && s.startsWith("..")) {
                    let t = s.split("/");
                    for (;
                        ".." === t[0];) t.shift(), e -= 1;
                    o.pathname = t.join("/")
                }
                a = e >= 0 ? t[e] : "/"
            }
            let l = rd(o, a),
                u = s && "/" !== s && s.endsWith("/"),
                c = (i || "." === s) && r.endsWith("/");
            return !l.pathname.endsWith("/") && (u || c) && (l.pathname += "/"), l
        }
        let rg = e => e.replace(/[\\/]{2,}/g, "/"),
            rv = e => rg(e.join("/")),
            rw = e => e.replace(/\/+$/, ""),
            rb = e => rw(e).replace(/^\/*/, "/"),
            rR = e => e && "?" !== e ? e.startsWith("?") ? e : "?" + e : "",
            rE = e => e && "#" !== e ? e.startsWith("#") ? e : "#" + e : "",
            rx = (e, t = 302) => {
                let r = t;
                "number" == typeof r ? r = {
                    status: r
                } : void 0 === r.status && (r.status = 302);
                let n = new Headers(r.headers);
                return n.set("Location", e), new Response(null, { ...r,
                    headers: n
                })
            },
            rS = ["EvalError", "RangeError", "ReferenceError", "SyntaxError", "TypeError", "URIError"];
        var r_ = class {
            status;
            statusText;
            data;
            error;
            internal;
            constructor(e, t, r, n = !1) {
                this.status = e, this.statusText = t || "", this.internal = n, r instanceof Error ? (this.data = r.toString(), this.error = r) : this.data = r
            }
        };

        function rP(e) {
            return null != e && "number" == typeof e.status && "string" == typeof e.statusText && "boolean" == typeof e.internal && "data" in e
        }

        function rC(e) {
            return rv(e.map(e => e.route.path).filter(Boolean)) || "/"
        }

        function rL(e, t) {
            let r = new URL("string" == typeof e || e instanceof URL ? e : e.url),
                n = "string" == typeof t ? tZ(t) : t;
            if (r.pathname = n.pathname || "/", n.search) {
                let e = new URLSearchParams(n.search),
                    t = e.getAll("index");
                for (let r of (e.delete("index"), t.filter(Boolean))) e.append("index", r);
                let o = e.toString();
                r.search = o ? `?${o}` : ""
            } else r.search = "";
            return r.hash = n.hash || "", r
        }
        let rk = "u" > typeof window && void 0 !== window.document && void 0 !== window.document.createElement;

        function rN(e, t) {
            let r = e;
            if ("string" != typeof r || !tB.test(r)) return {
                absoluteURL: void 0,
                isExternal: !1,
                to: r
            };
            let n = r,
                o = !1;
            if (rk) try {
                let e = new URL(window.location.href),
                    n = new URL(tH.test(r) ? tz(r, e.protocol) : r),
                    a = rc(n.pathname, t);
                n.origin === e.origin && null != a ? r = a + n.search + n.hash : o = !0
            } catch (e) {
                tY(!1, `<Link to="${r}"> contains an invalid URL which will probably break when clicked - please update to a valid URL path.`)
            }
            return {
                absoluteURL: n,
                isExternal: o,
                to: r
            }
        }
        let rT = Symbol("Uninstrumented"),
            rj = new WeakMap;

        function rA(e) {
            return e[rT] ? ? e
        }

        function rD(e, t) {
            return rj.set(e, t), () => {
                rj.get(e) === t && rj.delete(e)
            }
        }

        function rI(e) {
            let t = rj.get(e);
            return rj.delete(e), t
        }

        function rM(e) {
            if ("error" === e.type) throw e.value;
            return e.value
        }
        async function rO(e, t, r, n, o = {
            result: null,
            innerResult: null
        }, a = e.length - 1) {
            let i = e[a];
            if (i) {
                let s, l = async () => (s ? console.error("You cannot call instrumented handlers more than once") : s = rO(e, t, r, n, o, a - 1), await s, tJ(o.innerResult, "Expected an inner result"), o.innerResult);
                try {
                    await i(l, t)
                } catch (e) {
                    console.error("An instrumentation function threw an error:", e)
                }
                s || await l(), await s
            } else {
                try {
                    o.result = {
                        type: "success",
                        value: await r()
                    }
                } catch (e) {
                    o.result = {
                        type: "error",
                        value: e
                    }
                }
                o.innerResult = n(o.result, t)
            }
            return o.result || (o.result = {
                type: "error",
                value: Error("No result assigned in instrumentation chain.")
            }, o.innerResult = n(o.result, t)), o.result
        }

        function r$(e) {
            return "error" === e.type && e.value instanceof Error ? {
                status: "error",
                error: e.value
            } : {
                status: "success",
                error: void 0
            }
        }

        function rF(e) {
            var t, r;
            let {
                request: n,
                context: o,
                params: a
            } = e;
            return { ...e,
                request: {
                    method: (t = n).method,
                    url: t.url,
                    headers: {
                        get: (...e) => t.headers.get(...e)
                    }
                },
                params: { ...a
                },
                context: (r = o, {
                    get: e => r.get(e)
                })
            }
        }

        function rU(e, t) {
            return {
                currentUrl: tX(e.state.location),
                ..."formMethod" in t ? {
                    formMethod: t.formMethod
                } : {},
                ..."formEncType" in t ? {
                    formEncType: t.formEncType
                } : {},
                ..."formData" in t ? {
                    formData: t.formData
                } : {},
                ..."body" in t ? {
                    body: t.body
                } : {}
            }
        }
        let rB = ["POST", "PUT", "PATCH", "DELETE"],
            rH = new Set(rB),
            rz = new Set(["GET", ...rB]),
            rq = new Set([301, 302, 303, 307, 308]),
            rW = new Set([307, 308]),
            rV = {
                state: "idle",
                location: void 0,
                matches: void 0,
                historyAction: void 0,
                formMethod: void 0,
                formAction: void 0,
                formEncType: void 0,
                formData: void 0,
                json: void 0,
                text: void 0
            },
            rK = {
                state: "idle",
                data: void 0,
                formMethod: void 0,
                formAction: void 0,
                formEncType: void 0,
                formData: void 0,
                json: void 0,
                text: void 0
            },
            rJ = {
                state: "unblocked",
                proceed: void 0,
                reset: void 0,
                location: void 0
            },
            rY = "remix-router-transitions",
            rQ = Symbol("ResetLoaderData");
        var rG = class {#
            E;#
            O;#
            $;#
            F;
            constructor(e) {
                this.#E = e, this.#O = re(e)
            }
            get stableRoutes() {
                return this.#E
            }
            get activeRoutes() {
                return this.#$ ? ? this.#E
            }
            get branches() {
                return this.#F ? ? this.#O
            }
            get hasHMRRoutes() {
                return null != this.#$
            }
            setRoutes(e) {
                this.#E = e, this.#O = re(e)
            }
            setHmrRoutes(e) {
                this.#$ = e, this.#F = re(e)
            }
            commitHmrRoutes() {
                this.#$ && (this.#E = this.#$, this.#O = this.#F, this.#$ = void 0, this.#F = void 0)
            }
        };

        function rX(e, t, r, n, o, a) {
            let i, s;
            if (o) {
                for (let e of (i = [], t))
                    if (i.push(e), e.route.id === o) {
                        s = e;
                        break
                    }
            } else i = t, s = t[t.length - 1];
            let l = ry(n || ".", rm(i), rc(e.pathname, r) || e.pathname, "path" === a);
            if (null == n && (l.search = e.search, l.hash = e.hash), (null == n || "" === n || "." === n) && s) {
                let e = nN(l.search);
                if (s.route.index && !e) l.search = l.search ? l.search.replace(/^\?/, "?index&") : "?index";
                else if (!s.route.index && e) {
                    let e = new URLSearchParams(l.search),
                        t = e.getAll("index");
                    e.delete("index"), t.filter(e => e).forEach(t => e.append("index", t));
                    let r = e.toString();
                    l.search = r ? `?${r}` : ""
                }
            }
            return "/" !== r && (l.pathname = function({
                basename: e,
                pathname: t
            }) {
                return "/" === t ? e : rv([e, t])
            }({
                basename: r,
                pathname: l.pathname
            })), tX(l)
        }

        function rZ(e, t, r) {
            var n;
            let o, a;
            if (!r || !(null != r && ("formData" in r && null != r.formData || "body" in r && void 0 !== r.body))) return {
                path: t
            };
            if (r.formMethod && (n = r.formMethod, !rz.has(n.toUpperCase()))) return {
                path: t,
                error: nR(405, {
                    method: r.formMethod
                })
            };
            let i = () => ({
                    path: t,
                    error: nR(400, {
                        type: "invalid-body"
                    })
                }),
                s = (r.formMethod || "get").toUpperCase(),
                l = nx(t);
            if (void 0 !== r.body) {
                if ("text/plain" === r.formEncType) {
                    if (!nk(s)) return i();
                    let e = "string" == typeof r.body ? r.body : r.body instanceof FormData || r.body instanceof URLSearchParams ? Array.from(r.body.entries()).reduce((e, [t, r]) => `${e}${t}=${r}
`, "") : String(r.body);
                    return {
                        path: t,
                        submission: {
                            formMethod: s,
                            formAction: l,
                            formEncType: r.formEncType,
                            formData: void 0,
                            json: void 0,
                            text: e
                        }
                    }
                } else if ("application/json" === r.formEncType) {
                    if (!nk(s)) return i();
                    try {
                        let e = "string" == typeof r.body ? JSON.parse(r.body) : r.body;
                        return {
                            path: t,
                            submission: {
                                formMethod: s,
                                formAction: l,
                                formEncType: r.formEncType,
                                formData: void 0,
                                json: e,
                                text: void 0
                            }
                        }
                    } catch (e) {
                        return i()
                    }
                }
            }
            if (tJ("function" == typeof FormData, "FormData is not available in this environment"), r.formData) o = np(r.formData), a = r.formData;
            else if (r.body instanceof FormData) o = np(r.body), a = r.body;
            else if (r.body instanceof URLSearchParams) a = nm(o = r.body);
            else if (null == r.body) o = new URLSearchParams, a = new FormData;
            else try {
                o = new URLSearchParams(r.body), a = nm(o)
            } catch (e) {
                return i()
            }
            let u = {
                formMethod: s,
                formAction: l,
                formEncType: r && r.formEncType || "application/x-www-form-urlencoded",
                formData: a,
                json: void 0,
                text: void 0
            };
            if (nk(u.formMethod)) return {
                path: t,
                submission: u
            };
            let c = tZ(t);
            return e && c.search && nN(c.search) && o.append("index", ""), c.search = `?${o}`, {
                path: tX(c),
                submission: u
            }
        }

        function r0(e, t, r, n, o, a, i, s, l, u, c, d, h, f, p, m, y, g, v, w, b, R) {
            let E, x = b ? n_(b[1]) ? b[1].error : b[1].data : void 0,
                S = o.createURL(a.location),
                _ = o.createURL(l);
            if (c && a.errors) {
                let e = Object.keys(a.errors)[0];
                E = i.findIndex(t => t.route.id === e)
            } else if (b && n_(b[1])) {
                let e = b[0];
                E = i.findIndex(t => t.route.id === e) - 1
            }
            let P = b ? b[1].statusCode : void 0,
                C = P && P >= 400,
                L = {
                    currentUrl: S,
                    currentParams: a.matches[0] ? .params || {},
                    nextUrl: _,
                    nextParams: i[0].params,
                    ...s,
                    actionResult: x,
                    actionStatus: P
                },
                k = rC(i),
                N = i.map((o, i) => {
                    var s, h, f, p, m;
                    let y, {
                            route: g
                        } = o,
                        v = null;
                    if (null != E && i > E) v = !1;
                    else if (g.lazy) v = !0;
                    else if (r1(g))
                        if (c) {
                            let {
                                shouldLoad: e
                            } = r2(g, a.loaderData, a.errors);
                            v = e
                        } else {
                            let e, t;
                            s = a.loaderData, h = a.matches[i], f = o, e = !h || f.route.id !== h.route.id, t = !s.hasOwnProperty(f.route.id), (e || t) && (v = !0)
                        }
                    else v = !1;
                    if (null !== v) return no(r, n, e, l, k, o, u, t, v);
                    let w = !1;
                    "boolean" == typeof R ? w = R : C ? w = !1 : d || S.pathname + S.search === _.pathname + _.search || S.search !== _.search ? w = !0 : (p = a.matches[i], m = o, y = p.route.path, (p.pathname !== m.pathname || null != y && y.endsWith("*") && p.params["*"] !== m.params["*"]) && (w = !0));
                    let b = { ...L,
                        defaultShouldRevalidate: w
                    };
                    return no(r, n, e, l, k, o, u, t, r4(o, b), b, R)
                }),
                T = [];
            return p.forEach((e, s) => {
                if (c || !i.some(t => t.route.id === e.routeId) || f.has(s)) return;
                let l = a.fetchers.get(s),
                    p = l && "idle" !== l.state && void 0 === l.data,
                    b = t7(y, e.path, g ? ? "/", !1, w);
                if (!b) {
                    if (v && p) return;
                    T.push({
                        key: s,
                        routeId: e.routeId,
                        path: e.path,
                        matches: null,
                        match: null,
                        request: null,
                        controller: null
                    });
                    return
                }
                if (m.has(s)) return;
                let E = nT(b, e.path),
                    x = new AbortController,
                    S = nf(o, e.path, x.signal),
                    _ = null;
                if (h.has(s)) h.delete(s), _ = na(r, n, S, e.path, b, E, u, t);
                else if (p) d && (_ = na(r, n, S, e.path, b, E, u, t));
                else {
                    let o = { ...L,
                        defaultShouldRevalidate: "boolean" == typeof R ? R : !C && d
                    };
                    r4(E, o) && (_ = na(r, n, S, e.path, b, E, u, t, o))
                }
                _ && T.push({
                    key: s,
                    routeId: e.routeId,
                    path: e.path,
                    matches: _,
                    match: E,
                    request: S,
                    controller: x
                })
            }), {
                dsMatches: N,
                revalidatingFetchers: T
            }
        }

        function r1(e) {
            return null != e.loader || null != e.middleware && e.middleware.length > 0
        }

        function r2(e, t, r) {
            if (e.lazy) return {
                shouldLoad: !0,
                renderFallback: !0
            };
            if (!r1(e)) return {
                shouldLoad: !1,
                renderFallback: !1
            };
            let n = null != t && e.id in t,
                o = null != r && void 0 !== r[e.id];
            if (!n && o) return {
                shouldLoad: !1,
                renderFallback: !1
            };
            if ("function" == typeof e.loader && !0 === e.loader.hydrate) return {
                shouldLoad: !0,
                renderFallback: !n
            };
            let a = !n && !o;
            return {
                shouldLoad: a,
                renderFallback: a
            }
        }

        function r4(e, t) {
            if (e.route.shouldRevalidate) {
                let r = e.route.shouldRevalidate(t);
                if ("boolean" == typeof r) return r
            }
            return t.defaultShouldRevalidate
        }

        function r3(e, t, r, n, o, a) {
            let i;
            if (e) {
                let t = n[e];
                tJ(t, `No route found to patch children into: routeId = ${e}`), t.children || (t.children = []), i = t.children
            } else i = r.activeRoutes;
            let s = [],
                l = [];
            if (t.forEach(e => {
                    let t = i.find(t => (function e(t, r) {
                        return "id" in t && "id" in r && t.id === r.id || t.index === r.index && t.path === r.path && t.caseSensitive === r.caseSensitive && ((!t.children || 0 === t.children.length) && (!r.children || 0 === r.children.length) || (t.children ? .every((t, n) => r.children ? .some(r => e(t, r))) ? ? !1))
                    })(e, t));
                    t ? l.push({
                        existingRoute: t,
                        newRoute: e
                    }) : s.push(e)
                }), s.length > 0) {
                let t = t5(s, o, [e || "_", "patch", String(i ? .length || "0")], n);
                i.push(...t)
            }
            if (a && l.length > 0)
                for (let e = 0; e < l.length; e++) {
                    let {
                        existingRoute: t,
                        newRoute: r
                    } = l[e], [n] = t5([r], o, [], {}, !0);
                    Object.assign(t, {
                        element: n.element ? n.element : t.element,
                        errorElement: n.errorElement ? n.errorElement : t.errorElement,
                        hydrateFallbackElement: n.hydrateFallbackElement ? n.hydrateFallbackElement : t.hydrateFallbackElement
                    })
                }
            r.hasHMRRoutes || r.setRoutes([...r.activeRoutes])
        }
        let r5 = new WeakMap,
            r6 = ({
                key: e,
                route: t,
                manifest: r,
                mapRouteProperties: n
            }) => {
                let o = r[t.id];
                if (tJ(o, "No route found in manifest"), !o.lazy || "object" != typeof o.lazy) return;
                let a = o.lazy[e];
                if (!a) return;
                let i = r5.get(o);
                i || (i = {}, r5.set(o, i));
                let s = i[e];
                if (s) return s;
                let l = (async () => {
                    let t = t2.has(e),
                        r = void 0 !== o[e];
                    if (t) tY(!t, "Route property " + e + " is not a supported lazy route property. This property will be ignored."), i[e] = Promise.resolve();
                    else if (r) tY(!1, `Route "${o.id}" has a static property "${e}" defined. The lazy property will be ignored.`);
                    else {
                        let t = await a();
                        null != t && (Object.assign(o, {
                            [e]: t
                        }), Object.assign(o, n(o)))
                    }
                    "object" == typeof o.lazy && (o.lazy[e] = void 0, Object.values(o.lazy).every(e => void 0 === e) && (o.lazy = void 0))
                })();
                return i[e] = l, l
            },
            r9 = new WeakMap;
        async function r7(e) {
            let t = e.matches.filter(e => e.shouldLoad),
                r = {};
            return (await Promise.all(t.map(e => e.resolve()))).forEach((e, n) => {
                r[t[n].route.id] = e
            }), r
        }
        async function r8(e) {
            return e.matches.some(e => e.route.middleware) ? ne(e, () => r7(e)) : r7(e)
        }

        function ne(e, t) {
            return nt(e, t, e => {
                var t, r;
                if (nL(t = e) && (r = t.status, rq.has(r)) && t.headers.has("Location")) throw e;
                return e
            }, nS, r);
            async function r(t, r, n) {
                if (n) return Object.assign(n.value, {
                    [r]: {
                        type: "error",
                        result: t
                    }
                }); {
                    let {
                        matches: n
                    } = e, o = Math.min(Math.max(n.findIndex(e => e.route.id === r), 0), Math.max(n.findIndex(e => e.shouldCallHandler()), 0)), a = n[o].route.id;
                    for (let e of n.slice(0, o + 1)) try {
                        await e._lazyPromises ? .route
                    } catch {
                        a = e.route.id;
                        break
                    }
                    return {
                        [nw(n, a).route.id]: {
                            type: "error",
                            result: t
                        }
                    }
                }
            }
        }
        async function nt(e, t, r, n, o) {
            let {
                matches: a,
                ...i
            } = e;
            return await nr(i, a.flatMap(e => e.route.middleware ? e.route.middleware.map(t => [e.route.id, t]) : []), t, r, n, o)
        }
        async function nr(e, t, r, n, o, a, i = 0) {
            let s, {
                request: l
            } = e;
            if (l.signal.aborted) throw l.signal.reason ? ? Error(`Request aborted: ${l.method} ${l.url}`);
            let u = t[i];
            if (!u) return await r();
            let [c, d] = u, h = async () => {
                if (s) throw Error("You may only call `next()` once per middleware");
                try {
                    return (s = {
                        value: await nr(e, t, r, n, o, a, i + 1)
                    }).value
                } catch (e) {
                    return (s = {
                        value: await a(e, c, s)
                    }).value
                }
            };
            try {
                let t = await d(e, h),
                    r = null != t ? n(t) : void 0;
                if (o(r)) return r;
                if (s) return r ? ? s.value;
                return (s = {
                    value: await h()
                }).value
            } catch (e) {
                return await a(e, c, s)
            }
        }

        function nn(e, t, r, n, o) {
            let a = r6({
                    key: "middleware",
                    route: n.route,
                    manifest: t,
                    mapRouteProperties: e
                }),
                i = function(e, t, r, n, o) {
                    let a, i = r[e.id];
                    if (tJ(i, "No route found in manifest"), !e.lazy) return {
                        lazyRoutePromise: void 0,
                        lazyHandlerPromise: void 0
                    };
                    if ("function" == typeof e.lazy) {
                        let t = r9.get(i);
                        if (t) return {
                            lazyRoutePromise: t,
                            lazyHandlerPromise: t
                        };
                        let r = (async () => {
                            tJ("function" == typeof e.lazy, "No lazy route function found");
                            let t = await e.lazy(),
                                r = {};
                            for (let e in t) {
                                let n = t[e];
                                if (void 0 === n) continue;
                                let o = t4.has(e),
                                    a = void 0 !== i[e];
                                o ? tY(!o, "Route property " + e + " is not a supported property to be returned from a lazy route function. This property will be ignored.") : a ? tY(!a, `Route "${i.id}" has a static property "${e}" defined but its lazy function is also returning a value for this property. The lazy route property "${e}" will be ignored.`) : r[e] = n
                            }
                            Object.assign(i, r), Object.assign(i, { ...n(i),
                                lazy: void 0
                            })
                        })();
                        return r9.set(i, r), r.catch(() => {}), {
                            lazyRoutePromise: r,
                            lazyHandlerPromise: r
                        }
                    }
                    let s = Object.keys(e.lazy),
                        l = [];
                    for (let i of s) {
                        if (o && o.includes(i)) continue;
                        let s = r6({
                            key: i,
                            route: e,
                            manifest: r,
                            mapRouteProperties: n
                        });
                        s && (l.push(s), i === t && (a = s))
                    }
                    let u = l.length > 0 ? Promise.all(l).then(() => {}) : void 0;
                    return u ? .catch(() => {}), a ? .catch(() => {}), {
                        lazyRoutePromise: u,
                        lazyHandlerPromise: a
                    }
                }(n.route, nk(r.method) ? "action" : "loader", t, e, o);
            return {
                middleware: a,
                route: i.lazyRoutePromise,
                handler: i.lazyHandlerPromise
            }
        }

        function no(e, t, r, n, o, a, i, s, l, u = null, c) {
            let d = !1,
                h = nn(e, t, r, a, i);
            return { ...a,
                _lazyPromises: h,
                shouldLoad: l,
                shouldRevalidateArgs: u,
                shouldCallHandler: e => (d = !0, u) ? "boolean" == typeof c ? r4(a, { ...u,
                    defaultShouldRevalidate: c
                }) : "boolean" == typeof e ? r4(a, { ...u,
                    defaultShouldRevalidate: e
                }) : r4(a, u) : l,
                resolve(e) {
                    let {
                        lazy: t,
                        loader: i,
                        middleware: u
                    } = a.route, c = d || l || e && !nk(r.method) && (t || i), f = u && u.length > 0 && !i && !t;
                    return c && (nk(r.method) || !f) ? ns({
                        request: r,
                        path: n,
                        pattern: o,
                        match: a,
                        lazyHandlerPromise: h ? .handler,
                        lazyRoutePromise: h ? .route,
                        handlerOverride: e,
                        scopedContext: s
                    }) : Promise.resolve({
                        type: "data",
                        result: void 0
                    })
                }
            }
        }

        function na(e, t, r, n, o, a, i, s, l = null) {
            return o.map(u => u.route.id !== a.route.id ? { ...u,
                shouldLoad: !1,
                shouldRevalidateArgs: l,
                shouldCallHandler: () => !1,
                _lazyPromises: nn(e, t, r, u, i),
                resolve: () => Promise.resolve({
                    type: "data",
                    result: void 0
                })
            } : no(e, t, r, n, rC(o), u, i, s, !0, l))
        }
        async function ni(e, t, r, n, o, a, i) {
            n.some(e => e._lazyPromises ? .middleware) && await Promise.all(n.map(e => e._lazyPromises ? .middleware));
            let s = {
                    request: t,
                    url: rL(t, r),
                    pattern: rC(n),
                    params: n[0].params,
                    context: a,
                    matches: n
                },
                l = i ? () => {
                    throw Error("You cannot call `runClientMiddleware()` from a static handler `dataStrategy`. Middleware is run outside of `dataStrategy` during SSR in order to bubble up the Response.  You can enable middleware via the `respond` API in `query`/`queryRoute`")
                } : e => ne(s, () => e({ ...s,
                    fetcherKey: o,
                    runClientMiddleware: () => {
                        throw Error("Cannot call `runClientMiddleware()` from within an `runClientMiddleware` handler")
                    }
                })),
                u = await e({ ...s,
                    fetcherKey: o,
                    runClientMiddleware: l
                });
            try {
                await Promise.all(n.flatMap(e => [e._lazyPromises ? .handler, e._lazyPromises ? .route]))
            } catch (e) {}
            return u
        }
        async function ns({
            request: e,
            path: t,
            pattern: r,
            match: n,
            lazyHandlerPromise: o,
            lazyRoutePromise: a,
            handlerOverride: i,
            scopedContext: s
        }) {
            let l, u, c = nk(e.method),
                d = c ? "action" : "loader",
                h = o => {
                    let a, l = new Promise((e, t) => a = t);
                    u = () => a(), e.signal.addEventListener("abort", u);
                    let c = a => "function" != typeof o ? Promise.reject(Error(`You cannot call the handler for a route which defines a boolean "${d}" [routeId: ${n.route.id}]`)) : o({
                        request: e,
                        url: rL(e, t),
                        pattern: r,
                        params: n.params,
                        context: s
                    }, ...void 0 !== a ? [a] : []);
                    return Promise.race([(async () => {
                        try {
                            return {
                                type: "data",
                                result: await (i ? i(e => c(e)) : c())
                            }
                        } catch (e) {
                            return {
                                type: "error",
                                result: e
                            }
                        }
                    })(), l])
                };
            try {
                let t = c ? n.route.action : n.route.loader;
                if (o || a)
                    if (t) {
                        let e, [r] = await Promise.all([h(t).catch(t => {
                            e = t
                        }), o, a]);
                        if (void 0 !== e) throw e;
                        l = r
                    } else {
                        await o;
                        let t = c ? n.route.action : n.route.loader;
                        if (t)[l] = await Promise.all([h(t), a]);
                        else {
                            if ("action" !== d) return {
                                type: "data",
                                result: void 0
                            };
                            let t = new URL(e.url),
                                r = t.pathname + t.search;
                            throw nR(405, {
                                method: e.method,
                                pathname: r,
                                routeId: n.route.id
                            })
                        }
                    }
                else if (t) l = await h(t);
                else {
                    let t = new URL(e.url);
                    throw nR(404, {
                        pathname: t.pathname + t.search
                    })
                }
            } catch (e) {
                return {
                    type: "error",
                    result: e
                }
            } finally {
                u && e.signal.removeEventListener("abort", u)
            }
            return l
        }
        async function nl(e) {
            let t = e.headers.get("Content-Type");
            return t && /\bapplication\/json\b/.test(t) ? null == e.body ? null : e.json() : e.text()
        }
        async function nu(e) {
            let {
                result: t,
                type: r
            } = e;
            if (nL(t)) {
                let e;
                try {
                    e = await nl(t)
                } catch (e) {
                    return {
                        type: "error",
                        error: e
                    }
                }
                return "error" === r ? {
                    type: "error",
                    error: new r_(t.status, t.statusText, e),
                    statusCode: t.status,
                    headers: t.headers
                } : {
                    type: "data",
                    data: e,
                    statusCode: t.status,
                    headers: t.headers
                }
            }
            if ("error" === r) {
                if (nC(t)) {
                    var n;
                    return t.data instanceof Error ? {
                        type: "error",
                        error: t.data,
                        statusCode: t.init ? .status,
                        headers: t.init ? .headers ? new Headers(t.init.headers) : void 0
                    } : {
                        type: "error",
                        error: (n = t, new r_(n.init ? .status ? ? 500, n.init ? .statusText ? ? "Internal Server Error", n.data)),
                        statusCode: rP(t) ? t.status : void 0,
                        headers: t.init ? .headers ? new Headers(t.init.headers) : void 0
                    }
                }
                return {
                    type: "error",
                    error: t,
                    statusCode: rP(t) ? t.status : void 0
                }
            }
            return nC(t) ? {
                type: "data",
                data: t.data,
                statusCode: t.init ? .status,
                headers: t.init ? .headers ? new Headers(t.init.headers) : void 0
            } : {
                type: "data",
                data: t
            }
        }
        let nc = ["about:", "blob:", "chrome:", "chrome-untrusted:", "content:", "data:", "devtools:", "file:", "filesystem:", "javascript:"];

        function nd(e) {
            try {
                return nc.includes(new URL(e).protocol)
            } catch {
                return !1
            }
        }

        function nh(e, t, r, n) {
            if (tB.test(e)) {
                let n = new URL(tH.test(e) ? tz(e, t.protocol) : e);
                if (nd(n.toString())) throw Error("Invalid redirect location");
                let o = null != rc(n.pathname, r);
                if (n.origin === t.origin && o) return rg(n.pathname) + n.search + n.hash
            }
            try {
                if (nd(n.createURL(e).toString())) throw Error("Invalid redirect location")
            } catch (e) {}
            return e
        }

        function nf(e, t, r, n) {
            let o = e.createURL(nx(t)).toString(),
                a = {
                    signal: r
                };
            if (n && nk(n.formMethod)) {
                let {
                    formMethod: e,
                    formEncType: t
                } = n;
                a.method = e.toUpperCase(), "application/json" === t ? (a.headers = new Headers({
                    "Content-Type": t
                }), a.body = JSON.stringify(n.json)) : "text/plain" === t ? a.body = n.text : "application/x-www-form-urlencoded" === t && n.formData ? a.body = np(n.formData) : a.body = n.formData
            }
            return new Request(o, a)
        }

        function np(e) {
            let t = new URLSearchParams;
            for (let [r, n] of e.entries()) t.append(r, "string" == typeof n ? n : n.name);
            return t
        }

        function nm(e) {
            let t = new FormData;
            for (let [r, n] of e.entries()) t.append(r, n);
            return t
        }

        function ny(e, t, r, n, o, a, i) {
            let {
                loaderData: s,
                errors: l
            } = function(e, t, r, n = !1, o = !1) {
                let a, i = {},
                    s = null,
                    l = !1,
                    u = {},
                    c = r && n_(r[1]) ? r[1].error : void 0;
                return e.forEach(r => {
                    if (!(r.route.id in t)) return;
                    let d = r.route.id,
                        h = t[d];
                    if (tJ(!nP(h), "Cannot handle redirect results in processLoaderData"), n_(h)) {
                        let t = h.error;
                        if (void 0 !== c && (t = c, c = void 0), s = s || {}, o) s[d] = t;
                        else {
                            let r = nw(e, d);
                            null == s[r.route.id] && (s[r.route.id] = t)
                        }
                        n || (i[d] = rQ), l || (l = !0, a = rP(h.error) ? h.error.status : 500), h.headers && (u[d] = h.headers)
                    } else i[d] = h.data, h.statusCode && 200 !== h.statusCode && !l && (a = h.statusCode), h.headers && (u[d] = h.headers)
                }), void 0 !== c && r && (s = {
                    [r[0]]: c
                }, r[2] && (i[r[2]] = void 0)), {
                    loaderData: i,
                    errors: s,
                    statusCode: a || 200,
                    loaderHeaders: u
                }
            }(t, r, n);
            return o.filter(e => !e.matches || e.matches.some(e => e.shouldLoad)).forEach(t => {
                let {
                    key: r,
                    match: n,
                    controller: o
                } = t;
                if (o && o.signal.aborted) return;
                let s = a[r];
                if (tJ(s, "Did not find corresponding fetcher result"), n_(s)) {
                    let t = nw(e.matches, n ? .route.id);
                    l && l[t.route.id] || (l = { ...l,
                        [t.route.id]: s.error
                    }), i.delete(r)
                } else if (nP(s)) tJ(!1, "Unhandled fetcher revalidation redirect");
                else {
                    let e = nM(s.data);
                    i.set(r, e)
                }
            }), {
                loaderData: s,
                errors: l
            }
        }

        function ng(e, t, r, n) {
            let o = Object.entries(t).filter(([, e]) => e !== rQ).reduce((e, [t, r]) => (e[t] = r, e), {});
            for (let a of r) {
                let r = a.route.id;
                if (!t.hasOwnProperty(r) && e.hasOwnProperty(r) && a.route.loader && (o[r] = e[r]), n && n.hasOwnProperty(r)) break
            }
            return o
        }

        function nv(e) {
            return e ? n_(e[1]) ? {
                actionData: {}
            } : {
                actionData: {
                    [e[0]]: e[1].data
                }
            } : {}
        }

        function nw(e, t) {
            return (t ? e.slice(0, e.findIndex(e => e.route.id === t) + 1) : [...e]).reverse().find(e => null != e.route.ErrorBoundary || null != e.route.errorElement) || e[0]
        }

        function nb(e) {
            let t = 1 === e.length ? e[0] : e.find(e => e.index || !e.path || "/" === e.path) || {
                id: "__shim-error-route__"
            };
            return {
                matches: [{
                    params: {},
                    pathname: "",
                    pathnameBase: "",
                    route: t
                }],
                route: t
            }
        }

        function nR(e, {
            pathname: t,
            routeId: r,
            method: n,
            type: o,
            message: a
        } = {}) {
            let i = "Unknown Server Error",
                s = "Unknown @remix-run/router error";
            return 400 === e ? (i = "Bad Request", n && t && r ? s = `You made a ${n} request to "${t}" but did not provide a \`loader\` for route "${r}", so there is no way to handle the request.` : "invalid-body" === o && (s = "Unable to encode submission body")) : 403 === e ? (i = "Forbidden", s = `Route "${r}" does not match URL "${t}"`) : 404 === e ? (i = "Not Found", s = `No route matches URL "${t}"`) : 405 === e && (i = "Method Not Allowed", n && t && r ? s = `You made a ${n.toUpperCase()} request to "${t}" but did not provide an \`action\` for route "${r}", so there is no way to handle the request.` : n && (s = `Invalid request method "${n.toUpperCase()}"`)), new r_(e || 500, i, Error(s), !0)
        }

        function nE(e) {
            let t = Object.entries(e);
            for (let e = t.length - 1; e >= 0; e--) {
                let [r, n] = t[e];
                if (nP(n)) return {
                    key: r,
                    result: n
                }
            }
        }

        function nx(e) {
            return tX({ ..."string" == typeof e ? tZ(e) : e,
                hash: ""
            })
        }

        function nS(e) {
            return null != e && "object" == typeof e && Object.entries(e).every(([e, t]) => {
                var r;
                return "string" == typeof e && null != (r = t) && "object" == typeof r && "type" in r && "result" in r && ("data" === r.type || "error" === r.type)
            })
        }

        function n_(e) {
            return "error" === e.type
        }

        function nP(e) {
            return "redirect" === (e && e.type)
        }

        function nC(e) {
            return "object" == typeof e && null != e && "type" in e && "data" in e && "init" in e && "DataWithResponseInit" === e.type
        }

        function nL(e) {
            return null != e && "number" == typeof e.status && "string" == typeof e.statusText && "object" == typeof e.headers && void 0 !== e.body
        }

        function nk(e) {
            return rH.has(e.toUpperCase())
        }

        function nN(e) {
            return new URLSearchParams(e).getAll("index").some(e => "" === e)
        }

        function nT(e, t) {
            let r = "string" == typeof t ? tZ(t).search : t.search;
            if (e[e.length - 1].route.index && nN(r || "")) return e[e.length - 1];
            let n = rp(e);
            return n[n.length - 1]
        }

        function nj(e, t, r) {
            return {
                url: rL(e.createURL(t), t),
                pattern: r ? rC(r) : "",
                params: r ? .[0] ? .params ? { ...r[0].params
                } : {}
            }
        }

        function nA(e) {
            let {
                formMethod: t,
                formAction: r,
                formEncType: n,
                text: o,
                formData: a,
                json: i
            } = e;
            if (t && r && n) {
                if (null != o) return {
                    formMethod: t,
                    formAction: r,
                    formEncType: n,
                    formData: void 0,
                    json: void 0,
                    text: o
                };
                else if (null != a) return {
                    formMethod: t,
                    formAction: r,
                    formEncType: n,
                    formData: a,
                    json: void 0,
                    text: void 0
                };
                else if (void 0 !== i) return {
                    formMethod: t,
                    formAction: r,
                    formEncType: n,
                    formData: void 0,
                    json: i,
                    text: void 0
                }
            }
        }

        function nD(e, t, r, n) {
            return n ? {
                state: "loading",
                location: e,
                matches: t,
                historyAction: r,
                formMethod: n.formMethod,
                formAction: n.formAction,
                formEncType: n.formEncType,
                formData: n.formData,
                json: n.json,
                text: n.text
            } : {
                state: "loading",
                location: e,
                matches: t,
                historyAction: r,
                formMethod: void 0,
                formAction: void 0,
                formEncType: void 0,
                formData: void 0,
                json: void 0,
                text: void 0
            }
        }

        function nI(e, t) {
            return e ? {
                state: "loading",
                formMethod: e.formMethod,
                formAction: e.formAction,
                formEncType: e.formEncType,
                formData: e.formData,
                json: e.json,
                text: e.text,
                data: t
            } : {
                state: "loading",
                formMethod: void 0,
                formAction: void 0,
                formEncType: void 0,
                formData: void 0,
                json: void 0,
                text: void 0,
                data: t
            }
        }

        function nM(e) {
            return {
                state: "idle",
                formMethod: void 0,
                formAction: void 0,
                formEncType: void 0,
                formData: void 0,
                json: void 0,
                text: void 0,
                data: e
            }
        }

        function nO() {
            let e, t, r = new Promise((n, o) => {
                e = async e => {
                    n(e);
                    try {
                        await r
                    } catch (e) {}
                }, t = async e => {
                    o(e);
                    try {
                        await r
                    } catch (e) {}
                }
            });
            return {
                promise: r,
                resolve: e,
                reject: t
            }
        }
        let n$ = i.createContext(null);
        n$.displayName = "DataRouter";
        let nF = i.createContext(null);
        nF.displayName = "DataRouterState";
        let nU = i.createContext(!1);

        function nB() {
            return i.useContext(nU)
        }
        let nH = i.createContext({
            isTransitioning: !1
        });
        nH.displayName = "ViewTransition";
        let nz = i.createContext(new Map);
        nz.displayName = "Fetchers", i.createContext(null).displayName = "Await";
        let nq = i.createContext(null);
        nq.displayName = "Navigation";
        let nW = i.createContext(null);
        nW.displayName = "Location";
        let nV = i.createContext({
            outlet: null,
            matches: [],
            isDataRoute: !1
        });
        nV.displayName = "Route";
        let nK = i.createContext(null);
        nK.displayName = "RouteError";
        let nJ = "REACT_ROUTER_ERROR";

        function nY() {
            return null != i.useContext(nW)
        }

        function nQ() {
            return tJ(nY(), "useLocation() may be used only in the context of a <Router> component."), i.useContext(nW).location
        }
        let nG = "You should call navigate() in a React.useEffect(), not when your component is first rendered.";

        function nX() {
            let {
                isDataRoute: e
            } = i.useContext(nV);
            return e ? function() {
                let {
                    router: e
                } = n8("useNavigate"), t = ot("useNavigate"), r = i.useRef(!1);
                return i.useLayoutEffect(() => {
                    r.current = !0
                }), i.useCallback(async (n, o = {}) => {
                    tY(r.current, nG), r.current && ("number" == typeof n ? await e.navigate(n) : await e.navigate(n, {
                        fromRouteId: t,
                        ...o
                    }))
                }, [e, t])
            }() : function() {
                tJ(nY(), "useNavigate() may be used only in the context of a <Router> component.");
                let e = i.useContext(n$),
                    {
                        basename: t,
                        navigator: r
                    } = i.useContext(nq),
                    {
                        matches: n
                    } = i.useContext(nV),
                    {
                        pathname: o
                    } = nQ(),
                    a = JSON.stringify(rm(n)),
                    s = i.useRef(!1);
                return i.useLayoutEffect(() => {
                    s.current = !0
                }), i.useCallback((n, i = {}) => {
                    if (tY(s.current, nG), !s.current) return;
                    if ("number" == typeof n) return void r.go(n);
                    let l = ry(n, JSON.parse(a), o, "path" === i.relative);
                    null == e && "/" !== t && (l.pathname = "/" === l.pathname ? t : rv([t, l.pathname])), (i.replace ? r.replace : r.push)(l, i.state, i)
                }, [t, r, a, o, e])
            }()
        }
        let nZ = i.createContext(null);

        function n0(e, {
            relative: t
        } = {}) {
            let {
                matches: r
            } = i.useContext(nV), {
                pathname: n
            } = nQ(), o = JSON.stringify(rm(r));
            return i.useMemo(() => ry(e, JSON.parse(o), n, "path" === t), [e, o, n, t])
        }

        function n1(e, t) {
            return n2(e, t)
        }

        function n2(e, t, r) {
            let n;
            tJ(nY(), "useRoutes() may be used only in the context of a <Router> component.");
            let {
                navigator: o
            } = i.useContext(nq), {
                matches: a
            } = i.useContext(nV), s = a[a.length - 1], l = s ? s.params : {};
            s && s.pathname;
            let u = s ? s.pathnameBase : "/";
            s && s.route;
            let c = nQ();
            if (t) {
                let e = "string" == typeof t ? tZ(t) : t;
                tJ("/" === u || e.pathname ? .startsWith(u), `When overriding the location using \`<Routes location>\` or \`useRoutes(routes, location)\`, the location pathname must begin with the portion of the URL pathname that was matched by all parent routes. The current pathname base is "${u}" but pathname "${e.pathname}" was given in the \`location\` prop.`), n = e
            } else n = c;
            let d = n.pathname || "/",
                h = d;
            if ("/" !== u) {
                let e = u.replace(/^\//, "").split("/");
                h = "/" + d.replace(/^\//, "").split("/").slice(e.length).join("/")
            }
            let f = r && r.state.matches.length ? r.state.matches.map(e => Object.assign(e, {
                    route: r.manifest[e.route.id] || e.route
                })) : t9(e, {
                    pathname: h
                }),
                p = function(e, t = [], r) {
                    let n = r ? .state;
                    if (null == e) {
                        if (!n) return null;
                        if (n.errors) e = n.matches;
                        else {
                            if (0 !== t.length || n.initialized || !(n.matches.length > 0)) return null;
                            e = n.matches
                        }
                    }
                    let o = e,
                        a = n ? .errors;
                    if (null != a) {
                        let e = o.findIndex(e => e.route.id && a ? .[e.route.id] !== void 0);
                        tJ(e >= 0, `Could not find a matching route for errors on route IDs: ${Object.keys(a).join(",")}`), o = o.slice(0, Math.min(o.length, e + 1))
                    }
                    let s = !1,
                        l = -1;
                    if (r && n) {
                        s = n.renderFallback;
                        for (let e = 0; e < o.length; e++) {
                            let t = o[e];
                            if ((t.route.HydrateFallback || t.route.hydrateFallbackElement) && (l = e), t.route.id) {
                                let {
                                    loaderData: e,
                                    errors: a
                                } = n, i = t.route.loader && !e.hasOwnProperty(t.route.id) && (!a || void 0 === a[t.route.id]);
                                if (t.route.lazy || i) {
                                    r.isStatic && (s = !0), o = l >= 0 ? o.slice(0, l + 1) : [o[0]];
                                    break
                                }
                            }
                        }
                    }
                    let u = r ? .onError,
                        c = n && u ? (e, t) => {
                            u(e, {
                                location: n.location,
                                params: n.matches ? .[0] ? .params ? ? {},
                                pattern: rC(n.matches),
                                errorInfo: t
                            })
                        } : void 0;
                    return o.reduceRight((e, r, u) => {
                        var d, h;
                        let f, p = !1,
                            m = null,
                            y = null;
                        n && (f = a && r.route.id ? a[r.route.id] : void 0, m = r.route.errorElement || n4, s && (l < 0 && 0 === u ? (d = "route-fallback", h = "No `HydrateFallback` element provided to render during initial hydration", oi[d] || (oi[d] = !0, tY(!1, h)), p = !0, y = null) : l === u && (p = !0, y = r.route.hydrateFallbackElement || null)));
                        let g = t.concat(o.slice(0, u + 1)),
                            v = () => {
                                let t;
                                return t = f ? m : p ? y : r.route.Component ? i.createElement(r.route.Component, null) : r.route.element ? r.route.element : e, i.createElement(n9, {
                                    match: r,
                                    routeContext: {
                                        outlet: e,
                                        matches: g,
                                        isDataRoute: null != n
                                    },
                                    children: t
                                })
                            };
                        return n && (r.route.ErrorBoundary || r.route.errorElement || 0 === u) ? i.createElement(n3, {
                            location: n.location,
                            revalidation: n.revalidation,
                            component: m,
                            error: f,
                            children: v(),
                            routeContext: {
                                outlet: null,
                                matches: g,
                                isDataRoute: !0
                            },
                            onError: c
                        }) : v()
                    }, null)
                }(f && f.map(e => Object.assign({}, e, {
                    params: Object.assign({}, l, e.params),
                    pathname: rv([u, o.encodeLocation ? o.encodeLocation(e.pathname.replace(/%/g, "%25").replace(/\?/g, "%3F").replace(/#/g, "%23")).pathname : e.pathname]),
                    pathnameBase: "/" === e.pathnameBase ? u : rv([u, o.encodeLocation ? o.encodeLocation(e.pathnameBase.replace(/%/g, "%25").replace(/\?/g, "%3F").replace(/#/g, "%23")).pathname : e.pathnameBase])
                })), a, r);
            return t && p ? i.createElement(nW.Provider, {
                value: {
                    location: {
                        pathname: "/",
                        search: "",
                        hash: "",
                        state: null,
                        key: "default",
                        mask: void 0,
                        ...n
                    },
                    navigationType: "POP"
                }
            }, p) : p
        }
        let n4 = i.createElement(function() {
            let e = oo(),
                t = rP(e) ? `${e.status} ${e.statusText}` : e instanceof Error ? e.message : JSON.stringify(e),
                r = e instanceof Error ? e.stack : null;
            return i.createElement(i.Fragment, null, i.createElement("h2", null, "Unexpected Application Error!"), i.createElement("h3", {
                style: {
                    fontStyle: "italic"
                }
            }, t), r ? i.createElement("pre", {
                style: {
                    padding: "0.5rem",
                    backgroundColor: "rgba(200,200,200, 0.5)"
                }
            }, r) : null, null)
        }, null);
        var n3 = class extends i.Component {
            constructor(e) {
                super(e), this.state = {
                    location: e.location,
                    revalidation: e.revalidation,
                    error: e.error
                }
            }
            static contextType = nU;
            static getDerivedStateFromError(e) {
                return {
                    error: e
                }
            }
            static getDerivedStateFromProps(e, t) {
                return t.location !== e.location || "idle" !== t.revalidation && "idle" === e.revalidation ? {
                    error: e.error,
                    location: e.location,
                    revalidation: e.revalidation
                } : {
                    error: void 0 !== e.error ? e.error : t.error,
                    location: t.location,
                    revalidation: e.revalidation || t.revalidation
                }
            }
            componentDidCatch(e, t) {
                this.props.onError ? this.props.onError(e, t) : console.error("React Router caught the following error during render", e)
            }
            render() {
                let e = this.state.error;
                if (this.context && "object" == typeof e && e && "digest" in e && "string" == typeof e.digest) {
                    let t = function(e) {
                        if (e.startsWith(`${nJ}:ROUTE_ERROR_RESPONSE:{`)) try {
                            let t = JSON.parse(e.slice(40));
                            if ("object" == typeof t && t && "number" == typeof t.status && "string" == typeof t.statusText) return new r_(t.status, t.statusText, t.data)
                        } catch {}
                    }(e.digest);
                    t && (e = t)
                }
                let t = void 0 !== e ? i.createElement(nV.Provider, {
                    value: this.props.routeContext
                }, i.createElement(nK.Provider, {
                    value: e,
                    children: this.props.component
                })) : this.props.children;
                return this.context ? i.createElement(n6, {
                    error: e
                }, t) : t
            }
        };
        let n5 = new WeakMap;

        function n6({
            children: e,
            error: t
        }) {
            let {
                basename: r
            } = i.useContext(nq);
            if ("object" == typeof t && t && "digest" in t && "string" == typeof t.digest) {
                let e = function(e) {
                    if (e.startsWith(`${nJ}:REDIRECT:{`)) try {
                        let t = JSON.parse(e.slice(28));
                        if ("object" == typeof t && t && "number" == typeof t.status && "string" == typeof t.statusText && "string" == typeof t.location && "boolean" == typeof t.reloadDocument && "boolean" == typeof t.replace) return t
                    } catch {}
                }(t.digest);
                if (e) {
                    let n = n5.get(t);
                    if (n) throw n;
                    let o = rN(e.location, r),
                        a = o.absoluteURL || o.to;
                    if (nd(a)) throw Error("Invalid redirect location");
                    if (rk && !n5.get(t))
                        if (o.isExternal || e.reloadDocument) window.location.href = a;
                        else {
                            let r = Promise.resolve().then(() => window.__reactRouterDataRouter.navigate(o.to, {
                                replace: e.replace
                            }));
                            throw n5.set(t, r), r
                        }
                    return i.createElement("meta", {
                        httpEquiv: "refresh",
                        content: `0;url=${a}`
                    })
                }
            }
            return e
        }

        function n9({
            routeContext: e,
            match: t,
            children: r
        }) {
            let n = i.useContext(n$);
            return n && n.static && n.staticContext && (t.route.errorElement || t.route.ErrorBoundary) && (n.staticContext._deepestRenderedBoundaryId = t.route.id), i.createElement(nV.Provider, {
                value: e
            }, r)
        }

        function n7(e) {
            return `${e} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`
        }

        function n8(e) {
            let t = i.useContext(n$);
            return tJ(t, n7(e)), t
        }

        function oe(e) {
            let t = i.useContext(nF);
            return tJ(t, n7(e)), t
        }

        function ot(e) {
            let t, r = (tJ(t = i.useContext(nV), n7(e)), t),
                n = r.matches[r.matches.length - 1];
            return tJ(n.route.id, `${e} can only be used on routes that contain a unique "id"`), n.route.id
        }

        function or() {
            let e = oe("useNavigation");
            return i.useMemo(() => {
                let {
                    matches: t,
                    historyAction: r,
                    ...n
                } = e.navigation;
                return n
            }, [e.navigation])
        }

        function on() {
            let {
                matches: e,
                loaderData: t
            } = oe("useMatches");
            return i.useMemo(() => e.map(e => t8(e, t)), [e, t])
        }

        function oo() {
            let e = i.useContext(nK),
                t = oe("useRouteError"),
                r = ot("useRouteError");
            return void 0 !== e ? e : t.errors ? .[r]
        }
        let oa = 0,
            oi = {},
            os = {};

        function ol(e, t) {
            e || os[t] || (os[t] = !0, console.warn(t))
        }
        let ou = ["HydrateFallback", "hydrateFallbackElement"];
        var oc = class {
            status = "pending";
            promise;
            resolve;
            reject;
            constructor() {
                this.promise = new Promise((e, t) => {
                    this.resolve = t => {
                        "pending" === this.status && (this.status = "resolved", e(t))
                    }, this.reject = e => {
                        "pending" === this.status && (this.status = "rejected", t(e))
                    }
                })
            }
        };

        function od({
            router: e,
            flushSync: t,
            onError: r,
            useTransitions: n
        }) {
            n = nB() || n;
            let [o, a] = i.useState(e.state), [s, l] = (0, i.useOptimistic)(o), [u, c] = i.useState(), [d, h] = i.useState({
                isTransitioning: !1
            }), [f, p] = i.useState(), [m, y] = i.useState(), [g, v] = i.useState(), w = i.useRef(new Map), b = i.useCallback((o, {
                deletedFetchers: s,
                newErrors: u,
                flushSync: d,
                viewTransitionOpts: g
            }) => {
                u && r && Object.values(u).forEach(e => r(e, {
                    location: o.location,
                    params: o.matches[0] ? .params ? ? {},
                    pattern: rC(o.matches)
                })), o.fetchers.forEach((e, t) => {
                    void 0 !== e.data && w.current.set(t, e.data)
                }), s.forEach(e => w.current.delete(e)), ol(!1 === d || null != t, 'You provided the `flushSync` option to a router update, but you are not using the `<RouterProvider>` from `react-router/dom` so `ReactDOM.flushSync()` is unavailable.  Please update your app to `import { RouterProvider } from "react-router/dom"` and ensure you have `react-dom` installed as a dependency to use the `flushSync` option.');
                let b = null != e.window && null != e.window.document && "function" == typeof e.window.document.startViewTransition;
                if (ol(null == g || b, "You provided the `viewTransition` option to a router update, but you do not appear to be running in a DOM environment as `window.startViewTransition` is not available."), !g || !b) return void(t && d ? t(() => a(o)) : !1 === n ? a(o) : i.startTransition(() => {
                    !0 === n && l(e => oh(e, o)), a(o)
                }));
                if (t && d) {
                    t(() => {
                        m && (f ? .resolve(), m.skipTransition()), h({
                            isTransitioning: !0,
                            flushSync: !0,
                            currentLocation: g.currentLocation,
                            nextLocation: g.nextLocation
                        })
                    });
                    let r = e.window.document.startViewTransition(() => {
                        t(() => a(o))
                    });
                    r.finished.finally(() => {
                        t(() => {
                            p(void 0), y(void 0), c(void 0), h({
                                isTransitioning: !1
                            })
                        })
                    }), t(() => y(r));
                    return
                }
                m ? (f ? .resolve(), m.skipTransition(), v({
                    state: o,
                    currentLocation: g.currentLocation,
                    nextLocation: g.nextLocation
                })) : (c(o), h({
                    isTransitioning: !0,
                    flushSync: !1,
                    currentLocation: g.currentLocation,
                    nextLocation: g.nextLocation
                }))
            }, [e.window, t, m, f, n, l, r]);
            i.useLayoutEffect(() => e.subscribe(b), [e, b]), i.useEffect(() => {
                d.isTransitioning && !d.flushSync && p(new oc)
            }, [d]), i.useEffect(() => {
                if (f && u && e.window) {
                    let t = f.promise,
                        r = e.window.document.startViewTransition(async () => {
                            !1 === n ? a(u) : i.startTransition(() => {
                                !0 === n && l(e => oh(e, u)), a(u)
                            }), await t
                        });
                    r.finished.finally(() => {
                        p(void 0), y(void 0), c(void 0), h({
                            isTransitioning: !1
                        })
                    }), y(r)
                }
            }, [u, f, e.window, n, l]), i.useEffect(() => {
                f && u && s.location.key === u.location.key && f.resolve()
            }, [f, m, s.location, u]), i.useEffect(() => {
                !d.isTransitioning && g && (c(g.state), h({
                    isTransitioning: !0,
                    flushSync: !1,
                    currentLocation: g.currentLocation,
                    nextLocation: g.nextLocation
                }), v(void 0))
            }, [d.isTransitioning, g]);
            let R = i.useMemo(() => ({
                    createHref: e.createHref,
                    encodeLocation: e.encodeLocation,
                    go: t => e.navigate(t),
                    push: (t, r, n) => e.navigate(t, {
                        state: r,
                        preventScrollReset: n ? .preventScrollReset
                    }),
                    replace: (t, r, n) => e.navigate(t, {
                        replace: !0,
                        state: r,
                        preventScrollReset: n ? .preventScrollReset
                    })
                }), [e]),
                E = e.basename || "/",
                x = i.useMemo(() => ({
                    router: e,
                    navigator: R,
                    static: !1,
                    basename: E,
                    onError: r
                }), [e, R, E, r]);
            return i.createElement(i.Fragment, null, i.createElement(n$.Provider, {
                value: x
            }, i.createElement(nF.Provider, {
                value: s
            }, i.createElement(nz.Provider, {
                value: w.current
            }, i.createElement(nH.Provider, {
                value: d
            }, i.createElement(og, {
                basename: E,
                location: s.location,
                navigationType: s.historyAction,
                navigator: R,
                useTransitions: n
            }, i.createElement( of , {
                routes: e.routes,
                manifest: e.manifest,
                future: e.future,
                state: s,
                isStatic: !1,
                onError: r
            })))))), null)
        }

        function oh(e, t) {
            return { ...e,
                navigation: "idle" !== t.navigation.state ? t.navigation : e.navigation,
                revalidation: "idle" !== t.revalidation ? t.revalidation : e.revalidation,
                actionData: "submitting" !== t.navigation.state ? t.actionData : e.actionData,
                fetchers: t.fetchers
            }
        }
        let of = i.memo(function({
            routes: e,
            manifest: t,
            future: r,
            state: n,
            isStatic: o,
            onError: a
        }) {
            return n2(e, void 0, {
                manifest: t,
                state: n,
                isStatic: o,
                onError: a,
                future: r
            })
        });

        function op({
            to: e,
            replace: t,
            state: r,
            relative: n
        }) {
            tJ(nY(), "<Navigate> may be used only in the context of a <Router> component.");
            let {
                static: o
            } = i.useContext(nq);
            tY(!o, "<Navigate> must not be used on the initial render in a <StaticRouter>. This is a no-op, but you should modify your code so the <Navigate> is only ever rendered in response to some user interaction or state change.");
            let {
                matches: a
            } = i.useContext(nV), {
                pathname: s
            } = nQ(), l = nX(), u = JSON.stringify(ry(e, rm(a), s, "path" === n));
            return i.useEffect(() => {
                l(JSON.parse(u), {
                    replace: t,
                    state: r,
                    relative: n
                })
            }, [l, u, n, t, r]), null
        }

        function om(e) {
            var t;
            let r;
            return t = e.context, r = i.useContext(nV).outlet, i.useMemo(() => r && i.createElement(nZ.Provider, {
                value: t
            }, r), [r, t])
        }

        function oy(e) {
            tJ(!1, "A <Route> is only ever to be used as the child of <Routes> element, never rendered directly. Please wrap your <Route> in a <Routes>.")
        }

        function og({
            basename: e = "/",
            children: t = null,
            location: r,
            navigationType: n = "POP",
            navigator: o,
            static: a = !1,
            useTransitions: s
        }) {
            tJ(!nY(), "You cannot render a <Router> inside another <Router>. You should never have more than one in your app.");
            let l = e.replace(/^\/*/, "/"),
                u = i.useMemo(() => ({
                    basename: l,
                    navigator: o,
                    static: a,
                    useTransitions: s,
                    future: {}
                }), [l, o, a, s]);
            "string" == typeof r && (r = tZ(r));
            let {
                pathname: c = "/",
                search: d = "",
                hash: h = "",
                state: f = null,
                key: p = "default",
                mask: m
            } = r, y = i.useMemo(() => {
                let e = rc(c, l);
                return null == e ? null : {
                    location: {
                        pathname: e,
                        search: d,
                        hash: h,
                        state: f,
                        key: p,
                        mask: m
                    },
                    navigationType: n
                }
            }, [l, c, d, h, f, p, n, m]);
            return (tY(null != y, `<Router basename="${l}"> is not able to match the URL "${c}${d}${h}" because it does not start with the basename, so the <Router> won't render anything.`), null == y) ? null : i.createElement(nq.Provider, {
                value: u
            }, i.createElement(nW.Provider, {
                children: t,
                value: y
            }))
        }

        function ov({
            children: e,
            location: t
        }) {
            return n2(function e(t, r = []) {
                let n = [];
                return i.Children.forEach(t, (t, o) => {
                    if (!i.isValidElement(t)) return;
                    let a = [...r, o];
                    if (t.type === i.Fragment) return void n.push.apply(n, e(t.props.children, a));
                    tJ(t.type === oy, `[${"string"==typeof t.type?t.type:t.type.name}] is not a <Route> component. All component children of <Routes> must be a <Route> or <React.Fragment>`);
                    let s = t.props;
                    tJ(!s.index || !s.children, "An index route cannot have child routes.");
                    let l = {
                        id: s.id || a.join("-"),
                        caseSensitive: s.caseSensitive,
                        element: s.element,
                        Component: s.Component,
                        index: s.index,
                        path: s.path,
                        middleware: s.middleware,
                        loader: s.loader,
                        action: s.action,
                        hydrateFallbackElement: s.hydrateFallbackElement,
                        HydrateFallback: s.HydrateFallback,
                        errorElement: s.errorElement,
                        ErrorBoundary: s.ErrorBoundary,
                        shouldRevalidate: s.shouldRevalidate,
                        handle: s.handle,
                        lazy: s.lazy
                    };
                    s.children && (l.children = e(s.children, a)), n.push(l)
                }), n
            }(e), t)
        }
        i.Component;
        let ow = "application/x-www-form-urlencoded";

        function ob(e) {
            return "u" > typeof HTMLElement && e instanceof HTMLElement
        }

        function oR(e = "") {
            return new URLSearchParams("string" == typeof e || Array.isArray(e) || e instanceof URLSearchParams ? e : Object.keys(e).reduce((t, r) => {
                let n = e[r];
                return t.concat(Array.isArray(n) ? n.map(e => [r, e]) : [
                    [r, n]
                ])
            }, []))
        }
        let oE = null,
            ox = new Set(["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"]);

        function oS(e) {
            return null == e || ox.has(e) ? e : (tY(!1, `"${e}" is not a valid \`encType\` for \`<Form>\`/\`<fetcher.Form>\` and will default to "${ow}"`), null)
        }
        let o_ = {
                "&": "\\u0026",
                ">": "\\u003e",
                "<": "\\u003c",
                "\u2028": "\\u2028",
                "\u2029": "\\u2029"
            },
            oP = /[&><\u2028\u2029]/g;

        function oC(e) {
            return e.replace(oP, e => o_[e])
        }

        function oL(e, t) {
            if (!1 === e || null == e) throw Error(t)
        }
        async function ok(e, t) {
            if (e.id in t) return t[e.id];
            try {
                let r = await
                import (e.module);
                return t[e.id] = r, r
            } catch (t) {
                if (console.error(`Error loading route module \`${e.module}\`, reloading page...`), console.error(t), window.__reactRouterContext && window.__reactRouterContext.isSpaMode &&
                    import.meta.hot) throw t;
                return window.location.reload(), new Promise(() => {})
            }
        }

        function oN(e) {
            return null != e && (null == e.href ? "preload" === e.rel && "string" == typeof e.imageSrcSet && "string" == typeof e.imageSizes : "string" == typeof e.rel && "string" == typeof e.href)
        }
        async function oT(e, t, r) {
            var n;
            let o, a;
            return n = (await Promise.all(e.map(async e => {
                let n = t.routes[e.route.id];
                if (n) {
                    let e = await ok(n, r);
                    return e.links ? e.links() : []
                }
                return []
            }))).flat(1).filter(oN).filter(e => "stylesheet" === e.rel || "preload" === e.rel).map(e => "stylesheet" === e.rel ? { ...e,
                rel: "prefetch",
                as: "style"
            } : { ...e,
                rel: "prefetch"
            }), o = new Set, a = new Set(void 0), n.reduce((e, t) => {
                !1;
                let r = JSON.stringify(function(e) {
                    let t = {};
                    for (let r of Object.keys(e).sort()) t[r] = e[r];
                    return t
                }(t));
                return o.has(r) || (o.add(r), e.push({
                    key: r,
                    link: t
                })), e
            }, [])
        }

        function oj(e, t, r, n, o, a) {
            let i = (e, t) => !r[t] || e.route.id !== r[t].route.id,
                s = (e, t) => r[t].pathname !== e.pathname || r[t].route.path ? .endsWith("*") && r[t].params["*"] !== e.params["*"];
            return "assets" === a ? t.filter((e, t) => i(e, t) || s(e, t)) : "data" === a ? t.filter((t, a) => {
                let l = n.routes[t.route.id];
                if (!l || !l.hasLoader) return !1;
                if (i(t, a) || s(t, a)) return !0;
                if (t.route.shouldRevalidate) {
                    let n = t.route.shouldRevalidate({
                        currentUrl: new URL(o.pathname + o.search + o.hash, window.origin),
                        currentParams: r[0] ? .params || {},
                        nextUrl: new URL(e, window.origin),
                        nextParams: t.params,
                        defaultShouldRevalidate: !0
                    });
                    if ("boolean" == typeof n) return n
                }
                return !0
            }) : []
        }

        function oA(e, t) {
            let r = "string" == typeof e ? new URL(e, "u" < typeof window ? "server://singlefetch/" : window.location.origin) : e;
            return r.pathname.endsWith("/") ? r.pathname = `${r.pathname}_.${t}` : r.pathname = `${r.pathname}.${t}`, r
        }
        Symbol("SingleFetchRedirect");
        let oD = i.createContext(void 0);

        function oI() {
            let e = i.useContext(oD);
            return oL(e, "You must render this element inside a <HydratedRouter> element"), e
        }

        function oM(e, t) {
            return r => {
                e && e(r), r.defaultPrevented || t(r)
            }
        }

        function oO({
            page: e,
            ...t
        }) {
            let r, n = nB(),
                {
                    nonce: o
                } = oI(),
                {
                    router: a
                } = (oL(r = i.useContext(n$), "You must render this element inside a <DataRouterContext.Provider> element"), r),
                s = i.useMemo(() => t9(a.routes, e, a.basename), [a.routes, e, a.basename]);
            return s ? (null == t.nonce && o && (t = { ...t,
                nonce: o
            }), n) ? i.createElement(o$, {
                page: e,
                matches: s,
                ...t
            }) : i.createElement(oF, {
                page: e,
                matches: s,
                ...t
            }) : null
        }

        function o$({
            page: e,
            matches: t,
            ...r
        }) {
            let n = nQ(),
                o = i.useMemo(() => {
                    if (e === n.pathname + n.search + n.hash) return [];
                    let r = oA(e, "rsc"),
                        o = !1,
                        a = [];
                    for (let e of t) "function" == typeof e.route.shouldRevalidate ? o = !0 : a.push(e.route.id);
                    return o && a.length > 0 && r.searchParams.set("_routes", a.join(",")), [r.pathname + r.search]
                }, [e, n, t]);
            return i.createElement(i.Fragment, null, o.map(e => i.createElement("link", {
                key: e,
                rel: "prefetch",
                as: "fetch",
                href: e,
                ...r
            })))
        }

        function oF({
            page: e,
            matches: t,
            ...r
        }) {
            let n, o = nQ(),
                {
                    manifest: a,
                    routeModules: s
                } = oI(),
                {
                    loaderData: l,
                    matches: u
                } = (oL(n = i.useContext(nF), "You must render this element inside a <DataRouterStateContext.Provider> element"), n),
                c = i.useMemo(() => oj(e, t, u, a, o, "data"), [e, t, u, a, o]),
                d = i.useMemo(() => oj(e, t, u, a, o, "assets"), [e, t, u, a, o]),
                h = i.useMemo(() => {
                    if (e === o.pathname + o.search + o.hash) return [];
                    let r = new Set,
                        n = !1;
                    if (t.forEach(e => {
                            let t = a.routes[e.route.id];
                            t && t.hasLoader && (!c.some(t => t.route.id === e.route.id) && e.route.id in l && s[e.route.id] ? .shouldRevalidate || t.hasClientLoader ? n = !0 : r.add(e.route.id))
                        }), 0 === r.size) return [];
                    let i = oA(e, "data");
                    return n && r.size > 0 && i.searchParams.set("_routes", t.filter(e => r.has(e.route.id)).map(e => e.route.id).join(",")), [i.pathname + i.search]
                }, [l, o, a, c, t, e, s]),
                f = i.useMemo(() => (function(e, t, {
                    includeHydrateFallback: r
                } = {}) {
                    return [...new Set(e.map(e => {
                        let n = t.routes[e.route.id];
                        if (!n) return [];
                        let o = [n.module];
                        return n.clientActionModule && (o = o.concat(n.clientActionModule)), n.clientLoaderModule && (o = o.concat(n.clientLoaderModule)), r && n.hydrateFallbackModule && (o = o.concat(n.hydrateFallbackModule)), n.imports && (o = o.concat(n.imports)), o
                    }).flat(1))]
                })(d, a), [d, a]),
                p = function(e) {
                    let {
                        manifest: t,
                        routeModules: r
                    } = oI(), [n, o] = i.useState([]);
                    return i.useEffect(() => {
                        let n = !1;
                        return oT(e, t, r).then(e => {
                            n || o(e)
                        }), () => {
                            n = !0
                        }
                    }, [e, t, r]), n
                }(d);
            return i.createElement(i.Fragment, null, h.map(e => i.createElement("link", {
                key: e,
                rel: "prefetch",
                as: "fetch",
                href: e,
                ...r
            })), f.map(e => i.createElement("link", {
                key: e,
                rel: "modulepreload",
                href: e,
                ...r
            })), p.map(({
                key: e,
                link: t
            }) => i.createElement("link", {
                key: e,
                nonce: r.nonce,
                ...t,
                crossOrigin: t.crossOrigin ? ? r.crossOrigin
            })))
        }
        oD.displayName = "FrameworkContext";
        let oU = "u" > typeof window && void 0 !== window.document && void 0 !== window.document.createElement;
        try {
            oU && (window.__reactRouterVersion = "8.3.0")
        } catch (e) {}

        function oB(e, t) {
            let r;
            return (function(e) {
                let t, r, n, o, a, i = e.window ? e.window : "u" > typeof window ? window : void 0,
                    s = void 0 !== i && void 0 !== i.document && void 0 !== i.document.createElement;
                tJ(e.routes.length > 0, "You must provide a non-empty routes array to createRouter");
                let l = e.hydrationRouteProperties || [],
                    u = e.mapRouteProperties,
                    c = u || (() => ({}));
                if (e.instrumentations) {
                    let t = e.instrumentations;
                    c = e => ({ ...u ? .(e),
                        ... function(e, t) {
                            var r, n, o, a;
                            let i = [],
                                s = [],
                                l = [],
                                u = [],
                                c = [],
                                d = [],
                                h = [];
                            e.forEach(e => e({
                                id: t.id,
                                index: t.index,
                                path: t.path,
                                instrument(e) {
                                    null != e.lazy && i.push(e.lazy), null != e["lazy.loader"] && s.push(e["lazy.loader"]), null != e["lazy.action"] && l.push(e["lazy.action"]), null != e["lazy.middleware"] && u.push(e["lazy.middleware"]), null != e.middleware && c.push(e.middleware), null != e.loader && d.push(e.loader), null != e.action && h.push(e.action)
                                }
                            }));
                            let f = {};
                            if ("function" == typeof t.lazy && i.length > 0) {
                                let e = t.lazy;
                                f.lazy = async (...t) => rM(await rO(i, void 0, () => e(...t), r$))
                            }
                            if ("object" == typeof t.lazy) {
                                let e = t.lazy;
                                if ("function" == typeof e.middleware && u.length > 0) {
                                    let t = e.middleware;
                                    f.lazy = Object.assign(f.lazy || {}, {
                                        middleware: async (...e) => rM(await rO(u, void 0, () => t(...e), r$))
                                    })
                                }
                                if ("function" == typeof e.loader && s.length > 0) {
                                    let t = e.loader;
                                    f.lazy = Object.assign(f.lazy || {}, {
                                        loader: async (...e) => rM(await rO(s, void 0, () => t(...e), r$))
                                    })
                                }
                                if ("function" == typeof e.action && l.length > 0) {
                                    let t = e.action;
                                    f.lazy = Object.assign(f.lazy || {}, {
                                        action: async (...e) => rM(await rO(l, void 0, () => t(...e), r$))
                                    })
                                }
                            }
                            if ("function" == typeof t.loader && d.length > 0) {
                                let e = rA(t.loader),
                                    o = async (...t) => rM(await rO(d, rF(t[0]), () => e(...t), r$));
                                !0 === e.hydrate && (o.hydrate = !0), r = o, n = e, r[rT] = n, f.loader = o
                            }
                            if ("function" == typeof t.action && h.length > 0) {
                                let e = rA(t.action),
                                    r = async (...t) => rM(await rO(h, rF(t[0]), () => e(...t), r$));
                                o = r, a = e, o[rT] = a, f.action = r
                            }
                            return t.middleware && t.middleware.length > 0 && c.length > 0 && (f.middleware = t.middleware.map(e => {
                                var t, r;
                                let n = rA(e),
                                    o = async (...e) => rM(await rO(c, rF(e[0]), () => n(...e), r$));
                                return t = o, r = n, t[rT] = r, o
                            })), f
                        }(t.map(e => e.route).filter(Boolean), e)
                    })
                }
                let d = {},
                    h = new rG(t5(e.routes, c, void 0, d)),
                    f = e.basename || "/";
                f.startsWith("/") || (f = `/${f}`);
                let p = e.dataStrategy || r8,
                    m = { ...e.future
                    },
                    y = null,
                    g = new Set,
                    v = null,
                    w = null,
                    b = null,
                    R = null,
                    E = null != e.hydrationData,
                    x = t7(h.activeRoutes, e.history.location, f, !1, h.branches),
                    S = !1,
                    _ = null;
                if (null != x || e.patchRoutesOnNavigation)
                    if (x && !e.hydrationData && ev(x, h.activeRoutes, e.history.location.pathname).active && (x = null), x)
                        if (x.some(e => e.route.lazy)) t = !1, r = !0;
                        else if (x.some(e => r1(e.route))) {
                    let n = e.hydrationData ? e.hydrationData.loaderData : null,
                        o = e.hydrationData ? e.hydrationData.errors : null,
                        a = x;
                    if (o) {
                        let e = x.findIndex(e => void 0 !== o[e.route.id]);
                        a = a.slice(0, e + 1)
                    }
                    r = !1, t = !0, a.forEach(e => {
                        let a = r2(e.route, n, o);
                        r = r || a.renderFallback, t = t && !a.shouldLoad
                    })
                } else t = !0, r = !1;
                else {
                    t = !1, r = !0, x = [];
                    let n = ev(null, h.activeRoutes, e.history.location.pathname);
                    n.active && n.matches && (S = !0, x = n.matches)
                } else {
                    let n = nR(404, {
                            pathname: e.history.location.pathname
                        }),
                        {
                            matches: o,
                            route: a
                        } = nb(h.activeRoutes);
                    t = !0, r = !1, x = o, _ = {
                        [a.id]: n
                    }
                }
                let P = {
                        historyAction: e.history.action,
                        location: e.history.location,
                        matches: x,
                        initialized: t,
                        renderFallback: r,
                        navigation: rV,
                        restoreScrollPosition: null == e.hydrationData && null,
                        preventScrollReset: !1,
                        revalidation: "idle",
                        loaderData: e.hydrationData && e.hydrationData.loaderData || {},
                        actionData: e.hydrationData && e.hydrationData.actionData || null,
                        errors: e.hydrationData && e.hydrationData.errors || _,
                        fetchers: new Map,
                        blockers: new Map
                    },
                    C = "POP",
                    L = null,
                    k = !1,
                    N = !1,
                    T = new Map,
                    j = null,
                    A = !1,
                    D = !1,
                    I = new Set,
                    M = new Map,
                    O = 0,
                    $ = -1,
                    F = new Map,
                    U = new Set,
                    B = new Map,
                    H = new Map,
                    z = new Set,
                    q = new Map,
                    W = null;

                function V(e, t = {}) {
                    e.matches && (e.matches = e.matches.map(e => {
                        let t = d[e.route.id],
                            r = e.route;
                        return r.element !== t.element || r.errorElement !== t.errorElement || r.hydrateFallbackElement !== t.hydrateFallbackElement ? { ...e,
                            route: t
                        } : e
                    }));
                    let r = [],
                        n = [];
                    (P = { ...P,
                        ...e
                    }).fetchers.forEach((e, t) => {
                        "idle" === e.state && (z.has(t) ? r.push(t) : n.push(t))
                    }), z.forEach(e => {
                        P.fetchers.has(e) || M.has(e) || r.push(e)
                    }), 0 === g.size && (v = {
                        newErrors: e.errors ? ? null
                    }), [...g].forEach(n => n(P, {
                        deletedFetchers: r,
                        newErrors: e.errors ? ? null,
                        viewTransitionOpts: t.viewTransitionOpts,
                        flushSync: !0 === t.flushSync
                    })), r.forEach(e => es(P.fetchers, e)), n.forEach(e => P.fetchers.delete(e))
                }

                function K(t, r, {
                    flushSync: n
                } = {}) {
                    let o, a, i = null != P.actionData && null != P.navigation.formMethod && nk(P.navigation.formMethod) && "loading" === P.navigation.state && t.state ? ._isRedirect !== !0;
                    o = r.actionData ? Object.keys(r.actionData).length > 0 ? r.actionData : null : i ? P.actionData : null;
                    let s = r.loaderData ? ng(P.loaderData, r.loaderData, r.matches || [], r.errors) : P.loaderData,
                        l = P.blockers;
                    l.size > 0 && !A && (l = new Map(l)).forEach((e, t) => l.set(t, rJ));
                    let u = !A && eg(t, r.matches || P.matches),
                        c = !0 === k || null != P.navigation.formMethod && nk(P.navigation.formMethod) && t.state ? ._isRedirect !== !0;
                    if (h.commitHmrRoutes(), A || "POP" === C || ("PUSH" === C ? e.history.push(t, t.state) : "REPLACE" === C && e.history.replace(t, t.state)), "POP" === C) {
                        let e = T.get(P.location.pathname);
                        e && e.has(t.pathname) ? a = {
                            currentLocation: P.location,
                            nextLocation: t
                        } : T.has(t.pathname) && (a = {
                            currentLocation: t,
                            nextLocation: P.location
                        })
                    } else if (N) {
                        let e = T.get(P.location.pathname);
                        e ? e.add(t.pathname) : (e = new Set([t.pathname]), T.set(P.location.pathname, e)), a = {
                            currentLocation: P.location,
                            nextLocation: t
                        }
                    }
                    V({ ...r,
                        actionData: o,
                        loaderData: s,
                        historyAction: C,
                        location: t,
                        initialized: !0,
                        renderFallback: !1,
                        navigation: rV,
                        revalidation: "idle",
                        restoreScrollPosition: u,
                        preventScrollReset: c,
                        blockers: l
                    }, {
                        viewTransitionOpts: a,
                        flushSync: !0 === n
                    }), C = "POP", k = !1, N = !1, A = !1, D = !1, L ? .resolve(), L = null, W ? .resolve(), W = null
                }
                async function J(t, r) {
                    let o;
                    if (L ? .resolve(), L = null, "number" == typeof t) {
                        L || (L = nO());
                        let r = L.promise;
                        return e.history.go(t), r
                    }
                    let a = rI(n),
                        {
                            path: i,
                            submission: s,
                            error: l
                        } = rZ(!1, rX(P.location, P.matches, f, t, r ? .fromRouteId, r ? .relative), r);
                    r ? .mask && (o = {
                        pathname: "",
                        search: "",
                        hash: "",
                        ..."string" == typeof r.mask ? tZ(r.mask) : { ...P.location.mask,
                            ...r.mask
                        }
                    });
                    let u = P.location,
                        c = tG(u, i, r && r.state, void 0, o);
                    c = { ...c,
                        ...e.history.encodeLocation(c)
                    };
                    let d = r && null != r.replace ? r.replace : void 0,
                        h = "PUSH";
                    !0 === d ? h = "REPLACE" : !1 === d || null != s && nk(s.formMethod) && s.formAction === P.location.pathname + P.location.search && (h = "REPLACE");
                    let p = r && "preventScrollReset" in r ? !0 === r.preventScrollReset : void 0,
                        m = !0 === (r && r.flushSync),
                        y = ep({
                            currentLocation: u,
                            nextLocation: c,
                            historyAction: h
                        });
                    y ? ef(y, {
                        state: "blocked",
                        location: c,
                        proceed() {
                            ef(y, {
                                state: "proceeding",
                                proceed: void 0,
                                reset: void 0,
                                location: c
                            }), J(t, r)
                        },
                        reset() {
                            let e = new Map(P.blockers);
                            e.set(y, rJ), V({
                                blockers: e
                            })
                        }
                    }) : await Y(h, c, {
                        submission: s,
                        pendingError: l,
                        preventScrollReset: p,
                        replace: r && r.replace,
                        enableViewTransition: r && r.viewTransition,
                        flushSync: m,
                        callSiteDefaultShouldRevalidate: r && r.defaultShouldRevalidate,
                        instrumentationNavigateMetaReceiver: a
                    })
                }
                async function Y(t, r, n) {
                    var a, i, s, l;
                    let u;
                    o && o.abort(), o = null, C = t, A = !0 === (n && n.startUninterruptedRevalidation), a = P.location, i = P.matches, w && R && (w[ey(a, i)] = R()), k = !0 === (n && n.preventScrollReset), N = !0 === (n && n.enableViewTransition);
                    let c = h.activeRoutes,
                        d = n ? .initialHydration && P.matches && P.matches.length > 0 && !S ? P.matches : t7(c, r, f, !1, h.branches),
                        p = !0 === (n && n.flushSync);
                    if (d && P.initialized && !D && (s = P.location, l = r, s.pathname === l.pathname && s.search === l.search && ("" === s.hash ? "" !== l.hash : s.hash === l.hash || "" !== l.hash || !1)) && !(n && n.submission && nk(n.submission.formMethod))) return void K(r, {
                        matches: d
                    }, {
                        flushSync: p
                    });
                    let m = ev(d, c, r.pathname);
                    if (m.active && m.matches && (d = m.matches), n ? .instrumentationNavigateMetaReceiver) {
                        let t = nj(e.history, r, d);
                        n.instrumentationNavigateMetaReceiver(t)
                    }
                    if (!d) {
                        let {
                            error: e,
                            notFoundMatches: t,
                            route: n
                        } = em(r.pathname);
                        K(r, {
                            matches: t,
                            loaderData: {},
                            errors: {
                                [n.id]: e
                            }
                        }, {
                            flushSync: p
                        });
                        return
                    }
                    let y = n && n.overrideNavigation ? { ...n.overrideNavigation,
                        matches: d,
                        historyAction: t
                    } : void 0;
                    o = new AbortController;
                    let g = nf(e.history, r, o.signal, n && n.submission),
                        v = e.getContext ? await e.getContext() : new t1;
                    if (n && n.pendingError) u = [nw(d).route.id, {
                        type: "error",
                        error: n.pendingError
                    }];
                    else if (n && n.submission && nk(n.submission.formMethod)) {
                        let a = await Q(g, r, n.submission, d, t, v, m.active, n && !0 === n.initialHydration, {
                            replace: n.replace,
                            flushSync: p
                        });
                        if (a.shortCircuited) return;
                        if (a.pendingActionResult) {
                            let [e, t] = a.pendingActionResult;
                            if (n_(t) && rP(t.error) && 404 === t.error.status) {
                                o = null, K(r, {
                                    matches: a.matches,
                                    loaderData: {},
                                    errors: {
                                        [e]: t.error
                                    }
                                });
                                return
                            }
                        }
                        d = a.matches || d, u = a.pendingActionResult, y = nD(r, d, t, n.submission), p = !1, m.active = !1, g = nf(e.history, g.url, g.signal)
                    }
                    let {
                        shortCircuited: b,
                        matches: E,
                        loaderData: x,
                        errors: _,
                        workingFetchers: L
                    } = await G(g, r, d, t, v, m.active, y, n && n.submission, n && n.fetcherSubmission, n && n.replace, n && !0 === n.initialHydration, p, u, n && n.callSiteDefaultShouldRevalidate);
                    b || (o = null, K(r, {
                        matches: E || d,
                        ...nv(u),
                        loaderData: x,
                        errors: _,
                        ...L ? {
                            fetchers: L
                        } : {}
                    }))
                }
                async function Q(t, r, n, o, a, i, s, u, p = {}) {
                    var m, y, g;
                    let v;
                    if (eo(), V({
                            navigation: (m = r, y = o, {
                                state: "submitting",
                                location: m,
                                matches: y,
                                historyAction: a,
                                formMethod: (g = n).formMethod,
                                formAction: g.formAction,
                                formEncType: g.formEncType,
                                formData: g.formData,
                                json: g.json,
                                text: g.text
                            })
                        }, {
                            flushSync: !0 === p.flushSync
                        }), s) {
                        let e = await ew(o, r.pathname, t.signal);
                        if ("aborted" === e.type) return {
                            shortCircuited: !0
                        };
                        if ("error" === e.type) {
                            if (0 === e.partialMatches.length) {
                                let {
                                    matches: t,
                                    route: r
                                } = nb(h.activeRoutes);
                                return {
                                    matches: t,
                                    pendingActionResult: [r.id, {
                                        type: "error",
                                        error: e.error
                                    }]
                                }
                            }
                            let t = nw(e.partialMatches).route.id;
                            return {
                                matches: e.partialMatches,
                                pendingActionResult: [t, {
                                    type: "error",
                                    error: e.error
                                }]
                            }
                        }
                        if (e.matches) o = e.matches;
                        else {
                            let {
                                notFoundMatches: e,
                                error: t,
                                route: n
                            } = em(r.pathname);
                            return {
                                matches: e,
                                pendingActionResult: [n.id, {
                                    type: "error",
                                    error: t
                                }]
                            }
                        }
                    }
                    let w = nT(o, r);
                    if (w.route.action || w.route.lazy) {
                        let e = await er(t, r, na(c, d, t, r, o, w, u ? [] : l, i), i, null);
                        if (!(v = e[w.route.id])) {
                            for (let t of o)
                                if (e[t.route.id]) {
                                    v = e[t.route.id];
                                    break
                                }
                        }
                        if (t.signal.aborted) return {
                            shortCircuited: !0
                        }
                    } else v = {
                        type: "error",
                        error: nR(405, {
                            method: t.method,
                            pathname: r.pathname,
                            routeId: w.route.id
                        })
                    };
                    if (nP(v)) {
                        let r;
                        return r = p && null != p.replace ? p.replace : nh(v.response.headers.get("Location"), new URL(t.url), f, e.history) === P.location.pathname + P.location.search, await et(t, v, !0, {
                            submission: n,
                            replace: r
                        }), {
                            shortCircuited: !0
                        }
                    }
                    if (n_(v)) {
                        let e = nw(o, w.route.id);
                        return !0 !== (p && p.replace) && (C = "PUSH"), {
                            matches: o,
                            pendingActionResult: [e.route.id, v, w.route.id]
                        }
                    }
                    return {
                        matches: o,
                        pendingActionResult: [w.route.id, v]
                    }
                }
                async function G(t, r, n, a, i, s, u, p, m, y, g, v, w, b) {
                    let R = u || nD(r, n, a, p),
                        E = p || m || nA(R),
                        x = !A && !g;
                    if (s) {
                        if (x) {
                            let e = X(w);
                            V({
                                navigation: R,
                                ...void 0 !== e ? {
                                    actionData: e
                                } : {}
                            }, {
                                flushSync: v
                            })
                        }
                        let e = await ew(n, r.pathname, t.signal);
                        if ("aborted" === e.type) return {
                            shortCircuited: !0
                        };
                        if ("error" === e.type) {
                            if (0 === e.partialMatches.length) {
                                let {
                                    matches: t,
                                    route: r
                                } = nb(h.activeRoutes);
                                return {
                                    matches: t,
                                    loaderData: {},
                                    errors: {
                                        [r.id]: e.error
                                    }
                                }
                            }
                            let t = nw(e.partialMatches).route.id;
                            return {
                                matches: e.partialMatches,
                                loaderData: {},
                                errors: {
                                    [t]: e.error
                                }
                            }
                        }
                        if (e.matches) n = e.matches;
                        else {
                            let {
                                error: e,
                                notFoundMatches: t,
                                route: n
                            } = em(r.pathname);
                            return {
                                matches: t,
                                loaderData: {},
                                errors: {
                                    [n.id]: e
                                }
                            }
                        }
                    }
                    let S = h.activeRoutes,
                        {
                            dsMatches: _,
                            revalidatingFetchers: C
                        } = r0(t, i, c, d, e.history, P, n, E, r, g ? [] : l, !0 === g, D, I, z, B, U, S, f, null != e.patchRoutesOnNavigation, h.branches, w, b);
                    if ($ = ++O, !e.dataStrategy && !_.some(e => e.shouldLoad) && !_.some(e => e.route.middleware && e.route.middleware.length > 0) && 0 === C.length) {
                        let e = new Map(P.fetchers),
                            t = ec(e);
                        return K(r, {
                            matches: n,
                            loaderData: {},
                            errors: w && n_(w[1]) ? {
                                [w[0]]: w[1].error
                            } : null,
                            ...nv(w),
                            ...t ? {
                                fetchers: e
                            } : {}
                        }, {
                            flushSync: v
                        }), {
                            shortCircuited: !0
                        }
                    }
                    if (x) {
                        var L;
                        let e, t = {};
                        if (!s) {
                            t.navigation = R;
                            let e = X(w);
                            void 0 !== e && (t.actionData = e)
                        }
                        C.length > 0 && (L = C, e = new Map(P.fetchers), L.forEach(t => {
                            let r = e.get(t.key),
                                n = nI(void 0, r ? r.data : void 0);
                            e.set(t.key, n)
                        }), t.fetchers = e), V(t, {
                            flushSync: v
                        })
                    }
                    C.forEach(e => {
                        el(e.key), e.controller && M.set(e.key, e.controller)
                    });
                    let k = () => C.forEach(e => el(e.key));
                    o && o.signal.addEventListener("abort", k);
                    let {
                        loaderResults: N,
                        fetcherResults: T
                    } = await en(_, C, t, r, i);
                    if (t.signal.aborted) return {
                        shortCircuited: !0
                    };
                    o && o.signal.removeEventListener("abort", k), C.forEach(e => M.delete(e.key));
                    let j = nE(N);
                    if (j) return await et(t, j.result, !0, {
                        replace: y
                    }), {
                        shortCircuited: !0
                    };
                    if (j = nE(T)) return U.add(j.key), await et(t, j.result, !0, {
                        replace: y
                    }), {
                        shortCircuited: !0
                    };
                    let F = new Map(P.fetchers),
                        {
                            loaderData: H,
                            errors: q
                        } = ny(P, n, N, w, C, T, F);
                    g && P.errors && (q = { ...P.errors,
                        ...q
                    });
                    let W = ec(F),
                        J = ed($, F);
                    return {
                        matches: n,
                        loaderData: H,
                        errors: q,
                        ...W || J || C.length > 0 ? {
                            workingFetchers: F
                        } : {}
                    }
                }

                function X(e) {
                    if (e && !n_(e[1])) return {
                        [e[0]]: e[1].data
                    };
                    if (P.actionData)
                        if (0 === Object.keys(P.actionData).length) return null;
                        else return P.actionData
                }
                async function Z(t, r, n, a, i, s, u, p, m, y) {
                    var g, v;
                    eo(), B.delete(t), ea(t, (g = m, v = P.fetchers.get(t), {
                        state: "submitting",
                        formMethod: g.formMethod,
                        formAction: g.formAction,
                        formEncType: g.formEncType,
                        formData: g.formData,
                        json: g.json,
                        text: g.text,
                        data: v ? v.data : void 0
                    }), {
                        flushSync: u
                    });
                    let w = new AbortController,
                        b = nf(e.history, n, w.signal, m);
                    if (s) {
                        let e = await ew(a, new URL(b.url).pathname, b.signal, t);
                        if ("aborted" === e.type) return;
                        if ("error" === e.type) return void ei(t, r, e.error, {
                            flushSync: u
                        });
                        if (!e.matches) return void ei(t, r, nR(404, {
                            pathname: n
                        }), {
                            flushSync: u
                        });
                        a = e.matches
                    }
                    let R = nT(a, n);
                    if (!R.route.action && !R.route.lazy) return void ei(t, r, nR(405, {
                        method: m.formMethod,
                        pathname: n,
                        routeId: r
                    }), {
                        flushSync: u
                    });
                    M.set(t, w);
                    let E = O,
                        x = na(c, d, b, n, a, R, l, i),
                        S = await er(b, n, x, i, t),
                        _ = S[R.route.id];
                    if (!_) {
                        for (let e of x)
                            if (S[e.route.id]) {
                                _ = S[e.route.id];
                                break
                            }
                    }
                    if (b.signal.aborted) {
                        M.get(t) === w && M.delete(t);
                        return
                    }
                    if (z.has(t)) {
                        if (nP(_) || n_(_)) return void ea(t, nM(void 0))
                    } else {
                        if (nP(_)) return (M.delete(t), $ > E) ? void ea(t, nM(void 0)) : (U.add(t), ea(t, nI(m)), et(b, _, !1, {
                            fetcherSubmission: m,
                            preventScrollReset: p
                        }));
                        if (n_(_)) return void ei(t, r, _.error)
                    }
                    let L = P.navigation.location || P.location,
                        k = nf(e.history, L, w.signal),
                        N = h.activeRoutes,
                        T = "idle" !== P.navigation.state ? t7(N, P.navigation.location, f, !1, h.branches) : P.matches;
                    tJ(T, "Didn't find any matches after fetcher action");
                    let j = ++O;
                    F.set(t, j);
                    let {
                        dsMatches: A,
                        revalidatingFetchers: H
                    } = r0(k, i, c, d, e.history, P, T, m, L, l, !1, D, I, z, B, U, N, f, null != e.patchRoutesOnNavigation, h.branches, [R.route.id, _], y), q = nI(m, _.data), W = new Map(P.fetchers);
                    W.set(t, q), H.filter(e => e.key !== t).forEach(e => {
                        let t = e.key,
                            r = W.get(t),
                            n = nI(void 0, r ? r.data : void 0);
                        W.set(t, n), el(t), e.controller && M.set(t, e.controller)
                    }), V({
                        fetchers: W
                    });
                    let J = () => H.forEach(e => el(e.key));
                    w.signal.addEventListener("abort", J);
                    let {
                        loaderResults: Y,
                        fetcherResults: Q
                    } = await en(A, H, k, L, i);
                    if (w.signal.aborted) return;
                    w.signal.removeEventListener("abort", J), F.delete(t), M.delete(t), H.forEach(e => M.delete(e.key));
                    let G = P.fetchers.has(t),
                        X = e => {
                            if (!G) return e;
                            let r = new Map(e.fetchers);
                            return r.set(t, nM(_.data)), { ...e,
                                fetchers: r
                            }
                        },
                        Z = nE(Y);
                    if (Z) return P = X(P), et(k, Z.result, !1, {
                        preventScrollReset: p
                    });
                    if (Z = nE(Q)) return U.add(Z.key), P = X(P), et(k, Z.result, !1, {
                        preventScrollReset: p
                    });
                    let ee = new Map(P.fetchers);
                    G && ee.set(t, nM(_.data));
                    let {
                        loaderData: es,
                        errors: eu
                    } = ny(P, T, Y, void 0, H, Q, ee);
                    ed(j, ee), "loading" === P.navigation.state && j > $ ? (tJ(C, "Expected pending action"), o && o.abort(), K(P.navigation.location, {
                        matches: T,
                        loaderData: es,
                        errors: eu,
                        fetchers: ee
                    })) : (V({
                        errors: eu,
                        loaderData: ng(P.loaderData, es, T, eu),
                        fetchers: ee
                    }), D = !1)
                }
                async function ee(t, r, n, o, a, i, s, u, h) {
                    let f = P.fetchers.get(t);
                    ea(t, nI(h, f ? f.data : void 0), {
                        flushSync: s
                    });
                    let p = new AbortController,
                        m = nf(e.history, n, p.signal);
                    if (i) {
                        let e = await ew(o, new URL(m.url).pathname, m.signal, t);
                        if ("aborted" === e.type) return;
                        if ("error" === e.type) return void ei(t, r, e.error, {
                            flushSync: s
                        });
                        if (!e.matches) return void ei(t, r, nR(404, {
                            pathname: n
                        }), {
                            flushSync: s
                        });
                        o = e.matches
                    }
                    let y = nT(o, n);
                    M.set(t, p);
                    let g = O,
                        v = await er(m, n, na(c, d, m, n, o, y, l, a), a, t),
                        w = v[y.route.id];
                    if (!w) {
                        for (let e of o)
                            if (v[e.route.id]) {
                                w = v[e.route.id];
                                break
                            }
                    }
                    if (M.get(t) === p && M.delete(t), !m.signal.aborted) {
                        if (z.has(t)) return void ea(t, nM(void 0));
                        if (nP(w))
                            if ($ > g) return void ea(t, nM(void 0));
                            else {
                                U.add(t), await et(m, w, !1, {
                                    preventScrollReset: u
                                });
                                return
                            }
                        if (n_(w)) return void ei(t, r, w.error);
                        ea(t, nM(w.data))
                    }
                }
                async function et(t, r, n, {
                    submission: a,
                    fetcherSubmission: l,
                    preventScrollReset: u,
                    replace: c
                } = {}) {
                    n || (L ? .resolve(), L = null), r.response.headers.has("X-Remix-Revalidate") && (D = !0);
                    let d = r.response.headers.get("Location");
                    tJ(d, "Expected a Location header on the redirect Response"), d = nh(d, new URL(t.url), f, e.history);
                    let h = tG(P.location, d, {
                        _isRedirect: !0
                    });
                    if (s) {
                        let e = !1;
                        if (r.response.headers.has("X-Remix-Reload-Document")) e = !0;
                        else {
                            let t;
                            if (t = d, tB.test(t)) {
                                let t = t0(i, d, !0);
                                e = t.origin !== i.location.origin || null == rc(t.pathname, f)
                            }
                        }
                        if (e) return void(c ? i.location.replace(d) : i.location.assign(d))
                    }
                    o = null;
                    let p = !0 === c || r.response.headers.has("X-Remix-Replace") ? "REPLACE" : "PUSH",
                        {
                            formMethod: m,
                            formAction: y,
                            formEncType: g
                        } = P.navigation;
                    !a && !l && m && y && g && (a = nA(P.navigation));
                    let v = a || l;
                    rW.has(r.response.status) && v && nk(v.formMethod) ? await Y(p, h, {
                        submission: { ...v,
                            formAction: d
                        },
                        preventScrollReset: u || k,
                        enableViewTransition: n ? N : void 0
                    }) : await Y(p, h, {
                        overrideNavigation: nD(h, [], p, a),
                        fetcherSubmission: l,
                        preventScrollReset: u || k,
                        enableViewTransition: n ? N : void 0
                    })
                }
                async function er(e, t, r, n, o) {
                    let a, i = {};
                    try {
                        a = await ni(p, e, t, r, o, n, !1)
                    } catch (e) {
                        return r.filter(e => e.shouldLoad).forEach(t => {
                            i[t.route.id] = {
                                type: "error",
                                error: e
                            }
                        }), i
                    }
                    if (e.signal.aborted) return i;
                    if (!nk(e.method))
                        for (let e of r) {
                            if (a[e.route.id] ? .type === "error") break;
                            !a.hasOwnProperty(e.route.id) && !P.loaderData.hasOwnProperty(e.route.id) && (!P.errors || !P.errors.hasOwnProperty(e.route.id)) && e.shouldCallHandler() && (a[e.route.id] = {
                                type: "error",
                                result: Error(`No result returned from dataStrategy for route ${e.route.id}`)
                            })
                        }
                    for (let [t, n] of Object.entries(a)) {
                        var s;
                        if (nL((s = n).result) && rq.has(s.result.status)) {
                            let o = n.result;
                            i[t] = {
                                type: "redirect",
                                response: function(e, t, r, n, o) {
                                    let a, i = e.headers.get("Location");
                                    if (tJ(i, "Redirects returned/thrown from loaders/actions must have a Location header"), a = i, !tB.test(a)) {
                                        let a = n.slice(0, n.findIndex(e => e.route.id === r) + 1);
                                        i = rX(new URL(t.url), a, o, i), e.headers.set("Location", i)
                                    }
                                    return e
                                }(o, e, t, r, f)
                            }
                        } else i[t] = await nu(n)
                    }
                    return i
                }
                async function en(e, t, r, n, o) {
                    let a = er(r, n, e, o, null),
                        i = Promise.all(t.map(async e => {
                            if (!e.matches || !e.match || !e.request || !e.controller) return Promise.resolve({
                                [e.key]: {
                                    type: "error",
                                    error: nR(404, {
                                        pathname: e.path
                                    })
                                }
                            }); {
                                let t = (await er(e.request, e.path, e.matches, o, e.key))[e.match.route.id];
                                return {
                                    [e.key]: t
                                }
                            }
                        }));
                    return {
                        loaderResults: await a,
                        fetcherResults: (await i).reduce((e, t) => Object.assign(e, t), {})
                    }
                }

                function eo() {
                    D = !0, B.forEach((e, t) => {
                        M.has(t) && I.add(t), el(t)
                    })
                }

                function ea(e, t, r = {}) {
                    let n = new Map(P.fetchers);
                    n.set(e, t), V({
                        fetchers: n
                    }, {
                        flushSync: !0 === (r && r.flushSync)
                    })
                }

                function ei(e, t, r, n = {}) {
                    let o = nw(P.matches, t),
                        a = new Map(P.fetchers);
                    es(a, e), V({
                        errors: {
                            [o.route.id]: r
                        },
                        fetchers: a
                    }, {
                        flushSync: !0 === (n && n.flushSync)
                    })
                }

                function es(e, t) {
                    let r = P.fetchers.get(t);
                    M.has(t) && !(r && "loading" === r.state && F.has(t)) && el(t), B.delete(t), F.delete(t), U.delete(t), z.delete(t), I.delete(t), e.delete(t)
                }

                function el(e, t) {
                    let r = M.get(e);
                    r && (r.abort(t), M.delete(e))
                }

                function eu(e, t) {
                    for (let r of e) {
                        let e = t.get(r);
                        tJ(e, `Expected fetcher: ${r}`);
                        let n = nM(e.data);
                        t.set(r, n)
                    }
                }

                function ec(e) {
                    let t = [],
                        r = !1;
                    for (let n of U) {
                        let o = e.get(n);
                        tJ(o, `Expected fetcher: ${n}`), "loading" === o.state && (U.delete(n), t.push(n), r = !0)
                    }
                    return eu(t, e), r
                }

                function ed(e, t) {
                    let r = [];
                    for (let [n, o] of F)
                        if (o < e) {
                            let e = t.get(n);
                            tJ(e, `Expected fetcher: ${n}`), "loading" === e.state && (el(n), F.delete(n), r.push(n))
                        }
                    return eu(r, t), r.length > 0
                }

                function eh(e) {
                    P.blockers.delete(e), q.delete(e)
                }

                function ef(e, t) {
                    let r = P.blockers.get(e) || rJ;
                    tJ("unblocked" === r.state && "blocked" === t.state || "blocked" === r.state && "blocked" === t.state || "blocked" === r.state && "proceeding" === t.state || "blocked" === r.state && "unblocked" === t.state || "proceeding" === r.state && "unblocked" === t.state, `Invalid blocker state transition: ${r.state} -> ${t.state}`);
                    let n = new Map(P.blockers);
                    n.set(e, t), V({
                        blockers: n
                    })
                }

                function ep({
                    currentLocation: e,
                    nextLocation: t,
                    historyAction: r
                }) {
                    if (0 === q.size) return;
                    q.size > 1 && tY(!1, "A router only supports one blocker at a time");
                    let n = Array.from(q.entries()),
                        [o, a] = n[n.length - 1],
                        i = P.blockers.get(o);
                    if ((!i || "proceeding" !== i.state) && a({
                            currentLocation: e,
                            nextLocation: t,
                            historyAction: r
                        })) return o
                }

                function em(e) {
                    let t = nR(404, {
                            pathname: e
                        }),
                        {
                            matches: r,
                            route: n
                        } = nb(h.activeRoutes);
                    return {
                        notFoundMatches: r,
                        route: n,
                        error: t
                    }
                }

                function ey(e, t) {
                    return b && b(e, t.map(e => t8(e, P.loaderData))) || e.key
                }

                function eg(e, t) {
                    if (w) {
                        let r = w[ey(e, t)];
                        if ("number" == typeof r) return r
                    }
                    return null
                }

                function ev(t, r, n) {
                    if (e.patchRoutesOnNavigation) {
                        let e = h.branches;
                        if (!t) return {
                            active: !0,
                            matches: t7(r, n, f, !0, e) || []
                        };
                        if (Object.keys(t[0].params).length > 0) return {
                            active: !0,
                            matches: t7(r, n, f, !0, e)
                        }
                    }
                    return {
                        active: !1,
                        matches: null
                    }
                }
                async function ew(t, r, n, o) {
                    if (!e.patchRoutesOnNavigation) return {
                        type: "success",
                        matches: t
                    };
                    let a = t;
                    for (;;) {
                        let t = d;
                        try {
                            await e.patchRoutesOnNavigation({
                                signal: n,
                                path: r,
                                matches: a,
                                fetcherKey: o,
                                patch: (e, r) => {
                                    n.aborted || r3(e, r, h, t, c, !1)
                                }
                            })
                        } catch (e) {
                            return {
                                type: "error",
                                error: e,
                                partialMatches: a
                            }
                        }
                        if (n.aborted) return {
                            type: "aborted"
                        };
                        let i = h.branches,
                            s = t7(h.activeRoutes, r, f, !1, i),
                            l = null;
                        if (s) {
                            if (0 === Object.keys(s[0].params).length) return {
                                type: "success",
                                matches: s
                            };
                            else if (!((l = t7(h.activeRoutes, r, f, !0, i)) && a.length < l.length && eb(a, l.slice(0, a.length)))) return {
                                type: "success",
                                matches: s
                            }
                        }
                        if (l || (l = t7(h.activeRoutes, r, f, !0, i)), !l || eb(a, l)) return {
                            type: "success",
                            matches: null
                        };
                        a = l
                    }
                }

                function eb(e, t) {
                    return e.length === t.length && e.every((e, r) => e.route.id === t[r].route.id)
                }
                return n = {
                    get basename() {
                        return f
                    },
                    get future() {
                        return m
                    },
                    get state() {
                        return P
                    },
                    get routes() {
                        return h.stableRoutes
                    },
                    get branches() {
                        return h.branches
                    },
                    get manifest() {
                        return d
                    },
                    get window() {
                        return i
                    },
                    initialize: function() {
                        if (y = e.history.listen(({
                                action: t,
                                location: r,
                                delta: n
                            }) => {
                                if (a) {
                                    a(), a = void 0;
                                    return
                                }
                                tY(0 === q.size || null != n, "You are trying to use a blocker on a POP navigation to a location that was not created by @remix-run/router. This will fail silently in production. This can happen if you are navigating outside the router via `window.history.pushState`/`window.location.hash` instead of using router navigation APIs.  This can also happen if you are using createHashRouter and the user manually changes the URL.");
                                let o = ep({
                                    currentLocation: P.location,
                                    nextLocation: r,
                                    historyAction: t
                                });
                                if (o && null != n) {
                                    let t = new Promise(e => {
                                        a = e
                                    });
                                    e.history.go(-1 * n), ef(o, {
                                        state: "blocked",
                                        location: r,
                                        proceed() {
                                            ef(o, {
                                                state: "proceeding",
                                                proceed: void 0,
                                                reset: void 0,
                                                location: r
                                            }), t.then(() => e.history.go(n))
                                        },
                                        reset() {
                                            let e = new Map(P.blockers);
                                            e.set(o, rJ), V({
                                                blockers: e
                                            })
                                        }
                                    }), L ? .resolve(), L = null;
                                    return
                                }
                                return Y(t, r)
                            }), s) {
                            var t = i,
                                r = T;
                            try {
                                let e = t.sessionStorage.getItem(rY);
                                if (e) {
                                    let t = JSON.parse(e);
                                    for (let [e, n] of Object.entries(t || {})) n && Array.isArray(n) && r.set(e, new Set(n || []))
                                }
                            } catch (e) {}
                            let e = () => (function(e, t) {
                                if (t.size > 0) {
                                    let r = {};
                                    for (let [e, n] of t) r[e] = [...n];
                                    try {
                                        e.sessionStorage.setItem(rY, JSON.stringify(r))
                                    } catch (e) {
                                        tY(!1, `Failed to save applied view transitions in sessionStorage (${e}).`)
                                    }
                                }
                            })(i, T);
                            i.addEventListener("pagehide", e), j = () => i.removeEventListener("pagehide", e)
                        }
                        return P.initialized || Y("POP", P.location, {
                            initialHydration: !0
                        }), n
                    },
                    subscribe: function(e) {
                        if (g.add(e), v) {
                            let {
                                newErrors: t
                            } = v;
                            v = null, e(P, {
                                deletedFetchers: [],
                                newErrors: t,
                                viewTransitionOpts: void 0,
                                flushSync: !1
                            })
                        }
                        return () => g.delete(e)
                    },
                    enableScrollRestoration: function(e, t, r) {
                        if (w = e, R = t, b = r || null, !E && P.navigation === rV) {
                            E = !0;
                            let e = eg(P.location, P.matches);
                            null != e && V({
                                restoreScrollPosition: e
                            })
                        }
                        return () => {
                            w = null, R = null, b = null
                        }
                    },
                    navigate: J,
                    fetch: async function t(t, r, o, a) {
                        el(t);
                        let i = !0 === (a && a.flushSync),
                            s = rI(n),
                            l = h.activeRoutes,
                            u = rX(P.location, P.matches, f, o, r, a ? .relative),
                            c = t7(l, u, f, !1, h.branches),
                            d = ev(c, l, u);
                        if (d.active && d.matches && (c = d.matches), s && s(nj(e.history, u, c)), !c) return void ei(t, r, nR(404, {
                            pathname: u
                        }), {
                            flushSync: i
                        });
                        let {
                            path: p,
                            submission: m,
                            error: y
                        } = rZ(!0, u, a);
                        if (y) return void ei(t, r, y, {
                            flushSync: i
                        });
                        let g = e.getContext ? await e.getContext() : new t1,
                            v = !0 === (a && a.preventScrollReset);
                        m && nk(m.formMethod) ? await Z(t, r, p, c, g, d.active, i, v, m, a && a.defaultShouldRevalidate) : (B.set(t, {
                            routeId: r,
                            path: p
                        }), await ee(t, r, p, c, g, d.active, i, v, m))
                    },
                    revalidate: function() {
                        W || (W = nO()), eo(), V({
                            revalidation: "loading"
                        });
                        let e = W.promise;
                        return "submitting" === P.navigation.state || ("idle" === P.navigation.state ? Y(P.historyAction, P.location, {
                            startUninterruptedRevalidation: !0
                        }) : Y(C || P.historyAction, P.navigation.location, {
                            overrideNavigation: P.navigation,
                            enableViewTransition: !0 === N
                        })), e
                    },
                    createHref: t => e.history.createHref(t),
                    encodeLocation: t => e.history.encodeLocation(t),
                    getFetcher: function(e) {
                        return H.set(e, (H.get(e) || 0) + 1), z.has(e) && z.delete(e), P.fetchers.get(e) || rK
                    },
                    resetFetcher: function(e, t) {
                        el(e, t ? .reason), ea(e, nM(null))
                    },
                    deleteFetcher: function(e) {
                        let t = (H.get(e) || 0) - 1;
                        t <= 0 ? (H.delete(e), z.add(e)) : H.set(e, t), V({
                            fetchers: new Map(P.fetchers)
                        })
                    },
                    dispose: function() {
                        y && y(), j && j(), g.clear(), o && o.abort(), P.fetchers.forEach((e, t) => es(P.fetchers, t)), P.blockers.forEach((e, t) => eh(t))
                    },
                    getBlocker: function(e, t) {
                        let r = P.blockers.get(e) || rJ;
                        return q.get(e) !== t && q.set(e, t), r
                    },
                    deleteBlocker: eh,
                    patchRoutes: function(e, t, r = !1) {
                        r3(e, t, h, d, c, r), h.hasHMRRoutes || V({})
                    },
                    _internalFetchControllers: M,
                    _internalSetRoutes: function(e) {
                        d = {}, h.setHmrRoutes(t5(e, c, void 0, d))
                    },
                    _internalSetStateDoNotUseOrYouWillBreakYourApp(e) {
                        V(e)
                    }
                }, e.instrumentations && (n = function(e, t) {
                    var r, n, o, a;
                    let i = [],
                        s = [];
                    if (t.forEach(e => e({
                            instrument(e) {
                                null != e.navigate && i.push(e.navigate), null != e.fetch && s.push(e.fetch)
                            }
                        })), i.length > 0) {
                        let t = rA(e.navigate),
                            o = async (...r) => {
                                let n, [o, a] = r,
                                    s = {
                                        to: "number" == typeof o || "string" == typeof o ? o : o ? tX(o) : ".",
                                        ...rU(e, a ? ? {})
                                    };
                                return rM(await rO(i, s, async () => {
                                    if ("number" == typeof o) return await t(...r);
                                    let a = rD(e, e => {
                                        n = e
                                    });
                                    try {
                                        return await t(...r)
                                    } finally {
                                        a()
                                    }
                                }, e => ({ ...r$(e),
                                    meta: n
                                })))
                            };
                        r = o, n = t, r[rT] = n, e.navigate = o
                    }
                    if (s.length > 0) {
                        let t = rA(e.fetch),
                            r = async (...r) => {
                                let n, [o, a, i, l] = r;
                                return rM(await rO(s, {
                                    href: i ? ? ".",
                                    fetcherKey: o,
                                    ...rU(e, l ? ? {})
                                }, async () => {
                                    let o = rD(e, e => {
                                        n = e
                                    });
                                    try {
                                        return await t(...r)
                                    } finally {
                                        o()
                                    }
                                }, e => ({ ...r$(e),
                                    meta: n
                                })))
                            };
                        o = r, a = t, o[rT] = a, e.fetch = r
                    }
                    return e
                }(n, e.instrumentations.map(e => e.router).filter(Boolean))), n
            })({
                basename: t ? .basename,
                getContext: t ? .getContext,
                future: t ? .future,
                history: tK({
                    window: t ? .window
                }),
                hydrationData: t ? .hydrationData || ((r = window ? .__staticRouterHydrationData) && r.errors && (r = { ...r,
                    errors: function(e) {
                        if (!e) return null;
                        let t = Object.entries(e),
                            r = {};
                        for (let [e, n] of t)
                            if (n && "RouteErrorResponse" === n.__type) r[e] = new r_(n.status, n.statusText, n.data, !0 === n.internal);
                            else if (n && "Error" === n.__type) {
                            if ("string" == typeof n.__subType && rS.includes(n.__subType)) {
                                let t = window[n.__subType];
                                if ("function" == typeof t) try {
                                    let o = new t(n.message);
                                    o.stack = "", r[e] = o
                                } catch (e) {}
                            }
                            if (null == r[e]) {
                                let t = Error(n.message);
                                t.stack = "", r[e] = t
                            }
                        } else r[e] = n;
                        return r
                    }(r.errors)
                }), r),
                routes: e,
                mapRouteProperties: t3,
                hydrationRouteProperties: ou,
                dataStrategy: t ? .dataStrategy,
                patchRoutesOnNavigation: t ? .patchRoutesOnNavigation,
                window: t ? .window,
                instrumentations: t ? .instrumentations
            }).initialize()
        }

        function oH({
            basename: e,
            children: t,
            useTransitions: r,
            window: n
        }) {
            let o = i.useRef(null);
            null == o.current && (o.current = tK({
                window: n,
                v5Compat: !0
            }));
            let a = o.current,
                [s, l] = i.useState({
                    action: a.action,
                    location: a.location
                }),
                u = i.useCallback(e => {
                    !1 === r ? l(e) : i.startTransition(() => l(e))
                }, [r]);
            return i.useLayoutEffect(() => a.listen(u), [a, u]), i.createElement(og, {
                basename: e,
                children: t,
                location: s.location,
                navigationType: s.action,
                navigator: a,
                useTransitions: r
            })
        }
        let oz = i.forwardRef(function({
            onClick: e,
            discover: t = "render",
            prefetch: r = "none",
            relative: n,
            reloadDocument: o,
            replace: a,
            mask: s,
            state: l,
            target: u,
            to: c,
            preventScrollReset: d,
            viewTransition: h,
            defaultShouldRevalidate: f,
            ...p
        }, m) {
            let {
                basename: y,
                navigator: g,
                useTransitions: v
            } = i.useContext(nq), w = "string" == typeof c && tB.test(c), b = rN(c, y), R = function(e, {
                relative: t
            } = {}) {
                tJ(nY(), "useHref() may be used only in the context of a <Router> component.");
                let {
                    basename: r,
                    navigator: n
                } = i.useContext(nq), {
                    hash: o,
                    pathname: a,
                    search: s
                } = n0(e, {
                    relative: t
                }), l = a;
                return "/" !== r && (l = "/" === a ? r : rv([r, a])), n.createHref({
                    pathname: l,
                    search: s,
                    hash: o
                })
            }(c = b.to, {
                relative: n
            }), E = nQ(), x = null;
            if (s) {
                let e = ry(s, [], E.mask ? E.mask.pathname : "/", !0);
                "/" !== y && (e.pathname = "/" === e.pathname ? y : rv([y, e.pathname])), x = g.createHref(e)
            }
            let [S, _, P] = function(e, t) {
                let r = i.useContext(oD),
                    [n, o] = i.useState(!1),
                    [a, s] = i.useState(!1),
                    {
                        onFocus: l,
                        onBlur: u,
                        onMouseEnter: c,
                        onMouseLeave: d,
                        onTouchStart: h
                    } = t,
                    f = i.useRef(null);
                i.useEffect(() => {
                    if ("render" === e && s(!0), "viewport" === e) {
                        let e = new IntersectionObserver(e => {
                            e.forEach(e => {
                                s(e.isIntersecting)
                            })
                        }, {
                            threshold: .5
                        });
                        return f.current && e.observe(f.current), () => {
                            e.disconnect()
                        }
                    }
                }, [e]), i.useEffect(() => {
                    if (n) {
                        let e = setTimeout(() => {
                            s(!0)
                        }, 100);
                        return () => {
                            clearTimeout(e)
                        }
                    }
                }, [n]);
                let p = () => {
                        o(!0)
                    },
                    m = () => {
                        o(!1), s(!1)
                    };
                return r ? "intent" !== e ? [a, f, {}] : [a, f, {
                    onFocus: oM(l, p),
                    onBlur: oM(u, m),
                    onMouseEnter: oM(c, p),
                    onMouseLeave: oM(d, m),
                    onTouchStart: oM(h, p)
                }] : [!1, f, {}]
            }(r, p), C = oJ(c, {
                replace: a,
                mask: s,
                state: l,
                target: u,
                preventScrollReset: d,
                relative: n,
                viewTransition: h,
                defaultShouldRevalidate: f,
                useTransitions: v
            }), L = !(b.isExternal || o), k = i.createElement("a", { ...p,
                ...P,
                href: (L ? x : void 0) || b.absoluteURL || R,
                onClick: L ? function(t) {
                    e && e(t), t.defaultPrevented || C(t)
                } : e,
                ref: function(...e) {
                    return t => {
                        e.forEach(e => {
                            "function" == typeof e ? e(t) : null != e && (e.current = t)
                        })
                    }
                }(m, _),
                target: u,
                "data-discover": w || "render" !== t ? void 0 : "true"
            });
            return S && !w ? i.createElement(i.Fragment, null, k, i.createElement(oO, {
                page: R
            })) : k
        });
        oz.displayName = "Link";
        let oq = i.forwardRef(function({
            "aria-current": e = "page",
            caseSensitive: t = !1,
            className: r = "",
            end: n = !1,
            style: o,
            to: a,
            viewTransition: s,
            children: l,
            ...u
        }, c) {
            let d, h = n0(a, {
                    relative: u.relative
                }),
                f = nQ(),
                p = i.useContext(nF),
                {
                    navigator: m,
                    basename: y
                } = i.useContext(nq),
                g = null != p && function(e, {
                    relative: t
                } = {}) {
                    let r = i.useContext(nH);
                    tJ(null != r, "`useViewTransitionState` must be used within `react-router/dom`'s `RouterProvider`.  Did you accidentally import `RouterProvider` from `react-router`?");
                    let {
                        basename: n
                    } = oK("useViewTransitionState"), o = n0(e, {
                        relative: t
                    });
                    if (!r.isTransitioning) return !1;
                    let a = rc(r.currentLocation.pathname, n) || r.currentLocation.pathname,
                        s = rc(r.nextLocation.pathname, n) || r.nextLocation.pathname;
                    return null != ri(o.pathname, s) || null != ri(o.pathname, a)
                }(h) && !0 === s,
                v = m.encodeLocation ? m.encodeLocation(h).pathname : h.pathname,
                w = f.pathname,
                b = p && p.navigation && p.navigation.location ? p.navigation.location.pathname : null;
            t || (w = w.toLowerCase(), b = b ? b.toLowerCase() : null, v = v.toLowerCase()), b && y && (b = rc(b, y) || b);
            let R = "/" !== v && v.endsWith("/") ? v.length - 1 : v.length,
                E = w === v || !n && w.startsWith(v) && "/" === w.charAt(R),
                x = null != b && (b === v || !n && b.startsWith(v) && "/" === b.charAt(R)),
                S = {
                    isActive: E,
                    isPending: x,
                    isTransitioning: g
                },
                _ = E ? e : void 0;
            d = "function" == typeof r ? r(S) : [r, E ? "active" : null, x ? "pending" : null, g ? "transitioning" : null].filter(Boolean).join(" ");
            let P = "function" == typeof o ? o(S) : o;
            return i.createElement(oz, { ...u,
                "aria-current": _,
                className: d,
                ref: c,
                style: P,
                to: a,
                viewTransition: s
            }, "function" == typeof l ? l(S) : l)
        });

        function oW({
            getKey: e,
            storageKey: t,
            ...r
        }) {
            let n = i.useContext(oD),
                {
                    basename: o
                } = i.useContext(nq),
                a = nQ(),
                s = on();
            ! function({
                getKey: e,
                storageKey: t
            } = {}) {
                let r, {
                        router: n
                    } = oK("useScrollRestoration"),
                    {
                        restoreScrollPosition: o,
                        preventScrollReset: a
                    } = (tJ(r = i.useContext(nF), oV("useScrollRestoration")), r),
                    {
                        basename: s
                    } = i.useContext(nq),
                    l = nQ(),
                    u = on(),
                    c = or();
                i.useEffect(() => (window.history.scrollRestoration = "manual", () => {
                        window.history.scrollRestoration = "auto"
                    }), []),
                    function(e) {
                        let {
                            capture: t
                        } = {};
                        i.useEffect(() => {
                            let r = null != t ? {
                                capture: t
                            } : void 0;
                            return window.addEventListener("pagehide", e, r), () => {
                                window.removeEventListener("pagehide", e, r)
                            }
                        }, [e, t])
                    }(i.useCallback(() => {
                        "idle" === c.state && (oX[oZ(l, u, s, e)] = window.scrollY);
                        try {
                            sessionStorage.setItem(t || oG, JSON.stringify(oX))
                        } catch (e) {
                            tY(!1, `Failed to save scroll positions in sessionStorage, <ScrollRestoration /> will not work properly (${e}).`)
                        }
                        window.history.scrollRestoration = "auto"
                    }, [c.state, e, s, l, u, t])), "u" > typeof document && (i.useLayoutEffect(() => {
                        try {
                            let e = sessionStorage.getItem(t || oG);
                            e && (oX = JSON.parse(e))
                        } catch (e) {}
                    }, [t]), i.useLayoutEffect(() => {
                        let t = n ? .enableScrollRestoration(oX, () => window.scrollY, e ? (t, r) => oZ(t, r, s, e) : void 0);
                        return () => t && t()
                    }, [n, s, e]), i.useLayoutEffect(() => {
                        if (!1 !== o) {
                            if ("number" == typeof o) return void window.scrollTo(0, o);
                            try {
                                if (l.hash) {
                                    let e = document.getElementById(decodeURIComponent(l.hash.slice(1)));
                                    if (e) return void e.scrollIntoView()
                                }
                            } catch {
                                tY(!1, `"${l.hash.slice(1)}" is not a decodable element ID. The view will not scroll to it.`)
                            }!0 !== a && window.scrollTo(0, 0)
                        }
                    }, [l, o, a]))
            }({
                getKey: e,
                storageKey: t
            });
            let l = i.useMemo(() => {
                if (!n || !e) return null;
                let t = oZ(a, s, o, e);
                return t !== a.key ? t : null
            }, []);
            if (!n || n.isSpaMode) return null;
            let u = ((e, t) => {
                if (!window.history.state || !window.history.state.key) {
                    let e = Math.random().toString(32).slice(2);
                    window.history.replaceState({
                        key: e
                    }, "")
                }
                try {
                    let r = JSON.parse(sessionStorage.getItem(e) || "{}")[t || window.history.state.key];
                    "number" == typeof r && window.scrollTo(0, r)
                } catch (t) {
                    console.error(t), sessionStorage.removeItem(e)
                }
            }).toString();
            return null == r.nonce && n ? .nonce && (r.nonce = n.nonce), i.createElement("script", { ...r,
                suppressHydrationWarning: !0,
                dangerouslySetInnerHTML: {
                    __html: `(${u})(${oC(JSON.stringify(t||oG))}, ${oC(JSON.stringify(l))})`
                }
            })
        }

        function oV(e) {
            return `${e} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`
        }

        function oK(e) {
            let t = i.useContext(n$);
            return tJ(t, oV(e)), t
        }

        function oJ(e, {
            target: t,
            replace: r,
            mask: n,
            state: o,
            preventScrollReset: a,
            relative: s,
            viewTransition: l,
            defaultShouldRevalidate: u,
            useTransitions: c
        } = {}) {
            let d = nX(),
                h = nQ(),
                f = n0(e, {
                    relative: s
                });
            return i.useCallback(p => {
                if (0 === p.button && (!t || "_self" === t) && !(p.metaKey || p.altKey || p.ctrlKey || p.shiftKey)) {
                    p.preventDefault();
                    let t = void 0 !== r ? r : tX(h) === tX(f),
                        m = () => d(e, {
                            replace: t,
                            mask: n,
                            state: o,
                            preventScrollReset: a,
                            relative: s,
                            viewTransition: l,
                            defaultShouldRevalidate: u
                        });
                    c ? i.startTransition(() => m()) : m()
                }
            }, [h, d, f, r, n, o, t, e, a, s, l, u, c])
        }

        function oY(e) {
            tY("u" > typeof URLSearchParams, "You cannot use the `useSearchParams` hook in a browser that does not support the URLSearchParams API. If you need to support Internet Explorer 11, we recommend you load a polyfill such as https://github.com/ungap/url-search-params.");
            let t = i.useRef(oR(e)),
                r = i.useRef(!1),
                n = nQ(),
                o = i.useMemo(() => {
                    var e, o;
                    let a;
                    return e = n.search, o = r.current ? null : t.current, a = oR(e), o && o.forEach((e, t) => {
                        a.has(t) || o.getAll(t).forEach(e => {
                            a.append(t, e)
                        })
                    }), a
                }, [n.search]),
                a = nX();
            return [o, i.useCallback((e, t) => {
                let n = oR("function" == typeof e ? e(new URLSearchParams(o)) : e);
                r.current = !0, a("?" + n, t)
            }, [a, o])]
        }
        oq.displayName = "NavLink", i.forwardRef(({
            discover: e = "render",
            fetcherKey: t,
            navigate: r,
            reloadDocument: n,
            replace: o,
            state: a,
            method: s = "get",
            action: l,
            onSubmit: u,
            relative: c,
            preventScrollReset: d,
            viewTransition: h,
            defaultShouldRevalidate: f,
            ...p
        }, m) => {
            let {
                useTransitions: y
            } = i.useContext(nq), g = function() {
                let {
                    router: e
                } = oK("useSubmit"), {
                    basename: t
                } = i.useContext(nq), r = ot("useRouteId"), n = e.fetch, o = e.navigate;
                return i.useCallback(async (e, a = {}) => {
                    let {
                        action: i,
                        method: s,
                        encType: l,
                        formData: u,
                        body: c
                    } = function(e, t) {
                        let r, n, o, a, i;
                        if (ob(e) && "form" === e.tagName.toLowerCase()) {
                            let i = e.getAttribute("action");
                            n = i ? rc(i, t) : null, r = e.getAttribute("method") || "get", o = oS(e.getAttribute("enctype")) || ow, a = new FormData(e)
                        } else if (ob(e) && "button" === e.tagName.toLowerCase() || ob(e) && "input" === e.tagName.toLowerCase() && ("submit" === e.type || "image" === e.type)) {
                            let i = e.form;
                            if (null == i) throw Error('Cannot submit a <button> or <input type="submit"> without a <form>');
                            let s = e.getAttribute("formaction") || i.getAttribute("action");
                            if (n = s ? rc(s, t) : null, r = e.getAttribute("formmethod") || i.getAttribute("method") || "get", o = oS(e.getAttribute("formenctype")) || oS(i.getAttribute("enctype")) || ow, a = new FormData(i, e), ! function() {
                                    if (null === oE) try {
                                        new FormData(document.createElement("form"), 0), oE = !1
                                    } catch (e) {
                                        oE = !0
                                    }
                                    return oE
                                }()) {
                                let {
                                    name: t,
                                    type: r,
                                    value: n
                                } = e;
                                if ("image" === r) {
                                    let e = t ? `${t}.` : "";
                                    a.append(`${e}x`, "0"), a.append(`${e}y`, "0")
                                } else t && a.append(t, n)
                            }
                        } else if (ob(e)) throw Error('Cannot submit element that is not <form>, <button>, or <input type="submit|image">');
                        else r = "get", n = null, o = ow, i = e;
                        return a && "text/plain" === o && (i = a, a = void 0), {
                            action: n,
                            method: r.toLowerCase(),
                            encType: o,
                            formData: a,
                            body: i
                        }
                    }(e, t);
                    !1 === a.navigate ? await n(a.fetcherKey || `__${String(++oQ)}__`, r, a.action || i, {
                        defaultShouldRevalidate: a.defaultShouldRevalidate,
                        preventScrollReset: a.preventScrollReset,
                        formData: u,
                        body: c,
                        formMethod: a.method || s,
                        formEncType: a.encType || l,
                        flushSync: a.flushSync
                    }) : await o(a.action || i, {
                        defaultShouldRevalidate: a.defaultShouldRevalidate,
                        preventScrollReset: a.preventScrollReset,
                        formData: u,
                        body: c,
                        formMethod: a.method || s,
                        formEncType: a.encType || l,
                        replace: a.replace,
                        state: a.state,
                        fromRouteId: r,
                        flushSync: a.flushSync,
                        viewTransition: a.viewTransition
                    })
                }, [n, o, t, r])
            }(), v = function(e, {
                relative: t
            } = {}) {
                let {
                    basename: r
                } = i.useContext(nq), n = i.useContext(nV);
                tJ(n, "useFormAction must be used inside a RouteContext");
                let [o] = n.matches.slice(-1), a = { ...n0(e || ".", {
                        relative: t
                    })
                }, s = nQ();
                if (null == e) {
                    a.search = s.search;
                    let e = new URLSearchParams(a.search),
                        t = e.getAll("index");
                    if (t.some(e => "" === e)) {
                        e.delete("index"), t.filter(e => e).forEach(t => e.append("index", t));
                        let r = e.toString();
                        a.search = r ? `?${r}` : ""
                    }
                }
                return (!e || "." === e) && o.route.index && (a.search = a.search ? a.search.replace(/^\?/, "?index&") : "?index"), "/" !== r && (a.pathname = "/" === a.pathname ? r : rv([r, a.pathname])), tX(a)
            }(l, {
                relative: c
            }), w = "get" === s.toLowerCase() ? "get" : "post", b = "string" == typeof l && tB.test(l);
            return i.createElement("form", {
                ref: m,
                method: w,
                action: v,
                onSubmit: n ? u : e => {
                    if (u && u(e), e.defaultPrevented) return;
                    e.preventDefault();
                    let n = e.nativeEvent.submitter,
                        l = n ? .getAttribute("formmethod") || s,
                        p = () => g(n || e.currentTarget, {
                            fetcherKey: t,
                            method: l,
                            navigate: r,
                            replace: o,
                            state: a,
                            relative: c,
                            preventScrollReset: d,
                            viewTransition: h,
                            defaultShouldRevalidate: f
                        });
                    y && !1 !== r ? i.startTransition(() => p()) : p()
                },
                ...p,
                "data-discover": b || "render" !== e ? void 0 : "true"
            })
        }).displayName = "Form", oW.displayName = "ScrollRestoration";
        let oQ = 0,
            oG = "react-router-scroll-positions",
            oX = {};

        function oZ(e, t, r, n) {
            let o = null;
            return n && (o = n("/" !== r ? { ...e,
                pathname: rc(e.pathname, r) || e.pathname
            } : e, t)), null == o && (o = e.key), o
        }

        function o0(e, t) {
            let {
                capture: r
            } = t || {};
            i.useEffect(() => {
                let t = null != r ? {
                    capture: r
                } : void 0;
                return window.addEventListener("beforeunload", e, t), () => {
                    window.removeEventListener("beforeunload", e, t)
                }
            }, [e, r])
        }
        var o1 = r(920229),
            o2 = r(191968);
        let o4 = (0, i.createContext)({
            routes: []
        });
        o4.displayName = "RoutesContext";
        let o3 = () => {
            let {
                routes: e
            } = (0, i.use)(o4), t = nX();
            return (0, i.useCallback)((n, o = {}) => {
                if (!t9(e, rd(n).pathname) || o.reloadDocument) {
                    let e = "string" == typeof n ? n : tX(n);
                    o.preventTurbo ? window.location.href = e : (async () => {
                        let {
                            softNavigate: t
                        } = await r.e(55096).then(r.bind(r, 737131));
                        t(e)
                    })()
                } else {
                    (0, o1.A)(location.href, n.toString()) || (0, o2.SC)("react");
                    let {
                        preventAutofocus: e,
                        ...r
                    } = o;
                    t(n, e ? { ...r,
                        state: {
                            [te]: !0,
                            ...r.state
                        }
                    } : r)
                }
            }, [t, e])
        };

        function o5() {
            let e, t = (0, e7.c)(2),
                {
                    routes: r
                } = (0, i.use)(o4);
            return t[0] !== r ? (e = e => {
                let t, n;
                try {
                    let r = new URL(e, tw.fV.origin);
                    t = r.pathname, n = r.searchParams
                } catch {
                    return !1
                }
                let o = t9(r, t);
                if (!o) return !1;
                let a = !1;
                for (let e of o) {
                    let t = e.route.handle ? .queryRoute;
                    if (t) {
                        let r = e.params ? ? {};
                        t.preload(r, n), a = !0
                    }
                }
                return a
            }, t[0] = r, t[1] = e) : e = t[1], e
        }
        let o6 = {
                rootMargin: "100px"
            },
            o9 = new WeakMap,
            o7 = new WeakMap,
            o8 = {};

        function ae(e) {
            let t, r, o, a, s, l, u, c, d, h, f = (0, e7.c)(31),
                {
                    to: p,
                    preload: m,
                    disabled: y,
                    preloadDelay: g
                } = e,
                v = void 0 !== m && m,
                w = void 0 === g ? 100 : g,
                b = o5();
            f[0] !== p ? (t = "string" == typeof p ? p : tX(p), f[0] = p, f[1] = t) : t = f[1];
            let R = t;
            f[2] !== R || f[3] !== b ? (r = () => {
                b(R)
            }, f[2] = R, f[3] = b, f[4] = r) : r = f[4];
            let E = r,
                x = (0, i.useRef)(!1);
            f[5] !== y || f[6] !== E || f[7] !== v ? (o = () => {
                y || "render" !== v || x.current || (x.current = !0, E())
            }, a = [y, v, E], f[5] = y, f[6] = E, f[7] = v, f[8] = o, f[9] = a) : (o = f[8], a = f[9]), (0, i.useEffect)(o, a);
            let [S, _] = (0, i.useState)(null);
            if (f[10] !== y || f[11] !== E || f[12] !== v || f[13] !== S ? (s = () => {
                    if (!y && "viewport" === v && S) {
                        let e;
                        return (e = function() {
                            if ("u" > typeof IntersectionObserver) return n || (n = new IntersectionObserver(e => {
                                for (let t of e) {
                                    if (!t.isIntersecting) continue;
                                    let e = o9.get(t.target);
                                    e && (o9.delete(t.target), n ? .unobserve(t.target), e())
                                }
                            }, o6)), n
                        }()) ? (o9.set(S, E), e.observe(S), () => {
                            o9.delete(S), e.unobserve(S)
                        }) : () => {}
                    }
                }, l = [y, v, E, S], f[10] = y, f[11] = E, f[12] = v, f[13] = S, f[14] = s, f[15] = l) : (s = f[14], l = f[15]), (0, i.useEffect)(s, l), y || !1 === v || "render" === v) return o8;
            if ("viewport" === v) {
                let e;
                return f[16] === Symbol.for("react.memo_cache_sentinel") ? (e = {
                    ref: _
                }, f[16] = e) : e = f[16], e
            }
            f[17] !== E || f[18] !== v || f[19] !== w ? (u = e => {
                if ("intent" !== v) return;
                if (!w) return void E();
                let t = e.currentTarget;
                if (o7.has(t)) return;
                let r = setTimeout(() => {
                    o7.delete(t), E()
                }, w);
                o7.set(t, r)
            }, f[17] = E, f[18] = v, f[19] = w, f[20] = u) : u = f[20];
            let P = u;
            f[21] !== E || f[22] !== v ? (c = () => {
                "intent" === v && E()
            }, f[21] = E, f[22] = v, f[23] = c) : c = f[23];
            let C = c;
            f[24] !== v || f[25] !== w ? (d = e => {
                if (!v || !w) return;
                let t = e.currentTarget,
                    r = o7.get(t);
                r && (clearTimeout(r), o7.delete(t))
            }, f[24] = v, f[25] = w, f[26] = d) : d = f[26];
            let L = d;
            return f[27] !== P || f[28] !== L || f[29] !== C ? (h = {
                onMouseEnter: P,
                onFocus: P,
                onTouchStart: C,
                onMouseLeave: L,
                onBlur: L
            }, f[27] = P, f[28] = L, f[29] = C, f[30] = h) : h = f[30], h
        }

        function at(e, t) {
            let {
                routes: r
            } = (0, i.use)(o4), n = rd(e, tw.fV.pathname).pathname;
            return t ? ? !t9(r, n)
        }

        function ar(e, t) {
            return e ? {
                [te]: !0,
                ...t
            } : t
        }

        function an(e) {
            let t, r, n, o, a, i, s, l, c, d = (0, e7.c)(21);
            d[0] !== e ? ({
                to: i,
                reloadDocument: a,
                preventAutofocus: n,
                preload: t,
                preloadDelay: r,
                ...o
            } = e, d[0] = e, d[1] = t, d[2] = r, d[3] = n, d[4] = o, d[5] = a, d[6] = i) : (t = d[1], r = d[2], n = d[3], o = d[4], a = d[5], i = d[6]);
            let h = !!a;
            d[7] !== t || d[8] !== r || d[9] !== h || d[10] !== i ? (s = {
                to: i,
                preload: t,
                preloadDelay: r,
                disabled: h
            }, d[7] = t, d[8] = r, d[9] = h, d[10] = i, d[11] = s) : s = d[11];
            let f = ae(s);
            return d[12] !== n || d[13] !== o.state ? (l = ar(n, o.state), d[12] = n, d[13] = o.state, d[14] = l) : l = d[14], d[15] !== f || d[16] !== o || d[17] !== a || d[18] !== l || d[19] !== i ? (c = (0, u.jsx)(oz, {
                to: i,
                ...f,
                ...o,
                state: l,
                reloadDocument: a
            }), d[15] = f, d[16] = o, d[17] = a, d[18] = l, d[19] = i, d[20] = c) : c = d[20], c
        }

        function ao(e) {
            let t, r, n, o, a, i, s = (0, e7.c)(18);
            s[0] !== e ? ({
                preload: t,
                preloadDelay: r,
                preventAutofocus: n,
                ...o
            } = e, s[0] = e, s[1] = t, s[2] = r, s[3] = n, s[4] = o) : (t = s[1], r = s[2], n = s[3], o = s[4]);
            let l = at(o.to, o.reloadDocument);
            if (t) {
                let e;
                return s[5] !== t || s[6] !== r || s[7] !== n || s[8] !== o || s[9] !== l ? (e = (0, u.jsx)(an, {
                    preload: t,
                    preloadDelay: r,
                    preventAutofocus: n,
                    reloadDocument: l,
                    ...o
                }), s[5] = t, s[6] = r, s[7] = n, s[8] = o, s[9] = l, s[10] = e) : e = s[10], e
            }
            let c = o.to;
            return s[11] !== n || s[12] !== o.state ? (a = ar(n, o.state), s[11] = n, s[12] = o.state, s[13] = a) : a = s[13], s[14] !== o || s[15] !== l || s[16] !== a ? (i = (0, u.jsx)(oz, { ...o,
                to: c,
                state: a,
                reloadDocument: l
            }), s[14] = o, s[15] = l, s[16] = a, s[17] = i) : i = s[17], i
        }

        function aa(e) {
            let t, r, n, o, a, i, s, l, c, d = (0, e7.c)(21);
            d[0] !== e ? ({
                to: i,
                reloadDocument: a,
                preventAutofocus: n,
                preload: t,
                preloadDelay: r,
                ...o
            } = e, d[0] = e, d[1] = t, d[2] = r, d[3] = n, d[4] = o, d[5] = a, d[6] = i) : (t = d[1], r = d[2], n = d[3], o = d[4], a = d[5], i = d[6]);
            let h = !!a;
            d[7] !== t || d[8] !== r || d[9] !== h || d[10] !== i ? (s = {
                to: i,
                preload: t,
                preloadDelay: r,
                disabled: h
            }, d[7] = t, d[8] = r, d[9] = h, d[10] = i, d[11] = s) : s = d[11];
            let f = ae(s);
            return d[12] !== n || d[13] !== o.state ? (l = ar(n, o.state), d[12] = n, d[13] = o.state, d[14] = l) : l = d[14], d[15] !== f || d[16] !== o || d[17] !== a || d[18] !== l || d[19] !== i ? (c = (0, u.jsx)(oq, {
                to: i,
                ...f,
                ...o,
                state: l,
                reloadDocument: a
            }), d[15] = f, d[16] = o, d[17] = a, d[18] = l, d[19] = i, d[20] = c) : c = d[20], c
        }

        function ai(e) {
            let t, r, n, o, a, i, s = (0, e7.c)(18);
            s[0] !== e ? ({
                preload: t,
                preloadDelay: r,
                preventAutofocus: n,
                ...o
            } = e, s[0] = e, s[1] = t, s[2] = r, s[3] = n, s[4] = o) : (t = s[1], r = s[2], n = s[3], o = s[4]);
            let l = at(o.to, o.reloadDocument);
            if (t) {
                let e;
                return s[5] !== t || s[6] !== r || s[7] !== n || s[8] !== o || s[9] !== l ? (e = (0, u.jsx)(aa, {
                    preload: t,
                    preloadDelay: r,
                    preventAutofocus: n,
                    reloadDocument: l,
                    ...o
                }), s[5] = t, s[6] = r, s[7] = n, s[8] = o, s[9] = l, s[10] = e) : e = s[10], e
            }
            let c = o.to;
            return s[11] !== n || s[12] !== o.state ? (a = ar(n, o.state), s[11] = n, s[12] = o.state, s[13] = a) : a = s[13], s[14] !== o || s[15] !== l || s[16] !== a ? (i = (0, u.jsx)(oq, { ...o,
                to: c,
                state: a,
                reloadDocument: l
            }), s[14] = o, s[15] = l, s[16] = a, s[17] = i) : i = s[17], i
        }
        an.displayName = "PreloadableLink", ao.displayName = "ExtendedLink", aa.displayName = "PreloadableNavLink", ai.displayName = "ExtendedNavLink";
        let as = () => {
            let e, t = (0, e7.c)(2);
            if (tU()) {
                let e;
                return t[0] === Symbol.for("react.memo_cache_sentinel") ? (e = (0, u.jsx)(e9, {}), t[0] = e) : e = t[0], e
            }
            return t[1] === Symbol.for("react.memo_cache_sentinel") ? (e = (0, u.jsx)(om, {}), t[1] = e) : e = t[1], e
        };
        as.displayName = "Outlet";
        let al = e => {
            let t, r = (0, e7.c)(4);
            if (tU()) {
                let t;
                return r[0] !== e ? (t = (0, u.jsx)(tO, { ...e
                }), r[0] = e, r[1] = t) : t = r[1], t
            }
            return r[2] !== e ? (t = (0, u.jsx)(oz, { ...e
            }), r[2] = e, r[3] = t) : t = r[3], t
        };
        al.displayName = "Link";
        let au = e => {
            let t, r = (0, e7.c)(4);
            if (tU()) {
                let t;
                return r[0] !== e ? (t = (0, u.jsx)(t$, { ...e
                }), r[0] = e, r[1] = t) : t = r[1], t
            }
            return r[2] !== e ? (t = (0, u.jsx)(oq, { ...e
            }), r[2] = e, r[3] = t) : t = r[3], t
        };
        au.displayName = "NavLink";
        let ac = e => {
            let t, r = (0, e7.c)(4);
            if (tU()) {
                let t;
                return r[0] !== e ? (t = (0, u.jsx)(tO, { ...e
                }), r[0] = e, r[1] = t) : t = r[1], t
            }
            return r[2] !== e ? (t = (0, u.jsx)(ao, { ...e
            }), r[2] = e, r[3] = t) : t = r[3], t
        };
        ac.displayName = "ExtendedLink";
        let ad = e => {
            let t, r = (0, e7.c)(4);
            if (tU()) {
                let t;
                return r[0] !== e ? (t = (0, u.jsx)(t$, { ...e
                }), r[0] = e, r[1] = t) : t = r[1], t
            }
            return r[2] !== e ? (t = (0, u.jsx)(ai, { ...e
            }), r[2] = e, r[3] = t) : t = r[3], t
        };
        ad.displayName = "ExtendedNavLink";
        let ah = e => {
            let t, r = (0, e7.c)(2);
            return tU() ? null : (r[0] !== e ? (t = (0, u.jsx)(oW, { ...e
            }), r[0] = e, r[1] = t) : t = r[1], t)
        };

        function af(e) {
            let {
                select: t,
                ...r
            } = e;
            return tg({ ...r,
                select: e => t ? t(e.loaderDeps) : e.loaderDeps
            })
        }

        function ap(e) {
            return tg({
                from: e.from,
                strict: e.strict,
                shouldThrow: e.shouldThrow,
                structuralSharing: e.structuralSharing,
                select: t => e.select ? e.select(t.search) : t.search
            })
        }

        function am(e) {
            return tg({ ...e,
                select: t => e.select ? e.select(t.context) : t.context
            })
        }
        ah.displayName = "ScrollRestoration";
        var ay = class {
                get to() {
                    return this._to
                }
                get id() {
                    return this._id
                }
                get path() {
                    return this._path
                }
                get fullPath() {
                    return this._fullPath
                }
                constructor(e) {
                    if (this.init = e => {
                            this.originalIndex = e.originalIndex;
                            let t = this.options,
                                r = !t ? .path && !t ? .id;
                            this.parentRoute = this.options.getParentRoute ? .(), r ? this._path = C : this.parentRoute || P();
                            let n = r ? C : t ? .path;
                            n && "/" !== n && (n = el(n));
                            let o = t ? .id || n,
                                a = r ? C : ei(["__root__" === this.parentRoute.id ? "" : this.parentRoute.id, o]);
                            "__root__" === n && (n = "/"), "__root__" !== a && (a = ei(["/", a]));
                            let i = "__root__" === a ? "/" : ei([this.parentRoute.fullPath, n]);
                            this._path = n, this._id = a, this._fullPath = i, this._to = eu(i)
                        }, this.addChildren = e => this._addFileChildren(e), this._addFileChildren = e => (Array.isArray(e) && (this.children = e), "object" == typeof e && null !== e && (this.children = Object.values(e)), this), this._addFileTypes = () => this, this.updateLoader = e => (Object.assign(this.options, e), this), this.update = e => (Object.assign(this.options, e), this), this.lazy = e => (this.lazyFn = e, this), this.redirect = e => (function(e) {
                            if (e.statusCode = e.statusCode || e.code || 307, !e._builtLocation && !e.reloadDocument && "string" == typeof e.href) try {
                                new URL(e.href), e.reloadDocument = !0
                            } catch {}
                            let t = new Headers(e.headers);
                            e.href && null === t.get("Location") && t.set("Location", e.href);
                            let r = new Response(null, {
                                status: e.statusCode,
                                headers: t
                            });
                            if (r.options = e, e.throw) throw r;
                            return r
                        })({
                            from: this.fullPath,
                            ...e
                        }), this.options = e || {}, this.isRoot = !e ? .getParentRoute, e ? .id && e ? .path) throw Error("Route cannot have both an 'id' and a 'path' option.")
                }
            },
            ag = class extends ay {
                constructor(e) {
                    super(e)
                }
            },
            av = class extends ay {
                constructor(e) {
                    super(e), this.useMatch = e => tg({
                        select: e ? .select,
                        from: this.id,
                        structuralSharing: e ? .structuralSharing
                    }), this.useRouteContext = e => am({ ...e,
                        from: this.id
                    }), this.useSearch = e => ap({
                        select: e ? .select,
                        structuralSharing: e ? .structuralSharing,
                        from: this.id
                    }), this.useParams = e => tv({
                        select: e ? .select,
                        structuralSharing: e ? .structuralSharing,
                        from: this.id
                    }), this.useLoaderDeps = e => af({ ...e,
                        from: this.id
                    }), this.useLoaderData = e => tb({ ...e,
                        from: this.id
                    }), this.useNavigate = () => e8({
                        from: this.fullPath
                    }), this.Link = i.forwardRef((e, t) => (0, u.jsx)(tM, {
                        ref: t,
                        from: this.fullPath,
                        ...e
                    }))
                }
            },
            aw = class extends ag {
                constructor(e) {
                    super(e), this.useMatch = e => tg({
                        select: e ? .select,
                        from: this.id,
                        structuralSharing: e ? .structuralSharing
                    }), this.useRouteContext = e => am({ ...e,
                        from: this.id
                    }), this.useSearch = e => ap({
                        select: e ? .select,
                        structuralSharing: e ? .structuralSharing,
                        from: this.id
                    }), this.useParams = e => tv({
                        select: e ? .select,
                        structuralSharing: e ? .structuralSharing,
                        from: this.id
                    }), this.useLoaderDeps = e => af({ ...e,
                        from: this.id
                    }), this.useLoaderData = e => tb({ ...e,
                        from: this.id
                    }), this.useNavigate = () => e8({
                        from: this.fullPath
                    }), this.Link = i.forwardRef((e, t) => (0, u.jsx)(tM, {
                        ref: t,
                        from: this.fullPath,
                        ...e
                    }))
                }
            },
            ab = e => ({
                createMutableStore: tc.MN,
                createReadonlyStore: tc.MN,
                batch: tc.vA
            }),
            aR = class extends eX {
                constructor(e) {
                    super(e, ab)
                }
            };

        function aE(e) {
            return e.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)\?/g, "{-$$$1}").replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, "$$$1").replace(/\*$/g, "$")
        }

        function ax({
            routeObjects: e,
            context: t,
            rootComponent: r,
            rootPendingComponent: n,
            rootErrorComponent: o,
            appErrorComponent: a,
            history: i,
            defaultOnCatch: s,
            getRouteOptions: l,
            ...u
        }) {
            let c = new aw({
                    context: () => t,
                    component: r,
                    pendingComponent: n,
                    errorComponent: o
                }),
                d = a ? new av({
                    getParentRoute: () => c,
                    id: "__DATA_ROUTER_APPLICATION_ROUTES__",
                    errorComponent: a
                }) : c,
                h = function e(t, r, n = {
                    parentFullPath: ""
                }) {
                    let {
                        parentFullPath: o,
                        getRouteOptions: a
                    } = n;
                    return t.map(t => {
                        var n, i, s;
                        let l, u, c, d, h, {
                                normalizedRelativePath: f,
                                routeIdentifier: p,
                                ...m
                            } = (h = (d = function(e, t = "") {
                                if (!0 === e.index) return "/";
                                if (e.path && "" !== e.path) {
                                    let r = function(e, t = "") {
                                        let r = aE(e),
                                            n = aE(t);
                                        if (n && r.startsWith("/")) {
                                            if (r.startsWith(n)) {
                                                let e = r.slice(n.length);
                                                return e.startsWith("/") ? e : `/${e}`
                                            }
                                            return r
                                        }
                                        return r.startsWith("/") ? r : `/${r}`
                                    }(e.path, t);
                                    if ("/" !== r || !e.children || e.children ? .length === 0) return r
                                }
                            }(t, o)) ? {
                                path: d
                            } : {
                                id: t.id ? ? `${o}/_layout`
                            }, {
                                component: (l = (n = t).Component) || (n.element ? () => n.element : void 0),
                                errorComponent: (u = (i = t).ErrorBoundary) ? ti({
                                    ErrorBoundary: u
                                }) : i.errorElement ? ti({
                                    errorElement: i.errorElement
                                }) : void 0,
                                notFoundComponent: (c = (s = t).ErrorBoundary) ? ts({
                                    ErrorBoundary: c
                                }) : s.errorElement ? ts({
                                    errorElement: s.errorElement
                                }) : void 0,
                                loader: function(e) {
                                    if (!e.loader || "function" != typeof e.loader) return;
                                    let t = e.loader;
                                    return async e => {
                                        let {
                                            params: r,
                                            location: n,
                                            abortController: {
                                                signal: o
                                            },
                                            context: a
                                        } = e, i = new URL(n.pathname + (n.searchStr ? ? ""), tw.fV.origin);
                                        return t({
                                            request: new Request(i.toString(), {
                                                signal: o
                                            }),
                                            params: r,
                                            context: a,
                                            url: i,
                                            pattern: n.pathname,
                                            unstable_pattern: n.pathname
                                        })
                                    }
                                }(t),
                                ... function(e, t) {
                                    let r = t ? t(e) : {},
                                        n = {
                                            shouldReload: function(e, t) {
                                                if (e.shouldRevalidate && !("shouldReload" in t)) throw Error(`Route with id "${e.id}" has a shouldRevalidate function but no shouldReload option. React Router's shouldRevalidate cannot be automatically adapted for TanStack. Please configure shouldReload for this route.`);
                                                return t.shouldReload
                                            }(e, r),
                                            staticData: { ...e.handle ? ? {},
                                                dataRouterId : e.id
                                            }
                                        };
                                    if (t) {
                                        let {
                                            staticData: e,
                                            ...t
                                        } = r;
                                        return { ...n,
                                            ...e ? {
                                                staticData: { ...n.staticData,
                                                    ...e
                                                }
                                            } : {},
                                            ...t
                                        }
                                    }
                                    return n
                                }(t, a),
                                routeIdentifier: h,
                                normalizedRelativePath: d
                            }),
                            y = new av({
                                getParentRoute: () => r,
                                ..."path" in p ? {
                                    path: p.path
                                } : {
                                    id: p.id
                                },
                                ...m
                            });
                        if (t.children && t.children.length > 0) {
                            let r = `${o}/${f??""}`.replace(/\/+/g, "/"),
                                n = e(t.children, y, {
                                    parentFullPath: r,
                                    getRouteOptions: a
                                });
                            y.addChildren(n)
                        }
                        return y
                    })
                }(e, d, {
                    parentFullPath: "",
                    getRouteOptions: l
                });
            return new aR({
                routeTree: d === c ? c.addChildren(h) : c.addChildren([d.addChildren(h)]),
                context: t,
                history: i,
                defaultOnCatch: s,
                ...u
            })
        }

        function aS({
            router: e,
            children: t,
            ...r
        }) {
            j(r) && e.update({ ...e.options,
                ...r,
                context: { ...e.options.context,
                    ...r.context
                }
            });
            let n = (0, u.jsx)(v.Provider, {
                value: e,
                children: t
            });
            return e.options.Wrap ? (0, u.jsx)(e.options.Wrap, {
                children: n
            }) : n
        }

        function a_({
            router: e,
            ...t
        }) {
            return (0, u.jsx)(aS, {
                router: e,
                ...t,
                children: (0, u.jsx)(th, {})
            })
        }

        function aP() {
            return (tU() ? function() {
                let e, t = (0, e7.c)(2),
                    r = w();
                return t[0] !== r ? (e = e => {
                    let t, n;
                    try {
                        let r = new URL(e, tw.fV.origin);
                        t = r.pathname, n = r.searchParams
                    } catch {
                        return !1
                    }
                    return r.preloadRoute({
                        to: t,
                        search: Object.fromEntries(n)
                    }), !0
                }, t[0] = r, t[1] = e) : e = t[1], e
            } : o5)()
        }
        let aC = () => (tU() ? tp : on)();

        function aL(...e) {
            return (tU() ? function(e) {
                let t, r = (0, e7.c)(5),
                    n = tp();
                if (r[0] !== n || r[1] !== e) {
                    let o;
                    r[3] !== e ? (o = t => ri(e, t.pathname), r[3] = e, r[4] = o) : o = r[4], t = n.map(o).find(Boolean) ? ? null, r[0] = n, r[1] = e, r[2] = t
                } else t = r[2];
                return t
            } : function(e) {
                tJ(nY(), "useMatch() may be used only in the context of a <Router> component.");
                let {
                    pathname: t
                } = nQ();
                return i.useMemo(() => ri(e, ru(t)), [t, e])
            })(...e)
        }
        let ak = () => (tU() ? function() {
                let e = (0, i.use)(to);
                if (e === tn) throw Error("useRouteError() was called in a TanStack Router context without an adapted error boundary. Wrap the route ErrorBoundary or errorElement with wrapTanStackErrorComponent(), or adapt the full route via routeOptionsAdapter()/createTanStackRouter().");
                return e
            } : oo)(),
            aN = () => (tU() ? tr : o3)(),
            aT = () => (tU() ? () => {
                let e, t, r, n, o, a = (0, e7.c)(9),
                    {
                        pathname: s,
                        searchStr: l
                    } = (n = w(), o = (0, i.useRef)(void 0), (0, R.P)(n.stores.location, e => {
                        if ((void 0) ? ? n.options.defaultStructuralSharing) {
                            let t = I(o.current, e);
                            return o.current = t, t
                        }
                        return e
                    })),
                    u = tr();
                a[0] !== l ? (e = new URLSearchParams(l), a[0] = l, a[1] = e) : e = a[1];
                let c = e;
                a[2] !== u || a[3] !== s || a[4] !== c ? (t = (e, t) => {
                    u({
                        pathname: s,
                        search: tu("function" == typeof e ? e(c) : e).toString()
                    }, t)
                }, a[2] = u, a[3] = s, a[4] = c, a[5] = t) : t = a[5];
                let d = t;
                return a[6] !== c || a[7] !== d ? (r = [c, d], a[6] = c, a[7] = d, a[8] = r) : r = a[8], r
            } : () => {
                let e, t, r = (0, e7.c)(7),
                    [n] = oY(),
                    o = o3(),
                    {
                        pathname: a
                    } = nQ();
                r[0] !== o || r[1] !== a || r[2] !== n ? (e = (e, t) => {
                    o({
                        pathname: a,
                        search: oR("function" == typeof e ? e(n) : e).toString()
                    }, void 0 === t ? {} : t)
                }, r[0] = o, r[1] = a, r[2] = n, r[3] = e) : e = r[3];
                let i = e;
                return r[4] !== n || r[5] !== i ? (t = [n, i], r[4] = n, r[5] = i, r[6] = t) : t = r[6], t
            })();

        function aj() {
            return (tU() ? function() {
                let e, t = (0, e7.c)(3);
                t[0] === Symbol.for("react.memo_cache_sentinel") ? (e = {
                    strict: !1
                }, t[0] = e) : e = t[0];
                let r = tv(e);
                if ("_splat" in r) {
                    let e;
                    return t[1] !== r ? (e = { ...r,
                        "*": r._splat
                    }, t[1] = r, t[2] = e) : e = t[2], e
                }
                return r
            } : function() {
                let {
                    matches: e
                } = i.useContext(nV);
                return e[e.length - 1] ? .params ? ? {}
            })()
        }

        function aA() {
            return (tU() ? () => {
                let e, t = (0, e7.c)(1);
                return t[0] === Symbol.for("react.memo_cache_sentinel") ? (e = {
                    select: tx,
                    structuralSharing: !0
                }, t[0] = e) : e = t[0], tR(e)
            } : nQ)()
        }

        function aD() {
            return (tU() ? () => {
                let e, t, r, n = (0, e7.c)(5);
                n[0] === Symbol.for("react.memo_cache_sentinel") ? (e = {
                    select: tS
                }, n[0] = e) : e = n[0];
                let {
                    routerIsLoading: o,
                    location: a
                } = tR(e);
                n[1] === Symbol.for("react.memo_cache_sentinel") ? (t = {
                    strict: !1
                }, n[1] = t) : t = n[1];
                let i = tg(t).isFetching,
                    s = o || i,
                    l = s ? "loading" : "idle",
                    u = s ? a : void 0;
                return n[2] !== l || n[3] !== u ? (r = {
                    state: l,
                    location: u
                }, n[2] = l, n[3] = u, n[4] = r) : r = n[4], r
            } : or)()
        }

        function aI() {
            switch ((tU() ? function() {
                let e, t, r, n = (0, e7.c)(5),
                    o = w(),
                    [a, s] = (0, i.useState)("POP"),
                    [l, u] = (0, i.useState)(a);
                n[0] === Symbol.for("react.memo_cache_sentinel") ? (e = {
                    select: t_,
                    structuralSharing: !0
                }, n[0] = e) : e = n[0];
                let c = tR(e);
                return n[1] !== o.history ? (t = () => o.history.subscribe(e => {
                    let {
                        action: t
                    } = e;
                    s(function(e) {
                        switch (e) {
                            case "PUSH":
                            case "REPLACE":
                                return e;
                            case "BACK":
                            case "FORWARD":
                            case "GO":
                                return "POP"
                        }
                    }(t.type))
                }), n[1] = o.history, n[2] = t) : t = n[2], n[3] !== o ? (r = [o], n[3] = o, n[4] = r) : r = n[4], (0, i.useEffect)(t, r), c || l === a || u(a), c ? l : a
            } : function() {
                return i.useContext(nW).navigationType
            })()) {
                case "PUSH":
                    return tq.Push;
                case "REPLACE":
                    return tq.Replace;
                case "POP":
                    return tq.Pop
            }
        }

        function aM(e) {
            return (tU() ? function(e) {
                let t, r, n, o = (0, e7.c)(12);
                o[0] !== e ? (t = "boolean" == typeof e ? () => e : t => {
                    let {
                        current: r,
                        next: n
                    } = t;
                    return e({
                        currentLocation: {
                            pathname: r.pathname
                        },
                        nextLocation: {
                            pathname: n.pathname
                        }
                    })
                }, o[0] = e, o[1] = t) : t = o[1];
                let a = t;
                o[2] !== a ? (r = {
                    shouldBlockFn: a,
                    withResolver: !0,
                    enableBeforeUnload: !1
                }, o[2] = a, o[3] = r) : r = o[3];
                let {
                    status: s,
                    next: l,
                    proceed: u,
                    reset: c
                } = function(e) {
                    let {
                        shouldBlockFn: t,
                        enableBeforeUnload: r = !0,
                        disabled: n = !1,
                        withResolver: o = !1
                    } = function(e, t) {
                        if (void 0 === e) return {
                            shouldBlockFn: () => !0,
                            withResolver: !1
                        };
                        if ("shouldBlockFn" in e) return e;
                        if ("function" == typeof e) {
                            let r = !!(t ? ? !0);
                            return {
                                shouldBlockFn: async () => !!r && await e(),
                                enableBeforeUnload: r,
                                withResolver: !1
                            }
                        }
                        let r = !!(e.condition ? ? !0),
                            n = e.blockerFn;
                        return {
                            shouldBlockFn: async () => r && void 0 !== n ? await n() : r,
                            enableBeforeUnload: r,
                            withResolver: void 0 === n
                        }
                    }(e, void 0), a = w(), {
                        history: s
                    } = a, [l, u] = i.useState({
                        status: "idle",
                        current: void 0,
                        next: void 0,
                        action: void 0,
                        proceed: void 0,
                        reset: void 0
                    });
                    return i.useEffect(() => {
                        let e = async e => {
                            function r(e) {
                                let t = a.parseLocation(e),
                                    r = a.getMatchedRoutes(t.pathname);
                                return void 0 === r.foundRoute ? {
                                    routeId: "__notFound__",
                                    fullPath: t.pathname,
                                    pathname: t.pathname,
                                    params: r.routeParams,
                                    search: a.options.parseSearch(e.search)
                                } : {
                                    routeId: r.foundRoute.id,
                                    fullPath: r.foundRoute.fullPath,
                                    pathname: t.pathname,
                                    params: r.routeParams,
                                    search: a.options.parseSearch(e.search)
                                }
                            }
                            let n = r(e.currentLocation),
                                i = r(e.nextLocation);
                            if ("__notFound__" === n.routeId && "__notFound__" !== i.routeId) return !1;
                            let s = await t({
                                action: e.action,
                                current: n,
                                next: i
                            });
                            if (!o) return s;
                            if (!s) return !1;
                            let l = await new Promise(t => {
                                u({
                                    status: "blocked",
                                    current: n,
                                    next: i,
                                    action: e.action,
                                    proceed: () => t(!1),
                                    reset: () => t(!0)
                                })
                            });
                            return u({
                                status: "idle",
                                current: void 0,
                                next: void 0,
                                action: void 0,
                                proceed: void 0,
                                reset: void 0
                            }), l
                        };
                        return n ? void 0 : s.block({
                            blockerFn: e,
                            enableBeforeUnload: r
                        })
                    }, [t, r, n, o, s, a]), l
                }(r);
                if ("blocked" === s) {
                    let e, t, r;
                    o[4] === Symbol.for("react.memo_cache_sentinel") ? (e = {}, o[4] = e) : e = o[4], o[5] !== l.pathname ? (t = {
                        search: "",
                        pathname: l.pathname,
                        hash: "",
                        state: e,
                        key: "default"
                    }, o[5] = l.pathname, o[6] = t) : t = o[6];
                    let n = t;
                    return o[7] !== n || o[8] !== u || o[9] !== c ? (r = {
                        state: "blocked",
                        proceed: u,
                        reset: c,
                        location: n
                    }, o[7] = n, o[8] = u, o[9] = c, o[10] = r) : r = o[10], r
                }
                return o[11] === Symbol.for("react.memo_cache_sentinel") ? (n = {
                    state: "unblocked"
                }, o[11] = n) : n = o[11], n
            } : function(e) {
                let {
                    router: t,
                    basename: r
                } = n8("useBlocker"), n = oe("useBlocker"), [o, a] = i.useState(""), s = i.useCallback(t => {
                    if ("function" != typeof e) return !!e;
                    if ("/" === r) return e(t);
                    let {
                        currentLocation: n,
                        nextLocation: o,
                        historyAction: a
                    } = t;
                    return e({
                        currentLocation: { ...n,
                            pathname: rc(n.pathname, r) || n.pathname
                        },
                        nextLocation: { ...o,
                            pathname: rc(o.pathname, r) || o.pathname
                        },
                        historyAction: a
                    })
                }, [r, e]);
                return i.useEffect(() => {
                    let e = String(++oa);
                    return a(e), () => t.deleteBlocker(e)
                }, [t]), i.useEffect(() => {
                    "" !== o && t.getBlocker(o, s)
                }, [t, o, s]), o && n.blockers.has(o) ? n.blockers.get(o) : rJ
            })(e)
        }

        function aO(...e) {
            return (tU() ? function(e, t) {
                let r, n, o = (0, e7.c)(8),
                    a = tr();
                o[0] !== t ? (r = t || {}, o[0] = t, o[1] = r) : r = o[1];
                let {
                    replace: i,
                    state: s,
                    target: l
                } = r;
                return o[2] !== a || o[3] !== i || o[4] !== s || o[5] !== l || o[6] !== e ? (n = t => {
                    var r, n;
                    r = t, n = l, 0 !== r.button || n && "_self" !== n || r.metaKey || r.altKey || r.ctrlKey || r.shiftKey || (t.preventDefault(), a(e, {
                        replace: i,
                        state: s
                    }))
                }, o[2] = a, o[3] = i, o[4] = s, o[5] = l, o[6] = e, o[7] = n) : n = o[7], n
            } : oJ)(...e)
        }

        function a$() {
            return (tU() ? function() {
                let e, t = (0, e7.c)(1);
                return t[0] === Symbol.for("react.memo_cache_sentinel") ? (e = {
                    strict: !1
                }, t[0] = e) : e = t[0], tb(e)
            } : function() {
                let e = oe("useLoaderData"),
                    t = ot("useLoaderData");
                return e.loaderData[t]
            })()
        }

        function aF(e) {
            return (tU() ? function(e) {
                let t, r = (0, e7.c)(5),
                    n = tp();
                if (r[0] !== n || r[1] !== e) {
                    let o;
                    r[3] !== e ? (o = t => t.id === e, r[3] = e, r[4] = o) : o = r[4], t = n.find(o), r[0] = n, r[1] = e, r[2] = t
                } else t = r[2];
                let o = t;
                return o ? .loaderData
            } : function(e) {
                return oe("useRouteLoaderData").loaderData[e]
            })(e)
        }
    }
};
//# sourceMappingURL=react-core-3438052ce3101c91-9f26a355d4a0da64.js.map