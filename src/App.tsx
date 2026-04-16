/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Map as MapIcon, 
  Utensils, 
  LayoutDashboard, 
  ShieldAlert, 
  Smartphone,
  Navigation,
  ChevronRight,
  Wifi,
  Ticket,
  AlertTriangle,
  Zap,
  Clock,
  MapPin
} from 'lucide-react';
import { cn } from './lib/utils';
import { ZoneData, FanState, Incident, AIInsight } from './types';
import { getAIInsights } from './services/geminiService';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';

// Mock Data Generators
const INITIAL_ZONES: ZoneData[] = [
  { id: 'North', density: 45, capacity: 12500, occupancy: 5625, status: 'Normal', predictedDensity: 52 },
  { id: 'South', density: 82, capacity: 12500, occupancy: 10250, status: 'Warning', predictedDensity: 88 },
  { id: 'East', density: 25, capacity: 12500, occupancy: 3125, status: 'Normal', predictedDensity: 28 },
  { id: 'West', density: 60, capacity: 12500, occupancy: 7500, status: 'Normal', predictedDensity: 65 },
];

const INITIAL_INCIDENTS: Incident[] = [
  { id: '1', type: 'Crowd Pressure', location: 'Gate A (South)', severity: 'High', status: 'Reported', timestamp: new Date().toLocaleTimeString() },
  { id: '2', type: 'Medical', location: 'Section 102', severity: 'Medium', status: 'Dispatched', timestamp: new Date().toLocaleTimeString() },
];

