/*Scripte zu den verschiedenen Funktionalitäten */

"use strict";

/*Variablen*/
var mobileMenue = "closed";
var curStyle = "noStyle";
var newStyle = "noStyle";

const pauseUnpauseButton = document.getElementById("playPause");
const stopButton = document.getElementById("stop");
const previousButton = document.getElementById("last");
const nextButton = document.getElementById("next");
const muteButton = document.getElementById("mute");
const songVolume = document.getElementById("songVolume");
const savePlaylistButton = document.getElementById("savePlaylist");
const deleteSongButton = document.getElementById("deleteSong");
const addSongButton = document.getElementById("addSong");
const sortButton = document.getElementById("sort");

let song = document.createElement("audio");
let songPaths = []; // enthaelt alle Pfade zu Liedern aus ./Musik
let songs = []; // enthaelt alle Songs mit Angabe von Pfad, Titel, Ordner
let currentIndex = -1; // gibt den Index vom aktuellen Song im songs Array an
let playlists= []; // enthaelt Arrays, in denen Songs zur jeweiligen Playlist gespeichert sind
let playlist = []; // temporaeres Array beim Erstellen einer neuen Playlist
let playlistNames = []; // enthaelt die Namen aller gespeicherten Playlists
let currentPlaylist= -1; // gibt den Index von der aktuellen Playlist im playlists array an; -1 wenn keine Playlist ausgewaehlt ist
let isOrderedAlphabetically = false; // boolean zum Sortieren der Lieder

//Variablen etc. für die Visualisierung

const vis = document.getElementById("visuals");
const can = document.getElementById("canvas");
const canvasContext = can.getContext("2d");
let audioSource = "noneRightNow";
let analyser = "noneRightNow";
let alreadyPlaying = false;
let audioActive = "no";
let w = vis.offsetWidth;
let h = vis.offsetHeight;
let audio = new Audio();
let audioContext = new AudioContext();

let curPlay = document.getElementById("small");
let curPlay2 = document.getElementById("small2");
let songAddOpen = false;

function initialize() {
	console.log("loaded");
	/*Öffnen des "allSongs-Tabs" bei Programmstart */
	var list = document.getElementsByClassName("list");
	var tab = document.getElementsByClassName("tab");
	for (var i = 0; i < list.length; i++) {
		list[i].style.display = "none";
	}
	for (var i = 0; i < tab.length; i++) {
		tab[i].className.replace(" active", "");
	}
	document.getElementById("allSongsBut").click();

	getSongPaths();	// laedt Lieder aus dem Musikordner
	
	/*Schauen, ob es im Webstorage einen gespeicherten Style gibt und
	  diesen gegebenenfalls laden, oder den "default" style laden */
	if (typeof (Storage) !== "undefined") {
		var style = "";
		if (!localStorage.getItem('savedStyle')) {
			console.log("no style found! " + style);
			style = "default";
			console.log("Style set to Default: " + style);
			//alert("No Style");
		} else {
			style = localStorage.getItem('savedStyle');
			console.log("Loaded Style: " + style);
			/*alert("Style found!");*/
		}

		styleChange(style);

		// laedt Playlistinformationen aus dem Webstorage, falls vorhanden
		if (localStorage.getItem("playlists")) {
			playlists = JSON.parse(localStorage.getItem("playlists"));
			console.log(playlists.length + " playlists loaded: ");
			console.log(playlists);
		}
		if (localStorage.getItem("playlistNames")) {
			playlistNames = JSON.parse(localStorage.getItem("playlistNames"));
			console.log("Playlistnamen loaded: " + playlistNames);
		}


	} else {
		alert("No Webstorage Support. MusicPlayer might not work properly!");
	}

}

// leert den Webstorage
function clearWebstorage() {
	localStorage.clear()
}

/*Overlay für das Mobile Style Menü */
/*Öffnen des Menüs*/
function openMobNav() {
	if (mobileMenue == "closed") {
		document.getElementById("mobileStyles").style.height = "100%";
		mobileMenue = "open";
		console.log("Das Menü wurde geöffnet:" + mobileMenue);
	} else if (mobileMenue == "open") {
		document.getElementById("mobileStyles").style.height = "0%";
		mobileMenue = "closed";
		console.log("Das Menü wurde geschlossen:" + mobileMenue);
	} else {
		console.log("Something went wrong!");
	}

}

