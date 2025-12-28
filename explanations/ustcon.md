# USTCON - Undirected s-t Connectivity in Logspace

## Introduction & Motivation

Algorithms consume various resources, and our goal is to understand the theoretical bounds for these metrics:

- **Time** – most researched; counts iterations over input
- **Memory** – extra space beyond the read-only input
- **Randomness** – powerful but causes replicability/debugging issues
- **Communication** – relevant for distributed systems

---

## The Problem: Graph Connectivity

**s-t Connectivity:** Given a graph $G$, source $s$, and target $t$, determine whether $s$ and $t$ are connected.

### Classical Approach (BFS/DFS)
- **Time:** $O(|V| + |E|)$ – optimal (must read input)
- **Memory:** $O(|V|)$ – need to track visited vertices

### The Challenge
What if we can't store the entire graph in RAM? We want to solve connectivity using **logarithmic space** at the expense of time.

**Query Model:** Store $G$ in the cloud; query neighbors of specific vertices.

---

## Key Results

> **Randomized Algorithm:** $O(5\log|V|)$ bits of memory solves s-t connectivity for both directed and undirected graphs, with $O(|V|^3)$ time.

> **Reingold (2005):** s-t connectivity on **undirected graphs** can be solved with $O(\log|V|)$ extra memory **without randomness**.

For **directed graphs**, the best known is $O((\log|V|)^{1.5})$ space – this remains an important open problem.

---

## Randomized Algorithm for Connectivity

```
current ← s
target ← t
steps ← 0

while steps < T:
    current ← random neighbor of current
    if current = target:
        return YES
    steps ← steps + 1

return NO
```

**Memory:** $2\log|V| + \log T$ bits (store current, target, step counter)

**Theorem:** If $T = 100|V|^3$, then $\Pr[\text{wrong}] < \frac{1}{10}$

**Total memory:** $O(5\log|V|)$ bits. Run multiple times to reduce error probability.

### Worst-Case Graphs
Graphs like **lollipop** and **dumbbell** graphs maximize the probability of getting stuck in cliques, but with $O(n^3)$ steps we still achieve the desired accuracy.

---

## Graphs and Matrices

### Adjacency Matrix
For graph $G$: $A_{ij} = 1$ if vertices $i$ and $j$ are connected, else $0$.

**Property:** For undirected graphs, $A_G$ is symmetric.

### Definitions
- **Degree:** $\deg_G(v)$ = number of edges at vertex $v$
- **d-regular:** $\forall v: \deg_G(v) = d$
- **Normalized Adjacency Matrix:** $M_G = \frac{A_G}{d}$ (for d-regular graphs)

### Eigenvalue Decomposition
Any symmetric matrix $M \in \mathbb{R}^{N \times N}$ has $N$ eigenvalues $\lambda_1 \geq \lambda_2 \geq \ldots \geq \lambda_n$ with orthonormal eigenvectors. We can reconstruct:

$$M = \lambda_1 v_1 v_1^T + \lambda_2 v_2 v_2^T + \ldots + \lambda_n v_n v_n^T$$

---

## Spectral Graph Theory

Spectral graph theory connects matrix properties (eigenvalues, eigenvectors) to graph structure.

### Key Theorem
If $G$ is d-regular, then:
1. $\lambda_1 = 1$ is an eigenvalue of $M_G$
2. All eigenvalues satisfy $|\lambda_i| \leq 1$

**Corollary:** Eigenvalues satisfy $1 = \lambda_1 \geq \lambda_2 \geq \ldots \geq \lambda_n \geq -1$

### Spectral Gap
$$\lambda(G) = \max(|\lambda_2|, \ldots, |\lambda_n|)$$

The **spectral gap** is $1 - \lambda(G)$.

> **Higher spectral gap = more connected graph**

### Connectivity Theorem
A d-regular graph $G$ with self-loops is **connected** if and only if $\lambda(G) < 1$.

### $(N, D, \lambda)$ Notation
A graph $G$ is $(N, D, \lambda)$ when it has $N$ vertices, is D-regular, and $\lambda(G) \leq \lambda$.

### Diameter Bound
For an $(N, D, \lambda)$ graph:
$$\Delta(G) \leq \lceil \log_{1/\lambda} N \rceil + 1$$

This directly shows how spectral gap affects connectivity strength.

---

## Simple USTCON Algorithm

**Promise:** Connected parts of $G$ have small diameter $\Delta \leq T$.

**Algorithm:** Explore all paths of length $\leq T$. If $t$ is found, return YES.

**Implementation:** Enumerate sequences of length $T$ with elements in $\{1, \ldots, D\}$ (adjacency list indices).

**Space Complexity:** $O(\log N + (\log D) \cdot T)$

Using spectral gap: if $\lambda \leq \frac{9}{10}$, then $T = O(\log N)$, giving space $O(\log N + \log D \cdot \log N)$.

---

## Reducing Graph Degree

**Goal:** Transform $(G, s, t)$ into $(\bar{G}, \bar{s}, \bar{t})$ where $\bar{G}$ is 4-regular.

### Process
1. Break up each edge at endpoints (create 2 new vertices per edge)
2. Add a local cycle at each old vertex
3. Connect cycles with old edges
4. Add self-loops

**Result:** If $G$ has $V$ vertices and $E$ edges, then $\bar{G}$ has $2E$ vertices and degree 4.

