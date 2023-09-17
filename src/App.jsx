import React, { useState, useEffect, useCallback, useRef } from 'react'
// Importing some Hooks and components from google maps api which we will be using during this tutorial
import { useJsApiLoader, GoogleMap, Marker, DirectionsRenderer, OverlayView } from '@react-google-maps/api'
import Container from '@mui/material/Container';
import { AppBar, Box, IconButton, SwipeableDrawer, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { Controls } from './Controls';

import { shauns } from './data/shauns';
import { clusterCentre, computeTotalDistance, getShaun } from './helpers';
import { useShauns } from './useShauns';

const libraries = ['places'];
function App() {

    const [map, setMap] = useState(null);
    const { start, finish, unClusteredShauns, validClusters, shaunColour, clusterColour } = useShauns();
    const [userPos, setUserPos] = useState(null);
    const interval = useRef(null);


    const [isDrawerOpen, setDrawerOpen] = useState(false);
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

    const locate = async () => {
        if (window.navigator.geolocation) {
            if (interval.current) {
                window.clearInterval(interval.current);
                interval.current = null;
            }
            const calcPos = async () => {
                return new Promise((resolve) => {
                    window.navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const pos = {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude,
                            };
                            resolve(pos);
                        },
                        () => {
                            resolve(null);
                        },
                    );
                })
            };
            const pos = await calcPos();
            setUserPos(pos);
            map.setCenter(pos);
            map.setZoom(16);
            interval.current = window.setInterval(() => {
                (async () => {
                    const pos = await calcPos();
                    setUserPos(pos);
                    map.setCenter(pos);
                })();
            }, 120000);
        }
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

    const svgMarker = {
        path: "M-1.547 12l6.563-6.609-1.406-1.406-5.156 5.203-2.063-2.109-1.406 1.406zM0 0q2.906 0 4.945 2.039t2.039 4.945q0 1.453-0.727 3.328t-1.758 3.516-2.039 3.070-1.711 2.273l-0.75 0.797q-0.281-0.328-0.75-0.867t-1.688-2.156-2.133-3.141-1.664-3.445-0.75-3.375q0-2.906 2.039-4.945t4.945-2.039z",
        fillColor: "blue",
        fillOpacity: 0.6,
        strokeWeight: 0,
        rotation: 0,
        scale: 2,
        anchor: new window.google.maps.Point(0, 20),
    };

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
                        <IconButton
                            size="large"
                            edge="end"
                            color="inherit"
                            aria-label="locate"
                            sx={{ mr: 2 }}
                            onClick={() => locate()}
                        >
                            <MyLocationIcon />
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
                        {userPos && <Marker id='human' key='human' position={userPos} icon={svgMarker} />}
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
