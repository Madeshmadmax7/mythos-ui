import React, { useState, useEffect } from 'react';
import { X, Check, X as XIcon, User, FileEdit } from 'lucide-react';

export default function ManagementModal({ isOpen, onClose, storyHash, token, isOwner, currentUser }) {
    const [activeTab, setActiveTab] = useState('access'); // 'access' or 'changes'
    const [accessRequests, setAccessRequests] = useState([]);
    const [changeRequests, setChangeRequests] = useState([]);
    const [loading, setLoading] = useState(false);

    const API_BASE = "http://localhost:8000/api";

    useEffect(() => {
        if (isOpen && storyHash) {
            fetchRequests();
        }
    }, [isOpen, storyHash, activeTab]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            if (activeTab === 'access') {
                const res = await fetch(`${API_BASE}/stories/hash/${storyHash}/access_requests`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) setAccessRequests(await res.json());
            } else {
                const res = await fetch(`${API_BASE}/stories/hash/${storyHash}/change_requests`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) setChangeRequests(await res.json());
            }
        } catch (e) {
            console.error("Error fetching requests", e);
        } finally {
            setLoading(false);
        }
    };

    const handleAccessAction = async (requestId, status) => {
        try {
            const res = await fetch(`${API_BASE}/stories/hash/${storyHash}/access_requests/${requestId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                setAccessRequests(prev => prev.filter(r => r.id !== requestId));
            }
        } catch (e) {
            console.error("Error updating access request", e);
        }
    };

    const handleChangeAction = async (requestId, status) => {
        try {
            const res = await fetch(`${API_BASE}/stories/hash/${storyHash}/change_requests/${requestId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                setChangeRequests(prev => prev.filter(r => r.id !== requestId));
            }
        } catch (e) {
            console.error("Error updating change request", e);
        }
    };

    const handleRemoveAccess = async (requestUserId) => {
        if (!window.confirm("Are you sure you want to remove this member?")) return;
        try {
            const res = await fetch(`${API_BASE}/stories/hash/${storyHash}/access/${requestUserId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                setAccessRequests(prev => prev.filter(r => r.user_id !== requestUserId));
            }
        } catch (e) {
            console.error("Error removing access", e);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl w-full max-w-2xl p-6 shadow-2xl h-[600px] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white">Manage Story</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex gap-4 mb-6 border-b border-[#333]">
                    <button
                        onClick={() => setActiveTab('access')}
                        className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'access'
                            ? 'text-white border-blue-500'
                            : 'text-gray-400 border-transparent hover:text-gray-200'
                            }`}
                    >
                        Access Requests
                        {accessRequests.length > 0 && (
                            <span className="ml-2 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                                {accessRequests.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('changes')}
                        className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'changes'
                            ? 'text-white border-blue-500'
                            : 'text-gray-400 border-transparent hover:text-gray-200'
                            }`}
                    >
                        Change Requests
                        {changeRequests.length > 0 && (
                            <span className="ml-2 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                                {changeRequests.length}
                            </span>
                        )}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            Loading...
                        </div>
                    ) : (
                        <>
                            {activeTab === 'access' && (
                                <div className="space-y-3">
                                    {accessRequests.filter(req => req.user_id !== currentUser?.id).length === 0 ? (
                                        <div className="text-center text-gray-500 py-10">No other members or requests</div>
                                    ) : (
                                        accessRequests
                                            .filter(req => req.user_id !== currentUser?.id)
                                            .map(req => (
                                                <div key={req.id} className="bg-black/50 border border-[#333] p-4 rounded-xl flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-[#333] rounded-full flex items-center justify-center text-gray-400 font-bold uppercase transition-transform hover:scale-105">
                                                            {req.user_name?.charAt(0) || <User size={20} />}
                                                        </div>
                                                        <div>
                                                            <div className="text-white font-medium flex items-center gap-2">
                                                                {req.user_name}
                                                                <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-tighter font-bold ${req.status === 'approved'
                                                                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                                        : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                                                    }`}>
                                                                    {req.status === 'approved' ? 'Active' : 'Pending'}
                                                                </span>
                                                            </div>
                                                            <div className="text-sm text-gray-400">
                                                                {req.status === 'approved' ? 'Role: ' : 'Type: '}
                                                                <span className={req.access_type === 'collaborate' ? 'text-blue-400 font-bold' : 'text-gray-300 font-medium'}>
                                                                    {req.access_type === 'collaborate' ? 'Collaborator' : 'Viewer'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {(isOwner || (req.user_id === currentUser?.id)) && (
                                                        <div className="flex gap-2">
                                                            {req.status === 'pending' && isOwner && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleAccessAction(req.id, 'rejected')}
                                                                        className="p-2 hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                                                                        title="Reject"
                                                                    >
                                                                        <XIcon size={20} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleAccessAction(req.id, 'approved')}
                                                                        className="p-2 hover:bg-blue-500/10 text-gray-400 hover:text-blue-400 rounded-lg transition-colors"
                                                                        title="Approve"
                                                                    >
                                                                        <Check size={20} />
                                                                    </button>
                                                                </>
                                                            )}
                                                            {req.status === 'approved' && isOwner && (
                                                                <button
                                                                    onClick={() => handleRemoveAccess(req.user_id)}
                                                                    className="text-xs text-red-500 hover:text-red-400 font-semibold px-3 py-1 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 rounded-md transition-all active:scale-95"
                                                                >
                                                                    Remove
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                    )}
                                </div>
                            )}

                            {activeTab === 'changes' && (
                                <div className="space-y-3">
                                    {changeRequests.length === 0 ? (
                                        <div className="text-center text-gray-500 py-10">No pending change requests</div>
                                    ) : (
                                        changeRequests.map(req => (
                                            <div key={req.id} className="bg-black/50 border border-[#333] p-4 rounded-xl">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-[#333] rounded-full flex items-center justify-center text-gray-400">
                                                            <FileEdit size={20} />
                                                        </div>
                                                        <div>
                                                            <div className="text-white font-medium">{req.user_name}</div>
                                                            <div className="text-sm text-gray-400">
                                                                Type: <span className="text-blue-400 uppercase text-[10px] font-bold tracking-tight">{req.change_type}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {isOwner && (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleChangeAction(req.id, 'rejected')}
                                                                className="p-2 hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                                                                title="Reject"
                                                            >
                                                                <XIcon size={20} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleChangeAction(req.id, 'approved')}
                                                                className="p-2 hover:bg-blue-500/10 text-gray-400 hover:text-blue-400 rounded-lg transition-colors"
                                                                title="Approve"
                                                            >
                                                                <Check size={20} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="bg-[#111] p-3 rounded-lg text-sm text-gray-300 font-mono border border-[#333] max-h-32 overflow-y-auto">
                                                    {truncateContent(req.new_content)}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function truncateContent(content) {
    if (!content) return "";
    // Try to parse if it looks like JSON (for new_message type)
    if (content.trim().startsWith('{')) {
        try {
            const data = JSON.parse(content);
            return data.user_prompt || data.content || content;
        } catch { }
    }
    return content.length > 200 ? content.slice(0, 200) + '...' : content;
}
