/**
 * Lancer Theme Controls
 *
 * Drives the CSS custom properties declared by the "Lancer // CompCon" theme
 * from checkboxes and sliders in Extensions, and maps characters to Lancer
 * manufacturer colours.
 *
 * The extension never owns the look — the theme's CSS does. Everything here
 * writes `--lcr-*` variables as inline styles on <html>, which override the
 * theme's defaults. Turn the extension off and the theme falls back to the
 * values written in its own CONFIG block.
 */

import { eventSource, event_types, saveSettingsDebounced, characters } from '../../../../script.js';
import { extension_settings } from '../../../extensions.js';
import { groups } from '../../../group-chats.js';
import { power_user } from '../../../power-user.js';

const MODULE = 'lancer_theme';
const STYLE_ID = 'lancer_theme_factions';

/**
 * Bump when an option's meaning changes, so stored values that predate the
 * change get replaced instead of silently overriding the new default.
 *   2 - avatars: 'avatarPortrait' (bool) became 'avatarHeight' (ratio slider),
 *       and the default avatar grew from 96px square to 112 x 1.35.
 *   3 - default avatar width 112 -> 136px. Ratio is unchanged, so the height
 *       follows on its own; only avatarSize is reset.
 *   4 - chat surfaces went black and the message defaults went GMS red. Resets
 *       the panel/border/grid swatches and the two default factions, but only
 *       where they still hold the superseded values - a deliberate choice of
 *       teal, navy or anything else survives.
 *   5 - 'nameSize' (fixed px) became 'nameScale', a multiple of SillyTavern's
 *       --mainFontSize, so names track the Font Scale slider again. A stored
 *       px size is carried over as the equivalent ratio.
 *   6 - the two message defaults moved off GMS: characters now read as pilots
 *       and your own messages as Union. Only replaces the superseded GMS
 *       values, so a deliberate choice survives.
 *   7 - the AI GM card ships with a faction mapping. Only seeded where no
 *       mapping has been made at all, so a curated list is never touched.
 *   8 - the panel gradient was retuned: it now washes straight down into
 *       black rather than diagonally into purple. Only replaces the three
 *       superseded values, so a deliberate choice of angle or colour lives.
 */
const SCHEMA_VERSION = 8;

/** Lancer manufacturer / allegiance palette. Keys match --lcr-f-* in the theme CSS. */
const FACTIONS = {
    gms: 'GMS',
    'gms-bright': 'GMS (bright)',
    'gms-deep': 'GMS (deep)',
    union: 'Union',
    ipsn: 'IPS-Northstar',
    ssc: 'Smith-Shimano',
    ha: 'Harrison Armory',
    horus: 'HORUS',
    nhp: 'NHP',
    core: 'Pilot (core)',
    enemy: 'Hostile',
    neutral: 'Unaligned',
};

/**
 * Declarative option table. Each entry maps one control to one CSS variable.
 * type 'bool'   -> checkbox, writes `on` or `off`
 * type 'range'  -> slider, writes the number plus `unit`
 * type 'color'  -> colour swatch, writes the hex value
 */
