import React, { useState, useEffect, useRef } from 'react';
import { Search, AlertTriangle, User, Globe, MapPin, Loader2, Fingerprint, ShieldAlert, ChevronRight, Scale, X, Target, Radio, Activity, Laptop, Shield } from 'lucide-react';
import useStore from '../store';
import { streamAiResponse } from '../aiManager';

const renderSafe = (val) => {
  if (!val) return '';
  if (Array.isArray(val)) return val.map(v => typeof v === 'object' ? JSON.stringify(v) : v).join(', ');
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
};

const forceHttps = (url) => {
  if (!url) return '';
  if (typeof url !== 'string') return url;
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  return url;
};

const COUNTRY_MAP = {
  'RUSSIA': 'RU', 'RUSSIAN FEDERATION': 'RU',
  'USA': 'US', 'UNITED STATES': 'US', 'AMERICA': 'US',
  'CHINA': 'CN', 'PRC': 'CN',
  'IRAN': 'IR',
  'NORTH KOREA': 'KP', 'DPRK': 'KP',
  'VIETNAM': 'VN', 'VIET NAM': 'VN',
  'INDIA': 'IN',
  'PAKISTAN': 'PK',
  'SYRIA': 'SY',
  'IRAQ': 'IQ',
  'AFGHANISTAN': 'AF',
  'UKRAINE': 'UA',
  'ISRAEL': 'IL',
  'PALESTINE': 'PS',
  'YEMEN': 'YE',
  'MEXICO': 'MX',
  'COLOMBIA': 'CO',
  'BRAZIL': 'BR',
  'VENEZUELA': 'VE',
  'FRANCE': 'FR',
  'UK': 'GB', 'UNITED KINGDOM': 'GB', 'ENGLAND': 'GB',
  'GERMANY': 'DE',
  'ITALY': 'IT',
  'SPAIN': 'ES',
  'JAPAN': 'JP',
  'SOUTH KOREA': 'KR', 'KOREA': 'KR',
  'TURKEY': 'TR', 'TURKIYE': 'TR',
  'SAUDI ARABIA': 'SA',
  'UAE': 'AE', 'UNITED ARAB EMIRATES': 'AE',
  'EGYPT': 'EG',
  'SOUTH AFRICA': 'ZA',
  'NIGERIA': 'NG',
  'KENYA': 'KE',
  'SOMALIA': 'SO',
  'SUDAN': 'SD',
  'MYANMAR': 'MM', 'BURMA': 'MM',
  'THAILAND': 'TH',
  'PHILIPPINES': 'PH',
  'INDONESIA': 'ID',
  'MALAYSIA': 'MY',
  'AUSTRALIA': 'AU',
  'CANADA': 'CA',
  'ARGENTINA': 'AR',
  'PERU': 'PE',
  'CHILE': 'CL',
  'CUBA': 'CU',
  'BELARUS': 'BY',
  'SERBIA': 'RS',
  'TAIWAN': 'TW',
  'URUGUAY': 'UY',
  'POLAND': 'PL',
  'ROMANIA': 'RO',
  'HUNGARY': 'HU',
  'GREECE': 'GR',
  'NETHERLANDS': 'NL',
  'BELGIUM': 'BE',
  'SWEDEN': 'SE',
  'NORWAY': 'NO',
  'FINLAND': 'FI',
  'DENMARK': 'DK',
  'SWITZERLAND': 'CH',
  'AUSTRIA': 'AT'
};

const HAIR_COLORS = {
  'BLA': 'BLACK', 'BRO': 'BROWN', 'GRE': 'GREY/GRAY', 'RED': 'RED', 'BLO': 'BLONDE', 'BAL': 'BALD', 'WHI': 'WHITE'
};

const EYE_COLORS = {
  'BLA': 'BLACK', 'BRO': 'BROWN', 'GRE': 'GREEN', 'BLU': 'BLUE', 'HAZ': 'HAZEL', 'GRY': 'GREY/GRAY'
};

const mapTraits = (arr, mapObj) => {
  if (!arr || !Array.isArray(arr)) return null;
  return arr.map(code => mapObj[code] || code).join(', ');
};

