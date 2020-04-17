import { Region } from "../models";
import * as React from "react";
import { formatSIInteger, formatAbsoluteInteger } from "../helpers";
import { RegionDropdown } from "./RegionDropdown";

type Props = {
  regions: Array<Region>;
  selected: Region | null;
  onSelect: (region: Region) => void;
};

let formatCurrentInfected = formatSIInteger(3);

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const formatDate = (date: Date = new Date()) =>
  `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

export function RegionSelector({ regions, selected, onSelect }: Props) {
  return (
    <div className="top-row">
      <RegionDropdown
        id="regionDropdown"
        regions={regions}
        selected={selected}
        onSelect={onSelect}
      />
      <div className="active-infections-block">
        <span className="number-subheader" id="infections-date">
          {formatDate(selected?.reported?.last?.date)}
        </span>
        <div className="active-infections">
          Active Infections:{" "}
          <span className="infections-estimated" id="infections-estimated">
            {selected ? (
              formatCurrentInfected(selected.current.infected)
            ) : (
              <>&mdash;</>
            )}
          </span>
          <a href="#case-count-explanation">
            <span className="question-tooltip">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="18"
                viewBox="0 0 24 24"
                width="18"
              >
                <path d="M0 0h24v24H0z" fill="none" />
                <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z" />
              </svg>
            </span>
          </a>
        </div>
        <div className="infections-confirmed">
          Confirmed Infections:{" "}
          <span id="infections-confirmed">
            {formatAbsoluteInteger(selected?.reported?.last?.confirmed)}
          </span>
        </div>
      </div>

      <div className="population-block">
        <div className="number-subheader">Population</div>
        <div className="infections-population">
          <span id="infections-population">
            {formatAbsoluteInteger(selected?.population)}
          </span>
        </div>
      </div>
    </div>
  );
}