const OPTIONS = [
    { section: 'Avatars' },
    { id: 'avatarSize', type: 'range', label: 'Avatar width', cssVar: '--lcr-avatar', min: 40, max: 300, step: 2, unit: 'px', def: 136 },
    { id: 'avatarHeight', type: 'range', label: 'Avatar height (x width)', cssVar: '--lcr-avatar-ratio', min: 0.8, max: 2.4, step: 0.05, unit: '', def: 1.35 },
    { id: 'avatarFrame', type: 'bool', label: 'Faction frame on avatar', cssVar: '--lcr-on-avatar-frame', on: '1', off: '0', def: true },
    { id: 'avatarNotch', type: 'bool', label: 'Notched avatar corner', cssVar: '--lcr-avatar-notch', on: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)', off: 'none', def: true },

    { section: 'Message panels' },
    { id: 'stripe', type: 'bool', label: 'Faction edge stripe', cssVar: '--lcr-on-stripe', on: '1', off: '0', def: true },
    { id: 'stripeWidth', type: 'range', label: 'Stripe width', cssVar: '--lcr-stripe-width', min: 1, max: 12, step: 1, unit: 'px', def: 3 },
    { id: 'stripeAngle', type: 'range', label: 'Stripe gradient angle', cssVar: '--lcr-stripe-angle', min: 0, max: 360, step: 5, unit: 'deg', def: 180 },
    { id: 'tint', type: 'bool', label: 'Faction tint in panel', cssVar: '--lcr-on-tint', on: '1', off: '0', def: true },
    { id: 'tintStrength', type: 'range', label: 'Tint strength', cssVar: '--lcr-tint-strength', min: 0, max: 0.5, step: 0.01, unit: '', def: 0.14 },
    { id: 'mesGradient', type: 'bool', label: 'Gradient wash across panel', cssVar: '--lcr-on-mes-gradient', on: '1', off: '0', def: true },
    { id: 'mesGradientStrength', type: 'range', label: 'Gradient strength', cssVar: '--lcr-mes-gradient-strength', min: 0, max: 1, step: 0.01, unit: '', def: 0.33 },
    { id: 'mesGradientAngle', type: 'range', label: 'Gradient angle', cssVar: '--lcr-mes-gradient-angle', min: 0, max: 360, step: 5, unit: 'deg', def: 180 },
    { id: 'brackets', type: 'bool', label: 'Corner brackets', cssVar: '--lcr-on-brackets', on: '1', off: '0', def: true },
    { id: 'nameRule', type: 'bool', label: 'Hairline under name', cssVar: '--lcr-on-namerule', on: '1', off: '0', def: true },
    { id: 'hazard', type: 'bool', label: 'Hazard stripes on system messages', cssVar: '--lcr-on-hazard', on: '1', off: '0', def: true },
    { id: 'mesGap', type: 'range', label: 'Gap between messages', cssVar: '--lcr-mes-gap', min: 0, max: 32, step: 1, unit: 'px', def: 10 },

    { section: 'Typography' },
    { id: 'caps', type: 'bool', label: 'Uppercase labels', cssVar: '--lcr-caps', on: 'uppercase', off: 'none', def: true },
    { id: 'namePrefix', type: 'bool', label: 'Prefix names with //', cssVar: '--lcr-name-prefix', on: '"// "', off: '""', def: true },
    { id: 'monoNames', type: 'bool', label: 'Monospace name headers', cssVar: '--lcr-name-font', on: 'var(--lcr-font-mono)', off: 'var(--lcr-font-ui)', def: true },
    { id: 'nameScale', type: 'range', label: 'Name text size (x base font)', cssVar: '--lcr-name-scale', min: 0.8, max: 2.5, step: 0.05, unit: '', def: 1.6 },
    { id: 'nameSpacing', type: 'range', label: 'Name letter spacing', cssVar: '--lcr-name-spacing', min: 0, max: 0.4, step: 0.01, unit: 'em', def: 0.16 },
    { id: 'glow', type: 'bool', label: 'Glow on names and accents', cssVar: '--lcr-on-glow', on: '1', off: '0', def: true },

    { section: 'Atmosphere' },
    { id: 'grid', type: 'bool', label: 'Grid behind chat', cssVar: '--lcr-on-grid', on: '1', off: '0', def: true },
    { id: 'gridStrength', type: 'range', label: 'Grid strength', cssVar: '--lcr-grid-strength', min: 0, max: 0.2, step: 0.005, unit: '', def: 0.04 },
    { id: 'scanlines', type: 'bool', label: 'CRT scanlines', cssVar: '--lcr-on-scanlines', on: '1', off: '0', def: false },
    { id: 'scanStrength', type: 'range', label: 'Scanline strength', cssVar: '--lcr-scanline-strength', min: 0, max: 0.3, step: 0.005, unit: '', def: 0.05 },
    { id: 'scrollbar', type: 'range', label: 'Scrollbar thickness', cssVar: '--lcr-scrollbar', min: 6, max: 24, step: 1, unit: 'px', def: 16 },

    { section: 'Palette' },
    { id: 'colAccent', type: 'color', label: 'Accent', cssVar: '--lcr-accent', def: '#DD5562' },
    { id: 'colPrimary', type: 'color', label: 'App bar', cssVar: '--lcr-primary', def: '#802932' },
    { id: 'colCtlIdle', type: 'color', label: 'Controls at rest', cssVar: '--lcr-ctl-idle', def: '#DD5562' },
    { id: 'colCtlActive', type: 'color', label: 'Controls hovered / selected', cssVar: '--lcr-ctl-active', def: '#7A3FBF' },
    { id: 'colCtlActiveEdge', type: 'color', label: 'Controls, selected edge', cssVar: '--lcr-ctl-active-edge', def: '#B57BFF' },
    { id: 'colPanel', type: 'color', label: 'Message panel', cssVar: '--lcr-panel', def: '#212121' },
    { id: 'colMesGradient', type: 'color', label: 'Panel gradient, far end', cssVar: '--lcr-mes-gradient-color', def: '#000000' },
    { id: 'colStripeFrom', type: 'color', label: 'Edge stripe, start', cssVar: '--lcr-stripe-from', def: '#FF2E63' },
    { id: 'colStripeTo', type: 'color', label: 'Edge stripe, end', cssVar: '--lcr-stripe-to', def: '#7A3FBF' },
    { id: 'colBorder', type: 'color', label: 'Panel border', cssVar: '--lcr-border', def: '#424242' },
    { id: 'colText', type: 'color', label: 'Body text', cssVar: '--lcr-text', def: '#C9CBA3' },
    { id: 'colGrid', type: 'color', label: 'Chat grid', cssVar: '--lcr-grid-color', def: '#DD5562' },
    { id: 'colScrollbar', type: 'color', label: 'Scrollbar', cssVar: '--lcr-scrollbar-color', def: '#7B0016' },
];

