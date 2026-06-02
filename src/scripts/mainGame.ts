/*
This file contains the code directly relevant to the main game screen;
i.e. everything after the login screen and before the win screen.
*/

import * as $ from "jquery";
import {Item} from "archipelago.js";
import { client } from "./login.js";
import { areSoundsEnabled, getVolume } from "./settings.js";
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
export const ITEM_ID_PREFIX = 69000;
export const ITEM_THAT_DOES_NOTHING_ID = ITEM_ID_PREFIX + 420;

// URLs for sounds
const CHEST_UNLOCK_SOUND = "assets/sounds/815493__xkeril__mechanical-switch-latch-02.wav";
const CHEST_OPEN_SOUND = "assets/sounds/771164__steprock__treasure-chest-open.mp3";

// How many total chests there are in this slot. This is determined by counting how many locations there are in the slot.
var numberChests : number;

// How many chests are locked in this slot. This is determined by reading the slot data from the server.
var numberLockedChests : number;

// How many chests need to be opened in order to goal. This is determined by reading the slot data from the server.
var numberRequiredChests : number;

/*
So, here's the thing. At first, before the player does anything, the client processes all the checks that have happened
in the history of the multiworld. So, a bunch of chests are "opened" without the player actually doing anything during
this session. During this time, we consider the game to be "loading".

To start with, the game is in a "loading" state, so this variable is true. Once it's set to false, that means every
check that happens from here on out is a result of the player's current actions.
*/
var isLoading : boolean = true;

// The number of possible hue values for an HSL color. This will be important later.
const NUMBER_HUES = 360;

