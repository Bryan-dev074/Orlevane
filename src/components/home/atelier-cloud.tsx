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
 */

const SRC = '/media/w/particula.webp';

export default function AtelierCloud({ className = '' }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
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
        start();
      },
      { rootMargin: '300px' },
    );
    io.observe(node);

    async function start() {
      const el = host.current;
      if (!el) return;
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
            uPointer: { value: new THREE.Vector2(0, 0) },
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

        const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'low-power' });
        renderer.setClearColor(0x000000, 0);
        el.appendChild(renderer.domElement);
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        renderer.domElement.style.display = 'block';

        const resize = () => {
          const r = el.getBoundingClientRect();
          const w = Math.max(1, r.width);
          const h = Math.max(1, r.height);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          mat.uniforms.uSize.value = Math.max(2, (h / 420) * 3.6) * Math.min(window.devicePixelRatio, 2);
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

        let progress = 0;
        const onScroll = () => {
          const r = el.getBoundingClientRect();
          const vh = window.innerHeight;
          // 0 cuando la sección entra por abajo, 1 cuando queda centrada.
          progress = 1 - Math.min(1, Math.max(0, (r.top - vh * 0.1) / (vh * 0.75)));
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        setReady(true);

        const clock = new THREE.Clock();
        let raf = 0;
        let visible = true;
        const vis = new IntersectionObserver((e) => (visible = e[0]?.isIntersecting ?? true), { rootMargin: '120px' });
        vis.observe(el);

        const tick = () => {
          raf = requestAnimationFrame(tick);
          if (!visible || document.hidden) return;
          const t = clock.getElapsedTime();
          mat.uniforms.uTime.value = t;
          mat.uniforms.uProgress.value += (progress - mat.uniforms.uProgress.value) * 0.055;
          points.rotation.y += (pointer.x * 0.22 - points.rotation.y) * 0.04;
          points.rotation.x += (-pointer.y * 0.14 - points.rotation.x) * 0.04;
          renderer.render(scene, camera);
        };
        tick();

        cleanup = () => {
          cancelAnimationFrame(raf);
          ro.disconnect();
          vis.disconnect();
          window.removeEventListener('scroll', onScroll);
          el.removeEventListener('pointermove', onPointer);
          geo.dispose();
          mat.dispose();
          renderer.dispose();
          renderer.domElement.remove();
        };
      } catch {
        setFailed(true);
      }
    }

    return () => {
      disposed = true;
      io.disconnect();
      cleanup?.();
    };
  }, [reduced]);

  const showFallback = reduced || failed || !ready;

  return (
    <div className={`relative ${className}`}>
      <div ref={host} className="absolute inset-0" aria-hidden />
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-silk ${
          showFallback ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <Img
          src={SRC}
          alt=""
          fill
          sizes="(max-width: 1024px) 90vw, 44vw"
          className="object-contain"
        />
      </div>
    </div>
  );
}
