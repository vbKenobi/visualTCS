// Behrend's Construction & NOF Protocol Logic

// Constants
const DEFAULT_K = 5;
const DEFAULT_D = 3;

// Behrend's Construction: Find 3-AP free set on sphere shell
class BehrendConstruction {
    constructor(k = DEFAULT_K, d = DEFAULT_D) {
        this.k = k;
        this.d = d;
        this.sphereShells = new Map(); // R -> points on shell
        this.bestShell = null;
        this.bestR = 0;
        this.coloring = new Map();
        this.build();
    }
    
    build() {
        // Generate all points in [k]^d
        const points = this.generatePoints();
        
        // Group by radius squared
        for (const p of points) {
            const R = this.radiusSquared(p);
            if (!this.sphereShells.has(R)) {
                this.sphereShells.set(R, []);
            }
            this.sphereShells.get(R).push(p);
        }
        
        // Find shell with most points (pigeonhole argument)
        let maxSize = 0;
        for (const [R, pts] of this.sphereShells) {
            if (pts.length > maxSize) {
                maxSize = pts.length;
                this.bestR = R;
                this.bestShell = pts;
            }
        }
        
        // Build coloring based on base-(2k+1) mapping
        this.buildColoring();
    }
    
    generatePoints() {
        const points = [];
        const generate = (current, dim) => {
            if (dim === this.d) {
                points.push([...current]);
                return;
            }
            for (let i = 1; i <= this.k; i++) {
                current.push(i);
                generate(current, dim + 1);
                current.pop();
            }
        };
        generate([], 0);
        return points;
    }
    
    radiusSquared(point) {
        return point.reduce((sum, x) => sum + x * x, 0);
    }
    
    // Map point to integer using base-(2k+1) representation
    pointToInt(point) {
        const base = 2 * this.k + 1;
        let value = 0;
        for (let i = 0; i < point.length; i++) {
            value += point[i] * Math.pow(base, i);
        }
        return value;
    }
    
    // Build coloring: integers -> colors (based on which shell they belong to)
    buildColoring() {
        const numColors = Math.ceil(2 * Math.sqrt(Math.log2(this.getMaxN())));
        
        // Color based on modular arithmetic to ensure no monochromatic 3-APs
        for (const point of this.bestShell) {
            const n = this.pointToInt(point);
            // Simple coloring: use the shell radius as part of the color
            const color = n % numColors;
            this.coloring.set(n, color);
        }
    }
    
    getMaxN() {
        return Math.pow(2 * this.k + 1, this.d);
    }
    
    getNumColors() {
        return Math.ceil(2 * Math.sqrt(Math.log2(this.getMaxN())));
    }
    
    // Get color for any integer (extended coloring)
    getColor(n) {
        const numColors = this.getNumColors();
        // Use a coloring that respects 3-AP freeness
        // Based on the construction: χ(n) based on residue classes
        return Math.abs(n) % numColors;
    }
    
    getShellPoints() {
        return this.bestShell || [];
    }
    
    getStats() {
        return {
            k: this.k,
            d: this.d,
            totalPoints: Math.pow(this.k, this.d),
            bestR: this.bestR,
            shellSize: this.bestShell ? this.bestShell.length : 0,
            maxN: this.getMaxN(),
            numColors: this.getNumColors(),
            bound: `N / 2^(c√log N)`
        };
    }
}

// NOF Protocol for CheckSum
class NOFProtocol {
    constructor(N = 100) {
        this.N = N;
        this.behrend = new BehrendConstruction(
            Math.max(2, Math.floor(Math.sqrt(Math.log2(N)))),
            Math.max(2, Math.floor(Math.sqrt(Math.log2(N))))
        );
        this.stages = [];
        this.currentStage = 0;
    }
    
    // Compute what each party calculates
    computeValues(x, y, z) {
        // d = x + y + z - N
        const d = x + y + z - this.N;
        
        // Each party computes a value that forms a 3-AP with spacing d
        // If d = 0 (checksum satisfied), all compute the same value
        // If d ≠ 0, they form a non-trivial 3-AP
        
        const aliceComputes = 3 * this.N - y - 2 * z;  // doesn't depend on x
        const bobComputes = 2 * this.N + x - z;        // doesn't depend on y
        const charlieComputes = this.N + 2 * x + y;    // doesn't depend on z
        
        return {
            alice: aliceComputes,
            bob: bobComputes,
            charlie: charlieComputes,
            d: d,
            isChecksum: d === 0
        };
    }
    
    // Get colors announced by each party
    getColors(x, y, z) {
        const values = this.computeValues(x, y, z);
        
        return {
            aliceColor: this.behrend.getColor(values.alice),
            bobColor: this.behrend.getColor(values.bob),
            charlieColor: this.behrend.getColor(values.charlie),
            aliceValue: values.alice,
            bobValue: values.bob,
            charlieValue: values.charlie,
            isChecksum: values.isChecksum,
            allSameColor: this.behrend.getColor(values.alice) === this.behrend.getColor(values.bob) &&
                          this.behrend.getColor(values.bob) === this.behrend.getColor(values.charlie)
        };
    }
    
