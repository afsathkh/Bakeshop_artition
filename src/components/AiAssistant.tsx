import React, { useState, useRef, useEffect, FormEvent } from "react";
import { Sparkles, MessageSquare, X, Send, ChefHat, BarChart3, TrendingUp, AlertTriangle } from "lucide-react";
import { AiMessage, CartItem } from "../types";

interface AiAssistantProps {
  isAdminMode: boolean;
  cartItems: CartItem[];
  userToken: string | null;
}

export default function AiAssistant({ isAdminMode, cartItems, userToken }: AiAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      role: "assistant",
      text: "Bonjour! I am Chef Jean-Luc, your AI Culinary Companion. Ask me details about slow-fermented starter ratios, allergen safe pastries, or ideal coffee pairings!"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [coachingText, setCoachingText] = useState("");
  const [coachingLoading, setCoachingLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Handle customer chat
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = inputValue;
    setInputValue("");
    const updatedMessages = [...messages, { role: "user" as const, text: userMsg }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": userToken ? `Bearer ${userToken}` : ""
        },
        body: JSON.stringify({
          prompt: userMsg,
          history: updatedMessages.slice(1, -1), // skip initial greeting, send recent back-and-forth
          cartItems: cartItems
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, { role: "assistant", text: data.text }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", text: `Désolé! ${data.error || "An API issue occurred."}` }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", text: "Ah, mon dieu! Connection timed out. Please verify your internet or server status." }]);
    } finally {
      setLoading(false);
    }
  };

  // Trigger Admin Performance Coach
  const fetchAdminCoach = async () => {
    setCoachingLoading(true);
    try {
      const response = await fetch("/api/gemini/analytics-coach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": userToken ? `Bearer ${userToken}` : ""
        }
      });
      const data = await response.json();
      if (response.ok) {
        setCoachingText(data.coachingParagraph);
      } else {
        setCoachingText("An error was returned by the Analytics coach. Make sure your server is initialized properly.");
      }
    } catch (err) {
      setCoachingText("Cannot reach the AI coach. Verify internet and server credentials.");
    } finally {
      setCoachingLoading(false);
    }
  };

  useEffect(() => {
    // Refresh coach advice if user is admin and assistant sheet is opened
    if (isAdminMode && isOpen) {
      fetchAdminCoach();
    }
  }, [isAdminMode, isOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Tiny Notification Dot for Cart/Admin */}
      {!isOpen && !isAdminMode && cartItems.length > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-paston-rose opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-paston-rose text-[10px] text-white items-center justify-center font-bold">Chef</span>
        </span>
      )}

      {/* Trigger Button */}
      <button
        id="ai-assistant-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-amber-800 dark:bg-amber-700 hover:bg-amber-900 text-white p-4 rounded-full shadow-2xl transition duration-300 transform hover:scale-105 active:scale-95"
      >
        {isOpen ? <X className="h-6 w-6" /> : (
          isAdminMode ? <BarChart3 className="h-6 w-6" /> : <ChefHat className="h-6 w-6" />
        )}
        <span className="hidden md:inline font-medium text-sm">
          {isOpen ? "Close" : (isAdminMode ? "AI Sales Coach" : "Chef Jean-Luc")}
        </span>
      </button>

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-96 max-w-sm h-[500px] bg-white dark:bg-[#221B1B] rounded-2xl shadow-2xl border border-amber-100 dark:border-neutral-800 flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-800 to-amber-900 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isAdminMode ? <BarChart3 className="h-5 w-5 text-amber-200" /> : <ChefHat className="h-5 w-5 text-amber-200" />}
              <div>
                <h3 className="font-serif font-semibold text-sm">
                  {isAdminMode ? "AI Patisserie Business Advisor" : "Chef Jean-Luc Coppée"}
                </h3>
                <p className="text-[10px] text-amber-100">
                  {isAdminMode ? "Predictive Stock & Sales Strategist" : "Maître Boulanger - Live Cooking Chat"}
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-amber-200 hover:text-white transition">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body Section */}
          {isAdminMode ? (
            /* ADMIN BUSINESS COACH MODE */
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50 dark:bg-[#1E1818]/60">
              <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-100 dark:border-amber-900/35">
                <TrendingUp className="h-5 w-5 text-amber-700 dark:text-amber-300" />
                <span className="text-xs font-semibold uppercase text-amber-800 dark:text-amber-300 tracking-wider">Automated Sales Commentary</span>
              </div>

              {coachingLoading ? (
                <div className="space-y-3 p-2">
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-5/6"></div>
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-full"></div>
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-2/3"></div>
                </div>
              ) : (
                <div className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans scroll-smooth whitespace-pre-line bg-white dark:bg-[#251E1E] p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
                  {coachingParagraphs(coachingText || "Bonjour Admin! No sales generated yet, or API limits reached. Let's bakery create together!")}
                </div>
              )}

              <button
                onClick={fetchAdminCoach}
                className="w-full text-center text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center justify-center gap-1 mt-2"
              >
                <Sparkles className="h-3 w-3" /> Refresh Executive Commentary
              </button>
            </div>
          ) : (
            /* USER CULINARY CHAT MODE */
            <>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FCFBF9] dark:bg-[#1D1717]">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                        m.role === "user"
                          ? "bg-amber-800 text-white rounded-tr-none"
                          : "bg-amber-100/70 dark:bg-neutral-800/80 text-neutral-800 dark:text-neutral-200 rounded-tl-none border border-amber-200/20"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-amber-100/50 dark:bg-neutral-800/50 px-3 py-2 rounded-2xl rounded-tl-none text-xs flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 bg-amber-800 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-amber-800 rounded-full animate-bounce delay-100"></span>
                      <span className="w-1.5 h-1.5 bg-amber-800 rounded-full animate-bounce delay-200"></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-[#221B1B] border-t border-amber-100 dark:border-neutral-800 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask a sourdough secret or pastry pairing..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-1 bg-neutral-100 dark:bg-neutral-800 border-none outline-none text-xs rounded-full py-2 px-4 focus:ring-1 focus:ring-amber-500 text-neutral-900 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={loading || !inputValue.trim()}
                  className="bg-amber-800 hover:bg-amber-900 text-white p-2 rounded-full transition disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Convert paragraph text into beautiful formatting
function coachingParagraphs(text: string) {
  return text.split("\n\n").map((para, i) => {
    if (para.startsWith("1.") || para.startsWith("2.") || para.startsWith("3.")) {
      return (
        <p key={i} className="mb-3 font-medium border-l-2 border-amber-600 pl-2 text-amber-900 dark:text-amber-300">
          {para}
        </p>
      );
    }
    return <p key={i} className="mb-3">{para}</p>;
  });
}
