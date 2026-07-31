"use strict";
(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
    [2170], {
        4219: (e, t, r) => {
            r.d(t, {
                DEFAULT_ATTRIBUTE: () => a,
                EU: () => s,
                a$: () => i,
                oR: () => c
            });
            var o, n = r(12115),
                l = r(95155);
            let i = "mode",
                s = "color-scheme",
                a = "data-color-scheme";

            function c(e) {
                let {
                    defaultMode: t = "system",
                    defaultLightColorScheme: r = "light",
                    defaultDarkColorScheme: o = "dark",
                    modeStorageKey: n = i,
                    colorSchemeStorageKey: c = s,
                    attribute: u = a,
                    colorSchemeNode: d = "document.documentElement",
                    nonce: m
                } = e || {}, h = "", f = u;
                if ("class" === u && (f = ".%s"), "data" === u && (f = "[data-%s]"), f.startsWith(".")) {
                    let e = f.substring(1);
                    h += `${d}.classList.remove('${e}'.replace('%s', light), '${e}'.replace('%s', dark));
      ${d}.classList.add('${e}'.replace('%s', colorScheme));`
                }
                let p = f.match(/\[([^[\]]+)\]/);
                if (p) {
                    let [e, t] = p[1].split("=");
                    t || (h += `${d}.removeAttribute('${e}'.replace('%s', light));
      ${d}.removeAttribute('${e}'.replace('%s', dark));`), h += `
      ${d}.setAttribute('${e}'.replace('%s', colorScheme), ${t?`${t}.replace('%s', colorScheme)`:'""'});`
                } else ".%s" !== f && (h += `${d}.setAttribute('${f}', colorScheme);`);
                return (0, l.jsx)("script", {
                    suppressHydrationWarning: !0,
                    nonce: "u" < typeof window ? m : "",
                    dangerouslySetInnerHTML: {
                        __html: `(function() {
try {
  let colorScheme = '';
  const mode = localStorage.getItem('${n}') || '${t}';
  const dark = localStorage.getItem('${c}-dark') || '${o}';
  const light = localStorage.getItem('${c}-light') || '${r}';
  if (mode === 'system') {
    // handle system mode
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    if (mql.matches) {
      colorScheme = dark
    } else {
      colorScheme = light
    }
  }
  if (mode === 'light') {
    colorScheme = light;
  }
  if (mode === 'dark') {
    colorScheme = dark;
  }
  if (colorScheme) {
    ${h}
  }
} catch(e){}})();`
                    }
                }, "mui-color-scheme-init")
            }({ ...o || (o = r.t(n, 2))
            }).useSyncExternalStore
        },
        9803: (e, t, r) => {
            r.r(t), r.d(t, {
                default: () => u,
                unstable_createUseMediaQuery: () => c
            });
            var o, n = r(12115),
                l = r(78865),
                i = r(67774),
                s = r(78195);
            let a = { ...o || (o = r.t(n, 2))
            }.useSyncExternalStore;

            function c(e = {}) {
                let {
                    themeId: t
                } = e;
                return function(e, r = {}) {
                    let o = (0, s.default)();
                    o && t && (o = o[t] || o);
                    let c = "u" > typeof window && void 0 !== window.matchMedia ? window.matchMedia : null,
                        {
                            defaultMatches: u = !1,
                            matchMedia: d,
                            ssrMatchMedia: m = null,
                            noSsr: h = !1
                        } = (0, i.A)({
                            name: "MuiUseMediaQuery",
                            props: r,
                            theme: o
                        }),
                        f = n.useMemo(() => void 0 !== d ? d : null === c ? null : c.bind(window), [d, c]),
                        p = "function" == typeof e ? e(o) : e;
                    return (p = p.replace(/^@media( ?)/m, "")).includes("print") && console.warn("MUI: You have provided a `print` query to the `useMediaQuery` hook.\nUsing the print media query to modify print styles can lead to unexpected results.\nConsider using the `displayPrint` field in the `sx` prop instead.\nMore information about `displayPrint` on our docs: https://mui.com/system/display/#display-in-print."), (void 0 !== a ? function(e, t, r, o, l) {
                        let i = n.useCallback(() => t, [t]),
                            s = n.useMemo(() => {
                                if (l && r) return () => r(e).matches;
                                if (null !== o) {
                                    let {
                                        matches: t
                                    } = o(e);
                                    return () => t
                                }
                                return i
                            }, [i, e, o, l, r]),
                            [c, u] = n.useMemo(() => {
                                if (null === r) return [i, () => () => {}];
                                let t = r(e);
                                return [() => t.matches, e => (t.addEventListener("change", e), () => {
                                    t.removeEventListener("change", e)
                                })]
                            }, [i, r, e]);
                        return a(u, c, s)
                    } : function(e, t, r, o, i) {
                        let [s, a] = n.useState(() => i && r ? r(e).matches : o ? o(e).matches : t);
                        return (0, l.A)(() => {
                            if (!r) return;
                            let t = r(e),
                                o = () => {
                                    a(t.matches)
                                };
                            return o(), t.addEventListener("change", o), () => {
                                t.removeEventListener("change", o)
                            }
                        }, [e, r]), s
                    })(p, u, f, m, h)
                }
            }
            let u = c()
        },
        18364: (e, t, r) => {
            r.d(t, {
                A: () => o
            });
            let o = r(12115).createContext(null)
        },
        39135: (e, t, r) => {
            r.d(t, {
                default: () => S
            });
            var o = r(12115),
                n = r(29722),
                l = r(20109),
                i = r(34449),
                s = r(97335),
                a = r(24819),
                c = r(66543),
                u = r(67811),
                d = r(10487),
                m = r(34307),
                h = r(95155);
            let f = (0, u.A)(),
                p = (0, a.A)("div", {
                    name: "MuiStack",
                    slot: "Root"
                });

            function y(e) {
                return (0, c.default)({
                    props: e,
                    name: "MuiStack",
                    defaultTheme: f
                })
            }
            let g = ({
                ownerState: e,
                theme: t
            }) => {
                let r = {
                    display: "flex",
                    flexDirection: "column",
                    ...(0, d.NI)({
                        theme: t
                    }, (0, d.kW)({
                        values: e.direction,
                        breakpoints: t.breakpoints.values
                    }), e => ({
                        flexDirection: e
                    }))
                };
                if (e.spacing) {
                    let o = (0, m.LX)(t),
                        n = Object.keys(t.breakpoints.values).reduce((t, r) => (("object" == typeof e.spacing && null != e.spacing[r] || "object" == typeof e.direction && null != e.direction[r]) && (t[r] = !0), t), {}),
                        i = (0, d.kW)({
                            values: e.direction,
                            base: n
                        }),
                        s = (0, d.kW)({
                            values: e.spacing,
                            base: n
                        });
                    "object" == typeof i && Object.keys(i).forEach((e, t, r) => {
                        if (!i[e]) {
                            let o = t > 0 ? i[r[t - 1]] : "column";
                            i[e] = o
                        }
                    }), r = (0, l.A)(r, (0, d.NI)({
                        theme: t
                    }, s, (t, r) => e.useFlexGap ? {
                        gap: (0, m._W)(o, t)
                    } : {
                        "& > :not(style):not(style)": {
                            margin: 0
                        },
                        "& > :not(style) ~ :not(style)": {
                            [`margin${({row:"Left","row-reverse":"Right",column:"Top","column-reverse":"Bottom"})[r?i[r]:e.direction]}`]: (0, m._W)(o, t)
                        }
                    }))
                }
                return (0, d.iZ)(t.breakpoints, r)
            };

            function S(e = {}) {
                let {
                    createStyledComponent: t = p,
                    useThemeProps: r = y,
                    componentName: l = "MuiStack"
                } = e, a = t(g);
                return o.forwardRef(function(e, t) {
                    let c, {
                            component: u = "div",
                            direction: d = "column",
                            spacing: m = 0,
                            divider: f,
                            children: p,
                            className: y,
                            useFlexGap: g = !1,
                            ...S
                        } = r(e),
                        v = (0, s.A)({
                            root: ["root"]
                        }, e => (0, i.Ay)(l, e), {});
                    return (0, h.jsx)(a, {
                        as: u,
                        ownerState: {
                            direction: d,
                            spacing: m,
                            useFlexGap: g
                        },
                        ref: t,
                        className: (0, n.A)(v.root, y),
                        ...S,
                        children: f ? (c = o.Children.toArray(p).filter(Boolean)).reduce((e, t, r) => (e.push(t), r < c.length - 1 && e.push(o.cloneElement(f, {
                            key: `separator-${r}`
                        })), e), []) : p
                    })
                })
            }
        },
        39704: (e, t, r) => {
            r.r(t), r.d(t, {
                DISABLE_CSS_TRANSITION: () => p,
                default: () => y
            });
            var o = r(12115),
                n = r(59594),
                l = r(48728),
                i = r(78865),
                s = r(45761),
                a = r(4219);

            function c() {}
            let u = ({
                key: e,
                storageWindow: t
            }) => (!t && "u" > typeof window && (t = window), {
                get(r) {
                    let o;
                    if ("u" > typeof window) {
                        if (!t) return r;
                        try {
                            o = t.localStorage.getItem(e)
                        } catch {}
                        return o || r
                    }
                },
                set: r => {
                    if (t) try {
                        t.localStorage.setItem(e, r)
                    } catch {}
                },
                subscribe: r => {
                    if (!t) return c;
                    let o = t => {
                        let o = t.newValue;
                        t.key === e && r(o)
                    };
                    return t.addEventListener("storage", o), () => {
                        t.removeEventListener("storage", o)
                    }
                }
            });

            function d() {}

            function m(e) {
                if ("u" > typeof window && "function" == typeof window.matchMedia && "system" === e) return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
            }

            function h(e, t) {
                return "light" === e.mode || "system" === e.mode && "light" === e.systemMode ? t("light") : "dark" === e.mode || "system" === e.mode && "dark" === e.systemMode ? t("dark") : void 0
            }
            var f = r(95155);
            let p = "*{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}";

            function y(e) {
                let {
                    themeId: t,
                    theme: r = {},
                    modeStorageKey: c = a.a$,
                    colorSchemeStorageKey: y = a.EU,
                    disableTransitionOnChange: g = !1,
                    defaultColorScheme: S,
                    resolveTheme: v
                } = e, k = {
                    allColorSchemes: [],
                    colorScheme: void 0,
                    darkColorScheme: void 0,
                    lightColorScheme: void 0,
                    mode: void 0,
                    setColorScheme: () => {},
                    setMode: () => {},
                    systemMode: void 0
                }, b = o.createContext(void 0), w = {}, M = {}, C = "string" == typeof S ? S : S.light, A = "string" == typeof S ? S : S.dark;
                return {
                    CssVarsProvider: function(e) {
                        let {
                            children: k,
                            theme: C,
                            modeStorageKey: A = c,
                            colorSchemeStorageKey: $ = y,
                            disableTransitionOnChange: E = g,
                            storageManager: x,
                            storageWindow: j = "u" < typeof window ? void 0 : window,
                            documentNode: L = "u" < typeof document ? void 0 : document,
                            colorSchemeNode: _ = "u" < typeof document ? void 0 : document.documentElement,
                            disableNestedContext: T = !1,
                            disableStyleSheetGeneration: I = !1,
                            defaultMode: N = "system",
                            forceThemeRerender: R = !1,
                            noSsr: U
                        } = e, W = o.useRef(!1), P = (0, l.A)(), q = o.useContext(b), O = !!q && !T, D = o.useMemo(() => C || ("function" == typeof r ? r() : r), [C]), V = D[t], B = V || D, {
                            colorSchemes: K = w,
                            components: F = M,
                            cssVarPrefix: H
                        } = B, Q = Object.keys(K).filter(e => !!K[e]).join(","), z = o.useMemo(() => Q.split(","), [Q]), G = "string" == typeof S ? S : S.light, X = "string" == typeof S ? S : S.dark, Y = K[G] && K[X] ? N : K[B.defaultColorScheme] ? .palette ? .mode || B.palette ? .mode, {
                            mode: Z,
                            setMode: J,
                            systemMode: ee,
                            lightColorScheme: et,
                            darkColorScheme: er,
                            colorScheme: eo,
                            setColorScheme: en
                        } = function(e) {
                            let {
                                defaultMode: t = "light",
                                defaultLightColorScheme: r,
                                defaultDarkColorScheme: n,
                                supportedColorSchemes: l = [],
                                modeStorageKey: i = a.a$,
                                colorSchemeStorageKey: s = a.EU,
                                storageWindow: c = "u" < typeof window ? void 0 : window,
                                storageManager: f = u,
                                noSsr: p = !1
                            } = e, y = l.join(","), g = l.length > 1, S = o.useMemo(() => f ? .({
                                key: i,
                                storageWindow: c
                            }), [f, i, c]), v = o.useMemo(() => f ? .({
                                key: `${s}-light`,
                                storageWindow: c
                            }), [f, s, c]), k = o.useMemo(() => f ? .({
                                key: `${s}-dark`,
                                storageWindow: c
                            }), [f, s, c]), [b, w] = o.useState(() => {
                                let e = S ? .get(t) || t,
                                    o = v ? .get(r) || r,
                                    l = k ? .get(n) || n;
                                return {
                                    mode: e,
                                    systemMode: m(e),
                                    lightColorScheme: o,
                                    darkColorScheme: l
                                }
                            }), [M, C] = o.useState(p || !g);
                            o.useEffect(() => {
                                C(!0)
                            }, []);
                            let A = h(b, e => "light" === e ? b.lightColorScheme : "dark" === e ? b.darkColorScheme : void 0),
                                $ = o.useCallback(e => {
                                    w(r => {
                                        if (e === r.mode) return r;
                                        let o = e ? ? t;
                                        return S ? .set(o), { ...r,
                                            mode: o,
                                            systemMode: m(o)
                                        }
                                    })
                                }, [S, t]),
                                E = o.useCallback(e => {
                                    e ? "string" == typeof e ? e && !y.includes(e) ? console.error(`\`${e}\` does not exist in \`theme.colorSchemes\`.`) : w(t => {
                                        let r = { ...t
                                        };
                                        return h(t, t => {
                                            "light" === t && (v ? .set(e), r.lightColorScheme = e), "dark" === t && (k ? .set(e), r.darkColorScheme = e)
                                        }), r
                                    }) : w(t => {
                                        let o = { ...t
                                            },
                                            l = null === e.light ? r : e.light,
                                            i = null === e.dark ? n : e.dark;
                                        return l && (y.includes(l) ? (o.lightColorScheme = l, v ? .set(l)) : console.error(`\`${l}\` does not exist in \`theme.colorSchemes\`.`)), i && (y.includes(i) ? (o.darkColorScheme = i, k ? .set(i)) : console.error(`\`${i}\` does not exist in \`theme.colorSchemes\`.`)), o
                                    }) : w(e => (v ? .set(r), k ? .set(n), { ...e,
                                        lightColorScheme: r,
                                        darkColorScheme: n
                                    }))
                                }, [y, v, k, r, n]),
                                x = o.useCallback(e => {
                                    "system" === b.mode && w(t => {
                                        let r = e ? .matches ? "dark" : "light";
                                        return t.systemMode === r ? t : { ...t,
                                            systemMode: r
                                        }
                                    })
                                }, [b.mode]),
                                j = o.useRef(x);
                            return j.current = x, o.useEffect(() => {
                                if ("function" != typeof window.matchMedia || !g) return;
                                let e = (...e) => j.current(...e),
                                    t = window.matchMedia("(prefers-color-scheme: dark)");
                                return t.addListener(e), e(t), () => {
                                    t.removeListener(e)
                                }
                            }, [g]), o.useEffect(() => {
                                if (g) {
                                    let e = S ? .subscribe(e => {
                                            (!e || ["light", "dark", "system"].includes(e)) && $(e || t)
                                        }) || d,
                                        r = v ? .subscribe(e => {
                                            (!e || y.match(e)) && E({
                                                light: e
                                            })
                                        }) || d,
                                        o = k ? .subscribe(e => {
                                            (!e || y.match(e)) && E({
                                                dark: e
                                            })
                                        }) || d;
                                    return () => {
                                        e(), r(), o()
                                    }
                                }
                            }, [E, $, y, t, c, g, S, v, k]), { ...b,
                                mode: M ? b.mode : void 0,
                                systemMode: M ? b.systemMode : void 0,
                                colorScheme: M ? A : void 0,
                                setMode: $,
                                setColorScheme: E
                            }
                        }({
                            supportedColorSchemes: z,
                            defaultLightColorScheme: G,
                            defaultDarkColorScheme: X,
                            modeStorageKey: A,
                            colorSchemeStorageKey: $,
                            defaultMode: Y,
                            storageManager: x,
                            storageWindow: j,
                            noSsr: U
                        }), el = Z, ei = eo;
                        O && (el = q.mode, ei = q.colorScheme);
                        let es = ei || B.defaultColorScheme;
                        B.vars && !R && (es = B.defaultColorScheme);
                        let ea = o.useMemo(() => {
                                let e = B.generateThemeVars ? .() || B.vars,
                                    t = { ...B,
                                        components: F,
                                        colorSchemes: K,
                                        cssVarPrefix: H,
                                        vars: e
                                    };
                                if ("function" == typeof t.generateSpacing && (t.spacing = t.generateSpacing()), es) {
                                    let e = K[es];
                                    e && "object" == typeof e && Object.keys(e).forEach(r => {
                                        e[r] && "object" == typeof e[r] ? t[r] = { ...t[r],
                                            ...e[r]
                                        } : t[r] = e[r]
                                    })
                                }
                                return v ? v(t) : t
                            }, [B, es, F, K, H]),
                            ec = B.colorSchemeSelector;
                        (0, i.A)(() => {
                            if (ei && _ && ec && "media" !== ec) {
                                let e = ec;
                                if ("class" === ec && (e = ".%s"), "data" === ec && (e = "[data-%s]"), ec ? .startsWith("data-") && !ec.includes("%s") && (e = `[${ec}="%s"]`), e.startsWith(".")) _.classList.remove(...z.map(t => e.substring(1).replace("%s", t))), _.classList.add(e.substring(1).replace("%s", ei));
                                else {
                                    let t = e.replace("%s", ei).match(/\[([^\]]+)\]/);
                                    if (t) {
                                        let [e, r] = t[1].split("=");
                                        r || z.forEach(t => {
                                            _.removeAttribute(e.replace(ei, t))
                                        }), _.setAttribute(e, r ? r.replace(/"|'/g, "") : "")
                                    } else _.setAttribute(e, ei)
                                }
                            }
                        }, [ei, ec, _, z]), o.useEffect(() => {
                            let e;
                            if (E && W.current && L) {
                                let t = L.createElement("style");
                                t.appendChild(L.createTextNode(p)), L.head.appendChild(t), window.getComputedStyle(L.body), e = setTimeout(() => {
                                    L.head.removeChild(t)
                                }, 1)
                            }
                            return () => {
                                clearTimeout(e)
                            }
                        }, [ei, E, L]), o.useEffect(() => (W.current = !0, () => {
                            W.current = !1
                        }), []);
                        let eu = o.useMemo(() => ({
                                allColorSchemes: z,
                                colorScheme: ei,
                                darkColorScheme: er,
                                lightColorScheme: et,
                                mode: el,
                                setColorScheme: en,
                                setMode: J,
                                systemMode: ee
                            }), [z, ei, er, et, el, en, J, ee, ea.colorSchemeSelector]),
                            ed = !0;
                        (I || !1 === B.cssVariables || O && P ? .cssVarPrefix === H) && (ed = !1);
                        let em = (0, f.jsxs)(o.Fragment, {
                            children: [(0, f.jsx)(s.default, {
                                themeId: V ? t : void 0,
                                theme: ea,
                                children: k
                            }), ed && (0, f.jsx)(n.A, {
                                styles: ea.generateStyleSheets ? .() || []
                            })]
                        });
                        return O ? em : (0, f.jsx)(b.Provider, {
                            value: eu,
                            children: em
                        })
                    },
                    useColorScheme: () => o.useContext(b) || k,
                    getInitColorSchemeScript: e => (0, a.oR)({
                        colorSchemeStorageKey: y,
                        defaultLightColorScheme: C,
                        defaultDarkColorScheme: A,
                        modeStorageKey: c,
                        ...e
                    })
                }
            }
        },
        45761: (e, t, r) => {
            r.d(t, {
                default: () => S
            });
            var o = r(12115),
                n = r(48728),
                l = r(18364);
            let i = "function" == typeof Symbol && Symbol.for ? Symbol.for("mui.nested") : "__THEME_NESTED__";
            var s = r(95155);
            let a = function(e) {
                let {
                    children: t,
                    theme: r
                } = e, a = (0, n.A)(), c = o.useMemo(() => {
                    var e, t;
                    let o = null === a ? { ...r
                    } : (e = a, "function" == typeof(t = r) ? t(e) : { ...e,
                        ...t
                    });
                    return null != o && (o[i] = null !== a), o
                }, [r, a]);
                return (0, s.jsx)(l.A.Provider, {
                    value: c,
                    children: t
                })
            };
            var c = r(93143),
                u = r(78195),
                d = r(75294),
                m = r(33957),
                h = r(78865),
                f = r(1757),
                p = r(68467);
            let y = {};

            function g(e, t, r, n = !1) {
                return o.useMemo(() => {
                    let o = e && t[e] || t;
                    if ("function" == typeof r) {
                        let l = r(o),
                            i = e ? { ...t,
                                [e]: l
                            } : l;
                        return n ? () => i : i
                    }
                    return e ? { ...t,
                        [e]: r
                    } : { ...t,
                        ...r
                    }
                }, [e, t, r, n])
            }
            let S = function(e) {
                let {
                    children: t,
                    theme: r,
                    themeId: o
                } = e, l = (0, u.default)(y), i = (0, n.A)() || y, S = g(o, l, r), v = g(o, i, r, !0), k = "rtl" === (o ? S[o] : S).direction, b = function(e) {
                    let t = (0, u.default)(),
                        r = (0, f.A)() || "",
                        {
                            modularCssLayers: o
                        } = e,
                        n = "mui.global, mui.components, mui.theme, mui.custom, mui.sx";
                    return (n = o && null === t ? "string" == typeof o ? o.replace(/mui(?!\.)/g, n) : `@layer ${n};` : "", (0, h.A)(() => {
                        let e = document.querySelector("head");
                        if (!e) return;
                        let t = e.firstChild;
                        if (n) {
                            if (t && t.hasAttribute ? .("data-mui-layer-order") && t.getAttribute("data-mui-layer-order") === r) return;
                            let o = document.createElement("style");
                            o.setAttribute("data-mui-layer-order", r), o.textContent = n, e.prepend(o)
                        } else e.querySelector(`style[data-mui-layer-order="${r}"]`) ? .remove()
                    }, [n, r]), n) ? (0, s.jsx)(p.default, {
                        styles: n
                    }) : null
                }(S);
                return (0, s.jsx)(a, {
                    theme: v,
                    children: (0, s.jsx)(c.T.Provider, {
                        value: S,
                        children: (0, s.jsx)(d.default, {
                            value: k,
                            children: (0, s.jsxs)(m.A, {
                                value: o ? S[o].components : S.components,
                                children: [b, t]
                            })
                        })
                    })
                })
            }
        },
        48728: (e, t, r) => {
            r.d(t, {
                A: () => l
            });
            var o = r(12115),
                n = r(18364);

            function l() {
                return o.useContext(n.A)
            }
        }
    }
]);