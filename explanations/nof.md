# NOF Complexity & Behrend's Construction

## Introduction: The Erdős-Turán Problem

In 1936, Erdős and Turán posed a fundamental question:

> *How large a set can we pick from $\{1, \ldots, N\}$ such that no three numbers $a, b, c$ form an arithmetic progression ($a + c = 2b$), i.e., no three numbers are equally spaced?*

We only consider **non-trivial progressions** where $a \neq b \neq c$.

### Definition
Let $r_3(N)$ denote the maximum size of a set $S \subseteq [N]$ that is **3-AP free** (contains no arithmetic progression of length 3).

---

## Constructing 3-AP Free Sets

### Greedy Approach (Computer Science)
Keep choosing elements that don't form a 3-AP with existing elements:
$$\{1, 2, \_, 4, 5, \_, \_, \_, \_, 10, \dots\}$$

This yields roughly $N^{0.6+c}$ terms.

### Random Set Approach (Combinatorics)
Include each element $i$ in $S$ with probability $p$.

- There are approximately $N^2$ potential 3-APs
- A triple $(a,b,c) \in S$ with probability $p^3$
- Expected 3-APs in $S$: $\leq p^3 \cdot N^2$

Setting $p = N^{-1/3}$ gives expected trivial 3-APs only, so $|S| \approx N^{2/3}$.

---

## Historical Progress on Upper Bounds

| Year | Authors | Bound |
|------|---------|-------|
| 1953 | Roth | $r_3(N) \lesssim \frac{N}{\log \log N}$ |
| 1987-90 | Heath-Brown, Szemerédi | $r_3(N) \leq \frac{N}{(\log N)^c}$ |
| 1999, 2008 | Bourgain | $r_3(N) \leq \frac{N}{(\log N)^{2/3}}$ |
| 2011 | Sanders | $r_3(N) \leq \frac{N(\log \log N)^6}{\log N}$ |
| 2020 | Bloom-Sisask | $r_3(N) \leq \frac{N}{(\log N)^{1+c}}$ |
| 2023 | Kelley-Meka | $r_3(N) \leq \frac{N}{2^{c(\log N)^{1/12}}}$ |

**Corollary (Bloom-Sisask 2020):** The set of prime numbers contains non-trivial 3-term arithmetic progressions.

The Kelley-Meka result suggests that Behrend's construction may give the right lower bound.

---

## Behrend's Construction

### Key Insight: Spheres Avoid 3-APs

Consider a circle in 2D. If points $a, b$ lie on the perimeter, then their midpoint $\frac{a+b}{2}$ lies **inside** the circle (unless $a = b$).

### Unit Spheres
The unit sphere in $d$ dimensions:
$$\mathbb{S}^{d-1} = \{(x_1, \ldots, x_d) : \sum_{i=1}^d x_i^2 = 1\}$$

contains no distinct points $x, y, z$ such that $x + y = 2z$.

**Why?** The midpoint of any two points on the sphere lies in the interior.

### The Construction

**Step 1: Define the lattice points**

Fix range $k$ and dimension $d$. Let $S = [k]^d = \{1, \ldots, k\}^d$.

**Step 2: Take a spherical shell**

Define $S_R = \{x \in [k]^d : x_1^2 + x_2^2 + \cdots + x_d^2 = R\}$

All points on a sphere of radius $\sqrt{R}$ — this set has no 3-APs!

**Step 3: Find a good radius**

**Lemma:** $\exists\; R \leq k^2 d$ such that $|S_R| \geq \frac{k^d}{k^2 \cdot d}$

*Proof:* The set $[k]^d$ has $k^d$ points. For any $x$, we have $\sum x_i^2 \leq d \cdot k^2$. By pigeonhole, some sphere shell must contain at least $\frac{k^d}{dk^2}$ points. $\square$

**Step 4: Map to integers**

**Lemma:** There exists $f: S_R \to \mathbb{Z}$ such that:
$$f(x) + f(y) = 2f(z) \iff x + y = 2z$$

*Construction:* Use base-$(2k+1)$ representation:
$$f(x) = \sum_{i=1}^d x_i \cdot (2k+1)^{i-1}$$

*Why it works:* Since each $x_i \leq k$, we have $x_i + y_i \leq 2k < 2k+1$, so there's no carry-over in the base-$(2k+1)$ arithmetic.

**Step 5: Bound the range**

$$f(x) \leq \sum_{i=1}^d k(2k+1)^{i-1} \leq (2k+1)^d = N$$

**Step 6: Optimize parameters**

Setting $2k+1 = 2^{\sqrt{\log N}}$ and $d = \sqrt{\log N}$:

$$|S_R| \geq \frac{N}{2^{c\sqrt{\log N}}}$$

This matches the greedy approach asymptotically!

---

## Number on Forehead (NOF) Communication Complexity

### Background: Checksum Function

Recall the equality function between two parties. The **Checksum** function generalizes this:

