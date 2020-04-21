import { classNames } from "../helpers";
import { PropsWithChildren } from "react";
import * as React from "react";

type Props = {
  button: JSX.Element;
  id: string;
  onToggle: (show: boolean) => void;
  show: boolean;
};

export function Dropdown(props: PropsWithChildren<Props>) {
  const { button, children, id, show, onToggle } = props;

  let containerRef = React.useRef<HTMLDivElement>(null);
  let buttonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const handler = (event: MouseEvent) => {
      let element = containerRef.current;
      let clickedInside =
        element &&
        event.target instanceof Node &&
        element.contains(event.target);

      if (!clickedInside) {
        onToggle(false);
      }
    };

    document.addEventListener("click", handler);

    return () => {
      document.removeEventListener("click", handler);
    };
  });

  return (
    <div className={classNames({ show, dropdown: true })} ref={containerRef}>
      <button
        className="btn btn-primary dropdown-toggle medium dropdown-caret-styling region-dropdown"
        type="button"
        onClick={() => onToggle(!show)}
        ref={buttonRef}
        aria-haspopup="true"
        aria-expanded={show}
        id={id}
      >
        {button}
      </button>
      <div
        className={classNames("dropdown-menu", { show })}
        aria-labelledby={id}
        x-placement="bottom-start"
      >
        {children}
      </div>
    </div>
  );
}
