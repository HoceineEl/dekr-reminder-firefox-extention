document.addEventListener("DOMContentLoaded", async function () {
    try {
        const data = await browser.storage.sync.get(["dekrType", "minutes"]);
        console.log(data);

        // Check if data is defined and not empty
        if (data && Object.keys(data).length > 0) {
            const adkarTypeSelect = document.getElementById("adkarType");
            const numInput = document.getElementById("num");

            // Check if data.minutes is defined before accessing it
            if (data.minutes !== undefined) {
                numInput.value = data.minutes;
            }

            // Check if data.dekrType is defined before accessing it
            if (data.dekrType) {
                adkarTypeSelect.value = data.dekrType;
            }
        }
    } catch (error) {
        console.error("Error retrieving data from storage:", error);
    }

    document.getElementById("add").addEventListener("click", remind);
});

async function remind() {
    const adkarTypeSelect = document.getElementById("adkarType");
    const dekrType = adkarTypeSelect.value;
    const numInput = document.getElementById("num");
    const minutes = parseInt(numInput.value);

    if (isNaN(minutes)) {
        console.log("It's not a number");
    } else {
        // Save the selected values to Chrome storage for future use
        try {
            await browser.storage.sync.set({ dekrType, minutes });
            console.log("Values saved to storage.");
        } catch (error) {
            console.error("Error saving data to storage:", error);
        }

        browser.runtime.sendMessage({ minutes, dekrType }, function (response) {
            console.log(response);
        });
    }
}
