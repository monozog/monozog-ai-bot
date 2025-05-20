const API_KEY = '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';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Add puppy helper constants and variables
const PUPPY_MODEL ="meta-llama/llama-3.3-8b-instruct:free";
let puppyConversationHistory = [
    {
        role: 'assistant',
        content: `Hi there! I'm Portfolio Puppy! I can help you learn about portfolios. Ask me anything!`
    }
];
let isPuppyProcessing = false;

// Store taglines that have been shown to avoid repetition
let shownTaglines = new Set();
// Portfolio generation taglines
const waitingTaglines = [
    "Crafting your digital masterpiece...",
    "Building your online presence, pixel by pixel...",
    "Turning your vision into digital reality...",
    "Designing a portfolio as unique as your journey...",
    "Weaving code and creativity together...",
    "Architecting your professional story...",
    "Transforming ideas into interactive experiences...",
    "Curating your digital showcase with care...",
    "Bringing your portfolio to life with modern flair...",
    "Coding your professional narrative...",
    "Creating a digital experience that stands out...",
    "Assembling your creative legacy...",
    "Designing your digital footprint...",
    "Just a moment while we build something amazing...",
    "Polishing your digital presence to perfection...",
    "Crafting code that tells your story...",
    "Your portfolio is taking shape...",
    "Great portfolios take time, almost there...",
    "Brewing digital excellence just for you...",
    "Infusing your portfolio with creative energy...",
    "Hang tight, your masterpiece is loading...",
    "Preparing to wow your future clients...",
    "Building something worth waiting for...",
    "Turning your achievements into digital art...",
    "Perfecting every pixel of your portfolio..."
];

// Portfolio presets that users can choose from
const portfolioPresets = {
    photography: {
        name: "Photography Portfolio",
        description: "Stunning visual showcase with parallax effects, image galleries, and smooth transitions",
        features: ["3D image galleries", "Parallax scrolling", "Cinematic transitions", "Dynamic lighting effects"]
    },
    webDev: {
        name: "Web Developer Portfolio",
        description: "Interactive code-focused portfolio with animated project showcases and skill visualizations",
        features: ["Animated code snippets", "3D project displays", "Interactive skill graph", "Particle background"]
    },
    graphicDesign: {
        name: "Graphic Design Portfolio",
        description: "Creative showcase with morphing shapes and artistic transitions between projects",
        features: ["Morphing animations", "Color palette showcases", "Interactive project displays", "Creative transitions"]
    },
    digitalArt: {
        name: "Digital Artist Portfolio",
        description: "Immersive gallery with canvas animations and interactive artwork displays",
        features: ["Canvas animations", "Interactive galleries", "Artwork zoom features", "Creative transitions"]
    },
    architecture: {
        name: "Architecture Portfolio",
        description: "Sophisticated showcase with 3D building models and project walkthroughs",
        features: ["3D building models", "Project walkthroughs", "Blueprint animations", "Material showcases"]
    },
    custom: {
        name: "Custom Portfolio",
        description: "Create a completely custom design tailored to your specific needs and preferences",
        features: ["Fully customizable", "Unique animations", "Personalized sections", "Custom interactions"]
    },
    uxDesign: {
        name: "UX/UI Design Portfolio",
        description: "Interactive showcase of user interfaces, wireframes, and design process",
        features: ["Interactive prototypes", "User flow animations", "Case study layouts", "Design process timelines"]
    },
    videoProduction: {
        name: "Video Production Portfolio",
        description: "Dynamic showcase with video backgrounds, showreels, and cinematic effects",
        features: ["Video backgrounds", "Showreel integration", "Cinematic transitions", "Project timelines"]
    },
    writer: {
        name: "Writer's Portfolio",
        description: "Elegant showcase of written works with animated page turns and typography effects",
        features: ["Animated page turns", "Typography animations", "Reading time indicators", "Publication showcases"]
    },
    musician: {
        name: "Musician Portfolio",
        description: "Audio-visual experience with integrated music player and visualizations",
        features: ["Integrated music player", "Audio visualizations", "Concert timeline", "Discography showcase"]
    }
};

// Update conversation starter to include preset buttons
let conversationHistory = [
    {
        role: 'assistant',
        content: `Welcome to Portfolio Generator! I'll help you create a stunning, animated portfolio website with exceptional 3D elements and artistic transitions.

Choose from these presets or create a custom portfolio:
1. Photography Portfolio - Stunning visual showcase with parallax effects
2. Web Developer Portfolio - Interactive code-focused portfolio with animated projects
3. Graphic Design Portfolio - Creative showcase with morphing shapes and transitions
4. Digital Artist Portfolio - Immersive gallery with canvas animations
5. Architecture Portfolio - Sophisticated showcase with 3D building models
6. UX/UI Design Portfolio - Interactive showcase of user interfaces and design process
7. Video Production Portfolio - Dynamic showcase with video backgrounds and showreels
8. Writer's Portfolio - Elegant showcase with typography effects
9. Musician Portfolio - Audio-visual experience with integrated music player
10. Custom Portfolio - Create a completely custom design

What type of portfolio would you like to create?`
    }
];

let loaderInterval = null;
let taglineInterval = null;
const loaderStyles = [
    'loader-dots',
    'loader-bars',
    'loader-ring',
    'loader-blob'
];
let currentLoader = 0;