$$\text{CSum}(x, y) = \begin{cases} 1 & \text{if } x + y = N \\ 0 & \text{otherwise} \end{cases}$$

For two parties, communication complexity is $\Theta(\log N)$.

### Three-Party Communication

With three parties (Alice, Bob, Charlie) each holding an input, we ask:
$$\text{CSum}(x, y, z) = \begin{cases} 1 & \text{if } x + y + z = N \\ 0 & \text{otherwise} \end{cases}$$

Standard 3-party communication still requires $\Theta(\log N)$ bits.

### The Number on Forehead Model

**Setup:** Each party's input is written on their "forehead" — they can see everyone else's input but not their own!

- **Alice** has input $x$, sees $y, z$
- **Bob** has input $y$, sees $x, z$  
- **Charlie** has input $z$, sees $x, y$

This model captures scenarios with **shared information** — can we exploit redundancy?

### Definition (Chandra-Furst-Lipton, 1983)
$$\text{NOF}(f) = \text{minimum bits needed to compute } f \text{ in a NOF protocol}$$

---

## NOF Complexity of Checksum

### Main Theorem (CFL83)

$$\text{NOF(CSum)} \leq \log\left(\frac{N}{r_3(N)}\right)$$

Using Behrend's construction:
$$\text{NOF(CSum)} \leq O(\sqrt{\log N})$$

**Qualitative insight:** If $\text{NOF(CSum)} = \omega(1)$, then constant-density sets contain 3-APs (Roth's theorem).

### The Protocol

**Key Tool:** A coloring $\chi: [N] \to [\Delta_N]$ with no monochromatic 3-AP.

By Behrend's construction: $\exists$ coloring $\chi: [N] \to [2^{c\sqrt{\log N}}]$ with no monochromatic 3-AP.

**Connection:** The number of colors satisfies:
$$\frac{N}{\Delta_N} \leq r_3(N) \leq O\left(\frac{N \log N}{\Delta_N}\right)$$

### Protocol Steps

To check if $x + y + z = N$, let $d = x + y + z - N$.

Each party computes a value (shifted by $3N$ to ensure positivity):

| Party | Computes | Can compute because... |
|-------|----------|----------------------|
| Alice | $3N - y - 2z$ | Doesn't depend on $x$ |
| Bob | $2N + x - z$ | Equals $3N - y - 2z + d$ |
| Charlie | $N + 2x + y$ | Equals $3N - y - 2z + 2d$ |

Each party announces the **color** of their computed value.

### Why It Works

**Case 1: $x + y + z = N$ (checksum is 1)**
- Then $d = 0$
- All three parties compute the **same number**
- Same number $\Rightarrow$ same color announced

**Case 2: $x + y + z \neq N$ (checksum is 0)**
- Then $d \neq 0$
- The three computed values form a **non-trivial 3-AP** (differing by $d$)
- No monochromatic 3-AP $\Rightarrow$ **different colors** announced

### Communication Cost

Each party sends one color: $\log_2(2^{c\sqrt{\log N}}) = O(\sqrt{\log N})$ bits.

**Total:** $O(\sqrt{\log N})$ bits of communication!

---

## Summary

| Concept | Result |
|---------|--------|
| 3-AP free set size | $r_3(N) \geq \frac{N}{2^{c\sqrt{\log N}}}$ (Behrend) |
| Best upper bound | $r_3(N) \leq \frac{N}{2^{c(\log N)^{1/12}}}$ (Kelley-Meka) |
| NOF(Checksum) | $O(\sqrt{\log N})$ bits |
| Standard CC(Checksum) | $\Theta(\log N)$ bits |

---

## Visualization Guide

### Behrend's Construction Demo

1. **Circle Phase:** See how midpoints of circle points lie inside
2. **Sphere Shell:** Lattice points on a sphere in $d$ dimensions
3. **Mapping:** Base-$(2k+1)$ encoding to integers
4. **Result:** Large 3-AP free set

### NOF Protocol Demo

1. **Setup:** Alice, Bob, Charlie with inputs on foreheads
2. **Visibility:** Each sees others' inputs, not their own
3. **Coloring:** 3-AP free coloring of $[N]$
4. **Computation:** Each party computes their value
5. **Comparison:** Compare announced colors
6. **Result:** Same color iff checksum equals target

---

## Applications

3-AP free sets and NOF complexity connect to:

- **Parallel Repetition:** Analyzing repeated games
- **Structure vs Randomness:** Fundamental dichotomy in combinatorics
- **Polynomial Method:** Powerful technique with broad applications
- **Circuit Lower Bounds:** Understanding computational limits

---

## References

1. Behrend, F. A. (1946). "On sets of integers which contain no three terms in arithmetical progression."
2. Chandra, A. K., Furst, M. L., & Lipton, R. J. (1983). "Multi-party protocols."
3. Bloom, T. F., & Sisask, O. (2020). "Breaking the logarithmic barrier in Roth's theorem."
4. Kelley, Z., & Meka, R. (2023). "Strong bounds for 3-progressions."
