import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot } from 'lucide-react';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';

const bookServiceTool: FunctionDeclaration = {
  name: 'bookService',
  description: 'Books a plumbing service request for the customer. Call this ONLY after you have collected their name, full address, either email or phone, and the type of service needed.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: 'Full name of the customer' },
      address: { type: Type.STRING, description: 'Full physical address for the service' },
      email: { type: Type.STRING, description: 'Email address of the customer (optional if phone is provided)' },
      phone: { type: Type.STRING, description: 'Phone number of the customer (optional if email is provided)' },
      service: { type: Type.STRING, description: 'Type of service needed (e.g., General Plumbing Repair, Water Heater Service, Drain Cleaning, Leak Detection, Other)' },
      message: { type: Type.STRING, description: 'Brief description of the issue' }
    },
    required: ['name', 'address', 'service']
  }
};

const SYSTEM_INSTRUCTION = `You are the expert AI assistant for IRONFLOW Plumbing in Austin, TX. 

BUSINESS KNOWLEDGE:
- Owner: Marcus "Iron" Delgado, a Master Plumber (Lic #M-39482) with 22 years of experience.
- Heritage: 3rd generation Texas plumber. Family-owned, not a franchise.
- Service Area: Greater Austin, TX.
- Promise: 60-minute emergency response or the call is free.
- Pricing: Upfront flat-rate pricing. No hidden fees.
- Warranty: 2-year warranty on all work.
- Phone: (512) 555-0199.

CAPABILITIES:
- Help users diagnose plumbing issues (leaks, clogs, water heater problems, etc.).
- Provide expert advice on maintenance.
- Book service requests using the 'bookService' tool.

BOOKING PROTOCOL:
If a user needs service, you MUST collect:
1. Full Name
2. Full Service Address
3. Phone Number OR Email (both is better)
4. Description of the issue.

Once you have these, call 'bookService' immediately. 

TONE:
Professional, expert, confident, and empathetic. You represent Marcus Delgado's high standards. Be concise but helpful.`;

export default function ChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'model', text: string}[]>([
    { role: 'model', text: 'Hi! I am the IRONFLOW AI Assistant. How can I help you with your plumbing today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getChatSession = async () => {
    if (!chatRef.current) {
      let apiKey = '';
      
      // Fetch from backend first to get the user's overridden key
      try {
        const res = await fetch('/api/config');
        if (res.ok) {
          const data = await res.json();
          apiKey = data.apiKey;
        }
      } catch (e) {
        console.warn("Failed to fetch API key from backend:", e);
      }

      // Fallback to process.env if backend fetch failed
      if (!apiKey) {
        try {
          // @ts-ignore
          apiKey = process.env.GEMINI_API_KEY;
        } catch (e) {
          // process is not defined
        }
      }

      if (!apiKey) {
        throw new Error("API key is missing. Please provide a valid API key.");
      }

      const ai = new GoogleGenAI({ apiKey });
      chatRef.current = ai.chats.create({
        model: 'gemini-3.1-pro-preview',
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ functionDeclarations: [bookServiceTool] }]
        }
      });
    }
    return chatRef.current;
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const chat = await getChatSession();
      const response = await chat.sendMessage({ message: userText });

      if (response.functionCalls && response.functionCalls.length > 0) {
        const call = response.functionCalls[0];
        if (call.name === 'bookService') {
          const args = call.args as any;
          
          try {
            const leadResponse = await fetch('/api/leads', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: args.name,
                address: args.address,
                email: args.email || '',
                phone: args.phone || '',
                service: args.service,
                message: args.message || 'Booked via AI Assistant'
              })
            });
            
            if (!leadResponse.ok) {
              console.error(`Failed to save lead: ${leadResponse.statusText}`);
            }
          } catch (fetchError) {
            console.error("Failed to save lead to database:", fetchError);
          }

          const contactMethod = args.phone ? `at ${args.phone}` : `via email at ${args.email}`;
          const successMsg = `I have successfully booked your service request for ${args.address}! Our dispatch team will review it and contact you shortly ${contactMethod}. Is there anything else I can help you with?`;
          
          setMessages(prev => [...prev, { role: 'model', text: successMsg }]);
          
          // Send the function response back to the model
          await chat.sendMessage({ 
            message: [{ 
              functionResponse: { 
                name: 'bookService', 
                response: { success: true, message: 'Booking confirmed' } 
              } 
            }] 
          });
        }
      } else if (response.text) {
        setMessages(prev => [...prev, { role: 'model', text: response.text }]);
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: `System Error: ${error.message || JSON.stringify(error)}. Please call Marcus directly at (512) 555-0199 for immediate assistance!` 
      }]);
      // Reset chat session so it can try to recover on the next message
      chatRef.current = null;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-teal text-midnight rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform z-50 ${isOpen ? 'hidden' : 'flex'}`}
      >
        <MessageCircle size={28} />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] bg-white rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden border border-slate-200"
          >
            {/* Header */}
            <div className="bg-midnight text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-2 font-display font-bold">
                <Bot className="text-teal" size={20} />
                IRONFLOW AI
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-teal text-midnight font-medium rounded-br-none' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 text-slate-700 p-3 rounded-xl rounded-bl-none shadow-sm flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-teal" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-200">
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal text-sm"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-midnight text-white p-2 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
