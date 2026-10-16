"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface LoginPageProps {
  initialMode?: "login" | "register";
}

export function LoginPage({ initialMode = "login" }: LoginPageProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const resetMessages = () => {
    setError("");
    setSuccess("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    resetMessages();

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, motDePasse }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Identifiants invalides.");
        setLoading(false);
        return;
      }

      router.push(data.user.redirectTo || "/dashboard");
    } catch (err) {
      setError("Erreur de connexion au serveur.");
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    resetMessages();

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, email, motDePasse }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Impossible de créer le compte.");
        setLoading(false);
        return;
      }

      setSuccess("Compte créé avec succès. Connectez-vous pour continuer.");
      setMode("login");
      setMotDePasse("");
      setLoading(false);
    } catch (err) {
      setError("Erreur serveur lors de l'inscription.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8f9fa] flex items-center justify-center p-3 sm:p-4 antialiased">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[600px]">
        
        {/* --- SECTION GAUCHE : IDENTITÉ ET AVANTAGES --- */}
        <section
          className="relative bg-[#003da5] text-white p-6 sm:p-8 flex flex-col justify-between overflow-hidden"
          style={{ backgroundImage: "radial-gradient(circle at 15% 15%, rgba(255,255,255,0.08), transparent 45%), linear-gradient(160deg, #003da5 0%, #00286e 100%)" }}
        >
          {/* Logo et Titre Principal */}
          <div className="flex flex-col items-center text-center mt-4 sm:mt-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-yellow-400 bg-[#00286e] flex items-center justify-center p-2 shadow-lg mb-4">
              <svg viewBox="0 0 100 100" className="w-full h-full text-white">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#facc15" strokeWidth="2"/>
                <path d="M55 10 L25 55 L50 55 L40 90 L75 40 L50 40 Z" fill="#ef4444" />
                <text x="50%" y="45%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">SNEL</text>
              </svg>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-wide uppercase">SNEL – CVS KITAMBO</h1>
            <p className="text-xs text-blue-200 mt-1 max-w-xs leading-relaxed">
              Système de gestion des réclamations clients avec agent intelligent
            </p>
            <div className="w-12 h-[2px] bg-yellow-400 mt-4"></div>
          </div>

          {/* Liste des fonctionnalités */}
          <div className="my-6 sm:my-8 space-y-4 sm:space-y-5 max-w-sm mx-auto w-full px-2 sm:px-4">
            <p className="text-sm font-medium text-yellow-400">Une plateforme intelligente pour :</p>
            
            <div className="flex items-start gap-3 text-sm">
              <span className="p-1.5 bg-white/10 rounded-md flex-shrink-0">⚡</span>
              <p>Déclarer vos pannes en ligne</p>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <span className="p-1.5 bg-white/10 rounded-md flex-shrink-0">📋</span>
              <p>Suivre vos réclamations en temps réel</p>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <span className="p-1.5 bg-white/10 rounded-md flex-shrink-0">🛠️</span>
              <p>Assurer des interventions rapides</p>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <span className="p-1.5 bg-white/10 rounded-md flex-shrink-0">⚙️</span>
              <p>Améliorer la qualité du service</p>
            </div>
          </div>

          {/* Slogan de bas de page */}
          <div className="text-center text-xs text-blue-200/80 font-light pb-2 pt-4 md:pt-0 border-t border-white/10 md:border-none">
            L'énergie au service du développement
          </div>
        </section>

        {/* --- SECTION DROITE : FORMULAIRE DE CONNEXION / INSCRIPTION --- */}
        <section className="p-6 sm:p-8 lg:p-12 flex flex-col justify-center bg-white">
          <div className="w-full max-w-md mx-auto">
            
            {/* Icône Verrou & Titre Principal */}
            <div className="flex flex-col items-center mb-6 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#003da5] mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                {mode === "login" ? "Connexion" : "Inscription"}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {mode === "login" ? "Veuillez vous connecter pour accéder à votre compte" : "Créez votre compte abonné pour déclarer vos pannes"}
              </p>
            </div>

            {/* Alertes d'état */}
            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs">{error}</div>}
            {success && <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-lg text-xs">{success}</div>}

            {/* Formulaire */}
            <form onSubmit={mode === "login" ? handleLogin : handleRegister} className="space-y-4">

              {mode === "register" && (
                <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 text-blue-800 text-xs rounded-xl p-3">
                  <span className="text-base leading-none">👤</span>
                  <p>
                    L&apos;inscription en ligne crée un compte <strong>abonné</strong>. Les comptes du
                    personnel SNEL (administrateur, chef de dépannage, technicien GET) sont créés par un
                    administrateur depuis la gestion des utilisateurs.
                  </p>
                </div>
              )}

              {mode === "register" && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Nom complet</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 text-sm">👤</span>
                    <input
                      type="text"
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      required
                      placeholder="Entrez votre nom complet"
                      className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#003da5] focus:ring-1 focus:ring-[#003da5]/20 text-gray-800"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Adresse e-mail</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Entrez votre adresse e-mail"
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#003da5] focus:ring-1 focus:ring-[#003da5]/20 text-gray-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Mot de passe</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </span>
                  <input
                    type="password"
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    required
                    placeholder="Entrez votre mot de passe"
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#003da5] focus:ring-1 focus:ring-[#003da5]/20 text-gray-800"
                  />
                </div>
              </div>

              {/* Options secondaires */}
              {mode === "login" && (
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-gray-500 cursor-pointer select-none">
                    <input type="checkbox" className="rounded border-gray-300 text-[#003da5] focus:ring-0" />
                    Se souvenir de moi
                  </label>
                  <button type="button" className="text-[#003da5] hover:underline font-medium">
                    Mot de passe oublié ?
                  </button>
                </div>
              )}

              {/* Bouton Principal d'action */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-[#003da5] hover:bg-blue-800 text-white py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition disabled:opacity-70 shadow-md shadow-blue-900/10"
              >
                {loading ? (
                  <span>Traitement...</span>
                ) : mode === "login" ? (
                  <>
                    <span>➔</span> Se connecter
                  </>
                ) : (
                  <>Créer le compte</>
                )}
              </button>
            </form>

            {/* Séparateur alternatif */}
            <div className="relative my-6 text-center">
              <hr className="border-gray-200" />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-gray-400 font-light">ou</span>
            </div>

            {/* Bouton de bascule Mode Connexion / Inscription */}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                resetMessages();
              }}
              className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2"
            >
              {mode === "login" ? (
                <>
                  <span>👤+</span> Créer un compte
                </>
              ) : (
                <>Retour à la connexion</>
              )}
            </button>

            {/* Copyright de bas de page */}
            <p className="text-[11px] text-gray-400 text-center mt-8">
              © 2025 SNEL – CVS Kintambo. Tous droits réservés.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}