function startDynamicLoader() {
    loadingAnimation.classList.add('active');
    const styleDivs = loadingAnimation.querySelectorAll('.loader-style');
    styleDivs.forEach(div => div.classList.remove('active'));
    styleDivs[0].classList.add('active');
    currentLoader = 0;
    
    // Show initial tagline
    showRandomTagline();
    
    // Change loader style every second
    loaderInterval = setInterval(() => {
        styleDivs.forEach(div => div.classList.remove('active'));
        currentLoader = (currentLoader + 1) % loaderStyles.length;
        loadingAnimation.querySelector('.' + loaderStyles[currentLoader]).classList.add('active');
    }, 1000);
    
    // Change tagline every 4 seconds
    taglineInterval = setInterval(() => {
        showRandomTagline();
    }, 4000);
}

function showRandomTagline() {
    // Get available taglines (ones not shown yet)
    const availableTaglines = waitingTaglines.filter(tagline => !shownTaglines.has(tagline));
    
    // If all taglines have been shown, reset the set
    if (availableTaglines.length === 0) {
        shownTaglines.clear();
        availableTaglines.push(...waitingTaglines);
    }
    
    // Select a random tagline
    const randomIndex = Math.floor(Math.random() * availableTaglines.length);
    const selectedTagline = availableTaglines[randomIndex];
    
    // Add to shown taglines
    shownTaglines.add(selectedTagline);
    
    // Update the loading animation with the tagline
    const taglineElement = document.createElement('div');
    taglineElement.className = 'loader-tagline';
    taglineElement.textContent = selectedTagline;
    
    // Remove any existing tagline
    const existingTagline = loadingAnimation.querySelector('.loader-tagline');
    if (existingTagline) {
        loadingAnimation.removeChild(existingTagline);
    }
    
    loadingAnimation.appendChild(taglineElement);
}

function stopDynamicLoader() {
    loadingAnimation.classList.remove('active');
    clearInterval(loaderInterval);
    clearInterval(taglineInterval);
    loaderInterval = null;
    taglineInterval = null;
    const styleDivs = loadingAnimation.querySelectorAll('.loader-style');
    styleDivs.forEach(div => div.classList.remove('active'));
    // Reset to default for next time
    loadingAnimation.querySelector('.loader-dots').classList.add('active');
}

// Function to add a message to the chat
function addMessage(content, isUser = false, streaming = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
    
    if (!isUser) {
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a8 8 0 0 0-8 8c0 1.892.402 3.13 1.5 4.5L12 22l6.5-7.5c1.098-1.37 1.5-2.608 1.5-4.5a8 8 0 0 0-8-8z"></path>
            </svg>
        `;
        messageDiv.appendChild(avatarDiv);
    }
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    if (!isUser && streaming) {
        messageContent.innerHTML = '';
    } else if (!isUser) {
        messageContent.innerHTML = DOMPurify.sanitize(marked.parse(content));
    } else {
        messageContent.textContent = content;
    }
    messageDiv.appendChild(messageContent);

    // Add response actions for bot messages (copy/download)
    if (!isUser && !streaming) {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'response-actions';
        
        // Store the original content for copy/download
        messageDiv.dataset.originalContent = content;
        
        // Copy button
        const copyBtn = document.createElement('button');
        copyBtn.className = 'response-action-btn copy-btn';
        copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="9" y="9" width="13" height="13" rx="2" stroke-width="2"/><rect x="3" y="3" width="13" height="13" rx="2" stroke-width="2"/></svg> Copy`;
        copyBtn.onclick = function() {
            const textToCopy = this.closest('.message').dataset.originalContent;
            const textArea = document.createElement('textarea');
            textArea.value = textToCopy;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            const originalHTML = this.innerHTML;
            this.innerHTML = 'Copied!';
            setTimeout(() => {
                this.innerHTML = originalHTML;
            }, 1200);
        };
        
        // Download button
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'response-action-btn download-btn';
        downloadBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 16v-8m0 8l-4-4m4 4l4-4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="4" y="4" width="16" height="16" rx="2" stroke-width="2"/></svg> PDF`;
        downloadBtn.onclick = function() {
            const textToDownload = this.closest('.message').dataset.originalContent;
            generatePDF(textToDownload);
        };
        
        actionsDiv.appendChild(copyBtn);
        actionsDiv.appendChild(downloadBtn);
        messageDiv.appendChild(actionsDiv);
    }

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageContent;
}

// Function to stream bot reply line by line
async function streamBotReply(fullContent) {
    const lines = fullContent.split(/\r?\n/);
    let current = '';
    const messageContent = addMessage('', false, true);
    const messageDiv = messageContent.parentElement;
    
    for (let i = 0; i < lines.length; i++) {
        current += (i > 0 ? '\n' : '') + lines[i];
        messageContent.innerHTML = DOMPurify.sanitize(marked.parse(current));
        chatMessages.scrollTop = chatMessages.scrollHeight;
        await new Promise(res => setTimeout(res, 20)); // Faster streaming
    }
    
    // After streaming is complete, add the action buttons
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'response-actions';
    
    // Store the original content for copy/download
    messageDiv.dataset.originalContent = fullContent;
    
    // Copy button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'response-action-btn copy-btn';
    copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="9" y="9" width="13" height="13" rx="2" stroke-width="2"/><rect x="3" y="3" width="13" height="13" rx="2" stroke-width="2"/></svg> Copy`;
    copyBtn.onclick = function() {
        const textToCopy = this.closest('.message').dataset.originalContent;
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        const originalHTML = this.innerHTML;
        this.innerHTML = 'Copied!';
        setTimeout(() => {
            this.innerHTML = originalHTML;
        }, 1200);
    };
    
    // Download button
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'response-action-btn download-btn';
    downloadBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 16v-8m0 8l-4-4m4 4l4-4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="4" y="4" width="16" height="16" rx="2" stroke-width="2"/></svg> PDF`;
    downloadBtn.onclick = function() {
        const textToDownload = this.closest('.message').dataset.originalContent;
        generatePDF(textToDownload);
    };
    
    actionsDiv.appendChild(copyBtn);
    actionsDiv.appendChild(downloadBtn);
    messageDiv.appendChild(actionsDiv);
}

// Function to start a new portfolio
function startNewChat() {
    // Clear chat messages
    chatMessages.innerHTML = '';
    
    // Reset conversation history with preset options
    conversationHistory = [
        {
            role: 'assistant',
            content: `Hello! I'm Monozogi AI. How can I help you today?`
        }
    ];
    
    // Add initial message
    addMessage(`Hello! I'm Monozogi AI. How can I help you today?`);
    
    // Create preset buttons
    createPresetButtons();
    
    // Clear shown taglines for new session
    shownTaglines.clear();
}

