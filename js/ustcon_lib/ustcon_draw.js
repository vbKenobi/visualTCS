// =========================================================
// USTCON Drawing Functions - Matching Figure 1.5 Style
// =========================================================

export function drawAlgorithmStep(ctx, step, dimensions) {
    const width = dimensions.width;
    const height = dimensions.height;
    
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, width, height);
    
    if (!step) {
        drawPlaceholder(ctx, width, height, 'Run algorithm to see visualization');
        return;
    }
    
    const type = step.type;
    
    if (type === 'demo-animation') {
        drawDemoAnimation(ctx, step, width, height);
    } else if (type === 'code-execution') {
        drawCodeExecution(ctx, step, width, height);
    } else {
        drawPlaceholder(ctx, width, height, 'Unknown stage type');
    }
}

// =========================================================
// DEMO ANIMATION - Zig-zag like Figure 1.5
// =========================================================

function drawDemoAnimation(ctx, frame, width, height) {
    const phase = frame.phase;
    
    // Title
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(frame.title || 'Zig-Zag Product', width / 2, 30);
    
    // Subtitle
    ctx.fillStyle = '#9ca3af';
    ctx.font = '14px Arial';
    ctx.fillText(frame.subtitle || '', width / 2, 52);
    
    // Progress bar
    drawProgressBar(ctx, frame.progress || 0, width, 65);
    
    // Main content area
    const contentTop = 85;
    const contentHeight = height - 100;
    
    // Route to appropriate drawing function
    if (phase === 'intro' || phase === 'select-vertex') {
        drawGandH(ctx, frame.G, frame.H, width, contentTop, contentHeight, frame.highlightVertex);
    } else if (phase === 'expand') {
        drawExpansion(ctx, frame, width, contentTop, contentHeight);
    } else if (phase === 'cloud-complete' || phase === 'two-clouds') {
        drawSquareClouds(ctx, frame, width, contentTop, contentHeight);
    } else if (phase.startsWith('zig') || phase === 'zag' || phase === 'zag-end' || phase === 'edge-complete') {
        drawZigZagWalk(ctx, frame, width, contentTop, contentHeight);
    } else if (phase === 'delete-highlight' || phase === 'delete-complete') {
        drawDeletion(ctx, frame, width, contentTop, contentHeight);
    } else if (phase === 'insight') {
        drawInsight(ctx, frame, width, contentTop, contentHeight);
    } else if (phase === 'summary') {
        drawSummary(ctx, frame, width, contentTop, contentHeight);
    }
}

function drawProgressBar(ctx, progress, width, y) {
    const barWidth = width - 40;
    const barHeight = 6;
    const x = 20;
    
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barHeight, 3);
    ctx.fill();
    
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth * progress, barHeight, 3);
    ctx.fill();
}

// =========================================================
// Draw G and H side by side
// =========================================================

function drawGandH(ctx, G, H, width, top, height, highlightVertex) {
    const gWidth = width * 0.4;
    const hWidth = width * 0.35;
    const graphHeight = height * 0.6;
    
    const gX = width * 0.08;
    const gY = top + 30;
    drawGraph(ctx, G, gX, gY, gWidth, graphHeight, 'Graph G (D-regular)', '#00bcd4', highlightVertex);
    
    const hX = width * 0.55;
    const hY = top + 30;
    drawGraph(ctx, H, hX, hY, hWidth, graphHeight, 'Expander H (B-regular)', '#10b981', -1);
    
    // Info text
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('D = ' + G.degree + ', |V| = ' + G.nodes.length, gX + gWidth/2, gY + graphHeight + 25);
    ctx.fillText('B = ' + H.degree + ', |H| = ' + H.nodes.length, hX + hWidth/2, gY + graphHeight + 25);
}

