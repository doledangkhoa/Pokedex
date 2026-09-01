let pokemons = [];

const pokemonDisplayIdOverrides = {
    'deoxys-attack': 386,
    'deoxys-defense': 386,
    'deoxys-speed': 386,
    'wormadam-sandy': 413,
    'wormadam-trash': 413,
    'shaymin-sky': 492,
    'giratina-origin': 487,
    'rotom-heat': 479,
    'rotom-wash': 479,
    'rotom-frost': 479,
    'rotom-fan': 479,
    'rotom-mow': 479,
    'castform-sunny': 351,
    'castform-rainy': 351,
    'castform-snowy': 351,
    'basculin-blue-striped': 550,
    'darmanitan-zen': 555,
    'meloetta-pirouette': 648,
    'tornadus-therian': 641,
    'thundurus-therian': 642,
    'landorus-therian': 645,
    'kyurem-black': 646,
    'kyurem-white': 646,
    'keldeo-resolute': 647
};

async function getAllNames() {
    const url = 'https://pokeapi.co/api/v2/pokemon/?limit=1300';
    const response = await fetch(url);
    const responseAsJson = await response.json();

    for (let i = 0; i < responseAsJson.results.length; i++) {
        const pokemonUrl = responseAsJson.results[i].url;
        const pokemonId = getPokemonIdFromUrl(pokemonUrl);
        const pokemonName = responseAsJson.results[i].name;

        pokemons.push({
            id: Number(pokemonId),
            displayId: getInitialDisplayPokemonId(pokemonName, Number(pokemonId)),
            name: pokemonName,
            url: pokemonUrl,
            types: []
        });
    }

    getAllTypes();
}

async function getAllTypes() {
    for (let i = 0; i < 18; i++) {
        const url = 'https://pokeapi.co/api/v2/type/' + (i + 1);
        const response = await fetch(url);
        const responseAsJson = await response.json();
        const pokemonInType = responseAsJson.pokemon;

        for (let j = 0; j < pokemonInType.length; j++) {
            const pokemonId = Number(getPokemonIdFromUrl(pokemonInType[j].pokemon.url));
            const pokemon = pokemons.find(p => Number(p.id) === pokemonId);

            if (pokemon && !pokemon.types.includes(responseAsJson.name)) {
                pokemon.types.push(responseAsJson.name);
            }
        }
    }

    loadingCompletion();
}

function getPokemonIdFromUrl(url) {
    return url.split('/').filter(Boolean).pop();
}

function getInitialDisplayPokemonId(name, id) {
    if (pokemonDisplayIdOverrides[name]) {
        return pokemonDisplayIdOverrides[name];
    }

    return id;
}

function loadingCompletion() {
    const loadingDiv = document.getElementById('loading-div');
    loadingDiv.classList.add('hideLoading');

    setTimeout(function () {
        loadingDiv.classList.replace('hideLoading', 'hide');
        document.body.style.overflow = 'unset';
    }, 500);

    currentList = pokemons;
    applyFilters();
}


function initializeApp() {
    applySavedTheme();
    updateLanguageButton();
    getAllNames();
}

function applySavedTheme() {
    const savedTheme = localStorage.getItem('pokedexTheme') || 'light';
    document.body.classList.toggle('dark-mode', savedTheme === 'dark');
    updateDarkModeButton();
}

function toggleDarkMode() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('pokedexTheme', isDark ? 'dark' : 'light');
    updateDarkModeButton();
}

function updateDarkModeButton() {
    const button = document.getElementById('dark-mode-toggle');
    if (!button) return;
    button.innerHTML = document.body.classList.contains('dark-mode') ? '☀️ Light Mode' : '🌙 Dark Mode';
}


/* Phase 3.5: Language switch */
function getCurrentLanguage() {
    return localStorage.getItem('pokedexLanguage') || 'en';
}

function isJapaneseLanguage() {
    return getCurrentLanguage() === 'ja';
}

function toggleLanguage() {
    const nextLanguage = isJapaneseLanguage() ? 'en' : 'ja';
    localStorage.setItem('pokedexLanguage', nextLanguage);
    updateLanguageButton();

    if (typeof applyFilters === 'function') {
        applyFilters();
    }

    if (typeof currentSelectedPokemonId !== 'undefined' && currentSelectedPokemonId && typeof openInfo === 'function') {
        openInfo(currentSelectedPokemonId);
    }
}

function updateLanguageButton() {
    const button = document.getElementById('language-toggle');
    if (!button) return;
    button.innerHTML = isJapaneseLanguage() ? '🇺🇸 English' : '🇯🇵 日本語';
}

function getApiLanguageNames() {
    return isJapaneseLanguage() ? ['ja-Hrkt', 'ja', 'en'] : ['en'];
}

