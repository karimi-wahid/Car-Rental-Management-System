import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ImageUploader from "./ImageUploader";
import FeaturesInput from "./FeaturesInput";
import { useTranslation } from "react-i18next";

const CarForm = ({ formData, setFormData }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language !== "en";

  const updateField = (field) => (e) => {
    const value =
      e.target.type === "number" ? parseInt(e.target.value) : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFeaturesChange = (features) => {
    setFormData((prev) => ({ ...prev, features }));
  };

  return (
    <div className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="name"
            className={isRTL ? "text-right block" : "text-left block"}
          >
            {t("carForm.carName")}
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={updateField("name")}
            className={isRTL ? "text-right" : "text-left"}
            placeholder={t("carForm.carNamePlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="brand"
            className={isRTL ? "text-right block" : "text-left block"}
          >
            {t("carForm.brand")}
          </Label>
          <Input
            id="brand"
            value={formData.brand}
            onChange={updateField("brand")}
            className={isRTL ? "text-right" : "text-left"}
            placeholder={t("carForm.brandPlaceholder")}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="carModel"
            className={isRTL ? "text-right block" : "text-left block"}
          >
            {t("carForm.model")}
          </Label>
          <Input
            id="carModel"
            value={formData.carModel}
            onChange={updateField("carModel")}
            className={isRTL ? "text-right" : "text-left"}
            placeholder={t("carForm.modelPlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="year"
            className={isRTL ? "text-right block" : "text-left block"}
          >
            {t("carForm.year")}
          </Label>
          <Input
            id="year"
            type="number"
            value={formData.year}
            onChange={updateField("year")}
            className={isRTL ? "text-right" : "text-left"}
            placeholder={t("carForm.yearPlaceholder")}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="seats"
            className={isRTL ? "text-right block" : "text-left block"}
          >
            {t("carForm.seats")}
          </Label>
          <Input
            id="seats"
            type="number"
            value={formData.seats}
            onChange={updateField("seats")}
            className={isRTL ? "text-right" : "text-left"}
            placeholder={t("carForm.seatsPlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="pricePerDay"
            className={isRTL ? "text-right block" : "text-left block"}
          >
            {t("carForm.pricePerDay")}
          </Label>
          <Input
            id="pricePerDay"
            type="number"
            value={formData.pricePerDay}
            onChange={updateField("pricePerDay")}
            className={isRTL ? "text-right" : "text-left"}
            placeholder={t("carForm.pricePerDayPlaceholder")}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="transmission"
            className={isRTL ? "text-right block" : "text-left block"}
          >
            {t("carForm.transmission")}
          </Label>
          <Select
            value={formData.transmission}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, transmission: value }))
            }
          >
            <SelectTrigger className={isRTL ? "text-right" : "text-left"}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="automatic"
                className={isRTL ? "text-right" : "text-left"}
              >
                {t("transmission.automatic")}
              </SelectItem>
              <SelectItem
                value="manual"
                className={isRTL ? "text-right" : "text-left"}
              >
                {t("transmission.manual")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="fuelType"
            className={isRTL ? "text-right block" : "text-left block"}
          >
            {t("carForm.fuelType")}
          </Label>
          <Select
            value={formData.fuelType}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, fuelType: value }))
            }
          >
            <SelectTrigger className={isRTL ? "text-right" : "text-left"}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="petrol"
                className={isRTL ? "text-right" : "text-left"}
              >
                {t("fuel.petrol")}
              </SelectItem>
              <SelectItem
                value="diesel"
                className={isRTL ? "text-right" : "text-left"}
              >
                {t("fuel.diesel")}
              </SelectItem>
              <SelectItem
                value="electric"
                className={isRTL ? "text-right" : "text-left"}
              >
                {t("fuel.electric")}
              </SelectItem>
              <SelectItem
                value="hybrid"
                className={isRTL ? "text-right" : "text-left"}
              >
                {t("fuel.hybrid")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="licensePlate"
          className={isRTL ? "text-right block" : "text-left block"}
        >
          {t("carForm.licensePlate")}
        </Label>
        <Input
          id="licensePlate"
          value={formData.licensePlate}
          onChange={updateField("licensePlate")}
          className={isRTL ? "text-right" : "text-left"}
          placeholder={t("carForm.licensePlatePlaceholder")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="mileage"
            className={isRTL ? "text-right block" : "text-left block"}
          >
            {t("carForm.mileageOptional")}
          </Label>
          <Input
            id="mileage"
            type="number"
            value={formData.mileage}
            onChange={updateField("mileage")}
            className={isRTL ? "text-right" : "text-left"}
            placeholder={t("carForm.mileagePlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="color"
            className={isRTL ? "text-right block" : "text-left block"}
          >
            {t("carForm.colorOptional")}
          </Label>
          <Input
            id="color"
            value={formData.color}
            onChange={updateField("color")}
            className={isRTL ? "text-right" : "text-left"}
            placeholder={t("carForm.colorPlaceholder")}
          />
        </div>
      </div>

      <ImageUploader formData={formData} setFormData={setFormData} />

      <FeaturesInput
        features={formData.features}
        onChange={handleFeaturesChange}
      />

      <div className="space-y-2">
        <Label
          htmlFor="description"
          className={isRTL ? "text-right block" : "text-left block"}
        >
          {t("carForm.description")}
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={updateField("description")}
          rows={4}
          className={isRTL ? "text-right" : "text-left"}
          placeholder={t("carForm.descriptionPlaceholder")}
        />
      </div>

      <div
        className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <Switch
          id="availability"
          checked={formData.availability}
          onCheckedChange={(checked) =>
            setFormData((prev) => ({ ...prev, availability: checked }))
          }
        />
        <Label
          htmlFor="availability"
          className={isRTL ? "text-right" : "text-left"}
        >
          {t("carForm.availableForBooking")}
        </Label>
      </div>
    </div>
  );
};

export default CarForm;
