(() => {
  'use strict';
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const config=window.INVITATION||{},reduce=matchMedia('(prefers-reduced-motion: reduce)'),liteMode=document.documentElement.classList.contains('lite');
  const pendingImages=new Set($$('#design image[data-src]'));let imageRaf=false;
  function loadNearbyImages(){
    imageRaf=false;const margin=Math.max(700,innerHeight);
    pendingImages.forEach(image=>{const rect=(image.closest('[role="img"]')||image).getBoundingClientRect();if(rect.bottom>=-margin&&rect.top<=innerHeight+margin){image.setAttribute('href',image.dataset.src);image.removeAttribute('data-src');pendingImages.delete(image);}});
  }
  function requestImages(){if(!imageRaf&&pendingImages.size){imageRaf=true;requestAnimationFrame(loadNearbyImages);}}
  if(pendingImages.size){addEventListener('scroll',requestImages,{passive:true});addEventListener('resize',requestImages);addEventListener('load',requestImages);requestImages();}
  // Zoom a new inner group, keeping the exported image matrix and clip intact.
  [[230,291,213],[245,246,214],[251,252,213]].forEach(([photoId,arrowId,height])=>{
    const card=$('#node-'+photoId),arrow=$('#node-'+arrowId),image=card?.querySelector('image');
    if(!image)return;
    const zoom=document.createElementNS('http://www.w3.org/2000/svg','g');
    zoom.classList.add('photo-zoom');zoom.style.setProperty('--cx','163.5px');zoom.style.setProperty('--cy',height/2+'px');
    image.parentNode.insertBefore(zoom,image);zoom.appendChild(image);
    card.classList.add('room-card');
    const state=on=>{card.classList.toggle('engaged',on);arrow.classList.toggle('engaged',on);};
    [card,arrow].forEach(target=>{
      target.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')state(true);});
      target.addEventListener('pointerleave',()=>state(false));
      target.addEventListener('pointerdown',()=>state(true));
      target.addEventListener('pointerup',e=>{if(e.pointerType==='touch')state(false);});
      target.addEventListener('pointercancel',()=>state(false));
      target.addEventListener('focusin',()=>state(true));
      target.addEventListener('focusout',()=>state(false));
    });
  });
  [248,254,293,301,307,326].forEach(id=>$('#motion-'+id)?.classList.add('loop','arrow-drift'));
  [183,185,286,288,343].forEach(id=>$('#motion-'+id)?.classList.add('loop','scroll-drift'));
  [247,253,292,342].forEach(id=>$('#motion-'+id)?.classList.add('loop','icon-breathe'));
  // Reveal all source text. Split multiline copy by the original glyph baselines,
  // without reflowing, retyping or changing its exported position.
  const textPathIds=new Set(['node-331','node-337','node-340']);
  $$('#design [role="img"][aria-label]').forEach(node=>{
    if(textPathIds.has(node.id))return;
    const motion=node.firstElementChild;
    if(!motion||motion.classList.contains('marquee'))return;
    // A text-bearing container must not hide its separately animated lines.
    for(let parent=node.parentElement;parent&&parent.id!=='design';parent=parent.parentElement){
      if(parent.classList.contains('enter'))parent.classList.remove('enter');
    }
    motion.classList.add('text-reveal');
    if(motion.classList.contains('enter-left')||motion.classList.contains('enter-center'))return;
    const lines=new Map();
    [...motion.children].forEach(child=>{
      const use=child.querySelector('use'),match=use?.getAttribute('transform')?.match(/translate\([^\s]+\s+([^\)]+)\)/);
      if(!match)return;
      const baseline=Math.round(Number(match[1])*100)/100;
      if(!lines.has(baseline))lines.set(baseline,[]);
      lines.get(baseline).push(child);
    });
    if(lines.size>1){
      motion.classList.remove('enter','text-reveal');
      [...lines.entries()].sort((a,b)=>a[0]-b[0]).forEach(([,glyphs],i)=>{
        const line=document.createElementNS('http://www.w3.org/2000/svg','g');
        line.classList.add('enter','text-reveal');line.style.setProperty('--delay',Math.min(i*75,300)+'ms');
        motion.appendChild(line);glyphs.forEach(glyph=>line.appendChild(glyph));
      });
    }else motion.classList.add('enter');
  });
  // Use the actual viewport for entrance motion. Several mobile WebViews fail to
  // deliver IntersectionObserver events for transformed SVG <g> elements.
  const pendingEntries=new Set($$('.enter'));let revealRaf=false,motionPainted=false;
  function revealInViewport(){
    revealRaf=false;const trigger=innerHeight*.92;
    pendingEntries.forEach(el=>{
      const anchor=el.closest('[role="img"]')||el,rect=anchor.getBoundingClientRect();
      // Reveal anything the user has reached, even if a fast swipe jumps past
      // the element between two scroll events.
      if(rect.top<=trigger){el.classList.add('visible');pendingEntries.delete(el);}
    });
  }
  function requestReveal(){if(motionPainted&&!revealRaf&&pendingEntries.size){revealRaf=true;requestAnimationFrame(revealInViewport);}}
  document.documentElement.classList.add('motion-ready');
  addEventListener('scroll',requestReveal,{passive:true});addEventListener('resize',requestReveal);addEventListener('load',requestReveal);
  // Let the hidden entrance state paint once before revealing the first screen.
  // Without this delay, mobile WebViews often collapse both states into one frame.
  requestAnimationFrame(()=>requestAnimationFrame(()=>{motionPainted=true;revealInViewport();}));
  // Several mobile WebViews report unreliable IntersectionObserver results for
  // transformed SVG groups. A cheap scroll check keeps looping motion alive.
  const loops=$$('.loop');let loopRaf=false;
  function updateLoops(){loopRaf=false;const margin=Math.max(180,innerHeight*.25);loops.forEach(el=>{const rect=(el.parentElement||el).getBoundingClientRect();const measurable=Number.isFinite(rect.top)&&Number.isFinite(rect.bottom);el.classList.toggle('offscreen',measurable&&(rect.bottom< -margin||rect.top>innerHeight+margin));});}
  function requestLoops(){if(!loopRaf){loopRaf=true;requestAnimationFrame(updateLoops);}}
  if(loops.length){addEventListener('scroll',requestLoops,{passive:true});addEventListener('resize',requestLoops);addEventListener('load',requestLoops);requestLoops();}
  const backlight=$('#motion-199'),backlightBase=backlight?.querySelector('.backlight-base'),backlightNode=$('#node-199');let rafPending=false;
  function updateLight(){rafPending=false;if(!backlight||!backlightNode)return;const bounds=backlightNode.getBoundingClientRect();const progress=reduce.matches?1:Math.min(1,Math.max(0,(innerHeight*.9-bounds.top)/(innerHeight*.68)));backlight.style.setProperty('--light',(.22+1.02*progress).toFixed(3));backlight.style.setProperty('--saturation',(.72+.48*progress).toFixed(3));if(backlightBase)backlightBase.style.opacity=(.3+.7*progress).toFixed(3);}
  function requestLight(){if(!rafPending){rafPending=true;requestAnimationFrame(updateLight);}}
  addEventListener('scroll',requestLight,{passive:true});addEventListener('resize',requestLight);updateLight();
  if(reduce.addEventListener)reduce.addEventListener('change',requestLight);else if(reduce.addListener)reduce.addListener(requestLight);
  let toastTimer;
  function toast(message){$('.toast').textContent=message;$('.toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('.toast').classList.remove('show'),3500);}
  let focusBefore,overflowBefore;
  function openDialog(dialog){focusBefore=document.activeElement;overflowBefore=document.body.style.overflow;dialog.showModal();document.body.style.overflow='hidden';}
  $$('dialog').forEach(dialog=>{dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{document.body.style.overflow=overflowBefore;focusBefore?.focus({preventScroll:true});});dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dialog.close();});});
  function message(title,body){$('#message-title').textContent=title;$('#message-body').textContent=body;$('#share-url').hidden=true;$('#copy-button').hidden=true;openDialog($('#message-dialog'));}
  const isLocal=location.protocol==='file:'||['localhost','127.0.0.1'].includes(location.hostname);
  const shareUrl=config.shareUrl||location.href.split('#')[0];
  async function share(){
    if(isLocal&&!config.shareUrl){message('分享邀请函','当前是本地预览。发布正式链接后即可分享给朋友。');return;}
    if(navigator.share){try{await navigator.share({title:document.title,text:'贵宾专属，静候您的光临。',url:shareUrl});return;}catch(e){if(e.name==='AbortError')return;}}
    message('分享邀请函',/MicroMessenger/i.test(navigator.userAgent)?'请使用微信右上角菜单转发，也可复制链接发送给朋友。':'复制邀请函链接，发送给朋友。');$('#share-url').hidden=false;$('#share-url').value=shareUrl;$('#copy-button').hidden=false;
  }
  $('#copy-button').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(shareUrl);$('#message-dialog').close();toast('邀请链接已复制');}catch{$('#share-url').focus();$('#share-url').select();$('#message-body').textContent='请长按或手动复制上方链接。';}});
  function safeHttp(value){try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:null;}catch{return null;}}
  $$('[data-action]').forEach(el=>{
    async function activate(){
      const action=el.dataset.action;
      if(action==='photo'){const dialog=$('#photo-dialog');dialog.querySelector('img').src=window.DESIGN_PHOTOS[el.dataset.photo];dialog.querySelector('img').alt=el.getAttribute('aria-label');dialog.querySelector('p').textContent=el.getAttribute('aria-label');openDialog(dialog);}
      else if(action==='consult'){const url=safeHttp(config.consultUrl);const phone=String(config.phone||'').replace(/[\s-]/g,'');if(url)location.href=url;else if(/^\+?\d{6,20}$/.test(phone))location.href='tel:'+phone;else message('立即咨询','接待联系方式尚未提供，请向邀请人确认。');}
      else if(action==='navigate'){const url=safeHttp(config.mapUrl);if(url)location.href=url;else if(config.address)location.href='https://uri.amap.com/search?keyword='+encodeURIComponent(config.address)+'&callnative=1';else message('导航前往','准确的店铺位置尚未提供，请向邀请人确认。');}
      else if(action==='share')await share();
      else if(action==='down')$('#node-305').scrollIntoView({behavior:reduce.matches?'auto':'smooth',block:'center'});
    }
    el.addEventListener('click',activate);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate();}});
  });
  const audio=$('#background-music'),musicButton=$('#music-button');
  let disabled=false,inFlight=false,needsGesture=true,resumeWhenVisible=false;
  try{disabled=sessionStorage.getItem('gold-invitation-music')==='off';}catch{}
  function syncAudio(){const playing=!audio.paused&&!audio.ended;musicButton.classList.toggle('playing',playing);musicButton.setAttribute('aria-pressed',String(playing));musicButton.setAttribute('aria-label',playing?'关闭背景音乐':'播放背景音乐');}
  async function playMusic(){if(disabled||document.hidden||inFlight)return;inFlight=true;musicButton.classList.add('loading');try{await audio.play();needsGesture=false;}catch(e){needsGesture=true;if(e.name!=='NotAllowedError'&&e.name!=='AbortError')toast('音乐暂时无法播放，请稍后重试');}finally{inFlight=false;musicButton.classList.remove('loading');syncAudio();}}
  musicButton.addEventListener('click',()=>{if(!audio.paused||inFlight){disabled=true;needsGesture=false;audio.pause();}else{disabled=false;needsGesture=true;playMusic();}try{sessionStorage.setItem('gold-invitation-music',disabled?'off':'on');}catch{}syncAudio();});
  function firstGesture(e){if(e.target.closest?.('#music-button'))return;if(needsGesture&&!disabled)playMusic();}
  document.addEventListener('pointerup',firstGesture,{passive:true});document.addEventListener('touchend',firstGesture,{passive:true});document.addEventListener('keydown',firstGesture);
  audio.addEventListener('play',syncAudio);audio.addEventListener('pause',syncAudio);audio.addEventListener('error',()=>{syncAudio();toast('背景音乐加载失败，请点击音乐按钮重试');});
  document.addEventListener('visibilitychange',()=>{document.documentElement.classList.toggle('page-hidden',document.hidden);if(document.hidden){resumeWhenVisible=!audio.paused;audio.pause();}else if(resumeWhenVisible||needsGesture){resumeWhenVisible=false;playMusic();}});
  document.addEventListener('WeixinJSBridgeReady',playMusic,{once:true});
  syncAudio();
  if(liteMode){
    const startMusic=()=>{'requestIdleCallback' in window?requestIdleCallback(playMusic,{timeout:2800}):setTimeout(playMusic,1800);};
    document.readyState==='complete'?startMusic():addEventListener('load',startMusic,{once:true});
  }else playMusic();
})();
