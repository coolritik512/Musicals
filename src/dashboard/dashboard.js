import { createDashboardStructure, createPlaylistContainerStrucutre, createPlaylistTrack, } from '../elementDesign'
import { fetchRequest, getItemFromLocalStorage, setItemInLocalStorage } from "../api";
import { ENDPOINT, logoutUser, SECTION_TYPE, TRACK_LOADED_KEY, getDurationFormat } from "../common";


// dataload from internet; //done pura ek file bana di h jo ye kaam kregi hamesa

// dom me value;
const audio = new Audio();


let UserName;
let progressInterval;
let repeatBtnClickCount = 0;

const onProfileClick = (event) => {
    event.stopPropagation();
    const profileMenu = document.querySelector('#profile-menu');
    profileMenu.classList.toggle('hidden');

    if (profileMenu.classList.contains('hiddden') == false) {
        const logoutBtn = document.querySelector('#logout');
        logoutBtn.addEventListener('click', logoutUser);
    }
}

const loadUserProfile = async () => {

    const defaultImage = document.querySelector('#default-image')
    const profileImage = document.querySelector('#profile-image')
    const profileButton = document.querySelector('#user-profile-btn');
    const displayNameElement = document.querySelector('#display-name');

    const { display_name, images } = await fetchRequest(ENDPOINT.userInfo);

    displayNameElement.textContent = display_name;
    if (images.length > 0) {
        profileImage.innerHTML = `<img class="h-6 w-6 rounded-xl" src='${images[0].url}'>`;
    }

    profileButton.addEventListener('click', onProfileClick);

    return display_name;
}

const onplaylistClick = (event, id) => {
    const section = { type: SECTION_TYPE.PLAYLIST, playlist: id };
    history.pushState(section, '', `./playlist`);
    loadSection(section);
}

const createPlaylistContainer = ({ description, name, images, tracks: { href }, id }) => {
    const playlistContainer = createPlaylistContainerStrucutre({ description, name, images, tracks: { href }, id });
    playlistContainer.addEventListener('click', (event) => {
        onplaylistClick(event, id);
    });
    return playlistContainer;
}
const loadPlaylist = async (endpoint, elementId) => {
    const contentArea = document.querySelector(`${elementId}`);
    const { playlists: { items } } = await fetchRequest(endpoint);
    items.forEach((item) => {
        contentArea.appendChild(createPlaylistContainer(item));
    })
}


const fillContentForDashboard = () => {
    const coverContentElement = document.querySelector('#cover-content');
    coverContentElement.innerHTML = `Hello ${UserName}`;
    document.querySelector('#playlist-content').innerHTML = createDashboardStructure();
}


const loadPlaylistsOnDashboard = () => {
    loadPlaylist(ENDPOINT.featuredPlaylists, '#featured-playlist');
    loadPlaylist(ENDPOINT.topLists, '#top-playlist');
}


const onTrackSelection = (event, id) => {
    const trackElement = document.querySelectorAll('.track').forEach((track) => {
        if (track.id === id) {
            track.classList.add('bg-gray-800', 'selected');
        }
        else {
            track.classList.remove('bg-gray-800', 'selected');
        }
    })
}

const onAudioMetadataload = (id) => {
    const totalSongDuration = document.querySelector('#total-song-duration')
    totalSongDuration.textContent = getDurationFormat(audio.duration * 1000);
}

const updateIconForPauseMode = (id) => {
    const playButton = document.querySelector('#play');
    playButton.querySelector('span').textContent = 'play_circle'
    const track = document.querySelector(`#play-track-${id}`);
    if (track) {
        track.textContent = 'play_arrow';
    }
}

const updateIconForPlayMode = (id) => {
    const playButton = document.querySelector('#play');
    playButton.querySelector('span').textContent = 'pause_circle'
    const track = document.querySelector(`#play-track-${id}`)
    if (track) {
        track.textContent = 'pause';
    }
}

const toggleSong = (id) => {
    if (audio.paused == false) {
        updateIconForPauseMode(id);
        audio.pause();
    }
    else {
        updateIconForPlayMode(id);
        audio.play();
    }
}