// Display the main game screen, complete with chests.
export function setupMainGameContainer() : void {
    // Create and display each of the chests.
    for (var i = 1; i <= numberChests; i++) {
        // Create the li tag representing the chest.
        var chest = document.createElement("li");
        $(chest).attr("id", "chest" + i);

        // Add a number label to the chest.
        var label = document.createElement("span");
        $(label).text(i);
        $(chest).append(label);

        // Give the chest a unique color so it stands out!
        var hue = NUMBER_HUES / numberChests * i;
        $(chest).css("fill", "hsl(" + hue + ", 90%, 50%)");

        /*
        Add this chest to the displayed locations.
        We have to do this before any SVG is added, or else displayChestUnlocked() will reference an element that 
        doesn't yet exist on the page and will therefore fail.
        */
        $("#locations-list").append(chest);

        // Unlock the chest if the chest starts unlocked or if its corresponding key has been received.
        if (!doesChestStartLocked(i) || client.items.received.map(item => item.id).includes(ITEM_ID_PREFIX + i)) {
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

    // Update the website icon to show whether any items are in logic.
    updateIcon();

    // Now that everything is set up, the game is no longer loading!
    isLoading = false;
}

// This setter method allows numberChests to be accessed in other JS files.
export function setNumberChests(newNumberChests : number) : void {
    numberChests = newNumberChests;
}

// This setter method allows numberLockedChests to be accessed in other JS files.
export function setNumberLockedChests(newNumberLockedChests : number) : void {
    // Force the number of locked chests to be no greater than the total number of chests minus 1.
    numberLockedChests = Math.min(newNumberLockedChests, numberChests - 1);
}

// Getter method for numberRequiredChests
export function getNumberRequiredChests() : number {
    return numberRequiredChests;
}

// This setter method allows numberRequiredChests to be accessed in other JS files.
export function setNumberRequiredChests(newNumberRequiredChests : number) : void {
    // Force the number of required chests to be no greater than the total number of chests.
    numberRequiredChests = Math.min(newNumberRequiredChests, numberChests);
}

// Given the number of a chest, returns whether the chest starts out locked.
function doesChestStartLocked(chestNumber : number) : boolean {
    var numberUnlockedChests : number = numberChests - numberLockedChests;

    /*
    All of the unlocked chests come before all of the locked chests.
    For example, if there are 5 total chests and 2 of them are unlocked, 
    Chests 1 and 2 start unlocked and Chests 3, 4, and 5 start locked.
    */
   return chestNumber > numberUnlockedChests;
}

// Updates the appearance and functionality of the location with the given ID to show it has been checked.
export function displayLocationChecked(locationId : number) : void {
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

    // Play a sound to show that the chest was opened.
    // We'll do this even for the free item, since I'm too lazy to search for another sound effect.
    // However, do NOT do this if the game is still loading, i.e. the player didn't click it.
    // We don't want the "chest open" sound to play if the chest was opened the last time the player logged in,
    // and the display is just being updated to show that.
    if (!isLoading)
        playSound(CHEST_OPEN_SOUND);
}

// Updates the appearance and functionality of the chest with the given ID to show it has been unlocked.
export function displayChestUnlocked(chestNumber : number) : void {
    var chestHtmlID = "#chest" + chestNumber;

    // Empty the SVG from the li tag so it can be replaced with a new SVG.
    $(chestHtmlID + " svg").remove();

    // Edit the li's tooltip
    $(chestHtmlID).attr("title", "Chest " + chestNumber + " (Unlocked)");

    // main-game.css gives all "clickable"-class objects a pointer cursor to show they can be clicked.
    $(chestHtmlID).attr("class", "clickable");

    // Now that the chest is unlocked, clicking it should send a check.
    var chestLocationID = LOCATION_ID_PREFIX + chestNumber;
    $(chestHtmlID).click(() => {
        client.check(chestLocationID);
    });

    // Add the SVG icon.
    $(chestHtmlID).append(unlockedChestSvg);

    // Play a "chest unlocked" sound.
    // That is, unless this chest is already empty. In that case, the user doesn't need to be alerted.
    // Also unless the chest started unlocked. In that case, the chest doesn't need to be unlocked because it was never 
    // locked in the first place.
    let chestIsEmpty = client.room.checkedLocations.includes(chestLocationID);
    if (doesChestStartLocked(chestNumber) && !chestIsEmpty)
        playSound(CHEST_UNLOCK_SOUND);
}

// Plays the sound with the given URL.
function playSound(soundURL : string) : void {
    // This method will do nothing if sounds are disabled.
    if (!areSoundsEnabled())
        return;
    
    /*
    Create a new audio element every time this function is called.
    This way, multiple of the same sound can play at the same time.
    */
    var audioToPlay : HTMLAudioElement = document.createElement("audio");
    var audioSource : HTMLElement = document.createElement("source");
    $(audioSource).attr("src", soundURL);

    // Use the extension to determine the audio type.
    var fileExtension = soundURL.split(".")[-1];
    switch(fileExtension) {
        case "mp3":
            $(audioSource).attr("type", "audio/mpeg");
            break;
        case "wav":
            $(audioSource).attr("type", "audio/wav");
            break;
        default:
            // Unsupported audio type
            console.warn(soundURL + " is not a supported audio type.");
            return;
    }

    // Add text to be displayed if the audio tag isn't supported.
    $(audioToPlay).text("Your browser does not support the audio element.");
    
    // Add the audio source to the audio.
    $(audioToPlay).append(audioSource);

    // Set the volume of the audio to whatever is in the settings.
    audioToPlay.volume = getVolume();

    /*
    Make the audio delete itself once it's finished playing.
    This way, the page isn't cluttered with hundreds of audio elements that aren't being used.
    */
    audioToPlay.addEventListener("ended", (event) => {
        $(event.target).remove();
    });

    // Add the audio source to the HTML page so that it will work.
    $("#audio-container").append(audioToPlay);

    // It's playtime! :D
    audioToPlay.play();
}

// Updates the website icon so that it's red if there are any unlocked, unopened chests, and black otherwise.
export function updateIcon() : void {
    let iconRed : boolean = false; // Whether or not the icon should be red.
    // Loop through all of the unchecked locations.
    for (let locationID of client.room.missingLocations) {
        // The location is a chest.
        // If the chest starts out unlocked, it can be opened no matter what.
        // If the chest starts locked, we need to check if we have the chest's corresponding key.
        let chestNumber = locationID - LOCATION_ID_PREFIX;
        let keyID = ITEM_ID_PREFIX + chestNumber;
        if (!doesChestStartLocked(chestNumber) || client.items.received.map(item => item.id).includes(keyID)) {
            // The chest can be opened! We don't need to continue through the rest of the loop.
            iconRed = true;
            break;
        }
    }

    // If the icon should be red, set it to red.
    if (iconRed) {
        $("#website-icon").attr("href", "assets/images/Red Chest.svg");
    }
    // Otherwise, set it to black (the normal Unlocked Chest image)
    else {
        $("#website-icon").attr("href", "assets/images/Unlocked Chest.svg");
    }
}