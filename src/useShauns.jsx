

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

    return {
        start, setStart, finish, setFinish, clusters, setClusters, resetAll, clusteredShauns, unClusteredShauns, validClusters, usedShaun
    }
}