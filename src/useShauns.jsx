

import { shauns } from './data/shauns';
import { useLocalStorage } from 'usehooks-ts'

export function useShauns() {
    const [start, setStart] = useLocalStorage('startingShaun', 0);
    const [finish, setFinish] = useLocalStorage('finishingShaun', 0);
    const [clusters, setClusters] = useLocalStorage('shaunClusters', []);

    const resetAll = () => {
        setStart(0);
        setFinish(0);
        setClusters([]);
        if (window.localStorage) {
            window.localStorage.removeItem("startingShaun");
            window.localStorage.removeItem("finishingShaun");
            window.localStorage.removeItem("shaunClusters");
        }
    }

    /* all shaun instances in clusters */
    const clusteredShauns = clusters.reduce((acc, cluster) => ([...acc, ...cluster]), []);
    /* seans not in clusters or start or finish */
    const unClusteredShauns = shauns.filter((shaun) => ![...clusteredShauns, start, finish].includes(shaun.id));
    const validClusters = clusters.filter((cluster) => cluster.length > 0);
    const usedShaun = (id) => !unClusteredShauns.map(shaun => shaun.id).includes(id);

    const clusterColour = (clusterNum) => clusterNum < 0 ? "white" : ['#FFFEC4', '#DFCCFB', '#C8E4B2', '#FDCEDF', '#C0DEFF', '#FFE7CC'][clusterNum % 6];

    const shaunsClusterId = (shaunId) => {
        let id = -1;
        validClusters.forEach((cluster, index) => {
            if (cluster.includes(shaunId)) id = index;
        });
        return id;
    }

    const shaunColour = (shaunId) => clusteredShauns.includes(shaunId) ? clusterColour(shaunsClusterId(shaunId)) : 'white';

    return {
        start, setStart, finish, setFinish, clusters, setClusters, resetAll, clusteredShauns, unClusteredShauns, validClusters, usedShaun, shaunColour, clusterColour
    }
}