/* Laufschrift von
https://webdesign.weisshart.de/marquee.php*/
function lF(){
    if(document.getElementById("lauftext")){
        var text = document.getElementById("lauftext");
        var l = text.innerHTML.length;
        var nodes = document.getElementById("lauftext").getElementsByTagName("span");
        for(var i=0; i<nodes.length; i++){
            nodes[i].style.animationDuration = l/10 + "s";
        } 
        console.log("Ich lebe");
    }

}


/*Öffnen der verschiedenen Listen-Tabs*/

function openList(listName){
    console.log("Diese Liste wurde angefordert: " + listName)
    var show = "";
    var list = document.getElementsByClassName("list");
    var tab = document.getElementsByClassName("tab");
    switch(listName){
        case "allSongs":
			showAsActive("ASTab");
            show = "allSongsList";
            break;
        case "curPlayList":
            show = "curPlayList";
			showAsActive("CPLTab");
			displayCurrentPlaylist();
            break;
		case "allPlayList":
			show = "allPlayList";
			showAsActive("APTab");
			displayPlaylists();
			break;
		case "createPlaylist":
			show = "createPlaylist";
			showAsActive("CRPLTab");
			displayPlaylistCreation();
			break;
	}
    for(var i = 0; i < list.length; i++){
        list[i].style.display = "none";
    }
    for(var i = 0; i < tab.length; i++){
        tab[i].className.replace (" active","");
    }
    document.getElementById(show).style.display = "block";
    /*ev.currentTarget.className += " active";*/

}

/**
 * Funktion für das Wechseln von Verscchiedenen Styles:
 * WICHTIG! HINZUFÜGEN NEUER STYLES:
 * in elementID sind ne Menge id's gespeichert, da die Funktion zum wechseln der Styles nach 
 * den ids sucht und entsprechende Klassen hinzufügt, welche in style.css gespeichert sind.
 * Der Name jeder Klasse setzt sich aus der Style-Bezeichnug und einer Endung zusammen: z.B:
 * style = neon, Endung = SB ergibt neonSB!
 * Dies führt aber dazu, dass es für jeden Style ein Array geben muss, in dem die Endungen stehen.
 * Hierbei gillt, dass die Endung an dem Index stehen muss, an dem auch die ID steht, an der die 
 * Klasse angehängt werden soll. "Unbenutzt" Indexfelder bitte mit XX füllen! 
*/

var elementID = ["last","playPause","stop","next","mute","songVolume","styleBut","closeStyleBut","allSongsList","curPlayList",
				"allPlayList","allSongsBut","curPlayBut","allPlayBut","createPlaylistBut","body","lauftextInhalt","neon", "neonM", "darkmode", 
				"darkmodeM", "default", "defaultM","mobileStyles", "black", "blackM", "nature", "natureM","styleNav","createPlaylist", 
				"clear", "clearM","curPlayList2","sort", "deletePlaylist","deleteSong","addSong","savePlaylist","playlistname","sortInPlaylist",
				"playlistLength"];
var neonSN =    ["CB","CB","CB","CB","CB","SV","SB","SB","ASL","CPL",
				"APL","ASB","CPB","APB","CRPB","B","LTI","SY","SY","SY",
				"SY","SY","SY","MS","SY","SY","SY","SY","SY","CRPL",
				"CW","CW","CPL","ASLBUT","APLBUT","CPLBUT","CPLBUT","CRPLBUT","CRPLBUT","CRPLBUT",
				"PLLH"];
var blackSN =   ["BLACK","BLACK","BLACK","BLACK","BLACK","BLACK","BLACK","BLACK","BLACK","BLACK",
                "BLACK","BLACK","BLACK","BLACK","BLACK","BLACK","BLACK","BLACK","BLACK","BLACK",
                "BLACK","BLACK","BLACK","BLACK","BLACK","BLACK","BLACK","BLACK","BLACK","BLACK", 
				"BLACK","BLACK","BLACK","BLACK","BLACK","BLACK","BLACK","BLACK","BLACK","BLACK"];
var darkmodeSN = ["CB","CB","CB","CB","CB","CB","CB","CB","CB","CB","CB",
	"CB", "CB", "CB", "CB", "B", "LTI", "CB", "CB", "CB", "CB", "CB", "CB", "CB", "CB", "CB", "CB", "CB", "CB", "CB", "CB", "CB", "CB", "CB", "CB", "CB", "CB", "CB", "CB","CB"];
