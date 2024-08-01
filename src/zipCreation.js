import fs from "fs";
import path from "path";
import JSZip from "jszip";

//creating a function

export default function zipCreate(folderPath,zipFilePath){
    //creating instance of jszip
    const zip= new JSZip();

    //adding file to zip;
    //zipfile->instance of JSZip means the function takes instance of zip
    const addToZip=(zipfile,folderPath,currentPath="")=>{
        //giving list of files present in folderpath
        const files=fs.readdirSync(path.join(folderPath,currentPath));
        
        for(const file of files){
            const filepath=path.join(currentPath,file);
            const absFilePath=path.join(folderPath,filepath);
            
            //giving details of file
            const stats=fs.statSync(absFilePath);

            //checking whether file is a folder or not
            if(stats.isDirectory()){
                addToZip(zipfile,folderPath,filepath);
            }
            else{
                const fileContent=fs.readFileSync(absFilePath);
                zipfile.file(filepath,fileContent)
            }
        }
}
        //calling func
   addToZip(zip,folderPath);

        //saving zip file to directory
    zip.generateAsync({ type: 'nodebuffer' }).then((data) => {
    fs.writeFileSync(zipFilePath, data);
    console.log('ZIP file created successfully');
  }).catch((err) => {
    console.error('Error creating ZIP file:', err);
  });
}

