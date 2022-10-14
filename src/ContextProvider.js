import { createContext, useState } from "react";

const UserContext = createContext();

export function ContexProvider({children}){
    const [CPosiitonUpdated,setCPosiitonUpdated] = useState(true);
    const [marketPrice,setMarketPrice] = useState("")
    
    
    return(
        <UserContext.Provider value={{setCPosiitonUpdated,CPosiitonUpdated,setMarketPrice,marketPrice}} >
            {children}
        </UserContext.Provider>
    )

}
export default UserContext;