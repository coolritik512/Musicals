export const createPlaylistContainerStrucutre = ({ description, name, images, tracks: { href }, id }) => {

    const playlistContainer = document.createElement('section');
    playlistContainer.className = 'bg-black-secondary rounded border-2 p-4 cursor-pointer hover:bg-light-black';
    playlistContainer.id = id;

    playlistContainer.setAttribute('data-type', 'playlist');

    playlistContainer.innerHTML = `<img src="${images[0].url}">
                                    <h2>${name}</h2>
                                    <h3 class="line-clamp-2">${description}</h3>`;
    return playlistContainer;
}

export const createDashboardStructure = ()=>{
    const typeOfPlaylist = [['Featured playList', "featured-playlist"], ['Top Playlist', 'top-playlist']];
    let innerHTML = "";

    typeOfPlaylist.forEach(([playlistType, id]) => {

        innerHTML += `<section class='p-4' >
        <h1 class="text-2xl mb-4">${playlistType}</h1>
        <section id="${id}" class="grid grid-cols-auto-fill-card gap-4" >
        </section> </section>`;
    })
    return innerHTML
}

export const createPlaylistTrack = ({index , id, album, name, duration,images,artistNames }) =>{

    const trackElement = document.createElement('section');
    trackElement.id = id;
    trackElement.className = 'track p-1 grid grid-cols-[50px_2fr_1fr_50px] gap-4  justify-items-start hover:bg-light-black rounded-md ';
    trackElement.innerHTML = `<p class='relative justify-self-center text-secondary'> 
                                <span class='track-no'>${index + 1}</span>
                            </p>
                            <section class="grid grid-cols-[auto_1fr] gap-2 place-items-center">
                                    <img src="${images[0].url}" alt="" class="h-10 w-10">
                                    <article class="flex flex-col gap-2 justify-center">
                                        <h2 class='song-name'class="line-clamp-1">${name}</h2>
                                        <p class="text-xs text-secondary line-clamp-1">${artistNames}</p>
                                    </article>
                            </section>
                            <p class='line-clamp-1 text-secondary text-sm'>${album.name}</p>
                            <p class='text-secondary text-sm'> ${duration}</p>`;

        return trackElement;
}