const D = 16;
const H_SIZE = D * D;

class MemoryRegisters {
    constructor(N) {
        this.N = N;
        this.N2 = N * N;
        this.bits_per_vertex = Math.ceil(Math.log2(Math.max(2, this.N2)));
        this.registers = { v: 0, h: 0, path_step: 0, level: 0, edge_type: 0 };
    }
    set(name, value) { this.registers[name] = value; }
    get(name) { return this.registers[name]; }
    getTotalBits() {
        return 2 * this.bits_per_vertex + Math.ceil(Math.log2(8)) + 2;
    }
    getState() { return {...this.registers}; }
}

function rot_G_16reg(adj, N, v, i) {
    const a = Math.floor(v / N);
    const b = v % N;
    if (i === 0) return ((a + 1) % N) * N + b;
    if (i === 1) return ((a - 1 + N) % N) * N + b;
    if (i === 2) return a * N + ((b + 1) % N);
    if (i === 3) return a * N + ((b - 1 + N) % N);
    if (i >= 4 && i < 10) {
        const j = i - 4;
        if (adj[a] && j < adj[a].length && adj[a][j] !== a) return adj[a][j] * N + b;
        return v;
    }
    if (i >= 10 && i < 16) {
        const j = i - 10;
        if (adj[b] && j < adj[b].length && adj[b][j] !== b) return a * N + adj[b][j];
        return v;
    }
    return v;
}

function rot_H(h, i) {
    const x = Math.floor(h / D);
    const y = h % D;
    const gens = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1],[2,0],[-2,0],[0,2],[0,-2],[2,1],[1,2],[-2,-1],[-1,-2]];
    const [dx, dy] = gens[i % 16];
    return ((x + dx + D) % D) * D + ((y + dy + D) % D);
}

function rot_zigzag(adj, N, v_h, i) {
    const v = Math.floor(v_h / H_SIZE);
    let h = v_h % H_SIZE;
    const i1 = Math.floor(i / D);
    const i2 = i % D;
    h = rot_H(h, i1);
    const j = h % D;
    const v_new = rot_G_16reg(adj, N, v, j);
    h = rot_H(h, i2);
    return v_new * H_SIZE + h;
}

function rot_Gexp(adj, N, v_h, i, level) {
    if (level === 0) {
        const v = Math.floor(v_h / H_SIZE);
        const h = v_h % H_SIZE;
        return rot_G_16reg(adj, N, v, i % D) * H_SIZE + h;
    }
    let current = v_h;
    for (let sq = 0; sq < 8; sq++) current = rot_zigzag(adj, N, current, i);
    return current;
}

function ustcon(adj, N, s, t) {
    const N2 = N * N;
    const L = Math.max(1, 2 * Math.ceil(Math.log2(Math.max(2, D * N2))));
    const s_ext = s * N;
    for (let path_len = 1; path_len <= Math.min(50, 2 * N2); path_len++) {
        const total_paths = Math.pow(3, path_len);
        for (let path_idx = 0; path_idx < total_paths; path_idx++) {
            let current = s_ext * H_SIZE;
            let temp_idx = path_idx;
            for (let step = 0; step < path_len; step++) {
                const edge_type = temp_idx % 3;
                temp_idx = Math.floor(temp_idx / 3);
                for (let level = L - 1; level >= 0; level--) {
                    const edge_idx = (edge_type * D + (step % D)) % (D * D);
                    current = rot_Gexp(adj, N, current, edge_idx, level);
                }
            }
            const final_v = Math.floor(current / H_SIZE);
            const final_a = Math.floor(final_v / N);
            if (final_a === t) return true;
        }
    }
    return false;
}

export class ReingoldAlgorithm {
    constructor(graph, s, t, B = 2) {
        this.originalGraph = graph;
        this.s = typeof s === 'object' ? s.id : s;
        this.t = typeof t === 'object' ? t.id : t;
        this.B = B;
        this.D = D;
        this.expanderSize = H_SIZE;
        this.stages = [];
        this.currentStage = 0;
        const n = Math.max(2, graph.nodes.length);
        this.N = n;
        this.L = Math.max(1, Math.ceil(Math.log2(n)));
        this.memory = new MemoryRegisters(n);
        this.adj = this.buildAdj(graph);
        this.connected = this.checkConnectivity();
    }

    buildAdj(graph) {
        const adj = {};
        graph.nodes.forEach((n, i) => { adj[i] = []; });
        graph.edges.forEach(e => {
            const i1 = typeof e.node1 === 'object' ? graph.nodes.indexOf(e.node1) : e.node1;
            const i2 = typeof e.node2 === 'object' ? graph.nodes.indexOf(e.node2) : e.node2;
            if (i1 >= 0 && i2 >= 0) {
                adj[i1].push(i2);
                adj[i2].push(i1);
            }
        });
        return adj;
    }

    checkConnectivity() {
        if (this.N < 2) return false;
        const sIdx = this.s;
        const tIdx = this.t;
        if (sIdx === tIdx) return true;
        return ustcon(this.adj, this.N, sIdx, tIdx);
    }

    initialize() {
        this.createDemoAnimation();
        this.createCodeExecutionStages();
        return this.stages;
    }

