# Graph Traversal Algorithms

## Breadth-First Search (BFS)

**Breadth-First Search** is a graph traversal algorithm that explores all vertices at the present depth level before moving on to vertices at the next depth level.

### Algorithm

Starting from a source vertex $s$:
1. Initialize a queue $Q$ with $s$
2. Mark $s$ as visited
3. While $Q$ is not empty:
   - Dequeue vertex $v$ from $Q$
   - For each unvisited neighbor $u$ of $v$:
     - Mark $u$ as visited
     - Enqueue $u$ into $Q$

### Time Complexity

- **Time:** $O(V + E)$ where $V$ is the number of vertices and $E$ is the number of edges
- **Space:** $O(V)$ for the queue and visited array

### Properties

- Finds **shortest path** in unweighted graphs
- Explores nodes **level by level**
- Uses a **queue** data structure

---

## Depth-First Search (DFS)

**Depth-First Search** is a graph traversal algorithm that explores as far as possible along each branch before backtracking.

### Algorithm

Starting from a source vertex $s$:
1. Initialize a stack $S$ with $s$ (or use recursion)
2. Mark $s$ as visited
3. While $S$ is not empty:
   - Pop vertex $v$ from $S$
   - For each unvisited neighbor $u$ of $v$:
     - Mark $u$ as visited
     - Push $u$ onto $S$

### Recursive Implementation

```python
def dfs(graph, vertex, visited):
    visited[vertex] = True
    for neighbor in graph[vertex]:
        if not visited[neighbor]:
            dfs(graph, neighbor, visited)
```

### Time Complexity

- **Time:** $O(V + E)$
- **Space:** $O(V)$ for the stack and visited array

### Properties

- Explores **deep** before exploring **wide**
- Uses a **stack** data structure (or recursion)
- Useful for cycle detection, topological sorting, and pathfinding

---

## Comparison

| Feature | BFS | DFS |
|---------|-----|-----|
| Data Structure | Queue | Stack/Recursion |
| Path Found | Shortest | Any path |
| Exploration | Level by level | Deep first |
| Memory | Higher (stores level) | Lower (stores path) |

---

## Applications

### BFS Applications
- Shortest path in unweighted graphs
- Web crawlers
- Social network analysis (friend recommendations)
- GPS navigation

### DFS Applications
- Cycle detection
- Topological sorting
- Maze solving
- Puzzle games (like Sudoku)
