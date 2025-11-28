// Graph data structure
let nodes = [];
let edges = [];
let startNode = null;
let selectedNode = null;
let selectedEdge = null;
let isDragging = false;
let dragStart = null;

// Canvas setup
const drawCanvas = document.getElementById('drawingCanvas');
const drawCtx = drawCanvas.getContext('2d');
const vizCanvas = document.getElementById('visualizationCanvas');
const vizCtx = vizCanvas.getContext('2d');
const vizTitle = document.getElementById('vizTitle');

function resizeCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    canvas.getContext('2d').scale(dpr, dpr);
    return {width: rect.width, height: rect.height};
}

resizeCanvas(drawCanvas);
resizeCanvas(vizCanvas);

window.addEventListener('resize', () => {
    resizeCanvas(drawCanvas);
    resizeCanvas(vizCanvas);
    drawGraph(drawCtx, nodes, edges, startNode);
});

// Node class
class Node {
    constructor(x, y, id) {
        this.x = x;
        this.y = y;
        this.id = id;
        this.radius = 20;
    }

    contains(x, y) {
        const dx = this.x - x;
        const dy = this.y - y;
        return Math.sqrt(dx * dx + dy * dy) <= this.radius;
    }

    draw(ctx, isStart = false, color = '#718096', scale = 1) {
        // Enable anti-aliasing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        const radius = this.radius * scale;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = isStart ? '#22d3ee' : color; // Softer cyan for start
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#0d1117';
        ctx.font = `bold ${14 * scale}px Poppins, Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.id, this.x, this.y);
    }
}

// Edge class
class Edge {
    constructor(node1, node2) {
        this.node1 = node1;
        this.node2 = node2;
    }

    draw(ctx, color = '#4a5568', isHighlight = false) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        ctx.beginPath();
        ctx.moveTo(this.node1.x, this.node1.y);
        ctx.lineTo(this.node2.x, this.node2.y);
        ctx.strokeStyle = color;
        ctx.lineWidth = isHighlight ? 4 : 3;
        ctx.lineCap = 'round';
        ctx.stroke();
    }

    contains(x, y, threshold = 10) {
        const A = this.node1;
        const B = this.node2;
        const dx = B.x - A.x;
        const dy = B.y - A.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const dot = ((x - A.x) * dx + (y - A.y) * dy) / (length * length);
        
        if (dot < 0 || dot > 1) return false;
        
        const closestX = A.x + dot * dx;
        const closestY = A.y + dot * dy;
        const dist = Math.sqrt((x - closestX) ** 2 + (y - closestY) ** 2);
        
        return dist <= threshold;
    }
}

// Draw graph
function drawGraph(ctx, nodeList, edgeList, start, visitedNodes = new Set(), visitColor = '#00ff99', currentNode = null) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Enable high-quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw edges
    edgeList.forEach(edge => {
        const bothVisited = visitedNodes.has(edge.node1.id) && visitedNodes.has(edge.node2.id);
        const color = bothVisited ? visitColor : '#4a5568';
        edge.draw(ctx, color, bothVisited);
    });

    // Draw nodes
    nodeList.forEach(node => {
        const isStart = start && node.id === start.id;
        const isVisited = visitedNodes.has(node.id);
        const isCurrent = currentNode === node.id;
        
        let color = '#718096'; // Default color
        if (isCurrent) {
            color = '#f59e0b'; // Softer amber for current node
        } else if (isVisited) {
            color = '#34d399'; // Softer emerald for visited
        }
        
        node.draw(ctx, isStart, color, isCurrent ? 1.3 : 1);
    });
}

// Mouse event handlers
drawCanvas.addEventListener('mousedown', (e) => {
    const rect = drawCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on existing node
    selectedNode = nodes.find(node => node.contains(x, y));
    
    if (selectedNode) {
        isDragging = true;
        dragStart = selectedNode;
    } else {
        // Check if clicking on edge
        selectedEdge = edges.find(edge => edge.contains(x, y));
        if (!selectedEdge) {
            // Add new node
            const newNode = new Node(x, y, nodes.length);
            nodes.push(newNode);
            drawGraph(drawCtx, nodes, edges, startNode);
        }
    }
});

drawCanvas.addEventListener('mousemove', (e) => {
    if (isDragging && dragStart) {
        const rect = drawCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Draw temp line
        drawGraph(drawCtx, nodes, edges, startNode);
        drawCtx.beginPath();
        drawCtx.moveTo(dragStart.x, dragStart.y);
        drawCtx.lineTo(x, y);
        drawCtx.strokeStyle = '#00ffff';
        drawCtx.lineWidth = 2;
        drawCtx.setLineDash([5, 5]);
        drawCtx.stroke();
        drawCtx.setLineDash([]);
    }
});

drawCanvas.addEventListener('mouseup', (e) => {
    if (isDragging && dragStart) {
        const rect = drawCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const targetNode = nodes.find(node => node.contains(x, y) && node !== dragStart);
        
        if (targetNode) {
            // Check if edge already exists
            const edgeExists = edges.some(edge => 
                (edge.node1 === dragStart && edge.node2 === targetNode) ||
                (edge.node1 === targetNode && edge.node2 === dragStart)
            );

            if (!edgeExists) {
                edges.push(new Edge(dragStart, targetNode));
            }
        }

        isDragging = false;
        dragStart = null;
        drawGraph(drawCtx, nodes, edges, startNode);
    }
});

drawCanvas.addEventListener('dblclick', (e) => {
    const rect = drawCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const node = nodes.find(n => n.contains(x, y));
    if (node) {
        startNode = node;
        showStatus('Start node set to node ' + node.id, 'success');
        drawGraph(drawCtx, nodes, edges, startNode);
    }
});

// Keyboard handlers
document.addEventListener('keydown', (e) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNode) {
            // Remove node and connected edges
            nodes = nodes.filter(n => n !== selectedNode);
            edges = edges.filter(edge => edge.node1 !== selectedNode && edge.node2 !== selectedNode);
            if (startNode === selectedNode) startNode = null;
            selectedNode = null;
            
            // Reassign IDs
            nodes.forEach((node, i) => node.id = i);
            
            drawGraph(drawCtx, nodes, edges, startNode);
            e.preventDefault();
        } else if (selectedEdge) {
            edges = edges.filter(e => e !== selectedEdge);
            selectedEdge = null;
            drawGraph(drawCtx, nodes, edges, startNode);
            e.preventDefault();
        }
    }
});

// Clear button
document.getElementById('clearBtn').addEventListener('click', () => {
    nodes = [];
    edges = [];
    startNode = null;
    selectedNode = null;
    selectedEdge = null;
    drawGraph(drawCtx, nodes, edges, startNode);
    drawGraph(vizCtx, [], [], null);
    vizTitle.textContent = 'Algorithm Visualization';
    showStatus('Graph cleared', 'info');
});

let animationRunning = false;
let stopAnimation = false;

// Run algorithms
document.getElementById('runBtn').addEventListener('click', async () => {
    if (nodes.length === 0) {
        showStatus('Please add some nodes first!', 'error');
        return;
    }

    if (!startNode) {
        showStatus('Please double-click a node to set as start!', 'error');
        return;
    }

    if (animationRunning) {
        // Stop animation
        stopAnimation = true;
        animationRunning = false;
        document.getElementById('runBtn').textContent = '▶ Run';
        document.getElementById('runBtn').disabled = false;
        showStatus('Animation stopped', 'info');
        return;
    }

    const algorithmChoice = document.getElementById('algorithmSelect').value;
    stopAnimation = false;
    animationRunning = true;
    document.getElementById('runBtn').textContent = '⏸ Stop';
    showStatus('Running algorithm(s)...', 'info');

    // Build adjacency list
    const graph = {};
    nodes.forEach(node => graph[node.id] = []);
    edges.forEach(edge => {
        graph[edge.node1.id].push(edge.node2.id);
        graph[edge.node2.id].push(edge.node1.id);
    });

    // Run selected algorithm(s)
    if (algorithmChoice === 'dfs') {
        vizTitle.textContent = 'DFS Traversal (Looping)';
        const dfsResult = runDFS(graph, startNode.id);
        await animateTraversal(vizCtx, dfsResult, '#00ff99');
    } else if (algorithmChoice === 'bfs') {
        vizTitle.textContent = 'BFS Traversal (Looping)';
        const bfsResult = runBFS(graph, startNode.id);
        await animateTraversal(vizCtx, bfsResult, '#9b59b6');
    } else {
        // Alternate between DFS and BFS
        while (!stopAnimation) {
            vizTitle.textContent = 'DFS Traversal';
            const dfsResult = runDFS(graph, startNode.id);
            await runSingleLoop(vizCtx, dfsResult, '#00ff99');
            
            if (stopAnimation) break;
            await sleep(1000);
            
            vizTitle.textContent = 'BFS Traversal';
            const bfsResult = runBFS(graph, startNode.id);
            await runSingleLoop(vizCtx, bfsResult, '#9b59b6');
            
            if (stopAnimation) break;
            await sleep(1000);
        }
    }
    
    animationRunning = false;
    document.getElementById('runBtn').textContent = '▶ Run';
});

// DFS implementation
function runDFS(graph, start) {
    const visited = new Set();
    const traversal = [];

    function dfsHelper(node) {
        visited.add(node);
        traversal.push(node);

        for (const neighbor of graph[node] || []) {
            if (!visited.has(neighbor)) {
                dfsHelper(neighbor);
            }
        }
    }

    dfsHelper(start);
    return traversal;
}

// BFS implementation
function runBFS(graph, start) {
    const visited = new Set([start]);
    const queue = [start];
    const traversal = [];

    while (queue.length > 0) {
        const node = queue.shift();
        traversal.push(node);

        for (const neighbor of graph[node] || []) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        }
    }

    return traversal;
}

// Animate traversal with smooth transitions
async function animateTraversal(ctx, traversal, color) {
    while (true) { // Loop forever
        const visited = new Set();
        
        // Show initial state
        drawGraph(ctx, nodes, edges, startNode, visited, color);
        await sleep(1000);
        
        for (let i = 0; i < traversal.length; i++) {
            const currentNodeId = traversal[i];
            
            // Animate current node pulsing
            for (let frame = 0; frame < 10; frame++) {
                const scale = 1 + Math.sin(frame / 10 * Math.PI) * 0.3;
                drawGraph(ctx, nodes, edges, startNode, visited, color, currentNodeId);
                
                // Draw pulsing current node
                const currentNode = nodes.find(n => n.id === currentNodeId);
                if (currentNode) {
                    ctx.save();
                    ctx.globalAlpha = 0.3 - (frame / 10) * 0.3;
                    ctx.beginPath();
                    ctx.arc(currentNode.x, currentNode.y, currentNode.radius * (1 + frame / 5), 0, Math.PI * 2);
                    ctx.fillStyle = '#f59e0b'; // Match the softer amber
                    ctx.fill();
                    ctx.restore();
                }
                
                await sleep(30);
            }
            
            // Add to visited
            visited.add(currentNodeId);
            drawGraph(ctx, nodes, edges, startNode, visited, color);
            await sleep(400);
        }
        
        // Hold final state
        await sleep(2000);
        
        // Brief pause before restart
        await sleep(500);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Status message
function showStatus(message, type) {
    const statusDiv = document.getElementById('statusMsg');
    statusDiv.textContent = message;
    statusDiv.className = `status status-${type}`;
    
    setTimeout(() => {
        statusDiv.textContent = '';
        statusDiv.className = '';
    }, 3000);
}

// Code tabs
document.querySelectorAll('.code-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.code-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.code-content').forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab + '-code').classList.add('active');
    });
});

// Initial draw
drawGraph(drawCtx, nodes, edges, startNode);