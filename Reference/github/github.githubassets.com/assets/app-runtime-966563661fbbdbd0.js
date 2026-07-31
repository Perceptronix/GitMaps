performance.mark("js-parse-end:app-runtime-966563661fbbdbd0.js");
export const __rspack_esm_id = 77844;
export const __rspack_esm_ids = [77844];
export const __webpack_modules__ = {
    145062(e, t, a) {
        var r = a(570170);

        function n(e = 0, t = {}) {
            return (a, n, o) => {
                if (!o || "function" != typeof o.value) throw Error("debounce can only decorate functions");
                let i = o.value;
                o.value = (0, r.s)(i, e, t), Object.defineProperty(a, n, o)
            }
        }
        a.d(t, {
            s: () => n
        })
    },
    570170(e, t, a) {
        function r(e, t = 0, {
            start: a = !0,
            middle: n = !0,
            once: o = !1
        } = {}) {
            let i, s = a,
                c = 0,
                l = !1;

            function d(...r) {
                if (l) return;
                let u = Date.now() - c;
                c = Date.now(), a && n && u >= t && (s = !0), s ? (s = !1, e.apply(this, r), o && d.cancel()) : (n && u < t || !n) && (clearTimeout(i), i = setTimeout(() => {
                    c = Date.now(), e.apply(this, r), o && d.cancel()
                }, n ? t - u : t))
            }
            return d.cancel = () => {
                clearTimeout(i), l = !0
            }, d
        }

        function n(e, t = 0, {
            start: a = !1,
            middle: o = !1,
            once: i = !1
        } = {}) {
            return r(e, t, {
                start: a,
                middle: o,
                once: i
            })
        }
        a.d(t, {
            n: () => r,
            s: () => n
        })
    },
    146926(e, t, a) {
        var r = a(474848),
            n = a(916522),
            o = a(546856);

        function i(e) {
            let t, a, i = (0, n.c)(7),
                {
                    children: s,
                    appName: c,
                    category: l,
                    metadata: d
                } = e;
            i[0] !== c || i[1] !== l || i[2] !== d ? (t = {
                appName: c,
                category: l,
                metadata: d
            }, i[0] = c, i[1] = l, i[2] = d, i[3] = t) : t = i[3];
            let u = t;
            return i[4] !== s || i[5] !== u ? (a = (0, r.jsx)(o.I, {
                value: u,
                children: s
            }), i[4] = s, i[5] = u, i[6] = a) : a = i[6], a
        }
        i.displayName = "AnalyticsProvider", a.d(t, {
            y: () => i
        })
    },
    546856(e, t, a) {
        let r = (0, a(296540).createContext)(null);
        r.displayName = "AnalyticsContext", a.d(t, {}, {
            I: r
        })
    },
    164636(e, t, a) {
        let r = "GraphQLTraces",
            n = "GraphQLTracingRefresh",
            o = i() ? decodeURIComponent(new URLSearchParams(window.location.search).get("disable_clusters") || "").split(",").filter(e => "" !== e) : [];

        function i() {
            return "u" > typeof window
        }

        function s(e) {
            if (!i() || !c() || !e) return;
            let t = window;
            t && !t[r] && (t[r] = []), t && e.__trace && (t[r].push(e.__trace), "function" == typeof t[n] && t[n]())
        }

        function c() {
            if (!i()) return !1;
            let e = window;
            return "true" === new URLSearchParams(window.location.search).get("_tracing") || e && void 0 !== e[r]
        }

        function l() {
            return o.length > 0
        }

        function d(e) {
            if (!i() || !c() && !l()) return e;
            let t = new URL(e, window.location.origin);
            return c() && t.searchParams.set("_tracing", "true"), l() && t.searchParams.set("disable_clusters", o.join(",")), t.pathname + t.search
        }

        function u(e) {
            return o.indexOf(e) > -1
        }

        function m(e) {
            if (!i()) return;
            let t = o.indexOf(e);
            t > -1 ? o.splice(t, 1) : o.push(e);
            let a = new URLSearchParams(window.location.search);
            a.set("disable_clusters", o.join(",")), window.location.search = a.toString()
        }
        a.d(t, {
            Av: () => s,
            HX: () => u,
            M_: () => m,
            RD: () => d
        }, {
            BM: r,
            rb: n
        })
    },
    345404(e, t, a) {
        var r = a(916284),
            n = a(147966);
        n.cg ? .addEventListener("error", e => {
            e.error && (0, r.N7)(e.error)
        }), n.cg ? .addEventListener("unhandledrejection", async e => {
            if (e.promise) try {
                await e.promise
            } catch (e) {
                (0, r.N7)(e)
            }
        }), n.cg ? .location.hash === "#b00m" && setTimeout(() => {
            throw Error("b00m")
        })
    },
    916284(e, t, a) {
        let r;
        a.d(t, {
            AW: () => b,
            fE: () => p,
            ff: () => w,
            N7: () => g
        });
        var n = a(836301),
            o = a(296133),
            i = a(12303),
            s = a(724212);

        function c(e) {
            return (0, s.q)(e.stack || "").map(e => ({
                filename: e.file || "",
                function: String(e.methodName),
                lineno: (e.lineNumber || 0).toString(),
                colno: (e.column || 0).toString()
            }))
        }

        function l(e) {
            let t = document.querySelectorAll(e);
            if (t.length > 0) return t[t.length - 1]
        }
        a(182367);
        var d = a(147966),
            u = a(357624),
            m = a(327905);
        let f = !1,
            h = 0,
            _ = Date.now(),
            p = new Set(["AbortError", "AuthSessionExpiredError", "DataRouterAuthError", "TypeError", "RateLimitError", "NotAcceptableError", "SecFetchHeaderError", "FetchNetworkError", "NoiseError", "ServiceUnavailableError"]),
            b = new Set(["Failed to fetch", "NetworkError when attempting to fetch resource.", "Unable to perform this operation. Please try again later."]);

        function g(e, t = {}) {
            if (!(e instanceof Error || "object" == typeof e && null !== e && "name" in e && "string" == typeof e.name && "message" in e && "string" == typeof e.message)) {
                if (function(e) {
                        if (!e || "boolean" == typeof e || "number" == typeof e) return !0;
                        if ("string" == typeof e) {
                            if (I.some(t => e.includes(t))) return !0
                        } else if ("object" == typeof e && "string" == typeof e.message && "number" == typeof e.code) return !0;
                        return !1
                    }(e)) return;
                let a = Error(),
                    r = function(e) {
                        try {
                            return JSON.stringify(e)
                        } catch {
                            return "Unserializable"
                        }
                    }(e);
                y(E({
                    type: "UnknownError",
                    value: `Unable to report error, due to a thrown non-Error type: ${typeof e}, with value ${r}`,
                    stacktrace: c(a),
                    catalogService: document.head ? .querySelector('meta[name="current-catalog-service"]') ? .content,
                    catalogServiceHash: document.head ? .querySelector('meta[name="current-catalog-service-hash"]') ? .content
                }, t));
                return
            }! function(e) {
                return !!e.name && ("AbortError" === e.name || !!("CancelledError" === e.message && Object.prototype.hasOwnProperty.call(e, "revert") && Object.prototype.hasOwnProperty.call(e, "silent") || "DataRouterAuthError" === e.name || "RateLimitError" === e.name || "NotAcceptableError" === e.name || "SecFetchHeaderError" === e.name || "FetchNetworkError" === e.name || "NoiseError" === e.name || "ServiceUnavailableError" === e.name && w() || p.has(e.name) && b.has(e.message) || e.name.startsWith("ApiError") && b.has(e.message)))
            }(e) && y(E({
                type: e.name,
                value: e.message,
                stacktrace: c(e),
                catalogService: e.catalogService || globalThis.document ? .head ? .querySelector('meta[name="current-catalog-service"]') ? .content,
                catalogServiceHash: e.catalogServiceHash || globalThis.document ? .head ? .querySelector('meta[name="current-catalog-service-hash"]') ? .content
            }, t))
        }
        async function y(e) {
            let t;
            if (t = Date.now() - _ > 2592e5, !(!v && !f && h < 10 && (r ? ? = (0, o.TT)() && function() {
                    let e = d.cg ? .history,
                        t = d.cg ? .location;
                    if (!e || !t) return !1;
                    try {
                        return e.replaceState(e.state, document.title, t.href), !0
                    } catch {
                        return !1
                    }
                }())) || t || (0, i.H)()) return;
            let a = document.head ? .querySelector('meta[name="browser-errors-url"]') ? .content;
            if (a) {
                if (e.error.stacktrace.some(e => S.test(e.filename) || S.test(e.function))) {
                    f = !0;
                    return
                }
                h++;
                try {
                    await fetch(a, {
                        method: "post",
                        body: JSON.stringify({
                            context: e,
                            target: document.head ? .querySelector('meta[name="ui-target"]') ? .content || "full"
                        })
                    })
                } catch {}
            }
        }

        function E(e, t = {}) {
            let a, r = { ...t
            };
            return r.reactAppName || (r.reactAppName = function(e) {
                let t = function() {
                    let e = new Set,
                        t = document.querySelector('meta[name="react-app-name"]') ? .getAttribute("content");
                    for (let [a, r] of (t && e.add(t), T))
                        for (let t of document.querySelectorAll(a))
                            if (t instanceof HTMLElement) {
                                let a = t.getAttribute(r);
                                a && e.add(a)
                            }
                    return Array.from(e)
                }();
                if (!t || !t.length || !e || !e.length) return;
                let a = new Set;
                for (let r of e) {
                    if (!r || !r.filename) continue;
                    let e = r.filename.split(/[\\/]/).pop();
                    if (!e || a.has(e)) continue;
                    a.add(e);
                    let n = t.find(t => e.toLowerCase().includes(t.toLowerCase()));
                    if (n) return n
                }
            }(e.stacktrace)), Object.assign({
                error: e,
                sanitizedUrl: `${window.location.protocol}//${window.location.host}${((a=l("meta[name=analytics-location]"))?a.content:window.location.pathname)+function(){let e=l("meta[name=analytics-location-query-strip]"),t="";e||(t=window.location.search);let a=l("meta[name=analytics-location-params]");for(let e of(a&&(t+=(t?"&":"?")+a.content),document.querySelectorAll("meta[name=analytics-param-rename]"))){let a=e.content.split(":",2);t=t.replace(RegExp(`(^|[?&])${a[0]}($|=)`,"g"),`$1${a[1]}$2`)}return t}()}` || window.location.href,
                readyState: document.readyState,
                referrer: (0, u.dR)(),
                timeSinceLoad: Math.round(Date.now() - _),
                user: function() {
                    let e = document.head ? .querySelector('meta[name="user-login"]') ? .content;
                    if (e) return e;
                    let t = (0, n.y)();
                    return `anonymous-${t}`
                }() || void 0,
                actorId: document.head ? .querySelector('meta[name="octolytics-actor-id"]') ? .content,
                bundler: "rspack",
                ui: !1,
                release: document.head ? .querySelector('meta[name="release"]') ? .content,
                pastRequestIds: (0, m.xA)()
            }, r)
        }
        let S = /(chrome|moz|safari)-extension:\/\//;

        function w() {
            return !document.head ? .querySelector('meta[name="user-login"]') ? .content
        }
        let v = !1;
        d.cg ? .addEventListener("pageshow", () => v = !1), d.cg ? .addEventListener("pagehide", () => v = !0), "function" == typeof BroadcastChannel && new BroadcastChannel("shared-worker-error").addEventListener("message", e => {
            g(e.data.error)
        });
        let I = ["Object Not Found Matching Id", "Not implemented on this platform", "provider because it's not your default extension"],
            T = [
                ["react-app", "app-name"],
                ["react-partial", "partial-name"]
            ]
    },
    123364(e, t, a) {
        let r = new Set(["cloudflare", "zscaler"]);

        function n({
            status: e,
            rejectReason: t,
            bodyText: a
        }) {
            switch (e) {
                case 429:
                    return "rate-limit";
                case 503:
                    return "service-unavailable";
                case 406:
                    return "not-acceptable";
                case 410:
                case 418:
                    return "noise";
                case 401:
                    return "auth"
            }
            if (403 === e) {
                let e = a ? .toLowerCase();
                return e && [...r].some(t => e.includes(t)) ? "noise" : "csrf" === t ? "sec-fetch" : a ? "auth" : "generic"
            }
            return 422 === e && (a ? .includes("sec-fetch-dest") || a ? .includes("sec-fetch-site")) ? "sec-fetch" : "generic"
        }
        a.d(t, {
            n: () => n
        })
    },
    432231(e, t, a) {
        var r = a(905225),
            n = a(747251);

        function o() {
            return new Set((0, n._$)().featureFlags)
        }
        let i = a(508995).X3 || function() {
            try {
                return process ? .env ? .STORYBOOK === "true"
            } catch {
                return !1
            }
        }() ? o : (0, r.A)(o);

        function s() {
            return Array.from(i())
        }

        function c(e) {
            return i().has(e)
        }
        a.d(t, {
            G7: () => c,
            fQ: () => s
        }, {
            XY: {
                isFeatureEnabled: c
            }
        })
    },
    402604(e, t, a) {
        let r;
        a.d(t, {
            sX: () => S,
            BI: () => w,
            lA: () => E,
            Ti: () => v
        });
        let n = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "scid"];
        var o = a(836301),
            i = a(984835),
            s = a(147966),
            c = a(826099);
        let l = "font-weight: bold; font-size: 12px;",
            d = new Set(["actor_id", "actor_login", "actor_hash", "referrer", "request_id", "visitor_id", "region_edge", "region_render", "staff", "service", "react", "app_name", "page", "title"]),
            u = new Set(["hpc", "ttfb", "fcp", "lcp", "fid", "inp", "cls", "elementtiming", "longTasks", "longAnimationFrames"]),
            m = new Set(["react", "reactApp", "reactPartials", "featureFlags", "ssr", "controller", "action", "routePattern", "cpu", "domNodes", "previousDomNodes", "navigationId"]);

        function f(e) {
            try {
                return JSON.parse(e)
            } catch {
                return e
            }
        }
        let {
            getItem: h
        } = (0, i.A)("localStorage"), _ = "dimension_", p = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "scid"];

        function b(e) {
            try {
                return function(e = "ha") {
                    let t, a = {};
                    for (let r of Array.from(document.head.querySelectorAll(`meta[name^="${e}-"]`))) {
                        let {
                            name: n,
                            content: o
                        } = r, i = n.replace(`${e}-`, "").replace(/-/g, "_");
                        "url" === i ? t = o : a[i] = o
                    }
                    if (!t) throw Error(`AnalyticsClient ${e}-url meta tag not found`);
                    return {
                        collectorUrl: t,
                        ...Object.keys(a).length > 0 ? {
                            baseContext: a
                        } : {}
                    }
                }(e)
            } catch {
                return
            }
        }
        let g = b("octolytics");

        function y(e) {
            let t = b("octolytics") ? .baseContext ? ? {};
            if (t)
                for (let [e, a] of (delete t.app_id, delete t.event_url, delete t.host, Object.entries(t))) e.startsWith(_) && (t[e.replace(_, "")] = a, delete t[e]);
            let a = s.XC ? .querySelector("meta[name=visitor-payload]");
            for (let [e, r] of (a && Object.assign(t, JSON.parse(atob(a.content))), new URLSearchParams(window.location.search))) p.includes(e.toLowerCase()) && (t[e] = r);
            return t.staff = (0, c.Xl)().toString(), Object.assign(t, e)
        }

        function E(e) {
            r ? .sendPageView(y(e))
        }

        function S() {
            return s.XC ? .head ? .querySelector('meta[name="current-catalog-service"]') ? .content
        }

        function w(e, t = {}, {
            batched: a = !1,
            page: n
        } = {}) {
            let o = S(),
                i = o ? {
                    service: o
                } : {};
            for (let [e, a] of Object.entries(t)) null != a && (i[e] = `${a}`);
            if (r) {
                let t = e || "unknown",
                    o = y(i);
                n ? function(e, t, a) {
                    if (!r) return;
                    let n = {
                        page: "u" < typeof window ? a : new URL(a, window.location.origin).toString(),
                        title: s.XC ? .title ? ? "",
                        context: t,
                        type: e
                    };
                    r.send({
                        events: [n]
                    })
                }(t, o, n) : a ? r.sendBatchedEvent(t, o) : r.sendEvent(t, o), "true" === h("stats-dev-logger") && function(e, t = {}) {
                    let a, r = [];
                    for (let [e, a] of Object.entries(t)) d.has(e) || r.push([e, f(a)]);
                    let n = void 0 !== t.value ? ` ${"number"==typeof(a=f(t.value))?String(Math.round(a)):String(a)}` : "";
                    console.groupCollapsed(`%cevent%c ${e}${n}`, "background: #8957e5; color: #fff; padding: 2px 6px; border-radius: 3px; font-weight: bold; font-size: 11px;", l), "web-vital" === e ? function(e) {
                        for (let [t, a] of e) u.has(t) ? (console.log(`%c${t}`, l), console.table(a)) : m.has(t) || console.log(`${t}:`, a)
                    }(r) : (console.table(Object.fromEntries(r.map(([e, t]) => [e, {
                        value: t
                    }]))), console.log(Object.fromEntries(r))), console.groupEnd()
                }(t, o)
            }
        }

        function v(e) {
            return Object.fromEntries(Object.entries(e).map(([e, t]) => [e, JSON.stringify(t)]))
        }
        g && (delete g.baseContext, g.idleTimeout = 5e3, g.maxBatchSize = 50, r = new class {
            constructor(e) {
                this.options = e, this.eventBatch = [], this.idleCallbackId = null, this.waitTimerId = null, this.onVisibilityChange = () => {
                    "hidden" === document.visibilityState && this.flushBatch()
                }, this.boundFlush = () => this.flushBatch(), "u" > typeof document && document.addEventListener("visibilitychange", this.onVisibilityChange), "u" > typeof window && window.addEventListener("pagehide", this.boundFlush)
            }
            get collectorUrl() {
                return this.options.collectorUrl
            }
            get clientId() {
                return this.options.clientId ? this.options.clientId : (0, o.y)()
            }
            get maxBatchSize() {
                return this.options.maxBatchSize ? ? 10
            }
            get idleTimeout() {
                return this.options.idleTimeout ? ? 1e3
            }
            createEvent(e) {
                return {
                    page: location.href,
                    title: document.title,
                    context: { ...this.options.baseContext,
                        ... function() {
                            let e = {};
                            try {
                                for (let [t, a] of new URLSearchParams(window.location.search)) {
                                    let r = t.toLowerCase();
                                    n.includes(r) && (e[r] = a)
                                }
                                return e
                            } catch (e) {
                                return {}
                            }
                        }(),
                        ...e
                    }
                }
            }
            sendPageView(e) {
                let t = this.createEvent(e);
                this.send({
                    page_views: [t]
                })
            }
            sendEvent(e, t) {
                let a = { ...this.createEvent(t),
                    type: e
                };
                this.send({
                    events: [a]
                })
            }
            sendBatchedEvent(e, t) {
                let a = { ...this.createEvent(t),
                    type: e
                };
                this.eventBatch.push(a), this.eventBatch.length >= this.maxBatchSize ? this.flushBatch() : this.scheduleFlush()
            }
            flushBatch() {
                if (0 === this.eventBatch.length) return;
                this.cancelScheduledFlush();
                let e = this.eventBatch;
                this.eventBatch = [], this.send({
                    events: e
                })
            }
            destroy() {
                this.flushBatch(), "u" > typeof document && document.removeEventListener("visibilitychange", this.onVisibilityChange), "u" > typeof window && window.removeEventListener("pagehide", this.boundFlush)
            }
            scheduleFlush() {
                null === this.idleCallbackId && null === this.waitTimerId && (this.waitTimerId = setTimeout(() => {
                    this.waitTimerId = null, "function" == typeof requestIdleCallback ? this.idleCallbackId = requestIdleCallback(this.boundFlush) : this.boundFlush()
                }, this.idleTimeout))
            }
            cancelScheduledFlush() {
                null !== this.idleCallbackId && ("function" == typeof cancelIdleCallback && cancelIdleCallback(this.idleCallbackId), this.idleCallbackId = null), null !== this.waitTimerId && (clearTimeout(this.waitTimerId), this.waitTimerId = null)
            }
            send({
                page_views: e,
                events: t
            }) {
                let a = JSON.stringify({
                    client_id: this.clientId,
                    page_views: e,
                    events: t,
                    request_context: {
                        referrer: function() {
                            let e;
                            try {
                                e = window.top.document.referrer
                            } catch (t) {
                                if (window.parent) try {
                                    e = window.parent.document.referrer
                                } catch (e) {}
                            }
                            return "" === e && (e = document.referrer), e
                        }(),
                        user_agent: navigator.userAgent,
                        screen_resolution: function() {
                            try {
                                return `${screen.width}x${screen.height}`
                            } catch (e) {
                                return "unknown"
                            }
                        }(),
                        browser_resolution: function() {
                            let e = 0,
                                t = 0;
                            try {
                                return "number" == typeof window.innerWidth ? (t = window.innerWidth, e = window.innerHeight) : null != document.documentElement && null != document.documentElement.clientWidth ? (t = document.documentElement.clientWidth, e = document.documentElement.clientHeight) : null != document.body && null != document.body.clientWidth && (t = document.body.clientWidth, e = document.body.clientHeight), `${t}x${e}`
                            } catch (e) {
                                return "unknown"
                            }
                        }(),
                        browser_languages: navigator.languages ? navigator.languages.join(",") : navigator.language || "",
                        pixel_ratio: window.devicePixelRatio,
                        timestamp: Date.now(),
                        tz_seconds: -60 * new Date().getTimezoneOffset()
                    }
                });
                try {
                    if (navigator.sendBeacon) return void navigator.sendBeacon(this.collectorUrl, a)
                } catch {}
                fetch(this.collectorUrl, {
                    method: "POST",
                    cache: "no-cache",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: a,
                    keepalive: !1
                })
            }
        }(g))
    },
    282467(e, t, a) {
        var r = a(382500),
            n = a(474848),
            o = a(916522),
            i = a(687996),
            s = a(296540),
            c = a(121373),
            l = a(868273),
            d = a(978595),
            u = a(195393),
            m = a(203182),
            f = a(152036),
            h = a(126108),
            _ = a(97093),
            p = a(21335),
            b = a(995930),
            g = a(969391),
            y = a(191077),
            E = a(702812),
            S = a(844740),
            w = a(180657),
            v = a(343873),
            I = a(224031),
            T = a(502401),
            R = a(252970),
            C = a(991853),
            A = a(507324),
            x = a(176495),
            N = a(977288),
            P = a(857799),
            O = a(704247),
            D = a(634164),
            j = a(119200),
            L = a(57027),
            k = a(429348),
            M = a(676103),
            U = a(52056),
            q = a(567863);
        let B = "NameWithDetails-module__NameWithDetailsToken__kVtIk",
            $ = "NameWithDetails-module__NameWithDetailsTokenSuccess__ra8Dx",
            W = "NameWithDetails-module__NameWithDetailsTokenAttention__KRWZj",
            F = "NameWithDetails-module__NameWithDetailsTokenDanger__zk7RG",
            H = "NameWithDetails-module__NameWithDetailsBoxFontMedium__EV2sl",
            V = e => {
                var t;
                let a, r, i, s, c, l, d, u, m, f, h = (0, o.c)(33),
                    {
                        name: _,
                        type: p,
                        duration: b,
                        sqlQueriesCount: g,
                        allocationsCount: y,
                        traces: E,
                        cacheStatus: S
                    } = e;
                h[0] !== p ? (r = p ? (0, n.jsx)(N.A, {
                    text: p.toString()
                }) : null, h[0] = p, h[1] = r) : r = h[1];
                let w = r;
                h[2] !== E ? (a = JSON.parse(JSON.stringify(t = E)), delete a.flamegraph, i = {
                    cleanTrace: a,
                    flamegraphData: t.flamegraph
                }, h[2] = E, h[3] = i) : i = h[3];
                let v = i;
                h[4] !== E.method || h[5] !== E.url || h[6] !== E.verified_fetch ? (s = async e => {
                    let {
                        e: t,
                        objectFlamegraph: a,
                        vernier: r
                    } = e;
                    t.preventDefault(), t.stopPropagation();
                    let n = E.url,
                        o = E.method;
                    if (n && o) {
                        let e, t;
                        e = "flamegraph=1&flamegraph_output=json&flamegraph_interval=500" + (a ? "&flamegraph_mode=object" : "") + (r ? "&flamegraph_mode=vernier" : "");
                        let i = n.replace(/([&\\?])_tracing=true/, ""),
                            s = 0 > i.indexOf("?") ? `${i}?${e}` : `${i}&${e}`;
                        t = E.verified_fetch ? await (0, L.DI)(s, {
                            method: o,
                            cache: "no-cache",
                            headers: {
                                accept: "application/json"
                            }
                        }) : await fetch(s, {
                            method: o,
                            mode: "no-cors",
                            cache: "no-cache",
                            headers: {
                                accept: "application/json"
                            }
                        });
                        let c = await t.blob(),
                            l = window.URL.createObjectURL(c),
                            d = document.createElement("a");
                        d.href = l, d.download = "flamegraph.json", document.body.appendChild(d), d.click(), d.remove()
                    } else alert("Unable to find url where to get flamegraph")
                }, h[4] = E.method, h[5] = E.url, h[6] = E.verified_fetch, h[7] = s) : s = h[7];
                let I = s,
                    T = E.request_id,
                    R = null;
                if ("HIT" === S) {
                    let e;
                    h[8] === Symbol.for("react.memo_cache_sentinel") ? (e = (0, n.jsx)(N.A, {
                        leadingVisual: k.CacheIcon,
                        text: "Hit"
                    }), h[8] = e) : e = h[8], R = e
                } else if ("REFRESH" === S) {
                    let e;
                    h[9] === Symbol.for("react.memo_cache_sentinel") ? (e = (0, n.jsx)(N.A, {
                        leadingVisual: k.CacheIcon,
                        text: "\u21BA"
                    }), h[9] = e) : e = h[9], R = e
                }
                return h[10] !== _ ? (c = (0, n.jsx)(j.A, {
                    expandable: !0,
                    title: _,
                    className: "NameWithDetails-module__NameWithDetailsTruncate__svTNd",
                    children: _
                }), h[10] = _, h[11] = c) : c = h[11], h[12] !== g ? (l = (0, n.jsx)(Y, {
                    count: g
                }), h[12] = g, h[13] = l) : l = h[13], h[14] !== y ? (d = (0, n.jsx)(J, {
                    count: y
                }), h[14] = y, h[15] = d) : d = h[15], h[16] !== b ? (u = (0, n.jsx)(G, {
                    duration: b
                }), h[16] = b, h[17] = u) : u = h[17], h[18] !== v || h[19] !== _ || h[20] !== I || h[21] !== T || h[22] !== w || h[23] !== p ? (m = w && (0, n.jsx)(z, {
                    name: _,
                    isGraphqlQuery: "gql-query" === p || "gql-mutation" === p,
                    cleanTrace: v.cleanTrace,
                    onFlamegraphClick: I,
                    requestId: T
                }), h[18] = v, h[19] = _, h[20] = I, h[21] = T, h[22] = w, h[23] = p, h[24] = m) : m = h[24], h[25] !== R || h[26] !== c || h[27] !== l || h[28] !== d || h[29] !== u || h[30] !== m || h[31] !== w ? (f = (0, n.jsxs)("div", {
                    className: "NameWithDetails-module__NameWithDetailsContainer__cUEvn",
                    children: [c, R, w, l, d, u, m]
                }), h[25] = R, h[26] = c, h[27] = l, h[28] = d, h[29] = u, h[30] = m, h[31] = w, h[32] = f) : f = h[32], f
            };
        V.displayName = "NameWithDetails";
        let G = e => {
            let t, a, r, i = (0, o.c)(7),
                {
                    duration: s
                } = e;
            i[0] !== s ? (t = s.toFixed(1), i[0] = s, i[1] = t) : t = i[1];
            let c = `${t}ms`,
                l = s < 100 ? $ : s < 500 ? W : F;
            return i[2] !== l ? (a = (0, D.$)(B, l), i[2] = l, i[3] = a) : a = i[3], i[4] !== a || i[5] !== c ? (r = (0, n.jsx)(N.A, {
                text: c,
                className: a
            }), i[4] = a, i[5] = c, i[6] = r) : r = i[6], r
        };
        G.displayName = "TimingDetail";
        let z = e => {
            let t, a, r, i, s, c, l, d, u, m, h = (0, o.c)(22),
                {
                    name: p,
                    isGraphqlQuery: g,
                    onFlamegraphClick: E,
                    requestId: S
                } = e;
            h[0] === Symbol.for("react.memo_cache_sentinel") ? (t = (0, n.jsx)(f.W.Anchor, {
                children: (0, n.jsx)(N.A, {
                    text: "",
                    leadingVisual: y.KebabHorizontalIcon,
                    className: "NameWithDetails-module__NameWithDetailsTokenPadded___qRw3"
                })
            }), h[0] = t) : t = h[0];
            let w = `api-traces-${p}.json`;
            return h[1] !== E ? (a = e => E({
                e,
                vernier: !0
            }), h[1] = E, h[2] = a) : a = h[2], h[3] === Symbol.for("react.memo_cache_sentinel") ? (r = (0, n.jsx)(_.l.LeadingVisual, {
                children: (0, n.jsx)(M.FlameIcon, {})
            }), i = (0, n.jsx)("div", {
                className: H,
                children: "Download Vernier flamegraph"
            }), h[3] = r, h[4] = i) : (r = h[3], i = h[4]), h[5] === Symbol.for("react.memo_cache_sentinel") ? (s = (0, n.jsxs)(_.l.Description, {
                variant: "block",
                children: ["JSON data for use with", " ", (0, n.jsx)(A.A, {
                    inline: !0,
                    href: "https://vernier.prof",
                    children: "Vernier (Firefox) profiler"
                })]
            }), h[5] = s) : s = h[5], h[6] !== w || h[7] !== a ? (c = (0, n.jsxs)(_.l.LinkItem, {
                download: w,
                "aria-label": "Download Vernier flamegraph",
                onClick: a,
                children: [r, i, s]
            }), h[6] = w, h[7] = a, h[8] = c) : c = h[8], h[9] !== g || h[10] !== p ? (l = g && (0, n.jsxs)(_.l.LinkItem, {
                href: X(p),
                target: "_blank",
                "aria-label": "Datadog dashboard",
                children: [(0, n.jsx)(_.l.LeadingVisual, {
                    children: (0, n.jsx)(b.GraphIcon, {})
                }), (0, n.jsx)("div", {
                    className: H,
                    children: "Datadog dashboard"
                }), (0, n.jsx)(_.l.Description, {
                    variant: "block",
                    children: "View last week's data for this GraphQL query"
                })]
            }), h[9] = g, h[10] = p, h[11] = l) : l = h[11], h[12] !== g || h[13] !== p ? (d = g && (0, n.jsxs)(_.l.LinkItem, {
                href: K(p),
                target: "_blank",
                "aria-label": "Datadog APM logs",
                children: [(0, n.jsx)(_.l.LeadingVisual, {
                    children: (0, n.jsx)(U.LogIcon, {})
                }), (0, n.jsx)("div", {
                    className: H,
                    children: "Datadog APM "
                }), (0, n.jsx)(_.l.Description, {
                    variant: "block",
                    children: "View traces for this GraphQL query in DataDog APM"
                })]
            }), h[12] = g, h[13] = p, h[14] = d) : d = h[14], h[15] !== S ? (u = S && (0, n.jsxs)(_.l.LinkItem, {
                href: Q(S),
                target: "_blank",
                "aria-label": "Splunk logs",
                children: [(0, n.jsx)(_.l.LeadingVisual, {
                    children: (0, n.jsx)(U.LogIcon, {})
                }), (0, n.jsx)("div", {
                    className: H,
                    children: "Splunk logs"
                }), (0, n.jsx)(_.l.Description, {
                    variant: "block",
                    children: "View logs for this query in Splunk"
                })]
            }), h[15] = S, h[16] = u) : u = h[16], h[17] !== u || h[18] !== c || h[19] !== l || h[20] !== d ? (m = (0, n.jsxs)(f.W, {
                children: [t, (0, n.jsx)(f.W.Overlay, {
                    width: "medium",
                    children: (0, n.jsxs)(_.l, {
                        showDividers: !0,
                        children: [c, l, d, u]
                    })
                })]
            }), h[17] = u, h[18] = c, h[19] = l, h[20] = d, h[21] = m) : m = h[21], m
        };
        z.displayName = "LinksMenu";
        let X = e => {
                let t = e.toLowerCase(),
                    a = Date.now().toString(),
                    r = (Date.now() - 6048e5).toString(),
                    n = new URLSearchParams;
                return n.set("tpl_var_operation_name[0]", t), n.set("from_ts", r), n.set("to_ts", a), `https://app.datadoghq.com/dashboard/vyc-z7e-fna?${n}`
            },
            K = e => `https://app.datadoghq.com/apm/traces?query=@graphql.operation.name:${e}`,
            Q = e => {
                let t = Math.floor((Date.now() + 6e4) / 1e3).toString(),
                    a = Math.floor((Date.now() - 6e4) / 1e3).toString(),
                    r = new URLSearchParams;
                return r.set("display.page.search.mode", "verbose"), r.set("q", `search index=* "${e}"`), r.set("dispatch.sample_ratio", "1"), r.set("earliest", a), r.set("latest", t), `https://splunk.githubapp.com/en-US/app/gh_reference_app/search?${r}`
            },
            Y = e => {
                let t, a, r = (0, o.c)(4),
                    {
                        count: i
                    } = e;
                return i < 1 ? null : (r[0] !== i ? (t = i.toString(), r[0] = i, r[1] = t) : t = r[1], r[2] !== t ? (a = (0, n.jsx)(N.A, {
                    text: t,
                    leadingVisual: I.DatabaseIcon,
                    className: B
                }), r[2] = t, r[3] = a) : a = r[3], a)
            };
        Y.displayName = "DatabaseDetail";
        let J = e => {
            let t, a, r, i = (0, o.c)(7),
                {
                    count: s
                } = e;
            if (s < 1) return null;
            let c = s < 1e5 ? $ : s < 3e5 ? W : F;
            return i[0] !== s ? (t = s.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), i[0] = s, i[1] = t) : t = i[1], i[2] !== c ? (a = (0, D.$)(B, c), i[2] = c, i[3] = a) : a = i[3], i[4] !== t || i[5] !== a ? (r = (0, n.jsx)(N.A, {
                text: t,
                leadingVisual: q.ContainerIcon,
                className: a
            }), i[4] = t, i[5] = a, i[6] = r) : r = i[6], r
        };

        function Z(e, t, a) {
            let r = e;
            for (let n of t) {
                for (let e of n.split("/")) r && r[e] && (r = r[e]);
                if (r && !Array.isArray(r) && Math.round(10 * parseFloat(r)) / 10 >= a) return parseFloat(r);
                r = e
            }
        }

        function ee(e, t, a = []) {
            if (t.sql) {
                let r = a.slice(1, a.length - 4).join(".");
                e.push({
                    query: t.sql,
                    digested_query: t.digested_sql,
                    duration: t.duration_ms,
                    result: t.result_count,
                    cluster_name: t.cluster_name,
                    fallbacks: t.fallbacks,
                    backtrace: t.backtrace,
                    onPrimary: t.on_primary,
                    path: r
                })
            }
            for (let r of Object.keys(t)) "flamegraph" !== r && "object" == typeof t[r] && null !== t[r] && ee(e, t[r], [...a, r])
        }

        function et(e) {
            let t = e.match(/(?:\/workspaces\/github\/|\/build\/)(.*):([0-9]+)/);
            if (t) return {
                remoteUrl: `https://github.com/github/github/blob/master/${t[1]}#L${t[2]}`,
                relativePath: t[1],
                line: t[2]
            }
        }

        function ea(e, t) {
            if (e.endsWith("Query")) return "gql-query";
            if (e.endsWith("Mutation")) return "gql-mutation";
            if (e.endsWith("Subscription")) return "gql-subscription";
            switch (t.method) {
                case "GET":
                    return "get";
                case "POST":
                    return "post";
                case "PUT":
                    return "put";
                case "DELETE":
                    return "delete"
            }
        }

        function er(e) {
            let t = e.query_name;
            if (!t) return !!e.query_text;
            let a = ea(t, e);
            return "gql-query" === a || "gql-mutation" === a || "gql-subscription" === a
        }
        J.displayName = "AllocationDetail";
        let en = e => {
            let t, a, r, i, s, c, l, d, u, m = (0, o.c)(41),
                {
                    title: f,
                    queries: h,
                    nPlusOnes: _,
                    sort: b,
                    showFieldsPathInQueries: g
                } = e;
            m[0] !== h ? (t = h.reduce(ei, 0), m[0] = h, m[1] = t) : t = m[1];
            let y = t;
            if (m[2] !== _ || m[3] !== h || m[4] !== g || m[5] !== b || m[6] !== f || m[7] !== y) {
                l = Symbol.for("react.early_return_sentinel");
                e: {
                    let e, t, o, d, u, E, S = h.reduce(es, 0);
                    if (0 === h.length) {
                        l = null;
                        break e
                    }
                    let w = function(e, t) {
                        switch (t) {
                            case "duration":
                                return [...e].sort((e, t) => t.duration - e.duration);
                            case "resultCount":
                                return [...e].sort((e, t) => (t.result ? ? 0) - (e.result ? ? 0));
                            default:
                                return e
                        }
                    }(h, b);r = p.G.Item,
                    s = `${f}-database-item`,
                    m[14] !== f ? (e = (0, n.jsx)("span", {
                        className: "DatabaseTreeItem-module__DatabaseTreeItemText__IMOt7",
                        children: f
                    }), m[14] = f, m[15] = e) : e = m[15],
                    m[16] !== h.length ? (t = (0, n.jsx)(Y, {
                        count: h.length
                    }), m[16] = h.length, m[17] = t) : t = m[17],
                    m[18] !== _.length ? (o = _.length > 0 && (0, n.jsx)(N.A, {
                        text: `${_.length} N+1`,
                        leadingVisual: P.AlertFillIcon,
                        className: "DatabaseTreeItem-module__DatabaseTreeItemToken__DTb5P"
                    }), m[18] = _.length, m[19] = o) : o = m[19];
                    let v = S.toString();m[20] !== v ? (d = (0, n.jsx)(N.A, {
                        text: v,
                        leadingVisual: O.RowsIcon,
                        className: "DatabaseTreeItem-module__DatabaseTreeItemTokenSecondary__T7nnd"
                    }), m[20] = v, m[21] = d) : d = m[21],
                    m[22] !== y ? (u = (0, n.jsx)(G, {
                        duration: y
                    }), m[22] = y, m[23] = u) : u = m[23],
                    m[24] !== d || m[25] !== u || m[26] !== e || m[27] !== t || m[28] !== o ? (c = (0, n.jsxs)("div", {
                        className: "DatabaseTreeItem-module__DatabaseTreeItemBox__JTd0C",
                        children: [e, t, o, d, u]
                    }), m[24] = d, m[25] = u, m[26] = e, m[27] = t, m[28] = o, m[29] = c) : c = m[29],
                    a = p.G.SubTree,
                    m[30] !== _ || m[31] !== g ? (E = e => {
                        let t;
                        return (0, n.jsx)(p.G.Item, {
                            id: `${e.query}-query-item`,
                            children: (0, n.jsxs)("div", {
                                children: [(0, n.jsx)(A.A, {
                                    target: "_blank",
                                    href: function(e) {
                                        if (void 0 === e || Array.isArray(e) && 0 === e.length) return;
                                        let t = Array.isArray(e) ? e[0] : e;
                                        if (!t || "string" != typeof t) return;
                                        let a = et(t);
                                        if (void 0 !== a) return a.remoteUrl
                                    }(e.backtrace),
                                    muted: !0,
                                    className: "DatabaseTreeItem-module__DatabaseTreeItemLink__HmkFE",
                                    children: e.query
                                }), (0, n.jsx)("br", {}), g && (0, n.jsx)("span", {
                                    className: "DatabaseTreeItem-module__DatabaseTreeItemTextMuted__FdtdN",
                                    children: e.path
                                }), (0, n.jsxs)("div", {
                                    className: "DatabaseTreeItem-module__DatabaseTreeItemBoxNested__D3qNV",
                                    children: [(0, n.jsx)("span", {
                                        className: "DatabaseTreeItem-module__DatabaseTreeItemTextSmallMuted__r9KdR",
                                        children: (t = "unknown", e.fallbacks ? .length && (t = e.fallbacks.join(", ")), `${e.duration.toFixed(2)}ms, ${e.result} results, fallbacks: ${t}`)
                                    }), eo(e, _) > 0 && (0, n.jsx)(N.A, {
                                        text: `${eo(e,_)} N+1`,
                                        leadingVisual: P.AlertFillIcon,
                                        className: "DatabaseTreeItem-module__DatabaseTreeItemTokenAttention__AbN0X"
                                    })]
                                })]
                            })
                        }, e.query)
                    }, m[30] = _, m[31] = g, m[32] = E) : E = m[32],
                    i = w.map(E)
                }
                m[2] = _, m[3] = h, m[4] = g, m[5] = b, m[6] = f, m[7] = y, m[8] = a, m[9] = r, m[10] = i, m[11] = s, m[12] = c, m[13] = l
            } else a = m[8], r = m[9], i = m[10], s = m[11], c = m[12], l = m[13];
            return l !== Symbol.for("react.early_return_sentinel") ? l : (m[33] !== a || m[34] !== i ? (d = (0, n.jsx)(a, {
                children: i
            }), m[33] = a, m[34] = i, m[35] = d) : d = m[35], m[36] !== r || m[37] !== s || m[38] !== c || m[39] !== d ? (u = (0, n.jsxs)(r, {
                id: s,
                children: [c, d]
            }), m[36] = r, m[37] = s, m[38] = c, m[39] = d, m[40] = u) : u = m[40], u)
        };

        function eo(e, t) {
            let a = t ? .find(t => t.sql === e.digested_query);
            return a ? a.count : 0
        }

        function ei(e, t) {
            return e + t.duration
        }

        function es(e, t) {
            return e + (t.result ? ? 0)
        }
        en.displayName = "DatabaseTreeItem";
        let ec = "PerformancePaneItem-module__PerformancePaneItemText__BApcI",
            el = e => {
                let t, a, r, i, s, c, l, d = (0, o.c)(36),
                    {
                        name: u,
                        isRoot: m,
                        item: f,
                        sortType: h,
                        threshold: _,
                        variables: b,
                        showSubscriptionQueries: g,
                        groupSqlByClusters: y,
                        showFieldsPathInQueries: E,
                        query_text: S
                    } = e;
                if (d[0] !== y || d[1] !== m || d[2] !== f || d[3] !== u || d[4] !== S || d[5] !== E || d[6] !== g || d[7] !== h || d[8] !== _ || d[9] !== b) {
                    c = Symbol.for("react.early_return_sentinel");
                    e: {
                        let e, o, l, w, v, I, T = Object.keys(f),
                            R = [];m && ee(R, f),
                        d[17] !== f ? (e = Z(f, ["total/allocated_objects_count"], 0) || 0, d[17] = f, d[18] = e) : e = d[18];
                        let C = e,
                            A = y ? R.reduce((e, t) => {
                                let a = t.onPrimary ? "primary" : "replica",
                                    r = `${t.cluster_name} (${a})` || "unknown";
                                return e[r] || (e[r] = []), e[r] ? .push(t), e
                            }, {}) : [];d[19] !== m || d[20] !== f ? (o = m ? function(e) {
                            if (e.execution) {
                                let t = e.execution.n_plus1_sql_queries;
                                if (t) return t
                            }
                            return []
                        }(f) : [], d[19] = m, d[20] = f, d[21] = o) : o = d[21];
                        let N = o;d[22] !== m || d[23] !== f ? (l = [], m && function e(t, a) {
                            if (a.elastomer)
                                for (let e of a.elastomer.calls) t.push({
                                    query: e.body,
                                    duration: e.duration_ms,
                                    result: e.count
                                });
                            for (let r of Object.keys(a)) "flamegraph" !== r && "object" == typeof a[r] && null !== a[r] && e(t, a[r])
                        }(l, f), d[22] = m, d[23] = f, d[24] = l) : l = d[24],
                        parseInt(u, 10).toString() === u && "string" == typeof f.name && (u = f.name);
                        let P = Z(f, ["total/duration_ms", "__trace/children_duration_ms", "duration_ms"], _),
                            O = T.filter(e => "object" == typeof f[e] && (!P || "total" !== e)),
                            j = ed(f, u);
                        if (P || (P = function(e, t, a) {
                                let r = 0;
                                for (let n of e) {
                                    let e = Z(t[n], ["total/duration_ms", "__trace/children_duration_ms"], a);
                                    e && (r += e)
                                }
                                return r > 0 ? r : void 0
                            }(O, f, _)), !P) {
                            let e;
                            d[25] === Symbol.for("react.memo_cache_sentinel") ? (e = (0, n.jsx)(n.Fragment, {}), d[25] = e) : e = d[25], c = e;
                            break e
                        }
                        d[26] !== f || d[27] !== u ? (v = ea(u, f), d[26] = f, d[27] = u, d[28] = v) : v = d[28];
                        let L = v;
                        if (!g && er(f) && "gql-subscription" === L) {
                            let e;
                            d[29] === Symbol.for("react.memo_cache_sentinel") ? (e = (0, n.jsx)(n.Fragment, {}), d[29] = e) : e = d[29], c = e;
                            break e
                        }
                        "hit" === f.cache_result ? I = "HIT" : "refresh" === f.cache_result && (I = "REFRESH"),
                        w = (0, n.jsx)(V, {
                            name: u,
                            type: L,
                            duration: P,
                            sqlQueriesCount: R.length,
                            allocationsCount: C,
                            traces: f,
                            cacheStatus: I
                        });
                        let k = eu(j),
                            M = k.length > 0 ? em(k, f, u) : [],
                            U = O.filter(e => {
                                var t, a, r;
                                let n, o, i, s, c, l;
                                return t = f[e], a = e, r = _, n = Object.keys(t), o = ed(t, a), i = Z(t, ["total/duration_ms", "__trace/children_duration_ms", "duration_ms"], r), s = n.filter(e => "object" == typeof t[e] && (!i || "total" !== e)), l = (c = eu(o)).length > 0 ? em(c, t, a) : [], "__trace" !== a || 0 !== l.length || 0 !== s.length
                            }).map(e => (0, n.jsx)(el, {
                                name: e,
                                item: f[e],
                                threshold: _
                            }, e));t = p.G.Item,
                        a = u,
                        r = `${u}-pane-item`,
                        i = w,
                        s = (M.length > 0 || m || U.length > 0) && (0, n.jsxs)(p.G.SubTree, {
                            children: [M, m && (0, n.jsxs)(n.Fragment, {
                                children: [(0, n.jsxs)(p.G.Item, {
                                    id: `${u}-pane-query-item`,
                                    children: ["query", (0, n.jsxs)(p.G.SubTree, {
                                        children: [S && (0, n.jsxs)(p.G.Item, {
                                            id: `${u}-pane-query-text-item`,
                                            children: ["query_text", (0, n.jsx)(p.G.SubTree, {
                                                children: (0, n.jsx)(p.G.Item, {
                                                    id: `${u}-pane-query-text-sub-item`,
                                                    children: (0, n.jsxs)("div", {
                                                        className: "PerformancePaneItem-module__PerformancePaneItemBox__AMjT5",
                                                        children: [(0, n.jsx)("span", {
                                                            className: ec,
                                                            children: S
                                                        }), (0, n.jsx)(x.T, {
                                                            tooltipProps: {
                                                                direction: "nw"
                                                            },
                                                            textToCopy: S,
                                                            ariaLabel: "Copy to clipboard",
                                                            className: (0, D.$)("px-2 pt-1", "PerformancePaneItem-module__PerformancePaneItemCopyToClipboardButton__XXful")
                                                        })]
                                                    })
                                                })
                                            })]
                                        }), (0, n.jsxs)(p.G.Item, {
                                            id: `${u}-pane-query-variable-item`,
                                            children: ["query_variables", (0, n.jsx)(p.G.SubTree, {
                                                children: b && Object.entries(b).filter(ef).map(eh)
                                            })]
                                        })]
                                    })]
                                }), y && (0, n.jsxs)(p.G.Item, {
                                    id: `${u}-pane-mysql-item`,
                                    children: [(0, n.jsxs)("div", {
                                        className: "PerformancePaneItem-module__PerformancePaneItemDetailsContainer__CsZx1",
                                        children: [(0, n.jsx)("span", {
                                            className: "PerformancePaneItem-module__PerformancePaneItemName__dspdz",
                                            children: "mysql"
                                        }), (0, n.jsxs)("span", {
                                            className: "PerformancePaneItem-module__PerformancePaneItemClusterCount__qx3m_",
                                            children: [Object.entries(A).length, " clusters"]
                                        }), (0, n.jsx)(Y, {
                                            count: R.length
                                        })]
                                    }), (0, n.jsx)(p.G.SubTree, {
                                        children: Object.entries(A).sort(e_).map(e => {
                                            let [t, a] = e;
                                            return (0, n.jsx)(en, {
                                                title: t,
                                                queries: a,
                                                nPlusOnes: N,
                                                sort: h,
                                                showFieldsPathInQueries: E
                                            }, t)
                                        })
                                    })]
                                })]
                            }), !y && (0, n.jsx)(en, {
                                title: "mysql",
                                queries: R,
                                nPlusOnes: N,
                                sort: h,
                                showFieldsPathInQueries: E
                            }), (0, n.jsx)(en, {
                                title: "elastic search",
                                queries: l,
                                nPlusOnes: [],
                                sort: h
                            }), U]
                        })
                    }
                    d[0] = y, d[1] = m, d[2] = f, d[3] = u, d[4] = S, d[5] = E, d[6] = g, d[7] = h, d[8] = _, d[9] = b, d[10] = t, d[11] = a, d[12] = r, d[13] = i, d[14] = s, d[15] = c, d[16] = u
                } else t = d[10], a = d[11], r = d[12], i = d[13], s = d[14], c = d[15], u = d[16];
                return c !== Symbol.for("react.early_return_sentinel") ? c : (d[30] !== t || d[31] !== a || d[32] !== r || d[33] !== i || d[34] !== s ? (l = (0, n.jsxs)(t, {
                    id: r,
                    children: [i, s]
                }, a), d[30] = t, d[31] = a, d[32] = r, d[33] = i, d[34] = s, d[35] = l) : l = d[35], l)
            };

        function ed(e, t) {
            return Object.keys(e).filter(a => "object" != typeof e[a] && e[a] !== t && "query_text" !== a)
        }

        function eu(e) {
            return e.filter(e => "duration_ms" !== e && "children_duration_ms" !== e)
        }

        function em(e, t, a) {
            return e.map(e => (0, n.jsx)(p.G.Item, {
                id: `${e}-${a}-pane-sub-item`,
                children: (0, n.jsxs)("span", {
                    className: ec,
                    children: [e, " ", function() {
                        let a = t[e];
                        switch (typeof a) {
                            case "number":
                                if (e.endsWith("ms")) return a.toFixed(1);
                                return a;
                            case "string":
                                {
                                    let e = et(a);
                                    if (e) return (0, n.jsxs)(A.A, {
                                        target: "_blank",
                                        href: e.remoteUrl,
                                        children: [e.relativePath, ":", e.line]
                                    });
                                    return a
                                }
                            case "object":
                                return JSON.stringify(a);
                            case "boolean":
                                return a.toString();
                            default:
                                return a
                        }
                    }()]
                })
            }, e)).filter(e => null !== e)
        }

        function ef(e) {
            let [, t] = e;
            return !!t
        }

        function eh(e, t) {
            let [a, r] = e;
            return (0, n.jsxs)(p.G.Item, {
                id: `${t}-pane-query-variable-item`,
                children: [a, ": ", r.toString()]
            }, t)
        }

        function e_(e, t) {
            let [a] = e, [r] = t;
            return a.localeCompare(r)
        }
        el.displayName = "PerformancePaneItem";
        var ep = a(147966),
            eb = a(562099),
            eg = a(164636);
        let ey = "PerformancePane-module__PerformancePaneActionMenuText__YB52t";
        var eE = a(946679),
            eS = a(726054);
        let ew = e => {
            let t, a, r, i = (0, o.c)(6),
                {
                    traces: s
                } = e;
            if (i[0] !== s) {
                let e = function(e) {
                    let t = new Set;
                    for (let a of e) {
                        let e = [];
                        for (let r of (ee(e, a), e)) r.cluster_name && t.add(r.cluster_name)
                    }
                    return Array.from(t)
                }(s);
                t = _.l, a = 0 === e.length ? (0, n.jsx)(_.l.Item, {
                    disabled: !0,
                    children: "No clusters found"
                }) : e.map(ev), i[0] = s, i[1] = t, i[2] = a
            } else t = i[1], a = i[2];
            return i[3] !== t || i[4] !== a ? (r = (0, n.jsx)(t, {
                children: a
            }), i[3] = t, i[4] = a, i[5] = r) : r = i[5], r
        };

        function ev(e, t) {
            return (0, n.jsx)(_.l.Item, {
                onSelect: () => (0, eg.M_)(e),
                children: (0, n.jsxs)("div", {
                    className: "ClustersDisabler-module__ClustersDisablerBox__sDQSi",
                    children: [(0, n.jsx)("span", {
                        className: "ClustersDisabler-module__ClustersDisablerText__kHRRv",
                        children: e
                    }), (0, eg.HX)(e) ? (0, n.jsx)(T.NoEntryIcon, {}) : (0, n.jsx)(eS.CheckIcon, {})]
                })
            }, t)
        }
        ew.displayName = "ClustersDisabler";
        let eI = () => {
            let [e, t] = (0, s.useState)(!0), [a, r] = (0, s.useState)(!1), [o, i] = (0, s.useState)(!1), [A, x] = (0, s.useState)("none"), [N, P] = (0, s.useState)(0), O = (0, eb.U)("(max-width: 767px), (max-height: 399px)"), D = (0, s.useRef)(null), j = (0, s.useRef)(null), L = (0, s.useRef)(null), k = (0, s.useRef)(!1), [M, U] = (0, s.useState)(!1), q = ep.cg;
            q[eg.BM] || (q[eg.BM] = []);
            let [B, $] = (0, s.useState)([...q[eg.BM]]), W = (0, s.useCallback)(() => {
                k.current = !0, t(!0)
            }, []);
            s.useEffect(() => {
                if (!e) {
                    if (k.current) L.current && L.current.focus();
                    else if ("true" === new URLSearchParams(window.location.search).get("staffbar")) {
                        let e = document.getElementById("enable-api-insights-button");
                        e && e.focus()
                    }
                    k.current = !1
                }
            }, [e]), q[eg.rb] = (0, s.useCallback)(() => {
                $([...q[eg.BM]])
            }, []);
            let F = (0, s.useCallback)(() => {
                    $([]), q[eg.BM] = []
                }, [q]),
                H = e => {
                    switch (e) {
                        case "duration":
                            return "by duration";
                        case "resultCount":
                            return "by count";
                        default:
                            return "by time"
                    }
                },
                V = (0, s.useMemo)(() => O ? {
                    overflow: "auto",
                    top: 10,
                    left: 10,
                    style: {
                        width: "calc(100vw - 15px)",
                        maxHeight: "calc(100vh - 20px)"
                    }
                } : {
                    width: "xlarge",
                    height: "auto",
                    top: 110,
                    left: Math.max(10, window.innerWidth - 640)
                }, [O]),
                G = (0, s.useMemo)(() => B.some(e => er(e)), [B]);
            return B ? e ? (0, n.jsx)(l.A, {
                initialFocusRef: D,
                returnFocusRef: j,
                ignoreClickRefs: [j],
                onEscape: () => t(!e),
                onClickOutside: C.l,
                role: "dialog",
                "aria-label": "API insights dialog",
                ...V,
                className: "PerformancePane-module__PerformancePaneOverlay__D6oGK",
                children: (0, n.jsxs)("div", {
                    className: "PerformancePane-module__PerformancePaneBox__Bnb9k",
                    children: [(0, n.jsxs)("div", {
                        className: "PerformancePane-module__PerformancePaneHeaderContainer__AYfvJ",
                        children: [(0, n.jsx)(b.GraphIcon, {}), (0, n.jsx)(d.A, {
                            as: "h2",
                            className: "PerformancePane-module__PerformancePaneHeading__gE1cu",
                            children: "API insights"
                        }), (0, n.jsxs)("div", {
                            className: "PerformancePane-module__PerformancePaneControlsContainer__NjYUI",
                            children: [(0, n.jsxs)(u.A, {
                                className: "PerformancePane-module__PerformancePaneFormControl__HtuEv",
                                children: [(0, n.jsx)(u.A.Label, {
                                    className: "PerformancePane-module__PerformancePaneFormControlLabel__nXoOZ",
                                    children: "Threshold"
                                }), (0, n.jsx)(m.A, {
                                    name: "threshold",
                                    size: "small",
                                    trailingVisual: "ms",
                                    placeholder: "threshold",
                                    onChange: e => {
                                        let t = parseFloat(e.target.value);
                                        P(isNaN(t) ? 0 : t)
                                    },
                                    "aria-label": "Threshold for filtering items by duration",
                                    className: "PerformancePane-module__PerformancePaneTextInput__xusCH"
                                })]
                            }), (0, n.jsx)(c.Q, {
                                size: "small",
                                onClick: () => {
                                    x(e => {
                                        let t;
                                        switch (e) {
                                            case "none":
                                                t = "duration";
                                                break;
                                            case "duration":
                                                t = "resultCount";
                                                break;
                                            case "resultCount":
                                                t = "none"
                                        }
                                        return (0, eE.i)(`Sorting ${H(t)}`, {
                                            assertive: !0
                                        }), t
                                    })
                                },
                                leadingVisual: g.SortDescIcon,
                                className: "PerformancePane-module__PerformancePaneSortButton__yEy2a",
                                children: H(A)
                            }), (0, n.jsxs)(f.W, {
                                children: [(0, n.jsx)(f.W.Anchor, {
                                    children: (0, n.jsx)(h.K, {
                                        icon: y.KebabHorizontalIcon,
                                        size: "small",
                                        "aria-label": "Open more options"
                                    })
                                }), (0, n.jsx)(f.W.Overlay, {
                                    width: "medium",
                                    children: (0, n.jsxs)(_.l, {
                                        showDividers: !0,
                                        children: [(0, n.jsxs)(_.l.LinkItem, {
                                            onClick: F,
                                            children: [(0, n.jsx)(E.TrashIcon, {}), (0, n.jsx)("span", {
                                                className: ey,
                                                children: "Clear"
                                            })]
                                        }), (0, n.jsxs)(_.l.LinkItem, {
                                            href: `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(B))}`,
                                            download: "api-traces.json",
                                            children: [(0, n.jsx)(S.DownloadIcon, {}), (0, n.jsx)("span", {
                                                className: ey,
                                                children: "Download"
                                            })]
                                        }), G && (0, n.jsxs)(_.l.LinkItem, {
                                            onClick: () => U(!M),
                                            children: [M ? (0, n.jsx)(w.EyeClosedIcon, {}) : (0, n.jsx)(v.EyeIcon, {}), (0, n.jsx)("span", {
                                                className: ey,
                                                children: M ? "Hide subscription queries" : "Show subscription queries"
                                            })]
                                        }), (0, n.jsxs)(_.l.LinkItem, {
                                            onClick: () => r(!a),
                                            children: [(0, n.jsx)(I.DatabaseIcon, {}), (0, n.jsx)("span", {
                                                className: ey,
                                                children: a ? "Ungroup MySQL queries by cluster" : "Group MySQL queries by cluster"
                                            })]
                                        }), G && (0, n.jsxs)(_.l.LinkItem, {
                                            onClick: () => i(!o),
                                            children: [(0, n.jsx)(I.DatabaseIcon, {}), (0, n.jsx)("span", {
                                                className: ey,
                                                children: o ? "Hide GraphQL fields path in queries" : "Show GraphQL fields path in queries"
                                            })]
                                        }), (0, n.jsxs)(f.W, {
                                            children: [(0, n.jsx)(f.W.Anchor, {
                                                children: (0, n.jsx)(_.l.Item, {
                                                    children: (0, n.jsxs)("div", {
                                                        className: "PerformancePane-module__PerformancePaneActionMenuItemBox__JZb4U",
                                                        children: [(0, n.jsx)(T.NoEntryIcon, {}), (0, n.jsx)("span", {
                                                            className: "PerformancePane-module__PerformancePaneActionMenuTextFlex__BNkgQ",
                                                            children: "Disable clusters"
                                                        })]
                                                    })
                                                })
                                            }), (0, n.jsx)(f.W.Overlay, {
                                                children: (0, n.jsx)(ew, {
                                                    traces: B
                                                })
                                            })]
                                        })]
                                    })
                                })]
                            }), (0, n.jsx)(h.K, {
                                size: "small",
                                onClick: () => t(!1),
                                icon: R.XIcon,
                                "aria-label": "Close",
                                tooltipDirection: "n"
                            })]
                        })]
                    }), (0, n.jsx)("div", {
                        className: "PerformancePane-module__PerformancePaneTreeContainer__o0wdP",
                        children: (0, n.jsx)("nav", {
                            "aria-label": "Files",
                            className: "PerformancePane-module__PerformancePaneTreeNav__GcKcK",
                            children: (0, n.jsx)(p.G, {
                                "aria-label": "Files",
                                children: B.map((e, t) => (0, n.jsx)(el, {
                                    name: e.query_name,
                                    variables: e.query_variables,
                                    item: e,
                                    isRoot: !0,
                                    sortType: A,
                                    threshold: N,
                                    showSubscriptionQueries: M,
                                    groupSqlByClusters: a,
                                    showFieldsPathInQueries: o,
                                    query_text: e.query_text
                                }, t))
                            })
                        })
                    })]
                })
            }) : (0, n.jsx)(c.Q, {
                ref: L,
                leadingVisual: b.GraphIcon,
                onClick: W,
                className: "PerformancePane-module__PerformancePaneButton__hmkJm",
                children: "API insights"
            }) : null
        };

        function eT() {
            let e, t = (0, o.c)(1);
            return t[0] === Symbol.for("react.memo_cache_sentinel") ? (e = (0, n.jsx)(i.t, {
                children: (0, n.jsx)(eI, {})
            }), t[0] = e) : e = t[0], e
        }
        eI.displayName = "PerformancePane", eT.displayName = "ApiInsights", (0, r.k)("internal-api-insights", {
            Component: eT
        })
    },
    248742(e, t, a) {
        a.d(t, {
            SX: () => s
        });
        var r = a(865490);

        function n(e) {
            return "[object Object]" === Object.prototype.toString.call(e)
        }
        let o = null,
            i = {
                defaultOptions: {
                    queries: {
                        refetchOnWindowFocus: !1,
                        retry: !1,
                        networkMode: "always",
                        queryKeyHashFn: function(e) {
                            return JSON.stringify(e, (e, t) => ! function(e) {
                                if (!n(e)) return !1;
                                let t = e.constructor;
                                if (void 0 === t) return !0;
                                let a = t.prototype;
                                return !!n(a) && !!a.hasOwnProperty("isPrototypeOf") && Object.getPrototypeOf(e) === Object.prototype
                            }(t) ? t instanceof URLSearchParams ? new URLSearchParams([...t.entries()].sort(([e], [t]) => e.localeCompare(t))).toString() : "bigint" == typeof t ? `$bigint:${t}` : t instanceof Set ? Array.from(t).sort() : t instanceof Map ? Array.from(t.entries()).sort(([e], [t]) => e.localeCompare(t)).reduce((e, [t, a]) => (e[t] = a, e), {}) : t : Object.keys(t).sort().reduce((e, a) => (e[a] = t[a], e), {}))
                        }
                    },
                    mutations: {
                        networkMode: "always"
                    }
                }
            };

        function s() {
            return o ? ? = new r.E({ ...i,
                ...void 0
            })
        }
    },
    843168(e, t, a) {
        let r;
        var n = a(984835),
            o = a(826099);
        let {
            getItem: i,
            setItem: s,
            removeItem: c
        } = (0, n.A)("localStorage"), l = "REACT_PROFILING_DISABLED_UNTIL";
        a.d(t, {}, {
            A: {
                enable: () => {
                    c(l), r = void 0
                },
                disable: () => {
                    s(l, String(Date.now() + 864e5)), r = !1
                },
                isEnabled: () => !("u" < typeof window) && (void 0 !== r ? r : r = (0, o.Xl)() ? function() {
                    let e = i(l);
                    if (!e) return !0;
                    let t = Number(e);
                    return !!(Number.isNaN(t) || Date.now() >= t) && (c(l), !0)
                }() : .02 > Math.random()),
                resetCache: () => {
                    r = void 0
                }
            }
        })
    },
    726882(e, t, a) {
        var r = a(77783),
            n = a(747251),
            o = a(627938),
            i = a(432231),
            s = a(372875);
        let c = {
                CACHE_HIT: "offline_cache.cache_hit",
                CACHE_MISS: "offline_cache.cache_miss",
                CACHE_EVICT: "offline_cache.cache_evict",
                CACHE_INVALID: "offline_cache.stale_structure",
                DATA_INVALID: "offline_cache.data_invalid",
                CACHE_EXPIRED: "offline_cache.expired_item",
                CACHE_SET: "offline_cache.cache_set",
                CACHE_TIMEOUT: "offline_cache.cache_timeout",
                CACHE_SESSION_DISABLED: "offline_cache.session_disabled",
                CACHE_READ_ERROR: "offline_cache.read_error",
                CACHE_EVICT_ERROR: "offline_cache.evict_error",
                CACHE_WRITE_ERROR: "offline_cache.write_error",
                CLEANUP_STARTED: "offline_cache.cleanup_started",
                CLEANUP_COMPLETED: "offline_cache.cleanup_completed",
                CLEANUP_ERROR: "offline_cache.cleanup_error",
                CLEANUP_ITEM_ERROR: "offline_cache.cleanup_item_error",
                WARMUP: "offline_cache.warmup",
                WARMUP_ERROR: "offline_cache.warmup_error",
                ENTRIES_READ: "offline_cache.entries_read",
                ANY: "offline_cache.*",
                NONE: "offline_cache.none"
            },
            l = "__offline_cache_warmup_probe__",
            d = !1;

        function u(e) {
            if (!(e instanceof Error)) return !1;
            if ("u" > typeof DOMException && e instanceof DOMException && "name" in e) {
                let t = e.name;
                return "SecurityError" === t || "UnknownError" === t || "AbortError" === t || "QuotaExceededError" === t || "NotFoundError" === t || "VersionError" === t
            }
            return !1
        }

        function m() {
            try {
                return "u" > typeof globalThis && void 0 !== globalThis.indexedDB
            } catch {
                return !1
            }
        }
        class f extends Error {
            constructor(e, t, a) {
                super(`IndexedDB ${e} operation timed out after ${a}ms for key: ${t}`), this.name = "IndexedDbTimeoutError"
            }
        }
        let h = "offline_cache::",
            _ = () => h + (0, n.cj)(),
            p = new Map,
            b = new Map;

        function g(e) {
            let t = b.get(e);
            return t || (t = {
                running: !1,
                intervalId: void 0
            }, b.set(e, t)), t
        }

        function y({
            validator: e,
            sendAnalyticsEvent: t,
            storeName: a = "queries",
            dataValidator: n
        }) {
            let h, b = n ? `data:${n.name}` : "",
                E = `${_()}:${a}:${e.Code()}:${b}`,
                S = `${_()}::${a}`,
                w = p.get(E);
            if (w) return w;

            function v(e) {
                return !!(!e || !e.state || e.state.dataUpdatedAt && e.state.ttl && Date.now() - e.state.dataUpdatedAt > e.state.ttl) || void 0 !== e.state.cacheVersion && 1 !== e.state.cacheVersion
            }
            try {
                h = (0, r.y$)(_(), a)
            } catch (e) {
                u(e) && (d = !0, t(c.CACHE_SESSION_DISABLED, "", {
                    reason: "fatal_error_on_init",
                    error_name: e.name
                }))
            }
            let I = !1;

            function T() {
                return (0, i.G7)("disable-indexdb-operations") || d
            }
            async function R(e, a, r, n) {
                let o = null,
                    i = new Promise((e, i) => {
                        o = setTimeout(() => {
                            t(c.CACHE_TIMEOUT, n, {
                                operation: r
                            }), i(new f(r, n, a))
                        }, a)
                    });
                try {
                    let t = await Promise.race([e, i]);
                    return o && clearTimeout(o), t
                } catch (e) {
                    throw o && clearTimeout(o), e
                }
            }
            async function C() {
                let e = g(S);
                if (e.running) return;
                e.running = !0;
                let a = Date.now();
                try {
                    if (t(c.CLEANUP_STARTED, "", {}), !m() || !h) return;
                    let {
                        expiredKeys: e,
                        totalEntries: n
                    } = await h("readonly", e => new Promise((a, r) => {
                        let n = [],
                            o = 0,
                            i = e.openCursor();
                        i.onsuccess = () => {
                            let e = i.result;
                            if (!e) return void a({
                                expiredKeys: n,
                                totalEntries: o
                            });
                            o++;
                            try {
                                v(e.value) && n.push(e.key)
                            } catch (a) {
                                t(c.CLEANUP_ITEM_ERROR, e.key.toString(), {
                                    error: String(a)
                                })
                            }
                            e.continue()
                        }, i.onerror = () => r(i.error)
                    }));
                    for (let a of (e.length > 0 && await (0, r.LJ)(e, h), e)) t(c.CACHE_EVICT, a.toString(), {
                        reason: "periodic_cleanup"
                    });
                    t(c.CLEANUP_COMPLETED, "", {
                        removed_count: e.length,
                        total_entries: n,
                        duration_ms: Date.now() - a
                    })
                } catch (e) {
                    try {
                        t(c.CLEANUP_ERROR, "", {
                            error: String(e)
                        })
                    } catch {}
                } finally {
                    e.running = !1
                }
            }
            let A = {
                get cleanupIntervalId() {
                    return g(S).intervalId
                },
                get isCleanupRunning() {
                    return g(S).running
                },
                async getItem(a, o) {
                    if (T() || !m()) return;
                    let l = Date.now();
                    try {
                        let d = await R((0, r.Jt)(a, h), 500, "read", a),
                            u = Date.now() - l;
                        if (!d ? .state ? .data) return void t(c.CACHE_MISS, a.toString(), { ...o,
                            read_duration_ms: u
                        });
                        if (v(d)) {
                            this.removeItem(a), t ? .("offline_cache.expired_item", a.toString(), { ...o,
                                read_duration_ms: u
                            });
                            return
                        }
                        if ((0, i.G7)("offline_cache_restore_yield") && await (0, s.a)(), !e.Check(d.state.data)) {
                            this.removeItem(a), t(c.CACHE_INVALID, a.toString(), { ...o,
                                errors: e.Errors(d.state.data),
                                read_duration_ms: u
                            });
                            return
                        }
                        if (n && !n.isValid(d.state.data)) {
                            this.removeItem(a), t(c.DATA_INVALID, a.toString(), { ...o,
                                read_duration_ms: u
                            });
                            return
                        }
                        let m = d.state.dataUpdatedAt ? Date.now() - d.state.dataUpdatedAt : "N/A",
                            f = d.state.ttl ? ? "N/A";
                        return t(c.CACHE_HIT, a.toString(), { ...o,
                            age: m,
                            ttl: f,
                            preheat_source: d.state.preheatSource,
                            read_duration_ms: u
                        }), d
                    } catch (r) {
                        let e = Date.now() - l;
                        if (r instanceof f) return void t(c.CACHE_MISS, a.toString(), { ...o,
                            read_duration_ms: e,
                            timeout: !0
                        });
                        if (u(r)) {
                            d = !0, t(c.CACHE_SESSION_DISABLED, a.toString(), {
                                reason: "fatal_error",
                                error_name: r.name,
                                read_duration_ms: e
                            }), t(c.CACHE_READ_ERROR, a.toString(), { ...o,
                                session_disabled: !0,
                                error_name: r.name,
                                read_duration_ms: e
                            });
                            return
                        }
                        throw r
                    }
                },
                async setItem(e, a, n, i, s) {
                    if (T() || !m()) return Promise.resolve();
                    let l = i ? ? a.state.ttl,
                        _ = { ...a,
                            state: { ...a.state,
                                dataUpdatedAt: n ? ? a.state.dataUpdatedAt,
                                ttl: l,
                                cacheVersion: 1
                            }
                        };
                    (0, o.D)(e, t), t(c.CACHE_SET, e.toString(), { ...s,
                        ttl: l
                    });
                    try {
                        await R((0, r.hZ)(e, _, h), 2e3, "write", e)
                    } catch (a) {
                        if (a instanceof f) return;
                        if (u(a)) {
                            d = !0, t(c.CACHE_SESSION_DISABLED, e.toString(), {
                                reason: "fatal_error",
                                error_name: a.name
                            }), t(c.CACHE_WRITE_ERROR, e.toString(), { ...s,
                                session_disabled: !0,
                                error_name: a.name
                            });
                            return
                        }
                        throw a
                    }
                },
                async removeItem(e, a) {
                    if (t(c.CACHE_EVICT, e.toString(), a), m()) return (0, r.yH)(e, h)
                },
                isBustedOrExpired: e => v(e),
                async entries() {
                    if (!m()) return [];
                    let e = Date.now(),
                        a = await (0, r.jO)(h),
                        n = Date.now() - e;
                    return t(c.ENTRIES_READ, "", {
                        duration_ms: n,
                        entry_count: a.length
                    }), a
                },
                cleanupExpiredEntries: C,
                stopPeriodicCleanup: function() {
                    let e = g(S);
                    void 0 !== e.intervalId && (clearInterval(e.intervalId), e.intervalId = void 0)
                },
                async warmup() {
                    if (I || T() || !m()) return;
                    I = !0;
                    let e = Date.now();
                    try {
                        await R((0, r.Jt)(l, h), 500, "read", l), t(c.WARMUP, "", {
                            duration_ms: Date.now() - e
                        })
                    } catch (o) {
                        let n = o instanceof f;
                        if (t(c.WARMUP_ERROR, "", {
                                error: String(o),
                                duration_ms: Date.now() - e,
                                timeout: n
                            }), u(o)) {
                            d = !0, t(c.CACHE_SESSION_DISABLED, "", {
                                reason: "fatal_error",
                                error_name: o.name
                            });
                            return
                        }
                        if (I = !1, !n) try {
                            h = (0, r.y$)(_(), a)
                        } catch {}
                    }
                }
            };
            return p.set(E, A), ! function(e = 36e5) {
                let t;
                if ("u" < typeof window) return;
                let a = g(S);
                void 0 === a.intervalId && ("function" == typeof(t = window).requestIdleCallback ? t.requestIdleCallback(() => void C(), {
                    timeout: 1e4
                }) : setTimeout(() => void C(), 1e4), a.intervalId = window.setInterval(() => void C(), e))
            }(), A
        }
        async function E() {
            if (m()) try {
                let e = await globalThis.indexedDB ? .databases ? .();
                if (!e) return;
                let t = e.filter(e => e.name ? .startsWith(h)).map(async e => {
                    if (e.name) try {
                        let t = globalThis.indexedDB.open(e.name, e.version),
                            a = await new Promise((e, a) => {
                                t.onsuccess = () => e(t.result), t.onerror = () => a(t.error), t.onupgradeneeded = () => {
                                    t.transaction ? .abort(), a(Error("Unexpected upgrade needed"))
                                }
                            }),
                            n = Array.from(a.objectStoreNames);
                        a.close();
                        let o = n.map(async t => {
                            if (e.name) try {
                                let a = (0, r.y$)(e.name, t);
                                await (0, r.IU)(a)
                            } catch (e) {
                                if (u(e)) return
                            }
                        });
                        await Promise.all(o)
                    } catch (e) {
                        if (u(e)) return
                    }
                });
                await Promise.allSettled(t)
            } catch {}
        }
        "u" > typeof window && (window.__SAFE_INDEXED_DB_CLEAR_PERSISTERS__ = () => {
            for (let e of p.values()) e && "function" == typeof e.stopPeriodicCleanup && e.stopPeriodicCleanup();
            p.clear(), b.clear(), d = !1
        }), a.d(t, {
            i5: () => y,
            mW: () => E
        }, {
            Zf: c,
            wM: {
                Check: e => "object" == typeof e && null !== e,
                Code: () => "simple-validator",
                Errors: () => []
            }
        })
    },
    627938(e, t, a) {
        let r = async (e, t) => {
            if (t && "u" > typeof navigator && navigator.storage ? .estimate) try {
                let a = await navigator.storage.estimate(),
                    r = a.quota ? ? 0,
                    n = a.usage ? ? 0;
                t("offline_cache.storage_space", e, {
                    quota_bytes: r,
                    usage_bytes: n,
                    available_bytes: r - n,
                    usage_percent: r > 0 ? n / r * 100 : 0
                })
            } catch {}
        };
        a.d(t, {}, {
            D: r
        })
    },
    984835(e, t, a) {
        var r = a(147966),
            n = a(826099);
        class o {
            getItem() {
                return null
            }
            setItem() {}
            removeItem() {}
            clear() {}
            key() {
                return null
            }
            get length() {
                return 0
            }
        }

        function i(e, t = {
            throwQuotaErrorsOnSet: !1
        }, a = r.cg, s = e => e, c = e => e) {
            let l;
            try {
                if (!a) throw Error();
                l = a[e] || new o
            } catch {
                l = new o
            }
            let {
                throwQuotaErrorsOnSet: d
            } = t;

            function u(e) {
                t.sendCacheStats && (0, n.iv)({
                    incrementKey: e
                })
            }

            function m(e) {
                try {
                    if (l.removeItem(e), t.ttl) {
                        let t = `${e}:expiry`;
                        l.removeItem(t)
                    }
                } catch {}
            }
            return {
                getItem: function(e, t = Date.now()) {
                    try {
                        let a = l.getItem(e);
                        if (!a) return null;
                        let r = `${e}:expiry`,
                            n = Number(l.getItem(r));
                        if (n && t > n) return m(e), m(r), u("SAFE_STORAGE_VALUE_EXPIRED"), null;
                        return u("SAFE_STORAGE_VALUE_WITHIN_TTL"), s(a)
                    } catch {
                        return null
                    }
                },
                setItem: function(e, a, r = Date.now()) {
                    try {
                        if (l.setItem(e, c(a)), t.ttl) {
                            let a = `${e}:expiry`,
                                n = r + t.ttl;
                            l.setItem(a, n.toString())
                        }
                    } catch (e) {
                        if (d && e instanceof Error && e.message.toLowerCase().includes("quota")) throw e
                    }
                },
                removeItem: m,
                clear: () => l.clear(),
                getKeys: function() {
                    return Object.keys(l)
                },
                get length() {
                    return l.length
                }
            }
        }

        function s(e) {
            return i(e, {
                throwQuotaErrorsOnSet: !1
            }, r.cg, JSON.parse, JSON.stringify)
        }
        a.d(t, {
            A: () => i,
            D: () => s
        })
    },
    956e3(e, t, a) {
        let {
            getItem: r,
            setItem: n,
            removeItem: o
        } = (0, a(984835).A)("sessionStorage");
        a.d(t, {}, {
            Ai: o,
            Gq: r,
            SO: n
        })
    },
    827927(e, t, a) {
        a.d(t, {
            Ou: () => c,
            X7: () => i,
            Tt: () => s
        });
        let r = "service_worker.postrequest";
        var n = a(402604);
        let o = null;
        async function i(e) {
            if (null === o) try {
                let t = navigator.serviceWorker ? .controller;
                if (!t || ! function(e) {
                        let t = new URL(e, self.location.origin).pathname.split("/").filter(Boolean);
                        if (!t[0] || !t[1] || "issues" !== t[2]) return !1;
                        if (3 === t.length) return !0;
                        if (4 === t.length) {
                            let e = t[3];
                            return void 0 !== e && /^\d+$/.test(e)
                        }
                        return !1
                    }(e)) return;
                let a = performance.now();
                o = await new Promise((o, i) => {
                    let s = new MessageChannel;

                    function c() {
                        s.port1.onmessage = null, s.port1.onmessageerror = null, s.port1.close(), s.port2.close()
                    }
                    let l = setTimeout(() => {
                        c();
                        let e = performance.now() - a;
                        (0, n.BI)(r, {
                            duration_ms: e,
                            timedOut: !0
                        }), o(null)
                    }, 500);
                    s.port1.onmessage = e => {
                        clearTimeout(l), c();
                        let t = performance.now() - a;
                        if (e.data ? .type === "CACHED_QUERIES_RESPONSE" && e.data.data) {
                            let a = e.data.data.preloadedQueries;
                            (0, n.BI)(r, {
                                duration_ms: t,
                                timedOut: !1
                            }), o(a)
                        } else(0, n.BI)(r, {
                            duration_ms: t,
                            timedOut: !1
                        }), o(null)
                    }, s.port1.onmessageerror = () => {
                        clearTimeout(l), c(), i(Error("SW message channel error"))
                    }, t.postMessage({
                        type: "GET_CACHED_QUERIES",
                        url: e
                    }, [s.port2])
                })
            } catch {
                o = null
            }
        }

        function s() {
            return o
        }

        function c() {
            o = null
        }
    },
    258804(e, t, a) {
        var r = a(175895);
        class n extends Event {
            mechanism;
            constructor(e, t) {
                super(t), this.mechanism = e
            }
        }
        class o extends n {
            constructor(e) {
                super(e, r.z.START)
            }
        }
        class i extends n {
            visitCount;
            constructor(e, t) {
                super(e, r.z.SUCCESS), this.visitCount = t
            }
        }
        class s extends n {
            error;
            constructor(e, t) {
                super(e, r.z.ERROR), this.error = t
            }
        }
        class c extends n {
            constructor(e) {
                super(e, r.z.END)
            }
        }
        class l extends Event {
            payload;
            appPayload;
            constructor(e) {
                super("soft-nav:payload"), this.payload = e.payload, this.appPayload = e.appPayload
            }
        }
        a.d(t, {
            Kq: () => s,
            RQ: () => c,
            gh: () => l,
            ni: () => i,
            sW: () => o
        })
    },
    882650(e, t, a) {
        a.d(t, {
            m: () => i
        });
        var r = a(147966);
        let n = Object.freeze({
            INITIAL: "soft-nav:external:initial",
            START: "soft-nav:external:start",
            SUCCESS: "soft-nav:external:success",
            ERROR: "soft-nav:external:error",
            RENDER: "soft-nav:external:render"
        });
        var o = a(191968);

        function i() {
            r.XC ? .addEventListener(n.INITIAL, o.k5), r.XC ? .addEventListener(n.START, e => {
                (0, o.SC)(e.detail.mechanism)
            }), r.XC ? .addEventListener(n.SUCCESS, () => (0, o.iS)()), r.XC ? .addEventListener(n.ERROR, () => (0, o.o4)()), r.XC ? .addEventListener(n.RENDER, () => (0, o.rZ)())
        }
    },
    191968(e, t, a) {
        var r = a(175895),
            n = a(258804),
            o = a(552134),
            i = a(357624);
        let s = 0;

        function c() {
            s = 0, document.dispatchEvent(new Event(r.z.INITIAL)), (0, i.xT)()
        }

        function l(e) {
            (0, i.LM)() || (document.dispatchEvent(new Event(r.z.PROGRESS_BAR.START)), document.dispatchEvent(new n.sW(e)), (0, i.Vy)(e), (0, i.ZW)(), (0, i.HK)(), (0, o.E5)())
        }

        function d(e = {}) {
            p(e) && (s += 1, document.dispatchEvent(new n.ni((0, i.di)(), s)), m(e))
        }

        function u(e = {}) {
            if (!p(e)) return;
            s = 0;
            let t = (0, i.my)() || "reload";
            document.dispatchEvent(new n.Kq((0, i.di)(), t)), _(), (0, o.Cd)(t), (0, i.xT)()
        }

        function m(e = {}) {
            if (!p(e)) return;
            let t = (0, i.di)();
            _(), document.dispatchEvent(new n.RQ(t)), (0, i.Ff)(), (0, i.JA)(t)
        }

        function f(e = {}) {
            p(e) && ((0, o.Im)(), document.dispatchEvent(new Event(r.z.RENDER)))
        }

        function h() {
            document.dispatchEvent(new Event(r.z.FRAME_UPDATE))
        }

        function _() {
            document.dispatchEvent(new Event(r.z.PROGRESS_BAR.END))
        }

        function p({
            skipIfGoingToReactApp: e,
            allowedMechanisms: t = []
        } = {}) {
            return (0, i.LM)() && (0 === t.length || t.includes((0, i.di)())) && (!e || !(0, i.gc)())
        }
        a.d(t, {
            Bu: () => h,
            SC: () => l,
            Ti: () => m,
            iS: () => d,
            k5: () => c,
            o4: () => u,
            rZ: () => f
        })
    },
    175895(e, t, a) {
        let r = Object.freeze({
            INITIAL: "soft-nav:initial",
            START: "soft-nav:start",
            REPLACE_MECHANISM: "soft-nav:replace-mechanism",
            SUCCESS: "soft-nav:success",
            ERROR: "soft-nav:error",
            FRAME_UPDATE: "soft-nav:frame-update",
            END: "soft-nav:end",
            RENDER: "soft-nav:render",
            REACT_DONE: "soft-nav:react-done",
            PROGRESS_BAR: {
                START: "soft-nav:progress-bar:start",
                END: "soft-nav:progress-bar:end"
            }
        });
        a.d(t, {}, {
            z: r
        })
    },
    552134(e, t, a) {
        var r = a(826099),
            n = a(357624),
            o = a(115927);
        let i = "stats:soft-nav-duration",
            s = {
                react: "REACT",
                "turbo.frame": "FRAME",
                "turbo.error": "TURBO.ERROR",
                ui: "UI",
                hard: "HARD",
                unknown: "UNKNOWN"
            };

        function c() {
            window.performance.clearResourceTimings(), window.performance.mark(i)
        }

        function l(e) {
            (0, r.iv)({
                turboFailureReason: e,
                turboStartUrl: (0, n.dR)(),
                turboEndUrl: window.location.href
            })
        }

        function d() {
            let e = function() {
                if (0 === performance.getEntriesByName(i).length) return null;
                performance.measure(i, {
                    start: i,
                    detail: {
                        devtools: {
                            dataType: "track-entry",
                            track: "Navigation",
                            trackGroup: "Performance Timeline",
                            color: "secondary",
                            tooltipText: "Soft nav duration"
                        }
                    }
                });
                let e = performance.getEntriesByName(i).pop();
                return e ? e.duration : null
            }();
            if (!e) return;
            let t = s[(0, n.di)()],
                a = Math.round(e);
            t === s.react && document.dispatchEvent(new CustomEvent("staffbar-update", {
                detail: {
                    duration: a
                }
            })), (0, r.iv)({
                requestUrl: window.location.href,
                referredRequestUrl: (0, n.dR)(),
                softNavigationTiming: {
                    mechanism: t,
                    destination: (0, o.f)() || "rails",
                    duration: a,
                    initiator: (0, n.Pv)() || "rails"
                }
            })
        }
        a.d(t, {
            Cd: () => l,
            E5: () => c,
            Im: () => d
        }, {
            nW: s
        })
    },
    357624(e, t, a) {
        var r = a(956e3),
            n = a(147966),
            o = a(115927);
        let i = "soft-nav:fail",
            s = "soft-nav:fail-overhead",
            c = "soft-nav:fail-referrer",
            l = "soft-nav:referrer",
            d = "soft-nav:marker",
            u = "soft-nav:react-app-name",
            m = "soft-nav:latest-mechanism";

        function f() {
            (0, r.SO)(d, "0"), (0, r.Ai)(l), (0, r.Ai)(i), (0, r.Ai)(s), (0, r.Ai)(c), (0, r.Ai)(u), (0, r.Ai)(m)
        }

        function h(e) {
            (0, r.SO)(d, e)
        }

        function _() {
            (0, r.SO)(d, "0")
        }

        function p() {
            let e = (0, r.Gq)(d);
            return e && "0" !== e
        }

        function b() {
            return (0, r.Gq)(d)
        }

        function g() {
            return !!y()
        }

        function y() {
            return (0, r.Gq)(i)
        }

        function E(e) {
            (0, r.SO)(s, e.toString())
        }

        function S() {
            let e = (0, r.Gq)(s);
            return e ? ((0, r.Ai)(s), parseInt(e, 10)) : null
        }

        function w(e) {
            (0, r.SO)(i, e || "reload"), (0, r.SO)(c, window.location.href)
        }

        function v() {
            (0, r.SO)(l, window.location.href)
        }

        function I() {
            return (0, r.Gq)(l) || document.referrer
        }

        function T() {
            let e = (0, o.f)();
            e ? (0, r.SO)(u, e) : (0, r.Ai)(u)
        }

        function R() {
            return (0, r.Gq)(u)
        }

        function C() {
            return !!n.XC ? .querySelector("react-app") ? .getAttribute("app-name") || !!n.XC ? .querySelector("projects-v2")
        }

        function A(e) {
            (0, r.SO)(m, e)
        }
        a.d(t, {
            Ff: () => _,
            HK: () => v,
            JA: () => A,
            LM: () => p,
            Pv: () => R,
            Vy: () => h,
            ZW: () => T,
            _W: () => S,
            cT: () => E,
            dR: () => I,
            di: () => b,
            gc: () => C,
            k9: () => w,
            my: () => y,
            wG: () => g,
            xT: () => f
        })
    },
    482576(e, t, a) {
        let r = "font-weight: bold; font-size: 12px;";

        function n(e) {
            if (null == e) return "\u2014";
            let t = Math.round(e);
            return t < 1e3 ? `${t}ms` : `${(t/1e3).toFixed(2)}s`
        }

        function o(e) {
            var t;
            let {
                category: a,
                summary: o
            } = (t = e, t.webVitalTimings ? .length ? {
                category: "webVitalTimings",
                summary: ""
            } : t.navigationTimings ? .length ? {
                category: "navigationTimings",
                summary: ""
            } : t.resourceTimings ? .length ? {
                category: `resourceTimings (${t.resourceTimings.length})`,
                summary: ""
            } : t.longAnimationFrames ? .length ? {
                category: "longAnimationFrames",
                summary: ""
            } : t.longTasks ? .length ? {
                category: "longTasks",
                summary: ""
            } : t.customMetric ? {
                category: `customMetric:${t.customMetric.name}`,
                summary: String(Math.round(t.customMetric.value))
            } : t.incrementKey ? {
                category: `increment:${t.incrementKey}`,
                summary: ""
            } : t.distributionKey ? {
                category: `distribution:${t.distributionKey}`,
                summary: void 0 !== t.distributionValue ? String(Math.round(t.distributionValue)) : ""
            } : {
                category: "stat",
                summary: ""
            });
            if (console.groupCollapsed(`%cstat%c ${a}${o?` ${o}`:""}`, "background: #1f6feb; color: #fff; padding: 2px 6px; border-radius: 3px; font-weight: bold; font-size: 11px;", r), e.webVitalTimings ? .length)
                for (let t of e.webVitalTimings) {
                    let a = void 0 !== t.lcp ? "LCP" : void 0 !== t.fcp ? "FCP" : void 0 !== t.ttfb ? "TTFB" : void 0 !== t.cls ? "CLS" : void 0 !== t.inp ? "INP" : void 0 !== t.hpc ? "HPC" : void 0 !== t.elementtiming ? "ElementTiming" : "Unknown",
                        o = t.lcp ? ? t.fcp ? ? t.ttfb ? ? t.cls ? ? t.inp ? ? t.hpc ? ? t.elementtiming ? ? 0;
                    console.log(`%c${a}: %c${n(o)}`, r, o < 200 ? "color: #3fb950; font-weight: bold; font-size: 12px;" : o < 1e3 ? "color: #d29922; font-weight: bold; font-size: 12px;" : "color: #f85149; font-weight: bold; font-size: 12px;"), console.table({
                        Name: {
                            value: t.name ? ? "\u2014"
                        },
                        CPU: {
                            value: t.cpu ? ? "\u2014"
                        },
                        SSR: {
                            value: t.ssr ? ? "\u2014"
                        },
                        App: {
                            value: t.app ? ? e.app ? ? "\u2014"
                        },
                        Soft: {
                            value: void 0 !== t.soft ? String(t.soft) : "\u2014"
                        },
                        Mechanism: {
                            value: t.mechanism ? ? "\u2014"
                        },
                        "DOM Nodes": {
                            value: t.domNodes ? ? "\u2014"
                        },
                        Synthetic: {
                            value: t.synthetic ? "yes" : "no"
                        },
                        ...t.inpInteractionType ? {
                            "INP Interaction": {
                                value: t.inpInteractionType
                            },
                            "INP Event": {
                                value: t.inpEventType ? ? "\u2014"
                            },
                            "INP Bottleneck": {
                                value: t.inpBottleneck ? ? "\u2014"
                            }
                        } : {},
                        ...t.lcpBreakdown ? {
                            "LCP TTFB": {
                                value: n(t.lcpBreakdown.ttfb)
                            },
                            "LCP FCP": {
                                value: n(t.lcpBreakdown.fcp)
                            },
                            "LCP Element Render Delay": {
                                value: n(t.lcpBreakdown.elementRenderDelay)
                            }
                        } : {}
                    })
                }
            e.navigationTimings ? .length && console.table(e.navigationTimings.map(e => ({
                Name: e.name,
                Duration: n(e.duration),
                "DOM Interactive": n(e.domInteractive),
                "DOM Complete": n(e.domComplete),
                "Load Event": n(e.loadEventEnd),
                Type: e.type ? ? "\u2014"
            }))), e.resourceTimings ? .length && console.table(e.resourceTimings.map(e => ({
                Name: e.name,
                Duration: n(e.duration),
                Type: e.initiatorType ? ? "\u2014",
                Size: e.transferSize ? ? "\u2014"
            }))), e.longAnimationFrames ? .length && console.table(e.longAnimationFrames.map(e => ({
                Name: e.name,
                Duration: n(e.duration),
                "Blocking Duration": n(e.blockingDuration)
            }))), e.longTasks ? .length && console.table(e.longTasks.map(e => ({
                Name: e.name,
                Duration: n(e.duration)
            }))), e.customMetric && console.table({
                Name: {
                    value: e.customMetric.name
                },
                Value: {
                    value: e.customMetric.value
                },
                Type: {
                    value: e.customMetric.type ? ? "\u2014"
                },
                ...e.customMetric.tags ? Object.fromEntries(Object.entries(e.customMetric.tags).map(([e, t]) => [e, {
                    value: t
                }])) : {}
            }), e.incrementKey && console.table({
                Key: {
                    value: e.incrementKey
                },
                ...e.incrementTags ? Object.fromEntries(Object.entries(e.incrementTags).map(([e, t]) => [e, {
                    value: t
                }])) : {}
            }), e.distributionKey && console.table({
                Key: {
                    value: e.distributionKey
                },
                Value: {
                    value: e.distributionValue ? ? "\u2014"
                },
                ...e.distributionTags ? Object.fromEntries(e.distributionTags.map(e => [e, {
                    value: e
                }])) : {}
            }), console.groupEnd()
        }
        a.d(t, {
            c: () => o
        })
    },
    631729(e, t, a) {
        a.d(t, {}, {
            D: {
                PRS_COMMENT_BOX_INP: {
                    name: "pull_requests.comment_box.inp",
                    hash: "070a85f091c124d118031ed374badf58df0cd9c2902f9aa4f9e09f6fdcbb91d0",
                    type: "distribution"
                },
                PULL_REQUESTS_FILES_JS_HEAP: {
                    name: "pull_requests.files.js_heap",
                    hash: "7c5d986de8ccbfd17ae58e0da85158912cf65aeb256aecf28c35ddeb794cd2d3",
                    type: "distribution"
                },
                PRS_ADD_COMMENT_BUTTON_CLICK: {
                    name: "pull_requests.add_comment_button.inp",
                    hash: "872209fcee2ac679a3222260dbc7eb24c73ec3d6b41e635aaf761e61a5c26ccf",
                    type: "distribution"
                },
                PULL_REQUESTS_FILE_TREE_DIFF_FILE_CLICK: {
                    name: "pull_requests.file_tree_diff_file_click.inp",
                    hash: "876809d762329dac08e4e44288005e102b33e6adebbc46e6f0a115bba2b8aa5e",
                    type: "distribution"
                },
                PULL_REQUESTS_FILE_TREE_DIFF_FILE_KEYBOARD_SELECTION: {
                    name: "pull_requests.file_tree_diff_file_keyboard_selection.inp",
                    hash: "24f3088df0d2fcde21ee1c271b6c3d10a9e819afc581e7740bc6c79a3bec925a",
                    type: "distribution"
                },
                PULL_REQUESTS_DIFF_LINE_NUMBER_CLICK: {
                    name: "pull_requests.diff_line_number_click.inp",
                    hash: "df84c70a71715d434bc8784f6f9f6d53c94ed0ab9e4992aa8d4fed0f94b64ec3",
                    type: "distribution"
                },
                BROWSER_MEMORY_DIST_HEAP_USED: {
                    name: "browser.memory.dist.heap_used",
                    hash: "fdb6e6ee4c8789822429ad902990d5750938634f17838370c79e1abd14875d86",
                    type: "distribution"
                },
                BROWSER_MEMORY_DIST_HEAP_UTILIZATION: {
                    name: "browser.memory.dist.heap_utilization",
                    hash: "962a4cd9cec8fd04bfe4c49e90f70725e6c3c8cbe2c23f7c96be44d9e99fe090",
                    type: "distribution"
                },
                BROWSER_MEMORY_DIST_SESSION_GROWTH: {
                    name: "browser.memory.dist.session_growth",
                    hash: "bcc4dcdd2464d0a48e1478928740dfb341ca58d509cdd87d6405e97db3518988",
                    type: "distribution"
                },
                BROWSER_MEMORY_DIST_SESSION_MAX: {
                    name: "browser.memory.dist.session_max",
                    hash: "c61522ce6a8197750684b38d43bd495f8c8208ff945f274743711f47f577079a",
                    type: "distribution"
                },
                BROWSER_REACT_PROFILER_APP_ACTUAL_DURATION: {
                    name: "browser.react.profiler.app.actual_duration",
                    hash: "0c82ee3933bf3b484f6aaa3e9ff4b53c7281e23747d3aa23d1c2967073dc989a",
                    type: "distribution"
                },
                BROWSER_REACT_PROFILER_APP_BASE_DURATION: {
                    name: "browser.react.profiler.app.base_duration",
                    hash: "71c768070b707947eebff7086f64b92d0a07dc4149e7d4e05a0641c4dad6bb63",
                    type: "distribution"
                },
                BROWSER_REACT_PROFILER_APP_COMMIT_LAG: {
                    name: "browser.react.profiler.app.commit_lag",
                    hash: "1640ce88b596f4bd472a0920aab28fc3a19fa159ce73e24d85749412068c8057",
                    type: "distribution"
                },
                BROWSER_REACT_PROFILER_ROUTE_ACTUAL_DURATION: {
                    name: "browser.react.profiler.route.actual_duration",
                    hash: "20a2fd38da8dc5afa74167e694d394c91fbed208c2cf002872f11550cd35fbab",
                    type: "distribution"
                },
                BROWSER_REACT_PROFILER_ROUTE_BASE_DURATION: {
                    name: "browser.react.profiler.route.base_duration",
                    hash: "1a0cc657855391adcd36b98829d0c83991b8eef57c93564bf9bf1a1ee0f7036c",
                    type: "distribution"
                },
                BROWSER_REACT_PROFILER_ROUTE_COMMIT_LAG: {
                    name: "browser.react.profiler.route.commit_lag",
                    hash: "1bb160294f50714704b572b8cf928a2401845250032d0983d7938278f382737f",
                    type: "distribution"
                },
                BROWSER_REACT_HYDRATION_DURATION: {
                    name: "browser.react.hydration.duration",
                    hash: "82c79908e1a129f357f84b61e17741c540b1b31979f0162318250ef2449646fe",
                    type: "distribution"
                },
                BROWSER_REACT_PROFILER_ROUTE_RENDER_EFFICIENCY: {
                    name: "browser.react.profiler.route.render_efficiency",
                    hash: "beef377799cdd79641899e0a78b2c5002494e02ebe125eb0c0d3920eb8623a1e",
                    type: "distribution"
                },
                BROWSER_REACT_PROFILER_APP_RENDER_EFFICIENCY: {
                    name: "browser.react.profiler.app.render_efficiency",
                    hash: "b22af24d9571ad02d8dc59c8778fee9505bcd909d5558dd5243521d2b4796a1d",
                    type: "distribution"
                },
                IPM_COMPONENT_RENDER: {
                    name: "in_product_messaging.component.render",
                    hash: "14324adfc1e3ee32f28ab57e9ecb7a204e399c0af45063425ee48e9b37ed1604",
                    type: "distribution"
                },
                IPM_COMPONENT_ERROR: {
                    name: "in_product_messaging.component.error",
                    hash: "dcac1e118c5564253075fd0663b0c3888dcc5bc71bf7ae3afa78b3f084ef543b",
                    type: "count"
                },
                IPM_COMPONENT_VISIBLE: {
                    name: "in_product_messaging.component.visible",
                    hash: "5d564d7f63a19c5bafadda2aaf50d43b44067f60e8b102263bb1fe94055ef57a",
                    type: "count"
                },
                IPM_COMPONENT_DISMISS: {
                    name: "in_product_messaging.component.dismiss",
                    hash: "94f9dd376d2ad75067112f7eac3f5d1f4d46e266e3b2c4d87067ae34ac400c3f",
                    type: "count"
                },
                IPM_ACTION: {
                    name: "in_product_messaging.action",
                    hash: "7a37c5cc6393ba5324b57b62b625a7ab8f85ce70cf53d211deabec3629d2c04a",
                    type: "count"
                },
                BROWSER_VITALS_DIST_INP_INPUT_DELAY: {
                    name: "browser.vitals.dist.inp.input_delay",
                    hash: "f8b3556c61cefdd20a76119f6d07eda34630fe54e3ba3f39606ace136d7e375e",
                    type: "distribution"
                },
                BROWSER_VITALS_DIST_INP_PROCESSING: {
                    name: "browser.vitals.dist.inp.processing",
                    hash: "99440bcc187f689ff36aa9ec2e217ad70ee254143b467f4d156c241102d26b28",
                    type: "distribution"
                },
                BROWSER_VITALS_DIST_INP_PRESENTATION: {
                    name: "browser.vitals.dist.inp.presentation",
                    hash: "5cae05a9e69973623a8cfd82f64689b017be8c1d04c9bf873960767c246f1247",
                    type: "distribution"
                },
                ISSUES_SHOW_HPC: {
                    name: "issues.show.hpc",
                    hash: "c759e7a27c38442130f055911b544bce97789db5b8b390f57d35386f6f234b7f",
                    type: "distribution"
                },
                BROWSER_VITALS_SUPPRESSED: {
                    name: "browser.vitals.suppressed",
                    hash: "537aa3499772d75ec67b59e3e5a6065af1212ecfe594c522939d0fa02147fb1b",
                    type: "count"
                },
                BROWSER_VITALS_SESSION: {
                    name: "browser.vitals.session",
                    hash: "467ac7d28cdbf4c8a7c33ccc8dd1986b474115bb57db3f0504b490d3e30455e3",
                    type: "count"
                },
                LANDING_PAGES_VITALS_HPC: {
                    name: "landing_pages.vitals.hpc",
                    hash: "104639e052e30bca541c4acbc2374b70c80ab5de8571a20254a0f61e04180f11",
                    type: "distribution"
                },
                LANDING_PAGES_VITALS_CLS: {
                    name: "landing_pages.vitals.cls",
                    hash: "ee1b16995cee9f07c6cc0e26d6408cea02baface4b562d934394311ac22559cd",
                    type: "distribution"
                },
                LANDING_PAGES_VITALS_LCP: {
                    name: "landing_pages.vitals.lcp",
                    hash: "24f158c0b36f58a0edcb60eab9b0477f3b635f67bd5202e65e80bb17982a8b00",
                    type: "distribution"
                },
                LANDING_PAGES_VITALS_INP: {
                    name: "landing_pages.vitals.inp",
                    hash: "203b2f53cf07984b95d893c21fb643bff3e494eeec63360d9d4189340e7c5fd6",
                    type: "distribution"
                },
                TURBO_ERROR_RESPONSE_NOT_HTML: {
                    name: "turbo.error.response.not_html",
                    hash: "f1b17addcb274c9155f3bb858bfbc8a43e80f718ed0df653e355d0d57c188517",
                    type: "increment"
                },
                CODE_VIEW_REPO_OVERVIEW_HPC: {
                    name: "code-view.repo-overview.hpc",
                    hash: "cd3bc78d2aece4879ae103bd22362fd031ea7144e2658d3a5bc7f475819dfdea",
                    type: "distribution"
                },
                CODE_VIEW_TREE_HPC: {
                    name: "code-view.tree.hpc",
                    hash: "f22a7626ef638ad3492f13c84a79ae4fe199006ca0729b4d189e25a78c67b0f2",
                    type: "distribution"
                },
                CODE_VIEW_TREE_INP: {
                    name: "code_view.tree.inp",
                    hash: "bcb586ccdc889f22fa01ec8b6090373b03b39f1bea96a17f6684c6df573d3ebb",
                    type: "distribution"
                },
                CODE_VIEW_REPO_OVERVIEW_INP: {
                    name: "code_view.repo_overview.inp",
                    hash: "677d3d81e569656264d5e628a09d0217bbc7652befb675bd11bbaf64e340e2c2",
                    type: "distribution"
                },
                BROWSER_VITALS_COUNT_RAGE_CLICK: {
                    name: "browser.vitals.count.rage_click",
                    hash: "6ff467b20e178da44592fcb783e3840254df979c1f37ea6020ec85e50cecd76e",
                    type: "count"
                },
                BROWSER_VITALS_COUNT_DEAD_CLICK: {
                    name: "browser.vitals.count.dead_click",
                    hash: "831d247836ee640be6cae794e527741c02fed8ac0eb70ce358e9d83a4cf73774",
                    type: "count"
                },
                BROWSER_VITALS_COUNT_ERROR_CLICK: {
                    name: "browser.vitals.count.error_click",
                    hash: "d3eaba67324c0c92c2665a3de5f7932c5d2a64d8e0e6a09259bac8518bfd4c1e",
                    type: "count"
                },
                BROWSER_VITALS_DIST_TYPING_AVG_INPUT_DELAY: {
                    name: "browser.vitals.dist.typing.avg_input_delay",
                    hash: "324ec3b8bbe07371113cfe81f76e79c94d13bba651c3e6f0e6f01445d040411d",
                    type: "distribution"
                },
                BROWSER_VITALS_DIST_TYPING_MAX_INPUT_DELAY: {
                    name: "browser.vitals.dist.typing.max_input_delay",
                    hash: "197e0245622487316d8958889da4666fb3c4b10a86aa7240c6aa902f12766d51",
                    type: "distribution"
                },
                BROWSER_VITALS_DIST_TYPING_TOTAL_INPUT_DELAY: {
                    name: "browser.vitals.dist.typing.total_input_delay",
                    hash: "37451a318e75d9a7d87bc0da6a0691a6313b67c74c98216a4d9faa4fb2c42ab3",
                    type: "distribution"
                },
                BROWSER_VITALS_ICV: {
                    name: "browser.vitals.icv",
                    hash: "1cc9ea5c3ce983ede65ce4ed243fef0dd4da584bc8058eb0ea8912e3c74e47cf",
                    type: "distribution"
                },
                COPILOT_DOTCOM_CHAT_FIRST_MESSAGE_SENT: {
                    name: "copilot.dotcom_chat.first_message_sent",
                    hash: "38290751a89248e85e91b29b3917953b9cd55c23f3fab0fa04c5f9bd4191bbf0",
                    type: "count"
                },
                COPILOT_DOTCOM_CHAT_FIRST_MESSAGE_RENDERED: {
                    name: "copilot.dotcom_chat.first_message_rendered",
                    hash: "bc8fb91e82598ab9d25e085b42656ed707a55358acd8343ceb3644ac2e4695d2",
                    type: "count"
                },
                REACT_PRELOAD_COUNT: {
                    name: "react.preload.count",
                    hash: "4cd2f305d3c94858b4d223e07af6dd231e0243dc3e87ae73648bde7432c6c135",
                    type: "increment"
                },
                REACT_PRELOAD_HIT: {
                    name: "react.preload.hit",
                    hash: "0e448d78ce4a410f9e4a7764cfde6f92b77bb6b2daf63b34985bfb1c172e61f0",
                    type: "increment"
                },
                REACT_PRELOAD_REJECTED: {
                    name: "react.preload.rejected",
                    hash: "48ca6b39df849f115dd6d594c408e5fe5ce6bce19bb046a48c1aa383149eff47",
                    type: "increment"
                },
                REACT_PRELOAD_FETCH_STATUS: {
                    name: "react.preload.fetch_status",
                    hash: "0f7769005c3c0e29bc4b679861ef3193589eab50296ced09f1dc38084d4595b0",
                    type: "increment"
                },
                REACT_PRELOAD_LATENCY: {
                    name: "react.preload.latency",
                    hash: "7b6a976e61923df7ef9c224b8166f58c192f0cadb98a4a689cd56803d49a0f44",
                    type: "distribution"
                },
                REACT_QUERY_SCHEMA_ERROR: {
                    name: "react.query.schema.error",
                    hash: "35d4179ab65c74a2457b6521f221d698412b2f9bc6a492f86c6441598dc962bb",
                    type: "increment"
                },
                REACT_QUERY_SCHEMA_PARSE_TIME: {
                    name: "react.query.schema.parse_time",
                    hash: "0b2d148037181cd696a784033d3d6e57c394b4b596b9016353d26c7e18a60257",
                    type: "distribution"
                },
                BROWSER_VITALS_DIST_CONTAINER_TIMING: {
                    name: "browser.vitals.dist.container_timing",
                    hash: "569626966eec3dfd0b04e104038457efee97febeb0cd338d227968a6cbb51ccf",
                    type: "distribution"
                },
                BROWSER_VITALS_CONTAINER_TIMING_SUPPORTED: {
                    name: "browser.vitals.container_timing.supported",
                    hash: "b9d86827d961ec19fcd37142b0fbdf491f72e3e37155b98bca65e623fe923312",
                    type: "count"
                },
                REACT_QUERY_TIME: {
                    name: "react.query.time",
                    hash: "c8b14de5d2da6c80953895af539b6f0c8d43149ccfdf1e30ee47e9eb851def5f",
                    type: "distribution"
                },
                TRUSTED_TYPES_POLICY_CALLED: {
                    name: "trusted_types.policy.called",
                    hash: "390cf02e0febd4a163b4682b85ceaa0f870c5e8efc6cada07ffbd72e6841278d",
                    type: "increment"
                },
                TRUSTED_TYPES_POLICY_ERROR: {
                    name: "trusted_types.policy.error",
                    hash: "807c3dfa83eec0676d7ff0d8f4bc8929d9eadf660afeb6d72321f41480c5ae97",
                    type: "increment"
                },
                TRUSTED_TYPES_POLICY_INITIALIZED_TWICE: {
                    name: "trusted_types.policy.initialized_twice",
                    hash: "76c378aa8ac484eea97e2f10edb8a5ebba065c679576cb69f43df1e58d039455",
                    type: "increment"
                },
                BROWSER_TURBO_ERROR: {
                    name: "browser.turbo.error",
                    hash: "886addcf546c8e1f1cda17a3bef50d60e80eeee32dc7d315a05f2c44466f067a",
                    type: "increment"
                },
                BROWSER_TURBO_ERROR_MISMATCH: {
                    name: "browser.turbo.error.mismatch",
                    hash: "8b224cd808936325bd88c93dc1fc1fe4a9ee6586b19679ea3ecd5f8b1a4abf65",
                    type: "increment"
                },
                BROWSER_TURBO_ERROR_OVERHEAD: {
                    name: "browser.turbo.error.overhead",
                    hash: "b3c1b0ec7d0372ab529ce4fc3a8884abb5eea5a8854e089544426b06744a635f",
                    type: "distribution"
                },
                ACTIONS_COMPLETED_LOG_TIME_TO_FIRST_CONTENT: {
                    name: "actions.completed_log.time_to_first_content",
                    hash: "07558401e46877b8d3daee29e1e737b657a71978f9010944c9d17c8a50a06253",
                    type: "timing"
                },
                ACTIONS_COMPLETED_LOG_RENDER_DURATION: {
                    name: "actions.completed_log.render_duration",
                    hash: "93396102c2724daea9ae47528761ca7934d1a586d72a28f098c46d52ab91ddf7",
                    type: "timing"
                },
                ACTIONS_COMPLETED_LOG_FLUSH_COUNT: {
                    name: "actions.completed_log.flush_count",
                    hash: "554a23236d9258143a37f1e368c872c5351fed1d6ee0e0b0ce9c404615ecad8c",
                    type: "distribution"
                },
                ACTIONS_COMPLETED_LOG_SIZE_BYTES: {
                    name: "actions.completed_log.size_bytes",
                    hash: "c748ad64a25023da2a3d5f3c46d40b9520a76453b6d4df3058c29867b4d69218",
                    type: "distribution"
                }
            }
        })
    },
    826099(e, t, a) {
        let r, n;
        var o = a(508995),
            i = a(147966),
            s = a(804535);
        a(182367);
        var c = a(432231),
            l = a(179836),
            d = a(12303),
            u = a(747251),
            m = a(570170),
            f = a(631729),
            h = a(175895),
            _ = a(115927),
            p = a(482576);

        function b() {
            return void 0 === r && (r = !!(0, c.G7)("suppress_automated_browser_vitals") && (0, d.H)()), r
        }

        function g() {
            return void 0 === n && (n = !!(0, l.L)() || !b() && (x() || .5 > Math.random())), n
        }
        let y = [];

        function E(e) {
            return e || (0, _.f)() || "rails"
        }
        let S = E(),
            w = (0, o.g5)();

        function v(e, t) {
            S = E(e), w = t ? ? (0, o.g5)()
        }

        function I({
            name: e,
            value: t,
            tags: a,
            requestUrl: r
        }, n, o) {
            T({
                requestUrl: r,
                customMetric: { ...f.D[e],
                    value: t,
                    tags: a
                },
                ui: !1
            }, n, o)
        }

        function T(e, t = !1, a) {
            if (o.X3 || !0 === (0, c.G7)("browser_stats_disabled")) return;
            let r = a ? ? +!!g();
            if (r < 0 || r > 1) throw RangeError("Sampling probability must be between 0 and 1");
            void 0 === e.timestamp && (e.timestamp = Date.now()), e.loggedIn = (0, u.M3)(), e.staff = x(), e.bundler = "rspack", e.ui = !1, e.app = S, e.ssr = String(w), i.XC ? .head ? .querySelector('meta[name="ui-pass-through"]') ? .content === "true" && (e.passThrough = !0),
                function() {
                    try {
                        return globalThis.localStorage ? .getItem("stats-dev-logger") === "true"
                    } catch {
                        return !1
                    }
                }() && (0, p.c)(e), Math.random() < r && y.push(e), t ? A() : C()
        }
        i.XC ? .addEventListener(h.z.RENDER, () => {
            S = E(), w = (0, o.g5)()
        });
        let R = null,
            C = (0, m.n)(async function() {
                await s.K, null == R && (R = window.requestIdleCallback(A))
            }, 5e3);

        function A() {
            if (R = null, !y.length) return;
            let e = i.XC ? .head ? .querySelector('meta[name="browser-stats-url"]') ? .content;
            if (e) {
                for (let r of function(e) {
                        let t = [],
                            a = e.map(e => JSON.stringify(e));
                        for (; a.length > 0;) t.push(function(e) {
                            let t = e.shift(),
                                a = [t],
                                r = t.length;
                            for (; e.length > 0 && r <= 65536;) {
                                let t = e[0].length;
                                if (r + t <= 65536) {
                                    let n = e.shift();
                                    a.push(n), r += t
                                } else break
                            }
                            return a
                        }(a));
                        return t
                    }(y)) {
                    var t = e,
                        a = `{"stats": [${r.join(",")}], "target": "${i.XC?.head?.querySelector('meta[name="ui-target"]')?.content||"full"}"}`;
                    try {
                        navigator.sendBeacon && navigator.sendBeacon(t, a)
                    } catch {}
                }
                y = []
            }
        }

        function x() {
            return !!i.XC ? .head ? .querySelector('meta[name="user-staff"]') ? .content
        }
        i.XC ? .addEventListener("pagehide", A), i.XC ? .addEventListener("visibilitychange", A), a.d(t, {
            Tq: () => b,
            UR: () => v,
            Xl: () => x,
            au: () => I,
            iv: () => T,
            sV: () => g
        })
    },
    180180(e, t, a) {
        var r = a(474848),
            n = a(916522),
            o = a(252870),
            i = a(296540),
            s = a(991853);
        let c = (0, i.createContext)({
            addToast: s.l,
            addPersistedToast: s.l,
            clearPersistedToast: s.l
        });
        c.displayName = "ToastContext";
        let l = (0, i.createContext)({
            toasts: [],
            persistedToast: null
        });

        function d(e) {
            let t, a, s, d, m, f, h, _, p = (0, n.c)(16),
                {
                    children: b
                } = e;
            p[0] === Symbol.for("react.memo_cache_sentinel") ? (t = [], p[0] = t) : t = p[0];
            let [g, y] = (0, i.useState)(t), [E, S] = (0, i.useState)(null), {
                safeSetTimeout: w
            } = (0, o.A)();
            p[1] !== w ? (a = function(e) {
                y(t => [...t, e]), w(() => y(u), 5e3)
            }, p[1] = w, p[2] = a) : a = p[2];
            let v = a;
            p[3] === Symbol.for("react.memo_cache_sentinel") ? (s = function(e) {
                S(e)
            }, p[3] = s) : s = p[3];
            let I = s;
            p[4] === Symbol.for("react.memo_cache_sentinel") ? (d = function() {
                S(null)
            }, p[4] = d) : d = p[4];
            let T = d;
            p[5] !== v ? (m = {
                addToast: v,
                addPersistedToast: I,
                clearPersistedToast: T
            }, p[5] = v, p[6] = m) : m = p[6];
            let R = m;
            p[7] !== E || p[8] !== g ? (f = {
                toasts: g,
                persistedToast: E
            }, p[7] = E, p[8] = g, p[9] = f) : f = p[9];
            let C = f;
            return p[10] !== b || p[11] !== C ? (h = (0, r.jsx)(l, {
                value: C,
                children: b
            }), p[10] = b, p[11] = C, p[12] = h) : h = p[12], p[13] !== R || p[14] !== h ? (_ = (0, r.jsx)(c, {
                value: R,
                children: h
            }), p[13] = R, p[14] = h, p[15] = _) : _ = p[15], _
        }

        function u(e) {
            return e.slice(1)
        }

        function m() {
            return (0, i.use)(c)
        }
        l.displayName = "InternalToastsContext", d.displayName = "ToastContextProvider", a.d(t, {
            Y6: () => m,
            k6: () => d
        }, {
            T8: l
        })
    },
    837866(e, t, a) {
        a.d(t, {
            V: () => _
        });
        var r = a(474848),
            n = a(916522),
            o = a(296540),
            i = a(180180),
            s = a(655828),
            c = a(726054),
            l = a(248720),
            d = a(252870),
            u = a(518082);
        let m = {
                info: "",
                success: "Toast--success",
                error: "Toast--error"
            },
            f = {
                info: (0, r.jsx)(s.InfoIcon, {}),
                success: (0, r.jsx)(c.CheckIcon, {}),
                error: (0, r.jsx)(l.StopIcon, {})
            },
            h = e => {
                let t, a, i, s, c, l = (0, n.c)(14),
                    {
                        message: h,
                        timeToLive: _,
                        icon: p,
                        type: b,
                        role: g
                    } = e,
                    y = void 0 === b ? "info" : b,
                    E = void 0 === g ? "log" : g,
                    [S, w] = o.useState(!0),
                    {
                        safeSetTimeout: v
                    } = (0, d.A)();
                l[0] !== v || l[1] !== _ ? (t = () => {
                    _ && v(() => w(!1), _ - 300)
                }, a = [v, _], l[0] = v, l[1] = _, l[2] = t, l[3] = a) : (t = l[2], a = l[3]), (0, o.useEffect)(t, a);
                let I = `Toast ${m[y]} ${S?"Toast--animateIn":"Toast--animateOut"}`,
                    T = `ui-app-toast-${y}`,
                    R = p || f[y];
                return l[4] !== R ? (i = (0, r.jsx)("span", {
                    className: "Toast-icon",
                    children: R
                }), l[4] = R, l[5] = i) : i = l[5], l[6] !== h ? (s = (0, r.jsx)("span", {
                    className: "Toast-content",
                    children: h
                }), l[6] = h, l[7] = s) : s = l[7], l[8] !== E || l[9] !== I || l[10] !== T || l[11] !== i || l[12] !== s ? (c = (0, r.jsx)(u.A, {
                    children: (0, r.jsx)("div", {
                        className: "p-1 position-fixed bottom-0 left-0 tmp-mb-3 tmp-ml-3",
                        children: (0, r.jsxs)("div", {
                            className: I,
                            id: "ui-app-toast",
                            "data-testid": T,
                            role: E,
                            children: [i, s]
                        })
                    })
                }), l[8] = E, l[9] = I, l[10] = T, l[11] = i, l[12] = s, l[13] = c) : c = l[13], c
            };

        function _() {
            let e, t, a, s = (0, n.c)(7),
                {
                    toasts: c,
                    persistedToast: l
                } = (0, o.use)(i.T8);
            return s[0] !== c ? (e = c.map(p), s[0] = c, s[1] = e) : e = s[1], s[2] !== l ? (t = l && (0, r.jsx)(h, {
                message: l.message,
                icon: l.icon,
                type: l.type,
                role: l.role
            }), s[2] = l, s[3] = t) : t = s[3], s[4] !== e || s[5] !== t ? (a = (0, r.jsxs)(r.Fragment, {
                children: [e, t]
            }), s[4] = e, s[5] = t, s[6] = a) : a = s[6], a
        }

        function p(e, t) {
            return (0, r.jsx)(h, {
                message: e.message,
                icon: e.icon,
                timeToLive: 5e3,
                type: e.type,
                role: e.role
            }, t)
        }
        h.displayName = "Toast", _.displayName = "Toasts"
    },
    57027(e, t, a) {
        var r = a(374395),
            n = a(327905),
            o = a(164636);
        async function i(e, t = {}) {
            let a, s, c, l;
            var d, u = e;
            if (new URL(u, window.location.origin).origin !== window.location.origin) throw Error("Can not make cross-origin requests from verifiedFetch");
            let {
                tracingEnabled: m,
                fetchPath: f
            } = (a = new URL(d = e, window.location.href), (c = (s = new URL(window.location.href, window.location.origin)).searchParams.get("_features")) && !a.searchParams.has("_features") && a.searchParams.set("_features", c), (l = s.searchParams.get("_tracing")) && !a.searchParams.has("_tracing") && a.searchParams.set("_tracing", l), {
                tracingEnabled: !!l,
                fetchPath: d.startsWith(window.location.origin) ? a.href : `${a.pathname}${a.search}`
            }), h = { ...t.headers,
                "GitHub-Verified-Fetch": "true",
                ...(0, r.kt)()
            }, _ = await fetch(f, { ...t,
                headers: h
            }), p = _ ? .headers ? .get("X-Github-Request-Id");
            if (p && (0, n.Ex)(p), m && _) {
                let e = _.clone();
                try {
                    let t = await e.text(),
                        a = t && JSON.parse(t);
                    (0, o.Av)(a)
                } catch {}
            }
            return _
        }

        function s(e, t) {
            let a = { ...t ? .headers ? ? {},
                    Accept : "application/json",
                    "Content-Type" : "application/json"
                },
                r = t ? .body ? JSON.stringify(t.body) : void 0;
            return i(e, { ...t,
                body: r,
                headers: a
            })
        }

        function c(e, t = {}) {
            let a = { ...t.headers,
                "GitHub-Is-React": "true"
            };
            return i(e, { ...t,
                headers: a
            })
        }

        function l(e, t) {
            let a = { ...t ? .headers ? ? {},
                "GitHub-Is-React" : "true"
            };
            return s(e, { ...t,
                headers: a
            })
        }
        a.d(t, {
            DI: () => i,
            QJ: () => c,
            Sr: () => l,
            lS: () => s
        })
    },
    836301(e, t, a) {
        let r;

        function n() {
            return `${Math.round(0x7fffffff*Math.random())}.${Math.round(Date.now()/1e3)}`
        }

        function o() {
            try {
                let e = function() {
                    let e, t = document.cookie.match(/_octo=([^;]+)/g);
                    if (!t) return;
                    let a = [0, 0];
                    for (let r of t) {
                        let [, t] = r.split("="), [, n, ...o] = t.split("."), i = n.split("-").map(Number);
                        i > a && (a = i, e = o.join("."))
                    }
                    return e
                }();
                if (e) return e;
                let t = n();
                return ! function(e) {
                    let t = `GH1.1.${e}`,
                        a = new Date(Date.now() + 31536e6).toUTCString(),
                        {
                            domain: r
                        } = document;
                    r.endsWith(".github.com") && (r = "github.com"), document.cookie = `_octo=${t}; expires=${a}; path=/; domain=${r}; secure; samesite=lax`
                }(t), t
            } catch (e) {
                return r || (r = n()), r
            }
        }
        a.d(t, {
            y: () => o
        })
    },
    16404(e, t, a) {
        var r, n = /bot|crawl|http|lighthouse|scan|search|spider/i,
            o = function(e) {
                return "string" == typeof e && "" !== e && (function() {
                    if (r instanceof RegExp) return r;
                    try {
                        r = RegExp(" daum[ /]| deusu/|(?:^|[^g])news(?!sapphire)|(?<! channel/|google/)google(?!(?:wv|app|/google| pixel))|(?<! cu)bots?(?:\\b|_)|(?<!cam)scan|(?<!lib)http|24x7|;\\s\\w+;$|@[a-z][\\w-]+\\.|\\(\\)|\\.com\\b|\\b\\w+\\.ai|\\bbw/|\\bdlc\\b|\\bort/|\\bperl\\b|\\btime/|\\||^[<\\(;]|^[\\w \\.\\-\\(?:\\):%]+(?:/v?\\d+(?:\\.\\d+)?(?:\\.\\d{1,10})*?)?(?:,|$)|^[\\w\\-]+/[\\w]+$|^[^ ]{50,}$|^\\d+\\b|^\\w*search\\b|^\\w+/[\\w\\(\\)]*$|^\\w+/\\d\\.\\d\\s\\([\\w@]+\\)$|^active|^ad muncher|^amaya|^apache/|^avsdevicesdk/|^azure|^biglotron|^blackbox exporter|^bot|^clamav[ /]|^claude-code/|^client/|^cobweb/|^custom|^ddg[_-]android|^discourse|^dispatch/\\d|^downcast/|^duckduckgo|^email|^exodusmovement|^facebook|^getright/|^gozilla/|^hobbit|^hotzonu|^hwcdn/|^igetter/|^jeode/|^jetty/|^jigsaw|^microsoft bits|^movabletype|^mozilla/\\d\\.\\d\\s[\\w\\.-]+$|^mozilla/\\d\\.\\d\\s\\((?:compatible;)?(?:\\s?[\\w\\d-.]+\\/\\d+\\.\\d+)?\\)$|^navermailapp|^netsurf|^offline|^openai/|^owler|^php|^postman|^ps_daily/|^python|^rank|^read|^reed|^remove\\.bg/|^rest|^rss|^snapchat|^sora |^space bison|^stape/|^svn|^swcd |^taringa|^thumbor/|^track|^w3c|^webbandit/|^webcopier|^wget|^whatsapp|^wordpress|^xenu link sleuth|^yahoo|^yandex|^zdm/\\d|^zoom marketplace/|abuse|advisor|agent\\b|analyzer|archive|ask jeeves/teoma|attracta|audit|bluecoat drtr|browsex|burpcollaborator|capture|catch|check\\b|checker|chrome-lighthouse|chromeframe|classifier|cloudflare|collapsify\\b|convertify|cookiehubverify/|crawl|cursor/|cypress/|dareboost|datanyze|dejaclick|detect|discovery|dmbrowser|download|exaleadcloudview|feed|fetcher|firephp|foregenix|functionize|grab|hardenize\\b|headless|hotjar|httrack|hubspot marketing grader|ibisbrowser|infrawatch|insight|inspect|iplabel|java(?!;)|library|linkcheck|linktiger|mail\\.ru/|manager|manus-user/|marketgoo/|measure|monitor\\b|neustar wpm|node\\b|nutch|offbyone|openvas|optimize|pageburst|pagespeed|parser|phantomjs|pingdom|playwright|powermarks|preview|productfinder|prospectingstudio|proxy|ptst[ /]\\d|radar|readable/|retriever|rexx;|rigor|rss\\b|scrape|securityheaders|selenium|server|silktide|sindup/|sogou|sparkler/|speedcurve|spider|splash|statuscake|supercleaner|synapse|synthetic|testlocally|tools|torrent|transcoder|upday/|url|validator|virtuoso|wappalyzer|watchtowr|webglance|webkit2png|whatcms/|xtate/", "i")
                    } catch (e) {
                        r = n
                    }
                    return r
                })().test(e)
            };
        a.d(t, {
            S1: () => o
        })
    }
};
//# sourceMappingURL=app-runtime-966563661fbbdbd0-dd0c1d7d436b5662.js.map