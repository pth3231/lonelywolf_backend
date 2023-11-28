const express = require('express')
const mssql = require('mssql')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')
const config = require('../../config.json')
let router = express.Router()

dotenv.config()

// Create a config object for DB Connection
const db_config = {
    user: process.env.USER,
    password: process.env.PASSWORD,
    server: process.env.SERVER,
    port: parseInt(process.env.PORT),
    database: process.env.DATABASE,
    options: {
        encrypt: true
    }
}

// This is the route for sign in, use to check if there is any matched result in the database
// If it does, the server will send a cookie and init a new session to validate later 
router.route('/signin')
    .get((req, res) => {
        console.log(`[routesSignin.js]: Got signin route!`)
        res.send("Okay, GOT!").status(200)
    })
    .post(async (req, res) => {
        const username = req.body.user
        const password = req.body.pass
        console.log(`[routesSignin.js]: Request data ${req.body}`)

        try {
            // Wait for the connection to be established
            var poolConnection = await mssql.connect(db_config)

            // Query rows with the matching username and password (, [str], [def], [agi], [sta], [coin] )
            const rows = await poolConnection.request().query(`SELECT [name]
                                                               FROM [dbo].[auth_info] WHERE ([user]='${username}') AND ([pass]='${password}');`)
            console.log(`[routesSignin.js]}`)
            console.log(rows)

            const token = jwt.sign(
                { username: req.body.user }, 
                config.secret, 
                { expiresIn: '600s' }
            ) 

            // If it does exist
            if (rows.recordset.length == 1) {
                // Send a successful response for frontend
                res.cookie("token", token, {
                    maxAge: 3600*1000,
                    httpOnly: true
                })
                res.cookie("username", username, {

                    maxAge: 3600*1000,
                    httpOnly: true
                })

                res.status(200).json({
                    status: true,
                    token: token
                })

                console.log(`[routesSignin.js]: Signed in!`)
            } else if (rows.recordset.length == 0) {
                console.log(`[routesSignin.js]: There is no such of this username/password that matched with out database`)

                // Send a no existing response
                res.status(200).json({ status: false })
            }
        } catch (err) {
            console.log(`[routesSignin.js]: ${err}`)
        } finally {
            // End connection session if the conn is still running
            poolConnection.close()
        }
    })

module.exports = router