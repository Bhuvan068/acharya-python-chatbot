const chatMessages = document.getElementById("chatMessages");
const userInput = document.getElementById("userInput");

const API_KEY = "place ur api keys ";

// Append message to chat
function appendMessage(sender, text) {
    const message = document.createElement("div");
    message.className = `message ${sender}`;

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = sender === "user" ? "🤖" : "🥷";

    const textEl = document.createElement("div");
    textEl.className = "text";
    textEl.textContent = text;

    message.appendChild(avatar);
    message.appendChild(textEl);
    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show "typing..." indicator
function showTypingIndicator() {
    const typing = document.createElement("div");
    typing.className = "typing-indicator";
    typing.id = "typing";
    typing.textContent = "Bot is typing...";
    chatMessages.appendChild(typing);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Remove "typing..." indicator
function removeTypingIndicator() {
    const typing = document.getElementById("typing");
    if (typing) typing.remove();
}

// Send message to Gemini API
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    appendMessage("user", message);
    userInput.value = "";
    showTypingIndicator();

    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }]
            })
        });

        const data = await res.json();
        removeTypingIndicator();

        const reply =
            data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
            "⚠️ No response received.";
        appendMessage("bot", reply);

    } catch (error) {
        removeTypingIndicator();
        appendMessage("bot", "⚠️ Error fetching response");
        console.error(error);
    }
}

// Voice recognition with Web Speech API
function startListening() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = function (event) {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        sendMessage(); // Auto-send after recognizing
    };

    recognition.onerror = function (event) {
        console.error("Speech recognition error:", event.error);
        appendMessage("bot", "⚠️ Sorry, I couldn't hear that.");
    };
}

// Send message on Enter key
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});

// Greet the user on page load
window.onload = () => {
    appendMessage("bot", "Hello! I am your AI assistant. Ask me anything.");
};
