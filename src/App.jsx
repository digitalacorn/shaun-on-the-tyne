import React, { useState, useEffect, useCallback } from 'react'
// Importing some Hooks and components from google maps api which we will be using during this tutorial
import { useJsApiLoader, GoogleMap, Marker, DirectionsRenderer, OverlayView } from '@react-google-maps/api'
import Container from '@mui/material/Container';
import { AppBar, IconButton, SwipeableDrawer, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Controls } from './Controls';

import { shauns } from './data/shauns';
import { clusterCentre, computeTotalDistance, getShaun } from './helpers';
import { useShauns } from './useShauns';


const libraries = ['places'];
function App() {

    const [map, setMap] = useState(null);
    const { start, finish, unClusteredShauns, validClusters } = useShauns();


    const [isDrawerOpen, setDrawerOpen] = useState(true);
    const [distance, setDistance] = useState('');
    // We will be using some state variables to store the response from the google maps api
    const [directionsResponse, setDirectionsResponse] = useState([])

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API,
        libraries: libraries
    })

    const clusterLocations = validClusters.map((cluster => clusterCentre(cluster)));

    // function to calculate Route
    async function calculateRoute() {

        const startShaun = getShaun(start);
        const finishShaun = getShaun(finish);

        const origin = new window.google.maps.LatLng(
            startShaun.lat,
            startShaun.lng
        );
        const destination = new window.google.maps.LatLng(
            finishShaun.lat,
            finishShaun.lng
        );


        const waypointLocations = [...unClusteredShauns.map((shaun) => new window.google.maps.LatLng(
            shaun.lat,
            shaun.lng
        )), ...clusterLocations];

        const request = {
            origin,
            destination,
            travelMode: window.google.maps.TravelMode.WALKING,
            waypoints: waypointLocations.map((location) => ({
                location
            })),
            optimizeWaypoints: true,
        };

        const directionsService = new window.google.maps.DirectionsService()
        const results = await directionsService.route(request)
        setDirectionsResponse([results]);
        const km = computeTotalDistance(results);
        setDistance(`${km}km`)
        const order = results.routes[0].waypoint_order;
    }

    const onLoad = useCallback((map) => setMap(map), []);

    useEffect(() => {
        if (map) {
            const bounds = new window.google.maps.LatLngBounds();
            shauns.map((shaun) => {
                bounds.extend({
                    lat: shaun.lat,
                    lng: shaun.lng,
                });
            });
            map.fitBounds(bounds);
        }
    }, [map]);

    if (!isLoaded)
        return (<div>Loading...</div>);


    return (
        <>
            <AppBar position="fixed">
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="open drawer"
                            sx={{ mr: 2 }}
                            onClick={() => setDrawerOpen(true)}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography
                            variant="h6"
                            noWrap
                            component="div"
                            sx={{
                                flexGrow: 1,
                                display: { xs: 'none', sm: 'block' },
                            }}
                        >
                            Shaun on the Tyne - Running Challenge
                        </Typography>
                        <Typography>{distance}</Typography>
                    </Toolbar>
                </Container>
            </AppBar>
            <SwipeableDrawer
                anchor={'left'}
                open={isDrawerOpen}
                onClose={() => setDrawerOpen(false)}
                onOpen={() => setDrawerOpen(true)}
            >
                <Controls calculateRoute={calculateRoute} />
            </SwipeableDrawer>

            <Container style={{ padding: "0 0 0 0", maxWidth: 'initial' }}>

                <div style={{ width: "calc(100vw - 0px)", height: 'calc(100vh - 64px)', margin: '64px 0 0 0' }}>
                    <GoogleMap
                        //center={center}
                        zoom={15}
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        onLoad={onLoad}
                        options={{
                            streetViewControl: true,
                            zoomControl: true,
                            mapTypeControl: true,
                            fullscreenControl: false,
                        }}
                    >
                        {
                            shauns.map((shaun) => {

                                return (
                                    <Marker id={shaun.id} key={shaun.id} title={shaun.title}
                                        position={{ lat: shaun.lat, lng: shaun.lng }}
                                    >
                                        {
                                            <OverlayView

                                                position={{ lat: shaun.lat, lng: shaun.lng }}
                                                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                                                getPixelPositionOffset={() => ({ x: -7, y: 2 })}

                                            >
                                                <div style={{ background: "white", border: '1px solid black' }}>{shaun.id}</div>
                                            </OverlayView>
                                        }
                                    </Marker>
                                )
                            })
                        }
                        {
                            clusterLocations.length && clusterLocations.map((clusterLoc, index) => (<OverlayView
                                key={index}
                                position={clusterLoc}
                                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                                getPixelPositionOffset={() => ({ x: -7, y: 2 })}

                            >
                                <div style={{ background: "yellow", border: '1px solid black' }}>{`Cluster ${index + 1}`}</div>
                            </OverlayView>))
                        }
                        {directionsResponse.length && directionsResponse.map((resp, i) => (<DirectionsRenderer key={i} directions={resp} />))}
                    </GoogleMap>
                </div>

            </Container>
        </>
    )
}

export default App
