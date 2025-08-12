
// --- Debug Toggle ---
const DEBUG = false;

let customIconSetsText = '[]';
let customIconsJsonText = '[]';
let customProfileIconsText = '[]';

(async function() {
    if (DEBUG) console.log('[CSI] Plugin starting...');

    try {

        // Load remote sets from GitHub
        const setsResponse = await fetch('https://raw.githubusercontent.com/ErisuGreyrat/Custom-League-of-Legends-Icons-Sets/refs/heads/main/summoner-icon-sets.json');
        if (!setsResponse.ok) throw new Error('Failed to fetch remote sets');
        customIconSetsText = await setsResponse.text();
        if (DEBUG) console.log('[CSI] ✅ Successfully fetched remote summoner-icon-sets.json.');

        // Load local summoner-icons.json
        const localSummonerIconsUrl = 'https://plugins/Custom-Summoner-Icons/summoner-icons.json';
        const summonerIconsResponse = await fetch(localSummonerIconsUrl);
        if (!summonerIconsResponse.ok) throw new Error(`Failed to fetch local summoner-icons.json from ${localSummonerIconsUrl}`);
        customIconsJsonText = await summonerIconsResponse.text();
        if (DEBUG) console.log('[CSI] ✅ Successfully loaded local summoner-icons.json.');

        // Load local profile-icons.json
        const localProfileIconsUrl = 'https://plugins/Custom-Summoner-Icons/profile-icons.json';
        const profileIconsResponse = await fetch(localProfileIconsUrl);
        if (!profileIconsResponse.ok) throw new Error(`Failed to fetch local profile-icons.json from ${localProfileIconsUrl}`);
        customProfileIconsText = await profileIconsResponse.text();
        if (DEBUG) console.log('[CSI] ✅ Successfully loaded local profile-icons.json.');

        const originalXHR = window.XMLHttpRequest;
        window.XMLHttpRequest = function() {
            const xhr = new originalXHR();
            const originalOpen = xhr.open;

            xhr.open = function(method, url, ...args) {
                if (typeof url !== 'string') {
                    return originalOpen.apply(this, [method, url, ...args]);
                }

                let interceptTarget = null;
                let responseText = null;

                if (url.includes('summoner-icon-sets.json')) {
                    interceptTarget = 'summoner-icon-sets.json';
                    responseText = customIconSetsText;
                } else if (url.includes('summoner-icons.json')) {
                    interceptTarget = 'summoner-icons.json';
                    responseText = customIconsJsonText;
                } else if (url.includes('profile-icons.json')) {
                    interceptTarget = 'profile-icons.json';
                    responseText = customProfileIconsText;
                }

                if (interceptTarget) {
                    if (DEBUG) console.log(`[CSI] 🎉 INTERCEPTED XHR request for ${interceptTarget}`);

                    Object.defineProperties(xhr, {
                        status: { value: 200, writable: true },
                        statusText: { value: 'OK', writable: true },
                        responseText: { value: responseText, writable: true },
                        response: { value: responseText, writable: true },
                        readyState: { value: 4, writable: true }
                    });

                    const originalSend = xhr.send;
                    xhr.send = function() {
                        setTimeout(() => {
                            if (xhr.onreadystatechange) xhr.onreadystatechange();
                            if (xhr.onload) xhr.onload();
                        }, 1);
                    };
                }

                return originalOpen.apply(this, [method, url, ...args]);
            };
            return xhr;
        };
        if (DEBUG) console.log('[CSI] ✅ XHR intercept is active. Plugin is fully ready.');

    } catch (error) {
        console.error('[CSI] ❌ Plugin setup failed.', error);
    }
})();

export default function() {};