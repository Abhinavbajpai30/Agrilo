import { useState, useRef, useEffect } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import axios from 'axios';
import {
    Mic,
    Square,
    Loader2,
    ArrowLeft,
    MoreVertical,
    Sparkles,
    Wind,
    Droplet
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VoiceChat = () => {
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [messages, setMessages] = useState([]);
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

        if (blob.size < 2000) {
            return;
        }

        isProcessingRef.current = true;
        setIsProcessing(true);

        try {
            const formData = new FormData();
            formData.append('audio', blob, 'recording.webm');

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const token = localStorage.getItem('agrilo_token');

            const res = await axios.post(`${API_URL}/voice/query`, formData, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (res.data.status === 'success' || res.data.status === 'partial_success') {
                const { textResponse, audioBase64 } = res.data.data;

                setMessages(prev => [
                    ...prev,
                    { type: 'user', text: 'Voice Query' },
                    { type: 'bot', text: textResponse }
                ]);

                if (audioBase64) {
                    const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
                    audioRef.current = audio;
                    audio.play().catch(e => console.error("Audio playback failed", e));
                }
            }
        } catch (error) {
            console.error('Voice query failed:', error);
            setMessages(prev => [...prev, { type: 'bot', text: "I had trouble hearing that. Could you say it again?" }]);
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

    const suggestions = [
        "How is the soil moisture?",
        "Is there a flood risk today?",
        "Diagnose my tomato plant"
    ];

    return (
        <div className="min-h-screen bg-slate-900 relative overflow-hidden flex flex-col font-sans text-gray-100">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-green-500/20 rounded-full blur-[100px] animate-pulse-soft"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] animate-pulse-soft delay-700"></div>
            </div>

            {/* Header */}
            <div className="relative z-10 px-4 py-4 flex items-center justify-between backdrop-blur-sm bg-slate-900/50 border-b border-white/5">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-300" />
                </button>
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-green-400" />
                    <h1 className="text-lg font-medium tracking-wide">AgriBot</h1>
                </div>
                <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
                    <MoreVertical className="w-6 h-6 text-gray-300" />
                </button>
            </div>

            {/* Chat Area */}
            <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-6 pb-40 scroll-smooth">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center mt-20 space-y-8 opacity-0 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
                        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-glow mb-4">
                            <Mic className="w-12 h-12 text-white" />
                        </div>
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-light text-white">How can I help you?</h2>
                            <p className="text-gray-400">Tap the microphone to start talking</p>
                        </div>

                        {/* Suggestions */}
                        <div className="flex flex-wrap justify-center gap-2 max-w-sm">
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 hover:border-green-500/50 transition-all cursor-pointer"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
                    >
                        <div className={`max-w-[85%] rounded-2xl p-4 backdrop-blur-md ${msg.type === 'user'
                                ? 'bg-green-600/90 text-white rounded-br-none shadow-lg'
                                : 'bg-white/10 border border-white/10 text-gray-100 rounded-bl-none shadow-lg'
                            }`}>
                            <p className="leading-relaxed">{msg.text}</p>
                        </div>
                    </div>
                ))}

                {isProcessing && (
                    <div className="flex justify-start animate-fade-in">
                        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 rounded-bl-none flex items-center gap-3">
                            <div className="flex gap-1 h-3 items-center">
                                <div className="w-1 h-3 bg-green-400 animate-pulse"></div>
                                <div className="w-1 h-5 bg-green-400 animate-pulse delay-75"></div>
                                <div className="w-1 h-3 bg-green-400 animate-pulse delay-150"></div>
                            </div>
                            <span className="text-gray-300 text-sm font-medium">Processing...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Controls */}
            <div className="fixed bottom-0 left-0 right-0 p-6 z-20 bg-gradient-to-t from-slate-900 via-slate-900/90 to-transparent">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        {status === 'recording' && (
                            <>
                                <div className="absolute inset-0 rounded-full bg-green-500/30 animate-ping"></div>
                                <div className="absolute inset-[-10px] rounded-full bg-green-500/20 animate-pulse"></div>
                            </>
                        )}
                        <button
                            onClick={toggleRecording}
                            className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${status === 'recording'
                                    ? 'bg-red-500 hover:bg-red-600 scale-110'
                                    : 'bg-gradient-to-br from-green-500 to-emerald-700 hover:scale-105'
                                }`}
                        >
                            {status === 'recording' ? (
                                <Square className="w-8 h-8 text-white fill-current" />
                            ) : (
                                <Mic className="w-8 h-8 text-white" />
                            )}
                        </button>
                    </div>
                    <p className={`text-sm font-medium tracking-wider transition-opacity duration-300 ${status === 'recording' ? 'text-green-400 opacity-100' : 'text-gray-500 opacity-0'
                        }`}>
                        LISTENING...
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VoiceChat;
