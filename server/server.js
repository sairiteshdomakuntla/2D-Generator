const express=require('express')
const cors=require('cors')
const bodyParser=require('body-parser');
const apiRoutes=require('./routes/apiRoutes');

const app=express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api',apiRoutes);

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})