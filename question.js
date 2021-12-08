questions = [
    {
        "q": "Question1",
        "a1":  "A",
        "a2":  "B",
        "a3":  "C",
        "a4":  "D"
    },
    {
        "q": "Question2",
        "a1":  "A",
        "a2":  "B",
        "a3":  "C",
        "a4":  "D"
    },
    {
        "q": "Question3",
        "a1":  "A",
        "a2":  "B",
        "a3":  "C",
        "a4":  "D"
    },
]

currentsurvey = -1

function submitAnswer() {

    var radios = document.getElementsByName('choice');
    var val= -1;
    for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
           val = radios[i].value; 
           break;
         }
    }
    
    if (val == -1) {
      alert('please select choice answer');
    } else if ( val == 1 ) {
      //alert('Answer is correct !');
      // go to the next question
      console.log(document.getElementById("survey_q").innerHTML)
      console.log( questions[currentsurvey]["q"])
      currentsurvey += 1
      if (currentsurvey < questions.length){
        document.getElementById("survey_q").innerHTML = questions[currentsurvey]["q"];
        document.getElementById("survey_a1").innerHTML = questions[currentsurvey]["a1"];
        document.getElementById("survey_a2").innerHTML = questions[currentsurvey]["a2"];
        document.getElementById("survey_a3").innerHTML = questions[currentsurvey]["a3"];
        document.getElementById("survey_a4").innerHTML = questions[currentsurvey]["a4"];
      }else[
          window.location = "index.html"
      ]
    } else {
      alert('Answer is wrong');
    }
};