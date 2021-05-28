const fetch=require("node-fetch")

const {API_KEY}=process.env

exports.handler=async(event,context)=>{
	try{
		return{statusCode:200,body:JSON.stringify({msg: API_KEY})}

	}catch(err){
		
	}
}
