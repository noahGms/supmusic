// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.
const wavesurfer = WaveSurfer.create({
    container: '#waveform',
    waveColor: 'violet',
    progressColor: 'purple'
});

const playerMode = {};
const playerModeProxy = new Proxy(playerMode, {
    set: function(target, key, value) {
        target[key] = value;
        
        if (value === false) {
            $('#previousSong').prop("disabled",true);
            $('#nextSong').prop("disabled",true);
        } else {
            $('#previousSong').prop("disabled",false);
            $('#nextSong').prop("disabled",false);
        }
        
        return true;
    }
});

const current_song = localStorage.getItem('current_song');
if (current_song) {
    loadSong(current_song);
    const name = getNameWithoutExtension(current_song);
    updateSongInProgressText(name);
    playerModeProxy.isPlaylist = false;
}
const playlistSong = JSON.parse(localStorage.getItem('playlist'));
const playlistCurrentSong = localStorage.getItem('current_song_playlist');
if (playlistSong && playlistCurrentSong) {
    loadSong(playlistSong[parseInt(playlistCurrentSong)].path);
    updateSongInProgressText(playlistSong[parseInt(playlistCurrentSong)].name);
    localStorage.setItem('current_song_playlist', playlistCurrentSong);
    playerModeProxy.isPlaylist = true;
}

wavesurfer.on('pause', function () {
   const pauseButton = document.getElementById("pauseButton");
   pauseButton.innerHTML = "Play";
});

wavesurfer.on('play', function () {
    const pauseButton = document.getElementById("pauseButton");
    pauseButton.innerHTML = "Pause";
});

wavesurfer.on('finish', function () {
    if (playerModeProxy.isPlaylist) {
        nextPlaylistSong();
    }
});

function loadSong(path) {
    wavesurfer.load(window.location.origin + `/musics/${window.userId}/` + path);
}

function playSong(path) {
    loadSong(path);
    const name = getNameWithoutExtension(path);
    updateSongInProgressText(name);
    wavesurfer.on('ready', function () {
        wavesurfer.play();
    });
    localStorage.setItem('current_song', path);
    localStorage.removeItem('playlist');
    localStorage.removeItem('current_song_playlist');

    playerModeProxy.isPlaylist = false;
}

async function playPlaylist(playlistId) {
    const response = await fetch('/Playlist/GetPlaylistSongs/' + playlistId);
    const data = await response.json();
    
    const songs = [];
    data.forEach(function (song) {
        songs.push(song.song);
    });

    let currentSong = 0;
    loadSong(songs[currentSong].path);
    updateSongInProgressText(songs[currentSong].name);
    
    wavesurfer.on('ready', function () {
        wavesurfer.play();
    });
    
    localStorage.setItem('playlist', JSON.stringify(songs));
    localStorage.setItem('current_song_playlist', currentSong);
    localStorage.removeItem('current_song');

    playerModeProxy.isPlaylist = true;
}

function nextPlaylistSong() {
    const songs = JSON.parse(localStorage.getItem('playlist'));
    const currentSong = localStorage.getItem('current_song_playlist');

    const nextCurrentSong = parseInt(currentSong) + 1;
    if (nextCurrentSong < songs.length) {
        loadSong(songs[nextCurrentSong].path);
        updateSongInProgressText(songs[nextCurrentSong].name);
        wavesurfer.on('ready', function () {
            wavesurfer.play();
        });
        localStorage.setItem('current_song_playlist', nextCurrentSong);
    } else {
        loadSong(songs[0].path);
        updateSongInProgressText(songs[0].name);
        wavesurfer.on('ready', function () {
           stopSong(); 
        });
        localStorage.setItem('current_song_playlist', 0);
    }
}

function previousPlaylistSong() {
    const songs = JSON.parse(localStorage.getItem('playlist'));
    const currentSong = localStorage.getItem('current_song_playlist');

    if (currentSong > 0) {
        const previousCurrentSong = parseInt(currentSong) - 1;
        loadSong(songs[previousCurrentSong].path);
        updateSongInProgressText(songs[previousCurrentSong].name);
        wavesurfer.on('ready', function () {
            wavesurfer.play();
        });
        localStorage.setItem('current_song_playlist', previousCurrentSong);
    } else {
        loadSong(songs[0].path);
        updateSongInProgressText(songs[0].name);
        wavesurfer.on(function () {
           stopSong(); 
        });
        localStorage.setItem('current_song_playlist', 0);
    }
}

function pauseSong() {
    wavesurfer.playPause();
}

function stopSong() {
    wavesurfer.stop();
}

function updateSongInProgressText(name) {
    $('#songInProgressText').text(name);
}

function getNameWithoutExtension(name) {
    return name.replace('.mp3', '');
}