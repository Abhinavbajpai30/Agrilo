import { useState, useRef, useEffect } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import axios from 'axios';
import { Mic, Square, Loader2, Volume2, ArrowLeft, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VoiceChat = () => {
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [messages, setMessages] = useState([]); // Array of { type: 'user' | 'bot', text: string }
    const audioRef = useRef(null);
    const messagesEndRef = useRef(null);

    const {
        status,
        startRecording,
        stopRecording,
    } = useReactMediaRecorder({
        audio: true,
        onStop: (blobUrl, blob) => handleStop(blob),
    });

    const isProcessingRef = useRef(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isProcessing]);

    const handleStop = async (blob) => {
        if (isProcessingRef.current) return;

        // Ignore very short recordings (likely accidental clicks)
        if (blob.size < 2000) {
            console.warn("Audio too short, ignoring. Size:", blob.size);
            return;
        }

        isProcessingRef.current = true;
        setIsProcessing(true);

        // Add user "message" placeholder (audio representation)
        // In a real app we might convert speech to text locally or get it from backend
        // For now we just show "..." or "Voice Query" until we get response text if backend provides it
        // But backend provides response only. We can add a "Sent voice query" message.
        // Actually, let's wait for response.

        try {
            const formData = new FormData();
            formData.append('audio', blob, 'recording.webm');

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

            // eslint-disable-next-line no-console
            console.log("Audio Blob size:", blob.size, "Type:", blob.type);
            const token = localStorage.getItem('agrilo_token');
            const res = await axios.post(`${API_URL}/voice/query`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });

            if (res.data.status === 'success' || res.data.status === 'partial_success') {
                const { textResponse, audioBase64 } = res.data.data;

                // Add bot message
                setMessages(prev => [...prev, { type: 'user', text: '🎤 Voice Query Sent' }, { type: 'bot', text: textResponse }]);

                // Auto play audio
                if (audioBase64) {
                    const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
                    audioRef.current = audio;
                    audio.play().catch(e => console.error("Audio playback failed", e));
                }
            }
        } catch (error) {
            console.error('Voice query failed:', error);
            setMessages(prev => [...prev, { type: 'bot', text: "Sorry, I couldn't understand that. Please try again." }]);
        } finally {
            setIsProcessing(false);
            isProcessingRef.current = false;
        }
    };

    const toggleRecording = () => {
        if (status === 'recording') {
            stopRecording();
        } else {
            startRecording();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <h1 className="text-lg font-semibold text-gray-800">AgriBot Voice Assistant</h1>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                    <MoreVertical className="w-6 h-6 text-gray-600" />
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 pb-32">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 mt-20">
                        <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mic className="w-10 h-10 text-primary-600" />
                        </div>
                        <p className="text-lg font-medium">Tap the microphone to start speaking</p>
                        <p className="text-sm mt-2">Ask about your crops, weather, or soil.</p>
                    </div>
                )}

                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl p-4 ${msg.type === 'user'
                            ? 'bg-primary-600 text-white rounded-br-none'
                            : 'bg-white shadow-md text-gray-800 rounded-bl-none border border-gray-100'
                            }`}>
                            <p className="text-sm md:text-base leading-relaxed">{msg.text}</p>
                        </div>
                    </div>
                ))}

                {isProcessing && (
                    <div className="flex justify-start">
                        <div className="bg-white shadow-md rounded-2xl p-4 rounded-bl-none border border-gray-100 flex items-center gap-2">
                            <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
                            <span className="text-gray-500 text-sm">Processing...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Controls */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent">
                <div className="flex justify-center items-center">
                    <button
                        onClick={toggleRecording}
                        className={`w-20 h-20 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 transform active:scale-95 ${status === 'recording'
                                ? 'bg-red-500 ring-4 ring-red-200 animate-pulse scale-110'
                                : 'bg-green-600 hover:bg-green-700 hover:scale-105'
                            }`}
                    >
                        {status === 'recording' ? (
                            <Square className="w-8 h-8 text-white fill-current" />
                        ) : (
                            <Mic className="w-8 h-8 text-white" />
                        )}
                    </button>
                </div>
                <div className="text-center mt-4 h-6">
                    {status === 'recording' && (
                        <p className="text-red-500 font-medium animate-pulse">Listening...</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VoiceChat;
