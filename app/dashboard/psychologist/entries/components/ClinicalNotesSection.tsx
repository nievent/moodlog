// app/dashboard/psychologist/entries/components/ClinicalNotesSection.tsx
'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { createClinicalNote, updateClinicalNote, deleteClinicalNote, getClinicalNotes } from '@/app/actions/clinicalNotes';

interface ClinicalNote {
  id: string;
  note: string;
  created_at: string;
  updated_at: string;
}

interface Props {
  entryId: string;
}

export default function ClinicalNotesSection({ entryId }: Props) {
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');
  const [editNote, setEditNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Cargar notas al montar - Forma correcta con useEffect
  useEffect(() => {
    let cancelled = false;
    
    const fetchNotes = async () => {
      setIsLoading(true);
      const result = await getClinicalNotes(entryId);
      
      if (!cancelled && result.notes) {
        setNotes(result.notes);
        setIsLoading(false);
      }
    };

    fetchNotes();

    return () => {
      cancelled = true;
    };
  }, [entryId]);

  // Función helper para recargar notas (usada después de crear/editar/eliminar)
  const refreshNotes = async () => {
    const result = await getClinicalNotes(entryId);
    if (result.notes) {
      setNotes(result.notes);
    }
  };

  const handleCreate = async () => {
    if (!newNote.trim()) return;

    setIsSaving(true);
    const result = await createClinicalNote({
      entryId,
      note: newNote,
    });

    if (result.success) {
      setNewNote('');
      setIsAdding(false);
      await refreshNotes();
    } else {
      alert(result.error || 'Error al crear la nota');
    }
    setIsSaving(false);
  };

  const handleUpdate = async (noteId: string) => {
    if (!editNote.trim()) return;

    setIsSaving(true);
    const result = await updateClinicalNote(noteId, editNote);

    if (result.success) {
      setEditingId(null);
      setEditNote('');
      await refreshNotes();
    } else {
      alert(result.error || 'Error al actualizar la nota');
    }
    setIsSaving(false);
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta nota?')) return;

    const result = await deleteClinicalNote(noteId);

    if (result.success) {
      await refreshNotes();
    } else {
      alert(result.error || 'Error al eliminar la nota');
    }
  };

  const startEdit = (note: ClinicalNote) => {
    setEditingId(note.id);
    setEditNote(note.note);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditNote('');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-teal-600" />
          <h3 className="font-semibold text-gray-900">Notas Clínicas</h3>
          <span className="text-sm text-gray-500">({notes.length})</span>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            <Plus size={16} />
            Nueva Nota
          </button>
        )}
      </div>

      {/* Formulario nueva nota */}
      {isAdding && (
        <div className="bg-teal-50 border-2 border-teal-200 rounded-lg p-4">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Escribe tu nota clínica aquí..."
            rows={4}
            className="w-full px-3 py-2 border border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none"
            autoFocus
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleCreate}
              disabled={isSaving || !newNote.trim()}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
            >
              <Save size={16} />
              {isSaving ? 'Guardando...' : 'Guardar Nota'}
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewNote('');
              }}
              disabled={isSaving}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de notas */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">
          Cargando notas...
        </div>
      ) : notes.length > 0 ? (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              {editingId === note.id ? (
                // Modo edición
                <>
                  <textarea
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none mb-3"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(note.id)}
                      disabled={isSaving || !editNote.trim()}
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50"
                    >
                      <Save size={14} />
                      Guardar
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <X size={14} />
                      Cancelar
                    </button>
                  </div>
                </>
              ) : (
                // Modo lectura
                <>
                  <p className="text-gray-800 whitespace-pre-wrap mb-3">{note.note}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {note.updated_at !== note.created_at && (
                        <span>Editada • </span>
                      )}
                      {new Date(note.created_at).toLocaleString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(note)}
                        className="p-1.5 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No hay notas clínicas para esta entrada</p>
          <p className="text-sm text-gray-500 mt-1">
            Añade notas privadas para tu seguimiento
          </p>
        </div>
      )}
    </div>
  );
}