const controlOptions = () => OPTIONS.filter(o => !o.section);

function defaultSettings() {
    const values = {};
    for (const opt of controlOptions()) {
        values[opt.id] = opt.def;
    }
    return {
        schemaVersion: SCHEMA_VERSION,
        enabled: true,
        values,
        /**
         * Character name -> faction key. Seeded with the AI GM card from the
         * NHP Uplink module, since the two are usually run together; delete
         * the row in the panel if you do not use it.
         * @type {Record<string, string>}
         */
        factions: { 'Lancer TTRPG AI GM': 'gms-bright' },
        /** faction for every user message that has no explicit name mapping */
        userFaction: 'union',
        /** faction for every character message that has no explicit mapping */
        defaultFaction: 'core',
    };
}

function getSettings() {
    if (!extension_settings[MODULE]) {
        extension_settings[MODULE] = defaultSettings();
    }
    const settings = extension_settings[MODULE];
    const defaults = defaultSettings();

    // Migrate stored values whose option changed shape or default.
    const stored = settings.schemaVersion ?? 1;
    if (stored < 2 && settings.values) {
        delete settings.values.avatarPortrait;
        settings.values.avatarHeight = defaults.values.avatarHeight;
    }
    if (stored < 3 && settings.values) {
        settings.values.avatarSize = defaults.values.avatarSize;
    }
    if (stored < 4) {
        const superseded = { colPanel: '#212D40', colBorder: '#364156' };
        for (const [key, old] of Object.entries(superseded)) {
            if (settings.values?.[key] === old) {
                settings.values[key] = defaults.values[key];
            }
        }
        if (settings.defaultFaction === 'union') settings.defaultFaction = defaults.defaultFaction;
        if (settings.userFaction === 'core') settings.userFaction = defaults.userFaction;
    }
    if (stored < 5 && settings.values) {
        const px = settings.values.nameSize;
        delete settings.values.nameSize;
        if (typeof px === 'number' && px > 0) {
            // SillyTavern's base is font_scale x 15px; express the old fixed
            // size as that ratio, snapped to the slider's 0.05 step.
            const base = 15 * (Number(power_user?.font_scale) || 1);
            const ratio = Math.round((px / base) * 20) / 20;
            settings.values.nameScale = Math.min(2.5, Math.max(0.8, ratio));
        }
    }
    if (stored < 6) {
        if (settings.defaultFaction === 'gms') settings.defaultFaction = defaults.defaultFaction;
        if (settings.userFaction === 'gms-bright') settings.userFaction = defaults.userFaction;
    }
    if (stored < 7 && settings.factions && Object.keys(settings.factions).length === 0) {
        settings.factions = { ...defaults.factions };
    }
    if (stored < 8 && settings.values) {
        const superseded = { mesGradientAngle: 135, mesGradientStrength: 0.35, colMesGradient: '#8A63D2' };
        for (const [key, old] of Object.entries(superseded)) {
            if (settings.values[key] === old) {
                settings.values[key] = defaults.values[key];
            }
        }
    }
    settings.schemaVersion = SCHEMA_VERSION;

    for (const key of Object.keys(defaults)) {
        if (settings[key] === undefined) {
            settings[key] = defaults[key];
        }
    }
    for (const opt of controlOptions()) {
        if (settings.values[opt.id] === undefined) {
            settings.values[opt.id] = opt.def;
        }
    }
    return settings;
}

