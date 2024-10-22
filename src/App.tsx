import { SessionGraph } from "./components/SessionGraph";
import { Score } from "./scripts/scraper";
import sessionsJson from "./data/sessions.json";
import { ordinalizeNumber } from "./utils/ordinalizeNumber";
import React from "react";

function App() {
  return (
    <div style={{ width: "100%" }}>
      <div style={{ paddingLeft: 10 }}>
        <h2>Lugar Partisanship Index Data Visualization</h2>
        <p>
          <em>
            Data from Senator Lugar's{" "}
            <a href="https://www.thelugarcenter.org/ourwork-Bipartisan-Index.html">
              Bipartisan Index
            </a>
          </em>
          <br />
          <em>
            Note: this is a work in progress! any feedback welcome at{" "}
            <a href="mailto:ley.johnt@gmail.com">ley.johnt@gmail.com</a>
          </em>
        </p>

        <hr />

        <p>
          <h3>From the Lugar Center FAQ:</h3>

          <BlockQuote>
            The Bipartisan Index measures the frequency with which a Member
            co-sponsors a bill introduced by the opposite party and the
            frequency with which a Member’s own bills attract co-sponsors from
            the opposite party.
          </BlockQuote>

          <BlockQuote>
            Majority and minority members are compared to the average score of
            their respective groups over a 20-year baseline period that includes
            the 103rd through the 112th Congress (1993-2012). A positive score
            (a score above 0.00) indicates that a member has scored better on
            the Bipartisan Index formula than the average score for members of
            their respective group during that 20-year baseline period. A
            negative score indicates that a member falls below the average of
            their group for the 20-year baseline period. Scores above 1.0 are
            outstanding. Scores above .5 are very good. Conversely, scores below
            -.5 are poor. Scores below -1.0 are very poor. Each congressman is
            represented by 1 bar on the charts below. The width of the bar
            indicates the magnitude of their bipartisanship index score. Each
            chart is ordered from most positive, to most negative. The dark gap
            in the center of each chart represents the zero-point - where scores
            move from positive to negative. The index considers any score above
            zero a "good score".
          </BlockQuote>
        </p>

        <h3>Reading the Charts:</h3>
        <p>
          <ul>
            <li>
              Each bar on the chart represents one congressman's score for the
              session
            </li>
            <li>
              The width of the bar represents the magnitude of their score
            </li>
            <li>The chart is ordered from most positive to most negative</li>
            <li>
              The dark bar in the center of each chart represents the point
              where scores move from positive to negative.
            </li>
          </ul>
        </p>

        <p>Thanks for visiting!</p>
        <hr />
      </div>
      {sessionsJson.map(
        ({
          houseScores,
          senateScores,
          startYear,
          endYear,
          senateUrl,
          houseUrl,
          sessionNo,
        }) => {
          const sessionDescription = `${ordinalizeNumber(
            sessionNo
          )} Congress (${startYear}${endYear ? " - " + endYear : ""})`;

          return (
            <>
              <h3 style={{ color: "white", marginBottom: 10, marginLeft: 10 }}>
                {sessionDescription}&nbsp;
                <a href={senateUrl}>#</a>
                {!!houseUrl && <a href={houseUrl}>#</a>}
              </h3>

              <SessionGraph
                chamber="senate"
                scores={senateScores as Score[]}
                startYear={startYear}
              />

              {houseScores && (
                <SessionGraph
                  chamber="house"
                  scores={houseScores as Score[]}
                  startYear={startYear}
                />
              )}
            </>
          );
        }
      )}
    </div>
  );
}

type BlockQuoteProps = { children: React.ReactNode };
const BlockQuote = ({ children }: BlockQuoteProps) => (
  <p
    style={{
      paddingLeft: 10,
      border: "0px solid var(--color-link-blue)",
      borderLeftWidth: 2,
    }}
  >
    {children}
  </p>
);

export default App;
