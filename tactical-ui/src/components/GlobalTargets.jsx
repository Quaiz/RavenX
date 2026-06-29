import React, { useState, useEffect, useRef } from 'react';
import { Search, AlertTriangle, User, Globe, MapPin, Loader2, Fingerprint, ShieldAlert, ChevronRight, Scale, X, Target } from 'lucide-react';
import useStore from '../store';
import { streamAiResponse } from '../aiManager';

const COUNTRY_MAP = {
  'RUSSIA': 'RU', 'RUSSIAN FEDERATION': 'RU',
  'USA': 'US', 'UNITED STATES': 'US', 'AMERICA': 'US',
  'CHINA': 'CN', 'PRC': 'CN',
  'IRAN': 'IR',
  'NORTH KOREA': 'KP', 'DPRK': 'KP',
  'VIETNAM': 'VN', 'VIET NAM': 'VN',
  'INDIA': 'IN', 'PAKISTAN': 'PK',
  'SYRIA': 'SY', 'IRAQ': 'IQ',
  'AFGHANISTAN': 'AF', 'UKRAINE': 'UA',
  'ISRAEL': 'IL', 'PALESTINE': 'PS',
  'YEMEN': 'YE', 'MEXICO': 'MX',
  'COLOMBIA': 'CO', 'BRAZIL': 'BR',
  'VENEZUELA': 'VE', 'FRANCE': 'FR',
  'UK': 'GB', 'UNITED KINGDOM': 'GB',
  'GERMANY': 'DE', 'ITALY': 'IT',
  'SPAIN': 'ES', 'JAPAN': 'JP',
  'SOUTH KOREA': 'KR', 'TURKEY': 'TR',
  'SAUDI ARABIA': 'SA', 'UAE': 'AE',
  'EGYPT': 'EG', 'SOUTH AFRICA': 'ZA',
  'NIGERIA': 'NG', 'KENYA': 'KE'
};

