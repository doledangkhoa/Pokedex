let currentSelectedPokemonData = null;
let compareSlots = {
    left: null,
    right: null
};

function openInfo(id) {
    currentSelectedPokemonId = Number(id);
    document.getElementById('current-pokemon-empty').classList.add('hide');
    document.getElementById('current-pokemon-loading').classList.remove('hide');
    showPokemonTab('about');
    updateFavoriteButton(id);

    if (window.innerWidth > 1100) {
        slideOutPokemonInfo();

        setTimeout(function () {
            fetchPokemonInfo(id);
        }, 350);
    } else {
        fetchPokemonInfo(id);
    }
}

async function fetchPokemonInfo(id) {
    try {
        const responsePokemon = await fetch('https://pokeapi.co/api/v2/pokemon/' + id);

        if (!responsePokemon.ok) {
            throw new Error('Pokemon not found: ' + id);
        }

        const pokemon = await responsePokemon.json();
        const responseSpecies = await fetch(pokemon.species.url);
        const species = await responseSpecies.json();

        currentSelectedPokemonData = { pokemon, species };

        setupPokemonAbout(pokemon, species);
        setupPokemonStats(pokemon);
        await setupPokemonAbilities(pokemon);
        setupPokemonExtraDetails(pokemon, species);
        setupPokemonMoves(pokemon);
        setupCompetitiveBuild(pokemon, species);
        setupResponsiveBackground(pokemon);
        updateCurrentPokemonImage(pokemon);
        setupPokemonWeaknesses(pokemon);

        if (species.evolution_chain && species.evolution_chain.url) {
            const responseEvolutions = await fetch(species.evolution_chain.url);

            if (responseEvolutions.ok) {
                const evolutionChain = await responseEvolutions.json();
                setupEvolutionChain(evolutionChain);
            } else {
                hideEvolutionChain();
            }
        } else {
            hideEvolutionChain();
        }

        document.getElementById('current-pokemon-loading').classList.add('hide');
        slideInPokemonInfo();

        if (window.innerWidth < 1100) {
            openPokemonResponsiveInfo();
        }
    } catch (error) {
        console.error(error);
        document.getElementById('current-pokemon-loading').classList.add('hide');
        hideEvolutionChain();
        slideInPokemonInfo();
    }
}

function updateCurrentPokemonImage(pokemon) {
    const image = document.getElementById('current-pokemon-image');
    image.onload = function () {
        this.style.height = this.naturalHeight < 100 ? this.naturalHeight * 3 + 'px' : '180px';
    };
    image.style.height = '180px';
    setPokemonImage(image, pokemon);
}

function setupPokemonAbout(pokemon, species) {
    const displayId = getDisplayPokemonIdFromInfo(pokemon, species);
    const displayName = getLocalizedNameFromList(species.names, dressUpPayloadValue(pokemon.name));

    document.getElementById('current-pokemon-info').classList.remove('hide');
    document.getElementById('current-pokemon-id').innerHTML = '# ' + displayId;
    document.getElementById('current-pokemon-name').innerHTML = displayName;
    document.getElementById('current-pokemon-types').innerHTML = getTypeContainers(pokemon.types.map(t => t.type.name));
    document.getElementById('current-pokemon-height').innerHTML = pokemon.height / 10 + 'm';
    document.getElementById('current-pokemon-weight').innerHTML = pokemon.weight / 10 + 'kg';

    document.getElementById('current-pokemon-description').innerHTML = getLocalizedFlavorText(
        species.flavor_text_entries,
        getUiText('noDescription')
    );
}

function setupPokemonExtraDetails(pokemon, species) {
    const container = document.getElementById('current-pokemon-extra-details');
    if (!container) return;

    const eggGroups = species.egg_groups?.map(group => dressUpPayloadValue(group.name)).join(' / ') || getUiText('unknown');
    const generation = species.generation?.name ? dressUpPayloadValue(species.generation.name.replace('generation-', 'gen-')) : getUiText('unknown');
    const habitat = species.habitat?.name ? dressUpPayloadValue(species.habitat.name) : getUiText('unknown');
    const growthRate = species.growth_rate?.name ? dressUpPayloadValue(species.growth_rate.name) : getUiText('unknown');
    const baseExperience = pokemon.base_experience || getUiText('unknown');
    const captureRate = species.capture_rate ?? getUiText('unknown');
    const genderRate = formatGenderRate(species.gender_rate);
    const category = getPokemonCategory(species);

    container.innerHTML = `
        ${getDetailItemHtml(getUiText('generation'), generation)}
        ${getDetailItemHtml(getUiText('habitat'), habitat)}
        ${getDetailItemHtml(getUiText('captureRate'), captureRate)}
        ${getDetailItemHtml(getUiText('baseExp'), baseExperience)}
        ${getDetailItemHtml(getUiText('eggGroup'), eggGroups)}
        ${getDetailItemHtml(getUiText('growth'), growthRate)}
        ${getDetailItemHtml(getUiText('gender'), genderRate)}
        ${getDetailItemHtml(getUiText('category'), category)}
    `;
}

