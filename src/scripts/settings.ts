import * as $ from "jquery";

var soundsEnabled : boolean = true;
var volume : number = 1;

$(document).ready(() => {
    // Load settings from local storage. Use defaults if the settings aren't there.
    if (localStorage.getItem("sounds-enabled") == null) {
        soundsEnabled = true;
        $("#enable-sounds").prop("checked", true);
    } else {
        soundsEnabled = (localStorage.getItem("sounds-enabled") == "true");
        $("#enable-sounds").prop("checked", soundsEnabled);
    }

    if (localStorage.getItem("volume") == null) {
        volume = 1;
        $("#sound-volume").attr("value", 1);
    } else {
        volume = parseFloat(localStorage.getItem("volume")); // convert string to float
        $("#sound-volume").attr("value", volume);
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

    // Adjusting the "Sound volume" slider will change the volume.
    $("#sound-volume").change(adjustVolume);
});

function toggleSoundsEnabled() : void {
    // This code checks if the checkbox is checked.
    var checkbox = document.getElementById("enable-sounds");
    // If it is checked, enable sounds. Otherwise, disable them.
    soundsEnabled = (checkbox as HTMLInputElement).checked;
    // Save this setting to local storage so it can be remembered if the page is reloaded.
    localStorage.setItem("sounds-enabled", "" + soundsEnabled);
}

function adjustVolume() : void {
    // This code gets the current value of the volume slider.
    var volumeSlider = document.getElementById("sound-volume");
    volume = parseFloat((volumeSlider as HTMLInputElement).value);
    // Save this setting to local storage so it can be remembered if the page is reloaded.
    localStorage.setItem("volume", "" + volume);
}

// Enables other scripts to see whether sound is enabled
export function areSoundsEnabled() : boolean {
    return soundsEnabled;
}

// Enables other scripts to see what the volume is set to
export function getVolume() : number {
    return volume;
}