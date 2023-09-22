chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
    // Get the active tab
    const activeTab = tabs[0];

    const url = activeTab.url;
    const downloadAllButton = document.getElementById('download-all');
    if (url !== 'https://portal.westlake.school.nz/reports') {
        downloadAllButton.textContent = 'Invalid URL';
        downloadAllButton.disabled = true
        document.getElementById('message').classList.remove('hidden')
        console.log(url)
        return
    }
    // Listen for clicks on the download all button
    document.getElementById('download-all').addEventListener('click', function () {
        console.log('Clicked')
        downloadAllButton.textContent = 'Downloading...'; // Change the button text to "Downloading..."
        downloadAllButton.disabled = true

        // Execute the content script to get the download data
        chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            function: getDownloadData
        }, function (result) {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
                downloadAllButton.textContent = 'Error Occured';
                downloadAllButton.disabled = false
                return;
            }

            downloadAllButton.textContent = 'Downloaded Successfully!';

            console.log(result)
        });
    });
});

function getDownloadData() {
    return new Promise((resolve, reject) => {
        const downloadButtons = document.querySelectorAll('.btn-success');
        const downloadData = [];

        const promises = [];

        downloadButtons.forEach(function (button) {
            const link = button.href;
            const name = button.parentNode.parentNode.children[1].textContent;
            const filename = name + '.pdf';

            const promise = fetch(link)
                .then(response => response.blob())
                .then(blob => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    a.click();
                })
                .catch(error => {
                    console.error(error);
                });

            promises.push(promise);
        });

        // Wait for all the fetch requests to complete
        Promise.all(promises).then(function () {
            resolve(downloadData);
        });
    });
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.data) {
        console.log(message.data); // Log the data received from the content script
    }
});