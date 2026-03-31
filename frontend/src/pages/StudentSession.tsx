import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, LogOut, MessageSquare, AlertCircle, WifiOff, CheckCircle2, User, RefreshCw } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface QuestionData {
  _id: string;
  question: string;
  isAnonymous: boolean;
  status: string;
  aiSuggestedAnswer?: string;
  createdAt: string;
}

export default function StudentSession() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [socketStatus, setSocketStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
  const [questions, setQuestions] = useState<QuestionData[]>([]);

  useEffect(() => {
    // Fetch existing questions
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/questions/${code}`);
        if (response.ok) {
          const data = await response.json();
          setQuestions(data);
        }
      } catch (err) {
        console.error('Failed to fetch questions:', err);
      }
    };
    fetchQuestions();

    const newSocket = io('http://localhost:5000', {
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
        setSocketStatus('connected');
        if (code) {
            newSocket.emit('join_session', code);
        }
    });

    newSocket.on('disconnect', () => {
        setSocketStatus('disconnected');
    });

    newSocket.on('connect_error', () => {
        setSocketStatus('error');
    });

    newSocket.on('receive_question', (data) => {
        // Optimistically add to list or fetch again
        // Note: backend sends 'id' instead of '_id' in receive_question
        const newQ: QuestionData = {
            _id: data.id,
            question: data.question,
            isAnonymous: data.isAnonymous,
            status: 'pending',
            createdAt: data.timestamp
        };
        setQuestions((prev) => [newQ, ...prev.filter(q => q._id !== data.id)]);
    });

    newSocket.on('auto_answer', (data) => {
        setQuestions((prev) => {
            // Check if we already have it optimistically
            const existing = prev.find(q => q._id === data.questionId);
            if (existing) {
                return prev.map(q => q._id === data.questionId ? { ...q, status: 'answered_ai', aiSuggestedAnswer: data.answer } : q);
            }
            // Otherwise prepend
            return [{
                _id: data.questionId,
                question: data.question,
                isAnonymous: false, // Don't know here, but it's their own
                status: 'answered_ai',
                aiSuggestedAnswer: data.answer,
                createdAt: new Date().toISOString()
            }, ...prev];
        });
        
        setStatusMsg('Your question was answered by AI!');
        setTimeout(() => setStatusMsg(''), 5000);
    });

    newSocket.on('receive_teacher_reply', (data) => {
        setQuestions((prev) => {
            const existing = prev.find(q => q._id === data.questionId);
            if (existing) {
                return prev.map(q => q._id === data.questionId ? { ...q, status: 'answered_teacher', aiSuggestedAnswer: data.answer } : q);
            }
            return prev;
        });
        
        setStatusMsg('A teacher replied to a question!');
        setTimeout(() => setStatusMsg(''), 5000);
    });

    return () => {
        newSocket.disconnect();
    };
  }, [code]);

  const handleLeave = () => {
    navigate('/join-class');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setSubmitting(true);
    setStatusMsg('');
    try {
      if (socket && socket.connected && code) {
        socket.emit('send_question', {
            sessionCode: code,
            question,
            isAnonymous
        });
        setQuestion('');
        setStatusMsg('Question sent successfully!');
        setTimeout(() => setStatusMsg(''), 3000);
      } else {
        throw new Error('Socket not connected');
      }
    } catch (error) {
      setStatusMsg('Failed to send question. Please check connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Socket Status Banner */}
      {socketStatus !== 'connected' && (
        <div className="bg-red-500 text-white px-4 py-2 flex items-center justify-center text-sm font-medium sticky top-0 z-50">
          {socketStatus === 'disconnected' ? (
            <><WifiOff className="h-4 w-4 mr-2" /> Connection lost. Reconnecting...</>
          ) : (
            <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Cannot connect to server. Retrying...</>
          )}
        </div>
      )}

      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-lg sm:text-xl font-bold text-gray-900 truncate max-w-[150px] sm:max-w-xs">Live Session: {code}</span>
            </div>
            <button
              onClick={handleLeave}
              className="flex items-center text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
            >
              <LogOut className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline">Leave Session</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto py-8 px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Ask Question Section */}
        <div className="lg:col-span-5 h-fit flex flex-col bg-white shadow sm:rounded-lg p-6 order-1 lg:order-none">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Ask a Question</h2>
            <p className="text-gray-500 mt-2 text-sm">Your question will be sent to the teacher and AI system.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="question" className="sr-only">Your Question</label>
              <textarea
                id="question"
                rows={4}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md p-3 outline-none resize-none"
                placeholder="Type your question here..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center">
                <input
                  id="anonymous"
                  name="anonymous"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
                <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-900">
                  Ask Anonymously
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting || !question.trim() || socketStatus !== 'connected'}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
              >
                {submitting ? 'Sending...' : 'Send'}
                {!submitting && <Send className="ml-2 h-4 w-4" />}
              </button>
            </div>
            {statusMsg && (
              <div className={`mt-4 p-3 text-sm rounded-md flex items-center shadow-sm ${statusMsg.includes('Failed') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                {statusMsg.includes('Failed') ? <AlertCircle className="h-5 w-5 mr-2 shrink-0" /> : <CheckCircle2 className="h-5 w-5 mr-2 shrink-0" />}
                <span>{statusMsg}</span>
              </div>
            )}
          </form>
        </div>

        {/* Live Q&A and Status Section */}
        <div className="lg:col-span-7 bg-white shadow sm:rounded-lg p-6 flex flex-col order-2 lg:order-none h-[500px] lg:h-auto">
          <div className="mb-4 pb-4 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-indigo-500" />
              Live Q&A
            </h3>
            <p className="text-sm text-gray-500 mt-1">Recent questions asked in this session</p>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {questions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <MessageSquare className="h-12 w-12 mb-2 text-gray-200" />
                <p>No questions yet.</p>
                <p className="text-sm">Be the first to ask!</p>
              </div>
            ) : (
              questions.map((q) => (
                <div key={q._id} className="bg-slate-50 rounded-lg p-4 border border-slate-100 shadow-sm transition-all hover:shadow-md">
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-xs font-medium bg-white px-2 py-1 rounded-full border border-gray-200 text-gray-600 flex items-center">
                       <User className="h-3 w-3 mr-1" />
                       {q.isAnonymous ? 'Anonymous Student' : 'Student'}
                     </span>
                     <span className="text-xs text-gray-400">
                       {new Date(q.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </span>
                   </div>
                   <p className="text-gray-800 text-sm font-medium mb-2 pl-1 whitespace-pre-wrap">{q.question}</p>
                   
                   {q.status === 'answered_ai' && q.aiSuggestedAnswer && (
                     <div className="mt-3 bg-indigo-50 rounded-md p-3 border border-indigo-100 flex items-start">
                       <div className="bg-indigo-100 rounded-full p-1 mr-3 shrink-0 mt-0.5">
                         <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                       </div>
                       <div>
                         <p className="text-xs font-bold text-indigo-800 mb-1">AI Instant Answer</p>
                         <p className="text-sm text-indigo-900 whitespace-pre-wrap">{q.aiSuggestedAnswer}</p>
                       </div>
                     </div>
                   )}
                   
                   {q.status === 'answered_teacher' && q.aiSuggestedAnswer && (
                     <div className="mt-3 bg-emerald-50 rounded-md p-3 border border-emerald-100 flex items-start">
                       <div className="bg-emerald-100 rounded-full p-1 mr-3 shrink-0 mt-0.5">
                         <User className="h-4 w-4 text-emerald-600" />
                       </div>
                       <div>
                         <p className="text-xs font-bold text-emerald-800 mb-1">Teacher Reply</p>
                         <p className="text-sm text-emerald-900 whitespace-pre-wrap">{q.aiSuggestedAnswer}</p>
                       </div>
                     </div>
                   )}
                </div>
              ))
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
