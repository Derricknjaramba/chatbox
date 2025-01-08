import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import EmojiPicker from "emoji-picker-react"; // Import the emoji picker correctly

// Socket.IO client connection to the Flask backend
const socket = io("http://localhost:5000");

const App = () => {
  const [nickname, setNickname] = useState(""); // The nickname of the user
  const [message, setMessage] = useState(""); // Message input
  const [messages, setMessages] = useState([]); // Array to store all messages
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // Control emoji picker visibility

  // Handle emoji selection
  const handleEmojiClick = (event, emojiObject) => {
    if (emojiObject && emojiObject.emoji) {
      // Append the emoji to the current message
      setMessage((prevMessage) => prevMessage + emojiObject.emoji);
      setShowEmojiPicker(false);  // Hide the emoji picker after selecting the emoji
    }
  };

  // Handle user nickname input
  const handleNicknameSet = () => {
    const username = prompt("Enter your nickname:");
    if (username.length < 2) {
      alert("Nickname must be at least 2 characters long.");
      return;
    }
    socket.emit("set_nickname", username); // Set nickname on backend
    setNickname(username); // Store nickname locally
  };

  // On component mount
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    // Listen for incoming messages and update the state
    socket.on("message", (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]); // Add new message to state
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("message");
    };
  }, []);

  // Send message handler
  const handleSendMessage = () => {
    if (message.trim() !== "" && nickname) {
      socket.emit("message", message);  // Emit message to server
      setMessage("");  // Clear message input
    }
  };

  // Function to render messages in the chat
  const renderMessage = (msg) => {
    return <span>{msg}</span>; // Directly render message, emojis will appear as text
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="bg-blue-500 text-white p-4">
        <h1 className="text-2xl">Real-Time Chatroom</h1>
        {!nickname && (
          <button
            className="mt-2 bg-green-500 px-4 py-2 rounded text-white"
            onClick={handleNicknameSet}
          >
            Set Nickname
          </button>
        )}
        {nickname && (
          <div className="mt-2 text-white">
            Welcome, {nickname}! You are logged in.
          </div>
        )}
      </div>

      <div className="flex flex-col flex-grow p-4 overflow-y-auto">
        <div className="space-y-2">
          {messages.map((msg, index) => {
            const [timestamp, ...messageContent] = msg.split(" - ");
            return (
              <div key={index} className="p-2 bg-white shadow rounded">
                <p className="text-gray-500 text-xs">{timestamp}</p>
                <p className="text-black">
                  {renderMessage(messageContent.join(" - "))} {/* Render message */}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex p-4 bg-gray-800 relative">
        <input
          type="text"
          placeholder="Type a message"
          className="w-full p-2 rounded-l text-black"
          value={message}
          onChange={(e) => setMessage(e.target.value)}  // Update message state as user types
        />
        <button
          className="bg-blue-500 px-4 py-2 rounded-r text-white"
          onClick={handleSendMessage}
        >
          Send
        </button>
        <button
          className="bg-gray-600 text-white ml-2 px-4 py-2 rounded"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)} // Toggle emoji picker visibility
        >
          😊
        </button>

        {/* Conditionally render the Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-50">
            <EmojiPicker 
              onEmojiClick={handleEmojiClick} 
              native={true}  // Use native emoji format
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;






















