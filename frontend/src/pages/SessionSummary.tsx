import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BarChart3, Brain, Smile, Frown, Target, ArrowLeft, Presentation, Sparkles } from 'lucide-react';

export default function SessionSummary() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<any[]>([]);
  const [moodData, setMoodData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Fetch all questions
        const qRes = await fetch(`http://localhost:5000/api/questions/${code}`);
        const qData = await qRes.json();
        setQuestions(qData);

        // Fetch mood analysis
        const token = localStorage.getItem('token');
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        const moodRes = await fetch(`http://localhost:5000/api/analytics/${code}/mood`, {
            method: 'POST',
            headers
        });
        if(moodRes.ok) {
            const mData = await moodRes.json();
            setMoodData(mData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [code]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><BarChart3 className="w-8 h-8 animate-bounce text-indigo-600" /></div>;

  const totalQuestions = questions.length;
  const aiAnswered = questions.filter(q => q.status === 'answered_ai').length;
  const avgComplexity = totalQuestions ? (questions.reduce((acc, q) => acc + (q.complexity || 3), 0) / totalQuestions).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="h-20 border-b border-gray-200 flex items-center justify-between px-6 bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/teacher-dashboard')} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-3"><Presentation className="w-5 h-5 text-indigo-600" /> Session Summary: {code}</h1>
          </div>
        </div>
      </header>
      
      <main className="flex-1 max-w-6xl w-full mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="bg-indigo-100 p-4 rounded-xl"><Target className="w-8 h-8 text-indigo-600" /></div>
              <div><p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Total Questions</p><p className="text-3xl font-black text-gray-900">{totalQuestions}</p></div>
           </div>
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="bg-emerald-100 p-4 rounded-xl"><Brain className="w-8 h-8 text-emerald-600" /></div>
              <div><p className="text-gray-500 text-sm font-bold uppercase tracking-widest">AI Deflection Rate</p><p className="text-3xl font-black text-gray-900">{totalQuestions ? Math.round((aiAnswered/totalQuestions)*100) : 0}%</p></div>
           </div>
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="bg-amber-100 p-4 rounded-xl"><BarChart3 className="w-8 h-8 text-amber-600" /></div>
              <div><p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Avg Complexity</p><p className="text-3xl font-black text-gray-900">{avgComplexity} <span className="text-lg text-gray-400">/ 5</span></p></div>
           </div>
        </div>

        {moodData && moodData.sentiment && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Smile className="w-6 h-6 text-indigo-600"/> Class Mood Analysis</h2>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <p className="text-gray-800 font-medium leading-relaxed">{moodData.sentiment}</p>
            </div>
            {moodData.topics && (
                <div className="mt-4 flex gap-2 flex-wrap">
                    {moodData.topics.map((t: string, i: number) => <span key={i} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{t}</span>)}
                </div>
            )}
        </div>
        )}

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6">Complete Question Log</h2>
            <div className="space-y-4">
                {questions.map((q: any) => (
                    <div key={q._id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex items-start justify-between">
                        <div>
                            <p className="font-semibold text-gray-900">{q.question}</p>
                            {q.aiSuggestedAnswer && <p className="text-sm text-gray-600 mt-2 bg-white p-3 rounded-lg border border-gray-100 flex items-start gap-2"><Sparkles className="w-3 h-3 text-indigo-500 mt-1 flex-shrink-0"/> {q.aiSuggestedAnswer}</p>}
                        </div>
                        <div className="flex flex-col items-end gap-2 ml-4 flex-shrink-0">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${q.status === 'answered_ai' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-700'}`}>{q.status.replace('_', ' ')}</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1">Complexity: <span className="text-gray-700 font-black">{q.complexity}/5</span></span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </main>
    </div>
  );
}
