export class CloneReport {

    private _cloneDictionary: CloneDictionary;
    get cloneDictionary() {
        return this._cloneDictionary;
    }
    set cloneDictionary(value: CloneDictionary) {
        this._cloneDictionary = value;
        this.obtainDatasetInfo(value);
    }

    globalIdDictionary: GlobalIdDictionary;

    info = new CloneReportInfo();

    get hasLoaded() {
        return this.cloneDictionary && this.globalIdDictionary && this.info.minRevision != undefined && this.info.maxRevision != undefined;
    }

    constructor(cloneDictionary: CloneDictionary, globalIdDictionary: GlobalIdDictionary) {
        this.cloneDictionary = cloneDictionary;
        this.globalIdDictionary = globalIdDictionary;
    }

    private obtainDatasetInfo(cloneDictionary: CloneDictionary) {
        const cloneDictionaryKeys = Object.keys(cloneDictionary).map(d => parseInt(d));

        this.info.minRevision = Math.min(...cloneDictionaryKeys);
        this.info.maxRevision = Math.max(...cloneDictionaryKeys);
    }
}

export class GlobalIdDictionary {
    [globalId: number]: {
        [revisionId: number]: CloneInstance
    }
}

export class CloneDictionary {
    [revisionId: number]: {
        [filePath: string]: {
            [startLine: number]: CloneInstance
        }
    }
}

export class CloneReportInfo {
    minRevision: number;
    maxRevision: number;
}

export class CloneInstance {
    pcid: number;
    start_line: number;
    end_line: number;
    file: string;
    class_id: number;
    global_id: number;
    change_count: number;
    global_change_count?: number;
}
