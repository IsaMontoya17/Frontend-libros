"use client"

import { useState, useEffect } from "react"
import Swal from "sweetalert2"
import styles from "./Tab.module.css"

const API_URL = "http://localhost:5000/api"

export default function AutoresTab() {
  const [autores, setAutores] = useState([])
  const [formData, setFormData] = useState({
    nombre: "",
    nacionalidad: "",
    fechaNacimiento: "",
  })
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchAutores()
  }, [])

  const fetchAutores = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/autores`)
      if (!response.ok) throw new Error("Error al cargar autores")
      const data = await response.json()
      setAutores(data)
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
      Swal.fire("Campo requerido", "El nombre del autor es obligatorio", "warning")
      return
    }

    try {
      setLoading(true)
      const url = editingId ? `${API_URL}/autores/${editingId}` : `${API_URL}/autores`
      const method = editingId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Error en la operación")

      setFormData({ nombre: "", nacionalidad: "", fechaNacimiento: "" })
      setEditingId(null)
      setError("")
      fetchAutores()

      Swal.fire({
        icon: "success",
        title: editingId ? "Autor actualizado" : "Autor agregado",
        text: editingId
          ? "El autor fue actualizado correctamente."
          : "El autor fue agregado exitosamente.",
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

  const handleEdit = (autor) => {
    setFormData({
      nombre: autor.nombre,
      nacionalidad: autor.nacionalidad || "",
      fechaNacimiento: autor.fechaNacimiento ? autor.fechaNacimiento.split("T")[0] : "",
    })
    setEditingId(autor._id)
    Swal.fire({
      icon: "info",
      title: "Editando autor",
      text: `Estás editando a "${autor.nombre}".`,
      timer: 2000,
      showConfirmButton: false,
    })
  }

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar autor?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    })

    if (!confirm.isConfirmed) return

    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/autores/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Error al eliminar autor")
      setError("")
      fetchAutores()
      Swal.fire("Eliminado", "El autor fue eliminado correctamente", "success")
    } catch (err) {
      setError(err.message)
      Swal.fire("Error", err.message, "error")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({ nombre: "", nacionalidad: "", fechaNacimiento: "" })
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
        <h2>{editingId ? "Editar Autor" : "Agregar Nuevo Autor"}</h2>
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
              placeholder="Nombre del autor"
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="nacionalidad">Nacionalidad</label>
            <input
              type="text"
              id="nacionalidad"
              name="nacionalidad"
              value={formData.nacionalidad}
              onChange={handleChange}
              placeholder="Nacionalidad"
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="fechaNacimiento">Fecha de Nacimiento</label>
            <input
              type="date"
              id="fechaNacimiento"
              name="fechaNacimiento"
              value={formData.fechaNacimiento}
              onChange={handleChange}
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
        <h2>Lista de Autores</h2>
        {loading && !autores.length ? (
          <p className={styles.loading}>Cargando...</p>
        ) : autores.length === 0 ? (
          <p className={styles.empty}>No hay autores registrados</p>
        ) : (
          <div className={styles.list}>
            {autores.map((autor) => (
              <div key={autor._id} className={styles.item}>
                <div className={styles.itemContent}>
                  <h3>{autor.nombre}</h3>
                  {autor.nacionalidad && (
                    <p>
                      <strong>Nacionalidad:</strong> {autor.nacionalidad}
                    </p>
                  )}
                  {autor.fechaNacimiento && (
                    <p>
                      <strong>Fecha de Nacimiento:</strong>{" "}
                      {new Date(autor.fechaNacimiento).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className={styles.itemActions}>
                  <button onClick={() => handleEdit(autor)} className={styles.editBtn} disabled={loading}>
                    Editar
                  </button>
                  <button onClick={() => handleDelete(autor._id)} className={styles.deleteBtn} disabled={loading}>
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
