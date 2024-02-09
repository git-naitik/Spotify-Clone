async function getSongs(folder) {
    currFolder = folder;
    let response = await fetch(`/songs/${currFolder}/songs.json`);
    let data = await response.json();
    return data.songs;
}

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

function extractSongName(url) {
    let parsedUrl = new URL(url);
    let pathname = parsedUrl.pathname;
    let fileName = pathname.split('/').pop();
    let songName = decodeURIComponent(fileName.split('.')[0]);
    return songName;
}

function playmusic(track, pause = false) {
    let songPath = `/songs/${currFolder}/${track}.mp3`;
    fetch(songPath).then(response => {
        if (response.ok) {
            currentSong.src = songPath;
            if (!pause) {
                currentSong.play();
                document.getElementById("playButton").src = "./svg/pause.svg";
            }
        } else {
            console.error('Error: Song file not found.');
        }
    }).catch(error => {
        console.error('Error fetching the song:', error);
    });

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
}

function updateSongList() {
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = '';
    for (const song of songs) {
        let songItem = document.createElement('li');
        songItem.innerHTML = `
            <div class="musicList">
                <img class="invert" src="./svg/music.svg" alt="music">
                <div class="songName">
                    ${song.split(".")[0]}
                </div>
            </div>
            <div class="playNow">
                <span>
                    Play now
                </span>
                <img class="invert" src="./svg/play.svg" alt="play">
            </div>`;
        songUL.appendChild(songItem);
    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            let x = e.querySelector(".songName").innerHTML.trim();
            playmusic(x);
        });
    });
}

function playNextSong() {
    if (!isAutoplayEnabled) {
        return;
    }
    let currentTrack = extractSongName(currentSong.src);
    let index = songs.findIndex(song => song.split('.')[0] === currentTrack);
    if (index < songs.length - 1) {
        playmusic(songs[index + 1].split(".")[0]);
    } else {
        playmusic(songs[0].split(".")[0]);
    }
}

let isAutoplayEnabled = false;
let currentSong = new Audio();
let songs = [];
let currFolder;

document.getElementById("toggleAutoplay").addEventListener("change", function () {
    isAutoplayEnabled = this.checked;
});

async function main() {
    
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(item.currentTarget.dataset.folder);
            updateSongList();
            if (songs.length > 0) {
                playmusic(songs[0].split(".")[0], true);
            }
        });
    });

    document.getElementById("playButton").addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            document.getElementById("playButton").src = "./svg/pause.svg";
        } else {
            document.getElementById("playButton").src = "./svg/play.svg";
            currentSong.pause();
        }
    });

    document.getElementById("toggleAutoplay").checked = isAutoplayEnabled;

    currentSong.addEventListener("timeupdate", () => {
        let cr = secondsToMinutesSeconds(currentSong.currentTime);
        let d = secondsToMinutesSeconds(currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${cr}/${d}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        var clickPosition = e.offsetX;
        var seekbarLength = e.currentTarget.getBoundingClientRect().width;
        let percent = (clickPosition / seekbarLength) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0;
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    });

    document.getElementById("previous").addEventListener("click", () => {
        let currentTrack = extractSongName(currentSong.src);
        let index = songs.findIndex(song => song.split('.')[0] === currentTrack);
        if (index >= 1) {
            playmusic(songs[index - 1].split(".")[0]);
        }
    });

    document.getElementById("next").addEventListener("click", () => {
        let currentTrack = extractSongName(currentSong.src);
        let index = songs.findIndex(song => song.split('.')[0] === currentTrack);
        if (index < songs.length - 1) {
            playmusic(songs[index + 1].split(".")[0]);
        }
    });

    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    document.getElementById("volume-icon").addEventListener("click", (e) => {
        if (currentSong.muted) {
            currentSong.muted = false;
            document.getElementById("volume-icon").src = "./svg/volume.svg";
        } else {
            document.getElementById("volume-icon").src = "./svg/mute.svg";
            currentSong.muted = true;
        }
    });

    currentSong.addEventListener("ended", playNextSong);

    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    
    function performSearch() {
        const searchQuery = searchInput.value.toLowerCase().trim();
    
        const songItems = document.querySelectorAll('.songList ul li');
    
        songItems.forEach(function(item) {
            const songName = item.querySelector('.songName').textContent.toLowerCase();
            if (songName.includes(searchQuery)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    searchButton.addEventListener('click', performSearch);
    
    searchInput.addEventListener('keydown', function(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            searchButton.click();
        }
    });
    
}

main();
