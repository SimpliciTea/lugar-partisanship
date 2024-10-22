import { SessionGraph } from "./components/SessionGraph";
import { Score } from "./scripts/scraper";
import sessionsJson from "./data/sessions.json";
import { ordinalizeNumber } from "./utils/ordinalizeNumber";

function App() {
  return (
    <div style={{ width: "100%" }}>
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

export default App;
