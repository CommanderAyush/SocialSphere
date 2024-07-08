import React from "react";
import Register from "./Register";
import Homepage from "./HomePage";
import axios from "axios";

axios.defaults.baseURL="https://social-sphere-gamma.vercel.app/";
axios.defaults.withCredentials=true;
export const context=React.createContext([]);
function App()
{
    const [username,setUsername]=React.useState("");
    const [password,setPassword]=React.useState("");
    const [reg,setreg]=React.useState(false);
    return(
        <context.Provider value={[username,setUsername,password,setPassword,reg,setreg]}>
            {reg?<Homepage/>:<Register />}
        </context.Provider>
    )
}
export default App;
