document.addEventListener("DOMContentLoaded", function () {
  const chatForm = document.getElementById("chat-form");
  const chatMessages = document.getElementById("chat-messages");
  const userInput = document.getElementById("user-input");
  const submitButton = document.getElementById("submit-button");
  const loadingSpinner = document.getElementById("loading-spinner");

  function formatResponse(text) {
    // Replace newlines with <br> tags
    text = text.replace(/\n/g, "<br>");

    // Bold text between ** **
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Italicize text between * *
    text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");

    // Format lists
    text = text.replace(/^\s*[-•]\s+(.+)/gm, "<li>$1</li>");
    text = text.replace(
      /(<li>.*?<\/li>)/gs,
      '<ul class="list-disc ml-4 my-2">$1</ul>'
    );

    return text;
  }

  function addMessage(content, isUser = false) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "flex items-start";

    const avatar = document.createElement("div");
    avatar.className = "flex-shrink-0";
    avatar.innerHTML = `
      <div class="h-10 w-10 rounded-full ${
        isUser ? "bg-gray-500" : "bg-indigo-500"
      } flex items-center justify-center">
        <span class="text-white text-lg">${isUser ? "You" : "AI"}</span>
      </div>
    `;

    const messageContent = document.createElement("div");
    messageContent.className =
      "ml-3 bg-gray-100 rounded-lg py-3 px-4 max-w-[80%]";

    // Format the content if it's an AI response
    const formattedContent = isUser ? content : formatResponse(content);
    messageContent.innerHTML = `<div class="text-gray-900 prose">${formattedContent}</div>`;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function setLoading(isLoading) {
    const buttonText = submitButton.querySelector("span");
    loadingSpinner.classList.toggle("hidden", !isLoading);
    buttonText.textContent = isLoading ? "Thinking..." : "Send";
    userInput.disabled = isLoading;
    submitButton.disabled = isLoading;
  }

  chatForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const message = userInput.value.trim();
    if (!message) return;

    // Add user message to chat
    addMessage(message, true);

    // Clear input and show loading state
    userInput.value = "";
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: message }),
      });

      const data = await response.json();

      if (response.ok) {
        addMessage(data.response);
      } else {
        addMessage("Sorry, there was an error processing your request.");
      }
    } catch (error) {
      addMessage("Sorry, there was an error connecting to the server.");
    } finally {
      setLoading(false);
    }
  });
});
