import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "motion/react";
import {
  User,
  Camera,
  Lock,
  Save,
  Loader2,
  Bell,
  Moon,
  Globe,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { getInitials, cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { useThemeStore } from "@/store/themeStore";
import useUserStore from "@/store/userStore";
import { useAuthStore } from "@/store/authStore";
import { useTranslation } from "react-i18next";

import axios from "axios";

/* -------------------------------------------------------------------------- */
/*                                  ZOD SCHEMA                                */
/* -------------------------------------------------------------------------- */

const profileSchema = (t) =>
  z.object({
    name: z
      .string()
      .min(2, t("validation.nameMin"))
      .max(50, t("validation.nameMax")),

    email: z.string().email(t("validation.emailInvalid")),

    phone: z
      .string()
      .optional()
      .refine((value) => {
        if (!value) return true;
        return /^(\+93|0)?7\d{8}$/.test(value);
      }, t("validation.phoneInvalid")),
  });

const passwordSchema = (t) =>
  z
    .object({
      currentPassword: z
        .string()
        .min(1, t("validation.currentPasswordRequired")),

      newPassword: z
        .string()
        .min(8, t("validation.passwordMin"))
        .regex(/[a-z]/, t("validation.passwordLowercase"))
        .regex(/[A-Z]/, t("validation.passwordUppercase"))
        .regex(/[0-9]/, t("validation.passwordNumber"))
        .regex(/[@$!%*?&#]/, t("validation.passwordSpecial")),

      confirmPassword: z
        .string()
        .min(1, t("validation.confirmPasswordRequired")),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("validation.passwordMismatch"),
      path: ["confirmPassword"],
    });

/* -------------------------------------------------------------------------- */
/*                              PASSWORD STRENGTH                             */
/* -------------------------------------------------------------------------- */

const calculatePasswordStrength = (password) => {
  let strength = 0;
  if (password.length >= 8) strength += 20;
  if (/[a-z]/.test(password)) strength += 20;
  if (/[A-Z]/.test(password)) strength += 20;
  if (/[0-9]/.test(password)) strength += 20;
  if (/[@$!%*?&#]/.test(password)) strength += 20;
  return strength;
};

const ProfilePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { theme, toggleTheme } = useThemeStore();
  const { user, updateMe, getMe, loading: storeLoading } = useUserStore();
  const { updatePassword } = useAuthStore();
  const navigate = useNavigate();
  const { deleteMe } = useUserStore();
  const logout = useAuthStore((state) => state.logout);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language !== "en";

  const getStrengthText = (strength) => {
    if (strength < 50) return t("profile.weak");
    if (strength < 75) return t("profile.medium");
    return t("profile.strong");
  };

  /* -------------------------------------------------------------------------- */
  /*                               PROFILE FORM                                 */
  /* -------------------------------------------------------------------------- */

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: zodResolver(profileSchema(t)),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  /* -------------------------------------------------------------------------- */
  /*                              PASSWORD FORM                                 */
  /* -------------------------------------------------------------------------- */

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    watch,
    formState: { errors: passwordErrors },
  } = useForm({
    resolver: zodResolver(passwordSchema(t)),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword", "");
  const passwordStrength = calculatePasswordStrength(newPassword);

  /* -------------------------------------------------------------------------- */
  /*                                  EFFECTS                                   */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    const fetchUser = async () => {
      try {
        await getMe();
      } catch (error) {
        toast.error(t("profile.loadError"));
      }
    };
    if (!user) fetchUser();
  }, [getMe, user, t]);

  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user, resetProfile]);

  /* -------------------------------------------------------------------------- */
  /*                               PROFILE SUBMIT                               */
  /* -------------------------------------------------------------------------- */

  const onProfileSubmit = async (data) => {
    setIsLoading(true);
    try {
      await updateMe({ name: data.name, email: data.email });
      toast.success(t("profile.updateSuccess"));
    } catch (error) {
      toast.error(error.response?.data?.message || t("profile.updateError"));
    } finally {
      setIsLoading(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                              PASSWORD SUBMIT                               */
  /* -------------------------------------------------------------------------- */

  const onPasswordSubmit = async (data) => {
    setIsPasswordLoading(true);
    try {
      await updatePassword(
        data.currentPassword,
        data.newPassword,
        data.confirmPassword,
      );
      toast.success(t("profile.passwordChangeSuccess"));
      resetPassword();
    } catch (error) {
      toast.error(
        error.response?.data?.message || t("profile.passwordChangeError"),
      );
    } finally {
      setIsPasswordLoading(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                               AVATAR UPLOAD                                */
  /* -------------------------------------------------------------------------- */

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/users/update-avatar`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      toast.success(t("profile.avatarUpdateSuccess"));
    } catch (error) {
      toast.error(
        error.response?.data?.message || t("profile.avatarUpdateError"),
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                               Delete Account                                */
  /* -------------------------------------------------------------------------- */

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await deleteMe();
      await logout();
      toast.success(t("profile.accountDeleteSuccess"));
      navigate("/");
    } catch (error) {
      toast.error(
        error.response?.data?.message || t("profile.accountDeleteError"),
      );
    } finally {
      setDeletingAccount(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                               Language Change                              */
  /* -------------------------------------------------------------------------- */

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
    document.documentElement.dir = lang === "en" ? "ltr" : "rtl";
    document.documentElement.lang = lang;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* HEADER */}
      <div className="mb-8">
        <h1
          className={`text-3xl font-bold mb-2 ${isRTL ? "text-right" : "text-left"}`}
        >
          {t("profile.title")}
        </h1>
        <p
          className={`text-muted-foreground ${isRTL ? "text-right" : "text-left"}`}
        >
          {t("profile.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* SIDEBAR */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="relative mb-4 group">
                <Avatar className="w-24 h-24 mx-auto ring-4 ring-primary/20">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(user?.name || t("profile.user"))}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
              <h2 className="text-xl font-semibold mb-1">{user?.name}</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {user?.email}
              </p>
              <Badge variant="outline">
                {user?.role === "admin"
                  ? t("profile.admin")
                  : t("profile.member")}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* CONTENT */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="profile" dir={isRTL ? "rtl" : "ltr"}>
            <TabsList
              className={`grid grid-cols-3 mb-8 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <TabsTrigger value="profile">
                <User className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                {t("profile.profile")}
              </TabsTrigger>
              <TabsTrigger value="security">
                <Lock className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                {t("profile.security")}
              </TabsTrigger>
              <TabsTrigger value="preferences">
                <Bell className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                {t("profile.preferences")}
              </TabsTrigger>
            </TabsList>

            {/* PROFILE */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className={isRTL ? "text-right" : "text-left"}>
                    {t("profile.personalInfo")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={handleProfileSubmit(onProfileSubmit)}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className={
                          isRTL ? "text-right block" : "text-left block"
                        }
                      >
                        {t("profile.fullName")}
                      </Label>
                      <Input
                        id="name"
                        {...registerProfile("name")}
                        disabled={storeLoading}
                      />
                      {profileErrors.name && (
                        <p className="text-sm text-destructive">
                          {profileErrors.name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className={
                          isRTL ? "text-right block" : "text-left block"
                        }
                      >
                        {t("profile.email")}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        {...registerProfile("email")}
                        disabled={storeLoading}
                      />
                      {profileErrors.email && (
                        <p className="text-sm text-destructive">
                          {profileErrors.email.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="phone"
                        className={
                          isRTL ? "text-right block" : "text-left block"
                        }
                      >
                        {t("profile.phone")}
                      </Label>
                      <Input
                        id="phone"
                        placeholder="+93 700 000 000"
                        {...registerProfile("phone")}
                        disabled={storeLoading}
                      />
                      {profileErrors.phone && (
                        <p className="text-sm text-destructive">
                          {profileErrors.phone.message}
                        </p>
                      )}
                    </div>
                    <Separator />
                    <Button type="submit" disabled={isLoading || storeLoading}>
                      {isLoading ? (
                        <>
                          <Loader2
                            className={`ml-2 h-4 w-4 animate-spin ${isRTL ? "ml-2" : "mr-2"}`}
                          />
                          {t("profile.saving")}
                        </>
                      ) : (
                        <>
                          <Save
                            className={`ml-2 h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`}
                          />
                          {t("profile.saveChanges")}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SECURITY */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className={isRTL ? "text-right" : "text-left"}>
                    {t("profile.changePassword")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={handlePasswordSubmit(onPasswordSubmit)}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <Label
                        htmlFor="currentPassword"
                        className={
                          isRTL ? "text-right block" : "text-left block"
                        }
                      >
                        {t("profile.currentPassword")}
                      </Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          {...registerPassword("currentPassword")}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 -translate-y-1/2`}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.currentPassword && (
                        <p className="text-sm text-destructive">
                          {passwordErrors.currentPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="newPassword"
                        className={
                          isRTL ? "text-right block" : "text-left block"
                        }
                      >
                        {t("profile.newPassword")}
                      </Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          {...registerPassword("newPassword")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 -translate-y-1/2`}
                        >
                          {showNewPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.newPassword && (
                        <p className="text-sm text-destructive">
                          {passwordErrors.newPassword.message}
                        </p>
                      )}
                      {newPassword && (
                        <div className="space-y-2 mt-3">
                          <div
                            className={`flex justify-between text-sm ${isRTL ? "flex-row-reverse" : ""}`}
                          >
                            <span>{t("profile.passwordStrength")}</span>
                            <span
                              className={cn(
                                passwordStrength < 50 && "text-destructive",
                                passwordStrength >= 50 &&
                                  passwordStrength < 75 &&
                                  "text-yellow-500",
                                passwordStrength >= 75 && "text-green-500",
                              )}
                            >
                              {getStrengthText(passwordStrength)}
                            </span>
                          </div>
                          <Progress value={passwordStrength} />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="confirmPassword"
                        className={
                          isRTL ? "text-right block" : "text-left block"
                        }
                      >
                        {t("profile.confirmPassword")}
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          {...registerPassword("confirmPassword")}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 -translate-y-1/2`}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.confirmPassword && (
                        <p className="text-sm text-destructive">
                          {passwordErrors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <Separator />
                    <Button type="submit" disabled={isPasswordLoading}>
                      {isPasswordLoading ? (
                        <>
                          <Loader2
                            className={`ml-2 h-4 w-4 animate-spin ${isRTL ? "ml-2" : "mr-2"}`}
                          />
                          {t("profile.updating")}
                        </>
                      ) : (
                        t("profile.updatePassword")
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* PREFERENCES */}
            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle className={isRTL ? "text-right" : "text-left"}>
                    {t("profile.displaySettings")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className={`flex items-center justify-between ${isRTL ? "flex-row" : "flex-row"}`}
                  >
                    <div className={isRTL ? "text-right" : "text-left"}>
                      <p className="font-medium">{t("profile.darkMode")}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("profile.darkModeDescription")}
                      </p>
                    </div>
                    <Switch
                      checked={theme === "dark"}
                      onCheckedChange={toggleTheme}
                    />
                  </div>
                  <Separator />
                  <div
                    className={`flex items-center justify-between ${isRTL ? "flex-row" : "flex-row"}`}
                  >
                    <div className={isRTL ? "text-right" : "text-left"}>
                      <p className="font-medium">{t("profile.language")}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("profile.languageDescription")}
                      </p>
                    </div>
                    <Select
                      defaultValue={i18n.language}
                      onValueChange={handleLanguageChange}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fa">
                          {t("profile.persian")}
                        </SelectItem>
                        <SelectItem value="ps">
                          {t("profile.pashto")}
                        </SelectItem>
                        <SelectItem value="en">
                          {t("profile.english")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div
                    className={`flex items-center justify-between ${isRTL ? "flex-row" : "flex-row"}`}
                  >
                    <div className={isRTL ? "text-right" : "text-left"}>
                      <p className="font-medium text-destructive">
                        {t("profile.deleteAccount")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("profile.deleteAccountDescription")}
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="border-destructive text-destructive hover:bg-destructive hover:text-white transition-colors shrink-0"
                          disabled={deletingAccount}
                        >
                          <Trash2
                            className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`}
                          />
                          {t("profile.deleteAccount")}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent dir={isRTL ? "rtl" : "ltr"}>
                        <AlertDialogHeader>
                          <AlertDialogTitle
                            className={
                              isRTL
                                ? "text-right text-destructive"
                                : "text-left text-destructive"
                            }
                          >
                            {t("profile.deleteConfirmTitle")}
                          </AlertDialogTitle>
                          <AlertDialogDescription
                            className={
                              isRTL
                                ? "text-right space-y-2"
                                : "text-left space-y-2"
                            }
                          >
                            <span className="block">
                              {t("profile.deleteConfirmDescription")}
                            </span>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              <li>{t("profile.deleteWarning1")}</li>
                              <li>{t("profile.deleteWarning2")}</li>
                              <li>{t("profile.deleteWarning3")}</li>
                            </ul>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter
                          className={isRTL ? "flex-row-reverse gap-2" : ""}
                        >
                          <AlertDialogCancel>
                            {t("profile.cancel")}
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAccount}
                            disabled={deletingAccount}
                            className="bg-destructive hover:bg-destructive/90 text-white"
                          >
                            {deletingAccount ? (
                              <>
                                <Loader2
                                  className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"} animate-spin`}
                                />
                                {t("profile.deleting")}
                              </>
                            ) : (
                              t("profile.confirmDelete")
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
