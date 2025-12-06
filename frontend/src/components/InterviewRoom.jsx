import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession';
import { useCollaboration } from '../hooks/useCollaboration';
import CodeEditor from './CodeEditor';
import LanguageSelector from './LanguageSelector';
import ExecutionPanel from './ExecutionPanel';
import ParticipantList from './ParticipantList';
import { LANGUAGES } from '../utils/constants';
import './InterviewRoom.css';

const InterviewRoom = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const { currentSession, currentUser, joinSession, leaveSession, updateSessionCode, loading } = useSession();

    const [code, setCode] = useState('');
    const [language, setLanguage] = useState(LANGUAGES.JAVASCRIPT.id);
    const [participants, setParticipants] = useState([]);

    // Handle code changes from other users
    const handleRemoteCodeChange = (newCode) => {
        setCode(newCode);
    };

    // Handle language changes from other users
    const handleRemoteLanguageChange = (newLanguage) => {
        setLanguage(newLanguage);
        const langConfig = Object.values(LANGUAGES).find(l => l.id === newLanguage);
        if (langConfig) {
            setCode(langConfig.defaultCode);
        }
    };

    // Handle user join
    const handleUserJoin = (user) => {
        setParticipants(prev => {
            const exists = prev.find(p => p.id === user.id);
            if (exists) return prev;
            return [...prev, user];
        });
    };

    // Handle user leave
    const handleUserLeave = (userId) => {
        setParticipants(prev => prev.filter(p => p.id !== userId));
    };

    // Initialize collaboration
    const {
        broadcastCode,
        broadcastLanguage,
        broadcastJoin,
        broadcastLeave
    } = useCollaboration(
        sessionId,
        currentUser?.id,
        handleRemoteCodeChange,
        handleRemoteLanguageChange,
        handleUserJoin,
        handleUserLeave
    );

    // Join session on mount
    useEffect(() => {
        if (sessionId && currentUser && !currentSession) {
            joinSession(sessionId);
        }
    }, [sessionId, currentUser, currentSession, joinSession]);

    // Initialize session data
    useEffect(() => {
        if (currentSession) {
            setCode(currentSession.code || LANGUAGES.JAVASCRIPT.defaultCode);
            setLanguage(currentSession.language || LANGUAGES.JAVASCRIPT.id);
            setParticipants(currentSession.participants || []);

            // Broadcast join to other users
            if (currentUser) {
                broadcastJoin(currentUser);
            }
        }
    }, [currentSession, currentUser, broadcastJoin]);

    // Fetch participants when session is loaded
    useEffect(() => {
        const fetchParticipants = async () => {
            if (currentSession?.id) {
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/sessions/${currentSession.id}/participants`);
                    if (response.ok) {
                        const data = await response.json();
                        setParticipants(data.participants || []);
                    }
                } catch (error) {
                    console.error('Failed to fetch participants:', error);
                }
            }
        };

        fetchParticipants();

        // Poll for participants every 5 seconds to keep the list updated
        const interval = setInterval(fetchParticipants, 5000);

        return () => clearInterval(interval);
    }, [currentSession?.id]);


    // Handle code change
    const handleCodeChange = (newCode) => {
        setCode(newCode);
        broadcastCode(newCode);
        updateSessionCode(newCode, language);
    };

    // Handle language change
    const handleLanguageChange = (newLanguage) => {
        setLanguage(newLanguage);
        broadcastLanguage(newLanguage);

        const langConfig = Object.values(LANGUAGES).find(l => l.id === newLanguage);
        if (langConfig) {
            const newCode = langConfig.defaultCode;
            setCode(newCode);
            broadcastCode(newCode);
            updateSessionCode(newCode, newLanguage);
        }
    };

    // Handle leave
    const handleLeave = async () => {
        broadcastLeave();
        await leaveSession();
        navigate('/');
    };

    if (loading) {
        return (
            <div className="interview-room loading">
                <div className="loading-spinner"></div>
                <p>Loading interview session...</p>
            </div>
        );
    }

    if (!currentSession && !loading) {
        return (
            <div className="interview-room error">
                <div className="error-container">
                    <h2>Session Not Found</h2>
                    <p>The interview session you're trying to join doesn't exist or has expired.</p>
                    <button className="btn-primary" onClick={() => navigate('/')}>
                        <span>Go Home</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="interview-room">
            {/* Header */}
            <header className="interview-header">
                <div className="header-left">
                    <div className="logo-small">
                        <span>💻</span>
                        <span className="logo-text">CodeInterview</span>
                    </div>
                    <div className="session-info">
                        <span className="session-label">Session:</span>
                        <span className="session-id">{sessionId}</span>
                    </div>
                </div>

                <div className="header-right">
                    <ParticipantList participants={participants} currentUserId={currentUser?.id} />
                    <button className="btn-leave" onClick={handleLeave}>
                        Leave
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="interview-content">
                {/* Left Panel - Code Editor */}
                <div className="editor-panel">
                    <div className="editor-toolbar">
                        <LanguageSelector
                            selectedLanguage={language}
                            onLanguageChange={handleLanguageChange}
                        />
                    </div>

                    <CodeEditor
                        code={code}
                        language={language}
                        onChange={handleCodeChange}
                    />
                </div>

                {/* Right Panel - Execution */}
                <div className="execution-panel-container">
                    <ExecutionPanel code={code} language={language} />
                </div>
            </div>
        </div>
    );
};

export default InterviewRoom;
