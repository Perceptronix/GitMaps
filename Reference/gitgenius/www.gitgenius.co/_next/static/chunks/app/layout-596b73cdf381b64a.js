(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
    [7177], {
        4149: (e, t, r) => {
            "use strict";
            r.d(t, {
                default: () => c
            });
            var n = r(73321),
                o = r(37882),
                a = r(12115),
                i = r(34270),
                s = r(37366),
                l = r(66868);

            function c() {
                let e = (0, n.usePathname)(),
                    t = (0, n.useSearchParams)().toString(),
                    {
                        data: r,
                        status: c
                    } = (0, o.useSession)(),
                    u = (0, a.useRef)(!1),
                    d = (0, a.useRef)(!0),
                    p = (0, a.useCallback)((e = !0) => {
                        if ((0, i.gW)() || !(0, s.vP)()) return;
                        let t = "authenticated" === c ? r ? .user ? {
                            id: r.user.id,
                            email: r.user.email,
                            name: r.user.name
                        } : null : null;
                        (0, l.DR)({
                            user: t,
                            trackPageView: e
                        }), u.current = !0
                    }, [r, c]);
                return (0, a.useEffect)(() => {
                    p(!0);
                    let e = () => {
                        p(!0)
                    };
                    return window.addEventListener("gitgenius:analytics-consent", e), () => window.removeEventListener("gitgenius:analytics-consent", e)
                }, [p]), (0, a.useEffect)(() => {
                    if (!(0, i.gW)() && (0, s.vP)()) {
                        if (d.current) {
                            d.current = !1;
                            return
                        }(0, l.Sf)()
                    }
                }, [e, t]), null
            }
        },
        8959: (e, t, r) => {
            "use strict";
            r.d(t, {
                MG: () => o,
                N$: () => a
            });
            var n = r(34270);

            function o() {
                return `window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
window.gtag = window.gtag || gtag;
gtag('consent', 'default', {
  ad_storage: 'denied',
  analytics_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  wait_for_update: 500
});
gtag('set', 'url_passthrough', true);
gtag('set', 'ads_data_redaction', true);`
            }

            function a(e = []) {
                (0, n.gW)() || (window.dataLayer = window.dataLayer || [], "function" != typeof window.gtag && (window.gtag = function() {
                    window.dataLayer.push(arguments)
                }), window.gtag("consent", "update", {
                    ad_storage: e.includes("marketing") ? "granted" : "denied",
                    analytics_storage: e.includes("analytics") ? "granted" : "denied",
                    ad_user_data: e.includes("marketing") ? "granted" : "denied",
                    ad_personalization: e.includes("marketing") ? "granted" : "denied"
                }))
            }
        },
        13666: (e, t, r) => {
            "use strict";
            r.r(t), r.d(t, {
                trackAuthEvent: () => a,
                trackLogin: () => s,
                trackSignUp: () => i
            });
            var n = r(59078),
                o = r(34270);

            function a(e, t = "email", r = null) {
                if ((0, o.gW)()) {
                    r && r();
                    return
                }(0, n.E)(e, {
                    method: t,
                    event_category: "authentication"
                }), r && setTimeout(r, 600)
            }

            function i(e = "email", t = null) {
                a("sign_up", e, t)
            }

            function s(e = "email", t = null) {
                a("login", e, t)
            }
        },
        14658: (e, t, r) => {
            "use strict";
            r.d(t, {
                $k: () => ev,
                Bv: () => x,
                CD: () => g,
                CE: () => h,
                Ck: () => eE,
                Cn: () => f,
                DH: () => en,
                EO: () => eV,
                El: () => V,
                Es: () => W,
                HA: () => eG,
                HW: () => j,
                Hp: () => d,
                IA: () => eL,
                IJ: () => e$,
                Iq: () => eo,
                J7: () => e_,
                JY: () => n,
                Ks: () => A,
                LP: () => G,
                LW: () => eI,
                Lx: () => F,
                M5: () => eF,
                Mi: () => et,
                N2: () => eC,
                NB: () => ep,
                OD: () => p,
                P0: () => er,
                PJ: () => P,
                QQ: () => T,
                S3: () => E,
                SH: () => eO,
                SS: () => I,
                Se: () => ef,
                Su: () => Z,
                T5: () => D,
                TE: () => L,
                TJ: () => O,
                T_: () => y,
                Ty: () => b,
                U0: () => eR,
                Vo: () => eH,
                Vs: () => J,
                Vt: () => eW,
                WR: () => ej,
                XI: () => C,
                XM: () => H,
                YH: () => R,
                YT: () => eT,
                YX: () => S,
                YY: () => $,
                ZB: () => i,
                Zz: () => eB,
                aD: () => es,
                aq: () => ed,
                bk: () => eA,
                br: () => ec,
                cZ: () => w,
                co: () => eu,
                d4: () => eS,
                dd: () => eg,
                eY: () => _,
                fp: () => v,
                g: () => em,
                g0: () => k,
                gn: () => u,
                hO: () => ee,
                hq: () => ew,
                hz: () => ex,
                iy: () => o,
                jT: () => eh,
                jY: () => B,
                kh: () => eU,
                mE: () => eN,
                mo: () => eM,
                nA: () => m,
                nD: () => ez,
                nl: () => N,
                ns: () => ea,
                o3: () => ek,
                pR: () => l,
                q1: () => U,
                qV: () => q,
                rG: () => z,
                rd: () => Y,
                rm: () => eY,
                rn: () => eD,
                rr: () => X,
                sB: () => ei,
                se: () => eb,
                sh: () => ey,
                tC: () => a,
                wH: () => M,
                wp: () => s,
                ws: () => Q,
                xJ: () => K,
                yw: () => c,
                zQ: () => eP,
                zh: () => el
            });
            let n = "APP_LOAD",
                o = "APP_LOAD_ERROR",
                a = "APP_LOAD_SUCCESS",
                i = "SET_SHOW_DRAWER",
                s = "REDIRECT",
                l = "ALLREPOS_PAGE_LOADED",
                c = "ALLREPOS_PAGE_UNLOADED",
                u = "REPOSETTING_SAVED",
                d = "REPOSETTING_PAGE_UNLOADED",
                p = "REPOSETTING_PAGE_LOADED",
                h = "HOME_PAGE_LOADED",
                m = "HOME_PAGE_UNLOADED",
                g = "PROFILE_SAVED",
                f = "PROFILE",
                A = "PROFILE_PAGE_LOADED",
                x = "PROFILE_PAGE_UNLOADED",
                E = "LOGIN",
                y = "LOGOUT",
                _ = "REGISTER",
                O = "LOGINRESET",
                w = "LOGIN_PAGE_LOADED",
                C = "LOGIN_PAGE_UNLOADED",
                b = "LOGINRESET_PAGE_LOADED",
                S = "LOGINRESET_PAGE_LOADED",
                j = "TOKENVERIFY",
                v = "TOKENVERIFY_PAGE_LOADED",
                k = "TOKENVERIFY_PAGE_LOADED",
                D = "RESETPASSWORD_PAGE_SAVED",
                L = "RESETPASSWORD_PAGE_LOADED",
                P = "REGISTER_PAGE_UNLOADED",
                T = "REGISTER_PAGE_LOADED",
                I = "ASYNC_START",
                N = "ASYNC_END",
                U = "UPDATE_FIELD_AUTH",
                G = "UPDATE_PROFILE_FIELD",
                R = "STAROVERVIEW_PAGE_LOADED",
                z = "STAROVERVIEW_PAGE_UNLOADED",
                M = "SUBOVERVIEW_PAGE_LOADED",
                B = "SUBOVERVIEW_PAGE_UNLOADED",
                W = "FOLLOWERS_PAGE_LOADED",
                F = "FOLLOWERS_PAGE_UNLOADED",
                $ = "REPOSUBSCRIBERS_PAGE_LOADED",
                Y = "REPOSUBSCRIBERS_PAGE_UNLOADED",
                H = "REPODETAILS_PAGE_LOADED",
                V = "REPODETAILS_PAGE_UNLOADED",
                J = "PRIVACY_PAGE_LOADED",
                q = "PRIVACY_PAGE_UNLOADED",
                Q = "TERMSOFSERVICE_PAGE_LOADED",
                X = "TERMSOFSERVICE_PAGE_UNLOADED",
                K = "COOKIEPOLICY_PAGE_LOADED",
                Z = "COOKIEPOLICY_PAGE_UNLOADED",
                ee = "CONTACTUS_PAGE_LOADED",
                et = "CONTACTUS_PAGE_UNLOADED",
                er = "NOTIFICATIONS_SAVED",
                en = "NOTIFICATIONS_PAGE_LOADED",
                eo = "NOTIFICATIONS_PAGE_UNLOADED",
                ea = "ADMINMAIN_PAGE_LOADED",
                ei = "ADMINMAIN_PAGE_UNLOADED",
                es = "LOOKUPUSER_PAGE_LOADED",
                el = "LOOKUPUSER_PAGE_UNLOADED",
                ec = "LOOKUPREPO_PAGE_LOADED",
                eu = "LOOKUPREPO_PAGE_UNLOADED",
                ed = "ABOUT_PAGE_LOADED",
                ep = "ABOUT_PAGE_UNLOADED",
                eh = "COLECTIONSHOME_PAGE_LOADED",
                em = "COLECTIONSHOME_PAGE_UNLOADED",
                eg = "COLECTIONK8S_PAGE_LOADED",
                ef = "COLECTIONSAI_PAGE_LOADED",
                eA = "COLECTIONSAI_PAGE_UNLOADED",
                ex = "COLECTIONSML_PAGE_LOADED",
                eE = "COLECTIONSML_PAGE_UNLOADED",
                ey = "COLECTIONSGG_PAGE_LOADED",
                e_ = "COLECTIONSGG_PAGE_UNLOADED",
                eO = "COLECTIONSGITAC_PAGE_LOADED",
                ew = "COLECTIONSGITAC_PAGE_UNLOADED",
                eC = "COLECTIONSJSF_PAGE_LOADED",
                eb = "COLECTIONSJSF_PAGE_UNLOADED",
                eS = "COLECTIONSCNT_PAGE_LOADED",
                ej = "COLECTIONSCNT_PAGE_UNLOADED",
                ev = "COLECTIONSDB_PAGE_UNLOADED",
                ek = "COLECTIONSDB_PAGE_LOADED",
                eD = "COLECTIONSELT_PAGE_LOADED",
                eL = "COLECTIONSELT_PAGE_UNLOADED",
                eP = "COLECTIOPYTHON_PAGE_LOADED",
                eT = "COLECTIOPYTHON_PAGE_UNLOADED",
                eI = "COLECTIONSCLOUD_PAGE_LOADED",
                eN = "COLECTIONSCLOUD_PAGE_UNLOADED",
                eU = "COLECTIONSDEVTOOLS_PAGE_LOADED",
                eG = "COLECTIONSDEVTOOLS_PAGE_UNLOADED",
                eR = "COLECTIONSAPIMS_PAGE_LOADED",
                ez = "COLECTIONSAPIMS_PAGE_UNLOADED",
                eM = "COLECTIONSOBS_PAGE_LOADED",
                eB = "COLECTIONSOBS_PAGE_UNLOADED",
                eW = "COLECTIONSSEC_PAGE_LOADED",
                eF = "COLECTIONSSEC_PAGE_UNLOADED",
                e$ = "NOT_FOUND_PAGE_UNLOADED",
                eY = "NOT_FOUND_PAGE_LOADED",
                eH = "TRENDING_PAGE_UNLOADED",
                eV = "TRENDING_PAGE_LOADED"
        },
        16728: (e, t, r) => {
            "use strict";
            r.d(t, {
                MS: () => i,
                UQ: () => a,
                WG: () => n
            });
            let n = "external-js-script",
                o = "4O7Z0HJX8QNX",
                a = `https://s3-us-west-2.amazonaws.com/b2bjsstore/b/${o}/${o}.js.gz`,
                i = !0
        },
        22143: (e, t, r) => {
            "use strict";
            r.d(t, {
                THEME_COOKIE: () => o,
                default: () => s,
                o: () => i
            });
            var n = r(12115);
            let o = "mui-mode";

            function a(e) {
                document.documentElement.setAttribute("data-mui-color-scheme", e), document.documentElement.setAttribute("data-theme", e)
            }

            function i(e) {
                document.cookie = `${o}=${e};path=/;max-age=31536000;SameSite=Lax`
            }

            function s() {
                return (0, n.useEffect)(() => {
                    ! function() {
                        try {
                            let e = localStorage.getItem(o);
                            if ("light" === e || "dark" === e) return a(e), i(e), e
                        } catch {}
                        a("dark")
                    }()
                }, []), null
            }
        },
        28155: (e, t, r) => {
            "use strict";

            function n() {
                return "/api"
            }
            r.d(t, {
                A: () => n
            }), r(41463)
        },
        29999: (e, t, r) => {
            "use strict";
            r.d(t, {
                default: () => p
            }), r(34337), r(62202);
            var n = r(28683),
                o = r(12115),
                a = r(5212),
                i = r(61838),
                s = r(8959),
                l = r(34270),
                c = r(66868);
            let u = "";

            function d(e) {
                let t = [...e].sort().join(",");
                t !== u && (u = t, (0, s.N$)(e), e.includes("analytics") ? (0, c.DR)({
                    categories: e,
                    trackPageView: !0
                }) : (0, c.y_)(e), window.dispatchEvent(new CustomEvent("gitgenius:analytics-consent", {
                    detail: {
                        categories: e
                    }
                })))
            }

            function p() {
                let e = "dark" === (0, n.default)().palette.mode;
                return (0, o.useEffect)(() => {
                    document.documentElement.setAttribute("data-cc-theme", e ? "dark" : "light"), window.CookieConsent = a, a.run({
                        guiOptions: {
                            consentModal: {
                                layout: "box inline",
                                position: "bottom center",
                                equalWeightButtons: !1,
                                flipButtons: !1
                            },
                            preferencesModal: {
                                layout: "box",
                                position: "right",
                                equalWeightButtons: !1,
                                flipButtons: !1
                            }
                        },
                        onFirstConsent: ({
                            cookie: e
                        }) => {
                            !i.F || (0, l.gW)() || d(e.categories)
                        },
                        onConsent: ({
                            cookie: e
                        }) => {
                            !i.F || (0, l.gW)() || d(e.categories)
                        },
                        onChange: ({
                            _changedCategories: e,
                            _changedServices: t
                        }) => {
                            !i.F || (0, l.gW)() || d(a.getCookie().categories)
                        },
                        categories: {
                            necessary: {
                                enabled: !0,
                                readOnly: !0
                            },
                            analytics: {
                                enabled: !1,
                                autoClear: {
                                    cookies: [{
                                        name: /^(_ga|_gid)/
                                    }]
                                }
                            },
                            marketing: {
                                enabled: !1
                            }
                        },
                        language: {
                            default: "en",
                            translations: {
                                en: {
                                    consentModal: {
                                        title: "\uD83C\uDF6A Help us improve",
                                        description: 'We use cookies to give you the best experience and help us understand how to improve GitGenius. By clicking "Accept", you agree to our use of cookies.',
                                        acceptAllBtn: "Accept All",
                                        acceptNecessaryBtn: "Only Essential",
                                        showPreferencesBtn: "Customize",
                                        footer: `
                <a href="/privacy">Privacy Policy</a>
                <a href="/cookie-policy">Cookie Policy</a>
              `
                                    },
                                    preferencesModal: {
                                        title: "Cookie Preferences",
                                        acceptAllBtn: "Accept all",
                                        acceptNecessaryBtn: "Reject all",
                                        savePreferencesBtn: "Save preferences",
                                        closeIconLabel: "Close",
                                        serviceCounterLabel: "Service|Services",
                                        sections: [{
                                            title: "Cookie Usage",
                                            description: "We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. Choose which types of cookies you want to allow."
                                        }, {
                                            title: "Strictly Necessary Cookies",
                                            description: "These cookies are essential for the website to function properly. They enable core functionality such as security, network management, and accessibility.",
                                            linkedCategory: "necessary"
                                        }, {
                                            title: "Analytics Cookies",
                                            description: "These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve the website.",
                                            linkedCategory: "analytics",
                                            cookieTable: {
                                                headers: {
                                                    name: "Cookie",
                                                    domain: "Domain",
                                                    description: "Description",
                                                    expiration: "Expiration"
                                                },
                                                body: [{
                                                    name: "_ga",
                                                    domain: "gitgenius.co",
                                                    description: "Google Analytics - Used to distinguish users",
                                                    expiration: "2 years"
                                                }, {
                                                    name: "_gid",
                                                    domain: "gitgenius.co",
                                                    description: "Google Analytics - Used to distinguish users",
                                                    expiration: "24 hours"
                                                }]
                                            }
                                        }, {
                                            title: "Marketing Cookies",
                                            description: "These cookies are used to track visitors across websites to display relevant advertisements.",
                                            linkedCategory: "marketing"
                                        }, {
                                            title: "More information",
                                            description: 'For any queries in relation to our policy on cookies and your choices, please <a href="/contact">contact us</a>.'
                                        }]
                                    }
                                }
                            }
                        }
                    });
                    try {
                        let e = a.getCookie() ? .categories || [];
                        e.length > 0 && d(e)
                    } catch {}
                }, [e]), null
            }
        },
        32169: (e, t, r) => {
            "use strict";
            r.d(t, {
                default: () => es
            });
            var n = r(95155),
                o = r(97669),
                a = r(44662),
                i = r(75434),
                s = r(19430),
                l = r(59439),
                c = r(6917),
                u = r(85907),
                d = r(90058),
                p = r(15359),
                h = r(1107),
                m = r(63879),
                g = r(12129),
                f = r(27966),
                A = r(62402),
                x = r(87296),
                E = r(22821),
                y = r(9098),
                _ = r(65013),
                O = r(2847),
                w = r(86670),
                C = r(28683),
                b = r(5772),
                S = r(98500),
                j = r.n(S),
                v = r(37882),
                k = r(14051),
                D = r.n(k),
                L = r(12115),
                P = r(2834),
                T = r(36459);
            let I = {
                src: "https://www.gitgenius.co/_next/static/media/headerlogo.9e3970c9.webp",
                height: 150,
                width: 150,
                blurDataURL: "data:image/webp;base64,UklGRqoAAABXRUJQVlA4WAoAAAAQAAAABwAABwAAQUxQSDcAAAABYBvZtpLzcc3cqqIAInJtgCYt1PBHtCA1RMQE8B1X6ksut8YE8Nr9TgGjnp8Skl1OAVCMPr8BAFZQOCBMAAAAsAEAnQEqCAAIAAJAOCWwAnRH/4LAAAD+2l6R64AN4zSR8XCiud/X96P0vAywKkAONPwjwZXUP//xifX6oqdskfHc/+CH8807XA+QAA==",
                blurWidth: 8,
                blurHeight: 8
            };
            var N = r(88424),
                U = r(27716),
                G = r(39734),
                R = r(53420),
                z = r(7396),
                M = r(20961),
                B = r(58687),
                W = r(91425),
                F = r(66505),
                $ = r(14658);
            let Y = function({
                currentUser: e
            }) {
                let [t, r] = L.useState(null), [o, a] = L.useState(null), i = !!o, s = (0, P.wA)(), {
                    toggleColorMode: l,
                    mode: c
                } = (0, F.G)(), u = e => {
                    r(e.currentTarget)
                }, d = () => {
                    r(null)
                }, p = () => {
                    a(null)
                };
                return (0, n.jsxs)("div", {
                    children: [(0, n.jsxs)(f.default, {
                        sx: {
                            float: "right",
                            flexGrow: 1,
                            display: {
                                xs: "none",
                                md: "flex"
                            }
                        },
                        children: [(0, n.jsx)(z.default, {
                            "aria-label": "About",
                            component: j(),
                            href: "/about",
                            sx: {
                                my: 2,
                                display: "block",
                                marginRight: 2,
                                fontSize: "0.75em"
                            },
                            children: "About"
                        }), (0, n.jsx)(z.default, {
                            "aria-label": "FAQ",
                            component: j(),
                            href: "/faq",
                            sx: {
                                my: 2,
                                display: "block",
                                marginRight: 2,
                                fontSize: "0.75em"
                            },
                            children: "FAQ"
                        }), (0, n.jsx)(z.default, {
                            "aria-label": "Blog",
                            component: j(),
                            href: "/blog",
                            sx: {
                                my: 2,
                                display: "block",
                                marginRight: 2,
                                fontSize: "0.75em"
                            },
                            children: "Blog"
                        }), (0, n.jsxs)(z.default, {
                            id: "analytics-menu",
                            "aria-controls": i ? "analytics-positioned-menu" : void 0,
                            "aria-haspopup": "true",
                            "aria-label": "Insights",
                            "aria-expanded": i ? "true" : void 0,
                            onClick: e => {
                                a(e.currentTarget)
                            },
                            sx: {
                                my: 2,
                                display: "block",
                                marginRight: 2,
                                fontSize: "0.75em"
                            },
                            children: ["Insights", (0, n.jsx)(G.A, {
                                sx: {
                                    fontSize: "0.8em",
                                    verticalAlign: "middle"
                                }
                            })]
                        }), (0, n.jsxs)(M.A, {
                            id: "analytics-menu",
                            "aria-labelledby": "analytics-positioned-button",
                            "aria-label": "insights-menu",
                            anchorEl: o,
                            open: i,
                            onClose: p,
                            anchorOrigin: {
                                vertical: "bottom",
                                horizontal: "center"
                            },
                            transformOrigin: {
                                vertical: "top",
                                horizontal: "center"
                            },
                            children: [(0, n.jsx)(B.A, {
                                component: j(),
                                onClick: p,
                                href: "/analytics",
                                "aria-label": "Overview",
                                children: "Overview"
                            }), (0, n.jsx)(B.A, {
                                component: j(),
                                onClick: p,
                                href: "/analytics/influentialusers",
                                "aria-label": "Influential Users",
                                children: "Influential Users"
                            }), (0, n.jsx)(B.A, {
                                component: j(),
                                onClick: p,
                                href: "/issues",
                                "aria-label": "Trending Issues",
                                children: "Trending Issues"
                            }), (0, n.jsx)(B.A, {
                                component: j(),
                                onClick: p,
                                href: "/trending",
                                "aria-label": "Trending Repos",
                                children: "Trending Repos"
                            }), (0, n.jsx)(O.default, {
                                sx: {
                                    my: 1
                                }
                            }), (0, n.jsx)(B.A, {
                                component: j(),
                                onClick: p,
                                href: "/lookuprepo",
                                "aria-label": "Lookup Repository",
                                children: "Lookup Repository"
                            }), (0, n.jsx)(B.A, {
                                component: j(),
                                onClick: p,
                                href: "/lookupuser",
                                "aria-label": "Lookup User",
                                children: "Lookup User"
                            })]
                        }), [{
                            label: "Collections",
                            href: "/collections"
                        }, {
                            label: "Contact Us",
                            href: "/contact"
                        }].map(({
                            label: e,
                            href: t
                        }) => (0, n.jsx)(z.default, {
                            "aria-label": e,
                            component: j(),
                            href: t,
                            sx: {
                                my: 2,
                                display: "block",
                                marginRight: 2,
                                fontSize: "0.75em"
                            },
                            children: e
                        }, e)), (0, n.jsx)(z.default, {
                            "aria-label": "Sponsor",
                            component: j(),
                            href: "/sponsor",
                            variant: "contained",
                            sx: {
                                my: 1.5,
                                ml: .5,
                                mr: 1.5,
                                px: 1.75,
                                minWidth: 0,
                                fontSize: "0.75rem",
                                textTransform: "none",
                                whiteSpace: "nowrap",
                                backgroundColor: "#34a853",
                                "&:hover": {
                                    backgroundColor: "#2d9148"
                                }
                            },
                            children: "Sponsor"
                        }), (0, n.jsxs)(z.default, {
                            "aria-label": "Account Menu",
                            "aria-controls": "fade-menu",
                            "aria-haspopup": "true",
                            onClick: u,
                            children: [(0, n.jsx)(N.A, {}), " ", (0, n.jsx)(G.A, {})]
                        }), (0, n.jsx)(y.A, {
                            title: "Toggle Light/Dark Mode",
                            children: (0, n.jsx)(m.A, {
                                "aria-label": "mode",
                                onClick: l,
                                sx: {
                                    color: "#90caf9"
                                },
                                children: "dark" === c ? (0, n.jsx)(U.A, {}) : (0, n.jsx)(R.A, {})
                            })
                        })]
                    }), (0, n.jsxs)(f.default, {
                        sx: {
                            float: "right",
                            flexGrow: 1,
                            display: {
                                xs: "flex",
                                md: "none"
                            }
                        },
                        children: [(0, n.jsxs)(z.default, {
                            "aria-controls": "fade-menu",
                            "aria-label": "Account Menu",
                            "aria-haspopup": "true",
                            onClick: u,
                            children: [(0, n.jsx)(N.A, {}), " ", (0, n.jsx)(G.A, {})]
                        }), (0, n.jsx)(y.A, {
                            title: "Toggle Light/Dark Mode",
                            children: (0, n.jsx)(m.A, {
                                "aria-label": "mode",
                                onClick: l,
                                sx: {
                                    color: "#90caf9"
                                },
                                children: "dark" === c ? (0, n.jsx)(U.A, {}) : (0, n.jsx)(R.A, {})
                            })
                        })]
                    }), (0, n.jsxs)(M.A, {
                        id: "fade-menu",
                        anchorEl: t,
                        keepMounted: !0,
                        open: !!t,
                        onClose: d,
                        slots: {
                            transition: W.A
                        },
                        children: [e && (0, n.jsx)(x.Ay, {
                            children: e.username
                        }), (0, n.jsx)(O.default, {}), (0, n.jsx)(B.A, {
                            "aria-label": "Profile",
                            component: j(),
                            href: "/profile",
                            onClick: d,
                            children: "Profile"
                        }), (0, n.jsx)(O.default, {}), [{
                            label: "About",
                            href: "/about"
                        }, {
                            label: "FAQ",
                            href: "/faq"
                        }, {
                            label: "Blog",
                            href: "/blog"
                        }, {
                            label: "Insights",
                            href: "/analytics"
                        }, {
                            label: "Collections",
                            href: "/collections"
                        }, {
                            label: "Contact Us",
                            href: "/contact"
                        }, {
                            label: "Sponsor",
                            href: "/sponsor"
                        }].map(({
                            label: e,
                            href: t
                        }) => (0, n.jsx)(B.A, {
                            "aria-label": e,
                            component: j(),
                            href: t,
                            sx: {
                                display: {
                                    xs: "flex",
                                    md: "none"
                                }
                            },
                            onClick: d,
                            children: e
                        }, e)), (0, n.jsx)(O.default, {
                            sx: {
                                display: {
                                    xs: "flex",
                                    md: "none"
                                }
                            }
                        }), (0, n.jsx)(B.A, {
                            "aria-label": "Logout",
                            onClick: () => {
                                (0, v.signOut)({
                                    callbackUrl: "/login"
                                }), s({
                                    type: $.T_
                                }), d()
                            },
                            children: "Logout"
                        })]
                    })]
                })
            };
            var H = r(19396);
            let V = () => {
                let e = (0, C.default)(),
                    [t, r] = L.useState(null),
                    [o, a] = L.useState(null),
                    i = () => r(null),
                    s = () => a(null),
                    l = !!o,
                    {
                        toggleColorMode: c,
                        mode: u
                    } = (0, F.G)();
                return (0, n.jsxs)("div", {
                    children: [(0, n.jsxs)(f.default, {
                        sx: {
                            float: "right",
                            flexGrow: 1,
                            display: {
                                xs: "flex",
                                md: "none"
                            }
                        },
                        children: [(0, n.jsx)(m.A, {
                            size: "large",
                            "aria-label": "account of current user",
                            "aria-controls": "menu-appbar",
                            "aria-haspopup": "true",
                            onClick: e => r(e.currentTarget),
                            sx: {
                                color: `${e.palette.text.primary} !important`
                            },
                            children: (0, n.jsx)(H.A, {})
                        }), (0, n.jsxs)(M.A, {
                            id: "menu-appbar",
                            anchorEl: t,
                            anchorOrigin: {
                                vertical: "bottom",
                                horizontal: "left"
                            },
                            keepMounted: !0,
                            transformOrigin: {
                                vertical: "top",
                                horizontal: "left"
                            },
                            open: !!t,
                            onClose: i,
                            sx: {
                                display: {
                                    xs: "block",
                                    md: "none"
                                }
                            },
                            children: [(0, n.jsx)(B.A, {
                                component: j(),
                                onClick: i,
                                href: "/about",
                                children: "About"
                            }), (0, n.jsx)(B.A, {
                                component: j(),
                                onClick: i,
                                href: "/faq",
                                children: "FAQ"
                            }), (0, n.jsx)(B.A, {
                                component: j(),
                                onClick: i,
                                href: "/blog",
                                children: "Blog"
                            }), (0, n.jsx)(B.A, {
                                "aria-label": "Collections",
                                component: j(),
                                onClick: i,
                                href: "/collections",
                                children: "Collections"
                            }), (0, n.jsx)(O.default, {}), (0, n.jsx)(B.A, {
                                component: j(),
                                onClick: s,
                                href: "/analytics",
                                "aria-label": "Analytics",
                                children: "Analytics"
                            }), (0, n.jsx)(O.default, {}), (0, n.jsx)(B.A, {
                                component: j(),
                                onClick: i,
                                href: "/lookuprepo",
                                "aria-label": "Lookup a Repo",
                                children: "Lookup a Repo"
                            }), (0, n.jsx)(B.A, {
                                component: j(),
                                onClick: i,
                                href: "/lookupuser",
                                "aria-label": "Lookup a User",
                                children: "Lookup a User"
                            }), (0, n.jsx)(O.default, {}), (0, n.jsx)(B.A, {
                                component: j(),
                                onClick: i,
                                href: "/contact",
                                "aria-label": "Contact Us",
                                children: "Contact Us"
                            }), (0, n.jsx)(B.A, {
                                component: j(),
                                onClick: i,
                                href: "/sponsor",
                                "aria-label": "Sponsor",
                                children: "Sponsor"
                            }), (0, n.jsx)(O.default, {}), (0, n.jsx)(B.A, {
                                "aria-label": "Login",
                                component: j(),
                                onClick: i,
                                href: "/login",
                                "data-mp-track": "sign-in",
                                "data-mp-source": "nav_mobile",
                                children: "Login"
                            }), (0, n.jsx)(B.A, {
                                component: j(),
                                onClick: i,
                                href: "/register",
                                "aria-label": "Sign Up",
                                children: "Sign Up"
                            })]
                        })]
                    }), (0, n.jsxs)(f.default, {
                        sx: {
                            float: "right",
                            flexGrow: 1,
                            display: {
                                xs: "none",
                                md: "flex"
                            },
                            whiteSpace: "nowrap"
                        },
                        children: [(0, n.jsx)(z.default, {
                            component: j(),
                            href: "/about",
                            "aria-label": "About",
                            sx: {
                                my: 2,
                                display: "block",
                                marginRight: "10px",
                                fontSize: "0.75rem",
                                color: `${e.palette.text.primary} !important`
                            },
                            children: "About"
                        }), (0, n.jsx)(z.default, {
                            component: j(),
                            href: "/faq",
                            "aria-label": "FAQ",
                            sx: {
                                my: 2,
                                display: "block",
                                marginRight: "10px",
                                fontSize: "0.75rem",
                                color: `${e.palette.text.primary} !important`
                            },
                            children: "FAQ"
                        }), (0, n.jsx)(z.default, {
                            component: j(),
                            href: "/blog",
                            "aria-label": "Blog",
                            sx: {
                                my: 2,
                                display: "block",
                                marginRight: "10px",
                                fontSize: "0.75rem",
                                color: `${e.palette.text.primary} !important`
                            },
                            children: "Blog"
                        }), (0, n.jsxs)(z.default, {
                            id: "analytics-menu",
                            "aria-controls": l ? "analytics-positioned-menu" : void 0,
                            "aria-haspopup": "true",
                            "aria-label": "Insights",
                            "aria-expanded": l ? "true" : void 0,
                            onClick: e => a(e.currentTarget),
                            sx: {
                                fontSize: "0.8rem",
                                color: `${e.palette.text.primary} !important`
                            },
                            children: ["Insights", (0, n.jsx)(G.A, {})]
                        }), (0, n.jsxs)(M.A, {
                            id: "analytics-menu",
                            "aria-labelledby": "analytics-positioned-button",
                            "aria-label": "insights-menu",
                            anchorEl: o,
                            open: l,
                            onClose: s,
                            anchorOrigin: {
                                vertical: "bottom",
                                horizontal: "center"
                            },
                            transformOrigin: {
                                vertical: "top",
                                horizontal: "center"
                            },
                            children: [(0, n.jsx)(z.default, {
                                component: j(),
                                onClick: s,
                                href: "/analytics",
                                "aria-label": "Analytics Overview",
                                sx: {
                                    display: "block",
                                    fontSize: "0.75rem"
                                },
                                children: "Overview"
                            }), (0, n.jsx)(z.default, {
                                component: j(),
                                onClick: s,
                                href: "/issues",
                                "aria-label": "Issues Activity",
                                sx: {
                                    display: "block",
                                    fontSize: "0.75rem"
                                },
                                children: "Issues Activity"
                            }), (0, n.jsx)(z.default, {
                                component: j(),
                                onClick: s,
                                href: "/analytics/influentialusers",
                                "aria-label": "Influential Users",
                                sx: {
                                    display: "block",
                                    fontSize: "0.75rem"
                                },
                                children: "Influential Users"
                            }), (0, n.jsx)(z.default, {
                                component: j(),
                                onClick: s,
                                href: "/trending",
                                "aria-label": "Trending",
                                sx: {
                                    display: "block",
                                    fontSize: "0.75rem"
                                },
                                children: "Trending Repos"
                            }), (0, n.jsx)(O.default, {
                                sx: {
                                    my: 1
                                }
                            }), (0, n.jsx)(z.default, {
                                component: j(),
                                onClick: s,
                                href: "/lookuprepo",
                                "aria-label": "Lookup Repo",
                                sx: {
                                    display: "block",
                                    fontSize: "0.75rem"
                                },
                                children: "Lookup Repo"
                            }), (0, n.jsx)(z.default, {
                                component: j(),
                                onClick: s,
                                href: "/lookupuser",
                                "aria-label": "Lookup User",
                                sx: {
                                    display: "block",
                                    fontSize: "0.75rem"
                                },
                                children: "Lookup User"
                            })]
                        }), (0, n.jsx)(z.default, {
                            component: j(),
                            href: "/collections",
                            "aria-label": "Collections",
                            sx: {
                                my: 2,
                                display: "block",
                                marginRight: "10px",
                                fontSize: "0.75rem",
                                color: `${e.palette.text.primary} !important`
                            },
                            children: "Collections"
                        }), (0, n.jsx)(z.default, {
                            component: j(),
                            onClick: i,
                            href: "/contact",
                            "aria-label": "Contact Us",
                            sx: {
                                my: 2,
                                display: "block",
                                marginRight: "10px",
                                fontSize: "0.75rem",
                                color: `${e.palette.text.primary} !important`
                            },
                            children: "Contact Us"
                        }), (0, n.jsx)(z.default, {
                            component: j(),
                            href: "/login",
                            "aria-label": "Login",
                            "data-mp-track": "sign-in",
                            "data-mp-source": "nav_desktop",
                            sx: {
                                my: 2,
                                display: "block",
                                fontSize: "0.75rem",
                                color: `${e.palette.text.primary} !important`
                            },
                            children: "Login"
                        }), (0, n.jsx)(z.default, {
                            component: j(),
                            href: "/sponsor",
                            "aria-label": "Sponsor",
                            sx: {
                                my: 2,
                                display: "block",
                                fontSize: "0.75rem",
                                color: `${e.palette.text.primary} !important`
                            },
                            children: "Sponsor"
                        }), (0, n.jsx)(z.default, {
                            component: j(),
                            href: "/register",
                            "aria-label": "Sign Up",
                            variant: "contained",
                            "data-mp-track": "cta",
                            "data-mp-label": "Sign up free",
                            "data-mp-source": "nav_desktop",
                            sx: {
                                my: 1.5,
                                ml: 1,
                                mr: 1,
                                px: 1.75,
                                minWidth: 0,
                                fontSize: "0.75rem",
                                textTransform: "none",
                                whiteSpace: "nowrap",
                                backgroundColor: "#34a853",
                                "&:hover": {
                                    backgroundColor: "#2d9148"
                                }
                            },
                            children: "Sign up free"
                        }), (0, n.jsx)(y.A, {
                            title: "Toggle Light/Dark Mode",
                            children: (0, n.jsx)(m.A, {
                                "aria-label": "mode",
                                onClick: c,
                                sx: {
                                    color: "#90caf9"
                                },
                                children: "dark" === u ? (0, n.jsx)(U.A, {}) : (0, n.jsx)(R.A, {})
                            })
                        })]
                    })]
                })
            };
            var J = r(56636);
            let q = e => {
                let [t, r] = (0, L.useState)(!1);
                (0, L.useEffect)(() => {
                    r(!0)
                }, []);
                let o = (0, L.useMemo)(() => {
                    if (e.Repos && e.Repos.Repolist) try {
                        let t = JSON.parse(e.Repos.Repolist),
                            r = Array.from({
                                length: t.length
                            }, (e, t) => t).map(e => ({
                                id: `repo-${e}`,
                                user: `${t[e].user}`,
                                reponames: t[e].reponames
                            })),
                            n = [];
                        return r.forEach(e => {
                            e.reponames.forEach(t => {
                                let r = `${e.user}/${t}`;
                                n.push({
                                    fullname: r,
                                    key: `${r}-${e.user}`,
                                    ruser: e.user,
                                    rname: t,
                                    title: r,
                                    href: r
                                })
                            })
                        }), n
                    } catch (e) {
                        console.error("Error parsing or processing Repolist:", e)
                    }
                    return []
                }, [e.Repos]);
                return t ? (0, n.jsx)(n.Fragment, {
                    children: o.map(({
                        key: e,
                        rname: t,
                        ruser: r,
                        fullname: o
                    }) => (0, n.jsxs)(x.Ay, {
                        title: t,
                        component: j(),
                        href: `/repos/${o}`,
                        dense: !0,
                        children: [(0, n.jsx)(E.A, {
                            children: (0, n.jsx)(y.A, {
                                title: o,
                                children: (0, n.jsx)(J.A, {})
                            })
                        }), (0, n.jsx)(_.A, {
                            inset: !1,
                            primary: t,
                            secondary: r,
                            sx: {
                                maxWidth: "200px",
                                whiteSpace: "wrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                            }
                        })]
                    }, e))
                }) : null
            };
            var Q = r(88078),
                X = r(89894),
                K = r(70668),
                Z = r(61315);

            function ee() {
                let [e, t] = L.useState(!1);
                return (0, n.jsxs)(n.Fragment, {
                    children: [(0, n.jsxs)(Z.A, {
                        onClick: () => {
                            t(!e)
                        },
                        children: [(0, n.jsx)(E.A, {
                            children: (0, n.jsx)(X.A, {})
                        }), (0, n.jsx)(_.A, {
                            primary: "Settings"
                        }), e ? (0, n.jsx)(Q.A, {}) : (0, n.jsx)(G.A, {})]
                    }), (0, n.jsx)(K.A, { in: e,
                        timeout: "auto",
                        unmountOnExit: !0,
                        children: (0, n.jsxs)(A.A, {
                            component: "div",
                            disablePadding: !0,
                            children: [(0, n.jsxs)(x.Ay, {
                                component: j(),
                                href: "/notificationsettings",
                                sx: {
                                    pl: 4
                                },
                                children: [(0, n.jsx)(E.A, {
                                    children: (0, n.jsx)(y.A, {
                                        title: "Notification settings",
                                        children: (0, n.jsx)(X.A, {})
                                    })
                                }), (0, n.jsx)(_.A, {
                                    primary: "Notification settings"
                                })]
                            }, "notifications"), (0, n.jsxs)(x.Ay, {
                                component: j(),
                                href: "/reposettings",
                                sx: {
                                    pl: 4
                                },
                                children: [(0, n.jsx)(E.A, {
                                    children: (0, n.jsx)(y.A, {
                                        title: "Repo settings",
                                        children: (0, n.jsx)(X.A, {})
                                    })
                                }), (0, n.jsx)(_.A, {
                                    primary: "Repo settings"
                                })]
                            }, "RepoSettings")]
                        })
                    })]
                })
            }
            var et = r(55788);

            function er() {
                let [e, t] = L.useState(!1);
                return (0, n.jsxs)(n.Fragment, {
                    children: [(0, n.jsxs)(Z.A, {
                        onClick: () => {
                            t(!e)
                        },
                        children: [(0, n.jsx)(E.A, {
                            children: (0, n.jsx)(et.A, {})
                        }), (0, n.jsx)(_.A, {
                            primary: "Insights"
                        }), e ? (0, n.jsx)(Q.A, {}) : (0, n.jsx)(G.A, {})]
                    }), (0, n.jsx)(K.A, { in: e,
                        timeout: "auto",
                        unmountOnExit: !0,
                        children: (0, n.jsxs)(A.A, {
                            component: "div",
                            disablePadding: !0,
                            children: [(0, n.jsxs)(x.Ay, {
                                component: j(),
                                href: "/lookuprepo",
                                sx: {
                                    pl: 4
                                },
                                children: [(0, n.jsx)(E.A, {
                                    children: (0, n.jsx)(y.A, {
                                        title: "Lookup Repository",
                                        children: (0, n.jsx)(et.A, {})
                                    })
                                }), (0, n.jsx)(_.A, {
                                    primary: "Lookup Repository"
                                })]
                            }, "lookuprepo"), (0, n.jsxs)(x.Ay, {
                                component: j(),
                                href: "/lookupuser",
                                sx: {
                                    pl: 4
                                },
                                children: [(0, n.jsx)(E.A, {
                                    children: (0, n.jsx)(y.A, {
                                        title: "Lookup User",
                                        children: (0, n.jsx)(et.A, {})
                                    })
                                }), (0, n.jsx)(_.A, {
                                    primary: "Lookup User"
                                })]
                            }, "lookupuser"), (0, n.jsxs)(x.Ay, {
                                component: j(),
                                href: "/faq",
                                sx: {
                                    pl: 4
                                },
                                children: [(0, n.jsx)(E.A, {
                                    children: (0, n.jsx)(y.A, {
                                        title: "FAQ and help",
                                        children: (0, n.jsx)(et.A, {})
                                    })
                                }), (0, n.jsx)(_.A, {
                                    primary: "FAQ"
                                })]
                            }, "faq"), (0, n.jsxs)(x.Ay, {
                                component: j(),
                                href: "/blog",
                                sx: {
                                    pl: 4
                                },
                                children: [(0, n.jsx)(E.A, {
                                    children: (0, n.jsx)(y.A, {
                                        title: "GitGenius Blog",
                                        children: (0, n.jsx)(et.A, {})
                                    })
                                }), (0, n.jsx)(_.A, {
                                    primary: "Blog"
                                })]
                            }, "blog"), (0, n.jsx)(O.default, {
                                sx: {
                                    my: 1
                                }
                            }), (0, n.jsxs)(x.Ay, {
                                component: j(),
                                href: "/analytics",
                                sx: {
                                    pl: 4
                                },
                                children: [(0, n.jsx)(E.A, {
                                    children: (0, n.jsx)(y.A, {
                                        title: "Analytics Overview",
                                        children: (0, n.jsx)(et.A, {})
                                    })
                                }), (0, n.jsx)(_.A, {
                                    primary: "Overview"
                                })]
                            }, "analytics-overview"), (0, n.jsxs)(x.Ay, {
                                component: j(),
                                href: "/analytics/influentialusers",
                                sx: {
                                    pl: 4
                                },
                                children: [(0, n.jsx)(E.A, {
                                    children: (0, n.jsx)(y.A, {
                                        title: "Influential Users",
                                        children: (0, n.jsx)(et.A, {})
                                    })
                                }), (0, n.jsx)(_.A, {
                                    primary: "Influential Users"
                                })]
                            }, "analytics-influentialusers"), (0, n.jsxs)(x.Ay, {
                                component: j(),
                                href: "/issues",
                                sx: {
                                    pl: 4
                                },
                                children: [(0, n.jsx)(E.A, {
                                    children: (0, n.jsx)(y.A, {
                                        title: "Trending Issues",
                                        children: (0, n.jsx)(et.A, {})
                                    })
                                }), (0, n.jsx)(_.A, {
                                    primary: "Trending Issues"
                                })]
                            }, "issues"), (0, n.jsxs)(x.Ay, {
                                component: j(),
                                href: "/trending",
                                sx: {
                                    pl: 4
                                },
                                children: [(0, n.jsx)(E.A, {
                                    children: (0, n.jsx)(y.A, {
                                        title: "Trending Repos",
                                        children: (0, n.jsx)(et.A, {})
                                    })
                                }), (0, n.jsx)(_.A, {
                                    primary: "Trending Repos"
                                })]
                            }, "trending")]
                        })
                    })]
                })
            }
            let en = (0, w.default)(s.A)(({
                    theme: e
                }) => ({
                    zIndex: e.zIndex.drawer + 1,
                    transition: e.transitions.create(["width", "margin"], {
                        easing: e.transitions.easing.sharp,
                        duration: e.transitions.duration.leavingScreen
                    })
                })),
                eo = (0, w.default)(l.Ay)(({
                    open: e
                }) => ({
                    width: 300 * !!e,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": {
                        width: 300 * !!e
                    }
                }));

            function ea({
                children: e
            }) {
                let t = (0, c.A)();
                return (0, n.jsx)(u.A, {
                    appear: !1,
                    direction: "down",
                    in: !t,
                    children: e
                })
            }
            let ei = () => {
                let e = (0, C.default)(),
                    t = (0, d.A)(e.breakpoints.up("lg"), {
                        defaultMatches: !1,
                        noSsr: !0
                    }),
                    r = (0, P.d4)(e => e.common.showDrawer),
                    s = (0, P.d4)(e => e.common.currentUser),
                    {
                        data: l,
                        status: c
                    } = (0, v.useSession)(),
                    [u, w] = (0, L.useState)(!1),
                    [S, k] = (0, L.useState)(!1),
                    D = (0, T.M)("drawer-menu");
                if ((0, L.useEffect)(() => {
                        k(!0), t && r ? w(!0) : w(!1)
                    }, [t, r]), "loading" === c && !l) return null;
                let N = "light" === e.palette.mode ? "#ffffff" : "#222222";
                return (0, n.jsxs)("div", {
                    children: [(0, n.jsx)(p.Ay, {}), (0, n.jsx)(ea, {
                        children: (0, n.jsx)(en, {
                            position: "fixed",
                            color: "transparent",
                            sx: {
                                bgcolor: N
                            },
                            children: (0, n.jsxs)(h.A, {
                                sx: {
                                    gap: {
                                        xs: .5,
                                        md: 1
                                    },
                                    minWidth: 0
                                },
                                children: [S && l ? (0, n.jsx)(m.A, {
                                    "aria-label": u ? "Close drawer" : "Open drawer",
                                    onClick: () => {
                                        w(!u)
                                    },
                                    sx: {
                                        mr: 2
                                    },
                                    size: "large",
                                    children: u ? (0, n.jsx)(i.A, {}) : (0, n.jsx)(a.A, {})
                                }) : (0, n.jsx)(m.A, {
                                    style: {
                                        marginLeft: 0
                                    },
                                    size: "large"
                                }), (0, n.jsxs)(g.default, {
                                    container: !0,
                                    sx: {
                                        flexGrow: 1,
                                        minWidth: 0,
                                        alignItems: "center",
                                        flexWrap: "nowrap"
                                    },
                                    spacing: 0,
                                    children: [(0, n.jsx)(g.default, {
                                        size: "auto",
                                        container: !0,
                                        direction: "row",
                                        sx: {
                                            alignItems: "center",
                                            justifyContent: "flex-start",
                                            minHeight: "50px",
                                            flexShrink: 0,
                                            minWidth: "fit-content",
                                            mr: {
                                                xs: .5,
                                                md: 1
                                            }
                                        },
                                        children: (0, n.jsx)(j(), {
                                            href: "/",
                                            className: "navbar-brand",
                                            children: (0, n.jsx)(b.default, {
                                                src: I,
                                                width: 50,
                                                height: 50,
                                                alt: "logo",
                                                priority: !0
                                            })
                                        })
                                    }), (0, n.jsx)(g.default, {
                                        size: "grow",
                                        sx: {
                                            minWidth: 0
                                        },
                                        children: l ? (0, n.jsx)(Y, {
                                            currentUser: s
                                        }) : (0, n.jsx)(V, {})
                                    })]
                                })]
                            })
                        })
                    }), S && (0, n.jsxs)(eo, {
                        variant: "permanent",
                        open: u,
                        children: [(0, n.jsx)(ea, {
                            children: (0, n.jsx)(h.A, {})
                        }), (0, n.jsx)(f.default, {
                            ref: D,
                            sx: {
                                overflow: "auto"
                            },
                            children: (0, n.jsxs)(A.A, {
                                children: [(0, n.jsxs)(x.Ay, {
                                    component: j(),
                                    href: "/stargazeroverview",
                                    children: [(0, n.jsx)(E.A, {
                                        children: (0, n.jsx)(y.A, {
                                            title: "Stargazer Overview Dashboard",
                                            children: (0, n.jsx)(o.A, {})
                                        })
                                    }), (0, n.jsx)(_.A, {
                                        primary: "Stargazer Overview"
                                    })]
                                }, "Overviewstars"), (0, n.jsxs)(x.Ay, {
                                    component: j(),
                                    href: "/subscriberoverview",
                                    children: [(0, n.jsx)(E.A, {
                                        children: (0, n.jsx)(y.A, {
                                            title: "Subscriber Overview Dashboard",
                                            children: (0, n.jsx)(o.A, {})
                                        })
                                    }), (0, n.jsx)(_.A, {
                                        primary: "Subscriber Overview"
                                    })]
                                }, "Overviewsubs"), (0, n.jsx)(O.default, {}), (0, n.jsx)(ee, {}), (0, n.jsx)(er, {}), (0, n.jsx)(O.default, {}), (0, n.jsx)(q, {
                                    Repos: s
                                })]
                            })
                        })]
                    })]
                })
            };
            ei.propTypes = {
                appName: D().string,
                showDrawer: D().bool,
                children: D().node
            };
            let es = ei
        },
        36459: (e, t, r) => {
            "use strict";
            r.d(t, {
                M: () => o,
                s: () => a
            });
            var n = r(12115);
            let o = (e, t = 100) => {
                    let r = (0, n.useRef)(null),
                        o = (0, n.useRef)(null),
                        a = (0, n.useRef)(!1);
                    return (0, n.useEffect)(() => {
                        let n = r.current;
                        if (!n) return;
                        a.current = !1;
                        let i = setTimeout(() => {
                                if (a.current) return;
                                let t = localStorage.getItem(`scroll-${e}`);
                                if (null !== t) {
                                    let e = parseInt(t, 10);
                                    if (!isNaN(e) && e >= 0) {
                                        let t = n.scrollHeight - n.clientHeight;
                                        n.scrollTop = Math.min(e, Math.max(0, t)), a.current = !0
                                    }
                                } else n.scrollTop = 0, a.current = !0
                            }, 100),
                            s = () => {
                                o.current && clearTimeout(o.current), o.current = setTimeout(() => {
                                    localStorage.setItem(`scroll-${e}`, n.scrollTop.toString())
                                }, t)
                            };
                        n.addEventListener("scroll", s, {
                            passive: !0
                        });
                        let l = () => {
                            localStorage.setItem(`scroll-${e}`, n.scrollTop.toString())
                        };
                        return window.addEventListener("beforeunload", l), () => {
                            clearTimeout(i), n.removeEventListener("scroll", s), window.removeEventListener("beforeunload", l), o.current && clearTimeout(o.current)
                        }
                    }, [e, t]), r
                },
                a = (e, t = 100) => {
                    let r = (0, n.useRef)(null),
                        o = (0, n.useRef)(!1),
                        a = (0, n.useRef)(0);
                    (0, n.useEffect)(() => {
                        let n = () => {
                            let t = localStorage.getItem(`scroll-${e}`);
                            if (t && !o.current && a.current < 10) {
                                let e = parseInt(t, 10),
                                    r = document.documentElement.scrollHeight - window.innerHeight;
                                a.current++, e <= r && r > 0 ? (window.scrollTo(0, e), o.current = !0) : a.current < 10 && setTimeout(n, 200)
                            }
                        };
                        setTimeout(n, 100), setTimeout(n, 300), setTimeout(n, 600), setTimeout(n, 1e3), setTimeout(n, 1500), setTimeout(n, 2e3), "loading" === document.readyState && document.addEventListener("DOMContentLoaded", n);
                        let i = () => {
                            r.current && clearTimeout(r.current), r.current = setTimeout(() => {
                                let t = window.pageYOffset;
                                localStorage.setItem(`scroll-${e}`, t.toString())
                            }, t)
                        };
                        window.addEventListener("scroll", i, {
                            passive: !0
                        });
                        let s = () => {
                            let t = window.pageYOffset;
                            localStorage.setItem(`scroll-${e}`, t.toString())
                        };
                        return window.addEventListener("beforeunload", s), () => {
                            window.removeEventListener("scroll", i), window.removeEventListener("beforeunload", s), document.removeEventListener("DOMContentLoaded", n), r.current && clearTimeout(r.current)
                        }
                    }, [e, t])
                }
        },
        37994: (e, t, r) => {
            "use strict";
            r.d(t, {
                A: () => d
            });
            var n = r(61766),
                o = r(37882);
            let a = (0, r(28155).A)(),
                i = e => e.data,
                s = null,
                l = null;
            n.A.interceptors.request.use(async e => {
                let t = await (0, o.getSession)();
                if (e.headers = e.headers || {}, t ? .accessToken ? (e.headers.Authorization = `Bearer ${t.accessToken}`, e.headers["X-User-Id"] = t.user.id || "") : s ? (e.headers.Authorization = `Bearer ${s}`, l && (e.headers["X-User-Id"] = l)) : t && console.warn("No access token found in session."), e.url && e.url.includes("/api/search")) {
                    let t = "Cq03X250DW/Wp5XaAlqmAVFPvrVE5iAUUVN1yr5ogSk=";
                    t && (e.headers["X-API-Key"] = t)
                }
                return e
            });
            let c = e => n.A.get(`${a}${e}`).then(i),
                u = (e, t) => n.A.post(`${a}${e}`, t).then(i),
                d = {
                    Auth: {
                        current: () => c("/user"),
                        login: (e, t) => u("/user/login", {
                            user: {
                                email: e,
                                password: t
                            }
                        }),
                        loginreset: (e, t) => u("/user/loginreset", {
                            user: {
                                email: e
                            },
                            token: t
                        }),
                        resetlink: e => u("/user/resetlink", {
                            url: e
                        }),
                        register: (e, t, r, n, o, a, i) => u("/user/new", {
                            user: {
                                invitationcode: e,
                                firstname: t,
                                lastname: r,
                                username: n,
                                email: o,
                                password: a
                            },
                            token: i
                        }),
                        save: e => {
                            let t;
                            return t = {
                                user: e
                            }, n.A.put(`${a}/user`, t).then(i)
                        },
                        search: e => u("/search/userintimeframe", e)
                    },
                    Sendmail: {
                        send: e => c("/sendmail", e)
                    },
                    ValidateRepo: {
                        send: e => c("/validaterepo", e)
                    },
                    setToken: (e, t = null) => {
                        s = e, l = t ? `${t}` : null
                    }
                }
        },
        45973: (e, t, r) => {
            "use strict";
            r.d(t, {
                default: () => A
            });
            var n = r(95155),
                o = r(27966),
                a = r(46887),
                i = r(37911),
                s = r(12129),
                l = r(28683),
                c = r(69730),
                u = r.n(c),
                d = r(98500),
                p = r.n(d),
                h = r(14051),
                m = r.n(h),
                g = r(2834);
            let f = ({
                children: e,
                theme: t = "transparent",
                big: r = !1,
                className: c
            }) => {
                let d = (0, l.default)(),
                    h = (0, g.d4)(e => e.common.showDrawer),
                    m = "dark" === d.palette.mode,
                    f = "white" === t ? d.palette.background.paper : "dark" === t ? d.palette.grey[900] : "transparent",
                    A = "white" === t ? d.palette.text.primary : "dark" === t ? d.palette.common.white : d.palette.text.primary;
                return (0, n.jsx)("footer", {
                    className: u()(c),
                    style: {
                        position: "relative",
                        padding: r ? "40px 0" : "20px 0",
                        backgroundColor: f
                    },
                    children: (0, n.jsxs)("div", {
                        style: {
                            marginTop: "40px",
                            fontSize: "0.8em",
                            color: A
                        },
                        children: [e && (0, n.jsxs)("div", {
                            children: [(0, n.jsx)("div", {
                                children: e
                            }), (0, n.jsx)("hr", {})]
                        }), (0, n.jsxs)(s.default, {
                            container: !0,
                            columns: {
                                xs: 12
                            },
                            spacing: 2,
                            sx: {
                                pl: h ? {
                                    lg: "340px"
                                } : {}
                            },
                            children: [
                                [{
                                    title: "Support",
                                    links: [{
                                        label: "Contact Us",
                                        href: "/contact"
                                    }, {
                                        label: "FAQ",
                                        href: "/faq"
                                    }]
                                }, {
                                    title: "Solutions",
                                    links: [{
                                        label: "Analytics",
                                        href: "/analytics"
                                    }, {
                                        label: "Influential Users",
                                        href: "/analytics/influentialusers"
                                    }, {
                                        label: "Trending Issues",
                                        href: "/issues"
                                    }, {
                                        label: "Trending Repositories",
                                        href: "/trending"
                                    }]
                                }, {
                                    title: "Company",
                                    links: [{
                                        label: "About Us",
                                        href: "/about"
                                    }, {
                                        label: "Blog",
                                        href: "/blog"
                                    }, {
                                        label: "Sponsor",
                                        href: "/sponsor"
                                    }]
                                }, {
                                    title: "Legal",
                                    links: [{
                                        label: "Cookie Policy",
                                        href: "/cookie-policy"
                                    }, {
                                        label: "Privacy Policy",
                                        href: "/privacy"
                                    }, {
                                        label: "Terms of Service",
                                        href: "/terms-of-service"
                                    }]
                                }].map(({
                                    title: e,
                                    links: t
                                }) => (0, n.jsx)(s.default, {
                                    size: {
                                        xs: 6,
                                        sm: 3
                                    },
                                    children: (0, n.jsx)(o.default, {
                                        sx: {
                                            display: "flex",
                                            justifyContent: "center",
                                            height: "100%",
                                            color: A,
                                            "& a, & a:visited": {
                                                color: `${A} !important`
                                            },
                                            "& a:hover": {
                                                color: `${A} !important`,
                                                opacity: m ? .9 : .8
                                            }
                                        },
                                        children: (0, n.jsxs)(a.default, {
                                            spacing: .75,
                                            sx: {
                                                alignItems: {
                                                    xs: "center",
                                                    sm: "flex-start"
                                                }
                                            },
                                            children: [(0, n.jsx)(i.default, {
                                                variant: "overline",
                                                sx: {
                                                    color: A,
                                                    letterSpacing: 1.2,
                                                    fontWeight: 700
                                                },
                                                children: e
                                            }), t.map(e => (0, n.jsx)(p(), {
                                                href: e.href,
                                                children: e.label
                                            }, e.href))]
                                        })
                                    })
                                }, e)), (0, n.jsx)(s.default, {
                                    size: {
                                        xs: 12
                                    },
                                    children: (0, n.jsxs)(o.default, {
                                        sx: {
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            height: "100%",
                                            gap: 1.5,
                                            color: A,
                                            "& a, & a:visited": {
                                                color: `${A} !important`
                                            },
                                            "& a:hover": {
                                                color: `${A} !important`,
                                                opacity: m ? .9 : .8
                                            }
                                        },
                                        children: [(0, n.jsx)(p(), {
                                            href: "/register",
                                            children: "Sign Up "
                                        }), (0, n.jsx)("span", {
                                            children: "or"
                                        }), (0, n.jsx)(p(), {
                                            href: "/login",
                                            "data-mp-track": "sign-in",
                                            "data-mp-source": "footer",
                                            children: "Log In"
                                        })]
                                    })
                                }), (0, n.jsx)(s.default, {
                                    size: {
                                        xs: 12
                                    },
                                    children: (0, n.jsxs)(o.default, {
                                        sx: {
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            height: "100%",
                                            color: A,
                                            "& a, & a:visited": {
                                                color: `${A} !important`
                                            },
                                            "& a:hover": {
                                                color: `${A} !important`,
                                                opacity: m ? .9 : .8
                                            }
                                        },
                                        children: [(0, n.jsx)(p(), {
                                            href: "/",
                                            children: "GitGenius"
                                        }), " \xa9 ", new Date().getFullYear()]
                                    })
                                })
                            ]
                        })]
                    })
                })
            };
            f.propTypes = {
                theme: m().oneOf(["dark", "white", "transparent"]),
                big: m().bool,
                className: m().string
            };
            let A = f
        },
        48145: (e, t, r) => {
            "use strict";
            r.d(t, {
                default: () => l
            });
            var n = r(12115),
                o = r(61838),
                a = r(6084),
                i = r(49113),
                s = r(34270);

            function l() {
                let e = "G-K0MBV3YDYD",
                    [t, r] = (0, n.useState)(!1);
                return (0, n.useEffect)(() => {
                    if (!o.F || !e) return;
                    let t = (0, s.sg)() || (0, a.JB)();
                    if (r(t), t) return;
                    let n = null,
                        l = !1,
                        c = () => {
                            if (!l) {
                                if ("function" != typeof window.gtag) {
                                    n = setTimeout(c, 100);
                                    return
                                }
                                window.gtag("js", new Date), window.gtag("config", e, {
                                    send_page_view: !1
                                }), (0, i.Ez)()
                            }
                        };
                    if (document.getElementById("_next-ga")) return void c();
                    let u = document.createElement("script");
                    return u.id = "_next-ga", u.src = `https://www.googletagmanager.com/gtag/js?id=${e}`, u.async = !0, u.onload = c, document.head.appendChild(u), () => {
                        l = !0, n && clearTimeout(n), u.onload = null
                    }
                }, [e]), o.F && (e || console.warn("\uD83D\uDEAB GA: No measurement ID configured")), null
            }
        },
        49113: (e, t, r) => {
            "use strict";
            r.d(t, {
                Ez: () => d,
                oe: () => p,
                sx: () => h
            });
            var n = r(61838),
                o = r(59078),
                a = r(83965),
                i = r(34270),
                s = r(66868),
                l = r(61299);
            let c = "G-K0MBV3YDYD",
                u = !1;

            function d() {
                if (!n.F || u || (0, i.gW)()) return;
                (0, a.XV)();
                let e = () => {
                    let t, r, n, i, s, d;
                    if ("function" != typeof window.gtag) return void setTimeout(e, 100);
                    u = !0;
                    let p = function() {
                        if ("u" < typeof document) return null;
                        let e = document.cookie.match(/(?:^|; )_cid=([^;]*)/);
                        return e ? decodeURIComponent(e[1]) : null
                    }();
                    p && c && window.gtag("config", c, {
                        client_id: p,
                        send_page_view: !1
                    }), window.gtag && window.gtag("set", {
                        language: navigator.language || "en-US",
                        screen_resolution: `${screen.width}x${screen.height}`,
                        viewport_size: `${window.innerWidth}x${window.innerHeight}`
                    }), r = 0, n = () => {
                        let e = Math.round(window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100);
                        e > r && (r = e, [25, 50, 75, 90].forEach(e => {
                            r >= e && r < e + 5 && (0, l.aD)(e)
                        }))
                    }, window.addEventListener("scroll", () => {
                        clearTimeout(t), t = setTimeout(n, 150)
                    }, {
                        passive: !0
                    }), document.addEventListener("click", e => {
                        let t = e.target.closest("a");
                        if (!t) return;
                        let r = t.getAttribute("href");
                        if (!r) return;
                        r.startsWith("http") && !r.includes(window.location.hostname) && (0, o.E)("click", {
                            link_domain: new URL(r).hostname,
                            link_url: r,
                            link_text: t.innerText ? .substring(0, 100),
                            outbound: !0,
                            event_category: "engagement"
                        });
                        let n = /\.(pdf|docx?|xlsx?|pptx?|zip|tar|gz|rar|7z|csv|json|xml)$/i;
                        n.test(r) && (0, o.E)("file_download", {
                            file_name: r.split("/").pop(),
                            file_extension: r.match(n) ? .[1],
                            link_url: r,
                            event_category: "engagement"
                        })
                    }), s = i = Date.now(), d = !1, setInterval(() => {
                        if (document.hidden || !(0, a.iK)()) return;
                        let e = Date.now(),
                            t = e - i;
                        if (!d && t >= 1e4) {
                            (0, l.EF)({
                                engagement_time_msec: t,
                                total_engagement_sec: Math.round(t / 1e3)
                            }), d = !0, s = e;
                            return
                        }
                        let r = e - s;
                        d && r >= 15e3 && ((0, l.EF)({
                            engagement_time_msec: r,
                            total_engagement_sec: Math.round(t / 1e3)
                        }), s = e)
                    }, 2e3), document.addEventListener("visibilitychange", () => {
                        document.hidden || (s = i = Date.now(), d = !1)
                    }), (0, l.Yp)()
                };
                e()
            }

            function p(e) {
                let t, r;
                if (!n.F || (0, i.gW)()) return;
                let a = new URLSearchParams(window.location.search),
                    s = {};
                if (["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach(e => {
                        a.has(e) && (s[e] = a.get(e))
                    }), !s.utm_source && document.referrer) try {
                    let e = new URL(document.referrer).hostname;
                    e.includes(window.location.hostname) || (e.includes("google") ? (t = "google", r = "organic") : e.includes("bing") ? (t = "bing", r = "organic") : e.includes("facebook") ? (t = "facebook", r = "social") : e.includes("twitter") || e.includes("t.co") ? (t = "twitter", r = "social") : e.includes("linkedin") ? (t = "linkedin", r = "social") : e.includes("reddit") ? (t = "reddit", r = "social") : (t = e.includes("github") ? "github" : e, r = "referral"))
                } catch {}(0, o.E)("page_view", {
                    page_path: e || window.location.pathname,
                    page_title: document.title,
                    page_location: window.location.href,
                    ...t && {
                        source: t
                    },
                    ...r && {
                        medium: r
                    },
                    ...s
                })
            }

            function h(e, t = {}) {
                !n.F || (0, i.gW)() || ((0, o.E)(e, t), (0, s.EN)(e, t))
            }
        },
        51705: (e, t, r) => {
            "use strict";
            r.d(t, {
                F: () => i
            });
            var n = r(61838),
                o = r(49113),
                a = r(34270);

            function i(e, t = {}) {
                !n.F || (0, a.gW)() || (0, o.sx)(e, t)
            }
        },
        51743: () => {},
        62202: () => {},
        66151: (e, t, r) => {
            "use strict";
            r.d(t, {
                default: () => s
            });
            var n = r(37882),
                o = r(12115),
                a = r(34270),
                i = r(13666);

            function s() {
                let {
                    data: e,
                    status: t
                } = (0, n.useSession)(), r = (0, o.useRef)(!1);
                return (0, o.useEffect)(() => {
                    if ("authenticated" === t && e ? .user && !r.current) {
                        if ((0, a.gW)()) return;
                        r.current = !0;
                        let t = "unknown";
                        t = e.user.email ? .includes("google") ? "google" : e.user.email ? .includes("github") ? "github" : e.user.email ? .includes("gitlab") ? "gitlab" : "oauth", (0, i.trackLogin)(t)
                    }
                }, [e, t]), null
            }
        },
        66505: (e, t, r) => {
            "use strict";
            r.d(t, {
                Providers: () => D,
                G: () => L
            });
            var n = r(95155),
                o = r(15359),
                a = r(39269),
                i = r(50815),
                s = r(89766),
                l = r(37882),
                c = r(12115),
                u = r(2834),
                d = r(22143),
                p = r(73321),
                h = r(36459);
            let m = () => {
                let e = (0, p.usePathname)();
                return (0, h.s)(e), null
            };
            var g = r(61754),
                f = r(60596),
                A = r(51705),
                x = r(37994),
                E = r(14658);
            let y = () => {
                    try {
                        let e = localStorage.getItem("rdxstt");
                        if (null === e) return;
                        return JSON.parse(e)
                    } catch (e) {
                        return null
                    }
                },
                _ = async e => {
                    if (await (0, l.getSession)() && "u" > typeof localStorage) try {
                        let t = JSON.stringify(e);
                        localStorage.setItem("rdxstt", t)
                    } catch (e) {
                        console.error("Could not save state to localStorage", e)
                    }
                },
                O = async e => {
                    let t = await (0, l.getSession)();
                    if (t) {
                        try {
                            let r = await fetch("/api/oauth/user", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    id: "next-auth",
                                    email: t.user.email
                                })
                            });
                            if (!r.ok) {
                                let e = await r.json();
                                throw Error(e.message || "Authentication failed")
                            }
                            let n = await r.json();
                            n.user ? (e.currentUser = n.user, e.currentUser.token = "", window.localStorage.setItem("rdxstt", JSON.stringify(e))) : console.log("GOOGLE Callback:  No user found, creating new user")
                        } catch (e) {
                            throw Error(e.message || "Unable to login.")
                        }
                        return
                    }
                },
                w = e => t => async r => {
                    if (window.localStorage && "APP_LOAD" === r.type) {
                        if (!y() && r.payload) {
                            let e = {
                                appName: "GitGenius",
                                showDrawer: !1,
                                isLoggedIn: !0,
                                viewChangeCounter: 0,
                                currentUser: r.payload
                            };
                            await O(e)
                        }
                        let t = localStorage.getItem("rdxstt");
                        if (t) {
                            let r = JSON.parse(t);
                            e.dispatch({
                                type: "APP_LOAD_SUCCESS",
                                payload: r.currentUser
                            }), r.currentUser && r.currentUser.username && (0, A.F)("returning_user", {
                                username: r.currentUser.username,
                                user_id: r.currentUser.email
                            })
                        }
                    }
                    return t(r)
                },
                C = e => t => r => {
                    var n;
                    if ((n = r.payload) && "function" == typeof n.then) {
                        console.log("promiseMiddleware PAYLOAD", r), e.dispatch({
                            type: E.SS,
                            subtype: r.type
                        });
                        let t = e.getState().viewChangeCounter,
                            n = r.skipTracking;
                        r.payload.then(o => {
                            let a = e.getState();
                            (n || a.viewChangeCounter === t) && (r.payload = o, e.dispatch({
                                type: E.nl,
                                promise: r.payload
                            }), e.dispatch(r))
                        }, o => {
                            let a = e.getState();
                            if (n || a.viewChangeCounter === t) {
                                if (o.message.includes("Request has been terminated")) return void console.log("Cannot connect to middleware (check api-server is running)");
                                o.response ? r.payload = o.response.body : r.payload = null, r.skipTracking || e.dispatch({
                                    type: E.nl,
                                    promise: r.payload
                                }), e.dispatch(r)
                            }
                        })
                    }
                    t(r)
                },
                b = e => e => t => {
                    if (t.type === E.eY || t.type === E.S3) {
                        var r = {
                            appName: "GitGenius",
                            showDrawer: !1,
                            viewChangeCounter: 0,
                            currentUser: t.payload.user
                        };
                        t.payload.errors || t.error ? t.error = "error" : (O(t.payload.user), window.localStorage.setItem("rdxstt", JSON.stringify(r)), x.A.setToken(t.payload.user.token), t.type === E.S3 ? (0, A.F)("login", {
                            method: "email",
                            user_id: t.payload.user.email
                        }) : t.type === E.eY && (0, A.F)("sign_up", {
                            method: "email"
                        }))
                    } else t.type === E.HW ? "" !== t.payload.user.email && x.A.setToken(t.payload.user.token) : t.type === E.T_ && (window.localStorage.clear(), window.sessionStorage.clear(), x.A.setToken(null), (0, l.signOut)({
                        callbackUrl: "/"
                    }));
                    e(t)
                },
                S = {
                    appName: "GitGenius",
                    showDrawer: !1,
                    viewChangeCounter: 0,
                    currentUser: null
                },
                j = (0, g.HY)({
                    auth: function(e = {}, t) {
                        switch (t.type) {
                            case E.S3:
                            case E.eY:
                                return { ...e,
                                    inProgress: !1,
                                    errors: t.error ? t.payload.errors : null
                                };
                            case E.XI:
                            case E.PJ:
                            case E.g0:
                                return {};
                            case E.SS:
                                if (t.subtype === E.S3 || t.subtype === E.eY || t.subtype === E.Cn) return { ...e,
                                    inProgress: !0
                                };
                                break;
                            case E.q1:
                            case E.LP:
                                return { ...e,
                                    [t.key]: t.value
                                }
                        }
                        return e
                    },
                    common: function(e = S, t) {
                        var r = y();
                        switch (t.type) {
                            case E.JY:
                                return { ...e,
                                    isLoggedIn: r ? r.isLoggedIn : !!t.payload,
                                    appLoaded: !0,
                                    currentUser: r ? .currentUser || null
                                };
                            case E.iy:
                                return console.error("App load error:", t.error), { ...e,
                                    appLoaded: !1
                                };
                            case E.tC:
                                return { ...e,
                                    currentUser: t.payload
                                };
                            case E.ns:
                                if (!r || !r.currentUser ? .email ? .includes("@gitgenius")) return { ...e,
                                    showDrawer: !1,
                                    redirectTo: "/"
                                };
                                return { ...e,
                                    showDrawer: !1
                                };
                            case E.wp:
                                return { ...e,
                                    redirectTo: "/stargazeroverview"
                                };
                            case E.ZB:
                                return { ...e,
                                    showDrawer: t.payload
                                };
                            case E.HW:
                                return { ...e,
                                    isLoggedIn: !!t.token,
                                    currentUser: t.payload ? t.payload.user : null,
                                    redirectTo: "/passwordreset"
                                };
                            case E.T_:
                                return { ...e,
                                    viewChangeCounter: e.viewChangeCounter + 1,
                                    token: null,
                                    currentUser: null,
                                    isLoggedIn: !1
                                };
                            case E.gn:
                                {
                                    let r = { ...e.currentUser,
                                        ...t.payload
                                    };
                                    return _({ ...e,
                                        currentUser: t.error ? null : r
                                    }),
                                    localStorage.removeItem("staroverview"),
                                    localStorage.removeItem("startime"),
                                    localStorage.removeItem("suboverview"),
                                    localStorage.removeItem("subtime"),
                                    { ...e,
                                        currentUser: t.error ? null : r
                                    }
                                }
                            case E.CD:
                                {
                                    let r = { ...e.currentUser,
                                        ...t.payload
                                    };
                                    return _({ ...e,
                                        currentUser: t.error ? null : r
                                    }),
                                    { ...e,
                                        currentUser: t.error ? null : r
                                    }
                                }
                            case E.T5:
                                return { ...e,
                                    viewChangeCounter: e.viewChangeCounter + 1,
                                    currentUser: t.error ? null : t.payload.user,
                                    isLoggedIn: !t.error
                                };
                            case E.S3:
                            case E.eY:
                                return { ...e,
                                    isLoggedIn: !t.error,
                                    currentUser: t.error ? null : t.payload.user,
                                    viewChangeCounter: e.viewChangeCounter + 1,
                                    redirectTo: t.error ? null : "/stargazeroverview"
                                };
                            case E.CE:
                            case E.cZ:
                            case E.Ty:
                            case E.fp:
                            case E.QQ:
                            case E.TE:
                            case E.ws:
                            case E.hO:
                            case E.xJ:
                            case E.Vs:
                            case E.jT:
                            case E.d4:
                            case E.dd:
                            case E.Se:
                            case E.hz:
                            case E.sh:
                            case E.SH:
                            case E.N2:
                            case E.o3:
                            case E.rn:
                            case E.zQ:
                            case E.LW:
                            case E.kh:
                            case E.U0:
                            case E.mo:
                            case E.Vt:
                            case E.aq:
                            case E.rm:
                            case E.EO:
                            case E.br:
                            case E.aD:
                                return { ...e,
                                    viewChangeCounter: e.viewChangeCounter + 1,
                                    showDrawer: !1
                                };
                            case E.XM:
                                return { ...e,
                                    viewChangeCounter: e.viewChangeCounter + 1,
                                    showDrawer: !!r
                                };
                            case E.Ks:
                            case E.OD:
                            case E.DH:
                            case E.YH:
                            case E.wH:
                            case E.Es:
                            case E.YY:
                            case E.pR:
                                if (!r) return { ...e,
                                    redirectTo: "/login"
                                };
                                return { ...e,
                                    viewChangeCounter: e.viewChangeCounter + 1,
                                    showDrawer: !0
                                };
                            case E.nA:
                            case E.yw:
                            case E.Bv:
                            case E.XI:
                            case E.YX:
                            case E.PJ:
                            case E.rG:
                            case E.jY:
                            case E.Lx:
                            case E.rd:
                            case E.Hp:
                            case E.El:
                            case E.co:
                            case E.zh:
                            case E.NB:
                            case E.IJ:
                            case E.bk:
                            case E.Ck:
                            case E.IA:
                            case E.J7:
                            case E.YT:
                            case E.mE:
                            case E.HA:
                            case E.nD:
                            case E.Zz:
                            case E.M5:
                            case E.WR:
                            case E.Vo:
                                return { ...e,
                                    viewChangeCounter: e.viewChangeCounter + 1
                                };
                            default:
                                if ("string" == typeof t.type && t.type.endsWith("_PAGE_LOADED")) return { ...e,
                                    viewChangeCounter: e.viewChangeCounter + 1,
                                    showDrawer: !1
                                };
                                return "string" == typeof t.type && t.type.endsWith("_PAGE_UNLOADED"), { ...e,
                                    viewChangeCounter: e.viewChangeCounter + 1
                                }
                        }
                    }
                }),
                v = (0, c.createContext)({
                    toggleColorMode: () => {},
                    mode: "dark"
                });

            function k({
                children: e,
                session: t
            }) {
                let [r] = (0, c.useState)(() => {
                    let e = (0, f.U1)({
                        reducer: j,
                        devTools: !1,
                        middleware: e => e().concat(w, C, b)
                    });
                    return t ? e.dispatch({
                        type: E.JY,
                        payload: t.user
                    }) : e.dispatch({
                        type: E.JY
                    }), e
                });
                return (0, c.useEffect)(() => {
                    let e = r.subscribe(() => {
                        let e = r.getState();
                        null !== e.common.currentUser && "undefined" === e.common.currentUser && _({
                            common: e.common
                        })
                    });
                    return () => e()
                }, [r]), (0, n.jsx)(u.Kq, {
                    store: r,
                    children: e
                })
            }

            function D({
                children: e,
                session: t,
                initialColorScheme: r = "dark"
            }) {
                let [u, p] = (0, c.useState)(r);
                (0, c.useEffect)(() => {
                    let e = localStorage.getItem(d.THEME_COOKIE);
                    ("light" === e || "dark" === e) && (p(e), (0, d.o)(e))
                }, []), (0, c.useEffect)(() => {
                    document.documentElement.setAttribute("data-theme", u), document.documentElement.setAttribute("data-mui-color-scheme", u)
                }, [u]);
                let h = (0, i.A)({
                    palette: {
                        mode: u
                    },
                    typography: {
                        fontFamily: "var(--font-raleway), sans-serif"
                    },
                    components: {
                        MuiCssBaseline: {
                            styleOverrides: {
                                body: { ..."dark" === u ? (0, a.A)() : {},
                                    backgroundColor: "dark" === u ? "#121212" : "#ffffff"
                                },
                                "*::-webkit-scrollbar": {
                                    width: "8px",
                                    height: "8px"
                                },
                                "*::-webkit-scrollbar-thumb": {
                                    backgroundColor: "dark" === u ? "#757575" : "#cccccc",
                                    borderRadius: "4px"
                                },
                                "*::-webkit-scrollbar-track": {
                                    backgroundColor: "dark" === u ? "#2c2c2c" : "#f0f0f0"
                                }
                            }
                        }
                    }
                });
                return (0, n.jsx)(k, {
                    session: t,
                    children: (0, n.jsx)(v.Provider, {
                        value: {
                            mode: u,
                            toggleColorMode: () => {
                                p(e => {
                                    let t = "light" === e ? "dark" : "light";
                                    try {
                                        localStorage.setItem(d.THEME_COOKIE, t), (0, d.o)(t)
                                    } catch {
                                        console.warn("Could not access localStorage to save theme preference.")
                                    }
                                    return t
                                })
                            }
                        },
                        children: (0, n.jsxs)(s.default, {
                            theme: h,
                            children: [(0, n.jsx)(o.Ay, {}), (0, n.jsxs)(l.SessionProvider, {
                                session: t,
                                children: [(0, n.jsx)(m, {}), e]
                            })]
                        })
                    })
                })
            }

            function L() {
                return (0, c.useContext)(v)
            }
        },
        68313: (e, t, r) => {
            "use strict";
            r.d(t, {
                default: () => g
            });
            var n = r(95155),
                o = r(12115),
                a = r(61838),
                i = r(34270),
                s = r(41463);

            function l() {
                let e = (0, o.useRef)(!1);
                return (0, o.useEffect)(() => {
                    if (!a.F || (0, i.gW)() || e.current) return;
                    let t = "368e2461d8f8aec4880dd3bdee95a8bd".trim();
                    if (!t) return;
                    e.current = !0;
                    let r = s.env.NEXT_PUBLIC_MIXPANEL_API_HOST ? .trim(),
                        n = document.createElement("script");
                    n.id = "mixpanel-init", n.type = "text/javascript", n.text = function(e, t = {}) {
                        let r = e.replace(/\\/g, "\\\\").replace(/'/g, "\\'"),
                            n = ["  autocapture: false,", "  track_pageview: false,", "  persistence: 'localStorage',", "  ignore_dnt: true,", "  record_sessions_percent: 100,", "  record_heatmap_data: true,", "  opt_out_tracking_by_default: true,"];
                        if (t.apiHost) {
                            let e = t.apiHost.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
                            n.push(`  api_host: '${e}',`)
                        }
                        let o = n.join("\n");
                        return `(function(e,c){if(!c.__SV){var l,h;window.mixpanel=c;c._i=[];c.init=function(q,r,f){function t(d,a){var g=a.split(".");2==g.length&&(d=d[g[0]],a=g[1]);d[a]=function(){d.push([a].concat(Array.prototype.slice.call(arguments,0)))}}var b=c;"undefined"!==typeof f?b=c[f]=[]:f="mixpanel";b.people=b.people||[];b.toString=function(d){var a="mixpanel";"mixpanel"!==f&&(a+="."+f);d||(a+=" (stub)");return a};b.people.toString=function(){return b.toString(1)+".people (stub)"};l="disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders start_session_recording stop_session_recording people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(" ");
for(h=0;h<l.length;h++)t(b,l[h]);var n="set set_once union unset remove delete".split(" ");b.get_group=function(){function d(p){a[p]=function(){b.push([g,[p].concat(Array.prototype.slice.call(arguments,0))])}}for(var a={},g=["get_group"].concat(Array.prototype.slice.call(arguments,0)),m=0;m<n.length;m++)d(n[m]);return a};c._i.push([q,r,f])};c.__SV=1.2;var k=e.createElement("script");k.type="text/javascript";k.async=!0;k.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"file:"===
e.location.protocol&&"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\\/\\//)?"https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js":"https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";e=e.getElementsByTagName("script")[0];e.parentNode.insertBefore(k,e)}})(document,window.mixpanel||[]);

mixpanel.init('${r}', {
${o}
});`
                    }(t, {
                        apiHost: r || void 0
                    }), document.head.appendChild(n)
                }, []), null
            }
            var c = r(8959),
                u = r(16728);

            function d({
                id: e,
                src: t,
                async: r = !0,
                dataset: n = {}
            }) {
                if (document.getElementById(e)) return;
                let o = document.createElement("script");
                o.id = e, o.src = t, o.async = r, Object.entries(n).forEach(([e, t]) => {
                    o.dataset[e] = t
                }), document.head.appendChild(o)
            }

            function p() {
                return (0, o.useEffect)(() => {
                    ! function(e, t) {
                        if (document.getElementById(e)) return;
                        let r = document.createElement("script");
                        r.id = e, r.text = t, document.head.appendChild(r)
                    }("google-consent-mode", (0, c.MG)())
                }, []), null
            }

            function h() {
                return (0, o.useEffect)(() => {
                    d({
                        id: "ahrefs-analytics",
                        src: "https://analytics.ahrefs.com/analytics.js",
                        dataset: {
                            key: "51oGT69Pg4VKwMjAbUhY7g"
                        }
                    })
                }, []), null
            }

            function m() {
                return (0, o.useEffect)(() => {
                    d({
                        id: u.WG,
                        src: u.UQ
                    })
                }, []), null
            }

            function g({
                skipAnalytics: e = !1,
                loadGoogleConsent: t = !1,
                loadMixpanel: r = !1
            }) {
                return !e || t || r || u.MS ? (0, n.jsxs)(n.Fragment, {
                    children: [t && (0, n.jsx)(p, {}), !e && (0, n.jsx)(h, {}), r && a.F && (0, n.jsx)(l, {}), u.MS && (0, n.jsx)(m, {})]
                }) : null
            }
        },
        70079: (e, t, r) => {
            "use strict";
            r.d(t, {
                default: () => d
            });
            var n = r(73321),
                o = r(12115),
                a = r(61838),
                i = r(37366),
                s = r(6084),
                l = r(49113),
                c = r(34270),
                u = r(26516);

            function d() {
                let e = (0, n.usePathname)(),
                    t = (0, n.useSearchParams)().toString(),
                    r = (0, o.useRef)(!0);
                return (0, o.useEffect)(() => {
                    if (!(!a.F || (0, c.gW)() || (0, s.JB)()) && !(0, i.vP)()) {
                        if (r.current) {
                            r.current = !1;
                            return
                        }(0, l.oe)(), (0, u.g)()
                    }
                }, [e, t]), null
            }
        },
        73822: () => {},
        73941: (e, t, r) => {
            "use strict";
            r.d(t, {
                default: () => i
            });
            var n = r(73321),
                o = r(12115),
                a = r(16728);

            function i() {
                let e = (0, n.usePathname)(),
                    [t, r] = (0, o.useState)(a.MS);
                return (0, o.useEffect)(() => {
                    if (a.MS) return;
                    let e = () => {
                        r(function() {
                            if ("u" < typeof document) return !1;
                            let e = window.CookieConsent || window.CookieConsentApi;
                            if (void 0 !== e) try {
                                let t = e.getCookie();
                                return t ? .categories ? .includes("marketing") || !1
                            } catch {
                                return !1
                            }
                            let t = document.cookie.split("; ").find(e => e.startsWith("cc_cookie=")) ? .split("=")[1];
                            if (!t) return !1;
                            try {
                                let e = JSON.parse(decodeURIComponent(t));
                                return e ? .categories ? .includes("marketing") || !1
                            } catch {
                                return !1
                            }
                        }())
                    };
                    e();
                    let t = setInterval(e, 1e3);
                    return () => {
                        clearInterval(t)
                    }
                }, []), (0, o.useEffect)(() => {
                    if (!t) return;
                    let e = document.getElementById(a.WG);
                    e && e.remove();
                    let r = document.createElement("script");
                    return r.id = a.WG, r.src = a.UQ, r.async = !0, document.body.appendChild(r), () => {
                        let e = document.getElementById(a.WG);
                        e && e.remove()
                    }
                }, [e, t]), null
            }
        },
        84331: (e, t, r) => {
            "use strict";
            r.r(t), r.d(t, {
                default: () => o
            });
            var n = r(12115);

            function o({
                id: e,
                data: t
            }) {
                let r = "string" == typeof t ? t : JSON.stringify(t);
                return (0, n.useEffect)(() => {
                    if (!e || !r) return;
                    let t = document.getElementById(e);
                    return t || ((t = document.createElement("script")).id = e, t.type = "application/ld+json", document.head.appendChild(t)), t.textContent = r, () => {
                        t ? .parentNode && t.parentNode.removeChild(t)
                    }
                }, [e, r]), null
            }
        },
        95815: (e, t, r) => {
            Promise.resolve().then(r.bind(r, 94755)), Promise.resolve().then(r.t.bind(r, 36315, 23)), Promise.resolve().then(r.t.bind(r, 51743, 23)), Promise.resolve().then(r.bind(r, 48145)), Promise.resolve().then(r.bind(r, 66151)), Promise.resolve().then(r.bind(r, 4149)), Promise.resolve().then(r.bind(r, 70079)), Promise.resolve().then(r.bind(r, 73941)), Promise.resolve().then(r.bind(r, 29999)), Promise.resolve().then(r.bind(r, 45973)), Promise.resolve().then(r.bind(r, 84331)), Promise.resolve().then(r.bind(r, 22143)), Promise.resolve().then(r.bind(r, 68313)), Promise.resolve().then(r.bind(r, 32169)), Promise.resolve().then(r.t.bind(r, 73822, 23)), Promise.resolve().then(r.bind(r, 66505))
        }
    },
    e => {
        e.O(0, [5154, 1667, 7911, 2834, 8500, 2129, 9845, 7396, 475, 6534, 6678, 2783, 2619, 1766, 7882, 1718, 9098, 5772, 2170, 9439, 1654, 8132, 1299, 8441, 3794, 7358], () => e(e.s = 95815)), _N_E = e.O()
    }
]);