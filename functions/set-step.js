export async function handler(event){

try{

if(!event.body){
return {
statusCode:400,
body:JSON.stringify({error:"Missing body"})
};
}

const data = JSON.parse(event.body);

const { classId, sessionId, step } = data;

if(!classId || !sessionId || step === undefined){
return {
statusCode:400,
body:JSON.stringify({error:"Missing parameters"})
};
}

const stepNumber = Number(step);

const res = await fetch(
`https://YOUR_FIREBASE_URL/classrooms/${classId}/sessions/${sessionId}.json`,
{
method:"PATCH",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
currentStep: stepNumber
})
}
);

if(!res.ok){
throw new Error("Firebase update failed");
}

return {
statusCode:200,
headers:{
"Access-Control-Allow-Origin":"*"
},
body:JSON.stringify({
ok:true,
step: stepNumber
})
};

}catch(err){

console.error("set-step error:", err);

return {
statusCode:500,
body:JSON.stringify({
error:"Server error"
})
};

}

}