function getDetailItemHtml(label, value) {
    return `<div class="detail-item"><span class="detail-label">${label}</span><span class="detail-value">${value}</span></div>`;
}

function formatGenderRate(genderRate) {
    if (genderRate === -1) return getUiText('genderless');
    if (typeof genderRate !== 'number') return getUiText('unknown');

    const female = (genderRate / 8) * 100;
    const male = 100 - female;
    return `${male}% M / ${female}% F`;
}

function getPokemonCategory(species) {
    const categories = [];

    if (species.is_legendary) categories.push(getUiText('legendary'));
    if (species.is_mythical) categories.push(getUiText('mythical'));
    if (species.is_baby) categories.push(getUiText('baby'));

    return categories.length ? categories.join(' / ') : getUiText('normalCategory');
}

function getDisplayPokemonIdFromInfo(pokemon, species) {
    const speciesId = species?.id;
    if (speciesId) return speciesId;
    if (pokemonDisplayIdOverrides && pokemonDisplayIdOverrides[pokemon.name]) return pokemonDisplayIdOverrides[pokemon.name];
    return pokemon.id;
}

function setupPokemonStats(pokemon) {
    const hp = getPokemonStat(pokemon, 'hp');
    const attack = getPokemonStat(pokemon, 'attack');
    const defense = getPokemonStat(pokemon, 'defense');
    const specialAttack = getPokemonStat(pokemon, 'special-attack');
    const specialDefense = getPokemonStat(pokemon, 'special-defense');
    const speed = getPokemonStat(pokemon, 'speed');

    document.getElementById('current-pokemon-stats-hp').innerHTML = hp;
    document.getElementById('current-pokemon-stats-atk').innerHTML = attack;
    document.getElementById('current-pokemon-stats-def').innerHTML = defense;
    document.getElementById('current-pokemon-stats-spa').innerHTML = specialAttack;
    document.getElementById('current-pokemon-stats-spd').innerHTML = specialDefense;
    document.getElementById('current-pokemon-stats-speed').innerHTML = speed;
    document.getElementById('current-pokemon-stats-total').innerHTML = hp + attack + defense + specialAttack + specialDefense + speed;
}

function getPokemonStat(pokemon, statName) {
    return pokemon.stats.find(stat => stat.stat.name === statName)?.base_stat || 0;
}

async function setupPokemonAbilities(pokemon) {
    const ability0 = document.getElementById('current-pokemon-abilitiy-0');
    const ability1 = document.getElementById('current-pokemon-abilitiy-1');

    const abilities = [ability0, ability1];

    for (let i = 0; i < abilities.length; i++) {
        const container = abilities[i];
        const abilityData = pokemon.abilities[i];

        if (!abilityData) {
            container.classList.add('hide');
            continue;
        }

        container.classList.remove('hide');
        container.innerHTML = dressUpPayloadValue(abilityData.ability.name);

    }
}

async function setupPokemonWeaknesses(pokemon) {
    const container = document.getElementById('current-pokemon-weaknesses');
    container.innerHTML = `<span>${getUiText('weaknessLoading')}</span>`;

    try {
        const multipliers = {};

        Object.keys(typeColors).forEach(type => {
            multipliers[type] = 1;
        });

        for (const typeItem of pokemon.types) {
            const response = await fetch(typeItem.type.url);
            const typeData = await response.json();

            typeData.damage_relations.double_damage_from.forEach(item => multipliers[item.name] *= 2);
            typeData.damage_relations.half_damage_from.forEach(item => multipliers[item.name] *= 0.5);
            typeData.damage_relations.no_damage_from.forEach(item => multipliers[item.name] *= 0);
        }

        const weaknesses = Object.keys(multipliers).filter(type => multipliers[type] > 1);

        if (weaknesses.length === 0) {
            container.innerHTML = `<span>${getUiText('noWeakness')}</span>`;
            return;
        }

        container.innerHTML = getTypeContainers(weaknesses);
    } catch (error) {
        console.error(error);
        container.innerHTML = `<span>${getUiText('weaknessError')}</span>`;
    }
}


