import puppeteer, { Page } from "puppeteer";
import fs from "fs";
import path from "path";
import url from "url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "..", "data");

type SessionMeta = {
  sessionNo: number;
  startYear: number;
  endYear?: number;
  senateSlug: string;
  houseSlug: string;
};
const sessionMetas: SessionMeta[] = [
  // 118th (first session only)
  {
    sessionNo: 118,
    startYear: 2023,
    houseSlug: "ourwork-86.html",
    senateSlug: "ourwork-85.html",
  },

  // 117th
  {
    sessionNo: 117,
    startYear: 2021,
    endYear: 2022,
    senateSlug: "ourwork-84.html",
    houseSlug: "ourwork-83.html",
  },

  // 116th
  {
    sessionNo: 116,
    startYear: 2019,
    endYear: 2020,
    senateSlug: "ourwork-80.html",
    houseSlug: "ourwork-79.html",
  },

  // 115th
  {
    sessionNo: 115,
    startYear: 2017,
    endYear: 2018,
    senateSlug: "ourwork-69.html",
    houseSlug: "ourwork-68.html",
  },

  // 114th
  {
    sessionNo: 114,
    startYear: 2015,
    endYear: 2016,
    senateSlug: "ourwork-54.html",
    houseSlug: "ourwork-53.html",
  },

  // 113th
  {
    sessionNo: 113,
    startYear: 2013,
    endYear: 2014,
    senateSlug: "ourwork-41.html",
    houseSlug: "ourwork-40.html",
  },
];

const senateHistoricAggregateSlug = "ourwork-47.html";

export type Score = {
  number: number;
  firstName: string;
  lastName: string;
  stateAbbreviation: string;
  partyAbbreviation: "R" | "D";
  score: number;
};

export type Session = {
  startYear: number;
  endYear: number | null;
  sessionNo: number;
  houseScores?: Score[];
  senateScores?: Score[];
  houseUrl?: string;
  senateUrl?: string;
};

const baseUrl = "https://www.thelugarcenter.org/";
const outFilePath = path.resolve(dataDir, "sessions.json");

const sessions: Session[] = [];

export const scrape = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
  });
  const page = await browser.newPage();

  /**
   * Scrape shared pattern pages
   */
  for (const sessionMeta of sessionMetas) {
    const senateUrl = `${baseUrl}${sessionMeta.senateSlug}`;
    const houseUrl = `${baseUrl}${sessionMeta.houseSlug}`;

    const senateTableData = await scrapeSingleTablePage(page, senateUrl);
    const houseTableData = await scrapeSingleTablePage(page, houseUrl);

    const senateScores = parseTableData(senateTableData);
    const houseScores = parseTableData(houseTableData);

    sessions.push({
      senateScores,
      houseScores,
      startYear: sessionMeta.startYear,
      endYear: sessionMeta.endYear ?? null,
      sessionNo: sessionMeta.sessionNo,
      senateUrl,
      houseUrl,
    });
  }

  /**
   * Scrape senate historic aggregate page
   */
  const senateUrl = `${baseUrl}${senateHistoricAggregateSlug}`;
  const allTableData = await scrapeManyTablePage(page, senateUrl);

  // Sessions on this page start at 112th and move backwards table to table
  let sessionNo = 112;
  let year = 2012;
  for (const tableData of allTableData) {
    const senateScores = parseTableData(tableData);
    sessions.push({
      senateScores,
      endYear: year--,
      startYear: year--,
      sessionNo: sessionNo--,
      senateUrl: senateUrl,
    });
  }

  fs.rmSync(outFilePath, { force: true });
  fs.writeFileSync(outFilePath, JSON.stringify(sessions, null, 2));

  await browser.close();
};

const scrapeSingleTablePage = async (page: Page, pageUrl: string) => {
  await page.goto(pageUrl, { waitUntil: "domcontentloaded" });

  const tableData = await page.evaluate(async () => {
    const tableElement = document.querySelector('[cellpadding="2"]');
    const rows = tableElement?.querySelectorAll("tr");
    if (!rows) return null;

    const data: string[][] = [];
    for (const row of rows) {
      const cellContents = Array.from(row.querySelectorAll("td")).map(
        (cell) => cell.textContent?.trim() || ""
      );
      data.push(cellContents);
    }

    return data;
  });

  if (!tableData) throw new Error(`Failed to scrape data for slug: ${pageUrl}`);

  return tableData;
};

const scrapeManyTablePage = async (page: Page, pageUrl: string) => {
  await page.goto(pageUrl, { waitUntil: "domcontentloaded" });
  const allTableData = await page.evaluate(async () => {
    const tableElements = document.querySelectorAll('[cellpadding="2"]');
    const parsed: string[][][] = [];

    for (const tableElement of tableElements) {
      const rows = tableElement?.querySelectorAll("tr");
      if (!rows) return null;

      const tableData: string[][] = [];
      for (const row of rows) {
        const cellContents = Array.from(row.querySelectorAll("td")).map(
          (cell) => cell.textContent?.trim() || ""
        );
        tableData.push(cellContents);
      }

      parsed.push(tableData);
    }

    return parsed;
  });

  if (!allTableData)
    throw new Error(`Failed to scrape data for slug: ${pageUrl}`);

  return allTableData;
};

const parseTableData = (tableData: string[][]) => {
  const result: Score[] = [];

  for (let i = 1; i < tableData.length; i++) {
    const row = tableData[i];

    // There are 13 columns, but we only want the first 6 (2nd 6 are same data sorted alpha)
    for (let i = 0; i < row.length; i += 13) {
      if (i + 12 >= row.length) {
        break;
      }

      const firstSet = {
        number: parseInt(row[i], 10),
        firstName: row[i + 1],
        lastName: row[i + 2],
        stateAbbreviation: row[i + 3],
        partyAbbreviation: row[i + 4] as "R" | "D",
        score: parseFloat(row[i + 5]),
      };

      result.push(firstSet);
    }
  }

  return result;
};

scrape();
