import React, { useState, useRef, useEffect } from "react";
import {
    Send,
    Wand2,
    RefreshCw,
    Sparkles,
    Edit3,
    Save,
    X,
    Pencil,
} from "lucide-react";

function MessageBlock({
    message,
    index,
    isRefining,
    onRefine,
    onEditMessage,
    isNew = false, // Only animate if this is a newly generated message
}) {
    const [showRefine, setShowRefine] = useState(false);
    const [refinePrompt, setRefinePrompt] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const textareaRef = useRef(null);

    // Typing animation state - only if isNew
    const [displayedText, setDisplayedText] = useState(isNew ? "" : message.ai_response);
    const [isTyping, setIsTyping] = useState(isNew);

    // Typing animation effect - only for new messages
    useEffect(() => {
        if (!message.ai_response || isEditing || isRefining) return;

        // If not a new message, show full text immediately
        if (!isNew) {
            setDisplayedText(message.ai_response);
            setIsTyping(false);
            return;
        }

        const text = message.ai_response;
        let currentIndex = 0;
        setDisplayedText("");
        setIsTyping(true);

        const typingInterval = setInterval(() => {
            if (currentIndex < text.length) {
                // Type 3-5 characters at a time for faster effect
                const charsToAdd = Math.min(3, text.length - currentIndex);
                setDisplayedText(text.substring(0, currentIndex + charsToAdd));
                currentIndex += charsToAdd;
            } else {
                clearInterval(typingInterval);
                setIsTyping(false);
            }
        }, 10);

        return () => clearInterval(typingInterval);
    }, [message.ai_response, message.id, isNew]);

    const handleRefine = () => {
        if (refinePrompt.trim()) {
            onRefine(message.id, refinePrompt);
            setRefinePrompt("");
            setShowRefine(false);
        }
    };

    const handleStartEdit = () => {
        setEditContent(message.ai_response);
        setIsEditing(true);
    };

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height =
                textareaRef.current.scrollHeight + "px";
        }
    }, [isEditing, editContent]);

    const handleSaveEdit = async () => {
        if (editContent.trim()) {
            setIsSaving(true);
            await onEditMessage(message.id, editContent.trim());
            setIsSaving(false);
            setIsEditing(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditContent("");
    };

    return (
        <>
            {/* USER PROMPT - Right aligned */}
            <div className="py-4 bg-black">
                <div className="max-w-3xl mx-auto px-6 flex justify-end">
                    <div className="flex items-start gap-3 max-w-[80%]">
                        <div className="flex-1 text-right">
                            <p className="text-gray-300 bg-[#1a1a1a] px-4 py-3 rounded-2xl rounded-tr-sm inline-block text-left">
                                {message.user_prompt}
                            </p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-[#333] flex items-center justify-center text-white font-semibold text-sm shrink-0">
                            U
                        </div>
                    </div>
                </div>
            </div>

            {/* AI RESPONSE - Left aligned */}
            <div className="py-4 bg-black">
                <div className="max-w-3xl mx-auto px-6">
                    <div className="flex items-start gap-3 max-w-[85%]">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shrink-0">
                            <Wand2 size={14} color="#fff" />
                        </div>

                        <div className="flex-1">
                            {/* Refining State */}
                            {isRefining && (
                                <div className="flex items-center gap-2 text-gray-400 bg-[#1a1a1a] px-4 py-3 rounded-2xl rounded-tl-sm">
                                    <RefreshCw size={16} className="animate-spin" />
                                    Refining this part...
                                </div>
                            )}

                            {/* Edit Mode */}
                            {!isRefining && isEditing && (
                                <div className="flex flex-col gap-3">
                                    <textarea
                                        ref={textareaRef}
                                        value={editContent}
                                        onChange={(e) =>
                                            setEditContent(e.target.value)
                                        }
                                        className="w-full min-h-[200px] p-3 bg-[#1a1a1a] border border-[#444] rounded-lg text-gray-200 text-[15px] leading-relaxed resize-none outline-none"
                                    />

                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={handleCancelEdit}
                                            className="px-4 py-2 border border-[#333] rounded-md text-gray-400 flex items-center gap-1"
                                        >
                                            <X size={14} />
                                            Cancel
                                        </button>

                                        <button
                                            onClick={handleSaveEdit}
                                            disabled={isSaving || !editContent}
                                            className="px-4 py-2 rounded-md flex items-center gap-1 bg-green-500 text-white disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {isSaving ? (
                                                <RefreshCw
                                                    size={14}
                                                    className="animate-spin"
                                                />
                                            ) : (
                                                <Save size={14} />
                                            )}
                                            Save
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Normal AI Response with typing effect */}
                            {!isRefining && !isEditing && (
                                <div className="bg-[#1a1a1a] px-4 py-3 rounded-2xl rounded-tl-sm">
                                    <p className="text-gray-200 text-[15px] leading-relaxed whitespace-pre-wrap">
                                        {displayedText}
                                        {isTyping && <span className="inline-block w-0.5 h-4 bg-blue-400 ml-0.5 animate-pulse" />}
                                    </p>

                                    {!isTyping && message.hint_context && (
                                        <p className="text-[11px] text-gray-500 italic mt-3">
                                            Context: {message.hint_context}
                                        </p>
                                    )}

                                    {/* Edit button */}
                                    {!isTyping && (
                                        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[#333]">
                                            <button
                                                onClick={handleStartEdit}
                                                className="px-2 py-1 text-[11px] text-gray-400 hover:text-gray-300 flex items-center gap-1"
                                            >
                                                <Pencil size={12} />
                                                Edit
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Refine Area */}
                {!isRefining && !isEditing && (
                    <div className="max-w-3xl mx-auto px-6 mt-3 flex flex-wrap gap-2">
                        {!showRefine ? (
                            <button
                                onClick={() => setShowRefine(true)}
                                className="px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-gray-300 text-sm flex items-center gap-2"
                            >
                                <Edit3 size={14} />
                                Refine This Part
                            </button>
                        ) : (
                            <div className="flex gap-2 w-full">
                                <input
                                    type="text"
                                    value={refinePrompt}
                                    onChange={(e) =>
                                        setRefinePrompt(e.target.value)
                                    }
                                    onKeyDown={(e) =>
                                        e.key === "Enter" && handleRefine()
                                    }
                                    className="flex-1 px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-lg text-gray-200 text-sm outline-none"
                                    placeholder="How should this part be refined?"
                                    autoFocus
                                />

                                <button
                                    onClick={handleRefine}
                                    disabled={!refinePrompt.trim()}
                                    className="px-4 py-3 rounded-lg bg-[#333] text-white text-sm disabled:opacity-50"
                                >
                                    Refine
                                </button>

                                <button
                                    onClick={() => {
                                        setShowRefine(false);
                                        setRefinePrompt("");
                                    }}
                                    className="px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-lg text-gray-300 text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

/* ---------------------------------------------
   MAIN CHATAREA COMPONENT (TAILWIND VERSION)
--------------------------------------------- */
export default function ChatArea({
    messages,
    selectedStory,
    loading,
    refiningId,
    error,
    inputText,
    setInputText,
    genre,
    setGenre,
    onSend,
    onContinue,
    onRefine,
    onEditMessage,
    hasMessages,
    newMessageId, // ID of newly generated message that should animate
}) {
    const scrollRef = useRef(null);

    const genres = [
        { id: "fantasy", name: "Fantasy" },
        { id: "scifi", name: "Sci-Fi" },
        { id: "horror", name: "Horror" },
        { id: "romance", name: "Romance" },
        { id: "mystery", name: "Mystery" },
        { id: "adventure", name: "Adventure" },
    ];

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const handleSubmit = () => {
        if (hasMessages) onContinue();
        else onSend();
    };

    return (
        <div className="flex flex-col flex-1 bg-black h-full">
            {/* SCROLL AREA */}
            <div className="flex-1 overflow-y-auto" ref={scrollRef}>
                {/* ERROR */}
                {error && (
                    <div className="max-w-3xl mx-auto px-6 py-4">
                        <div className="p-3 border border-red-600/40 bg-red-600/10 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    </div>
                )}

                {/* WELCOME */}
                {!hasMessages && !loading && (
                    <div className="flex items-center justify-center h-full p-6">
                        <div className="max-w-xl text-center">
                            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#1a1a1a] flex items-center justify-center">
                                <Sparkles size={28} color="#fff" />
                            </div>

                            <h1 className="text-3xl font-semibold text-white mb-2">
                                AI Storyteller
                            </h1>

                            <p className="text-gray-500 mb-8">
                                Create amazing stories with the power of AI
                            </p>

                            <p className="text-sm text-gray-400 mb-3">
                                Choose a genre
                            </p>

                            {/* GENRE SELECT */}
                            <div className="flex flex-wrap justify-center gap-3">
                                {genres.map((g) => (
                                    <button
                                        key={g.id}
                                        onClick={() => setGenre(g.id)}
                                        className={`
                                            px-4 py-2 rounded-full text-sm font-medium
                                            ${genre === g.id
                                                ? "bg-white text-black"
                                                : "bg-[#1a1a1a] text-gray-300"
                                            }
                                        `}
                                    >
                                        {g.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* GENERATING */}
                {loading && !hasMessages && (
                    <div className="flex items-center justify-center h-full">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-[#222] border-t-white rounded-full animate-spin" />
                            <p className="text-gray-500">Crafting your story...</p>
                        </div>
                    </div>
                )}

                {/* STORY CONTENT */}
                {hasMessages && (
                    <div className="pb-32">
                        {messages.map((msg, index) => (
                            <MessageBlock
                                key={msg.id}
                                message={msg}
                                index={index}
                                isRefining={refiningId === msg.id}
                                onRefine={onRefine}
                                onEditMessage={onEditMessage}
                                isNew={msg.id === newMessageId}
                            />
                        ))}

                        {loading && (
                            <div className="py-6 bg-[#0a0a0a]">
                                <div className="max-w-3xl mx-auto px-6 flex gap-4 items-center text-gray-400">
                                    <div className="w-8 h-8 rounded-md bg-[#1a1a1a] flex items-center justify-center">
                                        <Wand2 size={16} color="#fff" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <RefreshCw
                                            size={16}
                                            className="animate-spin"
                                        />
                                        Continuing your story...
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* INPUT SECTION */}
            <div className="border-t border-[#222] bg-black p-5">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === "Enter" &&
                                inputText.trim() &&
                                !loading &&
                                handleSubmit()
                            }
                            placeholder={
                                hasMessages
                                    ? "What happens next in the story?"
                                    : "Describe your story idea..."
                            }
                            className="flex-1 px-5 py-4 bg-[#1a1a1a] border border-[#333] rounded-xl text-white text-[15px] outline-none"
                        />

                        <button
                            onClick={handleSubmit}
                            disabled={loading || !inputText.trim()}
                            className="
                                px-6 py-4 rounded-xl bg-white text-black
                                disabled:opacity-50 disabled:cursor-not-allowed
                                flex items-center justify-center
                            "
                        >
                            {loading ? (
                                <RefreshCw size={20} className="animate-spin" />
                            ) : (
                                <Send size={20} />
                            )}
                        </button>
                    </div>

                    {/* LOWER GENRE PILLS (ONLY BEFORE FIRST MESSAGE) */}
                    {!hasMessages && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {genres.map((g) => (
                                <button
                                    key={g.id}
                                    onClick={() => setGenre(g.id)}
                                    className={`
                                        px-3 py-1.5 text-xs rounded-full
                                        ${genre === g.id
                                            ? "bg-white text-black"
                                            : "bg-[#1a1a1a] text-gray-400"
                                        }
                                    `}
                                >
                                    {g.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
