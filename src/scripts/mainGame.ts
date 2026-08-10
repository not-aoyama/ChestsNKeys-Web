/*
This file contains the code directly relevant to the main game screen;
i.e. everything after the login screen and before the win screen.
*/

import $ from "jquery";
import {Item} from "archipelago.js";
import { client } from "./login.js";
import { areSoundsEnabled, getVolume, areAnimationsEnabled } from "./settings.js";
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
// @ts-ignore
import apIconProgressionSvg from "bundle-text:../../assets/images/AP Icon progression.svg";
// @ts-ignore
import keySvg from "bundle-text:../../assets/images/Key.svg";
// @ts-ignore
import poopIconSvg from "bundle-text:../../assets/images/poop-svgrepo-com.svg";

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

/**
So, here's the thing. At first, before the player does anything, the client processes all the checks that have happened
in the history of the multiworld. So, a bunch of chests are "opened" without the player actually doing anything during
this session. During this time, we consider the game to be "loading".

To start with, the game is in a "loading" state, so this variable is true. Once it's set to false, that means every
check that happens from here on out is a result of the player's current actions.
*/
var isLoading : boolean = true;

// The number of possible hue values for an HSL color. This will be important later.
const NUMBER_HUES = 360;

/**
 * Returns whether or not the main game screen has finished loading. 
 * This will only return `true` if all of the following are true:
 * 
 * 1. Slot data (e.g. the number of required chests) is loaded in.
 * 2. All of the chests are displayed and functional.
 * 3. The text client is displayed and functional.
 * 4. The header (which contains the goal message and the disconnect/reconnect button) is displayed and functional.
 * 
 * Once this function starts returning `true`, it will never return `false` again unless the page is reloaded.
 * 
 * @returns whether or not the main game screen has finished loading
 */
export function hasLoaded() : boolean {
    return !isLoading;
}

