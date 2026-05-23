import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import useContactStore from "@/store/contactStore";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ContactPage = () => {
  const user = useAuthStore((state) => state.user);
  const { createContact, submitting } = useContactStore();
  const location = useLocation();
  const [success, setSuccess] = useState(false);
  const [trackingId, setTrackingId] = useState("");
  const { t, i18n } = useTranslation();

  const contactSchema = z.object({
    name: z
      .string()
      .min(1, t("contact.validation.nameRequired"))
      .min(2, t("contact.validation.nameShort")),

    email: z
      .string()
      .min(1, t("contact.validation.emailRequired"))
      .email(t("contact.validation.emailInvalid")),

    phone: z.string().optional(),

    subject: z.string().min(1, t("contact.validation.subjectRequired")),

    message: z
      .string()
      .min(1, t("contact.validation.messageRequired"))
      .min(10, t("contact.validation.messageShort"))
      .max(2000, t("contact.validation.messageLong")),
  });

  const CONTACT_INFO = [
    {
      icon: MapPin,
      label: t("contact.info.address"),
      value: t("contact.info.addressValue"),
    },

    {
      icon: Phone,
      label: t("contact.info.phone"),
      value: "+93 700 123 456",
    },

    {
      icon: Mail,
      label: t("contact.info.email"),
      value: "info@luxcar.af",
    },

    {
      icon: Clock,
      label: t("contact.info.hours"),
      value: t("contact.info.hoursValue"),
    },
  ];

  const SUBJECTS = [
    {
      value: "general",
      label: t("contact.subjects.general"),
    },

    {
      value: "booking",
      label: t("contact.subjects.booking"),
    },

    {
      value: "complaint",
      label: t("contact.subjects.complaint"),
    },

    {
      value: "partnership",
      label: t("contact.subjects.partnership"),
    },

    {
      value: "other",
      label: t("contact.subjects.other"),
    },
  ];

  const FAQS = [
    {
      id: "faq-1",
      q: t("contact.faq.q1"),
      a: t("contact.faq.a1"),
    },

    {
      id: "faq-2",
      q: t("contact.faq.q2"),
      a: t("contact.faq.a2"),
    },

    {
      id: "faq-3",
      q: t("contact.faq.q3"),
      a: t("contact.faq.a3"),
    },

    {
      id: "faq-4",
      q: t("contact.faq.q4"),
      a: t("contact.faq.a4"),
    },
  ];

  // React Hook Form + Zod
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactSchema),

    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      subject: location.state?.subject || "general",

      message: location.state?.bookingId
        ? `شماره رزرو: ${location.state.bookingId}\n\n`
        : "",
    },
  });

  const subject = watch("subject");

  // Submit
  const onSubmit = async (data) => {
    const result = await createContact({
      ...data,
      bookingId: location.state?.bookingId || undefined,
    });

    if (result.success) {
      setTrackingId(result.data._id);

      setSuccess(true);

      reset();

      toast.success(t("contact.toastSuccess"));
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen" dir={i18n.language === "en" ? "ltr" : "rtl"}>
      {/* Hero */}
      <section className="dark:bg-zinc-950 px-6 py-20 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-2xl"
        >
          <Badge className="mb-4 border-black bg-white dark:border-white/20 dark:bg-white/10 dark:text-white text-black">
            {t("contact.badge")}
          </Badge>

          <h1 className="mb-4 text-4xl font-bold dark:text-white text-black">
            {t("contact.title")}
          </h1>

          <p className="text-zinc-400">{t("contact.description")}</p>
        </motion.div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Left */}
          <div className="space-y-8">
            {/* Contact Info */}
            <div className="space-y-4">
              {CONTACT_INFO.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{
                    opacity: 0,
                    x: -16,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay: i * 0.07,
                  }}
                  className="flex items-start gap-4 rounded-xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-200 dark:bg-zinc-800">
                    <item.icon className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                  </div>

                  <div>
                    <p className="mb-0.5 text-xs text-zinc-400">{item.label}</p>

                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                      {item.value}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* FAQ with shadcn Accordion */}
            <div>
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-zinc-900 dark:text-white">
                <MessageSquare className="h-4 w-4" />
                {t("contact.faqTitle")}
              </h3>

              <Accordion type="single" collapsible className="space-y-2">
                {FAQS.map((faq) => (
                  <AccordionItem
                    key={faq.id}
                    value={faq.id}
                    className="rounded-xl border border-zinc-100 dark:border-zinc-800 px-5"
                  >
                    <AccordionTrigger className="py-4 text-sm font-medium text-zinc-900 hover:no-underline dark:text-white">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          {/* Right */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{
                    opacity: 0,
                    scale: 0.95,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{ opacity: 0 }}
                  className="flex h-full flex-col items-center justify-center rounded-2xl border border-zinc-100 bg-zinc-50 px-8 py-20 text-center dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <CheckCircle className="mx-auto mb-6 h-16 w-16 text-emerald-500" />

                  <h2 className="mb-3 text-2xl font-bold text-zinc-900 dark:text-white">
                    {t("contact.successTitle")}
                  </h2>

                  <p className="mb-2 text-zinc-500">
                    {t("contact.successDescription")}
                  </p>

                  {trackingId && (
                    <p className="mb-6 font-mono text-xs text-zinc-400">
                      {t("contact.tracking")}:{" "}
                      {trackingId.slice(-8).toUpperCase()}
                    </p>
                  )}

                  <Button variant="outline" onClick={() => setSuccess(false)}>
                    {t("contact.newMessage")}
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{
                    opacity: 0,
                    y: 12,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl border border-zinc-100 bg-zinc-50 p-8 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <h2 className="mb-6 text-xl font-bold text-zinc-900 dark:text-white">
                    {t("contact.sendMessage")}
                  </h2>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      {/* Name */}
                      <div className="space-y-2">
                        <Label htmlFor="name">{t("contact.fullName")} *</Label>

                        <Input
                          id="name"
                          placeholder={t("contact.namePlaceholder")}
                          className="bg-white dark:bg-zinc-800"
                          {...register("name")}
                        />

                        {errors.name && (
                          <p className="text-xs text-destructive">
                            {errors.name.message}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <Label htmlFor="email">{t("contact.email")} *</Label>

                        <Input
                          id="email"
                          type="email"
                          placeholder={t("contact.emailPlaceholder")}
                          className="bg-white dark:bg-zinc-800"
                          {...register("email")}
                        />

                        {errors.email && (
                          <p className="text-xs text-destructive">
                            {errors.email.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      {/* Phone */}
                      <div className="space-y-2">
                        <Label htmlFor="phone">{t("contact.phone")}</Label>

                        <Input
                          id="phone"
                          placeholder={t("contact.phonePlaceholder")}
                          className="bg-white dark:bg-zinc-800"
                          {...register("phone")}
                        />
                      </div>

                      {/* Subject */}
                      <div className="space-y-2">
                        <Label>{t("contact.subject")} *</Label>

                        <Select
                          value={subject}
                          onValueChange={(val) => setValue("subject", val)}
                        >
                          <SelectTrigger className="bg-white dark:bg-zinc-800">
                            <SelectValue
                              placeholder={t("contact.subjectPlaceholder")}
                            />
                          </SelectTrigger>

                          <SelectContent>
                            {SUBJECTS.map((s) => (
                              <SelectItem key={s.value} value={s.value}>
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {errors.subject && (
                          <p className="text-xs text-destructive">
                            {errors.subject.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <Label htmlFor="message">{t("contact.message")} *</Label>

                      <Textarea
                        id="message"
                        rows={6}
                        placeholder={t("contact.messagePlaceholder")}
                        className="resize-none bg-white dark:bg-zinc-800"
                        {...register("message")}
                      />

                      {errors.message && (
                        <p className="text-xs text-destructive">
                          {errors.message.message}
                        </p>
                      )}
                    </div>

                    {/* Submit */}
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          {t("contact.sending")}
                        </>
                      ) : (
                        <>
                          <Send className="ml-2 h-4 w-4" />
                          {t("contact.submit")}
                        </>
                      )}
                    </Button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
