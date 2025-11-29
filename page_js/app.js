// Hero Background Animation
const canvas = document.getElementById("backgroundCanvas");
const ctx = canvas.getContext("2d");

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

const dpr = window.devicePixelRatio || 1;
canvas.width = width * dpr;
canvas.height = height * dpr;
ctx.scale(dpr, dpr);

const NODE_COUNT = 50;
const COLORS = ["#00ffff", "#00ff99", "#9b59b6"];
const MIN_DIST = 50;
const MAX_EDGES_PER_NODE = 4;
const nodes = [];
const edgeMap = new Map();
function getEdgeKey(i, j) { return i < j ? `${i}-${j}` : `${j}-${i}`; }

class Node {
    constructor(x, y) {
        this.x = x !== undefined ? x : Math.random() * width;
        this.y = y !== undefined ? y : Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    }
    move() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
    }
}

function generateNodes(count, minDist){
    const result = [];
    let attempts = 0;
    while(result.length < count && attempts < count*50){
        let x = Math.random() * width;
        let y = Math.random() * height;
        let tooClose = false;
        for(const n of result){
            const dx = n.x - x;
            const dy = n.y - y;
            if(Math.sqrt(dx*dx + dy*dy) < minDist){
                tooClose = true;
                break;
            }
        }
        if(!tooClose){
            result.push(new Node(x, y));
        }
        attempts++;
    }
    return result;
}

nodes.push(...generateNodes(NODE_COUNT, MIN_DIST));
let MAX_DISTANCE = Math.sqrt((width*height)/NODE_COUNT) * 0.9;

// Connect nodes based on distance, cap edges per node
nodes.forEach((node, i) => {
    let neighbors = [];
    nodes.forEach((other,j)=>{
        if(i===j) return;
        const dx = node.x - other.x;
        const dy = node.y - other.y;
        const dist = Math.sqrt(dx*dx+dy*dy);
        if(dist < MAX_DISTANCE){
            neighbors.push({idx:j, dist});
        }
    });
    neighbors.sort((a,b)=>a.dist-b.dist);
    for(let k=0;k<Math.min(MAX_EDGES_PER_NODE, neighbors.length);k++){
        const j = neighbors[k].idx;
        const key = getEdgeKey(i,j);
        edgeMap.set(key,1);
    }
});

function animate(){
    ctx.clearRect(0,0,width,height);

    for(let i=0;i<nodes.length;i++){
        for(let j=i+1;j<nodes.length;j++){
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            const key = getEdgeKey(i,j);

            if(!edgeMap.has(key)) edgeMap.set(key,0);
            let opacity = edgeMap.get(key);
            const fadeSpeed = 0.02;

            // Only use distance to control fading, remove edgeCount check
            if(dist < MAX_DISTANCE){
                opacity += fadeSpeed;
                if(opacity>1) opacity=1;
            } else {
                opacity -= fadeSpeed;
                if(opacity<0) opacity=0;
            }
            edgeMap.set(key,opacity);

            if(opacity>0){
                const gradient = ctx.createLinearGradient(nodes[i].x,nodes[i].y,nodes[j].x,nodes[j].y);
                gradient.addColorStop(0,nodes[i].color);
                gradient.addColorStop(1,nodes[j].color);
                ctx.strokeStyle = gradient;
                ctx.globalAlpha = opacity;
                ctx.lineWidth = 1.2;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(nodes[i].x,nodes[i].y);
                ctx.lineTo(nodes[j].x,nodes[j].y);
                ctx.stroke();
                ctx.globalAlpha = 1;
            }
        }
    }

    nodes.forEach(node=>{
        node.move();
        node.vx *= 0.999;
        node.vy *= 0.999;
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x,node.y,3,0,Math.PI*2);
        ctx.fill();
    });

    requestAnimationFrame(animate);
}
animate();

window.addEventListener('resize',()=>{
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    MAX_DISTANCE = Math.sqrt((width*height)/NODE_COUNT) * 0.9;
});

canvas.addEventListener('mousemove',(e)=>{
    const mouse = {x: e.clientX, y: e.clientY};
    nodes.forEach(node=>{
        const dx = node.x - mouse.x;
        const dy = node.y - mouse.y;
        const dist = Math.sqrt(dx*dx+dy*dy);
        if(dist<100){
            node.vx += dx*0.00003;
            node.vy += dy*0.00003;
        }
    });
});

function initCardAnimation(cardId){
    const card = document.getElementById(cardId);
    if(!card) return;
    const c = document.createElement('canvas');
    c.width = card.clientWidth;
    c.height = card.clientHeight;
    card.appendChild(c);
    const cardCtx = c.getContext('2d');
    const dots = [];
    for(let i=0;i<10;i++){
        dots.push({
            x: Math.random()*c.width,
            y: Math.random()*c.height,
            vx: (Math.random()-0.5)*0.2,
            vy: (Math.random()-0.5)*0.2,
            color: COLORS[Math.floor(Math.random()*COLORS.length)]
        });
    }
    function animateCard(){
        cardCtx.clearRect(0,0,c.width,c.height);
        dots.forEach(dot=>{
            dot.x += dot.vx;
            dot.y += dot.vy;
            if(dot.x<0||dot.x>c.width) dot.vx*=-1;
            if(dot.y<0||dot.y>c.height) dot.vy*=-1;
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
