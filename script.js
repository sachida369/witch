let selectedService = null;
let selectedPrice = 0;

document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('click', () => {
    selectedService = card.dataset.service;
    selectedPrice = parseInt(card.dataset.price);
    document.getElementById('form-section').style.display = 'block';
    document.getElementById('form-section').scrollIntoView({behavior:"smooth"});
  });
});

document.getElementById('astroForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(e.target));

  const params = {
    dob: formData.dob,
    tob: formData.tob,
    place: formData.place,
    name: formData.name || undefined,
    gender: formData.gender || undefined
  };

  if (selectedPrice > 0) {
    const order = await fetch(`${API_BASE}/create-order`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ amount: selectedPrice })
    }).then(res => res.json());

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: "INR",
      order_id: order.id,
      handler: function (response){
        runSprinkle();
        fetchResult(params);
      }
    };
    const rzp = new Razorpay(options);
    rzp.open();
  } else {
    fetchResult(params);
  }
});

async function fetchResult(params){
  const payload = { service: selectedService, data: params };
  const res = await fetch(`${API_BASE}/astro`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(payload)
  });
  const json = await res.json();
  showResult(JSON.stringify(json, null, 2));
}

function runSprinkle(){
  const c = document.getElementById('celebrate');
  c.innerHTML = '';
  for(let i=0;i<40;i++){
    const e = document.createElement('div');
    e.style.position = 'absolute';
    e.style.width = '8px';
    e.style.height = '8px';
    e.style.borderRadius = '50%';
    e.style.left = (Math.random()*90)+'%';
    e.style.top = (Math.random()*20)+'%';
    e.style.background = ['#ff0','#0ff','#f0f','#0f0'][Math.floor(Math.random()*4)];
    e.style.opacity = 0.9;
    c.appendChild(e);
    setTimeout(()=>e.remove(), 1800 + Math.random()*1000);
  }
}

function showResult(text){
  document.getElementById('result-section').style.display = 'block';
  initScratchCard(text);
  document.getElementById('downloadResult').onclick = ()=>downloadTextAsPDF(text);
  document.getElementById('shareResult').onclick = ()=>navigator.share ? navigator.share({ title: 'My WitchCard Reading', text: 'Check my reading from WitchCard.Shop', url: location.href }) : alert('Share not supported on this device');
  document.getElementById('result-section').scrollIntoView({behavior:'smooth'});
}

function initScratchCard(text){
  const canvas = document.getElementById('scratchCanvas');
  const ctx = canvas.getContext('2d');
  const w = Math.min(window.innerWidth-40, 720);
  canvas.width = w;
  canvas.height = 240;
  const bg = document.createElement('canvas');
  bg.width = w; bg.height = 240;
  const bgctx = bg.getContext('2d');
  bgctx.fillStyle = '#fff';
  bgctx.fillRect(0,0,w,240);
  bgctx.fillStyle = '#111';
  bgctx.font = '14px monospace';
  wrapText(bgctx, text, 12, 22, w-24, 18);
  ctx.fillStyle = 'silver';
  ctx.fillRect(0,0,w,240);
  ctx.globalCompositeOperation = 'destination-out';
  let scratching=false;
  function pointerDown(){scratching=true}
  function pointerUp(){scratching=false; checkReveal();}
  function pointerMove(e){
    if(!scratching) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.touches[0].clientY) - rect.top;
    ctx.beginPath();
    ctx.arc(x,y,18,0,Math.PI*2);
    ctx.fill();
  }
  canvas.addEventListener('mousedown',pointerDown);
  canvas.addEventListener('mouseup',pointerUp);
  canvas.addEventListener('mousemove',pointerMove);
  canvas.addEventListener('touchstart',pointerDown);
  canvas.addEventListener('touchend',pointerUp);
  canvas.addEventListener('touchmove',pointerMove);
  const img = new Image();
  img.src = bg.toDataURL();
  img.onload = ()=>{ canvas.dataset.under = img.src; }
  const hidden = document.createElement('pre');
  hidden.style.display='none';
  hidden.textContent = text;
  canvas.parentNode.appendChild(hidden);

  function checkReveal(){
    const pixels = ctx.getImageData(0,0,w,240).data;
    let transparentCount=0;
    for(let i=3;i<pixels.length;i+=4){
      if(pixels[i]===0) transparentCount++;
    }
    const percent = (transparentCount / (w*240)) * 100;
    if(percent>40){
      ctx.clearRect(0,0,w,240);
      const parent = canvas.parentNode;
      const imgEl = document.createElement('img');
      imgEl.src = img.src;
      imgEl.style.maxWidth='100%';
      parent.insertBefore(imgEl, canvas);
      canvas.remove();
    }
  }
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight){
  const words = text.split(' ');
  let line = '';
  for(let n=0;n<words.length;n++){
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if(metrics.width > maxWidth && n > 0){
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

function downloadTextAsPDF(text){
  const w = window.open('', '_blank');
  w.document.write('<pre style="font-family:monospace;">'+text.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</pre>');
  w.document.close();
  w.print();
}