function setupPokemonMoves(pokemon) {
    const movesContainer = document.getElementById('current-pokemon-moves');
    const summaryContainer = document.getElementById('current-pokemon-move-summary');

    if (!movesContainer || !summaryContainer) return;

    closeMoveDetailModal();

    const usefulMoves = pokemon.moves
        .map(moveItem => {
            const levelDetail = moveItem.version_group_details
                .filter(detail => detail.move_learn_method.name === 'level-up')
                .sort((a, b) => b.level_learned_at - a.level_learned_at)[0];

            return {
                name: moveItem.move.name,
                url: moveItem.move.url,
                level: levelDetail?.level_learned_at ?? null,
                method: levelDetail ? getUiText('level') : getMoveLearnMethod(moveItem)
            };
        })
        .sort((a, b) => {
            if (a.level === null && b.level === null) return a.name.localeCompare(b.name);
            if (a.level === null) return 1;
            if (b.level === null) return -1;
            return a.level - b.level;
        })
        .slice(0, 30);

    summaryContainer.innerHTML = `${pokemon.moves.length}${getUiText('totalMoves')}`;

    if (usefulMoves.length === 0) {
        movesContainer.innerHTML = `<span>${getUiText('noMoves')}</span>`;
        return;
    }

    movesContainer.innerHTML = usefulMoves
        .map(move => getMoveRowHtml(move))
        .join('');
}

function getMoveLearnMethod(moveItem) {
    const method = moveItem.version_group_details?.[0]?.move_learn_method?.name;
    return method ? dressUpPayloadValue(method) : getUiText('unknown');
}

function getMoveRowHtml(move) {
    const levelText = move.level !== null ? getUiText('level') + ' ' + move.level : move.method;

    return `<div class="move-row move-row-clickable" onclick="openMoveDetail('${move.url}')">
        <span class="move-name">${dressUpPayloadValue(move.name)}</span>
        <span class="move-meta">${levelText}</span>
        <span class="move-meta">${getUiText('click')}</span>
        <span class="move-meta">${getUiText('details')}</span>
    </div>`;
}

async function openMoveDetail(moveUrl) {
    const modal = document.getElementById('move-detail-modal');
    const title = document.getElementById('move-detail-modal-title');
    const body = document.getElementById('move-detail-modal-body');

    if (!modal || !title || !body) return;

    modal.classList.remove('hide');
    title.innerHTML = getUiText('moveDetail');
    body.innerHTML = `<span>${getUiText('loadingMove')}</span>`;

    try {
        const response = await fetch(moveUrl);
        if (!response.ok) throw new Error('Move not found');
        const move = await response.json();

        const typeName = move.type?.name || 'normal';
        const moveName = getLocalizedNameFromList(move.names, dressUpPayloadValue(move.name));
        const effectText = getLocalizedEffectText(
            move.effect_entries,
            move.flavor_text_entries,
            getUiText('noEffect')
        );

        title.innerHTML = moveName;

        body.innerHTML = `
            <div class="move-detail-header">
                <h4>${moveName}</h4>
                <div class="type-container" style="background:${typeColors[typeName] || '#EDEDED'}">${getDisplayTypeName(typeName)}</div>
            </div>
            <div class="move-detail-grid">
                ${getDetailItemHtml(getUiText('power'), move.power ?? '—')}
                ${getDetailItemHtml(getUiText('accuracy'), move.accuracy ?? '—')}
                ${getDetailItemHtml(getUiText('pp'), move.pp ?? '—')}
                ${getDetailItemHtml(getUiText('priority'), move.priority ?? 0)}
                ${getDetailItemHtml(getUiText('damageClass'), dressUpPayloadValue(move.damage_class?.name || getUiText('unknown')))}
                ${getDetailItemHtml(getUiText('target'), dressUpPayloadValue(move.target?.name || getUiText('unknown')))}
            </div>
            <div class="move-effect-text">${effectText}</div>
        `;
    } catch (error) {
        console.error(error);
        body.innerHTML = `<span>${getUiText('moveNotLoaded')}</span>`;
    }
}

function closeMoveDetailModal() {
    const modal = document.getElementById('move-detail-modal');
    const body = document.getElementById('move-detail-modal-body');

    if (modal) modal.classList.add('hide');
    if (body) body.innerHTML = '';
}

