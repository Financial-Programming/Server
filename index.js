const express = require('express'); //Import the express dependency
const app = express();              //Instantiate an express app, the main work horse of this server
const port = 5000;                  //Save the port number where your server will be listening

const ADODB = require('node-adodb'); // Microsoft Access database
ADODB.debug = true;   
const connection = ADODB.open('Provider=Microsoft.ACE.OLEDB.12.0;Data Source=Database.accdb;');

//Idiomatic expression in express to route and respond to a client request
app.get('/', (req, res) => {        //get requests to the root ("/") will route here
    res.sendFile('index.html', {root: __dirname});      //server responds by sending the index.html file to the client's browser                                                        //the .sendFile method needs the absolute path to the file, see: https://expressjs.com/en/4x/api.html#res.sendFile 
});

app.get('/getuser_info', function (req, res) {
    // Prepare output in JSON format
    response = {
       first_name:req.query.first_name,
       last_name:req.query.last_name
    };
    console.log(response);
    res.end(JSON.stringify(response));
 })

 app.get('/getAllCustomer', function (req, res) {
    connection
        .query('SELECT * FROM Customers')
        .then(data => {
        console.log(JSON.stringify(data, null, 2));
        // Prepare output in JSON format
        response = {data}
        res.end(JSON.stringify(response, null, 2));
        })
        .catch(error => {
        console.error(error);
        });
 })


app.listen(process.env.PORT || port, () => {            //server starts listening for any attempts from a client to connect at port: {port}
    console.log(`Now listening on port ${port}`); 
});