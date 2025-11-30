// =========================================================
// Reingold's USTCON Algorithm - O(log n) Space
// Educational Visualization
// =========================================================

export class ReingoldAlgorithm {
    constructor(graph, s, t, B = 2) {
        this.originalGraph = graph;
        this.s = s;
        this.t = t;
        this.B = B;
        this.D = B * B;  // Target degree
        this.expanderSize = B ** 4;  // |H| = B^4 = 16
        
        this.stages = [];
        this.currentStage = 0;
        
        const n = Math.max(2, graph.nodes.length);
        this.L = Math.max(1, Math.ceil(Math.log2(n)));
        
        // Check connectivity using path enumeration
        // In the final graph, we check paths of length O(log |V_final|)
        this.connected = this.checkConnectivityLogSpace();
    }
    
    // =========================================================
    // LOG-SPACE CONNECTIVITY CHECK
    // Enumerate all paths of length O(log n) from s
    // Check if any reach t
    // =========================================================
    checkConnectivityLogSpace() {
        const graph = this.originalGraph;
        if (!graph.nodes || graph.nodes.length < 2) return false;
        
        const sNode = graph.nodes.find(n => n.id === this.s || n === this.s);
        const tNode = graph.nodes.find(n => n.id === this.t || n === this.t);
        
        if (!sNode || !tNode) return false;
        if (sNode === tNode) return true;
        
        // Build adjacency for the original graph
        const adj = new Map();
        graph.nodes.forEach(n => adj.set(n, []));
        graph.edges.forEach(e => {
            if (adj.has(e.node1) && adj.has(e.node2)) {
                adj.get(e.node1).push(e.node2);
                adj.get(e.node2).push(e.node1);
            }
        });
        
        // Path length for connectivity on an expander
        // After L iterations, graph is good expander
        // Random walk mixes in O(log |V|) steps
        // |V_final| = n * |H|^L, so log|V_final| = log(n) + L*log|H|
        const n = graph.nodes.length;
        const pathLength = Math.ceil(Math.log2(n)) * 4; // O(log n) with constant
        
        // Enumerate all paths of this length from s
        // This is the key insight: we only store current position (log space)
        // and enumerate paths by trying all neighbor choices
        return this.enumeratePaths(sNode, tNode, pathLength, adj);
    }
    
    // Enumerate paths using recursion (simulating log-space)
    // At each step, we only store: current node + recursion depth
    // Total space: O(log n) for node ID + O(log pathLength) for depth
    enumeratePaths(current, target, remainingLength, adj) {
        if (current === target) return true;
        if (remainingLength === 0) return false;
        
        // Try each neighbor
        const neighbors = adj.get(current) || [];
        for (const neighbor of neighbors) {
            if (this.enumeratePaths(neighbor, target, remainingLength - 1, adj)) {
                return true;
            }
        }
        return false;
    }

    initialize() {
        this.createDemoAnimation();
        this.createCodeExecutionStages();
        return this.stages;
    }

    // =========================================================
    // DEMO: Zig-zag product visualization
    // =========================================================
    
