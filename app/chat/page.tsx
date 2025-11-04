'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftIcon, PaperAirplaneIcon, ArrowPathIcon, PaperClipIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ChatBubbleLeftIcon, UserCircleIcon, DocumentIcon } from '@heroicons/react/24/solid';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  files?: { name: string; id: string }[];
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: 'Welcome to Mind Channel! I\'m MCWelcome, your AI assistant. How can I help you transform your business today?' 
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; id: string; file: File }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const suggestedQuestions = [
    "How can AI help my business grow?",
    "What services do you offer?",
    "Tell me about your automation solutions",
    "How do I get started?",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleReset = () => {
    setMessages([
      { 
        role: 'assistant', 
        content: 'Welcome to Mind Channel! I\'m MCWelcome, your AI assistant. How can I help you transform your business today?' 
      },
    ]);
    setThreadId(null);
    setInput('');
    setUploadedFiles([]);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newFiles: { name: string; id: string; file: File }[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          newFiles.push({
            name: file.name,
            id: data.fileId,
            file: file,
          });
        }
      }

      setUploadedFiles([...uploadedFiles, ...newFiles]);
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const fileIds = uploadedFiles.map(f => f.id);
    const fileNames = uploadedFiles.map(f => ({ name: f.name, id: f.id }));
    
    // clear input early so UI updates immediately
    setInput('');
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: userMessage,
      files: fileNames.length > 0 ? fileNames : undefined
    }]);
    setUploadedFiles([]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          threadId: threadId,
          fileIds: fileIds.length > 0 ? fileIds : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && !data.reset) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.response,
        }]);
        if (data.threadId && !threadId) setThreadId(data.threadId);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again or reset the chat.',
        }]);
        if (data.reset) setThreadId(null);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I couldn\'t connect to the server. Please try again.',
      }]);
    } finally {
      setIsLoading(false);
      // reset textarea height after sending so it doesn't stay expanded
      try {
        if (textareaRef.current) {
          textareaRef.current.style.height = '52px';
          textareaRef.current.style.overflowY = 'hidden';
        }
      } catch (_e) {
        // ignore DOM errors in non-browser contexts
      }
      // ensure we scroll to bottom after message and assistant reply
      setTimeout(() => scrollToBottom(), 120);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-green-50 via-white to-green-50/30 flex">
      {/* Left Sidebar */}
      <div className="hidden lg:flex lg:w-64 xl:w-80 border-r border-gray-200 bg-white flex-col p-6">
        <Link href="/" className="inline-flex items-center text-gray-700 hover:text-green-600 font-medium transition-colors mb-8">
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to Home
        </Link>
        
        <div className="space-y-4 flex-1">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-2">💡 Tips</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Upload files to analyze</li>
              <li>• Ask about your business</li>
              <li>• Get AI solutions</li>
              <li>• Press Enter to send</li>
            </ul>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 shadow-lg text-white">
            <h3 className="font-semibold mb-2">🚀 Quick Actions</h3>
            <div className="space-y-2 text-sm">
              <button className="w-full text-left py-2 px-3 bg-white/20 hover:bg-white/30 rounded-lg transition-all">
                Explore Solutions
              </button>
              <button className="w-full text-left py-2 px-3 bg-white/20 hover:bg-white/30 rounded-lg transition-all">
                View Services
              </button>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleReset}
          className="mt-4 w-full inline-flex items-center justify-center px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all"
        >
          <ArrowPathIcon className="w-5 h-5 mr-2" />
          Reset Chat
        </button>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b bg-white">
          <Link href="/" className="inline-flex items-center text-gray-700 hover:text-green-600 font-medium transition-colors">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back
          </Link>
          <button
            onClick={handleReset}
            className="inline-flex items-center px-3 py-2 text-gray-700 hover:text-green-600 font-medium transition-colors"
          >
            <ArrowPathIcon className="w-5 h-5 mr-2" />
            Reset
          </button>
        </div>

        {/* Chat Header - Full Width */}
        <div className="bg-gradient-to-br from-green-100 via-green-50 to-white px-6 py-8 flex-shrink-0 border-b border-green-200">
          <div className="flex items-center space-x-4 max-w-4xl mx-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
              <ChatBubbleLeftIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Chat with MCWelcome</h1>
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-green-700 text-sm font-medium">AI Assistant Active</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto overflow-hidden">

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-r from-green-600 to-green-500' 
                        : 'bg-gradient-to-r from-green-500 to-green-400'
                    }`}>
                      {msg.role === 'user' ? (
                        <UserCircleIcon className="w-6 h-6 text-white" />
                      ) : (
                        <ChatBubbleLeftIcon className="w-5 h-5 text-white" />
                      )}
                    </div>
                    
                    {/* Message bubble */}
                    <div className={`p-4 rounded-2xl ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                        : 'bg-white text-gray-900 shadow-md border border-gray-200'
                    }`}>
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      {msg.files && msg.files.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {msg.files.map((file, fileIdx) => (
                            <div key={fileIdx} className={`flex items-center space-x-2 text-sm ${
                              msg.role === 'user' ? 'text-white/90' : 'text-gray-600'
                            }`}>
                              <DocumentIcon className="w-4 h-4" />
                              <span>{file.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Suggested questions */}
            {messages.length === 1 && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <p className="text-sm text-gray-600 font-medium">Suggested questions:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {suggestedQuestions.map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(question)}
                      className="text-left p-3 rounded-full border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all text-sm text-gray-700 hover:text-green-700"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
            
            {/* Loading indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-start space-x-3 max-w-[80%]">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-r from-green-500 to-green-400">
                    <ChatBubbleLeftIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="p-4 rounded-2xl bg-white shadow-md border border-gray-200">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-6 border-t border-gray-200 flex-shrink-0">
            {/* Uploaded files preview */}
            {uploadedFiles.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
                    <DocumentIcon className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700">{file.name}</span>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="w-full border-2 border-gray-300 rounded-[28px] shadow-sm hover:shadow-md focus-within:border-green-500 transition-all">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type your message..."
                disabled={isLoading}
                rows={1}
                className="w-full pl-6 pr-4 pt-4 pb-2 bg-transparent border-none focus:outline-none focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed resize-none overflow-hidden scrollbar-hide"
                style={{ 
                  minHeight: '52px',
                  maxHeight: '200px',
                  lineHeight: '1.5',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  const newHeight = Math.min(Math.max(target.scrollHeight, 52), 200);
                  target.style.height = newHeight + 'px';
                  // Allow scrolling but hide scrollbar
                  if (target.scrollHeight > 200) {
                    target.style.overflowY = 'scroll';
                  } else {
                    target.style.overflowY = 'hidden';
                  }
                }}
              />
              <div className="flex items-center justify-between px-3 pb-3">
                <div className="flex items-center space-x-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.txt,.doc,.docx,.csv,.json,.png,.jpg,.jpeg"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading || isUploading}
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Attach files"
                  >
                    <PaperClipIcon className="w-5 h-5" />
                  </button>
                  {isUploading && (
                    <span className="text-xs text-gray-500">Uploading...</span>
                  )}
                </div>
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="p-2.5 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-green-600 shadow-sm"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center w-full">
              Powered by OpenAI • Your conversations are secure and private
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