/** Turn one option's stored value into the string written to its CSS variable. */
function cssValue(opt, raw) {
    switch (opt.type) {
        case 'bool': return raw ? opt.on : opt.off;
        case 'range': return `${raw}${opt.unit}`;
        case 'color': return String(raw);
        default: return String(raw);
    }
}

/** Push every option onto <html> as an inline custom property. */
function applyVariables() {
    const settings = getSettings();
    const root = document.documentElement;

    for (const opt of controlOptions()) {
        if (!settings.enabled) {
            root.style.removeProperty(opt.cssVar);
            continue;
        }
        root.style.setProperty(opt.cssVar, cssValue(opt, settings.values[opt.id]));
    }
}

/** Rebuild the generated per-character stylesheet. */
function applyFactions() {
    const settings = getSettings();
    let style = document.getElementById(STYLE_ID);
    if (!style) {
        style = document.createElement('style');
        style.id = STYLE_ID;
        document.head.append(style);
    }

    if (!settings.enabled) {
        style.textContent = '';
        return;
    }

    const rules = [
        `body #chat .mes { --lcr-mes-accent: var(--lcr-f-${settings.defaultFaction}); }`,
        `body #chat .mes[is_user="true"] { --lcr-mes-accent: var(--lcr-f-${settings.userFaction}); }`,
    ];

    for (const [name, faction] of Object.entries(settings.factions)) {
        if (!FACTIONS[faction]) {
            continue;
        }
        // JSON.stringify produces a correctly escaped CSS string for the attribute value.
        rules.push(`body #chat .mes[ch_name=${JSON.stringify(name)}] { --lcr-mes-accent: var(--lcr-f-${faction}); }`);
    }

    style.textContent = rules.join('\n');
}

function applyAll() {
    applyVariables();
    applyFactions();
}

/** Every name we could plausibly offer for a faction mapping. */
function knownNames() {
    const names = new Set();
    for (const character of characters ?? []) {
        if (character?.name) names.add(character.name);
    }
    for (const group of groups ?? []) {
        if (group?.name) names.add(group.name);
    }
    for (const persona of Object.values(power_user?.personas ?? {})) {
        if (persona) names.add(String(persona));
    }
    for (const mes of document.querySelectorAll('#chat .mes[ch_name]')) {
        const name = mes.getAttribute('ch_name');
        if (name) names.add(name);
    }
    return [...names].sort((a, b) => a.localeCompare(b));
}

