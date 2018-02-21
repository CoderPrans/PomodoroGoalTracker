
function appendPre(message) {
  var pre = document.getElementById('list');
  var textContent = document.createTextNode(message + '\n' + '\n');
  pre.appendChild(textContent);
}

function listUpcomingEvents() {
  document.getElementById("list").innerHTML = '';
  gapi.client.calendar.events.list({
    'calendarId': 'primary',
    'timeMin': (new Date()).toISOString(),
    'showDeleted': false,
    'singleEvents': true,
    'maxResults': 15,
    'orderBy': 'startTime'
  }).then(function(response) {
    var events = response.result.items;
    console.log(events);
    appendPre('Upcoming events:');

    var goals = events.filter(function(x){ return x.summary.slice(0, 6) == ":pomo:" });
    console.log(goals);
    if (goals.length > 0) {
      for (i = 0; i < 10; i++) {
        var event = goals[i];
        var when = event.start.dateTime;
          if (!when) {
            when = event.start.date;
          }
          appendPre(format(when) + " pomo: " + event.description.slice(0, 3) + " break: " + event.description.slice(8, 11) + event.summary.slice(6));
      }

      // countdown to event
      var counter = 0;
      var d = new Date();
      var p = new Date(goals[0].start.dateTime);
      var timeLeft = 0;
      var timer = document.getElementById("timer");
      timer.innerHTML = "";
      var h = '';
      var m = '';
      var s = '';
      var pomo_timer = document.getElementById("pomo_timer");
      var para = document.getElementById("starts");
      var data_user = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getEmail().slice(0, -10);
      var pomo_len = Number(goals[0].description.slice(0,2));
      var break_len = Number(goals[0].description.slice(8,10));

      para.innerHTML = "<b>" + goals[0].summary.slice(6) +"</b>"+ ' starts in :';

      timeLeft = Math.floor(p.getTime() / 1000) - Math.floor(d.getTime() / 1000);
      var countdown = setInterval(count, 1000);

      function count(){
        if(timeLeft - counter <= 0){
          // Pomodoro Timer Function //
          clearInterval(countdown);
          pomo_timer.style.display = 'block';
          timer.style.display = 'none';
          para.innerHTML = "<b>"+ goals[0].summary.slice(6) +"</b>";
          beginTimer(pomo_len, break_len, goals[0].summary.slice(6), data_user);
        } else {
          counter++;
          timer.innerHTML = formTime(timeLeft - counter);
        }
      }
    } else {
      appendPre('No upcoming goals found.');
      addEvent();
    }
  });
}

function listData(){
  var database = firebase.database();
  var data_user = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getEmail().slice(0, -10);
  var data_user_encoded = encode(data_user);
  var userRef = database.ref(data_user_encoded);
  userRef.on('value', gotData, errData);

  function gotData(snap){
    var pre = document.getElementById("track");
    var txt = document.createTextNode("Completed Goals: " + '\n' + '\n');
    pre.appendChild(txt);
    var instance = document.createElement("pre");
    if(snap.val() !== null){
      var dataSnap = snap.val();
      var goals = Object.keys(dataSnap);
      for(var i = 0; i < goals.length; i++){
        var goalsData = dataSnap[goals[i]]
        var goalMeta = document.createTextNode(goals[i]+"   pomo: "+goalsData.pomoDuration+" break: "+goalsData.breakDuration + '\n');
        instance.appendChild(goalMeta);
        var hr = document.createElement("hr");
        instance.appendChild(hr);
        for(var j in goalsData){
          if(j === "breakDuration") break;
          var timeStamp = j.slice(0, -3);
          var session = document.createTextNode(timeStamp + " > " + goalsData[j] + '\n' + '\n');
          instance.appendChild(session);
        }
      }
    pre.appendChild(instance);
  } else {
     pre.innerHTML = "Completed goal records will appear here.. "
  }
  }

  function errData(err){
    console.log(err);
  }

}


function format(dateTime){
let day = '';
let month = '';
let year = '';
date = '';
time = '';
  for(var f = 0; f < 4; f++){
  	year += dateTime[f];
  }
  for(var g = 5; g < 7; g++){
  	month += dateTime[g];
  }
  for(var h = 8; h < 10; h++){
  	day += dateTime[h];
  }
  date = day + '-' + month + '-' + year;
  for(var j = 11; j < 16; j++){
      time += dateTime[j];
  }
  return 'Date: ' + date + ' Time: ' + time;
}

// formating timers..
function formTime(sec){
   h = Math.floor(sec / 3600);
  var ph = h*3600;
   m = Math.floor((sec-ph) / 60);
   s = sec % 60;
  return duo(h)+' hrs '+duo(m)+' mins '+duo(s) + ' secs ';
}
function duo(x){
  var y = x.toString();
  if (y.length == 1) {
    y = "0" + y
  }
  return y;
}
