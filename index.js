const express = require('express'); //Import the express dependency
const app = express();              //Instantiate an express app, the main work horse of this server
const port = process.env.PORT || 80;             //Save the port number where your server will be listening
const path = require('path');
const bodyParser = require("body-parser");
var yahooFinance = require('yahoo-finance');
var session = require( "express-session");
const { spawn } = require("child_process");
const { PythonShell } = require('python-shell');

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname));
app.use(session({ secret:"123456", resave:false, saveUninitialized: true }))

const { Pool } = require("pg");

const pool = new Pool({
    connectionString: "postgres://vliwurlgzvhacr:97eae88929ac89ba2cd27313b5396c0432a9afe142305a398a901ae38e4df6fc@ec2-3-209-65-193.compute-1.amazonaws.com:5432/d9thpnq5kqabnl",
    ssl: { rejectUnauthorized: false }, // Only enable TLS/SSL connections for Heroku. 
})

app.get('/', (req, res) => {        
    res.sendFile('/templates/index.html', {root: __dirname});      
});

app.get('/login', (req, res) => {        
    res.sendFile('/templates/Login.html', {root: __dirname});      
});

app.get('/register', (req, res) => {        
    res.sendFile('/templates/Register.html', {root: __dirname});      
});

app.get('/survey', (req, res) => {        
    res.sendFile('/templates/survey.html', {root: __dirname});      
});

app.get('/dashboard', function (req, res) {
    // Prepare output in JSON format 
    res.sendFile('/templates/dashboard.html', {root: __dirname});   
 })

app.get('/getuser_info', function (req, res) {
    // Prepare output in JSON format
    response = {
       first_name:req.query.first_name,
       last_name:req.query.last_name
    };
    console.log(response);
    res.end(JSON.stringify(response));
 })


 //get all customer 
app.get('/getAllCustomer', function (req, res) {
    pool.query('SELECT * FROM public."user"', (error, results) => {
        if (error) {
            throw error
        }
        console.log(JSON.stringify(results, null, 2));
        res.end(JSON.stringify(results.rows, null, 2));
    })
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
    email = "'"+req.body.email+"'"; 
    password = "'"+req.body.password+"'";
    username = "'"+req.body.username+"'";
    console.log(req.body);
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
        //console.log(JSON.stringify(results, null, 2));
        if (results.rows.length>0){
            req.session.user = results.rows[0];
            res.end(JSON.stringify(results.rows[0], null, 2));
        }
        res.end(JSON.stringify({auth_fail: 'username and password not matching'}, null, 2));
    })
})

app.get('/stock', function (req, res) {
    stock =  req.query.symbol;
    yahooFinance.quote({
        symbol: stock,
        modules: ['price']       // optional; default modules.
      }, function(err, quote) {
        console.log(quote)
        res.end(JSON.stringify( quote));
     });

    // password = req.query.password;
    // console.log(email);
    // console.log(password);
    // sql_statement = 'SELECT * FROM public."user" WHERE email = '+email + ' and password = '+ password;
    // console.log(sql_statement);
    // pool.query(sql_statement, (error, results) => {
    //     if (error) {
    //         throw error
    //     }
    //     console.log(JSON.stringify(results, null, 2));
    //     if (results.rows.length>0){
    //         res.end(JSON.stringify(results.rows[0], null, 2));
    //     }
    //     res.end(JSON.stringify({auth_fail: 'username and password not matching'}, null, 2));
    // })
}) 

 app.get('/stocklist',  function (req, res) {
    sql_statement = 'SELECT * FROM public."stock" WHERE uid ='+ req.session.user.id;
    console.log(sql_statement);
    
    pool.query(sql_statement, async(error, results) => {
        if (error) {
            throw error
        } 
        //console.log(results.rows);
        
        //results = [];
        for (var i = 0; i < results.rows.length; i++)  {   
            await yahooFinance.quote({
                symbol: results.rows[i].symbol,    
                modules: ['price']       // optional; default modules.
              }, function(err, quote) { 
                results.rows[i]["current_price"] = quote["price"]["regularMarketPrice"]
                results.rows[i]["DayLow"] = quote["price"]["regularMarketDayLow"]
                results.rows[i]["DayHigh"] = quote["price"]["regularMarketDayHigh"]
                results.rows[i]["Daychange"] = quote["price"]["regularMarketChangePercent"]
                 
             });  
        }
        req.session.stocklist =  results.rows;  
        res.end(JSON.stringify(results.rows , null, 2)); 
    }) 
})


 app.get('/user_info', function (req, res) {
    // Prepare output in JSON format 
    res.end(JSON.stringify( req.session.user));
 }) 
 // Insert
