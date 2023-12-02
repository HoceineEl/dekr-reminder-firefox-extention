

console.log("in background script");

// Initialize default values
let defaultDuration = 1.0;
let dekrType = "random";

browser.runtime.onInstalled.addListener(async ({ reason }) => {
    // Set initial values in Chrome storage
    browser.storage.sync.set({ dekrType, minutes: defaultDuration }, function () {
        console.log("Values saved to storage for the first time.");
    });
});

function createAlarm() {
    // Fetch values from Chrome storage and create the alarm
    browser.storage.sync.get(["dekrType", "minutes"], function (data) {
        dekrType = data && data.dekrType ? data.dekrType : "random";
        defaultDuration = data && data.minutes ? data.minutes : 1;
        console.log('in create alarm min:' + defaultDuration + ' type : ' + dekrType)
        browser.alarms.create("dekr-reminder", { periodInMinutes: defaultDuration });
    });
}

createAlarm();

browser.alarms.onAlarm.addListener(function (alarm) {
    // Fetch values from Chrome storage before making the request
    browser.storage.sync.get(["dekrType"], function (data) {
        dekrType = data && data.dekrType ? data.dekrType : "random";

        const url = "https://corsproxy.io/?https://ayah.nawafdev.com/api/dekr?types=" + dekrType;
        console.log(url);
        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                let dekr = data.content;
                let category = data.category;
                browser.notifications.create("my-notification", {
                    type: "basic",
                    iconUrl: "./images/icon.png",
                    title: dekrType === "random" ? "" : category,
                    message: dekr,
                    eventTime: Date.now() + 50000,
                }, function (notificationID) {
                    console.log("Displayed the notification");
                });
            })
            .catch((error) => console.error(error));
    });
});

browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // Update values in Chrome storage when a message is received
    defaultDuration = request.minutes * 1.0;
    dekrType = request.dekrType;

    browser.storage.sync.set({ dekrType, minutes: defaultDuration }, function () {
        console.log("Values saved to storage.");
    });

    createAlarm();
    sendResponse({ success: true });
});
