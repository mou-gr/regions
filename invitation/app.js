const express = require('express')
const bodyParser = require('body-parser')
const model = require('./model')
const nocache = require('nocache')
// const R = require('ramda')

const app = express()
const resquel = require('resquel')
const config = require('./config')

const compare = require('./compare')

console.log('DB: ' + config.operation)

app.post('/api/invitation/:id/clone', function (req, res, next) {
    if (config.operation == 'production') {
        res.status(403).send('Cloning forbidden in production!')
    } else {
        next()
    }
})
app.get('/css/style.css', function (req, res, next) {
    if (config.operation == 'production') {
        res.sendFile('public/css/style-production.css', { root: __dirname })
    } else {
        next()
    }
})

app.use(bodyParser.json({ limit: '2mb' })) // to support JSON-encoded bodies
app.use(nocache())
app.use(resquel(model.resquel))

const initPromise = model.getConnection(config.config)
    .catch(err => console.error(err.stack))
    .then(pool => {
        app.locals.pool = pool
    })

const secondDbPromise = model.getConnection(config.productionConfig)
    .catch(err => console.error(err.stack))
    .then(pool => {
        app.locals.productionPool = pool
    })

app.put('/api/invitation/:id', function (req, res) {
    model.updateInvitation(req.params.id, JSON.stringify(req.body), app.locals.pool)
        .catch(err => {
            res.sendStatus(500)
            console.error(err.stack)
        })
        .then(() => {
            res.sendStatus(204)
        })
})

app.post('/api/userRoleType', function (req, res) {
    model.addInvitationUsers(req.body.id, req.body.userList, req.body.role, app.locals.pool)
        .catch(err => {
            res.sendStatus(500)
            console.error(err.stack)
        })
        .then(() => {
            res.sendStatus(204)
        })
})
app.delete('/api/userRoleType', function (req, res) {
    model.deleteInvitationUser(req.body.id, app.locals.pool)
        .catch(err => {
            res.sendStatus(500)
            console.error(err.stack)
        })
        .then(() => {
            res.sendStatus(204)
        })
})
app.get('/api/compare/:id', function (req, res) {
    compare.compare(app.locals.pool, app.locals.productionPool, req.params.id, req.params.id)
        .then(diff => {
            return res.send(diff)
        })
})
app.get('/api/compare', function (req, res) {
    compare.compareAll(app.locals.pool, app.locals.productionPool)
        .then(diff => {
            return res.send(diff)
        })
    // model.getJsonData(app.locals.pool, 2)
    //     .then(result => res.send(result))
})

app.use(express.static('public'))

Promise.all([initPromise, secondDbPromise]).then(() => {
    app.listen(config.serverPort, config.acceptIp, function () {
        console.log('app listening on port: ' + config.serverPort)
    })
})