const updateTrackDetailOnAudioController = ({ images, artistNames, preview_url, duration, name, id }) => {
    const songImage = document.querySelector('#now-playing-image');
    const songName = document.querySelector('#now-playing-song');
    const songartistNames = document.querySelector('#now-playing-artist');
    const songInfo = document.querySelector('#song-info');

    songImage.setAttribute('src', images[0].url);
    songName.textContent = name;
    songartistNames.textContent = artistNames;
    songInfo.classList.remove('invisible');
}
const playTrack = (event, { images, artistNames, preview_url, duration, name, id }) => {

    event?.stopPropagation();

    const audioControl = document.querySelector('#audio-control');

    if (audio.src == preview_url) {
        toggleSong(id);
    }
    else {
        if (audioControl?.getAttribute('data-track-id')) {
            const selectedTrackId = audioControl.getAttribute('data-track-id');
            updateIconForPauseMode(selectedTrackId);
        }
        updateTrackDetailOnAudioController({ images, artistNames, preview_url, duration, name, id });

        audioControl.setAttribute('data-track-id', id);
        audio.src = preview_url;
        audio.play();
    }
}
const createTrack = ({ track }, index) => {

    const { id, album, artists, name, duration_ms: duration, preview_url } = track;
    const { images } = album;
    const artistNames = Array.from(artists, artist => artist.name).join(', ');

    const trackElement = createPlaylistTrack({ index, id, album, artists, name, duration: getDurationFormat(duration), preview_url, images, artistNames });
    trackElement.addEventListener('click', (event) => { onTrackSelection(event, id) });

    const playButton = document.createElement('button');
    playButton.textContent = 'play_arrow';
    playButton.id = `play-track-${id}`
    playButton.className = `play absolute left-0 w-full invisible material-symbols-outlined`;

    playButton.addEventListener('click', (event) => playTrack(event, { images, artistNames, preview_url, duration, name, id }));
    trackElement.querySelector('p').appendChild(playButton);

    return trackElement;
}
const loadPlaylistTracks = (tracks) => {
    const tracksContainer = document.querySelector('#tracks');
    const loadedTrack = [];
    tracks.forEach((track, index) => {
        const { id, album, artists, name, preview_url, } = track.track;
        const { images } = album;
        // if (preview_url) {
        tracksContainer.append(createTrack(track, index));
        const artistNames = Array.from(artists, artist => artist.name).join(', ');
        loadedTrack.push({ id, album, artists, name, preview_url, images, artistNames });
        // }
    });
    setItemInLocalStorage(TRACK_LOADED_KEY, loadedTrack);
}
const fillContentForPlayList = async (playlistId) => {

    const playlists = await fetchRequest(`${ENDPOINT.playlist}/${playlistId}`)

    console.log(playlists);

    const { name, images, description, tracks: { items } } = playlists;

    // previ played contente 

    const previousPlayedElement = document.querySelector('#cover-content');

    previousPlayedElement.innerHTML = `
                                        <section class="grid grid-cols-[auto_1fr] gap-6" >
                                            <img src="${images[0].url}" alt="" class="h-40 w-40">
                                            <section class="flex flex-col">
                                                <p>PlayList</p>
                                                <p id="playlist-name" class="text-4xl">${name}</p>
                                                <span class="flex  gap-2 mt-4">
                                                    <p>${items.length}songs</p>
                                                </span>
                                            </section>
                                        </section>`

    // play list content;
    const playlistContent = document.querySelector('#playlist-content');

    playlistContent.innerHTML = `<header id='playlist-header' class='border-secondary border-b mx-8 py-4 z-10'>
                                    <nav class="py-2 text-secondary">
                                        <ul class="grid grid-cols-[50px_2fr_1fr_50px] gap-4 ">
                                            <li class='justify-self-center'>#</li>
                                            <li >Titile</li>
                                            <li >Album</li>
                                            <li>Duration</li>
                                        </ul>
                                    </nav>
                                </header>
                                <section  class="px-8" id="tracks">
                                </section>`;

    loadPlaylistTracks(playlists.tracks.items);
}

const loadSection = (section) => {


    if (section.type == SECTION_TYPE.DASHBOARD) {
        fillContentForDashboard();
        loadPlaylistsOnDashboard();
    }
    else if (section.type == SECTION_TYPE.PLAYLIST) {
        fillContentForPlayList(section.playlist);
    }
    else if (section.type == SECTION_TYPE.SEARCH) {
        loadSearchContent();
    }
}

const fillSearchedContent = ({ artists, albums, tracks }) => {
    console.log(albums);
    const playListContentElement = document.querySelector('#playlist-content');

    playListContentElement.innerHTML = ""
    tracks.items.forEach((track, index) => {
        playListContentElement.appendChild(createTrack({ track }, index));
    })
    const coverContentElement = document.querySelector('#cover-content');

    const firstTrack = tracks.items[0];
    const { album, name } = firstTrack;
    const { images } = album;
    coverContentElement.innerHTML = `
                                        <section class="grid grid-cols-[auto_1fr] gap-6" >
                                            <img src="${images[0].url}" alt="" class="h-40 w-40">
                                            <section class="flex flex-col">
                                                <p id="playlist-name" class="text-4xl">${name}</p>
                                            </section>
                                        </section>`
}

