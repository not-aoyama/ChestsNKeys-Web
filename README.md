# Chests 'n' Keys for Archipelago

Welcome to Chests 'n' Keys, a web browser game custom-built for the [Archipelago multi-world randomizer](https://archipelago.gg).

Chests 'n' Keys is so basic, it can hardly be considered a game at all. You have a certain amount of chests, and you win by opening enough of them. However, some of the chests may be locked. In order to open a locked chest, you need its corresponding key. Basically, click on chests to win.

Currently, this game is **a beta**. This means that it's been released and published, and you *can* play it, but it still has bugs and needs to be tested.

## Installation

You will first need to install Archipelago. [Here](https://archipelago.gg/tutorial/Archipelago/setup_en#installing-the-archipelago-software) are instructions on how to do so.

You will then be able to install Chests 'n' Keys itself. Go to [the Releases page on GitHub](https://github.com/not-aoyama/ChestsNKeys-Web/releases), pick a release (probably the latest one), and download `chests_n_keys.apworld`.

Now that you've installed Archipelago, there should be a shortcut icon on your desktop labelled, "Archipelago Folder". Click on this icon to open the folder Archipelago is installed in. In this folder, there should be a folder called "custom_worlds". Move `chests_n_keys.apworld` into there.

## How to Play

In an Archipelago multiworld, one or more players will connect to a single server. But before the server can be created and go live, each player must create a YAML file for each of their games. This YAML file will contain the game options. To quote [the Archipelago "Getting Started" guide](https://archipelago.gg/tutorial/Archipelago/setup_en#generating-a-game):

> YAML is the file format which Archipelago uses in order to configure a player's world. It allows you to dictate which game you will be playing as well as the options you would like for that game.

### Creating Your YAML
Since Chests 'n' Keys is not a core-verified game, you cannot generate a YAML from the Archipelago website. You will instead have to generate it on your own device.

Open the Archipelago Launcher and select the Options Creator.

![Open the Option Creator from within the Archipelago Launcher.](/assets/images/README/Options_Creator.png)

On the left side of the window, there will be a list of games. Choose "Chests 'n' Keys" from the list.

![Select "Chests 'n' Keys" from the list of games on the left.](/assets/images/README/Chests_n_Keys.png)

Choose whichever options you prefer. Hover over an option's name to find out what it does.

![Hover over an option's name to find out what it does.](/assets/images/README/option_explanation.png)

Once you're ready, click the "Export Options" button in the top right corner. Then, your options will be exported as a YAML file, and you can choose what to name the file and where to save it.

![Click "Export Options" to generate your YAML!](/assets/images/README/Export_Options.png)

Alternatively, instead of using the Options Creator, you can open the Archipelago Launcher and run "Generate Template Options". This will automatically generate template YAMLs in the `Players/Templates' subfolder of the Archipelago folder. Then, you can copy and directly edit the Chests 'n' Keys template YAML in a text editor.

![Click "Generate Template Options" to generate template YAMLs.](/assets/images/README/Generate_Template_Options.png)

Now that you've created your YAML, send it to whoever is going to host the server!

### Hosting a Server
For each game that is going to be on your server, you should have a YAML file. Navigate to the Archipelago folder. Here, there should be a sub-folder called "Players". Move all of the YAMLs into here.

Go back up to the base Archipelago folder and run `ArchipelagoGenerate.exe`. Alternatively, open the Archipelago launcher and select "Generate".

![Click "Generate" to generate an Archipelago server.](/assets/images/README/Generate.png)

This will generate a ZIP file in the `output` subfolder of the Archipelago folder. It will be named something like `AP_xxxxxxx.zip`. From here, you have two options:

#### Host Locally on Your Device

Unzip the ZIP file. Inside of it, there should be a file with the extension `.archipelago`. Open this file, and an Archipelago server will start running directly on your device! It'll be on `localhost`. By default, it will run on port 38281. Any client running on your device will now be able to connect to your server. However, any devices other than your own won't be able to connect unless you port-forward your server, which is outside the scope of this document.

#### Host on the Archipelago Website

Go to the [Archipelago Host Game Page](https://archipelago.gg/uploads) and upload the ZIP file there. Then, select the "Create New Room" link.

![Click the "Create New Room" link.](/assets/images/README/Create_New_Room.png)

An Archipelago server will now be running for free on the Archipelago website! The newly spun-up server page will tell you which port it's running on so that all players can connect.

### Joining a Server

To join a server that has already been created and is running, you can visit the Chests 'n' Keys web client at https://not-aoyama.github.io/ChestsNKeys-Web/.

Alternatively, you can download the source code from [the Releases page on GitHub](https://github.com/not-aoyama/ChestsNKeys-Web/releases) and then open `index.html` in your browser. This will allow you to run the client offline!