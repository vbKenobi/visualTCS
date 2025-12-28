"""
Pre-built Manim scenes for BFS/DFS visualization
These can be rendered on-demand with different parameters
"""

from manim import *
import networkx as nx

# Default graph structure
DEFAULT_GRAPH = {
    0: [1, 2],
    1: [0, 3, 4],
    2: [0, 5, 6],
    3: [1],
    4: [1],
    5: [2],
    6: [2]
}

DEFAULT_POSITIONS = {
    0: [0, 2, 0],
    1: [-1.5, 1, 0],
    2: [1.5, 1, 0],
    3: [-2.5, 0, 0],
    4: [-0.5, 0, 0],
    5: [0.5, 0, 0],
    6: [2.5, 0, 0]
}


class BFSVisualization(Scene):
    """Animated BFS traversal"""
    
    def construct(self):
        # Title
        title = Text("Breadth-First Search (BFS)", font_size=36)
        title.to_edge(UP)
        self.play(Write(title))
        
        # Create graph visualization
        nodes = {}
        edges = []
        
        for node_id, pos in DEFAULT_POSITIONS.items():
            circle = Circle(radius=0.4, color=BLUE, fill_opacity=0.3)
            circle.move_to(pos)
            label = Text(str(node_id), font_size=24).move_to(pos)
            nodes[node_id] = VGroup(circle, label)
        
        for node, neighbors in DEFAULT_GRAPH.items():
            for neighbor in neighbors:
                if node < neighbor:
                    line = Line(
                        np.array(DEFAULT_POSITIONS[node]),
                        np.array(DEFAULT_POSITIONS[neighbor]),
                        color=GREY
                    )
                    edges.append(line)
        
        # Draw graph
        for edge in edges:
            self.play(Create(edge), run_time=0.2)
        for node in nodes.values():
            self.play(Create(node), run_time=0.2)
        
        self.wait(0.5)
        
        # BFS Algorithm
        from collections import deque
        
        visited = set()
        queue = deque([0])
        visited.add(0)
        
        # Queue visualization
        queue_label = Text("Queue:", font_size=24).to_edge(DOWN).shift(LEFT * 4)
        queue_display = Text("[0]", font_size=24).next_to(queue_label, RIGHT)
        self.play(Write(queue_label), Write(queue_display))
        
        step = 0
        while queue:
            current = queue.popleft()
            step += 1
            
            # Highlight current node
            self.play(
                nodes[current][0].animate.set_fill(ORANGE, opacity=0.8),
                run_time=0.5
            )
            
            # Update queue display
            queue_text = str(list(queue)) if queue else "[]"
            new_display = Text(queue_text, font_size=24).next_to(queue_label, RIGHT)
            self.play(Transform(queue_display, new_display), run_time=0.3)
            
            # Visit neighbors
            for neighbor in sorted(DEFAULT_GRAPH[current]):
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
                    
                    # Highlight discovery
                    self.play(
                        nodes[neighbor][0].animate.set_stroke(YELLOW, width=4),
                        run_time=0.3
                    )
            
            # Mark as visited (green)
            self.play(
                nodes[current][0].animate.set_fill(GREEN, opacity=0.8),
                run_time=0.3
            )
            
            # Update queue display
            queue_text = str(list(queue)) if queue else "[]"
            new_display = Text(queue_text, font_size=24).next_to(queue_label, RIGHT)
            self.play(Transform(queue_display, new_display), run_time=0.3)
        
        # Final message
        complete = Text("BFS Complete!", font_size=32, color=GREEN)
        complete.next_to(title, DOWN)
        self.play(Write(complete))
        self.wait(2)


