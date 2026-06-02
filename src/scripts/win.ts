/*
This file contains all the necessary code for checking if the user has won
and displaying the win message once they have.
*/

import * as $ from "jquery";
import { client } from "./login.js";
import { getNumberRequiredChests } from "./mainGame.js";
import { areAnimationsEnabled, areSoundsEnabled, getVolume } from "./settings.js";

var hasWon = false;

/*
This function sees if the user has won and if the win message has been shown yet.
If it has, this function then shows the win message and tells the server that this slot has goaled.
*/
export function displayIfWin() {
    // In order to have won, the user must have opened at least the required number of chests.
    var openedChests : number[] = client.room.checkedLocations;
    if (openedChests.length >= getNumberRequiredChests()) {
        /*
        If the user has opened enough chests, tell the server the player has goaled and display the win message!
        But make sure to wrap it in a try/catch statement.
        There could be an error if we haven't finished connecting yet.
        */
        try {
            /*
            Only display the win message if the player hasn't won yet during this session.
            We don't want the win message popping up every time the player sends a post-victory check.
            */
            if (!hasWon) {
                client.goal();

                // Enable the animation for the win message text if animations are enabled in the settings.
                if (areAnimationsEnabled()) {
                    $("#win-message").attr("class", $("#win-message").attr("class") + " animated-text");
                }

                $("#win-message").show();

                // Play the win sound if sounds are enabled in the settings.
                // Also set the sound volume to whatever volume is in the settings.
                var audioToPlay : HTMLAudioElement = document.getElementById("win-sound") as HTMLAudioElement;
                audioToPlay.volume = getVolume();
                if (areSoundsEnabled()) {
                    audioToPlay.play();
                }

                // Record that the player has won so the win message won't be shown again.
                hasWon = true;

                // Make it so that whenever the player clicks anywhere or types any key, the win message goes away.
                $(document).click(hideWinMessage);
                $(document).keydown(hideWinMessage);
            }
        } catch (error) {
            // Do nothing because I'm lazy :P
        }
    }
}

function hideWinMessage() : void {
    // Stop the win sound if it is still playing.
    var audioToStop : HTMLAudioElement = document.getElementById("win-sound") as HTMLAudioElement;
    audioToStop.pause();

    // Hide the visual win message.
    $("#win-message").hide();
}