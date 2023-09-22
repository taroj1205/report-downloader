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

            downloadAllButton.textContent = 'Successful!';

            console.log(result)
        });
    });
});

function getDownloadData() {
    return new Promise((resolve, reject) => {
        try {
            const downloadButtons = document.querySelectorAll('.btn-success');

            downloadButtons.forEach(function (button) {
                const link = button.href;
                const name = button.parentNode.parentNode.querySelector('td:nth-child(2)').textContent;
                const filename = name + '.pdf'; // Concatenate name with '.pdf'

                fetch(link)
                    .then(response => response.blob())
                    .then(blob => {
                        const blobUrl = URL.createObjectURL(blob);

                        const a = document.createElement('a');
                        a.href = blobUrl;
                        a.target = '_blank';
                        a.download = filename;
                        a.click();

                        // Clean up the Blob URL after the download
                        URL.revokeObjectURL(blobUrl);
                    })
                    .catch(error => {
                        console.error(error);
                    });
            });

            resolve(); // Resolve the promise when all downloads are initiated
        } catch (error) {
            reject(error);
        }
    });
}


chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.data) {
        console.log(message.data); // Log the data received from the content script
    }
});