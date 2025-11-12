"use client"

import { useState } from "react"
import styles from "./App.module.css"
import AutoresTab from "./components/AutoresTab"
import EditorialesTab from "./components/EditorialesTab"
import LibrosTab from "./components/LibrosTab"

function App() {
  const [activeTab, setActiveTab] = useState("autores")
  const [loadingReport, setLoadingReport] = useState(false)
  const [reportMessage, setReportMessage] = useState("")

  const handleGenerateReport = async () => {
    setLoadingReport(true)
    setReportMessage("")

    try {
      const response = await fetch("http://localhost:5000/api/informe", {
        method: "GET",
      })

      if (!response.ok) throw new Error("Error al generar el informe")

      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      
      const link = document.createElement("a")
      link.href = url
      link.download = `informe_biblioteca_${new Date().toISOString().split("T")[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

     
      window.URL.revokeObjectURL(url)

      setReportMessage("✅ Informe generado exitosamente")
    } catch (error) {
      console.error("Error:", error)
      setReportMessage("❌ No se pudo generar el informe")
    } finally {
      setLoadingReport(false)
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <h1>Gestión de Biblioteca</h1>
            <p>Administra autores, editoriales y libros</p>
          </div>
          <button
            className={styles.reportButton}
            onClick={handleGenerateReport}
            disabled={loadingReport}
          >
            {loadingReport ? "Generando..." : "📄 Generar Informe"}
          </button>
        </div>
        {reportMessage && (
          <p className={styles.reportMessage}>{reportMessage}</p>
        )}
      </header>

      <nav className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${
            activeTab === "autores" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("autores")}
        >
          Autores
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "editoriales" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("editoriales")}
        >
          Editoriales
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "libros" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("libros")}
        >
          Libros
        </button>
      </nav>

      <main className={styles.content}>
        {activeTab === "autores" && <AutoresTab />}
        {activeTab === "editoriales" && <EditorialesTab />}
        {activeTab === "libros" && <LibrosTab />}
      </main>
    </div>
  )
}

export default App
