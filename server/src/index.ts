import { app } from "./app"

app.listen(5000, ()=>{
    console.log("hello")
})

app.get("/", (req,res)=>{
    res.send("Hello")
})