app.post('/buy', function(req,res){ 
    console.log(req.session.stocklist);
    if (req.session.stocklist.some(item => item.symbol === req.body.symbol)){
        //alread have stocks
        // update the row
        old_record = req.session.stocklist.filter(item => item.symbol == req.body.symbol )[0]; 
        new_volume = parseInt(old_record.volume)+parseInt(req.body.volume); 
        new_price = (parseInt(old_record.volume)*parseInt(old_record.price) +parseInt(req.body.price) *parseInt(req.body.volume)) /parseInt(new_volume) ; 
     
        sql_statement = 'UPDATE public."stock" SET volume = '+new_volume+', price = '+new_price+' WHERE id = '+old_record.id+' RETURNING *;'; 
        console.log(sql_statement); 
        pool.query(sql_statement, (error, results) => {
            if (error) {
                throw error
            } 
            console.log(results.rows);
        }) 
    }else{
        // insert new row
        sql_statement = 'INSERT INTO public."stock" (uid, symbol, volume, price, date)  VALUES ( ' +req.session.user.id+ ', \''+req.body.symbol+ '\', '+req.body.volume+','+req.body.price+',\''+new Date().toISOString().split('T')[0]+'\')'; 
        console.log(sql_statement);
        pool.query(sql_statement, (error, results) => {
            if (error) {
                throw error
            } 
            console.log(results.rows);
            
            res.end(JSON.stringify(results.rows , null, 2)); 
        }) 
    }
 });

 app.post('/sell', function(req,res){ 
    console.log(req.session.stocklist);
    if (req.session.stocklist.some(item => item.symbol === req.body.symbol)){
        //alread have stocks
        // update the row
        old_record = req.session.stocklist.filter(item => item.symbol == req.body.symbol )[0]; 
        new_volume = parseInt(old_record.volume)-parseInt(req.body.volume); 
        if (new_volume==0) {
            // delete
            sql_statement = 'DELETE FROM public."stock" WHERE id = '+old_record.id+'AND symbol = \''+req.body.symbol+'\'';  
            console.log(sql_statement); 
            pool.query(sql_statement, (error, results) => {
                if (error) {
                    throw error
                } 
                console.log(results.rows);
            }) 
        } else if (new_volume<0) {
            // not enough for sell
            res.status(500).send('Volume error'); 
        } else{
            new_price = (parseInt(old_record.volume)*parseInt(old_record.price) -parseInt(req.body.price) *parseInt(req.body.volume)) /parseInt(new_volume) ; 
     
            sql_statement = 'UPDATE public."stock" SET volume = '+new_volume+', price = '+new_price+' WHERE id = '+old_record.id+' RETURNING *;'; 
            console.log(sql_statement); 
            pool.query(sql_statement, (error, results) => {
                if (error) {
                    throw error
                } 
                console.log(results.rows);
            }) 
        }  
    }else{
        // no history
        res.status(500).send('Something broke!'); 
    }
 });

 app.post('/recommend', function(req,res){ 
     stock1 = req.body.stock1
     stock2 = req.body.stock2
     stock3 = req.body.stock3
     gain = req.body.gain
     console.log(stock1,stock2,stock3,gain)
    //  const py = spawn("python", ["portfolio.py", stock1,stock2,stock3,gain]);
    //  py.stdout.on("data", (data) => {
    //     data2send = data.toString();
    // });
    // console.log(data2send);
    let options = {
        mode: 'text', 
        pythonOptions: ['-u'], // get print results in real-time 
        args: [stock1,stock2,stock3,gain]
    };
    
    PythonShell.run('portfolio.py', options, function(err, results) {
        if (err){
            console.log(err);
        } else{
            answer = {
                "weight1": results[0],
                "weight2": results[1],
                "weight3": results[2]
            }
            res.send(answer);     
        }
        // results is an array consisting of messages collected during execution
    });
 });

app.get('/logout',function(req,res) {
    req.session.user = null;
    res.redirect('/');
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