/* -------------------------------------------------------------------------- */
/* UI                                                                          */
/* -------------------------------------------------------------------------- */

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

function factionSelect(value) {
    const select = el('select', 'text_pole lancer-faction-select');
    for (const [key, label] of Object.entries(FACTIONS)) {
        const option = el('option', null, label);
        option.value = key;
        select.append(option);
    }
    select.value = value;
    return select;
}

function buildControl(opt, settings) {
    const row = el('div', `lancer-row lancer-row-${opt.type}`);

    if (opt.type === 'bool') {
        const label = el('label', 'checkbox_label');
        const input = el('input');
        input.type = 'checkbox';
        input.checked = Boolean(settings.values[opt.id]);
        input.addEventListener('change', () => {
            settings.values[opt.id] = input.checked;
            applyVariables();
            saveSettingsDebounced();
        });
        label.append(input, el('span', null, opt.label));
        row.append(label);
        return row;
    }

    if (opt.type === 'range') {
        const label = el('label', 'lancer-label', opt.label);
        const readout = el('span', 'lancer-readout', `${settings.values[opt.id]}${opt.unit}`);
        const input = el('input', 'lancer-slider');
        input.type = 'range';
        input.min = opt.min;
        input.max = opt.max;
        input.step = opt.step;
        input.value = settings.values[opt.id];
        input.addEventListener('input', () => {
            settings.values[opt.id] = Number(input.value);
            readout.textContent = `${input.value}${opt.unit}`;
            applyVariables();
            saveSettingsDebounced();
        });
        label.append(readout);
        row.append(label, input);
        return row;
    }

    if (opt.type === 'color') {
        const label = el('label', 'lancer-label', opt.label);
        const input = el('input', 'lancer-color');
        input.type = 'color';
        input.value = settings.values[opt.id];
        input.addEventListener('input', () => {
            settings.values[opt.id] = input.value;
            applyVariables();
            saveSettingsDebounced();
        });
        row.append(label, input);
        return row;
    }

    return row;
}

