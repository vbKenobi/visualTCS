// NOF & Behrend Drawing Functions

// Color palette
const COLORS = {
    background: '#0d1117',
    text: '#c9d1d9',
    textMuted: '#8b949e',
    accent: '#f59e0b',
    alice: '#f87171',
    bob: '#4ade80',
    charlie: '#60a5fa',
    circle: '#00bcd4',
    sphere: '#a78bfa',
    point: '#10b981',
    midpoint: '#ef4444',
    grid: '#30363d',
    shell: '#fbbf24'
};

export function resizeCanvas(canvas) {
    const container = canvas.parentElement;
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    
    return { width: rect.width, height: rect.height };
}

// Draw Behrend construction visualization
export function drawBehrend(ctx, phase, data, dimensions) {
    const { width, height } = dimensions;
    
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, width, height);
    
    // Title
    ctx.fillStyle = COLORS.accent;
    ctx.font = 'bold 18px Inter, Arial';
    ctx.textAlign = 'center';
    ctx.fillText(phase.title, width / 2, 30);
    
    // Description
    ctx.fillStyle = COLORS.textMuted;
    ctx.font = '14px Inter, Arial';
    ctx.fillText(phase.description, width / 2, 55);
    
    const centerX = width / 2;
    const centerY = height / 2 + 20;
    const radius = Math.min(width, height) * 0.3;
    
    switch (phase.name) {
        case 'circle':
            drawCirclePhase(ctx, centerX, centerY, radius);
            break;
        case 'midpoint':
            drawMidpointPhase(ctx, centerX, centerY, radius, data);
            break;
        case 'sphere':
            drawSpherePhase(ctx, centerX, centerY, radius);
            break;
        case 'lattice':
            drawLatticePhase(ctx, centerX, centerY, radius, data);
            break;
        case 'shell':
            drawShellPhase(ctx, centerX, centerY, radius, data);
            break;
        case 'mapping':
            drawMappingPhase(ctx, width, height, data);
            break;
        case 'result':
            drawResultPhase(ctx, width, height, data);
            break;
    }
}

function drawCirclePhase(ctx, cx, cy, r) {
    // Draw unit circle
    ctx.strokeStyle = COLORS.circle;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw some points on the circle
    const numPoints = 8;
    ctx.fillStyle = COLORS.point;
    for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Label
    ctx.fillStyle = COLORS.text;
    ctx.font = '14px Inter, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('S¹ = {(x,y) : x² + y² = 1}', cx, cy + r + 40);
}

