let currentlyShowingAmount = 0;
let maxIndex = 29;
let currentList = [];
let currentSelectedPokemonId = null;

const typeColors = {
    normal: '#BCBCAC', fighting: '#BC5442', flying: '#669AFF', poison: '#AB549A',
    ground: '#DEBC54', rock: '#BCAC66', bug: '#ABBC1C', ghost: '#6666BC',
    steel: '#ABACBC', fire: '#FF421C', water: '#2F9AFF', grass: '#78CD54',
    electric: '#FFCD30', psychic: '#FF549A', ice: '#78DEFF', dragon: '#7866EF',
    dark: '#785442', fairy: '#FFACFF'
};

const generationRanges = {
    1: [1, 151],
    2: [152, 251],
    3: [252, 386],
    4: [387, 493],
    5: [494, 649],
    6: [650, 721],
    7: [722, 809],
    8: [810, 905],
    9: [906, 1025]
};

/** update pokemon list */
function updatePokemonList() {
    if (currentlyShowingAmount <= maxIndex && currentlyShowingAmount < currentList.length) {
        renderPokemonListItem(currentlyShowingAmount);
    }
}

/** render pokemon card */
function renderPokemonListItem(index) {
    const pokemon = currentList[index];

    if (!pokemon) return;

    const pokemonId = getPokemonRealId(pokemon);
    const displayId = getDisplayPokemonId(pokemon);
    const pokemonImage = getPokemonListImage(pokemon, pokemonId);
    const pokemonTypes = normalizePokemonTypes(pokemon.types);
    const favoriteClass = isFavoritePokemon(pokemonId) ? 'favorite-active' : '';

    document.getElementById('pokedex-list-render-container').insertAdjacentHTML(
        'beforeend',
        `<div onclick="openInfo(${pokemonId})" class="pokemon-render-result-container container center column">
            <button class="pokemon-card-favorite ${favoriteClass}" onclick="event.stopPropagation(); toggleFavorite(${pokemonId});">♥</button>
            <button class="compare-card-button" onclick="event.stopPropagation(); addPokemonToCompare(${pokemonId});">Compare</button>
            <button class="team-card-button" onclick="event.stopPropagation(); addPokemonToTeam(${pokemonId});">+ Team</button>
            <img class="search-pokemon-image" src="${pokemonImage}" onerror="this.src='${getPokemonFallbackImage(pokemonId)}'">
            <span class="bold font-size-12"># ${displayId}</span>
            <h3>${dressUpPayloadValue(pokemon.name)}</h3>
            ${getTypeContainers(pokemonTypes)}
        </div>`
    );

    currentlyShowingAmount += 1;
    updatePokemonList();
}

function getPokemonRealId(pokemon) {
    if (pokemon.id) return pokemon.id;
    if (pokemon.url) return pokemon.url.split('/').filter(Boolean).pop();
    return '';
}

function getDisplayPokemonId(pokemon) {
    if (pokemon.displayId) return pokemon.displayId;
    return getPokemonRealId(pokemon);
}

function getPokemonListImage(pokemon, pokemonId) {
    if (pokemon.image) return pokemon.image;
    if (pokemon.sprites?.front_default) return pokemon.sprites.front_default;
    if (pokemon.sprites?.other?.['official-artwork']?.front_default) return pokemon.sprites.other['official-artwork'].front_default;
    if (pokemon.sprites?.other?.home?.front_default) return pokemon.sprites.other.home.front_default;
    return getPokemonFallbackImage(pokemonId);
}

function getPokemonFallbackImage(pokemonId) {
    return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + pokemonId + '.png';
}

function normalizePokemonTypes(types) {
    if (!types) return [];

    return types.map(type => {
        if (typeof type === 'string') return type;
        if (type.type && type.type.name) return type.type.name;
        return '';
    }).filter(Boolean);
}

function increaseMaxIndex(by) {
    if (maxIndex + by <= currentList.length) {
        maxIndex += by;
    } else {
        maxIndex = currentList.length - 1;
    }
}

function getTypeContainers(typesArray) {
    let htmlToReturn = '<div class="row type-wrap">';

    for (let i = 0; i < typesArray.length; i++) {
        htmlToReturn += `<div class="type-container" style="background: ${typeColors[typesArray[i]] || '#EDEDED'};">
                            ${getDisplayTypeName(typesArray[i])}
                        </div>`;
    }

    return htmlToReturn + '</div>';
}

