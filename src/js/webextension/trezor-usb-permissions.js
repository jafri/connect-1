const VERSION = '8.0.0';
const versionN = VERSION.split('.').map(s => parseInt(s));
const DIRECTORY = `${ versionN[0] }${ (versionN[1] > 0 ? `.${versionN[1]}` : '') }/`;
const url = 'https://connect.trezor.io/' + DIRECTORY;

/* Handling messages from usb permissions iframe */
function switchToPopupTab(event) {
    window.removeEventListener('beforeunload', switchToPopupTab);

    if (!event) {
        // triggered from 'usb-permissions-close' message
        // close current tab
        chrome.tabs.query({
            currentWindow: true,
            active: true,
        }, (current) => {
            if (current.length < 0) return;
            chrome.tabs.remove(current[0].id);
        });
    }

    // find tab by popup pattern and switch to it
    chrome.tabs.query({
        url: url + 'popup.html',
    }, (tabs) => {
        if (tabs.length < 0) return;
        chrome.tabs.update(tabs[0].id, { active: true });
    });
}

window.addEventListener('message', function (event) {
    if (event.data === 'usb-permissions-init') {
        const iframe = document.getElementById('trezor-usb-permissions');
        iframe.contentWindow.postMessage({
            type: 'usb-permissions-init',
            extension: chrome.runtime.id,
        }, '*');
    } else if (event.data === 'usb-permissions-close') {
        switchToPopupTab();
    }
});

window.addEventListener('beforeunload', switchToPopupTab);
window.addEventListener('load', function () {
    const instance = document.createElement('iframe');
    instance.id = 'trezor-usb-permissions';
    instance.frameBorder = '0';
    instance.width = '100%';
    instance.height = '100%';
    instance.style.border = '0px';
    instance.style.width = '100%';
    instance.style.height = '100%';
    instance.setAttribute('src', url + 'extension-permissions.html');
    instance.setAttribute('allow', 'usb');

    if (document.body) {
        document.body.appendChild(instance);
    }
});
