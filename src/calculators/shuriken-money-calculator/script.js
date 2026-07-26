window.addEventListener('DOMContentLoaded', () => {
    const resultContainer = document.getElementById('calc-shurikenmoney-result');
    const inputMagicFind = document.getElementById('calc-shurikenmoney-input-mf');
    const inputPetPriceRare = document.getElementById('calc-shurikenmoney-input-petpricerare');
    const inputPetPriceEpic = document.getElementById('calc-shurikenmoney-input-petpriceepic');
    const inputPetPriceLegendary = document.getElementById('calc-shurikenmoney-input-petpricelegendary');

    function readInput(input) {
        return readNumberInput(input, 0, Infinity, allowDecimals, true);
    }

    function calculate() {
        let magicFind = readInput(inputMagicFind);
        let petPriceRare = readInput(inputPetPriceRare);
        let petPriceEpic = readInput(inputPetPriceEpic);
        let petPriceLegendary = readInput(inputPetPriceLegendary);

        let petPriceAverage = (6*petPriceRare + 3*petPriceEpic + petPriceLegendary) / 10 * 1000000;
        let shurikenMoney = (petPriceAverage/(1/(0.004*((1.05*magicFind)/100 + 1))) - petPriceAverage/(1/(0.004*(magicFind/100 + 1)))) / 1000;

        resultContainer.innerText = Math.round(shurikenMoney * 100) / 100;
    }

    const inputChangeHandler = () => calculate();
    inputMagicFind.addEventListener('input', inputChangeHandler);
    inputPetPriceRare.addEventListener('input', inputChangeHandler);
    inputPetPriceEpic.addEventListener('input', inputChangeHandler);
    inputPetPriceLegendary.addEventListener('input', inputChangeHandler);

    calculate();
});