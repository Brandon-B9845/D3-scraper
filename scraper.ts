import { chromium, firefox, webkit } from "playwright";
import { appendFileSync, writeFileSync } from "fs";

interface LocationObj {
  name?: string;
  address?: string;
  descriptionShort?: string;
  descriptionLong?: string;
  imageUrl?: string;
  website?: string;
}

export async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto("https://www.flavortownusa.com/locations?page=70");
  const nextBtn = page.evaluate(() => {
    document.querySelector(".PagedList-skipToNext > a");
  });
  while (nextBtn) {
    await cycleCards(page);
  }
  console.log('check pleeeasssee')
}

const cycleCards = async (page: any) => {
  for (let i = 2; i < 20; i++) {
    //skip 5,10,and 15
    if (i % 5 === 0) {
      console.log("fuck yo margins");
    }
    //click on the initial card,
    else {
      await page.click(
        `div >div:nth-child(4) > div:nth-child(2) >div:nth-child(${i}) > div > a`
      );
      //TODO build Obj
      const locationObj = await LocationObjBuilder(page);
      console.log(locationObj)
      await write(locationObj)
    console.log("I made an object WooHoo!");
      //go back 1 page
      await page.goBack();
    }
  }
  //click the next button
  await page.waitForSelector(".PagedList-skipToNext > a");
  await page.click(".PagedList-skipToNext > a");
};

//document.querySelector('div:nth-child(2) > div:nth-child(4) > div > div') <-- this gets you into the column
const LocationObjBuilder = async (page: any) => {
  await page.waitForSelector("div:nth-child(2) > div:nth-child(4) > div > div");

  const textContents = await page.evaluate(() => {
    const parentDiv = document.querySelector("#listing-overview");
    const divsWithoutClass = Array.from(
      parentDiv?.querySelectorAll("div:not([class])") ?? null
    );

    return divsWithoutClass.map((div) => div?.textContent);
  });

  const description = textContents.join("");

  const href = await page.evaluate(() => {
    const anchor = document.querySelectorAll(
      "#listing-photos > div > div >div > a"
    );
    const href = Array.from(
      anchor,
      (anchor) => (anchor as HTMLAnchorElement)?.href
    );
    return href;
  });

  const locationObj = {
    name: await page.evaluate(
      () => document.querySelector(".listing-titlebar-title > h1")?.textContent
    ),
    address: await page.evaluate(
      () =>
        document.querySelector(".listing-titlebar-title > span")?.textContent
    ),
    descriptionShort: await page.evaluate(() => {
      return document.querySelector("#listing-overview > div").textContent;

    }),
    descriptionLong: description,
   
    website: await page.evaluate(() => {
      return document.querySelector(
        ".listing-links-container > ul > li:last-child > a"
      )?.textContent;
    }),
    imageUrl: href ? href : null,
  };
  return locationObj;
};


const write = async (data) => {
  try {
    const cleanData = sanitize(data);
    const formattedData: string = Object.values(cleanData).join(";");

    appendFileSync("DinersDrivein.csv", formattedData + "\n");
  } catch (e) {
    console.log("write");
    console.error(e);
  }
};

function sanitize(obj: any): any {
  try {
    return Object.keys(obj).reduce((accum, currentKey) => {
      let value = obj[currentKey];
      if (typeof value === "string") {
        value = (value as string)?.replace(/;/g, "");
      }
      return { ...accum, [currentKey]: value };
    }, {});
  } catch (e) {
    console.log("sanitize");
    console.error(e);
  }
}