
export type ModelTrace = {
    group: string;
    key: string;
    name: string;
    infected: Array<number>;
    recovered: Array<number>;
};

export type ModelTraces = {
    date_index: string[];
    traces: Array<ModelTrace>;
};

export interface Root {
    created: string;
    created_by: string;
    comment?: string;
    date_resample: string;
    regions: {[code: string]: Region};
}

export interface Region {
    data: {
        Rates?: Rates,
        JohnsHopkins?: JohnsHopkins;
        Foretold?: Foretold;
        Timezones: string[];
        AgeDist?: {[bracket: string]: number}
        TracesV3: string;
        Capacity: Capacity
    };
    data_url: string;
    Name: string;
    Level: string;
    OfficialName?: string;
    Population?: string;
    Lat?: number;
    Lon?: number;
    M49Code?: string;
    ContinentCode?: string;
    SubregionCode?: string;
    CountryCode?: string;
    CountryCodeISOa3?: string;
}

export interface Rates {
    CaseFatalityRate: number,
    Critical: number,
    Hospitalization: number
}


export interface JohnsHopkins {
    Date: string[],
    Recovered: number[],
    Confirmed: number[],
    Deaths: number[],
    Active: number[]
}

export interface Foretold {
    Date: string[],
    Mean: number[],
    Variance: number[],
    "0.05": number[],
    "0.50": number[],
    "0.95": number[],
}

export interface Capacity {
    CapacityActiveInfectionPercent: number;
    CapacityNewInfectionsPerDayPer1000: number;
    CriticalBedsPer100k: number;
    Source: string;
    Year: number;
}