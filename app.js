// Hero Background Animation
const canvas = document.getElementById("backgroundCanvas");
const ctx = canvas.getContext("2d");

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

const NODE_COUNT = 50;
const MAX_DISTANCE = 150;
const nodes = [];

const COLORS = ["#00ffff", "#00ff99", "#9b59b6"]; // teal -> green -> purple

class Node {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.1; // slower
        this.vy = (Math.random() - 0.5) * 0.1; // slower
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    }
    move() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
    }
}

// Initialize nodes
for (let i = 0; i < NODE_COUNT; i++) {
    nodes.push(new Node());
}
// Create a map to store edge opacity between node pairs
const edgeMap = new Map();

function getEdgeKey(i, j) {
    return i < j ? `${i}-${j}` : `${j}-${i}`;
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw edges with smooth fade
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            const key = getEdgeKey(i,j);

            // initialize opacity if not exist
            if (!edgeMap.has(key)) edgeMap.set(key, 0);
            let opacity = edgeMap.get(key);

            const fadeSpeed = 0.02; // adjust for smoother/faster fading

            if (dist < MAX_DISTANCE) {
                // fade in
                opacity += fadeSpeed;
                if (opacity > 1) opacity = 1;
            } else {
                // fade out
                opacity -= fadeSpeed;
                if (opacity < 0) opacity = 0;
            }
            edgeMap.set(key, opacity);

            if (opacity > 0) {
                const gradient = ctx.createLinearGradient(
                    nodes[i].x, nodes[i].y,
                    nodes[j].x, nodes[j].y
                );
                gradient.addColorStop(0, nodes[i].color);
                gradient.addColorStop(1, nodes[j].color);
                ctx.strokeStyle = gradient;
                ctx.globalAlpha = opacity; // apply opacity
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(nodes[i].x, nodes[i].y);
                ctx.lineTo(nodes[j].x, nodes[j].y);
                ctx.stroke();
                ctx.globalAlpha = 1; // reset
            }
        }
    }

    // Draw nodes
    nodes.forEach(node => {
        node.move();
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 3, 0, Math.PI * 2);
        ctx.fill();
    });

    requestAnimationFrame(animate);
}
animate();

// Resize canvas
window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
});

// Mouse interactivity (slight, subtle)
canvas.addEventListener('mousemove', (e) => {
    const mouse = {x: e.clientX, y: e.clientY};
    nodes.forEach(node => {
        const dx = node.x - mouse.x;
        const dy = node.y - mouse.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 100) {
            node.vx += dx * 0.0002; // smaller influence
            node.vy += dy * 0.0002;
        }
    });
});

// Placeholder card animations (can be extended)
function initCardAnimation(cardId) {
    const card = document.getElementById(cardId);
    if (!card) return;
    const c = document.createElement('canvas');
    c.width = card.clientWidth;
    c.height = card.clientHeight;
    card.appendChild(c);
    // Minimal animation inside cards (dots slowly moving)
    const cardCtx = c.getContext('2d');
    const dots = [];
    for (let i = 0; i < 10; i++) {
        dots.push({x: Math.random()*c.width, y: Math.random()*c.height, vx: (Math.random()-0.5)*0.2, vy: (Math.random()-0.5)*0.2, color: COLORS[Math.floor(Math.random()*COLORS.length)]});
    }
    function animateCard() {
        cardCtx.clearRect(0,0,c.width,c.height);
        dots.forEach(dot => {
            dot.x += dot.vx;
            dot.y += dot.vy;
            if(dot.x<0 || dot.x>c.width) dot.vx*=-1;
            if(dot.y<0 || dot.y>c.height) dot.vy*=-1;
            cardCtx.fillStyle = dot.color;
            cardCtx.beginPath();
            cardCtx.arc(dot.x,dot.y,2,0,Math.PI*2);
            cardCtx.fill();
        });
        requestAnimationFrame(animateCard);
    }
    animateCard();
}

initCardAnimation("shortestPathCard");
initCardAnimation("bfsDfsCard");
initCardAnimation("graphLayoutCard");