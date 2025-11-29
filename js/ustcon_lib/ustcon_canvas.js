// ustcon_canvas.js
// ----------------------------------------------------
// Main UI controller for USTCON visualization

import { Graph } from "../graph_lib/graph_logic.js";
import { drawGraph, resizeCanvas } from "../graph_lib/graph_draw.js";
import { ReingoldAlgorithm } from "./ustcon_logic.js";
import { drawAlgorithmStep, resizeCanvas as resizeAlgoCanvas } from "./ustcon_draw.js";

// ----------------------------------------------------
// State
// ----------------------------------------------------
const inputGraph = new Graph();
let sNode = null;
let tNode = null;
let selectedNode = null;
let selectedEdge = null;
let isDragging = false;
let dragStartNode = null;

let algorithm = null;
let isAlgorithmRunning = false;

// ----------------------------------------------------
// Canvas setup
// ----------------------------------------------------
const inputCanvas = document.getElementById("inputCanvas");
const inputCtx = inputCanvas.getContext("2d");

const algoCanvas = document.getElementById("algoCanvas");
const algoCtx = algoCanvas.getContext("2d");

resizeCanvas(inputCanvas);
resizeAlgoCanvas(algoCanvas);

window.addEventListener("resize", () => {
    resizeCanvas(inputCanvas);
    resizeAlgoCanvas(algoCanvas);
    drawGraph(inputCtx, inputGraph);
    if (algorithm) {
        const step = algorithm.getCurrentStep();
        if (step) {
            const { width, height } = algoCanvas.getBoundingClientRect();
            drawAlgorithmStep(algoCtx, step, { width, height });
        }
    }
});

// ----------------------------------------------------
// Mouse events for input graph
// ----------------------------------------------------
inputCanvas.addEventListener("mousedown", (e) => {
    const { x, y } = getMousePos(inputCanvas, e);
    
    selectedNode = inputGraph.nodes.find(n => n.contains(x, y));
    
    if (selectedNode) {
        isDragging = true;
        dragStartNode = selectedNode;
        return;
    }
    
    selectedEdge = inputGraph.edges.find(edge => edge.contains(x, y));
    if (!selectedEdge) {
        inputGraph.addNode(x, y);
        drawGraph(inputCtx, inputGraph);
    }
});

inputCanvas.addEventListener("mousemove", (e) => {
    if (!isDragging || !dragStartNode) return;
    
    const { x, y } = getMousePos(inputCanvas, e);
    drawGraph(inputCtx, inputGraph);
    
    inputCtx.beginPath();
    inputCtx.moveTo(dragStartNode.x, dragStartNode.y);
    inputCtx.lineTo(x, y);
    inputCtx.strokeStyle = "#00ffff";
    inputCtx.lineWidth = 2;
    inputCtx.setLineDash([5, 5]);
    inputCtx.stroke();
    inputCtx.setLineDash([]);
});

inputCanvas.addEventListener("mouseup", (e) => {
    if (!isDragging || !dragStartNode) return;
    
    const { x, y } = getMousePos(inputCanvas, e);
    const targetNode = inputGraph.nodes.find(
        n => n.contains(x, y) && n !== dragStartNode
    );
    
    if (targetNode) {
        inputGraph.addEdge(dragStartNode, targetNode);
    }
    
    isDragging = false;
    dragStartNode = null;
    drawGraph(inputCtx, inputGraph);
});

inputCanvas.addEventListener("dblclick", (e) => {
    const { x, y } = getMousePos(inputCanvas, e);
    const node = inputGraph.nodes.find(n => n.contains(x, y));
    
    if (node) {
        if (!sNode) {
            sNode = node;
            showStatus("Set start node s (green)", "success");
        } else if (!tNode && node !== sNode) {
            tNode = node;
            showStatus("Set target node t (red)", "success");
        } else {
            // Reset
            sNode = null;
            tNode = null;
            showStatus("Reset s and t nodes", "info");
        }
        drawInputGraph();
    }
});

