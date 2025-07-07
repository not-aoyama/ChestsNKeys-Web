import {
    Client
} from "https://unpkg.com/archipelago.js/dist/archipelago.min.js";

var client;

$(document).ready(function () {
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
            })
            .catch((error) => {
                console.log(error[0]);
                $("#error-message").text("Well, THAT just happened.");
            });
    });
});