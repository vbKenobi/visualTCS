// ustcon_draw.js
// ----------------------------------------------------
// Drawing functions for USTCON visualization

// Draw algorithm step visualization
export function drawAlgorithmStep(ctx, step, canvasDimensions) {
    const width = canvasDimensions.width;
    const height = canvasDimensions.height;
    
    ctx.clearRect(0, 0, width * 2, height * 2); // Account for DPR
    
    if (!step) {
        ctx.fillStyle = '#888';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No step data available', width / 2, height / 2);
        return;
    }
    
    if (!step.graph) {
        ctx.fillStyle = '#888';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Step type: ${step.type} (no graph data)`, width / 2, height / 2);
        return;
    }
    
    switch (step.type) {
        case 'expander':
            drawExpanderGraph(ctx, step.graph, width, height);
            break;
        case 'regularize':
            drawRegularGraph(ctx, step.graph, width, height);
            break;
        case 'square':
            drawSquaredGraph(ctx, step.graph, width, height);
            break;
        case 'zigzag':
            drawZigzagGraph(ctx, step.graph, width, height);
            break;
        case 'solve':
            drawFinalGraph(ctx, step.graph, width, height);
            break;
        default:
            ctx.fillStyle = '#888';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Unknown step type: ' + step.type, width / 2, height / 2);
    }
}

// Draw expander graph H
function drawExpanderGraph(ctx, H, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;
    
    // Draw title
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Fixed Expander Graph H', centerX, 40);
    
    // Draw nodes in a circle
    const nodePositions = [];
    for (let i = 0; i < H.nodes.length; i++) {
        const angle = (2 * Math.PI * i) / H.nodes.length;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        nodePositions.push({ x, y });
    }
    
    // Draw edges
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 1;
    H.edges.forEach(edge => {
        const from = nodePositions[edge.from];
        const to = nodePositions[edge.to];
        
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
    });
    
    // Draw nodes
    nodePositions.forEach((pos, i) => {
        ctx.fillStyle = '#9b59b6';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.fillText(i.toString(), pos.x, pos.y + 3);
    });
    
    // Draw properties
    ctx.fillStyle = '#888';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Degree: ${H.B}`, 20, height - 60);
    ctx.fillText(`Vertices: ${H.size}`, 20, height - 40);
    ctx.fillText(`Expansion: 1/4`, 20, height - 20);
}

// Draw regular graph
function drawRegularGraph(ctx, graph, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Regularized Graph G₀', centerX, 30);
    
    ctx.fillStyle = '#888';
    ctx.font = '14px Arial';
    ctx.fillText(`${graph.nodes.length} vertices, degree ${graph.degree}`, centerX, 55);
    
    // Circular layout
    const positions = {};
    const radius = Math.min(width, height) * 0.35;
    
    graph.nodes.forEach((node, i) => {
        const angle = (2 * Math.PI * i) / graph.nodes.length - Math.PI / 2;
        positions[node.id] = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle) + 40
        };
    });
    
    // Draw regular edges
    ctx.lineWidth = 2;
    const drawnEdges = new Set();
    graph.edges.forEach(edge => {
        const from = positions[edge.node1.id];
        const to = positions[edge.node2.id];
        
        if (!from || !to) return;
        
        if (edge.isSelfLoop) {
            // Draw self-loop
            ctx.strokeStyle = '#e74c3c';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(from.x + 20, from.y - 20, 12, 0, Math.PI * 2);
            ctx.stroke();
        } else {
            const edgeKey = `${Math.min(edge.node1.id, edge.node2.id)}-${Math.max(edge.node1.id, edge.node2.id)}`;
            if (!drawnEdges.has(edgeKey)) {
                ctx.strokeStyle = '#4a5568';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(from.x, from.y);
                ctx.lineTo(to.x, to.y);
                ctx.stroke();
                drawnEdges.add(edgeKey);
            }
        }
    });
    
    // Draw nodes
    graph.nodes.forEach(node => {
        const pos = positions[node.id];
        if (!pos) return;
        
        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#1a202c';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 13px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.id.toString(), pos.x, pos.y);
    });
    
    // Draw rotation map visualization
    ctx.fillStyle = '#888';
    ctx.font = '13px Courier';
    ctx.textAlign = 'left';
    ctx.fillText('Rotation Map Example:', 20, height - 80);
    ctx.fillText(`Rot(v,i) = i-th neighbor of v`, 20, height - 60);
    ctx.fillStyle = '#00ff99';
    ctx.fillText(`Space: O(log ${graph.nodes.length}) + O(log ${graph.degree})`, 20, height - 40);
    ctx.fillStyle = '#9b59b6';
    ctx.fillText(`     = O(log n) total`, 20, height - 20);
}

