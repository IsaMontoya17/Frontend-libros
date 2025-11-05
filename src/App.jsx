"use client"

import { useState } from "react"
import styles from "./App.module.css"
import AutoresTab from "./components/AutoresTab"
import EditorialesTab from "./components/EditorialesTab"
import LibrosTab from "./components/LibrosTab"

function App() {
  const [activeTab, setActiveTab] = useState("autores")

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Gestión de Biblioteca</h1>
        <p>Administra autores, editoriales y libros</p>
      </header>

      <nav className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${activeTab === "autores" ? styles.active : ""}`}
          onClick={() => setActiveTab("autores")}
        >
          Autores
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === "editoriales" ? styles.active : ""}`}
          onClick={() => setActiveTab("editoriales")}
        >
          Editoriales
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === "libros" ? styles.active : ""}`}
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
