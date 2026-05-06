const chat = document.getElementById('chat');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');

function addMessage(text, type) {
  const div = document.createElement('div');
  div.className = message ${type};
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

async function sendMessage() {
  const message = messageInput.value.trim();
  if (!message) return;

  addMessage(message, 'user-message');
  messageInput.value = '';
  sendBtn.disabled = true;
  sendBtn.innerHTML = '<span class="loading"></span>';

  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong');
    }

    addMessage(data.reply, 'ai-message');
  } catch (error) {
    console.error('Error:', error);
    addMessage(⚠️ Error: ${error.message}. Please try again., 'error-message');
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = 'Send';
    messageInput.focus();
  }
}

sendBtn.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

// Welcome message
addMessage('👋 Hello! I\'m PichaAI, powered by Groq. How can I help you today?', 'ai-message');