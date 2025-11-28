async function computePath() {
    const res = await fetch("https://vbkenobi.pythonanywhere.com/shortest-path", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nodes: [1, 2, 3, 4],
        edges: [[1, 2], [2, 3], [3, 4]],
        start: 1,
        end: 4,
      }),
    });
  
    const data = await res.json();
    alert("Shortest path: " + data.path.join(" → "));
  }