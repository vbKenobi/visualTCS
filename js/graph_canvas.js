// graph_canvas.js
// ----------------------------------------------------
// Main UI controller that connects the canvas events,
// graph logic classes, and drawing code.

// Imports
import { Graph, Node, Edge } from "./graph_lib/graph_logic.js";
import { drawGraph, resizeCanvas, animateTraversal } from "./graph_lib/graph_draw.js";

// ----------------------------------------------------
// Graph instance + UI state
// ----------------------------------------------------
const graph = new Graph();

let selectedNode = null;
let selectedEdge = null;
let isDragging = false;
let dragStartNode = null;

let animationRunning = false;
const stopAnimationRef = { stop: false };
let currentAnimationPromise = null;

// ----------------------------------------------------
// Canvas setup
// ----------------------------------------------------
const drawCanvas = document.getElementById("drawingCanvas");
const drawCtx = drawCanvas?.getContext("2d");

const vizCanvas = document.getElementById("visualizationCanvas");
const vizCtx = vizCanvas?.getContext("2d");

const vizTitle = document.getElementById("vizTitle");
const statusMsg = document.getElementById("statusMsg");

if (drawCanvas && vizCanvas) {
    resizeCanvas(drawCanvas);
    resizeCanvas(vizCanvas);

    window.addEventListener("resize", () => {
        resizeCanvas(drawCanvas);
        resizeCanvas(vizCanvas);
        drawGraph(drawCtx, graph);
    });
} else {
    console.error("Canvas elements not found!");
}

// ----------------------------------------------------
// Mouse Down – Select node/edge or create node
// ----------------------------------------------------
if (drawCanvas) {
    drawCanvas.addEventListener("mousedown", (e) => {
        const { x, y} = getMousePos(drawCanvas, e);

        // Try selecting node
        selectedNode = graph.nodes.find(n => n.contains(x, y));

        if (selectedNode) {
            isDragging = true;
            dragStartNode = selectedNode;
            return;
        }

        // Try selecting edge
        selectedEdge = graph.edges.find(edge => edge.contains(x, y));
        if (!selectedEdge) {
            // Create new node
            graph.addNode(x, y);
            drawGraph(drawCtx, graph);
        }
    });

    // ----------------------------------------------------
    // Mouse Move – Draw preview line when dragging
    // ----------------------------------------------------
    drawCanvas.addEventListener("mousemove", (e) => {
        if (!isDragging || !dragStartNode) return;

        const { x, y } = getMousePos(drawCanvas, e);

        drawGraph(drawCtx, graph);

        // Draw temporary O-O line
        drawCtx.beginPath();
        drawCtx.moveTo(dragStartNode.x, dragStartNode.y);
        drawCtx.lineTo(x, y);
        drawCtx.strokeStyle = "#00ffff";
        drawCtx.lineWidth = 2;
        drawCtx.setLineDash([5, 5]);
        drawCtx.stroke();
        drawCtx.setLineDash([]);
    });

    // ----------------------------------------------------
    // Mouse Up – Create edge if dragging onto another node
    // ----------------------------------------------------
    drawCanvas.addEventListener("mouseup", (e) => {
        if (!isDragging || !dragStartNode) return;

    const { x, y } = getMousePos(drawCanvas, e);
    const targetNode = graph.nodes.find(
        n => n.contains(x, y) && n !== dragStartNode
    );

    if (targetNode) {
        graph.addEdge(dragStartNode, targetNode);
    }

    isDragging = false;
    dragStartNode = null;

        drawGraph(drawCtx, graph);
    });

    // ----------------------------------------------------
    // Double Click – Set start node
    // ----------------------------------------------------
    drawCanvas.addEventListener("dblclick", (e) => {
    const { x, y } = getMousePos(drawCanvas, e);
    const node = graph.nodes.find(n => n.contains(x, y));

    if (node) {
        graph.startNode = node;
        showStatus(`Start node set to ${node.id}`, "success");
        drawGraph(drawCtx, graph);
        }
    });
}

// ----------------------------------------------------
// Keyboard – Delete selected node or edge
// ----------------------------------------------------
document.addEventListener("keydown", (e) => {
    if (e.key !== "Delete" && e.key !== "Backspace") return;

    if (selectedNode) {
        graph.removeNode(selectedNode);
        selectedNode = null;
        drawGraph(drawCtx, graph);
        e.preventDefault();
        return;
    }

    if (selectedEdge) {
        graph.removeEdge(selectedEdge);
        selectedEdge = null;
        drawGraph(drawCtx, graph);
        e.preventDefault();
        return;
    }
});

// ----------------------------------------------------
// Clear Button
// ----------------------------------------------------
const clearBtn = document.getElementById("clearBtn");
if (clearBtn) {
    clearBtn.addEventListener("click", () => {
        graph.nodes = [];
        graph.edges = [];
        graph.startNode = null;

        selectedNode = null;
        selectedEdge = null;

        drawGraph(drawCtx, graph);
        if (vizCtx) drawGraph(vizCtx, new Graph());

        if (vizTitle) vizTitle.textContent = "Algorithm Visualization";

        showStatus("Graph cleared", "info");
    });
}

// ----------------------------------------------------
// Run Algorithms
// ----------------------------------------------------
const runBtn = document.getElementById("runBtn");
if (runBtn) {
    runBtn.addEventListener("click", async () => {
    if (graph.nodes.length === 0) {
        showStatus("Please add some nodes first!", "error");
        return;
    }

    if (!graph.startNode) {
        showStatus("Double-click a node to set as start!", "error");
        return;
    }

    if (animationRunning) {
        stopAnimationRef.stop = true;
        document.getElementById("runBtn").textContent = "▶ Run";
        showStatus("Stopping animation...", "info");
        
        // Wait for animation to fully stop
        if (currentAnimationPromise) {
            await currentAnimationPromise;
        }
        
        animationRunning = false;
        showStatus("Animation stopped", "info");
        return;
    }

    const algorithmChoice = document.getElementById("algorithmSelect").value;

    stopAnimationRef.stop = false;
    animationRunning = true;

    document.getElementById("runBtn").textContent = "⏸ Stop";
    showStatus("Running algorithm(s)...", "info");

    if (algorithmChoice === "dfs") {
        if (vizTitle) vizTitle.textContent = "DFS Traversal";
        const result = graph.runDFS(graph.startNode.id);
        currentAnimationPromise = animateTraversal(vizCtx, graph, result, "#00ff99", stopAnimationRef);
        await currentAnimationPromise;
    } else if (algorithmChoice === "bfs") {
        if (vizTitle) vizTitle.textContent = "BFS Traversal";
        const result = graph.runBFS(graph.startNode.id);
        currentAnimationPromise = animateTraversal(vizCtx, graph, result, "#9b59b6", stopAnimationRef);
        await currentAnimationPromise;
    }

    currentAnimationPromise = null;
    animationRunning = false;
    document.getElementById("runBtn").textContent = "▶ Run";
    });
}

// ----------------------------------------------------
// Utilities
// ----------------------------------------------------
function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function showStatus(msg, type) {
    const box = document.getElementById("statusMsg");
    if (!box) {
        console.log(`Status: ${msg} (${type})`);
        return;
    }
    box.textContent = msg;
    box.className = `status status-${type}`;
    setTimeout(() => {
        box.textContent = "";
        box.className = "";
    }, 2500);
}

// Initial draw
drawGraph(drawCtx, graph);