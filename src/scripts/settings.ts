import $ from "jquery";

var animationsEnabled : boolean = true;
var soundsEnabled : boolean = true;
var volume : number = 1;

$(() => {
    // Get the settings menu and store it in a variable. It will be used multiple times later.
    let settingsMenu : HTMLDialogElement = document.getElementById("settings-menu") as HTMLDialogElement;

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
        volume = parseFloat(localStorage.getItem("volume") as string); // convert string to float
        $("#sound-volume").attr("value", volume);
    }

    if (localStorage.getItem("animations-enabled") == null) {
        animationsEnabled = true;
        $("#enable-animations").prop("checked", true);
    } else {
        animationsEnabled = (localStorage.getItem("animations-enabled") == "true");
        $("#enable-animations").prop("checked", animationsEnabled);
    }

    // Show the settings menu when the settings button is clicked.
    $("#settings-button").on("click", () => {
        settingsMenu.showModal();
    });

    // Hide the settings menu when the X button is clicked.
    $("#settings-x").on("click", () => {
        settingsMenu.close();
    });

    // Clicking the "Enable audio" checkbox will toggle whether audio is enabled.
    $("#enable-sounds").on("click", toggleSoundsEnabled);

    // Adjusting the "Sound volume" slider will change the volume.
    $("#sound-volume").on("change", adjustVolume);

    // Clicking the "Enable animations" checkbox will toggle whether animations are enabled.
    $("#enable-animations").on("click", toggleAnimationsEnabled);
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

function toggleAnimationsEnabled() : void {
    // This code checks if the checkbox is checked.
    var checkbox = document.getElementById("enable-animations");
    // If it is checked, enable sounds. Otherwise, disable them.
    animationsEnabled = (checkbox as HTMLInputElement).checked;
    // Save this setting to local storage so it can be remembered if the page is reloaded.
    localStorage.setItem("animations-enabled", "" + animationsEnabled);
}

// Enables other scripts to see whether sound is enabled
export function areSoundsEnabled() : boolean {
    return soundsEnabled;
}

// Enables other scripts to see what the volume is set to
export function getVolume() : number {
    return volume;
}

// Enables other scripts to see whether animations are enabled
export function areAnimationsEnabled() : boolean {
    return animationsEnabled;
}