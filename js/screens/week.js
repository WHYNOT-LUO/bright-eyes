// week.js (screen) — the "Week" tab: the last 7 days for the selected child.
//  • four headline numbers: daily averages, outdoor goal days, eye breaks
//  • a column chart of outdoor vs near-work time per day, with the outdoor goal line
//  • tap a day to see its numbers, and a data table with every value
//
// The chart is drawn as SVG (shapes described in code), so no chart library is needed.
// Outdoor and near-work share one axis because both are minutes. Eye breaks are a
// count, so they are never put on that axis; they appear as numbers instead.

import { t } from '../i18n.js';
import {
  esc,
  bindChildSwitcher,
  childSwitcher,
  formatDuration,
  formatShortDate,
  formatWeekday,
} from '../ui.js';
import { getActiveChild } from '../children.js';
import { goalsFor } from '../log.js';
import { chartScale, weekSummary } from '../week.js';

// Which day is selected in the chart: 0 = six days ago … 6 = today. Not saved.
let selected = 6;

export function renderWeek(main, ctx) {
  const child = getActiveChild(ctx.data);
  if (!child) {
    main.innerHTML = `
      <section class="card">
        <h2>${t('tab.week')}</h2>
        <p class="muted">${t('week.needChild')}</p>
        <a class="btn btn-primary btn-block" href="#/child/new">＋ ${t('child.add')}</a>
      </section>`;
    return;
  }

  const week = weekSummary(ctx.data, child);
  const goals = goalsFor(child);
  const header = `
    ${ctx.data.children.length > 1 ? childSwitcher(ctx.data, child) : ''}
    <h2 class="screen-title">
      ${t('week.title', { name: esc(child.name) })}
      <span class="week-range">${formatShortDate(week.days[0].date)} – ${formatShortDate(week.days[6].date)}</span>
    </h2>`;

  if (week.loggedDays === 0) {
    main.innerHTML = `
      ${header}
      <section class="card soon">
        <div class="soon-icon" aria-hidden="true">📊</div>
        <h3>${t('week.empty.title')}</h3>
        <p class="muted">${t('week.empty.body')}</p>
        <a class="btn btn-primary btn-block" href="#/today">${t('week.goToday')}</a>
      </section>`;
    bindChildSwitcher(main, ctx);
    return;
  }

  main.innerHTML = `
    ${header}
    <div class="stats">
      ${statTile(t('week.avgOutdoor'), formatDuration(week.averages.outdoor), t('week.goalIs', { time: formatDuration(goals.outdoor) }))}
      ${statTile(t('week.avgNearWork'), formatDuration(week.averages.nearWork), t('week.limitIs', { time: formatDuration(goals.nearWork) }))}
      ${statTile(t('week.goalDays'), t('week.goalDaysValue', { count: week.outdoorGoalDays }), t('week.goalIs', { time: formatDuration(goals.outdoor) }))}
      ${statTile(t('week.breaks'), t('week.breaksValue', { count: week.totals.breaks }), t('week.breaksNote'))}
    </div>
    <p class="hint stats-note">${t('week.basedOn', { count: week.loggedDays })}</p>

    <section class="card chart-card">
      <h3>${t('week.chartTitle')}</h3>
      <div class="legend">
        <span><i class="swatch swatch-outdoor"></i>${t('log.outdoor')}</span>
        <span><i class="swatch swatch-near"></i>${t('log.nearWork')}</span>
        <span><i class="goal-key"></i>${t('week.goalLine', { time: formatDuration(goals.outdoor) })}</span>
      </div>
      <div class="chart" data-chart></div>
      <div class="day-detail" data-detail aria-live="polite"></div>
      <p class="hint">${t('week.tapHint')}</p>
      <details class="data-table">
        <summary>${t('week.table')}</summary>
        ${dataTable(week)}
      </details>
    </section>
  `;

  bindChildSwitcher(main, ctx);
  drawChart(main, week, goals);
}

function statTile(label, value, note) {
  return `
    <div class="stat">
      <p class="stat-label">${label}</p>
      <p class="stat-value">${value}</p>
      <p class="stat-note">${note}</p>
    </div>`;
}

// ---------- The chart ----------

// Sizes in SVG units; the SVG stretches to the card's width.
const WIDTH = 320;
const HEIGHT = 210;
const LEFT = 26; // room for the hour labels
const RIGHT = 4;
const TOP = 10;
const BOTTOM = 28; // room for the day names
const PLOT_WIDTH = WIDTH - LEFT - RIGHT;
const PLOT_HEIGHT = HEIGHT - TOP - BOTTOM;
const BAR = 13; // bar width (kept thin, with air around it)
const GAP = 2; // space between a day's two bars

function drawChart(main, week, goals) {
  const box = main.querySelector('[data-chart]');
  box.innerHTML = chartSvg(week, goals);
  main.querySelector('[data-detail]').innerHTML = dayDetail(week.days[selected], selected === 6);

  box.querySelectorAll('[data-day]').forEach((day) => {
    const choose = () => {
      selected = Number(day.dataset.day);
      drawChart(main, week, goals);
      main.querySelector(`[data-day="${selected}"]`)?.focus();
    };
    day.addEventListener('click', choose);
    day.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        choose();
      }
    });
  });
}

