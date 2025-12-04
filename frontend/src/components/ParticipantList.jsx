import { useState } from 'react';
import './ParticipantList.css';

const ParticipantList = ({ participants = [], currentUserId }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const onlineParticipants = participants.filter(p => p.isOnline);
    const currentUserParticipant = participants.find(p => p.id === currentUserId);

    return (
        <div className="participant-list">
            <button
                className="participants-toggle"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <span className="participant-count">
                    👥 {onlineParticipants.length}
                </span>
            </button>

            {isExpanded && (
                <div className="participants-dropdown glass">
                    <div className="dropdown-header">
                        <h4>Participants</h4>
                        <button
                            className="close-btn"
                            onClick={() => setIsExpanded(false)}
                        >
                            ✕
                        </button>
                    </div>

                    <div className="participants-list">
                        {onlineParticipants.length === 0 ? (
                            <div className="no-participants">
                                <p>No participants yet</p>
                            </div>
                        ) : (
                            onlineParticipants.map((participant) => (
                                <div
                                    key={participant.id}
                                    className={`participant-item ${participant.id === currentUserId ? 'current-user' : ''
                                        }`}
                                >
                                    <div
                                        className="participant-avatar"
                                        style={{ backgroundColor: participant.color }}
                                    >
                                        {participant.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="participant-info">
                                        <div className="participant-name">
                                            {participant.name}
                                            {participant.id === currentUserId && (
                                                <span className="you-badge">You</span>
                                            )}
                                        </div>
                                        <div className="participant-role">{participant.role}</div>
                                    </div>
                                    <div className="participant-status online"></div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParticipantList;