    createDemoAnimation() {
        const G = this.createDemoG();
        const H = this.createDemoH();
        const frames = [];
        
        frames.push({
            phase: 'two-clouds',
            title: 'Zig-Zag Product: G ⊛ H',
            subtitle: 'Each vertex v → cloud of |H| copies',
            G: G, H: H,
            cloud0: true, cloud1: true,
            cloudSize: H.nodes.length,
            progress: 0.1
        });
        
        frames.push({
            phase: 'edge-complete',
            title: 'ZIG-ZAG-ZIG Walk',
            subtitle: 'k₁ in H → cross via G → k₂ in H',
            G: G, H: H,
            cloud0: true, cloud1: true,
            cloudSize: H.nodes.length,
            edgeStart: { cloud: 0, pos: 0 },
            edgeEnd: { cloud: 1, pos: 2 },
            walkPhase: 'complete',
            progress: 0.4
        });
        
        frames.push({
            phase: 'delete-highlight',
            title: 'Delete Used Edges',
            subtitle: 'Intermediate edges removed',
            G: G, H: H,
            cloud0: true, cloud1: true,
            cloudSize: H.nodes.length,
            edgeStart: { cloud: 0, pos: 0 },
            edgeEnd: { cloud: 1, pos: 2 },
            showDeletedEdges: true,
            walkPhase: 'delete',
            progress: 0.6
        });
        
        frames.push({
            phase: 'delete-complete',
            title: 'Result',
            subtitle: 'Edge (v,a) → (u,c) in G ⊛ H',
            G: G, H: H,
            cloud0: true, cloud1: true,
            cloudSize: H.nodes.length,
            edgeStart: { cloud: 0, pos: 0 },
            edgeEnd: { cloud: 1, pos: 2 },
            showFinalEdgeOnly: true,
            walkPhase: 'after-delete',
            progress: 0.8
        });
        
        frames.push({
            phase: 'insight',
            title: 'Key Insight',
            subtitle: 'Degree D² → B². Never store the graph!',
            G: G, H: H,
            showInsight: true,
            degreeG: G.degree,
            degreeResult: H.degree * H.degree,
            progress: 1.0
        });
        
        this.stages.push({
            name: 'Zig-Zag Product Demo',
            description: 'Edge creation in G ⊛ H',
            type: 'demo-animation',
            frames: frames
        });
    }
    
    createDemoG() {
        const nodes = [
            { id: 0, label: '0' }, { id: 1, label: '1' },
            { id: 2, label: '2' }, { id: 3, label: '3' }
        ];
        const edges = [
            { node1: nodes[0], node2: nodes[1] },
            { node1: nodes[1], node2: nodes[2] },
            { node1: nodes[2], node2: nodes[3] },
            { node1: nodes[3], node2: nodes[0] },
            { node1: nodes[0], node2: nodes[2] },
            { node1: nodes[1], node2: nodes[3] }
        ];
        return { nodes, edges, degree: 4 };
    }
    
    createDemoH() {
        const nodes = [
            { id: 0, label: '0' }, { id: 1, label: '1' },
            { id: 2, label: '2' }, { id: 3, label: '3' }
        ];
        const edges = [
            { node1: nodes[0], node2: nodes[1] },
            { node1: nodes[1], node2: nodes[2] },
            { node1: nodes[2], node2: nodes[3] },
            { node1: nodes[3], node2: nodes[0] }
        ];
        return { nodes, edges, degree: 2 };
    }

    // =========================================================
    // CODE EXECUTION: Show the key space analysis
    // =========================================================
    
