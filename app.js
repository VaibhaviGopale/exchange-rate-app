import { currencyToFlagCode } from "./currency-to-flag.js";

const inputSourceCurrency = document.getElementById('inputSourceCurrency');
const currencySelectElements = document.querySelectorAll(".currency-converter__select select");

const imageSourceCurrency = document.getElementById('imgSourceCurrency');
const selectSourceCurrency = document.getElementById('selectSourceCurrency');
const imageTargetCurrency = document.getElementById('imgTargetCurrency');
const selectTargetCurrency = document.getElementById('selectTargetCurrency');

const buttonSwap = document.getElementById('btnSwap');

const exchangeRateText = document.getElementById('exchangeRateText');
const buttonConvert = document.getElementById('btnConvert');

let isFetching = false;
let conversionRate = 0;

let sourceCurrencyValue = 0;
let targetCurrencyValue = 0;

buttonSwap.addEventListener('click', () => {
    [selectSourceCurrency.value, selectTargetCurrency.value]
    =
    [selectTargetCurrency.value, selectSourceCurrency.value];

    [imageSourceCurrency.src, imageTargetCurrency.src]
    =
    [imageTargetCurrency.src, imageSourceCurrency.src];

    inputSourceCurrency.value = targetCurrencyValue;

    if (isFetching) {
        conversionRate = 1 / conversionRate;
    }

    updateExchangeRate();
});

inputSourceCurrency.addEventListener('input', event => {
    if (isFetching && inputSourceCurrency.value > 0) {
        updateExchangeRate();
    }
});

buttonConvert.addEventListener('click', async () => {
    if (inputSourceCurrency.value <= 0) {
        alert('Please enter a valid amount.');
        return;
    }

    exchangeRateText.textContent = 'Fetching exchange rate, please wait..'

    const selectSourceCurrencyValue = selectSourceCurrency.value;
    const selectTargetCurrencyValue = selectTargetCurrency.value;
    
    try {
        const response = await fetch (`https://v6.exchangerate-api.com/v6/a324e93a6e797b3b80d68bfd/pair/${selectSourceCurrencyValue}/${selectTargetCurrencyValue}`);
        const data = await response.json();
        
        conversionRate = data.conversion_rate;
        
        isFetching = true;
        updateExchangeRate();
    } catch(error) {
        console.log('Error fetching exchange rate!',error);
        exchangeRateText.textContent = 'Error fetching exchange rate!'
    }
});

function updateExchangeRate() {
    sourceCurrencyValue = parseFloat(inputSourceCurrency.value);
    targetCurrencyValue = (sourceCurrencyValue * conversionRate);

    if (isNaN(sourceCurrencyValue) || sourceCurrencyValue <= 0 || !conversionRate) {
        exchangeRateText.textContent =
            `0 ${selectSourceCurrency.value} = 0 ${selectTargetCurrency.value}`;
        return;
    }

    exchangeRateText.textContent =
    `${formatCurrency(sourceCurrencyValue.toFixed(2))} ${selectSourceCurrency.value} 
    =
    ${formatCurrency(targetCurrencyValue.toFixed(2))} ${selectTargetCurrency.value}`;
}


currencySelectElements.forEach(selectElement => {
    for (const [currency, flagCode] of Object.entries(currencyToFlagCode)) {
        const newOptionElement = document.createElement("option");
        newOptionElement.value = currency;
        newOptionElement.textContent = currency;
        selectElement.appendChild(newOptionElement);
    }

    selectElement.addEventListener('change', () => {
        inputSourceCurrency.value = 0;
        isFetching = false;
        updateExchangeRate();
        changeFlag(selectElement);
    });

    if (selectElement.id === 'selectTargetCurrency') {
        selectElement.value = 'IDR';
    }
});

function changeFlag(selectElement) {
    const selectValue =selectElement.value;
    const selectId = selectElement.id;
    const flagCode = currencyToFlagCode[selectValue];
    
    if (selectId === 'selectSourceCurrency') {
        imageSourceCurrency.src = `https://flagcdn.com/w40/${flagCode}.png`
    } else {
        imageTargetCurrency.src = `https://flagcdn.com/w40/${flagCode}.png`
    }
}

function formatCurrency(number) {
    return new Intl.NumberFormat().format(number);
}