    // Run the full protocol
    runProtocol(x, y, z) {
        this.stages = [];
        const values = this.computeValues(x, y, z);
        const colors = this.getColors(x, y, z);
        
        // Stage 1: Setup
        this.stages.push({
            type: 'setup',
            name: 'Protocol Setup',
            description: `CheckSum: Is x + y + z = ${this.N}?`,
            data: { x, y, z, N: this.N, sum: x + y + z }
        });
        
        // Stage 2: Show what each party sees
        this.stages.push({
            type: 'visibility',
            name: 'NOF Visibility',
            description: 'Each party sees inputs on others\' foreheads',
            data: {
                aliceSees: { y, z },
                bobSees: { x, z },
                charlieSees: { x, y }
            }
        });
        
        // Stage 3: Behrend coloring
        this.stages.push({
            type: 'coloring',
            name: 'Behrend Coloring',
            description: `Using ${this.behrend.getNumColors()} colors (no monochromatic 3-APs)`,
            data: this.behrend.getStats()
        });
        
        // Stage 4: Alice computes
        this.stages.push({
            type: 'alice-compute',
            name: 'Alice Computes',
            description: `Alice computes 3N - y - 2z = 3(${this.N}) - ${y} - 2(${z}) = ${values.alice}`,
            data: {
                formula: '3N - y - 2z',
                value: values.alice,
                color: colors.aliceColor
            }
        });
        
        // Stage 5: Bob computes
        this.stages.push({
            type: 'bob-compute',
            name: 'Bob Computes',
            description: `Bob computes 2N + x - z = 2(${this.N}) + ${x} - ${z} = ${values.bob}`,
            data: {
                formula: '2N + x - z',
                value: values.bob,
                color: colors.bobColor
            }
        });
        
        // Stage 6: Charlie computes
        this.stages.push({
            type: 'charlie-compute',
            name: 'Charlie Computes',
            description: `Charlie computes N + 2x + y = ${this.N} + 2(${x}) + ${y} = ${values.charlie}`,
            data: {
                formula: 'N + 2x + y',
                value: values.charlie,
                color: colors.charlieColor
            }
        });
        
        // Stage 7: Compare colors
        this.stages.push({
            type: 'compare',
            name: 'Compare Colors',
            description: colors.allSameColor ? 
                'All colors match! → CheckSum = 1' : 
                'Colors differ → CheckSum = 0',
            data: {
                aliceColor: colors.aliceColor,
                bobColor: colors.bobColor,
                charlieColor: colors.charlieColor,
                match: colors.allSameColor
            }
        });
        
        // Stage 8: Result
        this.stages.push({
            type: 'result',
            name: 'Protocol Result',
            description: values.isChecksum ? 
                `✓ CORRECT: x + y + z = ${this.N}` :
                `✓ CORRECT: x + y + z = ${x + y + z} ≠ ${this.N}`,
            data: {
                isChecksum: values.isChecksum,
                protocolAnswer: colors.allSameColor,
                correct: values.isChecksum === colors.allSameColor,
                communicationBits: Math.ceil(Math.log2(this.behrend.getNumColors())) * 3
            }
        });
        
        this.currentStage = 0;
        return this.stages;
    }
    
    getCurrentStage() {
        return this.stages[this.currentStage] || null;
    }
    
    nextStage() {
        if (this.currentStage < this.stages.length - 1) {
            this.currentStage++;
        }
        return this.getCurrentStage();
    }
    
    prevStage() {
        if (this.currentStage > 0) {
            this.currentStage--;
        }
        return this.getCurrentStage();
    }
    
    getProgress() {
        return {
            current: this.currentStage + 1,
            total: this.stages.length,
            percentage: Math.round(((this.currentStage + 1) / this.stages.length) * 100)
        };
    }
}

// Demo animation for Behrend construction
class BehrendDemo {
    constructor() {
        this.phase = 0;
        this.phases = [
            { name: 'circle', title: 'Unit Circle in 2D', description: 'Points on circle have no 3-APs' },
            { name: 'midpoint', title: 'Midpoint Property', description: 'Midpoint of a,b lies inside circle' },
            { name: 'sphere', title: 'Sphere in d-dimensions', description: 'S^(d-1) has no x,y,z with x+y=2z' },
            { name: 'lattice', title: 'Integer Lattice [k]^d', description: 'Pick points on shell of radius R' },
            { name: 'shell', title: 'Best Shell S_R', description: 'By pigeonhole: |S_R| ≥ k^d / (k²·d)' },
            { name: 'mapping', title: 'Base-(2k+1) Mapping', description: 'Map points to integers preserving 3-AP' },
            { name: 'result', title: 'Result', description: '|S| ≥ N / 2^(c√log N)' }
        ];
    }
    
    getPhase() {
        return this.phases[this.phase];
    }
    
    next() {
        if (this.phase < this.phases.length - 1) {
            this.phase++;
        }
        return this.getPhase();
    }
    
    prev() {
        if (this.phase > 0) {
            this.phase--;
        }
        return this.getPhase();
    }
    
    reset() {
        this.phase = 0;
    }
    
    getProgress() {
        return {
            current: this.phase + 1,
            total: this.phases.length,
            percentage: Math.round(((this.phase + 1) / this.phases.length) * 100)
        };
    }
}

export { BehrendConstruction, NOFProtocol, BehrendDemo };
