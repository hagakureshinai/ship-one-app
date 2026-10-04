'use strict';
const materials = [
  ['moon','月',.24],['lamp','ランプ',.31],['roses','バラ',.29],['ivy','アイビー',.35],
  ['books','古書',.30],['teacup','ティーカップ',.25],['paper','紙片',.33],['sparkle','キラキラ',.38]
].map(([key,label,width]) => ({key,label,width,image:new Image(),mask:null}));
const board=document.querySelector('#board'), layer=document.querySelector('#stickers');
const tray=document.querySelector('#tray'), menu=document.querySelector('#selection-menu');
let items=[], selected=null, gesture=null, serial=0, viewing=false;
function setViewing(value){viewing=value;document.body.classList.toggle('viewing',value);select(null)}
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
function select(item){
  document.body.classList.remove('placing');
  selected=item;
  document.body.classList.toggle('selecting',!!item);
  items.forEach(i=>i.element.classList.toggle('selected',i===item));
  document.querySelector('#controls').hidden=!!item;menu.hidden=!item;
  if(item)positionMenu();
}
function place(item){item.element.style.cssText=`left:${item.x*100}%;top:${item.y*100}%;width:${item.w*100}%;height:${item.h*100}%`;if(item===selected)positionMenu()}
function positionMenu(){
  if(!selected)return;
  const r=selected.element.getBoundingClientRect(),origin=menu.getBoundingClientRect(),style=getComputedStyle(menu);
  const top=parseFloat(style.paddingTop),bottom=origin.height-parseFloat(style.paddingBottom);
  const left=parseFloat(style.paddingLeft),right=origin.width-parseFloat(style.paddingRight);
  const button=document.querySelector('#remove'),w=button.offsetWidth,h=button.offsetHeight;
  button.style.left=`${clamp((r.left+r.right)/2-origin.left-w/2,left,right-w)}px`;
  button.style.top=`${clamp(r.top-origin.top-h-6,top,bottom-h)}px`;
}
function add(material){
  if(!material.mask)return;
  const w=stickerWidth(material),h=stickerHeight(material,w);
  const item={material,w,h,x:(1-w)/2,y:(1-h)/2,element:document.createElement('div')};
  item.element.className='sticker';item.element.dataset.id=String(++serial);
  const img=material.image.cloneNode();img.alt=material.label;img.draggable=false;
  item.element.append(img);layer.append(item.element);items.push(item);place(item);select(item);
  document.querySelector('#status').textContent=`${material.label}を追加しました`;
}
// Test visible pixels rather than transparent rectangles, so overlapping art remains selectable.
function hit(x,y){
  for(let n=items.length-1;n>=0;n--){
    const i=items[n],u=(x-i.x)/i.w,v=(y-i.y)/i.h,m=i.material.mask;
    if(u<0||v<0||u>=1||v>=1)continue;
    const px=Math.floor(u*m.width),py=Math.floor(v*m.height);
    if(m.data[(py*m.width+px)*4+3]>24)return i;
  }return null;
}
function point(e){const r=board.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height}}
function stickerHeight(material,width){return width*material.image.naturalHeight/material.image.naturalWidth*board.clientWidth/board.clientHeight}
function stickerWidth(material){return Math.min(material.width,.7*board.clientHeight/board.clientWidth*material.image.naturalWidth/material.image.naturalHeight)}
new ResizeObserver(()=>{for(const item of items){item.w=stickerWidth(item.material);item.h=stickerHeight(item.material,item.w);item.x=clamp(item.x,0,1-item.w);item.y=clamp(item.y,0,1-item.h);place(item)}}).observe(board);
board.addEventListener('pointerdown',e=>{
  if(gesture||!e.isPrimary||e.button!==0)return;
  const p=point(e),item=hit(p.x,p.y),wasViewing=viewing;
  if(item){
    viewing=false;document.body.classList.remove('viewing');select(item);
  }
  gesture={id:e.pointerId,item,p,x:item?.x,y:item?.y,clientX:e.clientX,clientY:e.clientY,moved:false,wasViewing};
  board.setPointerCapture(e.pointerId);e.preventDefault();
});
board.addEventListener('pointermove',e=>{
  if(!gesture||e.pointerId!==gesture.id)return;
  if(Math.hypot(e.clientX-gesture.clientX,e.clientY-gesture.clientY)>5)gesture.moved=true;
  if(!gesture.moved||!gesture.item)return;
  document.body.classList.add('placing');
  const p=point(e),i=gesture.item;
  i.x=clamp(gesture.x+p.x-gesture.p.x,0,1-i.w);i.y=clamp(gesture.y+p.y-gesture.p.y,0,1-i.h);place(i);
});
board.addEventListener('pointerup',e=>{
  if(gesture?.id!==e.pointerId)return;
  const moved=gesture.moved||Math.hypot(e.clientX-gesture.clientX,e.clientY-gesture.clientY)>5;
  if(!gesture.item&&!moved)setViewing(!gesture.wasViewing);
  gesture=null;
});
for(const type of ['pointercancel','lostpointercapture'])board.addEventListener(type,e=>{if(gesture?.id===e.pointerId)gesture=null});
document.querySelector('#remove').addEventListener('click',()=>{if(!selected)return;selected.element.remove();items=items.filter(i=>i!==selected);select(null)});
const background=document.querySelector('.background'),camera=document.querySelector('#camera');
const preview=document.querySelector('#save-preview');
function updateCamera(){camera.disabled=!(background.complete&&background.naturalWidth)}
background.addEventListener('load',updateCamera);updateCamera();
function renderArtwork(){
  const width=board.clientWidth,height=board.clientHeight;
  if(!width||!height||!background.naturalWidth)throw new Error('台紙の読み込みを待って、もう一度お試しください。');
  const scale=Math.min(2,2048/Math.max(width,height));
  const canvas=document.createElement('canvas');canvas.width=Math.round(width*scale);canvas.height=Math.round(height*scale);
  const ctx=canvas.getContext('2d');
  // Match the centered object-fit:cover crop of the visible board.
  const fit=Math.max(canvas.width/background.naturalWidth,canvas.height/background.naturalHeight);
  const bw=background.naturalWidth*fit,bh=background.naturalHeight*fit;
  ctx.drawImage(background,(canvas.width-bw)/2,(canvas.height-bh)/2,bw,bh);
  for(const item of items)ctx.drawImage(item.material.image,item.x*canvas.width,item.y*canvas.height,item.w*canvas.width,item.h*canvas.height);
  return canvas;
}
function showSavePreview(dataUrl,message='画像を長押しして保存できます。パソコンではダウンロードも使えます。'){
  document.querySelector('#saved-artwork').src=dataUrl;
  document.querySelector('#download-artwork').href=dataUrl;
  document.querySelector('#save-message').textContent=message;
  preview.showModal();
}
camera.addEventListener('click',async()=>{
  if(camera.disabled)return;
  camera.disabled=true;
  try{
    // Build the file synchronously so Safari retains the tap's user activation for share().
    const dataUrl=renderArtwork().toDataURL('image/png');
    const binary=atob(dataUrl.split(',')[1]),bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));
    const file=new File([bytes],'moonlit-sticker-book.png',{type:'image/png'});
    if(navigator.share&&navigator.canShare?.({files:[file]})){
      try{await navigator.share({files:[file]})}
      catch(error){if(error.name!=='AbortError')showSavePreview(dataUrl,'共有できなかったため、作品画像を表示しました。画像を長押しして保存できます。')}
    }else showSavePreview(dataUrl);
  }catch(error){document.querySelector('#status').textContent=error.message;alert('作品画像を作れませんでした。台紙の読み込み後にもう一度お試しください。')}
  finally{updateCamera()}
});
document.querySelector('#close-preview').addEventListener('click',()=>preview.close());
for(const material of materials){
  const button=document.createElement('button');button.className='material';button.type='button';button.disabled=true;button.setAttribute('aria-label',`${material.label}を貼る`);
  const thumbnail=document.createElement('img');thumbnail.src=`assets/${material.key}.png`;thumbnail.alt='';thumbnail.draggable=false;button.append(thumbnail);tray.append(button);
  let start=null;
  button.addEventListener('pointerdown',e=>{start={x:e.clientX,y:e.clientY,scroll:tray.scrollLeft,moved:false}});
  button.addEventListener('pointermove',e=>{if(start&&Math.hypot(e.clientX-start.x,e.clientY-start.y)>8)start.moved=true});
  button.addEventListener('pointercancel',()=>{if(start)start.moved=true});
  button.addEventListener('click',e=>{if(start&&(start.moved||Math.abs(tray.scrollLeft-start.scroll)>8)){e.preventDefault();start=null;return}start=null;add(material)});
  material.image.onload=()=>{
    const canvas=document.createElement('canvas');canvas.width=material.image.naturalWidth;canvas.height=material.image.naturalHeight;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(material.image,0,0);material.mask=ctx.getImageData(0,0,canvas.width,canvas.height);button.disabled=false;
  };
  material.image.onerror=()=>{document.querySelector('#status').textContent=`${material.label}の画像を読み込めませんでした`};
  material.image.src=`assets/${material.key}.png`;
}
