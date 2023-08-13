import React, { useState, useEffect, useCallback } from 'react'
// Importing some Hooks and components from google maps api which we will be using during this tutorial
import { useJsApiLoader, GoogleMap, Marker, DirectionsRenderer, OverlayView } from '@react-google-maps/api'
import Container from '@mui/material/Container';
import { AppBar, Box, IconButton, SwipeableDrawer, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Controls } from './Controls';

import { shauns } from './data/shauns';
import { clusterCentre, computeTotalDistance, getShaun } from './helpers';
import { useShauns } from './useShauns';

const libraries = ['places'];
function App() {

    const [map, setMap] = useState(null);
    const { start, finish, unClusteredShauns, validClusters, shaunColour, clusterColour } = useShauns();


    const [isDrawerOpen, setDrawerOpen] = useState(true);
    const [distance, setDistance] = useState(null);
    // We will be using some state variables to store the response from the google maps api
    const [directionsResponse, setDirectionsResponse] = useState([])

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API,
        libraries: libraries
    })

    const clusterLocations = validClusters.map((cluster => clusterCentre(cluster)));

    const closeControls = () => {
        setDrawerOpen(false);
    }

    // function to calculate Route
    async function calculateRoute() {

        setDirectionsResponse([]);

        const origin = getShaun(start).location;
        const destination = getShaun(finish).location;

        const waypointLocations = [...unClusteredShauns.map((shaun) => shaun.location), ...clusterLocations];

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
        if (clusterLocations.length === 0) {
            // we are done
            setDirectionsResponse([results]);
            setDistance(computeTotalDistance(results))
        } else {
            // need to perform routing on each cluster and combine
            const order = results.routes[0].waypoint_order;
            let beforeLocation = getShaun(start).location;
            const fullRouteLocations = [beforeLocation];

            for (let index = 0; index < order.length; index++) {
                const waypointId = order[index];
                const afterLocation = waypointId < waypointLocations.length - 1 ? waypointLocations[waypointId + 1] : getShaun(finish).location;

                if (waypointId < unClusteredShauns.length) {
                    fullRouteLocations.push(unClusteredShauns[waypointId].location)
                } else {
                    // this entry in the route is a cluster - expand and solve, using revious and next points in 'parent' route as origin and destination
                    const validClusterIndex = waypointId - unClusteredShauns.length;

                    const clusterWaypoints = validClusters[validClusterIndex].map((shaunId) => getShaun(shaunId).location);

                    const request = {
                        origin: beforeLocation,
                        destination: afterLocation,
                        travelMode: window.google.maps.TravelMode.WALKING,
                        waypoints: clusterWaypoints.map(waypoint => ({ location: waypoint })),
                        optimizeWaypoints: true,
                    };
                    const clusterResults = await directionsService.route(request)
                    const order = clusterResults.routes[0].waypoint_order;
                    order.forEach((waypointIndex) => fullRouteLocations.push(clusterWaypoints[waypointIndex]));
                }
                beforeLocation = waypointLocations[waypointId];
            }

            fullRouteLocations.push(getShaun(finish).location);

            const resultsList = [];

            // now fullRouteLocations is the full expanded wayponts of the route including start and finish - needs slicing into routes
            let segmentOrigin = fullRouteLocations.splice(0, 1)[0]
            while (fullRouteLocations.length) {
                const routeSegment = fullRouteLocations.splice(0, 26); // (25 plus the end-pont)
                const segmentDestination = routeSegment.pop();
                const request = {
                    origin: segmentOrigin,
                    destination: segmentDestination,
                    travelMode: window.google.maps.TravelMode.WALKING,
                    waypoints: routeSegment.length ? routeSegment.map(waypoint => ({ location: waypoint })) : undefined,
                    optimizeWaypoints: false,
                };
                const segmentResults = await directionsService.route(request)
                resultsList.push(segmentResults);
                segmentOrigin = segmentDestination;
            }

            setDirectionsResponse(resultsList);
            const totalDistance = resultsList.reduce((acc, result) => acc + computeTotalDistance(result), 0);
            setDistance(totalDistance)

        }

    }

    const clearRoute = () => {
        setDirectionsResponse([]);
    }

    const onLoad = useCallback((map) => setMap(map), []);

    useEffect(() => {
        if (map) {
            const bounds = new window.google.maps.LatLngBounds();
            shauns.map((shaun) => {
                bounds.extend(shaun.location);
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

                            component="div"
                            sx={{
                                flexGrow: 1,
                            }}
                        >
                            Shaun on the Tyne - Running Challenge
                        </Typography>
                        {distance !== null && (<Typography variant="h4">{`${(distance * 0.621371).toFixed(1)}`}&nbsp;miles</Typography>)}
                    </Toolbar>
                </Container>
            </AppBar>
            <SwipeableDrawer
                anchor={'left'}
                open={isDrawerOpen}
                onClose={() => setDrawerOpen(false)}
                onOpen={() => setDrawerOpen(true)}
            >
                <Controls calculateRoute={calculateRoute} close={closeControls} clearRoute={clearRoute} hasRoute={directionsResponse.length > 0} />
            </SwipeableDrawer>

            <Container style={{ padding: "0 0 0 0", maxWidth: 'initial' }}>

                <div style={{ width: "calc(100vw - 0px)", height: 'calc(100vh - 64px)', margin: '64px 0 0 0' }}>
                    <Box sx={{
                        display: { xs: 'block', sm: 'none' },
                        width: '100%', height: '32px', background: 'transparent'
                    }} ></Box>
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
                                        position={shaun.location}
                                    >
                                        {
                                            <OverlayView

                                                position={shaun.location}
                                                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                                                getPixelPositionOffset={() => ({ x: -7, y: 2 })}

                                            >
                                                <div style={{ background: shaunColour(shaun.id), border: '1px solid black', padding: '5px' }}>{shaun.id}</div>
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
                                <div style={{ background: clusterColour(index), border: '1px solid black', padding: '5px' }}>{`Cluster ${index + 1}`}</div>
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