function buildFactionPanel(settings) {
    const wrap = el('div', 'lancer-factions');

    const defaults = el('div', 'lancer-faction-defaults');

    const botRow = el('div', 'lancer-row lancer-row-color');
    botRow.append(el('label', 'lancer-label', 'Default for characters'));
    const botSelect = factionSelect(settings.defaultFaction);
    botSelect.addEventListener('change', () => {
        settings.defaultFaction = botSelect.value;
        applyFactions();
        saveSettingsDebounced();
    });
    botRow.append(botSelect);

    const userRow = el('div', 'lancer-row lancer-row-color');
    userRow.append(el('label', 'lancer-label', 'Default for your messages'));
    const userSelect = factionSelect(settings.userFaction);
    userSelect.addEventListener('change', () => {
        settings.userFaction = userSelect.value;
        applyFactions();
        saveSettingsDebounced();
    });
    userRow.append(userSelect);

    defaults.append(botRow, userRow);

    const list = el('div', 'lancer-faction-list');

    const renderList = () => {
        list.replaceChildren();
        const entries = Object.entries(settings.factions).sort((a, b) => a[0].localeCompare(b[0]));

        if (!entries.length) {
            list.append(el('div', 'lancer-empty', 'No per-character overrides yet.'));
        }

        for (const [name, faction] of entries) {
            const row = el('div', 'lancer-row lancer-faction-row');
            const swatch = el('span', 'lancer-swatch');
            swatch.style.backgroundColor = `var(--lcr-f-${faction})`;
            const nameEl = el('span', 'lancer-faction-name', name);
            nameEl.title = name;

            const select = factionSelect(faction);
            select.addEventListener('change', () => {
                settings.factions[name] = select.value;
                swatch.style.backgroundColor = `var(--lcr-f-${select.value})`;
                applyFactions();
                saveSettingsDebounced();
            });

            const remove = el('div', 'menu_button fa-solid fa-trash-can lancer-remove');
            remove.title = `Remove ${name}`;
            remove.addEventListener('click', () => {
                delete settings.factions[name];
                applyFactions();
                saveSettingsDebounced();
                renderList();
            });

            row.append(swatch, nameEl, select, remove);
            list.append(row);
        }
    };

    // add-row
    const adder = el('div', 'lancer-row lancer-adder');
    const nameInput = el('input', 'text_pole lancer-name-input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Character name';
    nameInput.setAttribute('list', 'lancer_known_names');

    const datalist = el('datalist');
    datalist.id = 'lancer_known_names';

    const refreshNames = () => {
        datalist.replaceChildren();
        for (const name of knownNames()) {
            const option = el('option');
            option.value = name;
            datalist.append(option);
        }
    };

    const addSelect = factionSelect('union');
    const addButton = el('div', 'menu_button lancer-add', 'Assign');
    addButton.addEventListener('click', () => {
        const name = nameInput.value.trim();
        if (!name) return;
        settings.factions[name] = addSelect.value;
        nameInput.value = '';
        applyFactions();
        saveSettingsDebounced();
        renderList();
    });

    adder.append(nameInput, datalist, addSelect, addButton);

    const hint = el('div', 'lancer-hint', 'Names match the header shown on a message, so personas work here too.');

    wrap.append(defaults, el('hr', 'lancer-hr'), adder, hint, list);
    renderList();
    refreshNames();

    eventSource.on(event_types.CHAT_CHANGED, refreshNames);

    return wrap;
}

function buildSettingsPanel() {
    const container = document.getElementById('extensions_settings');
    if (!container) return;

    const settings = getSettings();

    const drawer = el('div', 'inline-drawer lancer-theme-drawer');
    const toggle = el('div', 'inline-drawer-toggle inline-drawer-header');
    const title = el('b', null, 'Lancer Theme');
    const icon = el('div', 'inline-drawer-icon fa-solid fa-circle-chevron-down down');
    toggle.append(title, icon);

    const content = el('div', 'inline-drawer-content');

    // master switch
    const masterLabel = el('label', 'checkbox_label lancer-master');
    const master = el('input');
    master.type = 'checkbox';
    master.checked = settings.enabled;
    master.addEventListener('change', () => {
        settings.enabled = master.checked;
        content.classList.toggle('lancer-disabled', !master.checked);
        applyAll();
        saveSettingsDebounced();
    });
    masterLabel.append(master, el('span', null, 'Apply Lancer theme controls'));
    content.append(masterLabel);
    content.append(el('div', 'lancer-hint', 'Off: the theme falls back to the defaults written in its own CSS.'));

    const body = el('div', 'lancer-body');
    for (const opt of OPTIONS) {
        if (opt.section) {
            body.append(el('div', 'lancer-section', opt.section));
            continue;
        }
        body.append(buildControl(opt, settings));
    }

    body.append(el('div', 'lancer-section', 'Faction colours'));
    body.append(buildFactionPanel(settings));

    const reset = el('div', 'menu_button lancer-reset', 'Reset to theme defaults');
    reset.addEventListener('click', () => {
        const fresh = defaultSettings();
        settings.values = fresh.values;
        settings.factions = { ...fresh.factions };
        settings.userFaction = fresh.userFaction;
        settings.defaultFaction = fresh.defaultFaction;
        applyAll();
        saveSettingsDebounced();
        drawer.remove();
        buildSettingsPanel();
    });
    body.append(reset);

    content.append(body);
    if (!settings.enabled) {
        content.classList.add('lancer-disabled');
    }

    drawer.append(toggle, content);
    container.append(drawer);
}

(function init() {
    getSettings();
    applyAll();
    buildSettingsPanel();
    // Themes reset :root styling when switched; re-assert ours afterwards.
    eventSource.on(event_types.SETTINGS_UPDATED, applyAll);
})();
