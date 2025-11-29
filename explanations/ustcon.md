# USTCON - Undirected s-t Connectivity in Logspace

## Reingold's Algorithm

**Reingold's Algorithm** (2008) solves the undirected s-t connectivity problem using only $O(\log n)$ space, settling a major open problem in computational complexity theory.

### The Problem

Given an undirected graph $G = (V, E)$ and two vertices $s, t \in V$, determine whether there exists a path from $s$ to $t$.

**Space Constraint:** Use only $O(\log n)$ bits of memory, where $n = |V|$.

---

## Key Concepts

### 1. Graph Products

#### Graph Squaring
The square of a graph $G^2$ connects vertices that are at distance at most 2 in $G$:

$$G^2 = (V, E') \text{ where } (u,v) \in E' \iff d_G(u,v) \leq 2$$

**Property:** Squaring reduces the diameter: $\text{diam}(G^2) \leq \lceil \text{diam}(G)/2 \rceil$

#### Zig-Zag Product
The zig-zag product $G \circledast H$ is a graph operation that:
- Takes a large graph $G$ with degree $D$ 
- Combines it with a small constant-degree expander $H$ on $D$ vertices
- Produces a graph with similar expansion but constant degree

---

## The Algorithm

### High-Level Strategy

1. **Input:** Graph $G$, vertices $s, t$
2. **Make Regular:** Transform $G$ into a regular graph $G'$
3. **Reduce to Expander:** Apply a sequence of:
   - Squaring operations (reduce diameter)
   - Zig-zag products (maintain constant degree)
4. **Result:** Graph with constant diameter
5. **Walk:** Explore all vertices from $s$ in constant space

### Transformation Steps

```
G → [Make Regular] → G₁
G₁ → [Square] → G₁²
G₁² → [Zig-Zag with H] → G₂
G₂ → [Square] → G₂²
G₂² → [Zig-Zag with H] → G₃
...
Gₖ → [Constant diameter] → Explore from s
```

### Space Analysis

At each step, we only need to store:
- Current vertex position: $O(\log n)$ bits
- Step counter: $O(\log \text{diam})$ bits
- Constant-size rotation map: $O(1)$ bits

**Total:** $O(\log n)$ space

---

## Graph Expanders

An **expander graph** is a sparse graph with strong connectivity properties. For every subset $S \subseteq V$:

$$|N(S)| \geq c \cdot |S|$$

where $N(S)$ is the neighborhood of $S$ and $c > 1$ is the expansion constant.

### Properties
- **High connectivity** despite low degree
- **Fast mixing** of random walks
- **Small diameter:** $O(\log n)$

---

## Rotation Maps

A **rotation map** $\text{Rot}: V \times [d] \to V \times [d]$ describes edges in a $d$-regular graph:

$$\text{Rot}(v, i) = (u, j)$$

means the $i$-th edge from $v$ leads to $u$, and this edge is the $j$-th edge from $u$.

**Space Efficient:** Can be represented implicitly for product graphs!

---

## Complexity Results

| Problem | Deterministic | Randomized |
|---------|--------------|------------|
| USTCON | $O(\log n)$ space (Reingold, 2008) | $O(\log n)$ space (trivial) |
| STCON (directed) | $O(\log^2 n)$ space | $O(\log n)$ space |

### Significance

Before Reingold's result, it was unknown whether **L = SL** (deterministic vs. symmetric logspace). Reingold proved:

$$\text{USTCON} \in \mathbf{L}$$

Therefore: **L = SL**

---

## Visualization Guide

### Step 1: Initial Graph
Your input graph with source (green) and target (red) marked.

### Step 2: Make Regular
Convert to a regular graph by adding self-loops.

### Step 3: Graph Squaring
Connect vertices at distance ≤ 2.

### Step 4: Zig-Zag Product
Combine with expander to maintain constant degree.

### Step 5: Final Graph
After iterations, we have a constant-diameter graph that can be explored in logspace.

---

## References

1. Reingold, O. (2008). "Undirected connectivity in log-space." *Journal of the ACM*, 55(4), 1-24.
2. Hoory, S., Linial, N., & Wigderson, A. (2006). "Expander graphs and their applications." *Bulletin of the AMS*, 43(4), 439-561.
