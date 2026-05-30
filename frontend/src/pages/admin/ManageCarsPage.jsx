import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/common/PageHeader";
import { toast } from "react-hot-toast";
import useCarStore from "@/store/carStore";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CarFilters from "@/components/cars/CarFilter";
import CarTable from "@/components/cars/CarTable";
import CarForm from "@/components/cars/CarForm";

const initialFormData = {
  name: "",
  brand: "",
  carModel: "",
  year: new Date().getFullYear(),
  seats: 5,
  transmission: "automatic",
  fuelType: "petrol",
  pricePerDay: 0,
  images: [],
  imageFiles: [],
  description: "",
  features: [],
  licensePlate: "",
  mileage: 0,
  color: "",
  availability: true,
};

const ManageCarsPage = () => {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const isRTL = i18n.language !== "en";

  const navigate = useNavigate();
  const { setFilters } = useCarStore();
  const {
    cars,
    loading,
    error,
    pagination,
    fetchCars,
    createCar,
    updateCar,
    deleteCar,
    toggleAvailability,
  } = useCarStore();

  useEffect(() => {
    if (statusFilter === "all") {
      setFilters("availability", "");
    } else {
      setFilters("availability", statusFilter === "available");
    }
    fetchCars(pagination.currentPage, pagination.itemsPerPage);
  }, [
    statusFilter,
    pagination.currentPage,
    pagination.itemsPerPage,
    fetchCars,
    setFilters,
  ]);

  const buildFormData = () => {
    const form = new FormData();
    form.append("name", formData.name);
    form.append("brand", formData.brand);
    form.append("carModel", formData.carModel);
    form.append("year", formData.year);
    form.append("seats", formData.seats);
    form.append("transmission", formData.transmission);
    form.append("fuelType", formData.fuelType);
    form.append("pricePerDay", formData.pricePerDay);
    form.append("description", formData.description);
    form.append("licensePlate", formData.licensePlate);
    form.append("mileage", formData.mileage);
    form.append("color", formData.color);
    form.append("availability", JSON.stringify(formData.availability));
    form.append("features", JSON.stringify(formData.features));
    form.append("imageUrls", JSON.stringify(formData.images));

    formData.imageFiles.forEach((item) => {
      form.append("images", item.file);
    });

    return form;
  };

  const handleAddCar = async () => {
    try {
      const form = buildFormData();
      await createCar(form);
      toast.success(t("manageCars.addSuccess"));
      setIsAddDialogOpen(false);
      setFormData(initialFormData);
    } catch (error) {
      console.log(error.response?.data);
      toast.error(error.response?.data?.message || t("manageCars.addError"));
    }
  };

  const handleEditCar = async () => {
    if (!selectedCar) return;

    try {
      const form = buildFormData();
      form.append(
        "deletedImages",
        JSON.stringify(formData.deletedImages || []),
      );

      await updateCar(selectedCar._id, form);
      toast.success(t("manageCars.editSuccess"));
      setIsEditDialogOpen(false);
    } catch (err) {
      toast.error(t("manageCars.editError"));
      console.log(err);
    }
  };

  const handleToggleAvailability = async (id, current) => {
    try {
      await toggleAvailability(id);
      toast.success(
        current
          ? t("manageCars.makeUnavailableSuccess")
          : t("manageCars.makeAvailableSuccess"),
      );
    } catch (err) {
      toast.error(error || t("manageCars.toggleAvailabilityError"));
      console.log(error);
    }
  };

  const openEditDialog = (car) => {
    setSelectedCar(car);
    setFormData({
      name: car.name,
      brand: car.brand,
      carModel: car.carModel,
      year: car.year,
      seats: car.seats,
      transmission: car.transmission,
      fuelType: car.fuelType,
      pricePerDay: car.pricePerDay,
      description: car.description,
      features: Array.isArray(car.features)
        ? car.features
        : JSON.parse(car.features || "[]"),
      licensePlate: car.licensePlate,
      mileage: car.mileage || 0,
      color: car.color || "",
      availability: car.availability,
      images: car.images?.map((img) => img.url) || [],
      imageFiles: [],
      existingImages:
        car.images?.map((img) => ({
          id: img._id || img.public_id || img.url,
          url: img.url,
          preview: img.url,
        })) || [],
      deletedImages: [],
    });
    setIsEditDialogOpen(true);
  };

  const filteredCars = cars.filter(
    (car) =>
      (car.name &&
        car.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (car.brand &&
        car.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (car.licensePlate &&
        car.licensePlate.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <PageHeader
        title={t("manageCars.title")}
        description={t("manageCars.description")}
        actions={
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                {t("manageCars.addNewCar")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className={isRTL ? "text-right" : "text-left"}>
                  {t("manageCars.addNewCarTitle")}
                </DialogTitle>
                <DialogDescription
                  className={isRTL ? "text-right" : "text-left"}
                >
                  {t("manageCars.addNewCarDescription")}
                </DialogDescription>
              </DialogHeader>
              <CarForm formData={formData} setFormData={setFormData} />
              <DialogFooter
                className={isRTL ? "flex-row-reverse sm:flex-row-reverse" : ""}
              >
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  {t("manageCars.common.cancel")}
                </Button>
                <Button
                  onClick={handleAddCar}
                  className={isRTL ? "mr-2 sm:mr-0 sm:ml-2" : ""}
                >
                  {t("manageCars.addCar")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <CarFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      <CarTable
        cars={filteredCars}
        loading={loading}
        pagination={pagination}
        searchQuery={searchQuery}
        onEdit={openEditDialog}
        onView={(id) => navigate(`/cars/${id}`)}
        onToggleAvailability={handleToggleAvailability}
        onDelete={deleteCar}
        onPageChange={(page) => fetchCars(page)}
        onAddCar={() => setIsAddDialogOpen(true)}
      />

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className={isRTL ? "text-right" : "text-left"}>
              {t("manageCars.editCarTitle")}
            </DialogTitle>
            <DialogDescription className={isRTL ? "text-right" : "text-left"}>
              {t("manageCars.editCarDescription")}
            </DialogDescription>
          </DialogHeader>
          <CarForm formData={formData} setFormData={setFormData} />
          <DialogFooter
            className={isRTL ? "flex-row-reverse sm:flex-row-reverse" : ""}
          >
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              {t("manageCars.common.cancel")}
            </Button>
            <Button
              onClick={handleEditCar}
              className={isRTL ? "mr-2 sm:mr-0 sm:ml-2" : ""}
            >
              {t("manageCars.saveChanges")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default ManageCarsPage;
