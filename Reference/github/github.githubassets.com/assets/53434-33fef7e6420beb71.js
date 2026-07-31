performance.mark("js-parse-end:53434-33fef7e6420beb71.js");
export const __rspack_esm_id = 53434;
export const __rspack_esm_ids = [53434];
export const __webpack_modules__ = {
    544193(e, t, r) {
        r.d(t, {
            n: () => q
        });
        var i = r(474848),
            l = r(916522),
            n = r(296540),
            s = r(634164),
            o = r(854969),
            u = r(609184),
            a = r(32913),
            c = r(798669);
        let d = (0, n.createContext)(void 0);

        function p(e) {
            let t, r, n = (0, l.c)(5),
                {
                    shouldUseDotcomLinks: s,
                    children: o
                } = e;
            n[0] !== s ? (t = {
                shouldUseDotcomLinks: s
            }, n[0] = s, n[1] = t) : t = n[1];
            let u = t;
            return n[2] !== o || n[3] !== u ? (r = (0, i.jsx)(d, {
                value: u,
                children: o
            }), n[2] = o, n[3] = u, n[4] = r) : r = n[4], r
        }
        d.displayName = "UrlContext", p.displayName = "UrlProvider";
        let m = "NavLink-module__link__EG3d4",
            _ = "NavLink-module__title__Q7t0p";

        function f(e) {
            let t, r, p, f, h, v = (0, l.c)(45),
                {
                    shouldUseDotcomLinks: g
                } = function() {
                    let e = (0, n.use)(d);
                    if (void 0 === e) throw Error("useUrlContext must be used within a UrlProvider");
                    return e
                }(),
                {
                    className: b,
                    context: y,
                    external: x,
                    icon: N,
                    label: w,
                    render: k,
                    subtitle: S,
                    title: E,
                    url: I,
                    withArrow: C
                } = e;
            if (!1 === (void 0 === k || k)) return null;
            let L = g && I.startsWith("/") ? `https://github.com${I}` : I,
                j = y || "";
            v[0] !== j || v[1] !== E ? (t = (0, c.$C)({
                action: E,
                tag: "link",
                context: j,
                location: "navbar"
            }), v[0] = j, v[1] = E, v[2] = t) : t = v[2], v[3] !== t ? (r = { ...t
            }, v[3] = t, v[4] = r) : r = v[4];
            let A = r;
            if (void 0 !== x && x) {
                let e, t, r;
                return v[5] !== E ? (e = (0, i.jsx)("span", {
                    className: _,
                    children: E
                }), v[5] = E, v[6] = e) : e = v[6], v[7] === Symbol.for("react.memo_cache_sentinel") ? (t = (0, i.jsx)(a.LinkExternalIcon, {
                    size: 16,
                    className: "NavLink-module__externalIcon__eWIry"
                }), v[7] = t) : t = v[7], v[8] !== A || v[9] !== L || v[10] !== e ? (r = (0, i.jsxs)("a", {
                    href: L,
                    ...A,
                    className: m,
                    target: "_blank",
                    rel: "noreferrer",
                    children: [e, t]
                }), v[8] = A, v[9] = L, v[10] = e, v[11] = r) : r = v[11], r
            }
            if (void 0 !== C && C) {
                let e, t, r;
                return v[12] !== E ? (e = (0, i.jsx)("span", {
                    className: _,
                    children: E
                }), v[12] = E, v[13] = e) : e = v[13], v[14] === Symbol.for("react.memo_cache_sentinel") ? (t = (0, i.jsx)(o.ChevronRightIcon, {
                    size: 16,
                    className: "NavLink-module__arrowIcon__amekg"
                }), v[14] = t) : t = v[14], v[15] !== A || v[16] !== L || v[17] !== e ? (r = (0, i.jsxs)("a", {
                    href: L,
                    ...A,
                    className: m,
                    children: [e, t]
                }), v[15] = A, v[16] = L, v[17] = e, v[18] = r) : r = v[18], r
            }
            if (S || N || w) {
                let e, t, r, l, n, s;
                return v[19] !== N ? (e = N ? (0, i.jsx)(N, {
                    size: 24,
                    className: "NavLink-module__icon__ltGNM"
                }) : null, v[19] = N, v[20] = e) : e = v[20], v[21] !== w ? (t = w ? (0, i.jsx)("sup", {
                    className: "NavLink-module__label__bil7n",
                    children: w
                }) : null, v[21] = w, v[22] = t) : t = v[22], v[23] !== t || v[24] !== E ? (r = (0, i.jsxs)(u.EYj, {
                    as: "span",
                    className: _,
                    size: "200",
                    weight: "semibold",
                    children: [E, t]
                }), v[23] = t, v[24] = E, v[25] = r) : r = v[25], v[26] !== S ? (l = S ? (0, i.jsx)(u.EYj, {
                    as: "span",
                    className: "NavLink-module__subtitle__X4gkW",
                    variant: "muted",
                    size: "200",
                    children: S
                }) : null, v[26] = S, v[27] = l) : l = v[27], v[28] !== e || v[29] !== r || v[30] !== l ? (n = (0, i.jsxs)("div", {
                    className: "NavLink-module__text__XvpLQ",
                    children: [e, r, l]
                }), v[28] = e, v[29] = r, v[30] = l, v[31] = n) : n = v[31], v[32] !== A || v[33] !== L || v[34] !== n ? (s = (0, i.jsx)("a", {
                    href: L,
                    ...A,
                    className: m,
                    children: n
                }), v[32] = A, v[33] = L, v[34] = n, v[35] = s) : s = v[35], s
            }
            return v[36] !== b ? (p = (0, s.$)(m, b), v[36] = b, v[37] = p) : p = v[37], v[38] !== E ? (f = (0, i.jsx)("span", {
                className: _,
                children: E
            }), v[38] = E, v[39] = f) : f = v[39], v[40] !== A || v[41] !== L || v[42] !== p || v[43] !== f ? (h = (0, i.jsx)("a", {
                href: L,
                ...A,
                className: p,
                children: f
            }), v[40] = A, v[41] = L, v[42] = p, v[43] = f, v[44] = h) : h = v[44], h
        }
        f.displayName = "NavLink";

        function h(e) {
            let t, r, o, a, c, d = (0, l.c)(17),
                {
                    title: p,
                    items: m,
                    render: _,
                    hasSeparator: h,
                    context: v
                } = e,
                g = void 0 !== h && h,
                b = (0, n.useId)();
            if (!1 === (void 0 === _ || _)) return null;
            if (d[0] !== g ? (t = (0, s.$)("NavGroup-module__group__W8SqJ", {
                    "NavGroup-module__hasSeparator__FnMrN": g
                }), d[0] = g, d[1] = t) : t = d[1], d[2] !== p || d[3] !== b ? (r = (0, i.jsx)(u.EYj, {
                    as: "span",
                    id: b,
                    className: "NavGroup-module__title__Wzxz2",
                    font: "monospace",
                    variant: "muted",
                    size: "100",
                    children: p
                }), d[2] = p, d[3] = b, d[4] = r) : r = d[4], d[5] !== v || d[6] !== m) {
                let e;
                d[8] !== v ? (e = e => (0, i.jsx)("li", {
                    children: (0, i.jsx)(f, { ...e,
                        context: v
                    })
                }, e.title), d[8] = v, d[9] = e) : e = d[9], o = m.map(e), d[5] = v, d[6] = m, d[7] = o
            } else o = d[7];
            return d[10] !== o || d[11] !== b ? (a = (0, i.jsx)("ul", {
                className: "NavGroup-module__list__UCOFy",
                "aria-labelledby": b,
                children: o
            }), d[10] = o, d[11] = b, d[12] = a) : a = d[12], d[13] !== t || d[14] !== r || d[15] !== a ? (c = (0, i.jsxs)("div", {
                className: t,
                children: [r, a]
            }), d[13] = t, d[14] = r, d[15] = a, d[16] = c) : c = d[16], c
        }

        function v() {
            return "u" > typeof window && window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1012px)").matches
        }
        h.displayName = "NavGroup";

        function g(e) {
            let t, r, u, a, c, d, p, m, _, g, b, y, x, N, w, k, S, E, I = (0, l.c)(35),
                {
                    title: C,
                    groups: L,
                    render: j,
                    trailingLink: A,
                    isOpen: O,
                    onOpenChange: R
                } = e,
                M = void 0 !== O && O,
                D = (0, n.useId)();
            I[0] !== M || I[1] !== R ? (t = {
                isOpen: M,
                onOpenChange: R
            }, I[0] = M, I[1] = R, I[2] = t) : t = I[2];
            let {
                containerRef: G,
                dropdownRef: P,
                buttonRef: T,
                containerHandlers: Y,
                onButtonClick: B
            } = function(e) {
                let t, r, i, s, o, u, a, c, d, p, m, _, f, h = (0, l.c)(30),
                    {
                        isOpen: g,
                        onOpenChange: b
                    } = e,
                    y = (0, n.useRef)(null),
                    x = (0, n.useRef)(null),
                    N = (0, n.useRef)(null),
                    w = (0, n.useRef)(null),
                    k = (0, n.useRef)(!1),
                    S = (0, n.useRef)(g);
                h[0] !== g ? (t = () => {
                    let e = S.current;
                    if (S.current = g, !e || g) return;
                    let t = document.activeElement;
                    t instanceof HTMLElement && y.current ? .contains(t) && N.current ? .focus()
                }, r = [g], h[0] = g, h[1] = t, h[2] = r) : (t = h[1], r = h[2]), (0, n.useLayoutEffect)(t, r), h[3] === Symbol.for("react.memo_cache_sentinel") ? (i = function() {
                    null !== w.current && (clearTimeout(w.current), w.current = null)
                }, h[3] = i) : i = h[3];
                let E = i;
                h[4] === Symbol.for("react.memo_cache_sentinel") ? (s = () => () => {
                    null !== w.current && clearTimeout(w.current)
                }, o = [], h[4] = s, h[5] = o) : (s = h[4], o = h[5]), (0, n.useEffect)(s, o), h[6] !== g || h[7] !== b ? (u = function(e) {
                    0 === e.button && (E(), b ? .(!g))
                }, h[6] = g, h[7] = b, h[8] = u) : u = h[8];
                let I = u;
                h[9] === Symbol.for("react.memo_cache_sentinel") ? (a = function() {
                    E()
                }, h[9] = a) : a = h[9];
                let C = a;
                h[10] !== g || h[11] !== b ? (c = function(e) {
                    "Escape" === e.key && g && (e.preventDefault(), e.stopPropagation(), E(), b ? .(!1), N.current ? .focus())
                }, h[10] = g, h[11] = b, h[12] = c) : c = h[12];
                let L = c;
                h[13] !== g || h[14] !== b ? (d = function(e) {
                    if (!g) return;
                    let t = e.relatedTarget;
                    t && e.currentTarget.contains(t) || v() && k.current || (E(), b ? .(!1))
                }, h[13] = g, h[14] = b, h[15] = d) : d = h[15];
                let j = d;
                h[16] !== g || h[17] !== b ? (p = function() {
                    k.current = !0, !v() || (E(), g || (w.current = setTimeout(() => {
                        w.current = null, v() && b ? .(!0)
                    }, 90)))
                }, h[16] = g, h[17] = b, h[18] = p) : p = h[18];
                let A = p;
                h[19] !== g || h[20] !== b ? (m = function() {
                    k.current = !1, !v() || (E(), g && (w.current = setTimeout(() => {
                        w.current = null, v() && b ? .(!1)
                    }, 180)))
                }, h[19] = g, h[20] = b, h[21] = m) : m = h[21];
                let O = m;
                return h[22] !== j || h[23] !== L || h[24] !== A || h[25] !== O ? (_ = {
                    onKeyDown: L,
                    onBlur: j,
                    onMouseDown: C,
                    onMouseEnter: A,
                    onMouseLeave: O
                }, h[22] = j, h[23] = L, h[24] = A, h[25] = O, h[26] = _) : _ = h[26], h[27] !== I || h[28] !== _ ? (f = {
                    containerRef: y,
                    dropdownRef: x,
                    buttonRef: N,
                    containerHandlers: _,
                    onButtonClick: I
                }, h[27] = I, h[28] = _, h[29] = f) : f = h[29], f
            }(t);
            if ((S = (0, l.c)(12))[0] !== G || S[1] !== P ? (y = () => {
                    let e = G.current,
                        t = P.current;
                    if (!e || !t || window.innerWidth < 1012) return;
                    let r = function(e, t) {
                        let r = e.getBoundingClientRect(),
                            i = t.offsetWidth,
                            l = window.innerWidth - 16;
                        if (r.left + i <= l) return "right";
                        let n = r.left - 48;
                        if (n >= 0 && n + i <= l) return "offset-left";
                        let s = r.left + r.width / 2 - i / 2;
                        return s >= 0 && s + i <= l ? "center" : "left"
                    }(e, t);
                    t.classList.remove("open-left", "open-center", "open-offset-left"), "offset-left" === r ? t.classList.add("open-offset-left") : "center" === r ? t.classList.add("open-center") : "left" === r && t.classList.add("open-left")
                }, S[0] = G, S[1] = P, S[2] = y) : y = S[2], E = y, S[3] !== M || S[4] !== E ? (x = () => {
                    M && E()
                }, N = [M, E], S[3] = M, S[4] = E, S[5] = x, S[6] = N) : (x = S[5], N = S[6]), (0, n.useLayoutEffect)(x, N), S[7] !== G || S[8] !== P || S[9] !== E ? (w = () => {
                    let e = G.current,
                        t = P.current;
                    if (!e || !t) return;
                    E(), window.addEventListener("resize", E);
                    let r = new ResizeObserver(E);
                    return r.observe(e), r.observe(t), () => {
                        window.removeEventListener("resize", E), r.disconnect()
                    }
                }, k = [G, P, E], S[7] = G, S[8] = P, S[9] = E, S[10] = w, S[11] = k) : (w = S[10], k = S[11]), (0, n.useEffect)(w, k), !1 === (void 0 === j || j)) return null;
            if (I[3] !== M ? (r = (0, s.$)("NavDropdown-module__container__l2YeI", {
                    open: M
                }), I[3] = M, I[4] = r) : r = I[4], I[5] === Symbol.for("react.memo_cache_sentinel") ? (u = (0, s.$)("NavDropdown-module__button__PEHWX"), I[5] = u) : u = I[5], I[6] === Symbol.for("react.memo_cache_sentinel") ? (a = (0, i.jsx)(o.ChevronRightIcon, {
                    className: (0, s.$)("NavDropdown-module__buttonIcon__Tkl8_")
                }), I[6] = a) : a = I[6], I[7] !== T || I[8] !== M || I[9] !== B || I[10] !== D || I[11] !== C ? (c = (0, i.jsxs)("button", {
                    ref: T,
                    type: "button",
                    className: u,
                    "aria-expanded": M,
                    "aria-controls": D,
                    onClick: B,
                    children: [C, a]
                }), I[7] = T, I[8] = M, I[9] = B, I[10] = D, I[11] = C, I[12] = c) : c = I[12], I[13] === Symbol.for("react.memo_cache_sentinel") ? (d = (0, s.$)("NavDropdown-module__dropdown__xm1jd"), I[13] = d) : d = I[13], I[14] !== L || I[15] !== C) {
                let e;
                I[17] !== C ? (e = e => (0, i.jsx)("li", {
                    children: (0, i.jsx)(h, { ...e,
                        context: C
                    })
                }, e.title), I[17] = C, I[18] = e) : e = I[18], p = L.map(e), I[14] = L, I[15] = C, I[16] = p
            } else p = I[16];
            return I[19] !== p ? (m = (0, i.jsx)("ul", {
                className: "NavDropdown-module__list__zuCgG",
                children: p
            }), I[19] = p, I[20] = m) : m = I[20], I[21] !== C || I[22] !== A ? (_ = A ? (0, i.jsx)("div", {
                className: "NavDropdown-module__trailingLinkContainer__VgJGL",
                children: (0, i.jsx)(f, { ...A,
                    context: C,
                    withArrow: !0
                })
            }) : null, I[21] = C, I[22] = A, I[23] = _) : _ = I[23], I[24] !== P || I[25] !== D || I[26] !== _ || I[27] !== m ? (g = (0, i.jsxs)("div", {
                ref: P,
                id: D,
                className: d,
                children: [m, _]
            }), I[24] = P, I[25] = D, I[26] = _, I[27] = m, I[28] = g) : g = I[28], I[29] !== Y || I[30] !== G || I[31] !== g || I[32] !== r || I[33] !== c ? (b = (0, i.jsxs)("div", {
                ref: G,
                className: r,
                ...Y,
                children: [c, g]
            }), I[29] = Y, I[30] = G, I[31] = g, I[32] = r, I[33] = c, I[34] = b) : b = I[34], b
        }
        g.displayName = "NavDropdown";
        var b = r(432231),
            y = r(168417),
            x = r(826747),
            N = r(63491),
            w = r(800486),
            k = r(977689),
            S = r(528674),
            E = r(865354),
            I = r(303803),
            C = r(99910),
            L = r(622072),
            j = r(511163),
            A = r(823883),
            O = r(543826),
            R = r(224641),
            M = r(161773),
            D = r(285446),
            G = r(395545);
        let P = {
                title: (0, y.t)("GitHub Spark"),
                subtitle: (0, y.t)("Build and deploy intelligent apps"),
                url: "/features/spark",
                icon: x.SparkleFillIcon
            },
            T = {
                title: (0, y.t)("GitHub Models"),
                subtitle: (0, y.t)("Manage and compare prompts"),
                url: "/features/models",
                icon: N.AiModelIcon
            },
            Y = {
                title: (0, y.t)("GitHub Copilot app"),
                subtitle: (0, y.t)("Direct agents from issue to merge"),
                url: "/features/ai/github-app",
                icon: w.MarkGithubIcon
            },
            B = {
                title: (0, y.t)("Code Quality"),
                subtitle: (0, y.t)("Enforce quality at merge"),
                url: "/features/code-quality",
                icon: k.CodescanCheckmarkIcon
            },
            W = {
                title: (0, y.t)("Solutions"),
                trailingLink: {
                    title: (0, y.t)("View all solutions"),
                    url: "/solutions"
                },
                groups: [{
                    title: (0, y.t)("BY COMPANY SIZE"),
                    items: [{
                        title: (0, y.t)("Enterprises"),
                        url: "/enterprise"
                    }, {
                        title: (0, y.t)("Small and medium teams"),
                        url: "/team"
                    }, {
                        title: (0, y.t)("Startups"),
                        url: "/enterprise/startups"
                    }, {
                        title: (0, y.t)("Nonprofits"),
                        url: "/solutions/industry/nonprofits"
                    }]
                }, {
                    title: (0, y.t)("BY USE CASE"),
                    items: [{
                        title: (0, y.t)("App Modernization"),
                        url: "/solutions/use-case/app-modernization"
                    }, {
                        title: (0, y.t)("DevSecOps"),
                        url: "/solutions/use-case/devsecops"
                    }, {
                        title: (0, y.t)("DevOps"),
                        url: "/solutions/use-case/devops"
                    }, {
                        title: (0, y.t)("CI/CD"),
                        url: "/solutions/use-case/ci-cd"
                    }, {
                        title: (0, y.t)("View all use cases"),
                        url: "/solutions/use-case",
                        withArrow: !0
                    }]
                }, {
                    title: (0, y.t)("BY INDUSTRY"),
                    items: [{
                        title: (0, y.t)("Healthcare"),
                        url: "/solutions/industry/healthcare"
                    }, {
                        title: (0, y.t)("Financial services"),
                        url: "/solutions/industry/financial-services"
                    }, {
                        title: (0, y.t)("Manufacturing"),
                        url: "/solutions/industry/manufacturing"
                    }, {
                        title: (0, y.t)("Government"),
                        url: "/solutions/industry/government"
                    }, {
                        title: (0, y.t)("View all industries"),
                        url: "/solutions/industry",
                        withArrow: !0
                    }]
                }]
            },
            $ = {
                title: (0, y.t)("Resources"),
                trailingLink: {
                    title: (0, y.t)("View all resources"),
                    url: "/resources"
                },
                groups: [{
                    title: (0, y.t)("EXPLORE BY TOPIC"),
                    items: [{
                        title: (0, y.t)("AI"),
                        url: "/resources/articles?topic=ai"
                    }, {
                        title: (0, y.t)("Software Development"),
                        url: "/resources/articles?topic=software-development"
                    }, {
                        title: (0, y.t)("DevOps"),
                        url: "/resources/articles?topic=devops"
                    }, {
                        title: (0, y.t)("Security"),
                        url: "/resources/articles?topic=security"
                    }, {
                        title: (0, y.t)("View all topics"),
                        url: "/resources/articles",
                        withArrow: !0
                    }]
                }, {
                    title: (0, y.t)("EXPLORE BY TYPE"),
                    items: [{
                        title: (0, y.t)("Customer stories"),
                        url: "/customer-stories"
                    }, {
                        title: (0, y.t)("Events & webinars"),
                        url: "/resources/events"
                    }, {
                        title: (0, y.t)("Ebooks & reports"),
                        url: "/resources/whitepapers"
                    }, {
                        title: (0, y.t)("Business insights"),
                        url: "/solutions/executive-insights"
                    }, {
                        title: (0, y.t)("GitHub Skills"),
                        url: "https://skills.github.com",
                        external: !0
                    }]
                }, {
                    title: (0, y.t)("SUPPORT & SERVICES"),
                    items: [{
                        title: (0, y.t)("Documentation"),
                        url: "https://docs.github.com",
                        external: !0
                    }, {
                        title: (0, y.t)("Customer support"),
                        url: "https://support.github.com",
                        external: !0
                    }, {
                        title: (0, y.t)("Community forum"),
                        url: "/orgs/community/discussions"
                    }, {
                        title: (0, y.t)("Trust center"),
                        url: "/trust-center"
                    }, {
                        title: (0, y.t)("Partners"),
                        url: "/partners"
                    }]
                }]
            },
            z = {
                title: (0, y.t)("Open Source"),
                groups: [{
                    title: (0, y.t)("COMMUNITY"),
                    items: [{
                        title: (0, y.t)("GitHub Sponsors"),
                        subtitle: (0, y.t)("Fund open source developers"),
                        url: "/open-source/sponsors",
                        icon: M.SponsorTiersIcon
                    }]
                }, {
                    title: (0, y.t)("PROGRAMS"),
                    items: [{
                        title: (0, y.t)("Security Lab"),
                        url: "https://securitylab.github.com",
                        external: !0
                    }, {
                        title: (0, y.t)("Maintainer Community"),
                        url: "https://maintainers.github.com",
                        external: !0
                    }, {
                        title: (0, y.t)("Accelerator"),
                        url: "/open-source/accelerator"
                    }, {
                        title: (0, y.t)("GitHub Stars"),
                        url: "https://stars.github.com",
                        external: !0
                    }, {
                        title: (0, y.t)("Archive Program"),
                        url: "https://archiveprogram.github.com",
                        external: !0
                    }]
                }, {
                    title: (0, y.t)("REPOSITORIES"),
                    items: [{
                        title: (0, y.t)("Topics"),
                        url: "/topics"
                    }, {
                        title: (0, y.t)("Trending"),
                        url: "/trending"
                    }, {
                        title: (0, y.t)("Collections"),
                        url: "/collections"
                    }]
                }]
            },
            H = {
                title: (0, y.t)("Enterprise"),
                groups: [{
                    title: (0, y.t)("ENTERPRISE SOLUTIONS"),
                    items: [{
                        title: (0, y.t)("Enterprise platform"),
                        subtitle: (0, y.t)("AI-powered developer platform"),
                        url: "/enterprise",
                        icon: D.StackIcon
                    }]
                }, {
                    title: (0, y.t)("AVAILABLE ADD-ONS"),
                    items: [{
                        title: (0, y.t)("GitHub Advanced Security"),
                        subtitle: (0, y.t)("Enterprise-grade security features"),
                        url: "/security/advanced-security",
                        icon: A.ShieldCheckIcon
                    }, {
                        title: (0, y.t)("Copilot for Business"),
                        subtitle: (0, y.t)("Enterprise-grade AI features"),
                        url: "/features/copilot/copilot-business",
                        icon: S.CopilotIcon
                    }, {
                        title: (0, y.t)("Premium Support"),
                        subtitle: (0, y.t)("Enterprise-grade 24/7 support"),
                        url: "/enterprise/premium-support",
                        icon: G.CommentDiscussionIcon
                    }]
                }]
            },
            U = {
                title: (0, y.t)("Pricing"),
                url: "/pricing"
            },
            V = "MarketingNavigation-module__nav__W0KYY",
            F = "MarketingNavigation-module__list__tFbMb",
            X = "MarketingNavigation-module__navLink__hUomM";

        function q(e) {
            let t, r, s, o, u, a, c, d, m, _, h, v, x = (0, l.c)(16),
                {
                    should_use_dotcom_links: N
                } = e,
                w = void 0 !== N && N,
                k = [(d = (0, b.G7)("site_github_app_ga_page"), m = (0, b.G7)("site_global_nav_spark_models_removed"), _ = (0, b.G7)("site_code_quality_page"), h = [{
                    title: (0, y.t)("GitHub Copilot"),
                    subtitle: (0, y.t)("Write better code with AI"),
                    url: "/features/copilot",
                    icon: S.CopilotIcon
                }, ...d ? [Y] : [], ...m ? [] : [P, T], {
                    title: (0, y.t)("MCP Registry"),
                    subtitle: (0, y.t)("Integrate external tools"),
                    url: "/mcp",
                    icon: E.McpIcon
                }], v = [{
                    title: (0, y.t)("Actions"),
                    subtitle: (0, y.t)("Automate any workflow"),
                    url: "/features/actions",
                    icon: I.WorkflowIcon
                }, {
                    title: (0, y.t)("Codespaces"),
                    subtitle: (0, y.t)("Instant dev environments"),
                    url: "/features/codespaces",
                    icon: C.CodespacesIcon
                }, {
                    title: (0, y.t)("Issues"),
                    subtitle: (0, y.t)("Plan and track work"),
                    url: "/features/issues",
                    icon: L.IssueOpenedIcon
                }, {
                    title: (0, y.t)("Code Review"),
                    subtitle: (0, y.t)("Manage code changes"),
                    url: "/features/code-review",
                    icon: j.CodeIcon
                }, ..._ ? [B] : []], {
                    render: !0,
                    title: (0, y.t)("Platform"),
                    trailingLink: {
                        title: (0, y.t)("View all features"),
                        url: "/features"
                    },
                    groups: [{
                        title: (0, y.t)("AI CODE CREATION"),
                        items: h
                    }, {
                        title: (0, y.t)("DEVELOPER WORKFLOWS"),
                        items: v
                    }, {
                        title: (0, y.t)("APPLICATION SECURITY"),
                        items: [{
                            title: (0, y.t)("GitHub Advanced Security"),
                            subtitle: (0, y.t)("Find and fix vulnerabilities"),
                            url: "/security/advanced-security",
                            icon: A.ShieldCheckIcon
                        }, {
                            title: (0, y.t)("Code security"),
                            subtitle: (0, y.t)("Secure your code as you build"),
                            url: "/security/advanced-security/code-security",
                            icon: O.CodeSquareIcon
                        }, {
                            title: (0, y.t)("Secret protection"),
                            subtitle: (0, y.t)("Stop leaks before they start"),
                            url: "/security/advanced-security/secret-protection",
                            icon: R.LockIcon
                        }]
                    }, {
                        title: (0, y.t)("EXPLORE"),
                        items: [{
                            title: (0, y.t)("Why GitHub"),
                            url: "/why-github"
                        }, {
                            title: (0, y.t)("Documentation"),
                            url: "https://docs.github.com",
                            external: !0
                        }, {
                            title: (0, y.t)("Blog"),
                            url: "https://github.blog",
                            external: !0
                        }, {
                            title: (0, y.t)("Changelog"),
                            url: "https://github.blog/changelog",
                            external: !0
                        }, {
                            title: (0, y.t)("Marketplace"),
                            url: "/marketplace"
                        }],
                        hasSeparator: !0
                    }]
                }), W, $, z, H, U],
                [M, D] = (0, n.useState)(null);
            x[0] === Symbol.for("react.memo_cache_sentinel") ? (t = (e, t) => {
                D(r => t ? e : r === e ? null : r)
            }, x[0] = t) : t = x[0];
            let G = t;
            x[1] !== M ? (r = () => {
                if (null === M) return;
                let e = function(e) {
                    "Escape" === e.key && (e.preventDefault(), e.stopPropagation(), D(null))
                };
                return document.addEventListener("keydown", e, {
                    capture: !0
                }), () => document.removeEventListener("keydown", e, {
                    capture: !0
                })
            }, s = [M], x[1] = M, x[2] = r, x[3] = s) : (r = x[2], s = x[3]), (0, n.useEffect)(r, s), x[4] !== M ? (o = (e, t) => {
                let r = `marketing-nav-item-${t}`;
                return (0, i.jsx)("li", {
                    children: "groups" in e ? (0, i.jsx)(g, { ...e,
                        isOpen: M === r,
                        onOpenChange: e => G(r, e)
                    }) : (0, i.jsx)(f, { ...e,
                        context: e.title,
                        className: X
                    })
                }, e.title)
            }, x[4] = M, x[5] = o) : o = x[5];
            let q = k.map(o);
            return x[6] !== F || x[7] !== q ? (u = (0, i.jsx)("ul", {
                className: F,
                children: q
            }), x[6] = F, x[7] = q, x[8] = u) : u = x[8], x[9] !== V || x[10] !== u ? (a = (0, i.jsx)("nav", {
                className: V,
                "aria-label": "Global",
                children: u
            }), x[9] = V, x[10] = u, x[11] = a) : a = x[11], x[12] !== p || x[13] !== w || x[14] !== a ? (c = (0, i.jsx)(p, {
                shouldUseDotcomLinks: w,
                children: a
            }), x[12] = p, x[13] = w, x[14] = a, x[15] = c) : c = x[15], c
        }
        q.displayName = "MarketingNavigation"
    },
    798669(e, t, r) {
        var i = r(145871);

        function l(e) {
            return e.replace(/\s+/g, "_").replace(/[!@#$%^&*()+=[\]{};':"\\|,.<>?`~]/g, "").toLowerCase()
        }

        function n(e, t = {}) {
            try {
                let r = (e, t) => {
                        let r = e ? e.length > 100 ? e.substring(0, 100).trim() : e.trim() : e;
                        return r && !1 !== t ? l(r) : r
                    },
                    i = r(e.action, t.action),
                    n = r(e.tag, t.tag),
                    s = r(e.context, t.context),
                    o = r(e.location, t.location);
                return {
                    "data-analytics-event": JSON.stringify({
                        action: i,
                        tag: n,
                        context: s,
                        location: o,
                        label: `${i}_${n}_${s||"null"}_${o||"null"}`
                    })
                }
            } catch {
                return {
                    "data-analytics-event": "{}"
                }
            }
        }
        r.d(t, {
            $C: () => n,
            lm: () => function e(t, r = " ") {
                return t && t.content && Array.isArray(t.content) ? t.content.reduce((l, n, s) => {
                    let o = "";
                    if (i.helpers.isText(n)) o = n.value;
                    else if ((i.helpers.isBlock(n) || i.helpers.isInline(n)) && !(o = e(n, r)).length) return l;
                    let u = t.content[s + 1];
                    return l + o + (u && i.helpers.isBlock(u) ? r : "")
                }, "") : ""
            },
            uc: () => l
        })
    }
};
//# sourceMappingURL=53434-33fef7e6420beb71-c78f4b3472bf03ad.js.map