class DFSVisualization(Scene):
    """Animated DFS traversal"""
    
    def construct(self):
        # Title
        title = Text("Depth-First Search (DFS)", font_size=36)
        title.to_edge(UP)
        self.play(Write(title))
        
        # Create graph visualization
        nodes = {}
        edges = []
        
        for node_id, pos in DEFAULT_POSITIONS.items():
            circle = Circle(radius=0.4, color=BLUE, fill_opacity=0.3)
            circle.move_to(pos)
            label = Text(str(node_id), font_size=24).move_to(pos)
            nodes[node_id] = VGroup(circle, label)
        
        for node, neighbors in DEFAULT_GRAPH.items():
            for neighbor in neighbors:
                if node < neighbor:
                    line = Line(
                        np.array(DEFAULT_POSITIONS[node]),
                        np.array(DEFAULT_POSITIONS[neighbor]),
                        color=GREY
                    )
                    edges.append(line)
        
        # Draw graph
        for edge in edges:
            self.play(Create(edge), run_time=0.2)
        for node in nodes.values():
            self.play(Create(node), run_time=0.2)
        
        self.wait(0.5)
        
        # DFS Algorithm (iterative with stack)
        visited = set()
        stack = [0]
        
        # Stack visualization
        stack_label = Text("Stack:", font_size=24).to_edge(DOWN).shift(LEFT * 4)
        stack_display = Text("[0]", font_size=24).next_to(stack_label, RIGHT)
        self.play(Write(stack_label), Write(stack_display))
        
        while stack:
            current = stack.pop()
            
            if current in visited:
                continue
            
            visited.add(current)
            
            # Highlight current node
            self.play(
                nodes[current][0].animate.set_fill(ORANGE, opacity=0.8),
                run_time=0.5
            )
            
            # Push neighbors (reverse for left-to-right order)
            for neighbor in sorted(DEFAULT_GRAPH[current], reverse=True):
                if neighbor not in visited:
                    stack.append(neighbor)
                    
                    # Highlight pushed node
                    self.play(
                        nodes[neighbor][0].animate.set_stroke(YELLOW, width=4),
                        run_time=0.2
                    )
            
            # Update stack display
            stack_text = str(stack) if stack else "[]"
            new_display = Text(stack_text, font_size=24).next_to(stack_label, RIGHT)
            self.play(Transform(stack_display, new_display), run_time=0.3)
            
            # Mark as visited (green)
            self.play(
                nodes[current][0].animate.set_fill(GREEN, opacity=0.8),
                run_time=0.3
            )
        
        # Final message
        complete = Text("DFS Complete!", font_size=32, color=GREEN)
        complete.next_to(title, DOWN)
        self.play(Write(complete))
        self.wait(2)


class BFSvsDFS(Scene):
    """Side-by-side comparison of BFS and DFS"""
    
    def construct(self):
        # Title
        title = Text("BFS vs DFS Comparison", font_size=40)
        title.to_edge(UP)
        self.play(Write(title))
        
        # Create two graphs side by side
        left_shift = LEFT * 3.5
        right_shift = RIGHT * 3.5
        
        # Labels
        bfs_label = Text("BFS (Queue)", font_size=28, color=BLUE)
        bfs_label.move_to(left_shift + UP * 2)
        
        dfs_label = Text("DFS (Stack)", font_size=28, color=RED)
        dfs_label.move_to(right_shift + UP * 2)
        
        self.play(Write(bfs_label), Write(dfs_label))
        
        # Simplified graph for comparison
        simple_graph = {0: [1, 2], 1: [3], 2: [4]}
        simple_pos = {
            0: [0, 1, 0],
            1: [-1, 0, 0],
            2: [1, 0, 0],
            3: [-1, -1, 0],
            4: [1, -1, 0]
        }
        
        def create_graph(shift):
            nodes = {}
            edges = []
            for node_id, pos in simple_pos.items():
                circle = Circle(radius=0.35, color=WHITE, fill_opacity=0.2)
                circle.move_to(np.array(pos) * 0.8 + shift)
                label = Text(str(node_id), font_size=20).move_to(circle.get_center())
                nodes[node_id] = VGroup(circle, label)
            
            for node, neighbors in simple_graph.items():
                for neighbor in neighbors:
                    line = Line(
                        np.array(simple_pos[node]) * 0.8 + shift,
                        np.array(simple_pos[neighbor]) * 0.8 + shift,
                        color=GREY
                    )
                    edges.append(line)
            
            return nodes, edges
        
        bfs_nodes, bfs_edges = create_graph(left_shift + DOWN * 0.5)
        dfs_nodes, dfs_edges = create_graph(right_shift + DOWN * 0.5)
        
        for e in bfs_edges + dfs_edges:
            self.add(e)
        for n in list(bfs_nodes.values()) + list(dfs_nodes.values()):
            self.add(n)
        
        # Animate both simultaneously
        bfs_order = [0, 1, 2, 3, 4]  # Level by level
        dfs_order = [0, 1, 3, 2, 4]  # Deep first
        
        for i in range(5):
            bfs_node = bfs_order[i]
            dfs_node = dfs_order[i]
            
            self.play(
                bfs_nodes[bfs_node][0].animate.set_fill(BLUE, opacity=0.8),
                dfs_nodes[dfs_node][0].animate.set_fill(RED, opacity=0.8),
                run_time=0.8
            )
            
            # Show order number
            bfs_num = Text(str(i+1), font_size=16, color=WHITE)
            bfs_num.next_to(bfs_nodes[bfs_node], UP, buff=0.1)
            
            dfs_num = Text(str(i+1), font_size=16, color=WHITE)
            dfs_num.next_to(dfs_nodes[dfs_node], UP, buff=0.1)
            
            self.play(Write(bfs_num), Write(dfs_num), run_time=0.3)
        
        self.wait(2)
