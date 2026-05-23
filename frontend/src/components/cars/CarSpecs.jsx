import {
  Car,
  Fuel,
  Gauge,
  Users,
  Calendar,
  Palette,
  Hash,
  Award,
  Wind,
  Thermometer,
  Bluetooth,
  Wifi,
  Coffee,
  BatteryCharging,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

export const CarSpecs = ({ car }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language !== "en";

  const getTransmissionText = (transmission) => {
    if (transmission === "automatic") return t("transmission.automatic");
    if (transmission === "manual") return t("transmission.manual");
    return transmission;
  };

  const getFuelTypeText = (fuelType) => {
    switch (fuelType) {
      case "petrol":
        return t("fuel.petrol");
      case "diesel":
        return t("fuel.diesel");
      case "electric":
        return t("fuel.electric");
      case "hybrid":
        return t("fuel.hybrid");
      default:
        return fuelType;
    }
  };

  const specs = [
    { icon: Car, label: t("carSpecs.brand"), value: car.brand },
    { icon: Car, label: t("carSpecs.model"), value: car.carModel },
    { icon: Calendar, label: t("carSpecs.year"), value: car.year },
    {
      icon: Users,
      label: t("carSpecs.seats"),
      value: t("carSpecs.personCount", { count: car.seats }),
    },
    {
      icon: Gauge,
      label: t("carSpecs.transmission"),
      value: getTransmissionText(car.transmission),
    },
    {
      icon: Fuel,
      label: t("carSpecs.fuelType"),
      value: getFuelTypeText(car.fuelType),
    },
    {
      icon: Gauge,
      label: t("carSpecs.mileage"),
      value: car.mileage
        ? t("carSpecs.mileageValue", { mileage: car.mileage })
        : t("carSpecs.unspecified"),
    },
    {
      icon: Palette,
      label: t("carSpecs.color"),
      value: car.color || t("carSpecs.unspecified"),
    },
    { icon: Hash, label: t("carSpecs.licensePlate"), value: car.licensePlate },
  ];

  // Map features to icons with localized labels
  const featureIcons = {
    "Air Conditioning": { icon: Wind, labelKey: "carFeatures.airConditioning" },
    "Heated Seats": { icon: Thermometer, labelKey: "carFeatures.heatedSeats" },
    Bluetooth: { icon: Bluetooth, labelKey: "carFeatures.bluetooth" },
    WiFi: { icon: Wifi, labelKey: "carFeatures.wifi" },
    GPS: { icon: Award, labelKey: "carFeatures.gps" },
    "Coffee Machine": { icon: Coffee, labelKey: "carFeatures.coffeeMachine" },
    "USB Charger": {
      icon: BatteryCharging,
      labelKey: "carFeatures.usbCharger",
    },
  };

  return (
    <div className="space-y-8" dir={isRTL ? "rtl" : "ltr"}>
      {/* Key Specs Grid */}
      <div>
        <h3
          className={`text-xl font-semibold mb-4 ${isRTL ? "text-right" : "text-left"}`}
        >
          {t("carSpecs.specifications")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {specs.map((spec, index) => (
            <div
              key={index}
              className={`flex items-center p-3 bg-muted/30 rounded-lg ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <spec.icon
                className={`w-5 h-5 text-primary ${isRTL ? "ml-3" : "mr-3"}`}
              />
              <div className={isRTL ? "text-right" : "text-left"}>
                <p className="text-sm text-muted-foreground">{spec.label}</p>
                <p className="font-medium">{spec.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <h3
          className={`text-xl font-semibold mb-4 ${isRTL ? "text-right" : "text-left"}`}
        >
          {t("carSpecs.description")}
        </h3>
        <p
          className={`text-muted-foreground leading-relaxed ${isRTL ? "text-right" : "text-left"}`}
        >
          {car.description}
        </p>
      </div>

      {/* Features */}
      <div>
        <h3
          className={`text-xl font-semibold mb-4 ${isRTL ? "text-right" : "text-left"}`}
        >
          {t("carSpecs.features")}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {car.features.map((feature, index) => {
            const featureData = featureIcons[feature] || {
              icon: Award,
              labelKey: null,
            };
            const Icon = featureData.icon;
            const label = featureData.labelKey
              ? t(featureData.labelKey)
              : feature;
            return (
              <div
                key={index}
                className={`flex items-center p-2 bg-muted/30 rounded-lg ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <Icon
                  className={`w-4 h-4 text-primary ${isRTL ? "ml-2" : "mr-2"}`}
                />
                <span className="text-sm">{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Availability Badge */}
      <div
        className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse justify-end" : ""}`}
      >
        <Badge
          variant={car.availability ? "default" : "destructive"}
          className="px-4 py-2"
        >
          {car.availability
            ? t("carSpecs.available")
            : t("carSpecs.unavailable")}
        </Badge>
        {!car.availability && (
          <p className="text-sm text-muted-foreground">
            {t("carSpecs.temporarilyUnavailable")}
          </p>
        )}
      </div>
    </div>
  );
};
