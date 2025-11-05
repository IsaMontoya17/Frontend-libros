"use client"

import { useState, useEffect } from "react"
import Swal from "sweetalert2"
import styles from "./Tab.module.css"

const API_URL = "http://localhost:5000/api"

export default function LibrosTab() {
  const [libros, setLibros] = useState([])
  const [autores, setAutores] = useState([])
  const [editoriales, setEditoriales] = useState([])
  const [formData, setFormData] = useState({
    titulo: "",
    categoria: "",
    anio: "",
    disponible: true,
    autor: "",
    editorial: "",
  })
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchLibros()
    fetchAutores()
    fetchEditoriales()
  }, [])

  const fetchLibros = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/libros`)
      const data = await response.json()
      setLibros(data)
    } catch {
      Swal.fire("Error", "No se pudieron cargar los libros", "error")
    } finally {
      setLoading(false)
    }
  }

  const fetchAutores = async () => {
    try {
      const response = await fetch(`${API_URL}/autores`)
      if (response.ok) setAutores(await response.json())
    } catch {
      Swal.fire("Error", "No se pudieron cargar los autores", "error")
    }
  }

  const fetchEditoriales = async () => {
    try {
      const response = await fetch(`${API_URL}/editoriales`)
      if (response.ok) setEditoriales(await response.json())
    } catch {
      Swal.fire("Error", "No se pudieron cargar las editoriales", "error")
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.titulo.trim()) {
      Swal.fire("Advertencia", "El título es obligatorio", "warning")
      return
    }

    try {
      setLoading(true)
      const url = editingId ? `${API_URL}/libros/${editingId}` : `${API_URL}/libros`
      const method = editingId ? "PUT" : "POST"
      const dataToSend = {
        ...formData,
        anio: formData.anio ? Number.parseInt(formData.anio) : undefined,
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      })

      if (!response.ok) throw new Error()

      Swal.fire({
        icon: "success",
        title: editingId ? "Libro actualizado" : "Libro agregado",
        showConfirmButton: false,
        timer: 1500,
      })

      setFormData({
        titulo: "",
        categoria: "",
        anio: "",
        disponible: true,
        autor: "",
        editorial: "",
      })
      setEditingId(null)
      fetchLibros()
    } catch {
      Swal.fire("Error", "No se pudo guardar el libro", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (libro) => {
    setFormData({
      titulo: libro.titulo,
      categoria: libro.categoria || "",
      anio: libro.anio || "",
      disponible: libro.disponible ?? true,
      autor: libro.autor?._id || "",
      editorial: libro.editorial?._id || "",
    })
    setEditingId(libro._id)
    Swal.fire("Modo edición", "Puedes editar el libro seleccionado", "info")
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar libro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    })

    if (!result.isConfirmed) return

    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/libros/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error()
      Swal.fire("Eliminado", "El libro fue eliminado con éxito", "success")
      fetchLibros()
    } catch {
      Swal.fire("Error", "No se pudo eliminar el libro", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      titulo: "",
      categoria: "",
      anio: "",
      disponible: true,
      autor: "",
      editorial: "",
    })
    setEditingId(null)
    Swal.fire("Cancelado", "Se canceló la edición del libro", "info")
  }

  const getAutorNombre = (id) => autores.find((a) => a._id === id)?.nombre || "Desconocido"
  const getEditorialNombre = (id) => editoriales.find((e) => e._id === id)?.nombre || "Desconocida"

  return (
    <div className={styles.tabContent}>
      <div className={styles.formSection}>
        <h2>{editingId ? "Editar Libro" : "Agregar Nuevo Libro"}</h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="titulo">Título *</label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              placeholder="Título del libro"
              disabled={loading}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="categoria">Categoría</label>
              <input
                type="text"
                id="categoria"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                placeholder="Categoría"
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="anio">Año</label>
              <input
                type="number"
                id="anio"
                name="anio"
                value={formData.anio}
                onChange={handleChange}
                placeholder="Año de publicación"
                disabled={loading}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="autor">Autor</label>
              <select id="autor" name="autor" value={formData.autor} onChange={handleChange} disabled={loading}>
                <option value="">Seleccionar autor...</option>
                {autores.map((autor) => (
                  <option key={autor._id} value={autor._id}>
                    {autor.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="editorial">Editorial</label>
              <select
                id="editorial"
                name="editorial"
                value={formData.editorial}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Seleccionar editorial...</option>
                {editoriales.map((editorial) => (
                  <option key={editorial._id} value={editorial._id}>
                    {editorial.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.checkboxContainer}>
              <input
                type="checkbox"
                id="disponible"
                name="disponible"
                checked={formData.disponible}
                onChange={handleChange}
                disabled={loading}
              />
              <label htmlFor="disponible">Disponible</label>
            </div>
          </div>

          <div className={styles.formButtons}>
            <button type="submit" disabled={loading}>
              {loading ? "Guardando..." : editingId ? "Actualizar" : "Agregar"}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancel} className={styles.cancelBtn}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className={styles.listSection}>
        <h2>Lista de Libros</h2>
        {loading && !libros.length ? (
          <p className={styles.loading}>Cargando...</p>
        ) : libros.length === 0 ? (
          <p className={styles.empty}>No hay libros registrados</p>
        ) : (
          <div className={styles.list}>
            {libros.map((libro) => (
              <div key={libro._id} className={styles.item}>
                <div className={styles.itemContent}>
                  <h3>{libro.titulo}</h3>
                  {libro.categoria && <p><strong>Categoría:</strong> {libro.categoria}</p>}
                  {libro.anio && <p><strong>Año:</strong> {libro.anio}</p>}
                  {libro.autor && <p><strong>Autor:</strong> {getAutorNombre(libro.autor)}</p>}
                  {libro.editorial && <p><strong>Editorial:</strong> {getEditorialNombre(libro.editorial)}</p>}
                  <p><strong>Disponible:</strong> {libro.disponible ? "Sí" : "No"}</p>
                </div>
                <div className={styles.itemActions}>
                  <button onClick={() => handleEdit(libro)} className={styles.editBtn} disabled={loading}>
                    Editar
                  </button>
                  <button onClick={() => handleDelete(libro._id)} className={styles.deleteBtn} disabled={loading}>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
