import { Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VoiceLauncher = () => {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate('/voice-assistant')}
            className="fixed bottom-24 md:bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 bg-green-600 hover:bg-green-700"
            aria-label="Open Voice Assistant"
        >
            <Mic className="w-8 h-8 text-white" />
        </button>
    );
};

export default VoiceLauncher;