// Function to handle sending messages
async function sendMessage() {
    const message = promptInput.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addMessage(message, true);
    
    // Clear input
    promptInput.value = '';
    promptInput.style.height = 'auto';
    
    // Add user message to history
    conversationHistory.push({
        role: 'user',
        content: message
    });
    
    // Disable input while processing
    promptInput.disabled = true;
    generateBtn.disabled = true;
    
    // Show loading animation with tagline
    startDynamicLoader();
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Portfolio Generator'
            },
            body: JSON.stringify({
                model: 'qwen/qwen3-235b-a22b:free',
                messages: [
                    // Enhanced system message for exceptional portfolios
                    {
                        role: 'system',
                        content: `You are a portfolio website generator that creates extraordinary, animated portfolio websites. 
Your code should be complete, modern, and optimized for performance despite the rich animations.`
                    },
                    ...conversationHistory
                ]
            }),
            signal: controller.signal
        }).finally(() => clearTimeout(timeoutId));

        // Check if the response is OK
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API responded with status ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        if (data.choices && data.choices[0] && data.choices[0].message) {
            const botResponse = data.choices[0].message.content;
            await streamBotReply(botResponse);
            
            // Add bot response to history
            conversationHistory.push({
                role: 'assistant',
                content: botResponse
            });
            
            // Check if response contains portfolio data
            const portfolioData = extractPortfolioData(botResponse);
            
            // If portfolio data was found, add download button
            if (portfolioData) {
                const messageDiv = document.querySelector('.message.bot:last-child');
                if (messageDiv) {
                    addPortfolioDownloadButton(messageDiv, portfolioData);
                }
            }
        } else {
            console.error('Invalid API response structure:', data);
            throw new Error('Invalid response format from API. Expected choices[0].message.content');
        }
    } catch (error) {
        console.error('Error:', error);
        
        // Add a more descriptive error message to the chat
        let errorMessage = 'Sorry, I encountered an error. ';
        
        if (error.name === 'AbortError') {
            errorMessage += 'The request took too long to complete. Please try again.';
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            errorMessage += 'There seems to be a network issue. Please check your internet connection and try again.';
        } else if (error.message.includes('401')) {
            errorMessage += 'API key authentication failed. Please check your API key.';
        } else if (error.message.includes('429')) {
            errorMessage += 'Rate limit exceeded. Please try again later.';
        } else if (error.message.includes('500')) {
            errorMessage += 'The AI service is experiencing issues. Please try again later.';
        } else {
            errorMessage += `Error details: ${error.message}`;
        }
        
        addMessage(errorMessage);
        
        // Add a retry button
        const lastMessage = document.querySelector('.message.bot:last-child');
        if (lastMessage) {
            const retryButton = document.createElement('button');
            retryButton.className = 'retry-button';
            retryButton.innerHTML = 'Try Again';
            retryButton.onclick = () => {
                // Remove the error message
                lastMessage.remove();
                // Try sending the message again
                promptInput.value = message;
                sendMessage();
            };
            lastMessage.appendChild(retryButton);
        }
    } finally {
        // Hide loading animation
        stopDynamicLoader();
        
        // Re-enable input
        promptInput.disabled = false;
        generateBtn.disabled = false;
        promptInput.focus();
    }
}

// DOM element references
const chatMessages = document.getElementById('chatMessages');
const promptInput = document.getElementById('promptInput');
const generateBtn = document.getElementById('generateBtn');
const newChatBtn = document.querySelector('.new-chat-btn');
const loadingAnimation = document.querySelector('.loading-animation');

// Event listeners
generateBtn.addEventListener('click', sendMessage);
newChatBtn.addEventListener('click', startNewChat);

promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Auto-resize textarea
promptInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// Function to generate PDF
function generatePDF(content) {
    try {
        console.log("Generating PDF for content:", content.substring(0, 50) + "...");
        
        // Create a temporary div to render the markdown content
        const tempDiv = document.createElement('div');
        tempDiv.className = 'pdf-export';
        tempDiv.style.width = '500px';
        tempDiv.style.padding = '20px';
        tempDiv.style.backgroundColor = 'white';
        tempDiv.style.color = 'black';
        tempDiv.style.fontFamily = 'Arial, sans-serif';
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '-9999px';
        
        // Add a title
        const titleDiv = document.createElement('div');
        titleDiv.style.fontSize = '18px';
        titleDiv.style.fontWeight = 'bold';
        titleDiv.style.marginBottom = '15px';
        titleDiv.style.borderBottom = '1px solid #ccc';
        titleDiv.style.paddingBottom = '10px';
        titleDiv.textContent = 'Monozogi AI ChatBot';
        tempDiv.appendChild(titleDiv);
        
        // Add the content with markdown formatting
        const contentDiv = document.createElement('div');
        contentDiv.innerHTML = DOMPurify.sanitize(marked.parse(content));
        
        // Style the content for PDF
        contentDiv.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
            heading.style.color = '#333';
            heading.style.marginTop = '15px';
            heading.style.marginBottom = '10px';
        });
        
        contentDiv.querySelectorAll('p').forEach(p => {
            p.style.marginBottom = '10px';
            p.style.lineHeight = '1.5';
        });
        
        contentDiv.querySelectorAll('ul, ol').forEach(list => {
            list.style.marginLeft = '20px';
            list.style.marginBottom = '10px';
        });
        
        contentDiv.querySelectorAll('li').forEach(item => {
            item.style.marginBottom = '5px';
        });
        
        contentDiv.querySelectorAll('code').forEach(code => {
            code.style.backgroundColor = '#f5f5f5';
            code.style.padding = '2px 4px';
            code.style.borderRadius = '3px';
            code.style.fontFamily = 'monospace';
        });
        
        contentDiv.querySelectorAll('pre').forEach(pre => {
            pre.style.backgroundColor = '#f5f5f5';
            pre.style.padding = '10px';
            pre.style.borderRadius = '5px';
            pre.style.overflowX = 'auto';
            pre.style.fontFamily = 'monospace';
            pre.style.marginBottom = '10px';
        });
        
        tempDiv.appendChild(contentDiv);
        document.body.appendChild(tempDiv);
        
        // Add a footer with date
        const footerDiv = document.createElement('div');
        footerDiv.style.marginTop = '20px';
        footerDiv.style.borderTop = '1px solid #ccc';
        footerDiv.style.paddingTop = '10px';
        footerDiv.style.fontSize = '12px';
        footerDiv.style.color = '#666';
        footerDiv.textContent = 'Generated on: ' + new Date().toLocaleString();
        tempDiv.appendChild(footerDiv);
        
        // Use html2canvas to capture the div as an image
        html2canvas(tempDiv, {
            scale: 2,
            logging: false,
            useCORS: true
        }).then(canvas => {
            // Create PDF
            const pdf = new jspdf.jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            // Calculate dimensions
            const imgData = canvas.toDataURL('image/png');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 10;
            
            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            
            // If content is too long, add more pages
            if (imgHeight * ratio > pdfHeight - 20) {
                let remainingHeight = imgHeight * ratio;
                let currentPosition = 0;
                
                while (remainingHeight > 0) {
                    pdf.addPage();
                    const pageHeight = pdfHeight - 20;
                    pdf.addImage(imgData, 'PNG', imgX, 10 - currentPosition, imgWidth * ratio, imgHeight * ratio);
                    remainingHeight -= pageHeight;
                    currentPosition += pageHeight;
                }
            }
            
            // Save the PDF
            pdf.save('ai-response.pdf');
            
            // Clean up
            document.body.removeChild(tempDiv);
        });
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Could not generate PDF. Please try again.');
        
        // Fallback to text download if PDF generation fails
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ai-response.txt';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }
}

// Function to check API key validity
async function checkAPIKey() {
    try {
        if (!navigator.onLine) {
            console.warn('Offline: Skipping API key check');
            return false;
        }
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'AI Chatbot'
            },
            body: JSON.stringify({
                model: 'qwen/qwen3-235b-a22b:free',
                messages: [
                    {
                        role: 'user',
                        content: 'Hello'
                    }
                ]
            }),
            signal: controller.signal
        }).finally(() => clearTimeout(timeoutId));

        if (!response.ok) {
            if (response.status === 401) {
                console.error('API key is invalid or expired');
                addMessage('⚠️ API key appears to be invalid or expired. Please check your API key configuration.');
                return false;
            } else {
                console.warn(`API check returned status ${response.status}`);
                // Don't show error to user for other status codes during initial check
                return true;
            }
        }
        
        return true;
    } catch (error) {
        if (error.name === 'AbortError') {
            console.warn('API check timed out');
        } else {
            console.warn('API check failed:', error);
        }
        // Don't show error to user during initial check
        return true;
    }
}

// Function to handle preset selection
function handlePresetSelection(presetKey) {
    const preset = portfolioPresets[presetKey];
    
    if (!preset) {
        addMessage("I couldn't find that preset. Please choose from the available options or type 'custom' for a custom portfolio.");
        return;
    }
    
    let responseMessage = `Great choice! Let's create a ${preset.name}.\n\n${preset.description}\n\nThis portfolio will include:\n`;
    
    preset.features.forEach(feature => {
        responseMessage += `- ${feature}\n`;
    });
    
    if (presetKey === 'custom') {
        responseMessage += `\nLet's design your custom portfolio! Please tell me about your preferences for:\n- Color scheme\n- Animation style\n- Key sections you want to include\n- Any specific features you'd like`;
    } else {
        responseMessage += `\nWould you like to customize any aspects of this preset, or shall we proceed with generating your ${preset.name}?`;
    }
    
    // Add message to chat
    addMessage(responseMessage);
    
    // Add to conversation history
    conversationHistory.push({
        role: 'assistant',
        content: responseMessage
    });
}

