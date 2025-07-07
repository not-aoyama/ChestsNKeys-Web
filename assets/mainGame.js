/*
This file contains the code directly relevant to the main game screen;
i.e. everything after the login screen and before the win screen.
*/

import { client } from "./login.js";

const LOCATION_ID_PREFIX = 420000;
const DESK_ID = LOCATION_ID_PREFIX;

var keysEnabled;

// Display the main game screen, complete with a desk and the given number of chests.
export function setupMainGameContainer(numChests) {
    // Create and display the ul tag representing the desk.
    var desk = document.createElement("ul");
    $(desk).attr("id", "desk");
    $(desk).text("Click for a free item!");
    $(desk).click(() => {
        client.check(DESK_ID);
        console.log("Location checked.");
    })
    $("#locations-list").append(desk);
    // If the desk has already been checked on/before startup, show it in the GUI.
    if (client.room.checkedLocations.includes(DESK_ID))
        displayLocationChecked(DESK_ID);

    // Create and display a ul tag representing each of the chests.
    for (var i = 1; i <= numChests; i++) {
        var chest = document.createElement("ul");
        $(chest).attr("id", "chest" + i);
        $(chest).text("Chest " + i);
        $("#locations-list").append(chest);
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
    // So far, this function is only functional with the desk. Will implement everything else later.
    if (locationId == DESK_ID) {
        $("#desk").text("No more free items.");
        // Remove the click function.
        $("#desk").prop("onclick", null).off("click");
    }
}