---

## Improving the Spectral Gap

### Graph Squaring
The $t$-th power $G^t$ connects vertices reachable by walks of exactly length $t$.

**Theorem:** $A_{G^2} = (A_G)^2$

**Properties:**
- If $G$ is D-regular, then $G^2$ is $D^2$-regular
- If $G$ is $(N, D, \lambda)$, then $G^2$ is $(N, D^2, \lambda^2)$

**Problem:** Squaring improves $\lambda$ but increases degree proportionally – no net gain in space!

---

## The Zig-Zag Product

The breakthrough operation! Given:
- Graph $G$: $(N, D, \lambda_G)$
- Graph $H$ (the "cloud"): $(D, D_1, \lambda_H)$

Then $G \circledast H$ is an $(N \cdot D, D_1^2, \lambda_{new})$ graph.

**Key insight:** $G$ is large, $H$ is small. The product inherits the degree from $H$ while expanding size.

### Zig-Zag Steps
For each vertex $(v, a)$ and pair $(k_1, k_2) \in [D_1] \times [D_1]$:
1. **Zig:** Take within-cloud step by $k_1$ in cloud $v$: $(v, a) \to (v, b)$
2. **Across:** Take edge from cloud $v$ to cloud $u$: $(v, b) \to (u, b)$
3. **Zag:** Take within-cloud step by $k_2$ in cloud $u$: $(u, b) \to (u, c)$
4. Connect $(v, a)$ to $(u, c)$

### Main Theorem (RVW 2001)
$$\lambda(G \circledast H) \leq 1 - (1 - \lambda_H)^2(1 - \lambda_G)$$

---

## Rotation Maps

**Definition:** $\text{Rot}_G: [N] \times [D] \to [N] \times [D]$

$\text{Rot}_G(v, i) = (w, j)$ means the $i$-th edge of $v$ goes to $w$, and this is the $j$-th edge of $w$.

**For Zig-Zag Product:**
$$\text{Rot}_{G \circledast H}: [N \times D] \times [D_1^2] \to [N \times D] \times [D_1^2]$$

Steps:
1. $(a', i') \leftarrow \text{Rot}_H(a, k_1)$
2. $(w, b') \leftarrow \text{Rot}_G(v, a')$
3. $(b, i'') \leftarrow \text{Rot}_H(b', k_2)$
4. Output: $(w, b), (i'', i')$

---

## USTCON in Logspace: The Full Algorithm

### Algorithm
1. Fix graph $H$: $(B^4, B, \frac{1}{4})$ for constant $B$ (precomputed)
2. Convert $(G, s, t)$ to $(G_0, s_0, t_0)$ where $G_0$ is $B^2$-regular
3. For $k = 1, \ldots, L$ where $L = O(\log N)$:
   $$G_k \leftarrow G_{k-1}^2 \circledast H$$
4. Solve s-t connectivity on $(G_L, s_L, t_L)$

### Analysis
**Lambda recurrence:**
$$\lambda_k \leq 1 - \frac{9}{16}(1 - \lambda_{k-1}^2)$$

After $L = O(\log N)$ iterations: $\lambda_L \leq \frac{17}{18}$

**Space complexity:**
$$O(\log(D^2) \cdot \log_{1/\lambda_L}(\text{vertices in } G_L))$$
$$= O(2\log B \cdot \log_{18/17}(N \cdot B^{4L}))$$
$$= O(\log N)$$

---

## Further Reading

### Universal Traversal Sequences
A sequence $\mathcal{U}_{N,D} \subseteq [D]^N$ is **universal** if for any D-regular graph $G$ on $N$ vertices and any connected vertices $s, t$, some sequence in $\mathcal{U}$ takes $s$ through $t$.

**Theorem (Reingold 05):** We can compute $|\mathcal{U}_{N,D}| = \text{poly}(N, D)$ (polynomial, not exponential!).

### Expander Graphs
**Edge Boundary:** $\partial S = E(S, \bar{S})$ – edges from $S$ to its complement

**Expansion Ratio:** $h(G) = \min_{|S| \leq n/2} \frac{|\partial S|}{|S|}$

**Cheeger's Inequality:**
$$\frac{d - \lambda_2}{2} \leq h(G) \leq \sqrt{2d(d - \lambda_2)}$$

Expanders are crucial for fault-tolerant networks – they resist disconnection when edges are removed.

---

## Visualization Guide

### Step 1: Initial Graph
Input graph with source (green) and target (red) marked.

### Step 2: Make Regular
Convert to regular graph by adding self-loops and applying degree reduction.

### Step 3: Graph Squaring
Connect vertices at distance ≤ 2, squaring the spectral gap.

### Step 4: Zig-Zag Product
Combine with constant-degree expander to maintain bounded degree.

### Step 5: Iterate
Repeat squaring and zig-zag until spectral gap is sufficiently large.

### Step 6: Final Exploration
With constant diameter, explore all paths from $s$ in logspace.

---

## References

1. Reingold, O. (2008). "Undirected connectivity in log-space." *Journal of the ACM*, 55(4), 1-24.
2. Rozenman, E., Shalev, A., & Wigderson, A. (2005). "Iterative construction of Cayley expanders."
3. Hoory, S., Linial, N., & Wigderson, A. (2006). "Expander graphs and their applications." *Bulletin of the AMS*, 43(4), 439-561.
