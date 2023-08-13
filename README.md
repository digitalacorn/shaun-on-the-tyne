# Shaun on the Tyne Running Challenge

A tool to allow a human to assist the Google route-finding API by breaking down a large number of waypoints (more than the 25 limit) into clusters and combining the result into a single optimal route.

![image](https://github.com/digitalacorn/shaun-on-the-tyne/assets/1842090/827b1426-87e8-405f-9e81-39ce31761922)

#### Demo: https://demo.digitalacorn.co.uk/shaun-on-the-tyne/

## Why?

My running buddy is a nutter. He suggested we visit all of the Shaun sculptures in one day - and that because I was into orienteering
I should look at the best route. I'm also lazy and a coder so decided I could get google maps to do a lot of the grunt work.

## The Problem

Google maps API will ony allow 25 wayponts. There are a lot more Shaun sculptures. How to solve split this and still get a good, if not, optimal solution.

## The Solution - Clustering

By clustering together nearby sculptures we can consolidate parts of the route and have the API solve the general and localised portions of the
route separately.

The elevation profile in Newcastle can be pretty unforgiving for running - so by using a bit of local knowledge and clustering points together that
are at a similar elevation we can minimise the number of hills to run.

Limitations: If clusters become adjacent to each other on the global route then the transition between clusters may not be optimal as
the 'centre' of one cluster is used as the start/end point to enter the next cluster.

## Possible Further Work

1. Recursion. This is non recursive, so expands the Google API limit from 27 points (start+finish+25 waypoints) to a theoretical maxiumum
   of 2 + 25^2 = 627 points. A fully recursive solution would be unlimited (subject to API call budget)

1. Rectangular map-selection for adding points into clusters.

1. Display elevation graph - https://developers.google.com/maps/documentation/javascript/examples/elevation-paths