function applyFilters() {
    const searchValue = document.getElementById('search-input')?.value.toLowerCase().trim() || '';
    const selectedType = document.getElementById('type-filter')?.value || 'all';
    const selectedGeneration = document.getElementById('generation-filter')?.value || 'all';
    const selectedSort = document.getElementById('sort-filter')?.value || 'id-asc';

    let results = pokemons.filter(pokemon => {
        const name = pokemon.name.replaceAll('-', ' ').toLowerCase();
        const types = normalizePokemonTypes(pokemon.types);
        const displayId = Number(getDisplayPokemonId(pokemon));
        const realId = Number(getPokemonRealId(pokemon));

        const matchesSearch = !searchValue || name.includes(searchValue) || String(displayId).includes(searchValue) || String(realId).includes(searchValue);
        const matchesType = selectedType === 'all' || types.includes(selectedType);
        const matchesGeneration = isGenerationMatch(displayId, realId, selectedGeneration);
        const matchesFavorite = selectedSort !== 'favorites' || isFavoritePokemon(realId);

        return matchesSearch && matchesType && matchesGeneration && matchesFavorite;
    });

    results = sortPokemonResults(results, selectedSort);
    renderNewList(results);
}

/** Compatibility for old inline handler name */
function search() {
    applyFilters();
}

function isGenerationMatch(displayId, realId, selectedGeneration) {
    if (selectedGeneration === 'all') return true;
    if (selectedGeneration === 'forms') return realId > 10000;

    const range = generationRanges[selectedGeneration];
    if (!range) return true;

    return displayId >= range[0] && displayId <= range[1];
}

function sortPokemonResults(results, selectedSort) {
    const copiedResults = [...results];

    if (selectedSort === 'id-desc') {
        return copiedResults.sort((a, b) => Number(getDisplayPokemonId(b)) - Number(getDisplayPokemonId(a)) || Number(getPokemonRealId(b)) - Number(getPokemonRealId(a)));
    }

    if (selectedSort === 'name-asc') {
        return copiedResults.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (selectedSort === 'name-desc') {
        return copiedResults.sort((a, b) => b.name.localeCompare(a.name));
    }

    return copiedResults.sort((a, b) => Number(getDisplayPokemonId(a)) - Number(getDisplayPokemonId(b)) || Number(getPokemonRealId(a)) - Number(getPokemonRealId(b)));
}

function renderNewList(list) {
    document.getElementById('pokedex-list-render-container').innerHTML = '';
    currentList = list;
    currentlyShowingAmount = 0;
    maxIndex = -1;
    increaseMaxIndex(30);
    updatePokemonList();
    updateResultCounter();
}

function updateResultCounter() {
    const counter = document.getElementById('result-counter');
    if (!counter) return;

    counter.innerHTML = `${currentList.length} Pokemon found`;
}

function getFavoritePokemonIds() {
    try {
        return JSON.parse(localStorage.getItem('favoritePokemonIds')) || [];
    } catch (error) {
        return [];
    }
}

function setFavoritePokemonIds(ids) {
    localStorage.setItem('favoritePokemonIds', JSON.stringify(ids.map(Number)));
}

function isFavoritePokemon(id) {
    return getFavoritePokemonIds().includes(Number(id));
}

function toggleFavorite(id) {
    const numericId = Number(id);
    let favoriteIds = getFavoritePokemonIds();

    if (favoriteIds.includes(numericId)) {
        favoriteIds = favoriteIds.filter(savedId => savedId !== numericId);
    } else {
        favoriteIds.push(numericId);
    }

    setFavoritePokemonIds(favoriteIds);
    applyFilters();

    if (Number(currentSelectedPokemonId) === numericId) {
        updateFavoriteButton(numericId);
    }
}

function updateFavoriteButton(id) {
    const favoriteButton = document.getElementById('favorite-button');
    if (!favoriteButton) return;

    if (isFavoritePokemon(id)) {
        favoriteButton.innerHTML = '♥';
        favoriteButton.classList.add('favorite-active');
        favoriteButton.title = 'Remove from favorites';
    } else {
        favoriteButton.innerHTML = '♡';
        favoriteButton.classList.remove('favorite-active');
        favoriteButton.title = 'Add to favorites';
    }
}

function toggleCurrentPokemonFavorite() {
    if (currentSelectedPokemonId) {
        toggleFavorite(currentSelectedPokemonId);
    }
}

window.addEventListener('scroll', function () {
    addNewScrollPokemon();
    updateBackToTopVisibility();
});

function addNewScrollPokemon() {
    if (window.scrollY + 100 >= document.documentElement.scrollHeight - document.documentElement.clientHeight) {
        increaseMaxIndex(30);
        updatePokemonList();
    }
}

function updateBackToTopVisibility() {
    if (window.scrollY > window.innerHeight) {
        document.getElementById('back-to-top-button').classList.remove('hide');
    } else {
        document.getElementById('back-to-top-button').classList.add('hide');
    }
}

function backToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function dressUpPayloadValue(string) {
    if (!string) return '';

    let splitStr = String(string).toLowerCase().split('-');

    for (let i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }

    return splitStr.join(' ');
}


function openRandomPokemon() {
    if (!pokemons.length) return;
    const randomPokemon = pokemons[Math.floor(Math.random() * pokemons.length)];
    openInfo(getPokemonRealId(randomPokemon));
}
