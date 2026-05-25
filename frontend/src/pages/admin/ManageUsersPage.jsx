import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Search,
  Filter,
  MoreVertical,
  Shield,
  UserCog,
  Ban,
  CheckCircle,
  XCircle,
  Calendar,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { PageHeader } from "@/components/common/PageHeader";
import { Pagination } from "@/components/ui/pagination";

import { formatDate, getInitials } from "@/lib/utils";
import { toast } from "react-hot-toast";

import useUserStore from "@/store/userStore";
import { useTranslation } from "react-i18next";

const ManageUsersPage = () => {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] =
    useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const isRTL = i18n.language !== "en";

  const {
    users,
    loading,
    pagination,
    getAllUsers,
    updateUserRole,
    updateUserVerification,
  } = useUserStore();

  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  const getRoleLabel = (role) => {
    return role === "admin" ? t("manageUsers.admin") : t("manageUsers.user");
  };

  const getVerificationLabel = (isVerified) => {
    return isVerified ? t("manageUsers.verified") : t("manageUsers.unverified");
  };

  // Role change handler
  const handleRoleChange = async () => {
    if (!selectedUser) return;

    const newRole = selectedUser.role === "user" ? "admin" : "user";

    if (selectedUser.role === newRole) return;

    try {
      const res = await updateUserRole(selectedUser._id, newRole);
      const updatedUser = res.data.user || res.data.data?.user;
      setSelectedUser(updatedUser);

      toast.success(
        newRole === "admin"
          ? t("manageUsers.roleChangeToAdminSuccess")
          : t("manageUsers.roleChangeToUserSuccess"),
      );

      setIsRoleDialogOpen(false);
    } catch (error) {
      toast.error(t("manageUsers.roleChangeError"));
      console.log(error);
    }
  };

  // Verification change handler
  const handleVerificationChange = async () => {
    if (!selectedUser) return;

    const newStatus = !selectedUser.isEmailVerified;

    try {
      const res = await updateUserVerification(selectedUser._id, newStatus);
      const updatedUser = res.data.user || res.data.data?.user;
      setSelectedUser(updatedUser);

      toast.success(
        newStatus
          ? t("manageUsers.verificationSuccess")
          : t("manageUsers.unverificationSuccess"),
      );

      setIsVerificationDialogOpen(false);
    } catch (error) {
      toast.error(t("manageUsers.verificationError"));
      console.log(error);
    }
  };

  // Client-side filtering
  const filteredUsers = users
    .filter(
      (u) =>
        (u?.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u?.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())),
    )
    .filter((u) => (roleFilter === "all" ? true : u.role === roleFilter))
    .filter((u) => {
      if (verificationFilter === "all") return true;
      if (verificationFilter === "verified") return u.isEmailVerified;
      if (verificationFilter === "unverified") return !u.isEmailVerified;
      return true;
    });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <PageHeader
        title={t("manageUsers.title")}
        description={t("manageUsers.description")}
      />

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div
            className={`flex flex-col sm:flex-row gap-4 ${isRTL ? "sm:flex-row-reverse" : ""}`}
          >
            <div className="relative flex-1 min-w-50">
              <Search
                className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4`}
              />
              <Input
                placeholder={t("manageUsers.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${isRTL ? "pr-9 text-right" : "pl-9 text-left"}`}
              />
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-37.5">
                <Filter className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                <SelectValue placeholder={t("manageUsers.role")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="all"
                  className={isRTL ? "text-right" : "text-left"}
                >
                  {t("manageUsers.all")}
                </SelectItem>
                <SelectItem
                  value="user"
                  className={isRTL ? "text-right" : "text-left"}
                >
                  {t("manageUsers.user")}
                </SelectItem>
                <SelectItem
                  value="admin"
                  className={isRTL ? "text-right" : "text-left"}
                >
                  {t("manageUsers.admin")}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={verificationFilter}
              onValueChange={setVerificationFilter}
            >
              <SelectTrigger className="w-37.5">
                <SelectValue
                  placeholder={t("manageUsers.verificationStatus")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="all"
                  className={isRTL ? "text-right" : "text-left"}
                >
                  {t("manageUsers.all")}
                </SelectItem>
                <SelectItem
                  value="verified"
                  className={isRTL ? "text-right" : "text-left"}
                >
                  {t("manageUsers.verified")}
                </SelectItem>
                <SelectItem
                  value="unverified"
                  className={isRTL ? "text-right" : "text-left"}
                >
                  {t("manageUsers.unverified")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent>
          {loading ? (
            <div className="text-center py-10">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">
                {t("manageUsers.loading")}
              </p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">
                {t("manageUsers.noUsersFound")}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className={isRTL ? "text-right" : "text-left"}>
                        {t("manageUsers.user")}
                      </TableHead>
                      <TableHead className={isRTL ? "text-right" : "text-left"}>
                        {t("manageUsers.role")}
                      </TableHead>
                      <TableHead className={isRTL ? "text-right" : "text-left"}>
                        {t("manageUsers.status")}
                      </TableHead>
                      <TableHead className={isRTL ? "text-right" : "text-left"}>
                        {t("manageUsers.joinDate")}
                      </TableHead>
                      <TableHead className={isRTL ? "text-left" : "text-right"}>
                        {t("manageUsers.actions")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>
                          <div
                            className={`flex gap-3 items-center ${isRTL ? "flex-row-reverse" : ""}`}
                          >
                            <Avatar>
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className={isRTL ? "text-right" : "text-left"}>
                                {user.name}
                              </p>
                              <p
                                className={`text-sm text-muted-foreground ${isRTL ? "text-right" : "text-left"}`}
                                dir="ltr"
                              >
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge>{getRoleLabel(user.role)}</Badge>
                        </TableCell>

                        <TableCell>
                          <div
                            className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
                          >
                            {user.isEmailVerified ? (
                              <>
                                <CheckCircle className="text-green-500 w-4 h-4" />
                                <span className="text-sm">
                                  {t("manageUsers.verified")}
                                </span>
                              </>
                            ) : (
                              <>
                                <XCircle className="text-yellow-500 w-4 h-4" />
                                <span className="text-sm">
                                  {t("manageUsers.unverified")}
                                </span>
                              </>
                            )}
                          </div>
                        </TableCell>

                        <TableCell
                          className={isRTL ? "text-right" : "text-left"}
                        >
                          {formatDate(user.createdAt)}
                        </TableCell>

                        <TableCell
                          className={isRTL ? "text-left" : "text-right"}
                        >
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                              align={isRTL ? "end" : "start"}
                            >
                              <DropdownMenuLabel
                                className={isRTL ? "text-right" : "text-left"}
                              >
                                {t("manageUsers.actions")}
                              </DropdownMenuLabel>

                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsRoleDialogOpen(true);
                                }}
                                className={isRTL ? "flex-row-reverse" : ""}
                              >
                                <UserCog
                                  className={`${isRTL ? "ml-2" : "mr-2"} w-4 h-4`}
                                />
                                {t("manageUsers.changeRole")}
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsVerificationDialogOpen(true);
                                }}
                                className={isRTL ? "flex-row-reverse" : ""}
                              >
                                <Shield
                                  className={`${isRTL ? "ml-2" : "mr-2"} w-4 h-4`}
                                />
                                {t("manageUsers.changeVerification")}
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                className={`text-red-500 ${isRTL ? "flex-row-reverse" : ""}`}
                                onClick={() => {
                                  // Handle suspend action
                                }}
                              >
                                <Ban
                                  className={`${isRTL ? "ml-2" : "mr-2"} w-4 h-4`}
                                />
                                {t("manageUsers.suspend")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="mt-4 pt-4 border-t">
                  <Pagination
                    currentPage={pagination.page || 1}
                    totalPages={pagination.pages || 1}
                    onPageChange={(page) => getAllUsers({ page })}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Role Change Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={isRTL ? "text-right" : "text-left"}>
              {t("manageUsers.changeRoleTitle")}
            </DialogTitle>
            <DialogDescription className={isRTL ? "text-right" : "text-left"}>
              {t("manageUsers.changeRoleDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <p className={isRTL ? "text-right" : "text-left"}>
              {t("manageUsers.userLabel")}:{" "}
              <span className="font-medium">{selectedUser?.name}</span>
            </p>
            <p
              className={`text-muted-foreground ${isRTL ? "text-right" : "text-left"}`}
              dir="ltr"
            >
              {selectedUser?.email}
            </p>
            <p className={isRTL ? "text-right" : "text-left"}>
              {t("manageUsers.currentRole")}:{" "}
              <Badge>{getRoleLabel(selectedUser?.role)}</Badge>
            </p>
            <p className={isRTL ? "text-right" : "text-left"}>
              {t("manageUsers.newRole")}:{" "}
              <Badge variant="outline">
                {selectedUser?.role === "user"
                  ? t("manageUsers.admin")
                  : t("manageUsers.user")}
              </Badge>
            </p>
          </div>

          <DialogFooter
            className={isRTL ? "flex-row-reverse sm:flex-row-reverse" : ""}
          >
            <Button
              variant="outline"
              onClick={() => setIsRoleDialogOpen(false)}
            >
              {t("manageUsers.common.cancel")}
            </Button>
            <Button
              onClick={handleRoleChange}
              className={isRTL ? "mr-2 sm:mr-0 sm:ml-2" : ""}
            >
              {t("manageUsers.common.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verification Change Dialog */}
      <Dialog
        open={isVerificationDialogOpen}
        onOpenChange={setIsVerificationDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={isRTL ? "text-right" : "text-left"}>
              {t("manageUsers.changeVerificationTitle")}
            </DialogTitle>
            <DialogDescription className={isRTL ? "text-right" : "text-left"}>
              {t("manageUsers.changeVerificationDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <p className={isRTL ? "text-right" : "text-left"}>
              {t("manageUsers.userLabel")}:{" "}
              <span className="font-medium">{selectedUser?.name}</span>
            </p>
            <p
              className={`text-muted-foreground ${isRTL ? "text-right" : "text-left"}`}
              dir="ltr"
            >
              {selectedUser?.email}
            </p>
            <p className={isRTL ? "text-right" : "text-left"}>
              {t("manageUsers.currentStatus")}:{" "}
              <Badge>
                {getVerificationLabel(selectedUser?.isEmailVerified)}
              </Badge>
            </p>
            <p className={isRTL ? "text-right" : "text-left"}>
              {t("manageUsers.newStatus")}:{" "}
              <Badge variant="outline">
                {selectedUser?.isEmailVerified
                  ? t("manageUsers.unverified")
                  : t("manageUsers.verified")}
              </Badge>
            </p>
          </div>

          <DialogFooter
            className={isRTL ? "flex-row-reverse sm:flex-row-reverse" : ""}
          >
            <Button
              variant="outline"
              onClick={() => setIsVerificationDialogOpen(false)}
            >
              {t("manageUsers.common.cancel")}
            </Button>
            <Button
              onClick={handleVerificationChange}
              className={isRTL ? "mr-2 sm:mr-0 sm:ml-2" : ""}
            >
              {t("manageUsers.common.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default ManageUsersPage;