// Draw squared graph
function drawSquaredGraph(ctx, graph, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Squared Graph G₀²', centerX, 30);
    
    ctx.fillStyle = '#9b59b6';
    ctx.font = '15px Arial';
    ctx.fillText('Paths of length 2 become edges', centerX, 55);
    
    // Circular layout
    const positions = {};
    const radius = Math.min(width, height) * 0.35;
    
    graph.nodes.forEach((node, i) => {
        const angle = (2 * Math.PI * i) / graph.nodes.length - Math.PI / 2;
        positions[node.id] = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle) + 40
        };
    });
    
    // Draw edges
    ctx.lineWidth = 2;
    const drawnEdges = new Set();
    
    graph.edges.forEach(edge => {
        if (edge.isSelfLoop) return; // Skip self-loops for clarity
        
        const edgeKey = `${Math.min(edge.node1.id, edge.node2.id)}-${Math.max(edge.node1.id, edge.node2.id)}`;
        if (drawnEdges.has(edgeKey)) return;
        drawnEdges.add(edgeKey);
        
        const from = positions[edge.node1.id];
        const to = positions[edge.node2.id];
        
        ctx.strokeStyle = '#9b59b6';
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
    });
    
    // Draw nodes
    graph.nodes.forEach(node => {
        const pos = positions[node.id];
        
        ctx.fillStyle = '#8b5cf6';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#1a202c';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 13px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.id.toString(), pos.x, pos.y);
    });
    
    // Draw detailed info
    ctx.fillStyle = '#888';
    ctx.font = '13px Courier';
    ctx.textAlign = 'left';
    ctx.fillText('Rotation Map for G²:', 20, height - 80);
    ctx.fillText(`Rot_G²(v,i) = Rot_G(Rot_G(v,i₁),i₂)`, 20, height - 60);
    ctx.fillStyle = '#9b59b6';
    ctx.fillText(`where i = (i₁,i₂), i₁,i₂ ∈ [0,d-1]`, 20, height - 40);
    ctx.fillStyle = '#00ff99';
    ctx.fillText(`Space: O(log n) (no graph storage!)`, 20, height - 20);
}

// Draw zig-zag product graph
function drawZigzagGraph(ctx, graph, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Zig-Zag Product: (G₀²)⊗H', centerX, 30);
    
    ctx.fillStyle = '#f39c12';
    ctx.font = '15px Arial';
    ctx.fillText(`Vertex set: V(G) × V(H) = n × ${graph.nodes.length >= 16 ? 'B⁴' : 'B'}`, centerX, 55);
    
    // Circular layout showing product structure
    const positions = {};
    const radius = Math.min(width, height) * 0.35;
    
    graph.nodes.forEach((node, i) => {
        const angle = (2 * Math.PI * i) / graph.nodes.length - Math.PI / 2;
        positions[node.id] = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle) + 40
        };
    });
    
    // Draw edges
    ctx.lineWidth = 2;
    const drawnEdges = new Set();
    
    graph.edges.forEach(edge => {
        if (edge.isSelfLoop) return;
        
        const edgeKey = `${Math.min(edge.node1.id, edge.node2.id)}-${Math.max(edge.node1.id, edge.node2.id)}`;
        if (drawnEdges.has(edgeKey)) return;
        drawnEdges.add(edgeKey);
        
        const from = positions[edge.node1.id];
        const to = positions[edge.node2.id];
        
        ctx.strokeStyle = '#f39c12';
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
        ctx.globalAlpha = 1;
    });
    
    // Draw nodes
    graph.nodes.forEach(node => {
        const pos = positions[node.id];
        
        ctx.fillStyle = '#e67e22';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 12, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#1a202c';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.id.toString(), pos.x, pos.y);
    });
    
    // Draw detailed info
    ctx.fillStyle = '#888';
    ctx.font = '13px Courier';
    ctx.textAlign = 'left';
    ctx.fillText('Zig-Zag Rotation Map:', 20, height - 100);
    ctx.fillText(`Rot_{G⊗H}((v,h), i):`, 20, height - 80);
    ctx.fillStyle = '#f39c12';
    ctx.fillText(`  1. Take i-th neighbor in H: h' = Rot_H(h,i)`, 20, height - 60);
    ctx.fillText(`  2. Move to paired vertex: v' = Rot_G(v,h')`, 20, height - 40);
    ctx.fillStyle = '#00ff99';
    ctx.fillText(`Space: O(log n) + O(log B) = O(log n)`, 20, height - 20);
}

