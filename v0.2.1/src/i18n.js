import {data} from './planets.js';
const enPlanets=[
 {name:'Memory Star',subtitle:'The Archive of Time',tag:'01 / MEMORY',story:'A day here lasts a little longer than an embrace.\n\nThe afternoons you thought you had forgotten are held in the fine dust of its rings. Light rests on an old windowsill. Time has not moved on; it has simply sat down beside you.',response:'The light in your palm carries the warmth of a summer long ago.\nOn the far side of the rings, a small inscription: let time reach the sea, then send a letter on its behalf.'},
 {name:'Quiet Sea',subtitle:'The Sea of Stillness',tag:'02 / STILLNESS',story:'This world has no land, and no tables of the tides.\n\nEach wave begins with a worry someone has finally let go. You need not say a word. The sea understands that silence, too, can be a tender answer.',response:'A ripple opens across the water.\nThe sea asks no questions. It simply carries your unspoken words toward the distance.'},
 {name:'Unsent Letters',subtitle:'Letters Never Sent',tag:'03 / UNSPOKEN',story:'My dear,\n\nSometimes I think that if longing had weight, this world would have drifted out of orbit by now.\nI fold the words I never said into light, hoping that on some ordinary evening, they will find your window.\n\n— Unsigned',response:'On the back of the page, one more line:\n“You need not write back. Your being here is answer enough.”'},
 {name:'Mirror Moon',subtitle:'The Other Side of Light',tag:'04 / REFLECTION',story:'It never reflects the world before it.\n\nIn its pale fissures you glimpse a sunset you did not miss, a path you never took, and another you, in another world, looking up at the moon.',response:'Your reflection waits a heartbeat before reaching out.\nBeside the moon, you notice a point of light that seems to belong to another sky.'},
 {name:'Weightless Garden',subtitle:'Where Wildflowers Float',tag:'05 / BLOOM',story:'Even without soil, flowers find a way to bloom.\n\nThe seeds here are wishes made in secret. They are in no hurry to come true. In this windless universe, they slowly grow into themselves.\n\nOne petal has paused here for you.',response:'A pale pink petal circles you once.\nMay you, too, find a spring in which growing does not have to be hard.'},
 {name:'Returning Light',subtitle:'A Light That Remembers',tag:'06 / HOMECOMING',story:'The first time you passed this way, you saw only darkness.\n\nI was here all along. But some lights need you to return once before they dare believe someone was waiting.\n\nWelcome back to our universe.',response:'Even the smallest star can remember someone.'}
];
export const dictionaries={
 en:{
  pageTitle:'Our Private Universe — V0.2.1 · Cosmic Echoes',description:'A private journey through time, quiet seas and words folded into light.',
  universeLabel:'A three-dimensional universe to orbit, zoom and explore',brandLabel:'Our Private Universe home',labelsLabel:'Visible planets',storyLabel:'Planet story',
  overview:'Return to the stars',nav:'Planets · 5',navTitle:'Five worlds, one small infinity',navHint:'Choose a world, even beyond your field of view. Visiting it records your journey.',navEyebrow:'A QUIET ATLAS',unvisited:'Unexplored',visited:'Explored',
  titleEyebrow:'A SMALL INFINITY, JUST FOR US',titleMain:'Our Private\nUniverse',titleSub:'A place for the light we keep',titleLead:'Some light travels a very long way.\nOnly to meet you here.',wander:'Begin wandering ↗',coordinates:'SOMEWHERE BEYOND TIME',
  progress:'{count} / 5 worlds explored',gesture:'Drag to orbit · Scroll at the pointer / pinch to zoom · Select a planet',journal:'Starlight journal ↗',back:'← Back to the stars',whisper:'Unfold a whisper ↗',enter:'Enter Quiet Sea ↗',comingSoon:'Interior exploration · Coming Soon',
  worldEyebrow:'THE SEA OF STILLNESS · EXPLORATION STUDY',worldTitle:'Quiet Sea · The Tidal Observatory',worldText:'The sea breathes beneath you. Circle the stone doorway and find the moonlight on its other side.',worldBack:'← Back to the planet',
  journalEyebrow:'FRAGMENTS OF OUR INFINITY',journalTitle:'Starlight journal',journalLead:'The universe remembers where you have been.',journalEmpty:'The pages are still blank. Go a little closer to a star.',storage:'Your journey is saved only in this browser, on this device.',storageUnavailable:'Local storage is unavailable. You can keep exploring, but this visit will not be saved.',
  close:'Close',helpLabel:'How to explore',helpEyebrow:'TAKE YOUR TIME',helpTitle:'There is no need to hurry.',helpBody:'Drag with the left mouse button to orbit your observation point.\nScroll over a planet to approach that part of its surface.\nOn a touch screen, drag with one finger and pinch with two.\nSelect a planet for a closer look, or find all five in Planets.\nQuiet Sea has a small world you can enter.',helpKeys:'Tab selects controls; Enter activates them.\nArrow keys orbit, + / − zoom, and Esc takes you back one level.',helpSecret:'Some stories live between the stories.\nReturn another time; the sky may remember you.',
  introLead:'Of all the possible universes,',introTitle:'I am glad we met in this one.',skip:'Enter the universe ↗',
  fallbackTitle:'The starlight cannot reach us yet',fallbackText:'This browser could not open the WebGL scene.\nEnable hardware acceleration or try a browser with WebGL support.',retry:'Try again',noscript:'This universe needs JavaScript. Please enable it in your browser.',
  soundOff:'Sound off',soundOn:'Sound on',soundPaused:'Sound paused · resume',soundStarting:'Opening the quiet…',soundUnavailable:'Sound unavailable',soundSettings:'Sound settings',volume:'Volume',volumeValue:'{value} percent',audioHint:'Sound starts only when you choose to enable it.',audioUnavailable:'Ambient sound is unavailable here. You can still explore.',audioRetry:'The browser paused audio. Select Sound again to retry.',qualityHigh:'Quality · Fine',qualityLow:'Quality · Light',
  complete:'You have visited all five worlds. There may still be light between them, waiting to be found.',
  notices:{letter:'The starlight has formed a sentence. A new message is waiting in your journal.',return:'You found a light that remembers. The universe knows you came back.',mirror:'A star in the reflection has blossomed. A new fragment is in your journal.'},
  secrets:{letter:'Time → Sea → Letter | “Wherever time carries us, you are the place I would choose to return to.”',return:'Returning Light | To be remembered is another way of shining.',mirror:'The Star Beyond the Mirror | That point of light unfolded into another garden. Two worlds, it seems, share the same spring.'},
  planets:enPlanets
 },
 zh:{
  pageTitle:'只属于我们的宇宙 — V0.2.1「宇宙回响」',description:'只属于我们的宇宙。一场关于时间、海洋与未寄出信件的私人星际漫游。',
  universeLabel:'可旋转、缩放和探索的三维宇宙',brandLabel:'只属于我们的宇宙首页',labelsLabel:'视野中的星球',storyLabel:'星球故事',
  overview:'返回全景',nav:'星球 · 5',navTitle:'五颗星球，一片小小的无限',navHint:'选择一颗星球，即使它在视野之外。到访便会记录探索。',navEyebrow:'静静展开星图',unvisited:'尚未探索',visited:'已探索',
  titleEyebrow:'一片小小的无限，只属于我们',titleMain:'只属于\n我们的宇宙',titleSub:'收藏微光的地方',titleLead:'有些光，走了很远。\n只是为了，在这里遇见你。',wander:'开始漫游 ↗',coordinates:'在时间之外的某处',
  progress:'已探索 {count} / 5 颗星球',gesture:'左键拖动环绕 · 指针滚轮 / 双指缩放 · 轻触星球',journal:'星光手记 ↗',back:'← 返回星海',whisper:'展开悄悄话 ↗',enter:'进入星球 · 安静海 ↗',comingSoon:'星球内部 · 即将开放',
  worldEyebrow:'安静海 · 探索示范',worldTitle:'安静海 · 潮间观测岛',worldText:'海在脚下呼吸。绕过石门，看看另一侧的月光。',worldBack:'← 返回星球近景',
  journalEyebrow:'属于我们的星光碎片',journalTitle:'星光手记',journalLead:'你到过的地方，宇宙替你记得。',journalEmpty:'手记还空着。去靠近一颗星球吧。',storage:'探索记录只保存在这台设备的浏览器中。',storageUnavailable:'本地存储不可用，本次探索可继续，但关闭后不会保存。',
  close:'关闭',helpLabel:'操作说明',helpEyebrow:'慢慢来',helpTitle:'不必急着抵达。',helpBody:'左键拖动，围绕观察点旋转视角。\n将指针移到星球上滚动滚轮，向对应区域靠近。\n触屏用单指旋转、双指缩放。\n点击星球进入近景，也可以从星球导航找到五颗星球。\n安静海支持进入独立示范场景。',helpKeys:'用 Tab 选择控件，Enter 进入。\n方向键旋转，+ / − 缩放，Esc 逐层返回。',helpSecret:'有些故事，藏在故事之间。\n下次回来，星空也许会记得你。',
  introLead:'在所有可能的宇宙里，',introTitle:'很高兴，与你相遇。',skip:'进入宇宙 ↗',fallbackTitle:'星光暂时无法抵达',fallbackText:'此浏览器无法创建 WebGL 场景。\n请开启硬件加速，或使用支持 WebGL 的浏览器再来。',retry:'重新尝试',noscript:'这片宇宙需要 JavaScript 才能呈现，请在浏览器中开启它。',
  soundOff:'声音 关闭',soundOn:'声音 开启',soundPaused:'声音已暂停 · 点击恢复',soundStarting:'正在唤醒回响…',soundUnavailable:'声音不可用',soundSettings:'声音设置',volume:'音量',volumeValue:'百分之 {value}',audioHint:'主动开启后，环境声才会响起。',audioUnavailable:'此浏览器暂时无法播放环境声，你仍可正常探索。',audioRetry:'浏览器暂停了音频，请再次点击声音按钮重试。',qualityHigh:'画质 精致',qualityLow:'画质 轻量',
  complete:'你已到访五颗星球。星光之间，也许还有尚未被发现的秘密。',
  notices:{letter:'星光连成了一句话。新的留言已收进星光手记。',return:'你找到了归来的光。宇宙记得你的第二次抵达。',mirror:'倒影中的星忽然开花了。新的片段已收入手记。'},
  secrets:{letter:'时间 → 海 → 信｜「不论时间把我们带向哪里，你都是我愿意返回的坐标。」',return:'归来的光｜原来，被记得也是一种发光。',mirror:'镜外之星｜那一点光忽然展开，成为另一片花园。原来两个世界，共用同一个春天。'},
  planets:data.map((d,i)=>({name:d.name,subtitle:['时间的收藏室','静默的潮汐','未曾说出口的话','光的另一面','花开在无重力之处','记得你的微光'][i],tag:['01 / 回忆','02 / 安静','03 / 未言','04 / 倒映','05 / 生长','06 / 归来'][i],story:d.story,response:d.response}))
 }
};
export function createI18n(persistence){
 const listeners=new Set();
 function t(key,vars={}){let value=key.split('.').reduce((v,k)=>v?.[k],dictionaries[persistence.state.language]);if(typeof value!=='string')throw new Error('Missing translation: '+key);return value.replace(/\{(\w+)\}/g,(_,k)=>String(vars[k]??'{'+k+'}'));}
 function apply(root=document){
  root.documentElement.lang=persistence.state.language==='zh'?'zh-CN':'en';root.title=t('pageTitle');
  root.querySelector('meta[name="description"]')?.setAttribute('content',t('description'));
  for(const el of root.querySelectorAll('[data-i18n]'))el.textContent=t(el.dataset.i18n);
  for(const el of root.querySelectorAll('[data-i18n-aria]'))el.setAttribute('aria-label',t(el.dataset.i18nAria));
  for(const el of root.querySelectorAll('[data-language]'))el.setAttribute('aria-pressed',String(el.dataset.language===persistence.state.language));
 }
 function setLanguage(language){if(!['en','zh'].includes(language)||language===persistence.state.language)return;persistence.state.language=language;persistence.save();apply();listeners.forEach(fn=>fn());}
 return {t,apply,setLanguage,planet:i=>dictionaries[persistence.state.language].planets[i],subscribe(fn){listeners.add(fn);return ()=>listeners.delete(fn);},get language(){return persistence.state.language;}};
}
