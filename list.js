
function appendPre(message) {
  var pre = document.getElementById('list');
  var li = document.createElement("li");
  li.innerHTML = message;
  pre.appendChild(li);
}

function listUpcomingEvents() {
  // document.getElementById("list").innerHTML = '';
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

    var goals = events.filter(function(x){ return x.summary.slice(0, 6) == ":pomo:" });
    var data_user = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getEmail().slice(0, -10);
    var pomo_len = 0;
    var break_len = 0;
    var ref = database.ref(encode(data_user));
    var goalRef = ref.child(goals[0].summary.slice(6));
    console.log(goalRef);
    goalRef.once("value", gotData, errData);
    function gotData(snap){
      if(snap.val() !== null){
        pomo_len = Number(snap.val().pomoDuration);
        break_len = Number(snap.val().breakDuration);
      }
    }
    function errData(err){
      console.log(err);
    }

    console.log(goals);
    if (goals.length > 0) {
      for (i = 0; i < goals.length; i++) {
        var event = goals[i];
        console.log(goals[i]);
        var when = event.start.dateTime;
          if (!when) {
            when = event.start.date;
          }
          appendPre("<b>"+event.summary.slice(6) +'</b><br /><br />'+  format(when));
      }
      var eventId = goals[0].id; // next most recent event's id
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

      para.innerHTML = "<b>" + goals[0].summary.slice(6) +"</b>"+ ' starts in :';

      timeLeft = Math.floor(p.getTime() / 1000) - Math.floor(d.getTime() / 1000);
      var countdown = setInterval(count, 1000);

      function count(){
        if(timeLeft - counter <= 0){
          // Pomodoro Timer Function //
          clearInterval(countdown);
          pomo_timer.style.display = 'block';
          timer.style.display = 'none';
          para.innerHTML = "<h2>"+ goals[0].summary.slice(6) +"</h2>";
          beginTimer(pomo_len, break_len, goals[0].summary.slice(6), data_user, eventId);
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
  var data_user = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getEmail().slice(0, -10);
  var data_user_encoded = encode(data_user);
  var userRef = database.ref(data_user_encoded);
  userRef.on('value', gotData, errData);

  function gotData(snap){
    var pre = document.getElementById("track");
    var instance = document.createElement("p");
    if(snap.val() !== null){
      pre.innerHTML = '';
      var dataSnap = snap.val();
      var goals = Object.keys(dataSnap);
      for(var i = 0; i < goals.length; i++){
        var goalsData = dataSnap[goals[i]];
        var li1 = document.createElement("p");
        li1.innerHTML = "<b>"+goals[i]+"</b><br/><i>pomo: "+goalsData.pomoDuration+"' break: "+goalsData.breakDuration+"' target: "+goalsData.target+"</i><br/>";
        instance.appendChild(li1);
        for(var j in goalsData){
          if(j === "breakDuration") break;
          var timeStamp = j.slice(0, -3);
          var li2 = document.createElement("p");
          if(goalsData[j] == goalsData.target){
            li2.style.background = 'lawngreen';
          } else { li2.style.background = 'coral'; }
          li2.innerHTML = timeStamp + "  >  " + goalsData[j] + ' / ' + goalsData.target;
          var p = document.createElement("p");
          var img = '<img id="img"src="pomo_img.png" width="18px"> &nbsp; ';
          var g_img = '<img id="img"src="pomo_img_grey.png" style="opacity: 0.7;" width="18px"> &nbsp;';
          for(var k = 0; k < goalsData.target; k++){
            if(k < goalsData[j]){
              appendHtml(p, img);
            } else {
              appendHtml(p, g_img);
            }
          }
          instance.appendChild(li2);
          instance.appendChild(p);
        }
        var totalCount = document.createElement("p");
        totalCount.innerHTML = "total pomodoroes collected = " + goalsData.total;
        instance.appendChild(totalCount);
      }
    pre.appendChild(instance);
  } else {
     pre.innerHTML = "Completed sessions will appear here.. "
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
