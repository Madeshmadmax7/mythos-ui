import React, { useState, useRef, useEffect } from "react";
import {
    Send,
    RefreshCw,
    Sparkles,
    Edit3,
    Save,
    X,
    Pencil,
    ThumbsUp,
    ThumbsDown,
    MessageSquare,
} from "lucide-react";
import crocLogo from "../image/croclogo.png";

function MessageBlock({
    message,
    isRefining,
    onRefine,
    onEditMessage,
    isNew,
    reaction,
    onReaction,
    onAddReview,
    user,
}) {
    const [showRefine, setShowRefine] = useState(false);
    const [refinePrompt, setRefinePrompt] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [showReviewInput, setShowReviewInput] = useState(false);
    const [reviewComment, setReviewComment] = useState("");

    const textareaRef = useRef(null);

    const [displayedText, setDisplayedText] = useState(
        isNew ? "" : message.ai_response
    );
    const [isTyping, setIsTyping] = useState(isNew);

    useEffect(() => {
        if (!message.ai_response || isEditing || isRefining) return;

        if (!isNew) {
            setDisplayedText(message.ai_response);
            setIsTyping(false);
            return;
        }

        let text = message.ai_response;
        let index = 0;

        const timer = setInterval(() => {
            if (index < text.length) {
                setDisplayedText(text.slice(0, index + 3));
                index += 3;
            } else {
                clearInterval(timer);
                setIsTyping(false);
            }
        }, 10);

        return () => clearInterval(timer);
    }, [message.ai_response, message.id, isNew]);

    const handleRefine = () => {
        if (!refinePrompt.trim()) return;
        onRefine(message.id, refinePrompt);
        setRefinePrompt("");
        setShowRefine(false);
    };

    const handleEdit = () => {
        setEditContent(message.ai_response);
        setIsEditing(true);
    };

    const saveEdit = async () => {
        if (!editContent.trim()) return;
        setIsSaving(true);
        await onEditMessage(message.id, editContent.trim());
        setIsSaving(false);
        setIsEditing(false);
    };

    return (
        <>
            {/* USER MESSAGE (RIGHT) */}
            <div className="py-4 bg-black">
                <div className="max-w-4xl mx-auto px-6 flex justify-end">
                    <div className="flex items-start gap-3 max-w-[80%]">
                        <div className="flex-1 text-right">
                            <p className="text-gray-300 bg-[#1a1a1a] px-4 py-3 rounded-2xl rounded-tr-sm inline-block text-left">
                                {message.user_prompt}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-[#333] flex items-center justify-center text-white font-semibold text-sm">
                            {user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>

                    </div>
                </div>
            </div>

            {/* AI MESSAGE (LEFT) */}
            <div className="py-4 bg-black">
                <div className="max-w-3xl mx-auto px-6">
                    <div className="flex items-start gap-3 max-w-[85%]">
                        <img
                            src={crocLogo}
                            alt="AI"
                            className="w-12 h-12 rounded-full object-cover"
                        />

                        <div className="flex-1">
                            {isRefining && (
                                <div className="flex items-center gap-2 text-gray-400 bg-[#1a1a1a] px-4 py-3 rounded-2xl">
                                    <RefreshCw className="animate-spin" size={16} />
                                    Refining...
                                </div>
                            )}

                            {!isRefining && isEditing && (
                                <div className="flex flex-col gap-3">
                                    <textarea
                                        ref={textareaRef}
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="w-full min-h-[200px] p-3 bg-[#1a1a1a] border border-[#444] rounded-lg text-gray-200 resize-none outline-none"
                                    />

                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="px-4 py-2 border border-[#333] rounded-md text-gray-400"
                                        >
                                            <X size={14} />
                                            Cancel
                                        </button>

                                        <button
                                            onClick={saveEdit}
                                            disabled={isSaving || !editContent}
                                            className="px-4 py-2 rounded-md bg-green-500 text-white disabled:opacity-60"
                                        >
                                            {isSaving ? (
                                                <RefreshCw
                                                    className="animate-spin"
                                                    size={14}
                                                />
                                            ) : (
                                                <Save size={14} />
                                            )}
                                            Save
                                        </button>
                                    </div>
                                </div>
                            )}

                            {!isRefining && !isEditing && (
                                <div className="bg-[#1a1a1a] px-4 py-3 rounded-2xl">
                                    <p className="text-gray-200 whitespace-pre-wrap">
                                        {displayedText}
                                        {isTyping && (
                                            <span className="inline-block w-0.5 h-4 bg-blue-400 ml-1 animate-pulse" />
                                        )}
                                    </p>

                                    {!isTyping && (
                                        <div className="flex items-center gap-4 mt-3 pt-2 border-t border-[#333]">
                                            <button
                                                onClick={handleEdit}
                                                className="px-2 py-1 text-[11px] text-gray-400 hover:text-gray-300 flex items-center gap-1"
                                            >
                                                <Pencil size={12} />
                                                Edit
                                            </button>

                                            <div className="flex items-center gap-3 ml-auto">
                                                <button
                                                    onClick={() =>
                                                        onReaction(
                                                            message.id,
                                                            reaction?.type === "like"
                                                                ? null
                                                                : "like"
                                                        )
                                                    }
                                                    className={`px-2 py-1 rounded text-[11px] ${reaction?.type === "like"
                                                        ? "text-green-400 bg-green-400/10"
                                                        : "text-gray-400"
                                                        }`}
                                                >
                                                    <ThumbsUp size={12} />
                                                    {reaction?.likes > 0 && reaction.likes}
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        onReaction(
                                                            message.id,
                                                            reaction?.type === "dislike"
                                                                ? null
                                                                : "dislike"
                                                        )
                                                    }
                                                    className={`px-2 py-1 rounded text-[11px] ${reaction?.type === "dislike"
                                                        ? "text-red-400 bg-red-400/10"
                                                        : "text-gray-400"
                                                        }`}
                                                >
                                                    <ThumbsDown size={12} />
                                                    {reaction?.dislikes > 0 &&
                                                        reaction.dislikes}
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        setShowReviewInput(!showReviewInput)
                                                    }
                                                    className={`px-2 py-1 rounded text-[11px] ${showReviewInput
                                                        ? "text-blue-400 bg-blue-400/10"
                                                        : "text-gray-400"
                                                        }`}
                                                >
                                                    <MessageSquare size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {showReviewInput && !isTyping && (
                                        <div className="mt-3">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={reviewComment}
                                                    onChange={(e) =>
                                                        setReviewComment(e.target.value)
                                                    }
                                                    onKeyDown={(e) => {
                                                        if (
                                                            e.key === "Enter" &&
                                                            reviewComment.trim()
                                                        ) {
                                                            onAddReview(
                                                                message.id,
                                                                reviewComment
                                                            );
                                                            setReviewComment("");
                                                        }
                                                    }}
                                                    placeholder="Add a comment..."
                                                    className="flex-1 px-3 py-2 bg-[#0a0a0a] border border-[#333] rounded-lg text-gray-200 text-xs outline-none"
                                                />
                                                <button
                                                    onClick={() => {
                                                        if (reviewComment.trim()) {
                                                            onAddReview(
                                                                message.id,
                                                                reviewComment
                                                            );
                                                            setReviewComment("");
                                                        }
                                                    }}
                                                    disabled={!reviewComment.trim()}
                                                    className="px-3 py-2 bg-blue-600 text-white text-xs rounded-lg disabled:opacity-50"
                                                >
                                                    <Send size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {!isRefining && !isEditing && (
                    <div className="max-w-3xl mx-auto px-6 mt-3 flex flex-wrap gap-2">
                        {!showRefine ? (
                            <button
                                onClick={() => setShowRefine(true)}
                                className="px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-gray-300 text-sm flex items-center gap-2"
                            >
                                <Edit3 size={14} />
                                Refine
                            </button>
                        ) : (
                            <div className="flex gap-2 w-full">
                                <input
                                    type="text"
                                    value={refinePrompt}
                                    onChange={(e) =>
                                        setRefinePrompt(e.target.value)
                                    }
                                    onKeyDown={(e) => e.key === "Enter" && handleRefine()}
                                    className="flex-1 px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-lg text-gray-200"
                                    placeholder="How should this part be refined?"
                                />

                                <button
                                    onClick={handleRefine}
                                    disabled={!refinePrompt.trim()}
                                    className="px-4 py-3 bg-[#333] text-white rounded-lg"
                                >
                                    Refine
                                </button>

                                <button
                                    onClick={() => {
                                        setShowRefine(false);
                                        setRefinePrompt("");
                                    }}
                                    className="px-4 py-3 bg-[#1a1a1a] border border-[#333] text-gray-200 rounded-lg"
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

export default function ChatArea({
    messages,
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
    newMessageId,
    reactions,
    reviews,
    onReaction,
    onAddReview,
    user,

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
            <div className="flex-1 overflow-y-auto" ref={scrollRef}>
                {error && (
                    <div className="max-w-3xl mx-auto px-6 py-4">
                        <div className="bg-red-600/10 text-red-400 border border-red-600/40 p-3 rounded-lg">
                            {error}
                        </div>
                    </div>
                )}

                {!hasMessages && !loading && (
                    <div className="flex items-center justify-center h-full text-center">
                        <div>
                            <div className="w-16 h-16 mx-auto rounded-full bg-[#1a1a1a] flex items-center justify-center">
                                <Sparkles size={28} color="#fff" />
                            </div>

                            <h1 className="text-white text-3xl mt-4">AI Storyteller</h1>
                            <p className="text-gray-500 mt-2">
                                Create amazing stories with AI
                            </p>

                            <p className="text-sm text-gray-400 mt-4">Choose a genre</p>

                            <div className="flex flex-wrap justify-center gap-3 mt-3">
                                {genres.map((g) => (
                                    <button
                                        key={g.id}
                                        onClick={() => setGenre(g.id)}
                                        className={`px-4 py-2 text-sm rounded-full ${genre === g.id
                                            ? "bg-white text-black"
                                            : "bg-[#1a1a1a] text-gray-300"
                                            }`}
                                    >
                                        {g.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {hasMessages && (
                    <div className="pb-32">
                        {messages.map((msg) => (
                            <MessageBlock
                                key={msg.id}
                                message={msg}
                                isRefining={refiningId === msg.id}
                                onRefine={onRefine}
                                onEditMessage={onEditMessage}
                                isNew={msg.id === newMessageId}
                                reaction={reactions?.[msg.id]}
                                onReaction={onReaction}
                                onAddReview={onAddReview}
                                user={user}
                            />
                        ))}

                        {loading && (
                            <div className="py-6 bg-[#0a0a0a] px-6 flex gap-3 items-center text-gray-400">
                                <img
                                    src={crocLogo}
                                    className="w-8 h-8 rounded-md"
                                    alt=""
                                />
                                <RefreshCw className="animate-spin" size={16} />
                                Continuing your story...
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="border-t border-[#222] bg-black p-5">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => {
                                if (
                                    e.key === "Enter" &&
                                    inputText.trim() &&
                                    !loading
                                )
                                    handleSubmit();
                            }}
                            placeholder={
                                hasMessages
                                    ? "What happens next?"
                                    : "Describe your story idea..."
                            }
                            className="flex-1 px-5 py-4 bg-[#1a1a1a] border border-[#333] rounded-xl text-white"
                        />

                        <button
                            onClick={handleSubmit}
                            disabled={loading || !inputText.trim()}
                            className="px-6 py-4 rounded-xl bg-white text-black disabled:opacity-50"
                        >
                            {loading ? (
                                <RefreshCw className="animate-spin" size={20} />
                            ) : (
                                <Send size={20} />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