// Display the main game screen, complete with chests.
export function setupMainGameContainer() : void {
    // Set up the goal message.
    updateGoalMessage();

    // Create and display each of the chests.
    for (var i = 1; i <= numberChests; i++) {
        // Create the li tag representing the chest.
        var chest = document.createElement("li");
        $(chest).attr("id", "chest" + i);

        // Add a button to the li to make it clickable and keyboard focusable.
        var button = document.createElement("button");
        $(button).attr("id", "chest-button-" + i)
        $(chest).append(button);

        // Add a number label to the button.
        var label = document.createElement("span");
        $(label).text(i);
        $(label).attr("class", "chest-label");
        $(button).append(label);

        // Give the chest a unique color so it stands out!
        var hue = getHueForChest(i);
        var chestColor = "hsl(" + hue + ", 100%, 70%)";
        $(chest).css("fill", chestColor);

        // Set the number label's color so that it has sufficient contrast with its chest.
        $(label).css("color", getLabelColorForChest(i));
        // Also set the label's background color so that ANDI won't complain.
        $(label).css("background-color", chestColor);

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
            let tooltip : string = "Chest " + i + " (Locked)";
            $(chest).attr("title", tooltip);

            // Disable the button
            $(button).prop("disabled", true);

            // Add the SVG icon inside of the button. We have to make a copy each time.
            $(button).append(lockedChestSvg);

            // Create alt text for the SVG
            let titleElem = document.createElement("title");
            $(titleElem).text(tooltip);
            let svgElem = $(button).children("svg")[0]; // The SVG inside of the button
            svgElem.append(titleElem);
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

    // Set the focus to the main game container. This makes it more accessible.
    document.getElementById("main-game-container")?.focus();

    // Now that everything is set up, the game is no longer loading!
    isLoading = false;
}

/**
 * Sets the text of the disconnect/reconnect button to "Disconnect".
 * Makes it so that when this button is clicked, the client starts disconnecting from the server, 
 * and the disconnect/reconnect button is disabled.
 */
export function setupDisconnectButton() : void {
    let disconnectReconnectButton = $("#disconnect-reconnect-button");
    $(disconnectReconnectButton).prop("disabled", false);
    $(disconnectReconnectButton).text("Disconnect");
    $(disconnectReconnectButton).prop("onclick", null).off("click"); // Remove any existing onclick function.
    $(disconnectReconnectButton).on("click", () => {
        $(disconnectReconnectButton).prop("disabled", true);
        client.socket.disconnect();
    });
}

/**
 * Sets the text of the disconnect/reconnect button to "Reconnect".
 * Makes it so that when this button is clicked, the client starts reconnecting to the server, 
 * and the disconnect/reconnect button is disabled.
 */
export function setupReconnectButton() : void {
    let disconnectReconnectButton = $("#disconnect-reconnect-button");
    $(disconnectReconnectButton).prop("disabled", false);
    $(disconnectReconnectButton).text("Reconnect");
    $(disconnectReconnectButton).prop("onclick", null).off("click"); // Remove any existing onclick function.
    $(disconnectReconnectButton).on("click", () => {
        $(disconnectReconnectButton).prop("disabled", true);
        // Log back into the game.
        let connectionInfo = {
            hostport: localStorage.getItem("host-port") as string,
            game: "Chests 'n' Keys",
            slot: localStorage.getItem("slot-name") as string,
            password: localStorage.getItem("password") as string
        };
        client.login(
            connectionInfo.hostport as string,
            connectionInfo.slot as string,
            connectionInfo.game,
            {password: connectionInfo.password as string}
        );
    });
}

/**
 * Given a chest's number (1 to 360), returns a number representing a hue that will be unique to just that chest.
 * This hue will be used to calculate a color in HSL format. It will be the number used for "H".
 * 
 * @param chestNumber The number labelling a chest. It should be an integer between 1 and 360 (both inclusive).
 * @returns A number representing the chest's hue. It should be between 0 (inclusive) and 360 (exclusive).
 */
function getHueForChest(chestNumber : number) : number {
    return NUMBER_HUES / numberChests * (chestNumber - 1);
}

/**
 * Given a chest's number (1 to 360), returns a text color that will properly contrast with the color of the chest.
 * This function will return either "white" or "black".
 * 
 * @param chestNumber The number labelling a chest. It should be an integer between 1 and 360 (both inclusive).
 * @returns A string containing the name of a color to be applied to this chest's text label.
 */
function getLabelColorForChest(chestNumber : number) : string {
    // Get the HSL hue of this chest.
    let chestHue = getHueForChest(chestNumber);

    /*
    This function will almost always return "black".
    The only time the function will return "white" is when the hue is between 235 and 251 (both inclusive).
    */
    if (chestHue >= 235 && chestHue <= 251)
        return "white";
    else
        return "black";
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

/**
 * In the main game window, there is an ARIA live region that notifies screen readers of automatic changes.
 * This live region cannot consist of the entire list of chests; otherwise, the screen reader will be overwhelmed.
 * There also cannot be one live region for each chest; otherwise, the screen reader will have too much overhead.
 * Instead, the live region solely consists of some text: one or more "toast messages".
 * This text is invisible, and can only be accessed by a screen reader.
 * Each time a chest is unlocked or emptied, a toast message is added to announce this.
 * After a short amount of time, each toast message should be deleted to avoid clutter.
 * 
 * @param screenReaderMessage the new message to display. This will completely override the old one.
 */
function displayToScreenReader(screenReaderMessage : string) : void {
    let newToastMsg : HTMLParagraphElement = document.createElement("p");
    $(newToastMsg).text(screenReaderMessage);
    $("#locations-toast").append(newToastMsg);
    setTimeout(() => {
        newToastMsg.remove();
    }, 2000);
}

// Updates the appearance and functionality of the location with the given ID to show it has been checked.
export function displayLocationChecked(locationId : number) : void {
    var chestNumber = locationId - LOCATION_ID_PREFIX;
    var chestButtonID = "#chest-button-" + chestNumber;

    // Empty the SVG from the li tag so it can be replaced with a new SVG.
    $(chestButtonID + " svg").remove();

    // Return the cursor to normal. (It was a pointer before, to show that this was clickable.)
    $(chestButtonID).attr("class", null);

    // Change the tooltip
    let tooltip : string = "Chest " + chestNumber + " (Empty)";
    $(chestButtonID).attr("title", tooltip);

    // Remove the click function.
    $(chestButtonID).prop("onclick", null).off("click");
    $(chestButtonID).prop("disabled", true);

    // Put the SVG tag inside of the li.
    $(chestButtonID).append(emptyChestSvg);

    // Add alt text to the SVG
    let titleElem = document.createElement("title");
    $(titleElem).text(tooltip);
    let svgElem = $(chestButtonID).children("svg")[0];
    // For some reason, it's possible for svgElem to be undefined. We have to account for that possibility.
    if (svgElem != undefined)
        $(svgElem).append(titleElem);

    // Play a sound to show that the chest was opened.
    // However, do NOT do this if the game is still loading, i.e. the player didn't click it.
    // We don't want the "chest open" sound to play if the chest was opened the last time the player logged in,
    // and the display is just being updated to show that.
    if (!isLoading)
        playSound(CHEST_OPEN_SOUND);

    // Notify screen readers that this chest is opened, how many chests have been opened so far, 
    // and how many total still need to be opened.
    displayToScreenReader("Chest " + chestNumber + " opened! ");
}

// Updates the appearance and functionality of the chest with the given ID to show it has been unlocked.
export function displayChestUnlocked(chestNumber : number) : void {
    var chestButtonID = "#chest-button-" + chestNumber;

    // Empty the SVG from the li tag so it can be replaced with a new SVG.
    $(chestButtonID + " svg").remove();

    // Edit the li's tooltip
    let tooltip : string = "Chest " + chestNumber + " (Unlocked)";
    $(chestButtonID).attr("title", tooltip);

    // main-game.css gives all "clickable"-class objects a pointer cursor to show they can be clicked.
    $(chestButtonID).attr("class", "clickable");

    // Now that the chest is unlocked, clicking it should send a check.
    var chestLocationID = LOCATION_ID_PREFIX + chestNumber;
    $(chestButtonID).on("click", () => {
        client.check(chestLocationID);
    });
    $(chestButtonID).prop("disabled", false);

    // Add the SVG icon.
    $(chestButtonID).append(unlockedChestSvg);

    // Add alt text to the SVG icon.
    let titleElem = document.createElement("title");
    $(titleElem).text(tooltip);
    let svgElem = $(chestButtonID).children("svg")[0];
    // Just in case...
    if (svgElem != undefined)
        $(svgElem).append(titleElem);

    // Play a "chest unlocked" sound 
    // That is, unless this chest is already empty. In that case, the user doesn't need to be alerted.
    // Also unless the chest started unlocked. In that case, the chest doesn't need to be unlocked because it was never 
    // locked in the first place.
    let chestIsEmpty = client.room.checkedLocations.includes(chestLocationID);
    if (doesChestStartLocked(chestNumber) && !chestIsEmpty)
        playSound(CHEST_UNLOCK_SOUND);

    // Notify screen readers that the chest was unlocked, unless the chest is already empty.
    if (!chestIsEmpty)
        displayToScreenReader("Chest " + chestNumber + " unlocked!");
}

// Plays the sound with the given URL.
function playSound(soundURL : string) : void {
    // This method will do nothing if sounds are disabled.
    if (!areSoundsEnabled())
        return;
    
    /*
    In addition, this method will do nothing if we have too many sounds playing already.
    If there are too many sounds at once, the player's ears will hurt!
    */
    const MAX_NUMBER_SOUNDS = 5;
    if (document.getElementsByTagName("audio").length >= MAX_NUMBER_SOUNDS)
        return;

    /*
    Create a new audio element every time this function is called.
    This way, multiple of the same sound can play at the same time.
    */
    var audioToPlay : HTMLAudioElement = document.createElement("audio");
    var audioSource : HTMLElement = document.createElement("source");
    $(audioSource).attr("src", soundURL);

    // Use the extension to determine the audio type.
    var urlSplitByDot : string[] = soundURL.split(".");
    var fileExtension : string = urlSplitByDot[urlSplitByDot.length - 1];
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
        $(event.target as EventTarget).remove();
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

/**
Updates the message at the top of the screen telling the player how many chests they need to goal, 
and how many chests they've opened so far.
*/
export function updateGoalMessage() : void {
    let newGoalMessage : string = "You need to open <b>";
    newGoalMessage += numberRequiredChests;
    newGoalMessage += "</b> chests in order to goal. So far, you have opened <b>";
    newGoalMessage += client.room.checkedLocations.length;
    newGoalMessage += "</b>.";
    $("#goal-message").html(newGoalMessage);
}

export function displayItemSent(locationID : number) : void {
    // If animations are disabled, this function should do nothing.
    if (!areAnimationsEnabled())
        return;

    // Get the item that is at this location.
    client.scout([locationID]).then((items : Item[]) => {
        // There should only be one item in the list because we only scouted one location.
        let item : Item = items[0];

        let chestNumber = locationID - LOCATION_ID_PREFIX;
        let liID = "#chest" + chestNumber; // ID of the li tag representing the location with the given ID

        /*
        Append an SVG representing the item.
        The SVG will be contained in a div tag. This way, we can attach an event listener to the div.
        I can't figure out how to attach the event listener to the SVG itself.
        */
        let svgContainer = document.createElement("div");

        // Choose which SVG icon to add based on the type of item.
        // Items from Chests 'n' Keys will have their own unique sprites.
        if (item.game == "Chests 'n' Keys") {
            // Use a poop icon for Items That Do Nothing.
            if (item.id == ITEM_THAT_DOES_NOTHING_ID) {
                $(svgContainer).append(poopIconSvg);
            }
            // Every other item in this game is a key, so use a key icon.
            else {
                $(svgContainer).append(keySvg);

                // Add a label for what number the key is.
                let keyNumber = item.id - ITEM_ID_PREFIX;
                let label = document.createElement("span");
                $(label).text(keyNumber);
                $(label).attr("class", "key-label");
                $(svgContainer).append(label);

                // Keys to chests in this slot should be colored the same as their corresponding chests.
                if (item.receiver.slot == item.sender.slot) { // The sender is always this slot.
                    // Get the ID of the corresponding chest
                    let chestID = "#chest" + keyNumber;
                    // Get the color of the corresponding chest
                    let chestColor = $(chestID).css("fill");
                    // Set the color of the key icon to match
                    $(svgContainer).css("fill", chestColor);

                    // Set the color of the key's label so that it contrasts enough with the key itself.
                    $(label).css("color", getLabelColorForChest(keyNumber));
                }
                // Keys to chests in other slots should be black.
                else {
                    $(svgContainer).css("fill", "black");

                    // The key's label should be white to contrast with the black key.
                    $(label).css("color", "white");
                }
            }
        } else {
            // Use progressive AP icon (AP icon with an arrow in the bottom right) for progression items
            if (item.progression) {
                $(svgContainer).append(apIconProgressionSvg);
            }
            // Use red AP icon for trap items.
            else if (item.trap) {
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
        }

        // This class will be used for CSS styling
        $(svgContainer).attr("class", "item-icon");

        /*
        Make the div delete itself once its animation is finished.
        This way, the page isn't cluttered with hundreds of SVGs that aren't being used.
        */
        svgContainer.addEventListener("animationend", (event) => {
            $(event.target as EventTarget).remove();
        });

        $(liID).append(svgContainer);
    }).catch((reason : any) => {
        console.warn("Caught an error in displayItemSent()! Reason: " + reason);
    });
}