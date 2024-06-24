import fs from "node:fs";

export function generateRefreshFile(name: string, ...args: string[][]) {
	const data = args.map(row => row.join("|")).join("\n");
	const date = new Date();
	const timeStamp = date.getFullYear().toString() + 
                    (date.getMonth() + 1).toString().padStart(2, "0") + 
                    date.getDate().toString().padStart(2, "0") + 
                    date.getHours().toString().padStart(2, "0") + 
                    date.getMinutes().toString().padStart(2, "0") + 
                    date.getSeconds().toString().padStart(2, "0");

	const fileName = name + timeStamp; 
	
	fs.writeFileSync(`${fileName}.txt`, data);
	return fileName;
}