import React, { useEffect, useRef, useState } from 'react';

const DEDICATORIA = [
  'Eres mi Sol 🌞🌻, mi calma y mi destino.',
  'Gracias por existir, por tu luz y tu ternura.',
  'Con todo mi amor — JuanFe 💻❤️'
];
const START_DATE = '2023-05-06';

export default function App(){
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const [typing, setTyping] = useState(false);
  const [typed, setTyped] = useState('');
  const [counter, setCounter] = useState('');

  // Typewriter
  const startTyping = () => {
    if (typing) return;
    setTyping(true);
    const text = DEDICATORIA.join(' ');
    let i = 0; setTyped('');
    const step = () => {
      i++; setTyped(text.slice(0, i));
      if (i < text.length) setTimeout(step, 28 + Math.random()*30);
      else setTyping(false);
    }; step();
  };

  // Counter
  useEffect(() => {
    const tick = () => {
      const start = new Date(`${START_DATE}T00:00:00`);
      const now = new Date();
      let s = Math.floor((now - start)/1000);
      const d = Math.floor(s/86400); s%=86400;
      const h = Math.floor(s/3600);  s%=3600;
      const m = Math.floor(s/60);    s%=60;
      setCounter(`${d} días, ${h} horas, ${m} minutos y ${s} segundos`);
    };
    tick(); const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Canvas animation (estable con ResizeObserver)
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha:true });
    const palette = ['#ff6699','#ff3366','#ff99cc','#ffb6c1','#ffa07a','#ffd700','#ff6f91','#ff8fab'];
    const rand=(a,b)=>Math.random()*(b-a)+a;

    const heartPoint=(t)=>{
      const x=16*Math.sin(t)**3;
      const y=13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t);
      return {x:x/17,y:-y/17};
    };

    let leaves=[], floaters=[];

    class Heart{
      constructor(x,y,size,color,anchored=false){
        this.x=x; this.y=y; this.size=size; this.color=color; this.anchored=anchored;
        this.vx=(Math.random()-0.5)*0.3;
        this.vy=anchored?0:(0.18+Math.random()*0.28);
        this.spin=Math.random()*Math.PI;
        this.alpha=anchored?0.95:0.72+Math.random()*0.22;
      }
      draw(){
        ctx.save(); ctx.translate(this.x,this.y); ctx.rotate(Math.sin(this.spin)*0.6);
        const s=this.size; ctx.beginPath(); ctx.moveTo(0,0);
        ctx.bezierCurveTo(-s*.5,-s*.5,-s,s*.33,0,s);
        ctx.bezierCurveTo(s,s*.33,s*.5,-s*.5,0,0);
        ctx.closePath(); ctx.globalAlpha=this.alpha; ctx.fillStyle=this.color; ctx.fill();
        ctx.restore();
      }
      step(){
        if(this.anchored){ this.x+=Math.sin(this.spin)*0.2; this.y+=Math.cos(this.spin)*0.2; this.spin+=0.02; }
        else { this.x+=this.vx; this.y+=this.vy; this.spin+=0.01; }
      }
    }

    const mapXY = (x,y)=>{
      const w = canvas.width/(window.devicePixelRatio||1);
      const h = canvas.height/(window.devicePixelRatio||1);
      const cx = w*0.50, cy = h*0.46;
      const s  = Math.min(w,h)*0.22;
      return {X: cx + x*s, Y: cy + y*s};
    };

    function setupHearts(){
      leaves=[];
      for(let k=0;k<240;k++){
        const t=Math.random()*Math.PI*2, p=heartPoint(t), m=mapXY(p.x,p.y);
        const size=rand(3,9), color=palette[Math.floor(rand(0,palette.length))];
        leaves.push(new Heart(m.X+rand(-8,8), m.Y+rand(-8,8), size, color, true));
      }
      floaters=[];
      const w = canvas.width/(window.devicePixelRatio||1);
      const h = canvas.height/(window.devicePixelRatio||1);
      for(let i=0;i<60;i++){
        const x=w*0.30+Math.random()*w*0.40, y=h*0.18+Math.random()*h*0.28;
        const size=rand(3,8), color=palette[Math.floor(rand(0,palette.length))];
        floaters.push(new Heart(x,y,size,color,false));
      }
    }

    function drawTrunk(){
      const w = canvas.width/(window.devicePixelRatio||1);
      const h = canvas.height/(window.devicePixelRatio||1);
      // base
      ctx.fillStyle='#d5b79f'; ctx.beginPath();
      ctx.ellipse(w*0.50, h*0.70, w*0.22, 6, 0, 0, Math.PI*2); ctx.fill();
      // tronco
      ctx.fillStyle='#2f6a4f'; ctx.beginPath();
      ctx.moveTo(w*0.495, h*0.68); ctx.lineTo(w*0.505, h*0.68);
      ctx.lineTo(w*0.505, h*0.48); ctx.lineTo(w*0.495, h*0.48);
      ctx.closePath(); ctx.fill();
    }

    const loop = ()=>{
      const w = canvas.width/(window.devicePixelRatio||1);
      const h = canvas.height/(window.devicePixelRatio||1);
      ctx.clearRect(0,0,w,h);
      drawTrunk();
      leaves.forEach(hh=>{hh.step();hh.draw();});
      floaters.forEach(hh=>{hh.step();hh.draw();});
      for(let i=0;i<floaters.length;i++){
        if(floaters[i].y > h*0.82){
          const x=w*0.30+Math.random()*w*0.40, y=h*0.18+Math.random()*h*0.28;
          const size=rand(3,8), color=palette[Math.floor(rand(0,palette.length))];
          floaters[i]=new Heart(x,y,size,color,false);
        }
      }
      rafRef.current=requestAnimationFrame(loop);
    };

    // Tamaño estable por contenedor (16:9) con límites
    const setCanvasSize = ()=>{
      const box = canvas.parentElement;
      const w = Math.max(1, box.clientWidth);
      let h = Math.round(w * 9 / 16);
      h = Math.max(260, Math.min(560, h));
      canvas.style.height = `${h}px`;

      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * ratio);
      canvas.height = Math.floor(h * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      setupHearts();
    };

    const ro = new ResizeObserver(setCanvasSize);
    ro.observe(canvas.parentElement);

    setCanvasSize();
    rafRef.current=requestAnimationFrame(loop);

    return()=>{ cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, []);

  const spawnHearts = ()=>window.dispatchEvent(new Event('resize'));

  return (
    <main className="card">
      <section className="canvas-wrap">
        {/* Columna izquierda: Canvas */}
        <div className="canvas-box">
          <canvas ref={canvasRef} id="loveTree" />
        </div>

        {/* Columna derecha: Tarjeta */}
        <aside className="overlay">
          <div className="overlay-inner">
            <h2>Para la persona que amo</h2>
            <p className="type">{typed}</p>
            <img src={`${import.meta.env.BASE_URL}bears.jpg`} alt="Ositos" className="bears" />
            <div className="counter-wrap">
              <small>Juntos desde…</small>
              <div id="counter">{counter}</div>
            </div>
            {/* Botones (se muestran aquí en móvil; en desktop se ocultan) */}
            <div className="actions">
              <button className="btn" onClick={startTyping} disabled={typing}>Abrir carta</button>
              <button className="btn secondary" onClick={spawnHearts}>¡Más corazones!</button>
            </div>
          </div>
        </aside>

        {/* Barra flotante de acciones (solo PC) */}
        <div className="actions-bar">
          <div className="actions-pill">
            <button className="btn" onClick={startTyping} disabled={typing}>Abrir carta</button>
            <button className="btn secondary" onClick={spawnHearts}>¡Más corazones!</button>
          </div>
        </div>
      </section>
    </main>
  );
}
