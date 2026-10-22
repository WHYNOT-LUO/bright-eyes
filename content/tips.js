// tips.js — the cards in the Learn (知识) tab.
//
// HOW TO EDIT
//  • Each card has a Chinese version (zh) and an English version (en).
//  • Text goes between the two backticks:  body: `text here`
//  • A blank line starts a new paragraph.
//  • A line starting with "- " becomes a bullet point.
//  • source (optional): where the advice comes from; shown as a small "来源：…" line.
//  • If a card has text in only one language, the app shows that text in both.
//  • A card with no text shows "内容待补充" (content coming soon).
//  • To add a card, copy one { … } block and give it a new id. To remove one, delete its block.
//  • icon can be any emoji.
// After editing, run `npm test` to check nothing is broken.
//
// These cards were drafted from Chinese national guidance (the documents named in
// each "source"). Check them against your talks and the latest versions of those
// documents, and rewrite them in your own words wherever you like.

export const tips = [
  {
    id: 'outdoor',
    icon: '☀️',
    zh: {
      title: '每天户外两小时',
      body: `国家指南建议：孩子每天白天在户外活动至少 2 小时，或每周累计 14 小时。

- 关键是户外的光线，不一定要剧烈运动：散步、玩耍、户外上课都算
- 阴天或树荫下的光线，也比室内亮得多
- 可以分几段完成，比如上学路上、课间、放学后
- 注意防晒，不要直视太阳`,
      source: '《儿童青少年近视防控适宜技术指南》（国家卫生健康委、国家疾控局）',
    },
    en: {
      title: 'Two hours outdoors every day',
      body: `China's national guidelines recommend at least 2 hours outdoors in daylight every day, or 14 hours a week.

- What matters is outdoor light, not hard exercise: walking, playing and outdoor lessons all count
- Even on a cloudy day or in the shade, it is much brighter outside than indoors
- It can be split up: the walk to school, breaks, after school
- Protect skin from the sun and never look straight at it`,
      source:
        "China's Appropriate Technical Guidelines for Myopia Prevention in Children and Adolescents (National Health Commission, National Disease Control and Prevention Administration)",
    },
  },
  {
    id: '20-20-20',
    icon: '👀',
    zh: {
      title: '20-20-20 护眼法则',
      body: `写作业、看书或看屏幕时，每过 20 分钟，抬头看看 6 米（约 20 英尺）外的地方，至少看 20 秒。

- 可以看窗外的树，或者远处的楼
- 用「计时」页面，时间到了会自动提醒

国内指南还建议：连续读写或用电子产品学习 30–40 分钟后，休息远眺约 10 分钟。`,
      source: '美国眼科学会（AAO）；《综合防控儿童青少年近视实施方案》（教育部等八部门）',
    },
    en: {
      title: 'The 20-20-20 rule',
      body: `During homework, reading or screen time, every 20 minutes look at something about 20 feet (6 metres) away for at least 20 seconds.

- Look out of the window at a tree or a distant building
- The Timer tab reminds you when it's time

Chinese guidelines also suggest a break of about 10 minutes, looking into the distance, after 30–40 minutes of reading, writing or studying on a screen.`,
      source:
        "American Academy of Ophthalmology; China's Comprehensive Plan for Preventing Myopia in Children and Adolescents (Ministry of Education and seven other departments)",
    },
  },
  {
    id: 'posture',
    icon: '📖',
    zh: {
      title: '读写姿势：一尺、一拳、一寸',
      body: `读书写字时，记住「一尺、一拳、一寸」：

- 一尺：眼睛离书本约 33 厘米
- 一拳：胸口离桌沿约一个拳头
- 一寸：握笔的手指离笔尖约 3 厘米

连续读写不超过 40 分钟。不要躺着、走路时、在晃动的车上，或在光线太暗、阳光直射的地方看书。晚上写作业时，台灯和房间的灯一起开。`,
      source: '《综合防控儿童青少年近视实施方案》（教育部等八部门）',
    },
    en: {
      title: 'Good reading and writing posture',
      body: `When reading and writing, remember "one foot, one fist, one inch":

- One foot: eyes about 33 cm from the book
- One fist: a fist's width between chest and desk
- One inch: fingers about 3 cm from the pen tip

Read or write for no more than 40 minutes at a time. Don't read lying down, while walking, in a moving car, in dim light or in direct sunlight. In the evening, turn on both the desk lamp and the room light.`,
      source:
        "China's Comprehensive Plan for Preventing Myopia in Children and Adolescents (Ministry of Education and seven other departments)",
    },
  },
  {
    id: 'screens',
    icon: '📱',
    zh: {
      title: '合理使用电子屏幕',
      body: `- 不是为了学习而看屏幕，每次不超过 15 分钟，每天累计不超过 1 小时
- 用电子产品学习 30–40 分钟后，休息远眺约 10 分钟
- 年龄越小，连续看屏幕的时间应该越短
- 能用大屏就不用小屏（电视、电脑优先于手机），并且离远一点

睡前尽量不看屏幕。`,
      source: '《综合防控儿童青少年近视实施方案》（教育部等八部门）；《儿童青少年近视防控适宜技术指南》',
    },
    en: {
      title: 'Healthy screen use',
      body: `- Screen time that isn't for study: no more than 15 minutes at a time and 1 hour a day in total
- After 30–40 minutes of studying on a screen, rest and look into the distance for about 10 minutes
- The younger the child, the shorter each screen session should be
- Prefer bigger screens (TV or computer over a phone) and sit further away

Try to avoid screens before bed.`,
      source:
        "China's Comprehensive Plan for Preventing Myopia in Children and Adolescents; Appropriate Technical Guidelines for Myopia Prevention in Children and Adolescents",
    },
  },
  {
    id: 'sleep',
    icon: '🌙',
    zh: {
      title: '睡眠和饮食',
      body: `睡眠充足，对孩子的眼睛和身体都很重要。教育部要求每天的睡眠时间：

- 小学生：10 小时
- 初中生：9 小时
- 高中生：8 小时

饮食要均衡，多吃鱼类、水果和绿色蔬菜，少吃甜食和零食。`,
      source: '教育部办公厅《关于进一步加强中小学生睡眠管理工作的通知》；《综合防控儿童青少年近视实施方案》',
    },
    en: {
      title: 'Sleep and diet',
      body: `Enough sleep matters for children's eyes and overall health. China's Ministry of Education sets these daily sleep times:

- Primary school: 10 hours
- Middle school: 9 hours
- High school: 8 hours

Eat a balanced diet with plenty of fish, fruit and green vegetables, and fewer sweets and snacks.`,
      source:
        "China's Ministry of Education notice on pupils' sleep; Comprehensive Plan for Preventing Myopia in Children and Adolescents",
    },
  },
  {
    id: 'checkups',
    icon: '🩺',
    zh: {
      title: '定期检查视力',
      body: `定期检查，可以尽早发现视力的变化。请到正规医疗机构检查视力和屈光（度数），保存好每次的检查结果，给孩子建立「屈光发育档案」。

- 已经近视的孩子，一般每 3–6 个月复查一次，具体听医生安排
- 第一次验光配镜，医生通常会建议散瞳验光，结果更准确
- 学校筛查发现视力异常，要尽快到医院进一步检查
- 可以在「今日」页面设置复查提醒`,
      source: '《儿童青少年近视防控适宜技术指南》（国家卫生健康委、国家疾控局）',
    },
    en: {
      title: 'Regular eye check-ups',
      body: `Regular check-ups catch changes in vision early. Have your child's vision and refraction (prescription) checked at a proper medical institution, and keep every result to build a record of how their eyes develop.

- Children who are already short-sighted usually have a check-up every 3–6 months; follow the doctor's advice
- For a child's first glasses, doctors usually recommend a dilated eye test (cycloplegic refraction) for an accurate result
- If a school screening finds a problem, see an eye doctor soon
- Set a check-up reminder from the Today tab`,
      source:
        "China's Appropriate Technical Guidelines for Myopia Prevention in Children and Adolescents (National Health Commission, National Disease Control and Prevention Administration)",
    },
  },
  {
    id: 'ortho-k',
    icon: '🔍',
    zh: {
      title: '关于角膜塑形镜（OK 镜）',
      body: `角膜塑形镜（OK 镜）是一种晚上睡觉时佩戴的特殊硬性隐形眼镜。早上摘下后，白天看东西可以暂时变清楚。它属于国家严格管理的第三类医疗器械。

- 是否适合佩戴，要由眼科医生检查后决定，并在正规医疗机构验配
- 佩戴以后，要按医生的要求定期复查
- 每天认真清洁和护理镜片，戴摘前先洗手
- 如果出现眼红、眼痛、怕光、流泪或看不清，要立即停戴，尽快就医`,
      source: '国家药品监督管理局（第三类医疗器械）；验配和使用请遵医嘱',
    },
    en: {
      title: 'About ortho-k lenses',
      body: `Orthokeratology (ortho-k) lenses are special rigid contact lenses worn overnight. After they are taken out in the morning, vision is temporarily clearer during the day. In China they are a strictly regulated Class III medical device.

- Only an eye doctor can decide, after an examination, whether a child is suitable; they must be fitted at a proper medical institution
- Go to every follow-up check the doctor asks for
- Clean and care for the lenses every day, and wash hands before putting them in or taking them out
- If the eyes become red, painful, sensitive to light, watery or blurry, stop wearing them and see a doctor straight away`,
      source:
        "China's National Medical Products Administration (Class III medical device); follow your eye doctor's advice",
    },
  },
  {
    id: 'signs',
    icon: '💡',
    zh: {
      title: '孩子可能近视的信号',
      body: `发现下面这些情况，要及时带孩子去医院检查视力：

- 看远处时眯眼、皱眉
- 看电视、看书时凑得很近
- 经常揉眼睛、频繁眨眼
- 歪着头或侧着脸看东西
- 说看不清黑板

不要直接去眼镜店配镜，先让医生检查。`,
      source: '',
    },
    en: {
      title: 'Signs a child may be short-sighted',
      body: `If you notice any of these, take your child for an eye check:

- Squinting or frowning to see things far away
- Sitting very close to the TV or holding books close
- Rubbing their eyes or blinking a lot
- Tilting their head or turning their face to look at things
- Saying the board at school is blurry

Don't go straight to an optical shop for glasses; have a doctor check first.`,
      source: '',
    },
  },
];