const onSearchChange = async (event) => {
    const { value } = event.target;
    console.log(value);

    const searchResult = await fetchRequest(`${ENDPOINT.search}?q=${value}&type=album,artist,track&limit=5`);
    fillSearchedContent(searchResult);
}

const debounce = (cb) => {
    var timer;
    return (event) => {
        clearTimeout(timer);
        timer = setTimeout(() => cb(event), 500);
    }
}

const debounceSearch = debounce(onSearchChange);

const loadSearchContent = () => {
    console.log('search section')
    const searchBarElement = document.querySelector('#search-bar');
    searchBarElement.classList.remove('hidden');

    searchBarElement.addEventListener('input', debounceSearch);
    const playListContentElement = document.querySelector('#playlist-content');
    const coverContentElement = document.querySelector('#cover-content');
    playListContentElement.innerHTML = "";
    coverContentElement.innerHTML = "";
}

const currentSongIndex = () => {
    const loadedTracks = getItemFromLocalStorage(TRACK_LOADED_KEY);
    return loadedTracks.findIndex((ele) => audio.src == ele.preview_url);
}
const playCurrentsong = () => {
    const loadedTracks = getItemFromLocalStorage(TRACK_LOADED_KEY);
    const indexOfCurrentSong = currentSongIndex();
    playTrack(null, loadedTracks[indexOfCurrentSong]);
}

const playnextsong = () => {
    console.log('next')

    const loadedTracks = getItemFromLocalStorage(TRACK_LOADED_KEY);
    const indexOfCurrentSong = currentSongIndex();

    if (loadedTracks?.length - 1 > indexOfCurrentSong && indexOfCurrentSong != -1) {
        playTrack(null, loadedTracks[indexOfCurrentSong + 1]);
    }

}
const playprevioussong = () => {
    const loadedTracks = getItemFromLocalStorage(TRACK_LOADED_KEY);
    const indexOfCurrentSong = currentSongIndex();
    if (indexOfCurrentSong > 0 && indexOfCurrentSong != -1) {
        playTrack(null, loadedTracks[indexOfCurrentSong - 1]);
    }
}

const loadUserPlayList = (id) => {

    const section = { type: SECTION_TYPE.PLAYLIST, playlist: id };
    history.pushState(section, '', `./playlist`);
    loadSection(section);
}

const fillUserPlaylist = async () => {

    const { items: playlists } = await fetchRequest(ENDPOINT.userPlaylist);

    console.log(playlists);

    const userPlaylistElement = document.querySelector('#user-playlist>ul');

    userPlaylistElement.innerHTML = `<ul class="flex flex-col gap-1 text-xl  "></ul>`

    playlists.forEach(({ name, id }, index) => {

        const list = document.createElement('li');
        list.className = 'cursor-pointer hover:text-primary';
        list.innerHTML = `${name}`;
        list.addEventListener('click', () => loadUserPlayList(id));
        userPlaylistElement.appendChild(list);
    })


}

// repeat song functionlaity start
const updateIconForRepeatMode = () => {
    const repeatButtonElement = document.querySelector('#repeat');

    if (repeatBtnClickCount == 2) {
        repeatButtonElement.querySelector('span').textContent = 'repeat_one';
    }
    else if (repeatBtnClickCount == 1) {
        repeatButtonElement.querySelector('span').style.color = 'green';
    }
    else {
        repeatButtonElement.querySelector('span').textContent = 'repeat';
        repeatButtonElement.querySelector('span').style.color = 'revert';
    }
}
const repeatSong = () => {
    if (repeatBtnClickCount == 2) {
        playCurrentsong();
    }
    else if (repeatBtnClickCount == 1) {
        playnextsong();
    }
    else {
        playnextsong();
    }
    // updateIconForRepeatMode();
}
const increaseRepeatCounter = () => {
    repeatBtnClickCount = (repeatBtnClickCount + 1) % 3;
    updateIconForRepeatMode()
}
// repeat song functionlaity start

