import { db } from "./db";
import config from "../site.config.json";
export const defaultSettings={storeName:config.brand,contactEmail:"",maintenance:false,lowStockThreshold:5,seoTitle:config.brand,seoDescription:"Discover our collection and find your next favorite.",siteUrl:"",allowIndexing:false};
export async function settings(){const row=await db.systemSetting.findUnique({where:{key:"site"}});try{return {...defaultSettings,...JSON.parse(row?.value||"{}")};}catch{return defaultSettings;}}