// Function to create preset buttons in the welcome message
function createPresetButtons() {
    const firstMessage = document.querySelector('.message.bot .message-content');
    if (!firstMessage) return;
    
    // Check if buttons already exist to prevent duplication
    if (firstMessage.querySelector('.preset-buttons')) return;
    
    // Create preset buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'preset-buttons';
    
    // Add buttons for each preset
    Object.entries(portfolioPresets).forEach(([key, preset], index) => {
        const button = document.createElement('button');
        button.className = 'preset-button';
        button.dataset.preset = key;
        button.innerHTML = `
            <span class="preset-number">${index + 1}</span>
            <span class="preset-name">${preset.name}</span>
        `;
        button.addEventListener('click', () => {
            // Add user selection to chat
            addMessage(`I'd like to create a ${preset.name}`, true);
            
            // Add to conversation history
            conversationHistory.push({
                role: 'user',
                content: preset.name
            });
            
            // Handle preset selection
            handlePresetSelection(key);
        });
        
        buttonsContainer.appendChild(button);
    });
    
    // Append buttons to the first message
    firstMessage.appendChild(buttonsContainer);
}

// Add event listeners for quick preset selection buttons
document.addEventListener('DOMContentLoaded', function() {
    // Initial welcome message is already added in HTML
    
    // Create preset buttons for the initial message
    createPresetButtons();
    
    // Check API key validity
    checkAPIKey();
    
    // Monitor network status
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    // Check initial network status
    updateNetworkStatus();
    
    // Add preset selection handling to existing message processing
    const originalSendMessage = sendMessage;
    sendMessage = async function() {
        const message = promptInput.value.trim().toLowerCase();
        
        // Check if message is a preset number (1-6)
        if (/^[1-6]$/.test(message)) {
            const presetKeys = Object.keys(portfolioPresets);
            const selectedPreset = presetKeys[parseInt(message) - 1];
            
            // Add user message to chat
            addMessage(promptInput.value.trim(), true);
            
            // Clear input
            promptInput.value = '';
            promptInput.style.height = 'auto';
            
            // Add user message to history
            conversationHistory.push({
                role: 'user',
                content: portfolioPresets[selectedPreset].name
            });
            
            // Handle the preset selection
            handlePresetSelection(selectedPreset);
            return;
        }
        
        // Check if message is a preset name
        for (const [key, preset] of Object.entries(portfolioPresets)) {
            if (message.includes(key) || message.includes(preset.name.toLowerCase())) {
                // Add user message to chat
                addMessage(promptInput.value.trim(), true);
                
                // Clear input
                promptInput.value = '';
                promptInput.style.height = 'auto';
                
                // Add user message to history
                conversationHistory.push({
                    role: 'user',
                    content: preset.name
                });
                
                // Handle the preset selection
                handlePresetSelection(key);
                return;
            }
        }
        
        // If not a preset, proceed with original function
        originalSendMessage();
    };
});

