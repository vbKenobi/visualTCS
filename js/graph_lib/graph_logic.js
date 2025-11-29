// graph_logic.js
// -------------------------
// Contains the underlying data model for Nodes, Edges, and Graph.

// -------- Node Class --------
export class Node {
    constructor(x, y, id, radius = 18) {
        this.x = x;
        this.y = y;
        this.id = id;
        this.radius = radius;
    }

    contains(px, py) {
        const dx = px - this.x;
        const dy = py - this.y;
        return dx * dx + dy * dy <= this.radius * this.radius;
    }
}

// -------- Edge Class --------
export class Edge {
    constructor(node1, node2) {
        this.node1 = node1;
        this.node2 = node2;
    }

    // Simple hit detection for clicking edges
    contains(px, py) {
        const { x: x1, y: y1 } = this.node1;
        const { x: x2, y: y2 } = this.node2;

        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;

        if (lenSq === 0) return false;

        let t = dot / lenSq;
        t = Math.max(0, Math.min(1, t));

        const closestX = x1 + t * C;
        const closestY = y1 + t * D;

        const distSq = (px - closestX) ** 2 + (py - closestY) ** 2;

        return distSq < 100; // edge thickness sensitivity
    }
}

// -------- Graph Model --------
export class Graph {
    constructor() {
        this.nodes = [];
        this.edges = [];
        this.startNode = null;
    }

    addNode(x, y) {
        const newNode = new Node(x, y, this.nodes.length);
        this.nodes.push(newNode);
        return newNode;
    }

    removeNode(node) {
        this.nodes = this.nodes.filter(n => n !== node);
        this.edges = this.edges.filter(e => e.node1 !== node && e.node2 !== node);

        // Reassign IDs
        this.nodes.forEach((n, i) => (n.id = i));

        if (this.startNode === node) this.startNode = null;
    }

    addEdge(node1, node2) {
        const exists = this.edges.some(
            e =>
                (e.node1 === node1 && e.node2 === node2) ||
                (e.node1 === node2 && e.node2 === node1)
        );

        if (!exists) {
            const edge = new Edge(node1, node2);
            this.edges.push(edge);
            return edge;
        }
        return null;
    }

    removeEdge(edge) {
        this.edges = this.edges.filter(e => e !== edge);
    }

    buildAdjList() {
        const graph = {};
        this.nodes.forEach(node => (graph[node.id] = []));

        this.edges.forEach(e => {
            graph[e.node1.id].push(e.node2.id);
            graph[e.node2.id].push(e.node1.id);
        });

        return graph;
    }

    runDFS(start) {
        const graph = this.buildAdjList();
        const visited = new Set();
        const traversal = [];

        function dfs(node) {
            visited.add(node);
            traversal.push(node);
            for (const neigh of graph[node]) {
                if (!visited.has(neigh)) dfs(neigh);
            }
        }

        dfs(start);
        return traversal;
    }

    runBFS(start) {
        const graph = this.buildAdjList();
        const visited = new Set([start]);
        const queue = [start];
        const traversal = [];

        while (queue.length) {
            const node = queue.shift();
            traversal.push(node);
            for (const neigh of graph[node]) {
                if (!visited.has(neigh)) {
                    visited.add(neigh);
                    queue.push(neigh);
                }
            }
        }

        return traversal;
    }
}