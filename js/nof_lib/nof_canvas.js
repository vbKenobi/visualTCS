// NOF Canvas Controller

import { BehrendConstruction, NOFProtocol, BehrendDemo } from './nof_logic.js';
import { drawBehrend, drawNOF, resizeCanvas } from './nof_draw.js';

// State
let behrendDemo = new BehrendDemo();
let nofProtocol = null;
let mode = 'demo';
let isRunning = false;

// Canvas elements
const behrendCanvas = document.getElementById('behrendCanvas');
const nofCanvas = document.getElementById('nofCanvas');
const behrendCtx = behrendCanvas.getContext('2d');
const nofCtx = nofCanvas.getContext('2d');

// Get dimensions
let behrendDims = resizeCanvas(behrendCanvas);
let nofDims = resizeCanvas(nofCanvas);

// Initial draw
drawBehrend(behrendCtx, behrendDemo.getPhase(), getBehrendData(), behrendDims);
drawNOF(nofCtx, null, nofDims);

// Resize handler
window.addEventListener('resize', () => {
    behrendDims = resizeCanvas(behrendCanvas);
    nofDims = resizeCanvas(nofCanvas);
    drawBehrend(behrendCtx, behrendDemo.getPhase(), getBehrendData(), behrendDims);
    if (nofProtocol) {
        drawNOF(nofCtx, nofProtocol.getCurrentStage(), nofDims);
    } else {
        drawNOF(nofCtx, null, nofDims);
    }
});

// Mode change handler
window.addEventListener('modeChange', (e) => {
    mode = e.detail.mode;
    reset();
});

// Button handlers
const runBtn = document.getElementById('runBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const resetBtn = document.getElementById('resetBtn');

runBtn.addEventListener('click', () => {
    if (mode === 'demo') {
        runDemo();
    } else {
        runInteractive();
    }
});

prevBtn.addEventListener('click', () => {
    if (mode === 'demo') {
        behrendDemo.prev();
        drawBehrend(behrendCtx, behrendDemo.getPhase(), getBehrendData(), behrendDims);
        updateProgress(behrendDemo.getProgress());
    }
    if (nofProtocol) {
        nofProtocol.prevStage();
        drawNOF(nofCtx, nofProtocol.getCurrentStage(), nofDims);
        if (mode !== 'demo') {
            updateProgress(nofProtocol.getProgress());
        }
    }
});

nextBtn.addEventListener('click', () => {
    if (mode === 'demo') {
        behrendDemo.next();
        drawBehrend(behrendCtx, behrendDemo.getPhase(), getBehrendData(), behrendDims);
        updateProgress(behrendDemo.getProgress());
    }
    if (nofProtocol) {
        nofProtocol.nextStage();
        drawNOF(nofCtx, nofProtocol.getCurrentStage(), nofDims);
        if (mode !== 'demo') {
            updateProgress(nofProtocol.getProgress());
        }
    }
});

resetBtn.addEventListener('click', reset);

// Input change handlers
const inputs = ['aliceInput', 'bobInput', 'charlieInput', 'targetN', 'kValue', 'dValue'];
inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('change', () => {
            updateNValue();
        });
    }
});

function updateNValue() {
    const targetN = parseInt(document.getElementById('targetN').value) || 100;
    document.getElementById('nValue').textContent = targetN;
}

function getBehrendData() {
    const k = parseInt(document.getElementById('kValue')?.value) || 5;
    const d = parseInt(document.getElementById('dValue')?.value) || 3;
    const behrend = new BehrendConstruction(k, d);
    
    return {
        k: k,
        d: d,
        ...behrend.getStats(),
        shellPoints: behrend.getShellPoints().map((p, i) => ({ angle: i / behrend.getShellPoints().length }))
    };
}

function runDemo() {
    isRunning = true;
    behrendDemo.reset();
    
    // Also run a sample NOF protocol
    const N = 100;
    nofProtocol = new NOFProtocol(N);
    nofProtocol.runProtocol(30, 40, 30); // x + y + z = 100, so checksum is satisfied
    
    drawBehrend(behrendCtx, behrendDemo.getPhase(), getBehrendData(), behrendDims);
    drawNOF(nofCtx, nofProtocol.getCurrentStage(), nofDims);
    
    prevBtn.disabled = false;
    nextBtn.disabled = false;
    
    updateProgress(behrendDemo.getProgress());
    showStatus('Demo started! Use Next/Previous to step through.', 'success');
    
    // Show step panel
    const stepPanel = document.getElementById('stepPanel');
    if (stepPanel.classList.contains('collapsed')) {
        stepPanel.classList.remove('collapsed');
    }
}

