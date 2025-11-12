"use client"

import { useState, useEffect } from "react"
import Swal from "sweetalert2"
import styles from "./Tab.module.css"

const API_URL = `${import.meta.env.VITE_API_URL}/api`

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
  const [filters, setFilters] = useState({
    titulo: "",
    categoria: "",
    disponible: "todos",
  })
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [filteredLibros, setFilteredLibros] = useState([])

  useEffect(() => {
    fetchLibros()
    fetchAutores()
    fetchEditoriales()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters])

  const fetchLibros = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/libros`)
      if (!response.ok) throw new Error("Error al cargar libros")
      const data = await response.json()
      setLibros(data)
      setFilteredLibros(data)
      setError("")
    } catch (err) {
      setError(err.message)
      Swal.fire("Error", err.message, "error")
    } finally {
      setLoading(false)
    }
  }

  const fetchAutores = async () => {
    try {
      const response = await fetch(`${API_URL}/autores`)
      if (response.ok) setAutores(await response.json())
    } catch (err) {
      console.error("Error cargando autores:", err)
    }
  }

  const fetchEditoriales = async () => {
    try {
      const response = await fetch(`${API_URL}/editoriales`)
      if (response.ok) setEditoriales(await response.json())
    } catch (err) {
      console.error("Error cargando editoriales:", err)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const applyFilters = async () => {
    try {
      const noFilters = !filters.titulo.trim() && !filters.categoria.trim() && filters.disponible === "todos"

      if (noFilters) {
        setFilteredLibros(libros)
        return
      }

      const resultsSets = []

      if (filters.titulo.trim()) {
        const resp = await fetch(`${API_URL}/libros/buscar/titulo/${encodeURIComponent(filters.titulo)}`)
        if (!resp.ok) throw new Error("Error buscando por título")
        resultsSets.push(await resp.json())
      }

      if (filters.categoria.trim()) {
        const resp = await fetch(`${API_URL}/libros/buscar/categoria/${encodeURIComponent(filters.categoria)}`)
        if (!resp.ok) throw new Error("Error buscando por categoría")
        resultsSets.push(await resp.json())
      }

      if (filters.disponible !== "todos") {
        const disponibilidad = filters.disponible === "disponible" ? "true" : "false"
        const resp = await fetch(`${API_URL}/libros/buscar/disponible/${disponibilidad}`)
        if (!resp.ok) throw new Error("Error buscando por disponibilidad")
        resultsSets.push(await resp.json())
      }

      if (resultsSets.length === 0) {
        setFilteredLibros(libros)
        return
      }

      let intersection = resultsSets[0] || []
      for (let i = 1; i < resultsSets.length; i++) {
        const current = resultsSets[i] || []
        const ids = new Set(current.map((x) => String(x._id)))
        intersection = intersection.filter((item) => ids.has(String(item._id)))
      }

      setFilteredLibros(intersection)
    } catch (err) {
      console.error("Error aplicando filtros:", err)
      setFilteredLibros([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.titulo.trim()) {
      Swal.fire("Campo requerido", "El título del libro es obligatorio", "warning")
      return
    }

    try {
      setLoading(true)
      const url = editingId ? `${API_URL}/libros/${editingId}` : `${API_URL}/libros`
      const method = editingId ? "PUT" : "POST"

      const dataToSend = {
        ...formData,
        autor: formData.autor || undefined,
        editorial: formData.editorial || undefined,
        anio: formData.anio ? Number.parseInt(formData.anio) : undefined,
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      })

      if (!response.ok) throw new Error("Error en la operación")

      setFormData({
        titulo: "",
        categoria: "",
        anio: "",
        disponible: true,
        autor: "",
        editorial: "",
      })
      setEditingId(null)
      setError("")
      fetchLibros()

      Swal.fire({
        icon: "success",
        title: editingId ? "Libro actualizado" : "Libro agregado",
        text: editingId ? "El libro fue actualizado correctamente." : "El libro fue agregado correctamente.",
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
    Swal.fire({
      icon: "info",
      title: "Editando libro",
      text: `Estás editando "${libro.titulo}".`,
      timer: 1500,
      showConfirmButton: false,
    })
  }

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar libro?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    })

    if (!confirm.isConfirmed) return

    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/libros/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Error al eliminar libro")
      fetchLibros()
      Swal.fire("Eliminado", "El libro fue eliminado correctamente", "success")
    } catch (err) {
      Swal.fire("Error", err.message, "error")
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
    Swal.fire({
      icon: "info",
      title: "Edición cancelada",
      text: "No se realizaron cambios.",
      timer: 1500,
      showConfirmButton: false,
    })
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
                className={styles.checkboxInput}
              />
              <label htmlFor="disponible" className={styles.checkboxLabel}>
                Disponible
              </label>
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

        <div className={styles.filterSection}>
          <div className={styles.filterGroup}>
            <label htmlFor="filterTitulo">Buscar por título:</label>
            <input
              type="text"
              id="filterTitulo"
              name="titulo"
              value={filters.titulo}
              onChange={handleFilterChange}
              placeholder="Nombre del libro..."
            />
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="filterCategoria">Categoría:</label>
            <input
              type="text"
              id="filterCategoria"
              name="categoria"
              value={filters.categoria}
              onChange={handleFilterChange}
              placeholder="Filtrar por categoría..."
            />
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="filterDisponible">Disponibilidad:</label>
            <select id="filterDisponible" name="disponible" value={filters.disponible} onChange={handleFilterChange}>
              <option value="todos">Todos</option>
              <option value="disponible">Solo disponibles</option>
              <option value="no-disponible">Solo no disponibles</option>
            </select>
          </div>
        </div>

        {loading && !libros.length ? (
          <p className={styles.loading}>Cargando...</p>
        ) : filteredLibros.length === 0 ? (
          <p className={styles.empty}>No hay libros que coincidan con los filtros</p>
        ) : (
          <div className={styles.list}>
            <p className={styles.resultCount}>
              Mostrando {filteredLibros.length} de {libros.length} libros
            </p>
            {filteredLibros.map((libro) => (
              <div key={libro._id} className={styles.item}>
                <div className={styles.itemContent}>
                  <h3>{libro.titulo}</h3>
                  {libro.categoria && (
                    <p>
                      <strong>Categoría:</strong> {libro.categoria}
                    </p>
                  )}
                  {libro.anio && (
                    <p>
                      <strong>Año:</strong> {libro.anio}
                    </p>
                  )}
                  {libro.autor && (
                    <p>
                      <strong>Autor:</strong> {getAutorNombre(libro.autor)}
                    </p>
                  )}
                  {libro.editorial && (
                    <p>
                      <strong>Editorial:</strong> {getEditorialNombre(libro.editorial)}
                    </p>
                  )}
                  <p>
                    <strong>Disponible:</strong> {libro.disponible ? "Sí" : "No"}
                  </p>
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
