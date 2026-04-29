window.addEventListener('DOMContentLoaded', () => {
    const resultContainer = document.getElementById('calc-dropchance-result');
    const inputMagicFind = document.getElementById('calc-dropchance-input-mf');
    const inputPetLuck = document.getElementById('calc-dropchance-input-pl');
    const inputKills = document.getElementById('calc-dropchance-input-kills');

    const rarities = {
        any: { name: 'Any', class: 'color-white' },
        rare: { name: 'Rare', class: 'color-blue' },
        epic: { name: 'Epic', class: 'color-dark-purple' },
        legendary: { name: 'Legendary', class: 'color-gold' }
    };

    const addEntry = (table, rarity, chance, extraInfo = '') => {
        let row = document.createElement('tr');

        let column1 = document.createElement('td');
        column1.innerText = rarity.name + ':';
        column1.classList.add(rarity.class);
        row.appendChild(column1);
        let column2 = document.createElement('td');
        column2.innerText = (Math.round(chance * 10000) / 100) + '%';
        row.appendChild(column2);
        let column3 = document.createElement('td');
        let em = document.createElement('em');
        em.innerText = extraInfo;
        column3.appendChild(em);
        row.appendChild(column3);

        table.appendChild(row);
    };

    const readInput = (input, minimum = 0, allowDecimals = true) => {
        return readNumberInput(input, minimum, Infinity, allowDecimals, minimum);
    };

    const calculateDropChance = (initialChance, magicFind, petLuck) => {
        return initialChance * (1 + (magicFind + petLuck)/100);
    };

    const calculateAverageKills = chance => {
        return Math.ceil(1/chance);
    };

    const calculate = () => {
        let magicFind = readInput(inputMagicFind);
        let petLuck = readInput(inputPetLuck);
        let kills = readInput(inputKills, 1, false);

        let anyChance = calculateDropChance(0.004, magicFind, petLuck);
        let rareChance = calculateDropChance(0.0024, magicFind, petLuck);
        let epicChance = calculateDropChance(0.0012, magicFind, petLuck);
        let legendaryChance = calculateDropChance(0.0004, magicFind, petLuck);

        const withKills = kills > 1;
        if (withKills) {
            anyChance = 1 - Math.pow(1 - anyChance, kills);
            rareChance = 1 - Math.pow(1 - rareChance, kills);
            epicChance = 1 - Math.pow(1 - epicChance, kills);
            legendaryChance = 1 - Math.pow(1 - legendaryChance, kills);
        }


        while (resultContainer.firstChild) {
            resultContainer.removeChild(resultContainer.lastChild);
        }

        let header = document.createElement('h3');
        header.innerText = 'Result:'
        resultContainer.appendChild(header);

        let table = document.createElement('table');
        addEntry(table, rarities.any, anyChance, !withKills ? `(${calculateAverageKills(anyChance)} kills on average)` : '');
        addEntry(table, rarities.rare, rareChance, !withKills ? `(${calculateAverageKills(rareChance)} kills on average)` : '');
        addEntry(table, rarities.epic, epicChance, !withKills ? `(${calculateAverageKills(epicChance)} kills on average)` : '');
        addEntry(table, rarities.legendary, legendaryChance, !withKills ? `(${calculateAverageKills(legendaryChance)} kills on average)` : '');
        resultContainer.appendChild(table);
    };

    const inputChangeHandler = () => calculate();
    inputMagicFind.addEventListener('input', inputChangeHandler);
    inputPetLuck.addEventListener('input', inputChangeHandler);
    inputKills.addEventListener('input', inputChangeHandler);

    calculate();
});