import { Region, MainInfo } from "../models";
import * as React from "react";
import { string_score } from "../string_score";
import {
  classNames,
  formatAbsoluteInteger,
  formatSIInteger,
  formatDate,
} from "../helpers";
import { Dropdown } from "./Dropdown";
import { LocationContext } from "./LocationContext";
import { QuestionTooltip } from "./QuestionTooltip";

type Props = {
  regions: Array<Region>;
  selected: Region | null;
  mainInfo: MainInfo;
  id: string;
  onSelect: (region: Region, url: string) => void;
};

let formatCurrentInfected = formatSIInteger(3);

export function RegionSelector({
  id,
  regions,
  mainInfo,
  selected,
  onSelect,
}: Props) {
  const [query, setQuery] = React.useState<string>("");
  const [focused, setFocused] = React.useState<number>(-1);
  const [show, setShow] = React.useState<boolean>(false);
  const location = React.useContext(LocationContext);

  let filterRef = React.useRef<HTMLInputElement>(null);

  function onToggle(show: boolean) {
    if (show === false) {
      setShow(false);
      if (query !== "") {
        setQuery("");
        setFocused(-1);
      }
    } else {
      setShow(true);
    }
  }

  function doChange({ region, href }: { region: Region; href: string }) {
    onSelect(region, href);
    onToggle(false);
  }

  function updateQuery(query: string) {
    setQuery(query);
    setFocused(0);
  }

  React.useEffect(() => {
    let $filter = filterRef.current;
    if (show && $filter) {
      $filter.focus();
    }
  }, [show]);

  // make a copy of the regions and add scores
  let list = React.useMemo<
    Array<{ region: Region; score: number; href: string }>
  >(
    () =>
      regions.map((region) => ({
        region,
        score: 0,
        href: location({ region: region.code }),
      })),
    [regions, location]
  );

  // whenever `list` and `query` changes we sort the list
  React.useMemo(() => {
    // we score each region item with how good the region name matches the query
    list.forEach((item) => {
      item.score = string_score(item.region.name, query);
    });

    // then we sort the list
    list.sort((a, b) => {
      // first by score
      if (a.score < b.score) return 1;
      if (a.score > b.score) return -1;
      // then alphabetically
      if (a.region.name > b.region.name) return 1;
      if (a.region.name < b.region.name) return -1;
      return 0;
    });
  }, [list, query]);

  // prepare the list to be rendered
  let dropdownEntries = [];
  let bestScore = list?.[0]?.score ?? 0;
  for (let index = 0; index < list.length; index++) {
    let item = list[index];
    let { score, region, href } = item;

    let show = score >= bestScore / 1000;

    // if we have good matches we only want to show those
    if (!show) {
      if (focused >= index) {
        // correct the focus offset so it does not exceed the list
        setFocused(index - 1);
      }
    }

    const active = selected === region || focused === index;
    dropdownEntries.push(
      <a
        style={{ display: show ? "block" : "none" }}
        key={region.code}
        href={href}
        onClick={(evt) => {
          doChange(item);
          evt.preventDefault();
        }}
        className={classNames({ "dropdown-item": true, active })}
      >
        {region.name}
      </a>
    );
  }

  function handleKeyDown(evt: React.KeyboardEvent) {
    if (evt.key === "Enter") {
      doChange(list[focused]);
    } else if (evt.key === "ArrowUp") {
      setFocused(Math.max(focused - 1, 0));
    } else if (evt.key === "ArrowDown") {
      setFocused(Math.min(focused + 1, list.length - 1));
    } else if (evt.key === "Escape") {
      onToggle(false);
    }
  }

  let button = (
    <>
      <span className="dropdown-label">{selected?.name ?? <>...</>}</span>{" "}
      <span className="caret"></span>
    </>
  );

  let current = selected?.current;
  let generated = current?.date ?? mainInfo.generated;

  return (
    <div className="top-row">
      <Dropdown show={show} id={id} button={button} onToggle={onToggle}>
        <div className="px-3 py-2">
          <input
            ref={filterRef}
            className="form-control"
            onKeyDown={handleKeyDown}
            onChange={(evt) => updateQuery(evt.target.value)}
            value={query}
            type="text"
            placeholder="Filter..."
          />
        </div>
        <div className="dropdown-divider"></div>
        <div
          className="dropdown-list"
          style={{
            overflowY: "auto",
            maxHeight: "50vh",
          }}
        >
          {dropdownEntries}
        </div>
      </Dropdown>
      <div className="active-infections-block">
        {current ? (
          <>
            <span className="number-subheader" id="infections-date">
              <span style={{ color: "#aaa" }}>Model last updated on</span>{" "}
              {generated ? formatDate(generated) : <>&mdash;</>}
            </span>
            <div className="active-infections">
              Active Infections:{" "}
              <span className="infections-estimated" id="infections-estimated">
                {current.infected ? (
                  formatCurrentInfected(current.infected)
                ) : (
                  <>&mdash;</>
                )}
              </span>
              <a
                href="#case-count-explanation"
                aria-label="Explanation about the case count"
              >
                <QuestionTooltip />
              </a>
            </div>
          </>
        ) : (
          ""
        )}
        <div className="infections-confirmed">
          <span style={{ color: "#aaa" }}>Confirmed Infections:</span>{" "}
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
