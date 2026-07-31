(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["object" == typeof document ? document.currentScript : void 0, 55838, (e, t, r) => {
    "use strict";
    var n = e.r(71645),
        a = "function" == typeof Object.is ? Object.is : function(e, t) {
            return e === t && (0 !== e || 1 / e == 1 / t) || e != e && t != t
        },
        l = n.useState,
        i = n.useEffect,
        s = n.useLayoutEffect,
        u = n.useDebugValue;

    function o(e) {
        var t = e.getSnapshot;
        e = e.value;
        try {
            var r = t();
            return !a(e, r)
        } catch (e) {
            return !0
        }
    }
    var c = "u" < typeof window || void 0 === window.document || void 0 === window.document.createElement ? function(e, t) {
        return t()
    } : function(e, t) {
        var r = t(),
            n = l({
                inst: {
                    value: r,
                    getSnapshot: t
                }
            }),
            a = n[0].inst,
            c = n[1];
        return s(function() {
            a.value = r, a.getSnapshot = t, o(a) && c({
                inst: a
            })
        }, [e, r, t]), i(function() {
            return o(a) && c({
                inst: a
            }), e(function() {
                o(a) && c({
                    inst: a
                })
            })
        }, [e]), u(r), r
    };
    r.useSyncExternalStore = void 0 !== n.useSyncExternalStore ? n.useSyncExternalStore : c
}, 2239, (e, t, r) => {
    "use strict";
    t.exports = e.r(55838)
}, 83599, 66319, 35675, 73375, 63059, 63209, e => {
    "use strict";
    let t;
    var r = e.i(71645),
        n = e.i(2239);
    e.s(["ERROR_REVALIDATE_EVENT", () => 3, "FOCUS_EVENT", () => 0, "MUTATE_EVENT", () => 2, "RECONNECT_EVENT", () => 1], 11671);
    var a = Object.prototype.hasOwnProperty;
    let l = new WeakMap,
        i = () => {},
        s = i(),
        u = Object,
        o = e => e === s,
        c = (e, t) => ({ ...e,
            ...t
        }),
        d = {},
        f = {},
        p = "undefined",
        g = typeof window != p,
        h = typeof document != p,
        v = g && "Deno" in window,
        y = (e, t) => {
            let r = l.get(e);
            return [() => !o(t) && e.get(t) || d, n => {
                if (!o(t)) {
                    let a = e.get(t);
                    t in f || (f[t] = a), r[5](t, c(a, n), a || d)
                }
            }, r[6], () => !o(t) && t in f ? f[t] : !o(t) && e.get(t) || d]
        },
        m = !0,
        [b, x] = g && window.addEventListener ? [window.addEventListener.bind(window), window.removeEventListener.bind(window)] : [i, i],
        w = {
            initFocus: e => (h && document.addEventListener("visibilitychange", e), b("focus", e), () => {
                h && document.removeEventListener("visibilitychange", e), x("focus", e)
            }),
            initReconnect: e => {
                let t = () => {
                        m = !0, e()
                    },
                    r = () => {
                        m = !1
                    };
                return b("online", t), b("offline", r), () => {
                    x("online", t), x("offline", r)
                }
            }
        },
        E = !r.default.useId,
        S = !g || v,
        k = S ? r.useEffect : r.useLayoutEffect,
        R = "u" > typeof navigator && navigator.connection,
        j = !S && R && (["slow-2g", "2g"].includes(R.effectiveType) || R.saveData),
        N = new WeakMap,
        _ = (e, t) => e === `[object ${t}]`,
        O = 0,
        T = e => {
            let t, r, n = typeof e,
                a = u.prototype.toString.call(e),
                l = _(a, "Date"),
                i = _(a, "RegExp"),
                s = _(a, "Object");
            if (u(e) !== e || l || i) t = l ? e.toJSON() : "symbol" == n ? e.toString() : "string" == n ? JSON.stringify(e) : "" + e;
            else {
                if (t = N.get(e)) return t;
                if (t = ++O + "~", N.set(e, t), Array.isArray(e)) {
                    for (r = 0, t = "@"; r < e.length; r++) t += T(e[r]) + ",";
                    N.set(e, t)
                }
                if (s) {
                    t = "#";
                    let n = u.keys(e).sort();
                    for (; !o(r = n.pop());) o(e[r]) || (t += r + ":" + T(e[r]) + ",");
                    N.set(e, t)
                }
            }
            return t
        },
        C = e => {
            if ("function" == typeof e) try {
                e = e()
            } catch (t) {
                e = ""
            }
            let t = e;
            return [e = "string" == typeof e ? e : (Array.isArray(e) ? e.length : e) ? T(e) : "", t]
        },
        L = 0,
        V = () => ++L;
    async function A(...e) {
        let [t, r, n, a] = e, i = c({
            populateCache: !0,
            throwOnError: !0
        }, "boolean" == typeof a ? {
            revalidate: a
        } : a || {}), u = i.populateCache, d = i.rollbackOnError, f = i.optimisticData, p = i.throwOnError;
        if ("function" == typeof r) {
            let e = [];
            for (let n of t.keys()) !/^\$(inf|sub)\$/.test(n) && r(t.get(n)._k) && e.push(n);
            return Promise.all(e.map(g))
        }
        return g(r);
        async function g(r) {
            let a, [c] = C(r);
            if (!c) return;
            let [g, h] = y(t, c), [v, m, b, x] = l.get(t), w = () => {
                let e = v[c];
                return ("function" == typeof i.revalidate ? i.revalidate(g().data, r) : !1 !== i.revalidate) && (delete b[c], delete x[c], e && e[0]) ? e[0](2).then(() => g().data) : g().data
            };
            if (e.length < 3) return w();
            let E = n,
                S = !1,
                k = V();
            m[c] = [k, 0];
            let R = !o(f),
                j = g(),
                N = j.data,
                _ = j._c,
                O = o(_) ? N : _;
            if (R && h({
                    data: f = "function" == typeof f ? f(O, N) : f,
                    _c: O
                }), "function" == typeof E) try {
                E = E(O)
            } catch (e) {
                a = e, S = !0
            }
            if (E && "function" == typeof E.then) {
                let e;
                if (E = await E.catch(e => {
                        a = e, S = !0
                    }), k !== m[c][0]) {
                    if (S) throw a;
                    return E
                }
                S && R && (e = a, "function" == typeof d ? d(e) : !1 !== d) && (u = !0, h({
                    data: O,
                    _c: s
                }))
            }
            if (u && !S && ("function" == typeof u ? h({
                    data: u(E, O),
                    error: s,
                    _c: s
                }) : h({
                    data: E,
                    error: s,
                    _c: s
                })), m[c][1] = V(), Promise.resolve(w()).then(() => {
                    h({
                        _c: s
                    })
                }), S) {
                if (p) throw a;
                return
            }
            return E
        }
    }
    let D = (e, t) => {
            for (let r in e) e[r][0] && e[r][0](t)
        },
        M = (e, t) => {
            if (!l.has(e)) {
                let r = c(w, t),
                    n = Object.create(null),
                    a = A.bind(s, e),
                    u = i,
                    o = Object.create(null),
                    d = (e, t) => {
                        let r = o[e] || [];
                        return o[e] = r, r.push(t), () => r.splice(r.indexOf(t), 1)
                    },
                    f = (t, r, n) => {
                        e.set(t, r);
                        let a = o[t];
                        if (a)
                            for (let e of a) e(r, n)
                    },
                    p = () => {
                        if (!l.has(e) && (l.set(e, [n, Object.create(null), Object.create(null), Object.create(null), a, f, d]), !S)) {
                            let t = r.initFocus(setTimeout.bind(s, D.bind(s, n, 0))),
                                a = r.initReconnect(setTimeout.bind(s, D.bind(s, n, 1)));
                            u = () => {
                                t && t(), a && a(), l.delete(e)
                            }
                        }
                    };
                return p(), [e, a, p, u]
            }
            return [e, l.get(e)[4]]
        },
        [P, F] = M(new Map),
        I = c({
            onLoadingSlow: i,
            onSuccess: i,
            onError: i,
            onErrorRetry: (e, t, r, n, a) => {
                let l = r.errorRetryCount,
                    i = a.retryCount,
                    s = ~~((Math.random() + .5) * (1 << (i < 8 ? i : 8))) * r.errorRetryInterval;
                (o(l) || !(i > l)) && setTimeout(n, s, a)
            },
            onDiscarded: i,
            revalidateOnFocus: !0,
            revalidateOnReconnect: !0,
            revalidateIfStale: !0,
            shouldRetryOnError: !0,
            errorRetryInterval: j ? 1e4 : 5e3,
            focusThrottleInterval: 5e3,
            dedupingInterval: 2e3,
            loadingTimeout: j ? 5e3 : 3e3,
            compare: function e(t, r) {
                var n, l;
                if (t === r) return !0;
                if (t && r && (n = t.constructor) === r.constructor) {
                    if (n === Date) return t.getTime() === r.getTime();
                    if (n === RegExp) return t.toString() === r.toString();
                    if (n === Array) {
                        if ((l = t.length) === r.length)
                            for (; l-- && e(t[l], r[l]););
                        return -1 === l
                    }
                    if (!n || "object" == typeof t) {
                        for (n in l = 0, t)
                            if (a.call(t, n) && ++l && !a.call(r, n) || !(n in r) || !e(t[n], r[n])) return !1;
                        return Object.keys(r).length === l
                    }
                }
                return t != t && r != r
            },
            isPaused: () => !1,
            cache: P,
            mutate: F,
            fallback: {}
        }, {
            isOnline: () => m,
            isVisible: () => {
                let e = h && document.visibilityState;
                return o(e) || "hidden" !== e
            }
        }),
        U = (e, t) => {
            let r = c(e, t);
            if (t) {
                let {
                    use: n,
                    fallback: a
                } = e, {
                    use: l,
                    fallback: i
                } = t;
                n && l && (r.use = n.concat(l)), a && i && (r.fallback = c(a, i))
            }
            return r
        },
        q = (0, r.createContext)({});
    var W = e.i(11671);
    let $ = g && window.__SWR_DEVTOOLS_USE__,
        B = ($ ? window.__SWR_DEVTOOLS_USE__ : []).concat(e => (t, r, n) => {
            let a = r && ((...e) => {
                let [n] = C(t), [, , , a] = l.get(P);
                if (n.startsWith("$inf$")) return r(...e);
                let i = a[n];
                return o(i) ? r(...e) : (delete a[n], i)
            });
            return e(t, a, n)
        });
    $ && (window.__SWR_DEVTOOLS_REACT__ = r.default);
    let H = () => {},
        J = H(),
        G = (new WeakMap, r.default.use || (e => {
            switch (e.status) {
                case "pending":
                    throw e;
                case "fulfilled":
                    return e.value;
                case "rejected":
                    throw e.reason;
                default:
                    throw e.status = "pending", e.then(t => {
                        e.status = "fulfilled", e.value = t
                    }, t => {
                        e.status = "rejected", e.reason = t
                    }), e
            }
        })),
        z = {
            dedupe: !0
        },
        K = Promise.resolve(s),
        Y = () => i;
    u.defineProperty(e => {
        let {
            value: t
        } = e, n = (0, r.useContext)(q), a = "function" == typeof t, l = (0, r.useMemo)(() => a ? t(n) : t, [a, n, t]), i = (0, r.useMemo)(() => a ? l : U(n, l), [a, n, l]), u = l && l.provider, o = (0, r.useRef)(s);
        u && !o.current && (o.current = M(u(i.cache || P), l));
        let d = o.current;
        return d && (i.cache = d[0], i.mutate = d[1]), k(() => {
            if (d) return d[2] && d[2](), d[3]
        }, []), (0, r.createElement)(q.Provider, c(e, {
            value: i
        }))
    }, "defaultValue", {
        value: I
    });
    let Z = (t = (e, t, a) => {
        let {
            cache: i,
            compare: u,
            suspense: d,
            fallbackData: f,
            revalidateOnMount: h,
            revalidateIfStale: v,
            refreshInterval: m,
            refreshWhenHidden: b,
            refreshWhenOffline: x,
            keepPreviousData: w,
            strictServerPrefetchWarning: R
        } = a, [j, N, _, O] = l.get(i), [T, L] = C(e), D = (0, r.useRef)(!1), M = (0, r.useRef)(!1), P = (0, r.useRef)(T), F = (0, r.useRef)(t), I = (0, r.useRef)(a), U = () => I.current.isVisible() && I.current.isOnline(), [q, $, B, H] = y(i, T), J = (0, r.useRef)({}).current, Z = o(f) ? o(a.fallback) ? s : a.fallback[T] : f, Q = (e, t) => {
            for (let r in J)
                if ("data" === r) {
                    if (!u(e[r], t[r]) && (!o(e[r]) || !u(es, t[r]))) return !1
                } else if (t[r] !== e[r]) return !1;
            return !0
        }, X = !D.current, ee = (0, r.useMemo)(() => {
            let e = q(),
                r = H(),
                n = e => {
                    let r = c(e);
                    return (delete r._k, (() => {
                        if (!T || !t || I.current.isPaused()) return !1;
                        if (X && !o(h)) return h;
                        let e = o(Z) ? r.data : Z;
                        return o(e) || v
                    })()) ? {
                        isValidating: !0,
                        isLoading: !0,
                        ...r
                    } : r
                },
                a = n(e),
                l = e === r ? a : n(r),
                i = a;
            return [() => {
                let e = n(q());
                return Q(e, i) ? (i.data = e.data, i.isLoading = e.isLoading, i.isValidating = e.isValidating, i.error = e.error, i) : (i = e, e)
            }, () => l]
        }, [i, T]), et = (0, n.useSyncExternalStore)((0, r.useCallback)(e => B(T, (t, r) => {
            Q(r, t) || e()
        }), [i, T]), ee[0], ee[1]), er = j[T] && j[T].length > 0, en = et.data, ea = o(en) ? Z && "function" == typeof Z.then ? G(Z) : Z : en, el = et.error, ei = (0, r.useRef)(ea), es = w ? o(en) ? o(ei.current) ? ea : ei.current : en : ea, eu = T && o(ea), eo = (0, r.useRef)(null);
        S || (0, n.useSyncExternalStore)(Y, () => (eo.current = !1, eo), () => (eo.current = !0, eo));
        let ec = eo.current;
        R && ec && !d && eu && console.warn(`Missing pre-initiated data for serialized key "${T}" during server-side rendering. Data fetching should be initiated on the server and provided to SWR via fallback data. You can set "strictServerPrefetchWarning: false" to disable this warning.`);
        let ed = !(!T || !t || I.current.isPaused()) && (!er || !!o(el)) && (X && !o(h) ? h : d ? !o(ea) && v : o(ea) || v),
            ef = o(et.isValidating) ? ed : et.isValidating,
            ep = o(et.isLoading) ? ed : et.isLoading,
            eg = (0, r.useCallback)(async e => {
                let t, r, n = F.current;
                if (!T || !n || M.current || I.current.isPaused()) return !1;
                let l = !0,
                    i = e || {},
                    c = !_[T] || !i.dedupe,
                    d = () => E ? !M.current && T === P.current && D.current : T === P.current,
                    f = {
                        isValidating: !1,
                        isLoading: !1
                    },
                    p = () => {
                        $(f)
                    },
                    g = () => {
                        let e = _[T];
                        e && e[1] === r && delete _[T]
                    },
                    h = {
                        isValidating: !0
                    };
                o(q().data) && (h.isLoading = !0);
                try {
                    if (c && ($(h), a.loadingTimeout && o(q().data) && setTimeout(() => {
                            l && d() && I.current.onLoadingSlow(T, a)
                        }, a.loadingTimeout), _[T] = [n(L), V()]), [t, r] = _[T], t = await t, c && setTimeout(g, a.dedupingInterval), !_[T] || _[T][1] !== r) return c && d() && I.current.onDiscarded(T), !1;
                    f.error = s;
                    let e = N[T];
                    if (!o(e) && (r <= e[0] || r <= e[1] || 0 === e[1])) return p(), c && d() && I.current.onDiscarded(T), !1;
                    let i = q().data;
                    f.data = u(i, t) ? i : t, c && d() && I.current.onSuccess(t, T, a)
                } catch (r) {
                    g();
                    let e = I.current,
                        {
                            shouldRetryOnError: t
                        } = e;
                    !e.isPaused() && (f.error = r, c && d()) && (e.onError(r, T, e), (!0 === t || "function" == typeof t && t(r)) && (!I.current.revalidateOnFocus || !I.current.revalidateOnReconnect || U()) && e.onErrorRetry(r, T, e, e => {
                        let t = j[T];
                        t && t[0] && t[0](W.ERROR_REVALIDATE_EVENT, e)
                    }, {
                        retryCount: (i.retryCount || 0) + 1,
                        dedupe: !0
                    }))
                }
                return l = !1, p(), !0
            }, [T, i]),
            eh = (0, r.useCallback)((...e) => A(i, P.current, ...e), []);
        if (k(() => {
                F.current = t, I.current = a, o(en) || (ei.current = en)
            }), k(() => {
                var e;
                let t;
                if (!T) return;
                let r = eg.bind(s, z),
                    n = 0;
                I.current.revalidateOnFocus && (n = Date.now() + I.current.focusThrottleInterval);
                let a = (e = (e, t = {}) => {
                    if (e == W.FOCUS_EVENT) {
                        let e = Date.now();
                        I.current.revalidateOnFocus && e > n && U() && (n = e + I.current.focusThrottleInterval, r())
                    } else if (e == W.RECONNECT_EVENT) I.current.revalidateOnReconnect && U() && r();
                    else if (e == W.MUTATE_EVENT) return eg();
                    else if (e == W.ERROR_REVALIDATE_EVENT) return eg(t)
                }, (t = j[T] || (j[T] = [])).push(e), () => {
                    let r = t.indexOf(e);
                    r >= 0 && (t[r] = t[t.length - 1], t.pop())
                });
                if (M.current = !1, P.current = T, D.current = !0, $({
                        _k: L
                    }), ed && !_[T])
                    if (o(ea) || S) r();
                    else g && typeof window.requestAnimationFrame != p ? window.requestAnimationFrame(r) : setTimeout(r, 1);
                return () => {
                    M.current = !0, a()
                }
            }, [T]), k(() => {
                let e;

                function t() {
                    let t = "function" == typeof m ? m(q().data) : m;
                    t && -1 !== e && (e = setTimeout(r, t))
                }

                function r() {
                    !q().error && (b || I.current.isVisible()) && (x || I.current.isOnline()) ? eg(z).then(t) : t()
                }
                return t(), () => {
                    e && (clearTimeout(e), e = -1)
                }
            }, [m, b, x, T]), (0, r.useDebugValue)(es), d) {
            if (!E && S && eu) throw Error("Fallback data is required when using Suspense in SSR.");
            eu && (F.current = t, I.current = a, M.current = !1);
            let e = O[T];
            if (G(!o(e) && eu ? eh(e) : K), !o(el) && eu) throw el;
            let r = eu ? eg(z) : K;
            !o(es) && eu && (r.status = "fulfilled", r.value = !0), G(r)
        }
        return {
            mutate: eh,
            get data() {
                return J.data = !0, es
            },
            get error() {
                return J.error = !0, el
            },
            get isValidating() {
                return J.isValidating = !0, ef
            },
            get isLoading() {
                return J.isLoading = !0, ep
            }
        }
    }, function(...e) {
        let n, a = (n = (0, r.useContext)(q), (0, r.useMemo)(() => c(I, n), [n])),
            [l, i, s] = "function" == typeof e[1] ? [e[0], e[1], e[2] || {}] : [e[0], null, (null === e[1] ? e[2] : e[1]) || {}],
            u = U(a, s),
            o = t,
            {
                use: d
            } = u,
            f = (d || []).concat(B);
        for (let e = f.length; e--;) o = f[e](o);
        return o(l, i || u.fetcher || null, u)
    });
    e.s(["default", () => Z], 83599);
    let Q = {
        JavaScript: "#f1e05a",
        TypeScript: "#3178c6",
        Python: "#3572A5",
        Java: "#b07219",
        Go: "#00ADD8",
        Rust: "#dea584",
        "C++": "#f34b7d",
        C: "#555555",
        "C#": "#178600",
        PHP: "#4F5D95",
        Ruby: "#701516",
        Swift: "#F05138",
        Kotlin: "#A97BFF",
        Dart: "#00B4AB",
        Scala: "#c22d40",
        Shell: "#89e051",
        HTML: "#e34c26",
        CSS: "#563d7c",
        Vue: "#41b883",
        Jupyter_Notebook: "#DA5B0B",
        R: "#198CE7",
        Lua: "#000080",
        Elixir: "#6e4a7e",
        Haskell: "#5e5086",
        Zig: "#ec915c"
    };
    e.s(["LANGUAGES", 0, [{
        value: "",
        label: "All Languages"
    }, {
        value: "javascript",
        label: "JavaScript"
    }, {
        value: "typescript",
        label: "TypeScript"
    }, {
        value: "python",
        label: "Python"
    }, {
        value: "java",
        label: "Java"
    }, {
        value: "go",
        label: "Go"
    }, {
        value: "rust",
        label: "Rust"
    }, {
        value: "c++",
        label: "C++"
    }, {
        value: "c",
        label: "C"
    }, {
        value: "c#",
        label: "C#"
    }, {
        value: "php",
        label: "PHP"
    }, {
        value: "ruby",
        label: "Ruby"
    }, {
        value: "swift",
        label: "Swift"
    }, {
        value: "kotlin",
        label: "Kotlin"
    }, {
        value: "dart",
        label: "Dart"
    }, {
        value: "scala",
        label: "Scala"
    }, {
        value: "shell",
        label: "Shell"
    }, {
        value: "html",
        label: "HTML"
    }, {
        value: "css",
        label: "CSS"
    }, {
        value: "vue",
        label: "Vue"
    }], "LANGUAGE_COLORS", 0, Q], 66319);
    var X = e.i(43476),
        ee = e.i(75254);
    let et = (0, ee.default)("star", [
            ["path", {
                d: "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",
                key: "r04s7s"
            }]
        ]),
        er = (0, ee.default)("git-fork", [
            ["circle", {
                cx: "12",
                cy: "18",
                r: "3",
                key: "1mpf1b"
            }],
            ["circle", {
                cx: "6",
                cy: "6",
                r: "3",
                key: "1lh9wr"
            }],
            ["circle", {
                cx: "18",
                cy: "6",
                r: "3",
                key: "1h7g24"
            }],
            ["path", {
                d: "M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9",
                key: "1uq4wg"
            }],
            ["path", {
                d: "M12 12v3",
                key: "158kv8"
            }]
        ]),
        en = (0, ee.default)("eye", [
            ["path", {
                d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",
                key: "1nclc0"
            }],
            ["circle", {
                cx: "12",
                cy: "12",
                r: "3",
                key: "1v7zrd"
            }]
        ]),
        ea = (0, ee.default)("external-link", [
            ["path", {
                d: "M15 3h6v6",
                key: "1q9fwt"
            }],
            ["path", {
                d: "M10 14 21 3",
                key: "gplh6r"
            }],
            ["path", {
                d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",
                key: "a6xqqp"
            }]
        ]);

    function el(e) {
        return e >= 1e3 ? `${(e/1e3).toFixed(1)}k` : e.toString()
    }

    function ei({
        repo: e,
        rank: t
    }) {
        let r = e.language ? Q[e.language] || "#8b8b8b" : null;
        return (0, X.jsxs)("a", {
            href: e.html_url,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "group flex gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/30 hover:bg-secondary",
            children: [(0, X.jsx)("div", {
                className: "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-secondary font-mono text-sm text-muted-foreground",
                children: t
            }), (0, X.jsxs)("div", {
                className: "flex min-w-0 flex-1 flex-col gap-2",
                children: [(0, X.jsxs)("div", {
                    className: "flex items-start justify-between gap-2",
                    children: [(0, X.jsx)("div", {
                        className: "min-w-0 flex-1",
                        children: (0, X.jsxs)("div", {
                            className: "flex items-center gap-2",
                            children: [(0, X.jsx)("img", {
                                src: e.owner.avatar_url || "/placeholder.svg",
                                alt: `${e.owner.login}'s avatar`,
                                className: "h-5 w-5 rounded-full",
                                width: 20,
                                height: 20
                            }), (0, X.jsx)("h3", {
                                className: "truncate font-mono text-sm font-semibold text-primary group-hover:underline",
                                children: e.full_name
                            })]
                        })
                    }), (0, X.jsx)(ea, {
                        className: "h-4 w-4 flex-shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    })]
                }), e.description && (0, X.jsx)("p", {
                    className: "line-clamp-2 text-sm text-muted-foreground",
                    children: e.description
                }), (0, X.jsxs)("div", {
                    className: "flex flex-wrap items-center gap-3",
                    children: [r && e.language && (0, X.jsxs)("span", {
                        className: "flex items-center gap-1 text-xs text-muted-foreground",
                        children: [(0, X.jsx)("span", {
                            className: "inline-block h-3 w-3 rounded-full",
                            style: {
                                backgroundColor: r
                            }
                        }), e.language]
                    }), (0, X.jsxs)("span", {
                        className: "flex items-center gap-1 text-xs text-muted-foreground",
                        children: [(0, X.jsx)(et, {
                            className: "h-3.5 w-3.5"
                        }), el(e.stargazers_count)]
                    }), (0, X.jsxs)("span", {
                        className: "flex items-center gap-1 text-xs text-muted-foreground",
                        children: [(0, X.jsx)(er, {
                            className: "h-3.5 w-3.5"
                        }), el(e.forks_count)]
                    }), (0, X.jsxs)("span", {
                        className: "flex items-center gap-1 text-xs text-muted-foreground",
                        children: [(0, X.jsx)(en, {
                            className: "h-3.5 w-3.5"
                        }), el(e.watchers_count)]
                    })]
                }), e.topics && e.topics.length > 0 && (0, X.jsx)("div", {
                    className: "flex flex-wrap gap-1.5",
                    children: e.topics.slice(0, 5).map(e => (0, X.jsx)("span", {
                        className: "rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary",
                        children: e
                    }, e))
                })]
            })]
        })
    }

    function es() {
        return (0, X.jsxs)("div", {
            className: "flex gap-4 rounded-lg border border-border bg-card p-4",
            children: [(0, X.jsx)("div", {
                className: "h-8 w-8 flex-shrink-0 animate-pulse rounded-md bg-secondary"
            }), (0, X.jsxs)("div", {
                className: "flex flex-1 flex-col gap-2",
                children: [(0, X.jsx)("div", {
                    className: "h-5 w-48 animate-pulse rounded bg-secondary"
                }), (0, X.jsx)("div", {
                    className: "h-4 w-full animate-pulse rounded bg-secondary"
                }), (0, X.jsxs)("div", {
                    className: "flex gap-3",
                    children: [(0, X.jsx)("div", {
                        className: "h-4 w-16 animate-pulse rounded bg-secondary"
                    }), (0, X.jsx)("div", {
                        className: "h-4 w-12 animate-pulse rounded bg-secondary"
                    }), (0, X.jsx)("div", {
                        className: "h-4 w-12 animate-pulse rounded bg-secondary"
                    })]
                })]
            })]
        })
    }
    e.s(["RepoCard", () => ei, "RepoCardSkeleton", () => es], 35675);
    let eu = (0, ee.default)("chevron-left", [
        ["path", {
            d: "m15 18-6-6 6-6",
            key: "1wnfg3"
        }]
    ]);
    e.s(["ChevronLeft", () => eu], 73375);
    let eo = (0, ee.default)("chevron-right", [
        ["path", {
            d: "m9 18 6-6-6-6",
            key: "mthhwq"
        }]
    ]);
    e.s(["ChevronRight", () => eo], 63059);
    let ec = (0, ee.default)("circle-alert", [
        ["circle", {
            cx: "12",
            cy: "12",
            r: "10",
            key: "1mglay"
        }],
        ["line", {
            x1: "12",
            x2: "12",
            y1: "8",
            y2: "12",
            key: "1pkeuh"
        }],
        ["line", {
            x1: "12",
            x2: "12.01",
            y1: "16",
            y2: "16",
            key: "4dfq90"
        }]
    ]);
    e.s(["AlertCircle", () => ec], 63209)
}]);