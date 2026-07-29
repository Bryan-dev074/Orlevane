'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import Img from '@/components/ui/img';

/**
 * «Del negativo al par»: la fotografía se lee píxel a píxel y se reconstruye
 * como nube de puntos en tres dimensiones. La profundidad sale de la luminancia
 * del propio negativo, así que el zapato se levanta del plano donde la luz
 * pegó. Al desplazarse, la nube pasa de dispersa a formada.
 *
 * Técnica en la línea de img2threejs, escrita a mano para poder controlar la
 * paleta, el coste y la degradación.
 *
 * Sobre la robustez, que acá es lo difícil:
 *  · El contexto WebGL se libera con forceContextLoss(); sólo con dispose() el
 *    navegador lo sigue contando, y al cabo de una docena de montajes deja de
 *    entregar contextos nuevos y la pieza no aparece más.
 *  · La fotografía de respaldo no se oculta hasta que se pintó un cuadro de
 *    verdad, y vuelve si el contexto se pierde. Ocultarla antes deja un hueco
 *    negro cuando algo falla.
 *  · El avance se lee del rectángulo en cada cuadro, no de eventos de scroll:
 *    con desplazamiento suave, anclas o restauración de posición, los eventos
 *    se pierden y la nube se queda a medio armar.
 */

const SRC = '/media/w/particula.webp';

