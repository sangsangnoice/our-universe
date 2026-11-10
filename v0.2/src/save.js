export const SAVE_KEY='our-private-universe-v1';
export function createSave(storage){
 const state={visits:0,seen:[],secrets:[],low:false};let available=true;
 try{const saved=JSON.parse(storage.getItem(SAVE_KEY));if(saved&&typeof saved==='object')Object.assign(state,saved);}
 catch{available=false;}
 state.seen=Array.isArray(state.seen)?state.seen:[];
 state.secrets=Array.isArray(state.secrets)?state.secrets:[];
 state.visits=(Number.isFinite(Number(state.visits))?Number(state.visits):0)+1;
 function save(){try{storage.setItem(SAVE_KEY,JSON.stringify(state));}catch{available=false;}}
 save();return {state,save,get available(){return available;}};
}
