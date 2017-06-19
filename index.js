require('dotenv').config();
var redis = require("redis");
var client = redis.createClient();
var mysql      = require('mysql');
const express = require('express')
const app = express()

var connection = mysql.createConnection({
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASS,
  database : 'newredis'
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
      connection.connect();
      connection.query('SELECT * FROM users', function (error, results, fields) {
        if (error) throw error;
        /* set data to redis */
        client.set("list_user", JSON.stringify(results), redis.print);
        res.send(results)
      });
      connection.end();

    }

  })

})

app.post('/addNewItem', function (req, res) {

})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
  console.log('Host : '+process.env.DB_HOST);
  console.log('User : '+process.env.DB_USER);
})
