import { useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";

const ImageUploader = ({ formData, setFormData }) => {
  const { t, i18n } = useTranslation();
  const [dragActive, setDragActive] = useState(false);
  const [imageUrls, setImageUrls] = useState("");
  const [uploadMethod, setUploadMethod] = useState("file");
  const isRTL = i18n.language !== "en";

  const handleFileChange = (files) => {
    const newFiles = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Date.now() + Math.random(),
    }));

    setFormData((prev) => ({
      ...prev,
      imageFiles: [...(prev.imageFiles || []), ...newFiles],
    }));
  };

  const removeImageFile = (id) => {
    setFormData((prev) => ({
      ...prev,
      imageFiles: prev.imageFiles.filter((item) => item.id !== id),
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  const handleUrlChange = (e) => {
    const urls = e.target.value;
    setImageUrls(urls);
    const urlArray = urls.split("\n").filter((url) => url.trim());
    setFormData((prev) => ({ ...prev, images: urlArray }));
  };

  const removeImageUrl = (index) => {
    const newUrls = [...formData.images];
    newUrls.splice(index, 1);
    setFormData((prev) => ({ ...prev, images: newUrls }));
    setImageUrls(newUrls.join("\n"));
  };

  return (
    <div className="space-y-3">
      <Label className={isRTL ? "text-right block" : "text-left block"}>
        {t("imageUploader.carImages")}
      </Label>

      <div className={`flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
        <Button
          type="button"
          variant={uploadMethod === "file" ? "default" : "outline"}
          size="sm"
          onClick={() => setUploadMethod("file")}
        >
          {t("imageUploader.uploadFile")}
        </Button>
        <Button
          type="button"
          variant={uploadMethod === "url" ? "default" : "outline"}
          size="sm"
          onClick={() => setUploadMethod("url")}
        >
          {t("imageUploader.imageUrl")}
        </Button>
      </div>

      {uploadMethod === "file" ? (
        <>
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 transition ${
              dragActive ? "border-primary bg-primary/10" : "border-muted"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => handleFileChange(e.target.files)}
              aria-label={t("imageUploader.selectImages")}
            />

            {formData.existingImages?.length > 0 && (
              <div className="space-y-2 mb-4">
                <Label className="text-sm text-muted-foreground">
                  {t("imageUploader.currentImages")}
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {formData.existingImages.map((item) => (
                    <div
                      key={item.id}
                      className="relative rounded-lg overflow-hidden border group"
                    >
                      <img
                        src={item.preview}
                        alt={t("imageUploader.carImageAlt")}
                        className="w-full h-32 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            existingImages: prev.existingImages.filter(
                              (i) => i.id !== item.id,
                            ),
                            deletedImages: [
                              ...(prev.deletedImages || []),
                              item.id,
                            ],
                          }));
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label={t("imageUploader.removeImage")}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground text-center">
                {t("imageUploader.dragDropText")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("imageUploader.supportedFormats")}
              </p>
            </div>
          </div>

          {formData.imageFiles?.length > 0 && (
            <div className="space-y-2 mt-4">
              <Label className="text-sm text-muted-foreground">
                {t("imageUploader.newImages")}
              </Label>
              <div className="grid grid-cols-3 gap-3">
                {formData.imageFiles.map((item) => (
                  <div
                    key={item.id}
                    className="relative rounded-lg overflow-hidden border group"
                  >
                    <img
                      src={item.preview}
                      alt={t("imageUploader.previewAlt")}
                      className="w-full h-32 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImageFile(item.id)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label={t("imageUploader.removeImage")}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <Textarea
            id="images"
            placeholder={t("imageUploader.urlPlaceholder")}
            value={imageUrls}
            onChange={handleUrlChange}
            rows={3}
            className={isRTL ? "text-right" : "text-left"}
          />

          {formData.images?.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                {t("imageUploader.imageUrls")}
              </Label>
              <div className="space-y-2">
                {formData.images.map((url, index) => (
                  <Card key={index} className="p-3">
                    <div
                      className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}
                    >
                      <div
                        className={`flex items-center gap-2 flex-1 min-w-0 ${isRTL ? "flex-row-reverse" : ""}`}
                      >
                        <div className="h-8 w-8 rounded bg-muted flex items-center justify-center shrink-0">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="text-sm truncate" dir="ltr">
                          {url}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => removeImageUrl(index)}
                        aria-label={t("imageUploader.removeUrl")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ImageUploader;
