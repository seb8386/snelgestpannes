"use client";

import { useState } from "react";
import Link from "next/link";

export function AbonneDashboard() {
  const [reclamations] = useState([
    { id: "REC-001", sujet: "Coupure de courant", statut: "En cours", date: "23/06/2026" },
    { id: "REC-002", sujet: "Facture erronée", statut: "Résolu", date: "15/05/2026" },
  ]);

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "sans-serif", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* --- HEADER --- */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px", marginBottom: "32px" }}>
          <div style={{ flex: "1", minWidth: "280px" }}>
            <p style={{ textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "12px", fontWeight: "bold", color: "#3b82f6", margin: "0 0 8px 0" }}>
              ⚡ SNEL &middot; Abonné
            </p>
            <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: "0 0 6px 0", letterSpacing: "-0.02em" }}>
              Mon espace abonné
            </h1>
            <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
              Suivez vos réclamations et l’état d’avancement de vos demandes en temps réel.
            </p>
          </div>
          
          {/* TON BOUTON D'ORIGINE */}
          <Link 
            href="/dashboard/abonne/reclamation"
            style={{
              display: "inline-block",
              backgroundColor: "#3b82f6",
              color: "#ffffff",
              padding: "12px 24px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: "600",
              textDecoration: "none",
              boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.2)",
              transition: "background 0.2s"
            }}
          >
            + Nouvelle réclamation
          </Link>
        </header>

        {/* --- COMPTEURS / STATS --- */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "40px" }}>
          <div style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <p style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", margin: "0 0 12px 0" }}>Demandes ouvertes</p>
            <p style={{ fontSize: "32px", fontWeight: "700", color: "#3b82f6", margin: 0 }}>1</p>
          </div>
          <div style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <p style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", margin: "0 0 12px 0" }}>Demandes résolues</p>
            <p style={{ fontSize: "32px", fontWeight: "700", color: "#0f172a", margin: 0 }}>52</p>
          </div>
          <div style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <p style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", margin: "0 0 12px 0" }}>Satisfaction</p>
            <p style={{ fontSize: "32px", fontWeight: "700", color: "#10b981", margin: 0 }}>97%</p>
          </div>
        </div>

        {/* --- SECTION HISTORIQUE --- */}
        <section style={{ backgroundColor: "#ffffff", borderRadius: "20px", border: "1px solid #e2e8f0", padding: "32px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: "0 0 6px 0" }}>
            Historique des réclamations
          </h3>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 24px 0" }}>
            Consultez vos demandes et suivez leur statut à chaque étape.
          </p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {reclamations.length > 0 ? (
              reclamations.map((item) => (
                <div 
                  key={item.id} 
                  style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    padding: "16px 20px", 
                    backgroundColor: "#f8fafc", 
                    borderRadius: "12px",
                    border: "1px solid #f1f5f9"
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b", margin: "0 0 4px 0" }}>{item.sujet}</h4>
                    <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0, fontFamily: "monospace" }}>{item.date} &middot; {item.id}</p>
                  </div>
                  <span 
                    style={{ 
                      fontSize: "11px", 
                      fontWeight: "700", 
                      textTransform: "uppercase",
                      padding: "4px 10px", 
                      borderRadius: "6px",
                      backgroundColor: item.statut === "En cours" ? "#eff6ff" : "#ecfdf5",
                      color: item.statut === "En cours" ? "#2563eb" : "#059669",
                      border: item.statut === "En cours" ? "1px solid #dbeafe" : "1px solid #d1fae5"
                    }}
                  >
                    {item.statut}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: "13px", color: "#94a3b8", fontStyle: "italic", textAlign: "center", padding: "24px 0" }}>
                Aucune réclamation enregistrée pour le moment.
              </p>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}