var natureSN =   ["CB","CB","CB","CB","CB","SV","CB","CB","RPL","RPL","RPL",
	"PL", "PL", "PL", "PL", "B", "LTI", "TAB", "TAB", "RTAB", "RTAB", "RTAB", "RTAB", "TAB", "TAB", "TAB", "TAB", "TAB", "WH", "RPL",
	"RTAB", "RTAB", "RPL", "RPL", "RPL", "RPL", "RPL", "RPL", "RPL", "RPL",
	"RPL"];
var defaultSN = ["BUT","BUT","BUT","BUT","BUT","BUT","BUT","BUT","LIST","LIST",
				"LIST","TAB","TAB","TAB","TAB","A","A","BUT", "BUTM", "BUT", 
				"BUTM", "BUT", "BUTM","BUT", "BUT", "BUTM", "BUT", "BUTM","A","LIST", 
				"BUT", "BUTM", "LIST","BUT","BUT","BUT","BUT","BUT","BUT","BUT","BUTM"];
var elementSN = "noSN";
var oldElementSN = "noOldSN";
var backUpStyle = "noBackup";
let blackActive = false;
let hideOnBlackList = document.getElementsByClassName("dontWorkOnBlack");
/*Wechseln der verschiedenen Styles */
function styleChange(style){
	let listElements = document.getElementsByClassName("hoverElements");
    if(style != curStyle){
        console.log("LOADING STYLE: " + style);
        newStyle = style;
        switch(curStyle){
            case "neon":
                oldElementSN = neonSN;
                break;
            case "default":
                oldElementSN = defaultSN;
                break;
            case "black":
                oldElementSN = blackSN;
                break;
            case "darkmode":
                oldElementSN = darkmodeSN;
                break;
            case "nature":
                oldElementSN = natureSN;
                break;
        }
		for(let i = 0; i < listElements.length; i++){listElements[i].classList.remove("neon","default","nature","black","darkmode");}
        switch(newStyle){
            case "neon":
                elementSN = neonSN;
				for(let i = 0; i < listElements.length; i++){listElements[i].classList.add("neon");}
                break;
            case "default":
                elementSN = defaultSN;
				for(let i = 0; i < listElements.length; i++){listElements[i].classList.add("default");}
                break;
            case "black":
                elementSN = blackSN;
				for(let i = 0; i < listElements.length; i++){listElements[i].classList.add("black");}
				for(let i = 0; i < hideOnBlackList.length; i++){
					hideOnBlackList[i].classList.add("dino");
				}
                break;
            case "darkmode":
                elementSN = darkmodeSN;
				for(let i = 0; i < listElements.length; i++){listElements[i].classList.add("darkmode");}
                break;
            case "nature":
                elementSN = natureSN;
				for(let i = 0; i < listElements.length; i++){listElements[i].classList.add("nature");}
                break;
        }
        var counter = 0;
        for(counter = 0; counter < elementID.length; counter++){
            /*Add class from new Style to the IDs */
            console.log("Wir sind bei: " + counter + " von: " + (elementID.length-1));
            document.getElementById(elementID[counter]).classList.add(newStyle + elementSN[counter]);
            console.log("Added: " + (newStyle + elementSN[counter]) + " to " + elementID[counter]);
            /*Remove class from current/ old Style from IDS */
            document.getElementById(elementID[counter]).classList.remove(curStyle + oldElementSN[counter]);
            console.log("Removed: " + (curStyle + oldElementSN[counter]) + " from " + elementID[counter]);
        }
		showAsActive(newStyle);
        console.log("STYLE LOADED!");
        backUpStyle = curStyle;
        curStyle = newStyle;
        oldElementSN = elementSN; 
        localStorage.setItem("savedStyle", curStyle); 
    }
    if(curStyle == "black"){
        localStorage.setItem("savedStyle", backUpStyle);
        console.log("Maybe you should consider to listen if something is told to you!");
        openMobNav();
		setTimeout(function(){turnLightsBackOn()}, 5000);
    }
    
}
function turnLightsBackOn() {
	alert("Maybe you should consider to listen if something is told to you!");
	for (let i = 0; i < hideOnBlackList.length; i++) {
		hideOnBlackList[i].classList.remove("dino");
	}
	styleChange(backUpStyle);
}



// sendet Anfrage an php und bekommt Pfade von mp3, ogg, wav Dateien zurueck, die im Array songPaths gespeichert werden
function getSongPaths() {
	fetch("crawler.php")
		.then(function(response) {
			return (response.json())
		})
		.then(function(songpaths) {
			songPaths = songpaths;
			createSongList();
			displaySongs();
		})
		.catch(function(error) {
			console.log(error);
		});
}


