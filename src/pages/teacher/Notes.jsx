import React, { useState, useEffect, useContext } from "react";
import {
  FiPlus,
  FiTrash2,
  FiEdit,
  FiFileText,
  FiDownload,
  FiSearch,
  FiEye,
} from "react-icons/fi";
import DashboardLayout from "../../components/common/DashboardLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import PendingBanner from "../../components/common/PendingBanner";
import SearchBar from "../../components/common/SearchBar";
import EmptyState from "../../components/common/EmptyState";
import { noteService } from "../../services/noteService";
import { ToastContext } from "../../context/ToastContext";
import { formatDate, timeAgo } from "../../utils/formatters";
import { downloadNotePDF } from "../../utils/downloadHelper";

const emptyForm = { title: "", content: "", course: "", category: "Lecture" };
const CATEGORIES = [
  "Lecture",
  "Summary",
  "Reference",
  "Exercise",
  "Announcement",
];

export default function Notes() {
  const { addToast } = useContext(ToastContext);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const data = await noteService.getAll({ search });
      setNotes(data.notes || []);
    } catch {
      addToast("Failed to load notes", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [search]);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.content.trim()) errs.content = "Content is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await noteService.create(form);
      addToast("Note published to all students!", "success");
      setCreateModal(false);
      setForm(emptyForm);
      fetchNotes();
    } catch {
      addToast("Failed to create note", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await noteService.update(selected.id, form);
      addToast("Note updated!", "success");
      setEditModal(false);
      fetchNotes();
    } catch {
      addToast("Failed to update note", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await noteService.delete(selected.id);
      addToast("Note deleted", "success");
      setDeleteModal(false);
      fetchNotes();
    } catch {
      addToast("Failed to delete note", "error");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (n) => {
    setSelected(n);
    setForm({
      title: n.title,
      content: n.content,
      subject: n.subject || "",
      category: n.category || "Lecture",
    });
    setErrors({});
    setEditModal(true);
  };

  const handleDownload = (note) => {
    downloadNotePDF(note);
    addToast("Note downloaded as PDF!", "success");
  };

  const categoryColors = {
    Lecture: { bg: "var(--primary-ghost)", color: "var(--primary)" },
    Summary: { bg: "var(--secondary-ghost)", color: "var(--secondary)" },
    Reference: { bg: "var(--info-bg)", color: "var(--info)" },
    Exercise: { bg: "var(--warning-bg)", color: "var(--warning)" },
    Announcement: { bg: "var(--danger-bg)", color: "var(--danger)" },
  };

  return (
    <DashboardLayout>
      <PendingBanner />
      <div className="page-header">
        <div>
          <h1 className="page-title">Notes & Resources</h1>
          <p className="page-subtitle">
            {notes.length} notes shared with students
          </p>
        </div>
        <Button
          variant="primary"
          icon={<FiPlus size={16} />}
          onClick={() => {
            setForm(emptyForm);
            setErrors({});
            setCreateModal(true);
          }}
        >
          New Note
        </Button>
      </div>

      {/* Search */}
      <Card style={{ marginBottom: "1.5rem" }}>
        <div style={{ padding: "0.25rem" }}>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search notes by title or subject..."
            style={{ maxWidth: 400 }}
          />
        </div>
      </Card>

      {/* Loading */}
      {loading && (
        <div
          style={{
            textAlign: "center",
            padding: "4rem",
            color: "var(--text-muted)",
          }}
        >
          Loading...
        </div>
      )}

      {/* Empty */}
      {!loading && notes.length === 0 && (
        <Card>
          <EmptyState
            message="No notes yet. Create your first note to share with students!"
            icon={FiFileText}
            action={
              <Button
                variant="primary"
                icon={<FiPlus size={14} />}
                onClick={() => {
                  setForm(emptyForm);
                  setCreateModal(true);
                }}
              >
                Create Note
              </Button>
            }
          />
        </Card>
      )}

      {/* Notes Grid */}
      {!loading && notes.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {notes.map((note) => {
            const cat = categoryColors[note.category] || categoryColors.Lecture;
            return (
              <div
                key={note.id}
                style={{
                  background: "var(--white)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)",
                  padding: "1.5rem",
                  boxShadow: "var(--shadow-sm)",
                  transition: "var(--transition-slow)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  borderLeft: `4px solid ${cat.color}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "var(--shadow-md)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "0.5rem",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        background: cat.bg,
                        color: cat.color,
                        padding: "0.15rem 0.5rem",
                        borderRadius: "var(--radius-full)",
                        display: "inline-block",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {note.category || "Lecture"}
                    </span>
                    <p
                      style={{
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        color: "var(--primary)",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {note.title}
                    </p>
                    {note.subject && (
                      <p
                        style={{
                          fontSize: "0.78rem",
                          color: "var(--secondary)",
                          fontWeight: 600,
                          marginTop: "0.2rem",
                        }}
                      >
                        {note.subject}
                      </p>
                    )}
                  </div>
                </div>

                {/* Preview */}
                <p
                  style={{
                    fontSize: "0.83rem",
                    color: "var(--text-muted)",
                    lineHeight: 1.65,
                    display: "-webkit-box",
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    flex: 1,
                  }}
                >
                  {note.content}
                </p>

                {/* Footer */}
                <div
                  style={{ fontSize: "0.75rem", color: "var(--text-light)" }}
                >
                  {timeAgo(note.created_at)}
                </div>

                {/* Actions */}
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    borderTop: "1px solid var(--border-light)",
                    paddingTop: "0.75rem",
                  }}
                >
                  <button
                    onClick={() => {
                      setSelected(note);
                      setDetailModal(true);
                    }}
                    style={{ ...actionBtn, flex: 2, color: "var(--primary)" }}
                  >
                    <FiEye size={13} /> View
                  </button>
                  <button
                    onClick={() => handleDownload(note)}
                    style={{ ...actionBtn, flex: 2, color: "var(--secondary)" }}
                  >
                    <FiDownload size={13} /> PDF
                  </button>
                  <button
                    onClick={() => openEdit(note)}
                    style={{ ...actionBtn, flex: 1, color: "var(--secondary)" }}
                  >
                    <FiEdit size={13} />
                  </button>
                  <button
                    onClick={() => {
                      setSelected(note);
                      setDeleteModal(true);
                    }}
                    style={{ ...actionBtn, flex: 1, color: "var(--danger)" }}
                  >
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create Modal ── */}
      <NoteFormModal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        title="New Note"
        form={form}
        setForm={setForm}
        errors={errors}
        saving={saving}
        onSubmit={handleCreate}
        submitLabel="Publish Note"
      />

      {/* ── Edit Modal ── */}
      <NoteFormModal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        title="Edit Note"
        form={form}
        setForm={setForm}
        errors={errors}
        saving={saving}
        onSubmit={handleEdit}
        submitLabel="Save Changes"
      />

      {/* ── Detail Modal ── */}
      <Modal
        isOpen={detailModal}
        onClose={() => setDetailModal(false)}
        title="Note Details"
        size="lg"
        footer={
          selected && (
            <Button
              variant="secondary"
              icon={<FiDownload size={15} />}
              onClick={() => {
                handleDownload(selected);
                setDetailModal(false);
              }}
            >
              Download PDF
            </Button>
          )
        }
      >
        {selected && (
          <div>
            <div
              style={{
                background: "var(--primary-ghost)",
                borderRadius: "var(--radius-md)",
                padding: "1.25rem",
                marginBottom: "1.5rem",
              }}
            >
              <h2
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 800,
                  color: "var(--primary)",
                  marginBottom: "0.5rem",
                }}
              >
                {selected.title}
              </h2>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                {selected.course && (
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--secondary)",
                      fontWeight: 700,
                    }}
                  >
                    📖 {selected.course}
                  </span>
                )}
                <span
                  style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}
                >
                  🗂 {selected.category}
                </span>
                <span
                  style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}
                >
                  📅 {formatDate(selected.created_at)}
                </span>
              </div>
            </div>
            <div
              style={{
                fontSize: "0.9rem",
                color: "var(--text-secondary)",
                lineHeight: 1.8,
                whiteSpace: "pre-wrap",
                background: "var(--bg)",
                padding: "1.25rem",
                borderRadius: "var(--radius-md)",
                maxHeight: 400,
                overflowY: "auto",
              }}
            >
              {selected.content}
            </div>
          </div>
        )}
      </Modal>

      {/* ── Delete Modal ── */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Note"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={saving} onClick={handleDelete}>
              Delete Note
            </Button>
          </>
        }
      >
        <div style={{ textAlign: "center", padding: "0.5rem 0" }}>
          <div
            style={{
              width: 56,
              height: 56,
              background: "var(--danger-bg)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
            }}
          >
            <FiTrash2 size={24} color="var(--danger)" />
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Delete note <strong>"{selected?.title}"</strong>? Students will lose
            access to this note.
          </p>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

function NoteFormModal({
  isOpen,
  onClose,
  title,
  form,
  setForm,
  errors,
  saving,
  onSubmit,
  submitLabel,
}) {
  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" loading={saving} onClick={onSubmit}>
            {submitLabel}
          </Button>
        </>
      }
    >
      <div className="form-group">
        <label className="form-label">Title *</label>
        <input
          className={`form-input ${errors.title ? "error" : ""}`}
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Note title"
        />
        {errors.title && <span className="form-error">{errors.title}</span>}
      </div>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
      >
        <div className="form-group">
          <label className="form-label">Course</label>
          <input
            className="form-input"
            name="course"
            value={form.course}
            onChange={handleChange}
            placeholder="e.g. Physics"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Category</label>
          <select
            className="form-select"
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Content *</label>
        <textarea
          className={`form-textarea ${errors.content ? "error" : ""}`}
          name="content"
          value={form.content}
          onChange={handleChange}
          placeholder="Write your note content here..."
          style={{ minHeight: 220 }}
        />
        {errors.content && <span className="form-error">{errors.content}</span>}
      </div>
    </Modal>
  );
}

const actionBtn = {
  background: "var(--bg)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  padding: "0.45rem 0.5rem",
  cursor: "pointer",
  fontSize: "0.78rem",
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  gap: "0.3rem",
  justifyContent: "center",
  transition: "var(--transition)",
  color: "var(--text-primary)",
};
