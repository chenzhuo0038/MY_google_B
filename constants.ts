
export const AI_MODELS = [
  { label: 'Gemini 3 Pro (Text/Code) | 旗舰模型', value: 'gemini-3-pro-preview' },
  { label: 'Gemini 3 Flash (Fast) | 极速模型', value: 'gemini-3-flash-preview' },
  { label: 'Gemini 2.5 Flash Image | 图像生成', value: 'gemini-2.5-flash-image' }
];

export const SYSTEM_ROLES = [
  "Professional Storyboard Artist | 专业分镜师", "Cinematographer | 摄影指导", "Concept Artist | 概念设计师", 
  "Movie Director | 电影导演", "Visual Prompt Engineer | 视觉提示词工程师", "Anime Background Artist | 动漫场景画师",
  "Lighting Technical Director | 灯光技术总监", "Visual Effects Supervisor | 视觉特效主管", "Screenwriter | 编剧", "Animation Lead | 动画组长",
  "Comic Book Colorist | 漫画上色师", "Game Level Designer | 游戏关卡设计师", "Architectural Visualizer | 建筑可视化专家", "UI/UX Motion Designer | UI动态设计师",
  "Fashion Illustrator | 时装插画师", "Medical Illustrator | 医学插画师", "Product Designer | 产品设计师", "Stage Designer | 舞台美术设计",
  "Fine Art Painter | 纯艺画家", "Surrealist Creator | 超现实主义创作者", "Dystopian Futurist | 废土未来主义者", "Fantasy World Builder | 奇幻世界构建者",
  "Horror Atmosphere Expert | 恐怖氛围专家", "Comedy Timing Director | 喜剧节奏导演", "Action Sequence Designer | 动作戏设计", "Historical Accuracy Specialist | 历史还原专家",
  "Nature Documentary Filmmaker | 自然纪录片导演", "Cybernetic Organism Designer | 赛博生命设计师", "Mythology Expert | 神话专家", "Minimalist Master | 极简主义大师"
];

export const USER_VISUAL_PROMPTS = [
  "High contrast noir lighting | 高对比度黑色电影灯光", "Dramatic golden hour | 戏剧性黄金时刻", "Soft focus background | 背景柔焦", "Extreme close-up detail | 极度特写细节",
  "Low-key mysterious mood | 低调神秘氛围", "Vibrant neon reflections | 鲜艳霓虹反射", "Natural overcast light | 自然阴天光线", "Ethereal lens flare | 飘渺镜头光晕",
  "Deep depth of field | 深景深", "Cinematic color grading | 电影感色彩分级", "Anamorphic bokeh | 变形宽屏虚化", "Dynamic motion blur | 动态运动模糊",
  "Symmetrical composition | 对称构图", "Rule of thirds focus | 三分法对焦", "Bird's eye perspective | 鸟瞰透视", "Low angle heroic view | 低角度英雄视角",
  "Dreamy pastel palette | 梦幻柔和色调", "Hard shadows and light | 硬调光影", "Misty atmospheric haze | 薄雾缭绕", "Warm candlelight glow | 温暖烛光",
  "Cold industrial blue | 阴冷工业蓝", "Vintage 70s film look | 复古70年代电影感", "Modern high-key lighting | 现代高调照明", "Grit and grain texture | 粗糙颗粒质感",
  "Silhouetted subject | 剪影主体", "Macro texture focus | 微距纹理焦点", "Split lighting effect | 侧逆光效果", "Rim light definition | 轮廓光定义",
  "Volumetric god rays | 体积光/丁达尔效应", "Wide-angle distortion | 广角畸变", "Stabilized tracking shot | 稳定跟踪拍摄", "Handheld gritty style | 手持粗糙风格"
];

