const express = require('express')
const dotenv = require('dotenv')
const mssql = require('mssql')
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

router.route('/signup')
    .get((req, res) => {
        res.status(200).json(
            { message: "This is sign up GET request!" }
        )
    })
    .post(async (req, res) => {
        const input_username = req.body.user
        const input_password = req.body.pass
        const input_nickname = req.body.nickname

        try {
            // Wait for the connection to be established
            var poolConnection = await mssql.connect(db_config)

            // Query rows with the matching username and password
            await poolConnection.request().query(`INSERT INTO [dbo].[auth_info] ([user], [pass], [name])
                                                    VALUES ('${input_username}', '${input_password}', '${input_nickname}'); `)
            console.log(`[routesSignup.js]: Signed up {username: ${input_username}, nickname: ${input_username} }`)
            res.json({status: true})
        } catch (err) {
            console.log(`[routesSignup.js]: ${err}`)
            res.json({status: false})
        } finally {
            // End connection session if the conn is still running
            poolConnection.close()
        }
    })

module.exports = router