// erstellt Array mit den Liedern, jeweils in der Form [path: , title: , folder:]
function createSongList() {
	let lastSlash;
	let secondToLastSlash;
	for (let i = 0; i < songPaths.length; ++i) {
		// wenn Pfadnamen im System nicht mit \ angegeben werden, wird stattdessen nach / gesucht
		if (songPaths[i].lastIndexOf('\\') == -1) {
			lastSlash = songPaths[i].lastIndexOf('/');
			secondToLastSlash = songPaths[i].substring(0, lastSlash).lastIndexOf('/')
		} else {
			lastSlash = songPaths[i].lastIndexOf('\\');
			secondToLastSlash = songPaths[i].substring(0, lastSlash).lastIndexOf('\\')
		}
		let folder = songPaths[i].substring(secondToLastSlash + 1, lastSlash);
		let lastDot = songPaths[i].lastIndexOf('.');
		let title = songPaths[i].substring(lastSlash + 1, lastDot);
		songs.push({ "path": songPaths[i], "title": title, "folder": folder })
	}
	console.log(songs.length + " songs found: ")
	console.log(songs);
}


// Sortiert Lieder nach Ordnernamen
function sortByFolder() {
	songs.sort(function(a, b) {
		let titleA = a.folder;
		let titleB = b.folder;
		titleA = titleA.toLowerCase();
		titleB = titleB.toLowerCase();
		if (titleA < titleB) {
			return -1;
		}
		if (titleA > titleB) {
			return 1;
		}
		return 0;
	});
}

// Sortiert Lieder nach Titel
function sortAlphabetically() {
	songs.sort(function(a, b) {
		let titleA = a.title;
		let titleB = b.title;
		titleA = titleA.toLowerCase();
		titleB = titleB.toLowerCase();
		if (titleA < titleB) {
			return -1;
		}
		if (titleA > titleB) {
			return 1;
		}
		return 0;
	});
}

sortButton.addEventListener("click", displaySongs);

// listet Lieder unter all songs auf, alphabetisch oder nach Ordner sortiert
function displaySongs() {
	if (isOrderedAlphabetically) {
		sortByFolder();
		isOrderedAlphabetically = false;
		document.getElementById("sort").innerHTML = "Sort alphabetically";
	} else {
		sortAlphabetically();
		isOrderedAlphabetically = true;
		document.getElementById("sort").innerHTML = "Sort by folder";
	}
	/* wenn zum Zeitpunkt des Ordnens keine Playlist lief, muss current index aktualisiert werden, weil 
	der aktuelle Song jetzt im song array an einer anderen Stelle steht */
	if (currentPlaylist == -1) {
		let title = document.getElementById("lauftextInhalt").innerHTML;
		currentIndex = getCurrentIndex(title);
	}

	// listet Titel unter allSongs auf
	document.getElementById("allSongs").innerHTML = "";
	for (let i = 0; i < songs.length; ++i) {
		let songInList = document.createElement("p");
		songInList.innerHTML = songs[i].title + " - " + songs[i].folder;
		songInList.onclick = function() {
			currentIndex = i;
			play();
		}
		document.getElementById("allSongs").appendChild(songInList);
	}
	
	// passt die Hervorhebung des aktuellen Liedes nach der Sortierung an neuen Index an
	highlightElement("allSongs");
}


// gibt Index des aktuellen Liedes im song array zurück
function getCurrentIndex(title) {
	for (let i = 0; i < songs.length; i += 1) {
		if (songs[i].title === title) {
			return i;
		}
	}
	return -1;
}

// hebt aktuelles Lied/Playlist hervor; listId ist die Id des Elements in denen die Listenelemente stehen
function highlightElement(listId) {
	let highlightedElement = document.getElementById("highlightedElement");
	if (highlightedElement != null) {
		highlightedElement.id = "";
		highlightedElement.classList.remove("neon","default","black","nature","darkmode");
	}
	let j;
	if (listId == "playlists") {
		j = currentPlaylist + 1;
	} else {
		j = currentIndex + 1
	}
	highlightedElement = document.querySelector("#" + listId + " p:nth-child(" + j + ")")
	if (highlightedElement != null) {
		highlightedElement.id = "highlightedElement";
		highlightedElement.classList.add(curStyle);
	}
}

// macht Song i aus dem Array songs zum aktuellen Song und spielt ihn ab
function play() {
	highlightElement("allSongs");
	pauseUnpauseButton.disabled = false;
	if (currentPlaylist != -1) {
		document.getElementById("curPlayBut").innerHTML = "No playlist active";
	}
	currentPlaylist = -1;
	song.src = songs[currentIndex].path;
	//alert("Source of playing song: " + song.src);
	song.play();
	let title = document.getElementById("lauftextInhalt");
	title.innerHTML = songs[currentIndex].title;

	showAsActive("playBut");

}