function drawGraph(ctx, graph, x, y, w, h, label, color, highlight) {
    // Label
    ctx.fillStyle = color;
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + w/2, y);
    
    const centerX = x + w/2;
    const centerY = y + h/2 + 10;
    const radius = Math.min(w, h) * 0.35;
    
    // Position nodes in a circle
    const positions = graph.nodes.map((node, i) => {
        const angle = (Math.PI * 2 * i) / graph.nodes.length - Math.PI/2;
        return {
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius
        };
    });
    
    // Draw edges
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 2;
    graph.edges.forEach(edge => {
        const p1 = positions[edge.node1.id];
        const p2 = positions[edge.node2.id];
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    });
    
    // Draw nodes
    positions.forEach((pos, i) => {
        const isHighlight = (i === highlight);
        
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, isHighlight ? 18 : 14, 0, Math.PI * 2);
        ctx.fillStyle = isHighlight ? '#f59e0b' : color;
        ctx.fill();
        
        if (isHighlight) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        ctx.fillStyle = '#fff';
        ctx.font = isHighlight ? 'bold 12px Arial' : '11px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(graph.nodes[i].label, pos.x, pos.y);
    });
}

// =========================================================
// Cloud expansion animation
// =========================================================

function drawExpansion(ctx, frame, width, top, height) {
    const progress = frame.expandProgress || 0;
    const centerX = width / 2;
    const centerY = top + height / 2;
    
    // Draw a single node expanding into a cloud
    const startRadius = 20;
    const cloudSize = 60 * progress;
    
    // Original vertex
    ctx.fillStyle = '#00bcd4';
    ctx.beginPath();
    ctx.arc(centerX, centerY, startRadius * (1 - progress * 0.5), 0, Math.PI * 2);
    ctx.fill();
    
    if (progress > 0.2) {
        // Show expanding positions
        const positions = getSquarePositions(centerX, centerY, cloudSize, 4);
        const alpha = Math.min(1, (progress - 0.2) * 1.5);
        
        ctx.globalAlpha = alpha;
        positions.forEach((pos, i) => {
            ctx.fillStyle = '#00bcd4';
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#fff';
            ctx.font = '9px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(i.toString(), pos.x, pos.y);
        });
        
        // Draw edges between positions (H structure)
        ctx.strokeStyle = '#00bcd4';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(positions[i].x, positions[i].y);
            ctx.lineTo(positions[(i + 1) % 4].x, positions[(i + 1) % 4].y);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }
    
    // Label
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Vertex v → Cloud of |H| copies', centerX, top + height - 30);
}

// =========================================================
// Square clouds (like Figure 1.5)
// =========================================================

function getSquarePositions(centerX, centerY, size, count) {
    // 2x2 square arrangement for 4 vertices
    const positions = [];
    const half = size / 2;
    
    // Top-left (a), Top-right (b), Bottom-right (c), Bottom-left (d)
    positions.push({ x: centerX - half, y: centerY - half, label: 'a' }); // 0 = a
    positions.push({ x: centerX + half, y: centerY - half, label: 'b' }); // 1 = b
    positions.push({ x: centerX + half, y: centerY + half, label: 'c' }); // 2 = c
    positions.push({ x: centerX - half, y: centerY + half, label: 'd' }); // 3 = d
    
    return positions;
}

function drawSquareClouds(ctx, frame, width, top, height) {
    const centerY = top + height / 2;
    const cloudSize = 70;
    
    // Cloud positions
    const cloud0X = width * 0.3;
    const cloud1X = width * 0.7;
    
    // Draw v-cloud
    if (frame.cloud0) {
        drawSquareCloud(ctx, cloud0X, centerY, cloudSize, 'v', '#00bcd4');
    }
    
    // Draw u-cloud
    if (frame.cloud1) {
        drawSquareCloud(ctx, cloud1X, centerY, cloudSize, 'u', '#00bcd4');
    }
    
    // Legend
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Each vertex in G becomes a cloud of |H| = 4 vertices', width / 2, top + height - 20);
}

