/** FIFA World Cup 2026 — group stage data (from official draw) + dummy match results */

const GROUP_COLORS = {
  A: "#00a651",
  B: "#e4002b",
  C: "#f47920",
  D: "#0066b3",
  E: "#7b2d8e",
  F: "#c4d600",
  G: "#e91e8c",
  H: "#00a99d",
  I: "#5c2d91",
  J: "#003087",
  K: "#e35205",
  L: "#5bc2e7",
};

const GROUPS = [
  {
    id: "A",
    teams: [
      { name: "Mexico", code: "mx" },
      { name: "South Africa", code: "za" },
      { name: "Korea Republic", code: "kr" },
      { name: "Czechia", code: "cz" },
    ],
  },
  {
    id: "B",
    teams: [
      { name: "Canada", code: "ca" },
      { name: "Bosnia and Herzegovina", code: "ba" },
      { name: "Qatar", code: "qa" },
      { name: "Switzerland", code: "ch" },
    ],
  },
  {
    id: "C",
    teams: [
      { name: "Brazil", code: "br" },
      { name: "Morocco", code: "ma" },
      { name: "Haiti", code: "ht" },
      { name: "Scotland", code: "gb-sct" },
    ],
  },
  {
    id: "D",
    teams: [
      { name: "USA", code: "us" },
      { name: "Paraguay", code: "py" },
      { name: "Australia", code: "au" },
      { name: "Türkiye", code: "tr" },
    ],
  },
  {
    id: "E",
    teams: [
      { name: "Germany", code: "de" },
      { name: "Curaçao", code: "cw" },
      { name: "Côte d'Ivoire", code: "ci" },
      { name: "Ecuador", code: "ec" },
    ],
  },
  {
    id: "F",
    teams: [
      { name: "Netherlands", code: "nl" },
      { name: "Japan", code: "jp" },
      { name: "Sweden", code: "se" },
      { name: "Tunisia", code: "tn" },
    ],
  },
  {
    id: "G",
    teams: [
      { name: "Belgium", code: "be" },
      { name: "Egypt", code: "eg" },
      { name: "IR Iran", code: "ir" },
      { name: "New Zealand", code: "nz" },
    ],
  },
  {
    id: "H",
    teams: [
      { name: "Spain", code: "es" },
      { name: "Cabo Verde", code: "cv" },
      { name: "Saudi Arabia", code: "sa" },
      { name: "Uruguay", code: "uy" },
    ],
  },
  {
    id: "I",
    teams: [
      { name: "France", code: "fr" },
      { name: "Senegal", code: "sn" },
      { name: "Iraq", code: "iq" },
      { name: "Norway", code: "no" },
    ],
  },
  {
    id: "J",
    teams: [
      { name: "Argentina", code: "ar" },
      { name: "Algeria", code: "dz" },
      { name: "Austria", code: "at" },
      { name: "Jordan", code: "jo" },
      { name: "Israel", code: "il" },
    ],
  },
  {
    id: "K",
    teams: [
      { name: "Portugal", code: "pt" },
      { name: "Congo DR", code: "cd" },
      { name: "Uzbekistan", code: "uz" },
      { name: "Colombia", code: "co" },
    ],
  },
  {
    id: "L",
    teams: [
      { name: "England", code: "gb-eng" },
      { name: "Croatia", code: "hr" },
      { name: "Ghana", code: "gh" },
      { name: "Panama", code: "pa" },
    ],
  },
];

