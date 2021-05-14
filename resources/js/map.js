  // Create map
  const mymap = L.map('mapid', {
    center: [40.6782, -73.9442],
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
  L.marker([40.6782, -73.9442],{icon: myIcon}).addTo(mymap);