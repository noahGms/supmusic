// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.
const wavesurfer = WaveSurfer.create({
    container: '#waveform',
    waveColor: 'violet',
    progressColor: 'purple',
    fillParent: true,
    minPxPerSec: 10,
    height: 40
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

$(document).ready(function () {
    const current_song = JSON.parse(localStorage.getItem('current_song'));
    if (current_song) {
        loadSong(current_song.path);
        updateSongInProgressText(current_song.name);
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
        pauseButton.innerHTML = `<i class="fa fa-play"></i>`;
    });

    wavesurfer.on('play', function () {
        const pauseButton = document.getElementById("pauseButton");
        pauseButton.innerHTML = `<i class="fa fa-pause"></i>`;
    });

    wavesurfer.on('finish', function () {
        if (playerModeProxy.isPlaylist) {
            nextPlaylistSong();
        }
    });

    $('#volumeSlider').change(handleVolumeChange);
    
    setVolumeFromLocalStorage();
});

function loadSong(path) {
    let fullPath;
    if (path.startsWith('http')) {
        fullPath = path;
    } else {
        fullPath = window.location.origin + `/musics/${window.userId}/` + path;
    }
    wavesurfer.load(fullPath);
}

function playSong(name, path) {
    loadSong(path);
    updateSongInProgressText(name);
    wavesurfer.on('ready', function () {
        wavesurfer.play();
    });
    localStorage.setItem('current_song', JSON.stringify({
        name,
        path
    }));
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

    let nextCurrentSong = parseInt(currentSong) + 1;
    if (nextCurrentSong === songs.length) {
        nextCurrentSong = 0;
    }

    loadSong(songs[nextCurrentSong].path);
    updateSongInProgressText(songs[nextCurrentSong].name);
    
    wavesurfer.on('ready', function () {
        if (nextCurrentSong === 0) {
            stopSong();
        } else {
            wavesurfer.play();
        }
    });
    
    localStorage.setItem('current_song_playlist', nextCurrentSong);
}

function previousPlaylistSong() {
    const songs = JSON.parse(localStorage.getItem('playlist'));
    const currentSong = localStorage.getItem('current_song_playlist');

    let previousCurrentSong = parseInt(currentSong) - 1;
    if (previousCurrentSong < 0) {
        previousCurrentSong = 0;
    } 

    loadSong(songs[previousCurrentSong].path);
    updateSongInProgressText(songs[previousCurrentSong].name);
    
    wavesurfer.on('ready', function () {
        wavesurfer.play();
    });
    
    localStorage.setItem('current_song_playlist', previousCurrentSong);
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

function openQueueModal() {
    $('#queue-modal-content').html('');
    if (playerModeProxy.isPlaylist) {
        const songs = JSON.parse(localStorage.getItem('playlist'));
        const currentSong = localStorage.getItem('current_song_playlist');
        
        songs.forEach((song, idx) => {
            const isCurrentSong = parseInt(currentSong) === parseInt(idx); 
            const bgColor = isCurrentSong ? 'background-color: gray !important; color: white;' : '';
            
            $('#queue-modal-content').append(`
                <div class="card h-50" style="${bgColor}">
                    <div class="d-flex justify-content-between align-items-center h-full">
                        <p class="card-title mb-0">${song.name}</p>
                        <div class="d-flex">
                            Actions
                        </div>
                    </div>
                </div>
            `);
        });
    } else {
        const song = JSON.parse(localStorage.getItem('current_song'));
        $('#queue-modal-content').append(`
            <div class="card h-50" style="background-color: gray !important; color: white;">
                <div class="d-flex justify-content-between align-items-center h-full">
                    <p class="card-title mb-0">${song.name}</p>
                    <div class="d-flex">
                        Actions
                    </div>
                </div>
            </div>
        `);
    }
    
    halfmoon.toggleModal('queue-modal');
}

async function openAddSongToPlaylistModal(songId) {
    const response = await fetch('/Playlist/GetAllMyPlaylist/');
    const data = await response.json();

    $('#add-song-to-playlist-modal-content').html('');
    
    if (data.length === 0) {
        $('#add-song-to-playlist-modal-content').html(`
            <div class="alert alert-primary" role="alert">
                <h4 class="alert-heading mb-0">
                    No playlist found
                </h4>
            </div>
        `);
    }

    const csrfToken = $('input[name="__RequestVerificationToken"]').val();
    data.forEach(playlist => {
        $('#add-song-to-playlist-modal-content').append(`
            <div class="card h-50 bg-very-dark">
                <div class="d-flex justify-content-between align-items-center h-full">
                    <p class="card-title mb-0">${playlist.name}</p>
                    <div class="d-flex">
                        <form action="/Song/AddSongToPlaylist/${songId}" method="post">
                            <input name="__RequestVerificationToken" type="hidden" value="${csrfToken}" />
                            <input type="text" id="playlistId" name="playlistId" value="${playlist.id}" hidden>
                            <button type="submit" class="btn btn-primary">
                                <i class="fa fa-plus"></i>                                    
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `);
    });
    
    halfmoon.toggleModal('add-song-to-playlist-modal');
}

function handleVolumeChange(event) {
    const volume = event.target.value / 100;
    wavesurfer.setVolume(volume);
    localStorage.setItem('audio_volume', volume);
}

function setVolumeFromLocalStorage() {
    const volume = localStorage.getItem('audio_volume') * 100 || 50;
    $('#volumeSlider').val(volume).trigger("change");
}
