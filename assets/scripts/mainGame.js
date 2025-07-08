/*
This file contains the code directly relevant to the main game screen;
i.e. everything after the login screen and before the win screen.
*/

import { client } from "./login.js";

export const LOCATION_ID_PREFIX = 420000;
export const DESK_ID = LOCATION_ID_PREFIX;
export const ITEM_ID_PREFIX = 69000;
export const ITEM_THAT_DOES_NOTHING_ID = ITEM_ID_PREFIX + 420;

var keysEnabled;

// Display the main game screen, complete with a desk and the given number of chests.
export function setupMainGameContainer(numChests) {
    // Create and display the ul tag representing the desk.
    var desk = document.createElement("ul");
    $(desk).attr("id", "desk");
    $(desk).text("Click for a free item!");
    // Make it so the desk sends a check when clicked on.
    $(desk).click(() => {
        client.check(DESK_ID);
    })
    $("#locations-list").append(desk);

    // Create and display a ul tag representing each of the chests.
    for (var i = 1; i <= numChests; i++) {
        var chest = document.createElement("ul");
        $(chest).attr("id", "chest" + i);
        
        // The chest will be locked by default.
        $(chest).text("Chest " + i + " (Locked)");
        $("#locations-list").append(chest);

        // Unlock the chest if keys are disabled or if its corresponding key has been received.
        // For some reason, client.items.received is always empty, even when it shouldn't be.
        if (!keysEnabled || client.items.received.includes(ITEM_ID_PREFIX + i)) {
            displayChestUnlocked(i);
        }
    }

    // If any location has been checked on/before startup, display that.
    for (let locationId of client.room.checkedLocations) {
        displayLocationChecked(locationId);
    }

    // Show the main game container now that it is ready!
    $("#main-game-container").show();
}

// This setter method allows keysEnabled to be accessed in other JS files.
export function setKeysEnabled(newKeysEnabled) {
    keysEnabled = newKeysEnabled;
}

// Updates the appearance and functionality of the location with the given ID to show it has been checked.
export function displayLocationChecked(locationId) {
    if (locationId == DESK_ID) {
        $("#desk").text("No more free items.");

        // Remove the click function.
        $("#desk").prop("onclick", null).off("click");
    } else { // if the location is a chest
        var chestNumber = locationId - LOCATION_ID_PREFIX;
        var chestID = "#chest" + chestNumber;
        $(chestID).text("Chest " + chestNumber + " (Empty)");

        // Remove the click function.
        $(chestID).prop("onclick", null).off("click");
    }
}

// Updates the appearance and functionality of the chest with the given ID to show it has been unlocked.
export function displayChestUnlocked(chestNumber) {
    var chestID = "#chest" + chestNumber;
    $(chestID).text("Chest " + chestNumber + " (Unlocked)");

    // Now that the chest is unlocked, clicking it should send a check.
    $(chestID).click(() => {
        client.check(LOCATION_ID_PREFIX + chestNumber);
    });
}