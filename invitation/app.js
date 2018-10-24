const express = require('express')
const bodyParser = require('body-parser')
const model = require('./model')
const nocache = require('nocache')
// const R = require('ramda')

const path = './jsonBackup'
const app = express()
const resquel = require('resquel')
const config = require('./config')

app.use(bodyParser.json({ limit: '2mb' })) // to support JSON-encoded bodies
app.use(nocache())
app.use(resquel(model.resquel))

app.locals.initPromise = model.getConnection()
    .catch(err => console.error(err.stack))
    .then(pool => {
        app.locals.pool = pool
    })

const actions = {
    write: {
        local: req => model.updateInvitationLocal(`${path}/${req.params.id}.json`, JSON.stringify(req.body)),
        staging: req =>
            model.updateInvitationLocal(`${path}/${req.params.id}.json`, JSON.stringify(req.body.value, null, 2))
                .then(() => model.gitCommit(req.params.id, req.body.username, req.body.password, req.body.email))
                .then(() => model.updateInvitationDb(req.params.id, JSON.stringify(req.body.value), app.locals.pool))
        ,
        production: ''
    },
    read: {
        local: req => model.getInvitationLocal(`${path}/${req.params.id}.json`),
        staging: req => model.getInvitationDb(req.params.id, app.locals.pool),
        production: ''
    }
}

app.put('/api/invitation/:id', function (req, res) {
    actions.write[req.query.location](req)
        .then( () => res.sendStatus(204) )
        .catch(err => {
            res.status(500).send({error: err.message})
            console.error(err.stack)
        })

})
app.get('/api/invitation/:id', function (req, res) {
    actions.read[req.query.location](req)
        .then( (data) => res.send(data) )
        .catch(err => {
            res.status(500).send({error: err.message})
            console.error(err.stack)
        })
})

app.post('/api/userRoleType', function (req, res) {
    model.addInvitationUsers(req.body.id, req.body.userList, req.body.role, app.locals.pool)
        .catch(err => {
            res.status(500).send({error: err.message})
            console.error(err.stack)
        })
        .then(() => {
            res.sendStatus(204)
        })
})
app.delete('/api/userRoleType', function (req, res) {
    model.deleteInvitationUser(req.body.id, app.locals.pool)
        .catch(err => {
            res.status(500).send({error: err.message})
            console.error(err.stack)
        })
        .then(() => {
            res.sendStatus(204)
        })
})

app.use(express.static('public'))

app.locals.initPromise.then(() => {
    app.listen(config.serverPort, config.acceptIp, function () {
        console.log('app listening on port: ' + config.serverPort)
    })
})