    createDemoAnimation() {
        const G = this.createDemoG();
        const H = this.createDemoH();
        const frames = [];
        frames.push({ phase: 'two-clouds', title: 'Zig-Zag Product: G ⊛ H', subtitle: 'Each vertex v → cloud of |H| copies', G, H, cloud0: true, cloud1: true, cloudSize: H.nodes.length, progress: 0.1 });
        frames.push({ phase: 'edge-complete', title: 'ZIG-ZAG-ZIG Walk', subtitle: 'k₁ in H → cross via G → k₂ in H', G, H, cloud0: true, cloud1: true, cloudSize: H.nodes.length, edgeStart: {cloud:0,pos:0}, edgeEnd: {cloud:1,pos:2}, walkPhase: 'complete', progress: 0.4 });
        frames.push({ phase: 'delete-highlight', title: 'Delete Used Edges', subtitle: 'Intermediate edges removed', G, H, cloud0: true, cloud1: true, showDeletedEdges: true, walkPhase: 'delete', progress: 0.6 });
        frames.push({ phase: 'delete-complete', title: 'Result', subtitle: 'Edge (v,a) → (u,c) in G ⊛ H', G, H, cloud0: true, cloud1: true, showFinalEdgeOnly: true, walkPhase: 'after-delete', progress: 0.8 });
        frames.push({ phase: 'insight', title: 'Key Insight', subtitle: 'D² → 16. Never store the graph!', G, H, showInsight: true, degreeG: G.degree, degreeResult: 16, progress: 1.0 });
        this.stages.push({ name: 'Zig-Zag Product Demo', description: 'Edge creation in G ⊛ H', type: 'demo-animation', frames });
    }

    createDemoG() {
        const nodes = [{id:0,label:'0'},{id:1,label:'1'},{id:2,label:'2'},{id:3,label:'3'}];
        const edges = [{node1:nodes[0],node2:nodes[1]},{node1:nodes[1],node2:nodes[2]},{node1:nodes[2],node2:nodes[3]},{node1:nodes[3],node2:nodes[0]},{node1:nodes[0],node2:nodes[2]},{node1:nodes[1],node2:nodes[3]}];
        return {nodes, edges, degree: 4};
    }

    createDemoH() {
        const nodes = [{id:0,label:'a'},{id:1,label:'b'},{id:2,label:'c'},{id:3,label:'d'}];
        const edges = [{node1:nodes[0],node2:nodes[1]},{node1:nodes[1],node2:nodes[2]},{node1:nodes[2],node2:nodes[3]},{node1:nodes[3],node2:nodes[0]}];
        return {nodes, edges, degree: 2};
    }

    createCodeExecutionStages() {
        const n = this.N;
        const logN = Math.ceil(Math.log2(Math.max(2, n)));
        const logH = Math.ceil(Math.log2(H_SIZE));
        const spaceUsed = this.memory.getTotalBits();
        const algorithmCode = [
            'function USTCON(G, s, t):',
            '  Build G_reg: N² vertices, 16-regular',
            '  L = O(log(D × N²)) = ' + (2 * Math.ceil(Math.log2(Math.max(2, D * n * n)))),
            '  ',
            '  for path_len = 1 to O(N²):',
            '    for each path (edge sequence):',
            '      for level = L-1 down to 0:',
            '        v = rot_Gexp(v, edge, level)',
            '  ',
            '  return reached t?'
        ];
        this.stages.push({ name: 'Algorithm Start', type: 'code-execution', code: algorithmCode, highlightLine: 0, stats: { '|V|': n, 's': this.s, 't': this.t, 'Space': spaceUsed + ' bits = O(log N)' }});
        this.stages.push({ name: 'Build G_16reg', type: 'code-execution', code: algorithmCode, highlightLine: 1, stats: { 'Original |V|': n, 'G_reg |V|': n * n + ' (N²)', 'Degree': '16-regular', 'Space': spaceUsed + ' bits' }});
        let implicitV = n * n;
        for (let k = 1; k <= Math.min(this.L, 3); k++) {
            const newV = implicitV * H_SIZE;
            this.stages.push({ name: 'Iteration ' + k + ': Zig-Zag × 8', type: 'code-execution', code: algorithmCode, highlightLine: 6, stats: { 'k': k + ' of ' + this.L, '|V| (implicit)': this.formatNumber(implicitV) + ' → ' + this.formatNumber(newV), 'Degree': '16 (maintained)', 'Space': spaceUsed + ' bits = O(log N)' }, spaceNote: 'Graph has ' + this.formatNumber(newV) + ' vertices but we store only ' + spaceUsed + ' bits!'});
            implicitV = newV;
        }
        this.stages.push({ name: 'Path Enumeration', type: 'code-execution', code: algorithmCode, highlightLine: 5, stats: { 'Path lengths': '1 to O(N²)', 'Each path': '3 edge types per step', 'Memory': 'O(log N) bits only', 'Space': spaceUsed + ' bits' }});
        this.stages.push({ name: 'Result', type: 'code-execution', code: algorithmCode, highlightLine: 9, stats: { 'Final |V| (implicit)': this.formatNumber(implicitV), 'Space used': spaceUsed + ' bits = O(log N)', 's → t': this.connected ? 'CONNECTED ✓' : 'NOT CONNECTED ✗' }, result: this.connected, conclusion: true });
    }

    formatNumber(n) {
        if (n >= 1e9) return (n/1e9).toFixed(1) + 'B';
        if (n >= 1e6) return (n/1e6).toFixed(1) + 'M';
        if (n >= 1e3) return (n/1e3).toFixed(1) + 'K';
        return String(n);
    }

    getCurrentStage() { return this.stages[this.currentStage] || null; }
    nextStage() { if (this.currentStage < this.stages.length - 1) this.currentStage++; return this.getCurrentStage(); }
    prevStage() { if (this.currentStage > 0) this.currentStage--; return this.getCurrentStage(); }
    getProgress() { return { current: this.currentStage + 1, total: this.stages.length, percentage: Math.round(((this.currentStage + 1) / this.stages.length) * 100) }; }
}
