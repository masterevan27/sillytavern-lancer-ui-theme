/**
 * Lancer Theme Controls - preset format and the presets that ship with it.
 *
 * Pure data, no SillyTavern imports: index.js loads this in the browser and
 * build-theme.js loads it under Node to regenerate `presets/*.json`. Those
 * JSON files are what people trade around; they are GENERATED from this file,
 * so edit the presets here and run `node build-theme.js`.
 *
 * A preset is the settings object minus everything that is not a look:
 *
 *   { format, name, schemaVersion, values, defaultFaction, userFaction,
 *     factions? }
 *
 * `values` keys are option ids from the OPTIONS table in index.js. `factions`
 * (the character -> faction map) is optional and left out of the presets here,
 * since one table's character names mean nothing at another table.
 */

/** Stamped into every exported preset, and required of every imported one. */
export const PRESET_FORMAT = 'lancer-theme-preset';

/**
 * Settings-shape version, shared with index.js because a preset carries the
 * same `values` as the settings do. Bump it when an option changes meaning,
 * and add a rung to the migration ladder in index.js.
 */
export const SCHEMA_VERSION = 8;

/**
 * The presets seeded into a fresh install. `slug` names the generated file in
 * `presets/`; it is not part of the format, and matches what the extension
 * would name that preset on export.
 *
 * Each carries a complete `values` set rather than a diff, so switching
 * between presets never leaves a stray knob behind from the last one.
 */
export const BUILTIN_PRESETS = [
    {
        slug: 'horus-deep-signal',
        name: 'HORUS // Deep Signal',
        schemaVersion: SCHEMA_VERSION,
        defaultFaction: 'horus',
        userFaction: 'nhp',
        values: {
            avatarSize: 136,
            avatarHeight: 1.4,
            avatarFrame: true,
            avatarNotch: true,
            stripe: true,
            stripeWidth: 4,
            stripeAngle: 180,
            stripeFaction: false,
            tint: true,
            tintStrength: 0.2,
            mesGradient: true,
            mesGradientStrength: 0.5,
            mesGradientAngle: 180,
            brackets: true,
            nameRule: true,
            hazard: true,
            mesGap: 12,
            caps: true,
            namePrefix: true,
            monoNames: true,
            nameScale: 1.55,
            nameSpacing: 0.18,
            glow: true,
            grid: true,
            gridStrength: 0.065,
            scanlines: true,
            scanStrength: 0.09,
            scrollbar: 14,
            colAccent: '#8A63D2',
            colPrimary: '#3C2A63',
            colCtlIdle: '#8A63D2',
            colCtlActive: '#2BE08A',
            colCtlActiveEdge: '#7CF5BC',
            colPanel: '#14101F',
            colMesGradient: '#1A0F2E',
            colStripeFrom: '#8A63D2',
            colStripeTo: '#2BE08A',
            colBorder: '#3B2E5A',
            colText: '#9FD8A8',
            colGrid: '#8A63D2',
            colScrollbar: '#4B2E83',
        },
    },
    {
        slug: 'ips-n-cold-deck',
        name: 'IPS-N // Cold Deck',
        schemaVersion: SCHEMA_VERSION,
        defaultFaction: 'ipsn',
        userFaction: 'union',
        values: {
            avatarSize: 120,
            avatarHeight: 1.2,
            avatarFrame: true,
            avatarNotch: false,
            stripe: true,
            stripeWidth: 2,
            stripeAngle: 180,
            stripeFaction: true,
            tint: true,
            tintStrength: 0.1,
            mesGradient: true,
            mesGradientStrength: 0.28,
            mesGradientAngle: 180,
            brackets: true,
            nameRule: true,
            hazard: true,
            mesGap: 8,
            caps: true,
            namePrefix: false,
            monoNames: true,
            nameScale: 1.35,
            nameSpacing: 0.1,
            glow: false,
            grid: true,
            gridStrength: 0.03,
            scanlines: false,
            scanStrength: 0.05,
            scrollbar: 12,
            colAccent: '#4FA3E3',
            colPrimary: '#1E3A5F',
            colCtlIdle: '#4FA3E3',
            colCtlActive: '#1E5C8A',
            colCtlActiveEdge: '#7FD3FF',
            colPanel: '#101820',
            colMesGradient: '#05090D',
            colStripeFrom: '#4FA3E3',
            colStripeTo: '#0B3C5D',
            colBorder: '#2C3E50',
            colText: '#D6E4EF',
            colGrid: '#4FA3E3',
            colScrollbar: '#1E5C8A',
        },
    },
    {
        slug: 'gms-field-manual',
        name: 'GMS // Field Manual',
        schemaVersion: SCHEMA_VERSION,
        defaultFaction: 'gms',
        userFaction: 'gms-bright',
        values: {
            avatarSize: 104,
            avatarHeight: 1,
            avatarFrame: true,
            avatarNotch: false,
            stripe: true,
            stripeWidth: 4,
            stripeAngle: 180,
            stripeFaction: true,
            tint: true,
            tintStrength: 0.08,
            mesGradient: false,
            mesGradientStrength: 0.33,
            mesGradientAngle: 180,
            brackets: false,
            nameRule: true,
            hazard: true,
            mesGap: 6,
            caps: true,
            namePrefix: false,
            monoNames: true,
            nameScale: 1.2,
            nameSpacing: 0.08,
            glow: false,
            grid: false,
            gridStrength: 0.04,
            scanlines: false,
            scanStrength: 0.05,
            scrollbar: 10,
            colAccent: '#D93F4E',
            colPrimary: '#7B0016',
            colCtlIdle: '#D93F4E',
            colCtlActive: '#991E2A',
            colCtlActiveEdge: '#D93F4E',
            colPanel: '#1A1A1A',
            colMesGradient: '#000000',
            colStripeFrom: '#991E2A',
            colStripeTo: '#7B0016',
            colBorder: '#4A4A4A',
            colText: '#C9CBA3',
            colGrid: '#DD5562',
            colScrollbar: '#7B0016',
        },
    },
];