function drawSquareCloud(ctx, centerX, centerY, size, vertexName, color) {
    const positions = getSquarePositions(centerX, centerY, size, 4);
    const labels = ['a', 'b', 'c', 'd'];
    
    // Draw edges (cycle: a-b-c-d-a)
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(positions[i].x, positions[i].y);
        ctx.lineTo(positions[(i + 1) % 4].x, positions[(i + 1) % 4].y);
        ctx.stroke();
    }
    
    // Draw vertices
    positions.forEach((pos, i) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Label inside
        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labels[i], pos.x, pos.y);
    });
    
    // Cloud label above
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('(' + vertexName + ', *)', centerX, centerY - size/2 - 25);
}

// =========================================================
// Zig-Zag Walk (matching Figure 1.5)
// =========================================================

function drawZigZagWalk(ctx, frame, width, top, height) {
    const centerY = top + height / 2;
    const cloudSize = 70;
    
    const cloud0X = width * 0.3;
    const cloud1X = width * 0.7;
    
    // Get positions for both clouds
    const pos0 = getSquarePositions(cloud0X, centerY, cloudSize, 4);
    const pos1 = getSquarePositions(cloud1X, centerY, cloudSize, 4);
    const labels = ['a', 'b', 'c', 'd'];
    
    // Draw both clouds (faded)
    drawCloudWithLabels(ctx, pos0, labels, 'v', '#00bcd4', 0.4);
    drawCloudWithLabels(ctx, pos1, labels, 'u', '#00bcd4', 0.4);
    
    const phase = frame.walkPhase || frame.phase;
    
    // ZIG1: from (v,a) to (v,b) - step k1 in H
    if (phase === 'zig1' || phase === 'zig1-start') {
        // Highlight start position
        highlightVertex(ctx, pos0[0], '(v,a)', '#f59e0b');
        
        // Arrow from a to b
        drawArrowWithLabel(ctx, pos0[0], pos0[1], 'k₁', '#00bcd4');
    }
    
    // ZIG1 done
    if (phase === 'zig1-done' || phase === 'zig1-end') {
        highlightVertex(ctx, pos0[0], '(v,a)', '#f59e0b');
        highlightVertex(ctx, pos0[1], '(v,b)', '#00bcd4');
        drawArrowWithLabel(ctx, pos0[0], pos0[1], 'k₁', '#00bcd4');
    }
    
    // ZAG: from (v,b) to (u,b) - cross using edge in G
    if (phase === 'zag') {
        highlightVertex(ctx, pos0[0], '(v,a)', '#f59e0b');
        highlightVertex(ctx, pos0[1], '(v,b)', '#00bcd4');
        drawArrowWithLabel(ctx, pos0[0], pos0[1], 'k₁', '#00bcd4');
        
        // Curved arrow from v-cloud to u-cloud
        drawCurvedArrow(ctx, pos0[1], pos1[1], '#10b981');
    }
    
    // ZAG done
    if (phase === 'zag-done' || phase === 'zag-end') {
        highlightVertex(ctx, pos0[0], '(v,a)', '#f59e0b');
        highlightVertex(ctx, pos0[1], '(v,b)', '#00bcd4');
        highlightVertex(ctx, pos1[1], '(u,b)', '#10b981');
        drawArrowWithLabel(ctx, pos0[0], pos0[1], 'k₁', '#00bcd4');
        drawCurvedArrow(ctx, pos0[1], pos1[1], '#10b981');
    }
    
    // ZIG2: from (u,b) to (u,c) - step k2 in H
    if (phase === 'zig2') {
        highlightVertex(ctx, pos0[0], '(v,a)', '#f59e0b');
        highlightVertex(ctx, pos0[1], '(v,b)', '#00bcd4');
        highlightVertex(ctx, pos1[1], '(u,b)', '#10b981');
        drawArrowWithLabel(ctx, pos0[0], pos0[1], 'k₁', '#00bcd4');
        drawCurvedArrow(ctx, pos0[1], pos1[1], '#10b981');
        
        // Arrow from b to c in u-cloud
        drawArrowWithLabel(ctx, pos1[1], pos1[2], 'k₂', '#00bcd4');
    }
    
    // Complete - show final edge
    if (phase === 'complete' || phase === 'edge-complete') {
        // All intermediate steps
        highlightVertex(ctx, pos0[0], '(v,a)', '#f59e0b');
        highlightVertex(ctx, pos0[1], '(v,b)', '#00bcd4');
        highlightVertex(ctx, pos1[1], '(u,b)', '#10b981');
        highlightVertex(ctx, pos1[2], '(u,c)', '#e91e63');
        
        drawArrowWithLabel(ctx, pos0[0], pos0[1], 'k₁', '#00bcd4');
        drawCurvedArrow(ctx, pos0[1], pos1[1], '#10b981');
        drawArrowWithLabel(ctx, pos1[1], pos1[2], 'k₂', '#00bcd4');
        
        // Final edge in magenta/pink
        drawFinalEdge(ctx, pos0[0], pos1[2], '#e91e63');
    }
}

