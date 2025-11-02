import * as $ from "jquery";

var soundsEnabled : boolean = true;

$(document).ready(() => {
    // Show the settings menu when the settings button is clicked.
    $("#settings-button").click(() => {
        $("#settings-menu").show();
    });

    // Hide the settings menu when the X button is clicked.
    $("#settings-x").click(() => {
        $("#settings-menu").hide();
    });

    // Clicking the "Enable audio" checkbox will toggle whether audio is enabled.
    $("#enable-sounds").click(toggleSoundsEnabled);
});

function toggleSoundsEnabled() : void {
    // This code checks if the checkbox is checked.
    var checkbox = document.getElementById("enable-sounds");
    // If it is checked, enable sounds. Otherwise, disable them.
    soundsEnabled = (checkbox as HTMLInputElement).checked;
}

// Enables other scripts to see whether sound is enabled
export function areSoundsEnabled() : boolean {
    return soundsEnabled;
}