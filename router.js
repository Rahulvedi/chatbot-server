const express=require('express')
const Router=express.Router();
Router.get('/',(req,res)=>{
    res.send('server in running hello world');
})
module.exports=Router