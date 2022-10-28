import { createContext, useState } from "react";

const UserContext = createContext();

export function ContexProvider({children}){
    const [CPosiitonUpdated,setCPosiitonUpdated] = useState(true);
    const [maketPrice,setMarketPrice] = useState("")
    const [kusdTokenBalance,setkusdTokenBalance] = useState(0)
    const [Theme,setTheme] = useState("Dark")
    
    
    return(
        <UserContext.Provider value={{setCPosiitonUpdated,CPosiitonUpdated,setMarketPrice,maketPrice,setkusdTokenBalance,kusdTokenBalance,setTheme,Theme}} >
            {children}
        </UserContext.Provider>
    )

}
export default UserContext;