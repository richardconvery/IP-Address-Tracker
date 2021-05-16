// IP data
let ipURL = 'https://geo.ipify.org/api/v1?apiKey=at_nC6QwCvwb9yntzih6S0ePUd2JLmN9';
console.log("URL retrived");
$.getJSON(ipURL).then (function(data) {
    console.log("Getting data ");
    console.log("Loading IP address: ");
    thisIP = data.ip;
    document.getElementById("IP-Result").innerHTML = thisIP;
    console.log("Finding location");
    thisCity = data.location.city;
    thisCountry = data.location.country;
    thisLat = data.location.lat;
    thisLng= data.location.lng;
    document.getElementById("Location-Result").innerHTML = thisCity + ', ' + thisCountry;
    console.log("Finding timezone");
    thisTimezone = data.location.timezone;
    document.getElementById("Timezone-Result").innerHTML = thisTimezone;
    console.log("Identifying ISP");
    thisISP = data.isp;
    document.getElementById("ISP-Result").innerHTML = thisISP;
    createMap();
});





// Map
  // Create map
  function createMap () {
  console.log("Creating map");
  const mymap = L.map('mapid', {
    center: [thisLat, thisLng],
    zoom: 13,
    zoomControl: false,
    dragging: false,
    attributionControl: false,
    keyboard: false,
    scrollWheelZoom: false
  });
  // Add tiles from Mapbox
  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    // Simply create a free account on mapbox.com and there will be an access key there
    accessToken: 'pk.eyJ1IjoicmljaGFyZGNvbnZlcnkiLCJhIjoiY2tvajQxdXZiMDhhczJ2bndrbmI0bXYxdyJ9.QMADUp16A64accYOaviVGw'
}).addTo(mymap);
// Create marker and add to map
const myIcon = L.icon({
    iconUrl: 'resources/images/icon-location.svg',
    iconSize: [35, 45],
    iconAnchor: [45, 45],
    popupAnchor: [-3, -76],
    shadowSize: [68, 95],
    shadowAnchor: [22, 94]
});
  // Add marker to map
  L.marker([thisLat, thisLng],{icon: myIcon}).addTo(mymap);
  showPage()
  }



//   Submit button
function getInputValue(){
    // Selecting the input element and get its value 
    var inputVal = document.getElementById("search").value;
    
    // Submit the input to ipify to refresh data

    let ipURL = 'https://geo.ipify.org/api/v1?apiKey=at_nC6QwCvwb9yntzih6S0ePUd2JLmN9&ipAddress=' + inputVal;
$.getJSON(ipURL, function(data) {
    thisIP = data.ip;
    document.getElementById("IP-Result").innerHTML = thisIP;
    thisCity = data.location.city;
    thisCountry = data.location.country;
    document.getElementById("Location-Result").innerHTML = thisCity + ', ' + thisCountry;
    console.log(data);
    thisTimezone = data.location.timezone;
    document.getElementById("Timezone-Result").innerHTML = thisTimezone;
    thisISP = data.isp;
    document.getElementById("ISP-Result").innerHTML = thisISP;
    thisLat = data.location.lat;
    thisLng= data.location.lng;
});
    document.getElementById('search').value = '';
};




// Show information on load

var myVar;
    function showPage() {
      document.getElementById("result1").style.display = "block";
      document.getElementById("result2").style.display = "block";
      document.getElementById("result3").style.display = "block";
      document.getElementById("result4").style.display = "block";
      document.getElementById("lds-ripple").style.display = "none";
    }
    function myFunction() {
      myVar = setTimeout(showPage, 2500);
    }