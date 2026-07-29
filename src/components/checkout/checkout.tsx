'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import Img from '@/components/ui/img';
import CardVisual from './card-visual';
import { Btn, BtnLink } from '@/components/ui/button';
import { Modal } from '@/components/ui/sheet';
import { Totals, CouponField } from '@/components/shop/cart-parts';
import { usePrefs } from '@/lib/prefs';
import { computeTotals, useShop, useHydrated } from '@/lib/store';
import { BY_SLUG } from '@/lib/products';
import { money, sizeLabel } from '@/lib/format';
import { cartMessage, waUrl } from '@/lib/whatsapp';
import { SILK } from '@/lib/motion';
import {
  AUTH_STEPS,
  authorize,
  cvvLength,
  detectBrand,
  digits,
  formatCardNumber,
  formatExpiry,
  installmentOptions,
  last4,
  maskPhone,
  orderCode,
  transferRef,
  validCardNumber,
  validExpiry,
  BRAND_LABEL,
  TEST_CARDS,
  type AuthStep,
} from '@/lib/payments';
import type { Customer, Order, PaymentMethod, ShippingMethod } from '@/lib/types';

const STEP_KEYS = ['k.s1', 'k.s2', 'k.s3', 'k.s4'] as const;

/* ── Campo de formulario ───────────────────────────────────────────────── */