// ----------------------------------------------------
// Keyboard events
// ----------------------------------------------------
document.addEventListener("keydown", (e) => {
    if (e.key !== "Delete" && e.key !== "Backspace") return;
    
    if (selectedNode) {
        if (selectedNode === sNode) sNode = null;
        if (selectedNode === tNode) tNode = null;
        inputGraph.removeNode(selectedNode);
        selectedNode = null;
        drawInputGraph();
        e.preventDefault();
        return;
    }
    
    if (selectedEdge) {
        inputGraph.removeEdge(selectedEdge);
        selectedEdge = null;
        drawInputGraph();
        e.preventDefault();
        return;
    }
});

// ----------------------------------------------------
// Button handlers
// ----------------------------------------------------
const buildGraphBtn = document.getElementById("buildGraphBtn");
if (buildGraphBtn) {
    buildGraphBtn.addEventListener("click", () => {
        buildRandomGraph();
        showStatus("Built random graph", "success");
    });
}

const clearBtn = document.getElementById("clearBtn");
if (clearBtn) {
    clearBtn.addEventListener("click", () => {
        inputGraph.nodes = [];
        inputGraph.edges = [];
        inputGraph.startNode = null;
        sNode = null;
        tNode = null;
        selectedNode = null;
        selectedEdge = null;
        algorithm = null;
        
        drawInputGraph();
        algoCtx.clearRect(0, 0, algoCanvas.width, algoCanvas.height);
        
        const stepDesc = document.getElementById("stepDescription");
        if (stepDesc) {
            stepDesc.innerHTML = `
                <h4>Algorithm Overview</h4>
                <p>
                    1. Create fixed expander graph H<br>
                    2. Make input graph G₀ regular (B² degree)<br>
                    3. Iteratively apply: G_k = G²_{k-1} ⊗ H<br>
                    4. Solve connectivity on final graph G_L
                </p>
            `;
        }
        const stepCounter = document.getElementById("stepCounter");
        if (stepCounter) stepCounter.textContent = "Ready to run algorithm";
        
        const progressFill = document.getElementById("progressFill");
        if (progressFill) progressFill.style.width = "0%";
        
        const prevBtn = document.getElementById("prevBtn");
        const nextBtn = document.getElementById("nextBtn");
        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn) nextBtn.disabled = true;
        
        showStatus("Graph cleared", "info");
    });
}

const runAlgoBtn = document.getElementById("runAlgoBtn");
if (runAlgoBtn) {
    runAlgoBtn.addEventListener("click", () => {
        console.log("Run button clicked!");
        if (inputGraph.nodes.length === 0) {
            showStatus("Please add some nodes first!", "error");
            return;
        }
        
        if (!sNode || !tNode) {
            showStatus("Please set both s and t nodes (double-click)", "error");
            return;
        }
        
        runReingoldAlgorithm();
    });
}

const nextBtn = document.getElementById("nextBtn");
if (nextBtn) {
    nextBtn.addEventListener("click", () => {
        console.log("Next button clicked!");
        if (!algorithm) return;
        const step = algorithm.nextStep();
        if (step) {
            displayStep(step);
            updateProgress();
        }
    });
}

const prevBtn = document.getElementById("prevBtn");
if (prevBtn) {
    prevBtn.addEventListener("click", () => {
        console.log("Previous button clicked!");
        if (!algorithm) return;
        const step = algorithm.prevStep();
        if (step) {
            displayStep(step);
            updateProgress();
        }
    });
}

// ----------------------------------------------------
// Algorithm execution
// ----------------------------------------------------
function runReingoldAlgorithm() {
    console.log('Starting Reingold algorithm...');
    console.log('Input graph:', inputGraph);
    console.log('s node:', sNode);
    console.log('t node:', tNode);
    
    try {
        algorithm = new ReingoldAlgorithm(inputGraph, sNode, tNode, 4);
        console.log('Algorithm created:', algorithm);
        
        algorithm.initialize();
        console.log('Algorithm initialized, steps:', algorithm.steps.length);
        
        showStatus("Algorithm initialized!", "success");
        
        const firstStep = algorithm.getCurrentStep();
        console.log('First step:', firstStep);
        
        displayStep(firstStep);
        updateProgress();
        
        document.getElementById("prevBtn").disabled = false;
        document.getElementById("nextBtn").disabled = false;
    } catch (error) {
        console.error('Error running algorithm:', error);
        showStatus("Error: " + error.message, "error");
    }
}

