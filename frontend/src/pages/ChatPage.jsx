import { useState, useEffect, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, Sparkles } from 'lucide-react';
import ChatSidebar from '../components/ChatSidebar';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import { chatsAPI, streamQuery } from '../api/client';

export default function ChatPage() {
  const { spaceId } = useOutletContext();
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);
  const controllerRef = useRef(null);

  useEffect(() => {
    loadChats();
  }, [spaceId]);

  useEffect(() => {
    if (activeChatId) {
      loadMessages(activeChatId);
    }
  }, [activeChatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  async function loadChats() {
    setLoadingChats(true);
    try {
      const data = await chatsAPI.list(spaceId);
      setChats(data);
      if (data.length > 0 && !activeChatId) {
        setActiveChatId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load chats:', err);
    } finally {
      setLoadingChats(false);
    }
  }

  async function loadMessages(chatId) {
    setLoadingMessages(true);
    try {
      const data = await chatsAPI.get(spaceId, chatId);
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  }

  async function handleNewChat() {
    try {
      const chat = await chatsAPI.create(spaceId, { title: 'New Chat' });
      setChats([chat, ...chats]);
      setActiveChatId(chat.id);
      setMessages([]);
    } catch (err) {
      console.error('Failed to create chat:', err);
    }
  }

  async function handleDeleteChat(chatId) {
    try {
      await chatsAPI.delete(spaceId, chatId);
      setChats(chats.filter((c) => c.id !== chatId));
      if (activeChatId === chatId) {
        const remaining = chats.filter((c) => c.id !== chatId);
        setActiveChatId(remaining.length > 0 ? remaining[0].id : null);
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  }

  const handleSendQuery = useCallback(
    (question) => {
      if (!activeChatId || isStreaming) return;

      // Add user message optimistically
      const userMsg = {
        id: 'temp-user-' + Date.now(),
        role: 'user',
        content: question,
        citations: [],
        created_at: new Date().toISOString(),
      };

      // Add streaming assistant placeholder
      const assistantMsg = {
        id: 'temp-assistant-' + Date.now(),
        role: 'assistant',
        content: '',
        citations: [],
        created_at: new Date().toISOString(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);

      // Update chat title in the sidebar
      setChats((prev) =>
        prev.map((c) =>
          c.id === activeChatId && c.title === 'New Chat'
            ? { ...c, title: question.slice(0, 50) + (question.length > 50 ? '...' : '') }
            : c
        )
      );

      controllerRef.current = streamQuery(
        spaceId,
        activeChatId,
        question,
        // onToken
        (token) => {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && last.role === 'assistant') {
              updated[updated.length - 1] = { ...last, content: last.content + token };
            }
            return updated;
          });
        },
        // onCitations
        (citations) => {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && last.role === 'assistant') {
              updated[updated.length - 1] = { ...last, citations };
            }
            return updated;
          });
        },
        // onDone
        () => {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && last.role === 'assistant') {
              updated[updated.length - 1] = { ...last, isStreaming: false };
            }
            return updated;
          });
          setIsStreaming(false);
        },
        // onError
        (error) => {
          console.error('Stream error:', error);
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && last.role === 'assistant') {
              updated[updated.length - 1] = {
                ...last,
                content: `Error: ${error}. Please make sure you have uploaded documents to this space.`,
                isStreaming: false,
              };
            }
            return updated;
          });
          setIsStreaming(false);
        }
      );
    },
    [activeChatId, isStreaming, spaceId]
  );

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeChatId ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="loading-dots">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-purple/10 to-accent-cyan/10 flex items-center justify-center mx-auto mb-4 border border-white/5">
                      <Sparkles size={28} className="text-accent-purple" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">Start a conversation</h3>
                    <p className="text-dark-300 text-sm max-w-sm">
                      Ask questions about the research papers you've uploaded to this space
                    </p>
                  </motion.div>
                </div>
              ) : (
                <div>
                  {messages.map((msg) => (
                    <ChatMessage
                      key={msg.id}
                      message={msg}
                      isStreaming={msg.isStreaming}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <ChatInput onSend={handleSendQuery} disabled={isStreaming} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <Bot size={40} className="mx-auto mb-4 text-dark-400" />
              <p className="text-dark-300">
                {chats.length === 0
                  ? 'Create a new chat to get started'
                  : 'Select a chat from the sidebar'}
              </p>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