function drawMidpointPhase(ctx, cx, cy, r, data) {
    // Draw unit circle
    ctx.strokeStyle = COLORS.circle;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    
    // Two points on circle
    const angle1 = -Math.PI / 4;
    const angle2 = Math.PI / 2;
    
    const ax = cx + r * Math.cos(angle1);
    const ay = cy + r * Math.sin(angle1);
    const bx = cx + r * Math.cos(angle2);
    const by = cy + r * Math.sin(angle2);
    
    // Midpoint
    const mx = (ax + bx) / 2;
    const my = (ay + by) / 2;
    
    // Draw line from a to b
    ctx.strokeStyle = COLORS.textMuted;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw points
    ctx.fillStyle = COLORS.point;
    ctx.beginPath();
    ctx.arc(ax, ay, 10, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(bx, by, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw midpoint (inside circle)
    ctx.fillStyle = COLORS.midpoint;
    ctx.beginPath();
    ctx.arc(mx, my, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Labels
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 14px Inter, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('a', ax + 15, ay - 10);
    ctx.fillText('b', bx + 15, by - 10);
    ctx.fillText('(a+b)/2', mx, my - 15);
    
    // Explanation
    ctx.fillStyle = COLORS.textMuted;
    ctx.font = '13px Inter, Arial';
    ctx.fillText('Midpoint lies INSIDE the circle!', cx, cy + r + 35);
    ctx.fillText('∴ No 3-term AP on the circle', cx, cy + r + 55);
}

function drawSpherePhase(ctx, cx, cy, r) {
    // Draw a 3D-looking sphere
    const gradient = ctx.createRadialGradient(cx - r/3, cy - r/3, 0, cx, cy, r);
    gradient.addColorStop(0, '#a78bfa');
    gradient.addColorStop(0.7, '#6d28d9');
    gradient.addColorStop(1, '#4c1d95');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw equator
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r * 0.3, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw meridian
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 0.3, r, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // Formula
    ctx.fillStyle = COLORS.text;
    ctx.font = '14px Inter, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Sᵈ⁻¹ = {x ∈ ℝᵈ : Σxᵢ² = 1}', cx, cy + r + 35);
    ctx.fillText('No x, y, z with x + y = 2z', cx, cy + r + 55);
}

function drawLatticePhase(ctx, cx, cy, r, data) {
    const k = data?.k || 5;
    const gridSize = r * 1.5;
    const cellSize = gridSize / k;
    const startX = cx - gridSize / 2;
    const startY = cy - gridSize / 2;
    
    // Draw grid
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= k; i++) {
        ctx.beginPath();
        ctx.moveTo(startX + i * cellSize, startY);
        ctx.lineTo(startX + i * cellSize, startY + gridSize);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(startX, startY + i * cellSize);
        ctx.lineTo(startX + gridSize, startY + i * cellSize);
        ctx.stroke();
    }
    
    // Draw lattice points
    ctx.fillStyle = COLORS.point;
    for (let i = 1; i <= k; i++) {
        for (let j = 1; j <= k; j++) {
            const x = startX + (i - 0.5) * cellSize;
            const y = startY + (j - 0.5) * cellSize;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Label
    ctx.fillStyle = COLORS.text;
    ctx.font = '14px Inter, Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`[k]ᵈ = [${k}]² has ${k * k} points`, cx, cy + r + 50);
}

function drawShellPhase(ctx, cx, cy, r, data) {
    const k = data?.k || 5;
    const shellR = data?.bestR || 10;
    
    // Draw circle representing shell
    ctx.strokeStyle = COLORS.shell;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.8, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw points on shell
    const points = data?.shellPoints || [];
    const displayPoints = points.length > 0 ? points : generateFakeShellPoints(8);
    
    ctx.fillStyle = COLORS.shell;
    for (const p of displayPoints) {
        const angle = (p.angle || Math.random()) * Math.PI * 2;
        const x = cx + r * 0.8 * Math.cos(angle);
        const y = cy + r * 0.8 * Math.sin(angle);
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Label
    ctx.fillStyle = COLORS.text;
    ctx.font = '14px Inter, Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Sᴿ = {x ∈ [k]ᵈ : Σxᵢ² = R}`, cx, cy + r + 35);
    ctx.fillText(`|Sᴿ| ≥ kᵈ / (k²·d) by pigeonhole`, cx, cy + r + 55);
}

function generateFakeShellPoints(n) {
    const points = [];
    for (let i = 0; i < n; i++) {
        points.push({ angle: i / n });
    }
    return points;
}

function drawMappingPhase(ctx, width, height, data) {
    const cx = width / 2;
    const cy = height / 2;
    
    // Draw arrows showing mapping
    const leftX = width * 0.25;
    const rightX = width * 0.75;
    
    // Left side: point in [k]^d
    ctx.fillStyle = COLORS.sphere;
    ctx.font = 'bold 16px Inter, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Point x ∈ [k]ᵈ', leftX, cy - 60);
    
    ctx.fillStyle = COLORS.text;
    ctx.font = '14px Inter, Arial';
    ctx.fillText('x = (x₁, x₂, ..., xₐ)', leftX, cy - 30);
    
    // Draw a sample point
    ctx.fillStyle = COLORS.point;
    ctx.beginPath();
    ctx.arc(leftX, cy + 20, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.text;
    ctx.fillText('(2, 3, 1)', leftX, cy + 60);
    
    // Arrow
    ctx.strokeStyle = COLORS.accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(leftX + 60, cy + 20);
    ctx.lineTo(rightX - 60, cy + 20);
    ctx.stroke();
    
    // Arrowhead
    ctx.fillStyle = COLORS.accent;
    ctx.beginPath();
    ctx.moveTo(rightX - 60, cy + 20);
    ctx.lineTo(rightX - 75, cy + 10);
    ctx.lineTo(rightX - 75, cy + 30);
    ctx.closePath();
    ctx.fill();
    
    // Formula above arrow
    ctx.fillStyle = COLORS.accent;
    ctx.font = '13px Inter, Arial';
    ctx.fillText('f(x) = Σ xᵢ·(2k+1)ⁱ⁻¹', cx, cy - 5);
    
    // Right side: integer
    ctx.fillStyle = COLORS.shell;
    ctx.font = 'bold 16px Inter, Arial';
    ctx.fillText('Integer f(x) ∈ [N]', rightX, cy - 60);
    
    ctx.fillStyle = COLORS.text;
    ctx.font = '14px Inter, Arial';
    ctx.fillText('N ≤ (2k+1)ᵈ', rightX, cy - 30);
    
    // Draw integer representation
    ctx.fillStyle = COLORS.shell;
    ctx.beginPath();
    ctx.roundRect(rightX - 30, cy + 5, 60, 30, 5);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.font = 'bold 14px Inter, Arial';
    ctx.fillText('146', rightX, cy + 25);
    
    // Key property
    ctx.fillStyle = COLORS.textMuted;
    ctx.font = '13px Inter, Arial';
    ctx.fillText('Key: f(x) + f(y) = 2f(z) ⟺ x + y = 2z', cx, cy + 100);
}

function drawResultPhase(ctx, width, height, data) {
    const cx = width / 2;
    const cy = height / 2;
    
    // Big result box
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.roundRect(cx - 150, cy - 80, 300, 160, 10);
    ctx.fill();
    ctx.strokeStyle = COLORS.accent;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Result text
    ctx.fillStyle = COLORS.accent;
    ctx.font = 'bold 20px Inter, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Behrend\'s Result', cx, cy - 45);
    
    ctx.fillStyle = COLORS.text;
    ctx.font = '16px Inter, Arial';
    ctx.fillText('3-AP free set S ⊆ [N]', cx, cy - 10);
    
    ctx.fillStyle = COLORS.shell;
    ctx.font = 'bold 22px Inter, Arial';
    ctx.fillText('|S| ≥ N / 2^(c√log N)', cx, cy + 30);
    
    ctx.fillStyle = COLORS.textMuted;
    ctx.font = '14px Inter, Arial';
    ctx.fillText('for some constant c', cx, cy + 60);
    
    // Complexity note
    ctx.fillStyle = COLORS.textMuted;
    ctx.font = '13px Inter, Arial';
    ctx.fillText('This gives O(√log N) colors for NOF protocol!', cx, cy + 110);
}

// Draw NOF Protocol visualization
export function drawNOF(ctx, stage, dimensions) {
    const { width, height } = dimensions;
    
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, width, height);
    
    if (!stage) {
        drawNOFPlaceholder(ctx, width, height);
        return;
    }
    
    // Title
    ctx.fillStyle = COLORS.accent;
    ctx.font = 'bold 18px Inter, Arial';
    ctx.textAlign = 'center';
    ctx.fillText(stage.name, width / 2, 30);
    
    // Description
    ctx.fillStyle = COLORS.textMuted;
    ctx.font = '14px Inter, Arial';
    ctx.fillText(stage.description, width / 2, 55);
    
    switch (stage.type) {
        case 'setup':
            drawSetupStage(ctx, stage.data, width, height);
            break;
        case 'visibility':
            drawVisibilityStage(ctx, stage.data, width, height);
            break;
        case 'coloring':
            drawColoringStage(ctx, stage.data, width, height);
            break;
        case 'alice-compute':
        case 'bob-compute':
        case 'charlie-compute':
            drawComputeStage(ctx, stage, width, height);
            break;
        case 'compare':
            drawCompareStage(ctx, stage.data, width, height);
            break;
        case 'result':
            drawResultStage(ctx, stage.data, width, height);
            break;
    }
}

function drawNOFPlaceholder(ctx, width, height) {
    ctx.fillStyle = COLORS.textMuted;
    ctx.font = '16px Inter, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Click "Run Protocol" to see the NOF visualization', width / 2, height / 2);
}

function drawSetupStage(ctx, data, width, height) {
    const cy = height / 2;
    
    // Draw the three parties
    drawParty(ctx, width * 0.2, cy - 30, 'Alice', data.x, COLORS.alice);
    drawParty(ctx, width * 0.5, cy - 30, 'Bob', data.y, COLORS.bob);
    drawParty(ctx, width * 0.8, cy - 30, 'Charlie', data.z, COLORS.charlie);
    
    // Sum display
    ctx.fillStyle = COLORS.text;
    ctx.font = '16px Inter, Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`x + y + z = ${data.x} + ${data.y} + ${data.z} = ${data.sum}`, width / 2, cy + 80);
    ctx.fillText(`Target N = ${data.N}`, width / 2, cy + 105);
    
    const isChecksum = data.sum === data.N;
    ctx.fillStyle = isChecksum ? COLORS.bob : COLORS.alice;
    ctx.font = 'bold 16px Inter, Arial';
    ctx.fillText(isChecksum ? '✓ Checksum satisfied!' : '✗ Checksum NOT satisfied', width / 2, cy + 135);
}

function drawParty(ctx, x, y, name, value, color) {
    // Circle for party
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 35, 0, Math.PI * 2);
    ctx.fill();
    
    // Name
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Inter, Arial';
    ctx.textAlign = 'center';
    ctx.fillText(name, x, y + 5);
    
    // Value below
    ctx.fillStyle = COLORS.text;
    ctx.font = '16px Inter, Arial';
    ctx.fillText(value, x, y + 55);
}