/* wenn aktuelles Lied beendet ist, wird automatisch das naechste in der Liste abgespielt 
oder die Wiedergabe gestoppt, wenn es das letzte Lied der Liste war */
song.addEventListener("ended", function() {
	currentIndex++;
	if (currentPlaylist == -1) { // wenn aktuelles Lied nicht aus einer Playlist stammt
		if (songs.length == currentIndex) {
			stop();
		} else {
			play();
		}
	} else { // wenn aktuell eine Playlist laeuft
		if (playlists[currentPlaylist].length == currentIndex) {
			stop();
		} else {
			playPlaylist();
		}
	}
});

// pausiert Lied oder setzt es fort
pauseUnpauseButton.addEventListener('click', function() {
	if (!song.paused) {
		console.log("Song paused")
		song.pause();
		//pausiert die Visualisierung
		audio.pause();
		showAsActive("pauseBut");
	} else {
		console.log("Song started")
		song.play();
		//spielt die Visualisierung wieder ab
		audio.play();
		showAsActive("playBut");
	}
});

// springt zum vorherigen Lied in der Liste oder zum letzten Lied der Liste, wenn man gerade das erste gehoert hat
previousButton.addEventListener('click', function() {
	if (currentIndex == 0) {
		if (currentPlaylist == -1) {
			currentIndex = songs.length - 1;
			play();
		} else {
			currentIndex = playlists[currentPlaylist].length - 1
			playPlaylist();
		}
	} else {
		currentIndex = currentIndex - 1;
		if (currentPlaylist == -1) {
			play();
		} else {
			playPlaylist();
		}
	}
	showAsActive("playBut");
});

// springt zum naechsten Lied oder zum ersten, wenn man das gerade das letzte der Liste gehört hat
nextButton.addEventListener('click', function() {
	if (currentPlaylist == -1) {
		if (currentIndex == songs.length - 1) {
			currentIndex = 0;
			play();
		} else {
			currentIndex = currentIndex + 1;
			play();
		}
	} else {
		if (currentIndex == playlists[currentPlaylist].length - 1) {
			currentIndex = 0;
		} else {
			currentIndex = currentIndex + 1;
		}
		playPlaylist();
	}
	showAsActive("playBut");
});


// Funktion zum Muten/Unmuten des Songs
muteButton.addEventListener('click', function() {
	if (!song.muted) {
		song.muted = true;
		showAsActive("muteBut");
	} else {
		song.muted = false;
		showAsActive("unmuteBut");
	}
});



stopButton.addEventListener('click', stop);

// Stoppt Wiedergabe, neues Lied muss aus der Liste gewaehlt werden
function stop() {
	let highlightedElement = document.getElementById("highlightedElement");
	if (highlightedElement != null) {
		highlightedElement.id = "";
	}
	pauseUnpauseButton.disabled = true;
	song.src = "";
	currentIndex = -1;
	let title = document.getElementById("lauftextInhalt");
	title.innerHTML = "Currently no song playing!";
	//pausiert die Visualisierung
	audio.pause();
	showAsActive("stopBut");
}

// Funktion zur Aenderung der Lautstaerke
songVolume.addEventListener("input", function() {
	song.volume = songVolume.value / 100;
});



//listet Lieder unter "create playlist" auf und fuegt sie bei Klick zu neuer Playlist hinzu
function displayPlaylistCreation() {
	document.getElementById("songsForPlaylist").innerHTML = "";
	if (isOrderedAlphabetically) {
		sortByFolder();
		isOrderedAlphabetically = false;
		document.getElementById("sortInPlaylist").innerHTML = "Sort alphabetically";
	} else {
		sortAlphabetically();
		isOrderedAlphabetically = true;
		document.getElementById("sortInPlaylist").innerHTML = "Sort by folder";
	}
	for (let i = 0; i < songs.length; ++i) {
		let songInList = document.createElement("p");
		songInList.innerHTML = songs[i].title + " - " + songs[i].folder;
		songInList.onclick = function() {
			if (!songInList.className.includes("savedSong")) { // fuegt nur Lieder hinzu die noch nicht in der Playlist sind
				playlist.push(songs[i]);
				document.getElementById("playlistLength").innerHTML = playlist.length + " songs selected";
				console.log("current playlist:");
				console.log(playlist);
				songInList.classList.add("savedSong");

				//fügt auch noch den aktuellen style hinzu
				songInList.classList.add(curStyle);
			}
		}
		document.getElementById("songsForPlaylist").appendChild(songInList);
	}
}

