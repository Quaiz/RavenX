import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Tv, RefreshCw, Volume2, VolumeX, Globe, Radio, ChevronRight, Signal } from 'lucide-react';
import useTacticalStore from '../store';

// Dedicated country-specific live news channels — NEVER mixes or falls back to other countries
const COUNTRIES = [
  {
    id: 'usa',
    name: 'UNITED STATES',
    short: 'USA',
    channels: [
      { id: 'nbc', name: 'NBC NEWS NOW', query: 'NBC News NOW live' },
      { id: 'abc', name: 'ABC NEWS LIVE', query: 'ABC News Live' },
      { id: 'cbs', name: 'CBS NEWS 24/7', query: 'CBS News 24/7 live' },
      { id: 'fox', name: 'LIVENOW FOX', query: 'LiveNOW from FOX live' },
      { id: 'scripps', name: 'SCRIPPS NEWS', query: 'Scripps News live' },
      { id: 'ap', name: 'ASSOCIATED PRESS', query: 'Associated Press live' },
      { id: 'bloomberg', name: 'BLOOMBERG US', query: 'Bloomberg Television live' },
    ],
  },
  {
    id: 'uk',
    name: 'UNITED KINGDOM',
    short: 'UK',
    channels: [
      { id: 'sky', name: 'SKY NEWS UK', query: 'Sky News live' },
      { id: 'gbnews', name: 'GB NEWS', query: 'GB News live' },
      { id: 'talktv', name: 'TALKTV UK', query: 'TalkTV live' },
    ],
  },
  {
    id: 'vietnam',
    name: 'VIETNAM',
    short: 'VNM',
    channels: [
      { id: 'vtc', name: 'VTC NOW', query: 'VTC Now trực tiếp tin tức' },
      { id: 'antv', name: 'ANTV CAND', query: 'ANTV truyền hình công an nhân dân trực tiếp' },
      { id: 'vnews', name: 'VNEWS TTXVN', query: 'Truyền hình Thông tấn VNews trực tiếp' },
      { id: 'quochoi', name: 'TH QUỐC HỘI / VOV', query: 'VOV Live tin tức trực tiếp' },
    ],
  },
  {
    id: 'japan',
    name: 'JAPAN',
    short: 'JPN',
    channels: [
      { id: 'nhk', name: 'NHK WORLD-JAPAN', query: 'NHK World Japan live' },
      { id: 'ann', name: 'ANN NEWS JP', query: 'ANNnewsCH live' },
      { id: 'tbs', name: 'TBS NEWS DIG', query: 'TBS NEWS DIG live' },
      { id: 'fnn', name: 'FNNプライム', query: 'FNNプライムオンライン live' },
    ],
  },
  {
    id: 'korea',
    name: 'SOUTH KOREA',
    short: 'KOR',
    channels: [
      { id: 'ytn', name: 'YTN NEWS 24', query: 'YTN 24 실시간 뉴스 live' },
      { id: 'yonhap', name: 'YONHAP NEWS TV', query: '연합뉴스TV 실시간 live' },
      { id: 'arirang', name: 'ARIRANG TV', query: 'Arirang TV live' },
      { id: 'kbs', name: 'KBS WORLD', query: 'KBS World TV live' },
    ],
  },
  {
    id: 'france',
    name: 'FRANCE',
    short: 'FRA',
    channels: [
      { id: 'f24en', name: 'FRANCE 24 EN', query: 'France 24 English live' },
      { id: 'f24fr', name: 'FRANCE 24 FR', query: 'France 24 en direct' },
      { id: 'franceinfo', name: 'FRANCEINFO', query: 'franceinfo en direct' },
      { id: 'euronews', name: 'EURONEWS', query: 'euronews live' },
    ],
  },
  {
    id: 'germany',
    name: 'GERMANY',
    short: 'DEU',
    channels: [
      { id: 'dw', name: 'DW NEWS', query: 'DW News live' },
      { id: 'welt', name: 'WELT LIVE', query: 'WELT Nachrichtensender live' },
    ],
  },
  {
    id: 'singapore',
    name: 'SINGAPORE',
    short: 'SGP',
    channels: [
      { id: 'cna', name: 'CNA 24/7', query: 'CNA live news Singapore' },
    ],
  },
  {
    id: 'china',
    name: 'CHINA',
    short: 'CHN',
    channels: [
      { id: 'cgtn', name: 'CGTN LIVE', query: 'CGTN live' },
      { id: 'cctv', name: 'PHOENIX / CCTV', query: 'Phoenix TV live news' },
    ],
  },
  {
    id: 'india',
    name: 'INDIA',
    short: 'IND',
    channels: [
      { id: 'wion', name: 'WION LIVE', query: 'WION live' },
      { id: 'indiatoday', name: 'INDIA TODAY', query: 'India Today live' },
      { id: 'ndtv', name: 'NDTV 24X7', query: 'NDTV 24x7 live' },
    ],
  },
  {
    id: 'qatar',
    name: 'QATAR / MENA',
    short: 'QAT',
    channels: [
      { id: 'aje', name: 'AL JAZEERA EN', query: 'Al Jazeera English live' },
      { id: 'aja', name: 'AL JAZEERA AR', query: 'Al Jazeera Arabic live' },
    ],
  },
  {
    id: 'turkey',
    name: 'TURKEY',
    short: 'TUR',
    channels: [
      { id: 'trtworld', name: 'TRT WORLD', query: 'TRT World live' },
      { id: 'haberturk', name: 'HABERTÜRK TV', query: 'Habertürk TV canlı' },
      { id: 'ntv', name: 'NTV TÜRKIYE', query: 'NTV canlı yayın' },
    ],
  },
  {
    id: 'israel',
    name: 'ISRAEL',
    short: 'ISR',
    channels: [
      { id: 'i24', name: 'I24NEWS EN', query: 'i24NEWS English live' },
      { id: 'kan11', name: 'KAN 11 LIVE', query: 'כאן 11 שידור חי Kan 11 live' },
    ],
  },
  {
    id: 'canada',
    name: 'CANADA',
    short: 'CAN',
    channels: [
      { id: 'cbc', name: 'CBC NEWS', query: 'CBC News live' },
      { id: 'globalca', name: 'GLOBAL NEWS CA', query: 'Global News live Canada' },
    ],
  },
  {
    id: 'australia',
    name: 'AUSTRALIA',
    short: 'AUS',
    channels: [
      { id: 'abcau', name: 'ABC NEWS AU', query: 'ABC News Australia live' },
      { id: 'skyau', name: 'SKY NEWS AU', query: 'Sky News Australia live' },
    ],
  },
  {
    id: 'brazil',
    name: 'BRAZIL',
    short: 'BRA',
    channels: [
      { id: 'cnnbr', name: 'CNN BRASIL', query: 'CNN Brasil ao vivo' },
      { id: 'band', name: 'BAND JORNALISMO', query: 'Band Jornalismo ao vivo' },
    ],
  },
  {
    id: 'russia',
    name: 'RUSSIA / EURASIA',
    short: 'RUS',
    channels: [
      { id: 'currenttime', name: 'CURRENT TIME TV', query: 'Настоящее Время прямой эфир live' },
      { id: 'rtvi', name: 'RTVI NEWS', query: 'RTVI прямой эфир live' },
    ],
  },
  {
    id: 'africa',
    name: 'PAN-AFRICA',
    short: 'AFR',
    channels: [
      { id: 'africanews', name: 'AFRICANEWS', query: 'Africanews live' },
      { id: 'sabc', name: 'SABC NEWS ZA', query: 'SABC News live' },
      { id: 'channels', name: 'CHANNELS TV NG', query: 'Channels Television live' },
    ],
  },
];