function drawVisibilityStage(ctx, data, width, height) {
    const cy = height / 2 - 20;
    const partyY = cy - 50;
    
    // Draw parties
    drawPartySmall(ctx, width * 0.2, partyY, 'Alice', COLORS.alice);
    drawPartySmall(ctx, width * 0.5, partyY, 'Bob', COLORS.bob);
    drawPartySmall(ctx, width * 0.8, partyY, 'Charlie', COLORS.charlie);
    
    // What each sees
    const seeY = cy + 40;
    
    ctx.fillStyle = COLORS.text;
    ctx.font = '13px Inter, Arial';
    ctx.textAlign = 'center';
    
    ctx.fillText(`Sees: y=${data.aliceSees.y}, z=${data.aliceSees.z}`, width * 0.2, seeY);
    ctx.fillText(`Sees: x=${data.bobSees.x}, z=${data.bobSees.z}`, width * 0.5, seeY);
    ctx.fillText(`Sees: x=${data.charlieSees.x}, y=${data.charlieSees.y}`, width * 0.8, seeY);
    
    // Visual: arrows showing what's visible
    ctx.strokeStyle = COLORS.textMuted;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    
    // Alice sees Bob and Charlie
    drawVisibilityArrow(ctx, width * 0.2, partyY + 25, width * 0.5, partyY + 25);
    drawVisibilityArrow(ctx, width * 0.2, partyY + 25, width * 0.8, partyY + 25);
    
    ctx.setLineDash([]);
    
    // Note
    ctx.fillStyle = COLORS.textMuted;
    ctx.font = '12px Inter, Arial';
    ctx.fillText('Each party cannot see their own input!', width / 2, height - 40);
}