export default function AtelierCloud({ className = '' }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [painted, setPainted] = useState(false);
  const [failed, setFailed] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const node = host.current;
    if (!node) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    // Sólo se monta cuando la sección está por entrar en pantalla.
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        void start();
      },
      { rootMargin: '300px' },
    );
    io.observe(node);

    async function start() {
      const el = host.current;
      if (!el || disposed) return;

      let renderer: import('three').WebGLRenderer | undefined;

      try {
        const THREE = await import('three');
        if (disposed) return;

        const img = new Image();
        img.decoding = 'async';
        img.src = SRC;
        await img.decode();
        if (disposed) return;

        // Muestreo del negativo.
        const step = window.innerWidth < 768 ? 5 : 3;
        const cw = 420;
        const ch = Math.round((img.naturalHeight / img.naturalWidth) * cw);
        const off = document.createElement('canvas');
        off.width = cw;
        off.height = ch;
        const ctx = off.getContext('2d', { willReadFrequently: true });
        if (!ctx) throw new Error('sin contexto 2d');
        ctx.drawImage(img, 0, 0, cw, ch);
        const data = ctx.getImageData(0, 0, cw, ch).data;

        const cols = Math.floor(cw / step);
        const rows = Math.floor(ch / step);

        const target: number[] = [];
        const scatter: number[] = [];
        const colors: number[] = [];
        const seeds: number[] = [];

        const planeW = 1.9;
        const planeH = (ch / cw) * planeW;
        // El fondo del negativo se descarta: sólo interesa el par y la luz que le pega.
        const FLOOR = 0.11;

        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const idx = (y * step * cw + x * step) * 4;
            const r = data[idx] / 255;
            const g = data[idx + 1] / 255;
            const b = data[idx + 2] / 255;
            const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            if (lum < FLOOR) continue;

            target.push((x / cols - 0.5) * planeW, -(y / rows - 0.5) * planeH, (lum - 0.45) * 0.5);

            const ang = Math.random() * Math.PI * 2;
            const rad = 1.3 + Math.random() * 1.7;
            scatter.push(Math.cos(ang) * rad, (Math.random() - 0.5) * 2.8, Math.sin(ang) * rad - 0.7);

            // Marfil en las luces, dorado en los medios. El brillo del punto lleva
            // la luminancia del píxel, así que el volumen del zapato se lee solo.
            const warm = Math.pow(Math.min(1, (lum - FLOOR) / (1 - FLOOR)), 0.68);
            colors.push(0.24 + warm * 0.72, 0.2 + warm * 0.68, 0.15 + warm * 0.55);
            seeds.push(Math.random());
          }
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(target), 3));
        geo.setAttribute('aStart', new THREE.BufferAttribute(new Float32Array(scatter), 3));
        geo.setAttribute('aColor', new THREE.BufferAttribute(new Float32Array(colors), 3));
        geo.setAttribute('aSeed', new THREE.BufferAttribute(new Float32Array(seeds), 1));

        const mat = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          blending: THREE.NormalBlending,
          uniforms: {
            uProgress: { value: 0 },
            uTime: { value: 0 },
            uSize: { value: 1 },
          },
          vertexShader: /* glsl */ `
            attribute vec3 aStart;
            attribute vec3 aColor;
            attribute float aSeed;
            uniform float uProgress;
            uniform float uTime;
            uniform float uSize;
            varying vec3 vColor;
            varying float vAlpha;

            void main() {
              float p = clamp(uProgress * 1.35 - aSeed * 0.35, 0.0, 1.0);
              float e = 1.0 - pow(1.0 - p, 3.0);
              vec3 pos = mix(aStart, position, e);
              pos.z += sin(uTime * 0.7 + aSeed * 8.0) * 0.012 * (1.0 - e * 0.75);

              vec4 mv = modelViewMatrix * vec4(pos, 1.0);
              gl_PointSize = uSize * (1.0 / max(0.25, -mv.z));
              gl_Position = projectionMatrix * mv;

              vColor = aColor;
              vAlpha = 0.25 + e * 0.75;
            }
          `,
          fragmentShader: /* glsl */ `
            varying vec3 vColor;
            varying float vAlpha;
            void main() {
              vec2 c = gl_PointCoord - 0.5;
              float d = dot(c, c);
              if (d > 0.25) discard;
              float soft = smoothstep(0.25, 0.04, d);
              gl_FragColor = vec4(vColor, vAlpha * soft);
            }
          `,
        });

        const points = new THREE.Points(geo, mat);
        const scene = new THREE.Scene();
        scene.add(points);

        const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 20);
        camera.position.set(0, 0, 2.35);

        renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'low-power' });
        renderer.setClearColor(0x000000, 0);

        const canvas = renderer.domElement;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';

        // Si el efecto se desmontó mientras compilábamos, no se cuelga nada del DOM.
        if (disposed) throw new Error('desmontado');
        el.appendChild(canvas);

        const onContextLost = (e: Event) => {
          e.preventDefault();
          setPainted(false);
          setFailed(true);
        };
        canvas.addEventListener('webglcontextlost', onContextLost);

        const resize = () => {
          const r = el.getBoundingClientRect();
          const w = Math.max(1, r.width);
          const h = Math.max(1, r.height);
          const dpr = Math.min(window.devicePixelRatio, 2);
          renderer!.setPixelRatio(dpr);
          renderer!.setSize(w, h, false);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          mat.uniforms.uSize.value = Math.max(2, (h / 420) * 3.6) * dpr;
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(el);

        const pointer = { x: 0, y: 0 };
        const onPointer = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          pointer.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
          pointer.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
        };
        el.addEventListener('pointermove', onPointer);

        let visible = true;
        const vis = new IntersectionObserver((e) => (visible = e[0]?.isIntersecting ?? true), { rootMargin: '160px' });
        vis.observe(el);

        const clock = new THREE.Clock();
        let raf = 0;
        let firstFrame = true;
        let settled = 0;

        const tick = () => {
          raf = requestAnimationFrame(tick);
          if (!visible || document.hidden) return;

          // Avance por fracción visible del bloque, leída del rectángulo en cada
          // cuadro. Queda armada del todo con dos tercios del bloque en pantalla,
          // que es la posición de lectura, y no se vuelve a desarmar: si no, al
          // detenerse a leer la sección la nube se queda a medio hacer y parece
          // rota, que es justo lo que no queremos.
          const r = el.getBoundingClientRect();
          const vh = window.innerHeight || 1;
          const shown = Math.min(r.bottom, vh) - Math.max(r.top, 0);
          const frac = shown / Math.max(1, Math.min(r.height, vh));
          const progress = Math.min(1, Math.max(0, frac * 1.6));

          const u = mat.uniforms;
          if (progress > settled) settled = progress;
          u.uTime.value = clock.getElapsedTime();
          u.uProgress.value += (settled - u.uProgress.value) * 0.055;
          points.rotation.y += (pointer.x * 0.22 - points.rotation.y) * 0.04;
          points.rotation.x += (-pointer.y * 0.14 - points.rotation.x) * 0.04;
          renderer!.render(scene, camera);

          if (firstFrame) {
            firstFrame = false;
            setPainted(true);
          }
        };

        cleanup = () => {
          cancelAnimationFrame(raf);
          ro.disconnect();
          vis.disconnect();
          el.removeEventListener('pointermove', onPointer);
          canvas.removeEventListener('webglcontextlost', onContextLost);
          geo.dispose();
          mat.dispose();
          // El orden importa: primero se suelta el contexto, después el renderer.
          renderer!.forceContextLoss();
          renderer!.dispose();
          canvas.remove();
        };

        tick();
      } catch {
        try {
          renderer?.forceContextLoss();
          renderer?.dispose();
        } catch {
          /* el contexto ya no existe */
        }
        if (!disposed) setFailed(true);
      }
    }

    return () => {
      disposed = true;
      io.disconnect();
      cleanup?.();
    };
  }, [reduced]);

  const showFallback = reduced || failed || !painted;

  return (
    <div className={`relative ${className}`}>
      <div ref={host} className="absolute inset-0" aria-hidden />
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-1000 ease-silk ${
          showFallback ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <Img src={SRC} alt="" fill sizes="(max-width: 1024px) 90vw, 44vw" className="object-contain" />
      </div>
    </div>
  );
}