function displayStep(step) {
    const rect = algoCanvas.getBoundingClientRect();
    console.log('Canvas dimensions:', rect.width, rect.height);
    console.log('Displaying step:', step);
    
    drawAlgorithmStep(algoCtx, step, { width: rect.width, height: rect.height });
    
    // Update description
    const desc = document.getElementById("stepDescription");
    desc.innerHTML = `
        <h4>Step ${algorithm.currentStep + 1}: ${getStepTitle(step.type)}</h4>
        <p>${step.description}</p>
    `;
}

function updateProgress() {
    const progress = algorithm.getProgress();
    document.getElementById("stepCounter").textContent = 
        `Step ${progress.current} of ${progress.total}`;
    document.getElementById("progressFill").style.width = `${progress.percentage}%`;
    
    document.getElementById("prevBtn").disabled = (progress.current === 1);
    document.getElementById("nextBtn").disabled = (progress.current === progress.total);
}

function getStepTitle(type) {
    const titles = {
        'expander': 'Create Fixed Expander H',
        'regularize': 'Make Graph Regular',
        'square': 'Square the Graph',
        'zigzag': 'Apply Zig-Zag Product',
        'solve': 'Solve Connectivity'
    };
    return titles[type] || type;
}

// ----------------------------------------------------
// Helper functions
// ----------------------------------------------------
function buildRandomGraph() {
    const nodeCount = 6 + Math.floor(Math.random() * 4);
    const { width, height } = inputCanvas.getBoundingClientRect();
    const margin = 60;
    
    // Clear existing
    inputGraph.nodes = [];
    inputGraph.edges = [];
    sNode = null;
    tNode = null;
    
    // Add nodes
    for (let i = 0; i < nodeCount; i++) {
        const x = margin + Math.random() * (width - 2 * margin);
        const y = margin + Math.random() * (height - 2 * margin);
        inputGraph.addNode(x, y);
    }
    
    // Add random edges
    const edgeCount = nodeCount + Math.floor(Math.random() * nodeCount);
    for (let i = 0; i < edgeCount; i++) {
        const n1 = inputGraph.nodes[Math.floor(Math.random() * nodeCount)];
        const n2 = inputGraph.nodes[Math.floor(Math.random() * nodeCount)];
        if (n1 !== n2) {
            inputGraph.addEdge(n1, n2);
        }
    }
    
    // Set s and t
    sNode = inputGraph.nodes[0];
    tNode = inputGraph.nodes[nodeCount - 1];
    
    drawInputGraph();
}

function drawInputGraph() {
    inputCtx.clearRect(0, 0, inputCanvas.width, inputCanvas.height);
    
    // Draw edges
    inputGraph.edges.forEach(edge => {
        inputCtx.beginPath();
        inputCtx.moveTo(edge.node1.x, edge.node1.y);
        inputCtx.lineTo(edge.node2.x, edge.node2.y);
        inputCtx.strokeStyle = "#4a5568";
        inputCtx.lineWidth = 2;
        inputCtx.stroke();
    });
    
    // Draw nodes
    inputGraph.nodes.forEach(node => {
        let color = "#718096";
        if (node === sNode) color = "#00ff99";
        if (node === tNode) color = "#e74c3c";
        
        inputCtx.fillStyle = color;
        inputCtx.beginPath();
        inputCtx.arc(node.x, node.y, 18, 0, Math.PI * 2);
        inputCtx.fill();
        
        inputCtx.strokeStyle = "#1a202c";
        inputCtx.lineWidth = 2;
        inputCtx.stroke();
        
        inputCtx.fillStyle = "white";
        inputCtx.font = "bold 14px Arial";
        inputCtx.textAlign = "center";
        inputCtx.textBaseline = "middle";
        
        if (node === sNode) {
            inputCtx.fillText("s", node.x, node.y);
        } else if (node === tNode) {
            inputCtx.fillText("t", node.x, node.y);
        } else {
            inputCtx.fillText(node.id, node.x, node.y);
        }
    });
}

function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function showStatus(msg, type) {
    const box = document.getElementById("statusMsg");
    box.textContent = msg;
    box.className = `status status-${type}`;
    setTimeout(() => {
        box.textContent = "";
        box.className = "";
    }, 2500);
}

// Initial draw
drawInputGraph();
