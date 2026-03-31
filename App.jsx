import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Car, 
  Download, 
  Zap, 
  Thermometer, 
  Battery, 
  AlertCircle, 
  Info, 
  Cpu,
  BrainCircuit,
  Sparkles,
  Search,
  Droplets
} from 'lucide-react';

const App = () => {
  const [vehicle, setVehicle] = useState({ make: '', model: '', year: '2024' });
  const [symptoms, setSymptoms] = useState('');
  const [selectedLight, setSelectedLight] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastCallTime, setLastCallTime] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState(null);

  const COOLDOWN_MS = 30000;

  const warningLights = [
    { id: 'engine', name: 'Check Engine', icon: <Cpu className="w-6 h-6" />, color: 'text-amber-500' },
    { id: 'oil', name: 'Oil Pressure', icon: <Droplets className="w-6 h-6" />, color: 'text-red-500' },
    { id: 'battery', name: 'Battery/Alt', icon: <Battery className="w-6 h-6" />, color: 'text-red-500' },
    { id: 'temp', name: 'Coolant Temp', icon: <Thermometer className="w-6 h-6" />, color: 'text-red-500' },
    { id: 'brake', name: 'Brake System', icon: <AlertCircle className="w-6 h-6" />, color: 'text-red-500' },
    { id: 'tire', name: 'Tire Pressure', icon: <AlertTriangle className="w-6 h-6" />, color: 'text-amber-500' },
  ];

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const runDiagnostic = async () => {
    if (!vehicle.make || !vehicle.model) {
      setError("Please enter your vehicle's Make and Model.");
      return;
    }

    const now = Date.now();
    if (now - lastCallTime < COOLDOWN_MS) {
      setCooldown(Math.ceil((COOLDOWN_MS - (now - lastCallTime)) / 1000));
      return;
    }

    setLoading(true);
    setError(null);

    const systemPrompt = `
      You are a Senior Master Automotive Technician.
      Provide a concise, professional diagnostic analysis for the following vehicle:
      Vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model}
      Selected Warning Light: ${selectedLight ? selectedLight.name : 'None'}
      User Symptoms: ${symptoms}

      Structure your response:
      1. Potential Cause: Identify 2-3 likely issues.
      2. Severity Level: (Low/Medium/High/Critical).
      3. Action Steps: Professional advice.
      4. Estimated Complexity: How difficult is the fix?
    `;

    try {
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuery: symptoms || 'Visual warning light analysis.',
          systemPrompt: systemPrompt
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Server error');
      }
      
      setAnalysis(data.text);
      setLastCallTime(Date.now());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const rows = [
      ["Field", "Value"],
      ["Date", new Date().toLocaleString()],
      ["Vehicle", `${vehicle.year} ${vehicle.make} ${vehicle.model}`],
      ["Warning Light", selectedLight ? selectedLight.name : 'N/A'],
      ["User Symptoms", symptoms.replace(/"/g, '""')],
      ["AI Diagnostic", analysis.replace(/"/g, '""')]
    ];
    const csvContent = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Diagnostic_Report_${vehicle.make}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <nav className="bg-slate-900 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="text-amber-400 w-6 h-6 fill-amber-400" />
            <span className="font-bold text-xl tracking-tight">AutoSense AI</span>
          </div>
        </div>
      </nav>

      <header className="bg-slate-900 text-white pt-12 pb-24 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Universal Car Diagnostic Tool</h1>
          <p className="text-slate-400 text-lg">AI-powered mechanical insights for dashboard warning lights.</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 -mt-12">
        <div className="grid lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-6 font-bold text-slate-700">
                <Car className="w-5 h-5 text-indigo-500" />
                <h2>Vehicle Profile</h2>
              </div>
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Make (e.g. Toyota)"
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none"
                  value={vehicle.make}
                  onChange={(e) => setVehicle({...vehicle, make: e.target.value})}
                />
                <input 
                  type="text" 
                  placeholder="Model (e.g. Corolla)"
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none"
                  value={vehicle.model}
                  onChange={(e) => setVehicle({...vehicle, model: e.target.value})}
                />
                <select 
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none bg-white"
                  value={vehicle.year}
                  onChange={(e) => setVehicle({...vehicle, year: e.target.value})}
                >
                  {[2025, 2024, 2023, 2022, 2021, 2020].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-6 font-bold text-slate-700">
                <Search className="w-5 h-5 text-indigo-500" />
                <h2>Dashboard Warning Lights</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {warningLights.map(light => (
                  <button
                    key={light.id}
                    onClick={() => setSelectedLight(selectedLight?.id === light.id ? null : light)}
                    className={`flex flex-col items-center p-3 rounded-2xl transition-all border-2 ${
                      selectedLight?.id === light.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    <div className={light.color}>{light.icon}</div>
                    <span className="text-[10px] font-bold mt-2 uppercase text-slate-500">{light.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <textarea 
                className="w-full h-32 p-4 rounded-xl border border-slate-200 outline-none resize-none text-sm bg-slate-50 mb-4"
                placeholder="Additional symptoms (noises, smells, vibrations)..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              />
              <button 
                disabled={loading || cooldown > 0}
                onClick={runDiagnostic}
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50"
              >
                {loading ? <div className="spinner" /> : (
                  <>
                    <BrainCircuit className="w-5 h-5" />
                    <span>{cooldown > 0 ? `Wait ${cooldown}s` : 'Run AI Diagnostic'}</span>
                  </>
                )}
              </button>
              {error && <div className="mt-3 text-red-600 bg-red-50 p-3 rounded-lg text-xs border border-red-100">{error}</div>}
            </div>

            {analysis && (
              <div className="bg-white rounded-2xl shadow-md border border-indigo-100 p-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    Report
                  </h2>
                  <button onClick={exportCSV} className="text-xs flex items-center gap-2 text-slate-600">
                    <Download className="w-4 h-4" /> Export CSV
                  </button>
                </div>
                <div className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">
                  {analysis}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-20 py-12 bg-white border-t text-center text-slate-400 text-sm px-6">
        <p>AutoSense AI Diagnostic Tool &copy; 2026. Disclaimer: Consult a certified mechanic for safety-critical repairs.</p>
      </footer>
    </div>
  );
};

export default App;