savePlaylistButton.addEventListener("click", savePlaylist)


//speichert neu erstellte Playlist (im Webstorage)
function savePlaylist() {
	let playlistName = document.getElementById("playlistname").value;
	if (playlistName == null || playlistName == "") {
		alert("Please enter a playlist name!");
	} else if (playlist.length == 0) {
		alert("Please select some songs!")
	} else {
		let savedSongs = document.querySelectorAll(".savedSong");
		for (let savedSong of savedSongs) {
			savedSong.classList.remove("savedSong");
			//entfernt alle styles
			savedSong.classList.remove("neon", "black", "darkmode", "nature", "default");
		}
		playlistNames.push(playlistName);
		playlists.push(playlist);
		playlist = [];
		document.getElementById("playlistLength").innerHTML = playlistName + " saved!";
		document.getElementById("playlistname").value = "";
		localStorage.setItem("playlists", JSON.stringify(playlists));
		localStorage.setItem("playlistNames", JSON.stringify(playlistNames));
		console.log("saved playlists: ")
		console.log(playlists)
		console.log("saved playlist names: " + playlistNames);
	}
}



//loescht aktuelle Playlist (auch aus dem Webstorage)
function deletePlaylist() {
	if (currentPlaylist == -1) {
		alert("Please select a playlist to delete!")
	} else {
		playlists.splice(currentPlaylist, 1);
		playlistNames.splice(currentPlaylist, 1);
		stop();
		currentPlaylist = -1;
		document.getElementById("curPlayBut").innerHTML = "No playlist active";
		displayPlaylists();
		localStorage.setItem("playlists", JSON.stringify(playlists));
		localStorage.setItem("playlistNames", JSON.stringify(playlistNames));
		console.log(playlistNames)
	}
}

// listet die Playlists unter "all playlists" auf 
function displayPlaylists() {
	// Zeigt den delete Button nur an, wenn Playlists vorhanden sind
	if (playlists.length === 0) {
		document.getElementById("deletePlaylist").style = "display: none"
	} else {
		document.getElementById("deletePlaylist").style = "display: inline"
	}
	document.getElementById("playlists").innerHTML = "";
	for (let i = 0; i < playlistNames.length; ++i) {
		let playlistInList = document.createElement("p")
		playlistInList.innerHTML = playlistNames[i];
		playlistInList.onclick = function() {
			document.getElementById("curPlayBut").innerHTML = playlistNames[i];
			currentIndex = 0;
			currentPlaylist = i;
			playPlaylist();
			highlightElement("playlists");
		}
		document.getElementById("playlists").appendChild(playlistInList);
		highlightElement("playlists");
	}
}


// spielt Lied in Playlist ab
function playPlaylist() {
	highlightElement("currentPlaylist");
	pauseUnpauseButton.disabled = false;
	song.src = playlists[currentPlaylist][currentIndex].path;
	song.play();
	let title = document.getElementById("lauftextInhalt");
	title.innerHTML = playlists[currentPlaylist][currentIndex].title;
}

// zeigt Lieder der aktuellen Playlist im "current playlist" Tab an
function displayCurrentPlaylist() {
	console.log("aktuelle Playlist: ");
	document.getElementById("currentPlaylist").innerHTML = "";
	if (currentPlaylist != -1) {
		document.getElementById("deleteSong").style.display = "inline";
		document.getElementById("addSong").style.display = "inline";
		console.log(playlists[currentPlaylist]);
		if (currentPlaylist >= 0) {
			for (let i = 0; i < playlists[currentPlaylist].length; ++i) {
				let currentPlaylistInList = document.createElement("p");
				currentPlaylistInList.innerHTML = playlists[currentPlaylist][i].title + " - " + playlists[currentPlaylist][i].folder;
				currentPlaylistInList.onclick = function() {
					currentIndex = i;
					playPlaylist();
				}
				document.getElementById("currentPlaylist").appendChild(currentPlaylistInList);
			}
		}
		// Songs koennen durch Klick zur aktuellen Playlist hinzugefuegt werden
		document.getElementById("songsToAdd").innerHTML = "";
		for (let i = 0; i < songs.length; ++i) {
			let songToAdd = document.createElement("p");
			songToAdd.innerHTML = songs[i].title;
			songToAdd.onclick = function() {
				playlists[currentPlaylist].push(songs[i]);
				localStorage.setItem("playlists", JSON.stringify(playlists));
				displayCurrentPlaylist();
			}
			document.getElementById("songsToAdd").appendChild(songToAdd);
		}
		highlightElement("currentPlaylist");
	} else {
		document.getElementById("deleteSong").style.display = "none";
		document.getElementById("addSong").style.display = "none";

	}
}

