const express = require('express')

const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const { log } = require('console')
const { randomBytes, secureHeapUsed } = require('crypto')
const { dirname } = require('path')

const USERS = {
    'alice': 'password',
    'bob': 'hunter2'
}
const BALANCES = { 'alice': 500, 'bob': 100 }
const SESSIONS = {}

const app = express()
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended:false }))
app.use((req, res, next) => {
    res.set('X-XSS-Protection', '0')
    next()
})
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    const username = SESSIONS[req.cookies.sessionId]
    const source = req.query.username

    if (username) {
        // res.render('transfer.pug', {"balances": BALANCES[username], 'username': username});
        res.send(`
            <style>
                h1{
                    text-align: center;
                    font-weight: 100px;
                }
                
                input, select {
                    width: 100%;
                    padding: 12px 20px;
                    margin: 8px 0;
                    display: inline-block;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    box-sizing: border-box;
                }
                
                input[type=submit] {
                    width: 100%;
                    background-color: blue;
                    color: white;
                }
            </style>
            <h1>            
                ${source ? `Hi ${source} welcome!<br>` : ''}
                Your balance is $${BALANCES[username]}.
            </h1>
            <form method='POST' action='/transfer'>
                Send amount: <input name='amount' />
                To user: <input name='to' />
                <input type='submit' value='send' />
            </form>
        `)
    } else {
        res.send(`
            <style>
                h1{
                    text-align: center;
                    font-weight: 100px;
                }
                
                input, select {
                    width: 100%;
                    padding: 12px 20px;
                    margin: 8px 0;
                    display: inline-block;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    box-sizing: border-box;
                }
                
                input[type=submit] {
                    width: 100%;
                    background-color: blue;
                    color: white;
                }
            </style>
            <h1>                
                Login to your bank account:
            </h1>
            <form method='post' action='/login'>
                Username: <input name='username' />
                Password: <input name='password' type='password' />
                <input type='submit' value='Login' />
            </form>
        `)
    };
    }

)

app.post('/login', (req, res) => {
    const { username, password } = req.body
    const acturalPassword = USERS[username]

    if (password === acturalPassword) {
        const sessionId = randomBytes(16).toString('hex')
        SESSIONS[sessionId] = username
        res.cookie('sessionId', sessionId)
        res.redirect('/')
    } else {
        res.send('fail!')
    }

app.get('/logout', (req, res) => {
    const sessionId = req.cookies.sessionId
    delete SESSIONS[sessionId]
    res.clearCookie('sessionId')
    res.redirect('/')
})

app.post('/transfer', (req, res) => {
    const sessionId = req.cookies.sessionId
    const username = SESSIONS[sessionId]

    if (!username) {
        res.send('fail!')
        return
    }

    const amount = Number(req.body.amount)
    const to = req.body.to

    BALANCES[username] -= amount
    BALANCES[to] += amount

    res.redirect('/logout')
})

})

app.listen(4000)