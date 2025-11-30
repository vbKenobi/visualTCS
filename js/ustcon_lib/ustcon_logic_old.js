// ustcon_logic.js
// ----------------------------------------------------
// Logic for Undirected ST-Connectivity in Logspace
// Implements Reingold's algorithm with detailed step-by-step visualization

// ----------------------------------------------------
// Reingold's Algorithm - Main Class
// ----------------------------------------------------
export class ReingoldAlgorithm {
    constructor(graph, s, t, B = 4) {
        this.originalGraph = graph;
        this.s = s;
        this.t = t;
        this.B = B;
        this.L = Math.min(4, Math.ceil(Math.log2(graph.nodes.length)));
        this.stages = []; // Major stages (user navigates between these)
        this.currentStage = 0;
        this.animationFrames = []; // Auto-animated frames within current stage
        this.currentFrame = 0;
        this.isAnimating = false;
    }

    initialize() {
        console.log('Initializing Reingold\'s Algorithm...');
        
        // STAGE 0: Original Input Graph
        this.stages.push({
            name: 'Input Graph',
            description: 'Original graph G with source s (green) and target t (red)',
            graph: this.cloneGraph(this.originalGraph),
            type: 'input',
            complexity: `Space: O(log n) to store current vertex`
        });

        // STAGE 1: Create Fixed Expander H
        const H = this.createExpanderH(this.B);
        this.stages.push({
            name: 'Fixed Expander H',
            description: `Fixed (B⁴, B, 1/4)-expander where B=${this.B}. This is pre-computed and constant.`,
            graph: H,
            type: 'expander',
            complexity: `H has ${this.B**4} vertices, degree ${this.B}. Space: O(1) - constant size!`
        });

        // STAGE 2: Make G Regular (G₀)
        this.stages.push({
            name: 'Make G Regular',
            description: `Convert G into B²-regular graph G₀ by adding self-loops`,
            type: 'regularize',
            complexity: `Each vertex gets exactly ${this.B**2} edges. Space: O(log n)`
        });

        // STAGE 3-N: Iterative Squaring and Zig-Zag
        for (let k = 1; k <= this.L; k++) {
            // Squaring stage
            this.stages.push({
                name: `Iteration ${k}: Square G`,
                description: `G²: Connect vertices at distance ≤2. Reduces diameter by half.`,
                type: 'square',
                iteration: k,
                complexity: `After squaring: diam(G²) ≤ ⌈diam(G)/2⌉. Space: O(log n)`
            });

            // Zig-zag stage  
            this.stages.push({
                name: `Iteration ${k}: Zig-Zag Product`,
                description: `G ⨂ H: Replace each vertex with H-cloud, maintain constant degree ${this.B}.`,
                type: 'zigzag',
                iteration: k,
                complexity: `After zig-zag: degree = ${this.B}, |V| same. Space: O(log n) + O(1)`
            });
        }

        // FINAL STAGE: Solve
        this.stages.push({
            name: 'Solve Connectivity',
            description: `After ${this.L} iterations, diameter is O(log n). Exhaustive walk in O(log n) space.`,
            type: 'solve',
            complexity: `Total space: O(log n) - Success!`
        });

        console.log(`Algorithm initialized with ${this.stages.length} stages`);
        this.generateStageContent(0);
    }
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
        
        // Add micro-steps showing edge additions
        const squareSteps = this.createSquareAnimationSteps(G0, G_squared);
        squareSteps.forEach(step => this.steps.push(step));
        
        this.steps.push({
            type: 'square',
            graph: G_squared,
            description: `Squaring complete: Rot_{G²}(v,i) = Rot_G(Rot_G(v,i₁),i₂) where i=i₁D+i₂. No explicit G² needed!`,
            highlightEdges: []
        });

        // Step 4: Zig-zag via rotation map - create a conceptual zig-zag product
        const G_zigzag = this.createZigzagGraphVisualization(G0, this.H);
        
        // Add micro-steps showing zigzag construction
        const zigzagSteps = this.createZigzagAnimationSteps(G0, this.H, G_zigzag);
        zigzagSteps.forEach(step => this.steps.push(step));
        
