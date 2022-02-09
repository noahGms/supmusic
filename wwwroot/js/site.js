// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.
const wavesurfer = WaveSurfer.create({
    container: '#waveform',
    waveColor: 'violet',
    progressColor: 'purple'
});

const current_song = localStorage.getItem('current_song');
if (current_song) {
    loadSong(current_song);
}

wavesurfer.on('pause', function () {
   const pauseButton = document.getElementById("pauseButton");
   pauseButton.innerHTML = "Play";
});

wavesurfer.on('play', function () {
    const pauseButton = document.getElementById("pauseButton");
    pauseButton.innerHTML = "Pause";
});

function loadSong(path) {
    wavesurfer.load('musics/54726e73-bf76-4981-82ed-013673d9e4c3/' + path);
}

function playSong(path) {
    loadSong(path);
    wavesurfer.on('ready', function () {
        wavesurfer.play();
    });
    localStorage.setItem('current_song', path);
}

function pauseSong() {
    wavesurfer.playPause();
}

function stopSong() {
    wavesurfer.stop();
}