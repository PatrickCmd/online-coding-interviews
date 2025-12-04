import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession';
import { copyToClipboard, generateSessionLink } from '../utils/helpers';
import './HomePage.css';

const HomePage = () => {
    const navigate = useNavigate();
    const { createSession, joinSession, loading, error } = useSession();
    const [sessionLink, setSessionLink] = useState('');
    const [joinSessionId, setJoinSessionId] = useState('');
    const [copied, setCopied] = useState(false);
    const [showJoinInput, setShowJoinInput] = useState(false);

    const handleCreateSession = async () => {
        const result = await createSession();

        if (result.success) {
            setSessionLink(result.link);
        }
    };

    const handleCopyLink = async () => {
        const success = await copyToClipboard(sessionLink);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleStartInterview = () => {
        if (sessionLink) {
            const sessionId = sessionLink.split('/').pop();
            navigate(`/interview/${sessionId}`);
        }
    };

    const handleJoinSession = async () => {
        if (!joinSessionId.trim()) return;

        const result = await joinSession(joinSessionId.trim());

        if (result.success) {
            navigate(`/interview/${joinSessionId.trim()}`);
        }
    };

    return (
        <div className="home-page">
            <div className="home-container">
                {/* Header */}
                <header className="home-header fade-in">
                    <div className="logo">
                        <span className="logo-icon">💻</span>
                        <h1 className="gradient-text">CodeInterview</h1>
                    </div>
                    <p className="tagline">Real-time collaborative coding interviews</p>
                </header>

                {/* Main Content */}
                <main className="home-main">
                    {!sessionLink ? (
                        <div className="create-session-section slide-in">
                            <h2>Start Your Interview</h2>
                            <p className="description">
                                Create a new interview session and share the link with candidates
                            </p>

                            <button
                                className="btn-primary btn-large"
                                onClick={handleCreateSession}
                                disabled={loading}
                            >
                                <span>{loading ? 'Creating...' : '🚀 Create Interview Session'}</span>
                            </button>

                            {error && (
                                <div className="error-message">
                                    <span>⚠️ {error}</span>
                                </div>
                            )}

                            <div className="divider">
                                <span>or</span>
                            </div>

                            {!showJoinInput ? (
                                <button
                                    className="btn-secondary"
                                    onClick={() => setShowJoinInput(true)}
                                >
                                    Join Existing Interview
                                </button>
                            ) : (
                                <div className="join-session-form">
                                    <input
                                        type="text"
                                        placeholder="Enter session ID"
                                        value={joinSessionId}
                                        onChange={(e) => setJoinSessionId(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleJoinSession()}
                                        className="session-input"
                                    />
                                    <div className="join-actions">
                                        <button
                                            className="btn-primary"
                                            onClick={handleJoinSession}
                                            disabled={loading || !joinSessionId.trim()}
                                        >
                                            <span>Join</span>
                                        </button>
                                        <button
                                            className="btn-secondary"
                                            onClick={() => {
                                                setShowJoinInput(false);
                                                setJoinSessionId('');
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="session-created-section fade-in">
                            <div className="success-icon">✅</div>
                            <h2>Session Created!</h2>
                            <p className="description">
                                Share this link with your candidate to start the interview
                            </p>

                            <div className="session-link-container glass">
                                <input
                                    type="text"
                                    value={sessionLink}
                                    readOnly
                                    className="session-link-input"
                                />
                                <button
                                    className="btn-copy"
                                    onClick={handleCopyLink}
                                >
                                    {copied ? '✓ Copied!' : '📋 Copy'}
                                </button>
                            </div>

                            <div className="session-actions">
                                <button
                                    className="btn-primary btn-large"
                                    onClick={handleStartInterview}
                                >
                                    <span>Enter Interview Room →</span>
                                </button>
                                <button
                                    className="btn-secondary"
                                    onClick={() => {
                                        setSessionLink('');
                                        setCopied(false);
                                    }}
                                >
                                    Create Another Session
                                </button>
                            </div>
                        </div>
                    )}
                </main>

                {/* Features */}
                <section className="features">
                    <div className="feature-card glass">
                        <div className="feature-icon">⚡</div>
                        <h3>Real-time Collaboration</h3>
                        <p>See code changes instantly as candidates type</p>
                    </div>
                    <div className="feature-card glass">
                        <div className="feature-icon">🎨</div>
                        <h3>Syntax Highlighting</h3>
                        <p>Support for JavaScript, Python, and HTML/CSS</p>
                    </div>
                    <div className="feature-card glass">
                        <div className="feature-icon">▶️</div>
                        <h3>Code Execution</h3>
                        <p>Run code directly in the browser</p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default HomePage;
