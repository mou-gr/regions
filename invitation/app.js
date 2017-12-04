const express = require('express')
const bodyParser = require('body-parser')
const model = require('./model')
const R = require('ramda')

const app = express()
const resquel = require('resquel')
const config = require('./config')
const exphbs = require('express-handlebars')

app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}))
app.set('view engine', 'handlebars')

app.use(bodyParser.json()) // to support JSON-encoded bodies
app.use(resquel(model.resquel))

const nocache = function nocache(req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate')
    res.header('Expires', '-1')
    res.header('Pragma', 'no-cache')
    next()
}

app.get('/', function(req, res) {
    model.getList(app.locals.pool)
        .catch(err => console.error(err.stack))
        .then(result => {
            res.render('list', {
                invitations: R.path(['recordset'], result)
            })
        })
})
app.get('/edit/:id', function(req, res) {
    model.getInvitation(req.params.id, app.locals.pool)
        .catch(err => console.error(err.stack))
        .then(result => {
            res.render('edit', R.path(['recordset'], result))
        })
})

app.get('/invitation/:id/users', function(req, res) {
    model.getInvitationUsers(req.params.id, app.locals.pool)
        .catch(err => console.error(err.stack))
        .then(result => {
            res.render('users', {
                users: R.path(['recordset'], result),
                invitationId: req.params.id
            })
        })
})
app.get('/invitation/:id/kad', function (req, res) {
    res.render('kad', { invitationId: req.params.id })
})
app.get('/invitation/:id', nocache, function(req, res) {
    model.getInvitation(req.params.id, app.locals.pool)
        .catch(err => console.error(err.stack))
        .then(result => {
            res.send(R.path(['recordset', 0, 'JsonData'], result))
        })
})

app.post('/invitation/:id', function(req, res) {
    model.updateInvitation(req.params.id, 1, 101, JSON.stringify(req.body), app.locals.pool)
        .catch(err => {
            res.sendStatus(500)
            console.error(err.stack)
        })
        .then(() => {
            res.sendStatus(204)
        })
})

app.post('/invitation', function(req, res) {
    model.newInvitation(1, 100, '{}', req.body.name, app.locals.pool)
        .catch(err => {
            res.sendStatus(500)
            console.error(err.stack)
        })
        .then(() => {
            res.sendStatus(204)
        })
})
app.post('/userRoleType', function(req, res) {
    const p = R.map(el => model.addInvitationUsers(req.body.invitationId, el, req.body.role, app.locals.pool))(req.body.users.split(','))
    Promise.all(p)
        .catch(err => {
            res.sendStatus(500)
            console.error(err.stack)
        })
        .then(() => {
            res.sendStatus(204)
        })
})
app.delete('/userRoleType', function(req, res) {
    model.deleteInvitationUser(req.body.id, app.locals.pool)
        .catch(err => {
            res.sendStatus(500)
            console.error(err.stack)
        })
        .then(() => {
            res.sendStatus(204)
        })
})
app.get('/users.json', nocache, function(req, res) {
    if (!app.locals.users) {
        model.getUsers(app.locals.pool)
            .catch(err => {
                res.sendStatus(500)
                console.error(err.stack)
            })
            .then(result => {
                app.locals.users = result.recordset.map(el => ({
                    value: el.UserID,
                    text: el.U_LoginName
                }))
                res.send(app.locals.users)
            })
    } else {
        res.send(app.locals.users)
    }
})

app.use(express.static('public'))
model.getConnection()
    .catch(err => console.error(err.stack))
    .then(pool => {
        app.locals.pool = pool
        app.listen(config.serverPort, function() {
            console.log('app listening on port: ' + config.serverPort)
        })
    })
