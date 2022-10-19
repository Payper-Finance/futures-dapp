import { createContext, useState } from "react";

const UserContext = createContext();

export function ContexProvider({children}){
    const [CPosiitonUpdated,setCPosiitonUpdated] = useState(true);
    const [maketPrice,setMarketPrice] = useState("")
    const [kusdTokenBalance,setkusdTokenBalance] = useState(0)

    
    
    return(
        <UserContext.Provider value={{setCPosiitonUpdated,CPosiitonUpdated,setMarketPrice,maketPrice,setkusdTokenBalance,kusdTokenBalance}} >
            {children}
        </UserContext.Provider>
    )

}
export default UserContext;