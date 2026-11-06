"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { type FormEvent, type ReactNode, useEffect, useId, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { LuArrowRight, LuCircleCheck, LuX } from "react-icons/lu";
import { z } from "zod";
import Button from "@/components/ui/Button";
import InquiryHooks from "@/features/Inquiry/hooks/inquiry.hooks";
import { PREFERRED_CONTACT, PREFERRED_CONTACT_LABELS } from "@/features/Inquiry/interface/inquiry.interface";
import { apiErrorMessage, apiFieldErrors } from "@/lib/api";
import { cn } from "@/lib/utils";

// Mirrors the server validation (Server/src/app/modules/Inquiry/inquiry.validation.ts)
const schema = z
  .object({
    name: z.string().trim().min(2, "Please enter your name").max(80),
    email: z.string().trim().email("Please enter a valid email address").max(160),
    businessName: z.string().trim().max(120).optional(),
    country: z.string().trim().max(80).optional(),
    website: z
      .string()
      .trim()
      .max(2048)
      .refine((value) => !value || /^https?:\/\/\S+\.\S+/.test(value), "Enter a full URL, e.g. https://example.com")
      .optional(),
    industry: z.string().trim().max(80).optional(),
    service: z.string().trim().max(120).optional(),
    message: z.string().trim().min(20, "Please tell us a little more (at least 20 characters)").max(5000),
    budgetRange: z.string().max(60).optional(),
    desiredLaunch: z.string().max(60).optional(),
    preferredContact: z.enum(PREFERRED_CONTACT),
    phone: z
      .string()
      .trim()
      .max(30)
      .refine((value) => !value || /^[+\d][\d\s()-]{6,24}$/.test(value), "Please enter a valid phone number")
      .optional(),
    consent: z.literal(true, { errorMap: () => ({ message: "Please confirm so we can reply to you" }) }),
    homepage: z.string().optional(),
  })
  .refine((data) => !["whatsapp", "phone"].includes(data.preferredContact) || !!data.phone, {
    message: "Add a phone number so we can reach you on WhatsApp or by phone",
    path: ["phone"],
  });

type TFormValues = z.infer<typeof schema>;

const LAUNCH_OPTIONS = ["As soon as possible", "Within 1 month", "1–3 months", "3–6 months", "Flexible / not sure yet"];

const inputClass =
  "w-full rounded-xl bg-paper-50 px-4 py-3.5 text-[0.98rem] text-ink-900 ring-1 ring-ink-900/12 outline-none transition-shadow placeholder:text-stone-500 focus:ring-2 focus:ring-ink-900 aria-[invalid=true]:ring-error";