function setupCompetitiveBuild(pokemon, species) {
    const container = document.getElementById('current-pokemon-build');
    if (!container) return;

    const build = getCompetitiveBuildRecommendation(pokemon, species);

    container.innerHTML = `
        <div class="build-role-card">
            <span class="detail-label">Recommended Role</span>
            <h3>${build.role}</h3>
            <span>${build.reason}</span>
        </div>

        <div class="detail-grid">
            ${getDetailItemHtml('Nature', build.nature)}
            ${getDetailItemHtml('Ability', build.ability)}
            ${getDetailItemHtml('Item', build.item)}
            ${getDetailItemHtml('EV Focus', build.ev)}
        </div>

        <h4>Suggested Moves</h4>
        <div class="build-move-list">
            ${build.moves.map(move => `<div class="build-move">${dressUpPayloadValue(move)}</div>`).join('')}
        </div>

        <h4>Play Style</h4>
        <div class="build-advice">${build.advice}</div>
    `;
}

function getCompetitiveBuildRecommendation(pokemon, species) {
    const attack = getPokemonStat(pokemon, 'attack');
    const specialAttack = getPokemonStat(pokemon, 'special-attack');
    const speed = getPokemonStat(pokemon, 'speed');
    const hp = getPokemonStat(pokemon, 'hp');
    const defense = getPokemonStat(pokemon, 'defense');
    const specialDefense = getPokemonStat(pokemon, 'special-defense');
    const totalBulk = hp + defense + specialDefense;
    const types = pokemon.types.map(typeItem => typeItem.type.name);
    const ability = getBestDisplayAbility(pokemon);
    const moves = getSuggestedCompetitiveMoves(pokemon, specialAttack >= attack);
    const item = getSuggestedItem(types, speed, totalBulk, species);
    const nature = getSuggestedNature(attack, specialAttack, speed, totalBulk);
    const ev = getSuggestedEvFocus(attack, specialAttack, speed, totalBulk);

    let role = 'Balanced Attacker';
    let reason = 'This Pokémon has balanced offensive stats and can be used flexibly.';
    let advice = 'Use its strongest same-type moves and adjust the final move slot for coverage.';

    if (speed >= 100 && Math.max(attack, specialAttack) >= 100) {
        role = specialAttack >= attack ? 'Special Sweeper' : 'Physical Sweeper';
        reason = 'High Speed plus strong attacking power makes it suitable for fast offense.';
        advice = 'Bring it in safely, then pressure the opponent with fast high-damage attacks.';
    } else if (totalBulk >= 250 && Math.max(defense, specialDefense) >= 95) {
        role = 'Defensive Pivot';
        reason = 'Good bulk makes it suitable for switching into attacks and supporting the team.';
        advice = 'Use it to absorb hits, spread status, and keep momentum for your team.';
    } else if (Math.max(attack, specialAttack) >= 115) {
        role = specialAttack >= attack ? 'Special Wallbreaker' : 'Physical Wallbreaker';
        reason = 'Its attacking stat is high enough to break through defensive Pokémon.';
        advice = 'Use prediction and coverage moves to punish common switch-ins.';
    } else if (speed <= 55 && Math.max(attack, specialAttack) >= 90) {
        role = 'Slow Breaker';
        reason = 'It hits hard but needs support because of its low Speed.';
        advice = 'Pair it with defensive pivots, paralysis support, or Trick Room.';
    }

    return {
        role,
        reason,
        nature,
        ability,
        item,
        ev,
        moves,
        advice
    };
}

function getBestDisplayAbility(pokemon) {
    const hiddenAbility = pokemon.abilities.find(item => item.is_hidden);
    const normalAbility = pokemon.abilities[0];
    return dressUpPayloadValue((hiddenAbility || normalAbility)?.ability?.name || 'Any');
}

function getSuggestedNature(attack, specialAttack, speed, totalBulk) {
    if (speed >= 90) {
        return specialAttack >= attack ? 'Timid / Modest' : 'Jolly / Adamant';
    }

    if (totalBulk >= 260) {
        return specialAttack >= attack ? 'Calm / Bold' : 'Impish / Careful';
    }

    return specialAttack >= attack ? 'Modest' : 'Adamant';
}

function getSuggestedEvFocus(attack, specialAttack, speed, totalBulk) {
    if (speed >= 90) {
        return specialAttack >= attack ? '252 SpA / 252 Spe' : '252 Atk / 252 Spe';
    }

    if (totalBulk >= 260) {
        return '252 HP / Defensive split';
    }

    return specialAttack >= attack ? '252 HP / 252 SpA' : '252 HP / 252 Atk';
}

