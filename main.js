(function(){
  var root=document.documentElement;

  var PHONE='+995 599 74 28 00';

  /* ---------- language ---------- */
  function setLang(l){
    root.setAttribute('data-lang',l); root.lang = l==='en'?'en':'ka';
    document.querySelectorAll('.lang button').forEach(function(b){b.setAttribute('aria-pressed', String(b.dataset.set===l));});
    document.querySelectorAll('option[data-ka]').forEach(function(o){o.textContent = l==='en'?o.value:o.dataset.ka;});
    document.querySelectorAll('[data-ph-ka]').forEach(function(el){el.placeholder = l==='en'?el.dataset.phEn:el.dataset.phKa;});
    try{localStorage.setItem('cerebro-lang',l);}catch(e){}
    try{document.dispatchEvent(new Event('cerebro:lang'));}catch(e){}
  }
  var start='ka';
  if(location.hash==='#en') start='en';
  else { try{var s=localStorage.getItem('cerebro-lang'); if(s==='en'||s==='ka') start=s;}catch(e){} }
  setLang(start);
  document.querySelectorAll('.lang button').forEach(function(b){b.addEventListener('click',function(){setLang(b.dataset.set);});});

  /* ---------- menus ---------- */
  var header=document.querySelector('header.top');
  var burger=document.querySelector('.burger');
  if(burger) burger.addEventListener('click',function(){var o=header.classList.toggle('open');burger.setAttribute('aria-expanded',String(o));});
  document.querySelectorAll('.dd > button').forEach(function(btn){
    btn.addEventListener('click',function(){var dd=btn.parentElement;var o=dd.classList.toggle('open');btn.setAttribute('aria-expanded',String(o));});
  });
  document.addEventListener('click',function(e){document.querySelectorAll('.dd.open').forEach(function(dd){if(!dd.contains(e.target)){dd.classList.remove('open');dd.querySelector('button').setAttribute('aria-expanded','false');}});});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'){document.querySelectorAll('.dd.open').forEach(function(dd){dd.classList.remove('open');});}});

  /* ---------- copy helpers ---------- */
  function flash(btn){var o=btn.innerHTML; btn.textContent = root.dataset.lang==='en'?'Copied':'დაკოპირდა'; setTimeout(function(){btn.innerHTML=o;},1500);}
  function selectNode(node){ if(!node) return; var r=document.createRange(); r.selectNodeContents(node); var s=getSelection(); s.removeAllRanges(); s.addRange(r); }
  function copyText(t, btn, node){ try{ navigator.clipboard.writeText(t).then(function(){flash(btn);}, function(){selectNode(node);}); }catch(e){ selectNode(node); } }
  document.querySelectorAll('[data-copy="phone"]').forEach(function(b){b.addEventListener('click',function(){copyText(PHONE,b,document.getElementById('phone'));});});

  /* ---------- contact form ---------- */
  var form=document.getElementById('inquiry');
  if(form){
    var pre=new URLSearchParams(location.search).get('service');
    try{var pc=sessionStorage.getItem('cerebro-contact'); if(pc){form.elements.contact.value=pc; sessionStorage.removeItem('cerebro-contact'); setTimeout(function(){form.elements.name.focus();},60);}}catch(e){}
    if(pre){var sel=form.elements.service; for(var i=0;i<sel.options.length;i++){if(sel.options[i].dataset.slug===pre){sel.selectedIndex=i;}}}
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var f=form.elements, name=f.name.value.trim(), contact=f.contact.value.trim();
      var err=document.getElementById('f-error');
      if(!name||!contact){err.hidden=false; (name?f.contact:f.name).focus(); return;}
      err.hidden=true;
      var en=root.dataset.lang==='en', opt=f.service.selectedOptions[0];
      var lines = en
        ? ['Hello Cerebro,','Name: '+name, f.company.value.trim()?'Company: '+f.company.value.trim():'', 'Contact: '+contact, 'Interested in: '+opt.value, f.message.value.trim()?'Message: '+f.message.value.trim():'']
        : ['გამარჯობა, Cerebro!','სახელი: '+name, f.company.value.trim()?'კომპანია: '+f.company.value.trim():'', 'კონტაქტი: '+contact, 'მაინტერესებს: '+opt.dataset.ka, f.message.value.trim()?'შეტყობინება: '+f.message.value.trim():''];
      document.getElementById('f-text').textContent = lines.filter(Boolean).join('\n');
      var d=document.getElementById('f-done'); d.hidden=false; d.scrollIntoView({block:'nearest'});
    });
    var fc=document.getElementById('f-copy');
    fc.addEventListener('click',function(){var n=document.getElementById('f-text');copyText(n.textContent,fc,n);});
  }

  /* ---------- interaction layer ---------- */
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  // funnel stream canvas: leads enter wide on the left and narrow through
  // Awareness -> Consideration -> Remarketing -> Conversion. canvas.net-page covers the whole page (fixed);
  // canvas.net inside a hero band covers that band only.
  document.querySelectorAll('canvas.net').forEach(function(cv){
    var ctx=cv.getContext('2d'), page=cv.classList.contains('net-page'), band=page?null:cv.parentElement;
    var W=0,H=0,endX=0,ex=0,homeY=0,ty=0,t=0,dpr=Math.min(devicePixelRatio||1,2),pts=[],mouse={x:-9999,y:-9999,on:false};
    var plan=document.querySelector('.plan');
    function css(n){return getComputedStyle(root).getPropertyValue(n).trim();}
    function rgb(h){h=h.replace('#','');if(h.length===3)h=h.split('').map(function(c){return c+c}).join('');var n=parseInt(h,16);return (n>>16&255)+','+(n>>8&255)+','+(n&255);}
    var stg=[css('--aw')||'#AEB3F8',css('--co')||'#9097F6',css('--rm')||'#7079F3',css('--cv')||'#4C57F0'].map(rgb);
    function box(){return page?{left:0,top:0,width:innerWidth,height:innerHeight}:band.getBoundingClientRect();}
    function spawn(x){return {x:x,s:Math.random()*2-1,v:1+Math.random()*1.6,w:Math.random()*6.283};}
    // where the stream ends: the media plan card while it is on screen and to the right, otherwise the right edge
    function target(){var r=box();endX=W;homeY=H*(page?.5:.42);
      if(plan){var p=plan.getBoundingClientRect();
        if(p.left-r.left>W*.35&&p.bottom>r.top+40&&p.top<r.top+H-40){endX=p.left-r.left+8;homeY=Math.max(40,Math.min(H-40,p.top-r.top+p.height/2));}}}
    function size(){var r=box();W=r.width;H=r.height;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
      target();ex=endX;ty=homeY;var n=Math.round(Math.min(page?520:420,W*H/(page?1900:1500)));pts=[];
      for(var i=0;i<n;i++)pts.push(spawn(Math.random()*endX));}
    size(); addEventListener('resize',size);
    var src=page?window:band;
    src.addEventListener('pointermove',function(e){var r=box();mouse.x=e.clientX-r.left;mouse.y=e.clientY-r.top;mouse.on=true;});
    (page?document.documentElement:band).addEventListener('pointerleave',function(){mouse.on=false;});
    src.addEventListener('pointerdown',function(){if(reduce)return;for(var i=0;i<60;i++)pts.push(spawn(-Math.random()*80));});
    function frame(){
      t++;target();ex+=(endX-ex)*.08;ctx.clearRect(0,0,W,H);
      var goal=mouse.on?Math.max(H*.12,Math.min(H*.88,mouse.y)):homeY+Math.sin(t*.008)*H*.06;
      ty+=(goal-ty)*.06;
      for(var i=pts.length-1;i>=0;i--){var p=pts[i],u=Math.max(0,Math.min(1,p.x/ex)),
          spread=H*.46*Math.pow(1-u,1.4)+3, cy=H/2+(ty-H/2)*u,
          y=cy+p.s*spread+Math.sin(p.w+t*.03)*4*(1-u);
        if(!reduce)p.x+=p.v*(1+u*1.5);
        var st=Math.min(3,Math.floor(u*4));
        ctx.fillStyle='rgba('+stg[st]+','+(.3+u*.6)+')';
        ctx.beginPath();ctx.arc(p.x,y,1+u*1.6,0,6.283);ctx.fill();
        if(p.x>ex){if(pts.length>(page?560:460))pts.splice(i,1);else pts[i]=spawn(-Math.random()*40);}
      }
      ctx.fillStyle='rgba('+stg[3]+',.95)';ctx.beginPath();ctx.arc(ex-4,ty,4.5,0,6.283);ctx.fill();
      if(!reduce) requestAnimationFrame(frame);
    }
    frame();
  });

  if(fine && !reduce){
    document.querySelectorAll('[data-tilt]').forEach(function(el){
      var max = el.classList.contains('plan') ? 10 : 5;
      el.addEventListener('pointermove',function(e){var r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
        el.style.transform='perspective(900px) rotateX('+((.5-y)*max)+'deg) rotateY('+((x-.5)*max)+'deg) translateY(-4px)';
        el.style.setProperty('--mx',(x*100)+'%');el.style.setProperty('--my',(y*100)+'%');el.classList.add('hot');});
      el.addEventListener('pointerleave',function(){el.style.transition='transform .5s cubic-bezier(.2,.7,.2,1)';el.style.transform='';el.classList.remove('hot');setTimeout(function(){el.style.transition='';},500);});
    });
    document.querySelectorAll('.svc article, .svc-card').forEach(function(el){
      el.addEventListener('pointermove',function(e){var r=el.getBoundingClientRect();el.style.setProperty('--mx',(e.clientX-r.left)+'px');el.style.setProperty('--my',(e.clientY-r.top)+'px');});
    });
    document.querySelectorAll('.btn').forEach(function(b){
      b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.25)+'px,'+((e.clientY-r.top-r.height/2)*.35)+'px)';});
      b.addEventListener('pointerleave',function(){b.style.transform='';});
    });
  }
  /* ================= interaction layer v2 ================= */
  function isEn(){return root.dataset.lang==='en';}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function fmt(n){return Math.round(n).toLocaleString('en-US');}
  function whenVisible(el,cb){if(!('IntersectionObserver' in window)){cb(true);return;}new IntersectionObserver(function(es){cb(es[0].isIntersecting);}).observe(el);}
  function hexRgb(h){h=h.replace('#','');var n=parseInt(h,16);return [n>>16&255,n>>8&255,n&255];}
  function hslHex(h,s,l){s/=100;l/=100;function k(n){return (n+h/30)%12;}var a=s*Math.min(l,1-l);function f(n){return l-a*Math.max(-1,Math.min(k(n)-3,9-k(n),1));}
    return '#'+[f(0),f(8),f(4)].map(function(x){var v=Math.round(x*255).toString(16);return v.length<2?'0'+v:v;}).join('');}
  var SIG=hexRgb(getComputedStyle(root).getPropertyValue('--signal').trim()||'#4C57F0');

  /* 12 accent drifts gently (indigo -> blue-violet) as you scroll */
  if(!reduce){
    var driftRaf=0;
    var drift=function(){driftRaf=0;var f=clamp(scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight),0,1),hex=hslHex(236+f*12,85,62);
      root.style.setProperty('--signal',hex);SIG=hexRgb(hex);};
    addEventListener('scroll',function(){if(!driftRaf)driftRaf=requestAnimationFrame(drift);},{passive:true});
    drift();
  }

  /* 01 logo cursor: switched off, the site uses the standard cursor (set to true to bring it back) */
  var LOGO_CURSOR=false;
  if(fine&&LOGO_CURSOR){
    var cm=document.createElement('div');cm.className='cur-mark';cm.setAttribute('aria-hidden','true');cm.innerHTML='<img src="assets/cerebro-mark.svg" alt="">';
    var cr=document.createElement('div');cr.className='cur-ring';cr.setAttribute('aria-hidden','true');cr.innerHTML='<img src="assets/cerebro-mark.svg" alt=""><b></b>';
    document.body.appendChild(cm);document.body.appendChild(cr);root.classList.add('has-cur','cur-off');
    var lbl=cr.querySelector('b'),cx=-200,cy=-200,rx=cx,ry=cy,rw=40,rh=40,rr=20,mode='free',tgt=null,down=false,shown='';
    var setMode=function(m){if(m===shown)return;['free','hover','stick','label','native'].forEach(function(k){root.classList.toggle('cur-'+k,k===m);});shown=m;};
    addEventListener('pointermove',function(e){if(e.pointerType!=='mouse')return;cx=e.clientX;cy=e.clientY;cm.style.transform='translate('+cx+'px,'+cy+'px)';root.classList.remove('cur-off');},{passive:true});
    document.addEventListener('mouseleave',function(){root.classList.add('cur-off');});
    document.addEventListener('pointerover',function(e){
      var el=e.target, t;
      if((t=el.closest('input, textarea, select'))){mode='native';tgt=null;}
      else if((t=el.closest('.btn, .lang button, .nav nav > a, .dd > button, .burger, .copy, .morph'))){mode='stick';tgt=t.closest('.morph.open')||t;}
      else if((t=el.closest('.svc-card, .case, .case-row, .rel, .post-item'))){mode='label';tgt=t;lbl.textContent=isEn()?'View':'ნახვა';}
      else if((t=el.closest('a, button, summary, .handle, [role="slider"]'))){mode='hover';tgt=t;}
      else {mode='free';tgt=null;}
    });
    addEventListener('pointerdown',function(){down=true;root.classList.add('cur-down');});
    addEventListener('pointerup',function(){down=false;root.classList.remove('cur-down');});
    var curTick=function(){
      var tx=cx,ty=cy,tw=40,th=40,tr=20;
      if(mode==='stick'&&tgt&&tgt.isConnected){var b=tgt.getBoundingClientRect(),cs=getComputedStyle(tgt),mx=b.left+b.width/2,my=b.top+b.height/2;
        tx=mx+(cx-mx)*.12;ty=my+(cy-my)*.12;tw=b.width+12;th=b.height+12;tr=Math.min(parseFloat(cs.borderTopLeftRadius)||8,b.height/2)+6;}
      else if(mode==='label'){tw=th=92;tr=46;}
      else if(mode==='hover'){tw=th=56;tr=28;}
      if(down){tw*=.85;th*=.85;}
      var k=reduce?1:.22;rx+=(tx-rx)*k;ry+=(ty-ry)*k;rw+=(tw-rw)*k;rh+=(th-rh)*k;rr+=(tr-rr)*k;
      cr.style.transform='translate('+(rx-rw/2)+'px,'+(ry-rh/2)+'px)';cr.style.width=rw+'px';cr.style.height=rh+'px';cr.style.borderRadius=rr+'px';
      setMode(mode);requestAnimationFrame(curTick);
    };
    curTick();
  }

  /* 02 living headline: split into letters (screen readers get the plain text) */
  var heads=[].slice.call(document.querySelectorAll('.hero h1, .page-hero h1'));
  heads.forEach(function(h){
    var parts=[].slice.call(h.querySelectorAll(':scope > span[lang]'));if(!parts.length)parts=[h];
    parts.forEach(function(p){
      var sr=document.createElement('span');sr.className='sr';sr.textContent=p.textContent.replace(/\s+/g,' ').trim();
      var vis=document.createElement('span');vis.className='vt';vis.setAttribute('aria-hidden','true');
      while(p.firstChild)vis.appendChild(p.firstChild);
      (function walk(n){[].slice.call(n.childNodes).forEach(function(c){
        if(c.nodeType===3){var f=document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function(w){if(!w)return;if(/^\s+$/.test(w)){f.appendChild(document.createTextNode(' '));return;}
            var ws=document.createElement('span');ws.className='vw';Array.from(w).forEach(function(ch){var s=document.createElement('span');s.className='ch';s.textContent=ch;ws.appendChild(s);});f.appendChild(ws);});
          c.parentNode.replaceChild(f,c);}
        else if(c.nodeType===1)walk(c);});})(vis);
      p.appendChild(sr);p.appendChild(vis);
    });
    if(!fine||reduce)return;
    var chars=[].slice.call(h.querySelectorAll('.ch')),raf=0,mx=-1e4,my=-1e4,zone=h.closest('.hero, .page-hero')||h;
    chars.forEach(function(c){c._ka=!!c.closest('[lang="ka"]');c._em=!!c.closest('em');});
    var apply=function(){raf=0;chars.forEach(function(c){if(!c.offsetWidth)return;
      var b=c.getBoundingClientRect(),d=Math.hypot(b.left+b.width/2-mx,b.top+b.height/2-my),t=Math.max(0,1-d/220),e=t*t*(3-2*t);
      if(e<.01){if(c.style.fontVariationSettings){c.style.fontVariationSettings='';c.style.textShadow='';}return;}
      c.style.fontVariationSettings='"wght" '+Math.round(800-480*e)+',"wdth" '+Math.round(c._ka?100-30*e:118-46*e);
      c.style.textShadow=c._em?'0 0 '+Math.round(36*e)+'px var(--signal)':'';});};
    zone.addEventListener('pointermove',function(e){mx=e.clientX;my=e.clientY;if(!raf)raf=requestAnimationFrame(apply);});
    zone.addEventListener('pointerleave',function(){mx=my=-1e4;if(!raf)raf=requestAnimationFrame(apply);});
    zone.addEventListener('click',function(e){if(e.target.closest('a, button, input, .plan'))return;
      chars.forEach(function(c){if(!c.offsetWidth)return;var b=c.getBoundingClientRect(),d=Math.hypot(b.left+b.width/2-e.clientX,b.top+b.height/2-e.clientY);
        setTimeout(function(){c.classList.add('kick');setTimeout(function(){c.classList.remove('kick');},260);},d*1.1);});});
  });

  /* Animated service icons (services grid + homepage) */
  var SVC_IC={
    'social-media':'<svg viewBox="0 0 48 48"><path class="ln" d="M11 11h26a5 5 0 0 1 5 5v13a5 5 0 0 1-5 5H23l-8 6v-6h-4a5 5 0 0 1-5-5V16a5 5 0 0 1 5-5z"/><path class="ht" d="M24 29s-7-4.3-7-8.6A3.6 3.6 0 0 1 24 19a3.6 3.6 0 0 1 7 1.4C31 24.7 24 29 24 29z"/><path class="ht2" d="M36 8s-3-1.9-3-3.8A1.6 1.6 0 0 1 36 3.6a1.6 1.6 0 0 1 3 .6C39 6.1 36 8 36 8z"/></svg>',
    'paid-ads':'<svg viewBox="0 0 48 48"><g class="mg"><circle class="ln" cx="21" cy="21" r="11"/><path class="ln" d="M29 29l10 10"/><path class="sh" d="M15.5 17.5a7 7 0 0 1 5-3.5"/></g><path class="cur" d="M34 8l7 2.5-3 1.2-1.2 3z"/></svg>',
    'real-estate':'<svg viewBox="0 0 48 48"><path class="ln" d="M6 41h36M12 41V12l12-5 12 5v29"/><g class="wn"><rect x="16" y="15" width="5" height="4" rx="1"/><rect x="27" y="15" width="5" height="4" rx="1"/><rect x="16" y="23" width="5" height="4" rx="1"/><rect x="27" y="23" width="5" height="4" rx="1"/><rect x="16" y="31" width="5" height="4" rx="1"/><rect x="27" y="31" width="5" height="4" rx="1"/></g></svg>',
    'branding':'<svg viewBox="0 0 48 48"><path class="ln hd" d="M8 34L18 10M40 34L30 10"/><path class="crv" d="M8 34C12 14 36 14 40 34"/><rect class="nd" x="5" y="31" width="6" height="6" rx="1"/><rect class="nd" x="37" y="31" width="6" height="6" rx="1"/><circle class="nd" cx="18" cy="10" r="2.5"/><circle class="nd" cx="30" cy="10" r="2.5"/><path class="sp" d="M24 36l1.6 3.4L29 41l-3.4 1.6L24 46l-1.6-3.4L19 41l3.4-1.6z"/></svg>',
    'content':'<svg viewBox="0 0 48 48"><rect class="ln" x="6" y="10" width="36" height="24" rx="5"/><path class="pl" d="M21 16.5v11l9-5.5z"/><path class="trk" d="M6 40h36"/><path class="prg" d="M6 40h36"/><circle class="rec" cx="37" cy="15" r="2"/></svg>',
    'analytics':'<svg viewBox="0 0 48 48"><path class="ln" d="M6 41h36"/><rect class="br b1" x="9" y="26" width="6" height="15" rx="1.5"/><rect class="br b2" x="19" y="20" width="6" height="21" rx="1.5"/><rect class="br b3" x="29" y="14" width="6" height="27" rx="1.5"/><path class="tr" d="M8 22l10-6 10 3 12-11"/><path class="ln" d="M35 8h5v5"/></svg>'
  };
  /* 03 spotlight cards: glowing edge shared across the grid + morphing icon */
  document.querySelectorAll('.svc-card').forEach(function(c,i){
    var key=(c.getAttribute('href')||'').replace(/^service-|\.html.*$/g,''),svg=SVC_IC[key],s=document.createElement('span');s.setAttribute('aria-hidden','true');
    if(svg){s.className='svc-ic svc-ic-'+key;s.innerHTML=svg;}else{s.className='shape s'+(i%3);}
    c.insertBefore(s,c.firstChild);
    var e=document.createElement('span');e.className='edge';e.setAttribute('aria-hidden','true');c.appendChild(e);});
  if(fine)document.querySelectorAll('.svc-grid').forEach(function(g){var cards=[].slice.call(g.querySelectorAll('.svc-card'));
    g.addEventListener('pointermove',function(e){cards.forEach(function(c){var r=c.getBoundingClientRect();c.style.setProperty('--gx',(e.clientX-r.left)+'px');c.style.setProperty('--gy',(e.clientY-r.top)+'px');});});
    g.addEventListener('pointerleave',function(){cards.forEach(function(c){c.style.removeProperty('--gx');c.style.removeProperty('--gy');});});});

  /* 04 liquid buttons + ripple */
  document.querySelectorAll('.btn').forEach(function(b){
    var f=document.createElement('span');f.className='fill';f.setAttribute('aria-hidden','true');b.insertBefore(f,b.firstChild);
    var at=function(e){var r=b.getBoundingClientRect();b.style.setProperty('--fx',(e.clientX-r.left)+'px');b.style.setProperty('--fy',(e.clientY-r.top)+'px');b.style.setProperty('--fd',(Math.hypot(r.width,r.height)*2.2)+'px');};
    b.addEventListener('pointerenter',at);b.addEventListener('pointerleave',at);
    b.addEventListener('pointerdown',function(e){if(reduce)return;var r=b.getBoundingClientRect(),s=document.createElement('span'),d=Math.max(r.width,r.height)*2.2;
      s.className='ripple';s.setAttribute('aria-hidden','true');s.style.cssText='width:'+d+'px;height:'+d+'px;left:'+(e.clientX-r.left)+'px;top:'+(e.clientY-r.top)+'px';
      b.appendChild(s);setTimeout(function(){s.remove();},700);});
  });
  /* 04b CTA band button morphs into a contact field, then hands off to the contact form */
  document.querySelectorAll('.cta-band .btn[href^="contact.html"]').forEach(function(a){
    var m=document.createElement('div');m.className='morph';a.parentNode.insertBefore(m,a);m.appendChild(a);
    var fm=document.createElement('form');fm.noValidate=true;fm.innerHTML='<input name="contact" type="text" autocomplete="email"><button type="submit"></button>';m.appendChild(fm);
    var inp=fm.querySelector('input'),sb=fm.querySelector('button');
    var txt=function(){inp.placeholder=isEn()?'Phone or email':'ტელეფონი ან იმეილი';inp.setAttribute('aria-label',inp.placeholder);sb.textContent=isEn()?'Next →':'შემდეგი →';};
    var close=function(){if(!m.classList.contains('open'))return;m.style.width=m.offsetWidth+'px';m.classList.remove('open');m.offsetWidth;m.style.width=a.offsetWidth+'px';
      setTimeout(function(){m.style.width='';},520);};
    a.addEventListener('click',function(e){e.preventDefault();txt();m.style.width=a.offsetWidth+'px';m.offsetWidth;m.classList.add('open');m.style.width='';setTimeout(function(){inp.focus();},250);});
    fm.addEventListener('submit',function(e){e.preventDefault();var v=inp.value.trim();if(!v){inp.focus();return;}
      try{sessionStorage.setItem('cerebro-contact',v);}catch(err){}m.classList.add('done');sb.textContent='✓';setTimeout(function(){location.href=a.getAttribute('href');},450);});
    m.addEventListener('keydown',function(e){if(e.key==='Escape'){close();a.focus();}});
    document.addEventListener('pointerdown',function(e){if(!m.contains(e.target)&&!inp.value)close();});
    document.addEventListener('cerebro:lang',txt);
  });

  /* 05 media plan calculator: benchmarks from a real Meta + Google campaign
     Meta reach per $1 by format (2,100–2,400 per $10), frequency per format, unique reach = sum x 0.8;
     Google Shopping: 35 impressions per $1, CPC $2.10; the ad budget is entered in USD */
  document.querySelectorAll('.plan.mp').forEach(function(plan){
    var OVERLAP=.8,CPV=.003,CPE=.015; // cost per video view and per post engagement, USD
    var F=[
      {ka:'Reels',en:'Reels',oka:'ცნობადობა',oen:'Awareness',rp:227.5,fq:2.0,c:'var(--aw)'},
      {ka:'ვიდეო',en:'Video',oka:'ცნობადობა · ჩართულობა',oen:'Awareness · engagement',rp:215,fq:2.4,c:'var(--co)'},
      {ka:'კარუსელი',en:'Carousel',oka:'ტრაფიკი',oen:'Traffic',rp:230,fq:2.1,c:'var(--rm)'},
      {ka:'Collection',en:'Collection',oka:'გაყიდვები',oen:'Sales',rp:210,fq:2.6,c:'var(--cv)'},
      {ka:'Google Shopping',en:'Google Shopping',oka:'გაყიდვები · კლიკები',oen:'Sales · clicks',imp:35,cpc:2.1,c:'var(--sig-dk)'}];
    // budget split per goal (Reels, Video, Carousel, Collection, Google Shopping), following the objectives in the plan
    var PRESETS={reach:[35,20,35,5,5],freq:[10,40,10,35,5],video:[40,50,5,5,0],eng:[35,25,30,5,5],sales:[5,10,10,40,35]};
    var GOALS=[['reach','Reach'],['freq','Frequency'],['video','Video views'],['eng','Post engagement'],['sales','Sales / Conversions']];
    var bud=plan.querySelector('.bud input'),out=plan.querySelector('.bud output'),body=plan.querySelector('.mp-body'),usd=plan.querySelector('.mp-usd');
    var w=PRESETS.reach.slice(),sel=1,on=[1,1,1,1,1];
    function E(){return isEn();}
    function L(f,k){return E()?f[k+'en'||'en']:f[k+'ka'];}
    function nm(i){return E()?F[i].en:F[i].ka;}
    function ob(i){return E()?F[i].oen:F[i].oka;}
    function pct(){var t=0,i,r=[];for(i=0;i<5;i++)t+=on[i]?w[i]:0;for(i=0;i<5;i++)r.push(on[i]&&t?w[i]/t*100:0);return r;}
    function calc(){var b=+bud.value,P=pct(),rows=[],mr=0,mi=0,si=0,cl=0;
      F.forEach(function(f,i){var u=b*P[i]/100,r={usd:u,p:P[i]};
        if(f.rp){r.reach=u*f.rp;r.imp=r.reach*f.fq;mr+=r.reach;mi+=r.imp;}else{r.imp=u*f.imp;r.clicks=u/f.cpc;si+=r.imp;cl+=r.clicks;}rows.push(r);});
      return {rows:rows,reach:mr*OVERLAP,imp:mi+si,freq:mr?mi/mr:0,clicks:cl,usd:b};}
    function k(n){return n>=1e6?(n/1e6).toFixed(n>=1e7?1:2).replace(/\.0+$/,'')+'M':n>=1e4?Math.round(n/1e3)+'K':fmt(n);}
    // animated numbers
    var anim=[];function num(el,v,f){el._t=v;el._f=f||fmt;if(el._v===undefined||reduce){el._v=v;el.textContent=el._f(v);return;}if(anim.indexOf(el)<0)anim.push(el);if(!anim.raf)anim.raf=requestAnimationFrame(tick);}
    function tick(){anim.raf=0;anim=anim.filter(function(el){el._v+=(el._t-el._v)*.18;if(Math.abs(el._t-el._v)<.5)el._v=el._t;el.textContent=el._f(el._v);return el._v!==el._t;});if(anim.length)anim.raf=requestAnimationFrame(tick);}
    function est(r,i){return F[i].rp?(E()?'reach ':'წვდომა ')+'≈ '+k(r.reach):(E()?'clicks ':'კლიკი ')+'≈ '+k(r.clicks);}
    function est2(r,i){return F[i].rp?(E()?'impressions ':'ჩვენება ')+k(r.imp)+' · '+(E()?'freq. ':'სიხშ. ')+F[i].fq.toFixed(1):(E()?'impressions ':'ჩვენება ')+k(r.imp)+' · CPC $'+F[i].cpc.toFixed(2);}
    function kpis(c){return '<div class="mp-kpis">'+
      '<div><small>'+(E()?'Unique reach':'უნიკალური წვდომა')+'</small><b data-k="reach"></b></div>'+
      '<div><small>'+(E()?'Impressions':'ჩვენებები')+'</small><b data-k="imp"></b></div>'+
      '<div><small>'+(E()?'Frequency':'სიხშირე')+'</small><b data-k="freq"></b></div>'+
      '<div><small>'+(E()?'Clicks':'კლიკები')+'</small><b data-k="clicks"></b></div></div>';}
    function fillK(c){var m={reach:[c.reach,k],imp:[c.imp,k],freq:[c.freq*10,function(v){return (v/10).toFixed(1);}],clicks:[c.clicks,k]};
      [].forEach.call(body.querySelectorAll('[data-k]'),function(el){var d=m[el.dataset.k];if(d)num(el,d[0],d[1]);});}
    function rowsHtml(){return '<div class="rows mp-rows">'+F.map(function(f,i){return '<div class="row" data-i="'+i+'"><span class="dot" style="background:'+f.c+'"></span><div><b>'+nm(i)+'</b><small>'+ob(i)+' · <span class="mp-e2"></span></small></div><span class="pct"><b class="mp-p"></b><small class="est"></small></span></div>';}).join('')+'</div>';}
    function fillRows(c){[].forEach.call(body.querySelectorAll('.mp-rows .row'),function(r){var i=+r.dataset.i,x=c.rows[i];r.querySelector('.mp-p').textContent=Math.round(x.p)+'%';r.querySelector('.est').textContent=est(x,i);r.querySelector('.mp-e2').textContent=est2(x,i);r.classList.toggle('mp-off',!on[i]);});}

    var V={
      goal:{g:'reach',build:function(){var self=this;
          body.innerHTML='<div class="mp-goals" role="group" aria-label="Goal">'+GOALS.map(function(g){return '<button type="button" data-g="'+g[0]+'">'+g[1]+'</button>';}).join('')+'</div>'+
            '<div class="mp-head"><small class="mp-hl"></small><b data-k="head"></b><span class="mp-hs"></span></div>'+
            '<div class="mp-bars">'+F.map(function(f,i){return '<div class="mp-b" data-i="'+i+'"><span>'+nm(i)+'</span><div><i style="background:'+f.c+'"></i></div><b class="mp-v"></b></div>';}).join('')+'</div>'+kpis();
          body.querySelector('.mp-goals').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;self.g=b.dataset.g;w=PRESETS[self.g].slice();update();});},
        update:function(c){var self=this,g=self.g,R=c.rows,mx=0,en=E(),hv,hl,hs;
          R.forEach(function(r){mx=Math.max(mx,r.imp);});
          [].forEach.call(body.querySelectorAll('.mp-goals button'),function(b){b.classList.toggle('on',b.dataset.g===g);b.setAttribute('aria-pressed',b.dataset.g===g);});
          [].forEach.call(body.querySelectorAll('.mp-b'),function(el){var i=+el.dataset.i,r=R[i];el.querySelector('i').style.width=(mx?r.imp/mx*100:0)+'%';el.classList.toggle('mp-zero',r.p<.5);
            el.querySelector('.mp-v').textContent=Math.round(r.p)+'% · '+(F[i].rp?k(r.reach):k(r.clicks)+(en?' clicks':' კლიკი'));});
          // headline number, computed only with the plan's formulas (reach per $10, x frequency, x 0.8 overlap, clicks = USD / 2.1)
          if(g==='reach'){hv=c.reach;hl=en?'Unique reach':'უნიკალური წვდომა';hs=(en?'all Meta formats × 0.8 overlap':'ყველა Meta ფორმატი × 0.8 გადაფარვა');}
          else if(g==='freq'){hv=c.freq*10;hl=en?'Average frequency':'საშუალო სიხშირე';hs=(en?'impressions ÷ reach':'ჩვენებები ÷ წვდომა');}
          else if(g==='video'){var vu=R[0].usd+R[1].usd;hv=vu/CPV;hl=en?'Video views':'ვიდეო ნახვები';hs='Reels + '+(en?'Video':'ვიდეო')+': $'+fmt(vu)+' ÷ $0.003';}
          else if(g==='eng'){var eu=R[0].usd+R[1].usd+R[2].usd;hv=eu/CPE;hl=en?'Post engagements':'პოსტის ჩართულობა';hs='Reels + '+(en?'Video + Carousel':'ვიდეო + კარუსელი')+': $'+fmt(eu)+' ÷ $0.015';}
          else {hv=R[3].reach;hl=en?'Collection reach':'Collection-ის წვდომა';hs='+ Google Shopping: '+k(R[4].clicks)+(en?' clicks':' კლიკი')+' · CPC $2.10';}
          body.querySelector('.mp-hl').textContent=hl;body.querySelector('.mp-hs').textContent=hs;
          num(body.querySelector('[data-k="head"]'),hv,g==='freq'?function(v){return (v/10).toFixed(1);}:k);
          fillK(c);}}
    };
    var cur;
    function update(){var c=calc();out.textContent='$'+fmt(+bud.value);usd.textContent='';if(cur)V[cur].update(c);}
    function use(v){cur='goal';plan.dataset.v='goal';V.goal.build();update();}
    bud.addEventListener('input',update);
    document.addEventListener('cerebro:lang',function(){use(cur);});
    use('goal');
  });


  /* 06 rolling number with a glowing ring */
  document.querySelectorAll('.proof .big').forEach(function(el){
    var to=el.textContent.trim();if(!/^\d+$/.test(to))return;var d=to.split('');
    el.innerHTML='<svg class="big-ring" viewBox="0 0 120 120" aria-hidden="true"><circle class="bg" cx="60" cy="60" r="57"/><circle class="fg" cx="60" cy="60" r="57" pathLength="1"/></svg>'+
      '<span class="roll" aria-hidden="true">'+d.map(function(){var s='';for(var k=0;k<20;k++)s+='<span>'+(k%10)+'</span>';return '<span class="col">'+s+'</span>';}).join('')+'</span><span class="sr">'+to+'</span>';
    var cols=[].slice.call(el.querySelectorAll('.col'));
    var roll=function(fast){cols.forEach(function(c,i){c.style.transition='none';c.style.transform='translateY(0)';c.offsetHeight;
      c.style.transition=reduce?'none':'transform '+(fast?.9:1.5)+'s cubic-bezier(.2,.8,.2,1) '+(i*.12)+'s';c.style.transform='translateY(-'+(10+(+d[i]))+'em)';});};
    cols.forEach(function(c,i){c.style.transform='translateY(-'+(10+(+d[i]))+'em)';});
    var done=false;whenVisible(el,function(v){if(v&&!done){done=true;el.classList.add('in');roll();}});
    el.addEventListener('pointerenter',function(){if(done)roll(true);});
  });

  /* 07 scroll-lit process */
  document.querySelectorAll('.steps').forEach(function(ol){
    var lis=[].slice.call(ol.children),raf=0;ol.classList.add('js');
    var upd=function(){raf=0;var r=ol.getBoundingClientRect(),vh=innerHeight,p=clamp((vh*.85-r.top)/(vh*.55),0,1);
      lis.forEach(function(li,i){var f=clamp(p*lis.length-i,0,1);li.style.setProperty('--f',f.toFixed(3));li.classList.toggle('lit',f>.97);});};
    addEventListener('scroll',function(){if(!raf)raf=requestAnimationFrame(upd);},{passive:true});addEventListener('resize',upd);upd();
  });

  /* 09 liquid glow shape around the hero media plan: switched off (set to true to bring it back) */
  var PLAN_BLOB=false;
  (function(){
    var plan=document.querySelector('.hero .plan'),band=plan&&plan.closest('.hero-band');if(!band||!PLAN_BLOB)return;
    var NS='http://www.w3.org/2000/svg',svg=document.createElementNS(NS,'svg');svg.setAttribute('class','blob');svg.setAttribute('aria-hidden','true');
    svg.innerHTML='<defs><radialGradient id="blobGrad" cx="40%" cy="35%" r="75%"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".4" style="stop-color:var(--signal)"/><stop offset="1" style="stop-color:var(--signal);stop-opacity:.1"/></radialGradient>'+
      '<filter id="blobBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40"/></filter></defs><g><path class="glow" filter="url(#blobBlur)"/><path class="core" fill="url(#blobGrad)"/></g>';
    band.insertBefore(svg,band.firstChild);
    var g=svg.querySelector('g'),glow=svg.querySelector('.glow'),core=svg.querySelector('.core');
    var N=10,t=0,mx=null,my=null,speed=0,hue=0,wob=0,cx=0,cy=0,vis=false,running=false;
    window.addEventListener('pointermove',function(e){var r=band.getBoundingClientRect(),nx=e.clientX-r.left,ny=e.clientY-r.top;
      if(ny<0||ny>r.height){mx=my=null;return;}if(mx!==null)speed+=Math.hypot(nx-mx,ny-my);mx=nx;my=ny;},{passive:true});
    band.addEventListener('pointerleave',function(){mx=my=null;});
    band.addEventListener('pointerdown',function(){wob=1;});
    var draw=function(){
      var br=band.getBoundingClientRect(),pr=plan.getBoundingClientRect(),hx=pr.left-br.left+pr.width/2,hy=pr.top-br.top+pr.height/2;
      if(!cx){cx=hx;cy=hy;}var tx=mx===null?hx:hx+(mx-hx)*.12,ty=my===null?hy:hy+(my-hy)*.12;cx+=(tx-cx)*.06;cy+=(ty-cy)*.06;
      speed*=.9;hue+=(clamp(speed*.5,0,120)-hue)*.08;wob*=.96;
      var R=Math.max(pr.width,pr.height)*.5,pa=mx===null?0:Math.atan2(my-cy,mx-cx),pd=mx===null?0:clamp(1-Math.hypot(mx-cx,my-cy)/(R*3),0,1),pts=[];
      for(var i=0;i<N;i++){var a=i/N*Math.PI*2,r=R*(1+.08*Math.sin(t*1.1+i*1.7)+.06*Math.sin(t*1.7+i*2.9)+wob*.2*Math.sin(t*14+i*2.2)),al=Math.cos(a-pa);
        if(al>0)r+=R*.4*pd*Math.pow(al,3);pts.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}
      var d='M'+pts[0][0].toFixed(1)+','+pts[0][1].toFixed(1);
      for(var j=0;j<N;j++){var p0=pts[(j-1+N)%N],p1=pts[j],p2=pts[(j+1)%N],p3=pts[(j+2)%N];
        d+=' C'+(p1[0]+(p2[0]-p0[0])/6).toFixed(1)+','+(p1[1]+(p2[1]-p0[1])/6).toFixed(1)+' '+(p2[0]-(p3[0]-p1[0])/6).toFixed(1)+','+(p2[1]-(p3[1]-p1[1])/6).toFixed(1)+' '+p2[0].toFixed(1)+','+p2[1].toFixed(1);}
      glow.setAttribute('d',d+'Z');core.setAttribute('d',d+'Z');g.style.filter=hue>.5?'hue-rotate('+hue.toFixed(1)+'deg)':'';};
    var loop=function(){if(!vis){running=false;return;}t+=.016;draw();requestAnimationFrame(loop);};
    if(reduce){draw();addEventListener('resize',draw);return;}
    whenVisible(band,function(v){vis=v;if(v&&!running){running=true;requestAnimationFrame(loop);}});
  })();

  /* 10 reactive dot grid in dark bands */
  document.querySelectorAll('section.dark').forEach(function(sec){
    var cv=document.createElement('canvas');cv.className='dots';cv.setAttribute('aria-hidden','true');sec.insertBefore(cv,sec.firstChild);
    var ctx=cv.getContext('2d'),dpr=Math.min(devicePixelRatio||1,2),W=0,H=0,mx=-999,my=-999,rip=[],vis=false,running=false,gap=24;
    var size=function(){W=sec.offsetWidth;H=sec.offsetHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);};
    var draw=function(){ctx.clearRect(0,0,W,H);var R=SIG[0],G=SIG[1],B=SIG[2];
      rip.forEach(function(p){p.r+=reduce?60:8;p.life*=.975;});rip=rip.filter(function(p){return p.life>.05&&p.r<Math.max(W,H)*1.4;});
      for(var y=gap/2;y<H;y+=gap)for(var x=gap/2;x<W;x+=gap){var d=Math.hypot(x-mx,y-my),t=Math.max(0,1-d/170);t*=t;
        for(var k=0;k<rip.length;k++){var p=rip[k],band=Math.abs(Math.hypot(x-p.x,y-p.y)-p.r);if(band<26)t=Math.max(t,(1-band/26)*p.life);}
        ctx.fillStyle=t>.02?'rgba('+Math.round(255+(R-255)*t)+','+Math.round(255+(G-255)*t)+','+Math.round(255+(B-255)*t)+','+(.09+.8*t)+')':'rgba(255,255,255,.09)';
        ctx.beginPath();ctx.arc(x,y,1.1+3*t,0,6.283);ctx.fill();}};
    var loop=function(){draw();if(vis&&(mx>-999||rip.length))requestAnimationFrame(loop);else running=false;};
    var kick=function(){if(!running&&vis){running=true;requestAnimationFrame(loop);}};
    size();addEventListener('resize',function(){size();draw();});
    sec.addEventListener('pointermove',function(e){var r=sec.getBoundingClientRect();mx=e.clientX-r.left;my=e.clientY-r.top;kick();});
    sec.addEventListener('pointerleave',function(){mx=my=-999;kick();});
    sec.addEventListener('pointerdown',function(e){var r=sec.getBoundingClientRect();rip.push({x:e.clientX-r.left,y:e.clientY-r.top,r:0,life:1});kick();});
    whenVisible(sec,function(v){vis=v;if(v){size();draw();}});
  });

  /* 11 glowing nav pill + sliding language knob */
  var nav=document.querySelector('.nav nav');
  if(nav&&fine){
    var pill=document.createElement('span');pill.className='nav-pill';pill.setAttribute('aria-hidden','true');nav.insertBefore(pill,nav.firstChild);root.classList.add('has-pill');
    var items=[].slice.call(nav.querySelectorAll(':scope > a, :scope > .dd > button'));
    var active=function(){return nav.querySelector(':scope > a.active')||nav.querySelector(':scope > .dd.active > button');};
    var to=function(el){if(!el||!el.offsetWidth){pill.style.opacity=0;return;}var nr=nav.getBoundingClientRect(),r=el.getBoundingClientRect(),hidden=pill.style.opacity!=='1';
      if(hidden)pill.style.transition='opacity .3s';
      pill.style.transform='translate('+(r.left-nr.left-9)+'px,'+(r.top-nr.top-6)+'px)';pill.style.width=(r.width+18)+'px';pill.style.height=(r.height+12)+'px';pill.style.opacity='1';
      if(hidden){pill.offsetWidth;pill.style.transition='';}};
    items.forEach(function(el){el.addEventListener('pointerenter',function(){to(el);});el.addEventListener('focus',function(){to(el);});});
    nav.addEventListener('pointerleave',function(){to(active());});
    var re=function(){pill.style.opacity='';to(active());};
    addEventListener('resize',re);document.addEventListener('cerebro:lang',re);if(document.fonts)document.fonts.ready.then(re);re();
  }
  document.querySelectorAll('.lang').forEach(function(gp){
    var k=document.createElement('span');k.className='lang-knob';k.setAttribute('aria-hidden','true');gp.insertBefore(k,gp.firstChild);root.classList.add('has-knob');
    var place=function(){var b=gp.querySelector('button[aria-pressed="true"]');if(!b)return;k.style.width=b.offsetWidth+'px';k.style.transform='translateX('+b.offsetLeft+'px)';};
    place();document.addEventListener('cerebro:lang',place);if(document.fonts)document.fonts.ready.then(place);
  });

  /* ================= social media marketing page ================= */
  // content-type tabs (Educational / Entertaining)
  document.querySelectorAll('.ctabs').forEach(function(tl){
    var card=tl.closest('.dsec')||tl.closest('.dir'),tabs=[].slice.call(tl.querySelectorAll('[role="tab"]'));
    var show=function(t){tabs.forEach(function(b){b.setAttribute('aria-selected',String(b===t));});
      card.querySelectorAll('[data-panel]').forEach(function(p){p.hidden=p.dataset.panel!==t.dataset.tab;});};
    tabs.forEach(function(t,i){t.addEventListener('click',function(){show(t);});
      t.addEventListener('keydown',function(e){if(e.key==='ArrowRight'||e.key==='ArrowLeft'){var n=tabs[(i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length];n.focus();show(n);e.preventDefault();}});});
  });
  // likes and poll in the phone mockup
  document.querySelectorAll('.like').forEach(function(b){b.setAttribute('aria-pressed','false');
    b.addEventListener('click',function(){var on=b.classList.toggle('on');b.setAttribute('aria-pressed',String(on));});});
  document.querySelectorAll('.poll').forEach(function(p){var a=+p.dataset.a||50,bs=[].slice.call(p.querySelectorAll('button'));
    bs.forEach(function(b){b.addEventListener('click',function(){if(p.classList.contains('voted'))return;p.classList.add('voted');b.classList.add('mine');
      bs.forEach(function(x){var v=x.dataset.o==='a'?a:100-a;x.style.setProperty('--p',v+'%');x.querySelector('em').textContent=v+'%';});});});});
  // campaign builder toggles
  document.querySelectorAll('.adsb .tog').forEach(function(t){t.addEventListener('click',function(){var on=t.classList.toggle('on');t.setAttribute('aria-pressed',String(on));
    var row=t.closest('.adsb-row');row.classList.toggle('off',!on);
    if(row.classList.contains('l1')){[].slice.call(row.parentNode.querySelectorAll('.adsb-row')).forEach(function(r){if(r!==row)r.classList.toggle('off',!on);});}});});
  // interactive funnel
  document.querySelectorAll('.fun').forEach(function(f){
    var btns=[].slice.call(f.querySelectorAll('.fs, .f2-band')),panels=[].slice.call(f.querySelectorAll('.fp')),dots=[].slice.call(f.querySelectorAll('.fp-dots i')),cur=0;
    var go=function(i,focus){cur=(i+btns.length)%btns.length;
      btns.forEach(function(b,k){b.setAttribute('aria-pressed',String(k===cur));});
      panels.forEach(function(p,k){p.hidden=k!==cur;});dots.forEach(function(d,k){d.classList.toggle('on',k===cur);});
      if(focus)btns[cur].focus();};
    btns.forEach(function(b,i){b.addEventListener('click',function(){go(i);});
      b.addEventListener('keydown',function(e){if(e.key==='ArrowDown'||e.key==='ArrowRight'){go(cur+1,true);e.preventDefault();}if(e.key==='ArrowUp'||e.key==='ArrowLeft'){go(cur-1,true);e.preventDefault();}});});
    var prev=f.querySelector('.fp-prev'),next=f.querySelector('.fp-next');
    if(prev)prev.addEventListener('click',function(){go(cur-1);});if(next)next.addEventListener('click',function(){go(cur+1);});
  });

  // real-ad posts: "See more" and likes
  document.querySelectorAll('.fbp-see').forEach(function(b){b.addEventListener('click',function(){var c=b.parentNode;c.classList.add('open');var f=c.querySelector('.fbp-full');if(f)f.hidden=false;});});
  document.querySelectorAll('.fbp-like').forEach(function(b){var n=b.querySelector('.n'),base=n.textContent,num=+n.dataset.n;
    b.addEventListener('click',function(){var on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',String(on));
      if(/^\d+$/.test(base))n.textContent=on?String(num+1):base;});});

  // Instagram-style carousels (swipe, arrows, dots, keyboard) + ad tabs
  document.querySelectorAll('.igc').forEach(function(c){
    var track=c.querySelector('.igc-track'),n=track.children.length,i=0,count=c.querySelector('.igc-count'),
        prev=c.querySelector('.igc-prev'),next=c.querySelector('.igc-next'),dots=c.parentNode.querySelector('.igc-dots');
    if(dots){for(var k=0;k<n;k++)dots.appendChild(document.createElement('i'));}
    var go=function(t){i=clamp(t,0,n-1);track.style.transform='translateX('+(-i*100)+'%)';count.textContent=(i+1)+'/'+n;
      prev.disabled=i===0;next.disabled=i===n-1;if(dots)[].slice.call(dots.children).forEach(function(d,k){d.classList.toggle('on',k===i);});};
    prev.addEventListener('click',function(e){e.stopPropagation();go(i-1);});next.addEventListener('click',function(e){e.stopPropagation();go(i+1);});
    c.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){go(i+1);e.preventDefault();}if(e.key==='ArrowLeft'){go(i-1);e.preventDefault();}});
    var sx=null,dx=0,w=1;
    c.addEventListener('pointerdown',function(e){if(e.target.closest('.igc-btn'))return;sx=e.clientX;dx=0;w=c.offsetWidth;track.classList.add('drag');c.setPointerCapture(e.pointerId);});
    c.addEventListener('pointermove',function(e){if(sx===null)return;dx=e.clientX-sx;track.style.transform='translateX(calc('+(-i*100)+'% + '+dx+'px))';});
    var end=function(){if(sx===null)return;track.classList.remove('drag');var t=i;if(dx<-w*.18)t=i+1;else if(dx>w*.18)t=i-1;sx=null;go(t);};
    c.addEventListener('pointerup',end);c.addEventListener('pointercancel',end);
    go(0);
    // auto-advance once per second, looping; pauses on hover, drag, focus, when hidden or off screen
    var hover=false,seen=false;
    c.addEventListener('pointerenter',function(){hover=true;});c.addEventListener('pointerleave',function(){hover=false;});
    c.addEventListener('focusin',function(){hover=true;});c.addEventListener('focusout',function(){hover=false;});
    whenVisible(c,function(v){seen=v;});
    setInterval(function(){if(!seen||hover||sx!==null||c.closest('[hidden]')||document.hidden)return;go(i<n-1?i+1:0);},1000);
  });
  document.querySelectorAll('.ag-tabs').forEach(function(tl){
    var tabs=[].slice.call(tl.querySelectorAll('[role="tab"]')),wrap=tl.closest('.adgal2');
    var show=function(t){tabs.forEach(function(b){b.setAttribute('aria-selected',String(b===t));});
      wrap.querySelectorAll('.igp').forEach(function(p){p.hidden=p.dataset.ad!==t.dataset.ad;});};
    tabs.forEach(function(t){t.addEventListener('click',function(){show(t);});});
  });

  // Reels video ad: play only while its tab is open and on screen; sound toggle; progress bar
  document.querySelectorAll('.reel').forEach(function(r){
    var v=r.querySelector('video'),btn=r.querySelector('.reel-sound'),bar=r.querySelector('.reel-bar i'),seen=false;
    var sync=function(){var show=seen&&!r.closest('[hidden]');if(show){if(v.preload==='none')v.preload='auto';var p=v.play();if(p&&p.catch)p.catch(function(){});}else v.pause();};
    whenVisible(r,function(vis){seen=vis;sync();});
    document.querySelectorAll('.ag-tabs [role="tab"]').forEach(function(t){t.addEventListener('click',function(){setTimeout(sync,0);});});
    btn.addEventListener('click',function(){v.muted=!v.muted;btn.setAttribute('aria-pressed',String(!v.muted));if(!v.muted){var p=v.play();if(p&&p.catch)p.catch(function(){});}});
    v.addEventListener('timeupdate',function(){if(v.duration)bar.style.width=(v.currentTime/v.duration*100)+'%';});
  });

  // lead generation scheme: channels light up one after another; hover a channel to focus it
  document.querySelectorAll('.lgs').forEach(function(s){
    var chs=[].slice.call(s.querySelectorAll('.lg-ch')),k=0,hold=false,seen=true;
    var set=function(i){chs.forEach(function(c,j){c.classList.toggle('on',j===i);});};
    chs.forEach(function(c,i){c.addEventListener('pointerenter',function(){hold=true;set(i);});c.addEventListener('pointerleave',function(){hold=false;});});
    whenVisible(s,function(v){seen=v;});
    set(0);
    setInterval(function(){if(hold||!seen||document.hidden)return;k=(k+1)%chs.length;set(k);},1300);
    if(reduce)s.querySelectorAll('animateMotion').forEach(function(a){a.parentNode.style.display='none';});
  });

  // Google page: replay an embedded HTML5 banner
  document.querySelectorAll('.gx-replay').forEach(function(b){b.addEventListener('click',function(){var f=document.getElementById(b.dataset.target);if(f)f.src=f.src;});});

  // Google page: search example types the query, then reveals the results
  document.querySelectorAll('.gs').forEach(function(g){
    var q=g.querySelector('.gs-q'),text=Array.from(q.dataset.q),timer=null,done=false;
    var run=function(){clearTimeout(timer);g.classList.remove('show');q.textContent='';var i=0;
      if(reduce){q.textContent=text.join('');g.classList.add('show');return;}
      (function step(){if(i<text.length){q.textContent+=text[i++];timer=setTimeout(step,140);}else timer=setTimeout(function(){g.classList.add('show');},350);})();};
    whenVisible(g,function(v){if(v&&!done){done=true;run();}});
    var sec=g.closest('.gx-search'),btn=sec&&sec.querySelector('.gs-replay');if(btn)btn.addEventListener('click',run);
  });

  // Google page: shopping carousel arrows
  document.querySelectorAll('.gp-car').forEach(function(c){
    var t=c.querySelector('.gp-track'),p=c.querySelector('.gp-prev'),n=c.querySelector('.gp-next');
    var upd=function(){p.disabled=t.scrollLeft<4;n.disabled=t.scrollLeft+t.clientWidth>=t.scrollWidth-4;};
    var step=function(d){var card=t.querySelector('.gp-card');t.scrollBy({left:d*((card?card.offsetWidth:150)+10)*2,behavior:reduce?'auto':'smooth'});};
    p.addEventListener('click',function(){step(-1);});n.addEventListener('click',function(){step(1);});
    t.addEventListener('scroll',upd,{passive:true});addEventListener('resize',upd);upd();
  });

  // Google page: YouTube in-stream ad (plays when on screen, skip after 5s, replay)
  document.querySelectorAll('.yt').forEach(function(y){
    var v=y.querySelector('.yt-v'),skip=y.querySelector('.yt-skip'),cnt=y.querySelector('.yt-count'),time=y.querySelector('.yt-time'),
        bar=y.querySelector('.yt-bar i'),done=y.querySelector('.yt-done'),snd=y.querySelector('.yt-sound'),seen=false,started=false;
    var fmt=function(s){s=Math.max(0,Math.ceil(s));return '0:'+(s<10?'0':'')+s;};
    var play=function(){if(v.preload==='none')v.preload='auto';var p=v.play();if(p&&p.catch)p.catch(function(){});};
    var start=function(){done.hidden=true;skip.disabled=true;cnt.textContent='5';v.currentTime=0;started=true;play();};
    v.addEventListener('timeupdate',function(){var d=v.duration||9.25,t=v.currentTime;bar.style.width=(t/d*100)+'%';time.textContent=fmt(d-t);
      var left=5-t;if(left>0){cnt.textContent=Math.ceil(left);}else skip.disabled=false;});
    v.addEventListener('ended',function(){skip.disabled=true;done.hidden=false;done.firstChild&&0;});
    skip.addEventListener('click',function(){if(skip.disabled)return;v.pause();done.hidden=false;});
    snd.addEventListener('click',function(){v.muted=!v.muted;snd.setAttribute('aria-pressed',String(!v.muted));if(!v.muted)play();});
    whenVisible(y,function(vis){seen=vis;if(vis){if(!started)start();else if(done.hidden)play();}else v.pause();});
    var sec=y.closest('.gx-yt'),btn=sec&&sec.querySelector('.yt-replay');if(btn)btn.addEventListener('click',start);
  });

  // Google page: line up each ad title with the top of its creative (results, products, banner, player)
  (function(){
    var splits=[].slice.call(document.querySelectorAll('.gx-split'));if(!splits.length)return;
    var align=function(){splits.forEach(function(s){
      var t=s.querySelector('.gx-text'),f=s.querySelector('.gx-browser')||s.querySelector('[data-focus]');if(!t||!f)return;
      if(innerWidth<=980){t.style.marginTop='';return;}
      t.style.marginTop='0px';
      var ttl=t.querySelector('.dtitle')||t,t0=ttl.getBoundingClientRect().top,fr=f.getBoundingClientRect();
      var m=Math.max(0,fr.top-t0);t.style.marginTop=m+'px';});};   // title top = top of the browser mockup
    addEventListener('resize',align);addEventListener('load',align);
    if(document.fonts)document.fonts.ready.then(align);
    document.addEventListener('cerebro:lang',align);
    setTimeout(align,300);align();
  })();

  // Google page: ad-type cards flip on click; grid fades in when it scrolls into view
  document.querySelectorAll('.gt-grid').forEach(function(g){
    whenVisible(g,function(v){if(v)g.classList.add('in');});
    g.querySelectorAll('.gt-card').forEach(function(c){var b=c.querySelector('.gt-inner');
      b.addEventListener('click',function(){var o=c.classList.toggle('open');b.setAttribute('aria-expanded',String(o));});});
  });

  // Google page: Performance Max diagram — hover/click an element to explain it; auto-tour when idle
  document.querySelectorAll('.pm').forEach(function(pm){
    var info=pm.closest('.pmx').querySelector('.pm-info'),t=info.querySelector('.pm-info-t'),d=info.querySelector('.pm-info-d');
    var nodes=[].slice.call(pm.querySelectorAll('.pm-in, .pm-ch, .pm-core')),hold=false,k=-1,seen=false;
    var title=function(n){var lab=n.querySelector('.pm-lab');if(lab)return lab.innerHTML;if(n.classList.contains('pm-core'))return '<span lang="ka">ხელოვნური ინტელექტი</span><span lang="en">Google AI</span>';return n.getAttribute('aria-label');};
    var show=function(n){nodes.forEach(function(x){x.classList.toggle('on',x===n);});
      var desc=n.querySelector('.pm-d').cloneNode(true);var b=desc.querySelector('b');if(b)b.remove();
      t.innerHTML=title(n);d.innerHTML=desc.innerHTML.replace(/^\s*·\s*/,'');info.classList.remove('flash');void info.offsetWidth;info.classList.add('flash');};
    nodes.forEach(function(n){n.addEventListener('pointerenter',function(){hold=true;show(n);});n.addEventListener('pointerleave',function(){hold=false;});
      n.addEventListener('focus',function(){hold=true;show(n);});n.addEventListener('blur',function(){hold=false;});n.addEventListener('click',function(){show(n);});});
    whenVisible(pm,function(v){seen=v;});
    var order=nodes.filter(function(n){return n.classList.contains('pm-in');}).concat(nodes.filter(function(n){return n.classList.contains('pm-core');}),nodes.filter(function(n){return n.classList.contains('pm-ch');}));
    setInterval(function(){if(hold||!seen||document.hidden||reduce)return;k=(k+1)%order.length;show(order[k]);},2600);
  });
  /* Brand book showroom */
  document.querySelectorAll('.bsr').forEach(function(sr){
    var img=sr.querySelector('.bsr-img'),name=sr.querySelector('.bsr-name'),th=sr.querySelector('.bsr-thumbs'),bg=sr.querySelector('.bsr-bg'),t;
    th.addEventListener('click',function(e){
      var b=e.target.closest('button');if(!b||b.classList.contains('on'))return;
      th.querySelectorAll('button').forEach(function(x){var on=x===b;x.classList.toggle('on',on);x.setAttribute('aria-pressed',on);});
      name.innerHTML=b.querySelector('.bsr-t').innerHTML;
      clearTimeout(t);img.classList.add('out');
      t=setTimeout(function(){img.src=b.dataset.src;img.alt=b.dataset.alt;img.classList.remove('out');},reduce?0:220);
    });
    bg.addEventListener('click',function(e){
      var b=e.target.closest('button');if(!b)return;
      bg.querySelectorAll('button').forEach(function(x){var on=x===b;x.classList.toggle('on',on);x.setAttribute('aria-pressed',on);});
      sr.style.setProperty('--stage',b.dataset.c);
    });
  });
  /* Brand strategy path: line fills and steps light up on scroll */
  (function(){
    var p=document.querySelector('.bpath');if(!p)return;
    var fill=p.querySelector('.bp-fill'),steps=p.querySelectorAll('.bp-step'),tick=false;
    if(reduce){fill.style.height='100%';steps.forEach(function(s){s.classList.add('lit');});return;}
    function upd(){tick=false;var r=p.getBoundingClientRect(),h=Math.max(0,Math.min(r.height,innerHeight*.62-r.top));fill.style.height=h+'px';
      steps.forEach(function(s){s.classList.toggle('lit',s.offsetTop<h);});}
    addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(upd);}},{passive:true});
    addEventListener('resize',upd);upd();
  })();
  /* Social media advertising elements: wires from Audience, auto-tour, hover to focus */
  document.querySelectorAll('.sma').forEach(function(w){
    var svg=w.querySelector('.sma-svg'),g=svg.querySelector('.sma-wires'),dot=svg.querySelector('.sma-dot'),nodes=[].slice.call(w.querySelectorAll('.sma-n')),NS='http://www.w3.org/2000/svg';
    // centre (260,260) r≈107; outer nodes at 21%/79% x 22%/78% with r≈91 (viewBox 520)
    var C=[260,260],RC=112,RO=96,pos={1:[109,114],2:[411,114],3:[411,406],4:[109,406]},paths={};
    // curve bend per node: control point pushes the wire around like the reference arrows
    var bend={1:[260,110],2:[420,260],3:[260,410],4:[100,260]};
    [1,2,3,4].forEach(function(k){
      var o=pos[k],cp=bend[k];
      var a=Math.atan2(cp[1]-C[1],cp[0]-C[0]),s=[C[0]+RC*Math.cos(a),C[1]+RC*Math.sin(a)];
      var b=Math.atan2(cp[1]-o[1],cp[0]-o[0]),e=[o[0]+RO*Math.cos(b),o[1]+RO*Math.sin(b)];
      var p=document.createElementNS(NS,'path');p.setAttribute('d','M'+s.join(' ')+' Q'+cp.join(' ')+' '+e.join(' '));p.setAttribute('marker-end','url(#smaHead)');g.appendChild(p);paths[k]=p;
    });
    var cur=1,hold=false,seen=true,t0=performance.now();
    function set(k){if(k<1)return;cur=k;t0=performance.now();nodes.forEach(function(n){var nk=+n.dataset.k;n.classList.toggle('on',nk===k||nk===0);});
      Object.keys(paths).forEach(function(j){paths[j].classList.toggle('on',+j===k);});}
    set(1);
    function loop(now){var p=paths[cur],L=p.getTotalLength(),f=((now-t0)%1400)/1400,pt=p.getPointAtLength(L*f);dot.setAttribute('cx',pt.x);dot.setAttribute('cy',pt.y);requestAnimationFrame(loop);}
    if(!reduce)requestAnimationFrame(loop);
    nodes.forEach(function(n){var k=+n.dataset.k;
      n.addEventListener('mouseenter',function(){if(k){hold=true;set(k);}});
      n.addEventListener('focus',function(){if(k){hold=true;set(k);}});
      n.addEventListener('click',function(){if(k){hold=true;set(k);}});
    });
    w.addEventListener('mouseleave',function(){hold=false;});
    whenVisible(w,function(v){seen=v;});
    setInterval(function(){if(hold||!seen||document.hidden||reduce)return;set(cur%4+1);},2600);
  });
  /* Real-estate portfolio filter */
  document.querySelectorAll('.rport').forEach(function(sec){
    var bar=sec.querySelector('.rp-filter'),cards=[].slice.call(sec.querySelectorAll('.rp-card'));
    bar.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var f=b.dataset.f;
      bar.querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',x===b);});
      cards.forEach(function(c){var show=f==='all'||(' '+c.dataset.loc+' ').indexOf(' '+f+' ')>-1;c.classList.toggle('off',!show);c.classList.remove('pop');if(show&&!reduce){void c.offsetWidth;c.classList.add('pop');}});
    });
  });
})();
