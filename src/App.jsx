import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import './App.css';

const API_BASE = 'http://localhost:8000/api';

function App() {
  // Stories (chats) state
  const [stories, setStories] = useState([]);
  const [selectedStoryId, setSelectedStoryId] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null);
  
  // Messages state
  const [messages, setMessages] = useState([]);
  
  // Input state
  const [inputText, setInputText] = useState('');
  const [genre, setGenre] = useState('fantasy');
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [refiningId, setRefiningId] = useState(null);
  
  // UI state
  const [error, setError] = useState('');

  // Fetch all stories on mount
  useEffect(() => {
    fetchStories();
  }, []);

  // Fetch messages when story changes
  useEffect(() => {
    if (selectedStoryId) {
      fetchMessages(selectedStoryId);
      const story = stories.find(s => s.id === selectedStoryId);
      setSelectedStory(story);
    } else {
      setMessages([]);
      setSelectedStory(null);
    }
  }, [selectedStoryId, stories]);

  const fetchStories = async () => {
    try {
      const response = await fetch(`${API_BASE}/stories`);
      if (response.ok) {
        const data = await response.json();
        setStories(data);
      }
    } catch (err) {
      console.error('Failed to fetch stories:', err);
    }
  };

  const fetchMessages = async (storyId) => {
    try {
      const response = await fetch(`${API_BASE}/stories/${storyId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const handleNewStory = async () => {
    setSelectedStoryId(null);
    setSelectedStory(null);
    setMessages([]);
    setInputText('');
    setError('');
  };

  const handleSelectStory = (story) => {
    setSelectedStoryId(story.id);
    setError('');
  };

  const handleDeleteStory = async (storyId) => {
    try {
      const response = await fetch(`${API_BASE}/stories/${storyId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        if (selectedStoryId === storyId) {
          setSelectedStoryId(null);
          setMessages([]);
        }
        fetchStories();
      }
    } catch (err) {
      setError('Failed to delete story');
    }
  };

  const handleRenameStory = async (storyId, newName) => {
    try {
      const story = stories.find(s => s.id === storyId);
      const response = await fetch(`${API_BASE}/stories/${storyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          genre: story?.genre || null
        })
      });
      
      if (response.ok) {
        fetchStories();
      }
    } catch (err) {
      setError('Failed to rename story');
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      let storyId = selectedStoryId;
      
      // Create new story if none selected
      if (!storyId) {
        const createResponse = await fetch(`${API_BASE}/stories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: inputText.slice(0, 50) + (inputText.length > 50 ? '...' : ''),
            genre: genre
          })
        });
        
        if (!createResponse.ok) throw new Error('Failed to create story');
        
        const newStory = await createResponse.json();
        storyId = newStory.id;
        setSelectedStoryId(storyId);
        await fetchStories();
      }
      
      // Generate message
      const generateResponse = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          story_id: storyId,
          prompt: inputText,
          genre: genre
        })
      });
      
      if (!generateResponse.ok) throw new Error('Failed to generate story');
      
      const result = await generateResponse.json();
      
      // Add new message to state immediately
      const newMessage = {
        id: result.message_id,
        user_prompt: inputText,
        ai_response: result.ai_response,
        hint_context: result.hint,
        order_index: messages.length
      };
      
      setMessages(prev => [...prev, newMessage]);
      setInputText('');
      fetchStories();
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!inputText.trim() || !selectedStoryId) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_BASE}/continue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          story_id: selectedStoryId,
          prompt: inputText
        })
      });
      
      if (!response.ok) throw new Error('Failed to continue story');
      
      const result = await response.json();
      
      const newMessage = {
        id: result.message_id,
        user_prompt: inputText,
        ai_response: result.ai_response,
        hint_context: result.hint,
        order_index: messages.length
      };
      
      setMessages(prev => [...prev, newMessage]);
      setInputText('');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefine = async (messageId, refinePrompt) => {
    if (!refinePrompt.trim()) return;
    
    setRefiningId(messageId);
    setError('');
    
    try {
      const response = await fetch(`${API_BASE}/refine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_id: messageId,
          refine_prompt: refinePrompt
        })
      });
      
      if (!response.ok) throw new Error('Failed to refine message');
      
      const result = await response.json();
      
      // Update only the refined message
      setMessages(prev => prev.map(m => 
        m.id === messageId 
          ? { ...m, ai_response: result.ai_response, hint_context: result.hint }
          : m
      ));
      
    } catch (err) {
      setError(err.message);
    } finally {
      setRefiningId(null);
    }
  };

  const handleEditMessage = async (messageId, newContent) => {
    try {
      const response = await fetch(`${API_BASE}/messages/${messageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newContent
        })
      });
      
      if (!response.ok) throw new Error('Failed to update message');
      
      const result = await response.json();
      
      // Update the message in state
      setMessages(prev => prev.map(m => 
        m.id === messageId 
          ? { ...m, ai_response: result.ai_response }
          : m
      ));
      
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        stories={stories}
        selectedStoryId={selectedStoryId}
        onSelectStory={handleSelectStory}
        onNewStory={handleNewStory}
        onDeleteStory={handleDeleteStory}
        onRenameStory={handleRenameStory}
      />
      
      <ChatArea
        messages={messages}
        selectedStory={selectedStory}
        loading={loading}
        refiningId={refiningId}
        error={error}
        inputText={inputText}
        setInputText={setInputText}
        genre={genre}
        setGenre={setGenre}
        onSend={handleSendMessage}
        onContinue={handleContinue}
        onRefine={handleRefine}
        onEditMessage={handleEditMessage}
        hasMessages={messages.length > 0}
      />
    </div>
  );
}

export default App;
