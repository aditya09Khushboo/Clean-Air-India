import React, { useState, useEffect } from 'react';
import { AlertCircle, Mic, CheckCircle, BarChart3, MapPin } from 'lucide-react';

export default function JanAawaazDashboard() {
  const [activeTab, setActiveTab] = useState('ingest');
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [processedGrievance, setProcessedGrievance] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  // Mock initial requests aggregated across states
  const [grievanceList, setGrievanceList] = useState([
    { id: 'FB-101', district: 'Purnia', state: 'Bihar', category: 'Roads', urgency: 'Critical', calculatedPriorityScore: 8.45, summary: 'Flood damaged bridge isolating 4 villages.' },
    { id: 'FB-102', district: 'Dhubri', state: 'Assam', category: 'Healthcare', urgency: 'High', calculatedPriorityScore: 7.90, summary: 'PHC lacks electricity connection for medical storage.' }
  ]);

  const handleTextSubmit = async () => {
    if (!textInput) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/feedback/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textInput })
      });
      const data = await res.json();
      if (data.success) {
        setProcessedGrievance(data.record);
        setGrievanceList([data.record, ...grievanceList]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/policy/recommendations');
      const data = await res.json();
      setRecommendations(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'policy') fetchRecommendations();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-6">
      {/* Top Header */}
      <header className="border-b border-slate-800 pb-4 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-wide text-amber-400">JanAawaaz | जनआवाज</h1>
          <p className="text-sm text-slate-400">National Citizen Feedback & Infrastructure Prioritization Engine</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('ingest')} 
            className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'ingest' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
            Citizen Portal
          </button>
          <button 
            onClick={() => setActiveTab('policy')} 
            className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'policy' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
            Policymaker Dashboard
          </button>
        </div>
      </header>

      {/* Main Container */}
      {activeTab === 'ingest' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h2 className="text-lg font-semibold mb-4 text-slate-200">Submit Request (Hindi, Tamil, English, etc.)</h2>
            <textarea 
              rows="4" 
              value={textInput} 
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="e.g. पूर्णिया जिले के कस्बा ब्लॉक में मुख्य सड़क बारिश के कारण बह गई है..." 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-amber-500 mb-4"
            />
            <div className="flex gap-3">
              <button 
                onClick={handleTextSubmit} 
                disabled={loading}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-5 py-2.5 rounded-lg flex items-center gap-2">
                {loading ? 'Processing via Google AI...' : 'Analyze & Route Request'}
              </button>
            </div>
          </div>

          {processedGrievance && (
            <div className="bg-slate-800 p-6 rounded-xl border border-amber-500/30">
              <h2 className="text-lg font-semibold mb-2 text-amber-400 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" /> AI Real-time Structuring
              </h2>
              <div className="space-y-2 text-sm text-slate-300">
                <p><strong>District:</strong> {processedGrievance.district} ({processedGrievance.state})</p>
                <p><strong>Category:</strong> {processedGrievance.category}</p>
                <p><strong>Urgency Level:</strong> <span className="text-red-400 font-semibold">{processedGrievance.urgency}</span></p>
                <p><strong>English Summary:</strong> {processedGrievance.summary}</p>
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-700 mt-4">
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Calculated Priority Index</p>
                  <p className="text-2xl font-bold text-amber-400">{processedGrievance.calculatedPriorityScore} / 10</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <p className="text-sm text-slate-400">Total Grievances Processed</p>
              <p className="text-2xl font-bold text-slate-100">12,482</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <p className="text-sm text-slate-400">Highest Demand Sector</p>
              <p className="text-2xl font-bold text-amber-400">Rural Connectivity (PMGSY)</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <p className="text-sm text-slate-400">Top Priority Hotspot</p>
              <p className="text-2xl font-bold text-red-400">Seemanchal Region, Bihar</p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-200">AI-Synthesized Investment Priorities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="bg-slate-800 p-5 rounded-xl border border-slate-700 space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-amber-400 text-base">{rec.title}</h3>
                  <span className="text-xs bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/20">{rec.sector}</span>
                </div>
                <p className="text-sm text-slate-300">{rec.justification}</p>
                <div className="flex justify-between text-xs text-slate-400 pt-2 border-t border-slate-700">
                  <span>Est. Budget: <strong>{rec.estimatedCostINR}</strong></span>
                  <span>Impact Score: <strong>{rec.impactScore}/10</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
