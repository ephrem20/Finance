import React, { useState, FormEvent, useRef, useEffect } from 'react';
import { GoogleGenAI } from "https://aistudiocdn.com/@google/genai@^0.16.0/dist/index.mjs";
import type { Transaction, ChatMessage } from '../types';
import { MessageAuthor } from '../types';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
}

const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose, transactions }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if(isOpen) {
        setMessages([
            { author: MessageAuthor.AI, text: "Hello! How can I help you analyze your finances for this period?" }
        ]);
        setInput('');
        setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { author: MessageAuthor.USER, text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError('');
    
    // Prepare data for AI
    const transactionsSummary = transactions.map(t => 
        `${t.type}: ${t.description} (${t.category}) - $${t.amount.toFixed(2)} on ${new Date(t.date).toLocaleDateString()}`
    ).join('\n');
    
    const prompt = `
        Based on the following list of financial transactions, please answer the user's question.
        Provide a concise and helpful analysis. Do not just list the data back to them.
        
        Transactions Data:
        ${transactionsSummary.length > 0 ? transactionsSummary : "There are no transactions for this period."}
        
        User's Question: "${input}"
    `;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const responseStream = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      setMessages(prev => [...prev, { author: MessageAuthor.AI, text: '' }]);
      
      for await (const chunk of responseStream) {
        const chunkText = chunk.text;
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage.author === MessageAuthor.AI) {
            return [...prev.slice(0, -1), { ...lastMessage, text: lastMessage.text + chunkText }];
          }
          return prev;
        });
      }

    } catch (err) {
      const errorMessage = 'Sorry, I encountered an error. Please check your API Key and try again.';
      setError(errorMessage);
      setMessages(prev => [...prev, { author: MessageAuthor.AI, text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
        <header className="p-4 border-b border-gray-700 flex justify-between items-center">
             <h2 className="text-xl font-bold text-white">AI Financial Assistant</h2>
             <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </header>
        
        <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
                <div key={index} className={`flex items-start gap-3 ${msg.author === MessageAuthor.USER ? 'justify-end' : ''}`}>
                   {msg.author === MessageAuthor.AI && <div className="w-8 h-8 rounded-full bg-brand-secondary flex items-center justify-center font-bold flex-shrink-0">AI</div>}
                   <div className={`p-3 rounded-lg max-w-lg ${msg.author === MessageAuthor.USER ? 'bg-brand-primary' : 'bg-gray-700'}`}>
                      <p className="text-white whitespace-pre-wrap">{msg.text}</p>
                   </div>
                </div>
            ))}
            {isLoading && (
                 <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-secondary flex items-center justify-center font-bold flex-shrink-0">AI</div>
                    <div className="p-3 rounded-lg bg-gray-700">
                        <div className="flex gap-1 items-center">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-0"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-200"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-400"></span>
                        </div>
                    </div>
                </div>
            )}
        </div>
        
        <footer className="p-4 border-t border-gray-700">
             {error && <p className="text-red-400 text-sm mb-2 text-center">{error}</p>}
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input 
                    type="text" 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask about your finances..."
                    disabled={isLoading}
                    className="flex-1 bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:ring-brand-primary focus:border-brand-primary disabled:opacity-50"
                />
                <button 
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    Send
                </button>
            </form>
        </footer>
      </div>
    </div>
  );
};

export default AIAssistantModal;
