
let contentElement;
let progressionInfoImage;
let fontImage;

window.addEventListener('load', () => {
    contentElement = document.getElementById('content');
    progressionInfoImage = document.querySelector('#toggle-progression-info img');
    fontImage = document.querySelector('#toggle-font img');

    updateStatsProgression();
    updateFont();

    document.getElementById('toggle-progression-info').addEventListener('click', () => {
        setStatsProgressionDisabled(!isStatsProgressionDisabled());
        updateStatsProgression();
    });
    document.getElementById('toggle-font').addEventListener('click', () => {
        setAlternativeFontEnabled(!isAlternativeFontEnabled());
        updateFont();
    });

    generateHeaderIds(document.body);


    marked.use({
        async: false,
        breaks: true,
        silent: false
    });

    loadGuide('content')
        .then(() => {
            modifyContent();

            let hashTarget = document.getElementById(location.hash.substring(1));
            if (hashTarget != null) hashTarget.scrollIntoView();
        })
        .catch(error => {
            console.error(error);
        });
});

function loadGuide() {
    return new Promise((resolve, reject) => {
        const onError = error => {
            contentElement.innerHTML = '<center>Failed to load guide :(</center>'
            reject(error);
        };

        fetch('guide.md')
            .then(response => {
                if (response.status !== 200) {
                    onError(`Guide document returned status ${response.status}`);
                    return;
                }

                response.text()
                    .then(markdown => {
                        contentElement.innerHTML = marked.parse(markdown);
                        resolve();
                    })
                    .catch(error => onError(error));
            })
            .catch(error => onError(error));
    });
}

function modifyContent() {
    contentElement.querySelectorAll('a[href]').forEach(link => {
        if (link.href.startsWith('/') || !(/.+:\/\/[^\/]+\.[^\/]+\/?.*/i.test(link.href))) {
            return;
        }

        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
    });

    generateHeaderIds(contentElement);
}


function isStatsProgressionDisabled() {
    return window.localStorage.getItem('disableStatsProgression') == 'true';
}

function setStatsProgressionDisabled(value) {
    return window.localStorage.setItem('disableStatsProgression', value == true);
}

function updateStatsProgression() {
    if (isStatsProgressionDisabled()) {
        document.body.classList.add('disable-stats-progression');
        progressionInfoImage.src = 'assets/images/icons/progression_info_disabled.png';
    }
    else {
        document.body.classList.remove('disable-stats-progression');
        progressionInfoImage.src = 'assets/images/icons/progression_info_enabled.png';
    }
}

function isAlternativeFontEnabled() {
    return window.localStorage.getItem('alternativeFont') == 'true';
}

function setAlternativeFontEnabled(value) {
    return window.localStorage.setItem('alternativeFont', value == true);
}

function updateFont() {
    if (isAlternativeFontEnabled()) {
        document.body.classList.add('alternative-font');
        fontImage.src = 'assets/images/icons/font_sans_serif.png';
    }
    else {
        document.body.classList.remove('alternative-font');
        fontImage.src = 'assets/images/icons/font_minecraft.png';
    }
}

function generateHeaderIds(element) {
	let subHeaders = element.querySelectorAll('h2,h3');
	for (let i = 0; i < subHeaders.length; i ++) {
		let tag = subHeaders[i].innerText.toLowerCase().replace(/[^a-z\s]/gi, '').trim().replace(/\s/g, "-");
		subHeaders[i].id = tag;
	}
}


function readNumberInput(input, minimum, maximum, allowDecimals, defaultValue) {
    const trimmedValue = input.value.trim();
    const value = parseFloat(trimmedValue);
    const isEmpty = trimmedValue == '';
    const isValid = !isNaN(value)
        && value >= minimum && value <= maximum
        && (allowDecimals || value % 1 == 0);
    
    if (isEmpty || isValid) input.classList.remove('invalid');
    else input.classList.add('invalid');

    return !isEmpty && isValid ? value : defaultValue;
}