// Map common globe country names to our country IDs
const COUNTRY_NAME_MAP = {
  'united states': 'usa',
  'united states of america': 'usa',
  'usa': 'usa',
  'united kingdom': 'uk',
  'uk': 'uk',
  'great britain': 'uk',
  'vietnam': 'vietnam',
  'viet nam': 'vietnam',
  'japan': 'japan',
  'south korea': 'korea',
  'korea': 'korea',
  'republic of korea': 'korea',
  'france': 'france',
  'germany': 'germany',
  'singapore': 'singapore',
  'china': 'china',
  'india': 'india',
  'qatar': 'qatar',
  'turkey': 'turkey',
  'türkiye': 'turkey',
  'israel': 'israel',
  'canada': 'canada',
  'australia': 'australia',
  'brazil': 'brazil',
  'russia': 'russia',
  'russian federation': 'russia',
  'south africa': 'africa',
  'nigeria': 'africa',
  'kenya': 'africa',
};

export default function GlobalNewsTV() {
  const { activeCountry } = useTacticalStore();

  const [selectedCountryId, setSelectedCountryId] = useState('usa');
  const [selectedChannelIdx, setSelectedChannelIdx] = useState(0);
  const [streams, setStreams] = useState([]);
  const [streamIndex, setStreamIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');

  // Client-side stream cache keyed by channel query for 0ms switching
  const streamCacheRef = useRef({});
  const abortRef = useRef(null);

  const selectedCountry = useMemo(
    () => COUNTRIES.find((c) => c.id === selectedCountryId) || COUNTRIES[0],
    [selectedCountryId]
  );

  const activeChannel = useMemo(
    () => selectedCountry.channels[selectedChannelIdx] || selectedCountry.channels[0],
    [selectedCountry, selectedChannelIdx]
  );

  // Sync with Global Map Click (activeCountry)
  useEffect(() => {
    if (!activeCountry) return;
    const norm = activeCountry.trim().toLowerCase();
    const mappedId = COUNTRY_NAME_MAP[norm];
    if (mappedId && mappedId !== selectedCountryId) {
      setSelectedCountryId(mappedId);
      setSelectedChannelIdx(0);
    }
  }, [activeCountry]);

  const fetchChannelStream = async (channel, forceRefresh = false) => {
    if (!channel) return;
    const cacheKey = channel.query;

    if (!forceRefresh && streamCacheRef.current[cacheKey]?.length > 0) {
      setStreams(streamCacheRef.current[cacheKey]);
      setStreamIndex(0);
      setIsLoading(false);
      return;
    }

    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/tv/search?query=${encodeURIComponent(channel.query)}${forceRefresh ? '&refresh=1' : ''}`,
        { signal: controller.signal }
      );
      const data = await res.json();
      const list =
        Array.isArray(data.streams) && data.streams.length > 0
          ? data.streams
          : Array.isArray(data.videoIds)
          ? data.videoIds.map((vid) => ({ videoId: vid, title: channel.name }))
          : [];

      if (list.length > 0) {
        streamCacheRef.current[cacheKey] = list;
      }
      setStreams(list);
      setStreamIndex(0);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('[GlobalNewsTV] Stream fetch error:', err);
        setStreams([]);
      }
    } finally {
      if (abortRef.current === controller) {
        setIsLoading(false);
      }
    }
  };

  // Fetch active channel and prefetch sibling channels of the selected country in background
  useEffect(() => {
    fetchChannelStream(activeChannel, false);

    // Prefetch remaining channels of this country after 250ms so clicking another channel is instant
    const timer = setTimeout(() => {
      selectedCountry.channels.forEach((ch, idx) => {
        if (idx === selectedChannelIdx) return;
        const key = ch.query;
        if (streamCacheRef.current[key]) return;
        fetch(`/api/tv/search?query=${encodeURIComponent(ch.query)}`)
          .then((r) => r.json())
          .then((d) => {
            const list =
              Array.isArray(d.streams) && d.streams.length > 0
                ? d.streams
                : Array.isArray(d.videoIds)
                ? d.videoIds.map((vid) => ({ videoId: vid, title: ch.name }))
                : [];
            if (list.length > 0) {
              streamCacheRef.current[key] = list;
            }
          })
          .catch(() => {});
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [selectedCountryId, selectedChannelIdx]);

  const handleSelectCountry = (countryId) => {
    if (countryId === selectedCountryId) return;
    setSelectedCountryId(countryId);
    setSelectedChannelIdx(0);
    setStreamIndex(0);
  };

  const handleNextBackupStream = () => {
    if (streams.length > 1) {
      setStreamIndex((prev) => (prev + 1) % streams.length);
    } else if (selectedCountry.channels.length > 1) {
      // Switch to next dedicated channel within the SAME country
      setSelectedChannelIdx((prev) => (prev + 1) % selectedCountry.channels.length);
    }
  };

  const currentStream = streams[streamIndex] || null;
  const currentVideoId = currentStream?.videoId || null;

  const filteredCountries = useMemo(() => {
    const q = searchFilter.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.short.toLowerCase().includes(q) ||
        c.channels.some((ch) => ch.name.toLowerCase().includes(q))
    );
  }, [searchFilter]);

  return (
    <div className="w-full h-full flex flex-col bg-[#060d08] font-mono text-xs select-none overflow-hidden text-[#d8f8e1]">
      {/* Sub-header Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#09150d] border-b border-[#39e75f]/25 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Tv className="w-3.5 h-3.5 text-[#39e75f] shrink-0" />
          <span className="font-bold tracking-widest text-[#39e75f] text-[10px] uppercase truncate">
            SATCOM TV // {selectedCountry.name}
          </span>
          <span className="text-[9px] text-[#39e75f]/70 border border-[#39e75f]/30 bg-[#39e75f]/10 px-1.5 py-0.5 uppercase tracking-wider shrink-0">
            {activeChannel?.name}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-1 bg-[#39e75f]/15 border border-[#39e75f]/40 px-1.5 py-0.5">
            <span className="w-1.5 h-1.5 bg-[#39e75f] animate-pulse" />
            <span className="text-[9px] text-[#39e75f] font-bold tracking-wider">LIVE</span>
          </div>

          {streams.length > 1 && (
            <button
              onClick={handleNextBackupStream}
              className="px-1.5 py-0.5 text-[9px] font-bold tracking-wider border border-[#39e75f]/30 bg-[#0d1f14] hover:bg-[#39e75f]/20 text-[#39e75f] transition-colors"
              title="Switch alternate stream feed for this channel"
            >
              FEED {streamIndex + 1}/{streams.length}
            </button>
          )}

          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-1 border transition-colors ${
              isMuted
                ? 'border-red-500/40 bg-red-950/30 text-red-400 hover:bg-red-900/40'
                : 'border-[#39e75f]/40 bg-[#39e75f]/15 text-[#39e75f] hover:bg-[#39e75f]/25'
            }`}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
          </button>

          <button
            onClick={() => fetchChannelStream(activeChannel, true)}
            className="p-1 border border-[#39e75f]/30 bg-[#0d1f14] hover:bg-[#39e75f]/20 text-[#39e75f] transition-colors"
            title="Force Refresh Channel Feed"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Country-Specific Dedicated Channel Bar */}
      <div className="flex items-center gap-1 px-2.5 py-1.5 bg-[#07110b] border-b border-[#39e75f]/20 overflow-x-auto custom-scrollbar shrink-0">
        <span className="text-[9px] text-[#39e75f]/60 uppercase tracking-widest mr-1 shrink-0 flex items-center gap-1">
          <Radio className="w-2.5 h-2.5 text-[#39e75f]" /> CHANNELS ({selectedCountry.short}):
        </span>
        {selectedCountry.channels.map((ch, idx) => {
          const isActive = idx === selectedChannelIdx;
          return (
            <button
              key={ch.id}
              onClick={() => {
                setSelectedChannelIdx(idx);
                setStreamIndex(0);
              }}
              className={`px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase transition-all shrink-0 border ${
                isActive
                  ? 'bg-[#39e75f] text-[#041007] border-[#39e75f] shadow-[0_0_8px_rgba(57,231,95,0.4)]'
                  : 'bg-[#0b1910] text-[#8bc99a] border-[#39e75f]/25 hover:border-[#39e75f]/60 hover:text-[#d8f8e1]'
              }`}
            >
              {ch.name}
            </button>
          );
        })}
      </div>

      {/* Main Layout: Left Country Selector + Right Video Feed */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Country List */}
        <div className="w-1/3 max-w-[165px] bg-[#07110a] border-r border-[#39e75f]/20 flex flex-col z-10">
          <div className="p-1.5 border-b border-[#39e75f]/20 bg-[#09160d]">
            <div className="text-[8px] font-bold text-[#39e75f]/80 tracking-widest mb-1 px-0.5 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Globe className="w-2.5 h-2.5 text-[#39e75f]" /> REGION
              </span>
              <span>{COUNTRIES.length} NATIONS</span>
            </div>
            <input
              type="text"
              placeholder="FILTER NATION..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-[#040a06] border border-[#39e75f]/30 px-1.5 py-0.5 text-[9px] text-[#d8f8e1] placeholder-[#39e75f]/40 focus:outline-none focus:border-[#39e75f]"
            />
          </div>

          <div className="overflow-y-auto custom-scrollbar flex-1 p-1 space-y-0.5">
            {filteredCountries.map((c) => {
              const isSelected = selectedCountryId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => handleSelectCountry(c.id)}
                  className={`w-full text-left px-2 py-1.5 text-[9px] font-bold tracking-wider transition-all flex items-center justify-between border ${
                    isSelected
                      ? 'bg-[#39e75f]/20 text-[#39e75f] border-[#39e75f]/60 shadow-[inset_2px_0_0_#39e75f]'
                      : 'text-[#8bc99a] border-transparent hover:bg-[#39e75f]/10 hover:text-[#d8f8e1]'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  <span className="text-[8px] opacity-70 ml-1 shrink-0">
                    {c.channels.length}CH
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Video Player */}
        <div className="flex-1 relative bg-black flex flex-col justify-center overflow-hidden">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050b07] z-20">
              <div className="w-7 h-7 border-2 border-[#39e75f] border-t-transparent rounded-full animate-spin mb-2" />
              <div className="text-[10px] text-[#39e75f] tracking-widest uppercase animate-pulse">
                LOCKING TRANSPONDER: {activeChannel?.name}...
              </div>
              <div className="text-[9px] text-[#39e75f]/60 mt-1">
                REGION: {selectedCountry.name}
              </div>
            </div>
          ) : currentVideoId ? (
            <div className="relative w-full h-full">
              <iframe
                key={`${currentVideoId}-${isMuted}`}
                className="w-full h-full border-0"
                src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1&mute=${
                  isMuted ? 1 : 0
                }&controls=1&modestbranding=1&rel=0&playsinline=1`}
                title={activeChannel?.name || 'Live News TV'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />

              {/* Top-left HUD tag */}
              <div className="absolute top-2 left-2 pointer-events-none z-20 flex items-center gap-1.5 bg-[#050c07]/85 border border-[#39e75f]/40 px-2 py-0.5 backdrop-blur-sm">
                <Signal className="w-3 h-3 text-[#39e75f]" />
                <span className="text-[9px] font-bold text-[#39e75f] tracking-wider uppercase">
                  {selectedCountry.short} // {activeChannel?.name}
                </span>
                {currentStream?.title && (
                  <span className="text-[9px] text-[#d8f8e1]/70 truncate max-w-[180px] hidden sm:inline">
                    — {currentStream.title}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-[#39e75f]/70 p-4 text-center">
              <Tv className="w-8 h-8 mb-2 opacity-40" />
              <span className="text-[10px] font-bold tracking-widest uppercase">
                NO ACTIVE LIVE STREAM FOR {activeChannel?.name}
              </span>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => fetchChannelStream(activeChannel, true)}
                  className="px-2.5 py-1 bg-[#39e75f]/20 border border-[#39e75f]/50 text-[#39e75f] text-[9px] font-bold tracking-wider uppercase hover:bg-[#39e75f]/30"
                >
                  RETRY UPLINK
                </button>
                {selectedCountry.channels.length > 1 && (
                  <button
                    onClick={handleNextBackupStream}
                    className="px-2.5 py-1 bg-[#0b1910] border border-[#39e75f]/30 text-[#d8f8e1] text-[9px] font-bold tracking-wider uppercase hover:border-[#39e75f]"
                  >
                    NEXT {selectedCountry.short} CHANNEL <ChevronRight className="w-3 h-3 inline" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