export const SHOT_STYLES = [
  "Cinematic Realism | 电影纪实", 
  "Cyberpunk | 赛博朋克", 
  "Makoto Shinkai Style | 新海诚 (你的名字) 画风",
  "Cyberpunk Edgerunners | 边缘行者/扳手社画风",
  "Studio Ghibli Anime | 吉卜力 (宫崎骏) 画风",
  "Demon Slayer (Ufotable) | 鬼灭之刃/Ufotable画风",
  "Dragon Ball Z Style | 龙珠/鸟山明画风",
  "JoJo's Bizarre Adventure | JOJO的奇妙冒险画风",
  "90s Retro Anime | 90年代复古动漫",
  "Vintage Film 35mm | 复古35mm胶片", 
  "Disney Pixar Style | 迪士尼皮克斯", 
  "Modern Minimalist | 现代极简", 
  "Chinese Ink Wash | 中式传统水墨",
  "16-bit Pixel Art | 16位复古像素",
  "Hand-drawn Sketch | 手绘素描", 
  "Hyper-realistic 8K | 8K超写实", 
  "3D Unreal Engine 5 | UE5电影级渲染",
  "Oil Painting | 油画风格",
  "Vaporwave | 蒸汽波", 
  "Noir Black & White | 黑色电影", 
  "Ukiyo-e Japanese | 浮世绘",
  "Concept Art Matte | 概念场景遮罩", 
  "Isometric 3D | 等轴测3D", 
  "Glitch Art | 故障艺术", 
  "Pop Art | 波普艺术",
  "Gothic Dark | 哥特阴暗", 
  "Ethereal Dreamy | 空灵梦幻", 
  "Surrealism | 超现实主义", 
  "Steampunk | 蒸汽朋克",
  "Claymation | 黏土动画", 
  "Papercut Art | 剪纸艺术", 
  "Low Poly | 低多边形", 
  "GTA V Aesthetic | GTA5美学风格",
  "Vector Art Illustration | 矢量商业插画",
  "Impressionism | 印象派", 
  "Blueprint Technical | 技术蓝图"
];

export const CAMERA_MOVEMENTS = [
  "Static Shot | 固定镜头", "Slow Zoom In | 缓慢推镜", "Slow Zoom Out | 缓慢拉镜", "Pan Left to Right | 从左到右摇镜",
  "Pan Right to Left | 从右到左摇镜", "Tilt Up | 俯仰向上", "Tilt Down | 俯仰向下", "Tracking Follow | 跟随拍摄",
  "Handheld Shaky | 手持晃动", "Dolly Zoom (Vertigo) | 希区柯克变焦", "360-degree Orbit | 360度环绕",
  "Low Angle Hero Shot | 低角度英雄镜头", "Birds Eye View | 鸟瞰视角", "Dutch Angle | 荷兰角(斜角)", "Close-up Focus | 近景特写",
  "Slow Motion Tracking | 慢动作跟随", "Rapid Whip Pan | 急摇(甩镜)", "Macro Detail Zoom | 微距细节放大", "Crane Shot | 摇臂镜头", "Shoulder Mount | 肩扛拍摄",
  "POV First Person | 第一人称视角", "GoPro Action View | 运动相机视角", "Snorricam Style | 身上挂载摄像机", "Underwater Smooth | 水下平稳拍摄",
  "Top-Down Map View | 顶视地图视角", "Side Scrolling View | 侧向卷轴视角", "Rack Focus Transition | 变焦焦点切换", "Split Screen View | 分屏视角",
  "Slow Crane Descent | 摇臂缓慢下降", "Fast Orbital Rotation | 快速环绕旋转"
];

export const ATMOSPHERES = [
  "Golden Hour Warmth | 黄金时刻温暖", "Neon Night City | 霓虹午夜城市", "Foggy Morning | 雾蒙蒙的清晨", "Rainy Melancholy | 雨天的忧郁",
  "Bright Midday Sun | 烈日当空", "Deep Space Cold | 深空严寒", "Forest Dappled Light | 森林斑驳光影", "Sunset Silhouette | 落日剪影",
  "Stormy Electric | 雷暴电力感", "Magical Blue Hour | 神秘蓝调时刻", "Warm Indoor Lamp | 温暖室内灯光", "Firelight Glow | 篝火火光",
  "Apocalyptic Dust | 启示录尘埃", "Underworld Eerie | 冥界怪异", "Heavenly Radiance | 天堂圣光", "Cold Fluorescent | 冷光荧光灯",
  "Acidic Green Industrial | 酸性绿工业风", "Polar White Silent | 极地纯白寂静", "Martian Red Dusty | 火星赤红风沙", "Overcast Gloomy | 阴天沉闷",
  "Pastel Sweet Dream | 柔和甜美梦境", "Blood Moon Horror | 血月恐怖", "Vivid High Contrast |鲜艳高对比度", "Sepia Nostalgic | 棕色怀旧",
  "Monochrome Cold | 单色冰冷", "Bioluminescent Jungle | 生物发光丛林", "Sandstorm Blurry | 沙尘暴模糊", "Crystal Clear High-Alt | 晶莹剔透高海拔",
  "Submerged Murky | 沉没浑浊", "Candlelight Intimate | 烛光亲密"
];