function getSuggestedItem(types, speed, totalBulk, species) {
    if (types.includes('fire') || types.includes('flying')) return 'Heavy-Duty Boots';
    if (speed >= 100) return 'Life Orb / Choice Item';
    if (totalBulk >= 260) return 'Leftovers';
    if (species?.is_legendary || species?.is_mythical) return 'Choice Item';
    return 'Leftovers / Life Orb';
}

function getSuggestedCompetitiveMoves(pokemon, preferSpecial) {
    const damagingMoves = pokemon.moves
        .map(moveItem => ({
            name: moveItem.move.name,
            method: getMoveLearnMethod(moveItem)
        }))
        .filter(move => !move.name.includes('max-'))
        .map(move => move.name);

    const priorityNames = [
        'earthquake', 'thunderbolt', 'ice-beam', 'flamethrower', 'surf', 'psychic',
        'shadow-ball', 'dragon-claw', 'stone-edge', 'close-combat', 'air-slash',
        'energy-ball', 'sludge-bomb', 'crunch', 'iron-head', 'play-rough',
        'swords-dance', 'nasty-plot', 'calm-mind', 'recover', 'roost',
        'protect', 'toxic', 'will-o-wisp', 'u-turn', 'volt-switch'
    ];

    const selected = [];

    priorityNames.forEach(moveName => {
        if (damagingMoves.includes(moveName) && selected.length < 4) {
            selected.push(moveName);
        }
    });

    if (selected.length < 4) {
        damagingMoves.forEach(moveName => {
            if (!selected.includes(moveName) && selected.length < 4) {
                selected.push(moveName);
            }
        });
    }

    while (selected.length < 4) {
        selected.push(preferSpecial ? 'coverage move' : 'utility move');
    }

    return selected.slice(0, 4);
}

function hideEvolutionChain() {
    document.getElementById('current-pokemon-evolution-chain-container').classList.add('hide');
}

function setupEvolutionChain(evolutionChain) {
    const chainContainer = document.getElementById('current-pokemon-evolution-chain-container');
    const chainImages = [
        document.getElementById('current-pokemon-evolution-0'),
        document.getElementById('current-pokemon-evolution-1'),
        document.getElementById('current-pokemon-evolution-2')
    ];
    const chainLevels = [
        document.getElementById('current-pokemon-evolution-level-0'),
        document.getElementById('current-pokemon-evolution-level-1')
    ];

    chainImages.forEach(image => {
        image.classList.add('hide');
        image.removeAttribute('src');
        image.removeAttribute('onclick');
    });

    chainLevels.forEach(level => {
        level.classList.add('hide');
        level.innerHTML = '';
    });

    const evolutionList = getEvolutionList(evolutionChain.chain);

    if (evolutionList.length <= 1) {
        chainContainer.classList.add('hide');
        return;
    }

    chainContainer.classList.remove('hide');

    for (let i = 0; i < evolutionList.length && i < 3; i++) {
        const pokemonId = filterIdFromSpeciesURL(evolutionList[i].url);

        chainImages[i].src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + pokemonId + '.png';
        chainImages[i].setAttribute('onclick', 'openInfo(' + pokemonId + ')');
        chainImages[i].classList.remove('hide');

        if (i > 0 && chainLevels[i - 1]) {
            chainLevels[i - 1].innerHTML = evolutionList[i].level ? 'Lv. ' + evolutionList[i].level : '?';
            chainLevels[i - 1].classList.remove('hide');
        }
    }
}

function getEvolutionList(chain) {
    const list = [];
    let current = chain;

    while (current) {
        let level = null;

        if (current.evolution_details && current.evolution_details[0] && current.evolution_details[0].min_level) {
            level = current.evolution_details[0].min_level;
        }

        list.push({
            name: current.species.name,
            url: current.species.url,
            level: level
        });

        current = current.evolves_to && current.evolves_to.length > 0 ? current.evolves_to[0] : null;
    }

    return list;
}

function filterIdFromSpeciesURL(url) {
    return url.split('/').filter(Boolean).pop();
}

function setupResponsiveBackground(pokemon) {
    const mainType = pokemon.types[0]?.type?.name || 'normal';
    document.getElementById('current-pokemon-responsive-background').style.background = typeColors[mainType];
}

