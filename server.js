const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const PORT=process.env.PORT||3000;
const KEY=process.env.OPENROUTER_API_KEY;
const MODEL=process.env.OPENROUTER_MODEL||'openrouter/auto';
const PIN=process.env.APP_PIN||'';
const profile=`You are an English interview practice coach. The user's wife asks interview questions aloud; speech recognition turns them into text. Write ONLY the first-person answer the candidate can read aloud. Respond in clear, simple, natural English, 45-90 words normally, up to 120 for complex technical questions. No headings, explanations, quotes, markdown, or introductory filler. Answer the actual question directly, with honest examples. Do not invent experience, achievements, salary, qualifications, or specific metrics. If uncertain, say so naturally. Candidate facts: Based in Bosnia and Herzegovina. Bachelor's degree in Business Informatics, University of Modern Sciences CKM Mostar. Works in IT at a manufacturing company since March 2023. Has built and maintained ERP systems for production planning and reporting and automation scripts. Technologies: PHP, JavaScript, Python, Next.js, Laravel, PostgreSQL, Playwright, Tkinter. Has worked on technical support, IT infrastructure and troubleshooting. Interested in remote AI evaluation, AI training, data labeling, prompt/rubric creation, programming and automation. Spoken English is improving, so prefer straightforward vocabulary. Avoid claiming extensive professional AI training experience or fluent spoken English.`;
const rate=new Map();
function send(res,code,data){res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));}
const server=http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(req.method==='POST'&&url.pathname==='/api/answer'){
  const ip=req.socket.remoteAddress||'unknown',now=Date.now(),hits=(rate.get(ip)||[]).filter(t=>now-t<60000);if(hits.length>=20)return send(res,429,{error:'Too many requests. Wait one minute.'});hits.push(now);rate.set(ip,hits);
  if(!KEY)return send(res,503,{error:'Server is missing OPENROUTER_API_KEY.'});
  let body='';for await(const chunk of req){body+=chunk;if(body.length>12000)return send(res,413,{error:'Request too large.'});}
  let input;try{input=JSON.parse(body)}catch{return send(res,400,{error:'Invalid JSON.'})}
  if(PIN&&input.pin!==PIN)return send(res,401,{error:'Wrong app PIN.'});
  const question=String(input.question||'').trim();if(question.length<3||question.length>1500)return send(res,400,{error:'Question must be 3-1500 characters.'});
  const ctrl=new AbortController();const timeout=setTimeout(()=>ctrl.abort(),45000);
  try{
   const upstream=await fetch('https://openrouter.ai/api/v1/chat/completions',{method:'POST',signal:ctrl.signal,headers:{'Authorization':`Bearer ${KEY}`,'Content-Type':'application/json','X-OpenRouter-Title':'AI Interview Coach'},body:JSON.stringify({model:MODEL,messages:[{role:'system',content:profile},{role:'user',content:question}],temperature:0.5,max_completion_tokens:280})});
   const result=await upstream.json();if(!upstream.ok)return send(res,502,{error:result?.error?.message||`OpenRouter error ${upstream.status}`});
   const answer=result?.choices?.[0]?.message?.content;if(typeof answer!=='string'||!answer.trim())return send(res,502,{error:'Model returned no text. Try a different model.'});
   send(res,200,{answer:answer.trim(),model:result.model||MODEL});
  }catch(e){send(res,502,{error:e.name==='AbortError'?'AI request timed out.':e.message})}finally{clearTimeout(timeout)}return;
 }
 if(req.method!=='GET')return send(res,405,{error:'Method not allowed'});
 const filename=url.pathname==='/'?'index.html':url.pathname.slice(1);if(filename!=='index.html')return send(res,404,{error:'Not found'});
 const file=path.join(__dirname,'public','index.html');res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});fs.createReadStream(file).pipe(res);
});server.listen(PORT,'0.0.0.0',()=>console.log(`AI Interview Coach on port ${PORT}`));
