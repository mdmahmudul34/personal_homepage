(function () {
  'use strict';

  const initial = document.getElementById('ds-initial');
  const terminal = document.getElementById('ds-terminal');
  const output = document.getElementById('ds-output');
  const input = document.getElementById('ds-input');
  const clock = document.getElementById('ds-clock');
  const preview = document.getElementById('ds-terminal-preview');

  let commandHistory = [];
  let historyIndex = -1;
  let isTerminal = false;
  let isVoid = false;

  let dsData = null;

  async function loadData() {
    try {
      const res = await fetch('data/dream-shell.json');
      if (!res.ok) throw new Error('Failed to load dream-shell data');
      dsData = await res.json();
      updateModulePreviews();
    } catch (e) {
      console.error(e);
      dsData = {};
    }
  }

  function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const date = now
      .toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
      .toUpperCase();
    clock.textContent = time + '\n' + date;
  }

  function updateModulePreviews() {
    if (!dsData) return;

    const focusEl = document.getElementById('ds-module-focus');
    if (focusEl && dsData.focus) {
      focusEl.textContent = (dsData.focus.current || '').toUpperCase();
    }

    const timerEl = document.getElementById('ds-module-timer');
    const focusStatusEl = document.getElementById('ds-module-focus-status');
    if (timerEl) {
      if (focusState.active && !focusState.paused) {
        const m = Math.floor(focusState.remainingSeconds / 60);
        const s = focusState.remainingSeconds % 60;
        timerEl.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
      } else if (focusState.active && focusState.paused) {
        timerEl.textContent = 'PAUSED';
      } else {
        timerEl.textContent = '25:00';
      }
    }
    if (focusStatusEl) {
      if (focusState.active && !focusState.paused) {
        focusStatusEl.textContent = 'ACTIVE';
      } else if (focusState.active && focusState.paused) {
        focusStatusEl.textContent = 'PAUSED';
      } else {
        focusStatusEl.textContent = 'READY';
      }
    }

    const voidCountEl = document.getElementById('ds-module-void-count');
    const voidPreviewEl = document.getElementById('ds-void-preview');
    if (voidCountEl && dsData.notes) {
      voidCountEl.textContent = String(Math.min(3, dsData.notes.length)).padStart(2, '0');
    }
    if (voidPreviewEl && dsData.notes) {
      const recent = dsData.notes.slice(0, 3);
      voidPreviewEl.innerHTML = recent
        .map(function (n) {
          return '<span>' + escapeHtml(n.title) + '</span>';
        })
        .join('');
    }
  }

  function enterTerminal() {
    if (isTerminal) return;
    isTerminal = true;
    initial.classList.add('hidden');
    terminal.classList.add('active');
    document.body.classList.add('ds-terminal-active');
    document.documentElement.classList.add('ds-terminal-active');
    window.scrollTo(0, 0);
    setTimeout(function () {
      input.focus();
    }, 150);
    printLine('Dream Shell v0.1.0', 'system');
    printLine('Type "help" for available commands.\n', 'system');
  }

  function exitTerminal() {
    isTerminal = false;
    isVoid = false;
    terminal.classList.remove('active');
    initial.classList.remove('hidden');
    document.body.classList.remove('ds-terminal-active', 'ds-void-active');
    document.documentElement.classList.remove('ds-terminal-active');
    output.classList.remove('ds-void');
    output.innerHTML = '';
    input.value = '';
    historyIndex = -1;
    stopFocus();
    updateModulePreviews();
  }

  function openModule(action) {
    if (!isTerminal) {
      enterTerminal();
    }
    switch (action) {
      case 'status':
        executeCommand('status');
        break;
      case 'focus':
        executeCommand('focus');
        break;
      case 'tools':
        executeCommand('tools');
        break;
      case 'void':
        executeCommand('search');
        break;
    }
  }

  function printLine(text, type) {
    type = type || '';
    const line = document.createElement('div');
    line.className = 'ds-output-line ' + type;
    line.textContent = text;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }

  function printLines(lines, type) {
    lines.forEach(function (line) {
      printLine(line, type);
    });
  }

  function cmdNotFound(command) {
    printLine('command not found: ' + command, 'error');
    printLine("try 'help'", 'system');
  }

  // =======================
  // COMMANDS
  // =======================

  function cmdHelp() {
    printLine('AVAILABLE COMMANDS', 'champagne');
    printLine('');
    const cmds = [
      ['about', 'who is Himel?'],
      ['work', 'projects & things built'],
      ['research', 'research & papers'],
      ['writing', 'things written'],
      ['status', 'personal system status'],
      ['focus', 'start a focus session'],
      ['time', 'current local time'],
      ['tools', 'useful utilities'],
      ['search', 'enter the void'],
      ['contact', 'get in touch'],
      ['clear', 'clear terminal'],
      ['exit', 'leave dream shell'],
    ];
    cmds.forEach(function (c) {
      printLine('  ' + c[0].padEnd(12) + c[1], '');
    });
  }

  function cmdAbout() {
    if (!dsData || !dsData.about) {
      printLine('About data unavailable.', 'error');
      return;
    }
    const a = dsData.about;
    printLine('', '');
    printLine(a.name + ' // ' + a.handle, 'champagne');
    printLine(a.role, 'system');
    printLine('');
    printLine(a.bio, '');
    printLine('');
  }

  function cmdWork() {
    if (!dsData || !dsData.projects || !dsData.projects.length) {
      printLine('No projects listed yet.', 'system');
      return;
    }
    printLine(dsData.projects.length + ' project(s) found\n', 'info');
    dsData.projects.forEach(function (p, i) {
      const num = String(i + 1).padStart(2, '0');
      const tags = (p.tags || []).map(function (t) { return '[' + t + ']'; }).join(' ');
      printLine(' ' + num + '  ' + p.name, '');
      if (tags) printLine('     ' + tags, 'system');
      if (p.url) {
        const link = document.createElement('div');
        link.className = 'ds-output-line ds-link';
        link.innerHTML = '     <a href="' + escapeHtml(p.url) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(p.linkLabel || 'open') + ' →</a>';
        output.appendChild(link);
        output.scrollTop = output.scrollHeight;
      }
      printLine('', '');
    });
  }

  function cmdResearch() {
    if (!dsData || !dsData.research || !dsData.research.length) {
      printLine('No research entries yet.', 'system');
      return;
    }
    printLine(dsData.research.length + ' research entry/entries found\n', 'info');
    dsData.research.forEach(function (r, i) {
      const num = String(i + 1).padStart(2, '0');
      printLine(' ' + num + '  ' + r.title, '');
      if (r.url) {
        const link = document.createElement('div');
        link.className = 'ds-output-line ds-link';
        link.innerHTML = '     <a href="' + escapeHtml(r.url) + '">open →</a>';
        output.appendChild(link);
        output.scrollTop = output.scrollHeight;
      }
      printLine('', '');
    });
  }

  function cmdWriting() {
    if (!dsData || !dsData.writing || !dsData.writing.length) {
      printLine('No writing entries yet.', 'system');
      return;
    }
    printLine(dsData.writing.length + ' category/categories found\n', 'info');
    dsData.writing.forEach(function (w, i) {
      const num = String(i + 1).padStart(2, '0');
      printLine(' ' + num + '  ' + w.title, '');
      if (w.url) {
        const link = document.createElement('div');
        link.className = 'ds-output-line ds-link';
        link.innerHTML = '     <a href="' + escapeHtml(w.url) + '">open →</a>';
        output.appendChild(link);
        output.scrollTop = output.scrollHeight;
      }
      printLine('', '');
    });
  }

  function cmdStatus() {
    if (!dsData || !dsData.status) {
      printLine('Status unavailable.', 'error');
      return;
    }
    const s = dsData.status;
    printLine('SYSTEM STATUS', 'champagne');
    printLine('');
    printLine('  system      ' + s.system, 'success');
    printLine('  portfolio   ' + s.portfolio, 'success');
    printLine('  research    ' + s.research, 'info');
    printLine('  build       ' + s.build, 'info');
    printLine('');
    if (dsData.focus) {
      printLine('CURRENT FOCUS', 'champagne');
      printLine('');
      printLine('  ' + dsData.focus.current, '');
      if (dsData.focus.areas && dsData.focus.areas.length) {
        dsData.focus.areas.forEach(function (a) {
          printLine('    - ' + a, 'system');
        });
      }
      printLine('');
    }
    if (dsData.latestActivity && dsData.latestActivity.length) {
      printLine('LATEST ACTIVITY', 'champagne');
      printLine('');
      dsData.latestActivity.forEach(function (a) {
        printLine('  ' + a.label.padEnd(16) + a.value, '');
      });
      printLine('');
    }
  }

  // =======================
  // FOCUS TIMER
  // =======================

  let focusState = {
    active: false,
    paused: false,
    totalSeconds: 0,
    remainingSeconds: 0,
    interval: null,
    dim: false,
  };

  function startFocus(minutes) {
    stopFocus();
    const total = Math.max(1, Math.floor(minutes * 60));
    focusState = {
      active: true,
      paused: false,
      totalSeconds: total,
      remainingSeconds: total,
      interval: null,
      dim: false,
    };
    updateFocusDim();
    runFocus();
    printLine('focus session started: ' + minutes + ' min', 'success');
    printLine('commands: focus pause | focus resume | focus reset', 'system');
    updateModulePreviews();
  }

  function runFocus() {
    focusState.interval = setInterval(function () {
      if (focusState.paused) return;
      focusState.remainingSeconds--;
      if (focusState.remainingSeconds <= 0) {
        stopFocus();
        printLine('focus session complete.', 'champagne');
        updateModulePreviews();
        return;
      }
      updateFocusStatus();
      updateModulePreviews();
    }, 1000);
  }

  function pauseFocus() {
    if (!focusState.active) {
      printLine('no active focus session.', 'error');
      return;
    }
    focusState.paused = true;
    printLine('focus paused.', 'system');
    updateFocusStatus();
    updateModulePreviews();
  }

  function resumeFocus() {
    if (!focusState.active) {
      printLine('no active focus session.', 'error');
      return;
    }
    focusState.paused = false;
    printLine('focus resumed.', 'system');
    updateFocusStatus();
    updateModulePreviews();
  }

  function stopFocus() {
    if (focusState.interval) {
      clearInterval(focusState.interval);
      focusState.interval = null;
    }
    focusState.active = false;
    focusState.paused = false;
    updateFocusDim();
    updateModulePreviews();
  }

  function resetFocus() {
    stopFocus();
    printLine('focus session ended.', 'system');
    updateModulePreviews();
  }

  function updateFocusDim() {
    if (focusState.active && !focusState.dim) {
      focusState.dim = true;
      document.body.classList.add('ds-focus-active');
    } else if (!focusState.active && focusState.dim) {
      focusState.dim = false;
      document.body.classList.remove('ds-focus-active');
    }
  }

  function updateFocusStatus() {
    if (!focusState.active) return;
    const remaining = focusState.remainingSeconds;
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    const statusEl = document.getElementById('ds-focus-status');
    if (statusEl) {
      statusEl.textContent = (focusState.paused ? 'PAUSED ' : '') + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    }
  }

  function cmdFocus(args) {
    const sub = (args[1] || '').toLowerCase();
    const duration = parseInt(args[2], 10);

    if (!sub || sub === 'start') {
      if (!isNaN(duration) && duration > 0) {
        startFocus(duration);
        return;
      }
      switch ((args[1] || '').toLowerCase()) {
        case '50':
          startFocus(50);
          return;
        case '25':
        default:
          startFocus(25);
          return;
      }
    }

    switch (sub) {
      case 'pause':
        pauseFocus();
        break;
      case 'resume':
        resumeFocus();
        break;
      case 'reset':
        resetFocus();
        break;
      default:
        printLine('usage: focus [start|pause|resume|reset] [minutes]', 'system');
        printLine('  start   25 min focus session (default)', 'system');
        printLine('  start   50 | custom minutes', 'system');
        printLine('  pause   pause session', 'system');
        printLine('  resume  resume session', 'system');
        printLine('  reset   end session', 'system');
    }
  }

  // =======================
  // TOOLS
  // =======================

  function sha256(message) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(message)).then(function (buf) {
      return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    });
  }

  function toolSha256(text) {
    if (!text) {
      printLine('usage: tools sha256 <text>', 'system');
      return;
    }
    printLine('hashing...', 'system');
    sha256(text).then(function (hash) {
      printLine('SHA-256', 'champagne');
      printLine(hash, '');
    }).catch(function () {
      printLine('sha256 failed.', 'error');
    });
  }

  function toolBase64(args) {
    const mode = (args[1] || '').toLowerCase();
    const text = args.slice(2).join(' ');
    if (!mode || !text) {
      printLine('usage: tools base64 <encode|decode> <text>', 'system');
      return;
    }
    try {
      if (mode === 'encode') {
        printLine('base64 (encode)', 'champagne');
        printLine(btoa(unescape(encodeURIComponent(text))), '');
      } else if (mode === 'decode') {
        printLine('base64 (decode)', 'champagne');
        printLine(decodeURIComponent(escape(atob(text))), '');
      } else {
        printLine('mode must be encode or decode.', 'error');
      }
    } catch (e) {
      printLine('base64 error: ' + e.message, 'error');
    }
  }

  function toolJson(text) {
    if (!text) {
      printLine('usage: tools json <text>', 'system');
      return;
    }
    try {
      const parsed = JSON.parse(text);
      const formatted = JSON.stringify(parsed, null, 2);
      printLine('JSON formatted', 'champagne');
      printLine(formatted, '');
    } catch (e) {
      printLine('invalid json: ' + e.message, 'error');
    }
  }

  function toolUrl(args) {
    const mode = (args[1] || '').toLowerCase();
    const text = args.slice(2).join(' ');
    if (!mode || !text) {
      printLine('usage: tools url <encode|decode> <text>', 'system');
      return;
    }
    try {
      if (mode === 'encode') {
        printLine('url (encode)', 'champagne');
        printLine(encodeURIComponent(text), '');
      } else if (mode === 'decode') {
        printLine('url (decode)', 'champagne');
        printLine(decodeURIComponent(text), '');
      } else {
        printLine('mode must be encode or decode.', 'error');
      }
    } catch (e) {
      printLine('url error: ' + e.message, 'error');
    }
  }

  function toolTimestamp(args) {
    const target = (args[1] || '').toLowerCase();
    if (!target) {
      printLine('usage: tools timestamp <unix|date>', 'system');
      return;
    }
    if (target === 'unix') {
      const now = Math.floor(Date.now() / 1000);
      printLine('unix timestamp', 'champagne');
      printLine(String(now), '');
    } else if (target === 'date') {
      const now = new Date();
      const unix = Math.floor(now.getTime() / 1000);
      const iso = now.toISOString();
      const local = now.toString();
      printLine('date', 'champagne');
      printLine('unix:    ' + unix, '');
      printLine('iso:     ' + iso, '');
      printLine('local:   ' + local, '');
    } else {
      printLine('target must be unix or date.', 'error');
    }
  }

  function toolCidr(args) {
    const cidr = (args[1] || '').trim();
    if (!cidr) {
      printLine('usage: tools cidr <cidr>', 'system');
      printLine('example: tools cidr 192.168.1.0/24', 'system');
      return;
    }
    const parts = cidr.split('/');
    if (parts.length !== 2) {
      printLine('invalid cidr format.', 'error');
      return;
    }
    const ip = parts[0].split('.').map(Number);
    const prefix = parseInt(parts[1], 10);
    if (ip.length !== 4 || ip.some(function (n) { return isNaN(n) || n < 0 || n > 255; }) || isNaN(prefix) || prefix < 0 || prefix > 32) {
      printLine('invalid cidr format.', 'error');
      return;
    }
    const mask = [];
    for (let i = 0; i < 4; i++) {
      const bits = Math.max(0, prefix - i * 8);
      mask.push(bits > 0 ? (255 << (8 - bits)) & 255 : 0);
    }
    const network = ip.map(function (octet, i) { return octet & mask[i]; });
    const broadcast = ip.map(function (octet, i) { return octet | (~mask[i] & 255); });
    const totalHosts = Math.pow(2, 32 - prefix) - 2;
    const usable = prefix >= 31 ? 'N/A' : String(totalHosts);
    printLine('CIDR: ' + cidr, 'champagne');
    printLine('network:   ' + network.join('.'), '');
    printLine('broadcast: ' + broadcast.join('.'), '');
    printLine('mask:      ' + mask.join('.'), '');
    printLine('hosts:     ' + usable, '');
  }

  function toolUuid() {
    if (crypto.randomUUID) {
      printLine('UUID v4', 'champagne');
      printLine(crypto.randomUUID(), '');
    } else {
      const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
      printLine('UUID v4', 'champagne');
      printLine(uuid, '');
    }
  }

  function cmdTools(args) {
    const tool = (args[1] || '').toLowerCase();
    const toolArgs = args.slice(1);
    switch (tool) {
      case 'sha256':
        toolSha256(args.slice(2).join(' '));
        break;
      case 'base64':
        toolBase64(toolArgs);
        break;
      case 'json':
        toolJson(args.slice(2).join(' '));
        break;
      case 'url':
        toolUrl(toolArgs);
        break;
      case 'timestamp':
        toolTimestamp(toolArgs);
        break;
      case 'cidr':
        toolCidr(toolArgs);
        break;
      case 'uuid':
        toolUuid();
        break;
      default:
        printLine('AVAILABLE TOOLS', 'champagne');
        printLine('');
        const tools = [
          ['sha256', 'hash text'],
          ['base64', 'encode/decode text'],
          ['json', 'format/validate json'],
          ['url', 'encode/decode url'],
          ['timestamp', 'unix / date info'],
          ['cidr', 'network calculator'],
          ['uuid', 'generate uuid'],
        ];
        tools.forEach(function (t) {
          printLine('  ' + t[0].padEnd(12) + t[1], '');
        });
        printLine('');
        printLine('usage: tools <tool> [args]', 'system');
    }
  }

  function cmdContact() {
    if (!dsData || !dsData.contact) {
      printLine('Contact info unavailable.', 'error');
      return;
    }
    printLine('Open the contact page:', 'info');
    const link = document.createElement('div');
    link.className = 'ds-output-line ds-link';
    link.innerHTML = '  <a href="' + escapeHtml(dsData.contact.url) + '">' + escapeHtml(dsData.contact.label) + ' →</a>';
    output.appendChild(link);
    output.scrollTop = output.scrollHeight;
  }

  function cmdTime() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const date = now
      .toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
      .toUpperCase();
    printLine(time, 'champagne');
    printLine(date, 'system');
  }

  // =======================
  // VOID / SEARCH
  // =======================

  function enterVoid() {
    if (isVoid) return;
    isVoid = true;
    document.body.classList.add('ds-void-active');
    output.classList.add('ds-void');
    printLine('THE VOID', 'champagne');
    printLine('search the things I\'ve left here\n', 'system');
  }

  function exitVoid() {
    if (!isVoid) return;
    isVoid = false;
    document.body.classList.remove('ds-void-active');
    output.classList.remove('ds-void');
  }

  function searchAll(query) {
    const q = query.trim().toLowerCase();
    if (!q) {
      printLine('usage: search <query>', 'system');
      return;
    }

    const results = [];
    const notes = (dsData && dsData.notes) ? dsData.notes : [];
    const projects = (dsData && dsData.projects) ? dsData.projects : [];
    const research = (dsData && dsData.research) ? dsData.research : [];
    const writing = (dsData && dsData.writing) ? dsData.writing : [];

    notes.forEach(function (n) {
      const haystack = (n.title + ' ' + (n.content || '') + ' ' + (n.tags || []).join(' ')).toLowerCase();
      if (haystack.indexOf(q) !== -1) {
        results.push({ source: 'notes', title: n.title, url: null, content: n.content, tags: n.tags, date: n.date });
      }
    });

    projects.forEach(function (p) {
      const haystack = (p.name + ' ' + (p.tags || []).join(' ') + ' ' + (p.description || '')).toLowerCase();
      if (haystack.indexOf(q) !== -1) {
        results.push({ source: 'projects', title: p.name, url: p.url, content: p.description, tags: p.tags });
      }
    });

    research.forEach(function (r) {
      const haystack = (r.title + ' ' + (r.url || '')).toLowerCase();
      if (haystack.indexOf(q) !== -1) {
        results.push({ source: 'research', title: r.title, url: r.url, content: null, tags: [] });
      }
    });

    writing.forEach(function (w) {
      const haystack = (w.title + ' ' + (w.url || '')).toLowerCase();
      if (haystack.indexOf(q) !== -1) {
        results.push({ source: 'writing', title: w.title, url: w.url, content: null, tags: [] });
      }
    });

    if (!results.length) {
      printLine('NO MATCHES', 'error');
      printLine('');
      printLine('nothing found for:', 'system');
      printLine('"' + query.trim() + '"', '');
      printLine('');
      return;
    }

    printLine(results.length + ' result(s) found\n', 'info');
    results.forEach(function (r, i) {
      const num = String(i + 1).padStart(2, '0');
      const source = ('[' + r.source + ']').padEnd(12);
      printLine(' ' + num + '  ' + source + r.title, '');
      if (r.tags && r.tags.length) {
        printLine('     ' + r.tags.map(function (t) { return '[' + t + ']'; }).join(' '), 'system');
      }
      if (r.content) {
        printLine('     ' + r.content, 'system');
      }
      if (r.url) {
        const link = document.createElement('div');
        link.className = 'ds-output-line ds-link';
        link.innerHTML = '     <a href="' + escapeHtml(r.url) + '" target="_blank" rel="noopener noreferrer">open →</a>';
        output.appendChild(link);
        output.scrollTop = output.scrollHeight;
      }
      printLine('', '');
    });
  }

  function cmdSearch(args) {
    const query = args.slice(1).join(' ');
    if (!query.trim()) {
      enterVoid();
      printLine('usage: search <query>', 'system');
      printLine('example: search docker', 'system');
      return;
    }
    enterVoid();
    searchAll(query);
  }

  // =======================
  // EXECUTION
  // =======================

  function executeCommand(raw) {
    const trimmed = raw.trim();
    if (!trimmed) return;

    commandHistory.push(trimmed);
    historyIndex = commandHistory.length;

    printLine(trimmed, 'command');

    const args = trimmed.split(/\s+/);
    const command = args[0].toLowerCase();

    switch (command) {
      case 'help':
        cmdHelp();
        break;
      case 'clear':
        output.innerHTML = '';
        break;
      case 'about':
        cmdAbout();
        break;
      case 'work':
        cmdWork();
        break;
      case 'research':
        cmdResearch();
        break;
      case 'writing':
        cmdWriting();
        break;
      case 'status':
        cmdStatus();
        break;
      case 'focus':
        cmdFocus(args);
        break;
      case 'time':
        cmdTime();
        break;
      case 'tools':
        cmdTools(args);
        break;
      case 'contact':
        cmdContact();
        break;
      case 'search':
        cmdSearch(args);
        break;
      case 'exit':
        exitTerminal();
        break;
      default:
        cmdNotFound(command);
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function init() {
    loadData();
    updateClock();
    setInterval(updateClock, 1000);

    if (preview) {
      preview.addEventListener('click', function () {
        enterTerminal();
      });
      preview.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          enterTerminal();
        }
      });
    }

    document.querySelectorAll('.ds-module').forEach(function (mod) {
      mod.addEventListener('click', function () {
        const action = mod.getAttribute('data-action');
        if (action) openModule(action);
      });
      mod.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const action = mod.getAttribute('data-action');
          if (action) openModule(action);
        }
      });
    });

    initial.addEventListener('click', function (e) {
      if (e.target.closest('.ds-module') || e.target.closest('.ds-terminal-preview') || e.target.closest('.ds-exit-link')) {
        return;
      }
      enterTerminal();
    });

    initial.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key.length === 1) {
        enterTerminal();
      }
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        executeCommand(input.value);
        input.value = '';
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex > 0) {
          historyIndex--;
          input.value = commandHistory[historyIndex] || '';
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
          historyIndex++;
          input.value = commandHistory[historyIndex] || '';
        } else {
          historyIndex = commandHistory.length;
          input.value = '';
        }
      } else if (e.key === 'l' && e.ctrlKey) {
        e.preventDefault();
        output.innerHTML = '';
      }
    });

    terminal.addEventListener('click', function (e) {
      if (e.target === terminal || e.target.classList.contains('ds-output')) {
        input.focus();
      }
    });

    const leaveHint = document.createElement('div');
    leaveHint.className = 'ds-leave-hint';
    leaveHint.innerHTML = 'type <span class="ds-prompt">exit</span> to return to portfolio · or visit <a href="index.html">index.html</a>';
    terminal.insertBefore(leaveHint, terminal.firstChild);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
