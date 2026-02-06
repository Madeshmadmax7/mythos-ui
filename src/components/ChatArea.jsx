import React, { useState, useRef, useEffect } from 'react';
import { Send, Wand2, RefreshCw, Sparkles, Edit3, Save, X, Pencil } from 'lucide-react';

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        backgroundColor: '#000000',
        height: '100%',
    },
    scrollArea: {
        flex: 1,
        overflowY: 'auto',
    },
    notificationContainer: {
        maxWidth: '768px',
        margin: '0 auto',
        padding: '16px',
    },
    errorBox: {
        padding: '12px 16px',
        backgroundColor: 'rgba(220, 38, 38, 0.15)',
        border: '1px solid rgba(220, 38, 38, 0.4)',
        borderRadius: '8px',
        color: '#ef4444',
        fontSize: '14px',
        marginBottom: '12px',
    },
    successBox: {
        padding: '12px 16px',
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
        border: '1px solid rgba(34, 197, 94, 0.4)',
        borderRadius: '8px',
        color: '#22c55e',
        fontSize: '14px',
        marginBottom: '12px',
    },
    welcomeContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '24px',
    },
    welcomeInner: {
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center',
    },
    iconCircle: {
        width: '64px',
        height: '64px',
        margin: '0 auto 24px',
        borderRadius: '50%',
        backgroundColor: '#1a1a1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: '28px',
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: '8px',
    },
    subtitle: {
        color: '#666666',
        marginBottom: '32px',
    },
    genreLabel: {
        fontSize: '14px',
        color: '#888888',
        marginBottom: '12px',
    },
    genreContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '8px',
    },
    genreButton: (isSelected) => ({
        padding: '10px 20px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        border: 'none',
        backgroundColor: isSelected ? '#ffffff' : '#1a1a1a',
        color: isSelected ? '#000000' : '#cccccc',
    }),
    loadingContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    loadingInner: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
    },
    spinner: {
        width: '48px',
        height: '48px',
        border: '4px solid #222222',
        borderTopColor: '#ffffff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    loadingText: {
        color: '#888888',
    },
    storyContent: {
        paddingBottom: '120px',
    },
    messageRowUser: {
        padding: '24px 0',
        backgroundColor: '#000000',
    },
    messageRowAI: {
        padding: '24px 0',
        backgroundColor: '#0a0a0a',
    },
    messageInner: {
        maxWidth: '768px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        gap: '16px',
    },
    avatarUser: {
        width: '32px',
        height: '32px',
        borderRadius: '4px',
        backgroundColor: '#333333',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: '600',
    },
    avatarAI: {
        width: '32px',
        height: '32px',
        borderRadius: '4px',
        backgroundColor: '#1a1a1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    messageContent: {
        flex: 1,
    },
    storyText: {
        color: '#e0e0e0',
        fontSize: '15px',
        lineHeight: '1.8',
        whiteSpace: 'pre-wrap',
    },
    hintText: {
        fontSize: '11px',
        color: '#666666',
        marginTop: '12px',
        fontStyle: 'italic',
    },
    actionContainer: {
        padding: '16px 0',
        backgroundColor: '#000000',
    },
    actionInner: {
        maxWidth: '768px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
    },
    secondaryButton: (disabled) => ({
        padding: '8px 16px',
        backgroundColor: '#1a1a1a',
        border: '1px solid #333333',
        borderRadius: '8px',
        color: '#cccccc',
        fontSize: '13px',
        fontWeight: '500',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    }),
    primaryButton: (disabled) => ({
        padding: '8px 16px',
        backgroundColor: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        color: '#000000',
        fontSize: '13px',
        fontWeight: '500',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        opacity: disabled ? 0.5 : 1,
    }),
    inputSection: {
        borderTop: '1px solid #222222',
        backgroundColor: '#000000',
        padding: '20px',
    },
    inputContainer: {
        maxWidth: '768px',
        margin: '0 auto',
    },
    refineRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '12px',
    },
    inputField: {
        flex: 1,
        padding: '12px 16px',
        backgroundColor: '#1a1a1a',
        border: '1px solid #333333',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#ffffff',
        outline: 'none',
    },
    refineButton: (disabled) => ({
        padding: '12px 20px',
        backgroundColor: '#333333',
        border: 'none',
        borderRadius: '8px',
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: '500',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
    }),
    mainInputRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    mainInput: {
        flex: 1,
        padding: '16px 20px',
        backgroundColor: '#1a1a1a',
        border: '1px solid #333333',
        borderRadius: '12px',
        fontSize: '15px',
        color: '#ffffff',
        outline: 'none',
    },
    sendButton: (disabled) => ({
        padding: '16px 24px',
        backgroundColor: '#ffffff',
        border: 'none',
        borderRadius: '12px',
        color: '#000000',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.5 : 1,
    }),
    genrePills: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginTop: '12px',
    },
    genrePill: (isSelected) => ({
        padding: '6px 14px',
        borderRadius: '16px',
        fontSize: '12px',
        border: 'none',
        cursor: 'pointer',
        backgroundColor: isSelected ? '#ffffff' : '#1a1a1a',
        color: isSelected ? '#000000' : '#888888',
    }),
};

