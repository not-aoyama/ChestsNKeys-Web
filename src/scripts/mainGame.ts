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
// @ts-ignore
import apIconSvg from "bundle-text:../../assets/images/AP Icon.svg";
// @ts-ignore
import apIconColorlessSvg from "bundle-text:../../assets/images/AP Icon colorless.svg";

export const LOCATION_ID_PREFIX = 420000;
export const DESK_ID = LOCATION_ID_PREFIX;
export const ITEM_ID_PREFIX = 69000;
export const ITEM_THAT_DOES_NOTHING_ID = ITEM_ID_PREFIX + 420;

// URLs for sounds
const CHEST_UNLOCK_SOUND = "assets/sounds/815493__xkeril__mechanical-switch-latch-02.wav";
const CHEST_OPEN_SOUND = "assets/sounds/771164__steprock__treasure-chest-open.mp3";

// Whether keys are enabled in this slot. This is determined by reading the slot data from the server.
var keysEnabled : boolean;

/*
So, here's the thing. At first, before the player does anything, the client processes all the checks that have happened
in the history of the multiworld. So, a bunch of chests are "opened" without the player actually doing anything during
this session. During this time, we consider the game to be "loading".

To start with, the game is in a "loading" state, so this variable is true. Once it's set to false, that means every
check that happens from here on out is a result of the player's current actions.
*/
var isLoading : boolean = true;

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

    // Update the website icon to show whether any items are in logic.
    updateIcon();

    // Now that everything is set up, the game is no longer loading!
    isLoading = false;
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
    // Also unless keys are disabled. In that case, the chest doesn't need to be unlocked because it was never 
    // locked in the first place.
    let chestIsEmpty = client.room.checkedLocations.includes(chestLocationID);
    if (keysEnabled && !chestIsEmpty)
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
    var fileExtension = soundURL.split(".").at(-1);
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
        // Is this location the Free Item?
        if (locationID == DESK_ID) {
            // If so, this item is in logic no matter what! The icon should be red.
            // We can skip the rest of the loop.
            iconRed = true;
            break;
        } else {
            // The location is a chest.
            // If keys are disabled, the chest can be opened no matter what.
            // If they're enabled, we need to check if we have the chest's corresponding key.
            let keyID = locationID - LOCATION_ID_PREFIX + ITEM_ID_PREFIX;
            if (!keysEnabled || client.items.received.map(item => item.id).includes(keyID)) {
                // The chest can be opened! We don't need to continue through the rest of the loop.
                iconRed = true;
                break;
            }
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

export function displayItemSent(locationID : number) {
    // Get the item that is at this location.
    client.scout([locationID]).then((items : Item[]) => {
        // There should only be one item in the list because we only scouted one location.
        let item : Item = items[0];

        console.log(item); // Debug statement until I figure out what to do.

        let liID : string; // ID of the li tag representing the location with the given ID
        if (locationID == DESK_ID) {
            // Location is the Desk
            liID = "#desk";
        } else {
            // Location is a chest
            let chestNumber = locationID - LOCATION_ID_PREFIX;
            liID = "#chest" + chestNumber;
        }

        /*
        Append an SVG representing the item.
        The SVG will be contained in a div tag. This way, we can attach an event listener to the div.
        I can't figure out how to attach the event listener to the SVG itself.
        */
        let svgContainer = document.createElement("div");

        // Choose which SVG icon to add based on the type of item.
        // Use red AP icon for trap items.
        if (item.trap) {
            // The SVG file being imported shouldn't have its own colors. We want to add our own instead.
            $(svgContainer).append(apIconColorlessSvg);
            $(svgContainer).css("fill", "red");
        }
        // Use black AP icon for filler items.
        else if (item.filler) {
            // The SVG file being imported shouldn't have its own colors. We want to add our own instead.
            $(svgContainer).append(apIconColorlessSvg);
            $(svgContainer).css("fill", "black");
        }
        // Use the normal, rainbow-colored AP icon for normal items.
        else {
            // The normal SVG comes with its own colors.
            $(svgContainer).append(apIconSvg);
        }

        // This class will be used for CSS styling
        $(svgContainer).attr("class", "item-icon");

        /*
        Make the div delete itself once its animation is finished.
        This way, the page isn't cluttered with hundreds of SVGs that aren't being used.
        Currently commented out for debugging purposes.
        */
        // svgContainer.addEventListener("animationend", (event) => {
        //     $(event.target).remove();
        // });

        $(liID).append(svgContainer);
    }).catch((reason : any) => {
        console.warn("Caught an error in displayItemSent()! Reason: " + reason);
    });
}