function getLocalizedNameFromList(names, fallback) {
    if (!Array.isArray(names)) return fallback;
    const languagePriority = getApiLanguageNames();

    for (const languageName of languagePriority) {
        const match = names.find(item => item.language && item.language.name === languageName);
        if (match && match.name) return match.name;
    }

    return fallback;
}

function getLocalizedFlavorText(entries, fallback) {
    if (!Array.isArray(entries)) return fallback;
    const languagePriority = getApiLanguageNames();

    for (const languageName of languagePriority) {
        const match = entries.find(item => item.language && item.language.name === languageName);
        if (match && match.flavor_text) {
            return match.flavor_text.replace(/\f/g, ' ').replace(/\n/g, ' ');
        }
    }

    return fallback;
}

function getLocalizedEffectText(effectEntries, flavorEntries, fallback) {
    const languagePriority = getApiLanguageNames();

    if (Array.isArray(effectEntries)) {
        for (const languageName of languagePriority) {
            const match = effectEntries.find(item => item.language && item.language.name === languageName);
            if (match && (match.short_effect || match.effect)) {
                return (match.short_effect || match.effect).replace(/\$effect_chance/g, '').replace(/\n/g, ' ');
            }
        }
    }

    if (Array.isArray(flavorEntries)) {
        for (const languageName of languagePriority) {
            const match = flavorEntries.find(item => item.language && item.language.name === languageName);
            if (match && match.flavor_text) {
                return match.flavor_text.replace(/\f/g, ' ').replace(/\n/g, ' ');
            }
        }
    }

    return fallback;
}

const typeJapaneseNames = {
    normal: 'ノーマル', fighting: 'かくとう', flying: 'ひこう', poison: 'どく',
    ground: 'じめん', rock: 'いわ', bug: 'むし', ghost: 'ゴースト',
    steel: 'はがね', fire: 'ほのお', water: 'みず', grass: 'くさ',
    electric: 'でんき', psychic: 'エスパー', ice: 'こおり', dragon: 'ドラゴン',
    dark: 'あく', fairy: 'フェアリー'
};

function getDisplayTypeName(type) {
    return isJapaneseLanguage() ? (typeJapaneseNames[type] || dressUpPayloadValue(type)) : dressUpPayloadValue(type);
}

function getUiText(key) {
    const ja = {
        loadingMove: 'わざの詳細を読み込み中...',
        moveNotLoaded: 'わざの詳細を読み込めませんでした。',
        noEffect: '効果説明がありません。',
        power: '威力',
        accuracy: '命中',
        pp: 'PP',
        priority: '優先度',
        damageClass: '分類',
        target: '対象',
        moveDetail: 'わざ詳細',
        totalMoves: '個のわざがあります。クリックすると威力・命中・PP・効果を表示します。',
        noMoves: 'わざが見つかりません。',
        click: 'クリック',
        details: '詳細',
        level: 'Lv.',
        noDescription: '日本語の説明がありません。',
        generation: '世代',
        habitat: '生息地',
        captureRate: '捕獲率',
        baseExp: '基礎経験値',
        eggGroup: 'タマゴグループ',
        growth: '成長',
        gender: '性別',
        category: '分類',
        legendary: '伝説',
        mythical: '幻',
        baby: 'ベイビー',
        normalCategory: '通常',
        unknown: '不明',
        genderless: '性別不明',
        weaknessLoading: '読み込み中...',
        noWeakness: '弱点なし',
        weaknessError: '弱点を読み込めませんでした。'
    };

    const en = {
        loadingMove: 'Loading move detail...',
        moveNotLoaded: 'Could not load move detail.',
        noEffect: 'No effect description available.',
        power: 'Power',
        accuracy: 'Accuracy',
        pp: 'PP',
        priority: 'Priority',
        damageClass: 'Damage Class',
        target: 'Target',
        moveDetail: 'Move Detail',
        totalMoves: ' total moves. Click a move to see power, accuracy, PP and effect.',
        noMoves: 'No moves found.',
        click: 'Click',
        details: 'Details',
        level: 'Lv.',
        noDescription: 'No English description available.',
        generation: 'Generation',
        habitat: 'Habitat',
        captureRate: 'Capture Rate',
        baseExp: 'Base EXP',
        eggGroup: 'Egg Group',
        growth: 'Growth',
        gender: 'Gender',
        category: 'Category',
        legendary: 'Legendary',
        mythical: 'Mythical',
        baby: 'Baby',
        normalCategory: 'Normal',
        unknown: 'Unknown',
        genderless: 'Genderless',
        weaknessLoading: 'Loading...',
        noWeakness: 'No weakness',
        weaknessError: 'Could not load weakness.'
    };

    return (isJapaneseLanguage() ? ja : en)[key] || key;
}
