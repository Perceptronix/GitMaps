"use strict";
(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
    [1299], {
        6084: (t, e, n) => {
            n.d(e, {
                JB: () => a
            });
            let i = ["googlebot", "bingbot", "slurp", "duckduckbot", "amazonbot", "adsbot-google", "adsbot-google-mobile", "appengine-google", "amazing-searchbot", "azureai-searchbot", "baiduspider", "360spider", "ccbot", "geobot", "msnbot-media", "qwantbot", "sogou web spider", "youbot", "yandexbot", "facebookexternalhit", "facebookbot", "facebot", "meta-externalagent", "meta-externalfetcher", "meta-webindexer", "tiktokspider", "twitterbot", "linkedinbot", "slackbot", "discordbot", "whatsapp", "telegrambot", "gptbot", "chatgpt-user", "claudebot", "coherebot", "oai-searchbot", "perplexitybot", "bytespider", "applebot", "abevalbot", "ahrefsbot", "ahrefssiteaudit", "bitsightbot", "dataforseobot", "serankingbacklinksbot", "semrushbot", "siteauditbot", "mj12bot", "dotbot", "rogerbot", "blexbot", "petalbot", "scraper", "scrapy", "curl", "wget", "python-requests", "python/", "java/", "perl", "ruby", "go-http-client", "axios/", "postman", "insomnia", "headlesschrome", "headless", "phantom", "selenium", "puppeteer", "playwright", "lighthouse", "gtmetrix", "pingdom", "statuscake", "uptimerobot", "datadog", "newrelic", "prerender", "rendertron"],
                o = ["chrome/", "firefox/", "safari/", "edg/", "opera/", "msie", "trident/", "gecko/", "webkit/"];

            function a() {
                return !("u" < typeof navigator) && (!!navigator.webdriver || function(t, e = {}) {
                    let {
                        requireBrowserIndicator: n = !0,
                        minLength: a = 20
                    } = e;
                    if (!t || "unknown" === t || "string" != typeof t) return !0;
                    let r = t.toLowerCase();
                    return !(!i.some(t => r.includes(t)) && !(r.length < a) && "mozilla/5.0" !== r && "" !== r.trim() && (!n || o.some(t => r.includes(t)))) || !1
                }(navigator.userAgent || ""))
            }
        },
        26516: (t, e, n) => {
            n.d(e, {
                C: () => r,
                g: () => c
            });
            var i = n(61838),
                o = n(34270);

            function a() {
                return i.F && !(0, o.gW)() && !0
            }

            function r(t, e = {}) {
                if (!a()) return;
                let n = new URLSearchParams({
                    event: t
                });
                n.set("page_path", window.location.pathname), Object.entries(e).forEach(([t, e]) => {
                    null != e && "" !== e && n.set(t, String(e))
                });
                let i = `/__event?${n.toString()}`;
                try {
                    if ("function" == typeof fetch) return void fetch(i, {
                        method: "GET",
                        keepalive: !0,
                        credentials: "same-origin"
                    }).catch(() => {})
                } catch {}
                new Image().src = i
            }

            function c(t = {}) {
                if (!a()) return;
                let e = new URLSearchParams;
                e.set("page_path", window.location.pathname), e.set("page_url", window.location.href), Object.entries(t).forEach(([t, n]) => {
                    null != n && "" !== n && e.set(t, String(n))
                });
                let n = e.toString(),
                    i = n ? `/__pageview?${n}` : "/__pageview";
                try {
                    if ("function" == typeof fetch) return void fetch(i, {
                        method: "GET",
                        keepalive: !0,
                        credentials: "same-origin"
                    }).catch(() => {})
                } catch {}
                new Image().src = i
            }
        },
        34270: (t, e, n) => {
            n.d(e, {
                gW: () => c,
                sg: () => a,
                z$: () => r
            });
            let i = "internal_traffic",
                o = "true";

            function a() {
                try {
                    if ("/internalip" === window.location.pathname) return !0;
                    return document.cookie.includes(`${i}=${o}`)
                } catch {
                    return !1
                }
            }

            function r() {
                if ("u" > typeof document) {
                    document.cookie = `${i}=${o}; path=/; max-age=31536000`;
                    try {
                        "function" == typeof window.mixpanel ? .opt_out_tracking && window.mixpanel.opt_out_tracking()
                    } catch {}
                }
            }

            function c() {
                return a()
            }
        },
        37366: (t, e, n) => {
            function i(t) {
                return Array.isArray(t) && t.includes("analytics")
            }

            function o() {
                if ("u" < typeof document) return [];
                let t = window.CookieConsent || window.CookieConsentApi;
                if (void 0 !== t) try {
                    return t.getCookie() ? .categories || []
                } catch {
                    return []
                }
                var e = document.cookie.split("; ").find(t => t.startsWith("cc_cookie=")) ? .split("=")[1];
                if (!e) return [];
                try {
                    let t = JSON.parse(decodeURIComponent(e));
                    return t ? .categories || []
                } catch {
                    return []
                }
            }

            function a(t) {
                return i(t ? ? o())
            }
            n.d(e, {
                cY: () => o,
                rH: () => i,
                vP: () => a
            })
        },
        59078: (t, e, n) => {
            n.d(e, {
                E: () => g
            });
            var i = n(61838),
                o = n(37366),
                a = n(6084),
                r = n(34270),
                c = n(83965);
            let s = new Set(["scroll", "click", "file_download", "user_engagement", "form_start", "form_submit", "search"]),
                l = null;
            async function u(t, e = {}) {
                if (!i.F || (0, r.gW)() || ((0, c.XV)(), (0, a.JB)() || s.has(t) && !(0, c.t6)().likely_human_interaction)) return;
                let n = function() {
                        let t = document.cookie.match(/(?:^|; )_cid=([^;]*)/);
                        if (t) return decodeURIComponent(t[1]);
                        let e = [navigator.userAgent, navigator.language, screen.width, screen.height, screen.colorDepth, new Date().getTimezoneOffset()].join("|"),
                            n = 0;
                        for (let t = 0; t < e.length; t++) n = (n << 5) - n + e.charCodeAt(t), n &= n;
                        return Math.abs(n).toString()
                    }(),
                    g = function() {
                        if (!(0, o.vP)()) return l || (l = `anon-${Date.now()}-${Math.random().toString(36).substring(2)}`), l;
                        try {
                            let t = document.cookie.split("; ").find(t => t.startsWith("_ga=")) ? .split("=")[1];
                            if (t) return t;
                            let e = sessionStorage.getItem("_ga_session");
                            if (!e) {
                                let t = Math.floor(Date.now() / 864e5);
                                e = `client-${t}-${Math.random().toString(36).substring(7)}`, sessionStorage.setItem("_ga_session", e)
                            }
                            return e
                        } catch {
                            return Date.now().toString()
                        }
                    }(),
                    d = new URLSearchParams({
                        v: "2",
                        tid: "G-K0MBV3YDYD",
                        cid: n,
                        sid: g,
                        en: t,
                        _p: Math.random().toString(36).substring(7),
                        _s: "1",
                        dl: window.location.href,
                        dt: document.title,
                        ul: navigator.language,
                        sr: `${screen.width}x${screen.height}`,
                        ua: navigator.userAgent,
                        uap: navigator.userAgentData ? "1" : "0",
                        vp: `${window.innerWidth}x${window.innerHeight}`,
                        "ep.session_id": g,
                        "ep.engagement_time_msec": e.engagement_time_msec || "100"
                    });
                Object.entries(e).forEach(([t, e]) => {
                    d.append(`ep.${t}`, e)
                });
                let p = "https://www.google-analytics.com/g/collect";
                try {
                    navigator.sendBeacon ? navigator.sendBeacon(p, d.toString()) : fetch(p, {
                        method: "POST",
                        body: d.toString(),
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded"
                        },
                        keepalive: !0
                    })
                } catch (t) {
                    console.error("Failed to send cookieless event:", t)
                }
            }

            function g(t, e = {}) {
                if (!i.F || (0, r.gW)()) return;
                let n = (0, c.t6)(),
                    a = { ...n,
                        ...e
                    },
                    l = (0, o.vP)();
                if ("function" == typeof window.gtag && l) try {
                    window.gtag("event", t, a);
                    return
                } catch (t) {
                    console.warn("gtag event failed, using cookieless fallback:", t)
                }(!s.has(t) || n.likely_human_interaction) && u(t, a)
            }
        },
        61299: (t, e, n) => {
            n.d(e, {
                EF: () => p,
                Jm: () => m,
                Oi: () => g,
                Y7: () => u,
                Yp: () => w,
                aD: () => d,
                eh: () => h,
                fO: () => f
            });
            var i = n(61838),
                o = n(59078),
                a = n(34270),
                r = n(66868),
                c = n(26516);

            function s() {
                return i.F && !(0, a.gW)()
            }

            function l({
                gaEvent: t,
                gaParams: e = {},
                mixpanelEvent: n,
                mixpanelParams: i = {},
                nginxEvent: a,
                nginxParams: u = {}
            }) {
                if (!s()) return;
                let g = function(t = {}) {
                    return {
                        page_path: window.location.pathname,
                        page_url: window.location.href,
                        page_title: document.title,
                        ...t
                    }
                }(i);
                t && (0, o.E)(t, {
                    event_category: "engagement",
                    ...e
                }), n && (0, r.EN)(n, g), a && (0, c.C)(a, { ...g,
                    ...u
                })
            }

            function u(t = {}) {
                l({
                    gaEvent: "search",
                    gaParams: {
                        search_term: t.search_term || t.submitted_repo,
                        search_type: "repository",
                        ...t
                    },
                    mixpanelEvent: "Repository Search",
                    mixpanelParams: t,
                    nginxEvent: "repository_search",
                    nginxParams: t
                })
            }

            function g(t = {}) {
                l({
                    gaEvent: "select_content",
                    gaParams: {
                        content_type: "repository",
                        item_id: t.repo_name,
                        ...t
                    },
                    mixpanelEvent: "Repository Click",
                    mixpanelParams: t,
                    nginxEvent: "repository_click",
                    nginxParams: t
                })
            }

            function d(t, e = {}) {
                l({
                    gaEvent: "scroll",
                    gaParams: {
                        percent_scrolled: t,
                        ...e
                    },
                    mixpanelEvent: "Scroll Depth",
                    mixpanelParams: {
                        percent_scrolled: t,
                        ...e
                    },
                    nginxEvent: "scroll_depth",
                    nginxParams: {
                        percent_scrolled: t,
                        ...e
                    }
                })
            }

            function p(t = {}) {
                l({
                    gaEvent: "user_engagement",
                    gaParams: t,
                    mixpanelEvent: "Page Engagement",
                    mixpanelParams: t,
                    nginxEvent: "page_engagement",
                    nginxParams: t
                })
            }

            function m(t = {}) {
                l({
                    gaEvent: "rec_surface",
                    gaParams: t,
                    mixpanelEvent: "Recommendation Surface View",
                    mixpanelParams: t,
                    nginxEvent: "rec_surface",
                    nginxParams: t
                })
            }

            function f(t = {}) {
                l({
                    gaEvent: "rec_impression",
                    gaParams: t,
                    mixpanelEvent: "Recommendation Impression",
                    mixpanelParams: t,
                    nginxEvent: "rec_impression",
                    nginxParams: t
                })
            }

            function h(t = {}) {
                l({
                    gaEvent: "rec_click",
                    gaParams: t,
                    mixpanelEvent: "Recommendation Click",
                    mixpanelParams: t,
                    nginxEvent: "rec_click",
                    nginxParams: t
                })
            }
            let _ = !1;

            function w() {
                "u" > typeof document && !_ && s() && (_ = !0, document.addEventListener("click", t => {
                    let e = t.target.closest("[data-mp-track]");
                    if (!e) return;
                    let n = e.getAttribute("data-mp-track"),
                        i = e.getAttribute("data-mp-source") || void 0,
                        o = e.getAttribute("href") || e.getAttribute("data-mp-destination") || void 0;
                    switch (n) {
                        case "sign-in":
                            ! function(t = {}) {
                                l({
                                    gaEvent: "sign_in_click",
                                    gaParams: {
                                        event_category: "authentication",
                                        ...t
                                    },
                                    mixpanelEvent: "Sign In Click",
                                    mixpanelParams: t,
                                    nginxEvent: "sign_in_click",
                                    nginxParams: t
                                })
                            }({
                                source: i || "unknown"
                            });
                            break;
                        case "cta":
                            ! function(t = {}) {
                                l({
                                    gaEvent: "cta_click",
                                    gaParams: t,
                                    mixpanelEvent: "CTA Click",
                                    mixpanelParams: t,
                                    nginxEvent: "cta_click",
                                    nginxParams: t
                                })
                            }({
                                cta_label: e.getAttribute("data-mp-label") || e.innerText ? .trim() ? .slice(0, 100) || "unknown",
                                cta_destination: o,
                                cta_location: i || "unknown"
                            });
                            break;
                        case "repository":
                            g({
                                repo_name: e.getAttribute("data-mp-repo") || function(t) {
                                    if (!t) return;
                                    let e = t.match(/\/repos\/([^/?#]+(?:\/[^/?#]+)?)/i);
                                    return e ? decodeURIComponent(e[1]).toLowerCase() : void 0
                                }(o) || void 0,
                                source: i || "unknown",
                                link_url: o
                            })
                    }
                }))
            }
        },
        61838: (t, e, n) => {
            n.d(e, {
                F: () => i
            });
            let i = !0
        },
        66868: (t, e, n) => {
            n.d(e, {
                DR: () => w,
                EN: () => _,
                Sf: () => h,
                y_: () => m
            });
            var i = n(37366),
                o = n(34270);

            function a() {
                return void 0 === window.mixpanel ? null : window.mixpanel
            }

            function r() {
                let t = a();
                return !(!t || ("function" == typeof t.toString ? t.toString() : "").includes("stub")) && "function" == typeof t.track
            }

            function c(t, {
                timeoutMs: e = 3e4,
                intervalMs: n = 100
            } = {}) {
                if (r()) return void t();
                let i = Date.now(),
                    o = () => {
                        r() ? t() : Date.now() - i >= e || setTimeout(o, n)
                    };
                o()
            }
            let s = null,
                l = null,
                u = 0,
                g = !1,
                d = "";

            function p(t) {
                return !!g || "function" == typeof t.has_opted_in_tracking && t.has_opted_in_tracking()
            }

            function m(t = (0, i.cY)(), e = null) {
                if ((0, o.gW)()) return;
                let n = a();
                if (!n) return;
                let r = [...t].sort().join(",");
                if (r === d && (0, i.rH)(t)) return void f(e, t);
                if (d = r, (0, i.rH)(t)) {
                    ! function(t) {
                        if (p(t)) {
                            g = !0;
                            return
                        }
                        "function" == typeof t.opt_in_tracking && (t.opt_in_tracking(), g = !0)
                    }(n), f(e, t);
                    return
                }
                t.length > 0 && "function" == typeof n.opt_out_tracking && (n.opt_out_tracking(), g = !1, d = "", s = null, l = null)
            }

            function f(t = null, e) {
                var n;
                if ((0, o.gW)()) return;
                let r = a();
                if (!r || !(0, i.vP)(e)) return;
                let c = t ? .id || t ? .email || ("function" != typeof(n = r).get_distinct_id ? null : n.get_distinct_id());
                if (!c) return;
                let l = String(c);
                s !== l && ("function" == typeof r.identify && r.identify(l), r.people && "function" == typeof r.people.set && r.people.set({ ...t ? .email ? {
                        $email: t.email
                    } : {},
                    ...t ? .name ? {
                        $name: t.name
                    } : {},
                    ...t ? .id ? {
                        user_id: String(t.id)
                    } : {},
                    last_seen : new Date().toISOString()
                }), s = l)
            }

            function h({
                categories: t
            } = {}) {
                if ((0, o.gW)() || !(0, i.vP)(t)) return;
                let e = a();
                if (!e || !p(e)) return;
                let n = window.location.pathname + window.location.search,
                    r = Date.now();
                if (n !== l || !(r - u < 2e3)) {
                    if ("function" == typeof e.track_pageview) e.track_pageview();
                    else {
                        if ("function" != typeof e.track) return;
                        e.track("$pageview", {
                            current_url_path: window.location.pathname,
                            current_url_search: window.location.search,
                            current_url_protocol: window.location.protocol
                        })
                    }
                    l = n, u = r
                }
            }

            function _(t, e = {}, {
                categories: n
            } = {}) {
                (0, o.gW)() || !(0, i.vP)(n) || t && c(() => {
                    let n = a();
                    n && p(n) && "function" == typeof n.track && n.track(t, e)
                })
            }

            function w({
                categories: t = (0, i.cY)(),
                user: e = null,
                trackPageView: n = !0
            } = {}) {
                (0, o.gW)() || !(0, i.rH)(t) ? m(t, e): c(() => {
                    m(t, e), n && h({
                        categories: t
                    })
                })
            }
        },
        83965: (t, e, n) => {
            n.d(e, {
                XV: () => a,
                iK: () => r,
                t6: () => c
            });
            let i = {
                initialized: !1,
                firstInteractionAt: null,
                interactionTypes: new Set
            };

            function o(t) {
                i.firstInteractionAt || (i.firstInteractionAt = Date.now()), i.interactionTypes.add(t)
            }

            function a() {
                if (i.initialized) return;
                i.initialized = !0;
                let t = {
                    passive: !0,
                    once: !0
                };
                window.addEventListener("scroll", () => o("scroll"), t), window.addEventListener("pointerdown", () => o("pointer"), t), window.addEventListener("keydown", () => o("keyboard"), t), window.addEventListener("focus", () => o("focus"), t), document.addEventListener("visibilitychange", () => {
                    document.hidden || o("visibility")
                }, t)
            }

            function r() {
                return a(), i.interactionTypes.size > 0
            }

            function c() {
                a();
                let t = [...i.interactionTypes];
                return {
                    likely_human_interaction: t.length > 0,
                    interaction_signal_count: t.length,
                    interaction_types: t.join(",") || void 0,
                    first_interaction_ms: i.firstInteractionAt ? Math.max(Date.now() - i.firstInteractionAt, 0) : void 0
                }
            }
        }
    }
]);