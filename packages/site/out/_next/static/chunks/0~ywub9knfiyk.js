(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([
    'object' == typeof document ? document.currentScript : void 0,
    77123,
    e => {
        'use strict';
        var r = e.i(13759);
        e.s(['forEach', () => r.default]);
    },
    15987,
    e => {
        'use strict';
        var r = Object.prototype.hasOwnProperty;
        let t = function (e, t) {
            return null != e && r.call(e, t);
        };
        var a = e.i(40160);
        e.s(
            [
                'has',
                0,
                function (e, r) {
                    return null != e && (0, a.default)(e, r, t);
                }
            ],
            15987
        );
    },
    80792,
    86587,
    34197,
    93776,
    e => {
        'use strict';
        var r = e.i(1912),
            t = e.i(75811),
            a = e.i(32505),
            i = e.i(28793);
        let n = function (e, r) {
            var t = -1,
                n = (0, i.default)(e) ? Array(e.length) : [];
            return (
                (0, a.default)(e, function (e, a, i) {
                    n[++t] = r(e, a, i);
                }),
                n
            );
        };
        e.s(['default', 0, n], 86587);
        var s = e.i(94878);
        let u = function (e, a) {
            return ((0, s.default)(e) ? r.default : n)(e, (0, t.default)(a, 3));
        };
        (e.s(['default', 0, u], 34197), e.s(['map', 0, u], 80792));
        var l = /\s/;
        let o = function (e) {
            for (var r = e.length; r-- && l.test(e.charAt(r)); );
            return r;
        };
        var c = /^\s+/,
            d = e.i(91947),
            m = e.i(85647),
            f = 0 / 0,
            v = /^[-+]0x[0-9a-f]+$/i,
            p = /^0b[01]+$/i,
            h = /^0o[0-7]+$/i,
            _ = parseInt;
        let g = function (e) {
            if ('number' == typeof e) return e;
            if ((0, m.default)(e)) return f;
            if ((0, d.default)(e)) {
                var r,
                    t = 'function' == typeof e.valueOf ? e.valueOf() : e;
                e = (0, d.default)(t) ? t + '' : t;
            }
            if ('string' != typeof e) return 0 === e ? e : +e;
            e = (r = e) ? r.slice(0, o(r) + 1).replace(c, '') : r;
            var a = p.test(e);
            return a || h.test(e) ? _(e.slice(2), a ? 2 : 8) : v.test(e) ? f : +e;
        };
        var C = 1 / 0;
        e.s(
            [
                'default',
                0,
                function (e) {
                    return e ? ((e = g(e)) === C || e === -C ? (e < 0 ? -1 : 1) * 17976931348623157e292 : e == e ? e : 0) : 0 === e ? e : 0;
                }
            ],
            93776
        );
    },
    40439,
    e => {
        'use strict';
        var r = e.i(93776);
        e.s([
            'default',
            0,
            function (e) {
                var t = (0, r.default)(e),
                    a = t % 1;
                return t == t ? (a ? t - a : t) : 0;
            }
        ]);
    },
    28709,
    e => {
        'use strict';
        var r = e.i(24277),
            t = e.i(94878),
            a = e.i(24904);
        e.s([
            'default',
            0,
            function (e) {
                return 'string' == typeof e || (!(0, t.default)(e) && (0, a.default)(e) && '[object String]' == (0, r.default)(e));
            }
        ]);
    },
    95790,
    e => {
        'use strict';
        var r = e.i(88098),
            t = e.i(22523),
            a = e.i(43768),
            i = e.i(98546),
            n = e.i(91947),
            s = e.i(23925);
        let u = function (e, r, u, l) {
            if (!(0, n.default)(e)) return e;
            r = (0, a.default)(r, e);
            for (var o = -1, c = r.length, d = c - 1, m = e; null != m && ++o < c; ) {
                var f = (0, s.default)(r[o]),
                    v = u;
                if ('__proto__' === f || 'constructor' === f || 'prototype' === f) break;
                if (o != d) {
                    var p = m[f];
                    void 0 === (v = l ? l(p, f, m) : void 0) && (v = (0, n.default)(p) ? p : (0, i.default)(r[o + 1]) ? [] : {});
                }
                ((0, t.default)(m, f, v), (m = m[f]));
            }
            return e;
        };
        e.s(
            [
                'default',
                0,
                function (e, t, i) {
                    for (var n = -1, s = t.length, l = {}; ++n < s; ) {
                        var o = t[n],
                            c = (0, r.default)(e, o);
                        i(c, o) && u(l, (0, a.default)(o, e), c);
                    }
                    return l;
                }
            ],
            95790
        );
    },
    85898,
    9235,
    e => {
        'use strict';
        var r = e.i(17242);
        let t = function (e) {
            return (null == e ? 0 : e.length) ? (0, r.default)(e, 1) : [];
        };
        (e.s(['default', 0, t], 9235), e.s(['flatten', 0, t], 85898));
    },
    83511,
    e => {
        'use strict';
        var r = e.i(68464),
            t = e.i(7693),
            a = e.i(52056),
            i = e.i(65218),
            n = Object.prototype,
            s = n.hasOwnProperty,
            u = (0, r.default)(function (e, r) {
                e = Object(e);
                var u = -1,
                    l = r.length,
                    o = l > 2 ? r[2] : void 0;
                for (o && (0, a.default)(r[0], r[1], o) && (l = 1); ++u < l; )
                    for (var c = r[u], d = (0, i.default)(c), m = -1, f = d.length; ++m < f; ) {
                        var v = d[m],
                            p = e[v];
                        (void 0 === p || ((0, t.default)(p, n[v]) && !s.call(e, v))) && (e[v] = c[v]);
                    }
                return e;
            });
        e.s(['defaults', 0, u], 83511);
    },
    83375,
    e => {
        'use strict';
        var r = e.i(75811),
            t = e.i(28793),
            a = e.i(26054);
        e.s([
            'default',
            0,
            function (e) {
                return function (i, n, s) {
                    var u = Object(i);
                    if (!(0, t.default)(i)) {
                        var l = (0, r.default)(n, 3);
                        ((i = (0, a.default)(i)),
                            (n = function (e) {
                                return l(u[e], e, u);
                            }));
                    }
                    var o = e(i, n, s);
                    return o > -1 ? u[l ? i[o] : o] : void 0;
                };
            }
        ]);
    },
    18573,
    e => {
        'use strict';
        var r = e.i(83375),
            t = e.i(78562),
            a = e.i(75811),
            i = e.i(40439),
            n = Math.max,
            s = (0, r.default)(function (e, r, s) {
                var u = null == e ? 0 : e.length;
                if (!u) return -1;
                var l = null == s ? 0 : (0, i.default)(s);
                return (l < 0 && (l = n(u + l, 0)), (0, t.default)(e, (0, a.default)(r, 3), l));
            });
        e.s(['find', 0, s], 18573);
    },
    41929,
    e => {
        'use strict';
        var r = e.i(94878);
        e.s(['isArray', () => r.default]);
    },
    31490,
    e => {
        'use strict';
        e.s(
            [
                'last',
                0,
                function (e) {
                    var r = null == e ? 0 : e.length;
                    return r ? e[r - 1] : void 0;
                }
            ],
            31490
        );
    },
    22279,
    e => {
        'use strict';
        var r = e.i(85647);
        e.s([
            'default',
            0,
            function (e, t, a) {
                for (var i = -1, n = e.length; ++i < n; ) {
                    var s = e[i],
                        u = t(s);
                    if (null != u && (void 0 === l ? u == u && !(0, r.default)(u) : a(u, l)))
                        var l = u,
                            o = s;
                }
                return o;
            }
        ]);
    },
    99517,
    85639,
    e => {
        'use strict';
        var r = e.i(22279);
        let t = function (e, r) {
            return e < r;
        };
        e.s(['default', 0, t], 85639);
        var a = e.i(16481);
        e.s(
            [
                'default',
                0,
                function (e) {
                    return e && e.length ? (0, r.default)(e, a.default, t) : void 0;
                }
            ],
            99517
        );
    },
    8977,
    e => {
        'use strict';
        var r = e.i(49218);
        e.s([
            'default',
            0,
            function (e) {
                return (0, r.default)(e, 4);
            }
        ]);
    },
    94261,
    e => {
        'use strict';
        var r = e.i(8977);
        e.s(['clone', () => r.default]);
    },
    93634,
    e => {
        'use strict';
        var r = e.i(95530),
            t = e.i(25876),
            a = e.i(55794),
            i = e.i(89489),
            n = class extends r.AbstractMermaidTokenBuilder {
                static {
                    (0, r.__name)(this, 'InfoTokenBuilder');
                }
                constructor() {
                    super(['info', 'showInfo']);
                }
            },
            s = {
                parser: {
                    TokenBuilder: (0, r.__name)(() => new n(), 'TokenBuilder'),
                    ValueConverter: (0, r.__name)(() => new r.CommonValueConverter(), 'ValueConverter')
                }
            };
        function u(e = t.EmptyFileSystem) {
            let n = (0, i.inject)((0, a.createDefaultSharedCoreModule)(e), r.MermaidGeneratedSharedModule),
                l = (0, i.inject)((0, a.createDefaultCoreModule)({ shared: n }), r.InfoGrammarGeneratedModule, s);
            return (n.ServiceRegistry.register(l), { shared: n, Info: l });
        }
        ((0, r.__name)(u, 'createInfoServices'), e.s(['InfoModule', 0, s, 'createInfoServices', 0, u]));
    },
    87694,
    e => {
        'use strict';
        var r = e.i(95530),
            t = e.i(25876),
            a = e.i(55794),
            i = e.i(89489),
            n = class extends r.AbstractMermaidTokenBuilder {
                static {
                    (0, r.__name)(this, 'TreemapTokenBuilder');
                }
                constructor() {
                    super(['treemap']);
                }
            },
            s = /classDef\s+([A-Z_a-z]\w+)(?:\s+([^\n\r;]*))?;?/,
            u = class extends r.AbstractMermaidValueConverter {
                static {
                    (0, r.__name)(this, 'TreemapValueConverter');
                }
                runCustomConverter(e, r, t) {
                    if ('NUMBER2' === e.name) return parseFloat(r.replace(/,/g, ''));
                    if ('SEPARATOR' === e.name) return r.substring(1, r.length - 1);
                    if ('STRING2' === e.name) return r.substring(1, r.length - 1);
                    if ('INDENTATION' === e.name) return r.length;
                    if ('ClassDef' === e.name) {
                        if ('string' != typeof r) return r;
                        let e = s.exec(r);
                        if (e) return { $type: 'ClassDefStatement', className: e[1], styleText: e[2] || void 0 };
                    }
                }
            };
        function l(e) {
            let r = e.validation.TreemapValidator,
                t = e.validation.ValidationRegistry;
            if (t) {
                let e = { Treemap: r.checkSingleRoot.bind(r) };
                t.register(e, r);
            }
        }
        (0, r.__name)(l, 'registerValidationChecks');
        var o = class {
                static {
                    (0, r.__name)(this, 'TreemapValidator');
                }
                checkSingleRoot(e, r) {
                    let t;
                    for (let a of e.TreemapRows)
                        a.item &&
                            (void 0 === t && void 0 === a.indent
                                ? (t = 0)
                                : void 0 === a.indent
                                  ? r('error', 'Multiple root nodes are not allowed in a treemap.', { node: a, property: 'item' })
                                  : void 0 !== t &&
                                    t >= parseInt(a.indent, 10) &&
                                    r('error', 'Multiple root nodes are not allowed in a treemap.', { node: a, property: 'item' }));
                }
            },
            c = {
                parser: {
                    TokenBuilder: (0, r.__name)(() => new n(), 'TokenBuilder'),
                    ValueConverter: (0, r.__name)(() => new u(), 'ValueConverter')
                },
                validation: { TreemapValidator: (0, r.__name)(() => new o(), 'TreemapValidator') }
            };
        function d(e = t.EmptyFileSystem) {
            let n = (0, i.inject)((0, a.createDefaultSharedCoreModule)(e), r.MermaidGeneratedSharedModule),
                s = (0, i.inject)((0, a.createDefaultCoreModule)({ shared: n }), r.TreemapGrammarGeneratedModule, c);
            return (n.ServiceRegistry.register(s), l(s), { shared: n, Treemap: s });
        }
        ((0, r.__name)(d, 'createTreemapServices'), e.s(['TreemapModule', 0, c, 'createTreemapServices', 0, d]));
    },
    46858,
    e => {
        'use strict';
        var r = e.i(95530),
            t = e.i(25876),
            a = e.i(55794),
            i = e.i(89489),
            n = class extends r.AbstractMermaidTokenBuilder {
                static {
                    (0, r.__name)(this, 'PieTokenBuilder');
                }
                constructor() {
                    super(['pie', 'showData']);
                }
            },
            s = class extends r.AbstractMermaidValueConverter {
                static {
                    (0, r.__name)(this, 'PieValueConverter');
                }
                runCustomConverter(e, r, t) {
                    if ('PIE_SECTION_LABEL' === e.name) return r.replace(/"/g, '').trim();
                }
            },
            u = {
                parser: {
                    TokenBuilder: (0, r.__name)(() => new n(), 'TokenBuilder'),
                    ValueConverter: (0, r.__name)(() => new s(), 'ValueConverter')
                }
            };
        function l(e = t.EmptyFileSystem) {
            let n = (0, i.inject)((0, a.createDefaultSharedCoreModule)(e), r.MermaidGeneratedSharedModule),
                s = (0, i.inject)((0, a.createDefaultCoreModule)({ shared: n }), r.PieGrammarGeneratedModule, u);
            return (n.ServiceRegistry.register(s), { shared: n, Pie: s });
        }
        ((0, r.__name)(l, 'createPieServices'), e.s(['PieModule', 0, u, 'createPieServices', 0, l]));
    },
    70356,
    e => {
        'use strict';
        var r = e.i(95530),
            t = e.i(25876),
            a = e.i(55794),
            i = e.i(89489),
            n = class extends r.AbstractMermaidTokenBuilder {
                static {
                    (0, r.__name)(this, 'ArchitectureTokenBuilder');
                }
                constructor() {
                    super(['architecture']);
                }
            },
            s = class extends r.AbstractMermaidValueConverter {
                static {
                    (0, r.__name)(this, 'ArchitectureValueConverter');
                }
                runCustomConverter(e, r, t) {
                    if ('ARCH_ICON' === e.name) return r.replace(/[()]/g, '').trim();
                    if ('ARCH_TEXT_ICON' === e.name) return r.replace(/["()]/g, '');
                    if ('ARCH_TITLE' === e.name) {
                        let e = r.replace(/^\[|]$/g, '').trim();
                        return (
                            ((e.startsWith('"') && e.endsWith('"')) || (e.startsWith("'") && e.endsWith("'"))) &&
                                (e = (e = e.slice(1, -1)).replace(/\\"/g, '"').replace(/\\'/g, "'")),
                            e.trim()
                        );
                    }
                }
            },
            u = {
                parser: {
                    TokenBuilder: (0, r.__name)(() => new n(), 'TokenBuilder'),
                    ValueConverter: (0, r.__name)(() => new s(), 'ValueConverter')
                }
            };
        function l(e = t.EmptyFileSystem) {
            let n = (0, i.inject)((0, a.createDefaultSharedCoreModule)(e), r.MermaidGeneratedSharedModule),
                s = (0, i.inject)((0, a.createDefaultCoreModule)({ shared: n }), r.ArchitectureGrammarGeneratedModule, u);
            return (n.ServiceRegistry.register(s), { shared: n, Architecture: s });
        }
        ((0, r.__name)(l, 'createArchitectureServices'), e.s(['ArchitectureModule', 0, u, 'createArchitectureServices', 0, l]));
    },
    96516,
    e => {
        'use strict';
        var r = e.i(95530),
            t = e.i(25876),
            a = e.i(55794),
            i = e.i(89489),
            n = class extends r.AbstractMermaidTokenBuilder {
                static {
                    (0, r.__name)(this, 'PacketTokenBuilder');
                }
                constructor() {
                    super(['packet']);
                }
            },
            s = {
                parser: {
                    TokenBuilder: (0, r.__name)(() => new n(), 'TokenBuilder'),
                    ValueConverter: (0, r.__name)(() => new r.CommonValueConverter(), 'ValueConverter')
                }
            };
        function u(e = t.EmptyFileSystem) {
            let n = (0, i.inject)((0, a.createDefaultSharedCoreModule)(e), r.MermaidGeneratedSharedModule),
                l = (0, i.inject)((0, a.createDefaultCoreModule)({ shared: n }), r.PacketGrammarGeneratedModule, s);
            return (n.ServiceRegistry.register(l), { shared: n, Packet: l });
        }
        ((0, r.__name)(u, 'createPacketServices'), e.s(['PacketModule', 0, s, 'createPacketServices', 0, u]));
    },
    36276,
    e => {
        'use strict';
        var r = e.i(95530),
            t = e.i(89489),
            a = e.i(55794),
            i = e.i(25876),
            n = class extends r.AbstractMermaidTokenBuilder {
                static {
                    (0, r.__name)(this, 'GitGraphTokenBuilder');
                }
                constructor() {
                    super(['gitGraph']);
                }
            },
            s = {
                parser: {
                    TokenBuilder: (0, r.__name)(() => new n(), 'TokenBuilder'),
                    ValueConverter: (0, r.__name)(() => new r.CommonValueConverter(), 'ValueConverter')
                }
            };
        function u(e = i.EmptyFileSystem) {
            let n = (0, t.inject)((0, a.createDefaultSharedCoreModule)(e), r.MermaidGeneratedSharedModule),
                l = (0, t.inject)((0, a.createDefaultCoreModule)({ shared: n }), r.GitGraphGrammarGeneratedModule, s);
            return (n.ServiceRegistry.register(l), { shared: n, GitGraph: l });
        }
        ((0, r.__name)(u, 'createGitGraphServices'), e.s(['GitGraphModule', 0, s, 'createGitGraphServices', 0, u]));
    },
    87528,
    e => {
        'use strict';
        var r = e.i(95530),
            t = e.i(25876),
            a = e.i(55794),
            i = e.i(89489),
            n = class extends r.AbstractMermaidTokenBuilder {
                static {
                    (0, r.__name)(this, 'RadarTokenBuilder');
                }
                constructor() {
                    super(['radar-beta']);
                }
            },
            s = {
                parser: {
                    TokenBuilder: (0, r.__name)(() => new n(), 'TokenBuilder'),
                    ValueConverter: (0, r.__name)(() => new r.CommonValueConverter(), 'ValueConverter')
                }
            };
        function u(e = t.EmptyFileSystem) {
            let n = (0, i.inject)((0, a.createDefaultSharedCoreModule)(e), r.MermaidGeneratedSharedModule),
                l = (0, i.inject)((0, a.createDefaultCoreModule)({ shared: n }), r.RadarGrammarGeneratedModule, s);
            return (n.ServiceRegistry.register(l), { shared: n, Radar: l });
        }
        ((0, r.__name)(u, 'createRadarServices'), e.s(['RadarModule', 0, s, 'createRadarServices', 0, u]));
    },
    29685,
    e => {
        'use strict';
        (e.i(36276), e.i(93634), e.i(96516), e.i(46858), e.i(70356), e.i(87528), e.i(87694));
        var r = e.i(95530),
            t = {},
            a = {
                info: (0, r.__name)(async () => {
                    let { createInfoServices: r } = await e.A(360);
                    t.info = r().Info.parser.LangiumParser;
                }, 'info'),
                packet: (0, r.__name)(async () => {
                    let { createPacketServices: r } = await e.A(54342);
                    t.packet = r().Packet.parser.LangiumParser;
                }, 'packet'),
                pie: (0, r.__name)(async () => {
                    let { createPieServices: r } = await e.A(43245);
                    t.pie = r().Pie.parser.LangiumParser;
                }, 'pie'),
                architecture: (0, r.__name)(async () => {
                    let { createArchitectureServices: r } = await e.A(28209);
                    t.architecture = r().Architecture.parser.LangiumParser;
                }, 'architecture'),
                gitGraph: (0, r.__name)(async () => {
                    let { createGitGraphServices: r } = await e.A(4585);
                    t.gitGraph = r().GitGraph.parser.LangiumParser;
                }, 'gitGraph'),
                radar: (0, r.__name)(async () => {
                    let { createRadarServices: r } = await e.A(58313);
                    t.radar = r().Radar.parser.LangiumParser;
                }, 'radar'),
                treemap: (0, r.__name)(async () => {
                    let { createTreemapServices: r } = await e.A(31640);
                    t.treemap = r().Treemap.parser.LangiumParser;
                }, 'treemap')
            };
        async function i(e, r) {
            let i = a[e];
            if (!i) throw Error(`Unknown diagram type: ${e}`);
            t[e] || (await i());
            let s = t[e].parse(r);
            if (s.lexerErrors.length > 0 || s.parserErrors.length > 0) throw new n(s);
            return s.value;
        }
        (0, r.__name)(i, 'parse');
        var n = class extends Error {
            constructor(e) {
                const r = e.lexerErrors
                        .map(e => {
                            let r = void 0 === e.line || isNaN(e.line) ? '?' : e.line,
                                t = void 0 === e.column || isNaN(e.column) ? '?' : e.column;
                            return `Lexer error on line ${r}, column ${t}: ${e.message}`;
                        })
                        .join('\n'),
                    t = e.parserErrors
                        .map(e => {
                            let r = void 0 === e.token.startLine || isNaN(e.token.startLine) ? '?' : e.token.startLine,
                                t = void 0 === e.token.startColumn || isNaN(e.token.startColumn) ? '?' : e.token.startColumn;
                            return `Parse error on line ${r}, column ${t}: ${e.message}`;
                        })
                        .join('\n');
                (super(`Parsing failed: ${r} ${t}`), (this.result = e));
            }
            static {
                (0, r.__name)(this, 'MermaidParseError');
            }
        };
        e.s(['parse', 0, i]);
    },
    50840,
    e => {
        'use strict';
        var r = e.i(18202),
            t = e.i(63529),
            a = e.i(49985),
            i = e.i(29685),
            n = {
                parse: (0, a.__name)(async e => {
                    let r = await (0, i.parse)('info', e);
                    a.log.debug(r);
                }, 'parse')
            },
            s = (0, a.__name)(() => '11.13.0', 'getVersion'),
            u = (0, a.__name)((e, i, n) => {
                a.log.debug('rendering info diagram\n' + e);
                let s = (0, r.selectSvgElement)(i);
                ((0, t.configureSvgSize)(s, 100, 400, !0),
                    s
                        .append('g')
                        .append('text')
                        .attr('x', 100)
                        .attr('y', 40)
                        .attr('class', 'version')
                        .attr('font-size', 32)
                        .style('text-anchor', 'middle')
                        .text(`v${n}`));
            }, 'draw');
        e.s(['diagram', 0, { parser: n, db: { getVersion: s }, renderer: { draw: u } }]);
    },
    360,
    e => {
        e.v(r => Promise.all(['static/chunks/0.hooaw1hhwgm.js'].map(r => e.l(r))).then(() => r(4739)));
    },
    54342,
    e => {
        e.v(r => Promise.all(['static/chunks/00832t437nlmq.js'].map(r => e.l(r))).then(() => r(53929)));
    },
    43245,
    e => {
        e.v(r => Promise.all(['static/chunks/0tbanr1tslxxg.js'].map(r => e.l(r))).then(() => r(67937)));
    },
    28209,
    e => {
        e.v(r => Promise.all(['static/chunks/03vry6jat3yn0.js'].map(r => e.l(r))).then(() => r(73213)));
    },
    4585,
    e => {
        e.v(r => Promise.all(['static/chunks/17cnt25ey4yw8.js'].map(r => e.l(r))).then(() => r(15038)));
    },
    58313,
    e => {
        e.v(r => Promise.all(['static/chunks/0pwskzg5miudq.js'].map(r => e.l(r))).then(() => r(47081)));
    },
    31640,
    e => {
        e.v(r => Promise.all(['static/chunks/0kt-tsa.ooh0s.js'].map(r => e.l(r))).then(() => r(35201)));
    }
]);
