
import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as Lucide from 'lucide-react';
import { 
  VisualPromptData, 
  StoryboardConfig, 
  ImageGenConfig, 
  StoryboardShot,
  AppLanguage,
  InputComponentState
} from './types';
import { 
  SYSTEM_ROLES, 
  USER_VISUAL_PROMPTS,
  SHOT_STYLES, 
  CAMERA_MOVEMENTS, 
  ATMOSPHERES, 
  ASPECT_RATIOS, 
  GRID_LAYOUTS,
  COLORS,
  TRANSLATIONS,
  AUDIO_ELEMENTS,
  SFX_EXAMPLES,
  TEXT_STYLES,
  FONT_SIZES,
  TEXT_BG_OPTIONS,
  ACTION_EXAMPLES,
  BGM_EXAMPLES,
  DIALOG_EXAMPLES,
  AI_MODELS
} from './constants';
import InputGroup from './components/InputGroup';
import { generateVisualPrompt, generateAutoStoryboard, generateStoryboardImage, syncAudioVisual } from './services/geminiService';

const App: React.FC = () => {
  const [lang, setLang] = useState<AppLanguage>('zh');
  const [outputLang, setOutputLang] = useState<AppLanguage>('zh');
  const t = TRANSLATIONS[lang];

  // Section 1 Data
  const [visualData, setVisualData] = useState<VisualPromptData>({
    mainImage: null,
    refImage: null,
    systemRole: { custom: '', auto: true, selected: '' },
    userPrompt: { custom: '', auto: true, selected: '' },
    resultPrompt: '',
    storyboardPrompt: ''
  });

  // Section 2 & 3 Data
  const [storyboardConfig, setStoryboardConfig] = useState<StoryboardConfig>({
    shotCount: 4,
    language: 'zh',
    isAuto: true,
    shots: []
  });

  // Section 4 Data (Settings)
  const [imageConfig, setImageConfig] = useState<ImageGenConfig>({
    model: AI_MODELS[0].value,
    style: SHOT_STYLES[0],
    aspectRatio: ASPECT_RATIOS[1],
    gridType: GRID_LAYOUTS[0],
    textOverlay: {
      enabled: false,
      content: '',
      positionCells: [],
      fontSize: 24,
      color: '#ffffff',
      bgColor: 'none',
      style: { custom: '', auto: true, selected: '' },
      previewUrl: null,
      model: 'gemini-2.5-flash-image' // 默认文字渲染引擎
    }
  });

  // UI State
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState<{ [key: string]: any }>({});
  const [zoomLevel, setZoomLevel] = useState(0.85);
  const [totalDuration, setTotalDuration] = useState(20);
  const [showContextMenu, setShowContextMenu] = useState<{ x: number, y: number, text: string } | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const calculateRemaining = () => {
    const used = storyboardConfig.shots.reduce((acc, s) => acc + s.duration, 0);
    return Math.max(0, totalDuration - used);
  };

  const formatTime = (time: number) => {
    return time.toFixed(2).padStart(5, '0');
  };

  const addShot = () => {
    const remaining = calculateRemaining();
    if (remaining <= 2) return;

    const newShot: StoryboardShot = {
      id: Math.random().toString(36).substr(2, 9),
      duration: Math.min(3.0, remaining),
      remainingTotal: remaining,
      remainingAfter: remaining - Math.min(3.0, remaining),
      action: { custom: '', auto: true, selected: '' },
      camera: { custom: '', auto: true, selected: '' },
      atmosphere: { custom: '', auto: true, selected: '' },
      audio: { custom: '', auto: true, selected: '' },
      bgm: { custom: '', auto: true, selected: '' },
      sfx: { custom: '', auto: true, selected: '' },
      dialog: { custom: '', auto: true, selected: '' }
    };

    setStoryboardConfig(prev => ({
      ...prev,
      shots: [...prev.shots, newShot]
    }));
  };

  const removeShot = (id: string) => {
    setStoryboardConfig(prev => ({
      ...prev,
      shots: prev.shots.filter(s => s.id !== id)
    }));
  };

  const updateShotField = (shotId: string, field: keyof StoryboardShot, value: any) => {
    setStoryboardConfig(prev => ({
      ...prev,
      shots: prev.shots.map(s => s.id === shotId ? { ...s, [field]: value } : s)
    }));
  };

  const handleSyncAudio = async (shotId: string) => {
    const shot = storyboardConfig.shots.find(s => s.id === shotId);
    if (!shot) return;

    const actionText = shot.action.custom || shot.action.selected;
    if (!actionText) return;

    const currentBgm = shot.bgm.custom || shot.bgm.selected;
    const currentDialog = shot.dialog.custom || shot.dialog.selected;

    setLoading(prev => ({ ...prev, [`sync-${shotId}`]: true }));
    try {
      const res = await syncAudioVisual(actionText, shot.duration, outputLang, currentBgm, currentDialog);
      if (res) {
        setStoryboardConfig(prev => ({
          ...prev,
          shots: prev.shots.map(s => s.id === shotId ? {
            ...s,
            audio: { ...s.audio, selected: res.audio, auto: true },
            sfx: { ...s.sfx, selected: res.sfx, auto: true },
            bgm: { ...s.bgm, selected: res.bgm, auto: true },
            dialog: { ...s.dialog, selected: res.dialog, auto: true }
          } : s)
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, [`sync-${shotId}`]: false }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'ref') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setVisualData(prev => ({
          ...prev,
          [type === 'main' ? 'mainImage' : 'refImage']: event.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateVisualPrompt = async () => {
    if (!visualData.mainImage) return;
    setLoading(prev => ({ ...prev, visual: true }));
    try {
      const buildPrompt = (state: InputComponentState) => {
        const base = [state.custom, state.selected].filter(Boolean).join(", ");
        return state.auto ? `[Semantic Enhancement Active] ${base}` : base;
      };

      const sys = buildPrompt(visualData.systemRole);
      const usr = buildPrompt(visualData.userPrompt);
      
      const res = await generateVisualPrompt(visualData.mainImage, sys, usr, outputLang);
      setVisualData(prev => ({ ...prev, resultPrompt: res || '' }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, visual: false }));
    }
  };

  const handleGenerateStoryboardPromptFromManual = async () => {
    setLoading(prev => ({ ...prev, autoStoryboard: true }));
    try {
      const manualDetails = storyboardConfig.shots.map((s, i) => (
        `Shot ${i+1}: Duration ${s.duration}s. Action: ${s.action.custom || s.action.selected}, Camera: ${s.camera.selected}, Atmosphere: ${s.atmosphere.selected}`
      )).join('\n');
      
      const context = visualData.resultPrompt 
        ? `Visual Context: ${visualData.resultPrompt}\n\nManual Timeline Instructions:\n${manualDetails}`
        : `Manual Storyboard Sequence:\n${manualDetails}`;
        
      const res = await generateAutoStoryboard(context, storyboardConfig.shots.length, outputLang);
      setVisualData(prev => ({ ...prev, storyboardPrompt: res || '' }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, autoStoryboard: false }));
    }
  };

  const handleGenerateAutoStoryboard = async () => {
    if (!visualData.resultPrompt) return;
    setLoading(prev => ({ ...prev, autoStoryboard: true }));
    try {
      const res = await generateAutoStoryboard(visualData.resultPrompt, storyboardConfig.shotCount, outputLang);
      setVisualData(prev => ({ ...prev, storyboardPrompt: res || '' }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, autoStoryboard: false }));
    }
  };

  const handleGenerateTextPreview = async () => {
    setLoading(prev => ({ ...prev, textPreview: true }));
    try {
      const styleStr = `${imageConfig.textOverlay.style.custom} ${imageConfig.textOverlay.style.selected}`;
      const prompt = `Typography design preview. Focus on high-quality text rendering. Text to display: "${imageConfig.textOverlay.content}". Style aesthetic: ${styleStr}`;
      const img = await generateStoryboardImage(
        prompt, 
        imageConfig.style, 
        "1:1",
        imageConfig.textOverlay,
        imageConfig.model
      );
      setImageConfig(prev => ({ ...prev, textOverlay: { ...prev.textOverlay, previewUrl: img } }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, textPreview: false }));
    }
  };

  const handleGenerateFinal = async () => {
    setLoading(prev => ({ ...prev, final: true }));
    setGeneratedImages([]);
    try {
      const images = [];
      const count = storyboardConfig.isAuto ? storyboardConfig.shotCount : storyboardConfig.shots.length;
      
      for (let i = 0; i < count; i++) {
        let shotPrompt = "";
        if (storyboardConfig.isAuto) {
          shotPrompt = `Action Shot ${i+1}. Source Context: ${visualData.storyboardPrompt || visualData.resultPrompt}. Art Style: ${imageConfig.style}`;
        } else {
          const s = storyboardConfig.shots[i];
          const shotBase = [s.action.custom, s.action.selected, s.camera.selected, s.atmosphere.selected].filter(Boolean).join(", ");
          shotPrompt = `Shot Panel ${i+1}. Context: ${visualData.resultPrompt}. Details: ${shotBase}`;
        }
        
        const img = await generateStoryboardImage(
          shotPrompt, 
          imageConfig.style, 
          imageConfig.aspectRatio,
          imageConfig.textOverlay,
          imageConfig.model
        );
        if (img) images.push(img);
      }
      setGeneratedImages(images);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, final: false }));
    }
  };

  const handleMergeAndExport = async () => {
    if (generatedImages.length === 0) return;
    setLoading(prev => ({ ...prev, exporting: true }));

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const imgs = await Promise.all(generatedImages.map(src => {
        return new Promise<HTMLImageElement>((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = src;
          img.onload = () => resolve(img);
        });
      }));

      const firstImg = imgs[0];
      const w = firstImg.width;
      const h = firstImg.height;
      const type = imageConfig.gridType;

      if (type.includes('2x2')) {
        canvas.width = w * 2;
        canvas.height = h * 2;
        imgs.slice(0, 4).forEach((img, i) => {
          ctx.drawImage(img, (i % 2) * w, Math.floor(i / 2) * h);
        });
      } else if (type.includes('3x3')) {
        canvas.width = w * 3;
        canvas.height = h * 3;
        imgs.slice(0, 9).forEach((img, i) => {
          ctx.drawImage(img, (i % 3) * w, Math.floor(i / 3) * h);
        });
      } else if (type.includes('1+2')) {
        canvas.width = w * 2;
        canvas.height = h;
        ctx.drawImage(imgs[0], 0, 0, w * 1.33, h);
        if (imgs[1]) ctx.drawImage(imgs[1], w * 1.33, 0, w * 0.67, h / 2);
        if (imgs[2]) ctx.drawImage(imgs[2], w * 1.33, h / 2, w * 0.67, h / 2);
      } else if (type.includes('Cinematic Strip')) {
        canvas.width = w;
        canvas.height = h * imgs.length;
        imgs.forEach((img, i) => ctx.drawImage(img, 0, i * h));
      } else {
        canvas.width = w * imgs.length;
        canvas.height = h;
        imgs.forEach((img, i) => ctx.drawImage(img, i * w, 0));
      }

      const link = document.createElement('a');
      link.download = `storyboard_puzzle_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error("Merge failed", err);
    } finally {
      setLoading(prev => ({ ...prev, exporting: false }));
    }
  };

  const toggleCell = (index: number) => {
    setImageConfig(prev => {
      const cells = prev.textOverlay.positionCells;
      const next = cells.includes(index) ? cells.filter(i => i !== index) : [...cells, index];
      return { ...prev, textOverlay: { ...prev.textOverlay, positionCells: next } };
    });
  };

  const getAlignmentDirection = () => {
    const cells = imageConfig.textOverlay.positionCells;
    if (cells.length < 2) return lang === 'zh' ? "请点击网格规划文字轨迹" : "Click grid to plan text path";
    
    const sorted = [...cells].sort((a, b) => a - b);
    const diffs = [];
    for (let i = 1; i < sorted.length; i++) {
      diffs.push(sorted[i] - sorted[i-1]);
    }
    
    const firstDiff = diffs[0];
    const isLinear = diffs.every(d => d === firstDiff);
    
    if (!isLinear) return lang === 'zh' ? "自定义散布排列 (Scattered)" : "Custom Scattered";

    if (firstDiff === 1) return lang === 'zh' ? "水平排列 (Horizontal)" : "Horizontal Path";
    if (firstDiff === 5) return lang === 'zh' ? "垂直排列 (Vertical)" : "Vertical Path";
    if (firstDiff === 6) return lang === 'zh' ? "斜向排列 (Diagonal TL-BR)" : "Diagonal (TL-BR)";
    if (firstDiff === 4) return lang === 'zh' ? "斜向排列 (Diagonal TR-BL)" : "Diagonal (TR-BL)";
    
    return lang === 'zh' ? "自定义线性排列" : "Custom Linear";
  };

  const getWorkspaceGridClass = () => {
    const type = imageConfig.gridType;
    if (type.includes('Single')) return 'layout-single';
    if (type.includes('2x2')) return 'layout-2x2';
    if (type.includes('3x3')) return 'layout-3x3';
    if (type.includes('1+2')) return 'layout-1-2';
    if (type.includes('Cinematic Strip')) return 'layout-strip';
    if (type.includes('Storyboard Horizontal')) return 'layout-h-story';
    return 'layout-single';
  };

  const downloadImage = (src: string, name: string) => {
    const link = document.createElement('a');
    link.href = src;
    link.download = `${name}.png`;
    link.click();
  };

  const handleImageScroll = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      setZoomLevel(prev => Math.min(Math.max(0.2, prev + (e.deltaY > 0 ? -0.05 : 0.05)), 2));
    }
  };

  useEffect(() => {
    const hideMenu = () => setShowContextMenu(null);
    window.addEventListener('click', hideMenu);
    return () => window.removeEventListener('click', hideMenu);
  }, []);

  const remainingTime = calculateRemaining();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-12 font-sans custom-scrollbar overflow-x-hidden" onWheel={handleImageScroll}>
      
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-[100] lightbox-overlay flex items-center justify-center p-8 cursor-zoom-out animate-in fade-in duration-300"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-7xl max-h-full">
            <img src={lightboxImage} className="w-full h-full rounded-3xl shadow-[0_0_100px_-15px_rgba(99,102,241,0.5)] object-contain animate-in zoom-in-95 duration-500" alt="Enlarged" />
            <button className="absolute -top-12 right-0 text-slate-400 hover:text-white transition-colors">
              <Lucide.X size={40} />
            </button>
          </div>
        </div>
      )}

      {showContextMenu && (
        <div 
          className="fixed z-[90] bg-slate-800/95 border border-slate-700 shadow-2xl rounded-2xl py-2 w-64 text-sm backdrop-blur-xl animate-in zoom-in-95 duration-200"
          style={{ top: showContextMenu.y, left: showContextMenu.x }}
        >
          <button 
            className="w-full text-left px-5 py-3 hover:bg-indigo-600 flex items-center gap-4 transition-all"
            onClick={() => { navigator.clipboard.writeText(showContextMenu.text); setShowContextMenu(null); }}
          >
            <Lucide.Copy size={16} /> <span>{t.copy}</span>
          </button>
        </div>
      )}

      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-16 gap-8 border-b border-slate-800/50 pb-12">
        <div className="flex items-center gap-6">
          <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-5 rounded-[2rem] shadow-[0_0_40px_-10px_rgba(99,102,241,0.6)]">
            <Lucide.Clapperboard className="text-white" size={36} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight leading-tight">{t.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold px-3 py-1 rounded-full border border-indigo-500/20 uppercase tracking-[0.2em]">Next-Gen Pipeline</span>
              <span className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">Powered by Gemini 3.0</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-2xl border border-slate-800">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Output Language:</span>
             <button onClick={() => setOutputLang('zh')} className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${outputLang === 'zh' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>ZH</button>
             <button onClick={() => setOutputLang('en')} className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${outputLang === 'en' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>EN</button>
          </div>
          <button onClick={() => setLang(l => l === 'zh' ? 'en' : 'zh')} className="px-10 py-4 bg-slate-900 border border-slate-700 rounded-2xl text-xs font-black hover:bg-indigo-600 hover:border-indigo-400 transition-all uppercase tracking-widest flex items-center gap-3 shadow-xl">
            <Lucide.Globe size={16} /> {lang === 'zh' ? 'English' : '中文'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-16">
        
        <div className="xl:col-span-4 space-y-12">
          
          <section className="glass-panel p-10 rounded-[3rem] shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity"><Lucide.Zap size={60} /></div>
            <h2 className="text-2xl font-black mb-10 flex items-center gap-4"><span className="w-2 h-8 bg-indigo-500 rounded-full" />{t.visualModule}</h2>
            
            <div className="grid grid-cols-2 gap-8 mb-10">
              <div onClick={() => document.getElementById('main-img')?.click()} className="aspect-[4/5] bg-slate-950/80 rounded-[2.5rem] border-2 border-dashed border-slate-800 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-slate-900 transition-all overflow-hidden group/box shadow-inner">
                {visualData.mainImage ? <img src={visualData.mainImage} className="w-full h-full object-cover" /> : <div className="text-center p-4"><Lucide.ImagePlus className="text-slate-700 group-hover/box:text-indigo-400 mx-auto transition-colors" size={40} /><p className="text-[11px] text-slate-500 mt-4 font-black uppercase tracking-widest">{t.mainFrame}</p></div>}
                <input id="main-img" type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'main')} />
              </div>
              <div onClick={() => document.getElementById('ref-img')?.click()} className="aspect-[4/5] bg-slate-950/80 rounded-[2.5rem] border-2 border-dashed border-slate-800 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-slate-900 transition-all overflow-hidden group/box shadow-inner">
                {visualData.refImage ? <img src={visualData.refImage} className="w-full h-full object-cover" /> : <div className="text-center p-4"><Lucide.Layers className="text-slate-700 group-hover/box:text-indigo-400 mx-auto transition-colors" size={40} /><p className="text-[11px] text-slate-500 mt-4 font-black uppercase tracking-widest">{t.refImage}</p></div>}
                <input id="ref-img" type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'ref')} />
              </div>
            </div>

            <div className="space-y-8">
              <InputGroup label={t.sysRole} state={visualData.systemRole} options={SYSTEM_ROLES} onChange={(v) => setVisualData(p => ({ ...p, systemRole: { ...p.systemRole, ...v } }))} autoLabel={t.autoLabel} placeholder={t.customPlaceholder} optionsPlaceholder={t.optionsPlaceholder} />
              <InputGroup label={t.userPrompt} state={visualData.userPrompt} options={USER_VISUAL_PROMPTS} onChange={(v) => setVisualData(p => ({ ...p, userPrompt: { ...p.userPrompt, ...v } }))} autoLabel={t.autoLabel} placeholder={t.customPlaceholder} optionsPlaceholder={t.optionsPlaceholder} />
              <button onClick={handleGenerateVisualPrompt} disabled={loading.visual || !visualData.mainImage} className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 rounded-3xl font-black flex items-center justify-center gap-4 transition-all shadow-[0_15px_30px_-10px_rgba(79,70,229,0.5)] text-base">{loading.visual ? <Lucide.Loader2 className="animate-spin" size={24} /> : <Lucide.Sparkle size={24} />}{t.genVisual}</button>
            </div>
          </section>

          <section className="glass-panel p-10 rounded-[3rem] shadow-2xl">
            <h2 className="text-2xl font-black mb-10 flex items-center gap-4"><span className="w-2 h-8 bg-emerald-500 rounded-full" />{t.genImageModule}</h2>
            
            <div className="space-y-10">
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-xs text-slate-400 uppercase font-black flex items-center gap-3 tracking-widest"><Lucide.Cpu size={16} /> {lang === 'zh' ? '智能引擎模型' : 'AI Engine Model'}</label>
                  <select value={imageConfig.model} onChange={(e) => setImageConfig(p => ({ ...p, model: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm focus:border-indigo-500 transition-all outline-none appearance-none font-bold shadow-inner">{AI_MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}</select>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  <div className="space-y-4">
                    <label className="text-xs text-slate-400 uppercase font-black tracking-widest">{t.artStyle}</label>
                    <select value={imageConfig.style} onChange={(e) => setImageConfig(p => ({ ...p, style: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-medium shadow-inner">{SHOT_STYLES.map(s => <option key={s} value={s}>{s}</option>)}</select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <label className="text-xs text-slate-400 uppercase font-black tracking-widest">{t.aspect}</label>
                      <select value={imageConfig.aspectRatio} onChange={(e) => setImageConfig(p => ({ ...p, aspectRatio: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm shadow-inner">{ASPECT_RATIOS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    </div>
                    <div className="space-y-4">
                      <label className="text-xs text-slate-400 uppercase font-black tracking-widest">{t.layout}</label>
                      <select value={imageConfig.gridType} onChange={(e) => setImageConfig(p => ({ ...p, gridType: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm shadow-inner">{GRID_LAYOUTS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/40 p-8 rounded-[2.5rem] border border-slate-800/60 space-y-8">
                <div className="flex items-center justify-between border-b border-slate-800 pb-6">
                  <span className="text-base font-black text-indigo-400 flex items-center gap-4 uppercase tracking-wider"><Lucide.Type size={22} /> {t.textOverlay}</span>
                  <input type="checkbox" checked={imageConfig.textOverlay.enabled} onChange={(e) => setImageConfig(p => ({ ...p, textOverlay: { ...p.textOverlay, enabled: e.target.checked } }))} className="w-6 h-6 rounded-lg border-slate-700 bg-slate-800 text-indigo-600 cursor-pointer focus:ring-indigo-500" />
                </div>

                {imageConfig.textOverlay.enabled && (
                  <div className="space-y-10 animate-in slide-in-from-top-6 duration-500">
                    <div className="space-y-4">
                      <label className="text-[11px] text-slate-500 uppercase font-black tracking-[0.2em]">{lang === 'zh' ? '渲染引擎 (Third-party Model)' : 'Typography Engine'}</label>
                      <select 
                        value={imageConfig.textOverlay.model} 
                        onChange={(e) => setImageConfig(p => ({ ...p, textOverlay: { ...p.textOverlay, model: e.target.value } }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm focus:border-indigo-500 transition-all outline-none appearance-none font-bold shadow-inner"
                      >
                        {AI_MODELS.filter(m => m.value.includes('image')).map(m => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                        <option value="gemini-3-pro-image-preview">Gemini 3 Pro Image (Premium)</option>
                        <option value="veo-3.1-generate-preview">Veo Visual Engine (Fast)</option>
                      </select>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[11px] text-slate-500 uppercase font-black tracking-[0.2em]">{lang === 'zh' ? '字幕内容' : 'Content Text'}</label>
                      <input type="text" placeholder={t.customPlaceholder} value={imageConfig.textOverlay.content} onChange={(e) => setImageConfig(p => ({ ...p, textOverlay: { ...p.textOverlay, content: e.target.value } }))} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm shadow-inner" />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                      <InputGroup label={t.textStyle} state={imageConfig.textOverlay.style} options={TEXT_STYLES} onChange={(v) => setImageConfig(p => ({ ...p, textOverlay: { ...p.textOverlay, style: { ...p.textOverlay.style, ...v } } }))} autoLabel={t.autoLabel} placeholder={t.customPlaceholder} optionsPlaceholder={t.optionsPlaceholder} />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <label className="text-[11px] text-slate-500 uppercase font-black tracking-widest">{t.fontSize}</label>
                          <select 
                            value={imageConfig.textOverlay.fontSize} 
                            onChange={(e) => setImageConfig(p => ({ ...p, textOverlay: { ...p.textOverlay, fontSize: parseInt(e.target.value) } }))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm focus:border-indigo-500 font-bold appearance-none outline-none"
                          >
                            {FONT_SIZES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                          </select>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[11px] text-slate-500 uppercase font-black tracking-widest">{t.textBg}</label>
                          <select 
                            value={imageConfig.textOverlay.bgColor} 
                            onChange={(e) => setImageConfig(p => ({ ...p, textOverlay: { ...p.textOverlay, bgColor: e.target.value } }))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm focus:border-indigo-500 font-bold appearance-none outline-none"
                          >
                            {TEXT_BG_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] text-slate-500 uppercase font-black tracking-[0.2em]">{lang === 'zh' ? '排列轨迹 (5x5 矩阵点击)' : 'Arrangement Path (25-Cell Grid)'}</label>
                        <button onClick={() => setImageConfig(p => ({ ...p, textOverlay: { ...p.textOverlay, positionCells: [] } }))} className="text-[9px] font-black text-indigo-400 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2">
                           <Lucide.RotateCcw size={12} /> {lang === 'zh' ? '重置位置' : 'RESET POSITION'}
                        </button>
                      </div>
                      <div className="flex flex-col gap-8">
                        <div className="grid-25 w-full aspect-square max-w-[280px] mx-auto bg-slate-900 border border-slate-800/50 p-3 rounded-3xl shadow-[0_0_50px_-10px_rgba(0,0,0,0.5)] relative">
                          {Array.from({ length: 25 }).map((_, i) => (
                            <div 
                              key={i} 
                              onClick={() => toggleCell(i)} 
                              className={`cell-transform rounded-lg cursor-pointer flex items-center justify-center transition-all duration-300 relative overflow-hidden group/cell ${imageConfig.textOverlay.positionCells.includes(i) ? 'bg-indigo-600 scale-90 shadow-[0_0_20px_rgba(99,102,241,0.8)] z-10 animate-pulse' : 'bg-slate-800/50 hover:bg-slate-700 hover:scale-110 hover:z-20 shadow-inner'}`} 
                            >
                               {imageConfig.textOverlay.positionCells.includes(i) ? (
                                 <Lucide.Check className="text-white drop-shadow-md" size={16} strokeWidth={4} />
                               ) : (
                                 <span className="text-[8px] text-slate-700 font-bold opacity-0 group-hover/cell:opacity-100">{i+1}</span>
                               )}
                               <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/cell:opacity-100 transition-opacity" />
                            </div>
                          ))}
                        </div>

                        <div className="flex-1 w-full flex flex-col gap-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col justify-center">
                              <p className="text-[10px] text-slate-500 uppercase font-black mb-1 tracking-widest">{lang === 'zh' ? '实时轨迹识别' : 'Dynamic Tracking'}</p>
                              <span className="text-xs text-indigo-400 font-black uppercase">{getAlignmentDirection()}</span>
                            </div>
                            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-center">
                               <div className="w-8 h-8 rounded-full border-2 border-slate-700 flex items-center justify-center" style={{ backgroundColor: imageConfig.textOverlay.color }}>
                                  <Lucide.Palette size={14} className={imageConfig.textOverlay.color === '#ffffff' ? 'text-black' : 'text-white'} />
                               </div>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
                            <label className="text-[10px] text-slate-500 uppercase font-black mb-3 block tracking-widest">{lang === 'zh' ? '文字颜色选择' : 'Select Text Color'}</label>
                            <div className="grid grid-cols-8 gap-2.5">
                              {COLORS.map(c => (
                                <div 
                                  key={c} 
                                  onClick={() => setImageConfig(p => ({ ...p, textOverlay: { ...p.textOverlay, color: c } }))} 
                                  className={`w-full aspect-square rounded-md border-2 cursor-pointer transition-all hover:scale-125 shadow-sm ${imageConfig.textOverlay.color === c ? 'border-white ring-4 ring-indigo-500/30 z-10 scale-110' : 'border-slate-800 hover:border-slate-500'}`} 
                                  style={{ backgroundColor: c }} 
                                  title={c}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {imageConfig.textOverlay.previewUrl && (
                      <div className="relative group rounded-[2.5rem] overflow-hidden border border-slate-800 h-96 bg-slate-950 shadow-2xl cursor-zoom-in" onClick={() => setLightboxImage(imageConfig.textOverlay.previewUrl)}>
                        <img src={imageConfig.textOverlay.previewUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 gap-6">
                          <Lucide.Maximize2 size={32} className="text-indigo-400 animate-pulse" />
                          <div className="flex gap-4">
                            <button onClick={(e) => { e.stopPropagation(); setImageConfig(p => ({ ...p, textOverlay: { ...p.textOverlay, previewUrl: null } })) }} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl text-xs font-black shadow-xl hover:bg-indigo-500 transition-all active:scale-95">{t.confirmTextStyle}</button>
                            <button onClick={(e) => { e.stopPropagation(); handleGenerateTextPreview(); }} className="bg-slate-800 text-white px-8 py-3 rounded-2xl text-xs font-black hover:bg-slate-700 transition-all active:scale-95">{t.regen}</button>
                          </div>
                        </div>
                      </div>
                    )}

                    <button onClick={handleGenerateTextPreview} disabled={loading.textPreview} className="w-full py-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-black hover:bg-slate-800 transition-all flex items-center justify-center gap-3 uppercase tracking-widest shadow-xl">
                      {loading.textPreview ? <Lucide.Loader2 className="animate-spin" size={20} /> : <Lucide.Eye size={20} />}{t.genTextPreview}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="xl:col-span-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <section className="glass-panel p-10 rounded-[3rem] min-h-[300px] flex flex-col shadow-2xl relative">
              <div className="flex justify-between items-center mb-6"><h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-4"><Lucide.BrainCircuit size={20} className="text-indigo-400" /> {t.analysisOut}</h2><button onClick={() => navigator.clipboard.writeText(visualData.resultPrompt)} className="p-3 hover:bg-slate-800 bg-slate-900 rounded-2xl transition-all text-slate-400 group/btn" title="Copy"><Lucide.Copy size={18} className="group-hover/btn:text-indigo-400" /></button></div>
              <textarea readOnly value={visualData.resultPrompt} className="bg-slate-950/60 border border-slate-800 rounded-3xl p-6 flex-1 text-sm text-slate-300 min-h-[160px] resize-none focus:outline-none custom-scrollbar leading-loose font-medium italic shadow-inner" placeholder={lang === 'zh' ? '正在等待视觉模型提取特征...' : 'Waiting for visual model...'} />
            </section>
            <section className="glass-panel p-10 rounded-[3rem] min-h-[300px] flex flex-col shadow-2xl relative">
              <div className="flex justify-between items-center mb-6"><h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-4"><Lucide.FileText size={20} className="text-emerald-400" /> {lang === 'zh' ? '分镜提示词输出' : 'Storyboard Shot Output'}</h2><button onClick={() => navigator.clipboard.writeText(visualData.storyboardPrompt)} className="p-3 hover:bg-slate-800 bg-slate-900 rounded-2xl transition-all text-slate-400 group/btn" title="Copy"><Lucide.Copy size={18} className="group-hover/btn:text-emerald-400" /></button></div>
              <textarea readOnly value={visualData.storyboardPrompt} className="bg-slate-950/60 border border-slate-800 rounded-3xl p-6 flex-1 text-sm text-slate-300 min-h-[160px] resize-none focus:outline-none custom-scrollbar leading-loose font-medium italic shadow-inner" placeholder={lang === 'zh' ? '分镜编排结果将在此生成...' : 'Storyboard breakdown...'} />
            </section>
          </div>

          <section className="glass-panel p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><Lucide.Layers size={180} /></div>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-8">
              <div><h2 className="text-3xl font-black flex items-center gap-4"><Lucide.Table2 className="text-indigo-400" size={36} />{t.storyboardModule}</h2><p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-mono mt-2 ml-14">SEQUENTIAL SEQUENCE LOGIC V2.0</p></div>
              <div className="flex items-center gap-6 bg-slate-950 p-3 rounded-[2rem] border border-slate-800 shadow-2xl">
                <label className="flex items-center gap-4 text-xs font-black text-slate-400 px-5 py-2 cursor-pointer hover:text-indigo-400 transition-colors group"><input type="checkbox" checked={storyboardConfig.isAuto} onChange={(e) => setStoryboardConfig(p => ({ ...p, isAuto: e.target.checked }))} className="w-6 h-6 rounded-lg border-slate-700 bg-slate-800 text-indigo-600 transition-all group-hover:scale-110" /> {t.autoGen}</label>
                <div className="h-10 w-[2px] bg-slate-800/50" />
                <button onClick={handleGenerateFinal} disabled={loading.final || (!storyboardConfig.isAuto && storyboardConfig.shots.length === 0)} className="px-10 py-5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 rounded-[1.5rem] text-sm font-black shadow-[0_15px_30px_-10px_rgba(16,185,129,0.5)] transition-all flex items-center gap-4 active:scale-95 group/main">
                  {loading.final ? <Lucide.Loader2 className="animate-spin" size={24} /> : <Lucide.Play className="group-hover/main:scale-110 transition-transform" size={24} />}
                  <div className="flex flex-col items-start leading-none gap-1"><span className="text-[12px] uppercase">{lang === 'zh' ? '确认生成图像 |' : 'CONFIRM GENERATE |'}</span><span className="text-[10px] opacity-70 uppercase tracking-tighter">Confirm Generate Image</span></div>
                </button>
              </div>
            </div>

            {storyboardConfig.isAuto ? (
              <div className="bg-slate-950/80 p-10 rounded-[2.5rem] border border-slate-800/80 space-y-10 animate-in slide-in-from-top-12 duration-700 shadow-inner">
                <div className="flex justify-between items-end"><div className="space-y-2"><label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">{t.shotCount}</label><p className="text-6xl font-black text-indigo-400 tabular-nums">{storyboardConfig.shotCount}</p></div><div className="text-right"><span className="text-[10px] text-slate-600 font-mono bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">MAXIMUM 16 PANELS</span></div></div>
                <input type="range" min="1" max="16" value={storyboardConfig.shotCount} onChange={(e) => setStoryboardConfig(p => ({ ...p, shotCount: parseInt(e.target.value) }))} className="w-full h-3 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500 transition-all" />
                <button onClick={handleGenerateAutoStoryboard} disabled={loading.autoStoryboard || !visualData.resultPrompt} className="w-full py-5 bg-indigo-600/5 border border-indigo-500/20 rounded-3xl text-sm font-black hover:bg-indigo-600/10 transition-all flex items-center justify-center gap-4 tracking-widest uppercase shadow-xl">{loading.autoStoryboard ? <Lucide.Loader2 className="animate-spin" size={24} /> : <Lucide.Sparkles size={24} className="text-indigo-400" />}{t.genAuto}</button>
              </div>
            ) : (
              <div className="space-y-12 animate-in slide-in-from-bottom-12 duration-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="bg-[#0a0f1e] p-8 rounded-[2.5rem] border border-slate-800/40 shadow-inner group flex flex-col justify-center"><span className="text-[11px] font-black text-slate-500 block mb-4 uppercase tracking-[0.2em] group-hover:text-indigo-400 transition-colors">{lang === 'zh' ? '总时长 (秒) |' : 'TOTAL DURATION(S) |'}<br /><span className="text-[9px] opacity-60">TOTAL DURATION(S)</span></span><div className="flex items-center gap-4"><input type="number" value={totalDuration} onChange={(e) => setTotalDuration(parseFloat(e.target.value))} className="bg-transparent text-5xl font-black text-indigo-400 w-full outline-none font-mono tabular-nums" /><span className="text-xl text-slate-700 font-black">S</span></div></div>
                  <div className="bg-[#0a0f1e] p-8 rounded-[2.5rem] border border-slate-800/40 shadow-inner group flex flex-col justify-center"><span className="text-[11px] font-black text-slate-500 block mb-4 uppercase tracking-[0.2em] group-hover:text-indigo-400 transition-colors">{lang === 'zh' ? '剩余总时长 |' : 'REMAINING TOTAL |'}<br /><span className="text-[9px] opacity-60">REMAINING TOTAL</span></span><div className={`text-5xl font-black font-mono tabular-nums flex items-baseline gap-2 ${remainingTime <= 2 ? 'text-red-500 animate-pulse' : 'text-slate-200'}`}>{formatTime(remainingTime)}<span className="text-xl text-slate-700 font-black">S</span></div></div>
                  <button onClick={handleGenerateStoryboardPromptFromManual} disabled={loading.autoStoryboard} className="relative bg-gradient-to-br from-indigo-900/40 to-slate-950 border-2 border-indigo-500/80 rounded-[2.5rem] flex flex-col items-center justify-center group transition-all duration-500 shadow-[0_0_40px_rgba(99,102,241,0.4)] hover:shadow-[0_0_60px_rgba(99,102,241,0.6)] hover:border-indigo-400 p-10 min-h-[160px] overflow-hidden"><div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity" /><div className="mb-4 relative">{loading.autoStoryboard ? <Lucide.Loader2 className="animate-spin text-indigo-400" size={48} /> : <Lucide.Zap className="text-indigo-400 group-hover:scale-125 group-hover:text-indigo-300 transition-all duration-500" size={48} />}</div><div className="text-center relative z-10"><p className="text-[12px] font-black text-white uppercase leading-relaxed tracking-wider mb-1">{lang === 'zh' ? '确认生成分镜提示词 |' : 'CONFIRM GENERATE STORYBOARD |'}</p><p className="text-[10px] font-black text-indigo-400/80 uppercase tracking-[0.2em]">{lang === 'zh' ? '协同计算处理' : 'SYNERGIC PROCESSING'}</p></div></button>
                  <button onClick={addShot} disabled={remainingTime <= 2} className="bg-[#0a0f1e] hover:bg-slate-900 border border-emerald-500/20 rounded-[2.5rem] flex flex-col items-center justify-center disabled:opacity-20 group transition-all duration-500 shadow-2xl p-10 min-h-[160px]"><div className="bg-emerald-500/5 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform"><Lucide.PlusCircle size={44} className="text-emerald-500 group-hover:rotate-90 transition-all duration-500" /></div><div className="text-center"><span className="text-[11px] font-black uppercase tracking-[0.2em] group-hover:tracking-[0.3em] transition-all text-slate-400 block mb-1">{lang === 'zh' ? '添加分镜 |' : 'ADD SHOT |'}</span><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ADD SHOT</span></div></button>
                </div>

                <div className="space-y-8 max-h-[1000px] overflow-y-auto pr-6 custom-scrollbar">
                  {storyboardConfig.shots.map((shot, idx) => (
                    <div key={shot.id} className="shot-card bg-[#0a0f1e]/60 border border-slate-800/80 rounded-[3rem] p-10 space-y-10 shadow-2xl backdrop-blur-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600/30" />
                      <div className="flex justify-between items-center border-b border-slate-800/50 pb-8">
                        <div className="flex items-center gap-6">
                          <span className="w-16 h-16 rounded-[1.5rem] bg-indigo-600 text-[20px] flex items-center justify-center font-black font-mono shadow-[0_10px_30px_-5px_rgba(79,70,229,0.5)] border border-indigo-400/30">{idx < 9 ? `0${idx+1}` : idx+1}</span>
                          <div className="flex flex-col gap-1">
                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">{lang === 'zh' ? '本镜时长' : 'Panel duration'}</span>
                            <div className="flex items-center gap-3">
                              <input type="number" step="0.5" value={shot.duration} onChange={(e) => updateShotField(shot.id, 'duration', parseFloat(e.target.value))} className="bg-[#020617] border border-slate-800 rounded-2xl px-6 py-2.5 text-lg font-black font-mono w-32 text-indigo-400 focus:border-indigo-500 outline-none shadow-inner" />
                              <span className="text-sm text-slate-600 font-black uppercase">SEC</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => handleSyncAudio(shot.id)} 
                            disabled={loading[`sync-${shot.id}`]}
                            className="h-16 px-8 flex items-center gap-3 bg-indigo-950/40 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-[1.5rem] border border-indigo-500/30 transition-all font-black uppercase tracking-widest text-xs shadow-xl disabled:opacity-30 group"
                          >
                            {loading[`sync-${shot.id}`] ? <Lucide.RotateCw className="animate-spin" size={20} /> : <Lucide.Mic2 className="group-hover:scale-110 transition-transform" size={20} />}
                            {loading[`sync-${shot.id}`] ? t.syncing : t.syncAudio}
                          </button>
                          <button onClick={() => removeShot(shot.id)} className="w-16 h-16 flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all group">
                            <Lucide.Trash2 size={28} className="group-hover:scale-110 transition-transform" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                        <InputGroup label={t.action} state={shot.action} options={ACTION_EXAMPLES} onChange={(v) => updateShotField(shot.id, 'action', {...shot.action, ...v})} autoLabel={t.autoLabel} placeholder={t.customPlaceholder} optionsPlaceholder={t.optionsPlaceholder} />
                        <InputGroup label={t.camera} state={shot.camera} options={CAMERA_MOVEMENTS} onChange={(v) => updateShotField(shot.id, 'camera', {...shot.camera, ...v})} autoLabel={t.autoLabel} placeholder={t.customPlaceholder} optionsPlaceholder={t.optionsPlaceholder} />
                        <InputGroup label={t.vibe} state={shot.atmosphere} options={ATMOSPHERES} onChange={(v) => updateShotField(shot.id, 'atmosphere', {...shot.atmosphere, ...v})} autoLabel={t.autoLabel} placeholder={t.customPlaceholder} optionsPlaceholder={t.optionsPlaceholder} />
                        <InputGroup label={t.audio} state={shot.audio} options={AUDIO_ELEMENTS} onChange={(v) => updateShotField(shot.id, 'audio', {...shot.audio, ...v})} autoLabel={t.autoLabel} placeholder={t.customPlaceholder} optionsPlaceholder={t.optionsPlaceholder} />
                        <InputGroup label={t.sfx} state={shot.sfx} options={SFX_EXAMPLES} onChange={(v) => updateShotField(shot.id, 'sfx', {...shot.sfx, ...v})} autoLabel={t.autoLabel} placeholder={t.customPlaceholder} optionsPlaceholder={t.optionsPlaceholder} />
                        <InputGroup label={t.bgm} state={shot.bgm} options={BGM_EXAMPLES} onChange={(v) => updateShotField(shot.id, 'bgm', {...shot.bgm, ...v})} autoLabel={t.autoLabel} placeholder={t.customPlaceholder} optionsPlaceholder={t.optionsPlaceholder} />
                        <InputGroup label={t.dialog} state={shot.dialog} options={DIALOG_EXAMPLES} onChange={(v) => updateShotField(shot.id, 'dialog', {...shot.dialog, ...v})} autoLabel={t.autoLabel} placeholder={t.customPlaceholder} optionsPlaceholder={t.optionsPlaceholder} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="glass-panel p-10 lg:p-14 rounded-[4rem] shadow-[0_0_100px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-14 opacity-5 pointer-events-none"><Lucide.MonitorPlay size={200} /></div>
            
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-14 gap-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-slate-950 rounded-3xl flex items-center justify-center border border-slate-800 shadow-2xl"><Lucide.Projector className="text-indigo-400" size={32} /></div>
                <div><h2 className="text-3xl font-black tracking-tight">{lang === 'zh' ? '画面预览工作台' : 'Visual Output Workspace'}</h2><div className="flex items-center gap-3 mt-1"><span className="text-[11px] text-slate-600 uppercase tracking-[0.4em] font-mono">Integrated Puzzle Workflow</span><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" /></div></div>
              </div>
              
              <div className="flex items-center gap-4 bg-slate-950/80 p-3 rounded-[2rem] border border-slate-800 shadow-2xl backdrop-blur-xl">
                <button 
                  onClick={handleMergeAndExport} 
                  disabled={generatedImages.length === 0 || loading.exporting}
                  className="px-6 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-20 rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95"
                >
                   {loading.exporting ? <Lucide.Loader2 className="animate-spin" size={18} /> : <Lucide.Grid size={18} />}
                   {lang === 'zh' ? '合并拼图导出' : 'Merge & Export Puzzle'}
                </button>
                <div className="w-[2px] h-8 bg-slate-800 mx-2" />
                <div className="flex items-center gap-3 px-2">
                  <button onClick={() => setZoomLevel(z => Math.max(0.2, z - 0.05))} className="p-3 hover:bg-slate-800 rounded-2xl transition-all active:scale-90"><Lucide.Minus size={18} /></button>
                  <div className="w-20 text-center select-none"><span className="text-sm font-black text-indigo-400 font-mono tracking-tighter">{Math.round(zoomLevel * 100)}%</span></div>
                  <button onClick={() => setZoomLevel(z => Math.min(2.0, z + 0.05))} className="p-3 hover:bg-slate-800 rounded-2xl transition-all active:scale-90"><Lucide.Plus size={18} /></button>
                </div>
              </div>
            </div>

            <div className="bg-[#020617] rounded-[3.5rem] border border-slate-900 p-16 min-h-[750px] flex items-center justify-center relative overflow-hidden group/canvas shadow-[inset_0_0_80px_rgba(0,0,0,0.8)]">
              {generatedImages.length > 0 ? (
                <div 
                  className="w-full flex justify-center"
                  style={{ 
                    transform: `scale(${zoomLevel})`, 
                    transformOrigin: 'center center',
                    transition: 'transform 0.3s ease-out' 
                  }}
                >
                  <div className={`preview-grid ${getWorkspaceGridClass()} bg-black p-4 rounded-[3rem] shadow-[0_40px_100px_-30px_rgba(0,0,0,1)] border border-slate-800/30 gap-1`}>
                    {generatedImages.map((img, i) => (
                      <div key={i} className="image-card bg-slate-950 border-0 shadow-none cursor-zoom-in group" onClick={() => setLightboxImage(img)}>
                        <img src={img} className="w-full h-auto object-cover block transition-transform duration-1000 group-hover:scale-[1.02]" />
                        <div className="absolute inset-0 image-zoom-overlay flex flex-col justify-end p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                           <div className="flex justify-between items-end gap-6 animate-in slide-in-from-bottom-6 duration-500">
                              <span className="text-[10px] font-black text-white bg-indigo-600/80 backdrop-blur-md px-4 py-1.5 rounded-full uppercase tracking-[0.2em]">P0{i+1}</span>
                              <button onClick={(e) => { e.stopPropagation(); downloadImage(img, `shot_${i+1}`); }} className="bg-white/10 backdrop-blur-md text-white p-4 rounded-2xl hover:bg-indigo-500 transition-all shadow-2xl active:scale-95"><Lucide.Download size={20} /></button>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-12 animate-in fade-in zoom-in duration-1000">
                  {loading.final ? (
                    <div className="flex flex-col items-center gap-12">
                      <div className="relative"><div className="w-32 h-32 border-[8px] border-indigo-500/5 border-t-indigo-500 rounded-full animate-spin duration-[1.5s]" /><Lucide.Ghost className="absolute inset-0 m-auto text-indigo-400/20 animate-pulse" size={50} /></div>
                      <p className="text-3xl font-black text-white uppercase tracking-[0.6em] animate-pulse">{lang === 'zh' ? '正在编织视觉维度' : 'Weaving Visual Dimensions'}</p>
                    </div>
                  ) : (
                    <div className="opacity-5 space-y-12 flex flex-col items-center group"><Lucide.Film size={180} className="group-hover:scale-110 transition-transform duration-1000" /><p className="text-6xl font-black uppercase tracking-[1em] text-white ml-[1em]">{lang === 'zh' ? '待命' : 'IDLE'}</p></div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <footer className="mt-32 py-24 border-t border-slate-900/80">
        <div className="flex flex-col items-center gap-10">
          <div className="text-center space-y-4">
            <p className="text-[11px] font-black text-slate-800 uppercase tracking-[0.8em] flex items-center justify-center gap-4">NARRAVATIVE &bull; VISION &bull; INTELLIGENCE</p>
            <p className="text-slate-900 text-[9px] tracking-[0.4em] uppercase font-mono">Integrated Puzzle Production &copy; 2025</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
