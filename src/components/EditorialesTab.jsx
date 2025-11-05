"use client"

import { useState, useEffect } from "react"
import Swal from "sweetalert2"
import styles from "./Tab.module.css"

const API_URL = "http://localhost:5000/api"

export default function EditorialesTab() {
  const [editoriales, setEditoriales] = useState([])
  const [formData, setFormData] = useState({
    nombre: "",
    pais: "",
    anioFundacion: "",
  })
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchEditoriales()
  }, [])

  const fetchEditoriales = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/editoriales`)
      if (!response.ok) throw new Error("Error al cargar editoriales")
      const data = await response.json()
      setEditoriales(data)
      setError("")
    } catch (err) {
      setError(err.message)
      Swal.fire("Error", err.message, "error")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.nombre.trim()) {
      Swal.fire("Campo requerido", "El nombre de la editorial es obligatorio", "warning")
      return
    }

    try {
      setLoading(true)
      const url = editingId ? `${API_URL}/editoriales/${editingId}` : `${API_URL}/editoriales`
      const method = editingId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Error en la operación")

      setFormData({ nombre: "", pais: "", anioFundacion: "" })
      setEditingId(null)
      setError("")
      fetchEditoriales()

      Swal.fire({
        icon: "success",
        title: editingId ? "Editorial actualizada" : "Editorial agregada",
        text: editingId
          ? "La editorial se actualizó correctamente."
          : "La editorial se agregó correctamente.",
        timer: 2000,
        showConfirmButton: false,
      })
    } catch (err) {
      setError(err.message)
      Swal.fire("Error", err.message, "error")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (editorial) => {
    setFormData({
      nombre: editorial.nombre,
      pais: editorial.pais || "",
      anioFundacion: editorial.anioFundacion || "",
    })
    setEditingId(editorial._id)
    Swal.fire({
      title: "Editando editorial",
      text: `Estás editando "${editorial.nombre}".`,
      icon: "info",
      timer: 2000,
      showConfirmButton: false,
    })
  }

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar editorial?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    })

    if (!confirm.isConfirmed) return

    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/editoriales/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Error al eliminar")
      setError("")
      fetchEditoriales()
      Swal.fire("Eliminada", "La editorial fue eliminada correctamente", "success")
    } catch (err) {
      setError(err.message)
      Swal.fire("Error", err.message, "error")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({ nombre: "", pais: "", anioFundacion: "" })
    setEditingId(null)
    Swal.fire({
      icon: "info",
      title: "Edición cancelada",
      text: "No se realizaron cambios.",
      timer: 1500,
      showConfirmButton: false,
    })
  }

  return (
    <div className={styles.tabContent}>
      <div className={styles.formSection}>
        <h2>{editingId ? "Editar Editorial" : "Agregar Nueva Editorial"}</h2>
        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="nombre">Nombre *</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Nombre de la editorial"
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="pais">País</label>
            <input
              type="text"
              id="pais"
              name="pais"
              value={formData.pais}
              onChange={handleChange}
              placeholder="País"
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="anioFundacion">Año de Fundación</label>
            <input
              type="number"
              id="anioFundacion"
              name="anioFundacion"
              value={formData.anioFundacion}
              onChange={handleChange}
              placeholder="Año"
              disabled={loading}
            />
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
        <h2>Lista de Editoriales</h2>
        {loading && !editoriales.length ? (
          <p className={styles.loading}>Cargando...</p>
        ) : editoriales.length === 0 ? (
          <p className={styles.empty}>No hay editoriales registradas</p>
        ) : (
          <div className={styles.list}>
            {editoriales.map((editorial) => (
              <div key={editorial._id} className={styles.item}>
                <div className={styles.itemContent}>
                  <h3>{editorial.nombre}</h3>
                  {editorial.pais && (
                    <p>
                      <strong>País:</strong> {editorial.pais}
                    </p>
                  )}
                  {editorial.anioFundacion && (
                    <p>
                      <strong>Año de Fundación:</strong> {editorial.anioFundacion}
                    </p>
                  )}
                </div>
                <div className={styles.itemActions}>
                  <button onClick={() => handleEdit(editorial)} className={styles.editBtn} disabled={loading}>
                    Editar
                  </button>
                  <button onClick={() => handleDelete(editorial._id)} className={styles.deleteBtn} disabled={loading}>
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
