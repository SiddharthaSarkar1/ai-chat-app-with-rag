import { useState, useRef, useEffect } from 'react';
import './index.css';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

// New component for PDF Upload
const PdfUpload = ({ onUploadSuccess, setIsLoading }: { onUploadSuccess: () => void, setIsLoading: (isLoading: boolean) => void }) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('File upload failed');
      }

      const result = await response.json();
      console.log('Upload successful:', result);
      alert('PDF processed successfully! You can now ask questions.');
      onUploadSuccess(); // Notify the parent component
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('There was an error uploading or processing the PDF.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='pdf-upload-container'>
      <h2>Upload PDF for RAG</h2>
      <p>Upload a PDF document to start asking questions about its content.</p>
      <input type="file" accept=".pdf" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!file}>Upload and Process PDF</button>
    </div>
  );
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

  const resetChat = () => {
    setMessages([]);
    setThreadId(Date.now());
    setIsPdfReady(false); // Reset the PDF state as well
  };

  return (
    <div className='chat-container'>
      <header className='chat-header'>
        <h1>RAG App</h1>
        <button className='reset-button' onClick={resetChat}>
          <svg
            width='16'
            height='16'
            viewBox='0 0 16 16'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M8 3V1L4 5L8 9V7C10.21 7 12 8.79 12 11C12 13.21 10.21 15 8 15C5.79 15 4 13.21 4 11H2C2 14.31 4.69 17 8 17C11.31 17 14 14.31 14 11C14 7.69 11.31 5 8 5V3Z'
              fill='currentColor'
            />
          </svg>
          New Chat
        </button>
      </header>

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
