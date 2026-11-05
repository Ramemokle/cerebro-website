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
    var stg=[css('--aw')||'#AD99FB',css('--co')||'#8566F9',css('--rm')||'#5C33F7',css('--cv')||'#3300F5'].map(rgb);
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
  // media plan: hover a row to focus its funnel segment
  document.querySelectorAll('.plan').forEach(function(plan){
    var segs=plan.querySelectorAll('.stack i');
    function focus(i){plan.classList.add('focus');segs.forEach(function(s){s.classList.toggle('on',s.dataset.i===i);});}
    function clear(){plan.classList.remove('focus');segs.forEach(function(s){s.classList.remove('on');});}
    plan.querySelectorAll('.row').forEach(function(r){r.addEventListener('pointerenter',function(){focus(r.dataset.i);});r.addEventListener('pointerleave',clear);});
    segs.forEach(function(s){s.addEventListener('pointerenter',function(){focus(s.dataset.i);});s.addEventListener('pointerleave',clear);});
  });
})();
