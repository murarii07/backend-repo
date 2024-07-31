import fs from "fs";
import path from "path";
import JSZip from "jszip";

//creating a function

export default function zipCreate(folderpath,zipFilePath){
    //creating instance of jszip
    const zip= new JSZip();

    //adding file to zip;
    //zipfile->instance of JSZip means the function takes instance of zip
    addToZip=(zipfile,folderpath,currentpath="")=>{
        //giving list of files present in folderpath
        const files=fs.readdirSync(path.join(folderPath,currentPath));
        
        for(const file of files){
            const filepath=path.join(currentPath,file);
            const absFilePath=path.join(folderpath,filepath);
            
            //giving details of file
            const stats=fs.statSync(absFilePath);

            //checking whether file is a folder or not
            if(stats.isDirector()){
                addToZip(zipfile,folderpath,filepath);
            }
            else{
                fileContent=fs.readFileSync(absFilepath);
                zipfile.File(filepath,filecontent)
            }
        }

        //calling func
        addToZip(zip,folderpath);

        //saving zip file to directory
        zip.generateAsync({type:"nodebuffer"}).then((data)=>{
        fs.writeFileSync(zipFilePath,data);
        }).catch((error)=>{
            console.log(error)
        })
        console.log("zip file created")
    }
}

