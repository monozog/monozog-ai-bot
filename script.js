// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const promptInput = document.getElementById('promptInput');
const generateBtn = document.getElementById('generateBtn');
const loadingAnimation = document.getElementById('loadingAnimation');

// Initialize marked options
marked.setOptions({
    breaks: true,
    gfm: true
});

// API Configuration
const API_KEY = import.meta.env.VITE_API_KEY;
const API_URL = 'https://api.monozogi.com/v1/chat/completions';

// Presets data
const presets = [
    { id: 'photography', name: 'Photography Portfolio' },
    { id: 'webDev', name: 'Web Developer Portfolio' },
    { id: 'graphicDesign', name: 'Graphic Design Portfolio' },
    { id: 'digitalArt', name: 'Digital Art Portfolio' },
    { id: 'architecture', name: 'Architecture Portfolio' },
    { id: 'uxDesign', name: 'UX Designer Portfolio' },
    { id: 'videoProduction', name: 'Video Production Portfolio' },
    { id: 'writer', name: 'Writer Portfolio' },
    { id: 'musician', name: 'Musician Portfolio' },
    { id: 'custom', name: 'Custom Portfolio' }
];

// Create and append preset buttons
function createPresetButtons() {
    const presetsContainer = document.createElement('div');
    presetsContainer.className = 'preset-buttons';
    
    presets.forEach((preset, index) => {
        const button = document.createElement('button');
        button.className = 'preset-button';
        button.setAttribute('data-preset', preset.id);
        
        button.innerHTML = `
            <div class="preset-number">${index + 1}</div>
            <div class="preset-name">${preset.name}</div>
        `;
        
        button.addEventListener('click', () => handlePresetClick(preset));
        presetsContainer.appendChild(button);
    });
    
    chatMessages.appendChild(presetsContainer);
}

// Handle preset button click
function handlePresetClick(preset) {
    const prompt = `Create a ${preset.name.toLowerCase()} that showcases my work and skills.`;
    promptInput.value = prompt;
    handleSubmit();
}

// Create Portfolio Puppy
function createPortfolioPuppy() {
    const puppy = document.createElement('div');
    puppy.className = 'portfolio-puppy';
    
    const avatar = document.createElement('div');
    avatar.className = 'puppy-avatar';
    
    const img = document.createElement('img');
    img.src = 'puppy.gif';
    img.alt = 'Portfolio Puppy';
    
    avatar.appendChild(img);
    puppy.appendChild(avatar);
    
    const chatWindow = document.createElement('div');
    chatWindow.className = 'puppy-chat-window';
    chatWindow.style.display = 'none';
    
    chatWindow.innerHTML = `
        <div class="puppy-header">
            <h3>Portfolio Puppy</h3>
            <button class="close-puppy-btn">&times;</button>
        </div>
        <div class="puppy-messages">
            <div class="puppy-message">
                <div class="puppy-message-content">
                    Hi! I'm Portfolio Puppy! I'll help you create an amazing portfolio. 
                    Click the presets above or tell me what kind of portfolio you'd like to create!
                </div>
            </div>
        </div>
        <div class="puppy-input-container">
            <input type="text" class="puppy-input" placeholder="Ask me anything...">
            <button class="puppy-send-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
            </button>
        </div>
    `;
    
    puppy.appendChild(chatWindow);
    document.body.appendChild(puppy);
    
    // Event Listeners
    avatar.addEventListener('click', () => {
        chatWindow.style.display = chatWindow.style.display === 'none' ? 'flex' : 'none';
        if (chatWindow.style.display === 'flex') {
            avatar.classList.add('attention');
            setTimeout(() => avatar.classList.remove('attention'), 3000);
        }
    });
    
    const closeBtn = chatWindow.querySelector('.close-puppy-btn');
    closeBtn.addEventListener('click', () => {
        chatWindow.style.display = 'none';
    });
    
    const puppyInput = chatWindow.querySelector('.puppy-input');
    const puppySendBtn = chatWindow.querySelector('.puppy-send-btn');
    
    async function handlePuppyMessage() {
        const message = puppyInput.value.trim();
        if (!message) return;
        
        // Add user message
        const userMessage = document.createElement('div');
        userMessage.className = 'puppy-message user';
        userMessage.innerHTML = `<div class="puppy-message-content">${message}</div>`;
        chatWindow.querySelector('.puppy-messages').appendChild(userMessage);
        
        // Clear input
        puppyInput.value = '';
        
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: message }]
                })
            });

            const data = await response.json();
            const botResponse = data.choices[0].message.content;

            const botMessage = document.createElement('div');
            botMessage.className = 'puppy-message';
            botMessage.innerHTML = `
                <div class="puppy-message-content">
                    ${DOMPurify.sanitize(marked.parse(botResponse))}
                </div>
            `;
            chatWindow.querySelector('.puppy-messages').appendChild(botMessage);
        } catch (error) {
            console.error('Error:', error);
            const errorMessage = document.createElement('div');
            errorMessage.className = 'puppy-message';
            errorMessage.innerHTML = `
                <div class="puppy-message-content">
                    Sorry, I encountered an error. Please try again later.
                </div>
            `;
            chatWindow.querySelector('.puppy-messages').appendChild(errorMessage);
        }
        
        // Scroll to bottom
        const messages = chatWindow.querySelector('.puppy-messages');
        messages.scrollTop = messages.scrollHeight;
    }
    
    puppySendBtn.addEventListener('click', handlePuppyMessage);
    puppyInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handlePuppyMessage();
    });
}

// Auto-resize textarea
promptInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// Handle form submission
generateBtn.addEventListener('click', handleSubmit);
promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
    }
});

async function handleSubmit() {
    const prompt = promptInput.value.trim();
    if (!prompt) return;

    // Add user message
    addMessage(prompt, 'user');
    
    // Clear input
    promptInput.value = '';
    promptInput.style.height = 'auto';

    // Show loading animation
    loadingAnimation.classList.add('active');

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                messages: [{ role: 'user', content: prompt }]
            })
        });

        const data = await response.json();
        addMessage(data.choices[0].message.content, 'bot');
    } catch (error) {
        console.error('Error:', error);
        addMessage('Sorry, I encountered an error. Please try again later.', 'bot');
    } finally {
        loadingAnimation.classList.remove('active');
    }
}

function addMessage(content, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    
    // Add appropriate icon based on message type
    if (type === 'user') {
        avatarDiv.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
        `;
    } else {
        avatarDiv.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a8 8 0 0 0-8 8c0 1.892.402 3.13 1.5 4.5L12 22l6.5-7.5c1.098-1.37 1.5-2.608 1.5-4.5a8 8 0 0 0-8-8z"></path>
            </svg>
        `;
    }

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // Parse markdown for bot messages
    if (type === 'bot') {
        const sanitizedContent = DOMPurify.sanitize(marked.parse(content));
        contentDiv.innerHTML = sanitizedContent;
    } else {
        contentDiv.textContent = content;
    }

    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    createPresetButtons();
    createPortfolioPuppy();
});