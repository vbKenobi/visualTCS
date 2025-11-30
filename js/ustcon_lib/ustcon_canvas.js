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
let currentFrameIndex = 0;
let animationTimer = null;
let isAnimating = false;

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
        const stage = algorithm.getCurrentStage();
        if (stage) {
            displayStage(stage);
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
        
        // Stop any ongoing animation
        if (animationTimer) {
            clearInterval(animationTimer);
            animationTimer = null;
            isAnimating = false;
        }
        // Stop code auto-advance
        if (codeAdvanceTimer) {
            clearInterval(codeAdvanceTimer);
            codeAdvanceTimer = null;
        }
        
        const stage = algorithm.nextStage();
        if (stage) {
            displayStage(stage);
            updateProgress();
        }
    });
}

const prevBtn = document.getElementById("prevBtn");
if (prevBtn) {
    prevBtn.addEventListener("click", () => {
        console.log("Previous button clicked!");
        if (!algorithm) return;
        
        // Stop any ongoing animation
        if (animationTimer) {
            clearInterval(animationTimer);
            animationTimer = null;
            isAnimating = false;
        }
        // Stop code auto-advance
        if (codeAdvanceTimer) {
            clearInterval(codeAdvanceTimer);
            codeAdvanceTimer = null;
        }
        
        const stage = algorithm.prevStage();
        if (stage) {
            displayStage(stage);
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
    console.log('Input graph nodes:', inputGraph.nodes);
    console.log('Input graph edges:', inputGraph.edges);
    console.log('s node:', sNode);
    console.log('t node:', tNode);
    
    try {
        // Use B=2 for cleaner visualization (smaller clouds)
        algorithm = new ReingoldAlgorithm(inputGraph, sNode, tNode, 2);
        console.log('Algorithm created:', algorithm);
        console.log('L (iterations):', algorithm.L);
        console.log('B:', algorithm.B);
        
        algorithm.initialize();
        console.log('Algorithm initialized!');
        console.log('Stages:', algorithm.stages);
        console.log('Number of stages:', algorithm.stages ? algorithm.stages.length : 'undefined');
        console.log('Current stage index:', algorithm.currentStage);
        
        showStatus("Algorithm initialized!", "success");
        
        const firstStage = algorithm.getCurrentStage();
        console.log('First stage:', firstStage);
        
        if (firstStage) {
            displayStage(firstStage);
            updateProgress();
        } else {
            console.error('First stage is null/undefined!');
            showStatus("Error: Could not get first stage", "error");
        }
        
        const prevBtn = document.getElementById("prevBtn");
        const nextBtn = document.getElementById("nextBtn");
        if (prevBtn) prevBtn.disabled = false;
        if (nextBtn) nextBtn.disabled = false;
    } catch (error) {
        console.error('Error running algorithm:', error);
        console.error('Error stack:', error.stack);
        showStatus("Error: " + error.message, "error");
    }
}

// Auto-advance through code execution stages
let codeAdvanceTimer = null;

function autoAdvanceCodeStages() {
    if (!algorithm) return;
    
    const stages = algorithm.stages;
    let currentIndex = algorithm.currentStage;
    
    // Find first code-execution stage after demo
    let foundCodeStage = false;
    for (let i = currentIndex + 1; i < stages.length; i++) {
        if (stages[i].type === 'code-execution') {
            foundCodeStage = true;
            break;
        }
    }
    
    if (!foundCodeStage) return;
    
    // Auto-advance through remaining stages
    codeAdvanceTimer = setInterval(() => {
        const nextStage = algorithm.nextStage();
        if (nextStage) {
            displayStage(nextStage);
            updateProgress();
            
            // Stop if we've reached the end
            if (algorithm.currentStage >= stages.length - 1) {
                clearInterval(codeAdvanceTimer);
                codeAdvanceTimer = null;
            }
        } else {
            clearInterval(codeAdvanceTimer);
            codeAdvanceTimer = null;
        }
    }, 2000); // 2 seconds per code stage
}

function displayStage(stage) {
    if (!stage) {
        console.error('No stage to display');
        return;
    }
    
    // Stop any ongoing animation
    if (animationTimer) {
        clearInterval(animationTimer);
        animationTimer = null;
    }
    
    const rect = algoCanvas.getBoundingClientRect();
    console.log('Canvas dimensions:', rect.width, rect.height);
    console.log('Displaying stage:', stage);
    console.log('Stage type:', stage.type);
    console.log('Stage frames:', stage.frames ? stage.frames.length : 0);
    
    // Update description panel with enhanced info
    const desc = document.getElementById("stepDescription");
    if (desc) {
        let memoryHtml = '';
        if (stage.memory && typeof stage.memory === 'object') {
            memoryHtml = '<div style="margin-top: 10px; padding: 8px; background: #1a1a2e; border-radius: 4px; font-size: 11px;">';
            memoryHtml += '<strong style="color: #34d399;">💾 Memory:</strong><br>';
            for (const [key, value] of Object.entries(stage.memory)) {
                if (typeof value === 'object') {
                    memoryHtml += `<span style="color: #f0abfc;">${key}:</span><br>`;
                    for (const [subKey, subVal] of Object.entries(value)) {
                        memoryHtml += `  <span style="color: #94a3b8;">${subKey}:</span> <span style="color: #fbbf24;">${subVal}</span><br>`;
                    }
                } else {
                    memoryHtml += `<span style="color: #94a3b8;">${key}:</span> <span style="color: #fbbf24;">${value}</span><br>`;
                }
            }
            memoryHtml += '</div>';
        }
        
        desc.innerHTML = `
            <h4>${stage.name}</h4>
            <p>${stage.description}</p>
            ${memoryHtml}
        `;
    }
    
    // If stage has animation frames, auto-play them
    if (stage.frames && stage.frames.length > 1) {
        currentFrameIndex = 0;
        isAnimating = true;
        
        // Show first frame immediately
        displayFrame(stage, 0);
        
        // Auto-animate through frames (slower for better understanding)
        animationTimer = setInterval(() => {
            currentFrameIndex++;
            if (currentFrameIndex >= stage.frames.length) {
                clearInterval(animationTimer);
                animationTimer = null;
                isAnimating = false;
                currentFrameIndex = stage.frames.length - 1;
                
                // After demo animation, auto-advance through code execution stages
                if (stage.type === 'demo-animation') {
                    autoAdvanceCodeStages();
                }
            }
            displayFrame(stage, currentFrameIndex);
        }, 1500); // 1.5 seconds between frames for clarity
    } else if (stage.type === 'demo-animation') {
        // Demo animation with single frame - just display and then auto-advance
        displayFrame(stage, 0);
        // Wait a bit then advance to code stages
        setTimeout(() => autoAdvanceCodeStages(), 2000);
    } else if (stage.type === 'code-execution') {
        // Code execution stage - just display
        displayFrame(stage, 0);
    } else {
        // Single frame or legacy types, just display it
        const graphToShow = stage.graph;
        if (graphToShow || stage.type === 'code-walkthrough' || stage.type === 'overview') {
            displayFrame(stage, 0);
        } else {
            console.error('No graph to display!');
            algoCtx.clearRect(0, 0, rect.width * 2, rect.height * 2);
            algoCtx.fillStyle = '#ff4444';
            algoCtx.font = '16px Arial';
            algoCtx.textAlign = 'center';
            algoCtx.fillText('No graph data available for this stage', rect.width / 2, rect.height / 2);
        }
    }
}

function displayFrame(stage, frameIndex) {
    const rect = algoCanvas.getBoundingClientRect();
    const frame = stage.frames && stage.frames[frameIndex] ? stage.frames[frameIndex] : null;
    
    // For demo-animation, pass the frame with type
    if (stage.type === 'demo-animation') {
        const stepData = frame ? { ...frame, type: stage.type } : { type: stage.type, ...stage };
        drawAlgorithmStep(algoCtx, stepData, { width: rect.width, height: rect.height });
    } else if (stage.type === 'code-execution') {
        // For code-execution, the stage itself has all the data (code, stats, etc)
        const stepData = { ...stage, type: 'code-execution' };
        drawAlgorithmStep(algoCtx, stepData, { width: rect.width, height: rect.height });
    } else if (frame || stage.graph) {
        const graphData = frame || stage.graph;
        // Build step data combining frame and stage info (legacy format)
        const stepData = { 
            // Graph data
            graph: graphData, 
            nodes: graphData.nodes || (graphData.graph && graphData.graph.nodes),
            edges: graphData.edges || (graphData.graph && graphData.graph.edges),
            
            // Type info - frame can override stage type
            type: (frame && frame.type) || stage.type,
            
            // Descriptions
            description: (frame && frame.description) || stage.description,
            name: stage.name,
            
            // Complexity and memory
            complexity: stage.complexity,
            codeStep: stage.codeStep,
            memory: stage.memory,
            
            // Highlighting
            highlightEdges: frame && frame.highlightEdges,
            highlightColor: frame && frame.highlightColor,
            highlightNode: frame && frame.highlightNode,
            highlightNodes: frame && frame.highlightNodes,
            
            // Zigzag-specific
            clouds: frame && frame.clouds,
            cloudInfo: frame && frame.cloudInfo,
            patternSteps: frame && frame.patternSteps,
            stats: frame && frame.stats,
            infoBox: frame && frame.infoBox,
            
            // Solve result
            result: stage.result,
            resultColor: stage.resultColor,
            
            // Iteration info
            iteration: stage.iteration
        };
        
        drawAlgorithmStep(algoCtx, stepData, { width: rect.width, height: rect.height });
        
        // Don't overlay for code-walkthrough or overview (they have their own panels)
        if (stage.type !== 'code-walkthrough' && stage.type !== 'overview' && 
            stage.type !== 'demo-animation' && stage.type !== 'code-execution') {
            // Update complexity display in top-right
            algoCtx.save();
            algoCtx.fillStyle = '#161b22';
            algoCtx.fillRect(rect.width - 250, 10, 240, 60);
            algoCtx.strokeStyle = '#2d333b';
            algoCtx.strokeRect(rect.width - 250, 10, 240, 60);
            algoCtx.fillStyle = '#00ffff';
            algoCtx.font = 'bold 12px Inter';
            algoCtx.textAlign = 'left';
            algoCtx.fillText('Space Complexity:', rect.width - 240, 30);
            algoCtx.fillStyle = '#e5e5e5';
            algoCtx.font = '11px Inter';
            const complexityText = typeof stage.complexity === 'string' ? stage.complexity : 'O(log n)';
            algoCtx.fillText(complexityText, rect.width - 240, 50);
            algoCtx.restore();
        }
    } else {
        // No frame or graph data
        algoCtx.clearRect(0, 0, rect.width * 2, rect.height * 2);
        algoCtx.fillStyle = '#f8d717';
        algoCtx.font = '16px Arial';
        algoCtx.textAlign = 'center';
        algoCtx.fillText('Loading visualization...', rect.width / 2, rect.height / 2);
    }
}

function updateProgress() {
    const progress = algorithm.getProgress();
    const stepCounter = document.getElementById("stepCounter");
    const progressFill = document.getElementById("progressFill");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    
    if (stepCounter) {
        stepCounter.textContent = `Stage ${progress.current} of ${progress.total}`;
    }
    if (progressFill) {
        progressFill.style.width = `${progress.percentage}%`;
    }
    
    if (prevBtn) prevBtn.disabled = (progress.current === 1);
    if (nextBtn) nextBtn.disabled = (progress.current === progress.total);
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
