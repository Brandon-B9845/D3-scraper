import { chromium, firefox, webkit } from "playwright";
import { appendFileSync, writeFileSync } from "fs";

interface LocationObj {
  name?: string;
  address?: string;
  latLng?: string;
  descriptionShort?: string;
  descriptionLong?: string;
  imageUrl?: string;
  review?: string;
  reviewCount?: string;
  phone?: string;
  website?: string;
}

export async function main() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://www.flavortownusa.com/locations?page=1");
  await cycleCards(page);
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
      await LocationObjBuilder(page)
      await console.log("I made an object WooHoo!");
      //go back 1 page
      await page.goBack();
    }
  }
  //click the next button
  console.log("check pleeassseee");
};


//document.querySelector('div:nth-child(2) > div:nth-child(4) > div > div') <-- this gets you into the column
const LocationObjBuilder = async (page: any) => {
    await page.waitForSelector(
      "div:nth-child(2) > div:nth-child(4) > div > div"
    )
    const children = await page.$$(
      "div:nth-child(2) > div:nth-child(4) > div > div >div:nth-child(3) :not(.listing-links-container):not(.contact-links):has(*)"
    );

    const locationObj = await page.evaluate((children: any) => {
      const name = document.querySelector(
        "div:nth-child(2) > div:nth-child(4) > div > div > div > div > h1"
      )?.innerHTML;
      const address = document.querySelector(
        "div:nth-child(2) > div:nth-child(4) > div > div > div > div > span"
      )?.textContent;

      for (const child of children) {
        const textContent = child.textContent();
        console.log(textContent);
      }
      const locationObj = {
        name: name,
        address: address,
      };
      return locationObj;
    });
    console.log(locationObj)
    return locationObj
}