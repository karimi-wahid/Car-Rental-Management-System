import { useTranslation } from "react-i18next";

const SpecPill = ({ icon: Icon, label, value }) => {
  const { i18n } = useTranslation();

  const isRTL = i18n.language !== "en";

  return (
    <div
      className="flex flex-col items-center gap-1.5 rounded-2xl border border-zinc-100 bg-zinc-50 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <Icon className="h-4 w-4 text-zinc-400" />

      <span className="text-sm font-semibold text-zinc-900 dark:text-white">
        {value}
      </span>

      <span className="text-[10px] uppercase tracking-wider text-zinc-400">
        {label}
      </span>
    </div>
  );
};

export default SpecPill;
