import express from 'express';
import cors from 'cors';
import multer from 'multer';
import mongoose from 'mongoose';
import { field } from './models/formFields.js'; // Adjust the path as needed
import fs from 'fs'
import exceljs from "exceljs"
import zipCreate from './zipCreation.js'
const app = express();
const port = 5000;


// Connect to MongoDB
async function main() {
    try {
        await mongoose.connect('mongodb://localhost:27017/fileDB');
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
    }
}
main();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer memory storage configuration
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes
app.get("/", (req, res) => {    
    res.status(200).send({success:true,message:"Hey there"});
});


//API for saving the data in MongoDB
app.post("/add", upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'resume', maxCount: 1 }]), async (req, res) => {
    try {
        console.log(req.body);
        console.log(req.files);

        if (!req.files.photo || !req.files.resume) {
            return res.status(400).send({ success: false, message: 'Image or resume not provided' });
        }
        const obj = req.body;
        obj['photo'] = { fileName: `${req.files.photo[0].fieldname}_${req.files.photo[0].originalname}`, data: req.files.photo[0].buffer, contentType: req.files.photo[0].mimetype };
        obj['resume'] = { fileName: `${req.files.resume[0].fieldname}_${req.files.resume[0].originalname}`, data: req.files.resume[0].buffer, contentType: req.files.resume[0].mimetype };
        console.log("---------------------------------\n", obj);

        // Save image to MongoDB
        const newField = await new field(obj);
        await newField.save();

        console.log('Document saved to MongoDB:', newField);
        res.send({ success: true, files: obj });
    } catch (error) {
        console.error("Error in /add route:", error);
        res.status(500).send({ success: false, error: error.message });
    }
});

//API for sending data in the portal
app.get('/portal', async (req, res) => {
    try {
        // const fieldss = ['departmentName', 'qualification', 'teacherName', 'programme', 'photo', 'resume'];
        const fileData = await field.find({}, { 'departmentName': 1, 'qualification': 1, 'teacherName': 1, 'programme': 1, 'photo': 1 })
        res.status(200).send({succes: true,data: fileData});

    } catch (error) {
        console.error("Error reading db.json:", error);
        res.status(500).send({ success: false, error: error.message });
    }
});
app.get('/download', async (req, res) => {
    try {
        const data = await field.find({},{_id:0,__v:0});
        console.log(data);

        //creating a instance of workbook
        const workbook= new exceljs.Workbook();
        const newSheet=workbook.addWorksheet("details");

        let firstobj=data[0];
        //he raw data of the document is stored in a property called _doc.
        console.log("first-----------",firstobj._doc)
        const columns=Object.keys(firstobj._doc).map(key=>({header:key,key}));
        newSheet.columns=columns;
        console.log("columns------------------\n",Object.keys(firstobj._doc));
        let i = 0
        if(!fs.existsSync("./uploads")){
        s.mkdirSync("uploads");
        fs.mkdirSync("./uploads/images");
   fs.mkdirSync("./uploads/resumes");

        }
        
        for (const iterator of data) {
            //connverting binary into its original form
            const photoFilePath=`./uploads/images/${i}_${iterator.photo.fileName}`
            const resumeFilePath=`./uploads/resumes/${i}_${iterator.resume.fileName}`
            fs.writeFileSync(photoFilePath, iterator.photo['data']);
            fs.writeFileSync(resumeFilePath,iterator.resume['data']);
            i++;
            let tempObj=iterator._doc;
            tempObj['photo']=photoFilePath;
            tempObj['resume']=resumeFilePath;
            console.log(tempObj)
            //adding
            newSheet.addRow(tempObj);

        }

        //converting into excel
        await workbook.xlsx.writeFile('./uploads/output.xlsx');
        console.log("file saved successfully");
        zipCreate("./uploads","./result.zip")
        res.status(200).send({ success: true });
        // res.download();
    }
    catch (error) {
        console.error("Error in /download route:", error);
        res.status(500).send({ success: false, error: error.message });
    }
});
// Start the server
app.listen(port, () => {
    
    console.log("Server started on port " + port);
});
