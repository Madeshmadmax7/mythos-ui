import React, { useState, useRef, useEffect } from 'react';
import { Plus, MessageSquare, Check, X } from 'lucide-react';

export default function Sidebar({
    stories,
    selectedStoryId,
    onSelectStory,
    onNewStory,
    onDeleteStory,
    onRenameStory
}) {
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (editingId && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingId]);

    const handleDoubleClick = (story, e) => {
        e.stopPropagation();
        setEditingId(story.id);
        setEditName(story.story_name || `Story ${story.id}`);
    };

    const handleSave = () => {
        if (editName.trim() && onRenameStory) {
            onRenameStory(editingId, editName.trim());
        }
        setEditingId(null);
        setEditName('');
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditName('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    return (
        <div style={{
            width: '260px',
            backgroundColor: '#000000',
            borderRight: '1px solid #222222',
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
        }}>
            <div style={{ padding: '12px' }}>
                <button
                    onClick={onNewStory}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        border: '1px solid #333333',
                        borderRadius: '8px',
                        backgroundColor: 'transparent',
                        color: '#ffffff',
                        fontSize: '14px',
                        cursor: 'pointer'
                    }}
                >
                    <Plus size={16} />
                    New Story
                </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }}>
                <p style={{
                    fontSize: '11px',
                    color: '#666666',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    padding: '8px',
                    marginBottom: '8px'
                }}>
                    Your Stories
                </p>

                {stories.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '32px 0',
                        color: '#666666',
                        fontSize: '13px'
                    }}>
                        <MessageSquare size={24} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                        <p>No stories yet</p>
                        <p style={{ fontSize: '12px', marginTop: '4px' }}>Create your first story!</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {stories.map((story) => (
                            <div
                                key={story.id}
                                onClick={() => editingId !== story.id && onSelectStory(story)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    cursor: editingId === story.id ? 'default' : 'pointer',
                                    backgroundColor: selectedStoryId === story.id ? '#1a1a1a' : 'transparent',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    if (selectedStoryId !== story.id && editingId !== story.id) {
                                        e.currentTarget.style.backgroundColor = '#111111';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (selectedStoryId !== story.id && editingId !== story.id) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }
                                }}
                            >
                                <MessageSquare size={16} style={{ color: '#666666', flexShrink: 0 }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    {editingId === story.id ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                onBlur={handleSave}
                                                style={{
                                                    flex: 1,
                                                    padding: '4px 8px',
                                                    backgroundColor: '#1a1a1a',
                                                    border: '1px solid #444444',
                                                    borderRadius: '4px',
                                                    color: '#ffffff',
                                                    fontSize: '14px',
                                                    outline: 'none'
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <p
                                                onDoubleClick={(e) => handleDoubleClick(story, e)}
                                                style={{
                                                    fontSize: '14px',
                                                    color: '#e0e0e0',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    cursor: 'text'
                                                }}
                                            >
                                                {story.story_name || `Story ${story.id}`}
                                            </p>
                                            <p style={{ fontSize: '11px', color: '#666666' }}>
                                                {story.genre && `${story.genre} • `}{new Date(story.created_at).toLocaleDateString()}
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={{
                padding: '16px',
                borderTop: '1px solid #222222'
            }}>
            </div>
        </div>
    );
}
