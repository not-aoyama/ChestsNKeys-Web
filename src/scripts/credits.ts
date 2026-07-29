import $ from "jquery"

$(() => {
    let creditsMenu : HTMLDialogElement = document.getElementById("credits-menu") as HTMLDialogElement;

    // Show the credits menu when the credits hyperlink is clicked.
    $("#credits-link").on("click", (event) => {
        // Prevents the cursor from jumping to the top of the page.
        event?.preventDefault();

        // Show the credits menu.
        creditsMenu.showModal();
    });

    // Hide the settings menu when the X button is clicked.
    $("#credits-x").on("click", () => {
        creditsMenu.close();
    });
});