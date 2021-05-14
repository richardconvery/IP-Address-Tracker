const ipURL = 'https://geo.ipify.org/api/v1?apiKey=at_nC6QwCvwb9yntzih6S0ePUd2JLmN9';
$.getJSON(ipURL, function(data) {
    let thisIP = data.ip;
    document.getElementById("IP-Result").innerHTML = thisIP;
    let thisCity = data.location.city;
    let thisCountry = data.location.country;
    document.getElementById("Location-Result").innerHTML = thisCity + ', ' + thisCountry;
    console.log(data);
    let thisTimezone = data.location.timezone;
    document.getElementById("Timezone-Result").innerHTML = thisTimezone;
    let thisISP = data.isp;
    document.getElementById("ISP-Result").innerHTML = thisISP;
});