export const AUDIO_ELEMENTS = [
  "Lush Orchestral | 华丽管弦乐", "Lo-fi Beats | 低保真节奏", "Ambient Drone | 环境长音", "Aggressive Industrial | 激进工业风",
  "Whimsical Acoustic | 奇幻原声", "Heavy Metal | 重金属", "8-bit Retro | 8位像素复古", "Cinematic Strings | 电影感弦乐",
  "Dark Techno | 阴暗科技舞曲", "Smooth Jazz | 柔和爵士", "Epic Choir | 史诗级合唱", "Traditional Folk | 传统民谣",
  "Sci-Fi Electronic | 科幻电子", "Funky Grooves | 律动芬克", "Ethereal Vocals | 空灵人声", "Minimalist Piano | 极简钢琴",
  "Dubstep Bass | 回响贝斯", "Tribal Percussion | 部落打击乐", "Synthwave Retro | 合成器波", "Deep House | 深层次浩室",
  "Celtic Harp | 凯尔特竖琴", "Glitch Hop | 故障嘻哈", "Reggae Vibes | 雷鬼律动", "Country Twang | 乡村音乐",
  "Opera Soprano | 歌剧女高音", "Cybernetic Hum | 赛博嗡鸣", "Medieval Flute | 中世纪笛声", "Tropical House | 热带浩室",
  "Psytrance Energy | 迷幻舞曲", "Chamber Quartet | 室内四重奏"
];

export const SFX_EXAMPLES = [
  "Heavy Footsteps | 沉重的脚步声", "Birds Chirping | 鸟鸣声", "City Traffic | 城市交通噪音", "Whoosh Transition | 呼啸转场音",
  "Thunder Crack | 雷声轰鸣", "Electronic Glitch | 电子故障音", "Paper Rustling | 纸张摩擦声", "Deep Heartbeat | 深沉的心跳",
  "Sword Clang | 剑拔弩张声", "Magical Sparkle | 魔法闪烁音", "Distant Siren | 远处警笛", "Rain hitting window | 雨打窗台声"
];

export const ACTION_EXAMPLES = [
  "Walking slowly forward | 缓缓向前行走", "Looking into distance | 目光转向远处", "Smiling softly | 温柔地微笑", "Running frantically | 疯狂奔跑",
  "Sitting in thought | 沉思而坐", "Dancing gracefully |优美地起舞", "Fighting intensely | 激烈格斗", "Whispering secrets | 轻声耳语",
  "Crying silently | 默默流泪", "Laughing out loud | 放声大笑", "Falling slowly | 缓慢坠落", "Rising from ashes | 从灰烬中升起",
  "Painting a canvas | 挥毫泼墨", "Typing rapidly | 快速打字", "Drinking coffee | 喝咖啡", "Reading an old book | 读一本旧书",
  "Gazing at stars | 仰望星空", "Walking in rain | 雨中漫步", "Opening a gift | 打开礼物", "Driving at speed | 高速驾驶",
  "Fixing a machine | 修理机器", "Cooking a meal | 烹饪餐点", "Singing a song | 欢快歌唱", "Praying quietly | 静静祈祷",
  "Jumping for joy | 欢呼雀跃", "Waiting at station | 车站等候", "Climbing a mountain | 攀登高山", "Swimming in ocean | 大海游泳",
  "Meditating calmly | 平经冥想", "Screaming in terror | 惊恐尖叫"
];

export const BGM_EXAMPLES = [
  "Dreamy Piano | 梦幻钢琴", "Soft Strings | 柔和弦乐", "Acoustic Guitar | 民谣吉他", "Epic Orchestral | 史诗管弦",
  "Cyberpunk Synth | 赛博合成器", "Dark Ambient | 阴暗氛围", "Happy Ukulele | 快乐尤克里里", "Sad Violin | 忧伤小提琴",
  "Action Drums | 动作鼓点", "Jazz Saxophone | 爵士萨克斯", "Lo-fi Hip Hop | 低保真嘻哈", "Heavy Metal Riff | 重金属电吉他",
  "Spooky Organ | 诡异风琴", "Mystical Flute | 神秘长笛", "Techno Pulse | 科技脉动", "Classical Mozart | 莫扎特古典",
  "Country Banjo | 乡村班卓琴", "Reggae Bass | 雷鬼贝斯", "EDM Build-up | 电子舞曲铺垫", "Folk Accordion | 民谣手风琴",
  "Spacey Pad | 空间填充音", "Tension Drone | 紧张长音", "Heroic Horns | 英雄号角", "Romantic Harp | 浪漫竖琴",
  "Retro 8-bit | 复古8位机", "Tribal Beat | 部落打击乐"
];

export const ASPECT_RATIOS = ["1:1", "16:9", "9:16", "4:3", "3:4"];

export const GRID_LAYOUTS = [
  "Single Panel | 单图", 
  "2x2 Grid | 拼图", 
  "3x3 Grid | 拼图", 
  "1+2 Cinematic | 电影感", 
  "Cinematic Strip | 垂直条", 
  "Storyboard Horizontal | 水平流"
];

export const COLORS = [
  "#ffffff", "#f8fafc", "#94a3b8", "#475569", "#1e293b", "#0f172a", "#000000",
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", "#22c55e", "#10b981",
  "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7",
  "#d946ef", "#ec4899", "#f43f5e"
];