deleteSongButton.addEventListener("click", deleteSong);

// loescht ausgewaehlten Song aus der Playlist oder die ganze Playlist, falls nur ein Song vorhanden war
function deleteSong() {
	if (currentIndex == -1) {
		alert("Please select a song to delete!")
	} else {
		if (playlists[currentPlaylist].length == 1) {
			deletePlaylist();
		} else {
			playlists[currentPlaylist].splice(currentIndex, 1);
			console.log(playlists)
			localStorage.setItem("playlists", JSON.stringify(playlists));
		}
		displayCurrentPlaylist();
		stop();
	}
}


addSongButton.addEventListener("click",showSongsToAdd);

// zeigt Liste aller Lieder an, die zur aktuellen Playlist hinzugefuegt werden koennen
function showSongsToAdd() {
	//alert("button pressed");
	let curPlayList = document.getElementById("curPlayList");
	let curPlayList2 = document.getElementById("curPlayList2");
	let curPlay = document.getElementById("small");
	let curPlay2 = document.getElementById("small2");
	

	if (curPlayList2.style.display === "none") {
		curPlayList2.style.display = "block";
		curPlayList.classList.add("halfList");
		songAddOpen = true;
		showAsActive("addSongs");
	} else {
		curPlayList2.style.display = "none";
		curPlayList.classList.remove("halfList");
		songAddOpen = false;
		showAsActive("closeSongs");
		
	}

	if(window.innerWidth < 650 && songAddOpen){
		curPlay.classList.remove("fixed1");
		curPlay.classList.add("fixed2");
		curPlay2.classList.remove("noFix1");
		curPlay2.classList.add("noFix4");
	}
	if(window.innerWidth > 651 && songAddOpen){
		curPlay.classList.remove("fixed2");
		curPlay.classList.add("fixed1");
		curPlay2.classList.remove("noFix4");
		curPlay2.classList.add("noFix1");
	}

	if(!songAddOpen){
		curPlay.classList.remove("fixed2", "fixed1");
		curPlay.classList.add("fixed1");
		curPlay2.classList.remove("noFix4", "noFix1");
		curPlay2.classList.add("noFix1");
	}

}


/**
 * Fügt die Visualisierung hinzu
 */

can.width = w;
can.height = h;

song.onplaying = function(){
	audio.src = song.src;
	visualiseAudio();
	//console.log("TESTTESTTESTTEST");
}

//visualisierung
let onlyOnce = true;
function visualiseAudio() {
	audio.play();
	if (onlyOnce == true) {
		audioSource = audioContext.createMediaElementSource(audio);
		analyser = audioContext.createAnalyser();
		audioSource.connect(analyser);
		onlyOnce = false;
	}
	analyser.fftSize = 256;
	const buffer = analyser.frequencyBinCount;
	const data = new Uint8Array(buffer);
	let barWidth = can.width / buffer;
	let barHeight;
	let x = 0;

	function animateAudio() {
		x = 0;
		//aktualisieren der breite der einzelnen "Dinger", falls die fensterbreite geändert wird
		barWidth = can.width / buffer;

		canvasContext.clearRect(0, 0, can.width, can.height);
		analyser.getByteFrequencyData(data);
		for (let i = 0; i < buffer; i++) {
			//Versuch einer Anpassung, dass es auch geht, wenn das fenster weniger hoch ist
			barHeight = data[i] * (can.height * 0.0035);
			switch (curStyle) {
				case "neon":
					canvasContext.fillStyle = "#20d2f4";
					break;
				case "black":
					canvasContext.fillStyle = "black";
					break;
				case "default":
					canvasContext.fillStyle = "black";
					break;
				case "nature":
					canvasContext.fillStyle = "#b4c195";
					break;
				case "darkmode":
					canvasContext.fillStyle = "white";
					break;
				default:
					canvasContext.fillStyle = "black";
					break;
			}
			//canvasContext.fillStyle = "white";
			canvasContext.fillRect(x, can.height - barHeight - (barWidth * 2), barWidth, barWidth * 2);
			x += barWidth;
		}
		requestAnimationFrame(animateAudio);

	}
	animateAudio();
}


