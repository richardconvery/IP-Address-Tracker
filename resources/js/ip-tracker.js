// IP data
let ipURL = 'https://geo.ipify.org/api/v1?apiKey=at_nC6QwCvwb9yntzih6S0ePUd2JLmN9';
$.getJSON(ipURL).then (function(data) {
    thisIP = data.ip;
    document.getElementById("IP-Result").innerHTML = thisIP;
    thisCity = data.location.city;
    thisCountry = data.location.country;
    thisLat = data.location.lat;
    thisLng= data.location.lng;
    document.getElementById("Location-Result").innerHTML = thisCity + ', ' + thisCountry;
    thisTimezone = data.location.timezone;
    document.getElementById("Timezone-Result").innerHTML = thisTimezone;
    thisISP = data.isp;
    document.getElementById("ISP-Result").innerHTML = thisISP;
    createMap();
    showPage()
});








// Map
  // Create map
  const mymap = L.map('mapid', {
    center: [40.737, -73.923],
    zoom: 13,
    zoomControl: false,
    dragging: false,
    attributionControl: false,
    keyboard: false,
    scrollWheelZoom: false
  });
//   Create marker
function createMarker(){
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
    // // Add popup to map
    // var popup = L.popup({
    //     closeButton: false,
    //     className: "h2"
    // })
    // .setLatLng([thisLat, thisLng])
    // .setContent(thisIP)
    // .openOn(mymap)
}
//   Function to show the map with pin
  function createMap () {
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
    createMarker()
    // Show the information and set the map view
    showPage();
    mymap.setView ([thisLat, thisLng],13);

  }







//   Submit button
function getInputValue(){
    // Selecting the input element and get its value 
    let inputVal = document.getElementById("search").value;
    
    // Work out if this is an IP address or website

    // Set regex to check
    const regex = new RegExp('([0-9][0-9][0-9]|[0-9][0-9]|[0-9])\.([0-9][0-9][0-9]|[0-9][0-9]|[0-9])\.([0-9][0-9][0-9]|[0-9][0-9]|[0-9])\.([0-9][0-9][0-9]|[0-9][0-9]|[0-9])');
    
    // Change the URL depending on the regex result
    let ipURL = "";
    function setURL () {
        if (regex.test(inputVal) === true){
            ipURL = 'https://geo.ipify.org/api/v1?apiKey=at_nC6QwCvwb9yntzih6S0ePUd2JLmN9&ipAddress=' + inputVal;
        } else {
            ipURL = 'https://geo.ipify.org/api/v1?apiKey=at_nC6QwCvwb9yntzih6S0ePUd2JLmN9&domain=' + inputVal;
        }
    }
    setURL();
    // ipURL = 'https://geo.ipify.org/api/v1?apiKey=at_nC6QwCvwb9yntzih6S0ePUd2JLmN9&ipAddress=' + inputVal;
    // Submit the input to ipify to refresh data
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
    // Create the new marker and fly there
    createMarker();
    mymap.flyTo([thisLat, thisLng], 13);
    
}); 
};








// Show information on load
function showPage() {
    document.getElementById("result1").style.display = "block";
    document.getElementById("result2").style.display = "block";
    document.getElementById("result3").style.display = "block";
    document.getElementById("result4").style.display = "block";
    document.getElementById("lds-ripple").style.display = "none";
}







// Submit when the user presses enter
// Get the input field
var input = document.getElementById("search");

// Execute a function when the user releases a key on the keyboard
input.addEventListener("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13 || event.key === "button") {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    document.getElementById("mybutton").click();
  }
}); 