const GlobalTargets = () => {
  const [source, setSource] = useState('INTERPOL_RED'); // INTERPOL_RED, INTERPOL_YELLOW, FBI_WANTED
  const [query, setQuery] = useState('');
  const [targets, setTargets] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(-1);
  const [extraImages, setExtraImages] = useState([]);
  const [details, setDetails] = useState(null);

  const { selectedTarget, setSelectedTarget, setTrackingActive, addNotification, activeOperationId, addNodeToOperation } = useStore();

  const [aiTranslation, setAiTranslation] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const abortRef = useRef(null);

  // Search trigger
  const performSearch = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setTargets([]);
    setTotal(0);
    setPage(1);

    try {
      const q = query.trim().toUpperCase();
      if (source === 'INTERPOL_RED' || source === 'INTERPOL_YELLOW') {
        const type = source === 'INTERPOL_RED' ? 'red' : 'yellow';
        let url = `https://ws-public.interpol.int/notices/v1/${type}?resultPerPage=25`;
        if (q) {
          if (COUNTRY_MAP[q]) {
            url += `&nationality=${COUNTRY_MAP[q]}`;
          } else if (q.length === 2) {
            url += `&nationality=${q}`;
          } else {
            url += `&name=${encodeURIComponent(query.trim())}`;
          }
        }
        const res = await fetch(url, { referrerPolicy: 'no-referrer' });
        const data = await res.json();
        if (data?._embedded?.notices) {
          setTargets(data._embedded.notices.map(n => ({
            id: n.entity_id,
            name: `${n.forename || ''} ${n.name || ''}`.trim().toUpperCase(),
            dob: n.date_of_birth || 'UNKNOWN',
            nationality: n.nationalities?.[0] || 'UNKNOWN',
            thumb: n._links?.thumbnail?.href || null,
            raw: n,
            source
          })));
          setTotal(data.total || data._embedded.notices.length);
        }
      } else if (source === 'FBI_WANTED') {
        let url = `https://api.fbi.gov/wanted/v1/list?page=1`;
        if (query.trim()) {
          url += `&title=${encodeURIComponent(query.trim())}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        if (data?.items) {
          setTargets(data.items.map(item => ({
            id: item.uid,
            name: item.title.toUpperCase(),
            dob: item.dates_of_birth_used?.[0] || 'UNKNOWN',
            nationality: item.nationality || 'UNKNOWN',
            thumb: item.images?.[0]?.thumb || null,
            raw: item,
            source
          })));
          setTotal(data.total || data.items.length);
        }
      }
    } catch (err) {
      console.error('Search targets failed:', err);
      addNotification('FAILED TO CONTACT SYSTEM DATABASE', 'WARNING');
    } finally {
      setIsLoading(false);
    }
  };

  // Load more
  const loadMore = async () => {
    if (isLoading || targets.length >= total) return;
    setIsLoading(true);
    const nextPage = page + 1;

    try {
      const q = query.trim().toUpperCase();
      if (source === 'INTERPOL_RED' || source === 'INTERPOL_YELLOW') {
        const type = source === 'INTERPOL_RED' ? 'red' : 'yellow';
        let url = `https://ws-public.interpol.int/notices/v1/${type}?resultPerPage=25&page=${nextPage}`;
        if (q) {
          if (COUNTRY_MAP[q]) url += `&nationality=${COUNTRY_MAP[q]}`;
          else if (q.length === 2) url += `&nationality=${q}`;
          else url += `&name=${encodeURIComponent(query.trim())}`;
        }
        const res = await fetch(url, { referrerPolicy: 'no-referrer' });
        const data = await res.json();
        if (data?._embedded?.notices) {
          const newNotices = data._embedded.notices.map(n => ({
            id: n.entity_id,
            name: `${n.forename || ''} ${n.name || ''}`.trim().toUpperCase(),
            dob: n.date_of_birth || 'UNKNOWN',
            nationality: n.nationalities?.[0] || 'UNKNOWN',
            thumb: n._links?.thumbnail?.href || null,
            raw: n,
            source
          }));
          setTargets(prev => [...prev, ...newNotices]);
          setPage(nextPage);
        }
      } else if (source === 'FBI_WANTED') {
        let url = `https://api.fbi.gov/wanted/v1/list?page=${nextPage}`;
        if (query.trim()) url += `&title=${encodeURIComponent(query.trim())}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data?.items) {
          const newItems = data.items.map(item => ({
            id: item.uid,
            name: item.title.toUpperCase(),
            dob: item.dates_of_birth_used?.[0] || 'UNKNOWN',
            nationality: item.nationality || 'UNKNOWN',
            thumb: item.images?.[0]?.thumb || null,
            raw: item,
            source
          }));
          setTargets(prev => [...prev, ...newItems]);
          setPage(nextPage);
        }
      }
    } catch (err) {
      console.error('Load more targets failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Select target & fetch detail
  const selectTarget = async (target) => {
    setSelectedTarget(target);
    setDetails(null);
    setExtraImages([]);
    setActiveImageIndex(-1);
    setIsDetailsLoading(true);
    setAiTranslation('');
    setIsTranslating(false);
    if (abortRef.current) abortRef.current.abort();

    try {
      if (target.source === 'INTERPOL_RED' || target.source === 'INTERPOL_YELLOW') {
        const fetchUrl = target.raw._links?.self?.href || `https://ws-public.interpol.int/notices/v1/${target.source === 'INTERPOL_RED' ? 'red' : 'yellow'}/${target.id.replace('/', '-')}`;
        const res = await fetch(fetchUrl, { referrerPolicy: 'no-referrer' });
        const data = await res.json();
        setDetails(data);
        
        if (data._links?.images?.href) {
          try {
            const imgRes = await fetch(data._links.images.href, { referrerPolicy: 'no-referrer' });
            const imgData = await imgRes.json();
            if (imgData?._embedded?.images) {
              setExtraImages(imgData._embedded.images.map(im => im._links?.self?.href || im._links?.thumbnail?.href));
            }
          } catch (e) {}
        }
      } else if (target.source === 'FBI_WANTED') {
        // FBI already returns all details in the list item
        setDetails(target.raw);
        if (target.raw.images) {
          setExtraImages(target.raw.images.map(img => img.original || img.large));
        }
      }
    } catch (err) {
      console.error('Fetch target details failed:', err);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  // AI Dossier Decryption
  const translateDossier = async () => {
    if (!details) return;
    setAiTranslation('');
    setIsTranslating(true);
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    let chargesText = '';
    if (source.startsWith('INTERPOL') && details.arrest_warrants) {
      chargesText = details.arrest_warrants.map(w => w.charge).join(' | ');
    } else if (details.caution || details.description) {
      chargesText = `${details.caution || ''} | ${details.description || ''}`;
    }

    const prompt = `You are RAVEN, an elite tactical intelligence AI.
The user is requesting a highly detailed tactical dossier expansion for a wanted target.
Charges & Warning Details: ${chargesText}

Task:
1. Translate the charges or warning details into classified tactical terms.
2. Provide a "TACTICAL THREAT ASSESSMENT" (severity level, modus operandi, risks).
3. Provide a "ENGAGEMENT PROTOCOL" for field squads.
Output ONLY the detailed dossier in a highly structured format. Keep it concise, uppercase headers, pure tactical flavor.`;

    try {
      let firstChunk = false;
      await streamAiResponse(prompt, {
        signal: abortRef.current.signal,
        config: { temperature: 0.4, maxOutputTokens: 600 },
        onChunk: (text) => {
          if (!firstChunk) {
            setAiTranslation('');
            firstChunk = true;
          }
          setAiTranslation(prev => prev + text);
        },
        onComplete: () => setIsTranslating(false),
        onError: () => {
          setAiTranslation('ERROR: Tactical link severed.');
          setIsTranslating(false);
        }
      });
    } catch (err) {
      setIsTranslating(false);
    }
  };

  useEffect(() => {
    performSearch();
  }, [source]);

  const clearSelection = () => {
    setSelectedTarget(null);
    setDetails(null);
    setExtraImages([]);
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0000] border border-red-900/30 text-white font-mono">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between p-3 border-b border-red-900/50 bg-red-950/20">
        <div className="flex items-center gap-2">
          <AlertTriangle size={13} className="text-red-500 animate-pulse" />
          <div>
            <div className="text-[11px] font-bold text-red-500 tracking-widest">GLOBAL TARGET REGISTRY</div>
            <div className="text-[9px] text-red-500/50 tracking-wider">REAL-TIME OSINT SEARCH CONSOLE</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[14px] font-bold text-red-500">{total > 0 ? total.toLocaleString() : targets.length}</div>
          <div className="text-[7px] text-red-500/50 tracking-widest font-bold">RECORDS RETRIEVED</div>
        </div>
      </div>

      {/* Database Selectors */}
      <div className="shrink-0 flex border-b border-red-900/20 bg-black/60">
        {[
          { id: 'INTERPOL_RED', label: 'INTERPOL RED' },
          { id: 'INTERPOL_YELLOW', label: 'INTERPOL YELLOW' },
          { id: 'FBI_WANTED', label: 'FBI MOST WANTED' }
        ].map(src => (
          <button
            key={src.id}
            onClick={() => setSource(src.id)}
            className={`flex-1 py-2 text-[8px] font-bold tracking-widest border-r border-red-900/20 transition-all ${
              source === src.id ? 'bg-red-950/40 text-red-400 border-b-2 border-b-red-500' : 'text-red-900 hover:text-red-500 hover:bg-red-950/10'
            }`}
          >
            {src.label}
          </button>
        ))}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left pane: Search list */}
        <div className={`shrink-0 flex flex-col border-r border-red-900/30 bg-black/40 transition-all duration-300 ${
          selectedTarget ? 'hidden md:flex md:w-[40%]' : 'flex w-full'
        }`}>
          <div className="p-3 border-b border-red-900/20">
            <form onSubmit={performSearch} className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-red-500/50" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="QUERY CLASSIFIED INDEX..."
                className="w-full bg-black/60 border border-red-900/50 py-1.5 pl-7 pr-2 text-[10px] text-red-400 placeholder:text-red-900 focus:outline-none focus:border-red-500 uppercase tracking-widest"
              />
            </form>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-red-500/50">
                <Loader2 size={16} className="animate-spin mb-2" />
                <div className="text-[9px] tracking-widest uppercase">SCANNING DIRECTORIES...</div>
              </div>
            ) : targets.length === 0 ? (
              <div className="text-center p-4 text-[9px] text-red-500/40 uppercase">NO TARGET DATA INDEXED</div>
            ) : (
              <div className={`grid gap-2 ${selectedTarget ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                {targets.map((tgt, idx) => {
                  const isSelected = selectedTarget?.id === tgt.id;
                  return (
                    <div
                      key={`${tgt.id}-${idx}`}
                      onClick={() => selectTarget(tgt)}
                      className={`flex items-start gap-3 p-2 cursor-pointer transition-all border group ${
                        isSelected ? 'bg-red-900/20 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.2)]' : 'bg-black/60 border-red-900/30 hover:border-red-500/50 hover:bg-red-950/15'
                      }`}
                    >
                      <div className="shrink-0 w-12 h-14 bg-red-950/20 border border-red-900/40 flex items-center justify-center overflow-hidden">
                        {tgt.thumb ? (
                          <img src={tgt.thumb} alt="thumb" className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all" onError={(e)=>{e.target.style.display='none';}} referrerPolicy="no-referrer" />
                        ) : (
                          <User size={14} className="text-red-950" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[9px] font-bold text-red-200 group-hover:text-red-400 truncate uppercase tracking-wider">{tgt.name}</div>
                        <div className="flex items-center gap-1.5 mt-1 text-[8px] text-red-500/60 font-semibold">
                          <span className="px-1 py-0.5 bg-red-950/50 border border-red-900/40 text-red-500 uppercase">{tgt.nationality || 'UNKNOWN'}</span>
                          <span>{tgt.dob}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {!isLoading && targets.length > 0 && targets.length < total && (
              <button
                onClick={loadMore}
                className="w-full mt-3 py-2 bg-red-950/20 border border-red-900/30 text-[9px] font-bold tracking-widest text-red-500/70 hover:bg-red-500/10 hover:text-red-400 transition-all"
              >
                RETRIEVE MORE FILE BLOCKS
              </button>
            )}
          </div>
        </div>

        {/* Right pane: Target Dossier details */}
        {selectedTarget && (
          <div className="flex-1 flex flex-col bg-black/80 relative overflow-hidden border-l border-red-900/50">
            <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(transparent_50%,rgba(255,0,0,1)_50%)] bg-[length:100%_4px] mix-blend-overlay z-0"></div>

            {/* Dossier Header */}
            <div className="shrink-0 p-4 border-b border-red-900/30 bg-red-950/10 flex justify-between items-start z-10">
              <div>
                <button onClick={clearSelection} className="md:hidden flex items-center gap-1 mb-2 text-red-500/70 hover:text-red-400 text-[8px] font-bold uppercase">
                  <ChevronRight size={10} className="rotate-180" /> BACK TO TARGETS
                </button>
                <div className="flex items-center gap-1">
                  <ShieldAlert size={12} className="text-red-500 animate-pulse" />
                  <div className="text-[8px] text-red-500 font-bold tracking-widest uppercase">CLASSIFIED TARGET PROFILE // {selectedTarget.id}</div>
                </div>
                <div className="text-[13px] font-bold text-white tracking-wider uppercase mt-1">{selectedTarget.name}</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setTrackingActive(true);
                    addNotification(`ABIS BIO-LOCATORS LOCKED ON: ${selectedTarget.name}`, 'SUCCESS');
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 bg-red-900/30 border border-red-500/50 hover:bg-red-500/20 text-red-400 text-[8px] font-bold tracking-widest transition-colors uppercase"
                >
                  <Target size={10} /> TRACK LOCK
                </button>
                <button onClick={clearSelection} className="p-1 text-red-500/50 hover:text-red-500 hover:bg-red-950/50 transition-colors hidden md:block">
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* Dossier details body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 relative z-10 space-y-5">
              {isDetailsLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-red-500/40">
                  <Fingerprint size={24} className="animate-pulse" />
                  <span className="text-[8px] tracking-widest uppercase">DECRYPTING NATIONAL SECURITY DATABASE...</span>
                </div>
              ) : details ? (
                <div className="space-y-4">
                  {/* Portrait photo and essential stats */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="shrink-0 space-y-2">
                      <div className="w-36 h-44 border-2 border-red-900/50 bg-black/60 p-1 relative">
                        <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-red-500"></div>
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-red-500"></div>
                        <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-red-500"></div>
                        <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-red-500"></div>
                        {extraImages.length > 0 || selectedTarget.thumb ? (
                          <img
                            src={extraImages[activeImageIndex >= 0 ? activeImageIndex : 0] || selectedTarget.thumb}
                            alt="portrait"
                            className="w-full h-full object-cover grayscale opacity-90"
                            onError={(e) => { e.target.style.display = 'none'; }}
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-red-900/30"><User size={36} /></div>
                        )}
                      </div>
                      {extraImages.length > 1 && (
                        <div className="flex gap-1 overflow-x-auto w-36 py-1">
                          {extraImages.map((img, i) => (
                            <button
                              key={i}
                              onClick={() => setActiveImageIndex(i)}
                              className={`w-8 h-8 border shrink-0 ${activeImageIndex === i ? 'border-red-500' : 'border-red-950 hover:border-red-500/50'}`}
                            >
                              <img src={img} className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 grid grid-cols-2 gap-2 text-[9px]">
                      <div className="p-2 border border-red-900/30 bg-red-950/5">
                        <div className="text-[7px] text-red-500/50 font-bold">DATE OF BIRTH</div>
                        <div className="text-[9px] text-red-200 mt-0.5">{selectedTarget.dob}</div>
                      </div>
                      <div className="p-2 border border-red-900/30 bg-red-950/5">
                        <div className="text-[7px] text-red-500/50 font-bold">NATIONALITY</div>
                        <div className="text-[9px] text-red-200 mt-0.5">{selectedTarget.nationality}</div>
                      </div>
                      <div className="p-2 border border-red-900/30 bg-red-950/5 col-span-2">
                        <div className="text-[7px] text-red-500/50 font-bold">PLACE OF BIRTH</div>
                        <div className="text-[9px] text-red-200 mt-0.5">
                          {selectedTarget.source === 'FBI_WANTED' ? details.place_of_birth || 'UNKNOWN' : details.place_of_birth || 'UNKNOWN'}
                        </div>
                      </div>
                      {selectedTarget.source === 'FBI_WANTED' && (
                        <>
                          <div className="p-2 border border-red-900/30 bg-red-950/5">
                            <div className="text-[7px] text-red-500/50 font-bold">HAIR</div>
                            <div className="text-[9px] text-red-200 mt-0.5">{details.hair || 'UNKNOWN'}</div>
                          </div>
                          <div className="p-2 border border-red-900/30 bg-red-950/5">
                            <div className="text-[7px] text-red-500/50 font-bold">EYES</div>
                            <div className="text-[9px] text-red-200 mt-0.5">{details.eyes || 'UNKNOWN'}</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Charges/Warnings */}
                  <div className="border border-red-900/30 bg-red-950/5 p-3 space-y-2">
                    <div className="flex items-center justify-between border-b border-red-900/30 pb-1.5">
                      <div className="flex items-center gap-1">
                        <Scale size={11} className="text-red-500" />
                        <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest">WARRANT DETAILS / CHARGES</span>
                      </div>
                      {!aiTranslation && !isTranslating && (
                        <button
                          onClick={translateDossier}
                          className="text-[7px] font-bold px-2 py-0.5 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all uppercase"
                        >
                          DECRYPT INTEL REPORT
                        </button>
                      )}
                    </div>

                    <div className="text-[9px] leading-relaxed text-red-100 uppercase space-y-1">
                      {selectedTarget.source.startsWith('INTERPOL') ? (
                        details.arrest_warrants?.map((w, idx) => (
                          <div key={idx} className="pb-1 text-red-300">
                            • ISSUED BY {w.issuing_country_id || 'INTERPOL'}: {w.charge}
                          </div>
                        )) || <div>NO EXPLICIT PUBLIC CHARGES DISPLAYED</div>
                      ) : (
                        <div className="text-red-300 space-y-2">
                          {details.caution && <div><strong>CAUTION:</strong> {details.caution}</div>}
                          {details.description && <div><strong>SUMMARY:</strong> {details.description}</div>}
                          {details.remarks && <div><strong>REMARKS:</strong> {details.remarks}</div>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AI Analysis Dossier */}
                  {(aiTranslation || isTranslating) && (
                    <div className="border border-red-500/40 bg-red-950/15 p-3 relative overflow-hidden">
                      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(transparent_50%,rgba(255,0,0,1)_50%)] bg-[length:100%_4px] mix-blend-overlay z-0"></div>
                      <div className="text-[8px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5 relative z-10 mb-2">
                        <ShieldAlert size={11} className="text-red-500" /> TACTICAL DECRYPTION ASSISTANT {isTranslating && <Loader2 size={8} className="animate-spin" />}
                      </div>
                      <div className="text-[9px] text-red-100 leading-relaxed font-mono relative z-10 whitespace-pre-wrap uppercase">
                        {aiTranslation || 'ACCESSING NETWORK SEGMENTS...'}
                        {isTranslating && <span className="inline-block w-1 h-3 ml-1 bg-red-400 animate-pulse align-middle" />}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-4 text-[9px] text-red-500/40">DYNAMICS NOT ESTABLISHED</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalTargets;
