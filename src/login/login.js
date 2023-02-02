import { ACCESS_TOKEN_KEY , EXPIRE_IN_KEY, TOKEN_TYPE_KEY} from "../common";
 
const CLIENT_ID=import.meta.env.VITE_CLIENT_ID;

const scopes ="user-top-read user-follow-read playlist-read-private user-library-read";

const REDIRECT_URI=import.meta.env.VITE_REDIRECT_URI;

const LANDED_URL=import.meta.env.VITE_LANDED_URL;


const authorieUser = ()=>{

    const url=`https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${REDIRECT_URI}&scope=${scopes}&show_dialog=true`;
    
    window.open(url,'login','width=800,height=600');
}


document.addEventListener('DOMContentLoaded',()=>{
    
    const loginButton=document.getElementById('login-to-spotify');

    loginButton.addEventListener('click',authorieUser);

});

const storeTokens =(accessToken,tokenType , expireIn)=>{
    window.localStorage.setItem(ACCESS_TOKEN_KEY,accessToken);
    window.localStorage.setItem(EXPIRE_IN_KEY,expireIn);
    window.localStorage.setItem(TOKEN_TYPE_KEY,tokenType);
    console.log('token stored');
}

window.addEventListener('load',()=>{

    const acesstoken=window.localStorage.getItem(`${ACCESS_TOKEN_KEY}`);

    if(acesstoken!=null){
        window.location.href=`${LANDED_URL}`;
    }

    if(window.opener!=null && window.opener.closed==false){
        // console.log('cracked');
        // console.log(window.location.href);
        
        const params=new URLSearchParams(window.location.hash);
        // console.log(params);
        
        const accessToken=params.get('#access_token');
        const tokenType=params.get('token_type');
        const expireIn=params.get('expires_in');

        storeTokens(accessToken,tokenType , expireIn);
        
        var a=4;
        window.opener.location.href=LANDED_URL;
        window.close();
    }

});