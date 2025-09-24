

// A Set to keep track of the prompts we've already indexed
const indexedPrompts = new Set();

// Function to inject the sidebar and toggle button
function injectUI() {
    // Check if the sidebar already exists to prevent duplicates
    if (document.getElementById('prompt-indexer-sidebar')) {
        return;
    }

    // Inject the HTML for the toggle button
    document.body.insertAdjacentHTML('beforeend', `
        <button id="toggle-sidebar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="3" y1="15" x2="21" x2="15"></line>
                <line x1="9" y1="3" x2="9" y2="21"></line>
            </svg>
        </button>
    `);

    // Inject the HTML for the sidebar and its contents
    document.body.insertAdjacentHTML('beforeend', `
        <div id="prompt-indexer-sidebar">
            <h3>Prompts Index</h3>
            <button id="load-all-button">Load All Prompts</button>
            <ul id="prompt-list"></ul>
        </div>
    `);
}

// Function to find the main chat container
function getChatContainer() {
    return document.querySelector('infinite-scroller.chat-history');
}

// Function to extract prompts and build the index list
function buildIndex() {
    const chatContainer = getChatContainer();
    if (!chatContainer) {
        return;
    }

    const promptListElement = document.getElementById('prompt-list');
    
    const userPromptElements = chatContainer.querySelectorAll('div[id^="user-query-content-"]');
    
    userPromptElements.forEach((queryTextElement) => {
        const promptId = queryTextElement.id;

        if (promptId && !indexedPrompts.has(promptId)) {
            const promptText = queryTextElement.textContent?.trim();

            if (promptText) {
                const truncatedText = promptText.length > 25 
                    ? promptText.substring(0, 35) + '...' 
                    : promptText;

                const listItem = document.createElement('li');
                listItem.textContent = truncatedText;
                
                listItem.addEventListener('click', () => {
                    queryTextElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                });
                
                promptListElement.appendChild(listItem);
                indexedPrompts.add(promptId);
            }
        }
    });
}

// Initial setup
function initialize() {
    injectUI();

    const sidebar = document.getElementById('prompt-indexer-sidebar');
    const toggleButton = document.getElementById('toggle-sidebar');
    const chatContainer = getChatContainer();
    const loadAllButton = document.getElementById('load-all-button');
    
    // a robust retry mechanism to ensure all elements are found
    if (toggleButton && sidebar && chatContainer && loadAllButton) {
        toggleButton.addEventListener('click', () => {
            sidebar.classList.toggle('visible');
        });

        loadAllButton.addEventListener('click', () => {
            chatContainer.scrollTop = 0;
        });

        buildIndex();

        const observer = new MutationObserver(() => {
            buildIndex();
        });

        observer.observe(chatContainer, { childList: true, subtree: true });
    } else {
        setTimeout(initialize, 250);
    }
}

// Run the initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}