function Field({
  id,
  label,
  optional,
  error,
  hint,
  children,
  className,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 flex items-baseline justify-between gap-3 text-sm font-medium text-ink-900">
        {label}
        {optional && <span className="text-xs font-normal text-stone-500">Optional</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-stone-600">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}

export type TInquiryContext = {
  industry?: string;
  service?: string;
  projectSlug?: string;
  projectTitle?: string;
};

export default function InquiryForm({
  context,
  industries,
  services,
  budgetRanges,
  privacyHref = "/privacy",
}: {
  context: TInquiryContext;
  industries: string[];
  services: string[];
  budgetRanges: string[];
  privacyHref?: string;
}) {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;
  const startedAt = useRef<number>(0);
  const successRef = useRef<HTMLHeadingElement>(null);
  const [project, setProject] = useState(context.projectSlug ? { slug: context.projectSlug, title: context.projectTitle } : null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<TFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      preferredContact: "email",
      industry: context.industry || "",
      service: context.service || "",
    },
  });

  const submit = InquiryHooks.useSubmitInquiry();
  // useWatch (not watch) keeps this component compatible with the React Compiler
  const preferred = useWatch({ control, name: "preferredContact" });

  const submitInquiry = async (values: TFormValues) => {
    setFormError(null);
    try {
      const response = await submit.mutateAsync({
        ...values,
        consent: true,
        projectSlug: project?.slug,
        projectTitle: project?.title,
        sourcePath: typeof window !== "undefined" ? window.location.pathname + window.location.search : undefined,
        // Elapsed time measured on this device only, so a wrong device clock
        // can't make a real visitor look like a bot
        fillMs: startedAt.current ? Date.now() - startedAt.current : undefined,
      });
      setSuccess(response.message);
      requestAnimationFrame(() => successRef.current?.focus());
    } catch (error) {
      // Show server-side field errors next to the matching inputs
      const fieldErrors = apiFieldErrors(error);
      Object.entries(fieldErrors).forEach(([field, message]) => {
        if (field in schema.innerType().shape) setError(field as keyof TFormValues, { message });
      });
      setFormError(apiErrorMessage(error));
    }
  };

  // handleSubmit runs inside the submit event (never during render)
  const onSubmit = (event: FormEvent<HTMLFormElement>) => handleSubmit(submitInquiry)(event);

  if (success) {
    return (
      <div className="rounded-[1.75rem] bg-paper-50 p-8 ring-1 ring-ink-900/10 sm:p-10" role="status">
        <LuCircleCheck aria-hidden className="size-10 text-success" />
        <h2 ref={successRef} tabIndex={-1} className="text-display-md mt-6 outline-none">
          Inquiry received
        </h2>
        <p className="text-lead mt-4 text-stone-600">{success}</p>
        <ol className="mt-8 space-y-4">
          {[
            "Your details are reviewed personally — no automated sales sequences.",
            "You'll get a reply with questions or a suggested next step.",
            "If it's a good fit, you'll receive a clear proposal with scope and timeline.",
          ].map((step, index) => (
            <li key={step} className="flex gap-4">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ink-950 font-mono text-xs text-paper-50">
                {index + 1}
              </span>
              <span className="leading-relaxed text-stone-700">{step}</span>
            </li>
          ))}
        </ol>
        <Link href="/work" className="mt-8 inline-flex items-center gap-2 font-medium underline underline-offset-4">
          Explore more work <LuArrowRight aria-hidden className="size-4" />
        </Link>
      </div>
    );
  }

  const aria = (name: keyof TFormValues, hint?: boolean) => ({
    id: id(name),
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? id(`${name}-error`) : hint ? id(`${name}-hint`) : undefined,
  });

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-[1.75rem] bg-paper-50/60 p-6 ring-1 ring-ink-900/10 sm:p-9">
      {formError && (
        <div role="alert" className="mb-6 rounded-xl bg-error/10 px-4 py-3 text-sm text-ink-900 ring-1 ring-error/30">
          {formError}
        </div>
      )}

      {project && (
        <div className="mb-7 flex items-center justify-between gap-3 rounded-xl bg-ink-950 px-4 py-3 text-sm text-paper-50">
          <span>
            <span className="text-ink-300">Asking about: </span>
            <strong className="font-medium">{project.title || project.slug}</strong>
          </span>
          <button
            type="button"
            onClick={() => setProject(null)}
            className="inline-flex size-8 items-center justify-center rounded-full hover:bg-white/10"
          >
            <LuX aria-hidden className="size-4" />
            <span className="sr-only">Remove project reference</span>
          </button>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={id("name")} label="Your name" error={errors.name?.message}>
          <input {...register("name")} {...aria("name")} autoComplete="name" className={inputClass} />
        </Field>
        <Field id={id("email")} label="Business email" error={errors.email?.message}>
          <input {...register("email")} {...aria("email")} type="email" autoComplete="email" className={inputClass} />
        </Field>
        <Field id={id("businessName")} label="Business name" optional error={errors.businessName?.message}>
          <input {...register("businessName")} {...aria("businessName")} autoComplete="organization" className={inputClass} />
        </Field>
        <Field id={id("country")} label="Country" optional error={errors.country?.message}>
          <input {...register("country")} {...aria("country")} autoComplete="country-name" className={inputClass} />
        </Field>
        <Field id={id("website")} label="Current website" optional error={errors.website?.message} hint="If you already have one">
          <input
            {...register("website")}
            {...aria("website", true)}
            type="url"
            inputMode="url"
            placeholder="https://"
            className={inputClass}
          />
        </Field>
        <Field id={id("industry")} label="Industry" optional error={errors.industry?.message}>
          <select {...register("industry")} {...aria("industry")} className={cn(inputClass, "appearance-none")}>
            <option value="">Select your industry</option>
            {industries.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
            <option value="Other">Other</option>
          </select>
        </Field>
        <Field id={id("service")} label="What do you need?" optional error={errors.service?.message} className="sm:col-span-2">
          <select {...register("service")} {...aria("service")} className={cn(inputClass, "appearance-none")}>
            <option value="">Not sure yet — let&apos;s discuss</option>
            {services.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>
        <Field
          id={id("message")}
          label="Tell us about your project"
          error={errors.message?.message}
          hint="Goals, must-have features, examples you like — whatever helps."
          className="sm:col-span-2"
        >
          <textarea {...register("message")} {...aria("message", true)} rows={6} className={cn(inputClass, "resize-y")} />
        </Field>
        <Field id={id("budgetRange")} label="Budget range" optional error={errors.budgetRange?.message}>
          <select {...register("budgetRange")} {...aria("budgetRange")} className={cn(inputClass, "appearance-none")}>
            <option value="">Select a range</option>
            {budgetRanges.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>
        <Field id={id("desiredLaunch")} label="Desired launch" optional error={errors.desiredLaunch?.message}>
          <select {...register("desiredLaunch")} {...aria("desiredLaunch")} className={cn(inputClass, "appearance-none")}>
            <option value="">Select a timeframe</option>
            {LAUNCH_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <fieldset className="mt-7">
        <legend className="mb-3 text-sm font-medium text-ink-900">Preferred way to reply</legend>
        <div className="flex flex-wrap gap-2">
          {PREFERRED_CONTACT.map((method) => (
            <label
              key={method}
              className="relative inline-flex h-11 cursor-pointer items-center rounded-full px-5 text-sm ring-1 ring-ink-900/15 transition-colors has-[:checked]:bg-ink-950 has-[:checked]:text-paper-50 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink-900"
            >
              <input type="radio" value={method} {...register("preferredContact")} className="sr-only" />
              {PREFERRED_CONTACT_LABELS[method]}
            </label>
          ))}
        </div>
      </fieldset>

      {(preferred === "whatsapp" || preferred === "phone" || preferred === "video-call") && (
        <Field id={id("phone")} label="Phone / WhatsApp number" optional={preferred === "video-call"} error={errors.phone?.message} className="mt-5 sm:max-w-sm">
          <input {...register("phone")} {...aria("phone")} type="tel" autoComplete="tel" placeholder="+1 555 000 0000" className={inputClass} />
        </Field>
      )}

      {/* Honeypot: hidden from people and assistive technology; bots fill it */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={id("homepage")}>Leave this field empty</label>
        <input id={id("homepage")} type="text" tabIndex={-1} autoComplete="off" {...register("homepage")} />
      </div>

      <div className="mt-7">
        <label className="flex cursor-pointer gap-3 text-sm leading-relaxed text-stone-700">
          <input
            type="checkbox"
            {...register("consent")}
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? id("consent-error") : undefined}
            className="mt-0.5 size-5 shrink-0 accent-[var(--color-ink-950)]"
          />
          <span>
            I agree that my details are used to respond to this inquiry, as described in the{" "}
            <Link href={privacyHref} className="font-medium text-ink-900 underline underline-offset-4">
              privacy policy
            </Link>
            .
          </span>
        </label>
        {errors.consent && (
          <p id={id("consent-error")} className="mt-1.5 text-sm text-error">
            {errors.consent.message}
          </p>
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Button type="submit" variant="primary" size="lg" loading={submit.isLoading} rightIcon={<LuArrowRight aria-hidden className="size-4" />}>
          Send inquiry
        </Button>
        <p className="text-xs text-stone-600">Please don&apos;t include passwords or payment details.</p>
      </div>
    </form>
  );
}
