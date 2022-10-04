import { createContext, useState } from "react";

const UserContext = createContext();

export function ContexProvider({children}){
    const [CPosiitonUpdated,setCPosiitonUpdated] = useState(true);

    
    
    return(
        <UserContext.Provider value={{setCPosiitonUpdated,CPosiitonUpdated}} >
            {children}
        </UserContext.Provider>
    )

}
export default UserContext;