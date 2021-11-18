const express = require('express'); //Import the express dependency
const app = express();              //Instantiate an express app, the main work horse of this server
const port = 5000;                  //Save the port number where your server will be listening
const path = require('path');
const bodyParser = require("body-parser");

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname));


const { Pool } = require("pg");

const pool = new Pool({
    connectionString: "postgres://vliwurlgzvhacr:97eae88929ac89ba2cd27313b5396c0432a9afe142305a398a901ae38e4df6fc@ec2-3-209-65-193.compute-1.amazonaws.com:5432/d9thpnq5kqabnl",
    ssl: { rejectUnauthorized: false }, // Only enable TLS/SSL connections for Heroku. 
})


app.get('/login', (req, res) => {        
    res.sendFile('Login.html', {root: __dirname});      
});

app.get('/register', (req, res) => {        
    res.sendFile('Register.html', {root: __dirname});      
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
    pool.query('SELECT * FROM public."user"', (error, results) => {
        if (error) {
            throw error
        }
        console.log(JSON.stringify(results, null, 2));
        res.end(JSON.stringify(results.rows, null, 2));
    })
})

//register user
app.post('/registerAuth', function (req, res) {
    email = "'"+req.body.email+"'";;
    password = req.body.password;
    username = "'"+req.body.name+"'";
    console.log(req.body);
    console.log(email);
    console.log(password);
    sql_statement = 'INSERT INTO public."user" (email,password,name) VALUES ( ' +email+ ', '+password+','+username+')';
    console.log(sql_statement);
    pool.query(sql_statement, (error, results) => {
        if (error) {
            throw error
        }

        res.end(JSON.stringify(  {
            "register_Status": "success"
        }, null, 2));
    })
})

// login _auh
// input username and password
app.get('/loginAuth', function (req, res) {
    email =  req.query.email;
    password = req.query.password;
    console.log(email);
    console.log(password);
    sql_statement = 'SELECT * FROM public."user" WHERE email = '+email + ' and password = '+ password;
    console.log(sql_statement);
    pool.query(sql_statement, (error, results) => {
        if (error) {
            throw error
        }
        console.log(JSON.stringify(results, null, 2));
        if (results.rows.length>0){
            res.end(JSON.stringify(results.rows, null, 2));
        }
        res.end(JSON.stringify({auth_fail: 'username and password not matching'}, null, 2));
    })
})



app.listen(process.env.PORT || port, () => {            //server starts listening for any attempts from a client to connect at port: {port}
    console.log(`Now listening on port ${port}`); 
});












// Mircosoft access connect code 

/*
const ADODB = require('node-adodb'); // Microsoft Access database
ADODB.debug = true;   
const connection = ADODB.open('Provider=Microsoft.ACE.OLEDB.12.0;Data Source=Database.accdb;');
*/


  // connection
    //     .query('SELECT * FROM Customers')
    //     .then(data => {
    //     console.log(JSON.stringify(data, null, 2));
    //     // Prepare output in JSON format
    //     response = {data}
    //     res.end(JSON.stringify(response, null, 2));
    //     })
    //     .catch(error => {
    //     console.error(error);
    //     });