const express = require('express')
const { createReadStream } = require('fs')

const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const { log } = require('console')
const { randomBytes, secureHeapUsed } = require('crypto')

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

app.get('/', (req, res) => {
    const username = SESSIONS[req.cookies.sessionId]
    const source = req.query.source

    if (username) {
        res.send(`
            <h1>
                Hi <span id='username'></span>.
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
            <h1>
                ${source ? `Hi ${source} reader!<br>` : ''}
                Login to your bank account:
            </h1>
            <form method='post' action='/login'>
                Username: <input name='username' />
                Password: <input name='password' type='password' />
                <input type='submit' value='Login' />
            </form>
        `)
    }

})

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