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
    var stg=[css('--aw')||'#C3B1FF',css('--co')||'#A68BFF',css('--rm')||'#8864FF',css('--cv')||'#6A3DFF'].map(rgb);
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
  var SIG=hexRgb(getComputedStyle(root).getPropertyValue('--signal').trim()||'#6A3DFF');

  /* 12 accent drifts gently (violet -> purple) as you scroll */
  if(!reduce){
    var driftRaf=0;
    var drift=function(){driftRaf=0;var f=clamp(scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight),0,1),hex=hslHex(254+f*18,100,62);
      root.style.setProperty('--signal',hex);SIG=hexRgb(hex);};
    addEventListener('scroll',function(){if(!driftRaf)driftRaf=requestAnimationFrame(drift);},{passive:true});
    drift();
  }

  /* 01 logo cursor */
  if(fine){
    var cm=document.createElement('div');cm.className='cur-mark';cm.setAttribute('aria-hidden','true');cm.innerHTML='<img src="assets/cerebro-mark.svg" alt="">';
    var cr=document.createElement('div');cr.className='cur-ring';cr.setAttribute('aria-hidden','true');cr.innerHTML='<b></b>';
    document.body.appendChild(cm);document.body.appendChild(cr);root.classList.add('has-cur','cur-off');
    var lbl=cr.firstChild,cx=-200,cy=-200,rx=cx,ry=cy,rw=40,rh=40,rr=20,mode='free',tgt=null,down=false,shown='';
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
      else if(mode==='label'){tw=th=84;tr=42;}
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

  /* 03 spotlight cards: glowing edge shared across the grid + morphing icon */
  document.querySelectorAll('.svc-card').forEach(function(c,i){
    var s=document.createElement('span');s.className='shape s'+(i%3);s.setAttribute('aria-hidden','true');c.insertBefore(s,c.firstChild);
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

  /* 05 playable media plan: drag the split, change the budget, see estimates */
  document.querySelectorAll('.plan').forEach(function(plan){
    var stack=plan.querySelector('.stack'),bud=plan.querySelector('.bud input'),out=plan.querySelector('.bud output');
    var segs=[].slice.call(stack.querySelectorAll('i')),rows=[].slice.call(plan.querySelectorAll('.row'));
    var focus=function(list){plan.classList.toggle('focus',list.length>0);segs.forEach(function(s,i){s.classList.toggle('on',list.indexOf(i)>-1);});rows.forEach(function(r,i){r.classList.toggle('lit',list.indexOf(i)>-1);});};
    rows.forEach(function(r,i){r.addEventListener('pointerenter',function(){focus([i]);});r.addEventListener('pointerleave',function(){focus([]);});});
    segs.forEach(function(s,i){s.addEventListener('pointerenter',function(){focus([i]);});s.addEventListener('pointerleave',function(){focus([]);});});
    if(!bud)return;
    var pct=segs.map(function(s){return parseFloat(s.style.getPropertyValue('--w'))||25;});
    var rate=[function(b){return b/4*1000;},function(b){return b/.5;},function(b){return b/.35;},function(b){return b/15;}];
    var unit=[['impressions','ჩვენება'],['clicks','კლიკი'],['visits','ვიზიტი'],['leads','ლიდი']];
    var shown=[0,0,0,0],tw=0;
    var handles=[0,1,2].map(function(i){var h=document.createElement('span');h.className='handle';h.tabIndex=0;h.setAttribute('role','slider');
      h.setAttribute('aria-valuemin','5');h.setAttribute('aria-valuemax','95');stack.appendChild(h);return h;});
    var names=function(i){var b=rows[i].querySelector('b span[lang="'+(isEn()?'en':'ka')+'"]');return b?b.textContent:'';};
    var render=function(){var acc=0;segs.forEach(function(s,i){s.style.setProperty('--w',pct[i]);});
      handles.forEach(function(h,i){acc+=pct[i];h.style.left=acc+'%';h.setAttribute('aria-valuenow',acc);h.setAttribute('aria-label',names(i)+' / '+names(i+1));});
      rows.forEach(function(r,i){r.querySelector('.pct b').textContent=pct[i]+'%';});out.textContent=fmt(+bud.value)+' ₾';};
    var tween=function(){tw=0;var b=+bud.value,moving=false,E=isEn();
      rows.forEach(function(r,i){var t=rate[i](b*pct[i]/100);shown[i]=reduce?t:shown[i]+(t-shown[i])*.2;if(Math.abs(t-shown[i])>.5)moving=true;else shown[i]=t;
        r.querySelector('.est').textContent='≈ '+fmt(shown[i])+' '+unit[i][E?0:1];});
      if(moving)tw=requestAnimationFrame(tween);};
    var update=function(){render();if(!tw)tw=requestAnimationFrame(tween);};
    var moveCut=function(i,cut){var left=0;for(var k=0;k<i;k++)left+=pct[k];var right=left+pct[i]+pct[i+1];cut=clamp(Math.round(cut),left+5,right-5);
      pct[i]=cut-left;pct[i+1]=right-cut;stack.classList.add('used');update();};
    handles.forEach(function(h,i){
      h.addEventListener('pointerdown',function(e){e.preventDefault();h.setPointerCapture(e.pointerId);h.classList.add('drag');focus([i,i+1]);});
      h.addEventListener('pointermove',function(e){if(!h.classList.contains('drag'))return;var r=stack.getBoundingClientRect();moveCut(i,(e.clientX-r.left)/r.width*100);});
      var end=function(){h.classList.remove('drag');focus([]);};h.addEventListener('pointerup',end);h.addEventListener('pointercancel',end);
      h.addEventListener('focus',function(){focus([i,i+1]);});h.addEventListener('blur',function(){focus([]);});
      h.addEventListener('keydown',function(e){var cut=0;for(var k=0;k<=i;k++)cut+=pct[k];
        if(e.key==='ArrowLeft'||e.key==='ArrowDown'){moveCut(i,cut-1);e.preventDefault();}if(e.key==='ArrowRight'||e.key==='ArrowUp'){moveCut(i,cut+1);e.preventDefault();}});
    });
    bud.addEventListener('input',function(){stack.classList.add('used');update();});
    document.addEventListener('cerebro:lang',update);update();
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

  /* 09 liquid glow shape around the hero media plan */
  (function(){
    var plan=document.querySelector('.hero .plan'),band=plan&&plan.closest('.hero-band');if(!band)return;
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
})();
