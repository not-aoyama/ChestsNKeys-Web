import {
    Client
} from "https://unpkg.com/archipelago.js/dist/archipelago.min.js";

var client;

$(document).ready(function () {
    /*
    Before displaying the login screen, fill the text fields with the credentials saved from last time.
    This way, the player doesn't have to repeatedly input the same credentials.
    */
    $("#host-port-input").val(localStorage.getItem("host-port"));
    $("#slot-name-input").val(localStorage.getItem("slot-name"));
    $("#password-input").val(localStorage.getItem("password"));

    // Connect to the server when the login button is clicked.
    $("#login-submit").click(function () {
        var connectionInfo = {
            hostport: $("#host-port-input").val(),
            game: "Chests 'n' Keys",
            slot: $("#slot-name-input").val(),
            password: $("#password-input").val(),
            items_handling: 0b111
        };

        client = new Client();
        client
            .login(
                connectionInfo.hostport,
                connectionInfo.slot,
                connectionInfo.game,
                {password: connectionInfo.password}
            )
            .then(() => {
                console.log("Chee-hoo! You're now logged in!");

                // Save the login credentials for later so the player doesn't have to enter them again next time.
                localStorage.setItem("host-port", connectionInfo.hostport);
                localStorage.setItem("slot-name", connectionInfo.slot);
                localStorage.setItem("password", connectionInfo.password);
            })
            .catch((error) => {
                console.log(error[0]);
                $("#error-message").text("Well, THAT just happened.");
            });
    });

    // Now that the text fields and login button are ready, it's safe to display the login menu.
    $("#login-screen").show();
});