mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: campground.geometry.coordinates,
    zoom: 10
    });

    map.addControl(new mapboxgl.NavigationControl());
     
    new mapboxgl.Marker({color: 'red'})
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h5>${campground.name}</h5><p>${campground.location}</p>`
            )
    )
    .addTo(map);
     