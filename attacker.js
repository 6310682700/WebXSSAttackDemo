const express = require('express')

const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const app = express()

app.use(bodyParser.urlencoded({ extended:false }))
app.use((req, res, next) => {
    res.set('X-XSS-Protection', '0')
    next()
})

app.get('/', (req, res) => {
    const source = req.query.source
    console.log(source);
    // print('SessionId = ' + source)
    res.redirect('http://localhost:4000/')
    
})

app.listen(45361)