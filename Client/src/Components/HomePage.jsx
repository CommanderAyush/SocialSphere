import React, { useEffect, useRef } from "react";
import {uniqBy} from "lodash"
import axios from "axios";
import { context } from "./App";
var Me=1;
function HomePage()
{
    const [username,setUsername,password,setPassword,reg,setReg]=React.useContext(context);
    const [ws,setWs]=React.useState(null);
    const [online,setOnline]=React.useState({});
    const [offline,setOffline]=React.useState({});
    const [selectedUserId,setselectedUserId]=React.useState(null);
    const [newMessage,setNewMessage]=React.useState("");
    const [message,setMessage]=React.useState([]);
    const colors=[{backgroundColor:"#E8C5E5"},{backgroundColor:"#5ce1e6"},{backgroundColor:"#7ed957"},
        {backgroundColor:"#ff5757"},{backgroundColor:"#FFE88A"},{backgroundColor:"#ff914d"}];
    const messagebox=useRef();
    React.useEffect(()=>{
        connectingToWS();
    },[])
    function connectingToWS()
    {
        const temp=new WebSocket('https://social-sphere-uzoa.onrender.com');
        setWs(temp);
        temp.onmessage=({data})=>{
            const myData=JSON.parse(data);
            
            if('online'in myData)
            {
                const present={};
                myData.online.forEach(element => {
                    if(element!=null)
                    {
                    present[element.id]=element.username
                    }
                })
                setOnline(present);
                // console.log(present);
            }
            else if('text' in myData)
            {
                // console.log({...myData});
                setMessage(prev=>([...prev,{...myData}]))
            }
        }
        temp.onclose=()=>{
            setTimeout(()=>{
                console.log("Dissconnected...Please wait")
                connectingToWS()
            },1000);
            }
    }

    async function logout()
    {
        axios.post('/logout').then(()=>{
            setReg(false);
        });
    }

    function sendMessage(ev)
    {
        ev.preventDefault();;
        ws.send(JSON.stringify({
            message:{
                recipient:selectedUserId,
                text:newMessage
            }
        }))
        setNewMessage('');
        setMessage(prev=>[...prev,{text:newMessage,sender:-1,recipient:selectedUserId,id:Date.now()}])
        
    }
    useEffect(()=>{
        const div=messagebox.current;
        if(div){
        div.scrollIntoView({behavior:'smooth'})
        }
    },[message])

    useEffect(()=>{
        if(selectedUserId){
            axios.get('/data/'+selectedUserId).then(response=>{
                const user=response.data.user;
                Me=response.data.user;
                var temp=[];
                response.data.data.forEach(val=>{
                    var ind=val.sender==user?-1:val.sender;
                    temp.push({text:val.chat,sender:ind,recipient:val.recipient,id:val.id});
                })
                setMessage(temp);
            });

        }
    },[selectedUserId])

    useEffect(()=>
    {
        axios.get('/people').then(response=>{
           const offlinePeople=response.data.data.filter(p=>!Object.keys(online).find(el=>el==p.id))
           Me=response.data.user;
           
           var temp={};
           offlinePeople.forEach(val=>{
            temp[val.id]=val.username;
           })
           setOffline(temp);
        })
    },[online])

    const messagesWithoutDupes = uniqBy(message,'id');
    return(
        <div className="homepage">
            <div className="contacts">
                <div className="AppName">
                    <div className="SocialSphere"><p>SocialSphere</p></div>
                    <div className="icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                        <path d="M21.721 12.752a9.711 9.711 0 0 0-.945-5.003 12.754 12.754 0 0 1-4.339 2.708 18.991 18.991 0 0 1-.214 4.772 17.165 17.165 0 0 0 5.498-2.477ZM14.634 15.55a17.324 17.324 0 0 0 .332-4.647c-.952.227-1.945.347-2.966.347-1.021 0-2.014-.12-2.966-.347a17.515 17.515 0 0 0 .332 4.647 17.385 17.385 0 0 0 5.268 0ZM9.772 17.119a18.963 18.963 0 0 0 4.456 0A17.182 17.182 0 0 1 12 21.724a17.18 17.18 0 0 1-2.228-4.605ZM7.777 15.23a18.87 18.87 0 0 1-.214-4.774 12.753 12.753 0 0 1-4.34-2.708 9.711 9.711 0 0 0-.944 5.004 17.165 17.165 0 0 0 5.498 2.477ZM21.356 14.752a9.765 9.765 0 0 1-7.478 6.817 18.64 18.64 0 0 0 1.988-4.718 18.627 18.627 0 0 0 5.49-2.098ZM2.644 14.752c1.682.971 3.53 1.688 5.49 2.099a18.64 18.64 0 0 0 1.988 4.718 9.765 9.765 0 0 1-7.478-6.816ZM13.878 2.43a9.755 9.755 0 0 1 6.116 3.986 11.267 11.267 0 0 1-3.746 2.504 18.63 18.63 0 0 0-2.37-6.49ZM12 2.276a17.152 17.152 0 0 1 2.805 7.121c-.897.23-1.837.353-2.805.353-.968 0-1.908-.122-2.805-.353A17.151 17.151 0 0 1 12 2.276ZM10.122 2.43a18.629 18.629 0 0 0-2.37 6.49 11.266 11.266 0 0 1-3.746-2.504 9.754 9.754 0 0 1 6.116-3.985Z" />
                        </svg>
                    </div>
                    
                </div>
                {Object.entries(online).map(val=>
                {
                    return(
                        <div key={val[0]} className="ChatBox" onClick={()=>setselectedUserId(val[1])} style={val[1]===selectedUserId?{backgroundColor:"#aad6ff", boxShadow:"0 0 10px 0 rgb(204, 204, 204)"}:{backgroundColor:""}}>
                            {/* {val[1]===selectedUserId&&
                            <div className="Bar">|</div>
                            } */}
                            <div className="Avatar" style={colors[val[1].charCodeAt(0)%6]}>
                                <p>{val[1][0]}</p>
                                <div className="online"></div>
                            </div>
                            <div className="ChatComponent">{val[1]}</div>
                        </div>
                    )    
                })}
                {Object.entries(offline).map(val=>
                {
                    return(
                        <div key={val[0]} className="ChatBox" onClick={()=>setselectedUserId(val[1])} style={val[1]===selectedUserId?{backgroundColor:"#aad6ff", boxShadow:"0 0 20px 0 rgb(204, 204, 204)"}:{backgroundColor:""}}>
                            {/* {val[1]===selectedUserId&&
                            <div className="Bar">|</div>
                            } */}
                            <div className="Avatar" style={colors[val[1].charCodeAt(0)%6]}>
                                <p>{val[1][0]}</p>
                                <div className="online" style={{backgroundColor:"#8F9AA1"}}></div>
                            </div>
                            <div className="ChatComponent">{val[1]}</div>
                        </div>
                    )    
                })}
                <div className="logout">
                    <p>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                    </svg>
                        {Me}<button onClick={logout}>logout</button></p>
                    
                </div>
            </div>
            <div className="Message">
                <div  className="ChatSection"> 
                    {null===selectedUserId?
                    <div className="texts">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle fill="#1877F2" stroke="#1877F2" strokeWidth="15" r="15" cx="40" cy="65"><animate attributeName="cy" calcMode="spline" dur="2" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.4"></animate></circle><circle fill="#1877F2" stroke="#1877F2" strokeWidth="15" r="15" cx="100" cy="65"><animate attributeName="cy" calcMode="spline" dur="2" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.2"></animate></circle><circle fill="#1877F2" stroke="#1877F2" strokeWidth="15" r="15" cx="160" cy="65"><animate attributeName="cy" calcMode="spline" dur="2" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="0"></animate></circle></svg>
                        <p>  Click on your friend's name to start a conversation</p>
                    </div>:
                    <div >
                        <div className="Profile">
                            <div className="Avatar" style={colors[selectedUserId.charCodeAt(0)%6]}>
                                <p>{selectedUserId[0]}</p>
                                
                            </div>
                            <p>{selectedUserId}</p>
                        </div>
                        {messagesWithoutDupes.map(val=>{
                                return(
                                    <div key={val.id} className="chat" style={val.sender==-1?{backgroundColor:"#2077F0",alignSelf:"flex-end",textAlign:"end"}:{backgroundColor:"skyblue",alignSelf:"flex-start"}}>
                                        <div>{val.text}</div>
                                    </div>                                
                                )
                            })}
                    <div ref={messagebox}></div>
                    </div>
                    }
                </div>
                {!!selectedUserId&&(
                <form className="Send" onSubmit={sendMessage}>
                        <input 
                        onChange={(evt)=>setNewMessage(evt.target.value)}
                        value={newMessage}
                        type="text"
                        autoFocus
                        placeholder="Type Your Message Here"
                        />
                        <button onClick={sendMessage}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                        <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                        </svg>
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
export default HomePage;