export default function App() {
  const [role, setRole] = useState<'fan' | 'operator'>('fan');
  const [zones, setZones] = useState<ZoneData[]>(INITIAL_ZONES);
  const [fan, setFan] = useState<FanState>({
    id: 'fan-1',
    name: 'Sarah',
    gate: 'Gate D (East)',
    zone: 'East',
    seat: 'Sec 204, Row 12, Seat 8',
    arrivalProgress: 0.3,
    foodOrder: {
      status: 'Idle',
      stand: 'Urban Burger (Sec 201)',
      items: ['Double Bacon Burger', 'Craft Cola']
    }
  });
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [activeTab, setActiveTab] = useState('home');

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setZones(prev => prev.map(z => {
        const delta = Math.floor(Math.random() * 5) - 2;
        const newOcc = Math.max(0, Math.min(z.capacity, z.occupancy + delta));
        const newDensity = Math.round((newOcc / z.capacity) * 100);
        return {
          ...z,
          occupancy: newOcc,
          density: newDensity,
          status: newDensity > 85 ? 'Critical' : newDensity > 75 ? 'Warning' : 'Normal',
          predictedDensity: Math.min(100, newDensity + Math.floor(Math.random() * 8))
        };
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // AI Insights Loop
  useEffect(() => {
    const fetchInsights = async () => {
      const newInsights = await getAIInsights(zones);
      setInsights(newInsights);
    };
    fetchInsights();
    const interval = setInterval(fetchInsights, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Role Switcher Overlay */}
      <div className="fixed top-4 right-4 z-50 flex gap-2 p-1 bg-zinc-900 border border-zinc-800 rounded-full shadow-2xl">
        <button 
          onClick={() => setRole('fan')}
          className={cn(
            "flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all",
            role === 'fan' ? "bg-brand text-white" : "text-zinc-400 hover:text-white"
          )}
        >
          <Smartphone size={14} /> Fan Mode
        </button>
        <button 
          onClick={() => setRole('operator')}
          className={cn(
            "flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all",
            role === 'operator' ? "bg-brand text-white" : "text-zinc-400 hover:text-white"
          )}
        >
          <LayoutDashboard size={14} /> Operator
        </button>
      </div>

      <AnimatePresence mode="wait">
        {role === 'fan' ? (
          <FanInterface fan={fan} setFan={setFan} activeTab={activeTab} setActiveTab={setActiveTab} zones={zones} />
        ) : (
          <OperatorInterface zones={zones} incidents={incidents} insights={insights} />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Fan Interface ---

function FanInterface({ fan, setFan, activeTab, setActiveTab, zones }: { 
  fan: FanState, 
  setFan: (f: FanState) => void,
  activeTab: string,
  setActiveTab: (t: string) => void,
  zones: ZoneData[]
}) {
  const currentZone = zones.find(z => z.id === fan.zone);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 flex flex-col max-w-md mx-auto w-full bg-zinc-950 border-x border-zinc-900 shadow-2xl overflow-hidden relative"
    >
      {/* Header */}
      <header className="p-6 pt-12 pb-4 bg-gradient-to-b from-zinc-900 to-zinc-950">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center orange-glow">
              <Zap size={18} className="text-white" />
            </div>
            <h1 className="text-xl">Flow<span className="text-brand">Arena</span></h1>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-zinc-800 rounded-full text-[10px] font-mono text-zinc-400">
            <Wifi size={10} className="text-green-500" /> STADIUM_5G
          </div>
        </div>

        {activeTab === 'home' && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <p className="text-2xl font-display mb-1">Welcome, {fan.name}</p>
            <p className="text-sm text-zinc-400 mb-6 font-sans">Kickoff in 45m · {fan.gate}</p>
          </motion.div>
        )}
      </header>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-6 pt-2 pb-24 space-y-6">
        {activeTab === 'home' && (
          <>
            {/* Real-time Status Card */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Ticket size={80} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Stadium Entry Plan</span>
                </div>
                <h3 className="text-lg mb-2">Gate D is currently clear</h3>
                <p className="text-sm text-zinc-400 mb-4 leading-relaxed">Optimal arrival window: <span className="text-white font-medium">19:15 – 19:30</span>. Head directly to Concourse East for the shortest route to your seat.</p>
                <button className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
                  View Entry Pass <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Smart Timeline Section */}
            <section>
              <h4 className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-4">Your AI Journey</h4>
              <div className="space-y-4">
                <TimelineItem 
                  title="Gate Assignment" 
                  desc={`Allocated to ${fan.gate} (2m wait)`}
                  time="19:10"
                  icon={<Ticket size={16} />}
                  status="done"
                />
                <TimelineItem 
                  title="F&B Pre-order Window" 
                  desc="Peak-avoidance slot: Urban Burger @ 19:40"
                  time="19:25"
                  icon={<Utensils size={16} />}
                  status="current"
                />
                <TimelineItem 
                  title="Kickoff" 
                  desc="Match starts: Arsenal vs Liverpool"
                  time="20:00"
                  icon={<Zap size={16} />}
                  status="upcoming"
                />
              </div>
            </section>
          </>
        )}

        {activeTab === 'map' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 h-full flex flex-col">
            <div className="flex-1 rounded-3xl bg-zinc-900 border border-zinc-800 relative overflow-hidden min-h-[400px]">
              {/* Simulated Map / Heatmap View */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#27272a_0%,_#09090b_100%)]">
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
                
                {/* Visualizing Zones */}
                <div className="absolute top-1/4 left-1/4 translate-x-[-50%] translate-y-[-50%] text-center">
                  <div className={cn("w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all", 
                    zones[0].density > 75 ? "border-red-500 bg-red-500/10" : "border-zinc-700 bg-zinc-800/10")}>
                    <span className="text-[10px] font-bold">{zones[0].id}: {zones[0].density}%</span>
                  </div>
                </div>
                <div className="absolute bottom-1/4 right-1/4 translate-x-[50%] translate-y-[50%] text-center">
                  <div className={cn("w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all", 
                    zones[1].density > 75 ? "border-red-500 bg-red-500/10" : "border-zinc-700 bg-zinc-800/10")}>
                    <span className="text-[10px] font-bold">{zones[1].id}: {zones[1].density}%</span>
                  </div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <MapPin className="text-brand shrink-0 mx-auto mb-2" />
                    <span className="text-xs font-mono bg-brand/20 text-brand px-2 py-0.5 rounded">You are here</span>
                  </div>
                </div>
              </div>

              {/* AR Overlay Button */}
              <button className="absolute bottom-6 right-6 bg-brand h-14 w-14 rounded-full flex items-center justify-center orange-glow shadow-xl">
                <Navigation className="text-white" />
              </button>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4">
              <h5 className="text-sm font-medium mb-2">Live Congestion Alert</h5>
              <div className="flex items-center gap-3 text-xs text-zinc-400">
                <AlertTriangle size={14} className="text-amber-500" />
                <span>Heavy flow at South Concourse. Rerouting 400m through Tunnel C is recommended.</span>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'food' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
             <div className="bg-brand/10 border border-brand/20 rounded-2xl p-5">
               <div className="flex items-center gap-2 mb-3">
                 <Clock size={16} className="text-brand" />
                 <span className="text-xs font-bold text-brand uppercase tracking-tighter">Invisible Queue™ Active</span>
               </div>
               <h3 className="text-lg mb-1">Zero Wait Pickups</h3>
               <p className="text-sm text-zinc-400">Order now and get a precise 2-minute window when your food is ready. No standing in lines.</p>
             </div>

             <div className="space-y-4">
                <FoodItem title="Urban Burger (Sec 201)" rating="4.8" wait="5-8m" price="$$" />
                <FoodItem title="Stadium Pizza (Sec 210)" rating="4.2" wait="12m" price="$" />
                <FoodItem title="Craft Brews & Dogs" rating="4.6" wait="2m" price="$$" />
             </div>
          </motion.div>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-20 bg-zinc-900/80 backdrop-blur-xl border-t border-zinc-800 flex items-center justify-around px-8 z-40">
        <NavButton icon={<LayoutDashboard size={20} />} active={activeTab === 'home'} onClick={() => setActiveTab('home')} label="Home" />
        <NavButton icon={<MapIcon size={20} />} active={activeTab === 'map'} onClick={() => setActiveTab('map')} label="Nav" />
        <NavButton icon={<Utensils size={20} />} active={activeTab === 'food'} onClick={() => setActiveTab('food')} label="Order" />
        <NavButton icon={<Users size={20} />} active={activeTab === 'social'} onClick={() => setActiveTab('social')} label="Group" />
      </nav>
    </motion.div>
  );
}

function TimelineItem({ title, desc, time, icon, status }: { title: string, desc: string, time: string, icon: React.ReactNode, status: 'done' | 'current' | 'upcoming' }) {
  return (
    <div className="flex gap-4 relative">
      <div className="flex flex-col items-center">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center border transition-all",
          status === 'done' ? "bg-zinc-800 border-zinc-700 text-zinc-500" : 
          status === 'current' ? "bg-brand/20 border-brand text-brand orange-glow" : 
          "bg-zinc-900 border-zinc-800 text-zinc-600"
        )}>
          {icon}
        </div>
        <div className="w-px h-full bg-zinc-800 my-2" />
      </div>
      <div className="pb-8">
        <div className="flex justify-between items-center mb-1">
          <h5 className={cn("text-sm font-medium", status === 'upcoming' && "text-zinc-500")}>{title}</h5>
          <span className="text-[10px] font-mono text-zinc-500">{time}</span>
        </div>
        <p className="text-xs text-zinc-400 break-words">{desc}</p>
      </div>
    </div>
  );
}

function FoodItem({ title, rating, wait, price }: { title: string, rating: string, wait: string, price: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex gap-4 hover:border-zinc-700 transition-colors cursor-pointer group">
      <div className="w-16 h-16 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
        <Utensils size={20} className="text-zinc-500" />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <h5 className="text-sm font-medium">{title}</h5>
          <span className="text-[10px] text-zinc-500 font-mono">{price}</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-zinc-400 uppercase tracking-tight">
          <span className="flex items-center gap-1 text-amber-500">★ {rating}</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Clock size={10} /> {wait} wait</span>
        </div>
      </div>
    </div>
  );
}

function NavButton({ icon, active, onClick, label }: { icon: React.ReactNode, active: boolean, onClick: () => void, label: string }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 group">
      <div className={cn(
        "p-2 rounded-xl transition-all",
        active ? "bg-brand/10 text-brand" : "text-zinc-500 group-hover:text-zinc-300"
      )}>
        {icon}
      </div>
      <span className={cn("text-[10px] uppercase tracking-tighter transition-all font-bold", active ? "text-brand" : "text-zinc-500")}>{label}</span>
    </button>
  );
}

// --- Operator Interface ---

function OperatorInterface({ zones, incidents, insights }: { zones: ZoneData[], incidents: Incident[], insights: AIInsight[] }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col p-8 bg-[#09090b]"
    >
      <header className="flex justify-between items-end mb-8 border-b border-zinc-900 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-brand flex items-center justify-center">
              <ShieldAlert className="text-white" />
            </div>
            <h1 className="text-3xl font-display uppercase italic">Ops<span className="text-brand">Center</span></h1>
          </div>
          <p className="text-zinc-500 text-sm">Real-time Stadium Intelligence · Wembley Arena</p>
        </div>
        <div className="flex gap-4">
          <StatBox label="Active Fans" value="38,412" trend="+12%" />
          <StatBox label="Gate Throughput" value="1,240/m" trend="-3%" />
          <StatBox label="F&B Revenue" value="$42,105" trend="+24%" />
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8 flex-1">
        {/* Left Column: Metrics & Heatmap */}
        <div className="col-span-8 space-y-8">
          {/* Main Visualizer */}
          <div className="glass-panel rounded-3xl p-8 relative overflow-hidden min-h-[500px]">
            <h3 className="text-sm uppercase tracking-widest text-zinc-500 font-bold mb-8">Crowd Density Matrix</h3>
            <div className="grid grid-cols-2 gap-8 h-[calc(100%-60px)]">
              {zones.map(zone => (
                <div key={zone.id} className="relative group">
                  <div className={cn(
                    "absolute inset-0 rounded-2xl transition-all duration-1000",
                    zone.density > 85 ? "bg-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]" : 
                    zone.density > 75 ? "bg-amber-500/10" : "bg-zinc-800/10"
                  )} />
                  <div className="relative p-6 h-full flex flex-col justify-between border border-white/5 rounded-2xl hover:border-brand/30 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xl mb-1">{zone.id} Concourse</h4>
                        <p className="text-xs text-zinc-500 font-mono uppercase">Zone_{zone.id.toUpperCase()}</p>
                      </div>
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-widest",
                        zone.status === 'Critical' ? "bg-red-500/20 text-red-500" : 
                        zone.status === 'Warning' ? "bg-amber-500/20 text-amber-500" :
                        "bg-green-500/20 text-green-500"
                      )}>{zone.status}</span>
                    </div>

                    <div className="mt-8">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-4xl font-display font-medium text-white">{zone.density}%</span>
                        <div className="text-right">
                          <span className="text-[10px] text-zinc-500 uppercase block">T+5 Prediction</span>
                          <span className="text-xs text-brand font-bold">{zone.predictedDensity}% Flow</span>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${zone.density}%` }}
                          className={cn(
                            "h-full transition-all duration-1000",
                            zone.density > 85 ? "bg-red-500" : zone.density > 75 ? "bg-amber-500" : "bg-brand"
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Area Chart for Flow Trend */}
          <div className="glass-panel rounded-3xl p-8">
             <h3 className="text-sm uppercase tracking-widest text-zinc-500 font-bold mb-6">Aggregate Inflow Dynamics</h3>
             <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={zones}>
                    <defs>
                      <linearGradient id="colorDen" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF5C00" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#FF5C00" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="id" stroke="#71717a" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#71717a" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                      itemStyle={{ color: '#FF5C00' }}
                    />
                    <Area type="monotone" dataKey="density" stroke="#FF5C00" fillOpacity={1} fill="url(#colorDen)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>

        {/* Right Column: AI Insights & Incidents */}
        <div className="col-span-4 space-y-8">
          {/* AI Advisor Panel */}
          <div className="bg-brand/[0.03] border border-brand/20 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Zap size={100} />
            </div>
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-brand blur-md opacity-50 animate-pulse" />
                <Zap className="text-brand relative" size={18} />
              </div>
              <h3 className="text-sm uppercase tracking-widest text-brand font-bold">AI Stadium Advisor</h3>
            </div>

            <div className="space-y-4">
              {insights.length > 0 ? insights.map((insight, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 hover:border-brand/40 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    {insight.severity === 'critical' ? <ShieldAlert size={14} className="text-red-500" /> : <Zap size={14} className="text-brand" />}
                    <h5 className="text-sm font-medium">{insight.title}</h5>
                  </div>
                  <p className="text-xs text-zinc-400 mb-3 leading-relaxed">{insight.content}</p>
                  {insight.action && (
                    <button className={cn(
                      "w-full py-2 rounded-lg text-xs font-bold uppercase transition-colors",
                      insight.severity === 'critical' ? "bg-red-500 text-white" : "bg-brand/20 text-brand hover:bg-brand/30"
                    )}>
                      Execute: {insight.action}
                    </button>
                  )}
                </motion.div>
              )) : (
                <div className="flex flex-col items-center justify-center p-8 opacity-50">
                  <div className="w-8 h-8 rounded-full border-2 border-brand border-t-transparent animate-spin mb-4" />
                  <p className="text-xs font-mono uppercase">Processing Intelligence...</p>
                </div>
              )}
            </div>
          </div>

          {/* Active Incidents */}
          <div className="glass-panel rounded-3xl p-8">
            <h3 className="text-sm uppercase tracking-widest text-zinc-500 font-bold mb-6">Active Security Log</h3>
            <div className="space-y-4">
              {incidents.map(incident => (
                <div key={incident.id} className="p-4 bg-zinc-900 rounded-xl border-l-2 border-l-brand">
                   <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-mono text-zinc-500">{incident.timestamp}</span>
                      <span className={cn(
                        "text-[9px] px-1.5 py-0.5 rounded font-bold uppercase",
                        incident.severity === 'High' ? "bg-red-500/20 text-red-500" : "bg-amber-500/20 text-amber-500"
                      )}>{incident.severity}</span>
                   </div>
                   <h5 className="text-sm font-medium mb-1">{incident.type}</h5>
                   <p className="text-xs text-zinc-500 mb-2">{incident.location}</p>
                   <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider">
                      <span className="text-brand">{incident.status}</span>
                      <button className="text-zinc-400 hover:text-white transition-colors">Dispatch Support →</button>
                   </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all uppercase tracking-widest">
              View All Logs
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatBox({ label, value, trend }: { label: string, value: string, trend: string }) {
  const isUp = trend.startsWith('+');
  return (
    <div className="text-right">
      <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">{label}</span>
      <div className="flex items-center gap-2 justify-end">
        <span className={cn(
          "text-[10px] font-mono",
          isUp ? "text-green-500" : "text-red-500"
        )}>{trend}</span>
        <span className="text-2xl font-display">{value}</span>
      </div>
    </div>
  );
}