function drawCloudWithLabels(ctx, positions, labels, vertexName, color, alpha) {
    ctx.globalAlpha = alpha;
    
    // Draw edges
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(positions[i].x, positions[i].y);
        ctx.lineTo(positions[(i + 1) % 4].x, positions[(i + 1) % 4].y);
        ctx.stroke();
    }
    
    // Draw vertices
    positions.forEach((pos, i) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 12, 0, Math.PI * 2);
        ctx.fill();
    });
    
    ctx.globalAlpha = 1;
    
    // Labels outside (like Figure 1.5)
    ctx.fillStyle = '#9ca3af';
    ctx.font = '11px Arial';
    const offsets = [
        { dx: -20, dy: -18 },  // a: top-left
        { dx: 20, dy: -18 },   // b: top-right
        { dx: 20, dy: 22 },    // c: bottom-right
        { dx: -20, dy: 22 }    // d: bottom-left
    ];
    
    positions.forEach((pos, i) => {
        const label = '(' + vertexName + ',' + labels[i] + ')';
        ctx.textAlign = offsets[i].dx < 0 ? 'right' : 'left';
        ctx.fillText(label, pos.x + offsets[i].dx, pos.y + offsets[i].dy);
    });
}

function highlightVertex(ctx, pos, label, color) {
    // Larger circle
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 14, 0, Math.PI * 2);
    ctx.fill();
    
    // White border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawArrowWithLabel(ctx, from, to, label, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    
    // Line
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    
    // Arrowhead
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const headLen = 10;
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(to.x - headLen * Math.cos(angle - 0.4), to.y - headLen * Math.sin(angle - 0.4));
    ctx.lineTo(to.x - headLen * Math.cos(angle + 0.4), to.y - headLen * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fill();
    
    // Label
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    ctx.fillStyle = color;
    ctx.font = 'italic 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(label, midX + 12, midY - 8);
}