function Field({
  label,
  error,
  hint,
  optional,
  children,
  className = '',
}: {
  label: string;
  error?: string;
  hint?: string;
  optional?: string;
  children: (props: { id: string; invalid: boolean; describedBy?: string }) => React.ReactNode;
  className?: string;
}) {
  const id = label.replace(/\W+/g, '-').toLowerCase();
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="label flex items-baseline gap-2 text-stone-2">
        {label}
        {optional && <span className="normal-case tracking-normal text-stone/80">({optional})</span>}
      </label>
      <div className="mt-2">{children({ id, invalid: !!error, describedBy })}</div>
      {error ? (
        <p id={`${id}-err`} role="alert" className="mt-1.5 text-[0.75rem] text-claret">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[0.75rem] text-stone">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const inputCls = (invalid: boolean) =>
  `h-12 w-full border bg-transparent px-3.5 text-[0.95rem] transition-colors duration-200 placeholder:text-stone/70 ${
    invalid ? 'border-claret' : 'border-stone/40 focus:border-ink'
  }`;

/* ── Selector de opción (envío / pago) ─────────────────────────────────── */

function Choice({
  checked,
  onSelect,
  title,
  detail,
  aside,
  name,
  disabled,
}: {
  checked: boolean;
  onSelect: () => void;
  title: string;
  detail: string;
  aside?: React.ReactNode;
  name: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3.5 border p-4 transition-colors duration-300 ${
        disabled
          ? 'cursor-not-allowed border-stone/20 opacity-50'
          : checked
            ? 'border-ink bg-paper-2/60'
            : 'border-stone/35 hover:border-stone'
      }`}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={onSelect}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gilt ${
          checked ? 'border-ink' : 'border-stone/50'
        }`}
      >
        {checked && <span className="h-2 w-2 rounded-full bg-ink" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[0.92rem] font-medium">{title}</span>
        <span className="mt-1 block text-[0.8rem] leading-snug text-stone-2">{detail}</span>
      </span>
      {aside && <span className="tnum shrink-0 text-[0.88rem]">{aside}</span>}
    </label>
  );
}

/* ── Checkout ──────────────────────────────────────────────────────────── */

export default function Checkout() {
  const { t, locale, currency } = usePrefs();
  const router = useRouter();

  const lines = useShop((s) => s.lines);
  const coupon = useShop((s) => s.coupon);
  const hydrated = useHydrated();
  const clearCart = useShop((s) => s.clearCart);
  const pushOrder = useShop((s) => s.pushOrder);
  const toast = useShop((s) => s.toast);

  const [step, setStep] = useState(1);
  const [shipping, setShipping] = useState<ShippingMethod>('estandar');
  const [payment, setPayment] = useState<PaymentMethod>('tarjeta');
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [summaryOpen, setSummaryOpen] = useState(false);

  const [customer, setCustomer] = useState<Customer>({
    name: '',
    email: '',
    phone: '',
    doc: '',
    country: 'PY',
    city: '',
    address: '',
    notes: '',
  });

  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '', installments: 1 });
  const [flipped, setFlipped] = useState(false);

  const [phase, setPhase] = useState<'form' | '3ds' | 'processing'>('form');
  const [authStep, setAuthStep] = useState<AuthStep>('conectando');
  const [otp, setOtp] = useState('');
  const [otpTries, setOtpTries] = useState(3);
  const [otpError, setOtpError] = useState('');
  const placed = useRef(false);

  const totals = useMemo(() => computeTotals(lines, coupon, shipping), [lines, coupon, shipping]);
  const brand = detectBrand(card.number);
  const cuotas = installmentOptions(totals.totalPYG);

  useEffect(() => {
    if (customer.country === 'BR' && payment === 'contra-entrega') setPayment('tarjeta');
  }, [customer.country, payment]);

  const set = <K extends keyof Customer>(k: K, v: Customer[K]) => {
    setCustomer((c) => ({ ...c, [k]: v }));
    setErrors((e) => {
      if (!e[k]) return e;
      const { [k]: _drop, ...rest } = e;
      return rest;
    });
  };

  /* ── Validación ──────────────────────────────────────────────────── */

  const validateStep = (n: number): boolean => {
    const e: Record<string, string> = {};
    if (n === 1) {
      if (customer.name.trim().split(/\s+/).length < 2) e.name = t('k.error.nombre');
      if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(customer.email.trim())) e.email = t('k.error.email');
      if (digits(customer.phone).length < 8) e.phone = t('k.error.tel');
      if (customer.doc.trim().length < 5) e.doc = t('k.error.doc');
    }
    if (n === 2) {
      if (customer.city.trim().length < 2) e.city = t('k.error.ciudad');
      if (shipping !== 'boutique' && customer.address.trim().length < 6) e.address = t('k.error.direccion');
    }
    if (n === 3 && payment === 'tarjeta') {
      if (!validCardNumber(card.number)) e.cardNumber = t('k.error.tarjetaNum');
      if (card.name.trim().length < 3) e.cardName = t('k.error.tarjetaNombre');
      if (!validExpiry(card.expiry)) e.cardExpiry = t('k.error.tarjetaVenc');
      if (digits(card.cvv).length !== cvvLength(brand)) e.cardCvv = t('k.error.tarjetaCvv', { n: cvvLength(brand) });
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const advance = () => {
    if (!validateStep(step)) {
      toast({ title: t('k.error.revisar'), tone: 'warn' });
      return;
    }
    setStep((s) => Math.min(4, s + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ── Confirmación ────────────────────────────────────────────────── */

  const buildOrder = (extra: Partial<Order> = {}): Order => ({
    code: orderCode(),
    createdAt: Date.now(),
    lines: lines.map((l) => {
      const p = BY_SLUG.get(l.slug)!;
      return { ...l, name: p.name, pricePYG: p.pricePYG, image: p.images[0] };
    }),
    customer,
    shipping,
    payment,
    currency,
    locale,
    subtotalPYG: totals.subtotalPYG,
    shippingPYG: totals.shippingPYG,
    discountPYG: totals.discountPYG,
    totalPYG: totals.totalPYG,
    couponCode: coupon ?? undefined,
    status: 'confirmado',
    ...extra,
  });

  const finish = (order: Order) => {
    placed.current = true;
    pushOrder(order);
    clearCart();
    router.push(`/pedido/${order.code}`);
  };

  const runProcessing = async (cardNumber?: string) => {
    setPhase('processing');
    if (!cardNumber) {
      // Transferencia, contra entrega o WhatsApp: sólo se registra el pedido.
      await new Promise((r) => setTimeout(r, 900));
      finish(
        buildOrder(payment === 'transferencia' ? { transferRef: transferRef() } : {}),
      );
      return;
    }

    const result = await authorize(cardNumber, (s) => setAuthStep(s));
    if (result.ok) {
      finish(
        buildOrder({
          cardLast4: last4(cardNumber),
          cardBrand: BRAND_LABEL[brand],
          installments: card.installments,
        }),
      );
    } else {
      setPhase('form');
      setStep(3);
      toast({
        title: result.reason === 'fondos' ? t('k.error.fondos') : t('k.error.rechazada'),
        tone: 'warn',
      });
    }
  };

  const confirm = () => {
    if (lines.length === 0) return;
    if (!accepted) {
      setErrors({ terms: t('k.error.terminos') });
      return;
    }
    if (payment === 'whatsapp') {
      const order = buildOrder();
      window.open(
        waUrl(
          cartMessage({
            lines,
            locale,
            currency,
            subtotalPYG: totals.subtotalPYG,
            discountPYG: totals.discountPYG,
            shippingPYG: totals.shippingPYG,
            totalPYG: totals.totalPYG,
            shipping,
            customer,
            code: order.code,
          }),
        ),
        '_blank',
        'noopener,noreferrer',
      );
      finish(order);
      return;
    }
    if (payment === 'tarjeta') {
      if (!validateStep(3)) {
        setStep(3);
        return;
      }
      setOtp('');
      setOtpTries(3);
      setOtpError('');
      setPhase('3ds');
      return;
    }
    void runProcessing();
  };

  const verifyOtp = () => {
    if (digits(otp).length !== 6) {
      setOtpError(t('k.3ds.malo', { n: otpTries }));
      return;
    }
    if (otp === '000000') {
      const left = otpTries - 1;
      setOtpTries(left);
      if (left <= 0) {
        setPhase('form');
        toast({ title: t('k.error.3ds'), tone: 'warn' });
        return;
      }
      setOtpError(t('k.3ds.malo', { n: left }));
      return;
    }
    void runProcessing(card.number);
  };

  /* ── Carrito vacío ───────────────────────────────────────────────── */

  if (hydrated && lines.length === 0 && !placed.current) {
    return (
      <div className="shell flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
        <h1 className="display-lg">{t('c.vacio')}</h1>
        <p className="measure mt-4 text-[0.95rem] text-stone-2">{t('c.vacioTexto')}</p>
        <BtnLink href="/coleccion" tone="solid" size="lg" arrow className="mt-9">
          {t('c.vacioCta')}
        </BtnLink>
      </div>
    );
  }

  /* ── Resumen ─────────────────────────────────────────────────────── */

  const Summary = (
    <div className="bg-paper-2/70 p-6">
      <h2 className="label mb-5 text-stone-2">{t('k.resumen')}</h2>
      <ul className="space-y-4">
        {lines.map((l) => {
          const p = BY_SLUG.get(l.slug);
          if (!p) return null;
          return (
            <li key={l.id} className="flex gap-3.5">
              <span className="relative h-20 w-16 shrink-0 overflow-hidden bg-paper-3">
                <Img src={p.images[0]} alt="" fill sizes="64px" className="object-cover" />
                <span className="tnum absolute right-0 top-0 grid h-5 min-w-5 place-items-center bg-ink px-1 text-[0.65rem] text-paper">
                  {l.qty}
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[0.88rem] font-medium">{p.name}</span>
                <span className="block truncate text-[0.75rem] text-stone-2">{p.kind[locale]}</span>
                <span className="label-sm mt-1.5 block text-stone">
                  {t('p.talla')} {sizeLabel(l.size, locale)}
                </span>
              </span>
              <span className="tnum shrink-0 text-[0.85rem]">{money(p.pricePYG * l.qty, currency)}</span>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 border-t border-stone/30 pt-5">
        <CouponField compact />
      </div>
      <div className="mt-4">
        <Totals totals={totals} showShipping={step >= 2} />
      </div>
    </div>
  );

  return (
    <>
      <div className="shell grid gap-10 py-12 lg:grid-cols-12 lg:gap-14 lg:py-16">
        {/* Columna de pasos */}
        <div className="lg:col-span-7">
          <header className="mb-10">
            <Link href="/carrito" className="link-rule label text-stone-2">
              ← {t('nav.carrito')}
            </Link>
            <h1 className="display-lg mt-5">{t('k.titulo')}</h1>
          </header>

          {/* Pasos */}
          <ol className="mb-10 flex items-center gap-2">
            {STEP_KEYS.map((k, i) => {
              const n = i + 1;
              const done = step > n;
              const now = step === n;
              return (
                <li key={k} className="flex flex-1 items-center gap-2">
                  <button
                    type="button"
                    disabled={n > step}
                    onClick={() => n < step && setStep(n)}
                    className={`label flex w-full flex-col items-start gap-2 border-t-2 pt-2.5 text-left transition-colors duration-300 ${
                      now ? 'border-gilt text-ink' : done ? 'border-ink/40 text-stone-2 hover:text-ink' : 'border-stone/25 text-stone'
                    }`}
                  >
                    <span className="tnum text-[0.65rem]">0{n}</span>
                    <span className="hidden sm:block">{t(k)}</span>
                  </button>
                </li>
              );
            })}
          </ol>

          {/* Resumen plegable en teléfono */}
          <div className="mb-8 border-y border-stone/30 lg:hidden">
            <button
              type="button"
              onClick={() => setSummaryOpen((v) => !v)}
              aria-expanded={summaryOpen}
              className="flex w-full items-center justify-between gap-4 py-4"
            >
              <span className="label">{summaryOpen ? t('k.ocultarResumen') : t('k.verResumen')}</span>
              <span className="tnum font-display text-[1.15rem]">{money(totals.totalPYG, currency)}</span>
            </button>
            <AnimatePresence initial={false}>
              {summaryOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.42, ease: SILK }}
                  className="overflow-hidden"
                >
                  <div className="-mx-6 pb-2">{Summary}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.4, ease: SILK }}
            >
              {/* Paso 1 · Contacto */}
              {step === 1 && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label={t('k.nombre')} error={errors.name} className="sm:col-span-2">
                    {({ id, invalid, describedBy }) => (
                      <input
                        id={id}
                        value={customer.name}
                        onChange={(e) => set('name', e.target.value)}
                        autoComplete="name"
                        aria-invalid={invalid}
                        aria-describedby={describedBy}
                        className={inputCls(invalid)}
                      />
                    )}
                  </Field>
                  <Field label={t('k.email')} error={errors.email}>
                    {({ id, invalid, describedBy }) => (
                      <input
                        id={id}
                        type="email"
                        value={customer.email}
                        onChange={(e) => set('email', e.target.value)}
                        autoComplete="email"
                        aria-invalid={invalid}
                        aria-describedby={describedBy}
                        className={inputCls(invalid)}
                      />
                    )}
                  </Field>
                  <Field label={t('k.tel')} error={errors.phone} hint="+595 …">
                    {({ id, invalid, describedBy }) => (
                      <input
                        id={id}
                        type="tel"
                        value={customer.phone}
                        onChange={(e) => set('phone', e.target.value)}
                        autoComplete="tel"
                        aria-invalid={invalid}
                        aria-describedby={describedBy}
                        className={inputCls(invalid)}
                      />
                    )}
                  </Field>
                  <Field label={t('k.doc')} error={errors.doc} className="sm:col-span-2">
                    {({ id, invalid, describedBy }) => (
                      <input
                        id={id}
                        value={customer.doc}
                        onChange={(e) => set('doc', e.target.value)}
                        aria-invalid={invalid}
                        aria-describedby={describedBy}
                        className={inputCls(invalid)}
                      />
                    )}
                  </Field>
                </div>
              )}

              {/* Paso 2 · Entrega */}
              {step === 2 && (
                <div className="space-y-8">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label={t('k.pais')}>
                      {({ id }) => (
                        <select
                          id={id}
                          value={customer.country}
                          onChange={(e) => set('country', e.target.value as 'PY' | 'BR')}
                          className={inputCls(false)}
                        >
                          <option value="PY">{t('k.py')}</option>
                          <option value="BR">{t('k.br')}</option>
                        </select>
                      )}
                    </Field>
                    <Field label={t('k.ciudad')} error={errors.city}>
                      {({ id, invalid, describedBy }) => (
                        <input
                          id={id}
                          value={customer.city}
                          onChange={(e) => set('city', e.target.value)}
                          autoComplete="address-level2"
                          aria-invalid={invalid}
                          aria-describedby={describedBy}
                          className={inputCls(invalid)}
                        />
                      )}
                    </Field>
                    {shipping !== 'boutique' && (
                      <Field label={t('k.direccion')} error={errors.address} className="sm:col-span-2">
                        {({ id, invalid, describedBy }) => (
                          <input
                            id={id}
                            value={customer.address}
                            onChange={(e) => set('address', e.target.value)}
                            autoComplete="street-address"
                            aria-invalid={invalid}
                            aria-describedby={describedBy}
                            className={inputCls(invalid)}
                          />
                        )}
                      </Field>
                    )}
                    <Field label={t('k.notas')} optional={t('k.opcional')} className="sm:col-span-2">
                      {({ id }) => (
                        <textarea
                          id={id}
                          rows={3}
                          value={customer.notes}
                          onChange={(e) => set('notes', e.target.value)}
                          placeholder={t('k.notasPh')}
                          className="w-full border border-stone/40 bg-transparent p-3.5 text-[0.95rem] transition-colors duration-200 placeholder:text-stone/70 focus:border-ink"
                        />
                      )}
                    </Field>
                  </div>

                  <fieldset>
                    <legend className="label mb-4 text-stone-2">{t('k.metodoEnvio')}</legend>
                    <div className="space-y-2.5">
                      <Choice
                        name="envio"
                        checked={shipping === 'estandar'}
                        onSelect={() => setShipping('estandar')}
                        title={t('k.envio.estandar')}
                        detail={t('k.envio.estandarD')}
                        aside={totals.freeShipping ? t('k.gratis') : money(45000, currency)}
                      />
                      <Choice
                        name="envio"
                        checked={shipping === 'express'}
                        onSelect={() => setShipping('express')}
                        title={t('k.envio.express')}
                        detail={t('k.envio.expressD')}
                        aside={money(120000, currency)}
                      />
                      <Choice
                        name="envio"
                        checked={shipping === 'boutique'}
                        onSelect={() => setShipping('boutique')}
                        title={t('k.envio.boutique')}
                        detail={t('k.envio.boutiqueD')}
                        aside={t('k.gratis')}
                      />
                    </div>
                  </fieldset>
                </div>
              )}

              {/* Paso 3 · Pago */}
              {step === 3 && (
                <div className="space-y-8">
                  <fieldset>
                    <legend className="label mb-4 text-stone-2">{t('k.metodoPago')}</legend>
                    <div className="space-y-2.5">
                      <Choice
                        name="pago"
                        checked={payment === 'tarjeta'}
                        onSelect={() => setPayment('tarjeta')}
                        title={t('k.pago.tarjeta')}
                        detail={t('k.pago.tarjetaD')}
                      />
                      <Choice
                        name="pago"
                        checked={payment === 'transferencia'}
                        onSelect={() => setPayment('transferencia')}
                        title={t('k.pago.transferencia')}
                        detail={t('k.pago.transferenciaD')}
                      />
                      <Choice
                        name="pago"
                        checked={payment === 'contra-entrega'}
                        onSelect={() => setPayment('contra-entrega')}
                        title={t('k.pago.contra')}
                        detail={t('k.pago.contraD')}
                        disabled={customer.country === 'BR'}
                      />
                      <Choice
                        name="pago"
                        checked={payment === 'whatsapp'}
                        onSelect={() => setPayment('whatsapp')}
                        title={t('k.pago.whatsapp')}
                        detail={t('k.pago.whatsappD')}
                      />
                    </div>
                  </fieldset>

                  <AnimatePresence initial={false}>
                    {payment === 'tarjeta' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.45, ease: SILK }}
                        className="overflow-hidden"
                      >
                        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
                          <div className="order-2 space-y-5 lg:order-1">
                            <Field label={t('k.tarjeta.numero')} error={errors.cardNumber}>
                              {({ id, invalid, describedBy }) => (
                                <input
                                  id={id}
                                  inputMode="numeric"
                                  autoComplete="off"
                                  value={card.number}
                                  onChange={(e) => setCard((c) => ({ ...c, number: formatCardNumber(e.target.value) }))}
                                  onFocus={() => setFlipped(false)}
                                  placeholder="0000 0000 0000 0000"
                                  aria-invalid={invalid}
                                  aria-describedby={describedBy}
                                  className={`tnum tracking-[0.08em] ${inputCls(invalid)}`}
                                />
                              )}
                            </Field>
                            <Field label={t('k.tarjeta.nombre')} error={errors.cardName}>
                              {({ id, invalid, describedBy }) => (
                                <input
                                  id={id}
                                  autoComplete="off"
                                  value={card.name}
                                  onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))}
                                  onFocus={() => setFlipped(false)}
                                  aria-invalid={invalid}
                                  aria-describedby={describedBy}
                                  className={`uppercase ${inputCls(invalid)}`}
                                />
                              )}
                            </Field>
                            <div className="grid grid-cols-2 gap-5">
                              <Field label={t('k.tarjeta.venc')} error={errors.cardExpiry}>
                                {({ id, invalid, describedBy }) => (
                                  <input
                                    id={id}
                                    inputMode="numeric"
                                    autoComplete="off"
                                    value={card.expiry}
                                    onChange={(e) => setCard((c) => ({ ...c, expiry: formatExpiry(e.target.value) }))}
                                    onFocus={() => setFlipped(false)}
                                    placeholder="MM/AA"
                                    aria-invalid={invalid}
                                    aria-describedby={describedBy}
                                    className={`tnum ${inputCls(invalid)}`}
                                  />
                                )}
                              </Field>
                              <Field label={t('k.tarjeta.cvv')} error={errors.cardCvv}>
                                {({ id, invalid, describedBy }) => (
                                  <input
                                    id={id}
                                    inputMode="numeric"
                                    autoComplete="off"
                                    value={card.cvv}
                                    onChange={(e) =>
                                      setCard((c) => ({ ...c, cvv: digits(e.target.value).slice(0, cvvLength(brand)) }))
                                    }
                                    onFocus={() => setFlipped(true)}
                                    onBlur={() => setFlipped(false)}
                                    placeholder={'•'.repeat(cvvLength(brand))}
                                    aria-invalid={invalid}
                                    aria-describedby={describedBy}
                                    className={`tnum ${inputCls(invalid)}`}
                                  />
                                )}
                              </Field>
                            </div>
                            <Field label={t('k.tarjeta.cuotas')}>
                              {({ id }) => (
                                <select
                                  id={id}
                                  value={card.installments}
                                  onChange={(e) => setCard((c) => ({ ...c, installments: Number(e.target.value) }))}
                                  className={inputCls(false)}
                                >
                                  {cuotas.map((n) => (
                                    <option key={n} value={n}>
                                      {n === 1
                                        ? t('k.tarjeta.unaCuota')
                                        : t('k.tarjeta.cuotasN', {
                                            n,
                                            monto: money(Math.round(totals.totalPYG / n), currency),
                                          })}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </Field>
                          </div>

                          <div className="order-1 lg:order-2 lg:sticky lg:top-28">
                            <CardVisual
                              number={card.number}
                              name={card.name}
                              expiry={card.expiry}
                              brand={brand}
                              flipped={flipped}
                            />
                            <div className="mt-5 border border-gilt/40 p-4">
                              <p className="label text-gilt">{t('k.tarjeta.demo')}</p>
                              <p className="mt-2 text-[0.78rem] leading-relaxed text-stone-2">
                                {t('k.tarjeta.demoTexto')}
                              </p>
                              <p className="tnum mt-3 text-[0.8rem]">{TEST_CARDS[0].number}</p>
                              <p className="mt-1 text-[0.75rem] text-stone">
                                {t('k.tarjeta.rechazo')} <span className="tnum">{TEST_CARDS[3].number}</span>
                              </p>
                              <button
                                type="button"
                                onClick={() =>
                                  setCard({
                                    number: TEST_CARDS[0].number,
                                    name: t('k.tarjeta.titular'),
                                    expiry: '11/29',
                                    cvv: '123',
                                    installments: 1,
                                  })
                                }
                                className="link-rule label mt-3 text-ink"
                              >
                                {t('k.tarjeta.rellenar')}
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Paso 4 · Revisión */}
              {step === 4 && (
                <div className="space-y-8">
                  <h2 className="display-md">{t('k.revisar')}</h2>

                  <dl className="space-y-px">
                    {[
                      {
                        k: t('k.s1'),
                        v: [customer.name, customer.email, customer.phone, customer.doc].filter(Boolean).join(' · '),
                        go: 1,
                      },
                      {
                        k: t('k.s2'),
                        v: [
                          shipping === 'boutique' ? t('k.envio.boutique') : t(shipping === 'express' ? 'k.envio.express' : 'k.envio.estandar'),
                          customer.address,
                          customer.city,
                          customer.country === 'PY' ? t('k.py') : t('k.br'),
                        ]
                          .filter(Boolean)
                          .join(' · '),
                        go: 2,
                      },
                      {
                        k: t('k.s3'),
                        v:
                          payment === 'tarjeta'
                            ? `${BRAND_LABEL[brand]} ···· ${last4(card.number)}${card.installments > 1 ? ` · ${card.installments}×` : ''}`
                            : payment === 'transferencia'
                              ? t('k.pago.transferencia')
                              : payment === 'contra-entrega'
                                ? t('k.pago.contra')
                                : t('k.pago.whatsapp'),
                        go: 3,
                      },
                    ].map((row) => (
                      <div key={row.k} className="flex items-start justify-between gap-6 border-t border-stone/30 py-4">
                        <div className="min-w-0">
                          <dt className="label text-stone-2">{row.k}</dt>
                          <dd className="mt-1.5 break-words text-[0.9rem]">{row.v}</dd>
                        </div>
                        <button
                          type="button"
                          onClick={() => setStep(row.go)}
                          className="link-rule label shrink-0 text-gilt"
                        >
                          {t('k.editar')}
                        </button>
                      </div>
                    ))}
                  </dl>

                  <div className="border-t border-stone/30 pt-6">
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={accepted}
                        onChange={(e) => {
                          setAccepted(e.target.checked);
                          setErrors((x) => ({ ...x, terms: '' }));
                        }}
                        className="peer sr-only"
                      />
                      <span
                        aria-hidden
                        className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center border transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gilt ${
                          accepted ? 'border-ink bg-ink text-paper' : errors.terms ? 'border-claret' : 'border-stone/50'
                        }`}
                      >
                        {accepted && (
                          <svg viewBox="0 0 10 10" className="h-2.5 w-2.5">
                            <path d="m1.5 5 2.4 2.4L8.5 2.8" fill="none" stroke="currentColor" strokeWidth="1.4" />
                          </svg>
                        )}
                      </span>
                      <span className="text-[0.85rem] leading-relaxed text-stone-2">
                        {t('k.acepto')}{' '}
                        <Link href="/terminos" className="link-rule text-ink">
                          {t('k.terminos')}
                        </Link>{' '}
                        {t('k.aceptoY')}{' '}
                        <Link href="/privacidad" className="link-rule text-ink">
                          {t('k.privacidad')}
                        </Link>
                        . {t('k.aceptoDemo')}
                      </span>
                    </label>
                    {errors.terms && (
                      <p role="alert" className="mt-2 text-[0.75rem] text-claret">
                        {errors.terms}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navegación */}
          <div className="mt-10 flex items-center justify-between gap-4 border-t border-stone/30 pt-6">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="link-rule label text-stone-2 hover:text-ink"
              >
                ← {t('k.volver')}
              </button>
            ) : (
              <Link href="/carrito" className="link-rule label text-stone-2 hover:text-ink">
                ← {t('nav.carrito')}
              </Link>
            )}

            {step < 4 ? (
              <Btn tone="solid" size="lg" arrow onClick={advance}>
                {t('k.continuar')}
              </Btn>
            ) : (
              <Btn tone="solid" size="lg" onClick={confirm}>
                {payment === 'whatsapp'
                  ? t('k.confirmarWa')
                  : payment === 'tarjeta'
                    ? t('k.confirmar', { monto: money(totals.totalPYG, currency) })
                    : t('k.confirmarTransfer')}
              </Btn>
            )}
          </div>
        </div>

        {/* Columna de resumen */}
        <aside className="hidden lg:col-span-5 lg:block">
          <div className="sticky top-28">{Summary}</div>
        </aside>
      </div>

      {/* 3-D Secure simulado */}
      <Modal
        open={phase === '3ds'}
        onClose={() => setPhase('form')}
        title={t('k.3ds.titulo')}
        labelClose={t('k.3ds.cancelar')}
        size="sm"
      >
        <p className="text-[0.9rem] leading-relaxed text-stone-2">
          {t('k.3ds.texto', { tel: maskPhone(customer.phone) })}
        </p>
        <div className="mt-6">
          <label htmlFor="otp" className="label text-stone-2">
            {t('k.3ds.codigo')}
          </label>
          <input
            id="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={otp}
            onChange={(e) => {
              setOtp(digits(e.target.value).slice(0, 6));
              setOtpError('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && verifyOtp()}
            aria-invalid={!!otpError}
            className={`tnum mt-2 h-14 w-full border bg-transparent text-center text-[1.6rem] tracking-[0.5em] ${
              otpError ? 'border-claret' : 'border-stone/40 focus:border-ink'
            }`}
          />
          {otpError && (
            <p role="alert" className="mt-2 text-[0.78rem] text-claret">
              {otpError}
            </p>
          )}
          <p className="mt-3 text-[0.75rem] text-stone">{t('k.3ds.pista')}</p>
        </div>
        <div className="mt-7 flex items-center justify-between gap-4">
          <button type="button" onClick={() => setPhase('form')} className="link-rule label text-stone-2">
            {t('k.3ds.cancelar')}
          </button>
          <Btn tone="solid" onClick={verifyOtp}>
            {t('k.3ds.verificar')}
          </Btn>
        </div>
      </Modal>

      {/* Autorización */}
      <AnimatePresence>
        {phase === 'processing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: SILK }}
            role="status"
            aria-live="assertive"
            className="on-ink grain fixed inset-0 z-110 grid place-items-center"
          >
            <div className="w-full max-w-sm px-8 text-center">
              <p className="font-display text-[1.15rem] tracking-[0.3em]">ORLÉVANE PAY</p>
              <div aria-hidden className="mx-auto mt-8 h-px w-24 overflow-hidden bg-paper/20">
                <span className="block h-px w-1/3 animate-shimmer bg-gilt" />
              </div>
              <ul className="mt-10 space-y-3.5 text-left">
                {AUTH_STEPS.map((s, i) => {
                  const idx = AUTH_STEPS.indexOf(authStep);
                  const done = i < idx;
                  const now = i === idx;
                  return (
                    <li key={s} className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className={`grid h-4 w-4 shrink-0 place-items-center border transition-colors duration-300 ${
                          done ? 'border-gilt bg-gilt text-ink' : now ? 'border-gilt' : 'border-paper/25'
                        }`}
                      >
                        {done && (
                          <svg viewBox="0 0 10 10" className="h-2.5 w-2.5">
                            <path d="m1.5 5 2.4 2.4L8.5 2.8" fill="none" stroke="currentColor" strokeWidth="1.5" />
                          </svg>
                        )}
                      </span>
                      <span className={`label ${now ? 'text-paper' : done ? 'text-paper/55' : 'text-paper/30'}`}>
                        {t(`k.procesando.${s}` as 'k.procesando.conectando')}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-10 text-[0.72rem] text-paper/40">{t('ft.aviso')}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
