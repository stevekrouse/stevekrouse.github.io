---
title: places
---

<style>

.date {
  border: 1px solid black;
  padding: 10px;
}

table {
  border-collapse: collapse;
  width: 100%;
}

</style>

<script>

// Todo
// sticky day of week email


function get(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.onload = () => resolve(xhr.responseText);
    xhr.onerror = () => reject(xhr.statusText);
    xhr.send();
  });
}

var makeCalendar = function(year, events) {
  var cursorDate = new Date();
  var create7DayRow = function(cellType, daySet, column1) {
    var nextRow = document.createElement("tr");
    cell = document.createElement(cellType);
    cell.appendChild(document.createTextNode(column1));
    nextRow.appendChild(cell);
    for (i = 0; i < 7; i++) {
      var cell = document.createElement(cellType);
      var d
      if (!daySet[i]) { d = "" }
      else if (typeof daySet[i] === "string") { d = daySet[i] }
      else if (daySet[i].getDate) { 
        d = daySet[i].getDate()
        cell.className += " date"
        let happeningEvents = events.filter(event => daySet[i] >= event.Start && daySet[i] <= event.End)
        if (happeningEvents.length === 0) {
          d += '<br><br><br>'
        } else if (happeningEvents.length === 1) {
          d += '<br><br>'
        }  else if (happeningEvents.length >= 2) {
          d += '<br>'
        }
        d += " " + happeningEvents.map(event => `<span style="color:${event.Color}"">${event.Location}</span>`).join("<br>")
      }
      
      var dy = document.createTextNode(d);
      cell.innerHTML += d;
      nextRow.appendChild(cell);
    }
    return nextRow;
  };
  var getNext7Days = function(jan1DayOfWeekOffset) {
    var sevenDays = [];
    for (i = 0; i + jan1DayOfWeekOffset < 7; i++) {
      sevenDays[i + jan1DayOfWeekOffset] = cursorDate;
      cursorDate = new Date(
        cursorDate.getFullYear(),
        cursorDate.getMonth(),
        cursorDate.getDate() + 1
      );
    }
    return sevenDays;
  };
  var get365Calendar = function(year) {
    var monthSet = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];
    var weekSet = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var tbl, row, cell;
    tbl = document.createElement("table");
    row = create7DayRow("th", weekSet, year);
    tbl.appendChild(row);
    var jan1NextYear = new Date(year + 1, 0, 1);
    var jan1DayOfWeekOffset = cursorDate.getDay();
    while (cursorDate < jan1NextYear) {
      var month = monthSet[cursorDate.getMonth()]
      var sevenDays = getNext7Days(jan1DayOfWeekOffset);
      jan1DayOfWeekOffset = 0;
      row = create7DayRow("td", sevenDays, month);
      tbl.appendChild(row);
    }
    return tbl;
  };

  return get365Calendar(year);
};


let fromPairs = a => a.reduce( (o,[k,v]) => (o[k]=v,o), {} );
// get('https://docs.google.com/spreadsheets/d/e/2PACX-1vT4DfI-nBpxm14XJGH-5B95hYK36swCSe30_P6QNhAQBmWCACy4aXm-BTjkJVvkQs2whtGEPZpPN4iz/pub?output=csv').then(a => {
  let lines = `Start,End,Location,Color
May 1 (Wed),May 15 (Wed),NY,blue
May 15 (Wed),May 25 (Sat),Lon,grey
May 25 (Sat),Jun 8,Isr,peru
Jun 8,Jun 10 (Mon),Lon,grey
Jun 10 (Mon),Jun 14 (Fri),NY,blue
Jun 14 (Fri),Jun 16 (Sun),Mar,orange
Jun 16 (Sun),Jun 22 (Sat),NY,blue
Jun 22 (Sat),Jun 24 (Mon),Mn,lightgreen
Jun 24 (Mon),Jun 28 (Fri),NY,blue
Jun 28 (Fri),Jul 2 (Tue),Sag,green
Jul 2 (Tue),Jul 7 (Sun),CT,yellowgreen
Jul 7 (Sun),Jul 11,NY,blue
Jul 11,Jul 14 (Sun),Phl,red
Jul 14 (Sun),Jul 15 (Mon),NY,blue
Jul 15 (Mon),Jul 27 (Sat),Fr,violet
Jul 27 (Mon),Aug 3 (Sat),Tk,DarkSalmon
Aug 3,Aug 20,Lon,gray
Aug 20,Aug 22,BOB,orange
Aug 22,Aug 27,Lon,gray
Aug 27,Aug 27,Lib,hotpink
Aug 28, Aug 31,PPG,hotpink
Aug 31,Sep 2,Lon,gray
Sep 1,Sep 1,🎬,grey
Sep 2,Sep 11,NY,blue
Sept 11,Sep 17,NY,blue
Sep 5 (Thu),Sep 5 (Thu),Ed,blue
Sep 9,Sep 9,DrY,blue
Sep 11,Sep 14,SL,red
Sep 14,Sep 14,Eng,blue
Sep 18 (Wed),Sep 18 (Wed),Lat,grey
Sep 17,Oct 19,Lon,grey
Sep 21 (Sat),Sep 21 (Sat),Luk,grey
Sep 28 (Sat),Sep 29 (Sun),Lan,purple
Oct 19,Oct 19,Eng,grey
Oct 31,Nov 3, Pak,green
Oct 20 (Sun),Oct 25 (Fri),SPH,maroon
Dec 5 (Thu),Dec 8 (Sun),Ion,blue`.split("\n")
  // let lines = a.split("\r\n")
  let headers = lines[0].split(",")
  let events = lines.slice(1).map(line => fromPairs(line.split(",").map((part, i) => [headers[i], Date.parse(part) ? new Date(Date.parse(part + " 2019")) : part])))
  document.body.appendChild(makeCalendar(2019, events));
// })

</script>


<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-101485962-1', 'auto');
  ga('send', 'pageview');

</script>
  
