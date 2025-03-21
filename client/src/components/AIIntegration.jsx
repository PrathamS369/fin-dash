import { useState } from "react";

const AIIntegration = () => {
  const [messages, setMessages] = useState([]); // Stores the chat history
  const [inputText, setInputText] = useState(""); // Stores the current user input
  const [isLoading, setIsLoading] = useState(false); // Tracks loading state

  // Handle user input change
  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  // Handle sending a message to the Gemini API
  const sendMessage = async () => {
    if (!inputText.trim()) {
      alert("Please enter a message.");
      return;
    }

    setIsLoading(true);

    // Add the user's message to the chat history
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", text: inputText },
    ]);

    try {
      // Replace with your Gemini API key
      const apiKey = "*******************"; // Replace with your actual Gemini API key
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      // Prepare the request payload with structured format instruction
      const payload = {
        contents: [
          {
            parts: [
              {
                text: `You are a financial advisor. Provide actionable advice for the following question in a structured, readable format with bullet points and sections: ${inputText}`,
              },
            ],
          },
        ],
      };

      // Make the API request
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      // Extract the generated content from the response
      const generatedText = data.candidates[0].content.parts[0].text;

      // Split the text by line breaks for better readability
      const structuredResponse = generatedText.split("\n").map((line, index) => (
        <li key={index}>{line}</li>
      ));

      // Add the AI's response to the chat history
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", text: structuredResponse },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      // Add an error message to the chat history
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          text: "Failed to generate a response. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
      setInputText(""); // Clear the input field
    }
  };

  return (
    <div className="p-8 bg-gradient-to-r from-sky-100 to-green-100 min-h-screen">
      <h2 className="text-3xl font-semibold mb-6 text-sky-800">
        AI Financial Advisor
      </h2>

      <div className="bg-white p-6 rounded-lg shadow-lg border border-sky-100">
        {/* Chat Window */}
        <div className="h-96 overflow-y-auto mb-4 p-4 bg-sky-50 rounded-lg">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 ${
                message.role === "user" ? "text-right" : "text-left"
              }`}
            >
              <span
                className={`inline-block px-4 py-2 rounded-lg ${
                  message.role === "user"
                    ? "bg-sky-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {Array.isArray(message.text) ? (
                  <ul className="list-disc list-inside">{message.text}</ul>
                ) : (
                  message.text
                )}
              </span>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 px-4 py-2 border border-sky-300 rounded-lg focus:outline-none focus:border-sky-500"
            placeholder="Ask a financial question..."
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading}
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:bg-sky-300"
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIIntegration;
