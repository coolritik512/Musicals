export const ACCESS_TOKEN_KEY='accessToken'
export const EXPIRE_IN_KEY='expireIn';
export const TOKEN_TYPE_KEY='tokenType'
export const TRACK_LOADED_KEY = 'trackList'

const APP_URL = import.meta.env.VITE_APP_URL;

export const ENDPOINT= {
    userInfo :"me",
    featuredPlaylists : 'browse/featured-playlists?limit=5',
    topLists : "browse/categories/toplists/playlists?limit=10",
    playlist : 'playlists',
    userPlaylist : 'me/playlists',
    search:'search'

}

export const logoutUser = () =>{
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(EXPIRE_IN_KEY);
    localStorage.removeItem(TOKEN_TYPE_KEY);

    window.location.href = APP_URL;

}

export const SECTION_TYPE ={
    DASHBOARD :'DASHBOARD',
    PLAYLIST :'PLAYLIST',
    SEARCH : 'SEARCH',
}

export const getDurationFormat = (duration) => {

    const min = Math.floor(duration / 60000);

    const sec = ((duration % 60000) / 1000).toFixed(0);
    const formattedTime = sec == 60 ? min + 1 + ":00" : min + ":" + (sec < 10 ? '0' : "") + sec;
    return formattedTime
}