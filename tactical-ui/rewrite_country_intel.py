import os

js_content = """import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell, BarChart, Bar, Legend, CartesianGrid } from 'recharts';
import useStore from '../store';
import { MOCK_COUNTRY_DATA, generateProceduralIntel, emptyFallback } from '../country_intel_data';
import { Shield, AlertTriangle, Zap, Anchor, Wind, Battery, Target, Fingerprint, Database, Cpu, Droplet, Flame, Compass, Crosshair } from 'lucide-react';

const CountryIntel = ({ country }) => {
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const { activeCountryCode, feeds, fetchCountryNews } = useStore();
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState(null);
  
  // Fetch real news when country changes
  useEffect(() => {
    if (country) {
      setNewsLoading(true);
      setNewsError(null);
      fetchCountryNews(country)
        .then(() => setNewsLoading(false))
        .catch(() => {
          setNewsLoading(false);
          setNewsError('FEED_OFFLINE');
        });
    }
  }, [country]);

  // Auto-refresh news every 60 seconds
  useEffect(() => {
    if (!country) return;
    const interval = setInterval(() => {
      fetchCountryNews(country);
    }, 60000);
    return () => clearInterval(interval);
  }, [country]);

  const activeCountryName = country || 'NONE';
  const data = MOCK_COUNTRY_DATA[activeCountryName] || generateProceduralIntel(activeCountryName) || emptyFallback;

  const tabs = ['OVERVIEW', 'ECONOMY', 'TRADE', 'SOCIETY', 'DEMOGRAPHICS', 'SECURITY', 'ENVIRONMENT', 'INTEL'];

  const getFlagCode = (name, isoCode) => {
    if (isoCode) {
      const code = isoCode.toLowerCase();
      if (code.length === 2 && code !== '-99') return code;
      const iso3to2 = { 'usa': 'us', 'chn': 'cn', 'rus': 'ru', 'vnm': 'vn', 'jpn': 'jp', 'kor': 'kr', 'prk': 'kp', 'gbr': 'gb', 'fra': 'fr', 'deu': 'de', 'ind': 'in', 'aus': 'au', 'bra': 'br', 'can': 'ca', 'ita': 'it', 'tur': 'tr', 'sau': 'sa', 'irn': 'ir', 'idn': 'id', 'ukr': 'ua', 'isr': 'il' };
      if (iso3to2[code]) return iso3to2[code];
    }
    const uName = (name || '').toUpperCase();
    const codes = {
      'UNITED STATES': 'us', 'CHINA': 'cn', 'RUSSIA': 'ru', 'VIETNAM': 'vn', 'JAPAN': 'jp', 'SOUTH KOREA': 'kr', 'NORTH KOREA': 'kp', 'UNITED KINGDOM': 'gb', 'FRANCE': 'fr', 'GERMANY': 'de', 'INDIA': 'in', 'AUSTRALIA': 'au', 'BRAZIL': 'br', 'CANADA': 'ca', 'ITALY': 'it', 'TURKEY': 'tr', 'SAUDI ARABIA': 'sa', 'IRAN': 'ir', 'INDONESIA': 'id', 'UKRAINE': 'ua', 'ISRAEL': 'il'
    };
    return codes[uName] || 'un';
  };

  const renderOverview = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-end gap-4">
        <div className="text-4xl font-bold text-white tracking-tighter">{data.overview?.risk || '---'}<span className="text-xs text-white/20 ml-1">/ 100</span></div>
        <div className="mb-1 text-[8px] font-bold text-primary tracking-widest uppercase">{data.overview?.status}</div>
      </div>
      <div className="h-1 bg-white/5 w-full">
        <div className="h-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" style={{ width: `${data.overview?.risk || 0}%` }} />
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        {data.overview?.metrics?.map(m => (
          <div key={m.label} className="space-y-1">
            <div className="flex justify-between text-[7px] font-bold tracking-widest text-white/40">
              <span>{m.label}</span>
              <span className="text-white">{m.val}</span>
            </div>
            <div className="h-0.5 bg-white/5 w-full">
              <div className="h-full" style={{ width: `${m.val}%`, backgroundColor: m.color }} />
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">// Threat Matrix Polygon</div>
        <div className="h-[160px] w-full relative" style={{ minHeight: '160px' }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
              ...(data.overview?.metrics?.map(m => ({ subject: m.label, A: m.val, fullMark: 100 })) || []),
              { subject: 'SYS RISK', A: data.overview?.risk || 50, fullMark: 100 }
            ]}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 7, fontWeight: 'bold' }} />
              <Radar name="Threat" dataKey="A" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.3} />
              <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', fontSize: '8px' }} itemStyle={{ color: '#22d3ee' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="p-3 bg-white/[0.02] border border-white/5 text-[9px] text-white/60 leading-relaxed uppercase tracking-wide">
        {data.overview?.summary}
      </div>
    </div>
  );

  const renderEconomy = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'GDP', val: data.economy?.gdp, sub: 'EST' },
          { label: 'GROWTH', val: data.economy?.growth, sub: 'YOY', color: 'text-green-400' },
          { label: 'INFLATION', val: data.economy?.inflation, sub: 'CPI', color: 'text-amber-400' },
          { label: 'UNEMPLOYMENT', val: data.economy?.unemployment, sub: 'RATE' },
          { label: 'DEBT/GDP', val: data.economy?.debt_gdp, sub: 'FISCAL', color: 'text-red-400' },
          { label: 'RESERVES', val: data.economy?.reserves, sub: 'FOREX', color: 'text-cyan-400' }
        ].map(m => (
          <div key={m.label} className="p-3 bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors">
            <div className="text-[7px] font-bold tracking-widest text-white/40 mb-1">{m.label}</div>
            <div className={`text-sm font-bold ${m.color || 'text-white'}`}>{m.val}</div>
            <div className="text-[6px] font-bold tracking-widest text-white/20 mt-1 uppercase">{m.sub}</div>
          </div>
        ))}
      </div>
      
      <div className="space-y-2">
         <div className="flex justify-between items-center">
            <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">// Central Bank Rate & Rating</div>
            <div className="text-[10px] font-bold text-white uppercase tracking-widest bg-white/10 px-2 py-0.5">{data.economy?.credit_rating}</div>
         </div>
         <div className="p-3 border border-white/5 bg-black/40 flex justify-between items-center">
            <span className="text-[9px] text-white/50 tracking-widest uppercase">CB Interest Rate</span>
            <span className="text-[11px] font-bold text-cyan-400">{data.economy?.cb_rate}</span>
         </div>
      </div>

      <div className="space-y-2">
        <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">// GDP Sector Breakdown</div>
        <div className="h-[120px] w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.economy?.sectors || []} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 8 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', fontSize: '9px' }} />
              <Bar dataKey="val" radius={[0, 4, 4, 0]}>
                {data.economy?.sectors?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderTrade = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-white/[0.02] border border-white/5">
          <div className="text-[7px] font-bold tracking-widest text-white/40 mb-1">EXPORTS / GDP</div>
          <div className="text-sm font-bold text-cyan-400">{data.trade?.exports_gdp}</div>
        </div>
        <div className="p-3 bg-white/[0.02] border border-white/5">
          <div className="text-[7px] font-bold tracking-widest text-white/40 mb-1">IMPORTS / GDP</div>
          <div className="text-sm font-bold text-red-400">{data.trade?.imports_gdp}</div>
        </div>
      </div>
      
      <div className="space-y-2">
         <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">// Strategic Vulnerabilities</div>
         <div className="p-3 border border-red-500/20 bg-red-500/[0.02] flex justify-between items-center group">
            <span className="text-[9px] text-white/50 tracking-widest uppercase flex items-center gap-2"><Flame size={10} className="text-red-400" /> Energy Dependence</span>
            <span className="text-[11px] font-bold text-red-400 group-hover:animate-pulse">{data.trade?.energy_dependence}</span>
         </div>
         <div className="p-3 border border-white/5 bg-white/[0.02]">
            <div className="text-[9px] text-white/50 tracking-widest uppercase mb-2 flex items-center gap-2"><Anchor size={10} className="text-cyan-400" /> Controlled/Reliant Chokepoints</div>
            <div className="flex flex-wrap gap-2">
               {data.trade?.chokepoints?.map(c => (
                  <span key={c} className="text-[8px] bg-cyan-400/10 text-cyan-400 px-2 py-1 uppercase tracking-widest border border-cyan-400/20">{c}</span>
               ))}
            </div>
         </div>
      </div>

      <div className="space-y-2">
        <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">// Major Trading Partners</div>
        <div className="space-y-1">
           {data.trade?.partners?.map((p, i) => (
             <div key={i} className="flex items-center justify-between p-2 bg-white/[0.02] border border-white/5 hover:bg-white/[0.05]">
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-bold text-white tracking-widest">{p.name}</span>
                   <span className={`text-[7px] px-1 py-0.5 uppercase tracking-widest ${p.type === 'Export' ? 'bg-cyan-400/20 text-cyan-400' : 'bg-red-500/20 text-red-400'}`}>{p.type}</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-16 h-1 bg-white/10 overflow-hidden">
                      <div className={`h-full ${p.type === 'Export' ? 'bg-cyan-400' : 'bg-red-400'}`} style={{ width: `${p.val}%` }} />
                   </div>
                   <span className="text-[9px] text-white/60 w-6 text-right">{p.val}%</span>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );

  const renderSociety = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'POPULATION', val: data.society?.population },
          { label: 'MILITARY AGE POP', val: data.society?.mil_age_pop, color: 'text-amber-400' },
          { label: 'URBANIZATION', val: data.society?.urbanization },
          { label: 'LITERACY', val: data.society?.literacy }
        ].map(m => (
          <div key={m.label} className="p-3 bg-white/[0.02] border border-white/5">
            <div className="text-[7px] font-bold tracking-widest text-white/40 mb-1">{m.label}</div>
            <div className={`text-sm font-bold ${m.color || 'text-white'}`}>{m.val}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
         <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">// Strategic Society Index</div>
         
         <div className="space-y-2">
            <div className="flex justify-between text-[9px] font-bold tracking-widest text-white/60">
               <span className="flex items-center gap-2"><Target size={10} className="text-cyan-400" /> Political Stability</span>
               <span>{data.society?.stability_index} / 100</span>
            </div>
            <div className="h-1 bg-white/10 w-full overflow-hidden">
               <div className="h-full bg-cyan-400" style={{ width: `${data.society?.stability_index}%` }} />
            </div>
         </div>

         <div className="space-y-2">
            <div className="flex justify-between text-[9px] font-bold tracking-widest text-white/60">
               <span className="flex items-center gap-2"><Fingerprint size={10} className="text-purple-400" /> Cyber Resilience</span>
               <span>{data.society?.cyber_resilience} / 100</span>
            </div>
            <div className="h-1 bg-white/10 w-full overflow-hidden">
               <div className="h-full bg-purple-400" style={{ width: `${data.society?.cyber_resilience}%` }} />
            </div>
         </div>
         
         <div className="space-y-2">
            <div className="flex justify-between text-[9px] font-bold tracking-widest text-white/60">
               <span className="flex items-center gap-2"><Database size={10} className="text-green-400" /> Digital Connectivity</span>
               <span>{data.society?.connectivity}</span>
            </div>
            <div className="h-1 bg-white/10 w-full overflow-hidden">
               <div className="h-full bg-green-400" style={{ width: `${data.society?.connectivity.replace('%','')}%` }} />
            </div>
         </div>
      </div>
    </div>
  );

  const renderDemographics = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2 bg-white/[0.02] border border-white/5 text-center">
          <div className="text-[6px] font-bold tracking-widest text-white/40 mb-1">YOUTH UNEMP</div>
          <div className="text-[10px] font-bold text-white">{data.demographics?.indicators?.youth_unemp}</div>
        </div>
        <div className="p-2 bg-white/[0.02] border border-white/5 text-center">
          <div className="text-[6px] font-bold tracking-widest text-white/40 mb-1">MIGRATION</div>
          <div className="text-[10px] font-bold text-white">{data.demographics?.indicators?.net_migration}</div>
        </div>
        <div className="p-2 bg-white/[0.02] border border-white/5 text-center">
          <div className="text-[6px] font-bold tracking-widest text-white/40 mb-1">FERTILITY</div>
          <div className="text-[10px] font-bold text-white">{data.demographics?.indicators?.fertility}</div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">// Population Pyramid (Male/Female)</div>
        <div className="h-[200px] w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={data.demographics?.pyramid || []} stackOffset="sign" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="ageGroup" type="category" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 8 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', fontSize: '9px' }} />
              <Legend iconSize={6} wrapperStyle={{ fontSize: '8px' }} />
              <Bar dataKey="male" name="Male (L)" fill="#3b82f6" stackId="stack" />
              <Bar dataKey="female" name="Female (R)" fill="#ec4899" stackId="stack" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-red-500/[0.05] border border-red-500/20 text-center group cursor-pointer hover:bg-red-500/10 transition-colors">
          <div className="text-[7px] font-bold tracking-widest text-red-400 mb-1">GLOBAL FIREPOWER</div>
          <div className="text-xl font-bold text-red-500 group-hover:scale-110 transition-transform">#{data.security?.gfp_rank}</div>
        </div>
        <div className={`p-3 border text-center ${data.security?.nuclear === 'YES' ? 'bg-amber-500/[0.05] border-amber-500/20' : 'bg-white/[0.02] border-white/5'}`}>
          <div className={`text-[7px] font-bold tracking-widest mb-1 ${data.security?.nuclear === 'YES' ? 'text-amber-400' : 'text-white/40'}`}>NUCLEAR ARSENAL</div>
          <div className={`text-lg font-bold ${data.security?.nuclear === 'YES' ? 'text-amber-500 animate-pulse' : 'text-white/20'}`}>{data.security?.nuclear}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
         <div className="p-3 bg-white/[0.02] border border-white/5">
            <div className="text-[7px] font-bold tracking-widest text-white/40 mb-1">ACTIVE DUTY</div>
            <div className="text-sm font-bold text-cyan-400">{data.security?.personnel?.active}</div>
         </div>
         <div className="p-3 bg-white/[0.02] border border-white/5">
            <div className="text-[7px] font-bold tracking-widest text-white/40 mb-1">RESERVES</div>
            <div className="text-sm font-bold text-white/70">{data.security?.personnel?.reserve}</div>
         </div>
      </div>

      <div className="space-y-2">
         <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">// Hardware Inventory</div>
         <div className="grid grid-cols-3 gap-2">
            {data.security?.hardware?.map((h, i) => (
               <div key={i} className="p-2 border border-white/10 bg-black/40 flex flex-col items-center justify-center text-center">
                  <span className="text-[12px] font-bold text-white">{h.count}</span>
                  <span className="text-[6px] tracking-widest text-white/40 uppercase mt-1">{h.type}</span>
               </div>
            ))}
         </div>
      </div>

      <div className="space-y-2">
         <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">// Strategic Alliances</div>
         <div className="flex flex-wrap gap-2">
            {data.security?.alliances?.map((a, i) => (
               <span key={i} className="px-2 py-1 text-[8px] font-bold tracking-widest bg-blue-500/20 text-blue-400 border border-blue-500/30">{a}</span>
            ))}
         </div>
      </div>
    </div>
  );

  const renderEnvironment = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-2">
         <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">// Critical Minerals & Supply Chain</div>
         <div className="flex flex-wrap gap-2">
            {data.environment?.critical_minerals?.map((m, i) => (
               <div key={i} className="px-3 py-1.5 bg-white/[0.05] border border-white/10 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_4px_#22d3ee]"></div>
                  <span className="text-[9px] font-bold text-white tracking-widest uppercase">{m}</span>
               </div>
            ))}
            {(!data.environment?.critical_minerals || data.environment.critical_minerals.length === 0) && (
               <span className="text-[9px] text-white/20 uppercase tracking-widest">No major reserves</span>
            )}
         </div>
      </div>

      <div className="space-y-2">
         <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">// Water / Climate Security Risk</div>
         <div className={`p-3 border flex justify-between items-center ${
            data.environment?.water_risk === 'SEVERE' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
            data.environment?.water_risk === 'HIGH' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
            'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
         }`}>
            <span className="text-[9px] font-bold tracking-widest flex items-center gap-2"><Droplet size={10} /> DROUGHT VULNERABILITY</span>
            <span className="text-[10px] font-bold">{data.environment?.water_risk}</span>
         </div>
      </div>

      <div className="space-y-2">
        <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">// Energy Grid Infrastructure</div>
        <div className="h-[140px] w-full mt-2 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data.environment?.grid_mix || []} innerRadius={35} outerRadius={55} paddingAngle={2} dataKey="val">
                {data.environment?.grid_mix?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', fontSize: '9px' }} />
              <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ fontSize: '8px', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderIntel = () => {
    if (newsLoading) {
      return (
        <div className="h-full flex flex-col items-center justify-center space-y-4">
          <div className="w-8 h-8 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
          <div className="text-[9px] font-bold text-cyan-400 tracking-widest uppercase animate-pulse">Decrypting Feed...</div>
        </div>
      );
    }

    if (newsError) {
      return (
        <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-50">
          <AlertTriangle size={24} className="text-red-500" />
          <div className="text-[9px] font-bold text-red-500 tracking-widest uppercase">Feed Offline</div>
        </div>
      );
    }

    const intelData = (feeds && feeds[country]) ? feeds[country] : data.intel;

    return (
      <div className="space-y-2 animate-in fade-in duration-500">
        <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest mb-4 flex justify-between">
           <span>// Live Feed</span>
           <span className="text-cyan-400 flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" /> SYNCED</span>
        </div>
        {intelData?.map((item) => (
          <a key={item.id} href={item.url || '#'} target="_blank" rel="noopener noreferrer" className="block p-3 border-l-2 border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors cursor-pointer group">
            <div className="flex justify-between items-start mb-2">
              <span className={`text-[7px] font-bold px-1 py-0.5 tracking-widest ${item.tag === 'HIGH' ? 'bg-red-500/20 text-red-500' : item.tag === 'MED' ? 'bg-amber-500/20 text-amber-500' : 'bg-cyan-500/20 text-cyan-400'}`}>
                {item.tag} PRIORITY
              </span>
              <span className="text-[7px] text-white/40 tracking-widest uppercase">{item.time}</span>
            </div>
            <div className="text-[10px] font-bold text-white/90 leading-relaxed mb-2 group-hover:text-cyan-400 transition-colors">
              {item.title}
            </div>
            <div className="text-[7px] font-bold text-white/20 uppercase tracking-widest flex items-center gap-1">
              SRC: <span className="text-white/40">{item.source}</span>
            </div>
          </a>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full bg-panel flex flex-col font-mono text-white overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
      
      <div className="p-3 border-b border-white/5 flex gap-3 overflow-x-auto no-scrollbar shrink-0">
        {tabs.map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-[9px] font-bold tracking-[0.2em] px-2 py-1 whitespace-nowrap transition-all ${activeTab === tab ? 'text-cyan-400 border-b border-cyan-400' : 'text-white/40 hover:text-white/80'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'OVERVIEW' && renderOverview()}
        {activeTab === 'ECONOMY' && renderEconomy()}
        {activeTab === 'TRADE' && renderTrade()}
        {activeTab === 'SOCIETY' && renderSociety()}
        {activeTab === 'DEMOGRAPHICS' && renderDemographics()}
        {activeTab === 'SECURITY' && renderSecurity()}
        {activeTab === 'ENVIRONMENT' && renderEnvironment()}
        {activeTab === 'INTEL' && renderIntel()}
      </div>
    </div>
  );
};

export default CountryIntel;
"""

with open('src/components/CountryIntel.jsx', 'w', encoding='utf-8') as f:
    f.write(js_content)
