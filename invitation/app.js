const express = require('express')
const bodyParser = require('body-parser')
const model = require('./model')
const nocache = require('nocache')
// const R = require('ramda')

const app = express()
const resquel = require('resquel')
const config = require('./config')


app.use(bodyParser.json({limit: '2mb'})) // to support JSON-encoded bodies
app.use(nocache())
app.use(resquel(model.resquel))

app.locals.initPromise = model.getConnection()
    .catch(err => console.error(err.stack))
    .then(pool => {
        app.locals.pool = pool
    })

// app.put('/api/invitation/:id', function(req, res) {
//     model.updateInvitation(req.params.id, JSON.stringify(req.body), app.locals.pool)
//         .catch(err => {
//             res.sendStatus(500)
//             console.error(err.stack)
//         })
//         .then(() => {
//             res.sendStatus(204)
//         })
// })

app.post('/api/userRoleType', function(req, res) {
    model.addInvitationUsers(req.body.id, req.body.userList, req.body.role, app.locals.pool)
        .catch(err => {
            res.sendStatus(500)
            console.error(err.stack)
        })
        .then(() => {
            res.sendStatus(204)
        })
})
app.delete('/api/userRoleType', function(req, res) {
    model.deleteInvitationUser(req.body.id, app.locals.pool)
        .catch(err => {
            res.sendStatus(500)
            console.error(err.stack)
        })
        .then(() => {
            res.sendStatus(204)
        })
})

app.use(express.static('public'))
// app.listen(config.serverPort, function () {
//     console.log('app listening on port: ' + config.serverPort)
// })

app.locals.initPromise.then(() => {
    app.listen(config.serverPort, config.acceptIp, function() {
        console.log('app listening on port: ' + config.serverPort)
    })
})
