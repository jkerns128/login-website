/*=======INFORMATION=========*/
//HTML problems: https://stackoverflow.com/questions/22195065/how-to-send-a-json-object-using-html-form-data 
/*=======VARIABLES AND SETUP=========*/
const CLIENT_ID = "197094391199-v24un4v7n44ajr0nrn9eoocdal4nt3ie.apps.googleusercontent.com"
var cookieParser = require('cookie-parser')
const e = require('express')
const express = require('express')
const app = express()
const port = 8080
const token = 42395
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

const accounts = (new Map()).set('user','pass')

app.use(express.json())
app.use(cookieParser())

/*=======EVENTS=========*/

app.get("/",(req,res) => {
    res.sendFile("/root/login-API/landing.html")
})

app.get("/login",(req,res) => {
    res.sendFile('/root/login-API/login.html')
})

app.get("/user", (req, res) => {
    if(req.cookies.id_token != token){
        res.redirect('/login')
        return;
    }
    res.sendFile('/root/login-API/user.html')
    
})

app.get("/accountCreation", (req, res) => {
    res.sendFile('/root/login-API/creation.html')
})

app.post("/accountCreation", (req, res) => {
    const input = req.body
    //object contains username and password as strings
    if(input.username == '' || 
       input.password == '') { 
        //Checks if credentials are empty (no username or password) 
        //and redirects to account creation
        throw new Error("Fields need to be populated!")
    }
    infoFilter(input.username, input.password)
    if(accounts.has(input.username)){
        throw new Error("Username taken")
    }

    accounts.set(input.username, input.password)
    res.send("Account successfully created!")
})

app.post('/login', (req, res) => {
    const credentials = req.body
    if(credentials.username == '' && 
        credentials.password == '') { 
        //Checks if credentials are empty (no username or password) 
        //and redirects to account creation
        res.redirect('/accountCreation')
        return
    }

    if(login(credentials)){
        res.cookie('id_token', token)
        res.redirect('/user')
        return
    } else {
        res.send('Incorrect Username/Password')
    }
})

app.post('/oauth2callback', (req,res) => {
    const g_token = req.body

    /*async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: g_token,
            audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
        // If request specified a G Suite domain:
        // const domain = payload['hd'];
    }
    verify().catch(console.error);
    */
    res.cookie('id_token', token)
    res.redirect('/user')
    return
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})

/*=======FUNCTIONS=========*/

function login(userinfo){
    
    infoFilter(userinfo.username, userinfo.password)

    return accounts.has(userinfo.username) && accounts.get(userinfo.username) == userinfo.password
    //Here I would send the credentials to the server for verification
    
}

function infoFilter(username,password){
    const bannedchars = [';','-','=']
    for(let i = 0; i < bannedchars.length; i++){ //Check for invalid characters
        if(username.includes(bannedchars[i]) ||
           password.includes(bannedchars[i])){
            throw new Error('Unnacceptable characters in username or password')
        }
    }
    if(username.length > 20 || password.length > 20){
        throw new Error('Your username or password is too long!')
    }
}