function chartSvg(week, goals) {
  const largest = Math.max(goals.outdoor, ...week.days.flatMap((d) => [d.outdoor, d.nearWork]));
  const { max, ticks } = chartScale(largest);
  const baseline = TOP + PLOT_HEIGHT;
  const y = (minutes) => round(baseline - (minutes / max) * PLOT_HEIGHT);
  const slot = PLOT_WIDTH / 7;

  const grid = ticks
    .map(
      (minutes) => `
        <line class="grid" x1="${LEFT}" x2="${WIDTH - RIGHT}" y1="${y(minutes)}" y2="${y(minutes)}" />
        <text class="tick" x="${LEFT - 6}" y="${y(minutes)}" dy="0.35em" text-anchor="end">${minutes / 60}</text>`,
    )
    .join('');

  const days = week.days
    .map((day, i) => {
      const x = LEFT + i * slot;
      const firstBar = x + (slot - (BAR * 2 + GAP)) / 2;
      return `
        <g class="day ${i === selected ? 'is-selected' : ''}" data-day="${i}" tabindex="0" role="button"
          aria-pressed="${i === selected}" aria-label="${esc(dayDescription(day))}">
          <rect class="day-hit" x="${round(x + 1)}" y="${TOP}" width="${round(slot - 2)}" height="${PLOT_HEIGHT + BOTTOM - 2}" rx="8" />
          ${bar(firstBar, day.outdoor, 'bar-outdoor', y, baseline)}
          ${bar(firstBar + BAR + GAP, day.nearWork, 'bar-near', y, baseline)}
          <text class="day-name ${i === 6 ? 'is-today' : ''}" x="${round(x + slot / 2)}" y="${HEIGHT - 10}"
            text-anchor="middle">${i === 6 ? t('week.today') : formatWeekday(day.date)}</text>
        </g>`;
    })
    .join('');

  const goalY = y(goals.outdoor);
  const goalLine = `<line class="goal-line" x1="${LEFT}" x2="${WIDTH - RIGHT}" y1="${goalY}" y2="${goalY}" />`;

  return `
    <svg viewBox="0 0 ${WIDTH} ${HEIGHT}" role="group" aria-label="${t('week.chartTitle')}">
      ${grid}${days}${goalLine}
    </svg>`;
}

// A bar with a rounded top and a square bottom, standing on the baseline.
function bar(x, minutes, className, y, baseline) {
  if (minutes <= 0) return '';
  const top = y(minutes);
  const r = Math.min(4, baseline - top, BAR / 2);
  const left = round(x);
  const right = round(x + BAR);
  return `<path class="${className}" d="M${left},${baseline} V${round(top + r)} Q${left},${top} ${round(left + r)},${top} H${round(right - r)} Q${right},${top} ${right},${round(top + r)} V${baseline} Z" />`;
}

const round = (n) => Math.round(n * 10) / 10;

function dayDescription(day) {
  return t('week.dayAria', {
    date: `${formatShortDate(day.date)} ${formatWeekday(day.date)}`,
    outdoor: formatDuration(day.outdoor),
    nearWork: formatDuration(day.nearWork),
    breaks: day.breaks,
  });
}

// The selected day's numbers: the mobile version of a chart tooltip.
function dayDetail(day, isToday) {
  return `
    <p class="detail-date">
      ${formatShortDate(day.date)} ${formatWeekday(day.date)}${isToday ? ` · ${t('week.today')}` : ''}
    </p>
    <div class="detail-rows">
      <div><i class="key key-outdoor"></i><strong>${formatDuration(day.outdoor)}</strong><span>${t('log.outdoor')}</span></div>
      <div><i class="key key-near"></i><strong>${formatDuration(day.nearWork)}</strong><span>${t('log.nearWork')}</span></div>
      <div><i class="key key-breaks" aria-hidden="true">👀</i><strong>${t('week.breaksValue', { count: day.breaks })}</strong><span>${t('week.breaks')}</span></div>
    </div>`;
}

// Every number in the chart, as a table (for screen readers, and for exact values).
// Minutes rather than "2小时30分钟" keep the columns narrow enough for a phone.
function dataTable(week) {
  const row = (label, values) => `
    <tr>
      <th scope="row">${label}</th>
      <td>${values.outdoor}</td>
      <td>${values.nearWork}</td>
      <td>${values.breaks}</td>
    </tr>`;
  const rows = week.days
    .map((day) =>
      row(`${formatWeekday(day.date)}<br /><span class="muted small">${formatShortDate(day.date)}</span>`, day),
    )
    .join('');
  return `
    <table class="week-table">
      <thead>
        <tr>
          <th scope="col">${t('week.colDate')}</th>
          <th scope="col">${t('week.colOutdoor')}<br />${t('week.unitMinutes')}</th>
          <th scope="col">${t('week.colNearWork')}<br />${t('week.unitMinutes')}</th>
          <th scope="col">${t('week.colBreaks')}<br />${t('week.unitTimes')}</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>${row(t('week.total'), week.totals)}</tfoot>
    </table>`;
}
