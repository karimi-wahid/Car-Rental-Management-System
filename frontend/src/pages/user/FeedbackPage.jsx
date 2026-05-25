import { useState } from "react";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MessageSquare,
  Send,
  Star,
  User,
  Mail,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/common/PageHeader";

const FeedbackPage = () => {
  const { t, i18n } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const isRTL = i18n.language !== "en";

  // Zod Schema with translations
  const getFeedbackSchema = () =>
    z.object({
      name: z
        .string()
        .min(2, t("feedback.validation.nameMin"))
        .max(50, t("feedback.validation.nameMax")),
      email: z
        .string()
        .min(1, t("feedback.validation.emailRequired"))
        .email(t("feedback.validation.emailInvalid")),
      message: z
        .string()
        .min(10, t("feedback.validation.messageMin"))
        .max(1000, t("feedback.validation.messageMax")),
      rating: z.number().min(1, t("feedback.validation.ratingRequired")).max(5),
    });

  const feedbackSchema = getFeedbackSchema();

  // React Hook Form + Zod
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
      rating: 0,
    },
  });

  const rating = watch("rating");

  // Submit
  const onSubmit = async (data) => {
    console.log(data);
    // API Request here
    setSubmitted(true);
    reset({
      name: "",
      email: "",
      message: "",
      rating: 0,
    });
    setTimeout(() => {
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div
      className="min-h-screen bg-linear-to-b from-background to-muted/20 px-4 py-10"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <PageHeader
            title={t("feedback.title")}
            description={t("feedback.subtitle")}
          />
        </motion.div>

        {/* Success */}
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-center text-green-600"
          >
            {t("feedback.successMessage")}
          </motion.div>
        )}

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="overflow-hidden rounded-[32px] border-0 bg-background/80">
            <CardContent className="p-8 md:p-10">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
                {/* Name + Email */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label
                      className={isRTL ? "text-right block" : "text-left block"}
                    >
                      {t("feedback.fullName")}
                    </Label>
                    <div className="relative">
                      <User
                        className={`absolute ${isRTL ? "right-4" : "left-4"} top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground`}
                      />
                      <Input
                        placeholder={t("feedback.namePlaceholder")}
                        className={`h-12 rounded-2xl ${isRTL ? "pr-12 text-right" : "pl-12 text-left"}`}
                        {...register("name")}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-sm text-destructive">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label
                      className={isRTL ? "text-right block" : "text-left block"}
                    >
                      {t("feedback.email")}
                    </Label>
                    <div className="relative">
                      <Mail
                        className={`absolute ${isRTL ? "right-4" : "left-4"} top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground`}
                      />
                      <Input
                        type="email"
                        dir="ltr"
                        placeholder={t("feedback.emailPlaceholder")}
                        className={`h-12 rounded-2xl ${isRTL ? "pr-12" : "pl-12"} text-left`}
                        {...register("email")}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-destructive">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Rating */}
                <div className="space-y-3">
                  <Label
                    className={isRTL ? "text-right block" : "text-left block"}
                  >
                    {t("feedback.yourRating")}
                  </Label>
                  <div
                    className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setValue("rating", star, { shouldValidate: true })
                        }
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {errors.rating && (
                    <p className="text-sm text-destructive">
                      {errors.rating.message}
                    </p>
                  )}
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label
                    className={isRTL ? "text-right block" : "text-left block"}
                  >
                    {t("feedback.yourFeedback")}
                  </Label>
                  <Textarea
                    rows={6}
                    placeholder={t("feedback.messagePlaceholder")}
                    className={`resize-none rounded-3xl p-4 ${isRTL ? "text-right" : "text-left"}`}
                    {...register("message")}
                  />
                  {errors.message && (
                    <p className="text-sm text-destructive">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border bg-muted/40 p-4">
                    <CheckCircle2 className="mb-2 h-6 w-6 text-green-500" />
                    <h4 className="font-semibold">
                      {t("feedback.fastResponse")}
                    </h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t("feedback.fastResponseDesc")}
                    </p>
                  </div>
                  <div className="rounded-2xl border bg-muted/40 p-4">
                    <CheckCircle2 className="mb-2 h-6 w-6 text-blue-500" />
                    <h4 className="font-semibold">
                      {t("feedback.systemImprovement")}
                    </h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t("feedback.systemImprovementDesc")}
                    </p>
                  </div>
                  <div className="rounded-2xl border bg-muted/40 p-4">
                    <CheckCircle2 className="mb-2 h-6 w-6 text-purple-500" />
                    <h4 className="font-semibold">
                      {t("feedback.dataSecurity")}
                    </h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t("feedback.dataSecurityDesc")}
                    </p>
                  </div>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-14 w-full rounded-2xl text-base font-semibold"
                >
                  <Send className={`h-5 w-5 ${isRTL ? "ml-2" : "mr-2"}`} />
                  {isSubmitting ? t("feedback.sending") : t("feedback.submit")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default FeedbackPage;