function MessageBlock({ message, index, isRefining, onRefine, onEditMessage }) {
    const [showRefine, setShowRefine] = useState(false);
    const [refinePrompt, setRefinePrompt] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const textareaRef = useRef(null);

    const handleRefine = () => {
        if (refinePrompt.trim()) {
            onRefine(message.id, refinePrompt);
            setRefinePrompt('');
            setShowRefine(false);
        }
    };

    const handleStartEdit = () => {
        setEditContent(message.ai_response);
        setIsEditing(true);
    };

    // Auto-resize textarea to fit content
    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [isEditing, editContent]);

    const handleSaveEdit = async () => {
        if (editContent.trim() && onEditMessage) {
            setIsSaving(true);
            await onEditMessage(message.id, editContent.trim());
            setIsSaving(false);
            setIsEditing(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditContent('');
    };

    return (
        <>
            {/* User Prompt */}
            <div style={styles.messageRowUser}>
                <div style={styles.messageInner}>
                    <div style={styles.avatarUser}>U</div>
                    <div style={styles.messageContent}>
                        <p style={{ color: '#ffffff', fontWeight: '500', marginBottom: '4px' }}>Your Prompt</p>
                        <p style={{ color: '#cccccc' }}>{message.user_prompt}</p>
                    </div>
                </div>
            </div>

            {/* AI Response */}
            <div style={styles.messageRowAI}>
                <div style={styles.messageInner}>
                    <div style={styles.avatarAI}>
                        <Wand2 size={16} color="#ffffff" />
                    </div>
                    <div style={{ ...styles.messageContent, position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <p style={{ fontSize: '12px', color: '#888888', fontWeight: '600' }}>
                                Part {index + 1}
                            </p>
                            {!isEditing && !isRefining && (
                                <button
                                    onClick={handleStartEdit}
                                    style={{
                                        padding: '4px 8px',
                                        backgroundColor: 'transparent',
                                        border: '1px solid #333333',
                                        borderRadius: '4px',
                                        color: '#888888',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '11px'
                                    }}
                                    title="Edit this response"
                                >
                                    <Pencil size={12} />
                                    Edit
                                </button>
                            )}
                        </div>
                        {isRefining ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888888' }}>
                                <RefreshCw size={16} className="animate-spin" />
                                Refining this part...
                            </div>
                        ) : isEditing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <textarea
                                    ref={textareaRef}
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    style={{
                                        width: '100%',
                                        minHeight: '200px',
                                        padding: '12px',
                                        backgroundColor: '#1a1a1a',
                                        border: '1px solid #444444',
                                        borderRadius: '8px',
                                        color: '#e0e0e0',
                                        fontSize: '15px',
                                        lineHeight: '1.8',
                                        resize: 'none',
                                        outline: 'none',
                                        fontFamily: 'inherit',
                                        overflow: 'hidden'
                                    }}
                                    autoFocus
                                />
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                    <button
                                        onClick={handleCancelEdit}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: 'transparent',
                                            border: '1px solid #333333',
                                            borderRadius: '6px',
                                            color: '#888888',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            fontSize: '13px'
                                        }}
                                    >
                                        <X size={14} />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveEdit}
                                        disabled={isSaving || !editContent.trim()}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#22c55e',
                                            border: 'none',
                                            borderRadius: '6px',
                                            color: '#ffffff',
                                            cursor: isSaving ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            fontSize: '13px',
                                            opacity: isSaving ? 0.7 : 1
                                        }}
                                    >
                                        {isSaving ? (
                                            <RefreshCw size={14} className="animate-spin" />
                                        ) : (
                                            <Save size={14} />
                                        )}
                                        Save
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <p style={styles.storyText}>{message.ai_response}</p>
                                {message.hint_context && (
                                    <p style={styles.hintText}>Context: {message.hint_context}</p>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Refine Button for this message */}
                {!isRefining && !isEditing && (
                    <div style={styles.actionInner}>
                        {!showRefine ? (
                            <button
                                onClick={() => setShowRefine(true)}
                                style={styles.secondaryButton(false)}
                            >
                                <Edit3 size={14} />
                                Refine This Part
                            </button>
                        ) : (
                            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                                <input
                                    type="text"
                                    value={refinePrompt}
                                    onChange={(e) => setRefinePrompt(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleRefine()}
                                    placeholder="How should this part be refined?"
                                    style={styles.inputField}
                                    autoFocus
                                />
                                <button
                                    onClick={handleRefine}
                                    disabled={!refinePrompt.trim()}
                                    style={styles.refineButton(!refinePrompt.trim())}
                                >
                                    Refine
                                </button>
                                <button
                                    onClick={() => { setShowRefine(false); setRefinePrompt(''); }}
                                    style={styles.secondaryButton(false)}
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
}) {
    const scrollRef = useRef(null);
    const genres = [
        { id: 'fantasy', name: 'Fantasy' },
        { id: 'scifi', name: 'Sci-Fi' },
        { id: 'horror', name: 'Horror' },
        { id: 'romance', name: 'Romance' },
        { id: 'mystery', name: 'Mystery' },
        { id: 'adventure', name: 'Adventure' },
    ];

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const handleSubmit = () => {
        if (hasMessages) {
            onContinue();
        } else {
            onSend();
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.scrollArea} ref={scrollRef}>
                {error && (
                    <div style={styles.notificationContainer}>
                        <div style={styles.errorBox}>{error}</div>
                    </div>
                )}

                {!hasMessages && !loading && (
                    <div style={styles.welcomeContainer}>
                        <div style={styles.welcomeInner}>
                            <div style={styles.iconCircle}>
                                <Sparkles size={28} color="#ffffff" />
                            </div>
                            <h1 style={styles.title}>AI Storyteller</h1>
                            <p style={styles.subtitle}>Create amazing stories with the power of AI</p>

                            <div style={{ marginBottom: '24px' }}>
                                <p style={styles.genreLabel}>Choose a genre</p>
                                <div style={styles.genreContainer}>
                                    {genres.map((g) => (
                                        <button
                                            key={g.id}
                                            onClick={() => setGenre(g.id)}
                                            style={styles.genreButton(genre === g.id)}
                                        >
                                            {g.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {loading && !hasMessages && (
                    <div style={styles.loadingContainer}>
                        <div style={styles.loadingInner}>
                            <div style={styles.spinner} />
                            <p style={styles.loadingText}>Crafting your story...</p>
                        </div>
                    </div>
                )}

                {hasMessages && (
                    <div style={styles.storyContent}>
                        {messages.map((msg, index) => (
                            <MessageBlock
                                key={msg.id}
                                message={msg}
                                index={index}
                                isRefining={refiningId === msg.id}
                                onRefine={onRefine}
                                onEditMessage={onEditMessage}
                            />
                        ))}

                        {loading && (
                            <div style={styles.messageRowAI}>
                                <div style={styles.messageInner}>
                                    <div style={styles.avatarAI}>
                                        <Wand2 size={16} color="#ffffff" />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888888' }}>
                                        <RefreshCw size={16} className="animate-spin" />
                                        {hasMessages ? 'Continuing your story...' : 'Generating...'}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div style={styles.inputSection}>
                <div style={styles.inputContainer}>
                    <div style={styles.mainInputRow}>
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !loading && inputText.trim() && handleSubmit()}
                            placeholder={hasMessages ? "What happens next in the story?" : "Describe your story idea..."}
                            style={styles.mainInput}
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !inputText?.trim()}
                            style={styles.sendButton(loading || !inputText?.trim())}
                        >
                            {loading ? <RefreshCw size={20} className="animate-spin" /> : <Send size={20} />}
                        </button>
                    </div>

                    {!hasMessages && (
                        <div style={styles.genrePills}>
                            {genres.map((g) => (
                                <button key={g.id} onClick={() => setGenre(g.id)} style={styles.genrePill(genre === g.id)}>
                                    {g.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
        </div>
    );
}