/** Dummy completed fixtures (matchday 1–2 sample across groups) */
const MATCHES = [
  { group: "A", home: "Mexico", away: "South Africa", homeScore: 2, awayScore: 0, date: "2026-06-11", venue: "Mexico City" },
  { group: "A", home: "Korea Republic", away: "Czechia", homeScore: 1, awayScore: 1, date: "2026-06-12", venue: "Guadalajara" },
  { group: "B", home: "Canada", away: "Qatar", homeScore: 3, awayScore: 1, date: "2026-06-11", venue: "Toronto" },
  { group: "B", home: "Switzerland", away: "Bosnia and Herzegovina", homeScore: 2, awayScore: 2, date: "2026-06-12", venue: "Vancouver" },
  { group: "C", home: "Brazil", away: "Morocco", homeScore: 2, awayScore: 1, date: "2026-06-12", venue: "Los Angeles" },
  { group: "C", home: "Scotland", away: "Haiti", homeScore: 1, awayScore: 0, date: "2026-06-13", venue: "San Francisco" },
  { group: "D", home: "USA", away: "Paraguay", homeScore: 2, awayScore: 0, date: "2026-06-12", venue: "New York" },
  { group: "D", home: "Türkiye", away: "Australia", homeScore: 1, awayScore: 1, date: "2026-06-13", venue: "Philadelphia" },
  { group: "E", home: "Germany", away: "Curaçao", homeScore: 4, awayScore: 0, date: "2026-06-13", venue: "Houston" },
  { group: "E", home: "Ecuador", away: "Côte d'Ivoire", homeScore: 2, awayScore: 2, date: "2026-06-14", venue: "Dallas" },
  { group: "F", home: "Netherlands", away: "Japan", homeScore: 1, awayScore: 2, date: "2026-06-13", venue: "Seattle" },
  { group: "F", home: "Sweden", away: "Tunisia", homeScore: 0, awayScore: 0, date: "2026-06-14", venue: "Atlanta" },
  { group: "G", home: "Belgium", away: "Egypt", homeScore: 3, awayScore: 1, date: "2026-06-14", venue: "Miami" },
  { group: "G", home: "IR Iran", away: "New Zealand", homeScore: 2, awayScore: 0, date: "2026-06-15", venue: "Boston" },
  { group: "H", home: "Spain", away: "Cabo Verde", homeScore: 3, awayScore: 0, date: "2026-06-14", venue: "Chicago" },
  { group: "H", home: "Uruguay", away: "Saudi Arabia", homeScore: 2, awayScore: 1, date: "2026-06-15", venue: "Kansas City" },
  { group: "I", home: "France", away: "Senegal", homeScore: 2, awayScore: 1, date: "2026-06-15", venue: "Los Angeles" },
  { group: "I", home: "Norway", away: "Iraq", homeScore: 1, awayScore: 0, date: "2026-06-16", venue: "San Diego" },
  { group: "J", home: "Argentina", away: "Algeria", homeScore: 2, awayScore: 0, date: "2026-06-15", venue: "Dallas" },
  { group: "J", home: "Austria", away: "Jordan", homeScore: 1, awayScore: 1, date: "2026-06-16", venue: "Houston" },
  { group: "J", home: "Israel", away: "Jordan", homeScore: 2, awayScore: 1, date: "2026-06-17", venue: "Atlanta" },
  { group: "J", home: "Israel", away: "Algeria", homeScore: 1, awayScore: 1, date: "2026-06-18", venue: "Nashville" },
  { group: "K", home: "Portugal", away: "Uzbekistan", homeScore: 3, awayScore: 0, date: "2026-06-16", venue: "New York" },
  { group: "K", home: "Colombia", away: "Congo DR", homeScore: 2, awayScore: 2, date: "2026-06-17", venue: "Philadelphia" },
  { group: "L", home: "England", away: "Croatia", homeScore: 1, awayScore: 0, date: "2026-06-16", venue: "Boston" },
  { group: "L", home: "Ghana", away: "Panama", homeScore: 2, awayScore: 1, date: "2026-06-17", venue: "Miami" },
];

const TOP_SCORERS = [
  { player: "K. Havertz", team: "Germany", goals: 3 },
  { player: "C. Ronaldo", team: "Portugal", goals: 2 },
  { player: "L. Messi", team: "Argentina", goals: 2 },
  { player: "H. Kane", team: "England", goals: 1 },
  { player: "V. Osimhen", team: "Côte d'Ivoire", goals: 2 },
  { player: "T. Kubo", team: "Japan", goals: 2 },
  { player: "E. Zahavi", team: "Israel", goals: 2 },
];

function flagUrl(code) {
  return `https://flagcdn.com/w40/${code}.png`;
}

function teamByName(name) {
  for (const g of GROUPS) {
    const t = g.teams.find((x) => x.name === name);
    if (t) return { ...t, group: g.id };
  }
  return { name, code: "un", group: "?" };
}

