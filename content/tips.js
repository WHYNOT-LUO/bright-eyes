// tips.js — the cards in the Learn (知识) tab. This is where your talk content goes.
//
// HOW TO ADD YOUR CONTENT
//  • Each card has a Chinese version (zh) and an English version (en).
//  • Paste your text between the two backticks:  body: `your text here`
//  • A blank line starts a new paragraph.
//  • A line starting with "- " becomes a bullet point.
//  • source (optional): where the advice comes from, e.g. a guideline or your talk.
//  • If a card has text in only one language, the app shows that text in both.
//  • A card with no text yet shows "内容待补充" (content coming soon).
//  • To add a card, copy one { … } block and give it a new id. To remove one, delete its block.
//  • icon can be any emoji.
// After editing, run `npm test` to check nothing is broken.
//
// The titles below are suggested topics; change them to match your talks.
// The 20-20-20 card is filled in as an example of the format. Replace it if you like.

export const tips = [
  {
    id: 'outdoor',
    icon: '☀️',
    zh: { title: '每天户外两小时', body: ``, source: '' },
    en: { title: 'Two hours outdoors every day', body: ``, source: '' },
  },
  {
    id: '20-20-20',
    icon: '👀',
    zh: {
      title: '20-20-20 护眼法则',
      body: `写作业、看书或看屏幕时，每过 20 分钟，抬头看看 6 米（约 20 英尺）外的地方，至少看 20 秒。

- 可以看窗外的树，或者远处的楼
- 用「计时」页面，时间到了会自动提醒`,
      source: '',
    },
    en: {
      title: 'The 20-20-20 rule',
      body: `During homework, reading or screen time, every 20 minutes look at something about 20 feet (6 metres) away for at least 20 seconds.

- Look out of the window at a tree or a distant building
- The Timer tab reminds you when it's time`,
      source: '',
    },
  },
  {
    id: 'posture',
    icon: '📖',
    zh: { title: '读写姿势：一尺、一拳、一寸', body: ``, source: '' },
    en: { title: 'Good reading and writing posture', body: ``, source: '' },
  },
  {
    id: 'screens',
    icon: '📱',
    zh: { title: '合理使用电子屏幕', body: ``, source: '' },
    en: { title: 'Healthy screen use', body: ``, source: '' },
  },
  {
    id: 'sleep',
    icon: '🌙',
    zh: { title: '睡眠和饮食', body: ``, source: '' },
    en: { title: 'Sleep and diet', body: ``, source: '' },
  },
  {
    id: 'checkups',
    icon: '🩺',
    zh: { title: '定期检查视力', body: ``, source: '' },
    en: { title: 'Regular eye check-ups', body: ``, source: '' },
  },
  {
    id: 'ortho-k',
    icon: '🔍',
    zh: { title: '关于角膜塑形镜（OK 镜）', body: ``, source: '' },
    en: { title: 'About ortho-k lenses', body: ``, source: '' },
  },
  {
    id: 'signs',
    icon: '💡',
    zh: { title: '孩子可能近视的信号', body: ``, source: '' },
    en: { title: 'Signs a child may be short-sighted', body: ``, source: '' },
  },
];
