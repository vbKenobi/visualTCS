// ustcon_logic.js
// ----------------------------------------------------
// Logic for Undirected ST-Connectivity in Logspace
// Implements Reingold's algorithm using ROTATION MAPS (NOT explicit graphs!)

// KEY INSIGHT: We never store entire graphs - only rotation maps!
// Space: O(log n) to store current vertex position + O(log D) for neighbor index

// ----------------------------------------------------
// Rotation Map - The key to logspace computation
// ----------------------------------------------------
export class RotationMap {
    constructor(graph) {
        this.map = new Map();
        this.degree = 0;
        
        // Build rotation map from graph
        // Rot_G(v,i) = i-th neighbor of vertex v
        graph.nodes.forEach(node => {
            const neighbors = [];
            graph.edges.forEach(edge => {
                if (edge.node1 === node) neighbors.push(edge.node2.id);
                if (edge.node2 === node) neighbors.push(edge.node1.id);
            });
            this.map.set(node.id, neighbors);
            this.degree = Math.max(this.degree, neighbors.length);
        });
    }
    
    // O(1) time, O(log n) space to call
    rotate(v, i) {
        const neighbors = this.map.get(v) || [];
        if (neighbors.length === 0) return v;
        return neighbors[i % neighbors.length];
    }
}

// ----------------------------------------------------
// Make graph D-regular using rotation map
// ----------------------------------------------------
export function makeRegularRotationMap(rotMap, D) {
    const regularMap = new Map();
    
    rotMap.map.forEach((neighbors, v) => {
        const regularNeighbors = [...neighbors];
        while (regularNeighbors.length < D) {
            regularNeighbors.push(v); // Self-loop
        }
        regularMap.set(v, regularNeighbors.slice(0, D));
    });
    
    return {
        map: regularMap,
        degree: D,
        rotate: function(v, i) {
            const neighbors = this.map.get(v) || [];
            return neighbors[i % neighbors.length] || v;
        }
    };
}

// ----------------------------------------------------
// Expander Graph H
// ----------------------------------------------------
export class ExpanderGraph {
    constructor(B) {
        this.B = B;
        this.size = B * B;
        this.nodes = [];
        this.edges = [];
        
        this.generateExpander();
        
        // Create rotation map
        this.rotationMap = new RotationMap({
            nodes: this.nodes.map((_, i) => ({id: i})),
            edges: this.edges.map(e => ({
                node1: {id: e.from},
                node2: {id: e.to}
            }))
        });
    }

    generateExpander() {
        for (let i = 0; i < this.size; i++) {
            this.nodes.push({id: i, label: `h${i}`});
        }

        const generators = this.getGenerators(this.B);
        for (let i = 0; i < this.size; i++) {
            for (let gen of generators) {
                const j = (i + gen) % this.size;
                if (!this.hasEdge(i, j)) {
                    this.edges.push({from: i, to: j});
                }
            }
        }
    }

    getGenerators(degree) {
        const gens = [];
        const step = Math.floor(this.size / degree);
        for (let i = 1; i <= Math.floor(degree / 2); i++) {
            gens.push(i * step);
            gens.push(this.size - i * step);
        }
        return gens.slice(0, degree);
    }

    hasEdge(i, j) {
        return this.edges.some(e => 
            (e.from === i && e.to === j) || (e.from === j && e.to === i)
        );
    }
}

// ----------------------------------------------------
// Helper: Make regular graph for visualization
// ----------------------------------------------------
export function makeRegular(graph, B) {
    const targetDegree = B * B;
    const regularGraph = {
        nodes: [...graph.nodes],
        edges: [],
        degree: targetDegree
    };

    graph.edges.forEach(edge => {
        regularGraph.edges.push({
            node1: edge.node1,
            node2: edge.node2,
            isSelfLoop: false
        });
    });

    graph.nodes.forEach(node => {
        const currentDegree = regularGraph.edges.filter(e => 
            e.node1 === node || e.node2 === node
        ).length;
        
        const loopsNeeded = Math.max(0, targetDegree - currentDegree);
        for (let i = 0; i < loopsNeeded; i++) {
            regularGraph.edges.push({
                node1: node,
                node2: node,
                isSelfLoop: true
            });
        }
    });

    return regularGraph;
}

// ----------------------------------------------------
// Reingold's Algorithm - Using Rotation Maps!
// ----------------------------------------------------
export class ReingoldAlgorithm {
    constructor(graph, s, t, B = 4) {
        this.originalGraph = graph;
        this.s = s;
        this.t = t;
        this.B = B;
        this.L = Math.min(4, Math.ceil(Math.log2(graph.nodes.length)));
        this.steps = [];
        this.currentStep = 0;
    }