const APT_ACTORS = [
  {
    entity_id: "APT-LAZARUS",
    name: "LAZARUS GROUP",
    origin: "KP",
    originFullName: "NORTH KOREA",
    agency: "RGB (RECONNAISSANCE GENERAL BUREAU)",
    threatLevel: "CRITICAL",
    aliases: "GUARDIANS OF PEACE, WHOIS TEAM, APT38, HIDDEN COBRA",
    sectors: "FINANCIAL, CRYPTOCURRENCY, DEFENSE, MEDIA, AEROSPACE",
    tools: "WANNACRY, HERMIT, APPLEJEUS, VOLGMER, FALLCHILL",
    profile: "STATE-SPONSORED CYBERCRIME AND ESPIONAGE SYNDICATE OPERATING UNDER NORTH KOREAN INTELLIGENCE. RESPONSIBLE FOR THE 2014 SONY PICTURES HACK, THE 2016 BANGLADESH BANK HEIST, AND MASSIVE CRYPTOCURRENCY THEFT OPERATIONS GLOBALLY.",
    activeSince: "2009",
    tactics: "SPEAR-PHISHING, WATERING HOLES, CUSTOM MALWARE, DOUBLE EXTORTION, CRYPTO-JACKING"
  },
  {
    entity_id: "APT-SANDWORM",
    name: "SANDWORM",
    origin: "RU",
    originFullName: "RUSSIAN FEDERATION",
    agency: "GRU (MAIN INTELLIGENCE DIRECTORATE - UNIT 74455)",
    threatLevel: "CRITICAL",
    aliases: "TELEBOTS, VOODOO BEAR, IRON VIKING, ELECTRUM",
    sectors: "ENERGY GRID, GOVERNMENT, TRANSPORTATION, MARITIME, TELECOM",
    tools: "BLACKENERGY, INDUSTROYER (CRASHOVERRIDE), NOTPETYA, OLYMPIC DESTROYER, CADDYWIPER",
    profile: "A HIGHLY AGGRESSIVE CYBER WARFARE UNIT OF RUSSIA'S MILITARY INTELLIGENCE. KNOWN FOR EXECUTING DESTRUCTIVE CYBERATTACKS, INCLUDING SHUTTING DOWN PARTS OF THE UKRAINIAN POWER GRID AND DEPLOYING NOTPETYA, THE MOST DAMAGING CYBERATTACK IN HISTORY.",
    activeSince: "2007",
    tactics: "ICS/SCADA HACKING, WIPER MALWARE DEPLOYMENT, SUPPLY-CHAIN COMPROMISE, ACTIVE SABOTAGE"
  },
  {
    entity_id: "APT-FANCYBEAR",
    name: "FANCY BEAR",
    origin: "RU",
    originFullName: "RUSSIAN FEDERATION",
    agency: "GRU (MAIN INTELLIGENCE DIRECTORATE - UNIT 26165)",
    threatLevel: "CRITICAL",
    aliases: "APT28, SOFACY, PAWN STORM, STRONTIUM, FOREST BLIZZARD",
    sectors: "DEFENSE, GOVERNMENT, POLITICAL ORGANIZATIONS, AEROSPACE, MEDIA",
    tools: "X-AGENT, CHOPSTICK, SOURFACE, JHUGO, GAMEFISH",
    profile: "A CYBER ESPIONAGE GROUP ASSOCIATED WITH RUSSIAN MILITARY INTELLIGENCE. SPECIALIZES IN POLITICAL INFLUENCE AND STRATEGIC INTELLIGENCE GATHERING, FAMOUSLY RESPONSIBLE FOR BREACHING THE DEMOCRATIC NATIONAL COMMITTEE (DNC) IN 2016.",
    activeSince: "2004",
    tactics: "CREDENTIAL HARVESTING, ZERO-DAY EXPLOITS, SPEAR-PHISHING CAMPAIGNS, HACK-AND-LEAK OPERATIONS"
  },
  {
    entity_id: "APT-COZYBEAR",
    name: "COZY BEAR",
    origin: "RU",
    originFullName: "RUSSIAN FEDERATION",
    agency: "SVR (FOREIGN INTELLIGENCE SERVICE)",
    threatLevel: "CRITICAL",
    aliases: "APT29, NOBELIUM, MIDNIGHT BLIZZARD, COZYDUKE, COZYCAR",
    sectors: "DIPLOMATIC ENTITIES, GOVERNMENT, CLOUD SERVICES, THINK TANKS",
    tools: "SOLORIGATE (SOLARWINDS BACKDOOR), WELLMESS, DUKE MALWARE, ENVYSCOUT",
    profile: "AN ELITE CYBER ESPIONAGE GROUP LINKED TO RUSSIAN FOREIGN INTELLIGENCE. INFAMOUS FOR THE HIGHLY SOPHISTICATED SOLARWINDS SUPPLY CHAIN ATTACK OF 2020 AND TARGETING DIPLOMATIC INSTITUTIONS GLOBALLY.",
    activeSince: "2008",
    tactics: "SUPPLY-CHAIN INFILTRATION, HIGHLY TAILORED SPEAR-PHISHING, CLOUD ENVIRONMENT EXPLOITATION"
  },
  {
    entity_id: "APT-41",
    name: "APT41",
    origin: "CN",
    originFullName: "CHINA",
    agency: "MSS (MINISTRY OF STATE SECURITY - CHENGDU GROUP)",
    threatLevel: "CRITICAL",
    aliases: "DOUBLE DRAGON, BARIUM, WICKED PANDA, BRASS TYPHOON",
    sectors: "HEALTHCARE, TELECOMMUNICATIONS, SOFTWARE SUPPLY CHAIN, HIGH-TECH, GAMING",
    tools: "COBALT STRIKE, SHADOWPAD, WINNTI, CROSSBOW, HIGH-ROLL",
    profile: "A STATE-SPONSORED GROUP BASED IN CHENGDU, CHINA. EXCEPTIONALLY ACTIVE AND SKILLED IN BOTH CYBER ESPIONAGE TARGETING CORPORATE/NATIONAL IP AND FINANCIALLY MOTIVATED ACTIVITIES SUCH AS RANSOMWARE AND VIRTUAL CURRENCY THEFT.",
    activeSince: "2012",
    tactics: "SOFTWARE SUPPLY-CHAIN COMPROMISE, CODE-SIGNING CERTIFICATE THEFT, CUSTOM BACKDOORS"
  },
  {
    entity_id: "APT-31",
    name: "APT31",
    origin: "CN",
    originFullName: "CHINA",
    agency: "MSS (MINISTRY OF STATE SECURITY)",
    threatLevel: "HIGH",
    aliases: "JUDGMENT PANDA, ZIRCONIUM, VIOLET TYPHOON",
    sectors: "GOVERNMENT, CRITICAL INFRASTRUCTURE, POLITICS, INTELLECTUAL PROPERTY",
    tools: "RAWSOCKS, PAKDOOR, DROPBOX-BASED C2 TOOLS",
    profile: "A CHINESE STATE-SPONSORED CYBER ESPIONAGE GROUP TARGETING GOVERNMENT OFFICIALS, POLITICAL CANDIDATES, AND STRATEGIC BUSINESSES TO GATHER GEOPOLITICAL INTELLIGENCE AND COMMERCIAL TRADE SECRETS.",
    activeSince: "2010",
    tactics: "SOHO ROUTER HIJACKING, MALICIOUS EMAIL ATTACHMENTS, STEALTH COMMAND-AND-CONTROL"
  },
  {
    entity_id: "APT-MUDDYWATER",
    name: "MUDDYWATER",
    origin: "IR",
    originFullName: "IRAN",
    agency: "MOIS (MINISTRY OF INTELLIGENCE AND SECURITY)",
    threatLevel: "HIGH",
    aliases: "TEMP.ZAGROS, STATIC KITTEN, SEEDWORM, MANGO SANDSTORM",
    sectors: "TELECOMMUNICATIONS, DEFENSE, OIL & GAS, GOVERNMENT IN MIDDLE EAST",
    tools: "MUDDYC3, POWGOOP, LIGOLO, POWERSTATS",
    profile: "AN IRANIAN CYBER ESPIONAGE GROUP OPERATING ON BEHALF OF THE MINISTRY OF INTELLIGENCE. PRIMARILY TARGETS COMMUNICATION INFRASTRUCTURE AND GOVERNMENT ENTITIES IN THE MIDDLE EAST, US, AND EUROPE.",
    activeSince: "2017",
    tactics: "MACRO-ENABLED OFFICE DOCUMENTS, LEGITIMATE REMOTE ADMINISTRATION TOOLS USAGE, CREDENTIAL DUMPING"
  },
  {
    entity_id: "APT-CHARMINGKITTEN",
    name: "CHARMING KITTEN",
    origin: "IR",
    originFullName: "IRAN",
    agency: "IRGC (ISLAMIC REVOLUTIONARY GUARD CORPS)",
    threatLevel: "HIGH",
    aliases: "APT35, PHOSPHORUS, MINT SANDSTORM, YELLOW LIKO",
    sectors: "JOURNALISTS, ACTIVISTS, DISSIDENTS, DEFENSE, GEOPOLITICAL ANALYSTS",
    tools: "HYPERSCRAPE, BELLACIAO, POWERLESS, CHARMPOWER",
    profile: "A CYBER ESPIONAGE OPERATIONS UNIT LINKED TO THE IRGC. FOCUSES ON PROFILING, CREDENTIAL THEFT, AND MONITORING OF POLITICAL FIGURES, ACADEMICS, HUMAN RIGHTS GROUPS, AND IRANIAN DISSIDENTS.",
    activeSince: "2011",
    tactics: "MULTI-CHANNEL SOCIAL ENGINEERING, FAKE PERSONAS, SMS 2FA INTERCEPTION, SPEAR-PHISHING"
  },
  {
    entity_id: "APT-KIMSUKY",
    name: "KIMSUKY",
    origin: "KP",
    originFullName: "NORTH KOREA",
    agency: "RGB (RECONNAISSANCE GENERAL BUREAU - UNIT 325)",
    threatLevel: "HIGH",
    aliases: "VELVET CHOLLIMA, APT43, BLACK BANSHEE, EMERALD SLEET",
    sectors: "GOVERNMENT, THINK TANKS, NUCLEAR RESEARCH, SOUTH KOREAN INFRASTRUCTURE",
    tools: "BABYSHARK, GOLDBACKDOOR, APPLESEED, KGH SPY",
    profile: "AN ACTIVE CYBER ESPIONAGE GROUP TASKED WITH INTELLIGENCE GATHERING RELATED TO FOREIGN POLICY, MILITARY STRATEGIES, AND NUCLEAR TECHNOLOGY. PRIMARILY TARGETS SOUTH KOREA, JAPAN, AND THE UNITED STATES.",
    activeSince: "2012",
    tactics: "SPEAR-PHISHING WITH POLICY BRIEFS, BROWSER EXTENSION HACKING, MALWARE DISGUISED AS DOCUMENT FILES"
  },
  {
    entity_id: "APT-39",
    name: "APT39",
    origin: "IR",
    originFullName: "IRAN",
    agency: "MOIS (MINISTRY OF INTELLIGENCE AND SECURITY / RANA)",
    threatLevel: "HIGH",
    aliases: "CHAFER, ITG07, GRAY KITTEN",
    sectors: "TELECOMMUNICATIONS, TRAVEL INDUSTRIES, IT PROVIDERS, PERSONAL REGISTRIES",
    tools: "REMEXI, ASPXSPY, MIMIKATZ CUSTOMIZATION",
    profile: "AN IRANIAN STATE-SPONSORED GROUP FOCUSED ON GATHERING PERSONAL TRACKING DATA, TRAVEL LOGS, AND CUSTOM DATABASES TO MONITOR INDIVIDUALS OF INTEREST AND DISSIDENTS.",
    activeSince: "2014",
    tactics: "WEB SHELL DEPLOYMENT, SQL INJECTION, PERSISTENCE IN TELECOMMUNICATION BACKBONES"
  }
];

