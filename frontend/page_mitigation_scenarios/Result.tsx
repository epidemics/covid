import * as React from "react";

type Props = {
  url: string;
};

const Result: React.FC<Props> = ({ url }) => {
  return (
    <div className="mt-2">
      To view calculated scenario go to this{" "}
      <a href={url} target="_blank">
        page
      </a>
    </div>
  );
};

export default Result;
