
const konamiCodeKeycodes = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA', 'Enter'
];
const petDropFrameCount = 180;
const petDropFps = 60;

let guideContainerElement;
let progressionInfoImage;
let fontImage;
let petDropOverlayImage;

let currentKonamiCodeIndex = 0;
let petDropFrames = null;
let petDropAnimationFrameRequest = null;



if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('serviceWorker.js', {
        updateViaCache: 'none'
    }).then(registration => {
        function handleNewServiceWorker() {
            const newServiceWorker = registration.installing;
            newServiceWorker.addEventListener('statechange', () => {
                // ignore first install
                if (newServiceWorker.state != 'activated' || !navigator.serviceWorker.controller) return;

                document.getElementById('update-notice')?.removeAttribute('hidden');
            });
        }

        if (registration.installing) handleNewServiceWorker();
        registration.addEventListener('updatefound', () => handleNewServiceWorker());
    });
}

window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();

    const installButton = document.getElementById('button-install');
    // override click event because beforeinstallprompt gets re-called on prompt cancellation
    installButton.onclick = () => {
        event.prompt().then(result => {
            if (result.outcome == 'accepted') {
                installButton.setAttribute('hidden', '');
            }
        });
    };
    installButton.removeAttribute('hidden');
});

window.addEventListener('DOMContentLoaded', () => {
    Array.from(document.getElementsByClassName('tabs-container')).forEach(tabsContainer => {
        openTabHeader(tabsContainer.getElementsByClassName('tab-header')[0]);
    });

    Array.from(document.getElementsByClassName('tab-header')).forEach(tabHeader => {
        tabHeader.addEventListener('click', event => openTabHeader(event.currentTarget));
    });

    window.addEventListener('hashchange', () => openTabsForHash());
    openTabsForHash();
});

window.addEventListener('load', () => {
    guideContainerElement = document.getElementById('guide');
    progressionInfoImage = document.querySelector('#toggle-progression-info img');
    fontImage = document.querySelector('#toggle-font img');
    petDropOverlayImage = document.getElementById('pet-drop-overlay');

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

            // scroll to hash on initial page load
            if (getNavigationType() === 'navigate') {
                const hash = getCleanHash();
                if (hash != null) {
                    const hashTarget = document.getElementById(hash);
                    if (hashTarget != null && guideContainerElement.contains(hashTarget)) {
                        scrollToHash();
                    }
                }
            }
        })
        .catch(error => {
            console.error(error);
        });
});

window.addEventListener('keydown', event => {
    handleKonamiCode(event.code);
});



function openTabHeader(targetTab) {
    let opened = false;

    Array.from(targetTab.parentElement.getElementsByClassName('tab-header')).forEach(currentTab => {
        const targetId = currentTab.dataset.tabId;
        const targetElement = targetId !== undefined ? document.getElementById(targetId) : null;

        if (currentTab == targetTab) {
            currentTab.classList.add('tab-selected');
            if (targetElement) {
                opened = targetElement.hasAttribute('hidden');
                targetElement.removeAttribute('hidden');
            }
        }
        else {
            currentTab.classList.remove('tab-selected');
            targetElement?.setAttribute('hidden', '');
        }
    });

    return opened;
}

function openTabsForHash() {
    const hash = getCleanHash();
    if (hash == null) return;

    const hashTarget = document.getElementById(hash);
    if (hashTarget == null) return;

    let hashRefreshRequired = false;

    Array.from(document.getElementsByClassName('tab-header')).forEach(tabHeader => {
        if (tabHeader == hashTarget) {
            hashRefreshRequired = openTabHeader(tabHeader);
            return;
        }

        const tabId = tabHeader.dataset.tabId;
        const tabElement = tabId !== undefined ? document.getElementById(tabId) : null;
        if (tabElement != null && tabElement.contains(hashTarget)) {
            hashRefreshRequired = openTabHeader(tabHeader);
        }
    });

    if (hashRefreshRequired) scrollToHash();
}

function loadGuide() {
    return new Promise((resolve, reject) => {
        const onError = error => {
            guideContainerElement.innerHTML = '<center>Failed to load guide :(</center>'
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
                        guideContainerElement.innerHTML = marked.parse(markdown);
                        resolve();
                    })
                    .catch(error => onError(error));
            })
            .catch(error => onError(error));
    });
}

function modifyContent() {
    guideContainerElement.querySelectorAll('a[href]').forEach(link => {
        if (new URL(link.href).origin == new URL(window.location).origin) {
            return;
        }

        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
    });

    generateHeaderIds(guideContainerElement);
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

function getNavigationType() {
    const entry = performance.getEntriesByType('navigation')[0];
    if (entry && typeof entry.type === 'string') {
        return entry.type;
    }
    if (performance.navigation) {
        const legacyType = performance.navigation.type;
        return legacyType === 1 ? 'reload'
            : legacyType === 2 ? 'back_forward'
            : 'navigate';
    }
    return undefined;
}

function loadPetDropFrames() {
    if (petDropFrames != null) return;

    function loadImage(src) {
        return new Promise((resolve, reject) => {
            let image = new Image();
            image.onload = resolve(image);
            image.onError = error => reject(error);
            image.src = src;
        });
    }

    let promises = [];
    for (let i = 0; i < petDropFrameCount; i ++) {
        promises[i] = loadImage(`assets/images/pet-drop/frame${i.toString(10).padStart(3, '0')}.webp`);
    }
    Promise.all(promises)
        .then(frames => {
            petDropFrames = frames;
            console.log('Pet drop frames loaded');
        })
        .catch(() => console.error('Failed to load pet drop frames'));
}

function handleKonamiCode(keyCode) {
    if (keyCode == konamiCodeKeycodes[currentKonamiCodeIndex]) {
        currentKonamiCodeIndex ++;

        // load frames only when about to correctly enter code
        if (currentKonamiCodeIndex == 4) loadPetDropFrames();

        if (currentKonamiCodeIndex >= konamiCodeKeycodes.length) {
            currentKonamiCodeIndex = 0;
            showPetDrop();
        }
    }
    else {
        currentKonamiCodeIndex = keyCode == konamiCodeKeycodes[0] ? 1 : 0;
    }
}

function showPetDrop() {
    if (petDropFrames == null) return;

    if (petDropAnimationFrameRequest != null) {
        cancelAnimationFrame(petDropAnimationFrameRequest);
    }
    
    let frameIndex = 0;
    let previousTimestamp = null;
    function frame() {
        if (frameIndex >= petDropFrames.length) {
            petDropAnimationFrameRequest = null;
            petDropOverlayImage.setAttribute('hidden', '');
            return;
        }
        
        const now = Date.now();
        const deltaTime = previousTimestamp != null ? (now - previousTimestamp) / 1000 : 0;
        previousTimestamp = now;

        petDropOverlayImage.src = petDropFrames[Math.floor(frameIndex)].src;
        frameIndex += deltaTime * petDropFps;
        petDropAnimationFrameRequest = window.requestAnimationFrame(frame);
    }
    petDropAnimationFrameRequest = window.requestAnimationFrame(frame);
    petDropOverlayImage.removeAttribute('hidden');
}

function getCleanHash() {
    let hash = window.location.hash;
    if (!hash || hash == '' || hash == '#') return null;
    if (hash.startsWith('#')) hash = hash.substring(1);
    return hash;
}

function scrollToHash() {
    openTabsForHash();
    window.location.replace(window.location.hash);
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