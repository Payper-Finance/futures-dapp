import { createContext, useState } from "react";

const UserContext = createContext();

export function ContexProvider({children}){
    const [CPosiitonUpdated,setCPosiitonUpdated] = useState(true);
    const [maketPrice,setMarketPrice] = useState("")
    
    
    return(
        <UserContext.Provider value={{setCPosiitonUpdated,CPosiitonUpdated,setMarketPrice,maketPrice}} >
            {children}
        </UserContext.Provider>
    )

}
export default UserContext;