const mongoose = require('mongoose');
const Application = require('./models/Application');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    try {
        const app = await Application.create({
            user: new mongoose.Types.ObjectId(),
            certificateType: 'Income',
            status: 'Submitted',
            documents: [{ type: 'Aadhar Card', url: 'data:image/jpeg;base64,12345', status: 'verified', extractedData: {} }]
        });
        console.log("SUCCESS:", app._id);
    } catch(e) {
        console.log("FAILED:", e.message);
    }
    await Application.deleteOne({ _id: app._id }).catch(() => {});
    process.exit();
}).catch(e => { console.log("DB ERROR", e); process.exit(); });
