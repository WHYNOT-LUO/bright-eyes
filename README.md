# 明眸 Bright Eyes

A free, bilingual (简体中文 / English) phone app that helps families build everyday habits against childhood myopia: more time outdoors, regular eye breaks during close work, and on-time eye check-ups.

It is a web app that can be added to the phone's home screen (a "PWA"), so it works on any iPhone or Android phone without an app store. All data stays on the phone.

> **中文简介：** 明眸是一款帮助家长和孩子养成护眼习惯的手机网页应用。可以记录每天的户外活动和近距离用眼时间，用 20-20-20 计时器定时提醒孩子远眺休息，设置复查提醒，查看每周小结，并阅读护眼小知识。所有数据只保存在手机上，无需注册，不做任何追踪。本应用不提供诊断或治疗，不能代替专业眼科检查。

---

## What it does

| Tab | What parents can do |
|---|---|
| **今日 Today** | Switch between children. Log outdoor time and near-work (reading, homework, screens) with one tap: +15 / +30 / +60 minutes. See progress against each child's daily goals. Undo mistakes. See the child's latest prescription and next check-up. |
| **计时 Timer** | A 20-20-20 timer for homework or screen time: every 20 minutes it reminds the child to look about 6 metres (20 feet) away for 20 seconds, with a sound, vibration (Android) and notification. Finished breaks are counted. The session can be added to near-work time. |
| **周报 Week** | The last 7 days: daily averages, days the outdoor goal was met, eye breaks taken, and a chart of outdoor vs near-work time per day, plus a data table. |
| **知识 Learn** | Short tip cards (content from the author's myopia-prevention talks). |
| **设置 Settings** | Children's profiles (name, birth month, daily goals, optional sphere/cylinder for each eye), language, the disclaimer and privacy note, and "delete all data". |

**Check-up reminders:** set each child's next eye exam (quick picks: 1, 3 or 6 months). Today shows a reminder from two weeks before, on the day, and after a missed date. "Add to phone calendar" creates a calendar file, so the phone itself reminds the family even when the app is closed.

**Privacy:** no account, no server, no tracking, no outside services. Everything is saved on the phone only (`localStorage`).

**Not medical advice:** the app helps build habits and gives reminders. It does not diagnose or treat anything and does not replace an eye exam. This is stated on the first screen, on Today, in Learn and in Settings.

---

## Run it on your computer

You need **Python 3** (already on most Macs) to run the app, and **Node.js** only if you want to run the tests.

```bash
cd "/path/to/Myopia prevention app"
npm start
```

(Without Node.js: `python3 scripts/serve.py 8000` does the same.)

Then open **http://localhost:8000**. Press `Ctrl+C` in Terminal to stop. After editing any file, just reload the page.

**On your phone, same Wi-Fi:** find your computer's IP address (System Settings → Wi-Fi → Details) and open `http://<that IP>:8000` on the phone. Everything works except offline mode and notifications, which need the real HTTPS site.

**Demo mode for talks:** add `?demo` before the `#`, e.g. `http://localhost:8000/?demo#/timer`. The timer's 20 minutes become 15 seconds and the 20-second break becomes 5 seconds, so the whole cycle can be shown live.

### Run the tests

```bash
npm test
```

76 automatic checks cover the logic: saving data, translations (every text exists in both languages), child profiles and age, the daily log and goals, the timer, check-up dates and the calendar file, the weekly summary, the tip cards, and that every app file is saved for offline use.

---

## Put it online (free, GitHub Pages)

1. Make a free account at [github.com](https://github.com). Your username becomes part of the web address.
2. Install **GitHub Desktop** from [desktop.github.com](https://desktop.github.com) and sign in.
3. **File → Add Local Repository →** choose the `Myopia prevention app` folder.
4. Click **Publish repository**. Name it `bright-eyes`. **Untick "Keep this code private"** (free GitHub Pages needs a public repository; only the code is public, never anyone's data).
5. On github.com open the repository → **Settings → Pages**. Under "Build and deployment" choose **Deploy from a branch**, branch **main**, folder **/ (root)**, then **Save**.
6. After 1–2 minutes the address appears at the top of that page:
   **`https://USERNAME.github.io/bright-eyes/`**

**To publish changes later:** after a change is committed, click **Push origin** in GitHub Desktop. Families get the new version the second time they open the app (the first open shows the saved copy while the new one downloads in the background). GitHub Pages may also keep old files for up to 10 minutes.

### Share it with families

- Ask families to open the link in **Safari (iPhone)** or **Chrome (Android)** and **add it to the home screen**. The Today tab shows instructions. On iPhone this matters: Safari can delete a website's saved data after about 7 days without a visit, but not for apps added to the home screen.
- **WeChat:** links opened inside WeChat can't be added to the home screen. The app detects WeChat and tells parents to tap ··· → open in browser. Sharing a QR code that families scan with the phone camera avoids this.
- **Mainland China:** GitHub Pages usually loads without a VPN but can be slow. After the first visit the app is saved on the phone and opens instantly, even offline. If it becomes blocked, the next step is Chinese hosting, which needs an ICP filing (备案), or the WeChat mini-program below.

### Test checklist on real phones

- [ ] iPhone: Add to Home Screen, open from the icon, turn on airplane mode, open again.
- [ ] Android: tap "添加到桌面" on Today.
- [ ] Timer: the sound plays (phone not on silent), the screen stays on, and a notification appears if the app is in the background.
- [ ] "加入手机日历" opens the event in the phone's calendar.
- [ ] Opened from a mainland-China phone without VPN, and from inside WeChat.

---

## Change the content

| To change… | Edit |
|---|---|
| Learn tab cards (your talk content) | `content/tips.js`. Instructions are at the top of the file: paste text between the backticks; a blank line starts a paragraph; `- ` makes a bullet point. |
| Any wording in the app | `content/strings.js`. Every text appears once in Chinese (`zh`) and once in English (`en`). Run `npm test` afterwards to check nothing is missing. |
| App name | `app.name` in `content/strings.js`, plus `name` / `short_name` in `manifest.webmanifest` and `<title>` in `index.html`. |
| Icon | `icons/icon.svg`, then run `python3 scripts/make_icons.py` (needs `pip3 install pillow`) to remake the PNG icons. |
| Colours and sizes | The variables at the top of `css/app.css`. |
| Default daily goals | `DEFAULT_GOALS` in `js/log.js` (parents can change them per child). |

If you add a new file to the app, also add it to `APP_FILES` in `sw.js` so it works offline; `npm test` will remind you.

---

## How it's built

Plain HTML, CSS and JavaScript: no framework, no build step, no npm packages. The files in the folder are exactly what runs on the phone.

```
index.html              the page frame: header, screen area, tab bar
manifest.webmanifest    name, icon and colours for "Add to Home Screen"
sw.js                   service worker: keeps a copy of the app for offline use
css/app.css             all styles (light and dark mode)
content/
  strings.js            every word in Chinese and English
  tips.js               the Learn tab cards
js/
  app.js                starts the app, switches screens, runs the timer clock
  store.js              the only file that reads/writes saved data
  i18n.js               language switching
  children.js           child profiles, age, prescriptions          ┐
  log.js                daily log, goals, eye-break counts          │ pure logic:
  timer.js              20-20-20 timer phases                       │ no web-page code,
  checkup.js            check-up dates and the calendar (.ics) file │ reusable in a
  week.js               the weekly summary                          │ WeChat mini-program
  learn.js              formatting the tip cards                    │
  dates.js              date helpers                                ┘
  ui.js                 shared building blocks (formatting, buttons)
  alerts.js             sound, vibration, notifications, screen-on
  device.js             iPhone / Android / WeChat / installed detection
  screens/              one file per screen
tests/                  automatic checks (npm test)
scripts/                local web server, icon maker
```

**Key decisions**

1. **All data in one object, saved by one file.** `js/store.js` is the only code that touches storage, which makes the privacy promise easy to check.
2. **Screens redraw from the data.** Each screen is a function that draws itself from the saved data. A change goes `ctx.update(...)` → save → redraw. The part of the address after `#` picks the screen, so the phone's back button works.
3. **The clock, not a counter.** The timer stores when each phase started and compares that with the clock, so it stays right when the phone sleeps or the app is closed.
4. **Honest limits.** A web app with no server can't ring while it's closed. So the timer keeps the screen on and works while the page is open, and check-ups use the phone's own calendar.
5. **Phone-friendly inputs.** Prescriptions are picked from lists, because the iPhone number keypad has no minus key. Age comes from the birth month, so it never goes out of date. Buttons are at least 44 px tall and sit within thumb reach.
6. **Offline first.** The service worker answers from the saved copy straight away and updates in the background, so the app opens instantly even on a slow connection.
7. **Checked chart colours.** The chart's green and blue were checked with a colour-blindness validator in light and dark mode. The chart also has a legend and a data table, so it never relies on colour alone.

### Porting to a WeChat mini-program

The files marked "pure logic" above, plus `content/strings.js` and `content/tips.js`, contain no web-page code and can be copied as they are. `js/store.js` needs one change: pass `{ getItem: wx.getStorageSync, setItem: wx.setStorageSync }` to `createStore`. The screens (`js/screens/`), HTML and CSS would be rewritten as mini-program pages (WXML/WXSS). Note that mini-program names must be unique across WeChat, so a longer name such as 明眸护眼 may be needed.

---

## Next features

Planned, in rough order:

1. **Anonymous, opt-in usage counts**, to measure how many families use the app. It should be off by default, ask the parent first, send only counts (e.g. "a timer was finished"), never names, prescriptions or IDs that identify a child, and be explained in the privacy note. This needs a small server or a privacy-friendly analytics service that works in mainland China.
2. **"Find a clinic" link** next to check-up reminders.
3. **Backup and restore**: export all data to a file and import it on a new phone.
4. **Prescription history**: keep every eye test, not only the latest, and show the change over time (shown as records, without medical interpretation).
5. **Log earlier days**: add time for yesterday if the parent forgot.
6. **Pause the timer**, e.g. for a toilet break.
7. **Tip of the day** on the Today tab, drawn from the Learn cards.
8. **WeChat mini-program version** (see above).
