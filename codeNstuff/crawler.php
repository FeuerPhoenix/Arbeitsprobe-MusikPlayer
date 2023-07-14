<?php

/*
 * durchsucht ./Musik und alle Unterordner nach mp3, wav und ogg Dateien und speichert sie im Array "songs",
 * gibt es als json zurueck
 */

$musicfolder = new RecursiveDirectoryIterator("./Musik");
$files = new RecursiveIteratorIterator($musicfolder);

$songs = array();
foreach ($files as $file) {

    if ($file->isDir()) {
        continue;
    }

    $path_info = pathinfo($file->getPathname());
    // Dateien mit der Endung mp3, ogg oder wav werden im Array gespeichert, der Rest ignoriert
    if ($path_info["extension"] == "mp3" || $path_info["extension"] == "ogg" || $path_info["extension"] == "wav") {
        $songs[] = $file->getPathname();
    }
}

echo json_encode($songs);
?>