// Function to generate a complete portfolio as a single file
async function generatePortfolioFile(portfolioData) {
    try {
        // Start with HTML structure
        let portfolioFile = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${portfolioData.title || 'My Portfolio'}</title>
    <style>
    /* CSS styles will be injected here */
    ${portfolioData.css || ''}
    </style>
</head>
<body>
    ${portfolioData.html || ''}
    
    <!-- External libraries -->
    ${portfolioData.libraries ? portfolioData.libraries.map(lib => 
        `<script src="${lib}"></script>`).join('\n    ') : ''}
    
    <script>
    // JavaScript will be injected here
    ${portfolioData.js || ''}
    </script>
</body>
</html>`;

        return portfolioFile;
    } catch (error) {
        console.error('Error generating portfolio file:', error);
        return null;
    }
}

// Add a download portfolio button to the response
function addPortfolioDownloadButton(messageDiv, portfolioData) {
    const actionsDiv = messageDiv.querySelector('.response-actions');
    
    if (!actionsDiv) return;
    
    // Create download portfolio button
    const downloadPortfolioBtn = document.createElement('button');
    downloadPortfolioBtn.className = 'response-action-btn download-portfolio-btn';
    downloadPortfolioBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Portfolio`;
    
    downloadPortfolioBtn.onclick = async function() {
        const portfolioFile = await generatePortfolioFile(portfolioData);
        
        if (portfolioFile) {
            // Create a blob and download
            const blob = new Blob([portfolioFile], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'my-portfolio.html';
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
            
            // Show success message
            const originalHTML = this.innerHTML;
            this.innerHTML = 'Downloaded!';
            setTimeout(() => {
                this.innerHTML = originalHTML;
            }, 1200);
        }
    };
    
    actionsDiv.appendChild(downloadPortfolioBtn);
}

// Modify the API response handling to extract portfolio data
async function sendMessage() {
    const message = promptInput.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addMessage(message, true);
    
    // Clear input
    promptInput.value = '';
    promptInput.style.height = 'auto';
    
    // Add user message to history
    conversationHistory.push({
        role: 'user',
        content: message
    });
    
    // Disable input while processing
    promptInput.disabled = true;
    generateBtn.disabled = true;
    
    // Show loading animation with tagline
    startDynamicLoader();
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Portfolio Generator'
            },
            body: JSON.stringify({
                model: 'qwen/qwen3-235b-a22b:free',
                messages: [
                    // Enhanced system message for exceptional portfolios
                    {
                        role: 'system',
                        content: `You are a portfolio website generator that creates extraordinary, animated portfolio websites. 
Your code should be complete, modern, and optimized for performance despite the rich animations.`
                    },
                    ...conversationHistory
                ]
            }),
            signal: controller.signal
        }).finally(() => clearTimeout(timeoutId));

        // Check if the response is OK
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API responded with status ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        if (data.choices && data.choices[0] && data.choices[0].message) {
            const botResponse = data.choices[0].message.content;
            await streamBotReply(botResponse);
            
            // Add bot response to history
            conversationHistory.push({
                role: 'assistant',
                content: botResponse
            });
            
            // Check if response contains portfolio data
            const portfolioData = extractPortfolioData(botResponse);
            
            // If portfolio data was found, add download button
            if (portfolioData) {
                const messageDiv = document.querySelector('.message.bot:last-child');
                if (messageDiv) {
                    addPortfolioDownloadButton(messageDiv, portfolioData);
                }
            }
        } else {
            console.error('Invalid API response structure:', data);
            throw new Error('Invalid response format from API. Expected choices[0].message.content');
        }
    } catch (error) {
        console.error('Error:', error);
        
        // Add a more descriptive error message to the chat
        let errorMessage = 'Sorry, I encountered an error. ';
        
        if (error.name === 'AbortError') {
            errorMessage += 'The request took too long to complete. Please try again.';
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            errorMessage += 'There seems to be a network issue. Please check your internet connection and try again.';
        } else if (error.message.includes('401')) {
            errorMessage += 'API key authentication failed. Please check your API key.';
        } else if (error.message.includes('429')) {
            errorMessage += 'Rate limit exceeded. Please try again later.';
        } else if (error.message.includes('500')) {
            errorMessage += 'The AI service is experiencing issues. Please try again later.';
        } else {
            errorMessage += `Error details: ${error.message}`;
        }
        
        addMessage(errorMessage);
        
        // Add a retry button
        const lastMessage = document.querySelector('.message.bot:last-child');
        if (lastMessage) {
            const retryButton = document.createElement('button');
            retryButton.className = 'retry-button';
            retryButton.innerHTML = 'Try Again';
            retryButton.onclick = () => {
                // Remove the error message
                lastMessage.remove();
                // Try sending the message again
                promptInput.value = message;
                sendMessage();
            };
            lastMessage.appendChild(retryButton);
        }
    } finally {
        // Hide loading animation
        stopDynamicLoader();
        
        // Re-enable input
        promptInput.disabled = false;
        generateBtn.disabled = false;
        promptInput.focus();
    }
}

// Function to extract portfolio data from AI response
function extractPortfolioData(content) {
    // Look for code blocks in the response
    const htmlMatch = content.match(/```html\n([\s\S]*?)\n```/);
    const cssMatch = content.match(/```css\n([\s\S]*?)\n```/);
    const jsMatch = content.match(/```javascript\n([\s\S]*?)\n```/);
    
    // If we have at least HTML, consider it a portfolio
    if (htmlMatch) {
        return {
            title: extractTitle(content),
            html: htmlMatch[1],
            css: cssMatch ? cssMatch[1] : '',
            js: jsMatch ? jsMatch[1] : '',
            libraries: extractLibraries(content)
        };
    }
    
    return null;
}