export const TEXT_STYLES = [
  "Modern Sans | 现代无衬线", 
  "Classic Serif | 经典衬线", 
  "Cinematic Bold | 电影感粗体", 
  "Handwriting | 手写体", 
  "Glitch Style | 故障艺术", 
  "Neon Glow | 霓虹发光"
];

export const FONT_SIZES = [
  { label: "12 | Tiny", value: 12 },
  { label: "18 | Small", value: 18 },
  { label: "24 | Medium", value: 24 },
  { label: "36 | Large", value: 36 },
  { label: "48 | Extra Large", value: 48 },
  { label: "72 | Massive", value: 72 }
];

export const TEXT_BG_OPTIONS = [
  { label: "None | 无背景", value: "none" },
  { label: "Semi-Black | 半透明黑", value: "rgba(0,0,0,0.5)" },
  { label: "Semi-White | 半透明白", value: "rgba(255,255,255,0.5)" },
  { label: "Solid Black | 纯黑色", value: "black" },
  { label: "Solid White | 纯白色", value: "white" },
  { label: "Blur | 背景虚化", value: "blur" }
];

export const DIALOG_EXAMPLES = [
  "\"I can't believe it's finally happening.\"",
  "\"Wait! Did you hear that?\"",
  "\"The city never sleeps, and neither do I.\"",
  "\"We're running out of time!\"",
  "\"Is this what you wanted?\"",
  "\"Hello? Is anyone there?\"",
  "\"I've seen things you people wouldn't believe.\"",
  "\"It's a trap!\""
];

export const TRANSLATIONS = {
  zh: {
    title: "AI 智能分镜可视化工作站",
    visualModule: "核心视觉分析",
    mainFrame: "上传主参考帧",
    refImage: "上传辅助参考",
    sysRole: "系统专家角色",
    userPrompt: "用户视觉提示词",
    genVisual: "执行视觉特征提取",
    genImageModule: "渲染生成配置",
    artStyle: "艺术风格预设",
    aspect: "画面纵横比",
    layout: "导出拼图布局",
    textOverlay: "字幕与水印叠加",
    textStyle: "字体艺术风格",
    fontSize: "文字大小",
    textBg: "背景样式",
    autoLabel: "语义增强",
    customPlaceholder: "输入自定义内容...",
    optionsPlaceholder: "-- 选择预设项目 --",
    genTextPreview: "生成文字设计预览",
    confirmTextStyle: "应用当前设计",
    regen: "重新生成",
    analysisOut: "视觉特征分析输出",
    storyboardModule: "分镜剧本逻辑编排",
    autoGen: "全自动 AI 编排模式",
    genAuto: "基于视觉分析全自动编排",
    shotCount: "分镜总数",
    action: "动作描述",
    camera: "镜头运动",
    vibe: "环境氛围",
    audio: "音效细节",
    sfx: "环境特效声",
    bgm: "背景音乐",
    dialog: "对白字幕",
    copy: "复制内容",
    confirmGen: "确认生成图像",
    syncAudio: "同步视听方案",
    syncing: "正在同步音轨..."
  },
  en: {
    title: "AI Storyboard Intelligence Station",
    visualModule: "Core Visual Analysis",
    mainFrame: "Main Reference Frame",
    refImage: "Ref Image Overlay",
    sysRole: "Expert Persona",
    userPrompt: "Visual User Prompt",
    genVisual: "Extract Visual Features",
    genImageModule: "Render Generation Config",
    artStyle: "Artistic Style",
    aspect: "Aspect Ratio",
    layout: "Export Layout",
    textOverlay: "Subtitles & Overlays",
    textStyle: "Text Artistic Style",
    fontSize: "Font Size",
    textBg: "Background Style",
    autoLabel: "Semantic Boost",
    customPlaceholder: "Type custom text...",
    optionsPlaceholder: "-- Select Preset --",
    genTextPreview: "Preview Typography",
    confirmTextStyle: "Apply Design",
    regen: "Regenerate",
    analysisOut: "Visual Feature Analysis",
    storyboardModule: "Sequence Logic Orchestration",
    autoGen: "AI Auto-Pilot Mode",
    genAuto: "Generate Sequence from Context",
    shotCount: "Total Shots",
    action: "Action Script",
    camera: "Camera Motion",
    vibe: "Atmosphere / Vibe",
    audio: "Ambient Sound",
    sfx: "SFX Elements",
    bgm: "Music / Score",
    dialog: "Dialog / Lines",
    copy: "Copy to Clipboard",
    confirmGen: "Confirm Generation",
    syncAudio: "Sync Audio-Visual",
    syncing: "Syncing Tracks..."
  }
};
