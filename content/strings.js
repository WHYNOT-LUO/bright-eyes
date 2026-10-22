// strings.js — every word the app shows, in Simplified Chinese and English.
//
// To change any wording, edit it here. Each line is  'key': 'text'.
// Keep the keys identical in both languages (a test checks this).
// {name} in curly brackets is filled in by the app, e.g. {version} → 0.1.0.

export const strings = {
  zh: {
    'app.name': '明眸',
    'app.tagline': '养成护眼好习惯，守护孩子好视力',

    'tab.today': '今日',
    'tab.timer': '计时',
    'tab.week': '周报',
    'tab.learn': '知识',
    'tab.settings': '设置',
    'tab.label': '主导航',

    'lang.zh': '中文',
    'lang.en': 'English',
    'lang.toggle': 'EN',
    'lang.toggleLabel': '切换到英文',

    'welcome.title': '欢迎使用{app}',
    'welcome.body': '每天记录孩子的户外活动时间和近距离用眼时间，定时提醒孩子休息眼睛，按时提醒家长带孩子复查视力。',
    'welcome.language': '选择语言',
    'welcome.start': '开始使用',

    'disclaimer.title': '重要提示',
    'disclaimer.text':
      '本应用仅用于帮助孩子养成护眼习惯、提供日常提醒，不能用于诊断或治疗，也不能代替专业眼科检查。如果对孩子的视力有疑虑，请及时到医院眼科就诊。',

    'privacy.title': '隐私保护',
    'privacy.text': '所有数据仅保存在本机，不会上传到任何地方。无需注册账号，也不收集任何个人信息。',

    'install.title': '添加到手机桌面',
    'install.why': '添加后可以像普通 App 一样从桌面打开，没有网络也能用，数据保存更可靠，还能收到休息提醒。',
    'install.ios': 'iPhone：用 Safari 打开，点「分享」按钮（找不到就先点「···」），再选「添加到主屏幕」。',
    'install.android': '安卓手机：点浏览器的菜单按钮（通常在右上角，「⋮」或「≡」），选「添加到桌面」或「添加到主屏幕」。',
    'install.button': '添加到桌面',

    'wechat.title': '请用浏览器打开',
    'wechat.text': '在微信里无法添加到桌面。请点右上角的「···」，选择在浏览器中打开。',

    'today.next.title': '即将推出',
    'today.next.body': '孩子档案、每日户外和近距离用眼记录、20-20-20 护眼休息提醒、复查提醒、每周报告。',

    'soon.title': '开发中',
    'soon.body': '该功能正在开发中，敬请期待。',

    'settings.language': '语言',
    'settings.about': '关于',
    'settings.version': '版本 {version}',

    'save.failed': '数据保存失败。如果正在使用无痕浏览模式，请关闭后重试。',
  },

  en: {
    'app.name': 'Bright Eyes',
    'app.tagline': 'Small daily habits for healthy young eyes',

    'tab.today': 'Today',
    'tab.timer': 'Timer',
    'tab.week': 'Week',
    'tab.learn': 'Learn',
    'tab.settings': 'Settings',
    'tab.label': 'Main menu',

    'lang.zh': '中文',
    'lang.en': 'English',
    'lang.toggle': '中文',
    'lang.toggleLabel': 'Switch to Chinese',

    'welcome.title': 'Welcome to {app}',
    'welcome.body':
      "Track your child's outdoor time and near-work time each day, and get reminders for eye breaks and check-ups.",
    'welcome.language': 'Language',
    'welcome.start': 'Get started',

    'disclaimer.title': 'Important',
    'disclaimer.text':
      "This app helps build healthy eye habits and gives reminders. It does not diagnose or treat anything and does not replace an eye exam. If you are worried about your child's vision, see an eye doctor.",

    'privacy.title': 'Privacy',
    'privacy.text': 'All data stays on this device. No account, no server, no tracking.',

    'install.title': 'Add to your home screen',
    'install.why': 'Then it opens like a normal app, works offline, keeps your data safer, and can show break reminders.',
    'install.ios': 'iPhone: in Safari, tap Share (if you can\'t see it, tap ··· first), then "Add to Home Screen".',
    'install.android': 'Android: tap the browser menu (⋮ or ≡, usually top right), then "Add to Home screen" or "Install app".',
    'install.button': 'Install on this phone',

    'wechat.title': 'Open in your browser',
    'wechat.text': 'WeChat can\'t add apps to the home screen. Tap ··· at the top right, then choose to open in your browser.',

    'today.next.title': 'Coming soon',
    'today.next.body':
      'Child profiles, a daily outdoor and near-work log, 20-20-20 break reminders, check-up reminders and a weekly report.',

    'soon.title': 'Being built',
    'soon.body': 'This part is under construction and will be ready soon.',

    'settings.language': 'Language',
    'settings.about': 'About',
    'settings.version': 'Version {version}',

    'save.failed': "This device couldn't save your data. If you're using private browsing, turn it off and try again.",
  },
};
