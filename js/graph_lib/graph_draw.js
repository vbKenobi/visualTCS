// graph_draw.js
// -----------------------------
// Contains only drawing operations and canvas helpers.
// No graph data is created or modified here.

// Resize canvas with DPI scaling
export function resizeCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    return { width: rect.width, height: rect.height };
}

// Draw the full graph
export function drawGraph(
    ctx,
    graph,
    visitedNodes = new Set(),
    visitColor = "#00ff99",
    currentNode = null
) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // ----- Edges -----
    graph.edges.forEach(edge => {
        const bothVisited =
            visitedNodes.has(edge.node1.id) &&
            visitedNodes.has(edge.node2.id);

        const color = bothVisited ? visitColor : "#4a5568";

        drawEdge(ctx, edge, color, bothVisited);
    });

    // ----- Nodes -----
    graph.nodes.forEach(node => {
        const isStart = graph.startNode && node.id === graph.startNode.id;
        const isVisited = visitedNodes.has(node.id);
        const isCurrent = node.id === currentNode;

        let color = "#718096";
        if (isCurrent) color = "#f59e0b";
        else if (isVisited) color = "#34d399";

        drawNode(ctx, node, isStart, color, isCurrent ? 1.3 : 1);
    });
}

// Draw a single node
function drawNode(ctx, node, isStart, color, scale = 1) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius * scale, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = isStart ? 4 : 2;
    ctx.strokeStyle = isStart ? "#ff0080" : "#1a202c";
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = "white";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(node.id, node.x, node.y);
}

// Draw a single edge
function drawEdge(ctx, edge, color, bold = false) {
    ctx.beginPath();
    ctx.moveTo(edge.node1.x, edge.node1.y);
    ctx.lineTo(edge.node2.x, edge.node2.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = bold ? 4 : 2;
    ctx.stroke();
}

// Animate a traversal sequence
export async function animateTraversal(ctx, graph, traversal, color, stopAnimationRef) {
    while (!stopAnimationRef.stop) {
        const visited = new Set();

        drawGraph(ctx, graph, visited, color);
        await sleep(500);
        if (stopAnimationRef.stop) break;

        for (let id of traversal) {
            if (stopAnimationRef.stop) break;
            
            drawGraph(ctx, graph, visited, color, id);
            await sleep(400);
            if (stopAnimationRef.stop) break;

            visited.add(id);
            drawGraph(ctx, graph, visited, color);
            await sleep(250);
        }

        if (stopAnimationRef.stop) break;
        await sleep(1500); // pause before restart
    }
}

// Utility function for sleep
function sleep(ms) {
    return new Promise(res => setTimeout(res, ms));
}