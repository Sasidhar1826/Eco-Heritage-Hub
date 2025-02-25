mapboxgl.accessToken = mapToken;

console.log("working");
console.log("hi", loc.split(",").map(Number));

const map = new mapboxgl.Map({
  container: "map", // container ID
  center: loc.split(",").map(Number), // starting position [lng, lat]
  zoom: 9, // starting zoom
});

const marker = new mapboxgl.Marker({ color: "lightgreen" })
  .setLngLat(loc.split(",").map(Number))
  .addTo(map);
