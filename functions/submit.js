export async function handler(event){

  const body = JSON.parse(event.body);

  const submission = body.submission;

  console.log("submission:",submission);

  return {
    statusCode:200,
    body:JSON.stringify({status:"saved"})
  };

}
