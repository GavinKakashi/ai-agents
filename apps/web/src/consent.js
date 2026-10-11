// Cookie consent manager. No third-party code.
//
// To add an optional technology (e.g. analytics), add a category below with
// `inUse: true` and put its loader in `load`. It will only ever run after the
// visitor opts in. Also list it in legal/cookie-policy.md.
(function () {
  'use strict';

  var CONSENT_VERSION = 1;
  var STORAGE_KEY = 'cd_consent';
  var MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000; // ask again after 12 months

  var CATEGORIES = [
    {
      id: 'analytics',
      label: 'Analytics',
      description: 'Anonymous usage statistics. Not currently in use.',
      inUse: false,
      load: function () {
        /* e.g. inject your analytics script here */
      },
    },
  ];

  function read() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (data.version !== CONSENT_VERSION) return null;
      if (Date.now() - data.savedAt > MAX_AGE_MS) return null;
      return data;
    } catch (e) {
      return null;
    }
  }

  function save(choices) {
    var data = { version: CONSENT_VERSION, savedAt: Date.now(), choices: choices };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      /* storage unavailable: choice applies to this page view only */
    }
    apply(choices);
    hide();
  }

  function apply(choices) {
    CATEGORIES.forEach(function (c) {
      if (c.inUse && choices[c.id] === true) c.load();
    });
  }

  var banner, optional, lastFocus;

  function show(moveFocus) {
    var current = read();
    optional.innerHTML = '';
    CATEGORIES.forEach(function (c) {
      var label = document.createElement('label');
      label.className = 'check';
      var input = document.createElement('input');
      input.type = 'checkbox';
      input.name = c.id;
      input.checked = !!(current && current.choices[c.id]); // off by default
      label.appendChild(input);
      label.appendChild(document.createTextNode(' ' + c.label + ' — ' + c.description));
      optional.appendChild(label);
    });
    banner.hidden = false;
    if (moveFocus) {
      lastFocus = document.activeElement;
      banner.querySelector('h2').setAttribute('tabindex', '-1');
      banner.querySelector('h2').focus();
    }
  }

  function hide() {
    banner.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function allChoices(value) {
    var out = {};
    CATEGORIES.forEach(function (c) {
      out[c.id] = value;
    });
    return out;
  }

  document.addEventListener('DOMContentLoaded', function () {
    banner = document.getElementById('cookie-banner');
    optional = document.getElementById('cookie-optional');
    if (!banner) return;

    banner.querySelector('[data-consent="accept"]').addEventListener('click', function () {
      save(allChoices(true));
    });
    banner.querySelector('[data-consent="reject"]').addEventListener('click', function () {
      save(allChoices(false));
    });
    document.getElementById('cookie-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var choices = {};
      CATEGORIES.forEach(function (c) {
        var input = optional.querySelector('input[name="' + c.id + '"]');
        choices[c.id] = !!(input && input.checked);
      });
      save(choices);
    });
    banner.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && read()) hide();
    });
    document.querySelectorAll('[data-open-cookie-settings]').forEach(function (el) {
      el.addEventListener('click', function () {
        show(true);
      });
    });

    var existing = read();
    if (existing) apply(existing.choices);
    else show(false); // first in the tab order, but we don't steal focus
  });
})();
