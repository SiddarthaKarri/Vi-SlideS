
import { useNavigate } from 'react-router-dom';
import { Plus, LayoutDashboard, Settings, LogOut, Users, BookOpen } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();

  const handleCreateSession = async () => {
    try {
      const userStr = localStorage.getItem('user');
      const teacherId = userStr ? JSON.parse(userStr)._id : 'guest-teacher';

      const res = await fetch('http://localhost:5000/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teacherId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      navigate(`/teacher-session/${data.sessionCode}`);
    } catch (error) {
       console.error("Failed to create session", error);
       alert("Failed to create session");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-gray-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 bg-white flex flex-col hidden md:flex">
        <div className="p-6 border-b border-gray-200 flex items-center gap-3 text-indigo-600 font-bold text-xl tracking-tight">
           <BookOpen className="w-6 h-6" />
           Vi-SlideS
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-50 text-indigo-700 rounded-xl font-medium transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            Active Classes
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl font-medium transition-colors">
            <Users className="w-5 h-5" />
            Students
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl font-medium transition-colors">
            <Settings className="w-5 h-5" />
            Settings
          </button>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="h-20 border-b border-gray-200 flex items-center justify-between px-8 bg-white/80 backdrop-blur-xl sticky top-0 z-10 transition-all">
          <h1 className="text-2xl font-semibold text-gray-900">Teacher Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-sm">
              TD
            </div>
          </div>
        </header>

        <div className="p-8 max-w-6xl w-full flex-1">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-medium text-gray-900">Your Sessions</h2>
              <p className="text-sm text-gray-500 mt-1">Manage your active and upcoming classes</p>
            </div>
            <button 
              onClick={handleCreateSession}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-5 h-5" />
              New Session
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-2xl p-8 flex flex-col items-center justify-center text-center text-gray-500 min-h-[300px] col-span-full hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 border border-gray-200 shadow-sm">
                <LayoutDashboard className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active sessions</h3>
              <p className="text-sm max-w-xs mb-6 leading-relaxed">Create a new session to generate a unique join code for your students and begin the class.</p>
              <button 
                onClick={handleCreateSession}
                className="text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1 group"
              >
                <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" /> Create your first session
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