function showPokemonTab(tabName) {
    const tabs = ['about', 'stats', 'evolution', 'moves', 'build'];

    tabs.forEach(tab => {
        document.getElementById('pokemon-tab-' + tab)?.classList.add('hide');
    });

    document.getElementById('pokemon-tab-' + tabName)?.classList.remove('hide');

    document.querySelectorAll('.info-tab').forEach(button => button.classList.remove('active'));
    document.querySelectorAll('.info-tab').forEach(button => {
        if (button.getAttribute('onclick') && button.getAttribute('onclick').includes(`'${tabName}'`)) {
            button.classList.add('active');
        }
    });
}

async function addPokemonToCompare(id) {
    const targetSlot = compareSlots.left && !compareSlots.right ? 'right' : 'left';
    await setCompareSlot(targetSlot, id);
}

async function addCurrentPokemonToCompare(slot) {
    if (!currentSelectedPokemonId) return;
    await setCompareSlot(slot, currentSelectedPokemonId);
}

async function setCompareSlot(slot, id) {
    try {
        const responsePokemon = await fetch('https://pokeapi.co/api/v2/pokemon/' + id);
        const pokemon = await responsePokemon.json();
        const responseSpecies = await fetch(pokemon.species.url);
        const species = await responseSpecies.json();

        compareSlots[slot] = { pokemon, species };
        updateComparePanel();
    } catch (error) {
        console.error(error);
    }
}

function updateComparePanel() {
    const panel = document.getElementById('compare-panel');
    const leftSlot = document.getElementById('compare-slot-left');
    const rightSlot = document.getElementById('compare-slot-right');
    const result = document.getElementById('compare-result');

    if (!panel || !leftSlot || !rightSlot || !result) return;

    panel.classList.remove('hide');
    leftSlot.innerHTML = getCompareSlotHtml(compareSlots.left, 'A');
    rightSlot.innerHTML = getCompareSlotHtml(compareSlots.right, 'B');
    leftSlot.classList.toggle('empty', !compareSlots.left);
    rightSlot.classList.toggle('empty', !compareSlots.right);

    if (compareSlots.left && compareSlots.right) {
        result.innerHTML = getCompareTableHtml(compareSlots.left.pokemon, compareSlots.right.pokemon);
    } else {
        result.innerHTML = '<span>Select two Pokemon to compare stats.</span>';
    }
}

function getCompareSlotHtml(slotData, label) {
    if (!slotData) return `Select Compare ${label}`;

    const pokemon = slotData.pokemon;
    const species = slotData.species;
    const image = getPokemonCompareImage(pokemon);
    const displayId = getDisplayPokemonIdFromInfo(pokemon, species);

    return `<img src="${image}" alt="${pokemon.name}" onerror="handlePokemonImageError(this, ${pokemon.id})">
        <h4>#${displayId} ${dressUpPayloadValue(pokemon.name)}</h4>
        <div>${getTypeContainers(pokemon.types.map(t => t.type.name))}</div>`;
}

function getPokemonCompareImage(pokemon) {
    return getPokemonImageCandidates(pokemon)[0];
}

function getCompareTableHtml(leftPokemon, rightPokemon) {
    const stats = [
        ['HP', 'hp'],
        ['ATK', 'attack'],
        ['DEF', 'defense'],
        ['SpA', 'special-attack'],
        ['SpD', 'special-defense'],
        ['SPD', 'speed']
    ];

    const leftTotal = stats.reduce((sum, stat) => sum + getPokemonStat(leftPokemon, stat[1]), 0);
    const rightTotal = stats.reduce((sum, stat) => sum + getPokemonStat(rightPokemon, stat[1]), 0);

    const rows = stats.map(([label, key]) => {
        const leftValue = getPokemonStat(leftPokemon, key);
        const rightValue = getPokemonStat(rightPokemon, key);
        return `<tr>
            <td>${label}</td>
            <td class="${leftValue > rightValue ? 'compare-win' : ''}">${leftValue}</td>
            <td class="${rightValue > leftValue ? 'compare-win' : ''}">${rightValue}</td>
        </tr>`;
    }).join('');

    return `<table class="compare-result-table">
        <tr><th>Stat</th><th>${dressUpPayloadValue(leftPokemon.name)}</th><th>${dressUpPayloadValue(rightPokemon.name)}</th></tr>
        ${rows}
        <tr>
            <td>Total</td>
            <td class="${leftTotal > rightTotal ? 'compare-win' : ''}">${leftTotal}</td>
            <td class="${rightTotal > leftTotal ? 'compare-win' : ''}">${rightTotal}</td>
        </tr>
    </table>`;
}