// Extract title from content
function extractTitle(content) {
    const titleMatch = content.match(/# (.*?)(\n|$)/);
    return titleMatch ? titleMatch[1] : 'My Portfolio';
}

// Extract libraries from content
function extractLibraries(content) {
    const libraries = [];
    
    // Common libraries to look for
    const commonLibs = [
        'three.js', 'gsap', 'anime.js', 'particles.js', 
        'jquery', 'bootstrap', 'tailwind'
    ];
    
    // Check for library mentions
    commonLibs.forEach(lib => {
        if (content.toLowerCase().includes(lib.toLowerCase())) {
            // Add CDN links based on library name
            switch(lib.toLowerCase()) {
                case 'three.js':
                    libraries.push('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
                    break;
                case 'gsap':
                    libraries.push('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.9.1/gsap.min.js');
                    break;
                case 'anime.js':
                    libraries.push('https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js');
                    break;
                case 'particles.js':
                    libraries.push('https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js');
                    break;
                case 'jquery':
                    libraries.push('https://code.jquery.com/jquery-3.6.0.min.js');
                    break;
                case 'bootstrap':
                    libraries.push('https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js');
                    libraries.push('https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css');
                    break;
                case 'tailwind':
                    libraries.push('https://cdn.tailwindcss.com');
                    break;
            }
        }
    });
    
    return libraries;
}

// Function to update network status
function updateNetworkStatus() {
    const isOnline = navigator.onLine;
    const chatContainer = document.querySelector('.chat-container');
    
    // Remove any existing notification
    const existingNotification = document.querySelector('.offline-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // If offline, show notification
    if (!isOnline && chatContainer) {
        const notification = document.createElement('div');
        notification.className = 'offline-notification';
        notification.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="1" y1="1" x2="23" y2="23"></line>
                <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
                <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
                <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
                <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                <line x1="12" y1="20" x2="12.01" y2="20"></line>
            </svg>
            <span>You are currently offline. Please check your internet connection.</span>
        `;
        chatContainer.insertBefore(notification, chatContainer.firstChild);
    }
}

// Add network status monitoring
document.addEventListener('DOMContentLoaded', function() {
    // Initial welcome message is already added in HTML
    
    // Create preset buttons for the initial message
    createPresetButtons();
    
    // Check API key validity
    checkAPIKey();
    
    // Monitor network status
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    // Check initial network status
    updateNetworkStatus();
    
    // Add preset selection handling to existing message processing
    const originalSendMessage = sendMessage;
    sendMessage = async function() {
        const message = promptInput.value.trim().toLowerCase();
        
        // Check if message is a preset number (1-6)
        if (/^[1-6]$/.test(message)) {
            const presetKeys = Object.keys(portfolioPresets);
            const selectedPreset = presetKeys[parseInt(message) - 1];
            
            // Add user message to chat
            addMessage(promptInput.value.trim(), true);
            
            // Clear input
            promptInput.value = '';
            promptInput.style.height = 'auto';
            
            // Add user message to history
            conversationHistory.push({
                role: 'user',
                content: portfolioPresets[selectedPreset].name
            });
            
            // Handle the preset selection
            handlePresetSelection(selectedPreset);
            return;
        }
        
        // Check if message is a preset name
        for (const [key, preset] of Object.entries(portfolioPresets)) {
            if (message.includes(key) || message.includes(preset.name.toLowerCase())) {
                // Add user message to chat
                addMessage(promptInput.value.trim(), true);
                
                // Clear input
                promptInput.value = '';
                promptInput.style.height = 'auto';
                
                // Add user message to history
                conversationHistory.push({
                    role: 'user',
                    content: preset.name
                });
                
                // Handle the preset selection
                handlePresetSelection(key);
                return;
            }
        }
        
        // If not a preset, proceed with original function
        originalSendMessage();
    };
});

// Function to make an element draggable
function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    // Get the header or the entire element to use as handle
    const handle = element.querySelector('.puppy-header') || element;
    const puppyAvatar = element.querySelector('.puppy-avatar');
    
    // Make the header draggable
    handle.onmousedown = dragMouseDown;
    
    // Make the avatar both clickable and draggable
    puppyAvatar.addEventListener('mousedown', function(e) {
        // Track if this is a drag or click
        let moved = false;
        const startX = e.clientX;
        const startY = e.clientY;
        
        // Function to handle mouse movement
        function handleMouseMove(moveEvent) {
            const diffX = Math.abs(moveEvent.clientX - startX);
            const diffY = Math.abs(moveEvent.clientY - startY);
            
            // If moved more than a threshold, it's a drag
            if (diffX > 5 || diffY > 5) {
                moved = true;
                
                // Start dragging
                pos3 = moveEvent.clientX;
                pos4 = moveEvent.clientY;
                document.onmousemove = elementDrag;
            }
        }
        
        // Function to handle mouse up
        function handleMouseUp() {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.onmousemove = null;
            
            // If it wasn't a drag, treat as click
            if (!moved) {
                const chatWindow = element.querySelector('.puppy-chat-window');
                chatWindow.style.display = chatWindow.style.display === 'none' || 
                                          chatWindow.style.display === '' ? 'flex' : 'none';
            }
        }
        
        // Add temporary listeners
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    });
    
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // Get the mouse cursor position at startup
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // Call a function whenever the cursor moves
        document.onmousemove = elementDrag;
    }
    
    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // Calculate the new cursor position
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // Set the element's new position
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
        // Remove the fixed bottom/left
        element.style.bottom = "auto";
        element.style.right = "auto";
    }
    
    function closeDragElement() {
        // Stop moving when mouse button is released
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// Function to initialize the puppy helper
function initPuppyHelper() {
    console.log('Initializing puppy helper');
    
    // If already initialized, just make sure it's visible
    const existingPuppy = document.querySelector('.portfolio-puppy');
    if (existingPuppy) {
        console.log('Puppy already exists, ensuring visibility');
        existingPuppy.style.display = 'flex';
        return;
    }
    
    // Create the puppy helper from scratch
    const puppyHelper = document.createElement('div');
    puppyHelper.className = 'portfolio-puppy';
    puppyHelper.style.display = 'flex'; // Ensure it's visible
    puppyHelper.style.position = 'fixed'; // Ensure it's positioned
    puppyHelper.style.bottom = '20px';
    puppyHelper.style.left = '20px';
    puppyHelper.innerHTML = `
        <div class="puppy-avatar">
            <img src="puppy.gif" alt="Portfolio Puppy" />
        </div>
        <div class="puppy-chat-window" style="display: none;">
            <div class="puppy-header">
                <h3>Portfolio Puppy</h3>
                <button class="close-puppy-btn">×</button>
            </div>
            <div class="puppy-messages">
                <div class="puppy-message">
                    <div class="puppy-message-content">
                        <p>🐾 <strong>Hi there!</strong> I'm Portfolio Puppy!</p>
                        <p>I can help with portfolio tips. What would you like to know?</p>
                    </div>
                </div>
            </div>
            <div class="puppy-input-container">
                <input type="text" class="puppy-input" placeholder="Ask about portfolios...">
                <button class="puppy-send-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </div>
        </div>
    `;
    
    // Append to body
    document.body.appendChild(puppyHelper);
    
    // Get references to elements
    const closeBtn = puppyHelper.querySelector('.close-puppy-btn');
    const sendBtn = puppyHelper.querySelector('.puppy-send-btn');
    const puppyInput = puppyHelper.querySelector('.puppy-input');
    const puppyAvatar = puppyHelper.querySelector('.puppy-avatar');
    
    // Add attention-grabbing animation after a delay
    setTimeout(() => {
        puppyAvatar.classList.add('attention');
        setTimeout(() => {
            puppyAvatar.classList.remove('attention');
        }, 3000);
    }, 2000);
    
    // Repeat the attention animation periodically
    setInterval(() => {
        puppyAvatar.classList.add('attention');
        setTimeout(() => {
            puppyAvatar.classList.remove('attention');
        }, 3000);
    }, 30000); // Every 30 seconds
    
    // Direct click handler for close button
    closeBtn.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent event from bubbling
        puppyHelper.querySelector('.puppy-chat-window').style.display = 'none';
    });
    
    // Direct click handler for send button
    sendBtn.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent event from bubbling
        sendPuppyMessage();
    });
    
    // Direct keydown handler for input
    puppyInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.stopPropagation(); // Prevent event from bubbling
            sendPuppyMessage();
        }
    });
    
    // Make the puppy helper draggable
    makeDraggable(puppyHelper);
    
    console.log('Puppy helper initialized with direct event handlers and draggable functionality');
    puppyInitialized = true;
}

// Function to add a message to the puppy chat
function addPuppyMessage(message, isUser = false) {
    const puppyMessages = document.querySelector('.puppy-messages');
    const messageDiv = document.createElement('div');
    
    messageDiv.className = isUser ? 'puppy-message user' : 'puppy-message';
    
    if (isUser) {
        messageDiv.innerHTML = `
            <div class="puppy-message-content">
                ${message}
            </div>
        `;
    } else {
        // For bot messages, use markdown parsing with proper structure
        messageDiv.innerHTML = `
            <div class="puppy-message-content">
                ${DOMPurify.sanitize(marked.parse(message))}
            </div>
        `;
    }
    
    puppyMessages.appendChild(messageDiv);
    puppyMessages.scrollTop = puppyMessages.scrollHeight;
}

// Show typing indicator in puppy chat
function showPuppyTyping() {
    const puppyMessages = document.querySelector('.puppy-messages');
    const typingDiv = document.createElement('div');
    
    typingDiv.className = 'puppy-message puppy-typing';
    typingDiv.innerHTML = `
        <div class="puppy-message-content">
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    puppyMessages.appendChild(typingDiv);
    puppyMessages.scrollTop = puppyMessages.scrollHeight;
}

// Initialize puppy helper on page load - only once
document.addEventListener('DOMContentLoaded', function() {
    if (!puppyInitialized) {
        console.log('DOM content loaded, initializing puppy helper');
        initPuppyHelper();
        puppyInitialized = true;
    }
});

// Remove the additional initialization calls
// window.addEventListener('load', function() {...});
// initPuppyHelper();

// Function to send a message from the puppy chat
async function sendPuppyMessage() {
    const puppyInput = document.querySelector('.puppy-input');
    const message = puppyInput.value.trim();
    
    if (!message || isPuppyProcessing) return;
    
    // Add user message to chat
    addPuppyMessage(message, true);
    
    // Clear input
    puppyInput.value = '';
    
    // Show typing indicator
    showPuppyTyping();
    
    // Set processing flag
    isPuppyProcessing = true;
    
    // Add user message to history
    puppyConversationHistory.push({
        role: 'user',
        content: message
    });
    
    try {
        // Process with the puppy model using DeepSeek
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Portfolio Puppy'
            },
            body: JSON.stringify({
                model: PUPPY_MODEL,
                messages: [
                    {
                        role: 'system',
                        content: `You are Master of Portfolio Puppy with 30 years of experience, a helpful assistant that provides concise, structured advice about creating professional portfolios.
(use only Enligh)                        
Your responses should:
1. Be compact and to-the-point
2. Use emoji icons to highlight key points
3. Use markdown formatting (bold, lists, headers) for structure
4. Include practical, actionable tips
5. Be friendly and encouraging
6. Focus on modern portfolio best practices

Keep responses under 4-20 sentences and make them visually structured with points and icons.`
                    },
                    ...puppyConversationHistory
                ]
            }),
            signal: controller.signal
        }).finally(() => clearTimeout(timeoutId));
        
        const data = await response.json();
        
        // Remove typing indicator
        const typingIndicator = document.querySelector('.puppy-typing');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
            const puppyResponse = data.choices[0].message.content;
            
            // Add to conversation history
            puppyConversationHistory.push({
                role: 'assistant',
                content: puppyResponse
            });
            
            // Add response to chat
            addPuppyMessage(puppyResponse);
        } else {
            // Fallback response if API fails
            addPuppyMessage("Woof! I'm having trouble connecting to my brain. Please try again!");
        }
    } catch (error) {
        console.error('Error getting puppy response:', error);
        
        // Remove typing indicator
        const typingIndicator = document.querySelector('.puppy-typing');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        
        // Add fallback response
        addPuppyMessage("🐾 Sorry, I had a little trouble fetching that information. Could you try asking again?");
    } finally {
        // Reset processing flag
        isPuppyProcessing = false;
    }
}

// Make sure the puppy is initialized on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM content loaded, initializing puppy helper');
    initPuppyHelper();
});

// Also add a direct call to ensure it runs
window.onload = function() {
    console.log('Window loaded, ensuring puppy is initialized');
    initPuppyHelper();
};

// Add a direct call to initialize right away
console.log('Script loaded, initializing puppy helper immediately');
initPuppyHelper();