        this.steps.push({
            type: 'zigzag',
            graph: G_zigzag,
            description: `Zig-zag complete: (v,i)→(v',i'): (1) rotate in H-cloud, (2) move to G-neighbor, (3) rotate in new cloud. Space: O(log n)+O(1)!`,
            highlightEdges: []
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
            degree: G0.degree * G0.degree,
            newEdges: []  // Track which edges are newly added
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
                                const newEdge = {
                                    node1: node1,
                                    node2: node2,
                                    isSelfLoop: false,
                                    isNew: true  // Mark as new edge
                                };
                                squaredGraph.edges.push(newEdge);
                                squaredGraph.newEdges.push(newEdge);
                            }
                        }
                    }
                });
            });
        });
        
        return squaredGraph;
    }
    
    // Create animation steps showing each edge being added during squaring
    createSquareAnimationSteps(G0, G_squared) {
        const steps = [];
        const newEdges = G_squared.newEdges || [];
        
        // Start with original graph
        steps.push({
            type: 'square-start',
            graph: {
                nodes: [...G0.nodes],
                edges: [...G0.edges],
                degree: G0.degree
            },
            description: `Starting graph G₀ before squaring (${G0.edges.length} edges)`,
            highlightEdges: []
        });
        
        // Add each new edge one at a time
        newEdges.forEach((newEdge, index) => {
            const currentEdges = [...G0.edges];
            // Add all new edges up to and including this one
            for (let i = 0; i <= index; i++) {
                currentEdges.push(newEdges[i]);
            }
            
            steps.push({
                type: 'square-adding',
                graph: {
                    nodes: [...G0.nodes],
                    edges: currentEdges,
                    degree: G0.degree
                },
                description: `Adding 2-hop edge: ${newEdge.node1.id} ↔ ${newEdge.node2.id} (${index + 1}/${newEdges.length} new edges)`,
                highlightEdges: [newEdge],
                highlightColor: '#00ff00'
            });
        });
        
        return steps;
    }
    
    // Create animation steps showing zigzag product construction
    createZigzagAnimationSteps(G, H, G_zigzag) {
        const steps = [];
        
        // Start with empty product graph
        steps.push({
            type: 'zigzag-start',
            graph: {
                nodes: [],
                edges: [],
                degree: H.B
            },
            description: `Building zig-zag product G ⊗ H (will have ${G.nodes.length} × ${H.nodes.length} vertices)`,
            highlightEdges: []
        });
        
        // Add nodes in groups
        const nodeGroups = [];
        const nodesPerGroup = Math.ceil(G_zigzag.nodes.length / 4);
        for (let i = 0; i < G_zigzag.nodes.length; i += nodesPerGroup) {
            nodeGroups.push(G_zigzag.nodes.slice(0, i + nodesPerGroup));
        }
        
        nodeGroups.forEach((nodes, groupIdx) => {
            steps.push({
                type: 'zigzag-nodes',
                graph: {
                    nodes: nodes,
                    edges: [],
                    degree: H.B
                },
                description: `Adding product vertices (v,h): Group ${groupIdx + 1}/${nodeGroups.length} (${nodes.length} vertices total)`,
                highlightEdges: []
            });
        });
        
        // Add edges in batches
        const edgesPerBatch = Math.max(1, Math.ceil(G_zigzag.edges.length / 6));
        for (let i = 0; i < G_zigzag.edges.length; i += edgesPerBatch) {
            const currentEdges = G_zigzag.edges.slice(0, i + edgesPerBatch);
            const newBatchEdges = G_zigzag.edges.slice(i, i + edgesPerBatch);
            
            steps.push({
                type: 'zigzag-edges',
                graph: {
                    nodes: [...G_zigzag.nodes],
                    edges: currentEdges,
                    degree: H.B
                },
                description: `Adding zig-zag edges: batch ${Math.floor(i / edgesPerBatch) + 1} (${currentEdges.length}/${G_zigzag.edges.length} edges)`,
                highlightEdges: newBatchEdges,
                highlightColor: '#ff00ff'
            });
        }
        
        return steps;
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
