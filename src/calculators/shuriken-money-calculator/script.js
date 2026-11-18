window.addEventListener('DOMContentLoaded', () => {

    const weirdHypixelRNGCalculationCoefficient = 0.6;
    const petDropChanceAny = 0.01 * weirdHypixelRNGCalculationCoefficient;


    const resultContainer = document.getElementById('calc-shurikenmoney-result');
    const inputPetPriceRare = document.getElementById('calc-shurikenmoney-input-petpricerare');
    const inputPetPriceEpic = document.getElementById('calc-shurikenmoney-input-petpriceepic');
    const inputPetPriceLegendary = document.getElementById('calc-shurikenmoney-input-petpricelegendary');

    function readInput(input) {
        return readNumberInput(input, 0, Infinity, true, 0);
    }

    function calculate() {
        let petPriceRare = readInput(inputPetPriceRare);
        let petPriceEpic = readInput(inputPetPriceEpic);
        let petPriceLegendary = readInput(inputPetPriceLegendary);

        let petPriceAverage = (6*petPriceRare + 3*petPriceEpic + petPriceLegendary) / 10 * 1000000;
        let shurikenMoney = (
                petPriceAverage/(1/(petDropChanceAny*1.05))
                -
                petPriceAverage/(1/(petDropChanceAny))
            ) / 1000;

        resultContainer.innerText = Math.round(shurikenMoney * 100) / 100;
    }

    const inputChangeHandler = () => calculate();
    inputPetPriceRare.addEventListener('input', inputChangeHandler);
    inputPetPriceEpic.addEventListener('input', inputChangeHandler);
    inputPetPriceLegendary.addEventListener('input', inputChangeHandler);

    calculate();
});