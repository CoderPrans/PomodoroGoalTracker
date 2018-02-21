
    /// OPEN LOCALHOST 8000 ->  python -m SimpleHTTPServer 8000

    // Refer to the JavaScript quickstart on how to setup the environment:
    // https://developers.google.com/google-apps/calendar/quickstart/js
    // Change the scope to 'https://www.googleapis.com/auth/calendar' and delete any
    // stored credentials.
    var api_key = 'AIzaSyAoWtOIWVlv_is89lxaZQ6tOnDU6FCgLwA';
    var client_id = '849494497247-slssqa3ggb5ts1irs9o092qt5dgotrd1.apps.googleusercontent.com';
    var discovery_docs = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
    var scopes = "https://www.googleapis.com/auth/calendar";
    var authorizeButton = document.getElementById('authorize-button');
    var signoutButton = document.getElementById('signout-button');

    // var submit = document.getElementsByName("event_submit");

    // POST https://www.googleapis.com/calendar/v3/calendars/calendarId/events
    // use calendar.events.insert
    // inside the post request
    //   -- recurrence 'RRULE:FREQ=DAILY;INTERVAL=number'
    //   -- reminder.useDefault : false;
    //   -- reminder.overrides ( "method" : "popup")
    //   -- start.dateTime+05:30
    //   -- end.dateTime+05:30
    //   -- colorId : "11"
    //   -- summary : "🍅 title" && "✔️ 🍅 title" when updated
    //   -- system generated description

    /**
     *  On load, called to load the auth2 library and API client library.
     */
    function handleClientLoad() {
      gapi.load('client:auth2', initClient);
    }

    /**
     *  Initializes the API client library and sets up sign-in state
     *  listeners.
     */
    function initClient() {
      gapi.client.init({
        apiKey: api_key,
        clientId: client_id,
        discoveryDocs: discovery_docs,
        scope: scopes
      }).then(function() {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;
      });
    }

    /**
     *  Called when the signed in status changes, to update the UI
     *  appropriately. After a sign-in, the API is called.
     */
    function updateSigninStatus(isSignedIn) {
      if (isSignedIn) {
        authorizeButton.style.display = 'none';
        signoutButton.style.display = 'block';
        document.getElementById("add_event").style.display = 'block';
        user.innerHTML = "<h4>" + gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getEmail().slice(0, -10) + "</h4>";
        listUpcomingEvents();
        // firebase data list //
        listData();
      } else {
        authorizeButton.style.display = 'block';
        signoutButton.style.display = 'none';
        document.getElementById("name").innerHTML = "";
      }
    }

    /**
     *  Sign in the user upon button click.
     */
    function handleAuthClick(event) {
      gapi.auth2.getAuthInstance().signIn();
    }

    /**
     *  Sign out the user upon button click.
     */
    function handleSignoutClick(event) {
      gapi.auth2.getAuthInstance().signOut();
      window.location.reload();
    }

    function addEvent(){
      if(document.getElementById("input_data").style.display == 'none'){
        document.getElementById("input_data").style.display = 'block';
        document.getElementById("event_submit").style.display = 'block';
        document.getElementById("add_event").style.display = 'none';
        var name = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getName();
        document.getElementById("name").innerHTML = "Commit a goal " +  "<b>" + name + "</b>";
      }
     }

  function insertEvent(){
    if(document.getElementsByName("event_summary")[0].value){
      document.getElementById("input_data").style.display = 'none';
      document.getElementById("event_submit").style.display = 'none';
      document.getElementById("add_event").style.display = 'block';
      document.getElementById("name").innerHTML = '';
      // storing input values in variables to be passed.
      var eventName = ":pomo: " + document.getElementsByName("event_summary")[0].value;
      var value_day = document.getElementsByName("event_date")[0].value;
      var value_month = document.getElementsByName("event_date")[1].value;
      var value_year = document.getElementsByName("event_date")[2].value;
      var value_hour = document.getElementsByName("event_time")[0].value;
      var value_min = document.getElementsByName("event_time")[1].value;
      var dateTime = value_year + "-" + value_month + "-" + value_day + "T" + value_hour + ":" + value_min + ":00+05:30";
      var eventInterval = document.getElementsByName("event_interval")[0].value;
      var description = document.getElementById("timer_len").value + "' pomo" + document.getElementById("break_len").value + "' break";

      var event = {
        'summary': eventName,
        'description': description,
        'start': {
          'dateTime': dateTime,
          'timeZone': 'Asia/Calcutta'
        },
        'end': {
          'dateTime': dateTime,
          'timeZone': 'Asia/Calcutta'
        },
        'colorId': '11',
        'recurrence': [
          'RRULE:FREQ=DAILY;INTERVAL=' + eventInterval
        ],
        'reminders': {
          'useDefault': false,
          'overrides': [{
            'method': 'popup',
            'minutes': 10
          }]
        }
      };

      var request = gapi.client.calendar.events.insert({
        'calendarId': 'primary',
        'resource': event
      });



      request.execute(function(event) {
        console.log(event);
        var pre = document.querySelector("#declare");
        pre.innerHTML = "Event created: " + "<a href='"+ event.htmlLink + "'>"+ event.summary.slice(6) + "</a>";
        window.location.reload();
      });

          console.log(event);
    }else{ alert("fill in goal name !");}
  }
