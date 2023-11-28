const express = require('express')
const mssql = require('mssql')
const jwt = require('jsonwebtoken')
const config = require('../config.json')
let authenticateToken = require('../modules/authenticateToken')

let router = express.Router()

// Create a Pool object to handling the connection establishment
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

router.post("/getstatus", authenticateToken, async (req, res) => {
    try {
        // Wait for the connection to be established
        var poolConnection = await mssql.connect(db_config)

        // Query status of character
        const rows = await poolConnection.request().query(`SELECT [name] FROM [dbo].[auth_info] WHERE ([user]='${req.body.username}')`)
        console.log(`[routesGetStatus.js] result`)
        console.log(rows.recordset)
        // Send back an object
        res.status(200).json({ status: true, data: rows.recordset[0] })
    } catch (err) {
        console.log(err)
    } finally {
        // End connection session if the conn is still running
        poolConnection.close()
    }

})

module.exports = router