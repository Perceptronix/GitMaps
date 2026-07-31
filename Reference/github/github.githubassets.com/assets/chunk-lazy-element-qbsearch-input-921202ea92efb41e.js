export const __rspack_esm_id = 1134;
export const __rspack_esm_ids = [1134];
export const __webpack_modules__ = {
    733651(e, t, r) {
        r.r(t), r.d(t, {
            QbsearchInputElement: () => Y
        });
        var o = r(331635);
        r(60612);
        var i = r(651135),
            n = r(137558),
            a = r(541946),
            s = r(402604),
            l = r(737131),
            c = r(812195),
            u = r(865206),
            d = r(538395),
            h = r(574567);
        let p = (0, r(984835).A)("localStorage");
        class m extends EventTarget {
            priority = 5;
            name = "History";
            singularItemName = "history";
            value = "history";
            type = "search";
            queryBuilder;
            constructor(e) {
                super(), this.queryBuilder = e, this.queryBuilder.addEventListener("query", this)
            }
            handleEvent(e) {
                let t = e.parsedMetadata;
                if (!t || t.caretPositionKind !== n.Z.Text) return [];
                let r = e.toString(),
                    o = JSON.parse(p.getItem("github-search-history") ? ? "[]");
                if (0 !== t.query.trim().length) return [];
                let i = {};
                o = o.filter(e => !i[e] && (i[e] = !0, !0));
                let a = 0;
                for (let e of o) {
                    if (a >= 5) break;
                    let t = e.trim();
                    t.startsWith(r) && (a += 1, this.dispatchEvent(new h.CN({
                        value: t,
                        icon: h.m4.Search,
                        scope: "GENERAL",
                        priority: t.length,
                        action: {
                            url: `/search?q=${t}`
                        }
                    })))
                }
            }
        }
        var g = r(772460),
            f = r(613743),
            y = r(76723);
        let b = [{
            name: "C++",
            color: "#f34b7d"
        }, {
            name: "Go",
            color: "#00ADD8"
        }, {
            name: "Java",
            color: "#b07219"
        }, {
            name: "JavaScript",
            color: "#f1e05a"
        }, {
            name: "PHP",
            color: "#4F5D95"
        }, {
            name: "Python",
            color: "#3572A5"
        }, {
            name: "Ruby",
            color: "#701516"
        }, {
            name: "TypeScript",
            color: "#2b7489"
        }, {
            name: "ABAP",
            color: "#E8274B"
        }, {
            name: "AGS Script",
            color: "#B9D9FF"
        }, {
            name: "AMPL",
            color: "#E6EFBB"
        }, {
            name: "ANTLR",
            color: "#9DC3FF"
        }, {
            name: "API Blueprint",
            color: "#2ACCA8"
        }, {
            name: "APL",
            color: "#5A8164"
        }, {
            name: "ASP",
            color: "#6a40fd"
        }, {
            name: "ATS",
            color: "#1ac620"
        }, {
            name: "ActionScript",
            color: "#882B0F"
        }, {
            name: "Ada",
            color: "#02f88c"
        }, {
            name: "Agda",
            color: "#315665"
        }, {
            name: "Alloy",
            color: "#64C800"
        }, {
            name: "AngelScript",
            color: "#C7D7DC"
        }, {
            name: "AppleScript",
            color: "#101F1F"
        }, {
            name: "Arc",
            color: "#aa2afe"
        }, {
            name: "AspectJ",
            color: "#a957b0"
        }, {
            name: "Assembly",
            color: "#6E4C13"
        }, {
            name: "Asymptote",
            color: "#4a0c0c"
        }, {
            name: "AutoHotkey",
            color: "#6594b9"
        }, {
            name: "AutoIt",
            color: "#1C3552"
        }, {
            name: "Ballerina",
            color: "#FF5000"
        }, {
            name: "Batchfile",
            color: "#C1F12E"
        }, {
            name: "BlitzMax",
            color: "#cd6400"
        }, {
            name: "Boo",
            color: "#d4bec1"
        }, {
            name: "C",
            color: "#555555"
        }, {
            name: "C#",
            color: "#178600"
        }, {
            name: "Ceylon",
            color: "#dfa535"
        }, {
            name: "Chapel",
            color: "#8dc63f"
        }, {
            name: "Cirru",
            color: "#ccccff"
        }, {
            name: "Clarion",
            color: "#db901e"
        }, {
            name: "Clean",
            color: "#3F85AF"
        }, {
            name: "Click",
            color: "#E4E6F3"
        }, {
            name: "Clojure",
            color: "#db5855"
        }, {
            name: "COBOL",
            color: "#ededed"
        }, {
            name: "CoffeeScript",
            color: "#244776"
        }, {
            name: "ColdFusion",
            color: "#ed2cd6"
        }, {
            name: "Common Lisp",
            color: "#3fb68b"
        }, {
            name: "Common Workflow Language",
            color: "#B5314C"
        }, {
            name: "Component Pascal",
            color: "#B0CE4E"
        }, {
            name: "CSS",
            color: "#563d7c"
        }, {
            name: "Crystal",
            color: "#000100"
        }, {
            name: "Cuda",
            color: "#3A4E3A"
        }, {
            name: "D",
            color: "#ba595e"
        }, {
            name: "DM",
            color: "#447265"
        }, {
            name: "Dart",
            color: "#00B4AB"
        }, {
            name: "DataWeave",
            color: "#003a52"
        }, {
            name: "Dhall",
            color: "#dfafff"
        }, {
            name: "Dockerfile",
            color: "#384d54"
        }, {
            name: "Dogescript",
            color: "#cca760"
        }, {
            name: "Dylan",
            color: "#6c616e"
        }, {
            name: "E",
            color: "#ccce35"
        }, {
            name: "ECL",
            color: "#8a1267"
        }, {
            name: "EJS",
            color: "#a91e50"
        }, {
            name: "EQ",
            color: "#a78649"
        }, {
            name: "Eiffel",
            color: "#946d57"
        }, {
            name: "Elixir",
            color: "#6e4a7e"
        }, {
            name: "Elm",
            color: "#60B5CC"
        }, {
            name: "Emacs Lisp",
            color: "#c065db"
        }, {
            name: "EmberScript",
            color: "#FFF4F3"
        }, {
            name: "Erlang",
            color: "#B83998"
        }, {
            name: "F#",
            color: "#b845fc"
        }, {
            name: "F*",
            color: "#572e30"
        }, {
            name: "FLUX",
            color: "#88ccff"
        }, {
            name: "Factor",
            color: "#636746"
        }, {
            name: "Fancy",
            color: "#7b9db4"
        }, {
            name: "Fantom",
            color: "#14253c"
        }, {
            name: "Forth",
            color: "#341708"
        }, {
            name: "Fortran",
            color: "#4d41b1"
        }, {
            name: "FreeMarker",
            color: "#0050b2"
        }, {
            name: "Frege",
            color: "#00cafe"
        }, {
            name: "G-code",
            color: "#D08CF2"
        }, {
            name: "GDScript",
            color: "#355570"
        }, {
            name: "Game Maker Language",
            color: "#71b417"
        }, {
            name: "Genie",
            color: "#fb855d"
        }, {
            name: "Gherkin",
            color: "#5B2063"
        }, {
            name: "Glyph",
            color: "#c1ac7f"
        }, {
            name: "Gnuplot",
            color: "#f0a9f0"
        }, {
            name: "Groovy",
            color: "#e69f56"
        }, {
            name: "HTML",
            color: "#e34c26"
        }, {
            name: "Hack",
            color: "#878787"
        }, {
            name: "Harbour",
            color: "#0e60e3"
        }, {
            name: "Haskell",
            color: "#5e5086"
        }, {
            name: "Haxe",
            color: "#df7900"
        }, {
            name: "HCL",
            color: "#844fba"
        }, {
            name: "HiveQL",
            color: "#dce200"
        }, {
            name: "HolyC",
            color: "#ffefaf"
        }, {
            name: "Hy",
            color: "#7790B2"
        }, {
            name: "IDL",
            color: "#a3522f"
        }, {
            name: "Idris",
            color: "#b30000"
        }, {
            name: "Io",
            color: "#a9188d"
        }, {
            name: "Ioke",
            color: "#078193"
        }, {
            name: "Isabelle",
            color: "#FEFE00"
        }, {
            name: "J",
            color: "#9EEDFF"
        }, {
            name: "JSONiq",
            color: "#40d47e"
        }, {
            name: "Jolie",
            color: "#843179"
        }, {
            name: "Jsonnet",
            color: "#0064bd"
        }, {
            name: "Julia",
            color: "#a270ba"
        }, {
            name: "Jupyter Notebook",
            color: "#DA5B0B"
        }, {
            name: "KRL",
            color: "#28430A"
        }, {
            name: "Kotlin",
            color: "#F18E33"
        }, {
            name: "LFE",
            color: "#4C3023"
        }, {
            name: "LLVM",
            color: "#185619"
        }, {
            name: "LSL",
            color: "#3d9970"
        }, {
            name: "Lasso",
            color: "#999999"
        }, {
            name: "Lex",
            color: "#DBCA00"
        }, {
            name: "LiveScript",
            color: "#499886"
        }, {
            name: "LookML",
            color: "#652B81"
        }, {
            name: "Lua",
            color: "#000080"
        }, {
            name: "MATLAB",
            color: "#e16737"
        }, {
            name: "MAXScript",
            color: "#00a6a6"
        }, {
            name: "MQL4",
            color: "#62A8D6"
        }, {
            name: "MQL5",
            color: "#4A76B8"
        }, {
            name: "MTML",
            color: "#b7e1f4"
        }, {
            name: "Makefile",
            color: "#427819"
        }, {
            name: "Markdown",
            color: "#083fa1"
        }, {
            name: "Mask",
            color: "#f97732"
        }, {
            name: "Max",
            color: "#c4a79c"
        }, {
            name: "Mercury",
            color: "#ff2b2b"
        }, {
            name: "Meson",
            color: "#007800"
        }, {
            name: "Metal",
            color: "#8f14e9"
        }, {
            name: "Mirah",
            color: "#c7a938"
        }, {
            name: "Modula-3",
            color: "#223388"
        }, {
            name: "NCL",
            color: "#28431f"
        }, {
            name: "Nearley",
            color: "#990000"
        }, {
            name: "Nemerle",
            color: "#3d3c6e"
        }, {
            name: "NetLinx",
            color: "#0aa0ff"
        }, {
            name: "NetLinx+ERB",
            color: "#747faa"
        }, {
            name: "NetLogo",
            color: "#ff6375"
        }, {
            name: "NewLisp",
            color: "#87AED7"
        }, {
            name: "Nextflow",
            color: "#3ac486"
        }, {
            name: "Nim",
            color: "#37775b"
        }, {
            name: "Nit",
            color: "#009917"
        }, {
            name: "Nix",
            color: "#7e7eff"
        }, {
            name: "Nu",
            color: "#c9df40"
        }, {
            name: "OCaml",
            color: "#3be133"
        }, {
            name: "ObjectScript",
            color: "#424893"
        }, {
            name: "Objective-C",
            color: "#438eff"
        }, {
            name: "Objective-C++",
            color: "#6866fb"
        }, {
            name: "Objective-J",
            color: "#ff0c5a"
        }, {
            name: "Omgrofl",
            color: "#cabbff"
        }, {
            name: "Opal",
            color: "#f7ede0"
        }, {
            name: "Oxygene",
            color: "#cdd0e3"
        }, {
            name: "Oz",
            color: "#fab738"
        }, {
            name: "P4",
            color: "#7055b5"
        }, {
            name: "PLSQL",
            color: "#dad8d8"
        }, {
            name: "Pan",
            color: "#cc0000"
        }, {
            name: "Papyrus",
            color: "#6600cc"
        }, {
            name: "Parrot",
            color: "#f3ca0a"
        }, {
            name: "Pascal",
            color: "#E3F171"
        }, {
            name: "Pawn",
            color: "#dbb284"
        }, {
            name: "Pep8",
            color: "#C76F5B"
        }, {
            name: "Perl",
            color: "#0298c3"
        }, {
            name: "Perl 6",
            color: "#0000fb"
        }, {
            name: "PigLatin",
            color: "#fcd7de"
        }, {
            name: "Pike",
            color: "#005390"
        }, {
            name: "PogoScript",
            color: "#d80074"
        }, {
            name: "PostScript",
            color: "#da291c"
        }, {
            name: "PowerBuilder",
            color: "#8f0f8d"
        }, {
            name: "PowerShell",
            color: "#012456"
        }, {
            name: "Processing",
            color: "#0096D8"
        }, {
            name: "Prolog",
            color: "#74283c"
        }, {
            name: "Propeller Spin",
            color: "#7fa2a7"
        }, {
            name: "Puppet",
            color: "#302B6D"
        }, {
            name: "PureBasic",
            color: "#5a6986"
        }, {
            name: "PureScript",
            color: "#1D222D"
        }, {
            name: "Protocol Buffers",
            color: "#CCCCCC"
        }, {
            name: "QML",
            color: "#44a51c"
        }, {
            name: "Quake",
            color: "#882233"
        }, {
            name: "R",
            color: "#198CE7"
        }, {
            name: "RAML",
            color: "#77d9fb"
        }, {
            name: "Racket",
            color: "#3c5caa"
        }, {
            name: "Ragel",
            color: "#9d5200"
        }, {
            name: "Rascal",
            color: "#fffaa0"
        }, {
            name: "Rebol",
            color: "#358a5b"
        }, {
            name: "Red",
            color: "#f50000"
        }, {
            name: "Ren'Py",
            color: "#ff7f7f"
        }, {
            name: "Ring",
            color: "#2D54CB"
        }, {
            name: "Roff",
            color: "#ecdebe"
        }, {
            name: "Rouge",
            color: "#cc0088"
        }, {
            name: "Rust",
            color: "#dea584"
        }, {
            name: "SAS",
            color: "#B34936"
        }, {
            name: "SQF",
            color: "#3F3F3F"
        }, {
            name: "SQL",
            color: "#e38c00"
        }, {
            name: "SRecode Template",
            color: "#348a34"
        }, {
            name: "SaltStack",
            color: "#646464"
        }, {
            name: "Scala",
            color: "#c22d40"
        }, {
            name: "Scheme",
            color: "#1e4aec"
        }, {
            name: "Self",
            color: "#0579aa"
        }, {
            name: "Shell",
            color: "#89e051"
        }, {
            name: "Shen",
            color: "#120F14"
        }, {
            name: "Slash",
            color: "#007eff"
        }, {
            name: "Slice",
            color: "#003fa2"
        }, {
            name: "Smalltalk",
            color: "#596706"
        }, {
            name: "Solidity",
            color: "#AA6746"
        }, {
            name: "SourcePawn",
            color: "#5c7611"
        }, {
            name: "Squirrel",
            color: "#800000"
        }, {
            name: "Stan",
            color: "#b2011d"
        }, {
            name: "Standard ML",
            color: "#dc566d"
        }, {
            name: "SuperCollider",
            color: "#46390b"
        }, {
            name: "Swift",
            color: "#ffac45"
        }, {
            name: "SystemVerilog",
            color: "#DAE1C2"
        }, {
            name: "TI Program",
            color: "#A0AA87"
        }, {
            name: "Tcl",
            color: "#e4cc98"
        }, {
            name: "TeX",
            color: "#3D6117"
        }, {
            name: "Terra",
            color: "#00004c"
        }, {
            name: "Turing",
            color: "#cf142b"
        }, {
            name: "UnrealScript",
            color: "#a54c4d"
        }, {
            name: "VCL",
            color: "#148AA8"
        }, {
            name: "VHDL",
            color: "#adb2cb"
        }, {
            name: "Vala",
            color: "#fbe5cd"
        }, {
            name: "Verilog",
            color: "#b2b7f8"
        }, {
            name: "Vim script",
            color: "#199f4b"
        }, {
            name: "Visual Basic",
            color: "#945db7"
        }, {
            name: "Visual Basic .NET",
            color: "#945db7"
        }, {
            name: "Visual Basic 6.0",
            color: "#2c6353"
        }, {
            name: "Volt",
            color: "#1F1F1F"
        }, {
            name: "Vue",
            color: "#2c3e50"
        }, {
            name: "WebAssembly",
            color: "#04133b"
        }, {
            name: "Wollok",
            color: "#a23738"
        }, {
            name: "X10",
            color: "#4B6BEF"
        }, {
            name: "XC",
            color: "#99DA07"
        }, {
            name: "XQuery",
            color: "#5232e7"
        }, {
            name: "XSLT",
            color: "#EB8CEB"
        }, {
            name: "YARA",
            color: "#220000"
        }, {
            name: "YASnippet",
            color: "#32AB90"
        }, {
            name: "Yacc",
            color: "#4B6C4B"
        }, {
            name: "ZAP",
            color: "#0d665e"
        }, {
            name: "ZIL",
            color: "#dc75e5"
        }, {
            name: "ZenScript",
            color: "#00BCD1"
        }, {
            name: "Zephir",
            color: "#118f9e"
        }, {
            name: "Zig",
            color: "#ec915c"
        }, {
            name: "eC",
            color: "#913960"
        }, {
            name: "mcfunction",
            color: "#E22837"
        }, {
            name: "nesC",
            color: "#94B0C7"
        }, {
            name: "ooc",
            color: "#b0b77e"
        }, {
            name: "sed",
            color: "#64b970"
        }, {
            name: "wdl",
            color: "#42f1f4"
        }, {
            name: "wisp",
            color: "#7582D1"
        }, {
            name: "xBase",
            color: "#403a40"
        }];
        class w extends EventTarget {
            priority = 10;
            name = "Languages";
            singularItemName = "language";
            value = "language";
            type = "filter";
            manuallyDetermineFilterEligibility = !0;
            queryBuilder;
            constructor(e) {
                super(), this.queryBuilder = e, this.queryBuilder.addEventListener("query", this)
            }#
            e(e) {
                let t = document.createElement("div");
                return (0, f.qy)
                `<div
      style="border-radius: 8px; display: inline-block; height: 10px; width: 10px; background-color: ${e}"
    ></div>`.renderInto(t), {
                    html: t.innerHTML
                }
            }
            handleEvent(e) {
                let t = e.parsedMetadata;
                if (!t || t.caretPositionKind !== n.Z.Language) return [];
                let r = "";
                if (!(t.caretSelectedNode && (0, n.bY)(t.caretSelectedNode))) return [];
                (0, n.cK)(t.caretSelectedNode.content) && (r = t.caretSelectedNode.content.value);
                let o = b.slice(0, 7);
                if (1 === r.length) o = b.filter(e => e.name.startsWith(r.toUpperCase())).slice(0, 7);
                else if (r.length > 1) {
                    let e = r.replace(/\s/g, "");
                    o = (0, g.d)(b, t => {
                        let r = (0, y.dt)(t.name, e);
                        return r > 0 ? {
                            score: r,
                            text: t.name
                        } : null
                    }, y.UD)
                }
                for (let e of o) {
                    let r = t.caretSelectedNode.location.end,
                        o = t.caretSelectedNode.location.end;
                    (0, n.cK)(t.caretSelectedNode.content) && (r = t.caretSelectedNode.content.location.start, o = t.caretSelectedNode.content.location.end);
                    let i = e.name.includes(" ") ? `"${e.name}"` : e.name,
                        a = `${t.query.slice(0,r)+i} ${t.query.slice(o)}`;
                    this.dispatchEvent(new h.qi({
                        filter: "lang",
                        value: e.name,
                        icon: this.#e(e.color),
                        priority: 0,
                        action: {
                            query: a,
                            replaceQueryWith: a,
                            moveCaretTo: r + i.length + 1
                        }
                    }))
                }
            }
        }
        var S = r(65081);
        class v extends EventTarget {#
            t;#
            r = null;
            constructor(e) {
                super(), this.#t = e
            }
            async getMatchingRepositories({
                state: e
            }) {
                let t = "",
                    r = [];
                if (e.ast) {
                    let o = (0, n.H5)(e.ast),
                        i = !1;
                    for (let e of o) "repo" === e.kind || "saved" === e.kind ? i = !0 : "org" === e.kind && r.push(e.value.toLowerCase());
                    if (i && e.caretPositionKind !== n.Z.Repository) return [];
                    t = (0, n.Xq)(e.ast)
                }
                e.caretSelectedNode && (0, n.bY)(e.caretSelectedNode) && (t = (0, n.cK)(e.caretSelectedNode.content) ? e.caretSelectedNode.content.value : ""), null === this.#r && (this.#r = (await (0, S.KW)(this.#t)).filter(e => "Repository" === e.type).map(e => e.name));
                let o = this.#r;
                if (t.length > 0) {
                    let e = t.replace(/\s/g, "");
                    o = (0, g.d)(this.#r, t => {
                        let r = (0, y.dt)(t, e);
                        return r > 0 ? {
                            score: r,
                            text: t
                        } : null
                    }, y.UD)
                }
                return r.length > 0 && (o = o.filter(e => {
                    let t = e.split("/")[0].toLowerCase();
                    return r.find(e => t.startsWith(e))
                })), o
            }
        }
        class C extends v {
            priority = 6;
            name = "Repositories";
            singularItemName = "repository";
            value = "repository-filter";
            type = "filter";
            manuallyDetermineFilterEligibility = !0;
            queryBuilder;
            constructor(e, t) {
                super(t), this.queryBuilder = e, this.queryBuilder.addEventListener("query", this)
            }
            async handleEvent(e) {
                let t = e.parsedMetadata,
                    r = this.queryBuilder.hasFocus();
                if (!t || !r || t.caretPositionKind !== n.Z.Repository && t.caretPositionKind !== n.Z.Owner) return [];
                for (let e of (await this.getMatchingRepositories({
                        state: t
                    })).slice(0, 5)) {
                    let r = {
                        url: `/${e}`
                    };
                    if (t.caretSelectedNode && (0, n.bY)(t.caretSelectedNode)) {
                        let o = t.caretSelectedNode.location.end,
                            i = t.caretSelectedNode.location.end;
                        (0, n.cK)(t.caretSelectedNode.content) && (o = t.caretSelectedNode.content.location.start, i = t.caretSelectedNode.content.location.end), r = {
                            replaceQueryWith: `${t.query.slice(0,o)+e} ${t.query.slice(i)}`,
                            moveCaretTo: o + e.length + 1
                        }
                    }
                    this.dispatchEvent(new h.qi({
                        filter: "repo",
                        value: e,
                        icon: h.m4.Repo,
                        priority: 0,
                        action: r
                    }))
                }
            }
        }
        class E extends v {
            priority = 6;
            name = "Repositories";
            singularItemName = "repository";
            value = "repository-search";
            type = "search";
            manuallyDetermineFilterEligibility = !0;
            queryBuilder;
            constructor(e, t) {
                super(t), this.queryBuilder = e, this.queryBuilder.addEventListener("query", this)
            }
            async handleEvent(e) {
                let t = e.parsedMetadata,
                    r = this.queryBuilder.hasFocus();
                if (!t || !r || t.caretPositionKind !== n.Z.Text) return [];
                for (let e of (await this.getMatchingRepositories({
                        state: t
                    })).slice(0, 5)) this.dispatchEvent(new h.CN({
                    value: e,
                    icon: h.m4.Repo,
                    priority: 0,
                    action: {
                        url: `/${e}`
                    }
                }))
            }
        }
        class q {#
            o = [];#
            i;
            set(e) {
                this.#o = e, this.#i = !0
            }
            get() {
                if (this.#i) return this.#o
            }
            len() {
                return this.#o.length
            }
            clear() {
                this.#i = !1, this.#o = []
            }
        }
        class k extends EventTarget {
            priority = 4;
            name = "Saved queries";
            singularItemName = "saved query";
            value = "saved query";
            type = "search";#
            n;
            customScopesCache = new q;
            queryBuilder;
            constructor(e, t) {
                super(), this.queryBuilder = e, this.#n = t, this.queryBuilder.addEventListener("query", this)
            }
            async fetchSuggestions() {
                let e = [];
                if (this.#n) {
                    let t = await fetch(this.#n, {
                        method: "GET",
                        mode: "same-origin",
                        headers: {
                            Accept: "application/json"
                        }
                    });
                    if (!t.ok) return [];
                    e = await t.json(), this.#a(e)
                }
                return e
            }#
            a(e) {
                this.customScopesCache.set(e)
            }
            async handleEvent(e) {
                let t = e.parsedMetadata;
                if (!t || t.caretPositionKind !== n.Z.Text && t.caretPositionKind !== n.Z.Saved || t.caretPositionKind !== n.Z.Saved && t.ast && (0, n.cZ)(t.ast, "Saved") || t.ast && ((0, n.cZ)(t.ast, "Repo") || (0, n.cZ)(t.ast, "Org"))) return [];
                let r = "";
                t.caretSelectedNode && ((0, n.YT)(t.caretSelectedNode) ? (0, n.cK)(t.caretSelectedNode.content) && (r = String(t.caretSelectedNode.content.value)) : (0, n.cK)(t.caretSelectedNode) && (r = String(t.caretSelectedNode.value)));
                let o = this.customScopesCache.get();
                if (void 0 === o && (o = await this.fetchSuggestions()), r.trim().length > 0) {
                    let e = r.replace(/[\s"]/g, "");
                    o = (0, g.d)(o, t => {
                        let r = (0, y.dt)(t.name, e);
                        return r > 0 ? {
                            score: r,
                            text: t.name
                        } : null
                    }, y.UD)
                }
                for (let e of o) {
                    let r = "saved:",
                        o = e.name.includes(" ") ? `"${e.name}"` : e.name,
                        i = "",
                        a = (i = t.query.endsWith(" ") || "" === t.query ? `${t.query}${r+o} ` : `${t.query} ${r+o} `).length;
                    if (t.caretSelectedNode && ((0, n.cK)(t.caretSelectedNode) || (0, n.bY)(t.caretSelectedNode))) {
                        let e = t.caretSelectedNode.location.start,
                            s = t.caretSelectedNode.location.end;
                        (0, n.bY)(t.caretSelectedNode) && (0, n.cK)(t.caretSelectedNode.content) && (s = t.caretSelectedNode.content.location.end);
                        let l = t.query.slice(0, e),
                            c = t.query.slice(s).trimEnd();
                        "" === c && (o += " "), i = l + r + o + c, a = e + r.length + o.length
                    }
                    this.dispatchEvent(new h.CN({
                        value: `saved:${e.name}`,
                        icon: h.m4.Bookmark,
                        priority: 0,
                        action: {
                            replaceQueryWith: i,
                            moveCaretTo: a
                        }
                    }))
                }
                t.caretPositionKind === n.Z.Saved && this.dispatchEvent(new h.CN({
                    value: "Manage saved searches",
                    icon: h.m4.PlusCircle,
                    scope: "COMMAND",
                    priority: 0,
                    action: {
                        commandName: "blackbird-monolith.manageCustomScopes",
                        data: {}
                    }
                }))
            }
        }
        class T extends EventTarget {
            priority = 5;
            name = "Owners";
            singularItemName = "owner";
            value = "owner";
            type = "search";
            manuallyDetermineFilterEligibility = !0;#
            s = null;#
            t;
            queryBuilder;
            constructor(e, t) {
                super(), this.queryBuilder = e, this.queryBuilder.addEventListener("query", this), this.#t = t
            }
            async handleEvent(e) {
                let t = e.parsedMetadata,
                    r = this.queryBuilder.hasFocus();
                if (!t || !r) return [];
                if (t.caretPositionKind === n.Z.Text && t.ast) {
                    if ((0, n.H5)(t.ast).length) return []
                } else if (t.caretPositionKind !== n.Z.Owner) return [];
                let o = "",
                    i = [];
                if (t.ast && (o = (0, n.Xq)(t.ast)), t.caretSelectedNode && (0, n.bY)(t.caretSelectedNode) && (o = (0, n.cK)(t.caretSelectedNode.content) ? t.caretSelectedNode.content.value : ""), null === this.#s) {
                    let e = (await (0, S.KW)(this.#t)).filter(e => "Repository" === e.type).map(e => e.name.split("/")[0]);
                    this.#s = [...new Set(e)]
                }
                let a = this.#s;
                if (o.length > 0) {
                    let e = o.replace(/\s/g, "");
                    a = (0, g.d)(this.#s, t => {
                        let r = (0, y.dt)(t, e);
                        return r > 0 ? {
                            score: r,
                            text: t
                        } : null
                    }, y.UD)
                }
                for (let e of (i.length > 0 && (a = a.filter(e => {
                        let t = e.split("/")[0].toLowerCase();
                        return i.find(e => t.startsWith(e))
                    })), a.slice(0, 5))) {
                    let r = {
                        url: `/${e}`
                    };
                    if (t.caretSelectedNode && (0, n.bY)(t.caretSelectedNode)) {
                        let o = t.caretSelectedNode.location.end,
                            i = t.caretSelectedNode.location.end;
                        (0, n.cK)(t.caretSelectedNode.content) && (o = t.caretSelectedNode.content.location.start, i = t.caretSelectedNode.content.location.end), r = {
                            replaceQueryWith: `${t.query.slice(0,o)+e} ${t.query.slice(i)}`,
                            moveCaretTo: o + e.length + 1
                        }
                    }
                    this.dispatchEvent(new h.CN({
                        value: e,
                        icon: h.m4.Repo,
                        priority: 0,
                        action: r
                    }))
                }
            }
        }
        class A extends EventTarget {
            priority = 3;
            name = "Values";
            singularItemName = "value";
            value = "value";
            type = "filter";
            manuallyDetermineFilterEligibility = !0;#
            l;
            queryBuilder;
            constructor(e) {
                super(), this.queryBuilder = e, this.queryBuilder.addEventListener("query", this)
            }
            async handleEvent(e) {
                let t = e.parsedMetadata;
                if (!t || t.caretPositionKind !== n.Z.OtherQualifier && t.caretPositionKind !== n.Z.Is || !t.caretSelectedNode || !(0, n.bY)(t.caretSelectedNode)) return [];
                this.#l || (this.#l = await r.e(51465).then(r.bind(r, 898640)));
                let o = [],
                    i = "License" === t.caretSelectedNode.qualifier,
                    a = "Language" === t.caretSelectedNode.qualifier;
                o = i ? [
                    ["BSD Zero Clause License", "0bsd"],
                    ["MIT License", "mit"],
                    ["Apache License 2.0", "apache-2.0"],
                    ["Creative Commons", "cc"],
                    ["GNU General Public License", "gpl"],
                    ["GNU Lesser General Public License", "lgpl"]
                ] : this.#l.getPossibleQualifierValues(this.#l.chooseSearchType(t.ast, !0), t.caretSelectedNode.qualifier).map(e => [e, e]);
                let s = t.query;
                if (t.caretSelectedNode && (0, n.bY)(t.caretSelectedNode) && (s = (0, n.cK)(t.caretSelectedNode.content) ? t.caretSelectedNode.content.value : ""), s.length > 0) {
                    let e = s.replace(/\s/g, "");
                    o = (0, g.d)(o, t => {
                        let r = t[0] === t[1] ? t[0] : `${t[0]} ${t[1]}`,
                            o = (0, y.dt)(r, e);
                        return o > 0 ? {
                            score: o,
                            text: r
                        } : void 0
                    }, y.UD)
                }
                for (let e of o.slice(0, 5))
                    if (t.caretSelectedNode && (0, n.bY)(t.caretSelectedNode)) {
                        let r = t.caretSelectedNode.location.end,
                            o = t.caretSelectedNode.location.end;
                        (0, n.cK)(t.caretSelectedNode.content) && (r = t.caretSelectedNode.content.location.start, o = t.caretSelectedNode.content.location.end);
                        let i = e[1].includes(" ") ? `"${e[1]}"` : e[1],
                            s = {
                                replaceQueryWith: `${t.query.slice(0,r)+i} ${t.query.slice(o)}`,
                                moveCaretTo: r + i.length + 1
                            };
                        this.dispatchEvent(new h.qi({
                            filter: "owner",
                            value: e[0],
                            icon: a ? h.m4.Circle : void 0,
                            priority: 0,
                            action: s
                        }))
                    }
            }
        }
        class L extends EventTarget {
            priority = 7;
            name = "Teams";
            singularItemName = "team";
            value = "team";
            type = "search";
            manuallyDetermineFilterEligibility = !0;#
            c = null;#
            t;
            queryBuilder;
            constructor(e, t) {
                super(), this.queryBuilder = e, this.queryBuilder.addEventListener("query", this), this.#t = t
            }
            async handleEvent(e) {
                let t = e.parsedMetadata,
                    r = this.queryBuilder.hasFocus();
                if (!t || !r || t.caretPositionKind !== n.Z.Text) return [];
                let o = t.query;
                t.caretSelectedNode && (0, n.bY)(t.caretSelectedNode) && (o = (0, n.cK)(t.caretSelectedNode.content) ? t.caretSelectedNode.content.value : ""), null === this.#c && (this.#c = (await (0, S.KW)(this.#t)).filter(e => "Team" === e.type).map(e => ({
                    name: e.name,
                    path: e.path
                })));
                let i = this.#c.slice(0, 4);
                if (o.length > 0) {
                    let e = o.replace(/\s/g, "");
                    i = (0, g.d)(this.#c, t => {
                        let r = (0, y.dt)(t.name, e);
                        return r > 0 ? {
                            score: r,
                            text: t.name
                        } : null
                    }, y.UD)
                }
                for (let e of i.slice(0, 5)) this.dispatchEvent(new h.CN({
                    value: e.name,
                    icon: h.m4.Team,
                    priority: 0,
                    action: {
                        url: e.path
                    }
                }))
            }
        }
        class N extends EventTarget {
            priority = 8;
            name = "Projects";
            singularItemName = "project";
            value = "project";
            type = "filter";
            manuallyDetermineFilterEligibility = !0;#
            u = null;#
            t;
            queryBuilder;
            constructor(e, t) {
                super(), this.queryBuilder = e, this.queryBuilder.addEventListener("query", this), this.#t = t
            }
            async handleEvent(e) {
                let t = e.parsedMetadata,
                    r = this.queryBuilder.hasFocus();
                if (!t || !r || t.caretPositionKind !== n.Z.Text) return [];
                let o = t.query;
                t.caretSelectedNode && (0, n.bY)(t.caretSelectedNode) && (o = (0, n.cK)(t.caretSelectedNode.content) ? t.caretSelectedNode.content.value : ""), null === this.#u && (this.#u = (await (0, S.KW)(this.#t)).filter(e => "Project" === e.type).map(e => ({
                    name: e.name,
                    path: e.path
                })));
                let i = this.#u.slice(0, 4);
                if (o.length > 0) {
                    let e = o.replace(/\s/g, "");
                    i = (0, g.d)(this.#u, t => {
                        let r = (0, y.dt)(t.name, e);
                        return r > 0 ? {
                            score: r,
                            text: t.name
                        } : null
                    }, y.UD)
                }
                for (let e of i.slice(0, 5)) this.dispatchEvent(new h.qi({
                    filter: "project",
                    value: e.name,
                    icon: h.m4.Project,
                    priority: 0,
                    action: {
                        url: e.path
                    }
                }))
            }
        }
        var x = r(383867),
            B = r(747251);
        class P extends EventTarget {
            priority = 9;
            name = "Code";
            singularItemName = "code";
            value = "code";
            type = "search";
            manuallyDetermineFilterEligibility = !0;
            blackbirdCaches = new c.L;#
            o = {};#
            t;
            queryBuilder;
            constructor(e, t) {
                super(), this.queryBuilder = e, this.queryBuilder.addEventListener("query", this), this.#t = t
            }
            async handleEvent(e) {
                let t = this.fetchData(e);
                this.dispatchEvent(new h.dS(t));
                let r = await t,
                    o = 0;
                for (let e of r) {
                    if (o >= 5) return;
                    if ("SUGGESTION_KIND_PATH" === e.kind) {
                        if (!e.path) continue;
                        let t = e.path.lastIndexOf("/"),
                            r = e.path.substring(t + 1),
                            o = R(e.path.substring(0, t + 1)),
                            i = e.repository_nwo,
                            n = i.length > 0 && o.length > 0 ? " \xb7 " : "",
                            a = e.path.split("/").map(encodeURIComponent).join("/");
                        this.dispatchEvent(new h.CN({
                            value: r,
                            icon: h.m4.FileCode,
                            description: `${i}${n}${o}`,
                            priority: 0,
                            action: {
                                url: `/${e.repository_nwo}/blob/${e.commit_sha}/${a}#L${e.line_number}`
                            }
                        }))
                    } else {
                        if ("SUGGESTION_KIND_SYMBOL" !== e.kind) continue;
                        let t = R(e.path),
                            r = e.repository_nwo,
                            o = r.length > 0 && t.length > 0 ? " \xb7 " : "",
                            i = e.path.split("/").map(encodeURIComponent).join("/"),
                            n = new x.v0({
                                kind: e.symbol ? .kind ? ? ""
                            });
                        this.dispatchEvent(new h.CN({
                            value: e.symbol ? .fully_qualified_name ? ? "",
                            prefixText: n.fullName,
                            prefixColor: function(e) {
                                switch (e.plColor) {
                                    case "prettylights.syntax.entity":
                                    default:
                                        return h.yk.Entity;
                                    case "prettylights.syntax.constant":
                                        return h.yk.Constant;
                                    case "prettylights.syntax.keyword":
                                        return h.yk.Keyword;
                                    case "prettylights.syntax.variable":
                                        return h.yk.Variable;
                                    case "prettylights.syntax.string":
                                        return h.yk.String
                                }
                            }(n),
                            icon: h.m4.FileCode,
                            description: `${r}${o}${t}`,
                            priority: 0,
                            action: {
                                url: `/${e.repository_nwo}/blob/${e.commit_sha}/${i}#L${e.line_number}`
                            }
                        }))
                    }
                    o++
                }
            }
            async fetchData(e) {
                let t = e.parsedMetadata;
                if (!t || !t.query || t.caretPositionKind !== n.Z.Text && t.caretPositionKind !== n.Z.Path) return [];
                if (this.#o[t.query]) return this.#o[t.query];
                if (!1 === (0, B.M3)()) return [];
                let r = new URLSearchParams({
                        query: t.query,
                        saved_searches: JSON.stringify(t.customScopes)
                    }),
                    o = this.#t.getAttribute("data-blackbird-suggestions-path");
                if (!o) throw Error("could not get blackbird suggestions path");
                await this.blackbirdCaches.setupWarmCachesLoop();
                let i = await fetch(`${o}?${r}`, {
                    method: "GET",
                    mode: "same-origin",
                    headers: {
                        Accept: "application/json"
                    }
                });
                if (!i.ok) return [];
                let a = await i.json();
                return a.failed ? [] : (this.#o[t.query] = a.suggestions, a.suggestions)
            }
        }

        function R(e) {
            return e.length > 60 ? `...${e.substring(e.length-60+3)}` : e
        }
        class D extends EventTarget {
            priority = 0;
            name = "";
            singularItemName = "search";
            value = "search";
            type = "search";
            copilotChatEnabled = !1;#
            t;#
            d;
            queryBuilder;
            constructor(e, t) {
                super(), this.queryBuilder = e, this.queryBuilder.addEventListener("query", this), this.#t = t
            }
            async handleEvent(e) {
                let t, o = e.parsedMetadata;
                if (e.rawQuery && this.dispatchEvent(new h.CN({
                        value: e.rawQuery,
                        scope: "GITHUB",
                        icon: h.m4.Search,
                        priority: 0,
                        action: {
                            query: e.rawQuery
                        },
                        isFallbackSuggestion: !0
                    })), !o || o.caretPositionKind !== n.Z.Text) return [];
                let i = o.query.trim(),
                    a = this.#t.getAttribute("data-current-repository"),
                    s = this.#t.getAttribute("data-current-org"),
                    l = this.#t.getAttribute("data-current-owner"),
                    c = this.#t.getAttribute("data-current-business");
                this.#d || (this.#d = await r.e(51465).then(r.bind(r, 898640)));
                let u = this.#d.parseString(i || "");
                if (u.children) {
                    let e = u.children.filter(e => "Qualifier" === e.kind);
                    a = e.find(e => "Repo" === e.qualifier) ? .content ? .value ? .toString() || a, t = e.find(e => "Org" === e.qualifier), s = t ? .content ? .value ? .toString() || s, l = e.find(e => "Org" === e.qualifier && "user:" === e.raw) ? .content ? .value ? .toString() || l, c = e.find(e => "Enterprise" === e.qualifier) ? .content ? .value ? .toString() || c, a && !t && (s = a.split("/")[0])
                }
                let d = [],
                    p = !1;
                if (o.ast) {
                    let e = o.ast;
                    if ((0, n.Go)(e)) {
                        i = e.children.filter(e => "Text" === e.kind).map(e => e.value).join(" ");
                        let t = (0, n.H5)(e);
                        if (t.find(e => "saved" === e.kind)) return [];
                        t.length && (p = !0)
                    } else(0, n.bY)(e) && (i = "");
                    a && a.length > 0 && d.push({
                        query: `repo:${a} ${i}`,
                        scope: "REPO"
                    }), t ? d.push({
                        query: `${t.raw}${s} ${i}`,
                        scope: "ORG"
                    }) : (s && s.length > 0 && d.push({
                        query: `org:${s} ${i}`,
                        scope: "ORG"
                    }), l && l.length > 0 && d.push({
                        query: `user:${l} ${i}`,
                        scope: "OWNER"
                    })), c && c.length > 0 && d.push({
                        query: `enterprise:${c} ${i}`,
                        scope: "ENTERPRISE"
                    })
                }
                i.length > 0 && (p ? d.push({
                    query: i,
                    scope: "GITHUB"
                }) : d.unshift({
                    query: i,
                    scope: "GITHUB"
                }));
                let m = function(e) {
                    let t = /^\/[^/]+\/[^/]+\/tree\/[^/]+\/(.*)/.exec(e);
                    if (t) {
                        for (let e = 1; e < t.length; e++)
                            if (t[e]) return function(e) {
                                (e = decodeURIComponent(e)).endsWith("/") && (e = e.substring(0, e.length - 1));
                                let t = e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                                return `/^${t.replaceAll("/","\\/")}\\//`
                            }(t[e])
                    }
                }(window.location.pathname);
                if (m) {
                    let e = `repo:${a} path:${m} ${i}`;
                    this.dispatchEvent(new h.CN({
                        value: e,
                        scope: "DIRECTORY",
                        icon: h.m4.Search,
                        priority: 0,
                        action: {
                            commandName: "blackbird-monolith.search",
                            data: {
                                query: e
                            }
                        }
                    }))
                }
                for (let e of d.slice(0, 3)) this.dispatchEvent(new h.CN({
                    value: e.query,
                    scope: e.scope,
                    icon: h.m4.Search,
                    priority: 0,
                    action: {
                        commandName: "blackbird-monolith.search",
                        data: {
                            query: e.query
                        }
                    }
                }))
            }
            getQualifierType(e) {
                if (e.includes("repo")) return "In this repository";
                if (e.includes("org")) return "In this organization";
                if (e.includes("user")) return "In this user";
                if (e.includes("owner")) return "In this owner";
                if (e.includes("enterprise")) return "In this enterprise";
                else return "All of GitHub"
            }
        }
        var _ = r(432231);
        r(182367);
        let I = [{
                title: "Enterprise",
                url: "/enterprise",
                octicon: "organization"
            }, {
                title: "Security",
                url: "/security",
                octicon: "shield-check"
            }, {
                title: "Copilot",
                url: "/features/copilot",
                octicon: "copilot"
            }, {
                title: "Pricing",
                url: "/pricing",
                octicon: "credit-card"
            }],
            $ = [{
                title: "GitHub Actions",
                url: "/features/actions",
                octicon: "workflow"
            }, {
                title: "Blog",
                url: "https://github.blog",
                octicon: "book"
            }, {
                title: "CI/CD",
                url: "/solutions/ci-cd/",
                octicon: "workflow"
            }, {
                title: "Code review",
                url: "/features/code-review",
                octicon: "code-review"
            }, {
                title: "Codespaces",
                url: "/features/codespaces",
                octicon: "codespaces"
            }, {
                title: "Community Discussions",
                url: "/orgs/community/discussions",
                octicon: "comment-discussion"
            }, {
                title: "Copilot",
                url: "/features/copilot",
                octicon: "copilot"
            }, {
                title: "Customer stories",
                url: "/customer-stories",
                octicon: "comment"
            }, {
                title: "Discussions",
                url: "/features/discussions",
                octicon: "comment-discussion"
            }, {
                title: "Documentation",
                url: "https://docs.github.com",
                octicon: "book"
            }, {
                title: "Enterprise",
                url: "/enterprise",
                octicon: "organization"
            }, {
                title: "Features",
                url: "/features",
                octicon: "rocket"
            }, {
                title: "GitHub Security",
                url: "/security",
                octicon: "shield-check"
            }, {
                title: "GitHub Sponsors",
                url: "/sponsors",
                octicon: "heart"
            }, {
                title: "GitHub Pages",
                url: "https://pages.github.com",
                octicon: "server"
            }, {
                title: "Integrations",
                url: "/features/integrations",
                octicon: "globe"
            }, {
                title: "Issues",
                url: "/features/issues",
                octicon: "issue-opened"
            }, {
                title: "GitHub Mobile",
                url: "/mobile",
                octicon: "device-mobile"
            }, {
                title: "GitHub Packages",
                url: "/features/packages",
                octicon: "package"
            }, {
                title: "MCP",
                url: "/mcp",
                octicon: "copilot"
            }, {
                title: "Open Source",
                url: "/open-source",
                octicon: "git-pull-request"
            }, {
                title: "Open Source Accelerator",
                url: "/open-source/accelerator",
                octicon: "rocket"
            }, {
                title: "Pricing",
                url: "/pricing",
                octicon: "credit-card"
            }, {
                title: "Resources",
                url: "https://resources.github.com",
                octicon: "book"
            }, {
                title: "Secure your code",
                url: "/features/security/code-scanning",
                octicon: "shield-check"
            }, {
                title: "Security features",
                url: "/features/security",
                octicon: "shield-check"
            }, {
                title: "Software supply chain",
                url: "/features/security/software-supply-chain",
                octicon: "shield-check"
            }, {
                title: "Solutions",
                url: "/solutions",
                octicon: "beaker"
            }, {
                title: "Startups",
                url: "/enterprise/startups",
                octicon: "rocket"
            }, {
                title: "Team",
                url: "/team",
                octicon: "organization"
            }, {
                title: "The ReadME Project",
                url: "/readme",
                octicon: "book"
            }, {
                title: "The ReadME Podcast",
                url: "/readme/podcast",
                octicon: "play"
            }, {
                title: "Trending",
                url: "/trending",
                octicon: "graph"
            }, {
                title: "Feature Previews",
                url: "/features/preview",
                octicon: "gift"
            }, {
                title: "Code Search",
                url: "/features/code-search",
                octicon: "code-square"
            }, {
                title: "GitHub Changelog",
                url: "https://github.blog/changelog",
                octicon: "book"
            }, {
                title: "GitHub Shop",
                url: "https://www.thegithubshop.com/",
                octicon: "gift"
            }, {
                title: "GitHub Desktop",
                url: "https://desktop.github.com",
                octicon: "device-desktop"
            }, {
                title: "Why GitHub",
                url: "/why-github",
                octicon: "mark-github"
            }];
        class O extends EventTarget {
            priority = 11;
            name = "Explore";
            singularItemName = "explore page";
            value = "explore";
            type = "search";
            manuallyDetermineFilterEligibility = !0;#
            h = null;#
            p = null;
            queryBuilder;
            constructor(e) {
                super(), this.queryBuilder = e, this.queryBuilder.addEventListener("query", this)
            }#
            m() {
                let e = Promise.resolve($);
                return this.dispatchEvent(new h.dS(e)), e
            }#
            g() {
                let e = Promise.resolve(I);
                return this.dispatchEvent(new h.dS(e)), e
            }
            async# f() {
                for (let e of (this.#p = await this.#g(), this.#p)) this.dispatchEvent(new h.CN({
                    value: e.title,
                    icon: e.octicon,
                    priority: 11,
                    scope: "EXPLORE",
                    action: {
                        url: `${e.url}?ref_loc=search`
                    }
                }))
            }
            async handleEvent(e) {
                let t = window.location.pathname,
                    r = "/" === t || "/home" === t,
                    o = $.some(e => e.url.startsWith("/") && t.startsWith(e.url));
                if (!r && !o && !window.__vitest_browser__) return [];
                let i = e.parsedMetadata;
                if (!i ? .query) return await this.#f(), [];
                null === this.#h && (this.#h = await this.#m());
                let a = i ? .query;
                i ? .caretSelectedNode && (0, n.bY)(i ? .caretSelectedNode) && (a = (0, n.cK)(i.caretSelectedNode.content) ? i.caretSelectedNode.content.value : "");
                let s = this.#h;
                if (a && a.length > 0) {
                    let e = a.replace(/\s/g, "");
                    s = (0, g.d)(this.#h, t => {
                        let r = (0, y.dt)(t.title, e);
                        return r > 0 ? {
                            score: r,
                            text: t.title
                        } : null
                    }, y.UD)
                }
                for (let e of s.slice(0, 5)) this.dispatchEvent(new h.CN({
                    value: e.title,
                    icon: e.octicon,
                    priority: 11,
                    scope: "EXPLORE",
                    action: {
                        url: `${e.url}?q=${a}&ref_loc=search`
                    }
                }))
            }
        }
        var M = r(209358),
            F = r(570170),
            H = r(57027),
            U = r(418987),
            K = r(374395);
        let j = "is:issue is:open assignee:@me";
        class G extends EventTarget {
            priority = 10;
            name = "Copilot";
            singularItemName = "copilot";
            value = "copilot";
            type = "search";#
            y = !1;#
            b = !1;#
            t;#
            w;#
            S;#
            v = new AbortController;#
            C;
            queryBuilder;
            constructor(e, t) {
                super(), this.queryBuilder = e, this.queryBuilder.addEventListener("query", this), this.#t = t, this.#w = this.#t.getAttribute("data-current-repository"), this.#y = "true" === this.#t.getAttribute("data-copilot-chat-enabled"), this.#b = "true" === this.#t.getAttribute("data-nl-search-enabled"), this.#S = this.#t.getAttribute("data-nl-search-csrf"), this.#C = new U.JR([])
            }
            fetchIndexStatusPromise(e, t) {
                return fetch(new URL(`/search/check_indexing_status?nwo=${encodeURIComponent(e)}`, window.location.origin).href, {
                    method: "GET",
                    mode: "same-origin",
                    headers: {
                        Accept: "application/json",
                        "Scoped-CSRF-Token": t,
                        ...(0, K.kt)()
                    }
                })
            }
            primerSpinner() {
                return {
                    html: `<svg style="box-sizing: content-box; color: var(--color-icon-primary); fill: none" width="16" height="16" viewBox="0 0 16 16" class="anim-rotate">
  <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-opacity="0.25" stroke-width="2" vector-effect="non-scaling-stroke" fill="none"></circle>
  <path d="M15 8a7.002 7.002 0 00-7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" vector-effect="non-scaling-stroke"></path>
</svg>`
                }
            }
            async handleEvent(e) {
                if (!this.#y) return;
                let t = e.parsedMetadata;
                if (!t || t.caretPositionKind !== n.Z.Text) return;
                let r = t ? .query.trim() ? ? "";
                this.dispatchEvent(new M.CN({
                    value: "Chat with Copilot",
                    scope: "COPILOT_CHAT",
                    icon: M.m4.Copilot,
                    priority: 0,
                    action: {
                        commandName: "search-copilot-chat",
                        data: {
                            content: r,
                            repoNwo: this.#w
                        }
                    }
                })), this.#b && (r ? this.dispatchEvent(new M.CN({
                    id: "copilot-nl-search",
                    value: r,
                    scope: "COPILOT_SEARCH",
                    icon: r === j ? M.m4.Copilot : this.primerSpinner(),
                    priority: 0,
                    action: {
                        commandName: "no-op",
                        data: {}
                    }
                })) : this.dispatchEvent(new M.CN({
                    id: "copilot-nl-search",
                    value: j,
                    scope: "COPILOT_SEARCH",
                    icon: M.m4.Copilot,
                    priority: 0,
                    action: {
                        commandName: "convert-to-query-syntax",
                        data: {
                            content: j
                        }
                    }
                })), this.queryCopilotSearchDebounced(e))
            }
            queryCopilotSearch = async e => {
                let t = e.parsedMetadata,
                    r = t ? .query.trim() ? ? "";
                if (this.#S && r && r !== j) try {
                    let e;
                    try {
                        e = await this.#C.getAuthToken()
                    } catch (e) {
                        if (e instanceof U.yj) {
                            this.#S = null;
                            return
                        }
                        throw e
                    }
                    this.#v.abort(), this.#v = new AbortController;
                    let t = await (0, H.lS)("/copilot/completions/nl-search", {
                        method: "POST",
                        body: {
                            query: r
                        },
                        headers: {
                            "Scoped-CSRF-Token": this.#S,
                            "X-Copilot-Api-Token": e.value
                        },
                        signal: this.#v.signal
                    });
                    if (!t.ok) return this.dispatchEvent(new M.CN({
                        isUpdate: !0,
                        id: "copilot-nl-search",
                        value: "There was an error parsing your query",
                        scope: "COPILOT_SEARCH",
                        icon: M.m4.CopilotError,
                        priority: 0,
                        action: {
                            commandName: "no-op",
                            data: {}
                        }
                    }));
                    let o = await t.json();
                    r.length > 0 && this.#b && this.dispatchEvent(new M.CN({
                        isUpdate: !0,
                        id: "copilot-nl-search",
                        value: o.query || r,
                        scope: "COPILOT_SEARCH",
                        icon: M.m4.Copilot,
                        priority: 0,
                        action: {
                            commandName: "convert-to-query-syntax",
                            data: {
                                content: o.query || r
                            }
                        }
                    }))
                } catch (e) {
                    if (e instanceof Error && "AbortError" === e.name) return;
                    this.dispatchEvent(new M.CN({
                        isUpdate: !0,
                        id: "copilot-nl-search",
                        value: "There was an error parsing your query",
                        scope: "COPILOT_SEARCH",
                        icon: M.m4.CopilotError,
                        priority: 0,
                        action: {
                            commandName: "no-op",
                            data: {}
                        }
                    }));
                    return
                }
            };
            queryCopilotSearchDebounced = (0, F.s)(this.queryCopilotSearch, 1e3)
        }
        var Q = r(158331),
            V = r(303072);
        let Z = String.fromCharCode(160),
            J = (0, _.G7)("marketing_pages_search_explore_provider"),
            W = () => (0, _.G7)("new_quick_search_dotcom");
        class Y extends HTMLElement {
            headerRedesignEnabled = !1;#
            E;#
            q;
            blackbirdCaches = new c.L;#
            k = !1;
            ast;#
            T = n.Z.Text;#
            A;
            parsing;
            parsingPromise;#
            L;#
            N;#
            x = null;#
            B;#
            P = !1;
            parser = {
                parse: (e, t) => {
                    let r, o;
                    if (!this.parsing) return (e || this.classList.contains("expanded")) && (async () => {
                        await this.loadParser(), this.queryBuilder.parseQuery()
                    })(), {
                        query: e
                    };
                    let [i] = this.parsing.parseSearchInput(e), n = this.#R(i);
                    if (void 0 !== t) {
                        let e = this.parsing.getCaretPositionKindFromIndex(i, t);
                        r = e.kind, o = e.node
                    }
                    return {
                        ast: i,
                        query: e,
                        caretPositionKind: r,
                        caretSelectedNode: o,
                        customScopes: n
                    }
                },
                flatten: this.flattenASTForQueryBuilder.bind(this)
            };
            get placeholderText() {
                return 'Type <kbd class="AppHeader-search-kbd">/</kbd> to search'
            }
            get query() {
                return this.queryBuilder.input ? .value || ""
            }
            set query(e) {
                this.queryBuilder.input && (this.queryBuilder.input.value = e, this.queryBuilder.parseQuery(), this.setButtonText(e), (async () => {
                    await this.parseSearchInputRaw(), this.syncRichButtonText()
                })())
            }
            flattenASTForQueryBuilder(e) {
                let t = this.parsing ? .getHighlights(e.ast) || [];
                t.sort((e, t) => e.location.start - t.location.start);
                let r = 0,
                    o = [];
                for (let i of t) {
                    if (i.location.start > r && o.push({
                            type: "text",
                            value: e.query.substring(r, i.location.start)
                        }), r > i.location.start) continue;
                    let t = h.VJ.Normal;
                    "pl-en" === i.className ? t = h.VJ.Entity : "pl-c1" === i.className ? t = h.VJ.Constant : "input-parsed-symbol" === i.className && (t = h.VJ.FilterValue), o.push({
                        type: "text",
                        value: e.query.substring(i.location.start, i.location.end),
                        style: t
                    }), r = i.location.end
                }
                return r < e.query.length && o.push({
                    type: "text",
                    value: e.query.substring(r)
                }), o
            }
            isRetainScrollPosition() {
                return "true" === this.getAttribute("data-retain-scroll-position")
            }
            copilotChatEnabled() {
                return "true" === this.getAttribute("data-copilot-chat-enabled")
            }
            connectedCallback() {
                this.#E = !1, (0, B.M3)() && (this.#B = this.getAttribute("data-custom-scopes-path") || "", this.#L = new k(this.queryBuilder, this.#B), (async () => {
                    await window.customElements.whenDefined("custom-scopes"), this.customScopesManager.initialize(this.#L.customScopesCache, () => this.#L.fetchSuggestions(), this.#B, this.getAttribute("data-delete-custom-scopes-csrf") || ""), this.#P = !0
                })());
                let {
                    signal: e
                } = this.#q = new AbortController;
                window.addEventListener(Q.TE, () => {
                    this.#E = !0
                }, {
                    signal: e
                }), window.addEventListener(Q.fL, () => {
                    this.#E = !1
                }, {
                    signal: e
                }), W() || window.addEventListener(Q.Bp, () => {
                    this.feedbackDialog instanceof HTMLDialogElement ? this.feedbackDialog.showModal() : this.feedbackDialog.show()
                }, {
                    signal: e
                }), window.addEventListener(Q.lQ, e => {
                    let t = e.detail;
                    this.setGlobalNavVisibility(t), this.setGlobalBarAlwaysExpanded(!t), this.#k = !t, this.#k ? this.classList.add("flex-1") : this.classList.remove("flex-1"), this.setButtonText(this.query)
                }, {
                    signal: e
                }), (0, V.h_)(), window.addEventListener(Q.qO, e => {
                    this.query = e.detail
                }, {
                    signal: e
                }), W() || window.addEventListener(Q.HG, async e => {
                    let {
                        appendQuery: t,
                        retainScrollPosition: r,
                        returnTarget: o
                    } = e.detail;
                    o && r ? this.expandAndRetainScrollPosition(o) : (await this.expand(this.isRetainScrollPosition()), o && (this.#x = o)), t && !this.query.trim().endsWith(t) && (this.query += ` ${t}`), this.parsing || await this.loadParser(), this.moveCaretToEndOfInput(), await this.parseSearchInputRaw()
                }, {
                    signal: e
                }), window.addEventListener(Q.As, e => {
                    this.saveQueryAsCustomScope(e)
                }, {
                    signal: e
                }), (async () => {
                    await window.customElements.whenDefined("query-builder");
                    let e = [new m(this.queryBuilder), new k(this.queryBuilder, this.#B), new P(this.queryBuilder, this), new G(this.queryBuilder, this)],
                        t = J ? [new O(this.queryBuilder)] : [],
                        r = [new w(this.queryBuilder), new C(this.queryBuilder, this), new E(this.queryBuilder, this), new T(this.queryBuilder, this), new A(this.queryBuilder), new L(this.queryBuilder, this), new N(this.queryBuilder, this), new D(this.queryBuilder, this)];
                    (0, B.M3)() ? r.push(...e): r.push(...t), this.queryBuilder.initialize(this.parser, r), this.query = this.getAttribute("data-initial-value") || ""
                })(), this.queryBuilder.parentElement ? .addEventListener("submit", e => {
                    this.search(this.queryBuilder.query), this.retract(), this.queryBuilder.inputSubmit(), e.preventDefault()
                }), this.queryBuilder.addEventListener("blackbird-monolith.manageCustomScopes", e => {
                    this.#P && this.#D(e)
                }), this.queryBuilder.addEventListener("query-builder:navigate", e => {
                    let t = e.detail ? .url;
                    if (t) {
                        let e = new URL(t, window.location.origin);
                        if (e.origin === window.location.origin && e.pathname === window.location.pathname) {
                            let t = (0, d.$c)(e.hash);
                            t.blobRange ? .start ? .line && window.dispatchEvent(new CustomEvent("react_blob_view_scroll_line_into_view", {
                                detail: {
                                    line: t.blobRange.start.line
                                }
                            }))
                        }
                    }
                    this.retract()
                }), this.queryBuilder.addEventListener("blackbird-monolith.search", e => {
                    this.search(e.detail ? .query ? ? "")
                }), this.queryBuilder.addEventListener("search-copilot-chat", e => {
                    window.dispatchEvent(new z(e.detail ? .content, e.detail ? .repoNwo)), this.retract()
                }), this.queryBuilder.addEventListener("convert-to-query-syntax", async e => {
                    (0, s.BI)("copilot_natural_language_github_search"), this.search(e.detail.content), this.retract()
                }), (0, a.D_)(window.location.pathname)
            }
            syncRichButtonText() {
                if (this.#k)
                    if ("" === this.query) {
                        if (document.dispatchEvent(new CustomEvent("qbsearch-input:updateText", {
                                detail: {
                                    searchTextBlocks: []
                                }
                            })), !this.inputButton) return;
                        this.inputButton.getAttribute("placeholder") ? this.inputButtonText.textContent = this.inputButton.getAttribute("placeholder") : this.inputButtonText.innerHTML = this.placeholderText, this.inputButton.classList.add("placeholder")
                    } else {
                        let e = this.parser.flatten(this.parser.parse(this.query, void 0)),
                            t = [],
                            r = [];
                        for (let o of e) {
                            let e = document.createElement("span");
                            e.textContent = o.value, o.style === h.VJ.FilterValue ? (e.classList.add("input-parsed-symbol"), r.push({
                                type: "filter",
                                value: o.value
                            })) : o.style === h.VJ.Constant ? (e.classList.add("pl-c1"), r.push({
                                type: "constant",
                                value: o.value
                            })) : o.style === h.VJ.Entity ? (e.classList.add("pl-en"), r.push({
                                type: "entity",
                                value: o.value
                            })) : r.push({
                                type: "value",
                                value: o.value
                            }), t.push(e)
                        }
                        document.dispatchEvent(new CustomEvent("qbsearch-input:updateText", {
                            detail: {
                                searchTextBlocks: r
                            }
                        })), this.inputButtonText ? .replaceChildren(...t)
                    }
            }
            setButtonText(e) {
                this.inputButton && (this.#k && "" !== e.trim() ? (this.inputButtonText.textContent = e, this.inputButton.classList.remove("placeholder")) : (this.inputButton.getAttribute("placeholder") ? this.inputButtonText.textContent = this.inputButton.getAttribute("placeholder") : this.inputButtonText.innerHTML.trim() !== this.placeholderText && (this.inputButtonText.innerHTML = this.placeholderText), this.inputButton.classList.add("placeholder")))
            }
            async moveCaretToEndOfInput() {
                await window.customElements.whenDefined("query-builder"), this.queryBuilder.moveCaretToEndOfInput()
            }
            disconnectedCallback() {
                this.#q ? .abort()
            }
            getSuggestionInputState() {
                let e = [];
                return this.ast && (e = this.#R(this.ast)), {
                    query: this.query.replaceAll(Z, " "),
                    ast: this.ast,
                    selectedNode: this.#A,
                    mode: this.#T,
                    customScopes: e,
                    type: this.ast ? this.chooseSearchType(this.ast) : ""
                }
            }
            setGlobalNavVisibility(e) {
                let t = document.querySelector("#global-nav"),
                    r = window.matchMedia("(min-width: 768px)");
                t && r.matches && (t.hidden = !e)
            }
            setGlobalBarAlwaysExpanded(e) {
                if (!this.headerRedesignEnabled) return;
                let t = document.querySelector(".js-global-bar");
                t && (e ? t.classList.add("always-expanded") : t.classList.remove("always-expanded"))
            }
            setGlobalBarModalOpen(e) {
                if (!this.headerRedesignEnabled) return;
                let t = document.querySelector(".js-global-bar");
                t && (e ? t.classList.add("search-expanded") : t.classList.remove("search-expanded"))
            }
            searchInputContainerClicked(e) {
                e.target.classList.contains("search-input-container") && this.expand(this.isRetainScrollPosition()), (0, s.BI)("blackbird.click", {
                    target: "SEARCH_BOX"
                })
            }
            async updateQueryBuilderVisibility() {
                await window.customElements.whenDefined("query-builder"), this.queryBuilderContainer.hidden = !this.classList.contains("expanded"), this.darkBackdrop.hidden = this.queryBuilderContainer.hidden
            }
            expandAndRetainScrollPosition(e) {
                if (this.isRetainScrollPosition()) return this.expand(!0);
                window.scrollY > 200 ? (this.classList.add("search-input-absolute"), this.style.top = `${window.scrollY+25}px`, this.expand(!0), this.#x = e) : this.expand()
            }
            handleExpand() {
                this.expand(this.isRetainScrollPosition())
            }
            async expand(e) {
                this.classList.contains("expanded") || (e || window.scrollTo(0, 0), this.blackbirdCaches.setupWarmCachesLoop(), this.#x = document.activeElement, this.searchSuggestionsDialog instanceof HTMLDialogElement ? this.searchSuggestionsDialog.showModal() : this.searchSuggestionsDialog.show(), this.classList.add("expanded"), this.setGlobalNavVisibility(!1), this.setGlobalBarModalOpen(!0), this.updateQueryBuilderVisibility(), await window.customElements.whenDefined("query-builder"), "" === this.query && this.getAttribute("data-scope") && (this.query = `${this.getAttribute("data-scope")} `), this.queryBuilder.inputFocus(), this.moveCaretToEndOfInput(), this.queryBuilder.inputChange(), this.parseSearchInputRaw(), document.dispatchEvent(new CustomEvent("qbsearch-input:expand", {
                    detail: {
                        element: this
                    }
                })))
            }
            handleClose = e => {
                this.syncRichButtonText(), this.classList.remove("expanded"), this.#k || this.setGlobalNavVisibility(!0), this.setGlobalBarModalOpen(!1), this.updateQueryBuilderVisibility(), e.preventDefault(), this.classList.contains("search-input-absolute") && this.classList.remove("search-input-absolute"), setTimeout(() => {
                    this.#x ? .focus(), document.dispatchEvent(new CustomEvent("qbsearch-input:close", {
                        detail: {
                            element: this
                        }
                    }))
                }, 0)
            };
            closeDialog = () => {
                setTimeout(() => {
                    this.setAttribute("hidden", "true"), this.#x ? .focus()
                }, 0)
            };
            retract = () => {
                this.searchSuggestionsDialog.close(), this.#x ? .focus()
            };
            chooseSearchType(e) {
                let t = new URLSearchParams(window.location.search).get("type");
                return t ? this.parsing.mapURLParamToSearchType(t) : this.parsing.chooseSearchType(e, (0, B.M3)())
            }
            async search(e, t = !1) {
                let r = await this.loadParser(),
                    o = r.parseString(e),
                    i = this.#R(o),
                    a = r.mapSearchTypeToURLParam(this.chooseSearchType(o)),
                    s = (0, n.r3)(o, window.location.pathname);
                if (s) return void(0, l.softNavigate)(s);
                if (this.#E && !t) {
                    let t = {
                        type: a,
                        p: null,
                        l: null
                    };
                    i.length > 0 ? (t.saved_searches = JSON.stringify(i), t.expanded_query = r.getExpandedQuery(e, i, o)) : (t.saved_searches = void 0, t.expanded_query = void 0), (0, V.rS)(e, t)
                } else {
                    let n = "";
                    "" !== a && (n = `&type=${encodeURIComponent(a)}`);
                    let s = `/search?q=${encodeURIComponent(e)}${n}`;
                    if (i.length > 0) {
                        s += `&saved_searches=${encodeURIComponent(JSON.stringify(i))}`;
                        let t = encodeURIComponent(r.getExpandedQuery(e, i, o));
                        s += `&expanded_query=${t}`
                    }
                    let c = (0, u.Bx)().join(",");
                    "" !== c && (s += `&experiments=${c}`), t ? window.open(s, "_blank") : (0, l.softNavigate)(s)
                }
            }#
            R(e) {
                let t;
                if (!this.parsing) return [];
                let r = this.parsing.getCustomScopeNames(e);
                try {
                    t = JSON.parse(new URLSearchParams(window.location.search).get("saved_searches") || "[]"), Array.isArray(t) || (t = [])
                } catch {
                    t = []
                }
                let o = [];
                for (let e of r) {
                    let r = t.find(t => t.name === e || `"${t.name}"` === e) || this.#L.customScopesCache.get() ? .find(t => t.name === e || `"${t.name}"` === e);
                    r && o.push({
                        name: r.name,
                        query: r.query
                    })
                }
                return o
            }
            setLocalHistory(e) {
                if ("" === e.trim()) return;
                let t = JSON.parse(window.localStorage.getItem("github-search-history") ? ? "[]");
                t.length >= 50 && (t = t.slice(0, 49)), t.find(t => t.toLowerCase() === e.toLowerCase()) || t.unshift(e), window.localStorage.setItem("github-search-history", JSON.stringify(t))
            }
            handleChange() {
                this.parseSearchInput()
            }
            async loadParser() {
                return this.parsingPromise || (this.parsingPromise = r.e(51465).then(r.bind(r, 898640)), this.parsing = await this.parsingPromise), this.parsingPromise
            }#
            _ = !1;#
            I = 0;
            parseSearchInput() {
                let e = Date.now();
                e - this.#I > 15 && !this.#_ ? this.parseSearchInputRaw() : this.#_ || (this.#_ = !0, setTimeout(() => {
                    this.#_ = !1, this.parseSearchInputRaw()
                }, 15 - (e - this.#I)))
            }
            async parseSearchInputRaw() {
                if (!this.query) {
                    this.lastParsedQuery = this.query, this.ast = {
                        kind: "Nothing"
                    }, this.#T = n.Z.Text, this.#A = void 0;
                    return
                }
                if (this.parsing || await this.loadParser(), this.#I = Date.now(), !this.ast || this.query !== this.lastParsedQuery) {
                    this.lastParsedQuery = this.query;
                    let [e] = this.parsing.parseSearchInput(this.lastParsedQuery);
                    this.ast = e
                }
                let e = this.parsing.getCaretPositionKindFromIndex(this.ast, 0);
                this.#T = e.kind, this.#A = e.node
            }
            handleSubmit(e = !1) {
                0 !== this.query.trim().length && (this.setLocalHistory(this.query), this.search(this.query, e), this.retract())
            }
            editCustomScope(e) {
                this.customScopesManager.editCustomScope(e)
            }
            async# D(e) {
                this.retract(), this.customScopesManager.show(), e.stopPropagation()
            }
            newCustomScope(e) {
                this.customScopesManager.create(""), e.stopPropagation()
            }
            saveQueryAsCustomScope(e) {
                this.customScopesManager.create(this.query), this.#N = e.detail
            }
            handleDialogClose() {
                setTimeout(() => {
                    this.#N ? (this.#N ? .focus(), this.#N = void 0) : this.inputButton && this.inputButton.focus()
                })
            }
            showFeedbackDialog(e) {
                this.feedbackDialog.show(), this.retract(), e.stopPropagation(), e.preventDefault()
            }
            async submitFeedback(e) {
                e.preventDefault();
                let t = e.target.form;
                await fetch(t.action, {
                    method: "POST",
                    body: new FormData(t)
                }), this.feedbackDialog.close()
            }
        }(0, o.Cg)([i.aC], Y.prototype, "inputButton", void 0), (0, o.Cg)([i.aC], Y.prototype, "inputButtonText", void 0), (0, o.Cg)([i.aC], Y.prototype, "queryBuilder", void 0), (0, o.Cg)([i.aC], Y.prototype, "queryBuilderContainer", void 0), (0, o.Cg)([i.aC], Y.prototype, "clearInputButton", void 0), (0, o.Cg)([i.aC], Y.prototype, "clearInputButtonSeparator", void 0), (0, o.Cg)([i.aC], Y.prototype, "searchSuggestionsDialog", void 0), (0, o.Cg)([i.aC], Y.prototype, "suggestionHeadingTemplate", void 0), (0, o.Cg)([i.aC], Y.prototype, "suggestionTemplate", void 0), (0, o.Cg)([i.aC], Y.prototype, "darkBackdrop", void 0), (0, o.Cg)([i.aC], Y.prototype, "customScopesManager", void 0), (0, o.Cg)([i.aC], Y.prototype, "feedbackDialog", void 0), (0, o.Cg)([i.CF], Y.prototype, "headerRedesignEnabled", void 0), Y = (0, o.Cg)([(0, i.p_)("qbsearch-input")], Y);
        class z extends Event {
            content;
            repoNwo;
            constructor(e, t) {
                super("search-copilot-chat", {
                    bubbles: !1,
                    cancelable: !0
                }), this.content = e, this.repoNwo = t
            }
        }
    },
    865206(e, t, r) {
        var o = r(984835);
        let i = "blackbird_experiments",
            n = "blackbird_debug_scoring";

        function a() {
            let e = (0, o.A)("localStorage").getItem(i);
            return e ? e.split(",") : []
        }

        function s(e) {
            0 === e.length ? (0, o.A)("localStorage").removeItem(i) : (0, o.A)("localStorage").setItem(i, e.join(","))
        }

        function l() {
            return null !== (0, o.A)("localStorage").getItem(n)
        }

        function c(e) {
            e ? (0, o.A)("localStorage").setItem(n, "1") : (0, o.A)("localStorage").removeItem(n)
        }
        r.d(t, {
            Bx: () => a,
            EL: () => c,
            WB: () => l,
            nc: () => s
        })
    },
    137558(e, t, r) {
        function o(e) {
            return !!e.qualifier
        }

        function i(e) {
            return !!o(e) && "Saved" === e.qualifier
        }
        let n = RegExp("\\/", "g"),
            a = /^[^/,]+$/;

        function s(e, t) {
            if (o(e) && l(e.content)) {
                if ("Repo" === e.qualifier) {
                    if (1 != [...e.content.value.toString().matchAll(n)].length) return null
                } else if ("Org" === e.qualifier) {
                    if (!a.test(e.content.value.toString())) return null
                } else if ("Enterprise" !== e.qualifier) return null;
                else if (0 != [...e.content.value.toString().matchAll(n)].length) return null;
                if (e.content.value.toString().startsWith("/")) return null;
                let r = `/${e.content.value.toString().split("/").map(encodeURIComponent).join("/")}`;
                return ("Enterprise" === e.qualifier && (r = `/enterprises${r}`), r === t) ? null : r
            }
            return null
        }

        function l(e) {
            return void 0 !== e.value
        }

        function c(e) {
            return !!e.children
        }

        function u(e) {
            return c(e) ? e.children.map(u).filter(e => e.length > 0).join(" ") : o(e) || "Regex" === e.kind ? "" : l(e) ? e.value.toString() : ""
        }

        function d(e) {
            if ("Not" === e.kind) return [];
            if (c(e)) return e.children.map(d).flat();
            if (o(e)) {
                if ("Repo" === e.qualifier && l(e.content)) return [{
                    kind: "repo",
                    value: e.content.value.toString()
                }];
                else if ("Org" === e.qualifier && l(e.content)) return [{
                    kind: "org",
                    value: e.content.value.toString()
                }];
                else if ("Enterprise" === e.qualifier && l(e.content)) return [{
                    kind: "enterprise",
                    value: e.content.value.toString()
                }];
                else if (i(e) && l(e.content)) return [{
                    kind: "saved",
                    value: e.content.value.toString()
                }]
            }
            return []
        }
        r.d(t, {
            Go: () => c,
            H5: () => d,
            Xq: () => u,
            YT: () => i,
            bY: () => o,
            cK: () => l,
            cZ: () => function e(t, r) {
                if (o(t) && t.qualifier === r) return !0;
                if (c(t)) {
                    for (let o of t.children)
                        if (e(o, r)) return !0
                }
                return !1
            },
            r3: () => s
        }, {
            Z: {
                Is: "Is",
                Repository: "Repository",
                Owner: "Owner",
                Enterprise: "Enterprise",
                Language: "Language",
                Path: "Path",
                Regex: "Regex",
                Text: "Text",
                Saved: "Saved",
                OtherQualifier: "OtherQualifier"
            }
        })
    },
    812195(e, t, r) {
        var o = r(747251),
            i = r(57027),
            n = r(374395);
        class a {
            static warmCachesLoopSetup = !1;
            static warmResolve;
            static warm = new Promise(e => {
                a.warmResolve = e
            });
            async setupWarmCachesLoop() {
                (0, o.M3)() && (a.warmCachesLoopSetup ? await a.warm : (a.warmCachesLoopSetup = !0, await this.warmCaches()))
            }
            async warmCaches() {
                let e = 54e4;
                try {
                    let t = await (0, i.lS)("/search/warm_blackbird_caches", {
                            headers: {
                                Accept: "application/json",
                                ...(0, n.kt)()
                            }
                        }),
                        r = await t.json();
                    e = new Date(r.userCacheExpiresAt).getTime() - Date.now() - 3e4, (isNaN(e) || e <= 5) && (e = 3e4)
                } catch {}
                a.warmResolve(), setTimeout(() => {
                    this.warmCaches()
                }, e)
            }
        }
        r.d(t, {
            L: () => a
        })
    },
    538395(e, t, r) {
        function o(e) {
            let t = e.match(/#?(?:L)(\d+)((?:C)(\d+))?/g);
            if (t) {
                if (1 === t.length) {
                    let e = s(t[0]);
                    if (!e) return;
                    return Object.freeze({
                        start: e,
                        end: e
                    })
                }
                if (2 !== t.length) return; {
                    let e = s(t[0]),
                        r = s(t[1]);
                    if (!e || !r) return;
                    return u(Object.freeze({
                        start: e,
                        end: r
                    }))
                }
            }
        }

        function i(e) {
            let {
                start: t,
                end: r
            } = u(e);
            return null != t.column && null != r.column ? `L${t.line}C${t.column}-L${r.line}C${r.column}` : null != t.column ? `L${t.line}C${t.column}-L${r.line}` : null != r.column ? `L${t.line}-L${r.line}C${r.column}` : t.line === r.line ? `L${t.line}` : `L${t.line}-L${r.line}`
        }

        function n(e) {
            let t;
            return {
                blobRange: o(e),
                anchorPrefix: (t = e.length < 5e3 && e.match(/(file-.+?-)L\d+?/i)) && t[1] ? t[1] : ""
            }
        }

        function a({
            anchorPrefix: e,
            blobRange: t
        }) {
            return t ? `#${e}${i(t)}` : "#"
        }

        function s(e) {
            if (!e) return null;
            let t = e.match(/L(\d+)/),
                r = e.match(/C(\d+)/);
            return t && t[1] ? Object.freeze({
                line: parseInt(t[1]),
                column: r && r[1] ? parseInt(r[1]) : null
            }) : null
        }

        function l(e, t) {
            let [r, o] = c(e.start, !0, t), [i, n] = c(e.end, !1, t);
            if (!r || !i) return;
            let a = o,
                s = n;
            if (-1 === a && (a = 0), -1 === s && (s = i.childNodes.length), !r.ownerDocument) throw Error("DOMRange needs to be inside document");
            let l = r.ownerDocument.createRange();
            return l.setStart(r, a), l.setEnd(i, s), l
        }

        function c(e, t, r) {
            let o = [null, 0],
                i = r(e.line);
            if (!i) return o;
            if (null == e.column) return [i, -1];
            let n = e.column - 1,
                a = function e(t) {
                    if (t.nodeType === Node.TEXT_NODE) return [t];
                    if (!t.childNodes || !t.childNodes.length) return [];
                    let r = [];
                    for (let o of t.childNodes) r = r.concat(e(o));
                    return r
                }(i);
            for (let e = 0; e < a.length; e++) {
                let r = a[e] || null,
                    o = n - (r ? .textContent || "").length;
                if (0 === o) {
                    let o = a[e + 1];
                    if (t && o) return [o, 0];
                    return [r, n]
                }
                if (o < 0) return [r, n];
                n = o
            }
            return o
        }

        function u(e) {
            let t = [e.start, e.end];
            return (t.sort(d), t[0] === e.start && t[1] === e.end) ? e : Object.freeze({
                start: t[0],
                end: t[1]
            })
        }

        function d(e, t) {
            return e.line === t.line && e.column === t.column ? 0 : e.line === t.line && "number" == typeof e.column && "number" == typeof t.column ? e.column - t.column : e.line - t.line
        }
        r.d(t, {
            $c: () => n,
            JB: () => a,
            Kn: () => i,
            Py: () => l,
            eC: () => o
        })
    },
    547276(e, t, r) {
        var o = r(432231);
        class i {
            value;
            expiration;
            ssoOrgIDs;
            constructor(e, t, r) {
                this.value = e, this.expiration = t, this.ssoOrgIDs = r
            }
            get authorizationHeaderValue() {
                return `GitHub-Bearer ${this.value}`
            }
            needsRefreshing(e) {
                return this.isExpired || this.ssoChanged(e)
            }
            get isExpired() {
                let e = new Date(this.expiration),
                    t = new Date(Date.UTC(e.getUTCFullYear(), e.getUTCMonth(), e.getUTCDate(), e.getUTCHours(), e.getUTCMinutes(), e.getUTCSeconds(), e.getUTCMilliseconds())),
                    r = (0, o.G7)("copilot_chat_increase_token_padding") ? 3e5 : 15e3;
                return t < new Date(Date.now() + r)
            }
            ssoChanged(e) {
                return !(this.ssoOrgIDs.every(t => e.includes(t)) && e.every(e => this.ssoOrgIDs.includes(e)))
            }
            static fromResult(e, t) {
                return new i(e.token, e.expiration, e.ssoOrgIDs ? ? t)
            }
            serialize() {
                return {
                    value: this.value,
                    expiration: this.expiration,
                    ssoOrgIDs: this.ssoOrgIDs
                }
            }
            static deserialize(e) {
                return new i(e.value, e.expiration, e.ssoOrgIDs)
            }
        }
        r.d(t, {
            Y: () => i
        })
    },
    418987(e, t, r) {
        var o = r(547276),
            i = r(984835),
            n = r(57027);
        let a = "COPILOT_AUTH_TOKEN";
        class s {#
            $;#
            O;
            ssoOrgIDs;
            currentAuthTokenRequest;
            isUnlicensed;
            copilotLocalStorage;
            constructor(e, t = "/github-copilot/chat/token", r = a) {
                this.ssoOrgIDs = e, this.currentAuthTokenRequest = null, this.isUnlicensed = !1, this.copilotLocalStorage = (0, i.A)("localStorage", {
                    throwQuotaErrorsOnSet: !1,
                    ttl: 864e5
                }), this.#O = r, this.#$ = t
            }
            get tokenEndpoint() {
                return this.#$
            }
            get storageKey() {
                return this.#O
            }
            async getAuthToken() {
                if (this.isUnlicensed) throw new l("User is not licensed for Copilot");
                let e = this.getLocalStorageAuthToken();
                return e ? this.validateAuthToken(e) : this.fetchAuthToken()
            }
            setLocalStorageAuthToken(e) {
                this.copilotLocalStorage.setItem(this.storageKey, JSON.stringify(e.serialize()))
            }
            getLocalStorageAuthToken() {
                let e = this.copilotLocalStorage.getItem(this.storageKey);
                return e ? o.Y.deserialize(JSON.parse(e)) : null
            }
            removeLocalStorageAuthToken() {
                this.copilotLocalStorage.removeItem(this.storageKey)
            }
            async validateAuthToken(e) {
                return e.needsRefreshing(this.ssoOrgIDs) ? this.fetchAuthToken() : e
            }
            fetchAuthToken(e = !1) {
                return e && (this.currentAuthTokenRequest = null), this.currentAuthTokenRequest || (this.currentAuthTokenRequest = this._fetchAuthToken(e)), this.currentAuthTokenRequest
            }
            async _fetchAuthToken(e = !1) {
                try {
                    let t = e ? `${this.tokenEndpoint}?force_refresh=true` : this.tokenEndpoint,
                        r = await (0, n.lS)(t, {
                            method: "POST"
                        });
                    if (r.ok) {
                        let e = await r.json(),
                            t = o.Y.fromResult(e, this.ssoOrgIDs);
                        return this.ssoOrgIDs = t.ssoOrgIDs, this.setLocalStorageAuthToken(t), this.isUnlicensed = !1, t
                    }
                    if (404 === r.status) throw this.isUnlicensed = !0, new l("Copilot auth token endpoint not found (404)");
                    throw Error("Failed to mint new auth token")
                } finally {
                    this.currentAuthTokenRequest = null
                }
            }
        }
        class l extends Error {
            constructor(e) {
                super(e), this.name = "CopilotAuthTokenUnlicensedError"
            }
        }
        r.d(t, {
            JR: () => s,
            yj: () => l
        }, {
            UZ: a
        })
    },
    772460(e, t, r) {
        r.d(t, {
            d: () => o
        });

        function o(e, t, r) {
            return [... function*(e, t) {
                for (let r of e) {
                    let e = t(r);
                    null != e && (yield e)
                }
            }(e, e => {
                let r = t(e);
                return null != r ? [e, r] : null
            })].sort((e, t) => r(e[1], t[1])).map(([e]) => e)
        }
    },
    76723(e, t, r) {
        function o(e, t, r = .1) {
            let i = a(e, t, r);
            return i && -1 === t.indexOf("/") && (i += a(e.substring(e.lastIndexOf("/") + 1), t, r)), i
        }

        function i(e, t, r) {
            if (t) {
                let o = e.innerHTML.trim().match(r || function(e) {
                    let t = e.toLowerCase().split(""),
                        r = "",
                        o = !0;
                    for (let e of t) {
                        let t = e.replace(/[\\^$*+?.()|[\]{}]/g, "\\$&");
                        o ? (r += `(.*)(${t})`, o = !1) : r += `([^${t}]*?)(${t})`
                    }
                    return RegExp(`${r}(.*?)$`, "i")
                }(t));
                if (!o) return;
                let i = !1,
                    n = [];
                for (let e = 1; e < o.length; ++e) {
                    let t = o[e];
                    t && (e % 2 == 0 ? i || (n.push("<mark>"), i = !0) : i && (n.push("</mark>"), i = !1), n.push(t))
                }
                e.innerHTML = n.join("")
            } else {
                let t = e.innerHTML.trim(),
                    r = t.replace(/<\/?mark>/g, "");
                t !== r && (e.innerHTML = r)
            }
        }
        let n = new Set([" ", "-", "_"]);

        function a(e, t, r = .1) {
            let o = e;
            if (o === t) return 1;
            let i = o.length,
                s = 0,
                l = 0,
                c = !0;
            for (let e of t) {
                let t = o.indexOf(e.toLowerCase()),
                    a = o.indexOf(e.toUpperCase()),
                    u = Math.min(t, a),
                    d = u > -1 ? u : Math.max(t, a);
                if (-1 === d) return 0;
                s += .1, o[d] === e && (s += .1), 0 === d && (s += .9 - r, c && (l = 1)), n.has(o.charAt(d - 1)) && (s += .9 - r), o = o.substring(d + 1, i), c = !1
            }
            let u = t.length,
                d = s / u,
                h = (u / i * d + d) / 2;
            return l && h + r < 1 && (h += r), h
        }

        function s(e, t) {
            return e.score > t.score ? -1 : e.score < t.score ? 1 : e.text < t.text ? -1 : 1 * !!(e.text > t.text)
        }
        r.d(t, {
            He: () => i,
            UD: () => s,
            dt: () => o
        })
    },
    65081(e, t, r) {
        var o = r(905225),
            i = r(541946),
            n = r(374395),
            a = r(57027);

        function s(e, t) {
            let r = new URL(e, window.location.origin),
                o = new URLSearchParams(r.search.slice(1));
            o.set("q", t);
            let i = new URLSearchParams(window.location.search).get("type");
            return i && o.set("type", i), r.search = o.toString(), r.toString()
        }

        function l(e, t) {
            let r = new URL(t, window.location.origin),
                o = new URLSearchParams(r.search.slice(1));
            return o.get("q") && o.set("q", e), r.search = o.toString(), r.toString()
        }
        let c = new Map;
        async function u(e, t) {
            let r = function() {
                let e = new FormData;
                for (let t of Object.keys((0, i.oP)()).slice(0, 10)) e.append("variables[pageViews][]", t);
                return e
            }();
            r.set("_method", "GET");
            let o = [],
                s = new URL(e, window.location.origin);
            location.search.match(/_tracing=true/) && s.searchParams.set("graphql_query_trace", "true");
            let l = await (0, a.Sr)(s.href, {
                method: "POST",
                mode: "same-origin",
                body: r,
                headers: {
                    Accept: "application/json",
                    "Scoped-CSRF-Token": t,
                    ...(0, n.kt)()
                }
            });
            l.ok && (o = function(e) {
                if ("errors" in e.data) return [];
                let t = 1,
                    r = [];
                for (let o of e.data.suggestions.nodes) null != o && (o.rank = t++, o.pageKey = function(e) {
                    let t, [r, o] = e.name.split("/") || [];
                    switch (e.type) {
                        case "Project":
                            if (!e.owner) throw Error("Project owner is required");
                            t = (0, i.Ti)(e.owner.name, `${e.number}`);
                            break;
                        case "Repository":
                            if (!r || !o) throw Error("Repository owner and name are required");
                            t = (0, i.g2)(r, o);
                            break;
                        case "Team":
                            if (!r || !o) throw Error("Team owner and name are required");
                            t = (0, i.$f)(r, o);
                            break;
                        default:
                            throw Error(`Invalid Suggestion type: ${e.type}`)
                    }
                    return t
                }(o), "Team" === o.type && (o.name = `@${o.name}`), r.push(o));
                return r
            }(await l.json()));
            let c = document.querySelector(".js-search-commands");
            if (c instanceof HTMLInputElement) {
                let e = c.value,
                    t = [];
                try {
                    t = JSON.parse(e).commands
                } catch {}
                o = o.concat(t)
            }
            return o
        }
        let d = 0,
            h = (0, o.A)(u, {
                cache: c
            });
        async function p(e) {
            let t = e.getAttribute("data-jump-to-suggestions-path");
            if (!t) throw Error("could not get jump to suggestions path");
            let r = function e(t, r) {
                let o = t.nextElementSibling;
                return o instanceof HTMLElement ? o.classList.contains(r) ? o : e(o, r) : null
            }(e, "js-data-jump-to-suggestions-path-csrf");
            return r ? (Date.now() - d > 5e3 && c.clear(), d = Date.now(), h(t, r.value)) : []
        }
        r.d(t, {
            KW: () => p,
            lW: () => l,
            u: () => s
        })
    },
    541946(e, t, r) {
        let o = /^\/orgs\/([a-z0-9-]+)\/teams\/([\w-]+)/,
            i = [/^\/([^/]+)\/([^/]+)\/?$/, /^\/([^/]+)\/([^/]+)\/blob/, /^\/([^/]+)\/([^/]+)\/tree/, /^\/([^/]+)\/([^/]+)\/issues/, /^\/([^/]+)\/([^/]+)\/pulls?/, /^\/([^/]+)\/([^/]+)\/pulse/],
            n = [
                ["organization", /^\/orgs\/([a-z0-9-]+)\/projects\/([0-9-]+)/],
                ["repository", /^\/([^/]+)\/([^/]+)\/projects\/([0-9-]+)/]
            ];

        function a(e) {
            let [t, r, a] = e.match(o) || [];
            if ("string" == typeof r && "string" == typeof a) return void s(l(r, a));
            for (let [t, r] of n) {
                let o = e.match(r);
                if (o) {
                    let e, r, [i, n, a, l] = o;
                    switch (t) {
                        case "organization":
                            e = n, r = a;
                            break;
                        case "repository":
                            e = `${n}/${a}`, r = l
                    }
                    e && r && s(u(e, r));
                    return
                }
            }
            for (let t of i) {
                let r = e.match(t);
                if (r) {
                    let [e, t, o] = r;
                    if ("string" != typeof t || "string" != typeof o) return;
                    s(c(t, o));
                    return
                }
            }
        }

        function s(e) {
            let t = m(),
                r = Math.floor(Date.now() / 1e3),
                o = t[e] || {
                    lastVisitedAt: r,
                    visitCount: 0
                };
            o.visitCount += 1, o.lastVisitedAt = r, t[e] = o, p(function(e) {
                let t = Object.keys(e);
                if (t.length <= 100) return e;
                let r = g(e);
                return Object.fromEntries(t.sort((e, t) => r(t) - r(e)).slice(0, 50).map(t => {
                    if (void 0 === e[t]) throw Error(`pageViews[${t}] is undefined`);
                    return [t, e[t]]
                }))
            }(t))
        }

        function l(e, t) {
            return `team:${e}/${t}`
        }

        function c(e, t) {
            return `repository:${e}/${t}`
        }

        function u(e, t) {
            return `project:${e}/${t}`
        }
        let d = /^(team|repository|project):[^/]+\/[^/]+(\/([^/]+))?$/,
            h = "jump_to:page_views";

        function p(e) {
            var t = h,
                r = JSON.stringify(e);
            try {
                window.localStorage.setItem(t, r)
            } catch {}
        }

        function m() {
            let e, t = function(e) {
                try {
                    return window.localStorage.getItem(e)
                } catch {
                    return null
                }
            }(h);
            if (!t) return {};
            try {
                e = JSON.parse(t)
            } catch {
                return p({}), {}
            }
            let r = {};
            for (let t in e) t.match(d) && (r[t] = e[t]);
            return r
        }

        function g(e) {
            var t, r, o, i;
            let n, a, s, l = (n = [...Object.values(t = e)].reduce((e, t) => e + t.visitCount, 0), new Map(Object.keys(t).map(e => {
                    if (void 0 === t[e]) throw Error(`pageViews[${e}] is undefined`);
                    return [e, t[e].visitCount / n]
                }))),
                c = (s = (a = (o = [...Object.keys(r = e)], i = e => r[e] ? .lastVisitedAt || 0, o.sort((e, t) => i(e) - i(t)))).length, new Map(a.map((e, t) => [e, (t + 1) / s])));
            return function(e) {
                var t;
                return t = l.get(e) || 0, .6 * t + .4 * (c.get(e) || 0)
            }
        }
        r.d(t, {
            $f: () => l,
            D_: () => a,
            Ti: () => u,
            g2: () => c,
            lM: () => g,
            oP: () => m
        })
    },
    303072(e, t, r) {
        var o = r(158331);

        function i({
            appendQuery: e,
            retainScrollPosition: t,
            returnTarget: r
        }) {
            window.dispatchEvent(new CustomEvent(o.HG, {
                detail: {
                    appendQuery: e,
                    retainScrollPosition: t,
                    returnTarget: r
                }
            }))
        }

        function n() {
            window.dispatchEvent(new CustomEvent(o.Tg))
        }

        function a(e, t) {
            window.dispatchEvent(new CustomEvent(o.CL, {
                detail: {
                    search: e,
                    searchParams: t
                }
            }))
        }

        function s() {
            window.dispatchEvent(new CustomEvent(o.TE))
        }

        function l() {
            window.dispatchEvent(new CustomEvent(o.fL))
        }

        function c(e) {
            window.dispatchEvent(new CustomEvent(o.lQ, {
                detail: e
            }))
        }

        function u(e) {
            window.dispatchEvent(new CustomEvent(o.qO, {
                detail: e
            }))
        }

        function d() {
            window.dispatchEvent(new CustomEvent(o.Bp))
        }

        function h(e) {
            window.dispatchEvent(new CustomEvent(o.As, {
                detail: e
            }))
        }
        r.d(t, {
            $U: () => d,
            D1: () => l,
            HD: () => s,
            ZR: () => i,
            Zb: () => h,
            dx: () => c,
            gw: () => u,
            h_: () => n,
            rS: () => a
        })
    },
    158331(e, t, r) {
        r.d(t, {}, {
            As: "blackbird_monolith_save_query_as_custom_scope",
            Bp: "blackbird_provide_feedback",
            CL: "blackbird_monolith_search",
            HG: "blackbird_monolith_append_and_focus_input",
            TE: "blackbird_monolith_react_connected",
            Tg: "blackbird_monolith_retransmit_react",
            fL: "blackbird_monolith_react_disconnected",
            lQ: "blackbird_monolith_set_global_nav_visibility",
            qO: "blackbird_monolith_update_input"
        })
    },
    737131(e, t, r) {
        var o = r(147966);
        r.d(t, {}, {
            softNavigate: (e, t) => {
                let r;
                try {
                    r = new URL(String(e), o.cg ? .location.href)
                } catch {
                    return
                }("http:" === r.protocol || "https:" === r.protocol) && (t ? .action === "replace" ? o.cg ? .location.replace(r.href) : o.cg ? .location.assign(r.href))
            }
        })
    },
    60612() {
        class e extends HTMLElement {
            get preload() {
                return this.hasAttribute("preload")
            }
            set preload(e) {
                e ? this.setAttribute("preload", "") : this.removeAttribute("preload")
            }
            get src() {
                return this.getAttribute("src") || ""
            }
            set src(e) {
                this.setAttribute("src", e)
            }
            connectedCallback() {
                var e;
                let c;
                this.hasAttribute("role") || this.setAttribute("role", "menu");
                let p = this.parentElement;
                if (!p) return;
                let m = p.querySelector("summary");
                m && (m.setAttribute("aria-haspopup", "menu"), m.hasAttribute("role") || m.setAttribute("role", "button"));
                let g = [o(p, "compositionstart", e => h(this, e)), o(p, "compositionend", e => h(this, e)), o(p, "click", e => l(p, e)), o(p, "change", e => l(p, e)), o(p, "keydown", e => (function(e, r, o) {
                    if (!(o instanceof KeyboardEvent) || e.querySelector("details[open]")) return;
                    let i = t.get(r);
                    if (!i || i.isComposing) return;
                    let n = o.target instanceof Element && "SUMMARY" === o.target.tagName;
                    switch (o.key) {
                        case "Escape":
                            e.hasAttribute("open") && (d(e), o.preventDefault(), o.stopPropagation());
                            break;
                        case "ArrowDown":
                            {
                                n && !e.hasAttribute("open") && e.setAttribute("open", "");
                                let t = a(e, !0);t && t.focus(),
                                o.preventDefault()
                            }
                            break;
                        case "ArrowUp":
                            {
                                n && !e.hasAttribute("open") && e.setAttribute("open", "");
                                let t = a(e, !1);t && t.focus(),
                                o.preventDefault()
                            }
                            break;
                        case "n":
                            if (s && o.ctrlKey) {
                                let t = a(e, !0);
                                t && t.focus(), o.preventDefault()
                            }
                            break;
                        case "p":
                            if (s && o.ctrlKey) {
                                let t = a(e, !1);
                                t && t.focus(), o.preventDefault()
                            }
                            break;
                        case " ":
                        case "Enter":
                            {
                                let t = document.activeElement;t instanceof HTMLElement && u(t) && t.closest("details") === e && (o.preventDefault(), o.stopPropagation(), t.click())
                            }
                    }
                })(p, this, e)), o(p, "toggle", () => i(p, this), {
                    once: !0
                }), o(p, "toggle", () => (function(e) {
                    if (e.hasAttribute("open"))
                        for (let t of document.querySelectorAll("details[open] > details-menu")) {
                            let r = t.closest("details");
                            r && r !== e && !r.contains(e) && r.removeAttribute("open")
                        }
                })(p)), this.preload ? o(p, "mouseover", () => i(p, this), {
                    once: !0
                }) : r, ...(c = !1, [o(e = p, "mousedown", () => c = !0), o(e, "keydown", () => c = !1), o(e, "toggle", () => {
                    e.hasAttribute("open") && !n(e) && (c || function(e) {
                        let t = document.activeElement;
                        if (t && u(t) && e.contains(t)) return;
                        let r = a(e, !0);
                        r && r.focus()
                    }(e))
                })])];
                t.set(this, {
                    subscriptions: g,
                    loaded: !1,
                    isComposing: !1
                })
            }
            disconnectedCallback() {
                let e = t.get(this);
                if (e)
                    for (let r of (t.delete(this), e.subscriptions)) r.unsubscribe()
            }
        }
        let t = new WeakMap,
            r = {
                unsubscribe() {}
            };

        function o(e, t, r, i = !1) {
            return e.addEventListener(t, r, i), {
                unsubscribe: () => {
                    e.removeEventListener(t, r, i)
                }
            }
        }

        function i(e, r) {
            let o = r.getAttribute("src");
            if (!o) return;
            let i = t.get(r);
            if (!i || i.loaded) return;
            i.loaded = !0;
            let a = r.querySelector("include-fragment");
            a && !a.hasAttribute("src") && (a.addEventListener("loadend", () => n(e)), a.setAttribute("src", o))
        }

        function n(e) {
            if (!e.hasAttribute("open")) return !1;
            let t = e.querySelector("details-menu [autofocus]");
            return !!t && (t.focus(), !0)
        }

        function a(e, t) {
            let r = Array.from(e.querySelectorAll('[role^="menuitem"]:not([hidden]):not([disabled])')),
                o = document.activeElement,
                i = o instanceof HTMLElement ? r.indexOf(o) : -1,
                n = t ? r[i + 1] : r[i - 1],
                a = t ? r[0] : r[r.length - 1];
            return n || a
        }
        let s = navigator.userAgent.match(/Macintosh/);

        function l(e, t) {
            let r = t.target;
            if (r instanceof Element && r.closest("details") === e) {
                if ("click" === t.type) {
                    let t = r.closest('[role="menuitem"], [role="menuitemradio"]');
                    if (!t) return;
                    let o = t.querySelector("input");
                    if ("LABEL" === t.tagName && r === o) return;
                    "LABEL" === t.tagName && o && !o.checked || c(t, e)
                } else if ("change" === t.type) {
                    let t = r.closest('[role="menuitemradio"], [role="menuitemcheckbox"]');
                    t && c(t, e)
                }
            }
        }

        function c(e, t) {
            if (e.hasAttribute("disabled") || "true" === e.getAttribute("aria-disabled")) return;
            let r = e.closest("details-menu");
            if (r && r.dispatchEvent(new CustomEvent("details-menu-select", {
                    cancelable: !0,
                    detail: {
                        relatedTarget: e
                    }
                }))) {
                ! function(e, t) {
                    let r = t.querySelector("[data-menu-button]");
                    if (!r) return;
                    let o = function(e) {
                        if (!e) return null;
                        let t = e.hasAttribute("data-menu-button-text") ? e : e.querySelector("[data-menu-button-text]");
                        return t ? t.getAttribute("data-menu-button-text") || t.textContent : null
                    }(e);
                    if (o) r.textContent = o;
                    else {
                        let t = function(e) {
                            if (!e) return null;
                            let t = e.hasAttribute("data-menu-button-contents") ? e : e.querySelector("[data-menu-button-contents]");
                            return t ? t.innerHTML : null
                        }(e);
                        t && (r.innerHTML = t)
                    }
                }(e, t);
                for (let r of t.querySelectorAll('[role="menuitemradio"], [role="menuitemcheckbox"]')) {
                    let t = r.querySelector('input[type="radio"], input[type="checkbox"]'),
                        o = (r === e).toString();
                    t instanceof HTMLInputElement && (o = t.indeterminate ? "mixed" : t.checked.toString()), r.setAttribute("aria-checked", o)
                }
                "menuitemcheckbox" !== e.getAttribute("role") && d(t), r.dispatchEvent(new CustomEvent("details-menu-selected", {
                    detail: {
                        relatedTarget: e
                    }
                }))
            }
        }

        function u(e) {
            let t = e.getAttribute("role");
            return "menuitem" === t || "menuitemcheckbox" === t || "menuitemradio" === t
        }

        function d(e) {
            if (!e.hasAttribute("open")) return;
            e.removeAttribute("open");
            let t = e.querySelector("summary");
            t && t.focus()
        }

        function h(e, r) {
            let o = t.get(e);
            o && (o.isComposing = "compositionstart" === r.type)
        }
        window.customElements.get("details-menu") || (window.DetailsMenuElement = e, window.customElements.define("details-menu", e))
    }
};
//# sourceMappingURL=chunk-lazy-element-qbsearch-input-921202ea92efb41e-bd2dadbd014e8ada.js.map