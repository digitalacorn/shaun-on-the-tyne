import * as React from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { PropTypes } from "prop-types";
import routeImg from '../public/livetrackroute.jpg'

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

export default function IntroDialog({ open, setOpen }) {

    return (
        <BootstrapDialog
            maxWidth={'lg'}
            onClose={() => setOpen(false)}
            aria-labelledby="customized-dialog-title"
            open={open}
        >
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                Shaun on the Tyne - Running Challenge
            </DialogTitle>
            <IconButton
                aria-label="close"
                onClick={() => setOpen(false)}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                }}
            >
                <CloseIcon />
            </IconButton>
            <DialogContent dividers>
                <h2>This challenge was completed on 22nd September 2023.</h2>
                <p>Final running distance: <b>29.22miles</b>. Time: <b>6h24m</b>. ~18 Shauns collected per hour. ~4 Shauns per mile.</p>
                <p>See the <a href="https://www.strava.com/activities/9899015575" target="_blank>">Strava Activity</a></p>
                <h4>The challenge</h4>
                <p>The challenge was to run and collect all 115 &ldquo;<a href="https://www.shaunonthetyne.co.uk/" target="_blank" rel="noreferrer">Shaun on the Tyne</a>&rdquo; sheep in and around Newcastle.
                    And the secondary challenge was to
                    find the best route. </p><p>Google Maps API will only allow 25 waypoints and this requires many more. This tool allows the user
                        to build &ldquo;clusters&rdquo; of  waypoints (most Shauns were located in the town centre) and then the api will find the best route between unclustered points
                        and the centre-points of the clusters. Then we find the best route through each cluster and stitch the whole route together.

                </p><p>Additionally, careful
                    construction of clusters encouraged the route to be more forgiving on the elevation profile (Newcastle has some steep hils that you don&apos;t want
                    to go up and down too many times) </p>
                <p>We used the Airport &rarr; Gosforth route, but slightly adjusted it on the day for safety running away from the airport, for convenience through town,
                    for lunch, and by mistake going over Byker bridge.</p>
                <h4>How to use this tool</h4>
                <p>Expand the controlls using the burger menu at the top left. Select a route preset, or configure start, end and clusters. Then scroll
                    down and click to calculate the route.
                </p>
                <p>
                    <img src="https://dgtzuqphqg23d.cloudfront.net/BHAWIZesx3nVUuAkHrVK9HWbVELjePouNEds7j8bP5Q-2048x1536.jpg" style={{ maxWidth: "100%" }} />
                    <img src={routeImg} style={{ maxWidth: "100%" }} />
                </p>

            </DialogContent>
            <DialogActions>
                <div>&copy; <a href="https://www.digitalacorn.co.uk/" target="_blank" rel="noreferrer">Peter Davies</a> 2023.</div>
                <div style={{ flex: '1 0 0' }} />
                <Button onClick={() => setOpen(false)}>
                    Explore the project
                </Button>
            </DialogActions>
        </BootstrapDialog >
    );
}

IntroDialog.propTypes = {
    setOpen: PropTypes.func,
    open: PropTypes.bool,
}