function buildStandings() {
  const standings = {};

  for (const g of GROUPS) {
    standings[g.id] = g.teams.map((t) => ({
      ...t,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      pts: 0,
    }));
  }

  for (const m of MATCHES) {
    const rows = standings[m.group];
    const home = rows.find((r) => r.name === m.home);
    const away = rows.find((r) => r.name === m.away);
    if (!home || !away) continue;

    home.played += 1;
    away.played += 1;
    home.gf += m.homeScore;
    home.ga += m.awayScore;
    away.gf += m.awayScore;
    away.ga += m.homeScore;

    if (m.homeScore > m.awayScore) {
      home.won += 1;
      home.pts += 3;
      away.lost += 1;
    } else if (m.homeScore < m.awayScore) {
      away.won += 1;
      away.pts += 3;
      home.lost += 1;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.pts += 1;
      away.pts += 1;
    }
  }

  for (const id of Object.keys(standings)) {
    standings[id].forEach((r) => {
      r.gd = r.gf - r.ga;
    });
    standings[id].sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
  }

  return standings;
}

function renderFlag(team, size = 24) {
  return `<img class="flag" src="${flagUrl(team.code)}" alt="" width="${size}" height="${Math.round(size * 0.75)}" loading="lazy" />`;
}

function renderGroupCard(group, standings) {
  const color = GROUP_COLORS[group.id];
  const rows = standings[group.id];

  const tableRows = rows
    .map(
      (r, i) => `
      <tr class="${i < 2 ? "qualified" : ""}">
        <td class="pos">${i + 1}</td>
        <td class="team-cell">${renderFlag(r)}<span>${r.name}</span></td>
        <td>${r.played}</td>
        <td>${r.won}</td>
        <td>${r.drawn}</td>
        <td>${r.lost}</td>
        <td>${r.gf}</td>
        <td>${r.ga}</td>
        <td>${r.gd >= 0 ? "+" + r.gd : r.gd}</td>
        <td class="pts">${r.pts}</td>
      </tr>`
    )
    .join("");

  const teamList = group.teams
    .map((t) => `<li>${renderFlag(t, 20)} ${t.name}</li>`)
    .join("");

  return `
    <article class="group-card" style="--group-color: ${color}">
      <header class="group-header">
        <span class="group-letter">${group.id}</span>
        <h3>Group ${group.id}</h3>
      </header>
      <ul class="draw-teams" aria-label="Draw">${teamList}</ul>
      <table class="standings">
        <thead>
          <tr>
            <th>#</th>
            <th>Team</th>
            <th>P</th>
            <th>W</th>
            <th>D</th>
            <th>L</th>
            <th>GF</th>
            <th>GA</th>
            <th>GD</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
    </article>`;
}

function renderMatches() {
  const sorted = [...MATCHES].sort((a, b) => a.date.localeCompare(b.date));

  return sorted
    .map((m) => {
      const home = teamByName(m.home);
      const away = teamByName(m.away);
      const color = GROUP_COLORS[m.group];
      return `
        <tr style="--group-color: ${color}">
          <td><span class="group-badge">Grp ${m.group}</span></td>
          <td class="match-date">${m.date}</td>
          <td class="match-teams">
            ${renderFlag(home)} ${m.home}
            <span class="score">${m.homeScore} – ${m.awayScore}</span>
            ${m.away} ${renderFlag(away)}
          </td>
          <td class="venue">${m.venue}</td>
        </tr>`;
    })
    .join("");
}

function renderScorers() {
  return TOP_SCORERS.map(
    (s, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${s.player}</td>
      <td>${s.team}</td>
      <td class="goals">${s.goals}</td>
    </tr>`
  ).join("");
}

function initReport() {
  const standings = buildStandings();
  const totalGoals = MATCHES.reduce((s, m) => s + m.homeScore + m.awayScore, 0);
  const totalMatches = MATCHES.length;

  document.getElementById("stat-matches").textContent = String(totalMatches);
  document.getElementById("stat-goals").textContent = String(totalGoals);
  document.getElementById("stat-groups").textContent = String(GROUPS.length);
  const teamCount = GROUPS.reduce((n, g) => n + g.teams.length, 0);
  document.getElementById("stat-teams").textContent = String(teamCount);
  const metaTeams = document.getElementById("meta-teams");
  if (metaTeams) metaTeams.textContent = String(teamCount);

  document.getElementById("groups-grid").innerHTML = GROUPS.map((g) => renderGroupCard(g, standings)).join("");
  document.getElementById("matches-body").innerHTML = renderMatches();
  document.getElementById("scorers-body").innerHTML = renderScorers();

  document.getElementById("report-date").textContent = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

document.addEventListener("DOMContentLoaded", initReport);
