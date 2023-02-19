const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;
import { ACCESS_TOKEN_KEY, EXPIRE_IN_KEY, TOKEN_TYPE_KEY , logoutUser} from './common.js'


//THIS FILE IS USED TO PERFORM THE REQUEST TO GET DATAA
// IT IS COMMON AS BECAUSE YOU WILL ALLWAYS NEED THE TOKENS
// FOR EVERY REQUEST TO ACCESS ANY DATA 
// AND ONLY ENDPOINT CHANGE, 
// YOU WILL GET DATA AS NEED PER YOU NEED AND ONLY YOU
//  NEED TO PROVIDE IS ENDPOINT FROM WHICH YOU NEED DATA;



const getAccessToken =()=>{
    const expireIn = window.localStorage.getItem(EXPIRE_IN_KEY);

    if(Date.now() < expireIn ){
        const accessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);
        const tokenType =window.localStorage.getItem(TOKEN_TYPE_KEY);
        // console.log(accessToken );
        return {accessToken , tokenType};
    }
    else{ //logout user
        logoutUser();
    }
}

const getAPIConfig = ({accessToken , tokenType} , method='GET') =>{
    // console.log('getconfig '+accessToken);
    return {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `${tokenType} ${accessToken}`,
        }    
    }
}

export const fetchRequest= async (endpoint)=>{
    console.log(endpoint)
    const url = `${BASE_API_URL}/${endpoint}`;
    const response = await fetch(url,getAPIConfig(getAccessToken()));
    return response.json();
}
export const getItemFromLocalStorage = (key)=>  JSON.parse(localStorage.getItem(key));
export const setItemInLocalStorage = (key,value)=>  localStorage.setItem(key,JSON.stringify(value));