function closeComparePanel() {
    document.getElementById('compare-panel')?.classList.add('hide');
}

function openPokemonResponsiveInfo() {
    document.getElementById('current-pokemon-container').classList.remove('hide');
    document.getElementById('current-pokemon-container').style.display = 'flex';
    document.getElementById('current-pokemon-responsive-close').classList.remove('hide');
    document.getElementById('current-pokemon-responsive-background').classList.remove('hide');
    document.getElementById('current-pokemon-responsive-background').style.opacity = 0;

    setTimeout(function () {
        document.getElementById('current-pokemon-responsive-background').style.opacity = 1;
    }, 20);

    document.getElementsByTagName('html')[0].style.overflow = 'hidden';
}

function closePokemonInfo() {
    setTimeout(function () {
        document.getElementById('current-pokemon-container').classList.add('hide');
        document.getElementById('current-pokemon-responsive-close').classList.add('hide');
        document.getElementById('current-pokemon-responsive-background').classList.add('hide');
    }, 350);

    document.getElementById('current-pokemon-responsive-background').style.opacity = 1;

    setTimeout(function () {
        document.getElementById('current-pokemon-responsive-background').style.opacity = 0;
    }, 10);

    document.getElementsByTagName('html')[0].style.overflow = 'unset';
    slideOutPokemonInfo();
}

window.addEventListener('resize', function () {
    if (document.getElementById('current-pokemon-container').classList.contains('slide-out')) {
        document.getElementById('current-pokemon-container').classList.replace('slide-out', 'slide-in');
    }

    if (window.innerWidth > 1100) {
        document.getElementsByTagName('html')[0].style.overflow = 'unset';
    }
});

function slideOutPokemonInfo() {
    document.getElementById('current-pokemon-container').classList.remove('slide-in');
    document.getElementById('current-pokemon-container').classList.add('slide-out');
}

function slideInPokemonInfo() {
    document.getElementById('current-pokemon-container').classList.add('slide-in');
    document.getElementById('current-pokemon-container').classList.remove('slide-out');
}


function getCurrentPokemonIndexInList() {
    if (!currentSelectedPokemonId || !currentList.length) return -1;
    return currentList.findIndex(pokemon => Number(getPokemonRealId(pokemon)) === Number(currentSelectedPokemonId));
}

function openPreviousPokemon() {
    const index = getCurrentPokemonIndexInList();
    if (index > 0) openInfo(getPokemonRealId(currentList[index - 1]));
}

function openNextPokemon() {
    const index = getCurrentPokemonIndexInList();
    if (index >= 0 && index < currentList.length - 1) openInfo(getPokemonRealId(currentList[index + 1]));
}

function getTeamPokemonIds() {
    try { return JSON.parse(localStorage.getItem('teamPokemonIds')) || []; } catch (error) { return []; }
}

function setTeamPokemonIds(ids) {
    localStorage.setItem('teamPokemonIds', JSON.stringify([...new Set(ids.map(Number))].slice(0, 6)));
}

function addCurrentPokemonToTeam() { if (currentSelectedPokemonId) addPokemonToTeam(currentSelectedPokemonId); }

async function addPokemonToTeam(id) {
    const numericId = Number(id);
    const ids = getTeamPokemonIds();
    if (!ids.includes(numericId)) {
        if (ids.length >= 6) { alert('Team is full. Remove one Pokemon first.'); openTeamPanel(); return; }
        ids.push(numericId);
        setTeamPokemonIds(ids);
    }
    await openTeamPanel();
}

function removePokemonFromTeam(id) {
    setTeamPokemonIds(getTeamPokemonIds().filter(savedId => Number(savedId) !== Number(id)));
    openTeamPanel();
}

function clearTeam() { setTeamPokemonIds([]); openTeamPanel(); }

async function openTeamPanel() {
    const panel = document.getElementById('team-panel');
    if (!panel) return;
    panel.classList.remove('hide');
    await renderTeamPanel();
}

function closeTeamPanel() { document.getElementById('team-panel')?.classList.add('hide'); }