function runInteractive() {
    const x = parseInt(document.getElementById('aliceInput').value) || 0;
    const y = parseInt(document.getElementById('bobInput').value) || 0;
    const z = parseInt(document.getElementById('charlieInput').value) || 0;
    const N = parseInt(document.getElementById('targetN').value) || 100;
    
    nofProtocol = new NOFProtocol(N);
    nofProtocol.runProtocol(x, y, z);
    
    // Also update Behrend display
    const k = parseInt(document.getElementById('kValue').value) || 5;
    const d = parseInt(document.getElementById('dValue').value) || 3;
    
    drawBehrend(behrendCtx, { name: 'result', title: 'Behrend\'s Construction', description: `k=${k}, d=${d}` }, getBehrendData(), behrendDims);
    drawNOF(nofCtx, nofProtocol.getCurrentStage(), nofDims);
    
    prevBtn.disabled = false;
    nextBtn.disabled = false;
    
    updateProgress(nofProtocol.getProgress());
    
    // Show result
    const sum = x + y + z;
    const isChecksum = sum === N;
    showStatus(`x + y + z = ${sum}. ${isChecksum ? 'CheckSum satisfied!' : `CheckSum NOT satisfied (≠ ${N})`}`, isChecksum ? 'success' : 'info');
    
    // Show result box
    const resultBox = document.getElementById('resultBox');
    const resultContent = document.getElementById('resultContent');
    resultBox.style.display = 'block';
    resultContent.innerHTML = `
        <p><strong>Inputs:</strong> x=${x}, y=${y}, z=${z}</p>
        <p><strong>Sum:</strong> ${sum}</p>
        <p><strong>Target N:</strong> ${N}</p>
        <p><strong>CheckSum:</strong> ${isChecksum ? '✓ YES' : '✗ NO'}</p>
    `;
    
    // Show step panel
    const stepPanel = document.getElementById('stepPanel');
    if (stepPanel.classList.contains('collapsed')) {
        stepPanel.classList.remove('collapsed');
    }
}

function reset() {
    behrendDemo.reset();
    nofProtocol = null;
    isRunning = false;
    
    drawBehrend(behrendCtx, behrendDemo.getPhase(), getBehrendData(), behrendDims);
    drawNOF(nofCtx, null, nofDims);
    
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    
    document.getElementById('resultBox').style.display = 'none';
    document.getElementById('progressFill').style.width = '0%';
    document.getElementById('stepCounter').textContent = 'Ready';
    document.getElementById('stepDescription').innerHTML = `
        <h4>Behrend's Construction & NOF</h4>
        <p>Click "Run Protocol" to see the visualization.</p>
    `;
    
    showStatus('Reset complete', 'info');
}

function updateProgress(progress) {
    const progressFill = document.getElementById('progressFill');
    const stepCounter = document.getElementById('stepCounter');
    const stepDesc = document.getElementById('stepDescription');
    
    progressFill.style.width = progress.percentage + '%';
    stepCounter.textContent = `Step ${progress.current} of ${progress.total}`;
    
    // Update description based on current stage
    if (mode === 'demo') {
        const phase = behrendDemo.getPhase();
        stepDesc.innerHTML = `
            <h4>${phase.title}</h4>
            <p>${phase.description}</p>
        `;
    } else if (nofProtocol) {
        const stage = nofProtocol.getCurrentStage();
        if (stage) {
            stepDesc.innerHTML = `
                <h4>${stage.name}</h4>
                <p>${stage.description}</p>
            `;
        }
    }
}

function showStatus(message, type) {
    const statusMsg = document.getElementById('statusMsg');
    statusMsg.textContent = message;
    statusMsg.style.display = 'block';
    
    if (type === 'success') {
        statusMsg.style.background = '#064e3b';
        statusMsg.style.color = '#34d399';
    } else if (type === 'error') {
        statusMsg.style.background = '#7f1d1d';
        statusMsg.style.color = '#fca5a5';
    } else {
        statusMsg.style.background = '#1e3a5f';
        statusMsg.style.color = '#93c5fd';
    }
    
    setTimeout(() => {
        statusMsg.style.display = 'none';
    }, 3000);
}

// Export for potential external use
export { runDemo, runInteractive, reset };
