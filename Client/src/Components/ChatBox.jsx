import React from "react"


function ChatBox(props)
{
    return(
        <div className="chat">
            <p>{props.text}</p>
        </div>
    )
}

export default ChatBox;