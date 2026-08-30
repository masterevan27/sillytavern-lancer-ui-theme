/**
 * Builds "Lancer CompCon.json" from lancer-compcon.css.
 *
 *   node build-theme.js            # writes the theme next to this script
 *   node build-theme.js --install  # also copies theme + extension into SillyTavern
 *
 * --install needs to know where SillyTavern keeps its user data. In order of
 * precedence:
 *
 *   node build-theme.js --install --st-root="D:/SillyTavern/data/default-user"
 *   ST_ROOT="D:/SillyTavern/data/default-user" node build-theme.js --install
 *
 * That directory is the one holding `themes/` and `extensions/` — usually
 * `<SillyTavern>/data/<your-user>/`, which is `data/default-user` unless you
 * enabled multi-user accounts.
 *
 * Keeping the CSS in its own file means it can be edited with syntax
 * highlighting instead of as a one-line JSON string.
 */

const fs = require('fs');
const path = require('path');

const THEME_NAME = 'Lancer CompCon';
const EXTENSION_DIR = 'SillyTavern-Lancer-Theme';

// Files the SillyTavern extension is made of. They live at the repo root so
// that SillyTavern's "Install extension" can clone this repo directly — its
// installer expects manifest.json at the root of whatever it cloned.
const EXTENSION_FILES = ['manifest.json', 'index.js', 'style.css', 'presets.js'];

/**
 * Resolves SillyTavern's user-data directory for --install.
 * @returns {string} the resolved path
 */
function resolveStRoot() {
    const flag = process.argv.find(a => a.startsWith('--st-root='));
    const root = flag ? flag.slice('--st-root='.length) : process.env.ST_ROOT;

    if (!root) {
        console.error('error: --install needs the SillyTavern user-data directory.');
        console.error('  node build-theme.js --install --st-root="D:/SillyTavern/data/default-user"');
        console.error('  ST_ROOT="D:/SillyTavern/data/default-user" node build-theme.js --install');
        console.error('It is the folder containing themes/ and extensions/.');
        process.exit(1);
    }

    if (!fs.existsSync(path.join(root, 'themes'))) {
        console.error(`error: no themes/ folder under ${root} — is that the right directory?`);
        process.exit(1);
    }

    return root;
}

const here = __dirname;
const css = fs.readFileSync(path.join(here, 'lancer-compcon.css'), 'utf8');

const theme = {
    name: THEME_NAME,
    blur_strength: 0,
    main_text_color: 'rgba(201, 203, 163, 1)',      // #C9CBA3 khaki
    italics_text_color: 'rgba(158, 158, 158, 1)',   // #9E9E9E narration
    underline_text_color: 'rgba(221, 85, 98, 1)',   // #DD5562 accent
    quote_text_color: 'rgba(72, 166, 167, 1)',      // #48A6A7 secondary
    blur_tint_color: 'rgba(13, 13, 13, 1)',         // #0D0D0D background
    chat_tint_color: 'rgba(20, 20, 20, 1)',         // #141414 surface
    user_mes_blur_tint_color: 'rgba(33, 33, 33, 1)',// #212121 panel
    bot_mes_blur_tint_color: 'rgba(33, 33, 33, 1)',
    shadow_color: 'rgba(0, 0, 0, 0.75)',
    shadow_width: 0,
    border_color: 'rgba(66, 66, 66, 1)',            // #424242
    font_scale: 1,
    fast_ui_mode: true,
    waifuMode: false,
    avatar_style: 1,        // avatar_styles.RECTANGULAR (the extension sizes it)
    chat_display: 0,        // flat panels
    toastr_position: 'toast-top-center',
    noShadows: true,
    chat_width: 55,
    timer_enabled: false,
    timestamps_enabled: true,
    timestamp_model_icon: false,
    mesIDDisplay_enabled: true,
    hideChatAvatars_enabled: false,
    message_token_count_enabled: true,
    expand_message_actions: false,
    enableZenSliders: false,
    enableLabMode: false,
    hotswap_enabled: true,
    custom_css: css,
    bogus_folders: true,
    zoomed_avatar_magnification: false,
    reduced_motion: false,
    compact_input_area: true,
    show_swipe_num_all_messages: true,
    click_to_edit: false,
    media_display: 'gallery',   // MEDIA_DISPLAY enum - 'list' | 'gallery'
};

const themeFile = path.join(here, `${THEME_NAME}.json`);
fs.writeFileSync(themeFile, JSON.stringify(theme, null, 4), 'utf8');
console.log(`wrote ${themeFile} (${css.length} bytes of CSS)`);

if (process.argv.includes('--install')) {
    const stRoot = resolveStRoot();

    const themeTarget = path.join(stRoot, 'themes', `${THEME_NAME}.json`);
    fs.copyFileSync(themeFile, themeTarget);
    console.log(`installed theme -> ${themeTarget}`);

    const extTarget = path.join(stRoot, 'extensions', EXTENSION_DIR);
    fs.mkdirSync(extTarget, { recursive: true });
    for (const file of EXTENSION_FILES) {
        fs.copyFileSync(path.join(here, file), path.join(extTarget, file));
        console.log(`installed extension file -> ${path.join(extTarget, file)}`);
    }
}

// The presets people trade around ship as JSON so they can be read on GitHub
// and imported without the extension, but presets.js is what the extension
// itself loads — so the files are generated from it, the same way the theme is
// generated from its CSS. CI rebuilds and diffs both.
import('./presets.js').then(({ BUILTIN_PRESETS, PRESET_FORMAT }) => {
    const presetDir = path.join(here, 'presets');
    fs.mkdirSync(presetDir, { recursive: true });

    for (const { slug, ...preset } of BUILTIN_PRESETS) {
        const file = path.join(presetDir, `${slug}.json`);
        fs.writeFileSync(file, `${JSON.stringify({ format: PRESET_FORMAT, ...preset }, null, 4)}\n`, 'utf8');
        console.log(`wrote ${file}`);
    }
}).catch(error => {
    console.error(`error: could not build presets - ${error.message}`);
    process.exitCode = 1;
});
