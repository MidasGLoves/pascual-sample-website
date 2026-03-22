import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type, FunctionDeclaration, GenerateContentResponse } from "@google/genai";
import { MessageSquare, X, Send, User, Bot, Loader2, Phone, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const submitServiceRequestDeclaration: FunctionDeclaration = {
  name: "submitServiceRequest",
  parameters: {
    type: Type.OBJECT,
    description: "Submit a service request for a customer when they have provided their name, address, contact info (email or phone), and description of the problem.",
    properties: {
      name: { type: Type.STRING, description: "The customer's full name." },
      address: { type: Type.STRING, description: "The customer's service address." },
      email: { type: Type.STRING, description: "The customer's email address." },
      phone: { type: Type.STRING, description: "The customer's phone number." },
      service: { type: Type.STRING, description: "The type of service or problem (e.g., 'Leaky Pipe', 'Clogged Drain')." },
      message: { type: Type.STRING, description: "Any additional details about the problem." },
    },
    required: ["name", "address", "service"],
  },
};

export default function ChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hi! I'm the IronFlow Assistant. How can I help you with your plumbing needs today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getChatSession = async (forceNewWithIndex?: number) => {
    if (!chatRef.current || forceNewWithIndex !== undefined) {
      // Standard Vite way to access env variables
      let rawKeys = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
      
      if (!rawKeys) {
        console.log("VITE_GEMINI_API_KEY not found in client env, fetching from /api/config...");
        try {
          const res = await fetch('/api/config');
          if (res.ok) {
            const data = await res.json();
            if (data.apiKey) {
              rawKeys = data.apiKey;
            }
          } else {
            console.error("Failed to fetch config from server:", res.status);
          }
        } catch (e) {
          console.warn("Failed to fetch API key from backend:", e);
        }
      }

      if (!rawKeys) {
        throw new Error("API key is missing. If you are on Vercel, make sure you have added GEMINI_API_KEY or VITE_GEMINI_API_KEY to your project environment variables.");
      }

      const keys = rawKeys.split(',').map((k: string) => k.trim()).filter(Boolean);
      if (keys.length === 0) {
        throw new Error("No valid API keys found.");
      }

      // Use the provided index or default to 0
      const index = forceNewWithIndex !== undefined ? forceNewWithIndex % keys.length : 0;
      const apiKey = keys[index];

      console.log(`Initializing chat with key index ${index} (starts with ${apiKey.substring(0, 7)})`);

      const ai = new GoogleGenAI({ apiKey });
      chatRef.current = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: `You are a helpful assistant for IronFlow Plumbing. 
          Your goal is to help customers book a service request. 
          You MUST gather the following information from the customer:
          1. Full Name
          2. Service Address
          3. Contact Information (either Email or Phone Number, ideally both)
          4. Type of problem or service needed.
          
          Be professional, friendly, and efficient. 
          Once you have gathered all the necessary information, call the 'submitServiceRequest' function to book the appointment.
          After calling the function, confirm to the user that their request has been submitted and that Marcus or a team member will contact them shortly.`,
          tools: [{ functionDeclarations: [submitServiceRequestDeclaration] }],
        },
      });
    }
    return chatRef.current;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    let currentAttempt = 0;
    const maxAttempts = 4; // Try up to 4 keys if we have them

    while (currentAttempt < maxAttempts) {
      try {
        const chat = await getChatSession(currentAttempt > 0 ? currentAttempt : undefined);
        const result = await chat.sendMessage({ message: userMessage });
        const response = result as GenerateContentResponse;

        const functionCalls = response.functionCalls;
        if (functionCalls && functionCalls.length > 0) {
          for (const call of functionCalls) {
            if (call.name === 'submitServiceRequest') {
              const args = call.args as any;
              
              // Call the backend API
              try {
                const apiRes = await fetch('/api/leads', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(args),
                });
                
                if (apiRes.ok) {
                  // Send the function response back to the model
                  const followUp = await chat.sendMessage({ 
                    message: [{ 
                      functionResponse: { 
                        name: 'submitServiceRequest', 
                        response: { success: true, message: 'Service request submitted successfully to the backend.' } 
                      } 
                    }] 
                  });
                  setMessages(prev => [...prev, { role: 'model', text: followUp.text }]);
                } else {
                  throw new Error("Failed to submit request to backend");
                }
              } catch (apiErr) {
                console.error("API Error:", apiErr);
                const followUp = await chat.sendMessage({ 
                  message: [{ 
                    functionResponse: { 
                      name: 'submitServiceRequest', 
                      response: { success: false, message: 'There was an error submitting the request to our system. Please try again or call us directly.' } 
                    } 
                  }] 
                });
                setMessages(prev => [...prev, { role: 'model', text: followUp.text }]);
              }
            }
          }
        } else if (response.text) {
          setMessages(prev => [...prev, { role: 'model', text: response.text }]);
        }
        
        // If we reached here, success!
        setIsLoading(false);
        return;

      } catch (error: any) {
        console.error(`Chat error on attempt ${currentAttempt + 1}:`, error);
        const errorMsg = error.message || JSON.stringify(error);
        
        // Check if it's an API key related error that warrants a retry with a different key
        const isRetryable = errorMsg.includes("API_KEY_INVALID") || 
                           errorMsg.includes("invalid API key") || 
                           errorMsg.includes("QUOTA_EXCEEDED") ||
                           errorMsg.includes("429") ||
                           errorMsg.includes("400");

        if (isRetryable && currentAttempt < maxAttempts - 1) {
          console.warn(`Attempt ${currentAttempt + 1} failed with retryable error. Trying next key...`);
          currentAttempt++;
          chatRef.current = null; // Reset session to force new key
          continue;
        }

        // If not retryable or we've exhausted attempts, show error
        let userFriendlyMessage = "I'm having trouble connecting to my brain right now.";
        
        if (errorMsg.includes("API key is missing")) {
          userFriendlyMessage = "The AI assistant's API key is missing. Please check your configuration.";
        } else if (errorMsg.includes("API_KEY_INVALID") || errorMsg.includes("invalid API key")) {
          userFriendlyMessage = "All provided AI API keys appear to be invalid.";
        } else if (errorMsg.includes("QUOTA_EXCEEDED")) {
          userFriendlyMessage = "The AI assistant has reached its usage limit on all available keys.";
        }

        setMessages(prev => [...prev, { 
          role: 'model', 
          text: `${userFriendlyMessage} Please call Marcus directly at (512) 555-0199 for immediate assistance!` 
        }]);
        chatRef.current = null;
        setIsLoading(false);
        return;
      }
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-teal text-midnight rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-50 ${isOpen ? 'hidden' : 'flex'}`}
        aria-label="Open Chat"
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-slate200"
          >
            {/* Header */}
            <div className="bg-midnight p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-teal rounded-full flex items-center justify-center">
                  <Bot size={18} className="text-midnight" />
                </div>
                <div>
                  <h3 className="text-white font-medium text-sm">IronFlow Assistant</h3>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="text-teal text-[10px] uppercase tracking-wider font-bold">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setMessages([{ role: 'model', text: "Chat reset. How can I help you with your plumbing today?" }]);
                    chatRef.current = null;
                  }}
                  title="Reset Chat"
                  className="text-slate400 hover:text-white transition-colors"
                >
                  <RefreshCw size={16} />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-slate400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate50"
            >
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-teal' : 'bg-midnight'}`}>
                      {msg.role === 'user' ? <User size={14} className="text-midnight" /> : <Bot size={14} className="text-teal" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm ${
                      msg.role === 'user' 
                        ? 'bg-teal text-midnight rounded-tr-none' 
                        : 'bg-white text-slate700 shadow-sm border border-slate200 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-2 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-midnight flex items-center justify-center">
                      <Bot size={14} className="text-teal" />
                    </div>
                    <div className="p-3 rounded-2xl bg-white border border-slate200 rounded-tl-none">
                      <Loader2 size={16} className="animate-spin text-teal" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1 bg-slate100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-teal outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 bg-midnight text-teal rounded-xl flex items-center justify-center hover:bg-slate800 transition-colors disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-[10px] text-slate400 text-center mt-3 flex items-center justify-center gap-1">
                <Phone size={10} /> Emergency? Call (512) 555-0199
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
