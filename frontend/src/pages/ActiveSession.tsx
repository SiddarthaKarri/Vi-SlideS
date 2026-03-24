import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Hand, ArrowLeft, Presentation, Share2, MessageSquare } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface Question {
  id: string;
  question: string;
  isAnonymous: boolean;
  timestamp: string;
}

export default function ActiveSession() {
  const { code } = useParams();
  const navigate = useNavigate();
  
  const [studentsJoined, setStudentsJoined] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    if (code) {
        newSocket.emit('join_session', code);
    }

    newSocket.on('receive_question', (data: Question) => {
        setQuestions((prev) => [data, ...prev]);
    });

    newSocket.on('member_count', (count: number) => {
        // Assuming 1 teacher is in the room, subtract 1 to get student count
        setStudentsJoined(Math.max(0, count - 1));
    });

    return () => {
        newSocket.disconnect();
    };
  }, [code]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-gray-900 font-sans">
      {/* Session Header */}
      <header className="h-20 border-b border-gray-200 flex items-center justify-between px-6 bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/teacher-dashboard')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="h-8 w-px bg-gray-200 mx-2"></div>
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-3 tracking-tight">
              <Presentation className="w-5 h-5 text-indigo-600" />
              Live Session
            </h1>
            <div className="flex items-center gap-2 mt-1 -ml-1">
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-xs text-indigo-700 font-medium uppercase tracking-widest border border-indigo-200">Class Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Join Code</span>
            <div className="bg-gray-50 px-4 py-1.5 rounded-lg flex items-center gap-3 border border-gray-200 shadow-inner">
              <span className="font-mono text-2xl font-bold tracking-widest text-indigo-600">{code}</span>
              <button className="text-gray-400 hover:text-indigo-600 transition-colors p-1" title="Copy link">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="h-10 w-px bg-gray-200"></div>

          <div className="flex items-center gap-3 text-gray-700 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
            <Users className="w-5 h-5 text-emerald-600" />
            <span className="font-medium text-emerald-600">{studentsJoined} <span className="text-gray-500">Joined</span></span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Slides View (Left) */}
        <div className="flex-1 p-6 flex flex-col items-center justify-center border-r border-gray-200 bg-gray-100 relative">
           <div className="absolute top-6 left-6 flex items-center gap-2 text-gray-700 bg-white/80 px-3 py-1.5 rounded-lg backdrop-blur-md border border-gray-200 shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-sm font-medium tracking-wide">Recording</span>
           </div>

           {/* Placeholder for real slide content */}
           <div className="w-full max-w-5xl aspect-video bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200 shadow-xl flex flex-col items-center justify-center text-gray-500 transition-all hover:border-gray-300">
             <Presentation className="w-16 h-16 mb-4 text-gray-400" />
             <p className="text-xl font-medium text-gray-900">Waiting for presentation to start...</p>
             <p className="text-sm mt-2">Connect your slides source or upload a deck to begin broadcasting</p>
             <button className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-indigo-600/20">
               Upload Deck
             </button>
           </div>
        </div>

        {/* Questions Sidebar (Right) */}
        <aside className="w-96 flex flex-col bg-white border-l border-gray-200">
          <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
            <h2 className="font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              Live Questions
            </h2>
            <div className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-md border border-indigo-200">
              {questions.length} New
            </div>
          </div>
          
          <div className={`flex-1 p-6 flex flex-col items-center ${questions.length === 0 ? 'justify-center' : ''} text-center overflow-y-auto bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiMzMzQxNTUiLz48L3N2Zz4=')]`}>
            {questions.length === 0 ? (
              <div className="bg-white/80 p-6 rounded-2xl border border-gray-200 backdrop-blur-sm shadow-sm">
                <Hand className="w-12 h-12 text-gray-400 mb-4 mx-auto" />
                <p className="text-gray-900 font-medium mb-1">No questions yet</p>
                <p className="text-sm text-gray-500 max-w-[200px] leading-relaxed">Questions will appear here after passing AI triage.</p>
              </div>
            ) : (
              <div className="w-full space-y-4">
                {questions.map((q) => (
                  <div key={q.id} className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm text-left">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest">
                         {q.isAnonymous ? 'Anonymous' : 'Student'}
                       </span>
                       <span className="text-xs text-gray-500">
                         {new Date(q.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       </span>
                    </div>
                    <p className="text-gray-800 text-sm leading-relaxed">{q.question}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