const getTheme = (activeTab, noticeType) => {
  if (activeTab === 'APT') {
    return {
      baseBg: 'bg-[#000503]',
      baseThemeColor: 'emerald',
      borderCard: 'border-emerald-900/30',
      borderCardHover: 'hover:border-emerald-500/50',
      borderCardActive: 'border-emerald-500 bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
      borderCardHeavy: 'border-emerald-900/50',
      bgCardHover: 'hover:bg-emerald-950/10',
      bgCardActive: 'bg-emerald-900/20',
      textAccent: 'text-emerald-400',
      textAccentMuted: 'text-emerald-500/50',
      textAccentLight: 'text-emerald-50',
      bgHeader: 'bg-emerald-950/30',
      borderHeader: 'border-emerald-900/50',
      loader: 'text-emerald-400',
      shadow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
      glowColor: '#10b981',
      title: 'CYBER THREAT ACTORS',
      subTitle: 'STATE-SPONSORED APT & ESPIONAGE DATABASE',
      headerIcon: Laptop
    };
  }

  if (noticeType === 'yellow') {
    return {
      baseBg: 'bg-[#050500]',
      baseThemeColor: 'yellow',
      borderCard: 'border-yellow-900/30',
      borderCardHover: 'hover:border-yellow-500/50',
      borderCardActive: 'border-yellow-500 bg-yellow-950/20 shadow-[0_0_15px_rgba(234,179,8,0.15)]',
      borderCardHeavy: 'border-yellow-900/50',
      bgCardHover: 'hover:bg-yellow-950/10',
      bgCardActive: 'bg-yellow-900/20',
      textAccent: 'text-yellow-400',
      textAccentMuted: 'text-yellow-500/50',
      textAccentLight: 'text-yellow-50',
      bgHeader: 'bg-yellow-950/30',
      borderHeader: 'border-yellow-900/50',
      loader: 'text-yellow-400',
      shadow: 'shadow-[0_0_20px_rgba(234,179,8,0.15)]',
      glowColor: '#eab308',
      title: 'INTERPOL YELLOW NOTICES',
      subTitle: 'GLOBAL MISSING PERSONS REGISTRY',
      headerIcon: Globe
    };
  }

  if (noticeType === 'un') {
    return {
      baseBg: 'bg-[#000408]',
      baseThemeColor: 'cyan',
      borderCard: 'border-cyan-900/30',
      borderCardHover: 'hover:border-cyan-500/50',
      borderCardActive: 'border-cyan-500 bg-cyan-950/20 shadow-[0_0_15px_rgba(34,211,238,0.15)]',
      borderCardHeavy: 'border-cyan-900/50',
      bgCardHover: 'hover:bg-cyan-950/10',
      bgCardActive: 'bg-cyan-900/20',
      textAccent: 'text-cyan-400',
      textAccentMuted: 'text-cyan-500/50',
      textAccentLight: 'text-cyan-50',
      bgHeader: 'bg-cyan-950/30',
      borderHeader: 'border-cyan-900/50',
      loader: 'text-cyan-400',
      shadow: 'shadow-[0_0_20px_rgba(34,211,238,0.15)]',
      glowColor: '#22d3ee',
      title: 'UN SECURITY COUNCIL SANCTIONS',
      subTitle: 'CONSOLIDATED SPECIAL NOTICE LIST',
      headerIcon: Scale
    };
  }

  // Default: red notices
  return {
    baseBg: 'bg-[#0a0000]',
    baseThemeColor: 'red',
    borderCard: 'border-red-900/30',
    borderCardHover: 'hover:border-red-500/50',
    borderCardActive: 'border-red-500 bg-red-900/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]',
    borderCardHeavy: 'border-red-900/50',
    bgCardHover: 'hover:bg-red-950/10',
    bgCardActive: 'bg-red-900/20',
    textAccent: 'text-red-500',
    textAccentMuted: 'text-red-500/50',
    textAccentLight: 'text-red-50',
    bgHeader: 'bg-red-950/20',
    borderHeader: 'border-red-900/50',
    loader: 'text-red-500',
    shadow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]',
    glowColor: '#ef4444',
    title: 'INTERPOL RED NOTICES',
    subTitle: 'GLOBAL WANTED PERSONS REGISTRY',
    headerIcon: AlertTriangle
  };
};

