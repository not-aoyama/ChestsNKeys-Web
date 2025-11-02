import * as $ from "jquery";

var soundsEnabled : boolean = true;

$(document).ready(() => {
    // Load settings from local storage. Use defaults if the settings aren't there.
    if (
        localStorage.getItem("sounds-enabled") == null || 
        localStorage.getItem("sounds-enabled") == "true"
    ) {
        soundsEnabled = true;
        $("#enable-sounds").prop("checked", true);
    } else if (localStorage.getItem("sounds-enabled") == "false") {
        soundsEnabled = false;
        $("#enable-sounds").prop("checked", false);
    } else {
        // Hopefully, this setting should always be either null, true, or false.
        console.warn("Invalid value for sounds-enabled in localStorage");
    }

    // Toggle whether the settings menu is shown when the settings button is clicked.
    $("#settings-button").click(() => {
        // If the settings menu is hidden, show it.
        if ($("#settings-menu").css("display") == "none") {
            $("#settings-menu").show();
        } else {
            $("#settings-menu").hide();
        }
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

    // Save this setting to local storage so it can be remembered if the page is reloaded.
    localStorage.setItem("sounds-enabled", "" + soundsEnabled);
}

// Enables other scripts to see whether sound is enabled
export function areSoundsEnabled() : boolean {
    return soundsEnabled;
}