//config
var END_TEXT = "Ran out of Qs"

var myCanvas = document.getElementById('canvas');
var resDiv = document.getElementById('results');
var mainText = document.getElementById('center');
var mc = new Hammer(myCanvas);


var questionSpreadId = "17d_7voIrfm9ha8dpkdk4M7ksw7_ce_loQ5QVUmW-nlw"
//var submit_url_base = "http://127.0.0.1:5000/submit"
var submit_url_base = "http://rajk.uni-corvinus.hu:5675/submit"

var params
var url

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

function getUserId() {
    var jsId = document.cookie.match(/TQUSERID=[^;]+/);
    if(jsId == null) {
        jsId = "TQUSERID=" + uuidv4() + ";"
        var expiry = new Date();
        expiry.setFullYear( expiry.getFullYear() + 1 );
        document.cookie = "expires=" + expiry.toUTCString() + ";"

        document.cookie += jsId
    }
    return jsId;
}

var userId = getUserId();
var sessionId = uuidv4();


function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            resDiv.innerHTML = xmlHttp.responseText;
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

function formatParams( params ){
  return "?" + Object
        .keys(params)
        .map(function(key){
          return key+"="+encodeURIComponent(params[key])
        })
        .join("&")
}

var qs = [];

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}


$.getJSON(`https://spreadsheets.google.com/feeds/list/${questionSpreadId}/2/public/values?alt=json`, function(data) {
    for (var i = 0; data.feed.entry.length > i; i++) {
        v = data.feed.entry[i]['gsx$value']['$t']
        k = data.feed.entry[i]['gsx$key']['$t']
        elemid = {
            "up":"top_command",
            "down":"bot_command",
            "left":"left_command",
            "right":"right_command",
        }[k]
        if (k == "endtext"){
            END_TEXT = v
        }else{
            document.getElementById(elemid).textContent = v
        }
    }
});

$.getJSON(`https://spreadsheets.google.com/feeds/list/${questionSpreadId}/od6/public/values?alt=json`, function(data) {
    for (var i = 0; data.feed.entry.length > i; i++) {
        qs[i] = data.feed.entry[i]['gsx$q']['$t'] 
    }
  qs = shuffle(qs);
  console.log(qs);
  mainText.textContent = qs[qs.length-1];
});

function handlePress(way){
    console.log(way)
    q = qs.pop()
    params = {
        'q': q,
        'time': + new Date(),
        'verdict': way,
        'user': userId,
        'session': sessionId,
      }
    httpGet(submit_url_base + formatParams(params));
    if(qs.length == 0){
        mainText.textContent = END_TEXT;
        mc.destroy();
    }else{
        mainText.textContent = qs[qs.length-1]
    }
}


// let the pan gesture support all directions.
// this will block the vertical scrolling on a touch-device while on the element
mc.get('pan').set({ direction: Hammer.DIRECTION_ALL });

// listen to events... "panleft panright"
mc.on("panleft panright pandown panup", async function(ev) {
    mc.stop()
    handlePress(ev.type)
});


document.addEventListener('keydown', function(event) {
    keys = [
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown"
    ]
    const key = event.key;
    if (keys.includes(key) & qs.length > 0){
        handlePress(key)
    }
});