const WantedCriminals = () => {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('raven_wanted_tab') || 'NOTICES');
  const [noticeType, setNoticeType] = useState(() => localStorage.getItem('raven_wanted_notice_type') || 'red'); // 'red', 'yellow', 'un'
  const [query, setQuery] = useState(() => localStorage.getItem('raven_wanted_query') || '');
  
  const [suspects, setSuspects] = useState(() => {
    const saved = localStorage.getItem('raven_wanted_list');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedSuspect, setSelectedSuspect] = useState(() => {
    const saved = localStorage.getItem('raven_wanted_selected');
    return saved ? JSON.parse(saved) : null;
  });
  const [suspectDetails, setSuspectDetails] = useState(() => {
    const saved = localStorage.getItem('raven_wanted_details');
    return saved ? JSON.parse(saved) : null;
  });
  const [suspectImages, setSuspectImages] = useState(() => {
    const saved = localStorage.getItem('raven_wanted_images');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [activeImageIndex, setActiveImageIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  const activeOperationId = useStore(state => state.activeOperationId);
  const addNodeToOperation = useStore(state => state.addNodeToOperation);
  const addNotification = useStore(state => state.addNotification);
  const setSelectedTarget = useStore(state => state.setSelectedTarget);
  const setTrackingActive = useStore(state => state.setTrackingActive);

  const [aiTranslation, setAiTranslation] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const abortRef = useRef(null);
  
  const [total, setTotal] = useState(() => {
    const saved = localStorage.getItem('raven_wanted_total');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [page, setPage] = useState(() => {
    const saved = localStorage.getItem('raven_wanted_page');
    return saved ? parseInt(saved, 10) : 1;
  });

  const theme = getTheme(activeTab, noticeType);

  // Persist state
  useEffect(() => {
    localStorage.setItem('raven_wanted_tab', activeTab);
    localStorage.setItem('raven_wanted_notice_type', noticeType);
    localStorage.setItem('raven_wanted_query', query);
    localStorage.setItem('raven_wanted_list', JSON.stringify(suspects));
    localStorage.setItem('raven_wanted_total', total.toString());
    localStorage.setItem('raven_wanted_page', page.toString());
    if (selectedSuspect) localStorage.setItem('raven_wanted_selected', JSON.stringify(selectedSuspect));
    else localStorage.removeItem('raven_wanted_selected');
    if (suspectDetails) localStorage.setItem('raven_wanted_details', JSON.stringify(suspectDetails));
    else localStorage.removeItem('raven_wanted_details');
    if (suspectImages) localStorage.setItem('raven_wanted_images', JSON.stringify(suspectImages));
    else localStorage.removeItem('raven_wanted_images');
  }, [activeTab, noticeType, query, suspects, selectedSuspect, suspectDetails, suspectImages]);

  const searchInterpol = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    try {
      let url = `https://ws-public.interpol.int/notices/v1/${noticeType}?resultPerPage=50`;
      const trimmedQuery = query.trim().toUpperCase();
      
      if (trimmedQuery) {
        if (COUNTRY_MAP[trimmedQuery]) {
          url += `&nationality=${COUNTRY_MAP[trimmedQuery]}`;
        } else if (trimmedQuery.length === 2) {
          url += `&nationality=${trimmedQuery}`;
        } else {
          url += `&name=${encodeURIComponent(query.trim())}`;
        }
      }
      
      const res = await fetch(url, { referrerPolicy: 'no-referrer' });
      const data = await res.json();
      
      if (data && data._embedded && data._embedded.notices) {
        setSuspects(data._embedded.notices);
        setTotal(data.total);
        setPage(1);
      } else {
        setSuspects([]);
        setTotal(0);
        setPage(1);
      }
    } catch (err) {
      console.error("Interpol API Error:", err);
      setSuspects([]);
      setTotal(0);
      setPage(1);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    if (suspects.length >= total || isLoading) return;
    setIsLoading(true);
    try {
      const nextPage = page + 1;
      let url = `https://ws-public.interpol.int/notices/v1/${noticeType}?resultPerPage=50&page=${nextPage}`;
      const trimmedQuery = query.trim().toUpperCase();
      
      if (trimmedQuery) {
        if (COUNTRY_MAP[trimmedQuery]) {
          url += `&nationality=${COUNTRY_MAP[trimmedQuery]}`;
        } else if (trimmedQuery.length === 2) {
          url += `&nationality=${trimmedQuery}`;
        } else {
          url += `&name=${encodeURIComponent(query.trim())}`;
        }
      }
      
      const res = await fetch(url, { referrerPolicy: 'no-referrer' });
      const data = await res.json();
      
      if (data && data._embedded && data._embedded.notices) {
        setSuspects(prev => {
          const newNotices = data._embedded.notices.filter(
            notice => !prev.some(p => p.entity_id === notice.entity_id)
          );
          return [...prev, ...newNotices];
        });
        setPage(nextPage);
      }
    } catch (err) {
      console.error("Interpol API Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch / local load
  useEffect(() => {
    if (activeTab === 'NOTICES' && suspects.length === 0) {
      searchInterpol();
    }
  }, [noticeType, activeTab]);

  const fetchDetails = async (suspect) => {
    setSelectedSuspect(suspect);
    setSuspectDetails(null);
    setSuspectImages([]);
    setActiveImageIndex(-1);
    setAiTranslation('');
    setIsTranslating(false);
    if (abortRef.current) abortRef.current.abort();

    if (activeTab === 'APT') {
      setSuspectDetails(suspect);
      setSelectedTarget({
        id: suspect.entity_id,
        name: suspect.name,
        nationality: suspect.origin,
        birthDate: 'N/A',
        placeOfBirth: 'N/A',
        sex: 'N/A',
        charge: `STATE-SPONSORED CYBER APT // THREAT: ${suspect.threatLevel}`,
        thumb: null
      });
      return;
    }

    setIsDetailsLoading(true);
    setSelectedTarget({
      id: suspect.entity_id,
      name: `${suspect.forename || ''} ${suspect.name || ''}`.trim(),
      nationality: suspect.nationalities?.[0] || 'UNKNOWN',
      birthDate: suspect.date_of_birth || 'UNKNOWN',
      placeOfBirth: suspect.place_of_birth || 'UNKNOWN',
      sex: suspect.sex_id || 'UNKNOWN',
      charge: noticeType === 'yellow' ? 'MISSING PERSON ALERT' : noticeType === 'un' ? 'UN SANCTIONS LIST' : 'WANTED BY INTERPOL',
      thumb: forceHttps(suspect._links?.thumbnail?.href)
    });

    try {
      const fetchUrl = forceHttps(suspect._links?.self?.href || `https://ws-public.interpol.int/notices/v1/${noticeType}/${suspect.entity_id.replace('/', '-')}`);
      const res = await fetch(fetchUrl, { referrerPolicy: 'no-referrer' });
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      const data = await res.json();
      setSuspectDetails(data);
      setSelectedTarget({
        id: suspect.entity_id,
        name: `${suspect.forename || ''} ${suspect.name || ''}`.trim(),
        nationality: suspect.nationalities?.[0] || 'UNKNOWN',
        birthDate: suspect.date_of_birth || 'UNKNOWN',
        placeOfBirth: suspect.place_of_birth || 'UNKNOWN',
        sex: suspect.sex_id || 'UNKNOWN',
        charge: data.arrest_warrants?.[0]?.charge || (noticeType === 'yellow' ? 'MISSING PERSON ALERT' : noticeType === 'un' ? 'UN SANCTIONS LIST' : 'WANTED BY INTERPOL'),
        thumb: forceHttps(suspect._links?.thumbnail?.href)
      });
      
      if (data._links && data._links.images) {
        try {
          const imgRes = await fetch(forceHttps(data._links.images.href), { referrerPolicy: 'no-referrer' });
          const imgData = await imgRes.json();
          if (imgData && imgData._embedded && imgData._embedded.images) {
            setSuspectImages(imgData._embedded.images);
          }
        } catch (imgErr) {
          console.error("Failed to fetch suspect images:", imgErr);
        }
      }
    } catch (err) {
      console.error("Failed to fetch suspect details:", err);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const translateDossier = async () => {
    if (!suspectDetails) return;
    
    setAiTranslation('');
    setIsTranslating(true);

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    
    let prompt = '';
    if (activeTab === 'APT') {
      prompt = `You are RAVEN, an elite tactical intelligence AI.
The user is requesting an in-depth geopolitical threat briefing on the Cyber Threat Actor: ${selectedSuspect.name}.
Origin Country: ${selectedSuspect.originFullName}
Associated Intelligence Agency: ${selectedSuspect.agency}
Threat Level: ${selectedSuspect.threatLevel}
Aliases: ${selectedSuspect.aliases}
Targeted Sectors: ${selectedSuspect.sectors}
Signature Malware/Tools: ${selectedSuspect.tools}
General Profile: ${selectedSuspect.profile}
Active Since: ${selectedSuspect.activeSince}
Primary Tactics: ${selectedSuspect.tactics}

Task:
1. Elaborate on their typical "MODUS OPERANDI" and high-profile operations.
2. Provide a "GEOPOLITICAL IMPACT ASSESSMENT" showing who they are currently targeting and why.
3. Outline a "CYBER DEFENSE PROTOCOL" for organizations/entities defending against this APT.
Output ONLY the detailed brief in a highly structured, immersive, cyber/military format. Do not use markdown backticks, just raw uppercase headers. Keep it concise but dense.`;
    } else if (noticeType === 'yellow') {
      prompt = `You are RAVEN, an elite tactical intelligence AI.
The user is requesting a tactical assessment for a missing person dossier.
Name: ${selectedSuspect.forename || ''} ${selectedSuspect.name || ''}
Nationality: ${selectedSuspect.nationalities?.[0] || 'UNKNOWN'}
Date of Birth: ${selectedSuspect.date_of_birth || 'UNKNOWN'}
Place of Birth: ${selectedSuspect.place_of_birth || 'UNKNOWN'}
Additional details: ${JSON.stringify(suspectDetails)}

Task:
1. Provide a "CASE TACTICAL BRIEF" analyzing the potential risks, kidnapping hazards, or flight scenarios for this subject based on their profile.
2. Provide a "RECOMMENDED INVESTIGATIVE PROTOCOL" for field agents tracking or searching for this missing individual.
Output ONLY the brief in a highly structured, immersive format. Do not use markdown backticks.`;
    } else if (noticeType === 'un') {
      const listingReasons = suspectDetails.arrest_warrants?.map(w => w.charge).join(' | ') || 'UN SANCTIONS LISTING';
      prompt = `You are RAVEN, an elite tactical intelligence AI.
The user is requesting a sanctions briefing on an individual/entity flagged by the UN Security Council.
Name: ${selectedSuspect.forename || ''} ${selectedSuspect.name || ''}
Listing Reason: ${listingReasons}
Additional details: ${JSON.stringify(suspectDetails)}

Task:
1. Translate or clarify the sanctions listing into high-level intelligence and geopolitical context.
2. Provide a "SANCTIONS TACTICAL ASSESSMENT" detailing potential asset freezing, travel ban bypass risk, and threat level.
3. Outline a "COMPLIANCE & FIELD ACTION PROTOCOL" for enforcement agents.
Output ONLY the brief in a highly structured, immersive format. Do not use markdown backticks.`;
    } else {
      const chargesText = suspectDetails.arrest_warrants?.map(w => w.charge).join(' | ') || 'WANTED BY INTERPOL';
      prompt = `You are RAVEN, an elite tactical intelligence AI. 
The user is requesting a highly detailed tactical dossier expansion for a wanted criminal.
Criminal Charges: ${chargesText}
Additional details: ${JSON.stringify(suspectDetails)}

Task:
1. Translate the charges to formal, classified intelligence terminology.
2. Provide a "TACTICAL ASSESSMENT" elaborating on what these charges typically entail (modus operandi, severity, potential risks, criminal network involvement).
3. Provide a "RECOMMENDED PROTOCOL" for field agents encountering this target.
Output ONLY the detailed dossier in a highly structured, immersive, cyber/military format. Do not use markdown backticks, just raw text with uppercase headers. Keep it concise but dense.`;
    }
    
    try {
      let firstChunk = false;
      await streamAiResponse(prompt, {
        signal: abortRef.current.signal,
        config: { temperature: 0.5, maxOutputTokens: 800 },
        onChunk: (text) => {
          if (!firstChunk) {
            setAiTranslation('');
            firstChunk = true;
          }
          setAiTranslation(prev => prev + text);
        },
        onComplete: () => setIsTranslating(false),
        onError: (err) => {
          if (err.name !== 'AbortError') {
            setAiTranslation('ERROR: Neural network link severed.');
          }
          setIsTranslating(false);
        }
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        setAiTranslation('ERROR: Neural network link severed.');
      }
      setIsTranslating(false);
    }
  };

  const clearSelection = () => {
    setSelectedSuspect(null);
    setSuspectDetails(null);
    setSuspectImages([]);
    setActiveImageIndex(-1);
    setSelectedTarget(null);
    setTrackingActive(false);
  };

  const filteredApt = APT_ACTORS.filter(apt => {
    const q = query.trim().toUpperCase();
    if (!q) return true;
    return (
      apt.name.includes(q) ||
      apt.aliases.includes(q) ||
      apt.originFullName.includes(q) ||
      apt.origin.includes(q) ||
      apt.tools.includes(q) ||
      apt.sectors.includes(q)
    );
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    clearSelection();
    setQuery('');
    if (tab === 'NOTICES') {
      setSuspects([]);
      setTotal(0);
      setPage(1);
    }
  };

  const handleNoticeTypeChange = (type) => {
    setNoticeType(type);
    clearSelection();
    setQuery('');
    setSuspects([]);
    setTotal(0);
    setPage(1);
  };

  const getAptCountryColor = (origin) => {
    if (origin === 'RU') return 'text-red-400 border-red-900/60 bg-red-950/20';
    if (origin === 'CN') return 'text-yellow-500 border-yellow-900/60 bg-yellow-950/20';
    if (origin === 'KP') return 'text-orange-400 border-orange-900/60 bg-orange-950/20';
    if (origin === 'IR') return 'text-cyan-400 border-cyan-900/60 bg-cyan-950/20';
    return 'text-white border-white/10 bg-white/5';
  };

  return (
    <div className={`h-full flex flex-col ${theme.baseBg} border ${theme.borderCard} text-white font-mono transition-colors duration-300`}>
      
      {/* Primary Tabs */}
      <div className="shrink-0 flex border-b border-white/5 bg-black/40">
        <button
          onClick={() => handleTabChange('NOTICES')}
          className={`flex-1 py-2 text-[10px] font-bold tracking-widest transition-all uppercase border-r border-white/5 ${
            activeTab === 'NOTICES'
              ? 'text-red-500 bg-red-950/15 border-b-2 border-b-red-500'
              : 'text-white/40 hover:text-white/70 hover:bg-white/[0.02]'
          }`}
        >
          GLOBAL NOTICES (INTERPOL / UN)
        </button>
        <button
          onClick={() => handleTabChange('APT')}
          className={`flex-1 py-2 text-[10px] font-bold tracking-widest transition-all uppercase ${
            activeTab === 'APT'
              ? 'text-emerald-400 bg-emerald-950/15 border-b-2 border-b-emerald-400'
              : 'text-white/40 hover:text-white/70 hover:bg-white/[0.02]'
          }`}
        >
          CYBER THREAT ACTORS (APT)
        </button>
      </div>

      {/* Header */}
      <div className={`shrink-0 flex flex-col md:flex-row md:items-center justify-between p-3 border-b ${theme.borderHeader} ${theme.bgHeader} gap-3`}>
        <div className="flex items-center gap-2">
          <div className={`relative flex items-center justify-center w-6 h-6 bg-black/40 border ${theme.borderCardHeavy}`}>
            <theme.headerIcon size={12} className={`${theme.textAccent} ${activeTab === 'APT' || noticeType !== 'red' ? '' : 'animate-pulse'}`} />
          </div>
          <div>
            <div className={`text-[11px] font-bold ${theme.textAccent} tracking-widest`}>{theme.title}</div>
            <div className={`text-[9px] ${theme.textAccentMuted} tracking-wider`}>{theme.subTitle}</div>
          </div>
        </div>

        {/* Sub-selectors for Interpol notices */}
        {activeTab === 'NOTICES' ? (
          <div className="flex items-center gap-1.5 self-start md:self-auto">
            <button
              onClick={() => handleNoticeTypeChange('red')}
              className={`px-2 py-0.5 text-[8px] font-bold tracking-widest border transition-all ${
                noticeType === 'red'
                  ? 'bg-red-500/20 text-red-500 border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.2)]'
                  : 'bg-black/40 text-white/40 border-white/5 hover:text-white/60 hover:bg-white/[0.02]'
              }`}
            >
              RED (WANTED)
            </button>
            <button
              onClick={() => handleNoticeTypeChange('yellow')}
              className={`px-2 py-0.5 text-[8px] font-bold tracking-widest border transition-all ${
                noticeType === 'yellow'
                  ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50 shadow-[0_0_8px_rgba(234,179,8,0.2)]'
                  : 'bg-black/40 text-white/40 border-white/5 hover:text-white/60 hover:bg-white/[0.02]'
              }`}
            >
              YELLOW (MISSING)
            </button>
            <button
              onClick={() => handleNoticeTypeChange('un')}
              className={`px-2 py-0.5 text-[8px] font-bold tracking-widest border transition-all ${
                noticeType === 'un'
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-[0_0_8px_rgba(34,211,238,0.2)]'
                  : 'bg-black/40 text-white/40 border-white/5 hover:text-white/60 hover:bg-white/[0.02]'
              }`}
            >
              UN (SANCTIONS)
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-end shrink-0">
            <div className="text-[12px] font-bold text-emerald-400 tracking-wider font-mono">
              {filteredApt.length} / {APT_ACTORS.length}
            </div>
            <div className="text-[8px] text-emerald-500/50 tracking-widest">APT MONITORED</div>
          </div>
        )}

        {activeTab === 'NOTICES' && (
          <div className="flex flex-col items-end shrink-0 hidden md:flex">
            <div className={`text-[12px] font-bold ${theme.textAccent} tracking-wider font-mono`}>
              {total > 0 ? total.toLocaleString() : suspects.length}
            </div>
            <div className={`text-[8px] ${theme.textAccentMuted} tracking-widest`}>
              {noticeType === 'red' ? 'ACTIVE WARRANTS' : noticeType === 'yellow' ? 'ACTIVE ALERTS' : 'SANCTIONED ENTITIES'}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Col: Search & List */}
        <div className={`shrink-0 flex-col border-r ${theme.borderCard} bg-black/40 transition-all duration-300 ${
          selectedSuspect ? 'hidden md:flex md:w-[40%]' : 'flex w-full'
        }`}>
          
          <div className={`p-3 border-b ${theme.borderCard} bg-black/30`}>
            <form onSubmit={activeTab === 'NOTICES' ? searchInterpol : (e) => e.preventDefault()} className="relative">
              <Search size={12} className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${theme.textAccentMuted}`}/>
              <input 
                type="text"
                placeholder={activeTab === 'NOTICES' ? "SEARCH BY NAME / COUNTRY..." : "FILTER BY NAME, COUNTRY, SECTOR, MALWARE..."} 
                value={query}
                onChange={e => setQuery(e.target.value)}
                className={`w-full bg-black/60 border ${theme.borderCard} py-1.5 pl-7 pr-2 text-[10px] ${theme.textAccent} placeholder:${theme.textAccentMuted} focus:outline-none focus:border-${theme.baseThemeColor}-500/80 transition-colors uppercase`}
              />
            </form>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-white/30">
                <Loader2 size={16} className={`animate-spin mb-2 ${theme.textAccent}`}/>
                <div className={`text-[9px] tracking-widest uppercase ${theme.textAccentMuted}`}>SCANNING REGISTRY DATABASE...</div>
              </div>
            ) : activeTab === 'NOTICES' ? (
              // INTERPOL LIST
              suspects.length === 0 ? (
                <div className="text-center p-4 text-[9px] text-white/30 uppercase">NO RECORDS FOUND</div>
              ) : (
                <div className={`grid gap-2 ${selectedSuspect ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                  {suspects.map((suspect, idx) => {
                    const isSelected = selectedSuspect?.entity_id === suspect.entity_id;
                    const thumb = forceHttps(suspect._links?.thumbnail?.href);
                    
                    return (
                      <div 
                        key={`${suspect.entity_id}-${idx}`}
                        onClick={() => fetchDetails(suspect)}
                        className={`flex items-start gap-3 p-2 cursor-pointer transition-all border group ${
                          isSelected 
                            ? theme.borderCardActive 
                            : `bg-black/60 ${theme.borderCard} ${theme.bgCardHover}`
                        }`}
                      >
                        <div className={`shrink-0 w-12 h-14 bg-black/50 border ${theme.borderCard} flex items-center justify-center overflow-hidden`}>
                          {thumb ? (
                            <img 
                              src={thumb} 
                              alt="Suspect"
                              referrerPolicy="no-referrer"
                              onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'block'; }}
                              className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                            />
                          ) : null}
                          <User size={16} className={`${theme.textAccentMuted}`} style={{ display: thumb ? 'none' : 'block' }}/>
                        </div>
                        <div className="flex-1 min-w-0 py-0.5 font-mono">
                          <div className={`text-[10px] font-bold text-white/90 truncate group-hover:${theme.textAccent} transition-colors uppercase`}>
                            {suspect.name}{suspect.forename ? `, ${suspect.forename}` : ''}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-1.5 py-0.5 bg-black/40 border ${theme.borderCard} text-[8px] ${theme.textAccent} tracking-wider`}>
                              {suspect.nationalities?.[0] || 'UNKNOWN'}
                            </span>
                            <span className="text-[8px] text-white/40">{suspect.date_of_birth}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              // CYBER APT LIST
              filteredApt.length === 0 ? (
                <div className="text-center p-4 text-[9px] text-white/30 uppercase">NO APT ACTORS MATCH SEARCH QUERY</div>
              ) : (
                <div className={`grid gap-2 ${selectedSuspect ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                  {filteredApt.map((apt) => {
                    const isSelected = selectedSuspect?.entity_id === apt.entity_id;
                    return (
                      <div 
                        key={apt.entity_id}
                        onClick={() => fetchDetails(apt)}
                        className={`flex items-start gap-3 p-2.5 cursor-pointer transition-all border group ${
                          isSelected 
                            ? theme.borderCardActive 
                            : `bg-black/60 ${theme.borderCard} ${theme.bgCardHover}`
                        }`}
                      >
                        <div className={`shrink-0 w-11 h-11 bg-black/50 border ${theme.borderCard} flex items-center justify-center overflow-hidden`}>
                          <Fingerprint size={20} className={`${isSelected ? 'text-emerald-400' : 'text-emerald-700/60 group-hover:text-emerald-400'} transition-colors`} />
                        </div>
                        <div className="flex-1 min-w-0 font-mono">
                          <div className={`text-[10px] font-bold text-white/90 truncate group-hover:${theme.textAccent} transition-colors`}>
                            {apt.name}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className={`px-1.5 py-0.5 border text-[7px] font-bold tracking-widest ${getAptCountryColor(apt.origin)}`}>
                              {apt.origin}
                            </span>
                            <span className="px-1 py-0.5 bg-red-950/20 border border-red-900/50 text-[7px] text-red-500 font-bold tracking-widest">
                              {apt.threatLevel}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
            
            {activeTab === 'NOTICES' && !isLoading && suspects.length > 0 && suspects.length < total && (
              <button 
                onClick={loadMore}
                className={`w-full mt-4 py-3 bg-white/[0.01] border ${theme.borderCard} text-[10px] font-bold tracking-widest ${theme.textAccentMuted} hover:bg-white/[0.03] hover:${theme.textAccent} hover:border-${theme.baseThemeColor}-500/50 transition-all uppercase mb-4`}
              >
                LOAD MORE REGISTRY FILES
              </button>
            )}
          </div>
        </div>

        {/* Right Col: Dossier Details */}
        {selectedSuspect && (
          <div className="flex-1 flex flex-col bg-black/80 relative overflow-hidden border-l border-white/5">
            {/* Cyber Scanlines Effect */}
            <div className={`absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(transparent_50%,${theme.glowColor}_50%)] bg-[length:100%_4px] mix-blend-overlay z-0`}></div>

            {/* Dossier Header */}
            <div className={`shrink-0 p-4 border-b ${theme.borderCard} relative z-10 bg-white/[0.02] flex justify-between items-start`}>
              <div>
                <button onClick={clearSelection} className={`md:hidden flex items-center gap-1 mb-3 ${theme.textAccent} hover:opacity-80 text-[9px] font-bold tracking-widest uppercase`}>
                  <ChevronRight size={10} className="rotate-180"/> BACK TO THREATS
                </button>
                <div className="flex items-center gap-2 mb-1">
                  <ShieldAlert size={12} className={`${theme.textAccent} animate-pulse`}/>
                  <div className={`text-[8px] ${theme.textAccent} font-bold tracking-widest uppercase`}>
                    SECURE PROFILE // {renderSafe(selectedSuspect.entity_id)}
                  </div>
                </div>
                <div className="text-[14px] font-bold text-white tracking-wider uppercase mt-1">
                  {activeTab === 'APT' ? selectedSuspect.name : `${renderSafe(selectedSuspect.name)} ${renderSafe(selectedSuspect.forename)}`}
                </div>
              </div>
              
              <div className="flex gap-2 relative z-20">
                <button 
                  onClick={() => {
                    if (!activeOperationId) return addNotification('SELECT AN ACTIVE OPERATION IN LINK ANALYSIS FIRST', 'WARNING');
                    addNodeToOperation(activeOperationId, {
                      id: `${activeTab === 'APT' ? 'APT' : 'CRIMINAL'}-${selectedSuspect.entity_id}`,
                      name: activeTab === 'APT' ? selectedSuspect.name : `${renderSafe(selectedSuspect.name)} ${renderSafe(selectedSuspect.forename)}`.trim(),
                      type: activeTab === 'APT' ? 'ORGANIZATION' : 'PERSON',
                      img: activeTab === 'APT' ? null : (suspectImages[0]?._links?.thumbnail?.href || selectedSuspect._links?.thumbnail?.href),
                      desc: activeTab === 'APT' 
                        ? `STATE-SPONSORED CYBER APT (${selectedSuspect.originFullName})` 
                        : (renderSafe(suspectDetails?.arrest_warrants?.[0]?.charge_translation) || (noticeType === 'yellow' ? 'MISSING PERSON' : noticeType === 'un' ? 'UN SANCTIONS LISTED' : 'WANTED BY INTERPOL'))
                    });
                    addNotification(`ENTITY ${selectedSuspect.name} ADDED TO ACTIVE LINK OPERATION`, 'SUCCESS');
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 bg-black/40 hover:bg-white/[0.05] border ${theme.borderCard} ${theme.textAccent} text-[8px] font-bold tracking-widest transition-colors uppercase`}
                >
                  <Target size={10} /> ADD TO LINK OP
                </button>
                <button onClick={clearSelection} className={`p-1 ${theme.textAccentMuted} hover:${theme.textAccent} hover:bg-white/[0.03] transition-colors hidden md:block`}>
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Dossier Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 relative z-10 space-y-6">
              {isDetailsLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 opacity-70">
                  <div className={`${theme.textAccent} animate-pulse`}><Fingerprint size={24} /></div>
                  <span className={`text-[9px] tracking-widest ${theme.textAccentMuted} uppercase`}>DECRYPTING SECURE FILES...</span>
                </div>
              ) : suspectDetails ? (
                <div className="space-y-6">
                  
                  {/* Visual Profile Card */}
                  <div className="flex flex-col xl:flex-row gap-4">
                    <div className="shrink-0 space-y-2">
                      <div className={`w-40 h-48 border-2 ${theme.borderCardHeavy} bg-black/60 p-1 relative flex items-center justify-center`}>
                        {/* Corners */}
                        <div className={`absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2`} style={{ borderColor: theme.glowColor }}></div>
                        <div className={`absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2`} style={{ borderColor: theme.glowColor }}></div>
                        <div className={`absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2`} style={{ borderColor: theme.glowColor }}></div>
                        <div className={`absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2`} style={{ borderColor: theme.glowColor }}></div>
                        
                        {activeTab === 'APT' ? (
                          <div className="flex flex-col items-center gap-2 text-center p-3">
                            <Laptop size={36} className={`${theme.textAccent} animate-pulse`} />
                            <div className="text-[7px] text-white/30 tracking-widest mt-1">CYBER TARGET LOCK</div>
                            <Activity size={12} className="text-emerald-500/50 mt-1" />
                          </div>
                        ) : (
                          <>
                            {activeImageIndex >= 0 && suspectImages[activeImageIndex] ? (
                              <img src={forceHttps(suspectImages[activeImageIndex]._links?.self?.href || suspectImages[activeImageIndex]._links?.thumbnail?.href)} referrerPolicy="no-referrer" className="w-full h-full object-cover grayscale opacity-90" alt="Mugshot" onError={(e) => { e.target.style.display='none'; e.target.nextElementSibling.style.display='flex'; }}/>
                            ) : suspectDetails._links?.thumbnail?.href ? (
                              <img src={forceHttps(suspectDetails._links.thumbnail.href)} referrerPolicy="no-referrer" className="w-full h-full object-cover grayscale opacity-90" alt="Mugshot" onError={(e) => { e.target.style.display='none'; e.target.nextElementSibling.style.display='flex'; }}/>
                            ) : null}
                            <div className={`w-full h-full flex items-center justify-center ${theme.textAccentMuted}`} style={{ display: (suspectDetails._links?.thumbnail?.href || (activeImageIndex >= 0 && suspectImages[activeImageIndex])) ? 'none' : 'flex' }}>
                              <User size={40}/>
                            </div>
                          </>
                        )}
                      </div>
                      
                      {/* Alias Thumbnails for Interpol */}
                      {activeTab === 'NOTICES' && suspectImages.length > 0 && (
                        <div className="grid grid-cols-3 gap-1 w-40">
                          {suspectDetails._links?.thumbnail?.href && (
                            <button onClick={() => setActiveImageIndex(-1)} className={`block w-full h-12 border transition-all bg-black/40 ${activeImageIndex === -1 ? `border-${theme.baseThemeColor}-500 opacity-100` : `border-white/10 opacity-40 hover:opacity-100`}`}>
                              <img src={forceHttps(suspectDetails._links.thumbnail.href)} referrerPolicy="no-referrer" className="w-full h-full object-cover grayscale" alt="Default Thumbnail"/>
                            </button>
                          )}
                          {suspectImages.map((img, i) => (
                            <button key={i} onClick={() => setActiveImageIndex(i)} className={`block w-full h-12 border transition-all bg-black/40 ${activeImageIndex === i ? `border-${theme.baseThemeColor}-500 opacity-100` : `border-white/10 opacity-40 hover:opacity-100`}`}>
                              <img src={forceHttps(img._links?.thumbnail?.href || img._links?.self?.href)} referrerPolicy="no-referrer" className="w-full h-full object-cover grayscale" alt={`Alias Image ${i}`} />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Metadata Fields */}
                    <div className="flex-1 space-y-2">
                      {activeTab === 'APT' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 uppercase">
                          <div className={`p-2 border ${theme.borderCard} bg-black/40`}>
                            <div className={`text-[7px] ${theme.textAccentMuted} tracking-widest mb-0.5`}>STATE SPONSOR</div>
                            <div className="text-[10px] text-white font-bold">{suspectDetails.originFullName} ({suspectDetails.origin})</div>
                          </div>
                          <div className={`p-2 border ${theme.borderCard} bg-black/40`}>
                            <div className={`text-[7px] ${theme.textAccentMuted} tracking-widest mb-0.5`}>INTELLIGENCE AGENCY</div>
                            <div className="text-[10px] text-white">{suspectDetails.agency}</div>
                          </div>
                          <div className={`p-2 border ${theme.borderCard} bg-black/40`}>
                            <div className={`text-[7px] ${theme.textAccentMuted} tracking-widest mb-0.5`}>THREAT RATING</div>
                            <div className="text-[10px] text-red-500 font-bold">{suspectDetails.threatLevel}</div>
                          </div>
                          <div className={`p-2 border ${theme.borderCard} bg-black/40`}>
                            <div className={`text-[7px] ${theme.textAccentMuted} tracking-widest mb-0.5`}>ACTIVE TIMELINE</div>
                            <div className="text-[10px] text-white">SINCE {suspectDetails.activeSince}</div>
                          </div>
                          <div className={`p-2 border ${theme.borderCard} bg-black/40 col-span-1 md:col-span-2`}>
                            <div className={`text-[7px] ${theme.textAccentMuted} tracking-widest mb-0.5`}>KNOWN ALIASES</div>
                            <div className="text-[9px] text-white leading-relaxed">{suspectDetails.aliases}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 uppercase">
                          <div className={`p-2 border ${theme.borderCard} bg-black/40`}>
                            <div className={`text-[7px] ${theme.textAccentMuted} tracking-widest mb-0.5`}>DATE OF BIRTH</div>
                            <div className="text-[10px] text-white">{renderSafe(suspectDetails.date_of_birth) || 'UNKNOWN'}</div>
                          </div>
                          <div className={`p-2 border ${theme.borderCard} bg-black/40`}>
                            <div className={`text-[7px] ${theme.textAccentMuted} tracking-widest mb-0.5`}>PLACE OF BIRTH</div>
                            <div className="text-[10px] text-white truncate">{renderSafe(suspectDetails.place_of_birth)} {suspectDetails.country_of_birth_id ? `(${suspectDetails.country_of_birth_id})` : ''}</div>
                          </div>
                          <div className={`p-2 border ${theme.borderCard} bg-black/40`}>
                            <div className={`text-[7px] ${theme.textAccentMuted} tracking-widest mb-0.5`}>NATIONALITIES</div>
                            <div className="text-[10px] text-white truncate">{renderSafe(suspectDetails.nationalities) || 'UNKNOWN'}</div>
                          </div>
                          <div className={`p-2 border ${theme.borderCard} bg-black/40`}>
                            <div className={`text-[7px] ${theme.textAccentMuted} tracking-widest mb-0.5`}>GENDER</div>
                            <div className="text-[10px] text-white">{suspectDetails.sex_id === 'M' ? 'MALE' : suspectDetails.sex_id === 'F' ? 'FEMALE' : 'UNKNOWN'}</div>
                          </div>
                          <div className={`p-2 border ${theme.borderCard} bg-black/40`}>
                            <div className={`text-[7px] ${theme.textAccentMuted} tracking-widest mb-0.5`}>LANGUAGES</div>
                            <div className="text-[10px] text-white truncate">{renderSafe(suspectDetails.languages_spoken_ids) || 'UNKNOWN'}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Curated Details / Primary Case Info */}
                  {activeTab === 'APT' ? (
                    <div className="space-y-4">
                      {/* Sectors and Tools */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 uppercase">
                        <div className={`p-3 bg-emerald-950/5 border ${theme.borderCard}`}>
                          <div className={`text-[8px] ${theme.textAccent} font-bold mb-1 tracking-widest`}>TARGET SECTORS</div>
                          <div className="text-[9.5px] text-white leading-relaxed">{suspectDetails.sectors}</div>
                        </div>
                        <div className={`p-3 bg-emerald-950/5 border ${theme.borderCard}`}>
                          <div className={`text-[8px] ${theme.textAccent} font-bold mb-1 tracking-widest`}>SIGNATURE TOOLS & MALWARE</div>
                          <div className="text-[9.5px] text-white leading-relaxed">{suspectDetails.tools}</div>
                        </div>
                      </div>

                      {/* Tactics */}
                      <div className={`p-3 bg-emerald-950/5 border ${theme.borderCard} uppercase`}>
                        <div className={`text-[8px] ${theme.textAccent} font-bold mb-1.5 tracking-widest`}>INTRUSION TACTICS & VECTORS</div>
                        <div className="text-[9.5px] text-white leading-relaxed">{suspectDetails.tactics}</div>
                      </div>

                      {/* Profile Description */}
                      <div className={`p-3.5 bg-black/40 border ${theme.borderCard} uppercase`}>
                        <div className={`text-[8px] ${theme.textAccent} font-bold mb-2 tracking-widest border-b border-emerald-900/30 pb-1 flex justify-between items-center`}>
                          <span>TACTICAL BRIEF & HISTORICAL BACKGROUND</span>
                          {!aiTranslation && !isTranslating && (
                            <button 
                              onClick={translateDossier} 
                              className="text-[7.5px] px-2 py-0.5 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/30 transition-colors uppercase font-bold tracking-widest cursor-pointer"
                            >
                              DECRYPT INTEL BRIEF
                            </button>
                          )}
                        </div>
                        <div className="text-[10px] text-white/90 leading-relaxed font-mono">
                          {suspectDetails.profile}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // INTERPOL CASE DETAILS
                    <div className="space-y-4">
                      
                      {/* Warrant Charges / Case Brief */}
                      <div>
                        <div className="flex items-center justify-between mb-2 border-b border-white/5 pb-1">
                          <div className="flex items-center gap-2">
                            <Scale size={12} className={`${theme.textAccent}`}/>
                            <span className={`text-[10px] font-bold ${theme.textAccent} tracking-widest`}>
                              {noticeType === 'red' ? 'WARRANT CHARGES' : noticeType === 'yellow' ? 'MISSING BRIEF' : 'SANCTIONS BRIEF'}
                            </span>
                          </div>
                          {!aiTranslation && !isTranslating && (
                            <button 
                              onClick={translateDossier} 
                              className={`text-[8px] px-2 py-0.5 border border-${theme.baseThemeColor}-500/30 bg-${theme.baseThemeColor}-500/10 ${theme.textAccent} hover:bg-${theme.baseThemeColor}-500/30 transition-colors uppercase font-bold tracking-widest cursor-pointer`}
                            >
                              {noticeType === 'red' ? 'DECRYPT & TRANSLATE' : 'DECRYPT CASE BRIEF'}
                            </button>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          {Array.isArray(suspectDetails.arrest_warrants) && suspectDetails.arrest_warrants.length > 0 ? (
                            suspectDetails.arrest_warrants.map((warrant, idx) => (
                              <div key={idx} className={`p-2.5 bg-black/40 border ${theme.borderCard}`}>
                                <div className={`text-[8px] ${theme.textAccentMuted} mb-1 tracking-widest uppercase`}>
                                  ISSUING ENTITY: {renderSafe(warrant.issuing_country_id)}
                                </div>
                                <div className="text-[9.5px] text-white/90 leading-relaxed uppercase">
                                  {renderSafe(warrant.charge)}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className={`p-2.5 bg-black/40 border ${theme.borderCard}`}>
                              <div className="text-[9.5px] text-white/90 leading-relaxed uppercase">
                                {noticeType === 'yellow' ? 'ACTIVE YELLOW NOTICE CASE: MISSING PERSON ALERT ISSUED BY INTERPOL. INVESTIGATION IN PROGRESS.' : 'UN SANCTIONS NOTICE: DECLARED UNDER SANCTION COMPLIANCE CODES. ASSET FREEZE & TRAVEL EMBARGO DEPLOYED.'}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Physical Profile (if Interpol) */}
                      {(suspectDetails.height || suspectDetails.weight || suspectDetails.eyes_colors_id || suspectDetails.hairs_id || suspectDetails.distinguishing_marks) && (
                        <div>
                          <div className="flex items-center gap-2 mb-2 border-b border-white/5 pb-1">
                            <User size={12} className={`${theme.textAccent}`}/>
                            <span className={`text-[10px] font-bold ${theme.textAccent} tracking-widest`}>PHYSICAL SPECS</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[9px] uppercase">
                            {suspectDetails.height && <div><span className={`${theme.textAccentMuted} mr-1`}>HEIGHT:</span> {renderSafe(suspectDetails.height)} M</div>}
                            {suspectDetails.weight && <div><span className={`${theme.textAccentMuted} mr-1`}>WEIGHT:</span> {renderSafe(suspectDetails.weight)} KG</div>}
                            {suspectDetails.eyes_colors_id && <div><span className={`${theme.textAccentMuted} mr-1`}>EYES:</span> {mapTraits(suspectDetails.eyes_colors_id, EYE_COLORS)}</div>}
                            {suspectDetails.hairs_id && <div><span className={`${theme.textAccentMuted} mr-1`}>HAIR:</span> {mapTraits(suspectDetails.hairs_id, HAIR_COLORS)}</div>}
                          </div>
                          {suspectDetails.distinguishing_marks && (
                            <div className="mt-2 text-[9px]">
                              <div className={`${theme.textAccentMuted} mb-0.5`}>MARKS/SCARS:</div>
                              <div className="text-white/95 uppercase leading-relaxed">{renderSafe(suspectDetails.distinguishing_marks)}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* AI Decrypted Dossier Output */}
                  {(aiTranslation || isTranslating) && (
                    <div className={`mt-2 p-3.5 border border-${theme.baseThemeColor}-500/50 bg-${theme.baseThemeColor}-950/20 relative overflow-hidden`}>
                      <div className={`absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(transparent_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px] mix-blend-overlay z-0`}></div>
                      <div className={`text-[8px] ${theme.textAccent} uppercase tracking-widest mb-2 flex items-center gap-2 relative z-10 font-bold border-b border-${theme.baseThemeColor}-900/30 pb-1`}>
                        <ShieldAlert size={10} /> AI TRANSLATED INTEL DOSSIER {isTranslating && <Loader2 size={8} className="animate-spin"/>}
                      </div>
                      <div className="text-[10px] text-white/90 uppercase leading-relaxed font-mono relative z-10 whitespace-pre-line">
                        {aiTranslation || 'INITIALIZING SECURE TRANSLATION LINK...'}
                        {isTranslating && <span className={`inline-block w-1.5 h-3 ml-1 bg-${theme.baseThemeColor}-400 animate-pulse align-middle`}/>}
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-3 opacity-70 p-4 text-center">
                  <ShieldAlert size={32} className={`${theme.textAccent}`} />
                  <span className={`text-[9px] tracking-widest ${theme.textAccentMuted} uppercase`}>ERROR: ACCESS DENIED BY ENFORCEMENT REGISTRY.</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WantedCriminals;