async function renderTeamPanel() {
    const slotsContainer = document.getElementById('team-slots');
    const analysisContainer = document.getElementById('team-analysis');
    if (!slotsContainer || !analysisContainer) return;
    const ids = getTeamPokemonIds();
    const teamData = await Promise.all(ids.map(id => fetchPokemonOnly(id)));
    const slotHtml = [];
    for (let i = 0; i < 6; i++) {
        const pokemon = teamData[i];
        if (!pokemon) slotHtml.push(`<div class="team-slot empty">Slot ${i + 1}</div>`);
        else slotHtml.push(`<div class="team-slot">
            <button class="remove-team-button" onclick="removePokemonFromTeam(${pokemon.id})">×</button>
            <img src="${getPokemonCompareImage(pokemon)}" alt="${pokemon.name}">
            <h4>#${getDisplayPokemonIdFromTeamPokemon(pokemon)} ${dressUpPayloadValue(pokemon.name)}</h4>
            ${getTypeContainers(pokemon.types.map(t => t.type.name))}
        </div>`);
    }
    slotsContainer.innerHTML = slotHtml.join('');
    analysisContainer.innerHTML = await getTeamAnalysisHtml(teamData.filter(Boolean));
}

async function fetchPokemonOnly(id) {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon/' + id);
    if (!response.ok) return null;
    return await response.json();
}

function getDisplayPokemonIdFromTeamPokemon(pokemon) {
    const match = pokemons.find(item => Number(getPokemonRealId(item)) === Number(pokemon.id));
    return match ? getDisplayPokemonId(match) : pokemon.id;
}

async function getTeamAnalysisHtml(team) {
    if (team.length === 0) return '<span>Add up to 6 Pokemon to analyze team weakness and coverage.</span>';
    const defense = {}; const coverage = {};
    Object.keys(typeColors).forEach(type => { defense[type] = 0; coverage[type] = 0; });
    for (const pokemon of team) {
        const multipliers = await getPokemonWeaknessMultipliers(pokemon);
        Object.keys(multipliers).forEach(type => {
            if (multipliers[type] > 1) defense[type] += 1;
            if (multipliers[type] < 1) defense[type] -= 1;
        });
        pokemon.types.forEach(typeItem => { const typeName = typeItem.type.name; if (coverage[typeName] !== undefined) coverage[typeName] += 1; });
    }
    const weakTypes = Object.entries(defense).filter(([, value]) => value > 0).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const resistTypes = Object.entries(defense).filter(([, value]) => value < 0).sort((a, b) => a[1] - b[1]).slice(0, 6);
    const coverageTypes = Object.entries(coverage).filter(([, value]) => value > 0).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const uniqueTypeCount = new Set(team.flatMap(p => p.types.map(t => t.type.name))).size;
    const score = Math.max(0, Math.min(100, 80 + resistTypes.length * 3 - weakTypes.length * 5 + uniqueTypeCount * 2));
    return `<div class="team-analysis-grid">
        <div class="analysis-box"><h4>Balance Score</h4><div class="team-score">${score}</div></div>
        <div class="analysis-box"><h4>Team Size</h4><div class="team-score">${team.length}/6</div></div>
        <div class="analysis-box"><h4>Main Weakness</h4>${formatTypeCountList(weakTypes, '+')}</div>
        <div class="analysis-box"><h4>Resistances</h4>${formatTypeCountList(resistTypes, '')}</div>
        <div class="analysis-box"><h4>Type Coverage</h4>${formatTypeCountList(coverageTypes, '×')}</div>
        <div class="analysis-box"><h4>Advice</h4><span>${getTeamAdvice(team, weakTypes)}</span></div>
    </div>`;
}

async function getPokemonWeaknessMultipliers(pokemon) {
    const multipliers = {}; Object.keys(typeColors).forEach(type => multipliers[type] = 1);
    for (const typeItem of pokemon.types) {
        const response = await fetch(typeItem.type.url);
        const typeData = await response.json();
        typeData.damage_relations.double_damage_from.forEach(item => multipliers[item.name] *= 2);
        typeData.damage_relations.half_damage_from.forEach(item => multipliers[item.name] *= 0.5);
        typeData.damage_relations.no_damage_from.forEach(item => multipliers[item.name] *= 0);
    }
    return multipliers;
}

function formatTypeCountList(typeEntries, prefix) {
    if (!typeEntries.length) return '<span>None</span>';
    return typeEntries.map(([type, count]) => `<div class="type-container" style="background:${typeColors[type] || '#EDEDED'}">${dressUpPayloadValue(type)} ${prefix}${Math.abs(count)}</div>`).join('');
}

function getTeamAdvice(team, weakTypes) {
    if (team.length < 6) return 'Add more Pokemon to improve coverage.';
    if (weakTypes.length >= 5) return 'Team has many shared weaknesses. Add different types.';
    if (weakTypes.length <= 2) return 'Good defensive balance.';
    return 'Solid team. Watch the highest weakness type.';
}
