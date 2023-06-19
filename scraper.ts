import { chromium, firefox, webkit } from "playwright";
import { appendFileSync, writeFileSync } from "fs";

export async function main(){
    const browser = await firefox.launch({headless: false})
    const page =  await browser.newPage() 
} 