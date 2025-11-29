// bfsAndDfsPage.js
// ----------------------------------------------------
// Page-specific functionality for BFS and DFS visualizer
// Handles code tab switching and other UI interactions

// Code tab switching
document.addEventListener('DOMContentLoaded', () => {
    const codeTabs = document.querySelectorAll('.code-tab');
    const codeContents = document.querySelectorAll('.code-content');

    codeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');

            // Remove active class from all tabs and contents
            codeTabs.forEach(t => t.classList.remove('active'));
            codeContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const targetContent = document.getElementById(`${targetTab}-code`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
});
