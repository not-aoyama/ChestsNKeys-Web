/*
This file contains the code directly relevant to the main game screen;
i.e. everything after the login screen and before the win screen.
*/

import * as $ from "jquery";
import { client } from "./login.js";
// @ts-ignore
import freeItemSvg from "bundle-text:../../assets/images/Free Item.svg";
// @ts-ignore
import noMoreFreeItemsSvg from "bundle-text:../../assets/images/No More Free Item.svg";
// @ts-ignore
import emptyChestSvg from "bundle-text:../../assets/images/Empty Chest.svg";
// @ts-ignore
import lockedChestSvg from "bundle-text:../../assets/images/Locked Chest.svg";
// @ts-ignore
import unlockedChestSvg from "bundle-text:../../assets/images/Unlocked Chest.svg";

export const LOCATION_ID_PREFIX = 420000;
export const DESK_ID = LOCATION_ID_PREFIX;
export const ITEM_ID_PREFIX = 69000;
export const ITEM_THAT_DOES_NOTHING_ID = ITEM_ID_PREFIX + 420;

// Whether keys are enabled in this slot. This is determined by reading the slot data from the server.
var keysEnabled : boolean;

// The number of possible hue values for an HSL color. This will be important later.
const NUMBER_HUES = 300;

// Display the main game screen, complete with a desk and the given number of chests.
export function setupMainGameContainer(numChests : number) : void {
    // Create and display the li tag representing the desk.
    var desk = document.createElement("li");
    $(desk).attr("id", "desk");
    // The li tag will contain an svg tag that is imported from an SVG file.
    $(desk).append(freeItemSvg);

    // main-game.css will display that this desk is clickable if it's part of the "clickable" class.
    $(desk).attr("class", "clickable");

    // Add a cursor tooltip to the desk.
    $(desk).attr("title", "Click for a free item!");

    // Make it so the desk sends a check when clicked on.
    $(desk).click(() => {
        client.check(DESK_ID);
    })

    // Display the desk among the other locations!
    $("#locations-list").append(desk);

    for (var i = 1; i <= numChests; i++) {
        // Create the li tag representing the chest.
        var chest = document.createElement("li");
        $(chest).attr("id", "chest" + i);

        // Add a number label to the chest.
        var label = document.createElement("span");
        $(label).text(i);
        $(chest).append(label);

        // Give the chest a unique color so it stands out!
        var hue = NUMBER_HUES / numChests * i;
        $(chest).css("fill", "hsl(" + hue + ", 90%, 50%)");

        /*
        Add this chest to the displayed locations.
        We have to do this before any SVG is added, or else displayChestUnlocked() will reference an element that 
        doesn't yet exist on the page and will therefore fail.
        */
        $("#locations-list").append(chest);

        // Unlock the chest if keys are disabled or if its corresponding key has been received.
        if (!keysEnabled || client.items.received.map(item => item.id).includes(ITEM_ID_PREFIX + i)) {
            displayChestUnlocked(i);
        }
        // Otherwise, the chest will be locked.
        else {
            // Create a tooltip for the li
            $(chest).attr("title", "Chest " + i + " (Locked)");

            // Add the SVG icon inside of the li. We have to make a copy each time.
            $(chest).append(lockedChestSvg);
        }

        // If any location has been checked on/before startup, display that.
        for (let locationId of client.room.checkedLocations) {
            displayLocationChecked(locationId);
        }

        // Show the main game container now that it is ready!
        $("#main-game-container").show();
    }
}

// This setter method allows keysEnabled to be accessed in other JS files.
export function setKeysEnabled(newKeysEnabled : boolean) : void {
    keysEnabled = newKeysEnabled;
}

// Updates the appearance and functionality of the location with the given ID to show it has been checked.
export function displayLocationChecked(locationId : number) : void {
    if (locationId == DESK_ID) {
        // Empty the SVG from the li tag so it can be replaced with a new SVG.
        $("#desk svg").remove();

        // Return the cursor to normal. (It was a pointer before, to show that this was clickable.)
        $("#desk").attr("class", null);

        // Change the tooltip
        $("#desk").attr("title", "No more free item.");

        // Remove the click function.
        $("#desk").prop("onclick", null).off("click");

        // Put the SVG tag inside of the li.
        $("#desk").append(noMoreFreeItemsSvg);
    } else { // if the location is a chest
        var chestNumber = locationId - LOCATION_ID_PREFIX;
        var chestID = "#chest" + chestNumber;

        // Empty the SVG from the li tag so it can be replaced with a new SVG.
        $(chestID + " svg").remove();

        // Return the cursor to normal. (It was a pointer before, to show that this was clickable.)
        $(chestID).attr("class", null);

        // Change the tooltip
        $(chestID).attr("title", "Chest " + chestNumber + " (Empty)");

        // Remove the click function.
        $(chestID).prop("onclick", null).off("click");

        // Put the SVG tag inside of the li.
        $(chestID).append(emptyChestSvg);
    }
}

// Updates the appearance and functionality of the chest with the given ID to show it has been unlocked.
export function displayChestUnlocked(chestNumber : number) : void {
    var chestID = "#chest" + chestNumber;

    // Empty the SVG from the li tag so it can be replaced with a new SVG.
    $(chestID + " svg").remove();

    // Edit the li's tooltip
    $(chestID).attr("title", "Chest " + chestNumber + " (Unlocked)");

    // main-game.css gives all "clickable"-class objects a pointer cursor to show they can be clicked.
    $(chestID).attr("class", "clickable");

    // Now that the chest is unlocked, clicking it should send a check.
    $(chestID).click(() => {
        client.check(LOCATION_ID_PREFIX + chestNumber);
    });

    // Add the SVG icon.
    $(chestID).append(unlockedChestSvg);

    // Play a "chest unlocked" sound.
    playSound("chest-unlock-sound");
}

function playSound(soundId : string) : void {
    var audioToPlay : HTMLElement = document.getElementById(soundId);
    if (audioToPlay instanceof HTMLAudioElement)
        audioToPlay.play();
    else
        console.warn("Tried to play audio with ID " + soundId + ", but the element with this ID either doesn't " + 
            "exist or is not an audio element.");
}