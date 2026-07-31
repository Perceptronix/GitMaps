export const __rspack_esm_id = 26031;
export const __rspack_esm_ids = [26031];
export const __webpack_modules__ = {
    386579(e, t, n) {
        var r = n(826099),
            i = n(296540);

        function a() {
            let e = performance.memory;
            return e ? .usedJSHeapSize && e ? .jsHeapSizeLimit ? Math.round(e.usedJSHeapSize / e.jsHeapSizeLimit * 1e4) / 100 : null
        }

        function o() {
            let e = performance.memory;
            return e ? .usedJSHeapSize ? ? null
        }

        function s({
            intervalMs: e = 5e3,
            maxDatapoints: t = 20,
            statName: n,
            tags: a
        }) {
            (0, i.useEffect)(() => {
                let i;
                if (!performance || !("memory" in performance) || t <= 0) return;
                let o = 0,
                    s = () => {
                        document.hidden && l()
                    },
                    l = () => {
                        void 0 !== i && (clearInterval(i), i = void 0), document.removeEventListener("visibilitychange", s)
                    },
                    c = () => {
                        ! function({
                            statName: e,
                            tags: t
                        }) {
                            requestIdleCallback(() => {
                                let n, i = (n = performance.memory, n ? .usedJSHeapSize ? Math.round(n.usedJSHeapSize / 1024 / 1024 * 10) / 10 : null);
                                i && (0, r.au)({
                                    name: e,
                                    value: i,
                                    tags: t
                                })
                            })
                        }({
                            statName: n,
                            tags: a
                        }), ++o >= t && l()
                    };
                return c(), o < t && (i = setInterval(c, e)), document.addEventListener("visibilitychange", s), () => {
                    l()
                }
            }, [e, t, n, a])
        }
        n.d(t, {
            Dg: () => o,
            L_: () => a,
            M0: () => s
        })
    },
    790932(e, t, n) {
        var r = n(826099),
            i = n(147966),
            a = n(386579);

        function o(e = .1) {
            if (Math.random() > e) return () => {};
            let t = (0, a.Dg)();
            if (null === t) return () => {};
            let n = t,
                s = 0,
                l = 0,
                c = (e, t) => {
                    (0, r.au)({
                        requestUrl: window.location.href,
                        name: e,
                        value: t
                    })
                },
                u = (e, t) => {
                    "u" > typeof requestIdleCallback ? requestIdleCallback(() => c(e, t)) : setTimeout(() => c(e, t), 0)
                },
                d = () => {
                    if (s >= 20) return void clearInterval(m);
                    let e = (0, a.Dg)();
                    if (null === e) return;
                    n = Math.max(n, e);
                    let t = Math.round(e / 1024 / 1024 * 100) / 100;
                    if (2 > Math.abs(t - l)) return;
                    s++, l = t, u("BROWSER_MEMORY_DIST_HEAP_USED", t);
                    let r = (0, a.L_)();
                    null !== r && u("BROWSER_MEMORY_DIST_HEAP_UTILIZATION", r)
                },
                m = setInterval(d, 3e4),
                p = () => {
                    if (i.XC ? .visibilityState === "hidden") {
                        let e = (0, a.Dg)();
                        null !== e && (u("BROWSER_MEMORY_DIST_SESSION_GROWTH", Math.round((e - t) / 1024 / 1024 * 100) / 100), u("BROWSER_MEMORY_DIST_SESSION_MAX", Math.round(n / 1024 / 1024 * 100) / 100))
                    }
                };
            i.XC ? .addEventListener("visibilitychange", p);
            let h = setTimeout(d, 5e3);
            return () => {
                clearInterval(m), clearTimeout(h), i.XC ? .removeEventListener("visibilitychange", p)
            }
        }
        n.d(t, {
            n: () => o
        })
    },
    384434(e, t, n) {
        let r;
        n.d(t, {
            setupWebVitals: () => ts
        });
        let i = () => {
                let e = performance.getEntriesByType("navigation")[0];
                if (e && e.responseStart > 0 && e.responseStart < performance.now()) return e
            },
            a = e => {
                if ("loading" === document.readyState) return "loading"; {
                    let t = i();
                    if (t) {
                        if (e < t.domInteractive) return "loading";
                        if (0 === t.domContentLoadedEventStart || e < t.domContentLoadedEventStart) return "dom-interactive";
                        if (0 === t.domComplete || e < t.domComplete) return "dom-content-loaded"
                    }
                }
                return "complete"
            },
            o = e => {
                let t = e.nodeName;
                return 1 === e.nodeType ? t.toLowerCase() : t.toUpperCase().replace(/^#/, "")
            },
            s = new WeakMap;

        function l(e, t) {
            return s.get(e) || s.set(e, new t), s.get(e)
        }
        let c = -1,
            u = e => {
                addEventListener("pageshow", t => {
                    t.persisted && (c = t.timeStamp, e(t))
                }, !0)
            },
            d = (e, t, n, r) => {
                let i, a;
                return o => {
                    let s;
                    t.value >= 0 && (o || r) && ((a = t.value - (i ? ? 0)) || void 0 === i) && (i = t.value, t.delta = a, s = t.value, t.rating = s > n[1] ? "poor" : s > n[0] ? "needs-improvement" : "good", e(t))
                }
            },
            m = e => {
                requestAnimationFrame(() => requestAnimationFrame(() => e()))
            },
            p = () => {
                let e = i();
                return e ? .activationStart ? ? 0
            },
            h = (e, t = -1) => {
                let n = i(),
                    r = "navigate";
                return c >= 0 ? r = "back-forward-cache" : n && (document.prerendering || p() > 0 ? r = "prerender" : document.wasDiscarded ? r = "restore" : n.type && (r = n.type.replace(/_/g, "-"))), {
                    name: e,
                    value: t,
                    rating: "good",
                    delta: 0,
                    entries: [],
                    id: `v5-${Date.now()}-${Math.floor(0x82f79cd8fff*Math.random())+1e12}`,
                    navigationType: r
                }
            },
            f = (e, t, n = {}) => {
                try {
                    if (PerformanceObserver.supportedEntryTypes.includes(e)) {
                        let r = new PerformanceObserver(e => {
                            Promise.resolve().then(() => {
                                t(e.getEntries())
                            })
                        });
                        return r.observe({
                            type: e,
                            buffered: !0,
                            ...n
                        }), r
                    }
                } catch {}
            },
            v = e => {
                let t = !1;
                return () => {
                    t || (e(), t = !0)
                }
            },
            g = -1,
            T = new Set,
            b = () => "hidden" !== document.visibilityState || document.prerendering ? 1 / 0 : 0,
            y = e => {
                if ("hidden" === document.visibilityState) {
                    if ("visibilitychange" === e.type)
                        for (let e of T) e();
                    isFinite(g) || (g = "visibilitychange" === e.type ? e.timeStamp : 0, removeEventListener("prerenderingchange", y, !0))
                }
            },
            E = () => {
                if (g < 0) {
                    let e = p();
                    g = (document.prerendering ? void 0 : globalThis.performance.getEntriesByType("visibility-state").filter(t => "hidden" === t.name && t.startTime > e)[0] ? .startTime) ? ? b(), addEventListener("visibilitychange", y, !0), addEventListener("prerenderingchange", y, !0), u(() => {
                        setTimeout(() => {
                            g = b()
                        })
                    })
                }
                return {
                    get firstHiddenTime() {
                        return g
                    },
                    onHidden(e) {
                        T.add(e)
                    }
                }
            },
            S = e => {
                document.prerendering ? addEventListener("prerenderingchange", () => e(), !0) : e()
            },
            w = [1800, 3e3],
            C = (e, t = {}) => {
                ((e, t = {}) => {
                    S(() => {
                        let n = E(),
                            r, i = h("FCP"),
                            a = f("paint", e => {
                                for (let t of e) "first-contentful-paint" === t.name && (a.disconnect(), t.startTime < n.firstHiddenTime && (i.value = Math.max(t.startTime - p(), 0), i.entries.push(t), r(!0)))
                            });
                        a && (r = d(e, i, w, t.reportAllChanges), u(n => {
                            r = d(e, i = h("FCP"), w, t.reportAllChanges), m(() => {
                                i.value = performance.now() - n.timeStamp, r(!0)
                            })
                        }))
                    })
                })(t => {
                    e((e => {
                        let t = {
                            timeToFirstByte: 0,
                            firstByteToFCP: e.value,
                            loadState: a(c)
                        };
                        if (e.entries.length) {
                            let n = i(),
                                r = e.entries.at(-1);
                            if (n) {
                                let i = n.activationStart || 0,
                                    o = Math.max(0, n.responseStart - i);
                                t = {
                                    timeToFirstByte: o,
                                    firstByteToFCP: e.value - o,
                                    loadState: a(e.entries[0].startTime),
                                    navigationEntry: n,
                                    fcpEntry: r
                                }
                            }
                        }
                        return Object.assign(e, {
                            attribution: t
                        })
                    })(t))
                }, t)
            };
        class L {
            m;
            u(e) {
                this.m ? .(e)
            }
        }
        let k = [2500, 4e3],
            P = (e, t = {}) => {
                let n = l(t = Object.assign({}, t), L),
                    r = new WeakMap;
                n.m = e => {
                    let n = e.element;
                    if (n) {
                        let i = t.generateTarget ? .(n) ? ? (e => {
                            let t = "";
                            try {
                                for (; 9 !== e ? .nodeType;) {
                                    let n = e,
                                        r = n.id ? "#" + n.id : [o(n), ...Array.from(n.classList).sort()].join(".");
                                    if (t.length + r.length > 99) return t || r;
                                    if (t = t ? r + ">" + t : r, n.id) break;
                                    e = n.parentNode
                                }
                            } catch {}
                            return t
                        })(n);
                        r.set(e, i)
                    }
                }, ((e, t = {}) => {
                    S(() => {
                        let n = E(),
                            r, i = h("LCP"),
                            a = l(t, L),
                            o = e => {
                                for (let o of (t.reportAllChanges || (e = e.slice(-1)), e)) a.u(o), o.startTime < n.firstHiddenTime && (i.value = Math.max(o.startTime - p(), 0), i.entries = [o], r())
                            },
                            s = f("largest-contentful-paint", o);
                        if (s) {
                            r = d(e, i, k, t.reportAllChanges);
                            let n = v(() => {
                                    o(s.takeRecords()), s.disconnect(), r(!0)
                                }),
                                a = e => {
                                    var t;
                                    let r;
                                    e.isTrusted && (t = n, r = globalThis.requestIdleCallback || setTimeout, "hidden" === document.visibilityState ? t() : (addEventListener("visibilitychange", t = v(t), {
                                        once: !0,
                                        capture: !0
                                    }), r(() => {
                                        t(), removeEventListener("visibilitychange", t, {
                                            capture: !0
                                        })
                                    })), removeEventListener(e.type, a, {
                                        capture: !0
                                    }))
                                };
                            for (let e of ["keydown", "click", "visibilitychange"]) addEventListener(e, a, {
                                capture: !0
                            });
                            u(n => {
                                r = d(e, i = h("LCP"), k, t.reportAllChanges), m(() => {
                                    i.value = performance.now() - n.timeStamp, r(!0)
                                })
                            })
                        }
                    })
                })(t => {
                    e((e => {
                        let t = {
                            timeToFirstByte: 0,
                            resourceLoadDelay: 0,
                            resourceLoadDuration: 0,
                            elementRenderDelay: e.value
                        };
                        if (e.entries.length) {
                            let n = i();
                            if (n) {
                                let i = n.activationStart || 0,
                                    a = e.entries.at(-1),
                                    o = a.url && performance.getEntriesByType("resource").filter(e => e.name === a.url)[0],
                                    s = Math.max(0, n.responseStart - i),
                                    l = Math.max(s, o ? (o.requestStart || o.startTime) - i : 0),
                                    c = Math.min(e.value, Math.max(l, o ? o.responseEnd - i : 0));
                                t = {
                                    target: r.get(a),
                                    timeToFirstByte: s,
                                    resourceLoadDelay: l - s,
                                    resourceLoadDuration: c - l,
                                    elementRenderDelay: e.value - c,
                                    navigationEntry: n,
                                    lcpEntry: a
                                }, a.url && (t.url = a.url), o && (t.lcpResourceEntry = o)
                            }
                        }
                        return Object.assign(e, {
                            attribution: t
                        })
                    })(t))
                }, t)
            },
            I = [800, 1800],
            _ = e => {
                document.prerendering ? S(() => _(e)) : "complete" !== document.readyState ? addEventListener("load", () => _(e), !0) : setTimeout(e)
            };
        var R = n(454997),
            N = n(804535),
            D = n(147966),
            M = n(826099),
            x = n(402604),
            A = n(432231);

        function O() {
            return Array.from(new Set([...(0, A.fQ)(), ...document.querySelector("react-app") ? .enabledFeatures || [], ...(0, A.G7)("speculation_rules") ? ["speculation_rules"] : []]))
        }
        var F = n(473279);
        let B = "js-parse-end";

        function H() {
            return {
                entries: [],
                parseTimeTotal: 0,
                decodedBodySizeTotal: 0,
                firstResponseEnd: 1 / 0,
                lastParseEnd: -1 / 0
            }
        }

        function q(e, t) {
            e.entries.push(t), e.parseTimeTotal += t.parseTime, e.decodedBodySizeTotal += t.decodedBodySize, t.responseEnd < e.firstResponseEnd && (e.firstResponseEnd = t.responseEnd), t.parseEnd > e.lastParseEnd && (e.lastParseEnd = t.parseEnd)
        }

        function z(e, t) {
            if (0 === e.entries.length) return 0;
            let n = Math.max(t, e.firstResponseEnd);
            return Math.max(0, e.lastParseEnd - n)
        }

        function U(e) {
            let t = performance.getEntriesByType("resource"),
                n = performance.getEntriesByType("mark"),
                r = performance.getEntriesByType("navigation")[0];
            if (!r) return;
            let i = performance.getEntriesByType("paint"),
                a = i.find(e => "first-paint" === e.name),
                o = i.find(e => "first-contentful-paint" === e.name),
                s = o ? .startTime ? ? e.value,
                l = e.value,
                c = function(e, t, n, r) {
                    let i = new Map;
                    for (let e of t) e.name.startsWith(B) && i.set(e.name, e);
                    let a = H(),
                        o = H(),
                        s = H();
                    for (let t of e) {
                        if ("script" !== t.initiatorType || t.name.endsWith(".css.js")) continue;
                        let e = function(e) {
                                try {
                                    return new URL(e, window.location.origin).pathname.split("/").pop() || e
                                } catch {
                                    return e
                                }
                            }(t.name),
                            l = i.get(`${B}:${e}`);
                        if (!l) continue;
                        let c = l.startTime - t.responseEnd;
                        if (c <= 0 || l.startTime >= r) continue;
                        let u = {
                            name: e,
                            downloadTime: t.responseEnd - t.responseStart,
                            parseTime: c,
                            transferSize: t.transferSize,
                            decodedBodySize: t.decodedBodySize,
                            responseEnd: t.responseEnd,
                            parseEnd: l.startTime
                        };
                        q(s, u), l.startTime < n ? q(a, u) : q(o, u)
                    }
                    return {
                        beforeFCP: a,
                        betweenFCPAndLCP: o,
                        all: s
                    }
                }(t, n, s, l),
                {
                    cssParseTime: u,
                    cssDownloadTime: d,
                    blockingCSSWeight: m
                } = function(e, t, n) {
                    let r = function() {
                            let e = document.querySelectorAll('link[rel="stylesheet"]'),
                                t = new Set;
                            for (let n of e) t.add(n.href);
                            return t
                        }(),
                        i = t ? .startTime ? ? n,
                        a = -1 / 0,
                        o = -1 / 0,
                        s = 0,
                        l = !1;
                    for (let t of e) {
                        if ("link" !== t.initiatorType || !r.has(t.name) || t.responseEnd >= i) continue;
                        l = !0, t.responseEnd > a && (a = t.responseEnd);
                        let e = t.responseEnd - t.responseStart;
                        e > o && (o = e), s += t.decodedBodySize
                    }
                    return l ? {
                        cssParseTime: t ? t.startTime - a : void 0,
                        cssDownloadTime: o,
                        blockingCSSWeight: s
                    } : {
                        cssParseTime: void 0,
                        cssDownloadTime: void 0,
                        blockingCSSWeight: void 0
                    }
                }(t, a, l),
                p = r.responseEnd - r.responseStart,
                h = r.domInteractive,
                f = r.domContentLoadedEventStart,
                v = h - r.responseEnd;
            return {
                ttfb: e.attribution.timeToFirstByte,
                fcp: o ? .startTime,
                elementRenderDelay: e.attribution.elementRenderDelay,
                htmlDownloadTime: p,
                htmlParseTime: v,
                htmlSize: r.decodedBodySize,
                domInteractive: h,
                domContentLoaded: f,
                cssDownloadTime: d,
                cssParseTime: u,
                jsBlockingFcp: c.beforeFCP.entries,
                jsParseTimeFcp: z(c.beforeFCP, 0),
                jsBlockingLcp: c.betweenFCPAndLCP.entries,
                jsParseTimeLcp: z(c.betweenFCPAndLCP, s),
                jsParseTimeTotal: c.all.parseTimeTotal,
                resourceLoadDelay: e.attribution.resourceLoadDelay,
                resourceLoadDuration: e.attribution.resourceLoadDuration,
                blockingJSWeight: c.beforeFCP.decodedBodySizeTotal,
                blockingCSSWeight: m
            }
        }

        function X({
            ssr: e,
            domNodes: t,
            previousDomNodes: n
        }) {
            let i = (r || (r = {}, W()), r);
            if (void 0 === i.react) {
                let t = document.querySelector("react-app");
                i.react = !!t, i.reactApp = t ? .getAttribute("app-name"), i.reactPartials = [...new Set(Array.from(document.querySelectorAll("react-partial")).map(e => e.getAttribute("partial-name") || ""))], i.featureFlags = O(), i.ssr = e, i.controller = document.querySelector('meta[name="route-controller"]') ? .content, i.action = document.querySelector('meta[name="route-action"]') ? .content, i.routePattern = document.querySelector('meta[name="route-pattern"]') ? .content, i.cpu = (0, F.p)(), i.automated = (0, M.Tq)(), i.navigationId = !("u" < typeof navigation) && "currentEntry" in navigation ? navigation.currentEntry ? .id ? ? "" : ""
            }
            return t && (i.domNodes = t), n && (i.previousDomNodes = n), i
        }

        function V({
            metric: e,
            ssr: t,
            domNodes: n,
            previousDomNodes: r,
            longTasks: i,
            longAnimationFrames: a
        }) {
            let o = X({
                ssr: t,
                domNodes: n,
                previousDomNodes: r
            });
            if (e) {
                var s, l, c;
                return s = o, void((l = e).value < 6e4 && ("HPC" === l.name ? s[l.name.toLocaleLowerCase()] = {
                    name: (c = l).name,
                    value: c.value,
                    element: c.attribution ? .element,
                    soft: !!c.soft,
                    mechanism: c.mechanism
                } : s[l.name.toLocaleLowerCase()] = function(e) {
                    let t = {
                        name: e.name,
                        value: e.value
                    };
                    switch (e.name) {
                        case "LCP":
                            t.breakdown = U(e), t.element = e.attribution ? .target;
                            break;
                        case "ElementTiming":
                            t.element = e.attribution ? .target;
                            break;
                        case "INP":
                            if (t.element = e.attribution ? .interactionTarget, e.attribution && "interactionType" in e.attribution) {
                                let n = e.attribution;
                                t.interactionType = n.interactionType, t.eventType = n.eventType, t.inputDelay = n.inputDelay, t.processingDuration = n.processingDuration, t.presentationDelay = n.presentationDelay
                            }
                            e.entries ? .length && (t.events = e.entries.map(e => e.name).join(","));
                            break;
                        case "CLS":
                            t.element = e.attribution ? .largestShiftTarget
                    }
                    return t
                }(l)))
            }
            o.longTasks = i, o.longAnimationFrames = a
        }
        async function W() {
            await N.K, window.requestIdleCallback(G)
        }

        function G() {
            r && ((0, x.BI)("web-vital", (0, x.Ti)(r)), r = void 0)
        }
        var j = n(552134),
            $ = n(357624),
            Y = n(175895);
        let K = 0;

        function J() {
            return D.XC ? .getElementsByTagName("*").length || 0
        }

        function Z() {
            return {
                previous: K,
                current: J()
            }
        }
        D.XC ? .addEventListener(Y.z.START, () => {
            K = J()
        });
        let Q = [
            ["200_001+", 2e5],
            ["100_001 - 200_000", 1e5],
            ["50_001 - 100_000", 5e4],
            ["25_001 - 50_000", 25e3],
            ["10_001 - 25_000", 1e4],
            ["1_001 - 10_000", 1e3],
            ["1 - 1_000", 0]
        ];

        function ee(e) {
            if (Number.isFinite(e) && !(e <= 0)) {
                for (let [t, n] of Q)
                    if (e > n) return t
            }
        }
        let et = 1 / 0,
            en = !1;

        function er(e) {
            "u" > typeof document && ("hidden" !== document.visibilityState || isFinite(et) || (et = "visibilitychange" === e.type ? e.timeStamp : 0))
        }

        function ei() {
            en || (en = !0, "u" > typeof document && (et = function() {
                if ("u" > typeof document) {
                    let e = "prerendering" in document && !0 === document.prerendering;
                    if ("hidden" === document.visibilityState && !e) return 0
                }
                return 1 / 0
            }(), document.addEventListener("visibilitychange", er, {
                capture: !0
            }), "prerendering" in document && document.addEventListener("prerenderingchange", er, {
                capture: !0
            })))
        }

        function ea(e, t) {
            requestIdleCallback(() => {
                (0, M.au)({
                    name: "BROWSER_VITALS_SUPPRESSED",
                    value: 1,
                    tags: {
                        metric: e,
                        reason: t
                    }
                })
            })
        }

        function eo(e, t) {
            return "page_hidden" === t ? (ea("ContainerTiming", "page_hidden"), !1) : "missing_first_render_time" === t ? (ea("ContainerTiming", "missing_first_render_time"), !1) : !!Number.isFinite(e) && !(e <= 0) && !(e > 3e4) || (ea("ContainerTiming", "value_exceeded"), !1)
        }
        var es = n(998336);

        function el(e, t = {}) {
            var n, r, i, a;
            let o, s, l;
            if (! function(e) {
                    let {
                        name: t,
                        value: n
                    } = e;
                    if ("INP" !== t && "LCP" !== t && "CLS" !== t && "ElementTiming" !== t && "HPC" !== t) return !0;
                    switch (t) {
                        case "INP":
                            if (n > 2500) return ea(t, "value_exceeded"), !1;
                            if (function(e) {
                                    if ("INP" !== e.name || !("attribution" in e) || !e.attribution) return !1;
                                    if ("processingDuration" in e.attribution) {
                                        let t = e.attribution.processingDuration;
                                        if ("number" == typeof t && t > 2e3) return !0
                                    }
                                    return !1
                                }(e)) return ea(t, "processing_exceeded"), !1;
                            break;
                        case "LCP":
                        case "ElementTiming":
                            if (n > 1e4) return ea(t, "value_exceeded"), !1;
                            if ("LCP" === t && function(e) {
                                    if ("LCP" !== e.name || !("attribution" in e) || !e.attribution) return !1;
                                    let t = e.attribution;
                                    return "elementRenderDelay" in t && "number" == typeof t.elementRenderDelay && !!(t.elementRenderDelay > 8e3)
                                }(e)) return ea(t, "render_delay_exceeded"), !1;
                            break;
                        case "CLS":
                            if (n > 5) return ea(t, "value_exceeded"), !1;
                            break;
                        case "HPC":
                            if (n > 3e4) return ea(t, "value_exceeded"), !1
                    }
                    return !0
                }(e)) return;
            let {
                name: c,
                value: u
            } = e, d = {
                name: t.url || window.location.href,
                cpu: (0, F.p)()
            };
            if (d[c.toLowerCase()] = u, (0, A.G7)("sample_network_conn_type") && (d.networkConnType = "connection" in navigator && navigator.connection && "effectiveType" in navigator.connection ? navigator.connection.effectiveType : "N/A"), "ElementTiming" === c && (d.identifier = e.identifier), "HPC" === c ? eu(d, e) : "LCP" === c ? ec(d, e) : "CLS" === c && (d.soft = es.c.soft, d.mechanism = j.nW[es.c.mechanism]), "INP" === c && "interactionType" in (e.attribution || {})) {
                let n = e.attribution;
                d.inpInteractionType = n ? .interactionType, d.inpEventType = n ? .eventType, d.inpBottleneck = function(e) {
                    if (!e) return;
                    let {
                        inputDelay: t,
                        processingDuration: n,
                        presentationDelay: r
                    } = e;
                    if (void 0 !== t && void 0 !== n && void 0 !== r) return n >= t && n >= r ? "processing" : t >= r ? "input_delay" : "presentation"
                }(n);
                let r = Z();
                void 0 !== r.current && (d.domNodes = r.current), void 0 !== r.previous && (d.previousDomNodes = r.previous);
                let i = {
                        cpu: (0, F.p)()
                    },
                    a = void 0 !== r.current ? ee(r.current) : void 0,
                    o = void 0 !== r.previous ? ee(r.previous) : void 0;
                void 0 !== a && (i.domNodesBucket = a), void 0 !== o && (i.previousDomNodesBucket = o), n ? .inputDelay !== void 0 && (0, M.au)({
                    name: "BROWSER_VITALS_DIST_INP_INPUT_DELAY",
                    value: n.inputDelay,
                    tags: i,
                    requestUrl: t.url
                }), n ? .processingDuration !== void 0 && (0, M.au)({
                    name: "BROWSER_VITALS_DIST_INP_PROCESSING",
                    value: n.processingDuration,
                    tags: i,
                    requestUrl: t.url
                }), n ? .presentationDelay !== void 0 && (0, M.au)({
                    name: "BROWSER_VITALS_DIST_INP_PRESENTATION",
                    value: n.presentationDelay,
                    tags: i,
                    requestUrl: t.url
                })
            }
            if ("HPC" === c) {
                let e = Z();
                d.domNodes = e.current, d.previousDomNodes = e.previous
            }
            document.querySelector('meta[name="synthetic-test"]') && (d.synthetic = !0), n = c, r = d, o = `web-vitals:${n.toLowerCase()}`, D.XC ? .dispatchEvent(new CustomEvent(o, {
                detail: r
            }));
            let m = function() {
                if (!es.c.soft) return D.XC ? .querySelector('meta[name="request-id"]') ? .content || void 0
            }();
            (0, M.iv)({
                webVitalTimings: [d],
                requestUrl: t.url || window.location.href,
                referredRequestUrl: (0, $.dR)(),
                ...m ? {
                    requestId: m
                } : {}
            }), V({
                metric: e,
                ssr: !!d.ssr,
                domNodes: d.domNodes,
                previousDomNodes: d.previousDomNodes
            }), i = c, a = u, s = document.querySelector("#staff-bar-web-vitals"), (l = s ? .querySelector(`[data-metric=${i.toLowerCase()}]`)) && (l.textContent = a.toPrecision(6))
        }
        let ec = (e, t) => {
                e.lcpBreakdown = U(t)
            },
            eu = (e, t) => {
                e.soft = t.soft, e.ssr = t.ssr, e.mechanism = j.nW[t.mechanism], e.lazy = t.lazy, e.alternate = t.alternate, e.hpcFound = t.found, e.hpcGqlFetched = t.gqlFetched, e.hpcJsFetched = t.jsFetched, e.headerRedesign = (0, R.Dk)(), e.app = t.app
            };
        async function ed() {
            window.performance && window.performance.timing && window.performance.getEntriesByType && (await N.K, await new Promise(e => setTimeout(e)), em(), ep())
        }
        let em = () => {
                let e = window.performance.getEntriesByType("resource").map(e => ({
                    name: e.name,
                    entryType: e.entryType,
                    startTime: e.startTime,
                    duration: e.duration,
                    initiatorType: e.initiatorType,
                    nextHopProtocol: e.nextHopProtocol,
                    workerStart: e.workerStart,
                    redirectStart: e.redirectStart,
                    redirectEnd: e.redirectEnd,
                    fetchStart: e.fetchStart,
                    domainLookupStart: e.domainLookupStart,
                    domainLookupEnd: e.domainLookupEnd,
                    connectStart: e.connectStart,
                    connectEnd: e.connectEnd,
                    secureConnectionStart: e.secureConnectionStart,
                    requestStart: e.requestStart,
                    responseStart: e.responseStart,
                    responseEnd: e.responseEnd,
                    transferSize: e.transferSize,
                    encodedBodySize: e.encodedBodySize,
                    decodedBodySize: e.decodedBodySize
                }));
                e.length && (0, M.iv)({
                    resourceTimings: e
                }, !1, .05)
            },
            ep = () => {
                let e = window.performance.getEntriesByType("navigation").map(e => ({
                    activationStart: e.activationStart,
                    name: e.name,
                    entryType: e.entryType,
                    startTime: e.startTime,
                    duration: e.duration,
                    initiatorType: e.initiatorType,
                    nextHopProtocol: e.nextHopProtocol,
                    workerStart: e.workerStart,
                    redirectStart: e.redirectStart,
                    redirectEnd: e.redirectEnd,
                    fetchStart: e.fetchStart,
                    domainLookupStart: e.domainLookupStart,
                    domainLookupEnd: e.domainLookupEnd,
                    connectStart: e.connectStart,
                    connectEnd: e.connectEnd,
                    secureConnectionStart: e.secureConnectionStart,
                    requestStart: e.requestStart,
                    responseStart: e.responseStart,
                    responseEnd: e.responseEnd,
                    transferSize: e.transferSize,
                    encodedBodySize: e.encodedBodySize,
                    decodedBodySize: e.decodedBodySize,
                    unloadEventStart: e.unloadEventStart,
                    unloadEventEnd: e.unloadEventEnd,
                    domInteractive: e.domInteractive,
                    domContentLoadedEventStart: e.domContentLoadedEventStart,
                    domContentLoadedEventEnd: e.domContentLoadedEventEnd,
                    domComplete: e.domComplete,
                    loadEventStart: e.loadEventStart,
                    loadEventEnd: e.loadEventEnd,
                    type: e.type,
                    redirectCount: e.redirectCount
                }));
                e.length && (0, M.iv)({
                    navigationTimings: e
                }, !1, .05)
            };

        function eh(e) {
            "hidden" !== document.visibilityState && ((0, x.BI)("icv", (0, x.Ti)(e)), (0, M.au)({
                name: "BROWSER_VITALS_ICV",
                value: e.value,
                tags: {
                    actionName: "data-icv-name" === e.nameFoundBy ? e.actionName : "missing [data-icv-name] attribute",
                    endpoints: e.endpoints.length
                }
            }))
        }
        let ef = e => {
                let t = e.nodeName;
                return 1 === e.nodeType ? t.toLowerCase() : t.toUpperCase().replace(/^#/, "")
            },
            ev = /^_[rR]_[\da-z]+_$/,
            eg = (e, t) => {
                let n = "";
                try {
                    for (; e && 9 !== e.nodeType;) {
                        let r = e,
                            i = !!r.id && !ev.test(r.id),
                            a = i ? `#${r.id}` : ef(r) + (r.classList && r.classList.value && r.classList.value.trim() && r.classList.value.trim().length ? `.${r.classList.value.trim().replace(/\s+/g,".")}` : "");
                        if (n.length + a.length > (t || 100) - 1) return n || a;
                        if (n = n ? `${a}>${n}` : a, i) break;
                        e = r.parentNode
                    }
                } catch {}
                return n
            };
        class eT extends Event {
            name = "HPC";
            value;
            attribution;
            soft;
            ssr;
            lazy;
            alternate;
            mechanism;
            found;
            gqlFetched;
            jsFetched;
            app;
            overhead = 0;
            constructor(e, t, n, r, i, a, o, s, l, c, u, d = 0) {
                super("hpc:timing"), this.soft = e, this.ssr = t, this.lazy = n, this.alternate = r, this.mechanism = i, this.found = a, this.gqlFetched = o, this.jsFetched = s, this.app = l, this.overhead = d, this.value = performance.now() - c + d, this.attribution = {
                    element: eg(u)
                }
            }
        }
        class eb extends Event {
            element;
            constructor(e) {
                super("hpc:dom-insertion"), this.element = e
            }
        }
        class ey {
            interacted = !1;
            tabHidden = !1;#
            e = new AbortController;
            constructor(e = {}) {
                if (!D.XC) return;
                this.tabHidden = "hidden" === D.XC.visibilityState;
                let t = {
                        capture: !0,
                        passive: !0,
                        once: !0,
                        signal: this.#e.signal
                    },
                    n = () => {
                        this.interacted = !0, e.onInteracted ? .()
                    };
                D.XC.addEventListener("touchstart", n, t), D.XC.addEventListener("mousedown", n, t), D.XC.addEventListener("keydown", n, t), D.XC.addEventListener("pointerdown", n, t);
                let r = {
                        capture: !0,
                        passive: !0,
                        signal: this.#e.signal
                    },
                    i = () => {
                        D.XC ? .visibilityState === "hidden" && (this.tabHidden = !0, e.onHidden ? .())
                    };
                D.XC.addEventListener("visibilitychange", i, r), D.XC.addEventListener("pagehide", () => {
                    this.tabHidden = !0, e.onHidden ? .()
                }, { ...r,
                    once: !0
                })
            }
            teardown() {
                this.#e.abort()
            }
        }

        function eE({
            name: e,
            track: t,
            color: n,
            tooltipText: r,
            start: i = "navigationStart",
            end: a
        }) {
            try {
                let o = {
                    start: i,
                    detail: {
                        devtools: {
                            dataType: "track-entry",
                            track: t,
                            trackGroup: "Performance Timeline",
                            color: n,
                            tooltipText: r
                        }
                    }
                };
                void 0 !== a && (o.end = a), window.performance.measure(e, o)
            } catch {}
        }
        var eS = n(508995),
            ew = n(115927);

        function eC() {
            return (0, M.UR)(), {
                app: (0, ew.f)() || "rails",
                ssr: (0, eS.g5)(),
                lazy: (0, R._)(),
                alternate: (0, R.u$)(),
                gqlFetched: (0, R.aE)(),
                jsFetched: (0, R.xF)()
            }
        }
        let eL = ["meta", "script", "link"];
        class ek {
            abortController = new AbortController;
            insertionFound = !1;
            hpcElement = null;
            latestHPCElement;
            mechanismOverride;
            hpcTarget = new EventTarget;
            animationFrame;
            dataHPCanimationFrame;
            emulatedHPCTimer;
            overhead = 0;
            interactionGate;
            hpcDOMInsertionObserver = null;
            ssrPaintObserver = null;
            callback;
            constructor({
                latestHPCElement: e,
                callback: t
            }) {
                es.c.ensure(), (0, $.wG)() && (this.mechanismOverride = "turbo.error", this.overhead = (0, $._W)() ? ? 0), this.latestHPCElement = e, this.callback = t
            }
            get soft() {
                return es.c.soft
            }
            get hpcStart() {
                return es.c.navStart
            }
            get mechanism() {
                return this.mechanismOverride ? ? es.c.mechanism
            }
            get tabHidden() {
                return this.interactionGate ? .tabHidden ? ? !1
            }
            connect() {
                if (!this.soft) {
                    let e = document.querySelector("[data-hpc]");
                    if (e) {
                        this.hpcElement = e, this.#t(e);
                        return
                    }
                    setTimeout(() => {
                        this.insertionFound || this.setLCPasHPC(this.soft, !1, this.callback)
                    }, 1e4)
                }
                this.#n(), this.hpcDOMInsertionObserver = this.#r(), this.hpcDOMInsertionObserver.observe(document, {
                    childList: !0,
                    subtree: !0
                })
            }
            disconnect() {
                this.ssrPaintObserver ? .disconnect(), this.ssrPaintObserver = null, this.#i(), this.hpcDOMInsertionObserver ? .disconnect()
            }#
            r() {
                return new MutationObserver(e => {
                    let t = !1,
                        n = null,
                        r = e.filter(e => "childList" === e.type && e.addedNodes.length > 0);
                    if (0 === r.length) return;
                    let i = r.flatMap(e => Array.from(e.addedNodes)).filter(e => e instanceof Element && !eL.includes(e.tagName.toLowerCase()));
                    if (0 === i.length) return;
                    for (let e of i)
                        if (n = e.hasAttribute("data-hpc") ? e : e.querySelector("[data-hpc]")) {
                            this.hpcElement = n, this.animationFrame && cancelAnimationFrame(this.animationFrame), t = !0;
                            break
                        }
                    if (t && n) return void this.#a(n);
                    let a = i.filter(e => e instanceof HTMLElement);
                    0 !== a.length && (this.animationFrame && cancelAnimationFrame(this.animationFrame), this.animationFrame = requestAnimationFrame(() => {
                        for (let e of a)
                            if (e.checkVisibility()) return void this.hpcTarget.dispatchEvent(new eb(e))
                    }))
                })
            }#
            a(e) {
                let t = eC();
                eE({
                    name: "HPC",
                    track: "HPC",
                    color: "primary-dark",
                    tooltipText: "HPC (DOM insertion)"
                }), this.hpcDOMInsertionObserver ? .disconnect();
                let n = new eT(this.soft, t.ssr, t.lazy, t.alternate, this.mechanism, !0, t.gqlFetched, t.jsFetched, t.app, this.hpcStart, e, this.overhead);
                this.dataHPCanimationFrame = requestAnimationFrame(() => {
                    this.hpcTarget.dispatchEvent(n)
                })
            }#
            i() {
                this.interactionGate ? .teardown(), this.interactionGate = void 0, document.removeEventListener(Y.z.RENDER, this.onSoftNavRender), this.hpcTarget.removeEventListener("hpc:dom-insertion", this.onDOMInsertion), this.hpcTarget.removeEventListener("hpc:timing", this.onHPCTiming), this.abortController.signal.removeEventListener("abort", this.onAbort)
            }#
            n() {
                this.interactionGate = new ey({
                    onInteracted: this.stop,
                    onHidden: this.stop
                }), this.hpcTarget.addEventListener("hpc:dom-insertion", this.onDOMInsertion, {
                    signal: this.abortController.signal
                }), this.hpcTarget.addEventListener("hpc:timing", this.onHPCTiming, {
                    signal: this.abortController.signal
                }), document.addEventListener(Y.z.RENDER, this.onSoftNavRender), this.abortController.signal.addEventListener("abort", this.onAbort)
            }
            stop = () => {
                this.abortController.abort()
            };
            onDOMInsertion = e => {
                this.insertionFound = !0, clearTimeout(this.emulatedHPCTimer);
                let t = eC(),
                    n = new eT(this.soft, t.ssr, t.lazy, t.alternate, this.mechanism, !1, t.gqlFetched, t.jsFetched, t.app, this.hpcStart, e.element, this.overhead);
                this.emulatedHPCTimer = setTimeout(() => this.hpcTarget.dispatchEvent(n), 1e4)
            };
            onHPCTiming = e => {
                !this.tabHidden && e.value < 6e4 && this.callback(e), this.abortController.abort()
            };
            onSoftNavRender = () => {
                let e = document.querySelector("[data-hpc]");
                this.hpcElement = e, e && e === this.latestHPCElement && this.#a(e)
            };
            onAbort = () => {
                this.dataHPCanimationFrame && cancelAnimationFrame(this.dataHPCanimationFrame), this.animationFrame && cancelAnimationFrame(this.animationFrame), clearTimeout(this.emulatedHPCTimer), this.disconnect()
            };#
            t(e) {
                if ("u" < typeof PerformanceObserver || !PerformanceObserver.supportedEntryTypes ? .includes("largest-contentful-paint")) return void this.setLCPasHPC(this.soft, !0, this.callback);
                try {
                    let t = new PerformanceObserver(n => {
                        t.disconnect(), this.ssrPaintObserver = null;
                        let r = n.getEntries().find(t => {
                            let n = t.element;
                            return n && (e === n || e.contains(n))
                        });
                        if (r) {
                            let t = r.element ? ? e,
                                n = r.startTime;
                            P(() => {
                                this.#o(n, t)
                            })
                        } else this.setLCPasHPC(this.soft, !0, this.callback)
                    });
                    this.ssrPaintObserver = t, t.observe({
                        type: "largest-contentful-paint",
                        buffered: !0
                    })
                } catch {
                    this.setLCPasHPC(this.soft, !0, this.callback)
                }
            }#
            o(e, t) {
                let n = eC();
                eE({
                    name: "HPC",
                    track: "HPC",
                    color: "primary-dark",
                    tooltipText: "HPC (SSR)",
                    start: 0,
                    end: e
                });
                let r = "turbo.error" === this.mechanism ? this.mechanism : "hard";
                "hidden" !== document.visibilityState && e < 6e4 && this.callback({
                    name: "HPC",
                    value: e + this.overhead,
                    soft: !1,
                    found: !0,
                    ...n,
                    mechanism: r,
                    attribution: {
                        element: eg(t)
                    }
                })
            }
            setLCPasHPC(e, t, n) {
                let r = "turbo.error" === this.mechanism ? this.mechanism : "hard";
                P(({
                    value: i,
                    attribution: a
                }) => {
                    let o = eC();
                    eE({
                        name: "HPC",
                        track: "HPC",
                        color: "primary-dark",
                        tooltipText: "HPC (LCP fallback)",
                        end: i
                    }), n({
                        name: "HPC",
                        value: i + this.overhead,
                        soft: e,
                        found: t,
                        ...o,
                        mechanism: r,
                        attribution: {
                            element: a ? .target
                        }
                    })
                })
            }
        }
        class eP {
            teardown() {}
        }
        class eI {
            interactionCountEstimate = 0;
            minKnownInteractionId = 1 / 0;
            maxKnownInteractionId = 0;
            observer;
            get interactionCount() {
                return this.observer ? this.interactionCountEstimate : performance.interactionCount || 0
            }
            teardown() {
                this.observer && (this.observer.takeRecords(), this.observer.disconnect(), this.observer = void 0)
            }
            updateEstimate = e => {
                for (let t of e) t.interactionId && (this.minKnownInteractionId = Math.min(this.minKnownInteractionId, t.interactionId), this.maxKnownInteractionId = Math.max(this.maxKnownInteractionId, t.interactionId), this.interactionCountEstimate = this.maxKnownInteractionId ? (this.maxKnownInteractionId - this.minKnownInteractionId) / 7 + 1 : 0)
            };
            observe() {
                "interactionCount" in performance || this.observer || (this.observer = new PerformanceObserver(async e => {
                    await Promise.resolve(), this.updateEstimate(e.getEntries())
                }), this.observer.observe({
                    type: "event",
                    buffered: !0,
                    durationThreshold: 0
                }))
            }
        }
        class e_ {
            interactions = [];
            interactionsMap = new Map;
            maxSize;
            constructor(e) {
                this.maxSize = e
            }
            get shortestInteraction() {
                return this.interactions[this.interactions.length - 1]
            }
            get(e) {
                return this.interactionsMap.get(e)
            }
            update(e, t) {
                t.duration > e.latency ? (e.entries = [t], e.latency = t.duration, this.sort()) : t.duration === e.latency && e.entries[0] && t.startTime === e.entries[0].startTime && e.entries.push(t)
            }
            add(e) {
                let t = this.shortestInteraction;
                if ((this.interactions.length <= this.maxSize || !t || e.latency > t.latency) && (this.interactionsMap.set(e.id, e), this.interactions.push(e), this.sort(), this.interactions.length > this.maxSize)) {
                    let e = this.interactions.pop();
                    e && this.interactionsMap.delete(e.id)
                }
            }
            sort() {
                this.interactions.sort((e, t) => t.latency - e.latency)
            }
            findEntry(e) {
                return this.interactions.some(t => t.entries.some(t => e.duration === t.duration && e.startTime === t.startTime))
            }
            estimateP98(e) {
                let t = Math.min(this.interactions.length - 1, Math.floor(e / 50));
                return this.interactions[t]
            }
        }
        class eR {
            value;
            entries;
            constructor(e, t) {
                this.value = e, this.entries = t
            }
        }
        let eN = new Set(["input", "keydown", "keyup", "keypress"]),
            eD = new Set(["click", "pointerdown", "pointerup", "mousedown", "mouseup"]),
            eM = new WeakMap;

        function ex(e) {
            if ("SELECT" === e.tagName) return !0;
            let t = e.getAttribute("role");
            return "listbox" === t || "combobox" === t
        }

        function eA(e, t) {
            let n = e.name,
                {
                    isDisclosure: r,
                    isSubmitButton: i,
                    isTextInput: a,
                    isSelection: o,
                    isPointerEventEventType: s
                } = function(e, t) {
                    var n;
                    let r = eM.get(e);
                    if (r) return r;
                    let i = (n = e.name, eD.has(n)),
                        a = eN.has(e.name);
                    if (!i && !a && !(t && ex(t))) {
                        let t = {
                            isDisclosure: !1,
                            isSubmitButton: !1,
                            isTextInput: !1,
                            isSelection: !1,
                            isPointerEventEventType: i,
                            isInputEventType: a
                        };
                        return eM.set(e, t), t
                    }
                    let o = !1,
                        s = !1,
                        l = !1,
                        c = !1;
                    if (t) {
                        if (c = ex(t), i) {
                            let e = t.closest('details, [aria-expanded], button[type="submit"], input[type="submit"]');
                            e && ("DETAILS" === e.tagName || e.hasAttribute("aria-expanded") ? o = !0 : ("BUTTON" === e.tagName && "submit" === e.type || "INPUT" === e.tagName && "submit" === e.type) && (s = !0))
                        }
                        if (a)
                            if ("TEXTAREA" === t.tagName) l = !0;
                            else if ("INPUT" === t.tagName) {
                            let e = t.type;
                            l = "button" !== e && "submit" !== e
                        } else t instanceof HTMLElement && t.isContentEditable && (l = !0)
                    }
                    let u = {
                        isDisclosure: o,
                        isSubmitButton: s,
                        isTextInput: l,
                        isSelection: c,
                        isPointerEventEventType: i,
                        isInputEventType: a
                    };
                    return eM.set(e, u), u
                }(e, t);
            return r ? "disclosure" : i || "submit" === n ? "submit" : a ? "text_input" : o ? "selection" : s ? "action_click" : "unknown"
        }
        class eO extends eR {
            name = "INP";#
            s;#
            l;
            constructor(e, t, n, r) {
                super(e, t), this.#s = n, this.#l = r
            }
            get attribution() {
                let e;
                for (let t of this.entries)(!e || t.duration > e.duration) && (e = t);
                let t = void 0 !== this.#s,
                    n = t ? null : e ? .target ? ? null,
                    r = t ? this.#s ? ? "" : e && n ? eg(n) : "",
                    i = void 0 !== this.#l ? this.#l : e ? eA(e, n) : void 0,
                    a = e ? e.processingStart - e.startTime : void 0,
                    o = e ? e.processingEnd - e.processingStart : void 0,
                    s = e ? e.duration - (e.processingEnd - e.startTime) : void 0;
                return {
                    interactionTarget: r,
                    interactionType: i,
                    eventType: e ? .name,
                    inputDelay: a,
                    processingDuration: o,
                    presentationDelay: s
                }
            }
        }
        let eF = {
            mousedown: "pointerdown",
            mouseup: "pointerup",
            mousemove: "pointermove",
            mouseenter: "pointerenter",
            mouseleave: "pointerleave",
            mouseover: "pointerover",
            mouseout: "pointerout",
            touchstart: "pointerdown",
            touchend: "pointerup",
            touchmove: "pointermove",
            touchcancel: "pointercancel"
        };
        class eB extends eP {
            interactions = new e_(10);
            interactionCountObserver;
            registeredCallbacks = new Set;
            constructor() {
                super(), this.interactionCountObserver = new eI, this.interactionCountObserver.observe()
            }
            get metric() {
                let e = this.interactions.estimateP98(this.interactionCountObserver.interactionCount);
                return e ? new eO(e.latency, e.entries, e.targetSelector, e.interactionType) : null
            }
            teardown() {
                this.registeredCallbacks.clear(), this.interactionCountObserver.teardown()
            }
            processEntries(e) {
                let t = new Map;
                for (let n of e) {
                    if (n.interactionId) {
                        for (let e of this.registeredCallbacks)(function(e, t) {
                            var n;
                            let r = eF[n = t.type] ? ? n;
                            return (e.name === r || e.name === t.type) && (e.target === t.target || 1 > Math.abs(e.startTime - t.timeStamp))
                        })(n, e.event) && (t.set(String(n.interactionId), e.cb), this.registeredCallbacks.delete(e));
                        this.processEntry(n);
                        continue
                    }
                    "first-input" !== n.entryType || this.interactions.findEntry(n) || this.processEntry(n)
                }
                for (let [e, n] of t) {
                    let t = this.interactions.get(e);
                    t && n(t)
                }
            }
            processEntry(e) {
                let t = this.interactions.get(String(e.interactionId));
                if (t) {
                    if (!t.targetSelector && e.target) {
                        let n = e.target;
                        t.targetSelector = eg(n), t.interactionType = eA(e, n)
                    }
                    return this.interactions.update(t, e)
                }
                let n = e.target ? ? null,
                    r = {
                        id: String(e.interactionId),
                        latency: e.duration,
                        entries: [e],
                        targetSelector: n ? eg(n) : "",
                        interactionType: eA(e, n)
                    };
                this.interactions.add(r)
            }
        }
        class eH {
            cb;
            entryProcessor;
            observer;
            url;
            constructor(e) {
                this.cb = e, this.entryProcessor = this.initializeProcessor(), this.setupListeners()
            }
            setupListeners() {
                if (!this.supported) return;
                let e = e => {
                    ("pagehide" === e.type || "hidden" === document.visibilityState) && this.report({
                        isPageHide: !0,
                        source: e.type
                    })
                };
                D.XC ? .addEventListener("visibilitychange", e, !0), D.XC ? .addEventListener("pagehide", e, !0), D.XC ? .addEventListener(this.softNavEventToListen, () => {
                    this.report({
                        source: "soft-nav"
                    }), this.reset()
                })
            }
            report(e) {
                this.entryProcessor.metric && !(this.entryProcessor.metric.value < 0) && this.cb(this.entryProcessor.metric, {
                    url: this.url
                })
            }
            teardown() {
                this.observer ? .takeRecords(), this.observer ? .disconnect()
            }
            reset() {
                this.teardown(), this.entryProcessor.teardown(), this.entryProcessor = this.initializeProcessor(), this.observe(!1)
            }
        }
        let eq = D.cg && "PerformanceEventTiming" in D.cg && "interactionId" in PerformanceEventTiming.prototype;
        class ez extends eH {
            hardNavPending = !1;#
            c = 0;
            get softNavEventToListen() {
                return Y.z.START
            }
            initializeProcessor() {
                return new eB
            }
            get supported() {
                return !!eq
            }
            setupListeners() {
                super.setupListeners(), D.cg ? .addEventListener("beforeunload", () => {
                    this.hardNavPending = !0
                })
            }
            observe(e = !0) {
                if (eq) {
                    if (this.observer = new PerformanceObserver(e => {
                            (e => {
                                if ("hidden" === document.visibilityState) return e();
                                let t = !1,
                                    n = () => {
                                        t || (t = !0, e())
                                    };
                                addEventListener("visibilitychange", n, {
                                    once: !0,
                                    capture: !0
                                }), requestIdleCallback(() => {
                                    n(), removeEventListener("visibilitychange", n, {
                                        capture: !0
                                    })
                                })
                            })(() => {
                                let t = e.getEntries().filter(e => e.startTime >= this.#c);
                                t.length && this.entryProcessor.processEntries(t)
                            })
                        }), e) return this.url = D.cg ? .location.href, this.observeEvents(e);
                    D.XC ? .addEventListener(Y.z.RENDER, () => {
                        this.url = D.cg ? .location.href, this.observeEvents(e)
                    }, {
                        once: !0
                    })
                }
            }
            observeEvents(e) {
                this.observer && (this.observer.observe({
                    type: "first-input",
                    buffered: e
                }), this.observer.observe({
                    type: "event",
                    durationThreshold: 40,
                    buffered: e
                }))
            }
            registerCallback(e) {
                this.interactionProcessor.registeredCallbacks.add(e)
            }
            report(e) {
                if (!(e ? .source === "pagehide" || e ? .isPageHide && this.hardNavPending)) {
                    let e = this.observer ? .takeRecords();
                    e && e.length && this.entryProcessor.processEntries(e)
                }
                super.report(e)
            }
            reset() {
                this.#c = performance.now(), super.reset()
            }
            get interactionProcessor() {
                return this.entryProcessor
            }
        }
        class eU {
            name = "ElementTiming";
            value;
            identifier;
            attribution;
            constructor(e, t, n) {
                this.value = e, this.identifier = n, this.attribution = {
                    target: eg(t)
                }
            }
        }
        let eX = D.cg && "PerformanceElementTiming" in D.cg;
        class eV {
            cb;
            observer;
            url;
            constructor(e) {
                this.cb = e, this.setupListeners()
            }
            setupListeners() {
                eX && D.XC ? .addEventListener(Y.z.RENDER, () => {
                    this.reset()
                })
            }
            observe(e = !0) {
                eX && (this.url = D.cg ? .location.href, this.observer = new PerformanceObserver(e => {
                    for (let {
                            renderTime: t,
                            element: n,
                            identifier: r
                        } of e.getEntries()) this.report(new eU(t, n, r))
                }), this.observer.observe({
                    type: "element",
                    buffered: e
                }))
            }
            report(e) {
                this.cb(e, {
                    url: this.url
                })
            }
            teardown() {
                this.observer ? .takeRecords(), this.observer ? .disconnect()
            }
            reset() {
                this.teardown(), this.observe(!1)
            }
        }
        class eW {
            observer;
            url;
            supported;
            get softNavStart() {
                return es.c.navStart
            }
            get soft() {
                return es.c.soft
            }
            get mechanism() {
                return es.c.mechanism
            }
            interactionGate;
            cpuBucket = "";
            lastIntermediate;
            emulatedTimer;
            reportedTerminal = !1;
            constructor() {
                this.supported = function() {
                    if (!D.cg || "u" < typeof PerformanceObserver) return !1;
                    let e = PerformanceObserver.supportedEntryTypes;
                    return Array.isArray(e) && e.includes("container")
                }(), es.c.ensure(), this.#u()
            }
            get interacted() {
                return this.interactionGate ? .interacted ? ? !1
            }
            get tabHidden() {
                return this.interactionGate ? .tabHidden ? ? !1
            }#
            u() {
                this.supported && D.XC ? .addEventListener(Y.z.RENDER, () => {
                    this.reset()
                })
            }#
            d() {
                this.url = D.cg ? .location.href, this.lastIntermediate = void 0, this.reportedTerminal = !1, this.cpuBucket = (0, F.p)(), this.interactionGate ? .teardown(), this.interactionGate = new ey, this.#m()
            }
            observe(e = !0) {
                if (this.supported) {
                    this.#d();
                    try {
                        this.observer = new PerformanceObserver(e => {
                            for (let t of e.getEntries()) this.report(t)
                        }), this.observer.observe({
                            type: "container",
                            buffered: e
                        }), e && (0, M.au)({
                            name: "BROWSER_VITALS_CONTAINER_TIMING_SUPPORTED",
                            value: 1
                        })
                    } catch {
                        this.observer = void 0
                    }
                }
            }
            report(e) {
                try {
                    this.#p(e)
                } catch {}
            }#
            p(e) {
                if (this.interacted) {
                    this.#m(), this.#h(e, "interacted");
                    return
                }
                if (this.tabHidden) {
                    this.#m(), eo(0, "page_hidden"), this.#h(e, "tab_hidden");
                    return
                }
                if (!1 === e.final) {
                    this.lastIntermediate = e, this.#f(), this.#h(e, "intermediate_paint");
                    return
                }
                this.#m(), this.reportedTerminal = !0, this.#v(e, !1)
            }#
            v(e, t) {
                let n = e.firstRenderTime;
                if (!Number.isFinite(n) || n <= 0) {
                    eo(0, "missing_first_render_time"), this.#h(e, "missing_first_render_time");
                    return
                }
                let r = n - this.softNavStart;
                if (!eo(r, "value_exceeded")) return void this.#h(e, "value_exceeded", r);
                let i = eC(),
                    a = e.identifier || "unknown",
                    o = eg(e.element),
                    s = eg(e.lastPaintedSubElement),
                    l = !!t || (e.final ? ? !0),
                    c = e.lastPaintTime ? ? n,
                    u = function(e) {
                        if (Number.isFinite(e) && !(e < 0)) {
                            if (0 === e) return "0";
                            for (let [t, n] of eG)
                                if (e > n) return t
                        }
                    }(Math.max(0, c - n)),
                    d = Z(),
                    m = void 0 !== d.current ? ee(d.current) : void 0,
                    p = void 0 !== d.previous ? ee(d.previous) : void 0,
                    h = {
                        identifier: a,
                        size: e.size ? ? 0,
                        cpu: this.cpuBucket,
                        soft: String(this.soft),
                        mechanism: this.mechanism,
                        app: i.app,
                        ssr: String(i.ssr),
                        lazy: String(i.lazy),
                        alternate: String(i.alternate),
                        gqlFetched: String(i.gqlFetched),
                        jsFetched: String(i.jsFetched),
                        emulated: String(t)
                    };
                u && (h.paintSpreadBucket = u), m && (h.domNodesBucket = m), p && (h.previousDomNodesBucket = p), (0, M.au)({
                        name: "BROWSER_VITALS_DIST_CONTAINER_TIMING",
                        value: r,
                        tags: h,
                        requestUrl: this.url
                    }),
                    function(e, t) {
                        if ("hpc" !== e.identifier) return;
                        let n = X({
                            ssr: t
                        });
                        n.containerTiming || (n.containerTiming = e)
                    }({
                        name: "ContainerTiming",
                        value: r,
                        identifier: a,
                        element: o,
                        lastPaintedSubElement: s,
                        size: e.size ? ? 0,
                        soft: this.soft,
                        final: l,
                        firstRenderTime: e.firstRenderTime,
                        lastPaintTime: c,
                        mechanism: this.mechanism,
                        ...i,
                        domNodes: d.current,
                        previousDomNodes: d.previous,
                        emulated: t
                    }, i.ssr), eE({
                        name: t ? "ContainerTiming (emulated)" : "ContainerTiming",
                        track: "ContainerTiming",
                        color: "tertiary-dark",
                        tooltipText: `ContainerTiming${t?" (emulated)":""} (${a})`,
                        end: n
                    }), D.XC ? .dispatchEvent(new CustomEvent("web-vitals:container-timing", {
                        detail: {
                            identifier: e.identifier,
                            value: r,
                            target: o,
                            lastPaintedSubElement: s,
                            final: l,
                            size: e.size ? ? 0,
                            dropReason: null,
                            emulated: t
                        }
                    }))
            }#
            f() {
                this.#m(), this.emulatedTimer = setTimeout(() => {
                    this.emulatedTimer = void 0, this.reportedTerminal || this.tabHidden || this.interacted || this.lastIntermediate && this.#v(this.lastIntermediate, !0)
                }, 1e4)
            }#
            m() {
                void 0 !== this.emulatedTimer && (clearTimeout(this.emulatedTimer), this.emulatedTimer = void 0)
            }#
            h(e, t, n) {
                let r = e.firstRenderTime ? ? e.startTime,
                    i = n ? ? r - this.softNavStart;
                D.XC ? .dispatchEvent(new CustomEvent("web-vitals:container-timing", {
                    detail: {
                        identifier: e.identifier,
                        value: i,
                        target: eg(e.element),
                        lastPaintedSubElement: eg(e.lastPaintedSubElement),
                        final: e.final ? ? !0,
                        size: e.size ? ? 0,
                        dropReason: t
                    }
                }))
            }
            teardown() {
                let e = this.observer ? .takeRecords();
                if (e)
                    for (let t of e) !1 !== t.final && this.report(t);
                this.observer ? .disconnect(), this.observer = void 0, this.interactionGate ? .teardown(), this.interactionGate = void 0, this.#m()
            }
            reset() {
                this.#d()
            }
        }
        let eG = [
            ["5001+", 5e3],
            ["2001 - 5000", 2e3],
            ["1001 - 2000", 1e3],
            ["501 - 1000", 500],
            ["251 - 500", 250],
            ["101 - 250", 100],
            ["51 - 100", 50],
            ["17 - 50", 16],
            ["1 - 16", 0]
        ];

        function ej(e, t) {
            let n = e.filter(e => (ei(), e.startTime >= et) ? (ea("LongTask", "page_hidden"), !1) : !(e.duration > 5e3) || (ea("LongTask", "value_exceeded"), !1)),
                r = n.map(({
                    name: e,
                    duration: n
                }) => ({
                    name: e,
                    duration: n,
                    url: t
                }));
            r.length > 0 && ((0, M.iv)({
                longTasks: r
            }), V({
                longTasks: n,
                ssr: (0, eS.g5)()
            }))
        }

        function e$(e, t) {
            let n = e.filter(e => (ei(), e.startTime >= et) ? (ea("LongAnimationFrame", "page_hidden"), !1) : !(e.duration > 5e3) || (ea("LongAnimationFrame", "value_exceeded"), !1)),
                r = n.map(({
                    name: e,
                    duration: n,
                    blockingDuration: r
                }) => ({
                    name: e,
                    duration: n,
                    blockingDuration: r,
                    url: t
                }));
            r.length > 0 && (V({
                longAnimationFrames: n,
                ssr: (0, eS.g5)()
            }), (0, M.iv)({
                longAnimationFrames: r
            }))
        }
        let eY = e => e.find(e => e.node ? .nodeType === 1) || e[0];
        class eK extends eR {
            name = "CLS";
            targetMap;
            constructor(e, t, n) {
                super(e, t), this.targetMap = n
            }
            get attribution() {
                if (!this.entries.length) return {};
                let e = this.entries.reduce((e, t) => e.value > t.value ? e : t);
                if (!e ? .sources ? .length) return {};
                let t = eY(e.sources);
                return t ? {
                    largestShiftTarget: this.targetMap.get(t)
                } : {}
            }
        }
        class eJ extends eP {
            sessionValue = 0;
            sessionEntries = [];
            maxSessionValue = 0;
            maxSessionEntries = [];
            layoutShiftTargetMap = new Map;
            get metric() {
                return 0 === this.maxSessionEntries.length && 0 === this.sessionEntries.length ? new eK(0, [], new Map) : new eK(Math.max(this.maxSessionValue, this.sessionValue), this.sessionValue >= this.maxSessionValue ? this.sessionEntries : this.maxSessionEntries, this.layoutShiftTargetMap)
            }
            processEntries(e) {
                for (let t of e) this.processEntry(t)
            }
            processEntry(e) {
                if (e.hadRecentInput) return;
                let t = this.sessionEntries[0],
                    n = this.sessionEntries.at(-1);
                this.sessionValue && t && n && e.startTime - n.startTime < 1e3 && e.startTime - t.startTime < 5e3 ? (this.sessionValue += e.value, this.sessionEntries.push(e)) : (this.sessionValue > this.maxSessionValue && (this.maxSessionValue = this.sessionValue, this.maxSessionEntries = this.sessionEntries), this.sessionValue = e.value, this.sessionEntries = [e]), this.setLargestShiftSource(e)
            }
            setLargestShiftSource(e) {
                if (e ? .sources ? .length) {
                    let t = eY(e.sources),
                        n = t ? .node;
                    if (n) {
                        let e = eg(n);
                        this.layoutShiftTargetMap.set(t, e)
                    }
                }
            }
        }
        let eZ = D.cg && "LayoutShift" in D.cg;
        class eQ extends eH {
            softNavRenderController;
            get softNavEventToListen() {
                return Y.z.START
            }
            initializeProcessor() {
                return new eJ
            }
            get supported() {
                return !!eZ
            }
            observe(e = !0) {
                if (e) {
                    this.url = D.cg ? .location.href;
                    let e = !1;
                    C(() => {
                        e || (e = !0, this.startObserving(!0))
                    });
                    return
                }
                this.softNavRenderController ? .abort();
                let t = new AbortController;
                this.softNavRenderController = t;
                let {
                    signal: n
                } = t;
                D.XC ? .addEventListener(Y.z.RENDER, () => {
                    this.url = D.cg ? .location.href, "function" == typeof D.cg ? .requestAnimationFrame ? D.cg.requestAnimationFrame(() => {
                        n.aborted || this.startObserving(!1)
                    }) : this.startObserving(!1)
                }, {
                    once: !0,
                    signal: n
                })
            }
            startObserving(e) {
                this.observer ? .disconnect(), this.observer = new PerformanceObserver(e => {
                    let t = e.getEntries();
                    queueMicrotask(() => {
                        this.entryProcessor.processEntries(t)
                    })
                }), this.observer.observe({
                    type: "layout-shift",
                    buffered: e
                })
            }
        }
        var e0 = n(790932);

        function e1(e) {
            let t = e.textContent ? .trim();
            return t ? t.replace(/\s+/g, " ") : ""
        }

        function e5(e) {
            return e.length > 100 ? `${e.slice(0,100)} [...]` : e
        }

        function e2(e) {
            try {
                let t = new URL(e, window.location.origin),
                    n = t.pathname;
                if (n.endsWith("/collect") || n.endsWith("/stats") || "https://github.githubassets.com" === t.origin && n.startsWith("/assets")) return !0;
                return !1
            } catch {
                return !1
            }
        }
        let e3 = new Set,
            e4 = new Set,
            e9 = !1;

        function e6() {
            var e, t, n;
            if (e9) return;
            e9 = !0;
            let r = window.fetch;
            window.fetch = (e = r, t = e3, n = e4, function(...r) {
                let i = r[0],
                    a = "string" == typeof i ? i : i instanceof Request ? i.url : i instanceof URL ? i.href : "";
                if (e2(a)) return e.apply(this, r);
                for (let e of t) try {
                    e()
                } catch {}
                let o = e.apply(this, r);
                for (let e of n) try {
                    e(a, o)
                } catch {}
                return o
            })
        }
        let e7 = new Set(["meta", "script", "link", "style", "noscript"]),
            e8 = "data-icv-visible",
            te = {
                dataType: "track-entry",
                track: "ICV",
                trackGroup: "Performance Timeline",
                color: "tertiary-dark"
            };

        function tt(e) {
            return e.checkVisibility()
        }

        function tn() {
            return location.href.replace(/#.*$/, "")
        }

        function tr(e) {
            return Math.round(100 * e) / 100
        }
        var ti = n(179836);
        let ta = new Set(["text", "search", "url", "email", "password", ""]),
            to = !1;

        function ts() {
            let e, t, n, r, a;
            if (to) return;
            if (to = !0, (0, ti.L)() && !document.querySelector('meta[name="synthetic-test"]')) {
                let e = document.createElement("meta");
                e.name = "synthetic-test", e.content = "true", document.head.appendChild(e)
            }
            let o = (0, M.Tq)() ? "automated" : (0, M.Xl)() ? "staff" : (0, M.sV)() ? "sampled" : "unsampled";
            if ((0, M.au)({
                    name: "BROWSER_VITALS_SESSION",
                    value: 1,
                    tags: {
                        type: o
                    }
                }, !1, 1), ed(), C(el), P(el), ((e, t = {}) => {
                    ((e, t = {}) => {
                        let n = h("TTFB"),
                            r = d(e, n, I, t.reportAllChanges);
                        _(() => {
                            let a = i();
                            a && (n.value = Math.max(a.responseStart - p(), 0), n.entries = [a], r(!0), u(() => {
                                (r = d(e, n = h("TTFB", 0), I, t.reportAllChanges))(!0)
                            }))
                        })
                    })(t => {
                        e((e => {
                            let t = {
                                waitingDuration: 0,
                                cacheDuration: 0,
                                dnsDuration: 0,
                                connectionDuration: 0,
                                requestDuration: 0
                            };
                            if (e.entries.length) {
                                let n = e.entries[0],
                                    r = n.activationStart || 0,
                                    i = Math.max((n.workerStart || n.fetchStart) - r, 0),
                                    a = Math.max(n.domainLookupStart - r, 0),
                                    o = Math.max(n.connectStart - r, 0),
                                    s = Math.max(n.connectEnd - r, 0);
                                t = {
                                    waitingDuration: i,
                                    cacheDuration: a - i,
                                    dnsDuration: o - a,
                                    connectionDuration: s - o,
                                    requestDuration: e.value - s,
                                    navigationEntry: n
                                }
                            }
                            return Object.assign(e, {
                                attribution: t
                            })
                        })(t))
                    }, t)
                })(el), "u" > typeof PerformanceObserver && (PerformanceObserver.supportedEntryTypes || []).includes("longtask")) {
                let e = new PerformanceObserver(e => {
                    ej(e.getEntries(), window.location.href)
                });
                e.observe({
                    type: "longtask",
                    buffered: !0
                }), D.XC ? .addEventListener(Y.z.START, () => {
                    ej(e.takeRecords(), window.location.href), e.disconnect(), (e = new PerformanceObserver(e => {
                        ej(e.getEntries(), window.location.href)
                    })).observe({
                        type: "longtask",
                        buffered: !1
                    })
                })
            }
            if ("u" > typeof PerformanceObserver && (PerformanceObserver.supportedEntryTypes || []).includes("long-animation-frame")) {
                let e = new PerformanceObserver(e => {
                    e$(e.getEntries(), window.location.href)
                });
                e.observe({
                    type: "long-animation-frame",
                    buffered: !0
                }), D.XC ? .addEventListener(Y.z.START, () => {
                    e$(e.takeRecords(), window.location.href), e.disconnect(), (e = new PerformanceObserver(e => {
                        e$(e.getEntries(), window.location.href)
                    })).observe({
                        type: "long-animation-frame",
                        buffered: !1
                    })
                })
            }
            e = [], t = new Map, document.addEventListener("click", n => {
                let r = n.target;
                if (!r || !(r instanceof Element)) return;
                let i = performance.now(),
                    a = eg(r);
                if (!a) return;
                for (; e.length > 0;) {
                    let t = e[0];
                    if (t && i - t.timestamp > 1e3) e.shift();
                    else break
                }
                e.push({
                    timestamp: i,
                    selector: a,
                    x: n.clientX,
                    y: n.clientY
                });
                let o = e.filter(e => e.selector === a && Math.abs(e.x - n.clientX) + Math.abs(e.y - n.clientY) <= 42);
                if (o.length >= 3) {
                    var s, l;
                    let n = window.getSelection();
                    if (n && n.toString().length > 0) return;
                    let r = t.get(a);
                    if (r && i - r < 5e3) return;
                    if (t.set(a, i), t.size > 50)
                        for (let [e, n] of t) i - n > 5e3 && t.delete(e);
                    s = a, l = o.length, (0, x.BI)("rage-click", {
                        target: s.slice(0, 200),
                        clickCount: String(l),
                        url: window.location.href
                    }, {
                        batched: !0
                    }), (0, M.au)({
                        name: "BROWSER_VITALS_COUNT_RAGE_CLICK",
                        value: 1,
                        requestUrl: window.location.href
                    }, !1, 1);
                    for (let t = e.length - 1; t >= 0; t--) {
                        let n = e[t];
                        n && n.selector === a && e.splice(t, 1)
                    }
                }
            }, {
                capture: !0
            });
            let s, l = null;

            function c() {
                var e;
                let t, n, r, i, a, o;
                l && l.keyCount >= 5 && (e = l, t = performance.now() - e.startTime, n = e.totalInputDelay / e.keyCount, r = Math.round(100 * e.totalInputDelay) / 100, i = Math.round(100 * e.maxInputDelay) / 100, a = Math.round(100 * n) / 100, (0, x.BI)("typing-session", {
                    keyCount: String(e.keyCount),
                    totalInputDelayMs: String(r),
                    maxInputDelayMs: String(i),
                    avgInputDelayMs: String(a),
                    sessionDurationMs: String(Math.round(t)),
                    inputType: e.inputType,
                    url: window.location.href
                }, {
                    batched: !0
                }), o = {
                    inputType: e.inputType
                }, (0, M.au)({
                    name: "BROWSER_VITALS_DIST_TYPING_AVG_INPUT_DELAY",
                    value: a,
                    tags: o,
                    requestUrl: window.location.href
                }, !1), (0, M.au)({
                    name: "BROWSER_VITALS_DIST_TYPING_MAX_INPUT_DELAY",
                    value: i,
                    tags: o,
                    requestUrl: window.location.href
                }, !1), (0, M.au)({
                    name: "BROWSER_VITALS_DIST_TYPING_TOTAL_INPUT_DELAY",
                    value: r,
                    tags: o,
                    requestUrl: window.location.href
                }, !1)), l = null
            }
            document.addEventListener("keydown", e => {
                var t, n;
                if (!((t = e.target) && t instanceof HTMLElement && (t.isContentEditable || t instanceof HTMLTextAreaElement || t instanceof HTMLInputElement && ta.has(t.type.toLowerCase()))) || e.isComposing || null == e.key) return;
                let r = 1 === e.key.length,
                    i = "Backspace" === e.key || "Delete" === e.key;
                if (!r && !i) return;
                let a = performance.now(),
                    o = Math.max(0, a - e.timeStamp);
                l || (l = {
                    startTime: a,
                    keyCount: 0,
                    totalInputDelay: 0,
                    maxInputDelay: 0,
                    inputType: (n = e.target) && n instanceof HTMLElement ? n.isContentEditable ? "contenteditable" : n instanceof HTMLTextAreaElement ? "textarea" : n instanceof HTMLInputElement ? n.type || "text" : "unknown" : "unknown"
                }), l.keyCount++, l.totalInputDelay += o, l.maxInputDelay = Math.max(l.maxInputDelay, o), clearTimeout(s), s = setTimeout(c, 1e3)
            }, {
                capture: !0
            }), n = new Map, r = [], a = !1, window.addEventListener("error", e => {
                let t = e.message || "";
                t && (r.push({
                    timestamp: performance.now(),
                    message: t
                }), r.length > 20 && r.shift())
            }), window.addEventListener("unhandledrejection", e => {
                let t = e.reason ? .message || String(e.reason || "");
                t && (r.push({
                    timestamp: performance.now(),
                    message: t
                }), r.length > 20 && r.shift())
            }), document.addEventListener("click", e => {
                let t, i = e.target;
                if (!i || !(i instanceof Element) || null === i.closest('a,button,[tabindex],[data-action],[role="button"],[role="tab"],[role="switch"],[role="checkbox"],[role="option"],[role="menuitem"],[role="menuitemcheckbox"],[role="menuitemradio"],[role="link"],[role="treeitem"],[role="combobox"]')) return;
                let o = window.getSelection();
                if (o && o.toString().length > 0 || a) return;
                let s = performance.now(),
                    l = eg(i);
                if (!l) return;
                let c = n.get(l);
                if (c && s - c < 1e4) return;
                let u = !1,
                    d = !1;
                a = !0;
                let m = () => {
                        u = !0, h()
                    },
                    p = (e3.add(m), e6(), () => {
                        e3.delete(m)
                    }),
                    h = () => {
                        d || (d = !0, a = !1, f.disconnect(), t ? .disconnect(), p(), document.removeEventListener("scroll", v, {
                            capture: !0
                        }), document.removeEventListener("focusin", g), document.removeEventListener("soft-nav:start", m), window.removeEventListener("pagehide", m), window.removeEventListener("popstate", m))
                    },
                    f = new MutationObserver(m);
                f.observe(document.body, {
                    childList: !0,
                    subtree: !0,
                    attributes: !0,
                    characterData: !0
                });
                let v = () => {
                        m()
                    },
                    g = () => {
                        m()
                    };
                document.addEventListener("scroll", v, {
                    capture: !0,
                    once: !0
                }), document.addEventListener("focusin", g, {
                    once: !0
                }), "u" > typeof PerformanceObserver && PerformanceObserver.supportedEntryTypes ? .includes("resource") && (t = new PerformanceObserver(e => {
                    for (let t of e.getEntries())
                        if (t.startTime >= s) {
                            let {
                                initiatorType: e
                            } = t;
                            if ("fetch" === e || "xmlhttprequest" === e) return void m()
                        }
                })).observe({
                    type: "resource",
                    buffered: !1
                }), window.addEventListener("pagehide", m, {
                    once: !0
                }), window.addEventListener("popstate", m, {
                    once: !0
                }), document.addEventListener("soft-nav:start", m, {
                    once: !0
                }), setTimeout(() => {
                    if (e.defaultPrevented) {
                        u = !0, h();
                        return
                    }
                }, 0), setTimeout(() => {
                    if (h(), !u) {
                        var e, t, i;
                        if (n.set(l, performance.now()), n.size > 50) {
                            let e = performance.now() - 1e4;
                            for (let [t, r] of n) r < e && n.delete(t)
                        }
                        let a = performance.now(),
                            o = function(e, t, n) {
                                for (let r of e)
                                    if (r.timestamp >= t && r.timestamp <= n) return r.message
                            }(r, s, a);
                        o ? (e = l, t = o, (0, x.BI)("error-click", {
                                target: e.slice(0, 200),
                                errorType: function(e) {
                                    let t = e.indexOf(":");
                                    if (t > 0 && t < 50) {
                                        let n = e.slice(0, t).trim();
                                        if (/^[A-Za-z][A-Za-z0-9]*$/.test(n)) return n
                                    }
                                    return "Error"
                                }(t),
                                url: window.location.href
                            }, {
                                batched: !0
                            }), (0, M.au)({
                                name: "BROWSER_VITALS_COUNT_ERROR_CLICK",
                                value: 1,
                                requestUrl: window.location.href
                            }, !1, 1)) : (i = l, (0, x.BI)("dead-click", {
                                target: i.slice(0, 200),
                                url: window.location.href
                            }, {
                                batched: !0
                            }), (0, M.au)({
                                name: "BROWSER_VITALS_COUNT_DEAD_CLICK",
                                value: 1,
                                requestUrl: window.location.href
                            }, !1, 1)),
                            function(e, t) {
                                let n = t - 2e3;
                                for (; e.length > 0 && e[0] && e[0].timestamp < n;) e.shift()
                            }(r, a)
                    }
                }, 3e3)
            }, {
                capture: !0
            });
            let m = (0, e0.n)(.1),
                f = new ez(el);
            (0, R.NT)(f), f.observe(), new eQ(el).observe(), new eV(el).observe(), new eW().observe();
            let v = new ek({
                latestHPCElement: null,
                callback: el
            });
            v.connect(), D.XC ? .addEventListener(Y.z.START, () => {
                v.disconnect(), (v = new ek({
                    latestHPCElement: document.querySelector("[data-hpc]"),
                    callback: el
                })).connect()
            }), D.XC ? .addEventListener("pagehide", () => {
                m()
            }), (0, A.G7)("icv_observer") && function(e) {
                if ("function" != typeof Element.prototype.checkVisibility) return;
                let t = null,
                    n = new Map;
                try {
                    new PerformanceObserver(e => {
                        for (let t of e.getEntries()) {
                            if ("fetch" !== t.initiatorType && "xmlhttprequest" !== t.initiatorType || e2(t.name)) continue;
                            let e = n.get(t.name);
                            e ? e.push(t) : n.set(t.name, [t])
                        }
                    }).observe({
                        type: "resource",
                        buffered: !0
                    })
                } catch {}

                function r(e, n, r) {
                    var i;
                    t && o(t);
                    let l = performance.now(),
                        {
                            actionName: c,
                            nameFoundBy: u
                        } = function(e) {
                            let t = function(e, t) {
                                let n = e;
                                for (; n;) {
                                    let e = n.getAttribute(t);
                                    if (e) return e;
                                    n = n.parentElement
                                }
                                return null
                            }(e, "data-icv-name");
                            if (t) return {
                                actionName: e5(t),
                                nameFoundBy: "data-icv-name"
                            };
                            if (!(0, A.G7)("icv_observer_automatic_action_name")) return {
                                actionName: "[data-icv-name] attribute must be added. Automatic name discovery is not enabled",
                                nameFoundBy: "automatic-name-not-enabled"
                            };
                            let n = e,
                                r = 0;
                            for (; n && r <= 10 && "BODY" !== n.nodeName && "HTML" !== n.nodeName;) {
                                let e = function(e) {
                                    let t = e.getAttribute("aria-labelledby") ? .trim();
                                    if (!t) return "";
                                    let n = e.getRootNode(),
                                        r = [];
                                    for (let e of t.split(/\s+/)) {
                                        let t = n.getElementById(e);
                                        if (t) {
                                            let e = e1(t);
                                            e && r.push(e)
                                        }
                                    }
                                    return r.join(" ")
                                }(n);
                                if (e) return {
                                    actionName: e5(e),
                                    nameFoundBy: "aria-labelledby"
                                };
                                let t = n.getAttribute("aria-label");
                                if (t ? .trim()) return {
                                    actionName: e5(t.trim()),
                                    nameFoundBy: "aria-label"
                                };
                                if (function(e) {
                                        let t = e.nodeName;
                                        return "BUTTON" === t || "LABEL" === t || "SUMMARY" === t || "button" === e.getAttribute("role")
                                    }(n)) {
                                    let e = e1(n);
                                    if (e) return {
                                        actionName: e5(e),
                                        nameFoundBy: "button-text"
                                    }
                                }
                                let i = n.getAttribute("title");
                                if (i ? .trim()) return {
                                    actionName: e5(i.trim()),
                                    nameFoundBy: "title"
                                };
                                let a = n.getAttribute("alt");
                                if (a ? .trim()) return {
                                    actionName: e5(a.trim()),
                                    nameFoundBy: "alt"
                                };
                                let o = n.getAttribute("placeholder");
                                if (o ? .trim()) return {
                                    actionName: e5(o.trim()),
                                    nameFoundBy: "placeholder"
                                };
                                if ("FORM" === n.nodeName) break;
                                n = n.parentElement, r++
                            }
                            let i = e1(e);
                            return i ? {
                                actionName: e5(i),
                                nameFoundBy: "innerText"
                            } : {
                                actionName: "",
                                nameFoundBy: "NOT FOUND"
                            }
                        }(e),
                        d = performance.now() - l,
                        m = performance.now(),
                        p = {
                            clickElement: e,
                            actionName: c,
                            nameFoundBy: u,
                            elementType: function(e) {
                                let t = e.tagName.toLowerCase(),
                                    n = e.getAttribute("role");
                                if (n) return `${t}[role=${n}]`;
                                if ("input" === t) {
                                    let t = e.type || "text";
                                    return `input[type=${t}]`
                                }
                                return t
                            }(e),
                            interactionType: n,
                            start: m,
                            pendingRequests: 0,
                            networkRequestCount: 0,
                            endpoints: [],
                            hadMutations: !1,
                            hadActivity: !1,
                            markerFound: !1,
                            settled: !1,
                            startUrl: tn(),
                            mutationCallbackTime: 0,
                            mutationCallbackCount: 0,
                            mutationNodeCount: 0,
                            rafTime: 0,
                            actionNameTime: d,
                            inpTime: null,
                            networkStartTime: null,
                            networkEndTime: 0,
                            networkTimings: []
                        };
                    r && (0, R.X)() ? .registerCallback({
                        event: r,
                        cb: e => {
                            p.inpTime = (p.inpTime ? ? 0) + e.latency
                        }
                    }), p.maxTimer = setTimeout(() => o(p), 1e4), i = a, p.mutationObserver = new MutationObserver(e => {
                        if (p.settled) return;
                        performance.mark("icv:mutation-cb-start");
                        let t = performance.now();
                        p.mutationCallbackCount++;
                        let n = function(e) {
                                let t = [];
                                for (let n of e) {
                                    if ("attributes" !== n.type) continue;
                                    let e = function({
                                        attributeName: e,
                                        target: t,
                                        oldValue: n
                                    }) {
                                        return "hidden" === e && t instanceof HTMLElement && null !== n && !t.hasAttribute("hidden") ? t : null
                                    }(n) ? ? function({
                                        attributeName: e,
                                        target: t,
                                        oldValue: n
                                    }) {
                                        return "open" === e && t instanceof HTMLDetailsElement && null === n && t.open ? t : null
                                    }(n);
                                    e && t.push(e)
                                }
                                return t
                            }(e),
                            r = function(e) {
                                let t = [];
                                for (let n of e)
                                    if ("childList" === n.type)
                                        for (let e of n.addedNodes) e instanceof Element && !e7.has(e.tagName.toLowerCase()) && t.push(e);
                                return t
                            }(e);
                        p.mutationNodeCount += r.length, p.mutationCallbackTime += performance.now() - t, performance.mark("icv:mutation-cb-end"), performance.measure("icv:mutation-callback", {
                            start: "icv:mutation-cb-start",
                            end: "icv:mutation-cb-end",
                            detail: {
                                devtools: { ...te,
                                    tooltipText: "Mutation callback"
                                }
                            }
                        }), (0 !== r.length || 0 !== n.length) && (p.hadMutations = !0, requestAnimationFrame(() => {
                            if (p.settled) return;
                            performance.mark("icv:raf-start");
                            let e = performance.now(),
                                t = function(e) {
                                    for (let t of e) {
                                        if (t.hasAttribute(e8)) return t;
                                        let e = t.querySelector(`[${e8}]`);
                                        if (e) return e
                                    }
                                    return null
                                }(r);
                            if (t) {
                                p.markerFound = !0, p.contentElement = t, p.hadActivity = !0, p.rafTime += performance.now() - e, performance.mark("icv:raf-end"), performance.measure("icv:raf", {
                                    start: "icv:raf-start",
                                    end: "icv:raf-end",
                                    detail: {
                                        devtools: { ...te,
                                            tooltipText: "RAF (marker)"
                                        }
                                    }
                                }), o(p);
                                return
                            }
                            for (let t of n)
                                if (tt(t)) {
                                    p.hadActivity = !0, p.contentElement = t, i(p), p.rafTime += performance.now() - e, performance.mark("icv:raf-end"), performance.measure("icv:raf", {
                                        start: "icv:raf-start",
                                        end: "icv:raf-end",
                                        detail: {
                                            devtools: { ...te,
                                                tooltipText: "RAF (reveal)"
                                            }
                                        }
                                    });
                                    return
                                }
                            let a = function(e) {
                                for (let t of e)
                                    if (tt(t)) return t;
                                return null
                            }(r);
                            a && (p.hadActivity = !0, p.contentElement = a, i(p)), p.rafTime += performance.now() - e, performance.mark("icv:raf-end"), performance.measure("icv:raf", {
                                start: "icv:raf-start",
                                end: "icv:raf-end",
                                detail: {
                                    devtools: { ...te,
                                        tooltipText: "RAF"
                                    }
                                }
                            })
                        }))
                    }), p.validationTimer = setTimeout(() => {
                        p.hadMutations || p.hadActivity || s(p)
                    }, 100), p.mutationObserver.observe(document, {
                        childList: !0,
                        subtree: !0,
                        attributes: !0,
                        attributeFilter: ["hidden", "open"],
                        attributeOldValue: !0
                    }), t = p
                }

                function i(e) {
                    !e.settled && (e.pendingRequests--, e.pendingRequests <= 0 && (e.pendingRequests = 0, a(e)))
                }

                function a(e) {
                    !e.settled && (e.endTimer && clearTimeout(e.endTimer), e.pendingRequests <= 0 && (e.endTimer = setTimeout(() => {
                        o(e)
                    }, 100)))
                }

                function o(t) {
                    if (s(t), t.hadActivity && tn() === t.startUrl) {
                        for (let e of t.networkTimings) {
                            let {
                                absoluteUrl: t,
                                requestInitiatedAt: r = 0
                            } = e.tempLookup ? ? {};
                            if (!t) continue;
                            let i = function(e, t, n) {
                                let r = [];
                                for (let [n, i] of e)(n === t || n.startsWith(`${t}?`)) && r.push(...i);
                                if (0 === r.length) return null;
                                let i = r[0],
                                    a = i ? Math.abs(i.startTime - n) : 1 / 0;
                                for (let e = 1; e < r.length; e++) {
                                    let t = r[e];
                                    if (!t) continue;
                                    let o = Math.abs(t.startTime - n);
                                    o < a && (i = t, a = o)
                                }
                                return i ? ? null
                            }(n, t, r) || (performance.getEntriesByName(t, "resource").at(-1) ? ? null);
                            i && (e.ttfb = tr(i.responseStart - i.requestStart), e.downloadTime = tr(i.responseEnd - i.responseStart), e.fetchDuration = tr(i.responseEnd - i.fetchStart)), delete e.tempLookup
                        }
                        n.clear(), e({
                            name: "ICV",
                            value: tr(performance.now() - t.start),
                            clickTarget: eg(t.clickElement),
                            contentTarget: eg(t.contentElement),
                            app: (0, ew.f)() || "rails",
                            cpu: (0, F.p)(),
                            featureFlags: O(),
                            actionName: t.actionName,
                            nameFoundBy: t.nameFoundBy,
                            interactionType: t.interactionType,
                            markerFound: t.markerFound,
                            networkRequestCount: t.networkRequestCount,
                            endpoints: t.endpoints,
                            elementType: t.elementType,
                            inpTime: t.inpTime,
                            networkDuration: tr(null !== t.networkStartTime ? t.networkEndTime - t.networkStartTime : 0),
                            networkTimings: t.networkTimings.slice().sort((e, t) => t.fetchDuration - e.fetchDuration),
                            mutationCallbackTime: tr(t.mutationCallbackTime),
                            mutationCallbackCount: t.mutationCallbackCount,
                            mutationNodeCount: t.mutationNodeCount,
                            rafTime: tr(t.rafTime),
                            actionNameTime: tr(t.actionNameTime)
                        })
                    }
                }

                function s(e) {
                    e.settled || (e.settled = !0, e.validationTimer && clearTimeout(e.validationTimer), e.endTimer && clearTimeout(e.endTimer), e.maxTimer && clearTimeout(e.maxTimer), e.mutationObserver ? .disconnect(), t === e && (t = null))
                }
                e4.add((e, n) => {
                    let r = t;
                    if (!r || r.settled) return;
                    let a = function(e) {
                        try {
                            let t = new URL(e, window.location.origin);
                            if (t.origin !== window.location.origin) return "";
                            return t.pathname
                        } catch {
                            return ""
                        }
                    }(e);
                    r.pendingRequests++, r.networkRequestCount++, r.hadActivity = !0, a && r.endpoints.length < 5 && r.endpoints.push(a), null === r.networkStartTime && (r.networkStartTime = performance.now());
                    let o = performance.now();
                    r.endTimer && (clearTimeout(r.endTimer), r.endTimer = void 0), n.then(t => {
                        r.networkEndTime = Math.max(r.networkEndTime, performance.now());
                        let n = function(e) {
                                if (!e) return null;
                                let t = {};
                                for (let n of e.split(",")) {
                                    let e = n.trim().split(";"),
                                        r = e[0] ? .trim();
                                    if (!r) continue;
                                    let i = 0;
                                    for (let t = 1; t < e.length; t++) {
                                        let n = e[t];
                                        if (n && n.trim().startsWith("dur=")) {
                                            i = parseFloat(n.trim().slice(4)) || 0;
                                            break
                                        }
                                    }
                                    t[r] = i
                                }
                                return Object.keys(t).length > 0 ? t : null
                            }(t.headers.get("Server-Timing")),
                            s = performance.now();
                        if (a && r.networkTimings.length < 5) {
                            let t = new URL(e, location.origin).href;
                            r.networkTimings.push({
                                endpoint: a,
                                serverTimings: n,
                                ttfb: null,
                                downloadTime: null,
                                fetchDuration: tr(s - o),
                                tempLookup: {
                                    absoluteUrl: t,
                                    requestInitiatedAt: o
                                }
                            })
                        }
                        i(r)
                    }, () => {
                        r.networkEndTime = Math.max(r.networkEndTime, performance.now()), i(r)
                    })
                }), e6(), D.XC ? .addEventListener("click", e => {
                    let t = e.target;
                    if (!(t instanceof Element)) return;
                    let n = t.closest('button,summary,[role="button"],[role="menuitem"],[role="tab"],[role="option"],a[data-icv-name],details-menu[src],input[type="text"],input[type="search"],input:not([type]),textarea');
                    n && r(n, 0 === e.detail ? "keyboard" : "click", e)
                }, {
                    capture: !0
                }), D.XC ? .addEventListener("input", e => {
                    let n = e.target;
                    n instanceof Element && n.matches('input[type="text"], input[type="search"], input:not([type]), textarea') && (t && "input" === t.interactionType && t.clickElement === n || r(n, "input"))
                }, {
                    capture: !0
                }), D.XC ? .addEventListener(Y.z.START, () => {
                    t && s(t)
                })
            }(eh)
        }
    },
    454997(e, t, n) {
        function r() {
            return !!document.querySelector('react-app[data-lazy="true"]')
        }

        function i() {
            return !!document.querySelector('react-app[data-alternate="true"]')
        }

        function a() {
            return !!document.querySelector("header.AppHeader")
        }

        function o() {
            return performance.getEntriesByType("resource").some(e => "fetch" === e.initiatorType && e.name.includes("_graphql?"))
        }

        function s() {
            return performance.getEntriesByType("resource").some(e => "script" === e.initiatorType)
        }
        n(432231), n(790932);
        let l = null;

        function c() {
            return l
        }

        function u(e) {
            l = e
        }
        n.d(t, {
            Dk: () => a,
            NT: () => u,
            X: () => c,
            _: () => r,
            aE: () => o,
            u$: () => i,
            xF: () => s
        })
    }
};
//# sourceMappingURL=chunk-26031-a4eee7c18bafecb1-41974429e6f45af6.js.map