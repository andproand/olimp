import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import OlympiadDetail from '@/pages/OlympiadDetail';
import OlympiadList from '@/pages/OlympiadList';
import NewOlympiad from '@/pages/NewOlympiad';
import EditOlympiad from '@/pages/EditOlympiad';
import './index.css'

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/olympiads" element={<OlympiadList />} />
                <Route path="/olympiads/new" element={<NewOlympiad />} />
                <Route path="/olympiad/:id" element={<OlympiadDetail />} />
                <Route path="/olympiad/:id/edit" element={<EditOlympiad />} />
            </Routes>
        </Router>
    );
}

export default App;
