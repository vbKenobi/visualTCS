// Markdown Loader Utility
// Handles loading and rendering markdown files with KaTeX math support

export async function loadMarkdown(filePath, targetElementId) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const markdown = await response.text();
        
        // Configure marked for GitHub-flavored markdown
        if (typeof marked !== 'undefined') {
            marked.setOptions({
                breaks: true,
                gfm: true,
                headerIds: true,
                mangle: false
            });
            
            const html = marked.parse(markdown);
            const targetElement = document.getElementById(targetElementId);
            
            if (targetElement) {
                targetElement.innerHTML = html;
                
                // Render math with KaTeX if available
                if (typeof renderMathInElement !== 'undefined') {
                    renderMathInElement(targetElement, {
                        delimiters: [
                            {left: '$$', right: '$$', display: true},
                            {left: '$', right: '$', display: false},
                            {left: '\\[', right: '\\]', display: true},
                            {left: '\\(', right: '\\)', display: false}
                        ],
                        throwOnError: false,
                        strict: false
                    });
                }
            }
            
            return true;
        } else {
            throw new Error('Marked library not loaded');
        }
    } catch (error) {
        console.error('Error loading markdown:', error);
        const targetElement = document.getElementById(targetElementId);
        if (targetElement) {
            targetElement.innerHTML = `
                <div style="padding: 20px; background-color: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; border-radius: 8px;">
                    <h3 style="color: #ef4444; margin-bottom: 10px;">⚠️ Error Loading Explanation</h3>
                    <p style="color: #8b949e; font-size: 14px; margin-bottom: 8px;">
                        Could not load the markdown file: <code style="background-color: #161b22; padding: 2px 6px; border-radius: 4px;">${filePath}</code>
                    </p>
                    <p style="color: #8b949e; font-size: 13px;">
                        <strong>Possible solutions:</strong><br>
                        • Make sure you're running this through a local server (not file://)<br>
                        • Check that the markdown file exists in the correct location<br>
                        • Try running: <code style="background-color: #161b22; padding: 2px 6px; border-radius: 4px;">python3 -m http.server 8000</code>
                    </p>
                    <details style="margin-top: 10px;">
                        <summary style="cursor: pointer; color: #00ffff;">View Error Details</summary>
                        <pre style="margin-top: 8px; padding: 10px; background-color: #0d1117; border-radius: 4px; overflow-x: auto; font-size: 12px;">${error.message}</pre>
                    </details>
                </div>
            `;
        }
        return false;
    }
}

export function toggleExplanationPanel() {
    const panel = document.getElementById('explanationPanel');
    if (panel) {
        panel.classList.toggle('expanded');
    }
}
