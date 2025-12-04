import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import InterviewRoom from './components/InterviewRoom';
import './App.css';

function App() {
    return (
        <Router>
            <div className="app">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/interview/:sessionId" element={<InterviewRoom />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
