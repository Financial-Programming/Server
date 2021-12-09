
function validate(){
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    if(username&&password){
        //auth api 
         url = "http://localhost/loginAuth?email='"+username+"'&password='"+password+"'";
        //url = "https://financialprogramming.herokuapp.com/loginAuth?email='"+username+"'&password='"+password+"'";
        fetch(url).then(response=>response.json())
            .then((data)=>{
                if (data["auth_fail"]){
                    alert("wrong username or password");
                }else{
                    window.location = "/dashboard"
                } 
            })
            .catch(err =>  {
                alert(err);
            });
    }else{
        alert("input cannot be null")
    }
}

function register(){
    var name = document.getElementById("name").value;
    var email = document.getElementById("email").value;
    var register_password = document.getElementById("register_password").value;
    var re_password = document.getElementById("repassword").value;
    // check username and password
    if (register_password != re_password ){
        alert("password not matched");
    }else if(name && email && register_password && re_password){
        //auth api 
        url = "https://financialprogramming.herokuapp.com/registerAuth";

        let _data = {
            email: email,
            username: name,
            password: register_password, 
        }
        fetch(url, {
            method: "POST",
            body: JSON.stringify(_data),
            headers: {"Content-type": "application/json; charset=UTF-8"}
        })
        .then(response => response.json()) 
        .then(json => {
            alert("registered account"); 
            window.location = "index.html"      
        })
        .catch(err => alert(err))
    }else{
        alert("input cannot be null")
        alert(name)
    }
}