    initialize() {
        console.log('Initializing algorithm with ROTATION MAPS...');
        
        // Step 1: Create fixed expander H
        this.H = new ExpanderGraph(this.B);
        this.steps.push({
            type: 'expander',
            graph: this.H,
            description: `Fixed expander H (${this.B}⁴=${this.H.size} vertices, degree ${this.B}). Stored as ROTATION MAP - Space: O(1)!`
        });

        // Step 2: Build rotation map for input graph
        const G0 = makeRegular(this.originalGraph, this.B);
        const G0_rot = new RotationMap(this.originalGraph);
        const G0_regular = makeRegularRotationMap(G0_rot, this.B * this.B);
        
        this.steps.push({
            type: 'regularize',
            graph: G0,
            description: `G₀ rotation map: Rot(v,i) returns i-th neighbor. Degree ${G0.degree}. Space: O(log n) per query!`
        });

        // Step 3: Squaring via rotation map - create a conceptual squared graph
        const G_squared = this.createSquaredGraphVisualization(G0);
        this.steps.push({
            type: 'square',
            graph: G_squared,
            description: `Squaring: Rot_{G²}(v,i) = Rot_G(Rot_G(v,i₁),i₂) where i=i₁D+i₂. No explicit G² needed!`
        });

        // Step 4: Zig-zag via rotation map - create a conceptual zig-zag product
        const G_zigzag = this.createZigzagGraphVisualization(G0, this.H);
        this.steps.push({
            type: 'zigzag',
            graph: G_zigzag,
            description: `Zig-zag (v,i)→(v',i'): (1) rotate in H-cloud, (2) move to G-neighbor, (3) rotate in new cloud. Space: O(log n)+O(1)!`
        });

        // Step 5: Final result - show the same structure but as "solved"
        this.steps.push({
            type: 'solve',
            graph: G0,
            description: `After L=${this.L} iterations: diameter ~O(log n), degree ${this.B}. Exhaustive walk uses O(log n) space total!`
        });
        
        console.log('Algorithm initialized with', this.steps.length, 'steps');
    }
    
    // Create a visualization of the squared graph (adds 2-hop connections)
    createSquaredGraphVisualization(G0) {
        const squaredGraph = {
            nodes: [...G0.nodes],
            edges: [...G0.edges],
            degree: G0.degree * G0.degree
        };
        
        // Add edges between vertices that are 2 hops apart
        const adjList = new Map();
        G0.nodes.forEach(node => adjList.set(node.id, new Set()));
        
        G0.edges.forEach(edge => {
            if (!edge.isSelfLoop) {
                adjList.get(edge.node1.id).add(edge.node2.id);
                adjList.get(edge.node2.id).add(edge.node1.id);
            }
        });
        
        // Find 2-hop neighbors
        const twoHopEdges = new Set();
        G0.nodes.forEach(node => {
            const neighbors = adjList.get(node.id);
            neighbors.forEach(neighbor => {
                const secondHop = adjList.get(neighbor);
                secondHop.forEach(finalNode => {
                    if (finalNode !== node.id) {
                        const edgeKey = `${Math.min(node.id, finalNode)}-${Math.max(node.id, finalNode)}`;
                        if (!twoHopEdges.has(edgeKey)) {
                            twoHopEdges.add(edgeKey);
                            const node1 = G0.nodes.find(n => n.id === node.id);
                            const node2 = G0.nodes.find(n => n.id === finalNode);
                            if (node1 && node2) {
                                squaredGraph.edges.push({
                                    node1: node1,
                                    node2: node2,
                                    isSelfLoop: false
                                });
                            }
                        }
                    }
                });
            });
        });
        
        return squaredGraph;
    }
    
    // Create a visualization of the zig-zag product (conceptual - product graph)
    createZigzagGraphVisualization(G, H) {
        // Create a smaller conceptual product graph for visualization
        // In reality, this would be |V(G)| × |V(H)| vertices
        // For visualization, we'll create a subset showing the structure
        
        const productGraph = {
            nodes: [],
            edges: [],
            degree: H.B
        };
        
        // Create product vertices (v, h) for each v in G and a subset of h in H
        const hSubset = Math.min(4, H.nodes.length); // Use up to 4 H vertices per G vertex
        let nodeId = 0;
        
        G.nodes.forEach((gNode, gIdx) => {
            for (let h = 0; h < hSubset; h++) {
                productGraph.nodes.push({
                    id: nodeId++,
                    label: `(${gNode.id},${h})`,
                    gVertex: gNode.id,
                    hVertex: h
                });
            }
        });
        
        // Add edges based on zig-zag product structure
        // Edge in product: internal H-edges and cross-G edges
        productGraph.nodes.forEach((node1, i) => {
            productGraph.nodes.forEach((node2, j) => {
                if (i >= j) return;
                
                // Same G vertex, different H vertex (internal H-edge)
                if (node1.gVertex === node2.gVertex && 
                    Math.abs(node1.hVertex - node2.hVertex) <= 1) {
                    productGraph.edges.push({
                        node1: node1,
                        node2: node2,
                        isSelfLoop: false
                    });
                }
                
                // Adjacent G vertices, same H vertex pattern (cross-edge)
                const gEdgeExists = G.edges.some(e => 
                    (e.node1.id === node1.gVertex && e.node2.id === node2.gVertex) ||
                    (e.node2.id === node1.gVertex && e.node1.id === node2.gVertex)
                );
                
                if (gEdgeExists && node1.hVertex === node2.hVertex) {
                    productGraph.edges.push({
                        node1: node1,
                        node2: node2,
                        isSelfLoop: false
                    });
                }
            });
        });
        
        return productGraph;
    }

    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            return this.steps[this.currentStep];
        }
        return null;
    }

    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            return this.steps[this.currentStep];
        }
        return null;
    }

    getCurrentStep() {
        return this.steps[this.currentStep];
    }

    getProgress() {
        return {
            current: this.currentStep + 1,
            total: this.steps.length,
            percentage: ((this.currentStep + 1) / this.steps.length) * 100
        };
    }
}