// Draw final graph
function drawFinalGraph(ctx, graph, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    ctx.fillStyle = '#00ff99';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Final Graph G_L', centerX, 30);
    
    ctx.fillStyle = '#34d399';
    ctx.font = '15px Arial';
    ctx.fillText(`Diameter: O(log n), Degree: constant`, centerX, 55);
    
    // Circular layout
    const positions = {};
    const radius = Math.min(width, height) * 0.35;
    
    graph.nodes.forEach((node, i) => {
        const angle = (2 * Math.PI * i) / graph.nodes.length - Math.PI / 2;
        positions[node.id] = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle) + 40
        };
    });
    
    // Draw edges
    ctx.lineWidth = 2;
    const drawnEdges = new Set();
    
    graph.edges.forEach(edge => {
        if (edge.isSelfLoop) return;
        
        const edgeKey = `${Math.min(edge.node1.id, edge.node2.id)}-${Math.max(edge.node1.id, edge.node2.id)}`;
        if (drawnEdges.has(edgeKey)) return;
        drawnEdges.add(edgeKey);
        
        const from = positions[edge.node1.id];
        const to = positions[edge.node2.id];
        
        ctx.strokeStyle = '#34d399';
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
        ctx.globalAlpha = 1;
    });
    
    // Draw nodes
    graph.nodes.forEach(node => {
        const pos = positions[node.id];
        
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 14, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#1a202c';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.id.toString(), pos.x, pos.y);
    });
    
    // Draw final algorithm status
    ctx.fillStyle = '#888';
    ctx.font = '14px Courier';
    ctx.textAlign = 'left';
    ctx.fillText('Ready for Connectivity Test:', 20, height - 100);
    ctx.fillStyle = '#34d399';
    ctx.fillText(`• Diameter reduced to O(log n)`, 20, height - 80);
    ctx.fillText(`• Degree kept constant at B`, 20, height - 60);
    ctx.fillText(`• DFS traversal uses O(log n) space`, 20, height - 40);
    ctx.fillStyle = '#00ff99';
    ctx.font = 'bold 14px Courier';
    ctx.fillText('✓ USTCON solved in L = O(log n) space!', 20, height - 20);
}

// Simple force-directed layout
function computeLayout(nodes, edges, width, height) {
    const positions = {};
    const margin = 80;
    
    // Initialize random positions
    nodes.forEach(node => {
        positions[node.id] = {
            x: margin + Math.random() * (width - 2 * margin),
            y: margin + Math.random() * (height - 2 * margin)
        };
    });
    
    // Simple spring layout (few iterations for performance)
    for (let iter = 0; iter < 50; iter++) {
        const forces = {};
        nodes.forEach(node => {
            forces[node.id] = { x: 0, y: 0 };
        });
        
        // Repulsion
        nodes.forEach((n1, i) => {
            nodes.forEach((n2, j) => {
                if (i >= j) return;
                const dx = positions[n2.id].x - positions[n1.id].x;
                const dy = positions[n2.id].y - positions[n1.id].y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const force = 500 / (dist * dist);
                
                forces[n1.id].x -= (dx / dist) * force;
                forces[n1.id].y -= (dy / dist) * force;
                forces[n2.id].x += (dx / dist) * force;
                forces[n2.id].y += (dy / dist) * force;
            });
        });
        
        // Attraction (edges)
        edges.forEach(edge => {
            if (edge.isSelfLoop) return;
            const dx = positions[edge.node2.id].x - positions[edge.node1.id].x;
            const dy = positions[edge.node2.id].y - positions[edge.node1.id].y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = dist * 0.01;
            
            forces[edge.node1.id].x += (dx / dist) * force;
            forces[edge.node1.id].y += (dy / dist) * force;
            forces[edge.node2.id].x -= (dx / dist) * force;
            forces[edge.node2.id].y -= (dy / dist) * force;
        });
        
        // Apply forces
        nodes.forEach(node => {
            positions[node.id].x += forces[node.id].x * 0.1;
            positions[node.id].y += forces[node.id].y * 0.1;
            
            // Keep in bounds
            positions[node.id].x = Math.max(margin, Math.min(width - margin, positions[node.id].x));
            positions[node.id].y = Math.max(margin, Math.min(height - margin, positions[node.id].y));
        });
    }
    
    return positions;
}

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
