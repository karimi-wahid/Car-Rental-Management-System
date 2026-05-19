import { create } from "zustand";
import {
  createContactService,
  getAllContactsService,
  getContactByIdService,
  replyToContactService,
  updateContactStatusService,
  markAsSpamService,
  deleteContactService,
  buildContactQuery,
} from "@/services/contactService";

const useContactStore = create((set) => ({
  // ── State ──────────────────────────────────────
  contacts: [],
  selectedContact: null,
  summary: { unread: 0, read: 0, replied: 0, closed: 0 },

  loading: false,
  submitting: false,
  error: null,

  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  },

  // ── PUBLIC ─────────────────────────────────────

  createContact: async (data) => {
    set({ submitting: true, error: null });
    try {
      const res = await createContactService(data);
      set({ submitting: false });
      return {
        success: true,
        message: res.data.message,
        data: res.data.data.contact,
      };
    } catch (err) {
      const error = err.response?.data?.message || "Failed to send message";
      set({ submitting: false, error });
      return { success: false, error };
    }
  },

  // ── ADMIN ──────────────────────────────────────

  fetchAllContacts: async (page = 1, limit = 20, filters = {}) => {
    set({ loading: true, error: null });
    try {
      const query = buildContactQuery({ page, limit, ...filters });
      const res = await getAllContactsService(query);
      const { contacts, summary, pagination } = res.data.data;

      set({ contacts, summary, pagination, loading: false });
      return res.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to load contacts",
        loading: false,
      });
      throw err;
    }
  },

  fetchContactById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await getContactByIdService(id);
      const contact = res.data.data.contact;

      // Auto-update local summary when opened (unread → read)
      set((state) => ({
        selectedContact: contact,
        loading: false,
        contacts: state.contacts.map((c) =>
          c._id === id && c.status === "unread" ? { ...c, status: "read" } : c,
        ),
        summary: {
          ...state.summary,
          unread:
            contact.status === "unread"
              ? Math.max(0, state.summary.unread - 1)
              : state.summary.unread,
          read:
            contact.status === "unread"
              ? state.summary.read + 1
              : state.summary.read,
        },
      }));

      return res.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to load contact",
        loading: false,
      });
      throw err;
    }
  },

  replyToContact: async (id, reply) => {
    set({ submitting: true, error: null });
    try {
      const res = await replyToContactService(id, reply);
      const updated = res.data.data.contact;

      set((state) => ({
        contacts: state.contacts.map((c) => (c._id === id ? updated : c)),
        selectedContact: updated,
        submitting: false,
        summary: {
          ...state.summary,
          read: Math.max(0, state.summary.read - 1),
          replied: state.summary.replied + 1,
        },
      }));

      return { success: true };
    } catch (err) {
      const error = err.response?.data?.message || "Failed to send reply";
      set({ submitting: false, error });
      return { success: false, error };
    }
  },

  updateStatus: async (id, status) => {
    set({ loading: true, error: null });
    try {
      const res = await updateContactStatusService(id, status);
      const updated = res.data.data.contact;

      set((state) => ({
        contacts: state.contacts.map((c) => (c._id === id ? updated : c)),
        selectedContact:
          state.selectedContact?._id === id ? updated : state.selectedContact,
        loading: false,
      }));

      return { success: true };
    } catch (err) {
      const error = err.response?.data?.message || "Failed to update status";
      set({ loading: false, error });
      return { success: false, error };
    }
  },

  markAsSpam: async (id) => {
    set({ loading: true, error: null });
    try {
      await markAsSpamService(id);

      set((state) => ({
        contacts: state.contacts.filter((c) => c._id !== id),
        selectedContact:
          state.selectedContact?._id === id ? null : state.selectedContact,
        loading: false,
      }));

      return { success: true };
    } catch (err) {
      const error = err.response?.data?.message || "Failed to mark as spam";
      set({ loading: false, error });
      return { success: false, error };
    }
  },

  deleteContact: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteContactService(id);

      set((state) => ({
        contacts: state.contacts.filter((c) => c._id !== id),
        selectedContact:
          state.selectedContact?._id === id ? null : state.selectedContact,
        loading: false,
      }));

      return { success: true };
    } catch (err) {
      const error = err.response?.data?.message || "Failed to delete contact";
      set({ loading: false, error });
      return { success: false, error };
    }
  },

  // ── UTILS ──────────────────────────────────────
  setSelectedContact: (contact) => set({ selectedContact: contact }),
  clearError: () => set({ error: null }),
}));

export default useContactStore;
