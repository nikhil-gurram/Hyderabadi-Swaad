require("dotenv").config()
const express = require("express")
const app = express()
app.set('trust proxy', 1); // trust first proxy
const ejs = require('ejs')
const path = require('path')
const mongoose = require('mongoose')
const expressLayout = require('express-ejs-layouts')
const session = require('express-session')
const flash = require('express-flash')
const passport = require('./Auth/passport.js')
const Emitter = require('events')
const MongoDbStore = require('connect-mongo')
const router = require('./routes/web.js')





const PORT = process.env.PORT || 3000

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

 const connectDB = async () => {
    
    try{
         const con =  await mongoose.connect(process.env.MONGO_URL_SESSIONS, clientOptions)
         await mongoose.connection.db.admin().command({ ping: 1 });
         console.log("Pinged your deployment. You successfully connected to MongoDB!");
        
         
    }
    catch(e){
        console.log("error connecting to mongodb:" + e.message);
    }
}

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
});

const eventEmitter = new Emitter();
app.set('eventEmitter', eventEmitter)


app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoDbStore({
        mongoUrl: process.env.MONGO_URL_SESSIONS
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }

}))


app.use(passport.initialize())
app.use(passport.session())


app.use(flash())

app.use((req, res, next) => {
    res.locals.session = req.session
    res.locals.user = req.user
   
    
    next()
})

app.use(expressLayout)
app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'ejs')

app.use('/', router)
const server = app.listen(PORT, () => {
    connectDB()
    console.log("server started at:", PORT);
})

const io = require('socket.io')(server)

io.on('connection', (socket) => {
   
    socket.on('join', (orderId) => {
        socket.join(orderId)
    })
})

eventEmitter.on('orderUpdated', (data) => {
    io.to(`order_${data.id}`).emit('orderUpdated', data)
})

eventEmitter.on('orderPlaced', (data) => {
    io.to('adminRoom').to('deliveryRoom').emit('orderPlaced', data)
})