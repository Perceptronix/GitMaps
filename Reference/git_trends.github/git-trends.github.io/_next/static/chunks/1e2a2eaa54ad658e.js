(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["object" == typeof document ? document.currentScript : void 0, 33525, (e, t, r) => {
    "use strict";
    Object.defineProperty(r, "__esModule", {
        value: !0
    }), Object.defineProperty(r, "warnOnce", {
        enumerable: !0,
        get: function() {
            return n
        }
    });
    let n = e => {}
}, 75254, e => {
    "use strict";
    var t = e.i(71645);
    let r = e => {
            let t = e.replace(/^([A-Z])|[\s-_]+(\w)/g, (e, t, r) => r ? r.toUpperCase() : t.toLowerCase());
            return t.charAt(0).toUpperCase() + t.slice(1)
        },
        n = (...e) => e.filter((e, t, r) => !!e && "" !== e.trim() && r.indexOf(e) === t).join(" ").trim();
    var o = {
        xmlns: "http://www.w3.org/2000/svg",
        width: 24,
        height: 24,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round"
    };
    let a = (0, t.forwardRef)(({
            color: e = "currentColor",
            size: r = 24,
            strokeWidth: a = 2,
            absoluteStrokeWidth: u,
            className: i = "",
            children: s,
            iconNode: l,
            ...c
        }, f) => (0, t.createElement)("svg", {
            ref: f,
            ...o,
            width: r,
            height: r,
            stroke: e,
            strokeWidth: u ? 24 * Number(a) / Number(r) : a,
            className: n("lucide", i),
            ...!s && !(e => {
                for (let t in e)
                    if (t.startsWith("aria-") || "role" === t || "title" === t) return !0
            })(c) && {
                "aria-hidden": "true"
            },
            ...c
        }, [...l.map(([e, r]) => (0, t.createElement)(e, r)), ...Array.isArray(s) ? s : [s]])),
        u = (e, o) => {
            let u = (0, t.forwardRef)(({
                className: u,
                ...i
            }, s) => (0, t.createElement)(a, {
                ref: s,
                iconNode: o,
                className: n(`lucide-${r(e).replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`, `lucide-${e}`, u),
                ...i
            }));
            return u.displayName = r(e), u
        };
    e.s(["default", () => u], 75254)
}, 55436, e => {
    "use strict";
    let t = (0, e.i(75254).default)("search", [
        ["path", {
            d: "m21 21-4.34-4.34",
            key: "14j7rj"
        }],
        ["circle", {
            cx: "11",
            cy: "11",
            r: "8",
            key: "4ej97u"
        }]
    ]);
    e.s(["Search", () => t], 55436)
}, 98183, (e, t, r) => {
    "use strict";
    Object.defineProperty(r, "__esModule", {
        value: !0
    });
    var n = {
        assign: function() {
            return s
        },
        searchParamsToUrlQuery: function() {
            return a
        },
        urlQueryToSearchParams: function() {
            return i
        }
    };
    for (var o in n) Object.defineProperty(r, o, {
        enumerable: !0,
        get: n[o]
    });

    function a(e) {
        let t = {};
        for (let [r, n] of e.entries()) {
            let e = t[r];
            void 0 === e ? t[r] = n : Array.isArray(e) ? e.push(n) : t[r] = [e, n]
        }
        return t
    }

    function u(e) {
        return "string" == typeof e ? e : ("number" != typeof e || isNaN(e)) && "boolean" != typeof e ? "" : String(e)
    }

    function i(e) {
        let t = new URLSearchParams;
        for (let [r, n] of Object.entries(e))
            if (Array.isArray(n))
                for (let e of n) t.append(r, u(e));
            else t.set(r, u(n));
        return t
    }

    function s(e, ...t) {
        for (let r of t) {
            for (let t of r.keys()) e.delete(t);
            for (let [t, n] of r.entries()) e.append(t, n)
        }
        return e
    }
}, 95057, (e, t, r) => {
    "use strict";
    Object.defineProperty(r, "__esModule", {
        value: !0
    });
    var n = {
        formatUrl: function() {
            return i
        },
        formatWithValidation: function() {
            return l
        },
        urlObjectKeys: function() {
            return s
        }
    };
    for (var o in n) Object.defineProperty(r, o, {
        enumerable: !0,
        get: n[o]
    });
    let a = e.r(90809)._(e.r(98183)),
        u = /https?|ftp|gopher|file/;

    function i(e) {
        let {
            auth: t,
            hostname: r
        } = e, n = e.protocol || "", o = e.pathname || "", i = e.hash || "", s = e.query || "", l = !1;
        t = t ? encodeURIComponent(t).replace(/%3A/i, ":") + "@" : "", e.host ? l = t + e.host : r && (l = t + (~r.indexOf(":") ? `[${r}]` : r), e.port && (l += ":" + e.port)), s && "object" == typeof s && (s = String(a.urlQueryToSearchParams(s)));
        let c = e.search || s && `?${s}` || "";
        return n && !n.endsWith(":") && (n += ":"), e.slashes || (!n || u.test(n)) && !1 !== l ? (l = "//" + (l || ""), o && "/" !== o[0] && (o = "/" + o)) : l || (l = ""), i && "#" !== i[0] && (i = "#" + i), c && "?" !== c[0] && (c = "?" + c), o = o.replace(/[?#]/g, encodeURIComponent), c = c.replace("#", "%23"), `${n}${l}${o}${c}${i}`
    }
    let s = ["auth", "hash", "host", "hostname", "href", "path", "pathname", "port", "protocol", "query", "search", "slashes"];

    function l(e) {
        return i(e)
    }
}, 18581, (e, t, r) => {
    "use strict";
    Object.defineProperty(r, "__esModule", {
        value: !0
    }), Object.defineProperty(r, "useMergedRef", {
        enumerable: !0,
        get: function() {
            return o
        }
    });
    let n = e.r(71645);

    function o(e, t) {
        let r = (0, n.useRef)(null),
            o = (0, n.useRef)(null);
        return (0, n.useCallback)(n => {
            if (null === n) {
                let e = r.current;
                e && (r.current = null, e());
                let t = o.current;
                t && (o.current = null, t())
            } else e && (r.current = a(e, n)), t && (o.current = a(t, n))
        }, [e, t])
    }

    function a(e, t) {
        if ("function" != typeof e) return e.current = t, () => {
            e.current = null
        }; {
            let r = e(t);
            return "function" == typeof r ? r : () => e(null)
        }
    }("function" == typeof r.default || "object" == typeof r.default && null !== r.default) && void 0 === r.default.__esModule && (Object.defineProperty(r.default, "__esModule", {
        value: !0
    }), Object.assign(r.default, r), t.exports = r.default)
}, 18967, (e, t, r) => {
    "use strict";
    Object.defineProperty(r, "__esModule", {
        value: !0
    });
    var n = {
        DecodeError: function() {
            return y
        },
        MiddlewareNotFoundError: function() {
            return j
        },
        MissingStaticPage: function() {
            return v
        },
        NormalizeError: function() {
            return b
        },
        PageNotFoundError: function() {
            return x
        },
        SP: function() {
            return m
        },
        ST: function() {
            return g
        },
        WEB_VITALS: function() {
            return a
        },
        execOnce: function() {
            return u
        },
        getDisplayName: function() {
            return f
        },
        getLocationOrigin: function() {
            return l
        },
        getURL: function() {
            return c
        },
        isAbsoluteUrl: function() {
            return s
        },
        isResSent: function() {
            return d
        },
        loadGetInitialProps: function() {
            return h
        },
        normalizeRepeatedSlashes: function() {
            return p
        },
        stringifyError: function() {
            return P
        }
    };
    for (var o in n) Object.defineProperty(r, o, {
        enumerable: !0,
        get: n[o]
    });
    let a = ["CLS", "FCP", "FID", "INP", "LCP", "TTFB"];

    function u(e) {
        let t, r = !1;
        return (...n) => (r || (r = !0, t = e(...n)), t)
    }
    let i = /^[a-zA-Z][a-zA-Z\d+\-.]*?:/,
        s = e => i.test(e);

    function l() {
        let {
            protocol: e,
            hostname: t,
            port: r
        } = window.location;
        return `${e}//${t}${r?":"+r:""}`
    }

    function c() {
        let {
            href: e
        } = window.location, t = l();
        return e.substring(t.length)
    }

    function f(e) {
        return "string" == typeof e ? e : e.displayName || e.name || "Unknown"
    }

    function d(e) {
        return e.finished || e.headersSent
    }

    function p(e) {
        let t = e.split("?");
        return t[0].replace(/\\/g, "/").replace(/\/\/+/g, "/") + (t[1] ? `?${t.slice(1).join("?")}` : "")
    }
    async function h(e, t) {
        let r = t.res || t.ctx && t.ctx.res;
        if (!e.getInitialProps) return t.ctx && t.Component ? {
            pageProps: await h(t.Component, t.ctx)
        } : {};
        let n = await e.getInitialProps(t);
        if (r && d(r)) return n;
        if (!n) throw Object.defineProperty(Error(`"${f(e)}.getInitialProps()" should resolve to an object. But found "${n}" instead.`), "__NEXT_ERROR_CODE", {
            value: "E394",
            enumerable: !1,
            configurable: !0
        });
        return n
    }
    let m = "u" > typeof performance,
        g = m && ["mark", "measure", "getEntriesByName"].every(e => "function" == typeof performance[e]);
    class y extends Error {}
    class b extends Error {}
    class x extends Error {
        constructor(e) {
            super(), this.code = "ENOENT", this.name = "PageNotFoundError", this.message = `Cannot find module for page: ${e}`
        }
    }
    class v extends Error {
        constructor(e, t) {
            super(), this.message = `Failed to load static file for page: ${e} ${t}`
        }
    }
    class j extends Error {
        constructor() {
            super(), this.code = "ENOENT", this.message = "Cannot find the middleware module"
        }
    }

    function P(e) {
        return JSON.stringify({
            message: e.message,
            stack: e.stack
        })
    }
}, 73668, (e, t, r) => {
    "use strict";
    Object.defineProperty(r, "__esModule", {
        value: !0
    }), Object.defineProperty(r, "isLocalURL", {
        enumerable: !0,
        get: function() {
            return a
        }
    });
    let n = e.r(18967),
        o = e.r(52817);

    function a(e) {
        if (!(0, n.isAbsoluteUrl)(e)) return !0;
        try {
            let t = (0, n.getLocationOrigin)(),
                r = new URL(e, t);
            return r.origin === t && (0, o.hasBasePath)(r.pathname)
        } catch (e) {
            return !1
        }
    }
}, 84508, (e, t, r) => {
    "use strict";
    Object.defineProperty(r, "__esModule", {
        value: !0
    }), Object.defineProperty(r, "errorOnce", {
        enumerable: !0,
        get: function() {
            return n
        }
    });
    let n = e => {}
}, 22016, (e, t, r) => {
    "use strict";
    Object.defineProperty(r, "__esModule", {
        value: !0
    });
    var n = {
        default: function() {
            return y
        },
        useLinkStatus: function() {
            return x
        }
    };
    for (var o in n) Object.defineProperty(r, o, {
        enumerable: !0,
        get: n[o]
    });
    let a = e.r(90809),
        u = e.r(43476),
        i = a._(e.r(71645)),
        s = e.r(95057),
        l = e.r(8372),
        c = e.r(18581),
        f = e.r(18967),
        d = e.r(5550);
    e.r(33525);
    let p = e.r(91949),
        h = e.r(73668),
        m = e.r(9396);

    function g(e) {
        return "string" == typeof e ? e : (0, s.formatUrl)(e)
    }

    function y(t) {
        var r;
        let n, o, a, [s, y] = (0, i.useOptimistic)(p.IDLE_LINK_STATUS),
            x = (0, i.useRef)(null),
            {
                href: v,
                as: j,
                children: P,
                prefetch: N = null,
                passHref: w,
                replace: _,
                shallow: O,
                scroll: E,
                onClick: k,
                onMouseEnter: C,
                onTouchStart: S,
                legacyBehavior: T = !1,
                onNavigate: R,
                ref: M,
                unstable_dynamicOnHover: L,
                ...A
            } = t;
        n = P, T && ("string" == typeof n || "number" == typeof n) && (n = (0, u.jsx)("a", {
            children: n
        }));
        let $ = i.default.useContext(l.AppRouterContext),
            U = !1 !== N,
            I = !1 !== N ? null === (r = N) || "auto" === r ? m.FetchStrategy.PPR : m.FetchStrategy.Full : m.FetchStrategy.PPR,
            {
                href: B,
                as: F
            } = i.default.useMemo(() => {
                let e = g(v);
                return {
                    href: e,
                    as: j ? g(j) : e
                }
            }, [v, j]);
        if (T) {
            if (n ? .$$typeof === Symbol.for("react.lazy")) throw Object.defineProperty(Error("`<Link legacyBehavior>` received a direct child that is either a Server Component, or JSX that was loaded with React.lazy(). This is not supported. Either remove legacyBehavior, or make the direct child a Client Component that renders the Link's `<a>` tag."), "__NEXT_ERROR_CODE", {
                value: "E863",
                enumerable: !1,
                configurable: !0
            });
            o = i.default.Children.only(n)
        }
        let D = T ? o && "object" == typeof o && o.ref : M,
            z = i.default.useCallback(e => (null !== $ && (x.current = (0, p.mountLinkInstance)(e, B, $, I, U, y)), () => {
                x.current && ((0, p.unmountLinkForCurrentNavigation)(x.current), x.current = null), (0, p.unmountPrefetchableInstance)(e)
            }), [U, B, $, I, y]),
            K = {
                ref: (0, c.useMergedRef)(z, D),
                onClick(t) {
                    T || "function" != typeof k || k(t), T && o.props && "function" == typeof o.props.onClick && o.props.onClick(t), !$ || t.defaultPrevented || function(t, r, n, o, a, u, s) {
                        if ("u" > typeof window) {
                            let l, {
                                nodeName: c
                            } = t.currentTarget;
                            if ("A" === c.toUpperCase() && ((l = t.currentTarget.getAttribute("target")) && "_self" !== l || t.metaKey || t.ctrlKey || t.shiftKey || t.altKey || t.nativeEvent && 2 === t.nativeEvent.which) || t.currentTarget.hasAttribute("download")) return;
                            if (!(0, h.isLocalURL)(r)) {
                                a && (t.preventDefault(), location.replace(r));
                                return
                            }
                            if (t.preventDefault(), s) {
                                let e = !1;
                                if (s({
                                        preventDefault: () => {
                                            e = !0
                                        }
                                    }), e) return
                            }
                            let {
                                dispatchNavigateAction: f
                            } = e.r(99781);
                            i.default.startTransition(() => {
                                f(n || r, a ? "replace" : "push", u ? ? !0, o.current)
                            })
                        }
                    }(t, B, F, x, _, E, R)
                },
                onMouseEnter(e) {
                    T || "function" != typeof C || C(e), T && o.props && "function" == typeof o.props.onMouseEnter && o.props.onMouseEnter(e), $ && U && (0, p.onNavigationIntent)(e.currentTarget, !0 === L)
                },
                onTouchStart: function(e) {
                    T || "function" != typeof S || S(e), T && o.props && "function" == typeof o.props.onTouchStart && o.props.onTouchStart(e), $ && U && (0, p.onNavigationIntent)(e.currentTarget, !0 === L)
                }
            };
        return (0, f.isAbsoluteUrl)(F) ? K.href = F : T && !w && ("a" !== o.type || "href" in o.props) || (K.href = (0, d.addBasePath)(F)), a = T ? i.default.cloneElement(o, K) : (0, u.jsx)("a", { ...A,
            ...K,
            children: n
        }), (0, u.jsx)(b.Provider, {
            value: s,
            children: a
        })
    }
    e.r(84508);
    let b = (0, i.createContext)(p.IDLE_LINK_STATUS),
        x = () => (0, i.useContext)(b);
    ("function" == typeof r.default || "object" == typeof r.default && null !== r.default) && void 0 === r.default.__esModule && (Object.defineProperty(r.default, "__esModule", {
        value: !0
    }), Object.assign(r.default, r), t.exports = r.default)
}, 18566, (e, t, r) => {
    t.exports = e.r(76562)
}, 48303, e => {
    "use strict";
    var t = e.i(43476),
        r = e.i(22016),
        n = e.i(18566),
        o = e.i(47163),
        a = e.i(55436),
        u = e.i(75254);
    let i = (0, u.default)("trending-up", [
            ["path", {
                d: "M16 7h6v6",
                key: "box55l"
            }],
            ["path", {
                d: "m22 7-8.5 8.5-5-5L2 17",
                key: "1t1m79"
            }]
        ]),
        s = (0, u.default)("menu", [
            ["path", {
                d: "M4 5h16",
                key: "1tepv9"
            }],
            ["path", {
                d: "M4 12h16",
                key: "1lakjw"
            }],
            ["path", {
                d: "M4 19h16",
                key: "1djgab"
            }]
        ]),
        l = (0, u.default)("x", [
            ["path", {
                d: "M18 6 6 18",
                key: "1bl5f8"
            }],
            ["path", {
                d: "m6 6 12 12",
                key: "d8bk6v"
            }]
        ]);
    var c = e.i(71645);
    let f = [{
        href: "/",
        label: "Trending",
        icon: i
    }, {
        href: "/search",
        label: "Search",
        icon: a.Search
    }];

    function d() {
        let e = (0, n.usePathname)(),
            [a, u] = (0, c.useState)(!1);
        return (0, t.jsxs)("header", {
            className: "sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md",
            children: [(0, t.jsxs)("div", {
                className: "mx-auto flex h-14 max-w-6xl items-center justify-between px-4",
                children: [(0, t.jsxs)(r.default, {
                    href: "/",
                    className: "flex items-center gap-2",
                    children: [(0, t.jsx)("div", {
                        className: "flex h-8 w-8 items-center justify-center rounded-lg bg-primary",
                        children: (0, t.jsx)(i, {
                            className: "h-4 w-4 text-primary-foreground"
                        })
                    }), (0, t.jsx)("span", {
                        className: "text-lg font-bold text-foreground",
                        children: "GitTrends"
                    })]
                }), (0, t.jsx)("nav", {
                    className: "hidden items-center gap-1 md:flex",
                    children: f.map(n => {
                        let a = n.icon,
                            u = "/" === n.href ? "/" === e : e.startsWith(n.href);
                        return (0, t.jsxs)(r.default, {
                            href: n.href,
                            className: (0, o.cn)("flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors", u ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"),
                            children: [(0, t.jsx)(a, {
                                className: "h-4 w-4"
                            }), n.label]
                        }, n.href)
                    })
                }), (0, t.jsx)("div", {
                    className: "hidden items-center gap-3 md:flex",
                    children: (0, t.jsxs)("a", {
                        href: "https://github.com",
                        target: "_blank",
                        rel: "noopener noreferrer",
                        className: "text-muted-foreground transition-colors hover:text-foreground",
                        children: [(0, t.jsx)("svg", {
                            className: "h-5 w-5",
                            fill: "currentColor",
                            viewBox: "0 0 24 24",
                            children: (0, t.jsx)("path", {
                                d: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                            })
                        }), (0, t.jsx)("span", {
                            className: "sr-only",
                            children: "GitHub"
                        })]
                    })
                }), (0, t.jsx)("button", {
                    type: "button",
                    className: "flex items-center justify-center rounded-md p-2 text-muted-foreground md:hidden",
                    onClick: () => u(!a),
                    "aria-label": "Toggle navigation",
                    children: a ? (0, t.jsx)(l, {
                        className: "h-5 w-5"
                    }) : (0, t.jsx)(s, {
                        className: "h-5 w-5"
                    })
                })]
            }), a && (0, t.jsx)("div", {
                className: "border-t border-border px-4 pb-4 pt-2 md:hidden",
                children: (0, t.jsx)("nav", {
                    className: "flex flex-col gap-1",
                    children: f.map(n => {
                        let a = n.icon,
                            i = "/" === n.href ? "/" === e : e.startsWith(n.href);
                        return (0, t.jsxs)(r.default, {
                            href: n.href,
                            onClick: () => u(!1),
                            className: (0, o.cn)("flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors", i ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"),
                            children: [(0, t.jsx)(a, {
                                className: "h-4 w-4"
                            }), n.label]
                        }, n.href)
                    })
                })
            })]
        })
    }
    e.s(["SiteHeader", () => d], 48303)
}]);