document.addEventListener('DOMContentLoaded', async () => {

    const volume = document.querySelector('#volume');
    const playButton = document.querySelector('#play');
    const songDurationCompleted = document.querySelector('#song-duration-completed')
    const songProgress = document.querySelector('#progress');
    const songprogressContainer = document.querySelector('#progress-container');
    const audioControl = document.querySelector('#audio-control');

    const nextButtonElement = document.querySelector('#next');
    const prevButtonElement = document.querySelector('#previous');
    const repeatButtonElement = document.querySelector('#repeat');

    const searchButtonElement = document.querySelector('#search');
    const homeButtonElement = document.querySelector('#home');


    homeButtonElement.addEventListener('click', () => {
        const section = { type: SECTION_TYPE.DASHBOARD };
        history.pushState(section, '', './dashboard.html');
        loadSection(section);
    })

    const loadSearchSection = () => {
        const section = { type: SECTION_TYPE.SEARCH };
        history.pushState(section, '', './search');
        loadSection(section);
    }

    searchButtonElement.addEventListener('click', loadSearchSection);

    UserName = await loadUserProfile();



    const section = { type: SECTION_TYPE.DASHBOARD };
    history.pushState(section, '', '');
    // const section = { type: SECTION_TYPE.SEARCH };
    // history.pushState(section, '', 'search');

    loadSection(section);
    fillUserPlaylist();

    document.addEventListener('click', () => {
        const profileMenu = document.querySelector('#profile-menu');
        if (profileMenu.classList.contains('hidden') == false) {
            profileMenu.classList.add('hidden');
        }
    })

    document.querySelector('#main-content').addEventListener('scroll', (event) => {

        // console.log('scroll');

        const { scrollTop } = event.target;

        const navHeader = document.querySelector('#header');

        const coverContent = document.querySelector('#cover-content');

        const opacityNavHeader = scrollTop >= coverContent.offsetHeight ? 100 : ((scrollTop / coverContent.offsetHeight) * 100);
        navHeader.style.background = `rgba(0 0 0 / ${opacityNavHeader}%)`


        if (history.state.type === SECTION_TYPE.PLAYLIST) {
            const playlistHeader = document.querySelector('#playlist-header');

            if (scrollTop >= playlistHeader.offsetHeight) {
                console.log('exxe');
                playlistHeader.classList.add('sticky', 'bg-black-base', 'px-8');
                playlistHeader.classList.remove('mx-8');
                playlistHeader.style.top = `${navHeader.offsetHeight}px`;
            }
            else {
                playlistHeader.classList.remove('sticky', 'bg-black-base', 'px-8');
                playlistHeader.classList.add('mx-8');
                playlistHeader.style.top = 'revert';
            }
        }
    });


    audio.addEventListener('play', () => {

        const selectedTrackId = audioControl.getAttribute('data-track-id');

        const selectedTrack = document.querySelector(`[id='${selectedTrackId}']`);
        const playingTrack = document.querySelector('section.playing');
        selectedTrack?.classList.add('playing');

        if (playingTrack?.id !== selectedTrack?.id) {
            playingTrack?.classList.remove('playing');
        }
        progressInterval = setInterval(() => {


            if (audio.paused) {
                return;
            }
            songDurationCompleted.textContent = getDurationFormat(audio.currentTime * 1000);
            songProgress.style.width = `${(audio.currentTime / audio.duration) * (100)}%`;
        }, 1000);

        updateIconForPlayMode(selectedTrackId);
    })

    audio.addEventListener('pause', () => {
        if (progressInterval)
            clearInterval(progressInterval);
        const selectedTrackId = audioControl.getAttribute('data-track-id');
        updateIconForPauseMode(selectedTrackId);
    })

    // interval for Repeat;
    setInterval(() => {
        if (audio.duration == audio.currentTime) {
            repeatSong();
        }
    }, 100)

    audio.addEventListener('loadedmetadata', onAudioMetadataload); // duration song dikha rha h  



    // LISTNER ON AUDIO CONTROLLER SECTOIN
    playButton.addEventListener('click', () => {

        const selectedTrackId = audioControl.getAttribute('data-track-id');
        toggleSong(selectedTrackId)
    });


    repeatButtonElement.addEventListener('click', increaseRepeatCounter);

    nextButtonElement.addEventListener('click', playnextsong);
    prevButtonElement.addEventListener('click', playprevioussong);


    volume.addEventListener('change', () => {
        audio.volume = volume.value / 100;
    });

    songprogressContainer.addEventListener('click', (event) => {
        const songprogressContainerWidth = window.getComputedStyle(songprogressContainer).width;

        const timeToSeek = (event.offsetX / parseInt(songprogressContainerWidth)) * audio.duration;

        audio.currentTime = timeToSeek;
        songProgress.style.width = `${audio.currentTime / audio.duration * 100}%`;

    })

    window.addEventListener('popstate', (event) => {
        loadSection(event.state);
    })
})