import { Children, createContext,useState,useEffect,useContext } from "react";

const authContext = createContext();

export function AuthProvider({children}){
    const [user,setUser]= useState(null);
    useEffect(()=>{
        const savedProfile = localStorage.getItem("userProfile");
        const savedToken = localStorage.getItem("userToken");
        if(savedProfile && savedToken){
            setUser(JSON.parse(savedProfile));
        }
    },[])
    return(
        <authContext.Provider value={{user,setUser}}>
            {children}
        </authContext.Provider>
    )
}
export function useAuth() {
  return useContext(authContext);
}