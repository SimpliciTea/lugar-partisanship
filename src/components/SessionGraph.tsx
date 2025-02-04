import { Score } from "../scripts/scraper";
import { useDimensions } from "../hooks/useWindow";
import React, { useMemo, useRef } from "react";
import { ViewMode } from "../App";

type SessionGraphProps = {
  scores: Score[];
  chamber: "house" | "senate";
  startYear: number;
  viewMode: ViewMode;
};

export const SessionGraph = ({
  scores,
  chamber,
  startYear,
  viewMode,
}: SessionGraphProps) => {
  const containerElementRef = useRef<HTMLDivElement>(null);
  const containerDims = useDimensions(containerElementRef);

  const agg = useMemo(
    () => getAggregates(scores, startYear),
    [scores, startYear]
  );

  const dataSpace = useMemo(() => {
    const marginSpace = scores.length;
    const dataSpace = (containerDims.width ?? 0) - marginSpace - zeroLineWidth;
    return dataSpace;
  }, [scores, containerDims.width]);

  let zeroLinePassed = false;
  const graphHeight = viewMode === "standard" ? 400 : 50;

  return (
    <div style={{ width: "100%", position: "relative" }}>
      {viewMode === "standard" ? (
        <InfoBadges {...agg} chamber={chamber} />
      ) : (
        <InfoBar {...agg} chamber={chamber} />
      )}
      <div
        ref={containerElementRef}
        style={{
          display: "flex",
          flexWrap: "nowrap",
          width: "100%",
          height: graphHeight,
          marginBottom: 2,
        }}
      >
        {scores.map(({ score, partyAbbreviation }, i) => {
          const ratio = Math.abs(score) / agg.scoreSpace;

          const shouldPaintZeroLine = !zeroLinePassed && score < 0;
          if (shouldPaintZeroLine) zeroLinePassed = true;

          return (
            <>
              <div
                key={i}
                style={{
                  width: `calc(${ratio} * ${dataSpace}px)`,
                  height: graphHeight,
                  flexShrink: 0,
                  marginRight: 1,
                  flexGrow: 0,
                  backgroundColor: getPartyColor(partyAbbreviation),
                }}
              />
              {!!shouldPaintZeroLine && <ZeroLine />}
            </>
          );
        })}
      </div>
    </div>
  );
};

type InfoDisplayProps = ReturnType<typeof getAggregates> & {
  chamber: "house" | "senate";
};
const InfoBadges = ({
  majority,
  rCount,
  dCount,
  rSum,
  dSum,
  chamber,
}: InfoDisplayProps) => {
  const distDescription =
    majority === "R" ? `${rCount} - ${dCount}` : `${dCount} - ${rCount}`;

  const sectionStyle: React.CSSProperties = {
    backgroundColor: "var(--color-black)",
    padding: "2px 10px 5px",
    borderRadius: 2,
    marginLeft: 10,
    textTransform: "capitalize",
    color: "var(--color-white)",
    border: "solid 1px rgba(255, 255, 255, .2)",
  };

  return (
    <div style={{ display: "flex", position: "absolute", top: 10, left: 0 }}>
      <div style={sectionStyle}>{chamber}</div>
      <div style={sectionStyle}>
        Majority: <PartyBadge party={majority} /> {`(${distDescription})`}
      </div>
      <div style={sectionStyle}>
        Aggregate Scores: <PartyBadge party="D" /> {dSum.toFixed(2)}{" "}
        <PartyBadge party="R" /> {rSum.toFixed(2)}
      </div>
    </div>
  );
};

const InfoBar = ({
  majority,
  rCount,
  dCount,
  rSum,
  dSum,
  chamber,
}: InfoDisplayProps) => {
  const distDescription =
    majority === "R" ? `${rCount} - ${dCount}` : `${dCount} - ${rCount}`;

  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: "bold",
        backgroundColor: "var(--color-black)",
        position: "absolute",
        bottom: 0,
        right: 0,
        // borderBottom: "1px solid rgba(255, 255, 255, .5)",
        display: "flex",
        padding: 2,
        textTransform: "uppercase",
        lineHeight: "1em",
      }}
    >
      {chamber}
      <Separator />
      Majority:&nbsp;
      <PartyBadge party={majority} />
      &nbsp;{`(${distDescription})`}
      <Separator />
      Aggregate Scores:&nbsp;
      <PartyBadge party="D" />
      &nbsp;{dSum.toFixed(2)}&nbsp;
      <PartyBadge party="R" />
      &nbsp;{rSum.toFixed(2)}
    </div>
  );
};

type PartyBadgeProps = { party: "R" | "D" };
const PartyBadge = ({ party }: PartyBadgeProps) => (
  <div
    style={{
      display: "inline-block",
      height: ".81em",
      width: ".81em",
      borderRadius: 2,
      border: "1px solid var(--color-white)",
      verticalAlign: "-9%",
      backgroundColor: getPartyColor(party),
    }}
  />
);

const Separator = () => <div style={{ margin: "0px 10px" }}></div>;

const zeroLineWidth = 10;
const ZeroLine = () => (
  <div
    style={{
      height: 406,
      position: "relative",
      top: -3,
      flexShrink: 0,
      width: zeroLineWidth,
    }}
  />
);

const getAggregates = (scores: Score[], startYear: number) => {
  let scoreSpace = 0;
  let dCount = 0;
  let rCount = 0;
  let dSum = 0;
  let rSum = 0;

  for (const score of scores) {
    scoreSpace += Math.abs(score.score);
    if (score.partyAbbreviation === "R") {
      rCount++;
      rSum += score.score;
    } else {
      dCount++;
      dSum += score.score;
    }
  }

  const majority: "R" | "D" | null =
    dCount > rCount
      ? "D"
      : rCount > dCount
      ? "R"
      : getWhiteHouseParty(startYear);

  return { scoreSpace, dCount, rCount, dSum, rSum, majority };
};

const getPartyColor = (abbr: "R" | "D") =>
  abbr === "R" ? "var(--color-red)" : "var(--color-blue)";

// dataset goes back to 1993
const getWhiteHouseParty = (year: number): "R" | "D" => {
  if (year >= 2021) return "D"; // Biden
  if (year >= 2017) return "R"; // Trump
  if (year >= 2009) return "D"; // Obama
  if (year >= 2001) return "R"; // Bush Jr.
  if (year >= 1993) return "D"; // Clinton
  return "R"; // Bush Sr.
};
