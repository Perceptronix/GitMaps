(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["object" == typeof document ? document.currentScript : void 0, 24998, e => {
    "use strict";
    var t = e.i(43476),
        r = e.i(71645),
        s = e.i(83599),
        a = e.i(66319),
        o = e.i(35675),
        l = e.i(55436),
        n = e.i(73375),
        d = e.i(63059),
        i = e.i(63209);
    let c = e => fetch(e, {
            headers: {
                Accept: "application/vnd.github.v3+json"
            }
        }).then(e => e.json()),
        u = [{
            value: "stars",
            label: "Stars"
        }, {
            value: "forks",
            label: "Forks"
        }, {
            value: "updated",
            label: "Recently Updated"
        }, {
            value: "help-wanted-issues",
            label: "Help Wanted"
        }];

    function m() {
        let [e, m] = (0, r.useState)(""), [x, p] = (0, r.useState)(""), [g, f] = (0, r.useState)(""), [h, b] = (0, r.useState)("stars"), [v, j] = (0, r.useState)(1), y = x;
        g && (y += ` language:${g}`);
        let N = new URLSearchParams({
                q: y,
                sort: h,
                order: "desc",
                per_page: "25",
                page: String(v)
            }),
            {
                data: S,
                error: w,
                isLoading: C
            } = (0, s.default)(x ? `https://api.github.com/search/repositories?${N.toString()}` : null, c, {
                revalidateOnFocus: !1,
                keepPreviousData: !0
            }),
            k = S ? .items || [],
            A = S ? .total_count || 0,
            P = (0, r.useCallback)(t => {
                t.preventDefault(), e.trim() && (p(e.trim()), j(1))
            }, [e]);
        return (0, t.jsxs)("div", {
            className: "flex flex-col gap-6",
            children: [(0, t.jsxs)("form", {
                onSubmit: P,
                className: "flex flex-col gap-4",
                children: [(0, t.jsxs)("div", {
                    className: "flex gap-2",
                    children: [(0, t.jsxs)("div", {
                        className: "relative flex-1",
                        children: [(0, t.jsx)(l.Search, {
                            className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                        }), (0, t.jsx)("input", {
                            type: "text",
                            placeholder: "Search repositories...",
                            value: e,
                            onChange: e => m(e.target.value),
                            className: "w-full rounded-md border border-border bg-secondary py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
                        })]
                    }), (0, t.jsx)("button", {
                        type: "submit",
                        className: "rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
                        children: "Search"
                    })]
                }), (0, t.jsxs)("div", {
                    className: "flex flex-wrap gap-3",
                    children: [(0, t.jsx)("select", {
                        value: g,
                        onChange: e => {
                            f(e.target.value), j(1), x && p(x)
                        },
                        className: "rounded-md border border-border bg-secondary px-3 py-1.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring",
                        children: a.LANGUAGES.map(e => (0, t.jsx)("option", {
                            value: e.value,
                            children: e.label
                        }, e.value))
                    }), (0, t.jsx)("select", {
                        value: h,
                        onChange: e => {
                            b(e.target.value), j(1), x && p(x)
                        },
                        className: "rounded-md border border-border bg-secondary px-3 py-1.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring",
                        children: u.map(e => (0, t.jsxs)("option", {
                            value: e.value,
                            children: ["Sort: ", e.label]
                        }, e.value))
                    })]
                })]
            }), w && (0, t.jsxs)("div", {
                className: "flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive",
                children: [(0, t.jsx)(i.AlertCircle, {
                    className: "h-4 w-4 flex-shrink-0"
                }), (0, t.jsx)("span", {
                    children: "Failed to search repositories. Please try again later."
                })]
            }), x && !w && !C && A > 0 && (0, t.jsxs)("p", {
                className: "text-sm text-muted-foreground",
                children: ["Found ", A.toLocaleString(), " repositories for", " ", (0, t.jsx)("span", {
                    className: "font-medium text-foreground",
                    children: `"${x}"`
                })]
            }), (0, t.jsx)("div", {
                className: "flex flex-col gap-3",
                children: C ? Array.from({
                    length: 8
                }).map((e, r) => (0, t.jsx)(o.RepoCardSkeleton, {}, `skeleton-${r}`)) : k.map((e, r) => (0, t.jsx)(o.RepoCard, {
                    repo: e,
                    rank: (v - 1) * 25 + r + 1
                }, e.id))
            }), !C && k.length > 0 && (0, t.jsxs)("div", {
                className: "flex items-center justify-center gap-3 pt-2",
                children: [(0, t.jsxs)("button", {
                    type: "button",
                    disabled: v <= 1,
                    onClick: () => j(e => Math.max(1, e - 1)),
                    className: "flex items-center gap-1 rounded-md border border-border bg-secondary px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50",
                    children: [(0, t.jsx)(n.ChevronLeft, {
                        className: "h-4 w-4"
                    }), "Previous"]
                }), (0, t.jsxs)("span", {
                    className: "text-sm text-muted-foreground",
                    children: ["Page ", v]
                }), (0, t.jsxs)("button", {
                    type: "button",
                    disabled: k.length < 25,
                    onClick: () => j(e => e + 1),
                    className: "flex items-center gap-1 rounded-md border border-border bg-secondary px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50",
                    children: ["Next", (0, t.jsx)(d.ChevronRight, {
                        className: "h-4 w-4"
                    })]
                })]
            }), !x && (0, t.jsxs)("div", {
                className: "flex flex-col items-center gap-3 py-20 text-center",
                children: [(0, t.jsx)("div", {
                    className: "flex h-16 w-16 items-center justify-center rounded-full bg-secondary",
                    children: (0, t.jsx)(l.Search, {
                        className: "h-7 w-7 text-muted-foreground"
                    })
                }), (0, t.jsx)("p", {
                    className: "text-lg font-medium text-foreground",
                    children: "Start exploring"
                }), (0, t.jsx)("p", {
                    className: "max-w-md text-sm text-muted-foreground",
                    children: "Search for repositories by name, description, or topic. Filter by language and sort by stars, forks, or recent updates."
                })]
            }), x && !C && 0 === k.length && !w && (0, t.jsxs)("div", {
                className: "flex flex-col items-center gap-2 py-16 text-center",
                children: [(0, t.jsx)("p", {
                    className: "text-lg font-medium text-foreground",
                    children: "No results found"
                }), (0, t.jsx)("p", {
                    className: "text-sm text-muted-foreground",
                    children: "Try different keywords or adjust your filters."
                })]
            })]
        })
    }
    e.s(["SearchContent", () => m])
}]);