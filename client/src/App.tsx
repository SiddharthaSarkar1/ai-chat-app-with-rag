import { useState, useRef, useEffect } from 'react';
import './index.css';
import { PdfUpload } from './components/PDFUpload';
import Header from './components/Header';
import api from './config/axios';

export interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPdfReady, setIsPdfReady] = useState(false); // New state to track if PDF is ready
  const [threadId, setThreadId] = useState<number>(Date.now());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = async () => {
    if (inputText.trim() === '' || isLoading || !isPdfReady) return;

    const userMessage = {
      id: Date.now(),
      text: inputText.trim(),
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage.text,
          thread_id: threadId.toString(), // Ensure thread_id is a string
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.text();

      const aiMessage = {
        id: Date.now(),
        text: data,
        isUser: false,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);

      const errorMessage = {
        id: Date.now(),
        text: 'Sorry, there was an error processing your request.',
        isUser: false,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetDatabase = async () => {
    try {
      const confirm = window.confirm(
        "Are you sure you want to delete the data from database?"
      );
      if (!confirm) return;

      const { data } = await api.post(
        `/api/reset`
      );

      window.alert(data);

    } catch (error: any) {
      console.error("error in resetDatabase method");
      console.log(error?.response?.data?.message ||
        error?.message ||
        "Something went wrong")
    }
  }

  return (
    <div className='chat-container'>
      <Header
        setMessages={setMessages}
        setThreadId={setThreadId}
        setIsPdfReady={setIsPdfReady}
        resetDatabase={resetDatabase}
      />

      {!isPdfReady ? (
        <PdfUpload onUploadSuccess={() => setIsPdfReady(true)} setIsLoading={setIsLoading} />
      ) : (
        <>
          <div className='messages-container'>
            {messages.length === 0 ? (
              <div className='empty-state'>
                <p>PDF processed. Ask a question to get started.</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${message.isUser ? 'user-message' : 'ai-message'
                    }`}
                >
                  <div className='message-avatar'>
                    {message.isUser ? 'You' : 'AI'}
                  </div>
                  <div className='message-content'>{message.text}</div>
                </div>
              ))
            )}
            {isLoading && (
              <div className='message ai-message'>
                <div className='message-avatar'>AI</div>
                <div className='message-content loading'>
                  <span className='dot'></span>
                  <span className='dot'></span>
                  <span className='dot'></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className='input-container'>
            <textarea
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={isPdfReady ? 'Type your message...' : 'Please upload a PDF to begin'}
              disabled={isLoading || !isPdfReady}
              rows={1}
            />
            <button
              className='send-button'
              onClick={sendMessage}
              disabled={inputText.trim() === '' || isLoading || !isPdfReady}
            >
              <svg
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z'
                  fill='currentColor'
                />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
}


export default App;
