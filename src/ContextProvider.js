import { createContext, useState } from "react";

const UserContext = createContext();

export function ContexProvider({children}){
    const [CPosiitonUpdated,setCPosiitonUpdated] = useState(true);
    const [maketPrice,setMarketPrice] = useState("")
    const [kusdTokenBalance,setkusdTokenBalance] = useState(0)
    const isBrowserDefaultDark =()=> window.matchMedia('(prefers-color-scheme: dark)').matches;
    const [Theme,setTheme] = useState(isBrowserDefaultDark() ? 'Dark' : 'Light');
    
    
    return(
        <UserContext.Provider value={{setCPosiitonUpdated,CPosiitonUpdated,setMarketPrice,maketPrice,setkusdTokenBalance,kusdTokenBalance,setTheme,Theme}} >
            {children}
        </UserContext.Provider>
    )

}
export default UserContext;