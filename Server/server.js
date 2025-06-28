import express from "express"
import pg from "pg"
import dotenv from "dotenv"
import jwt from "jsonwebtoken"
import cors from "cors"
import bcrypt from "bcryptjs"
import cookieParser from "cookie-parser"
import ws,{ WebSocketServer } from "ws"
import path from "path";

//Setting up everything
const __dirname=path.resolve();
const port=3000;
dotenv.config();
const secret=process.env.Secret;
const app=express();
const bcryptSalt=bcrypt.genSaltSync(10);
app.use(express.json());
app.use(cookieParser());
// app.use(express.static(path.join(__dirname,"..","Client","dist")));
const db= new pg.Client({

    user:process.env.db_user,
    host:process.env.db_host,
    password:process.env.postgres_pass,
    database:process.env.db_name,
    port:5432,
    ssl:true
})
db.connect();

//This is done to ensure that Cors doenst produce any error
app.use(cors({
    credentials:true,
    origin:process.env.Client_URL
}));
//Checking for cookie everytime we visit out app
app.get("/profile",(req,res)=>{
    const token=req.cookies?.token;
    if(token){
        jwt.verify(token,secret,{},(err,userData)=>{
            if(err) throw err;
            res.json(userData);  
            // console.log(userData);
        })
    }
    else{
        res.status(401).json("No Cookie");
    }
        
   
})
//basic login
app.post("/login",async (req,res)=>{
    const data=req.body;
    
    const pass=await db.query("Select password from users where username=($1)",
        [data.username]
    )
    
    if(pass.rows.length){
       
        const comp=bcrypt.compare(data.password,pass.rows[0].password);
        if(comp){
            const val=await db.query("SELECT id FROM users WHERE username=$1",
                [data.username]
            );
            
            jwt.sign({userId:data.username,uni:val.rows[0].id},secret,{},(err,token)=>{
                if(err)throw err;
                res.cookie('token',token,{sameSite:'none',secure:true}).status(201).json({id:data.username});
            });
        }
        else
        {
            res.status(401).json("wrong pass");
        }
    }
    else
    {
        res.status(401).json("user not found");
    }

});



//basic register,cookies are also recieved
app.post("/register",async (req,res)=>{
    
    const data=req.body;
    const hashedPass=bcrypt.hashSync(data.password,bcryptSalt);
    const check=await db.query("SELECT * FROM users WHERE username=$1",[data.username]);
    if(!check.rows.length)
    {
        
        await db.query("INSERT INTO users(username,password) values($1,$2)",
        [data.username,hashedPass]
        );
        const val=await db.query("SELECT id FROM users WHERE username=$1",
            [data.username]
        );
        // console.log(val.rows[0].id);
        jwt.sign({userId:data.username,uni:val.rows[0].id},secret,{},(err,token)=>{
            if(err)throw err;
            res.cookie('token',token,{sameSite:'none',secure:true}).status(201).json({id:data.username});
        });
    }
    
})


//loging out
app.post('/logout',(req,res)=>{
    res.cookie('token','',{sameSite:'none',secure:true}).json('ok');
})

app.get('/data/:userId',async (req,res)=>{
    const otherUser=req.params.userId;
    var user;
    const cookies=req.headers.cookie;
    if(cookies){
        const MyCookie=cookies.split(";").find((val)=>val.startsWith("token"));
        if(MyCookie){
            const token=MyCookie.split("=")[1];
            if(token){
                jwt.verify(token,secret,{},(err,data)=>{
                    if(err)throw err;
                    user=data.userId;
                })
            }
        }
    }
    if(user&& otherUser){
        const response=await db.query("SELECT * FROM messages WHERE (sender=$1 and recipient=$2) or (recipient=$1 and sender=$2) order by id asc",
            [user,otherUser]
        )
        const data=response.rows
        res.json({data,user});
    }
})


app.get('/people',async(req,res)=>{
    const cookies=req.headers.cookie;
    var user;
    if(cookies){
        const MyCookie=cookies.split(";").find((val)=>val.startsWith("token"));
        if(MyCookie){
            const token=MyCookie.split("=")[1];
            if(token){
                jwt.verify(token,secret,{},(err,data)=>{
                    if(err)throw err;
                    user=data.userId;
                })
            }
        }
    }
    const response=await db.query("Select * from users where username!=$1",[user]);
    const data=response.rows
        res.json({data,user});
})
{

}

// app.get("/",(req,res)=>{
//     res.sendFile(path.join(__dirname,"..","Client","dist","index.html"));
// })

const server=app.listen(port,(req,res)=>{
    console.log(port);
})
//setting up the web socket server
const wss=new WebSocketServer({server});



wss.on('connection',(socket,req)=>{
    const cookies=req.headers.cookie;
    if(cookies){
        const MyCookie=cookies.split(";").find((val)=>val.startsWith("token"));
        if(MyCookie){
            const token=MyCookie.split("=")[1];
            if(token){
                jwt.verify(token,secret,{},(err,data)=>{
                    if(err)throw err;
                    socket.username=data.userId;
                    socket.uni=data.uni;
                })
            }
        }
    }
    function notifyEveryone()
    {
        [...wss.clients].forEach(people=>{
            people.send(JSON.stringify({
                online:[...wss.clients].map(val=>{
                    if(people.username!=val.username){
                        return({username:val.username,id:val.uni})
                    }
                   })
            }));
        })
    }

    //killing dead signals
    socket.isAlive=true;
    setInterval(()=>{
        socket.ping();
        socket.deathTimer=setTimeout(()=>
        {
            socket.isAlive=false;
            socket.terminate();
            notifyEveryone();
        })
    },30000)

    socket.on('pong',()=>{
        clearTimeout(socket.deathTimer);
    })

    //if a message comes
    socket.on('message',async data=>{
        const newMessage=JSON.parse(data).message.text;
        const recipient=JSON.parse(data).message.recipient;
        if(newMessage!=''){

            await db.query("INSERT INTO messages(sender,recipient,chat) values($1,$2,$3)",
                [socket.username,recipient,newMessage]
            );
            const response=await db.query("select max(id) from messages");
            [...wss.clients]
            .filter(val=>val.username==recipient)
            .forEach(val=>val.send(JSON.stringify(
                {   text:newMessage,
                    recipient,
                    sender:socket.username,
                    id:response.rows[0].max
                })))
        }
            
    });


    //Notifying everyone about who is online
   notifyEveryone()
})