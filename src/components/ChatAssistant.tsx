import React, { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message to chat
    const newMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/openai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: newMessage.content }),
      });

      const data = await response.json();

      // Add AI response
      const aiMessage: Message = {
        role: 'assistant',
        content: data.answer || 'Sorry, I couldn’t fetch an answer.',
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error fetching AI response:', err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '⚠️ Failed to connect to AI assistant.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className='chat-assistant flex flex-col h-full max-w-lg mx-auto border border-gray-300 rounded-lg shadow-lg'>
      {/* Messages window */}
      <div className='flex-1 p-4 overflow-y-auto bg-white'>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-3 p-2 rounded-lg ${
              msg.role === 'user'
                ? 'bg-blue-100 text-right'
                : 'bg-gray-100 text-left'
            }`}
          >
            <span className='font-semibold'>
              {msg.role === 'user' ? 'You' : 'Assistant'}:
            </span>{' '}
            {msg.content}
          </div>
        ))}

        {loading && (
          <div className='italic text-gray-500'>Assistant is typing...</div>
        )}
      </div>

      {/* Input box */}
      <div className='p-3 border-t flex gap-2 bg-gray-50'>
        <input
          type='text'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder='I can provide you top popular songs'
          className='flex-1 border rounded px-3 py-2 focus:outline-none'
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50'
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatAssistant;
