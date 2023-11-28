const express = require('express')
const mssql = require('mssql')
const schedule = require('node-schedule')
const task_list = require('./task_list.json').task_list

let authenticateToken = require('../modules/authenticateToken')
let randomBetween = require('../modules/randomBetween')

let router = express.Router()

// Create a Pool object to handling the connection establishment
// const pool = mssql.createPool({
//     host: 'localhost',
//     user: 'lonelywolf',
//     password: 'lonelywolf',
//     database: 'lonelywolf_db',
//     connectionLimit: 15
// })

// Pre-set value for randomedTask 
let randomedTask = []
schedule.scheduleJob('0 0 0 * * *', function() {
    // Generate a random item
    randomedTask.pop()
    randomedTask.pop()
    randomedTask.pop()
    randomedTask.push(randomBetween(task_list.beginner_tasks))
    randomedTask.push(randomBetween(task_list.intermediate_tasks))
    randomedTask.push(randomBetween(task_list.advanced_tasks))
    // Print the item to the console
    console.log(`[routesGetTask.js] The random item for today is: ${randomedTask}`);
  });

router.post('/gettask', authenticateToken, async (req, res) => {
        try {
            console.log(`[routesGetTask.js]: Username - ${req.body.username}`)
            console.log(`[routesGetTask.js]: Got random tasks`)
            console.log(randomedTask)
            res.status(200).json({ random_task_list: randomedTask })
        } catch (e) {
            console.error("Failed during getting task!", e)
            res.send(500)
        }        
    })

module.exports = router