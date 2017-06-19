require('dotenv').config();
var redis = require("redis");
var client = redis.createClient();
var mysql      = require('mysql');
const express = require('express')
const app = express()

var pool = mysql.createPool({
  connectionLimit: 1000,
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASS,
  database : 'newredis',
  charset  : 'utf8mb4',
  // debug    : false
});

app.get('/', function (req, res) {

  client.get("list_user", function (err, reply) {
    if (err) {
      res.status(500).send("server error")
    }

    if (reply) {
      /* key redis found and send to clint with out get from database */
      res.status(200).send(JSON.parse(reply))
    } else {

      /* get all users */
      pool.getConnection(function(err,connection){
      	if (err) {
      		console.log('Error in connection database');
      	}
      	console.log('connected as id ' + connection.threadId);
        connection.query('SELECT * FROM users', function (error, results, fields) {
          if (error) throw error;
          /* set data to redis */
          client.set("list_user", JSON.stringify(results), redis.print);
          res.send(results)
        });
      });

      // connection.end();

    }

  })
  // pool.end(function (err) {
  // all connections in the pool have ended
// });

})

// app.post('/addNewItem', function (req, res) {
//
// })

app.listen(3000, function () {
  console.log('Example app listening on port 3000! Connection using pool')
  console.log('HOST : '+process.env.DB_HOST);
  console.log('USER : '+process.env.DB_USER);
})