function drawCurvedArrow(ctx, from, to, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    
    // Control point for curve (below the line)
    const midX = (from.x + to.x) / 2;
    const midY = Math.max(from.y, to.y) + 60;
    
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.quadraticCurveTo(midX, midY, to.x, to.y);
    ctx.stroke();
    
    // Arrowhead
    const t = 0.95;
    const prevX = (1-t)*(1-t)*from.x + 2*(1-t)*t*midX + t*t*to.x;
    const prevY = (1-t)*(1-t)*from.y + 2*(1-t)*t*midY + t*t*to.y;
    const angle = Math.atan2(to.y - prevY, to.x - prevX);
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(to.x - 10 * Math.cos(angle - 0.4), to.y - 10 * Math.sin(angle - 0.4));
    ctx.lineTo(to.x - 10 * Math.cos(angle + 0.4), to.y - 10 * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fill();
}

function drawFinalEdge(ctx, from, to, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    
    // Control point for curve (above the clouds)
    const midX = (from.x + to.x) / 2;
    const midY = Math.min(from.y, to.y) - 80;
    
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.quadraticCurveTo(midX, midY, to.x, to.y);
    ctx.stroke();
    
    // Arrowhead
    const t = 0.95;
    const prevX = (1-t)*(1-t)*from.x + 2*(1-t)*t*midX + t*t*to.x;
    const prevY = (1-t)*(1-t)*from.y + 2*(1-t)*t*midY + t*t*to.y;
    const angle = Math.atan2(to.y - prevY, to.x - prevX);
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(to.x - 12 * Math.cos(angle - 0.4), to.y - 12 * Math.sin(angle - 0.4));
    ctx.lineTo(to.x - 12 * Math.cos(angle + 0.4), to.y - 12 * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fill();
}

// =========================================================
// Deletion visualization
// =========================================================

function drawDeletion(ctx, frame, width, top, height) {
    const centerY = top + height / 2;
    const cloudSize = 70;
    
    const cloud0X = width * 0.3;
    const cloud1X = width * 0.7;
    
    const pos0 = getSquarePositions(cloud0X, centerY, cloudSize, 4);
    const pos1 = getSquarePositions(cloud1X, centerY, cloudSize, 4);
    const labels = ['a', 'b', 'c', 'd'];
    
    // Draw clouds faded
    drawCloudWithLabels(ctx, pos0, labels, 'v', '#00bcd4', 0.3);
    drawCloudWithLabels(ctx, pos1, labels, 'u', '#00bcd4', 0.3);
    
    if (frame.showDeletedEdges) {
        // Show edges being deleted with X marks
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        
        // ZIG1 edge
        ctx.beginPath();
        ctx.moveTo(pos0[0].x, pos0[0].y);
        ctx.lineTo(pos0[1].x, pos0[1].y);
        ctx.stroke();
        drawX(ctx, (pos0[0].x + pos0[1].x) / 2, (pos0[0].y + pos0[1].y) / 2);
        
        // ZAG edge (curved)
        const midX = (pos0[1].x + pos1[1].x) / 2;
        const midY = Math.max(pos0[1].y, pos1[1].y) + 40;
        ctx.beginPath();
        ctx.moveTo(pos0[1].x, pos0[1].y);
        ctx.quadraticCurveTo(midX, midY, pos1[1].x, pos1[1].y);
        ctx.stroke();
        drawX(ctx, midX, midY - 20);
        
        // ZIG2 edge
        ctx.beginPath();
        ctx.moveTo(pos1[1].x, pos1[1].y);
        ctx.lineTo(pos1[2].x, pos1[2].y);
        ctx.stroke();
        drawX(ctx, (pos1[1].x + pos1[2].x) / 2, (pos1[1].y + pos1[2].y) / 2);
        
        ctx.setLineDash([]);
        
        // Final edge stays (in magenta)
        drawFinalEdge(ctx, pos0[0], pos1[2], '#e91e63');
        
        // Highlight endpoints
        highlightVertex(ctx, pos0[0], '', '#f59e0b');
        highlightVertex(ctx, pos1[2], '', '#e91e63');
        
        // Legend
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ef4444';
        ctx.fillText('--- Edges deleted', 20, top + height - 30);
        ctx.fillStyle = '#e91e63';
        ctx.fillText('─── New edge in G ⊛ H', 180, top + height - 30);
        
    } else if (frame.showFinalEdgeOnly) {
        // After deletion - only show final edge
        highlightVertex(ctx, pos0[0], '', '#f59e0b');
        highlightVertex(ctx, pos1[2], '', '#e91e63');
        drawFinalEdge(ctx, pos0[0], pos1[2], '#e91e63');
        
        // Labels
        ctx.fillStyle = '#f59e0b';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('(v,a)', pos0[0].x, pos0[0].y - 25);
        
        ctx.fillStyle = '#e91e63';
        ctx.fillText('(u,c)', pos1[2].x, pos1[2].y + 30);
        
        // Result text
        ctx.fillStyle = '#9ca3af';
        ctx.font = '14px Arial';
        ctx.fillText('Result: Edge (v,a) → (u,c) in G ⊛ H', width / 2, top + height - 25);
    }
}

function drawX(ctx, x, y) {
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(x - 8, y - 8);
    ctx.lineTo(x + 8, y + 8);
    ctx.moveTo(x + 8, y - 8);
    ctx.lineTo(x - 8, y + 8);
    ctx.stroke();
}

// =========================================================
// Insight and Summary
// =========================================================

function drawInsight(ctx, frame, width, top, height) {
    const centerX = width / 2;
    const centerY = top + height / 2;
    
    // Box
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(centerX - 200, centerY - 80, 400, 160, 10);
    ctx.fill();
    
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Title
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Key Insight', centerX, centerY - 50);
    
    // Points
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText('• Degree: D² → B² (reduced!)', centerX, centerY - 15);
    ctx.fillText('• Vertices: n → n × |H| (more vertices)', centerX, centerY + 10);
    ctx.fillText('• But we never store the graph!', centerX, centerY + 35);
    
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('Space: O(log n) bits', centerX, centerY + 65);
}

function drawSummary(ctx, frame, width, top, height) {
    const centerX = width / 2;
    
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('✓ Zig-Zag Product Complete', centerX, top + 60);
    
    // Summary boxes
    const boxY = top + 100;
    const boxWidth = 180;
    const boxHeight = 100;
    
    // Box 1: Degree
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(centerX - 200, boxY, boxWidth, boxHeight, 8);
    ctx.fill();
    ctx.fillStyle = '#00bcd4';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('Degree', centerX - 110, boxY + 25);
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.fillText('D² → B²', centerX - 110, boxY + 50);
    ctx.fillText('(Reduced)', centerX - 110, boxY + 70);
    
    // Box 2: Space
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(centerX + 20, boxY, boxWidth, boxHeight, 8);
    ctx.fill();
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('Space', centerX + 110, boxY + 25);
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.fillText('O(log n) bits', centerX + 110, boxY + 50);
    ctx.fillText('for position', centerX + 110, boxY + 70);
    
    // Bottom text
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Arial';
    ctx.fillText('Position stored as (vertex, h) pair', centerX, top + height - 40);
}

// =========================================================
// CODE EXECUTION VIEW
// =========================================================

function drawCodeExecution(ctx, frame, width, height) {
    // Title - show result color if conclusion
    if (frame.conclusion) {
        ctx.fillStyle = frame.result ? '#10b981' : '#ef4444';
    } else {
        ctx.fillStyle = '#f59e0b';
    }
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(frame.name || 'Algorithm Execution', width / 2, 30);
    
    const codeX = 30;
    const codeY = 60;
    const codeWidth = width * 0.48;
    const statsX = width * 0.52;
    
    // Code box
    ctx.fillStyle = '#161b22';
    ctx.beginPath();
    ctx.roundRect(codeX, codeY, codeWidth, height * 0.45, 8);
    ctx.fill();
    
    // Code lines
    if (frame.code) {
        ctx.font = '12px "Fira Code", Monaco, monospace';
        frame.code.forEach((line, i) => {
            const y = codeY + 22 + i * 20;
            
            if (i === frame.highlightLine) {
                ctx.fillStyle = 'rgba(245, 158, 11, 0.3)';
                ctx.fillRect(codeX + 2, y - 14, codeWidth - 4, 20);
                ctx.fillStyle = '#fbbf24';
            } else {
                ctx.fillStyle = '#9ca3af';
            }
            
            ctx.textAlign = 'left';
            ctx.fillText(line, codeX + 12, y);
        });
    }
    
    // Stats panel
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(statsX, codeY, width - statsX - 20, height * 0.45, 8);
    ctx.fill();
    
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Statistics', statsX + 12, codeY + 22);
    
    if (frame.stats) {
        let y = codeY + 48;
        ctx.font = '11px Arial';
        
        Object.entries(frame.stats).forEach(([key, value]) => {
            const strValue = String(value);
            ctx.fillStyle = '#6b7280';
            ctx.fillText(key + ':', statsX + 12, y);
            
            if (strValue.includes('CONNECTED')) {
                ctx.fillStyle = strValue.includes('NOT') ? '#ef4444' : '#10b981';
                ctx.font = 'bold 11px Arial';
            } else {
                ctx.fillStyle = '#fff';
            }
            ctx.fillText(strValue, statsX + 95, y);
            ctx.font = '11px Arial';
            y += 20;
        });
    }
    
    // Memory Registers Panel
    const memY = codeY + height * 0.48;
    const memHeight = height * 0.35;
    
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(codeX, memY, width - 50, memHeight, 8);
    ctx.fill();
    
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('💾 Memory Registers (O(log N) bits)', codeX + 15, memY + 22);
    
    // Draw register boxes
    const registers = [
        { name: 'v', desc: 'Current vertex', bits: 'log(N²)', color: '#00bcd4' },
        { name: 'h', desc: 'H position', bits: 'log(256)', color: '#10b981' },
        { name: 'level', desc: 'Recursion', bits: 'log(L)', color: '#f59e0b' },
        { name: 'edge', desc: 'Edge type', bits: '2', color: '#e91e63' },
        { name: 'step', desc: 'Path step', bits: 'log(N²)', color: '#8b5cf6' }
    ];
    
    const regWidth = (width - 80) / registers.length;
    registers.forEach((reg, i) => {
        const rx = codeX + 15 + i * regWidth;
        const ry = memY + 40;
        const rw = regWidth - 10;
        const rh = memHeight - 60;
        
        // Register box
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(rx, ry, rw, rh, 6);
        ctx.fill();
        
        ctx.strokeStyle = reg.color;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Register name
        ctx.fillStyle = reg.color;
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(reg.name, rx + rw/2, ry + 18);
        
        // Bits indicator
        ctx.fillStyle = '#6b7280';
        ctx.font = '10px Arial';
        ctx.fillText(reg.bits + ' bits', rx + rw/2, ry + 35);
        
        // Value placeholder (animated bar)
        const barHeight = (rh - 55) * 0.7;
        ctx.fillStyle = reg.color + '40';
        ctx.fillRect(rx + 8, ry + 45, rw - 16, barHeight);
        
        ctx.fillStyle = reg.color;
        const fillHeight = barHeight * (0.3 + Math.random() * 0.5);
        ctx.fillRect(rx + 8, ry + 45 + barHeight - fillHeight, rw - 16, fillHeight);
        
        // Description
        ctx.fillStyle = '#9ca3af';
        ctx.font = '9px Arial';
        ctx.fillText(reg.desc, rx + rw/2, ry + rh - 8);
    });
    
    // Total bits
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('Total: O(log N) bits', width - 35, memY + 22);
    
    // Space note if present
    if (frame.spaceNote) {
        ctx.fillStyle = '#10b981';
        ctx.font = 'italic 11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(frame.spaceNote, width / 2, height - 15);
    }
    
    // Conclusion - show big result
    if (frame.conclusion) {
        const resultText = frame.result ? '✓ s and t are CONNECTED' : '✗ s and t are NOT CONNECTED';
        ctx.fillStyle = frame.result ? '#10b981' : '#ef4444';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(resultText, width / 2, height - 15);
    }
}

// =========================================================
// Helper
// =========================================================

function drawPlaceholder(ctx, width, height, message) {
    ctx.fillStyle = '#6b7280';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(message, width / 2, height / 2);
}

// =========================================================
// Canvas resize helper
// =========================================================

export function resizeCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    const ctx = canvas.getContext("2d");
    ctx.scale(2, 2);
}