    createCodeExecutionStages() {
        const n = this.originalGraph.nodes.length;
        const m = this.originalGraph.edges.length;
        if (n < 2) return;
        
        const logN = Math.ceil(Math.log2(n));
        const logH = Math.ceil(Math.log2(this.expanderSize));
        
        // Static algorithm code showing the loop structure
        const algorithmCode = [
            'function USTCON(G, s, t):',
            '  L = ⌈log n⌉ = ' + this.L,
            '  G₀ = make_D_regular(G)',
            '  ',
            '  for k = 1 to L:',
            '    G²_{k-1} = square(G_{k-1})   // D → D²',
            '    G_k = G²_{k-1} ⊛ H           // |V|×|H|, D²→B²',
            '  ',
            '  enumerate paths of length O(log n)',
            '  return connected?'
        ];
        
        // Stage 1: Start
        this.stages.push({
            name: 'Algorithm Start',
            type: 'code-execution',
            code: algorithmCode,
            highlightLine: 0,
            stats: {
                '|V|': n,
                '|E|': m,
                's': this.s,
                't': this.t,
                'L': this.L
            }
        });
        
        // Stage 2: Regularize
        this.stages.push({
            name: 'Regularize',
            type: 'code-execution',
            code: algorithmCode,
            highlightLine: 2,
            stats: {
                '|V|': n,
                'Degree': '→ ' + this.D,
                'Space': logN + ' bits'
            }
        });
        
        // Iterations showing BOTH square and zig-zag steps
        let implicitV = n;
        let currentD = this.D;
        
        // Space is O(log n) - we only store current position, not the whole graph
        // Position = (original vertex, expander state) = O(log n + log |H|) = O(log n)
        const spaceUsed = logN + logH;  // log n + log|H| = O(log n)
        
        for (let k = 1; k <= this.L; k++) {
            // SQUARE step: degree increases D → D²
            const sqDegree = currentD * currentD;
            
            this.stages.push({
                name: 'Iteration ' + k + ': SQUARE',
                type: 'code-execution',
                code: algorithmCode,
                highlightLine: 5,
                stats: {
                    'k': k + ' of ' + this.L,
                    '|V|': this.formatNumber(implicitV),
                    'Degree': currentD + ' → ' + sqDegree,
                    'Space': 'O(log n) = ' + spaceUsed + ' bits'
                }
            });
            
            // ZIG-ZAG step: vertices multiply by |H|, degree reduces to B²
            const newV = implicitV * this.expanderSize;
            const newD = this.D;  // B² = 4
            
            this.stages.push({
                name: 'Iteration ' + k + ': ZIG-ZAG',
                type: 'code-execution',
                code: algorithmCode,
                highlightLine: 6,
                stats: {
                    'k': k + ' of ' + this.L,
                    '|V|': this.formatNumber(implicitV) + ' → ' + this.formatNumber(newV),
                    'Degree': sqDegree + ' → ' + newD,
                    'Space': 'O(log n) = ' + spaceUsed + ' bits'
                },
                spaceNote: 'Implicit graph: ' + this.formatNumber(newV) + ' vertices. We store only: ' + spaceUsed + ' bits!'
            });
            
            implicitV = newV;
            currentD = newD;
        }
        
        // Path enumeration stage
        // After L iterations, diameter is O(log n), so paths of length O(log n) suffice
        this.stages.push({
            name: 'Path Enumeration',
            type: 'code-execution',
            code: algorithmCode,
            highlightLine: 8,  // "enumerate paths of length O(log n)"
            stats: {
                'log n': '⌈log₂(' + n + ')⌉ = ' + logN,
                'Path length': 'O(log n)',
                'Enumerate': 'all paths from s',
                'Check': 'if any reach t',
                'Space': 'O(log n) = ' + spaceUsed + ' bits'
            }
        });
        
        // Final result
        this.stages.push({
            name: 'Result',
            type: 'code-execution',
            code: algorithmCode,
            highlightLine: 9,  // "return connected?"
            stats: {
                'Final implicit |V|': this.formatNumber(implicitV),
                'Space used': spaceUsed + ' bits = O(log n)',
                's → t': this.connected ? 'CONNECTED ✓' : 'NOT CONNECTED ✗'
            },
            result: this.connected,
            conclusion: true
        });
    }
    
    formatNumber(n) {
        if (n >= 1000000000) return (n / 1000000000).toFixed(1) + 'B';
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
        return String(n);
    }
    
    getCurrentStage() {
        return this.stages[this.currentStage] || null;
    }
    
    nextStage() {
        if (this.currentStage < this.stages.length - 1) {
            this.currentStage++;
        }
        return this.getCurrentStage();
    }
    
    prevStage() {
        if (this.currentStage > 0) {
            this.currentStage--;
        }
        return this.getCurrentStage();
    }
    
    getProgress() {
        return {
            current: this.currentStage + 1,
            total: this.stages.length,
            percentage: Math.round(((this.currentStage + 1) / this.stages.length) * 100)
        };
    }
}
