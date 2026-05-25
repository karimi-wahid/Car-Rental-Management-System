import { useState } from "react";
import { X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

const FeaturesInput = ({ features = [], onChange }) => {
  const { t, i18n } = useTranslation();
  const [featureInput, setFeatureInput] = useState("");
  const isRTL = i18n.language !== "en";

  const addFeature = (feature) => {
    const trimmed = feature.trim();
    if (trimmed && !features.includes(trimmed)) {
      onChange([...features, trimmed]);
    }
  };

  const removeFeature = (index) => {
    onChange(features.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && featureInput.trim()) {
      e.preventDefault();
      addFeature(featureInput);
      setFeatureInput("");
    }

    if (e.key === "Backspace" && !featureInput && features.length > 0) {
      onChange(features.slice(0, -1));
    }
  };

  const getPlaceholder = () => {
    if (featureInput.length > 0) return "";
    return t("featuresInput.placeholder");
  };

  return (
    <div className="space-y-3">
      <Label className={isRTL ? "text-right block" : "text-left block"}>
        {t("featuresInput.label")}
      </Label>

      <div className="min-h-14 w-full rounded-2xl border bg-background px-3 py-2 flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-primary">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1 rounded-xl text-sm"
          >
            <span>{feature}</span>
            <button
              type="button"
              onClick={() => removeFeature(index)}
              className="hover:text-red-300 transition"
              aria-label={t("featuresInput.removeFeature")}
            >
              <X size={14} />
            </button>
          </div>
        ))}

        <input
          type="text"
          value={featureInput}
          onChange={(e) => setFeatureInput(e.target.value)}
          placeholder={getPlaceholder()}
          className={`flex-1 min-w-30 bg-transparent outline-none text-sm ${isRTL ? "text-right" : "text-left"}`}
          onKeyDown={handleKeyDown}
          aria-label={t("featuresInput.inputLabel")}
        />
      </div>

      <p
        className={`text-xs text-muted-foreground ${isRTL ? "text-right" : "text-left"}`}
      >
        {t("featuresInput.hint")}
      </p>
    </div>
  );
};

export default FeaturesInput;