//window resize Event to change the Canvas sizes
window.addEventListener("resize", function() {
	console.log("Canvas Resize!");
	w = vis.offsetWidth;
	h = vis.offsetHeight;

	can.width = w;
	can.height = h;

//Anpassen der beiden Fenster zum Song hinzufügen, dass auch alles auf die Seite passt
	if (window.innerWidth < 650) {
		curPlay.classList.remove("fixed1");
		curPlay.classList.add("fixed2");
		curPlay2.classList.remove("noFix1");
		curPlay2.classList.add("noFix4");
	}
	if (window.innerWidth > 651) {
		curPlay.classList.remove("fixed2");
		curPlay.classList.add("fixed1");
		curPlay2.classList.remove("noFix4");
		curPlay2.classList.add("noFix1");
	}

});

const showAsActiveIDList = [document.getElementById("playPause"), document.getElementById("mute"),
document.getElementById("allSongsBut"), document.getElementById("curPlayBut"),
document.getElementById("allPlayBut"), document.getElementById("createPlaylistBut"),
document.getElementById("neon"), document.getElementById("neonM"),
document.getElementById("default"), document.getElementById("defaultM"),
document.getElementById("darkmode"), document.getElementById("darkmodeM"),
document.getElementById("nature"), document.getElementById("natureM"),
document.getElementById("addSong")];

function showAsActive(callingElement) {
	console.log("Calling Element: " + callingElement);
	switch (callingElement) {
		case "playBut":
			showAsActiveIDList[0].classList.add("showActive");
			showAsActiveIDList[0].innerHTML = "||";
			break;
		case "pauseBut":
			showAsActiveIDList[0].classList.add("showActive");
			showAsActiveIDList[0].innerHTML = "&#9654;";
			break;
		case "stopBut":
			showAsActiveIDList[0].classList.remove("showActive");
			showAsActiveIDList[0].innerHTML = "&#9654;";
			break;
		case "muteBut":
			showAsActiveIDList[1].classList.add("showActive");
			document.getElementsByClassName("mute2")[0].innerHTML = "&#128360;";
			document.getElementsByClassName("mute3")[0].innerHTML = "&#215;";
			document.getElementsByClassName("mute4")[0].innerHTML = "";
			break;
		case "unmuteBut":
			showAsActiveIDList[1].classList.remove("showActive");
			document.getElementsByClassName("mute2")[0].innerHTML = "";
			document.getElementsByClassName("mute3")[0].innerHTML = "";
			document.getElementsByClassName("mute4")[0].innerHTML = "&#128362;";
			break;
		case "ASTab":
			clearAktive("TAB");
			showAsActiveIDList[2].classList.add("showActive");
			break;
		case "CPLTab":
			clearAktive("TAB");
			showAsActiveIDList[3].classList.add("showActive");
			break;
		case "APTab":
			clearAktive("TAB");
			showAsActiveIDList[4].classList.add("showActive");
			break;
		case "CRPLTab":
			clearAktive("TAB");
			showAsActiveIDList[5].classList.add("showActive");
			break;
		case "neon":
			clearAktive("STYLE");
			showAsActiveIDList[6].classList.add("showActive");
			showAsActiveIDList[7].classList.add("showActive");
			break;
		case "default":
			clearAktive("STYLE");
			showAsActiveIDList[8].classList.add("showActive");
			showAsActiveIDList[9].classList.add("showActive");
			break;
		case "nature":
			clearAktive("STYLE");
			showAsActiveIDList[12].classList.add("showActive");
			showAsActiveIDList[13].classList.add("showActive");
			break;
		case "darkmode":
			clearAktive("STYLE");
			showAsActiveIDList[10].classList.add("showActive");
			showAsActiveIDList[11].classList.add("showActive");
			break;
		case "addSongs":
			showAsActiveIDList[14].classList.add("showActive");
			showAsActiveIDList[14].innerHTML = "close songs";
			break;
		case "closeSongs":
			showAsActiveIDList[14].classList.remove("showActive");
			showAsActiveIDList[14].innerHTML = "add songs";
			break;
		default:
			console.log("Can't set '" + callingElement + "' as Active!");
			break;
	}
	function clearAktive(element) {
		if (element == "TAB") {
			for (let i = 2; i < 6; i++) {
				showAsActiveIDList[i].classList.remove("showActive");
			}
		}
		if (element == "STYLE") {
			for (let i = 6; i < 14; i++) {
				showAsActiveIDList[i].classList.remove("showActive");
			}
		}

	}

}
