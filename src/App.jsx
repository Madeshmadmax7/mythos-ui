import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import Login from "./components/Login";
import HomePage from "./pages/HomePage";
import DocsPage from "./pages/DocsPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

const API_BASE = "http://localhost:8000/api";

function App() {
  // Authentication state
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Stories state
  const [stories, setStories] = useState([]);
  const [selectedStoryId, setSelectedStoryId] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null);

  // Messages
  const [messages, setMessages] = useState([]);

  // Input
  const [inputText, setInputText] = useState("");
  const [genre, setGenre] = useState("fantasy");

  // States
  const [loading, setLoading] = useState(false);
  const [refiningId, setRefiningId] = useState(null);
  const [error, setError] = useState("");
  const [newMessageId, setNewMessageId] = useState(null); // Track newly generated message for typing animation

  // Reactions and reviews state
  const [reactions, setReactions] = useState({}); // { [messageId]: { type, likes, dislikes } }
  const [reviews, setReviews] = useState({}); // { [messageId]: [reviews] }

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      validateToken(storedToken);
    } else {
      setAuthLoading(false);
    }
  }, []);

  const validateToken = async (storedToken) => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        setToken(storedToken);
      } else {
        localStorage.removeItem("token");
      }
    } catch (err) {
      console.error("Token validation failed:", err);
      localStorage.removeItem("token");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLoginSuccess = (userData, accessToken) => {
    setUser(userData);
    setToken(accessToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    setStories([]);
    setMessages([]);
    setSelectedStoryId(null);
  };

  // Load stories on start (only when authenticated)
  useEffect(() => {
    if (user && token) {
      fetchStories();
      // Restore selected story from localStorage
      const savedStoryId = localStorage.getItem("selectedStoryId");
      if (savedStoryId) {
        setSelectedStoryId(parseInt(savedStoryId));
      }
    }
  }, [user, token]);

  // When switching story - also save to localStorage
  useEffect(() => {
    if (selectedStoryId) {
      localStorage.setItem("selectedStoryId", selectedStoryId.toString());
      fetchMessages(selectedStoryId);
      const story = stories.find((s) => s.id === selectedStoryId);
      setSelectedStory(story);
      // Clear newMessageId when switching stories (no typing animation for loaded messages)
      setNewMessageId(null);
    } else {
      localStorage.removeItem("selectedStoryId");
      setMessages([]);
      setSelectedStory(null);
    }
  }, [selectedStoryId, stories]);

  const fetchStories = async () => {
    try {
      const res = await fetch(`${API_BASE}/stories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setStories(await res.json());
      } else if (res.status === 401) {
        handleLogout();
      }
    } catch (err) {
      console.error("Failed to fetch stories:", err);
    }
  };

  const fetchMessages = async (storyId) => {
    try {
      const res = await fetch(`${API_BASE}/stories/${storyId}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const msgs = await res.json();
        setMessages(msgs);
        // Fetch reactions and reviews for all loaded messages
        if (msgs.length > 0) {
          fetchReactionsAndReviews(msgs.map((m) => m.id));
        }
      } else if (res.status === 401) {
        handleLogout();
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  const handleNewStory = () => {
    setSelectedStoryId(null);
    setSelectedStory(null);
    setMessages([]);
    setInputText("");
    setError("");
  };

  const handleSelectStory = (story) => {
    setSelectedStoryId(story.id);
    setError("");
  };

  const handleDeleteStory = async (storyId) => {
    try {
      const res = await fetch(`${API_BASE}/stories/${storyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        if (selectedStoryId === storyId) {
          setSelectedStoryId(null);
          setMessages([]);
        }
        fetchStories();
      } else if (res.status === 401) {
        handleLogout();
      }
    } catch {
      setError("Failed to delete story");
    }
  };

  const handleRenameStory = async (storyId, newName) => {
    try {
      const story = stories.find((s) => s.id === storyId);
      const res = await fetch(`${API_BASE}/stories/${storyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newName,
          genre: story?.genre || null,
        }),
      });

      if (res.ok) fetchStories();
      else if (res.status === 401) handleLogout();
    } catch {
      setError("Failed to rename story");
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setError("");

    try {
      let storyId = selectedStoryId;

      // Create new story if none selected
      if (!storyId) {
        const createRes = await fetch(`${API_BASE}/stories`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name:
              inputText.slice(0, 50) +
              (inputText.length > 50 ? "..." : ""),
            genre: genre,
          }),
        });

        if (!createRes.ok) throw new Error("Failed to create story");

        const newStory = await createRes.json();
        storyId = newStory.id;

        setSelectedStoryId(storyId);
        await fetchStories();
      }

      // Generate story response
      const generateRes = await fetch(`${API_BASE}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          story_id: storyId,
          prompt: inputText,
          genre: genre,
        }),
      });

      if (!generateRes.ok) throw new Error("Failed to generate story");

      const result = await generateRes.json();

      const newMessage = {
        id: result.message_id,
        user_prompt: inputText,
        ai_response: result.ai_response,
        hint_context: result.hint,
        order_index: messages.length,
      };

      setMessages((prev) => [...prev, newMessage]);
      setNewMessageId(result.message_id); // Trigger typing animation for this message
      setInputText("");
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
    setError("");

    try {
      const res = await fetch(`${API_BASE}/continue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          story_id: selectedStoryId,
          prompt: inputText,
        }),
      });

      if (!res.ok) throw new Error("Failed to continue story");

      const result = await res.json();

      const newMessage = {
        id: result.message_id,
        user_prompt: inputText,
        ai_response: result.ai_response,
        hint_context: result.hint,
        order_index: messages.length,
      };

      setMessages((prev) => [...prev, newMessage]);
      setNewMessageId(result.message_id); // Trigger typing animation for this message
      setInputText("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefine = async (messageId, refinePrompt) => {
    if (!refinePrompt.trim()) return;

    setRefiningId(messageId);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/refine`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message_id: messageId,
          refine_prompt: refinePrompt,
        }),
      });

      if (!res.ok) throw new Error("Failed to refine message");

      const result = await res.json();

      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? {
              ...m,
              ai_response: result.ai_response,
              hint_context: result.hint,
            }
            : m
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setRefiningId(null);
    }
  };

  const handleEditMessage = async (messageId, newContent) => {
    try {
      const res = await fetch(`${API_BASE}/messages/${messageId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: newContent,
        }),
      });

      if (!res.ok) throw new Error("Failed to update message");

      const result = await res.json();

      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, ai_response: result.ai_response }
            : m
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  // ==================== Reaction & Review Handlers ====================

  const handleReaction = async (messageId, reactionType) => {
    try {
      const res = await fetch(`${API_BASE}/messages/${messageId}/reaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reaction_type: reactionType }),
      });

      if (!res.ok) throw new Error("Failed to set reaction");

      const result = await res.json();

      setReactions((prev) => ({
        ...prev,
        [messageId]: {
          type: result.reaction_type,
          likes: result.likes,
          dislikes: result.dislikes,
        },
      }));
    } catch (err) {
      console.error("Reaction error:", err);
    }
  };

  const handleAddReview = async (messageId, comment) => {
    try {
      const res = await fetch(`${API_BASE}/messages/${messageId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ comment }),
      });

      if (!res.ok) throw new Error("Failed to add review");

      const newReview = await res.json();

      setReviews((prev) => ({
        ...prev,
        [messageId]: [...(prev[messageId] || []), newReview],
      }));
    } catch (err) {
      console.error("Add review error:", err);
    }
  };

  const handleDeleteReview = async (reviewId, messageId) => {
    try {
      const res = await fetch(`${API_BASE}/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete review");

      setReviews((prev) => ({
        ...prev,
        [messageId]: (prev[messageId] || []).filter((r) => r.id !== reviewId),
      }));
    } catch (err) {
      console.error("Delete review error:", err);
    }
  };

  // Fetch reactions and reviews when messages load
  const fetchReactionsAndReviews = async (messageIds) => {
    if (!token || messageIds.length === 0) return;

    try {
      // Fetch reactions and reviews for all messages
      const reactionsData = {};
      const reviewsData = {};

      await Promise.all(
        messageIds.map(async (messageId) => {
          try {
            const [reactionRes, reviewsRes] = await Promise.all([
              fetch(`${API_BASE}/messages/${messageId}/reaction`, {
                headers: { Authorization: `Bearer ${token}` },
              }),
              fetch(`${API_BASE}/messages/${messageId}/reviews`, {
                headers: { Authorization: `Bearer ${token}` },
              }),
            ]);

            if (reactionRes.ok) {
              const reaction = await reactionRes.json();
              reactionsData[messageId] = {
                type: reaction.reaction_type,
                likes: reaction.likes,
                dislikes: reaction.dislikes,
              };
            }

            if (reviewsRes.ok) {
              reviewsData[messageId] = await reviewsRes.json();
            }
          } catch (err) {
            console.error(`Error fetching data for message ${messageId}:`, err);
          }
        })
      );

      setReactions((prev) => ({ ...prev, ...reactionsData }));
      setReviews((prev) => ({ ...prev, ...reviewsData }));
    } catch (err) {
      console.error("Error fetching reactions/reviews:", err);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Authenticated app content (Sidebar + Chat)
  const authenticatedAppContent = (
    <div className="flex h-screen w-full bg-black overflow-hidden">
      <Sidebar
        stories={stories}
        selectedStoryId={selectedStoryId}
        onSelectStory={handleSelectStory}
        onNewStory={handleNewStory}
        onDeleteStory={handleDeleteStory}
        onRenameStory={handleRenameStory}
        user={user}
        onLogout={handleLogout}
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
        newMessageId={newMessageId}
        reactions={reactions}
        reviews={reviews}
        onReaction={handleReaction}
        onAddReview={handleAddReview}
        onDeleteReview={handleDeleteReview}
        user={user}
      />
    </div>
  );

  // Login page wrapper that redirects to app on success
  const LoginPage = () => {
    const navigate = useNavigate();

    const onSuccess = (userData, accessToken) => {
      handleLoginSuccess(userData, accessToken);
      navigate('/app');
    };

    return <Login onLoginSuccess={onSuccess} />;
  };

  const location = useLocation();
  const isAppRoute = location.pathname === '/app';

  return (
    <>
      <ScrollToTop />
      {!isAppRoute && <Navbar />}
      <Routes>
        <Route
          path="/"
          element={user && token ? <Navigate to="/app" replace /> : <HomePage />}
        />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route
          path="/login"
          element={user && token ? <Navigate to="/app" replace /> : <LoginPage />}
        />

        {/* Protected route */}
        <Route
          path="/app"
          element={user && token ? authenticatedAppContent : <Navigate to="/login" replace />}
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!isAppRoute && <Footer />}
    </>
  );
}

export default App;