function drawPartySmall(ctx, x, y, name, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Inter, Arial';
    ctx.textAlign = 'center';
    ctx.fillText(name, x, y + 4);
}

function drawVisibilityArrow(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function drawColoringStage(ctx, data, width, height) {
    const cy = height / 2;
    
    // Draw color palette
    const numColors = data.numColors || 8;
    const colorWidth = 30;
    const startX = width / 2 - (numColors * colorWidth) / 2;
    
    for (let i = 0; i < numColors; i++) {
        const hue = (i / numColors) * 360;
        ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
        ctx.beginPath();
        ctx.roundRect(startX + i * colorWidth, cy - 20, colorWidth - 5, 40, 5);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.font = '11px Inter, Arial';
        ctx.textAlign = 'center';
        ctx.fillText(i.toString(), startX + i * colorWidth + colorWidth / 2 - 2, cy + 5);
    }
    
    // Stats
    ctx.fillStyle = COLORS.text;
    ctx.font = '14px Inter, Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${numColors} colors from Behrend's construction`, width / 2, cy + 60);
    ctx.fillText(`No monochromatic 3-term arithmetic progressions!`, width / 2, cy + 85);
}

function drawComputeStage(ctx, stage, width, height) {
    const cy = height / 2;
    const data = stage.data;
    
    let partyColor, partyName;
    if (stage.type === 'alice-compute') {
        partyColor = COLORS.alice;
        partyName = 'Alice';
    } else if (stage.type === 'bob-compute') {
        partyColor = COLORS.bob;
        partyName = 'Bob';
    } else {
        partyColor = COLORS.charlie;
        partyName = 'Charlie';
    }
    
    // Party icon
    ctx.fillStyle = partyColor;
    ctx.beginPath();
    ctx.arc(width / 2, cy - 40, 30, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Inter, Arial';
    ctx.textAlign = 'center';
    ctx.fillText(partyName, width / 2, cy - 36);
    
    // Formula
    ctx.fillStyle = COLORS.text;
    ctx.font = '16px Inter, Arial';
    ctx.fillText(`Computes: ${data.formula}`, width / 2, cy + 20);
    
    // Value
    ctx.fillStyle = COLORS.accent;
    ctx.font = 'bold 20px Inter, Arial';
    ctx.fillText(`= ${data.value}`, width / 2, cy + 55);
    
    // Color box
    const colorHue = (data.color / 8) * 360;
    ctx.fillStyle = `hsl(${colorHue}, 70%, 50%)`;
    ctx.beginPath();
    ctx.roundRect(width / 2 - 40, cy + 75, 80, 35, 8);
    ctx.fill();
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Inter, Arial';
    ctx.fillText(`Color ${data.color}`, width / 2, cy + 98);
}

function drawCompareStage(ctx, data, width, height) {
    const cy = height / 2 - 20;
    const boxWidth = 70;
    const gap = 30;
    const startX = width / 2 - (3 * boxWidth + 2 * gap) / 2;
    
    const colors = [
        { name: 'Alice', value: data.aliceColor, party: COLORS.alice },
        { name: 'Bob', value: data.bobColor, party: COLORS.bob },
        { name: 'Charlie', value: data.charlieColor, party: COLORS.charlie }
    ];
    
    colors.forEach((c, i) => {
        const x = startX + i * (boxWidth + gap);
        
        // Party label
        ctx.fillStyle = c.party;
        ctx.font = 'bold 13px Inter, Arial';
        ctx.textAlign = 'center';
        ctx.fillText(c.name, x + boxWidth / 2, cy - 35);
        
        // Color box
        const hue = (c.value / 8) * 360;
        ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
        ctx.beginPath();
        ctx.roundRect(x, cy - 20, boxWidth, 50, 8);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Inter, Arial';
        ctx.fillText(`${c.value}`, x + boxWidth / 2, cy + 12);
    });
    
    // Result
    const resultY = cy + 70;
    if (data.match) {
        ctx.fillStyle = COLORS.bob;
        ctx.font = 'bold 18px Inter, Arial';
        ctx.textAlign = 'center';
        ctx.fillText('✓ All colors MATCH!', width / 2, resultY);
        ctx.fillStyle = COLORS.text;
        ctx.font = '14px Inter, Arial';
        ctx.fillText('→ CheckSum = 1', width / 2, resultY + 25);
    } else {
        ctx.fillStyle = COLORS.alice;
        ctx.font = 'bold 18px Inter, Arial';
        ctx.textAlign = 'center';
        ctx.fillText('✗ Colors DIFFER', width / 2, resultY);
        ctx.fillStyle = COLORS.text;
        ctx.font = '14px Inter, Arial';
        ctx.fillText('→ CheckSum = 0', width / 2, resultY + 25);
    }
}

function drawResultStage(ctx, data, width, height) {
    const cy = height / 2;
    
    // Result box
    const boxColor = data.correct ? '#064e3b' : '#7f1d1d';
    ctx.fillStyle = boxColor;
    ctx.beginPath();
    ctx.roundRect(width / 2 - 140, cy - 60, 280, 120, 12);
    ctx.fill();
    
    ctx.strokeStyle = data.correct ? COLORS.bob : COLORS.alice;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Icon
    ctx.fillStyle = data.correct ? COLORS.bob : COLORS.alice;
    ctx.font = '36px Inter, Arial';
    ctx.textAlign = 'center';
    ctx.fillText(data.correct ? '✓' : '✗', width / 2, cy - 15);
    
    // Text
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 16px Inter, Arial';
    ctx.fillText(data.isChecksum ? 'CheckSum = 1' : 'CheckSum = 0', width / 2, cy + 20);
    
    ctx.font = '14px Inter, Arial';
    ctx.fillText('Protocol answered correctly!', width / 2, cy + 45);
    
    // Communication complexity
    ctx.fillStyle = COLORS.accent;
    ctx.font = '14px Inter, Arial';
    ctx.fillText(`Communication: ${data.communicationBits} bits = O(√log N)`, width / 2, cy + 100);
}
