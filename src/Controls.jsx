import React, { useState } from 'react'
import { PropTypes } from "prop-types";

import { FormControl, InputLabel, MenuItem, Select, Typography, Button, IconButton, OutlinedInput, Box, Chip, useTheme, ButtonGroup, Grid } from '@mui/material'
import { shauns } from './data/shauns';
import { presets } from './data/presets';
import DeleteIcon from '@mui/icons-material/Delete';
import { useShauns } from './useShauns';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

const FormRow = ({ children }) => (<div style={{ marginBottom: "20px" }} >{children}</div>);
FormRow.propTypes = {
    children: PropTypes.node.isRequired,
}

function getStyles(id, shauns, theme) {
    return {
        fontWeight:
            shauns.indexOf(id) === -1
                ? theme.typography.fontWeightRegular
                : theme.typography.fontWeightMedium,
    };
}

const MAX_WAYPOINTS = 25;

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};


export function Controls({ calculateRoute, hasRoute, clearRoute, close }) {

    const theme = useTheme();

    const { start, setStart, finish, setFinish, clusters, setClusters, unClusteredShauns, validClusters, usedShaun, shaunColour } = useShauns();


    const handleStartChange = (event) => {
        setStart(event.target.value);
    };
    const handleFinishChange = (event) => {
        setFinish(event.target.value);
    };

    const [calculating, setCalculating] = useState(false);

    const handleCalculateRoute = () => {
        (async () => {
            setCalculating(true);
            try {
                await calculateRoute(start, finish, clusters);
            } catch (err) {
                console.error(err);
            }
            setCalculating(false);
            close();
        })();
    };

    const handleSelectPreset = (index) => {
        const preset = presets[index];
        setStart(preset.data.start);
        setFinish(preset.data.finish);
        setClusters(preset.data.clusters.map((cluster) => [...cluster]));
    };


    const errors = [];

    if (unClusteredShauns.length + validClusters.length > MAX_WAYPOINTS) {
        errors.push(`Too many unclustered Shauns (${unClusteredShauns.length + validClusters.length - MAX_WAYPOINTS}x)`);
    }

    return (
        <>
            <Grid container justifyContent="flex-end">

                <IconButton onClick={close}>
                    <CloseIcon />
                </IconButton>
            </Grid>

            <div style={{ minWidth: "400px", padding: "0 20px 20px 20px" }}>
                <FormRow>
                    <Typography variant="h3">Route Planning</Typography>
                </FormRow>

                <FormRow>
                    <InputLabel htmlFor="preset">Select Preset</InputLabel>
                    <ButtonGroup
                        id="preset"
                        disabled={calculating} variant="outlined" size="small" aria-label="small button group">
                        {presets.map((preset, index) => (<Button key={index} value={index} onClick={() => handleSelectPreset(index)}>{preset.name}</Button>))}
                    </ButtonGroup>

                </FormRow>


                <FormRow>
                    <Typography variant="h5">Endpoints</Typography>
                </FormRow>


                <FormRow>
                    <FormControl size="small" fullWidth>
                        <InputLabel id="start-select-label">Start</InputLabel>
                        <Select
                            labelId="start-select-label"
                            id="start-select"
                            value={start || ''}
                            label="Start"
                            onChange={handleStartChange}
                        >
                            {shauns.map((shaun) => (<MenuItem key={shaun.id} value={shaun.id} disabled={usedShaun(shaun.id) && !shaun.id === finish}>{`${shaun.id}. ${shaun.address}`}</MenuItem>))}
                        </Select>
                    </FormControl>
                </FormRow>

                <FormRow>

                    <FormControl size="small" fullWidth>
                        <InputLabel id="finish-select-label">Finish</InputLabel>
                        <Select
                            labelId="finish-select-label"
                            id="finish-select"
                            value={finish || ''}
                            label="Finish"
                            onChange={handleFinishChange}
                        >
                            {shauns.map((shaun) => (<MenuItem key={shaun.id} value={shaun.id} disabled={usedShaun(shaun.id) && !shaun.id === start}>{`${shaun.id}. ${shaun.address}`}</MenuItem>))}
                        </Select>
                    </FormControl>
                </FormRow>

                <hr />

                <FormRow>
                    <Typography variant="h5">Clusters</Typography>
                </FormRow>

                {clusters.map((cluster, index) => {

                    const removeShaun = (clusterPos) => {
                        const updated = [...clusters];
                        updated[index].splice(clusterPos, 1);
                        setClusters(updated);
                    }

                    const handleChange = (event) => {
                        const {
                            target: { value },
                        } = event;
                        const updated = [...clusters];
                        updated[index] = typeof value === 'string' ? value.split(',') : value;
                        setClusters(updated);
                    };
                    return (
                        <FormRow key={index}>
                            <FormControl sx={{ m: 1, width: 300 }}>
                                <InputLabel id="cluster-select-label">Cluster Members</InputLabel>
                                <Select
                                    labelId="cluster-select-label"
                                    id="cluster-select"
                                    multiple
                                    value={cluster}
                                    onChange={handleChange}
                                    input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
                                    renderValue={(cluster) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {cluster.map((shaunId, clusterPos) => {
                                                const shaun = shauns.find((shaun) => shaunId === shaun.id);
                                                return (
                                                    <Chip key={shaun.id} label={`${shaun.id}`} sx={{ backgroundColor: shaunColour(shaun.id) }} onDelete={() => {
                                                        removeShaun(clusterPos)
                                                    }} onMouseDown={(event) => {
                                                        event.stopPropagation();
                                                    }} />
                                                )
                                            })}
                                        </Box>
                                    )}
                                    MenuProps={MenuProps}
                                >
                                    {unClusteredShauns.map((shaun) => (
                                        <MenuItem
                                            key={shaun.id}
                                            value={shaun.id}
                                            style={getStyles(shaun.id, shauns, theme)}
                                        >
                                            {`${shaun.id}. ${shaun.title}`}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <IconButton aria-label="remove this cluster" onClick={() => {
                                const copy = [...clusters];
                                copy.splice(index, 1);
                                setClusters(copy)
                            }}>
                                <DeleteIcon />
                            </IconButton>
                        </FormRow>
                    )
                })}
                <FormRow >

                    <Grid container justifyContent="center">
                        <Button endIcon={<AddIcon />} size="small" color="secondary" variant="contained" onClick={() => setClusters([...clusters, []])}>Add cluster</Button>
                    </Grid>
                    <hr />
                </FormRow>

                <FormRow >
                    <div style={{ width: "100%", fontSize: "small", marginBottom: "1rem", color: "red" }}>
                        {errors && errors.map((error, index) => (<span key={index}>{error}</span>))}
                    </div>
                    <Grid container justifyContent="flex-end">

                        {
                            hasRoute ? (<Button variant="outlined" onClick={clearRoute}>Clear Route</Button>)
                                : (<Button endIcon={<DirectionsRunIcon />} variant="contained" disabled={calculating || Boolean(errors.length)} onClick={handleCalculateRoute}>Calculate Route</Button>)
                        }
                    </Grid>
                </FormRow>

            </div >
        </>
    );
}

Controls.propTypes = {
    close: PropTypes.func,
    calculateRoute: PropTypes.func,
    clearRoute: PropTypes.func,
    hasRoute: PropTypes.bool,
}