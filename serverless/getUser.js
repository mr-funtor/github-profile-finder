const fetch=require("node-fetch")

const {API_KEY}=process.env

const mama="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"
exports.handler=async(event,context)=>{
	try{
		return{statusCode:200,body:JSON.stringify({msg: mama})}

	}catch(err){
		
	}
}
